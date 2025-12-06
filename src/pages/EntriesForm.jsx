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

            {/* Submit убираем из scrollable, перенесём в футер */}
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









// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { entriesAPI, emotionsAPI } from '../../backend/api';

// const EntriesForm = () => {
//   const [formData, setFormData] = useState({
//     situation: '',
//     thoughts: '',
//     body_reaction: '',
//     behavior_reaction: '',
//     emotion_id: '',
//     intensity: 5
//   });
//   const [emotionsList, setEmotionsList] = useState([]);
//   const [selectedEmotions, setSelectedEmotions] = useState([]);
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     loadEmotions();
//   }, []);

//   const loadEmotions = async () => {
//     try {
//       const response = await emotionsAPI.getList();
//       setEmotionsList(response.emotions || []);
//     } catch (error) {
//       console.error('Error loading emotions:', error);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
    
//     if (errors[name]) {
//       setErrors(prev => ({
//         ...prev,
//         [name]: ''
//       }));
//     }
//   };

//   const handleAddEmotion = () => {
//     if (!formData.emotion_id) {
//       setErrors(prev => ({ ...prev, emotion: 'Выберите эмоцию' }));
//       return;
//     }

//     const emotion = emotionsList.find(e => e.id === parseInt(formData.emotion_id));
//     if (!emotion) return;

//     // Проверяем, не добавлена ли уже эта эмоция
//     if (selectedEmotions.find(e => e.id === emotion.id)) {
//       setErrors(prev => ({ ...prev, emotion: 'Эта эмоция уже добавлена' }));
//       return;
//     }

//     const newEmotion = {
//       id: emotion.id,
//       name: emotion.name,
//       intensity: parseInt(formData.intensity)
//     };

//     setSelectedEmotions(prev => [...prev, newEmotion]);
//     setFormData(prev => ({ ...prev, emotion_id: '', intensity: 5 }));
//     setErrors(prev => ({ ...prev, emotion: '' }));
//   };

//   const handleRemoveEmotion = (emotionId) => {
//     setSelectedEmotions(prev => prev.filter(e => e.id !== emotionId));
//   };

//   const validateForm = () => {
//     const newErrors = {};

//     if (!formData.situation.trim()) newErrors.situation = 'Описание ситуации обязательно';
//     if (!formData.thoughts.trim()) newErrors.thoughts = 'Мысли обязательны';
//     if (!formData.body_reaction.trim()) newErrors.body_reaction = 'Реакция тела обязательна';
//     if (!formData.behavior_reaction.trim()) newErrors.behavior_reaction = 'Реакция поведения обязательна';
//     if (selectedEmotions.length === 0) newErrors.emotions = 'Добавьте хотя бы одну эмоцию';

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!validateForm()) return;

//     setLoading(true);

//     try {
//       // Сначала создаем запись
//       const entryResponse = await entriesAPI.create({
//         situation: formData.situation,
//         thoughts: formData.thoughts,
//         body_reaction: formData.body_reaction,
//         behavior_reaction: formData.behavior_reaction
//       });

//       const entryId = entryResponse.id;

//       // Затем добавляем все эмоции к записи
//       for (const emotion of selectedEmotions) {
//         await emotionsAPI.addToEntry({
//           entry_id: entryId,
//           emotion_id: emotion.id,
//           intensity: emotion.intensity
//         });
//       }

//       // Переходим к списку записей
//       navigate('/entries-list');
      
//     } catch (error) {
//       setErrors({ submit: error.message });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-sky-50 p-6">
//       <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-10">
//         <h1 className="text-5xl font-bold text-center text-teal-600 mb-8">
//           Новая запись
//         </h1>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Ситуация */}
//           <div>
//             <label className="block text-2xl font-semibold text-teal-600 mb-3">
//               Ситуация (С)
//             </label>
//             <textarea
//               name="situation"
//               value={formData.situation}
//               onChange={handleChange}
//               placeholder="Опишите ситуацию, которая вызвала эмоции..."
//               rows="3"
//               className="w-full p-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none"
//             />
//             {errors.situation && (
//               <p className="text-red-500 text-sm mt-1">{errors.situation}</p>
//             )}
//           </div>

//           {/* Мысли */}
//           <div>
//             <label className="block text-2xl font-semibold text-teal-600 mb-3">
//               Мысли (М)
//             </label>
//             <textarea
//               name="thoughts"
//               value={formData.thoughts}
//               onChange={handleChange}
//               placeholder="Какие мысли у вас возникли в этой ситуации?"
//               rows="3"
//               className="w-full p-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none"
//             />
//             {errors.thoughts && (
//               <p className="text-red-500 text-sm mt-1">{errors.thoughts}</p>
//             )}
//           </div>

