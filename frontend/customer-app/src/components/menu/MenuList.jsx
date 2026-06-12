// Menu management - Menu list component
export const MenuList = ({ items }) => {
  return (
    <div className="menu-list">
      {items.map(item => (
        <MenuItem key={item.id} item={item} />
      ))}
    </div>
  );
};
