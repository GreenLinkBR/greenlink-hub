# Instruções de Deploy - GreenLink Hub

## Build do Projeto

O build foi concluído com sucesso. Os arquivos estão localizados na pasta `dist/`.

### Arquivos Gerados

- `dist/index.html` - Página inicial
- `dist/assets/` - Arquivos CSS, JS e imagens otimizados

## Deploy na Hostinger

### Método 1: Upload via FTP/SFTP

1. Acesse o painel da Hostinger
2. Vá em "Arquivos" > "Gerenciador de Arquivos" ou use um cliente FTP como FileZilla
3. Navegue até a pasta `public_html/` do seu domínio
4. Faça upload de TODO o conteúdo da pasta `dist/` para a pasta `public_html/`
5. Certifique-se de que o arquivo `index.html` está na raiz de `public_html/`

### Método 2: Usando o GitHub (Se configurado)

1. Certifique-se de que o repositório está atualizado no GitHub
2. No painel da Hostinger, vá em "Avançado" > "Git"
3. Configure o deploy automático a partir do repositório
4. O deploy será feito automaticamente a cada push para a branch principal

### Configuração do .htaccess (SPA - Single Page Application)

Crie um arquivo `.htaccess` na pasta `public_html/` com o seguinte conteúdo:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Compressão gzip
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript text/javascript application/json
</IfModule>

# Cache de recursos estáticos
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

## Verificação Pós-Deploy

Após o deploy, verifique os seguintes pontos:

1. **Acesse o site**: https://greenlinkbr.shop
2. **Verifique se a página carrega corretamente**
3. **Teste o login** com credenciais válidas
4. **Verifique se o menu de usuário aparece** no canto superior direito
5. **Teste o logout** e verifique se redireciona para a página de login
6. **Verifique o console do navegador** por erros de JavaScript

## Troubleshooting

### Erro 403 Forbidden
- Verifique se o arquivo `index.html` existe na raiz do `public_html`
- Verifique as permissões dos arquivos (devem ser 644 para arquivos e 755 para pastas)

### Erro 404 em rotas
- Verifique se o arquivo `.htaccess` está configurado corretamente
- Certifique-se de que o mod_rewrite está habilitado no servidor

### Página em branco
- Verifique o console do navegador por erros de JavaScript
- Verifique se todos os arquivos da pasta `dist/` foram enviados
- Verifique se os caminhos dos arquivos estão corretos (case-sensitive)

## Contato para Suporte

Em caso de problemas, entre em contato com a equipe de desenvolvimento.
