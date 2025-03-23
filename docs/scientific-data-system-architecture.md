# Scientific Data Management System - Architectural Plan

## 1. Executive Summary
This document outlines the architecture for a scientific data management system designed to store, process, and visualize measurement data from UV, IR, and MBE equipment. The system will integrate with WordPress for user management while providing specialized scientific data capabilities.

Two implementation tracks are proposed:
1. **Beginner Track**: WordPress-based with plugins for accessibility
2. **Advanced Track**: Modern architecture with dedicated API and specialized components

The system will support visualization of scientific data, experiment tracking, and comprehensive metadata management for research integrity.

## 2. Project Scope and Requirements

### Core Functionality
- Storage and management of scientific measurement data
- Sample tracking and growth recipe management
- Dynamic visualization of scientific data
- User permission management
- Data export and sharing capabilities
- Integration with measurement instruments

### Data Types
- UV measurements (PL, PR)
- IR measurements (PL, EL, FTIR)
- MBE growth recipes and parameters
- Scientific metadata and sample information

### Data Volumes
- Normal dataset size: 2-5 columns with 500-7,000 rows
- Extreme dataset size: 6-20 columns with 5,000-10,000+ rows
- Full visualization of data points required

## 3. System Architecture

### Hybrid Stack Approach

#### Backend Components:
- **Node.js**: JavaScript runtime environment for server-side code
- **Express.js**: Web application framework for Node.js
- **GraphQL**: Query language for APIs, providing flexible data access
- **Apollo Server**: GraphQL server implementation
- **Multer**: Middleware for handling file uploads
- **JWT**: JSON Web Tokens for secure authentication

#### Frontend Components:
- **React**: JavaScript library for building user interfaces
- **WordPress**: Content management system for static content and user management
- **Apollo Client**: State management library for GraphQL data

#### Database:
- **MongoDB**: NoSQL document database for flexible data storage
- **GridFS**: Storage solution for large files within MongoDB

### API Structure

#### GraphQL Schema Structure:
```graphql
type Sample {
  id: ID!
  name: String!
  identifier: String!
  growthDate: Date
  substrate: String
  grower: String
  description: String
  recipe: MBERecipe
  measurements: [Measurement]
}

type Measurement {
  id: ID!
  sample: Sample!
  measurementType: MeasurementType!
  title: String!
  description: String
  createdBy: User!
  createdAt: DateTime!
  updatedAt: DateTime!
  files: [File]
  parameters: JSON
}

enum MeasurementType {
  UV_PL
  UV_PR
  IR_PL
  IR_EL
  MBE_GROWTH
}

type MBERecipe {
  id: ID!
  recipeName: String!
  grower: String!
  growthDate: Date!
  substrateType: String!
  backingWafer: String
  rotationRpm: Float
  growthTemp: Float
  specialNotes: String
  layers: [MBELayer]
  cellConditions: [MBECellCondition]
}

type File {
  id: ID!
  fileName: String!
  filePath: String!
  fileType: String!
  fileSize: Int!
  uploadDate: DateTime!
  md5Hash: String
  isRawData: Boolean!
}

type User {
  id: ID!
  username: String!
  email: String!
  role: UserRole!
  samples: [Sample]
  measurements: [Measurement]
}

enum UserRole {
  ADMIN
  LAB_MANAGER
  RESEARCHER
  TECHNICIAN
  VIEWER
}
```

#### GraphQL Query Examples:
```graphql
# Get sample with measurements
query GetSample($id: ID!) {
  sample(id: $id) {
    id
    name
    identifier
    growthDate
    substrate
    grower
    measurements {
      id
      measurementType
      title
      createdAt
    }
    recipe {
      id
      recipeName
      layers {
        material
        thickness
        purpose
      }
    }
  }
}

# Get measurement with data for visualization
query GetMeasurement($id: ID!) {
  measurement(id: $id) {
    id
    title
    measurementType
    parameters
    files {
      id
      fileName
      filePath
    }
    sample {
      id
      name
      identifier
    }
  }
}
```

