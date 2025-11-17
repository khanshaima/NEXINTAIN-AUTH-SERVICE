# ---------- Base Image ----------
FROM node:18-alpine

# ---------- Set Work Directory ----------
WORKDIR /app

# ---------- Copy Package Files ----------
COPY package*.json ./

# ---------- Install Dependencies ----------
RUN npm install

# ---------- Copy Source ----------
COPY . .

# ---------- Build TypeScript ----------
RUN npm run build

# ---------- Expose Port ----------
EXPOSE 4000

# ---------- Start Command ----------
CMD ["node", "dist/server.js"]
