// Custom hook for order operations
import { useOrder as useOrderContext } from '../context/OrderContext';

export const useOrder = () => {
  return useOrderContext();
};
