# タスク実行仕様書生成ガイド

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 概要

本ドキュメントは、複雑なタスクを単一責務の原則に基づいて分解し、各サブタスクに最適なスラッシュコマンド・エージェント・スキルの組み合わせを選定するためのガイドラインを定義する。

### 目的

ユーザーから与えられた複雑なタスクを分解し、以下を実現する：

- 単一責務の原則に基づいたサブタスク分割
- 各サブタスクに最適なコマンド・エージェント・スキルの選定
- そのまま実行可能な仕様書ドキュメントの生成
- TDDサイクル（Red→Green→Refactor）の組み込み
- 品質ゲートの明確化

### 成果物配置

生成された仕様書は以下のパス形式で配置する。

| 要素       | 説明                               | 例                                                        |
| ---------- | ---------------------------------- | --------------------------------------------------------- |
| ベースパス | `docs/30-workflows/`               | 固定                                                      |
| 機能名     | 実装対象の機能を表すディレクトリ名 | `skill-import-agent/`                                     |
| ファイル名 | `task-step{N}-{機能名}.md` 形式    | `task-step1-init.md`                                      |
| 完全パス例 | 上記を組み合わせた配置先           | `docs/30-workflows/skill-import-agent/task-step1-init.md` |

---

## ドキュメント構成

| ドキュメント     | ファイル                                             | 説明                                           |
| ---------------- | ---------------------------------------------------- | ---------------------------------------------- |
| フェーズ定義     | [task-workflow-phases.md](./task-workflow-phases.md) | Phase 0〜6の詳細定義とテンプレート             |
| ルール・選定基準 | [task-workflow-rules.md](./task-workflow-rules.md)   | 品質ゲート、コマンド・エージェント・スキル選定 |

---

## フェーズ構造（概要）

すべてのタスクは以下のフェーズ構造に従う。詳細は [task-workflow-phases.md](./task-workflow-phases.md) を参照。

| フェーズ                                  | ID接頭辞 | 目的                                         |
| ----------------------------------------- | -------- | -------------------------------------------- |
| Phase 0: 要件定義                         | `T-00`   | タスクの目的、スコープ、受け入れ基準を明文化 |
| Phase 1: 設計                             | `T-01`   | 要件を実現可能な構造に落とし込む             |
| Phase 2: テスト作成 (TDD: Red)            | `T-02`   | 期待される動作を検証するテストを先行作成     |
| Phase 3: 実装 (TDD: Green)                | `T-03`   | テストを通すための最小限の実装               |
| Phase 4: リファクタリング (TDD: Refactor) | `T-04`   | 動作を変えずにコード品質を改善               |
| Phase 5: 品質保証                         | `T-05`   | 定義された品質基準をすべて満たすことを検証   |
| Phase 6: ドキュメント更新                 | `T-06`   | 実装内容をシステム要件ドキュメントに反映     |

### フェーズ遷移図

以下の表はフェーズ間の遷移関係を示す。通常は上から順に進行し、Phase 5で品質ゲートを通過しない場合はPhase 4に戻る。

| 遷移元                    | 遷移先                    | 条件                 |
| ------------------------- | ------------------------- | -------------------- |
| Phase 0: 要件定義         | Phase 1: 設計             | 要件定義完了         |
| Phase 1: 設計             | Phase 2: テスト作成       | 設計完了             |
| Phase 2: テスト作成       | Phase 3: 実装             | テスト作成完了       |
| Phase 3: 実装             | Phase 4: リファクタリング | 実装完了             |
| Phase 4: リファクタリング | Phase 5: 品質保証         | リファクタリング完了 |
| Phase 5: 品質保証         | Phase 6: ドキュメント更新 | 品質ゲート通過       |
| Phase 5: 品質保証         | Phase 4: リファクタリング | 品質ゲート未通過     |
| Phase 6: ドキュメント更新 | 完了                      | ドキュメント更新完了 |

---

## 品質ゲート（概要）

次フェーズに進む前に満たすべき品質基準。詳細は [task-workflow-rules.md](./task-workflow-rules.md) を参照。

- 機能検証: 全テスト成功（ユニット、統合、E2E）
- コード品質: Lintエラーなし、型エラーなし、フォーマット適用済み
- テスト網羅性: カバレッジ基準達成（60%以上）
- セキュリティ: 脆弱性スキャン完了、重大な脆弱性なし

---

## 出力テンプレート

### ファイル配置

タスク実行仕様書は `docs/30-workflows/{機能名}/task-step{N}-{機能名}.md` の形式で配置する。詳細は「成果物配置」セクションの表を参照。

