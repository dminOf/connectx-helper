import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

interface SpecCharacteristic {
  name: string;
  valueType: string;
  configurable?: boolean;
  minCardinality?: number;
  maxCardinality?: number;
}

interface ServiceSpec {
  '@type': string;
  id: string;
  name: string;
  description: string;
  specCharacteristic: SpecCharacteristic[];
}

type SubTab = 'Port' | 'LAG' | 'VXC' | 'VXC Cloud';
type SortColumn = 'name' | 'valueType' | 'mandatory';
type SortDirection = 'asc' | 'desc';

const SUB_TAB_IDS: Record<SubTab, string> = {
  'Port': 'CFSS_ConnectX_Port',
  'LAG': 'CFSS_ConnectX_LAG',
  'VXC': 'CFSS_ConnectX_VXC',
  'VXC Cloud': 'CFSS_ConnectX_VXC_Cloud',
};

export function SpecsPage() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('Port');
  const [specifications, setSpecifications] = useState<SpecCharacteristic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<SortColumn>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [searchTerm, setSearchTerm] = useState('');

  // Edit dialog states
  const [editingField, setEditingField] = useState<string | null>(null);
  const [newFieldName, setNewFieldName] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addFieldName, setAddFieldName] = useState('');
  const [addFieldType, setAddFieldType] = useState<string>('string');
  const [addFieldMandatory, setAddFieldMandatory] = useState(false);

  useEffect(() => {
    fetchSpecifications(activeSubTab);
  }, [activeSubTab]);

  const fetchSpecifications = async (tab: SubTab) => {
    setLoading(true);
    setError(null);

    try {
      const specId = SUB_TAB_IDS[tab];
      const response = await fetch(`/api/specifications/${specId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch specifications');
      }

      const data: ServiceSpec = await response.json();
      setSpecifications(data.specCharacteristic || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSpecifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchSpecifications(activeSubTab);
  };

  const handleDownloadExcel = async () => {
    try {
      // Create a new workbook
      const workbook = XLSX.utils.book_new();

      // Fetch all specifications for all tabs
      const tabNames: SubTab[] = ['Port', 'LAG', 'VXC', 'VXC Cloud'];

      for (const tab of tabNames) {
        const specId = SUB_TAB_IDS[tab];
        const response = await fetch(`/api/specifications/${specId}`);

        if (!response.ok) {
          console.error(`Failed to fetch ${tab} specifications`);
          continue;
        }

        const data: ServiceSpec = await response.json();
        const specs = data.specCharacteristic || [];

        // Prepare data for Excel sheet
        const sheetData = specs.map((spec) => ({
          'Field Name': spec.name,
          'Value Type': spec.valueType,
          'Mandatory': isMandatory(spec) ? 'true' : 'false',
        }));

        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(sheetData);

        // Set column widths
        worksheet['!cols'] = [
          { wch: 30 }, // Field Name
          { wch: 15 }, // Value Type
          { wch: 12 }, // Mandatory
        ];

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, tab);
      }

      // Generate Excel file and trigger download
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const fileName = `ConnectX_Specifications_${timestamp}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error('Error generating Excel file:', error);
      alert('Failed to generate Excel file. Please try again.');
    }
  };

  const isMandatory = (spec: SpecCharacteristic): boolean => {
    return spec.minCardinality !== undefined && spec.minCardinality >= 1;
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleToggleMandatory = async (fieldName: string, currentMandatory: boolean) => {
    try {
      const specId = SUB_TAB_IDS[activeSubTab];
      const newMinCardinality = currentMandatory ? 0 : 1;

      const response = await fetch(`/api/specifications/${specId}/characteristic`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldName: fieldName,
          minCardinality: newMinCardinality,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update characteristic');
      }

      // Update local state without reloading
      setSpecifications(prev =>
        prev.map(spec =>
          spec.name === fieldName
            ? { ...spec, minCardinality: newMinCardinality }
            : spec
        )
      );
    } catch (error) {
      console.error('Error toggling mandatory:', error);
      alert('Failed to update mandatory status. Please try again.');
    }
  };

  const handleStartRename = (fieldName: string) => {
    setEditingField(fieldName);
    setNewFieldName(fieldName);
  };

  const handleSaveRename = async (oldName: string) => {
    if (!newFieldName || newFieldName === oldName) {
      setEditingField(null);
      return;
    }

    try {
      const specId = SUB_TAB_IDS[activeSubTab];

      const response = await fetch(`/api/specifications/${specId}/characteristic`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldName,
          newName: newFieldName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to rename characteristic');
      }

      // Refresh data
      await fetchSpecifications(activeSubTab);
      setEditingField(null);
    } catch (error) {
      console.error('Error renaming field:', error);
      alert('Failed to rename field. Please try again.');
    }
  };

  const handleCancelRename = () => {
    setEditingField(null);
    setNewFieldName('');
  };

  const handleAddField = async () => {
    if (!addFieldName || !addFieldType) {
      alert('Please provide both field name and type');
      return;
    }

    try {
      const specId = SUB_TAB_IDS[activeSubTab];

      const response = await fetch(`/api/specifications/${specId}/characteristic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: addFieldName,
          valueType: addFieldType,
          minCardinality: addFieldMandatory ? 1 : 0,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add characteristic');
      }

      // Refresh data
      await fetchSpecifications(activeSubTab);
      setShowAddDialog(false);
      setAddFieldName('');
      setAddFieldType('string');
      setAddFieldMandatory(false);
    } catch (error) {
      console.error('Error adding field:', error);
      alert('Failed to add field. Please try again.');
    }
  };

  const handleDeleteField = async (fieldName: string) => {
    try {
      const specId = SUB_TAB_IDS[activeSubTab];

      const response = await fetch(`/api/specifications/${specId}/characteristic`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: fieldName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete characteristic');
      }

      // Update local state without reloading
      setSpecifications(prev => prev.filter(spec => spec.name !== fieldName));
    } catch (error) {
      console.error('Error deleting field:', error);
      alert('Failed to delete field. Please try again.');
    }
  };

  const filteredSpecifications = specifications.filter((spec) => {
    if (!searchTerm) return true;

    const search = searchTerm.toLowerCase();
    const nameMatch = spec.name.toLowerCase().includes(search);
    const valueTypeMatch = spec.valueType.toLowerCase().includes(search);
    const mandatoryMatch = isMandatory(spec)
      ? 'true'.includes(search) || 'mandatory'.includes(search)
      : 'false'.includes(search) || 'optional'.includes(search);

    return nameMatch || valueTypeMatch || mandatoryMatch;
  });

  const sortedSpecifications = [...filteredSpecifications].sort((a, b) => {
    let compareValue = 0;

    if (sortColumn === 'name') {
      compareValue = a.name.localeCompare(b.name);
    } else if (sortColumn === 'valueType') {
      compareValue = a.valueType.localeCompare(b.valueType);
    } else if (sortColumn === 'mandatory') {
      const aMandatory = isMandatory(a);
      const bMandatory = isMandatory(b);
      compareValue = aMandatory === bMandatory ? 0 : aMandatory ? -1 : 1;
    }

    return sortDirection === 'asc' ? compareValue : -compareValue;
  });

  return (
    <div className="specs-page">
      {/* Sub-tabs Navigation */}
      <div className="sub-tabs-header">
        <div className="sub-tabs">
          {(Object.keys(SUB_TAB_IDS) as SubTab[]).map((tab) => (
            <button
              key={tab}
              className={`sub-tab ${activeSubTab === tab ? 'active' : ''}`}
              onClick={() => setActiveSubTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <button className="download-excel-button" onClick={handleDownloadExcel} title="Download Excel">
          📥 Download Excel
        </button>
      </div>

      {/* Specifications Table */}
      <div className="specifications-content">
        {loading && <div className="loading">Loading specifications...</div>}

        {error && <div className="error">Error: {error}</div>}

        {!loading && !error && (
          <>
            {/* Search Filter */}
            <div className="filter-section">
              <input
                type="text"
                className="search-input"
                placeholder="Search by name, value type, or mandatory/optional..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="clear-search"
                  onClick={() => setSearchTerm('')}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
              <button
                className="refresh-button"
                onClick={handleRefresh}
                disabled={loading}
                title="Refresh data"
              >
                {loading ? '⟳' : '↻'}
              </button>
              <button
                className="add-field-button"
                onClick={() => setShowAddDialog(true)}
                title="Add New Field"
              >
                ➕ Add Field
              </button>
              <div className="filter-info">
                Showing {sortedSpecifications.length} of {specifications.length} fields
              </div>
            </div>

            <table className="specs-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')} className="sortable">
                  Name {sortColumn === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('valueType')} className="sortable">
                  Value Type {sortColumn === 'valueType' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('mandatory')} className="sortable">
                  Mandatory {sortColumn === 'mandatory' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedSpecifications.length === 0 ? (
                <tr>
                  <td colSpan={3} className="no-data">
                    No specifications found
                  </td>
                </tr>
              ) : (
                sortedSpecifications.map((spec, index) => (
                  <tr key={index}>
                    <td>
                      <div className="name-cell">
                        {isMandatory(spec) && <span className="mandatory-indicator"></span>}
                        {editingField === spec.name ? (
                          <div className="edit-field">
                            <input
                              type="text"
                              className="edit-input"
                              value={newFieldName}
                              onChange={(e) => setNewFieldName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveRename(spec.name);
                                if (e.key === 'Escape') handleCancelRename();
                              }}
                              autoFocus
                            />
                            <button className="save-btn" onClick={() => handleSaveRename(spec.name)}>✓</button>
                            <button className="cancel-btn" onClick={handleCancelRename}>✕</button>
                          </div>
                        ) : (
                          <>
                            <span>{spec.name}</span>
                            <div className="action-icons">
                              <button
                                className="edit-icon"
                                onClick={() => handleStartRename(spec.name)}
                                title="Rename field"
                              >
                                ✏️
                              </button>
                              <button
                                className="delete-icon"
                                onClick={() => handleDeleteField(spec.name)}
                                title="Delete field"
                              >
                                🗑️
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                    <td>{spec.valueType}</td>
                    <td>
                      <div className="mandatory-cell">
                        <input
                          type="checkbox"
                          className="mandatory-checkbox"
                          checked={isMandatory(spec)}
                          onChange={() => handleToggleMandatory(spec.name, isMandatory(spec))}
                          title="Toggle mandatory"
                        />
                        <span>{isMandatory(spec) ? 'true' : 'false'}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </>
        )}
      </div>

      {/* Add Field Dialog */}
      {showAddDialog && (
        <div className="dialog-overlay" onClick={() => setShowAddDialog(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h3>Add New Field</h3>
              <button className="dialog-close" onClick={() => setShowAddDialog(false)}>✕</button>
            </div>
            <div className="dialog-body">
              <div className="form-group">
                <label htmlFor="fieldName">Field Name:</label>
                <input
                  id="fieldName"
                  type="text"
                  className="form-input"
                  value={addFieldName}
                  onChange={(e) => setAddFieldName(e.target.value)}
                  placeholder="Enter field name"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label htmlFor="fieldType">Value Type:</label>
                <select
                  id="fieldType"
                  className="form-select"
                  value={addFieldType}
                  onChange={(e) => setAddFieldType(e.target.value)}
                >
                  <option value="string">string</option>
                  <option value="int">int</option>
                  <option value="stringarray">stringarray</option>
                  <option value="boolean">boolean</option>
                </select>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    className="form-checkbox"
                    checked={addFieldMandatory}
                    onChange={(e) => setAddFieldMandatory(e.target.checked)}
                  />
                  <span>Mark as Mandatory</span>
                </label>
              </div>
            </div>
            <div className="dialog-footer">
              <button className="btn-cancel" onClick={() => setShowAddDialog(false)}>Cancel</button>
              <button className="btn-add" onClick={handleAddField}>Add Field</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
