* {
  box-sizing: border-box;
}

:root {
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #1f2937;
  background: #f3f6ef;
  line-height: 1.4;
  font-weight: 500;
}

html, body, #root {
  margin: 0;
  min-height: 100%;
  min-width: 0;
}

body {
  min-height: 100vh;
  background: linear-gradient(180deg, #f4f7f3 0%, #edf1ed 100%);
}

button, input, textarea, select {
  font: inherit;
}

button {
  cursor: pointer;
}

.task-app-shell {
  max-width: 1180px;
  margin: 0 auto;
  padding: 32px 20px 48px;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.eyebrow {
  margin: 0 0 6px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 11px;
  color: #5f6b59;
}

h1 {
  margin: 0;
  font-size: clamp(2rem, 3vw, 3rem);
}

.primary-button,
.text-button,
.danger-button,
.tab,
.task-check,
.close-button {
  border: none;
  border-radius: 12px;
}

.primary-button {
  background: linear-gradient(135deg, #1f7a59, #2f9b7a);
  color: white;
  padding: 0.75rem 1.2rem;
  font-weight: 700;
  box-shadow: 0 10px 25px rgba(31, 122, 89, 0.15);
}

.primary-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.text-button {
  background: rgba(23, 91, 74, 0.08);
  color: #214833;
  padding: 0.6rem 0.9rem;
}

.danger-button {
  background: #fee2e2;
  color: #991b1b;
  padding: 0.75rem 1rem;
  font-weight: 700;
}

.summary-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.summary-card {
  background: rgba(255, 255, 255, 0.64);
  border: 1px solid rgba(16, 63, 52, 0.08);
  border-radius: 18px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-card span {
  color: #64748b;
  font-size: 12px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.summary-card strong {
  font-size: 2rem;
}

.filters {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(23, 37, 84, 0.08);
  border-radius: 20px;
  padding: 18px;
  margin-bottom: 18px;
}

.filters label,
.modal-panel label,
.academic-fields label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #475569;
  font-size: 13px;
}

input, select, textarea {
  width: 100%;
  border: 1px solid #d9e0d4;
  border-radius: 12px;
  background: white;
  padding: 0.7rem 0.8rem;
  color: #1f2937;
}

textarea {
  resize: vertical;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tab {
  background: rgba(17, 24, 39, 0.04);
  color: #334155;
  padding: 0.6rem 1rem;
}

.tab.active {
  background: #dff7ee;
  color: #14532d;
  font-weight: 700;
}

.error-banner {
  margin: 0 0 18px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  border-radius: 12px;
  padding: 0.8rem 1rem;
}

.task-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 18px;
}

.task-card {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.03);
}

.task-topline {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.task-check {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  background: #ecfdf5;
  color: #166534;
  font-size: 1.3rem;
  flex-shrink: 0;
}

.task-copy {
  flex: 1;
  min-width: 0;
}

.task-copy h2 {
  margin: 0;
  font-size: 1.1rem;
  line-height: 1.35;
}

.task-metadata {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  color: #64748b;
  font-size: 12px;
}

.task-details {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
  color: #475569;
  font-size: 12px;
}

.task-footer {
  margin-top: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.chip {
  display: inline-flex;
  align-items: center;
  padding: 0.38rem 0.7rem;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.task-date {
  color: #475569;
  font-size: 13px;
}

.empty-state {
  background: rgba(255, 255, 255, 0.65);
  border: 1px dashed rgba(15, 23, 42, 0.15);
  border-radius: 16px;
  padding: 24px;
  color: #475569;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  display: grid;
  place-items: center;
  padding: 20px;
}

.modal-panel {
  width: min(720px, 100%);
  background: white;
  border-radius: 20px;
  padding: 18px;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.25);
}

.modal-header,
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.modal-header {
  margin-bottom: 18px;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.7rem;
}

.close-button {
  width: 36px;
  height: 36px;
  background: #f1f5f9;
  font-size: 1.6rem;
  color: #334155;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 14px;
}

.academic-fields {
  border: 1px solid #dfe7dc;
  border-radius: 16px;
  background: #f7faf6;
  padding: 14px;
  margin-top: 18px;
}

.academic-fields legend {
  padding: 0 6px;
  color: #365a42;
  font-weight: 700;
}

.modal-footer {
  margin-top: 20px;
}

@media (max-width: 760px) {
  .filters,
  .summary-strip,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .app-header,
  .toolbar,
  .modal-footer {
    flex-direction: column;
    align-items: stretch;
  }
}
