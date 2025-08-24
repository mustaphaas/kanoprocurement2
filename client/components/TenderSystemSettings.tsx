import { useState, useEffect } from "react";
import {
  Settings,
  Save,
  RotateCcw,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  tenderSettingsManager,
  TenderSystemSettings,
  tenderStatusChecker,
} from "@/lib/tenderSettings";

export default function TenderSystemSettings() {
  const [settings, setSettings] = useState<TenderSystemSettings>(
    tenderSettingsManager.getSettings(),
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  // Load current settings
  useEffect(() => {
    const currentSettings = tenderSettingsManager.getSettings();
    setSettings(currentSettings);
  }, []);

  const handleSettingChange = (key: keyof TenderSystemSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
    setSaveStatus("idle");
  };

  const handleSaveSettings = () => {
    try {
      setSaveStatus("saving");
      tenderSettingsManager.updateSettings(settings);
      setHasChanges(false);
      setSaveStatus("saved");

      // Reset save status after 2 seconds
      setTimeout(() => {
        setSaveStatus("idle");
      }, 2000);
    } catch (error) {
      console.error("Error saving tender settings:", error);
      setSaveStatus("error");
      setTimeout(() => {
        setSaveStatus("idle");
      }, 3000);
    }
  };

  const handleResetToDefaults = () => {
    if (
      confirm(
        "Are you sure you want to reset all settings to their default values? This action cannot be undone.",
      )
    ) {
      tenderSettingsManager.resetToDefaults();
      const defaultSettings = tenderSettingsManager.getSettings();
      setSettings(defaultSettings);
      setHasChanges(false);
      setSaveStatus("idle");
    }
  };

  const getSaveButtonText = () => {
    switch (saveStatus) {
      case "saving":
        return "Saving...";
      case "saved":
        return "Saved!";
      case "error":
        return "Error";
      default:
        return "Save Settings";
    }
  };

  const getSaveButtonIcon = () => {
    switch (saveStatus) {
      case "saving":
        return <Clock className="h-4 w-4 animate-spin" />;
      case "saved":
        return <CheckCircle className="h-4 w-4" />;
      case "error":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Save className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-blue-100 shadow-xl p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 bg-clip-text text-transparent">
                  Tender System Settings
                </h2>
                <p className="text-lg text-gray-600 font-medium">
                  Configure automatic tender status transitions and evaluation
                  settings
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Transition Settings */}
        <Card className="bg-white/90 backdrop-blur-sm border border-blue-100 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-blue-900">
              <Clock className="h-5 w-5" />
              Status Transition Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Closing Soon Threshold */}
            <div className="space-y-3">
              <Label
                htmlFor="closingSoonThreshold"
                className="text-sm font-medium text-gray-700"
              >
                "Closing Soon" Threshold (Days)
              </Label>
              <div className="space-y-2">
                <Input
                  id="closingSoonThreshold"
                  type="number"
                  min="1"
                  max="30"
                  value={settings.closingSoonThresholdDays}
                  onChange={(e) =>
                    handleSettingChange(
                      "closingSoonThresholdDays",
                      parseInt(e.target.value) || 1,
                    )
                  }
                  className="w-full"
                />
                <p className="text-xs text-gray-600">
                  Number of days before tender deadline when status changes to
                  "Closing Soon". Current setting:{" "}
                  {settings.closingSoonThresholdDays} day
                  {settings.closingSoonThresholdDays !== 1 ? "s" : ""}.
                </p>
              </div>
            </div>

            <Separator />

            {/* Auto Transition Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700">
                  Automatic Status Transitions
                </Label>
                <p className="text-xs text-gray-600">
                  Automatically update tender status based on deadlines (Active
                  → Closing Soon → Closed)
                </p>
              </div>
              <Switch
                checked={settings.autoTransitionEnabled}
                onCheckedChange={(checked) =>
                  handleSettingChange("autoTransitionEnabled", checked)
                }
              />
            </div>

            {/* Current Status Preview */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">
                Status Transition Preview
              </h4>
              <div className="text-sm text-blue-800 space-y-1">
                <div>
                  • Active tender → "Closing Soon" when{" "}
                  {settings.closingSoonThresholdDays} day
                  {settings.closingSoonThresholdDays !== 1 ? "s" : ""} remain
                </div>
                <div>• "Closing Soon" → "Closed" when deadline passes</div>
                <div>
                  • Automatic transitions:{" "}
                  {settings.autoTransitionEnabled ? "Enabled" : "Disabled"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Evaluation Settings */}
        <Card className="bg-white/90 backdrop-blur-sm border border-green-100 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-green-900">
              <CheckCircle className="h-5 w-5" />
              Evaluation Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Auto Evaluation Start */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700">
                  Automatic Evaluation Start
                </Label>
                <p className="text-xs text-gray-600">
                  Automatically trigger evaluation workflow when tenders move to
                  "Closed" status
                </p>
              </div>
              <Switch
                checked={settings.autoEvaluationStartEnabled}
                onCheckedChange={(checked) =>
                  handleSettingChange("autoEvaluationStartEnabled", checked)
                }
              />
            </div>

            <Separator />

            {/* Evaluation Workflow Preview */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h4 className="font-medium text-green-900 mb-2">
                Evaluation Workflow
              </h4>
              <div className="text-sm text-green-800 space-y-1">
                <div>• "Closed" tender → Evaluation stage preparation</div>
                <div>• Committee assignment ready</div>
                <div>• Bid scoring workspace activated</div>
                <div>
                  • Auto-start:{" "}
                  {settings.autoEvaluationStartEnabled ? "Enabled" : "Disabled"}
                </div>
              </div>
            </div>

            {/* Last Updated */}
            <div className="text-xs text-gray-500">
              Last updated: {new Date(settings.lastUpdated).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status Overview */}
      <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-gray-900">
            System Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">
                {settings.closingSoonThresholdDays}
              </div>
              <div className="text-sm text-blue-600">Days Threshold</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-700">
                {settings.autoTransitionEnabled ? "ON" : "OFF"}
              </div>
              <div className="text-sm text-green-600">Auto Transitions</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-700">
                {settings.autoEvaluationStartEnabled ? "ON" : "OFF"}
              </div>
              <div className="text-sm text-purple-600">Auto Evaluation</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-gray-700">ACTIVE</div>
              <div className="text-sm text-gray-600">System Status</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between items-center bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 shadow-lg p-6">
        <Button
          variant="outline"
          onClick={handleResetToDefaults}
          className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <RotateCcw className="h-4 w-4" />
          Reset to Defaults
        </Button>

        <Button
          onClick={handleSaveSettings}
          disabled={!hasChanges || saveStatus === "saving"}
          className={`flex items-center gap-2 ${
            saveStatus === "saved"
              ? "bg-green-600 hover:bg-green-700"
              : saveStatus === "error"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
          } text-white`}
        >
          {getSaveButtonIcon()}
          {getSaveButtonText()}
        </Button>
      </div>
    </div>
  );
}
