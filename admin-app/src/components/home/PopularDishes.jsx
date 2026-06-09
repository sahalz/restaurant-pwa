import { FaStar, FaHeart, FaPlus } from 'react-icons/fa';

export const PopularDishes = () => {
  const popularDishes = [
    {
      id: 1,
      name: 'Grilled Salmon',
      image: '🐟',
      price: 18.99,
      rating: 4.9,
      reviews: 234,
      category: 'Seafood',
    },
    {
      id: 2,
      name: 'Beef Steak',
      image: '🥩',
      price: 22.99,
      rating: 4.8,
      reviews: 189,
      category: 'Steakhouse',
    },
    {
      id: 3,
      name: 'Chicken Tikka',
      image: '🍗',
      price: 14.99,
      rating: 4.7,
      reviews: 312,
      category: 'Indian',
    },
    {
      id: 4,
      name: 'Vegetable Stir Fry',
      image: '🥗',
      price: 11.99,
      rating: 4.6,
      reviews: 156,
      category: 'Healthy',
    },
  ];

  return (
    <section className="popular-dishes">
      <div className="container">
        <h2 className="section-title">Popular Dishes</h2>
        <div className="dishes-grid">
          {popularDishes.map((dish) => (
            <div key={dish.id} className="dish-card">
              <div className="dish-image">
                <span>{dish.image}</span>
                <button className="dish-wishlist">
                  <FaHeart />
                </button>
              </div>
              <div className="dish-info">
                <span className="dish-category">{dish.category}</span>
                <h3>{dish.name}</h3>
                <div className="dish-rating">
                  <FaStar />
                  <span>{dish.rating}</span>
                  <span className="dish-reviews">({dish.reviews} reviews)</span>
                </div>
                <div className="dish-footer">
                  <span className="dish-price">${dish.price}</span>
                  <button className="dish-add-btn">
                    <FaPlus /> Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
