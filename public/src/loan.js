const user = JSON.parse(localStorage.getItem("user"));

async function applyLoan() {
    if (!user) {
        alert("Please login first");
        window.location = "login.html";
        return;
    }
    
    const loan_type = document.getElementById("loan_type").value;
    const amount = document.getElementById("amount").value;
    const duration = document.getElementById("duration").value;
    const messageDiv = document.getElementById("message");
    
    if (!amount || !duration) {
        messageDiv.innerHTML = '<span style="color: red;">Please fill in all fields</span>';
        return;
    }
    
    try {
        const response = await apiCall("/apply-loan", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({
                customer_id: user.id,
                loan_type,
                amount: parseFloat(amount),
                duration: parseInt(duration)
            })
        });
        
        const result = await response.json();
        messageDiv.innerHTML = '<span style="color: green;">✅ Loan Applied Successfully!</span>';
        
        // Clear form
        document.getElementById("amount").value = "";
        document.getElementById("duration").value = "";
        
        // Redirect after 2 seconds
        setTimeout(() => {
            window.location = "dashboard.html";
        }, 2000);
    } catch (error) {
        messageDiv.innerHTML = `<span style="color: red;">❌ ${error.message}</span>`;
        console.error("Loan application error:", error);
    }
}

async function viewLoans() {
    if (!user) {
        document.getElementById("loans").innerHTML = "<p>Please login to view loans</p>";
        return;
    }
    
    try {
        const response = await apiCall(`/loans/${user.id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });
        
        const loans = await response.json();
        
        if (loans.length === 0) {
            document.getElementById("loans").innerHTML = "<p>No loans found. Apply for a loan!</p>";
            return;
        }
        
        let html = '<div style="margin-top: 20px;"><h3>Your Loans</h3><table border="1" cellpadding="10" style="width: 100%; border-collapse: collapse;">';
        html += '<tr style="background: #f2f2f2;"><th>Loan Type</th><th>Amount (KES)</th><th>Duration</th><th>Status</th><th>Date</th></tr>';
        
        loans.forEach(loan => {
            html += `<tr>
                        <td>${loan.loan_type}</td>
                        <td>${parseFloat(loan.amount).toLocaleString()}</td>
                        <td>${loan.duration} months</td>
                        <td><span style="color: ${loan.status === 'approved' ? 'green' : (loan.status === 'pending' ? 'orange' : 'red')}">${loan.status || 'Pending'}</span></td>
                        <td>${new Date(loan.created_at).toLocaleDateString()}</td>
                    </tr>`;
        });
        
        html += '</table></div>';
        document.getElementById("loans").innerHTML = html;
    } catch (error) {
        document.getElementById("loans").innerHTML = `<p style="color: red;">Error loading loans: ${error.message}</p>`;
        console.error("View loans error:", error);
    }
}