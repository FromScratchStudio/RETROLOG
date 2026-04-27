import { useState, useRef } from "react";
import { useStore, validateImport } from "../../store/useStore";
import { C, FONT } from "../../theme";
import { Card } from "../ui/Card";
import { SectionTitle } from "../ui/SectionTitle";
import { btn, iStyle } from "../ui/helpers";
import type { StoreExport } from "../../types";

const labelStyle: React.CSSProperties = {
  display: "block", fontFamily: FONT.mono, fontSize: "0.62rem",
  color: C.textDim, marginBottom: 4, letterSpacing: "0.06em",
};

export function SettingsView() {
  const { settings, updateSettings, exportData, importData, resetAllData } = useStore();
  const ac = settings.accentColor;

  // App Settings
  const [appName, setAppName] = useState(settings.name);
  const [tagline, setTagline] = useState(settings.tagline);
  const [accentColor, setAccentColor] = useState(settings.accentColor);
  const [defaultSprintDays, setDefaultSprintDays] = useState(settings.defaultSprintDays);
  const [appSavedMsg, setAppSavedMsg] = useState("");

  // User Identity
  const [userId, setUserId] = useState(settings.userId);
  const [userName, setUserName] = useState(settings.userName);
  const [identitySavedMsg, setIdentitySavedMsg] = useState("");

  // Import
  const fileRef = useRef<HTMLInputElement>(null);
  const [importedData, setImportedData] = useState<StoreExport | null>(null);
  const [importError, setImportError] = useState("");
  const [importMode, setImportMode] = useState<"merge" | "overwrite">("merge");
  const [importResult, setImportResult] = useState("");

  // Reset confirmation
  const [resetConfirm, setResetConfirm] = useState(false);
  const [resetText, setResetText] = useState("");

  function saveAppSettings() {
    updateSettings({
      name: appName.trim(),
      tagline: tagline.trim(),
      accentColor,
      defaultSprintDays,
    });
    setAppSavedMsg("✓ Saved!");
    setTimeout(() => setAppSavedMsg(""), 1500);
  }

  function saveIdentity() {
    updateSettings({ userId: userId.trim(), userName: userName.trim() });
    setIdentitySavedMsg("✓ Identity saved!");
    setTimeout(() => setIdentitySavedMsg(""), 1500);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setImportError("");
    setImportedData(null);
    setImportResult("");
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (!validateImport(parsed)) {
          setImportError("Invalid RETROLOG export file.");
          return;
        }
        setImportedData(parsed as StoreExport);
      } catch {
        setImportError("Invalid RETROLOG export file.");
      }
    };
    reader.readAsText(file);
  }

  function doImport() {
    if (!importedData) return;
    const count = importData(importedData, importMode);
    if (importMode === "merge") {
      setImportResult(`✓ Import completed. ${count} items added.`);
    } else {
      setImportResult("✓ Store replaced with imported data.");
    }
    setImportedData(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontFamily: FONT.display, fontSize: "1.2rem", color: C.text }}>Settings</h2>
      </div>

      {/* App Settings */}
      <Card style={{ marginBottom: "1rem" }}>
        <SectionTitle accent={ac}>App Settings</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <div>
            <label style={labelStyle}>App Name</label>
            <input style={iStyle} value={appName} onChange={(e) => setAppName(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Tagline</label>
            <input style={iStyle} value={tagline} onChange={(e) => setTagline(e.target.value)} />
          </div>
          <div style={{ gridColumn: "span 2" }}>
            <label style={labelStyle}>Accent Color</label>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <input
                type="color" value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                style={{ width: 42, height: 32, padding: 2, background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 5, cursor: "pointer" }}
              />
              <input style={{ ...iStyle, width: 110, fontFamily: FONT.mono }} value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)} />
              <div style={{
                flex: 1, height: 12, borderRadius: 6,
                background: `linear-gradient(to right, ${accentColor}22, ${accentColor})`,
              }} />
            </div>
          </div>
          <div style={{ gridColumn: "span 2" }}>
            <label style={labelStyle}>Default Sprint Duration: {defaultSprintDays} days</label>
            <input
              type="range" min={1} max={28} value={defaultSprintDays}
              onChange={(e) => setDefaultSprintDays(Number(e.target.value))}
              style={{ width: "100%", accentColor }}
            />
            <span style={{ fontFamily: FONT.mono, fontSize: "0.65rem", color: C.textDim }}>
              {defaultSprintDays} days
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "1rem" }}>
          <button
            style={{ background: accentColor, color: "#000", border: "none", borderRadius: 5, padding: "0.4rem 1rem", fontSize: "0.78rem", fontFamily: FONT.mono, fontWeight: "bold", cursor: "pointer" }}
            onClick={saveAppSettings}
          >
            Save Changes
          </button>
          {appSavedMsg && (
            <span style={{ fontFamily: FONT.mono, fontSize: "0.72rem", color: C.green }}>{appSavedMsg}</span>
          )}
        </div>
      </Card>

      {/* User Identity */}
      <Card style={{ marginBottom: "1rem" }}>
        <SectionTitle accent={ac}>User Identity</SectionTitle>
        <p style={{ fontSize: "0.72rem", color: C.textDim, marginBottom: "0.75rem", lineHeight: 1.5 }}>
          Each local store is tied to a user identity. This identifier is embedded in exports to track data provenance.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <div>
            <label style={labelStyle}>User ID</label>
            <input style={iStyle} value={userId} onChange={(e) => setUserId(e.target.value)}
              placeholder="e.g. alice@team.io" />
            <div style={{ fontFamily: FONT.mono, fontSize: "0.62rem", color: C.textDim, marginTop: 4 }}>
              Used as the owner identifier in exports and imports.
            </div>
          </div>
          <div>
            <label style={labelStyle}>Display Name</label>
            <input style={iStyle} value={userName} onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. Alice" />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "1rem" }}>
          <button
            style={{ background: accentColor, color: "#000", border: "none", borderRadius: 5, padding: "0.4rem 1rem", fontSize: "0.78rem", fontFamily: FONT.mono, fontWeight: "bold", cursor: "pointer" }}
            onClick={saveIdentity}
          >
            Save Identity
          </button>
          {identitySavedMsg && (
            <span style={{ fontFamily: FONT.mono, fontSize: "0.72rem", color: C.green }}>{identitySavedMsg}</span>
          )}
        </div>
      </Card>

      {/* Export / Import */}
      <Card style={{ marginBottom: "1rem" }}>
        <SectionTitle accent={C.violet}>Data Export & Import</SectionTitle>

        {/* Export */}
        <div style={{ marginBottom: "1.25rem" }}>
          <p style={{ fontSize: "0.72rem", color: C.textDim, marginBottom: "0.5rem", lineHeight: 1.5 }}>
            Download a full JSON backup of your store. The file includes your user identity for traceability.
          </p>
          <button style={{ ...btn(C.violet) }} onClick={exportData}>
            ⬇ Export Data as JSON
          </button>
        </div>

        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: "1rem" }}>
          <p style={{ fontSize: "0.72rem", color: C.textDim, marginBottom: "0.75rem", lineHeight: 1.5 }}>
            Import a JSON file previously exported from RETROLOG. Choose how to merge the data.
          </p>

          {/* File picker */}
          <div style={{ marginBottom: "0.75rem" }}>
            <label style={labelStyle}>Select JSON file</label>
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              style={{ ...iStyle, padding: "0.25rem" }}
            />
          </div>

          {/* Import error */}
          {importError && (
            <div style={{ fontFamily: FONT.mono, fontSize: "0.72rem", color: C.red, marginBottom: "0.5rem" }}>
              {importError}
            </div>
          )}

          {/* Preview */}
          {importedData && (
            <Card style={{ background: C.surfaceAlt, marginBottom: "0.75rem" }}>
              <div style={{ fontFamily: FONT.mono, fontSize: "0.68rem", color: C.textSoft }}>
                Exported by: {importedData.exportedByName} ({importedData.exportedBy})
              </div>
              <div style={{ fontFamily: FONT.mono, fontSize: "0.65rem", color: C.textDim, marginTop: 2 }}>
                Exported at: {importedData.exportedAt}
              </div>
              <div style={{ fontFamily: FONT.mono, fontSize: "0.65rem", color: C.textSoft, marginTop: "0.4rem" }}>
                {importedData.projects.length} projects, {importedData.sprints.length} sprints,{" "}
                {importedData.events.length} events, {importedData.logEntries.length} log entries,{" "}
                {importedData.actionItems.length} actions, {importedData.retrospectives.length} retros
              </div>
            </Card>
          )}

          {/* Mode selector */}
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem" }}>
            {(["merge", "overwrite"] as const).map((mode) => {
              const active = importMode === mode;
              const color = mode === "merge" ? C.cyan : C.red;
              return (
                <button
                  key={mode}
                  onClick={() => setImportMode(mode)}
                  style={{
                    background: active ? color + "22" : C.surfaceAlt,
                    border: active ? `1px solid ${color}44` : `1px solid ${C.border}`,
                    color: active ? color : C.textDim,
                    borderRadius: 5, padding: "0.4rem 0.85rem",
                    fontSize: "0.72rem", fontFamily: FONT.mono,
                    cursor: "pointer",
                  }}
                >
                  {mode === "merge" ? "Merge" : "Overwrite"}
                </button>
              );
            })}
          </div>

          {/* Warning */}
          {importMode === "overwrite" ? (
            <div style={{ borderLeft: `3px solid ${C.red}`, paddingLeft: "0.75rem", marginBottom: "0.75rem" }}>
              <p style={{ fontSize: "0.72rem", color: C.red, lineHeight: 1.5 }}>
                ⚠ This will permanently replace all your local projects, events, and actions with the imported data. Your current data will be lost.
              </p>
            </div>
          ) : (
            <div style={{ borderLeft: `3px solid ${C.cyan}`, paddingLeft: "0.75rem", marginBottom: "0.75rem" }}>
              <p style={{ fontSize: "0.72rem", color: C.cyan, lineHeight: 1.5 }}>
                ℹ Imported data will be added to your existing store. Duplicate IDs will be skipped. Imported items will be tagged with the source user identity.
              </p>
            </div>
          )}

          {/* Import result */}
          {importResult && (
            <div style={{ fontFamily: FONT.mono, fontSize: "0.72rem", color: C.green, marginBottom: "0.75rem" }}>
              {importResult}
            </div>
          )}

          <button
            style={{
              ...btn(ac), background: ac, color: "#000", fontWeight: "bold",
              opacity: importedData ? 1 : 0.4,
              cursor: importedData ? "pointer" : "not-allowed",
            }}
            disabled={!importedData}
            onClick={doImport}
          >
            ⬆ Import
          </button>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card style={{ borderLeft: `3px solid ${C.red}`, marginBottom: "1rem" }}>
        <SectionTitle accent={C.red}>Danger Zone</SectionTitle>

        {/* Reset to defaults */}
        <div style={{ marginBottom: "1rem" }}>
          <p style={{ fontFamily: FONT.mono, fontSize: "0.72rem", color: C.textMuted, marginBottom: "0.5rem", lineHeight: 1.6 }}>
            <strong style={{ color: C.textSoft }}>Reset to default values</strong> — replaces all your data with the
            original sample dataset (projects, sprints, events, actions). Your current data will be lost.
          </p>
          {!resetConfirm ? (
            <button style={btn(C.red)} onClick={() => setResetConfirm(true)}>
              ↺ Reset to Defaults
            </button>
          ) : (
            <div>
              <p style={{ fontFamily: FONT.mono, fontSize: "0.72rem", color: C.red, marginBottom: "0.5rem", lineHeight: 1.5 }}>
                All current data will be replaced with the default sample data. Type <strong>RESET</strong> to confirm.
              </p>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                <input
                  style={{ ...iStyle, width: 160 }}
                  value={resetText}
                  onChange={(e) => setResetText(e.target.value)}
                  placeholder="Type RESET"
                  autoFocus
                />
                <button
                  style={{
                    background: C.red, color: "#fff", border: "none", borderRadius: 5,
                    padding: "0.35rem 0.85rem", fontFamily: FONT.mono, fontSize: "0.72rem",
                    cursor: resetText === "RESET" ? "pointer" : "not-allowed",
                    opacity: resetText === "RESET" ? 1 : 0.5,
                    fontWeight: "bold",
                  }}
                  disabled={resetText !== "RESET"}
                  onClick={() => {
                    resetAllData();
                    setResetConfirm(false);
                    setResetText("");
                  }}
                >
                  Confirm Reset
                </button>
                <button style={btn(C.textDim)} onClick={() => { setResetConfirm(false); setResetText(""); }}>×</button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
