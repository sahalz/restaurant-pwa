import { Hero, Categories, FeaturedFoods, Offers, PopularDishes } from '../../components/home';
import './HomePage.css';

export const HomePage = () => {
  return (
    <div className="home-page">
      <Hero />
      <Categories />
      <FeaturedFoods />
      <Offers />
      <PopularDishes />
    </div>
  );
};
