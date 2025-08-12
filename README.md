## 🚀 How to Run

### 📋 Prerequisites

- Node.js 18+
- MongoDB
- Docker (optional)

### MongoDB

```bash
# Option 1: Local MongoDB
mongod

# Option 2: Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Backend

```bash
cd server
npm install
npm run start:dev
```

**Backend running on:** http://localhost:3001

### Frontend

```bash
cd client
npm install
npm run dev
```

**Frontend running on:** http://localhost:5173

### Docker (optional)

```bash
# Run everything with Docker
docker-compose up -d
```

**Frontend:** React + TypeScript + Tailwind CSS + Vite
**Backend:** NestJS + MongoDB + WebSockets
**Database:** MongoDB with Mongoose
**Real-time:** Socket.IO

## Environment Variables

Create a `.env` file in the `server/` folder:

```env
MONGODB_URI=mongodb://localhost:27017/hoodhelp
JWT_SECRET=your-secret-key-here
```

Create a `.env` file in the client/ folder:

```env
VITE_GOOGLE_MAPS_API_KEY=
VITE_API_URL=http://localhost:3001
```
