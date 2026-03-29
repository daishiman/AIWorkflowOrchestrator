# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 9                                         |
| Phase名    | 品質保証                                  |
| 対象機能   | claude-sdk-message-contract-normalization |
| 前提Phase  | Phase 8（リファクタリング）               |
| 後続Phase  | Phase 10（最終レビューゲート）            |
| ステータス | pending                                   |
| 作成日     | 2026-03-29                                |

## 目的

後方互換性、dynamic skill-creator 維持、session / result 情報欠落なしを監査する。

## 背景

RT-06 の正規化層は既存の `query()` 実行主線に挿入されるため、後方互換性と dynamic skill-creator 読込の維持を品質保証の中核観点とする。

## 実行タスク

### Task 1: 既存フローとの互換性を確認する

**目的**: 正規化層の挿入が既存の実行フローを破壊していないことを確認する

**実行手順**:

1. 既存フローの入出力契約を洗い出す
2. 正規化後の出力が既存契約を満たすことを検証する

**期待される成果物**:

- 互換性確認結果

### Task 2: dynamic skill-creator 主線維持を確認する

**目的**: skill-creator の動的読込が正規化層導入後も正常に動作することを確認する

**実行手順**:

1. skill-creator の動的読込パスを確認する
2. 正規化イベントが skill-creator フローで正しく伝播されることを検証する

**期待される成果物**:

- skill-creator 主線維持の確認結果

### Task 3: `session_id` 欠落がないか監査する

**目的**: 正規化過程で session_id や result 情報が欠落していないことを保証する

**実行手順**:

1. 正規化前後の session_id / result 情報を比較する
2. 欠落がある場合は原因を特定し修正する

**期待される成果物**:

- session_id 監査結果

## 参照資料

| 資料名  | パス                        | 説明     |
| ------- | --------------------------- | -------- |
| Phase 5 | `phase-5-implementation.md` | 実装結果 |

## 成果物

| 成果物         | パス                                | 説明    |
| -------------- | ----------------------------------- | ------- |
| quality report | `outputs/phase-9/quality-report.md` | QA 結果 |

## 統合テスト連携

品質保証で統合テスト結果を確認する

---

## 品質ゲート

### 品質チェックリスト

#### 機能検証

- [ ] 全ユニットテスト成功
- [ ] 全統合テスト成功

#### コード品質

- [ ] Lint エラーなし（`pnpm lint`）
- [ ] 型エラーなし（`pnpm typecheck`）
- [ ] コードフォーマット適用済み（`pnpm format`）

#### テスト網羅性

- [ ] message 種別カバレッジ: `system/init` / `assistant` / `result` / error
- [ ] `session_id` / `resultSubtype` / `permissionDenials` / `sourceProvenance` カバレッジ

#### セキュリティ

- [ ] permission denial の正規化が安全に行われている
- [ ] SDK 生イベントが renderer に漏れていない

## 完了条件

- [ ] 互換性が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 8 が完了していること
- **後続**: Phase 10 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`phase-10-final-review.md`
