import { FaSearch } from 'react-icons/fa';

export const SearchBar = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="search-bar">
      <FaSearch className="search-icon" />
      <input
        type="text"
        placeholder="Search for food..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="search-input"
      />
    </div>
  );
};
