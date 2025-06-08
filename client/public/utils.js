import { formatValue } from './nodeFormatter.js'

// Applies a filter to a set of nodes with respect to formatted values
export function filterNodes(nodes, filter) {
    if (!filter || !filter.column || !filter.value) return nodes;
    
    return nodes.filter(node => {
        let field = formatValue(filter.column, node[filter.column]); // Get field value as formatted for client
        return field
            ?.toString()
            ?.toLowerCase()
            ?.includes(filter.value.toLowerCase()) ?? false;
    });
}

export function exportToCSV(nodes, filter) {
    nodes = filterNodes(nodes, filter);
    const CSVRows = []

    // Headers
    const headers = Object.keys(nodes[0]);
    CSVRows.push(headers.join(','));

    // Nodes
    for (const node of nodes) {
        const values = headers.map(header => {
            const val = node[header];
            return typeof val === 'string' ? val.replace(',','') : val;
        });

        CSVRows.push(values.join(','));
    }

    // Create BLOB
    console.info(CSVRows);
    const CSVBlob = new Blob([CSVRows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(CSVBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'node-data-' + getDateText();
    a.click();
    URL.revokeObjectURL(url);
}

// Returns time since a given data object as <x><s,m,h> ago
export function formatTime(date) {
    if (!date) return 'Never';
    
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds == 0) return 'Just now'
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
}

// 
export function toTitleCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getDateText() {
    const current = new Date;

    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0'); 
    const day = String(current.getDate()).padStart(2, '0');
    const hour = String(current.getHours()).padStart(2, '0');
    const minute = String(current.getMinutes()).padStart(2, '0');
    const second = String(current.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}-${hour}-${minute}-${second}`
}