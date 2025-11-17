import { useState, useEffect } from 'react';
import { ORDER_TEMPLATES, OrderTemplate, generateOrderJSON } from '../utils/orderTemplates';

type MainTab = 'Port' | 'LAG' | 'VXC' | 'VXC Cloud';
type PortSubTab = 'Create Port' | 'Terminate Port';
type LAGSubTab = 'Create LAG' | 'Terminate LAG' | 'Upgrade LAG' | 'Downgrade LAG';
type VXCSubTab = 'Create VXC' | 'Terminate VXC' | 'Autoburst VXC';
type VXCCloudSubTab = 'Create VXC Cloud' | 'Terminate VXC Cloud';
type JSONTab = 'Order' | 'Ack' | 'Events' | 'Order Mongo' | 'Inventory Mongo';

const TEMPLATE_MAPPING: Record<string, string> = {
  'Create Port': 'create_port',
  'Terminate Port': 'terminate_port',
  'Create LAG': 'create_lag',
  'Terminate LAG': 'terminate_lag',
  'Upgrade LAG': 'upgrade_lag',
  'Downgrade LAG': 'downgrade_lag',
  'Create VXC': 'create_vxc',
  'Terminate VXC': 'terminate_vxc',
  'Autoburst VXC': 'autoburst_vxc',
  'Create VXC Cloud': 'create_vxc_cloud',
  'Terminate VXC Cloud': 'terminate_vxc_cloud',
};

