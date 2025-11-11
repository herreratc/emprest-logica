# Controle de Empréstimos - Lógica App

Aplicação front-end construída com React + Vite para gerenciar operações de crédito corporativas.
Inclui autenticação via Supabase, dashboards interativos e utilitários para simulação financeira.

## Tecnologias

- React 18 com TypeScript
- Vite 5
- Tailwind CSS 3 para estilização baseada na paleta fornecida
- Supabase Auth (e-mail/senha e Google OAuth)

## Configuração

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie um arquivo `.env` na raiz do projeto com as credenciais do Supabase:

   ```bash
   VITE_SUPABASE_URL=https://<sua-instancia>.supabase.co
   VITE_SUPABASE_ANON_KEY=<sua-chave-anon>
   ```

3. Execute o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

4. Acesse `http://localhost:5173` para visualizar a aplicação.

## Scripts adicionais

- `npm run build` — gera o bundle de produção.
- `npm run preview` — executa o bundle gerado para verificação.

## Estrutura de pastas

```
src/
├── App.tsx                # Composição das views e roteamento básico
├── auth/                  # Contexto de autenticação via Supabase
├── components/            # Telas (Dashboard, Empresas, Empréstimos, etc.)
├── data/                  # Mock de dados para prototipagem
├── utils/                 # Formatadores e helpers
└── styles.css             # Tailwind + customizações globais
```

## Próximos passos sugeridos

- Conectar formulários (empresas, empréstimos, usuários) com Supabase Database.
- Criar policies e edge functions para garantir segurança multiempresa.
- Implementar telas responsivas no mobile com navegação otimizada.
- Criar testes automatizados de integração (Vitest/Testing Library).
