const DEVIATION = 0.05;
const EXPECTED_DISTRIBUTION = [ 0, 0.301, 0.176, 0.125, 0.097, 0.079, 0.067, 0.058, 0.051, 0.046 ];

let totalNumbers = 0;
const numbers = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

const addNumbers = newNumbers => {
  for (const newNumber of newNumbers) {
    numbers[newNumber.firstDigit] += 1;
    totalNumbers += 1;
  }
};

const generateReport = () => {
  let report = '';
  for (let i = 1; i < numbers.length; i++) {
    report += `${i}: ${numbers[i]} - `
    report += `expected [${(EXPECTED_DISTRIBUTION[i] * 100 * (1 - DEVIATION)).toFixed(2)}; ${(EXPECTED_DISTRIBUTION[i] * 100 * (1 + DEVIATION)).toFixed(2)}] `;
    report += `found: ${(numbers[i] * 100 / totalNumbers).toFixed(2)}%\n`;
  }
  return report;
};

module.exports = {
  addNumbers,
  generateReport,
};