/**
 * Retirement calculation utilities
 * Provides projection calculations for retirement planning
 */

/**
 * Generate forward projection: input monthly investment, calculate final balance
 * @param {number} currentAge - Current age in years
 * @param {number} retirementAge - Target retirement age in years
 * @param {number} monthlyInvestment - Monthly investment amount
 * @param {number} annualReturn - Expected annual return percentage
 * @returns {array} Array of projection data {age, balance, contributions, gains}
 */
export function generateForwardProjection(currentAge, retirementAge, monthlyInvestment, annualReturn) {
  const data = [];
  const current = parseInt(currentAge) || 0;
  const retirement = parseInt(retirementAge) || 65;
  const monthly = parseFloat(monthlyInvestment) || 0;
  const rate = (parseFloat(annualReturn) || 7) / 100 / 12;

  let balance = 0;
  for (let age = current; age <= retirement; age++) {
    for (let month = 0; month < 12; month++) {
      balance = balance * (1 + rate) + monthly;
    }
    const yearsElapsed = age - current;
    const totalContributions = yearsElapsed * 12 * monthly;
    const gains = Math.floor(balance - totalContributions);
    
    data.push({ 
      age, 
      balance: Math.floor(balance),
      contributions: Math.floor(totalContributions),
      gains: gains,
    });
  }
  return data;
}

/**
 * Generate backward projection: input goal balance, calculate required monthly investment
 * @param {number} currentAge - Current age in years
 * @param {number} retirementAge - Target retirement age in years
 * @param {number} goalBalance - Target retirement balance
 * @param {number} annualReturn - Expected annual return percentage
 * @returns {array} Array of projection data {age, balance, contributions, gains}
 */
export function generateBackwardProjection(currentAge, retirementAge, goalBalance, annualReturn) {
  const data = [];
  const current = parseInt(currentAge) || 0;
  const retirement = parseInt(retirementAge) || 65;
  const goal = parseFloat(goalBalance) || 500000;
  const rate = (parseFloat(annualReturn) || 7) / 100 / 12;
  const months = (retirement - current) * 12;

  // Calculate required monthly investment using the future value formula
  // FV = PMT * (((1 + r)^n - 1) / r)
  // PMT = FV / (((1 + r)^n - 1) / r)
  let requiredMonthly = 0;
  if (rate === 0) {
    requiredMonthly = months > 0 ? goal / months : 0;
  } else {
    const factor = (Math.pow(1 + rate, months) - 1) / rate;
    requiredMonthly = factor > 0 ? goal / factor : 0;
  }

  let balance = 0;
  for (let age = current; age <= retirement; age++) {
    for (let month = 0; month < 12; month++) {
      balance = balance * (1 + rate) + requiredMonthly;
    }
    const yearsElapsed = age - current;
    const totalContributions = yearsElapsed * 12 * requiredMonthly;
    const gains = Math.floor(balance - totalContributions);
    
    data.push({ 
      age, 
      balance: Math.floor(balance),
      contributions: Math.floor(totalContributions),
      gains: gains,
    });
  }
  return data;
}
