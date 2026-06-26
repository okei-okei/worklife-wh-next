-- WorkLife WH property pet/smoking filter fields.
-- Run this in Supabase SQL Editor before using the new property filters.

alter table if exists public.public_properties
  add column if not exists pets_allowed boolean null,
  add column if not exists smoking_allowed boolean null;

alter table if exists public.saved_properties
  add column if not exists pets_allowed boolean null,
  add column if not exists smoking_allowed boolean null;

-- pets_allowed needs to allow null so the UI can represent "要確認".
alter table if exists public.public_properties
  alter column pets_allowed drop not null,
  alter column pets_allowed drop default;

alter table if exists public.saved_properties
  alter column pets_allowed drop not null,
  alter column pets_allowed drop default;

comment on column public.public_properties.pets_allowed is
  'true = pets allowed, false = pets not allowed, null = needs confirmation.';

comment on column public.public_properties.smoking_allowed is
  'true = smoking allowed, false = smoking not allowed, null = needs confirmation.';

comment on column public.saved_properties.pets_allowed is
  'true = pets allowed, false = pets not allowed, null = needs confirmation.';

comment on column public.saved_properties.smoking_allowed is
  'true = smoking allowed, false = smoking not allowed, null = needs confirmation.';
