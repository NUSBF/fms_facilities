import React, { useState } from 'react';

function GrantsTab({ userData }) {
    return (
        <div>
            <h3>Grants Management</h3>
            <p>Track and manage research grants, funding opportunities, and applications.</p>
            <div style={{ 
                backgroundColor: '#e3f2fd', 
                padding: '15px', 
                borderRadius: '4px',
                border: '1px solid #bbdefb'
            }}>
                <h4>Features to be implemented:</h4>
                <ul>
                    <li>Grant opportunity database</li>
                    <li>Application tracking and deadlines</li>
                    <li>Budget management and allocation</li>
                    <li>Progress reporting tools</li>
                    <li>Compliance monitoring</li>
                    <li>Collaborator management</li>
                    <li>Document repository</li>
                    <li>Funding agency requirements</li>
                </ul>
            </div>
        </div>
    );
}

export default GrantsTab;