# リソースマップ

> **Progressive Disclosure**
> - 読み込みタイミング: スキル理解・リソース探索時
> - 読み込み条件: 利用可能なリソースを把握したいとき

---

## agents/ （9ファイル）

LLM Task仕様書。実行直前にそのTask分だけ読み込む。

| Agent | 読み込み条件 | 責務 |
| ----- | ------------ | ---- |
| [decompose-task.md](../agents/decompose-task.md) | createモード開始時 | タスク分解・責務抽出 |
| [identify-scope.md](../agents/identify-scope.md) | タスク分解後 | スコープ・前提・制約定義 |
| [design-phases.md](../agents/design-phases.md) | スコープ定義後 | Phase構成設計 |
| [generate-task-specs.md](../agents/generate-task-specs.md) | Phase設計後 | タスク仕様書生成 |
| [output-phase-files.md](../agents/output-phase-files.md) | 仕様書生成後 | ファイル出力 |
| [update-dependencies.md](../agents/update-dependencies.md) | 仕様書生成後 | 依存関係設定 |
| [verify-specs.md](../agents/verify-specs.md) | Phase 5全体検証時 | LLM品質検証 |
| [update-system-specs.md](../agents/update-system-specs.md) | Phase 12 Task 2実行時 | システム仕様更新 |
| [generate-unassigned-task.md](../agents/generate-unassigned-task.md) | Phase 12未タスク検出時 | 未タスク指示書生成 |

---

## references/ （15ファイル）

詳細知識。必要時のみ読み込む。

| Reference | 読み込み条件 | 内容 |
| --------- | ------------ | ---- |
| [resource-map.md](resource-map.md) | リソース探索時 | 本ファイル |
| [create-workflow.md](create-workflow.md) | createモード実行時 | 作成ワークフロー詳細 |
| [execute-workflow.md](execute-workflow.md) | Phase実行時 | 実行ワークフロー詳細 |
| [coverage-standards.md](coverage-standards.md) | Phase 6-7実行時 | テストカバレッジ基準 |
| [phase-11-12-guide.md](phase-11-12-guide.md) | Phase 11-12実行時 | 手動テスト・ドキュメント更新 |
| [commands.md](commands.md) | コマンド実行時 | 実行コマンドリファレンス |
| [phase-templates.md](phase-templates.md) | Phase仕様書生成時 | Phase別テンプレート集 |
| [quality-standards.md](quality-standards.md) | 品質チェック時 | 品質基準詳細 |
| [artifact-naming-conventions.md](artifact-naming-conventions.md) | ファイル出力時 | 命名規則・配置先 |
| [review-gate-criteria.md](review-gate-criteria.md) | Phase 3/10実行時 | レビュー判定基準 |
| [unassigned-task-guidelines.md](unassigned-task-guidelines.md) | 未タスク検出時 | 未タスクガイドライン |
| [spec-update-workflow.md](spec-update-workflow.md) | Phase 12実行時 | 仕様更新フロー |
| [technical-documentation-guide.md](technical-documentation-guide.md) | Phase 12実行時 | 技術ドキュメント作成 |
| [self-improvement-cycle.md](self-improvement-cycle.md) | 改善分析時 | 自己改善サイクル |
| [patterns.md](patterns.md) | 問題発生時 | 成功/失敗パターン集 |

---

## schemas/ （8ファイル）

入出力スキーマ。検証時に読み込む。

| Schema | 読み込み条件 | 用途 |
| ------ | ------------ | ---- |
| [mode.json](../schemas/mode.json) | モード判定時 | モード定義検証 |
| [task-definition.json](../schemas/task-definition.json) | タスク分解時 | タスク定義検証 |
| [phase-spec.json](../schemas/phase-spec.json) | Phase仕様書生成時 | Phase仕様書検証 |
| [artifact-definition.json](../schemas/artifact-definition.json) | 成果物登録時 | 成果物定義検証 |
| [unassigned-task.json](../schemas/unassigned-task.json) | 未タスク生成時 | 未タスク指示書検証 |
| [verification-report.json](../schemas/verification-report.json) | Phase 5全体検証時 | 検証レポート検証 |
| [review-gate-result.json](../schemas/review-gate-result.json) | Phase 3/10レビュー時 | レビューゲート結果検証 |
| [scope-definition.json](../schemas/scope-definition.json) | スコープ定義時 | identify-scope出力検証 |

---

## scripts/ （10ファイル）

決定論的処理（100%精度）。

| Script | 読み込み条件 | 用途 |
| ------ | ------------ | ---- |
| `detect-mode.js` | 開始時 | create/update/execute判定 |
| `init-artifacts.js` | create時 | ワークフロー初期化 |
| `validate-phase-output.js` | 各Phase完了時 | Phase出力検証 |
| `complete-phase.js` | 各Phase完了時 | Phase完了・成果物登録 |
| `verify-all-specs.js` | Phase 5全体検証時 | 13ファイル一括検証 |
| `detect-unassigned-tasks.js` | Phase 12実行時 | TODO/FIXME検出 |
| `generate-documentation-changelog.js` | Phase 12 Task 3実行時 | 更新履歴自動生成 |
| `validate-schema.js` | スキーマ検証時 | JSON Schema検証 |
| `log-usage.js` | 全モード完了時 | 使用ログ記録 |
| `generate-index.js` | create完了後 | index.md自動生成 |

---

## assets/ （8ファイル）

出力で使用するテンプレート。

| Asset | 読み込み条件 | 用途 |
| ----- | ------------ | ---- |
| [phase-spec-template.md](../assets/phase-spec-template.md) | Phase仕様書生成時 | Phase仕様書テンプレート |
| [common-header-template.md](../assets/common-header-template.md) | ファイル生成時 | 共通ヘッダー |
| [common-footer-template.md](../assets/common-footer-template.md) | ファイル生成時 | 共通フッター |
| [main-task-template.md](../assets/main-task-template.md) | タスク仕様書生成時 | メインタスクテンプレート |
| [integration-test-template.md](../assets/integration-test-template.md) | Phase 4/6実行時 | 統合テストテンプレート |
| [unassigned-task-template.md](../assets/unassigned-task-template.md) | 未タスク生成時 | 未タスク指示書テンプレート |
| [implementation-guide-template.md](../assets/implementation-guide-template.md) | Phase 12実行時 | 実装ガイドテンプレート |
| [review-result-template.md](../assets/review-result-template.md) | Phase 3/10レビュー時 | レビュー結果テンプレート |

---

## 変更履歴

| Date | Changes |
| ---- | ------- |
| 2026-01-26 | schemas/8, scripts/10, assets/8に更新（review-gate-result, scope-definition, generate-index, review-result-template追加） |
| 2026-01-26 | references/カウント修正（10→15） |
| 2026-01-26 | 初版作成（skill-creator v7準拠リファクタリング） |
