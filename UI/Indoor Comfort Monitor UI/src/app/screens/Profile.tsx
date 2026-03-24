import { Building2, Users, Wind, Heart, Bell, Moon } from "lucide-react";

export function Profile() {
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="pt-4 pb-2">
        <h1 className="text-2xl text-purple-900 mb-1">Context Profile</h1>
        <p className="text-sm text-purple-600/70">Building & Personal Settings</p>
      </div>

      {/* Building / Room Information */}
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-purple-200/40 shadow-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-purple-100/60 rounded-xl">
            <Building2 className="w-5 h-5 text-purple-700" />
          </div>
          <h3 className="text-purple-900">Building & Room Information</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-purple-200/30">
            <div>
              <div className="text-xs text-purple-600/70 mb-1">Location</div>
              <div className="text-sm text-purple-900">51.5074° N, 0.1278° W</div>
              <div className="text-xs text-purple-600/70 mt-0.5">London, United Kingdom</div>
            </div>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-purple-200/30">
            <div>
              <div className="text-xs text-purple-600/70 mb-1">Dwelling type</div>
              <div className="text-sm text-purple-900">Apartment / 2nd Floor</div>
            </div>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-purple-200/30">
            <div>
              <div className="text-xs text-purple-600/70 mb-1">Floor / Storey</div>
              <div className="text-sm text-purple-900">2nd floor</div>
            </div>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-purple-200/30">
            <div>
              <div className="text-xs text-purple-600/70 mb-1">Room size</div>
              <div className="text-sm text-purple-900">18 m²</div>
            </div>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-purple-200/30">
            <div>
              <div className="text-xs text-purple-600/70 mb-1">Number of windows</div>
              <div className="text-sm text-purple-900">2 windows</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-purple-600/70 mb-1">Ventilation habit</div>
              <div className="text-sm text-purple-900">Moderate (1-2 times/day)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Preference / Health Profile */}
      <div className="bg-gradient-to-br from-blue-400/20 to-purple-400/20 backdrop-blur-sm rounded-3xl border border-purple-200/40 shadow-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-blue-100/60 rounded-xl">
            <Heart className="w-5 h-5 text-blue-700" />
          </div>
          <h3 className="text-purple-900">Personal Preference</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-purple-200/30">
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-purple-600" />
              <div>
                <div className="text-xs text-purple-600/70 mb-1">Sensitivity mode</div>
                <div className="text-sm text-purple-900">Standard</div>
              </div>
            </div>
            <div className="px-3 py-1 bg-purple-100/60 rounded-full">
              <span className="text-xs text-purple-700">Active</span>
            </div>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-purple-200/30">
            <div className="flex items-center gap-3">
              <Wind className="w-4 h-4 text-purple-600" />
              <div>
                <div className="text-xs text-purple-600/70 mb-1">Respiratory sensitivity</div>
                <div className="text-sm text-purple-900">High Respiratory Sensitivity</div>
                <div className="text-xs text-purple-600/70 mt-0.5">Moderate Awareness</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-purple-200/30">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-purple-600" />
              <div>
                <div className="text-xs text-purple-600/70 mb-1">Alert mode</div>
                <div className="text-sm text-purple-900">Conservative threshold</div>
              </div>
            </div>
            <div className="px-3 py-1 bg-blue-100/60 rounded-full">
              <span className="text-xs text-blue-700">On</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="w-4 h-4 text-purple-600" />
              <div>
                <div className="text-xs text-purple-600/70 mb-1">Night-time protection</div>
                <div className="text-sm text-purple-900">Enhanced monitoring</div>
              </div>
            </div>
            <div className="px-3 py-1 bg-blue-100/60 rounded-full">
              <span className="text-xs text-blue-700">On</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className="bg-purple-50/60 backdrop-blur-sm rounded-2xl border border-purple-200/30 p-4">
        <p className="text-xs text-purple-700 leading-relaxed">
          <strong>Note:</strong> These settings help personalize comfort recommendations and alert thresholds. 
          The system combines building characteristics with your preferences to provide context-aware guidance. 
          This is a recommendation tool, not a medical diagnostic system.
        </p>
      </div>

      {/* Edit button placeholder */}
      <div className="pt-2">
        <button className="w-full py-3 bg-white/60 hover:bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-200/40 shadow-md text-purple-900 transition-all">
          Edit Profile Settings
        </button>
      </div>
    </div>
  );
}