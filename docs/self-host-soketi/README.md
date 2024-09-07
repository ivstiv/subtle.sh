# Self-hosting [Soketi](https://docs.soketi.app/) for subtle.sh

The backend of [subtle.sh](https://subtle.sh) is powered by [Soketi](https://soketi.app/) which is an open-source alternative to Pusher. You can host your own instance of Soketi to keep your data private. This guide will help you get started. At the end of it you will have a websocket server running on your domain with an [Nginx](https://nginx.org/en/) proxy to handle SSL certificates. Renting a cheap $5-10 VPS from any provider will be more than enough to handle the traffic of a couple hundred users.

The docs assume you have a domain and a server running Ubuntu 22.04.

- The server has docker installed
- The server has a domain pointing to it
- **If you are using a different OS or utilise cloudflare's ssl, you will need to adjust the commands accordingly.**

### 1. Download the project files to get you started

```bash
mkdir soketi
cd soketi
DOCS_BRANCH=main
wget -O - https://github.com/ivstiv/subtle.sh/archive/$DOCS_BRANCH.tar.gz | tar -xz --strip=3 "subtle.sh-$DOCS_BRANCH/docs/self-host-soketi"
```

### 2. Replace the `your.domain` string with your domain

```bash
YOUR_DOMAIN=whatever.yourdomain.is
sed -i "s/your.domain/$YOUR_DOMAIN/g" nginx/nginx.conf
sed -i "s/your.domain/$YOUR_DOMAIN/g" nginx-certbot/nginx.conf
```

### 3. Open ports in your firewall (if you're using one, example for ubuntu)

```bash
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### 4. Do a dry run for Let's Encrypt to generate folder structure and ensure there are no errors

```bash
docker compose run --rm  certbot certonly --webroot --webroot-path /var/www/certbot/ --dry-run -d "$YOUR_DOMAIN" --register-unsafely-without-email
```

You should see something like this (if you don't something went wrong, fix before proceeding):

```
Simulating a certificate request for test.subtle.sh
The dry run was successful.
```

### 5. Actually generate the certificate

If you don't care about getting email reminders, you can generate the certificate with the `--register-unsafely-without-email` flag.

```bash
docker compose run --rm  certbot certonly --webroot --webroot-path /var/www/certbot/ -d "$YOUR_DOMAIN"
```

### 6. Stop the certbot webserver used for the generation

```bash
docker compose stop webserver-certbot
```

### 7. Configure the app key and secret in the docker-compose.yml file

May be just generate 3 random [UUIDs](https://www.uuidgenerator.net/), should be enough.

```
SOKETI_DEFAULT_APP_ID: "your-app-id"
SOKETI_DEFAULT_APP_KEY: "your-app-key"
SOKETI_DEFAULT_APP_SECRET: "your-app-secret"
```

### 8. Start the web socket service

```bash
docker compose up -d subtle-soketi
```

## Useful commands

### Check if the websocket service works

```bash
websocat "wss://your-domain/app/your-app-key"
```

### Renew certificates

```bash
docker compose run --rm  certbot renew
```

### Restart the services

**Do it always after renewing certificates or making changes to environment variables**

```bash
docker compose down
docker compose up -d subtle-soketi
```

## Didn't work?

- Check logs: `docker compose logs <service-name>` (subtle-soketi, webserver, etc. check docker-compose.yml)
- Check containers: `docker ps`
- Ping me on Discord: [Invite](https://discord.gg/VMSDGVD)
