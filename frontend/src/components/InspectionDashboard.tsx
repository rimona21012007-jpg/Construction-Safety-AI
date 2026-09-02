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
      <div className="glass-panel p-6 col-span-1 border border-white/20">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 border-b border-white/10 pb-2">Overall Assessment</h3>
        <div className="flex flex-col items-center justify-center">
          {isPpeUnknown ? (
            <div className="flex flex-col items-center justify-center w-32 h-32 rounded-full border-4 border-cyan-500/30 bg-black/40 mb-4 p-4 text-center shadow-[inset_0_0_20px_rgba(6,182,212,0.2)]">
              <span className="text-[10px] font-bold text-cyan-200/80 uppercase leading-tight tracking-widest">PPE Analysis<br/>Unavailable</span>
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
          
          <div className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest border ${
            isPpeUnknown ? 'bg-white/10 text-cyan-100 border-white/20' :
            data.status === 'compliant' ? 'bg-green-500/20 text-green-300 border-green-500/50' : 'bg-red-500/20 text-red-300 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
          }`}>
            {isPpeUnknown ? 'Analysis Incomplete' : data.status === 'compliant' ? 'Compliant' : 'Needs Attention'}
          </div>

          {isPpeUnknown && (
            <p className="mt-4 text-xs text-blue-100/60 text-center px-2 font-light">
              Current model detects people but is not trained for construction PPE analysis.
            </p>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="glass-panel p-6 col-span-1 border border-white/20">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 border-b border-white/10 pb-2">Detection Summary</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-white/5">
            <span className="text-blue-100/80 font-medium">Workers</span>
            <span className="font-bold text-white bg-black/30 px-3 py-1 rounded-md border border-white/10">{data.summary.workers_detected}</span>
          </div>
          
          <div className="flex justify-between items-center pb-3 border-b border-white/5">
            <span className="text-blue-100/80 font-medium">PPE Status</span>
            <span className="font-bold text-white">
              {isPpeUnknown ? (
                <span className="text-cyan-200/50 text-[10px] uppercase tracking-widest bg-black/40 border border-white/10 px-2 py-1 rounded-md">Unavailable</span>
              ) : (
                <span className="bg-black/30 px-3 py-1 rounded-md border border-white/10">{data.summary.ppe_compliant}</span>
              )}
            </span>
          </div>
          
          <div className="flex justify-between items-center pb-3 border-b border-white/5">
            <span className="text-blue-100/80 font-medium">Hazards</span>
            <span className={`font-bold px-3 py-1 rounded-md border ${data.summary.hazards_detected > 0 ? 'bg-red-500/20 text-red-300 border-red-500/50' : 'bg-black/30 text-white border-white/10'}`}>
              {data.summary.hazards_detected}
            </span>
          </div>
          
          <div className="flex justify-between items-center pb-3 border-b border-white/5">
            <span className="text-blue-100/80 font-medium">Equipment</span>
            <span className="font-bold text-white bg-black/30 px-3 py-1 rounded-md border border-white/10">{data.summary.equipment_detected}</span>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <h4 className="text-[10px] font-bold text-cyan-200/60 uppercase tracking-widest mb-3">PPE Model Capabilities (Pending)</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-blue-100/40">
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
      <div className="glass-panel p-6 col-span-1 md:col-span-1 overflow-y-auto max-h-[400px] border border-white/20 custom-scrollbar">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 border-b border-white/10 pb-2">Safety Observations</h3>
        {data.violations.length === 0 ? (
          <div className="text-center py-8 text-blue-100/50 bg-black/20 rounded-xl border border-dashed border-white/20">
            <ShieldAlert className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium tracking-wide">No observations recorded.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.violations.map((violation, idx) => (
              <div key={idx} className={`p-4 rounded-lg bg-black/40 border backdrop-blur-sm transition-all duration-300 hover:bg-black/60 hover:shadow-lg ${
                violation.severity === 'high' ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]' :
                violation.severity === 'medium' ? 'border-amber-500/50' :
                violation.severity === 'info' ? 'border-blue-500/50' :
                'border-white/10'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-md bg-black/50">
                    {violation.severity === 'high' && <AlertTriangle className="w-4 h-4 text-red-400" />}
                    {violation.severity === 'medium' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                    {violation.severity === 'info' && <Info className="w-4 h-4 text-blue-400" />}
                    {violation.severity === 'low' && <Info className="w-4 h-4 text-gray-400" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm border ${
                        violation.severity === 'high' ? 'bg-red-500/20 text-red-300 border-red-500/50' :
                        violation.severity === 'medium' ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' :
                        violation.severity === 'info' ? 'bg-blue-500/20 text-blue-300 border-blue-500/50' :
                        'bg-white/10 text-gray-300 border-white/20'
                      }`}>
                        {violation.severity === 'high' ? 'Critical' : violation.severity === 'medium' ? 'Warning' : 'Info'}
                      </span>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider truncate">{violation.type.replace(/_/g, ' ')}</h4>
                    </div>
                    <p className="text-xs text-blue-100/70 leading-relaxed font-light">{violation.description}</p>
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
