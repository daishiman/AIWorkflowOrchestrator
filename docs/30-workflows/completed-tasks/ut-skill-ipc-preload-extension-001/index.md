# UT-SKILL-IPC-PRELOAD-EXTENSION-001: task-9D-J 30チャネル IPC/Preload 拡張計画の策定

## メタ情報

| 項目       | 値                                              |
| ---------- | ----------------------------------------------- |
| タスクID   | UT-SKILL-IPC-PRELOAD-EXTENSION-001              |
| タイトル   | task-9D-J 30チャネル IPC/Preload 拡張計画の策定 |
| ステータス | spec_created                                    |
| 優先度     | high                                            |
| 複雑度     | large                                           |
| Tier       | 3                                               |
| 依存タスク | TASK-9B, UT-SKILL-IMPORT-CHANNEL-CONFLICT-001   |
| 作成日     | 2026-02-24                                      |
| 方針       | 既存追記版を破棄し、テンプレート準拠で再構成    |

## 目的

実装作業を行わず、task-9Dから9Jで必要な30チャネルIPC/Preload拡張の仕様書を漏れなく整備する。

## スコープ

### 含むもの

- 30チャネル計画をPhase 1から13へ分解
- ipc-extension-plan作成要件の定義
- task-9Dから9Jのartifacts.modifiesとartifacts.creates更新方針定義
- P5/P32/P44/P45再発防止の仕様反映

### 含まないもの

- apps/desktop/src配下の実装変更
- テストコード実装
- コミット作成、PR作成、マージ

## SubAgentチーム編成

| SubAgent   | 主担当          | 責務                                      |
| ---------- | --------------- | ----------------------------------------- |
| SubAgent-A | IPC契約監査     | 30チャネル契約、重複、命名整合の監査      |
| SubAgent-B | Preload設計監査 | skillAPI構造、safeInvoke/safeOn境界の監査 |
| SubAgent-C | 型体系監査      | packages/shared型配置、P32整合の監査      |
| SubAgent-D | 仕様統合監査    | 依存順序、成果物統合、最終判定            |

## aiworkflow-requirements 抽出結果（完全版）

### 抽出済み仕様

| 区分 | 参照仕様                                                                                  | 目的                                       |
| ---- | ----------------------------------------------------------------------------------------- | ------------------------------------------ |
| 必須 | .claude/skills/aiworkflow-requirements/references/api-ipc-agent.md                        | IPCチャネル命名、引数契約、戻り値契約      |
| 必須 | .claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md           | Renderer-Preload-Main間のSkill API契約     |
| 必須 | .claude/skills/aiworkflow-requirements/references/security-api-electron.md                | contextBridge、ホワイトリスト、公開API制約 |
| 必須 | .claude/skills/aiworkflow-requirements/references/security-electron-ipc.md                | ipcMain.handle/on運用差分、Sender検証      |
| 必須 | .claude/skills/aiworkflow-requirements/references/security-skill-ipc.md                   | safeInvoke/safeOn運用、Skill API防御       |
| 必須 | .claude/skills/aiworkflow-requirements/references/security-skill-execution.md             | 権限と実行境界                             |
| 必須 | .claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md               | P23/P32/P42/P44/P45検証                    |
| 必須 | .claude/skills/aiworkflow-requirements/references/ipc-type-resolution-guide.md            | 型不整合分類と解消手順                     |
| 必須 | .claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md | IPC拡張とPreload API設計                   |
| 必須 | .claude/skills/aiworkflow-requirements/references/arch-electron-services.md               | Main Process責務分離                       |
| 必須 | .claude/skills/aiworkflow-requirements/references/quality-requirements.md                 | 品質ゲートとテスト要件                     |
| 必須 | .claude/skills/aiworkflow-requirements/references/06-known-pitfalls.md                    | P5/P32/P44/P45再発防止                     |
| 必須 | .claude/skills/aiworkflow-requirements/references/error-handling.md                       | IPC失敗時のエラー契約                      |
| 必須 | .claude/skills/aiworkflow-requirements/references/lessons-learned.md                      | 同種タスク失敗例と予防策                   |
| 必須 | .claude/skills/aiworkflow-requirements/references/technology-desktop.md                   | Electron 3層責務                           |

### 検索エビデンス

| 検索クエリ     | 結果             | 判定                                                            |
| -------------- | ---------------- | --------------------------------------------------------------- |
| skill:chain    | 0件              | 正本未収載。task-9D仕様と本タスク仕様で補完し、実装後に正本追記 |
| preload        | 313件/41ファイル | Preload関連仕様を抽出済み                                       |
| ipcMain.handle | 37件/12ファイル  | handle運用仕様を抽出済み                                        |
| safeInvoke     | 123件/17ファイル | Preload呼び出し契約を抽出済み                                   |
| P32            | 複数ファイル     | 型同期チェック要件を抽出済み                                    |

## 思考フレーム適用結果

