import { useState, useEffect } from 'react';
import { FaTag, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { offersAPI } from '../../services/api';

export const Offers = () => {
  const [offers, setOffers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    offersAPI.getOffers()
      .then(res => setOffers(res.data.data || []))
      .catch((err) => console.error('Error fetching offers:', err));
  }, []);

  if (offers.length === 0) {
    return null; // Hide the section if no offers are active
  }

  const getOfferConfig = (offer) => {
    const bgColors = {
      flat: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      percentage: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      combo: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    };

    let title = '';
    let description = '';
    let badge = '';

    if (offer.offer_type === 'flat') {
      title = `₹${offer.flat_discount} OFF`;
      description = `Spend ₹${offer.min_spend} or more`;
      badge = 'Flat Discount';
    } else if (offer.offer_type === 'percentage') {
      title = `${offer.discount_percent}% OFF`;
      description = offer.category_condition 
        ? `On ${offer.category_condition}` 
        : 'On all items';
      badge = 'Percentage Off';
    } else if (offer.offer_type === 'combo') {
      title = 'COMBO DEAL';
      description = `${offer.name} for ₹${offer.offer_price} (MRP ₹${offer.original_price})`;
      badge = 'Combo Pack';
    }

    return {
      bgColor: bgColors[offer.offer_type] || bgColors.flat,
      title,
      description,
      badge,
    };
  };

  const handleOfferClick = (offer) => {
    if (offer.offer_type === 'percentage' && offer.category_condition) {
      navigate('/menu', { state: { selectCategoryName: offer.category_condition } });
    } else {
      navigate('/menu');
    }
  };

  return (
    <section className="offers">
      <div className="container">
        <h2 className="section-title">Special Offers</h2>
        <div className="offers-grid">
          {offers.map((offer) => {
            const config = getOfferConfig(offer);
            return (
              <div 
                key={offer.id} 
                className="offer-card" 
                style={{ background: config.bgColor, cursor: 'pointer' }}
                onClick={() => handleOfferClick(offer)}
              >
                <div className="offer-content">
                  <div className="offer-icon">
                    <FaTag />
                  </div>
                  <h3>{config.title}</h3>
                  <p>{config.description}</p>
                  <div className="offer-code" style={{ display: 'inline-block' }}>
                    <span>{config.badge}</span>
                  </div>
                  {offer.valid_days?.length > 0 && (
                    <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '8px', fontWeight: 600 }}>
                      Valid: {offer.valid_days.map(d => d.slice(0,3)).join(' · ')}
                    </div>
                  )}
                </div>
                <button 
                  className="offer-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOfferClick(offer);
                  }}
                >
                  <FaArrowRight />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
