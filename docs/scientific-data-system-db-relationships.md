# Scientific Data Management System - Database Structure and Data Relationships

## Core Database Structure Overview

The database is organized around a document-oriented structure in MongoDB, with collections for samples, measurements, and supporting data. This document explains the relationships between these collections and how data flows through the system.

## Primary Data Flow

```
Users → Samples → Measurements → Measurement Data → Visualizations
```

### Central Collections and Their Relationships

1. **Sample Management**
   - **Samples Collection** - Stores sample information and metadata
   - **MBE Recipe Collection** - Stores growth recipe information
   - **Sample Identifiers** - Embedded within sample documents

2. **Measurement Management**
   - **Measurements Collection** - Stores measurement metadata with type-specific parameters
   - **Files Collection** - Stores file metadata and paths

3. **Visualization Management**
   - **Visualizations Collection** - Stores visualization configurations
   - **Raw Data** - Stored as files and referenced in measurements

4. **User Management**
   - **Users Collection** - Internal users with references to WordPress users
   - **Activity Log Collection** - Tracks user actions

## Key Database Relationships Explained

### 1. Sample to Measurement Relationship

- **One-to-Many**: Each sample can have multiple measurements
- **Connection Point**: `Measurements.sampleId` references `Samples._id`
- **Data Access Pattern**: 
  ```javascript
  const measurements = await Measurement.find({ sampleId: sampleId });
  ```

### 2. Measurement to File Relationship

- **One-to-Many**: Each measurement can have multiple files
- **Connection Point**: `Measurements.files` array contains file references
- **Data Access Pattern**:
  ```javascript
  const measurement = await Measurement.findById(measurementId);
  const fileIds = measurement.files.map(file => file.fileId);
  const files = await File.find({ _id: { $in: fileIds } });
  ```

### 3. Sample to MBE Recipe Relationship

- **One-to-One**: Each sample is associated with one growth recipe
- **Connection Point**: `Samples.recipeId` references `MBERecipe._id`
- **Data Access Pattern**:
  ```javascript
  const sample = await Sample.findById(sampleId);
  const recipe = await MBERecipe.findById(sample.recipeId);
  ```

### 4. Instrument to Measurement Relationship

- **Reference**: Measurements store instrument information directly or by reference
- **Connection Point**: Measurement parameters include instrument information
- **Data Access Pattern**:
  ```javascript
  const measurement = await Measurement.findById(measurementId);
  const instrumentId = measurement.parameters.instrumentId;
  const instrument = await Instrument.findById(instrumentId);
  ```

## GraphQL Access Patterns

### Sample Queries

```graphql
# Get sample with related measurements
query GetSample($id: ID!) {
  sample(id: $id) {
    id
    identifier
    name
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
      }
    }
  }
}

# Get measurements for a sample
query GetSampleMeasurements($sampleId: ID!) {
  measurements(sampleId: $sampleId) {
    id
    measurementType
    title
    createdAt
    files {
      fileId
      fileName
    }
  }
}
```

### Measurement Queries

```graphql
# Get measurement with data for visualization
query GetMeasurement($id: ID!) {
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
```

## Dashboard Data Sources

### Quick Stats Cards

| Card | Data Source | MongoDB Query (simplified) |
|------|-------------|------------------------|
| Total Samples | Count from Samples collection | `db.samples.countDocuments()` |
| Measurements | Count from Measurements collection | `db.measurements.countDocuments()` |
| Processing Jobs | Count of pending jobs | `db.jobs.countDocuments({ status: 'pending' })` |
| New Results | Count of recent measurements | `db.measurements.countDocuments({ createdAt: { $gt: recentDate } })` |

### Recent Activity

- **Data Source**: Activity log collection that tracks user actions
- **Query**:
  ```javascript
  db.activityLog.find().sort({ timestamp: -1 }).limit(5)
  ```
- **Filtering**: Limited to recent entries with priority to high-importance activities

### Recent Samples

- **Data Source**: Samples collection filtered by date
- **Query**:
  ```javascript
  db.samples.find().sort({ createdAt: -1 }).limit(5)
  ```
- **Related Data**: GraphQL resolvers automatically fetch related measurements

## Sample Management Data Flow

### Sample List View

- **Primary Data**: Sample records from Samples collection
- **Filtering**: MongoDB query operators for filtering
- **Pagination**: Using `skip()` and `limit()` in MongoDB
- **Example Query**:
  ```javascript
  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { identifier: { $regex: search, $options: 'i' } }
    ];
  }
  const samples = await Sample.find(query)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });
  ```

### Sample Detail View

