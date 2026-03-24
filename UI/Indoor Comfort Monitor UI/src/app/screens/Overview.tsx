import { Droplets, Thermometer, TrendingUp, AlertTriangle, Wind, Clock } from "lucide-react";

export function Overview() {
  // Real data from web dashboard
  const currentTime = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const icsScore = 76;
  const icsChange = "+2%";
  const icsStatus = "Highest Comfort Baseline";
  const indoorTemp = 25.1;
  const indoorRH = 31.4;
  const forecast2h = "STABLE";
  const riskDriver = "HIGH HUMIDITY";
  const riskDriverDetail = "Primary risk";
  const iori = 10.15;
  const lastUpdate = "Updated 3m ago";

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="pt-4 pb-2">
        <h1 className="text-2xl text-purple-900 mb-1">Indoor Comfort</h1>
        <p className="text-sm text-purple-600/70">Monitor & Recommendations</p>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/60 backdrop-blur-sm rounded-2xl border border-purple-200/40 shadow-sm">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-600" />
          <span className="text-sm text-purple-900">{lastUpdate}</span>
        </div>
        <div className="px-3 py-1 bg-purple-100/60 rounded-full">
          <span className="text-xs text-purple-700">Live</span>
        </div>
      </div>

      {/* ICS Hero Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-400/30 to-blue-400/30 backdrop-blur-xl rounded-3xl border border-purple-200/40 shadow-xl p-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl"></div>
        <div className="relative">
          <div className="text-sm text-purple-700 mb-1">Indoor Comfort Score</div>
          <div className="flex items-end gap-3 mb-2">
            <div className="text-6xl text-purple-900">{icsScore}</div>
            <div className="text-2xl text-purple-600 pb-2">/100</div>
            <div className="px-2 py-1 bg-green-100/70 rounded-lg text-sm text-green-700 pb-2">
              {icsChange}
            </div>
          </div>
          <div className="text-lg text-purple-800">{icsStatus}</div>
          <div className="mt-4 pt-4 border-t border-purple-300/30">
            <div className="text-xs text-purple-700/80">
              Digital analysis window: 2-hour operational forecast
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Indoor Temperature */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-purple-200/40 shadow-md p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-orange-100/60 rounded-xl">
              <Thermometer className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-xs text-purple-700">Indoor Temp</div>
          </div>
          <div className="text-2xl text-purple-900">{indoorTemp}°C</div>
          <div className="text-xs text-purple-600/70 mt-1">Optimal range</div>
        </div>

        {/* Indoor RH - Made more prominent */}
        <div className="bg-gradient-to-br from-blue-400/20 to-purple-400/20 backdrop-blur-sm rounded-2xl border border-blue-300/50 shadow-md p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-blue-200/60 rounded-xl">
              <Droplets className="w-4 h-4 text-blue-700" />
            </div>
            <div className="text-xs text-blue-800">Indoor RH</div>
          </div>
          <div className="text-2xl text-blue-900">{indoorRH}%</div>
          <div className="text-xs text-blue-700 mt-1">Main discomfort driver</div>
        </div>

        {/* 2H Forecast */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-purple-200/40 shadow-md p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-purple-100/60 rounded-xl">
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-xs text-purple-700">2H Forecast</div>
          </div>
          <div className="text-lg text-purple-900">{forecast2h}</div>
          <div className="text-xs text-purple-600/70 mt-1">Next 2 hours</div>
        </div>

        {/* Risk Driver */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-purple-200/40 shadow-md p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-red-100/60 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-xs text-purple-700">Risk Driver</div>
          </div>
          <div className="text-lg text-purple-900">{riskDriver}</div>
          <div className="text-xs text-purple-600/70 mt-1">{riskDriverDetail}</div>
        </div>
      </div>

      {/* IORI - Secondary metric */}
      <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-purple-200/30 shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Wind className="w-4 h-4 text-purple-600" />
              <div className="text-sm text-purple-700">IORI</div>
              <div className="px-2 py-0.5 bg-purple-100/60 rounded-full text-xs text-purple-700">
                Contextual
              </div>
            </div>
            <div className="text-xl text-purple-900">{iori}</div>
            <div className="text-xs text-purple-600/70 mt-1">
              Indoor-Outdoor Relief Index
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-purple-600 mb-1">Relief potential</div>
            <div className="text-sm text-purple-900">Low-Moderate</div>
          </div>
        </div>
      </div>

      {/* Comfort Assessment Summary */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-purple-200/40 shadow-md p-5">
        <h3 className="text-purple-900 mb-3">Comfort Assessment</h3>
        <p className="text-sm text-purple-700/90 leading-relaxed">
          Current ICS of <strong>{icsScore}/100</strong> indicates good comfort baseline. However, the primary risk 
          driver is <strong>high humidity</strong> at {indoorRH}%. The 2-hour forecast shows <strong>stable</strong> conditions. 
          IORI of {iori} suggests moderate outdoor relief potential. Proactive analysis recommends monitoring 
          for sustained high indoor RH due to apartment air-tightness.
        </p>
      </div>
    </div>
  );
}