# Cuentas Claras

Control de gastos compartidos para un grupo pequeño (pareja, familia, roommates). Cada quien registra lo que paga, la app calcula el balance de cada miembro y muestra quién le debe a quién.

Sin login: cualquiera con el link del grupo puede entrar, registrar gastos y saldar deudas.

## Stack

- React + TypeScript + Vite
- Tailwind CSS v4
- Supabase (Postgres) como base de datos, sin backend propio — el frontend habla directo con Supabase vía `@supabase/supabase-js`

## Desarrollo local

1. Instala dependencias:

   ```bash
   npm install
   ```

2. Copia `.env.example` a `.env.local` y completa con la URL y la clave pública (`anon`/`publishable`) de tu proyecto de Supabase:

   ```bash
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_...
   ```

3. Corre el esquema SQL de `supabase/schema.sql` en tu proyecto de Supabase (SQL Editor).

4. Levanta el servidor de desarrollo:

   ```bash
   npm run dev
   ```

## Estructura de datos

- `miembro`: personas del grupo.
- `gasto`: cada gasto registrado (quién pagó, monto, categoría, fecha).
- `gasto_divide_entre`: entre quiénes se divide cada gasto (muchos-a-muchos).
- `pago`: pagos para saldar deudas entre miembros.

El balance de cada miembro se calcula como: lo que pagó − su parte en los gastos en que participó + pagos que hizo para saldar deudas − pagos que recibió.
