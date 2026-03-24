import icsChartImg from "figma:asset/50df70f8de1da08488d7015041dd469b352cce7c.png";
import ioriChartImg from "figma:asset/4fb145c596fb2446b7efecad13c4d44ee865410e.png";
import tempChartImg from "figma:asset/0a4c5cbad46fbc61aac95121c67460c6e7f5a02c.png";
import rhChartImg from "figma:asset/8a9b4431e3072742895159a94dc01d3be802751d.png";

export function Dynamics() {
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="pt-4 pb-2">
        <h1 className="text-2xl text-purple-900 mb-1">Operational Comfort</h1>
        <h2 className="text-xl text-purple-700">Dynamics</h2>
      </div>

      {/* Main Chart - ICS Comfort Score */}
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-purple-200/40 shadow-xl p-5">
        <div className="mb-4">
          <h3 className="text-purple-900 mb-1">ICS Comfort Score</h3>
          <p className="text-xs text-purple-600/70">Comfort trajectory</p>
        </div>
        
        <div className="w-full">
          <img 
            src={icsChartImg} 
            alt="ICS Comfort Score Chart" 
            className="w-full h-auto rounded-lg"
          />
        </div>

        <div className="mt-4 pt-4 border-t border-purple-200/40 flex items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-purple-600"></div>
            <span className="text-purple-700">Observed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 border-t-2 border-dashed border-purple-600"></div>
            <span className="text-purple-700">Forecast</span>
          </div>
        </div>
      </div>

      {/* Smaller Charts */}
      <div className="space-y-3">
        {/* IORI Chart */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-purple-200/40 shadow-md p-4">
          <div className="mb-3">
            <h4 className="text-sm text-purple-900 mb-0.5">IORI Relief Index</h4>
            <p className="text-xs text-purple-600/70">Relief potential trend</p>
          </div>
          <div className="w-full">
            <img 
              src={ioriChartImg} 
              alt="IORI Relief Index Chart" 
              className="w-full h-auto rounded-lg"
            />
          </div>
          <div className="mt-3 pt-3 border-t border-purple-200/40 flex items-center justify-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-purple-600"></div>
              <span className="text-purple-700">Observed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 border-t-2 border-dashed border-purple-600"></div>
              <span className="text-purple-700">Forecast</span>
            </div>
          </div>
        </div>

        {/* Temperature Chart */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-purple-200/40 shadow-md p-4">
          <div className="mb-3">
            <h4 className="text-sm text-purple-900 mb-0.5">Indoor vs Outdoor Temperature</h4>
            <p className="text-xs text-purple-600/70">Temperature comparison (°C)</p>
          </div>
          <div className="w-full">
            <img 
              src={tempChartImg} 
              alt="Indoor vs Outdoor Temperature Chart" 
              className="w-full h-auto rounded-lg"
            />
          </div>
          <div className="mt-3 pt-3 border-t border-purple-200/40 flex items-center justify-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-purple-500"></div>
              <span className="text-purple-700">Indoor</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-gray-400"></div>
              <span className="text-purple-700">Outdoor</span>
            </div>
          </div>
        </div>

        {/* RH Chart */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-purple-200/40 shadow-md p-4">
          <div className="mb-3">
            <h4 className="text-sm text-purple-900 mb-0.5">Indoor vs Outdoor Relative Humidity</h4>
            <p className="text-xs text-purple-600/70">RH comparison (%)</p>
          </div>
          <div className="w-full">
            <img 
              src={rhChartImg} 
              alt="Indoor vs Outdoor RH Chart" 
              className="w-full h-auto rounded-lg"
            />
          </div>
          <div className="mt-3 pt-3 border-t border-purple-200/40 flex items-center justify-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-purple-500"></div>
              <span className="text-purple-700">Indoor</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-gray-400"></div>
              <span className="text-purple-700">Outdoor</span>
            </div>
          </div>
        </div>
      </div>

      {/* Insight */}
      <div className="bg-purple-100/40 backdrop-blur-sm rounded-2xl border border-purple-200/40 p-4">
        <p className="text-xs text-purple-800 leading-relaxed">
          <strong>Operational insight:</strong> The ICS comfort score shows improvement from 68 to 76 over the evening. 
          IORI rises sharply after 21:00, indicating increasing outdoor relief potential. The widening indoor-outdoor 
          RH gap (indoor stable at ~31%, outdoor rising to 80%+) suggests high humidity is the primary risk driver, 
          while indoor temperature remains stable at 25.1°C.
        </p>
      </div>
    </div>
  );
}