FROM node:20 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Pasar variables como ARG
ARG VITE_API_URL
ARG VITE_SSE_URL

# También definir ENV para que Vite las lea
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_SSE_URL=${VITE_SSE_URL}

RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
