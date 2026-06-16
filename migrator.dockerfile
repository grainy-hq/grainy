FROM node:26-alpine

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY drizzle.config.ts ./
COPY drizzle ./drizzle
COPY src/lib/db/schema.ts ./src/lib/db/schema.ts

CMD ["pnpm", "db:migration:apply"]
