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
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">AI-Powered Construction Site Safety</h2>
            <p className="text-lg text-gray-600 mb-8">
              Analyze construction-site images with computer vision to identify workers, equipment, and potential visual safety hazards.
            </p>
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Inspection Report</h2>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowDetections(!showDetections)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {showDetections ? 'Hide Detections' : 'Show Detections'}
                </button>
                <button 
                  onClick={() => {
                    setResult(null);
                    setImageUrl(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  New Inspection
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
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
