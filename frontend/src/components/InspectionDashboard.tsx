import React from 'react';
import type { InspectionResponse } from '../types';
import { ShieldAlert, AlertTriangle, Info, CheckCircle2, UserCircle2, HelpCircle } from 'lucide-react';

interface InspectionDashboardProps {
  data: InspectionResponse;
}

export const InspectionDashboard: React.FC<InspectionDashboardProps> = ({ data }) => {
  const isPpeUnknown = data.violations.some(v => v.type === 'ppe_unknown');

  const renderStatusTag = (status: string) => {
    if (status === 'COMPLIANT' || status === 'compliant') {
      return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold uppercase">COMPLIANT</span>;
    }
    if (status === 'VIOLATION') {
      return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold uppercase">VIOLATION</span>;
    }
    if (status === 'UNKNOWN') {
      return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-bold uppercase">UNKNOWN</span>;
    }
    if (status === 'INCONCLUSIVE' || status === 'inconclusive') {
      return <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-bold uppercase">INCONCLUSIVE</span>;
    }
    return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-bold uppercase">{status}</span>;
  };

  const renderPpeIcon = (status: "COMPLIANT" | "VIOLATION" | "UNKNOWN") => {
    if (status === "COMPLIANT") return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    if (status === "VIOLATION") return <AlertTriangle className="w-4 h-4 text-red-600" />;
    return <HelpCircle className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="flex flex-col gap-6 mt-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-none shadow-sm border border-gray-200 col-span-1 md:col-span-2">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6 border-b border-gray-100 pb-2">Detection Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col pb-3 border-b border-gray-50">
              <span className="text-gray-500 text-xs uppercase tracking-wider font-bold mb-1">Workers Detected</span>
              <span className="font-bold text-gray-900 text-xl">{data.summary.workers_detected}</span>
            </div>
            
            <div className="flex flex-col pb-3 border-b border-gray-50">
              <span className="text-gray-500 text-xs uppercase tracking-wider font-bold mb-1">PPE Compliant</span>
              <span className="font-bold text-green-600 text-xl">
                {isPpeUnknown ? (
                  <span className="text-gray-400 text-sm">Unavailable</span>
                ) : (
                  data.summary.ppe_compliant
                )}
              </span>
            </div>
            
            <div className="flex flex-col pb-3 border-b border-gray-50">
              <span className="text-gray-500 text-xs uppercase tracking-wider font-bold mb-1">PPE Violations</span>
              <span className="font-bold text-red-600 text-xl">
                {isPpeUnknown ? (
                  <span className="text-gray-400 text-sm">Unavailable</span>
                ) : (
                  data.summary.ppe_violations
                )}
              </span>
            </div>
            
            <div className="flex flex-col pb-3 border-b border-gray-50">
              <span className="text-gray-500 text-xs uppercase tracking-wider font-bold mb-1">Equipment</span>
              <span className="font-bold text-gray-900 text-xl">
                {Object.values(data.equipment_detected || {}).reduce((a, b) => a + b, 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Observations / Violations List */}
        <div className="bg-white p-6 rounded-none shadow-sm border border-gray-200 col-span-1 overflow-y-auto max-h-[400px]">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6 border-b border-gray-100 pb-2">Safety Observations</h3>
          {data.violations.length === 0 ? (
            <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-100">
              <ShieldAlert className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm font-medium">No observations recorded.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.violations.map((violation, idx) => (
                <div key={idx} className={`p-3 border-l-4 rounded-r-sm bg-white border-y border-r border-y-gray-100 border-r-gray-100 shadow-sm ${
                  violation.severity === 'high' ? 'border-l-red-600' :
                  violation.severity === 'medium' ? 'border-l-amber-500' :
                  violation.severity === 'info' ? 'border-l-blue-500' :
                  'border-l-gray-400'
                }`}>
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">
                      {violation.severity === 'high' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                      {violation.severity === 'medium' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                      {violation.severity === 'info' && <Info className="w-4 h-4 text-blue-500" />}
                      {violation.severity === 'low' && <Info className="w-4 h-4 text-gray-500" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${
                          violation.severity === 'high' ? 'bg-red-100 text-red-800' :
                          violation.severity === 'medium' ? 'bg-amber-100 text-amber-800' :
                          violation.severity === 'info' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {violation.severity === 'high' ? 'Critical' : violation.severity === 'medium' ? 'Warning' : 'Info'}
                        </span>
                        <h4 className="text-xs font-bold text-gray-900 uppercase truncate">{violation.type.replace(/_/g, ' ')}</h4>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{violation.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 border border-gray-200 p-4 rounded-sm mb-2 text-xs flex flex-wrap gap-4 items-center print:hidden">
        <span className="font-bold uppercase tracking-wider text-gray-700 mr-2">Legend:</span>
        <div className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-600" /> <span className="text-gray-600">COMPLIANT (Sufficient positive evidence)</span></div>
        <div className="flex items-center gap-1"><AlertTriangle className="w-4 h-4 text-red-600" /> <span className="text-gray-600">VIOLATION (Sufficient evidence of missing PPE)</span></div>
        <div className="flex items-center gap-1"><HelpCircle className="w-4 h-4 text-gray-400" /> <span className="text-gray-600">UNKNOWN (Insufficient visual evidence)</span></div>
      </div>

      {/* Worker PPE Status Cards */}
      {data.workers && data.workers.length > 0 && !isPpeUnknown && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data.workers.map((worker) => (
            <div key={worker.worker_id} className="bg-white p-5 rounded-none shadow-sm border border-gray-200 flex flex-col">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <UserCircle2 className="w-8 h-8 text-blue-500/50" />
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg uppercase tracking-wide">Worker {worker.worker_id.toString().padStart(2, '0')}</h4>
                    <span className="text-xs text-gray-500 uppercase tracking-widest">Confidence: {(worker.worker_confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <div>
                  {renderStatusTag(worker.overall_status)}
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                {Object.entries(worker.ppe).map(([ppeType, ppeData]) => (
                  <div key={ppeType} className="flex flex-col p-3 bg-gray-50 border border-gray-100 rounded-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-gray-800 uppercase tracking-wider text-xs w-20">{ppeType}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                          ppeData.status === 'COMPLIANT' ? 'text-green-700' : 
                          ppeData.status === 'VIOLATION' ? 'text-red-700' : 'text-gray-500'
                        }`}>
                          {ppeData.status}
                        </span>
                        {renderPpeIcon(ppeData.status)}
                      </div>
                    </div>
                    <span className="text-xs text-gray-600 mt-1 pl-0">↳ {ppeData.evidence}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
