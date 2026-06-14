import { FaStar, FaHeart, FaPlus } from 'react-icons/fa';
import './FoodCard.css';

export const FoodCard = ({ food, onAddToCart }) => {
  const isUrl = food.image_url && (food.image_url.startsWith('http') || food.image_url.startsWith('/') || food.image_url.startsWith('data:'));

  return (
    <div className={`food-card ${!food.availability ? 'out-of-stock' : ''}`}>
      <div className="food-card-image" style={{ padding: isUrl ? '0px' : '20px' }}>
        {isUrl ? (
          <img 
            src={food.image_url} 
            alt={food.name} 
            className="food-img" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span className="food-emoji">{food.image_url || food.image || '🍽️'}</span>
        )}
        
        {!food.availability && (
          <div className="out-of-stock-badge">
            Out of Stock
          </div>
        )}

        <button className="wishlist-btn" aria-label="Add to wishlist">
          <FaHeart />
        </button>
      </div>
      <div className="food-card-content">
        <span className="food-category">{food.category}</span>
        <h3 className="food-name">{food.name}</h3>
        <p className="food-description">{food.description}</p>
        <div className="food-rating">
          <FaStar className="star-icon" />
          <span className="rating-value">{food.rating}</span>
          <span className="review-count">({food.reviews} reviews)</span>
        </div>
        <div className="food-card-footer">
          <div className="food-price">₹{food.price}</div>
          <button 
            className="add-to-cart-btn"
            onClick={() => onAddToCart(food)}
            disabled={!food.availability}
          >
            {food.availability ? (
              <>
                <FaPlus /> Add
              </>
            ) : (
              'Out of Stock'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
