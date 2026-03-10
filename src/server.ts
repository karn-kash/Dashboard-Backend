import express from 'express';
import cors from 'cors';
import salesRoutes from './routes/salesRoutes';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api', salesRoutes);

app.get('/', (req, res) => {
  res.send('Dashboard API is running smoothly.');
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});