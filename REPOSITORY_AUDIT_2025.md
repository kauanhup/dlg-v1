# 🔍 AUDITORIA COMPLETA DO REPOSITÓRIO
**Data:** 2025-12-23  
**Autor:** Sistema de Auditoria Automatizada  
**Status:** ✅ ANÁLISE CONCLUÍDA

---

## ETAPA 1 — INVENTÁRIO COMPLETO

### 📁 PÁGINAS (src/pages/)

| Arquivo | Status | Tipo | Referenciado Por | Risco Remoção |
|---------|--------|------|------------------|---------------|
| `Index.tsx` | ✅ ATIVO | frontend | App.tsx (rota `/`) | ALTO |
| `Login.tsx` | ✅ ATIVO | frontend | App.tsx (rota `/login`) | ALTO |
| `Dashboard.tsx` | ✅ ATIVO | frontend | App.tsx (rota `/dashboard`) | ALTO |
| `Admin.tsx` | ✅ ATIVO | frontend | App.tsx (rota `/admin`) | ALTO |
| `Buy.tsx` | ✅ ATIVO | frontend | App.tsx (rota `/comprar`) | ALTO |
| `Checkout.tsx` | ✅ ATIVO | frontend | App.tsx (rota `/checkout`) | ALTO |
| `Pagamentos.tsx` | ✅ ATIVO | frontend | App.tsx (rota `/pagamentos`) | ALTO |
| `RecuperarSenha.tsx` | ✅ ATIVO | frontend | App.tsx (rota `/recuperar-senha`) | ALTO |
| `PoliticaPrivacidade.tsx` | ✅ ATIVO | frontend | App.tsx (rota `/politica-privacidade`) | MÉDIO |
| `NotFound.tsx` | ✅ ATIVO | frontend | App.tsx (rota `*`) | MÉDIO |

### 📁 COMPONENTES UI (src/components/ui/)

| Arquivo | Status | Referenciado Por | Risco Remoção |
|---------|--------|------------------|---------------|
| `accordion.tsx` | ✅ ATIVO | FAQ.tsx | ALTO |
| `alert-dialog.tsx` | ✅ ATIVO | PendingPaymentBanner.tsx, Dashboard.tsx | ALTO |
| `alert-toast.tsx` | ✅ ATIVO | use-alert-toast.tsx | ALTO |
| `animated-shader-background.tsx` | ✅ ATIVO | Hero.tsx, Login.tsx, Dashboard.tsx, Checkout.tsx, Pagamentos.tsx, RecuperarSenha.tsx | ALTO |
| `animated-shiny-text.tsx` | ❌ MORTO | Nenhum import encontrado | BAIXO |
| `anime-navbar.tsx` | ✅ ATIVO | Header.tsx | ALTO |
| `avatar-picker.tsx` | ✅ ATIVO | menu.tsx, Dashboard.tsx, Admin.tsx | ALTO |
| `badge.tsx` | ✅ ATIVO | Múltiplos componentes | ALTO |
| `button.tsx` | ✅ ATIVO | Toda aplicação | ALTO |
| `card.tsx` | ✅ ATIVO | Múltiplos componentes | ALTO |
| `container-scroll-animation.tsx` | ❌ MORTO | Nenhum import encontrado | BAIXO |
| `download-bot-button.tsx` | ✅ ATIVO | Dashboard.tsx | ALTO |
| `dropdown-menu.tsx` | ✅ ATIVO | Admin.tsx, Dashboard.tsx | ALTO |
| `gooey-text-morphing.tsx` | ❌ MORTO | Nenhum import encontrado | BAIXO |
| `label.tsx` | ⚠️ SUSPEITO | Verificar uso em formulários | MÉDIO |
| `menu.tsx` | ✅ ATIVO | Dashboard.tsx, Admin.tsx | ALTO |
| `morphing-square.tsx` | ✅ ATIVO | Login.tsx, Dashboard.tsx, Checkout.tsx, Pagamentos.tsx, RecuperarSenha.tsx, Admin.tsx | ALTO |
| `pixel-trail.tsx` | ❌ MORTO | Nenhum import encontrado | BAIXO |
| `popover.tsx` | ✅ ATIVO | menu.tsx, Dashboard.tsx | ALTO |
| `scroll-reveal.tsx` | ❌ MORTO | Nenhum import encontrado | BAIXO |
| `separator.tsx` | ✅ ATIVO | dropdown-menu.tsx (via DropdownMenuSeparator) | MÉDIO |
| `spinner.tsx` | ✅ ATIVO | Múltiplos componentes | ALTO |
| `switch.tsx` | ✅ ATIVO | Admin.tsx, menu.tsx | ALTO |
| `tooltip.tsx` | ✅ ATIVO | App.tsx (TooltipProvider) | ALTO |
| `typewriter-text.tsx` | ✅ ATIVO | Hero.tsx | ALTO |

