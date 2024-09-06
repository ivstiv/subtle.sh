# Self-hosting [Soketi](https://docs.soketi.app/) for subtle.sh

TO-DO: intro


## 1. Download the project files to get you started

```bash
DOCS_BRANCH=main
wget -O - https://github.com/ivstiv/subtle.sh/archive/$DOCS_BRANCH.tar.gz | tar -xz --strip=2 "subtle.sh-$DOCS_BRANCH/docs/self-host-soketi"
```

## 2. Replace the `your.domain` string with your domain
```bash
YOUR_DOMAIN=whatever.yourdomain.is
sed -i "s/your.domain/$YOUR_DOMAIN/g" nginx/nginx.conf
```

## 3. Generate a Let's Encrypt certificate


## 999. Didn't work?
 - Check logs: `docker compose logs`
 - Check containers: `docker compose ps`
 - Check Nginx logs: `docker compose exec nginx cat /var/log/nginx/error.log`
 - Ping me on Discord: [Invite](to-do)


