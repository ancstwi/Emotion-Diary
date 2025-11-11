const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/entries', authMiddleware, async (req, res) => {
  console.log(
    'Получен запрос на создание записи от пользователя:',
    req.user.userId
  );

  try {
    const { situation, thoughts, body_reaction, behavior_reaction } = req.body;

    console.log('Данные получены:', {
      situation: situation?.length,
      thoughts: thoughts?.length,
      body_reaction: body_reaction?.length,
      behavior_reaction: behavior_reaction?.length,
    });

    if (!situation || !thoughts || !body_reaction || !behavior_reaction) {
      console.log('Не все поля заполнены');
      return res
        .status(400)
        .json({ message: 'Все поля обязательны для заполнения' });
    }

    const result = await db.query(
      `INSERT INTO entries (user_id, situation, thoughts, body_reaction, behavior_reaction)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.userId, situation, thoughts, body_reaction, behavior_reaction]
    );

    const newEntry = result.rows[0];
    console.log('Запись создана:', newEntry.id);

    res.status(201).json({
      message: 'Запись успешно создана',
      id: newEntry.id,
      data: newEntry,
    });
  } catch (err) {
    console.error('Ошибка создания записи:', err);
    res.status(500).json({ message: 'Ошибка сервера при создании записи' });
  }
});

// router.get('/entries', authMiddleware, async (req, res) => {
//   try {
//     const result = await db.query(
//       `SELECT e.*,
//               (SELECT json_agg(json_build_object('name', em.name, 'intensity', ee.intensity))
//                FROM entry_emotions ee
//                JOIN emotions em ON ee.emotion_id = em.id
//                WHERE ee.entry_id = e.id) as emotions
//        FROM entries e
//        WHERE user_id = $1
//        ORDER BY created_at DESC`,
//       [req.user.userId]
//     );

//     res.json({
//       message: 'Записи получены успешно',
//       count: result.rows.length,
//       entries: result.rows
//     });
//   } catch (err) {
//     console.error('Ошибка получения записей:', err);
//     res.status(500).json({ message: 'Ошибка сервера при получении записей' });
//   }
// });

// router.get('/entries/:id', authMiddleware, async (req, res) => {
//   try {
//     const result = await db.query(
//       'SELECT * FROM entries WHERE id = $1 AND user_id = $2',
//       [req.params.id, req.user.userId]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: 'Запись не найдена' });
//     }

//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error('Ошибка получения записи:', err);
//     res.status(500).json({ message: 'Ошибка сервера при получении записи' });
//   }
// });

router.get('/entries', authMiddleware, async (req, res) => {
  console.log(
    '📥 Получен запрос на получение всех записей пользователя:',
    req.user.userId
  );

  try {
    const result = await db.query(
      `SELECT e.*, 
              (SELECT json_agg(json_build_object('id', em.id, 'name', em.name, 'intensity', ee.intensity))
               FROM entry_emotions ee
               JOIN emotions em ON ee.emotion_id = em.id
               WHERE ee.entry_id = e.id) as emotions
       FROM entries e 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [req.user.userId]
    );

    console.log(`Найдено записей: ${result.rows.length}`);

    res.json({
      message: 'Записи получены успешно',
      count: result.rows.length,
      entries: result.rows,
    });
  } catch (err) {
    console.error('Ошибка получения записей:', err);
    res.status(500).json({ message: 'Ошибка сервера при получении записей' });
  }
});

router.get('/entries/:id', authMiddleware, async (req, res) => {
  const entryId = req.params.id;
  console.log(
    '📥 Получен запрос на получение записи:',
    entryId,
    'от пользователя:',
    req.user.userId
  );

  try {
    const result = await db.query(
      `SELECT e.*, 
              (SELECT json_agg(json_build_object('id', em.id, 'name', em.name, 'intensity', ee.intensity))
               FROM entry_emotions ee
               JOIN emotions em ON ee.emotion_id = em.id
               WHERE ee.entry_id = e.id) as emotions
       FROM entries e 
       WHERE id = $1 AND user_id = $2`,
      [entryId, req.user.userId]
    );

    if (result.rows.length === 0) {
      console.log('Запись не найдена:', entryId);
      return res.status(404).json({ message: 'Запись не найдена' });
    }

    console.log('Запись найдена:', entryId);

    res.json({
      message: 'Запись получена успешно',
      entry: result.rows[0],
    });
  } catch (err) {
    console.error('Ошибка получения записи:', err);
    res.status(500).json({ message: 'Ошибка сервера при получении записи' });
  }
});

router.delete('/entries/:id', authMiddleware, async (req, res) => {
  const entryId = req.params.id;
  console.log(
    '📥 Получен запрос на удаление записи:',
    entryId,
    'от пользователя:',
    req.user.userId
  );

  try {
    const entryCheck = await db.query(
      'SELECT * FROM entries WHERE id = $1 AND user_id = $2',
      [entryId, req.user.userId]
    );

    if (entryCheck.rows.length === 0) {
      console.log(
        'Запись не найдена или не принадлежит пользователю:',
        entryId
      );
      return res.status(404).json({ message: 'Запись не найдена' });
    }

    await db.query('DELETE FROM entries WHERE id = $1', [entryId]);

    console.log('Запись удалена:', entryId);

    res.json({
      message: 'Запись успешно удалена',
      deletedId: entryId,
    });
  } catch (err) {
    console.error('Ошибка удаления записи:', err);
    res.status(500).json({ message: 'Ошибка сервера при удалении записи' });
  }
});

module.exports = router;
