import React from 'react';
import Header from './Header';
import Footer from './Footer';
import Cart from '../Cart/Cart';
import CartNotification from '../CartNotification';

// BubbleBackground component for tiny moving bubbles
const BubbleBackground: React.FC = () => {
  const bubbleCount = 40;
  const bubbles = Array.from({ length: bubbleCount });

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {bubbles.map((_, i) => {
        // Randomize size, position, duration, and delay for each bubble
        const size = Math.random() * 8 + 4; // 4px to 12px
        const left = Math.random() * 100;
        const duration = Math.random() * 10 + 8; // 8s to 18s
        const delay = Math.random() * 10;
        const opacity = Math.random() * 0.3 + 0.2;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${left}%`,
              bottom: `-${size}px`,
              width: `${size}px`,
              height: `${size}px`,
              borderRadius: '50%',
              background: 'rgba(173, 216, 230, 0.7)',
              opacity,
              animation: `bubble-move ${duration}s linear ${delay}s infinite`,
            }}
          />
        );
      })}
    </div>
  );
};

// Add bubble animation keyframes to the document
if (typeof window !== 'undefined' && !document.getElementById('bubble-keyframes')) {
  const style = document.createElement('style');
  style.id = 'bubble-keyframes';
  style.innerHTML = `
    @keyframes bubble-move {
      0% {
        transform: translateY(0) scale(1);
      }
      100% {
        transform: translateY(-100vh) scale(1.1);
      }
    }
  `;
  document.head.appendChild(style);
}

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col relative" style={{ zIndex: 1 }}>
      <BubbleBackground />
      <Header />
      <main className="flex-1" style={{ position: 'relative', zIndex: 2 }}>
        {children}
      </main>
      <Footer />
      <Cart />
      <CartNotification />
    </div>
  );
};

export default Layout;