### WordPress Integration

#### Integration Approach:
- WordPress will handle user authentication and content management
- WordPress will communicate with Node.js backend via REST API
- React components will be embedded in WordPress pages
- Single sign-on between WordPress and the Node.js application

#### Data Flow:
1. User authenticates via WordPress
2. WordPress generates JWT token for the user
3. React components use this token to authenticate GraphQL requests
4. GraphQL resolvers validate token before processing requests

### Decision Framework for Implementation Path

| Factor | Considerations |
|--------|----------------|
| Team Skills | Node.js, Express, React, and GraphQL require JavaScript expertise |
| Scale | MongoDB scales well for the expected data volumes (10,000+ samples, 5,000-10,000+ data points) |
| Timeline | Hybrid approach allows phased implementation |
| Budget | Open-source components reduce licensing costs |
| Customization | GraphQL provides highly flexible data access |
| Integration | Apollo Client enables smooth integration between React and GraphQL |
| University IT | Need to ensure MongoDB is supported by university infrastructure |
| Future Growth | Document model provides flexibility for evolving scientific data requirements |

## 4. MongoDB Data Model

### Sample Collection
```json
{
  "_id": "ObjectId()",
  "identifier": "T250306A",
  "name": "GaAs QW Structure",
  "growthDate": "2025-03-06T00:00:00Z",
  "substrate": "GaAs",
  "grower": "Scott Sifferman",
  "description": "Standard GaAs/AlGaAs quantum well structure grown at 600°C",
  "createdAt": "2025-03-07T10:15:00Z",
  "createdBy": "ObjectId(user_id)",
  "recipeId": "ObjectId(recipe_id)",
  "metadata": {
    "substrateSize": "1/4 3\"",
    "backingWafer": "sapphire",
    "rotationRpm": 5
  }
}
```

### Measurement Collection
```json
{
  "_id": "ObjectId()",
  "sampleId": "ObjectId(sample_id)",
  "measurementType": "UV_PL",
  "title": "Room Temperature PL Measurement",
  "description": "PL measurement at room temperature with 532nm excitation",
  "createdAt": "2025-03-07T14:30:00Z",
  "updatedAt": "2025-03-07T14:30:00Z",
  "createdBy": "ObjectId(user_id)",
  "parameters": {
    "wavelengthStart": 600,
    "wavelengthEnd": 850,
    "resolution": 0.5,
    "integrationTime": 0.1,
    "temperature": 295,
    "csvWavelengthColumn": "wavelength",
    "csvIntensityColumn": "intensity"
  },
  "files": [
    {
      "fileId": "ObjectId(file_id)",
      "fileName": "T250306A_RT_PL.csv",
      "fileType": "text/csv",
      "isRawData": true
    }
  ]
}
```

