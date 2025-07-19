document.getElementById('riskForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const age = parseFloat(document.getElementById('age').value);
  const gender = document.getElementById('gender').value;
  const race = document.getElementById('race').value;
  const tc = parseFloat(document.getElementById('tc').value);
  const hdl = parseFloat(document.getElementById('hdl').value);
  const sbp = parseFloat(document.getElementById('sbp').value);
  const bpTreatment = document.getElementById('bpTreatment').value === 'yes';
  const smoker = document.getElementById('smoker').value === 'yes';
  const diabetes = document.getElementById('diabetes').value === 'yes';

  if (isNaN(age) || isNaN(tc) || isNaN(hdl) || isNaN(sbp)) {
    alert("Please enter valid numeric values for all fields.");
    return;
  }

  const lnAge = Math.log(age);
  const lnAgeSq = Math.pow(lnAge, 2);
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
  const risk = (1 - Math.pow(S0_10, expXBeta)) * 100;
  const riskPercent = Math.min(Math.max(risk, 0), 100).toFixed(1);

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

  document.getElementById('riskPercent').textContent = riskPercent;
  document.getElementById('riskCategory').textContent = category;
  document.getElementById('riskAdvice').textContent = advice;
  document.getElementById('result').classList.remove('hidden');
  document.getElementById('downloadPdf').classList.remove('hidden');
});

// PDF Export
document.getElementById('downloadPdf').addEventListener('click', function () {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const name = document.getElementById('userName').value || 'Anonymous';
  const riskPercent = document.getElementById('riskPercent').textContent;
  const category = document.getElementById('riskCategory').textContent;
  const advice = document.getElementById('riskAdvice').textContent;

  doc.setFontSize(18);
  doc.text("HeartGuard Risk Assessment", 20, 20);

  doc.setFontSize(12);
  doc.text(`Name: ${name}`, 20, 30);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 40);
  doc.text(`10-Year ASCVD Risk: ${riskPercent}%`, 20, 50);
  doc.text(`Risk Category: ${category}`, 20, 60);
  doc.text(`Advice: ${advice}`, 20, 70);

  doc.save(`HeartGuard_${name}_Risk_Report.pdf`);
});
