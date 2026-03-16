# Phase 4 テストシナリオインデックス

## メタ情報

| 項目       | 値                                          |
| ---------- | ------------------------------------------- |
| タスクID   | TASK-SKILL-LIFECYCLE-06                     |
| Phase      | 4: テスト作成                               |
| 作成日     | 2026-03-16                                  |
| 依存成果物 | `outputs/phase-2/*.md`（設計仕様5ファイル） |
| ステータス | Draft                                       |

---

## 1. カテゴリ概要

| カテゴリ             | 略称  | 件数                        | 対象設計成果物                                                 |
| -------------------- | ----- | --------------------------- | -------------------------------------------------------------- |
| 型契約テスト         | TC-T  | 6件（TC-T-001〜TC-T-006）   | `risk-level-design.md`, `safety-gate-contract.md`              |
| 状態遷移テスト       | TC-ST | 5件（TC-ST-001〜TC-ST-005） | `permission-persistence-design.md`, `abort-fallback-design.md` |
| ルールロジックテスト | TC-R  | 4件（TC-R-001〜TC-R-004）   | `safety-gate-contract.md`, `risk-level-design.md`              |
| 統合フローテスト     | TC-F  | 4件（TC-F-001〜TC-F-004）   | `abort-fallback-design.md`, `accountability-ui-design.md`      |

---

## 2. TC-T: 型契約テスト（6件）

| テストID | テスト名                                 | 検証対象ファイル（Phase 5 成果物パス）                                                                  | AC対応  |
| -------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------- |
| TC-T-001 | ToolRiskConfig型定義の必須フィールド検証 | `src/main/skill/security.ts`                                                                            | AC-1    |
| TC-T-002 | dialogWidthの型制約検証                  | `src/main/skill/security.ts`                                                                            | AC-1    |
| TC-T-003 | headerColorTokenの形式検証               | `src/main/skill/security.ts`                                                                            | AC-1    |
| TC-T-004 | AllowedToolEntryV2型定義の後方互換検証   | `src/main/skill/permission-store-interface.ts`                                                          | AC-2    |
| TC-T-005 | SafetyGatePortインターフェース契約検証   | `src/main/skill/safety-gate.ts`                                                                         | AC-4    |
| TC-T-006 | 設計文書完全性チェックスクリプト仕様     | `scripts/validate-trust-governance-design.ts`（仕様: `outputs/phase-4/validate-design-script-spec.md`） | AC-1〜4 |

---

## 3. TC-ST: 状態遷移テスト（5件）

| テストID  | テスト名                              | 検証対象ファイル（Phase 5 成果物パス）                         | AC対応     |
| --------- | ------------------------------------- | -------------------------------------------------------------- | ---------- |
| TC-ST-001 | 失効チェックフロー6分岐の網羅テスト   | `src/main/skill/permission-store-interface.ts`                 | AC-2       |
| TC-ST-002 | 失効ポリシー4種のexpiresAt計算検証    | `src/main/skill/permission-store-interface.ts`                 | AC-2       |
| TC-ST-003 | 権限状態の有効遷移パスの網羅          | `outputs/phase-2/permission-persistence-design.md`（設計文書） | AC-1, AC-2 |
| TC-ST-004 | revoked状態のバッジ表示色検証         | `outputs/phase-2/accountability-ui-design.md`（設計文書）      | AC-3       |
| TC-ST-005 | permissionHistorySlice CRUD操作テスト | `src/main/skill/permission-store-interface.ts`                 | AC-2       |

---

## 4. TC-R: ルールロジックテスト（4件）

| テストID | テスト名                                    | 検証対象ファイル（Phase 5 成果物パス） | AC対応 |
| -------- | ------------------------------------------- | -------------------------------------- | ------ |
| TC-R-001 | 安全性チェックルール5件のデシジョンテーブル | `src/main/skill/safety-gate.ts`        | AC-4   |
| TC-R-002 | 複合チェック優先度テスト                    | `src/main/skill/safety-gate.ts`        | AC-4   |
| TC-R-003 | DANGEROUS_PATTERNS照合テスト                | `src/main/skill/security.ts`           | AC-1   |
| TC-R-004 | 自動拒否(autoDenyDefault)動作テスト         | `src/main/skill/security.ts`           | AC-1   |

---

## 5. TC-F: 統合フローテスト（4件）

| テストID | テスト名                         | 検証対象ファイル（Phase 5 成果物パス）                 | AC対応 |
| -------- | -------------------------------- | ------------------------------------------------------ | ------ |
| TC-F-001 | abortフロー4ステップ検証         | `outputs/phase-2/abort-fallback-design.md`（設計文書） | AC-1   |
| TC-F-002 | skipフロー検証                   | `outputs/phase-2/abort-fallback-design.md`（設計文書） | AC-1   |
| TC-F-003 | retryフロー最大3回制限検証       | `outputs/phase-2/abort-fallback-design.md`（設計文書） | AC-1   |
| TC-F-004 | タイムアウト(300秒)自動abort検証 | `outputs/phase-2/abort-fallback-design.md`（設計文書） | AC-1   |

---

## 6. AC（受入基準）対応表

| AC番号 | 内容                                                                         | 対応テストID                                                                   |
| ------ | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| AC-1   | ToolRiskConfig・DANGEROUS_PATTERNS・abort/skip/retryフロー定数の型安全な定義 | TC-T-001, TC-T-002, TC-T-003, TC-T-006, TC-R-003, TC-R-004, TC-F-001〜TC-F-004 |
| AC-2   | 権限履歴スライスの型定義とexpiryPolicy CRUD操作                              | TC-T-004, TC-ST-001, TC-ST-002, TC-ST-003, TC-ST-005                           |
| AC-3   | アカウンタビリティUIのバッジ表示仕様                                         | TC-ST-004                                                                      |
| AC-4   | SafetyGatePortインターフェースと安全性チェックルール定義                     | TC-T-005, TC-R-001, TC-R-002                                                   |

---

## 7. テスト総数サマリー

| カテゴリ               | テスト数 |
| ---------------------- | -------- |
| TC-T（型契約）         | 6        |
| TC-ST（状態遷移）      | 5        |
| TC-R（ルールロジック） | 4        |
| TC-F（統合フロー）     | 4        |
| **合計**               | **19**   |

---

## 8. 注意事項

- 本タスクは設計タスクのため、テスト仕様はすべて「設計文書を検証するための仕様記述」として位置付ける
- Phase 5 成果物パスは設計上の想定パスであり、実装時に変更される可能性がある
- TC-T-006・TC-ST-003・TC-ST-004・TC-F-001〜TC-F-004 は設計文書の内容を直接検証するシナリオ（スクリプトまたは手動確認）