### MBE Recipe Collection
```json
{
  "_id": "ObjectId()",
  "recipeName": "B200319A",
  "grower": "Scott Sifferman",
  "growthDate": "2025-03-19T00:00:00Z",
  "substrateType": "1/4 3\" SI GaAs",
  "backingWafer": "sapphire",
  "rotationRpm": 5,
  "growthTemp": 600,
  "specialNotes": "6000 Ang of Al0.3Ga0.7As is enough to absorb 90% of an incident 532 nm pump laser",
  "layers": [
    {
      "material": "GaAs",
      "thickness": 100,
      "layerOrder": 1,
      "description": "cap",
      "growthTempThermocouple": 600,
      "growthTempPyro": null,
      "isSubstrate": false,
      "composition": null,
      "purpose": "cap"
    },
    {
      "material": "AlAs",
      "thickness": 100,
      "layerOrder": 2,
      "description": "blocking layer",
      "growthTempThermocouple": 600,
      "growthTempPyro": null,
      "isSubstrate": false,
      "composition": null,
      "purpose": "blocking layer"
    },
    {
      "material": "AlGaAs",
      "thickness": 3000,
      "layerOrder": 3,
      "description": "barrier",
      "growthTempThermocouple": 600,
      "growthTempPyro": null,
      "isSubstrate": false,
      "composition": "Al0.3Ga0.7As",
      "purpose": "barrier"
    },
    {
      "material": "GaAs",
      "thickness": 100,
      "layerOrder": 4,
      "description": "QW",
      "growthTempThermocouple": 600,
      "growthTempPyro": null,
      "isSubstrate": false,
      "composition": null,
      "purpose": "QW"
    },
    {
      "material": "GaAs",
      "thickness": 0,
      "layerOrder": 5,
      "description": "substrate",
      "growthTempThermocouple": null,
      "growthTempPyro": null,
      "isSubstrate": true,
      "composition": null,
      "purpose": "substrate"
    }
  ],
  "cellConditions": [
    {
      "cellName": "GaTip",
      "temperature": null,
      "pressure": 1.89e-7,
      "growthRate": 0.88,
      "flux": null,
      "bep": null,
      "idleTemp": null,
      "evalTemp": 997.0
    },
    {
      "cellName": "AlBase",
      "temperature": null,
      "pressure": 3.614e-8,
      "growthRate": 1.26,
      "flux": null,
      "bep": null,
      "idleTemp": null,
      "evalTemp": 1070.4
    },
    {
      "cellName": "AsValve",
      "temperature": null,
      "pressure": 2.7e-6,
      "growthRate": null,
      "flux": null,
      "bep": null,
      "idleTemp": null,
      "evalTemp": 210.5
    }
  ]
}
```

### Files Collection
```json
{
  "_id": "ObjectId()",
  "fileName": "T250306A_RT_PL.csv",
  "originalName": "RT_PL_measurement.csv",
  "filePath": "/data/measurements/uvpl/T250306A_RT_PL.csv",
  "fileType": "text/csv",
  "fileSize": 24680,
  "uploadDate": "2025-03-07T14:30:00Z",
  "md5Hash": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "isRawData": true,
  "measurementId": "ObjectId(measurement_id)",
  "uploadedBy": "ObjectId(user_id)"
}
```

### Instrument Collection
```json
{
  "_id": "ObjectId()",
  "instrumentName": "FTIR-2000",
  "instrumentType": "FTIR",
  "manufacturer": "Shimadzu",
  "model": "IRTracer-100",
  "serialNumber": "A654321",
  "location": "Room 203",
  "acquisitionDate": "2023-05-15T00:00:00Z",
  "lastCalibration": "2025-01-10T00:00:00Z",
  "nextCalibration": "2025-07-10T00:00:00Z",
  "status": "operational",
  "notes": "Used for IR measurements",
  "specifications": {
    "detectorType": "DTGS",
    "beamSplitter": "KBr",
    "sourceType": "Ceramic",
    "resolutionRange": "0.5 - 16 cm⁻¹",
    "wavenumberRange": "350 - 7800 cm⁻¹",
    "apertureSettings": ["auto", "1.5", "3", "6", "9", "12"],
    "purgeOptions": ["nitrogen", "dry air"],
    "accessories": ["ATR", "Diffuse reflectance"]
  }
}
```

### User Collection
```json
{
  "_id": "ObjectId()",
  "username": "sscott",
  "email": "scott.s@university.edu",
  "name": "Scott Sifferman",
  "role": "RESEARCHER",
  "department": "Materials Science",
  "createdAt": "2024-12-01T00:00:00Z",
  "lastLogin": "2025-03-15T09:45:00Z",
  "wpUserId": 42, // WordPress user ID for integration
  "preferences": {
    "defaultVisualization": "line",
    "defaultSampleView": "list",
    "emailNotifications": true
  }
}
```

