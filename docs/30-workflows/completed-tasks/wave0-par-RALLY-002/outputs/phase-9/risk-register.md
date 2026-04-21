# Phase 9 Risk Register

| ID   | リスク                                     | 影響                     | 対応                                                   |
| ---- | ------------------------------------------ | ------------------------ | ------------------------------------------------------ |
| R-01 | `esbuild` binary drift が再発する          | targeted test が起動不能 | local binary を修正し、Phase 13 に再現手順を記録       |
| R-02 | downstream が comment をロジック変更と誤認 | RALLY-010 以降で過剰修正 | implementation-guide と change-summary で no-op を明記 |
