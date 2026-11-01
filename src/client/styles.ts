export const styles = String.raw`
[data-glp] {
  --glp-bg: var(--dsw-alias-bg-base, #ffffff);
  --glp-panel: var(--dsw-alias-bg-layer-1, #ffffff);
  --glp-panel-2: var(--dsw-alias-bg-layer-2, #f7f7f8);
  --glp-panel-3: var(--dsw-alias-bg-layer-3, #efeff1);
  --glp-border: var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.11));
  --glp-border-soft: var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.07));
  --glp-text: var(--dsw-alias-label-primary, #1f2023);
  --glp-text-2: var(--dsw-alias-label-secondary, #60646c);
  --glp-text-3: var(--dsw-alias-label-tertiary, #8b8d98);
  --glp-hover: var(--dsw-alias-interactive-bg-hover, rgba(0, 0, 0, 0.045));
  --glp-active: var(--dsw-alias-interactive-bg-active, rgba(0, 0, 0, 0.07));
  --glp-accent: var(--dsw-alias-brand-primary, #4b5bd7);
  --glp-accent-soft: var(--dsw-alias-interactive-bg-hover-accent, rgba(75, 91, 215, 0.12));
  --glp-success: var(--dsw-alias-state-success-primary, #2f9e44);
  --glp-danger: var(--dsw-alias-state-error-primary, #e5484d);
  --glp-warn: var(--dsw-alias-state-warn-primary, #f76b15);
  --glp-link: var(--dsw-alias-link, #3e63dd);
  --glp-code: var(--dsw-alias-markdown-code-block, #f1f1f3);
  --glp-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  color: var(--glp-text);
  font-size: 12.5px;
  line-height: 1.45;
}
.glp-root {
  --glp-bg: var(--dsw-alias-bg-base, #ffffff);
  --glp-panel: var(--dsw-alias-bg-layer-1, #ffffff);
  --glp-panel-2: var(--dsw-alias-bg-layer-2, #f7f7f8);
  --glp-panel-3: var(--dsw-alias-bg-layer-3, #efeff1);
  --glp-border: var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.11));
  --glp-border-soft: var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.07));
  --glp-text: var(--dsw-alias-label-primary, #1f2023);
  --glp-text-2: var(--dsw-alias-label-secondary, #60646c);
  --glp-text-3: var(--dsw-alias-label-tertiary, #8b8d98);
  --glp-hover: var(--dsw-alias-interactive-bg-hover, rgba(0, 0, 0, 0.045));
  --glp-active: var(--dsw-alias-interactive-bg-active, rgba(0, 0, 0, 0.07));
  --glp-accent: var(--dsw-alias-brand-primary, #4b5bd7);
  --glp-accent-soft: var(--dsw-alias-interactive-bg-hover-accent, rgba(75, 91, 215, 0.12));
  --glp-success: var(--dsw-alias-state-success-primary, #2f9e44);
  --glp-danger: var(--dsw-alias-state-error-primary, #e5484d);
  --glp-warn: var(--dsw-alias-state-warn-primary, #f76b15);
  --glp-link: var(--dsw-alias-link, #3e63dd);
  --glp-code: var(--dsw-alias-markdown-code-block, #f1f1f3);
  --glp-radius: 8px;
  --glp-radius-sm: 6px;
  --glp-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--glp-bg);
  color: var(--glp-text);
  font-size: 12.5px;
  line-height: 1.45;
  overflow: hidden;
  position: relative;
}
.glp-portal {
  --glp-bg: var(--dsw-alias-bg-base, #ffffff);
  --glp-panel: var(--dsw-alias-bg-layer-1, #ffffff);
  --glp-panel-2: var(--dsw-alias-bg-layer-2, #f7f7f8);
  --glp-panel-3: var(--dsw-alias-bg-layer-3, #efeff1);
  --glp-border: var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.11));
  --glp-border-soft: var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.07));
  --glp-text: var(--dsw-alias-label-primary, #1f2023);
  --glp-text-2: var(--dsw-alias-label-secondary, #60646c);
  --glp-text-3: var(--dsw-alias-label-tertiary, #8b8d98);
  --glp-hover: var(--dsw-alias-interactive-bg-hover, rgba(0, 0, 0, 0.045));
  --glp-active: var(--dsw-alias-interactive-bg-active, rgba(0, 0, 0, 0.07));
  --glp-accent: var(--dsw-alias-brand-primary, #4b5bd7);
  --glp-accent-soft: var(--dsw-alias-interactive-bg-hover-accent, rgba(75, 91, 215, 0.12));
  --glp-success: var(--dsw-alias-state-success-primary, #2f9e44);
  --glp-danger: var(--dsw-alias-state-error-primary, #e5484d);
  --glp-warn: var(--dsw-alias-state-warn-primary, #f76b15);
  --glp-link: var(--dsw-alias-link, #3e63dd);
  --glp-code: var(--dsw-alias-markdown-code-block, #f1f1f3);
  --glp-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  color: var(--glp-text);
  font-size: 12.5px;
  line-height: 1.45;
}
.glp-root *, .glp-portal * { box-sizing: border-box; }
.glp-root button, .glp-portal button, .glp-root input, .glp-root textarea, .glp-portal input, .glp-portal textarea { font: inherit; color: inherit; }
.glp-ellipsis { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
.glp-faint { color: var(--glp-text-3); }
.glp-dim { color: var(--glp-text-2); }
.glp-spacer { flex: 1; }
.glp-mono { font-family: var(--glp-mono); }
.glp-row { display: flex; align-items: center; gap: 6px; min-width: 0; }
.glp-col { display: flex; flex-direction: column; min-width: 0; }
.glp-wrap { white-space: pre-wrap; overflow-wrap: anywhere; }
.glp-hidden { display: none !important; }

/* Top bar */
.glp-topbar { display: flex; align-items: center; gap: 4px; height: 38px; padding: 0 6px 0 10px; border-bottom: 0.5px solid var(--glp-border); flex: none; background: var(--glp-panel); }
.glp-repo { font-weight: 600; font-size: 12.5px; max-width: 34%; }
.glp-tabs { display: flex; align-items: center; gap: 1px; margin-left: 4px; min-width: 0; overflow: hidden; }
.glp-tab { border: 0; background: transparent; color: var(--glp-text-2); padding: 5px 7px; border-radius: var(--glp-radius-sm); cursor: pointer; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; position: relative; }
.glp-tab[data-selected] { color: var(--glp-text); background: var(--glp-active); }
.glp-tab-count { font-size: 10.5px; color: var(--glp-text-2); background: var(--glp-panel-3); border-radius: 999px; padding: 0 5px; min-width: 16px; text-align: center; line-height: 16px; }
.glp-topbar-actions { display: flex; align-items: center; gap: 2px; margin-left: auto; }
.glp-bell { position: relative; }
.glp-count-badge { position: absolute; top: -4px; right: -4px; min-width: 14px; height: 14px; padding: 0 3px; border-radius: 999px; background: var(--glp-accent); color: #fff; font-size: 9px; line-height: 14px; text-align: center; }
.glp-count-badge[data-tone="warn"] { background: var(--glp-warn); }

/* Buttons and inputs */
.glp-btn { display: inline-flex; align-items: center; justify-content: center; gap: 4px; border: 0.5px solid var(--glp-border); background: var(--glp-panel); color: var(--glp-text); border-radius: 6px; padding: 3px 8px; min-height: 24px; cursor: pointer; white-space: nowrap; font-size: 12px; }
.glp-btn:hover { background: var(--glp-hover); }
.glp-btn:disabled { opacity: 0.5; cursor: default; }
.glp-btn[data-variant="primary"] { background: var(--glp-accent); border-color: transparent; color: #fff; }
.glp-btn[data-variant="primary"]:hover { filter: brightness(1.06); }
.glp-btn[data-variant="ghost"] { background: transparent; border-color: transparent; color: var(--glp-text-2); }
.glp-btn[data-variant="ghost"]:hover { background: var(--glp-hover); color: var(--glp-text); }
.glp-btn[data-variant="danger"] { color: var(--glp-danger); }
.glp-btn[data-size="sm"] { min-height: 21px; padding: 1px 6px; font-size: 11.5px; }
.glp-icon-btn { border: 0; background: transparent; color: var(--glp-text-2); width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; border-radius: 6px; cursor: pointer; padding: 0; flex: none; }
.glp-icon-btn:hover { background: var(--glp-hover); color: var(--glp-text); }
.glp-icon-btn:disabled { opacity: 0.45; cursor: default; }
.glp-icon-btn[data-pressed] { background: var(--glp-active); color: var(--glp-text); }
.glp-input, .glp-textarea, .glp-select { width: 100%; border: 0.5px solid var(--glp-border); background: var(--glp-panel); border-radius: 6px; padding: 5px 8px; min-width: 0; outline: none; }
.glp-input:focus, .glp-textarea:focus, .glp-select:focus { border-color: var(--glp-accent); box-shadow: 0 0 0 2px var(--glp-accent-soft); }
.glp-textarea { resize: vertical; min-height: 70px; font-family: inherit; }
.glp-textarea[data-mono] { font-family: var(--glp-mono); font-size: 11.5px; }
.glp-checkbox { display: inline-flex; align-items: center; gap: 6px; user-select: none; cursor: pointer; }
.glp-checkbox input { accent-color: var(--glp-accent); }

/* Layout */
.glp-body { flex: 1; min-height: 0; overflow: auto; overscroll-behavior: contain; }
.glp-body-inner { padding: 8px 10px 40px; }
.glp-section { padding: 8px 10px; border-bottom: 0.5px solid var(--glp-border-soft); }
.glp-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 40px 24px; color: var(--glp-text-2); text-align: center; }
.glp-empty[data-inline] { padding: 14px; flex-direction: row; text-align: left; }
.glp-error { color: var(--glp-danger); }
.glp-alert { border: 1px solid color-mix(in oklab, var(--glp-warn) 40%, transparent); background: color-mix(in oklab, var(--glp-warn) 10%, var(--glp-panel)); color: var(--glp-text); padding: 8px 10px; border-radius: var(--glp-radius-sm); display: flex; gap: 8px; align-items: flex-start; margin: 8px 10px; }
.glp-alert[data-tone="error"] { border-color: color-mix(in oklab, var(--glp-danger) 40%, transparent); background: color-mix(in oklab, var(--glp-danger) 9%, var(--glp-panel)); }
.glp-alert[data-tone="info"] { border-color: var(--glp-border); background: var(--glp-panel-2); }
.glp-spinner { width: 14px; height: 14px; border: 2px solid var(--glp-border); border-top-color: var(--glp-accent); border-radius: 50%; animation: glp-spin 0.8s linear infinite; flex: none; }
@keyframes glp-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .glp-spinner { animation-duration: 2.5s; } }

/* Branch bar */
.glp-branchbar { flex: none; border-bottom: 0.5px solid var(--glp-border); background: var(--glp-panel); padding: 5px 8px; display: flex; flex-direction: column; gap: 4px; }
.glp-branch-row { display: flex; align-items: center; gap: 4px; min-width: 0; }
.glp-branch-button { display: flex; align-items: center; gap: 5px; max-width: 55%; border: 0; background: transparent; padding: 3px 5px; border-radius: 6px; cursor: pointer; font-weight: 550; min-width: 0; }
.glp-branch-button:hover { background: var(--glp-hover); }
.glp-upstream { font-size: 11px; color: var(--glp-text-3); max-width: 30%; }
.glp-ahead-behind { display: inline-flex; align-items: center; gap: 1px; font-size: 10.5px; color: var(--glp-text-2); }
.glp-ahead-behind[data-active] { color: var(--glp-text); font-weight: 600; }
.glp-branch-strip { display: flex; align-items: center; gap: 6px; padding: 4px 5px; border-radius: 6px; background: var(--glp-panel-2); min-height: 26px; font-size: 11.5px; overflow: hidden; }
.glp-branch-strip[data-tone="success"] { background: color-mix(in oklab, var(--glp-success) 10%, var(--glp-panel)); }
.glp-branch-strip[data-tone="danger"] { background: color-mix(in oklab, var(--glp-danger) 9%, var(--glp-panel)); }
.glp-branch-strip[data-tone="warn"] { background: color-mix(in oklab, var(--glp-warn) 10%, var(--glp-panel)); }
.glp-pill { display: inline-flex; align-items: center; gap: 3px; border-radius: 999px; padding: 0 6px; height: 18px; font-size: 10.5px; background: var(--glp-panel-3); color: var(--glp-text-2); white-space: nowrap; }
.glp-pill[data-tone="success"] { background: color-mix(in oklab, var(--glp-success) 16%, var(--glp-panel)); color: var(--glp-success); }
.glp-pill[data-tone="danger"] { background: color-mix(in oklab, var(--glp-danger) 16%, var(--glp-panel)); color: var(--glp-danger); }
.glp-pill[data-tone="warn"] { background: color-mix(in oklab, var(--glp-warn) 16%, var(--glp-panel)); color: var(--glp-warn); }
.glp-pill[data-tone="accent"] { background: var(--glp-accent-soft); color: var(--glp-accent); }
.glp-pill[data-tone="draft"] { border: 1px dashed var(--glp-border); background: transparent; color: var(--glp-text-2); }

/* Lists */
.glp-list { display: flex; flex-direction: column; }
.glp-row-item { display: flex; align-items: flex-start; gap: 8px; padding: 8px 10px; border-bottom: 0.5px solid var(--glp-border-soft); cursor: pointer; position: relative; min-height: 44px; }
.glp-row-item[data-compact] { padding: 5px 10px; min-height: 30px; align-items: center; }
.glp-row-item[data-active] { background: var(--glp-active); }
.glp-row-item[data-new]::before { content: ""; position: absolute; left: 3px; top: 12px; width: 3px; height: 3px; border-radius: 50%; background: var(--glp-accent); }
.glp-row-item[data-updated]::before { content: ""; position: absolute; left: 2px; top: 10px; width: 5px; height: 5px; border: 1px solid var(--glp-accent); border-radius: 50%; }
.glp-row-check { width: 16px; height: 16px; margin-top: 2px; flex: none; display: flex; align-items: center; justify-content: center; }
.glp-row-check input { accent-color: var(--glp-accent); margin: 0; }
.glp-row-content { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 2px; }
.glp-row-title { font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: flex; align-items: center; gap: 5px; }
.glp-row-title .glp-num { color: var(--glp-text-3); font-weight: 400; flex: none; }
.glp-row-meta { display: flex; align-items: center; gap: 6px; color: var(--glp-text-3); font-size: 11px; overflow: hidden; white-space: nowrap; flex-wrap: wrap; }
.glp-row-end { flex: none; display: flex; align-items: center; gap: 6px; color: var(--glp-text-3); font-size: 11px; }
.glp-labels { display: flex; align-items: center; gap: 3px; overflow: hidden; flex-wrap: wrap; }
.glp-label { display: inline-flex; align-items: center; height: 16px; padding: 0 6px; border-radius: 999px; font-size: 10px; line-height: 1; white-space: nowrap; border: 1px solid currentColor; font-weight: 500; }
.glp-avatar { width: 18px; height: 18px; border-radius: 50%; corner-shape: round; display: inline-flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 700; color: #fff; flex: none; text-transform: uppercase; }
.glp-state { width: 16px; height: 16px; flex: none; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; }
.glp-state[data-state="OPEN"] { color: var(--glp-success); }
.glp-state[data-state="MERGED"] { color: #8250df; }
.glp-state[data-state="CLOSED"] { color: var(--glp-danger); }
.glp-state[data-state="DRAFT"] { color: var(--glp-text-2); }
.glp-check-dot { width: 7px; height: 7px; border-radius: 50%; corner-shape: round; display: inline-block; flex: none; }
.glp-check-dot[data-state="success"] { background: var(--glp-success); }
.glp-check-dot[data-state="failure"] { background: var(--glp-danger); }
.glp-check-dot[data-state="pending"] { background: var(--glp-warn); }
.glp-check-dot[data-state="none"] { display: none; }

/* Search header */
.glp-search-head { position: sticky; top: 0; z-index: 3; background: var(--glp-panel); border-bottom: 0.5px solid var(--glp-border); padding: 6px 8px 5px; display: flex; flex-direction: column; gap: 5px; }
.glp-search-box { display: flex; align-items: center; gap: 5px; border: 0.5px solid var(--glp-border); border-radius: 7px; padding: 0 6px; background: var(--glp-bg); }
.glp-search-box:focus-within { border-color: var(--glp-accent); box-shadow: 0 0 0 2px var(--glp-accent-soft); }
.glp-search-box input { border: 0; background: transparent; outline: none; height: 26px; min-width: 0; flex: 1; }
.glp-presets { display: flex; gap: 4px; overflow-x: auto; scrollbar-width: none; }
.glp-presets::-webkit-scrollbar { display: none; }
.glp-preset { border: 0.5px solid var(--glp-border); background: var(--glp-panel); color: var(--glp-text-2); border-radius: 999px; padding: 1px 8px; font-size: 11px; cursor: pointer; white-space: nowrap; }
.glp-preset[data-selected] { background: var(--glp-accent-soft); color: var(--glp-accent); border-color: transparent; }
.glp-chip-row { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; font-size: 11px; }
.glp-chip { display: inline-flex; align-items: center; gap: 3px; background: var(--glp-panel-2); border-radius: 999px; padding: 1px 7px; color: var(--glp-text-2); }
.glp-chip button { border: 0; background: transparent; cursor: pointer; color: var(--glp-text-3); padding: 0; line-height: 1; }
.glp-suggestions { position: absolute; left: 8px; right: 8px; top: 100%; background: var(--glp-panel); border: 0.5px solid var(--glp-border); box-shadow: var(--dsw-elevation-panel, 0 8px 24px rgba(0,0,0,0.16)); border-radius: 8px; z-index: 20; padding: 4px; max-height: 220px; overflow: auto; }
.glp-suggestion { display: flex; align-items: center; gap: 6px; padding: 4px 7px; border-radius: 5px; cursor: pointer; font-size: 11.5px; }
.glp-suggestion[data-active] { background: var(--glp-active); }
.glp-suggestion small { color: var(--glp-text-3); margin-left: auto; }
.glp-results-line { display: flex; align-items: center; gap: 6px; padding: 4px 10px; color: var(--glp-text-3); font-size: 11px; border-bottom: 0.5px solid var(--glp-border-soft); min-height: 25px; position: sticky; top: 0; background: var(--glp-bg); z-index: 2; }
.glp-bulkbar { display: flex; align-items: center; gap: 4px; padding: 3px 8px; min-height: 28px; border-bottom: 0.5px solid var(--glp-border); background: var(--glp-accent-soft); position: sticky; top: 0; z-index: 4; }
.glp-bulkbar .glp-btn { background: var(--glp-panel); }

/* Changes */
.glp-group { border-bottom: 0.5px solid var(--glp-border-soft); }
.glp-group-head { display: flex; align-items: center; gap: 4px; width: 100%; padding: 4px 8px; border: 0; background: transparent; color: var(--glp-text-2); cursor: pointer; font-size: 11px; text-transform: uppercase; letter-spacing: 0.03em; }
.glp-group-head:hover { background: var(--glp-hover); }
.glp-group-title { font-weight: 600; }
.glp-group-body { display: flex; flex-direction: column; }
.glp-file { display: flex; align-items: center; gap: 5px; padding: 2px 8px 2px 20px; min-height: 24px; cursor: pointer; position: relative; }
.glp-file:hover { background: var(--glp-hover); }
.glp-file[data-selected] { background: var(--glp-active); }
.glp-file-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; direction: rtl; text-align: left; font-size: 11.5px; }
.glp-file-name span { direction: ltr; unicode-bidi: embed; }
.glp-file-actions { display: none; gap: 1px; flex: none; }
.glp-file:hover .glp-file-actions, .glp-file:focus-within .glp-file-actions { display: flex; }
.glp-file-status { width: 14px; text-align: center; font-size: 10px; font-weight: 700; flex: none; }
.glp-file-status[data-code="M"] { color: var(--glp-warn); }
.glp-file-status[data-code="A"], .glp-file-status[data-code="?"] { color: var(--glp-success); }
.glp-file-status[data-code="D"] { color: var(--glp-danger); }
.glp-file-status[data-code="R"], .glp-file-status[data-code="C"] { color: var(--glp-accent); }
.glp-file-status[data-code="U"] { color: var(--glp-danger); }
.glp-file-diff { border-top: 0.5px solid var(--glp-border-soft); border-bottom: 0.5px solid var(--glp-border-soft); background: var(--glp-panel-2); }
.glp-commit-box { padding: 8px 10px 12px; display: flex; flex-direction: column; gap: 6px; }
.glp-commit-actions { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
.glp-unpushed { border-top: 0.5px solid var(--glp-border); padding: 6px 10px 14px; }
.glp-unpushed-row { display: flex; align-items: center; gap: 6px; padding: 3px 0; font-size: 11.5px; }
.glp-hash { font-family: var(--glp-mono); font-size: 10.5px; color: var(--glp-text-3); flex: none; }

/* Diff */
.glp-diff { font-family: var(--glp-mono); font-size: 11.5px; line-height: 1.5; overflow: auto; max-height: 460px; background: var(--glp-panel); }
.glp-diff-table { min-width: 100%; border-collapse: collapse; }
.glp-diff-line { white-space: pre; }
.glp-diff-line[data-kind="add"] { background: var(--dsw-alias-file-diff-added-bg, rgba(46, 160, 67, 0.12)); }
.glp-diff-line[data-kind="del"] { background: var(--dsw-alias-file-diff-deleted-bg, rgba(248, 81, 73, 0.12)); }
.glp-diff-line[data-kind="hunk"] { background: var(--glp-panel-3); color: var(--glp-text-2); }
.glp-diff-num { width: 1%; min-width: 30px; text-align: right; padding: 0 5px; color: var(--glp-text-3); user-select: none; border-right: 0.5px solid var(--glp-border-soft); cursor: pointer; }
.glp-diff-num:hover { color: var(--glp-accent); background: var(--glp-accent-soft); }
.glp-diff-text { padding: 0 8px 0 6px; white-space: pre; }
.glp-diff-marker { width: 12px; user-select: none; padding-left: 4px; color: var(--glp-text-3); }
.glp-diff-empty { padding: 10px; color: var(--glp-text-3); font-family: inherit; }

/* Graph */
.glp-graph-scope { display: flex; align-items: center; gap: 2px; padding: 5px 8px; border-bottom: 0.5px solid var(--glp-border-soft); position: sticky; top: 0; background: var(--glp-bg); z-index: 2; }
.glp-graph-row { display: flex; align-items: stretch; border-bottom: 0.5px solid var(--glp-border-soft); cursor: pointer; min-height: 28px; }
.glp-graph-row:hover { background: var(--glp-hover); }
.glp-graph-row[data-selected] { background: var(--glp-active); }
.glp-graph-svg { flex: none; }
.glp-graph-main { flex: 1; min-width: 0; display: flex; align-items: center; gap: 6px; padding: 3px 8px 3px 0; }
.glp-graph-subject { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.glp-graph-meta { color: var(--glp-text-3); font-size: 10.5px; white-space: nowrap; flex: none; max-width: 40%; overflow: hidden; text-overflow: ellipsis; }
.glp-ref { display: inline-flex; align-items: center; height: 15px; padding: 0 5px; border-radius: 3px; font-size: 9.5px; line-height: 1; max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: none; }
.glp-ref[data-kind="head"] { background: var(--glp-accent); color: #fff; }
.glp-ref[data-kind="local"] { background: var(--glp-accent-soft); color: var(--glp-accent); }
.glp-ref[data-kind="remote"] { background: var(--glp-panel-3); color: var(--glp-text-2); }
.glp-ref[data-kind="tag"] { background: color-mix(in oklab, var(--glp-warn) 18%, var(--glp-panel)); color: var(--glp-warn); }
.glp-commit-detail { padding: 8px 10px; background: var(--glp-panel-2); border-bottom: 0.5px solid var(--glp-border); display: flex; flex-direction: column; gap: 6px; }
.glp-commit-detail-actions { display: flex; gap: 4px; flex-wrap: wrap; }
.glp-commit-files { display: flex; flex-direction: column; gap: 1px; }
.glp-commit-file { display: flex; align-items: center; gap: 6px; padding: 2px 4px; border-radius: 4px; font-size: 11.5px; cursor: pointer; }
.glp-commit-file:hover { background: var(--glp-hover); }

/* Item detail */
.glp-item { padding: 10px 12px 40px; display: flex; flex-direction: column; gap: 10px; }
.glp-item-head { display: flex; align-items: flex-start; gap: 8px; }
.glp-item-title { font-size: 14px; font-weight: 600; line-height: 1.35; overflow-wrap: anywhere; }
.glp-item-meta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; color: var(--glp-text-3); font-size: 11.5px; }
.glp-item-actions { display: flex; gap: 4px; flex-wrap: wrap; }
.glp-item-tabs { display: flex; align-items: center; gap: 1px; border-bottom: 0.5px solid var(--glp-border); padding: 0 12px; position: sticky; top: 0; background: var(--glp-bg); z-index: 3; }
.glp-item-tab { border: 0; border-bottom: 2px solid transparent; background: transparent; padding: 6px 8px; color: var(--glp-text-2); cursor: pointer; font-size: 12px; margin-bottom: -0.5px; }
.glp-item-tab[data-selected] { color: var(--glp-text); border-bottom-color: var(--glp-accent); }
.glp-md { font-size: 12.5px; line-height: 1.6; overflow-wrap: anywhere; }
.glp-md h1, .glp-md h2, .glp-md h3, .glp-md h4 { font-size: 13.5px; margin: 12px 0 5px; line-height: 1.35; }
.glp-md h1 { font-size: 15px; }
.glp-md p { margin: 5px 0; }
.glp-md ul, .glp-md ol { margin: 5px 0; padding-left: 20px; }
.glp-md li { margin: 2px 0; }
.glp-md code { font-family: var(--glp-mono); font-size: 11.5px; background: var(--glp-code); border-radius: 4px; padding: 1px 4px; }
.glp-md pre { background: var(--glp-code); border-radius: 6px; padding: 8px; overflow: auto; margin: 6px 0; }
.glp-md pre code { background: transparent; padding: 0; }
.glp-md blockquote { border-left: 3px solid var(--glp-border); margin: 6px 0; padding: 0 10px; color: var(--glp-text-2); }
.glp-md a { color: var(--glp-link); text-decoration: none; font-weight: 500; }
.glp-md a:hover { text-decoration: underline dotted; }
.glp-md hr { border: 0; border-top: 0.5px solid var(--glp-border); margin: 10px 0; }
.glp-md table { border-collapse: collapse; display: block; overflow: auto; max-width: 100%; }
.glp-md th, .glp-md td { border: 0.5px solid var(--glp-border); padding: 3px 6px; }
.glp-md img { max-width: 100%; }
.glp-comment { border: 0.5px solid var(--glp-border); border-radius: var(--glp-radius); overflow: hidden; background: var(--glp-panel); }
.glp-comment-head { display: flex; align-items: center; gap: 6px; padding: 5px 8px; background: var(--glp-panel-2); border-bottom: 0.5px solid var(--glp-border-soft); color: var(--glp-text-3); font-size: 11px; }
.glp-comment-body { padding: 8px 10px; }
.glp-clamp { position: relative; }
.glp-clamp-box { overflow: hidden; }
.glp-clamp-toggle { margin-top: 3px; border: 0; background: transparent; color: var(--glp-link); cursor: pointer; padding: 0; font-size: 11.5px; }
.glp-thread { border: 0.5px solid var(--glp-border); border-radius: 6px; margin: 6px 0; overflow: hidden; background: var(--glp-panel); }
.glp-thread[data-resolved] { opacity: 0.72; }
.glp-thread-hunk { background: var(--glp-code); font-family: var(--glp-mono); font-size: 10.5px; white-space: pre; overflow: auto; padding: 5px 8px; border-bottom: 0.5px solid var(--glp-border-soft); max-height: 130px; }
.glp-thread-head { display: flex; align-items: center; gap: 6px; padding: 4px 8px; font-size: 11px; color: var(--glp-text-3); border-bottom: 0.5px solid var(--glp-border-soft); }
.glp-thread-note { padding: 6px 8px; border-top: 0.5px solid var(--glp-border-soft); }
.glp-thread-note:first-child { border-top: 0; }
.glp-thread-actions { display: flex; gap: 4px; align-items: center; padding: 4px 8px; border-top: 0.5px solid var(--glp-border-soft); }
.glp-review-bar { border: 1px solid var(--glp-accent); background: var(--glp-accent-soft); border-radius: var(--glp-radius); padding: 8px 10px; display: flex; flex-direction: column; gap: 6px; }
.glp-files-toolbar { display: flex; align-items: center; gap: 4px; padding: 5px 10px; border-bottom: 0.5px solid var(--glp-border-soft); position: sticky; top: 0; background: var(--glp-bg); z-index: 2; }
.glp-file-block { border-bottom: 0.5px solid var(--glp-border); }
.glp-file-block-head { display: flex; align-items: center; gap: 6px; padding: 5px 10px; background: var(--glp-panel-2); cursor: pointer; font-size: 11.5px; position: sticky; top: 25px; z-index: 1; }
.glp-file-block-head .glp-file-name { direction: ltr; }
.glp-checks { padding: 8px 10px; display: flex; flex-direction: column; gap: 6px; }
.glp-check-row { display: flex; align-items: center; gap: 7px; padding: 5px 8px; border: 0.5px solid var(--glp-border); border-radius: 6px; cursor: pointer; background: var(--glp-panel); }
.glp-check-row:hover { background: var(--glp-hover); }
.glp-check-row[data-state="failure"] { border-color: color-mix(in oklab, var(--glp-danger) 40%, transparent); }

/* Menus, dialogs, toasts, hover cards */
.glp-portal { position: fixed; inset: 0; z-index: 2147483000; }
.glp-mask { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.42); }
.glp-dialog { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: min(520px, calc(100vw - 32px)); max-height: calc(100vh - 60px); overflow: auto; background: var(--glp-panel, #fff); border: 0; border-radius: 12px; box-shadow: var(--dsw-elevation-prominent, 0 18px 60px rgba(0,0,0,0.28)); color: var(--glp-text, #1f2023); padding: 16px; display: flex; flex-direction: column; gap: 10px; }
.glp-dialog h2 { margin: 0; font-size: 15px; font-weight: 600; }
.glp-dialog-actions { display: flex; justify-content: flex-end; gap: 6px; margin-top: 2px; }
.glp-menu { position: absolute; min-width: 190px; max-width: 300px; background: var(--glp-panel, #fff); border: 0; border-radius: 8px; box-shadow: var(--dsw-elevation-panel, 0 10px 34px rgba(0,0,0,0.2)); padding: 4px; color: var(--glp-text, #1f2023); z-index: 2147483001; max-height: 420px; overflow: auto; }
.glp-menu-item { display: flex; align-items: center; gap: 7px; width: 100%; border: 0; background: transparent; padding: 5px 7px; border-radius: 5px; cursor: pointer; text-align: left; font-size: 12px; color: inherit; }
.glp-menu-item:hover:not(:disabled) { background: var(--glp-hover, rgba(0,0,0,0.05)); }
.glp-menu-item:disabled { opacity: 0.45; cursor: default; }
.glp-menu-sep { height: 1px; background: var(--glp-border, rgba(0,0,0,0.1)); margin: 4px 2px; }
.glp-toasts { position: fixed; right: 16px; bottom: 16px; z-index: 2147483100; display: flex; flex-direction: column; gap: 8px; max-width: min(380px, calc(100vw - 32px)); pointer-events: none; }
.glp-toast { pointer-events: auto; background: var(--dsw-alias-bg-overlay, #202124); color: #fff; border-radius: 9px; padding: 9px 12px; box-shadow: 0 10px 32px rgba(0,0,0,0.25); display: flex; flex-direction: column; gap: 2px; font-size: 12px; }
.glp-toast[data-tone="error"] { background: color-mix(in oklab, var(--glp-danger) 85%, #000); }
.glp-toast[data-tone="success"] { background: color-mix(in oklab, var(--glp-success) 80%, #000); }
.glp-toast strong { font-weight: 600; }
.glp-toast small { opacity: 0.8; }
.glp-toast button { align-self: flex-start; border: 0; background: transparent; color: inherit; text-decoration: underline; cursor: pointer; padding: 0; margin-top: 2px; font-size: 11px; }
.glp-hover-card { position: fixed; z-index: 2147483050; width: 300px; background: var(--glp-panel, #fff); color: var(--glp-text, #1f2023); border: 0; border-radius: 9px; box-shadow: var(--dsw-elevation-panel, 0 12px 36px rgba(0,0,0,0.22)); padding: 9px 11px; display: flex; flex-direction: column; gap: 5px; font-size: 12px; pointer-events: auto; }
.glp-mention { color: var(--glp-link, #3e63dd); border-bottom: 1px dotted currentColor; cursor: pointer; }
.glp-quote { position: fixed; z-index: 2147483060; border: 0; background: var(--glp-accent, #4b5bd7); color: #fff; border-radius: 999px; padding: 4px 9px; font-size: 11px; box-shadow: 0 4px 16px rgba(0,0,0,0.2); cursor: pointer; }

/* Inbox & activity */
.glp-inbox-group { border-bottom: 0.5px solid var(--glp-border); }
.glp-inbox-head { display: flex; align-items: center; gap: 6px; padding: 5px 10px; background: var(--glp-panel-2); font-weight: 600; font-size: 11.5px; position: sticky; top: 0; z-index: 1; }
.glp-activity-card { border: 0.5px solid var(--glp-border); border-radius: var(--glp-radius); margin: 6px 10px; overflow: hidden; background: var(--glp-panel); }
.glp-activity-head { display: flex; align-items: center; gap: 6px; padding: 6px 8px; background: var(--glp-panel-2); font-size: 11px; color: var(--glp-text-3); }
.glp-activity-body { padding: 7px 9px; display: flex; flex-direction: column; gap: 5px; }
.glp-activity-actions { display: flex; gap: 4px; flex-wrap: wrap; }
.glp-triage-progress { height: 4px; border-radius: 999px; background: var(--glp-panel-3); overflow: hidden; }
.glp-triage-progress > div { height: 100%; background: var(--glp-accent); }
.glp-status-pill { display: inline-flex; align-items: center; height: 17px; padding: 0 6px; border-radius: 999px; font-size: 10px; background: var(--glp-panel-3); color: var(--glp-text-2); white-space: nowrap; }
.glp-status-pill[data-status="proposed"] { background: color-mix(in oklab, var(--glp-warn) 16%, var(--glp-panel)); color: var(--glp-warn); }
.glp-status-pill[data-status="approved"], .glp-status-pill[data-status="running"] { background: var(--glp-accent-soft); color: var(--glp-accent); }
.glp-status-pill[data-status="done"] { background: color-mix(in oklab, var(--glp-success) 16%, var(--glp-panel)); color: var(--glp-success); }
.glp-status-pill[data-status="failed"] { background: color-mix(in oklab, var(--glp-danger) 16%, var(--glp-panel)); color: var(--glp-danger); }

/* Branch picker and misc */
.glp-picker { display: flex; flex-direction: column; gap: 6px; min-height: 0; }
.glp-picker-list { max-height: 58vh; overflow: auto; border: 0.5px solid var(--glp-border); border-radius: var(--glp-radius-sm); }
.glp-picker-row { display: flex; align-items: center; gap: 6px; padding: 5px 8px; border-bottom: 0.5px solid var(--glp-border-soft); cursor: pointer; font-size: 12px; }
.glp-picker-row:hover { background: var(--glp-hover); }
.glp-picker-group { padding: 4px 8px; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--glp-text-3); background: var(--glp-panel-2); position: sticky; top: 0; z-index: 1; }
.glp-footer-note { padding: 8px 10px; color: var(--glp-text-3); font-size: 11px; }
.glp-split { display: flex; gap: 10px; }
.glp-split > * { flex: 1; min-width: 0; }
.glp-kbd { font-family: var(--glp-mono); font-size: 10px; border: 0.5px solid var(--glp-border); border-bottom-width: 2px; border-radius: 4px; padding: 0 4px; color: var(--glp-text-2); background: var(--glp-panel); }
.glp-settings-card { border: 0.5px solid var(--glp-border); border-radius: var(--glp-radius); padding: 12px; margin: 10px; display: flex; flex-direction: column; gap: 8px; }
.glp-quote-text { border-left: 3px solid var(--glp-accent); padding-left: 8px; color: var(--glp-text-2); white-space: pre-wrap; }

@media (max-width: 640px) {
  .glp-repo { max-width: 28%; }
  .glp-row-end { display: none; }
  .glp-diff-num { min-width: 24px; padding: 0 3px; }
  .glp-dialog { padding: 12px; }
}

@media (hover: hover) {
  .glp-row-item:hover { background: var(--glp-hover); }
}

.glp-root :focus-visible, .glp-portal :focus-visible { outline: 2px solid var(--glp-accent); outline-offset: 1px; }
.glp-root ::-webkit-scrollbar, .glp-portal ::-webkit-scrollbar { width: 8px; height: 8px; }
.glp-root ::-webkit-scrollbar-thumb, .glp-portal ::-webkit-scrollbar-thumb { background: var(--dsw-alias-scrollbar-bg-l2, rgba(0,0,0,0.18)); border-radius: 8px; }
.glp-root ::-webkit-scrollbar-track, .glp-portal ::-webkit-scrollbar-track { background: transparent; }
`
