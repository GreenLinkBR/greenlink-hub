# Fase 2 — Módulos operacionais do GreenLink ADM

A Fase 1 entregou Shell + CRM/Comercial (Leads, Clientes, Pipeline, Orçamentos, Pedidos, Catálogo). Agora vamos destravar os módulos marcados como "em breve" na sidebar, mantendo a abordagem **somente frontend com mocks persistidos (Zustand + localStorage)**, em português (Brasil), responsivo desktop/mobile.

## Escopo desta fase

### 1. Contratos & Recorrência (`/contratos`)

- [x] Lista de contratos vinculados a clientes (a partir de pedidos aprovados ou avulsos).
- [ ] Campos completos na lista (pendente: exibir/usar “próximo reajuste”).
- [x] Detalhe `/contratos/$id` com cronograma de faturas geradas (12 meses à frente, mock).
- [x] Ação “Gerar fatura” → cria lançamento no Financeiro (contas a receber).
- [x] Ação “Criar OS” a partir do contrato.

### 2. Ordens de Serviço (`/os`)

- [x] Lista filtrável por status e técnico.
- [x] Cartão mobile-first com prioridade, cliente, endereço, SLA.
- [ ] Detalhe `/os/$id` completo (pendente: anexos mock e captura de assinatura dedicada).
- [x] Registro de horas e observações finais.
- [x] Criação rápida a partir de pedido ou contrato.

### 3. Ativos (`/ativos`)

- [x] Inventário de equipamentos instalados em clientes (sensores, gateways, estações).
- [x] Campos: tag, modelo, cliente, localização, status, última leitura mock.
- [x] Detalhe `/ativos/$id` com histórico de OS vinculadas.

### 4. Estoque (`/estoque`)

- [x] Saldo por item de catálogo (produto/kit), com movimentações (entrada, saída, ajuste, reserva).
- [x] Vincular movimentação de reserva/saída a uma OS (opcional).
- [x] Indicadores de estoque mínimo e alertas.
- [x] Tela de movimentação rápida.

### 5. Financeiro (`/financeiro`)

- [x] Abas: **Contas a Receber**, **Contas a Pagar**, **Fluxo de Caixa**.
- [x] Lançamentos com cliente/fornecedor, vencimento, valor, status, origem (contrato, pedido, manual).
- [x] KPIs no topo (a receber 30d, a pagar 30d, inadimplência, saldo previsto).
- [x] Marcar como pago / estornar.

### 6. Suporte (`/suporte`)

- [x] Tickets vinculados a cliente, com prioridade, canal e status.
- [x] Detalhe `/suporte/$id` com thread de mensagens mock e SLA.
- [x] Conversão de ticket em OS.

### 7. Dashboard ampliado

- [x] Widgets dos novos módulos (OS abertas, faturas próximas, tickets críticos, estoque crítico).

### 8. Ajustes de Shell

- [x] Remover marcação “em breve” da sidebar; itens reais com ícones.
- [x] `bottomNav` (mobile) com 5 atalhos finais (inclui “Mais” via drawer).
- [x] Pesquisa global no header com resultados cruzados (clientes, OS, contratos, tickets, etc.).

## Arquitetura

```
src/lib/mock/
  types.ts        # + Contrato, OS, Ativo, Movimentacao, Lancamento, Ticket
  store.ts        # novos slices + ações + seeds
src/routes/
  contratos.tsx / contratos.$id.tsx
  os.tsx / os.$id.tsx / os.novo.tsx (pendente)
  ativos.tsx / ativos.$id.tsx
  estoque.tsx
  financeiro.tsx                # tabs internas
  suporte.tsx / suporte.$id.tsx
src/components/
  modules/...                   # cards e formulários reutilizáveis
```

## Detalhes técnicos

- **Persistência**: estender o `useAppStore` existente; chave atual `greenlink-adm-v2` (migração leve ainda pendente, se necessário).
- **Cross-links**: contratos → faturas (financeiro); pedidos → OS; OS → ativos + estoque (reserva/saída); contratos/pedidos → financeiro.
- **UI**: shadcn `Tabs`, `Sheet`, `Dialog`, `Table` (desktop) + cards (mobile <768px), `Badge` para status, `Progress` para SLA.
- **Formulários**: `react-hook-form` + `zod` (já no projeto).
- **Datas**: `date-fns` para cálculos de vencimento/SLA/próximo reajuste.
- **SEO/head()**: cada rota com `title` próprio.

## Critérios de aceitação

- Todas as rotas acima navegáveis a partir da sidebar (desktop) e do drawer "Mais" (mobile).
- Fluxos demonstráveis: aprovar orçamento → gerar pedido → criar OS → consumir item do estoque → encerrar OS → gerar contrato → faturar mês → registrar pagamento.
- Layout testado em 360 / 768 / 1280 px.
- Dados persistem em localStorage e seeds iniciais demonstram cada módulo.
- Tema claro/escuro mantidos.

## Fora de escopo (próxima fase)

- Backend real (Lovable Cloud), autenticação com RBAC, multi-tenant.
- Integrações externas (NF-e, gateway de pagamento, WhatsApp).
- Produção / OPME / módulos P1 do PRD.
