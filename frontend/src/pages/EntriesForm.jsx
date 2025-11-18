import { entriesAPI, emotionsAPI } from '../../backend/api';
import { useState } from "react";
import { useNavigate } from "react-router-dom";


// Временно используем заглушку - в реальности нужно получать с бэкенда
const emotionsList = [
  { id: 1, name: "Оптимизм" }, { id: 2, name: "Восторг" }, { id: 3, name: "Радость" },
  { id: 4, name: "Безмятежность" }, { id: 5, name: "Восхищение" }, { id: 6, name: "Доверие" },
  { id: 7, name: "Принятие" }, { id: 8, name: "Любовь" }, { id: 9, name: "Ужас" },
  { id: 10, name: "Страх" }, { id: 11, name: "Тревога" }, { id: 12, name: "Покорность" },
  { id: 13, name: "Изумление" }, { id: 14, name: "Удивление" }, { id: 15, name: "Возбуждение" },
  { id: 16, name: "Трепет" }, { id: 17, name: "Горе" }, { id: 18, name: "Грусть" },
  { id: 19, name: "Печаль" }, { id: 20, name: "Разочарование" }, { id: 21, name: "Отвращение" },
  { id: 22, name: "Неудовольствие" }, { id: 23, name: "Скука" }, { id: 24, name: "Раскаяние" },
  { id: 25, name: "Гнев" }, { id: 26, name: "Злость" }, { id: 27, name: "Досада" },
  { id: 28, name: "Презрение" }, { id: 29, name: "Настороженность" }, { id: 30, name: "Ожидание" },
  { id: 31, name: "Интерес" }, { id: 32, name: "Агрессия" }
];

