-- Enable the UUID extension (required for generating UUIDs)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nickname VARCHAR(100),
  bio TEXT,
  avatar_skin VARCHAR(50),
  avatar_acc VARCHAR(50),
  profile_picture_url VARCHAR(255)
);

-- 2. Movies Table
CREATE TABLE movies (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255),
  slogan VARCHAR(255),
  description TEXT,
  release_year INT,
  director VARCHAR(255),
  actors VARCHAR(255),
  poster_url VARCHAR(255),
  genre VARCHAR(50)
);

-- 3. User Top Movies Table (Many-to-Many)
CREATE TABLE user_top_movies (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  movie_id VARCHAR(100) REFERENCES movies(id) ON DELETE CASCADE,
  position INT CHECK (position >= 1 AND position <= 5),
  PRIMARY KEY (user_id, movie_id)
);

-- 4. Reviews Table (Cine Social Feed)
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  movie_id VARCHAR(100) REFERENCES movies(id) ON DELETE CASCADE,
  rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5.0),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Followers Table (Many-to-Many)
CREATE TABLE followers (
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (follower_id, following_id)
);
