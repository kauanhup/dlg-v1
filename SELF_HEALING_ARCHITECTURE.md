# SELF-HEALING PRODUCTION ARCHITECTURE

**Última atualização:** 2024-12-23  
**Autor:** Staff Engineer  
**Status:** ✅ IMPLEMENTADO E ATIVO

---

## 🎯 OBJETIVO

Sistema à prova de falhas que se auto-corrige, garantindo:
- ✅ Nenhum pagamento pago fica sem acesso
- ✅ Nenhum acesso existe sem pagamento válido
- ✅ Nenhuma alteração manual quebra consistência
- ✅ Nenhum estado inválido existe silenciosamente

---

## 1️⃣ JOB DE RECONCILIAÇÃO GLOBAL

### Edge Function: `reconciliation-global`

**Frequência:** A cada 5 minutos (cron job configurado)

**Categorias de Reconciliação:**

| # | Categoria | Detecção | Correção |
|---|-----------|----------|----------|
| 1 | `payments_paid_orders_incomplete` | Payment=paid AND Order≠completed | Executa `complete_order_atomic` |
| 2 | `orders_completed_no_license` | Order=completed AND License inexistente | Cria license baseada no snapshot |
| 3 | `licenses_without_subscription` | License=active AND Subscription inexistente | Cria subscription correspondente |
| 4 | `subscriptions_without_license` | Subscription=active AND License inexistente | Cria license correspondente |
| 5 | `expired_orders_with_reservations` | Order IN (cancelled,expired,refunded) AND Reservas existem | Libera reservas |
| 6 | `orphaned_sessions` | Session reserved > 30min OR sem order válida | Libera reservas |
| 7 | `expired_licenses_still_active` | License.end_date < NOW() AND status=active | Marca como expired |
| 8 | `expired_subscriptions_still_active` | Subscription.next_billing_date < NOW() AND status=active | Marca como expired |

**Garantias:**
- Toda correção gera `audit_logs`
- Correções são idempotentes
- Histórico em `reconciliation_runs`
- Nada é apagado silenciosamente

### Queries de Detecção (podem ser executadas manualmente)

```sql
-- Payments pagos sem order completa
SELECT * FROM health_payments_without_completion;

-- Licenses que deveriam estar expiradas
SELECT * FROM health_licenses_should_expire;

-- Divergência license/subscription
SELECT * FROM health_license_subscription_divergence;

-- Reservas órfãs
SELECT * FROM health_orphaned_reservations;

-- Dashboard resumido
SELECT * FROM health_dashboard_summary;
```

---

## 2️⃣ STATE MACHINE (Transições Formais)

### Orders

```
┌─────────┐
│ pending │
└────┬────┘
     │
     ├────────► completed ────► refunded
     │
     ├────────► cancelled
     │
     └────────► expired
```

**Transições Permitidas:**
- `pending` → `completed`, `cancelled`, `expired`
- `completed` → `refunded`
- Estados terminais: `cancelled`, `expired`, `refunded`

### Payments

```
┌─────────┐
│ pending │
└────┬────┘
     │
     ├────────► paid ────────► refunded
     │
     ├────────► cancelled
     │
     ├────────► expired
     │
     └────────► failed ────────► pending (retry)
```

### Licenses & Subscriptions

```
┌────────┐
│ active │
└───┬────┘
    │
    ├────────► expired
    │
    ├────────► cancelled
    │
    └────────► suspended ────► active (reativação)
                          └──► cancelled
```

### Enforcement

Triggers `BEFORE UPDATE` bloqueiam transições inválidas com mensagem clara:

```
ERROR: Invalid order status transition: pending -> refunded is not allowed. Allowed: ["completed", "cancelled", "expired"]
```

---

## 3️⃣ ADMIN-SAFE (Auditoria Automática)

### Tabelas Críticas com Auditoria Automática

| Tabela | Trigger |
|--------|---------|
| `orders` | `audit_orders_changes` |
| `payments` | `audit_payments_changes` |
| `licenses` | `audit_licenses_changes` |
| `user_subscriptions` | `audit_subscriptions_changes` |

**Comportamento:**
- Todo INSERT, UPDATE, DELETE gera registro em `audit_logs`
- Registra: operação, dados antigos, dados novos, timestamp, trigger
- User ID capturado via `auth.uid()` ou `00000000...` para sistema

### RPCs Autorizadas

| RPC | Propósito |
|-----|-----------|
| `complete_order_atomic` | Única forma de completar orders |
| `reserve_sessions_atomic` | Única forma de reservar sessions |
| `release_session_reservation` | Única forma de liberar reservas |

---

## 4️⃣ VERSIONAMENTO DE ORDERS

### Coluna: `order_version`

