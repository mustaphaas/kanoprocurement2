import { useState } from "react";
import { mdaLocalStorageService } from "@/lib/mdaLocalStorage";
import {
  Download,
  Upload,
  Trash2,
  Database,
  FileText,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function DataManagement() {
  const [showExportData, setShowExportData] = useState(false);
  const [exportedData, setExportedData] = useState("");
  const [importData, setImportData] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleExportData = () => {
    try {
      const data = mdaLocalStorageService.exportData();
      setExportedData(data);
      setShowExportData(true);
      setMessage({ type: "success", text: "Data exported successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to export data" });
    }
  };

  const handleImportData = () => {
    if (!importData.trim()) {
      setMessage({ type: "error", text: "Please provide data to import" });
      return;
    }

    try {
      mdaLocalStorageService.importData(importData);
      setMessage({
        type: "success",
        text: "Data imported successfully! Please refresh the page.",
      });
      setImportData("");
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to import data. Please check the format.",
      });
    }
  };

  const handleClearAllData = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all MDA data? This action cannot be undone.",
      )
    ) {
      try {
        mdaLocalStorageService.clearAllData();
        setMessage({
          type: "success",
          text: "All data cleared successfully! Please refresh the page.",
        });
      } catch (error) {
        setMessage({ type: "error", text: "Failed to clear data" });
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setMessage({ type: "success", text: "Copied to clipboard!" });
  };

  const downloadAsFile = (data: string) => {
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mda-data-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setMessage({ type: "success", text: "Data file downloaded!" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Database className="h-6 w-6 text-blue-600" />
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Data Management
          </h2>
          <p className="text-sm text-gray-600">
            Manage your localStorage MDA data
          </p>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div
          className={`rounded-lg p-4 ${
            message.type === "success"
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <div className="flex items-center">
            {message.type === "success" ? (
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            )}
            <span
              className={`text-sm ${
                message.type === "success" ? "text-green-800" : "text-red-800"
              }`}
            >
              {message.text}
            </span>
          </div>
        </div>
      )}

      {/* Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Export Data */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center mb-3">
            <Download className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="font-medium text-gray-900">Export Data</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Download your MDA data as a JSON file for backup or transfer.
          </p>
          <button
            onClick={handleExportData}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            Export All Data
          </button>
        </div>

        {/* Import Data */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center mb-3">
            <Upload className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="font-medium text-gray-900">Import Data</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Restore MDA data from a previously exported JSON file.
          </p>
          <div className="space-y-3">
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="Paste your exported JSON data here..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <button
              onClick={handleImportData}
              disabled={!importData.trim()}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 text-sm"
            >
              Import Data
            </button>
          </div>
        </div>

        {/* Clear Data */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center mb-3">
            <Trash2 className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="font-medium text-gray-900">Clear All Data</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Remove all MDA data from localStorage. This cannot be undone.
          </p>
          <button
            onClick={handleClearAllData}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
          >
            Clear All Data
          </button>
        </div>
      </div>

      {/* Export Data Display */}
      {showExportData && exportedData && (
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="font-medium text-gray-900">Exported Data</h3>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => copyToClipboard(exportedData)}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Copy
              </button>
              <button
                onClick={() => downloadAsFile(exportedData)}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
              >
                Download
              </button>
              <button
                onClick={() => setShowExportData(false)}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-md p-4 max-h-96 overflow-auto">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap">
              {exportedData}
            </pre>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">
          About LocalStorage Data
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Data is stored locally in your browser</li>
          <li>• Data persists across browser sessions</li>
          <li>• Clearing browser data will remove all MDA information</li>
          <li>• Export your data regularly for backup</li>
          <li>• Data is only accessible from this browser and device</li>
        </ul>
      </div>
    </div>
  );
}
