# Scientific Data Management System - Development Plan

## Project Overview
This document outlines the development plan for the Scientific Data Management System, following a hybrid approach with Node.js/GraphQL backend, React frontend, WordPress integration, and MongoDB database.

## Project Initialization

### Server Requirements
- **Web Server**: Nginx 1.18+ or Apache 2.4+
- **Node.js**: v16+ for backend services
- **MongoDB**: v5.0+ for database
- **WordPress**: v6.0+ for content management and user authentication
- **Disk Space**: Minimum 20GB (100GB+ recommended for data files)
- **Memory**: Minimum 8GB RAM (16GB+ recommended)

### Development Environment Setup
1. **Local Development Environment**
   ```bash
   # Create project structure
   mkdir -p scientific-data-system/{backend,frontend,wordpress}
   cd scientific-data-system

   # Initialize backend
   cd backend
   npm init -y
   npm install express apollo-server-express graphql mongoose multer jsonwebtoken cors
   npm install --save-dev nodemon

   # Initialize frontend
   cd ../frontend
   npx create-react-app .
   npm install @apollo/client graphql recharts axios jwt-decode
   
   # Docker setup (optional for local development)
   cd ..
   touch docker-compose.yml
   ```

2. **Docker Compose Configuration**
   ```yaml
   # docker-compose.yml
   version: '3'
   services:
     mongodb:
       image: mongo:5.0
       ports:
         - "27017:27017"
       volumes:
         - mongo-data:/data/db
     
     backend:
       build: ./backend
       ports:
         - "4000:4000"
       environment:
         - MONGO_URI=mongodb://mongodb:27017/scientific_data
         - JWT_SECRET=your_jwt_secret
       volumes:
         - ./backend:/app
         - /app/node_modules
       depends_on:
         - mongodb

     wordpress:
       image: wordpress:latest
       ports:
         - "8080:80"
       environment:
         - WORDPRESS_DB_HOST=wordpress-db
         - WORDPRESS_DB_NAME=wordpress
         - WORDPRESS_DB_USER=wordpress
         - WORDPRESS_DB_PASSWORD=wordpress_password
       volumes:
         - ./wordpress:/var/www/html
       depends_on:
         - wordpress-db

     wordpress-db:
       image: mysql:5.7
       volumes:
         - wordpress-db-data:/var/lib/mysql
       environment:
         - MYSQL_ROOT_PASSWORD=root_password
         - MYSQL_DATABASE=wordpress
         - MYSQL_USER=wordpress
         - MYSQL_PASSWORD=wordpress_password
         
     frontend:
       build: ./frontend
       ports:
         - "3000:3000"
       volumes:
         - ./frontend:/app
         - /app/node_modules
       depends_on:
         - backend

   volumes:
     mongo-data:
     wordpress-db-data:
   ```

3. **Version Control Setup**
   ```bash
   # Initialize Git repository
   git init
   
   # Create development branch
   git checkout -b development
   
   # Add .gitignore
   cat > .gitignore << 'EOF'
   # Node.js
   node_modules/
   npm-debug.log
   
   # React
   frontend/build/
   frontend/.env
   
   # MongoDB
   data/
   
   # WordPress
   wordpress/wp-content/uploads/
   
   # Environment variables
   .env
   
   # Docker
   docker-compose.override.yml
   
   # IDE
   .idea/
   .vscode/
   
   # Logs
   logs/
   *.log
   EOF
   
   # Initial commit
   git add .
   git commit -m "Initial project setup"
   ```

## Phase 1: Backend Foundation (1-2 months)

### MongoDB Schema Setup
1. **Define MongoDB Models**
   ```javascript
   // Sample model (models/Sample.js)
   const mongoose = require('mongoose');

   const SampleSchema = new mongoose.Schema({
     identifier: {
       type: String,
       required: true,
       unique: true
     },
     name: {
       type: String,
       required: true
     },
     growthDate: Date,
     substrate: String,
     grower: String,
     description: String,
     createdAt: {
       type: Date,
       default: Date.now
     },
     createdBy: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'User',
       required: true
     },
     recipeId: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'MBERecipe'
     },
     metadata: {
       type: Map,
       of: mongoose.Schema.Types.Mixed
     }
   });

   module.exports = mongoose.model('Sample', SampleSchema);
   
   // Measurement model (models/Measurement.js)
   const mongoose = require('mongoose');

   const MeasurementSchema = new mongoose.Schema({
     sampleId: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'Sample',
       required: true
     },
     measurementType: {
       type: String,
       enum: ['UV_PL', 'UV_PR', 'IR_PL', 'IR_EL', 'MBE_GROWTH'],
       required: true
     },
     title: {
       type: String,
       required: true
     },
     description: String,
     createdAt: {
       type: Date,
       default: Date.now
     },
     updatedAt: {
       type: Date,
       default: Date.now
     },
     createdBy: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'User',
       required: true
     },
     parameters: {
       type: mongoose.Schema.Types.Mixed
     },
     files: [{
       fileId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'File'
       },
       fileName: String,
       fileType: String,
       isRawData: Boolean
     }]
   });

   module.exports = mongoose.model('Measurement', MeasurementSchema);
   ```

