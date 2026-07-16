-- Allow users to save a job/property candidate with only title and address.
-- Run this in Supabase SQL Editor if saved_jobs or saved_properties still have
-- NOT NULL constraints on optional detail fields.

do $$
declare
  item record;
begin
  for item in
    select *
    from (
      values
        ('saved_jobs', 'url'),
        ('saved_jobs', 'hourly_rate'),
        ('saved_jobs', 'hourly_rate_min'),
        ('saved_jobs', 'hourly_rate_max'),
        ('saved_jobs', 'work_hours'),
        ('saved_jobs', 'weekly_hours'),
        ('saved_jobs', 'status'),
        ('saved_jobs', 'company'),
        ('saved_jobs', 'company_name'),
        ('saved_jobs', 'employment_type'),
        ('saved_jobs', 'description'),
        ('saved_jobs', 'location'),
        ('saved_jobs', 'accommodation_available'),
        ('saved_jobs', 'japanese_ok'),
        ('saved_jobs', 'english_level'),
        ('saved_jobs', 'visa_conditions'),
        ('saved_jobs', 'start_date'),
        ('saved_properties', 'url'),
        ('saved_properties', 'location'),
        ('saved_properties', 'rent_weekly'),
        ('saved_properties', 'bedrooms'),
        ('saved_properties', 'bathrooms'),
        ('saved_properties', 'parking_spaces'),
        ('saved_properties', 'available_from'),
        ('saved_properties', 'pet_allowed'),
        ('saved_properties', 'pets_allowed'),
        ('saved_properties', 'smoking_allowed'),
        ('saved_properties', 'utilities_included'),
        ('saved_properties', 'bills_included'),
        ('saved_properties', 'description')
    ) as fields(table_name, column_name)
  loop
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = item.table_name
        and column_name = item.column_name
        and is_nullable = 'NO'
    ) then
      execute format(
        'alter table public.%I alter column %I drop not null',
        item.table_name,
        item.column_name
      );
    end if;
  end loop;
end $$;
