-- Create logos storage bucket
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true);

-- Allow authenticated users to upload to their own folder
create policy "Users can upload own logos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'logos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access
create policy "Public logo access"
on storage.objects for select
to public
using (bucket_id = 'logos');

-- Allow users to delete own logos
create policy "Users can delete own logos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'logos'
  and (storage.foldername(name))[1] = auth.uid()::text
);
