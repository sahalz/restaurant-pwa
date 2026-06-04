import { FaStar, FaClock, FaMotorcycle } from 'react-icons/fa';

export const FeaturedFoods = () => {
  const featuredItems = [
    {
      id: 1,
      name: 'Classic Cheeseburger',
      image: '🍔',
      price: 12.99,
      rating: 4.8,
      deliveryTime: '25-30 min',
      restaurant: 'Burger Palace',
    },
    {
      id: 2,
      name: 'Margherita Pizza',
      image: '🍕',
      price: 15.99,
      rating: 4.9,
      deliveryTime: '30-35 min',
      restaurant: 'Pizza Heaven',
    },
    {
      id: 3,
      name: 'Sushi Platter',
      image: '🍣',
      price: 24.99,
      rating: 4.7,
      deliveryTime: '35-40 min',
      restaurant: 'Sushi Master',
    },
    {
      id: 4,
      name: 'Pad Thai',
      image: '🍜',
      price: 13.99,
      rating: 4.6,
      deliveryTime: '20-25 min',
      restaurant: 'Thai Kitchen',
    },
  ];

  return (
    <section className="featured-foods">
      <div className="container">
        <h2 className="section-title">Featured Foods</h2>
        <div className="foods-grid">
          {featuredItems.map((item) => (
            <div key={item.id} className="food-card">
              <div className="food-image">{item.image}</div>
              <div className="food-info">
                <div className="food-header">
                  <h3>{item.name}</h3>
                  <div className="food-rating">
                    <FaStar />
                    <span>{item.rating}</span>
                  </div>
                </div>
                <p className="food-restaurant">{item.restaurant}</p>
                <div className="food-footer">
                  <div className="food-delivery">
                    <FaClock />
                    <span>{item.deliveryTime}</span>
                  </div>
                  <span className="food-price">${item.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
