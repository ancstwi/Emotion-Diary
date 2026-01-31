const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const envPath = path.join(root, '.env');
const examplePath = path.join(root, '.env.example');

if (fs.existsSync(envPath)) {
  console.log('backend/.env уже есть — не перезаписываю.');
  process.exit(0);
}
if (!fs.existsSync(examplePath)) {
  console.error('Нет файла backend/.env.example');
  process.exit(1);
}
fs.copyFileSync(examplePath, envPath);
console.log('Создан backend/.env из .env.example.');
console.log('Проверьте backend/.env и заполните необходимые переменные.');
