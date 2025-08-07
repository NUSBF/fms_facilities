import React, { useState } from 'react';

function CommercialTab({ userData }) {
    return (
        <div>
            <h3>Commercial Services</h3>
            <p>Manage commercial services, contracts, and client relationships.</p>
            <div style={{ 
                backgroundColor: '#e8f5e9', 
                padding: '15px', 
                borderRadius: '4px',
                border: '1px solid #c8e6c9'
            }}>
                <h4>Features to be implemented:</h4>
                <ul>
                    <li>Service catalog and pricing</li>
                    <li>Client management</li>
                    <li>Contract tracking</li>
                    <li>Project scheduling</li>
                    <li>Billing and invoicing integration</li>
                    <li>Performance metrics</li>
                    <li>Client feedback and satisfaction</li>
                    <li>Marketing and promotional materials</li>
                </ul>
            </div>
        </div>
    );
}

export default CommercialTab;