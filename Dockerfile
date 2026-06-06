FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG VITE_ADMIN_API_BASE_URL
ARG VITE_APP_ENV=production

ENV VITE_ADMIN_API_BASE_URL=$VITE_ADMIN_API_BASE_URL
ENV VITE_APP_ENV=$VITE_APP_ENV

RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0

COPY --from=builder /app/.output ./.output

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
