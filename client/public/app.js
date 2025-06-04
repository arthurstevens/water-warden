import { fetchNodeData } from './api.js';
import { updateConnectedStatusContent, updateKPIContent, updateTableContent, updateLastUpdatedContent, updateAlertContent } from './dom.js'; 
//import { showAlert } from './alerts.js';
import { formatTime } from './nodeFormatter.js';

// Configuration
const NODE_DATA_REFRESH_INTERVAL = 5_000;
const DASHBOARD_REFRESH_TIMEOUT = 5_000;
const LAST_UPDATED_REFRESH_INTERVAL = 1_000;

let lastUpdate = null;
//let seesaw = false;

async function updateDashboard() {
    try {
        //seesaw = !seesaw;
        //if (seesaw) { throw new Error('yay'); }
        
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), DASHBOARD_REFRESH_TIMEOUT);

        const nodeData = await fetchNodeData(controller.signal);

        clearTimeout(timeout);

        updateConnectedStatusContent(true);
        updateKPIContent(nodeData.kpis);
        updateTableContent(nodeData.nodes);
        updateAlertContent(nodeData.alert)
        lastUpdate = new Date();
    } catch (error) {
        updateConnectedStatusContent(false);

        const alert = {
            heading: 'Error',
            content: `Failed to fetch node data. Retrying in ${NODE_DATA_REFRESH_INTERVAL}ms.`,
            severity: 3
        }
        updateAlertContent(alert)
        console.error('Data Refresh Error', error);
    } 
}

function updateLastUpdated() {
    const displayText = formatTime(lastUpdate);
    updateLastUpdatedContent(displayText);
}

updateDashboard();
setInterval(updateDashboard, NODE_DATA_REFRESH_INTERVAL);
updateLastUpdated();
setInterval(updateLastUpdated, LAST_UPDATED_REFRESH_INTERVAL);