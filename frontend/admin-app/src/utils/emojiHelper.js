// Helper to map food items to emojis based on name/category or existing emoji value
export const getItemEmoji = (name, category, imageUrl, imageField) => {
  const isEmoji = (str) => {
    if (!str) return false;
    // If it doesn't contain common URL/file paths and is brief, it's likely a raw emoji character
    return !str.includes('http') && !str.includes('/') && !str.includes('.') && str.length <= 4;
  };

  if (isEmoji(imageUrl)) return imageUrl;
  if (isEmoji(imageField)) return imageField;

  const n = (name || '').toLowerCase();
  const c = (category || '').toLowerCase();

  if (n.includes('pizza') || c.includes('pizza') || c.includes('pizzas')) return '🍕';
  if (n.includes('burger') || c.includes('burger') || c.includes('burgers')) return '🍔';
  if (n.includes('lemonade') || n.includes('soda') || n.includes('coke') || n.includes('pepsi') || n.includes('juice') || c.includes('drink') || c.includes('beverage') || c.includes('drinks')) return '🥤';
  if (n.includes('americano') || n.includes('coffee') || n.includes('latte') || n.includes('tea')) return '☕';
  if (n.includes('cheesecake') || n.includes('lava') || n.includes('cake') || n.includes('ice cream') || c.includes('dessert') || c.includes('sweet') || c.includes('desserts')) return '🍰';
  if (n.includes('salad') || c.includes('salad') || c.includes('salads')) return '🥗';
  if (n.includes('wing') || n.includes('chicken') || n.includes('nugget') || c.includes('chicken')) return '🍗';
  if (n.includes('salmon') || n.includes('fish') || c.includes('seafood') || c.includes('fish')) return '🐟';
  if (n.includes('sushi') || c.includes('japanese') || c.includes('sushi')) return '🍣';
  if (n.includes('pad thai') || n.includes('noodle') || c.includes('thai') || c.includes('noodles')) return '🍜';
  if (n.includes('taco') || n.includes('burrito') || c.includes('mexican') || c.includes('tacos')) return '🌮';
  if (n.includes('risotto') || n.includes('rice') || c.includes('italian')) return '🍚';
  if (n.includes('pasta') || n.includes('spaghetti') || n.includes('lasagna')) return '🍝';

  return '🍽️';
};