export function OrdersPage() {
  const [hoveredMainTab, setHoveredMainTab] = useState<MainTab | null>(null);
  const [selectedMainTab, setSelectedMainTab] = useState<MainTab | null>(null);
  const [activePortSubTab, setActivePortSubTab] = useState<PortSubTab>('Create Port');
  const [activeLAGSubTab, setActiveLAGSubTab] = useState<LAGSubTab>('Create LAG');
  const [activeVXCSubTab, setActiveVXCSubTab] = useState<VXCSubTab>('Create VXC');
  const [activeVXCCloudSubTab, setActiveVXCCloudSubTab] = useState<VXCCloudSubTab>('Create VXC Cloud');
  const [activeJSONTab, setActiveJSONTab] = useState<JSONTab>('Order');

  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [currentTemplate, setCurrentTemplate] = useState<OrderTemplate | null>(null);
  const [generatedJSON, setGeneratedJSON] = useState<string>('');
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [showSendNotification, setShowSendNotification] = useState(false);
  const [sendStatus, setSendStatus] = useState<'success' | 'error' | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Get active sub-tab based on selected main tab
  const getActiveSubTab = (): string => {
    switch (selectedMainTab) {
      case 'Port': return activePortSubTab;
      case 'LAG': return activeLAGSubTab;
      case 'VXC': return activeVXCSubTab;
      case 'VXC Cloud': return activeVXCCloudSubTab;
      default: return '';
    }
  };

  // Handle sub-tab click
  const handleSubTabClick = (tab: string, mainTab: MainTab) => {
    setSelectedMainTab(mainTab);
    if (mainTab === 'Port') setActivePortSubTab(tab as PortSubTab);
    else if (mainTab === 'LAG') setActiveLAGSubTab(tab as LAGSubTab);
    else if (mainTab === 'VXC') setActiveVXCSubTab(tab as VXCSubTab);
    else if (mainTab === 'VXC Cloud') setActiveVXCCloudSubTab(tab as VXCCloudSubTab);
  };

  // Update template when sub-tab changes
  useEffect(() => {
    const subTab = getActiveSubTab();
    if (!subTab) {
      setCurrentTemplate(null);
      return;
    }

    const templateKey = TEMPLATE_MAPPING[subTab];
    const template = ORDER_TEMPLATES[templateKey];

    if (template) {
      setCurrentTemplate(template);

      // Initialize field values with examples
      const initialValues: Record<string, any> = {};
      template.fields.forEach(field => {
        initialValues[field.name] = field.example;
      });
      setFieldValues(initialValues);
    }
  }, [selectedMainTab, activePortSubTab, activeLAGSubTab, activeVXCSubTab, activeVXCCloudSubTab]);

  // Generate JSON when field values change
  useEffect(() => {
    if (currentTemplate) {
      const json = generateOrderJSON(currentTemplate, fieldValues);
      setGeneratedJSON(JSON.stringify(json, null, 2));
    }
  }, [currentTemplate, fieldValues]);

  const handleFieldChange = (fieldName: string, value: any) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(generatedJSON);
    setShowCopyNotification(true);
    setTimeout(() => setShowCopyNotification(false), 2000);
  };

  const handleSendOrder = async () => {
    if (!generatedJSON || isSending) return;

    setIsSending(true);
    setSendStatus(null);
    setShowSendNotification(false);

    try {
      const orderData = JSON.parse(generatedJSON);
      const response = await fetch('/api/orders/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: 'esb.prd.createServiceOrder',
          message: orderData
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSendStatus('success');
        setShowSendNotification(true);
        setTimeout(() => setShowSendNotification(false), 3000);
      } else {
        setSendStatus('error');
        setShowSendNotification(true);
        console.error('Failed to send order:', result);
        setTimeout(() => setShowSendNotification(false), 5000);
      }
    } catch (error) {
      setSendStatus('error');
      setShowSendNotification(true);
      console.error('Error sending order:', error);
      setTimeout(() => setShowSendNotification(false), 5000);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="orders-page">
      {/* Main tabs with sub-tabs */}
      <div className="orders-tabs-container">
        {/* Port Tab */}
        <div className="orders-tab-group"
             onMouseEnter={() => setHoveredMainTab('Port')}
             onMouseLeave={() => setHoveredMainTab(null)}>
          <button
            className={`orders-main-tab ${selectedMainTab === 'Port' ? 'expanded' : ''}`}
          >
            Port
          </button>
          {hoveredMainTab === 'Port' && (
            <div className="orders-sub-tabs">
              {(['Create Port', 'Terminate Port'] as PortSubTab[]).map((tab) => (
                <button
                  key={tab}
                  className={`orders-sub-tab ${activePortSubTab === tab ? 'active' : ''}`}
                  onClick={() => handleSubTabClick(tab, 'Port')}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* LAG Tab */}
        <div className="orders-tab-group"
             onMouseEnter={() => setHoveredMainTab('LAG')}
             onMouseLeave={() => setHoveredMainTab(null)}>
          <button
            className={`orders-main-tab ${selectedMainTab === 'LAG' ? 'expanded' : ''}`}
          >
            LAG
          </button>
          {hoveredMainTab === 'LAG' && (
            <div className="orders-sub-tabs">
              {(['Create LAG', 'Upgrade LAG', 'Downgrade LAG', 'Terminate LAG'] as LAGSubTab[]).map((tab) => (
                <button
                  key={tab}
                  className={`orders-sub-tab ${activeLAGSubTab === tab ? 'active' : ''}`}
                  onClick={() => handleSubTabClick(tab, 'LAG')}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* VXC Tab */}
        <div className="orders-tab-group"
             onMouseEnter={() => setHoveredMainTab('VXC')}
             onMouseLeave={() => setHoveredMainTab(null)}>
          <button
            className={`orders-main-tab ${selectedMainTab === 'VXC' ? 'expanded' : ''}`}
          >
            VXC
          </button>
          {hoveredMainTab === 'VXC' && (
            <div className="orders-sub-tabs">
              {(['Create VXC', 'Autoburst VXC', 'Terminate VXC'] as VXCSubTab[]).map((tab) => (
                <button
                  key={tab}
                  className={`orders-sub-tab ${activeVXCSubTab === tab ? 'active' : ''}`}
                  onClick={() => handleSubTabClick(tab, 'VXC')}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* VXC Cloud Tab */}
        <div className="orders-tab-group"
             onMouseEnter={() => setHoveredMainTab('VXC Cloud')}
             onMouseLeave={() => setHoveredMainTab(null)}>
          <button
            className={`orders-main-tab ${selectedMainTab === 'VXC Cloud' ? 'expanded' : ''}`}
          >
            VXC Cloud
          </button>
          {hoveredMainTab === 'VXC Cloud' && (
            <div className="orders-sub-tabs">
              {(['Create VXC Cloud', 'Terminate VXC Cloud'] as VXCCloudSubTab[]).map((tab) => (
                <button
                  key={tab}
                  className={`orders-sub-tab ${activeVXCCloudSubTab === tab ? 'active' : ''}`}
                  onClick={() => handleSubTabClick(tab, 'VXC Cloud')}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Split View */}
      <div className="orders-split-view">
        {/* Left Side - Form */}
        <div className="orders-form-panel">
          <div className="orders-form-header">
            <h3>Characteristics</h3>
          </div>
          <div className="orders-form-content">
            {currentTemplate && currentTemplate.fields.map((field) => (
              <div key={field.name} className="form-field">
                <label htmlFor={field.name}>
                  {field.name}
                  {field.mandatory && <span className="required-asterisk">*</span>}
                </label>
                {field.type.toLowerCase() === 'boolean' ? (
                  <select
                    id={field.name}
                    className="form-input-small"
                    value={String(fieldValues[field.name] ?? false)}
                    onChange={(e) => handleFieldChange(field.name, e.target.value === 'true')}
                  >
                    <option value="false">false</option>
                    <option value="true">true</option>
                  </select>
                ) : (
                  <input
                    id={field.name}
                    type="text"
                    className="form-input-small"
                    value={fieldValues[field.name] || ''}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    placeholder={field.example}
                  />
                )}
                <p className="field-description">{field.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - JSON Preview */}
        <div className="orders-json-panel">
          <div className="json-tabs-header">
            <div className="json-tabs">
              {(['Order', 'Ack', 'Events', 'Order Mongo', 'Inventory Mongo'] as JSONTab[]).map((tab) => (
                <button
                  key={tab}
                  className={`json-tab ${activeJSONTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveJSONTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="json-action-buttons">
              <button
                className="send-order-button"
                onClick={handleSendOrder}
                disabled={isSending || !generatedJSON}
              >
                {isSending ? 'Sending...' : 'Send Order'}
              </button>
              <button className="copy-json-button" onClick={handleCopyJSON}>
                Copy
              </button>
            </div>
            {showCopyNotification && (
              <div className="copy-notification">
                ✓ Copied to clipboard
              </div>
            )}
            {showSendNotification && (
              <div className={`send-notification ${sendStatus === 'success' ? 'success' : 'error'}`}>
                {sendStatus === 'success' ? '✓ Order sent to Kafka' : '✗ Failed to send order'}
              </div>
            )}
          </div>
          <div className="json-preview-content">
            <pre className="json-preview">
              <code dangerouslySetInnerHTML={{ __html: syntaxHighlight(generatedJSON) }}></code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

// Syntax highlighting for JSON
function syntaxHighlight(json: string): string {
  if (!json) return '';

  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
    let cls = 'json-number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'json-key';
      } else {
        cls = 'json-string';
      }
    } else if (/true|false/.test(match)) {
      cls = 'json-boolean';
    } else if (/null/.test(match)) {
      cls = 'json-null';
    }
    return '<span class="' + cls + '">' + match + '</span>';
  });
}
