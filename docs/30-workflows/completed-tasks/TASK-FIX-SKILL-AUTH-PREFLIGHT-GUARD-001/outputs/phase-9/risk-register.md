# Phase 9 リスク台帳

| ID   | リスク                                   | 影響 | 状態     | 対策                                        |
| ---- | ---------------------------------------- | ---- | -------- | ------------------------------------------- |
| R-01 | `auth-key:exists` と実行時判定の将来乖離 | 中   | 監視中   | `api-ipc-system.md` に fallback 契約を明記  |
| R-02 | UI誘導文言の分散再発                     | 低   | 緩和済み | preflight utility で単一化                  |
| R-03 | 既存 lint warning の蓄積                 | 低   | 既知     | unassigned/backlog で追跡                   |
| R-04 | 仕様更新漏れ（Step 1-A〜1-C）            | 高   | 対応中   | Phase 12 で4仕様書 + 台帳 + LOGS/SKILL 同期 |
