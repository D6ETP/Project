FROM node:20-slim AS build

WORKDIR /app

# Accept VITE env vars as build args so they are baked into the static bundle
ARG VITE_API_BASE_URL=http://localhost:30088/api
ARG VITE_CHATBOT_URL=http://localhost:30088

# Make them available to npm run build (Vite reads VITE_* env vars at build time)
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_CHATBOT_URL=$VITE_CHATBOT_URL

COPY package*.json ./
RUN npm ci || npm install

COPY . .
RUN npm run build

FROM nginx:bookworm

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
