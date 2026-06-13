import { getAdminClient } from '../config/supabase.js';

// Default fallback settings in case tables aren't migrated yet
const DEFAULT_SETTINGS = {
  points_per_rupee: 0.1,  // 1 Point = 10 Rupees spent
  rupee_per_point: 0.5,   // 1 Point = ₹0.5 Discount
  min_points_to_redeem: 50
};

/**
 * Get loyalty settings
 * GET /api/loyalty/settings
 */
export const getLoyaltySettings = async (req, res, next) => {
  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('LoyaltySettings')
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .maybeSingle();

    if (error) {
      console.warn('Warning: LoyaltySettings table could not be fetched (it may not be migrated yet):', error.message);
      return res.status(200).json({
        status: 'success',
        data: DEFAULT_SETTINGS
      });
    }

    return res.status(200).json({
      status: 'success',
      data: data || DEFAULT_SETTINGS
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update loyalty settings (Manager only)
 * PUT /api/loyalty/settings
 */
export const updateLoyaltySettings = async (req, res, next) => {
  try {
    const supabase = getAdminClient();
    const { points_per_rupee, rupee_per_point, min_points_to_redeem } = req.body;

    const updatePayload = {
      points_per_rupee: points_per_rupee !== undefined ? parseFloat(points_per_rupee) : DEFAULT_SETTINGS.points_per_rupee,
      rupee_per_point: rupee_per_point !== undefined ? parseFloat(rupee_per_point) : DEFAULT_SETTINGS.rupee_per_point,
      min_points_to_redeem: min_points_to_redeem !== undefined ? parseInt(min_points_to_redeem) : DEFAULT_SETTINGS.min_points_to_redeem
    };

    const { data, error } = await supabase
      .from('LoyaltySettings')
      .upsert({
        id: '00000000-0000-0000-0000-000000000001',
        ...updatePayload,
        updated_at: new Date()
      })
      .select('*')
      .single();

    if (error) {
      return res.status(400).json({
        error: 'Failed to update loyalty settings. Please ensure the LoyaltySettings table is created: ' + error.message
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Loyalty settings updated successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user's loyalty profile (Points balance and Transaction Log)
 * GET /api/loyalty/profile
 */
export const getLoyaltyProfile = async (req, res, next) => {
  try {
    const supabase = getAdminClient();
    const userId = req.user.id;

    // 1. Fetch user's loyalty record
    const { data: loyalty, error: loyaltyError } = await supabase
      .from('Loyalty')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (loyaltyError) {
      console.warn('Warning: Loyalty table could not be fetched:', loyaltyError.message);
    }

    // 2. Fetch user's loyalty transactions
    const { data: transactions, error: txError } = await supabase
      .from('LoyaltyTransactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (txError) {
      console.warn('Warning: LoyaltyTransactions table could not be fetched:', txError.message);
    }

    const currentPoints = loyalty ? loyalty.points : 0;
    const totalPointsEarned = loyalty ? loyalty.total_points_earned : 0;

    return res.status(200).json({
      status: 'success',
      data: {
        points: currentPoints,
        total_points_earned: totalPointsEarned,
        transactions: transactions || []
      }
    });
  } catch (error) {
    next(error);
  }
};
