# Build Stage 1
FROM node:24-alpine AS build
WORKDIR /app

RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm i

COPY . ./
RUN pnpm run build

# Build Stage 2
FROM node:24-alpine
WORKDIR /app

RUN apk add --no-cache vips-dev fftw-dev build-base

COPY ./drizzle.config.ts ./
COPY ./server/database/migrations ./server/database/migrations
COPY --from=build /app/.output/ ./

RUN corepack enable
RUN pnpm i drizzle-kit drizzle-orm pg dotenv
RUN pnpm i -C ./server dayjs

ENV PORT=80
ENV HOST=0.0.0.0

EXPOSE 80
CMD ["sh", "-c", "pnpm drizzle-kit migrate && node ./server/index.mjs"]
