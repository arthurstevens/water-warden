// Utility for formatting units of measurement
export function formatValue(key, value) {
    key = key.toLowerCase();
    
    if (value === null || value === undefined) return '-';
    if (key === 'status') {
        return {
            1: 'Normal',
            2: 'Potential Issues',
            3: 'Critical'
        }[value] ?? 'Unknown';
    }
    if (key === 'timestamp') return new Date(value).toLocaleString();
    if (key === 'flowrate') return `${value} L/min`;
    if (key === 'pressure') return `${value} bar`;
    if (key === 'battery') return `${value}%`;
    if (key === 'temperature') return `${value}°C`;
    if (key === 'turbidity') return `${value} NTU`;
    if (key === 'tds') return `${value}ppm`;
    return value;
}

// Utility for styling a cell based on its key
export function getCellClass(key, value) {
    key = key.toLowerCase();

    const base = 'px-6 py-4 sm:whitespace-nowrap text-gray-700';
    const classes = [base];

    // Selective font weights
    if (['name', 'status', 'battery'].includes(key)) {
        classes.push('font-semibold');
    }

    // Status colour indicator
    if (key === 'status') {
        const statusColor = {
            1: '!text-green-500',
            2: '!text-orange-500',
            3: '!text-red-500'
        }[value];

        if (statusColor) {
            classes.push(statusColor);
        }
    }

    // Battery colour indicator
    if (key === 'battery') {
        const batteryVal = parseFloat(String(value).replace('%', ''));
        if (!isNaN(batteryVal)) {
            if (batteryVal >= 60) {
                classes.push('!text-green-500');
            } else if (batteryVal >= 30) {
                classes.push('!text-orange-500');
            } else {
                classes.push('!text-red-500');
            }
        }
    }

    // Pressure colour indicator
    if (key === 'pressure') {
        const pressureVal = parseFloat(String(value).replace(' bar', ''));
        if (!isNaN(pressureVal)) {
            if (pressureVal >= 3 && pressureVal <= 6) {
                classes.push('!text-green-500');
            } else if (pressureVal >= 2 && pressureVal <= 9) {
                classes.push('!text-orange-500');
            } else {
                classes.push('!text-red-500');
            }
        }
    }

    // Temperature colour indicator
    if (key === 'temperature') {
        const temperatureVal = parseFloat(String(value).replace('°C', ''));
        if (!isNaN(temperatureVal)) {
            if (temperatureVal >= 15 && temperatureVal <= 25) {
                classes.push('!text-green-500');
            } else if (temperatureVal >= 0 && temperatureVal <= 30) {
                classes.push('!text-orange-500');
            } else {
                classes.push('!text-red-500');
            }
        }
    }

    // Turbidity colour indicator
    if (key === 'turbidity') {
        const turbidityVal = parseFloat(String(value).replace(' NTU', ''));
        if (!isNaN(turbidityVal)) {
            if (turbidityVal <= 1) {
                classes.push('!text-green-500');
            } else if (turbidityVal <= 5) {
                classes.push('!text-orange-500');
            } else {
                classes.push('!text-red-500');
            }
        }
    }

    // TDS colour indicator
    if (key === 'tds') {
        const tdsVal = parseFloat(String(value).replace(' ppm', ''));
        if (!isNaN(tdsVal)) {
            if (tdsVal >= 200 && tdsVal <= 400) {
                classes.push('!text-green-500');
            } else if (tdsVal >= 0 && tdsVal <= 1200) {
                classes.push('!text-orange-500');
            } else {
                classes.push('!text-red-500');
            }
        }
    }

    return classes.join(' ');
}