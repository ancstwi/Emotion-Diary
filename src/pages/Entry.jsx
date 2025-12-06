import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { entriesAPI } from '../../backend/api';

export default function EntryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

useEffect(() => {
  const loadEntry = async () => {
    try {
      setLoading(true);
      console.log('Загружаем запись с ID:', id); // добавить
      const response = await entriesAPI.getById(id);
      console.log('Ответ от сервера:', response); // добавить
      setEntry(response.entry);
    } catch (err) {
      console.error('Полная ошибка:', err); // добавить
      setError('Запись не найдена');
    } finally {
      setLoading(false);
    }
  };

  loadEntry();
}, [id]);// теперь зависимость только id

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // остальной код без изменений...
  if (loading) {
    return (
      <div className="min-h-screen bg-sky-50 flex items-center justify-center">
        <div className="text-2xl text-teal-600">Загрузка...</div>
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="min-h-screen bg-sky-50 flex items-center justify-center">
        <div className="text-2xl text-red-600">{error || 'Запись не найдена'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-50 flex items-center justify-center p-8">
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-xl p-10">
        <h1 className="text-5xl font-bold mb-6 text-teal-600 text-center">
          Детали записи
        </h1>

        <p className="text-gray-500 mb-4 text-center">Дата: {formatDate(entry.created_at)}</p>

        <h2 className="text-2xl font-semibold mb-2">Ситуация</h2>
        <p className="text-xl mb-4">{entry.situation}</p>

        <h2 className="text-2xl font-semibold mb-2">Мысли</h2>
        <p className="text-xl mb-4">{entry.thoughts}</p>

        <h2 className="text-2xl font-semibold mb-2">Реакция тела</h2>
        <p className="text-xl mb-4">{entry.body_reaction}</p>

        <h2 className="text-2xl font-semibold mb-2">Реакция поведения</h2>
        <p className="text-xl mb-4">{entry.behavior_reaction}</p>

        {entry.emotions && entry.emotions.length > 0 && (
          <>
            <h2 className="text-2xl font-semibold mb-2">Эмоции</h2>
            <div className="flex flex-wrap gap-3 mb-6">
              {entry.emotions.map((emotion, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 bg-teal-100 text-teal-800 rounded-2xl text-lg font-medium"
                >
                  {emotion.name} — {emotion.intensity}/10
                </span>
              ))}
            </div>
          </>
        )}

        <div className="text-center">
          <button
            onClick={() => navigate("/entries-list")}
            className="px-6 py-3 bg-teal-400 text-white rounded-xl hover:bg-teal-500 transition-all duration-200"
          >
            Назад к списку
          </button>
        </div>
      </div>
    </div>
  );
}



// import { useParams, useNavigate } from "react-router-dom";

// // Заглушка данных (позже будет fetch с backend)
// const sampleEntries = [
//   {
//     id: 1,
//     date: "2025-10-12",
//     situation: "Я опоздала на работу из-за пробки",
//     thoughts: "Я никогда ничего не успеваю",
//     bodyReaction: "Сжалось сердце, напряжение в плечах",
//     behaviorReaction: "Опоздала на совещание, извинилась перед коллегами",
//     emotions: [
//       { name: "Тревога", intensity: 8 },
//       { name: "Грусть", intensity: 6 },
//     ],
//   },
//   {
//     id: 2,
//     date: "2025-10-11",
//     situation: "Коллега похвалил мою работу",
//     thoughts: "Я реально хороша в этом",
//     bodyReaction: "Лёгкость в груди, расслабленные плечи",
//     behaviorReaction: "Улыбнулась, поблагодарила коллегу",
//     emotions: [
//       { name: "Радость", intensity: 9 },
//       { name: "Гордость", intensity: 7 },
//     ],
//   },
//   {
//     id: 3,
//     date: "2025-10-11",
//     situation: "Коллега похвалил мою работу",
//     thoughts: "Я реально хороша в этом",
//     bodyReaction: "Лёгкость в груди, расслабленные плечи",
//     behaviorReaction: "Улыбнулась, поблагодарила коллегу",
//     emotions: [
//       { name: "Радость", intensity: 9 },
//       { name: "Гордость", intensity: 7 },
//     ],
//   },
// ];

// export default function EntryDetail() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const entry = sampleEntries.find((e) => e.id === parseInt(id));

//   if (!entry) return <p className="text-center mt-20">Запись не найдена</p>;

//   return (
//     <div className="min-h-screen bg-sky-50 flex items-center justify-center p-8">
//       <div className="max-w-3xl w-full bg-white rounded-3xl shadow-xl p-10">
//         <h1 className="text-5xl font-bold mb-6 text-teal-600 text-center">
//           Детали записи
//         </h1>

//         <p className="text-gray-500 mb-4 text-center">Дата: {entry.date}</p>

//         <h2 className="text-2xl font-semibold mb-2">Ситуация</h2>
//         <p className="text-xl mb-4">{entry.situation}</p>

//         <h2 className="text-2xl font-semibold mb-2">Мысли</h2>
//         <p className="text-xl mb-4">{entry.thoughts}</p>

//         <h2 className="text-2xl font-semibold mb-2">Реакция тела</h2>
//         <p className="text-xl mb-4">{entry.bodyReaction}</p>

//         <h2 className="text-2xl font-semibold mb-2">Реакция поведения</h2>
//         <p className="text-xl mb-4">{entry.behaviorReaction}</p>

//         <h2 className="text-2xl font-semibold mb-2">Эмоции</h2>
//         <div className="flex flex-wrap gap-3 mb-6">
//           {entry.emotions.map((emotion, idx) => (
//             <span
//               key={idx}
//               className="px-4 py-2 bg-teal-100 text-teal-800 rounded-2xl text-lg font-medium"
//             >
//               {emotion.name} — {emotion.intensity}/10
//             </span>
//           ))}
//         </div>

//         <div className="text-center">
//           <button
//             onClick={() => navigate("/entries-list")}
//             className="px-6 py-3 bg-teal-400 text-white rounded-xl hover:bg-teal-500 transition-all duration-200"
//           >
//             Назад к списку
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }












