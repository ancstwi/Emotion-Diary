const express = require('express');
const db = require('../db');

const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/emotions-list', async (req, res) => {
  try {
    console.log('📥 Получен запрос на список эмоций');
    const result = await db.query('SELECT * FROM emotions ORDER BY id');
    console.log(` Найдено эмоций: ${result.rows.length}`);

    res.json({
      message: 'Список эмоций получен успешно',
      count: result.rows.length,
      emotions: result.rows,
    });
  } catch (err) {
    console.error('Ошибка получения эмоций:', err);
    res.status(500).json({ message: 'Ошибка сервера при получении эмоций' });
  }
});

// router.get('/emotions-list', async (req, res) => {
//   try {
//     const result = await db.query('SELECT * FROM emotions ORDER BY id');
//     res.json({
//       message: 'Список эмоций получен',
//       emotions: result.rows
//     });
//   } catch (err) {
//     console.error('Ошибка получения эмоций:', err);
//     res.status(500).json({ message: 'Ошибка сервера при получении эмоций' });
//   }
// });

// Добавление эмоции к записи
router.post('/emotions', authMiddleware, async (req, res) => {
  const { entry_id, emotion_id, intensity } = req.body;

  console.log('📥 Получен запрос на добавление эмоции:', {
    user_id: req.user.userId,
    entry_id,
    emotion_id,
    intensity,
  });

  if (!entry_id || !emotion_id || !intensity) {
    return res.status(400).json({ message: 'Все поля обязательны' });
  }

  if (intensity < 1 || intensity > 10) {
    return res
      .status(400)
      .json({ message: 'Интенсивность должна быть от 1 до 10' });
  }

  try {
    const entryCheck = await db.query(
      'SELECT * FROM entries WHERE id = $1 AND user_id = $2',
      [entry_id, req.user.userId]
    );

    if (entryCheck.rows.length === 0) {
      return res
        .status(403)
        .json({ message: 'Запись не найдена или не принадлежит пользователю' });
    }

    const emotionCheck = await db.query(
      'SELECT * FROM emotions WHERE id = $1',
      [emotion_id]
    );
    if (emotionCheck.rows.length === 0) {
      return res
        .status(400)
        .json({ message: 'Указанная эмоция не существует' });
    }

    const result = await db.query(
      `INSERT INTO entry_emotions (entry_id, emotion_id, intensity)
       VALUES ($1, $2, $3)
       RETURNING entry_id, emotion_id, intensity`,
      [entry_id, emotion_id, intensity]
    );

    const newEmotionEntry = result.rows[0];
    console.log('Эмоция добавлена к записи:', newEmotionEntry);

    res.status(201).json({
      message: 'Эмоция успешно добавлена к записи',
      data: newEmotionEntry,
    });
  } catch (err) {
    console.error('Ошибка добавления эмоции:', err);

    if (err.code === '23505') {
      return res
        .status(400)
        .json({ message: 'Эта эмоция уже добавлена к данной записи' });
    }

    res.status(500).json({ message: 'Ошибка сервера при добавлении эмоции' });
  }
});

router.get('/user-emotions', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT ee.entry_id, e.name AS emotion_name, ee.intensity, en.created_at
       FROM entry_emotions ee
       JOIN emotions e ON ee.emotion_id = e.id
       JOIN entries en ON ee.entry_id = en.id
       WHERE en.user_id = $1
       ORDER BY en.created_at DESC, e.name`,
      [req.user.userId]
    );

    res.json({
      message: 'Эмоции пользователя получены',
      count: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    console.error('Ошибка получения эмоций пользователя:', err);
    res.status(500).json({ message: 'Ошибка сервера при получении эмоций' });
  }
});

module.exports = router;
