import { iniciales } from '../lib/format'
import type { Miembro } from '../lib/types'

export function MemberAvatar({
  miembro,
  size = 40,
}: {
  miembro: Miembro
  size?: number
}) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{
        backgroundColor: miembro.color_avatar,
        width: size,
        height: size,
        fontSize: size * 0.38,
      }}
      title={miembro.nombre}
    >
      {iniciales(miembro.nombre)}
    </div>
  )
}
