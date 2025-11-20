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
