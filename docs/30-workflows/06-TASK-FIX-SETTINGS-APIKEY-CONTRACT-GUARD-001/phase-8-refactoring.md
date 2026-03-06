# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 8                                                |
| 機能名     | 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001   |
| タスク名   | 設定画面 apiKey.list 契約防御と providers 正規化 |
| 作成日     | 2026-03-06                                       |
| ステータス | 未実施                                           |

## 目的

apiKey.list 契約が壊れた場合でも SettingsView が継続表示されるように、Renderer / Preload / Main の response shape と fallback を設計し、実装できる仕様へ落とす。

## 背景

task-04 では linkedProviders だけを防御したが、SettingsView 固有の `ApiKeysSection` 側には response 正規化が入っていない。`result.data.providers` の shape が崩れるだけで renderer 側が落ちる経路が残っている。

## Atent Team編成

| SubAgent                | 関心ごと                         | 実行モード | Phase 8 の責務                              |
| ----------------------- | -------------------------------- | ---------- | ------------------------------------------- |
| SubAgent-Renderer-Guard | Renderer defensive normalization | 並列       | providers shape の正規化ポイントを設計する  |
| SubAgent-Contract-IPC   | Main / Preload / Shared contract | 並列       | response envelope と shared type を確認する |
| SubAgent-Test-Fallback  | 異常系テスト / fallback UX       | 並列       | malformed response ケースと文言を設計する   |
| SubAgent-Lead-Sync      | 仕様統合 / aiworkflow 同期       | 直列統合   | task-04 の調査結果と本タスク境界を統合する  |

## 実行タスク

- 重複除去: 実装後に残った helper 重複を削る
- 責務再確認: Renderer / Preload / Main / Tests の境界が設計どおりか確認する
- 可読性維持: テスト名、fixture 名、エラー名を設計用語へ揃える

## 参照資料

### 実装・証跡

| 資料名              | パス                                                                                                                               | 用途                                            |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Renderer Component  | `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx`                                                          | providers 正規化の主対象                        |
| Renderer Tests      | `apps/desktop/src/renderer/components/organisms/ApiKeysSection/__tests__/ApiKeysSection.test.tsx`                                  | shape 異常系の固定先                            |
| Main IPC            | `apps/desktop/src/main/ipc/apiKeyHandlers.ts`                                                                                      | list / validate 契約の確認先                    |
| Main IPC            | `apps/desktop/src/main/ipc/profileHandlers.ts`                                                                                     | profile linked providers 側の防御との整合確認   |
| Shared Types        | `packages/shared/types/api-keys.ts`                                                                                                | transport 型の確認先                            |
| Validator           | `packages/shared/infrastructure/ai/apiKeyValidator.ts`                                                                             | validation の責務境界確認                       |
| investigation index | `docs/30-workflows/completed-tasks/04-TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001/index.md`                               | settings 側の残存リスクを確認する               |
| task-04 manual      | `docs/30-workflows/completed-tasks/04-TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001/outputs/phase-11/manual-test-result.md` | SettingsView 自体が未検証だった事実を確認する   |
| task-03 manual      | `docs/30-workflows/completed-tasks/03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001/outputs/phase-11/manual-test-result.md`            | 専用 harness と settings shell の差分を確認する |

### システム仕様（aiworkflow-requirements / task-specification-creator）

