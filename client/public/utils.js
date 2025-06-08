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