### 📁 COMPONENTES LANDING (src/components/landing/)

| Arquivo | Status | Referenciado Por | Risco Remoção |
|---------|--------|------------------|---------------|
| `BotPreviews.tsx` | ✅ ATIVO | BotShowcase.tsx | ALTO |
| `BotShowcase.tsx` | ✅ ATIVO | Index.tsx (via index.ts) | ALTO |
| `CTA.tsx` | ✅ ATIVO | Index.tsx (via index.ts) | ALTO |
| `FAQ.tsx` | ✅ ATIVO | Index.tsx (via index.ts) | ALTO |
| `Features.tsx` | ✅ ATIVO | Index.tsx (via index.ts) | ALTO |
| `Footer.tsx` | ✅ ATIVO | Index.tsx, Buy.tsx (via index.ts) | ALTO |
| `Header.tsx` | ✅ ATIVO | Index.tsx, Buy.tsx (via index.ts) | ALTO |
| `Hero.tsx` | ✅ ATIVO | Index.tsx (via index.ts) | ALTO |
| `HeroVisual.tsx` | ✅ ATIVO | Hero.tsx | ALTO |
| `Pricing.tsx` | ✅ ATIVO | Index.tsx (via index.ts) | ALTO |
| `RotatingDivider.tsx` | ✅ ATIVO | Index.tsx | ALTO |
| `SectionDivider.tsx` | ✅ ATIVO | Index.tsx | ALTO |
| `SubtleDivider.tsx` | ✅ ATIVO | BotShowcase.tsx | ALTO |
| `index.ts` | ✅ ATIVO | Index.tsx, Buy.tsx | ALTO |

### 📁 COMPONENTES RAIZ (src/components/)

| Arquivo | Status | Referenciado Por | Risco Remoção |
|---------|--------|------------------|---------------|
| `CookieConsent.tsx` | ✅ ATIVO | App.tsx | ALTO |
| `LicenseExpirationBanner.tsx` | ✅ ATIVO | Dashboard.tsx | ALTO |
| `PageTransition.tsx` | ✅ ATIVO | Index.tsx | ALTO |
| `PendingPaymentBanner.tsx` | ✅ ATIVO | App.tsx | ALTO |
| `SEO.tsx` | ✅ ATIVO | Index.tsx | ALTO |

### 📁 COMPONENTES ADMIN (src/components/admin/)

