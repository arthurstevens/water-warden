import { fetchNodeData } from './api.js';
import { 
    updateConnectedStatusContent, 
    updateKPIContent, 
    updateTableContent, 
    updateLastUpdatedContent, 
    updateAlertContent, 
    updateErrorContent 
} from './dom.js'; 
import { formatTime } from './nodeFormatter.js';

// Configuration
const NODE_DATA_REFRESH_INTERVAL = 5_000;
const DASHBOARD_REFRESH_TIMEOUT = 5_000;
const LAST_UPDATED_REFRESH_INTERVAL = 1_000;

let lastUpdate = null;
let wasDashboardRefresh = true;
//let seesaw = false;

async function updateDashboard() {
    try {
        // Update error message if previous fetch failed
        if (!wasDashboardRefresh) {
            let alert = {
                heading: 'Retrying',
                content: 'Awaiting response from server.',
                processing: true
            }
            updateErrorContent(alert)
        }

        //seesaw = !seesaw;
        //if (seesaw) { throw new Error('yay'); }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), DASHBOARD_REFRESH_TIMEOUT);

        // GET node and alert data
        const nodeData = await fetchNodeData(controller.signal);
        clearTimeout(timeout);

        // Update DOM
        updateConnectedStatusContent(true);
        updateKPIContent(nodeData.nodes);
        updateTableContent(nodeData.nodes);
        updateAlertContent(nodeData.alert)

        // Clear any error messages
        updateErrorContent(null);

        lastUpdate = new Date();
        wasDashboardRefresh = true;
    } catch (error) {
        updateConnectedStatusContent(false);

        let alert = {
            heading: 'Error',
            content: `Failed to fetch node data, retrying in ${NODE_DATA_REFRESH_INTERVAL}ms.`,
            processing: false
        }
        updateErrorContent(alert)
        wasDashboardRefresh = false;
        console.error('Data Refresh Error', error);
    } 
}

function updateLastUpdated() {
    const displayText = formatTime(lastUpdate);
    updateLastUpdatedContent(displayText);
}

async function startDashboardLoop() {
    while (true) {
        await updateDashboard();
        await new Promise(r => setTimeout(r, NODE_DATA_REFRESH_INTERVAL));
    }
}

startDashboardLoop();
updateLastUpdated();
setInterval(updateLastUpdated, LAST_UPDATED_REFRESH_INTERVAL);