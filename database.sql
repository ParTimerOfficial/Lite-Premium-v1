-- FINAL BULLETPROOF DATABASE SCHEMA --
-- This SQL handles both New and Old Users, adding missing columns automatically.

-- 1. Create/Update Tables
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  balance FLOAT DEFAULT 1000,
  worker_level TEXT DEFAULT 'Starter',
  mining_rate FLOAT DEFAULT 0.1,
  status TEXT DEFAULT 'active',
  is_admin BOOLEAN DEFAULT FALSE,
  last_collect TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure missing columns exist for OLD users
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='is_admin') THEN
    ALTER TABLE public.profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='last_collect') THEN
    ALTER TABLE public.profiles ADD COLUMN last_collect TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='status') THEN
    ALTER TABLE public.profiles ADD COLUMN status TEXT DEFAULT 'active';
  END IF;
END $$;

-- Assets/Shop Table
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'worker',
  price FLOAT NOT NULL,
  rate FLOAT DEFAULT 0,
  profit_percent FLOAT DEFAULT 0,
  icon TEXT DEFAULT 'Zap',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Investments
CREATE TABLE IF NOT EXISTS public.user_investments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_name TEXT NOT NULL,
  amount FLOAT NOT NULL,
  profit_percent FLOAT NOT NULL,
  hourly_return FLOAT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active'
);

-- Requests/Withdrawals
CREATE TABLE IF NOT EXISTS public.coin_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  amount FLOAT NOT NULL,
  method TEXT,
  transaction_id TEXT UNIQUE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  amount FLOAT NOT NULL,
  method TEXT,
  number TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view assets" ON assets;
CREATE POLICY "Anyone can view assets" ON assets FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admin manages all" ON profiles;
CREATE POLICY "Admin manages all" ON profiles FOR ALL USING (auth.email() = 'mdmarzangazi@gmail.com');

-- 3. The Master Trigger Function (Works for Login AND Signup)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, balance, is_admin, status, worker_level, mining_rate)
  VALUES (
    new.id, 
    new.email, 
    CASE WHEN new.email = 'mdmarzangazi@gmail.com' THEN 720000 ELSE 1000 END,
    CASE WHEN new.email = 'mdmarzangazi@gmail.com' THEN TRUE ELSE FALSE END,
    'active',
    CASE WHEN new.email = 'mdmarzangazi@gmail.com' THEN 'Admin' ELSE 'Starter' END,
    CASE WHEN new.email = 'mdmarzangazi@gmail.com' THEN 0 ELSE 0.1 END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    status = 'active'; -- Ensure always active on login
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Re-create Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Admin Sync
UPDATE public.profiles 
SET is_admin = TRUE, 
    status = 'active',
    balance = GREATEST(balance, 720000)
WHERE email = 'mdmarzangazi@gmail.com';

-- 6. RPC for Admin
CREATE OR REPLACE FUNCTION public.approve_coin_request(req_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles p
  SET balance = p.balance + r.amount
  FROM public.coin_requests r
  WHERE r.id = req_id AND r.status = 'pending' AND p.id = r.user_id;

  UPDATE public.coin_requests SET status = 'approved' WHERE id = req_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
