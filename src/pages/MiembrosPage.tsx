import { useState } from 'react'
import { useData } from '../lib/DataContext'
import { MemberAvatar } from '../components/MemberAvatar'
import { colorParaNuevoMiembro, formatoFecha } from '../lib/format'
import { crearMiembro, eliminarMiembro, miembroTieneGastos } from '../lib/queries'

export function MiembrosPage() {
  const { miembros, cargando, error, recargar } = useData()
  const [nombre, setNombre] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [errorForm, setErrorForm] = useState<string | null>(null)
  const [eliminandoId, setEliminandoId] = useState<string | null>(null)

  async function agregar() {
    setErrorForm(null)
    if (!nombre.trim()) return setErrorForm('Escribe un nombre.')
    setGuardando(true)
    try {
      await crearMiembro(nombre.trim(), colorParaNuevoMiembro(miembros.length))
      setNombre('')
      await recargar()
    } catch (e) {
      setErrorForm(e instanceof Error ? e.message : 'No se pudo agregar el miembro.')
    } finally {
      setGuardando(false)
    }
  }

  async function eliminar(id: string) {
    setEliminandoId(id)
    setErrorForm(null)
    try {
      const tieneGastos = await miembroTieneGastos(id)
      if (tieneGastos) {
        setErrorForm('No se puede eliminar: este miembro tiene gastos o pagos asociados.')
        return
      }
      if (!confirm('¿Eliminar este miembro?')) return
      await eliminarMiembro(id)
      await recargar()
    } catch (e) {
      setErrorForm(e instanceof Error ? e.message : 'No se pudo eliminar el miembro.')
    } finally {
      setEliminandoId(null)
    }
  }

  if (cargando) return <p className="text-(--color-text-secondary)">Cargando…</p>
  if (error) return <p className="text-(--color-negative)">{error}</p>

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-(--color-text)">Miembros del grupo</h2>

      <div className="rounded-[16px] border border-(--color-border) bg-(--color-card) p-5">
        <label className="mb-1 block text-sm font-semibold text-(--color-text)">
          Agregar miembro
        </label>
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-xl border border-(--color-border) px-3 py-2 outline-none focus:border-(--color-primary)"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && agregar()}
            placeholder="Nombre"
          />
          <button
            onClick={agregar}
            disabled={guardando}
            className="rounded-full bg-(--color-primary) px-5 py-2 text-sm font-semibold text-white hover:bg-(--color-primary-dark) disabled:opacity-50"
          >
            Agregar
          </button>
        </div>
        {errorForm && <p className="mt-2 text-sm font-medium text-(--color-negative)">{errorForm}</p>}
      </div>

      {miembros.length === 0 ? (
        <p className="rounded-[16px] border border-(--color-border) bg-(--color-card) p-6 text-center text-(--color-text-secondary)">
          Aún no hay miembros. Agrega el primero arriba.
        </p>
      ) : (
        <div className="space-y-2">
          {miembros.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between rounded-[16px] border border-(--color-border) bg-(--color-card) p-4"
            >
              <div className="flex items-center gap-3">
                <MemberAvatar miembro={m} />
                <div>
                  <p className="font-semibold text-(--color-text)">{m.nombre}</p>
                  <p className="text-xs text-(--color-text-secondary)">
                    Desde {formatoFecha(m.fecha_ingreso.slice(0, 10))}
                  </p>
                </div>
              </div>
              <button
                onClick={() => eliminar(m.id)}
                disabled={eliminandoId === m.id}
                className="text-sm font-semibold text-(--color-negative) hover:underline disabled:opacity-50"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
