import { fetchNodeData } from './api.js';
import { 
    updateConnectedStatusContent, 
    updateKPIContent, 
    updateTableContent, 
    updateLastUpdatedContent, 
    updateAlertContent, 
    updateErrorContent,
    setTableFilterColumns
} from './dom.js'; 
import { exportToCSV, formatTime } from './utils.js';

// Configuration
const NODE_DATA_REFRESH_INTERVAL = 5_000;
const DASHBOARD_REFRESH_TIMEOUT = 5_000;
const LAST_UPDATED_REFRESH_INTERVAL = 1_000;
const CACHE_KEY = 'nodeData';
const CACHE_TIMESTAMP_KEY = 'nodeDataTimestamp';

let lastUpdate = null;
let wasDashboardRefresh = true;
let nodeFilter = null;
let firstFetch = true;

async function updateDashboard() {
    try {
        // Update error message if previous fetch failed
        if (!wasDashboardRefresh) {
            updateErrorContent({
                heading: 'Retrying',
                content: 'Awaiting response from server...',
                processing: true
            });
        }
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), DASHBOARD_REFRESH_TIMEOUT);

        // GET node and alert data
        const nodeData = await fetchNodeData(controller.signal);
        clearTimeout(timeout);
        console.info('Successfully fetched node data from server.');

        // Update DOM with new data
        updateConnectedStatusContent(true);
        updateKPIContent(nodeData.nodes);
        updateTableContent(nodeData.nodes, nodeFilter);
        updateAlertContent(nodeData.alerts)
        
        if (firstFetch && nodeData.nodes.length != 0) {
            setTableFilterColumns(nodeData.nodes);
            firstFetch = false;
        }

        // Save to cache
        localStorage.setItem(CACHE_KEY, JSON.stringify(nodeData));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, new Date().toISOString());

        // Clear any error messages
        updateErrorContent(null);

        lastUpdate = new Date();
        wasDashboardRefresh = true;
    } catch (error) {
        updateConnectedStatusContent(false);
        updateErrorContent({
            heading: 'Error',
            content: `Failed to fetch data, displaying old cached data. Retrying in ${NODE_DATA_REFRESH_INTERVAL}ms.`,
            processing: false
        });
        wasDashboardRefresh = false;

        restoreFromCache();
        console.error('Error refreshing data', error);
    } 
}

async function startDashboardLoop() {
    while (true) {
        await updateDashboard();
        await new Promise(r => setTimeout(r, NODE_DATA_REFRESH_INTERVAL));
    }
}

function updateLastUpdated() {
    const displayText = formatTime(lastUpdate);
    updateLastUpdatedContent(displayText);
}

function restoreFromCache() {
    const cached = localStorage.getItem(CACHE_KEY);
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    if (cached && timestamp) {
        const data = JSON.parse(cached);

        // Ignore expired alerts
        data.alerts = data.alerts.filter(alert => {
            return new Date().toISOString() < alert.expiry;
        })

        updateKPIContent(data.nodes);
        updateTableContent(data.nodes);
        updateAlertContent(data.alerts);
        lastUpdate = new Date(timestamp);
        console.info('Loaded dashboard from cache.');
    }
}


// Filtering
const filterText = document.getElementById('node-filter-text');
const filterColumn = document.getElementById('node-filter-column');

function setTableFilter() {
    const column = filterColumn.value;
    const value = filterText.value;

    nodeFilter = { column, value };

    const cached = localStorage.getItem('nodeData');
    if (cached) {
        const data = JSON.parse(cached);
        updateTableContent(data.nodes, nodeFilter);
    }
};

filterText.addEventListener('input', setTableFilter) // Add debouncing?
filterColumn.addEventListener('change', setTableFilter)

// CSV export
document.getElementById('export-csv-button').addEventListener('click', () => {
    const cached = localStorage.getItem('nodeData');
    const data = JSON.parse(cached);
    exportToCSV(data.nodes, nodeFilter);
});

updateLastUpdated(null);
startDashboardLoop();
setInterval(updateLastUpdated, LAST_UPDATED_REFRESH_INTERVAL);