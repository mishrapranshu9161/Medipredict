import React, { useState, useEffect } from 'react';
import { predictionAPI, diseaseSymptomAPI } from '../../services/api';
import { Sparkles, AlertTriangle, CheckSquare, Square, RefreshCw, Activity, ShieldAlert, History, ArrowRight } from 'lucide-react';
import { LoadingBlock } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';

export const DiseasePredictorPage = () => {
  const [symptomsList, setSymptomsList] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [results, setResults] = useState(null);
  const [disclaimer, setDisclaimer] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const availableSymptoms = [
    'Fever', 'Cough', 'Fatigue', 'Headache', 'Body Pain',
    'Sore Throat', 'Nausea', 'Vomiting', 'Diarrhea',
    'Shortness of Breath', 'Chest Pain', 'Skin Rash', 'Dizziness', 'Abdominal Pain'
  ];

  useEffect(() => {
    Promise.all([
      diseaseSymptomAPI.getSymptoms(),
      predictionAPI.getHistory()
    ]).then(([symRes, histRes]) => {
      if (symRes.success && symRes.data.symptoms.length > 0) {
        setSymptomsList(symRes.data.symptoms.map(s => s.name));
      } else {
        setSymptomsList(availableSymptoms);
      }
      if (histRes.success) {
        setHistory(histRes.data.history);
      }
    }).finally(() => setLoading(false));
  }, []);

  const toggleSymptom = (symName) => {
    if (selectedSymptoms.includes(symName)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symName));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symName]);
    }
  };

  const handlePredict = async () => {
    if (selectedSymptoms.length === 0) {
      setError('Please check at least one symptom before analyzing risk.');
      return;
    }

    setError('');
    setAnalyzing(true);

    try {
      const res = await predictionAPI.predict(selectedSymptoms);
      if (res.success) {
        setResults(res.data.results);
        setDisclaimer(res.data.disclaimer);
        // Refresh prediction history
        const histRes = await predictionAPI.getHistory();
        if (histRes.success) setHistory(histRes.data.history);
      }
    } catch (err) {
      setError(err.message || 'Prediction service error');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return <LoadingBlock message="Initializing Disease Risk Prediction Knowledge Base..." />;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-bold mb-3">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Educational Clinical Decision Support Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black">Symptom Analyzer & Disease Risk Assessor</h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
          Select all symptoms currently experienced to calculate weighted risk probability scores against our disease knowledge base.
        </p>
      </div>

      {/* MANDATORY EDUCATIONAL DISCLAIMER BANNER */}
      <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 flex items-start space-x-3 shadow-xs">
        <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <span className="font-extrabold uppercase tracking-wider block text-amber-800 text-[11px] mb-0.5">Important Medical Disclaimer</span>
          <p>
            This prediction tool is strictly for <strong>educational and decision-support purposes only</strong> and does NOT constitute a medical diagnosis or treatment plan. Always consult a qualified healthcare professional or visit a emergency clinic for clinical evaluation.
          </p>
        </div>
      </div>

      {/* Main Grid: Checklist & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Symptom Checklist */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Select Experienced Symptoms</h3>
            <span className="text-xs font-bold text-indigo-600">{selectedSymptoms.length} Selected</span>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-96 overflow-y-auto pr-1">
            {symptomsList.map((sym) => {
              const isChecked = selectedSymptoms.includes(sym);
              return (
                <button
                  key={sym}
                  type="button"
                  onClick={() => toggleSymptom(sym)}
                  className={`p-3 rounded-xl border text-xs font-bold text-left transition-all flex items-center justify-between ${
                    isChecked
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span>{sym}</span>
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-indigo-600 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setSelectedSymptoms([])}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Reset Selection
            </button>
            <button
              type="button"
              onClick={handlePredict}
              disabled={analyzing || selectedSymptoms.length === 0}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center space-x-2 transition-all"
            >
              {analyzing ? (
                <span>Calculating Risk...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Selected Symptoms</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Prediction Results Display */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs min-h-[400px]">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              <span>Assessment Results</span>
            </h3>

            {results ? (
              <div className="space-y-4">
                {results.length > 0 ? (
                  results.map((res, index) => (
                    <div key={index} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900">{res.condition}</h4>
                          <span className="text-[11px] font-semibold text-slate-500">
                            Matched: {res.matchedSymptoms?.join(', ')}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-black text-indigo-600">
                            {Math.round(res.riskScore * 100)}%
                          </span>
                          <span className="block text-[10px] uppercase font-bold text-slate-400">Risk Score</span>
                        </div>
                      </div>

                      {/* Score Bar */}
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            res.riskScore > 0.7 ? 'bg-rose-500' : res.riskScore > 0.4 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.round(res.riskScore * 100)}%` }}
                        />
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed pt-1">{res.explanation}</p>

                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                        <span className="font-bold text-indigo-700">{res.recommendedAction}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-xs text-slate-400">
                    No specific condition match found for the selected symptom combination.
                  </div>
                )}
              </div>
            ) : (
              <div className="py-20 text-center text-xs text-slate-400 space-y-2">
                <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
                <p>Select symptoms from the left panel and click 'Analyze Selected Symptoms' to view risk scores.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Historical Query History */}
      {history.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center space-x-2">
            <History className="w-5 h-5 text-slate-500" />
            <span>Previous Risk Assessment History</span>
          </h3>

          <div className="space-y-3">
            {history.slice(0, 5).map((item) => (
              <div key={item._id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800">Symptoms: {item.symptomsSelected?.join(', ')}</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div>
                  <span className="font-extrabold text-indigo-600">
                    Top Match: {item.results?.[0]?.condition || 'Evaluated'} ({Math.round((item.results?.[0]?.riskScore || 0) * 100)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