2. **Create Additional Models**
   - Implement MBERecipe, File, Instrument, User, and Visualization models
   - Set up indexes for optimized queries
   - Define relationship schemas

### GraphQL Schema Setup
1. **Define Type Definitions**
   ```javascript
   // schema.js
   const { gql } = require('apollo-server-express');

   const typeDefs = gql`
     scalar Date
     scalar JSON

     type Sample {
       id: ID!
       identifier: String!
       name: String!
       growthDate: Date
       substrate: String
       grower: String
       description: String
       createdAt: Date!
       createdBy: User!
       recipe: MBERecipe
       measurements: [Measurement]
       metadata: JSON
     }

     type Measurement {
       id: ID!
       sample: Sample!
       measurementType: MeasurementType!
       title: String!
       description: String
       createdAt: Date!
       updatedAt: Date!
       createdBy: User!
       parameters: JSON
       files: [MeasurementFile]
     }

     enum MeasurementType {
       UV_PL
       UV_PR
       IR_PL
       IR_EL
       MBE_GROWTH
     }

     type MeasurementFile {
       fileId: ID!
       fileName: String!
       fileType: String!
       isRawData: Boolean!
     }

     type File {
       id: ID!
       fileName: String!
       originalName: String!
       filePath: String!
       fileType: String!
       fileSize: Int!
       uploadDate: Date!
       md5Hash: String
       isRawData: Boolean!
       measurementId: ID
       uploadedBy: User!
     }

     # Define additional types (MBERecipe, User, etc.)

     # Define queries
     type Query {
       sample(id: ID!): Sample
       samples(
         limit: Int, 
         offset: Int, 
         search: String, 
         grower: String, 
         dateFrom: Date, 
         dateTo: Date
       ): [Sample]
       sampleCount: Int!
       measurement(id: ID!): Measurement
       measurements(
         sampleId: ID, 
         measurementType: MeasurementType, 
         limit: Int, 
         offset: Int
       ): [Measurement]
       # Additional queries
     }

     # Define mutations
     type Mutation {
       createSample(input: SampleInput!): Sample!
       updateSample(id: ID!, input: SampleInput!): Sample!
       deleteSample(id: ID!): Boolean!
       createMeasurement(input: MeasurementInput!): Measurement!
       updateMeasurement(id: ID!, input: MeasurementInput!): Measurement!
       deleteMeasurement(id: ID!): Boolean!
       # Additional mutations
     }

     # Input types
     input SampleInput {
       identifier: String!
       name: String!
       growthDate: Date
       substrate: String
       grower: String
       description: String
       recipeId: ID
       metadata: JSON
     }

     input MeasurementInput {
       sampleId: ID!
       measurementType: MeasurementType!
       title: String!
       description: String
       parameters: JSON
       files: [MeasurementFileInput]
     }

     input MeasurementFileInput {
       fileId: ID!
       fileName: String!
       fileType: String!
       isRawData: Boolean
     }
   `;

   module.exports = typeDefs;
   ```

2. **Implement Resolvers**
   ```javascript
   // resolvers.js
   const Sample = require('./models/Sample');
   const Measurement = require('./models/Measurement');
   const User = require('./models/User');
   // Import other models

   const resolvers = {
     Sample: {
       createdBy: async (parent) => {
         return await User.findById(parent.createdBy);
       },
       recipe: async (parent) => {
         if (!parent.recipeId) return null;
         return await MBERecipe.findById(parent.recipeId);
       },
       measurements: async (parent) => {
         return await Measurement.find({ sampleId: parent._id });
       }
     },
     
     Measurement: {
       sample: async (parent) => {
         return await Sample.findById(parent.sampleId);
       },
       createdBy: async (parent) => {
         return await User.findById(parent.createdBy);
       },
       files: async (parent) => {
         // Return file references directly from the measurement document
         return parent.files || [];
       }
     },
     
     Query: {
       sample: async (_, { id }) => {
         return await Sample.findById(id);
       },
       samples: async (_, { limit = 20, offset = 0, search, grower, dateFrom, dateTo }) => {
         let query = {};
         
         if (search) {
           query.$or = [
             { name: { $regex: search, $options: 'i' } },
             { identifier: { $regex: search, $options: 'i' } },
             { description: { $regex: search, $options: 'i' } }
           ];
         }
         
         if (grower) {
           query.grower = grower;
         }
         
         if (dateFrom || dateTo) {
           query.growthDate = {};
           if (dateFrom) query.growthDate.$gte = new Date(dateFrom);
           if (dateTo) query.growthDate.$lte = new Date(dateTo);
         }
         
         return await Sample.find(query).skip(offset).limit(limit).sort({ createdAt: -1 });
       },
       sampleCount: async () => {
         return await Sample.countDocuments();
       },
       measurement: async (_, { id }) => {
         return await Measurement.findById(id);
       },
       measurements: async (_, { sampleId, measurementType, limit = 20, offset = 0 }) => {
         let query = {};
         if (sampleId) query.sampleId = sampleId;
         if (measurementType) query.measurementType = measurementType;
         
         return await Measurement.find(query).skip(offset).limit(limit).sort({ createdAt: -1 });
       }
       // Implement other queries
     },
     
     Mutation: {
       createSample: async (_, { input }, { user }) => {
         if (!user) throw new Error('Not authenticated');
         
         const sample = new Sample({
           ...input,
           createdBy: user.id
         });
         
         await sample.save();
         return sample;
       },
       updateSample: async (_, { id, input }, { user }) => {
         if (!user) throw new Error('Not authenticated');
         
         const sample = await Sample.findByIdAndUpdate(id, 
           { ...input, updatedAt: new Date() }, 
           { new: true }
         );
         
         if (!sample) throw new Error('Sample not found');
         return sample;
       },
       // Implement other mutations
     }
   };

   module.exports = resolvers;
   ```

