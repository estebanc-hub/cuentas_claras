import { HashRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { DataProvider } from './lib/DataContext'
import { BalancePage } from './pages/BalancePage'
import { HistorialPage } from './pages/HistorialPage'
import { MiembrosPage } from './pages/MiembrosPage'
import { ResumenPage } from './pages/ResumenPage'

function App() {
  return (
    <DataProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<BalancePage />} />
            <Route path="historial" element={<HistorialPage />} />
            <Route path="miembros" element={<MiembrosPage />} />
            <Route path="resumen" element={<ResumenPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </DataProvider>
  )
}

export default App
