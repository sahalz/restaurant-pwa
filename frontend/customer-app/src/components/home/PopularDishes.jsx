import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { menuAPI } from '../../services/api';
import { FaStar, FaHeart, FaPlus, FaCheck } from 'react-icons/fa';
import { getItemEmoji } from '../../utils/emojiHelper';

export const PopularDishes = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedItems, setAddedItems] = useState({});
  const [likedItems, setLikedItems] = useState({});
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const res = await menuAPI.getMenu();
        if (res.data && res.data.status === 'success') {
          // Take next 4 items as popular (skipping first one or reversing)
          const fetchedItems = res.data.data;
          if (fetchedItems.length > 1) {
            setItems(fetchedItems.slice(1, 5));
          } else {
            setItems(fetchedItems);
          }
        }
      } catch (err) {
        console.error('Error fetching popular dishes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPopular();
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

  const toggleLike = (id) => {
    setLikedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getFallbackDishes = () => [
    {
      id: 'e4c7d8a9-2bf3-47a2-9f3a-7f6d1c2a0b90',
      name: 'Pepperoni Pizza',
      price: 14.99,
      rating: 4.9,
      reviews: 234,
      category: 'Pizzas',
    },
    {
      id: 'f5d8e9b0-3cg4-58b3-0g4b-8g7e2d3b1c90',
      name: 'Veg Burger',
      price: 8.49,
      rating: 4.8,
      reviews: 189,
      category: 'Burgers',
    },
    {
      id: 'g6e9f0a1-4dh5-69c4-1h5c-9h8f3e4c2d02',
      name: 'Fresh Lemonade',
      price: 2.99,
      rating: 4.7,
      reviews: 312,
      category: 'Drinks',
    },
    {
      id: 'h7f0a1b2-5ei6-7ad5-2i6d-0i9g4f5d3e13',
      name: 'New York Cheesecake',
      price: 6.49,
      rating: 4.6,
      reviews: 156,
      category: 'Desserts',
    },
  ];

  const displayDishes = items.length > 0 ? items.map((item, idx) => ({
    ...item,
    rating: (4.6 + (idx * 0.1)).toFixed(1),
    reviews: 120 + (idx * 45),
    category: idx % 2 === 0 ? 'Fresh Selection' : 'Chef Special'
  })) : getFallbackDishes();

  return (
    <section className="popular-dishes">
      <div className="container">
        <h2 className="section-title">Popular Dishes</h2>
        {loading && items.length === 0 ? (
          <div className="dishes-loading" style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '1.1rem' }}>
            Loading popular dishes...
          </div>
        ) : (
          <div className="dishes-grid">
            {displayDishes.map((dish) => (
              <div key={dish.id} className="dish-card">
                <div className="dish-image" style={{ fontSize: '3.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '140px', background: '#f8fafc', position: 'relative' }}>
                  <span>{getItemEmoji(dish.name, null, dish.image_url, '🍔')}</span>
                  <button 
                    className="dish-wishlist" 
                    onClick={() => toggleLike(dish.id)}
                    style={{ color: likedItems[dish.id] ? '#ef4444' : '#94a3b8' }}
                  >
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
                    <span className="dish-price">${parseFloat(dish.price).toFixed(2)}</span>
                    <button 
                      className="dish-add-btn" 
                      onClick={() => handleAdd(dish)}
                      style={{
                        backgroundColor: addedItems[dish.id] ? '#16a34a' : '#667eea',
                        borderColor: addedItems[dish.id] ? '#16a34a' : '#667eea',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      {addedItems[dish.id] ? (
                        <>
                          <FaCheck /> Added
                        </>
                      ) : (
                        <>
                          <FaPlus /> Add
                        </>
                      )}
                    </button>
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
