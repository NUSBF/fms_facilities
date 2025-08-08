import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ColumnsTab({ userData }) {
    const [columns, setColumns] = useState([]);
    const [pdfFiles, setPdfFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    
    // Category options in alphabetical order
    const categoryOptions = [
        "Anion Exchange",
        "Cation Exchange",
        "Gel Filtration",
        "HisTrap"
    ];
    
    // Common styles for table cells and input fields
    const cellStyle = {
        padding: '6px',
        borderRight: '1px solid #dee2e6'
    };
    
    const inputStyles = {
        base: {
            padding: '6px 8px',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            fontSize: '14px',
            boxSizing: 'border-box',
            height: '32px'
        },
        name: { width: '100%' },
        barcode: { width: '100%' },
        category: { width: '100%' },
        type: { width: '100%' },
        catalogNumber: { width: '100%' },
        webLink: { width: '100%' },
        date: { width: '130px' },
        cost: { width: '80px', textAlign: 'right' },
        length: { width: '80px' },
        diameter: { width: '80px' },
        volume: { width: '80px' },
        voidVolume: { width: '80px' },
        pdfFile: { width: '100%' }
    };
    
    // Fetch columns from the database
    // Fetch PDF files from the server
    const fetchPdfFiles = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            
            const response = await axios.get('/fms-api/file-uploads', config);
            // Filter only PDF files
            const pdfFilesOnly = response.data.filter(file => 
                file.file_type === 'application/pdf' || 
                file.original_name.toLowerCase().endsWith('.pdf')
            );
            setPdfFiles(pdfFilesOnly);
        } catch (err) {
            console.error('Error fetching PDF files:', err);
        }
    };

    useEffect(() => {
        const fetchColumns = async () => {
            try {
                setLoading(true);
                setError('');
                
                const token = localStorage.getItem('token');
                if (!token) {
                    setLoading(false);
                    return;
                }
                
                const config = {
                    headers: { Authorization: `Bearer ${token}` }
                };
                
                const response = await axios.get('/fms-api/columns', config);
                // Initialize all columns with isEditing set to false
                const initializedColumns = response.data.map(column => ({
                    ...column,
                    isEditing: false,
                    isNew: false
                }));
                setColumns(initializedColumns);
                setLoading(false);
                
                // Fetch PDF files after columns are loaded
                fetchPdfFiles();
            } catch (err) {
                console.error('Error fetching columns:', err);
                if (err.response && err.response.data && err.response.data.error) {
                    if (err.response.data.error.includes('Columns table does not exist')) {
                        setError('Failed to fetch columns: The columns table does not exist in the database. Please contact the database administrator to run the create-table.js script.');
                    } else {
                        setError(`Failed to fetch columns: ${err.response.data.error}`);
                    }
                } else if (err.request) {
                    // Request was made but no response received
                    setError('Failed to fetch columns: No response from server. Please check your network connection.');
                } else {
                    // Error in setting up the request
                    setError(`Failed to fetch columns: ${err.message || 'Unknown error'}`);
                }
                setLoading(false);
            }
        };
        
        fetchColumns();
    }, []);
    
    // Update column field in both local state and database
    const updateColumnField = async (column, fieldName, value) => {
        // Create updated column object
        const updatedColumn = {...column, [fieldName]: value};
        
        // If length or diameter is updated, recalculate volume
        let calculatedVolume = updatedColumn.volume;
        if (fieldName === 'length' || fieldName === 'diameter') {
            if (updatedColumn.length && updatedColumn.diameter) {
                calculatedVolume = (Math.PI * Math.pow(updatedColumn.diameter/2, 2) * updatedColumn.length).toFixed(2);
                updatedColumn.volume = calculatedVolume;
            } else {
                updatedColumn.volume = '';
            }
        }
        
        // Update local state immediately for responsive UI
        const updatedColumns = columns.map(c => 
            c.id === column.id ? updatedColumn : c
        );
        setColumns(updatedColumns);
        
        // Then update in database
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            
            // Create a properly formatted object with all required fields
            const columnToUpdate = {
                name: updatedColumn.name,
                barcode: updatedColumn.barcode,
                category: updatedColumn.category,
                type: updatedColumn.type,
                catalogNumber: updatedColumn.catalogNumber,
                webLink: updatedColumn.webLink,
                purchaseDate: updatedColumn.purchaseDate,
                cost: updatedColumn.cost,
                length: updatedColumn.length,
                diameter: updatedColumn.diameter,
                volume: updatedColumn.volume, // This will be the calculated volume if length or diameter changed
                voidVolume: updatedColumn.voidVolume,
                pdfFileId: updatedColumn.pdfFileId
            };
            await axios.put(`/fms-api/columns/${column.id}`, columnToUpdate, config);
        } catch (err) {
            console.error(`Error updating column:`, err);
            // If database update fails, we could revert the local state change
            // but for simplicity we'll just log the error
        }
    };
    
    // Delete column from both local state and database
    const deleteColumn = async (columnId) => {
        // Find the column to check if it's a new, unsaved row
        const columnToDelete = columns.find(column => column.id === columnId);
        
        // Update local state immediately
        setColumns(columns.filter(column => column.id !== columnId));
        
        // If it's a new row (with a temporary ID), no need to delete from database
        if (columnToDelete && columnToDelete.isNew) {
            return;
        }
        
        // Otherwise delete from database
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            
            await axios.delete(`/fms-api/columns/${columnId}`, config);
        } catch (err) {
            console.error('Error deleting column:', err);
            setError('Failed to delete column');
            // If database delete fails, we could revert the local state change
            // but for simplicity we'll just log the error
        }
    };
    
    // Add new column to UI only (no database interaction)
    const addNewColumn = () => {
        // Create a new column with a temporary ID
        const newColumn = {
            id: `temp_${Date.now()}`, // Temporary ID with prefix to distinguish from DB IDs
            name: '',
            barcode: '',
            category: '',
            type: '',
            catalogNumber: '',
            webLink: '',
            purchaseDate: '',
            cost: '',
            length: '',
            diameter: '',
            volume: '', // Volume will be calculated automatically when length and diameter are provided
            voidVolume: '',
            pdfFileId: null,
            pdfFileName: '',
            pdfFilePath: '',
            isNew: true, // Flag to indicate this is a new, unsaved row
            isEditing: true // Start in editing mode
        };
        
        // Add to local state only
        setColumns([...columns, newColumn]);
    };

    return (
        <div>
            <h3>Columns</h3>
            
            {error && (
                <div style={{ 
                    backgroundColor: '#f8d7da', 
                    color: '#721c24', 
                    padding: '15px', 
                    borderRadius: '4px', 
                    marginBottom: '15px',
                    border: '1px solid #f5c6cb'
                }}>
                    <h4 style={{ marginTop: 0 }}>Error</h4>
                    <p>{error}</p>
                    {error.includes('Columns table does not exist') && (
                        <div>
                            <p><strong>Database Administrator Action Required:</strong></p>
                            <p>The columns table needs to be created in the database. Follow these steps:</p>
                            <ol style={{ marginLeft: '20px' }}>
                                <li>Connect to the nusbf server:
                                    <pre style={{ 
                                        backgroundColor: '#f8f9fa', 
                                        padding: '10px', 
                                        borderRadius: '4px',
                                        overflowX: 'auto',
                                        marginTop: '5px'
                                    }}>
                                        nusbf
                                    </pre>
                                </li>
                                <li>Navigate to the backend directory:
                                    <pre style={{ 
                                        backgroundColor: '#f8f9fa', 
                                        padding: '10px', 
                                        borderRadius: '4px',
                                        overflowX: 'auto',
                                        marginTop: '5px'
                                    }}>
                                        cd /home/linuxhomes/namlb/Documents/React/fms_facilities/fms_backend
                                    </pre>
                                </li>
                                <li>Run the script to create the table:
                                    <pre style={{ 
                                        backgroundColor: '#f8f9fa', 
                                        padding: '10px', 
                                        borderRadius: '4px',
                                        overflowX: 'auto',
                                        marginTop: '5px'
                                    }}>
                                        node create-table.js
                                    </pre>
                                </li>
                            </ol>
                        </div>
                    )}
                </div>
            )}
            
            <div style={{ marginBottom: '20px' }}>
                <button 
                    onClick={addNewColumn}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                    disabled={loading}
                >
                    {loading ? 'Adding...' : 'Add New Column'}
                </button>
            </div>
            
            {loading && columns.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    Loading columns data...
                </div>
            )}
            
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                            <th style={{...cellStyle, textAlign: 'left', fontWeight: 'bold' }}>Column Name</th>
                            <th style={{...cellStyle, textAlign: 'left', fontWeight: 'bold' }}>Barcode</th>
                            <th style={{...cellStyle, textAlign: 'left', fontWeight: 'bold' }}>Category</th>
                            <th style={{...cellStyle, textAlign: 'left', fontWeight: 'bold' }}>Type</th>
                            <th style={{...cellStyle, textAlign: 'left', fontWeight: 'bold' }}>Catalog Number</th>
                            <th style={{...cellStyle, textAlign: 'left', fontWeight: 'bold' }}>Web Link</th>
                            <th style={{...cellStyle, textAlign: 'left', fontWeight: 'bold' }}>Date of Purchase</th>
                            <th style={{...cellStyle, textAlign: 'left', fontWeight: 'bold' }}>Cost (£)</th>
                            <th style={{...cellStyle, textAlign: 'left', fontWeight: 'bold' }}>Length (cm)</th>
                            <th style={{...cellStyle, textAlign: 'left', fontWeight: 'bold' }}>Diameter (cm)</th>
                            <th style={{...cellStyle, textAlign: 'left', fontWeight: 'bold' }}>Volume (ml)</th>
                            <th style={{...cellStyle, textAlign: 'left', fontWeight: 'bold' }}>Void Volume (Vo) (ml)</th>
                            <th style={{...cellStyle, textAlign: 'left', fontWeight: 'bold' }}>PDF File</th>
                            <th style={{ padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {columns.map((column) => (
                            <tr key={column.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                                <td style={cellStyle}>
                                    <input 
                                        type="text" 
                                        value={column.name} 
                                        onChange={(e) => {
                                            const updatedColumns = columns.map(c => 
                                                c.id === column.id ? {...c, name: e.target.value} : c
                                            );
                                            setColumns(updatedColumns);
                                            // Only update database if not in editing mode
                                            if (!column.isEditing) {
                                                updateColumnField(column, 'name', e.target.value);
                                            }
                                        }}
                                        readOnly={!column.isEditing}
                                        style={{
                                            ...inputStyles.base, 
                                            ...inputStyles.name,
                                            backgroundColor: column.isEditing ? '#ffffff' : '#f8f9fa',
                                            cursor: column.isEditing ? 'text' : 'default'
                                        }}
                                    />
                                </td>
                                <td style={cellStyle}>
                                    <input 
                                        type="text" 
                                        value={column.barcode || ''} 
                                        onChange={(e) => {
                                            const updatedColumns = columns.map(c => 
                                                c.id === column.id ? {...c, barcode: e.target.value} : c
                                            );
                                            setColumns(updatedColumns);
                                            // Only update database if not in editing mode
                                            if (!column.isEditing) {
                                                updateColumnField(column, 'barcode', e.target.value);
                                            }
                                        }}
                                        readOnly={!column.isEditing}
                                        style={{
                                            ...inputStyles.base, 
                                            ...inputStyles.barcode,
                                            backgroundColor: column.isEditing ? '#ffffff' : '#f8f9fa',
                                            cursor: column.isEditing ? 'text' : 'default'
                                        }}
                                    />
                                </td>
                                <td style={cellStyle}>
                                    {column.isEditing ? (
                                        <select
                                            value={column.category}
                                            onChange={(e) => {
                                                const updatedColumns = columns.map(c => 
                                                    c.id === column.id ? {...c, category: e.target.value} : c
                                                );
                                                setColumns(updatedColumns);
                                                if (!column.isEditing) {
                                                    updateColumnField(column, 'category', e.target.value);
                                                }
                                            }}
                                            style={{
                                                ...inputStyles.base, 
                                                ...inputStyles.category,
                                                backgroundColor: '#ffffff',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <option value="">Select a category</option>
                                            {categoryOptions.map(option => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input 
                                            type="text" 
                                            value={column.category} 
                                            readOnly={true}
                                            style={{
                                                ...inputStyles.base, 
                                                ...inputStyles.category,
                                                backgroundColor: '#f8f9fa',
                                                cursor: 'default'
                                            }}
                                        />
                                    )}
                                </td>
                                <td style={cellStyle}>
                                    <input 
                                        type="text" 
                                        value={column.type} 
                                        onChange={(e) => {
                                            const updatedColumns = columns.map(c => 
                                                c.id === column.id ? {...c, type: e.target.value} : c
                                            );
                                            setColumns(updatedColumns);
                                            if (!column.isEditing) {
                                                updateColumnField(column, 'type', e.target.value);
                                            }
                                        }}
                                        readOnly={!column.isEditing}
                                        style={{
                                            ...inputStyles.base, 
                                            ...inputStyles.type,
                                            backgroundColor: column.isEditing ? '#ffffff' : '#f8f9fa',
                                            cursor: column.isEditing ? 'text' : 'default'
                                        }}
                                    />
                                </td>
                                <td style={cellStyle}>
                                    <input 
                                        type="text" 
                                        value={column.catalogNumber} 
                                        onChange={(e) => {
                                            const updatedColumns = columns.map(c => 
                                                c.id === column.id ? {...c, catalogNumber: e.target.value} : c
                                            );
                                            setColumns(updatedColumns);
                                            if (!column.isEditing) {
                                                updateColumnField(column, 'catalogNumber', e.target.value);
                                            }
                                        }}
                                        readOnly={!column.isEditing}
                                        style={{
                                            ...inputStyles.base, 
                                            ...inputStyles.catalogNumber,
                                            backgroundColor: column.isEditing ? '#ffffff' : '#f8f9fa',
                                            cursor: column.isEditing ? 'text' : 'default'
                                        }}
                                    />
                                </td>
                                <td style={cellStyle}>
                                    <input 
                                        type="text" 
                                        value={column.webLink} 
                                        onChange={(e) => {
                                            const updatedColumns = columns.map(c => 
                                                c.id === column.id ? {...c, webLink: e.target.value} : c
                                            );
                                            setColumns(updatedColumns);
                                            if (!column.isEditing) {
                                                updateColumnField(column, 'webLink', e.target.value);
                                            }
                                        }}
                                        readOnly={!column.isEditing}
                                        style={{
                                            ...inputStyles.base, 
                                            ...inputStyles.webLink,
                                            backgroundColor: column.isEditing ? '#ffffff' : '#f8f9fa',
                                            cursor: column.isEditing ? 'text' : 'default'
                                        }}
                                    />
                                </td>
                                <td style={cellStyle}>
                                    <input 
                                        type="date" 
                                        value={column.purchaseDate} 
                                        onChange={(e) => {
                                            const updatedColumns = columns.map(c => 
                                                c.id === column.id ? {...c, purchaseDate: e.target.value} : c
                                            );
                                            setColumns(updatedColumns);
                                            if (!column.isEditing) {
                                                updateColumnField(column, 'purchaseDate', e.target.value);
                                            }
                                        }}
                                        readOnly={!column.isEditing}
                                        style={{
                                            ...inputStyles.base, 
                                            ...inputStyles.date,
                                            backgroundColor: column.isEditing ? '#ffffff' : '#f8f9fa',
                                            cursor: column.isEditing ? 'text' : 'default'
                                        }}
                                    />
                                </td>
                                <td style={cellStyle}>
                                    <input 
                                        type="number" 
                                        value={column.cost} 
                                        onChange={(e) => {
                                            const updatedColumns = columns.map(c => 
                                                c.id === column.id ? {...c, cost: e.target.value} : c
                                            );
                                            setColumns(updatedColumns);
                                            if (!column.isEditing) {
                                                updateColumnField(column, 'cost', e.target.value);
                                            }
                                        }}
                                        readOnly={!column.isEditing}
                                        style={{
                                            ...inputStyles.base, 
                                            ...inputStyles.cost,
                                            backgroundColor: column.isEditing ? '#ffffff' : '#f8f9fa',
                                            cursor: column.isEditing ? 'text' : 'default'
                                        }}
                                    />
                                </td>
                                <td style={cellStyle}>
                                    <input 
                                        type="text" 
                                        value={column.length} 
                                        onChange={(e) => {
                                            const updatedColumns = columns.map(c => 
                                                c.id === column.id ? {...c, length: e.target.value} : c
                                            );
                                            setColumns(updatedColumns);
                                            if (!column.isEditing) {
                                                updateColumnField(column, 'length', e.target.value);
                                            }
                                        }}
                                        readOnly={!column.isEditing}
                                        style={{
                                            ...inputStyles.base, 
                                            ...inputStyles.length,
                                            backgroundColor: column.isEditing ? '#ffffff' : '#f8f9fa',
                                            cursor: column.isEditing ? 'text' : 'default'
                                        }}
                                    />
                                </td>
                                <td style={cellStyle}>
                                    <input 
                                        type="text" 
                                        value={column.diameter} 
                                        onChange={(e) => {
                                            const updatedColumns = columns.map(c => 
                                                c.id === column.id ? {...c, diameter: e.target.value} : c
                                            );
                                            setColumns(updatedColumns);
                                            if (!column.isEditing) {
                                                updateColumnField(column, 'diameter', e.target.value);
                                            }
                                        }}
                                        readOnly={!column.isEditing}
                                        style={{
                                            ...inputStyles.base, 
                                            ...inputStyles.diameter,
                                            backgroundColor: column.isEditing ? '#ffffff' : '#f8f9fa',
                                            cursor: column.isEditing ? 'text' : 'default'
                                        }}
                                    />
                                </td>
                                <td style={cellStyle}>
                                    <input 
                                        type="text" 
                                        value={
                                            // Calculate volume from length and diameter: π * r² * length
                                            // where r = diameter/2
                                            column.length && column.diameter 
                                                ? (Math.PI * Math.pow(column.diameter/2, 2) * column.length).toFixed(2)
                                                : ''
                                        } 
                                        readOnly={true}
                                        style={{
                                            ...inputStyles.base, 
                                            ...inputStyles.volume,
                                            backgroundColor: '#f8f9fa',
                                            cursor: 'default'
                                        }}
                                    />
                                </td>
                                <td style={cellStyle}>
                                    <input 
                                        type="text" 
                                        value={column.voidVolume} 
                                        onChange={(e) => {
                                            const updatedColumns = columns.map(c => 
                                                c.id === column.id ? {...c, voidVolume: e.target.value} : c
                                            );
                                            setColumns(updatedColumns);
                                            if (!column.isEditing) {
                                                updateColumnField(column, 'voidVolume', e.target.value);
                                            }
                                        }}
                                        readOnly={!column.isEditing}
                                        style={{
                                            ...inputStyles.base, 
                                            ...inputStyles.voidVolume,
                                            backgroundColor: column.isEditing ? '#ffffff' : '#f8f9fa',
                                            cursor: column.isEditing ? 'text' : 'default'
                                        }}
                                    />
                                </td>
                                <td style={cellStyle}>
                                    {column.isEditing ? (
                                        <select
                                            value={column.pdfFileId || ''}
                                            onChange={(e) => {
                                                const updatedColumns = columns.map(c => 
                                                    c.id === column.id ? {
                                                        ...c, 
                                                        pdfFileId: e.target.value ? parseInt(e.target.value) : null,
                                                        pdfFileName: e.target.value ? 
                                                            pdfFiles.find(file => file.id === parseInt(e.target.value))?.original_name || '' : '',
                                                        pdfFilePath: e.target.value ? 
                                                            pdfFiles.find(file => file.id === parseInt(e.target.value))?.file_path || '' : ''
                                                    } : c
                                                );
                                                setColumns(updatedColumns);
                                                if (!column.isEditing) {
                                                    updateColumnField(column, 'pdfFileId', e.target.value ? parseInt(e.target.value) : null);
                                                }
                                            }}
                                            style={{
                                                ...inputStyles.base, 
                                                ...inputStyles.pdfFile,
                                                backgroundColor: '#ffffff',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <option value="">Select a PDF file</option>
                                            {pdfFiles.map(file => (
                                                <option key={file.id} value={file.id}>
                                                    {file.original_name}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        column.pdfFileName ? (
                                            <a 
                                                href={column.pdfFilePath} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                style={{
                                                    color: '#007bff',
                                                    textDecoration: 'none',
                                                    display: 'block',
                                                    padding: '6px 8px',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {column.pdfFileName}
                                            </a>
                                        ) : (
                                            <span style={{
                                                display: 'block',
                                                padding: '6px 8px',
                                                color: '#6c757d',
                                                fontStyle: 'italic'
                                            }}>
                                                No PDF file
                                            </span>
                                        )
                                    )}
                                </td>
                                <td style={{ padding: '6px', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
                                        {column.isEditing ? (
                                            <button
                                                onClick={async () => {
                                                    // Save to database
                                                    try {
                                                        setError('');
                                                        setSaving(true);
                                                        
                                                        const token = localStorage.getItem('token');
                                                        if (!token) {
                                                            setSaving(false);
                                                            return;
                                                        }
                                                        
                                                        const config = {
                                                            headers: { Authorization: `Bearer ${token}` }
                                                        };
                                                        
                                                        // For new columns, create in database
                                                        if (column.isNew) {
                                                            try {
                                                                // Calculate volume from length and diameter
                                                                const calculatedVolume = column.length && column.diameter 
                                                                    ? (Math.PI * Math.pow(column.diameter/2, 2) * column.length).toFixed(2)
                                                                    : '';
                                                                
                                                                const response = await axios.post('/fms-api/columns', {
                                                                    name: column.name,
                                                                    barcode: column.barcode,
                                                                    category: column.category,
                                                                    type: column.type,
                                                                    catalogNumber: column.catalogNumber,
                                                                    webLink: column.webLink,
                                                                    purchaseDate: column.purchaseDate,
                                                                    cost: column.cost,
                                                                    length: column.length,
                                                                    diameter: column.diameter,
                                                                    volume: calculatedVolume, // Use calculated volume
                                                                    voidVolume: column.voidVolume,
                                                                    pdfFileId: column.pdfFileId
                                                                }, config);
                                                                
                                                                // Replace the temporary column with the one from the server
                                                                setColumns(columns.map(c => 
                                                                    c.id === column.id ? {...response.data, isEditing: false} : c
                                                                ));
                                                            } catch (postErr) {
                                                                console.error('Error creating column:', postErr);
                                                                throw postErr; // Re-throw to be caught by the outer catch
                                                            }
                                                        } else {
                                                            // For existing columns, update in database
                                                            // Calculate volume from length and diameter
                                                            const calculatedVolume = column.length && column.diameter 
                                                                ? (Math.PI * Math.pow(column.diameter/2, 2) * column.length).toFixed(2)
                                                                : '';
                                                                
                                                            await axios.put(`/fms-api/columns/${column.id}`, {
                                                                name: column.name,
                                                                barcode: column.barcode,
                                                                category: column.category,
                                                                type: column.type,
                                                                catalogNumber: column.catalogNumber,
                                                                webLink: column.webLink,
                                                                purchaseDate: column.purchaseDate,
                                                                cost: column.cost,
                                                                length: column.length,
                                                                diameter: column.diameter,
                                                                volume: calculatedVolume, // Use calculated volume
                                                                voidVolume: column.voidVolume,
                                                                pdfFileId: column.pdfFileId
                                                            }, config);
                                                            
                                                            // Update local state to exit editing mode
                                                            setColumns(columns.map(c => 
                                                                c.id === column.id ? {...c, isEditing: false} : c
                                                            ));
                                                        }
                                                        setSaving(false);
                                                    } catch (err) {
                                                        console.error('Error saving column:', err);
                                                        if (err.response && err.response.data && err.response.data.error) {
                                                            if (err.response.data.error.includes('Columns table does not exist')) {
                                                                setError('Failed to save column: The columns table does not exist in the database. Please contact the database administrator to run the create-table.js script.');
                                                            } else {
                                                                setError(`Failed to save column: ${err.response.data.error}`);
                                                                console.error('Server error details:', err.response.data.error);
                                                            }
                                                        } else if (err.request) {
                                                            // Request was made but no response received
                                                            setError('Failed to save column: No response from server. Please check your network connection.');
                                                        } else {
                                                            // Error in setting up the request
                                                            setError(`Failed to save column: ${err.message || 'Unknown error'}`);
                                                        }
                                                        
                                                        // Clear error after 10 seconds
                                                        setTimeout(() => {
                                                            setError('');
                                                        }, 10000);
                                                        setSaving(false);
                                                    }
                                                }}
                                                style={{
                                                    padding: '4px 8px',
                                                    backgroundColor: '#28a745',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '3px',
                                                    cursor: saving ? 'wait' : 'pointer',
                                                    fontSize: '12px',
                                                    opacity: saving ? 0.7 : 1,
                                                    position: 'relative',
                                                    minWidth: '70px'
                                                }}
                                                disabled={saving}
                                            >
                                                {saving ? (
                                                    <>
                                                        <span style={{ 
                                                            display: 'inline-block',
                                                            width: '10px',
                                                            height: '10px',
                                                            borderRadius: '50%',
                                                            border: '2px solid #ffffff',
                                                            borderTopColor: 'transparent',
                                                            animation: 'spin 1s linear infinite',
                                                            marginRight: '5px',
                                                            verticalAlign: 'middle'
                                                        }} />
                                                        <style>
                                                            {`
                                                            @keyframes spin {
                                                                0% { transform: rotate(0deg); }
                                                                100% { transform: rotate(360deg); }
                                                            }
                                                            `}
                                                        </style>
                                                        Saving...
                                                    </>
                                                ) : 'Save'}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    // Enter edit mode
                                                    setColumns(columns.map(c => 
                                                        c.id === column.id ? {...c, isEditing: true} : c
                                                    ));
                                                }}
                                                style={{
                                                    padding: '4px 8px',
                                                    backgroundColor: '#007bff',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '3px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                Edit
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteColumn(column.id)}
                                            style={{
                                                padding: '4px 8px',
                                                backgroundColor: '#dc3545',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '3px',
                                                cursor: 'pointer',
                                                fontSize: '12px'
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {columns.length === 0 && (
                            <tr>
                                <td colSpan="12" style={{ padding: '12px', textAlign: 'center' }}>
                                    No columns added yet. Click "Add New Column" to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ColumnsTab;