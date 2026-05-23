/*
  # Update handle_new_user trigger to capture grade_level and age_range

  Changes:
  - Updated handle_new_user() function to also insert grade_level and age_range
    from user signup metadata into the profiles table.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, grade_level, age_range)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', ''),
    COALESCE(NEW.raw_user_meta_data->>'grade_level', ''),
    COALESCE(NEW.raw_user_meta_data->>'age_range', '')
  );
  RETURN NEW;
END;
$$;
