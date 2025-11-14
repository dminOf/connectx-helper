import { useState } from 'react';
import { FiSend, FiCheckCircle, FiActivity, FiPower, FiCheck, FiSearch } from 'react-icons/fi';

export function QuickLinks() {
  const [isExpanded, setIsExpanded] = useState(true);

  const orderLinks = [
    {
      label: 'Create Service Order',
      url: 'http://10.138.33.188:8080/ui/clusters/dev/all-topics/esb.prd.createServiceOrder/messages?filterQueryType=STRING_CONTAINS&attempt=2&limit=100&page=0&seekDirection=BACKWARD&keySerde=String&valueSerde=String&seekType=LATEST',
      icon: <FiSend />
    },
    {
      label: 'Service Order Created',
      url: 'http://10.138.33.188:8080/ui/clusters/dev/all-topics/esb.prd.serviceOrderCreated/messages?filterQueryType=STRING_CONTAINS&attempt=2&limit=100&page=0&seekDirection=BACKWARD&keySerde=String&valueSerde=String&seekType=LATEST',
      icon: <FiCheckCircle />
    },
    {
      label: 'Service Order Events',
      url: 'http://10.138.33.188:8080/ui/clusters/dev/all-topics/esb.prd.serviceOrderEvents/messages?filterQueryType=STRING_CONTAINS&attempt=2&limit=100&page=0&seekDirection=BACKWARD&keySerde=String&valueSerde=String&seekType=LATEST',
      icon: <FiActivity />
    },
  ];

  const activationLinks = [
    {
      label: 'Create Service Activation',
      url: 'http://10.138.33.188:8080/ui/clusters/dev/all-topics/esb.prd.createServiceActivation/messages?filterQueryType=STRING_CONTAINS&attempt=2&limit=100&page=0&seekDirection=BACKWARD&keySerde=String&valueSerde=String&seekType=LATEST',
      icon: <FiPower />
    },
    {
      label: 'Service Activation Created',
      url: 'http://10.138.33.188:8080/ui/clusters/dev/all-topics/esb.prd.serviceActivationCreated/messages?filterQueryType=STRING_CONTAINS&attempt=2&limit=100&page=0&seekDirection=BACKWARD&keySerde=String&valueSerde=String&seekType=LATEST',
      icon: <FiCheck />
    },
    {
      label: 'Service Activation Events',
      url: 'http://10.138.33.188:8080/ui/clusters/dev/all-topics/esb.prd.serviceActivationEvents/messages?filterQueryType=STRING_CONTAINS&attempt=2&limit=100&page=0&seekDirection=BACKWARD&keySerde=String&valueSerde=String&seekType=LATEST',
      icon: <FiActivity />
    },
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
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    <span className="link-icon">{link.icon}</span>
                    {link.label}
                  </a>
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
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    <span className="link-icon">{link.icon}</span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Jaeger Link */}
          <div className="link-section jaeger-link">
            <a href="http://10.137.17.37:30686/search?end=1762316157758000&limit=20&lookback=1h&maxDuration&minDuration&service=TMF641_ServiceOrder&start=1762312557758000" target="_blank" rel="noopener noreferrer">
              <span className="link-icon"><FiSearch /></span>
              Jaeger
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
