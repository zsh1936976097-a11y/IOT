import { useState } from "react";
import { Wifi, Globe, Palette, Bell, Info, ChevronRight, Check, BookOpen } from "lucide-react";

export function Settings() {
  const [selectedSensor, setSelectedSensor] = useState<string>("none");
  const [language, setLanguage] = useState<string>("en");
  const [theme, setTheme] = useState<string>("lavender");
  const [notifications, setNotifications] = useState<boolean>(true);

  const sensors = [
    { id: "none", name: "No sensor connected", status: "Not connected" },
    { id: "xiaomi-temp-01", name: "Xiaomi Temp/Humidity Sensor", status: "Available" },
    { id: "aqara-hub-01", name: "Aqara Smart Hub Sensor", status: "Available" },
    { id: "sensirion-sht31", name: "Sensirion SHT31 Sensor", status: "Available" },
    { id: "bluetooth-therm", name: "Bluetooth Thermometer", status: "Paired" },
  ];

  const languages = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "zh", name: "Chinese", nativeName: "中文" },
    { code: "es", name: "Spanish", nativeName: "Español" },
    { code: "fr", name: "French", nativeName: "Français" },
  ];

  const themes = [
    { id: "lavender", name: "Lavender Dream", colors: ["#e9d5ff", "#ddd6fe", "#c4b5fd"] },
    { id: "ocean", name: "Ocean Blue", colors: ["#bfdbfe", "#93c5fd", "#60a5fa"] },
    { id: "mint", name: "Mint Fresh", colors: ["#d1fae5", "#a7f3d0", "#6ee7b7"] },
    { id: "rose", name: "Rose Garden", colors: ["#fecdd3", "#fda4af", "#fb7185"] },
  ];

  return (
    <div className="p-4 space-y-4 pb-6">
      {/* Header */}
      <div className="pt-4 pb-2">
        <h1 className="text-2xl text-purple-900 mb-1">Settings</h1>
        <h2 className="text-xl text-purple-700">App Configuration</h2>
      </div>

      {/* Sensor Connection Section */}
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-purple-200/40 shadow-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Wifi className="w-5 h-5 text-purple-700" />
          <h3 className="text-purple-900">Sensor Connection</h3>
        </div>
        
        <p className="text-xs text-purple-600/80 mb-4 leading-relaxed">
          Connect a physical sensor to receive real-time temperature and humidity data for more accurate comfort monitoring.
        </p>

        <div className="space-y-2">
          {sensors.map((sensor) => (
            <button
              key={sensor.id}
              onClick={() => setSelectedSensor(sensor.id)}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                selectedSensor === sensor.id
                  ? "bg-purple-100/70 border-purple-400/60"
                  : "bg-white/40 border-purple-200/30 hover:bg-purple-50/50"
              }`}
            >
              <div className="text-left">
                <div className="text-sm text-purple-900">{sensor.name}</div>
                <div className={`text-xs ${
                  sensor.status === "Not connected" 
                    ? "text-slate-500" 
                    : sensor.status === "Paired"
                    ? "text-green-600"
                    : "text-blue-600"
                }`}>
                  {sensor.status}
                </div>
              </div>
              {selectedSensor === sensor.id && (
                <Check className="w-5 h-5 text-purple-700" />
              )}
            </button>
          ))}
        </div>

        {selectedSensor !== "none" && (
          <div className="mt-4 pt-4 border-t border-purple-200/40">
            <button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-shadow">
              Connect Sensor
            </button>
          </div>
        )}
      </div>

      {/* Language Settings */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-purple-200/40 shadow-md p-5">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-purple-700" />
          <h3 className="text-purple-900">Language</h3>
        </div>

        <div className="space-y-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                language === lang.code
                  ? "bg-purple-100/70 border-purple-400/60"
                  : "bg-white/40 border-purple-200/30 hover:bg-purple-50/50"
              }`}
            >
              <div className="text-left">
                <div className="text-sm text-purple-900">{lang.nativeName}</div>
                <div className="text-xs text-purple-600/70">{lang.name}</div>
              </div>
              {language === lang.code && (
                <Check className="w-5 h-5 text-purple-700" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Theme Settings */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-purple-200/40 shadow-md p-5">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-purple-700" />
          <h3 className="text-purple-900">Interface Theme</h3>
        </div>

        <div className="space-y-2">
          {themes.map((themeOption) => (
            <button
              key={themeOption.id}
              onClick={() => setTheme(themeOption.id)}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                theme === themeOption.id
                  ? "bg-purple-100/70 border-purple-400/60"
                  : "bg-white/40 border-purple-200/30 hover:bg-purple-50/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {themeOption.colors.map((color, idx) => (
                    <div
                      key={idx}
                      className="w-6 h-6 rounded-full border border-white/60"
                      style={{ backgroundColor: color }}
                    ></div>
                  ))}
                </div>
                <div className="text-sm text-purple-900">{themeOption.name}</div>
              </div>
              {theme === themeOption.id && (
                <Check className="w-5 h-5 text-purple-700" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-purple-200/40 shadow-md p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-700" />
            <div>
              <h3 className="text-purple-900">Notifications</h3>
              <p className="text-xs text-purple-600/70">Comfort alerts & updates</p>
            </div>
          </div>
          <button
            onClick={() => setNotifications(!notifications)}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              notifications ? "bg-purple-500" : "bg-slate-300"
            }`}
          >
            <div
              className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                notifications ? "translate-x-7" : "translate-x-1"
              }`}
            ></div>
          </button>
        </div>
      </div>

      {/* Other Settings */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-purple-200/40 shadow-md overflow-hidden">
        <button className="w-full flex items-center justify-between p-4 hover:bg-purple-50/50 transition-colors border-b border-purple-200/30">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-purple-700" />
            <div className="text-left">
              <div className="text-sm text-purple-900">About</div>
              <div className="text-xs text-purple-600/70">App version 1.0.0</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-purple-400" />
        </button>

        <button className="w-full flex items-center justify-between p-4 hover:bg-purple-50/50 transition-colors border-b border-purple-200/30">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-purple-700" />
            <div className="text-left">
              <div className="text-sm text-purple-900">Privacy Policy</div>
              <div className="text-xs text-purple-600/70">Data usage & protection</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-purple-400" />
        </button>

        <button className="w-full flex items-center justify-between p-4 hover:bg-purple-50/50 transition-colors">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-purple-700" />
            <div className="text-left">
              <div className="text-sm text-purple-900">Help & Support</div>
              <div className="text-xs text-purple-600/70">FAQs & documentation</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-purple-400" />
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-purple-100/40 backdrop-blur-sm rounded-2xl border border-purple-200/40 p-4">
        <p className="text-xs text-purple-800 leading-relaxed">
          <strong>Note:</strong> Sensor integration enables real-time monitoring. Theme changes will be applied 
          in the next app version. Language selection affects UI text and date/time formatting.
        </p>
      </div>
    </div>
  );
}