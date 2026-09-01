import React from 'react';
import { InspectionResponse } from '../types';
import { ShieldAlert, AlertTriangle, HardHat, Info } from 'lucide-react';

interface InspectionDashboardProps {
  data: InspectionResponse;
}

export const InspectionDashboard: React.FC<InspectionDashboardProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      {/* Safety Score Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 col-span-1">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Overall Assessment</h3>
        <div className="flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center w-32 h-32 rounded-full border-8 border-gray-100">
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
          <p className="mt-4 text-xs text-gray-500 text-center">AI Safety Assessment Score</p>
          <div className={`mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase ${
            data.status === 'compliant' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
          }`}>
            {data.status === 'compliant' ? 'Compliant' : 'Needs Attention'}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 col-span-1">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Detection Summary</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100">
            <span className="text-gray-600">Workers</span>
            <span className="font-semibold text-gray-900">{data.summary.workers_detected}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-gray-100">
            <span className="text-gray-600">PPE Compliant</span>
            <span className="font-semibold text-gray-900">
              {data.summary.ppe_compliant === null ? 'Unknown' : data.summary.ppe_compliant}
            </span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-gray-100">
            <span className="text-gray-600">Hazards</span>
            <span className="font-semibold text-gray-900">{data.summary.hazards_detected}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Equipment</span>
            <span className="font-semibold text-gray-900">{data.summary.equipment_detected}</span>
          </div>
        </div>
      </div>

      {/* Observations / Violations */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 col-span-1 md:col-span-1 overflow-y-auto max-h-[300px]">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Safety Observations</h3>
        {data.violations.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <ShieldAlert className="w-8 h-8 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No critical observations.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.violations.map((violation, idx) => (
              <div key={idx} className={`p-3 rounded-lg border-l-4 ${
                violation.severity === 'high' ? 'bg-red-50 border-red-500' :
                violation.severity === 'medium' ? 'bg-amber-50 border-amber-500' :
                violation.severity === 'info' ? 'bg-blue-50 border-blue-500' :
                'bg-gray-50 border-gray-500'
              }`}>
                <div className="flex items-start gap-2">
                  {violation.severity === 'info' ? <Info className="w-4 h-4 text-blue-500 mt-0.5" /> : <AlertTriangle className={`w-4 h-4 mt-0.5 ${violation.severity === 'high' ? 'text-red-500' : 'text-amber-500'}`} />}
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 uppercase">{violation.type.replace('_', ' ')}</h4>
                    <p className="text-xs text-gray-600 mt-1">{violation.description}</p>
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
