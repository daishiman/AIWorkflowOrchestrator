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

### タスク: 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 SettingsView 統合回帰カバレッジ強化（2026-03-08）

| 項目 | 値 |
| --- | --- |
| タスクID | 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 |
| ステータス | **完了（Phase 1-12 出力 + 実装 + 実画面検証 + 仕様同期）** |
| 完了日 | 2026-03-08 |
| 対象 | `SettingsView.integration.test.tsx` / `settings-test-harness.ts` / Phase 11-12 証跡更新 |
| 成果物 | `docs/30-workflows/08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001/outputs/` |

#### 実施内容

- SettingsView 統合テストを 18 件へ拡張（auth-mode 切替、provider fallback、status 表示条件、RAG/保存操作）
- `settings-test-harness.ts` に store + electronAPI 境界を集約し、過剰モックを抑制
- Phase 11 の画面検証を実施し、スクリーンショット 2 件を証跡化（TC-11-03/04）

#### 苦戦箇所（今回実装で詰まった点）

- Playwright 実行時のポート競合で初回撮影失敗（専用 spec へ切り出して再実行）
- `act()` warning が INT-05 系で残存（機能影響はないがノイズとして未タスク化）
- Phase 12 で「予定」表現が残りやすく、実績ベース記述への差し替えが必要

#### 検証証跡

| コマンド | 結果 |
| --- | --- |
| `cd apps/desktop && pnpm vitest run src/renderer/views/SettingsView/__tests__/SettingsView.integration.test.tsx` | PASS（18 tests） |
| `cd apps/desktop && pnpm test:e2e -- e2e/settings-integration-regression-screenshots.spec.ts` | PASS（2 tests） |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 --json` | PASS |

#### Phase 12で登録した関連未タスク

| タスクID | 概要 | 参照 |
| --- | --- | --- |
| UT-08-001 | SettingsView 統合テストの `act()` warning 解消 | `docs/30-workflows/completed-tasks/unassigned-task/task-ut-08-001-settings-act-warning-guard.md` |
| UT-08-002 | SettingsView 画面導線の E2E カバレッジ拡張 | `docs/30-workflows/completed-tasks/unassigned-task/task-ut-08-002-settings-e2e-coverage.md` |
| UT-08-003 | Phase 6 残件（INT-11〜13）の再評価と必要分実装 | `docs/30-workflows/completed-tasks/unassigned-task/task-ut-08-003-settings-phase6-remaining-cases.md` |
| UT-08-004 | settings harness パターンの仕様標準化を継続強化 | `docs/30-workflows/completed-tasks/unassigned-task/task-ut-08-004-settings-harness-pattern-spec-sync.md` |

### タスク: TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 registerAllIpcHandlers Graceful Degradation（2026-03-08）

| 項目       | 値                                                                                       |
| ---------- | ---------------------------------------------------------------------------------------- |
| タスクID   | TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001                                            |
| ステータス | **完了（Phase 1-12 出力 + 実装 + テスト + 仕様同期）**                                   |
| 完了日     | 2026-03-08                                                                               |
| 対象       | `registerAllIpcHandlers()` の Graceful Degradation（個別 try-catch + 失敗記録）          |
| 成果物     | `docs/30-workflows/completed-tasks/10-TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001/outputs/`            |

#### 実施内容

- `safeRegister()` ヘルパーを導入し、各 `registerXxxHandlers()` を個別 try-catch で囲む
- `IpcHandlerRegistrationResult` 型（`successCount` / `failureCount` / `failures`）を戻り値として返却
- `HandlerRegistrationFailure` 型（`handlerName` / `errorMessage` / `errorCode: 4001`）で失敗情報を記録
- 8グループ（依存なし / mainWindow依存 / ThemeWatcher / Supabase条件分岐 / APIKey / History / AgentExecution / AuthKey+Skill系）に分類して登録
- 1つのグループの失敗が後続グループの登録を阻害しない設計

#### 教訓

| 項目       | 内容                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------- |
| 苦戦箇所   | `setupThemeWatcher` は戻り値（unsubscribe関数）を保持する必要があり、`safeRegister` ラッパーに収まらなかった |
| 対処       | `setupThemeWatcher` のみ個別の try-catch ブロックで処理し、他は `track()` 関数で統一的に処理                  |
| 標準ルール | IPC ハンドラ登録は「失敗を記録し続行する」Graceful Degradation を標準とし、エラーコード 4001 で分類する       |

### 苦戦箇所

| ID | 課題 | 影響 | 解決策 |
|---|---|---|---|
| S-GD-1 | `setupThemeWatcher` が `safeRegister` パターンに適合しない | 戻り値（unsubscribe）のキャプチャ不可 | 個別 try-catch で対応、設計書に使い分けを明記 |
| S-GD-2 | `track()` クロージャの成功カウント管理 | 手動カウント漏れリスク | クロージャで自動追跡 |
| S-GD-3 | `sanitizeRegistrationErrorMessage` のパスマスク | 正規表現メタ文字の未エスケープ | `escapeRegExp()` 適用 |
| S-GD-4 | 既存 `agentHandlers.test.ts` の失敗との混同 | 16テスト失敗が変更起因と誤認されるリスク | テストファイル絞り込み実行で分離 |

### 関連仕様書更新

| 仕様書 | 更新内容 |
|---|---|
| `lessons-learned.md` | S-GD-1〜S-GD-4 教訓追加 |
| `api-ipc-system.md` | 実装パターン詳細追記 |
| `architecture-implementation-patterns.md` | S30 苦戦箇所・テスト戦略追記 |
| `security-electron-ipc.md` | SEC-GD-1〜SEC-GD-3 セキュリティ苦戦箇所追記 |

#### 2026-03-08 再監査

| 項目 | 結果 |
| --- | --- |
| `verify-all-specs` | PASS（13/13, error=0, warning=0） |
| `validate-phase-output` | PASS（28項目） |
| `validate-phase11-screenshot-coverage` | PASS（expected=3 / covered=3） |
| `validate-phase12-implementation-guide` | PASS |
| `verify-unassigned-links` | PASS（existing=216 / missing=0） |
| open 未タスク | 4件（苦戦箇所・スキルフィードバック・テスト失敗由来） |

#### Phase 12 後追加で検出した関連未タスク

| ID | 概要 | 優先度 | 指示書パス |
|---|---|---|---|
| UT-FIX-AGENT-HANDLERS-VITE-RESOLVE-001 | agentHandlers.test.ts 16テスト失敗（Vite resolvePackageEntry エラー）修正 | 高 | `docs/30-workflows/completed-tasks/10-TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001/unassigned-task/task-fix-agent-handlers-vite-resolve.md` |
| UT-IMP-IPC-ERROR-SANITIZE-COMMON-001 | sanitizeErrorMessage の IPC ハンドラ横断共通化 | 中 | `docs/30-workflows/completed-tasks/10-TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001/unassigned-task/task-ipc-error-sanitize-common.md` |
| UT-IMP-WORKFLOW-STALE-VALIDATOR-001 | index.md / artifacts.json / phase-*.md stale 状態一括検出バリデータ | 中 | `docs/30-workflows/completed-tasks/10-TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001/unassigned-task/task-workflow-stale-validator.md` |
| UT-IMP-SKILL-CONFLICT-MARKER-LINT-001 | SKILL.md / LOGS.md conflict marker 検出 lint | 中 | `docs/30-workflows/completed-tasks/10-TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001/unassigned-task/task-skill-conflict-marker-lint.md` |

---
### タスク: 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 設定画面 apiKey.list 契約防御と providers 正規化（2026-03-07）

| 項目       | 値                                                                          |
| ---------- | --------------------------------------------------------------------------- |
| タスクID   | 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001                              |
| ステータス | **完了（Phase 1-12 出力 + 実装 + 実画面検証 + 仕様同期）**                  |
| 完了日     | 2026-03-07                                                                  |
| 対象       | 設定画面 `ApiKeysSection` の `apiKey:list` 契約防御・providers 正規化       |
| 成果物     | `docs/30-workflows/06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001/outputs/` |

#### 実施内容

- ApiKeysSection normalizeProviders + apiKeyHandlers Array.isArray + profileHandlers パターン統一
- 20テスト追加、全122件PASS
- Phase 3 ゲート: PASS、Phase 10 ゲート: MINOR（P48 残存 → 未タスク化）

#### 検証証跡

| コマンド | 結果 |
| --- | --- |
| `pnpm --filter @repo/desktop exec node scripts/capture-task-06-settings-apikey-contract-guard-phase11.mjs` | PASS（TC-11-01〜03） |
| `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/apiKeyHandlers.list.test.ts src/main/ipc/__tests__/profileHandlers.identities.test.ts src/renderer/components/organisms/ApiKeysSection/__tests__/ApiKeysSection.test.tsx` | PASS（3 files / 59 tests） |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001` | PASS（13/13, error=0） |
| `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001` | PASS |

#### 関連未タスク（Phase 12で起票）

| タスクID | 概要 | 参照 |
| --- | --- | --- |
| UT-SETTINGS-APIKEY-001 | `Array.isArray` 防御の共通ユーティリティ化 | `docs/30-workflows/unassigned-task/task-imp-settings-ensure-array-utility-001.md` |
| UT-SETTINGS-APIKEY-002 | Settings画面 ErrorBoundary 導入 | `docs/30-workflows/unassigned-task/task-imp-settings-error-boundary-guard-001.md` |
| UT-SETTINGS-APIKEY-003 | ApiKeysSection E2E統合テスト追加 | `docs/30-workflows/unassigned-task/task-imp-settings-apikey-e2e-integration-001.md` |
| UT-FIX-PHASE11-SCREENSHOT-AUTOMATION-001 | Phase 11 スクリーンショット自動取得基盤 | `docs/30-workflows/unassigned-task/task-imp-phase11-screenshot-automation-001.md` |

#### 2026-03-08 再確認（Phase 12仕様準拠監査）

| 項目 | 結果 |
| --- | --- |
| `phase-12-documentation.md` の Task 1-5 実行状態 | 実績同期済み（完了） |
| `verify-all-specs` | PASS（error=0, warning=0, info=0） |
| `validate-phase-output` | PASS（28項目） |
| `validate-phase11-screenshot-coverage` | PASS（expected=3 / covered=3） |
| `verify-unassigned-links` | PASS（missing=0） |

#### 再確認時の苦戦箇所（2026-03-08）

| 苦戦箇所 | 再発条件 | 解決策 |
| --- | --- | --- |
| `manual-test-result.md` の証跡表ヘッダが validator 仕様と不一致 | `テストケース` / `証跡` 列がない独自表を使う | Phase 11成果物に validator互換表を明示追加し、`validate-phase11-screenshot-coverage` で固定 |
| screenshot 再取得時に Rollup optional dependency 欠落でキャプチャ失敗 | worktreeの依存が不完全なまま capture script を起動 | `pnpm install` で依存補完後に再撮影し、metadata を更新してから検証 |

### タスク: TASK-10A-F スキルライフサイクルUI Store移行（2026-03-07）

| 項目       | 値                                                     |
| ---------- | ------------------------------------------------------ |
| タスクID   | TASK-10A-F                                             |
| ステータス | **完了**                                               |
| 完了日     | 2026-03-07                                             |
| 成果物     | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/outputs/` |

#### 実施内容

- `useSkillAnalysis.ts`: 直接IPC 3箇所をStore個別セレクタ経由に移行
- `SkillCreateWizard.tsx`: TASK-10A-Cで移行済み（変更不要）
- テスト: 52テスト全PASS、カバレッジ基準充足

#### 仕様書同期

| ID       | 更新対象                                  | 更新内容                     |
| -------- | ----------------------------------------- | ---------------------------- |
| SG-SM-01 | `arch-state-management.md`                | TASK-10A-F セクション追加    |
| SG-LL-01 | `lessons-learned.md`                      | 苦戦箇所5件 + 再利用手順追加 |
| SG-IP-01 | `architecture-implementation-patterns.md` | S19パターン追加              |
| SG-TW-01 | `task-workflow.md`                        | 本セクション追加             |

### タスク: TASK-10A-E-C Store駆動ライフサイクル統合設計（2026-03-06）

| 項目       | 内容                                                               |
| ---------- | ------------------------------------------------------------------ |
| タスクID   | TASK-10A-E-C                                                       |
| 完了日     | 2026-03-06                                                         |
| ステータス | **完了（Phase 1-12 出力 + 実画面検証 + 仕様同期）**                |
| 対象       | `SkillManagementPanel` の import lifecycle state/selectors/actions |

#### 仕様書別SubAgent分担（関心ごと分離）

| SubAgent   | 担当仕様書                            | 主担当作業                           | 完了条件                                          |
| ---------- | ------------------------------------- | ------------------------------------ | ------------------------------------------------- |
| SubAgent-A | `references/arch-state-management.md` | selector/action と P31派生ルール同期 | `useShallow` 適用条件と状態遷移契約が明文化される |
| SubAgent-B | `references/task-workflow.md`         | 完了台帳と未タスク導線同期           | 完了記録と残課題IDが一致する                      |
| SubAgent-C | `outputs/phase-11/*`                  | 画面証跡取得と TC ひも付け           | `TC-01..08` の証跡が揃う                          |

#### 検証証跡

| コマンド                                                                                                                                                                                   | 結果                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------- |
| `pnpm --filter @repo/desktop exec node scripts/capture-task-043c-store-lifecycle-screenshots.mjs`                                                                                          | PASS（TC-01..08 screenshot 取得） |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/task-043c-store-lifecycle-integration-design`                     | PASS（13/13, error=0）            |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-043c-store-lifecycle-integration-design`                           | PASS                              |
| `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/task-043c-store-lifecycle-integration-design` | PASS（expected=8 / covered=8）    |

#### Phase 12で登録した関連未タスク

| タスクID       | 概要                                                             | 参照                                                                                                                                                       |
| -------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UT-10A-E-C-001 | SkillImportDialog の inline selector を個別 selector へ移行      | `docs/30-workflows/completed-tasks/task-043c-store-lifecycle-integration-design/unassigned-task/task-10a-e-c-selector-migration-001.md`                    |
| UT-10A-E-C-002 | create/analyze 導線の直接 IPC 呼び出しを store action 経由へ移行 | `docs/30-workflows/completed-tasks/task-043c-store-lifecycle-integration-design/unassigned-task/task-10a-e-c-create-analyze-store-action-migration-002.md` |

### タスク: TASK-10A-F Store駆動ライフサイクルUI統合（2026-03-07）

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-10A-F |
| 完了日 | 2026-03-07 |
| ステータス | **完了（Phase 1-12 出力 + 実画面検証 + 仕様同期）** |
| 対象 | `useSkillAnalysis` の直接IPC排除、`SkillCreateWizard` / `SkillAnalysisView` の Store駆動整合 |
| 参照 | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/` |

#### 仕様書別SubAgent分担（関心ごと分離）

| SubAgent | 担当仕様書 | 主担当作業 | 完了条件 |
| --- | --- | --- | --- |
| SubAgent-A | `references/arch-state-management.md` | Store責務境界（TASK-10A-D/E-C/F）の同期 | action/state の責務境界が競合しない |
| SubAgent-B | `references/ui-ux-feature-components.md` | UI完了記録と画面証跡導線同期 | workflow と証跡リンクが追跡可能 |
| SubAgent-C | `references/task-workflow.md` | 完了台帳・検証証跡・未タスク判定同期 | Step 1-A〜Step 2 の反映漏れがない |

#### 検証証跡

| コマンド | 結果 |
| --- | --- |
| `pnpm --filter @repo/desktop exec node scripts/capture-skill-analysis-view-screenshots.mjs --output-dir ../../docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/outputs/phase-11/screenshots` | PASS（TC-01..08 screenshot 取得） |
| `pnpm --filter @repo/desktop exec node scripts/capture-skill-create-wizard-screenshots.mjs` | PASS（create wizard screenshot 取得） |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/store-driven-lifecycle-ui --json` | PASS（13/13, error=0） |
| `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/store-driven-lifecycle-ui --json` | PASS |

#### 2026-03-08 再確認追補

- 移管前 current workflow の `manual-test-result.md` / `capture-results.json` / `implementation-guide.md` / `spec-update-summary.md` が stale だったため、actual evidence ベースへ再同期した
- Phase 11 はスクリーンショット 11 件を移管前 workflow で再取得し、統合後 workflow へ反映した
- Phase 12 は `validate-phase12-implementation-guide` を追加ゲートとして通し、Phase 12 完了確認後に completed workflow へ統合した

#### 2026-03-08 final sync（comparison baseline 正規化）

- completed workflow を comparison baseline に使う以上、`phase-7-coverage-check.md` / `phase-11-manual-test.md` / `artifacts.json` / `outputs/artifacts.json` まで current と同ターンで正規化し、`verify-all-specs --strict` / `validate-phase-output` を PASS に揃えた
- `phase-11-manual-testing.md` の legacy 重複を削除し、`screenshot-plan.json` / `discovered-issues.md` を completed workflow にも補完した
- screenshot harness は store action が内部例外を汎用 UI 文言へ畳む前提を踏まえ、wizard 側は `スキル生成に失敗しました`、analysis 側は `data-testid="skill-analysis-view"` を ready 条件の正本とした

#### 2026-03-08 Phase 12 タスク仕様再確認

- 移管前 current workflow は Task 12-1〜12-5 と Step 1-A〜1-G / Step 2 を満たし、その成果物は completed workflow へ統合済み
- `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/unassigned-task/` には TASK-10A-F 由来の open backlog 5件が配置済みで、テンプレート準拠も確認した
- ただしディレクトリ全体は legacy 正規化が未完了であり、repo-wide 監査値は `baselineViolations=110` を継続監視する
- したがって判定は「今回差分合格」「legacy 負債は別管理」の二層で扱う

| コマンド | 結果 |
| --- | --- |
| `pnpm install --frozen-lockfile` | PASS（Rollup optional dependency 復旧） |
| `pnpm --filter @repo/desktop exec playwright install chromium` | PASS |
| `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/completed-tasks/store-driven-lifecycle-ui` | PASS |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --diff-from HEAD --json` | PASS（currentViolations=0） |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json` | INFO（baselineViolations=110） |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/store-driven-lifecycle-ui --strict` | PASS |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/store-driven-lifecycle-ui` | PASS |

#### Phase 12で継続管理する open backlog

- open backlog: **5件**
- 履歴上の完了済み運用ガード: **1件**

| タスクID | 概要 | 優先度 | 参照 |
| --- | --- | --- | --- |
| UT-10A-G-SKILL-EDITOR-IPC-STORE-MIGRATION | SkillEditor 残存直接IPC呼び出し6箇所のStore移行 | 中 | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/unassigned-task/task-10a-g-skill-editor-ipc-store-migration.md` |
| UT-10A-F-STORE-MOCK-PATTERN-STANDARDIZATION-GUARD | Store mockテストパターン標準化ガード | 中 | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/unassigned-task/task-10a-f-store-mock-pattern-standardization-guard.md` |
| UT-10A-F-IMPROVEMENT-RESULT-STORE-INTEGRATION | improvementResult Store統合（条件付き） | 低 | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/unassigned-task/task-10a-f-improvement-result-store-integration.md` |
| UT-10A-F-SCREENSHOT-HARNESS-HARDENING | Screenshot Harness の data-testid ベース待機条件標準化 | 中 | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/unassigned-task/task-10a-f-screenshot-harness-hardening.md` |
| UT-10A-F-2WORKFLOW-BASELINE-NORMALIZATION | 2Workflow Baseline 正規化自動化 | 中 | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/unassigned-task/task-10a-f-2workflow-baseline-normalization.md` |

| 完了済みガード | 概要 | 参照 |
| --- | --- | --- |
| UT-IMP-TASK10A-F-PHASE11-FILENAME-EVIDENCE-SYNC-GUARD-001 | Phase 11 文書名・TC 証跡同期の運用ガード | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task10a-f-phase11-filename-and-evidence-sync-guard-001.md` |

#### 実装時の苦戦箇所（TASK-10A-F）

| 苦戦箇所 | 再発条件 | 対処 |
| --- | --- | --- |
| `phase-11-manual-testing.md` と validator 期待名 `phase-11-manual-test.md` の不一致 | 手動テスト文書名が workflow ごとに揺れる | `phase-11-manual-test.md` を正本として固定し、証跡11件を TC と1:1で同期 |
| Phase 12 changelog が「対象/予定」表現のまま残る | 実更新前に changelog を先行記述する | Step 1-A〜Step 2 を完了ベースで再記録し、予定表現を削除 |

### タスク: TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001 settings persist iterable hardening（2026-03-07）

| 項目       | 内容                                                   |
| ---------- | ------------------------------------------------------ |
| タスクID   | TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001       |
| 完了日     | 2026-03-07                                             |
| ステータス | **完了（Phase 1-12 出力 + 画面証跡 + 仕様同期）**      |
| 対象       | `expandedFolders` / `viewHistory` の iterable 崩れ耐性 |

#### 仕様書別SubAgent分担（関心ごと分離）

| SubAgent   | 担当仕様書                            | 主担当作業                    | 完了条件                                          |
| ---------- | ------------------------------------- | ----------------------------- | ------------------------------------------------- |
| SubAgent-A | `references/arch-state-management.md` | persist 復旧契約を追記        | DD-01..DD-05 の防御境界が明文化される             |
| SubAgent-B | `references/lessons-learned.md`       | 再発条件と5分解決カードを追記 | 同種課題へ再利用できる手順が残る                  |
| SubAgent-C | `outputs/phase-11/*`                  | screenshot 2件とTC紐付け      | `validate-phase11-screenshot-coverage` で証跡確認 |

#### 検証証跡

| コマンド                                                                                                                                                                           | 結果             |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| `pnpm --filter @repo/desktop exec vitest run src/renderer/store/slices/navigationSlice.test.ts src/renderer/store/__tests__/customStorage.test.ts`                                 | PASS（42 tests） |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/07-TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001`                            | PASS             |
| `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/07-TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001`  | PASS             |
| `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/07-TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001` | PASS             |

#### Phase 12で検出した関連未タスク（branch横断）

| タスクID                                           | 概要                                                 | 参照                                                                                        |
| -------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| ~~UT-IMP-PHASE12-WORKFLOW10-COMPLIANCE-FIX-001~~       | ~~Workflow10 の Phase 7/12 準拠不足是正~~                | `docs/30-workflows/completed-tasks/10-TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001/unassigned-task/task-imp-phase12-workflow10-compliance-fix-001.md` **再評価クローズ: 2026-03-08（workflow10 再監査完了）**       |
| UT-IMP-PHASE12-WORKFLOW11-COMPLIANCE-FIX-001       | Workflow11 の Phase 1-11 構造不足と Phase 12不足是正 | `docs/30-workflows/unassigned-task/task-imp-phase12-workflow11-compliance-fix-001.md`       |
| UT-IMP-PHASE12-WORKFLOW12-IMPLEMENTATION-GUIDE-001 | Workflow12 の実装ガイド欠落是正                      | `docs/30-workflows/unassigned-task/task-imp-phase12-workflow12-implementation-guide-001.md` |

#### branch横断再確認（2026-03-08）

| workflow                                                | `verify-all-specs` | `validate-phase-output` | `validate-phase12-implementation-guide` |
| ------------------------------------------------------- | ------------------ | ----------------------- | --------------------------------------- |
| `07-TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001`   | PASS               | PASS                    | PASS                                    |
| `10-TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001`      | PASS               | PASS                    | PASS                                    |
| `11-TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001`      | PASS               | FAIL（Phase 1-11 必須節欠落） | FAIL（implementation-guide 欠落） |
| `12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001` | PASS               | PASS                    | FAIL（implementation-guide 欠落）       |

> 完了判定は `verify-all-specs` 単独ではなく、Phase 12 2検証を含む3点セットを必須とする。

#### Workflow11 再確認で登録した関連未タスク（2026-03-08）

| タスクID | 概要 | 参照 |
| --- | --- | --- |
| UT-IMP-PROFILE-AVATAR-FALLBACK-ERROR-LOCALIZATION-001 | Settings の Profile / Avatar fallback error を code ベースで日本語化する | `docs/30-workflows/completed-tasks/11-TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001/unassigned-task/task-imp-profile-avatar-fallback-error-localization-001.md` |

#### 同種課題の5分解決カード（persist hydrate 破損入力）

| 項目       | 内容                                                                                                                                                                                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 症状       | persist 復元後に `is not iterable` / `has no method forEach` 等が発生し、Settings や Navigation が初期化に失敗する                                                                                                                                                       |
| 根本原因   | `zustand/middleware` の `persist` が localStorage/electron-store から復元した値が `Set` / `Array` ではなく `null` / `object` / `number` 等に破損している                                                                                                                 |
| 最短4手順  | 1) persist 復元対象に `Array.isArray` / `instanceof Set` ガードを入れる 2) 非正常値は `console.warn` を出して安全既定値にフォールバックする 3) テストで破損値5パターン以上を固定し、回帰を先に防ぐ 4) Phase 11 で最低2枚（light/dark）の画面証跡を残し、TC-ID で紐付ける |
| 検証ゲート | `validate-phase-output` PASS、`validate-phase11-screenshot-coverage` PASS、`validate-phase12-implementation-guide` PASS、対象テスト PASS（42 tests）                                                                                                                     |
| 同期先3点  | `references/task-workflow.md` / `references/lessons-learned.md` / `references/arch-state-management.md`                                                                                                                                                                  |

### タスク: TASK-UI-01-C-NOTIFICATION-HISTORY-DOMAIN 通知履歴・履歴検索ドメイン実装（2026-03-05）

| 項目       | 内容                                                               |
| ---------- | ------------------------------------------------------------------ |
| タスクID   | TASK-UI-01-C-NOTIFICATION-HISTORY-DOMAIN                           |
| 完了日     | 2026-03-05                                                         |
| ステータス | **完了（Phase 1-12 出力 + 実装 + テスト）**                        |
| 対象       | Notification履歴管理 / HistorySearch状態管理 / IPC-Preload公開契約 |

#### 仕様書別SubAgent分担（関心ごと分離）

| SubAgent   | 担当仕様書                                                     | 主担当作業                                                            | 完了条件                                              |
| ---------- | -------------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------- |
| SubAgent-A | `references/arch-state-management.md`                          | `notificationSlice` / `historySearchSlice` の状態責務・永続化契約同期 | Slice責務/保持件数/selector 契約が仕様化される        |
| SubAgent-B | `references/api-ipc-system.md` / `references/api-endpoints.md` | IPC 7チャネル（history 2 + notification 5）の契約同期                 | Main/Preload/Renderer 契約が3層で一致する             |
| SubAgent-C | `references/task-workflow.md`                                  | 完了台帳、検証証跡、未タスク判定の同期                                | Phase 1-12 の実行証跡が追跡可能になる                 |
| SubAgent-D | `references/lessons-learned.md`                                | 実装苦戦箇所と再利用手順の固定                                        | 同種タスクの再発防止手順が再利用可能になる            |
| SubAgent-E | `outputs/phase-11/*`                                           | 実画面3件 + 非視覚3件の証跡設計と Apple UI/UX 視点判定                | `SCREENSHOT` と `NON_VISUAL` の判定境界が明確化される |

#### 実装反映（要点）

- Store Sliceを追加:
  - `apps/desktop/src/renderer/store/slices/notificationSlice.ts`
  - `apps/desktop/src/renderer/store/slices/historySearchSlice.ts`
- Main IPC ハンドラを追加:
  - `apps/desktop/src/main/ipc/notificationHandlers.ts`
  - `apps/desktop/src/main/ipc/historySearchHandlers.ts`
- Preload公開境界を拡張:
  - `apps/desktop/src/preload/channels.ts`
  - `apps/desktop/src/preload/types.ts`
  - `apps/desktop/src/preload/index.ts`
- Store統合と永続化キー同期:
  - `apps/desktop/src/renderer/store/index.ts`
- テストを追加:
  - `notificationSlice.test.ts` / `historySearchSlice.test.ts`
  - `notificationHandlers.test.ts` / `historySearchHandlers.test.ts`
  - `channels.test.ts` 拡張

#### 検証証跡（2026-03-05）

| コマンド                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | 結果                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `pnpm --filter @repo/desktop exec vitest run src/renderer/store/slices/notificationSlice.test.ts src/renderer/store/slices/historySearchSlice.test.ts src/main/ipc/notificationHandlers.test.ts src/main/ipc/historySearchHandlers.test.ts src/preload/channels.test.ts`                                                                                                                                                                                                                                                                                                                                                                                                                    | PASS（5 files / 37 tests）                                              |
| `pnpm --filter @repo/desktop typecheck`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | PASS                                                                    |
| `node apps/desktop/scripts/capture-task-056c-notification-history-screenshots.mjs`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | PASS（TC-11-01〜03 実画面証跡を再取得）                                 |
| `pnpm --filter @repo/desktop exec vitest run --coverage.enabled true --coverage.provider v8 --coverage.reportsDirectory coverage-task-056c --coverage.include \"src/renderer/store/slices/notificationSlice.ts\" --coverage.include \"src/renderer/store/slices/historySearchSlice.ts\" --coverage.include \"src/main/ipc/notificationHandlers.ts\" --coverage.include \"src/main/ipc/historySearchHandlers.ts\" --coverage.include \"src/preload/channels.ts\" src/renderer/store/slices/notificationSlice.test.ts src/renderer/store/slices/historySearchSlice.test.ts src/main/ipc/notificationHandlers.test.ts src/main/ipc/historySearchHandlers.test.ts src/preload/channels.test.ts` | PASS（Statements 87.45 / Branch 65.11 / Functions 80.39 / Lines 87.45） |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/task-056c-notification-history-domain`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | PASS（13/13, error=0）                                                  |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-056c-notification-history-domain`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | PASS（28項目, error=0）                                                 |

#### Phase 12 タスク仕様準拠の追加確認（2026-03-05 21:04 JST）

| 観点               | コマンド                                                                                                                                                                            | 結果                                           |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Phase 12 必須要件  | `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-056c-notification-history-domain --phase 12`                | PASS（Task 12-1〜12-5 / 完了条件5件を再確認）  |
| 画面証跡再採取     | `node apps/desktop/scripts/capture-task-056c-notification-history-screenshots.mjs`                                                                                                  | PASS（TC-11-01〜03 再撮影）                    |
| 画面証跡カバレッジ | `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/task-056c-notification-history-domain` | PASS（expected 6 / covered 6）                 |
| 未タスク差分監査   | `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD`                                                                          | `currentViolations=0`, `baselineViolations=92` |
| 未タスク配置差分   | `git diff --name-only HEAD -- docs/30-workflows/unassigned-task docs/30-workflows/completed-tasks/unassigned-task`                                                                  | 0件（今回タスク起因の未タスク追加/移動なし）   |

#### Phase 11（UI/UX 判定）

- 実画面証跡: `TC-11-01`（Dashboard）, `TC-11-02`（Chat History空状態）, `TC-11-03`（History一覧）を再取得。
- 非視覚証跡: `TC-11-04..06` は契約テスト起点で `NON_VISUAL` を維持。
- Apple UI/UX 観点では、情報階層・可読性・空状態の優先度に視覚的退行なしと判定。

#### 未タスク判定

- 実装差分として新規未タスク化が必要な項目は **0件**。
- 追加した要件（Slice/IPC/Preload/テスト）はすべて `outputs/phase-1..12` と仕様正本へ同期済み。
- ただし再監査運用で再発した「対象テスト実行の誤起動リスク（`pnpm run test:run --`）」は運用改善対象として未タスク化し、同ターンで完了タスクへ移管した。

#### 関連タスク（2026-03-05 追補・完了移管）

| タスクID                                         | 概要                                                                                                                                                         | 参照                                                                                                  |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| ~~UT-IMP-PHASE12-TARGETED-VITEST-RUN-GUARD-001~~ | ~~Phase 12 再監査で対象テストのみを確実実行するガード（`pnpm exec vitest run` 直指定 + スクリプト実在 preflight）~~ **完了: 2026-03-05（Phase 12完了移管）** | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-targeted-vitest-run-guard-001.md` |

#### 同種課題の簡潔解決手順（4ステップ）

1. Store/IPC/Preload を先に責務分離し、仕様書別SubAgentへ担当を固定する。
2. 新規チャネル追加時は `main handler` / `preload channels` / `preload types` の3点を同一ターンで同期する。
3. Phase 11 は UI導線（`SCREENSHOT`）と契約検証（`NON_VISUAL`）を分離して証跡化する。
4. Phase 12 は `arch-state-management` / `api-ipc-system` / `api-endpoints` / `task-workflow` / `lessons-learned` を同時更新し、`verify` + `validate` で閉じる。

### タスク: TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001 auth-key IPCハンドラ登録漏れ修正（2026-03-05）

| 項目       | 内容                                                                                    |
| ---------- | --------------------------------------------------------------------------------------- |
| タスクID   | TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001                                              |
| 完了日     | 2026-03-05                                                                              |
| ステータス | **完了（Phase 1-12 出力 + 実装 + テスト + 画面回帰検証）**                              |
| 目的       | `auth-key:exists` の `No handler registered` を解消し、再登録ライフサイクルを整合させる |

#### 仕様書別SubAgent分担（関心ごと分離）

| SubAgent   | 担当仕様書                     | 主担当作業                            | 完了条件                                |
| ---------- | ------------------------------ | ------------------------------------- | --------------------------------------- |
| SubAgent-A | `references/api-ipc-system.md` | Main登録/解除ライフサイクルの仕様同期 | auth-key runtime登録責務が文書化される  |
| SubAgent-B | `references/task-workflow.md`  | 完了台帳・検証証跡・関連リンクの固定  | Phase 1-12 実行証跡が追跡可能になる     |
| SubAgent-C | `outputs/phase-11/*`           | 画面回帰証跡 + Apple UI/UXレビュー    | TC単位の画面証跡3件とレビュー結果が残る |
| SubAgent-D | `outputs/phase-12/*`           | Step 1-A/1-B/1-C/Step 2 の統合判定    | 矛盾/漏れ/整合/依存を満たす             |

#### 実装反映（要点）

- `apps/desktop/src/main/ipc/index.ts` へ以下を反映:
  - `registerAuthKeyHandlers(mainWindow, authKeyService)` を `registerAllIpcHandlers` に接続
  - `unregisterAuthKeyHandlers()` を `unregisterAllIpcHandlers` に接続
- `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts` に auth-key lifecycle 回帰テストを追加。
- `apps/desktop/src/main/ipc/__tests__/authKeyHandlers.test.ts` に再登録・未登録解除・複数サイクルケースを追加。

#### 画面検証（Phase 11 回帰）

| テストケース | 証跡                                                                                                                                                | 判定 |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| TC-11-UI-01  | `docs/30-workflows/completed-tasks/01-TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001/outputs/phase-11/screenshots/TC-11-UI-01-root-navigation.png`      | PASS |
| TC-11-UI-02  | `docs/30-workflows/completed-tasks/01-TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001/outputs/phase-11/screenshots/TC-11-UI-02-skill-center-view.png`    | PASS |
| TC-11-UI-03  | `docs/30-workflows/completed-tasks/01-TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001/outputs/phase-11/screenshots/TC-11-UI-03-ui-design-foundation.png` | PASS |

- Apple UI/UXレビュー結果: 情報階層・視認性・一貫性で重大問題なし（低優先度のコントラスト改善余地のみ）。

#### 検証証跡

| コマンド                                                                                                                                                                                                                                                                          | 結果                                                                                                                                    |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm --filter @repo/desktop test:run src/main/ipc/__tests__/ipc-double-registration.test.ts src/main/ipc/__tests__/authKeyHandlers.test.ts src/renderer/hooks/__tests__/useSkillExecution.test.ts src/renderer/stores/agent/__tests__/agentSlice.executeSkill.preflight.test.ts` | PASS（76 tests、実行ログ上は3 test files）                                                                                              |
| `pnpm --filter @repo/desktop test:run`                                                                                                                                                                                                                                            | FAIL（`@repo/desktop` 全量実行で `skill-creator.fixture.test.ts` 実行中に `SIGTERM`）。証跡は失敗ログを記録し、対象テスト分割実行へ切替 |
| `pnpm --filter @repo/desktop typecheck`                                                                                                                                                                                                                                           | PASS                                                                                                                                    |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/01-TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001`                                                                                                                 | PASS（Phase 1-12成果物作成後に再検証）                                                                                                  |
| `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/01-TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001`                                                                                       | PASS（expected=3 / covered=3）                                                                                                          |

#### 実装時の苦戦箇所と解決策

| 苦戦箇所                                        | 再発条件                                                                             | 対処                                                                                         | 標準ルール                                                               |
| ----------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| ハンドラ実装済みでも runtime 未登録             | `authKeyHandlers.ts` の単体テスト合格のみで完了判定する                              | `registerAllIpcHandlers` に `registerAuthKeyHandlers` を接続し、統合テストで起動経路を固定   | IPC修正は「handler実装 + register配線」セットで完了判定する              |
| unregister 側の追随漏れ                         | register 側のみ修正し、アプリ再初期化サイクルを検証しない                            | `unregisterAllIpcHandlers` に `unregisterAuthKeyHandlers` を追加し、多重サイクルテストを追加 | register/unregister は常に対称更新する                                   |
| 仕様台帳に苦戦箇所が残らない                    | `task-workflow` の完了記録だけ更新し、教訓転記を後回しにする                         | `lessons-learned.md` に同タスク専用セクションを追加し、再利用手順まで同期                    | Phase 12 Step 2 は「実装内容 + 苦戦箇所 + 簡潔手順」同時反映を必須化する |
| `apps/desktop test:run` が `SIGTERM` で中断する | 長時間 fixture テストを含む全量実行を1コマンドで固定し、実行環境の負荷差を吸収しない | 失敗ログを証跡化したうえで `vitest run <対象>` の分割実行へ切替し、対象回帰の合否を確定する  | 回帰判定は「全量1本」に限定せず、長時間系は分割実行 + 合算記録を許容する |

#### 同種課題の簡潔解決手順（4ステップ）

1. 追加・修正した IPC チャネルについて、`register*` と `unregister*` の両経路を先に棚卸しする。
2. `ipc/index.ts` の配線修正と lifecycle 回帰テスト追加を同一コミット粒度で実施する。
3. Phase 11 証跡を TC 単位で確認し、`validate-phase11-screenshot-coverage` を PASS させる。
4. `task-workflow` と `lessons-learned` に苦戦箇所と再利用手順を同時に転記して完了判定する。

#### 同種課題の5分解決カード（runtime配線 + テスト中断ガード）

| 項目       | 内容                                                                                                                                                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `No handler registered` または `pnpm --filter @repo/desktop test:run` が `SIGTERM` で停止                                                                                                                               |
| 根本原因   | `register/unregister` 対称確認の不足、長時間 fixture テストの一括実行固定                                                                                                                                               |
| 最短5手順  | 1) `ipc/index.ts` で `register/unregister` 両経路を棚卸し 2) runtime 配線を対称更新 3) lifecycle 回帰テストを追加 4) 全量実行失敗時は `vitest run <対象>` へ分割 5) 検証値を `task-workflow/lessons/api-ipc` に同時転記 |
| 検証ゲート | `validate-phase-output` PASS、`validate-phase11-screenshot-coverage` PASS、分割実行した対象テスト PASS                                                                                                                  |
| 同期先3点  | `references/task-workflow.md` / `references/lessons-learned.md` / `references/api-ipc-system.md`                                                                                                                        |

#### 関連リンク

| 種別         | 参照                                                                                                                        |
| ------------ | --------------------------------------------------------------------------------------------------------------------------- |
| workflow仕様 | `docs/30-workflows/completed-tasks/01-TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001/`                                          |
| 実装サマリー | `docs/30-workflows/completed-tasks/01-TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001/outputs/phase-5/implementation-summary.md` |
| 品質レポート | `docs/30-workflows/completed-tasks/01-TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001/outputs/phase-9/quality-report.md`         |
| 最終レビュー | `docs/30-workflows/completed-tasks/01-TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001/outputs/phase-10/final-review-result.md`   |
| 画面検証結果 | `docs/30-workflows/completed-tasks/01-TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001/outputs/phase-11/manual-test-result.md`    |

#### 関連タスクステータス

| タスクID                                          | 関係                                                 | ステータス                              |
| ------------------------------------------------- | ---------------------------------------------------- | --------------------------------------- |
| UT-FIX-IPC-HANDLER-DOUBLE-REG-001                 | 先行パターン（同種のIPC再登録問題）                  | 完了                                    |
| TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001        | 今回対応                                             | 完了                                    |
| UT-IMP-DESKTOP-TESTRUN-SIGTERM-FALLBACK-GUARD-001 | 派生未タスク（`SIGTERM` フォールバック運用の標準化） | 完了（2026-03-05, completed-tasks移管） |

### タスク: TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001 SkillExecutor AuthKeyService DI経路統一（2026-03-05）

| 項目       | 内容                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------ |
| タスクID   | TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001                                                     |
| 完了日     | 2026-03-05                                                                                 |
| ステータス | **完了（Phase 1-12 出力 + 実装 + テスト + 仕様同期）**                                     |
| 目的       | `AuthKeyService` の生成・注入経路を単一路化し、preflight判定と実行時判定の不一致を解消する |

#### 仕様書別SubAgent分担（関心ごと分離）

| SubAgent   | 担当仕様書                                    | 主担当作業                                                     | 完了条件                          |
| ---------- | --------------------------------------------- | -------------------------------------------------------------- | --------------------------------- |
| SubAgent-A | `references/interfaces-agent-sdk-executor.md` | DI契約（`registerSkillHandlers` / `SkillExecutor` 生成）の同期 | シグネチャが実装と一致する        |
| SubAgent-B | `references/api-ipc-system.md`                | auth-key ライフサイクル実装状況と完了タスク同期                | 生成責務/注入責務が明文化される   |
| SubAgent-C | `references/task-workflow.md`                 | 完了台帳・検証証跡・未タスク判定の同期                         | Phase 12 証跡が追跡可能になる     |
| SubAgent-D | `references/lessons-learned.md`               | 苦戦箇所と再利用手順の固定                                     | 同種課題で5分以内に再現可能になる |

#### 実装反映（要点）

- `apps/desktop/src/main/ipc/index.ts`:
  - `registerAllIpcHandlers` で `AuthKeyService` を1回だけ生成
  - `registerSkillHandlers(mainWindow, skillService, authKeyService)` へ同一インスタンスを注入
- `apps/desktop/src/main/ipc/skillHandlers.ts`:
  - `new SkillExecutor(mainWindow, undefined, authKeyService)` へ統一
- `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts`:
  - DI経路の回帰検証を追加して起動/再登録サイクルでの破綻を防止

#### 検証証跡（2026-03-05）

| コマンド                                                                                                                                                                                                                  | 結果                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001`                                                       | PASS（13/13, error=0, warning=0） |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001`                                                             | PASS（28項目）                    |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase11-authkey-screenshot-selector-drift-guard-001.md` | PASS（`currentViolations=0`）     |
| `rg -n '^\\                                                                                                                                                                                                               | ステータス \\                     | completed' docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001/phase-12-documentation.md` | PASS（`phase-12-documentation.md` が `completed` で同期済み） |

#### 実装時の苦戦箇所と解決策

| 苦戦箇所                                                           | 再発条件                                                         | 対処                                                                                                                          | 標準ルール                                                                   |
| ------------------------------------------------------------------ | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| DIシグネチャが仕様書と実装でずれる                                 | 仕様書側のコード例を後追い更新し、Main配線変更と同時同期しない   | `registerSkillHandlers(..., authKeyService)` と `new SkillExecutor(mainWindow, undefined, authKeyService)` を同一ターンで同期 | DI変更時は「Main配線 + 実装コード例 + 型仕様」の3点を同時更新する            |
| 成果物は揃うが `phase-12-documentation.md` が `pending` のまま残る | `outputs/phase-12` 実体確認のみで完了判定する                    | Task 12-1〜12-5 実体確認後に `verify-all-specs` / `validate-phase-output` を再実行し、仕様書本体を `completed` へ同期         | Phase 12完了は「成果物実体 + 機械検証PASS + 仕様書ステータス同期」で確定する |
| 教訓反映が change log のみで終わる                                 | `task-workflow` へ完了記録だけ残し、`lessons` 反映を後回しにする | `lessons-learned.md` に本タスク専用節を追加し、再発条件付きで固定                                                             | 仕様同期タスクも「実装内容 + 苦戦箇所 + 手順」を台帳と教訓へ同時転記する     |

#### 同種課題の簡潔解決手順（4ステップ）

1. Main composition root で依存生成責務を固定し、注入先関数シグネチャを先に確定する。
2. 実装（`ipc/index.ts` / `skillHandlers.ts`）と仕様（interfaces/api/task/lessons）を同一ターンで更新する。
3. `verify-all-specs` と `validate-phase-output` を再実行し、Task 12-1〜12-5 実体を突合する。
4. `phase-12-documentation.md` のステータス/チェックリストを `completed` へ同期して完了判定する。

#### 関連タスク（2026-03-06 完了移管）

| タスクID                                                       | 概要                                                                                                                                    | 参照                                                                                                                |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| ~~UT-IMP-PHASE11-AUTHKEY-SCREENSHOT-SELECTOR-DRIFT-GUARD-001~~ | ~~auth-key Phase 11 スクリーンショット取得スクリプトのセレクタドリフト防止~~ **完了: 2026-03-06（Phase 12完了移管）**                   | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase11-authkey-screenshot-selector-drift-guard-001.md` |
| ~~UT-IMP-SKILLHANDLERS-AUTHKEY-DI-BOUNDARY-GUARD-001~~         | ~~`skillHandlers.ts` の DI境界整理と責務分離ガード（composition root 集約 + 回帰テスト固定）~~ **完了: 2026-03-06（Phase 12完了移管）** | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-skillhandlers-authkey-di-boundary-guard-001.md`         |

### タスク: TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001 OAuth後 sandbox iterable エラーの原因分離（2026-03-05）

| 項目       | 内容                                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001                                                                |
| 完了日     | 2026-03-05                                                                                                          |
| ステータス | **完了（Phase 1-12 出力 + 実装 + テスト）**                                                                         |
| 目的       | `AUTH_STATE_CHANGED` と `linkedProviders` の契約崩れ起因で発生する `is not iterable` 系障害を分離し、再発を防止する |

#### 仕様書別SubAgent分担（関心ごと分離）

| SubAgent   | 担当仕様書                     | 主担当作業                                                                | 完了条件                                       |
| ---------- | ------------------------------ | ------------------------------------------------------------------------- | ---------------------------------------------- |
| SubAgent-A | `references/api-ipc-system.md` | `PROFILE_UNLINK_PROVIDER` 通知時の `AUTH_STATE_CHANGED.user` 正規化を同期 | Main→Renderer 契約形状が揺れない               |
| SubAgent-B | `references/task-workflow.md`  | 完了台帳・検証証跡・関連リンク同期                                        | Phase 1-12 証跡が追跡可能                      |
| SubAgent-C | `outputs/phase-11/*`           | スクリーンショット3件（TC-11-UI-01〜03）で画面回帰を固定                  | `validate-phase11-screenshot-coverage` が PASS |
| SubAgent-D | `outputs/phase-12/*`           | Step 1-A/1-B/1-C/Step 2 の判定記録                                        | 仕様更新プロセスが監査可能                     |

#### 実装反映（要点）

- `apps/desktop/src/main/ipc/profileHandlers.ts`
  - unlink成功通知で `toAuthUser` を適用し `AUTH_STATE_CHANGED.user` を正規化。
- `apps/desktop/src/renderer/store/slices/authSlice.ts`
  - `isLinkedProvider` / `normalizeLinkedProviders` を追加し、非配列/不正要素を防御。
- 追加検証
  - `authSlice.test.ts` に2ケース追加（非配列正規化、壊れstate回復）
  - `profileHandlers.test.ts` にunlink通知整合ケース追加

#### 検証証跡

| コマンド                                                                                                                                                                                                | 結果                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `pnpm --filter @repo/desktop test:run src/renderer/store/slices/authSlice.test.ts src/main/ipc/profileHandlers.test.ts src/renderer/components/organisms/AccountSection/AccountSection.portal.test.tsx` | PASS（3 files / 169 tests）              |
| `pnpm --filter @repo/desktop typecheck`                                                                                                                                                                 | PASS                                     |
| `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/04-TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001`                   | PASS（expected=3 / covered=3）           |
| 対象カバレッジ計測（`authSlice.ts`, `profileHandlers.ts`, `AccountSection/index.tsx`）                                                                                                                  | PASS（`authSlice.ts` 81.38/84.88/86.95） |

#### 画面検証（再監査追補）

| テストケース | 証跡                                                                                                                                          | 視覚判定 |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| TC-11-UI-01  | `docs/30-workflows/04-TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001/outputs/phase-11/screenshots/TC-11-UI-01-root-navigation.png`      | PASS     |
| TC-11-UI-02  | `docs/30-workflows/04-TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001/outputs/phase-11/screenshots/TC-11-UI-02-skill-center-view.png`    | PASS     |
| TC-11-UI-03  | `docs/30-workflows/04-TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001/outputs/phase-11/screenshots/TC-11-UI-03-ui-design-foundation.png` | PASS     |

#### 実装時の苦戦箇所と再発防止

| 項目       | 内容                                                                                               |
| ---------- | -------------------------------------------------------------------------------------------------- |
| 苦戦箇所1  | `AUTH_STATE_CHANGED.user` は AuthUser 形状前提だが、unlink 通知経路で profile shape が混在しやすい |
| 原因       | Main 通知 payload と Renderer state の契約境界を同時に検証していなかった                           |
| 対処       | Main 側で `toAuthUser(updatedUser)` を必須化し、Renderer 側で `normalizeLinkedProviders` を導入    |
| 標準ルール | 契約修正は「送信側正規化 + 受信側防御 + 契約テスト」の3点を同一ターンで実施する                    |

| 項目       | 内容                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------- |
| 苦戦箇所2  | Phase 11 初回証跡が `NON_VISUAL` 記録のみで、ユーザー要求（画面検証）との乖離が発生した   |
| 原因       | タスク性質（非視覚修正）を優先し、追加要求に応じた SCREENSHOT 昇格を初回で適用しなかった  |
| 対処       | TC-11-UI-01〜03 の実画面証跡を再生成し、`validate-phase11-screenshot-coverage` 3/3 を固定 |
| 標準ルール | ユーザーが画面検証を要求した時点で `NON_VISUAL` タスクでも `SCREENSHOT` モードへ昇格する  |

#### 同種課題の簡潔解決手順（4ステップ）

1. Main 通知 payload を正規化し、Renderer 受信値を正規化する二重防御を同時実装する。
2. 契約テスト（Main/Renderer/UI Portal）を対象ファイルに限定して先に固定する。
3. Phase 11 で `TC-ID ↔ png` を強制し、ユーザー要求時は `NON_VISUAL` から `SCREENSHOT` へ即時切り替える。
4. Phase 12 で `task-workflow` / `api-ipc-system` / `lessons-learned` を同一ターンで同期する。

#### 同種課題の5分解決カード（契約境界 + 証跡昇格）

| 項目       | 内容                                                                                                                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | OAuth後に `is not iterable` が発生、または Phase 11 で証跡不足が再発                                                                                                                                            |
| 根本原因   | Main通知 shape と Renderer受信 shape の境界不一致 + `NON_VISUAL` 固定運用                                                                                                                                       |
| 最短5手順  | 1) Main送信 payload を正規化 2) Renderer受信値を `type guard + normalize` で防御 3) Main/Renderer/UI の対象テストを明示実行 4) ユーザー要求時は `SCREENSHOT` 昇格で TC証跡を再取得 5) 検証値を3仕様書へ同時転記 |
| 検証ゲート | `verify-all-specs` PASS（13/13）、`validate-phase-output` PASS（28項目）、`validate-phase11-screenshot-coverage` PASS（3/3）、対象テスト PASS（3 files / 169 tests）                                            |
| 同期先3点  | `references/task-workflow.md` / `references/api-ipc-system.md` / `references/lessons-learned.md`                                                                                                                |

#### 関連タスクステータス

| タスクID                                             | 関係                     | ステータス |
| ---------------------------------------------------- | ------------------------ | ---------- |
| TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001 | 今回対応                 | 完了       |
| TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001           | 先行のAuth IPC再登録整合 | 完了       |
| TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001              | 先行のauth契約整合       | 完了       |

#### 関連未タスク

| 未タスクID                                                          | 概要                                                                                                                  | 参照                                                                                                         | ステータス |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------- |
| UT-IMP-PHASE12-TASK-INVESTIGATE-FIVE-MINUTE-CARD-SYNC-VALIDATOR-001 | 5分解決カードの3仕様書同期（存在/手順順序/検証ゲート）を機械検証するバリデータを追加し、Phase 12 再発防止を自動化する | `docs/30-workflows/completed-tasks/task-imp-phase12-task-investigate-five-minute-card-sync-validator-001.md` | 未実施     |

### タスク: TASK-UI-01-A-STORE-SLICE-BASELINE Store Slice棚卸しと状態境界の基準化（2026-03-05）

| 項目       | 内容                                                                           |
| ---------- | ------------------------------------------------------------------------------ |
| タスクID   | TASK-UI-01-A-STORE-SLICE-BASELINE                                              |
| 完了日     | 2026-03-05                                                                     |
| ステータス | **完了（Phase 1-12 出力 + 実装 + テスト + 画面検証）**                         |
| 対象       | Renderer Store baseline（slice inventory / boundary matrix / selector policy） |

#### 仕様書別SubAgent分担（関心ごと分離）

| SubAgent   | 担当仕様書                            | 主担当作業                           | 完了条件                                              |
| ---------- | ------------------------------------- | ------------------------------------ | ----------------------------------------------------- |
| SubAgent-A | `references/arch-state-management.md` | baseline型・定数・境界判定基準の同期 | 16行 inventory と境界判定5件が仕様化される            |
| SubAgent-B | `references/task-workflow.md`         | 完了台帳・検証証跡・再利用手順の固定 | Phase 1-12 実行証跡が追跡可能になる                   |
| SubAgent-C | `references/lessons-learned.md`       | 苦戦箇所と再発防止手順の同期         | 同種課題向けの短手順が再利用可能になる                |
| SubAgent-D | `outputs/phase-11/*`                  | TC単位の証跡整合と視覚監査           | `validate-phase11-screenshot-coverage` が PASS になる |

#### 実装反映（要点）

- `apps/desktop/src/renderer/store/types.ts` に baseline型（`StoreSliceInventoryItem` など）を追加。
- `apps/desktop/src/renderer/store/sliceBaseline.ts` を新規作成し、以下を定数化:
  - `STORE_PERSISTED_KEYS_BASELINE`
  - `STORE_SLICE_INVENTORY_BASELINE`（16行）
  - `STORE_BOUNDARY_MATRIX_BASELINE`
  - `STORE_SELECTOR_POLICY_BASELINE`
- `apps/desktop/src/renderer/store/index.ts` で baseline定数を再export。
- `apps/desktop/src/renderer/store/__tests__/sliceBaseline.test.ts` を追加し、unit/integration/regression を固定。

#### 画面検証（Phase 11）

| テストケース | 証跡                                                          | 視覚判定 |
| ------------ | ------------------------------------------------------------- | -------- |
| TC-11-01     | `.../outputs/phase-11/screenshots/phase11-dashboard.png`      | PASS     |
| TC-11-02     | `.../outputs/phase-11/screenshots/phase11-skill-center.png`   | PASS     |
| TC-11-03     | `.../outputs/phase-11/screenshots/phase11-history-search.png` | PASS     |

#### 検証証跡

| コマンド                                                                                         | 結果                               |
| ------------------------------------------------------------------------------------------------ | ---------------------------------- |
| `node .../verify-all-specs.js --workflow <task-056a-dir>`                                        | PASS（13/13, error=0, warning=0）  |
| `node .../validate-phase-output.js <task-056a-dir>`                                              | PASS（28項目, error=0, warning=0） |
| `node .../validate-phase11-screenshot-coverage.js --workflow <task-056a-dir>`                    | PASS（expected=3 / covered=3）     |
| `pnpm --filter @repo/desktop exec vitest run src/renderer/store/__tests__/sliceBaseline.test.ts` | PASS（9/9）                        |
| `pnpm --filter @repo/desktop typecheck`                                                          | PASS                               |

#### 未タスク判定

- 実装差分としての未タスク化が必要な項目は **0件**（`task-056a-b` / `task-056c` / `task-056d` は仕様上の後続依存として明示済み）。
- 再監査で確認した `baselineViolations=90`（既存負債）の段階削減と監査運用安定化を目的に、運用改善未タスクを **2件** 追加した。

#### 関連タスク（完了済み移管）

| タスクID                                          | 概要                                                                                                      | 参照                                                                                       |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| UT-IMP-PHASE12-UNASSIGNED-BASELINE-REDUCTION-001  | baseline 負債削減の段階実行（format/naming/misplaced 是正計画、完了済み移管）                             | `docs/30-workflows/completed-tasks/task-imp-phase12-unassigned-baseline-reduction-001.md`  |
| UT-IMP-PHASE12-WORKFLOW-PATH-CANONICALIZATION-001 | Phase 12 workflowパス正規化ガード（workflow実体確認 + 監査境界固定 + current/baseline分離、完了済み移管） | `docs/30-workflows/completed-tasks/task-imp-phase12-workflow-path-canonicalization-001.md` |

#### 同種課題の簡潔解決手順（4ステップ）

1. baseline情報を `types.ts` と専用定数ファイルへ分離し、後続タスクの参照点を固定する。
2. テストを unit/integration/regression に分け、台帳行数・境界判定・再export を先に固定する。
3. Phase 11 は `TC-xx` 形式で証跡を紐付け、`validate-phase11-screenshot-coverage` を必ず通す。
4. Phase 12 で `arch-state-management` / `task-workflow` / `lessons-learned` を同一ターンで同期する。

### タスク: TASK-FIX-SKILL-IMPORT 3連続是正（2026-03-04）

| 項目       | 内容                                                                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 対象タスク | `01-TASK-FIX-SKILL-IMPORTED-STATE-RECONCILIATION-001` / `02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001` / `03-TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001` |
| 完了日     | 2026-03-04                                                                                                                                                         |
| ステータス | **完了（Phase 1-12 出力 + 仕様同期 + 画面検証）**                                                                                                                  |
| 目的       | `skill:getImported` の互換復元、`skill:import` の冪等契約、SkillCenter 欠損メタデータ防御を一体で是正                                                              |

#### 仕様書別SubAgent分担（関心ごと分離）

| SubAgent   | 担当仕様書                                                      | 主担当作業                                          | 完了条件                                               |
| ---------- | --------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------ |
| SubAgent-A | `references/api-ipc-agent.md`                                   | `skill:import` 成功判定と冪等返却契約の同期         | `errors.length===0` 基準と既存ケース返却が明文化される |
| SubAgent-B | `references/interfaces-agent-sdk-skill.md`                      | `getImported` 互換キー/SkillCenter防御契約の同期    | id/name 互換と nullish 防御が契約化される              |
| SubAgent-C | `references/arch-state-management.md`                           | `agentSlice.importSkill` 事前ガードの状態管理契約化 | 既存インポート時 IPC スキップが仕様化される            |
| SubAgent-D | `references/ui-ux-feature-components.md`                        | 欠損メタデータ防御と画面証跡（TC-01〜04）同期       | UIクラッシュ防止契約と証跡リンクが揃う                 |
| SubAgent-E | `references/task-workflow.md` / `references/lessons-learned.md` | 完了台帳・苦戦箇所・再利用手順の固定化              | 実装内容 + 苦戦箇所 + 検証証跡を同一ターン反映         |

#### 実装反映（要点）

- `SkillService.getImportedSkills()` を id/name 両対応へ更新し、旧保存データ互換を回復。
- `skill:import` は `importedCount` 依存を廃止し、`errors.length===0` を成功判定に統一。
- `agentSlice.importSkill` へ冪等早期終了を追加し、重複インポートで IPC を呼ばない構成へ変更。
- SkillCenter（`useSkillCenter` / `useFeaturedSkills` / `SkillCard` / `SkillDetailPanel`）で nullish 防御を追加し、欠損メタデータでも描画を維持。

#### 今回実装で抽出した必須仕様（aiworkflow-requirements）

| 仕様書                                                          | 抽出した必須要件                                                              | 反映先                                                                     | 検証                                          |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------- |
| `references/api-ipc-agent.md`                                   | `skill:import` の成功判定はエラー有無を正本化し、冪等ケースでも成功応答を返す | `apps/desktop/src/main/ipc/skillHandlers.ts`                               | `skillHandlers.test.ts` + `verify-all-specs`  |
| `references/interfaces-agent-sdk-skill.md`                      | `getImported` は id/name 互換を維持し、UI入力は nullish 許容                  | `apps/desktop/src/main/services/skill/SkillService.ts` / SkillCenter hooks | `SkillService.test.ts` + UI hook tests        |
| `references/arch-state-management.md`                           | 既存インポート時は状態層で早期終了し IPC を再呼び出ししない                   | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                     | `agentSlice.skill-integration.test.ts`        |
| `references/ui-ux-feature-components.md`                        | 欠損メタデータでもクラッシュしない描画防御（TC-01〜04）                       | `SkillCard.tsx` / `SkillDetailPanel.tsx` / hooks                           | `validate-phase11-screenshot-coverage`（4/4） |
| `references/task-workflow.md` / `references/lessons-learned.md` | 実装内容 + 苦戦箇所 + 検証証跡を同一ターン同期                                | 本仕様更新                                                                 | `verify-unassigned-links` + `audit(current)`  |

#### 検証証跡（2026-03-04）

| コマンド                                                                                                                                  | 結果                                                      |
| ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `verify-all-specs --workflow docs/30-workflows/completed-tasks/01-TASK-FIX-SKILL-IMPORTED-STATE-RECONCILIATION-001 --json`                | PASS（13/13, error=0, warning=0）                         |
| `verify-all-specs --workflow docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001 --json`                     | PASS（13/13, error=0, warning=0）                         |
| `verify-all-specs --workflow docs/30-workflows/completed-tasks/03-TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001 --json`              | PASS（13/13, error=0, warning=0）                         |
| `validate-phase-output <workflow-dir>`（3workflow）                                                                                       | PASS（28項目 x 3）                                        |
| `validate-phase11-screenshot-coverage --workflow docs/30-workflows/completed-tasks/03-TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001` | PASS（expected=4 / covered=4）                            |
| `audit-unassigned-tasks --json --diff-from HEAD`                                                                                          | PASS（currentViolations=0, baselineは既存負債として分離） |

#### Phase 12再確認（ブランチ再監査, 2026-03-04）

| 観点                     | 実行内容                                                                                                                                                                                                                     | 結果                                                       |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Phase 12 実行整合        | `verify-all-specs --workflow`（`01/02/03` の3workflow）                                                                                                                                                                      | PASS（13/13 x 3, error=0, warning=0）                      |
| Phase 12 出力整合        | `validate-phase-output <workflow-dir>`（`01/02/03`）                                                                                                                                                                         | PASS（28項目 x 3）                                         |
| 画面証跡（UI workflow）  | `validate-phase11-screenshot-coverage --workflow docs/30-workflows/completed-tasks/03-TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001`                                                                                    | PASS（expected=4 / covered=4）                             |
| 未タスク参照整合         | `verify-unassigned-links`                                                                                                                                                                                                    | PASS（existing=88, missing=0）                             |
| 未タスク差分判定         | `audit-unassigned-tasks --json --diff-from HEAD`                                                                                                                                                                             | PASS（currentViolations=0, baselineViolations=94）         |
| 未タスク個別フォーマット | `audit-unassigned-tasks --json --target-file ...`（`task-imp-phase12-subagent-artifact-guard-001.md` / `task-imp-phase12-system-spec-extraction-guard-001.md` / `task-imp-phase12-three-workflow-audit-scope-guard-001.md`） | 3件とも `scope.currentFiles` で一致、`currentViolations=0` |

- `docs/30-workflows/completed-tasks/unassigned-task/` 配下の今回対象未タスク3件は、配置先・参照・フォーマットの3点で再確認済み。
- 全体 `baselineViolations=94` は既存負債として分離し、今回差分の合否は `currentViolations=0` で固定した。

#### 追加追補: UI再撮影 preflight 不足（2026-03-04）

| 項目       | 内容                                                                                                                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `capture-skill-center-phase11.mjs` 再実行時に preview 起動失敗（`ERR_CONNECTION_REFUSED` / `Rollup failed to resolve import "@repo/shared/types/skill"`）を事前検知できず、再撮影フローが停止した |
| 再発条件   | スクリーンショット再取得前に `preview` build 成否と `127.0.0.1:4173` 疎通を確認しない場合                                                                                                         |
| 対処       | 証跡を 2026-03-04 16:50 JST に再取得して Apple UI/UX 観点で再確認し、運用ギャップは `UT-IMP-SKILL-CENTER-PREVIEW-BUILD-GUARD-001` で管理後に完了移管                                              |
| 標準ルール | UI再撮影は「preview preflight（build + 疎通）→撮影→coverage検証→記録」の順で固定する                                                                                                              |

| 追加未タスク                                          | 概要                                                                                                                                  | 参照                                                                                                 |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| ~~UT-IMP-SKILL-CENTER-PREVIEW-BUILD-GUARD-001~~       | ~~SkillCenter Phase 11再撮影の preflight ガード（失敗時の未タスク化/代替証跡記録を標準化）~~ **完了: 2026-03-04（Phase 12完了移管）** | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-skill-center-preview-build-guard-001.md` |
| UT-IMP-SKILL-CENTER-HOTFIX-COVERAGE-INCLUDE-GUARD-001 | SkillCenter hotfix 対象カバレッジの include path ガード（実在パス検証 + `3 files / 30 tests` 固定）                                   | `docs/30-workflows/unassigned-task/task-imp-skill-center-hotfix-coverage-include-guard-001.md`       |

#### 再追補: Phase 12テンプレート最適化の実装反映（2026-03-04）

| 項目             | 内容                                                                                                                                                                                                                                                                                                                                                     |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 今回実装した内容 | `skill-creator` の Phase 12テンプレート2種（`phase12-system-spec-retrospective` / `phase12-spec-sync-subagent`）へ preview preflight（build + `127.0.0.1:4173` 疎通）と失敗時未タスク化分岐を追加し、さらに未タスク配置先判定（未完了=`docs/30-workflows/unassigned-task/` / 完了移管=`docs/30-workflows/completed-tasks/unassigned-task/`）を標準化した |
| 反映対象         | `.claude/skills/skill-creator/assets/phase12-system-spec-retrospective-template.md` / `.claude/skills/skill-creator/assets/phase12-spec-sync-subagent-template.md` / `.claude/skills/skill-creator/references/resource-map.md` / `.claude/skills/skill-creator/references/patterns.md`                                                                   |
| 今回苦戦した箇所 | 成功/失敗パターンには preflight 教訓がある一方で、テンプレート本体の完了チェックに同条件が欠け、さらに未タスク参照先が未完了/完了移管で分岐する点が明示されておらず、仕様更新時に転記漏れが起きやすかった                                                                                                                                                |
| 解決策           | 「簡潔手順」「検証コマンド」「完了チェック」を同時更新し、preflight 失敗時は撮影継続せず未タスク化する運用を明文化。加えて `rg` による配置先判定コマンドをテンプレートへ組み込み、参照先ドリフトを抑止した                                                                                                                                               |
| 再利用ルール     | UIタスクは preflight 成否を証跡化し、`task-workflow.md` と `lessons-learned.md` へ同一ターン転記する                                                                                                                                                                                                                                                     |

#### 同種課題の簡潔解決手順（5ステップ）

1. IPC/型/状態/UI の4責務を最初に分離し、仕様書ごとにSubAgent担当を固定する。
2. `skill:import` は `errors.length===0` 判定を契約正本にし、`importedCount` を成功条件から外す。
3. Renderer 側で既存インポート判定を行い、冪等時は IPC 呼び出しをスキップする。
4. UIは `String(value ?? "")` と `Array.isArray` 防御を標準化し、欠損メタデータを許容する。
5. UI再撮影がある場合は preview preflight（build + `127.0.0.1:4173` 疎通）を先に通し、未タスク配置先（未完了/完了移管）を判定した上で `verify` / `validate` / `screenshot-coverage` / `audit(current)` を同一ターンで実行して証跡を固定する。

#### 追補: UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001（2026-03-04）

| 項目     | 内容                                                                                                                                                                                                        |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| タスクID | UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001                                                                                                                                                    |
| 対象     | workflow02 の Phase 11/12 UI証跡再取得コマンド運用                                                                                                                                                          |
| 実装     | `apps/desktop/package.json` に `screenshot:skill-import-idempotency-guard` を追加                                                                                                                           |
| 文書同期 | workflow02 の `outputs/phase-11/manual-test-result.md` と `outputs/phase-12/spec-update-summary.md` の実行コマンド表記を `pnpm --filter @repo/desktop run screenshot:skill-import-idempotency-guard` に統一 |
| 検証     | `run                                                                                                                                                                                                        | rg screenshot` で露出確認、screenshot再取得、coverage validator PASS（4/4） |

#### 追補検証証跡（2026-03-04）

| コマンド                                                                                                                                                                                     | 結果                                                          |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------ |
| `lsof -nP -iTCP:5174 -sTCP:LISTEN                                                                                                                                                            |                                                               | true`                                                      | WARN（既存プロセス占有あり。`Port 5174 is already in use` を再現） |
| `pnpm --filter @repo/desktop run                                                                                                                                                             | rg screenshot`                                                | PASS（`screenshot:skill-import-idempotency-guard` を検出） |
| `pnpm --filter @repo/desktop run screenshot:skill-import-idempotency-guard`                                                                                                                  | PASS（`TC-01..04` + `import-call-diagnostics.json` を再取得） |
| `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001` | PASS（expected=4 / covered=4）                                |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001`                     | PASS（13/13, error=0, warning=0）                             |

#### 追補課題（再確認で判明）

| 項目         | 内容                                                                                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 苦戦箇所     | screenshot 再取得は成功しても `Port 5174 is already in use` が混在し、失敗判定との切り分けが人依存になりやすい                                               |
| 対処         | 実行前ポート検査（`lsof`）を証跡へ固定し、競合時の分岐（停止/再利用）を未タスク化                                                                            |
| 関連未タスク | `UT-IMP-PHASE12-SCREENSHOT-PORT-CONFLICT-GUARD-001`                                                                                                          |
| 参照         | `docs/30-workflows/unassigned-task/task-imp-phase12-screenshot-port-conflict-guard-001.md`                                                                   |
| 苦戦箇所     | `validate-phase11-screenshot-coverage` が PASS でも、`phase-11-manual-test.md` に画面カバレッジマトリクスがなく warning が残り、レビュー観点が人依存になった |
| 対処         | 画面カバレッジマトリクスの必須化（視覚TC/非視覚TC区分 + 期待証跡）を未タスク化し、Phase 11 設計意図を固定する方針へ分離                                      |
| 関連未タスク | `UT-IMP-PHASE11-SCREENSHOT-COVERAGE-MATRIX-GUARD-001`                                                                                                        |
| 参照         | `docs/30-workflows/unassigned-task/task-imp-phase11-screenshot-coverage-matrix-guard-001.md`                                                                 |

#### 追補2: UT workflow 証跡正規化（2026-03-04）

| 項目             | 内容                                                                                                                                                                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 今回実装した内容 | `UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001` の `outputs/phase-11/screenshots/` を正規配置し、`manual-test-result.md` の TC-01〜TC-04 をローカル `.png` 参照へ統一。TC-05/06 は `NON_VISUAL:` で明示して coverage validator の判定軸を固定した |
| 苦戦箇所         | 手動テスト結果が workflow02 側の証跡パスのみを参照しており、UT workflow 自体の `outputs/phase-11/screenshots` が空で `validate-phase11-screenshot-coverage` が失敗した                                                                                       |
| 対処             | screenshot を UT workflow 配下へ複製し、証跡表を `screenshots/*.png` 形式へ修正。非視覚TCは `NON_VISUAL:` 記法へ統一して `expected=6 / covered=4`（非視覚2件許容）で PASS を確認                                                                             |
| 標準ルール       | UI証跡は「対象workflow配下の証跡実体」と「TC証跡表記」の両方が揃って初めて完了扱いにする                                                                                                                                                                     |

#### 追補2の検証証跡（2026-03-04）

| コマンド                                                                                                                                                                                               | 結果                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001` | PASS（expected=6 / covered=4、非視覚TC2件許容） |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001 --json`              | PASS（13/13, error=0, warning=0）               |
| `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`                                                                                                                    | PASS（total=93, missing=0）                     |

#### 同種課題の簡潔解決手順（4ステップ・証跡配置版）

1. `validate-phase11-screenshot-coverage` を対象workflowで先に実行し、証跡欠落を検知する。
2. `outputs/phase-11/screenshots/` が空なら、再取得または同一証跡を対象workflow配下へ正規配置する。
3. `manual-test-result.md` の視覚TCは `screenshots/*.png` を記載し、非視覚TCは `NON_VISUAL:` を必須化する。
4. `coverage PASS` 後に `task-workflow.md` と `lessons-learned.md` へ同一ターンで転記する。

---

### タスク: TASK-UI-05A-SKILL-EDITOR-VIEW SkillEditorView（ツールエディター）仕様書作成（2026-03-01）

| 項目       | 内容                                                                                                                          |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-UI-05A-SKILL-EDITOR-VIEW                                                                                                 |
| 完了日     | 2026-03-01                                                                                                                    |
| ステータス | **spec_created（再監査済み）**（Phase 1-13 仕様書作成完了。`views/SkillEditorView` は実装ファイル実在、導線/IPC連携は未完了） |
| タスク種別 | UI仕様書作成 + 実装実体再監査（画面検証証跡・未タスク再整理を含む）                                                           |
| Phase      | 仕様書フェーズ完了（index + phase-1..13 + 抽出マトリクス）/ 実体再監査完了                                                    |

#### 反映内容（要点）

- `docs/30-workflows/skill-editor-view/` に TASK-UI-05A のワークフロー仕様（Phase 1-13）を作成。
- `aiworkflow-requirements` 正本へ `spec_created` として同期（`ui-ux-components` / `ui-ux-feature-components` / `task-workflow`）。
- 画面検証はスクリーンショットで実施し、現行 UI（Dashboard / Editor）と未実装ギャップを記録。
- 再監査で `views/SkillEditorView` 実装ファイル実在と 99 テスト PASS を確認し、未タスク台帳を正規配置（`docs/30-workflows/unassigned-task/`）へ是正。

#### 仕様書別SubAgent分担（今回の同期チーム）

| SubAgent   | 担当仕様書                                              | 主担当作業                               | 完了条件                                                       |
| ---------- | ------------------------------------------------------- | ---------------------------------------- | -------------------------------------------------------------- |
| SubAgent-A | `references/ui-ux-components.md`                        | 主要UI一覧と spec_created 台帳追加       | SkillEditorView が「実装ファイル実在・統合未完了」で明記される |
| SubAgent-B | `references/ui-ux-feature-components.md`                | 機能別仕様へ spec_created セクション追加 | 実装ギャップと証跡導線が追跡可能                               |
| SubAgent-C | `references/task-workflow.md`                           | 完了台帳・残課題・履歴の同期             | spec_created 記録と残課題行が一致                              |
| SubAgent-D | `docs/30-workflows/skill-editor-view/outputs/phase-11/` | スクリーンショット検証と手動検証記録     | 画面証跡 + 発見課題が出力済み                                  |

#### 画面検証証跡（2026-03-01）

| 証跡                | パス                                                                                                |
| ------------------- | --------------------------------------------------------------------------------------------------- |
| 現行 Dashboard 画面 | `docs/30-workflows/skill-editor-view/outputs/phase-11/screenshots/UI05A-01-current-dashboard.png`   |
| 現行 Editor 画面    | `docs/30-workflows/skill-editor-view/outputs/phase-11/screenshots/UI05A-02-current-editor-view.png` |
| 手動検証結果        | `docs/30-workflows/skill-editor-view/outputs/phase-11/manual-test-result.md`                        |
| 発見課題            | `docs/30-workflows/skill-editor-view/outputs/phase-11/discovered-issues.md`                         |

#### 実装ギャップ（次フェーズの論点）

| 観点                         | 現状                             | 根拠                                                                                     |
| ---------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------- |
| `views/SkillEditorView` 本体 | 実装ファイルは存在（統合未完了） | `apps/desktop/src/renderer/views/SkillEditorView/` 配下に component/hook/test 一式が存在 |
| ナビゲーション導線           | 未配線                           | `ViewType` / `AppDock` / `App.tsx` に専用遷移なし                                        |
| 既存 EditorView 影響         | なし                             | 現行 Editor は表示可能（画面証跡あり）                                                   |

#### Phase 12仕様準拠の再確認（2026-03-02）

| 観点                               | 実行内容                                                                                                                                     | 結果                                          |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| TASK-UI-05A ワークフロー構造       | `verify-all-specs --workflow docs/30-workflows/skill-editor-view`                                                                            | PASS（13/13, error=0, warning=0）             |
| TASK-UI-05A Phase出力整合          | `validate-phase-output docs/30-workflows/skill-editor-view`                                                                                  | PASS（28項目）                                |
| TASK-UI-05 ワークフロー構造        | `verify-all-specs --workflow docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW`                                                 | PASS（13/13, error=0, warning=0）             |
| TASK-UI-05 Phase出力整合           | `validate-phase-output docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW`                                                       | PASS（28項目）                                |
| Phase 12必須成果物（Task 1/3/4/5） | `implementation-guide.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` 実体確認（2workflow） | すべて存在                                    |
| 実装ガイド2パート要件              | `implementation-guide.md` の `Part 1` / `Part 2` 見出し確認（2workflow）                                                                     | 準拠                                          |
| 未タスクリンク整合                 | `verify-unassigned-links`                                                                                                                    | PASS（92/92, missing=0）                      |
| 未タスク差分監査                   | `audit-unassigned-tasks --json --diff-from HEAD`                                                                                             | `currentViolations=0`（`baseline=75` は既存） |

#### 今回の苦戦箇所と解決策（再利用用）

| 苦戦箇所                                                                               | 再発条件                                         | 解決策                                                                                                                    | 今後の標準ルール                                                           |
| -------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `phase-12-documentation.md` の完了状態と成果物実体の同期確認がタスク単位で分散しやすい | spec_created系と完了系workflowを同時監査する場合 | 監査対象workflowを先に2本へ固定し、同一ターンで `verify-all-specs` / `validate-phase-output` を対で実行して証跡を一括確定 | Phase 12再確認は「workflow単位ペア検証（構造+出力）」を最初に実行する      |
| 未タスク監査で baseline違反を今回起因と誤認しやすい                                    | repo全体に既存違反が多い状態で差分監査する場合   | 合否を `currentViolations` のみに固定し、baselineは監視値として記録                                                       | 未タスク監査の判定は「`current=0` 合格、baselineは改善 backlog」に統一する |

#### 同種課題の簡潔解決手順（4ステップ）

1. 監査対象workflowを明示（spec_created系/完了系）し、`verify-all-specs` を先に2本実行する。
2. `validate-phase-output` を同じ2workflowに実行し、Phase 12の必須成果物実体（Task 1/3/4/5）を手動突合する。
3. 未タスクは `verify-unassigned-links` と `audit --diff-from HEAD` を連続実行し、`currentViolations=0` を合格基準にする。
4. 実装内容と苦戦箇所を `task-workflow.md` / `lessons-learned.md` に同一ターン転記して終了する。

---

### タスク: TASK-UI-02-GLOBAL-NAV-CORE グローバルナビゲーション基盤（2026-03-06）

| 項目       | 内容                                                                                  |
| ---------- | ------------------------------------------------------------------------------------- |
| タスクID   | TASK-UI-02-GLOBAL-NAV-CORE                                                            |
| 完了日     | 2026-03-06                                                                            |
| ステータス | **completed（Step 1/2 実装・テスト・画面検証完了、Step 3 は readiness 記録済み）**    |
| タスク種別 | UI基盤実装（GlobalNavStrip / MobileNavBar / AppLayout / Shortcut / State / Rollback） |
| Phase      | Phase 1-12 完了（Phase 13 未実施）                                                    |

#### 反映内容（要点）

- `docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/` に Phase 1〜12 の成果物を出力。
- `GlobalNavStrip` / `MobileNavBar` / `MoreMenu` / `AppLayout` / `ComingSoonView` / `useNavShortcuts` を実装。
- `navigation/navContract.ts` に `mobileLabel` を追加し、mobile 下部バーの表示ラベルとアクセシビリティ名を分離した。
- `uiSlice` に `isNavExpanded` / `isMobileMoreOpen` を追加し、store hook を個別 selector 化。
- `App.tsx` に `VITE_USE_GLOBAL_NAV_STRIP` 分岐を追加し、rollback path を保持した。
- `phase-1..11` 本文仕様書に残っていた `pending` / 未チェック完了条件 / `実行タスク結果=pending` を completed 実態へ同期した。

#### 仕様書別 SubAgent 分担

| SubAgent   | 担当仕様書                                    | 主担当作業                 | 完了条件                                    |
| ---------- | --------------------------------------------- | -------------------------- | ------------------------------------------- |
| SubAgent-A | `phase-1..4` / `phase-10`                     | 要件・設計・Gate 統合      | Step 1/2 の Go/No-Go を明文化               |
| SubAgent-B | `ui-ux-navigation.md` / `ui-ux-components.md` | UI実装と正本同期           | Global Navigation の正式構成が反映される    |
| SubAgent-C | `arch-state-management.md` / Phase 6〜9       | state/coverage/QA          | task scope coverage と P31 境界が確認できる |
| SubAgent-D | Phase 11/12 / `lessons-learned.md`            | screenshot・教訓・文書同期 | 画面証跡と再利用手順が残る                  |

#### 検証証跡

| 観点                 | 実行内容                                                      | 結果                                                                                                                   |
| -------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------- |
| targeted tests       | `pnpm --dir apps/desktop test:run ...7 files...`              | PASS（100 tests）                                                                                                      |
| typecheck            | `pnpm --dir apps/desktop typecheck`                           | PASS                                                                                                                   |
| coverage             | `pnpm --dir apps/desktop test:coverage ...` + task scope 抽出 | PASS（min branch 79.17%）                                                                                              |
| screenshot review    | `outputs/phase-11/screenshots/TC-11-01..04`                   | PASS                                                                                                                   |
| preflight            | build + preview + `curl` + `lsof`                             | PASS                                                                                                                   |
| screenshot coverage  | `validate-phase11-screenshot-coverage`                        | PASS                                                                                                                   |
| workflow spec        | `verify-all-specs` / `validate-phase-output`                  | PASS（13/13, 28項目）                                                                                                  |
| workflow stale guard | `rg -n 'ステータス\\s\*\\                                     | \\s*pending' docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/phase-{1,2,3,4,5,6,7,8,9,10,11,12}-*.md` | PASS（0件） |
| unassigned audit     | `verify-unassigned-links` / `audit --diff-from HEAD`          | PASS（103/103, current=0, baseline=93）                                                                                |

#### 苦戦箇所と解決策

| 苦戦箇所                                                                                                              | 解決策                                                                                         |
| --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| rollback path を残すと責務が `App.tsx` に戻りやすい                                                                   | `AppLayout` / nav / hook / slice を分離した                                                    |
| repo-wide coverage fail が task scope 品質 fail に見える                                                              | `coverage-final.json` 抽出値を正本化した                                                       |
| mobile overlay の品質が自動テストだけでは見えない                                                                     | Phase 11 screenshot と Apple HIG レビューを追加した                                            |
| mobile tab bar の正式ラベルが小画面で切れやすい                                                                       | `mobileLabel` で表示名を短縮し、`aria-label` は正式名称を維持した                              |
| Phase 12 完了後も `phase-12-documentation.md` / `artifacts.json` / `outputs/artifacts.json` / `index.md` がズレやすい | 4ファイルを同一ターンで同期し、`generate-index.js --workflow ... --regenerate` を標準化した    |
| `artifacts.json` / `index.md` は完了でも workflow 本文 `phase-1..11` が `pending` のまま残りやすい                    | completed 扱いの Phase 本文は `ステータス` / 完了条件 / 実行タスク結果まで同一ターンで同期した |

#### 関連未タスク（2026-03-06 追補）

| 未タスクID                                   | 概要                                                                             | 優先度 | 仕様書                                                                                                                               |
| -------------------------------------------- | -------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| UT-IMP-PHASE12-UI-DOMAIN-SPEC-SYNC-GUARD-001 | UIタスクの Phase 12 で「基本6仕様書 + domain UI spec」まで同期対象を広げるガード | 中     | `docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/unassigned-task/task-imp-phase12-ui-domain-spec-sync-guard-001.md` |
| UT-IMP-PHASE12-WORKFLOW-BODY-STALE-GUARD-001 | `artifacts/index` 完了後も workflow 本文に残る `pending` を検出する同期ガード    | 中     | `docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/unassigned-task/task-imp-phase12-workflow-body-stale-guard-001.md` |

---

### タスク: TASK-UI-05-SKILL-CENTER-VIEW SkillCenterView（ツールを探す）実装（2026-03-01）

| 項目       | 内容                                                                    |
| ---------- | ----------------------------------------------------------------------- |
| タスクID   | TASK-UI-05-SKILL-CENTER-VIEW                                            |
| 完了日     | 2026-03-01                                                              |
| ステータス | **完了**                                                                |
| タスク種別 | UI機能実装（Renderer View / Hooks / Components / Tests / Phase 12同期） |
| Phase      | Phase 1-12 完了（Phase 13 未実施）                                      |

#### 反映内容（要点）

- `SkillCenterView` を新規追加（検索、カテゴリ切替、おすすめ、カードグリッド、詳細パネル）。
- `useSkillCenter` / `useFeaturedSkills` の2 Hookで状態・推薦ロジックを分離。
- コンポーネント実装 7ファイル、Hook 実装 2ファイル、テスト 10ファイル（132テストケース）を整備。
- IPC契約は既存チャネル（`skill:list`, `skill:import`, `skill:remove`）を再利用し、新規チャネル追加なし。

#### 仕様書別SubAgent分担（今回の同期チーム）

| SubAgent   | 担当仕様書                                                                | 主担当作業                                 | 完了条件                                   |
| ---------- | ------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------ |
| SubAgent-A | `references/ui-ux-components.md`                                          | 主要UI一覧・完了タスク・関連導線の同期     | TASK-UI-05 が UI正本へ登録済み             |
| SubAgent-B | `references/ui-ux-feature-components.md`                                  | SkillCenterView 仕様セクション追加         | コンポーネント/状態/IPC/未タスクが追跡可能 |
| SubAgent-C | `references/arch-ui-components.md`, `references/arch-state-management.md` | Viewアーキテクチャと状態管理パターンの同期 | レイヤー・データフロー・Store境界が整合    |
| SubAgent-D | `references/task-workflow.md`                                             | 完了台帳・残課題・変更履歴の同期           | 完了記録と未タスク7件が同一ターンで反映    |

#### Phase 12で検出した未タスク

| 未タスクID   | 概要                                      | 優先度 | 仕様書                                                                                                                                   |
| ------------ | ----------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| UT-UI-05-001 | CategoryId / SkillCategory 型統一         | 低     | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-categoryid-skillcategory-type-unification.md` |
| UT-UI-05-002 | SkillDetailPanel 内部 Molecule 分離       | 中     | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-skill-detail-panel-molecule-split.md`         |
| UT-UI-05-003 | ローディングスケルトン実装                | 低     | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-loading-skeleton-implementation.md`           |
| UT-UI-05-004 | モバイルスワイプ閉じ実装                  | 低     | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-mobile-swipe-close-detail-panel.md`           |
| UT-UI-05-005 | SKILL.md 全文 Markdown レンダリング       | 中     | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-skill-markdown-full-rendering.md`             |
| UT-UI-05-006 | useFeaturedSkills 選定アルゴリズム改善    | 低     | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-featured-skills-algorithm-improvement.md`     |
| UT-UI-05-007 | Phase 12 UI仕様同期プロファイル適用ガード | 中     | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-phase12-ui-spec-sync-guard.md`                |

#### 検証証跡（2026-03-02）

| コマンド                                                                                                                                                      | 結果                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW --json` | PASS（13/13, error=0, warning=0）                       |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW`              | PASS（28項目, error=0, warning=0）                      |
| `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`                                                                           | ALL_LINKS_EXIST                                         |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD`                                                    | currentViolations=0（baselineViolations=71 は既存課題） |

#### 追補（2026-03-04）: 削除ボタン不具合ホットフィックス

| 項目       | 内容                                                                                                                               |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 不具合     | SkillCenter 詳細パネルで「ツールを削除」を押下しても削除されない                                                                   |
| 原因       | `useSkillCenter.handleRequestDelete` は動作していたが、`isDeleteConfirmOpen` を描画する確認ダイアログが `SkillCenterView` に未実装 |
| 修正内容   | `SkillCenterView/index.tsx` に削除確認ダイアログを追加し、`handleConfirmDelete` / `handleCancelDelete` / `Escape` キー導線を接続   |
| 追加テスト | `SkillCenterView.delete-confirm.test.tsx` を追加（表示/確認/キャンセル）                                                           |
| 再検証     | `vitest run`（3 files / 30 tests）PASS、対象範囲カバレッジ `Stmts/Lines 86.89`, `Branch 84.61`, `Functions 88.88`（全指標80%以上） |

#### 苦戦箇所と解決策（再利用用）

| 苦戦箇所                                                                   | 再発条件                                                        | 原因                                                                                 | 解決策                                                                                                                                       | 今後の標準ルール                                                                    |
| -------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `CategoryId` と `SkillCategory` の型境界が分散し、カテゴリ比較が揺れやすい | View/Hook/テストでカテゴリ型を個別定義した場合                  | ID層（表示順や "all" を含む）とドメイン層（実Skillカテゴリ）が同じ意味として扱われた | 未タスク `UT-UI-05-001` として分離し、現行は `categoryOrderMap` と `all` 特例を明文化して回帰テストを固定した                                | UIカテゴリ系は「表示ID層」と「ドメインカテゴリ層」を分離し、変換点を1箇所に集約する |
| `SkillDetailPanel` に責務が集中し、表示改善を同時投入しづらい              | 詳細表示（説明・操作・メタ表示）を1コンポーネントで拡張した場合 | Molecule単位の分離前に機能優先で実装し、拡張余地を後段に回した                       | `UT-UI-05-002` として分離し、Phase 12で責務境界を先に未タスク化して追跡可能にした                                                            | 大型UIは「完了時に未タスク化して責務分離」を必須運用にする                          |
| Phase 12で成果物実体・台帳・チェックリストの同期がズレやすい               | `outputs/phase-12` 生成と仕様書更新を別ターンで進める場合       | 実装記録（workflow）と教訓記録（lessons）の同時更新ルールが曖昧だった                | `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit --diff-from HEAD` を同一ターンで再実行し、証跡値を固定した | Phase 12 は「成果物実体 + 台帳 + 苦戦箇所」の同時更新を完了条件にする               |

#### 同種課題の簡潔解決手順（5ステップ）

1. `verify-all-specs --workflow` と `validate-phase-output` で Phase 12 の前提整合を先に固定する。
2. `task-workflow.md` に実装要点・未タスク・検証証跡を先に記録し、参照IDを固定する。
3. `docs/30-workflows/unassigned-task/` へ未タスク指示書を配置し、`audit-unassigned-tasks --target-file` で各ファイル形式を確認する。
4. `verify-unassigned-links` と `audit --diff-from HEAD` を実行し、`currentViolations=0` を合否基準にする。
5. 同一ターンで `lessons-learned.md` に苦戦箇所を転記し、再発条件と標準ルールをペアで残す。

---

### タスク: TASK-UI-05B-SKILL-ADVANCED-VIEWS ツール高度管理ビュー群実装（2026-03-02）

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| タスクID   | TASK-UI-05B-SKILL-ADVANCED-VIEWS            |
| 完了日     | 2026-03-02                                  |
| ステータス | **完了（実装 + 仕様同期）**                 |
| タスク種別 | UI機能実装 + IPC連携 + 仕様書同期           |
| Phase      | Phase 1-12 完了（Phase 13: PR作成は未実施） |

#### 反映内容（要点）

- `apps/desktop/src/renderer/views/` に 4ビュー（3A/3B/3C/3D）を実装し、`App.tsx` / `AppDock` / `ViewType` へ導線を追加。
- `apps/desktop/src/preload/skill-api.ts` の chain/schedule/debug/analytics API と UI側 Hooks（`useIPCQuery`/`useIPCMutation` 含む）を統合。
- `docs/30-workflows/completed-tasks/TASK-UI-05B-SKILL-ADVANCED-VIEWS/` の成果物・手動テスト・仕様更新を実装実体に合わせて同期。

#### 仕様書別SubAgent分担（今回の同期チーム）

| SubAgent   | 担当仕様書                               | 主担当作業                       | 完了条件                         |
| ---------- | ---------------------------------------- | -------------------------------- | -------------------------------- |
| SubAgent-A | `references/ui-ux-components.md`         | 主要UI一覧・完了タスク同期       | UI索引が実装と一致               |
| SubAgent-B | `references/ui-ux-feature-components.md` | 4ビュー機能仕様・苦戦箇所同期    | 機能仕様が実装と一致             |
| SubAgent-C | `references/arch-ui-components.md`       | UI構造と責務境界の同期           | コンポーネント構造が実装と一致   |
| SubAgent-D | `references/arch-state-management.md`    | 状態管理設計とP31対策の同期      | 状態管理方針が実装と一致         |
| SubAgent-E | `references/task-workflow.md`            | 完了台帳・検証証跡・成果物同期   | 台帳と証跡が一致                 |
| SubAgent-F | `references/lessons-learned.md`          | 再発条件付き教訓・簡潔手順の同期 | 同種課題で再利用できる教訓が明記 |

#### 仕様反映先（6仕様書）

| 仕様書                                   | 反映内容                              |
| ---------------------------------------- | ------------------------------------- |
| `references/ui-ux-components.md`         | TASK-UI-05B 完了記録・導線同期        |
| `references/ui-ux-feature-components.md` | 4ビュー責務・苦戦箇所・再利用手順同期 |
| `references/arch-ui-components.md`       | UI構造・責務境界同期                  |
| `references/arch-state-management.md`    | ビュー単位の状態分離設計同期          |
| `references/task-workflow.md`            | 完了台帳・検証証跡・画面証跡同期      |
| `references/lessons-learned.md`          | 再発条件付きの苦戦箇所同期            |

#### 検証証跡（2026-03-02）

| コマンド                                                                                                                                                   | 結果                                                        |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/TASK-UI-05B-SKILL-ADVANCED-VIEWS` | PASS（13/13, error=0, warning=0）※初回 warning=7 から是正   |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/TASK-UI-05B-SKILL-ADVANCED-VIEWS`       | PASS（28項目, error=0, warning=0）                          |
| `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`                                                                        | PASS（ALL_LINKS_EXIST）                                     |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD`                                                 | PASS（currentViolations=0, baselineViolations=75）          |
| `node apps/desktop/scripts/capture-skill-advanced-views-screenshots.mjs`                                                                                   | PASS（4ビューのスクリーンショット再取得: 2026-03-02 12:03） |

#### 苦戦箇所と解決策（再利用用）

| 苦戦箇所                                 | 再発条件                                                | 原因                                                           | 解決策                                                                     | 今後の標準ルール                                                         |
| ---------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 仕様書移管時の参照切れ                   | 元仕様ファイルを移動/複製し、参照元台帳を更新しない場合 | ワークフロー正本と legacy 参照の二重管理                       | 元パスを互換維持しつつ completed-task 側へ同期配置                         | 参照が広い仕様は「移管 + 互換パス維持」を標準化                          |
| 仕様状態と実装状態の混同                 | 実装後も `spec_created` 記載を残した場合                | 仕様更新時の再監査不足                                         | TASK-UI-05B 関連仕様を横断grepし、`completed` へ一括同期                   | UI/IPC実装タスクは Phase 12 で「導線・API・画面証跡」の3点を必須照合する |
| 画面証跡の未取得                         | UI関連タスクで Phase 11 を文書のみで終える場合          | スクリーンショット必須運用の実行漏れ + 実行コマンド不統一      | `capture-skill-advanced-views-screenshots.mjs` を固定コマンド化して再撮影  | UI仕様タスクは「再撮影 + 更新時刻確認」を完了条件に含める                |
| `verify-all-specs` warning 値のドリフト  | Phase 12 文書更新時に依存Phase成果物参照を省略した場合  | `phase-12-documentation.md` の参照資料が不足し、整合警告が残る | Phase 2/5/6/7/8/9/10 の成果物参照を追加して依存関係を明示                  | Phase 12 再確認では warning の根拠を文書側で解消してから証跡を固定する   |
| 未タスク監査の baseline を今回差分と誤読 | `audit --diff-from HEAD` を単一値で評価する場合         | `current` と `baseline` を分離して記録していない               | 合否は `currentViolations=0` 固定、`baseline` は改善バックログとして別記録 | 未タスク監査は必ず `current/baseline` の二軸で記録する                   |

#### 同種課題の簡潔解決手順（5ステップ）

1. 実装完了タスクは `completed` として台帳へ登録し、`spec_created` の残存記述をゼロにする。
2. `verify-all-specs` と `validate-phase-output` で Phase 構造を先に固定する。
3. `phase-12-documentation.md` の参照資料へ依存Phase成果物を登録し、warning の根拠を解消する。
4. 画面関連タスクはスクリーンショットを再取得し、`outputs/phase-11/screenshots/` の更新時刻で当日証跡を固定する。
5. `verify-unassigned-links` と `audit --diff-from HEAD` を再実行し、`current/baseline` を分離記録してから変更履歴を更新する。

#### Phase 12 追補で登録した未タスク

| 未タスクID    | 概要                                                           | 優先度 | タスク仕様書                                                                                                                                    |
| ------------- | -------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| UT-UI-05B-001 | Phase 12 画面証跡再取得ガード（再撮影 + 更新時刻確認の標準化） | 中     | `docs/30-workflows/completed-tasks/TASK-UI-05B-SKILL-ADVANCED-VIEWS/unassigned-task/task-ui-05b-phase12-screenshot-evidence-recapture-guard.md` |

---

### タスク: TASK-9J スキル分析・統計機能（2026-02-28）

| 項目       | 内容                                                                |
| ---------- | ------------------------------------------------------------------- |
| タスクID   | TASK-9J                                                             |
| 完了日     | 2026-02-28                                                          |
| ステータス | **完了**                                                            |
| タスク種別 | 新規機能実装（Main IPC / Service / Store / Shared Types / Preload） |
| Phase      | Phase 1-12 完了（Phase 13 未実施）                                  |

#### 反映内容（要点）

- SkillAnalytics サービス: 集計・分析ロジック（統計、サマリー、トレンド、エクスポート）
- AnalyticsStore: electron-store ベースの永続化ストア（P19準拠バリデーション）
- skillAnalyticsHandlers: 5 IPCチャネル（P42準拠3段バリデーション、validateIpcSender）
- 8インターフェース型定義（@repo/shared）
- Preload API: 5メソッド（safeInvokeUnwrap パターン）

#### 仕様書別SubAgent分担（今回の同期チーム）

| SubAgent   | 担当仕様書                                 | 主担当作業                                       | 完了条件                                     |
| ---------- | ------------------------------------------ | ------------------------------------------------ | -------------------------------------------- |
| SubAgent-A | `references/interfaces-agent-sdk-skill.md` | 型定義8種と Preload API 5メソッドの契約同期      | 型定義・API名・戻り値型が実装と一致          |
| SubAgent-B | `references/api-ipc-agent.md`              | IPC 5チャネルの request/response/validation 同期 | チャネル一覧と実装状況テーブルが一致         |
| SubAgent-C | `references/security-electron-ipc.md`      | sender/P42/許可値リスト/エラー正規化の同期       | 5ハンドラすべてでセキュリティ要件が明記      |
| SubAgent-D | `references/task-workflow.md`              | 完了台帳・成果物・検証証跡・苦戦箇所の記録       | 実装内容 + 苦戦箇所 + 証跡が同一ターンで更新 |
| SubAgent-E | `references/lessons-learned.md`            | 再発条件付きの教訓化と簡潔解決手順の標準化       | 3課題以上が再利用可能形式で記録済み          |

#### 成果物

- 新規: SkillAnalytics.ts, AnalyticsStore.ts, skillAnalyticsHandlers.ts, skill-analytics.ts
- 修正: ipc/index.ts, channels.ts, skill-api.ts, types/index.ts, packages/shared/index.ts
- テスト: 97テスト全PASS（型定義 8, AnalyticsStore 15, SkillAnalytics 37, IPC handlers 37）
- カバレッジ: Stmts 98.68%, Branch 91.9%, Funcs 85.71%, Lines 98.68%

#### 苦戦箇所と解決策（再利用形式）

| 苦戦箇所                                                                     | 再発条件                                                           | 原因                                                                | 今回の解決策                                                                                      | 今後の標準ルール                                                      |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| @repo/shared からの型エクスポート漏れ                                        | 共有型追加時に `src/types/index.ts` の更新だけで完了扱いにした場合 | tsup の公開面（`packages/shared/index.ts`）を同時更新していなかった | `packages/shared/index.ts` に明示的 re-export を追加                                              | 共有型は `型定義 + types/index + package index` の3点同時更新を必須化 |
| ESLint unused parameter                                                      | エラーサニタイズ関数で受け取る引数を使用しない実装を残した場合     | lintルール（unused vars）との整合を後回しにした                     | `toIpcErrorResponse` の `error` を `_error` へリネーム                                            | ハンドラ共通ユーティリティは実装時点で lint 0 を完了条件に含める      |
| analytics実装の責務重複（`skillHandlers.ts` と `skillAnalyticsHandlers.ts`） | 段階移行で旧ハンドラを残置したまま新ハンドラを追加する場合         | 正本ファイルを固定せず、同一責務が複数箇所に分散した                | analytics責務を `skillAnalyticsHandlers.ts` に一本化し、重複実装を削除                            | IPCチャネル群は1ファイル1責務を原則化し、重複実装を禁止               |
| IPC追加後の登録配線漏れ                                                      | ハンドラ実装だけ確認して `ipc/index.ts` 登録を別作業にした場合     | 起動経路（register配線）を完了判定に含めていなかった                | `registerSkillAnalyticsHandlers` を `ipc/index.ts` へ追加し、DI初期化と同時に接続                 | IPC追加時は `handler/register/preload` の3点セット完了を必須化        |
| Preload API名の仕様ドリフト（`recordAnalytics` vs `analyticsRecord`）        | 実装後に仕様更新を分割し、命名突合を後回しにした場合               | 命名正本（Preload実装）に対する最終同期が不足                       | `skill-api.ts` を正本にして `api-ipc-agent.md` / `interfaces-agent-sdk-skill.md` を同一ターン同期 | 命名同期は「実装正本 → 仕様書」一方向のみで管理する                   |

#### 検証証跡（Phase 12 再確認）

| コマンド                                                                                                                                          | 結果                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/TASK-9J-skill-analytics` | PASS（13/13, error 0, warning 0）                       |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/TASK-9J-skill-analytics`       | PASS（28項目, error 0, warning 0）                      |
| `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`                                                               | ALL_LINKS_EXIST（92/92, missing 0）                     |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD`                                        | currentViolations=0（baselineViolations=71 は既存課題） |

#### 同種課題の簡潔解決手順（4ステップ）

1. `git diff --name-only` と `rg -n "skill:analytics|registerSkillAnalyticsHandlers"` で「実装・登録・公開API」の3層を同時に確認する。
2. IPC契約は `Main handler`・`Preload API`・`ドキュメント` の3点を1セットで更新し、1つでも未同期なら未完了扱いにする。
3. Phase 12 は `verify-all-specs`・`validate-phase-output`・`verify-unassigned-links`・`audit-unassigned-tasks --diff-from HEAD` の4コマンドで完了判定する。
4. 苦戦箇所は `task-workflow.md` と `lessons-learned.md` に同時記録し、再発条件と対処を固定化する。

---

### タスク: TASK-FIX-AUTH-CALLBACK-SERVER-WORKER-EXIT-001 authCallbackServer タイムアウト停止責務分離（2026-02-28完了）

| 項目       | 内容                                                                                                                   |
| ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-FIX-AUTH-CALLBACK-SERVER-WORKER-EXIT-001                                                                          |
| 完了日     | 2026-02-28                                                                                                             |
| ステータス | **完了**                                                                                                               |
| タスク種別 | fix（認証コールバックサーバー安定化）                                                                                  |
| Phase      | Phase 1-13 完了                                                                                                        |
| 変更範囲   | `apps/desktop/src/main/auth/authCallbackServer.ts` / `apps/desktop/src/main/auth/__tests__/authCallbackServer.test.ts` |

#### 実装内容（要点）

- `waitForCallback()` timeout 内の `instance.stop()` 自動実行を削除し、待機責務へ限定。
- `stop()` に `!server || !server.listening` ガードを追加し、冪等停止を保証。
- `server.close((_err) => { ... })` で close 失敗を握りつぶし、終了フローの安定性を確保。
- timeout テスト（SRV-06）で `await server.stop()` を明示実行してクリーンアップ責務を固定。

#### 仕様書別SubAgent分担（今回の同期チーム）

| SubAgent   | 担当仕様書                          | 主担当作業                                                                                      |
| ---------- | ----------------------------------- | ----------------------------------------------------------------------------------------------- |
| SubAgent-A | `security-implementation.md`        | ローカルHTTPサーバー停止契約の実装同期                                                          |
| SubAgent-B | `task-workflow.md`                  | 完了台帳・成果物・検証証跡の固定                                                                |
| SubAgent-C | `lessons-learned.md`                | 再発防止手順（wait/stop責務分離）の教訓化                                                       |
| SubAgent-D | `task-specification-creator` 監査群 | `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit` の実行・記録 |

#### 検証結果（2026-02-28）

| 検証項目         | コマンド                                                                                                                                                                       | 結果                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| 仕様整合         | `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/TASK-FIX-AUTH-CALLBACK-SERVER-WORKER-EXIT-001 --json` | PASS（13/13, error=0）                     |
| Phase構造        | `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/TASK-FIX-AUTH-CALLBACK-SERVER-WORKER-EXIT-001`              | PASS（28項目, error=0, warning=0）         |
| 未タスクリンク   | `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`                                                                                            | PASS（91/91 existing, missing=0）          |
| 未タスク差分監査 | `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD`                                                                     | currentViolations=0, baselineViolations=71 |
| 対象テスト       | `pnpm --filter @repo/desktop exec vitest run src/main/auth/__tests__/authCallbackServer.test.ts`                                                                               | PASS（13/13）                              |

#### 苦戦箇所と解決策（再利用用）

| 苦戦箇所                                   | 再発条件                                                           | 解決策                                                                                           | 今後の標準ルール                                   |
| ------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | -------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------- |
| timeout時に待機APIが停止責務まで持っていた | `waitForCallback()` の timeout 内で `stop()` を呼ぶ設計            | timeoutはエラー返却のみへ変更し、停止は呼び出し側 `stop()` に分離                                | timeout系APIは副作用を持たせず、待機責務へ限定する |
| `stop()` の多重実行で終了経路が揺れる      | 停止済み判定が `!server` のみで `server.listening` を見ない        | `!server                                                                                         |                                                    | !server.listening` で早期returnし、closeエラーは握りつぶして冪等化 | 停止APIは idempotent を第一要件に固定する |
| 監査スクリプトの所在を誤認しやすい         | `aiworkflow-requirements/scripts` に監査スクリプトがある前提で実行 | `rg --files .claude/skills` で実体解決後に `task-specification-creator/scripts` を正本として実行 | 監査は「実体探索→実行」の順序をテンプレート化する  |

#### 同種課題の簡潔解決手順（5ステップ）

1. 変更点を `wait`（待機）と `stop`（停止）の責務に分け、API境界を固定する。
2. 停止APIへ未起動/停止済みガードを追加し、冪等停止を先に確保する。
3. timeout テストに明示 `await stop()` を追加し、クリーンアップ責務を固定する。
4. `security-implementation.md` / `task-workflow.md` / `lessons-learned.md` を同一ターンで同期する。
5. `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit --diff-from HEAD` を連続実行し、検証値を `spec-update-summary.md` に固定する。

#### 成果物

| 成果物                    | パス/内容                                                                                                                              |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 実行ワークフロー          | `docs/30-workflows/completed-tasks/TASK-FIX-AUTH-CALLBACK-SERVER-WORKER-EXIT-001/`                                                     |
| Phase成果物台帳           | `docs/30-workflows/completed-tasks/TASK-FIX-AUTH-CALLBACK-SERVER-WORKER-EXIT-001/artifacts.json`                                       |
| Phase 12 実装ガイド       | `docs/30-workflows/completed-tasks/TASK-FIX-AUTH-CALLBACK-SERVER-WORKER-EXIT-001/outputs/phase-12/implementation-guide.md`             |
| Phase 12 仕様更新サマリー | `docs/30-workflows/completed-tasks/TASK-FIX-AUTH-CALLBACK-SERVER-WORKER-EXIT-001/outputs/phase-12/spec-update-summary.md`              |
| Phase 12 更新履歴         | `docs/30-workflows/completed-tasks/TASK-FIX-AUTH-CALLBACK-SERVER-WORKER-EXIT-001/outputs/phase-12/documentation-changelog.md`          |
| Phase 12 未タスク検出     | `docs/30-workflows/completed-tasks/TASK-FIX-AUTH-CALLBACK-SERVER-WORKER-EXIT-001/outputs/phase-12/unassigned-task-detection-report.md` |

---

### タスク: TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001 Phase 12実行監査（2026-02-28）

| 項目       | 内容                                                                                                           |
| ---------- | -------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001                                                                      |
| 実施日     | 2026-02-28                                                                                                     |
| ステータス | **Phase 12監査完了（実装タスク本体は継続）**                                                                   |
| 対象       | `docs/30-workflows/TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001/phase-12-documentation.md` と `outputs/phase-12/` |

#### 今回の実装内容（監査・反映）

- Phase 12 必須成果物5件（`implementation-guide.md` / `documentation-changelog.md` / `spec-update-summary.md` / `unassigned-task-detection.md` / `skill-feedback-report.md`）の実体を確認した。
- `verify-all-specs`（13/13 PASS）と `validate-phase-output`（28項目 PASS）で、仕様書構造の整合を確認した。
- `verify-unassigned-links`（missing=0）と `audit-unassigned-tasks --diff-from HEAD`（currentViolations=0, baselineViolations=71）で、未タスク運用の差分健全性を確認した。
- `phase12-system-spec-retrospective-template.md` を実運用に合わせて更新し、仕様書単位の SubAgent 分担と実行可否ゲート（成果物実体/`artifacts.json`/チェックリスト同期）を固定化した。

#### 仕様書別SubAgent分担（今回の監査チーム）

| SubAgent   | 担当仕様書/資産                                                      | 主担当作業                                    | 完了条件                             |
| ---------- | -------------------------------------------------------------------- | --------------------------------------------- | ------------------------------------ |
| SubAgent-A | `references/task-workflow.md`                                        | 完了台帳・検証証跡・成果物参照の同期          | 実装内容 + 苦戦箇所 + 手順を同期済み |
| SubAgent-B | `references/lessons-learned.md`                                      | 再発条件付きの苦戦箇所を教訓化                | 3件以上を再利用可能形式で記録        |
| SubAgent-C | `skill-creator/assets/phase12-system-spec-retrospective-template.md` | テンプレート最適化（N/A判定・実行可否ゲート） | 次回転記でそのまま再利用できる       |
| SubAgent-D | 検証証跡（scripts）                                                  | `verify/validate/links/audit` の再実行        | 合否は `currentViolations=0` で固定  |

#### 苦戦箇所と解決策（再利用用）

| 苦戦箇所                                                                    | 再発条件                                                               | 解決策                                                                    | 今後の標準ルール                                                                               |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| 成果物実体が揃っていても `artifacts.json` が pending のまま残る             | ファイル存在確認のみで完了判定した場合                                 | 成果物実体に加えて `artifacts.json` の phase status を同時確認した        | Phase 12完了判定は「成果物実体 + artifacts status + チェックリスト同期」の三点突合を必須化する |
| `audit-unassigned-tasks --json` の baseline違反を今回差分違反と誤認しやすい | full監査結果だけを見て合否を判断した場合                               | `--diff-from HEAD` を併用し `currentViolations` を合否基準に固定した      | 未タスク監査は `current`（合否）と `baseline`（監視）を必ず分離記録する                        |
| `phase-12-documentation.md` のチェックリスト未同期で実行可否が曖昧化する    | 出力ファイル生成と仕様書チェック更新を別ターンで進めた場合             | 監査結果を `task-workflow.md` / `lessons-learned.md` に同一ターン反映した | Phase 12は証跡同期（実体・仕様書・教訓）を同一ターンで完了させる                               |
| 仕様書単位で SubAgent を分離しても「非対象仕様」の扱いがぶれる              | interfaces/api-ipc/security の更新不要タスクで、担当だけ割り当てた場合 | テンプレートに N/A判定ログ（対象/非対象/理由）を追加し、省略理由を残した  | 仕様書別SubAgent運用では非対象仕様も必ず `N/A + 理由` を記録する                               |

#### 同種課題の簡潔解決手順（5ステップ）

1. `verify-all-specs` と `validate-phase-output` で仕様書構造を先に確定する。
2. `outputs/phase-12` の必須5成果物と `artifacts.json` のステータス整合を突合する。
3. `verify-unassigned-links` と `audit --diff-from HEAD` を実行し、`currentViolations` を合否基準に固定する。
4. 仕様書ごとに SubAgent を割り当て、非対象仕様は `N/A + 理由` を明示して残す。
5. 実装内容と苦戦箇所を `task-workflow.md` と `lessons-learned.md` に同一ターンで同期する。

---

### タスク: UT-IMP-QUICK-VALIDATE-EMPTY-FIELD-GUARD-001 quick_validate.js 空フィールドガード追加（2026-02-27完了）

| 項目       | 内容                                                                            |
| ---------- | ------------------------------------------------------------------------------- |
| タスクID   | UT-IMP-QUICK-VALIDATE-EMPTY-FIELD-GUARD-001                                     |
| 完了日     | 2026-02-27                                                                      |
| ステータス | **完了**                                                                        |
| タスク種別 | バグ修正 + テスト拡充                                                           |
| Phase      | Phase 1-12 完了（Phase 13未実施）                                               |
| 変更範囲   | `skill-creator/scripts/quick_validate.js` / `quick_validate.test.js` / fixtures |

#### 反映内容（要点）

- `quick_validate.js` の `name` / `description` 検証を P42 準拠へ更新（`typeof` + `trim()`）し、非文字列入力時のランタイム例外を排除。
- 空フィールド系テスト 21 件を追加し、`85 passed / 2 skipped` を確認。
- 親タスク（UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001）で登録された MINOR #2 を完了化し、未タスク指示書を `completed-tasks/` へ移管。

#### 仕様書別SubAgent分担（今回の同期チーム）

| SubAgent   | 担当仕様書                      | 主担当作業                                     | 完了条件                                                                                  |
| ---------- | ------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------- |
| SubAgent-A | `task-workflow.md`              | 完了台帳、成果物、苦戦箇所の記録               | 実装内容 + 苦戦箇所 + 5ステップ手順が同期済み                                             |
| SubAgent-B | `claude-code-skills-process.md` | `quick_validate.js` の非空文字列検証運用を同期 | `typeof + trim()` ルールが仕様に明記済み                                                  |
| SubAgent-C | `lessons-learned.md`            | 再発条件付き教訓の記録                         | 3課題すべてに再利用手順が付与済み                                                         |
| SubAgent-D | 検証証跡（workflow/scripts）    | 仕様準拠・未タスク整合の機械検証               | `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit` がPASS |

#### 苦戦箇所と解決策

| 苦戦箇所                                                                   | 再発条件                                       | 原因                                                                                           | 解決策                                                                                                              | 今後の標準ルール                                                    |
| -------------------------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ---------------- | --------------------- | -------------------------------------------- | -------------------------------------------------------------- |
| Phase 12 実行済みでも `phase-12-documentation.md` のチェックリストが未反映 | 成果物作成と実行仕様書更新を分離して進める場合 | 成果物実体と手順書チェックを別ターンで更新していた                                             | `outputs/phase-12/*` と `phase-12-documentation.md` を同時突合し、完了条件チェックを同期更新                        | Phase 12 完了判定を「成果物存在 + チェックリスト同期」の2条件に固定 |
| 完了移管後に親タスク成果物へ旧 `unassigned-task` 参照が残存                | 子タスクの完了移管だけを更新対象にした場合     | 子タスク移管後の親タスク証跡（artifacts/minor-issues）再同期が漏れた                           | 旧参照を `rg` で横断検出し、親タスクの `artifacts.json` / `minor-issues.md` / `unassigned-task-detection.md` を更新 | 完了移管時に「子タスク + 親タスク証跡」の両方を同一ターンで更新     |
| 検証スクリプトの所在を `aiworkflow-requirements/scripts` と誤認しやすい    | 検証コマンドを記憶ベースで直接実行する場合     | 監査系スクリプトが `task-specification-creator/scripts` に集約されている前提が共有されていない | `rg --files .claude/skills                                                                                          | rg 'verify-all-specs                                                | audit-unassigned | validate-phase-output | verify-unassigned-links'` で実体解決後に実行 | Phase 12 の検証コマンドを「実体探索→実行」の順にテンプレート化 |

#### 同種課題の簡潔解決手順（5ステップ）

1. `phase-12-documentation.md` の完了条件と `outputs/phase-12/*` の実体を1対1で突合し、未同期チェックを修正する。
2. 完了移管した未タスクIDをキーに、親タスク配下の `artifacts.json` / `minor-issues.md` / `unassigned-task-detection.md` を横断検索する。
3. 検証スクリプトは `task-specification-creator/scripts` を正本として解決し、`verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit --diff-from HEAD` を順に実行する。
4. `task-workflow.md` と `lessons-learned.md` に「実装内容 + 苦戦箇所 + 再利用手順」を同時反映する。
5. 最後に `quick_validate.js` とリンク監査を再実行し、`currentViolations=0` と `ALL_LINKS_EXIST` を確認する。

#### 成果物

| 成果物                 | パス/内容                                                                                                                   |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 実行ワークフロー       | `docs/30-workflows/completed-tasks/ut-imp-quick-validate-empty-field-guard-001/`                                            |
| 完了済み未タスク指示書 | `docs/30-workflows/completed-tasks/task-imp-quick-validate-empty-field-guard-001.md`                                        |
| 実装ガイド             | `docs/30-workflows/completed-tasks/ut-imp-quick-validate-empty-field-guard-001/outputs/phase-12/implementation-guide.md`    |
| 仕様更新サマリー       | `docs/30-workflows/completed-tasks/ut-imp-quick-validate-empty-field-guard-001/outputs/phase-12/spec-update-summary.md`     |
| 更新履歴               | `docs/30-workflows/completed-tasks/ut-imp-quick-validate-empty-field-guard-001/outputs/phase-12/documentation-changelog.md` |

---

### タスク: TASK-9F スキル共有・インポート機能（2026-02-27完了）

| 項目       | 内容                                                   |
| ---------- | ------------------------------------------------------ |
| タスクID   | TASK-9F                                                |
| 完了日     | 2026-02-27                                             |
| ステータス | **完了**                                               |
| タスク種別 | 新規機能実装                                           |
| Phase      | Phase 1-12 完了（Phase 13未実施）                      |
| 変更範囲   | packages/shared (型定義) / Main IPC / Preload / テスト |

#### 実装内容（要点）

- `packages/shared/src/types/skill-share.ts`: 共有型定義10型（ShareTarget, ShareResult 等）新規作成
- `apps/desktop/src/main/services/skill/SkillShareManager.ts`: メインサービス新規作成
- `apps/desktop/src/main/ipc/skillHandlers.share.ts`: IPC ハンドラ3チャネル新規作成
- `apps/desktop/src/preload/channels.ts`: 3チャネル追加（skill:importFromSource, skill:export, skill:validateSource）
- `apps/desktop/src/preload/skill-api.ts`: 3メソッド追加（importFromSource, exportSkill, validateSource）

#### テスト結果

- 92テスト全PASS（51 unit + 8 integration + 33 IPC handler）
- カバレッジ: Line 94-100%, Branch 90-96%, Function 100%

#### セキュリティ準拠

- 全3ハンドラで validateIpcSender を適用
- P42準拠3段バリデーション（型チェック → 空文字列 → trim空文字列）
- 許可値チェック（ALLOWED_SOURCE_TYPES / ALLOWED_DESTINATION_TYPES）
- 文字列長制限（MAX_STRING_LENGTH: 10000）

#### 仕様書別SubAgent分担（今回の同期チーム）

| SubAgent   | 担当仕様書                      | 主担当作業                                         | 依存関係                         |
| ---------- | ------------------------------- | -------------------------------------------------- | -------------------------------- |
| SubAgent-A | `interfaces-agent-sdk-skill.md` | 共有型10種と Preload API 3メソッド契約の同期       | 実装差分（shared/preload）確定後 |
| SubAgent-B | `api-ipc-agent.md`              | 3チャネル（request/response/validation）の契約同期 | SubAgent-A の型同期後            |
| SubAgent-C | `security-electron-ipc.md`      | sender検証 + P42 + 許可値チェックの4層防御同期     | SubAgent-B のチャネル契約同期後  |
| SubAgent-D | `task-workflow.md`              | 完了台帳・未タスク参照・検証証跡の固定化           | SubAgent-A/B/C の反映後          |
| SubAgent-E | `lessons-learned.md`            | 苦戦箇所と簡潔解決手順の再利用化                   | SubAgent-D の証跡値を参照        |

#### 苦戦箇所と解決策

| 苦戦箇所                                                                                                         | 原因                                                                           | 解決策                                                                                                  | 再発防止                                                                    |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 実装済み `skillHandlers.share.ts` が起動配線されていなかった                                                     | ハンドラ実装と `registerAllIpcHandlers` 反映を別タスクで進め、統合確認が遅れた | `apps/desktop/src/main/ipc/index.ts` に `registerSkillShareHandlers` と依存DIを追加し、型注釈まで固定化 | IPC追加時は「実装 + 登録 + double-registrationテスト」同時完了を必須化      |
| 仕様書と監査スクリプトに旧型パスが混在                                                                           | `types/skill/<domain>.ts` 旧構成の記述が一部台帳に残存                         | `types/index.ts` と `types/skill-<domain>.ts` に一括統一し、監査スクリプト期待値を更新                  | Phase 12 で「実装実体→仕様→監査スクリプト」の順に突合する                   |
| 未タスクが `docs/30-workflows/completed-tasks/skill-share/unassigned-task/` に配置され、正本ディレクトリと不一致 | 親ワークフロー配下配置と共通未タスク配置ルールの混同                           | `docs/30-workflows/unassigned-task/` に正規フォーマットで再配置し、参照先を同期                         | 未タスク作成時は `ls docs/30-workflows/unassigned-task/` を完了条件に含める |

#### 同種課題の簡潔解決手順（5ステップ）

1. 追加IPCは `channels/preload/main-register/tests` の4点を同一ターンで更新する。
2. `verify-all-specs` と `validate-phase-output` でワークフローの仕様整合を先に確定する。
3. 未タスクは `unassigned-task-guidelines.md` の命名・9セクションテンプレートに必ず合わせる。
4. `task-workflow.md` と `unassigned-task-report.md` の参照パスを同時更新する。
5. `audit-unassigned-tasks --diff-from HEAD` で `currentViolations=0` を確認して完了判定する。

#### 検証結果（2026-02-27 15:39 JST）

| 検証項目              | コマンド                                                                                                                                     | 結果                                       |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| ワークフロー仕様整合  | `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/skill-share --json` | PASS（13/13、errors=0、warnings=0）        |
| Phase出力構造         | `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/skill-share`              | PASS（28項目、error=0、warning=0）         |
| 未タスクリンク整合    | `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`                                                          | PASS（95/95 existing、missing=0）          |
| 未タスク差分監査      | `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD`                                   | currentViolations=0、baselineViolations=71 |
| skill-creator更新検証 | `node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator --verbose`                                         | PASS（45項目、error=0）                    |

#### 成果物

| 成果物               | パス/内容                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------- |
| 実行ワークフロー     | `docs/30-workflows/completed-tasks/skill-share/`                                            |
| 実装ガイド           | `docs/30-workflows/completed-tasks/skill-share/outputs/phase-12/implementation-guide.md`    |
| IPC ドキュメント     | `docs/30-workflows/completed-tasks/skill-share/outputs/phase-12/ipc-documentation.md`       |
| 仕様更新サマリー     | `docs/30-workflows/completed-tasks/skill-share/outputs/phase-12/spec-update-summary.md`     |
| ドキュメント変更ログ | `docs/30-workflows/completed-tasks/skill-share/outputs/phase-12/documentation-changelog.md` |
| 未タスク検出レポート | `docs/30-workflows/completed-tasks/skill-share/outputs/phase-12/unassigned-task-report.md`  |
| スキルフィードバック | `docs/30-workflows/completed-tasks/skill-share/outputs/phase-12/skill-feedback-report.md`   |

---

### タスク: TASK-9H スキルデバッグモード実装（2026-02-27完了）

| 項目       | 内容                                                                                                                  |
| ---------- | --------------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-9H                                                                                                               |
| 完了日     | 2026-02-27                                                                                                            |
| ステータス | **完了**                                                                                                              |
| タスク種別 | 新規機能実装（Main IPC + Preload + Shared 型）                                                                        |
| Phase      | Phase 1-12 完了（Phase 13未実施）                                                                                     |
| 変更範囲   | `packages/shared` / `apps/desktop/src/main/services/skill` / `apps/desktop/src/main/ipc` / `apps/desktop/src/preload` |

#### 実装内容（要点）

- `packages/shared/src/types/skill-debug.ts` を新規作成し、`DebugSessionState` / `DebugEvent` / `DebugCommand` / `DEBUG_CONSTANTS` を追加。
- `SkillDebugger.ts` / `DebugSession.ts` を新規作成し、セッション状態遷移・ブレークポイント管理・vmサンドボックス式評価を実装。
- `skillDebugHandlers.ts` を新規作成し、`skill:debug:*` 7チャネル（invoke 6 + event 1）を実装。
- `registerAllIpcHandlers` へ `registerSkillDebugHandlers(mainWindow)` を追加し、起動配線漏れを解消。
- Preload (`channels.ts`, `skill-api.ts`, `types.ts`) と shared export (`packages/shared/index.ts`, `packages/shared/src/types/index.ts`) を同期。

#### テスト結果

- TASK-9H 関連テスト: 129テスト全PASS（shared 38 + DebugSession 35 + SkillDebugger 40 + IPC 16）
- 既存回帰: 1138テスト全PASS（既存機能への破壊的影響なし）

#### 仕様書別SubAgent分担（今回の同期チーム）

| SubAgent   | 担当仕様書                      | 主担当作業                                            |
| ---------- | ------------------------------- | ----------------------------------------------------- |
| SubAgent-A | `api-ipc-agent.md`              | 7チャネルの request/response/validation 契約同期      |
| SubAgent-B | `interfaces-agent-sdk-skill.md` | Debug 型定義と Preload API 7メソッドの同期            |
| SubAgent-C | `security-electron-ipc.md`      | Sender検証 + P42 + vmサンドボックス制約の同期         |
| SubAgent-D | `architecture-overview.md`      | `registerSkillDebugHandlers` の配線・構造パターン同期 |
| SubAgent-E | `task-workflow.md`              | 完了台帳・検証証跡・成果物参照の固定化                |

#### 苦戦箇所と解決策

| 苦戦箇所                       | 原因                                                                     | 解決策                                                              | 再発防止                                                           |
| ------------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------- | ------------------------------------------------------------------ |
| ハンドラ未配線                 | `skillDebugHandlers.ts` 実装のみで `registerAllIpcHandlers` 登録が漏れた | `registerSkillDebugHandlers(mainWindow)` を追加                     | IPC追加時は `handlers + registerAllIpcHandlers` を同一PR内で必須化 |
| ワークフロー参照の旧ファイル名 | `skillHandlers.ts` / `skillHandlers.debug.test.ts` が残存                | `skillDebugHandlers.ts` / `skillDebugHandlers.test.ts` に一括正規化 | Phase 12で artifacts と実ファイルを1対1突合                        |
| source task 参照ドリフト       | 移管後も旧 `task-00-unified-implementation-sequence` 参照が残った        | `completed-task/task-023b-task-9h-skill-debug.md` へ更新            | 完了移管後は `rg` で旧参照を横断検出して同期                       |

#### 同種課題の簡潔解決手順（4ステップ）

1. 追加IPCごとに `channels/preload/handlers/register` の4点を同時更新する。
2. 共有型を追加したら `packages/shared/index.ts` と `types/index.ts` の両方で export を同期する。
3. ワークフロー仕様の `artifacts.json` を実ファイル名で更新し、参照ドリフトを先に潰す。
4. `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit --diff-from HEAD` を連続実行して完了判定する。

#### 成果物

| 成果物               | パス/内容                                                                             |
| -------------------- | ------------------------------------------------------------------------------------- |
| 実行ワークフロー     | `docs/30-workflows/TASK-9H-skill-debug/`                                              |
| 実装ガイド           | `docs/30-workflows/TASK-9H-skill-debug/outputs/phase-12/implementation-guide.md`      |
| 仕様更新サマリー     | `docs/30-workflows/TASK-9H-skill-debug/outputs/phase-12/spec-update-summary.md`       |
| ドキュメント更新履歴 | `docs/30-workflows/TASK-9H-skill-debug/outputs/phase-12/documentation-changelog.md`   |
| 未タスク検出レポート | `docs/30-workflows/TASK-9H-skill-debug/outputs/phase-12/unassigned-task-detection.md` |
| スキルフィードバック | `docs/30-workflows/TASK-9H-skill-debug/outputs/phase-12/skill-feedback-report.md`     |

---

### タスク: TASK-9B SkillCreator IPC拡張同期 再監査（2026-02-26完了）

| 項目       | 内容                                                        |
| ---------- | ----------------------------------------------------------- |
| タスクID   | TASK-9B                                                     |
| 完了日     | 2026-02-26                                                  |
| ステータス | **完了**                                                    |
| タスク種別 | 仕様同期 + IPCバリデーション補完                            |
| Phase      | Phase 1-12 完了（Phase 13未実施）                           |
| 変更範囲   | Main IPC / Preload / Shared types / aiworkflow-requirements |

#### 仕様書別SubAgent分担（今回の同期チーム）

| SubAgent   | 担当仕様書                      | 主担当作業                                                | 依存関係                              |
| ---------- | ------------------------------- | --------------------------------------------------------- | ------------------------------------- |
| SubAgent-A | `interfaces-agent-sdk-skill.md` | SkillCreatorService 12メソッド/API契約と 13チャンネル同期 | 実装差分（Main/Preload/shared）確定後 |
| SubAgent-B | `security-skill-ipc.md`         | sender/P42/パス/スキーマ/秘匿のセキュリティ同期           | SubAgent-Aの契約同期後                |
| SubAgent-C | `task-workflow.md`              | 完了台帳・検証証跡・成果物参照の固定化                    | SubAgent-A/Bの反映後                  |
| SubAgent-D | `lessons-learned.md`            | 苦戦箇所と簡潔解決手順の再利用化                          | SubAgent-Cの証跡値を参照              |

#### 実装内容（要点）

- SkillCreator IPC契約を 13チャンネル（12 invoke + 1 progress）に統一。
- `skillCreatorHandlers.ts` の `create` で P42 3段バリデーション（型/空文字/trim空文字）を補完し、回帰テストを追加。
- `outputs/artifacts.json` を追加し、`artifacts.json` と Phase 12 成果物台帳を同期。

#### 苦戦箇所と解決策

| 苦戦箇所                                    | 原因                                               | 解決策                                                            | 再発防止                                                   |
| ------------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------- |
| 6チャンネル記述と13チャンネル実装のドリフト | 基盤実装と拡張実装の仕様同期が分離していた         | `channels.ts` 正本を基準に関連仕様書を一括更新                    | 仕様同期は SubAgent 分担で同一ターン実施                   |
| `create` の P42 チェック漏れ                | 既存ハンドラー展開時に `trim()` 条件の実装が漏れた | `create` に3段バリデーションを追加し、空文字/空白回帰テストを追加 | IPC追加時はP42 + テスト追加を完了条件に固定                |
| 未タスク監査の baseline 誤読                | 全体監査の違反数を今回差分違反と混同しやすい       | `audit --diff-from HEAD` を合否判定、全体監査は監視値として別記録 | `currentViolations` と `baselineViolations` を常に分離記録 |

#### 同種課題の簡潔解決手順（5ステップ）

1. `channels.ts` と handler/preload 実装で契約数・型を先に確定する。
2. 全invokeに `validateIpcSender` と P42 3段バリデーションを適用する。
3. `interfaces/security/task/lessons` を SubAgent 分担で同時更新する。
4. `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit --diff-from HEAD` を連続実行する。
5. `spec-update-summary.md` と `unassigned-task-detection.md` に最終数値と時刻を記録する。

#### 検証結果（2026-02-26 21:40 JST）

| 検証項目             | コマンド                                                                                                                                               | 結果                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| ワークフロー仕様整合 | `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/task-9b-skill-creator --json` | PASS（13/13、errors=0、warnings=0）        |
| Phase出力構造        | `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-9b-skill-creator`              | PASS（28項目、error=0、warning=0）         |
| 未タスクリンク整合   | `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`                                                                    | PASS（89/89 existing、missing=0）          |
| 未タスク差分監査     | `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD`                                             | currentViolations=0、baselineViolations=71 |

#### 成果物

| 成果物               | パス/内容                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------- |
| 実行ワークフロー     | `docs/30-workflows/completed-tasks/task-9b-skill-creator/`                                              |
| 実装ガイド           | `docs/30-workflows/completed-tasks/task-9b-skill-creator/outputs/phase-12/implementation-guide.md`      |
| 仕様更新サマリー     | `docs/30-workflows/completed-tasks/task-9b-skill-creator/outputs/phase-12/spec-update-summary.md`       |
| 未タスク検出レポート | `docs/30-workflows/completed-tasks/task-9b-skill-creator/outputs/phase-12/unassigned-task-detection.md` |
| 整合性監査台帳       | `docs/30-workflows/completed-tasks/task-9b-skill-creator/outputs/phase-12/elegant-solution-audit.md`    |

---

### タスク: TASK-9G スキルスケジュール実行機能（2026-02-27完了）

| 項目       | 内容                                                                             |
| ---------- | -------------------------------------------------------------------------------- |
| タスクID   | TASK-9G                                                                          |
| 完了日     | 2026-02-27                                                                       |
| ステータス | **完了**                                                                         |
| タスク種別 | 新規機能実装 + 仕様同期                                                          |
| Phase      | Phase 1-12 完了（Phase 13未実施）                                                |
| 変更範囲   | `packages/shared` 型定義 / Main サービス・IPC / Preload API / ワークフロー成果物 |

#### 実装内容（要点）

- 5チャネルを追加: `skill:schedule:list/add/update/delete/toggle`
- `ScheduleStore` を新規実装し、`electron-store`（`skill-schedules`）へスケジュール永続化を追加
- `SkillScheduler` を新規実装し、`cron/interval/once/event` の4方式を提供
- `registerAllIpcHandlers` で `ScheduleStore` と `SkillScheduler` を初期化し、`registerSkillScheduleHandlers` を接続
- Preload `skillAPI` に schedule 5メソッドを追加し、共有型 `ScheduledSkill` 系4型を公開

#### テスト結果

| 分類                 | コマンド                                                                                | 結果         |
| -------------------- | --------------------------------------------------------------------------------------- | ------------ |
| Desktop 主要テスト   | `pnpm --filter @repo/desktop exec vitest run ...`（6ファイル）                          | 158/158 PASS |
| Shared 型定義テスト  | `pnpm --filter @repo/shared exec vitest run src/types/__tests__/skill-schedule.test.ts` | 5/5 PASS     |
| Typecheck            | `pnpm --filter @repo/desktop typecheck` / `pnpm --filter @repo/shared typecheck`        | PASS         |
| Lint（対象ファイル） | `pnpm --filter @repo/desktop exec eslint ...`                                           | PASS         |

#### セキュリティ準拠

- 全5ハンドラーで `validateIpcSender` を適用
- P42準拠3段バリデーション（型/空文字/trim空文字）を `skillName`/`prompt`/`id` に適用
- `schedule:add` で方式別必須検証（cron: `cronExpression`、interval: 正の `interval`）を適用
- 例外は `IpcResult` の `error: string` へ正規化し、内部情報漏えいを防止

#### 仕様書別SubAgent分担（今回の再確認チーム）

| SubAgent   | 担当仕様書                                               | 主担当作業                                             | 依存関係                        |
| ---------- | -------------------------------------------------------- | ------------------------------------------------------ | ------------------------------- |
| SubAgent-A | `interfaces-agent-sdk-skill.md`                          | 共有型4種と Preload API 5メソッド契約の同期            | 実装差分確定後                  |
| SubAgent-B | `api-ipc-agent.md`                                       | 5チャネル（request/response/validation）の契約同期     | SubAgent-A の型同期後           |
| SubAgent-C | `security-electron-ipc.md`                               | sender検証 + P42 + 方式別必須検証 + エラー正規化の同期 | SubAgent-B のチャネル契約同期後 |
| SubAgent-D | `arch-electron-services.md` / `architecture-overview.md` | Main 初期化配線・DI構成・責務分離の同期                | SubAgent-A/B/C の反映後         |
| SubAgent-E | `task-workflow.md` / `lessons-learned.md`                | 完了台帳・苦戦箇所・簡潔解決手順・検証証跡の同期       | SubAgent-D の証跡値を参照       |

#### 実装時の苦戦箇所（TASK-9G）

| 苦戦箇所                                 | 原因                                                         | 解決策                                                                                           |
| ---------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| 仕様書6ファイル同期漏れ                  | IPC契約・型・配線・台帳の更新箇所が分散していた              | `api-ipc` / `arch` / `security` / `overview` / `interfaces` / `task-workflow` を同一ターンで更新 |
| Phase成果物欠落（7〜13）                 | `artifacts.json` 定義と実体ファイル作成が分離していた        | 欠落成果物を再作成し、`phase-12-documentation.md` と `artifacts.json` を同期                     |
| `coverage --reporter` の全体閾値失敗混在 | 対象機能カバレッジとワークスペース全体閾値を同時評価していた | Phase 9 では対象ファイル指標と全体閾値失敗を分離記録し、判定根拠を明示                           |

#### 同種課題の簡潔解決手順（5ステップ）

1. 新規IPC追加時は `channels` / `handler` / `preload` / `tests` を同一ターンで更新する。
2. 共有型追加時は `packages/shared/src/types/index.ts` の re-export まで同時更新する。
3. Phase 12 は `outputs/phase-12/*` と `phase-12-documentation.md` を必ず相互同期する。
4. 仕様書更新は6ファイルを固定セットで確認し、`generate-index.js` 再生成を実施する。
5. 監査は `verify-all-specs` / `validate-phase-output` / `audit --diff-from HEAD` を連続実行して完了判定する。

#### 成果物

| 成果物               | パス/内容                                                                                                |
| -------------------- | -------------------------------------------------------------------------------------------------------- |
| 実行ワークフロー     | `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/`                                              |
| 実装ガイド           | `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-12/implementation-guide.md`      |
| 仕様更新サマリー     | `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-12/spec-update-summary.md`       |
| ドキュメント更新履歴 | `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-12/documentation-changelog.md`   |
| 未タスク検出レポート | `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-12/unassigned-task-detection.md` |
| スキルフィードバック | `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/outputs/phase-12/skill-feedback-report.md`     |

#### Phase 12再確認結果（2026-02-27）

| 検証項目                 | 実行コマンド/確認方法                                                                                                                                   | 結果                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Phase仕様整合（1〜13）   | `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/TASK-9G-skill-schedule --json` | 13/13 PASS（errors=0, warnings=0）                                |
| Phase成果物構造          | `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/TASK-9G-skill-schedule`              | 28項目 PASS（0エラー, 0警告）                                     |
| 未タスクリンク整合       | `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`                                                                     | 96/96 existing, missing=0                                         |
| 未タスク監査（今回差分） | `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD`                                              | currentViolations=0（baselineViolations=71 は既存課題として分離） |
| UT-9G未タスク配置・形式  | `docs/30-workflows/unassigned-task/` 配下の UT-9G-001〜005 指示書5件の存在確認 + `## メタ情報` + `## 1..9` 見出し検査                                   | 5/5件 配置済み、各ファイル見出し10件を満たす                      |

#### 再確認時の苦戦箇所（運用）

| 苦戦箇所                            | 原因                                                           | 解決策                                                                                                                                                     |
| ----------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 監査スクリプトの実行パス誤認        | `scripts/` 直下にある前提で実行し、`MODULE_NOT_FOUND` になった | 先に `rg --files .claude/skills \| rg 'verify-all-specs\|validate-phase-output\|verify-unassigned-links\|audit-unassigned-tasks'` で実体を解決してから実行 |
| `audit-unassigned-tasks` の結果誤読 | baseline違反件数が多く、今回差分判定が埋もれやすい             | 判定は `currentViolations` を正本に固定し、`baselineViolations` は別トラックで管理                                                                         |
| `--target-file` の適用範囲制約      | 監査対象外パスを指定すると失敗する                             | `--target-file` は監査対象ディレクトリ配下のみ使用し、対象外ケースは `--diff-from HEAD` で差分監査する                                                     |

#### 同種課題の簡潔解決手順（再確認版 4ステップ）

1. 監査コマンド実行前に、対象スクリプトの実体パスを `rg --files` で確定する。
2. `verify-all-specs` → `validate-phase-output` → `verify-unassigned-links` → `audit --diff-from HEAD` を固定順で実行する。
3. 監査結果は `currentViolations` を合否判定に使い、baselineは既存課題として分離記録する。
4. 未タスクは「配置先 + 見出しフォーマット（メタ情報 + 1..9）」を機械確認してから完了判定する。

---

### タスク: TASK-9I スキルドキュメント生成機能（2026-02-28完了）

| 項目       | 内容                                                                  |
| ---------- | --------------------------------------------------------------------- |
| タスクID   | TASK-9I                                                               |
| 完了日     | 2026-02-28                                                            |
| ステータス | **完了**                                                              |
| タスク種別 | 新規機能実装 + 仕様同期                                               |
| Phase      | Phase 1-12 完了（Phase 13は未実施方針）                               |
| 変更範囲   | shared 型定義 / Main サービス・IPC / Preload API / ワークフロー成果物 |

#### 実装内容（要点）

- 4チャネルを追加: `skill:docs:generate/preview/export/templates`
- `SkillDocGenerator` を新規実装（LLMQueryFn DI、テンプレートベース生成、markdown/html 出力）
- shared 型 `DocGenerationRequest` / `GeneratedDoc` / `DocSection` / `DocTemplate` / `TemplateSection` を追加
- Preload `skillAPI` に docs 4メソッドを追加

#### テスト結果

| 分類                   | コマンド                                                                                                  | 結果       |
| ---------------------- | --------------------------------------------------------------------------------------------------------- | ---------- |
| Desktop サービステスト | `pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillDocGenerator.test.ts` | 24/24 PASS |
| Desktop IPC テスト     | `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/skillHandlers.docs.test.ts`           | 32/32 PASS |
| Shared 型テスト        | `pnpm --filter @repo/shared exec vitest run src/types/__tests__/skill-docs.test.ts`                       | 8/8 PASS   |
| Typecheck              | `pnpm --filter @repo/desktop exec tsc --noEmit` / `pnpm --filter @repo/shared exec tsc --noEmit`          | PASS       |

#### セキュリティ準拠

- 全4ハンドラーで `validateIpcSender` を適用
- P42準拠3段バリデーションを `skillName` / `outputPath` に適用
- `skill:docs:generate` で `outputFormat` / `language` / boolean / 配列型の許可値検証を実施
- `skill:docs:export` で IPC層 + サービス層の二重パストラバーサル防御を実装

#### 成果物

| 成果物               | パス/内容                                                                                            |
| -------------------- | ---------------------------------------------------------------------------------------------------- |
| 実行ワークフロー     | `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/`                                              |
| 実装ガイド           | `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/outputs/phase-12/implementation-guide.md`      |
| 仕様更新サマリー     | `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/outputs/phase-12/spec-update-summary.md`       |
| ドキュメント更新履歴 | `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/outputs/phase-12/documentation-changelog.md`   |
| 未タスク検出レポート | `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/outputs/phase-12/unassigned-task-detection.md` |
| スキルフィードバック | `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/outputs/phase-12/skill-feedback-report.md`     |

#### 仕様書別SubAgent分担（Phase 12再確認チーム）

| SubAgent   | 担当仕様書                                                                                                                                                                                                                 | 主担当作業                                                        | 依存関係                        |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------- |
| SubAgent-A | `task-workflow.md`                                                                                                                                                                                                         | TASK-9I完了台帳に再確認証跡・苦戦箇所・再利用手順を同期           | SubAgent-B/C の検証結果を参照   |
| SubAgent-B | `lessons-learned.md`                                                                                                                                                                                                       | 再利用可能な苦戦箇所テンプレート（課題/再発条件/原因/対処）を追加 | SubAgent-A の台帳項目を参照     |
| SubAgent-C | `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/unassigned-task/task-ut-9i-001-llm-provider-integration.md` / `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/unassigned-task/task-ut-9i-002-template-crud.md` | UT-9I-001/002 の配置・見出しフォーマット・監査結果を確定          | SubAgent-A/B の反映前に機械検証 |

#### Phase 12 タスク仕様書準拠の再確認結果（2026-02-28）

| 検証項目                                            | コマンド                                                                                                                                            | 結果                                |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Phase仕様整合（1〜13）                              | `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/TASK-9I-skill-docs --json` | PASS（13/13, errors=0, warnings=0） |
| Phase成果物構造                                     | `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/TASK-9I-skill-docs`              | PASS（28項目, 0エラー, 0警告）      |
| 未タスクリンク整合                                  | `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`                                                                 | PASS（92/92 existing, missing=0）   |
| スキル構造検証                                      | `quick_validate.js`（skill-creator/task-spec/requirements）                                                                                         | Error 0件（Warning: 27/1/151）      |
| UT-9I-001 監査（対象）                              | `audit-unassigned-tasks.js --json --target-file ...task-ut-9i-001...`                                                                               | `current=0`, `baseline=71`          |
| UT-9I-002 監査（対象）                              | `audit-unassigned-tasks.js --json --target-file ...task-ut-9i-002...`                                                                               | `current=0`, `baseline=71`          |
| UT-IMP-PHASE12-EVIDENCE-LINK-GUARD-001 監査（対象） | `audit-unassigned-tasks.js --json --target-file ...task-imp-phase12-evidence-link-guard-001...`                                                     | `current=0`, `baseline=71`          |
| 未タスク監査（差分）                                | `audit-unassigned-tasks.js --json --diff-from HEAD`                                                                                                 | `current=0`, `baseline=71`          |

#### 未タスク配置・フォーマット確認（TASK-9I関連）

| 対象ファイル                                  | 配置先                                                                  | 見出し検証                                                                             | 判定 |
| --------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ---- |
| `task-ut-9i-001-llm-provider-integration.md`  | `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/unassigned-task/` | `## メタ情報` + `## 1..9` = 10/10、`メタ情報` 見出し 1件                               | 準拠 |
| `task-ut-9i-002-template-crud.md`             | `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/unassigned-task/` | `## メタ情報` + `## 1..9` = 10/10、`メタ情報` 見出し 1件                               | 準拠 |
| `task-imp-phase12-evidence-link-guard-001.md` | `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/unassigned-task/` | `## メタ情報` + `## 1..9` = 10/10、`メタ情報` 見出し 1件、`## 3.5` に苦戦箇所3件を記録 | 準拠 |

#### 再確認時の苦戦箇所と解決策

| 苦戦箇所                                                                    | 原因                                                                               | 解決策                                                                                | 再発防止                                                             |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `unassigned-task/*.md` のワイルドカード参照がリンク監査で false fail になる | `verify-unassigned-links` は実体パスのみを存在判定し、ワイルドカード展開を行わない | ワイルドカード参照を実体ファイル参照へ置換し、リンク監査を再実行して missing 0 を確認 | 未タスク参照はワイルドカード禁止、実体パスのみ許可を標準ルール化する |
| `--target-file` 監査で baseline が同時出力され、対象failに見えやすい        | 監査結果の `current` と `baseline` を同じ重みで解釈した                            | 合否は `currentViolations.total` を正本、baseline は既存負債として別管理に固定        | 報告テンプレートへ `current/baseline` 分離列を固定する               |
| Phase 12再確認の証跡がコマンドごとに散在しやすい                            | 検証コマンドの実行順と記録先が統一されていなかった                                 | `task-workflow.md` に再確認表を固定し、証跡を一元化                                   | 「verify→validate→links→audit」の順序を標準化する                    |
| 未タスクは「存在確認」で止まり、フォーマット確認が抜けやすい                | 物理配置チェックと見出しチェックを別タスクとして扱っていた                         | `配置確認 + 10見出し + メタ情報見出し件数` を同時に機械確認                           | 未タスク確認は必ず3点セット（配置/見出し/監査）で完了判定する        |

#### 同種課題の簡潔解決手順（5ステップ）

1. `rg -n "docs/30-workflows/unassigned-task/\\*\\.md" .claude/skills/aiworkflow-requirements/references/task-workflow.md` でワイルドカード参照を検出し、実体パスへ置換する。
2. `verify-all-specs` と `validate-phase-output` を先に実行し、Phase整合を固定する。
3. `verify-unassigned-links` で台帳リンク切れを先に排除する。
4. 未タスクは `--target-file` 監査で `currentViolations.total` を合否基準にし、baselineは別枠で記録する。
5. `task-workflow.md` と `lessons-learned.md` に実装内容・苦戦箇所・再利用手順を同一ターンで同期する。

---

### タスク: UT-UI-THEME-DYNAMIC-SWITCH-001 settingsSlice テーマ動的切替対応（2026-02-25完了）

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| タスクID   | UT-UI-THEME-DYNAMIC-SWITCH-001                  |
| 完了日     | 2026-02-25                                      |
| ステータス | **完了**                                        |
| タスク種別 | 実装タスク                                      |
| Phase      | Phase 1-12 完了（Phase 13未実施）               |
| 変更範囲   | Main / Preload / Renderer / Store / Settings UI |

#### 成果物

| 成果物                 | パス/内容                                                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| ワークフロー一式       | `docs/30-workflows/completed-tasks/ut-ui-theme-dynamic-switch-001/`                                                       |
| 実装ガイド             | `docs/30-workflows/completed-tasks/ut-ui-theme-dynamic-switch-001/outputs/phase-12/implementation-guide.md`               |
| 仕様更新サマリー       | `docs/30-workflows/completed-tasks/ut-ui-theme-dynamic-switch-001/outputs/phase-12/spec-update-summary.md`                |
| ドキュメント更新履歴   | `docs/30-workflows/completed-tasks/ut-ui-theme-dynamic-switch-001/outputs/phase-12/documentation-changelog.md`            |
| 未タスク検出レポート   | `docs/30-workflows/completed-tasks/ut-ui-theme-dynamic-switch-001/outputs/phase-12/unassigned-task-report.md`             |
| 仕様準拠再確認レポート | `docs/30-workflows/completed-tasks/ut-ui-theme-dynamic-switch-001/outputs/phase-12/phase12-task-spec-compliance-check.md` |

#### 変更理由

- テーマ運用を `kanagawa-dragon` 固定から `kanagawa-dragon / light / dark / system` の4モードへ拡張し、OS追従と永続化を両立させるため。
- `ThemeMode`（選択）と `resolvedTheme`（適用）を分離し、`system` モード時の状態競合を防ぐため。

#### 苦戦箇所と解決策

| 苦戦ポイント                              | 問題                                                    | 解決策                                                             |
| ----------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------ |
| `themeMode` と `resolvedTheme` の責務混在 | `system` 選択時に保存値/適用値が競合しやすい            | SSOTを `themeMode` に固定し、`resolvedTheme` は解決値専用に分離    |
| Store Hook依存の再実行ループ              | テーマ反映の `useEffect` が不安定参照で再実行しやすい   | 個別セレクタ（`useThemeMode`/`useResolvedTheme`）へ統一            |
| Phase 12証跡同期漏れ                      | 成果物実体と `phase-12-documentation.md` が乖離しやすい | Task 1〜5 の証跡突合レポートを追加し、チェック欄を同一ターンで同期 |

#### 同種課題の簡潔解決手順（4ステップ）

1. 状態を「選択値」と「適用値」の2軸で設計する。
2. UI副作用は個別セレクタHookで依存を固定する。
3. `outputs/phase-12/*` と `phase-12-documentation.md` を1対1で突合する。
4. `verify-all-specs --workflow --strict` と `verify-unassigned-links.js` を完了条件に固定する。

#### Phase 12 Step 2 転記テンプレート（短縮版）

| 項目       | 記述ルール                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------ |
| 実装内容   | 変更範囲（Main/Preload/Renderer/Store）と狙いを1-2行で記載                                 |
| 苦戦箇所   | 「課題」「原因」「対処」を1セットで記載                                                    |
| 再利用手順 | 4ステップ以内で、次タスクでそのまま実行できる形にする                                      |
| 反映先     | `task-workflow.md` / `ui-ux-design-system.md` / `lessons-learned.md` の3点セットを同時更新 |
| 検証       | `verify-all-specs --workflow --strict` と `verify-unassigned-links.js` の結果を記録        |

---

### タスク: UT-FIX-SKILL-EXECUTE-INTERFACE-001 skill:execute IPCハンドラ・Preload契約整合（2026-02-25完了）

| 項目       | 内容                                                           |
| ---------- | -------------------------------------------------------------- |
| タスクID   | UT-FIX-SKILL-EXECUTE-INTERFACE-001                             |
| 完了日     | 2026-02-25                                                     |
| ステータス | **完了**                                                       |
| タスク種別 | 実装 + テスト + 仕様同期                                       |
| Phase      | Phase 1-12 完了（Phase 13 未実施）                             |
| コード変更 | `apps/desktop/src/main/ipc/skillHandlers.ts` + テスト3ファイル |

#### 成果物

| 成果物                | パス/内容                                                                                                         |
| --------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 実行ワークフロー      | `docs/30-workflows/ut-fix-skill-execute-interface-001/`                                                           |
| Phase 12 実装ガイド   | `docs/30-workflows/ut-fix-skill-execute-interface-001/outputs/phase-12/implementation-guide.md`                   |
| Phase 12 更新履歴     | `docs/30-workflows/ut-fix-skill-execute-interface-001/outputs/phase-12/documentation-changelog.md`                |
| Phase 12 未タスク検出 | `docs/30-workflows/ut-fix-skill-execute-interface-001/outputs/phase-12/unassigned-task-detection.md`              |
| 完了タスク指示書      | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-014-ut-fix-skill-execute-interface-001.md` |

#### 変更理由

- `skill:execute` で Main が `skillId`、Preload/shared が `skillName` を扱っており契約ドリフトが残っていたため。
- 正式契約を `SkillExecutionRequest`（`skillName`, `prompt`）に合わせ、既存 `skillId` 経路は後方互換として維持したため。

#### 仕様書別SubAgent分担（今回の同期チーム）

| SubAgent   | 担当仕様書                      | 主担当作業                                            | 依存関係                                   |
| ---------- | ------------------------------- | ----------------------------------------------------- | ------------------------------------------ |
| SubAgent-A | `interfaces-agent-sdk-skill.md` | `skill:execute` 正式契約/後方互換契約の仕様同期       | コード実装差分（Main/Preload）確定後に更新 |
| SubAgent-B | `security-skill-ipc.md`         | sender検証 + `skillName/skillId` 入力検証ルール明文化 | SubAgent-A の契約定義を参照                |
| SubAgent-C | `task-workflow.md`              | 完了記録・検証証跡・未タスク監査結果を台帳化          | SubAgent-A/B の反映完了後に統合            |
| SubAgent-D | `lessons-learned.md`            | 苦戦箇所と簡潔解決手順を再利用可能形式で記録          | SubAgent-C の証跡値を参照                  |

#### Phase 12再確認結果（2026-02-25 再実行）

| 検証項目             | コマンド                                                                                                                                            | 結果                                       |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Phase仕様書整合      | `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/ut-fix-skill-execute-interface-001 --json` | PASS（13/13 Phase, errors=0）              |
| Phase出力構造        | `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/ut-fix-skill-execute-interface-001`              | PASS（28項目, error=0, warning=0）         |
| 未タスクリンク       | `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`                                                                 | PASS（91/91 existing, missing=0）          |
| 未タスク監査（差分） | `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD`                                          | currentViolations=0, baselineViolations=75 |

#### 未タスク配置・フォーマット確認（今回関連3件）

| ファイル                                                    | 配置先                               | 判定                                           |
| ----------------------------------------------------------- | ------------------------------------ | ---------------------------------------------- |
| `task-imp-skill-ipc-response-contract-guard-001.md`         | `docs/30-workflows/unassigned-task/` | `--target-file` scoped監査で current=0（準拠） |
| `task-imp-phase12-implementation-guide-quality-gate-001.md` | `docs/30-workflows/unassigned-task/` | `--target-file` scoped監査で current=0（準拠） |
| `task-imp-ipc-preload-spec-sync-ci-guard-001.md`            | `docs/30-workflows/unassigned-task/` | `--target-file` scoped監査で current=0（準拠） |

#### 再確認時の苦戦箇所と解決策

| 苦戦箇所                                           | 原因                             | 解決策                                                               | 再発防止                                              |
| -------------------------------------------------- | -------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------- |
| `--target-file` 実行時に baseline が大量出力される | 「対象のみが出る」と誤解しやすい | `scope.currentFiles` と `currentViolations.total` を判定の正本に固定 | 監査結果は `current` と `baseline` を分離して記録する |
| `validate-phase-output` 引数誤用                   | `--phase` 形式を想定しやすい     | `validate-phase-output.js <workflow-dir>` の位置引数で統一           | コマンドテンプレートをスキル側に固定化する            |

#### 同種課題の簡潔解決手順（再確認版・4ステップ）

1. `verify-all-specs --workflow` と `validate-phase-output <workflow-dir>` で Phase整合を先に固定する。
2. `audit-unassigned-tasks --diff-from HEAD` で current/baseline を分離し、今回差分の合否を確定する。
3. 関連未タスクは `--target-file` を使い、`currentViolations.total` を基準に個別確認する。
4. 仕様台帳（`task-workflow.md` / `lessons-learned.md`）へ同時追記して完了判定する。

---

### タスク: UT-IPC-DATA-FLOW-TYPE-GAPS-001 バックエンド型定義とUI Props間のデータフロー型ギャップ解消（2026-02-24完了）

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| タスクID   | UT-IPC-DATA-FLOW-TYPE-GAPS-001   |
| 完了日     | 2026-02-24                       |
| ステータス | **完了**                         |
| タスク種別 | 仕様書修正のみ（`spec_created`） |
| Phase      | Phase 1-12 完了                  |
| コード変更 | なし（仕様書修正のみ）           |

#### テスト結果サマリー

| 指標                  | 結果                  |
| --------------------- | --------------------- |
| Phase 6 整合性検証    | 24/24 PASS            |
| Phase 7 網羅性確認    | 49/49 PASS (100%)     |
| Phase 8 品質改善      | 6/6 PASS              |
| Phase 9 品質保証      | 60/60 PASS            |
| Phase 10 最終レビュー | PASS（MINOR 1件付き） |
| Phase 11 手動検証     | 9/9 PASS              |
| 累計検証項目          | 173項目 ALL PASS      |

#### 成果物

| 成果物               | パス/内容                                                                                                      |
| -------------------- | -------------------------------------------------------------------------------------------------------------- |
| ワークフロー一式     | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/`                                            |
| 実装ガイド           | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/outputs/phase-12/implementation-guide.md`    |
| 仕様更新サマリー     | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/outputs/phase-12/spec-update-summary.md`     |
| ドキュメント更新履歴 | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/outputs/phase-12/documentation-changelog.md` |
| 未タスク検出レポート | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/outputs/phase-12/unassigned-task-report.md`  |
| スキルフィードバック | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/outputs/phase-12/skill-feedback-report.md`   |

#### 変更理由

バックエンド型定義（task-9 系仕様書）とフロントエンド UI Props（task-030, task-031b）間に6つの型ギャップが存在し、後続実装者が型不整合に直面するリスクがあった。7つの仕様書ファイルを修正し、IPC境界でのDate型シリアライズ方針統一、DebugSession.status idle追加、onExport引数明確化、ExportResult変換ロジック、safeOn購読パターン、IPC引数オブジェクト形式統一を実施。

#### 苦戦箇所と解決策

| 苦戦ポイント                     | 問題                                                            | 解決策                                                                    |
| -------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Phase 12成果物の不足             | `spec-update-summary.md` 未作成のまま完了扱いになりやすい       | 成果物表と `outputs/phase-12/` 実体を1対1で突合し、不足ファイルは即時作成 |
| `artifacts.json` 二重管理        | `artifacts.json` と `outputs/artifacts.json` が非同期化しやすい | 2ファイルを同一内容へ同期し、completed成果物の実在チェックを実行          |
| 未タスク指示書テンプレートの揺れ | 旧見出し形式（`## 1. メタ情報`）が残り監査で違反化              | Why/What/How必須見出しを含む最新テンプレートへ正規化                      |

#### 同種課題の簡潔解決手順（4ステップ）

1. `phase-12-documentation.md` の成果物一覧と `outputs/phase-12/` 実体を突合する
2. `artifacts.json` と `outputs/artifacts.json` を同時更新し、completed成果物の参照切れをゼロ化する
3. `generate-index.js` 実行結果を `documentation-changelog.md` に記録する
4. 未タスク指示書は `audit-unassigned-tasks.js` 単体監査で必須見出しを確認してから完了扱いにする

---

### タスク: UT-SKILL-IPC-PRELOAD-EXTENSION-001 task-9D-J 30チャネル IPC/Preload 拡張計画の策定（2026-02-25反映）

| 項目       | 内容                                                                                 |
| ---------- | ------------------------------------------------------------------------------------ |
| タスクID   | UT-SKILL-IPC-PRELOAD-EXTENSION-001                                                   |
| 完了日     | 2026-02-25                                                                           |
| ステータス | **完了（仕様書作成）**                                                               |
| タスク種別 | 仕様書修正のみ（`spec_created`）                                                     |
| Phase      | Phase 1-12 完了（Phase 13は未実施）                                                  |
| コード変更 | なし（`docs/30-workflows/completed-tasks/ut-skill-ipc-preload-extension-001/` のみ） |

#### 成果物

| 成果物               | パス/内容                                                                                                              |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| ワークフロー一式     | `docs/30-workflows/completed-tasks/ut-skill-ipc-preload-extension-001/`                                                |
| 要件/設計/品質成果物 | `docs/30-workflows/completed-tasks/ut-skill-ipc-preload-extension-001/outputs/phase-1` 〜 `phase-12`                   |
| 検証レポート         | `docs/30-workflows/completed-tasks/ut-skill-ipc-preload-extension-001/outputs/verification-report.md`                  |
| 追補監査レポート     | `docs/30-workflows/completed-tasks/ut-skill-ipc-preload-extension-001/outputs/phase-12/recheck-multithinking-audit.md` |
| 未タスク指示書       | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-ipc-preload-extension-spec-alignment-001.md`               |

#### 変更理由

- task-9D〜9Jで必要な30チャネル（handle 29 / on 1）の仕様計画を実装前に固定し、P32/P44/P45の契約ドリフトを予防するため。
- 仕様監査で検出した差分（`main/ipc/channels.ts` 記述残存、命名差分、参照切れ）を未タスクとして分離し、後続実装の手戻りを抑制するため。

---

### タスク: UT-IMP-IPC-PRELOAD-EXTENSION-SPEC-ALIGNMENT-001 task-9D〜9J仕様差分の統合是正（2026-02-25完了）

| 項目       | 内容                                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------------------- |
| タスクID   | UT-IMP-IPC-PRELOAD-EXTENSION-SPEC-ALIGNMENT-001                                                           |
| 完了日     | 2026-02-25                                                                                                |
| ステータス | **完了（仕様書修正）**                                                                                    |
| タスク種別 | 仕様書修正のみ（`spec_created`）                                                                          |
| Phase      | Phase 1-12 相当（実装コード変更なし）                                                                     |
| コード変更 | なし（`docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/` のみ） |

#### 成果物

| 成果物                 | パス/内容                                                                                                                                                                                                                                                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 修正仕様書（task-9系） | `task-022-task-9f-skill-share.md`, `task-023a-task-9g-skill-schedule.md`, `task-023b-task-9h-skill-debug.md`, `task-023c-task-9i-skill-docs.md`, `task-023d-task-9j-skill-analytics.md`, `task-023e-task-9d-skill-chain.md`, `task-023f-task-9e-skill-fork.md`                                                     |
| 修正仕様書（task-9系） | `../completed-task/task-022-task-9f-skill-share.md`（移管）, `task-023a-task-9g-skill-schedule.md`, `task-023b-task-9h-skill-debug.md`, `task-023c-task-9i-skill-docs.md`, `../completed-task/task-023d-task-9j-skill-analytics.md`（移管）, `task-023e-task-9d-skill-chain.md`, `task-023f-task-9e-skill-fork.md` |
| 付随修正               | `task-003-execution-plan.md` の `skill-api.ts` 参照統一                                                                                                                                                                                                                                                            |
| 完了記録               | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-013-ut-imp-ipc-preload-extension-spec-alignment-001.md`                                                                                                                                                                                     |

#### 実装内容（仕様更新）

- 7仕様書の `artifacts.modifies` を現行正本に統一（`preload/channels.ts`, `preload/skill-api.ts`, `preload/types.ts`, `packages/shared/src/types/index.ts`）。
- 各 task に `packages/shared/src/types/skill-<domain>.ts`（`chain/fork/share/schedule/debug/docs/analytics`）を `artifacts.creates` として明記。
- 旧参照 `preload/skillAPI.ts` / `main/ipc/channels.ts` / `packages/shared/src/types/skillXxx.ts` を排除。
- task-9I の `GeneratedDoc.generatedAt` を IPC境界方針に合わせ `Date` → ISO 8601 `string` へ統一。

#### 苦戦箇所と解決策

| 苦戦ポイント   | 問題                                                         | 解決策                                                 |
| -------------- | ------------------------------------------------------------ | ------------------------------------------------------ |
| 旧パス混在     | `skillAPI.ts` と `skill-api.ts` が混在し、参照の正本が曖昧化 | 監査条件を固定し、旧パスを0件化してから反映            |
| artifacts 欠落 | taskごとに `modifies/creates` の必須項目が不一致             | 7タスク共通の必須4項目 + task別domain型を先に固定      |
| 型方針ドリフト | task-9I だけ Date型記述が残り IPC方針と衝突                  | Dateシリアライズ方針を追記し、型をISO 8601文字列へ統一 |

#### 同種課題の簡潔解決手順（5ステップ）

1. 監査対象を task-9D〜9J に限定してノイズを分離する。
2. `oldPaths`（参照差分）と `missingArtifacts`（台帳差分）を分けて検出する。
3. 参照差分を一括修正し、次に artifacts を task単位で補完する。
4. Date型が残る仕様書は IPC境界方針（ISO 8601 string）へ揃える。
5. 完了記録・残課題状態・教訓記録を同一コミット相当で同期する。

---

### タスク: UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 skill:import IPCチャネル名競合の予防的解消（2026-02-24完了）

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| タスクID   | UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 |
| 完了日     | 2026-02-24                           |
| ステータス | **完了**                             |
| タスク種別 | 仕様書修正のみ（`spec_created`）     |
| Phase      | Phase 1-13 完了                      |
| コード変更 | なし（仕様書修正のみ）               |

#### 成果物

| 成果物               | パス/内容                                                                                                              |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| ワークフロー一式     | `docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/`                                              |
| 実装ガイド           | `docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/outputs/phase-12/implementation-guide.md`      |
| ドキュメント更新履歴 | `docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/outputs/phase-12/documentation-changelog.md`   |
| 未タスク検出レポート | `docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/outputs/phase-12/unassigned-task-detection.md` |

#### 変更理由

- `skill:import` をローカルインポート専用のまま維持し、外部インポート用を `skill:importFromSource` に分離してIPCチャネル名競合を予防
- TASK-9F/TASK-UI-05 仕様書のチャネル表記を統一し、実装前に契約ドリフトを除去
- 仕様書修正のみタスクとして `spec_created` で完了管理し、Phase 10/11 で追加未タスク 0 件を確認

---

### タスク: TASK-UI-00-ATOMS Atoms共通コンポーネント実装（2026-02-23完了）

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| タスクID   | TASK-UI-00-ATOMS                            |
| 完了日     | 2026-02-23                                  |
| ステータス | **完了**                                    |
| Phase      | Phase 1-13 完了                             |
| テスト数   | 156（コンポーネント実装対象テスト、全PASS） |
| 変更範囲   | Atoms新規5件 + 既存2件拡張                  |

#### 成果物

| 成果物               | パス/内容                                                                                          |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| ワークフロー一式     | `docs/30-workflows/completed-tasks/task-ui-00-atoms/`                                              |
| 実装ガイド           | `docs/30-workflows/completed-tasks/task-ui-00-atoms/outputs/phase-12/implementation-guide.md`      |
| ドキュメント更新履歴 | `docs/30-workflows/completed-tasks/task-ui-00-atoms/outputs/phase-12/documentation-changelog.md`   |
| 未タスク検出レポート | `docs/30-workflows/completed-tasks/task-ui-00-atoms/outputs/phase-12/unassigned-task-detection.md` |

#### 変更理由

- Atoms層の基盤部品（StatusIndicator/FilterChip/SkeletonCard/SuggestionBubble/RelativeTime）を新規実装し、Badge/EmptyStateを拡張
- Apple HIG/WCAGとデザイントークン運用を仕様化し、テーマ横断・a11y検証を実施
- Phase 10 MINOR 3件を未タスク化して `docs/30-workflows/unassigned-task/` に配置し、`task-workflow.md` 残課題テーブルへ登録

---

### タスク: UT-FIX-SKILL-IMPORT-ID-MISMATCH-001 SkillImportDialog skill.id→skill.name修正（2026-02-22完了）

| 項目       | 内容                                                |
| ---------- | --------------------------------------------------- |
| タスクID   | UT-FIX-SKILL-IMPORT-ID-MISMATCH-001                 |
| 完了日     | 2026-02-22                                          |
| ステータス | **完了**                                            |
| Phase      | Phase 1-12完了                                      |
| テスト数   | 49（SkillImportDialog）+ 3（AgentView統合）、全PASS |

#### 成果物

| 成果物               | パス/内容                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------ |
| ワークフロー一式     | `docs/30-workflows/completed-tasks/skill-import-id-mismatch-fix/`                                            |
| 実装ガイド           | `docs/30-workflows/completed-tasks/skill-import-id-mismatch-fix/outputs/phase-12/implementation-guide.md`    |
| ドキュメント更新履歴 | `docs/30-workflows/completed-tasks/skill-import-id-mismatch-fix/outputs/phase-12/documentation-changelog.md` |
| 未タスク検出レポート | `docs/30-workflows/completed-tasks/skill-import-id-mismatch-fix/outputs/phase-12/unassigned-task-report.md`  |

#### 変更理由

- SkillImportDialogがskill.id（SHA-256ハッシュプレフィックス）をonImportに渡していたが、IPCハンドラ（skill:import）はskill.name（人間可読名）を期待していたため100%インポート失敗
- Renderer層のみの変更（SkillImportDialog + AgentView + テスト）。IPC/Preload/Main/Storeに変更なし
- P44パターンのRenderer側バリエーションとして解決

---

### タスク: UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 skill:import 戻り値型不整合修正（2026-02-21完了）

| 項目       | 内容                                                           |
| ---------- | -------------------------------------------------------------- |
| タスクID   | UT-FIX-SKILL-IMPORT-RETURN-TYPE-001                            |
| 完了日     | 2026-02-21                                                     |
| ステータス | **完了**                                                       |
| Phase      | Phase 1-12完了                                                 |
| テスト数   | 115（全PASS）+ 59（agentSlice integration、全PASS）            |
| カバレッジ | Branch 84.9%（修正対象skill:importハンドラ全10分岐100%カバー） |

#### 成果物

| 成果物               | パス/内容                                                                                           |
| -------------------- | --------------------------------------------------------------------------------------------------- |
| ワークフロー一式     | `docs/30-workflows/ut-fix-skill-import-return-type-001/`                                            |
| 実装ガイド           | `docs/30-workflows/ut-fix-skill-import-return-type-001/outputs/phase-12/implementation-guide.md`    |
| ドキュメント更新履歴 | `docs/30-workflows/ut-fix-skill-import-return-type-001/outputs/phase-12/documentation-changelog.md` |
| 未タスク検出レポート | `docs/30-workflows/ut-fix-skill-import-return-type-001/outputs/phase-12/unassigned-task-report.md`  |

#### 変更理由

- skill:import IPCハンドラが `ImportResult` 型を返していたが、Preload/Renderer側は `ImportedSkill` 型を期待していた（P44パターン）
- 2ステップ変換パターン（importSkills → getSkillByName）で `ImportedSkill` を返すように修正
- P42準拠の3段バリデーション（型チェック → 空文字列 → trim空文字列）を追加
- 引数形式を `{ skillIds: string[] }` → `skillName: string` に統一（P44/P45解決）

### タスク: UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 skill:ハンドラIPCレスポンス形式統一（2026-02-25完了）

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| タスクID   | UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001            |
| 完了日     | 2026-02-25                                           |
| ステータス | **完了**                                             |
| Phase      | Phase 1-12完了（Phase 13未実施）                     |
| テスト数   | 394（Preload 133 + Main 145 + Renderer 116、全PASS） |

#### 成果物

| 成果物               | パス/内容                                                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| ワークフロー一式     | `docs/30-workflows/completed-tasks/ut-fix-skill-ipc-response-consistency-001/`                                            |
| 実装ガイド           | `docs/30-workflows/completed-tasks/ut-fix-skill-ipc-response-consistency-001/outputs/phase-12/implementation-guide.md`    |
| 仕様更新サマリー     | `docs/30-workflows/completed-tasks/ut-fix-skill-ipc-response-consistency-001/outputs/phase-12/spec-update-summary.md`     |
| ドキュメント更新履歴 | `docs/30-workflows/completed-tasks/ut-fix-skill-ipc-response-consistency-001/outputs/phase-12/documentation-changelog.md` |
| 未タスク検出レポート | `docs/30-workflows/completed-tasks/ut-fix-skill-ipc-response-consistency-001/outputs/phase-12/unassigned-task-report.md`  |
| スキルフィードバック | `docs/30-workflows/completed-tasks/ut-fix-skill-ipc-response-consistency-001/outputs/phase-12/skill-feedback-report.md`   |

#### 変更理由

- `skill:execute` の Main 応答が `{ success, data }` ラッパー形式であるのに対し、Preload 側が直接型前提で解釈される箇所を是正した
- `skill:remove` の戻り値契約を `Promise<void>` から `Promise<RemoveResult>` に統一し、Main/Preload/仕様書のドリフトを解消した
- Phase 12 再監査で未タスクリンク参照切れと成果物不足（`spec-update-summary.md` 未出力）を是正した

#### 実装時の苦戦箇所と解決策

| 苦戦箇所                                     | 課題                                                                                          | 解決策                                                                                                  |
| -------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `safeInvoke` / `safeInvokeUnwrap` の使い分け | `execute` が wrapper 応答、`remove` が直接応答で、Preload側の選択を誤ると実行時に契約崩壊する | Main 応答形式を先に固定し、`execute=unwrap` / `remove=direct` を明文化してテストを更新                  |
| Phase 12 実装ガイド要件の不足                | Part 1 の日常例え・Part 2 の型/API/エッジケース記載が薄いと、task-spec要件未達になりやすい    | `implementation-guide.md` を再構成し、Part 1 に例え話、Part 2 に型定義/APIシグネチャ/エッジケースを追加 |
| 未タスク監査結果の誤読                       | repository 全体監査結果（既存負債）を今回差分の失敗と混同しやすい                             | ベースラインと今回差分を分離して報告し、今回対象の未タスク2件は個別に配置/フォーマットを確認            |

#### 同種課題の簡潔解決手順（4ステップ）

1. Main の実応答形式を一覧化し、Preload の `safeInvoke` / `safeInvokeUnwrap` を1対1で対応付ける。
2. Part 1/Part 2 要件で `implementation-guide.md` を作成し、日常例え・型/API・エッジケースを必ず記載する。
3. `verify-unassigned-links.js` と `validate-phase-output.js` を実行し、Phase 12 の参照と成果物を機械検証する。
4. `task-workflow.md` と関連仕様書へ「苦戦箇所 + 解決手順」を同時反映し、再発防止知見を残す。

### タスク: TASK-9A-B スキルファイル操作IPCハンドラー実装（2026-02-19完了）

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| タスクID   | TASK-9A-B                                   |
| 完了日     | 2026-02-19                                  |
| ステータス | **完了**                                    |
| Phase      | Phase 1-12完了                              |
| テスト数   | 65（全PASS）                                |
| カバレッジ | Line 91.14% / Branch 93.93% / Function 100% |

#### 成果物

| 成果物               | パス/内容                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------- |
| ワークフロー一式     | `docs/30-workflows/TASK-9A-B-ipc-file-handlers/`                                            |
| 実装ガイド           | `docs/30-workflows/TASK-9A-B-ipc-file-handlers/outputs/phase-12/implementation-guide.md`    |
| ドキュメント更新履歴 | `docs/30-workflows/TASK-9A-B-ipc-file-handlers/outputs/phase-12/documentation-changelog.md` |
| 未タスク検出レポート | `docs/30-workflows/TASK-9A-B-ipc-file-handlers/outputs/phase-12/unassigned-task-report.md`  |

#### 変更理由

- SkillFileManagerのファイル操作をIPC経由でRendererから呼び出し可能にするため、6チャンネルを追加（skill:readFile, skill:writeFile, skill:createFile, skill:deleteFile, skill:listBackups, skill:restoreBackup）
- validateIpcSender + 引数バリデーション + isKnownSkillFileErrorエラーサニタイズによる多層防御を実装
- registerSkillFileHandlers / unregisterSkillFileHandlers によるハンドラ登録/解除パターンを実装

---

### タスク: TASK-FIX-10-1-VITEST-ERROR-HANDLING dangerouslyIgnoreUnhandledErrors設定の解消（2026-02-19完了）

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| タスクID   | TASK-FIX-10-1-VITEST-ERROR-HANDLING              |
| 完了日     | 2026-02-19                                       |
| ステータス | **完了**                                         |
| Phase      | Phase 1-12完了（Phase 13未実施）                 |
| テスト数   | 新規13件 + 回帰10,189件PASS                      |
| 変更規模   | `vitest.config.ts` 1件修正 + テスト2ファイル新規 |

#### 成果物

| 成果物                 | パス/内容                                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------------------------ |
| ワークフロー一式       | `docs/30-workflows/TASK-FIX-10-1-VITEST-ERROR-HANDLING/`                                                     |
| 実装ガイド             | `docs/30-workflows/TASK-FIX-10-1-VITEST-ERROR-HANDLING/outputs/phase-12/implementation-guide.md`             |
| 更新履歴               | `docs/30-workflows/TASK-FIX-10-1-VITEST-ERROR-HANDLING/outputs/phase-12/documentation-changelog.md`          |
| 未タスク検出           | `docs/30-workflows/TASK-FIX-10-1-VITEST-ERROR-HANDLING/outputs/phase-12/unassigned-task-detection.md`        |
| 元タスク指示書（移管） | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/07-task-fix-10-1-vitest-error-handling.md` |

#### 変更理由

- `dangerouslyIgnoreUnhandledErrors: true` による未処理 Promise 拒否の隠蔽を解消し、テスト結果の信頼性を回復
- `@repo/shared` サブパス解決を安定化するため、Vitest alias を18件追加
- 未処理 Promise 拒否の検知退行を防ぐため、設定検証5件 + 非同期エラーハンドリング8件の回帰テストを追加

#### 関連仕様書更新

| 仕様書                  | 更新内容                                                       |
| ----------------------- | -------------------------------------------------------------- |
| quality-requirements.md | 未処理Promise拒否を無視しない運用ルール、alias管理ルールを追加 |
| task-workflow.md        | 本完了タスク記録と未タスク1件を追加                            |

#### 苦戦箇所と解決策

| 苦戦ポイント     | 問題                                                                    | 解決策                                                                                                    |
| ---------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Step 2の要否判定 | 「設定削除のみなので仕様更新不要」と誤判定しやすかった                  | テスト戦略変更（未処理Promise拒否検知ルールの変更）を仕様変更として扱い、`quality-requirements.md` を更新 |
| 未タスク検出範囲 | 変更コードだけを根拠にすると、Phase成果物に記録された将来課題を見落とす | Phase成果物（`outputs/phase-*`）を含めて再監査し、`task-imp-vitest-alias-sync-automation-001` を正式登録  |
| 参照整合の担保   | 未タスク登録後に参照パス不整合が残ると追跡性が落ちる                    | `verify-unassigned-links.js` でリンク整合を検証し、missing 0件を完了条件に含める                          |

---

### タスク: TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 `@repo/shared` モジュール解決エラー修正（2026-02-20完了）

| 項目       | 内容                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001                                                                        |
| 完了日     | 2026-02-20                                                                                                      |
| ステータス | **完了**                                                                                                        |
| Phase      | Phase 1-12完了（Phase 13未実施）                                                                                |
| 変更規模   | +353行（17ファイル）: `tsconfig.json`/`vitest.config.ts`/`package.json` + 回帰テスト3ファイル                   |
| テスト数   | 224テスト（3スイート: module-resolution 57件 + shared-module-resolution 59件 + vitest-alias-consistency 108件） |
| エラー削減 | typecheck 228エラー → 0エラー                                                                                   |

#### 品質ゲート達成状況

| ゲート項目   | 結果            | 詳細                                        |
| ------------ | --------------- | ------------------------------------------- |
| typecheck    | ✅ PASS         | 228エラー → 0エラー（全サブパス解決）       |
| vitest       | ✅ 224/224 PASS | 3テストスイート全件成功                     |
| shared build | ✅ 成功         | `pnpm --filter @repo/shared build` 正常完了 |
| lint         | ✅ PASS         | ESLintエラー0件                             |

#### 変更ファイル詳細

| 変更対象                        | 変更内容                                         |
| ------------------------------- | ------------------------------------------------ |
| `apps/desktop/tsconfig.json`    | +27 paths（`@repo/shared/*` サブパス型解決）     |
| `packages/shared/package.json`  | +26 typesVersions（TypeScript 4.x/5.x 後方互換） |
| `apps/desktop/vitest.config.ts` | +3 alias（`@repo/shared/agent/*` 系テスト解決）  |

#### 成果物

| 成果物               | パス/内容                                                                                                |
| -------------------- | -------------------------------------------------------------------------------------------------------- |
| ワークフロー一式     | `docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/`                                            |
| 実装ガイド           | `docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/outputs/phase-12/implementation-guide.md`    |
| ドキュメント更新履歴 | `docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/outputs/phase-12/documentation-changelog.md` |
| 未タスク検出レポート | `docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/outputs/phase-12/unassigned-task-report.md`  |
| システム仕様更新ログ | `docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/outputs/phase-12/system-docs-update-log.md`  |
| スキルフィードバック | `docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/outputs/phase-12/skill-feedback-report.md`   |

#### 変更理由

- `@repo/shared` サブパスの型解決エラーを解消するため、`exports`/`paths`/`alias` の整合を再構築
- `apps/desktop` の source 参照時に補助型宣言を取り込むよう `tsconfig` `include` を補強
- 回帰防止として、`shared-module-resolution` / `vitest-alias-consistency` / `module-resolution` の3テストを追加

#### 関連仕様書更新

| 仕様書                    | 更新内容                                            |
| ------------------------- | --------------------------------------------------- |
| architecture-monorepo.md  | 三層整合（`exports`/`paths`/`alias`）運用ルール追加 |
| quality-requirements.md   | サブパス三層整合の品質ゲート追加                    |
| development-guidelines.md | サブパス追加時の同期手順追加                        |
| lessons-learned.md        | 本タスクの苦戦箇所と再発防止策追加                  |

---

### タスク: UT-FIX-IPC-RESPONSE-UNWRAP-001 IPC レスポンスラッパー未展開修正（2026-02-14完了）

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| タスクID   | UT-FIX-IPC-RESPONSE-UNWRAP-001              |
| 完了日     | 2026-02-14                                  |
| ステータス | **完了**                                    |
| Phase      | Phase 1-12完了（Phase 13未実施）            |
| テスト数   | 25（新規）+ 既存回帰テストPASS              |
| カバレッジ | Line 92.64% / Branch 91.66% / Function 100% |

#### 成果物

| 成果物                 | パス/内容                                                                                           |
| ---------------------- | --------------------------------------------------------------------------------------------------- |
| ワークフロー一式       | `docs/30-workflows/completed-tasks/ipc-response-unwrap/`                                            |
| 実装ガイド             | `docs/30-workflows/completed-tasks/ipc-response-unwrap/outputs/phase-12/implementation-guide.md`    |
| ドキュメント更新履歴   | `docs/30-workflows/completed-tasks/ipc-response-unwrap/outputs/phase-12/documentation-changelog.md` |
| 未タスク検出レポート   | `docs/30-workflows/completed-tasks/ipc-response-unwrap/outputs/phase-12/unassigned-task-report.md`  |
| 元タスク指示書（移管） | `docs/30-workflows/completed-tasks/task-ut-fix-ipc-response-unwrap-001.md`                          |

#### 変更理由

- `skill-api.ts` の `list/getImported/rescan` が `{ success, data }` ラッパーをそのまま返していたため、Renderer で配列前提処理（`forEach`）がクラッシュしていた
- `safeInvokeUnwrap<T>` を導入し、Preload 層でラッパー展開して `T` を直接返す形へ統一
- `import()` はハンドラが直接値返却のため `safeInvoke` 維持とし、ハンドラ仕様に合わせて使い分けを明確化

#### 苦戦箇所と解決策

| 苦戦ポイント             | 問題                                                        | 解決策                                                                             |
| ------------------------ | ----------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 仕様書参照の誤リンク     | `api-ipc-skill.md` 参照が残り、正本を辿れなかった           | `interfaces-agent-sdk-skill.md` を正本参照に統一し、topic-map再生成で索引を同期    |
| Phase 10 MINORの扱い     | M-1/M-2 を「未タスク化不要」と誤判定しやすかった            | 未タスク2件（UT-FIX-IPC-RESPONSE-UNWRAP-002/003）を正式起票し、task-workflowへ登録 |
| 完了移管時のリンク不整合 | 元タスク指示書を移動後に `unassigned-task` 参照が残るリスク | 参照先を `completed-tasks` 側へ更新し、未タスクリンク検証を実施                    |

---

### タスク: TASK-FIX-14-1-CONSOLE-LOG-MIGRATION Skill系Main Processログのelectron-log移行（2026-02-14完了）

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| タスクID   | TASK-FIX-14-1-CONSOLE-LOG-MIGRATION           |
| 完了日     | 2026-02-14                                    |
| ステータス | **完了**                                      |
| Phase      | Phase 1-12完了（Phase 13は未実施）            |
| テスト数   | 920（既存回帰を含む）                         |
| 変更規模   | 本番コード4ファイル・27箇所、テスト10ファイル |

#### 成果物

| 成果物           | パス/内容                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------- |
| ワークフロー一式 | `docs/30-workflows/task-fix-14-1-console-log-migration/`                                                      |
| 元タスク指示書   | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/06c-task-fix-14-1-console-log-migration.md` |
| 未タスク検出     | `docs/30-workflows/task-fix-14-1-console-log-migration/outputs/phase-12/unassigned-task-detection.md`         |

#### 変更理由

- Skill系サービスの本番ログ方式を `electron-log` に統一し、レベル制御とファイル永続化を担保
- `SkillImportManager` の `if (this.debug)` / `NODE_ENV !== "test"` 依存を除去してログ制御を一元化
- Phase 12で残存箇所（`SkillExecutor.ts`）を未タスク `TASK-FIX-14-2` として分離管理

---

### タスク: TASK-FIX-11-1-SDK-TEST-ENABLEMENT SDK統合テスト有効化（2026-02-13完了）

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| タスクID   | TASK-FIX-11-1-SDK-TEST-ENABLEMENT            |
| 完了日     | 2026-02-13                                   |
| ステータス | **完了**                                     |
| Phase      | Phase 1-12完了                               |
| テスト数   | TODO有効化17件（3ファイル）+ 回帰テストPASS  |
| カバレッジ | テストケース有効化タスクのため該当範囲でPASS |

#### 成果物

| 成果物               | パス/内容                                                                             |
| -------------------- | ------------------------------------------------------------------------------------- |
| ワークフロー一式     | `docs/30-workflows/sdk-test-enablement/`                                              |
| 実装ガイド           | `docs/30-workflows/sdk-test-enablement/outputs/phase-12/implementation-guide.md`      |
| 更新履歴             | `docs/30-workflows/sdk-test-enablement/outputs/phase-12/documentation-changelog.md`   |
| 未タスク検出レポート | `docs/30-workflows/sdk-test-enablement/outputs/phase-12/unassigned-task-detection.md` |

#### 変更理由

- SDK統合時に残存したTODOプレースホルダーを実テスト化し、主要エラーケースの自動検証を有効化
- テスト間モック汚染（P9）を防ぐため、`beforeEach` でデフォルトモック再設定を導入
- 30秒タイムアウト検証を Fake Timers + `Promise.all` で決定論的に統一

#### 関連仕様書更新

| 仕様書                           | 更新内容                                                 |
| -------------------------------- | -------------------------------------------------------- |
| interfaces-agent-sdk-executor.md | 完了タスク追加、SDKテスト有効化パターンを追記            |
| testing-component-patterns.md    | Main Process SDKテスト有効化パターン（Section 10）を追加 |
| task-workflow.md                 | 本完了タスクと変更履歴を追加                             |

---

### タスク: TASK-FIX-13-1-DEPRECATED-PROPERTY-MIGRATION deprecatedプロパティ正式移行（2026-02-13完了）

| 項目       | 内容                  |
| ---------- | --------------------- |
| タスクID   | TASK-FIX-13-1         |
| 完了日     | 2026-02-13            |
| ステータス | **完了**              |
| Phase      | Phase 1-12完了        |
| テスト数   | 1（型定義回帰テスト） |

#### 成果物

| 成果物       | パス/内容                                                                                                             |
| ------------ | --------------------------------------------------------------------------------------------------------------------- |
| 型定義更新   | `packages/shared/src/types/skill.ts`（`Anchor.name` / `Skill.lastUpdated` 削除）                                      |
| 型回帰テスト | `packages/shared/src/types/__tests__/skill-deprecated-removal.test.ts`                                                |
| 仕様タスク   | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/06b-task-fix-13-1-deprecated-property-migration.md` |

#### 変更理由

- deprecatedプロパティの残存による二重定義状態を解消し、型の正本を単一化
- `anchor.name` 参照を `anchor.source` に統一し、UI側の参照不整合を解消
- `SkillImportConfig.lastUpdated` は既存永続化互換のため維持し、不要なスコープ拡大を抑止

#### 苦戦箇所と解決策

| 苦戦ポイント       | 問題                                                       | 解決策                                                                                         |
| ------------------ | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| 削除対象の境界判定 | `lastUpdated` が複数型に存在し、互換性を壊すリスクがあった | `Skill.lastUpdated` のみ削除し、`SkillImportConfig.lastUpdated` は据え置きを仕様に明記         |
| 参照移行の安全性   | `name` プロパティの機械置換は誤修正の可能性が高かった      | `Anchor` 型スコープで参照箇所を限定し、UIドキュメントの対象行のみ修正                          |
| Phase 12の追記漏れ | コード修正だけでは仕様同期が不足した                       | `interfaces-agent-sdk-skill.md` / `task-workflow.md` / `lessons-learned.md` を同一ターンで更新 |

---

### タスク: UT-FIX-AGENTVIEW-INFINITE-LOOP-001 AgentView無限ループ修正（2026-02-12完了）

| 項目       | 内容                                                            |
| ---------- | --------------------------------------------------------------- |
| タスクID   | UT-FIX-AGENTVIEW-INFINITE-LOOP-001                              |
| 完了日     | 2026-02-12                                                      |
| ステータス | **完了**                                                        |
| Phase      | Phase 1-13完了                                                  |
| テスト数   | 53（全PASS）                                                    |
| カバレッジ | Statements 100% / Branches 95.65% / Functions 100% / Lines 100% |

#### 成果物

| 成果物            | パス/内容                                                                                                       |
| ----------------- | --------------------------------------------------------------------------------------------------------------- |
| AgentView修正     | `apps/desktop/src/renderer/views/AgentView/index.tsx`（インラインセレクタ廃止、個別セレクタHook移行）           |
| Storeセレクタ追加 | `apps/desktop/src/renderer/store/index.ts`（AgentView向け15個）                                                 |
| テスト更新        | `apps/desktop/src/renderer/views/AgentView/__tests__/AgentView.test.tsx`（再レンダリング安定性含む）            |
| 実装ガイド        | `docs/30-workflows/completed-tasks/UT-FIX-AGENTVIEW-INFINITE-LOOP-001/outputs/phase-12/implementation-guide.md` |

#### 変更理由

- AgentView内のローカル `fetchSkills` + `useCallback` 依存の再生成により、`useEffect` が再トリガーされ続ける構造を解消
- P31対策の長期方針（個別セレクタHook）をAgentViewにも適用して参照安定性を統一
- デバッグログ除去とテスト増強により、回帰検知の確実性を向上

---

### タスク: UT-STORE-HOOKS-TEST-REFACTOR-001 Store Hooks テストリファクタリング（2026-02-12完了）

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| タスクID   | UT-STORE-HOOKS-TEST-REFACTOR-001 |
| 完了日     | 2026-02-12                       |
| ステータス | **完了**                         |
| Phase      | Phase 1-12完了                   |
| テスト数   | 208（全PASS）                    |
| カバレッジ | 全テストPASS                     |

#### 成果物

| 成果物                 | パス/内容                                                                |
| ---------------------- | ------------------------------------------------------------------------ |
| テストリファクタリング | `apps/desktop/src/renderer/store/__tests__/agentSlice.selectors.test.ts` |
| 変更内容               | getState()パターンからrenderHookパターンへ完全移行                       |

#### 変更理由

- agentSlice.selectors.test.tsのテストパターンをgetState()直接呼び出しからrenderHookパターンに統一
- Zustand個別セレクタHookの実際のReact環境での動作を検証するテスト設計に改善
- 全208テストがPASSすることを確認

---

### タスク: UT-STORE-HOOKS-COMPONENT-MIGRATION-001 Store Hooks コンポーネント移行（2026-02-12完了）

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| タスクID   | UT-STORE-HOOKS-COMPONENT-MIGRATION-001     |
| 完了日     | 2026-02-12                                 |
| ステータス | **完了**                                   |
| Phase      | Phase 1-12完了                             |
| テスト数   | 71（参照安定性31件＋無限ループ防止40件）   |
| カバレッジ | Line 87.77% / Branch 90% / Function 91.04% |

#### 成果物

| 成果物                   | パス/内容                                                               |
| ------------------------ | ----------------------------------------------------------------------- |
| 個別セレクタHook（30個） | `apps/desktop/src/renderer/store/index.ts`                              |
| LLMSelectorPanel移行     | `apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx`         |
| SkillSelector移行        | `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`          |
| SettingsView移行         | `apps/desktop/src/renderer/views/SettingsView/index.tsx`                |
| 参照安定性テスト         | `apps/desktop/src/renderer/store/__tests__/selectors.test.ts`           |
| 無限ループ防止テスト     | `apps/desktop/src/renderer/__tests__/infinite-loop-prevention.test.tsx` |

#### 変更理由

- P31問題（Zustand Store Hooks無限ループ）の根本解決策として個別セレクタパターンを実装
- 合成Hook（`useLLMStore()`等）から個別セレクタ（`useLLMFetchProviders()`等）への移行により、useEffectの依存配列に関数を安全に含められるようになった
- useRefガードパターンを削除し、コードの可読性と保守性を向上

---

### タスク: TASK-9B-I-SDK-FORMAL-INTEGRATION Claude Agent SDK型安全統合（2026-02-12完了）

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| タスクID   | TASK-9B-I-SDK-FORMAL-INTEGRATION           |
| 完了日     | 2026-02-12                                 |
| ステータス | **完了**                                   |
| Phase      | Phase 1-12完了                             |
| テスト数   | 13（SDK型安全テスト新規）+ 既存278件全PASS |
| 未タスク   | 1件（UT-9B-I-001）                         |

#### 成果物

| 成果物               | パス/内容                                                                                    |
| -------------------- | -------------------------------------------------------------------------------------------- |
| SkillExecutor.ts修正 | `apps/desktop/src/main/services/skill/SkillExecutor.ts`（`as any`除去、SDK実型統合）         |
| SDK型安全テスト      | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.sdk-types.test.ts`（13テスト） |
| ドキュメント         | `docs/30-workflows/completed-tasks/sdk-formal-integration/`                                  |

#### 変更理由

- `callSDKQuery()` の `as any` を完全除去し、Claude Agent SDK（@anthropic-ai/claude-agent-sdk@0.2.30）の実型に基づく型安全な統合を実現
- SDK Options: `apiKey` を `env: { ANTHROPIC_API_KEY }` に変更（SDK 実型準拠）
- SDK Options: `signal: AbortSignal` を `abortController: AbortController` に変更（SDK 実型準拠）
- SDK Query 戻り値: `conversation.stream()` から `conversation` 直接 AsyncIterable 利用に変更
- SDKQueryOptions ローカル型の permissionMode を SDK 実型に合わせて更新

#### 関連仕様書更新

| 仕様書                           | 更新内容                                                            |
| -------------------------------- | ------------------------------------------------------------------- |
| interfaces-agent-sdk-executor.md | callSDKQuery型安全化仕様追加、SDK Optionsマッピング、完了タスク追加 |
| interfaces-agent-sdk.md          | SDK型安全統合セクション追加、SDKQueryOptions変更記録                |
| task-workflow.md                 | 完了タスク追加、残課題テーブルからTASK-9B-I完了マーク               |

---

### タスク: TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION executeSkillのSkillExecutor委譲実装（2026-02-11完了）

| 項目       | 内容                                                  |
| ---------- | ----------------------------------------------------- |
| タスクID   | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION                 |
| 完了日     | 2026-02-11                                            |
| ステータス | **完了**                                              |
| Phase      | Phase 1-12完了                                        |
| テスト数   | 統合テスト7件・ユニットテスト12件（全PASS）           |
| 未タスク   | 3件（UT-FIX-7-1-001, UT-FIX-7-1-002, UT-FIX-7-1-003） |

#### 成果物

| 成果物                | パス/内容                                                                                |
| --------------------- | ---------------------------------------------------------------------------------------- |
| SkillService委譲実装  | `apps/desktop/src/main/services/skill/SkillService.ts`（setSkillExecutor, executeSkill） |
| skillHandlers DI設定  | `apps/desktop/src/main/ipc/skillHandlers.ts`                                             |
| 委譲テスト（IPC）     | `apps/desktop/src/main/ipc/__tests__/skillHandlers.delegate.test.ts`                     |
| 委譲テスト（Service） | `apps/desktop/src/main/services/skill/__tests__/SkillService.delegate.test.ts`           |

#### 変更理由

- SkillService.executeSkill()が直接実行ロジックを持たず、SkillExecutorに委譲するアーキテクチャに変更
- Setter Injectionパターンを採用（BrowserWindow依存による遅延初期化が必要）
- DIパターン使い分け基準を確立（Constructor / Setter / Factory）

#### 関連仕様書更新

| 仕様書                                  | 更新内容                       |
| --------------------------------------- | ------------------------------ |
| architecture-implementation-patterns.md | Setter Injectionパターン追加   |
| interfaces-agent-sdk-executor.md        | SkillService統合セクション追加 |
| arch-electron-services.md               | SkillService API追加           |
| lessons-learned.md                      | 苦戦箇所3件記録                |
| 06-known-pitfalls.md                    | P34, P35追加                   |
| patterns.md                             | 成功パターン2件追加            |

---

### タスク: UT-FIX-5-4 AgentSDKAPI abort() 型定義不一致修正（2026-02-10完了）

| 項目       | 内容           |
| ---------- | -------------- |
| タスクID   | UT-FIX-5-4     |
| 完了日     | 2026-02-10     |
| ステータス | **完了**       |
| Phase      | Phase 1-12完了 |
| テスト数   | 24（新規追加） |
| カバレッジ | 全テストPASS   |

#### 成果物

| 成果物              | パス/内容                                    |
| ------------------- | -------------------------------------------- |
| 型定義修正(shared)  | `packages/shared/src/agent/types.ts` (行237) |
| 型定義修正(preload) | `apps/desktop/src/preload/types.ts` (行1289) |
| 変更内容            | `abort(): void` → `abort(): Promise<void>`   |

#### 変更理由

- P23パターン（API二重定義の型管理）準拠
- 実装（safeInvoke）の戻り値は`Promise<void>`だが型定義は`void`だった
- 2箇所同時更新でTypeScript開発者が`.then()`や`await`を正しく使用可能に

---

### タスク: UT-FIX-5-3 Preload Agent Abort セキュリティ修正（2026-02-10完了）

| 項目       | 内容               |
| ---------- | ------------------ |
| タスクID   | UT-FIX-5-3         |
| 完了日     | 2026-02-10         |
| ステータス | **完了**           |
| Phase      | Phase 1-12完了     |
| テスト数   | 21（全テストPASS） |
| カバレッジ | 全テストPASS       |

#### 成果物

| 成果物      | パス/内容                                                      |
| ----------- | -------------------------------------------------------------- |
| Preload修正 | `apps/desktop/src/preload/index.ts` (行423)                    |
| Main修正    | `apps/desktop/src/main/agent/agent-handler.ts` (行176-178, 63) |
| 変更内容    | `ipcRenderer.send` → `safeInvoke(IPC_CHANNELS.AGENT_ABORT)`    |

#### 変更理由

- 04-electron-security.md IPC セキュリティ原則準拠
- ホワイトリスト検証のバイパスを解消
- 他のAPI（stop, getStatus等）と同一パターンに統一

---

### タスク: TASK-AUTH-SESSION-REFRESH-001 セッション自動リフレッシュ実装（2026-02-06完了）

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| タスクID   | TASK-AUTH-SESSION-REFRESH-001           |
| 完了日     | 2026-02-06                              |
| ステータス | **完了**                                |
| Phase      | Phase 1-12完了                          |
| テスト数   | 26                                      |
| カバレッジ | Stmts 96.15%, Branch 93.10%, Funcs 100% |

#### 成果物

| 成果物                | パス/内容                                                                |
| --------------------- | ------------------------------------------------------------------------ |
| TokenRefreshScheduler | `apps/desktop/src/main/services/tokenRefreshScheduler.ts`                |
| テストケース          | `apps/desktop/src/main/services/__tests__/tokenRefreshScheduler.test.ts` |
| authHandlers.ts更新   | スケジューラー統合、コールバック追加                                     |
| supabaseClient.ts更新 | `autoRefreshToken: false`                                                |
| authSlice.ts更新      | `isRefreshing` フィールド追加                                            |
| auth.ts更新           | `sessionExpiresAt` フィールド追加                                        |

#### 未タスク（TASK-AUTH-SESSION-REFRESH-001実施中に発見）

| タスクID                    | タスク名                         | 優先度 |
| --------------------------- | -------------------------------- | ------ |
| UT-OFFLINE-REFRESH-001      | オフライン時リフレッシュ失敗処理 | 中     |
| UT-AUDIT-001                | 認証イベント監査ログ             | 中     |
| UT-REFRESH-NOTIFICATION-001 | セッションリフレッシュ通知UI     | 低     |

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

### タスク: UT-IPC-CHANNEL-NAMING-AUDIT-001 IPCチャネル命名規則の横断的適用監査（2026-02-25完了）

| 項目       | 内容                                                                 |
| ---------- | -------------------------------------------------------------------- |
| タスクID   | UT-IPC-CHANNEL-NAMING-AUDIT-001                                      |
| 完了日     | 2026-02-25                                                           |
| ステータス | **spec_created**（監査・計画・仕様更新完了、コード実装は後続タスク） |
| Phase      | Phase 1-12完了                                                       |
| 監査結果   | 違反6件を分類（高1/中3/低2）、Skillドメイン重大違反0件               |
| 未タスク   | 0件（UT-IPC-AUTH-HANDLE-DUPLICATE-001 は2026-02-25完了）             |

#### 成果物

| 成果物               | パス/内容                                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------ |
| ワークフロー一式     | `docs/30-workflows/completed-tasks/ut-ipc-channel-naming-audit-001/`                                               |
| 元タスク指示書       | `docs/30-workflows/completed-tasks/task-ipc-channel-naming-audit-001.md`                                           |
| 監査レポート         | `docs/30-workflows/completed-tasks/ut-ipc-channel-naming-audit-001/outputs/phase-5/channel-naming-audit-report.md` |
| リネーム計画         | `docs/30-workflows/completed-tasks/ut-ipc-channel-naming-audit-001/outputs/phase-5/channel-rename-plan.md`         |
| Phase 12 更新サマリ  | `docs/30-workflows/completed-tasks/ut-ipc-channel-naming-audit-001/outputs/phase-12/spec-update-summary.md`        |
| 未タスク検出レポート | `docs/30-workflows/completed-tasks/ut-ipc-channel-naming-audit-001/outputs/phase-12/unassigned-task-detection.md`  |

#### 変更理由

- `UT-SKILL-IMPORT-CHANNEL-CONFLICT-001` で策定した命名規則を全体監査へ横展開し、P5/P44/P45 の再発リスクを定量化した。
- Skillドメインは即時ブロッカーを解消済み、残課題は `AUTH_*` の重複式整理として未タスクへ分離した。
- Phase 12 Step 1-A/1-C/1-D の漏れ対策として、台帳・教訓・索引・成果物台帳を同一ターンで同期した。

---

### タスク: UT-IPC-AUTH-HANDLE-DUPLICATE-001 AUTH IPC handle重複式の登録一元化（2026-02-25完了）

| 項目       | 内容                                                                                                                                                     |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID   | UT-IPC-AUTH-HANDLE-DUPLICATE-001                                                                                                                         |
| 完了日     | 2026-02-25                                                                                                                                               |
| ステータス | **完了**                                                                                                                                                 |
| 変更範囲   | `apps/desktop/src/main/ipc/authHandlers.ts`, `apps/desktop/src/main/ipc/index.ts`, `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts` |
| 監査結果   | AUTH重複登録式（5件）を0件化                                                                                                                             |

#### 成果物

| 成果物           | パス                                                                                                       |
| ---------------- | ---------------------------------------------------------------------------------------------------------- |
| ワークフロー一式 | `docs/30-workflows/completed-tasks/ut-ipc-auth-handle-duplicate-001/`                                      |
| 実装ログ         | `docs/30-workflows/completed-tasks/ut-ipc-auth-handle-duplicate-001/outputs/phase-5/implementation-log.md` |
| 品質レポート     | `docs/30-workflows/completed-tasks/ut-ipc-auth-handle-duplicate-001/outputs/phase-9/quality-report.md`     |

---

### タスク: TASK-9A-skill-editor スキルエディター機能（2026-02-26完了）

| 項目       | 内容                                                                                 |
| ---------- | ------------------------------------------------------------------------------------ |
| タスクID   | TASK-9A                                                                              |
| 完了日     | 2026-02-26                                                                           |
| ステータス | **完了**                                                                             |
| 実装範囲   | SkillEditor / SkillCodeEditor / ファイル作成・削除 / バックアップ復元 / 未保存ガード |
| 品質結果   | UIテスト15件PASS + 回帰/セキュリティテストPASS                                       |

#### 成果物

| 成果物               | パス                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------ |
| ワークフロー一式     | `docs/30-workflows/completed-tasks/TASK-9A-skill-editor/`                                              |
| 実装ガイド           | `docs/30-workflows/completed-tasks/TASK-9A-skill-editor/outputs/phase-12/implementation-guide.md`      |
| 仕様更新サマリー     | `docs/30-workflows/completed-tasks/TASK-9A-skill-editor/outputs/phase-12/spec-update-summary.md`       |
| 未タスク検出レポート | `docs/30-workflows/completed-tasks/TASK-9A-skill-editor/outputs/phase-12/unassigned-task-detection.md` |

#### 実装時の苦戦箇所と解決策

| 苦戦箇所                            | 原因                                                                        | 解決策                                                                                  |
| ----------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Phase 12実装ガイドの2パート要件不足 | Part 1/Part 2の必須要件を本文に十分反映できていなかった                     | Part 1を「理由先行 + 日常例え」、Part 2を「型/API/エラー/境界条件」固定テンプレで再構成 |
| 未タスク監査ログの誤読              | `audit-unassigned-tasks --target-file` でも baseline が併記される仕様を誤解 | 合否判定を `currentViolations.total` に固定し、baseline は監視値として別管理            |
| 未タスク指示書のメタ情報重複        | YAML と表のメタ情報を別セクションで管理していた                             | `## メタ情報` を1セクションに統一し、フォーマットを正規化                               |

#### 同種課題の簡潔解決手順（4ステップ）

1. `verify-all-specs --workflow` と `validate-phase-output <workflow-dir>` を先に実行して Phase 構造を固定する。
2. 未タスク監査は `current` と `baseline` を分離記録し、合否は `current` のみで判定する。
3. 実装ガイドは Part 1/Part 2 の必須チェックを通してから完了判定する。
4. 仕様書・台帳・未タスク指示書を同一ターンで同期し、リンク検証を実行する。

---

## TASK-10A-B: SkillAnalysisView 実装完了記録（2026-03-02）

### タスク概要

| 項目         | 内容                                                           |
| ------------ | -------------------------------------------------------------- |
| タスクID     | TASK-10A-B                                                     |
| 機能         | SkillAnalysisView（ScoreDisplay / SuggestionList / RiskPanel） |
| 実施日       | 2026-03-02                                                     |
| ステータス   | completed（Phase 1-12）                                        |
| ワークフロー | `docs/30-workflows/completed-tasks/skill-analysis-view/`       |

### 反映内容（Phase 12 再確認）

| 観点                 | 内容                                                                                                                                                                                    |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UI実装               | `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx` ほか4ファイルで分析表示・改善操作を実装                                                                              |
| a11y改善             | `SuggestionList` / `RiskPanel` の `role="list"` に `aria-label` を追加                                                                                                                  |
| デザイントークン統一 | `text-white` を `text-[var(--text-inverse)]` へ置換                                                                                                                                     |
| 画面検証             | `outputs/phase-11/screenshots/TC-01`〜`TC-04` を 2026-03-02 に再取得                                                                                                                    |
| 未タスク管理         | current active set 6 件（UT-TASK-10A-B-002 / 004 / 005 / 006 / 007 / 009）を `docs/30-workflows/unassigned-task/` に維持し、完了済み 3 件（001 / 003 / 008）は `completed-tasks` へ移管 |

### 検証証跡

| 検証項目   | コマンド / 証跡                                                                                                                                                                                                                                                                                           | 結果             |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| 単体テスト | `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx src/renderer/components/skill/__tests__/SuggestionList.test.tsx src/renderer/components/skill/__tests__/RiskPanel.test.tsx src/renderer/components/skill/__tests__/ScoreDisplay.test.tsx` | PASS（74 tests） |
| 型検証     | `pnpm typecheck`（apps/desktop）                                                                                                                                                                                                                                                                          | PASS             |
| 画面証跡   | `docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-11/screenshots/`                                                                                                                                                                                                                     | 4ファイル取得    |

### 実装時の苦戦箇所と解決策

| 苦戦箇所                                            | 再発条件                                                                                           | 解決策                                                                                                                                                                                                                                                                                                               | 今後の標準ルール                                                                                                        |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Phase 11 がコード分析ベースのまま残る               | 画面検証を手作業メモのみで完了扱いにする場合                                                       | スクリーンショット取得スクリプトで4状態を再撮影し、Phase 11成果物を再作成                                                                                                                                                                                                                                            | UIタスクのPhase 11は「実画面証跡 + 結果文書」のセットを必須化                                                           |
| `phase-11-manual-test.md` の必須節不足              | テンプレート章立てを簡略化した場合                                                                 | 「統合テスト連携」節を追加し、`validate-phase-output` を再実行                                                                                                                                                                                                                                                       | Phase 11更新後は `validate-phase-output` を必須実行する                                                                 |
| 未タスク件数ドリフト（7件→5件）                     | 修正済み課題を未タスク台帳に残し続ける場合                                                         | D1/D2 を修正済み化し、UT-TASK-10A-B-001〜005 のみ継続管理へ再同期                                                                                                                                                                                                                                                    | 未タスク台帳は毎回「有効件数」を再計算して更新する                                                                      |
| light検証証跡がdarkのまま残る                       | 撮影スクリプト側のテーマモックを固定値（dark）で返す場合                                           | `capture-ut-task-10a-b-001-screenshots.mjs` で `prefers-color-scheme` 連動に修正し、TC-11-04を再撮影                                                                                                                                                                                                                 | light/dark検証は「色設定 + モック応答」の二重整合を必須化する                                                           |
| 完了済みUT指示書の配置先誤認（001と002〜008の混在） | 完了済み指示書を `completed-tasks/unassigned-task/` に残したまま、未実施指示書と同一運用で扱う場合 | `UT-TASK-10A-B-001` を `docs/30-workflows/completed-tasks/task-10a-b-autofixable-filter-button.md` へ移管し、`UT-TASK-10A-B-002〜008` の7件を `docs/30-workflows/unassigned-task/` に再配置。関連参照を一括更新し、`verify-unassigned-links`（102/102）と `audit --diff-from HEAD`（current=0, baseline=90）で再確認 | 指示書配置は「完了=completed-tasks」「未実施=unassigned-task」を厳守し、監査値は `current` と `baseline` を分離記録する |

#### 同種課題の簡潔解決手順（5ステップ）

1. 画面証跡を再取得し、`outputs/phase-11/screenshots` の鮮度を確定する。
2. `manual-test-result` / `discovered-issues` を実証跡ベースへ更新する。
3. `verify-all-specs` と `validate-phase-output` を連続実行し、章立て不備を解消する。
4. 未タスク件数を再計算し、完了済み/未実施の配置先を分離したうえで `unassigned-task-detection` と `task-workflow` を同時同期する。
5. 苦戦箇所を `lessons-learned.md` へ転記し、再発条件と標準ルールを固定する。

### 派生タスク完了記録: UT-TASK-10A-B-001（2026-03-05）

| 項目       | 内容                                                                                                                                                       |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID   | UT-TASK-10A-B-001                                                                                                                                          |
| タスク名   | 自動修正可能フィルタボタン実装                                                                                                                             |
| ステータス | **完了（Phase 1-12）**                                                                                                                                     |
| 成果物     | `docs/30-workflows/completed-tasks/ut-task-10a-b-001-autofixable-filter-button/`                                                                           |
| 主な変更   | `SuggestionList` に一括選択導線追加、`useSkillAnalysis` に auto-fixable 選択ハンドラ追加、関連テスト追加                                                   |
| 検証結果   | 関連53テストPASS、対象カバレッジ Line 100 / Branch 96.22 / Function 100、手動UI検証（スクリーンショット5件, 2026-03-05 11:00 JST再撮影, coverage 5/5）PASS |

#### 最終再監査クイック解決カード（UT-TASK-10A-B-001）

| 観点         | 固定ルール                                                                                                                                    |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 配置判定     | 未実施UTは `docs/30-workflows/unassigned-task/`、完了済みUT指示書は `docs/30-workflows/completed-tasks/` 直下へ配置する                       |
| 監査適用境界 | `audit-unassigned-tasks --target-file` は未実施UT（`unassigned-task` 系）のみ適用し、完了済み指示書（`completed-tasks/*.md`）へは適用しない   |
| 画面証跡     | `TC-11-01`〜`TC-11-05` を同一ターンで再取得し、`validate-phase11-screenshot-coverage` 5/5 PASS を確認する                                     |
| 合否判定     | `verify-unassigned-links` は参照整合、`audit --diff-from HEAD` は `currentViolations` を合否・`baselineViolations` を監視値として分離記録する |

固定実行コマンド:

```bash
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD | jq '{current: .totals.currentViolations, baseline: .totals.baselineViolations}'
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/ut-task-10a-b-001-autofixable-filter-button
test -f docs/30-workflows/completed-tasks/task-10a-b-autofixable-filter-button.md
find docs/30-workflows/unassigned-task -maxdepth 1 -name 'task-10a-b-*.md' | wc -l
```

### 派生タスク完了記録: UT-TASK-10A-B-003（2026-03-05）

| 項目       | 内容                                                                              |
| ---------- | --------------------------------------------------------------------------------- |
| タスクID   | UT-TASK-10A-B-003                                                                 |
| タスク名   | 改善結果内訳表示実装                                                              |
| ステータス | **完了（Phase 1-12）**                                                            |
| 成果物     | `docs/30-workflows/completed-tasks/task-10a-b-improvement-result-breakdown-ui/`   |
| 主な変更   | `ImprovementResultBreakdown` 実装、`SkillAnalysisView` への統合、表示系テスト追加 |
| 検証結果   | 関連テスト PASS、Phase 11 視覚検証 PASS、Phase 12 仕様同期完了                    |

### 派生タスク完了記録: UT-TASK-10A-B-008（2026-03-06）

| 項目       | 内容                                                                                                                                                                                                                                                                                                                                                       |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID   | UT-TASK-10A-B-008                                                                                                                                                                                                                                                                                                                                          |
| タスク名   | 未タスク件数再計算同期ガード                                                                                                                                                                                                                                                                                                                               |
| ステータス | **完了（Phase 1-12）**                                                                                                                                                                                                                                                                                                                                     |
| 成果物     | `docs/30-workflows/completed-tasks/ut-task-10a-b-008-unassigned-count-resync-guard/`                                                                                                                                                                                                                                                                       |
| 主な変更   | active/completed の正本定義、3台帳同期、`validate-task10ab-ledger-sync.js` 追加、`validate-phase12-implementation-guide.js` 追加、`useSkillAnalysis` の StrictMode ローディング固着修正、SkillAnalysisView screenshot スクリプトの loaded-state / light-theme 追従強化、repo 内 `skill-creator/SKILL.md` の直接参照導線再編（未リンク reference 26件解消） |
| 検証結果   | `validate-task10ab-ledger-sync` PASS、`validate-phase12-implementation-guide` PASS（10/10）、`verify-unassigned-links` PASS、`validate-phase11-screenshot-coverage` PASS（8/8）、`audit --diff-from HEAD` current=0、`SkillAnalysisView.test.tsx` 36 tests PASS、`quick_validate .claude/skills/skill-creator` PASS（45項目、warning=0）                   |

---

## TASK-10A-C: SkillCreateWizard 実装完了記録（2026-03-02）

### タスク概要

| 項目         | 内容                                                     |
| ------------ | -------------------------------------------------------- |
| タスクID     | TASK-10A-C                                               |
| 機能         | SkillCreateWizard（4ステップ作成導線）                   |
| 実施日       | 2026-03-02                                               |
| ステータス   | completed（Phase 1-12）                                  |
| ワークフロー | `docs/30-workflows/completed-tasks/skill-create-wizard/` |

### 反映内容（Phase 12 再監査）

| 観点         | 内容                                                                                                                                            |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| UI実装       | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` と `hooks/useWizardStep.ts` を追加し、説明入力→設定→生成中→完了/エラーを実装 |
| IPC契約      | `skill:create` を `channels.ts` / `skill-api.ts` / `skillHandlers.ts` / テストへ同期。Preload API `create(description, options)` を追加         |
| サービス委譲 | `SkillService.createSkillFromWizard()` で `SkillCreatorService.createSkill()` に委譲し、`addAgents` / `addReferences` の初期化を実装            |
| 画面検証     | `outputs/phase-11/screenshots/TC-01〜TC-08` を 2026-03-02 に再取得                                                                              |
| 仕様同期     | `api-ipc-agent.md` / `interfaces-agent-sdk-skill.md` / `security-electron-ipc.md` / `task-workflow.md` を `skill:create` 契約に同期             |

### 仕様書別SubAgent分担（関心分離）

| SubAgent   | 担当仕様書                                 | 主担当作業                                                | 完了条件                                           |
| ---------- | ------------------------------------------ | --------------------------------------------------------- | -------------------------------------------------- |
| SubAgent-A | `references/api-ipc-agent.md`              | `skill:create` IPC契約（request/response/validation）同期 | チャネル表・バリデーション表・実装状況が実装と一致 |
| SubAgent-B | `references/interfaces-agent-sdk-skill.md` | Preload API `create` 契約と型定義同期                     | 14メソッド構成・`create` 契約が一致                |
| SubAgent-C | `references/security-electron-ipc.md`      | sender/P42/構造検証/サニタイズのセキュリティ同期          | 4層防御が仕様化され実装箇所が追跡可能              |
| SubAgent-D | `references/task-workflow.md`              | 完了台帳・検証証跡・苦戦箇所の固定化                      | 完了記録 + 検証結果 + 苦戦箇所が同時記録           |
| SubAgent-E | `references/lessons-learned.md`            | 再発条件付きの教訓と簡潔手順の転記                        | 同種課題手順が再利用可能な形で記録                 |

### 検証証跡

| 検証項目            | コマンド / 証跡                                                                                                                                                   | 結果                    |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| 画面証跡再取得      | `pnpm --filter @repo/desktop run screenshot:skill-create-wizard`                                                                                                  | PASS（8枚取得）         |
| 仕様書構造          | `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/skill-create-wizard`                     | PASS（13/13）           |
| Phase出力整合       | `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/skill-create-wizard`                           | PASS（28項目）          |
| 未タスクリンク整合  | `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`                                                                               | PASS（ALL_LINKS_EXIST） |
| Phase 11 証跡紐付け | `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/skill-create-wizard` | PASS（8/8）             |

### 実装時の苦戦箇所と解決策

| 苦戦箇所                         | 再発条件                                 | 解決策                                                                                       | 今後の標準ルール                                                                     |
| -------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Phase 11/12 依存成果物の参照漏れ | 参照資料を最小構成で記述した場合         | `phase-11-manual-test.md` / `phase-12-documentation.md` に Phase 2/5/6/7/8/9/10 成果物を追補 | Phase 11/12 は依存Phaseの成果物を参照表で明示する                                    |
| `skill:create` 契約の更新漏れ    | UI実装を先行し仕様同期を後回しにする場合 | API/IF/Security/Task の4仕様書を同ターン更新                                                 | 新規 `skill:*` 追加時は「api-ipc/interfaces/security/task-workflow」同時更新を必須化 |
| 画面証跡鮮度の不明確化           | 既存スクリーンショットを流用した場合     | 撮影スクリプトを再実行し、TC単位で8枚再生成                                                  | UI完了判定前に `screenshot:*` を必ず再実行する                                       |

#### 同種課題の簡潔解決手順（5ステップ）

1. 新規 `skill:*` チャネル追加時は `channels/preload/handler/tests` を先に同期する。
2. `task-workflow` / `api-ipc` / `interfaces` / `security` の4仕様書を同一ターンで更新する。
3. Phase 11 は TC と画像ファイルを1対1で対応づけ、`validate-phase11-screenshot-coverage` を実行する。
4. Phase 12 は依存Phase成果物を参照資料へ列挙し、`verify-all-specs` warning をゼロ化する。
5. LOGS/SKILL 履歴と index を更新して完了記録を固定する。

### Phase 12で検出した未タスク（TASK-10A-C）

| 未タスクID                                             | 概要                                                                                     | 優先度 | タスク仕様書                                                                                                    |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------- |
| UT-IMP-TASK10A-C-FIVE-SPEC-SYNC-GUARD-001              | TASK-10A-C の 5仕様書同時同期ガード（api-ipc/interfaces/security/task-workflow/lessons） | 中     | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task10a-c-five-spec-sync-guard-001.md`              |
| UT-IMP-TASK10A-C-PHASE11-SCREENSHOT-COVERAGE-GUARD-001 | TASK-10A-C Phase 11 画面証跡ガード（再撮影 + TCカバレッジ + 鮮度確認）                   | 中     | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task10a-c-phase11-screenshot-coverage-guard-001.md` |

---

## TASK-10A-D: スキルライフサイクルUI統合 実装完了記録（2026-03-03）

### タスク概要

| 項目           | 内容                                                                                                  |
| -------------- | ----------------------------------------------------------------------------------------------------- |
| タスクID       | TASK-10A-D-SKILL-LIFECYCLE-UI-INTEGRATION                                                             |
| ステータス     | **完了**                                                                                              |
| テスト         | 132テスト全PASS                                                                                       |
| 実装ファイル   | `SkillManagementPanel.tsx` / `ChatPanel.tsx` / `agentSlice.ts` / `store/index.ts`                     |
| テストファイル | `SkillManagementPanel.test.tsx` / `ChatPanel.test.tsx` / `agentSlice.test.ts` / `store/index.test.ts` |
| 参照           | `docs/30-workflows/completed-tasks/TASK-10A-D-SKILL-LIFECYCLE-UI-INTEGRATION/`                        |

### 実装内容

1. **SkillManagementPanel ビュー統合**: 「準備中」プレースホルダーをSkillAnalysisView（TASK-10A-B）とSkillCreateWizard（TASK-10A-C）に差替
2. **ChatPanel 導線追加**: スキル管理パネルへのトグルボタン追加（`data-testid="skill-management-toggle"`、`aria-expanded`、`disabled={isExecuting}`）
3. **agentSlice 拡張**: 3状態フィールド（`currentAnalysis`/`isAnalyzing`/`isImproving`）+ 5アクション + 8個別セレクタ

### 苦戦箇所と解決策

| 苦戦箇所                                                                   | 解決策                                                                                                                         |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `Suggestion`型不整合（`unknown[]` → `Suggestion[]`）                       | `@repo/shared/types/skill-improver`から正しい型をインポート                                                                    |
| P40テスト実行ディレクトリ依存                                              | テストコマンドに`cd apps/desktop &&`プレフィックスを含める                                                                     |
| PostToolUseフックによるEdit失敗                                            | 大量編集後は`git diff --stat`で変更確認（P11パターン）                                                                         |
| Phase 11 画面証跡の解釈揺れ（TC-02 と TC-05 が同じ「エラー表示」に見える） | `manual-test-result.md` に「TC-02=analysis遷移+API未接続フォールバック」「TC-05=意図的エラー状態検証」を明記し、証跡意味を分離 |

### 検証証跡

| 検証項目              | 結果                 |
| --------------------- | -------------------- |
| テスト                | 132テスト全PASS      |
| Phase 10 最終レビュー | PASS判定             |
| Phase 11 手動テスト   | 17テストケース全PASS |
| Phase 12 ドキュメント | 6成果物完了          |

### 再確認追補（2026-03-04）

| 観点               | 実施内容                                                                                                                      | 結果                                                                                               |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Phase仕様準拠      | `verify-all-specs --workflow docs/30-workflows/completed-tasks/TASK-10A-D-SKILL-LIFECYCLE-UI-INTEGRATION`                     | PASS（13/13, error=0, warning=0）                                                                  |
| Phase出力整合      | `validate-phase-output docs/30-workflows/completed-tasks/TASK-10A-D-SKILL-LIFECYCLE-UI-INTEGRATION`                           | PASS（28項目）                                                                                     |
| 画面証跡カバレッジ | `validate-phase11-screenshot-coverage --workflow docs/30-workflows/completed-tasks/TASK-10A-D-SKILL-LIFECYCLE-UI-INTEGRATION` | PASS（expected TC=5 / covered TC=5）                                                               |
| 未タスク参照整合   | `verify-unassigned-links`                                                                                                     | PASS（ALL_LINKS_EXIST 89/89）                                                                      |
| 未タスク差分監査   | `audit-unassigned-tasks --json --diff-from HEAD`                                                                              | PASS（currentViolations=0 / baselineViolations=85）                                                |
| 未タスク全体監査   | `audit-unassigned-tasks --json`                                                                                               | FAIL（currentViolations=85）。既存ベースライン負債の監視用途として記録し、今回合否判定には使わない |

### 再確認時の苦戦箇所（2026-03-04）

| 苦戦箇所                                                            | 原因                                                        | 解決策                                                                               | 今後の標準ルール                                                         |
| ------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| `audit-unassigned-tasks` の全体監査結果を今回差分FAILと誤読しやすい | `--json` 単体は baseline 監視であり、差分合否を直接表さない | `--diff-from HEAD` の `currentViolations` を合否判定に固定し、全体監査値は別枠で併記 | 未タスク監査は必ず `current`（合否）と `baseline`（監視）を2軸で記録する |
| Phase 11 証跡で「analysis遷移」と「エラー状態」の意味が混在しやすい | TC名と画像説明だけでは意図差が伝わりにくい                  | `manual-test-result.md` のTC-02/TC-05に目的差を注記し、目視確認ログを残した          | 画面証跡テーブルは「状態名 + 検証目的」をセットで記載する                |

### 再確認で追加した未タスク（2026-03-04）

| 未タスクID                                                   | 概要                                                                    | 優先度 | タスク仕様書                                                                                                          |
| ------------------------------------------------------------ | ----------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------- |
| UT-IMP-TASK10A-D-SUBAGENT-EXECUTION-LOG-GUARD-001            | Phase 12 仕様書別SubAgent実行ログ（実装内容/苦戦箇所/検証証跡）の必須化 | 中     | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task10a-d-subagent-execution-log-guard-001.md`            |
| UT-IMP-TASK10A-D-SCREENSHOT-PURPOSE-DISAMBIGUATION-GUARD-001 | Phase 11 画面証跡で状態名+検証目的を分離し、TC意図混同を防ぐ運用ガード  | 中     | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task10a-d-screenshot-purpose-disambiguation-guard-001.md` |

### 仕様書別SubAgent実行ログ（2026-03-04）

| SubAgent  | 担当仕様書                               | 反映した実装内容                                                       | 反映した苦戦箇所                                              | 証跡                                                                                                     |
| --------- | ---------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| SG-TW-01  | `references/task-workflow.md`            | TASK-10A-D の再確認証跡（13/13、28項目、TC 5/5、current=0）を追記      | `current/baseline` 誤読防止、TC-02/TC-05 証跡意図分離を台帳化 | `outputs/phase-12/spec-update-summary.md` / `outputs/phase-12/documentation-changelog.md`                |
| SG-UIF-01 | `references/ui-ux-feature-components.md` | SkillManagementPanel/ChatPanel/agentSlice の統合内容と再確認結果を同期 | 画面証跡の状態名+検証目的の明記を運用ルール化                 | `outputs/phase-11/manual-test-result.md` / `outputs/phase-11/screenshots/*.png`                          |
| SG-LL-01  | `references/lessons-learned.md`          | TASK-10A-D セクションへ再利用用の要点を整理                            | 実装時 + 再確認時の苦戦箇所を再発条件付きで追記               | `references/lessons-learned.md` 該当セクション                                                           |
| SG-SC-01  | `skill-creator` テンプレート             | SubAgent実行ログをテンプレート必須項目へ追加                           | 「仕様書ごとの反映漏れ」をテンプレートで防止                  | `assets/phase12-system-spec-retrospective-template.md` / `assets/phase12-spec-sync-subagent-template.md` |

### 同種課題の簡潔解決手順（SubAgent運用版・5ステップ）

1. 対象仕様書を確定し、`1仕様書=1SubAgent` で担当を固定する（台帳・機能仕様・教訓を最低3分割）。
2. 各SubAgentは「実装内容」と「苦戦箇所」を同一ターンで追記し、未追記列を残さない。
3. `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit --diff-from HEAD` を連続実行し、合否は `currentViolations` で判定する。
4. UIタスクではスクリーンショットを目視し、証跡表に「状態名 + 検証目的」を追記する。
5. `task-workflow.md` と `lessons-learned.md` の両方に同じ再発防止ルールを転記して完了とする。

---

## 残課題（未タスク）

以下のタスクは未実施として認識されており、タスク仕様書が作成済み。

| タスクID                                          | タスク名                                                                                                         | 優先度 | 発見元                                                                      | タスク仕様書                                                                                                                                       |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-UI-05A-SKILL-EDITOR-VIEW | SkillEditorView（仕様書作成完了 + 実装ファイル実在、統合未完了） | 高 | TASK-UI-05A Phase 1-13（spec_created） + 再監査（2026-03-02） | `docs/30-workflows/skill-editor-view/` |
| UT-UI-05A-GETFILETREE-001 | skill:getFileTree IPCチャネル追加 | CRITICAL | TASK-UI-05A FR-1前提 | `docs/30-workflows/completed-tasks/skill-editor-view-closure/unassigned-task/task-ui-05a-getfiletree-ipc-implementation.md` |
| UT-UI-05A-SPEC-CONSISTENCY-001 | Phase 2/5 useFileTree 仕様統一（filePaths vs IPC getFileTree） | 中 | TASK-UI-05A 再監査（2026-03-02） | `docs/30-workflows/completed-tasks/skill-editor-view-closure/unassigned-task/task-ui-05a-spec-consistency-filetree-contract.md` |
| UT-UI-05A-IMPLEMENTATION-CLOSURE-001 | SkillEditorView 実装残課題収束（導線/UX7件） | 高 | TASK-UI-05A Phase 11 discovered-issues + 再監査（2026-03-02） | `docs/30-workflows/completed-tasks/skill-editor-view-closure/unassigned-task/task-ui-05a-editor-view-implementation-closure.md` |
| ~~UT-TASK-10A-B-001~~ | ~~SkillAnalysisView 自動修正可能フィルタボタン実装~~ **完了: 2026-03-05** | ~~中~~ | TASK-10A-B Phase 10 MINOR M1（2026-03-02） | `docs/30-workflows/completed-tasks/ut-task-10a-b-001-autofixable-filter-button/` |
| UT-TASK-10A-B-002 | SkillAnalysisView 改善結果トースト通知実装 | 中 | TASK-10A-B Phase 10 MINOR M2（2026-03-02） | `docs/30-workflows/unassigned-task/task-10a-b-improvement-toast-notification.md` |
| ~~UT-TASK-10A-B-003~~ | ~~SkillAnalysisView 改善結果内訳表示実装~~ **完了: 2026-03-05** | ~~中~~ | TASK-10A-B Phase 10 MINOR M3（2026-03-02） | `docs/30-workflows/completed-tasks/task-10a-b-improvement-result-breakdown-ui/` |
| UT-TASK-10A-B-004 | SkillAnalysisView Props 契約整合（`skill` vs `skillName`） | 低 | TASK-10A-B Phase 10 MINOR M4（2026-03-02） | `docs/30-workflows/unassigned-task/task-10a-b-props-contract-alignment.md` |
| UT-TASK-10A-B-005 | SkillAnalysisView molecule 分割設計追補（Header/Error/Actions） | 低 | TASK-10A-B Phase 10 MINOR M5（2026-03-02） | `docs/30-workflows/unassigned-task/task-10a-b-analysis-view-molecule-separation.md` |
| UT-TASK-10A-B-006 | Phase 11 必須セクション検証ガード（統合テスト連携/完了条件） | 中 | TASK-10A-B Phase 12 再監査（苦戦箇所・2026-03-02） | `docs/30-workflows/unassigned-task/task-10a-b-phase11-required-sections-validation-guard.md` |
| UT-TASK-10A-B-007 | Phase 11 画面証跡鮮度ガード（再撮影 + 更新時刻確認） | 中 | TASK-10A-B Phase 12 再監査（苦戦箇所・2026-03-02） | `docs/30-workflows/unassigned-task/task-10a-b-phase11-screenshot-freshness-guard.md` |
| ~~UT-TASK-10A-B-008~~ | ~~未タスク件数再計算同期ガード（detection/task-workflow/ui-ux-feature）~~ **完了: 2026-03-06** | ~~中~~ | TASK-10A-B Phase 12 再監査（苦戦箇所・2026-03-02） | `docs/30-workflows/completed-tasks/ut-task-10a-b-008-unassigned-count-resync-guard/` |
| UT-TASK-10A-B-009 | 完了済みUT配置ポリシー統一ガード（3分類 + target監査境界） | 中 | UT-TASK-10A-B-001 最終再監査（苦戦箇所・2026-03-05） | `docs/30-workflows/unassigned-task/task-10a-b-completed-ut-placement-policy-guard.md` |
| UT-IMP-TASK10A-C-FIVE-SPEC-SYNC-GUARD-001 | TASK-10A-C の 5仕様書同時同期ガード（api-ipc/interfaces/security/task-workflow/lessons） | 中 | TASK-10A-C Phase 12 最終再確認（苦戦箇所・2026-03-03） | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task10a-c-five-spec-sync-guard-001.md` |
| UT-IMP-TASK10A-C-PHASE11-SCREENSHOT-COVERAGE-GUARD-001 | TASK-10A-C Phase 11 画面証跡ガード（再撮影 + TCカバレッジ + 鮮度確認） | 中 | TASK-10A-C Phase 11/12 最終再確認（苦戦箇所・2026-03-03） | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task10a-c-phase11-screenshot-coverage-guard-001.md` |
| UT-IMP-TASK10A-D-SUBAGENT-EXECUTION-LOG-GUARD-001 | Phase 12 仕様書別SubAgent実行ログ（実装内容/苦戦箇所/検証証跡）の必須化 | 中 | TASK-10A-D Phase 12 再確認（苦戦箇所・2026-03-04） | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task10a-d-subagent-execution-log-guard-001.md` |
| UT-IMP-TASK10A-D-SCREENSHOT-PURPOSE-DISAMBIGUATION-GUARD-001 | Phase 11 画面証跡の状態名+検証目的分離ガード（TC意図混同防止） | 中 | TASK-10A-D Phase 11/12 再確認（苦戦箇所・2026-03-04） | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task10a-d-screenshot-purpose-disambiguation-guard-001.md` |
| UT-IMP-TASK10A-F-PHASE11-FILENAME-EVIDENCE-SYNC-GUARD-001 | Phase 11 文書名・TC証跡同期の自動ガード | 中 | TASK-10A-F Phase 12 再確認（苦戦箇所・2026-03-07） | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task10a-f-phase11-filename-and-evidence-sync-guard-001.md` |
| UT-10A-F-SCREENSHOT-HARNESS-HARDENING | Screenshot Harness の data-testid ベース待機条件標準化 | 中 | TASK-10A-F Phase 11 実行時の苦戦箇所 #8（2026-03-08） | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/unassigned-task/task-10a-f-screenshot-harness-hardening.md` |
| UT-10A-F-2WORKFLOW-BASELINE-NORMALIZATION | 2Workflow Baseline 正規化自動化 | 中 | TASK-10A-F Phase 12 実行時の苦戦箇所 #6, #7（2026-03-08） | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/unassigned-task/task-10a-f-2workflow-baseline-normalization.md` |
| UT-UI-05-001 | CategoryId / SkillCategory 型統一 | 低 | TASK-UI-05 Phase 10 MINOR-1 | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-categoryid-skillcategory-type-unification.md` |
| UT-UI-05-002 | SkillDetailPanel 内部 Molecule 分離 | 中 | TASK-UI-05 Phase 10 MINOR-2 | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-skill-detail-panel-molecule-split.md` |
| UT-UI-05-003 | ローディングスケルトン実装 | 低 | TASK-UI-05 Phase 10 MINOR-3 | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-loading-skeleton-implementation.md` |
| UT-UI-05-004 | モバイルスワイプ閉じ実装 | 低 | TASK-UI-05 Phase 10 MINOR-4 | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-mobile-swipe-close-detail-panel.md` |
| UT-UI-05-005 | SKILL.md 全文 Markdown レンダリング | 中 | TASK-UI-05 Phase 10 MINOR-5 | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-skill-markdown-full-rendering.md` |
| UT-UI-05-006 | useFeaturedSkills 選定アルゴリズム改善 | 低 | TASK-UI-05 コードコメント TODO | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-featured-skills-algorithm-improvement.md` |
| UT-UI-05-007 | Phase 12 UI仕様同期プロファイル適用ガード | 中 | TASK-UI-05 Phase 12 再確認（苦戦箇所） | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-phase12-ui-spec-sync-guard.md` |
| UT-IMP-PHASE12-TWO-WORKFLOW-EVIDENCE-BUNDLE-001 | Phase 12 2workflow同時監査の証跡集約ガード（spec_created/completed + 画面証跡 + current/baseline 分離） | 中 | TASK-UI-05A / TASK-UI-05 Phase 12再確認（苦戦箇所・2026-03-02） | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-two-workflow-evidence-bundle-001.md` |
| UT-UI-05B-001 | Phase 12 画面証跡再取得ガード（再撮影 + 更新時刻確認の標準化） | 中 | TASK-UI-05B Phase 12 再確認（苦戦箇所・2026-03-02） | `docs/30-workflows/completed-tasks/TASK-UI-05B-SKILL-ADVANCED-VIEWS/unassigned-task/task-ui-05b-phase12-screenshot-evidence-recapture-guard.md` |
| UT-9G-001 | SkillScheduler cron 次回実行時刻の精度改善 | 中 | TASK-9G Phase 12 未タスク検出（簡易実装コメント） | `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/unassigned-task/task-skill-schedule-cron-next-run-accuracy.md` |
| UT-9G-002 | event スケジュール（file_change / git_commit）実行対応 | 低 | TASK-9G Phase 12 未タスク検出（プレースホルダー実装） | `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/unassigned-task/task-skill-schedule-event-trigger-completion.md` |
| UT-9G-003 | スケジュール実行通知（sendNotification）実装 | 中 | TASK-9G Phase 12 未タスク検出（NotificationSettings未接続） | `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/unassigned-task/task-skill-schedule-notification-dispatch.md` |
| UT-9G-004 | SkillScheduler graceful shutdown 実装 | 低 | TASK-9G Phase 12 未タスク検出（終了時クリーンアップ未実装） | `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/unassigned-task/task-skill-schedule-graceful-shutdown.md` |
| UT-9G-005 | スケジュール実行結果の Renderer push 通知追加 | 低 | TASK-9G Phase 12 未タスク検出（Main→Renderer push未実装） | `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/unassigned-task/task-skill-schedule-execution-push-event.md` |
| UT-9I-001 | SkillDocGenerator の LLM プロバイダ連携実装 | 中 | TASK-9I Phase 12 未タスク検出（stubQueryFn 暫定実装） | `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/unassigned-task/task-ut-9i-001-llm-provider-integration.md` |
| UT-9I-002 | ドキュメントテンプレート CRUD 機能実装 | 低 | TASK-9I Phase 12 未タスク検出（DEFAULT_DOC_TEMPLATE 固定） | `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/unassigned-task/task-ut-9i-002-template-crud.md` |
| UT-IMP-PHASE12-EVIDENCE-LINK-GUARD-001 | Phase 12 再確認証跡テーブル・未タスクリンク整合ガード | 中 | TASK-9I Phase 12 再確認（苦戦箇所抽出・2026-02-28） | `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/unassigned-task/task-imp-phase12-evidence-link-guard-001.md` |
| UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001 | Phase 12 仕様書別SubAgent N/A判定ログガード | 中 | TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001 Phase 12 実行監査（苦戦箇所抽出・2026-02-28） | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-subagent-na-log-guard-001.md` |
| UT-UI-03-A11Y-RADIOGROUP-001 | SkillChip群コンテナに role="radiogroup" 追加 | 低 | TASK-UI-03 Phase 10 MINOR #1（2026-03-07） | `docs/30-workflows/completed-tasks/unassigned-task/task-ut-ui-03-a11y-radiogroup-001.md` |
| UT-UI-03-A11Y-DIALOG-001 | AdvancedSettingsPanel に role="dialog" 追加 | 低 | TASK-UI-03 Phase 10 MINOR #2（2026-03-07） | `docs/30-workflows/completed-tasks/unassigned-task/task-ut-ui-03-a11y-dialog-001.md` |
| UT-UI-03-A11Y-LABEL-001 | 停止ボタン aria-label 不一致修正 | 低 | TASK-UI-03 Phase 10 MINOR #3（2026-03-07） | `docs/30-workflows/completed-tasks/unassigned-task/task-ut-ui-03-a11y-label-001.md` |
| UT-UI-03-TYPE-ASSERTION-001 | as unknown as Skill[] 型アサーション解消 | 低 | TASK-UI-03 Phase 10 MINOR #4（P24派生・2026-03-07） | `docs/30-workflows/completed-tasks/unassigned-task/task-ut-ui-03-type-assertion-001.md` |
| UT-UI-03-PHASE11-SCREENSHOT-COVERAGE-001 | Phase 11証跡表のTC網羅不足を解消（TC-02/03/04/05/07/10追補 + validator PASS化） | 中 | TASK-UI-03 Phase 11 再検証（2026-03-07） | `docs/30-workflows/completed-tasks/unassigned-task/task-ut-ui-03-phase11-screenshot-coverage-001.md` |
| ~~TASK-9A-C~~                                         | ~~SkillEditor UI（仕様書作成済み・実装未着手）~~ **完了: 2026-02-26（TASK-9Aへ統合）**                                                                     | ~~高~~     | ~~TASK-9A-SKILL-EDITOR Phase 1（UI仕様書作成完了）~~                            | `docs/30-workflows/completed-tasks/TASK-9A-skill-editor/` |
| TASK-FIX-14-2-SKILLEXECUTOR-CONSOLE-LOG-MIGRATION | SkillExecutor の console ログを electron-log に移行                                                              | 低     | TASK-FIX-14-1-CONSOLE-LOG-MIGRATION Phase 12（スコープ外項目）              | `docs/30-workflows/completed-tasks/task-fix-14-2-skillexecutor-console-log-migration.md`                                                           |
| ~~UT-IMP-IPC-PRELOAD-EXTENSION-SPEC-ALIGNMENT-001~~   | ~~UT-SKILL-IPC-PRELOAD-EXTENSION-001で検出した仕様差分（参照切れ/パス差分/命名差分）の統合是正~~                   | ~~中~~     | **2026-02-25完了** UT-SKILL-IPC-PRELOAD-EXTENSION-001 Phase 10/12（Open Item）                 | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-013-ut-imp-ipc-preload-extension-spec-alignment-001.md`                                                          |
| TASK-3-1-B                                        | SkillExecutor IPC Handler統合                                                                                    | 高     | TASK-3-1-A完了時（blocks）                                                  | `docs/30-workflows/unassigned-task/task-3-1-B-skillexecutor-ipc-integration.md`                                                                    |
| TASK-SKILL-PERF-TEST                              | SkillExecutor パフォーマンステスト                                                                               | 低     | TASK-3-1-A Phase 11推奨事項                                                 | `docs/30-workflows/unassigned-task/task-skillexecutor-performance-testing.md`                                                                      |
| SKILL-E2E-001                                     | スキルインポートE2Eテスト                                                                                        | 中     | Phase 11（手動テスト検証）推奨事項                                          | `docs/30-workflows/unassigned-task/task-skill-import-e2e-testing.md`                                                                               |
| TSC-AUTOMATION-001                                | Phase 12自動化スクリプト拡充                                                                                     | 低     | skill-import-persistence-bugfix実施時                                       | `docs/30-workflows/unassigned-task/task-phase12-automation-enhancement.md`                                                                         |
| UT-008                                            | Chat History UI Components                                                                                       | 中     | Phase 12（UT-006完了後の後続タスク）                                        | `docs/30-workflows/unassigned-task/task-chat-history-ui-components.md`                                                                             |
| UT-009                                            | Chat History Additional Use Cases                                                                                | 中     | Phase 12（api-chat-history.md 未実装Use Cases）                             | `docs/30-workflows/unassigned-task/task-chat-history-additional-usecases.md`                                                                       |
| task-imp-skillselector-onimportrequest-001        | SkillSelector onImportRequest改善                                                                                | 中     | TASK-7D実施中に発見                                                         | `docs/30-workflows/unassigned-task/task-imp-skillselector-onimportrequest-improvements.md`                                                         |
| task-imp-chatpanel-new-design-001                 | ChatPanel新デザイン改善                                                                                          | 中     | TASK-7D実施中に発見                                                         | `docs/30-workflows/unassigned-task/task-imp-chatpanel-new-design-improvements.md`                                                                  |
| task-chatedit-store-integration-001               | chatEditSlice Store統合                                                                                          | 中     | システム仕様書分析（arch-state-management.md）                              | `docs/30-workflows/unassigned-task/task-chatedit-slice-store-integration.md`                                                                       |
| task-rag-largefile-perf-001                       | RAG変換 大容量ファイルパフォーマンス検証                                                                         | 中     | システム仕様書分析（quality-requirements.md）                               | `docs/30-workflows/unassigned-task/task-rag-converter-largefile-performance.md`                                                                    |
| TASK-CHUNK-API-001                                | Chunk Search APIレイヤー実装                                                                                     | 中     | api-internal-chunk-search.md（未実装レイヤー）                              | `docs/30-workflows/unassigned-task/task-imp-chunk-search-api-layers.md`                                                                            |
| TASK-DOM-NESTING-001                              | validateDOMNesting警告修正                                                                                       | 低     | ui-history-integration.md（残課題）                                         | `docs/30-workflows/unassigned-task/task-validate-dom-nesting-bugfix.md`                                                                            |
| UT-RETRY-001                                      | リトライ設定UI                                                                                                   | 低     | TASK-SKILL-RETRY-001 Phase 12                                               | `docs/30-workflows/unassigned-task/task-retry-settings-ui.md`                                                                                      |
| UT-RETRY-002                                      | リトライ履歴永続化                                                                                               | 低     | TASK-SKILL-RETRY-001 Phase 12                                               | `docs/30-workflows/unassigned-task/task-retry-history-persistence.md`                                                                              |
| UT-RETRY-003                                      | サーキットブレーカーパターン導入                                                                                 | 中     | TASK-SKILL-RETRY-001 Phase 11 + error-handling.md                           | `docs/30-workflows/unassigned-task/task-circuit-breaker-pattern.md`                                                                                |
| UT-RETRY-004                                      | リトライイベントRenderer表示                                                                                     | 中     | TASK-SKILL-RETRY-001 Phase 11                                               | `docs/30-workflows/unassigned-task/task-use-skill-execution-retry-events.md`                                                                       |
| UT-RETRY-005                                      | リトライ型定義shared package移行                                                                                 | 低     | TASK-SKILL-RETRY-001 Phase 5                                                | `docs/30-workflows/unassigned-task/task-retry-types-shared-migration.md`                                                                           |
| CONV-DEBT-001                                     | PlainTextConverter実装                                                                                           | 中     | interfaces-converter.md / architecture-file-conversion.md                   | `docs/30-workflows/unassigned-task/task-plaintext-converter.md`                                                                                    |
| UT-VECTOR-001                                     | ベクトル検索フィルター拡張                                                                                       | 低     | rag-vector-search.md 未対応フィルター                                       | `docs/30-workflows/unassigned-task/task-vector-search-advanced-filters.md`                                                                         |
| task-imp-ipc-imp002-channels-001                  | IMP-002チャネル本体実装（settings/permissions/cache）                                                            | 中     | TASK-8C-A Phase 12（IPC統合テスト）                                         | `docs/30-workflows/unassigned-task/task-imp-ipc-imp002-channels.md`                                                                                |
| task-imp-ipc-permission-response-001              | skill:permission:response チャネル実装                                                                           | 低     | TASK-8C-A Phase 12（IPC統合テスト）                                         | `docs/30-workflows/unassigned-task/task-imp-ipc-permission-response.md`                                                                            |
| task-ref-quality-requirements-split-001           | quality-requirements.md仕様書分割                                                                                | 低     | TASK-OPT-CI-TEST-PARALLEL-001 Phase 12（テンプレート準拠確認）              | `docs/30-workflows/unassigned-task/task-ref-quality-requirements-split-001.md`                                                                     |
| task-e2e-permission-waitfortimeout-001            | E2E権限テスト waitForTimeout改善                                                                                 | 低     | TASK-8C-D Phase 10（TQ-M1指摘）                                             | `docs/30-workflows/unassigned-task/task-e2e-permission-waitfortimeout-refactoring.md`                                                              |
| task-e2e-test-readme-documentation-001            | READMEへのE2Eテスト実行方法追加                                                                                  | 低     | TASK-8C-D Phase 9（DOC-M1指摘）                                             | `docs/30-workflows/unassigned-task/task-e2e-test-readme-documentation.md`                                                                          |
| ~~TASK-9B-H~~                                     | ~~SkillCreatorService IPC通信設定~~                                                                              | ~~高~~ | **2026-02-12完了** TASK-9B-H-SKILL-CREATOR-IPC                              | `docs/30-workflows/completed-tasks/skill-creator-ipc/`                                                                                            |
| UI-INTEGRATION-9B                                 | SkillCreator UI統合（TASK-10A連携）                                                                              | 高     | TASK-9B-G Phase 12（UI未実装）                                              | `docs/30-workflows/unassigned-task/task-9b-ui-integration-task10a.md`                                                                              |
| ~~TASK-9B-I~~                                     | ~~Claude Agent SDK本格統合~~                                                                                     | ~~中~~ | ~~TASK-9B-G Phase 3（推奨事項）~~                                           | ~~`docs/30-workflows/unassigned-task/task-9b-i-skill-creator-sdk-integration.md`~~ **2026-02-12完了**                                              |
| TASK-9B-J                                         | ResourceLoaderキャッシュ無効化                                                                                   | 低     | TASK-9B-G Phase 3（推奨事項）                                               | `docs/30-workflows/unassigned-task/task-9b-j-skill-creator-cache-invalidation.md`                                                                  |
| TASK-9B-K                                         | タイムアウト設定の外部化                                                                                         | 低     | TASK-9B-G Phase 3（推奨事項）                                               | `docs/30-workflows/unassigned-task/task-9b-k-skill-creator-timeout-config.md`                                                                      |
| ~~UT-IMP-TASK9B-SPEC-CONTRACT-GUARD-001~~        | ~~TASK-9B 仕様契約再監査ガード強化（13ch同期/P42 create/current-baseline判定）~~                                 | ~~中~~ | **2026-02-26完了** TASK-9B 再監査 Phase 12（実装苦戦箇所・2026-02-26）      | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task9b-spec-contract-guard-001.md`                                                                     |
| TASK-10A-UI-SKILL-IMPROVE                         | スキル改善UI表示機能                                                                                             | 中     | TASK-9C Phase 11（手動テスト発見）                                          | `docs/30-workflows/unassigned-task/task-10a-ui-skill-improve.md`                                                                                   |
| TASK-10B-IMPROVE-HISTORY                          | 改善履歴の永続化                                                                                                 | 低     | TASK-9C Phase 12（スコープ外候補）                                          | `docs/30-workflows/unassigned-task/task-10b-improve-history.md`                                                                                    |
| TASK-10C-AB-TEST                                  | A/Bテスト実行・結果比較機能                                                                                      | 低     | TASK-9C Phase 12（スコープ外候補）                                          | `docs/30-workflows/unassigned-task/task-10c-ab-test.md`                                                                                            |
| task-imp-phase12-validation-001                   | Phase 12ドキュメント更新自動検証ツール                                                                           | 中     | AUTH-UI-004 Phase 12（ドキュメント更新漏れ）                                | `docs/30-workflows/unassigned-task/task-phase12-doc-validation-tool.md`                                                                            |
| UT-9F-SETTER-INJECTION-001                        | SkillShareManager の Setter Injection 実装                                                                        | 中     | TASK-9F Phase 10（MINOR-01）                                                | `docs/30-workflows/completed-tasks/skill-share/unassigned-task/task-9f-setter-injection-refactoring.md`                                                                       |
| UT-9F-STRATEGY-REFACTOR-001                       | SkillShareManager の Strategy パターン分離                                                                        | 低     | TASK-9F Phase 10（MINOR-02）                                                | `docs/30-workflows/completed-tasks/skill-share/unassigned-task/task-9f-strategy-pattern-refactoring.md`                                                                       |
| UT-9F-VALIDATE-IMPORT-001                         | `validateImport(skillPath)` 公開メソッド実装                                                                     | 中     | TASK-9F Phase 10（MINOR-03）                                                | `docs/30-workflows/completed-tasks/skill-share/unassigned-task/task-9f-validate-import-improvements.md`                                                                       |
| UT-9F-ERROR-SANITIZE-001                          | エラーメッセージのパス情報サニタイズ                                                                             | 中     | TASK-9F Phase 10（MINOR-04）                                                | `docs/30-workflows/completed-tasks/skill-share/unassigned-task/task-9f-error-sanitize-security.md`                                                                            |
| UT-9F-EXPORT-PATH-TRAVERSAL-001                   | `exportToLocal` のパストラバーサル検証追加                                                                       | 高     | TASK-9F Phase 10（MINOR-05）                                                | `docs/30-workflows/completed-tasks/skill-share/unassigned-task/task-9f-export-path-traversal-security.md`                                                                     |
| UT-9F-DISCRIMINATED-UNION-001                     | `ShareTarget` の Discriminated Union 化                                                                          | 低     | TASK-9F Phase 10（MINOR-06）                                                | `docs/30-workflows/completed-tasks/skill-share/unassigned-task/task-9f-sharetarget-discriminated-union-refactoring.md`                                                       |
| UT-AUTH-001                                       | profileHandlers.test.ts IPCハンドラモック環境修正                                                                | 低     | AUTH-UI-001 Phase 5（テスト環境問題）                                       | `docs/30-workflows/unassigned-task/ut-auth-001-profilehandlers-test-fix.md`                                                                        |
| task-search-scope-folder-001                      | 検索スコープ指定機能                                                                                             | 中     | task-imp-search-ui-001 Phase 12（将来拡張候補）                             | `docs/30-workflows/unassigned-task/task-search-scope-folder.md`                                                                                    |
| task-search-multifile-replace-001                 | マルチファイル一括置換機能                                                                                       | 中     | task-imp-search-ui-001 Phase 12（将来拡張候補）                             | `docs/30-workflows/unassigned-task/task-search-multifile-replace.md`                                                                               |
| UT-ENV-001                                        | CI node-versionの.nvmrc参照化                                                                                    | 低     | ENV-INFRA-001 Phase 3レビュー                                               | `docs/30-workflows/unassigned-task/task-ut-env-001-ci-nvmrc.md`                                                                                    |
| UT-FIX-5-1-001                                    | AgentView型アサーション解消（ImportedSkill→Skill）                                                               | 低     | TASK-FIX-5-1-SKILL-API-UNIFICATION Phase 10（MINOR指摘）                    | `docs/30-workflows/completed-tasks/task-ut-fix-5-1-001-agentview-type-assertion.md`                                                                |
| UT-OFFLINE-REFRESH-001                            | オフライン時リフレッシュ失敗処理                                                                                 | 中     | TASK-AUTH-SESSION-REFRESH-001 Phase 12（スコープ外項目）                    | `docs/30-workflows/unassigned-task/task-offline-refresh.md`                                                                                        |
| UT-AUDIT-001                                      | 認証イベント監査ログ                                                                                             | 中     | TASK-AUTH-SESSION-REFRESH-001 Phase 12（スコープ外項目）                    | `docs/30-workflows/unassigned-task/task-auth-audit-logging.md`                                                                                     |
| UT-REFRESH-NOTIFICATION-001                       | セッションリフレッシュ通知UI                                                                                     | 低     | TASK-AUTH-SESSION-REFRESH-001 Phase 12（スコープ外項目）                    | `docs/30-workflows/unassigned-task/task-refresh-notification.md`                                                                                   |
| UT-SEC-001                                        | OAuth プロバイダー自動検出機能（consumeState→validate置換）                                                      | 低     | DEBT-SEC-001 Phase 12（設計乖離検出）                                       | `docs/30-workflows/unassigned-task/task-auth-provider-detection.md`                                                                                |
| task-sec-auth-state-cleanup-001                   | State Map定期クリーンアップ実装                                                                                  | 低     | DEBT-SEC-001 Phase 12（既知制約検出）                                       | `docs/30-workflows/unassigned-task/task-auth-state-cleanup-scheduling.md`                                                                          |
| UT-PROTOCOL-URL-001                               | カスタムプロトコルURLパース標準ユーティリティ整備                                                                | 中     | TASK-AUTH-CALLBACK-001 Phase 12（苦戦箇所検出）                             | `docs/30-workflows/unassigned-task/task-protocol-url-parsing-utility.md`                                                                           |
| ~~UT-IMP-AUTH-CALLBACK-LIFECYCLE-CONTRACT-GUARD-001~~ | ~~authCallbackServer wait/stop 責務境界の契約ガード（timeout副作用禁止・stop冪等性）~~                              | ~~中~~     | **2026-02-28完了** TASK-FIX-AUTH-CALLBACK-SERVER-WORKER-EXIT-001 Phase 12（完了移管）      | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-auth-callback-lifecycle-contract-guard-001.md`                                                        |
| UT-FIX-5-2                                        | Preload Dialog API ハードコード削除                                                                              | 中     | TASK-FIX-5-1 Phase 10                                                       | `docs/30-workflows/unassigned-task/task-ut-fix-5-2-preload-dialog-hardcode.md`                                                                     |
| ~~UT-FIX-5-3~~                                    | ~~Preload Agent Abort セキュリティ修正~~                                                                         | ~~高~~ | ~~TASK-FIX-5-1 Phase 10~~                                                   | ~~`docs/30-workflows/completed-tasks/task-ut-fix-5-3-preload-agent-abort.md`~~ **2026-02-10完了**                                                  |
| TASK-FIX-12-2-IPC-HARDCODE-FIX-UPDATER-AGENT      | Updater/AgentHandler IPC チャネル名定数化                                                                        | 低     | TASK-FIX-12-1 Phase 12                                                      | `docs/30-workflows/unassigned-task/task-fix-12-2-ipc-hardcode-fix-updater-agent.md`                                                                |
| TASK-DOC-PHASE12-JUDGMENT-CRITERIA-001            | Phase 12判断基準の明確化と漏れ防止強化                                                                           | 低     | TASK-FIX-6-1-STATE-CENTRALIZATION Phase 12                                  | `docs/30-workflows/unassigned-task/task-doc-phase12-judgment-criteria-improvement.md`                                                              |
| ~~UT-FIX-5-4~~                                    | ~~AgentSDKAPI 型定義不一致修正~~                                                                                 | ~~低~~ | ~~UT-FIX-5-3 Phase 12 アーキテクチャ検証~~                                  | ~~`docs/30-workflows/completed-tasks/UT-FIX-5-4-AGENT-SDK-API-TYPE-MISMATCH/index.md`~~ **2026-02-10完了**                                         |
| ~~UT-STORE-HOOKS-REFACTOR-001~~                   | ~~Store Hooksを個別セレクタベースに再設計~~                                                                      | ~~中~~ | ~~TASK-UT-AUTH-MODE-UI-INTEGRATION タスク仕様書 セクション8~~               | ~~`docs/30-workflows/completed-tasks/UT-STORE-HOOKS-REFACTOR-001/index.md`~~ **2026-02-12完了（UT-STORE-HOOKS-COMPONENT-MIGRATION-001で実施）**    |
| UT-STORE-HOOKS-REFACTOR-002                       | 状態セレクタのJSDoc追加                                                                                          | 低     | UT-STORE-HOOKS-REFACTOR-001 Phase 10最終レビュー                            | `docs/30-workflows/completed-tasks/task-ut-store-hooks-refactor-002-jsdoc.md`                                                                      |
| UT-STORE-HOOKS-REFACTOR-003                       | 合成Hookを使用しているコンポーネントの段階的移行                                                                 | 中     | UT-STORE-HOOKS-REFACTOR-001 Phase 10最終レビュー                            | `docs/30-workflows/completed-tasks/task-ut-store-hooks-refactor-003-migration.md`                                                                  |
| UT-FIX-APP-INITAUTH-CHECK-001                     | App.tsxのinitializeAuth確認                                                                                      | 低     | TASK-UT-AUTH-MODE-UI-INTEGRATION Phase 10 MINOR指摘                         | `docs/30-workflows/completed-tasks/task-ut-fix-app-initauth-check.md`                                                                              |
| UT-FIX-7-1-001                                    | SkillService型アサーション→型ガード改善                                                                          | 低     | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION Phase 12                              | `docs/30-workflows/unassigned-task/task-ut-fix-7-1-001-skillservice-type-guard.md`                                                                 |
| UT-FIX-7-1-002                                    | skillHandlers.ts機能別分割                                                                                       | 低     | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION Phase 12                              | `docs/30-workflows/unassigned-task/task-ut-fix-7-1-002-skillhandlers-split.md`                                                                     |
| UT-FIX-7-1-003                                    | IPCレスポンスパターン統一                                                                                        | 低     | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION Phase 12                              | `docs/30-workflows/unassigned-task/task-ut-fix-7-1-003-ipc-response-pattern-unification.md`                                                        |
| UT-9B-H-001                                       | IpcResult型の重複定義を@repo/sharedに統一。UT-9B-H-003教訓反映済み（L3型整合性、Prettier干渉リスク）             | 低     | TASK-9B-H-SKILL-CREATOR-IPC Phase 10 m-01                                   | `docs/30-workflows/unassigned-task/task-9b-h-ipcresult-type-unification.md`                                                                        |
| UT-9B-H-002                                       | SkillCreator IPCハンドラーの引数検証をZodスキーマに移行。UT-9B-H-003教訓反映済み（Zodセキュリティ共存設計）      | 低     | TASK-9B-H-SKILL-CREATOR-IPC Phase 10 m-02                                   | `docs/30-workflows/unassigned-task/task-9b-h-zod-schema-migration.md`                                                                              |
| ~~UT-9B-H-003~~                                   | ~~SkillCreator IPCセキュリティ強化（パストラバーサル対策、sanitizeError、schemaNameホワイトリスト）~~            | ~~高~~ | ~~TASK-9B-H-SKILL-CREATOR-IPC 最終品質レビュー~~                            | ~~`docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/index.md`~~ **2026-02-12完了（UT-9B-H-003-security-hardeningで実施）** |
| UT-9B-H-004                                       | SkillCreator設計書-実装整合性修正（Zod/型/メソッド名の乖離対応）。UT-9B-H-003教訓反映済み（TDDトレーサビリティ） | 中     | TASK-9B-H-SKILL-CREATOR-IPC 最終品質レビュー                                | `docs/30-workflows/unassigned-task/task-9b-h-design-implementation-alignment.md`                                                                   |
| UT-9B-H-005                                       | Preload API二重公開パターン統一。UT-9B-H-003教訓反映済み（L3横展開評価）                                         | 低     | TASK-9B-H Phase 10 M-02 / Phase 11 D-3                                      | `docs/30-workflows/unassigned-task/task-9b-h-api-dual-publishing-unification.md`                                                                   |
| task-imp-store-hooks-remaining-migration          | 残コンポーネントの個別セレクタHook移行                                                                           | 低     | UT-STORE-HOOKS-COMPONENT-MIGRATION-001 Phase 12（スコープ外項目）           | `docs/30-workflows/unassigned-task/task-imp-store-hooks-remaining-migration.md`                                                                    |
| task-ref-store-hooks-deprecate-composite          | 合成Store Hookの非推奨化・段階的削除                                                                             | 低     | UT-STORE-HOOKS-COMPONENT-MIGRATION-001 Phase 12（スコープ外項目）           | `docs/30-workflows/unassigned-task/task-ref-store-hooks-deprecate-composite.md`                                                                    |
| task-imp-phase12-auto-verification                | Phase 12チェックリスト自動検証スクリプト                                                                         | 中     | UT-STORE-HOOKS-COMPONENT-MIGRATION-001 Phase 12（実装苦戦箇所）             | `docs/30-workflows/unassigned-task/task-imp-phase12-auto-verification.md`                                                                          |
| ~~UT-9B-I-001~~                                   | ~~カスタム型宣言ファイルと SDK 実型の共存整理~~                                                                  | ~~低~~ | ~~TASK-9B-I-SDK-FORMAL-INTEGRATION Phase 12（未タスク検出）~~               | ~~`docs/30-workflows/completed-tasks/sdk-formal-integration/outputs/phase-12/ut-9b-i-001-custom-declare-module-cleanup.md`~~ **完了タスクに移動**  |
| UT-TEST-EVENT-STANDARDIZATION-001                 | テストイベントAPI標準化（happy-dom環境fireEvent統一）                                                            | 中     | UT-FIX-AGENTVIEW-INFINITE-LOOP-001 Phase 12（P39/P40教訓）                  | `docs/30-workflows/unassigned-task/task-ut-test-event-standardization.md`                                                                          |
| UT-SETTINGSVIEW-INLINE-SELECTOR-001               | SettingsView残存インラインセレクタの個別セレクタ移行                                                             | 低     | UT-FIX-AGENTVIEW-INFINITE-LOOP-001 Phase 10（MINOR #2）                     | `docs/30-workflows/unassigned-task/task-ut-settingsview-inline-selector-migration.md`                                                              |
| task-imp-vitest-mock-reset-utility-001            | Vitest モック2段階リセットユーティリティ共通化                                                                   | 中     | TASK-FIX-11-1-SDK-TEST-ENABLEMENT Phase 5（実装苦戦箇所）                   | `docs/30-workflows/unassigned-task/task-imp-vitest-mock-reset-utility-001.md`                                                                      |
| task-ref-vitest-module-mock-audit-001             | Vitest モジュールレベルモック監査・使い分けガイドライン策定                                                      | 低     | TASK-FIX-11-1-SDK-TEST-ENABLEMENT Phase 5（実装苦戦箇所）                   | `docs/30-workflows/unassigned-task/task-ref-vitest-module-mock-audit-001.md`                                                                       |
| task-imp-vitest-alias-sync-automation-001         | Vitest alias 設定と `@repo/shared` エクスポート整合の自動検証                                                    | 中     | TASK-FIX-10-1-VITEST-ERROR-HANDLING Phase 8（スコープ外項目）               | `docs/30-workflows/unassigned-task/task-imp-vitest-alias-sync-automation-001.md`                                                                   |
| ~~UT-FIX-TS-VITEST-TSCONFIG-PATHS-001~~            | ~~Vitest alias と tsconfig paths の同期自動化。vite-tsconfig-pathsプラグイン導入で27個の手動alias削除、6つの双方向チェックCIガード。60テスト全PASS~~ | ~~中~~ | ~~TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 Phase 3（MINOR 指摘）~~          | ~~`docs/30-workflows/completed-tasks/task-vitest-tsconfig-paths-sync-automation.md`~~ **2026-02-24完了（実装: `docs/30-workflows/vitest-tsconfig-paths-sync/`）**                                                                  |
| UT-PERF-001                                       | グラフユーティリティ性能ベンチマーク基準再設計                                                                   | 中     | TODO検出: `packages/shared/src/types/rag/graph/__tests__/utils.test.ts:791` | `docs/30-workflows/unassigned-task/task-ut-perf-001-graph-utils-performance-benchmark.md`                                                          |
| UT-TYPE-DATETIME-DOC-001                          | 型日時表現のガイドライン策定とドキュメント化                                                                     | 低     | TASK-FIX-13-1-DEPRECATED-PROPERTY-MIGRATION Phase 12                        | `docs/30-workflows/unassigned-task/task-ut-type-datetime-doc-001-datetime-representation-guide.md`                                                 |
| ~~UT-FIX-IPC-RESPONSE-UNWRAP-001~~                | ~~IPC レスポンスラッパー未展開修正（importedSkills.forEach クラッシュ）~~                                        | ~~高~~ | ~~ランタイムエラー調査（2026-02-13）~~                                      | ~~`docs/30-workflows/completed-tasks/task-ut-fix-ipc-response-unwrap-001.md`~~ **2026-02-14完了**                                                  |
| UT-FIX-IPC-RESPONSE-UNWRAP-002                    | Phase 10仕様書 `import()` 記載整合                                                                               | 低     | UT-FIX-IPC-RESPONSE-UNWRAP-001 Phase 10（MINOR M-1）                        | `docs/30-workflows/unassigned-task/task-ut-fix-ipc-response-unwrap-002-phase10-spec-alignment.md`                                                  |
| UT-FIX-IPC-RESPONSE-UNWRAP-003                    | `safeInvokeUnwrap` 型アサーション削減                                                                            | 低     | UT-FIX-IPC-RESPONSE-UNWRAP-001 Phase 10（MINOR M-2）                        | `docs/30-workflows/unassigned-task/task-ut-fix-ipc-response-unwrap-003-safeinvokeunwrap-type-guard.md`                                             |
| ~~UT-FIX-IPC-HANDLER-DOUBLE-REG-001~~             | ~~IPC ハンドラ二重登録防止修正（activate イベント）~~                                                            | ~~高~~ | ~~ランタイムエラー調査（2026-02-13）~~                                      | ~~`docs/30-workflows/completed-tasks/task-ut-fix-ipc-handler-double-reg-001.md`~~ **2026-02-14完了**                                               |
| task-sec-ipc-lifecycle-audit-001                  | Electron ライフサイクルイベント IPC リスナー管理監査                                                             | 中     | UT-FIX-IPC-HANDLER-DOUBLE-REG-001 Phase 12（実装苦戦箇所）                  | `docs/30-workflows/unassigned-task/task-sec-ipc-lifecycle-audit-001.md`                                                                            |
| task-imp-ipc-registration-verify-001              | IPC ハンドラ登録整合性自動検証テスト                                                                             | 中     | UT-FIX-IPC-HANDLER-DOUBLE-REG-001 Phase 12（実装苦戦箇所）                  | `docs/30-workflows/unassigned-task/task-imp-ipc-registration-verify-001.md`                                                                        |
| UT-9A-B-001                                       | IPC入力バリデーション標準化                                                                                      | 中     | TASK-9A-B Phase 12（未タスク検出）                                          | `docs/30-workflows/unassigned-task/task-ipc-validation-standardize-improvements.md`                                                |
| UT-9A-B-002                                       | IPCエラーサニタイズ共通ユーティリティ化                                                                          | 中     | TASK-9A-B Phase 12（未タスク検出）                                          | `docs/30-workflows/unassigned-task/task-ipc-error-sanitize-refactoring.md`                                                         |
| UT-9A-B-003                                       | IPCテストhandlerMapモックユーティリティ共通化                                                                    | 低     | TASK-9A-B Phase 12（未タスク検出）                                          | `docs/30-workflows/unassigned-task/task-ipc-test-mock-utils-improvements.md`                                                       |
| ~~UT-FIX-SKILL-IMPORT-INTERFACE-001~~             | ~~skill:import IPCインターフェース不整合修正~~                                                                   | ~~高~~ | ~~開発実行時ランタイムエラー（2026-02-20）~~                                | ~~[00-ut-fix-skill-import-interface-001.md](../../../../docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-ut-fix-skill-import-interface-001.md)~~ **2026-02-21完了**   |
| ~~UT-FIX-SKILL-REMOVE-INTERFACE-001~~             | ~~skill:remove IPCインターフェース不整合修正~~                                                                   | ~~高~~ | ~~UT-FIX-SKILL-IMPORT-INTERFACE-001 水平思考（2026-02-20）~~                | ~~[00-ut-fix-skill-remove-interface-001.md](../../../../docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-ut-fix-skill-remove-interface-001.md)~~ **2026-02-20完了** |
| ~~UT-FIX-SKILL-VALIDATION-P42-001~~               | ~~skillHandlers P42準拠バリデーション横展開~~                                                                      | ~~中~~ | ~~UT-FIX-SKILL-REMOVE-INTERFACE-001 実装時検出（2026-02-20）~~ **完了: 2026-02-24（UT-FIX-SKILL-VALIDATION-CONSISTENCY-001で実施）** | `docs/30-workflows/completed-tasks/skill-validation-consistency/` |
| UT-FIX-SKILL-IPC-ERROR-RESPONSE-001               | skillHandlers IPCバリデーションエラー応答パターン統一                                                             | 中     | UT-FIX-SKILL-REMOVE-INTERFACE-001 実装時検出（2026-02-20）                  | `docs/30-workflows/unassigned-task/task-ipc-skill-error-response-unification.md`                                                                   |
| TASK-9A-C-001                                     | SkillCodeEditor シンタックスハイライト機能                                                                        | 中     | TASK-9A-C Phase 1（将来拡張ポイント: language prop）                        | `docs/30-workflows/unassigned-task/task-9a-c-syntax-highlighting.md`                                                                               |
| ~~TASK-9A-C-002~~                                     | ~~SkillEditor ファイル作成・削除機能（CRUD完全化）~~ **完了: 2026-02-26（TASK-9Aへ統合）**                                                                 | ~~中~~     | ~~TASK-9A-C Phase 1-2（スコープ外: readFile/writeFileのみ実装）~~               | `docs/30-workflows/completed-tasks/unassigned-task/task-9a-c-file-crud-operations.md`                                                                              |
| TASK-9A-C-003                                     | SkillCodeEditor Monaco/CodeMirror エディタ移行                                                                   | 低     | TASK-9A-C Phase 2（将来拡張ポイント: textarea→高機能エディタ）              | `docs/30-workflows/unassigned-task/task-9a-c-code-editor-migration.md`                                                                             |
| ~~TASK-9A-C-004~~                                     | ~~SkillEditor Phase 12仕様同期ガード自動化（Part 1/2要件・監査判定・未タスクフォーマットの再発防止）~~ **完了: 2026-02-26（Phase 12完了に伴いcompletedへ移管）**               | ~~中~~     | ~~TASK-9A Phase 12再確認（苦戦箇所抽出: 2026-02-26）~~                           | `docs/30-workflows/completed-tasks/unassigned-task/task-9a-c-phase12-spec-sync-guard.md`                                                                          |
| TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001         | @repo/shared ソース構造二重性の統一（types/ と src/types/ の整理）                                               | 中     | TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 Phase 5                            | `docs/30-workflows/unassigned-task/task-refactor-shared-source-structure-consolidation.md`                                          |
| ~~TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001~~       | ~~@repo/shared モジュール解決3層整合CIガード~~                                                                   | ~~高~~ | ~~TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 Phase 10 MINOR~~ **完了: 2026-02-22** | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/`                                                                                       |
| ~~UT-FIX-SKILL-IMPORT-RETURN-TYPE-001~~            | ~~skill:import IPCハンドラ戻り値型不整合修正（ImportResult→ImportedSkill変換）~~                                 | ~~高~~ | ~~20フレームワーク多角的分析（2026-02-21）~~ **完了: 2026-02-21**           | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-task-ut-fix-skill-import-return-type-001.md`                                   |
| UT-FIX-SKILL-IPC-NAMING-P45-001                   | skillHandlers IPC引数命名統一（skillId → skillName横展開）                                                        | 中     | UT-FIX-SKILL-IMPORT-INTERFACE-001 / UT-FIX-SKILL-REMOVE-INTERFACE-001 実装時検出（2026-02-20） | `docs/30-workflows/unassigned-task/task-ut-fix-skill-ipc-naming-p45-001.md`                                                                        |
| ~~UT-IMP-PHASE11-WORKTREE-PROTOCOL-001~~              | ~~Phase 11 Worktree環境手動テスト実行プロトコル策定~~ **完了: 2026-02-25**                                                                | ~~中~~     | ~~UT-FIX-SKILL-REMOVE-INTERFACE-001 実装苦戦箇所（2026-02-21）~~               | `docs/30-workflows/completed-tasks/task-imp-phase11-worktree-testing-protocol-001.md`                                                              |
| UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001          | IPCハンドラ粒度カバレッジ計測インフラ構築                                                                        | 中     | UT-FIX-SKILL-REMOVE-INTERFACE-001 実装苦戦箇所（2026-02-21）               | `docs/30-workflows/completed-tasks/task-imp-ipc-handler-coverage-granular-001.md`                                                                  |
| UT-IMP-MULTIAGENT-PHASE-ORDERING-GUARD-001        | マルチエージェントPhase依存順序ガード                                                                            | 中     | UT-FIX-SKILL-REMOVE-INTERFACE-001 実装苦戦箇所（2026-02-21）               | `docs/30-workflows/unassigned-task/task-imp-multiagent-phase-ordering-guard-001.md`                                                                |
| ~~UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001~~      | ~~skill:ハンドラIPCレスポンス形式統一（{ success, data }ラッパー vs 直接型T混在解消）~~                           | ~~中~~ | ~~UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 Phase 12（コード調査・2026-02-21）~~ **完了: 2026-02-25** | `docs/30-workflows/completed-tasks/ut-fix-skill-ipc-response-consistency-001/index.md`                                                                            |
| UT-IMP-SKILL-IPC-RESPONSE-CONTRACT-GUARD-001       | skill IPCレスポンス契約マトリクスと自動整合チェック                                                              | 中     | UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 Phase 12（実装苦戦箇所・2026-02-25） | `docs/30-workflows/unassigned-task/task-imp-skill-ipc-response-contract-guard-001.md`                                           |
| UT-IMP-PHASE12-IMPLEMENTATION-GUIDE-QUALITY-GATE-001 | Phase 12 実装ガイド必須要件の品質ゲート化（理由先行/日常例え/型API明記の機械検証）                                 | 中     | UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 Phase 12（実装苦戦箇所・2026-02-25） | `docs/30-workflows/unassigned-task/task-imp-phase12-implementation-guide-quality-gate-001.md`                                   |
| UT-FIX-SKILL-GETDETAIL-NAMING-DRIFT-001            | skill:get-detail引数名ドリフト修正（P45パターン：skillId→skillName統一）                                        | 低     | UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 Phase 12（コード調査・2026-02-21）      | `docs/30-workflows/unassigned-task/task-skill-getdetail-naming-drift.md`                                                                           |
| ~~UT-FIX-SKILL-VALIDATION-CONSISTENCY-001~~            | ~~skill:ハンドラP42準拠バリデーション形式統一（UT-FIX-SKILL-VALIDATION-P42-001の補完・苦戦箇所付き）~~               | ~~中~~     | ~~UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 Phase 12（コード調査・2026-02-21）~~ **完了: 2026-02-24**      | `docs/30-workflows/completed-tasks/skill-validation-consistency/`                                                                            |
| UT-IMP-UNASSIGNED-FORMAT-NORMALIZATION-001         | 未タスク指示書フォーマット正規化（9セクション未準拠67件の是正）                                                   | 中     | UT-FIX-SKILL-IMPORT-ID-MISMATCH-001 監査（2026-02-22）                      | `docs/30-workflows/unassigned-task/task-imp-unassigned-task-format-normalization-001.md`                                                            |
| ~~UT-FIX-SKILL-IMPORT-ID-MISMATCH-001~~           | ~~SkillImportDialog skill.id→skill.name不一致修正（Rendererがハッシュを渡しgetSkillByNameが失敗）~~ | ~~高~~ | ~~ランタイムエラー調査（2026-02-22）~~ **完了: 2026-02-22**                | `docs/30-workflows/completed-tasks/skill-import-id-mismatch-fix/`                                                                                                  |
| UT-TYPE-SKILL-IDENTIFIER-BRANDED-001              | Skill識別子Branded Type導入（SkillId / SkillName コンパイル時型区別）                                            | 中     | UT-FIX-SKILL-IMPORT-ID-MISMATCH-001 実装苦戦箇所（2026-02-22）             | `docs/30-workflows/completed-tasks/task-type-skill-identifier-branded.md`                                                                          |
| UT-REFACTOR-SKILL-IMPORT-DIALOG-DEDUP-001         | SkillImportDialog同名コンポーネント解消（コンポーネント命名重複リファクタリング）                                | 低     | UT-FIX-SKILL-IMPORT-ID-MISMATCH-001 実装苦戦箇所（2026-02-22）             | `docs/30-workflows/unassigned-task/task-refactor-skill-import-dialog-dedup.md`                                                                     |
| ~~UT-UI-THEME-DYNAMIC-SWITCH-001~~                     | ~~settingsSlice テーマ動的切替対応（kanagawa-dragon固定 → 4モード動的切替）~~                                   | ~~中~~     | ~~TASK-UI-00-TOKENS Phase 12（未タスク検出・2026-02-22）~~ **完了: 2026-02-25**                      | `docs/30-workflows/completed-tasks/ut-ui-theme-dynamic-switch-001.md`                                                                              |
| UT-UI-TAILWIND-TOKENS-INTEGRATION-001              | Tailwind CSS カスタムプロパティ統合（tokens.css変数をTailwind theme設定に反映）                                   | 低     | TASK-UI-00-TOKENS Phase 12（未タスク検出・2026-02-22）                      | `docs/30-workflows/unassigned-task/ut-ui-tailwind-tokens-integration-001.md`                                                                       |
| UT-IMP-THEME-DYNAMIC-SWITCH-ROBUSTNESS-001         | テーマ動的切替の再発防止ガード強化（状態責務分離/Hook依存安定化/Phase 12証跡同期）                                | 中     | UT-UI-THEME-DYNAMIC-SWITCH-001 Phase 12（実装苦戦箇所・2026-02-25）         | `docs/30-workflows/completed-tasks/task-imp-theme-dynamic-switch-robustness-001.md`                                                                |
| UT-UI-ATOMS-PROP-NAMING-001                       | RelativeTime Props命名統一（仕様書updateInterval → 実装refreshInterval）                                         | 低     | TASK-UI-00-ATOMS Phase 10 MINOR M-1（2026-02-23）                          | `docs/30-workflows/completed-tasks/unassigned-task/task-ui-atoms-prop-naming.md`                                                                                   |
| UT-UI-ATOMS-TOUCH-TARGET-001                      | SuggestionBubble size="sm" タッチターゲット Apple HIG 44px準拠                                                   | 低     | TASK-UI-00-ATOMS Phase 10 MINOR M-2（2026-02-23）                          | `docs/30-workflows/completed-tasks/unassigned-task/task-ui-atoms-touch-target.md`                                                                                  |
| UT-UI-ATOMS-SPEC-CLARIFICATION-001                | SuggestionBubble success-bounceマイクロインタラクション仕様書責務記述明確化                                       | 低     | TASK-UI-00-ATOMS Phase 10 MINOR M-3（2026-02-23）                          | `docs/30-workflows/completed-tasks/unassigned-task/task-ui-atoms-spec-clarification.md`                                                                            |
| TASK-IMP-MODULE-SYNC-REPORT-ENHANCEMENT-001       | check-shared-module-sync レポート拡充（修正ガイダンス・サマリー数値・printSummary設計準拠）                       | 低     | TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001 Phase 10 MINOR（2026-02-22）        | `docs/30-workflows/unassigned-task/task-imp-module-sync-report-enhancement.md`                                                                     |
| ~~UT-IPC-CHANNEL-NAMING-AUDIT-001~~                   | ~~IPCチャネル命名規則の横断的適用監査と統一~~                                                                        | ~~中~~     | ~~UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 Phase 12（未タスク検出・2026-02-24）~~ **完了: 2026-02-25（spec_created）**   | `docs/30-workflows/completed-tasks/task-ipc-channel-naming-audit-001.md`                                                                               |
| ~~UT-IPC-AUTH-HANDLE-DUPLICATE-001~~                  | ~~`AUTH_*` の `ipcMain.handle` 重複式を定数化・登録一元化で解消~~                                                     | ~~中~~     | ~~UT-IPC-CHANNEL-NAMING-AUDIT-001 Phase 12（MINOR M-002・2026-02-25）~~ **完了: 2026-02-25**           | `docs/30-workflows/completed-tasks/task-ipc-auth-handle-duplicate-001.md`                                                                              |
| UT-SPEC-ONLY-TASK-WORKFLOW-001                    | 仕様書修正のみタスクのPhaseテンプレート・grep検証TDD標準化                                                       | 中     | UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 Phase 12（未タスク検出・2026-02-24）   | `docs/30-workflows/unassigned-task/task-spec-only-task-workflow-automation-001.md`                                                                                 |
| UT-FIX-SKILL-IPC-ARG-FORM-UNIFICATION-001         | skill:ハンドラIPC引数形式統一（オブジェクト型 vs 直接引数型）                                                    | 低     | UT-FIX-SKILL-VALIDATION-CONSISTENCY-001 Phase 12（苦戦箇所4・2026-02-24）   | [`docs/30-workflows/unassigned-task/task-skill-ipc-arg-form-unification.md`](../../../docs/30-workflows/unassigned-task/task-skill-ipc-arg-form-unification.md) |
| UT-IPC-DATA-FLOW-NULLABLE-CONSISTENCY-001         | SkillUsageSummary.lastUsed nullable整合性修正（Phase 1/2分析 nullable=Yes vs 実仕様 non-nullable差異）            | 低     | UT-IPC-DATA-FLOW-TYPE-GAPS-001 Phase 10 MINOR M-1（2026-02-24）            | `docs/30-workflows/completed-tasks/unassigned-task/task-ipc-data-flow-nullable-consistency-001.md`                                                                |
| ~~UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001~~         | ~~未タスク監査の対象スコープ制御とベースライン分離（current/baseline判定）~~                                         | ~~中~~     | ~~UT-IPC-DATA-FLOW-TYPE-GAPS-001 Phase 12 再監査（苦戦箇所・2026-02-24）~~ **完了: 2026-02-25（Phase 1-12）**      | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-unassigned-audit-scope-control-001.md`                                                              |
| ~~UT-IMP-PHASE12-VALIDATION-COMMAND-STANDARDIZATION-001~~ | ~~Phase 12 検証コマンド標準化ガード（`quick_validate.js` 統一 + `verify-all-specs --workflow` 必須化）~~                 | ~~中~~     | ~~UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001 Phase 12再確認（苦戦箇所・2026-02-25）~~ **完了: 2026-02-25（Phase 12完了移管）** | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-validation-command-standardization-001.md`                                                                  |
| UT-IMP-IPC-PRELOAD-SPEC-SYNC-CI-GUARD-001         | task-9D〜9J 仕様契約ドリフト自動検証CIガード（旧パス/artifacts/Date方針）                                        | 中     | UT-IMP-IPC-PRELOAD-EXTENSION-SPEC-ALIGNMENT-001 実装苦戦箇所（2026-02-25）  | `docs/30-workflows/unassigned-task/task-imp-ipc-preload-spec-sync-ci-guard-001.md`                                                            |
| UT-IMP-PHASE12-SPEC-SYNC-SUBAGENT-GUARD-001       | Phase 12 仕様書別SubAgent同期ガードの自動化（4仕様書同時更新 + current/baseline分離判定の標準化）                 | 中     | UT-FIX-SKILL-EXECUTE-INTERFACE-001 Phase 12再確認（実装苦戦箇所・2026-02-25） | `docs/30-workflows/unassigned-task/task-imp-phase12-spec-sync-subagent-guard-001.md`                                                           |
| UT-IMP-PHASE12-SPEC-VERSION-CONSISTENCY-GUARD-001 | Phase 12 仕様更新の版数・手順整合ガード（spec-update-summary / task-workflow / lessons / SKILL / LOGS 同期）     | 中     | UT-IMP-QUICK-VALIDATE-EMPTY-FIELD-GUARD-001 Phase 12再監査（実装苦戦箇所・2026-02-27） | `docs/30-workflows/unassigned-task/task-imp-phase12-spec-version-consistency-guard-001.md`                                                     |
| ~~UT-IMP-PHASE12-SUBAGENT-ARTIFACT-GUARD-001~~ | ~~Phase 12 3workflow再監査のSubAgent成果物突合ガード（仕様書別実行ログ + 監査証跡固定）~~ **完了: 2026-03-04（Phase 12完了移管）** | ~~中~~ | ~~TASK-FIX-SKILL-IMPORT 3連続是正 Phase 12再確認（苦戦箇所・2026-03-04）~~ | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-subagent-artifact-guard-001.md` |
| ~~UT-IMP-PHASE12-SYSTEM-SPEC-EXTRACTION-GUARD-001~~ | ~~Phase 12 システム仕様スキル抽出・反映ガード（resource-map起点の必要仕様抽出 + 台帳同時同期）~~ **完了: 2026-03-04（Phase 12完了移管）** | ~~中~~ | ~~TASK-FIX-SKILL-IMPORT 3連続是正 実装追補（苦戦箇所・2026-03-04）~~ | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-system-spec-extraction-guard-001.md` |
| ~~UT-IMP-PHASE12-THREE-WORKFLOW-AUDIT-SCOPE-GUARD-001~~ | ~~Phase 12 3workflow再監査スコープ判定ガード（証跡集約 + `scope.currentFiles`/`currentViolations` 固定）~~ **完了: 2026-03-04（Phase 12完了移管）** | ~~中~~ | ~~TASK-FIX-SKILL-IMPORT 3連続是正 実装追補（苦戦箇所・2026-03-04）~~ | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-three-workflow-audit-scope-guard-001.md` |
| ~~UT-IMP-SKILL-CENTER-PREVIEW-BUILD-GUARD-001~~ | ~~SkillCenter Phase 11再撮影の preview preflight ガード（build疎通確認 + 失敗時未タスク化）~~ **完了: 2026-03-04（Phase 12完了移管）** | ~~中~~ | ~~TASK-FIX-SKILL-IMPORT 3連続是正 Phase 12再確認（preview再撮影ブロッカー・2026-03-04）~~ | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-skill-center-preview-build-guard-001.md` |
| UT-IMP-SKILL-CENTER-HOTFIX-COVERAGE-INCLUDE-GUARD-001 | SkillCenter hotfix 対象カバレッジ include path ガード導入（実在パス検証 + `3 files / 30 tests` 固定） | 中 | TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001 Phase 12 再確認（coverage include path誤指定・2026-03-04） | `docs/30-workflows/unassigned-task/task-imp-skill-center-hotfix-coverage-include-guard-001.md` |
| UT-IMP-PHASE12-SCREENSHOT-PORT-CONFLICT-GUARD-001 | screenshot 再取得時の `Port 5174` 競合ガード（実行前ポート検査 + 競合分岐記録） | 中 | TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001 Phase 12 再確認（画面証跡再取得運用・2026-03-04） | `docs/30-workflows/unassigned-task/task-imp-phase12-screenshot-port-conflict-guard-001.md` |
| UT-IMP-PHASE11-SCREENSHOT-COVERAGE-MATRIX-GUARD-001 | Phase 11 画面カバレッジマトリクス必須化ガード（視覚/非視覚TCの設計意図固定 + warning常態化防止） | 中 | UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001 Phase 12 再確認（coverage matrix warning・2026-03-04） | `docs/30-workflows/unassigned-task/task-imp-phase11-screenshot-coverage-matrix-guard-001.md` |
| ~~UT-IMP-PHASE11-AUTHKEY-SCREENSHOT-SELECTOR-DRIFT-GUARD-001~~ | ~~auth-key Phase 11 スクリーンショット取得スクリプトのセレクタドリフト防止（`data-testid` 優先 + 失敗時デバッグログ + preflight）~~ **完了: 2026-03-06（Phase 12完了移管）** | ~~中~~ | ~~TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001 再監査（画面証跡追加時のタイムアウト・2026-03-05）~~ | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase11-authkey-screenshot-selector-drift-guard-001.md` |
| ~~UT-IMP-SKILLHANDLERS-AUTHKEY-DI-BOUNDARY-GUARD-001~~ | ~~`skillHandlers.ts` の DI境界整理ガード（`AuthKeyService` 注入経路の責務分離 + composition root 集約 + 回帰テスト固定）~~ **完了: 2026-03-06（Phase 12完了移管）** | ~~中~~ | ~~TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001 Phase 10 MINOR + Phase 12 再確認（責務肥大化/教訓反映・2026-03-06）~~ | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-skillhandlers-authkey-di-boundary-guard-001.md` |
| ~~UT-IMP-PHASE12-TARGETED-VITEST-RUN-GUARD-001~~ | ~~Phase 12 再監査で対象テストのみを確実実行するガード（`pnpm exec vitest run` 直指定 + スクリプト実在 preflight）~~ **完了: 2026-03-05（Phase 12完了移管）** | ~~中~~ | ~~TASK-UI-01-C Phase 12 準拠再確認（実装苦戦箇所・2026-03-05）~~ | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-targeted-vitest-run-guard-001.md` |
| ~~UT-IMP-DESKTOP-TESTRUN-SIGTERM-FALLBACK-GUARD-001~~ | ~~`apps/desktop test:run` の `SIGTERM` 中断時フォールバックガード（失敗ログ固定 + 分割実行標準化 + 3仕様同期）~~ **完了: 2026-03-05（Phase 12完了移管）** | ~~中~~ | ~~TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001 Phase 12 再確認（長時間fixtureテスト運用の苦戦箇所・2026-03-05）~~ | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-desktop-testrun-sigterm-fallback-guard-001.md` |
| ~~UT-IMP-TASK9J-PHASE12-IPC-SYNC-AUTO-VERIFY-001~~    | ~~TASK-9J Phase 12 IPC同期自動検証ガード（5仕様書同期 + handler/register/preload 三点突合の機械判定）~~               | ~~中~~     | ~~TASK-9J-skill-analytics Phase 12再確認（実装苦戦箇所・2026-02-28）~~ **完了: 2026-02-28（Phase 12完了移管）**           | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task9j-phase12-ipc-sync-auto-verify-001.md`                                                        |
| UT-IMP-AIWORKFLOW-UNASSIGNED-TABLE-DEDUP-001      | Phase 12 残課題テーブル重複・状態矛盾検知強化（同一ID一意性監査 + 完了/未完了矛盾検知）                           | 中     | TASK-9F Phase 12 再監査（仕様台帳再確認・2026-02-27）                         | `docs/30-workflows/unassigned-task/task-imp-aiworkflow-unassigned-table-dedup-001.md`                                                          |
| UT-IMP-AIWORKFLOW-SKILL-ENTRYPOINT-COVERAGE-GUARD-001 | aiworkflow-requirements の入口導線整流（`SKILL.md` / `quick-reference` / `resource-map` と `quick_validate` の整合） | 中 | UT-TASK-10A-B-008 Phase 12 追補4-5（system spec 再同期・2026-03-06） | `docs/30-workflows/completed-tasks/ut-task-10a-b-008-unassigned-count-resync-guard/unassigned-task/task-imp-aiworkflow-skill-entrypoint-coverage-guard-001.md` |
| ~~UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001~~         | ~~Phase 12 仕様更新リンク同期ガード強化（task-workflow/SKILL/LOGSの3点同期）~~                                       | ~~中~~     | ~~UT-IPC-AUTH-HANDLE-DUPLICATE-001 Phase 12 再確認（苦戦箇所・2026-02-25）~~ **完了: 2026-02-25（spec_created）**    | `docs/30-workflows/completed-tasks/task-imp-aiworkflow-spec-reference-sync-001.md`                                                              |
| タスクID                                                       | タスク名                                                                                                                                                                     | 優先度   | 発見元                                                                                                                               | タスク仕様書                                                                                                                                                                           |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UT-08-001 | SettingsView 統合テストの `act()` warning 解消 | 低 | 08-TASK Phase 11/12（2026-03-08） | `docs/30-workflows/completed-tasks/unassigned-task/task-ut-08-001-settings-act-warning-guard.md` |
| UT-08-002 | SettingsView 画面導線の Playwright E2E 拡張 | 中 | 08-TASK Phase 12（2026-03-08） | `docs/30-workflows/completed-tasks/unassigned-task/task-ut-08-002-settings-e2e-coverage.md` |
| UT-08-003 | Phase 6 残件 INT-11〜13 の再評価と必要分実装 | 中 | 08-TASK Phase 6/12（2026-03-08） | `docs/30-workflows/completed-tasks/unassigned-task/task-ut-08-003-settings-phase6-remaining-cases.md` |
| UT-08-004 | Settings integration harness パターン仕様同期の継続改善 | 低 | 08-TASK Phase 12（2026-03-08） | `docs/30-workflows/completed-tasks/unassigned-task/task-ut-08-004-settings-harness-pattern-spec-sync.md` |
| TASK-UI-05A-SKILL-EDITOR-VIEW                                  | SkillEditorView（仕様書作成完了 + 実装ファイル実在、統合未完了）                                                                                                             | 高       | TASK-UI-05A Phase 1-13（spec_created） + 再監査（2026-03-02）                                                                        | `docs/30-workflows/skill-editor-view/`                                                                                                                                                 |
| UT-UI-05A-GETFILETREE-001                                      | skill:getFileTree IPCチャネル追加                                                                                                                                            | CRITICAL | TASK-UI-05A FR-1前提                                                                                                                 | `docs/30-workflows/completed-tasks/skill-editor-view-closure/unassigned-task/task-ui-05a-getfiletree-ipc-implementation.md`                                                            |
| UT-UI-05A-SPEC-CONSISTENCY-001                                 | Phase 2/5 useFileTree 仕様統一（filePaths vs IPC getFileTree）                                                                                                               | 中       | TASK-UI-05A 再監査（2026-03-02）                                                                                                     | `docs/30-workflows/completed-tasks/skill-editor-view-closure/unassigned-task/task-ui-05a-spec-consistency-filetree-contract.md`                                                        |
| UT-UI-05A-IMPLEMENTATION-CLOSURE-001                           | SkillEditorView 実装残課題収束（導線/UX7件）                                                                                                                                 | 高       | TASK-UI-05A Phase 11 discovered-issues + 再監査（2026-03-02）                                                                        | `docs/30-workflows/completed-tasks/skill-editor-view-closure/unassigned-task/task-ui-05a-editor-view-implementation-closure.md`                                                        |
| ~~UT-TASK-10A-B-001~~                                          | ~~SkillAnalysisView 自動修正可能フィルタボタン実装~~ **完了: 2026-03-05**                                                                                                    | ~~中~~   | TASK-10A-B Phase 10 MINOR M1（2026-03-02）                                                                                           | `docs/30-workflows/completed-tasks/ut-task-10a-b-001-autofixable-filter-button/`                                                                                                       |
| UT-TASK-10A-B-002                                              | SkillAnalysisView 改善結果トースト通知実装                                                                                                                                   | 中       | TASK-10A-B Phase 10 MINOR M2（2026-03-02）                                                                                           | `docs/30-workflows/unassigned-task/task-10a-b-improvement-toast-notification.md`                                                                                                       |
| ~~UT-TASK-10A-B-003~~                                          | ~~SkillAnalysisView 改善結果内訳表示実装~~ **完了: 2026-03-05**                                                                                                              | ~~中~~   | TASK-10A-B Phase 10 MINOR M3（2026-03-02）                                                                                           | `docs/30-workflows/completed-tasks/task-10a-b-improvement-result-breakdown-ui/`                                                                                                        |
| UT-TASK-10A-B-004                                              | SkillAnalysisView Props 契約整合（`skill` vs `skillName`）                                                                                                                   | 低       | TASK-10A-B Phase 10 MINOR M4（2026-03-02）                                                                                           | `docs/30-workflows/unassigned-task/task-10a-b-props-contract-alignment.md`                                                                                                             |
| UT-TASK-10A-B-005                                              | SkillAnalysisView molecule 分割設計追補（Header/Error/Actions）                                                                                                              | 低       | TASK-10A-B Phase 10 MINOR M5（2026-03-02）                                                                                           | `docs/30-workflows/unassigned-task/task-10a-b-analysis-view-molecule-separation.md`                                                                                                    |
| UT-TASK-10A-B-006                                              | Phase 11 必須セクション検証ガード（統合テスト連携/完了条件）                                                                                                                 | 中       | TASK-10A-B Phase 12 再監査（苦戦箇所・2026-03-02）                                                                                   | `docs/30-workflows/unassigned-task/task-10a-b-phase11-required-sections-validation-guard.md`                                                                                           |
| UT-TASK-10A-B-007                                              | Phase 11 画面証跡鮮度ガード（再撮影 + 更新時刻確認）                                                                                                                         | 中       | TASK-10A-B Phase 12 再監査（苦戦箇所・2026-03-02）                                                                                   | `docs/30-workflows/unassigned-task/task-10a-b-phase11-screenshot-freshness-guard.md`                                                                                                   |
| ~~UT-TASK-10A-B-008~~                                          | ~~未タスク件数再計算同期ガード（detection/task-workflow/ui-ux-feature）~~ **完了: 2026-03-06**                                                                               | ~~中~~   | TASK-10A-B Phase 12 再監査（苦戦箇所・2026-03-02）                                                                                   | `docs/30-workflows/completed-tasks/ut-task-10a-b-008-unassigned-count-resync-guard/`                                                                                                   |
| UT-TASK-10A-B-009                                              | 完了済みUT配置ポリシー統一ガード（3分類 + target監査境界）                                                                                                                   | 中       | UT-TASK-10A-B-001 最終再監査（苦戦箇所・2026-03-05）                                                                                 | `docs/30-workflows/unassigned-task/task-10a-b-completed-ut-placement-policy-guard.md`                                                                                                  |
| UT-IMP-TASK10A-C-FIVE-SPEC-SYNC-GUARD-001                      | TASK-10A-C の 5仕様書同時同期ガード（api-ipc/interfaces/security/task-workflow/lessons）                                                                                     | 中       | TASK-10A-C Phase 12 最終再確認（苦戦箇所・2026-03-03）                                                                               | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task10a-c-five-spec-sync-guard-001.md`                                                                                     |
| UT-IMP-TASK10A-C-PHASE11-SCREENSHOT-COVERAGE-GUARD-001         | TASK-10A-C Phase 11 画面証跡ガード（再撮影 + TCカバレッジ + 鮮度確認）                                                                                                       | 中       | TASK-10A-C Phase 11/12 最終再確認（苦戦箇所・2026-03-03）                                                                            | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task10a-c-phase11-screenshot-coverage-guard-001.md`                                                                        |
| UT-IMP-TASK10A-D-SUBAGENT-EXECUTION-LOG-GUARD-001              | Phase 12 仕様書別SubAgent実行ログ（実装内容/苦戦箇所/検証証跡）の必須化                                                                                                      | 中       | TASK-10A-D Phase 12 再確認（苦戦箇所・2026-03-04）                                                                                   | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task10a-d-subagent-execution-log-guard-001.md`                                                                             |
| UT-IMP-TASK10A-D-SCREENSHOT-PURPOSE-DISAMBIGUATION-GUARD-001   | Phase 11 画面証跡の状態名+検証目的分離ガード（TC意図混同防止）                                                                                                               | 中       | TASK-10A-D Phase 11/12 再確認（苦戦箇所・2026-03-04）                                                                                | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task10a-d-screenshot-purpose-disambiguation-guard-001.md`                                                                  |
| UT-UI-05-001                                                   | CategoryId / SkillCategory 型統一                                                                                                                                            | 低       | TASK-UI-05 Phase 10 MINOR-1                                                                                                          | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-categoryid-skillcategory-type-unification.md`                                               |
| UT-UI-05-002                                                   | SkillDetailPanel 内部 Molecule 分離                                                                                                                                          | 中       | TASK-UI-05 Phase 10 MINOR-2                                                                                                          | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-skill-detail-panel-molecule-split.md`                                                       |
| UT-UI-05-003                                                   | ローディングスケルトン実装                                                                                                                                                   | 低       | TASK-UI-05 Phase 10 MINOR-3                                                                                                          | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-loading-skeleton-implementation.md`                                                         |
| UT-UI-05-004                                                   | モバイルスワイプ閉じ実装                                                                                                                                                     | 低       | TASK-UI-05 Phase 10 MINOR-4                                                                                                          | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-mobile-swipe-close-detail-panel.md`                                                         |
| UT-UI-05-005                                                   | SKILL.md 全文 Markdown レンダリング                                                                                                                                          | 中       | TASK-UI-05 Phase 10 MINOR-5                                                                                                          | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-skill-markdown-full-rendering.md`                                                           |
| UT-UI-05-006                                                   | useFeaturedSkills 選定アルゴリズム改善                                                                                                                                       | 低       | TASK-UI-05 コードコメント TODO                                                                                                       | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-featured-skills-algorithm-improvement.md`                                                   |
| UT-UI-05-007                                                   | Phase 12 UI仕様同期プロファイル適用ガード                                                                                                                                    | 中       | TASK-UI-05 Phase 12 再確認（苦戦箇所）                                                                                               | `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/unassigned-task/task-ui-05-phase12-ui-spec-sync-guard.md`                                                              |
| UT-IMP-PHASE12-TWO-WORKFLOW-EVIDENCE-BUNDLE-001                | Phase 12 2workflow同時監査の証跡集約ガード（spec_created/completed + 画面証跡 + current/baseline 分離）                                                                      | 中       | TASK-UI-05A / TASK-UI-05 Phase 12再確認（苦戦箇所・2026-03-02）                                                                      | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-two-workflow-evidence-bundle-001.md`                                                                               |
| UT-UI-05B-001                                                  | Phase 12 画面証跡再取得ガード（再撮影 + 更新時刻確認の標準化）                                                                                                               | 中       | TASK-UI-05B Phase 12 再確認（苦戦箇所・2026-03-02）                                                                                  | `docs/30-workflows/completed-tasks/TASK-UI-05B-SKILL-ADVANCED-VIEWS/unassigned-task/task-ui-05b-phase12-screenshot-evidence-recapture-guard.md`                                        |
| UT-9G-001                                                      | SkillScheduler cron 次回実行時刻の精度改善                                                                                                                                   | 中       | TASK-9G Phase 12 未タスク検出（簡易実装コメント）                                                                                    | `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/unassigned-task/task-skill-schedule-cron-next-run-accuracy.md`                                                               |
| UT-9G-002                                                      | event スケジュール（file_change / git_commit）実行対応                                                                                                                       | 低       | TASK-9G Phase 12 未タスク検出（プレースホルダー実装）                                                                                | `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/unassigned-task/task-skill-schedule-event-trigger-completion.md`                                                             |
| UT-9G-003                                                      | スケジュール実行通知（sendNotification）実装                                                                                                                                 | 中       | TASK-9G Phase 12 未タスク検出（NotificationSettings未接続）                                                                          | `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/unassigned-task/task-skill-schedule-notification-dispatch.md`                                                                |
| UT-9G-004                                                      | SkillScheduler graceful shutdown 実装                                                                                                                                        | 低       | TASK-9G Phase 12 未タスク検出（終了時クリーンアップ未実装）                                                                          | `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/unassigned-task/task-skill-schedule-graceful-shutdown.md`                                                                    |
| UT-9G-005                                                      | スケジュール実行結果の Renderer push 通知追加                                                                                                                                | 低       | TASK-9G Phase 12 未タスク検出（Main→Renderer push未実装）                                                                            | `docs/30-workflows/completed-tasks/TASK-9G-skill-schedule/unassigned-task/task-skill-schedule-execution-push-event.md`                                                                 |
| UT-9I-001                                                      | SkillDocGenerator の LLM プロバイダ連携実装                                                                                                                                  | 中       | TASK-9I Phase 12 未タスク検出（stubQueryFn 暫定実装）                                                                                | `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/unassigned-task/task-ut-9i-001-llm-provider-integration.md`                                                                      |
| UT-9I-002                                                      | ドキュメントテンプレート CRUD 機能実装                                                                                                                                       | 低       | TASK-9I Phase 12 未タスク検出（DEFAULT_DOC_TEMPLATE 固定）                                                                           | `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/unassigned-task/task-ut-9i-002-template-crud.md`                                                                                 |
| UT-IMP-PHASE12-EVIDENCE-LINK-GUARD-001                         | Phase 12 再確認証跡テーブル・未タスクリンク整合ガード                                                                                                                        | 中       | TASK-9I Phase 12 再確認（苦戦箇所抽出・2026-02-28）                                                                                  | `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/unassigned-task/task-imp-phase12-evidence-link-guard-001.md`                                                                     |
| UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001                       | Phase 12 仕様書別SubAgent N/A判定ログガード                                                                                                                                  | 中       | TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001 Phase 12 実行監査（苦戦箇所抽出・2026-02-28）                                              | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-subagent-na-log-guard-001.md`                                                                                      |
| UT-FIX-APIKEYS-NONNULL-ASSERTION-001                           | ApiKeysSection P48 non-null assertion 残存修正                                                                                                                               | LOW      | 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001                                                                                       | L305-306 の result.data! を optional chaining に置換                                                                                                                                   |
| UT-FIX-ENSURE-ARRAY-COMMON-UTIL-001                            | ensureArray 共通ユーティリティ抽出                                                                                                                                           | LOW      | 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001                                                                                       | Array.isArray パターンが3箇所以上になった場合に共通化                                                                                                                                  |
| UT-FIX-SETTINGS-ERROR-BOUNDARY-001                             | Settings Error Boundary 導入                                                                                                                                                 | MEDIUM   | 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001                                                                                       | 各セクションの異常を局所化する ErrorBoundary                                                                                                                                           |
| UT-UI-03-A11Y-RADIOGROUP-001                                   | SkillChip群コンテナに role="radiogroup" 追加                                                                                                                                 | 低       | TASK-UI-03 Phase 10 MINOR #1（2026-03-07）                                                                                           | `docs/30-workflows/completed-tasks/unassigned-task/task-ut-ui-03-a11y-radiogroup-001.md`                                                                                               |
| UT-UI-03-A11Y-DIALOG-001                                       | AdvancedSettingsPanel に role="dialog" 追加                                                                                                                                  | 低       | TASK-UI-03 Phase 10 MINOR #2（2026-03-07）                                                                                           | `docs/30-workflows/completed-tasks/unassigned-task/task-ut-ui-03-a11y-dialog-001.md`                                                                                                   |
| UT-UI-03-A11Y-LABEL-001                                        | 停止ボタン aria-label 不一致修正                                                                                                                                             | 低       | TASK-UI-03 Phase 10 MINOR #3（2026-03-07）                                                                                           | `docs/30-workflows/completed-tasks/unassigned-task/task-ut-ui-03-a11y-label-001.md`                                                                                                    |
| UT-UI-03-TYPE-ASSERTION-001                                    | as unknown as Skill[] 型アサーション解消                                                                                                                                     | 低       | TASK-UI-03 Phase 10 MINOR #4（P24派生・2026-03-07）                                                                                  | `docs/30-workflows/completed-tasks/unassigned-task/task-ut-ui-03-type-assertion-001.md`                                                                                                |
| UT-UI-03-PHASE11-SCREENSHOT-COVERAGE-001                       | Phase 11証跡表のTC網羅不足を解消（TC-02/03/04/05/07/10追補 + validator PASS化）                                                                                              | 中       | TASK-UI-03 Phase 11 再検証（2026-03-07）                                                                                             | `docs/30-workflows/completed-tasks/unassigned-task/task-ut-ui-03-phase11-screenshot-coverage-001.md`                                                                                   |
| ~~TASK-9A-C~~                                                  | ~~SkillEditor UI（仕様書作成済み・実装未着手）~~ **完了: 2026-02-26（TASK-9Aへ統合）**                                                                                       | ~~高~~   | ~~TASK-9A-SKILL-EDITOR Phase 1（UI仕様書作成完了）~~                                                                                 | `docs/30-workflows/completed-tasks/TASK-9A-skill-editor/`                                                                                                                              |
| TASK-FIX-14-2-SKILLEXECUTOR-CONSOLE-LOG-MIGRATION              | SkillExecutor の console ログを electron-log に移行                                                                                                                          | 低       | TASK-FIX-14-1-CONSOLE-LOG-MIGRATION Phase 12（スコープ外項目）                                                                       | `docs/30-workflows/completed-tasks/task-fix-14-2-skillexecutor-console-log-migration.md`                                                                                               |
| ~~UT-IMP-IPC-PRELOAD-EXTENSION-SPEC-ALIGNMENT-001~~            | ~~UT-SKILL-IPC-PRELOAD-EXTENSION-001で検出した仕様差分（参照切れ/パス差分/命名差分）の統合是正~~                                                                             | ~~中~~   | **2026-02-25完了** UT-SKILL-IPC-PRELOAD-EXTENSION-001 Phase 10/12（Open Item）                                                       | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-013-ut-imp-ipc-preload-extension-spec-alignment-001.md`                                                         |
| TASK-3-1-B                                                     | SkillExecutor IPC Handler統合                                                                                                                                                | 高       | TASK-3-1-A完了時（blocks）                                                                                                           | `docs/30-workflows/unassigned-task/task-3-1-B-skillexecutor-ipc-integration.md`                                                                                                        |
| TASK-SKILL-PERF-TEST                                           | SkillExecutor パフォーマンステスト                                                                                                                                           | 低       | TASK-3-1-A Phase 11推奨事項                                                                                                          | `docs/30-workflows/unassigned-task/task-skillexecutor-performance-testing.md`                                                                                                          |
| SKILL-E2E-001                                                  | スキルインポートE2Eテスト                                                                                                                                                    | 中       | Phase 11（手動テスト検証）推奨事項                                                                                                   | `docs/30-workflows/unassigned-task/task-skill-import-e2e-testing.md`                                                                                                                   |
| TSC-AUTOMATION-001                                             | Phase 12自動化スクリプト拡充                                                                                                                                                 | 低       | skill-import-persistence-bugfix実施時                                                                                                | `docs/30-workflows/unassigned-task/task-phase12-automation-enhancement.md`                                                                                                             |
| UT-008                                                         | Chat History UI Components                                                                                                                                                   | 中       | Phase 12（UT-006完了後の後続タスク）                                                                                                 | `docs/30-workflows/unassigned-task/task-chat-history-ui-components.md`                                                                                                                 |
| UT-009                                                         | Chat History Additional Use Cases                                                                                                                                            | 中       | Phase 12（api-chat-history.md 未実装Use Cases）                                                                                      | `docs/30-workflows/unassigned-task/task-chat-history-additional-usecases.md`                                                                                                           |
| task-imp-skillselector-onimportrequest-001                     | SkillSelector onImportRequest改善                                                                                                                                            | 中       | TASK-7D実施中に発見                                                                                                                  | `docs/30-workflows/unassigned-task/task-imp-skillselector-onimportrequest-improvements.md`                                                                                             |
| task-imp-chatpanel-new-design-001                              | ChatPanel新デザイン改善                                                                                                                                                      | 中       | TASK-7D実施中に発見                                                                                                                  | `docs/30-workflows/unassigned-task/task-imp-chatpanel-new-design-improvements.md`                                                                                                      |
| task-chatedit-store-integration-001                            | chatEditSlice Store統合                                                                                                                                                      | 中       | システム仕様書分析（arch-state-management.md）                                                                                       | `docs/30-workflows/unassigned-task/task-chatedit-slice-store-integration.md`                                                                                                           |
| task-rag-largefile-perf-001                                    | RAG変換 大容量ファイルパフォーマンス検証                                                                                                                                     | 中       | システム仕様書分析（quality-requirements.md）                                                                                        | `docs/30-workflows/unassigned-task/task-rag-converter-largefile-performance.md`                                                                                                        |
| TASK-CHUNK-API-001                                             | Chunk Search APIレイヤー実装                                                                                                                                                 | 中       | api-internal-chunk-search.md（未実装レイヤー）                                                                                       | `docs/30-workflows/unassigned-task/task-imp-chunk-search-api-layers.md`                                                                                                                |
| TASK-DOM-NESTING-001                                           | validateDOMNesting警告修正                                                                                                                                                   | 低       | ui-history-integration.md（残課題）                                                                                                  | `docs/30-workflows/unassigned-task/task-validate-dom-nesting-bugfix.md`                                                                                                                |
| UT-RETRY-001                                                   | リトライ設定UI                                                                                                                                                               | 低       | TASK-SKILL-RETRY-001 Phase 12                                                                                                        | `docs/30-workflows/unassigned-task/task-retry-settings-ui.md`                                                                                                                          |
| UT-RETRY-002                                                   | リトライ履歴永続化                                                                                                                                                           | 低       | TASK-SKILL-RETRY-001 Phase 12                                                                                                        | `docs/30-workflows/unassigned-task/task-retry-history-persistence.md`                                                                                                                  |
| UT-RETRY-003                                                   | サーキットブレーカーパターン導入                                                                                                                                             | 中       | TASK-SKILL-RETRY-001 Phase 11 + error-handling.md                                                                                    | `docs/30-workflows/unassigned-task/task-circuit-breaker-pattern.md`                                                                                                                    |
| UT-RETRY-004                                                   | リトライイベントRenderer表示                                                                                                                                                 | 中       | TASK-SKILL-RETRY-001 Phase 11                                                                                                        | `docs/30-workflows/unassigned-task/task-use-skill-execution-retry-events.md`                                                                                                           |
| UT-RETRY-005                                                   | リトライ型定義shared package移行                                                                                                                                             | 低       | TASK-SKILL-RETRY-001 Phase 5                                                                                                         | `docs/30-workflows/unassigned-task/task-retry-types-shared-migration.md`                                                                                                               |
| CONV-DEBT-001                                                  | PlainTextConverter実装                                                                                                                                                       | 中       | interfaces-converter.md / architecture-file-conversion.md                                                                            | `docs/30-workflows/unassigned-task/task-plaintext-converter.md`                                                                                                                        |
| UT-VECTOR-001                                                  | ベクトル検索フィルター拡張                                                                                                                                                   | 低       | rag-vector-search.md 未対応フィルター                                                                                                | `docs/30-workflows/unassigned-task/task-vector-search-advanced-filters.md`                                                                                                             |
| task-imp-ipc-imp002-channels-001                               | IMP-002チャネル本体実装（settings/permissions/cache）                                                                                                                        | 中       | TASK-8C-A Phase 12（IPC統合テスト）                                                                                                  | `docs/30-workflows/unassigned-task/task-imp-ipc-imp002-channels.md`                                                                                                                    |
| task-imp-ipc-permission-response-001                           | skill:permission:response チャネル実装                                                                                                                                       | 低       | TASK-8C-A Phase 12（IPC統合テスト）                                                                                                  | `docs/30-workflows/unassigned-task/task-imp-ipc-permission-response.md`                                                                                                                |
| task-ref-quality-requirements-split-001                        | quality-requirements.md仕様書分割                                                                                                                                            | 低       | TASK-OPT-CI-TEST-PARALLEL-001 Phase 12（テンプレート準拠確認）                                                                       | `docs/30-workflows/unassigned-task/task-ref-quality-requirements-split-001.md`                                                                                                         |
| task-e2e-permission-waitfortimeout-001                         | E2E権限テスト waitForTimeout改善                                                                                                                                             | 低       | TASK-8C-D Phase 10（TQ-M1指摘）                                                                                                      | `docs/30-workflows/unassigned-task/task-e2e-permission-waitfortimeout-refactoring.md`                                                                                                  |
| task-e2e-test-readme-documentation-001                         | READMEへのE2Eテスト実行方法追加                                                                                                                                              | 低       | TASK-8C-D Phase 9（DOC-M1指摘）                                                                                                      | `docs/30-workflows/unassigned-task/task-e2e-test-readme-documentation.md`                                                                                                              |
| ~~TASK-9B-H~~                                                  | ~~SkillCreatorService IPC通信設定~~                                                                                                                                          | ~~高~~   | **2026-02-12完了** TASK-9B-H-SKILL-CREATOR-IPC                                                                                       | `docs/30-workflows/completed-tasks/skill-creator-ipc/`                                                                                                                                 |
| UI-INTEGRATION-9B                                              | SkillCreator UI統合（TASK-10A連携）                                                                                                                                          | 高       | TASK-9B-G Phase 12（UI未実装）                                                                                                       | `docs/30-workflows/unassigned-task/task-9b-ui-integration-task10a.md`                                                                                                                  |
| ~~TASK-9B-I~~                                                  | ~~Claude Agent SDK本格統合~~                                                                                                                                                 | ~~中~~   | ~~TASK-9B-G Phase 3（推奨事項）~~                                                                                                    | ~~`docs/30-workflows/unassigned-task/task-9b-i-skill-creator-sdk-integration.md`~~ **2026-02-12完了**                                                                                  |
| TASK-9B-J                                                      | ResourceLoaderキャッシュ無効化                                                                                                                                               | 低       | TASK-9B-G Phase 3（推奨事項）                                                                                                        | `docs/30-workflows/unassigned-task/task-9b-j-skill-creator-cache-invalidation.md`                                                                                                      |
| TASK-9B-K                                                      | タイムアウト設定の外部化                                                                                                                                                     | 低       | TASK-9B-G Phase 3（推奨事項）                                                                                                        | `docs/30-workflows/unassigned-task/task-9b-k-skill-creator-timeout-config.md`                                                                                                          |
| ~~UT-IMP-TASK9B-SPEC-CONTRACT-GUARD-001~~                      | ~~TASK-9B 仕様契約再監査ガード強化（13ch同期/P42 create/current-baseline判定）~~                                                                                             | ~~中~~   | **2026-02-26完了** TASK-9B 再監査 Phase 12（実装苦戦箇所・2026-02-26）                                                               | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task9b-spec-contract-guard-001.md`                                                                                         |
| TASK-10A-UI-SKILL-IMPROVE                                      | スキル改善UI表示機能                                                                                                                                                         | 中       | TASK-9C Phase 11（手動テスト発見）                                                                                                   | `docs/30-workflows/unassigned-task/task-10a-ui-skill-improve.md`                                                                                                                       |
| TASK-10B-IMPROVE-HISTORY                                       | 改善履歴の永続化                                                                                                                                                             | 低       | TASK-9C Phase 12（スコープ外候補）                                                                                                   | `docs/30-workflows/unassigned-task/task-10b-improve-history.md`                                                                                                                        |
| TASK-10C-AB-TEST                                               | A/Bテスト実行・結果比較機能                                                                                                                                                  | 低       | TASK-9C Phase 12（スコープ外候補）                                                                                                   | `docs/30-workflows/unassigned-task/task-10c-ab-test.md`                                                                                                                                |
| task-imp-phase12-validation-001                                | Phase 12ドキュメント更新自動検証ツール                                                                                                                                       | 中       | AUTH-UI-004 Phase 12（ドキュメント更新漏れ）                                                                                         | `docs/30-workflows/unassigned-task/task-phase12-doc-validation-tool.md`                                                                                                                |
| UT-9F-SETTER-INJECTION-001                                     | SkillShareManager の Setter Injection 実装                                                                                                                                   | 中       | TASK-9F Phase 10（MINOR-01）                                                                                                         | `docs/30-workflows/completed-tasks/skill-share/unassigned-task/task-9f-setter-injection-refactoring.md`                                                                                |
| UT-9F-STRATEGY-REFACTOR-001                                    | SkillShareManager の Strategy パターン分離                                                                                                                                   | 低       | TASK-9F Phase 10（MINOR-02）                                                                                                         | `docs/30-workflows/completed-tasks/skill-share/unassigned-task/task-9f-strategy-pattern-refactoring.md`                                                                                |
| UT-9F-VALIDATE-IMPORT-001                                      | `validateImport(skillPath)` 公開メソッド実装                                                                                                                                 | 中       | TASK-9F Phase 10（MINOR-03）                                                                                                         | `docs/30-workflows/completed-tasks/skill-share/unassigned-task/task-9f-validate-import-improvements.md`                                                                                |
| UT-9F-ERROR-SANITIZE-001                                       | エラーメッセージのパス情報サニタイズ                                                                                                                                         | 中       | TASK-9F Phase 10（MINOR-04）                                                                                                         | `docs/30-workflows/completed-tasks/skill-share/unassigned-task/task-9f-error-sanitize-security.md`                                                                                     |
| UT-9F-EXPORT-PATH-TRAVERSAL-001                                | `exportToLocal` のパストラバーサル検証追加                                                                                                                                   | 高       | TASK-9F Phase 10（MINOR-05）                                                                                                         | `docs/30-workflows/completed-tasks/skill-share/unassigned-task/task-9f-export-path-traversal-security.md`                                                                              |
| UT-9F-DISCRIMINATED-UNION-001                                  | `ShareTarget` の Discriminated Union 化                                                                                                                                      | 低       | TASK-9F Phase 10（MINOR-06）                                                                                                         | `docs/30-workflows/completed-tasks/skill-share/unassigned-task/task-9f-sharetarget-discriminated-union-refactoring.md`                                                                 |
| UT-AUTH-001                                                    | profileHandlers.test.ts IPCハンドラモック環境修正                                                                                                                            | 低       | AUTH-UI-001 Phase 5（テスト環境問題）                                                                                                | `docs/30-workflows/unassigned-task/ut-auth-001-profilehandlers-test-fix.md`                                                                                                            |
| task-search-scope-folder-001                                   | 検索スコープ指定機能                                                                                                                                                         | 中       | task-imp-search-ui-001 Phase 12（将来拡張候補）                                                                                      | `docs/30-workflows/unassigned-task/task-search-scope-folder.md`                                                                                                                        |
| task-search-multifile-replace-001                              | マルチファイル一括置換機能                                                                                                                                                   | 中       | task-imp-search-ui-001 Phase 12（将来拡張候補）                                                                                      | `docs/30-workflows/unassigned-task/task-search-multifile-replace.md`                                                                                                                   |
| UT-ENV-001                                                     | CI node-versionの.nvmrc参照化                                                                                                                                                | 低       | ENV-INFRA-001 Phase 3レビュー                                                                                                        | `docs/30-workflows/unassigned-task/task-ut-env-001-ci-nvmrc.md`                                                                                                                        |
| UT-FIX-5-1-001                                                 | AgentView型アサーション解消（ImportedSkill→Skill）                                                                                                                           | 低       | TASK-FIX-5-1-SKILL-API-UNIFICATION Phase 10（MINOR指摘）                                                                             | `docs/30-workflows/completed-tasks/task-ut-fix-5-1-001-agentview-type-assertion.md`                                                                                                    |
| UT-OFFLINE-REFRESH-001                                         | オフライン時リフレッシュ失敗処理                                                                                                                                             | 中       | TASK-AUTH-SESSION-REFRESH-001 Phase 12（スコープ外項目）                                                                             | `docs/30-workflows/unassigned-task/task-offline-refresh.md`                                                                                                                            |
| UT-AUDIT-001                                                   | 認証イベント監査ログ                                                                                                                                                         | 中       | TASK-AUTH-SESSION-REFRESH-001 Phase 12（スコープ外項目）                                                                             | `docs/30-workflows/unassigned-task/task-auth-audit-logging.md`                                                                                                                         |
| UT-REFRESH-NOTIFICATION-001                                    | セッションリフレッシュ通知UI                                                                                                                                                 | 低       | TASK-AUTH-SESSION-REFRESH-001 Phase 12（スコープ外項目）                                                                             | `docs/30-workflows/unassigned-task/task-refresh-notification.md`                                                                                                                       |
| UT-SEC-001                                                     | OAuth プロバイダー自動検出機能（consumeState→validate置換）                                                                                                                  | 低       | DEBT-SEC-001 Phase 12（設計乖離検出）                                                                                                | `docs/30-workflows/unassigned-task/task-auth-provider-detection.md`                                                                                                                    |
| task-sec-auth-state-cleanup-001                                | State Map定期クリーンアップ実装                                                                                                                                              | 低       | DEBT-SEC-001 Phase 12（既知制約検出）                                                                                                | `docs/30-workflows/unassigned-task/task-auth-state-cleanup-scheduling.md`                                                                                                              |
| UT-PROTOCOL-URL-001                                            | カスタムプロトコルURLパース標準ユーティリティ整備                                                                                                                            | 中       | TASK-AUTH-CALLBACK-001 Phase 12（苦戦箇所検出）                                                                                      | `docs/30-workflows/unassigned-task/task-protocol-url-parsing-utility.md`                                                                                                               |
| ~~UT-IMP-AUTH-CALLBACK-LIFECYCLE-CONTRACT-GUARD-001~~          | ~~authCallbackServer wait/stop 責務境界の契約ガード（timeout副作用禁止・stop冪等性）~~                                                                                       | ~~中~~   | **2026-02-28完了** TASK-FIX-AUTH-CALLBACK-SERVER-WORKER-EXIT-001 Phase 12（完了移管）                                                | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-auth-callback-lifecycle-contract-guard-001.md`                                                                             |
| UT-FIX-5-2                                                     | Preload Dialog API ハードコード削除                                                                                                                                          | 中       | TASK-FIX-5-1 Phase 10                                                                                                                | `docs/30-workflows/unassigned-task/task-ut-fix-5-2-preload-dialog-hardcode.md`                                                                                                         |
| ~~UT-FIX-5-3~~                                                 | ~~Preload Agent Abort セキュリティ修正~~                                                                                                                                     | ~~高~~   | ~~TASK-FIX-5-1 Phase 10~~                                                                                                            | ~~`docs/30-workflows/completed-tasks/task-ut-fix-5-3-preload-agent-abort.md`~~ **2026-02-10完了**                                                                                      |
| TASK-FIX-12-2-IPC-HARDCODE-FIX-UPDATER-AGENT                   | Updater/AgentHandler IPC チャネル名定数化                                                                                                                                    | 低       | TASK-FIX-12-1 Phase 12                                                                                                               | `docs/30-workflows/unassigned-task/task-fix-12-2-ipc-hardcode-fix-updater-agent.md`                                                                                                    |
| TASK-DOC-PHASE12-JUDGMENT-CRITERIA-001                         | Phase 12判断基準の明確化と漏れ防止強化                                                                                                                                       | 低       | TASK-FIX-6-1-STATE-CENTRALIZATION Phase 12                                                                                           | `docs/30-workflows/unassigned-task/task-doc-phase12-judgment-criteria-improvement.md`                                                                                                  |
| ~~UT-FIX-5-4~~                                                 | ~~AgentSDKAPI 型定義不一致修正~~                                                                                                                                             | ~~低~~   | ~~UT-FIX-5-3 Phase 12 アーキテクチャ検証~~                                                                                           | ~~`docs/30-workflows/completed-tasks/UT-FIX-5-4-AGENT-SDK-API-TYPE-MISMATCH/index.md`~~ **2026-02-10完了**                                                                             |
| ~~UT-STORE-HOOKS-REFACTOR-001~~                                | ~~Store Hooksを個別セレクタベースに再設計~~                                                                                                                                  | ~~中~~   | ~~TASK-UT-AUTH-MODE-UI-INTEGRATION タスク仕様書 セクション8~~                                                                        | ~~`docs/30-workflows/completed-tasks/UT-STORE-HOOKS-REFACTOR-001/index.md`~~ **2026-02-12完了（UT-STORE-HOOKS-COMPONENT-MIGRATION-001で実施）**                                        |
| UT-STORE-HOOKS-REFACTOR-002                                    | 状態セレクタのJSDoc追加                                                                                                                                                      | 低       | UT-STORE-HOOKS-REFACTOR-001 Phase 10最終レビュー                                                                                     | `docs/30-workflows/completed-tasks/task-ut-store-hooks-refactor-002-jsdoc.md`                                                                                                          |
| UT-STORE-HOOKS-REFACTOR-003                                    | 合成Hookを使用しているコンポーネントの段階的移行                                                                                                                             | 中       | UT-STORE-HOOKS-REFACTOR-001 Phase 10最終レビュー                                                                                     | `docs/30-workflows/completed-tasks/task-ut-store-hooks-refactor-003-migration.md`                                                                                                      |
| UT-FIX-APP-INITAUTH-CHECK-001                                  | App.tsxのinitializeAuth確認                                                                                                                                                  | 低       | TASK-UT-AUTH-MODE-UI-INTEGRATION Phase 10 MINOR指摘                                                                                  | `docs/30-workflows/completed-tasks/task-ut-fix-app-initauth-check.md`                                                                                                                  |
| UT-FIX-7-1-001                                                 | SkillService型アサーション→型ガード改善                                                                                                                                      | 低       | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION Phase 12                                                                                       | `docs/30-workflows/unassigned-task/task-ut-fix-7-1-001-skillservice-type-guard.md`                                                                                                     |
| UT-FIX-7-1-002                                                 | skillHandlers.ts機能別分割                                                                                                                                                   | 低       | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION Phase 12                                                                                       | `docs/30-workflows/unassigned-task/task-ut-fix-7-1-002-skillhandlers-split.md`                                                                                                         |
| UT-FIX-7-1-003                                                 | IPCレスポンスパターン統一                                                                                                                                                    | 低       | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION Phase 12                                                                                       | `docs/30-workflows/unassigned-task/task-ut-fix-7-1-003-ipc-response-pattern-unification.md`                                                                                            |
| UT-9B-H-001                                                    | IpcResult型の重複定義を@repo/sharedに統一。UT-9B-H-003教訓反映済み（L3型整合性、Prettier干渉リスク）                                                                         | 低       | TASK-9B-H-SKILL-CREATOR-IPC Phase 10 m-01                                                                                            | `docs/30-workflows/unassigned-task/task-9b-h-ipcresult-type-unification.md`                                                                                                            |
| UT-9B-H-002                                                    | SkillCreator IPCハンドラーの引数検証をZodスキーマに移行。UT-9B-H-003教訓反映済み（Zodセキュリティ共存設計）                                                                  | 低       | TASK-9B-H-SKILL-CREATOR-IPC Phase 10 m-02                                                                                            | `docs/30-workflows/unassigned-task/task-9b-h-zod-schema-migration.md`                                                                                                                  |
| ~~UT-9B-H-003~~                                                | ~~SkillCreator IPCセキュリティ強化（パストラバーサル対策、sanitizeError、schemaNameホワイトリスト）~~                                                                        | ~~高~~   | ~~TASK-9B-H-SKILL-CREATOR-IPC 最終品質レビュー~~                                                                                     | ~~`docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/index.md`~~ **2026-02-12完了（UT-9B-H-003-security-hardeningで実施）**                                             |
| UT-9B-H-004                                                    | SkillCreator設計書-実装整合性修正（Zod/型/メソッド名の乖離対応）。UT-9B-H-003教訓反映済み（TDDトレーサビリティ）                                                             | 中       | TASK-9B-H-SKILL-CREATOR-IPC 最終品質レビュー                                                                                         | `docs/30-workflows/unassigned-task/task-9b-h-design-implementation-alignment.md`                                                                                                       |
| UT-9B-H-005                                                    | Preload API二重公開パターン統一。UT-9B-H-003教訓反映済み（L3横展開評価）                                                                                                     | 低       | TASK-9B-H Phase 10 M-02 / Phase 11 D-3                                                                                               | `docs/30-workflows/unassigned-task/task-9b-h-api-dual-publishing-unification.md`                                                                                                       |
| task-imp-store-hooks-remaining-migration                       | 残コンポーネントの個別セレクタHook移行                                                                                                                                       | 低       | UT-STORE-HOOKS-COMPONENT-MIGRATION-001 Phase 12（スコープ外項目）                                                                    | `docs/30-workflows/unassigned-task/task-imp-store-hooks-remaining-migration.md`                                                                                                        |
| task-ref-store-hooks-deprecate-composite                       | 合成Store Hookの非推奨化・段階的削除                                                                                                                                         | 低       | UT-STORE-HOOKS-COMPONENT-MIGRATION-001 Phase 12（スコープ外項目）                                                                    | `docs/30-workflows/unassigned-task/task-ref-store-hooks-deprecate-composite.md`                                                                                                        |
| task-imp-phase12-auto-verification                             | Phase 12チェックリスト自動検証スクリプト                                                                                                                                     | 中       | UT-STORE-HOOKS-COMPONENT-MIGRATION-001 Phase 12（実装苦戦箇所）                                                                      | `docs/30-workflows/unassigned-task/task-imp-phase12-auto-verification.md`                                                                                                              |
| ~~UT-9B-I-001~~                                                | ~~カスタム型宣言ファイルと SDK 実型の共存整理~~                                                                                                                              | ~~低~~   | ~~TASK-9B-I-SDK-FORMAL-INTEGRATION Phase 12（未タスク検出）~~                                                                        | ~~`docs/30-workflows/completed-tasks/sdk-formal-integration/outputs/phase-12/ut-9b-i-001-custom-declare-module-cleanup.md`~~ **完了タスクに移動**                                      |
| UT-TEST-EVENT-STANDARDIZATION-001                              | テストイベントAPI標準化（happy-dom環境fireEvent統一）                                                                                                                        | 中       | UT-FIX-AGENTVIEW-INFINITE-LOOP-001 Phase 12（P39/P40教訓）                                                                           | `docs/30-workflows/unassigned-task/task-ut-test-event-standardization.md`                                                                                                              |
| UT-SETTINGSVIEW-INLINE-SELECTOR-001                            | SettingsView残存インラインセレクタの個別セレクタ移行                                                                                                                         | 低       | UT-FIX-AGENTVIEW-INFINITE-LOOP-001 Phase 10（MINOR #2）                                                                              | `docs/30-workflows/unassigned-task/task-ut-settingsview-inline-selector-migration.md`                                                                                                  |
| task-imp-vitest-mock-reset-utility-001                         | Vitest モック2段階リセットユーティリティ共通化                                                                                                                               | 中       | TASK-FIX-11-1-SDK-TEST-ENABLEMENT Phase 5（実装苦戦箇所）                                                                            | `docs/30-workflows/unassigned-task/task-imp-vitest-mock-reset-utility-001.md`                                                                                                          |
| task-ref-vitest-module-mock-audit-001                          | Vitest モジュールレベルモック監査・使い分けガイドライン策定                                                                                                                  | 低       | TASK-FIX-11-1-SDK-TEST-ENABLEMENT Phase 5（実装苦戦箇所）                                                                            | `docs/30-workflows/unassigned-task/task-ref-vitest-module-mock-audit-001.md`                                                                                                           |
| task-imp-vitest-alias-sync-automation-001                      | Vitest alias 設定と `@repo/shared` エクスポート整合の自動検証                                                                                                                | 中       | TASK-FIX-10-1-VITEST-ERROR-HANDLING Phase 8（スコープ外項目）                                                                        | `docs/30-workflows/unassigned-task/task-imp-vitest-alias-sync-automation-001.md`                                                                                                       |
| ~~UT-FIX-TS-VITEST-TSCONFIG-PATHS-001~~                        | ~~Vitest alias と tsconfig paths の同期自動化。vite-tsconfig-pathsプラグイン導入で27個の手動alias削除、6つの双方向チェックCIガード。60テスト全PASS~~                         | ~~中~~   | ~~TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 Phase 3（MINOR 指摘）~~                                                                   | ~~`docs/30-workflows/completed-tasks/task-vitest-tsconfig-paths-sync-automation.md`~~ **2026-02-24完了（実装: `docs/30-workflows/vitest-tsconfig-paths-sync/`）**                      |
| UT-PERF-001                                                    | グラフユーティリティ性能ベンチマーク基準再設計                                                                                                                               | 中       | TODO検出: `packages/shared/src/types/rag/graph/__tests__/utils.test.ts:791`                                                          | `docs/30-workflows/unassigned-task/task-ut-perf-001-graph-utils-performance-benchmark.md`                                                                                              |
| UT-TYPE-DATETIME-DOC-001                                       | 型日時表現のガイドライン策定とドキュメント化                                                                                                                                 | 低       | TASK-FIX-13-1-DEPRECATED-PROPERTY-MIGRATION Phase 12                                                                                 | `docs/30-workflows/unassigned-task/task-ut-type-datetime-doc-001-datetime-representation-guide.md`                                                                                     |
| ~~UT-FIX-IPC-RESPONSE-UNWRAP-001~~                             | ~~IPC レスポンスラッパー未展開修正（importedSkills.forEach クラッシュ）~~                                                                                                    | ~~高~~   | ~~ランタイムエラー調査（2026-02-13）~~                                                                                               | ~~`docs/30-workflows/completed-tasks/task-ut-fix-ipc-response-unwrap-001.md`~~ **2026-02-14完了**                                                                                      |
| UT-FIX-IPC-RESPONSE-UNWRAP-002                                 | Phase 10仕様書 `import()` 記載整合                                                                                                                                           | 低       | UT-FIX-IPC-RESPONSE-UNWRAP-001 Phase 10（MINOR M-1）                                                                                 | `docs/30-workflows/unassigned-task/task-ut-fix-ipc-response-unwrap-002-phase10-spec-alignment.md`                                                                                      |
| UT-FIX-IPC-RESPONSE-UNWRAP-003                                 | `safeInvokeUnwrap` 型アサーション削減                                                                                                                                        | 低       | UT-FIX-IPC-RESPONSE-UNWRAP-001 Phase 10（MINOR M-2）                                                                                 | `docs/30-workflows/unassigned-task/task-ut-fix-ipc-response-unwrap-003-safeinvokeunwrap-type-guard.md`                                                                                 |
| ~~UT-FIX-IPC-HANDLER-DOUBLE-REG-001~~                          | ~~IPC ハンドラ二重登録防止修正（activate イベント）~~                                                                                                                        | ~~高~~   | ~~ランタイムエラー調査（2026-02-13）~~                                                                                               | ~~`docs/30-workflows/completed-tasks/task-ut-fix-ipc-handler-double-reg-001.md`~~ **2026-02-14完了**                                                                                   |
| task-sec-ipc-lifecycle-audit-001                               | Electron ライフサイクルイベント IPC リスナー管理監査                                                                                                                         | 中       | UT-FIX-IPC-HANDLER-DOUBLE-REG-001 Phase 12（実装苦戦箇所）                                                                           | `docs/30-workflows/unassigned-task/task-sec-ipc-lifecycle-audit-001.md`                                                                                                                |
| task-imp-ipc-registration-verify-001                           | IPC ハンドラ登録整合性自動検証テスト                                                                                                                                         | 中       | UT-FIX-IPC-HANDLER-DOUBLE-REG-001 Phase 12（実装苦戦箇所）                                                                           | `docs/30-workflows/unassigned-task/task-imp-ipc-registration-verify-001.md`                                                                                                            |
| UT-9A-B-001                                                    | IPC入力バリデーション標準化                                                                                                                                                  | 中       | TASK-9A-B Phase 12（未タスク検出）                                                                                                   | `docs/30-workflows/unassigned-task/task-ipc-validation-standardize-improvements.md`                                                                                                    |
| UT-9A-B-002                                                    | IPCエラーサニタイズ共通ユーティリティ化                                                                                                                                      | 中       | TASK-9A-B Phase 12（未タスク検出）                                                                                                   | `docs/30-workflows/unassigned-task/task-ipc-error-sanitize-refactoring.md`                                                                                                             |
| UT-9A-B-003                                                    | IPCテストhandlerMapモックユーティリティ共通化                                                                                                                                | 低       | TASK-9A-B Phase 12（未タスク検出）                                                                                                   | `docs/30-workflows/unassigned-task/task-ipc-test-mock-utils-improvements.md`                                                                                                           |
| ~~UT-FIX-SKILL-IMPORT-INTERFACE-001~~                          | ~~skill:import IPCインターフェース不整合修正~~                                                                                                                               | ~~高~~   | ~~開発実行時ランタイムエラー（2026-02-20）~~                                                                                         | ~~[00-ut-fix-skill-import-interface-001.md](../../../../docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-ut-fix-skill-import-interface-001.md)~~ **2026-02-21完了** |
| ~~UT-FIX-SKILL-REMOVE-INTERFACE-001~~                          | ~~skill:remove IPCインターフェース不整合修正~~                                                                                                                               | ~~高~~   | ~~UT-FIX-SKILL-IMPORT-INTERFACE-001 水平思考（2026-02-20）~~                                                                         | ~~[00-ut-fix-skill-remove-interface-001.md](../../../../docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-ut-fix-skill-remove-interface-001.md)~~ **2026-02-20完了** |
| ~~UT-FIX-SKILL-VALIDATION-P42-001~~                            | ~~skillHandlers P42準拠バリデーション横展開~~                                                                                                                                | ~~中~~   | ~~UT-FIX-SKILL-REMOVE-INTERFACE-001 実装時検出（2026-02-20）~~ **完了: 2026-02-24（UT-FIX-SKILL-VALIDATION-CONSISTENCY-001で実施）** | `docs/30-workflows/completed-tasks/skill-validation-consistency/`                                                                                                                      |
| UT-FIX-SKILL-IPC-ERROR-RESPONSE-001                            | skillHandlers IPCバリデーションエラー応答パターン統一                                                                                                                        | 中       | UT-FIX-SKILL-REMOVE-INTERFACE-001 実装時検出（2026-02-20）                                                                           | `docs/30-workflows/unassigned-task/task-ipc-skill-error-response-unification.md`                                                                                                       |
| TASK-9A-C-001                                                  | SkillCodeEditor シンタックスハイライト機能                                                                                                                                   | 中       | TASK-9A-C Phase 1（将来拡張ポイント: language prop）                                                                                 | `docs/30-workflows/unassigned-task/task-9a-c-syntax-highlighting.md`                                                                                                                   |
| ~~TASK-9A-C-002~~                                              | ~~SkillEditor ファイル作成・削除機能（CRUD完全化）~~ **完了: 2026-02-26（TASK-9Aへ統合）**                                                                                   | ~~中~~   | ~~TASK-9A-C Phase 1-2（スコープ外: readFile/writeFileのみ実装）~~                                                                    | `docs/30-workflows/completed-tasks/unassigned-task/task-9a-c-file-crud-operations.md`                                                                                                  |
| TASK-9A-C-003                                                  | SkillCodeEditor Monaco/CodeMirror エディタ移行                                                                                                                               | 低       | TASK-9A-C Phase 2（将来拡張ポイント: textarea→高機能エディタ）                                                                       | `docs/30-workflows/unassigned-task/task-9a-c-code-editor-migration.md`                                                                                                                 |
| ~~TASK-9A-C-004~~                                              | ~~SkillEditor Phase 12仕様同期ガード自動化（Part 1/2要件・監査判定・未タスクフォーマットの再発防止）~~ **完了: 2026-02-26（Phase 12完了に伴いcompletedへ移管）**             | ~~中~~   | ~~TASK-9A Phase 12再確認（苦戦箇所抽出: 2026-02-26）~~                                                                               | `docs/30-workflows/completed-tasks/unassigned-task/task-9a-c-phase12-spec-sync-guard.md`                                                                                               |
| TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001                      | @repo/shared ソース構造二重性の統一（types/ と src/types/ の整理）                                                                                                           | 中       | TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 Phase 5                                                                                     | `docs/30-workflows/unassigned-task/task-refactor-shared-source-structure-consolidation.md`                                                                                             |
| ~~TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001~~                    | ~~@repo/shared モジュール解決3層整合CIガード~~                                                                                                                               | ~~高~~   | ~~TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 Phase 10 MINOR~~ **完了: 2026-02-22**                                                     | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/`                                                                                                                           |
| ~~UT-FIX-SKILL-IMPORT-RETURN-TYPE-001~~                        | ~~skill:import IPCハンドラ戻り値型不整合修正（ImportResult→ImportedSkill変換）~~                                                                                             | ~~高~~   | ~~20フレームワーク多角的分析（2026-02-21）~~ **完了: 2026-02-21**                                                                    | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-task-ut-fix-skill-import-return-type-001.md`                                                                      |
| UT-FIX-SKILL-IPC-NAMING-P45-001                                | skillHandlers IPC引数命名統一（skillId → skillName横展開）                                                                                                                   | 中       | UT-FIX-SKILL-IMPORT-INTERFACE-001 / UT-FIX-SKILL-REMOVE-INTERFACE-001 実装時検出（2026-02-20）                                       | `docs/30-workflows/unassigned-task/task-ut-fix-skill-ipc-naming-p45-001.md`                                                                                                            |
| ~~UT-IMP-PHASE11-WORKTREE-PROTOCOL-001~~                       | ~~Phase 11 Worktree環境手動テスト実行プロトコル策定~~ **完了: 2026-02-25**                                                                                                   | ~~中~~   | ~~UT-FIX-SKILL-REMOVE-INTERFACE-001 実装苦戦箇所（2026-02-21）~~                                                                     | `docs/30-workflows/completed-tasks/task-imp-phase11-worktree-testing-protocol-001.md`                                                                                                  |
| UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001                       | IPCハンドラ粒度カバレッジ計測インフラ構築                                                                                                                                    | 中       | UT-FIX-SKILL-REMOVE-INTERFACE-001 実装苦戦箇所（2026-02-21）                                                                         | `docs/30-workflows/completed-tasks/task-imp-ipc-handler-coverage-granular-001.md`                                                                                                      |
| UT-IMP-MULTIAGENT-PHASE-ORDERING-GUARD-001                     | マルチエージェントPhase依存順序ガード                                                                                                                                        | 中       | UT-FIX-SKILL-REMOVE-INTERFACE-001 実装苦戦箇所（2026-02-21）                                                                         | `docs/30-workflows/unassigned-task/task-imp-multiagent-phase-ordering-guard-001.md`                                                                                                    |
| ~~UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001~~                  | ~~skill:ハンドラIPCレスポンス形式統一（{ success, data }ラッパー vs 直接型T混在解消）~~                                                                                      | ~~中~~   | ~~UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 Phase 12（コード調査・2026-02-21）~~ **完了: 2026-02-25**                                      | `docs/30-workflows/completed-tasks/ut-fix-skill-ipc-response-consistency-001/index.md`                                                                                                 |
| UT-IMP-SKILL-IPC-RESPONSE-CONTRACT-GUARD-001                   | skill IPCレスポンス契約マトリクスと自動整合チェック                                                                                                                          | 中       | UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 Phase 12（実装苦戦箇所・2026-02-25）                                                       | `docs/30-workflows/unassigned-task/task-imp-skill-ipc-response-contract-guard-001.md`                                                                                                  |
| UT-IMP-PHASE12-IMPLEMENTATION-GUIDE-QUALITY-GATE-001           | Phase 12 実装ガイド必須要件の品質ゲート化（理由先行/日常例え/型API明記の機械検証）                                                                                           | 中       | UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 Phase 12（実装苦戦箇所・2026-02-25）                                                       | `docs/30-workflows/unassigned-task/task-imp-phase12-implementation-guide-quality-gate-001.md`                                                                                          |
| UT-FIX-SKILL-GETDETAIL-NAMING-DRIFT-001                        | skill:get-detail引数名ドリフト修正（P45パターン：skillId→skillName統一）                                                                                                     | 低       | UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 Phase 12（コード調査・2026-02-21）                                                               | `docs/30-workflows/unassigned-task/task-skill-getdetail-naming-drift.md`                                                                                                               |
| ~~UT-FIX-SKILL-VALIDATION-CONSISTENCY-001~~                    | ~~skill:ハンドラP42準拠バリデーション形式統一（UT-FIX-SKILL-VALIDATION-P42-001の補完・苦戦箇所付き）~~                                                                       | ~~中~~   | ~~UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 Phase 12（コード調査・2026-02-21）~~ **完了: 2026-02-24**                                      | `docs/30-workflows/completed-tasks/skill-validation-consistency/`                                                                                                                      |
| UT-IMP-UNASSIGNED-FORMAT-NORMALIZATION-001                     | 未タスク指示書フォーマット正規化（9セクション未準拠67件の是正）                                                                                                              | 中       | UT-FIX-SKILL-IMPORT-ID-MISMATCH-001 監査（2026-02-22）                                                                               | `docs/30-workflows/unassigned-task/task-imp-unassigned-task-format-normalization-001.md`                                                                                               |
| ~~UT-FIX-SKILL-IMPORT-ID-MISMATCH-001~~                        | ~~SkillImportDialog skill.id→skill.name不一致修正（Rendererがハッシュを渡しgetSkillByNameが失敗）~~                                                                          | ~~高~~   | ~~ランタイムエラー調査（2026-02-22）~~ **完了: 2026-02-22**                                                                          | `docs/30-workflows/completed-tasks/skill-import-id-mismatch-fix/`                                                                                                                      |
| UT-TYPE-SKILL-IDENTIFIER-BRANDED-001                           | Skill識別子Branded Type導入（SkillId / SkillName コンパイル時型区別）                                                                                                        | 中       | UT-FIX-SKILL-IMPORT-ID-MISMATCH-001 実装苦戦箇所（2026-02-22）                                                                       | `docs/30-workflows/completed-tasks/task-type-skill-identifier-branded.md`                                                                                                              |
| UT-REFACTOR-SKILL-IMPORT-DIALOG-DEDUP-001                      | SkillImportDialog同名コンポーネント解消（コンポーネント命名重複リファクタリング）                                                                                            | 低       | UT-FIX-SKILL-IMPORT-ID-MISMATCH-001 実装苦戦箇所（2026-02-22）                                                                       | `docs/30-workflows/unassigned-task/task-refactor-skill-import-dialog-dedup.md`                                                                                                         |
| ~~UT-UI-THEME-DYNAMIC-SWITCH-001~~                             | ~~settingsSlice テーマ動的切替対応（kanagawa-dragon固定 → 4モード動的切替）~~                                                                                                | ~~中~~   | ~~TASK-UI-00-TOKENS Phase 12（未タスク検出・2026-02-22）~~ **完了: 2026-02-25**                                                      | `docs/30-workflows/completed-tasks/ut-ui-theme-dynamic-switch-001.md`                                                                                                                  |
| UT-UI-TAILWIND-TOKENS-INTEGRATION-001                          | Tailwind CSS カスタムプロパティ統合（tokens.css変数をTailwind theme設定に反映）                                                                                              | 低       | TASK-UI-00-TOKENS Phase 12（未タスク検出・2026-02-22）                                                                               | `docs/30-workflows/unassigned-task/ut-ui-tailwind-tokens-integration-001.md`                                                                                                           |
| UT-IMP-THEME-DYNAMIC-SWITCH-ROBUSTNESS-001                     | テーマ動的切替の再発防止ガード強化（状態責務分離/Hook依存安定化/Phase 12証跡同期）                                                                                           | 中       | UT-UI-THEME-DYNAMIC-SWITCH-001 Phase 12（実装苦戦箇所・2026-02-25）                                                                  | `docs/30-workflows/completed-tasks/task-imp-theme-dynamic-switch-robustness-001.md`                                                                                                    |
| UT-UI-ATOMS-PROP-NAMING-001                                    | RelativeTime Props命名統一（仕様書updateInterval → 実装refreshInterval）                                                                                                     | 低       | TASK-UI-00-ATOMS Phase 10 MINOR M-1（2026-02-23）                                                                                    | `docs/30-workflows/completed-tasks/unassigned-task/task-ui-atoms-prop-naming.md`                                                                                                       |
| UT-UI-ATOMS-TOUCH-TARGET-001                                   | SuggestionBubble size="sm" タッチターゲット Apple HIG 44px準拠                                                                                                               | 低       | TASK-UI-00-ATOMS Phase 10 MINOR M-2（2026-02-23）                                                                                    | `docs/30-workflows/completed-tasks/unassigned-task/task-ui-atoms-touch-target.md`                                                                                                      |
| UT-UI-ATOMS-SPEC-CLARIFICATION-001                             | SuggestionBubble success-bounceマイクロインタラクション仕様書責務記述明確化                                                                                                  | 低       | TASK-UI-00-ATOMS Phase 10 MINOR M-3（2026-02-23）                                                                                    | `docs/30-workflows/completed-tasks/unassigned-task/task-ui-atoms-spec-clarification.md`                                                                                                |
| TASK-IMP-MODULE-SYNC-REPORT-ENHANCEMENT-001                    | check-shared-module-sync レポート拡充（修正ガイダンス・サマリー数値・printSummary設計準拠）                                                                                  | 低       | TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001 Phase 10 MINOR（2026-02-22）                                                                 | `docs/30-workflows/unassigned-task/task-imp-module-sync-report-enhancement.md`                                                                                                         |
| ~~UT-IPC-CHANNEL-NAMING-AUDIT-001~~                            | ~~IPCチャネル命名規則の横断的適用監査と統一~~                                                                                                                                | ~~中~~   | ~~UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 Phase 12（未タスク検出・2026-02-24）~~ **完了: 2026-02-25（spec_created）**                   | `docs/30-workflows/completed-tasks/task-ipc-channel-naming-audit-001.md`                                                                                                               |
| ~~UT-IPC-AUTH-HANDLE-DUPLICATE-001~~                           | ~~`AUTH_*` の `ipcMain.handle` 重複式を定数化・登録一元化で解消~~                                                                                                            | ~~中~~   | ~~UT-IPC-CHANNEL-NAMING-AUDIT-001 Phase 12（MINOR M-002・2026-02-25）~~ **完了: 2026-02-25**                                         | `docs/30-workflows/completed-tasks/task-ipc-auth-handle-duplicate-001.md`                                                                                                              |
| UT-SPEC-ONLY-TASK-WORKFLOW-001                                 | 仕様書修正のみタスクのPhaseテンプレート・grep検証TDD標準化                                                                                                                   | 中       | UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 Phase 12（未タスク検出・2026-02-24）                                                            | `docs/30-workflows/unassigned-task/task-spec-only-task-workflow-automation-001.md`                                                                                                     |
| UT-FIX-SKILL-IPC-ARG-FORM-UNIFICATION-001                      | skill:ハンドラIPC引数形式統一（オブジェクト型 vs 直接引数型）                                                                                                                | 低       | UT-FIX-SKILL-VALIDATION-CONSISTENCY-001 Phase 12（苦戦箇所4・2026-02-24）                                                            | [`docs/30-workflows/unassigned-task/task-skill-ipc-arg-form-unification.md`](../../../docs/30-workflows/unassigned-task/task-skill-ipc-arg-form-unification.md)                        |
| UT-IPC-DATA-FLOW-NULLABLE-CONSISTENCY-001                      | SkillUsageSummary.lastUsed nullable整合性修正（Phase 1/2分析 nullable=Yes vs 実仕様 non-nullable差異）                                                                       | 低       | UT-IPC-DATA-FLOW-TYPE-GAPS-001 Phase 10 MINOR M-1（2026-02-24）                                                                      | `docs/30-workflows/completed-tasks/unassigned-task/task-ipc-data-flow-nullable-consistency-001.md`                                                                                     |
| ~~UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001~~                  | ~~未タスク監査の対象スコープ制御とベースライン分離（current/baseline判定）~~                                                                                                 | ~~中~~   | ~~UT-IPC-DATA-FLOW-TYPE-GAPS-001 Phase 12 再監査（苦戦箇所・2026-02-24）~~ **完了: 2026-02-25（Phase 1-12）**                        | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-unassigned-audit-scope-control-001.md`                                                                                     |
| ~~UT-IMP-PHASE12-VALIDATION-COMMAND-STANDARDIZATION-001~~      | ~~Phase 12 検証コマンド標準化ガード（`quick_validate.js` 統一 + `verify-all-specs --workflow` 必須化）~~                                                                     | ~~中~~   | ~~UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001 Phase 12再確認（苦戦箇所・2026-02-25）~~ **完了: 2026-02-25（Phase 12完了移管）**        | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-validation-command-standardization-001.md`                                                                         |
| UT-IMP-IPC-PRELOAD-SPEC-SYNC-CI-GUARD-001                      | task-9D〜9J 仕様契約ドリフト自動検証CIガード（旧パス/artifacts/Date方針）                                                                                                    | 中       | UT-IMP-IPC-PRELOAD-EXTENSION-SPEC-ALIGNMENT-001 実装苦戦箇所（2026-02-25）                                                           | `docs/30-workflows/unassigned-task/task-imp-ipc-preload-spec-sync-ci-guard-001.md`                                                                                                     |
| UT-IMP-PHASE12-SPEC-SYNC-SUBAGENT-GUARD-001                    | Phase 12 仕様書別SubAgent同期ガードの自動化（4仕様書同時更新 + current/baseline分離判定の標準化）                                                                            | 中       | UT-FIX-SKILL-EXECUTE-INTERFACE-001 Phase 12再確認（実装苦戦箇所・2026-02-25）                                                        | `docs/30-workflows/unassigned-task/task-imp-phase12-spec-sync-subagent-guard-001.md`                                                                                                   |
| UT-IMP-PHASE12-SPEC-VERSION-CONSISTENCY-GUARD-001              | Phase 12 仕様更新の版数・手順整合ガード（spec-update-summary / task-workflow / lessons / SKILL / LOGS 同期）                                                                 | 中       | UT-IMP-QUICK-VALIDATE-EMPTY-FIELD-GUARD-001 Phase 12再監査（実装苦戦箇所・2026-02-27）                                               | `docs/30-workflows/unassigned-task/task-imp-phase12-spec-version-consistency-guard-001.md`                                                                                             |
| ~~UT-IMP-PHASE12-SUBAGENT-ARTIFACT-GUARD-001~~                 | ~~Phase 12 3workflow再監査のSubAgent成果物突合ガード（仕様書別実行ログ + 監査証跡固定）~~ **完了: 2026-03-04（Phase 12完了移管）**                                           | ~~中~~   | ~~TASK-FIX-SKILL-IMPORT 3連続是正 Phase 12再確認（苦戦箇所・2026-03-04）~~                                                           | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-subagent-artifact-guard-001.md`                                                                                    |
| ~~UT-IMP-PHASE12-SYSTEM-SPEC-EXTRACTION-GUARD-001~~            | ~~Phase 12 システム仕様スキル抽出・反映ガード（resource-map起点の必要仕様抽出 + 台帳同時同期）~~ **完了: 2026-03-04（Phase 12完了移管）**                                    | ~~中~~   | ~~TASK-FIX-SKILL-IMPORT 3連続是正 実装追補（苦戦箇所・2026-03-04）~~                                                                 | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-system-spec-extraction-guard-001.md`                                                                               |
| ~~UT-IMP-PHASE12-THREE-WORKFLOW-AUDIT-SCOPE-GUARD-001~~        | ~~Phase 12 3workflow再監査スコープ判定ガード（証跡集約 + `scope.currentFiles`/`currentViolations` 固定）~~ **完了: 2026-03-04（Phase 12完了移管）**                          | ~~中~~   | ~~TASK-FIX-SKILL-IMPORT 3連続是正 実装追補（苦戦箇所・2026-03-04）~~                                                                 | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-three-workflow-audit-scope-guard-001.md`                                                                           |
| ~~UT-IMP-SKILL-CENTER-PREVIEW-BUILD-GUARD-001~~                | ~~SkillCenter Phase 11再撮影の preview preflight ガード（build疎通確認 + 失敗時未タスク化）~~ **完了: 2026-03-04（Phase 12完了移管）**                                       | ~~中~~   | ~~TASK-FIX-SKILL-IMPORT 3連続是正 Phase 12再確認（preview再撮影ブロッカー・2026-03-04）~~                                            | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-skill-center-preview-build-guard-001.md`                                                                                   |
| UT-IMP-SKILL-CENTER-HOTFIX-COVERAGE-INCLUDE-GUARD-001          | SkillCenter hotfix 対象カバレッジ include path ガード導入（実在パス検証 + `3 files / 30 tests` 固定）                                                                        | 中       | TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001 Phase 12 再確認（coverage include path誤指定・2026-03-04）                        | `docs/30-workflows/unassigned-task/task-imp-skill-center-hotfix-coverage-include-guard-001.md`                                                                                         |
| UT-IMP-PHASE12-SCREENSHOT-PORT-CONFLICT-GUARD-001              | screenshot 再取得時の `Port 5174` 競合ガード（実行前ポート検査 + 競合分岐記録）                                                                                              | 中       | TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001 Phase 12 再確認（画面証跡再取得運用・2026-03-04）                                        | `docs/30-workflows/unassigned-task/task-imp-phase12-screenshot-port-conflict-guard-001.md`                                                                                             |
| UT-IMP-PHASE11-SCREENSHOT-COVERAGE-MATRIX-GUARD-001            | Phase 11 画面カバレッジマトリクス必須化ガード（視覚/非視覚TCの設計意図固定 + warning常態化防止）                                                                             | 中       | UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001 Phase 12 再確認（coverage matrix warning・2026-03-04）                      | `docs/30-workflows/unassigned-task/task-imp-phase11-screenshot-coverage-matrix-guard-001.md`                                                                                           |
| ~~UT-IMP-PHASE11-AUTHKEY-SCREENSHOT-SELECTOR-DRIFT-GUARD-001~~ | ~~auth-key Phase 11 スクリーンショット取得スクリプトのセレクタドリフト防止（`data-testid` 優先 + 失敗時デバッグログ + preflight）~~ **完了: 2026-03-06（Phase 12完了移管）** | ~~中~~   | ~~TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001 再監査（画面証跡追加時のタイムアウト・2026-03-05）~~                                        | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase11-authkey-screenshot-selector-drift-guard-001.md`                                                                    |
| ~~UT-IMP-SKILLHANDLERS-AUTHKEY-DI-BOUNDARY-GUARD-001~~         | ~~`skillHandlers.ts` の DI境界整理ガード（`AuthKeyService` 注入経路の責務分離 + composition root 集約 + 回帰テスト固定）~~ **完了: 2026-03-06（Phase 12完了移管）**          | ~~中~~   | ~~TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001 Phase 10 MINOR + Phase 12 再確認（責務肥大化/教訓反映・2026-03-06）~~                       | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-skillhandlers-authkey-di-boundary-guard-001.md`                                                                            |
| ~~UT-IMP-PHASE12-TARGETED-VITEST-RUN-GUARD-001~~               | ~~Phase 12 再監査で対象テストのみを確実実行するガード（`pnpm exec vitest run` 直指定 + スクリプト実在 preflight）~~ **完了: 2026-03-05（Phase 12完了移管）**                 | ~~中~~   | ~~TASK-UI-01-C Phase 12 準拠再確認（実装苦戦箇所・2026-03-05）~~                                                                     | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-targeted-vitest-run-guard-001.md`                                                                                  |
| ~~UT-IMP-DESKTOP-TESTRUN-SIGTERM-FALLBACK-GUARD-001~~          | ~~`apps/desktop test:run` の `SIGTERM` 中断時フォールバックガード（失敗ログ固定 + 分割実行標準化 + 3仕様同期）~~ **完了: 2026-03-05（Phase 12完了移管）**                    | ~~中~~   | ~~TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001 Phase 12 再確認（長時間fixtureテスト運用の苦戦箇所・2026-03-05）~~                      | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-desktop-testrun-sigterm-fallback-guard-001.md`                                                                             |
| ~~UT-IMP-TASK9J-PHASE12-IPC-SYNC-AUTO-VERIFY-001~~             | ~~TASK-9J Phase 12 IPC同期自動検証ガード（5仕様書同期 + handler/register/preload 三点突合の機械判定）~~                                                                      | ~~中~~   | ~~TASK-9J-skill-analytics Phase 12再確認（実装苦戦箇所・2026-02-28）~~ **完了: 2026-02-28（Phase 12完了移管）**                      | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task9j-phase12-ipc-sync-auto-verify-001.md`                                                                                |
| UT-IMP-AIWORKFLOW-UNASSIGNED-TABLE-DEDUP-001                   | Phase 12 残課題テーブル重複・状態矛盾検知強化（同一ID一意性監査 + 完了/未完了矛盾検知）                                                                                      | 中       | TASK-9F Phase 12 再監査（仕様台帳再確認・2026-02-27）                                                                                | `docs/30-workflows/unassigned-task/task-imp-aiworkflow-unassigned-table-dedup-001.md`                                                                                                  |
| UT-IMP-AIWORKFLOW-SKILL-ENTRYPOINT-COVERAGE-GUARD-001          | aiworkflow-requirements の入口導線整流（`SKILL.md` / `quick-reference` / `resource-map` と `quick_validate` の整合）                                                         | 中       | UT-TASK-10A-B-008 Phase 12 追補4-5（system spec 再同期・2026-03-06）                                                                 | `docs/30-workflows/completed-tasks/ut-task-10a-b-008-unassigned-count-resync-guard/unassigned-task/task-imp-aiworkflow-skill-entrypoint-coverage-guard-001.md`                         |
| ~~UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001~~                  | ~~Phase 12 仕様更新リンク同期ガード強化（task-workflow/SKILL/LOGSの3点同期）~~                                                                                               | ~~中~~   | ~~UT-IPC-AUTH-HANDLE-DUPLICATE-001 Phase 12 再確認（苦戦箇所・2026-02-25）~~ **完了: 2026-02-25（spec_created）**                    | `docs/30-workflows/completed-tasks/task-imp-aiworkflow-spec-reference-sync-001.md`                                                                                                     |

| UT-10A-E-D-001                                                 | quality gate lint コマンドパス整合                                                                                                                                           | 中       | TASK-10A-E-D Phase 10 MINOR（2026-03-08）                                                                                            | `docs/30-workflows/unassigned-task/task-10a-e-d-lint-command-path-alignment-001.md`                                                                                                    |
| ~~UT-IMP-PHASE12-WORKFLOW10-COMPLIANCE-FIX-001~~                   | ~~Workflow10 の Phase 7/12 準拠不足是正~~                                                                                                                                        | ~~中~~       | ~~TASK-10A-E-D branch横断再監査（2026-03-08）~~ **再評価クローズ: 2026-03-08（workflow10 再監査完了）**                                                                                          | `docs/30-workflows/completed-tasks/10-TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001/unassigned-task/task-imp-phase12-workflow10-compliance-fix-001.md`                                                                                                  |
| UT-IMP-PHASE12-WORKFLOW11-COMPLIANCE-FIX-001                   | Workflow11 の Phase 1-11 構造不足と Phase 12不足是正                                                                                                                         | 中       | TASK-10A-E-D branch横断再監査（2026-03-08）                                                                                          | `docs/30-workflows/unassigned-task/task-imp-phase12-workflow11-compliance-fix-001.md`                                                                                                  |
| UT-IMP-PHASE12-WORKFLOW12-IMPLEMENTATION-GUIDE-001             | Workflow12 の実装ガイド欠落是正                                                                                                                                              | 中       | TASK-10A-E-D branch横断再監査（2026-03-08）                                                                                          | `docs/30-workflows/unassigned-task/task-imp-phase12-workflow12-implementation-guide-001.md`                                                                                            |
| UT-PERSIST-MIGRATION-001                                       | Zustand Persist バージョニングとマイグレーション機構                                                                                                                         | 中       | TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001                                                                                     | `docs/30-workflows/unassigned-task/task-persist-migration-versioning.md`                                                                                                               |
| UT-PERSIST-VALIDATION-002                                      | Zustand Persist 全フィールド iterable ガード拡張                                                                                                                             | 低       | TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001                                                                                     | `docs/30-workflows/unassigned-task/task-persist-field-validation-guard.md`                                                                                                             |

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

| バージョン | 日付           | 変更内容                                                                                                                                                                                                                                                          |
| ---------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1.67.33** | **2026-03-06** | **UT-IMP-AIWORKFLOW-SKILL-ENTRYPOINT-COVERAGE-GUARD-001 を登録**: `aiworkflow-requirements` の `quick_validate` warning 145件を「SKILL.md 全列挙」で雑に解消せず、`SKILL.md` / `indexes/quick-reference.md` / `indexes/resource-map.md` の入口設計と validator 判定を両立させる未タスクを残課題テーブルへ追加。苦戦箇所と再利用方針を `lessons-learned.md` / `SKILL.md` / `LOGS.md` へ同期 |
| **1.67.33** | **2026-03-07** | **TASK-10A-F 完了同期**: `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/` の Phase 1-12 完了、Phase 11 スクリーンショット11件、Step 1-A〜Step 2 の仕様同期（`arch-state-management` / `ui-ux-feature-components` / `task-workflow` / LOGS / SKILL / topic-map再生成）を記録 |
| **1.67.34** | **2026-03-08** | **TASK-10A-F 苦戦箇所由来の未タスク2件登録**: `UT-10A-F-SCREENSHOT-HARNESS-HARDENING`（Screenshot Harness data-testid標準化、苦戦箇所#8）、`UT-10A-F-2WORKFLOW-BASELINE-NORMALIZATION`（2Workflow Baseline正規化自動化、苦戦箇所#6/#7）を残課題テーブルへ追加。open backlog 3→5件。既存3件の§8参照情報を `arch-state-management.md` / `lessons-learned.md` 新規セクションへ更新 |
| **1.67.32** | **2026-03-06** | **UT-TASK-10A-B-008 追補3を skill-creator 導線改善まで拡張**: repo 内 `skill-creator/SKILL.md` に未リンク reference 群の直接参照導線を追加し、`resource-map` 偏重で残っていた `quick_validate` warning 26件を 0 件へ解消。system spec には「Task本体の実装 + 再発防止スキル改善」を同一ターンで残す運用を追記 |
| **1.67.31** | **2026-03-06** | **UT-TASK-10A-B-008 Phase 12 Task 1 の内容準拠を追補**: `outputs/phase-12/implementation-guide.md` を理由先行 / 日常例え / TypeScript型 / API・CLI シグネチャ / 使用例 / エラー処理 / 設定一覧まで補強し、`validate-phase12-implementation-guide.js` を追加。Task 12-1 が「Part 1/2 の存在」だけでなく内容要件まで満たすことを機械検証へ昇格 |
| **1.67.30** | **2026-03-06** | **UT-TASK-10A-B-008 再監査追補を同期**: ユーザー明示の screenshot 要求に基づき SkillAnalysisView の再監査を実施し、`useSkillAnalysis` の StrictMode ローディング固着修正、screenshot スクリプトの loaded-state / light-theme 対応、Phase 11 証跡 8 ケース再取得を完了記録へ追記 |
| **1.67.29** | **2026-03-06** | **UT-TASK-10A-B-008 完了を同期**: `UT-TASK-10A-B-003` と `UT-TASK-10A-B-008` を完了表記へ更新し、TASK-10A-B の current active set を `002 / 004 / 005 / 006 / 007 / 009` に再計算。`task-workflow.md` / `ui-ux-feature-components.md` / parent `unassigned-task-detection.md` を同一ターンで再同期し、`validate-task10ab-ledger-sync` を検証コマンドへ追加 |
| **1.67.27** | **2026-03-06** | **TASK-UI-02 workflow を completed-tasks へ移管**: `task-057-ui-02-global-nav-core/` を `docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/` へ移動し、派生未タスク 2 件も `unassigned-task/` 配下へ移管。Task 12 成果物と残課題導線を completed workflow 基準へ統一 |
| **1.67.26** | **2026-03-06** | **TASK-UI-02 派生未タスク2件を同期**: `TASK-UI-02-GLOBAL-NAV-CORE` 節へ `UT-IMP-PHASE12-UI-DOMAIN-SPEC-SYNC-GUARD-001` と `UT-IMP-PHASE12-WORKFLOW-BODY-STALE-GUARD-001` を追加し、domain UI spec 同期漏れと workflow 本文 stale を未タスクとして追跡可能にした |
| **1.67.25** | **2026-03-06** | **TASK-UI-02 再々監査の workflow 本文 stale 是正を反映**: `TASK-UI-02-GLOBAL-NAV-CORE` 節へ `phase-1..11` 本文仕様書の completed 同期を追記し、検証証跡へ pending 0件確認を追加。苦戦箇所を「成果物 / 台帳 / 本文仕様書」の三層同期へ拡張 |
| **1.67.24** | **2026-03-06** | **TASK-INVESTIGATE 関連未タスクリンクを再監査基準へ是正**: `UT-IMP-PHASE12-TASK-INVESTIGATE-FIVE-MINUTE-CARD-SYNC-VALIDATOR-001` の参照先を、実体配置済みの `docs/30-workflows/completed-tasks/task-imp-phase12-task-investigate-five-minute-card-sync-validator-001.md` へ更新。`verify-unassigned-links` 失敗要因だった completed 移管後のリンクドリフトを解消 |
| **1.67.23** | **2026-03-06** | **TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001 を completed-tasks へ移管**: `outputs/phase-12` 実体と `phase-12-documentation.md` completed を確認後、workflow本体を `docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001/` へ移動。関連未タスク2件（`UT-IMP-PHASE11-AUTHKEY-SCREENSHOT-SELECTOR-DRIFT-GUARD-001` / `UT-IMP-SKILLHANDLERS-AUTHKEY-DI-BOUNDARY-GUARD-001`）を `completed-tasks/unassigned-task/` へ移管し、残課題テーブルを完了表記へ同期 |
| **1.67.22** | **2026-03-06** | **UT-IMP-SKILLHANDLERS-AUTHKEY-DI-BOUNDARY-GUARD-001 を残課題へ登録**: `TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001` の再確認で残存した `skillHandlers.ts` の責務肥大化を未タスク化。DI境界整理（composition root集約）、回帰テスト固定、教訓同期を1セットで実施する導線を追加し、同タスク完了節の「関連未タスク」欄へ追記 |
| **1.67.21** | **2026-03-06** | **TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001 の完了台帳を強化**: 完了タスクセクションを新設し、SubAgent分担・実装反映（`AuthKeyService` 単一生成 + `SkillExecutor` DI）・検証証跡（13/13, 28項目, target監査 current=0）・苦戦箇所（DIシグネチャドリフト、`phase-12-documentation` pending残置、教訓同期漏れ）を記録。Phase 12完了判定を「成果物実体 + 機械検証 + 仕様書ステータス同期」で固定 |
| バージョン  | 日付           | 変更内容                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ----------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1.67.36** | **2026-03-08** | **TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 苦戦箇所追補**: 完了記録セクションに S-GD-1〜S-GD-4（`setupThemeWatcher` safeRegister 不適合、`track()` クロージャ成功カウント、`sanitizeRegistrationErrorMessage` 正規表現メタ文字、既存テスト失敗混同）と関連仕様書更新テーブルを追記 |
| **1.67.35** | **2026-03-08** | **未タスク4件を残課題テーブルへ登録**: `UT-10A-E-D-001`（lint コマンドパス整合）、`UT-IMP-PHASE12-WORKFLOW10-COMPLIANCE-FIX-001`（Workflow 10 Phase 12準拠修正）、`UT-IMP-PHASE12-WORKFLOW11-COMPLIANCE-FIX-001`（Workflow 11 Phase 12準拠修正）、`UT-IMP-PHASE12-WORKFLOW12-IMPLEMENTATION-GUIDE-001`（Workflow 12 実装ガイド作成）を残課題テーブルへ追加。完了タスクセクション内の関連未タスク表に記載済みだったが残課題テーブルへの登録が未実施だったため同期                                   |
| **1.67.34** | **2026-03-08** | **TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001 の5分解決カード追加**: 完了タスク節へ「同種課題の5分解決カード（persist hydrate 破損入力）」を追記。症状/根本原因/最短4手順/検証ゲート/同期先3点を固定化し、persist iterable 崩れの再発時に短手順で対処可能化                                                                                                                                                                                                                                   |
| **1.67.34** | **2026-03-07** | **TASK-10A-F 完了同期**: スキルライフサイクルUI Store移行（useSkillAnalysis.ts 直接IPC 3箇所排除、Case B方式、52テスト全PASS）の完了記録を追加。仕様書同期4件（arch-state-management/lessons-learned/architecture-implementation-patterns/task-workflow）を実施                                                                                                                                                                                                                                    |
| **1.67.33** | **2026-03-06** | **UT-IMP-AIWORKFLOW-SKILL-ENTRYPOINT-COVERAGE-GUARD-001 を登録**: `aiworkflow-requirements` の `quick_validate` warning 145件を「SKILL.md 全列挙」で雑に解消せず、`SKILL.md` / `indexes/quick-reference.md` / `indexes/resource-map.md` の入口設計と validator 判定を両立させる未タスクを残課題テーブルへ追加。苦戦箇所と再利用方針を `lessons-learned.md` / `SKILL.md` / `LOGS.md` へ同期                                                                                                         |
| **1.67.32** | **2026-03-06** | **UT-TASK-10A-B-008 追補3を skill-creator 導線改善まで拡張**: repo 内 `skill-creator/SKILL.md` に未リンク reference 群の直接参照導線を追加し、`resource-map` 偏重で残っていた `quick_validate` warning 26件を 0 件へ解消。system spec には「Task本体の実装 + 再発防止スキル改善」を同一ターンで残す運用を追記                                                                                                                                                                                      |
| **1.67.31** | **2026-03-06** | **UT-TASK-10A-B-008 Phase 12 Task 1 の内容準拠を追補**: `outputs/phase-12/implementation-guide.md` を理由先行 / 日常例え / TypeScript型 / API・CLI シグネチャ / 使用例 / エラー処理 / 設定一覧まで補強し、`validate-phase12-implementation-guide.js` を追加。Task 12-1 が「Part 1/2 の存在」だけでなく内容要件まで満たすことを機械検証へ昇格                                                                                                                                                       |
| **1.67.30** | **2026-03-06** | **UT-TASK-10A-B-008 再監査追補を同期**: ユーザー明示の screenshot 要求に基づき SkillAnalysisView の再監査を実施し、`useSkillAnalysis` の StrictMode ローディング固着修正、screenshot スクリプトの loaded-state / light-theme 対応、Phase 11 証跡 8 ケース再取得を完了記録へ追記                                                                                                                                                                                                                    |
| **1.67.29** | **2026-03-06** | **UT-TASK-10A-B-008 完了を同期**: `UT-TASK-10A-B-003` と `UT-TASK-10A-B-008` を完了表記へ更新し、TASK-10A-B の current active set を `002 / 004 / 005 / 006 / 007 / 009` に再計算。`task-workflow.md` / `ui-ux-feature-components.md` / parent `unassigned-task-detection.md` を同一ターンで再同期し、`validate-task10ab-ledger-sync` を検証コマンドへ追加                                                                                                                                         |
| **1.67.27** | **2026-03-06** | **TASK-UI-02 workflow を completed-tasks へ移管**: `task-057-ui-02-global-nav-core/` を `docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/` へ移動し、派生未タスク 2 件も `unassigned-task/` 配下へ移管。Task 12 成果物と残課題導線を completed workflow 基準へ統一                                                                                                                                                                                                                |
| **1.67.26** | **2026-03-06** | **TASK-UI-02 派生未タスク2件を同期**: `TASK-UI-02-GLOBAL-NAV-CORE` 節へ `UT-IMP-PHASE12-UI-DOMAIN-SPEC-SYNC-GUARD-001` と `UT-IMP-PHASE12-WORKFLOW-BODY-STALE-GUARD-001` を追加し、domain UI spec 同期漏れと workflow 本文 stale を未タスクとして追跡可能にした                                                                                                                                                                                                                                    |
| **1.67.25** | **2026-03-06** | **TASK-UI-02 再々監査の workflow 本文 stale 是正を反映**: `TASK-UI-02-GLOBAL-NAV-CORE` 節へ `phase-1..11` 本文仕様書の completed 同期を追記し、検証証跡へ pending 0件確認を追加。苦戦箇所を「成果物 / 台帳 / 本文仕様書」の三層同期へ拡張                                                                                                                                                                                                                                                          |
| **1.67.24** | **2026-03-06** | **TASK-INVESTIGATE 関連未タスクリンクを再監査基準へ是正**: `UT-IMP-PHASE12-TASK-INVESTIGATE-FIVE-MINUTE-CARD-SYNC-VALIDATOR-001` の参照先を、実体配置済みの `docs/30-workflows/completed-tasks/task-imp-phase12-task-investigate-five-minute-card-sync-validator-001.md` へ更新。`verify-unassigned-links` 失敗要因だった completed 移管後のリンクドリフトを解消                                                                                                                                   |
| **1.67.23** | **2026-03-06** | **TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001 を completed-tasks へ移管**: `outputs/phase-12` 実体と `phase-12-documentation.md` completed を確認後、workflow本体を `docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001/` へ移動。関連未タスク2件（`UT-IMP-PHASE11-AUTHKEY-SCREENSHOT-SELECTOR-DRIFT-GUARD-001` / `UT-IMP-SKILLHANDLERS-AUTHKEY-DI-BOUNDARY-GUARD-001`）を `completed-tasks/unassigned-task/` へ移管し、残課題テーブルを完了表記へ同期                         |
| **1.67.22** | **2026-03-06** | **UT-IMP-SKILLHANDLERS-AUTHKEY-DI-BOUNDARY-GUARD-001 を残課題へ登録**: `TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001` の再確認で残存した `skillHandlers.ts` の責務肥大化を未タスク化。DI境界整理（composition root集約）、回帰テスト固定、教訓同期を1セットで実施する導線を追加し、同タスク完了節の「関連未タスク」欄へ追記                                                                                                                                                                              |
| **1.67.21** | **2026-03-06** | **TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001 の完了台帳を強化**: 完了タスクセクションを新設し、SubAgent分担・実装反映（`AuthKeyService` 単一生成 + `SkillExecutor` DI）・検証証跡（13/13, 28項目, target監査 current=0）・苦戦箇所（DIシグネチャドリフト、`phase-12-documentation` pending残置、教訓同期漏れ）を記録。Phase 12完了判定を「成果物実体 + 機械検証 + 仕様書ステータス同期」で固定                                                                                                         |
| **1.67.20** | **2026-03-05** | **TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001 の Phase 12仕様準拠を再確認して同期**: `verify-all-specs`（13/13 PASS）/ `validate-phase-output`（28項目 PASS）/ Task 12-1〜12-5成果物実在を再検証。苦戦箇所として「成果物は揃っているのに `phase-12-documentation.md` が `pending` のまま残る台帳ドリフト」を追記し、`completed` 同期とチェックリスト更新を実施。未タスク指示書 `task-imp-phase11-authkey-screenshot-selector-drift-guard-001.md` は `--target-file` 監査で `currentViolations=0` を確認 |
| **1.67.19** | **2026-03-05** | **TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001 再監査を追補**: 仕様と実装のDIシグネチャ再突合（`registerSkillHandlers(..., authKeyService)` / `new SkillExecutor(mainWindow, undefined, authKeyService)`）を反映し、Phase 11 画面回帰証跡（TC-11-01〜03）を追加。再監査で検出したスクリーンショットセレクタドリフト課題を未タスク `UT-IMP-PHASE11-AUTHKEY-SCREENSHOT-SELECTOR-DRIFT-GUARD-001` として登録                                                                                                |
| **1.67.23** | **2026-03-06** | **UT-IMP-PHASE12-TASK-INVESTIGATE-FIVE-MINUTE-CARD-SYNC-VALIDATOR-001 を残課題登録**: TASK-INVESTIGATE 節に関連未タスクテーブルを追加し、5分解決カードの3仕様書同期（存在/順序/検証ゲート）を機械検証する改善タスクを `docs/30-workflows/unassigned-task/` へ登録。類似課題の初動短縮を目的に未実施課題として追跡開始                                                                                                                                                                              |
| **1.67.22** | **2026-03-06** | **TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001 の簡潔解決カードを最適化**: 当該タスク節へ「同種課題の5分解決カード（契約境界 + 証跡昇格）」を追加し、症状/根本原因/最短5手順/検証ゲート/同期先3点を固定。再利用時の初動を1表で再実行できる構造へ改善                                                                                                                                                                                                                                       |
| **1.67.21** | **2026-03-06** | **TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001 の Phase 12準拠再確認を追補**: `phase-12-documentation.md` の `completed` 同期、`implementation-guide.md` Part 2（型/API/エッジケース/設定）補強、`phase12-task-spec-compliance-check.md` 追加、ならびに当該タスク節へ「苦戦箇所 + 再発防止 + 4ステップ手順」を追記                                                                                                                                                                         |
| **1.67.20** | **2026-03-06** | **TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001 の再監査追補（Phase 11 実画面証跡）**: `NON_VISUAL` 記録を見直し、`outputs/phase-11/screenshots/TC-11-UI-01..03` を再生成して Apple UI/UX観点の視覚回帰を追加。`validate-phase11-screenshot-coverage` PASS（3/3）とともに `phase-11-manual-test.md` / `manual-test-result.md` / `evidence-index.md` / `screenshot-plan.md` を同期                                                                                                           |
| **1.67.19** | **2026-03-05** | **TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001 を完了タスクへ追加**: OAuth後 `is not iterable` 障害の主因を `AUTH_STATE_CHANGED` payload揺れ + Renderer `linkedProviders` 契約崩れとして分離。Main `toAuthUser` 正規化、Renderer `normalizeLinkedProviders` 防御、対象テスト（3 files / 169 tests）PASS、Phase 1-12成果物を `docs/30-workflows/04-TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001/outputs/` へ同期                                                                    |
| **1.67.18** | **2026-03-05** | **TASK-UI-01-C と UT-IMP-PHASE12-TARGETED-VITEST-RUN-GUARD-001 を completed-tasks へ移管**: Phase 12 完了条件（`outputs/phase-12` 実体 + `validate-phase-output --phase 12` PASS）を確認後、workflow本体を `docs/30-workflows/completed-tasks/task-056c-notification-history-domain/` へ移動。併せて同UTを `completed-tasks/unassigned-task/` へ移管し、残課題テーブルを完了表記へ更新                                                                                                             |
| **1.67.17** | **2026-03-05** | **UT-IMP-PHASE12-TARGETED-VITEST-RUN-GUARD-001 を残課題へ追加**: TASK-UI-01-C Phase 12 再監査で再発した `pnpm run test:run --` 起因の全体テスト誤起動リスクを未タスク化。TASK-UI-01-C 節の未タスク判定を運用改善1件へ更新し、`pnpm exec vitest run` 直指定 + `test -f` preflight の再利用手順を台帳へ同期                                                                                                                                                                                          |
| **1.67.16** | **2026-03-05** | **TASK-UI-01-C Phase 12 準拠再確認（指定ディレクトリ未タスク監査）を追補**: `validate-phase-output --phase 12` で Task 12-1〜12-5 を再検証し、`capture-task-056c-notification-history-screenshots.mjs` で TC-11-01〜03 を再撮影。`audit-unassigned-tasks --diff-from HEAD` は `currentViolations=0` / `baselineViolations=92`、`docs/30-workflows/unassigned-task/` 差分は0件で、今回実装起因の未タスク追加不要を台帳へ明記                                                                        |
| **1.67.15** | **2026-03-05** | **TASK-UI-01-C 再監査追補（phase/index整合 + 実画面証跡）**: `artifacts.json` と不整合だった `index.md` / `phase-1..10` の pending表記を `completed` へ同期。Phase 11 は `capture-task-056c-notification-history-screenshots.mjs` で Dashboard/Chat History/History Page の3証跡を再取得し、`SCREENSHOT + NON_VISUAL` 併用ルールへ更新                                                                                                                                                             |
| **1.67.14** | **2026-03-05** | **TASK-UI-01-C-NOTIFICATION-HISTORY-DOMAIN を完了タスクへ追加**: Notification/HistorySearch の Slice実装、IPC 7チャネル、Preload公開契約、テスト37件PASS、Phase 11 `NON_VISUAL` 判定、Phase 12 仕様同期（arch/api/task/lessons + LOGS + topic-map）を台帳へ反映                                                                                                                                                                                                                                    |
| **1.67.16** | **2026-03-05** | **TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001 を completed-tasks へ移管**: `outputs/phase-12` 実体と `phase-12-documentation.md` completed を確認後、workflow本体を `docs/30-workflows/completed-tasks/01-TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001/` へ移動。併せて `UT-IMP-DESKTOP-TESTRUN-SIGTERM-FALLBACK-GUARD-001` を `completed-tasks/unassigned-task/` へ移管し、関連タスク/残課題テーブルのステータスを完了化                                                                             |
| **1.67.15** | **2026-03-05** | **UT-IMP-DESKTOP-TESTRUN-SIGTERM-FALLBACK-GUARD-001 を残課題へ登録**: `apps/desktop test:run` の `SIGTERM` 中断に対するフォールバック運用（失敗ログ固定 + `vitest run <対象>` 分割実行 + 3仕様同期）を未タスク化し、`TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001` の関連タスク表と残課題テーブルへ同時反映                                                                                                                                                                                          |
| **1.67.14** | **2026-03-05** | **TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001 追補（SIGTERM運用ガード + 5分解決カード）**: 同タスク節へ `apps/desktop test:run` の `SIGTERM` 失敗証跡と分割実行運用を追加し、runtime配線修正とテスト中断ガードを一体化した「同種課題の5分解決カード」を追記。`task-workflow/lessons/api-ipc` の3点同時同期ルールを明文化                                                                                                                                                                            |
| **1.67.13** | **2026-03-05** | **Phase 12 未タスクを追加（workflowパス正規化ガード）**: `UT-IMP-PHASE12-WORKFLOW-PATH-CANONICALIZATION-001` を `docs/30-workflows/unassigned-task/` に登録。苦戦箇所（workflow実体パス取り違え、`--target-file` 境界誤用、`current/baseline` 混在）を再利用可能な手順へ分解し、`task-056a` の再監査運用を安定化                                                                                                                                                                                   |
| **1.67.12** | **2026-03-05** | **TASK-UI-01-A-STORE-SLICE-BASELINE の Phase 12準拠再確認を追補**: `verify-all-specs` / `validate-phase-output` / `audit --diff-from HEAD` を再実行し、実装差分未タスクは0件であることを再確認。あわせて baseline負債（90件）の段階削減用未タスク `UT-IMP-PHASE12-UNASSIGNED-BASELINE-REDUCTION-001` を `docs/30-workflows/unassigned-task/` に追加し、運用改善を追跡可能化                                                                                                                        |
| **1.67.11** | **2026-03-05** | **TASK-UI-01-A-STORE-SLICE-BASELINE を完了タスクへ追加**: Renderer Store baseline（型定義 + inventory 16行 + 境界マトリクス + セレクタ規約）を同期し、Phase 11 の TC証跡を `TC-11-01〜03` へ統一。`validate-phase11-screenshot-coverage` を expected=3/covered=3 で PASS 化し、Phase 12 のシステム仕様同期漏れを解消                                                                                                                                                                               |
| **1.67.10** | **2026-03-05** | **UT-TASK-10A-B-009 を残課題へ追加**: 完了済みUT配置の3分類（未実施=`unassigned-task` / 完了済みUT=`completed-tasks` / legacy=`completed-tasks/unassigned-task`）と `audit --target-file` 適用境界の誤用再発防止を目的とした未タスクを登録。TASK-10A-B の未タスク管理件数を `4+3` から `4+4` へ更新                                                                                                                                                                                                |
| **1.67.9**  | **2026-03-05** | **UT-TASK-10A-B-001 の再利用最適化（クイック解決カード）を追加**: TASK-10A-B 節へ「配置判定（未実施=`unassigned-task` / 完了済み=`completed-tasks`）」「`target-file` 監査適用境界」「画面証跡5/5判定」「current/baseline 分離判定」の4観点を固定化。コマンドセットを併記して同種課題を短手順で再現可能化                                                                                                                                                                                          |
| **1.67.10** | **2026-03-06** | **TASK-UI-02 再監査追補**: `mobileLabel` による mobile tab bar 可読性改善、`verify-unassigned-links` / `audit --diff-from HEAD` の current=0 / baseline=93 記録、`phase-12-documentation.md` / `artifacts.json` / `outputs/artifacts.json` / `index.md` の同時同期ルールを TASK-UI-02 節へ追記                                                                                                                                                                                                     |
| **1.67.8**  | **2026-03-05** | **UT-TASK-10A-B-001 の最終再監査（未タスク配置是正）を同期**: 完了済み `task-10a-b-autofixable-filter-button.md` を `docs/30-workflows/completed-tasks/` 直下へ移管し、未実施 `UT-TASK-10A-B-002〜008` の7件を `docs/30-workflows/unassigned-task/` へ再配置。Apple UI/UX視点でスクリーンショット5件を 11:00 JST に再取得して視覚確認し、`verify-unassigned-links`（102/102）と `audit --diff-from HEAD`（current=0, baseline=90）を検証証跡へ追記                                                 |
| **1.67.9**  | **2026-03-06** | **TASK-UI-02 完了同期**: `TASK-UI-02-GLOBAL-NAV-CORE` を completed として追加。`GlobalNavStrip` / `MobileNavBar` / `AppLayout` / `uiSlice` nav state / screenshot evidence / rollback readiness を台帳へ反映                                                                                                                                                                                                                                                                                       |
| **1.67.7**  | **2026-03-05** | **UT-TASK-10A-B-001 再監査追補を同期**: Phase 11 light証跡ドリフト（theme mock 固定値）を苦戦箇所へ追加し、`capture-ut-task-10a-b-001-screenshots.mjs` の `prefers-color-scheme` 連動修正を反映。再撮影時刻（10:28 JST）と `validate-phase11-screenshot-coverage`（5/5）を検証証跡に追記                                                                                                                                                                                                           |
| **1.67.6**  | **2026-03-05** | **UT-TASK-10A-B-001 完了を同期**: TASK-10A-B 節へ派生タスク完了記録を追加し、残課題テーブルの `UT-TASK-10A-B-001` を完了表記へ更新。参照先を `docs/30-workflows/completed-tasks/ut-task-10a-b-001-autofixable-filter-button/` に切替え、未タスク管理件数を `4件+3件` に再計算して整合化                                                                                                                                                                                                            |
| **1.67.5**  | **2026-03-04** | **Phase 11 画面カバレッジマトリクスの未整備を未タスク化**: `UT-IMP-PHASE11-SCREENSHOT-COVERAGE-MATRIX-GUARD-001` を残課題テーブルへ追加し、`validate-phase11-screenshot-coverage` の warning（matrix未記載）を苦戦箇所へ追記。Phase 11 設計意図（視覚TC/非視覚TC + 期待証跡）を標準化する再発防止導線を記録                                                                                                                                                                                        |
| **1.67.4**  | **2026-03-04** | **UT workflow の Phase 11証跡配置を正規化して再発防止ルールを追加**: `UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001` 追補2として、`outputs/phase-11/screenshots` を対象workflow配下で保持する契約と `manual-test-result.md` の `NON_VISUAL:` 記法を明文化。`validate-phase11-screenshot-coverage`（expected=6/covered=4, 非視覚2件許容）を検証証跡へ追加し、同種課題向け4ステップ手順を追記                                                                                             |
| **1.67.3**  | **2026-03-04** | **workflow02 再確認で判明した Port 5174 競合課題を残課題へ登録**: `screenshot:skill-import-idempotency-guard` 実行時の `Port 5174 is already in use` 混在を苦戦箇所として追記し、未タスク `UT-IMP-PHASE12-SCREENSHOT-PORT-CONFLICT-GUARD-001` を `docs/30-workflows/unassigned-task/` 正本で追加。追補検証証跡へ `lsof` 事前検査結果を記録し、再利用手順を「ポート検査→再撮影→coverage検証→台帳同期」に更新                                                                                        |
| **1.67.2**  | **2026-03-04** | **UT-IMP-SKILL-CENTER-HOTFIX-COVERAGE-INCLUDE-GUARD-001 を残課題へ登録**: SkillCenter hotfix 再計測時の `--coverage.include` 誤指定リスクを未タスク化し、`docs/30-workflows/unassigned-task/task-imp-skill-center-hotfix-coverage-include-guard-001.md` を正本として追加。TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001 セクションの追加未タスク表と残課題テーブルを同時同期                                                                                                                  |
| **1.67.1**  | **2026-03-04** | **SkillCenter削除導線ホットフィックスの実測値を再確定**: 対象テストを `SkillCenterView.delete-confirm` / `useSkillCenter` / `useFeaturedSkills` の3ファイルへ固定して再計測し、結果を `3 files / 30 tests`・coverage `86.89 / 84.61 / 88.88` へ更新。あわせて Phase 12テンプレート最適化節へ未タスク配置先判定（未完了/完了移管）を追記                                                                                                                                                            |
| **1.67.0**  | **2026-03-04** | **TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001 第2回再確認を反映**: workflow03 の参照先を `completed-tasks/03-...` へ統一し、再検証値を最新化（`verify-unassigned-links` 88/88、`audit --diff-from HEAD` baseline=94）。Phase 11 画面証跡の再取得時刻を 16:50 JST に更新し、`UT-IMP-SKILL-CENTER-PREVIEW-BUILD-GUARD-001` の完了移管状態を台帳へ同期                                                                                                                                         |
| **1.66.10** | **2026-03-04** | **UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001 完了反映**: workflow02 の screenshot 再取得コマンドを `pnpm --filter @repo/desktop run screenshot:skill-import-idempotency-guard` へ統一し、`package.json` scripts 登録・Phase 11/12 文書同期・coverage validator（4/4）PASS を完了記録へ追記                                                                                                                                                                                           |
| **1.66.9**  | **2026-03-04** | **SkillCenter削除導線ホットフィックスを追補**: TASK-UI-05 セクションに「削除確認ダイアログ未描画」に起因する不具合の原因/修正/回帰結果（3 files / 30 tests）を追加し、テスト資産件数を最新（10 files / 132 tests）へ更新。対象カバレッジ `86.89 / 84.61 / 88.88`（全指標80%以上）を記録                                                                                                                                                                                                            |
| **1.66.8**  | **2026-03-04** | **TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001 の再監査追補**: Phase 12再確認の検証値を最新化（`verify-unassigned-links`: 90/90, `audit --diff-from HEAD`: baseline=92）。追加苦戦箇所「UI再撮影 preflight 不足（preview build/疎通未確認）」を記録し、未タスク `UT-IMP-SKILL-CENTER-PREVIEW-BUILD-GUARD-001` を残課題テーブルへ登録                                                                                                                                                         |
| **1.66.7**  | **2026-03-04** | **TASK-FIX-SKILL-IMPORT 3workflowを completed-tasks へ移管**: `01/02/03-TASK-FIX-SKILL-IMPORT-*` を `docs/30-workflows/completed-tasks/` へ移動し、Phase 12完了条件（`outputs/phase-12` 完備 + `phase-12-documentation.md` completed）を満たしたことを確認。関連未タスク3件（SubAgent Artifact / System Spec Extraction / 3workflow Audit Scope）を `completed-tasks/unassigned-task/` へ移動し、残課題テーブルを完了状態へ更新                                                                    |
| **1.66.6**  | **2026-03-04** | **Phase 12未タスク3件を残課題へ登録**: `UT-IMP-PHASE12-SUBAGENT-ARTIFACT-GUARD-001` / `UT-IMP-PHASE12-SYSTEM-SPEC-EXTRACTION-GUARD-001` / `UT-IMP-PHASE12-THREE-WORKFLOW-AUDIT-SCOPE-GUARD-001` を `docs/30-workflows/unassigned-task/` 正本として残課題テーブルへ同期。3workflow再監査の証跡集約・`scope.currentFiles` 判定固定・system-spec抽出手順を追跡可能化                                                                                                                                  |
| **1.66.5**  | **2026-03-04** | **TASK-FIX-SKILL-IMPORT 3連続是正の Phase 12再監査証跡を追補**: 3workflow の `verify-all-specs` / `validate-phase-output` 再実行結果、UI workflow の screenshot coverage、`verify-unassigned-links`（88/88）と `audit --diff-from HEAD`（current=0, baseline=88）を追加。未タスク2件の `--target-file` 個別監査（scope一致 + current=0）を明記し、配置/フォーマット確認を固定                                                                                                                      |
| **1.66.4**  | **2026-03-04** | **TASK-FIX-SKILL-IMPORT 3連続是正を完了台帳へ同期**: `01/02/03`（imported state復元 / import冪等ガード / SkillCenter欠損メタデータ防御）の実装要点・仕様書別SubAgent分担・検証証跡（13/13, 28項目, TC 4/4, current=0）を追記。関心分離に基づく5ステップ再利用手順を追加                                                                                                                                                                                                                            |
| **1.66.3**  | **2026-03-04** | **TASK-10A-D 未タスク2件を追加**: 再確認で抽出した苦戦箇所を `UT-IMP-TASK10A-D-SUBAGENT-EXECUTION-LOG-GUARD-001`（仕様書別SubAgent実行ログ必須化）と `UT-IMP-TASK10A-D-SCREENSHOT-PURPOSE-DISAMBIGUATION-GUARD-001`（画面証跡の状態名+検証目的分離）として `docs/30-workflows/unassigned-task/` に新規作成。TASK-10A-D 節と残課題テーブルへ同期                                                                                                                                                    |
| **1.66.2**  | **2026-03-04** | **TASK-10A-D 仕様書別SubAgent実行ログを追補**: TASK-10A-D セクションへ「仕様書別SubAgent実行ログ（task-workflow/ui-ux-feature/lessons/skill-creator）」と「SubAgent運用版5ステップ手順」を追加。実装内容と苦戦箇所を仕様書単位で同時記録するテンプレート運用を台帳へ固定                                                                                                                                                                                                                           |
| **1.66.1**  | **2026-03-04** | **TASK-10A-D 再確認追補**: `verify-all-specs` / `validate-phase-output` / `validate-phase11-screenshot-coverage` / `verify-unassigned-links` を再実行してPASSを確認。`audit-unassigned-tasks` は `--diff-from HEAD` を合否（current=0）、`--json` 単体をbaseline監視（current=85）として分離記録する運用を追加。TC-02/TC-05 画面証跡の意図差を `manual-test-result.md` へ明記し、証跡解釈の曖昧さを解消                                                                                            |
| **1.66.0**  | **2026-03-03** | **TASK-10A-D 完了同期**: スキルライフサイクルUI統合（SkillManagementPanelビュー統合 + ChatPanel導線追加 + agentSlice拡張）の実装完了記録を追加。132テスト全PASS、Phase 10 PASS判定、Phase 11 手動テスト17ケース全PASS、Phase 12 ドキュメント6成果物完了を台帳へ固定                                                                                                                                                                                                                                |
| **1.65.0**  | **2026-03-03** | **TASK-10A-C 未タスク2件を登録**: `UT-IMP-TASK10A-C-FIVE-SPEC-SYNC-GUARD-001`（5仕様書同時同期ガード）と `UT-IMP-TASK10A-C-PHASE11-SCREENSHOT-COVERAGE-GUARD-001`（再撮影+TCカバレッジ+鮮度確認ガード）を `docs/30-workflows/unassigned-task/` に追加。TASK-10A-C セクションへ「Phase 12で検出した未タスク」表を追記し、残課題テーブルへ同期                                                                                                                                                       |
| **1.64.9**  | **2026-03-02** | **TASK-10A-C 仕様書別SubAgent分担を追補**: TASK-10A-C セクションに `api-ipc/interfaces/security/task-workflow/lessons` の5責務分担表を追加し、関心分離に基づく同期担当と完了条件を明文化                                                                                                                                                                                                                                                                                                           |
| **1.64.8**  | **2026-03-02** | **TASK-10A-C 完了同期**: `SkillCreateWizard` 実装完了記録を追加し、`skill:create` 契約（channels/preload/handler/service）の反映内容、Phase 11 画面証跡再取得（TC-01〜TC-08）、検証5点（verify-all-specs / validate-phase-output / verify-unassigned-links / screenshot-coverage）を台帳へ固定                                                                                                                                                                                                     |
| **1.64.7**  | **2026-03-02** | **UT-TASK-10A-B-006〜008 登録**: TASK-10A-B 再監査の苦戦箇所3件（Phase 11必須節不足、画面証跡鮮度不明、未タスク件数ドリフト）を未タスク化。`docs/30-workflows/unassigned-task/` に3指示書を追加し、残課題テーブルと TASK-10A-B セクションの未タスク管理行を「5件+3件」へ同期                                                                                                                                                                                                                       |
| **1.64.6**  | **2026-03-02** | **UT-IMP-PHASE12-TWO-WORKFLOW-EVIDENCE-BUNDLE-001 登録**: TASK-UI-05A/TASK-UI-05 の再確認で顕在化した「2workflow同時監査時の証跡分散」「Task 1/3/4/5 実体突合漏れ」「UI画面証跡鮮度管理」「current/baseline 誤判定」を未タスク化し、正本 `docs/30-workflows/unassigned-task/` へ登録。残課題テーブルへ同期し、再利用可能な監査ガードとして追跡対象化                                                                                                                                               |
| **1.64.5**  | **2026-03-02** | **Phase 12準拠再確認（TASK-UI-05A / TASK-UI-05）**: 2workflowに対して `verify-all-specs` + `validate-phase-output` を再実行し、Task 1/3/4/5 成果物実体と実装ガイド2パート要件を再確認。あわせて未タスク監査の合否基準を `currentViolations=0` 固定で明文化し、苦戦箇所と4ステップ再利用手順を追加                                                                                                                                                                                                  |
| **1.64.4**  | **2026-03-02** | **TASK-UI-05A 再監査反映**: `views/SkillEditorView` 実装ファイル実在と 99 テスト PASS を台帳へ反映。`UT-UI-05A-GETFILETREE-001` / `UT-UI-05A-SPEC-CONSISTENCY-001` / `UT-UI-05A-IMPLEMENTATION-CLOSURE-001` を正規配置 `docs/30-workflows/unassigned-task/` へ同期し、画面証跡を 2026-03-02 再取得分へ更新                                                                                                                                                                                         |
| **1.64.3**  | **2026-03-02** | **UT-UI-05A-GETFILETREE-001 登録**: TASK-UI-05A 監査で発見された `skill:getFileTree` IPCチャネル未実装を未タスクとして残課題テーブルへ追加。P3準拠3ステップ完了（指示書作成・残課題テーブル登録・関連仕様書参照リンク追加）                                                                                                                                                                                                                                                                        |
| **1.64.2**  | **2026-03-01** | **TASK-UI-05A spec_created 反映**: 完了タスクセクションへ `TASK-UI-05A-SKILL-EDITOR-VIEW`（仕様書作成完了・実装未着手）を追加。画面検証証跡（Dashboard/Editorスクリーンショット、manual-test-result、discovered-issues）を記録し、残課題テーブルへ実装未着手行を追加                                                                                                                                                                                                                               |
| **1.64.6**  | **2026-03-02** | **UT-UI-05B-001 登録（画面証跡再取得ガード）**: TASK-UI-05B 再確認で抽出した苦戦箇所を未タスク化し、`docs/30-workflows/completed-tasks/TASK-UI-05B-SKILL-ADVANCED-VIEWS/unassigned-task/task-ui-05b-phase12-screenshot-evidence-recapture-guard.md` を追加。TASK-UI-05B セクションと残課題テーブルへ同IDを同期し、再撮影 + 更新時刻確認を運用標準として固定                                                                                                                                        |
| **1.64.5**  | **2026-03-02** | **TASK-UI-05B テンプレート最適化（仕様書ごとSubAgent分割）**: `TASK-UI-05B` セクションの同期チームを「1仕様書=1SubAgent」の6責務（ui-ux-components / ui-ux-feature-components / arch-ui-components / arch-state-management / task-workflow / lessons-learned）へ再編。検証証跡日付を 2026-03-02 へ統一し、仕様反映先テーブルを追加して責務境界を明確化                                                                                                                                             |
| **1.64.4**  | **2026-03-02** | **TASK-UI-05B 再確認追補**: `TASK-UI-05B` の検証証跡を再同期（`verify-all-specs`: warning=0、初回 warning=7 を是正 / `validate-phase-output`: 28項目PASS / `audit --diff-from HEAD`: current=0/baseline=75）。画面証跡を `capture-skill-advanced-views-screenshots.mjs` で再取得した記録を追加し、苦戦箇所に「Phase 12参照不足によるwarningドリフト」「current/baseline誤読防止」を追記                                                                                                            |
| **1.64.3**  | **2026-03-02** | **TASK-UI-05B 実装完了同期**: `TASK-UI-05B-SKILL-ADVANCED-VIEWS` を `completed（実装 + 仕様同期）` へ更新。4ビュー導線（AppDock/ViewType/App route）、Preload chain API実装反映、Phase 11 スクリーンショット証跡更新、`artifacts.json`/Phase状態の実体整合を記録                                                                                                                                                                                                                                   |
| **1.64.2**  | **2026-03-01** | **TASK-UI-05B spec_created 同期 + 参照切れ是正**: 完了タスクセクションへ `TASK-UI-05B-SKILL-ADVANCED-VIEWS`（spec_created）を追加し、4ビュー責務・検証証跡・画面スクリーンショット導線を記録。残課題テーブルの `UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001` / `UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001` を実在パスへ更新                                                                                                                                                                            |
| **1.64.1**  | **2026-03-01** | **TASK-UI-05 completed-tasks 移管**: Phase 12 完了条件充足に伴い、ワークフロー本体を `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/` へ移動。関連未タスク `task-ui-05-*.md` 7件を同ディレクトリ配下 `unassigned-task/` へ移管し、参照パスを一括同期                                                                                                                                                                                                                              |
| **1.64.0**  | **2026-03-01** | **UT-UI-05-007 を残課題へ登録**: TASK-UI-05 の再確認で判明した「UIタスクに5仕様書テンプレートを誤適用しやすい」「task-workflow/lessons 同期漏れ」課題を未タスク化。TASK-UI-05 セクションの未タスク表と残課題テーブルへ `task-ui-05-phase12-ui-spec-sync-guard.md` を追加                                                                                                                                                                                                                           |
| **1.63.9**  | **2026-03-01** | **TASK-UI-05 教訓同期を追補**: `TASK-UI-05-SKILL-CENTER-VIEW` セクションへ再発条件付きの苦戦箇所3件（型境界、DetailPanel責務集中、Phase 12三点同期）と「同種課題の簡潔解決手順（5ステップ）」を追加。`lessons-learned.md` との同一ターン同期運用を明示                                                                                                                                                                                                                                             |
| **1.63.8**  | **2026-03-01** | **TASK-UI-05 完了反映 + 未タスク6件登録**: 完了タスクセクションに `TASK-UI-05-SKILL-CENTER-VIEW` を追加し、仕様書別SubAgent分担・検証証跡を記録。残課題テーブルへ `UT-UI-05-001`〜`UT-UI-05-006` を登録して `docs/30-workflows/unassigned-task/` の実体ファイル参照を同期                                                                                                                                                                                                                          |
| **1.63.7**  | **2026-02-28** | **UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001 を残課題へ登録**: TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001 の苦戦箇所（三点突合漏れ、`current/baseline` 誤読、仕様書別SubAgentの N/A 記録漏れ）を再発防止する未タスクを `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-subagent-na-log-guard-001.md` に作成し、残課題テーブルへ同期                                                                                                                                               |
| **1.63.6**  | **2026-02-28** | **TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001 追補（SubAgent分離 + テンプレート最適化）**: 同タスクの監査セクションに仕様書別SubAgent分担（台帳/教訓/テンプレート/検証）を追加し、実装内容へ `phase12-system-spec-retrospective-template.md` 最適化を追記。苦戦箇所に「非対象仕様（N/A）記録漏れ」を追加し、再利用手順を5ステップへ拡張                                                                                                                                                              |
| **1.63.5**  | **2026-02-28** | **TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001 Phase 12実行監査を追加**: 完了タスクセクションへ監査記録を新設し、必須5成果物の実体確認、`verify-all-specs`/`validate-phase-output` PASS、`verify-unassigned-links` PASS、`audit --diff-from HEAD`（current=0 / baseline=71）を記録。あわせて苦戦箇所（成果物実体とステータス乖離、current/baseline誤読、チェックリスト未同期）と4ステップ再利用手順を追記                                                                                             |
| **1.62.9**  | **2026-02-28** | **TASK-FIX-AUTH-CALLBACK-SERVER-WORKER-EXIT-001 完了移管反映**: 実行ワークフローを `docs/30-workflows/completed-tasks/TASK-FIX-AUTH-CALLBACK-SERVER-WORKER-EXIT-001/` へ移動し、派生未タスク `UT-IMP-AUTH-CALLBACK-LIFECYCLE-CONTRACT-GUARD-001` も `completed-tasks/unassigned-task/` へ移管。残課題テーブルを完了表記へ更新                                                                                                                                                                      |
| **1.62.8**  | **2026-02-28** | **UT-IMP-AUTH-CALLBACK-LIFECYCLE-CONTRACT-GUARD-001 未タスク登録**: `TASK-FIX-AUTH-CALLBACK-SERVER-WORKER-EXIT-001` の苦戦箇所（wait/stop責務混在、stop冪等性、監査スクリプト所在誤認）を再発防止する未タスクを残課題テーブルへ追加。未タスク指示書は `task-specification-creator` テンプレート（9セクション + 3.5 実装課題）準拠で `docs/30-workflows/completed-tasks/unassigned-task/` に配置                                                                                                    |
| **1.62.7**  | **2026-02-28** | **TASK-FIX-AUTH-CALLBACK-SERVER-WORKER-EXIT-001 テンプレート最適化追補**: 同タスクへ「苦戦箇所と解決策（再発条件付き）」と「同種課題の簡潔解決手順（5ステップ）」を追加。`phase12-system-spec-retrospective-template` 準拠で wait/stop 責務分離、冪等停止、監査スクリプト実体解決の3論点を再利用可能形式に固定                                                                                                                                                                                     |
| **1.62.6**  | **2026-02-28** | **TASK-FIX-AUTH-CALLBACK-SERVER-WORKER-EXIT-001 完了反映**: auth callback server の timeout/stop 責務分離（自動 stop 削除、stop 冪等化、timeout テスト後の明示 stop）を完了タスクへ追加。検証証跡（13/13, 28項目, links 91/91, current=0, tests 13/13）を台帳へ固定                                                                                                                                                                                                                                |
| **1.62.5**  | **2026-02-27** | **TASK-9H Phase 12再監査同期**: `TASK-9H` セクションに最終検証証跡（`verify-all-specs` 13/13、`validate-phase-output` error=0、`verify-unassigned-links` ALL_LINKS_EXIST、`audit --diff-from HEAD` current=0 / baseline=71）を反映。成果物参照（`spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md`）を確定し、運用手順を4ステップへ統一                                                                                         |
| **1.63.1**  | **2026-02-28** | **TASK-9I completed-tasks 移管**: Phase 12 完了条件を満たしたため、`docs/30-workflows/TASK-9I-skill-docs/` を `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/` へ移動。関連未タスク `UT-9I-001/002` も同ディレクトリ配下 `unassigned-task/` へ移管し、台帳・成果物リンクを新パスへ同期                                                                                                                                                                                                      |
| **1.63.0**  | **2026-02-28** | **UT-IMP-PHASE12-EVIDENCE-LINK-GUARD-001 登録 + TASK-9I再確認追補**: 残課題テーブルへ Phase 12 証跡/リンク整合ガード未タスクを追加。TASK-9I 再確認セクションへワイルドカード参照由来のリンク監査 false fail、`--target-file` 判定軸分離、再確認値ドリフト対策を追記し、対象監査行（新規UT）と未タスク配置/フォーマット確認を同期                                                                                                                                                                   |
| **1.62.9**  | **2026-02-28** | **TASK-9I完了反映 + 未タスク2件登録**: 完了タスクセクションへ TASK-9I（docs 4チャネル、SkillDocGenerator、共有型5種、テスト64件PASS）を追加。残課題テーブルへ UT-9I-001（LLMプロバイダ連携）/ UT-9I-002（テンプレートCRUD）を登録し、`docs/30-workflows/unassigned-task/` 正本リンクへ同期                                                                                                                                                                                                         |
| **1.63.4**  | **2026-02-28** | **TASK-9J 完了移管反映**: `docs/30-workflows/TASK-9J-skill-analytics/` を `completed-tasks/` へ移動。併せて `UT-IMP-TASK9J-PHASE12-IPC-SYNC-AUTO-VERIFY-001` を `completed-tasks/unassigned-task/` へ移管し、残課題テーブルを完了表記へ更新                                                                                                                                                                                                                                                        |
| **1.63.3**  | **2026-02-28** | **TASK-9J 由来の未タスク登録と台帳整合**: `UT-IMP-TASK9J-PHASE12-IPC-SYNC-AUTO-VERIFY-001` を残課題テーブルへ追加。併せて重複していた `UT-FIX-SKILL-IMPORT-ID-MISMATCH-001` / `UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001` / `UT-IMP-PHASE12-SPEC-SYNC-SUBAGENT-GUARD-001` の行を整理し、状態矛盾を解消                                                                                                                                                                                             |
| **1.63.2**  | **2026-02-28** | **TASK-9J テンプレート準拠最適化**: TASK-9Jセクションを再整形し、メタ情報テーブル・仕様書別SubAgent分担（5仕様書）・再発条件付き苦戦箇所テーブル・Phase 12検証証跡（13/13, 28項目, 92/92, current=0）を追加。仕様同期の再利用性を強化                                                                                                                                                                                                                                                              |
| **1.63.1**  | **2026-02-28** | **TASK-9J 再確認追補**: TASK-9Jセクションに苦戦箇所3件（責務重複、IPC登録漏れ、Preload API命名ドリフト）と同種課題向け簡潔解決手順（4ステップ）を追加。Phase 12再確認の運用根拠を明文化                                                                                                                                                                                                                                                                                                            |
| **1.63.0**  | **2026-02-28** | **TASK-9J完了反映**: 完了タスクセクションにスキル分析・統計機能（SkillAnalytics, AnalyticsStore, 5 IPCチャネル, 8型定義, 97テストPASS）を追加。苦戦箇所（@repo/shared型エクスポート, ESLint unused parameter）を記録                                                                                                                                                                                                                                                                               |
| **1.62.8**  | **2026-02-27** | **UT-IMP-PHASE12-UNASSIGNED-BASELINE-REMEDIATION-002 登録**: TASK-9G Phase 12 再確認で顕在化した baseline 違反（未タスクフォーマット/命名/台帳整合）の段階是正タスクを残課題テーブルへ追加。未タスク指示書に「実装課題と解決策（実体探索/`current`-`baseline` 分離/メタ情報重複防止）」と SubAgent 分担を反映                                                                                                                                                                                      |
| **1.62.7**  | **2026-02-27** | **TASK-9G Phase 12再確認結果を追加**: 検証証跡（13/13, 28項目, 96/96, current=0）を完了タスクセクションへ追記し、運用上の苦戦箇所（スクリプト実行パス誤認 / current-baseline誤読 / `--target-file` 制約）と再確認4ステップ手順を標準化                                                                                                                                                                                                                                                             |
| **1.62.6**  | **2026-02-27** | **TASK-9G 未タスク登録同期**: UT-9G-001〜005（cron nextRun 精度改善 / event トリガー拡張 / 通知実装 / graceful shutdown / Renderer push 通知）を残課題テーブルへ追加し、`docs/30-workflows/unassigned-task/` の指示書5件へ正本リンクを登録                                                                                                                                                                                                                                                         |
| **1.62.5**  | **2026-02-27** | **TASK-9G完了反映**: 完了タスクセクションへ TASK-9G（スキルスケジュール5チャネル、ScheduleStore/SkillScheduler、Preload API 5メソッド、desktop/shared テストPASS）を追加。苦戦箇所（6仕様書同期漏れ・Phase成果物欠落・coverage判定混在）と5ステップ再利用手順を記録                                                                                                                                                                                                                                |
| **1.61.7**  | **2026-02-27** | **UT-IMP-PHASE12-SPEC-VERSION-CONSISTENCY-GUARD-001 登録**: Phase 12 再監査で顕在化した「版数ドリフト（`spec-update-summary` と正本差分）」「簡潔解決手順の件数ドリフト（4/5）」を再発防止する未タスクを残課題テーブルへ追加。併せて `UT-IMP-PHASE12-SPEC-SYNC-SUBAGENT-GUARD-001` の参照先を `unassigned-task/` 正本へ補正                                                                                                                                                                        |
| **1.61.6**  | **2026-02-27** | **UT-IMP-QUICK-VALIDATE-EMPTY-FIELD-GUARD-001 テンプレート準拠最適化**: 同タスクへ仕様書別SubAgent分担テーブルを追加し、苦戦箇所を再発条件付き形式に整理。成果物テーブルへ `outputs/phase-12/spec-update-summary.md` を追加し、Phase 12 Step 2 の再利用性を向上                                                                                                                                                                                                                                    |
| **1.61.5**  | **2026-02-27** | **UT-IMP-QUICK-VALIDATE-EMPTY-FIELD-GUARD-001 Phase 12再監査反映**: 同タスクに「苦戦箇所と解決策」および「同種課題の簡潔解決手順（5ステップ）」を追加。`phase-12-documentation.md` の完了チェック同期、親タスク証跡の旧 `unassigned-task` 参照是正、検証スクリプト実体解決手順を標準化                                                                                                                                                                                                             |
| **1.61.4**  | **2026-02-27** | **UT-IMP-QUICK-VALIDATE-EMPTY-FIELD-GUARD-001 完了反映**: 完了タスクセクションへ P42 準拠空フィールドガード修正（`typeof` + `trim()`、85 passed/2 skipped）を追加。完了済み未タスク指示書の参照先を `docs/30-workflows/completed-tasks/task-imp-quick-validate-empty-field-guard-001.md` に同期                                                                                                                                                                                                    |
| **1.62.4**  | **2026-02-27** | **TASK-9F 成果物を completed-tasks へ移動**: `docs/30-workflows/skill-share/` を `docs/30-workflows/completed-tasks/skill-share/` へ移動し、UT-9F 未タスク6件も `completed-tasks/skill-share/unassigned-task/` へ移動。残課題テーブルと検証コマンド参照パスを同期                                                                                                                                                                                                                                  |
| **1.62.3**  | **2026-02-27** | **未タスク台帳の整合性改善タスクを登録**: `UT-IMP-AIWORKFLOW-UNASSIGNED-TABLE-DEDUP-001` を残課題テーブルへ追加。併せて同一ID重複だった `UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001` の二重行を整理し、完了行のみを正本として維持                                                                                                                                                                                                                                                                   |
| **1.62.2**  | **2026-02-27** | **TASK-9F 仕様同期の最適化追補**: TASK-9F セクションに仕様書別 SubAgent 分担（interfaces/api-ipc/security/task/lessons）・検証結果（13/13, 28項目, 95/95, current=0）・成果物マトリクス（`spec-update-summary.md` 含む）を追加                                                                                                                                                                                                                                                                     |
| **1.62.1**  | **2026-02-27** | **TASK-9F Phase 12 再監査反映**: TASK-9F セクションへ苦戦箇所（IPC登録漏れ/型パスドリフト/未タスク配置誤り）と5ステップ再発防止手順を追加。残課題テーブルへ UT-9F 系6件を `docs/30-workflows/unassigned-task/` 正本パスで登録                                                                                                                                                                                                                                                                      |
| **1.62.0**  | **2026-02-27** | **TASK-9F完了反映**: 完了タスクセクションにスキル共有・インポート機能（3チャネル、共有型10型、92テスト、カバレッジ Line 94-100%）を追加。実装内容・テスト結果・セキュリティ準拠を記録                                                                                                                                                                                                                                                                                                              |
| **1.61.3**  | **2026-02-26** | **TASK-9B 完了移管に同期**: 実行ワークフロー `docs/30-workflows/completed-tasks/task-9b-skill-creator/` への移動と、未タスク `UT-IMP-TASK9B-SPEC-CONTRACT-GUARD-001` の `completed-tasks/unassigned-task/` 移管を反映。残課題テーブルを完了表記へ更新                                                                                                                                                                                                                                              |
| **1.61.2**  | **2026-02-26** | **UT-IMP-TASK9B-SPEC-CONTRACT-GUARD-001 登録**: TASK-9B 再監査で顕在化した苦戦箇所（13chドリフト、`create` P42 3段検証漏れ、`current/baseline` 誤読）を再発防止する未タスクを残課題テーブルへ追加。未タスク仕様書の Section 3.5 に課題/発見経緯/解決策/教訓を反映                                                                                                                                                                                                                                  |
| **1.61.1**  | **2026-02-26** | **TASK-9B再監査の完了記録を追加**: 完了タスクセクションへ TASK-9B（13チャンネル同期、P42 `create` 補完、成果物台帳同期）を追加。仕様書別SubAgent分担、苦戦箇所3件、簡潔解決5ステップ、検証証跡（13/13・28項目・89/89・current=0）を記録                                                                                                                                                                                                                                                            |
| **1.61.3**  | **2026-02-26** | **TASK-9A Phase 12完了に伴う移管**: `docs/30-workflows/TASK-9A-skill-editor/` を `docs/30-workflows/completed-tasks/TASK-9A-skill-editor/` へ移動し、完了タスク参照を更新。併せて `TASK-9A-C-004` を完了化し、未タスク指示書を `completed-tasks/unassigned-task/` へ移管                                                                                                                                                                                                                           |
| **1.61.2**  | **2026-02-26** | **TASK-9A-C-004 未タスク登録**: `task-9a-c-phase12-spec-sync-guard.md` を残課題テーブルへ追加。Phase 12再確認で顕在化した Part 1/2 要件漏れ、`current/baseline` 誤読、`## メタ情報` 重複、3仕様書同期漏れを再発防止タスクとして台帳化                                                                                                                                                                                                                                                              |
| **1.61.1**  | **2026-02-26** | **TASK-9A 再確認追補**: 完了タスク `TASK-9A-skill-editor` に実装時の苦戦箇所3件と4ステップ再利用手順を追記。Phase 12実装ガイド2パート要件不足・scoped監査誤読・未タスクメタ情報重複の再発防止手順を台帳化                                                                                                                                                                                                                                                                                          |
| **1.61.0**  | **2026-02-26** | **TASK-9A完了同期**: 完了タスクセクションに `TASK-9A-skill-editor` を追加し、残課題テーブルの `TASK-9A-C`（spec_created）を完了化。併せて `TASK-9A-C-002`（ファイルCRUD）を完了化し、参照先を `completed-tasks/unassigned-task/` へ移管                                                                                                                                                                                                                                                            |
| **1.60.8**  | **2026-02-25** | **UT-IMP-THEME-DYNAMIC-SWITCH-ROBUSTNESS-001 追加**: UT-UI-THEME-DYNAMIC-SWITCH-001 の苦戦箇所（状態責務混在 / Hook再実行ループ / Phase 12証跡同期漏れ）を再発防止する未タスクを残課題テーブルへ登録                                                                                                                                                                                                                                                                                               |
| **1.60.7**  | **2026-02-25** | **UT-UI-THEME-DYNAMIC-SWITCH-001 テンプレート最適化**: 完了タスクセクションに「Phase 12 Step 2 転記テンプレート（短縮版）」を追加。実装内容・苦戦箇所・再利用手順・3仕様書同時更新・検証コマンドの記録形式を標準化                                                                                                                                                                                                                                                                                 |
| **1.60.6**  | **2026-02-25** | **UT-UI-THEME-DYNAMIC-SWITCH-001 完了記録追記**: 完了タスクセクションへ実装内容・苦戦箇所・簡潔解決手順（4ステップ）を追加。`outputs/phase-12/phase12-task-spec-compliance-check.md` を証跡として登録し、Phase 12 準拠判定の根拠を固定                                                                                                                                                                                                                                                             |
| **1.60.5**  | **2026-02-25** | **UT-UI-THEME-DYNAMIC-SWITCH-001 台帳同期完了**: 残課題テーブルの同タスクを完了化（取り消し線 + 完了日）し、4モード動的切替（kanagawa-dragon/light/dark/system）完了状態へ整合                                                                                                                                                                                                                                                                                                                     |

| **1.61.0** | **2026-02-26** | **TASK-9B再監査反映**: `TASK-9B-H` 完了行の参照先を `completed-tasks/skill-creator-ipc/` に正規化し、task-workflow 上の SkillCreator 関連リンク整合を是正 |
| **1.60.9** | **2026-02-25** | **UT-IMP-PHASE12-SPEC-SYNC-SUBAGENT-GUARD-001 登録**: UT-FIX-SKILL-EXECUTE-INTERFACE-001 Phase 12 再確認で顕在化した「4仕様書同期漏れ」「current/baseline誤読」「検証コマンド誤用」を再発防止する未タスクを残課題テーブルへ追加。指示書 Section 3.5 に苦戦箇所と解決策を反映 |
| **1.60.8** | **2026-02-25** | **UT-FIX-SKILL-EXECUTE-INTERFACE-001 仕様書別SubAgent分担を追補**: 完了タスクセクションに仕様書同期チーム（A: interfaces / B: security / C: task-workflow / D: lessons）の分担表を追加。実装内容・苦戦箇所・検証証跡を仕様書単位で責務分離し、同期漏れ防止運用を明文化 |
| **1.60.7** | **2026-02-25** | **UT-FIX-SKILL-EXECUTE-INTERFACE-001 Phase 12再確認を追記**: `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit --diff-from HEAD` の再実行結果を完了セクションに追加。関連未タスク3件の scoped監査結果（current=0）と、再確認時の苦戦箇所（`--target-file`解釈・`validate-phase-output`引数誤用）を明文化 |
| **1.60.6** | **2026-02-25** | **UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001 完了反映**: 残課題テーブルの同タスクを完了化（取り消し線 + 完了日）し、参照先を `docs/30-workflows/completed-tasks/task-imp-aiworkflow-spec-reference-sync-001.md` へ同期 |
| **1.60.5** | **2026-02-25** | **UT-FIX-SKILL-EXECUTE-INTERFACE-001 完了反映 + 未タスクリンク是正**: 完了タスクセクションに `skill:execute` 契約整合（`skillName` 正式 + `skillId` 後方互換）を追加。残課題テーブルの `UT-IMP-SKILL-IPC-RESPONSE-CONTRACT-GUARD-001` / `UT-IMP-PHASE12-IMPLEMENTATION-GUIDE-QUALITY-GATE-001` を `unassigned-task/` 正本へ補正 |
| **1.60.4** | **2026-02-25** | **UT-IMP-PHASE12-VALIDATION-COMMAND-STANDARDIZATION-001 / UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001 完了移管**: Phase 12完了を確認し、未タスク指示書を `completed-tasks/unassigned-task/` へ、実行ワークフローを `completed-tasks/ut-imp-unassigned-audit-scope-control-001/` へ移動。残課題行を完了化して参照パスを同期 |
| **1.60.3** | **2026-02-25** | **UT-IMP-PHASE12-VALIDATION-COMMAND-STANDARDIZATION-001 登録**: Phase 12再確認で顕在化したコマンド運用課題（`quick_validate.js` 統一、`verify-all-specs --workflow` 必須化、`*-final.log` 運用）を未タスクとして残課題テーブルへ追加 |
| **1.60.2** | **2026-02-25** | **UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001 最終整合**: Phase 12 再確認証跡の検証コマンド表記を `quick_validate.js` に統一し、`verify-all-specs` 実行時の `--workflow` 必須条件を運用ルールとして明記 |
| **1.60.1** | **2026-02-25** | **UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001 Phase 12準拠再確認**: `phase12-task-spec-compliance-check.md` を追加し、Task 1〜5の証跡を再点検。`skill-creator` の `quick_validate.js` で2スキルの構造妥当性を再確認し、未タスク指示書の配置（unassigned残置なし / completed存在）を同期記録 |
| **1.60.0** | **2026-02-25** | **UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001完了反映（Phase 1-12）**: 残課題テーブルの同タスクを完了化（取り消し線 + 完了日）し、参照先を実行ワークフロー `docs/30-workflows/completed-tasks/ut-imp-unassigned-audit-scope-control-001/index.md` へ更新。current/baseline分離運用（`--target-file` / `--diff-from`）の完了状態を台帳同期 |
| **1.59.0** | **2026-02-25** | **UT-SKILL-IPC-PRELOAD-EXTENSION-001成果物移管反映**: Phase 12完了済みのワークフロー `ut-skill-ipc-preload-extension-001` を `completed-tasks/` へ移動。対応する未タスク指示書 `task-imp-ipc-preload-extension-spec-alignment-001.md` も `completed-tasks/unassigned-task/` へ移管し、参照パスを更新 |
| **1.58.0** | **2026-02-25** | **UT-IMP-IPC-PRELOAD-SPEC-SYNC-CI-GUARD-001登録**: task-9D〜9J 仕様契約ドリフトの再発防止を目的に、旧参照パス検出・必須artifacts検証・Date方針検証をCIガード化する未タスクを残課題テーブルへ追加。親タスクの苦戦箇所3件を未タスク指示書 Section 3.5 に反映 |
| **1.57.0** | **2026-02-25** | **UT-IMP-IPC-PRELOAD-EXTENSION-SPEC-ALIGNMENT-001完了反映**: task-9D〜9J の仕様差分是正完了を完了タスクセクションへ追加。残課題テーブルの同タスクを完了化（取り消し線 + 完了日）し、完了記録参照を `completed-task/task-013-*` へ更新 |
| **1.56.0** | **2026-02-25** | **UT-SKILL-IPC-PRELOAD-EXTENSION-001完了反映**: 完了タスクセクションに30チャネルIPC/Preload拡張計画（`spec_created`）を追加。残課題テーブルに `UT-IMP-IPC-PRELOAD-EXTENSION-SPEC-ALIGNMENT-001` を登録し、参照切れ・パス差分・命名差分の是正タスクを明示 |
| **1.58.0** | **2026-02-25** | **UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001登録**: Phase 12 仕様更新時の参照同期漏れ（baseline/current混同、完了移管後リンク漏れ、通常/fallback片側修正）を再発防止する未タスクを残課題テーブルへ追加。未タスク指示書に苦戦箇所を Section 3.5 として記録 |
| **1.57.0** | **2026-02-25** | **UT-IPC-AUTH-HANDLE-DUPLICATE-001完了反映**: 完了タスクセクションへ実装完了記録を追加し、残課題テーブルの同タスクを完了化（取り消し線 + completed-tasks参照へ更新）。UT-IPC-CHANNEL-NAMING-AUDIT-001 の未タスク件数を0件に更新 |
| **1.56.0** | **2026-02-25** | **UT-IPC-CHANNEL-NAMING-AUDIT-001完了反映 + 未タスク1件登録**: 完了タスクセクションに `spec_created` として追加し、残課題テーブルの参照先を `completed-tasks/task-ipc-channel-naming-audit-001.md` へ更新。Phase 10/11 MINOR を `UT-IPC-AUTH-HANDLE-DUPLICATE-001` として未タスク登録（指示書作成・台帳登録・検証連動） |
| **1.58.0** | **2026-02-25** | **UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 由来の未タスク2件登録**: `UT-IMP-SKILL-IPC-RESPONSE-CONTRACT-GUARD-001`（skill IPCレスポンス契約マトリクス + 自動整合チェック）と `UT-IMP-PHASE12-IMPLEMENTATION-GUIDE-QUALITY-GATE-001`（Part 1/Part 2 必須要件の品質ゲート化）を残課題テーブルへ追加 |
| **1.57.0** | **2026-02-25** | **UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 教訓追記**: 完了タスクセクションに「実装時の苦戦箇所と解決策」および「同種課題の簡潔解決手順（4ステップ）」を追加。`safeInvoke/safeInvokeUnwrap` 使い分け・Phase 12 実装ガイド要件不足・未タスク監査のベースライン混同に対する再発防止手順を明文化 |
| **1.56.0** | **2026-02-25** | **UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001完了反映**: 残課題テーブルの同タスクを完了化（取り消し線 + 完了日）し、参照先を `docs/30-workflows/completed-tasks/ut-fix-skill-ipc-response-consistency-001/index.md` に更新。完了タスクセクションへ成果物6件と変更理由を追記 |
| **1.55.1** | **2026-02-24** | **UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001登録**: 未タスク監査の対象スコープ制御（対象監査）とベースライン分離（全体監査）を行う運用改善タスクを残課題テーブルに追加。親タスクの苦戦箇所（全体監査ノイズ、台帳同期負荷、検証タイミング遅延）を Section 3.5 に反映 |
| **1.55.0** | **2026-02-24** | **UT-IPC-DATA-FLOW-TYPE-GAPS-001完了反映**: 完了タスクセクションに仕様書修正のみタスク（6 Gap解消・7仕様書修正・173検証項目ALL PASS）を追加。Phase 10 MINOR M-1（SkillUsageSummary.lastUsed nullable差異）を未タスク UT-IPC-DATA-FLOW-NULLABLE-CONSISTENCY-001 として残課題テーブルに登録。P3準拠3ステップ完了 |
| **1.54.0** | **2026-02-24** | **UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 Phase 12 未タスク2件登録**: UT-IPC-CHANNEL-NAMING-AUDIT-001（IPCチャネル命名規則の横断的適用監査と統一）、UT-SPEC-ONLY-TASK-WORKFLOW-001（仕様書修正のみタスクのPhaseテンプレート・grep検証TDD標準化）をP3準拠で残課題テーブルに追加 |
| **1.53.1** | **2026-02-24** | **UT-FIX-TS-VITEST-TSCONFIG-PATHS-001 参照整合再監査**: 残課題テーブルの完了行参照を `completed-tasks/task-vitest-tsconfig-paths-sync-automation.md` に更新し、実装ワークフロー（`vitest-tsconfig-paths-sync/`）との二重リンクを明記 |
| **1.53.0** | **2026-02-24** | **UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 / TASK-UI-00-ATOMS 完了反映**: 完了タスクセクションに2タスクを追加。UTは仕様書修正のみ（`spec_created`）として記録、UI Atomsは完了成果物と未タスク3件の登録状況を追記。併せて `task-ui-00-atoms` の参照パスを `tasks/completed-task/00-2-atoms-components.md` へ正規化 |
| **1.53.0** | **2026-02-24** | **UT-FIX-SKILL-VALIDATION-CONSISTENCY-001 追補整合**: 残課題 `UT-FIX-SKILL-VALIDATION-P42-001` を完了化し、補完タスク `UT-FIX-SKILL-VALIDATION-CONSISTENCY-001` と状態同期。重複管理による未実施誤読を解消 |
| **1.52.0** | **2026-02-22** | **TASK-IMP-MODULE-SYNC-REPORT-ENHANCEMENT-001登録**: TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001 Phase 10 MINOR指摘3件（M1: 修正ガイダンス未実装、M2: サマリーエントリ数未表示、M3: printSummaryシグネチャ設計乖離）を統合した未タスクを残課題テーブルに追加。P3準拠で3ステップ完了（指示書・残課題テーブル・quality-requirements.md参照リンク） |
| **1.51.0** | **2026-02-22** | **UT-FIX-SKILL-IMPORT-ID-MISMATCH-001苦戦箇所から未タスク2件登録**: UT-TYPE-SKILL-IDENTIFIER-BRANDED-001（Skill識別子Branded Type導入）、UT-REFACTOR-SKILL-IMPORT-DIALOG-DEDUP-001（SkillImportDialog同名コンポーネント解消）をP3準拠で残課題テーブルに追加。Section 3.5に苦戦箇所（同名コンポーネント混乱、誤解を招くインポート成功ログ、importedSkillIds二重セマンティクス）を記録 |
| **1.50.0** | **2026-02-22** | **UT-FIX-SKILL-IMPORT-ID-MISMATCH-001完了反映**: 残課題テーブルを完了化（取り消し線 + 完了日）。完了タスクセクションに詳細記録追加。Renderer層のみ変更（skill.id→skill.name、IPC/Preload無変更） |
| **1.49.0** | **2026-02-22** | **UT-FIX-SKILL-IMPORT-ID-MISMATCH-001登録**: SkillImportDialog（organisms版）が skill.id（SHA-256ハッシュ）を渡すためskillHandlers.getSkillByName()が失敗するバグの未タスクを残課題テーブルに追加。P44パターンの新規バリエーション |
| **1.48.0** | **2026-02-21** | **UT-FIX-SKILL-IMPORT-INTERFACE-001完了に伴うファイル移動**: タスク仕様書ディレクトリ `ut-fix-skill-import-interface-001/` を `completed-tasks/` に移動。関連未タスク仕様書4件（UT-FIX-SKILL-VALIDATION-P42-001、UT-FIX-SKILL-IPC-ERROR-RESPONSE-001、UT-FIX-SKILL-IMPORT-RETURN-TYPE-001、UT-FIX-SKILL-IPC-NAMING-P45-001）の参照パスを `unassigned-task/` → `completed-tasks/` に更新 |
| **1.47.0** | **2026-02-21** | **UT-FIX-SKILL-IPC-NAMING-P45-001登録**: skillHandlers IPC引数命名統一タスク（skillId → skillName横展開）を残課題テーブルに追加。P45パターン（IPC引数命名の契約ドリフト）の横展開として、skill:get-detail / skill:execute / SkillService / SkillExecutor / SkillImportManager の引数名修正を定義 |
| **1.46.0** | **2026-02-21** | **UT-FIX-SKILL-REMOVE-INTERFACE-001実装苦戦箇所から未タスク3件登録**: UT-IMP-PHASE11-WORKTREE-PROTOCOL-001（Worktree環境手動テスト実行プロトコル）、UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001（IPCハンドラ粒度カバレッジ計測）、UT-IMP-MULTIAGENT-PHASE-ORDERING-GUARD-001（マルチエージェントPhase依存順序ガード）をP3準拠で残課題テーブルに追加。Section 3.5に苦戦箇所（Phase依存順序違反、Worktree制約、カバレッジスコープ曖昧性）を記録 |
| **1.46.0** | **2026-02-21** | **UT-FIX-SKILL-IMPORT-INTERFACE-001完了反映**: 残課題テーブルの同タスクを完了（取り消し線 + 完了日）へ更新。参照先を `skill-import-agent-system/tasks/completed-task/` に移管し、実体ファイルと整合化 |
| **1.46.0** | **2026-02-21** | **UT-FIX-SKILL-IMPORT-RETURN-TYPE-001完了記録**: 残課題テーブルを取り消し線で完了化。完了タスクセクションに詳細記録（115テスト全PASS、Branch 84.9%、2ステップ変換パターン、P42/P44/P45解決）を追加 |
| **1.45.2** | **2026-02-21** | **未実施タスクの配置是正**: `completed-tasks/unassigned-task/` に誤配置されていた未実施2件（`UT-FIX-TS-VITEST-TSCONFIG-PATHS-001`, `TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001`）を `docs/30-workflows/unassigned-task/` へ移動し、残課題テーブル参照を同期更新 |
| **1.45.1** | **2026-02-21** | **未タスク参照リンク整合を再修正**: `verify-unassigned-links` で検出した未実在リンク4件を実在パスへ更新。`UT-FIX-TS-VITEST-TSCONFIG-PATHS-001` / `TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001` / `TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001` を `completed-tasks/unassigned-task/` へ、`UT-FIX-SKILL-IMPORT-RETURN-TYPE-001` を `skill-import-agent-system/tasks/` へ補正 |
| **1.45.0** | **2026-02-21** | **UT-FIX-SKILL-IMPORT-RETURN-TYPE-001登録**: skill:import IPCハンドラ戻り値型不整合修正タスクを残課題テーブルに追加。20フレームワーク多角的分析で発見されたImportResult→ImportedSkill変換漏れの修正 |
| **1.44.0** | **2026-02-20** | **UT-FIX-SKILL-REMOVE-INTERFACE-001派生未タスク2件登録**: UT-FIX-SKILL-VALIDATION-P42-001（P42バリデーション横展開）、UT-FIX-SKILL-IPC-ERROR-RESPONSE-001（エラー応答パターン統一）を残課題テーブルに追加。実装苦戦箇所（P23/P42/P44/P45）を未タスク指示書に反映 |
| **1.43.0** | **2026-02-20** | **未タスク配置ディレクトリ整合を是正**: 未実施タスク（task-imp-vitest-alias-sync-automation-001 / UT-9A-B-001〜003）の参照先を `docs/30-workflows/unassigned-task/` に統一。完了済み UT-9B-H-003 の参照を `completed-tasks/ut-9b-h-003-security-hardening/index.md` に更新。`verify-unassigned-links.js` で再検証 |
| **1.43.0** | **2026-02-20** | **未タスク2件登録**: TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001（@repo/shared ソース構造二重性統一、中優先度）、TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001（3層整合CIガード、高優先度）をP3準拠で残課題テーブルに追加。architecture-monorepo.mdに参照リンク追加 |
| **1.42.1** | **2026-02-20** | **TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001記録強化**: 完了タスク記録に品質ゲート達成状況テーブル（typecheck 228→0、vitest 224/224 PASS、shared build成功、lint PASS）、変更ファイル詳細（tsconfig +27 paths、package.json +26 typesVersions、vitest.config +3 alias）、変更行数（+353行/17ファイル）、テスト数（224テスト/3スイート）を追記。残課題 UT-FIX-TS-VITEST-TSCONFIG-PATHS-001 の説明を詳細化（背景・提案解決策・スコープ追記） |
| **1.42.0** | **2026-02-20** | **UT-FIX-SKILL-REMOVE-INTERFACE-001完了反映**: 残課題テーブルの同タスクを完了（取り消し線 + 完了日）へ更新。参照先を `skill-import-agent-system/tasks/completed-task/` に変更。UT-FIX-SKILL-IMPORT-INTERFACE-001 の参照先も実ファイルパスへ修正 |
| **1.42.0** | **2026-02-20** | **TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001完了記録追加**: `@repo/shared` モジュール解決修正（`exports`/`paths`/`alias` 整合、補助型宣言取り込み、回帰テスト3ファイル追加）を完了タスクセクションへ反映。残課題に `UT-FIX-TS-VITEST-TSCONFIG-PATHS-001` を登録 |
| **1.41.0** | **2026-02-20** | **UT-FIX-SKILL-REMOVE-INTERFACE-001登録**: skill:remove IPCインターフェース不整合修正タスクを残課題テーブルに追加。UT-FIX-SKILL-IMPORT-INTERFACE-001の優先度を中→高に変更 |
| **1.40.0** | **2026-02-20** | **UT-FIX-SKILL-IMPORT-INTERFACE-001登録**: skill:import IPCハンドラ・Preloadインターフェース不整合修正タスクを残課題テーブルに追加 |
| 1.39.0 | 2026-02-19 | TASK-9A-C 未タスク3件登録（TASK-9A-C-001: シンタックスハイライト、TASK-9A-C-002: ファイルCRUD、TASK-9A-C-003: エディタ移行）。TASK-9A-Cを completed-tasks/ にパス更新。P3防止3ステップ完了 |
| 1.39.0 | 2026-02-19 | 未タスク3件追加: UT-9A-B-001（IPC入力バリデーション標準化）、UT-9A-B-002（IPCエラーサニタイズ共通化）、UT-9A-B-003（IPCテストhandlerMapモック共通化）。TASK-9A-B Phase 12検出 |
| 1.38.0 | 2026-02-19 | TASK-9A-C SkillEditor UI仕様書作成記録追加。残課題テーブルにTASK-9A-Cをspec_created（仕様書作成済み・実装未着手）として登録。仕様書パス: `docs/30-workflows/TASK-9A-C-skill-editor-ui/` |
| 1.38.0 | 2026-02-19 | TASK-9A-B完了記録追加。スキルファイル操作IPCハンドラー6チャンネル実装（skill:readFile/writeFile/createFile/deleteFile/listBackups/restoreBackup）、65テスト全PASS、カバレッジ Line 91.14% / Branch 93.93% / Function 100% |
| 1.38.0 | 2026-02-19 | TASK-FIX-10-1-VITEST-ERROR-HANDLING完了記録を追加。dangerouslyIgnoreUnhandledErrors削除・Vitest alias 18件追加・新規テスト13件を反映。残課題に task-imp-vitest-alias-sync-automation-001 を登録。苦戦箇所と解決策（Step 2判定、未タスク検出範囲、参照整合）を追記 |
| 1.37.0 | 2026-02-14 | UT-FIX-IPC-RESPONSE-UNWRAP-001完了記録を追加。残課題テーブルで同タスクを完了マークし、MINOR由来の未タスク2件（UT-FIX-IPC-RESPONSE-UNWRAP-002/003）を登録 |
| 1.37.0 | 2026-02-14 | TASK-FIX-14-1完了記録を追加（本番コード4ファイル27箇所のconsole→electron-log移行）。未タスク TASK-FIX-14-2（SkillExecutor残存4箇所）を残課題テーブルへ登録 |
| 1.33.1 | 2026-02-14 | UT-FIX-IPC-HANDLER-DOUBLE-REG-001 の完了タスク参照パスを `completed-tasks/` に修正。`verify-unassigned-links.js` での参照切れを解消 |
| 1.33.0 | 2026-02-14 | UT-FIX-IPC-HANDLER-DOUBLE-REG-001完了記録追加。IPC ハンドラ二重登録防止修正（activate イベント）。残課題テーブルから完了タスクに移動 |
| 1.32.0 | 2026-02-13 | 未タスク2件追加: task-imp-vitest-mock-reset-utility-001（mock 2段階リセットユーティリティ）、task-ref-vitest-module-mock-audit-001（モジュールモック監査・ガイドライン）。TASK-FIX-11-1 実装苦戦箇所から検出 |
| 1.31.0 | 2026-02-13 | TASK-FIX-11-1-SDK-TEST-ENABLEMENT完了記録追加。SDK統合テストTODO有効化17件、Phase 12 Step 1-A/1-D反映、関連仕様書3ファイル更新を記録 |
| 1.0.0 | 2026-01-20 | 初版作成 |
| 1.1.0 | 2026-01-22 | task-specification-creator Phase 12改善完了記録追加 |
| 1.2.0 | 2026-01-22 | 残課題（未タスク）セクション追加、未タスク2件（E2Eテスト、自動化拡充）登録 |
| 1.3.0 | 2026-01-22 | task-specification-creator v7.6.0完了記録追加（Phase 12テンプレート強化） |
| 1.4.0 | 2026-01-22 | 未タスク追加: UT-008 Chat History UI Components, UT-009 Chat History Additional Use Cases |
| 1.5.0 | 2026-01-25 | 未タスク追加: TASK-3-1-B (IPC Handler統合), TASK-SKILL-PERF-TEST (パフォーマンステスト) |
| 1.7.0 | 2026-01-30 | TASK-7D完了記録追加、未タスク2件（task-imp-skillselector-onimportrequest-001, task-imp-chatpanel-new-design-001）登録 |
| 1.8.0 | 2026-01-31 | 未タスク追加: TASK-CHUNK-API-001 (Chunk Search API), TASK-DOM-NESTING-001 (DOM警告修正) |
| 1.9.0 | 2026-01-31 | 未タスク9件追加: TASK-SKILL-RETRY-001関連5件（設定UI/履歴永続化/サーキットブレーカー/Rendererイベント/型shared移行）+ システム仕様検出3件（Chunk Search API層/PlainTextConverter/ベクトル検索フィルター） |
| 1.6.0 | 2026-01-26 | spec-guidelines.md準拠: コードブロックを表形式・文章に変換（成果物配置、フェーズ遷移図、ファイル配置） |
| 1.10.0 | 2026-02-02 | 未タスク2件追加: task-imp-ipc-imp002-channels-001（IMP-002チャネル実装）、task-imp-ipc-permission-response-001（permission:response実装）。TASK-8C-A Phase 12検出 |
| 1.11.0 | 2026-02-02 | 未タスク追加: task-ref-quality-requirements-split-001（quality-requirements.md仕様書分割）。TASK-OPT-CI-TEST-PARALLEL-001 Phase 12検出 |
| 1.12.0 | 2026-02-02 | 未タスク2件追加: task-e2e-permission-waitfortimeout-001（waitForTimeout改善）、task-e2e-test-readme-documentation-001（READMEドキュメント）。TASK-8C-D Phase 9/10検出 |
| 1.13.0 | 2026-02-03 | 未タスク5件追加: TASK-9B-H（IPC通信設定）、UI-INTEGRATION-9B（UI統合）、TASK-9B-I（SDK統合）、TASK-9B-J（キャッシュ無効化）、TASK-9B-K（タイムアウト外部化）。TASK-9B-G Phase 12検出 |
| 1.14.0 | 2026-02-03 | 未タスク3件追加: TASK-10A-UI-SKILL-IMPROVE（スキル改善UI）、TASK-10B-IMPROVE-HISTORY（履歴永続化）、TASK-10C-AB-TEST（A/Bテスト）。TASK-9C Phase 11/12検出 |
| 1.17.0 | 2026-02-04 | AUTH-UI-001完了記録追加。UT-AUTH-001タスク仕様書パスを正式な指示書（ut-auth-001-profilehandlers-test-fix.md）に更新 |
| 1.16.0 | 2026-02-04 | 未タスク追加: UT-AUTH-001（profileHandlers.test.ts環境修正）。AUTH-UI-001 Phase 5検出 |
| 1.15.0 | 2026-02-04 | AUTH-UI-004完了: 未タスク1件追加（task-imp-phase12-validation-001）、better-sqlite3タスクv1.1.0更新 |
| 1.16.0 | 2026-02-04 | 未タスク2件追加: task-search-scope-folder-001（検索スコープ指定）、task-search-multifile-replace-001（マルチファイル一括置換）。task-imp-search-ui-001 Phase 12検出 |
| 1.18.0 | 2026-02-10 | UT-FIX-5-3/UT-FIX-5-4完了記録追加。残課題テーブルから完了タスクセクションに移動。Agent Abort IPCセキュリティ修正・AgentSDKAPI型定義修正完了 |
| 1.18.0 | 2026-02-05 | 未タスク追加: UT-ENV-001（CI node-versionの.nvmrc参照化）。ENV-INFRA-001 Phase 3検出 |
| 1.19.1 | 2026-02-06 | DEBT-SEC-001完了記録追加。UT-SEC-001はDEBT-SEC-002/003の対応範囲に包含と判定（独立未タスク不要） |
| 1.19.0 | 2026-02-06 | TASK-AUTH-SESSION-REFRESH-001完了記録追加、未タスク3件追加（UT-OFFLINE-REFRESH-001、UT-AUDIT-001、UT-REFRESH-NOTIFICATION-001） |
| 1.20.0 | 2026-02-06 | 未タスク2件追加: UT-PROTOCOL-URL-001（カスタムプロトコルURLパース標準化）、UT-SEC-001更新（独立指示書作成）。TASK-AUTH-CALLBACK-001 Phase 12苦戦箇所検出 |
| 1.21.0 | 2026-02-09 | 未タスク追加: TASK-FIX-12-2-IPC-HARDCODE-FIX-UPDATER-AGENT（Updater/AgentHandler IPCチャネル名定数化）。TASK-FIX-12-1 Phase 12検出 |
| 1.22.0 | 2026-02-10 | 未タスク更新: TASK-DOC-PHASE12-JUDGMENT-CRITERIA-001（Phase 12判断基準の明確化と漏れ防止強化）。TASK-FIX-6-1-STATE-CENTRALIZATION Phase 12で発生したP25-P28全インシデントをカバーする包括的な改善タスク |
| 1.23.0 | 2026-02-10 | 未タスク2件追加: UT-STORE-HOOKS-REFACTOR-001（Store Hooks個別セレクタ再設計）、UT-FIX-APP-INITAUTH-CHECK-001（App.tsx initializeAuth確認）。TASK-UT-AUTH-MODE-UI-INTEGRATION Phase 10/12検出 |
| 1.24.0 | 2026-02-11 | UT-STORE-HOOKS-REFACTOR-001完了。未タスク2件追加: UT-STORE-HOOKS-REFACTOR-002（JSDoc追加）、UT-STORE-HOOKS-REFACTOR-003（合成Hook移行）。Phase 10最終レビュー検出 |
| 1.25.0 | 2026-02-11 | 未タスク3件追加: UT-FIX-7-1-001（SkillService型ガード改善）、UT-FIX-7-1-002（skillHandlers分割）、UT-FIX-7-1-003（IPCレスポンスパターン統一）。TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION Phase 12検出 |
| 1.27.0 | 2026-02-12 | TASK-9B-I-SDK-FORMAL-INTEGRATION完了記録追加。残課題テーブルからTASK-9B-Iを完了マーク。SDK型安全統合（as any除去、SDKQueryOptions変更） |
| 1.26.0 | 2026-02-12 | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION完了記録を完了タスクセクションに追加。Phase 12仕様書更新漏れ修正 |
| 1.30.2 | 2026-02-12 | UT-9B-H-003完了後処理: 未タスク指示書を `unassigned-task/` から `completed-tasks/unassigned-task/` へ移管し、参照パスを更新 |
| 1.30.1 | 2026-02-12 | UT-9B-H-003完了反映: 残課題テーブルの該当行を完了ステータスに更新（取り消し線 + 完了日追記） |
| 1.30.0 | 2026-02-12 | UT-9B-H-003完了: SkillCreator IPCセキュリティ強化Phase 1-12完了。validatePath/sanitizeErrorMessage/ALLOWED_SCHEMA_NAMES追加、116テスト全PASS |
| 1.30.0 | 2026-02-12 | 未タスク1件追加: UT-9B-I-001（カスタム型宣言ファイルとSDK実型の共存整理）。TASK-9B-I-SDK-FORMAL-INTEGRATION Phase 12検出 |
| 1.28.0 | 2026-02-12 | 未タスク2件追加: UT-9B-H-003（IPCセキュリティ強化）、UT-9B-H-004（設計書-実装整合性修正）。TASK-9B-H-SKILL-CREATOR-IPC 最終品質レビュー検出 |
| 1.27.0 | 2026-02-12 | TASK-9B-H完了記録追加。未タスク2件追加: UT-9B-H-001（IpcResult型統一）、UT-9B-H-002（Zodスキーマ移行）。TASK-9B-H-SKILL-CREATOR-IPC Phase 12検出 |
| 1.29.0 | 2026-02-12 | 未タスク追加: UT-9B-H-005（Preload API二重公開パターン統一）。TASK-9B-H Phase 10 M-02 / Phase 11 D-3検出 |
| 1.30.0 | 2026-02-12 | UT-FIX-AGENTVIEW-INFINITE-LOOP-001完了記録追加。P31適用範囲をAgentViewまで拡張し、Phase 12成果物リンクを反映 |
| 1.31.0 | 2026-02-12 | 未タスク参照パス整合性を修正。完了済み3件（UT-FIX-5-3/5-4, UT-STORE-HOOKS-REFACTOR-001）の参照先をcompleted-tasksへ更新、未実施3件（UT-STORE-HOOKS-REFACTOR-002/003, UT-FIX-APP-INITAUTH-CHECK-001）のunassigned-task配置を反映 |
| 1.32.0 | 2026-02-12 | UT-FIX-AGENTVIEW-INFINITE-LOOP-001を`completed-tasks/`へ移動。関連未タスク4件（UT-FIX-5-1-001, UT-STORE-HOOKS-REFACTOR-002/003, UT-FIX-APP-INITAUTH-CHECK-001）の参照先を`completed-tasks/`へ同期 |
| 1.33.0 | 2026-02-13 | 未タスク2件追加: UT-TEST-EVENT-STANDARDIZATION-001（テストイベントAPI標準化、P39/P40教訓）、UT-SETTINGSVIEW-INLINE-SELECTOR-001（SettingsViewインラインセレクタ移行）。UT-FIX-AGENTVIEW-INFINITE-LOOP-001 Phase 10/12検出 |
| 1.34.0 | 2026-02-13 | TASK-FIX-13-1完了記録追加。deprecated型プロパティ（Anchor.name, Skill.lastUpdated）削除、型回帰テスト追加、関連タスク仕様書への参照を反映 |
| 1.35.0 | 2026-02-13 | 未タスク追加: UT-PERF-001（グラフユーティリティ性能ベンチマーク基準再設計）。TODO検出結果を未タスク指示書へ登録 |
| 1.36.0 | 2026-02-13 | TASK-FIX-13-1 苦戦箇所と解決策を完了タスクセクションへ追記。削除対象境界・参照置換安全性・Phase 12同期手順を明文化 |

## 07-TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001 完了記録（2026-03-08）

- 実装: `navigationSlice.ts` / `store/index.ts` に iterable/type guard を追加
- テスト: `navigationSlice.test.ts` に破損 persist 再現ケースを追加
- Phase 11: `outputs/phase-11/screenshots/TC-11-01..03` を取得して画面検証を実施
- Phase 12: 実装ガイド・changelog・未タスク検出・スキル改善レポートを更新

### 関連未タスク

- `docs/30-workflows/unassigned-task/task-persist-migration-versioning.md`
- `docs/30-workflows/unassigned-task/task-persist-field-validation-guard.md`

### 苦戦箇所（TASK-07）

| 項目 | 内容 | 対処 |
| --- | --- | --- |
| Phase 12 Task 1 不足 | `implementation-guide.md` が見出しのみで内容要件不足 | `validate-phase12-implementation-guide` を通るまで補完 |
| worktree 依存欠損 | `@rollup/rollup-darwin-x64` 欠損で vitest/screenshot 失敗 | `pnpm install --frozen-lockfile` で復旧後に再実行 |
| テスト対象の誤実行 | `test:run --` で全体実行になりやすい | `cd apps/desktop && pnpm exec vitest run <target>` に固定 |