### テンプレート構造

タスク実行仕様書は以下の構造を持つ：

1. **ユーザーからの元の指示** - 元の指示文をそのまま記載
2. **タスク概要** - 目的、背景、最終ゴール、成果物一覧
3. **参照ファイル** - コマンド・エージェント・スキル選定の参照先
4. **タスク分解サマリー** - 全サブタスクの一覧表
5. **実行フロー図** - Mermaidによるフロー可視化
6. **各フェーズの詳細** - Phase 0〜5の各サブタスク詳細
7. **品質ゲートチェックリスト** - 完了条件のチェック項目
8. **リスクと対策** - リスク分析と対応方針
9. **前提条件** - タスク実行の前提
10. **備考** - 技術的制約、参考資料

---

## 実行時のコマンド・エージェント・スキル

### 本ドキュメント作成に使用するコマンド

| コマンド       | 用途                                                            |
| -------------- | --------------------------------------------------------------- |
| `/sc:workflow` | PRDと機能要件から構造化された実装ワークフローを生成             |
| `/sc:document` | コンポーネント、関数、API、機能の重点的文書生成                 |
| `/sc:design`   | システムアーキテクチャ、API、コンポーネントインターフェース設計 |

### 本ドキュメント作成に使用するエージェント

| エージェント           | 用途                                                   |
| ---------------------- | ------------------------------------------------------ |
| `technical-writer`     | 使いやすさとアクセシビリティに重点を置いた技術文書作成 |
| `requirements-analyst` | 曖昧なプロジェクトアイデアを具体的な仕様に変換         |
| `system-architect`     | スケーラブルシステムアーキテクチャ設計                 |

### 本ドキュメント作成に使用するスキル

タスク実行仕様書の生成には、プロジェクト固有のスキル定義（`.claude/skills/skill_list.md`）を参照する。

---

## 完了タスク

### タスク: UT-FIX-5-4 AgentSDKAPI abort() 型定義不一致修正（2026-02-10完了）

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| タスクID   | UT-FIX-5-4                                      |
| 完了日     | 2026-02-10                                      |
| ステータス | **完了**                                        |
| Phase      | Phase 1-12完了                                  |
| テスト数   | 24（新規追加）                                  |
| カバレッジ | 全テストPASS                                    |

#### 成果物

| 成果物                           | パス/内容                                                          |
| -------------------------------- | ------------------------------------------------------------------ |
| 型定義修正(shared)               | `packages/shared/src/agent/types.ts` (行237)                       |
| 型定義修正(preload)              | `apps/desktop/src/preload/types.ts` (行1289)                       |
| 変更内容                         | `abort(): void` → `abort(): Promise<void>`                         |

#### 変更理由

- P23パターン（API二重定義の型管理）準拠
- 実装（safeInvoke）の戻り値は`Promise<void>`だが型定義は`void`だった
- 2箇所同時更新でTypeScript開発者が`.then()`や`await`を正しく使用可能に

---

### タスク: UT-FIX-5-3 Preload Agent Abort セキュリティ修正（2026-02-10完了）

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| タスクID   | UT-FIX-5-3                                      |
| 完了日     | 2026-02-10                                      |
| ステータス | **完了**                                        |
| Phase      | Phase 1-12完了                                  |
| テスト数   | 21（全テストPASS）                              |
| カバレッジ | 全テストPASS                                    |

#### 成果物

| 成果物                           | パス/内容                                                          |
| -------------------------------- | ------------------------------------------------------------------ |
| Preload修正                      | `apps/desktop/src/preload/index.ts` (行423)                        |
| Main修正                         | `apps/desktop/src/main/agent/agent-handler.ts` (行176-178, 63)     |
| 変更内容                         | `ipcRenderer.send` → `safeInvoke(IPC_CHANNELS.AGENT_ABORT)`        |

#### 変更理由

- 04-electron-security.md IPC セキュリティ原則準拠
- ホワイトリスト検証のバイパスを解消
- 他のAPI（stop, getStatus等）と同一パターンに統一

---

### タスク: TASK-AUTH-SESSION-REFRESH-001 セッション自動リフレッシュ実装（2026-02-06完了）

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| タスクID   | TASK-AUTH-SESSION-REFRESH-001                   |
| 完了日     | 2026-02-06                                      |
| ステータス | **完了**                                        |
| Phase      | Phase 1-12完了                                  |
| テスト数   | 26                                              |
| カバレッジ | Stmts 96.15%, Branch 93.10%, Funcs 100%         |

