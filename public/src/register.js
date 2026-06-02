async function register() {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    
    const errorDiv = document.getElementById("error-message");
    
    // Validate inputs
    if (!name || !email || !phone || !username || !password) {
        errorDiv.innerText = "Please fill in all fields";
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errorDiv.innerText = "Please enter a valid email address";
        return;
    }
    
    const data = {
        name: name,
        email: email,
        phone: phone,
        username: username,
        password: password
    };
    
    // Show loading state
    const registerBtn = event.target;
    const originalText = registerBtn.innerText;
    registerBtn.innerText = "Registering...";
    registerBtn.disabled = true;
    errorDiv.innerText = "";
    
    try {
        console.log("Sending registration request...");
        
        // Use apiCall function from config.js
        const response = await apiCall("/register", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        
        console.log("Response received:", response.status);
        const result = await response.json();
        console.log("Registration result:", result);
        
        if (response.ok) {
            alert("✅ Registered Successfully! Please login.");
            window.location = "login.html";
        } else {
            errorDiv.innerText = result.message || "Registration failed";
        }
        
    } catch (error) {
        console.error("Registration error:", error);
        
        // Display user-friendly error message
        if (error.message.includes("Failed to fetch")) {
            errorDiv.innerText = "❌ Cannot connect to server. Make sure SWAF is running on port 5000";
        } else if (error.message.includes("timeout")) {
            errorDiv.innerText = "❌ Server timeout. Please try again.";
        } else {
            errorDiv.innerText = `❌ ${error.message}`;
        }
        
    } finally {
        // Reset button
        registerBtn.innerText = originalText;
        registerBtn.disabled = false;
    }
}