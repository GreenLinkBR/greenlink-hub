# Plano — GreenLink v2: Starlink, UI e OCR

Estender o schema atual (sem remover nada) para o domínio Starlink e entregar as UIs novas + wizard de cadastro com OCR. Dividido em 3 entregas sequenciais para validar cada uma antes de seguir.

## Entrega 1 — Schema Starlink (migração única)

Novas tabelas em `public` (com GRANTs, RLS via `is_staff()` / `has_role('admin')`, triggers `touch_updated_at`):

- **equipment** — `customer_id` → customers, `model`, `serial_number` (UNIQUE), `kit_id` (UNIQUE), `dish_model`, `pn`, `power_source`, `warranty_until`, `installed_at`, `status` (`in_stock|installed|maintenance|retired`), `notes`.
- **starlink_accounts** — `gl_code` (UNIQUE, gerado por sequência `GL-001`), `customer_id`, `equipment_id`, `gmail_alias` (UNIQUE, `greennetantenas+N@gmail.com`), `is_primary_account`, `plan`, `status`, `activated_at`, `customer_has_access` bool, `recovery_email`, `recovery_phone`, `notes`.
- **installations** — `customer_id`, `equipment_id`, `technician_id` (→ profiles), `scheduled_at`, `executed_at`, `checklist` jsonb, `photos_before` jsonb, `photos_after` jsonb, `signature_url`, `gps_lat`, `gps_lng`, `status` (`scheduled|in_progress|done|cancelled`), `notes`.
- **customer_documents** — `customer_id`, `doc_type` (`cnh|energy_bill|starlink_label|other`), `file_url`, `ocr_data` jsonb, `uploaded_by`, `uploaded_at`.
- **technicians_view** (VIEW) — agrega KPIs por técnico (instalações realizadas, tempo médio, avaliação futura).
- Sequência + função `next_gl_code()` e `next_gmail_alias()` (SECURITY DEFINER).

Extensões em tabelas existentes:

- **customers**: `birth_date`, `cpf_cnpj` (UNIQUE parcial), `latitude`, `longitude`, `city`, `state`, `notes` (se faltar).
- **profiles**: já cobre técnicos; adicionar role `technician` no enum `app_role` se necessário e usar em RLS de installations.

Bucket de storage `customer-docs` (privado) para fotos/documentos, com policies por dono.

## Entrega 2 — UI dos novos módulos

Rotas TanStack novas em `src/routes/`:

- `equipamentos.tsx` + `equipamentos.$id.tsx` — lista, filtros por SN/KIT ID/status, formulário.
- `contas-starlink.tsx` + `contas-starlink.$id.tsx` — lista com GL-code, alias, cliente, plano.
- `instalacoes.tsx` + `instalacoes.$id.tsx` — agenda, checklist, upload fotos antes/depois, mapa GPS, assinatura (canvas).
- `tecnicos.tsx` — ranking com KPIs.
- `clientes.$id.tsx` — adicionar abas Equipamentos / Contas Starlink / Instalações / Documentos.

Novos services em `src/services/`: `equipment.ts`, `starlinkAccounts.ts`, `installations.ts`, `documents.ts`. Hooks em `src/hooks/domain/`.

Busca global (`src/lib/search.ts`): indexar SN, KIT ID, GL-code, CPF, alias, cidade.

Navegação: adicionar itens no `nav-config.ts` e sidebar.

## Entrega 3 — Wizard "Novo Cliente" com OCR

Rota: `clientes.novo.tsx` — stepper de 5 passos.

1. Upload CNH → OCR → preenche nome, CPF, nascimento.
2. Upload conta de energia → OCR → preenche endereço, cidade, CEP, geocode (lat/lng via Google Maps se conectado, senão manual).
3. Upload etiqueta Starlink → OCR → preenche modelo, SN, KIT ID.
4. Revisão + geração automática: próximo `GL-XXX`, próximo alias `greennetantenas+N@gmail.com`.
5. Confirma → cria em transação: customer + document + equipment + starlink_account + installation (agendada).

OCR via **Lovable AI Gateway** com `google/gemini-2.5-flash` (multimodal, sem chave extra). Server function `src/lib/ocr.functions.ts` recebe `{ file_url, doc_type }`, chama gateway com schema JSON estruturado por tipo, salva `ocr_data` em `customer_documents`.

Feedback: `LoadingState` durante OCR, campos editáveis após extração (usuário sempre pode corrigir).

## Detalhes técnicos

- Todas migrações seguem o padrão CREATE TABLE → GRANT (`authenticated`, `service_role`) → ENABLE RLS → CREATE POLICY. Nenhuma policy `TO anon` — sistema é interno.
- RLS: staff (`is_staff(auth.uid())`) tem CRUD; `technician` vê apenas suas installations (`technician_id = auth.uid()`).
- Storage: bucket `customer-docs` privado, upload via `supabase.storage`, policies apenas `authenticated` + `is_staff`.
- OCR roda como `createServerFn` autenticada (`requireSupabaseAuth`), nunca no browser.
- Integrações externas (n8n, WhatsApp, Drive, Calendar) ficam fora desta rodada — o schema já suporta ligá-las depois via webhooks.

## Ordem de execução

1. Migração única com tudo de Entrega 1. **Pausa para você aprovar.**
2. Após aprovar, aplico services + hooks + rotas da Entrega 2.
3. Por fim, wizard + OCR da Entrega 3.

Posso começar pela Entrega 1?