// // import { useParams, useNavigate } from "react-router-dom";

// // // // Заглушка данных (позже будет fetch с backend)
// // // const sampleEntries = [
// // //   {
// // //     id: 1,
// // //     date: "2025-10-12",
// // //     situation: "Я опоздала на работу из-за пробки",
// // //     thoughts: "Я никогда ничего не успеваю",
// // //     bodyReaction: "Сжалось сердце, напряжение в плечах",
// // //     behaviorReaction: "Опоздала на совещание, извинилась перед коллегами",
// // //     emotions: [
// // //       { name: "Тревога", intensity: 8 },
// // //       { name: "Грусть", intensity: 6 },
// // //     ],
// // //   },
// // //   {
// // //     id: 2,
// // //     date: "2025-10-11",
// // //     situation: "Коллега похвалил мою работу",
// // //     thoughts: "Я реально хороша в этом",
// // //     bodyReaction: "Лёгкость в груди, расслабленные плечи",
// // //     behaviorReaction: "Улыбнулась, поблагодарила коллегу",
// // //     emotions: [
// // //       { name: "Радость", intensity: 9 },
// // //       { name: "Гордость", intensity: 7 },
// // //     ],
// // //   },
// // //   {
// // //     id: 3,
// // //     date: "2025-10-11",
// // //     situation: "Коллега похвалил мою работу",
// // //     thoughts: "Я реально хороша в этом",
// // //     bodyReaction: "Лёгкость в груди, расслабленные плечи",
// // //     behaviorReaction: "Улыбнулась, поблагодарила коллегу",
// // //     emotions: [
// // //       { name: "Радость", intensity: 9 },
// // //       { name: "Гордость", intensity: 7 },
// // //     ],
// // //   },
// // // ];