### Visualization Collection
```json
{
  "_id": "ObjectId()",
  "title": "UV PL Comparison - T250306A and T250307B",
  "description": "Comparison of room temperature PL for two different QW structures",
  "createdAt": "2025-03-10T15:20:00Z",
  "createdBy": "ObjectId(user_id)",
  "isPublic": true,
  "measurements": [
    "ObjectId(measurement1_id)",
    "ObjectId(measurement2_id)"
  ],
  "configuration": {
    "chartType": "line",
    "xAxis": {
      "dataKey": "wavelength",
      "label": "Wavelength (nm)",
      "min": 600,
      "max": 850
    },
    "yAxis": {
      "dataKey": "intensity",
      "label": "Intensity (a.u.)",
      "normalize": true
    },
    "series": [
      {
        "measurementId": "ObjectId(measurement1_id)",
        "label": "T250306A",
        "color": "#3366CC"
      },
      {
        "measurementId": "ObjectId(measurement2_id)", 
        "label": "T250307B",
        "color": "#DC3912"
      }
    ],
    "legend": {
      "position": "bottom",
      "enabled": true
    }
  }
}
```

### Activity Log Collection
```json
{
  "_id": "ObjectId()",
  "userId": "ObjectId(user_id)",
  "username": "sscott",
  "action": "CREATE_MEASUREMENT",
  "description": "Added new UV PL measurement to sample T250306A",
  "timestamp": "2025-03-07T14:30:00Z",
  "resourceType": "Measurement",
  "resourceId": "ObjectId(measurement_id)",
  "details": {
    "sampleId": "ObjectId(sample_id)",
    "measurementType": "UV_PL",
    "measurementTitle": "Room Temperature PL Measurement"
  }
}
```

## 5. User Permission and Security

### User Roles:
- **Administrator**: Full system access
- **Lab Manager**: Access to all data, can manage users
- **Researcher**: Can create/edit own samples and measurements
- **Technician**: Can add measurements to existing samples
- **Viewer**: Read-only access to specific datasets

### Permission Matrix:
| Action | Administrator | Lab Manager | Researcher | Technician | Viewer |
|--------|--------------|------------|------------|------------|---------|
| Create User | ✓ | ✓ | - | - | - |
| Create Sample | ✓ | ✓ | ✓ | - | - |
| View All Samples | ✓ | ✓ | - | - | - |
| View Own/Team Samples | ✓ | ✓ | ✓ | ✓ | ✓ |
| Add Measurements | ✓ | ✓ | ✓ | ✓ | - |
| Edit Any Measurement | ✓ | ✓ | - | - | - |
| Export Data | ✓ | ✓ | ✓ | ✓ | ✓ |
| System Settings | ✓ | - | - | - | - |

### Security Considerations:
- Implement HTTPS for all connections
- Use WordPress authentication system with enhanced security plugins
- Implement proper SQL parameterization to prevent injection attacks
- Create regular database backups
- Set up audit logging for sensitive operations
- Implement file upload validation and scanning
- Follow university IT security policies

## 6. Data Visualization

### Dynamic Interactive Visualization Requirements
- Dynamic axis changing on the fly
- Ability to select different variables for visualization
- Comparative visualization between multiple datasets
- On-demand creation of new visualization types
- Interactive filtering and zooming
- Real-time updates to visualizations based on user selections

### Dynamic Visualization Approach - Beginner Track

#### Recommended Solution: Dash Integration
1. **Python Dash Application**:
   - Deploy Dash application on same server as WordPress
   - Create modular Dash layouts for different visualization types
   - Implement callback structure for all interactive elements

2. **WordPress Integration**:
   - Create dedicated WordPress page template that embeds Dash app
   - Pass authentication tokens between WordPress and Dash
   - Use URL parameters for initial visualization state

### Raw Data Export Capabilities
- Button-triggered raw data export from visualizations
- Export of selected data points or entire datasets
- Multiple export format options
- Clear association between visualization and exported data

## 7. Implementation Roadmaps

### Implementation Roadmap - Beginner Track

#### Phase 1: Foundation Setup
1. **Install WordPress**: Basic installation with security plugins
   - Tools: Softaculous (often available on university hosting)
   - Difficulty: ⭐☆☆☆☆ (Very Easy)

2. **Configure User Roles**: Set up the permission structure
   - Tools: User Role Editor plugin
   - Difficulty: ⭐⭐☆☆☆ (Easy) 

