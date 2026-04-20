# Phase 2: 設計

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase      | 2                                  |
| タスクID   | TASK-SW-CANCEL-004                 |
| 機能名     | skill-creator-cancel-renderer-hook |
| 前提Phase  | Phase 1                            |
| 後続Phase  | Phase 3                            |
| 作成日     | 2026-04-20                         |
| ステータス | completed                          |

## 目的

既存実装をどう検証し、どの条件でのみ補正を許可するかを定義する。hook 内部では `await + try/catch` を current contract として固定し、呼び出し側は local abort と stage 更新を優先した fire-and-forget 呼び出しでも整合することを明記する。

## 実行タスク

### タスク1: current contract 固定

- `cancelGeneration()` は `Promise<void>`
- 実装順序は `abort -> ref clear -> setStage("cancelled") -> IPC await`
- IPC 失敗は `catch` で握りつぶし、UI へ伝播させない

### タスク2: 4層確認設計

| 層       | 対象                                                | 確認方法                |
| -------- | --------------------------------------------------- | ----------------------- |
| shared   | `packages/shared/src/ipc/channels.ts`               | cancel channel 定数確認 |
| preload  | `preload/channels.ts`, `skill-creator-api.ts`       | whitelist / API surface |
| main     | `skillCreatorHandlers.ts`, `SkillCreatorService.ts` | handler / service       |
| renderer | `useCancelGeneration.ts`                            | hook 実装順序確認       |

### タスク3: Phase 4-12 の責務固定

- Phase 4: 既存テスト棚卸し
- Phase 5: diff check
- Phase 6: 不足ケースがある場合のみ targeted 追加
- Phase 11: NON_VISUAL 証跡3点セット
- Phase 12: 6成果物 + Step 1-A〜1-C / Step 2 / parity

## 参照資料

| 資料        | パス                                                                    | 用途          |
| ----------- | ----------------------------------------------------------------------- | ------------- |
| 対象実装    | `apps/desktop/src/renderer/hooks/useCancelGeneration.ts`                | contract 固定 |
| hook テスト | `apps/desktop/src/renderer/hooks/__tests__/useCancelGeneration.test.ts` | テスト戦略    |
| 共有 IPC    | `packages/shared/src/ipc/channels.ts`                                   | 4層確認       |
| preload API | `apps/desktop/src/preload/skill-creator-api.ts`                         | 4層確認       |

## 統合テスト連携

| 判定項目              | 基準 | 結果      |
| --------------------- | ---- | --------- |
| current contract 固定 | 完了 | completed |
| 4層確認設計完了       | 完了 | completed |
| Phase 4-12 の責務整合 | 完了 | completed |

## 成果物

| 成果物     | パス                                     | 説明                    |
| ---------- | ---------------------------------------- | ----------------------- |
| 検証設計書 | `outputs/phase-2/verification-design.md` | contract・4層・証跡戦略 |

## 完了条件

- [ ] current contract を固定した
- [ ] 4層確認方法を定義した
- [ ] `await + try/catch` 前提を統一した
- [ ] 本 Phase 内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 3: 設計レビュー
