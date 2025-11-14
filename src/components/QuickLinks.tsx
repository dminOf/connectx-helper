import { useState } from 'react';

export function QuickLinks() {
  const [isExpanded, setIsExpanded] = useState(true);

  const orderLinks = [
    { label: 'Create Service Order', url: '/order/create' },
    { label: 'Service Order Created', url: '/order/created' },
    { label: 'Service Order Events', url: '/order/events' },
  ];

  const activationLinks = [
    { label: 'Create Service Activation', url: '/activation/create' },
    { label: 'Service Activation Created', url: '/activation/created' },
    { label: 'Service Activation Events', url: '/activation/events' },
  ];

  return (
    <div className="quick-links">
      <div className="quick-links-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h3>Quick Links</h3>
        <span className="toggle-icon">{isExpanded ? '∧' : '∨'}</span>
      </div>

      {isExpanded && (
        <div className="quick-links-content">
          {/* Order Section */}
          <div className="link-section">
            <h4>Order:</h4>
            <ul>
              {orderLinks.map((link, index) => (
                <li key={index}>
                  <a href={link.url}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Activation Section */}
          <div className="link-section">
            <h4>Activation:</h4>
            <ul>
              {activationLinks.map((link, index) => (
                <li key={index}>
                  <a href={link.url}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Jaeger Link */}
          <div className="link-section jaeger-link">
            <a href="https://jaeger.example.com" target="_blank" rel="noopener noreferrer">
              🔍 Jaeger
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
