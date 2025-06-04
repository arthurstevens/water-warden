// Fetching data from the server

export async function fetchNodeData(signal) {
    // Simulate network delay (500ms) and support for abort signal
    await new Promise((resolve, reject) => {
        const timeout = setTimeout(resolve, 50000);

        signal.addEventListener('abort', () => {
            clearTimeout(timeout);
            reject(new DOMException('Aborted', 'AbortError'));
        });
    });

    // Dummy nodes
    const nodes = [
        {
            id: 'Node-001',
            name: 'Valve A1',
            status: 1,
            flowRate: 12.4,
            pressure: 1.2,
            coordinates: '26.2041° S, 28.0473° E',
            lastUpdated: new Date().toISOString().split('T')[0],
            battery: 93
        },
        {
            id: 'Node-002',
            name: 'Valve B2',
            status: 2,
            flowRate: 1.2,
            pressure: 1.0,
            coordinates: '26.2032° S, 28.0494° E',
            lastUpdated: new Date().toISOString().split('T')[0],
            battery: 45
        },
        {
            id: 'Node-003',
            name: 'Valve C3',
            status: 3,
            flowRate: 0.0,
            pressure: 0.0,
            coordinates: '26.2042° S, 28.0474° E',
            lastUpdated: new Date().toISOString().split('T')[0],
            battery: 18
        }
    ];

    // Derive KPIs
    const kpis = {
        total: nodes.length,
        normal: nodes.filter(n => n.status === 1).length,
        potentialIssues: nodes.filter(n => n.status === 2).length,
        critical: nodes.filter(n => n.status === 3).length
    };

    return { nodes, kpis };
}