- **Basic Info**: Sample document from Samples collection
- **Growth Recipe**: Referenced MBE recipe document
- **Measurements List**: Query Measurements collection by sampleId
- **History**: Activity log entries filtered by sample ID
- **GraphQL Resolver**:
  ```javascript
  const sampleResolver = {
    measurements: async (parent) => {
      return await Measurement.find({ sampleId: parent._id });
    },
    recipe: async (parent) => {
      if (!parent.recipeId) return null;
      return await MBERecipe.findById(parent.recipeId);
    }
  };
  ```

## Measurement Data Flow

### Measurement List View

- **Primary Data**: Measurement documents from Measurements collection
- **Filtering**: MongoDB query filters by type, date, sample, etc.
- **Joins**: GraphQL resolvers fetch related Sample data
- **Example Query**:
  ```javascript
  const measurements = await Measurement.find({
    sampleId: sampleId,
    ...(measurementType && { measurementType })
  })
  .skip((page - 1) * limit)
  .limit(limit)
  .sort({ createdAt: -1 });
  ```

### Measurement Detail View

- **Basic Info**: Measurement document from Measurements collection
- **Type-Specific Parameters**: Stored within the measurement document
- **File References**: Embedded file information with fileId references
- **Sample Info**: GraphQL resolver fetches the associated sample
- **GraphQL Resolver**:
  ```javascript
  const measurementResolver = {
    sample: async (parent) => {
      return await Sample.findById(parent.sampleId);
    },
    files: async (parent) => {
      // Return file references directly from the measurement document
      return parent.files || [];
    }
  };
  ```

## Visualization Data Sources

### Single Measurement Visualization

- **Data Source**: Raw data files referenced in measurement documents
- **File Access**: API endpoint to retrieve file data
- **Chart Configuration**: From Visualizations collection or ad-hoc
- **Data Processing**:
  ```javascript
  // Node.js API endpoint for file data
  app.get('/api/files/:fileId', async (req, res) => {
    const file = await File.findById(req.params.fileId);
    if (!file) return res.status(404).send('File not found');
    
    // Read file from storage
    const fileData = await fs.readFile(file.filePath);
    
    // Return file based on type
    if (file.fileType === 'text/csv') {
      res.setHeader('Content-Type', 'text/csv');
      return res.send(fileData);
    }
    // Handle other file types
  });
  ```

### Comparative Visualization

- **Data Sources**: Multiple measurement data files
- **Configuration**: Visualization document from Visualizations collection
- **Normalization**: Performed client-side in React components
- **Example Visualization Document**:
  ```javascript
  {
    _id: ObjectId(),
    title: "UV PL Comparison",
    measurements: [ObjectId("m1"), ObjectId("m2")],
    configuration: {
      chartType: "line",
      xAxis: { dataKey: "wavelength", label: "Wavelength (nm)" },
      yAxis: { dataKey: "intensity", label: "Intensity (a.u.)", normalize: true },
      series: [
        { measurementId: ObjectId("m1"), label: "Sample A", color: "#3366CC" },
        { measurementId: ObjectId("m2"), label: "Sample B", color: "#DC3912" }
      ]
    }
  }
  ```

### Multi-Sample Dashboard

- **Data Sources**: Aggregated data from multiple samples
- **Aggregation**: MongoDB aggregation pipeline for summary data
- **Example Aggregation**:
  ```javascript
  const result = await Sample.aggregate([
    { $match: { substrate: "GaAs" } },
    { $lookup: {
        from: "measurements",
        localField: "_id",
        foreignField: "sampleId",
        as: "measurements"
    }},
    { $unwind: "$measurements" },
    { $match: { "measurements.measurementType": "UV_PL" } },
    { $group: {
        _id: "$grower", 
        sampleCount: { $sum: 1 },
        avgValue: { $avg: "$measurements.parameters.peakIntensity" }
    }}
  ]);
  ```

## MBE Recipe Visualization

### Layer Structure Diagram

- **Data Source**: Layers array in MBE Recipe document
- **Ordering**: Layers ordered by layerOrder field
- **React Component**: Renders layers based on thickness and material
- **Example Recipe Document**:
  ```javascript
  {
    _id: ObjectId(),
    recipeName: "B200319A",
    layers: [
      { material: "GaAs", thickness: 100, layerOrder: 1, purpose: "cap" },
      { material: "AlAs", thickness: 100, layerOrder: 2, purpose: "blocking layer" },
      { material: "AlGaAs", thickness: 3000, layerOrder: 3, composition: "Al0.3Ga0.7As", purpose: "barrier" }
    ],
    cellConditions: [
      { cellName: "GaTip", pressure: 1.89e-7, growthRate: 0.88, evalTemp: 997.0 }
    ]
  }
  ```

## Data Export and Formatting

### CSV Export