#### 成果物

| 成果物                     | パス/内容                                                    |
| -------------------------- | ------------------------------------------------------------ |
| TokenRefreshScheduler      | `apps/desktop/src/main/services/tokenRefreshScheduler.ts`    |
| テストケース               | `apps/desktop/src/main/services/__tests__/tokenRefreshScheduler.test.ts` |
| authHandlers.ts更新        | スケジューラー統合、コールバック追加                         |
| supabaseClient.ts更新      | `autoRefreshToken: false`                                    |
| authSlice.ts更新           | `isRefreshing` フィールド追加                                |
| auth.ts更新                | `sessionExpiresAt` フィールド追加                            |

#### 未タスク（TASK-AUTH-SESSION-REFRESH-001実施中に発見）

| タスクID                    | タスク名                           | 優先度 |
| --------------------------- | ---------------------------------- | ------ |
| UT-OFFLINE-REFRESH-001      | オフライン時リフレッシュ失敗処理   | 中     |
| UT-AUDIT-001                | 認証イベント監査ログ               | 中     |
| UT-REFRESH-NOTIFICATION-001 | セッションリフレッシュ通知UI       | 低     |

---

### タスク: TASK-7D ChatPanel統合（2026-01-30完了）

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| タスクID   | TASK-7D                                     |
| 完了日     | 2026-01-30                                  |
| ステータス | **完了**                                    |
| Phase      | Phase 1-12完了                              |
| テスト数   | 48（ChatPanel: 15, SkillStreamingView: 33） |
| カバレッジ | Line 100%, Branch 93.75%+, Function 100%    |

#### 成果物

| 成果物                 | パス/内容                                                                    |
| ---------------------- | ---------------------------------------------------------------------------- |
| ChatPanel.tsx          | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`（136行）           |
| SkillStreamingView.tsx | `apps/desktop/src/renderer/components/skill/SkillStreamingView.tsx`（251行） |
| index.ts更新           | `apps/desktop/src/renderer/components/skill/index.ts`                        |
| テスト                 | ChatPanel.test.tsx, SkillStreamingView.test.tsx                              |
| ドキュメント           | `docs/30-workflows/TASK-7D-chat-panel-integration/`（33 Phase出力ファイル）  |

#### 未タスク（TASK-7D実施中に発見）

| タスクID                                   | タスク名                          | 優先度 |
| ------------------------------------------ | --------------------------------- | ------ |
| task-imp-skillselector-onimportrequest-001 | SkillSelector onImportRequest改善 | 中     |
| task-imp-chatpanel-new-design-001          | ChatPanel新デザイン改善           | 中     |

---

### タスク: task-specification-creator Phase 12テンプレート強化（2026-01-22完了）

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| タスクID   | TSC-PHASE12-IMPROVE-002                      |
| 完了日     | 2026-01-22                                   |
| ステータス | **完了**                                     |
| 対象スキル | `.claude/skills/task-specification-creator/` |
| バージョン | v7.6.0                                       |

#### 改善内容

1. **Phase 12-2セクション強化**
   - `spec-update-workflow.md`への参照リンク追加
   - 2ステップ実行プロセスの明示化（Step 1: 完了記録、Step 2: 仕様更新）
   - 判断基準テーブルをテンプレート内に埋め込み

2. **完了条件チェックリストの明示化**
   - Phase 12-2の3ステップを個別チェック項目として追加
   - 見落とし防止のため`【Phase 12-2 Step 1】`等のプレフィックス付与

3. **フォールバック手順セクション追加**
   - スクリプト不在時の代替手順を明記
   - `generate-documentation-changelog.js`等の手動実行ガイド

#### 成果物

| 成果物                     | パス                                                                      |
| -------------------------- | ------------------------------------------------------------------------- |
| phase-templates.md（更新） | `.claude/skills/task-specification-creator/references/phase-templates.md` |
| SKILL.md（更新）           | `.claude/skills/task-specification-creator/SKILL.md`                      |

---

### タスク: task-specification-creator Phase 12改善（2026-01-22完了）

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| タスクID   | TSC-PHASE12-IMPROVE-001                      |
| 完了日     | 2026-01-22                                   |
| ステータス | **完了**                                     |
| 対象スキル | `.claude/skills/task-specification-creator/` |
| バージョン | v7.5.0                                       |

#### 改善内容

1. **Phase 12 Task 2の2ステップ化**
   - Step 1: タスク完了記録（必須 - 全タスク共通）
   - Step 2: システム仕様更新（条件付き）

2. **documentation-changelog.md自動生成スクリプト追加**
   - `scripts/generate-documentation-changelog.js` 新規作成
   - artifacts.jsonとgit diffから自動生成

3. **spec-update-workflow.md明確化**
   - 2種類の更新アクション（完了記録 vs 仕様更新）を明確に分離
   - 判断フローチャートを全体フローに更新

#### 成果物

| 成果物                          | パス                                                                                    |
| ------------------------------- | --------------------------------------------------------------------------------------- |
| SKILL.md（更新）                | `.claude/skills/task-specification-creator/SKILL.md`                                    |
| spec-update-workflow.md（更新） | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`          |
| 自動生成スクリプト（新規）      | `.claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js` |

