# 📦 Guia de Deploy - DLG Connect

## Estrutura de Arquivos

```
📁 Seu Projeto
│
├── 📂 hostinger-proxy/     ← SUBA ESTES PARA HOSTINGER
│   ├── config.php          ← Configure suas credenciais AQUI
│   ├── bot-api.php         ← API do Bot
│   ├── webhook-asaas.php   ← Webhook da Asaas
│   └── .htaccess           ← Configuração do Apache
│
├── 📂 src/                 ← FAÇA BUILD DESTES (vira HTML/CSS/JS)
├── 📂 public/              ← 
└── 📂 DLG_CONNECT/         ← COMPILE EM .EXE (fica no PC do cliente)
```

---

## 🚀 Passo a Passo

### 1️⃣ Configurar Credenciais

Abra o arquivo `config.php` e preencha:

```php
// Pegue no Supabase Dashboard → Settings → API → service_role
define('SUPABASE_SERVICE_KEY', 'eyJhbGc...');

// Crie uma senha forte para o bot
define('BOT_API_SECRET', 'dlg_bot_2024_MinhaChaveSecreta123');

// Se usar PixUp
define('PIXUP_PROXY_SECRET', 'sua_chave_pixup');

// Se usar Asaas
define('ASAAS_API_KEY', 'sua_api_key_asaas');
```

### 2️⃣ Subir Arquivos PHP para Hostinger

1. Acesse o **hPanel** da Hostinger
2. Vá em **Gerenciador de Arquivos**
3. Entre em `public_html`
4. Crie uma pasta chamada `api`
5. Suba os arquivos:
   - `config.php`
   - `bot-api.php`
   - `webhook-asaas.php`
   - `.htaccess`

**Estrutura final na Hostinger:**
```
public_html/
├── api/
│   ├── config.php
│   ├── bot-api.php
│   ├── webhook-asaas.php
│   └── .htaccess
└── (resto do site vai aqui depois)
```

### 3️⃣ Fazer Build do Site React

No terminal do projeto:

```bash
npm run build
```

Isso cria uma pasta `dist/` com o site compilado.

### 4️⃣ Subir o Site para Hostinger

1. Baixe a pasta `dist/` gerada
2. No **Gerenciador de Arquivos** da Hostinger
3. Suba TODO o conteúdo de `dist/` para `public_html/`

**NÃO suba a pasta dist, suba o CONTEÚDO dela!**

### 5️⃣ Compilar o Bot Python

No terminal, dentro da pasta `DLG_CONNECT/`:

```bash
pip install pyinstaller
pyinstaller --onefile --windowed main.py
```

O `.exe` será criado em `dist/main.exe`

---

## 🔗 URLs Finais

Após o deploy, suas URLs serão:

| Serviço | URL |
|---------|-----|
| Site | `https://seudominio.com/` |
| Bot API | `https://seudominio.com/api/bot-api.php` |
| Webhook Asaas | `https://seudominio.com/api/webhook-asaas.php` |

---

## 🔐 Onde Pegar as Credenciais

### SUPABASE_SERVICE_KEY
1. Acesse seu projeto no Lovable
2. Clique em "Cloud" (ícone de nuvem)
3. Vá em Settings → API
4. Copie a `service_role` key (NÃO a anon key!)

### BOT_API_SECRET
- Crie você mesmo uma senha forte
- Use letras, números e símbolos
- Exemplo: `dlg_2024_X7kM9pQ2rT5w`
- Esta mesma chave deve ir no bot Python

---

## ⚠️ Importante

1. **NUNCA** compartilhe o `config.php`
2. **NUNCA** commite credenciais no GitHub
3. O `config.php` deve estar FORA do acesso público
4. Configure o `.htaccess` para bloquear acesso direto

---

## 🧪 Testar a API

Teste se está funcionando:

```bash
curl -X POST https://seudominio.com/api/bot-api.php \
  -H "Content-Type: application/json" \
  -d '{"action": "check_trial", "api_key": "SUA_BOT_API_SECRET", "device_fingerprint": "teste123"}'
```

Resposta esperada:
```json
{
  "success": true,
  "trial": {
    "exists": false,
    "eligible": true
  }
}
```

---

## 📞 Suporte

Se tiver problemas:
1. Verifique se o PHP está habilitado na Hostinger
2. Confira se as credenciais estão corretas
3. Teste no modo DEBUG (mude `DEBUG_MODE` para `true` no config.php)
