import { useState, useEffect } from 'react';
import { Hexagon, ShieldCheck, Box } from 'lucide-react';
import { UploadPanel } from './components/UploadPanel';
import { DetectionOverlay } from './components/DetectionOverlay';
import { InspectionDashboard } from './components/InspectionDashboard';
import { inspectImage, getModelInfo } from './services/api';
import type { InspectionResponse } from './types';
import { GradientWave } from "./components/ui/gradient-wave";

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
    <div className="min-h-screen bg-slate-50 relative flex flex-col items-center p-8 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <GradientWave colors={["#38bdf8", "#0ea5e9", "#7dd3fc", "#0284c7", "#38bdf8", "#7dd3fc"]} />
      </div>
      
      <div className="z-10 w-full max-w-5xl flex flex-col items-center">
      {/* Header */}
      <header className="w-full mb-12 bg-white shadow-md border border-gray-100 rounded-2xl">
        <div className="px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <Hexagon className="w-10 h-10 text-blue-600 opacity-90" strokeWidth={1.5} />
              <ShieldCheck className="w-5 h-5 text-cyan-500 absolute" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              CONSTRUCT-SAFE <span className="text-blue-600">AI</span>
            </h1>
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-4">
            {modelInfo && (
              <div className="flex items-center gap-1 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-md">
                <Box className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-gray-700">Model: {modelInfo.model_name} ({modelInfo.inference_device})</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 relative shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
              <span className="text-green-600 font-bold tracking-wide">System Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content wrapped in InfiniteGrid */}
      <div className="flex-grow py-12 w-full">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          {!result && !isLoading && (
            <div className="text-center max-w-4xl mx-auto mb-16 animate-in slide-in-from-bottom-8 duration-700">
              <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tight drop-shadow-sm">
                AI-Powered Construction Safety Inspection
              </h2>
              <p className="text-xl text-slate-700 font-medium mb-10 max-w-2xl mx-auto leading-relaxed">
                Automated visual observation of construction site imagery to detect workers, equipment, and potential safety violations.
              </p>
            
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="bg-white border border-gray-100 p-8 text-center group hover:-translate-y-2 shadow-sm hover:shadow-lg transition-all duration-500 rounded-2xl relative overflow-hidden">
                  <div className="absolute -right-4 -top-6 text-9xl font-black text-gray-100 group-hover:text-blue-50 transition-colors duration-500 z-0 select-none">1</div>
                  <div className="relative z-10">
                    <h3 className="font-extrabold text-slate-900 mb-3 tracking-wide text-xl">Upload</h3>
                    <p className="text-sm text-slate-600 font-semibold leading-relaxed">Securely upload high-resolution construction site imagery.</p>
                  </div>
                </div>
                <div className="bg-white border border-gray-100 p-8 text-center group hover:-translate-y-2 delay-75 shadow-sm hover:shadow-lg transition-all duration-500 rounded-2xl relative overflow-hidden">
                  <div className="absolute -right-4 -top-6 text-9xl font-black text-gray-100 group-hover:text-blue-50 transition-colors duration-500 z-0 select-none">2</div>
                  <div className="relative z-10">
                    <h3 className="font-extrabold text-slate-900 mb-3 tracking-wide text-xl">Analyze</h3>
                    <p className="text-sm text-slate-600 font-semibold leading-relaxed">Computer vision models instantly process the visual data.</p>
                  </div>
                </div>
                <div className="bg-white border border-gray-100 p-8 text-center group hover:-translate-y-2 delay-150 shadow-sm hover:shadow-lg transition-all duration-500 rounded-2xl relative overflow-hidden">
                  <div className="absolute -right-4 -top-6 text-9xl font-black text-gray-100 group-hover:text-blue-50 transition-colors duration-500 z-0 select-none">3</div>
                  <div className="relative z-10">
                    <h3 className="font-extrabold text-slate-900 mb-3 tracking-wide text-xl">Review</h3>
                    <p className="text-sm text-slate-600 font-semibold leading-relaxed">Examine the AI-assisted safety observations and bounding boxes.</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center gap-4 text-sm font-bold text-blue-900/60 mb-4 tracking-widest uppercase drop-shadow-sm">
                <span>✓ PPE Detection</span>
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
            <div className="flex flex-col items-center justify-center py-32 animate-in fade-in duration-500">
              <div className="relative flex justify-center items-center w-24 h-24 mb-6">
                <div className="absolute inset-0 border-t-4 border-blue-600 border-solid rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-r-4 border-cyan-500 border-solid rounded-full animate-spin direction-reverse" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                <Hexagon className="w-8 h-8 text-blue-500 animate-pulse" />
              </div>
              <p className="text-gray-500 font-bold tracking-wider uppercase text-sm">Processing Neural Inference...</p>
            </div>
          )}

          {/* Result Section */}
          {result && imageUrl && !isLoading && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              {/* Professional Report Header */}
              <div className="bg-white border border-gray-200 border-b-4 border-b-gray-900 pb-6 mb-8 p-6 print:bg-white print:border-black print:text-black shadow-sm rounded-xl">
                <div className="flex justify-between items-start mb-6 print:mb-4">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase print:text-black">Inspection Report</h2>
                    <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-widest print:text-gray-600">AI-Assisted Construction Safety Analysis</p>
                  </div>
                  <div className="flex gap-3 print:hidden">
                    <button 
                      onClick={() => window.print()}
                      className="px-4 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 hover:border-gray-900 transition-all rounded-md shadow-sm"
                    >
                      Export Report
                    </button>
                    <button 
                      onClick={() => {
                        setResult(null);
                        setImageUrl(null);
                      }}
                      className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md rounded-md"
                    >
                      New Inspection
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="block text-gray-400 text-xs uppercase tracking-widest font-bold mb-1 print:text-gray-500">Date / Time</span>
                    <span className="font-mono text-gray-900 print:text-black">{new Date().toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="block text-gray-400 text-xs uppercase tracking-widest font-bold mb-1 print:text-gray-500">Status</span>
                    <span className={`font-mono font-bold ${result.status === 'compliant' ? 'text-green-600' : (result.status === 'inconclusive' ? 'text-gray-500' : 'text-red-600')} print:text-black`}>{result.status.toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="block text-gray-400 text-xs uppercase tracking-widest font-bold mb-1 print:text-gray-500">Processing Time</span>
                    <span className="font-mono text-gray-900 print:text-black">{result.processing_time_ms} ms</span>
                  </div>
                  <div>
                    <span className="block text-gray-400 text-xs uppercase tracking-widest font-bold mb-1 print:text-gray-500">Model Version</span>
                    <span className="font-mono text-gray-900 print:text-black">{result.model}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 p-4 shadow-sm rounded-xl text-center mb-8 print:bg-white print:border-black print:shadow-none">
                <div className="flex justify-between items-center mb-4 print:hidden">
                  <h3 className="font-bold text-gray-900 uppercase tracking-widest text-sm">Visual Evidence</h3>
                  <div className="flex bg-gray-100 p-1 rounded-md border border-gray-200">
                    <button 
                      onClick={() => setShowDetections(false)}
                      className={`px-3 py-1.5 text-xs font-bold uppercase transition-all rounded-sm ${!showDetections ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                      Original
                    </button>
                    <button 
                      onClick={() => setShowDetections(true)}
                      className={`px-3 py-1.5 text-xs font-bold uppercase transition-all rounded-sm ${showDetections ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
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
              <div className="mt-12 bg-gray-50 p-6 rounded-xl text-xs text-gray-500 border border-gray-200 print:hidden">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 flex-shrink-0 text-blue-500" />
                  <div>
                    <strong className="block text-gray-900 mb-1 tracking-wider uppercase">AI-Assisted Visual Safety Inspection</strong>
                    <p className="mb-2">AI-assisted inspection — prototype. Results require human verification and are not a substitute for certified safety inspection. This is an automated visual observation prototype (processed in {result.processing_time_ms}ms using {result.model}).</p>
                    <p>Confidence represents the model's certainty for an individual detection, not overall precision.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      </div>
    </div>
  );
}

export default App;
