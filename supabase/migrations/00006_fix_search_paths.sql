-- Fix mutable search_path security warnings
alter function public.handle_new_user() set search_path = public;
alter function public.update_updated_at() set search_path = public;
alter function public.is_admin() set search_path = public;
