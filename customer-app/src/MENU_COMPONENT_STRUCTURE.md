# Restaurant Menu - Component Structure Guide

## Overview
This guide explains the component structure for the restaurant menu management system. The menu is built using React with reusable components, making it easy to maintain and extend.

## File Structure
```
src/
├── components/menu/
│   ├── FoodCard.jsx       # Reusable food item card
│   ├── SearchBar.jsx      # Search input component
│   ├── CategoryFilter.jsx # Category filter buttons
│   └── index.jsx          # Export all menu components
├── data/
│   └── foodData.js        # Dummy food data and utilities
└── pages/menu/
    ├── MenuPage.jsx       # Main menu page
    └── MenuPage.css       # Menu page styles
```

## Component Breakdown

### 1. FoodCard Component (`src/components/menu/FoodCard.jsx`)

**Purpose**: Displays a single food item with all its details.

**Props**:
- `food` (object): Food item data containing name, price, rating, image, etc.
- `onAddToCart` (function): Callback function when "Add" button is clicked

**Features**:
- Displays food emoji as image placeholder
- Shows category, name, description, rating, and price
- Wishlist button for saving favorites
- Add to cart button with callback

**Usage Example**:
```jsx
<FoodCard 
  food={foodItem} 
  onAddToCart={(food) => console.log('Added:', food)} 
/>
```

---

### 2. SearchBar Component (`src/components/menu/SearchBar.jsx`)

**Purpose**: Provides search functionality to filter food items.

**Props**:
- `searchTerm` (string): Current search term value
- `onSearchChange` (function): Callback when search input changes

**Features**:
- Search icon for visual indication
- Real-time search as user types
- Controlled input component

**Usage Example**:
```jsx
<SearchBar 
  searchTerm={searchTerm} 
  onSearchChange={(value) => setSearchTerm(value)} 
/>
```

---

### 3. CategoryFilter Component (`src/components/menu/CategoryFilter.jsx`)

**Purpose**: Displays category filter buttons to filter food by category.

**Props**:
- `categories` (array): Array of category names (e.g., ['All', 'Pizza', 'Burgers'])
- `activeCategory` (string): Currently selected category
- `onCategoryChange` (function): Callback when category is selected

**Features**:
- Horizontal scrollable list of category buttons
- Active category highlighted
- Click to filter by category

**Usage Example**:
```jsx
<CategoryFilter 
  categories={['All', 'Pizza', 'Burgers']} 
  activeCategory='Pizza' 
  onCategoryChange={(category) => setActiveCategory(category)} 
/>
```

---

### 4. MenuPage Component (`src/pages/menu/MenuPage.jsx`)

**Purpose**: Main menu page that combines all components and manages state.

**State**:
- `searchTerm` (string): Current search query
- `activeCategory` (string): Currently selected category

**Features**:
- Manages search and filter state
- Filters food data based on search and category
- Displays results count
- Shows "No results" message when no items match
- Reset filters button

**Data Flow**:
1. User types in search bar → `searchTerm` updates
2. User clicks category → `activeCategory` updates
3. `useMemo` filters `foodData` based on both filters
4. Filtered results displayed in grid

**Key Concepts**:
- **useMemo**: Optimizes filtering by only recalculating when dependencies change
- **Controlled Components**: Search bar and category filter are controlled by parent state
- **Props Drilling**: Callback functions passed down to child components

---

### 5. Food Data (`src/data/foodData.js`)

**Purpose**: Provides dummy food data and utility functions.

**Exports**:
- `foodData` (array): Array of 12 food items with complete details
- `getCategories` (function): Returns unique categories from food data

**Food Item Structure**:
```javascript
{
  id: 1,
  name: 'Classic Cheeseburger',
  category: 'Burgers',
  price: 12.99,
  rating: 4.8,
  reviews: 234,
  image: '🍔',
  description: 'Juicy beef patty...',
  restaurant: 'Burger Palace',
  deliveryTime: '25-30 min',
  isVegetarian: false,
  isSpicy: false,
}
```

---

## How It All Works Together

```
MenuPage (Parent)
  ├── Manages State (searchTerm, activeCategory)
  ├── Imports foodData from data/foodData.js
  │
  ├── SearchBar
  │   └── Receives searchTerm and onSearchChange
  │
  ├── CategoryFilter
  │   └── Receives categories, activeCategory, onCategoryChange
  │
  └── FoodCard (mapped over filtered results)
      └── Receives food item and onAddToCart callback
```

## Data Flow Diagram

```
User Input (Search/Category)
    ↓
MenuPage State Updates
    ↓
useMemo Filters foodData
    ↓
Filtered Results Rendered
    ↓
FoodCard Components Display
```

## Key React Concepts Used

### 1. Component Composition
Breaking UI into smaller, reusable components makes code:
- Easier to maintain
- Reusable across the app
- Easier to test

### 2. Props
Pass data and functions from parent to child components:
```jsx
<FoodCard food={item} onAddToCart={handleAdd} />
```

### 3. State Management
Using `useState` to manage component state:
```jsx
const [searchTerm, setSearchTerm] = useState('');
```

### 4. Performance Optimization
Using `useMemo` to avoid unnecessary recalculations:
```jsx
const filteredFood = useMemo(() => {
  return foodData.filter(...);
}, [searchTerm, activeCategory]);
```

### 5. Controlled Components
Form elements controlled by React state:
```jsx
<input value={searchTerm} onChange={handleChange} />
```

## Extending the Menu System

### Adding New Food Items
Edit `src/data/foodData.js` and add new objects to the `foodData` array.

### Adding New Filters
1. Add new state in MenuPage
2. Create new filter component
3. Update the filtering logic in `useMemo`

### Integrating with Cart
Replace the `console.log` in `handleAddToCart` with actual cart context integration:
```jsx
import { useCart } from '../../context/CartContext';

const { addToCart } = useCart();

const handleAddToCart = (food) => {
  addToCart(food);
};
```

## Responsive Design
The menu uses CSS Grid with `auto-fill` and `minmax` for responsive layouts:
- Desktop: 3-4 columns
- Tablet: 2-3 columns
- Mobile: 1 column

Media queries adjust spacing and font sizes for different screen sizes.

## Summary
This menu system demonstrates:
- **Component Reusability**: Each component has a single responsibility
- **State Management**: Parent component controls child components
- **Data Filtering**: Efficient filtering with useMemo
- **Responsive Design**: Works on all screen sizes
- **Clean Architecture**: Separation of concerns (data, components, pages)