| Versão | Descrição | Snapshot |
|--------|-----------|----------|
| 1 | Legacy (antes de 2024-12) | Pode faltar `plan_period_days`, `plan_id_snapshot` |
| 2 | Atual | Snapshot completo garantido |

### Comportamento no `complete_order_atomic`

```sql
-- v2: Usa snapshot diretamente (determinístico)
IF order_version = 2 THEN
  _plan_period := order.plan_period_days;
  _plan_name := order.product_name;
END IF;

-- v1: Fallback para subscription_plans (legado)
IF order_version = 1 AND plan_period_days IS NULL THEN
  SELECT period INTO _plan_period FROM subscription_plans WHERE name = order.product_name;
END IF;
```

### Regra de Deprecação

- **Data limite para remover fallback v1:** 2025-03-01
- **Condição:** Nenhum order v1 em status `pending`
- **Query de verificação:**
  ```sql
  SELECT COUNT(*) FROM orders WHERE order_version = 1 AND status = 'pending';
  -- Quando = 0, fallback pode ser removido
  ```

---

## 5️⃣ HEALTH CHECKS OPERACIONAIS

### Views Disponíveis

| View | Descrição | Alerta |
|------|-----------|--------|
| `health_pending_orders` | Orders pending > 15min | WARNING > 15min, CRITICAL > 60min |
| `health_payments_without_completion` | Payments paid sem order completed | CRITICAL |
| `health_licenses_should_expire` | Licenses ativas após end_date | Horas de atraso |
| `health_license_subscription_divergence` | License/Subscription dessincronizados | DIVERGENT |
| `health_orphaned_reservations` | Sessions reservadas órfãs | NO_ORDER, INVALID_STATUS, TIMEOUT |
| `health_recent_reconciliations` | Correções últimas 24h | Contagem |
| `health_dashboard_summary` | Resumo geral | Todos os alertas |

### Query de Health Check Completo

```sql
SELECT 
  CASE WHEN pending_orders_alert > 0 THEN '🔴' ELSE '🟢' END AS orders,
  CASE WHEN payments_without_completion > 0 THEN '🔴' ELSE '🟢' END AS payments,
  CASE WHEN licenses_should_expire > 0 THEN '🟡' ELSE '🟢' END AS licenses,
  CASE WHEN divergent_users > 0 THEN '🔴' ELSE '🟢' END AS sync,
  CASE WHEN orphaned_reservations > 0 THEN '🟡' ELSE '🟢' END AS reservations,
  reconciliations_24h AS corrections_24h,
  checked_at
FROM health_dashboard_summary;
```

### Limites Aceitáveis

| Métrica | OK | WARNING | CRITICAL |
|---------|-----|---------|----------|
| Orders pending | < 15min | 15-60min | > 60min |
| Payments sem completion | 0 | 1-2 | > 2 |
| Licenses para expirar | 0 | 1-5 | > 5 |
| Usuários divergentes | 0 | 1-2 | > 2 |
| Reservas órfãs | 0 | 1-5 | > 5 |

---

## 📊 CRON JOBS ATIVOS

| Job | Frequência | Função |
|-----|------------|--------|
| `cleanup-expired-orders` | */5 * * * * | Expira orders pending antigas |
| `expire-subscriptions-hourly` | 0 * * * * | Expira subscriptions vencidas |
| `cleanup-expired-reservations` | */10 * * * * | Libera reservas timeout |
| `reconcile-sessions-job` | */10 * * * * | Reconcilia sessions órfãs |
| `reconciliation-global-job` | */5 * * * * | **Reconciliação global completa** |
| `notify-expiring-licenses` | 0 9 * * * | Notifica licenças expirando |

---

## ⚠️ O QUE NÃO PODE SER AUTO-CORRIGIDO

| Situação | Motivo | Ação Necessária |
|----------|--------|-----------------|
| Plan inexistente no sistema | Dados inconsistentes | Verificação manual |
| User inexistente | FK violada | Verificação manual |
| Transação duplicada | Já processada | Nenhuma (idempotente) |
| Webhook perdido | Nunca chegou | Retry manual ou suporte gateway |

---

## ✅ GARANTIA FINAL

> "Mesmo se tudo der errado hoje, amanhã o sistema acorda consistente."

O sistema:
1. Detecta inconsistências a cada 5 minutos
2. Corrige automaticamente o que pode
3. Registra tudo em audit_logs
4. Bloqueia transições de estado inválidas
5. Audita toda modificação manual
6. Diferencia orders legados de novos
7. Fornece health checks em tempo real

---

## 📁 ARQUIVOS RELACIONADOS

- `supabase/functions/reconciliation-global/index.ts` - Job principal
- `supabase/migrations/*` - State machine, triggers, views
- `src/pages/Checkout.tsx` - Criação de orders v2
- `SECURITY_CONFIG.md` - Configuração de segurança
- `AUDITORIA_FINAL.md` - Relatório de auditoria
