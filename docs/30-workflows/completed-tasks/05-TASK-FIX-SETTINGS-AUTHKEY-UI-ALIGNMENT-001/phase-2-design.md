# Phase 2: 設計

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 2                                             |
| 機能名     | 05-TASK-FIX-SETTINGS-AUTHKEY-UI-ALIGNMENT-001 |
| タスク名   | 設定画面 authKey 導線の auth-mode 契約整合    |
| 作成日     | 2026-03-06                                    |
| ステータス | 未実施                                        |

## 目的

SettingsView で auth-mode=`api-key` を選択した時に authKey 専用 UI、保存済みキー基準の状態表示、`ANTHROPIC_API_KEY` fallback を含む preflight 判定の差分説明が同じ導線で理解できる構成を設計し、実装できる仕様へ落とす。

## 背景

既存コードでは `SettingsView` が `AuthModeSelector` と汎用 `ApiKeysSection` を表示する一方、状態表示は `AuthModeService#getStatus()`、実行前判定は `window.electronAPI.authKey.exists()` を使う。`auth-key:exists` は `ANTHROPIC_API_KEY` の環境変数 fallback を含むため、保存済みキーが無いケースで UI の「未設定」表示と実行可否がずれる。

## Atent Team編成

| SubAgent                   | 関心ごと                   | 実行モード | Phase 2 の責務                                    |
| -------------------------- | -------------------------- | ---------- | ------------------------------------------------- |
| SubAgent-Renderer-Settings | Settings UI / local state  | 並列       | authKey 入力 UI の責務境界と表示条件を定義する    |
| SubAgent-Bridge-AuthKey    | Preload / Main 契約        | 並列       | auth-key API と auth-mode status の整合を確認する |
| SubAgent-Tests-Flow        | 統合テスト / manual flow   | 並列       | settings と preflight の回帰観点を設計する        |
| SubAgent-Lead-Sync         | 仕様統合 / aiworkflow 同期 | 直列統合   | 参照仕様とタスク境界を 1 つの仕様へ統合する       |

## 実行タスク

- 層責務設計: Renderer / Preload / Main / Test / Docs の変更責務を分ける
- 設計判断: SettingsView 配下に authKey 専用セクションを置き、mode=`api-key` の時だけ表示する / `window.electronAPI.authKey` を使う専用 action または hook を定義し、生の key はローカル入力 state だけで扱う / `auth-mode:status` と `auth-key:exists` の組み合わせから「保存済み」「環境変数 fallback」「未設定」「確認失敗」の 4 状態を設計案へ落とす
- SubAgent 分担: Atent Team と Codex 委譲境界を Phase 単位で固定する
- リスク整理: 既存完了タスクとの競合点を設計ノートへ記録する

## 参照資料

### 実装・証跡

| 資料名                    | パス                                                                                                                               | 用途                                        |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Renderer View             | `apps/desktop/src/renderer/views/SettingsView/index.tsx`                                                                           | authKey 導線の表示位置を定義する            |
| Renderer Component        | `apps/desktop/src/renderer/components/settings/AuthModeSelector/index.tsx`                                                         | mode 切替 UX と状態表示を扱う               |
| Renderer Utility          | `apps/desktop/src/renderer/utils/skillExecutionAuthPreflight.ts`                                                                   | 実行前認証チェックとの整合を確認する        |
| Preload API               | `apps/desktop/src/preload/index.ts`                                                                                                | authKey API 公開面を確認する                |
| Preload AuthKey API       | `apps/desktop/src/preload/authKeyApi.ts`                                                                                           | authKey invoke API の境界を確認する         |
| Main Service              | `apps/desktop/src/main/services/auth/AuthModeService.ts`                                                                           | mode と authKey 状態の正本を確認する        |
| Main IPC                  | `apps/desktop/src/main/ipc/authKeyHandlers.ts`                                                                                     | auth-key channel を確認する                 |
| Tests                     | `apps/desktop/src/renderer/views/SettingsView/SettingsView.test.tsx`                                                               | SettingsView の回帰試験対象を確認する       |
| 元仕様 manual test        | `docs/30-workflows/completed-tasks/TASK-AUTH-MODE-SELECTION-001/phase-11-manual-test.md`                                           | API キー入力欄表示の期待値を確認する        |
| 元仕様 completion         | `docs/30-workflows/completed-tasks/TASK-AUTH-MODE-SELECTION-001/phase-13-completion.md`                                            | 仕様確定時の完了条件を確認する              |
| contract alignment manual | `docs/30-workflows/completed-tasks/03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001/outputs/phase-11/manual-test-result.md`            | 既存手動証跡の対象外範囲を確認する          |
| iterable investigation    | `docs/30-workflows/completed-tasks/04-TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001/outputs/phase-11/manual-test-result.md` | settings shell が未検証だった事実を確認する |

### システム仕様（aiworkflow-requirements / task-specification-creator）

