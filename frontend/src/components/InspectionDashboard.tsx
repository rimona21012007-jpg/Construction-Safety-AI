import React from 'react';
import type { InspectionResponse } from '../types';
import { ShieldAlert, AlertTriangle, Info, CheckCircle2, UserCircle2 } from 'lucide-react';

interface InspectionDashboardProps {
  data: InspectionResponse;
}

export const InspectionDashboard: React.FC<InspectionDashboardProps> = ({ data }) => {
  const isPpeUnknown = data.violations.some(v => v.type === 'ppe_unknown');

  const renderPpeIcon = (status: "COMPLIANT" | "VIOLATION" | "UNKNOWN") => {
    if (status === "COMPLIANT") return <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />;
    if (status === "VIOLATION") return <AlertTriangle className="w-4 h-4 text-red-500 mx-auto" />;
    return <span className="text-xs text-gray-300 font-bold">-</span>;
  };

  return (
    <div className="flex flex-col gap-6 mt-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Safety Score Card */}
        <div className="bg-white p-6 rounded-none shadow-sm border border-gray-200 col-span-1">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6 border-b border-gray-100 pb-2">Overall Assessment</h3>
          <div className="flex flex-col items-center justify-center">
            {isPpeUnknown || data.safety_score === null ? (
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
              data.status === 'inconclusive' ? 'bg-gray-100 text-gray-600' :
              data.status === 'compliant' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {data.status === 'inconclusive' ? 'Analysis Incomplete' : data.status === 'compliant' ? 'Compliant' : 'Needs Attention'}
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
              <span className="text-gray-600 font-medium">PPE Compliant</span>
              <span className="font-bold text-green-600">
                {isPpeUnknown ? (
                  <span className="text-gray-400 text-xs uppercase bg-gray-100 px-2 py-1 rounded-sm">Unavailable</span>
                ) : (
                  data.summary.ppe_compliant
                )}
              </span>
            </div>
            
            <div className="flex justify-between items-center pb-3 border-b border-gray-50">
              <span className="text-gray-600 font-medium">PPE Violations</span>
              <span className="font-bold text-red-600">
                {isPpeUnknown ? (
                  <span className="text-gray-400 text-xs uppercase bg-gray-100 px-2 py-1 rounded-sm">Unavailable</span>
                ) : (
                  data.summary.ppe_violations
                )}
              </span>
            </div>
            
            <div className="flex justify-between items-center pb-3 border-b border-gray-50">
              <span className="text-gray-600 font-medium">Equipment</span>
              <span className="font-bold text-gray-900">{data.summary.equipment_detected}</span>
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

      {/* Worker PPE Status Table */}
      {data.workers && data.workers.length > 0 && !isPpeUnknown && (
        <div className="bg-white p-6 rounded-none shadow-sm border border-gray-200">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6 border-b border-gray-100 pb-2">
            Per-Worker PPE Status
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-y border-gray-200 text-xs uppercase tracking-widest text-gray-500">
                  <th className="p-4 font-bold">Worker</th>
                  <th className="p-4 font-bold text-center">Hard Hat</th>
                  <th className="p-4 font-bold text-center">Safety Vest</th>
                  <th className="p-4 font-bold text-center">Gloves</th>
                  <th className="p-4 font-bold text-center">Boots</th>
                  <th className="p-4 font-bold text-center">Goggles</th>
                  <th className="p-4 font-bold text-center">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {data.workers.map((worker) => (
                  <tr key={worker.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <UserCircle2 className="w-8 h-8 text-blue-500/50" />
                        <div>
                          <p className="font-bold text-gray-900">{worker.id}</p>
                          <p className="text-xs text-gray-500">Conf: {(worker.confidence * 100).toFixed(0)}%</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">{renderPpeIcon(worker.ppe.helmet.status)}</td>
                    <td className="p-4 text-center">{renderPpeIcon(worker.ppe.vest.status)}</td>
                    <td className="p-4 text-center">{renderPpeIcon(worker.ppe.gloves.status)}</td>
                    <td className="p-4 text-center">{renderPpeIcon(worker.ppe.boots.status)}</td>
                    <td className="p-4 text-center">{renderPpeIcon(worker.ppe.goggles.status)}</td>
                    <td className="p-4 text-center">
                      {worker.score !== null ? (
                        <span className={`px-2 py-1 rounded-sm text-xs font-bold ${
                          worker.score === 100 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {worker.score}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs italic">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