- **Data Source**: Raw measurement data from files
- **Processing**: Node.js streams for efficient processing
- **Example Implementation**:
  ```javascript
  app.get('/api/export/measurement/:id', async (req, res) => {
    const measurement = await Measurement.findById(req.params.id);
    if (!measurement) return res.status(404).send('Measurement not found');
    
    // Get the main data file
    const fileId = measurement.files.find(f => f.isRawData)?.fileId;
    if (!fileId) return res.status(404).send('No data file found');
    
    const file = await File.findById(fileId);
    
    // Stream file with transformation if needed
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${measurement.title}.csv"`);
    
    // Create read stream and pipe to response
    const fileStream = fs.createReadStream(file.filePath);
    fileStream.pipe(res);
  });
  ```

### Excel Export

- **Data Source**: Combination of measurement data and metadata
- **Processing**: Node.js Excel library (e.g., exceljs)
- **Example Implementation**:
  ```javascript
  app.get('/api/export/measurement/:id/excel', async (req, res) => {
    // Similar to CSV but using Excel library
    const Excel = require('exceljs');
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('Data');
    
    // Add headers, metadata, and data
    // ...
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${measurement.title}.xlsx"`);
    
    await workbook.xlsx.write(res);
    res.end();
  });
  ```

## Search Functionality

### GraphQL Search

- **Query**: Uses MongoDB text search and regex for flexibility
- **Example GraphQL Query**:
  ```graphql
  query SearchSamples($search: String) {
    samples(search: $search, limit: 20) {
      id
      identifier
      name
      growthDate
      substrate
    }
  }
  ```

- **Server Implementation**:
  ```javascript
  const resolvers = {
    Query: {
      samples: async (_, { search, limit = 20, offset = 0 }) => {
        let query = {};
        if (search) {
          query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { identifier: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ];
        }
        return await Sample.find(query).skip(offset).limit(limit).sort({ createdAt: -1 });
      }
    }
  };
  ```

### Filtered Search

- **MongoDB Queries**: Flexible query operators for filtering
- **Example Filtering**:
  ```javascript
  const query = {};
  
  // Apply filters
  if (grower) query.grower = grower;
  if (substrate) query.substrate = substrate;
  
  // Date range filter
  if (fromDate || toDate) {
    query.growthDate = {};
    if (fromDate) query.growthDate.$gte = new Date(fromDate);
    if (toDate) query.growthDate.$lte = new Date(toDate);
  }
  
  const samples = await Sample.find(query);
  ```

## Data Update Propagation

When data is updated, changes are handled using the following patterns:

1. **Sample Update Flow**:
   - Update Sample document
   - Log change in activity log
   - No cascading updates needed due to reference-based design

2. **Measurement Update Flow**:
   - Update Measurement document
   - Update file references if needed
   - Log change in activity log

3. **Recipe Update Flow**:
   - Update MBE Recipe document including embedded layers and cell conditions
   - No need for separate update operations due to embedded document pattern

## WordPress Integration Data Flow

### WordPress User Authentication

- **WordPress Login**: User authenticates via WordPress
- **JWT Token**: WordPress plugin generates JWT for API access
- **User Mapping**: Node.js backend maps WordPress user to MongoDB user
- **Example Flow**:
  ```
  1. User logs into WordPress
  2. WordPress generates JWT with user info
  3. React app stores JWT token
  4. JWT token used for GraphQL API requests
  5. GraphQL resolvers validate JWT and identify user
  ```

### WordPress Content Integration

- **Embedded React**: React components embedded in WordPress pages
- **Data Access**: React components access data via GraphQL API
- **User Experience**: Seamless navigation between WordPress and React components

## MongoDB Indexing Strategy

```javascript
// Sample indexes
db.samples.createIndex({ identifier: 1 }, { unique: true });
db.samples.createIndex({ grower: 1 });
db.samples.createIndex({ growthDate: 1 });
db.samples.createIndex({ createdAt: 1 });

// Measurement indexes
db.measurements.createIndex({ sampleId: 1 });
db.measurements.createIndex({ measurementType: 1 });
db.measurements.createIndex({ createdAt: 1 });
db.measurements.createIndex({ "files.fileId": 1 });

// Recipe indexes
db.mbeRecipes.createIndex({ recipeName: 1 }, { unique: true });
```

## Database to UI Component Mapping

This section explains which MongoDB collections power each major UI component:

### Dashboard Components
- **Stats Cards**: Aggregates and counts from main collections
- **Activity Feed**: Activity log collection
- **Recent Samples**: Samples collection with sort and limit

### Sample Management Components
- **Sample List**: Samples collection with filtering and pagination
- **Sample Detail**: Sample document + related measurements
- **Sample Editor**: Updates Sample document fields

### Measurement Components
- **Measurement List**: Measurements collection filtered by criteria
- **Measurement Detail**: Measurement document + file data
- **Data Entry Form**: Creates new Measurement documents

### Visualization Components
- **Chart View**: File data + visualization settings
- **Comparison View**: Multiple file data sources + comparison settings
- **Export Options**: File data formatted for different outputs
