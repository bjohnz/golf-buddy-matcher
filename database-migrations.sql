-- Database Migration for Premium Features
-- Run this in your Supabase SQL editor

-- 1. Add subscription fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired', 'trial')),
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_plan_id TEXT;

-- 2. Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'premium')),
  price DECIMAL(10,2) NOT NULL,
  billing_period TEXT NOT NULL CHECK (billing_period IN ('monthly', 'yearly')),
  features JSONB NOT NULL DEFAULT '[]',
  limits JSONB NOT NULL,
  is_popular BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES subscription_plans(id),
  tier TEXT NOT NULL CHECK (tier IN ('free', 'premium')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  trial_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, plan_id)
);

-- 4. Create daily_usage table for tracking like limits
CREATE TABLE IF NOT EXISTS daily_usage (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  likes_used INTEGER DEFAULT 0,
  likes_remaining INTEGER DEFAULT 15,
  reset_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 5. Create profile_boosts table
CREATE TABLE IF NOT EXISTS profile_boosts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create incoming_likes table
CREATE TABLE IF NOT EXISTS incoming_likes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  liker_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  liked_user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_viewed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(liker_id, liked_user_id)
);

-- 7. Insert default subscription plans
INSERT INTO subscription_plans (id, name, tier, price, billing_period, features, limits, is_popular) VALUES
(
  'free',
  'Free',
  'free',
  0.00,
  'monthly',
  '["15 likes per day", "25-mile search radius", "Basic matching filters", "Standard support"]',
  '{"daily_likes": 15, "max_radius": 25, "advanced_filters": false, "see_who_liked_you": false, "priority_support": false, "profile_boosts": 0}',
  false
),
(
  'premium-monthly',
  'Premium',
  'premium',
  9.99,
  'monthly',
  '["Unlimited likes", "100-mile search radius", "Advanced matching filters", "See who liked you", "Priority support", "Profile boosts", "Read receipts"]',
  '{"daily_likes": -1, "max_radius": 100, "advanced_filters": true, "see_who_liked_you": true, "priority_support": true, "profile_boosts": 3}',
  true
),
(
  'premium-yearly',
  'Premium',
  'premium',
  99.99,
  'yearly',
  '["Unlimited likes", "100-mile search radius", "Advanced matching filters", "See who liked you", "Priority support", "Profile boosts", "Read receipts", "2 months free"]',
  '{"daily_likes": -1, "max_radius": 100, "advanced_filters": true, "see_who_liked_you": true, "priority_support": true, "profile_boosts": 3}',
  false
)
ON CONFLICT (id) DO NOTHING;

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_daily_usage_user_date ON daily_usage(user_id, date);
CREATE INDEX IF NOT EXISTS idx_profile_boosts_user_active ON profile_boosts(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_incoming_likes_liked_user ON incoming_likes(liked_user_id);
CREATE INDEX IF NOT EXISTS idx_incoming_likes_is_viewed ON incoming_likes(is_viewed);

-- 9. Create RLS (Row Level Security) policies
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_boosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE incoming_likes ENABLE ROW LEVEL SECURITY;

-- Subscription plans are readable by all authenticated users
CREATE POLICY "subscription_plans_read_policy" ON subscription_plans
  FOR SELECT USING (auth.role() = 'authenticated');

-- Users can only see their own subscriptions
CREATE POLICY "user_subscriptions_read_policy" ON user_subscriptions
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "user_subscriptions_insert_policy" ON user_subscriptions
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "user_subscriptions_update_policy" ON user_subscriptions
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Users can only see their own daily usage
CREATE POLICY "daily_usage_read_policy" ON daily_usage
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "daily_usage_insert_policy" ON daily_usage
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "daily_usage_update_policy" ON daily_usage
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Users can only see their own profile boosts
CREATE POLICY "profile_boosts_read_policy" ON profile_boosts
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "profile_boosts_insert_policy" ON profile_boosts
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "profile_boosts_update_policy" ON profile_boosts
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Users can only see incoming likes for their own profile
CREATE POLICY "incoming_likes_read_policy" ON incoming_likes
  FOR SELECT USING (auth.uid()::text = liked_user_id);

CREATE POLICY "incoming_likes_insert_policy" ON incoming_likes
  FOR INSERT WITH CHECK (auth.uid()::text = liker_id);

CREATE POLICY "incoming_likes_update_policy" ON incoming_likes
  FOR UPDATE USING (auth.uid()::text = liked_user_id);

-- 10. Create functions for subscription management
CREATE OR REPLACE FUNCTION get_user_subscription(user_id TEXT)
RETURNS TABLE (
  id TEXT,
  user_id TEXT,
  plan_id TEXT,
  tier TEXT,
  status TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN,
  trial_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    us.id,
    us.user_id,
    us.plan_id,
    us.tier,
    us.status,
    us.current_period_start,
    us.current_period_end,
    us.cancel_at_period_end,
    us.trial_end,
    us.created_at,
    us.updated_at
  FROM user_subscriptions us
  WHERE us.user_id = get_user_subscription.user_id
    AND us.status = 'active'
  ORDER BY us.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get daily usage
CREATE OR REPLACE FUNCTION get_daily_usage(user_id TEXT, usage_date DATE)
RETURNS TABLE (
  id TEXT,
  user_id TEXT,
  date DATE,
  likes_used INTEGER,
  likes_remaining INTEGER,
  reset_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    du.id,
    du.user_id,
    du.date,
    du.likes_used,
    du.likes_remaining,
    du.reset_date,
    du.created_at,
    du.updated_at
  FROM daily_usage du
  WHERE du.user_id = get_daily_usage.user_id
    AND du.date = get_daily_usage.usage_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record a like
CREATE OR REPLACE FUNCTION record_like(user_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_subscription RECORD;
  daily_usage_record RECORD;
  today_date DATE := CURRENT_DATE;
  tomorrow_date DATE := CURRENT_DATE + INTERVAL '1 day';
BEGIN
  -- Get user's subscription
  SELECT * INTO user_subscription
  FROM get_user_subscription(record_like.user_id)
  LIMIT 1;
  
  -- If no subscription found, create a free subscription
  IF user_subscription IS NULL THEN
    INSERT INTO user_subscriptions (user_id, plan_id, tier, status, current_period_start, current_period_end)
    VALUES (record_like.user_id, 'free', 'free', 'active', NOW(), NOW() + INTERVAL '1 year');
    
    SELECT * INTO user_subscription
    FROM get_user_subscription(record_like.user_id)
    LIMIT 1;
  END IF;
  
  -- If premium user, no limits
  IF user_subscription.tier = 'premium' THEN
    RETURN TRUE;
  END IF;
  
  -- For free users, check daily limits
  SELECT * INTO daily_usage_record
  FROM get_daily_usage(record_like.user_id, today_date);
  
  -- If no daily usage record exists, create one
  IF daily_usage_record IS NULL THEN
    INSERT INTO daily_usage (user_id, date, likes_used, likes_remaining, reset_date)
    VALUES (record_like.user_id, today_date, 0, 15, tomorrow_date);
    
    SELECT * INTO daily_usage_record
    FROM get_daily_usage(record_like.user_id, today_date);
  END IF;
  
  -- Check if user has likes remaining
  IF daily_usage_record.likes_remaining <= 0 THEN
    RETURN FALSE;
  END IF;
  
  -- Update daily usage
  UPDATE daily_usage
  SET 
    likes_used = likes_used + 1,
    likes_remaining = likes_remaining - 1,
    updated_at = NOW()
  WHERE id = daily_usage_record.id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get incoming likes
CREATE OR REPLACE FUNCTION get_incoming_likes(user_id TEXT)
RETURNS TABLE (
  id TEXT,
  liker_id TEXT,
  liked_user_id TEXT,
  is_viewed BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    il.id,
    il.liker_id,
    il.liked_user_id,
    il.is_viewed,
    il.created_at
  FROM incoming_likes il
  WHERE il.liked_user_id = get_incoming_likes.user_id
  ORDER BY il.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Create triggers for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_usage_updated_at
  BEFORE UPDATE ON daily_usage
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 12. Create trigger to automatically create incoming like when someone swipes
CREATE OR REPLACE FUNCTION create_incoming_like()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create incoming like if it's a like (not a pass)
  IF NEW.is_like = true THEN
    INSERT INTO incoming_likes (liker_id, liked_user_id, is_viewed)
    VALUES (NEW.user_id, NEW.target_user_id, false)
    ON CONFLICT (liker_id, liked_user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_incoming_like
  AFTER INSERT ON swipes
  FOR EACH ROW EXECUTE FUNCTION create_incoming_like(); 

-- ============================================
-- SAFETY FEATURES DATABASE UPDATES
-- ============================================

-- Add missing fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"new_matches": true, "new_messages": true, "profile_views": true}'::jsonb;

-- Update reports table to match the types
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS reason TEXT CHECK (reason IN ('inappropriate_behavior', 'fake_profile', 'harassment', 'spam', 'other')),
ALTER COLUMN status SET DEFAULT 'pending',
ALTER COLUMN status TYPE TEXT CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed'));

-- Create indexes for safety features
CREATE INDEX IF NOT EXISTS idx_profiles_is_banned ON profiles(is_banned);
CREATE INDEX IF NOT EXISTS idx_reports_reason ON reports(reason);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);

-- Create function to handle user blocking
CREATE OR REPLACE FUNCTION handle_user_block()
RETURNS TRIGGER AS $$
BEGIN
  -- Remove any existing matches between the users
  DELETE FROM matches 
  WHERE (user1_id = NEW.blocker_id AND user2_id = NEW.blocked_user_id)
     OR (user1_id = NEW.blocked_user_id AND user2_id = NEW.blocker_id);
  
  -- Mark messages as hidden (we'll handle this in the application layer)
  -- For now, we'll just log the block action
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user blocking
DROP TRIGGER IF EXISTS trigger_handle_user_block ON blocks;
CREATE TRIGGER trigger_handle_user_block
  AFTER INSERT ON blocks
  FOR EACH ROW EXECUTE FUNCTION handle_user_block();

-- Create function to get blocked users for a user
CREATE OR REPLACE FUNCTION get_blocked_users(user_id UUID)
RETURNS TABLE(blocked_user_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT b.blocked_user_id
  FROM blocks b
  WHERE b.blocker_id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to get users who blocked the current user
CREATE OR REPLACE FUNCTION get_users_who_blocked_me(user_id UUID)
RETURNS TABLE(blocker_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT b.blocker_id
  FROM blocks b
  WHERE b.blocked_user_id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to check if users are blocked
CREATE OR REPLACE FUNCTION are_users_blocked(user1_id UUID, user2_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM blocks 
    WHERE (blocker_id = user1_id AND blocked_user_id = user2_id)
       OR (blocker_id = user2_id AND blocked_user_id = user1_id)
  );
END;
$$ LANGUAGE plpgsql; 