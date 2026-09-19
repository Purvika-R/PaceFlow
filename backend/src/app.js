const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const auth = require('./middleware/auth');

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',')
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];

console.log('Allowed origins:', allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    console.log('Incoming origin:', origin, 'Type:', typeof origin);
    console.log('Allowed origins:', allowedOrigins);
    console.log('Includes?', allowedOrigins.includes(origin));

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error('CORS rejected origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (req, res) => res.json({ success: true, message: 'API is running' }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', auth, require('./routes/userRoutes'));
app.use('/api/projects', auth, require('./routes/projectRoutes'));
app.use('/api/tasks', auth, require('./routes/taskRoutes'));
app.use('/api/ai', auth, require('./routes/aiRoutes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
