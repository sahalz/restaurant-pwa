import { FaTag, FaArrowRight } from 'react-icons/fa';

export const Offers = () => {
  const offers = [
    {
      id: 1,
      title: '50% OFF',
      description: 'On your first order',
      code: 'FIRST50',
      bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      id: 2,
      title: 'FREE DELIVERY',
      description: 'Orders above $30',
      code: 'FREEDEL',
      bgColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      id: 3,
      title: '20% CASHBACK',
      description: 'Weekend special',
      code: 'WEEKEND20',
      bgColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
  ];

  return (
    <section className="offers">
      <div className="container">
        <h2 className="section-title">Special Offers</h2>
        <div className="offers-grid">
          {offers.map((offer) => (
            <div key={offer.id} className="offer-card" style={{ background: offer.bgColor }}>
              <div className="offer-content">
                <div className="offer-icon">
                  <FaTag />
                </div>
                <h3>{offer.title}</h3>
                <p>{offer.description}</p>
                <div className="offer-code">
                  <span>Code: {offer.code}</span>
                </div>
              </div>
              <button className="offer-btn">
                <FaArrowRight />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
