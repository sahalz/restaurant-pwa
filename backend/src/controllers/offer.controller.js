import { supabase } from '../config/supabase.js';

/**
 * Helper: check if offer is valid for today
 */
const isOfferValidToday = (offer) => {
  // Check expiry
  if (offer.valid_until) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(offer.valid_until);
    expiry.setHours(0, 0, 0, 0);
    if (today > expiry) return false;
  }
  // Check valid_days
  if (offer.valid_days && Array.isArray(offer.valid_days) && offer.valid_days.length > 0) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayName = days[new Date().getDay()];
    if (!offer.valid_days.includes(todayName)) return false;
  }
  return true;
};

/**
 * GET /api/offers
 * Returns all active offers that are valid today (public)
 */
export const getOffers = async (req, res, next) => {
  try {
    const showAll = req.query.all === 'true'; // managers pass ?all=true to see inactive
    let query = supabase
      .from('offers')
      .select('*')
      .order('created_at', { ascending: false });

    if (!showAll) {
      query = query.eq('is_active', true);
    }

    const { data: offers, error } = await query;

    if (error) {
      // Table doesn't exist yet
      if (error.code === 'PGRST116' || error.code === '42P01') {
        return res.status(200).json({ status: 'success', data: [] });
      }
      throw error;
    }

    const today = !showAll
      ? (offers || []).filter(isOfferValidToday)
      : (offers || []);

    return res.status(200).json({ status: 'success', data: today });
  } catch (error) {
    console.error('Get offers error:', error);
    next(error);
  }
};

/**
 * POST /api/offers
 * Manager: Create a new offer
 */
export const createOffer = async (req, res, next) => {
  try {
    const {
      name, offer_type, is_active = true,
      valid_until, valid_days,
      discount_percent, category_condition, category_id,
      min_spend, flat_discount,
      combo_items, original_price, offer_price
    } = req.body;

    if (!name || !offer_type) {
      return res.status(400).json({ error: 'name and offer_type are required' });
    }
    if (!['combo', 'percentage', 'flat'].includes(offer_type)) {
      return res.status(400).json({ error: 'offer_type must be combo, percentage, or flat' });
    }

    const payload = {
      name: name.trim(),
      offer_type,
      is_active,
      valid_until: valid_until || null,
      valid_days: valid_days || null,
      discount_percent: discount_percent ? parseFloat(discount_percent) : null,
      category_condition: category_condition || null,
      category_id: category_id || null,
      min_spend: min_spend ? parseFloat(min_spend) : null,
      flat_discount: flat_discount ? parseFloat(flat_discount) : null,
      combo_items: combo_items || null,
      original_price: original_price ? parseFloat(original_price) : null,
      offer_price: offer_price ? parseFloat(offer_price) : null,
      updated_at: new Date()
    };

    const { data: newOffer, error } = await supabase
      .from('offers')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      if (error.code === 'PGRST116' || error.code === '42P01') {
        return res.status(503).json({ error: 'Offers table not found. Please run the offers_and_ratings.sql migration.' });
      }
      throw error;
    }

    return res.status(201).json({ status: 'success', message: 'Offer created', data: newOffer });
  } catch (error) {
    console.error('Create offer error:', error);
    next(error);
  }
};

/**
 * PUT /api/offers/:id
 * Manager: Update an offer
 */
export const updateOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name, offer_type, is_active, valid_until, valid_days,
      discount_percent, category_condition, category_id,
      min_spend, flat_discount,
      combo_items, original_price, offer_price
    } = req.body;

    const updateData = { updated_at: new Date() };
    if (name !== undefined) updateData.name = name.trim();
    if (offer_type !== undefined) updateData.offer_type = offer_type;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (valid_until !== undefined) updateData.valid_until = valid_until || null;
    if (valid_days !== undefined) updateData.valid_days = valid_days || null;
    if (discount_percent !== undefined) updateData.discount_percent = discount_percent ? parseFloat(discount_percent) : null;
    if (category_condition !== undefined) updateData.category_condition = category_condition || null;
    if (category_id !== undefined) updateData.category_id = category_id || null;
    if (min_spend !== undefined) updateData.min_spend = min_spend ? parseFloat(min_spend) : null;
    if (flat_discount !== undefined) updateData.flat_discount = flat_discount ? parseFloat(flat_discount) : null;
    if (combo_items !== undefined) updateData.combo_items = combo_items || null;
    if (original_price !== undefined) updateData.original_price = original_price ? parseFloat(original_price) : null;
    if (offer_price !== undefined) updateData.offer_price = offer_price ? parseFloat(offer_price) : null;

    const { data: updated, error } = await supabase
      .from('offers')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) throw error;
    if (!updated) return res.status(404).json({ error: 'Offer not found' });

    return res.status(200).json({ status: 'success', message: 'Offer updated', data: updated });
  } catch (error) {
    console.error('Update offer error:', error);
    next(error);
  }
};

