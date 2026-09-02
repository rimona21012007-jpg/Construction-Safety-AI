import React from 'react';
import type { InspectionResponse } from '../types';
import { ShieldAlert, AlertTriangle, Info } from 'lucide-react';

interface InspectionDashboardProps {
  data: InspectionResponse;
}

export const InspectionDashboard: React.FC<InspectionDashboardProps> = ({ data }) => {
  // Check if the current model lacks PPE capability
  const isPpeUnknown = data.violations.some(v => v.type === 'ppe_unknown');

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      {/* Safety Score Card */}
      <div className="bg-white p-6 rounded-none shadow-sm border border-gray-200 col-span-1">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6 border-b border-gray-100 pb-2">Overall Assessment</h3>
        <div className="flex flex-col items-center justify-center">
          {isPpeUnknown ? (
            <div className="flex flex-col items-center justify-center w-32 h-32 rounded-full border-4 border-gray-200 bg-gray-50 mb-4 p-4 text-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase leading-tight">PPE Analysis<br/>Unavailable</span>
            </div>
          ) : (
            <div className="relative flex items-center justify-center w-32 h-32 rounded-full border-8 border-gray-100 mb-4">
              <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90">
                <circle
                  cx="64" cy="64" r="56"
                  fill="transparent" stroke={data.safety_score >= 80 ? '#10B981' : data.safety_score >= 50 ? '#F59E0B' : '#EF4444'}
                  strokeWidth="8"
                  strokeDasharray={`${(data.safety_score / 100) * 351} 351`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="text-4xl font-bold text-gray-900">{data.safety_score}</div>
            </div>
          )}
          
          <div className={`px-4 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider ${
            isPpeUnknown ? 'bg-gray-100 text-gray-600' :
            data.status === 'compliant' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isPpeUnknown ? 'Analysis Incomplete' : data.status === 'compliant' ? 'Compliant' : 'Needs Attention'}
          </div>

          {isPpeUnknown && (
            <p className="mt-4 text-xs text-gray-500 text-center px-2">
              Current model detects people but is not trained for construction PPE analysis.
            </p>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-white p-6 rounded-none shadow-sm border border-gray-200 col-span-1">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6 border-b border-gray-100 pb-2">Detection Summary</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-gray-50">
            <span className="text-gray-600 font-medium">Workers</span>
            <span className="font-bold text-gray-900">{data.summary.workers_detected}</span>
          </div>
          
          <div className="flex justify-between items-center pb-3 border-b border-gray-50">
            <span className="text-gray-600 font-medium">PPE Status</span>
            <span className="font-bold text-gray-900">
              {isPpeUnknown ? (
                <span className="text-gray-400 text-xs uppercase bg-gray-100 px-2 py-1 rounded-sm">Unavailable</span>
              ) : (
                data.summary.ppe_compliant
              )}
            </span>
          </div>
          
          <div className="flex justify-between items-center pb-3 border-b border-gray-50">
            <span className="text-gray-600 font-medium">Hazards</span>
            <span className="font-bold text-gray-900">{data.summary.hazards_detected}</span>
          </div>
          
          <div className="flex justify-between items-center pb-3 border-b border-gray-50">
            <span className="text-gray-600 font-medium">Equipment</span>
            <span className="font-bold text-gray-900">{data.summary.equipment_detected}</span>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">PPE Model Capabilities (Pending Integration)</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 opacity-60">
              <div className="flex justify-between"><span>Helmet</span><span>-</span></div>
              <div className="flex justify-between"><span>Vest</span><span>-</span></div>
              <div className="flex justify-between"><span>Gloves</span><span>-</span></div>
              <div className="flex justify-between"><span>Boots</span><span>-</span></div>
              <div className="flex justify-between"><span>Goggles</span><span>-</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Observations / Violations */}
      <div className="bg-white p-6 rounded-none shadow-sm border border-gray-200 col-span-1 md:col-span-1 overflow-y-auto max-h-[400px]">
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
  );
};