| 資料名                     | パス                                                                                 | 用途                                              |
| -------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------- |
| task-spec workflow         | `.claude/skills/task-specification-creator/references/create-workflow.md`            | create モードの直列/並列ルールを確認する          |
| phase templates            | `.claude/skills/task-specification-creator/references/phase-templates.md`            | Phase 文書の構造を揃える                          |
| unassigned task guidelines | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md` | Phase 12 の残課題検出ルールを揃える               |
| resource-map               | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                     | 読むべきシステム正本を固定する                    |
| quick-reference            | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                  | IPC / Store / Electron の既存パターンを再確認する |
| task-workflow              | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                 | Phase 12 の完了記録先を確認する                   |
| quality-requirements       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`          | TDD と coverage 条件を揃える                      |
| lessons-learned            | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`               | 既知の再発パターンを再確認する                    |
| api-ipc-system             | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                | システム IPC の response パターンを確認する       |
| api-ipc-auth               | `.claude/skills/aiworkflow-requirements/references/api-ipc-auth.md`                  | 認証系 IPC と API key 契約の境界を確認する        |
| ipc-contract-checklist     | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`        | shape drift を検査する項目を固定する              |
| security-electron-ipc      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`         | Preload 経由で不正 shape を通さない前提を確認する |
| ui-ux-settings             | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                | 設定画面の異常時表示方針を確認する                |
| ui-ux-components           | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`              | セクション責務とエラー表示の配置を確認する        |
| ui-ux-design-system        | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`           | 異常状態ラベル/色トークンの一貫性を確認する       |
| ui-ux-design-principles    | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`       | 異常系導線の可読性と説明順序を確認する            |
| testing-accessibility      | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`         | fallback表示のa11y検証観点を確認する              |
| testing-component-patterns | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`    | malformed response の component test を組む       |
| development-guidelines     | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`        | 正規化 helper の配置規則を確認する                |
| error-handling             | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                | malformed response 時の復旧方針を確認する         |
| security-input-validation  | `.claude/skills/aiworkflow-requirements/references/security-input-validation.md`     | 受信データの型検証境界を確認する                  |
| ipc-type-resolution-guide  | `.claude/skills/aiworkflow-requirements/references/ipc-type-resolution-guide.md`     | payload shape drift の診断手順を確認する          |
| known-pitfalls             | `.claude/rules/06-known-pitfalls.md`                                                 | iterable / shape drift 再発防止を確認する         |
| interfaces-auth            | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`               | 共通 IPCResponse envelope の扱いを確認する        |

### 前提Phase成果物

| 資料名         | パス               | 用途                               |
| -------------- | ------------------ | ---------------------------------- |
| Phase 1 成果物 | `outputs/phase-1/` | Phase 1 の出力を入力として参照する |
| Phase 2 成果物 | `outputs/phase-2/` | Phase 2 の出力を入力として参照する |
| Phase 5 成果物 | `outputs/phase-5/` | Phase 5 の出力を入力として参照する |
| Phase 6 成果物 | `outputs/phase-6/` | Phase 6 の出力を入力として参照する |
| Phase 7 成果物 | `outputs/phase-7/` | Phase 7 の出力を入力として参照する |

## 実行手順

1. Phase 5-7 の成果物から重複 helper と冗長 mock を洗い出す。
2. 振る舞いを変えずに責務を簡素化する案だけを採用する。
3. simplification-log に削除理由と残した制約を書く。

## 統合テスト連携

- Phase 1-12 の成果物が 1 つの受け入れ基準集合に戻ることを確認する。
- 05 / 06 / 07 / 08 の依存関係と review handoff を齟齬なく引き継ぐ。

## 多角的チェック観点

| 観点     | 確認内容                                                             |
| -------- | -------------------------------------------------------------------- |
| 防御境界 | normalize が 1 箇所に集まり、各 render branch が配列前提を持たないか |
| 契約監査 | shared type と actual runtime shape の差分が記録されているか         |
| UX       | fallback 表示が silent failure ではなく原因追跡可能か                |
| 回帰耐性 | task-04 で守った linkedProviders と責務が重複していないか            |

## 成果物

| 成果物          | パス                                     | 説明                     |
| --------------- | ---------------------------------------- | ------------------------ |
| refactor ガード | `outputs/phase-8/refactor-guardrails.md` | 振る舞い維持の条件       |
| 簡素化ログ      | `outputs/phase-8/simplification-log.md`  | 削減した重複と残した制約 |

## 完了条件

- [ ] 前Phaseの成果物を参照した追加作業が定義されている
- [ ] gap または risk が文書化されている
- [ ] 次Phaseへ渡す判断材料が成果物に残っている
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

Phase 9: 品質保証
