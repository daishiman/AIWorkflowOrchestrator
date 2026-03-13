# Phase 1 実行結果: 要件定義

## メタ情報

| 項目     | 値                                                                                                                        |
| -------- | ------------------------------------------------------------------------------------------------------------------------- |
| タスクID | TASK-SKILL-LIFECYCLE-03                                                                                                   |
| 実施日   | 2026-03-11                                                                                                                |
| 担当分割 | SubAgent-A: 要件/差分棚卸し, SubAgent-B: 既存 UI/Store 調査, SubAgent-C: テスト/品質観点, SubAgent-D: 仕様同期/成果物管理 |

## 実施サマリー

- `SkillCreatorService` / `skillCreatorHandlers` / `preload skillCreatorAPI` の現行能力を棚卸しした。
- Renderer 側はすでに `agentSlice.createSkill` / `executeSkill` / `SkillAnalysisView` / `SkillCreateWizard` を持っており、`skillCreatorAPI` は未接続に近いことを確認した。
- ユーザーが見る表導線は 1 つに絞り、内部オーケストレーションは `Planner / Executor / Improver` に分離する要件で固定した。

## 現行棚卸し

| 領域            | 実体                       | 現状                                                 | Task03 で必要な扱い                                                  |
| --------------- | -------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------- |
| Main            | `SkillCreatorService.ts`   | mode 判定、改善提案、task 実行まで提供               | 直接 UI 化せず内部 planner/improver 能力として使う                   |
| IPC             | `skillCreatorHandlers.ts`  | `skill-creator:*` 12 invoke + progress を提供        | Renderer からは必要最小限の `detectMode` / `improveSkill` を使用する |
| Preload         | `skill-creator-api.ts`     | `window.electronAPI.skillCreator` を公開             | 単一導線の内部 API として再定義する                                  |
| Renderer UI     | `SkillManagementPanel.tsx` | list / create / analysis / editor の分離導線         | lifecycle を primary 導線にする                                      |
| Renderer Wizard | `SkillCreateWizard.tsx`    | 詳細設定付き作成導線                                 | 補助 UI へ縮退する                                                   |
| Store           | `agentSlice.ts`            | `createSkill`, `executeSkill`, `analyzeSkill` を保持 | create / execute / analysis は既存 store action を正本にする         |

## Task03 の必須要件

1. `skillCreatorAPI` は「表向きの主 create API」ではなく、単一導線の内部オーケストレーション API として使う。
2. `SkillManagementPanel` の primary CTA は `作成 -> 実行 -> 改善` の流れへ統合し、wizard は secondary CTA に下げる。
3. `createSkill` と `executeSkill` は既存 store action を再利用し、renderer から直接二重実装しない。
4. `improveSkill` は creator 由来の改善提案を返し、詳細適用は `SkillAnalysisView` に委譲する。
5. `SubAgent / Codex` は UI 上の新しい操作要素として露出させず、内部オーケストレーション説明にとどめる。

## Task02 依存契約

| 契約               | 内容                                                                              |
| ------------------ | --------------------------------------------------------------------------------- |
| 単一会話入口       | user request は 1 つの textarea から始める                                        |
| 既存実行導線再利用 | execute は `useExecuteSkill()` で store の権限/状態管理に乗せる                   |
| 会話の状態可視化   | session log と mode label で進捗を説明し、内部 details を直接 UI 操作へ増やさない |
| fallback           | creator API 未接続時も create / analysis 導線へフォールバックする                 |

## AC 対応

| AC   | 判定 | 根拠                                                     |
| ---- | ---- | -------------------------------------------------------- |
| AC-1 | 充足 | `skillCreatorAPI` を内部 planner/improver API と定義     |
| AC-2 | 充足 | wizard を secondary UI に縮退する方針を確定              |
| AC-3 | 充足 | request -> create -> execute -> improve の一連要件を定義 |
| AC-4 | 充足 | Planner / Executor / Improver の責務分離を要件化         |
| AC-5 | 充足 | Task02 の単一会話前提と store 再利用を契約化             |
