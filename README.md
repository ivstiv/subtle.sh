# subtle.sh

## Development

To run the app locally, you need to have `pnpm` installed. Then, you can install the dependencies and start the development server with:

```bash
cp .env.example .env
pnpm install --frozen-lockfile
pnpm dev
```

## Why not supporting disconnect events?

Having a refresh button is a good compromise. Otherwise there are two ways to go about this:

1. Use pusher presence channels (less work)

- needs authorization endpoint
- needs ngrok to tunnel the requests to that endpoint on dev
- the only reason for the endpoint to exist is to abide to the pusher protocol (no security enhancements)
- if I am going to be doing that I might as well build a full dockerised dev env

2. DIY websocket server with redis

- too much effort for a simple feature
