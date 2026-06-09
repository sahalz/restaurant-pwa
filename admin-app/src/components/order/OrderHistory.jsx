// Order management - Order history component
export const OrderHistory = ({ orders }) => {
  return (
    <div className="order-history">
      <h2>Order History</h2>
      {orders.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
};
