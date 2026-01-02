/**
 * MongoDB Client Configuration
 *
 * This file sets up the MongoDB client for database operations.
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a MongoDB instance in Railway
 * 2. Go to your MongoDB connection panel to get the connection string
 * 3. Add the following environment variables to Railway:
 *    - MONGO_URL (full connection string)
 *    - DATABASE_URL (alternative connection string)
 */

import { MongoClient, Db, Collection, ObjectId } from 'mongodb';

// Environment variables (set in Railway dashboard)
const mongoUrl = import.meta.env.VITE_MONGO_URL || import.meta.env.VITE_DATABASE_URL;

let client: MongoClient | null = null;
let db: Db | null = null;

// Collection name
export const CUSTOM_PAGES_COLLECTION = 'custom_pages';

// Interface for custom page document
export interface CustomPageDocument {
  _id?: ObjectId;
  created_at: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  tags: string[];
  blocks: CustomPageBlock[];
  published: boolean;
}

export interface CustomPageBlock {
  id: string;
  type: 'code' | 'notes' | 'mermaid';
  content: string;
  language?: string;
  title?: string;
}

// Connect to MongoDB
export const connectToDatabase = async (): Promise<Db> => {
  if (db) return db;

  if (!mongoUrl) {
    throw new Error('MongoDB URL not configured');
  }

  client = new MongoClient(mongoUrl);
  await client.connect();
  db = client.db(); // Uses default database from connection string

  return db;
};

// Get collection helper
export const getCollection = async <T extends Document>(name: string): Promise<Collection<T>> => {
  const database = await connectToDatabase();
  return database.collection<T>(name);
};

// Close connection
export const closeConnection = async (): Promise<void> => {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
};

// Configuration check
export const isConfigured = (): boolean => !!mongoUrl;

// Helper functions for custom pages
export const customPagesApi = {
  /**
   * Get all published custom pages
   */
  getAll: async () => {
    try {
      if (!isConfigured()) {
        console.warn('MongoDB client not configured');
        return { data: null, error: 'MongoDB not configured' };
      }

      const collection = await getCollection<CustomPageDocument>(CUSTOM_PAGES_COLLECTION);
      const pages = await collection
        .find({ published: true })
        .sort({ created_at: -1 })
        .toArray();

      return { data: pages, error: null };
    } catch (error) {
      console.error('Error fetching custom pages:', error);
      return { data: null, error: (error as Error).message };
    }
  },

  /**
   * Get a single custom page by slug
   */
  getBySlug: async (slug: string) => {
    try {
      if (!isConfigured()) {
        console.warn('MongoDB client not configured');
        return { data: null, error: 'MongoDB not configured' };
      }

      const collection = await getCollection<CustomPageDocument>(CUSTOM_PAGES_COLLECTION);
      const page = await collection.findOne({ slug, published: true });

      return { data: page, error: null };
    } catch (error) {
      console.error('Error fetching custom page by slug:', error);
      return { data: null, error: (error as Error).message };
    }
  },

  /**
   * Get a single custom page by ID
   */
  getById: async (id: string) => {
    try {
      if (!isConfigured()) {
        console.warn('MongoDB client not configured');
        return { data: null, error: 'MongoDB not configured' };
      }

      const collection = await getCollection<CustomPageDocument>(CUSTOM_PAGES_COLLECTION);
      const objectId = new ObjectId(id);
      const page = await collection.findOne({ _id: objectId });

      return { data: page, error: null };
    } catch (error) {
      console.error('Error fetching custom page by id:', error);
      return { data: null, error: (error as Error).message };
    }
  },

  /**
   * Create a new custom page
   */
  create: async (page: Omit<CustomPageDocument, '_id' | 'created_at'>) => {
    try {
      if (!isConfigured()) {
        console.warn('MongoDB client not configured');
        return { data: null, error: 'MongoDB not configured' };
      }

      const collection = await getCollection<CustomPageDocument>(CUSTOM_PAGES_COLLECTION);
      const now = new Date().toISOString();

      const newPage = {
        ...page,
        created_at: now,
      };

      const result = await collection.insertOne(newPage as CustomPageDocument);
      return { data: { ...newPage, _id: result.insertedId }, error: null };
    } catch (error) {
      console.error('Error creating custom page:', error);
      return { data: null, error: (error as Error).message };
    }
  },

  /**
   * Update an existing custom page
   */
  update: async (id: string, updates: Partial<CustomPageDocument>) => {
    try {
      if (!isConfigured()) {
        console.warn('MongoDB client not configured');
        return { data: null, error: 'MongoDB not configured' };
      }

      const collection = await getCollection<CustomPageDocument>(CUSTOM_PAGES_COLLECTION);
      const objectId = new ObjectId(id);

      const result = await collection.findOneAndUpdate(
        { _id: objectId },
        { $set: updates },
        { returnDocument: 'after' }
      );

      return { data: result, error: null };
    } catch (error) {
      console.error('Error updating custom page:', error);
      return { data: null, error: (error as Error).message };
    }
  },

  /**
   * Delete a custom page
   */
  delete: async (id: string) => {
    try {
      if (!isConfigured()) {
        console.warn('MongoDB client not configured');
        return { data: null, error: 'MongoDB not configured' };
      }

      const collection = await getCollection<CustomPageDocument>(CUSTOM_PAGES_COLLECTION);
      const objectId = new ObjectId(id);

      await collection.deleteOne({ _id: objectId });
      return { data: true, error: null };
    } catch (error) {
      console.error('Error deleting custom page:', error);
      return { data: null, error: (error as Error).message };
    }
  },
};

// Export configuration check
export const isMongoConfigured = () => isConfigured();
