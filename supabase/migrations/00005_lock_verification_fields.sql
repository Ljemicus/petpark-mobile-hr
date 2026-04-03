-- Lock sitter self-verification fields at the database layer.
-- Sitters may edit their own marketplace profile, but may NOT set:
--   verified, verification_status, verification_notes, verification_documents, admin_notes
-- Those fields must only move via trusted server/admin paths.

create or replace function public.prevent_self_verification_update()
returns trigger as $$
begin
  if auth.uid() = old.id then
    if new.verified is distinct from old.verified
      or new.verification_status is distinct from old.verification_status
      or new.verification_notes is distinct from old.verification_notes
      or new.verification_documents is distinct from old.verification_documents
      or new.admin_notes is distinct from old.admin_notes then
      raise exception 'verification fields are admin-managed only';
    end if;
  end if;

  return new;
end;
$$ language plpgsql security invoker;

drop trigger if exists sitter_profiles_prevent_self_verification_update
  on public.sitter_profiles;

create trigger sitter_profiles_prevent_self_verification_update
  before update on public.sitter_profiles
  for each row execute function public.prevent_self_verification_update();
