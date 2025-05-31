import { fetchNodeData } from './api.js';
import { updateStatus, updateKPIs, updateTable } from './dom.js'; // , , , updateLastUpdated
//import { showAlert } from './alerts.js';
//import { formatTime } from './time.js';

// Configuration
const REFRESH_INTERVAL = 5_000; // 30 seconds
const TIMEOUT = 5_000;           // 5 second timeout for fetch

let lastUpdate = null;
//let seesaw = false;

async function updateDashboard() {
    try {
        //seesaw = !seesaw;
        //if (seesaw) { throw new Error('yay'); }
        
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), TIMEOUT);

        const data = await fetchNodeData(controller.signal);
        clearTimeout(timeout);

        updateStatus(true);
        updateKPIs(data.kpis);
        updateTable(data.nodes);
        //lastUpdate = new Date();
        //updateLastUpdated(formatTime(lastUpdate));
        //showAlert(data.nodes);
    } catch (error) {
        updateStatus(false);
        //showAlert('error', 'Unable to fetch node data.');
        console.error('Data Refresh Error', error);
    }
}

updateDashboard();
setInterval(updateDashboard, REFRESH_INTERVAL);
