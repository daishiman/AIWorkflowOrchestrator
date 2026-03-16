# Phase 4 + Phase 6 テストケース統合インデックス

## メタ情報

| 項目             | 値                                               |
| ---------------- | ------------------------------------------------ |
| タスクID         | TASK-SKILL-LIFECYCLE-06                          |
| 対象フェーズ     | Phase 4（基本テスト定義）+ Phase 6（テスト拡充） |
| 総テストケース数 | 32件（サブケース 90件）                          |
| 最終更新日       | 2026-03-16                                       |

---

## Phase 4 テストケース（19件）

### TC-T（型契約テスト）: 6件

| テストID | タイトル                                  | 対応 Phase 5 成果物           | 定義フェーズ | サブケース数 |
| -------- | ----------------------------------------- | ----------------------------- | ------------ | ------------ |
| TC-T-001 | ToolRiskConfig 全4レベルの型定義検証      | `tool-risk-config.ts`         | Phase 4      | 1            |
| TC-T-002 | dialogWidth 制約値（400/480/640）の検証   | `tool-risk-config.ts`         | Phase 4      | 1            |
| TC-T-003 | headerColorToken の CSS 変数形式検証      | `tool-risk-config.ts`         | Phase 4      | 1            |
| TC-T-004 | AllowedToolEntryV2 の後方互換性検証       | `allowed-tool-entry.ts`       | Phase 4      | 1            |
| TC-T-005 | SafetyGatePort インターフェース型契約検証 | `safety-gate-port.ts`         | Phase 4      | 1            |
| TC-T-006 | PermissionHistoryEntry 型定義検証         | `permission-history-entry.ts` | Phase 4      | 1            |

**TC-T Phase 4 サブケース小計: 6件**

---

### TC-ST（状態遷移テスト）: 5件

| テストID  | タイトル                                      | 対応 Phase 5 成果物           | 定義フェーズ | サブケース数 |
| --------- | --------------------------------------------- | ----------------------------- | ------------ | ------------ |
| TC-ST-001 | 失効チェックフロー6分岐検証                   | `expiry-check-service.ts`     | Phase 4      | 6（a〜f）    |
| TC-ST-002 | 失効ポリシー4種の expiresAt 計算検証          | `expiry-policy-calculator.ts` | Phase 4      | 4（a〜d）    |
| TC-ST-003 | 権限状態遷移4モード検証（有効遷移・禁止遷移） | `permission-state-machine.ts` | Phase 4      | 1            |
| TC-ST-004 | revoked 状態のバッジ色表示検証                | `ins-00-permission-badge.tsx` | Phase 4      | 1            |
| TC-ST-005 | 承認履歴 CRUD + FIFO 1000件上限検証           | `permission-history-store.ts` | Phase 4      | 6（a〜f）    |

**TC-ST Phase 4 サブケース小計: 18件**

---

### TC-R（ルールロジックテスト）: 4件

| テストID | タイトル                                                    | 対応 Phase 5 成果物      | 定義フェーズ | サブケース数 |
| -------- | ----------------------------------------------------------- | ------------------------ | ------------ | ------------ |
| TC-R-001 | 安全性チェックルール5件のデシジョンテーブル                 | `safety-gate-service.ts` | Phase 4      | 5（a〜e）    |
| TC-R-002 | 複合チェック時の SafetyGrade 優先度検証                     | `safety-gate-service.ts` | Phase 4      | 1            |
| TC-R-003 | ツール分類ルール検証（DANGEROUS_PATTERNS, PROTECTED_PATHS） | `tool-classifier.ts`     | Phase 4      | 1            |
| TC-R-004 | 危険操作自動拒否（autoDenyDefault）フロー検証               | `permission-resolver.ts` | Phase 4      | 1            |

**TC-R Phase 4 サブケース小計: 8件**

---

### TC-F（フローテスト）: 4件

