import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { entriesAPI } from '../../backend/api';


export default function EntryList() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const response = await entriesAPI.getAll();
      setEntries(response.entries || []);
    } catch (err) {
      setError('Ошибка при загрузке записей');
      console.error('Error loading entries:', err);
    } finally {
      setLoading(false);
    }
  };

const handleDelete = async (id) => {
  if (!window.confirm('Вы уверены, что хотите удалить эту запись?')) return;

  try {
    await entriesAPI.delete(id);
    // Обновляем список после удаления
    setEntries(entries.filter(entry => entry.id !== id));
  } catch (err) {
    // Если запись уже удалена (404) - просто обновляем список
    if (err.message.includes('404') || err.message.includes('не найдена')) {
      setEntries(entries.filter(entry => entry.id !== id));
    } else {
      alert('Ошибка при удалении записи');
      console.error('Error deleting entry:', err);
    }
  }
};

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col bg-sky-50 items-center justify-center">
        <div className="text-2xl text-teal-600">Загрузка записей...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-sky-50">
      <h1 className="text-5xl font-bold mb-4 text-center text-teal-600 mt-8">
        Мои записи
      </h1>

      {error && (
        <div className="text-red-500 text-center mb-4">{error}</div>
      )}

      {/* Список записей */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 max-w-4xl mx-auto w-full">
        {entries.length === 0 ? (
          <div className="text-center text-xl text-gray-600">
            У вас пока нет записей
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white rounded-3xl shadow-xl p-6 hover:shadow-2xl transition-all duration-200"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg text-gray-500">{formatDate(entry.created_at)}</span>
                <div className="flex gap-2">
                  {/* <button
                    onClick={() => navigate(`/entry/${entry.id}`)}
                    className="px-4 py-2 rounded-xl border border-teal-400 text-teal-600 hover:bg-teal-50 transition"
                  >
                    Открыть
                  </button> */}
                  <button
                    onClick={() => navigate(`/entries/${entry.id}`)}
                    className="px-4 py-2 rounded-xl border border-teal-400 text-teal-600 hover:bg-teal-50 transition"
                  >
                    Открыть
                  </button>
                  <button 
                    onClick={() => handleDelete(entry.id)}
                    className="px-4 py-2 rounded-xl border border-red-400 text-red-600 hover:bg-red-50 transition"
                  >
                    Удалить
                  </button>
                </div>
              </div>
              <h2 className="text-2xl font-semibold mb-2">Ситуация</h2>
              <p className="text-xl mb-4">{entry.situation}</p>
              <h2 className="text-2xl font-semibold mb-2">Мысли</h2>
              <p className="text-xl mb-4">{entry.thoughts}</p>
              {entry.emotions && entry.emotions.length > 0 && (
                <>
                  <h2 className="text-2xl font-semibold mb-2">Эмоции</h2>
                  <div className="flex flex-wrap gap-3">
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
            </div>
          ))
        )}
      </div>

      {/* Футер на всю ширину */}
      <div className="bg-white p-4 shadow flex justify-center gap-4 sticky bottom-0 w-full">
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-teal-400 text-white rounded-xl hover:bg-teal-500 transition"
        >
          На главный экран
        </button>
        <button
          onClick={() => navigate("/entries-form")}
          className="px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition"
        >
          Добавить запись
        </button>
      </div>
    </div>
  );
}












// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { entriesAPI } from '../../backend/api';

// const EntriesList = () => {
//   const [entries, setEntries] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   useEffect(() => {
//     loadEntries();
//   }, []);

//   const loadEntries = async () => {
//     try {
//       setLoading(true);
//       const response = await entriesAPI.getAll();
//       setEntries(response.entries || []);
//     } catch (err) {
//       setError('Ошибка при загрузке записей');
//       console.error('Error loading entries:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm('Вы уверены, что хотите удалить эту запись?')) return;

//     try {
//       await entriesAPI.delete(id);
//       setEntries(entries.filter(entry => entry.id !== id));
//     } catch (err) {
//       alert('Ошибка при удалении записи');
//       console.error('Error deleting entry:', err);
//     }
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('ru-RU', {
//       day: 'numeric',
//       month: 'long',
//       year: 'numeric'
//     });
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-sky-50 flex items-center justify-center">
//         <div className="text-2xl text-teal-600">Загрузка...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-sky-50 p-6">
//       <div className="max-w-4xl mx-auto">
//         <h1 className="text-5xl font-bold text-teal-600 text-center mb-12">
//           Мои записи
//         </h1>

//         {error && (
//           <div className="text-red-500 text-center mb-6">{error}</div>
//         )}

//         <div className="flex flex-col gap-6">
//           {entries.length === 0 ? (
//             <div className="text-center text-xl text-gray-600">
//               У вас пока нет записей
//             </div>
//           ) : (
//             entries.map((entry) => (
//               <div
//                 key={entry.id}
//                 className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-200"
//               >
//                 <div className="flex justify-between items-start mb-6">
//                   <div className="text-lg text-gray-500">
//                     {formatDate(entry.created_at)}
//                   </div>
//                   <div className="flex gap-4">
//                     <button
//                       onClick={() => navigate(`/entry/${entry.id}`)}
//                       className="px-6 py-2 border border-teal-400 text-teal-600 rounded-xl hover:bg-teal-50 transition-all duration-200 text-lg"
//                     >
//                       Открыть
//                     </button>
//                     <button
//                       onClick={() => handleDelete(entry.id)}
//                       className="px-6 py-2 border border-red-400 text-red-600 rounded-xl hover:bg-red-50 transition-all duration-200 text-lg"
//                     >
//                       Удалить
//                     </button>
//                   </div>
//                 </div>

//                 <div className="space-y-4">
//                   <div>
//                     <h3 className="text-2xl font-semibold text-teal-600 mb-2">
//                       Ситуация
//                     </h3>
//                     <p className="text-xl">{entry.situation}</p>
//                   </div>

//                   <div>
//                     <h3 className="text-2xl font-semibold text-teal-600 mb-2">
//                       Мысли
//                     </h3>
//                     <p className="text-xl">{entry.thoughts}</p>
//                   </div>

//                   {entry.emotions && entry.emotions.length > 0 && (
//                     <div>
//                       <h3 className="text-2xl font-semibold text-teal-600 mb-2">
//                         Эмоции
//                       </h3>
//                       <div className="flex flex-wrap gap-3">
//                         {entry.emotions.map((emotion, index) => (
//                           <span
//                             key={index}
//                             className="bg-teal-100 text-teal-800 px-4 py-2 rounded-2xl text-lg"
//                           >
//                             {emotion.name} — {emotion.intensity}/10
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EntriesList;