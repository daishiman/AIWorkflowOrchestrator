# Phase 7: テストカバレッジ確認

## メタ情報

| 項目     | 値                             |
| -------- | ------------------------------ |
| Phase    | 7                              |
| 機能名   | ipc-response-unwrap            |
| タスクID | UT-FIX-IPC-RESPONSE-UNWRAP-001 |
| 作成日   | 2026-02-14                     |

## 目的

Phase 4-6 で作成・拡充したテストのカバレッジを計測し、プロジェクトのカバレッジ基準（02-code-quality.md）を充足しているか判定する。基準未達の場合は Phase 6 へ戻りテストを追加する。

## 実行タスク

- カバレッジ測定: `skill-api.ts` に対するカバレッジレポートを生成する
- 基準判定: Line/Branch/Function の各カバレッジを基準値と比較する
- 未カバー箇所特定: 基準未達の場合、カバーされていない行・分岐を特定し Phase 6 への差し戻し入力を作成する

## 参照資料

| 種別               | パス                                                                        |
| ------------------ | --------------------------------------------------------------------------- |
| Phase 4 テスト作成 | `phase-4-test-creation.md`                                                  |
| Phase 5 実装       | `phase-5-implementation.md`                                                 |
| Phase 6 テスト拡充 | `phase-6-test-expansion.md`                                                 |
| カバレッジ基準     | `.claude/rules/02-code-quality.md`                                          |
| テスト品質         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` |

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                              | 内容                |
| -------------------- | --------------------------------------------------------------------------------- | ------------------- |
| テスト品質           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | 判定閾値            |
| コンポーネントテスト | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | テスト拡張方針      |
| セキュリティ IPC     | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | Preload層テスト観点 |

## 実行手順

### Task 1: カバレッジ測定

以下のコマンドで `skill-api.ts` のカバレッジレポートを生成する。

```bash
cd apps/desktop && pnpm vitest run --coverage src/preload/skill-api.ts
```

測定対象:

- `safeInvokeUnwrap<T>()` 汎用関数の全分岐（成功時展開、エラー時スロー、不正レスポンス時フォールバック）
- `list()` メソッドのレスポンスラッパー展開
- `getImported()` メソッドのレスポンスラッパー展開
- `importSkill()` メソッドのレスポンスラッパー展開
- `rescan()` メソッドのレスポンスラッパー展開

### Task 2: カバレッジ基準判定

以下の基準と実測値を比較し、達成/未達を判定する。

| 指標              | 最低基準 | 推奨基準 | 実測値 | 判定 |
| ----------------- | -------- | -------- | ------ | ---- |
| Line Coverage     | 80%      | 90%      | -      | -    |
| Branch Coverage   | 60%      | 70%      | -      | -    |
| Function Coverage | 80%      | 90%      | -      | -    |

判定基準:

- 3指標全てが最低基準を満たしている場合: PASS（Phase 8 へ進む）
- 1指標でも最低基準未満の場合: FAIL（Phase 6 へ戻る）

### Task 3: 未カバー箇所の特定と対応判断

基準未達の場合、以下を記録する:

- 未カバーの行番号リスト
- 未カバーの分岐条件リスト
- 各未カバー箇所に対する補完テストケースの方針

基準達成の場合:

- カバレッジレポートのサマリを記録し、Phase 8 へ進む

## 統合テスト連携【必須】

| 観点         | 記録内容                                                  |
| ------------ | --------------------------------------------------------- |
| Phase 5 接続 | `safeInvokeUnwrap` 実装変更の全分岐がカバーされているか   |
| Phase 6 接続 | テスト拡充で追加したケースがカバレッジに反映されているか  |
| 回帰         | 既存テスト（unification, permission）が破壊されていないか |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                           | 仕様参照先                                   |
| ------------------ | ---------------------------------- | -------------------------------------------- |
| セキュリティ       | 認証・認可・入力検証が関係する場合 | `aiworkflow-requirements: security-*.md`     |
| UI/UX              | フロントエンド実装の場合           | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | 設計・構造変更の場合               | `aiworkflow-requirements: architecture-*.md` |
| API設計            | API実装・変更の場合                | `aiworkflow-requirements: api-*.md`          |
| データ整合性       | 永続化やDB操作がある場合           | `aiworkflow-requirements: database-*.md`     |
| エラーハンドリング | 例外処理がある場合                 | `aiworkflow-requirements: error-handling.md` |

| 層                         | 適用判断                    | 仕様参照先                                             |
| -------------------------- | --------------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | UI/React実装の場合          | `aiworkflow-requirements: ui-ux-*.md`                  |
| バックエンド（Main）       | サービス/ロジック実装の場合 | `aiworkflow-requirements: architecture-*.md`           |
| IPC通信                    | Main-Renderer連携の場合     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| Preload/セキュリティ       | API公開の場合               | `aiworkflow-requirements: security-api-electron.md`    |
| ローカルストレージ         | 永続化がある場合            | `aiworkflow-requirements: database-*.md`               |

## サブタスク管理

1. 参照資料の確認
2. 実行タスクの実施
3. 統合テスト連携の確認（Phase 1-11）
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json更新方針が明記されている
- [ ] Phase末端で完了を明記している

## 成果物

| 成果物             | パス                                 | 説明               |
| ------------------ | ------------------------------------ | ------------------ |
| カバレッジ確認仕様 | `phase-7-coverage-verification.md`   | 本文書             |
| カバレッジレポート | `outputs/phase-7-coverage-report.md` | 計測結果と判定記録 |

## 完了条件

- [ ] skill-api.ts の Line Coverage が 80% 以上
- [ ] skill-api.ts の Branch Coverage が 60% 以上
- [ ] skill-api.ts の Function Coverage が 80% 以上
- [ ] カバレッジレポートが生成されている
- [ ] 計測コマンドの実行結果が記録されている
- [ ] 最低基準の達成/未達が明確に判定されている
- [ ] 未達時は補完方針が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- 基準達成の場合: Phase 8 リファクタリング（`phase-8-refactoring.md`）
- 基準未達の場合: Phase 6 テスト拡充（`phase-6-test-expansion.md`）へ戻る