//                     {/* Добавление эмоций */}
//           <div className="border-t pt-6">
//             <label className="block text-2xl font-semibold text-teal-600 mb-4">
//               Эмоции (Э)
//             </label>

//             <div className="flex gap-4 mb-4">
//               <select
//                 name="emotion_id"
//                 value={formData.emotion_id}
//                 onChange={handleChange}
//                 className="flex-1 p-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent"
//               >
//                 <option value="">Выберите эмоцию</option>
//                 {emotionsList.map(emotion => (
//                   <option key={emotion.id} value={emotion.id}>
//                     {emotion.name}
//                   </option>
//                 ))}
//               </select>

//               <div className="flex-1">
//                 <div className="flex items-center gap-4">
//                   <input
//                     type="range"
//                     name="intensity"
//                     min="1"
//                     max="10"
//                     value={formData.intensity}
//                     onChange={handleChange}
//                     className="flex-1"
//                   />
//                   <span className="text-xl font-semibold text-purple-400 min-w-12">
//                     {formData.intensity}/10
//                   </span>
//                 </div>
//               </div>

//               <button
//                 type="button"
//                 onClick={handleAddEmotion}
//                 className="bg-teal-400 text-white px-6 py-4 text-lg font-semibold rounded-xl hover:bg-teal-500 transition-all duration-200"
//               >
//                 Добавить
//               </button>
//             </div>

//             {errors.emotion && (
//               <p className="text-red-500 text-sm mb-2">{errors.emotion}</p>
//             )}

//             {/* Список выбранных эмоций */}
//             {selectedEmotions.length > 0 && (
//               <div className="flex flex-wrap gap-3 mb-4">
//                 {selectedEmotions.map(emotion => (
//                   <div
//                     key={emotion.id}
//                     className="bg-teal-100 text-teal-800 px-4 py-2 rounded-2xl text-lg flex items-center gap-3"
//                   >
//                     <span>
//                       {emotion.name} — {emotion.intensity}/10
//                     </span>
//                     <button
//                       type="button"
//                       onClick={() => handleRemoveEmotion(emotion.id)}
//                       className="text-red-500 hover:text-red-700 text-lg"
//                     >
//                       ×
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             )}

//           {/* Реакция тела */}
//           <div>
//             <label className="block text-2xl font-semibold text-teal-600 mb-3">
//               Реакция тела (Р)
//             </label>
//             <textarea
//               name="body_reaction"
//               value={formData.body_reaction}
//               onChange={handleChange}
//               placeholder="Как отреагировало ваше тело? (напряжение, дрожь, учащенное сердцебиение...)"
//               rows="2"
//               className="w-full p-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none"
//             />
//             {errors.body_reaction && (
//               <p className="text-red-500 text-sm mt-1">{errors.body_reaction}</p>
//             )}
//           </div>

//           {/* Реакция поведения */}
//           <div>
//             <label className="block text-2xl font-semibold text-teal-600 mb-3">
//               Реакция поведения (Р)
//             </label>
//             <textarea
//               name="behavior_reaction"
//               value={formData.behavior_reaction}
//               onChange={handleChange}
//               placeholder="Как вы повели себя в этой ситуации?"
//               rows="2"
//               className="w-full p-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none"
//             />
//             {errors.behavior_reaction && (
//               <p className="text-red-500 text-sm mt-1">{errors.behavior_reaction}</p>
//             )}
//           </div>



//             {errors.emotions && (
//               <p className="text-red-500 text-sm">{errors.emotions}</p>
//             )}
//           </div>

//           {errors.submit && (
//             <p className="text-red-500 text-center">{errors.submit}</p>
//           )}

//           {/* Кнопки */}
//           <div className="flex gap-4 pt-6">
//             <button
//               type="button"
//               onClick={() => navigate('/')}
//               className="flex-1 bg-gray-300 text-gray-700 py-4 text-xl font-semibold rounded-xl hover:bg-gray-400 transition-all duration-200"
//             >
//               Отмена
//             </button>
//             <button
//               type="submit"
//               disabled={loading}
//               className="flex-1 bg-teal-400 text-white py-4 text-xl font-semibold rounded-xl hover:bg-teal-500 transition-all duration-200 disabled:opacity-50"
//             >
//               {loading ? 'Создание...' : 'Создать запись'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default EntriesForm;