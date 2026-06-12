// Menu API service
export const menuService = {
  getMenuItems: async () => {
    const response = await fetch('/api/menu');
    return response.json();
  },

  getMenuItem: async (id) => {
    const response = await fetch(`/api/menu/${id}`);
    return response.json();
  },

  searchMenu: async (query) => {
    const response = await fetch(`/api/menu/search?q=${query}`);
    return response.json();
  }
};
