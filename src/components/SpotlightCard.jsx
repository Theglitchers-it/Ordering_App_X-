import { useRef } from 'react';
import './SpotlightCard.css';

const SpotlightCard = ({ children, className = '', spotlightColor = 'rgba(255, 255, 255, 0.25)' }) => {
  const divRef = useRef(null);

  const handleMouseMove = e => {
    const rect = divRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    divRef.current.style.setProperty('--mouse-x', `${x}px`);
    divRef.current.style.setProperty('--mouse-y', `${y}px`);
    divRef.current.style.setProperty('--spotlight-color', spotlightColor);
  };

  const handleTouchMove = e => {
    if (e.touches.length > 0) {
      const rect = divRef.current.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const y = e.touches[0].clientY - rect.top;

      divRef.current.style.setProperty('--mouse-x', `${x}px`);
      divRef.current.style.setProperty('--mouse-y', `${y}px`);
      divRef.current.style.setProperty('--spotlight-color', spotlightColor);
    }
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      className={`card-spotlight ${className}`}
    >
      {children}
    </div>
  );
};

export default SpotlightCard;