| 思考法             | 検討問い                         | 反映結果                                         |
| ------------------ | -------------------------------- | ------------------------------------------------ |
| 水平思考           | 追記方式以外の整理法は何か       | 既存記述を破棄し、テンプレート準拠で再生成       |
| 逆説思考           | 失敗前提で壊れる箇所はどこか     | P5/P32/P44/P45を完了条件へ埋め込み               |
| システム思考       | 依存はどこで循環するか           | Phase依存とtask-9依存を分離して固定              |
| 垂直思考           | 根拠は何か                       | aiworkflow正本参照と検索エビデンスを明記         |
| 類推思考           | 類似失敗から何を学ぶか           | lessons-learnedとpitfallsを必須参照化            |
| if思考             | もしskill:chain未収載なら        | 本仕様で先行定義し実装後に正本追記               |
| 素人思考           | 初見で迷う箇所は何か             | 章構成と責務分担を固定                           |
| トレードオン思考   | 安全性と可読性を同時達成できるか | 個別ホワイトリスト維持とグループ命名を併用       |
| プラスサム思考     | 監査と作成を同時達成できるか     | SubAgent分業で並列監査可能化                     |
| 2軸思考            | 完全性と可読性を両立できるか     | 必須項目維持のまま重複表を除去                   |
| 価値提案思考       | この仕様書の価値は何か           | 実装時の漏れ防止と依存可視化                     |
| why思考            | なぜこの順序か                   | 依存解消順でPhaseを設計                          |
| 改善思考           | 何を改善したか                   | 重複記述、抜け、曖昧表現を除去                   |
| 戦略的思考         | 将来変更へ備える方法は何か       | task-9更新ルールを事前固定                       |
| ダブル・ループ思考 | 前提自体は妥当か                 | 追記方式前提を撤回して再生成方式へ変更           |
| 抽象化思考         | 共通化できる要素は何か           | 共通参照と共通完了条件を標準化                   |
| プロセス思考       | 再現可能か                       | Phaseごとに実行手順を番号化                      |
| 仮説思考           | どこに抜けが出るか               | 依存参照漏れを機械検証対象化                     |
| 論点思考           | 争点は何か                       | 契約整合、型整合、依存整合に分解                 |
| 因果関係ループ     | 仕様抜けがどの失敗を招くか       | 契約ドリフトから実装失敗のループをチェック項目化 |

## Phase構成

| Phase | 名称                 | 目的                                                                                 | ファイル                     |
| ----- | -------------------- | ------------------------------------------------------------------------------------ | ---------------------------- |
| 1     | 要件定義             | 元タスク仕様を分解し、30チャネル計画の機能要件、非機能要件、受け入れ基準を固定する。 | phase-1-requirements.md      |
| 2     | 設計                 | channels.ts、skill-api.ts、preload/types.ts、packages/sharedの設計方針を整合させる。 | phase-2-design.md            |
| 3     | 設計レビューゲート   | 設計の矛盾、依存抜け、セキュリティ欠落をレビューで除去する。                         | phase-3-design-review.md     |
| 4     | テスト作成           | 仕様書タスクとして実装前に必要な検証ケースを定義する。                               | phase-4-test-creation.md     |
| 5     | 実装                 | コード実装を行わず、仕様書更新手順と計画書生成手順を確定する。                       | phase-5-implementation.md    |
| 6     | テスト拡充           | 仕様書専用タスクとしてテスト拡充の非該当判定を検証可能な形で残す。                   | phase-6-test-expansion.md    |
| 7     | テストカバレッジ確認 | 仕様書専用タスクとしてカバレッジ確認の非該当判定を維持する。                         | phase-7-coverage-check.md    |
| 8     | リファクタリング     | 仕様書専用タスクとしてリファクタリング非該当判定と表現統一方針を記録する。           | phase-8-refactoring.md       |
| 9     | 品質保証             | 仕様書成果物の矛盾、漏れ、依存、整合を総合検証する。                                 | phase-9-quality-assurance.md |
| 10    | 最終レビューゲート   | 品質保証結果を基にGo/No-Go判定を行い、残課題を固定する。                             | phase-10-final-review.md     |
| 11    | 手動テスト検証       | 仕様書の目視点検で機械検証が拾わない矛盾を除去する。                                 | phase-11-manual-test.md      |
| 12    | ドキュメント更新     | Phase 12必須5タスクを満たし、更新履歴と未タスク検出を完了させる。                    | phase-12-documentation.md    |
| 13    | PR作成               | PR準備情報を整理し、実行禁止ガードを明記した完了仕様を作成する。                     | phase-13-pr-creation.md      |

## 主要成果物（計画）

| 成果物           | パス                                                                    | 説明                                        |
| ---------------- | ----------------------------------------------------------------------- | ------------------------------------------- |
| IPC拡張計画書    | docs/30-workflows/skill-import-agent-system/tasks/ipc-extension-plan.md | 30チャネル定義、P32チェックリスト、実装順序 |
| 仕様更新対象一覧 | outputs/phase-5/spec-update-targets.md                                  | task-9Dから9J修正対象マトリクス             |
| 品質検証レポート | outputs/phase-9/quality-report.md                                       | 矛盾、漏れ、依存整合の検証結果              |
| 最終レビュー結果 | outputs/phase-10/final-review-result.md                                 | Go/No-Go判定                                |
| 仕様準拠監査     | outputs/task-spec-skill-compliance.md                                   | task-specification-creator準拠監査          |
| 抽出監査         | outputs/aiworkflow-spec-extraction-audit.md                             | aiworkflow抽出完全性監査                    |
