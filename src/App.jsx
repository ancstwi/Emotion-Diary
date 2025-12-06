import { Routes, Route } from 'react-router-dom'
import Start from './pages/Start'
import LoginRegister from './pages/LoginRegister'
import EntryList from './pages/EntriesList'
import EntryForm from './pages/EntriesForm';
import EmotionStats from './pages/EmotionStat';
import EntryDetail from './pages/Entry';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Start />} />
      <Route path="/login-register" element={<LoginRegister />} />
      <Route path='/entries-form'element={<EntryForm />} />
      <Route path='/entries-list'element={<EntryList />} />
      <Route path="/entries/:id" element={<EntryDetail />} />
      <Route path='/stat'element={<EmotionStats />} />

    </Routes>
  )
}



export default App
