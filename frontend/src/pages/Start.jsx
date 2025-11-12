import { useNavigate } from "react-router-dom";

export default function Start() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Удаляем токен из localStorage
    localStorage.removeItem('authToken');
    // Перенаправляем на страницу входа
    navigate('/login-register');
  };

  return (
    <div className="min-h-screen bg-sky-50 flex flex-col items-center justify-center p-6">
      {/* Кнопка выхода в правом верхнем углу */}
      <div className="absolute top-6 right-6">
        <button
          onClick={handleLogout}
          className="px-6 py-2 text-lg font-semibold bg-teal-100 hover:bg-teal-200 text-teal-700 rounded-xl transition-all duration-200 border border-teal-200"
        >
          Выйти
        </button>
      </div>
      {/* Приветствие */}
      <h1 className="text-5xl font-bold mb-10 text-teal-600 text-center">
        Добро пожаловать в дневник эмоций
      </h1>

<div className="bg-white bg-opacity-100 p-6 rounded-2xl shadow-md mb-10 max-w-2xl text-center mx-auto">
  <p className="text-lg text-gray-700">
    Отслеживай ситуации, мысли и эмоции, чтобы понимать свои реакции 
    и управлять ими по модели ABC. Каждая запись помогает лучше осознавать 
    свои состояния и развивать навыки саморегуляции.
  </p>
</div>


      {/* Основные действия */}
      <div className="flex flex-col gap-6 w-full max-w-md">
        <button
          onClick={() => navigate('/entries-form')}
          className="w-full py-4 text-xl font-semibold bg-teal-400 hover:bg-teal-500 text-white rounded-xl transition-all duration-200"
        >
          Создать новую запись
        </button>

        <button
          onClick={() => navigate('/entries-list')}
          className="w-full py-4 text-xl font-semibold bg-white border border-teal-400 text-teal-600 rounded-xl hover:bg-teal-50 transition-all duration-200"
        >
          Мои записи
        </button>

        <button
          onClick={() => navigate('/stat')}
          className="w-full py-4 text-xl font-semibold bg-white border border-teal-400 text-teal-600 rounded-xl hover:bg-teal-50 transition-all duration-200"
        >
          Статистика эмоций
        </button>
      </div>
    </div>
  );
}