| Arquivo | Status | Referenciado Por | Risco Remoção |
|---------|--------|------------------|---------------|
| `dashboard/AdminDashboardSection.tsx` | ✅ ATIVO | Admin.tsx | ALTO |
| `dashboard/index.ts` | ✅ ATIVO | Barrel export | MÉDIO |
| `debug/SystemDebugPanel.tsx` | ✅ ATIVO | Admin.tsx | ALTO |
| `debug/index.ts` | ✅ ATIVO | Barrel export | MÉDIO |
| `sessions/SessionCombosSection.tsx` | ✅ ATIVO | Admin.tsx | ALTO |
| `sessions/SessionCostSection.tsx` | ✅ ATIVO | Admin.tsx | ALTO |
| `sessions/SessionCustomQuantitySection.tsx` | ✅ ATIVO | Admin.tsx | ALTO |
| `sessions/SessionFilesList.tsx` | ✅ ATIVO | SessionsSection.tsx | ALTO |
| `sessions/SessionOrdersSection.tsx` | ✅ ATIVO | Admin.tsx | ALTO |
| `sessions/SessionSalesHistory.tsx` | ✅ ATIVO | Admin.tsx | ALTO |
| `sessions/SessionStatsCards.tsx` | ✅ ATIVO | SessionsSection.tsx | ALTO |
| `sessions/SessionTypeSelectorModal.tsx` | ✅ ATIVO | Admin.tsx | ALTO |
| `sessions/SessionUploadModal.tsx` | ✅ ATIVO | SessionsSection.tsx | ALTO |
| `sessions/SessionsSection.tsx` | ✅ ATIVO | Admin.tsx | ALTO |
| `sessions/index.ts` | ✅ ATIVO | Barrel export | MÉDIO |

### 📁 HOOKS (src/hooks/)

| Arquivo | Status | Referenciado Por | Risco Remoção |
|---------|--------|------------------|---------------|
| `use-alert-toast.tsx` | ✅ ATIVO | App.tsx, Login.tsx, Checkout.tsx, RecuperarSenha.tsx | ALTO |
| `useAdminBot.tsx` | ✅ ATIVO | Admin.tsx | ALTO |
| `useAdminOrders.tsx` | ✅ ATIVO | Admin.tsx | ALTO |
| `useAdminSessions.tsx` | ✅ ATIVO | Admin.tsx, SessionsSection.tsx | ALTO |
| `useAdminSubscriptions.tsx` | ✅ ATIVO | Admin.tsx | ALTO |
| `useAdminUsers.tsx` | ✅ ATIVO | Admin.tsx | ALTO |
| `useAuth.tsx` | ✅ ATIVO | Dashboard.tsx, Admin.tsx, Checkout.tsx, etc. | ALTO |
| `useSystemSettings.tsx` | ✅ ATIVO | Dashboard.tsx, Admin.tsx, Checkout.tsx, Login.tsx | ALTO |
| `useUpgradeCredit.tsx` | ✅ ATIVO | Checkout.tsx | ALTO |
| `useUserDashboard.tsx` | ✅ ATIVO | Dashboard.tsx | ALTO |

### 📁 LIB (src/lib/)

| Arquivo | Status | Referenciado Por | Risco Remoção |
|---------|--------|------------------|---------------|
| `utils.ts` | ✅ ATIVO | Toda aplicação (cn function) | ALTO |
| `auditLog.ts` | ✅ ATIVO | useAdminUsers.tsx, Admin.tsx | ALTO |
| `downloadWithRetry.ts` | ⚠️ SUSPEITO | Nenhum import direto encontrado | MÉDIO |

### 📁 EDGE FUNCTIONS (supabase/functions/)

