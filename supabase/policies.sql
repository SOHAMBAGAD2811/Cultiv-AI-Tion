-- Enable RLS (Row Level Security)
alter table community_chat enable row level security;

-- Policy for reading messages (allow everyone who is authenticated to read all messages)
create policy "Anyone can read messages"
on community_chat for select
to authenticated
using (true);

-- Policy for inserting messages (users can insert their own messages)
create policy "Authenticated users can insert messages"
on community_chat for insert
to authenticated
with check (auth.uid() = user_id);

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant all privileges on community_chat to anon, authenticated;
grant all privileges on sequence community_chat_id_seq to anon, authenticated;