| テストID | タイトル                                      | 対応 Phase 5 成果物      | 定義フェーズ | サブケース数 |
| -------- | --------------------------------------------- | ------------------------ | ------------ | ------------ |
| TC-F-001 | abort フロー①の4ステップ検証                  | `permission-resolver.ts` | Phase 4      | 4            |
| TC-F-002 | skip フロー②の2ステップ検証                   | `permission-resolver.ts` | Phase 4      | 2            |
| TC-F-003 | retry フロー③の回数制限3回検証                | `permission-resolver.ts` | Phase 4      | 1            |
| TC-F-004 | PermissionResolver タイムアウト 300000ms 検証 | `permission-resolver.ts` | Phase 4      | 1            |

**TC-F Phase 4 サブケース小計: 8件**

---

**Phase 4 サブケース合計: 6 + 18 + 8 + 8 = 40件**

---

## Phase 6 追加テストケース（13件）

### TC-ST（状態遷移テスト追加）: 5件

| テストID  | タイトル                                  | 対応 Phase 5 成果物           | 定義フェーズ | サブケース数 |
| --------- | ----------------------------------------- | ----------------------------- | ------------ | ------------ |
| TC-ST-006 | session ポリシーのアプリ再起動後削除3検証 | `session-permission-store.ts` | Phase 6      | 3（a〜c）    |
| TC-ST-007 | approved_once 状態のセッション間分離検証  | `session-permission-store.ts` | Phase 6      | 1            |
| TC-ST-008 | 失効ポリシー × リスクレベル組合せ9検証    | `expiry-policy-calculator.ts` | Phase 6      | 9（a〜i）    |
| TC-ST-009 | 承認履歴上限3点境界値検証                 | `permission-history-store.ts` | Phase 6      | 3（a〜c）    |
| TC-ST-010 | フィルタ条件組合せ境界値4検証             | `permission-history-store.ts` | Phase 6      | 4（a〜d）    |

**TC-ST Phase 6 サブケース小計: 20件**

---

### TC-T（型契約テスト追加）: 2件

| テストID | タイトル                                   | 対応 Phase 5 成果物   | 定義フェーズ | サブケース数 |
| -------- | ------------------------------------------ | --------------------- | ------------ | ------------ |
| TC-T-007 | Medium/High 境界の allowPermanent 差分検証 | `tool-risk-config.ts` | Phase 6      | 1            |
| TC-T-008 | ツール名→リスクレベルマッピング境界4検証   | `tool-classifier.ts`  | Phase 6      | 4（a〜d）    |

**TC-T Phase 6 サブケース小計: 5件**

---

### TC-R（ルールロジックテスト追加）: 1件

| テストID | タイトル                        | 対応 Phase 5 成果物      | 定義フェーズ | サブケース数 |
| -------- | ------------------------------- | ------------------------ | ------------ | ------------ |
| TC-R-005 | SafetyGrade 優先度全7組合せ検証 | `safety-gate-service.ts` | Phase 6      | 7（a〜g）    |

**TC-R Phase 6 サブケース小計: 7件**

---

### TC-F（フローテスト追加）: 5件

| テストID | タイトル                 | 対応 Phase 5 成果物                       | 定義フェーズ | サブケース数 |
| -------- | ------------------------ | ----------------------------------------- | ------------ | ------------ |
| TC-F-005 | retry 回数境界値4検証    | `permission-resolver.ts`                  | Phase 6      | 4（a〜d）    |
| TC-F-006 | タイムアウト境界値3検証  | `permission-resolver.ts`                  | Phase 6      | 3（a〜c）    |
| TC-F-007 | INS-01 発火条件境界5検証 | `ins-01-permission-summary-banner.tsx`    | Phase 6      | 5（a〜e）    |
| TC-F-008 | INS-02 発火条件境界3検証 | `ins-02-permission-pending-indicator.tsx` | Phase 6      | 3（a〜c）    |
| TC-F-009 | INS-03 発火条件境界3検証 | `ins-03-permission-result-summary.tsx`    | Phase 6      | 3（a〜c）    |

**TC-F Phase 6 サブケース小計: 18件**

---

**Phase 6 サブケース合計: 20 + 5 + 7 + 18 = 50件**

---

## 統合サマリー