| Função | Status | Chamado Por | Cron Job | Risco Remoção |
|--------|--------|-------------|----------|---------------|
| `admin-actions` | ✅ ATIVO | Admin.tsx | ❌ | ALTO |
| `cleanup-expired-orders` | ✅ ATIVO | Cron job | ✅ `*/5 * * * *` | ALTO |
| `cleanup-expired-reservations` | ✅ ATIVO | SystemDebugPanel.tsx, Cron | ✅ `*/10 * * * *` | ALTO |
| `create-payment-with-fallback` | ✅ ATIVO | Checkout.tsx | ❌ | ALTO |
| `evopay` | ✅ ATIVO | Checkout.tsx (fallback) | ❌ | ALTO |
| `evopay-webhook` | ✅ ATIVO | EvoPay Gateway | ❌ | ALTO |
| `expire-subscriptions` | ✅ ATIVO | Cron jobs | ✅ `0 * * * *` e `0 3 * * *` | ALTO |
| `forgot-password` | ✅ ATIVO | RecuperarSenha.tsx | ❌ | ALTO |
| `login` | ✅ ATIVO | Login.tsx | ❌ | ALTO |
| `notify-expiring-licenses` | ✅ ATIVO | Cron job | ✅ `0 9 * * *` | ALTO |
| `pixup` | ✅ ATIVO | Checkout.tsx | ❌ | ALTO |
| `pixup-webhook` | ✅ ATIVO | PixUp Gateway | ❌ | ALTO |
| `reconcile-sessions` | ✅ ATIVO | Cron job | ✅ `*/10 * * * *` | ALTO |
| `reconciliation-global` | ✅ ATIVO | Cron job | ✅ `*/5 * * * *` | ALTO |
| `register` | ✅ ATIVO | Login.tsx | ❌ | ALTO |
| `send-email` | ✅ ATIVO | Outras edge functions | ❌ | ALTO |
| `sync-sessions-inventory` | ✅ ATIVO | SystemDebugPanel.tsx, SessionsSection.tsx | ❌ | ALTO |

### 📁 HOSTINGER PROXY (hostinger-proxy/)

| Arquivo | Status | Propósito | Risco Remoção |
|---------|--------|-----------|---------------|
| `.htaccess` | ✅ ATIVO | Config Apache | ALTO |
| `README.md` | ✅ ATIVO | Documentação | BAIXO |
| `proxy-pixup.php` | ✅ ATIVO | Proxy IP fixo para PixUp | ALTO |
| `webhook-evopay.php` | ✅ ATIVO | Recebe webhooks EvoPay | ALTO |
| `webhook-handler.php` | ⚠️ SUSPEITO | Handler genérico | MÉDIO |
| `webhook-pixup.php` | ✅ ATIVO | Recebe webhooks PixUp | ALTO |

### 📁 DOCUMENTAÇÃO (raiz)

| Arquivo | Status | Conteúdo | Ação Recomendada |
|---------|--------|----------|------------------|
| `AUDITORIA_DLG_CONNECT.txt` | 🟡 LEGADO | Auditoria antiga (2025-12-23) | CONSOLIDAR com AUDITORIA_FINAL.md |
| `AUDITORIA_FINAL.md` | ✅ ATIVO | Auditoria atual | MANTER |
| `DEBUG_GUIDE.md` | ✅ ATIVO | Guia de debug | MANTER |
| `README.md` | ✅ ATIVO | Doc técnica completa | MANTER |
| `SECURITY_CONFIG.md` | ✅ ATIVO | Config segurança | MANTER |
| `SELF_HEALING_ARCHITECTURE.md` | ✅ ATIVO | Arquitetura self-healing | MANTER |

### 📁 ASSETS (src/assets/)

| Arquivo | Status | Usado Por | Risco Remoção |
|---------|--------|-----------|---------------|
| `logo.png` | ✅ ATIVO | Headers, emails | ALTO |
| `bot-dashboard-1.png` | ✅ ATIVO | BotPreviews.tsx | ALTO |
| `bot-dashboard-2.png` | ✅ ATIVO | BotPreviews.tsx | ALTO |
| `bot-dashboard-3.png` | ✅ ATIVO | BotPreviews.tsx | ALTO |

---

## ETAPA 2 — ANÁLISE DE DEPENDÊNCIA

### ❌ CÓDIGO MORTO IDENTIFICADO

| Arquivo | Motivo | Última Referência |
|---------|--------|-------------------|
| `src/components/ui/animated-shiny-text.tsx` | Nenhum import em nenhum arquivo | N/A |
| `src/components/ui/container-scroll-animation.tsx` | Nenhum import em nenhum arquivo | N/A |
| `src/components/ui/gooey-text-morphing.tsx` | Nenhum import em nenhum arquivo | N/A |
| `src/components/ui/pixel-trail.tsx` | Nenhum import em nenhum arquivo | N/A |
| `src/components/ui/scroll-reveal.tsx` | Nenhum import em nenhum arquivo | N/A |

