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

2. Duplique o arquivo `.env.example` na raiz do projeto para `.env` e informe as credenciais do Supabase:

   ```bash
   cp .env.example .env
   # edite o arquivo criado com a URL, a chave anônima e a service role do seu projeto Supabase
   ```

   > A service role é necessária para que a tela de Convites de Usuário consiga enviar os convites por e-mail.
   > Guarde essa chave em local seguro e não a commite no repositório.

3. Aplique a estrutura de banco descrita em `supabase/schema.sql` usando o SQL Editor do Supabase ou a CLI:

   ```bash
   supabase db push --file supabase/schema.sql
   # ou cole o conteúdo no editor SQL do painel e execute
   ```

   - Para zerar todos os contratos e parcelas mantendo somente as empresas, rode `supabase/reset_preserve_companies.sql` no SQL Editor ou via CLI:

     ```bash
     supabase db push --file supabase/reset_preserve_companies.sql
     ```

4. Execute o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

5. Acesse `http://localhost:5173` para visualizar a aplicação.

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

- Implementar edição e criação de contratos de empréstimo diretamente pela interface.
- Criar policies e edge functions para garantir segurança multiempresa.
- Implementar telas responsivas no mobile com navegação otimizada.
- Criar testes automatizados de integração (Vitest/Testing Library).
