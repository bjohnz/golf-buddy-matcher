-- ============================================
-- Golf Buddy Matcher - Row Level Security (RLS) Policies
-- ============================================
-- This migration sets up RLS policies for data security
-- Run this after the initial schema migration

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_completion ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_update_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES TABLE POLICIES
-- ============================================

-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Users can view other active profiles for matching (with restrictions)
CREATE POLICY "Users can view other profiles for matching" ON profiles
    FOR SELECT USING (
        is_active = true 
        AND auth.uid()::text != user_id::text
        AND NOT EXISTS (
            SELECT 1 FROM blocks 
            WHERE (blocker_id = profiles.id AND blocked_user_id = (
                SELECT id FROM profiles WHERE user_id = auth.uid()
            ))
            OR (blocked_user_id = profiles.id AND blocker_id = (
                SELECT id FROM profiles WHERE user_id = auth.uid()
            ))
        )
    );

-- ============================================
-- MATCHES TABLE POLICIES
-- ============================================

-- Users can view matches they are part of
CREATE POLICY "Users can view their matches" ON matches
    FOR SELECT USING (
        user1_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        OR user2_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Users can insert matches (handled by application logic)
CREATE POLICY "Users can insert matches" ON matches
    FOR INSERT WITH CHECK (
        user1_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        OR user2_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- ============================================
-- SWIPES TABLE POLICIES
-- ============================================

-- Users can view their own swipes
CREATE POLICY "Users can view own swipes" ON swipes
    FOR SELECT USING (
        swiper_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Users can insert their own swipes
CREATE POLICY "Users can insert own swipes" ON swipes
    FOR INSERT WITH CHECK (
        swiper_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Users can view swipes on their profile (for analytics)
CREATE POLICY "Users can view swipes on their profile" ON swipes
    FOR SELECT USING (
        target_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- ============================================
-- MESSAGES TABLE POLICIES
-- ============================================

-- Users can view messages in their matches
CREATE POLICY "Users can view messages in their matches" ON messages
    FOR SELECT USING (
        match_id IN (
            SELECT id FROM matches 
            WHERE user1_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
            OR user2_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        )
    );

-- Users can insert messages in their matches
CREATE POLICY "Users can insert messages in their matches" ON messages
    FOR INSERT WITH CHECK (
        sender_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        AND match_id IN (
            SELECT id FROM matches 
            WHERE user1_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
            OR user2_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        )
    );

-- Users can update read status of messages they sent
CREATE POLICY "Users can update own messages" ON messages
    FOR UPDATE USING (
        sender_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- ============================================
-- RATINGS TABLE POLICIES
-- ============================================

-- Users can view ratings they gave
CREATE POLICY "Users can view own ratings" ON ratings
    FOR SELECT USING (
        rater_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Users can view ratings they received
CREATE POLICY "Users can view ratings received" ON ratings
    FOR SELECT USING (
        rated_user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Users can insert ratings for matches they participated in
CREATE POLICY "Users can insert ratings" ON ratings
    FOR INSERT WITH CHECK (
        rater_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        AND match_id IN (
            SELECT id FROM matches 
            WHERE user1_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
            OR user2_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        )
    );

-- ============================================
-- REPORTS TABLE POLICIES
-- ============================================

-- Users can view reports they made
CREATE POLICY "Users can view own reports" ON reports
    FOR SELECT USING (
        reporter_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Users can insert reports
CREATE POLICY "Users can insert reports" ON reports
    FOR INSERT WITH CHECK (
        reporter_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- ============================================
-- BLOCKS TABLE POLICIES
-- ============================================

-- Users can view blocks they made
CREATE POLICY "Users can view own blocks" ON blocks
    FOR SELECT USING (
        blocker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Users can insert blocks
CREATE POLICY "Users can insert blocks" ON blocks
    FOR INSERT WITH CHECK (
        blocker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Users can delete their own blocks
CREATE POLICY "Users can delete own blocks" ON blocks
    FOR DELETE USING (
        blocker_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- ============================================
-- SUBSCRIPTIONS TABLE POLICIES
-- ============================================

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription" ON subscriptions
    FOR SELECT USING (
        user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Users can insert their own subscription
CREATE POLICY "Users can insert own subscription" ON subscriptions
    FOR INSERT WITH CHECK (
        user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Users can update their own subscription
CREATE POLICY "Users can update own subscription" ON subscriptions
    FOR UPDATE USING (
        user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- ============================================
-- USAGE TRACKING TABLE POLICIES
-- ============================================

-- Users can view their own usage tracking
CREATE POLICY "Users can view own usage tracking" ON usage_tracking
    FOR SELECT USING (
        user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Users can insert their own usage tracking
CREATE POLICY "Users can insert own usage tracking" ON usage_tracking
    FOR INSERT WITH CHECK (
        user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Users can update their own usage tracking
CREATE POLICY "Users can update own usage tracking" ON usage_tracking
    FOR UPDATE USING (
        user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- ============================================
-- PROFILE COMPLETION TABLE POLICIES
-- ============================================

-- Users can view their own profile completion
CREATE POLICY "Users can view own profile completion" ON profile_completion
    FOR SELECT USING (
        profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Users can insert their own profile completion
CREATE POLICY "Users can insert own profile completion" ON profile_completion
    FOR INSERT WITH CHECK (
        profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Users can update their own profile completion
CREATE POLICY "Users can update own profile completion" ON profile_completion
    FOR UPDATE USING (
        profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- ============================================
-- PROFILE UPDATE LOGS TABLE POLICIES
-- ============================================

-- Users can view their own profile update logs
CREATE POLICY "Users can view own profile update logs" ON profile_update_logs
    FOR SELECT USING (
        profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Users can insert their own profile update logs
CREATE POLICY "Users can insert own profile update logs" ON profile_update_logs
    FOR INSERT WITH CHECK (
        profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- ============================================
-- ADMIN POLICIES (FOR FUTURE ADMIN PANEL)
-- ============================================

-- Create admin role function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- For now, return false. In production, implement proper admin role checking
    -- This could be based on a user's role in the profiles table or a separate admin table
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin can view all data (for moderation purposes)
CREATE POLICY "Admin can view all profiles" ON profiles
    FOR SELECT USING (is_admin());

CREATE POLICY "Admin can view all reports" ON reports
    FOR SELECT USING (is_admin());

CREATE POLICY "Admin can update report status" ON reports
    FOR UPDATE USING (is_admin());

-- ============================================
-- FUNCTIONS FOR COMMON OPERATIONS
-- ============================================

-- Function to get current user's profile ID
CREATE OR REPLACE FUNCTION get_current_profile_id()
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT id FROM profiles WHERE user_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if two users are matched
CREATE OR REPLACE FUNCTION are_users_matched(user1_profile_id UUID, user2_profile_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM matches 
        WHERE (user1_id = user1_profile_id AND user2_id = user2_profile_id)
        OR (user1_id = user2_profile_id AND user2_id = user1_profile_id)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is blocked
CREATE OR REPLACE FUNCTION is_user_blocked(blocker_profile_id UUID, blocked_profile_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM blocks 
        WHERE blocker_id = blocker_profile_id AND blocked_user_id = blocked_profile_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON FUNCTION is_admin() IS 'Check if current user is an admin';
COMMENT ON FUNCTION get_current_profile_id() IS 'Get current user profile ID';
COMMENT ON FUNCTION are_users_matched() IS 'Check if two users are matched';
COMMENT ON FUNCTION is_user_blocked() IS 'Check if user is blocked by another user'; 