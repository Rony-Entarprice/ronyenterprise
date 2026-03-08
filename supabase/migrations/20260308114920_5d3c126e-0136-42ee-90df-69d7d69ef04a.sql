
-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 1. Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Businesses table
CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL DEFAULT 'My Business',
  currency TEXT NOT NULL DEFAULT 'BDT',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own businesses" ON public.businesses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own businesses" ON public.businesses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own businesses" ON public.businesses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own businesses" ON public.businesses FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON public.businesses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create business on signup
CREATE OR REPLACE FUNCTION public.handle_new_business()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.businesses (user_id, business_name)
  VALUES (NEW.id, 'Rony Enterprise');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created_business
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_business();

-- 3. Accounts table
CREATE TABLE public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('bank', 'mobile_banking', 'cash')),
  provider TEXT NOT NULL DEFAULT '',
  balance NUMERIC NOT NULL DEFAULT 0,
  icon TEXT NOT NULL DEFAULT 'Wallet',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own accounts" ON public.accounts FOR SELECT
USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert own accounts" ON public.accounts FOR INSERT
WITH CHECK (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own accounts" ON public.accounts FOR UPDATE
USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete own accounts" ON public.accounts FOR DELETE
USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON public.accounts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  to_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense', 'transfer', 'baki_entry', 'joma_entry')),
  amount NUMERIC NOT NULL DEFAULT 0,
  reference_name TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT
USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT
WITH CHECK (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own transactions" ON public.transactions FOR UPDATE
USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete own transactions" ON public.transactions FOR DELETE
USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

-- 5. Baki Pabo table
CREATE TABLE public.baki_pabo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  person_name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid')),
  note TEXT NOT NULL DEFAULT '',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.baki_pabo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own baki" ON public.baki_pabo FOR SELECT
USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert own baki" ON public.baki_pabo FOR INSERT
WITH CHECK (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own baki" ON public.baki_pabo FOR UPDATE
USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete own baki" ON public.baki_pabo FOR DELETE
USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

CREATE TRIGGER update_baki_updated_at BEFORE UPDATE ON public.baki_pabo
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Joma Debo table
CREATE TABLE public.joma_debo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  person_name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'returned')),
  note TEXT NOT NULL DEFAULT '',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.joma_debo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own joma" ON public.joma_debo FOR SELECT
USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert own joma" ON public.joma_debo FOR INSERT
WITH CHECK (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own joma" ON public.joma_debo FOR UPDATE
USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete own joma" ON public.joma_debo FOR DELETE
USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

CREATE TRIGGER update_joma_updated_at BEFORE UPDATE ON public.joma_debo
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_accounts_business_id ON public.accounts(business_id);
CREATE INDEX idx_transactions_business_id ON public.transactions(business_id);
CREATE INDEX idx_transactions_account_id ON public.transactions(account_id);
CREATE INDEX idx_transactions_date ON public.transactions(transaction_date);
CREATE INDEX idx_baki_business_id ON public.baki_pabo(business_id);
CREATE INDEX idx_baki_status ON public.baki_pabo(status);
CREATE INDEX idx_joma_business_id ON public.joma_debo(business_id);
CREATE INDEX idx_joma_status ON public.joma_debo(status);
CREATE INDEX idx_businesses_user_id ON public.businesses(user_id);
