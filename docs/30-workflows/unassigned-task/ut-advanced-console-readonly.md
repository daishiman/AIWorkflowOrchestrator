# UT-3: Advanced Console read-only モード制約実装

| 項目       | 値                                               |
| ---------- | ------------------------------------------------ |
| ID         | UT-3                                             |
| 由来タスク | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001  |
| 由来       | Phase 3 MINOR R-M3 / Phase 11 DI-3               |
| 優先度     | LOW                                              |
| ステータス | 設計コード実装済み（production統合は後続タスク） |
| 検出日     | 2026-03-24                                       |

---

## 概要

running / done / aborted state での AdvancedConsolePanel の input 系操作を disabled にする。read-only の制約は安全側であり、実装なしでも重大リスクはないが、UX 整合性のために必要。

## 実装根拠

`AdvancedConsolePanel.tsx` に `READ_ONLY_STATES` + `disabled={isReadOnly}` 実装済み。

## 対象ファイル

| ファイル                                                                  | 変更種別 |
| ------------------------------------------------------------------------- | -------- |
| `apps/desktop/src/renderer/components/execution/AdvancedConsolePanel.tsx` | 確認     |

## 受入基準

- [ ] `READ_ONLY_STATES` に running / done / aborted が含まれている
- [ ] 対象 state 時に input 系要素が `disabled` になる
- [ ] production統合時に状態遷移に応じて disabled が正しく切り替わる
