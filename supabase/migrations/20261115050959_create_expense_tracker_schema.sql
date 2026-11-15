/*
# Create expense tracker schema

Plain-English summary: adds the three tables the Student Expense Tracker needs. Each student has one profile (name and monthly allowance), any number of income and expense transactions, and one budget limit per category. Every student can only see and change their own rows.

1. New Tables
- `profiles`: one row per student. `user_id` (primary key, linked to the sign-in account), `full_name`, `monthly_allowance` (zero or more), `created_at`.
- `transactions`: each income or expense entry. `id`, `user_id`, `type` ('income' or 'expense'), `amount` (positive, two decimals), `category`, `payment_mode` ('UPI', 'Cash', 'Card'), `note`, `txn_date`, `created_at`.
- `budgets`: a monthly spending limit for one expense category. `id`, `user_id`, `category`, `monthly_limit`, `created_at`. One budget per student per category.

2. Security
- Row level security enabled on all three tables.
- Only the `authenticated` role is granted access, and only to rows where `user_id` matches the signed-in user.
- Each table has separate select, insert, update and delete policies.

3. Important notes
- Indexes on `(user_id, txn_date)` and `(user_id, category)` keep dashboard and filter queries fast.
- `user_id` defaults to the signed-in user so inserts do not need to pass it.
*/

CREATE TABLE IF NOT EXISTS profiles (
  user_id uuid PRIMARY KEY DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  monthly_allowance numeric(12,2) NOT NULL DEFAULT 0 CHECK (monthly_allowance >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  category text NOT NULL CHECK (category IN ('Food/Mess', 'Hostel/Rent', 'Books/Stationery', 'Travel', 'Entertainment', 'Miscellaneous', 'Income')),
  payment_mode text NOT NULL CHECK (payment_mode IN ('UPI', 'Cash', 'Card')),
  note text NOT NULL DEFAULT '' CHECK (char_length(note) <= 200),
  txn_date date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((type = 'income') = (category = 'Income'))
);

CREATE INDEX IF NOT EXISTS transactions_user_date_idx ON transactions (user_id, txn_date DESC);
CREATE INDEX IF NOT EXISTS transactions_user_category_idx ON transactions (user_id, category);

CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('Food/Mess', 'Hostel/Rent', 'Books/Stationery', 'Travel', 'Entertainment', 'Miscellaneous')),
  monthly_limit numeric(12,2) NOT NULL CHECK (monthly_limit > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, category)
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON budgets TO authenticated;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "select_own_transactions" ON transactions;
CREATE POLICY "select_own_transactions" ON transactions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_transactions" ON transactions;
CREATE POLICY "insert_own_transactions" ON transactions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_transactions" ON transactions;
CREATE POLICY "update_own_transactions" ON transactions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_transactions" ON transactions;
CREATE POLICY "delete_own_transactions" ON transactions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "select_own_budgets" ON budgets;
CREATE POLICY "select_own_budgets" ON budgets FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_budgets" ON budgets;
CREATE POLICY "insert_own_budgets" ON budgets FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_budgets" ON budgets;
CREATE POLICY "update_own_budgets" ON budgets FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_budgets" ON budgets;
CREATE POLICY "delete_own_budgets" ON budgets FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
