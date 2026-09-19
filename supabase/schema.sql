-- Esquema de Cuentas Claras. Correr en el SQL Editor de tu proyecto de Supabase.

create extension if not exists pgcrypto;

create table miembro (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(trim(nombre)) > 0),
  color_avatar text not null,
  fecha_ingreso timestamptz not null default now()
);

create table gasto (
  id uuid primary key default gen_random_uuid(),
  descripcion text not null check (char_length(trim(descripcion)) > 0),
  monto numeric(12,2) not null check (monto > 0),
  pagado_por_id uuid not null references miembro(id) on delete restrict,
  categoria text not null check (categoria in ('Renta','Mercado','Servicios','Salidas','Otros')),
  fecha date not null default current_date,
  fecha_creacion timestamptz not null default now()
);

create table gasto_divide_entre (
  gasto_id uuid not null references gasto(id) on delete cascade,
  miembro_id uuid not null references miembro(id) on delete restrict,
  primary key (gasto_id, miembro_id)
);

create table pago (
  id uuid primary key default gen_random_uuid(),
  de_miembro_id uuid not null references miembro(id) on delete restrict,
  a_miembro_id uuid not null references miembro(id) on delete restrict,
  monto numeric(12,2) not null check (monto > 0),
  fecha date not null default current_date,
  check (de_miembro_id <> a_miembro_id)
);

create index on gasto (pagado_por_id);
create index on gasto (fecha);
create index on gasto_divide_entre (miembro_id);
create index on pago (de_miembro_id);
create index on pago (a_miembro_id);

-- Sin login: cualquiera con el link del grupo puede leer y escribir.
alter table miembro enable row level security;
alter table gasto enable row level security;
alter table gasto_divide_entre enable row level security;
alter table pago enable row level security;

create policy "acceso_total_miembro" on miembro for all using (true) with check (true);
create policy "acceso_total_gasto" on gasto for all using (true) with check (true);
create policy "acceso_total_gasto_divide_entre" on gasto_divide_entre for all using (true) with check (true);
create policy "acceso_total_pago" on pago for all using (true) with check (true);
