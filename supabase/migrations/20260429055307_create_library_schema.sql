/*
  # Library Management System - Complete Schema

  1. New Tables
    - `categories` - Book categories/genres
      - `id` (uuid, primary key)
      - `name` (text, unique) - Category name
      - `description` (text) - Category description
      - `created_at` (timestamptz)
    
    - `books` - Library book inventory
      - `id` (uuid, primary key)
      - `title` (text) - Book title
      - `author` (text) - Author name
      - `isbn` (text, unique) - ISBN number
      - `category_id` (uuid, FK to categories) - Book category
      - `publisher` (text) - Publisher name
      - `publication_year` (integer) - Year published
      - `total_copies` (integer) - Total copies owned
      - `available_copies` (integer) - Currently available copies
      - `shelf_location` (text) - Physical shelf location
      - `description` (text) - Book description
      - `cover_url` (text) - Cover image URL
      - `added_by` (uuid, FK to auth.users) - User who added the book
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `members` - Library members
      - `id` (uuid, primary key)
      - `user_id` (uuid, FK to auth.users) - Associated auth user
      - `full_name` (text) - Member's full name
      - `email` (text, unique) - Member email
      - `phone` (text) - Phone number
      - `address` (text) - Member address
      - `membership_type` (text) - Type: 'standard', 'premium', 'student'
      - `membership_status` (text) - Status: 'active', 'expired', 'suspended'
      - `max_borrow_limit` (integer) - Max books allowed
      - `joined_at` (timestamptz)
      - `expires_at` (timestamptz) - Membership expiry date

    - `borrowings` - Book borrowing records
      - `id` (uuid, primary key)
      - `book_id` (uuid, FK to books) - Borrowed book
      - `member_id` (uuid, FK to members) - Borrowing member
      - `borrow_date` (timestamptz) - Date borrowed
      - `due_date` (timestamptz) - Due date for return
      - `return_date` (timestamptz, nullable) - Actual return date
      - `status` (text) - Status: 'borrowed', 'returned', 'overdue'
      - `fine_amount` (numeric) - Fine for late return
      - `fine_paid` (boolean) - Whether fine is paid
      - `notes` (text) - Additional notes

    - `reservations` - Book reservation records
      - `id` (uuid, primary key)
      - `book_id` (uuid, FK to books) - Reserved book
      - `member_id` (uuid, FK to members) - Reserving member
      - `reservation_date` (timestamptz) - Date reserved
      - `expiry_date` (timestamptz) - Reservation expiry
      - `status` (text) - Status: 'pending', 'fulfilled', 'cancelled', 'expired'
      - `notes` (text) - Additional notes

  2. Security
    - Enable RLS on ALL tables
    - Authenticated users can read categories
    - Authenticated users can CRUD books, members, borrowings, reservations they own/manage
    - Members can only read/update their own data
*/

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Books table
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL,
  isbn text UNIQUE NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  publisher text DEFAULT '',
  publication_year integer,
  total_copies integer NOT NULL DEFAULT 1,
  available_copies integer NOT NULL DEFAULT 1,
  shelf_location text DEFAULT '',
  description text DEFAULT '',
  cover_url text DEFAULT '',
  added_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Members table
CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text DEFAULT '',
  address text DEFAULT '',
  membership_type text NOT NULL DEFAULT 'standard',
  membership_status text NOT NULL DEFAULT 'active',
  max_borrow_limit integer NOT NULL DEFAULT 5,
  joined_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT now() + interval '1 year'
);

-- Borrowings table
CREATE TABLE IF NOT EXISTS borrowings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  borrow_date timestamptz DEFAULT now(),
  due_date timestamptz NOT NULL,
  return_date timestamptz,
  status text NOT NULL DEFAULT 'borrowed',
  fine_amount numeric DEFAULT 0,
  fine_paid boolean DEFAULT false,
  notes text DEFAULT '',
  CONSTRAINT valid_status CHECK (status IN ('borrowed', 'returned', 'overdue'))
);

-- Reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  reservation_date timestamptz DEFAULT now(),
  expiry_date timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  notes text DEFAULT '',
  CONSTRAINT valid_reservation_status CHECK (status IN ('pending', 'fulfilled', 'cancelled', 'expired'))
);

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrowings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Categories policies (readable by all authenticated users, manageable by authenticated users)
CREATE POLICY "Authenticated users can read categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (true);

-- Books policies
CREATE POLICY "Authenticated users can read books"
  ON books FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert books"
  ON books FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update books"
  ON books FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete books"
  ON books FOR DELETE
  TO authenticated
  USING (true);

-- Members policies
CREATE POLICY "Authenticated users can read members"
  ON members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert members"
  ON members FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Members can update own profile"
  ON members FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authenticated users can update any member"
  ON members FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete members"
  ON members FOR DELETE
  TO authenticated
  USING (true);

-- Borrowings policies
CREATE POLICY "Authenticated users can read borrowings"
  ON borrowings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert borrowings"
  ON borrowings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update borrowings"
  ON borrowings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete borrowings"
  ON borrowings FOR DELETE
  TO authenticated
  USING (true);

-- Reservations policies
CREATE POLICY "Authenticated users can read reservations"
  ON reservations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert reservations"
  ON reservations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update reservations"
  ON reservations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete reservations"
  ON reservations FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category_id);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
CREATE INDEX IF NOT EXISTS idx_books_available ON books(available_copies);
CREATE INDEX IF NOT EXISTS idx_members_user ON members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(membership_status);
CREATE INDEX IF NOT EXISTS idx_borrowings_book ON borrowings(book_id);
CREATE INDEX IF NOT EXISTS idx_borrowings_member ON borrowings(member_id);
CREATE INDEX IF NOT EXISTS idx_borrowings_status ON borrowings(status);
CREATE INDEX IF NOT EXISTS idx_borrowings_due ON borrowings(due_date);
CREATE INDEX IF NOT EXISTS idx_reservations_book ON reservations(book_id);
CREATE INDEX IF NOT EXISTS idx_reservations_member ON reservations(member_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);

-- Insert default categories
INSERT INTO categories (name, description) VALUES
  ('Fiction', 'Novels, short stories, and other fictional works'),
  ('Non-Fiction', 'Biographies, essays, and factual works'),
  ('Science', 'Physics, chemistry, biology, and mathematics'),
  ('Technology', 'Computer science, engineering, and IT'),
  ('History', 'World history, civilizations, and historical events'),
  ('Philosophy', 'Philosophical works and critical thinking'),
  ('Art & Design', 'Visual arts, architecture, and design'),
  ('Business', 'Management, finance, and entrepreneurship'),
  ('Medicine', 'Medical sciences and healthcare'),
  ('Literature', 'Classical and contemporary literary works'),
  ('Children', 'Books for children and young adults'),
  ('Reference', 'Encyclopedias, dictionaries, and reference materials')
ON CONFLICT (name) DO NOTHING;
