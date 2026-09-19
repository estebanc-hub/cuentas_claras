import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { obtenerGastos, obtenerMiembros, obtenerPagos } from './queries'
import { calcularBalances, calcularDeudas } from './balance'
import type { BalanceMiembro, Deuda, GastoConDivision, Miembro, Pago } from './types'

interface DataContextValue {
  miembros: Miembro[]
  gastos: GastoConDivision[]
  pagos: Pago[]
  balances: BalanceMiembro[]
  deudas: Deuda[]
  cargando: boolean
  error: string | null
  recargar: () => Promise<void>
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [miembros, setMiembros] = useState<Miembro[]>([])
  const [gastos, setGastos] = useState<GastoConDivision[]>([])
  const [pagos, setPagos] = useState<Pago[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const recargar = useCallback(async () => {
    try {
      setError(null)
      const [m, g, p] = await Promise.all([obtenerMiembros(), obtenerGastos(), obtenerPagos()])
      setMiembros(m)
      setGastos(g)
      setPagos(p)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ocurrió un error al cargar los datos.')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    recargar()
  }, [recargar])

  const balances = useMemo(() => calcularBalances(miembros, gastos, pagos), [miembros, gastos, pagos])
  const deudas = useMemo(() => calcularDeudas(balances), [balances])

  return (
    <DataContext.Provider
      value={{ miembros, gastos, pagos, balances, deudas, cargando, error, recargar }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData debe usarse dentro de DataProvider')
  return ctx
}
