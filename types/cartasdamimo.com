server {
    listen 80;
    server_name mimomeueseu.com www.mimomeueseu.com;

    # Redireciona tudo para HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name mimomeueseu.com www.mimomeueseu.com;

    ssl_certificate /etc/letsencrypt/live/mimomeueseu.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mimomeueseu.com/privkey.pem;

    # Aqui está o proxy correto para o Next.js na porta 3001
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # As rotas de API também precisam ser enviadas ao servidor Node
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Também garante que _next/ e assets vão pro mesmo servidor
    location /_next/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
    }

    # Logs (opcional)
    access_log /var/log/nginx/mimomeueseu.access.log;
    error_log /var/log/nginx/mimomeueseu.error.log;
}
