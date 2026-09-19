import { useEffect, useMemo, useState } from 'react'
import { useData } from '../lib/DataContext'
import { obtenerGastosDelMesActual } from '../lib/queries'
import type { GastoDelMes } from '../lib/queries'
import { formatoMoneda } from '../lib/format'
import { colorCategoria } from '../components/CategoryBadge'
import { MemberAvatar } from '../components/MemberAvatar'
import { CATEGORIAS } from '../lib/types'

const NOMBRE_MES = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' }).format(
  new Date()
)

export function ResumenPage() {
  const { miembros } = useData()
  const [gastosDelMes, setGastosDelMes] = useState<GastoDelMes[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    obtenerGastosDelMesActual()
      .then(setGastosDelMes)
      .catch((e) => setError(e instanceof Error ? e.message : 'No se pudo cargar el resumen.'))
  }, [])

  const totalMes = useMemo(
    () => (gastosDelMes ?? []).reduce((acc, g) => acc + g.monto, 0),
    [gastosDelMes]
  )

  const porCategoria = useMemo(() => {
    const mapa = new Map<string, number>()
    for (const c of CATEGORIAS) mapa.set(c, 0)
    for (const g of gastosDelMes ?? []) {
      mapa.set(g.categoria, (mapa.get(g.categoria) ?? 0) + g.monto)
    }
    return CATEGORIAS.map((c) => ({ categoria: c, monto: mapa.get(c) ?? 0 })).filter(
      (c) => c.monto > 0
    )
  }, [gastosDelMes])

  const mayorAportante = useMemo(() => {
    const mapa = new Map<string, number>()
    for (const g of gastosDelMes ?? []) {
      mapa.set(g.pagado_por_id, (mapa.get(g.pagado_por_id) ?? 0) + g.monto)
    }
    let mejorId: string | null = null
    let mejorMonto = -1
    for (const [id, monto] of mapa) {
      if (monto > mejorMonto) {
        mejorMonto = monto
        mejorId = id
      }
    }
    const miembro = miembros.find((m) => m.id === mejorId)
    return miembro ? { miembro, monto: mejorMonto } : null
  }, [gastosDelMes, miembros])

  if (error) return <p className="text-(--color-negative)">{error}</p>
  if (gastosDelMes === null) return <p className="text-(--color-text-secondary)">Cargando…</p>

  const maxCategoria = Math.max(1, ...porCategoria.map((c) => c.monto))

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-(--color-text) capitalize">Resumen de {NOMBRE_MES}</h2>

      <div className="rounded-[16px] border border-(--color-border) bg-(--color-card) p-6">
        <p className="text-sm text-(--color-text-secondary)">Total gastado este mes</p>
        <p className="mt-1 text-3xl font-bold text-(--color-text)">{formatoMoneda(totalMes)}</p>
      </div>

      <div className="rounded-[16px] border border-(--color-border) bg-(--color-card) p-6">
        <p className="mb-4 text-sm font-semibold text-(--color-text)">Desglose por categoría</p>
        {porCategoria.length === 0 ? (
          <p className="text-sm text-(--color-text-secondary)">Sin gastos este mes todavía.</p>
        ) : (
          <div className="space-y-3">
            {porCategoria.map((c) => (
              <div key={c.categoria}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-(--color-text)">{c.categoria}</span>
                  <span className="font-bold text-(--color-text)">{formatoMoneda(c.monto)}</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-(--color-bg)">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(c.monto / maxCategoria) * 100}%`,
                      backgroundColor: colorCategoria(c.categoria),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-[16px] border border-(--color-border) bg-(--color-card) p-6">
        <p className="mb-3 text-sm font-semibold text-(--color-text)">
          Quién más ha aportado este mes
        </p>
        {mayorAportante ? (
          <div className="flex items-center gap-3">
            <MemberAvatar miembro={mayorAportante.miembro} size={44} />
            <div>
              <p className="font-semibold text-(--color-text)">{mayorAportante.miembro.nombre}</p>
              <p className="text-(--color-text-secondary)">{formatoMoneda(mayorAportante.monto)}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-(--color-text-secondary)">Sin gastos este mes todavía.</p>
        )}
      </div>
    </div>
  )
}
