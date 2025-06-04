import { fetchNodeData } from './api.js';
import { updateConnectedStatusContent, updateKPIContent, updateTableContent, updateLastUpdatedContent, updateAlertContent } from './dom.js'; 
//import { showAlert } from './alerts.js';
import { formatTime } from './nodeFormatter.js';

// Configuration
const NODE_DATA_REFRESH_INTERVAL = 5_000;
const DASHBOARD_REFRESH_TIMEOUT = 5_000;
const LAST_UPDATED_REFRESH_INTERVAL = 1_000;

let lastUpdate = null;
let wasDashboardRefresh = false;
//let seesaw = false;

async function updateDashboard() {
    try {
        // Display retrying alert if previous refesh failed
        // NEEDS WORK. Might cause issues, wipes prior alert, potentially very annoying for end-user
        if (!wasDashboardRefresh) {
            let alert = {
                heading: 'Pending',
                content: 'Awaiting response from server.',
                severity: 0
            }
            updateAlertContent(alert)
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

        lastUpdate = new Date();
        wasDashboardRefresh = true;
    } catch (error) {
        updateConnectedStatusContent(false);

        // NEEDS WORK. Might cause issues, wipes prior alert, potentially very annoying for end-user
        let alert = {
            heading: 'Error',
            content: `Failed to fetch node data. Retrying in ${NODE_DATA_REFRESH_INTERVAL}ms.`,
            severity: 3
        }
        updateAlertContent(alert)
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