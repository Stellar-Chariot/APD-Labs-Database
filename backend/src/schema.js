const { gql } = require('apollo-server-express');

const typeDefs = gql`
  scalar Date
  scalar DateTime
  scalar JSON
  scalar Upload

  type Sample {
    id: ID!
    identifier: String!
    name: String!
    growthDate: Date
    substrate: String
    grower: String
    description: String
    createdAt: DateTime
    createdBy: User
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
    createdBy: User
    createdAt: DateTime
    updatedAt: DateTime
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

  type MBELayer {
    id: ID!
    material: String!
    thickness: Float!
    layerOrder: Int!
    description: String
    growthTempThermocouple: Float
    growthTempPyro: Float
    isSubstrate: Boolean
    composition: String
    purpose: String
  }

  type MBECellCondition {
    id: ID!
    cellName: String!
    temperature: Float!
    pressure: Float
    growthRate: Float
    flux: Float
    bep: Float
    idleTemp: Float
    evalTemp: Float
  }

  type File {
    id: ID!
    fileName: String!
    originalName: String!
    filePath: String!
    fileType: String!
    fileSize: Int!
    uploadDate: DateTime!
    md5Hash: String
    isRawData: Boolean
    measurementId: ID
    uploadedBy: User
  }

  type User {
    id: ID!
    username: String!
    email: String!
    role: UserRole
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

  type AuthPayload {
    token: String!
    user: User!
  }

  # Pagination Types
  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
    totalCount: Int!
  }

  type SampleConnection {
    edges: [SampleEdge!]!
    pageInfo: PageInfo!
  }

  type SampleEdge {
    node: Sample!
    cursor: String!
  }

  type MeasurementConnection {
    edges: [MeasurementEdge!]!
    pageInfo: PageInfo!
  }

  type MeasurementEdge {
    node: Measurement!
    cursor: String!
  }

  type MBERecipeConnection {
    edges: [MBERecipeEdge!]!
    pageInfo: PageInfo!
  }

  type MBERecipeEdge {
    node: MBERecipe!
    cursor: String!
  }

  # Sorting and Filtering Inputs
  input SampleFilterInput {
    identifier: StringFilterInput
    name: StringFilterInput
    substrate: StringFilterInput
    grower: StringFilterInput
    growthDateFrom: Date
    growthDateTo: Date
    createdAtFrom: DateTime
    createdAtTo: DateTime
    AND: [SampleFilterInput]
    OR: [SampleFilterInput]
  }

  input MeasurementFilterInput {
    title: StringFilterInput
    measurementType: MeasurementType
    createdAtFrom: DateTime
    createdAtTo: DateTime
    sampleId: ID
    AND: [MeasurementFilterInput]
    OR: [MeasurementFilterInput]
  }

  input MBERecipeFilterInput {
    recipeName: StringFilterInput
    grower: StringFilterInput
    substrateType: StringFilterInput
    growthDateFrom: Date
    growthDateTo: Date
    AND: [MBERecipeFilterInput]
    OR: [MBERecipeFilterInput]
  }

  input StringFilterInput {
    eq: String
    contains: String
    startsWith: String
    endsWith: String
  }

  enum SortDirection {
    ASC
    DESC
  }

  input SampleSortInput {
    identifier: SortDirection
    name: SortDirection
    growthDate: SortDirection
    createdAt: SortDirection
    grower: SortDirection
  }

  input MeasurementSortInput {
    title: SortDirection
    createdAt: SortDirection
    updatedAt: SortDirection
    measurementType: SortDirection
  }

  input MBERecipeSortInput {
    recipeName: SortDirection
    grower: SortDirection
    growthDate: SortDirection
  }

  type Query {
    hello: String
    
    # Sample queries
    samples(
      filter: SampleFilterInput
      sort: SampleSortInput
      first: Int
      after: String
      last: Int
      before: String
    ): SampleConnection
    sample(id: ID!): Sample
    samplesByGrower(grower: String!): [Sample]
    searchSamples(term: String!): [Sample]
    
    # Measurement queries
    measurements(
      filter: MeasurementFilterInput
      sort: MeasurementSortInput
      first: Int
      after: String
      last: Int
      before: String
    ): MeasurementConnection
    measurement(id: ID!): Measurement
    measurementsBySample(sampleId: ID!): [Measurement]
    measurementsByType(type: MeasurementType!): [Measurement]
    
    # MBE Recipe queries
    mbeRecipes(
      filter: MBERecipeFilterInput
      sort: MBERecipeSortInput
      first: Int
      after: String
      last: Int
      before: String
    ): MBERecipeConnection
    mbeRecipe(id: ID!): MBERecipe
    mbeRecipesByGrower(grower: String!): [MBERecipe]
    
    # File queries
    files: [File]
    file(id: ID!): File
    filesByMeasurement(measurementId: ID!): [File]
    
    # User queries
    users: [User]
    user(id: ID!): User
    me: User

    # Advanced search
    advancedSearch(
      term: String!
      types: [SearchableType!]
      limit: Int
    ): [SearchResult]
  }

  enum SearchableType {
    SAMPLE
    MEASUREMENT
    MBE_RECIPE
    FILE
  }

  union SearchResult = Sample | Measurement | MBERecipe | File

  type Mutation {
    # Authentication mutations
    signup(username: String!, email: String!, password: String!): AuthPayload
    login(username: String!, password: String!): AuthPayload
    
    # Sample mutations
    createSample(input: SampleInput!): Sample
    updateSample(id: ID!, input: SampleInput!): Sample
    deleteSample(id: ID!): Sample
    
    # Measurement mutations
    createMeasurement(input: MeasurementInput!): Measurement
    updateMeasurement(id: ID!, input: MeasurementInput!): Measurement
    deleteMeasurement(id: ID!): Measurement
    
    # MBE Recipe mutations
    createMBERecipe(input: MBERecipeInput!): MBERecipe
    updateMBERecipe(id: ID!, input: MBERecipeInput!): MBERecipe
    deleteMBERecipe(id: ID!): MBERecipe
    
    # File mutations
    uploadFile(file: Upload!, measurementId: ID): File
    deleteFile(id: ID!): File

    # Batch operations
    batchCreateSamples(inputs: [SampleInput!]!): [Sample]
    batchUpdateSamples(updates: [BatchUpdateSampleInput!]!): [Sample]
    batchDeleteSamples(ids: [ID!]!): Boolean

    # Data analysis
    analyzeMeasurementData(id: ID!, options: AnalysisOptionsInput!): AnalysisResult
  }

  input BatchUpdateSampleInput {
    id: ID!
    input: SampleInput!
  }

  input AnalysisOptionsInput {
    type: AnalysisType!
    parameters: JSON
  }

  enum AnalysisType {
    PEAK_DETECTION
    CURVE_FITTING
    STATISTICAL_ANALYSIS
    COMPARISON
  }

  type AnalysisResult {
    id: ID!
    type: AnalysisType!
    data: JSON!
    createdAt: DateTime!
    measurement: Measurement!
  }

  input SampleInput {
    identifier: String!
    name: String!
    growthDate: Date
    substrate: String
    grower: String
    description: String
    metadata: JSON
    recipeId: ID
  }

  input MeasurementInput {
    sampleId: ID!
    measurementType: MeasurementType!
    title: String!
    description: String
    parameters: JSON
  }

  input MBERecipeInput {
    recipeName: String!
    grower: String!
    growthDate: Date!
    substrateType: String!
    backingWafer: String
    rotationRpm: Float
    growthTemp: Float
    specialNotes: String
    layers: [MBELayerInput]
    cellConditions: [MBECellConditionInput]
  }

  input MBELayerInput {
    material: String!
    thickness: Float!
    layerOrder: Int!
    description: String
    growthTempThermocouple: Float
    growthTempPyro: Float
    isSubstrate: Boolean
    composition: String
    purpose: String
  }

  input MBECellConditionInput {
    cellName: String!
    temperature: Float!
    pressure: Float
    growthRate: Float
    flux: Float
    bep: Float
    idleTemp: Float
    evalTemp: Float
  }
`;

module.exports = typeDefs; 