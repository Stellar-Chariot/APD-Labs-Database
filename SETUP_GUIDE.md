# Setup Guide

## Prerequisites
- Node.js (v18 or higher)
- MySQL Server (v8.0 or higher)
- Git
- npm or yarn package manager

## Initial Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Stellar-Chariot/APD-Labs-Database.git
cd APD-Labs-Database
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Database Setup
1. Create MySQL database:
```sql
CREATE DATABASE scientific_samples CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Initialize database schema:
```bash
mysql -u root -p scientific_samples < lib/mysql-schema.sql
```

### 4. Environment Configuration
1. Create `.env.local` file in root directory
2. Add the following configuration:
```
DATABASE_URL=mysql://root:your_password@localhost:3306/scientific_samples
```

### 5. Start Development Server
```bash
npm run dev
# or
yarn dev
```

## Network Configuration (Optional)

### 1. Port Forwarding
- Request port forwarding for:
  - Port 3000 (Next.js application)
  - Port 3306 (MySQL database)

### 2. Update Configuration
- Update `next.config.mjs` for network access
- Configure MySQL for remote connections
- Update database connection settings in `lib/database.ts`

## Common Issues and Solutions

### 1. Database Connection Issues
- Verify MySQL service is running
- Check database credentials
- Ensure port 3306 is accessible

### 2. Application Issues
- Clear node_modules and reinstall dependencies
- Check for port conflicts
- Verify environment variables

## Development Workflow

### 1. Branch Management
- Create feature branches from main
- Follow naming conventions
- Submit pull requests for review

### 2. Database Changes
- Document schema changes
- Create migration scripts
- Test changes locally

### 3. Testing
- Run tests before committing
- Verify database operations
- Check network functionality

## Additional Resources
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/) 