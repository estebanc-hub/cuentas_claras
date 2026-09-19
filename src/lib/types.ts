export type Categoria = 'Renta' | 'Mercado' | 'Servicios' | 'Salidas' | 'Otros'

export const CATEGORIAS: Categoria[] = ['Renta', 'Mercado', 'Servicios', 'Salidas', 'Otros']

export interface Miembro {
  id: string
  nombre: string
  color_avatar: string
  fecha_ingreso: string
}

export interface Gasto {
  id: string
  descripcion: string
  monto: number
  pagado_por_id: string
  categoria: Categoria
  fecha: string
  fecha_creacion: string
}

export interface GastoConDivision extends Gasto {
  gasto_divide_entre: { miembro_id: string }[]
}

export interface Pago {
  id: string
  de_miembro_id: string
  a_miembro_id: string
  monto: number
  fecha: string
}

export interface BalanceMiembro {
  miembro: Miembro
  totalPagado: number
  totalCorrespondia: number
  diferencia: number
}

export interface Deuda {
  de: Miembro
  a: Miembro
  monto: number
}
