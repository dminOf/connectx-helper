import { useState } from 'react';
import { SpecsPage } from './SpecsPage';
import { QuickLinks } from '../components/QuickLinks';

type MainTab = 'Specs' | 'Inventory' | 'Service Activation' | 'Example Requests';

export function MainLayout() {
  const [activeTab, setActiveTab] = useState<MainTab>('Specs');

  const tabs: MainTab[] = ['Specs', 'Inventory', 'Service Activation', 'Example Requests'];

  return (
    <div className="main-layout">
      {/* Top Navigation Tabs */}
      <nav className="main-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`main-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Main Content Area */}
      <div className="content-wrapper">
        {/* Left: Main Content */}
        <div className="main-content">
          {activeTab === 'Specs' && <SpecsPage />}
          {activeTab === 'Inventory' && (
            <div className="placeholder-page">
              <h2>Inventory</h2>
              <p>Coming soon...</p>
            </div>
          )}
          {activeTab === 'Service Activation' && (
            <div className="placeholder-page">
              <h2>Service Activation</h2>
              <p>Coming soon...</p>
            </div>
          )}
          {activeTab === 'Example Requests' && (
            <div className="placeholder-page">
              <h2>Example Requests</h2>
              <p>Coming soon...</p>
            </div>
          )}
        </div>

        {/* Right: Quick Links Sidebar */}
        <aside className="sidebar">
          <QuickLinks />
        </aside>
      </div>
    </div>
  );
}
