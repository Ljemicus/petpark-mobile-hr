-- ════════════════════════════════════════════════════════
-- PetPark — Extended Payment Tables for Mobile
-- payment_methods: stores user's saved payment methods
-- payouts: tracks provider payout requests
-- ════════════════════════════════════════════════════════

-- Payment methods table (for storing Stripe payment method references)
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_payment_method_id TEXT NOT NULL,
  type TEXT DEFAULT 'card' CHECK (type IN ('card', 'apple_pay', 'google_pay')),
  card_brand TEXT,
  card_last4 TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- RLS policies for payment_methods
DROP POLICY IF EXISTS "Users can view own payment methods" ON public.payment_methods;
CREATE POLICY "Users can view own payment methods" ON public.payment_methods
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own payment methods" ON public.payment_methods;
CREATE POLICY "Users can insert own payment methods" ON public.payment_methods
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own payment methods" ON public.payment_methods;
CREATE POLICY "Users can update own payment methods" ON public.payment_methods
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own payment methods" ON public.payment_methods;
CREATE POLICY "Users can delete own payment methods" ON public.payment_methods
  FOR DELETE USING (user_id = auth.uid());

-- Payouts table (for sitter/groomer payout requests)
CREATE TABLE IF NOT EXISTS public.payouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- in cents
  currency TEXT DEFAULT 'EUR',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  stripe_payout_id TEXT,
  processed_at TIMESTAMPTZ,
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- RLS policies for payouts
DROP POLICY IF EXISTS "Users can view own payouts" ON public.payouts;
CREATE POLICY "Users can view own payouts" ON public.payouts
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create payout requests" ON public.payouts;
CREATE POLICY "Users can create payout requests" ON public.payouts
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON public.payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payouts_user_id ON public.payouts(user_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON public.payouts(status);

-- Function to calculate available balance for a provider
CREATE OR REPLACE FUNCTION public.get_provider_balance(provider_id UUID)
RETURNS TABLE (
  available INTEGER,
  pending INTEGER,
  currency TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH earnings AS (
    SELECT 
      COALESCE(SUM(
        ROUND((total_price - COALESCE(platform_fee, total_price * 0.10)) * 100)
      ), 0)::INTEGER as total_earnings
    FROM public.bookings
    WHERE sitter_id = provider_id
      AND status = 'completed'
      AND payment_status = 'paid'
  ),
  pending_payouts AS (
    SELECT 
      COALESCE(SUM(amount), 0)::INTEGER as pending_amount
    FROM public.payouts
    WHERE user_id = provider_id
      AND status IN ('pending', 'processing')
  )
  SELECT 
    GREATEST(e.total_earnings - p.pending_amount, 0) as available,
    p.pending_amount as pending,
    'EUR'::TEXT as currency
  FROM earnings e, pending_payouts p;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
