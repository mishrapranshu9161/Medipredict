const Disease = require('../models/Disease');

/**
 * Transparent Rule/Scoring-Based Educational Prediction Engine
 * Evaluates submitted symptoms against the knowledge base of diseases.
 * Designed with a clean interface function predictDisease(symptomsSelected)
 * so it can be swapped with a real Machine Learning microservice in the future.
 * 
 * @param {Array<string>} symptomsSelected Array of symptom names selected by patient
 * @returns {Promise<Array>} Ranked array of condition risk objects
 */
const predictDisease = async (symptomsSelected = []) => {
  if (!symptomsSelected || symptomsSelected.length === 0) {
    return [];
  }

  // Standardize inputs (lowercase, trimmed)
  const normalizedInputSymptoms = symptomsSelected.map(s => s.trim().toLowerCase());

  // Fetch all diseases with populated symptom links or embedded symptom names
  const diseases = await Disease.find({}).populate('symptoms.symptom');

  const results = [];

  for (const disease of diseases) {
    let matchedSymptoms = [];
    let matchScoreSum = 0;
    let totalWeightSum = 0;

    if (!disease.symptoms || disease.symptoms.length === 0) continue;

    disease.symptoms.forEach(item => {
      const symName = (item.name || (item.symptom && item.symptom.name) || '').trim().toLowerCase();
      const weight = item.weight || 1.0;

      totalWeightSum += weight;

      if (symName && normalizedInputSymptoms.includes(symName)) {
        matchedSymptoms.push(item.name || (item.symptom && item.symptom.name));
        matchScoreSum += weight;
      }
    });

    if (matchedSymptoms.length > 0) {
      // Calculate weighted risk score between 0.00 and 0.95 (capped for decision support)
      const rawScore = matchScoreSum / Math.max(totalWeightSum, 1);
      
      // Jaccard similarity component to penalize huge symptom disparity
      const jaccardScore = matchedSymptoms.length / (normalizedInputSymptoms.length + disease.symptoms.length - matchedSymptoms.length);
      
      // Combined weighted score
      const combinedScore = (rawScore * 0.7) + (jaccardScore * 0.3);
      const riskScore = Math.min(Math.round(combinedScore * 100) / 100, 0.95);

      if (riskScore >= 0.20) {
        let explanation = `Matched ${matchedSymptoms.length} out of ${disease.symptoms.length} symptoms associated with ${disease.name} (${matchedSymptoms.join(', ')}).`;
        if (disease.precautions && disease.precautions.length > 0) {
          explanation += ` Recommended precautions include: ${disease.precautions.join('; ')}.`;
        }

        results.push({
          condition: disease.name,
          riskScore: Math.max(riskScore, 0.25), // minimum presentation score for matched items
          matchedSymptoms: matchedSymptoms,
          explanation: explanation,
          riskLevel: disease.riskLevel || (riskScore > 0.7 ? 'High' : riskScore > 0.4 ? 'Moderate' : 'Low'),
          recommendedAction: disease.recommendedAction || 'Consult a qualified healthcare professional.'
        });
      }
    }
  }

  // Fallback fallback rule check if database yields no match (for common symptoms demo)
  if (results.length === 0) {
    if (normalizedInputSymptoms.includes('fever') && normalizedInputSymptoms.includes('cough')) {
      results.push({
        condition: 'Acute Upper Respiratory Tract Infection',
        riskScore: 0.65,
        matchedSymptoms: ['Fever', 'Cough'],
        explanation: 'Fever and Cough are characteristic indicators of acute viral or bacterial respiratory infection.',
        riskLevel: 'Moderate',
        recommendedAction: 'Consult a primary care physician for symptom evaluation and guidance.'
      });
    } else if (normalizedInputSymptoms.includes('headache') || normalizedInputSymptoms.includes('fatigue')) {
      results.push({
        condition: 'General Stress or Fatigue Syndrome',
        riskScore: 0.40,
        matchedSymptoms: normalizedInputSymptoms.filter(s => ['headache', 'fatigue'].includes(s)),
        explanation: 'Headache and Fatigue are non-specific symptoms commonly associated with stress, mild dehydration, or viral prodrome.',
        riskLevel: 'Low',
        recommendedAction: 'Ensure adequate rest and hydration. Consult a physician if symptoms persist.'
      });
    }
  }

  // Sort by risk score descending
  results.sort((a, b) => b.riskScore - a.riskScore);

  return results;
};

module.exports = {
  predictDisease
};
