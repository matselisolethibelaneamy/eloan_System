async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const errorDiv = document.getElementById("error-message");
    const debugDiv = document.getElementById("debug-info");
    
    if (!username || !password) {
        errorDiv.innerText = "Please enter username and password";
        return;
    }
    
    const loginBtn = event.target;
    const originalText = loginBtn.innerText;
    loginBtn.innerText = "Logging in...";
    loginBtn.disabled = true;
    errorDiv.innerText = "";
    debugDiv.innerHTML = `Attempting login for: ${username}<br>`;
    
    try {
        // CHANGE: Use /api/user-login instead of /login
        const response = await apiCall("/user-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });
        
        debugDiv.innerHTML += `Response status: ${response.status}<br>`;
        
        const data = await response.json();
        debugDiv.innerHTML += `Response data: ${JSON.stringify(data)}<br>`;
        
        if (response.ok && data.id) {
            localStorage.setItem("user", JSON.stringify(data));
            localStorage.setItem("token", data.token);
            debugDiv.innerHTML += "✅ Login successful! Redirecting...<br>";
            window.location = "dashboard.html";
        } else {
            errorDiv.innerText = data.message || "Login Failed";
            debugDiv.innerHTML += `❌ Login failed: ${JSON.stringify(data)}<br>`;
        }
        
    } catch (error) {
        console.error("Login error:", error);
        errorDiv.innerText = `Error: ${error.message}`;
        debugDiv.innerHTML += `❌ Error: ${error.message}<br>`;
    } finally {
        loginBtn.innerText = originalText;
        loginBtn.disabled = false;
    }
}