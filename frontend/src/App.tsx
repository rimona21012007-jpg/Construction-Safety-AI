import { useState, useEffect } from 'react';
import { HardHat, Activity, ShieldCheck, Box } from 'lucide-react';
import { UploadPanel } from './components/UploadPanel';
import { DetectionOverlay } from './components/DetectionOverlay';
import { InspectionDashboard } from './components/InspectionDashboard';
import { inspectImage, getModelInfo } from './services/api';
import type { InspectionResponse } from './types';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InspectionResponse | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showDetections, setShowDetections] = useState(true);
  const [modelInfo, setModelInfo] = useState<any>(null);

  useEffect(() => {
    getModelInfo().then(info => setModelInfo(info)).catch(console.error);
  }, []);

  const handleAnalyze = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await inspectImage(file);
      setResult(data);
      setImageUrl(URL.createObjectURL(file));
    } catch (err: any) {
      setError(err.response?.data?.detail || "An error occurred during inference.");
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardHat className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">CONSTRUCT-SAFE <span className="text-blue-600">AI</span></h1>
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-4">
            {modelInfo && (
              <div className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-md">
                <Box className="w-4 h-4 text-gray-500" />
                <span>Model: {modelInfo.model_name} ({modelInfo.inference_device})</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Activity className="w-4 h-4 text-green-500" />
              <span>System Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {!result && !isLoading && (
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h2 className="text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
              AI-Powered Construction Safety Inspection
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Automated visual observation of construction site imagery to detect workers, equipment, and potential safety violations.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm text-center">
                <div className="text-3xl font-black text-gray-200 mb-2">01</div>
                <h3 className="font-bold text-gray-900 mb-2">Upload</h3>
                <p className="text-sm text-gray-600">Securely upload high-resolution construction site imagery.</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm text-center">
                <div className="text-3xl font-black text-gray-200 mb-2">02</div>
                <h3 className="font-bold text-gray-900 mb-2">Analyze</h3>
                <p className="text-sm text-gray-600">Computer vision models instantly process the visual data.</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm text-center">
                <div className="text-3xl font-black text-gray-200 mb-2">03</div>
                <h3 className="font-bold text-gray-900 mb-2">Review</h3>
                <p className="text-sm text-gray-600">Examine the AI-assisted safety observations and bounding boxes.</p>
              </div>
            </div>
            
            <div className="flex justify-center gap-4 text-sm font-medium text-gray-500 mb-4">
              <span>✓ PPE Detection (Upcoming)</span>
              <span>•</span>
              <span>✓ Safety Violations</span>
              <span>•</span>
              <span>✓ Visual Evidence</span>
            </div>
          </div>
        )}

        {/* Upload Section */}
        {!result && (
          <div className="mb-12">
            <UploadPanel onAnalyze={handleAnalyze} isLoading={isLoading} />
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md max-w-2xl mx-auto text-center text-sm">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-500 font-medium">Running YOLO Object Detection...</p>
          </div>
        )}

        {/* Result Section */}
        {result && imageUrl && !isLoading && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Professional Report Header */}
            <div className="bg-white border-b-2 border-gray-900 pb-6 mb-8 print:border-b-4">
              <div className="flex justify-between items-start mb-6 print:mb-4">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Inspection Report</h2>
                  <p className="text-sm text-gray-500 font-medium mt-1">AI-Assisted Construction Safety Analysis</p>
                </div>
                <div className="flex gap-3 print:hidden">
                  <button 
                    onClick={() => window.print()}
                    className="px-4 py-2 text-sm font-bold text-gray-700 bg-white border-2 border-gray-300 hover:border-gray-900 hover:text-gray-900 transition-colors"
                  >
                    Export Report
                  </button>
                  <button 
                    onClick={() => {
                      setResult(null);
                      setImageUrl(null);
                    }}
                    className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    New Inspection
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="block text-gray-500 text-xs uppercase tracking-wider font-bold mb-1">Date / Time</span>
                  <span className="font-mono text-gray-900">{new Date().toLocaleString()}</span>
                </div>
                <div>
                  <span className="block text-gray-500 text-xs uppercase tracking-wider font-bold mb-1">Status</span>
                  <span className="font-mono text-gray-900">{result.status.toUpperCase()}</span>
                </div>
                <div>
                  <span className="block text-gray-500 text-xs uppercase tracking-wider font-bold mb-1">Processing Time</span>
                  <span className="font-mono text-gray-900">{result.processing_time_ms} ms</span>
                </div>
                <div>
                  <span className="block text-gray-500 text-xs uppercase tracking-wider font-bold mb-1">Model Version</span>
                  <span className="font-mono text-gray-900">{result.model}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-none shadow-sm border border-gray-200 text-center mb-8">
              <div className="flex justify-between items-center mb-4 print:hidden">
                <h3 className="font-bold text-gray-900 uppercase tracking-wide text-sm">Visual Evidence</h3>
                <div className="flex bg-gray-100 p-1 rounded-md">
                  <button 
                    onClick={() => setShowDetections(false)}
                    className={`px-3 py-1.5 text-xs font-bold uppercase transition-colors rounded-sm ${!showDetections ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    Original
                  </button>
                  <button 
                    onClick={() => setShowDetections(true)}
                    className={`px-3 py-1.5 text-xs font-bold uppercase transition-colors rounded-sm ${showDetections ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    Detections
                  </button>
                </div>
              </div>
              
              <DetectionOverlay 
                imageUrl={imageUrl} 
                detections={result.detections} 
                showDetections={showDetections} 
              />
            </div>

            <InspectionDashboard data={result} />
            
            {/* Technical Context */}
            <div className="mt-12 bg-gray-100 p-6 rounded-xl text-xs text-gray-500 border border-gray-200">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 flex-shrink-0 text-gray-400" />
                <div>
                  <strong className="block text-gray-700 mb-1">AI-Assisted Visual Safety Inspection</strong>
                  <p className="mb-2">This is an automated visual observation prototype (processed in {result.processing_time_ms}ms using {result.model}). It does not replace professional safety engineers and does not provide legally valid safety certification.</p>
                  <p>Confidence represents the model's certainty for an individual detection, not overall precision. Construction-specific PPE analysis requires a custom-trained model.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
