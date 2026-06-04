// Menu management - Menu item component
export const MenuItem = ({ item }) => {
  return (
    <div className="menu-item">
      <h3>{item.name}</h3>
      <p>{item.description}</p>
      <span className="price">${item.price}</span>
    </div>
  );
};
