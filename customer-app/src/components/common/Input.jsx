// Common reusable Input component
export const Input = ({ type = 'text', placeholder, value, onChange }) => {
  return (
    <input 
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="input-field"
    />
  );
};
