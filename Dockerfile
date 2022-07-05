FROM node:16.15.1-alpine as base
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .
RUN npm run build

FROM node:16.15.1-alpine
RUN adduser -D -s /sbin/nologin app
USER app
WORKDIR /home/app
COPY --chown=app:app --from=base /app/dist ./dist
COPY --chown=app:app package.json .
COPY --chown=app:app package-lock.json .
RUN npm install --omit=dev
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