3. **Create Sample Post Type**: Define the data structure for samples
   - Tools: Custom Post Type UI plugin
   - Difficulty: ⭐⭐☆☆☆ (Easy)

#### Phase 2: Data Structure Implementation
4. **Create Metadata Fields**: Add fields for sample information
   - Tools: Advanced Custom Fields plugin
   - Difficulty: ⭐⭐☆☆☆ (Easy)

5. **Set Up Custom Database Tables**: Create tables for measurement data
   - Tools: phpMyAdmin or WP Data Access plugin
   - Difficulty: ⭐⭐⭐☆☆ (Moderate)
   - Resource: [WPBeginner Custom Tables Tutorial](https://www.wpbeginner.com/wp-tutorials/how-to-create-custom-database-tables-in-wordpress/)

6. **Create Forms**: Build data entry forms for measurements
   - Tools: Gravity Forms or Formidable Forms
   - Difficulty: ⭐⭐☆☆☆ (Easy)

#### Phase 3: Scientific Functionality
7. **Implement File Upload**: Allow scientific data file uploads
   - Tools: Media Library + File Upload field in ACF
   - Difficulty: ⭐⭐☆☆☆ (Easy)

8. **Connect Python Scripts**: Link WordPress to data processing
   - Tools: WP-Cron + PHP exec() or REST API
   - Difficulty: ⭐⭐⭐⭐☆ (Challenging)
   - Resource: [WP REST API Handbook](https://developer.wordpress.org/rest-api/)
   - Consider asking university IT for assistance with this step

9. **Create Visualization Pages**: Display scientific data
   - Tools: wpDataTables or embed Python Dash/Plotly
   - Difficulty: ⭐⭐⭐☆☆ (Moderate)

#### Phase 4: Testing and Documentation
10. **Implement Testing Procedures**: Ensure data integrity
    - Tools: Simple History plugin for logs
    - Difficulty: ⭐⭐☆☆☆ (Easy)

11. **Create User Documentation**: Help guides for researchers
    - Tools: WP Knowledge Base or Documentation plugin
    - Difficulty: ⭐⭐☆☆☆ (Easy)

12. **Set Up Backup System**: Ensure data safety
    - Tools: UpdraftPlus plugin
    - Difficulty: ⭐☆☆☆☆ (Very Easy)

### Implementation Roadmap - Advanced Track

#### Phase 1: Architecture and Planning
1. **Finalize System Architecture**
   - Create detailed entity-relationship diagrams
   - Document API specifications using OpenAPI/Swagger
   - Define system boundaries and integration points

2. **Set Up Development Environment**
   - Configure version control (Git)
   - Establish CI/CD pipeline
   - Create development, staging, and production environments

3. **Design Database Schema**
   - Create normalized database design
   - Define indexes and optimization strategies
   - Implement database migration system

#### Phase 2: Core Development
4. **Implement Authentication System**
   - Develop user management with JWT or OAuth
   - Set up role-based access control
   - Create API key management for instrument integration

5. **Develop Core Data Models**
   - Implement sample tracking system
   - Create measurement data structures
   - Build file storage and retrieval system

6. **Create API Layer**
   - Develop RESTful API endpoints
   - Implement GraphQL schema (optional)
   - Create API documentation

#### Phase 3: Scientific Functionality
7. **Implement Data Processing Pipeline**
   - Build automation for data processing
   - Create data validation system
   - Develop scientific algorithms in Python/R

8. **Develop Visualization Components**
   - Create interactive data visualizations
   - Implement data export functionality
   - Build dashboards with real-time updates

9. **Instrument Integration**
   - Develop instrument connectors
   - Create automated data import
   - Implement calibration management

#### Phase 4: Deployment and Scaling
10. **Performance Optimization**
    - Implement caching strategies
    - Optimize database queries
    - Set up load balancing

11. **Security Hardening**
    - Conduct security audit
    - Implement encryption
    - Set up monitoring and alerting

12. **Documentation and Training**
    - Create API documentation
    - Develop technical guides
    - Build administrator training materials

## 8. Beginner-Friendly Resources

### WordPress Resources:
- **WP Data Access**: Plugin that creates admin interfaces for custom database tables
- **Advanced Custom Fields**: Simplifies adding metadata fields to samples (custom post types)
- **WPGraphQL**: Creates easy API access to WordPress data
- **User Role Editor**: Simplifies permission management

### Beginner-Friendly Database Tools:
- **phpMyAdmin**: Visual database management (usually included with university hosting)
- **Adminer**: Lightweight alternative to phpMyAdmin
- **HeidiSQL**: Desktop client for MySQL database management

### Simplified Development Approaches:
- **ACF to REST API**: Expose WordPress custom fields through REST API without coding
- **Elementor**: Visual page builder to create interfaces without HTML/CSS knowledge
- **Gravity Forms + GravityView**: Create data entry forms and views without PHP coding

### Learning Resources:
- **WordPress Developer Resources**: https://developer.wordpress.org/
- **WP Beginners**: https://www.wpbeginner.com/
- **LinkedIn Learning / Udemy Courses**: Many universities offer free access
- **WordPress.tv**: Free WordPress video tutorials

## 9. Performance and Scaling Considerations

### Data Volume Considerations

#### Dataset Characteristics
- **Normal Dataset Size**: 
  - 2-5 columns with 500-7,000 rows
  - Primarily CSV format
  - Straightforward scientific measurements

- **Extreme Dataset Size**:
  - 6-20 columns with 5,000-10,000+ rows
  - More complex relational data
  - Multiple measurement types per sample

#### Performance Recommendations for Beginner Track

##### Data Import Strategy
- **Small-Medium Files** (< 3,000 rows):
  - Use WordPress CSV importers (like WP All Import)
  - Process through browser interface
  
- **Larger Files** (3,000-7,000 rows):
  - Split import into batches
  - Use server-side PHP scripts triggered by WP-Cron
  - Consider scheduled overnight imports

- **Very Large Files** (7,000+ rows):
  - Use direct database import via phpMyAdmin
  - Create a simple PHP CLI script for IT department to run

##### Database Optimization
- Add indexes to frequently queried columns
- Use WordPress transient API for caching common queries
- Set reasonable limits on data shown per page (pagination)
- For tables > 5,000 rows, consider partitioning by date/year

#### Performance Recommendations for Advanced Track

##### Data Import Architecture
- Design ETL (Extract, Transform, Load) pipeline
- Implement stream processing for larger datasets
- Use background workers for handling imports
- Create validation and error handling pipeline

##### Database Optimization
- Implement database sharding for measurement data
- Create materialized views for common queries
- Use database connection pooling
- Implement query caching layer

## 10. Deployment and Maintenance

### Deployment Strategies
- **Development Environment**: Local setup for testing and development
- **Staging Environment**: Test server that mirrors production
- **Production Environment**: Live server with optimized settings

### Backup and Recovery
- Implement daily database backups
- Create file backup strategy
- Document disaster recovery procedures
- Test restore procedures regularly

### Monitoring and Maintenance
- Set up server health monitoring
- Implement database performance monitoring
- Create automated database optimization tasks
- Schedule regular security updates

### Documentation
- Create system architecture documentation
- Develop user documentation and help guides
- Document database schema
- Create API documentation if applicable

## 11. Conclusion and Next Steps

### Recommended Approach
Based on the requirements and university environment, the recommended approach is:

1. Start with the Beginner Track for rapid deployment
2. Implement core sample and measurement management
3. Add Python integration for scientific visualization
4. Gradually enhance with more advanced features as needed

### Immediate Next Steps
1. Review this architecture with university IT department
2. Obtain approval for WordPress-based implementation
3. Secure development resources and environment
4. Begin implementation of Phase 1 (Foundation Setup)

### Long-term Considerations
1. Develop a data migration strategy for existing measurements
2. Create a training plan for researchers and staff
3. Establish regular review cycles for system enhancement
4. Plan for potential scaling as usage increases