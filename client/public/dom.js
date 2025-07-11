// DOM manipulation
import { filterNodes, toTitleCase } from './utils.js';
import { formatValue, getCellClass } from './nodeFormatter.js';

// Adjusts connected status from bool
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

// Updates node KPIs per severity level from a set of nodes
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
export function updateTableContent(nodes, filter) {
    const tableHeaders = document.getElementById('node-table-headers');
    const tableBody = document.getElementById('node-table-body');
    
    // Always clear the node data
    tableBody.innerHTML = '';

    nodes = filterNodes(nodes, filter)
    if (!nodes || nodes.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="100%" class="px-6 py-4 text-gray-700 font-semibold text-lg text-center">No available data</td></tr>';
        return;
    }

    // Only clear headers if they can be set again
    tableHeaders.innerHTML = '';
    
    // Update headers
    const headers = Object.keys(nodes[0]);
    let formattedHeaders = []
    for (const header of headers) {
        formattedHeaders.push(toTitleCase(header));
    }

    for (const header of formattedHeaders) {
        const th = document.createElement('th');
        th.textContent = header;
        th.className = 'px-6 py-3 whitespace-nowrap min-w-[100px]';
        tableHeaders.appendChild(th);
    }

    // Update node data rows
    for (const node of nodes) {
        const row = tableBody.insertRow();
        row.className = 'hover:bg-gray-100';

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

// Updates alert content, image, and styling 
export function updateAlertContent(alerts) {
    const alertsContainer = document.getElementById('alerts-container');
    alertsContainer.innerHTML = '';

    // Set message if no alerts provided
    if (!alerts || alerts.length === 0) {
        alerts = [{
                heading: 'Nothing New', 
                content: 'There are no active alerts or announcements.', 
                severity: 1,
                initialTime: null,
                expiry: null
        }];
    }
    
    for (const alert of alerts) {
        // Initialise elements and relationships
        const alertContainer = document.createElement('section');
        const alertImage = document.createElement('img');
        const alertHeading = document.createElement('p');
        const alertContent = document.createElement('p');
        alertContainer.className = "w-full flex items-center gap-3 p-3 w-full border-solid border-2 rounded-lg";
        alertImage.className = "w-5 h-5";
        alertHeading.className = "font-bold sm:text-nowrap";
        alertContent.className = "w-full";
        alertContainer.appendChild(alertImage);
        alertContainer.appendChild(alertHeading);
        alertContainer.appendChild(alertContent);
        
        // Format content
        let alertHTMLContent = alert.content;

        if (alert.initialTime && alert.expiry) {
            alert.initialTime = new Date(alert.initialTime);
            alert.expiry = new Date(alert.expiry);
            alertHTMLContent += `<br><hr><i>${alert.initialTime.toLocaleString()} → ${alert.expiry.toLocaleString()}</i>`;
        }

        // Set text content
        alertHeading.textContent = alert.heading + ':';
        alertContent.innerHTML = alertHTMLContent;

        // Severity style mapping
        const styleMap = {
            0 : { colour: 'gray', img: 'loading-icon.svg'},
            1 : { colour: 'green', img: 'status-ok-icon.svg'},
            2 : { colour: 'yellow', img: 'status-warning-icon.svg'},
            3 : { colour: 'red', img: 'status-warning-icon.svg'}
        };

        // Apply style classes and set image
        const style = styleMap[alert.severity];
        alertContainer.classList.add(`border-${style.colour}-600`, `bg-${style.colour}-50`);
        alertHeading.classList.add(`text-${style.colour}-800`);
        alertContent.classList.add(`text-${style.colour}-800`);
        alertImage.src = `/assets/${style.img}`;

        alertsContainer.appendChild(alertContainer);
    }

}

// Updates error content
export function updateErrorContent(alert) {
    const errorContainer = document.getElementById('error-container');
    const errorImage = document.getElementById('error-img');
    const errorHeading = document.getElementById('error-heading');
    const errorContent = document.getElementById('error-content');
    
    // Set visibily 
    if (!alert) {
        errorContainer.classList.add("hidden");
        return;
    }
    errorContainer.classList.remove("hidden");

    // Set text content
    errorHeading.textContent = alert.heading + ':';
    errorContent.textContent = alert.content;

    // Set image
    errorImage.src = {
        true: 'assets/loading-icon.svg',
        false: 'assets/status-warning-icon.svg'
    }[alert.processing];
}

// Sets up column selections for filtering node table
export function setTableFilterColumns(nodes) {
    if (nodes.length === 0) return;

    const filterColumnSelection = document.getElementById('node-filter-column');
    const headers = Object.keys(nodes[0]);

    headers.forEach(header => {
        const option = document.createElement('option');
        option.value = header;
        option.textContent = toTitleCase(header);
        filterColumnSelection.appendChild(option);
    });
}