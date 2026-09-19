import { useState } from 'react'
import { Modal } from './Modal'
import { MemberAvatar } from './MemberAvatar'
import { useData } from '../lib/DataContext'
import { actualizarGasto, crearGasto, eliminarGasto } from '../lib/queries'
import { fechaHoyISO } from '../lib/format'
import { CATEGORIAS } from '../lib/types'
import type { Categoria, GastoConDivision } from '../lib/types'

export function ExpenseFormModal({
  gastoAEditar,
  onClose,
}: {
  gastoAEditar?: GastoConDivision
  onClose: () => void
}) {
  const { miembros, recargar } = useData()
  const esEdicion = Boolean(gastoAEditar)

  const [descripcion, setDescripcion] = useState(gastoAEditar?.descripcion ?? '')
  const [monto, setMonto] = useState(gastoAEditar ? String(gastoAEditar.monto) : '')
  const [pagadoPorId, setPagadoPorId] = useState(
    gastoAEditar?.pagado_por_id ?? miembros[0]?.id ?? ''
  )
  const [categoria, setCategoria] = useState<Categoria>(gastoAEditar?.categoria ?? 'Otros')
  const [fecha, setFecha] = useState(gastoAEditar?.fecha ?? fechaHoyISO())
  const [participantes, setParticipantes] = useState<Set<string>>(
    new Set(
      gastoAEditar
        ? gastoAEditar.gasto_divide_entre.map((p) => p.miembro_id)
        : miembros.map((m) => m.id)
    )
  )
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function alternarParticipante(id: string) {
    setParticipantes((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function guardar() {
    setError(null)
    const montoNum = Number(monto)
    if (!descripcion.trim()) return setError('Escribe una descripción.')
    if (!montoNum || montoNum <= 0) return setError('El monto debe ser un número positivo.')
    if (!pagadoPorId) return setError('Selecciona quién pagó.')
    if (participantes.size === 0) return setError('Selecciona al menos un miembro para dividir el gasto.')

    setGuardando(true)
    try {
      const datos = {
        descripcion: descripcion.trim(),
        monto: montoNum,
        pagado_por_id: pagadoPorId,
        categoria,
        fecha,
        miembrosEntreQuienesSeDivide: Array.from(participantes),
      }
      if (esEdicion && gastoAEditar) {
        await actualizarGasto(gastoAEditar.id, datos)
      } else {
        await crearGasto(datos)
      }
      await recargar()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar el gasto.')
    } finally {
      setGuardando(false)
    }
  }

  async function eliminar() {
    if (!gastoAEditar) return
    if (!confirm('¿Eliminar este gasto? Esta acción no se puede deshacer.')) return
    setGuardando(true)
    try {
      await eliminarGasto(gastoAEditar.id)
      await recargar()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo eliminar el gasto.')
      setGuardando(false)
    }
  }

  return (
    <Modal titulo={esEdicion ? 'Editar gasto' : 'Nuevo gasto'} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-(--color-text)">
            Descripción
          </label>
          <input
            className="w-full rounded-xl border border-(--color-border) px-3 py-2 outline-none focus:border-(--color-primary)"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Mercado de la semana"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-(--color-text)">Monto</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full rounded-xl border border-(--color-border) px-3 py-2 outline-none focus:border-(--color-primary)"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-(--color-text)">Fecha</label>
            <input
              type="date"
              className="w-full rounded-xl border border-(--color-border) px-3 py-2 outline-none focus:border-(--color-primary)"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-(--color-text)">
              Quién pagó
            </label>
            <select
              className="w-full rounded-xl border border-(--color-border) px-3 py-2 outline-none focus:border-(--color-primary)"
              value={pagadoPorId}
              onChange={(e) => setPagadoPorId(e.target.value)}
            >
              {miembros.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-(--color-text)">
              Categoría
            </label>
            <select
              className="w-full rounded-xl border border-(--color-border) px-3 py-2 outline-none focus:border-(--color-primary)"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value as Categoria)}
            >
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-(--color-text)">
            Entre quiénes se divide
          </label>
          <div className="flex flex-wrap gap-2">
            {miembros.map((m) => {
              const marcado = participantes.has(m.id)
              return (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => alternarParticipante(m.id)}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                    marcado
                      ? 'border-(--color-primary) bg-(--color-primary)/10 text-(--color-primary-dark)'
                      : 'border-(--color-border) text-(--color-text-secondary)'
                  }`}
                >
                  <MemberAvatar miembro={m} size={22} />
                  {m.nombre}
                </button>
              )
            })}
          </div>
        </div>

        {error && <p className="text-sm font-medium text-(--color-negative)">{error}</p>}

        <div className="flex items-center justify-between pt-2">
          {esEdicion ? (
            <button
              onClick={eliminar}
              disabled={guardando}
              className="text-sm font-semibold text-(--color-negative) hover:underline disabled:opacity-50"
            >
              Eliminar gasto
            </button>
          ) : (
            <span />
          )}
          <button
            onClick={guardar}
            disabled={guardando}
            className="rounded-full bg-(--color-primary) px-5 py-2 text-sm font-semibold text-white hover:bg-(--color-primary-dark) disabled:opacity-50"
          >
            {guardando ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