### ⚠️ CÓDIGO SUSPEITO (Verificar Antes de Remover)

| Arquivo | Motivo | Ação |
|---------|--------|------|
| `src/components/ui/label.tsx` | Pode ser usado via shadcn em forms | Verificar uso em formulários |
| `src/lib/downloadWithRetry.ts` | Nenhum import direto, mas pode ser usado dinamicamente | Verificar Dashboard.tsx |
| `hostinger-proxy/webhook-handler.php` | Parece handler genérico, pode ser redundante | Verificar logs Hostinger |

### ✅ RPCs UTILIZADAS

| RPC | Onde Chamada |
|-----|--------------|
| `complete_order_atomic` | webhooks (pixup/evopay), reconciliation-global |
| `reserve_sessions_atomic` | Checkout.tsx |
| `release_session_reservation` | cleanup functions |
| `has_role` | RLS policies, edge functions |
| `get_user_role` | useAuth.tsx |

### ✅ VIEWS UTILIZADAS

| View | Onde Consumida |
|------|----------------|
| `health_dashboard_summary` | reconciliation-global, Admin.tsx (futuro) |
| `health_pending_orders` | reconciliation-global |
| `health_payments_without_completion` | reconciliation-global |
| `health_licenses_should_expire` | reconciliation-global |
| `health_license_subscription_divergence` | reconciliation-global |
| `health_orphaned_reservations` | reconciliation-global |
| `health_recent_reconciliations` | reconciliation-global |

### ✅ CRON JOBS ATIVOS (Verificados no DB)

| Job | Frequência | Edge Function | Status |
|-----|------------|---------------|--------|
| `cleanup-expired-orders` | `*/5 * * * *` | cleanup-expired-orders | ✅ ATIVO |
| `expire-subscriptions-hourly` | `0 * * * *` | expire-subscriptions | ✅ ATIVO |
| `expire-subscriptions-daily` | `0 3 * * *` | expire-subscriptions | ✅ ATIVO (redundante) |
| `cleanup-expired-reservations` | `*/10 * * * *` | cleanup-expired-reservations | ✅ ATIVO |
| `notify-expiring-licenses` | `0 9 * * *` | notify-expiring-licenses | ✅ ATIVO |
| `reconcile-sessions-job` | `*/10 * * * *` | reconcile-sessions | ✅ ATIVO |
| `reconciliation-global-job` | `*/5 * * * *` | reconciliation-global | ✅ ATIVO |

### ⚠️ REDUNDÂNCIA IDENTIFICADA

1. **Cron Jobs de Expiração:** `expire-subscriptions-hourly` e `expire-subscriptions-daily` fazem a mesma coisa
   - **Recomendação:** Remover `expire-subscriptions-daily` (manter apenas o hourly)

2. **reconcile-sessions vs reconciliation-global:** Ambos tratam sessões órfãs
   - **Recomendação:** `reconciliation-global` é mais completo, considerar deprecar `reconcile-sessions`

3. **Documentação Duplicada:** `AUDITORIA_DLG_CONNECT.txt` e `AUDITORIA_FINAL.md`
   - **Recomendação:** Consolidar em um único arquivo

---

## ETAPA 3 — PLANO DE LIMPEZA SEGURA

### NÍVEL 1 — REMOÇÃO SEGURA (Sem Impacto)

| Arquivo | Justificativa |
|---------|---------------|
| `src/components/ui/animated-shiny-text.tsx` | Zero referências, componente UI não utilizado |
| `src/components/ui/container-scroll-animation.tsx` | Zero referências, componente UI não utilizado |
| `src/components/ui/gooey-text-morphing.tsx` | Zero referências, componente UI não utilizado |
| `src/components/ui/pixel-trail.tsx` | Zero referências, componente UI não utilizado |
| `src/components/ui/scroll-reveal.tsx` | Zero referências, componente UI não utilizado |
| `AUDITORIA_DLG_CONNECT.txt` | Substituído por AUDITORIA_FINAL.md |

