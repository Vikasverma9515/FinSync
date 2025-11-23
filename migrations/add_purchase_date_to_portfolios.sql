-- Migration: Add purchase_date column to portfolios table
-- This migration adds the purchase_date column to track when stocks were purchased

ALTER TABLE portfolios
ADD COLUMN purchase_date TIMESTAMP WITH TIME ZONE;