---

## 残課題（未タスク）

以下のタスクは未実施として認識されており、タスク仕様書が作成済み。

| タスクID                                   | タスク名                                              | 優先度 | 発見元                                                         | タスク仕様書                                                                               |
| ------------------------------------------ | ----------------------------------------------------- | ------ | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| TASK-3-1-B                                 | SkillExecutor IPC Handler統合                         | 高     | TASK-3-1-A完了時（blocks）                                     | `docs/30-workflows/unassigned-task/task-3-1-B-skillexecutor-ipc-integration.md`            |
| TASK-SKILL-PERF-TEST                       | SkillExecutor パフォーマンステスト                    | 低     | TASK-3-1-A Phase 11推奨事項                                    | `docs/30-workflows/unassigned-task/task-skillexecutor-performance-testing.md`              |
| SKILL-E2E-001                              | スキルインポートE2Eテスト                             | 中     | Phase 11（手動テスト検証）推奨事項                             | `docs/30-workflows/unassigned-task/task-skill-import-e2e-testing.md`                       |
| TSC-AUTOMATION-001                         | Phase 12自動化スクリプト拡充                          | 低     | skill-import-persistence-bugfix実施時                          | `docs/30-workflows/unassigned-task/task-phase12-automation-enhancement.md`                 |
| UT-008                                     | Chat History UI Components                            | 中     | Phase 12（UT-006完了後の後続タスク）                           | `docs/30-workflows/unassigned-task/task-chat-history-ui-components.md`                     |
| UT-009                                     | Chat History Additional Use Cases                     | 中     | Phase 12（api-chat-history.md 未実装Use Cases）                | `docs/30-workflows/unassigned-task/task-chat-history-additional-usecases.md`               |
| task-imp-skillselector-onimportrequest-001 | SkillSelector onImportRequest改善                     | 中     | TASK-7D実施中に発見                                            | `docs/30-workflows/unassigned-task/task-imp-skillselector-onimportrequest-improvements.md` |
| task-imp-chatpanel-new-design-001          | ChatPanel新デザイン改善                               | 中     | TASK-7D実施中に発見                                            | `docs/30-workflows/unassigned-task/task-imp-chatpanel-new-design-improvements.md`          |
| task-chatedit-store-integration-001        | chatEditSlice Store統合                               | 中     | システム仕様書分析（arch-state-management.md）                 | `docs/30-workflows/unassigned-task/task-chatedit-slice-store-integration.md`               |
| task-rag-largefile-perf-001                | RAG変換 大容量ファイルパフォーマンス検証              | 中     | システム仕様書分析（quality-requirements.md）                  | `docs/30-workflows/unassigned-task/task-rag-converter-largefile-performance.md`            |
| TASK-CHUNK-API-001                         | Chunk Search APIレイヤー実装                          | 中     | api-internal-chunk-search.md（未実装レイヤー）                 | `docs/30-workflows/unassigned-task/task-imp-chunk-search-api-layers.md`                    |
| TASK-DOM-NESTING-001                       | validateDOMNesting警告修正                            | 低     | ui-history-integration.md（残課題）                            | `docs/30-workflows/unassigned-task/task-validate-dom-nesting-bugfix.md`                    |
| UT-RETRY-001                               | リトライ設定UI                                        | 低     | TASK-SKILL-RETRY-001 Phase 12                                  | `docs/30-workflows/unassigned-task/task-retry-settings-ui.md`                              |
| UT-RETRY-002                               | リトライ履歴永続化                                    | 低     | TASK-SKILL-RETRY-001 Phase 12                                  | `docs/30-workflows/unassigned-task/task-retry-history-persistence.md`                      |
| UT-RETRY-003                               | サーキットブレーカーパターン導入                      | 中     | TASK-SKILL-RETRY-001 Phase 11 + error-handling.md              | `docs/30-workflows/unassigned-task/task-circuit-breaker-pattern.md`                        |
| UT-RETRY-004                               | リトライイベントRenderer表示                          | 中     | TASK-SKILL-RETRY-001 Phase 11                                  | `docs/30-workflows/unassigned-task/task-use-skill-execution-retry-events.md`               |
| UT-RETRY-005                               | リトライ型定義shared package移行                      | 低     | TASK-SKILL-RETRY-001 Phase 5                                   | `docs/30-workflows/unassigned-task/task-retry-types-shared-migration.md`                   |
| CONV-DEBT-001                              | PlainTextConverter実装                                | 中     | interfaces-converter.md / architecture-file-conversion.md      | `docs/30-workflows/unassigned-task/task-plaintext-converter.md`                            |
| UT-VECTOR-001                              | ベクトル検索フィルター拡張                            | 低     | rag-vector-search.md 未対応フィルター                          | `docs/30-workflows/unassigned-task/task-vector-search-advanced-filters.md`                 |
| task-imp-ipc-imp002-channels-001           | IMP-002チャネル本体実装（settings/permissions/cache） | 中     | TASK-8C-A Phase 12（IPC統合テスト）                            | `docs/30-workflows/unassigned-task/task-imp-ipc-imp002-channels.md`                        |
| task-imp-ipc-permission-response-001       | skill:permission:response チャネル実装                | 低     | TASK-8C-A Phase 12（IPC統合テスト）                            | `docs/30-workflows/unassigned-task/task-imp-ipc-permission-response.md`                    |
| task-ref-quality-requirements-split-001    | quality-requirements.md仕様書分割                     | 低     | TASK-OPT-CI-TEST-PARALLEL-001 Phase 12（テンプレート準拠確認） | `docs/30-workflows/unassigned-task/task-ref-quality-requirements-split-001.md`             |
| task-e2e-permission-waitfortimeout-001     | E2E権限テスト waitForTimeout改善                      | 低     | TASK-8C-D Phase 10（TQ-M1指摘）                                | `docs/30-workflows/unassigned-task/task-e2e-permission-waitfortimeout-refactoring.md`      |
| task-e2e-test-readme-documentation-001     | READMEへのE2Eテスト実行方法追加                       | 低     | TASK-8C-D Phase 9（DOC-M1指摘）                                | `docs/30-workflows/unassigned-task/task-e2e-test-readme-documentation.md`                  |
| TASK-9B-H                                  | SkillCreatorService IPC通信設定                       | 高     | TASK-9B-G Phase 12（IPC未設定）                                | `docs/30-workflows/unassigned-task/task-9b-h-skill-creator-ipc-channel.md`                 |
| UI-INTEGRATION-9B                          | SkillCreator UI統合（TASK-10A連携）                   | 高     | TASK-9B-G Phase 12（UI未実装）                                 | `docs/30-workflows/unassigned-task/task-9b-ui-integration-task10a.md`                      |
| TASK-9B-I                                  | Claude Agent SDK本格統合                              | 中     | TASK-9B-G Phase 3（推奨事項）                                  | `docs/30-workflows/unassigned-task/task-9b-i-skill-creator-sdk-integration.md`             |
| TASK-9B-J                                  | ResourceLoaderキャッシュ無効化                        | 低     | TASK-9B-G Phase 3（推奨事項）                                  | `docs/30-workflows/unassigned-task/task-9b-j-skill-creator-cache-invalidation.md`          |
| TASK-9B-K                                  | タイムアウト設定の外部化                              | 低     | TASK-9B-G Phase 3（推奨事項）                                  | `docs/30-workflows/unassigned-task/task-9b-k-skill-creator-timeout-config.md`              |
| TASK-10A-UI-SKILL-IMPROVE                  | スキル改善UI表示機能                                  | 中     | TASK-9C Phase 11（手動テスト発見）                             | `docs/30-workflows/unassigned-task/task-10a-ui-skill-improve.md`                           |
| TASK-10B-IMPROVE-HISTORY                   | 改善履歴の永続化                                      | 低     | TASK-9C Phase 12（スコープ外候補）                             | `docs/30-workflows/unassigned-task/task-10b-improve-history.md`                            |
| TASK-10C-AB-TEST                           | A/Bテスト実行・結果比較機能                           | 低     | TASK-9C Phase 12（スコープ外候補）                             | `docs/30-workflows/unassigned-task/task-10c-ab-test.md`                                    |
| task-imp-phase12-validation-001            | Phase 12ドキュメント更新自動検証ツール                | 中     | AUTH-UI-004 Phase 12（ドキュメント更新漏れ）                   | `docs/30-workflows/unassigned-task/task-phase12-doc-validation-tool.md`                    |
| UT-AUTH-001                                | profileHandlers.test.ts IPCハンドラモック環境修正     | 低     | AUTH-UI-001 Phase 5（テスト環境問題）                          | `docs/30-workflows/unassigned-task/ut-auth-001-profilehandlers-test-fix.md`                |
| task-search-scope-folder-001               | 検索スコープ指定機能                                  | 中     | task-imp-search-ui-001 Phase 12（将来拡張候補）                | `docs/30-workflows/unassigned-task/task-search-scope-folder.md`                            |
| task-search-multifile-replace-001          | マルチファイル一括置換機能                            | 中     | task-imp-search-ui-001 Phase 12（将来拡張候補）                | `docs/30-workflows/unassigned-task/task-search-multifile-replace.md`                       |
| UT-ENV-001                                 | CI node-versionの.nvmrc参照化                         | 低     | ENV-INFRA-001 Phase 3レビュー                                  | `docs/30-workflows/unassigned-task/task-ut-env-001-ci-nvmrc.md`                            |
| UT-FIX-5-1-001                             | AgentView型アサーション解消（ImportedSkill→Skill）    | 低     | TASK-FIX-5-1-SKILL-API-UNIFICATION Phase 10（MINOR指摘）      | `docs/30-workflows/unassigned-task/task-ut-fix-5-1-001-agentview-type-assertion.md`        |
| UT-OFFLINE-REFRESH-001                   | オフライン時リフレッシュ失敗処理                      | 中     | TASK-AUTH-SESSION-REFRESH-001 Phase 12（スコープ外項目）       | `docs/30-workflows/unassigned-task/task-offline-refresh.md`                                |
| UT-AUDIT-001                             | 認証イベント監査ログ                                  | 中     | TASK-AUTH-SESSION-REFRESH-001 Phase 12（スコープ外項目）       | `docs/30-workflows/unassigned-task/task-auth-audit-logging.md`                             |
| UT-REFRESH-NOTIFICATION-001              | セッションリフレッシュ通知UI                          | 低     | TASK-AUTH-SESSION-REFRESH-001 Phase 12（スコープ外項目）       | `docs/30-workflows/unassigned-task/task-refresh-notification.md`                           |
| UT-SEC-001                                 | OAuth プロバイダー自動検出機能（consumeState→validate置換）         | 低 | DEBT-SEC-001 Phase 12（設計乖離検出）                          | `docs/30-workflows/unassigned-task/task-auth-provider-detection.md`                         |
| task-sec-auth-state-cleanup-001            | State Map定期クリーンアップ実装                                     | 低 | DEBT-SEC-001 Phase 12（既知制約検出）                          | `docs/30-workflows/unassigned-task/task-auth-state-cleanup-scheduling.md`                   |
| UT-PROTOCOL-URL-001                        | カスタムプロトコルURLパース標準ユーティリティ整備                   | 中 | TASK-AUTH-CALLBACK-001 Phase 12（苦戦箇所検出）                | `docs/30-workflows/unassigned-task/task-protocol-url-parsing-utility.md`                    |
| UT-FIX-5-2                                 | Preload Dialog API ハードコード削除                                 | 中 | TASK-FIX-5-1 Phase 10                                          | `docs/30-workflows/unassigned-task/task-ut-fix-5-2-preload-dialog-hardcode.md`              |
| ~~UT-FIX-5-3~~                             | ~~Preload Agent Abort セキュリティ修正~~                            | ~~高~~ | ~~TASK-FIX-5-1 Phase 10~~                                      | ~~`docs/30-workflows/unassigned-task/task-ut-fix-5-3-preload-agent-abort.md`~~ **2026-02-10完了** |
| TASK-FIX-12-2-IPC-HARDCODE-FIX-UPDATER-AGENT | Updater/AgentHandler IPC チャネル名定数化                          | 低 | TASK-FIX-12-1 Phase 12                                         | `docs/30-workflows/unassigned-task/task-fix-12-2-ipc-hardcode-fix-updater-agent.md`         |
| TASK-DOC-PHASE12-JUDGMENT-CRITERIA-001       | Phase 12判断基準の明確化と漏れ防止強化                             | 低 | TASK-FIX-6-1-STATE-CENTRALIZATION Phase 12                     | `docs/30-workflows/unassigned-task/task-doc-phase12-judgment-criteria-improvement.md`       |
| ~~UT-FIX-5-4~~                               | ~~AgentSDKAPI 型定義不一致修正~~                                   | ~~低~~ | ~~UT-FIX-5-3 Phase 12 アーキテクチャ検証~~                     | ~~`docs/30-workflows/unassigned-task/task-ut-fix-5-4-agent-sdk-api-type-mismatch.md`~~ **2026-02-10完了** |
| UT-STORE-HOOKS-REFACTOR-001                  | Store Hooksを個別セレクタベースに再設計                             | 中 | TASK-UT-AUTH-MODE-UI-INTEGRATION タスク仕様書 セクション8      | `docs/30-workflows/unassigned-task/task-ut-store-hooks-refactor.md`                         |
| UT-FIX-APP-INITAUTH-CHECK-001                | App.tsxのinitializeAuth確認                                         | 低 | TASK-UT-AUTH-MODE-UI-INTEGRATION Phase 10 MINOR指摘            | `docs/30-workflows/unassigned-task/task-ut-fix-app-initauth-check.md`                       |
| UT-FIX-7-1-001                               | SkillService型アサーション→型ガード改善                            | 低 | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION Phase 12                 | `docs/30-workflows/unassigned-task/task-ut-fix-7-1-001-skillservice-type-guard.md`          |
| UT-FIX-7-1-002                               | skillHandlers.ts機能別分割                                         | 低 | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION Phase 12                 | `docs/30-workflows/unassigned-task/task-ut-fix-7-1-002-skillhandlers-split.md`              |
| UT-FIX-7-1-003                               | IPCレスポンスパターン統一                                          | 低 | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION Phase 12                 | `docs/30-workflows/unassigned-task/task-ut-fix-7-1-003-ipc-response-pattern-unification.md` |

