import React, { useState } from 'react';

function SpendingTab({ userData }) {
    return (
        <div>
            <h3>Spending Management</h3>
            <p>Track and manage facility expenditures, budgets, and financial planning.</p>
            <div style={{ 
                backgroundColor: '#fff8e1', 
                padding: '15px', 
                borderRadius: '4px',
                border: '1px solid #ffecb3'
            }}>
                <h4>Features to be implemented:</h4>
                <ul>
                    <li>Budget creation and management</li>
                    <li>Expense tracking and categorization</li>
                    <li>Purchase order management</li>
                    <li>Vendor and supplier management</li>
                    <li>Approval workflows</li>
                    <li>Financial reporting and analytics</li>
                    <li>Budget vs. actual comparisons</li>
                    <li>Cost center allocation</li>
                </ul>
            </div>
        </div>
    );
}

export default SpendingTab;