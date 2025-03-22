# Scientific Data Management System

A comprehensive system for managing scientific measurement data in research labs, particularly focused on semiconductor material characterization.

## Features

- Sample tracking with metadata
- MBE recipe management
- Various measurement types (UV-PL, IR-PL, etc.)
- File upload and management
- GraphQL API for flexible data retrieval
- User authentication and authorization

## Technology Stack

- **Backend**: Node.js, Express, Apollo Server, GraphQL
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **File Handling**: Multer

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- MongoDB (local or cloud instance)

### Installation

1. Clone this repository
2. Run the installation batch file:

```
install-and-run.bat
```

This will:
- Verify Node.js is installed
- Create necessary directories
- Install backend dependencies
- Seed the database with initial data
- Start the server

### Accessing the System

Once the server is running, you can access:

- Local access: http://localhost:4000/graphql
- Network access: http://YOUR-IP-ADDRESS:4000/graphql

### Sample GraphQL Query

Try this query to test if everything is working correctly:

```graphql
{
  samples {
    id
    identifier
    name
    substrate
    grower
  }
}
```

## Project Structure

```
scientific-data-system/
├── backend/
│   ├── models/          # MongoDB schema models
│   ├── middleware/      # Express middleware
│   ├── seeders/         # Database seed scripts
│   ├── uploads/         # Storage for uploaded files
│   ├── schema.js        # GraphQL schema
│   ├── resolvers.js     # GraphQL resolvers
│   ├── server.js        # Express/Apollo server
│   └── package.json     # Dependencies
└── install-and-run.bat  # Setup script
```
scientific-data-system/
└── frontend/
    ├── src/
    │   ├── components/           # React components for UI
    │   │   ├── AddSample.js      # Component to add new samples
    │   │   ├── SampleList.js     # Component to list samples
    │   │   └── SampleDetail.js   # (Optional) Component to view a single sample in detail
    │   ├── graphql/              # GraphQL queries and mutations
    │   │   ├── queries.js        # Queries (e.g., fetching samples)
    │   │   ├── mutations.js      # Mutations (e.g., adding samples)
    │   ├── App.js                # Main App component where Apollo Client is set up
    │   ├── index.js              # Entry point for React app
    │   ├── styles/               # CSS/SCSS files for styling
    │   │   └── App.css           # Main CSS for the app
    │   └── utils/                # Helper functions or hooks
    │       └── useForm.js        # Custom hook for handling forms (optional)
    ├── public/
    │   ├── index.html            # Root HTML file
    └── package.json              # Dependencies for the React app

## License

This project is licensed under the MIT License.

## Progress Checklist

- [x] Clone this repository
- [x] Run `install-and-run.bat` to set up backend dependencies (Node.js detected, backend dependencies installed)
- [x] Verify MongoDB connection
- [x] Start the server and access GraphQL endpoint at http://localhost:4000/graphql
- [x] Verify GraphQL query `{ hello }` returns 'Hello, world!'
- [x] GraphQL schema extended with types for Files, FileMeasurements, Samples, and Users
- [ ] Populate MongoDB with initial test data
- [ ] Implement authentication and additional API features 