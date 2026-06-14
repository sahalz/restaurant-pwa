import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { menuAPI } from '../../services/api';
import { FoodCard } from '../menu';

export const PopularDishes = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const res = await menuAPI.getPopular();
        if (res.data && res.data.status === 'success') {
          // Take top 3 popular dishes
          setItems(res.data.data.slice(0, 3));
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
  };

  const getFallbackDishes = () => [
    {
      id: 'e4c7d8a9-2bf3-47a2-9f3a-7f6d1c2a0b90',
      name: 'Pepperoni Pizza',
      price: 14.99,
      rating: 4.9,
      reviews: 234,
      category: 'Pizzas',
      availability: true,
      image_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'f5d8e9b0-3cg4-58b3-0g4b-8g7e2d3b1c90',
      name: 'Veg Burger',
      price: 8.49,
      rating: 4.8,
      reviews: 189,
      category: 'Burgers',
      availability: true,
      image_url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'g6e9f0a1-4dh5-69c4-1h5c-9h8f3e4c2d02',
      name: 'Fresh Lemonade',
      price: 2.99,
      rating: 4.7,
      reviews: 312,
      category: 'Drinks',
      availability: true,
      image_url: 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'h7f0a1b2-5ei6-7ad5-2i6d-0i9g4f5d3e13',
      name: 'New York Cheesecake',
      price: 6.49,
      rating: 4.6,
      reviews: 156,
      category: 'Desserts',
      availability: true,
      image_url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80'
    },
  ];

  const displayDishes = (items.length > 0 ? items : getFallbackDishes()).slice(0, 3);

  return (
    <section className="popular-dishes">
      <div className="container">
        <h2 className="section-title">Popular Dishes</h2>
        {loading && items.length === 0 ? (
          <div className="dishes-loading" style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '1.1rem' }}>
            Loading popular dishes...
          </div>
        ) : (
          <div className="foods-grid">
            {displayDishes.map((dish) => (
              <FoodCard 
                key={dish.id} 
                food={dish} 
                onAddToCart={handleAdd} 
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
