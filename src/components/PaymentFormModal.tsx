import { useState } from 'react'
import { Modal } from './Modal'
import { useData } from '../lib/DataContext'
import { crearPago } from '../lib/queries'
import { fechaHoyISO, formatoMoneda } from '../lib/format'
import type { Deuda } from '../lib/types'

export function PaymentFormModal({ deuda, onClose }: { deuda: Deuda; onClose: () => void }) {
  const { recargar } = useData()
  const [monto, setMonto] = useState(String(deuda.monto))
  const [fecha, setFecha] = useState(fechaHoyISO())
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function guardar() {
    setError(null)
    const montoNum = Number(monto)
    if (!montoNum || montoNum <= 0) return setError('El monto debe ser un número positivo.')

    setGuardando(true)
    try {
      await crearPago(deuda.de.id, deuda.a.id, montoNum, fecha)
      await recargar()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo registrar el pago.')
      setGuardando(false)
    }
  }

  return (
    <Modal titulo="Registrar pago" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-(--color-text)">
          <span className="font-semibold">{deuda.de.nombre}</span> le paga a{' '}
          <span className="font-semibold">{deuda.a.nombre}</span>
        </p>

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
            />
            <p className="mt-1 text-xs text-(--color-text-secondary)">
              Deuda actual: {formatoMoneda(deuda.monto)}
            </p>
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

        {error && <p className="text-sm font-medium text-(--color-negative)">{error}</p>}

        <div className="flex justify-end pt-2">
          <button
            onClick={guardar}
            disabled={guardando}
            className="rounded-full bg-(--color-primary) px-5 py-2 text-sm font-semibold text-white hover:bg-(--color-primary-dark) disabled:opacity-50"
          >
            {guardando ? 'Guardando…' : 'Confirmar pago'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
