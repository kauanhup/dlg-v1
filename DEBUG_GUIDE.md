# Guia de Debug - DLG Connect

## Como Usar o Painel de Debug

### 1. Acesso
- Faça login como admin
- Vá para `/admin`
- Clique em "Debug" no menu lateral

### 2. Ferramentas Disponíveis

#### Sync Inventário
Sincroniza a contagem de sessões disponíveis na tabela `sessions_inventory` com a contagem real de arquivos em `session_files`.

Use quando:
- O estoque exibido não corresponde à realidade
- Após operações manuais no banco de dados

#### Verificar Saúde
Executa diagnóstico completo do sistema:
- ✅ Real-time ativo em todas as tabelas
- ✅ Inventário sincronizado (brasileiras e estrangeiras)
- ⚠️ Sessões reservadas antigas (precisam de limpeza)
- ⚠️ Pedidos pendentes antigos (podem ter expirado)

#### Forçar Limpeza
Libera sessões que foram reservadas mas o pedido expirou ou foi cancelado.
- Libera sessões com `status = 'reserved'` há mais de 30 minutos
- Atualiza pedidos expirados para `status = 'expired'`

#### Testar Real-time
Verifica se as subscriptions do Supabase estão funcionando:
- Cria um canal de teste
- Monitora por 5 segundos
- Reporta quantos eventos foram capturados

### 3. Verificação Regular

Execute "Verificar Saúde" diariamente para monitorar:
- ✅ Real-time ativo em todas as tabelas
- ✅ Inventário sincronizado
- ⚠️ Sessões reservadas antigas (executar limpeza se necessário)
- ⚠️ Pedidos pendentes antigos

### 4. Troubleshooting

#### Inventário dessincronizado
1. Clique em "Sync Inventário"
2. Aguarde confirmação
3. Verifique a saúde novamente

#### Sessões presas em "reserved"
1. Clique em "Forçar Limpeza"
2. Verifique quantas foram liberadas
3. Se persistir, use os comandos SQL manuais

#### Real-time não funciona
1. Execute "Testar Real-time"
2. Se nenhum evento for detectado após 5s:
   - Verifique se a tabela tem REPLICA IDENTITY FULL
   - Verifique se a tabela está na publicação supabase_realtime

## Comandos SQL Úteis

### Ver sessões reservadas antigas
```sql
SELECT id, type, reserved_at, reserved_for_order 
FROM session_files 
WHERE status = 'reserved' 
AND reserved_at < NOW() - INTERVAL '30 minutes';
```

### Liberar sessões manualmente
```sql
UPDATE session_files
SET status = 'available', reserved_for_order = NULL, reserved_at = NULL
WHERE status = 'reserved' 
AND reserved_at < NOW() - INTERVAL '30 minutes';
```

### Ver pedidos pendentes por usuário
```sql
SELECT user_id, COUNT(*) as pending_count
FROM orders
WHERE status = 'pending'
AND created_at > NOW() - INTERVAL '30 minutes'
GROUP BY user_id
HAVING COUNT(*) >= 3;
```

### Verificar sincronização de inventário
```sql
SELECT 
  si.type, 
  si.quantity as inventory,
  (SELECT COUNT(*) FROM session_files sf 
   WHERE sf.type = si.type AND sf.status = 'available') as actual
FROM sessions_inventory si;
```

### Habilitar real-time em uma tabela
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE nome_da_tabela;
```

## Testes Manuais Recomendados

### Teste 1: Upload de Sessão
1. Upload arquivo no admin
2. Em outra aba (usuário), verificar se atualiza

### Teste 2: Modo Manutenção
1. Usuário logado no dashboard
2. Admin ativa manutenção
3. Usuário deve ser desconectado em até 30s

### Teste 3: Reserva de Sessões
1. Admin: ter exatamente 5 sessões BR
2. User: tentar comprar 10
3. Deve falhar com erro apropriado

### Teste 4: Limite de Pedidos Pendentes
1. User: criar 3 pedidos pendentes sem pagar
2. User: tentar criar 4º pedido
3. Deve bloquear com mensagem de limite

## Edge Functions

### sync-sessions-inventory
- **Rota:** `/functions/v1/sync-sessions-inventory`
- **Método:** POST
- **Auth:** Bearer token (admin)
- **Função:** Sincroniza inventário com arquivos reais

### cleanup-expired-reservations
- **Rota:** `/functions/v1/cleanup-expired-reservations`
- **Método:** POST
- **Auth:** Bearer token (admin)
- **Função:** Libera sessões e expira pedidos antigos
