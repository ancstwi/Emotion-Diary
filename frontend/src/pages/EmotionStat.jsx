import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { entriesAPI } from "../../backend/api";

const colors = {
  Радость: "#34D399",
  Грусть: "#F87171", 
  Тревога: "#60A5FA",
  Гнев: "#FBBF24",
  Любовь: "#A78BFA",
  Оптимизм: "#10B981",
  Восторг: "#059669",
  Безмятежность: "#6EE7B7",
  Восхищение: "#34D399",
  Доверие: "#A7F3D0",
  Принятие: "#6EE7B7",
  Ужас: "#DC2626",
  Страх: "#EF4444",
  Покорность: "#9CA3AF",
  Изумление: "#3B82F6",
  Удивление: "#60A5FA",
  Возбуждение: "#6366F1",
  Трепет: "#8B5CF6",
  Горе: "#7C3AED",
  Печаль: "#A78BFA",
  Разочарование: "#F59E0B",
  Отвращение: "#D97706",
  Неудовольствие: "#FBBF24",
  Скука: "#FCD34D",
  Раскаяние: "#FDE68A",
  Злость: "#F97316",
  Досада: "#FB923C",
  Презрение: "#FDBA74",
  Настороженность: "#FEF3C7",
  Ожидание: "#FEF3C7",
  Интерес: "#A7F3D0",
  Агрессия: "#DC2626",
  Гордость: "#7C3AED"
};

function getColorForEmotion(name) {
  return colors[name] || "#34D399";
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekEnd(date) {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export default function EmotionStats() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("week");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = new Date();

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const response = await entriesAPI.getAll();
      setEntries(response.entries || []);
    } catch (err) {
      console.error('Error loading entries:', err);
    } finally {
      setLoading(false);
    }
  };

  // Анализируем эмоции пользователя и находим топ-5
  const analyzeUserEmotions = () => {
    const emotionStats = {};

    entries.forEach(entry => {
      if (entry.emotions) {
        entry.emotions.forEach(emotionData => {
          const emotionName = emotionData.name;
          if (!emotionStats[emotionName]) {
            emotionStats[emotionName] = {
              totalIntensity: 0,
              count: 0,
              occurrences: 0
            };
          }
          emotionStats[emotionName].totalIntensity += emotionData.intensity;
          emotionStats[emotionName].count++;
          emotionStats[emotionName].occurrences++;
        });
      }
    });

    const sortedEmotions = Object.entries(emotionStats)
      .map(([name, stats]) => ({
        name,
        average: stats.totalIntensity / stats.count,
        frequency: stats.occurrences
      }))
      .sort((a, b) => {
        if (b.frequency !== a.frequency) {
          return b.frequency - a.frequency;
        }
        return b.average - a.average;
      })
      .slice(0, 5);

    return sortedEmotions;
  };

  // Преобразуем записи в формат для графика
  const prepareChartData = () => {
    const userTopEmotions = analyzeUserEmotions();
    const topEmotionNames = userTopEmotions.map(e => e.name);
    const chartData = {};

    entries.forEach(entry => {
      const date = new Date(entry.created_at).toISOString().split('T')[0];
      
      if (!chartData[date]) {
        chartData[date] = { date };
        topEmotionNames.forEach(emotion => {
          chartData[date][emotion] = 0;
        });
      }

      if (entry.emotions) {
        entry.emotions.forEach(emotionData => {
          const emotionName = emotionData.name;
          if (topEmotionNames.includes(emotionName)) {
            chartData[date][emotionName] = emotionData.intensity;
          }
        });
      }
    });

    return {
      chartData: Object.values(chartData).sort((a, b) => new Date(a.date) - new Date(b.date)),
      topEmotions: userTopEmotions
    };
  };

  const { chartData, topEmotions } = prepareChartData();
  const topEmotionNames = topEmotions.map(e => e.name);

  const filteredData = chartData.filter((entry) => {
    const entryDate = new Date(entry.date);
    if (filter === "week") {
      const start = getWeekStart(today);
      const end = getWeekEnd(today);
      return entryDate >= start && entryDate <= end;
    }
    if (filter === "month") {
      return entryDate.getFullYear() === today.getFullYear() &&
             entryDate.getMonth() === today.getMonth();
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-sky-50 flex items-center justify-center">
        <div className="text-2xl text-teal-600">Загрузка статистики...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-50 flex flex-col">
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-5xl font-bold mb-8 text-center text-teal-600">
            Статистика эмоций
          </h1>

          <div className="flex justify-center mb-8">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400 text-lg"
            >
              <option value="week">За неделю</option>
              <option value="month">За месяц</option>
              <option value="all">За всё время</option>
            </select>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-xl mb-10">
            <h2 className="text-3xl font-semibold mb-4 text-teal-600">
              Динамика ваших топ-5 эмоций
            </h2>
            {filteredData.length > 0 && topEmotionNames.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={filteredData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Legend />
                  {topEmotionNames.map((emotion) => (
                    <Line
                      key={emotion}
                      type="monotone"
                      dataKey={emotion}
                      stroke={getColorForEmotion(emotion)}
                      strokeWidth={3}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-gray-500 py-10">
                {entries.length === 0 ? "Нет записей для анализа" : "Недостаточно данных для построения графика"}
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-xl mb-20">
            <h2 className="text-3xl font-semibold mb-4 text-teal-600">Ваши топ-5 эмоций</h2>
            {topEmotions.length > 0 ? (
              <div className="flex flex-col gap-4">
                {topEmotions.map((emotion) => (
                  <div key={emotion.name} className="flex items-center gap-4">
                    <span className="w-40 text-lg font-medium">{emotion.name}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-teal-400 h-4 rounded-full"
                        style={{ width: `${(emotion.average / 10) * 100}%` }}
                      ></div>
                    </div>
                    <span className="w-16 text-right font-semibold">{emotion.average.toFixed(1)}/10</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                Нет данных об эмоциях
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-white p-4 shadow-inner flex justify-center gap-4 z-50">
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