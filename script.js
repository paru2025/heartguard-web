document.getElementById('riskForm').addEventListener('submit', function(e) {
  e.preventDefault();

  // Read inputs with fallback to 0
  const age = parseFloat(document.getElementById('age').value) || 0;
  const gender = document.getElementById('gender').value;
  const race = document.getElementById('race').value;
  const tc = parseFloat(document.getElementById('tc').value) || 0;
  const hdl = parseFloat(document.getElementById('hdl').value) || 0;
  const sbp = parseFloat(document.getElementById('sbp').value) || 0;
  const bpTreatment = document.getElementById('bpTreatment').value === 'yes';
  const smoker = document.getElementById('smoker').value === 'yes';
  const diabetes = document.getElementById('diabetes').value === 'yes';

  // Validate numeric inputs
  if (age <= 0 || tc <= 0 || hdl <= 0 || sbp <= 0) {
    alert("Please enter valid positive values for age, cholesterol, and blood pressure.");
    return;
  }

  // Run the PCE calculation
  function calculatePCE(age, gender, race, tc, hdl, sbp, bpTreatment, smoker, diabetes) {
    const lnAge = Math.log(age);
    const lnAgeSq = lnAge * lnAge;
    const lnTc = Math.log(tc);
    const lnHdl = Math.log(hdl);
    const lnSbp = Math.log(sbp);

    let xBeta = 0;
    let S0_10 = 0.9144;

    if (gender === 'male' && race === 'africanAmerican') {
      xBeta =
        -24.35715 +
        0.88941 * lnAge +
        0.25411 * lnAgeSq +
        0.51092 * lnTc +
        (-0.83642) * lnHdl +
        0.42191 * lnSbp +
        0.47654 * (bpTreatment ? 1 : 0) +
        0.50361 * (smoker ? 1 : 0) +
        0.21558 * (diabetes ? 1 : 0);
      S0_10 = 0.8954;
    } else if (gender === 'male' && race !== 'africanAmerican') {
      xBeta =
        -29.08598 +
        0.76551 * lnAge +
        0.65665 * lnAgeSq +
        0.79384 * lnTc +
        (-0.60351) * lnHdl +
        0.50604 * lnSbp +
        0.34275 * (bpTreatment ? 1 : 0) +
        0.96187 * (smoker ? 1 : 0) +
        0.66051 * (diabetes ? 1 : 0);
      S0_10 = 0.9144;
    } else if (gender === 'female' && race === 'africanAmerican') {
      xBeta =
        -29.09743 +
        1.33514 * lnAge +
        0.09673 * lnAgeSq +
        0.15403 * lnTc +
        (-0.55625) * lnHdl +
        0.39568 * lnSbp +
        0.19337 * (bpTreatment ? 1 : 0) +
        0.50668 * (smoker ? 1 : 0) +
        0.34534 * (diabetes ? 1 : 0);
      S0_10 = 0.9597;
    } else {
      xBeta =
        -29.09743 +
        1.33514 * lnAge +
        0.13825 * lnAgeSq +
        0.92974 * lnTc +
        (-0.77225) * lnHdl +
        0.66157 * lnSbp +
        0.55135 * (bpTreatment ? 1 : 0) +
        0.85061 * (smoker ? 1 : 0) +
        0.51548 * (diabetes ? 1 : 0);
      S0_10 = 0.9665;
    }

    const expXBeta = Math.exp(xBeta);
    const survival = Math.pow(S0_10, expXBeta);
    const risk = (1 - survival) * 100;
    const riskPercent = Math.min(Math.max(risk, 0), 100).toFixed(1);

    // Log debug values
    console.log("xBeta:", xBeta);
    console.log("exp(xBeta):", expXBeta);
    console.log("Survival:", survival);
    console.log("Risk %:", riskPercent);

    // Update UI
    document.getElementById('riskPercent').textContent = riskPercent;
    document.getElementById('riskAdvice').textContent = risk < 5
      ? "You're doing great! Keep up the healthy habits."
      : risk <= 7.5
        ? "Talk to your doctor about lifestyle changes."
        : risk <= 20
          ? "Consider regular check-ups and improving diet/exercise."
          : "Consult a healthcare provider for a prevention plan.";

    document.getElementById('riskCategory').textContent =
      risk < 5 ? "Low" :
      risk <= 7.5 ? "Borderline" :
      risk <= 20 ? "Intermediate" : "High";

    document.getElementById('result').classList.remove('hidden');
    document.getElementById('downloadPdf').classList.remove('hidden');
  }

  calculatePCE(age, gender, race, tc, hdl, sbp, bpTreatment, smoker, diabetes);
});
