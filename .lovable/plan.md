# Entrega 3 — Wizard "Novo Cliente" com OCR

Última entrega do escopo Starlink. Cria um fluxo guiado de 5 passos em `/clientes/novo` que usa OCR (Lovable AI Gateway, `google/gemini-2.5-flash`) para pré-preencher os dados a partir de CNH, conta de energia e etiqueta Starlink, e ao final cria em transação: `customer` + `customer_documents` + `equipment` + `starlink_accounts` + `installations`.

## O que será entregue

1. **Edge Function `ocr-extract`** (`supabase/functions/ocr-extract/index.ts`)
   - Entrada: `{ file_url, doc_type: "cnh" | "energy_bill" | "starlink_label" }`.
   - Baixa o arquivo do bucket privado `customer-docs` via signed URL, envia como `image_url` para o gateway com `Output.object` (schema por tipo).
   - Retorna JSON estruturado + persiste em `customer_documents.ocr_data`.
   - CORS + validação Zod + auth via JWT.

2. **Upload helper** (`src/lib/storage.ts`)
   - `uploadCustomerDoc(file, customerId?, docType)` → sobe para `customer-docs/{tempId|customerId}/{docType}-{ts}.ext` e devolve `{ path, signedUrl }`.

3. **Rota `/clientes/novo`** (`src/routes/clientes.novo.tsx`) — stepper com 5 passos:
   - **1. CNH**: upload → OCR → campos editáveis (nome, CPF, nascimento).
   - **2. Conta de energia**: upload → OCR → endereço, cidade, UF, CEP, lat/lng (manual se sem geocode).
   - **3. Etiqueta Starlink**: upload → OCR → modelo, SN, KIT ID, PN.
   - **4. Plano & instalação**: escolhe plano, data agendada, técnico (opcional), notas.
   - **5. Revisão**: mostra `GL-XXXXX` e alias `greennetantenas+N@gmail.com` que serão gerados (via RPC `next_gl_code` / `next_gmail_alias`) e confirma.

4. **Criação transacional** (`src/services/customerOnboarding.ts`)
   - Sequência: `customers.insert` → move docs do temp para `{customerId}/…` e insere `customer_documents` (com `ocr_data`) → `equipment.insert` → `starlink_accounts.insert` (gl_code/alias via defaults do banco) → `installations.insert` com `status='scheduled'`.
   - Rollback simples: se qualquer passo falhar, remove o `customer` criado (cascade limpa o resto).

5. **UI/UX**
   - Componentes shadcn existentes (`Card`, `Stepper` custom simples, `Input`, `Button`, `Dialog`).
   - `LoadingState` durante OCR, toast de erro com mensagem do gateway (429/402 tratados).
   - Botão "Novo cliente" adicionado em `/clientes`.

## Detalhes técnicos

- OCR schemas (Zod) por tipo, com todos os campos `.nullable()` (regra do gateway para OpenAI-compat; Gemini aceita, mantemos por consistência).
- Prompt do sistema em pt-BR pedindo extração literal, sem inferência.
- MIME real do upload é passado no `image_url` (data URL base64) — nada de hardcode `application/pdf`.
- Nenhuma mudança de schema — tudo já existe da Entrega 1.
- Nenhum dado mocado; se OCR falhar o usuário edita manualmente e segue.

## Fora do escopo

- Geocode automático (Google Maps) — campos lat/lng ficam manuais nesta rodada.
- Assinatura digital no wizard (fica na tela de instalação).
- Integrações n8n/WhatsApp/Drive/Calendar.

Posso implementar?
