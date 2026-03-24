import { Droplets, Target, Wind, TrendingUp, Cloud } from "lucide-react";

export function Logic() {
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="pt-4 pb-2">
        <h1 className="text-2xl text-purple-900 mb-1">System Logic</h1>
        <p className="text-sm text-purple-600/70">Understanding the methodology</p>
      </div>

      {/* Card 1: Humidity-led discomfort logic */}
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-purple-200/40 shadow-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100/60 rounded-xl">
            <Droplets className="w-5 h-5 text-blue-700" />
          </div>
          <h3 className="text-purple-900">Humidity-Led Discomfort</h3>
        </div>
        <div className="space-y-3 text-sm text-purple-700/90 leading-relaxed">
          <p>
            Indoor comfort is primarily driven by <strong>relative humidity (RH)</strong>, not just temperature. 
            High RH impairs the body's natural cooling mechanism through perspiration, leading to discomfort 
            even at moderate temperatures.
          </p>
          <p>
            Our system prioritizes RH monitoring because it is the <strong>main driver of thermal discomfort</strong> 
            in typical indoor environments, particularly in temperate climates.
          </p>
        </div>
      </div>

      {/* Card 2: ICS scoring logic */}
      <div className="bg-gradient-to-br from-purple-400/20 to-blue-400/20 backdrop-blur-sm rounded-3xl border border-purple-200/40 shadow-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100/60 rounded-xl">
            <Target className="w-5 h-5 text-purple-700" />
          </div>
          <h3 className="text-purple-900">ICS Scoring Logic</h3>
        </div>
        <div className="space-y-3 text-sm text-purple-700/90 leading-relaxed">
          <p>
            The <strong>Indoor Comfort Score (ICS)</strong> is our primary metric, calculated using a 
            weighted algorithm that emphasizes humidity levels over temperature.
          </p>
          <div className="bg-white/40 rounded-xl p-3 space-y-1 text-xs">
            <div className="flex justify-between">
              <span>100-80:</span>
              <span className="text-green-700">Excellent comfort</span>
            </div>
            <div className="flex justify-between">
              <span>79-60:</span>
              <span className="text-blue-700">Good to moderate comfort</span>
            </div>
            <div className="flex justify-between">
              <span>59-40:</span>
              <span className="text-orange-700">Poor comfort</span>
            </div>
            <div className="flex justify-between">
              <span>Below 40:</span>
              <span className="text-red-700">Very poor comfort</span>
            </div>
          </div>
          <p>
            ICS integrates both current conditions and short-term trend analysis to provide actionable insights.
          </p>
        </div>
      </div>

      {/* Card 3: IORI as contextual relief */}
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-purple-200/40 shadow-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-cyan-100/60 rounded-xl">
            <Wind className="w-5 h-5 text-cyan-700" />
          </div>
          <h3 className="text-purple-900">IORI as Contextual Relief</h3>
        </div>
        <div className="space-y-3 text-sm text-purple-700/90 leading-relaxed">
          <p>
            The <strong>Indoor-Outdoor Relief Index (IORI)</strong> is a <strong>secondary, contextual metric</strong> 
            that helps assess the potential benefit of outdoor ventilation.
          </p>
          <p>
            IORI compares indoor and outdoor conditions to determine whether opening windows might improve comfort. 
            It considers both RH and temperature differentials but does not override ICS as the primary comfort measure.
          </p>
          <p className="text-xs bg-purple-50/60 rounded-lg p-2">
            <strong>Important:</strong> IORI is advisory only. It provides context for ventilation decisions but 
            does not replace ICS-based comfort assessment.
          </p>
        </div>
      </div>

      {/* Card 4: Window-specific forecast logic */}
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-purple-200/40 shadow-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100/60 rounded-xl">
            <TrendingUp className="w-5 h-5 text-purple-700" />
          </div>
          <h3 className="text-purple-900">2-Hour Forecast Window</h3>
        </div>
        <div className="space-y-3 text-sm text-purple-700/90 leading-relaxed">
          <p>
            The system uses a <strong>2-hour operational forecast</strong> as the primary planning horizon. 
            This short-term window is ideal for:
          </p>
          <ul className="space-y-2 ml-4 list-disc list-outside">
            <li>Making immediate ventilation decisions</li>
            <li>Anticipating comfort changes before they occur</li>
            <li>Timing window opening/closing for optimal effect</li>
          </ul>
          <p>
            Your room profile and personal preferences adjust the <strong>conservatism of alerts</strong> within 
            this forecast window, ensuring recommendations match your sensitivity level.
          </p>
        </div>
      </div>

      {/* Card 5: Public outdoor context */}
      <div className="bg-blue-50/60 backdrop-blur-sm rounded-3xl border border-blue-200/40 shadow-md p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100/60 rounded-xl">
            <Cloud className="w-5 h-5 text-blue-700" />
          </div>
          <h3 className="text-purple-900">Public Outdoor Context</h3>
        </div>
        <div className="space-y-3 text-sm text-purple-700/90 leading-relaxed">
          <p>
            Outdoor weather data is sourced from the <strong>Open-Meteo public weather API</strong>, 
            which provides temperature, humidity, and general conditions.
          </p>
          <div className="bg-blue-100/40 rounded-xl p-3 border border-blue-200/30">
            <p className="text-xs text-blue-900">
              <strong>Clarification:</strong> This outdoor data is used as <strong>contextual input only</strong>. 
              It helps calculate IORI and supports ventilation recommendations. It is <strong>not</strong> used to 
              predict long-range indoor comfort — that is determined by indoor sensors and the ICS model.
            </p>
          </div>
          <p className="text-xs">
            The app focuses on indoor environmental analysis. Outdoor conditions provide supporting context 
            for window-based interventions.
          </p>
        </div>
      </div>

      {/* Academic note */}
      <div className="bg-purple-50/60 backdrop-blur-sm rounded-2xl border border-purple-200/30 p-4">
        <p className="text-xs text-purple-700 leading-relaxed text-center">
          This is an academic software recommendation system for coursework demonstration. 
          All logic is research-informed and designed for educational purposes.
        </p>
      </div>
    </div>
  );
}
