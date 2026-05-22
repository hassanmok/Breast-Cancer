-- Run in Supabase SQL Editor after creating oncology_cases table
-- Allows authenticated users to read and insert cases

alter table oncology_cases enable row level security;

create policy "Authenticated users can read oncology_cases"
  on oncology_cases for select
  to authenticated
  using (true);

create policy "Authenticated users can insert oncology_cases"
  on oncology_cases for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update oncology_cases"
  on oncology_cases for update
  to authenticated
  using (true)
  with check (true);
