# 必要仕様抽出マトリクス（UT-IMP-PHASE11-WORKTREE-PROTOCOL-001）

## 目的

本タスクで実装・検証に必要な `aiworkflow-requirements` 正本仕様を、関心ごとごとに整理した単一の参照マトリクス。  
Phase仕様書ごとの参照漏れ・重複・契約ドリフトを防ぐ。

## 抽出方法（再現可能手順）

1. `indexes/resource-map.md` でタスク種別（テスト実装 / CI-CD / IPCセキュリティ）から初期候補を抽出
2. `scripts/search-spec.js` で `playwright`, `validateIpcSender`, `ipc-contract-checklist` を検索
3. Phase 1〜13 の参照資料テーブルと突合し、未参照の必須仕様を補完
4. `verify-all-specs.js` / `validate-phase-output.js` で構造整合を確認

## 関心ごと別 必須仕様

| 関心ごと                    | 必須仕様（aiworkflow-requirements）                                                         | 理由                                                   | 主に使うPhase       |
| --------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------- |
| Electron 3プロセス設計      | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | Main/Preload/Renderer境界を固定するため                | 1, 2, 3, 10         |
| IPC契約                     | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | IPC引数/戻り値/エラー契約を一致させるため              | 1, 2, 3, 4, 5, 10   |
| IPC契約チェック手順         | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | ハンドラ・Preload・channels同期を漏れなく確認するため  | 1, 4, 5, 11         |
| IPCセキュリティ（Electron） | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | `validateIpcSender` とホワイトリスト前提を担保するため | 1, 3, 4, 9, 10      |
| Preload APIセキュリティ     | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | `contextBridge` 公開境界と入力検証の基準が必要なため   | 2, 3, 9, 10, 12     |
| テスト品質基準              | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | カバレッジ閾値と品質ゲート判定基準を固定するため       | 1, 3, 7, 9, 10, 12  |
| E2E品質基準                 | `.claude/skills/aiworkflow-requirements/references/quality-e2e-testing.md`                  | クリティカルパスE2E対象と品質指標を固定するため        | 2, 9, 10, 12, 13    |
| Playwright E2E実装パターン  | `.claude/skills/aiworkflow-requirements/references/testing-playwright-e2e.md`               | `_electron` 起動・テスト構造・設定パターン準拠のため   | 2, 4, 5, 12, 13     |
| 実装パターン標準            | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 既存IPC/E2E実装パターンと命名・責務分離を統一するため  | 2, 3, 5, 8, 12      |
| CI/CDジョブ仕様             | `.claude/skills/aiworkflow-requirements/references/deployment-gha.md`                       | GitHub Actionsジョブ設計ルールを揃えるため             | 2, 5, 9, 10, 12, 13 |
| DevOps運用知見              | `.claude/skills/aiworkflow-requirements/references/technology-devops.md`                    | CI最適化・運用制約の既知知見を反映するため             | 3, 9, 12            |
| エラー処理                  | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | テスト失敗時の分類・返却契約の整合に必要なため         | 1, 2, 3, 10         |
| ディレクトリ配置規約        | `.claude/skills/aiworkflow-requirements/references/directory-structure.md`                  | 参照パスと成果物配置を正規化するため                   | 12                  |
| タスク台帳運用              | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | Phase 12の完了記録/残課題同期の正本のため              | 1, 12               |

## 抽出漏れ防止チェック

- [x] 仕様追加時に本マトリクスへ追記した
- [x] 新規参照を追加したPhaseに、参照理由を1行で記載した
- [x] `task-specification-creator` の機械検証（`verify-all-specs`）が PASS した
- [x] `validate-phase-output` がエラー/警告ゼロで通過した

## 監査ログ（2026-03-01）

| 監査項目                                                                         | 結果                              |
| -------------------------------------------------------------------------------- | --------------------------------- |
| `verify-all-specs --workflow docs/30-workflows/ut-imp-phase11-worktree-protocol` | PASS（13/13, error=0, warning=0） |
| `validate-phase-output docs/30-workflows/ut-imp-phase11-worktree-protocol`       | PASS（error=0, warning=0）        |
