-- 1. Set up the 'avatars' bucket for profile pictures
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Allow public access to view avatars
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- Allow authenticated users to upload avatars
create policy "Anyone can upload an avatar."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );

-- Allow users to update their own avatars
create policy "Users can update their own avatar."
  on storage.objects for update
  using ( auth.uid() = owner )
  with check ( bucket_id = 'avatars' );


-- 2. Set up the 'analytics-data' bucket for user data persistence
insert into storage.buckets (id, name, public)
values ('analytics-data', 'analytics-data', false)
on conflict (id) do nothing;

-- Allow users to view their own analytics data
create policy "Analytics data is private to user"
  on storage.objects for select
  using ( bucket_id = 'analytics-data' and auth.uid() = owner );

-- Allow users to upload their own analytics data
create policy "Users can upload their own analytics"
  on storage.objects for insert
  with check ( bucket_id = 'analytics-data' and auth.uid() = owner );

-- Allow users to update their own analytics data
create policy "Users can update their own analytics"
  on storage.objects for update
  using ( bucket_id = 'analytics-data' and auth.uid() = owner );

-- Allow users to delete their own analytics data
create policy "Users can delete their own analytics"
  on storage.objects for delete
  using ( bucket_id = 'analytics-data' and auth.uid() = owner );