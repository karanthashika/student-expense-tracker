/*
# Create profile automatically on sign-up

Plain-English summary: when a student creates an account, a matching profile row (name and monthly allowance) is now created by the database itself. This avoids the app having to save the profile in a separate step right after sign-up, which could briefly show an empty dashboard.

1. Modified behaviour
- New function `handle_new_expense_user` reads `full_name` and `monthly_allowance` from the sign-up details and inserts a row into `profiles`.
- New trigger `on_auth_user_created` runs that function after every new account is created.

2. Security
- The function runs with the database owner's rights so it can insert the profile, and it uses a fixed search path.
- Execute permission is removed from public, anonymous and signed-in users, so it can only run as the trigger.

3. Important notes
- Existing accounts are not changed. The trigger only affects accounts created after this migration.
- The insert does nothing if a profile already exists for that account.
*/

CREATE OR REPLACE FUNCTION public.handle_new_expense_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, monthly_allowance)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'monthly_allowance')::numeric, 0)
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_expense_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_expense_user();