### Express Server Setup
1. **Create Server Configuration**
   ```javascript
   // server.js
   const express = require('express');
   const { ApolloServer } = require('apollo-server-express');
   const mongoose = require('mongoose');
   const cors = require('cors');
   const jwt = require('jsonwebtoken');
   const multer = require('multer');
   const path = require('path');
   
   const typeDefs = require('./schema');
   const resolvers = require('./resolvers');

   // Load environment variables
   require('dotenv').config();

   // Set up Express
   const app = express();
   app.use(cors());
   app.use(express.json());
   
   // Set up file upload middleware
   const storage = multer.diskStorage({
     destination: (req, file, cb) => {
       cb(null, './uploads');
     },
     filename: (req, file, cb) => {
       cb(null, `${Date.now()}-${file.originalname}`);
     }
   });
   const upload = multer({ storage });
   
   // File upload endpoint
   app.post('/api/upload', upload.single('file'), (req, res) => {
     // Handle file upload
   });
   
   // Serve uploaded files
   app.use('/files', express.static(path.join(__dirname, 'uploads')));
   
   // Connect to MongoDB
   mongoose.connect(process.env.MONGO_URI)
     .then(() => console.log('MongoDB connected'))
     .catch(err => console.error('MongoDB connection error:', err));
   
   // Authentication middleware
   const getUser = async (token) => {
     if (!token) return null;
     
     try {
       const decoded = jwt.verify(token, process.env.JWT_SECRET);
       // Fetch user from database or WordPress API
       return { id: decoded.id, role: decoded.role };
     } catch (err) {
       return null;
     }
   };
   
   // Set up Apollo Server
   const server = new ApolloServer({
     typeDefs,
     resolvers,
     context: async ({ req }) => {
       const token = req.headers.authorization?.split(' ')[1] || '';
       const user = await getUser(token);
       return { user };
     }
   });
   
   async function startServer() {
     await server.start();
     server.applyMiddleware({ app });
     
     const PORT = process.env.PORT || 4000;
     app.listen(PORT, () => {
       console.log(`Server running on port ${PORT}`);
       console.log(`GraphQL endpoint: http://localhost:${PORT}${server.graphqlPath}`);
     });
   }
   
   startServer();
   ```

### WordPress Integration Setup
1. **Create WordPress Integration Endpoints**
   ```javascript
   // wordpress-integration.js
   const axios = require('axios');
   const jwt = require('jsonwebtoken');

   const WP_URL = process.env.WP_URL || 'http://localhost:8080';
   const JWT_SECRET = process.env.JWT_SECRET;

   // Validate WordPress credentials and generate token
   const authenticateWordPressUser = async (username, password) => {
     try {
       const response = await axios.post(`${WP_URL}/wp-json/jwt-auth/v1/token`, {
         username,
         password
       });
       
       if (response.data.token) {
         // Create our own JWT token with user info from WordPress
         const token = jwt.sign({
           id: response.data.user_id,
           email: response.data.user_email,
           role: mapWordPressRole(response.data.user_role),
           wpToken: response.data.token
         }, JWT_SECRET, { expiresIn: '1d' });
         
         return { success: true, token };
       }
       
       return { success: false, message: 'Invalid credentials' };
     } catch (error) {
       return { success: false, message: error.response?.data?.message || 'Authentication failed' };
     }
   };

   // Map WordPress roles to our application roles
   const mapWordPressRole = (wpRole) => {
     const roleMap = {
       'administrator': 'ADMIN',
       'editor': 'LAB_MANAGER',
       'author': 'RESEARCHER',
       'contributor': 'TECHNICIAN',
       'subscriber': 'VIEWER'
     };
     
     return roleMap[wpRole] || 'VIEWER';
   };

   // Get user information from WordPress
   const getWordPressUser = async (wpToken) => {
     try {
       const response = await axios.get(`${WP_URL}/wp-json/wp/v2/users/me`, {
         headers: {
           'Authorization': `Bearer ${wpToken}`
         }
       });
       
       return {
         wpUserId: response.data.id,
         username: response.data.username,
         email: response.data.email,
         name: response.data.name,
         role: mapWordPressRole(response.data.roles[0])
       };
     } catch (error) {
       return null;
     }
   };

   module.exports = {
     authenticateWordPressUser,
     getWordPressUser
   };
   ```

2. **Set Up Authentication Endpoints**
   ```javascript
   // Add to server.js
   const { authenticateWordPressUser } = require('./wordpress-integration');

   // Authentication endpoint
   app.post('/api/auth/login', async (req, res) => {
     const { username, password } = req.body;
     
     const result = await authenticateWordPressUser(username, password);
     
     if (result.success) {
       res.json({ token: result.token });
     } else {
       res.status(401).json({ message: result.message });
     }
   });
   ```

## Phase 2: Frontend Foundation (1-2 months)

### React Application Setup
1. **Set Up Apollo Client**
   ```javascript
   // src/ApolloClient.js
   import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
   import { setContext } from '@apollo/client/link/context';

   const httpLink = createHttpLink({
     uri: process.env.REACT_APP_GRAPHQL_URL || 'http://localhost:4000/graphql',
   });

   const authLink = setContext((_, { headers }) => {
     // Get token from localStorage
     const token = localStorage.getItem('token');
     
     return {
       headers: {
         ...headers,
         authorization: token ? `Bearer ${token}` : "",
       }
     };
   });

   const client = new ApolloClient({
     link: authLink.concat(httpLink),
     cache: new InMemoryCache()
   });

   export default client;
   ```

2. **Create Basic App Structure**
   ```javascript
   // src/App.js
   import React from 'react';
   import { ApolloProvider } from '@apollo/client';
   import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
   import client from './ApolloClient';
   
   import Dashboard from './pages/Dashboard';
   import SampleList from './pages/SampleList';
   import SampleDetail from './pages/SampleDetail';
   import MeasurementDetail from './pages/MeasurementDetail';
   import Visualization from './pages/Visualization';
   import Login from './pages/Login';
   import Header from './components/Header';
   import PrivateRoute from './components/PrivateRoute';

   function App() {
     return (
       <ApolloProvider client={client}>
         <Router>
           <Header />
           <div className="container">
             <Switch>
               <Route exact path="/login" component={Login} />
               <PrivateRoute exact path="/" component={Dashboard} />
               <PrivateRoute exact path="/samples" component={SampleList} />
               <PrivateRoute exact path="/samples/:id" component={SampleDetail} />
               <PrivateRoute exact path="/measurements/:id" component={MeasurementDetail} />
               <PrivateRoute exact path="/visualization/:id" component={Visualization} />
             </Switch>
           </div>
         </Router>
       </ApolloProvider>
     );
   }

   export default App;
   ```

3. **Create Authentication Components**
   ```javascript
   // src/pages/Login.js
   import React, { useState } from 'react';
   import axios from 'axios';
   import { useHistory } from 'react-router-dom';

   const Login = () => {
     const [username, setUsername] = useState('');
     const [password, setPassword] = useState('');
     const [error, setError] = useState('');
     const history = useHistory();

     const handleSubmit = async (e) => {
       e.preventDefault();
       try {
         const response = await axios.post('/api/auth/login', { username, password });
         localStorage.setItem('token', response.data.token);
         history.push('/');
       } catch (err) {
         setError(err.response?.data?.message || 'Login failed');
       }
     };

     return (
       <div className="login-container">
         <h2>Login</h2>
         {error && <div className="error-message">{error}</div>}
         <form onSubmit={handleSubmit}>
           <div className="form-group">
             <label>Username</label>
             <input
               type="text"
               value={username}
               onChange={(e) => setUsername(e.target.value)}
               required
             />
           </div>
           <div className="form-group">
             <label>Password</label>
             <input
               type="password"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               required
             />
           </div>
           <button type="submit" className="btn-primary">Login</button>
         </form>
       </div>
     );
   };

   export default Login;
   ```

4. **Create Protected Route Component**
   ```javascript
   // src/components/PrivateRoute.js
   import React from 'react';
   import { Route, Redirect } from 'react-router-dom';
   import { isAuthenticated } from '../utils/auth';

   const PrivateRoute = ({ component: Component, ...rest }) => (
     <Route
       {...rest}
       render={props =>
         isAuthenticated() ? (
           <Component {...props} />
         ) : (
           <Redirect to="/login" />
         )
       }
     />
   );

   export default PrivateRoute;
   ```

### WordPress Theme Setup
1. **Create WordPress JWT Authentication**
   - Install and configure JWT Authentication for WP-API plugin
   - Configure CORS to allow requests from React application

2. **Create WordPress Template for React Integration**
   ```php
   <?php
   /*
   Template Name: React App Integration
   */
   ?>
   <!DOCTYPE html>
   <html <?php language_attributes(); ?>>
   <head>
     <meta charset="<?php bloginfo('charset'); ?>">
     <meta name="viewport" content="width=device-width, initial-scale=1">
     <?php wp_head(); ?>
   </head>
   <body <?php body_class(); ?>>
     <?php wp_body_open(); ?>
     
     <div id="react-app-container"></div>
     
     <script>
       window.wpApiSettings = {
         root: '<?php echo esc_url_raw(rest_url()); ?>',
         nonce: '<?php echo wp_create_nonce('wp_rest'); ?>'
       };
     </script>
     
     <?php wp_footer(); ?>
   </body>
   </html>
   ```

## Phase 3: Data Management Implementation (2-3 months)

### Sample Management Implementation
1. **Sample List Component**
   ```javascript
   // src/pages/SampleList.js
   import React, { useState } from 'react';
   import { useQuery, gql } from '@apollo/client';
   import { Link } from 'react-router-dom';

   const GET_SAMPLES = gql`
     query GetSamples($limit: Int, $offset: Int, $search: String, $grower: String) {
       samples(limit: $limit, offset: $offset, search: $search, grower: $grower) {
         id
         identifier
         name
         growthDate
         substrate
         grower
         createdAt
       }
       sampleCount
     }
   `;

   const SampleList = () => {
     const [search, setSearch] = useState('');
     const [grower, setGrower] = useState('');
     const [page, setPage] = useState(1);
     const limit = 20;
     
     const { loading, error, data } = useQuery(GET_SAMPLES, {
       variables: { 
         limit, 
         offset: (page - 1) * limit,
         search: search || undefined,
         grower: grower || undefined
       }
     });

     if (loading) return <p>Loading...</p>;
     if (error) return <p>Error: {error.message}</p>;

     const totalPages = Math.ceil(data.sampleCount / limit);

     return (
       <div className="sample-list">
         <h2>Sample Management</h2>
         
         <div className="filter-controls">
           <input
             type="text"
             placeholder="Search samples..."
             value={search}
             onChange={(e) => setSearch(e.target.value)}
           />
           <input
             type="text"
             placeholder="Filter by grower"
             value={grower}
             onChange={(e) => setGrower(e.target.value)}
           />
           <button onClick={() => setPage(1)}>Apply Filters</button>
         </div>
         
         <Link to="/samples/new" className="btn-primary">Add New Sample</Link>
         
         <table className="data-table">
           <thead>
             <tr>
               <th>ID</th>
               <th>Name</th>
               <th>Growth Date</th>
               <th>Substrate</th>
               <th>Grower</th>
               <th>Created</th>
               <th>Actions</th>
             </tr>
           </thead>
           <tbody>
             {data.samples.map(sample => (
               <tr key={sample.id}>
                 <td>{sample.identifier}</td>
                 <td>{sample.name}</td>
                 <td>{new Date(sample.growthDate).toLocaleDateString()}</td>
                 <td>{sample.substrate}</td>
                 <td>{sample.grower}</td>
                 <td>{new Date(sample.createdAt).toLocaleDateString()}</td>
                 <td>
                   <Link to={`/samples/${sample.id}`}>View</Link>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
         
         <div className="pagination">
           <button 
             disabled={page === 1} 
             onClick={() => setPage(p => Math.max(1, p - 1))}
           >
             Previous
           </button>
           <span>Page {page} of {totalPages}</span>
           <button 
             disabled={page === totalPages} 
             onClick={() => setPage(p => Math.min(totalPages, p + 1))}
           >
             Next
           </button>
         </div>
       </div>
     );
   };

   export default SampleList;
   ```

2. **Sample Detail Component**
   ```javascript
   // src/pages/SampleDetail.js
   import React from 'react';
   import { useParams, Link } from 'react-router-dom';
   import { useQuery, gql } from '@apollo/client';

   const GET_SAMPLE = gql`
     query GetSample($id: ID!) {
       sample(id: $id) {
         id
         identifier
         name
         growthDate
         substrate
         grower
         description
         createdAt
         metadata
         recipe {
           id
           recipeName
           layers {
             material
             thickness
             description
           }
         }
         measurements {
           id
           measurementType
           title
           createdAt
         }
       }
     }
   `;

   const SampleDetail = () => {
     const { id } = useParams();
     const { loading, error, data } = useQuery(GET_SAMPLE, {
       variables: { id }
     });

     if (loading) return <p>Loading...</p>;
     if (error) return <p>Error: {error.message}</p>;
     
     const sample = data.sample;
     
     return (
       <div className="sample-detail">
         <h2>{sample.identifier} - {sample.name}</h2>
         
         <div className="detail-section">
           <h3>Sample Information</h3>
           <div className="detail-grid">
             <div className="detail-item">
               <label>Growth Date:</label>
               <span>{new Date(sample.growthDate).toLocaleDateString()}</span>
             </div>
             <div className="detail-item">
               <label>Substrate:</label>
               <span>{sample.substrate}</span>
             </div>
             <div className="detail-item">
               <label>Grower:</label>
               <span>{sample.grower}</span>
             </div>
             <div className="detail-item">
               <label>Created:</label>
               <span>{new Date(sample.createdAt).toLocaleDateString()}</span>
             </div>
           </div>
           <div className="description">
             <label>Description:</label>
             <p>{sample.description}</p>
           </div>
         </div>
         
         {sample.recipe && (
           <div className="detail-section">
             <h3>Growth Recipe</h3>
             <p>Recipe ID: {sample.recipe.recipeName}</p>
             <div className="layers-container">
               {sample.recipe.layers.map((layer, index) => (
                 <div 
                   key={index} 
                   className="layer"
                   style={{ 
                     height: `${Math.max(20, layer.thickness / 100)}px`,
                     background: getLayerColor(layer.material)
                   }}
                 >
                   {layer.material} {layer.thickness}Å - {layer.description}
                 </div>
               ))}
             </div>
             <Link to={`/recipes/${sample.recipe.id}`}>View Full Recipe</Link>
           </div>
         )}
         
         <div className="detail-section">
           <h3>Measurements</h3>
           <Link to={`/measurements/new?sampleId=${sample.id}`} className="btn-primary">
             Add Measurement
           </Link>
           
           {sample.measurements.length > 0 ? (
             <table className="data-table">
               <thead>
                 <tr>
                   <th>Type</th>
                   <th>Title</th>
                   <th>Date</th>
                   <th>Actions</th>
                 </tr>
               </thead>
               <tbody>
                 {sample.measurements.map(measurement => (
                   <tr key={measurement.id}>
                     <td>{measurement.measurementType}</td>
                     <td>{measurement.title}</td>
                     <td>{new Date(measurement.createdAt).toLocaleDateString()}</td>
                     <td>
                       <Link to={`/measurements/${measurement.id}`}>View</Link>
                       {' | '}
                       <Link to={`/visualization/${measurement.id}`}>Visualize</Link>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           ) : (
             <p>No measurements found for this sample.</p>
           )}
         </div>
       </div>
     );
   };

   const getLayerColor = (material) => {
     const colors = {
       'GaAs': '#B8E0D2',
       'AlAs': '#D6C1AB',
       'AlGaAs': '#95B8D1',
       'InGaAs': '#EDCDBB'
     };
     
     return colors[material] || '#CCCCCC';
   };

   export default SampleDetail;
   ```

### Measurement Management Implementation
1. **Measurement Creation Component**
   ```javascript
   // src/pages/MeasurementForm.js
   import React, { useState } from 'react';
   import { useHistory, useLocation } from 'react-router-dom';
   import { useMutation, gql } from '@apollo/client';

   const CREATE_MEASUREMENT = gql`
     mutation CreateMeasurement($input: MeasurementInput!) {
       createMeasurement(input: $input) {
         id
       }
     }
   `;

   const MeasurementForm = () => {
     const history = useHistory();
     const location = useLocation();
     const queryParams = new URLSearchParams(location.search);
     const sampleId = queryParams.get('sampleId');
     
     const [formData, setFormData] = useState({
       sampleId,
       measurementType: 'UV_PL',
       title: '',
       description: '',
       parameters: {}
     });
     
     const [file, setFile] = useState(null);
     const [createMeasurement, { loading }] = useMutation(CREATE_MEASUREMENT);
     
     const handleChange = (e) => {
       const { name, value } = e.target;
       setFormData(prev => ({ ...prev, [name]: value }));
     };
     
     const handleParameterChange = (e) => {
       const { name, value } = e.target;
       setFormData(prev => ({
         ...prev,
         parameters: {
           ...prev.parameters,
           [name]: value
         }
       }));
     };
     
     const handleFileChange = (e) => {
       setFile(e.target.files[0]);
     };
     
     const handleSubmit = async (e) => {
       e.preventDefault();
       
       // Upload file first if provided
       let fileId = null;
       if (file) {
         const formData = new FormData();
         formData.append('file', file);
         
         try {
           const response = await fetch('/api/upload', {
             method: 'POST',
             body: formData,
             headers: {
               'Authorization': `Bearer ${localStorage.getItem('token')}`
             }
           });
           
           const result = await response.json();
           fileId = result.fileId;
         } catch (err) {
           console.error('File upload failed:', err);
           return;
         }
       }
       
       // Add file reference to measurement if uploaded
       const measurementInput = {
         ...formData
       };
       
       if (fileId) {
         measurementInput.files = [{
           fileId,
           fileName: file.name,
           fileType: file.type,
           isRawData: true
         }];
       }
       
       try {
         const result = await createMeasurement({
           variables: {
             input: measurementInput
           }
         });
         
         history.push(`/measurements/${result.data.createMeasurement.id}`);
       } catch (err) {
         console.error('Error creating measurement:', err);
       }
     };
     
     return (
       <div className="measurement-form">
         <h2>Add New Measurement</h2>
         
         <form onSubmit={handleSubmit}>
           <div className="form-group">
             <label>Measurement Type</label>
             <select
               name="measurementType"
               value={formData.measurementType}
               onChange={handleChange}
               required
             >
               <option value="UV_PL">UV PL</option>
               <option value="UV_PR">UV PR</option>
               <option value="IR_PL">IR PL</option>
               <option value="IR_EL">IR EL</option>
             </select>
           </div>
           
           <div className="form-group">
             <label>Title</label>
             <input
               type="text"
               name="title"
               value={formData.title}
               onChange={handleChange}
               required
             />
           </div>
           
           <div className="form-group">
             <label>Description</label>
             <textarea
               name="description"
               value={formData.description}
               onChange={handleChange}
             />
           </div>
           
           {/* Dynamic parameters based on measurement type */}
           {formData.measurementType === 'UV_PL' && (
             <>
               <div className="form-group">
                 <label>Wavelength Start (nm)</label>
                 <input
                   type="number"
                   name="wavelengthStart"
                   value={formData.parameters.wavelengthStart || ''}
                   onChange={handleParameterChange}
                 />
               </div>
               <div className="form-group">
                 <label>Wavelength End (nm)</label>
                 <input
                   type="number"
                   name="wavelengthEnd"
                   value={formData.parameters.wavelengthEnd || ''}
                   onChange={handleParameterChange}
                 />
               </div>
               <div className="form-group">
                 <label>Integration Time (s)</label>
                 <input
                   type="number"
                   name="integrationTime"
                   step="0.01"
                   value={formData.parameters.integrationTime || ''}
                   onChange={handleParameterChange}
                 />
               </div>
             </>
           )}
           
           {/* Other measurement type parameters */}
           
           <div className="form-group">
             <label>Data File</label>
             <input
               type="file"
               onChange={handleFileChange}
             />
           </div>
           
           <button type="submit" className="btn-primary" disabled={loading}>
             {loading ? 'Saving...' : 'Save Measurement'}
           </button>
         </form>
       </div>
     );
   };

   export default MeasurementForm;
   ```

## Phase 4: Data Visualization Implementation (2-3 months)

### Visualization Components
1. **Basic Chart Component**
   ```javascript
   // src/components/DataChart.js
   import React, { useState, useEffect } from 'react';
   import {
     LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
   } from 'recharts';

   const DataChart = ({ data, xKey, yKey, color = '#8884d8', title }) => {
     return (
       <div className="chart-container">
         {title && <h3>{title}</h3>}
         <ResponsiveContainer width="100%" height={400}>
           <LineChart
             data={data}
             margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
           >
             <CartesianGrid strokeDasharray="3 3" />
             <XAxis 
               dataKey={xKey} 
               label={{ value: xKey, position: 'insideBottomRight', offset: -10 }} 
             />
             <YAxis 
               label={{ value: yKey, angle: -90, position: 'insideLeft' }} 
             />
             <Tooltip />
             <Legend />
             <Line 
               type="monotone" 
               dataKey={yKey} 
               stroke={color} 
               activeDot={{ r: 8 }} 
             />
           </LineChart>
         </ResponsiveContainer>
       </div>
     );
   };

   export default DataChart;
   ```

2. **Measurement Visualization Page**
   ```javascript
   // src/pages/Visualization.js
   import React, { useState, useEffect } from 'react';
   import { useParams } from 'react-router-dom';
   import { useQuery, gql } from '@apollo/client';
   import DataChart from '../components/DataChart';
   import { parseCSV } from '../utils/dataProcessing';

   const GET_MEASUREMENT_FOR_VISUALIZATION = gql`
     query GetMeasurementForVisualization($id: ID!) {
       measurement(id: $id) {
         id
         title
         measurementType
         parameters
         files {
           fileId
           fileName
           fileType
         }
         sample {
           id
           identifier
           name
         }
       }
     }
   `;

   const Visualization = () => {
     const { id } = useParams();
     const { loading, error, data } = useQuery(GET_MEASUREMENT_FOR_VISUALIZATION, {
       variables: { id }
     });
     
     const [chartData, setChartData] = useState([]);
     const [xAxis, setXAxis] = useState('');
     const [yAxis, setYAxis] = useState('');
     const [availableColumns, setAvailableColumns] = useState([]);
     const [isNormalized, setIsNormalized] = useState(false);
     
     useEffect(() => {
       if (data?.measurement?.files?.length > 0) {
         const fileId = data.measurement.files[0].fileId;
         
         // Fetch the data file
         fetch(`/api/files/${fileId}`, {
           headers: {
             'Authorization': `Bearer ${localStorage.getItem('token')}`
           }
         })
           .then(response => response.text())
           .then(csvData => {
             const { data: parsedData, columns } = parseCSV(csvData);
             setChartData(parsedData);
             setAvailableColumns(columns);
             
             // Set default axes based on measurement type and parameters
             const params = data.measurement.parameters;
             if (data.measurement.measurementType === 'UV_PL') {
               const defaultXAxis = params.csvWavelengthColumn || columns.find(c => /wave/i.test(c)) || columns[0];
               const defaultYAxis = params.csvIntensityColumn || columns.find(c => /intensity|PL/i.test(c)) || columns[columns.length - 1];
               
               setXAxis(defaultXAxis);
               setYAxis(defaultYAxis);
             }
           })
           .catch(err => console.error('Error fetching data file:', err));
       }
     }, [data]);
     
     if (loading) return <p>Loading...</p>;
     if (error) return <p>Error: {error.message}</p>;
     
     const measurement = data.measurement;
     
     const handleNormalizeToggle = () => {
       if (!isNormalized && chartData.length > 0) {
         // Normalize the y-axis data
         const maxValue = Math.max(...chartData.map(d => parseFloat(d[yAxis] || 0)));
         const normalizedData = chartData.map(d => ({
           ...d,
           [yAxis]: maxValue ? parseFloat(d[yAxis]) / maxValue : 0
         }));
         setChartData(normalizedData);
       } else {
         // Reload original data
         const fileId = measurement.files[0].fileId;
         fetch(`/api/files/${fileId}`, {
           headers: {
             'Authorization': `Bearer ${localStorage.getItem('token')}`
           }
         })
           .then(response => response.text())
           .then(csvData => {
             const { data: parsedData } = parseCSV(csvData);
             setChartData(parsedData);
           });
       }
       setIsNormalized(!isNormalized);
     };
     
     return (
       <div className="visualization-page">
         <h2>Visualization: {measurement.title}</h2>
         <div className="sample-info">
           <h3>Sample: {measurement.sample.identifier} - {measurement.sample.name}</h3>
         </div>
         
         <div className="chart-controls">
           <div className="control-group">
             <label>X-Axis:</label>
             <select value={xAxis} onChange={(e) => setXAxis(e.target.value)}>
               {availableColumns.map(col => (
                 <option key={col} value={col}>{col}</option>
               ))}
             </select>
           </div>
           
           <div className="control-group">
             <label>Y-Axis:</label>
             <select value={yAxis} onChange={(e) => setYAxis(e.target.value)}>
               {availableColumns.map(col => (
                 <option key={col} value={col}>{col}</option>
               ))}
             </select>
           </div>
           
           <div className="control-group">
             <label>
               <input
                 type="checkbox"
                 checked={isNormalized}
                 onChange={handleNormalizeToggle}
               />
               Normalize Data
             </label>
           </div>
           
           <button className="btn-secondary" onClick={() => window.print()}>
             Export Chart
           </button>
           
           <button className="btn-primary" onClick={() => exportToCSV(chartData, `${measurement.sample.identifier}_${measurement.title}`)}>
             Export Data
           </button>
         </div>
         
         {chartData.length > 0 && xAxis && yAxis ? (
           <DataChart
             data={chartData}
             xKey={xAxis}
             yKey={yAxis}
             title={`${measurement.measurementType}: ${measurement.title}`}
           />
         ) : (
           <p>No data available for visualization</p>
         )}
       </div>
     );
   };

   const exportToCSV = (data, filename) => {
     if (!data.length) return;
     
     const columns = Object.keys(data[0]);
     const csvContent = [
       columns.join(','),
       ...data.map(row => columns.map(col => row[col]).join(','))
     ].join('\n');
     
     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
     const url = URL.createObjectURL(blob);
     const link = document.createElement('a');
     link.setAttribute('href', url);
     link.setAttribute('download', `${filename}.csv`);
     link.style.visibility = 'hidden';
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
   };

   export default Visualization;
   ```

## Phase 5: Integration and Refinement (Ongoing)

### React-WordPress Integration
1. **WordPress Plugin for React Integration**
   - Create a simple plugin to load React application in WordPress
   - Add shortcodes to embed React components in WordPress pages
   - Set up authentication bridge between WordPress and React

2. **Single Sign-On Implementation**
   - Implement JWT token sharing between WordPress and Node.js
   - Create seamless user experience between systems

### Performance Optimization
1. **GraphQL Query Optimization**
   - Implement field selection to reduce data transfer
   - Add caching for common queries
   - Optimize database access patterns

2. **Frontend Optimization**
   - Implement code splitting for React components
   - Add caching for visualization data
   - Optimize large dataset handling

### Documentation and Training
1. **User Documentation**
   - Create comprehensive user manual
   - Add contextual help within the application
   - Create tutorial videos for common workflows

2. **Administrator Documentation**
   - System architecture documentation
   - Backup and recovery procedures
   - Configuration guidelines

## Deployment Strategies

### Development Environment
- Local Docker setup for all components
- Automatic code reloading for development
- Mock data for testing

### Staging Environment
- Deployed to staging server with test data
- Continuous integration for automated testing
- Integration testing across all components

### Production Environment
- High-availability setup with load balancing
- Regular backups of MongoDB data
- Monitoring and alerting system
- HTTPS encryption for all connections

## Timeline Summary
- Phase 1: Backend Foundation (1-2 months)
- Phase 2: Frontend Foundation (1-2 months)
- Phase 3: Data Management Implementation (2-3 months)
- Phase 4: Data Visualization Implementation (2-3 months)
- Phase 5: Integration and Refinement (Ongoing)

Total project time: 6-10 months for full implementation, with basic functionality available within 3-4 months.

2. **Phase 2**: Weeks 9-16
3. **Phase 3**: Weeks 17-24
4. **Phase 4**: Weeks 25+ (ongoing)

Total development time: 6+ months for initial implementation, with ongoing enhancements and refinements.
