# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 11                                            |
| 機能名     | 05-TASK-FIX-SETTINGS-AUTHKEY-UI-ALIGNMENT-001 |
| タスク名   | 設定画面 authKey 導線の auth-mode 契約整合    |
| 作成日     | 2026-03-06                                    |
| ステータス | 完了                                          |

## 目的

SettingsView で auth-mode=`api-key` を選択した時に authKey 専用 UI、保存済みキー基準の状態表示、`ANTHROPIC_API_KEY` fallback を含む preflight 判定の差分説明が同じ導線で理解できる構成を設計し、実装できる仕様へ落とす。

## 背景

既存コードでは `SettingsView` が `AuthModeSelector` と汎用 `ApiKeysSection` を表示する一方、状態表示は `AuthModeService#getStatus()`、実行前判定は `window.electronAPI.authKey.exists()` を使う。`auth-key:exists` は `ANTHROPIC_API_KEY` の環境変数 fallback を含むため、保存済みキーが無いケースで UI の「未設定」表示と実行可否がずれる。

## Atent Team編成

| SubAgent                   | 関心ごと                   | 実行モード | Phase 11 の責務                                   |
| -------------------------- | -------------------------- | ---------- | ------------------------------------------------- |
| SubAgent-Renderer-Settings | Settings UI / local state  | 並列       | authKey 入力 UI の責務境界と表示条件を定義する    |
| SubAgent-Bridge-AuthKey    | Preload / Main 契約        | 並列       | auth-key API と auth-mode status の整合を確認する |
| SubAgent-Tests-Flow        | 統合テスト / manual flow   | 並列       | settings と preflight の回帰観点を設計する        |
| SubAgent-Lead-Sync         | 仕様統合 / aiworkflow 同期 | 直列統合   | 参照仕様とタスク境界を 1 つの仕様へ統合する       |

## 実行タスク

- 手動シナリオ 1: SettingsView を開く
- 手動シナリオ 2: auth-mode を `api-key` に切り替える
- 手動シナリオ 3: authKey を入力して保存し、状態表示が更新されることを確認する
- 手動シナリオ 4: 保存済みキーを削除し、`ANTHROPIC_API_KEY` のみで実行可能な場合に fallback 表示が出ることを確認する
- 手動シナリオ 5: スキル実行前チェックで authKey 未設定エラーが消えること、または fallback 表示へ置き換わることを確認する

## テストケース（TC）

- TC-11-01: `api-key` 切替時に AuthKeySection が表示され、未設定バッジ（`not-set`）が表示される
- TC-11-02: AuthKey 入力・保存後に成功メッセージが表示される
- TC-11-03: `ANTHROPIC_API_KEY` fallback 相当時に「環境変数で設定済み」バッジ（`env-fallback`）が表示される

## 画面カバレッジマトリクス

| テストケース | 画面                                | 証跡                                                             |
| ------------ | ----------------------------------- | ---------------------------------------------------------------- |
| TC-11-01     | SettingsView（api-key / 未設定）    | `outputs/phase-11/screenshots/TC-11-01-authkey-not-set.png`      |
| TC-11-02     | SettingsView（保存成功メッセージ）  | `outputs/phase-11/screenshots/TC-11-02-authkey-save-success.png` |
| TC-11-03     | SettingsView（env fallback バッジ） | `outputs/phase-11/screenshots/TC-11-03-authkey-env-fallback.png` |

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

| 資料名          | パス                | 用途                                |
| --------------- | ------------------- | ----------------------------------- |
| Phase 1 成果物  | `outputs/phase-1/`  | Phase 1 の出力を入力として参照する  |
| Phase 2 成果物  | `outputs/phase-2/`  | Phase 2 の出力を入力として参照する  |
| Phase 5 成果物  | `outputs/phase-5/`  | Phase 5 の出力を入力として参照する  |
| Phase 6 成果物  | `outputs/phase-6/`  | Phase 6 の出力を入力として参照する  |
| Phase 7 成果物  | `outputs/phase-7/`  | Phase 7 の出力を入力として参照する  |
| Phase 8 成果物  | `outputs/phase-8/`  | Phase 8 の出力を入力として参照する  |
| Phase 9 成果物  | `outputs/phase-9/`  | Phase 9 の出力を入力として参照する  |
| Phase 10 成果物 | `outputs/phase-10/` | Phase 10 の出力を入力として参照する |

## 実行手順

1. SettingsView を開く を起点にシナリオを実行する。
2. auth-mode を `api-key` に切り替える と authKey を入力して保存し、状態表示が更新されることを確認する を連続で確認する。
3. 保存済みキー削除後に `ANTHROPIC_API_KEY` だけで実行可能な環境を用意し、SettingsView が fallback 状態を誤案内しないことを確認する。
4. スキル実行前チェックで authKey 未設定エラーが消えること、または fallback 表示へ置き換わることを確認する。
5. 証跡 ID、スクリーンショット、ログ断面を evidence-plan に記録する。

## 統合テスト連携

- SettingsView を開く
- auth-mode を `api-key` に切り替える
- authKey を入力して保存し、状態表示が更新されることを確認する
- 保存済みキー削除後に環境変数 fallback 表示が出ることを確認する
- スキル実行前チェックで authKey 未設定エラーが消えること、または fallback 表示へ置き換わることを確認する

## 多角的チェック観点

| 観点         | 確認内容                                                                 |
| ------------ | ------------------------------------------------------------------------ |
| 責務分離     | generic provider API key 設定と authKey 設定が同じ UI に混在していないか |
| 契約整合     | auth-mode / authKey / preflight の戻り値が同じ意味で表示されるか         |
| UX           | 入力欄、保存結果、削除結果が mode 切替と衝突しないか                     |
| セキュリティ | authKey を Renderer 側 state に長時間保持しない設計になっているか        |

## 成果物

| 成果物         | パス                                     | 説明                     |
| -------------- | ---------------------------------------- | ------------------------ |
| 手動テスト行列 | `outputs/phase-11/manual-test-matrix.md` | 画面操作と期待結果の一覧 |
| 証跡計画       | `outputs/phase-11/evidence-plan.md`      | 取得する証跡の定義       |

## 完了条件

- [x] manual シナリオが Settings shell または対象導線を通る手順で記述されている
- [x] 証跡 ID と期待結果が 1 対 1 で対応している
- [x] 再現した不具合と修正確認を同じ行列で比較できる
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. 実行タスクの実施
3. 統合テスト連携の更新
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクの成果物が生成されている
- [x] artifacts.json が更新されている
- [x] Phase 末端で完了内容を実行記録へ残している

## 次のPhase

Phase 12: ドキュメント更新
