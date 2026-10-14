-- Allow bookings at any minute while preserving the required time ordering.
do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select conname
    from pg_constraint
    where conrelid = 'public.reservations'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%start_time%'
      and pg_get_constraintdef(oid) ilike '%end_time%'
  loop
    execute format(
      'alter table public.reservations drop constraint if exists %I',
      constraint_name
    );
  end loop;
end $$;

alter table public.reservations
  add constraint reservations_time_order_check
  check (end_time > start_time);