/**
 * PATCH /api/offers/:id/status
 * Manager: Toggle offer active status
 */
export const toggleOfferStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({ error: 'is_active (boolean) is required' });
    }

    const { data: updated, error } = await supabase
      .from('offers')
      .update({ is_active, updated_at: new Date() })
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) throw error;
    if (!updated) return res.status(404).json({ error: 'Offer not found' });

    return res.status(200).json({
      status: 'success',
      message: `Offer ${is_active ? 'activated' : 'deactivated'}`,
      data: updated
    });
  } catch (error) {
    console.error('Toggle offer status error:', error);
    next(error);
  }
};

/**
 * DELETE /api/offers/:id
 * Manager: Delete an offer
 */
export const deleteOffer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: existing, error: findError } = await supabase
      .from('offers')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (findError) throw findError;
    if (!existing) return res.status(404).json({ error: 'Offer not found' });

    const { error } = await supabase.from('offers').delete().eq('id', id);
    if (error) throw error;

    return res.status(200).json({ status: 'success', message: 'Offer deleted' });
  } catch (error) {
    console.error('Delete offer error:', error);
    next(error);
  }
};

/**
 * POST /api/offers/calculate
 * Given cart total + cart items, returns best applicable offer discount
 * Body: { cart_total, cart_items: [{menu_item_id, category_id, price, quantity}] }
 */
export const calculateOfferDiscount = async (req, res, next) => {
  try {
    const { cart_total, cart_items = [] } = req.body;

    if (!cart_total) {
      return res.status(200).json({ status: 'success', data: { discount: 0, offer: null } });
    }

    const { data: offers, error } = await supabase
      .from('offers')
      .select('*')
      .eq('is_active', true);

    if (error) {
      if (error.code === 'PGRST116' || error.code === '42P01') {
        return res.status(200).json({ status: 'success', data: { discount: 0, offer: null } });
      }
      throw error;
    }

    const validOffers = (offers || []).filter(isOfferValidToday);
    const cartTotal = parseFloat(cart_total);

    let bestDiscount = 0;
    let bestOffer = null;

    for (const offer of validOffers) {
      if (offer.offer_type === 'flat' && offer.min_spend && offer.flat_discount) {
        if (cartTotal >= parseFloat(offer.min_spend)) {
          const disc = parseFloat(offer.flat_discount);
          if (disc > bestDiscount) {
            bestDiscount = disc;
            bestOffer = offer;
          }
        }
      } else if (offer.offer_type === 'percentage' && offer.discount_percent) {
        // Apply to matching category items only
        let applicableTotal = 0;
        if (offer.category_id) {
          applicableTotal = cart_items
            .filter(item => item.category_id === offer.category_id)
            .reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
        } else {
          applicableTotal = cartTotal;
        }
        const disc = (applicableTotal * parseFloat(offer.discount_percent)) / 100;
        if (disc > bestDiscount) {
          bestDiscount = disc;
          bestOffer = offer;
        }
      }
      // Combo offers don't produce checkout discount — they're priced items themselves
    }

    bestDiscount = Math.min(bestDiscount, cartTotal);

    return res.status(200).json({
      status: 'success',
      data: {
        discount: parseFloat(bestDiscount.toFixed(2)),
        offer: bestOffer ? { id: bestOffer.id, name: bestOffer.name, offer_type: bestOffer.offer_type } : null
      }
    });
  } catch (error) {
    console.error('Calculate offer discount error:', error);
    next(error);
  }
};
