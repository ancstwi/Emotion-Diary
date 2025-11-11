const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();

router.post('/register', async (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  console.log('📥 Получен запрос на регистрацию:', {
    email,
    first_name,
    last_name,
  });

  if (!first_name || !last_name || !email || !password) {
    return res
      .status(400)
      .json({ message: 'Все поля обязательны для заполнения' });
  }

  try {
    const existingUser = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Пользователь уже существует' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const result = await db.query(
      'INSERT INTO users (first_name, last_name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, first_name, last_name, email, created_at',
      [first_name, last_name, email, password_hash]
    );

    const newUser = result.rows[0];
    console.log(
      'Пользователь создан:',
      newUser.id,
      newUser.email,
      newUser.created_at
    );

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Токен создан для пользователя:', newUser.id);

    res.status(201).json({
      message: 'Пользователь зарегистрирован',
      token: token,
      user: {
        id: newUser.id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        created_at: newUser.created_at,
      },
    });
  } catch (err) {
    console.error('Ошибка регистрации:', err);
    res.status(500).json({ message: 'Ошибка сервера при регистрации' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  console.log('📥 Получен запрос на вход:', { email });

  if (!email || !password) {
    console.log('Email и пароль обязательны');
    return res.status(400).json({ message: 'Email и пароль обязательны' });
  }

  try {
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [
      email,
    ]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: 'Неверный email или пароль' });
    }

    const user = userResult.rows[0];
    console.log('🔍 Найден пользователь:', user.id, user.email);

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Неверный email или пароль' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Успешный вход, токен создан для:', user.id);

    res.json({
      message: 'Вход выполнен успешно',
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('Ошибка входа:', err);
    res.status(500).json({ message: 'Ошибка сервера при входе' });
  }
});

module.exports = router;
