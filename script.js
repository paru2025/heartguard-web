document.getElementById('riskForm').addEventListener('submit', function(e) {
  e.preventDefault();

  // Get input values
  const ageInput = document.getElementById('age');
  const genderInput = document.getElementById('gender');
  const raceInput = document.getElementById('race');
  const tcInput = document.getElementById('tc');
  const hdlInput = document.getElementById('hdl');
  const sbpInput = document.getElementById('sbp');
  const bpTreatmentInput = document.getElementById('bpTreatment');
  const smokerInput = document.getElementById('smoker');
  const diabetesInput = document.getElementById('diabetes');

  // Read values
  const age = parseFloat(ageInput.value);
  const gender = genderInput.value;
  const race = raceInput.value;
  const tc = parseFloat(tcInput.value);
  const hdl = parseFloat(hdlInput.value);
  const sbp = parseFloat(sbpInput.value);
  const bpTreatment = bpTreatmentInput.value === 'yes';
  const smoker = smokerInput.value === 'yes';
  const diabetes = diabetesInput.value === 'yes';

  // Log raw values for debugging
  console.log("Raw Inputs:", {
    ageRaw: ageInput.value,
    genderRaw: genderInput.value,
    raceRaw: raceInput.value,
    tcRaw: tcInput.value,
    hdlRaw: hdlInput.value,
    sbpRaw: sbpInput.value,
    bpTreatmentRaw: bpTreatmentInput.value,
    smokerRaw: smokerInput.value,
    diabetesRaw: diabetesInput.value
  });

  // Validate numeric inputs
  if (isNaN(age)) {
    alert("Age is not a valid number.");
    console.error("Invalid Age:", ageInput.value);
    return;
  }
  if (isNaN(tc)) {
    alert("Total Cholesterol is not a valid number.");
    console.error("Invalid TC:", tcInput.value);
    return;
  }
  if (isNaN(hdl)) {
    alert("HDL Cholesterol is not a valid number.");
    console.error("Invalid HDL:", hdlInput.value);
    return;
  }
  if (isNaN(sbp)) {
    alert("Systolic BP is not a valid number.");
    console.error("Invalid SBP:", sbpInput.value);
    return;
  }

  // Log parsed values
  console.log("Parsed Values:", {
    age, gender, race, tc, hdl, sbp, bpTreatment, smoker, diabetes
  });

  // Natural logs
  const lnAge = Math.log(age);
  const lnAgeSq = lnAge * lnAge;
  const lnTc = Math.log(tc);
  const lnHdl = Math.log(hdl);
  const lnSbp = Math.log(sbp);

  // Coefficients based on gender and race
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

  // Final risk calculation
  const expXBeta = Math.exp(xBeta);
  const survival = Math.pow(S0_10, expXBeta);
  const risk = (1 - survival) * 100;
  const riskPercent = Math.min(Math.max(risk, 0), 100).toFixed(1);

  // Update UI
  const resultDiv = document.getElementById('result');
  const riskPercentSpan = document.getElementById('riskPercent');
  const riskCategorySpan = document.getElementById('riskCategory');
  const riskAdviceSpan = document.getElementById('riskAdvice');

  let category = '';
  let advice = '';

  if (risk < 5) {
    category = "Low";
    advice = "You're doing great! Keep up the healthy habits.";
  } else if (risk <= 7.5) {
    category = "Borderline";
    advice = "Talk to your doctor about lifestyle changes.";
  } else if (risk <= 20) {
    category = "Intermediate";
    advice = "Consider regular check-ups and improving diet/exercise.";
  } else {
    category = "High";
    advice = "Consult a healthcare provider for a prevention plan.";
  }

  riskPercentSpan.textContent = riskPercent;
  riskCategorySpan.textContent = category;
  riskAdviceSpan.textContent = advice;
  resultDiv.classList.remove('hidden');
  document.getElementById('downloadPdf').classList.remove('hidden');

  console.log("Final Risk Score:", riskPercent + "%");
});
