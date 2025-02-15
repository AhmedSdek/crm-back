import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import 'dotenv/config';
import clientRoutes from './src/routes/clientRoutes.js'
import authRoutes from './src/routes/auth.js'
import usersRoutes from './src/routes/usersRoutes.js'
import notificationRoutes from './src/routes/notificationRouts.js'
import eventRoutes from './src/routes/eventRoutes.js'
import http from 'http'; // لإنشاء سيرفر HTTP
import { Server } from 'socket.io' // Socket.IO

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app); // ربط السيرفر بـ Express
const io = new Server(server, {
    cors: {
        origin: process.env.FRONT_LINK, // استبدلها برابط الفرونت
        methods: ["GET", "POST", "DELETE", "PUT"],
        credentials: true
    },
    transports: ["websocket", "polling"]
});

app.use(cors({
    origin: process.env.FRONT_LINK, // نفس الدومين
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true
}));

// ربط المهام بـ Socket.IO
app.use((req, res, next) => {
    req.io = io; // تمرير io إلى كل الطلبات
    next();
});
// Middleware
// app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.error('MongoDB Connection Error:', err));

app.use('/api/notifications', notificationRoutes);
// app.use('/api/properties', propertyRoutes);
// app.use('/api/sales', saleRoutes);
// app.use('/api/tasks', taskRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);

const users = {}; // تخزين معرف المستخدم مع socket.id

io.on('connection', (socket) => {
    // console.log('A user connected:', socket.id);

    // تسجيل المستخدم عند الانضمام
    socket.on('joinRoom', (userId) => {
        socket.join(userId);
        users[userId] = socket.id;
        // console.log(`User ${userId} joined room ${userId}`);
    });

    // عند فصل الاتصال، نحذف الموظف من القائمة
    socket.on('disconnect', () => {
        for (const userId in users) {
            if (users[userId] === socket.id) {
                delete users[userId];
                // console.log(`User ${userId} disconnected`);
                break;
            }
        }
    });
});

// Routes
app.get('/', (req, res) => res.send('Real Estate CRM API'));

// Start Server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));