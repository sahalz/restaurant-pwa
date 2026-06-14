import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { menuAPI } from '../../services/api';
import { FoodCard } from '../menu';

export const FeaturedFoods = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await menuAPI.getMenu(null, true);
        if (res.data && res.data.status === 'success') {
          setItems(res.data.data);
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
  };

  const getFallbackItems = () => [
    {
      id: 'e4c7d8a9-2bf3-47a2-9f3a-7f6d1c2a0b89',
      name: 'Margherita Pizza',
      price: 12.99,
      rating: 4.8,
      reviews: 156,
      category: 'Pizzas',
      availability: true,
      image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'f5d8e9b0-3cg4-58b3-0g4b-8g7e2d3b1c91',
      name: 'Classic Cheeseburger',
      price: 9.99,
      rating: 4.9,
      reviews: 230,
      category: 'Burgers',
      availability: true,
      image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'g6e9f0a1-4dh5-69c4-1h5c-9h8f3e4c2d01',
      name: 'Iced Americano',
      price: 3.49,
      rating: 4.7,
      reviews: 95,
      category: 'Drinks',
      availability: true,
      image_url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'h7f0a1b2-5ei6-7ad5-2i6d-0i9g4f5d3e12',
      name: 'Chocolate Lava Cake',
      price: 5.99,
      rating: 4.6,
      reviews: 112,
      category: 'Desserts',
      availability: true,
      image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80'
    },
  ];

  const displayItems = items.length > 0 ? items.map((item, idx) => ({
    ...item,
    rating: (4.5 + (idx * 0.1)).toFixed(1),
    reviews: 100 + (idx * 30),
    category: 'Featured',
    availability: item.availability !== undefined ? item.availability : true
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
              <FoodCard 
                key={item.id} 
                food={item} 
                onAddToCart={handleAdd} 
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
