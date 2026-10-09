
FROM denoland/deno:2 AS deps
WORKDIR /app
COPY package.json deno.json deno.lock ./
RUN deno install

FROM denoland/deno:2 AS release
WORKDIR /app

RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules ./node_modules
COPY . .

CMD ["deno", "run", "--allow-all", "index.ts"]
