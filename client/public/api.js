// Fetches data from the server
export async function fetchNodeData(signal) {
    // Simulate a network delay
    await new Promise((resolve, reject) => {
        //const timeout = setTimeout(resolve, 5_000); // Forced timeout
        const timeout = setTimeout(resolve, 500); // Normal

        signal.addEventListener('abort', () => {
            clearTimeout(timeout);
            reject(new DOMException('Aborted', 'AbortError'));
        });
    });

    // Requesting node data
    const response = await fetch('/api/read', { signal });
    const { nodes } = await response.json();

    // Dummy alert
    const alertResponse = await fetch('/api/read_alert', { signal });
    const { alerts } = await alertResponse.json();

    return { nodes, alerts };
}
