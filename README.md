# subtle.sh

Discovered openpgp.js and soketi, and thought it would be fun to build an E2E encrypted app. Next time you're sending a secret over Slack, email, or any other plain text messaging, remember you have easy alternatives. Whether you choose subtle.sh or a pigeon is up to you, but here are some points to help you decide:

- a pigeon is great but not zero-config.
- subtle.sh is less likely to get intercepted.
- Both support custom servers, but a pigeon offers a wider range of supported providers.
- subtle.sh uses a more modern tech stack (Next.js, Soketi, React, Tailwind).
- a pigeon is more established and has long-term support.

All jokes aside, this could be genuinely useful if you don’t share a password vault with someone and need to quickly send credentials. No installation or setup required—just generate a fresh session and share it. Once the tab is closed, all keys are discarded, and the secret disappears with them.

## Host your own server

You can host your own server if you want to keep complete ownership of your sessions.

- [Setup a backend on a cheap VPS](/docs/self-host-soketi/)
- Host on railway.app from a template (TO-DO)

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
