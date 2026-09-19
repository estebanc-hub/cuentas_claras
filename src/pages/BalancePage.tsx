import { useState } from 'react'
import { useData } from '../lib/DataContext'
import { MemberAvatar } from '../components/MemberAvatar'
import { formatoMoneda } from '../lib/format'
import { ExpenseFormModal } from '../components/ExpenseFormModal'
import { PaymentFormModal } from '../components/PaymentFormModal'
import type { Deuda } from '../lib/types'

export function BalancePage() {
  const { balances, deudas, miembros, cargando, error } = useData()
  const [mostrarNuevoGasto, setMostrarNuevoGasto] = useState(false)
  const [deudaASaldar, setDeudaASaldar] = useState<Deuda | null>(null)

  if (cargando) return <p className="text-(--color-text-secondary)">Cargando…</p>
  if (error) return <p className="text-(--color-negative)">{error}</p>

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-(--color-text)">Balance del grupo</h2>
        <button
          onClick={() => setMostrarNuevoGasto(true)}
          disabled={miembros.length === 0}
          className="rounded-full bg-(--color-primary) px-5 py-2 text-sm font-semibold text-white hover:bg-(--color-primary-dark) disabled:opacity-50"
          title={miembros.length === 0 ? 'Agrega miembros primero' : undefined}
        >
          + Nuevo gasto
        </button>
      </div>

      {miembros.length === 0 ? (
        <p className="rounded-[16px] border border-(--color-border) bg-(--color-card) p-6 text-center text-(--color-text-secondary)">
          Aún no hay miembros en el grupo. Ve a la pestaña <span className="font-semibold">Miembros</span> para agregar el primero.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {balances.map((b) => {
              const esPositivo = b.diferencia > 0.001
              const esNegativo = b.diferencia < -0.001
              return (
                <div
                  key={b.miembro.id}
                  className="rounded-[16px] border border-(--color-border) bg-(--color-card) p-5"
                >
                  <div className="flex items-center gap-3">
                    <MemberAvatar miembro={b.miembro} />
                    <span className="font-semibold text-(--color-text)">{b.miembro.nombre}</span>
                  </div>
                  <div className="mt-4 space-y-1 text-sm text-(--color-text-secondary)">
                    <div className="flex justify-between">
                      <span>Pagó en total</span>
                      <span className="font-medium text-(--color-text)">
                        {formatoMoneda(b.totalPagado)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Le correspondía</span>
                      <span className="font-medium text-(--color-text)">
                        {formatoMoneda(b.totalCorrespondia)}
                      </span>
                    </div>
                  </div>
                  <div
                    className="mt-4 rounded-xl px-3 py-2 text-center font-bold"
                    style={{
                      backgroundColor: esPositivo
                        ? 'var(--color-positive-bg)'
                        : esNegativo
                          ? 'var(--color-negative-bg)'
                          : 'var(--color-bg)',
                      color: esPositivo
                        ? 'var(--color-positive)'
                        : esNegativo
                          ? 'var(--color-negative)'
                          : 'var(--color-text-secondary)',
                    }}
                  >
                    {esPositivo && `Le deben ${formatoMoneda(b.diferencia)}`}
                    {esNegativo && `Debe ${formatoMoneda(-b.diferencia)}`}
                    {!esPositivo && !esNegativo && 'Está al día'}
                  </div>
                </div>
              )
            })}
          </div>

          <div>
            <h3 className="mb-3 text-lg font-bold text-(--color-text)">¿Quién le debe a quién?</h3>
            {deudas.length === 0 ? (
              <p className="rounded-[16px] border border-(--color-border) bg-(--color-card) p-6 text-center font-semibold text-(--color-positive)">
                Todo está saldado 🎉
              </p>
            ) : (
              <div className="space-y-2">
                {deudas.map((d, i) => (
                  <div
                    key={i}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-[16px] border border-(--color-border) bg-(--color-card) p-4"
                  >
                    <div className="flex items-center gap-2 text-(--color-text)">
                      <MemberAvatar miembro={d.de} size={28} />
                      <span className="font-semibold">{d.de.nombre}</span>
                      <span className="text-(--color-text-secondary)">le debe</span>
                      <span className="font-bold">{formatoMoneda(d.monto)}</span>
                      <span className="text-(--color-text-secondary)">a</span>
                      <span className="font-semibold">{d.a.nombre}</span>
                      <MemberAvatar miembro={d.a} size={28} />
                    </div>
                    <button
                      onClick={() => setDeudaASaldar(d)}
                      className="rounded-full border border-(--color-primary) px-4 py-1.5 text-sm font-semibold text-(--color-primary) hover:bg-(--color-primary) hover:text-white"
                    >
                      Registrar pago
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {mostrarNuevoGasto && <ExpenseFormModal onClose={() => setMostrarNuevoGasto(false)} />}
      {deudaASaldar && (
        <PaymentFormModal deuda={deudaASaldar} onClose={() => setDeudaASaldar(null)} />
      )}
    </div>
  )
}
