const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const emotionsRoutes = require('./routes/emotions');
const authRoutes = require('./routes/auth');
const entriesRoutes = require('./routes/entries');

app.use('/api', emotionsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', entriesRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend is working',
    timestamp: new Date().toISOString(),
  });
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
  console.log(`📍 Health check: http://localhost:${port}/api/health`);
  console.log(`📍 Emotions list: http://localhost:${port}/api/emotions-list`);
  console.log(`📍 Register: POST http://localhost:${port}/api/auth/register`);
});

// app.get('/', (req, res) => {
//   res.send(`
//     <html>
//       <head><title>SMER DB Backend</title></head>
//       <body>
//         <h1>Backend is working ✅</h1>
//         <p>Check <a href="/api/health">/api/health</a> for API status</p>
//       </body>
//     </html>
//   `);
// });

// // Обработка ошибок
// app.use((err, req, res) => {
//   console.error(err.stack);
//   res.status(500).json({ message: 'Что-то пошло не так!' });
// });

// // Обработка 404
// app.use((req, res) => {
//   res.status(404).json({ message: 'Маршрут не найден' });
// });

// app.listen(port, () => {
//   console.log(`🚀 Server started on port ${port}`);
//   console.log(`📍 Health check: http://localhost:${port}/api/health`);
// });
