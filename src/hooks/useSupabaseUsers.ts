import { useCallback, useEffect, useMemo, useState } from "react";
import { hasSupabaseAdmin, hasSupabaseConfig, supabase, supabaseAdmin } from "../supabaseClient";
import type { MutationResult } from "./useSupabaseData";

export type UserProfile = {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  password?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type UpsertUserProfileInput = Omit<UserProfile, "id"> & { id?: string };

type DbUserProfile = {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  role?: string | null;
  created_at: string;
  updated_at: string;
};

const mockUsers: UserProfile[] = [
  {
    id: "1",
    userId: null,
    name: "Ana Souza",
    email: "ana@logica.com",
    password: "senha123"
  },
  {
    id: "2",
    userId: null,
    name: "Bruno Lima",
    email: "bruno@logica.com",
    password: "senha123"
  },
  {
    id: "3",
    userId: null,
    name: "Carla Dias",
    email: "carla@logica.com",
    password: "senha123"
  }
];

const hasClient = hasSupabaseConfig && Boolean(supabase);

const ensureId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const sortUsers = (items: UserProfile[]) =>
  [...items].sort((a, b) => a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }));

const mapUserFromDb = (record: DbUserProfile): UserProfile => ({
  id: record.id,
  userId: record.user_id,
  name: record.name,
  email: record.email,
  password: null,
  createdAt: record.created_at,
  updatedAt: record.updated_at
});

const mapUserToDb = (input: UpsertUserProfileInput): Record<string, unknown> => {
  const payload: Record<string, unknown> = {
    id: input.id,
    user_id: input.userId,
    name: input.name,
    email: input.email
  };

  if (!payload.id) {
    delete payload.id;
  }

  if (!payload.user_id) {
    delete payload.user_id;
  }

  return payload;
};

export type SupabaseUsersState = {
  users: UserProfile[];
  loading: boolean;
  error: string | null;
  isUsingSupabase: boolean;
  canManagePasswords: boolean;
  refresh: () => Promise<void>;
  saveUser: (input: UpsertUserProfileInput) => Promise<MutationResult<UserProfile>>;
  deleteUser: (profile: UserProfile) => Promise<MutationResult<null>>;
};

export function useSupabaseUsers(): SupabaseUsersState {
  const [users, setUsers] = useState<UserProfile[]>(hasClient ? [] : sortUsers(mockUsers));
  const [loading, setLoading] = useState<boolean>(hasClient);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!hasClient || !supabase) {
      setError(null);
      setLoading(false);
      setUsers(sortUsers(mockUsers));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("user_profiles")
        .select("*")
        .order("name", { ascending: true });

      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      setUsers(sortUsers(((data as DbUserProfile[]) ?? []).map(mapUserFromDb)));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const saveUser = useCallback(
    async (input: UpsertUserProfileInput): Promise<MutationResult<UserProfile>> => {
      const normalizedName = input.name.trim();
      const normalizedEmail = input.email.trim().toLowerCase();
      const normalizedPassword =
        input.password === undefined
          ? undefined
          : input.password === null
          ? null
          : input.password.trim();

      if (!normalizedName || !normalizedEmail) {
        return { success: false, error: "Nome e e-mail são obrigatórios." };
      }

      if (!input.id && (!normalizedPassword || normalizedPassword.length < 6)) {
        return { success: false, error: "Defina uma senha com pelo menos 6 caracteres." };
      }

      const sanitizedInput: UpsertUserProfileInput = {
        ...input,
        name: normalizedName,
        email: normalizedEmail,
        password: normalizedPassword
      };

      if (hasClient && supabase && !hasSupabaseAdmin) {
        if (!sanitizedInput.id) {
          return {
            success: false,
            error: "Configure a chave service role do Supabase para cadastrar usuários com senha."
          };
        }

        if (sanitizedInput.password) {
          return {
            success: false,
            error: "Configure a chave service role do Supabase para atualizar a senha do usuário."
          };
        }
      }

      const ensureUserId = async () => {
        if (!hasSupabaseAdmin || !supabaseAdmin) {
          return sanitizedInput.userId ?? null;
        }

        if (sanitizedInput.userId) {
          const payload: {
            email?: string;
            password?: string;
            user_metadata?: Record<string, unknown>;
          } = {
            email: sanitizedInput.email,
            user_metadata: { name: sanitizedInput.name }
          };

          if (sanitizedInput.password) {
            payload.password = sanitizedInput.password;
          }

          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            sanitizedInput.userId,
            payload
          );

          if (updateError) {
            throw new Error(updateError.message);
          }

          return sanitizedInput.userId;
        }

        if (!sanitizedInput.password) {
          return null;
        }

        const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: sanitizedInput.email,
          password: sanitizedInput.password,
          email_confirm: true,
          user_metadata: { name: sanitizedInput.name }
        });

        if (createError) {
          throw new Error(createError.message);
        }

        return data.user?.id ?? null;
      };

      try {
        const previous = sanitizedInput.id ? users.find((user) => user.id === sanitizedInput.id) : undefined;
        const resolvedPassword =
          sanitizedInput.password !== undefined ? sanitizedInput.password ?? null : previous?.password ?? null;
        const userId = await ensureUserId();

        const baseUser: UserProfile = {
          id: sanitizedInput.id ?? ensureId(),
          userId,
          name: sanitizedInput.name,
          email: sanitizedInput.email,
          password: hasClient && supabase ? null : resolvedPassword
        };

        if (!hasClient || !supabase) {
          setUsers((prev) => sortUsers([...(prev.filter((user) => user.id !== baseUser.id)), baseUser]));
          return { success: true, data: baseUser };
        }

        const payload = mapUserToDb({
          ...sanitizedInput,
          id: sanitizedInput.id ?? undefined,
          userId
        });

        const { data, error: upsertError } = await supabase
          .from("user_profiles")
          .upsert(payload, { onConflict: "id" })
          .select()
          .single();

        if (upsertError) {
          return { success: false, error: upsertError.message };
        }

        const mapped = mapUserFromDb(data as DbUserProfile);
        setUsers((prev) => sortUsers([...(prev.filter((user) => user.id !== mapped.id)), mapped]));
        return { success: true, data: mapped };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: message };
      }
    },
    [users]
  );

  const deleteUser = useCallback(
    async (profile: UserProfile): Promise<MutationResult<null>> => {
      const removeFromState = () => {
        setUsers((prev) => prev.filter((user) => user.id !== profile.id));
      };

      if (!hasClient || !supabase) {
        removeFromState();
        return { success: true, data: null };
      }

      if (hasSupabaseAdmin && supabaseAdmin && profile.userId) {
        const { error: adminError } = await supabaseAdmin.auth.admin.deleteUser(profile.userId);
        if (adminError) {
          return { success: false, error: adminError.message };
        }
      }

      const { error: deleteError } = await supabase.from("user_profiles").delete().eq("id", profile.id);

      if (deleteError) {
        return { success: false, error: deleteError.message };
      }

      removeFromState();
      return { success: true, data: null };
    },
    []
  );

  return useMemo(
    () => ({
      users,
      loading,
      error,
      isUsingSupabase: hasClient,
      canManagePasswords: hasSupabaseAdmin,
      refresh: fetchUsers,
      saveUser,
      deleteUser
    }),
    [users, loading, error, fetchUsers, saveUser, deleteUser, hasSupabaseAdmin]
  );
}
