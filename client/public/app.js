import { fetchNodeData } from './api.js';
import { updateStatusContent, updateKPIContent, updateTableContent, updateLastUpdatedContent } from './dom.js'; // , , , updateLastUpdated
//import { showAlert } from './alerts.js';
import { formatTime } from './time.js';

// Configuration
const NODE_DATA_REFRESH_INTERVAL = 5_000;
const NODE_REFRESH_TIMEOUT = 5_000;
const LAST_UPDATED_REFRESH_INTERVAL = 1_000;

let lastUpdate = null;
//let seesaw = false;

async function updateDashboard() {
    try {
        //seesaw = !seesaw;
        //if (seesaw) { throw new Error('yay'); }
        
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), NODE_REFRESH_TIMEOUT);

        const data = await fetchNodeData(controller.signal);
        clearTimeout(timeout);

        updateStatusContent(true);
        updateKPIContent(data.kpis);
        updateTableContent(data.nodes);
        //showAlert(data.nodes);
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