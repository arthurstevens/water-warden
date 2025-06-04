// Fetching data from the server

export async function fetchNodeData(signal) {
    // Simulate a network delay
    await new Promise((resolve, reject) => {
        const timeout = setTimeout(resolve, 500);

        signal.addEventListener('abort', () => {
            clearTimeout(timeout);
            reject(new DOMException('Aborted', 'AbortError'));
        });
    });

    // Requesting node data
    const response = await fetch('/api/read', { signal });
    const { nodes } = await response.json();

    // Dummy alert
    const alert = {
        heading: 'Example Alert',
        content: 'Example alert content...',
        severity: 2
    };

    return { nodes, alert };
}
