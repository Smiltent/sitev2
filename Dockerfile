
FROM denoland/deno:2.9.7

RUN apt-get update && apt-get install -y --no-install-recommends git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY deno.json deno.lock* ./

RUN deno install
COPY . .

EXPOSE 3000

CMD ["task", "start"]