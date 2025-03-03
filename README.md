# Sales Analytics

## Project Setup

### Prerequisites

Ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (version 16 or later recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/)
- [Redis](https://redis.io/)

### Installation

1. Clone the repository:

   ```sh
   git clone <repository-url>
   cd sales_analytics
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

   or if using yarn:

   ```sh
   yarn install
   ```

3. Create an `.env` file in the root directory and configure the required environment variables. Example:
   ```env
   PORT=4000
   MONGO_URI=mongodb://localhost:27017/yourdbname
   REDIS_URL=redis://localhost:6379
   ```

### Running the Project

- Start the development server:

  ```sh
  npm run dev
  ```

  or

  ```sh
  yarn dev
  ```

- Start the production build:
  ```sh
  npm run build
  npm start
  ```

### Project Structure

```
.
├── src
│   ├── index.ts      # Entry point
│   ├── resolvers     # GraphQL resolvers
│   ├── schemas       # GraphQL schemas
│   ├── models        # Mongoose models
│   ├── config        # Configuration files
│   ├── utils         # Utility functions
│   └── routes        # Express routes
├── package.json      # Project metadata and dependencies
├── tsconfig.json     # TypeScript configuration
└── README.md         # Documentation
```

### API Endpoints

| Method | Endpoint   | Description          |
| ------ | ---------- | -------------------- |
| POST   | `/graphql` | GraphQL API endpoint |

### Notes

- Ensure MongoDB and Redis services are running before starting the application.
- Modify the `.env` file to match your local environment settings.

### License

This project is licensed under the ISC License.