| 資料名                               | パス                                                                                        | 用途                                                                  |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| task-spec workflow                   | `.claude/skills/task-specification-creator/references/create-workflow.md`                   | create モードの直列/並列ルールを確認する                              |
| phase templates                      | `.claude/skills/task-specification-creator/references/phase-templates.md`                   | Phase 文書の構造を揃える                                              |
| unassigned task guidelines           | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`        | Phase 12 の残課題検出ルールを揃える                                   |
| resource-map                         | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                            | 読むべきシステム正本を固定する                                        |
| quick-reference                      | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                         | IPC / Store / Electron の既存パターンを再確認する                     |
| task-workflow                        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | Phase 12 の完了記録先を確認する                                       |
| quality-requirements                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | TDD と coverage 条件を揃える                                          |
| error-handling                       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | 異常系の記録方法を揃える                                              |
| lessons-learned                      | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 既知の再発パターンを再確認する                                        |
| interfaces-auth                      | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`                      | auth-mode / IPCResponse の正本を確認する                              |
| api-ipc-system                       | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                       | システム設定系 IPC の命名と戻り値を確認する                           |
| api-ipc-auth                         | `.claude/skills/aiworkflow-requirements/references/api-ipc-auth.md`                         | 認証系 IPC の境界（authKey保存/削除導線）を確認する                   |
| ipc-contract-checklist               | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | 公開契約のチェック観点を固定する                                      |
| security-electron-ipc                | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | Preload 経由公開時の制約を確認する                                    |
| arch-state-management                | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | SettingsView と store の責務分離を確認する                            |
| architecture-implementation-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | Main/Preload/Renderer 実装パターンと IPC ライフサイクルを確認する     |
| known-pitfalls                       | `.claude/rules/06-known-pitfalls.md`                                                        | P5/P31 を含む既知の落とし穴再発防止を確認する（正本は .claude/rules） |
| ui-ux-settings                       | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                       | 設定画面 UI の構成方針を確認する                                      |
| ui-ux-forms                          | `.claude/skills/aiworkflow-requirements/references/ui-ux-forms.md`                          | 入力フォームの振る舞いと validation を確認する                        |
| ui-ux-components                     | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     | 設定画面のコンポーネント責務分離を確認する                            |
| ui-ux-design-system                  | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                  | 設定画面のラベル/状態色の一貫性を確認する                             |
| testing-component-patterns           | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`           | SettingsView のテスト責務を確認する                                   |
| security-api-electron                | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | preload API 公開境界（contextBridge / invoke制約）を確認する          |
| security-input-validation            | `.claude/skills/aiworkflow-requirements/references/security-input-validation.md`            | authKey 入力値の trim/空文字/形式検証ポリシーを確認する               |
| ipc-type-resolution-guide            | `.claude/skills/aiworkflow-requirements/references/ipc-type-resolution-guide.md`            | IPC payload ずれ・fallback表現ずれの診断手順を確認する                |
| ui-ux-design-principles              | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`              | 設定画面の説明文・状態表示のUX原則を確認する                          |
| testing-accessibility                | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`                | authKey入力導線のa11y試験観点を確認する                               |

### 前提Phase成果物

| 資料名         | パス               | 用途                               |
| -------------- | ------------------ | ---------------------------------- |
| Phase 1 成果物 | `outputs/phase-1/` | Phase 1 の出力を入力として参照する |

## 実行手順

1. Phase 1 の AC と scope-boundary を入力にして変更責務を層別に分解する。
2. SubAgent ごとに扱う関心ごとと Codex へ渡す実装境界を表にする。
3. 例外時の fallback、event、状態遷移、UI 表示条件を設計ノートに記述する。
4. 設計結果を review 可能な粒度に揃える。

## 統合テスト連携

- `auth-mode:status` の保存キー基準表示と `auth-key:exists` の環境変数 fallback 判定差分を UI 文言へ反映する
- `auth-mode:set` 実行後の UI 更新、エラー表示、成功表示を同じ fixture で確認する
- `skillExecutionAuthPreflight.ts` から見える authKey 状態と SettingsView の表示を同じ手順で確認する

## 多角的チェック観点

| 観点         | 確認内容                                                                 |
| ------------ | ------------------------------------------------------------------------ |
| 責務分離     | generic provider API key 設定と authKey 設定が同じ UI に混在していないか |
| 契約整合     | auth-mode / authKey / preflight の戻り値が同じ意味で表示されるか         |
| UX           | 入力欄、保存結果、削除結果が mode 切替と衝突しないか                     |
| セキュリティ | authKey を Renderer 側 state に長時間保持しない設計になっているか        |

## 成果物

| 成果物     | パス                                  | 説明                                      |
| ---------- | ------------------------------------- | ----------------------------------------- |
| 設計方針   | `outputs/phase-2/design-decisions.md` | 責務分離と主要設計判断                    |
| 責務分担表 | `outputs/phase-2/ownership-matrix.md` | Renderer / Preload / Main / Test の分担表 |
| 実行計画   | `outputs/phase-2/execution-plan.md`   | 実装順序と分割方針                        |

## 完了条件

- [ ] Renderer / Preload / Main / Tests / Docs の責務境界が表形式で整理されている
- [ ] Atent Team と Codex 委譲境界が定義されている
- [ ] 異常系と fallback が設計方針へ明記されている
- [ ] 保存済みキーと環境変数 fallback の表示規則が定義されている
- [ ] Phase 3 がレビュー可能な入力を持っている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. 実行タスクの実施
3. 統合テスト連携の更新
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で完了内容を実行記録へ残している

## 次のPhase

Phase 3: 設計レビューゲート
