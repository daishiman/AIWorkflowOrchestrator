# Phase 3 成果物: 設計レビュー結果

## メタ情報

| 項目     | 値                                         |
| -------- | ------------------------------------------ |
| Phase    | 3                                          |
| タスクID | UT-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001 |
| 作成日   | 2026-03-15                                 |

## ステップ1: 要件カバレッジ確認

| タスク指示書の受入基準                                          | Phase 1 FR/NFR | Phase 2 TC 設計 | カバー状況 |
| --------------------------------------------------------------- | -------------- | --------------- | ---------- |
| TC-WS-01: workspace 内ファイルは PASS                           | FR-001         | TC-WS-01        | OK         |
| TC-WS-02: workspace 外ファイルは PERMISSION_DENIED              | FR-002         | TC-WS-02        | OK         |
| TC-WS-03: workspacePath 未指定時、isAllowedPath 未呼び出し      | FR-003         | TC-WS-03        | OK         |
| TC-WS-04: パストラバーサル攻撃で PERMISSION_DENIED              | FR-004         | TC-WS-04        | OK         |
| TC-WS-05: 複数コンテキストの 1 つが外なら全体 PERMISSION_DENIED | FR-005         | TC-WS-05        | OK         |
| TC-WS-06: 空コンテキスト配列で isAllowedPath 未呼び出し         | FR-006         | TC-WS-06        | OK         |
| Branch Coverage 70%以上                                         | NFR-001        | -               | OK         |
| 既存テストへの影響なし                                          | NFR-002        | 新規ファイル    | OK         |

## ステップ2: 設計レビュー観点

### 2.1 テストファイル分離の妥当性

- 新規ファイル `chatEditHandlers.workspace-constraint.test.ts` は workspace 制約という独立した関心事に対応
- 既存 `chatEditHandlers.security.test.ts` に追加しない理由は NFR-002（既存テスト影響回避）に基づく
- **判定**: 適切

### 2.2 モック戦略の妥当性

- `vi.hoisted()` + `vi.mock()` パターンは既存 security テストと完全に一致
- `isAllowedPath` を `vi.spyOn` で実装保持する設計は TC-WS-04（パストラバーサル）に必須
  - `vi.mock` にすると `path.resolve()` 正規化ロジックが失われ、TC-WS-04 の意味がなくなる
- RuntimeResolver は `type: "handoff"` を採用。ChatEditService のモック不要で設計がシンプル
- **判定**: 適切

### 2.3 simpler alternative の検討

| 代替案                                     | 評価     | 理由                                           |
| ------------------------------------------ | -------- | ---------------------------------------------- |
| isAllowedPath を直接テスト                 | 不採用   | ハンドラ内での呼び出しパターンが検証できない   |
| chatEditHandlers.security.test.ts に追加   | 不採用   | 既存テストへの影響リスク（NFR-002 違反）       |
| PathValidator.test.ts として独立テスト     | 不採用   | ハンドラ統合の検証が目的のため不適切           |
| 新規ファイルでハンドラ直接テスト（採用案） | **採用** | 関心事分離・状態隔離・影響回避の全要件を満たす |

### 2.4 TerminalHandoffBuilder モック

- Phase 2 設計で `TerminalHandoffBuilder` のモックが定義されている
- TC-WS-01/03/06 で `type: "handoff"` パスを通るため必要
- 既存 security テストではモックしていないが、security テストの正常系テストでは
  `TerminalHandoffBuilder` が呼ばれており暗黙的に import されている
- **判定**: モック追加は適切（テスト安定性向上）

## ステップ3: レビュー判定

| 判定基準                         | 結果 |
| -------------------------------- | ---- |
| 要件カバレッジ: 全 TC がカバー   | PASS |
| 設計整合性: 既存パターン踏襲     | PASS |
| simpler alternative 検討済み     | PASS |
| P57/P58/P59/P61 対策が設計に反映 | PASS |

### 最終判定: **PASS**

Phase 4 へ進行する。

### MINOR 指摘事項

1. **TerminalHandoffBuilder モックの必要性再確認**: 既存 security テストではモックなしで動作しているが、workspace-constraint テストでは明示的にモックするか確認が必要。`vi.spyOn` で `isAllowedPath` を監視するため、モジュール解決に影響がないか Phase 4 で実動作検証する。

   **対応**: Phase 4 で実装時に確認。モックなしで動作する場合は省略する。

## 完了条件チェック

- [x] 要件カバレッジ: タスク指示書の全受入基準が FR/NFR でカバーされている
- [x] 設計妥当性: モック戦略・テストファイル構成が適切
- [x] simpler alternative の検討結果が記録されている
- [x] レビュー判定（PASS）が記録されている
- [x] Phase 4 開始条件が明確に定義されている
- [x] 本Phase内の全タスクを100%実行完了
