# NestJS Sample Project

This is a sample NestJS project that demonstrates the use of TypeScript, Axios for API calls, TypeORM for database operations, and includes caching. It interacts with the JSONPlaceholder API and provides CRUD operations for posts.

## Features

- NestJS framework with TypeScript
- Axios for HTTP requests
- TypeORM for database operations
- Caching implementation
- CRUD operations for posts
- Interaction with JSONPlaceholder API

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (v14 or later)
- npm (v6 or later)
- PostgreSQL

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/sanja911/post.git
   cd post
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:
   ```
   DB_HOST=your_database_host
   DB_PORT=your_database_port
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   DB_NAME=your_database_name
   PORT=port
   JWT_SECRET=3def3faad7a7f7c52fe19f90
   ```

4. Create the database:
   ```
   createdb your_database_name
   ```

## Running the Application

1. Start the application in development mode:
   ```
   npm run start:dev
   ```

2. The application will be available at default port on PORT 3000

3. For the graphql playground is available at `url:PORT/graphql`

## API Endpoints

- `GET /posts`: Get all posts
- `GET /posts/:id`: Get a specific post
- `POST /posts`: Create a new post
- `PUT /posts/:id`: Update a post
- `PATCH /posts/:id`: Partially update a post
- `DELETE /posts/:id`: Delete a post
- `GET /posts/cache/keys`: Get all cache keys
- `GET /posts/cache/:key`: Get cache value for a specific key

## Dummy Data

This application uses the JSONPlaceholder API, which provides dummy data. You don't need to set up any initial data to run the application.

However, if you want to create a new post, you can use the following JSON structure:

```json
{
  "title": "Your post title",
  "body": "Your post content",
  "userId": 1
}
```

## Notes

This application is already delpoyed to vercel with base url:
`https://post-git-main-sanja911s-projects.vercel.app/`