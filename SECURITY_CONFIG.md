# 🔐 Configurações de Segurança - DLG Connect

Este documento lista todas as configurações de segurança que devem ser aplicadas ao projeto.

---

## ✅ Configurações Já Aplicadas no Código

### 1. Webhooks com Validação HMAC (CORRIGIDO)
- **Arquivos:** `supabase/functions/pixup-webhook/index.ts`, `supabase/functions/evopay-webhook/index.ts`
- **Status:** ✅ Implementado
- **Descrição:** Webhooks agora BLOQUEIAM requisições com assinatura inválida (HTTP 401)

### 2. Reserva Atômica de Sessions (CORRIGIDO)
- **Arquivo:** `src/pages/Checkout.tsx` + RPC `reserve_sessions_atomic`
- **Status:** ✅ Implementado
- **Descrição:** Usa `FOR UPDATE SKIP LOCKED` para prevenir race conditions

### 3. Rate Limiting em Edge Functions
- **Arquivos:** Todos os webhooks
- **Status:** ✅ Implementado
- **Descrição:** 60 requisições/minuto por IP

### 4. Idempotência de Webhooks
- **Tabela:** `processed_webhooks`
- **Status:** ✅ Implementado
- **Descrição:** Previne processamento duplicado de webhooks

### 5. RLS (Row Level Security)
- **Status:** ✅ Todas as tabelas têm RLS ativado
- **Políticas:** Usuários só acessam próprios dados, admins têm acesso total

### 6. Trigger de Criação de Perfil
- **Trigger:** `on_auth_user_created`, `on_auth_user_email_confirmed`
- **Status:** ✅ Ativo
- **Descrição:** Cria perfil e role automaticamente após confirmação de email

---

## ⚠️ Configurações Pendentes (Requerem Ação Manual)

### 1. Leaked Password Protection
**Prioridade:** 🔴 ALTA

**Como ativar:**
1. Acesse o painel do Lovable Cloud (botão "View Backend" abaixo)
2. Vá para: Authentication > Settings
3. Seção "Password Security"
4. Ative: "Check passwords against Pwned Passwords database"
5. Defina Severity como: "Error" (bloqueia senhas comprometidas)

**Impacto:** Previne que usuários usem senhas já vazadas em data breaches.

---

### 2. Extensions em Schema Dedicado
**Prioridade:** 🟡 MÉDIA

**Problema:** Extensions estão no schema `public`, o que pode causar conflitos.

**Solução:** Executar via SQL Editor no Lovable Cloud:
```sql
-- Criar schema dedicado para extensions
CREATE SCHEMA IF NOT EXISTS extensions;

-- Mover extensions (executar uma por vez)
-- Primeiro verificar quais existem:
SELECT extname FROM pg_extension WHERE extname NOT IN ('plpgsql');

-- Exemplo para uuid-ossp (se existir):
-- ALTER EXTENSION "uuid-ossp" SET SCHEMA extensions;
```

**Nota:** Algumas extensions não podem ser movidas após instalação. Nesse caso, aceitar o warning.

---

### 3. Session Timeout
**Prioridade:** 🟡 MÉDIA

**Configuração recomendada:**
- Session timeout: 7 dias (604800 segundos)
- Refresh token rotation: Ativado

**Como configurar:**
1. Acesse o painel do Lovable Cloud
2. Authentication > Settings
3. Configure os valores de timeout

---

### 4. Email Rate Limiting
**Prioridade:** 🟡 MÉDIA

**Configuração recomendada:**
- Máximo 4 emails por hora por usuário
- Previne spam de emails de verificação

**Como configurar:**
1. Acesse o painel do Lovable Cloud
2. Authentication > Rate Limits
3. Configure o limite de envio de emails

---

## 📊 Checklist de Segurança

| Item | Status | Responsável |
|------|--------|-------------|
| RLS em todas as tabelas | ✅ | Automático |
| Validação HMAC em webhooks | ✅ | Código |
| Rate limiting em endpoints | ✅ | Código |
| Idempotência de webhooks | ✅ | Código |
| Reserva atômica de sessions | ✅ | Código |
| Trigger de criação de perfil | ✅ | Automático |
| Leaked password protection | ⚠️ | Manual |
| Extensions em schema dedicado | ⚠️ | Manual |
| Session timeout configurado | ⚠️ | Manual |
| Email rate limiting | ⚠️ | Manual |

---

## 🧪 Testes de Validação

### Testar Leaked Password Protection
```javascript
// Tentar criar conta com senha vazada comum
// Deve retornar erro se proteção estiver ativa
const { error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'Password123!' // Senha comum vazada
});
// Esperado: error.message contendo "password" ou "compromised"
```

### Testar Rate Limiting de Webhook
```bash
# Enviar mais de 60 requisições em 1 minuto
for i in {1..70}; do
  curl -X POST https://[PROJECT_URL]/functions/v1/pixup-webhook \
    -H "Content-Type: application/json" \
    -d '{"test": true}'
done
# Após ~60 requisições, deve retornar HTTP 429
```

### Testar Reserva Atômica
```javascript
// Simular 5 compras simultâneas das últimas 2 sessions
const promises = Array(5).fill(null).map(() => 
  supabase.rpc('reserve_sessions_atomic', {
    p_session_type: 'brasileiras',
    p_quantity: 2,
    p_order_id: crypto.randomUUID()
  })
);
const results = await Promise.all(promises);
// Apenas 1 deve ter success: true
```

---

## 📅 Última Atualização
- **Data:** 2025-12-23
- **Versão:** 1.0
- **Autor:** Sistema de Auditoria DLG Connect
