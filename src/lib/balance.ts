import type { BalanceMiembro, Deuda, GastoConDivision, Miembro, Pago } from './types'

const CENTS = 100

function aCentavos(valor: number): number {
  return Math.round(valor * CENTS)
}

export function calcularBalances(
  miembros: Miembro[],
  gastos: GastoConDivision[],
  pagos: Pago[]
): BalanceMiembro[] {
  const pagadoCent = new Map<string, number>()
  const correspondiaCent = new Map<string, number>()
  const recibidoCent = new Map<string, number>()
  const realizadoCent = new Map<string, number>()

  for (const m of miembros) {
    pagadoCent.set(m.id, 0)
    correspondiaCent.set(m.id, 0)
    recibidoCent.set(m.id, 0)
    realizadoCent.set(m.id, 0)
  }

  for (const g of gastos) {
    const montoCent = aCentavos(g.monto)
    pagadoCent.set(g.pagado_por_id, (pagadoCent.get(g.pagado_por_id) ?? 0) + montoCent)

    const participantes = g.gasto_divide_entre
    if (participantes.length === 0) continue
    const parteCent = Math.round(montoCent / participantes.length)
    for (const p of participantes) {
      correspondiaCent.set(p.miembro_id, (correspondiaCent.get(p.miembro_id) ?? 0) + parteCent)
    }
  }

  for (const pago of pagos) {
    const montoCent = aCentavos(pago.monto)
    recibidoCent.set(pago.a_miembro_id, (recibidoCent.get(pago.a_miembro_id) ?? 0) + montoCent)
    realizadoCent.set(pago.de_miembro_id, (realizadoCent.get(pago.de_miembro_id) ?? 0) + montoCent)
  }

  return miembros.map((miembro) => {
    const totalPagado = (pagadoCent.get(miembro.id) ?? 0) / CENTS
    const totalCorrespondia = (correspondiaCent.get(miembro.id) ?? 0) / CENTS
    // Pagar una deuda (realizado) acerca el balance a cero; recibir un pago (recibido) también.
    const diferenciaCent =
      (pagadoCent.get(miembro.id) ?? 0) -
      (correspondiaCent.get(miembro.id) ?? 0) +
      (realizadoCent.get(miembro.id) ?? 0) -
      (recibidoCent.get(miembro.id) ?? 0)

    return {
      miembro,
      totalPagado,
      totalCorrespondia,
      diferencia: diferenciaCent / CENTS,
    }
  })
}

/** Empareja a quienes deben con quienes les deben hasta saldar ambos lados. No es el algoritmo óptimo, solo un emparejamiento simple. */
export function calcularDeudas(balances: BalanceMiembro[]): Deuda[] {
  const acreedores = balances
    .filter((b) => aCentavos(b.diferencia) > 0)
    .map((b) => ({ miembro: b.miembro, restanteCent: aCentavos(b.diferencia) }))
    .sort((a, b) => b.restanteCent - a.restanteCent)

  const deudores = balances
    .filter((b) => aCentavos(b.diferencia) < 0)
    .map((b) => ({ miembro: b.miembro, restanteCent: -aCentavos(b.diferencia) }))
    .sort((a, b) => b.restanteCent - a.restanteCent)

  const deudas: Deuda[] = []
  let i = 0
  let j = 0

  while (i < deudores.length && j < acreedores.length) {
    const deudor = deudores[i]
    const acreedor = acreedores[j]
    const monto = Math.min(deudor.restanteCent, acreedor.restanteCent)

    if (monto > 0) {
      deudas.push({ de: deudor.miembro, a: acreedor.miembro, monto: monto / CENTS })
    }

    deudor.restanteCent -= monto
    acreedor.restanteCent -= monto

    if (deudor.restanteCent === 0) i++
    if (acreedor.restanteCent === 0) j++
  }

  return deudas
}
