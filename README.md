# Movie Backend

A Node.js backend for managing movies and TV shows, built with Express, Prisma, MySQL, and Cloudinary for image hosting.

## Features

- **User Authentication** (register, login)
- **CRUD for Movies/TV Shows**
  - Create, read, update, delete movies and TV shows
  - Pagination, filtering, and search
- **Image & Poster Upload**
  - Upload images and posters as base64 or URLs
  - Images/posters are uploaded to Cloudinary and stored as URLs
  - Poster is stored separately from images
- **Prisma ORM**
  - MySQL database schema for users, media, and images
- **Validation**
  - All input validated with Zod

## API Endpoints

### Auth
- `POST /auth/register` — Register a new user
- `POST /auth/login` — Login and receive a JWT

### Movies/TV Shows
- `GET /movies` — List all movies/TV shows (with pagination, filtering, search)
- `GET /movies/:id` — Get a single movie/TV show by ID
- `POST /movies` — Create a new movie/TV show (with images/poster upload)
- `PUT /movies/:id` — Update a movie/TV show (with images/poster upload)
- `DELETE /movies/:id` — Delete a movie/TV show (removes all related images/poster)

## Data Model

- **Media**: title, description, releaseYear, type, director, budget, location, duration, poster, images
- **Image**: url, mediaId, (optionally posterFor)
- **User**: email, name, password

## Image & Poster Handling
- Send images/poster as base64 strings or URLs in the request body
- Poster is stored separately and not included in the images array in responses
- All images are uploaded to Cloudinary

## Environment Variables
Create a `.env` file with the following:

```
DATABASE_URL=mysql://USER:PASSWORD@HOST:PORT/DATABASE
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JWT_SECRET=your_jwt_secret
```

## Deployment

### 1. Deploying on Railway

#### Database (MySQL)
- Go to [Railway](https://railway.app/)
- Create a new project
- Add the **MySQL plugin** to your project
- Railway will provision a MySQL database and provide a `DATABASE_URL` in the Variables tab
- Copy this URL and use it in your `.env` file or set it as an environment variable in your Railway project
- Run migrations (locally or using Railway's shell):
  ```sh
  npx prisma migrate deploy
  # or for development
  npx prisma migrate dev
  ```

#### Cloudinary
- Create a Cloudinary account if you don't have one
- Add your Cloudinary credentials (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) to the Railway project's environment variables

#### Server (Node.js)
- Add your project to Railway (connect your GitHub repo or deploy manually)
- Set all required environment variables in the Railway dashboard:
  - `DATABASE_URL` (from Railway MySQL plugin)
  - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
  - `JWT_SECRET`
- Railway will automatically detect your Node.js app and install dependencies
- Set the start command if needed (e.g., `npm start` or `node index.js`)
- Deploy the project
- Your server will be available at the Railway-provided URL

### 2. Local Deployment

#### 1. Database (MySQL)
- Provision a MySQL database (local, Docker, or cloud provider)
- Update `DATABASE_URL` in `.env`
- Run migrations:
  ```sh
  npx prisma migrate deploy
  # or for development
  npx prisma migrate dev
  ```

#### 2. Cloudinary
- Create a Cloudinary account
- Get your cloud name, API key, and API secret
- Add them to your `.env` file

#### 3. Server (Node.js)
- Install dependencies:
  ```sh
  npm install
  ```
- Start the server:
  ```sh
  npm start
  # or for development
  npm run dev
  ```
- The server will run on the port specified in your code (default: 3000)

## Example Movie Creation Request

```json
{
  "title": "Inception",
  "description": "A mind-bending thriller",
  "releaseYear": 2010,
  "type": "MOVIE",
  "director": "Christopher Nolan",
  "budget": 160000000,
  "location": "Los Angeles",
  "duration": 148,
  "poster": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "images": [
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...",
    "https://example.com/another-image.jpg"
  ]
}
```

## Notes
- Poster will not appear in the images array in any response.
- All image uploads are handled via Cloudinary.
- All endpoints return JSON.

---

Feel free to contribute or open issues for improvements! 