const { AuthenticationError, UserInputError } = require('apollo-server-express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { GraphQLScalarType, Kind } = require('graphql');

// Custom scalar resolvers
const dateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  serialize(value) {
    return value.getTime();
  },
  parseValue(value) {
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return new Date(parseInt(ast.value, 10));
    }
    return null;
  },
});

const dateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime custom scalar type',
  serialize(value) {
    return value.toISOString();
  },
  parseValue(value) {
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

const jsonScalar = new GraphQLScalarType({
  name: 'JSON',
  description: 'JSON custom scalar type',
  serialize(value) {
    return value;
  },
  parseValue(value) {
    return value;
  },
  parseLiteral(ast) {
    switch (ast.kind) {
      case Kind.STRING:
        return JSON.parse(ast.value);
      case Kind.OBJECT:
        return ast.fields.reduce((obj, field) => {
          obj[field.name.value] = parseLiteral(field.value);
          return obj;
        }, {});
      default:
        return null;
    }
  },
});

// Auth helper functions
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role || 'VIEWER' },
    process.env.JWT_SECRET || 'secretkey',
    { expiresIn: '1d' }
  );
};

// Add these helper functions for pagination, sorting, and filtering
const buildCursorPagination = async (
  Model,
  { first, after, last, before, filter, sort },
  buildQuery = () => ({})
) => {
  // Construct the base query from filter
  let query = { ...buildQuery() };
  
  // Apply filters if provided
  if (filter) {
    query = { ...query, ...buildFilterQuery(filter) };
  }
  
  // Determine sort options
  const sortOptions = buildSortOptions(sort);
  
  // Handle cursor-based pagination
  if (after) {
    const afterDoc = await Model.findById(Buffer.from(after, 'base64').toString());
    if (afterDoc) {
      const compareField = Object.keys(sortOptions)[0] || '_id';
      const comparator = sortOptions[compareField] === 1 ? '$gt' : '$lt';
      query[compareField] = { [comparator]: afterDoc[compareField] };
    }
  }
  
  if (before) {
    const beforeDoc = await Model.findById(Buffer.from(before, 'base64').toString());
    if (beforeDoc) {
      const compareField = Object.keys(sortOptions)[0] || '_id';
      const comparator = sortOptions[compareField] === 1 ? '$lt' : '$gt';
      query[compareField] = { [comparator]: beforeDoc[compareField] };
    }
  }

  // Determine limit
  let limit = first || last || 10;
  
  // Get total count for pageInfo
  const totalCount = await Model.countDocuments(query);
  
  // Execute query
  let results = await Model.find(query).sort(sortOptions).limit(limit + 1);
  
  // Check if there are more results than requested (has next page)
  const hasNextPage = results.length > limit;
  if (hasNextPage) {
    results = results.slice(0, limit);
  }
  
  // If using "last", reverse the results
  if (last) {
    results.reverse();
  }
  
  // Build edges with cursors
  const edges = results.map(node => ({
    node,
    cursor: Buffer.from(node.id).toString('base64')
  }));
  
  // Build pageInfo
  const pageInfo = {
    hasNextPage,
    hasPreviousPage: !!after || !!before,
    startCursor: edges.length > 0 ? edges[0].cursor : null,
    endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
    totalCount
  };
  
  return {
    edges,
    pageInfo
  };
};

const buildFilterQuery = (filter) => {
  if (!filter) return {};
  
  const query = {};
  
  // Handle logical operators first
  if (filter.AND) {
    return { $and: filter.AND.map(buildFilterQuery) };
  }
  
  if (filter.OR) {
    return { $or: filter.OR.map(buildFilterQuery) };
  }
  
  // Process each field in the filter
  Object.keys(filter).forEach(key => {
    const value = filter[key];

    // Skip logical operators as they were handled above
    if (key === 'AND' || key === 'OR') return;
    
    // Handle date range filters
    if (key.endsWith('From')) {
      const fieldName = key.replace('From', '');
      query[fieldName] = query[fieldName] || {};
      query[fieldName].$gte = value;
      return;
    }
    
    if (key.endsWith('To')) {
      const fieldName = key.replace('To', '');
      query[fieldName] = query[fieldName] || {};
      query[fieldName].$lte = value;
      return;
    }
    
    // Handle string filters
    if (value && typeof value === 'object') {
      if (value.eq) {
        query[key] = value.eq;
      } else if (value.contains) {
        query[key] = { $regex: value.contains, $options: 'i' };
      } else if (value.startsWith) {
        query[key] = { $regex: `^${value.startsWith}`, $options: 'i' };
      } else if (value.endsWith) {
        query[key] = { $regex: `${value.endsWith}$`, $options: 'i' };
      }
    } else {
      // Simple equality match
      query[key] = value;
    }
  });
  
  return query;
};

