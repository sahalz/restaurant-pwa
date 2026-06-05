import { FaStar, FaHeart, FaPlus } from 'react-icons/fa';

export const FoodCard = ({ food, onAddToCart }) => {
  return (
    <div className="food-card">
      <div className="food-card-image">
        <span className="food-emoji">{food.image_url || food.image}</span>
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
          <div className="food-price">${food.price}</div>
          <button 
            className="add-to-cart-btn"
            onClick={() => onAddToCart(food)}
            disabled={!food.availability}
          >
            <FaPlus /> Add
          </button>
        </div>
      </div>
    </div>
  );
};
