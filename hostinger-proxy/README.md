# Proxy PixUp para Hostinger

Este proxy resolve o problema de IP dinâmico do Supabase Edge Functions, permitindo que suas requisições PIX passem por um IP fixo da Hostinger.

## Estrutura

```
public_html/
├── api/
│   └── proxy-pixup.php   ← Upload este arquivo
└── (resto do seu site)
```

## Configuração

### 1. Upload do arquivo

1. Acesse o **hPanel** da Hostinger
2. Vá em **Gerenciador de Arquivos**
3. Crie a pasta `api` dentro de `public_html`
4. Faça upload do arquivo `proxy-pixup.php` para `public_html/api/`

### 2. Configure a chave secreta

Edite o arquivo `proxy-pixup.php` e altere:

```php
define('PROXY_SECRET', 'SUA_CHAVE_SECRETA_AQUI');
```

Use uma chave forte, por exemplo:
```
define('PROXY_SECRET', 'swx_proxy_2024_Xk9mP2nQ7rT3wY5z');
```

### 3. Configure o Secret

Adicione um **secret** com o nome `PIXUP_PROXY_SECRET` contendo a mesma chave.

### 4. Configure o IP na PixUp

1. Acesse o painel da PixUp/BSPAY
2. Em configurações de IP whitelist, adicione o IP do seu servidor Hostinger
3. Para descobrir o IP, rode no terminal SSH da Hostinger:
   ```bash
   curl ifconfig.me
   ```

## URL do Proxy

Após o upload, sua URL será:
```
https://seudominio.com/api/proxy-pixup.php
```

## Testando

Você pode testar com curl:

```bash
curl -X POST https://seudominio.com/api/proxy-pixup.php \
  -H "Content-Type: application/json" \
  -H "X-Proxy-Secret: SUA_CHAVE_SECRETA" \
  -d '{"action": "test_connection", "client_id": "seu_client_id", "client_secret": "seu_client_secret"}'
```

## Segurança

- O proxy valida todas as requisições usando o header `X-Proxy-Secret`
- Requisições sem a chave correta são rejeitadas com erro 401
- Nunca exponha a `PROXY_SECRET` no frontend
- A chave deve ser usada apenas pelo Supabase Edge Function

## Fluxo

```
[Frontend] → [Supabase Edge Function] → [Proxy Hostinger] → [BSPAY API]
                                              ↑
                                         IP Fixo
```