const buildSortOptions = (sort) => {
  if (!sort) return { _id: 1 }; // Default sort by ID ascending
  
  const sortOptions = {};
  
  Object.keys(sort).forEach(key => {
    sortOptions[key] = sort[key] === 'ASC' ? 1 : -1;
  });
  
  return sortOptions;
};

const resolvers = {
  Date: dateScalar,
  DateTime: dateTimeScalar,
  JSON: jsonScalar,

  // Type resolvers
  Sample: {
    measurements: async (parent, args, { models }) => {
      return await models.Measurement.find({ sample: parent._id });
    },
    recipe: async (parent, args, { models }) => {
      if (!parent.recipe) return null;
      return await models.MBERecipe.findById(parent.recipe);
    },
    createdBy: async (parent, args, { models }) => {
      if (!parent.createdBy) return null;
      return await models.User.findById(parent.createdBy);
    }
  },
  
  Measurement: {
    sample: async (parent, args, { models }) => {
      return await models.Sample.findById(parent.sample);
    },
    files: async (parent, args, { models }) => {
      return await models.File.find({ measurementId: parent._id });
    },
    createdBy: async (parent, args, { models }) => {
      if (!parent.createdBy) return null;
      return await models.User.findById(parent.createdBy);
    }
  },
  
  File: {
    uploadedBy: async (parent, args, { models }) => {
      if (!parent.uploadedBy) return null;
      return await models.User.findById(parent.uploadedBy);
    }
  },
  
  User: {
    samples: async (parent, args, { models }) => {
      return await models.Sample.find({ createdBy: parent._id });
    },
    measurements: async (parent, args, { models }) => {
      return await models.Measurement.find({ createdBy: parent._id });
    }
  },
  
  SearchResult: {
    __resolveType(obj) {
      if (obj.identifier && obj.name) return 'Sample';
      if (obj.measurementType) return 'Measurement';
      if (obj.recipeName) return 'MBERecipe';
      if (obj.fileName) return 'File';
      return null;
    }
  },
  
  // Query resolvers
  Query: {
    hello: () => 'Hello, world!',
    
    // Sample queries
    samples: async (_, args, { models }) => {
      try {
        return await buildCursorPagination(models.Sample, args);
      } catch (err) {
        console.error('Error fetching samples with pagination:', err);
        throw err;
      }
    },
    
    sample: async (_, { id }, { models }) => {
      try {
        return await models.Sample.findById(id);
      } catch (err) {
        console.error('Error fetching sample:', err);
        return null;
      }
    },
    
    samplesByGrower: async (_, { grower }, { models }) => {
      try {
        return await models.Sample.find({ grower });
      } catch (err) {
        console.error('Error fetching samples by grower:', err);
        return [];
      }
    },
    
    searchSamples: async (_, { term }, { models }) => {
      try {
        return await models.Sample.find(
          { $text: { $search: term } },
          { score: { $meta: "textScore" } }
        ).sort({ score: { $meta: "textScore" } });
      } catch (err) {
        console.error('Error searching samples:', err);
        return [];
      }
    },
    
    // Measurement queries
    measurements: async (_, args, { models }) => {
      try {
        return await buildCursorPagination(models.Measurement, args);
      } catch (err) {
        console.error('Error fetching measurements with pagination:', err);
        throw err;
      }
    },
    
    measurement: async (_, { id }, { models }) => {
      try {
        return await models.Measurement.findById(id);
      } catch (err) {
        console.error('Error fetching measurement:', err);
        return null;
      }
    },
    
    measurementsBySample: async (_, { sampleId }, { models }) => {
      try {
        return await models.Measurement.find({ sample: sampleId });
      } catch (err) {
        console.error('Error fetching measurements by sample:', err);
        return [];
      }
    },
    
    measurementsByType: async (_, { type }, { models }) => {
      try {
        return await models.Measurement.find({ measurementType: type });
      } catch (err) {
        console.error('Error fetching measurements by type:', err);
        return [];
      }
    },
    
    // MBE Recipe queries
    mbeRecipes: async (_, args, { models }) => {
      try {
        return await buildCursorPagination(models.MBERecipe, args);
      } catch (err) {
        console.error('Error fetching MBE recipes with pagination:', err);
        throw err;
      }
    },
    
    mbeRecipe: async (_, { id }, { models }) => {
      try {
        return await models.MBERecipe.findById(id);
      } catch (err) {
        console.error('Error fetching MBE recipe:', err);
        return null;
      }
    },
    
    mbeRecipesByGrower: async (_, { grower }, { models }) => {
      try {
        return await models.MBERecipe.find({ grower });
      } catch (err) {
        console.error('Error fetching MBE recipes by grower:', err);
        return [];
      }
    },
    
    // File queries
    files: async (_, args, { models }) => {
      try {
        return await models.File.find();
      } catch (err) {
        console.error('Error fetching files:', err);
        return [];
      }
    },
    
    file: async (_, { id }, { models }) => {
      try {
        return await models.File.findById(id);
      } catch (err) {
        console.error('Error fetching file:', err);
        return null;
      }
    },
    
    filesByMeasurement: async (_, { measurementId }, { models }) => {
      try {
        return await models.File.find({ measurementId });
      } catch (err) {
        console.error('Error fetching files by measurement:', err);
        return [];
      }
    },
    
    // User queries
    users: async (_, args, { models, user }) => {
      // Only admins can list all users
      if (!user || user.role !== 'ADMIN') {
        throw new AuthenticationError('You do not have permission to view users');
      }
      try {
        return await models.User.find();
      } catch (err) {
        console.error('Error fetching users:', err);
        return [];
      }
    },
    
    user: async (_, { id }, { models, user }) => {
      // Only admins or the user themselves can fetch user details
      if (!user || (user.role !== 'ADMIN' && user.id !== id)) {
        throw new AuthenticationError('You do not have permission to view this user');
      }
      try {
        return await models.User.findById(id);
      } catch (err) {
        console.error('Error fetching user:', err);
        return null;
      }
    },
    
    me: async (_, args, { models, user }) => {
      if (!user) {
        throw new AuthenticationError('You are not authenticated');
      }
      try {
        return await models.User.findById(user.id);
      } catch (err) {
        console.error('Error fetching current user:', err);
        return null;
      }
    },
    
    // Advanced search implementation
    advancedSearch: async (_, { term, types, limit = 10 }, { models }) => {
      try {
        const results = [];
        const searchTypes = types || ['SAMPLE', 'MEASUREMENT', 'MBE_RECIPE', 'FILE'];
        
        // Search in samples
        if (searchTypes.includes('SAMPLE')) {
          const samples = await models.Sample.find(
            { $text: { $search: term } },
            { score: { $meta: 'textScore' } }
          )
          .sort({ score: { $meta: 'textScore' } })
          .limit(limit);
          
          results.push(...samples);
        }
        
        // Search in measurements
        if (searchTypes.includes('MEASUREMENT')) {
          const measurements = await models.Measurement.find(
            { $text: { $search: term } },
            { score: { $meta: 'textScore' } }
          )
          .sort({ score: { $meta: 'textScore' } })
          .limit(limit);
          
          results.push(...measurements);
        }
        
        // Search in MBE recipes
        if (searchTypes.includes('MBE_RECIPE')) {
          const recipes = await models.MBERecipe.find(
            { $text: { $search: term } },
            { score: { $meta: 'textScore' } }
          )
          .sort({ score: { $meta: 'textScore' } })
          .limit(limit);
          
          results.push(...recipes);
        }
        
        // Search in files
        if (searchTypes.includes('FILE')) {
          const files = await models.File.find(
            { $text: { $search: term } },
            { score: { $meta: 'textScore' } }
          )
          .sort({ score: { $meta: 'textScore' } })
          .limit(limit);
          
          results.push(...files);
        }
        
        // Sort all results by text score and limit
        results.sort((a, b) => b._doc.score - a._doc.score);
        return results.slice(0, limit);
      } catch (err) {
        console.error('Error performing advanced search:', err);
        throw err;
      }
    }
  },
  
  // Mutation resolvers
  Mutation: {
    // Authentication mutations
    signup: async (_, { username, email, password }, { models }) => {
      try {
        let existingUser = await models.User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
          throw new UserInputError('User already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await models.User.create({ 
          username, 
          email, 
          password: hashedPassword,
          role: 'RESEARCHER' // Default role for new users
        });
        const token = generateToken(user);
        return { token, user };
      } catch (err) {
        console.error('Error in signup:', err);
        throw err;
      }
    },
    
    login: async (_, { username, password }, { models }) => {
      try {
        const user = await models.User.findOne({ username });
        if (!user) {
          throw new UserInputError('No such user found');
        }
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
          throw new UserInputError('Invalid password');
        }
        const token = generateToken(user);
        return { token, user };
      } catch (err) {
        console.error('Error in login:', err);
        throw err;
      }
    },
    
    // Sample mutations
    createSample: async (_, { input }, { models, user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to create a sample');
      }
      try {
        const sample = new models.Sample({
          ...input,
          createdBy: user.id,
          createdAt: new Date(),
        });
        
        // If recipeId is provided, link it
        if (input.recipeId) {
          const recipe = await models.MBERecipe.findById(input.recipeId);
          if (!recipe) {
            throw new UserInputError('Recipe not found');
          }
          sample.recipe = input.recipeId;
        }
        
        await sample.save();
        return sample;
      } catch (err) {
        console.error('Error creating sample:', err);
        throw err;
      }
    },
    
    updateSample: async (_, { id, input }, { models, user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to update a sample');
      }
      try {
        const sample = await models.Sample.findById(id);
        if (!sample) {
          throw new UserInputError('Sample not found');
        }
        
        // Check permissions - only creator or admin can update
        if (sample.createdBy && sample.createdBy.toString() !== user.id && user.role !== 'ADMIN') {
          throw new AuthenticationError('You do not have permission to update this sample');
        }
        
        // Handle recipe link if recipeId is provided
        if (input.recipeId) {
          const recipe = await models.MBERecipe.findById(input.recipeId);
          if (!recipe) {
            throw new UserInputError('Recipe not found');
          }
          input.recipe = input.recipeId;
          delete input.recipeId;
        }
        
        const updatedSample = await models.Sample.findByIdAndUpdate(
          id, 
          input, 
          { new: true }
        );
        return updatedSample;
      } catch (err) {
        console.error('Error updating sample:', err);
        throw err;
      }
    },
    
    deleteSample: async (_, { id }, { models, user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to delete a sample');
      }
      try {
        const sample = await models.Sample.findById(id);
        if (!sample) {
          throw new UserInputError('Sample not found');
        }
        
        // Check permissions - only creator or admin can delete
        if (sample.createdBy && sample.createdBy.toString() !== user.id && user.role !== 'ADMIN') {
          throw new AuthenticationError('You do not have permission to delete this sample');
        }
        
        // Delete associated measurements
        await models.Measurement.deleteMany({ sample: id });
        
        // Delete the sample
        const deletedSample = await models.Sample.findByIdAndDelete(id);
        return deletedSample;
      } catch (err) {
        console.error('Error deleting sample:', err);
        throw err;
      }
    },
    
    // Measurement mutations
    createMeasurement: async (_, { input }, { models, user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to create a measurement');
      }
      try {
        // Verify the sample exists
        const sample = await models.Sample.findById(input.sampleId);
        if (!sample) {
          throw new UserInputError('Sample not found');
        }
        
        const measurement = new models.Measurement({
          ...input,
          sample: input.sampleId,
          createdBy: user.id,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        await measurement.save();
        return measurement;
      } catch (err) {
        console.error('Error creating measurement:', err);
        throw err;
      }
    },
    
    updateMeasurement: async (_, { id, input }, { models, user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to update a measurement');
      }
      try {
        const measurement = await models.Measurement.findById(id);
        if (!measurement) {
          throw new UserInputError('Measurement not found');
        }
        
        // Check permissions - only creator or admin can update
        if (measurement.createdBy && measurement.createdBy.toString() !== user.id && user.role !== 'ADMIN') {
          throw new AuthenticationError('You do not have permission to update this measurement');
        }
        
        // If changing the sample, verify it exists
        if (input.sampleId) {
          const sample = await models.Sample.findById(input.sampleId);
          if (!sample) {
            throw new UserInputError('Sample not found');
          }
          input.sample = input.sampleId;
          delete input.sampleId;
        }
        
        // Update with current time
        input.updatedAt = new Date();
        
        const updatedMeasurement = await models.Measurement.findByIdAndUpdate(
          id, 
          input, 
          { new: true }
        );
        return updatedMeasurement;
      } catch (err) {
        console.error('Error updating measurement:', err);
        throw err;
      }
    },
    
    deleteMeasurement: async (_, { id }, { models, user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to delete a measurement');
      }
      try {
        const measurement = await models.Measurement.findById(id);
        if (!measurement) {
          throw new UserInputError('Measurement not found');
        }
        
        // Check permissions - only creator or admin can delete
        if (measurement.createdBy && measurement.createdBy.toString() !== user.id && user.role !== 'ADMIN') {
          throw new AuthenticationError('You do not have permission to delete this measurement');
        }
        
        // Delete associated files
        await models.File.deleteMany({ measurementId: id });
        
        // Delete the measurement
        const deletedMeasurement = await models.Measurement.findByIdAndDelete(id);
        return deletedMeasurement;
      } catch (err) {
        console.error('Error deleting measurement:', err);
        throw err;
      }
    },
    
    // MBE Recipe mutations
    createMBERecipe: async (_, { input }, { models, user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to create an MBE recipe');
      }
      try {
        const recipe = new models.MBERecipe(input);
        await recipe.save();
        return recipe;
      } catch (err) {
        console.error('Error creating MBE recipe:', err);
        throw err;
      }
    },
    
    updateMBERecipe: async (_, { id, input }, { models, user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to update an MBE recipe');
      }
      try {
        const recipe = await models.MBERecipe.findById(id);
        if (!recipe) {
          throw new UserInputError('MBE recipe not found');
        }
        
        // Only allow updates if admin or if recipe grower matches username
        if (user.role !== 'ADMIN' && recipe.grower !== user.username) {
          throw new AuthenticationError('You do not have permission to update this recipe');
        }
        
        const updatedRecipe = await models.MBERecipe.findByIdAndUpdate(
          id, 
          input, 
          { new: true }
        );
        return updatedRecipe;
      } catch (err) {
        console.error('Error updating MBE recipe:', err);
        throw err;
      }
    },
    
    deleteMBERecipe: async (_, { id }, { models, user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to delete an MBE recipe');
      }
      try {
        const recipe = await models.MBERecipe.findById(id);
        if (!recipe) {
          throw new UserInputError('MBE recipe not found');
        }
        
        // Only allow deletion if admin or if recipe grower matches username
        if (user.role !== 'ADMIN' && recipe.grower !== user.username) {
          throw new AuthenticationError('You do not have permission to delete this recipe');
        }
        
        // Check if the recipe is used by any samples
        const samplesUsingRecipe = await models.Sample.countDocuments({ recipe: id });
        if (samplesUsingRecipe > 0) {
          throw new UserInputError(`Cannot delete recipe: used by ${samplesUsingRecipe} samples`);
        }
        
        const deletedRecipe = await models.MBERecipe.findByIdAndDelete(id);
        return deletedRecipe;
      } catch (err) {
        console.error('Error deleting MBE recipe:', err);
        throw err;
      }
    },
    
    // File mutations - upload logic is handled by the Express endpoint
    // This just creates the File record in MongoDB
    uploadFile: async (_, { file, measurementId }, { models, user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to upload a file');
      }
      try {
        // Note: Actual file upload would be handled by multer through an Express endpoint
        // This resolver would receive the file metadata after upload
        
        // If a measurement is specified, verify it exists
        if (measurementId) {
          const measurement = await models.Measurement.findById(measurementId);
          if (!measurement) {
            throw new UserInputError('Measurement not found');
          }
        }
        
        // In a real implementation, we would link to a file previously uploaded
        // through an Express endpoint
        const newFile = new models.File({
          fileName: file.filename,
          originalName: file.originalname,
          filePath: file.path,
          fileType: file.mimetype,
          fileSize: file.size,
          uploadDate: new Date(),
          measurementId,
          uploadedBy: user.id,
          isRawData: false
        });
        
        await newFile.save();
        return newFile;
      } catch (err) {
        console.error('Error uploading file:', err);
        throw err;
      }
    },
    
    deleteFile: async (_, { id }, { models, user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to delete a file');
      }
      try {
        const file = await models.File.findById(id);
        if (!file) {
          throw new UserInputError('File not found');
        }
        
        // Check permissions - only uploader or admin can delete
        if (file.uploadedBy && file.uploadedBy.toString() !== user.id && user.role !== 'ADMIN') {
          throw new AuthenticationError('You do not have permission to delete this file');
        }
        
        // In a real implementation, we would delete the actual file from disk
        // fs.unlinkSync(file.filePath);
        
        const deletedFile = await models.File.findByIdAndDelete(id);
        return deletedFile;
      } catch (err) {
        console.error('Error deleting file:', err);
        throw err;
      }
    },
    
    // New batch operations
    batchCreateSamples: async (_, { inputs }, { models, user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to create samples');
      }
      
      try {
        const samples = [];
        for (const input of inputs) {
          const sample = new models.Sample({
            ...input,
            createdBy: user.id,
            createdAt: new Date()
          });
          
          if (input.recipeId) {
            const recipe = await models.MBERecipe.findById(input.recipeId);
            if (!recipe) {
              throw new UserInputError(`Recipe not found for ID: ${input.recipeId}`);
            }
            sample.recipe = input.recipeId;
          }
          
          await sample.save();
          samples.push(sample);
        }
        
        return samples;
      } catch (err) {
        console.error('Error batch creating samples:', err);
        throw err;
      }
    },
    
    batchUpdateSamples: async (_, { updates }, { models, user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to update samples');
      }
      
      try {
        const updatedSamples = [];
        
        for (const { id, input } of updates) {
          const sample = await models.Sample.findById(id);
          if (!sample) {
            throw new UserInputError(`Sample not found for ID: ${id}`);
          }
          
          // Check permissions
          if (sample.createdBy && sample.createdBy.toString() !== user.id && user.role !== 'ADMIN') {
            throw new AuthenticationError(`You do not have permission to update sample: ${id}`);
          }
          
          // Handle recipe link if recipeId is provided
          if (input.recipeId) {
            const recipe = await models.MBERecipe.findById(input.recipeId);
            if (!recipe) {
              throw new UserInputError(`Recipe not found for ID: ${input.recipeId}`);
            }
            input.recipe = input.recipeId;
            delete input.recipeId;
          }
          
          const updatedSample = await models.Sample.findByIdAndUpdate(
            id,
            input,
            { new: true }
          );
          
          updatedSamples.push(updatedSample);
        }
        
        return updatedSamples;
      } catch (err) {
        console.error('Error batch updating samples:', err);
        throw err;
      }
    },
    
    batchDeleteSamples: async (_, { ids }, { models, user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to delete samples');
      }
      
      try {
        for (const id of ids) {
          const sample = await models.Sample.findById(id);
          if (!sample) {
            throw new UserInputError(`Sample not found for ID: ${id}`);
          }
          
          // Check permissions
          if (sample.createdBy && sample.createdBy.toString() !== user.id && user.role !== 'ADMIN') {
            throw new AuthenticationError(`You do not have permission to delete sample: ${id}`);
          }
          
          // Delete associated measurements
          await models.Measurement.deleteMany({ sample: id });
          
          // Delete the sample
          await models.Sample.findByIdAndDelete(id);
        }
        
        return true;
      } catch (err) {
        console.error('Error batch deleting samples:', err);
        throw err;
      }
    },
    
    // Data analysis mutation
    analyzeMeasurementData: async (_, { id, options }, { models, user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to analyze data');
      }
      
      try {
        const measurement = await models.Measurement.findById(id);
        if (!measurement) {
          throw new UserInputError('Measurement not found');
        }
        
        // In a real implementation, this would call a data analysis service
        // For now, just return mock data
        const mockAnalysisResult = {
          id: mongoose.Types.ObjectId().toString(),
          type: options.type,
          data: {
            // Mock data based on analysis type
            ...(options.type === 'PEAK_DETECTION' && {
              peaks: [
                { position: 650, intensity: 0.85, width: 10 },
                { position: 750, intensity: 0.92, width: 8 }
              ]
            }),
            ...(options.type === 'CURVE_FITTING' && {
              equation: 'y = 0.5x^2 + 2x + 10',
              r2: 0.97,
              coefficients: [0.5, 2, 10]
            }),
            ...(options.type === 'STATISTICAL_ANALYSIS' && {
              mean: 450,
              median: 455,
              standardDeviation: 25,
              variance: 625
            }),
            ...(options.type === 'COMPARISON' && {
              similarityScore: 0.87,
              differencePoints: [
                { x: 600, y1: 0.5, y2: 0.6 },
                { x: 700, y1: 0.7, y2: 0.65 }
              ]
            })
          },
          createdAt: new Date(),
          measurement: id
        };
        
        return mockAnalysisResult;
      } catch (err) {
        console.error('Error analyzing measurement data:', err);
        throw err;
      }
    }
  }
};

module.exports = resolvers; 