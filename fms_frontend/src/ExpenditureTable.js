import React, { useState, useMemo, useRef, useEffect } from 'react';
import './ExpenditureTable.css';

// Company Table component
const CompanyTable = ({ companies, onAddCompany, lastCompanyRef }) => {
  return (
    <div className="company-table-container">
      <h3>Supplier Companies</h3>
      
      <button 
        className="add-item-button" 
        onClick={onAddCompany}
      >
        + Add New Company
      </button>
      
      <div className="table-wrapper">
        <table className="company-table">
          <thead>
            <tr>
              <th>Company Name</th>
              <th>Website Link</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company, index) => (
              <tr 
                key={index}
                ref={index === companies.length - 1 ? lastCompanyRef : null}
              >
                <td>{company.name}</td>
                <td>
                  <a href={company.website} target="_blank" rel="noopener noreferrer">
                    {company.website}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ExpenditureTable = () => {
  const lastItemRef = useRef(null);
  const [newItemAdded, setNewItemAdded] = useState(false);
  const [data, setData] = useState([
    {
      id: 1,
      description: "Amicon® Ultra Centrifugal Filter, 10 kDa MWCO",
      company: "Sigma",
      ref: "UFC901008",
      unitPrice: 61.3,
      quantity: 1,
      cost: 61.3,
      type: "Small Stuff (glassware, etc..)",
      application: "MX",
      date: "05/08/2025",
      buyer: "Johan",
      req: "REQ3805926",
      po: "",
      reconciled: false
    },
    {
      id: 2,
      description: "Dundee StoragePod",
      company: "RoyJan",
      ref: "SP030004",
      unitPrice: 1300,
      quantity: 1,
      cost: 1300,
      type: "Small Stuff (glassware, etc..)",
      application: "MX",
      date: "05/08/2025",
      buyer: "Johan",
      req: "REQ3806242",
      po: "",
      reconciled: false
    },
    {
      id: 3,
      description: "Cryostream 1000 Service Kit",
      company: "Oxford Cryosystems",
      ref: "NA",
      unitPrice: 667,
      quantity: 1,
      cost: 667,
      type: "Service (repair, etc..)",
      application: "MX",
      date: "05/08/2025",
      buyer: "Johan",
      req: "REQ3806243",
      po: "",
      reconciled: false
    },
    {
      id: 4,
      description: "In Situ-1 Crystallisation Plate (40)",
      company: "MD",
      ref: "MD1L-89",
      unitPrice: 139,
      quantity: 1,
      cost: 139,
      type: "Plasticware (Tips/plates/DWB equipment)",
      application: "MX",
      date: "07/08/2025",
      buyer: "Johan",
      req: "REQ3806198",
      po: "",
      reconciled: false
    },
    {
      id: 5,
      description: "UVVMO MRC 96-Well 2-drop Crystallisation Plate™ (100 plates)",
      company: "MD",
      ref: "MD11-UVXPO-100",
      unitPrice: 766,
      quantity: 2,
      cost: 1532,
      type: "Plasticware (Tips/plates/DWB equipment)",
      application: "MX",
      date: "07/08/2025",
      buyer: "Johan",
      req: "REQ3806198",
      po: "",
      reconciled: false
    },
    {
      id: 6,
      description: "ClearVue Sheets (UV friendly)",
      company: "MD",
      ref: "MD4-015",
      unitPrice: 193,
      quantity: 5,
      cost: 965,
      type: "Plasticware (Tips/plates/DWB equipment)",
      application: "MX",
      date: "07/08/2025",
      buyer: "Johan",
      req: "REQ3806198",
      po: "",
      reconciled: false
    },
    {
      id: 7,
      description: "Blotting Paper for FEI Vitrobot, 55/20mm dia",
      company: "MD",
      ref: "MD16-132",
      unitPrice: 58,
      quantity: 2,
      cost: 116,
      type: "Small Stuff (glassware, etc..)",
      application: "Cryo-EM",
      date: "07/08/2025",
      buyer: "Johan",
      req: "REQ3806198",
      po: "",
      reconciled: false
    },
    {
      id: 8,
      description: "Dry Shipper (CX100)",
      company: "MD",
      ref: "MD7-21",
      unitPrice: 1624,
      quantity: 2,
      cost: 3248,
      type: "Small Stuff (glassware, etc..)",
      application: "Cryo-EM",
      date: "07/08/2025",
      buyer: "Johan",
      req: "REQ3806198",
      po: "",
      reconciled: false
    }
  ]);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const sortedData = useMemo(() => {
    let sortableData = [...data];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [data, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const totalCost = data.reduce((sum, item) => sum + item.cost, 0);
  
  // State for managing companies directly
  const [companies, setCompanies] = useState([]);
  
  // Extract unique companies and create website links
  const companyData = useMemo(() => {
    // Get companies from data items
    const uniqueCompanies = [...new Set(data.map(item => item.company))];
    const dataCompanies = uniqueCompanies
      .filter(company => company) // Filter out empty company names
      .map(company => ({
        name: company,
        website: `https://www.${company.toLowerCase().replace(/\s+/g, '')}.com`
      }));
    
    // Combine with manually added companies, avoiding duplicates
    const allCompanies = [...dataCompanies];
    
    companies.forEach(company => {
      if (!dataCompanies.some(c => c.name === company.name)) {
        allCompanies.push(company);
      }
    });
    
    return allCompanies;
  }, [data, companies]);

  useEffect(() => {
    if (newItemAdded && lastItemRef.current) {
      lastItemRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      setNewItemAdded(false);
    }
  }, [newItemAdded]);

  const addItem = () => {
    const newId = data.length > 0 ? Math.max(...data.map(item => item.id)) + 1 : 1;
    const today = new Date();
    const currentDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    
    const newItem = {
      id: newId,
      description: "New Item",
      company: "",
      ref: "",
      unitPrice: 0,
      quantity: 1,
      cost: 0,
      type: "Small Stuff (glassware, etc..)",
      application: "MX",
      date: currentDate,
      buyer: "Johan",
      req: "",
      po: "",
      reconciled: false
    };
    
    setData([...data, newItem]);
    setNewItemAdded(true);
  };
  
  // Reference for the last company row
  const lastCompanyRef = useRef(null);
  const [newCompanyAdded, setNewCompanyAdded] = useState(false);
  
  // Effect to scroll to newly added company
  useEffect(() => {
    if (newCompanyAdded && lastCompanyRef.current) {
      lastCompanyRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      setNewCompanyAdded(false);
    }
  }, [newCompanyAdded]);
  
  const addCompany = () => {
    const newCompany = {
      name: "New Company",
      website: "https://www.newcomp.com"
    };
    
    setCompanies([...companies, newCompany]);
    setNewCompanyAdded(true);
  };

  return (
    <div className="expenditure-container">
      <div className="table-header">
        <h2>Lab Expenditures 2025</h2>
        <div className="summary-stats">
          <span>Total Items: {data.length}</span>
          <span>Total Cost: {formatCurrency(totalCost)}</span>
        </div>
      </div>
      
      <button 
        className="add-item-button" 
        onClick={addItem}
      >
        + Add New Item
      </button>
      
      <div className="table-wrapper">
        <table className="expenditure-table">
          <thead>
            <tr>
              <th onClick={() => requestSort('description')} className="sortable">
                Description {sortConfig.key === 'description' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => requestSort('company')} className="sortable">
                Company {sortConfig.key === 'company' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => requestSort('ref')} className="sortable">
                Ref {sortConfig.key === 'ref' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => requestSort('unitPrice')} className="sortable">
                Unit Price {sortConfig.key === 'unitPrice' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => requestSort('quantity')} className="sortable">
                Quantity {sortConfig.key === 'quantity' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => requestSort('cost')} className="sortable">
                Cost {sortConfig.key === 'cost' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => requestSort('type')} className="sortable">
                Type {sortConfig.key === 'type' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => requestSort('application')} className="sortable">
                Application {sortConfig.key === 'application' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => requestSort('date')} className="sortable">
                Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => requestSort('buyer')} className="sortable">
                Buyer {sortConfig.key === 'buyer' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => requestSort('req')} className="sortable">
                REQ {sortConfig.key === 'req' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th>PO</th>
              <th>Reconciled</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, index) => (
              <tr 
                key={item.id} 
                ref={index === sortedData.length - 1 ? lastItemRef : null}
              >
                <td className="description-cell" title={item.description}>
                  {item.description}
                </td>
                <td>{item.company}</td>
                <td>{item.ref}</td>
                <td className="currency-cell">{formatCurrency(item.unitPrice)}</td>
                <td className="number-cell">{item.quantity}</td>
                <td className="currency-cell cost-highlight">{formatCurrency(item.cost)}</td>
                <td className="type-cell">{item.type}</td>
                <td className="application-cell">
                  <span className={`app-badge ${item.application.toLowerCase()}`}>
                    {item.application}
                  </span>
                </td>
                <td className="date-cell">{formatDate(item.date)}</td>
                <td>{item.buyer}</td>
                <td className="req-cell">{item.req}</td>
                <td className="po-cell">{item.po}</td>
                <td className="reconciled-cell">
                  <input 
                    type="checkbox" 
                    checked={item.reconciled} 
                    readOnly 
                    className="reconcile-checkbox"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Company Table */}
      <div className="company-section">
        <CompanyTable 
          companies={companyData} 
          onAddCompany={addCompany}
          lastCompanyRef={lastCompanyRef}
        />
      </div>
    </div>
  );
};

export default ExpenditureTable;