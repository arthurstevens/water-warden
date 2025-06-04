// DOM manipulation
import { formatValue, getCellClass } from './nodeFormatter.js';

export function updateConnectedStatusContent(connected) {
    const icon = document.getElementById('header-status-icon');
    const text = document.getElementById('header-status-text');

    if (connected) {
        icon.src = 'assets/status-online.svg';
        icon.alt = 'Connected icon';
        text.textContent = 'Online';
        text.classList.remove('text-red-200');
        text.classList.add('text-white');
    } else {
        icon.src = 'assets/status-offline.svg';
        icon.alt = 'Disconnected icon';
        text.textContent = 'Offline';
        text.classList.remove('text-white');
        text.classList.add('text-red-200');
    }
}

export function updateKPIContent(nodes) {
    const total = nodes.length;
    const severity1 = nodes.filter(n => n.status === 1).length;
    const severity2 = nodes.filter(n => n.status === 2).length;
    const severity3 = nodes.filter(n => n.status === 3).length;

    document.getElementById('nodes-total').textContent = total;
    document.getElementById('nodes-severity-1').textContent = severity1;
    document.getElementById('nodes-severity-2').textContent = severity2;
    document.getElementById('nodes-severity-3').textContent = severity3;
}

// Clears and re-populates the node table and its headers from a nodes list
export function updateTableContent(nodes) {
    const tableHeaders = document.getElementById('node-table-headers');
    const tableBody = document.getElementById('node-table-body');
    
    // Clear existing table data
    tableHeaders.innerHTML = '';
    tableBody.innerHTML = '';

    // Edge case: no node data
    if (!nodes || nodes.lengths === 0) {
        tableBody.innerHTML = '<tr><td colspan="100%">No available data</td></tr>';
    }

    // Update headers
    const headers = Object.keys(nodes[0])

    for (const header of headers) {
        const th = document.createElement('th');
        th.textContent = header;
        th.className = 'px-6 py-3 whitespace-nowrap min-w-[100px]';
        tableHeaders.appendChild(th);
    }

    // Update node data rows
    for (const node of nodes) {
        const row = tableBody.insertRow();
        row.className = 'hover:bg-gray-50';

        for (const [key, value] of Object.entries(node)) {
            const cell = row.insertCell();
            cell.textContent = formatValue(key, value);
            cell.className = getCellClass(key, value);
        }
    }
}

// Updates the text content for the 'Last updated' status in header
export function updateLastUpdatedContent(lastUpdatedText) {
    const lastUpdated = document.getElementById('header-last-updated');
    lastUpdated.textContent = lastUpdatedText;
} 

export function updateAlertContent(alert) {
    const alertContainer = document.getElementById('alert-container');
    const alertImage = document.getElementById('alert-img');
    const alertHeading = document.getElementById('alert-heading');
    const alertContent = document.getElementById('alert-content');

    // Set text content
    alertHeading.textContent = alert.heading + ':';
    alertContent.textContent = alert.content;

    // Severity style mapping
    const styleMap = {
        0 : { colour: 'gray', img: 'loading-icon.svg'},
        1 : { colour: 'green', img: 'status-ok-icon.svg'},
        2 : { colour: 'yellow', img: 'status-warning-icon.svg'},
        3 : { colour: 'red', img: 'status-warning-icon.svg'}
    };

    // Remove any existing style classes
    for (const { colour } of Object.values(styleMap)) {
        alertContainer.classList.remove(`border-${colour}-600`, `bg-${colour}-50`);
        alertHeading.classList.remove(`text-${colour}-800`);
        alertContent.classList.remove(`text-${colour}-800`);
    }

    // Apply new style classes
    const style = styleMap[alert.severity];
    alertContainer.classList.add(`border-${style.colour}-600`, `bg-${style.colour}-50`);
    alertHeading.classList.add(`text-${style.colour}-800`);
    alertContent.classList.add(`text-${style.colour}-800`);
    alertImage.src = `/assets/${style.img}`;
}