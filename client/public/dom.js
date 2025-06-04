// DOM manipulation

export function updateStatusContent(connected) {
    const icon = document.getElementById('header-status-icon');
    const text = document.getElementById('header-status-text');

    if (connected) {
        icon.src = 'assets/status-online.svg';
        text.textContent = 'Online';
        text.classList.remove('text-red-200');
        text.classList.add('text-white');
    } else {
        icon.src = 'assets/status-offline.svg';
        text.textContent = 'Offline';
        text.classList.remove('text-white');
        text.classList.add('text-red-200');
    }
}

export function updateKPIContent(kpis) {
    document.getElementById('nodes-total').textContent = kpis.total
    document.getElementById('nodes-normal').textContent = kpis.normal
    document.getElementById('nodes-potential-issues').textContent = kpis.potentialIssues
    document.getElementById('nodes-critical').textContent = kpis.critical
}

// Utility for styling a cell based on its key
function getCellClass(key, value) {
    const base = 'px-6 py-4 text-gray-700';
    const classes = [base];

    // Selective font weights
    if (['id', 'status', 'battery'].includes(key)) {
        classes.push('font-semibold');
    }

    // Status text colouring
    if (key === 'status') {
        const statusColor = {
            'Normal': 'text-green-500',
            'Potential Issues': 'text-orange-500',
            'Critical': 'text-red-500'
        }[value];
        if (statusColor) classes.push(statusColor);
    }

    // Battery text colouring
    if (key === 'battery') {
        const batteryVal = parseFloat(String(value).replace('%', ''));
        if (!isNaN(batteryVal)) {
            if (batteryVal >= 60) {
                classes.push('text-green-500');
            } else if (batteryVal >= 30) {
                classes.push('text-orange-500');
            } else {
                classes.push('text-red-500');
            }
        }
    }

    return classes.join(' ');
}

// Utility for formatting units of measurement
function formatValue(key, value) {
    if (key === 'flowRate') return `${value} L/min`;
    if (key === 'pressure') return `${value} bar`;
    if (key === 'battery') return `${value}%`;
    return value;
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