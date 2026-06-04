import { useState, useMemo } from 'react';
import { FoodCard, SearchBar, CategoryFilter } from '../../components/menu';
import { foodData, getCategories } from '../../data/foodData';
import { useCart } from '../../context/CartContext';
import './MenuPage.css';

export const MenuPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = getCategories();
  const { addToCart } = useCart();

  // Filter food based on search term and category
  const filteredFood = useMemo(() => {
    return foodData.filter((food) => {
      const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           food.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'All' || food.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  const handleAddToCart = (food) => {
    addToCart(food);
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
            categories={categories} 
            activeCategory={activeCategory} 
            onCategoryChange={setActiveCategory} 
          />
        </div>

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
      </div>
    </div>
  );
};
