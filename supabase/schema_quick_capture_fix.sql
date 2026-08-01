-- Quick Capture runs as an authenticated admin session, not anon, so it
-- needs its own insert policy on quote_requests (the anon policy only
-- covers the public website form).
create policy "Authenticated insert on quote_requests" on quote_requests
  for insert to authenticated
  with check (true);