### 未タスク管理ルール

- 未タスクは `docs/30-workflows/unassigned-task/` に配置
- タスク完了時は取り消し線でマークし、完了タスクセクションに移動
- 優先度「高」のタスクから順に実施

---

## 関連ドキュメント

- [プロジェクト概要](./overview.md)
- [非機能要件](./quality-requirements.md)
- [アーキテクチャ設計](./architecture-overview.md)
- [プラグイン開発手順](./plugin-development.md)
- [task-specification-creator SKILL.md](../../task-specification-creator/SKILL.md)

---

## 変更履歴

| バージョン | 日付       | 変更内容                                                                                                                                                                                                  |
| ---------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0      | 2026-01-20 | 初版作成                                                                                                                                                                                                  |
| 1.1.0      | 2026-01-22 | task-specification-creator Phase 12改善完了記録追加                                                                                                                                                       |
| 1.2.0      | 2026-01-22 | 残課題（未タスク）セクション追加、未タスク2件（E2Eテスト、自動化拡充）登録                                                                                                                                |
| 1.3.0      | 2026-01-22 | task-specification-creator v7.6.0完了記録追加（Phase 12テンプレート強化）                                                                                                                                 |
| 1.4.0      | 2026-01-22 | 未タスク追加: UT-008 Chat History UI Components, UT-009 Chat History Additional Use Cases                                                                                                                 |
| 1.5.0      | 2026-01-25 | 未タスク追加: TASK-3-1-B (IPC Handler統合), TASK-SKILL-PERF-TEST (パフォーマンステスト)                                                                                                                   |
| 1.7.0      | 2026-01-30 | TASK-7D完了記録追加、未タスク2件（task-imp-skillselector-onimportrequest-001, task-imp-chatpanel-new-design-001）登録                                                                                     |
| 1.8.0      | 2026-01-31 | 未タスク追加: TASK-CHUNK-API-001 (Chunk Search API), TASK-DOM-NESTING-001 (DOM警告修正)                                                                                                                   |
| 1.9.0      | 2026-01-31 | 未タスク9件追加: TASK-SKILL-RETRY-001関連5件（設定UI/履歴永続化/サーキットブレーカー/Rendererイベント/型shared移行）+ システム仕様検出3件（Chunk Search API層/PlainTextConverter/ベクトル検索フィルター） |
| 1.6.0      | 2026-01-26 | spec-guidelines.md準拠: コードブロックを表形式・文章に変換（成果物配置、フェーズ遷移図、ファイル配置）                                                                                                    |
| 1.10.0     | 2026-02-02 | 未タスク2件追加: task-imp-ipc-imp002-channels-001（IMP-002チャネル実装）、task-imp-ipc-permission-response-001（permission:response実装）。TASK-8C-A Phase 12検出                                         |
| 1.11.0     | 2026-02-02 | 未タスク追加: task-ref-quality-requirements-split-001（quality-requirements.md仕様書分割）。TASK-OPT-CI-TEST-PARALLEL-001 Phase 12検出                                                                    |
| 1.12.0     | 2026-02-02 | 未タスク2件追加: task-e2e-permission-waitfortimeout-001（waitForTimeout改善）、task-e2e-test-readme-documentation-001（READMEドキュメント）。TASK-8C-D Phase 9/10検出                                     |
| 1.13.0     | 2026-02-03 | 未タスク5件追加: TASK-9B-H（IPC通信設定）、UI-INTEGRATION-9B（UI統合）、TASK-9B-I（SDK統合）、TASK-9B-J（キャッシュ無効化）、TASK-9B-K（タイムアウト外部化）。TASK-9B-G Phase 12検出                       |
| 1.14.0     | 2026-02-03 | 未タスク3件追加: TASK-10A-UI-SKILL-IMPROVE（スキル改善UI）、TASK-10B-IMPROVE-HISTORY（履歴永続化）、TASK-10C-AB-TEST（A/Bテスト）。TASK-9C Phase 11/12検出                                                |
| 1.17.0     | 2026-02-04 | AUTH-UI-001完了記録追加。UT-AUTH-001タスク仕様書パスを正式な指示書（ut-auth-001-profilehandlers-test-fix.md）に更新                                                                                       |
| 1.16.0     | 2026-02-04 | 未タスク追加: UT-AUTH-001（profileHandlers.test.ts環境修正）。AUTH-UI-001 Phase 5検出                                                                                                                     |
| 1.15.0     | 2026-02-04 | AUTH-UI-004完了: 未タスク1件追加（task-imp-phase12-validation-001）、better-sqlite3タスクv1.1.0更新                                                                                                        |
| 1.16.0     | 2026-02-04 | 未タスク2件追加: task-search-scope-folder-001（検索スコープ指定）、task-search-multifile-replace-001（マルチファイル一括置換）。task-imp-search-ui-001 Phase 12検出                                       |
| 1.18.0     | 2026-02-10 | UT-FIX-5-3/UT-FIX-5-4完了記録追加。残課題テーブルから完了タスクセクションに移動。Agent Abort IPCセキュリティ修正・AgentSDKAPI型定義修正完了                                                               |
| 1.18.0     | 2026-02-05 | 未タスク追加: UT-ENV-001（CI node-versionの.nvmrc参照化）。ENV-INFRA-001 Phase 3検出                                                                                                                       |
| 1.19.1     | 2026-02-06 | DEBT-SEC-001完了記録追加。UT-SEC-001はDEBT-SEC-002/003の対応範囲に包含と判定（独立未タスク不要）                                                                                                             |
| 1.19.0     | 2026-02-06 | TASK-AUTH-SESSION-REFRESH-001完了記録追加、未タスク3件追加（UT-OFFLINE-REFRESH-001、UT-AUDIT-001、UT-REFRESH-NOTIFICATION-001） |
| 1.20.0     | 2026-02-06 | 未タスク2件追加: UT-PROTOCOL-URL-001（カスタムプロトコルURLパース標準化）、UT-SEC-001更新（独立指示書作成）。TASK-AUTH-CALLBACK-001 Phase 12苦戦箇所検出                 |
| 1.21.0     | 2026-02-09 | 未タスク追加: TASK-FIX-12-2-IPC-HARDCODE-FIX-UPDATER-AGENT（Updater/AgentHandler IPCチャネル名定数化）。TASK-FIX-12-1 Phase 12検出                                          |
| 1.22.0     | 2026-02-10 | 未タスク更新: TASK-DOC-PHASE12-JUDGMENT-CRITERIA-001（Phase 12判断基準の明確化と漏れ防止強化）。TASK-FIX-6-1-STATE-CENTRALIZATION Phase 12で発生したP25-P28全インシデントをカバーする包括的な改善タスク |
| 1.23.0     | 2026-02-10 | 未タスク2件追加: UT-STORE-HOOKS-REFACTOR-001（Store Hooks個別セレクタ再設計）、UT-FIX-APP-INITAUTH-CHECK-001（App.tsx initializeAuth確認）。TASK-UT-AUTH-MODE-UI-INTEGRATION Phase 10/12検出 |
| 1.24.0     | 2026-02-11 | 未タスク3件追加: UT-FIX-7-1-001（SkillService型ガード改善）、UT-FIX-7-1-002（skillHandlers分割）、UT-FIX-7-1-003（IPCレスポンスパターン統一）。TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION Phase 12検出 |
