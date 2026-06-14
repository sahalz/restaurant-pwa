import { supabase } from '../config/supabase.js';

/**
 * List all categories
 * GET /api/categories
 */
export const getCategories = async (req, res, next) => {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;

    return res.status(200).json({
      status: 'success',
      data: categories || []
    });
  } catch (error) {
    console.error('Fetch categories error:', error);
    next(error);
  }
};

/**
 * Get category by ID
 * GET /api/categories/:id
 */
export const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: category, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    return res.status(200).json({
      status: 'success',
      data: category
    });
  } catch (error) {
    console.error('Get category error:', error);
    next(error);
  }
};

/**
 * Create a new category
 * POST /api/categories
 * Requires: admin role
 */
export const createCategory = async (req, res, next) => {
  try {
    if (!['admin', 'manager', 'staff'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Staff privileges required.' });
    }

    const { name } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const { data: newCategory, error } = await supabase
      .from('categories')
      .insert({ name: name.trim() })
      .select('*')
      .single();

    if (error) {
      // Check for unique constraint violation (PostgreSQL code 23505)
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Category name already exists' });
      }
      throw error;
    }

    return res.status(201).json({
      status: 'success',
      message: 'Category created successfully',
      data: newCategory
    });
  } catch (error) {
    console.error('Create category error:', error);
    next(error);
  }
};

/**
 * Update an existing category
 * PUT /api/categories/:id
 * Requires: admin role
 */
export const updateCategory = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    }

    const { id } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Category name is required' });
    }

    // Check if category exists first
    const { data: category, error: findError } = await supabase
      .from('categories')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (findError) throw findError;
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const { data: updatedCategory, error } = await supabase
      .from('categories')
      .update({ name: name.trim() })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Category name already exists' });
      }
      throw error;
    }

    return res.status(200).json({
      status: 'success',
      message: 'Category updated successfully',
      data: updatedCategory
    });
  } catch (error) {
    console.error('Update category error:', error);
    next(error);
  }
};

/**
 * Delete a category
 * DELETE /api/categories/:id
 * Requires: admin role
 */
export const deleteCategory = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    }

    const { id } = req.params;

    // Check if category exists
    const { data: category, error: findError } = await supabase
      .from('categories')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (findError) throw findError;
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return res.status(200).json({
      status: 'success',
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    next(error);
  }
};
