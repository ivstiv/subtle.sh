# Self-hosting [Soketi](https://docs.soketi.app/) for subtle.sh

The docs assume you have a domain and a server running Ubuntu 22.04.
 - The server has docker installed
 - The server has a domain pointing to it
 - **If you are using a different OS or utilise cloudflare's ssl, you will need to adjust the commands accordingly.**


### 1. Download the project files to get you started

```bash
mkdir soketi
cd soketi
DOCS_BRANCH=self-host-soketi
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
```bash
docker compose run --rm  certbot certonly --webroot --webroot-path /var/www/certbot/ -d "$YOUR_DOMAIN"
```

### 6. Stop the certbot webserver used for the generation
```bash
docker compose stop webserver-certbot
```

### 7. Start the web socket service
```bash
docker compose up -d subtle-soketi
```


### 998. Renew the certificate
```bash
docker compose run --rm  certbot renew
```

### 999. Didn't work?
 - Check logs: `docker compose logs`
 - Check containers: `docker compose ps`
 - Check Nginx logs: `docker compose exec nginx cat /var/log/nginx/error.log`
 - Ping me on Discord: [Invite](to-do)


