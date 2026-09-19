import { supabase } from './supabase'
import type { Categoria, Gasto, GastoConDivision, Miembro, Pago } from './types'

export async function obtenerMiembros(): Promise<Miembro[]> {
  const { data, error } = await supabase.from('miembro').select('*').order('fecha_ingreso')
  if (error) throw error
  return data
}

export async function crearMiembro(nombre: string, colorAvatar: string): Promise<Miembro> {
  const { data, error } = await supabase
    .from('miembro')
    .insert({ nombre, color_avatar: colorAvatar })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function eliminarMiembro(id: string): Promise<void> {
  const { error } = await supabase.from('miembro').delete().eq('id', id)
  if (error) throw error
}

export async function miembroTieneGastos(id: string): Promise<boolean> {
  const [pagados, dividido, pagosHechos, pagosRecibidos] = await Promise.all([
    supabase.from('gasto').select('id', { count: 'exact', head: true }).eq('pagado_por_id', id),
    supabase
      .from('gasto_divide_entre')
      .select('gasto_id', { count: 'exact', head: true })
      .eq('miembro_id', id),
    supabase.from('pago').select('id', { count: 'exact', head: true }).eq('de_miembro_id', id),
    supabase.from('pago').select('id', { count: 'exact', head: true }).eq('a_miembro_id', id),
  ])
  for (const r of [pagados, dividido, pagosHechos, pagosRecibidos]) {
    if (r.error) throw r.error
  }
  return (
    (pagados.count ?? 0) > 0 ||
    (dividido.count ?? 0) > 0 ||
    (pagosHechos.count ?? 0) > 0 ||
    (pagosRecibidos.count ?? 0) > 0
  )
}

export async function obtenerGastos(): Promise<GastoConDivision[]> {
  const { data, error } = await supabase
    .from('gasto')
    .select('*, gasto_divide_entre(miembro_id)')
    .order('fecha', { ascending: false })
    .order('fecha_creacion', { ascending: false })
  if (error) throw error
  return data as GastoConDivision[]
}

export interface DatosGasto {
  descripcion: string
  monto: number
  pagado_por_id: string
  categoria: Categoria
  fecha: string
  miembrosEntreQuienesSeDivide: string[]
}

export async function crearGasto(datos: DatosGasto): Promise<Gasto> {
  const { data: gasto, error } = await supabase
    .from('gasto')
    .insert({
      descripcion: datos.descripcion,
      monto: datos.monto,
      pagado_por_id: datos.pagado_por_id,
      categoria: datos.categoria,
      fecha: datos.fecha,
    })
    .select()
    .single()
  if (error) throw error

  const filas = datos.miembrosEntreQuienesSeDivide.map((miembro_id) => ({
    gasto_id: gasto.id,
    miembro_id,
  }))
  const { error: errorDivision } = await supabase.from('gasto_divide_entre').insert(filas)
  if (errorDivision) throw errorDivision

  return gasto
}

export async function actualizarGasto(id: string, datos: DatosGasto): Promise<void> {
  const { error } = await supabase
    .from('gasto')
    .update({
      descripcion: datos.descripcion,
      monto: datos.monto,
      pagado_por_id: datos.pagado_por_id,
      categoria: datos.categoria,
      fecha: datos.fecha,
    })
    .eq('id', id)
  if (error) throw error

  const { error: errorBorrado } = await supabase
    .from('gasto_divide_entre')
    .delete()
    .eq('gasto_id', id)
  if (errorBorrado) throw errorBorrado

  const filas = datos.miembrosEntreQuienesSeDivide.map((miembro_id) => ({
    gasto_id: id,
    miembro_id,
  }))
  const { error: errorDivision } = await supabase.from('gasto_divide_entre').insert(filas)
  if (errorDivision) throw errorDivision
}

export async function eliminarGasto(id: string): Promise<void> {
  const { error } = await supabase.from('gasto').delete().eq('id', id)
  if (error) throw error
}

export interface GastoDelMes {
  monto: number
  categoria: Categoria
  pagado_por_id: string
}

export async function obtenerGastosDelMesActual(): Promise<GastoDelMes[]> {
  const hoy = new Date()
  const inicioMes = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-01`
  const inicioMesSiguiente = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1)
  const finMes = `${inicioMesSiguiente.getFullYear()}-${String(inicioMesSiguiente.getMonth() + 1).padStart(2, '0')}-01`

  const { data, error } = await supabase
    .from('gasto')
    .select('monto, categoria, pagado_por_id')
    .gte('fecha', inicioMes)
    .lt('fecha', finMes)
  if (error) throw error
  return data
}

export async function obtenerPagos(): Promise<Pago[]> {
  const { data, error } = await supabase.from('pago').select('*').order('fecha', { ascending: false })
  if (error) throw error
  return data
}

export async function crearPago(
  deMiembroId: string,
  aMiembroId: string,
  monto: number,
  fecha: string
): Promise<Pago> {
  const { data, error } = await supabase
    .from('pago')
    .insert({ de_miembro_id: deMiembroId, a_miembro_id: aMiembroId, monto, fecha })
    .select()
    .single()
  if (error) throw error
  return data
}
