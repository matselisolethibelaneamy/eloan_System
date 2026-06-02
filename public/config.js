// API Configuration - Switch between SWAF and Direct Backend

const API_CONFIG = {
    // Set to true to route all requests through SWAF for monitoring
    USE_SWAF: true,  // Change to false to bypass SWAF if needed
    
    // SWAF URL (for monitoring) - SWAF runs on port 5000
    SWAF_URL: 'http://localhost:5000',
    
    // Direct Backend URL - Your LMS backend runs on port 8080
    BACKEND_URL: 'http://localhost:8080'
};

// Get the appropriate API base URL
function getAPIBaseURL() {
    if (API_CONFIG.USE_SWAF) {
        return API_CONFIG.SWAF_URL;
    }
    return API_CONFIG.BACKEND_URL;
}

// Helper function to make API calls with error handling
async function apiCall(url, options = {}) {
    const API_BASE = getAPIBaseURL();
    const fullUrl = `${API_BASE}${url}`;
    
    console.log(`[apiCall] Making request to: ${fullUrl}`);
    console.log(`[apiCall] Method: ${options.method || 'GET'}`);
    
    try {
        // Add timeout to fetch
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(fullUrl, {
            ...options,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log(`[apiCall] Response status: ${response.status}`);
        
        // Check if WAF blocked the request
        if (response.status === 403) {
            const errorText = await response.text();
            throw new Error(`WAF Blocked: ${errorText}`);
        }
        
        return response;
        
    } catch (error) {
        console.error(`[apiCall] Error calling ${fullUrl}:`, error);
        
        if (error.name === 'AbortError') {
            throw new Error('Request timeout - Server not responding');
        }
        
        throw error;
    }
}

// Display connection status
function showConnectionStatus() {
    const statusDiv = document.getElementById('connection-status');
    if (statusDiv) {
        const mode = API_CONFIG.USE_SWAF ? '🛡️ Protected by SWAF' : '🔓 Direct Mode (No WAF)';
        const color = API_CONFIG.USE_SWAF ? 'green' : 'orange';
        statusDiv.innerHTML = `<span style="color: ${color}; font-size: 12px;">${mode}</span>`;
    }
}

// Test connection to SWAF
async function testConnection() {
    const API_BASE = getAPIBaseURL();
    console.log(`Testing connection to: ${API_BASE}`);
    
    try {
        const response = await fetch(`${API_BASE}/test`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
            console.log(`✅ Connection to ${API_BASE} successful`);
            return true;
        } else {
            console.log(`⚠️ Connection to ${API_BASE} returned status: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.error(`❌ Cannot connect to ${API_BASE}:`, error.message);
        return false;
    }
}

// Run connection test on page load
console.log('Config loaded. SWAF Mode:', API_CONFIG.USE_SWAF ? 'Active' : 'Inactive');
console.log('API Base URL:', getAPIBaseURL());

// Test connection
testConnection().then(connected => {
    if (!connected) {
        console.warn('⚠️ Cannot connect to API server. Make sure it is running!');
        const statusDiv = document.getElementById('connection-status');
        if (statusDiv) {
            statusDiv.innerHTML = '<span style="color: red; font-size: 12px;">🔴 Cannot connect to server!</span>';
        }
    }
});