// // // Заглушка данных (позже будет fetch с backend)
// // const sampleEntries = [
// //   {
// //     id: 1,
// //     date: "2025-12-08",
// //     created_at: "2025-12-08T10:00:00.000Z",
// //     situation: "Успешно завершила важный проект на работе",
// //     thoughts: "Я справилась лучше, чем ожидала, чувствую удовлетворение",
// //     body_reaction: "Легкость в теле, улыбка на лице",
// //     behavior_reaction: "Поделилась успехом с коллегами, планирую отпраздновать",
// //     emotions: [
// //       { name: "Радость", intensity: 7 },
// //       { name: "Грусть", intensity: 3 },
// //       { name: "Тревога", intensity: 5 },
// //       { name: "Гнев", intensity: 2 },
// //       { name: "Любовь", intensity: 6 }
// //     ]
// //   },
// //   {
// //     id: 2,
// //     date: "2025-10-09", 
// //     created_at: "2025-10-09T14:30:00.000Z",
// //     situation: "Неожиданная встреча со старым другом",
// //     thoughts: "Приятно вспомнить прошлое, но немного грустно от того, как изменилась жизнь",
// //     body_reaction: "Теплота в груди, легкое напряжение в плечах",
// //     behavior_reaction: "Долго разговаривали, обменялись контактами",
// //     emotions: [
// //       { name: "Радость", intensity: 6 },
// //       { name: "Грусть", intensity: 4 },
// //       { name: "Тревога", intensity: 6 },
// //       { name: "Гнев", intensity: 3 },
// //       { name: "Любовь", intensity: 5 }
// //     ]
// //   },
// //   {
// //     id: 3,
// //     date: "2025-10-13",
// //     created_at: "2025-10-13T09:15:00.000Z",
// //     situation: "Утро началось с приятного сюрприза - завтрак в постель",
// //     thoughts: "Меня ценят и любят, это прекрасное начало дня",
// //     body_reaction: "Расслабленность, чувство благодарности",
// //     behavior_reaction: "Обняла близкого человека, поблагодарила",
// //     emotions: [
// //       { name: "Радость", intensity: 8 },
// //       { name: "Грусть", intensity: 2 },
// //       { name: "Тревога", intensity: 4 },
// //       { name: "Гнев", intensity: 2 },
// //       { name: "Любовь", intensity: 7 }
// //     ]
// //   },
// //   {
// //     id: 4,
// //     date: "2025-10-11",
// //     created_at: "2025-10-11T18:45:00.000Z",
// //     situation: "Получила похвалу от начальства за проделанную работу",
// //     thoughts: "Мои усилия заметили и оценили, это мотивирует работать еще лучше",
// //     body_reaction: "Прилив энергии, уверенная осанка",
// //     behavior_reaction: "Позвонила родным поделиться радостью",
// //     emotions: [
// //       { name: "Радость", intensity: 9 },
// //       { name: "Грусть", intensity: 1 },
// //       { name: "Тревога", intensity: 5 },
// //       { name: "Гнев", intensity: 4 },
// //       { name: "Любовь", intensity: 6 }
// //     ]
// //   },
// //   {
// //     id: 5,
// //     date: "2025-12-13",
// //     created_at: "2025-12-13T16:20:00.000Z",
// //     situation: "Сложный разговор с близким человеком",
// //     thoughts: "Понимаю, что конфликт неизбежен, но стараюсь сохранить отношения",
// //     body_reaction: "Напряжение в шее, учащенное дыхание",
// //     behavior_reaction: "Старалась слушать внимательно, выражала свои чувства спокойно",
// //     emotions: [
// //       { name: "Радость", intensity: 7 },
// //       { name: "Грусть", intensity: 3 },
// //       { name: "Тревога", intensity: 6 },
// //       { name: "Гнев", intensity: 3 },
// //       { name: "Любовь", intensity: 6 }
// //     ]
// //   }
// // ];

// // export default function EntryDetail() {
// //   const { id } = useParams();
// //   const navigate = useNavigate();

// //   const entry = sampleEntries.find((e) => e.id === parseInt(id));

// //   if (!entry) return <p className="text-center mt-20">Запись не найдена</p>;

// //   return (
// //     <div className="min-h-screen bg-sky-50 flex items-center justify-center p-8">
// //       <div className="max-w-3xl w-full bg-white rounded-3xl shadow-xl p-10">
// //         <h1 className="text-5xl font-bold mb-6 text-teal-600 text-center">
// //           Детали записи
// //         </h1>

// //         <p className="text-gray-500 mb-4 text-center">Дата: {entry.date}</p>

// //         <h2 className="text-2xl font-semibold mb-2">Ситуация</h2>
// //         <p className="text-xl mb-4">{entry.situation}</p>

// //         <h2 className="text-2xl font-semibold mb-2">Мысли</h2>
// //         <p className="text-xl mb-4">{entry.thoughts}</p>

// //         <h2 className="text-2xl font-semibold mb-2">Реакция тела</h2>
// //         <p className="text-xl mb-4">{entry.bodyReaction}</p>

// //         <h2 className="text-2xl font-semibold mb-2">Реакция поведения</h2>
// //         <p className="text-xl mb-4">{entry.behaviorReaction}</p>

// //         <h2 className="text-2xl font-semibold mb-2">Эмоции</h2>
// //         <div className="flex flex-wrap gap-3 mb-6">
// //           {entry.emotions.map((emotion, idx) => (
// //             <span
// //               key={idx}
// //               className="px-4 py-2 bg-teal-100 text-teal-800 rounded-2xl text-lg font-medium"
// //             >
// //               {emotion.name} — {emotion.intensity}/10
// //             </span>
// //           ))}
// //         </div>

// //         <div className="text-center">
// //           <button
// //             onClick={() => navigate("/entries-list")}
// //             className="px-6 py-3 bg-teal-400 text-white rounded-xl hover:bg-teal-500 transition-all duration-200"
// //           >
// //             Назад к списку
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }
