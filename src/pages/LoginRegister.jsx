import { useState } from "react";
import { authAPI } from '../../backend/api';
import { useNavigate } from 'react-router-dom';

export default function LoginRegister() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.email) newErrors.email = "Email обязателен";
    if (!formData.password) newErrors.password = "Пароль обязателен";
    
    if (!isLogin) {
      if (!formData.first_name) newErrors.first_name = "Имя обязательно";
      if (!formData.last_name) newErrors.last_name = "Фамилия обязательна";
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Подтверждение пароля обязательно";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Пароли не совпадают";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      let response;
      
      if (isLogin) {
        response = await authAPI.login({
          email: formData.email,
          password: formData.password
        });
      } else {
        response = await authAPI.register({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password
        });
      }

      if (response.token) {
        localStorage.setItem('authToken', response.token);
        navigate('/');
      } else {
        setErrors({ submit: response.message || 'Произошла ошибка' });
      }
      
    } catch (error) {
      setErrors({ submit: 'Ошибка подключения к серверу' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sky-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white p-12 rounded-3xl shadow-xl">
        <h2 className="text-4xl font-bold text-center mb-10">
          {isLogin ? "Вход" : "Регистрация"}
        </h2>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Email */}
          <div className="flex flex-col">
            <label className="text-lg font-medium mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Введите ваш email"
              className={`p-4 text-lg rounded-xl border ${
                errors.email ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-teal-400`}
            />
            {errors.email && (
              <span className="text-red-500 mt-1 text-sm">{errors.email}</span>
            )}
          </div>

          {/* Имя и Фамилия (только для регистрации) */}
          {!isLogin && (
            <>
              <div className="flex flex-col">
                <label className="text-lg font-medium mb-2" htmlFor="first_name">
                  Имя
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Введите ваше имя"
                  className={`p-4 text-lg rounded-xl border ${
                    errors.first_name ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-teal-400`}
                />
                {errors.first_name && (
                  <span className="text-red-500 mt-1 text-sm">{errors.first_name}</span>
                )}
              </div>

              <div className="flex flex-col">
                <label className="text-lg font-medium mb-2" htmlFor="last_name">
                  Фамилия
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Введите вашу фамилию"
                  className={`p-4 text-lg rounded-xl border ${
                    errors.last_name ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-teal-400`}
                />
                {errors.last_name && (
                  <span className="text-red-500 mt-1 text-sm">{errors.last_name}</span>
                )}
              </div>
            </>
          )}

          {/* Password */}
          <div className="flex flex-col">
            <label className="text-lg font-medium mb-2" htmlFor="password">
              Пароль
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Введите пароль"
              className={`p-4 text-lg rounded-xl border ${
                errors.password ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-teal-400`}
            />
            {errors.password && (
              <span className="text-red-500 mt-1 text-sm">{errors.password}</span>
            )}
          </div>

          {/* Confirm Password */}
          {!isLogin && (
            <div className="flex flex-col">
              <label
                className="text-lg font-medium mb-2"
                htmlFor="confirmPassword"
              >
                Подтвердите пароль
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Повторите пароль"
                className={`p-4 text-lg rounded-xl border ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-teal-400`}
              />
              {errors.confirmPassword && (
                <span className="text-red-500 mt-1 text-sm">
                  {errors.confirmPassword}
                </span>
              )}
            </div>
          )}

          {/* Submit Error */}
          {errors.submit && (
            <div className="text-red-500 text-center text-sm">{errors.submit}</div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 text-xl font-semibold bg-teal-400 hover:bg-teal-500 text-white rounded-xl transition-all duration-200 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Создать аккаунт')}
          </button>
        </form>

        <p className="text-center mt-6 text-lg">
          {isLogin ? "Нет аккаунта?" : "Уже есть аккаунт?"}{" "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setErrors({});
            }}
            className="text-teal-500 font-semibold hover:underline"
          >
            {isLogin ? "Зарегистрируйтесь" : "Войдите"}
          </button>
        </p>
      </div>
    </div>
  );
}


// import { useState } from "react";

// export default function LoginRegister() {
//   const [isLogin, setIsLogin] = useState(true);
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//     confirmPassword: "",
//   });
//   const [errors, setErrors] = useState({});

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//     setErrors({ ...errors, [e.target.name]: "" }); // убираем ошибку при изменении
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const newErrors = {};

//     // базовые проверки
//     if (!formData.email) newErrors.email = "Email обязателен";
//     if (!formData.password) newErrors.password = "Пароль обязателен";
//     if (!isLogin && formData.password !== formData.confirmPassword) {
//       newErrors.confirmPassword = "Пароли не совпадают";
//     }

//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors);
//       return;
//     }

//     console.log("Submitted:", formData);
//     // тут будет логика отправки на backend
//   };

//   return (
//     <div className="min-h-screen bg-sky-50 flex items-center justify-center p-6">
//       <div className="max-w-lg w-full bg-white p-12 rounded-3xl shadow-xl">
//         <h2 className="text-4xl font-bold text-center mb-10">
//           {isLogin ? "Вход" : "Регистрация"}
//         </h2>

//         <form className="space-y-6" onSubmit={handleSubmit}>
//           {/* Email */}
//           <div className="flex flex-col">
//             <label className="text-lg font-medium mb-2" htmlFor="email">
//               Email
//             </label>
//             <input
//               type="email"
//               id="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               placeholder="Введите ваш email"
//               className={`p-4 text-lg rounded-xl border ${
//                 errors.email ? "border-red-500" : "border-gray-300"
//               } focus:outline-none focus:ring-2 focus:ring-teal-400`}
//             />
//             {errors.email && (
//               <span className="text-red-500 mt-1 text-sm">{errors.email}</span>
//             )}
//           </div>

//           {/* Password */}
//           <div className="flex flex-col">
//             <label className="text-lg font-medium mb-2" htmlFor="password">
//               Пароль
//             </label>
//             <input
//               type="password"
//               id="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               placeholder="Введите пароль"
//               className={`p-4 text-lg rounded-xl border ${
//                 errors.password ? "border-red-500" : "border-gray-300"
//               } focus:outline-none focus:ring-2 focus:ring-teal-400`}
//             />
//             {errors.password && (
//               <span className="text-red-500 mt-1 text-sm">{errors.password}</span>
//             )}
//           </div>

//           {/* Confirm Password */}
//           {!isLogin && (
//             <div className="flex flex-col">
//               <label
//                 className="text-lg font-medium mb-2"
//                 htmlFor="confirmPassword"
//               >
//                 Подтвердите пароль
//               </label>
//               <input
//                 type="password"
//                 id="confirmPassword"
//                 name="confirmPassword"
//                 value={formData.confirmPassword}
//                 onChange={handleChange}
//                 placeholder="Повторите пароль"
//                 className={`p-4 text-lg rounded-xl border ${
//                   errors.confirmPassword ? "border-red-500" : "border-gray-300"
//                 } focus:outline-none focus:ring-2 focus:ring-teal-400`}
//               />
//               {errors.confirmPassword && (
//                 <span className="text-red-500 mt-1 text-sm">
//                   {errors.confirmPassword}
//                 </span>
//               )}
//             </div>
//           )}

//           {/* Submit */}
//           <button
//             type="submit"
//             className="w-full py-4 text-xl font-semibold bg-teal-400 hover:bg-teal-500 text-white rounded-xl transition-all duration-200"
//           >
//             {isLogin ? "Войти" : "Создать аккаунт"}
//           </button>
//         </form>

//         <p className="text-center mt-6 text-lg">
//           {isLogin ? "Нет аккаунта?" : "Уже есть аккаунт?"}{" "}
//           <button
//             onClick={() => {
//               setIsLogin(!isLogin);
//               setErrors({});
//             }}
//             className="text-teal-500 font-semibold hover:underline"
//           >
//             {isLogin ? "Зарегистрируйтесь" : "Войдите"}
//           </button>
//         </p>
//       </div>
//     </div>
//   );
// }










// // import { useState } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import { authAPI } from '../../backend/api';

// // const LoginRegister = () => {
// //   const [isLogin, setIsLogin] = useState(true);
// //   const [formData, setFormData] = useState({
// //     email: '',
// //     password: '',
// //     confirmPassword: '',
// //     first_name: '',
// //     last_name: '',
// //   });
// //   const [errors, setErrors] = useState({});
// //   const [loading, setLoading] = useState(false);
// //   const navigate = useNavigate();

// //   const handleChange = (e) => {
// //     const { name, value } = e.target;
// //     setFormData(prev => ({
// //       ...prev,
// //       [name]: value
// //     }));
// //     // Убираем ошибку для текущего поля
// //     if (errors[name]) {
// //       setErrors(prev => ({
// //         ...prev,
// //         [name]: ''
// //       }));
// //     }
// //   };

// //   const validateForm = () => {
// //     const newErrors = {};

// //     if (!formData.email) newErrors.email = 'Email обязателен';
// //     if (!formData.password) newErrors.password = 'Пароль обязателен';
    
// //     if (!isLogin) {
// //       if (!formData.first_name) newErrors.first_name = 'Имя обязательно';
// //       if (!formData.last_name) newErrors.last_name = 'Фамилия обязательна';
// //       if (!formData.confirmPassword) {
// //         newErrors.confirmPassword = 'Подтверждение пароля обязательно';
// //       } else if (formData.password !== formData.confirmPassword) {
// //         newErrors.confirmPassword = 'Пароли не совпадают';
// //       }
// //     }

// //     setErrors(newErrors);
// //     return Object.keys(newErrors).length === 0;
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
    
// //     if (!validateForm()) return;

// //     setLoading(true);

// //     try {
// //       let response;
      
// //       if (isLogin) {
// //         // Логин
// //         response = await authAPI.login({
// //           email: formData.email,
// //           password: formData.password
// //         });
// //       } else {
// //         // Регистрация
// //         response = await authAPI.register({
// //           first_name: formData.first_name,
// //           last_name: formData.last_name,
// //           email: formData.email,
// //           password: formData.password
// //         });
// //       }

// //       // Сохраняем токен
// //       if (response.token) {
// //         localStorage.setItem('authToken', response.token);
// //         localStorage.setItem('user', JSON.stringify(response.user));
// //       }

// //       // Переходим на главную страницу
// //       navigate('/');
      
// //     } catch (error) {
// //       setErrors({ submit: error.message });
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="min-h-screen bg-sky-50 flex items-center justify-center p-6">
// //       <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
// //         <h2 className="text-3xl font-bold text-center text-teal-600 mb-8">
// //           {isLogin ? 'Вход' : 'Регистрация'}
// //         </h2>

// //         <form onSubmit={handleSubmit} className="space-y-6">
// //           {!isLogin && (
// //             <>
// //               <div>
// //                 <input
// //                   type="text"
// //                   name="first_name"
// //                   placeholder="Имя"
// //                   value={formData.first_name}
// //                   onChange={handleChange}
// //                   className="w-full p-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent"
// //                 />
// //                 {errors.first_name && (
// //                   <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
// //                 )}
// //               </div>
              
// //               <div>
// //                 <input
// //                   type="text"
// //                   name="last_name"
// //                   placeholder="Фамилия"
// //                   value={formData.last_name}
// //                   onChange={handleChange}
// //                   className="w-full p-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent"
// //                 />
// //                 {errors.last_name && (
// //                   <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
// //                 )}
// //               </div>
// //             </>
// //           )}

// //           <div>
// //             <input
// //               type="email"
// //               name="email"
// //               placeholder="Email"
// //               value={formData.email}
// //               onChange={handleChange}
// //               className="w-full p-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent"
// //             />
// //             {errors.email && (
// //               <p className="text-red-500 text-sm mt-1">{errors.email}</p>
// //             )}
// //           </div>

// //           <div>
// //             <input
// //               type="password"
// //               name="password"
// //               placeholder="Пароль"
// //               value={formData.password}
// //               onChange={handleChange}
// //               className="w-full p-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent"
// //             />
// //             {errors.password && (
// //               <p className="text-red-500 text-sm mt-1">{errors.password}</p>
// //             )}
// //           </div>

// //           {!isLogin && (
// //             <div>
// //               <input
// //                 type="password"
// //                 name="confirmPassword"
// //                 placeholder="Подтвердите пароль"
// //                 value={formData.confirmPassword}
// //                 onChange={handleChange}
// //                 className="w-full p-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent"
// //               />
// //               {errors.confirmPassword && (
// //                 <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
// //               )}
// //             </div>
// //           )}

// //           {errors.submit && (
// //             <p className="text-red-500 text-center">{errors.submit}</p>
// //           )}

// //           <button
// //             type="submit"
// //             disabled={loading}
// //             className="w-full bg-teal-400 text-white py-4 text-xl font-semibold rounded-xl hover:bg-teal-500 transition-all duration-200 disabled:opacity-50"
// //           >
// //             {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
// //           </button>
// //         </form>

// //         <div className="text-center mt-6">
// //           <button
// //             onClick={() => setIsLogin(!isLogin)}
// //             className="text-teal-500 hover:underline"
// //           >
// //             {isLogin ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default LoginRegister;