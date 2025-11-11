import { useCallback, useEffect, useMemo, useState } from "react";
import { hasSupabaseConfig, supabase } from "../supabaseClient";
import type { MutationResult } from "./useSupabaseData";

export type Role = "master" | "gestor" | "financeiro";

export type UserProfile = {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
};

export type UpsertUserProfileInput = Omit<UserProfile, "id"> & { id?: string };

type DbUserProfile = {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  role: Role;
  created_at: string;
  updated_at: string;
};

const mockUsers: UserProfile[] = [
  { id: "1", userId: null, name: "Ana Souza", email: "ana@logica.com", role: "master" },
  { id: "2", userId: null, name: "Bruno Lima", email: "bruno@logica.com", role: "gestor" },
  { id: "3", userId: null, name: "Carla Dias", email: "carla@logica.com", role: "financeiro" }
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
  role: record.role,
  createdAt: record.created_at,
  updatedAt: record.updated_at
});

const mapUserToDb = (input: UpsertUserProfileInput): Record<string, unknown> => {
  const payload: Record<string, unknown> = {
    id: input.id,
    user_id: input.userId,
    name: input.name,
    email: input.email,
    role: input.role
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
  refresh: () => Promise<void>;
  saveUser: (input: UpsertUserProfileInput) => Promise<MutationResult<UserProfile>>;
  deleteUser: (userId: string) => Promise<MutationResult<null>>;
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
      const baseUser: UserProfile = {
        id: input.id ?? ensureId(),
        userId: input.userId ?? null,
        name: input.name,
        email: input.email,
        role: input.role
      };

      if (!hasClient || !supabase) {
        setUsers((prev) => sortUsers([...(prev.filter((user) => user.id !== baseUser.id)), baseUser]));
        return { success: true, data: baseUser };
      }

      const payload = mapUserToDb({ ...input, id: input.id ?? undefined });

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
    },
    []
  );

  const deleteUser = useCallback(
    async (userId: string): Promise<MutationResult<null>> => {
      const removeFromState = () => {
        setUsers((prev) => prev.filter((user) => user.id !== userId));
      };

      if (!hasClient || !supabase) {
        removeFromState();
        return { success: true, data: null };
      }

      const { error: deleteError } = await supabase.from("user_profiles").delete().eq("id", userId);

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
      refresh: fetchUsers,
      saveUser,
      deleteUser
    }),
    [users, loading, error, fetchUsers, saveUser, deleteUser]
  );
}
