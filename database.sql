-- FinSync Database Schema
-- Run this SQL in your Supabase SQL editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  age INTEGER CHECK (age >= 18 AND age <= 100),
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 10),
  investment_horizon INTEGER CHECK (investment_horizon >= 0),
  financial_goal INTEGER CHECK (financial_goal >= 1 AND financial_goal <= 5),
  financial_condition INTEGER CHECK (financial_condition >= 1 AND financial_condition <= 5),
  annual_income DECIMAL(15,2) CHECK (annual_income >= 0),
  total_net_worth DECIMAL(15,2) CHECK (total_net_worth >= 0),
  dependents INTEGER CHECK (dependents >= 0),
  investment_knowledge INTEGER CHECK (investment_knowledge >= 1 AND investment_knowledge <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create portfolios table
CREATE TABLE portfolios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  average_price DECIMAL(15,2) NOT NULL CHECK (average_price > 0),
  current_price DECIMAL(15,2),
  purchase_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, symbol)
);

-- Create transactions table
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('buy', 'sell')) NOT NULL,
  symbol TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(15,2) NOT NULL CHECK (price > 0),
  total_value DECIMAL(15,2) NOT NULL CHECK (total_value > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create investment_plans table
CREATE TABLE investment_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recommended_stocks JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for portfolios
CREATE POLICY "Users can view their own portfolios" ON portfolios
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own portfolios" ON portfolios
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolios" ON portfolios
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own portfolios" ON portfolios
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for transactions
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for investment_plans
CREATE POLICY "Users can view their own investment plans" ON investment_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own investment plans" ON investment_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own investment plans" ON investment_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own investment plans" ON investment_plans
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_portfolios_symbol ON portfolios(symbol);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_symbol ON transactions(symbol);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_investment_plans_user_id ON investment_plans(user_id);