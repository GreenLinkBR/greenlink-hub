# Fase 2 — Módulos operacionais do GreenLink ADM

A Fase 1 entregou Shell + CRM/Comercial (Leads, Clientes, Pipeline, Orçamentos, Pedidos, Catálogo). Agora vamos destravar os módulos marcados como "em breve" na sidebar, mantendo a abordagem **somente frontend com mocks persistidos (Zustand + localStorage)**, em português (Brasil), responsivo desktop/mobile.

## Escopo desta fase

### 1. Contratos & Recorrência (`/contratos`)
- Lista de contratos vinculados a clientes (a partir de pedidos aprovados ou avulsos).
- Campos: número, cliente, vigência (início/fim), valor mensal, indexador (IPCA/IGPM/fixo), status (ativo, suspenso, encerrado), próximo reajuste.
- Detalhe `/contratos/$id` com cronograma de faturas geradas (12 meses à frente, mock).
- Ação "Gerar fatura do mês" → cria lançamento no Financeiro (contas a receber).

### 2. Ordens de Serviço (`/os`)
- Lista filtrável por status (aberta, em execução, concluída, cancelada) e técnico.
- Cartão mobile-first com prioridade, cliente, endereço, SLA.
- Detalhe `/os/$id`: dados do cliente, checklist de tarefas, ativos vinculados, anexos mock, registro de horas, assinatura/observações finais.
- Criação rápida a partir de pedido ou contrato.

### 3. Ativos (`/ativos`)
- Inventário de equipamentos instalados em clientes (sensores, gateways, estações).
- Campos: tag, modelo, cliente, localização, status (ativo, manutenção, baixado), última leitura mock.
- Vínculo bidirecional com OS (histórico de intervenções).

### 4. Estoque (`/estoque`)
- Saldo por item de catálogo (produto/kit), com movimentações (entrada, saída, ajuste, reserva por OS).
- Indicadores de estoque mínimo e alertas.
- Tela de movimentação rápida.

### 5. Financeiro (`/financeiro`)
- Abas: **Contas a Receber**, **Contas a Pagar**, **Fluxo de Caixa**.
- Lançamentos com cliente/fornecedor, vencimento, valor, status (em aberto, pago, vencido), origem (contrato, pedido, manual).
- KPIs no topo (a receber 30d, a pagar 30d, inadimplência, saldo previsto).
- Marcar como pago / estornar.

### 6. Suporte (`/suporte`)
- Tickets vinculados a cliente, com prioridade, canal (email, whatsapp, portal), status (novo, em andamento, aguardando cliente, resolvido).
- Detalhe `/suporte/$id` com thread de mensagens mock e SLA.
- Conversão de ticket em OS.

### 7. Dashboard ampliado
- Adicionar widgets dos novos módulos (OS abertas, faturas vencendo, tickets críticos, estoque crítico).

### 8. Ajustes de Shell
- Remover marcação "em breve" da sidebar; adicionar itens reais com ícones.
- Atualizar `bottomNav` (mobile) com 5 atalhos finais: Dashboard, Pipeline, OS, Financeiro, Mais (drawer).
- Pesquisa global no header com resultados cruzados (cliente, OS, contrato, ticket).

## Arquitetura

```
src/lib/mock/
  types.ts        # + Contrato, OS, Ativo, Movimentacao, Lancamento, Ticket
  store.ts        # novos slices + ações + seeds
src/routes/
  contratos.tsx / contratos.$id.tsx
  os.tsx / os.$id.tsx / os.novo.tsx
  ativos.tsx / ativos.$id.tsx
  estoque.tsx
  financeiro.tsx                # tabs internas
  suporte.tsx / suporte.$id.tsx
src/components/
  modules/...                   # cards e formulários reutilizáveis
```

## Detalhes técnicos
- **Persistência**: estender o `useAppStore` existente; manter chave `greenlink-adm-v1` com migração leve (campos opcionais).
- **Cross-links**: contratos → faturas (financeiro); pedidos → OS; OS → ativos + estoque (reserva); contratos/pedidos → financeiro.
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
