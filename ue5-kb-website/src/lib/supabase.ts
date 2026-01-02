/**
 * Supabase Client Configuration
 *
 * This file sets up the Supabase client for database operations.
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a Supabase project at https://supabase.com
 * 2. Go to Settings > API to get your project URL and anon key
 * 3. Add the following environment variables to Railway:
 *    - VITE_SUPABASE_URL
 *    - VITE_SUPABASE_ANON_KEY
 * 4. Run the SQL schema in your Supabase SQL editor (see DATABASE_SCHEMA.sql)
 */

import { createClient } from '@supabase/supabase-js';

// Environment variables (set in Railway dashboard)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create client only if credentials are available
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Type definitions for your database tables
export interface Database {
  public: {
    Tables: {
      custom_pages: {
        Row: {
          id: string;
          created_at: string;
          title: string;
          slug: string;
          summary: string;
          category: string;
          tags: string[];
          blocks: CustomPageBlock[];
          published: boolean;
        };
        Insert: Omit<Database['public']['Tables']['custom_pages']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['custom_pages']['Insert']>;
      };
    };
  };
}

export interface CustomPageBlock {
  id: string;
  type: 'code' | 'notes' | 'mermaid';
  content: string;
  language?: string;
  title?: string;
}

// Helper functions for custom pages
export const customPagesApi = {
  /**
   * Get all published custom pages
   */
  getAll: async () => {
    if (!supabase) {
      console.warn('Supabase client not configured');
      return { data: null, error: 'Supabase not configured' };
    }

    return await supabase
      .from('custom_pages')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });
  },

  /**
   * Get a single custom page by slug
   */
  getBySlug: async (slug: string) => {
    if (!supabase) {
      console.warn('Supabase client not configured');
      return { data: null, error: 'Supabase not configured' };
    }

    return await supabase
      .from('custom_pages')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single();
  },

  /**
   * Create a new custom page
   */
  create: async (page: Omit<Database['public']['Tables']['custom_pages']['Insert'], 'id' | 'created_at'>) => {
    if (!supabase) {
      console.warn('Supabase client not configured');
      return { data: null, error: 'Supabase not configured' };
    }

    return await supabase
      .from('custom_pages')
      .insert(page)
      .select()
      .single();
  },

  /**
   * Update an existing custom page
   */
  update: async (id: string, updates: Partial<Database['public']['Tables']['custom_pages']['Insert']>) => {
    if (!supabase) {
      console.warn('Supabase client not configured');
      return { data: null, error: 'Supabase not configured' };
    }

    return await supabase
      .from('custom_pages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
  },

  /**
   * Delete a custom page
   */
  delete: async (id: string) => {
    if (!supabase) {
      console.warn('Supabase client not configured');
      return { data: null, error: 'Supabase not configured' };
    }

    return await supabase
      .from('custom_pages')
      .delete()
      .eq('id', id);
  },
};

// Export configuration check
export const isConfigured = () => supabase !== null;