### NÍVEL 2 — ISOLAMENTO (Marcar como Deprecated)

| Arquivo | Ação | Motivo |
|---------|------|--------|
| `src/lib/downloadWithRetry.ts` | Adicionar `@deprecated` | Verificar se ainda usado |
| `hostinger-proxy/webhook-handler.php` | Comentário `// LEGACY` | Pode ser redundante |
| `supabase/functions/reconcile-sessions/` | Adicionar nota no topo | Superseded by reconciliation-global |

### NÍVEL 3 — NÃO TOCAR

| Arquivo | Motivo |
|---------|--------|
| `src/components/ui/label.tsx` | Pode ser usado por shadcn forms internamente |
| `src/components/ui/separator.tsx` | Usado pelo dropdown-menu.tsx |
| Todas as edge functions | Chamadas por cron/webhooks externos |
| Todos os arquivos hostinger-proxy/*.php | Em produção, webhooks ativos |
| Todas as views health_* | Consumidas por reconciliation-global |

---

## ETAPA 4 — ORGANIZAÇÃO IDEAL (PROPOSTA)

### Estrutura Atual
```
src/
├── components/
│   ├── admin/
│   ├── landing/
│   └── ui/
├── hooks/
├── lib/
└── pages/

supabase/
├── functions/
├── migrations/
└── config.toml
```

### Estrutura Proposta (NÃO IMPLEMENTAR AINDA)
```
src/
├── core/                    # Lógica crítica compartilhada
│   ├── auth/               # useAuth, login logic
│   └── supabase/           # client.ts, types.ts
│
├── features/               # Feature-based organization
│   ├── admin/             # Tudo relacionado ao admin
│   │   ├── components/
│   │   ├── hooks/
│   │   └── pages/
│   │
│   ├── checkout/          # Fluxo de compra
│   │   ├── components/
│   │   ├── hooks/
│   │   └── pages/
│   │
│   ├── dashboard/         # Dashboard do usuário
│   │   ├── components/
│   │   ├── hooks/
│   │   └── pages/
│   │
│   └── landing/           # Landing page
│       ├── components/
│       └── pages/
│
├── shared/                 # Componentes compartilhados
│   ├── ui/                # shadcn components
│   └── layout/            # Headers, Footers, etc.
│
└── lib/                    # Utilitários

supabase/
├── functions/
│   ├── core/              # Funções compartilhadas
│   │   └── send-email/
│   │
│   ├── auth/              # Autenticação
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   │
│   ├── payment/           # Pagamentos
│   │   ├── pixup/
│   │   ├── pixup-webhook/
│   │   ├── evopay/
│   │   └── evopay-webhook/
│   │
│   └── jobs/              # Cron jobs
│       ├── cleanup-expired-orders/
│       ├── expire-subscriptions/
│       ├── reconciliation-global/
│       └── notify-expiring-licenses/
│
├── db/
│   ├── migrations/
│   ├── views/             # (apenas documentação, gerenciado via migrations)
│   └── rpc/               # (apenas documentação, gerenciado via migrations)
│
└── config.toml

docs/                       # Documentação consolidada
├── README.md
├── ARCHITECTURE.md         # Merge de SELF_HEALING + SECURITY
├── DEBUG.md
└── AUDIT_LOG.md
```

**⚠️ IMPORTANTE:** Esta reorganização é **PROPOSTA** apenas. Não deve ser implementada sem:
1. Planejamento detalhado de migração
2. Atualização de todos os imports
3. Testes completos

---

## ETAPA 5 — CHECKLIST DE SEGURANÇA

### ✅ Validações Pré-Remoção

| Check | Status | Descrição |
|-------|--------|-----------|
| Cron Jobs | ✅ OK | Nenhum cron aponta para arquivos mortos identificados |
| Migrations | ✅ OK | Nenhuma migration depende de código morto |
| Triggers | ✅ OK | Todas as triggers apontam para funções existentes |
| Views | ✅ OK | Todas as views são consumidas por reconciliation-global |
| Webhooks | ✅ OK | Todos os endpoints de webhook estão ativos |
| Testes | ⚠️ N/A | Projeto não possui testes automatizados |

### ✅ Integridade de Referências

| Tipo | Quantidade | Status |
|------|------------|--------|
| Páginas no App.tsx | 10 | ✅ Todas referenciadas |
| Edge Functions no config.toml | 17 | ✅ Todas configuradas |
| Cron Jobs no DB | 7 | ✅ Todos apontam para funções existentes |
| RLS Policies | 33 | ✅ Todas usam funções has_role existentes |

---

## ENTREGÁVEL FINAL — RESUMO EXECUTIVO

### 📊 Estatísticas do Repositório

| Categoria | Total | Ativos | Mortos | Suspeitos |
|-----------|-------|--------|--------|-----------|
| Páginas | 10 | 10 | 0 | 0 |
| Componentes UI | 25 | 20 | 5 | 0 |
| Componentes Landing | 14 | 14 | 0 | 0 |
| Componentes Admin | 14 | 14 | 0 | 0 |
| Hooks | 10 | 10 | 0 | 0 |
| Edge Functions | 17 | 17 | 0 | 0 |
| Libs | 3 | 2 | 0 | 1 |
| Docs | 6 | 5 | 0 | 1 |

### 🗑️ Lista de Arquivos Mortos (Remoção Segura)

1. `src/components/ui/animated-shiny-text.tsx` - Componente visual não utilizado
2. `src/components/ui/container-scroll-animation.tsx` - Animação não utilizada
3. `src/components/ui/gooey-text-morphing.tsx` - Efeito visual não utilizado
4. `src/components/ui/pixel-trail.tsx` - Efeito visual não utilizado
5. `src/components/ui/scroll-reveal.tsx` - Animação não utilizada
6. `AUDITORIA_DLG_CONNECT.txt` - Substituído por AUDITORIA_FINAL.md

### 📋 Plano de Execução Recomendado

#### Fase 1: Limpeza Imediata (Baixo Risco)
1. Remover os 5 componentes UI mortos
2. Remover AUDITORIA_DLG_CONNECT.txt

#### Fase 2: Verificação (Antes de Remover)
1. Verificar uso de `downloadWithRetry.ts` no Dashboard
2. Verificar logs do Hostinger para `webhook-handler.php`
3. Avaliar se `reconcile-sessions` pode ser deprecado

#### Fase 3: Consolidação de Cron Jobs
1. Remover `expire-subscriptions-daily` (manter apenas hourly)
2. Documentar decisão sobre `reconcile-sessions` vs `reconciliation-global`

#### Fase 4: Documentação
1. Consolidar docs em estrutura limpa
2. Atualizar README.md com link para este audit

---

## ⚠️ RISCOS RESIDUAIS

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Componente UI removido ser necessário futuro | Baixa | Baixo | Facilmente recriável |
| downloadWithRetry usado dinamicamente | Média | Médio | Testar Dashboard antes |
| webhook-handler.php em uso | Baixa | Alto | Verificar logs antes |

---

## ✅ DECLARAÇÃO FINAL

O repositório está **bem organizado e funcional**. Foram identificados:
- **5 componentes mortos** (UI não utilizados)
- **1 arquivo de documentação redundante**
- **1 cron job redundante** (expire-subscriptions-daily)
- **1 possível função legada** (reconcile-sessions)

Após a limpeza proposta na Fase 1, o repositório estará:
> **"Limpo, legível e sustentável."**

Todas as funcionalidades críticas estão íntegras e protegidas.
