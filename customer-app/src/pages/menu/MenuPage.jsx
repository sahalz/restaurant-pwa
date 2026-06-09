import { useState, useEffect, useMemo } from 'react';
import { FoodCard, SearchBar, CategoryFilter } from '../../components/menu';
import { menuAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import './MenuPage.css';

export const MenuPage = () => {
  const { addToCart } = useCart();

  // Categories state: array of { id, name }
  const [categories, setCategories] = useState([{ id: 'All', name: 'All' }]);
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Menu items state
  const [menuItems, setMenuItems] = useState([]);
  
  // Controls
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await menuAPI.getCategories();
        if (response.data && response.data.status === 'success') {
          // Add 'All' as the default first category
          const fetchedCats = response.data.data.map(cat => ({
            id: cat.id,
            name: cat.name
          }));
          setCategories([{ id: 'All', name: 'All' }, ...fetchedCats]);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // 2. Fetch menu items whenever the active category changes
  useEffect(() => {
    const fetchMenuItems = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await menuAPI.getMenu(activeCategory === 'All' ? null : activeCategory);
        if (response.data && response.data.status === 'success') {
          setMenuItems(response.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch menu items:', err);
        setError('Could not load menu items. Please check backend connection.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMenuItems();
  }, [activeCategory]);

  // Filter food based on search term (since category filtering is handled server-side)
  const filteredFood = useMemo(() => {
    return menuItems.filter((food) => {
      const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           food.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [menuItems, searchTerm]);

  const handleAddToCart = (food) => {
    // Transform item format if necessary to match the cart context's properties
    addToCart({
      id: food.id,
      name: food.name,
      price: food.price,
      image_url: food.image_url,
      category_id: food.category_id
    });
  };

  return (
    <div className="menu-page">
      <div className="menu-container">
        <div className="menu-header">
          <h1>Our Menu</h1>
          <p>Explore our delicious food options</p>
        </div>

        <div className="menu-controls">
          <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          <CategoryFilter 
            categories={categories.map(c => c.name)} 
            activeCategory={categories.find(c => c.id === activeCategory)?.name || 'All'} 
            onCategoryChange={(catName) => {
              const matchedCat = categories.find(c => c.name === catName);
              if (matchedCat) {
                setActiveCategory(matchedCat.id);
              }
            }} 
          />
        </div>

        {error && (
          <div className="error-banner" style={{
            backgroundColor: '#ffe3e3',
            color: '#e53e3e',
            padding: '16px',
            borderRadius: '8px',
            textAlign: 'center',
            margin: '1rem 0',
            fontWeight: '600'
          }}>
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="loading-state" style={{ textAlign: 'center', padding: '40px', fontSize: '18px', color: '#666' }}>
            Loading delicious options...
          </div>
        ) : (
          <>
            <div className="menu-results">
              <p className="results-count">
                {filteredFood.length} {filteredFood.length === 1 ? 'item' : 'items'} found
              </p>
            </div>

            {filteredFood.length > 0 ? (
              <div className="food-grid">
                {filteredFood.map((food) => (
                  <FoodCard 
                    key={food.id} 
                    food={food} 
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            ) : (
              <div className="no-results">
                <p>No food items found matching your criteria.</p>
                <button 
                  className="reset-btn"
                  onClick={() => {
                    setSearchTerm('');
                    setActiveCategory('All');
                  }}
                >
                  Reset Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
