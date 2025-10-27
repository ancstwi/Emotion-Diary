CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE emotions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
);


INSERT INTO emotions (name) VALUES
('Оптимизм', ''),
('Восторг', ''),
('Радость', ''),
('Безмятежность', ''),
('Восхищение', ''),
('Доверие', ''),
('Принятие', ''),
('Любовь', ''),
('Ужас', ''),
('Страх', ''),
('Тревога', ''),
('Покорность', ''),
('Изумление', ''),
('Удивление', ''),
('Возбуждение', ''),
('Трепет', ''),
('Горе', ''),
('Грусть', ''),
('Печаль', ''),
('Разочарование', ''),
('Отвращение', ''),
('Неудовольствие', ''),
('Скука', ''),
('Раскаяние', ''),
('Гнев', ''),
('Злость', ''),
('Досада', ''),
('Презрение', ''),
('Настороженность', ''),
('Ожидание', ''),
('Интерес', ''),
('Агрессия', '');

CREATE TABLE entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    situation TEXT NOT NULL,
    thoughts TEXT NOT NULL,
    body_reaction TEXT NOT NULL,
    behavior_reaction TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE entry_emotions (
    entry_id INTEGER REFERENCES entries(id) ON DELETE CASCADE,
    emotion_id INTEGER REFERENCES emotions(id),
    intensity SMALLINT CHECK (intensity BETWEEN 1 AND 10),
    PRIMARY KEY (entry_id, emotion_id)
);

INSERT INTO users (first_name, last_name, email, password_hash)
VALUES ('Иоанна', 'Ивановна', 'ioanna@gmail.com', 'qwerty');


INSERT INTO entry_emotions (entry_id , emotion_id , intensity)
VALUES (12, 11, 7);

INSERT INTO entry_emotions (entry_id , emotion_id , intensity)
VALUES (12, 20, 9);

INSERT INTO entry_emotions (entry_id , emotion_id , intensity)
VALUES (12, 1, 2);

INSERT INTO entry_emotions (entry_id , emotion_id , intensity)
VALUES (12, 27, 2);

INSERT INTO entry_emotions (entry_id , emotion_id , intensity)
VALUES (12, 22, 2);

insert into entries(user_id, situation, thoughts, body_reaction, behavior_reaction, created_at)
values (15, 'Забыла сдать отчёт вовремя', 'Я всегда всё порчу, меня не ценят', 'Напряжение в плечах и шее', 'Ушла домой раньше, не стала доделывать работу', '2025-10-27 15:32:01.254')

INSERT INTO entries (user_id, situation, thoughts, body_reaction, behavior_reaction)
VALUES (1,
        'Забыла сдать отчёт вовремя',
        'Я всегда всё порчу, меня не ценят',
        'Напряжение в плечах и шее',
        'Ушла домой раньше, не стала доделывать работу');
       
INSERT INTO entry_emotions (entry_id, emotion_id, intensity)
VALUES
(1, 18, 7),
(1, 11, 8);

SELECT ee.entry_id,
       e.name AS emotion_name,
       ee.intensity
FROM entry_emotions ee
JOIN emotions e ON ee.emotion_id = e.id
WHERE ee.entry_id = 1;
