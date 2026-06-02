function calculateEMI() {
    let P = parseFloat(document.getElementById("amount").value);
    let R = parseFloat(document.getElementById("rate").value);
    let N = parseInt(document.getElementById("months").value);
    
    const emiElement = document.getElementById("emi");
    
    // Validation
    if (isNaN(P) || isNaN(R) || isNaN(N) || P <= 0 || N <= 0) {
        emiElement.innerHTML = "Monthly EMI: Please enter valid values";
        return;
    }
    
    if (R <= 0) {
        // Simple interest if no rate
        let emi = P / N;
        emiElement.innerHTML = `Monthly EMI: KES ${emi.toFixed(2)} (Simple payment)`;
        return;
    }
    
    // EMI Formula: [P x R x (1+R)^N] / [(1+R)^N - 1]
    let monthlyRate = R / 100 / 12;
    let emi = (P * monthlyRate * Math.pow(1 + monthlyRate, N)) / (Math.pow(1 + monthlyRate, N) - 1);
    
    if (isNaN(emi) || !isFinite(emi)) {
        emiElement.innerHTML = "Monthly EMI: Calculation error - check values";
        return;
    }
    
    let totalPayment = emi * N;
    let totalInterest = totalPayment - P;
    
    emiElement.innerHTML = `
        Monthly EMI: KES ${emi.toFixed(2)}<br>
        <small>Total Payment: KES ${totalPayment.toFixed(2)}<br>
        Total Interest: KES ${totalInterest.toFixed(2)}</small>
    `;
}