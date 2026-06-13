import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { menuAPI } from '../../services/api';
import { FaStar, FaClock, FaPlus, FaCheck } from 'react-icons/fa';
import { getItemEmoji } from '../../utils/emojiHelper';

export const FeaturedFoods = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedItems, setAddedItems] = useState({});
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await menuAPI.getMenu();
        if (res.data && res.data.status === 'success') {
          // Take first 4 items as featured
          setItems(res.data.data.slice(0, 4));
        }
      } catch (err) {
        console.error('Error fetching featured foods:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleAdd = (item) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: parseFloat(item.price),
      image_url: item.image_url,
      category_id: item.category_id
    });
    setAddedItems(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [item.id]: false }));
    }, 1500);
  };

  const getFallbackItems = () => [
    {
      id: 'e4c7d8a9-2bf3-47a2-9f3a-7f6d1c2a0b89',
      name: 'Margherita Pizza',
      price: 12.99,
      rating: 4.8,
      deliveryTime: '25-30 min',
      restaurant: 'Pizza Heaven',
    },
    {
      id: 'f5d8e9b0-3cg4-58b3-0g4b-8g7e2d3b1c91',
      name: 'Classic Cheeseburger',
      price: 9.99,
      rating: 4.9,
      deliveryTime: '30-35 min',
      restaurant: 'Burger Palace',
    },
    {
      id: 'g6e9f0a1-4dh5-69c4-1h5c-9h8f3e4c2d01',
      name: 'Iced Americano',
      price: 3.49,
      rating: 4.7,
      deliveryTime: '15-20 min',
      restaurant: 'Drinks & Co',
    },
    {
      id: 'h7f0a1b2-5ei6-7ad5-2i6d-0i9g4f5d3e12',
      name: 'Chocolate Lava Cake',
      price: 5.99,
      rating: 4.6,
      deliveryTime: '20-25 min',
      restaurant: 'Sweet Dreams',
    },
  ];

  const displayItems = items.length > 0 ? items.map((item, idx) => ({
    ...item,
    rating: (4.5 + (idx * 0.1)).toFixed(1),
    deliveryTime: `${20 + (idx * 5)}-${25 + (idx * 5)} min`,
    restaurant: 'DirectDine Kitchen'
  })) : getFallbackItems();

  return (
    <section className="featured-foods">
      <div className="container">
        <h2 className="section-title">Featured Foods</h2>
        {loading && items.length === 0 ? (
          <div className="foods-loading" style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '1.1rem' }}>
            Loading delicious options...
          </div>
        ) : (
          <div className="foods-grid">
            {displayItems.map((item) => (
              <div key={item.id} className="food-card">
                <div className="food-image" style={{ fontSize: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '140px', background: '#f8fafc' }}>
                  {getItemEmoji(item.name, null, item.image_url, '🍔')}
                </div>
                <div className="food-info">
                  <div className="food-header">
                    <h3>{item.name}</h3>
                    <div className="food-rating">
                      <FaStar />
                      <span>{item.rating}</span>
                    </div>
                  </div>
                  <p className="food-restaurant">{item.restaurant}</p>
                  <div className="food-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                    <div className="food-delivery">
                      <FaClock />
                      <span>{item.deliveryTime}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="food-price" style={{ fontWeight: '700', color: '#667eea' }}>₹{parseFloat(item.price).toFixed(2)}</span>
                      <button 
                        onClick={() => handleAdd(item)}
                        style={{
                          background: addedItems[item.id] ? '#16a34a' : '#667eea',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        title="Add to cart"
                      >
                        {addedItems[item.id] ? <FaCheck size={12} /> : <FaPlus size={12} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
