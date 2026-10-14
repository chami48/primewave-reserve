insert into public.resources (id, name, type, description, capacity, status)
select gen_random_uuid(), seed.name, seed.type, seed.description, seed.capacity, seed.status
from (
  values
    ('Conference Room A', 'Conference Room', 'Executive conference room with video conferencing, whiteboard, and hybrid meeting equipment.', 14, 'available'),
    ('Conference Room B', 'Conference Room', 'Team conference room suited for planning sessions and client calls.', 10, 'available'),
    ('Meeting Room 01', 'Meeting Room', 'Compact meeting space for interviews, one-on-ones, and small group discussions.', 6, 'available'),
    ('Training Hall', 'Training Hall', 'Large training space with presentation display, flexible seating, and workshop layout support.', 40, 'available'),
    ('Projector 01', 'Equipment', 'Portable HD projector with HDMI and USB-C adapters.', null, 'available'),
    ('Projector 02', 'Equipment', 'Portable projector reserved for training sessions and off-site presentations.', null, 'maintenance'),
    ('Company Vehicle 01', 'Vehicle', 'Sedan for local business travel and client visits.', 4, 'available'),
    ('Company Vehicle 02', 'Vehicle', 'Van for team transport and equipment movement.', 8, 'available')
) as seed(name, type, description, capacity, status)
where not exists (
  select 1
  from public.resources as existing
  where lower(existing.name) = lower(seed.name)
);
