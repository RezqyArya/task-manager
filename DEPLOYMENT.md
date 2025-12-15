## Persiapan Server
- **OS:** Amazon Linux (AWS EC2)
- **Runtime:** Node.js v18+
- **Tools:** NPM, Git, PM2
- **Database:** PostgreSQL
---

## Repo GitHub
```
https://github.com/RezqyArya/task-manager

```

### Production URL:

- http://54.88.142.129:3000
- https://ec2-54-88-142-129.compute-1.amazonaws.com/

```

### Detail AWS EC2:
```
Public IP: 54.88.142.129
Deployment: PM2 (Process Manager)

```

### Langkah Deployment:
```bash
1. Clone & Setup Repository Backend
git clone https://github.com/RezqyArya/task-manager
cd task-manager
npm install
cp .env.example .env
npx prisma migrate dev --name init
npx prisma db seed

2. Jalankan Aplikasi dengan PM2
pm2 start src/server.js --name "task-manager"
pm2 save

3. Monitoring & Logs
pm2 status
pm2 logs task-manager

4. Maintenance
git pull
npm install
pm2 restart task-manager

5. Strategi Backup
cp .env.example .env
npx prisma migrate dev
pm2 restart task-manager
```
### Health Check:
```bash
GET http://54.88.142.129:3000/api/health 

# Login

curl -X POST http://54.88.142.129:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"123456"}'
```