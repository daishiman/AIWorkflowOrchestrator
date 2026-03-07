# Phase 7: テストカバレッジ確認

## メタ情報

| 項目       | 内容                                                               |
| ---------- | ------------------------------------------------------------------ |
| Phase      | 7                                                                  |
| 機能名     | 09-TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001            |
| タスク名   | settings 画面 preload/sandbox iterable 契約ガードと AuthGuard 復旧 |
| 作成日     | 2026-03-06                                                         |
| ステータス | 未実施                                                             |

## 目的

apiKey.list 契約が壊れた場合でも SettingsView が継続表示されるように、Renderer / Preload / Main の response shape と fallback を設計し、実装できる仕様へ落とす。

## 背景

task-04 では preload payload だけを防御したが、SettingsView 固有の `AuthGuard初期化境界` 側には response 正規化が入っていない。`preload expose API` の shape が崩れるだけで renderer 側が落ちる経路が残っている。

## Atent Team編成

| SubAgent                | 関心ごと                         | 実行モード | Phase 7 の責務                                   |
| ----------------------- | -------------------------------- | ---------- | ------------------------------------------------ |
| SubAgent-Renderer-Guard | Renderer defensive normalization | 並列       | preload payload shape の正規化ポイントを設計する |
| SubAgent-Contract-IPC   | Main / Preload / Shared contract | 並列       | response envelope と shared type を確認する      |
| SubAgent-Test-Fallback  | 異常系テスト / fallback UX       | 並列       | preload 初期化失敗 ケースと文言を設計する        |
| SubAgent-Lead-Sync      | 仕様統合 / aiworkflow 同期       | 直列統合   | task-04 の調査結果と本タスク境界を統合する       |

## 実行タスク

- coverage 観点整理: 変更ファイル、境界条件、異常系の観点を表で管理する
- gap 分析: 未計測ケースと未固定ケースを分けて記録する
- 回帰優先順位付け: release 前に残せないギャップを識別する

## 参照資料

### 実装・証跡

| 資料名              | パス                                                                                                                               | 用途                                            |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Renderer Component  | `apps/desktop/src/preload/index.ts`                                                                                                | preload payload 正規化の主対象                  |
| Renderer Tests      | `apps/desktop/src/renderer/components/AuthGuard/AuthGuard.test.tsx`                                                                | shape 異常系の固定先                            |
| Main IPC            | `apps/desktop/src/main/index.ts`                                                                                                   | preload起動契約の確認先                         |
| Main IPC            | `apps/desktop/src/main/index.ts と apps/desktop/src/preload/index.ts`                                                              | sandbox起動時の契約防御との整合確認             |
| Shared Types        | `apps/desktop/src/preload/types.ts`                                                                                                | transport 型の確認先                            |
| Validator           | `apps/desktop/src/preload/channels.ts`                                                                                             | validation の責務境界確認                       |
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
| architecture-overview      | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`         | Renderer/Main/Preload 境界責務を確認する          |
| arch-electron-services     | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`        | Electron 起動/初期化層の責務を確認する            |
| security-api-electron      | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`         | contextBridge 公開方針の安全要件を確認する        |
| quick-reference            | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                  | IPC / Store / Electron の既存パターンを再確認する |
| task-workflow              | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                 | Phase 12 の完了記録先を確認する                   |
| quality-requirements       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`          | TDD と coverage 条件を揃える                      |
| lessons-learned            | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`               | 既知の再発パターンを再確認する                    |
| api-ipc-system             | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                | システム IPC の response パターンを確認する       |
| interfaces-auth            | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`               | AuthGuard と preload API 契約の境界を確認する     |
| ipc-contract-checklist     | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`        | shape drift を検査する項目を固定する              |
| security-electron-ipc      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`         | Preload 経由で不正 shape を通さない前提を確認する |
| ui-ux-settings             | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                | 設定画面の異常時表示方針を確認する                |
| ui-ux-components           | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`              | セクション責務とエラー表示の配置を確認する        |
| ui-ux-design-system        | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`           | 異常状態ラベル/色トークンの一貫性を確認する       |
| ui-ux-design-principles    | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`       | 異常系導線の可読性と説明順序を確認する            |
| testing-accessibility      | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`         | fallback 表示のa11y検証観点を確認する             |
| testing-component-patterns | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`    | preload 初期化失敗 の component test を組む       |
| development-guidelines     | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`        | 正規化 helper の配置規則を確認する                |
| error-handling             | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                | preload 初期化失敗 時の復旧方針を確認する         |
| security-input-validation  | `.claude/skills/aiworkflow-requirements/references/security-input-validation.md`     | 受信データの型検証境界を確認する                  |
| ipc-type-resolution-guide  | `.claude/skills/aiworkflow-requirements/references/ipc-type-resolution-guide.md`     | payload shape drift の診断手順を確認する          |
| known-pitfalls             | `.claude/rules/06-known-pitfalls.md`                                                 | iterable / shape drift 再発防止を確認する         |
| api-ipc-auth               | `.claude/skills/aiworkflow-requirements/references/api-ipc-auth.md`                  | 認証系 IPC ハンドラとレスポンス整合を確認する     |

### 前提Phase成果物

| 資料名         | パス               | 用途                               |
| -------------- | ------------------ | ---------------------------------- |
| Phase 5 成果物 | `outputs/phase-5/` | Phase 5 の出力を入力として参照する |
| Phase 6 成果物 | `outputs/phase-6/` | Phase 6 の出力を入力として参照する |

## 実行手順

1. 変更ファイル、AC、manual flow を coverage 観点へ変換する。
2. 未計測ケースを gap-log に書き、埋める順序を固定する。
3. Phase 8 へ持ち込む refactor 対象と coverage 対象を分ける。

## 統合テスト連携

- `window.electronAPI.window.electronAPI 公開契約（contextBridge.exposeInMainWorld）` の戻り値 shape と UI fallback を同じ fixture で確認する
- `apps/desktop/src/main/index.ts` と `apps/desktop/src/preload/index.ts` の契約整合側の preload payload 正規化と `AuthGuard初期化境界` の preload payload 正規化を別責務として確認する
- SettingsView mount 時に preload 初期化失敗 が来ても view 全体が継続表示されることを確認する

## 多角的チェック観点

| 観点     | 確認内容                                                             |
| -------- | -------------------------------------------------------------------- |
| 防御境界 | normalize が 1 箇所に集まり、各 render branch が配列前提を持たないか |
| 契約監査 | shared type と actual runtime shape の差分が記録されているか         |
| UX       | fallback 表示が silent failure ではなく原因追跡可能か                |
| 回帰耐性 | task-04 で守った preload payload と責務が重複していないか            |

## 成果物

| 成果物        | パス                                  | 説明                   |
| ------------- | ------------------------------------- | ---------------------- |
| coverage 目標 | `outputs/phase-7/coverage-targets.md` | 監視する coverage 観点 |
| gap log       | `outputs/phase-7/gap-log.md`          | 不足箇所と補完方針     |

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

Phase 8: リファクタリング