| カテゴリ | Phase 4 件数 | Phase 4 サブケース | Phase 6 件数 | Phase 6 サブケース | 合計件数 | サブケース合計 |
| -------- | ------------ | ------------------ | ------------ | ------------------ | -------- | -------------- |
| TC-T     | 6            | 6                  | 2            | 5                  | 8        | 11             |
| TC-ST    | 5            | 18                 | 5            | 20                 | 10       | 38             |
| TC-R     | 4            | 8                  | 1            | 7                  | 5        | 15             |
| TC-F     | 4            | 8                  | 5            | 18                 | 9        | 26             |
| **合計** | **19**       | **40**             | **13**       | **50**             | **32**   | **90**         |

---

## テストファイル対応マップ

| テストファイル（想定）                         | 含まれるテストケース                                                 | Phase |
| ---------------------------------------------- | -------------------------------------------------------------------- | ----- |
| `tool-risk-config.test.ts`                     | TC-T-001, TC-T-002, TC-T-003, TC-T-007                               | 4, 6  |
| `allowed-tool-entry.test.ts`                   | TC-T-004                                                             | 4     |
| `safety-gate-port.test.ts`                     | TC-T-005                                                             | 4     |
| `permission-history-entry.test.ts`             | TC-T-006                                                             | 4     |
| `tool-classifier.test.ts`                      | TC-R-003, TC-T-008                                                   | 4, 6  |
| `expiry-check-service.test.ts`                 | TC-ST-001                                                            | 4     |
| `expiry-policy-calculator.test.ts`             | TC-ST-002, TC-ST-008                                                 | 4, 6  |
| `permission-state-machine.test.ts`             | TC-ST-003                                                            | 4     |
| `ins-00-permission-badge.test.tsx`             | TC-ST-004                                                            | 4     |
| `permission-history-store.test.ts`             | TC-ST-005, TC-ST-009, TC-ST-010                                      | 4, 6  |
| `session-permission-store.test.ts`             | TC-ST-006, TC-ST-007                                                 | 6     |
| `safety-gate-service.test.ts`                  | TC-R-001, TC-R-002, TC-R-005                                         | 4, 6  |
| `permission-resolver.test.ts`                  | TC-R-004, TC-F-001, TC-F-002, TC-F-003, TC-F-004, TC-F-005, TC-F-006 | 4, 6  |
| `ins-01-permission-summary-banner.test.tsx`    | TC-F-007                                                             | 6     |
| `ins-02-permission-pending-indicator.test.tsx` | TC-F-008                                                             | 6     |
| `ins-03-permission-result-summary.test.tsx`    | TC-F-009                                                             | 6     |

---

## カバレッジ目標

| 指標              | 目標値  | 根拠                     |
| ----------------- | ------- | ------------------------ |
| Line Coverage     | 90%以上 | コード品質ルール推奨基準 |
| Branch Coverage   | 70%以上 | コード品質ルール推奨基準 |
| Function Coverage | 90%以上 | コード品質ルール推奨基準 |

Phase 6 追加テスト（50サブケース）により、Phase 4 単独（40サブケース）では不足していた以下の分岐カバレッジを補完する:

- 失効ポリシー × リスクレベル全組合せ（TC-ST-008: 9件）
- SafetyGrade 集約ロジック全分岐（TC-R-005: 7件）
- INS 発火条件境界値（TC-F-007〜009: 11件）
- 境界値（0件/1件/N件/上限値）パターン（TC-ST-009, TC-F-005, TC-F-006: 10件）

---

## 関連成果物パス

| 成果物種別                 | パス                                                   |
| -------------------------- | ------------------------------------------------------ |
| Phase 4 テストケース詳細   | `outputs/phase-4/test-case-specifications.md`          |
| TC-R-005 詳細仕様          | `outputs/phase-6/tc-safety-grade-priority.md`          |
| TC-F-007〜009 詳細仕様     | `outputs/phase-6/tc-ins-boundary.md`                   |
| Phase 5 実装成果物一覧     | `outputs/phase-5/implementation-index.md`              |
| Phase 7 カバレッジレポート | `outputs/phase-7/coverage-report.md`（Phase 7 完了後） |
