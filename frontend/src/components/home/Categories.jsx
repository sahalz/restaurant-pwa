import {
  FaPizzaSlice,
  FaHamburger,
  FaCoffee,
  FaIceCream,
  FaDrumstickBite,
  FaFish,
} from 'react-icons/fa';

export const Categories = () => {
  const categories = [
    { id: 1, name: 'Pizza', icon: <FaPizzaSlice />, count: 120 },
    { id: 2, name: 'Burgers', icon: <FaHamburger />, count: 85 },
    { id: 3, name: 'Coffee', icon: <FaCoffee />, count: 45 },
    { id: 4, name: 'Desserts', icon: <FaIceCream />, count: 60 },
    { id: 5, name: 'Chicken', icon: <FaDrumstickBite />, count: 55 },
    { id: 6, name: 'Seafood', icon: <FaFish />, count: 30 },
  ];

  return (
    <section className="categories">
      <div className="container">
        <h2 className="section-title">Browse Categories</h2>

        <div className="categories-grid">
          {categories.map((category) => (
            <div key={category.id} className="category-card">
              <div className="category-icon">{category.icon}</div>
              <h3>{category.name}</h3>
              <span>{category.count} items</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;