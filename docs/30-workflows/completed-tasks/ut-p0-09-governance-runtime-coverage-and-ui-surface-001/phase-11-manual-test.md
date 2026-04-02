# Phase 11: 手動テスト

## メタ情報

| 項目   | 値                                                      |
| ------ | ------------------------------------------------------- |
| Phase  | 11                                                      |
| 機能名 | ut-p0-09-governance-runtime-coverage-and-ui-surface-001 |
| 作成日 | 2026-04-02                                              |

## 目的

renderer UI の 3 層評価（Semantic/Visual/AI UX）を実施し、Phase 11 visual evidence と発見事項を収集する。

## 実行タスク

- タスク1: スクリーンショット計画作成
- タスク2: GovernanceSummaryPanel の手動動作確認
- タスク3: 手動テストチェックリスト作成
- タスク4: スクリーンショット撮影（UI実装時）または N/A 根拠記録
- タスク5: 手動テスト結果レポート作成

## テストケース

| TC       | 状態               | 説明                           |
| -------- | ------------------ | ------------------------------ |
| TC-11-01 | default-light      | デフォルト状態（ライトテーマ） |
| TC-11-02 | default-dark       | デフォルト状態（ダークテーマ） |
| TC-11-03 | with-denials-light | 拒否履歴あり（ライトテーマ）   |
| TC-11-04 | with-denials-dark  | 拒否履歴あり（ダークテーマ）   |
| TC-11-05 | session-summary    | セッションサマリー表示         |
| TC-11-06 | error-state-light  | IPC エラー状態                 |

## 参照資料

| 資料名           | パス                                       | 説明                              |
| ---------------- | ------------------------------------------ | --------------------------------- |
| UI 設計          | `outputs/phase-2/ui-design.md`             | GovernanceSummaryPanel の表示要件 |
| 実装記録         | `outputs/phase-5/implementation-record.md` | 実装ファイルと統合内容            |
| 手動テスト成果物 | `outputs/phase-11/`                        | Phase 11 evidence 一式            |

## 実行手順

### ステップ1: スクリーンショット計画

**UI実装ありの場合（本タスク）**:

**命名規則**: `TC-11-{番号}-{状態ラベル}-{テーマ}.png`
**配置先**: `outputs/phase-11/screenshots/`

- `screenshot-plan.json` を作成し、TC-ID と撮影対象を明示する
- `manual-test-checklist.md` に TC ごとの実施可否と証跡を記録する

### ステップ2: 3 層評価

**Semantic 評価**:

- [ ] 表示データが IPC 取得値と一致している
- [ ] denial reason が正確に表示される
- [ ] session summary の数値が正確

**Visual 評価**:

- [ ] ライト/ダーク両テーマで視認性が確保されている
- [ ] overflow 時のテキスト省略が適切

**AI UX 評価**:

- [ ] governance 状態がユーザーに直感的に伝わるか
- [ ] 拒否理由の表示がわかりやすいか

## 画面カバレッジマトリクス

| テストケース       | カバレッジ種別 | 対象数 | 撮影数 | カバレッジ率 | 基準         |
| ------------------ | -------------- | ------ | ------ | ------------ | ------------ |
| TC-11-01〜TC-11-06 | コンポーネント | 1      | 1      | 100%         | **100%必須** |
| TC-11-01〜TC-11-06 | 表示状態       | 4      | 4      | 100%         | **100%必須** |
| TC-11-01〜TC-11-06 | テーマ         | 2      | 2      | 100%         | **100%必須** |

### ステップ4: 発見事項の記録

テスト中に発見したスコープ外の問題を `outputs/phase-11/discovered-issues.md` に記録する。

`manual-test-report.md` には 3 層評価の総括と撮影結果の要点を、`ui-sanity-visual-review.md` には視認性・レイアウト・操作性の所見を記録する。

## 統合テスト連携

- `GovernanceSummaryPanel.test.tsx` で loading / error / data / polling / preload 未注入を確認する
- `AdvancedSettingsPanel.test.tsx` で親パネル統合と表示存在を確認する
- `GovernanceAllPhases.test.ts` で全フェーズ配線と denial 記録を確認する

## 成果物

| 成果物                   | パス                                                         | 説明           |
| ------------------------ | ------------------------------------------------------------ | -------------- |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md`                  | TC 実施記録    |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`                     | 3層評価結果    |
| 手動テストレポート       | `outputs/phase-11/manual-test-report.md`                     | 総括レポート   |
| スクリーンショット計画   | `outputs/phase-11/screenshots/screenshot-plan.json`          | 撮影計画       |
| カバレッジレポート       | `outputs/phase-11/screenshot-coverage.md`                    | 画面カバレッジ |
| 発見事項                 | `outputs/phase-11/discovered-issues.md`                      | スコープ外課題 |
| UI/UX レビュー           | `outputs/phase-11/ui-sanity-visual-review.md`                | 視認性・操作性 |
| スクリーンショット群     | `outputs/phase-11/screenshots/`                              | 視覚的証跡     |
| 証跡メタデータ           | `outputs/phase-11/screenshots/phase11-capture-metadata.json` | 撮影時刻・方法 |

## 完了条件

- [ ] スクリーンショット計画が作成されている
- [ ] 3 層評価（Semantic/Visual/AI UX）が完了している
- [ ] 画面カバレッジ 100% 達成（または N/A 根拠が記録されている）
- [ ] 手動テストチェックリストが作成されている
- [ ] 発見事項が記録されている
- [ ] 手動テストレポートと UI/UX レビューが作成されている
- [ ] Phase 11 evidence が `outputs/phase-11/` に存在する
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 12: ドキュメント更新
