import { useMemo, useState } from 'react'
import { useData } from '../lib/DataContext'
import { MemberAvatar } from '../components/MemberAvatar'
import { CategoryBadge } from '../components/CategoryBadge'
import { formatoFecha, formatoMoneda } from '../lib/format'
import { ExpenseFormModal } from '../components/ExpenseFormModal'
import { CATEGORIAS } from '../lib/types'
import type { Categoria, GastoConDivision } from '../lib/types'

export function HistorialPage() {
  const { gastos, miembros, cargando, error } = useData()
  const [filtroCategoria, setFiltroCategoria] = useState<Categoria | ''>('')
  const [filtroMiembro, setFiltroMiembro] = useState('')
  const [gastoAEditar, setGastoAEditar] = useState<GastoConDivision | null>(null)

  const miembroPorId = useMemo(() => new Map(miembros.map((m) => [m.id, m])), [miembros])

  const gastosFiltrados = useMemo(() => {
    return gastos.filter((g) => {
      if (filtroCategoria && g.categoria !== filtroCategoria) return false
      if (filtroMiembro && g.pagado_por_id !== filtroMiembro) return false
      return true
    })
  }, [gastos, filtroCategoria, filtroMiembro])

  if (cargando) return <p className="text-(--color-text-secondary)">Cargando…</p>
  if (error) return <p className="text-(--color-negative)">{error}</p>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-(--color-text)">Historial de gastos</h2>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          className="rounded-xl border border-(--color-border) bg-(--color-card) px-3 py-2 text-sm"
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value as Categoria | '')}
        >
          <option value="">Todas las categorías</option>
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          className="rounded-xl border border-(--color-border) bg-(--color-card) px-3 py-2 text-sm"
          value={filtroMiembro}
          onChange={(e) => setFiltroMiembro(e.target.value)}
        >
          <option value="">Cualquiera que pagó</option>
          {miembros.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nombre}
            </option>
          ))}
        </select>
      </div>

      {gastosFiltrados.length === 0 ? (
        <p className="rounded-[16px] border border-(--color-border) bg-(--color-card) p-6 text-center text-(--color-text-secondary)">
          No hay gastos que coincidan con estos filtros.
        </p>
      ) : (
        <div className="overflow-hidden rounded-[16px] border border-(--color-border) bg-(--color-card)">
          {/* Desktop */}
          <table className="hidden w-full text-sm sm:table">
            <thead>
              <tr className="border-b border-(--color-border) text-left text-(--color-text-secondary)">
                <th className="px-4 py-3 font-medium">Descripción</th>
                <th className="px-4 py-3 font-medium">Quién pagó</th>
                <th className="px-4 py-3 font-medium">Categoría</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 text-right font-medium">Monto</th>
              </tr>
            </thead>
            <tbody>
              {gastosFiltrados.map((g) => {
                const pagador = miembroPorId.get(g.pagado_por_id)
                return (
                  <tr
                    key={g.id}
                    onClick={() => setGastoAEditar(g)}
                    className="cursor-pointer border-b border-(--color-border) last:border-0 hover:bg-(--color-bg)"
                  >
                    <td className="px-4 py-3 font-medium text-(--color-text)">{g.descripcion}</td>
                    <td className="px-4 py-3">
                      {pagador && (
                        <div className="flex items-center gap-2">
                          <MemberAvatar miembro={pagador} size={24} />
                          <span className="text-(--color-text)">{pagador.nombre}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <CategoryBadge categoria={g.categoria} />
                    </td>
                    <td className="px-4 py-3 text-(--color-text-secondary)">
                      {formatoFecha(g.fecha)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-(--color-text)">
                      {formatoMoneda(g.monto)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Mobile */}
          <div className="divide-y divide-(--color-border) sm:hidden">
            {gastosFiltrados.map((g) => {
              const pagador = miembroPorId.get(g.pagado_por_id)
              return (
                <button
                  key={g.id}
                  onClick={() => setGastoAEditar(g)}
                  className="flex w-full flex-col gap-1 px-4 py-3 text-left hover:bg-(--color-bg)"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-(--color-text)">{g.descripcion}</span>
                    <span className="font-bold text-(--color-text)">{formatoMoneda(g.monto)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-(--color-text-secondary)">
                    <div className="flex items-center gap-2">
                      {pagador && <MemberAvatar miembro={pagador} size={20} />}
                      <span>{pagador?.nombre}</span>
                    </div>
                    <span>{formatoFecha(g.fecha)}</span>
                  </div>
                  <CategoryBadge categoria={g.categoria} />
                </button>
              )
            })}
          </div>
        </div>
      )}

      {gastoAEditar && (
        <ExpenseFormModal gastoAEditar={gastoAEditar} onClose={() => setGastoAEditar(null)} />
      )}
    </div>
  )
}
