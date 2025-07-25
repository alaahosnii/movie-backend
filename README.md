# Movie Backend Server

This is a Node.js backend server for managing movies, built with Express, Prisma ORM, MySQL, and Zod for schema validation.

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure the database:**
   - Create a MySQL database (e.g., `moviedb`).
   - Set your MySQL connection string in the `DATABASE_URL` environment variable. Example:
     ```env
     DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/moviedb"
     ```
   - You can place this in a `.env` file in the project root.

3. **Run Prisma migrations:**
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Start the server:**
   ```bash
   node index.js
   ```

## Project Structure
- `prisma/schema.prisma`: Prisma schema definition
- `index.js`: Express server entry point (to be created)

## Features
- Movie CRUD endpoints
- User model for demonstration
- Input validation with Zod 