# Cineverse API Server

The Cineverse API Server is a robust, high-performance backend built with Node.js, Express, and PostgreSQL. It acts as the backbone for the Cineverse Web Application by handling user authentication, profile and 3D avatar management, a global social review feed, and centralized media delivery via Cloudinary.

This documentation provides frontend developers with comprehensive guidelines, exact JSON payload structures, and database schema context to ensure seamless integration.

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Database Schema](#database-schema)
3. [Prerequisites & Installation](#prerequisites--installation)
4. [Environment Configuration](#environment-configuration)
5. [API Reference](#api-reference)
    - [Authentication](#authentication)
    - [Users & Profiles](#users--profiles)
    - [Movies & Media](#movies--media)
    - [Social Feed & Reviews](#social-feed--reviews)
6. [Static Assets & Cloud Integration](#static-assets--cloud-integration)

---

## Architecture Overview

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Authentication:** JSON Web Tokens (JWT) + Bcrypt password hashing
- **Media Hosting:** Cloudinary

---

## Database Schema

Understanding the database is critical for interacting with the API. The system consists of 6 primary tables:

1. **`users`**: Stores authentication data (`email`, `password_hash`), profile data (`nickname`, `bio`), and 3D avatar selections (`avatar_skin`, `avatar_acc`).
2. **`movies`**: Stores movie metadata including `title`, `slogan`, `description`, `genre`, and the Cloudinary `poster_url`. Crucially, it stores frontend 3D rendering data: `side` (left/right) and `z` (depth).
3. **`reviews`**: A join table mapping users to movies, containing a 1-5 `rating`, text `comment`, and `created_at` timestamp.
4. **`followers`**: A many-to-many relationship table tracking which users follow other users.
5. **`user_top_movies`**: A relational table mapping users to their top 5 favorite movies, strictly constrained by a `position` integer (1-5).
6. **`ui_assets`**: A key-value store holding the Cloudinary URLs for frontend videos and loading backgrounds.

---

## Prerequisites & Installation

Ensure you have the following installed on your machine:
- Node.js (v16.x or higher)
- PostgreSQL (v14.x or higher)
- Git

### Local Setup

1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd cine-verse-api-server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Database Initialization:**
   Ensure your PostgreSQL server is running. Create a database named `cineverse`.
   Run the SQL commands found in `schema.sql` to initialize the tables.

---

## Environment Configuration

Create a `.env` file in the root directory. The server will not start without a valid database URL and JWT secret.

```env
# Server Port
PORT=3000

# PostgreSQL Connection String
DATABASE_URL=postgresql://<username>:<password>@localhost:5432/cineverse

# Security
JWT_SECRET=your_super_secret_jwt_key_here

# Cloudinary Integration (Required for the upload-seed script)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## API Reference

Base URL: `http://localhost:3000`

### Error Handling Standard
All failed requests return a JSON object with an `error` key containing a descriptive message.
- **400 Bad Request:** Missing fields or invalid data.
- **401 Unauthorized:** Invalid login credentials or missing/expired JWT.
- **403 Forbidden:** Valid JWT but insufficient permissions.
- **404 Not Found:** The requested resource does not exist.
- **500 Server Error:** An unexpected backend failure.

---

### Authentication

All protected routes require a JWT provided in the `Authorization` header.
Format: `Authorization: Bearer <your_token>`

#### 1. Register User
- **Method:** `POST`
- **Path:** `/api/auth/register`
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123",
    "nickname": "CineFan"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "message": "User registered successfully",
    "token": "eyJhbGciOiJIUzI1NiIsInR...",
    "user": {
      "id": "uuid-string-here",
      "email": "user@example.com",
      "nickname": "CineFan"
    }
  }
  ```

#### 2. Login
- **Method:** `POST`
- **Path:** `/api/auth/login`
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR...",
    "user": {
      "id": "uuid-string-here",
      "email": "user@example.com",
      "nickname": "CineFan",
      "avatar_skin": "baseAvatar.png",
      "avatar_acc": null,
      "profile_picture_url": null
    }
  }
  ```

---

### Users & Profiles

#### 1. Get Current User Profile (Protected)
- **Method:** `GET`
- **Path:** `/api/users/me`
- **Headers:** `Authorization: Bearer <token>`
- **Description:** Retrieves the user's base profile, their list of followers, and their aggregated Top 5 Movies.
- **Response (200 OK):**
  ```json
  {
    "user": {
      "id": "uuid-string-here",
      "email": "user@example.com",
      "nickname": "CineFan",
      "bio": "Horror fanatic.",
      "avatar_skin": "greenAvatar.png",
      "avatar_acc": "cowboy.mp4",
      "top_movies": [
        {
          "id": "horror-saw",
          "title": "Saw",
          "poster_url": "https://res.cloudinary.com/...",
          "position": 1
        }
      ],
      "followers": [],
      "follower_count": 0
    }
  }
  ```

#### 2. Update Profile (Protected)
- **Method:** `PUT`
- **Path:** `/api/users/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Description:** Partially update user profile data. Omitted fields remain unchanged.
- **Request Body:**
  ```json
  {
    "bio": "Sci-Fi nerd and movie buff.",
    "avatar_skin": "pinkAvatar.png",
    "avatar_acc": "glasses.mp4"
  }
  ```
- **Response (200 OK):** Returns the updated user object.

#### 3. Update Top 5 Movies (Protected)
- **Method:** `POST`
- **Path:** `/api/users/top-movies`
- **Headers:** `Authorization: Bearer <token>`
- **Description:** Overwrites the user's top 5 movies. The array order dictates their `position` (1 through 5).
- **Request Body:**
  ```json
  {
    "movie_ids": ["scifi-avatar", "romcom-set-it-up", "horror-it"]
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "message": "Top movies updated successfully!"
  }
  ```

#### 4. Toggle Follow User (Protected)
- **Method:** `POST`
- **Path:** `/api/users/follow/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Description:** Toggles follow status. If following, it unfollows. If not, it follows.
- **Response (200 OK):**
  ```json
  {
    "message": "Successfully followed user" 
  }
  ```

---

### Movies & Media

#### 1. Get All Movies
- **Method:** `GET`
- **Path:** `/api/movies`
- **Description:** Returns the complete master list of movies.
- **Query Parameters:** `?genre=horror` (Filters movies by exact genre string).
- **Response (200 OK):**
  ```json
  {
    "movies": [
      {
        "id": "horror-jacobs-ladder",
        "title": "Jacob’s Ladder",
        "slogan": "The most frightening thing...",
        "description": "After returning home...",
        "release_year": 1990,
        "director": "Adrian Lyne",
        "actors": "Tim Robbins, Elizabeth Peña",
        "poster_url": "https://res.cloudinary.com/...",
        "genre": "horror",
        "side": "left",
        "z": 10
      }
    ]
  }
  ```

---

### Social Feed & Reviews

#### 1. Get Global Feed
- **Method:** `GET`
- **Path:** `/api/reviews`
- **Description:** Returns a rich, joined list of the 50 most recent reviews, including the author's nickname and the movie title.
- **Response (200 OK):**
  ```json
  {
    "reviews": [
      {
        "review_id": 1,
        "rating": 5,
        "comment": "Absolute cinema.",
        "created_at": "2023-10-25T12:00:00Z",
        "user_id": "uuid-string",
        "user_nickname": "CineFan",
        "user_avatar": null,
        "movie_id": "scifi-dune",
        "movie_title": "Dune",
        "movie_poster": "https://res.cloudinary.com/..."
      }
    ]
  }
  ```

#### 2. Post a Review (Protected)
- **Method:** `POST`
- **Path:** `/api/reviews`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "movie_id": "horror-saw",
    "rating": 4.5,
    "comment": "Terrifying but well-paced."
  }
  ```
- **Response (201 Created):** Returns the newly inserted review object.

---

### UI Assets (Loading Backgrounds, Avatars, Videos)

#### 1. Get All Assets
- **Method:** `GET`
- **Path:** `/api/assets`
- **Description:** Returns every UI asset stored in the database (loading backgrounds, avatar skins, videos, favicon).
- **Response (200 OK):**
  ```json
  {
    "assets": [
      {
        "name": "images/loadingBackgrounds_horror_bg.png",
        "url": "https://res.cloudinary.com/..."
      },
      {
        "name": "images/loadingBackgrounds_romcom_bg.png",
        "url": "https://res.cloudinary.com/..."
      },
      {
        "name": "videos_cowboy.mp4",
        "url": "https://res.cloudinary.com/..."
      }
    ]
  }
  ```

#### 2. Get Single Asset by Name
- **Method:** `GET`
- **Path:** `/api/assets/:name`
- **Description:** Returns a single asset by its exact name.
- **Response (200 OK):**
  ```json
  {
    "asset": {
      "name": "images/loadingBackgrounds_horror_bg.png",
      "url": "https://res.cloudinary.com/..."
    }
  }
  ```

#### 3. Get Assets by Category
- **Method:** `GET`
- **Path:** `/api/assets/category/:prefix`
- **Description:** Returns all assets whose name starts with the given prefix. Useful for grabbing all loading backgrounds or all avatars at once.
- **Example:** `GET /api/assets/category/images/loadingBackgrounds` returns all 3 loading backgrounds.
- **Example:** `GET /api/assets/category/images/avatarsPFP` returns all avatar skins.
- **Example:** `GET /api/assets/category/videos` returns all 4 accessory videos.
- **Response (200 OK):**
  ```json
  {
    "assets": [
      {
        "name": "images/loadingBackgrounds_horror_bg.png",
        "url": "https://res.cloudinary.com/..."
      },
      {
        "name": "images/loadingBackgrounds_romcom_bg.png",
        "url": "https://res.cloudinary.com/..."
      },
      {
        "name": "images/loadingBackgrounds_scifi_bg.png",
        "url": "https://res.cloudinary.com/..."
      }
    ]
  }
  ```

---

## Static Assets & Cloud Integration

To prevent GitHub repository bloat, all 37 movie posters, 4 UI videos, 5 Avatar skins, and loading backgrounds have been migrated to Cloudinary.

The database `ui_assets` table holds the static links for frontend consumption.

### The Seed Script
If the database is wiped or you add new movies to the frontend, you must re-sync the Cloudinary assets. 
1. Ensure the frontend `public` directory is correctly located adjacent to the server directory.
2. Run the migration script:
   ```bash
   npm run upload-seed
   ```
This script will read all local files, upload them via the Cloudinary API, map the secure URLs to the PostgreSQL schema, and finalize the database population.