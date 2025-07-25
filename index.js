const express = require('express');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const cors = require('cors');

const prisma = new PrismaClient();
const app = express();
app.use(express.json({ limit: '20mb' }));
app.use(cors({ origin: ['http://localhost:5173', "https://media-project-nine.vercel.app"], credentials: true }));

// Mount auth routes
const authRouter = require('./routes/auth');
app.use('/auth', authRouter);

// Mount movie routes
const movieRouter = require('./routes/movies');
app.use('/movies', movieRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 