export default function EntryForm() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // очищаем ошибку при изменении поля
  };

  const [formData, setFormData] = useState({
    situation: "",
    thoughts: "",
    bodyReaction: "",
    behaviorReaction: "",
    emotionName: emotionsList[0],
    emotionIntensity: 5,
    emotions: [],
  });

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Проверяем, что все обязательные поля заполнены
  if (!formData.situation || !formData.thoughts || !formData.bodyReaction || !formData.behaviorReaction) {
    setError("Заполните все поля");
    return;
  }
  
  if (formData.emotions.length === 0) {
    setError("Добавьте хотя бы одну эмоцию перед сохранением.");
    return;
  }

  setLoading(true);

  try {
    // 1. Создаем запись в базе данных
    const entryResponse = await entriesAPI.create({
      situation: formData.situation,
      thoughts: formData.thoughts,
      body_reaction: formData.bodyReaction,
      behavior_reaction: formData.behaviorReaction
    });

    const entryId = entryResponse.id;

    // 2. Добавляем все эмоции к записи
    for (const emotion of formData.emotions) {
      // Находим ID эмоции по имени
      const emotionObj = emotionsList.find(e => e.name === emotion.name);
      if (emotionObj) {
        await emotionsAPI.addToEntry({
          entry_id: entryId,
          emotion_id: emotionObj.id,
          intensity: emotion.intensity
        });
      }
    }

    // 3. Успешное сохранение
    alert("Запись успешно сохранена!");
    
    // 4. Очищаем форму
    setFormData({
      situation: "",
      thoughts: "",
      bodyReaction: "",
      behaviorReaction: "",
      emotionName: emotionsList[0],
      emotionIntensity: 5,
      emotions: [],
    });
    setError("");
    
    // 5. Переходим к списку записей
    navigate('/entries-list');
    
  } catch (error) {
    console.error('Ошибка при сохранении:', error);
    setError("Ошибка при сохранении записи: " + error.message);
  } finally {
    setLoading(false);
  }
};

  const addEmotion = () => {
    setError("");
    if (!formData.emotions.find((e) => e.name === formData.emotionName)) {
      setFormData({
        ...formData,
        emotions: [
          ...formData.emotions,
          { name: formData.emotionName, intensity: formData.emotionIntensity },
        ],
      });
    }
  };

  const removeEmotion = (name) => {
    setFormData({
      ...formData,
      emotions: formData.emotions.filter((e) => e.name !== name),
    });
  };


  return (
    <div className="min-h-screen bg-sky-50 flex flex-col">
      {/* Прокручиваемая часть */}
      <div className="flex-1 overflow-y-auto p-8 pb-32">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-10">
          <h1 className="text-5xl font-bold mb-8 text-center text-teal-600">
            Новая запись
          </h1>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Ситуация */}
            <div className="flex flex-col">
              <label className="text-xl font-medium mb-2">Ситуация (С)</label>
              <textarea
                name="situation"
                value={formData.situation}
                onChange={handleChange}
                placeholder="Что произошло? Опишите ситуацию"
                className="p-4 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400"
                rows={3}
                required
              />
            </div>

            {/* Мысли */}
            <div className="flex flex-col">
              <label className="text-xl font-medium mb-2">Мысли (М)</label>
              <textarea
                name="thoughts"
                value={formData.thoughts}
                onChange={handleChange}
                placeholder="Какие мысли пришли в голову?"
                className="p-4 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400"
                rows={3}
                required
              />
            </div>

            {/* Эмоции */}
            <div className="flex flex-col">
              <label className="text-xl font-medium mb-2">Эмоции (Э)</label>
              <div className="flex gap-5 mb-2 items-center">
                <select
                  name="emotionName"
                  value={formData.emotionName}
                  onChange={handleChange}
                  className="p-3 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400 flex-1"
                >
                  {emotionsList.map((emotion) => (
                    <option key={emotion.id} value={emotion.name}>
                      {emotion.name}
                    </option>
                    ))}
                  </select>

                <div className="flex flex-col items-center">
                  <input
                    type="range"
                    name="emotionIntensity"
                    min={1}
                    max={10}
                    value={formData.emotionIntensity}
                    onChange={handleChange}
                    className="w-40 accent-purple-300 focus:outline-none focus:ring-0 hover:accent-purple-300"
                  />
                  <span className="text-base mt-1 font-semibold text-purple-400">
                    Интенсивность: {formData.emotionIntensity}/10
                  </span>
                </div>

                <button
                  type="button"
                  onClick={addEmotion}
                  className="bg-teal-400 text-white rounded-xl px-4 py-2 hover:bg-teal-500 transition"
                >
                  Добавить
                </button>
              </div>

              {/* Список выбранных эмоций */}
              <div className="flex flex-wrap gap-3">
                {formData.emotions.map((e) => (
                  <span
                    key={e.name}
                    className="px-4 py-2 bg-teal-100 text-teal-800 rounded-2xl text-lg font-medium"
                  >
                    {e.name} — {e.intensity}/10
                    <button
                      type="button"
                      onClick={() => removeEmotion(e.name)}
                      className="ml-2 text-red-500 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {error && (
                <span className="text-red-500 text-base font-medium mt-2">
                  {error}
                </span>
              )}
            </div>

            {/* Реакция - тело */}
            <div className="flex flex-col">
              <label className="text-xl font-medium mb-2">Реакция (тело)</label>
              <textarea
                name="bodyReaction"
                value={formData.bodyReaction}
                onChange={handleChange}
                placeholder="Какие ощущения вы испытывали в теле?"
                className="p-4 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400"
                rows={2}
                required
              />
            </div>

            {/* Реакция - поведение */}
            <div className="flex flex-col">
              <label className="text-xl font-medium mb-2">Реакция (поведение)</label>
              <textarea
                name="behaviorReaction"
                value={formData.behaviorReaction}
                onChange={handleChange}
                placeholder="Что вы сделали?"
                className="p-4 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400"
                rows={2}
                required
              />
            </div>
          </form>
        </div>
      </div>

      {/* Фиксированный блок кнопок */}
      <div className="fixed bottom-0 left-0 w-full bg-white p-4 shadow-inner flex justify-center gap-4 z-50">
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-teal-400 text-white rounded-xl hover:bg-teal-500 transition"
        >
          На главный экран
        </button>
        <button
        onClick={handleSubmit}
        disabled={loading}
        className={`px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {loading ? 'Сохранение...' : 'Сохранить запись'}
      </button>
      </div>
    </div>
  );
}
