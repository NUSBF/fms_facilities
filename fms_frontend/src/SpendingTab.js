import React, { useState } from 'react';
import ExpenditureTable from './ExpenditureTable';

function SpendingTab({ userData }) {
    const [activeSpendingTab, setActiveSpendingTab] = useState('2025-2026');
    const [financialYears, setFinancialYears] = useState(['2025-2026']);

    const addNewFinancialYear = () => {
        // Get the latest year from the last tab
        const latestTab = financialYears[financialYears.length - 1];
        const latestStartYear = parseInt(latestTab.split('-')[0]);
        const newStartYear = latestStartYear + 1;
        const newEndYear = newStartYear + 1;
        const newYearTab = `${newStartYear}-${newEndYear}`;

        setFinancialYears([...financialYears, newYearTab]);
        setActiveSpendingTab(newYearTab);
    };

    return (
        <div>
            <h3>Spending Management</h3>
            <p>Track and manage facility expenditures, budgets, and financial planning.</p>
            
            <div style={{ display: 'flex', borderBottom: '1px solid #dee2e6', marginBottom: '20px', backgroundColor: '#f8f9fa' }}>
                {financialYears.map((year) => (
                    <div
                        key={year}
                        onClick={() => setActiveSpendingTab(year)}
                        style={{
                            padding: '10px 20px',
                            cursor: 'pointer',
                            backgroundColor: activeSpendingTab === year ? '#ffffff' : 'transparent',
                            fontWeight: activeSpendingTab === year ? 'bold' : 'normal',
                            border: activeSpendingTab === year ? '1px solid #dee2e6' : 'none',
                            borderBottom: activeSpendingTab === year ? 'none' : '1px solid #dee2e6'
                        }}
                    >
                        {year}
                    </div>
                ))}
                <div
                    onClick={addNewFinancialYear}
                    style={{
                        padding: '10px 15px',
                        cursor: 'pointer',
                        backgroundColor: 'transparent',
                        border: '1px solid #dee2e6',
                        borderBottom: '1px solid #dee2e6',
                        color: '#007bff',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    title="Add new financial year"
                >
                    +
                </div>
            </div>
            
            <div style={{ backgroundColor: '#ffffff', padding: '20px', border: '1px solid #dee2e6', borderRadius: '0 0 4px 4px' }}>
                {financialYears.map((year) => (
                    activeSpendingTab === year && (
                        <div key={year}>
                            <ExpenditureTable />
                        </div>
                    )
                ))}
            </div>
        </div>
    );
}

export default SpendingTab;