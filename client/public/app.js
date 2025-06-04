import { fetchNodeData } from './api.js';
import { updateStatusContent, updateKPIContent, updateTableContent, updateLastUpdatedContent } from './dom.js'; // , , , updateLastUpdated
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
        //const alertData = await fetchAlertData(controller.signal);

        clearTimeout(timeout);

        updateStatusContent(true);
        updateKPIContent(nodeData.kpis);
        updateTableContent(nodeData.nodes);
        //showAlert(nodeData.nodes);
        lastUpdate = new Date();
    } catch (error) {
        updateStatusContent(false);
        //showAlert('error', 'Unable to fetch node data.');
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