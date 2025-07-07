-- Create an admin user programmatically
-- Note: This requires the auth.users table to be accessible

-- First, let's create a function to add an admin user
CREATE OR REPLACE FUNCTION create_admin_user(
  user_email TEXT,
  user_password TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Insert into auth.users (this requires admin privileges)
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    user_email,
    crypt(user_password, gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"role": "admin"}',
    '{}',
    FALSE,
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO new_user_id;

  -- Insert into our public.users table
  INSERT INTO public.users (id, email, role)
  VALUES (new_user_id, user_email, 'admin');

  RETURN new_user_id;
END;
$$;

-- Create the admin user
SELECT create_admin_user('admin@restaurant.com', 'admin123');

-- Clean up the function
DROP FUNCTION create_admin_user(TEXT, TEXT);
