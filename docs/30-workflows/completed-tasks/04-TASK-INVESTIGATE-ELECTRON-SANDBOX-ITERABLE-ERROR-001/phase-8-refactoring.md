# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                                    |
| ---------- | ------------------------------------------------------- |
| Phase      | 8                                                       |
| 機能名     | TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001    |
| タスク名   | Electron sandbox iterableエラーの原因分離と再発防止設計 |
| 前提Phase  | Phase 7                                                 |
| 後続Phase  | Phase 9                                                 |
| 作成日     | 2026-03-05                                              |
| ステータス | pending                                                 |

## 目的

振る舞いを維持したまま責務分離を改善する。

## 背景

OAuthセッション確立後に sandbox bundle iterable エラーが出力され、主因と副作用ログが混在する。

## Atent Team（SubAgent）編成

| SubAgent   | 関心ごと        | 主担当                     |
| ---------- | --------------- | -------------------------- |
| SubAgent-A | Main/IPC責務    | 登録順序・ライフサイクル   |
| SubAgent-B | Preload/API契約 | 型契約・公開境界           |
| SubAgent-C | Renderer/UX契約 | 状態遷移・表示整合         |
| SubAgent-D | 統合監査        | 矛盾・漏れ・整合・依存判定 |

## Atent Team実行計画

- 並列実行: SubAgent-A/B/C は関心ごとを分離して同時に進める。
- 直列実行: SubAgent-D は A/B/C の成果物を統合し、矛盾・漏れ・依存衝突を判定する。
- 差し戻し規則: 依存衝突または重大矛盾を検出した場合は、当該入力を作成した直前Phaseへ戻す。

## 実行タスク

- 重複削減: 重複ロジックを統合して責務を明確化する
- 命名整合: 契約語彙をMain/Preload/Rendererで統一する
- 再検証計画: リファクタ後の回帰確認計画を作成する

## 参照資料

### 実装・コード

| 資料名                 | パス                                                  | 用途                         |
| ---------------------- | ----------------------------------------------------- | ---------------------------- |
| OAuthオーケストレータ  | `apps/desktop/src/main/auth/authFlowOrchestrator.ts`  | セッション確立直後ログを確認 |
| Mainエントリ           | `apps/desktop/src/main/index.ts`                      | 初期化順序を確認             |
| IPC登録エントリ        | `apps/desktop/src/main/ipc/index.ts`                  | 登録完了時刻を確認           |
| Preload API公開        | `apps/desktop/src/preload/index.ts`                   | renderer公開初期化順序を確認 |
| AgentView              | `apps/desktop/src/renderer/views/AgentView/index.tsx` | 発生時の呼び出し順を確認     |
| 実装サマリー           | `outputs/phase-5/implementation-summary.md`           | Phase 5 成果物               |
| 変更ファイル一覧       | `outputs/phase-5/changed-files.md`                    | Phase 5 成果物               |
| 契約差分               | `outputs/phase-5/contract-diff.md`                    | Phase 5 成果物               |
| カバレッジ計画         | `outputs/phase-7/coverage-plan.md`                    | Phase 7 成果物               |
| 未到達分析             | `outputs/phase-7/uncovered-analysis-plan.md`          | Phase 7 成果物               |
| トレーサビリティ網羅率 | `outputs/phase-7/traceability-coverage-report.md`     | Phase 7 成果物               |

### システム仕様（aiworkflow-requirements）

| 資料名                | パス                                                                                        | 用途                           |
| --------------------- | ------------------------------------------------------------------------------------------- | ------------------------------ |
| アーキテクチャ概要    | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | 全体層構造                     |
| Electronサービス設計  | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`               | Mainサービス責務               |
| 認証IPC仕様           | `.claude/skills/aiworkflow-requirements/references/api-ipc-auth.md`                         | Auth経路仕様                   |
| システムIPC仕様       | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                       | 周辺チャネル確認               |
| IPCセキュリティ       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | 境界防御                       |
| Preloadセキュリティ   | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | sandbox境界                    |
| 開発ガイドライン      | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`               | ログ運用基準                   |
| エラーハンドリング    | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | 分類基準                       |
| 品質要件              | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 検証品質基準                   |
| タスク運用            | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 調査台帳同期                   |
| 教訓                  | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 再発防止知見                   |
| IPC契約チェックリスト | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | Main/Preload/Renderer 契約整合 |
| 実装パターン          | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | IPC登録順序・再登録防止        |
| セキュリティ原則      | `.claude/skills/aiworkflow-requirements/references/security-principles.md`                  | BrowserWindow/sandbox 基準     |
| リソースマップ        | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                            | 抽出漏れ防止                   |
| 検索スクリプト        | `.claude/skills/aiworkflow-requirements/scripts/search-spec.js`                             | 仕様抽出コマンド               |

### 依存Phase

| 資料名             | パス                        | 用途             |
| ------------------ | --------------------------- | ---------------- |
| 依存Phase 1 仕様   | `phase-1-requirements.md`   | 依存入力を確認   |
| 依存Phase 1 成果物 | `outputs/phase-1/`          | 依存成果物を確認 |
| 依存Phase 2 仕様   | `phase-2-design.md`         | 依存入力を確認   |
| 依存Phase 2 成果物 | `outputs/phase-2/`          | 依存成果物を確認 |
| 依存Phase 5 仕様   | `phase-5-implementation.md` | 依存入力を確認   |
| 依存Phase 5 成果物 | `outputs/phase-5/`          | 依存成果物を確認 |
| 依存Phase 6 仕様   | `phase-6-test-expansion.md` | 依存入力を確認   |
| 依存Phase 6 成果物 | `outputs/phase-6/`          | 依存成果物を確認 |
| 依存Phase 7 仕様   | `phase-7-coverage-check.md` | 依存入力を確認   |
| 依存Phase 7 成果物 | `outputs/phase-7/`          | 依存成果物を確認 |

## 実行手順

1. 入力成果物を確認する。
2. SubAgent-A/B/C を並列実行し、SubAgent-D で統合判定する。
3. 成果物を outputs/phase-N/ に定義する。
4. 完了条件で矛盾・漏れ・整合・依存を判定する。

## 統合テスト連携

- SubAgent-A/B/C の検証ケースを並列で設計する。
- SubAgent-D が統合順序を直列で確定する。
- AuthFlowOrchestratorログとRendererコンソールログの時系列一致を検証対象に固定する。
- DevTools起動ログとsandboxエラーの因果を分離して記録する。
- 主因修正後の再現率と副作用ログを別軸で評価する。
- 統合ログは `outputs/phase-8/` に保存する。

## 多角的チェック観点

| 観点     | 確認内容                                          |
| -------- | ------------------------------------------------- |
| 矛盾     | 仕様と成果物の矛盾がないか確認する                |
| 漏れ     | 要件から成果物への未反映項目がないか確認する      |
| 整合性   | Main/Preload/Renderer契約が一致しているか確認する |
| 依存関係 | 依存Phaseとの入力出力が整合しているか確認する     |

## 成果物

| 成果物         | パス                                             | 説明         |
| -------------- | ------------------------------------------------ | ------------ |
| リファクタ計画 | `outputs/phase-8/refactoring-plan.md`            | 責務分離計画 |
| 再テスト計画   | `outputs/phase-8/post-refactor-test-plan.md`     | 再検証計画   |
| 責務境界マップ | `outputs/phase-8/responsibility-boundary-map.md` | 境界定義     |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. SubAgent-A/B/C の並列作業
3. SubAgent-D の統合判定
4. 成果物出力
5. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/04-TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001
```

## 次のPhase

Phase 9: 品質保証
