# 🔐 Configurações de Segurança - DLG Connect

**Última Atualização:** 2025-12-23  
**Versão:** 2.0 - Arquitetura Imutável

---

## 🏗️ ARQUITETURA DE IMUTABILIDADE

### Plan Snapshot System
Implementado para garantir que alterações administrativas em planos NÃO afetem compras em andamento.

**Colunas em `orders`:**

| Coluna | Tipo | Propósito |
|--------|------|-----------|
| `plan_period_days` | INTEGER | Período do plano em dias (para calcular end_date) |
| `plan_id_snapshot` | UUID | Referência imutável ao plano comprado |
| `plan_features_snapshot` | JSONB | Features prometidas ao usuário |

**Fluxo:**
```
Checkout.tsx         →  Cria order COM snapshot  →  Webhook processa
                                                         ↓
                                          complete_order_atomic usa SNAPSHOT
                                                (ignora subscription_plans)
```

**Fallback para Ordens Legadas:**
Se `plan_period_days` é NULL, a RPC busca por nome/preço (compatibilidade reversa).

---

## 📊 CONTRATO: licenses vs user_subscriptions

### Decisão Arquitetural
**Manter ambas tabelas com contrato formal de sincronização.**

### Justificativa
1. Unificar exigiria migração de dados e refatoração de múltiplos hooks
2. Ambas servem propósitos diferentes (acesso vs billing)
3. Risco de breaking change em produção

### Contrato Formal

| Tabela | Propósito | Autoritativa Para |
|--------|-----------|-------------------|
| `licenses` | Controle de acesso | Pode baixar bot? Pode acessar features? |
| `user_subscriptions` | Tracking de billing | Renovações, upgrades, joins com planos |

### Regras de Sincronização

1. **`complete_order_atomic`** é a ÚNICA função que cria/atualiza ambas
2. Toda modificação de status deve passar pela RPC
3. Nunca modificar uma tabela sem a outra
4. Em caso de inconsistência, `licenses` é verdade para acesso

---

## ✅ Configurações Já Aplicadas no Código

### 1. Plan Snapshot (NOVO)
- **Arquivos:** `Checkout.tsx`, `complete_order_atomic`
- **Status:** ✅ Implementado
- **Descrição:** Dados do plano são snapshotados na criação da order

### 2. Webhooks com Validação HMAC
- **Arquivos:** `supabase/functions/pixup-webhook/index.ts`, `supabase/functions/evopay-webhook/index.ts`
- **Status:** ✅ Implementado
- **Descrição:** Webhooks BLOQUEIAM requisições com assinatura inválida (HTTP 401)

### 3. Webhook Hardening (NOVO)
- **Arquivos:** Ambos webhooks
- **Status:** ✅ Implementado
- **Descrição:** INSERT em `processed_webhooks` trata conflitos explicitamente

### 4. Reserva Atômica de Sessions
- **Arquivo:** `src/pages/Checkout.tsx` + RPC `reserve_sessions_atomic`
- **Status:** ✅ Implementado
- **Descrição:** Usa `FOR UPDATE SKIP LOCKED` para prevenir race conditions

### 5. Rate Limiting em Edge Functions
- **Arquivos:** Todos os webhooks
- **Status:** ✅ Implementado
- **Descrição:** 60 requisições/minuto por IP

### 6. Idempotência de Webhooks
- **Tabela:** `processed_webhooks` com UNIQUE INDEX `(transaction_id, gateway)`
- **Status:** ✅ Implementado + Testado (burst test 50 webhooks)
- **Descrição:** Previne processamento duplicado de webhooks

### 7. RLS (Row Level Security)
- **Status:** ✅ Todas as tabelas têm RLS ativado
- **Políticas:** Usuários só acessam próprios dados, admins têm acesso total

### 8. Amount Mismatch Protection
- **Status:** ✅ Implementado
- **Descrição:** Webhook BLOQUEIA transação se valor diverge (HTTP 400)

---

## ⚠️ Configurações Pendentes (Requerem Ação Manual)

### 1. Leaked Password Protection
**Prioridade:** 🟡 BAIXA (senhas já validadas no código)

**Como ativar:**
1. Acesse o painel do Lovable Cloud (botão "View Backend")
2. Vá para: Authentication > Settings
3. Seção "Password Security"
4. Ative: "Check passwords against Pwned Passwords database"

### 2. Extensions em Schema Dedicado
**Prioridade:** 🟢 MUITO BAIXA

**Problema:** Extensions estão no schema `public` (warning cosmético).

**Nota:** Não afeta funcionalidade. Apenas melhoria de organização.

---

## 🧪 Testes de Validação Realizados

### Burst Test (50 Webhooks Idênticos)
```
Resultado:
- 1 order completed
- 1 license criada
- 1 subscription criada
- 1 registro em processed_webhooks
- 49 respostas "already_processed"
✅ PASSOU
```

### Reserva Atômica de Sessions
```javascript
// 5 compras simultâneas das últimas 2 sessions
const results = await Promise.all(promises);
// Apenas 1 teve success: true
// 4 receberam "Estoque insuficiente"
✅ PASSOU
```

---

## 📋 Checklist de Segurança Final

| Item | Status |
|------|--------|
| RLS em todas as tabelas | ✅ |
| Validação HMAC em webhooks | ✅ |
| Rate limiting em endpoints | ✅ |
| Idempotência de webhooks | ✅ |
| Reserva atômica de sessions | ✅ |
| Plan snapshot em orders | ✅ |
| complete_order_atomic usa snapshot | ✅ |
| Amount mismatch bloqueia | ✅ |
| Webhook INSERT trata conflitos | ✅ |
| Contrato licenses/subscriptions documentado | ✅ |
| Leaked password protection | ⚠️ Manual |
| Extensions em schema dedicado | ⚠️ Opcional |

---

## 🎯 Riscos Residuais

| Risco | Probabilidade | Mitigação |
|-------|--------------|-----------|
| Ordens legadas sem snapshot | Baixa | Fallback busca por nome/preço |
| Inconsistência licenses/subscriptions | Muito Baixa | Toda modificação via RPC atômica |
| Gateway retorna PIX após expiração | Baixa | Cleanup cancela ordem, webhook ignora |

---

## 📅 Histórico de Versões

| Data | Versão | Mudanças |
|------|--------|----------|
| 2025-12-23 | 2.0 | Plan snapshot, webhook hardening, contrato de dados |
| 2025-12-22 | 1.0 | Versão inicial com RLS e validações básicas |
