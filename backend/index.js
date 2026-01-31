require('./load-env');
const express = require('express');
const cors = require('cors');

const { swaggerUi, specs } = require('./openapi');
const { connectProducer } = require('./kafka/producer');
const { ensureEmotionCatalog } = require('./services/emotionsCatalog');

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get('/api-docs', (req, res) => {
  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Emotion Diary API</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 24px; background: #f5f5f5; }
    h1 { color: #333; }
    h2 { color: #555; margin-top: 32px; border-bottom: 1px solid #ddd; padding-bottom: 8px; }
    .endpoint { background: white; padding: 16px; margin: 12px 0; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .method { display: inline-block; padding: 4px 8px; border-radius: 4px; font-weight: bold; margin-right: 8px; }
    .get { background: #61affe; color: white; }
    .post { background: #49cc90; color: white; }
    .put { background: #fca130; color: white; }
    .delete { background: #f93e3e; color: white; }
    .path { font-family: monospace; font-size: 16px; }
    .desc { color: #666; margin-top: 8px; }
    .spec { margin-top: 24px; }
    a { color: #0066cc; }
  </style>
</head>
<body>
  <h1>Emotion Diary API</h1>
  <p>Документация REST API. Тестирование через <a href="https://www.postman.com/">Postman</a>.</p>
  <p><strong>Base URL:</strong> <code>http://localhost:${port}</code></p>

  <h2>System</h2>
  <div class="endpoint">
    <span class="method get">GET</span><span class="path">/api/health</span>
    <div class="desc">Проверка работоспособности</div>
  </div>
  <div class="endpoint">
    <span class="method get">GET</span><span class="path">/api/stats</span>
    <div class="desc">Статистика (emotions, entries, users)</div>
  </div>

  <h2>Auth</h2>
  <div class="endpoint">
    <span class="method post">POST</span><span class="path">/api/auth/register</span>
    <div class="desc">Регистрация. Body: first_name, last_name, email, password</div>
  </div>
  <div class="endpoint">
    <span class="method post">POST</span><span class="path">/api/auth/login</span>
    <div class="desc">Вход. Body: email, password. Возвращает token.</div>
  </div>

  <h2>Entries</h2>
  <div class="endpoint">
    <span class="method get">GET</span><span class="path">/api/entries</span>
    <div class="desc">Список записей (JWT)</div>
  </div>
  <div class="endpoint">
    <span class="method post">POST</span><span class="path">/api/entries</span>
    <div class="desc">Создать запись. Body: situation, thoughts, body_reaction, behavior_reaction (JWT)</div>
  </div>
  <div class="endpoint">
    <span class="method get">GET</span><span class="path">/api/entries/:id</span>
    <div class="desc">Запись по ID (JWT)</div>
  </div>
  <div class="endpoint">
    <span class="method put">PUT</span><span class="path">/api/entries/:id</span>
    <div class="desc">Обновить запись (JWT)</div>
  </div>
  <div class="endpoint">
    <span class="method delete">DELETE</span><span class="path">/api/entries/:id</span>
    <div class="desc">Удалить запись (JWT)</div>
  </div>

  <h2>Emotions</h2>
  <div class="endpoint">
    <span class="method get">GET</span><span class="path">/api/emotions-list</span>
    <div class="desc">Справочник эмоций</div>
  </div>
  <div class="endpoint">
    <span class="method post">POST</span><span class="path">/api/emotions</span>
    <div class="desc">Добавить эмоцию. Body: entry_id, emotion_id, intensity 1-10 (JWT)</div>
  </div>
  <div class="endpoint">
    <span class="method get">GET</span><span class="path">/api/user-emotions</span>
    <div class="desc">Эмоции пользователя (JWT)</div>
  </div>
  <div class="endpoint">
    <span class="method post">POST</span><span class="path">/api/insights/analyze</span>
    <div class="desc">ИИ-анализ паттернов и прогноз (GigaChat, нужны ключи в .env — см. GIGACHAT_* в .env.example)</div>
  </div>

  <h2>gRPC (порт 50051)</h2>
  <div class="endpoint">
    <span class="path">EmotionDiary.GetEmotionsCount</span>
    <div class="desc">Количество эмоций в справочнике</div>
  </div>
  <div class="endpoint">
    <span class="path">EmotionDiary.GetEmotionsList</span>
    <div class="desc">Список эмоций (id, name)</div>
  </div>
  <div class="endpoint">
    <span class="path">EmotionDiary.GetEntriesCount</span>
    <div class="desc">Количество записей по user_id</div>
  </div>

  <p class="spec"><a href="/api-docs-spec.json">OpenAPI spec (JSON)</a> — для импорта в Postman</p>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(specs));
app.get('/api-docs-spec.json', (req, res) => res.json(specs));

const emotionsRoutes = require('./routes/emotions');
const authRoutes = require('./routes/auth');
const entriesRoutes = require('./routes/entries');
const insightsRoutes = require('./routes/insights');
const { startGrpcServer } = require('./grpc/server');

app.use('/api', emotionsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', entriesRoutes);
app.use('/api', insightsRoutes);

startGrpcServer();

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend is working',
    timestamp: new Date().toISOString()
  });
});

const { getParallelStats } = require('./utils/asyncExample');
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await getParallelStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка' });
  }
});


async function startServer() {
  try {
    const catalog = await ensureEmotionCatalog();
    if (catalog.inserted > 0) {
      console.log(`Emotion catalog synced: +${catalog.inserted}, total ${catalog.total}`);
    }
  } catch (e) {
    console.warn('Emotion catalog sync failed:', e.message);
  }

  app.listen(port, async () => {
    try {
      await connectProducer();
    } catch (e) {
      console.warn('Kafka недоступна, Producer не подключен:', e.message);
    }
    console.log('Server started on port', port);
    console.log('gRPC: localhost:50051 | REST: http://localhost:' + port + '/api | Swagger: /swagger');
  });
}

startServer();
