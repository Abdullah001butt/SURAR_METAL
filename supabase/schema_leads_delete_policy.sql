-- Leads (quote_requests, contact_messages) had SELECT/UPDATE policies for the
-- authenticated (admin) role but no DELETE — the dashboard's new Delete Lead /
-- bulk-delete buttons need this to actually work.

create policy "Authenticated delete quote_requests" on quote_requests
  for delete to authenticated using (true);

create policy "Authenticated delete contact_messages" on contact_messages
  for delete to authenticated using (true);
