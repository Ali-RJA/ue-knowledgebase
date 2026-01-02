import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId, Db } from 'mongodb';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URL || process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'ue-knowledgebase';

let db: Db;

async function connectToMongo() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log('Connected to MongoDB');

    // Create indexes
    await db.collection('custom-pages').createIndex({ slug: 1 }, { unique: true });
    await db.collection('custom-pages').createIndex({ published: 1 });
    await db.collection('custom-pages').createIndex({ tags: 1 });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API Routes

// Get all custom pages (published only by default)
app.get('/api/custom-pages', async (req, res) => {
  try {
    const includeUnpublished = req.query.all === 'true';
    const query = includeUnpublished ? {} : { published: true };

    const pages = await db.collection('custom-pages')
      .find(query)
      .project({ blocks: 0 }) // Exclude blocks for list view
      .sort({ createdAt: -1 })
      .toArray();

    // Transform MongoDB _id to id
    const transformedPages = pages.map(page => ({
      ...page,
      id: page._id.toString(),
      _id: undefined,
    }));

    res.json(transformedPages);
  } catch (error) {
    console.error('Error fetching custom pages:', error);
    res.status(500).json({ message: 'Failed to fetch pages' });
  }
});

// Get a single custom page by slug
app.get('/api/custom-pages/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const page = await db.collection('custom-pages').findOne({ slug });

    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    // Transform MongoDB _id to id
    const transformedPage = {
      ...page,
      id: page._id.toString(),
      _id: undefined,
    };

    res.json(transformedPage);
  } catch (error) {
    console.error('Error fetching custom page:', error);
    res.status(500).json({ message: 'Failed to fetch page' });
  }
});

// Create a new custom page
app.post('/api/custom-pages', async (req, res) => {
  try {
    const { title, slug, summary, category, tags, blocks, published } = req.body;

    // Validate required fields
    if (!title || !slug || !blocks || blocks.length === 0) {
      return res.status(400).json({
        message: 'Missing required fields: title, slug, and blocks are required'
      });
    }

    // Check if slug already exists
    const existingPage = await db.collection('custom-pages').findOne({ slug });
    if (existingPage) {
      return res.status(409).json({ message: 'A page with this slug already exists' });
    }

    const now = new Date().toISOString();
    const pageData = {
      title,
      slug,
      summary: summary || '',
      category: category || 'custom',
      tags: tags || [],
      blocks,
      type: 'custom-page',
      published: published !== false,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection('custom-pages').insertOne(pageData);

    res.status(201).json({
      ...pageData,
      id: result.insertedId.toString(),
    });
  } catch (error) {
    console.error('Error creating custom page:', error);
    res.status(500).json({ message: 'Failed to create page' });
  }
});

// Update an existing custom page
app.put('/api/custom-pages/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, summary, category, tags, blocks, published, newSlug } = req.body;

    const existingPage = await db.collection('custom-pages').findOne({ slug });
    if (!existingPage) {
      return res.status(404).json({ message: 'Page not found' });
    }

    // If slug is being changed, check if new slug exists
    if (newSlug && newSlug !== slug) {
      const slugExists = await db.collection('custom-pages').findOne({ slug: newSlug });
      if (slugExists) {
        return res.status(409).json({ message: 'A page with this slug already exists' });
      }
    }

    const updateData = {
      ...(title && { title }),
      ...(summary !== undefined && { summary }),
      ...(category && { category }),
      ...(tags && { tags }),
      ...(blocks && { blocks }),
      ...(published !== undefined && { published }),
      ...(newSlug && { slug: newSlug }),
      updatedAt: new Date().toISOString(),
    };

    await db.collection('custom-pages').updateOne(
      { slug },
      { $set: updateData }
    );

    const updatedPage = await db.collection('custom-pages').findOne({
      slug: newSlug || slug
    });

    res.json({
      ...updatedPage,
      id: updatedPage!._id.toString(),
      _id: undefined,
    });
  } catch (error) {
    console.error('Error updating custom page:', error);
    res.status(500).json({ message: 'Failed to update page' });
  }
});

// Delete a custom page
app.delete('/api/custom-pages/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await db.collection('custom-pages').deleteOne({ slug });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Page not found' });
    }

    res.json({ message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Error deleting custom page:', error);
    res.status(500).json({ message: 'Failed to delete page' });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));

  // Handle SPA routing - return index.html for all non-API routes
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, '../dist/index.html'));
    }
  });
}

// Start server
async function start() {
  await connectToMongo();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();
