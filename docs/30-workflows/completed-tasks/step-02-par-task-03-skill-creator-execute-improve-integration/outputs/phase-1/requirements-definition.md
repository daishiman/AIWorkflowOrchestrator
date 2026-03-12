# Phase 1 要件定義

## 1. 目的

TASK-SKILL-LIFECYCLE-03 の目的は、`Skill Creator` の作成・実行・改善導線を、ユーザーには単一セッションとして見せつつ、内部では `skillCreatorAPI` / `SkillService` / 改善系 API を責務分離したまま再統合することである。

## 2. 現行棚卸し

| 領域             | 実体                                                               | 現状                                                                     | Task03 での評価                                              |
| ---------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------ |
| 作成             | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` | `useCreateSkill()` から legacy `skill:create` を呼ぶ                     | 名前生成・再スキャン込みで安定。表導線の補助 UI として残せる |
| 作成エンジン     | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`      | `detectMode/createSkill/executeTasks/validateSkill/improveSkill` を持つ  | 表 API ではなく内部生成エンジンとして扱うのが妥当            |
| IPC              | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                | `skill-creator:*` 12 invoke + progress を提供                            | mode 判定・検証・高度処理の内部境界として利用可能            |
| preload          | `apps/desktop/src/preload/skill-creator-api.ts`                    | `window.electronAPI.skillCreator` として公開済み                         | UI 直結ではなく unified facade 配下で吸収すべき              |
| 改善             | `SkillAnalysisView` + `useSkillAnalysis()`                         | `skill:analyze` / `skill:applyImprovements` / `skill:autoImprove` を利用 | 安定しており、Task03 の improve surface に再利用可能         |
| 実行             | `agentSlice.executeSkill()`                                        | `selectedSkillName` 前提で `skill:execute` を呼ぶ                        | create 完了後の handoff/実行に再利用可能                     |
| 表導線           | `SkillManagementPanel`                                             | list/editor/analysis/create の4ビュー切替                                | 単一セッション導線を載せる主候補                             |
| supporting route | `ChatPanel`                                                        | `SkillManagementPanel` をトグル表示                                      | Task02 の共通会話基盤へ近い supporting surface               |

## 3. 現行問題

| 問題                                                                      | 根拠                                                         | 影響                                                          |
| ------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------- |
| 作成導線が wizard 前提で、実行・改善への連結が弱い                        | `SkillManagementPanel` は create / analysis を別ビューで分離 | 「作った後どうするか」が別画面知識に依存する                  |
| `skillCreatorAPI` が Renderer 主導線に出ていない                          | `window.electronAPI.skillCreator` は露出済みだが UI 未使用   | mode 判定・検証など Task03 で必要な内部契約が活かされていない |
| create と improve はあるが execute が会話セッションとして接続されていない | `useCreateSkill()` と `useSkillAnalysis()` は独立            | `作成 -> 実行 -> 改善` を 1 セッションで辿れない              |
| 内部委譲モデルが UI 仕様に未定義                                          | Task spec では `Planner/Executor/Improver` を想定            | 将来 `SubAgent/Codex` を足す時に UI 漏れしやすい              |

## 4. 機能要件

### FR-1 単一セッション導線

- ユーザーは 1 つの面で「作りたい内容」を自然言語で入力できる
- 作成完了後、同じ面で実行プロンプトを入力して確認できる
- 実行後、同じ面で改善案取得または改善ビューへ遷移できる

### FR-2 `skillCreatorAPI` の位置づけ

- `skillCreatorAPI` は表導線の唯一の API とせず、内部モード判定・検証・高度処理のエンジンとする
- 作成主導線は既存 `skill:create` facade を維持し、名前生成・再スキャン責務を再利用する
- UI は `skillCreatorAPI` の mode 判定/検証結果を補助情報として使い、内部実装名を前面に出さない

### FR-3 wizard の縮退

- `SkillCreateWizard` は詳細設定・例外時の補助 UI とする
- 主導線は `SkillManagementPanel` 上の session card に寄せる
- wizard は削除せず、詳細設定を開く secondary action として残す

### FR-4 実行と改善の handoff

- 作成完了時に生成スキル名を `selectSkillByName()` に接続する
- `executeSkill()` を同一セッションから呼べるようにする
- `analyzeSkill()` / `autoImproveSkill()` を同一セッションから呼べるようにする

### FR-5 Task02 契約

- Task02 の `skill-lifecycle` mode と整合するよう、表導線は「単一セッション」「mode 差分は内部吸収」を守る
- `Skill Center -> Skill Creator -> Agent/Workspace -> Skill Analysis` の handoff を壊さない

## 5. 非機能要件

| ID    | 要件                                                                   |
| ----- | ---------------------------------------------------------------------- |
| NFR-1 | Renderer から Main への直接新規境界は増やさず、既存 IPC を再利用する   |
| NFR-2 | `SubAgent` / `Codex` / `Atent Team` は UI の主ラベルに出さない         |
| NFR-3 | 失敗時は create / execute / improve いずれの段でも次アクションが分かる |
| NFR-4 | 既存 `SkillManagementPanel` テストを壊さず、追加テストで遷移保証する   |

## 6. 要件結論

Task03 は「新規 API を増やす task」ではなく、「既存作成・実行・改善 API を session-oriented UI に束ね直す task」と定義する。`skillCreatorAPI` は内部エンジン、`SkillManagementPanel` は表導線、wizard は補助 UI である。
