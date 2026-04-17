# Phase 12: 未タスク検出

## 検出基準

本実装のスコープ外で、対応することで大きな問題が生じる恐れのある課題のみ未タスクとして挙げる。

## 未タスク一覧

### ~~UT-SW-CANCEL-CLEANUP-001: キャンセル後の不完全スキルディレクトリ削除~~

| 項目   | 内容                                                                                                                  |
| ------ | --------------------------------------------------------------------------------------------------------------------- |
| 概要   | `cancelCurrentOperation()` 実行後、`createSkill` が途中で返った場合にスキルディレクトリが半作成状態になる可能性がある |
| 影響   | 低 — キャンセルは明示的なユーザー操作で、半作成ディレクトリの害は軽微                                                 |
| 優先度 | Medium                                                                                                                |
| 状態   | 実装済み（`SkillCreatorService` のキャンセル時クリーンアップで解消）                                                  |

### UT-SW-STRUCT-LLM-001: `structurePlan.purpose` の LLM 推論実装

| 項目     | 内容                                                                                                |
| -------- | --------------------------------------------------------------------------------------------------- |
| 概要     | 現状は `options.description` を `purpose` に使用。実際の意味抽出には LLM 呼び出しが必要             |
| 影響     | 低 — create モードの SKILL.md 品質が向上する将来改善                                                |
| 優先度   | Low                                                                                                 |
| 推奨対応 | `runCreateWorkflow` 内で `extractPurposeAgent` を使って LLM を呼び出し、応答を `purpose` に設定する |

### ~~UT-SW-CANCEL-SIGNAL-001~~: `AbortSignal` の `createSkill` 内部伝播

| 項目     | 内容                                                                                                        |
| -------- | ----------------------------------------------------------------------------------------------------------- |
| 概要     | `currentAbortController.signal` を `createSkill` 内の各処理に渡すことで、より細粒度のキャンセルが可能になる |
| 影響     | 低 — 現状はポーリング的なアプローチで十分機能する                                                           |
| 優先度   | Low                                                                                                         |
| 推奨対応 | `runCreateWorkflow`、`scriptExecutor.execute` への signal 伝播を検討                                        |

## スコープ内で完結した項目（未タスク化不要）

- `unregisterSkillCreatorHandlers` への `SKILL_CREATOR_CANCEL` 解除追加 → 実施済み
- `ALLOWED_INVOKE_CHANNELS` への `SKILL_CREATOR_CANCEL` 追加 → 実施済み
- `SkillCreateWizard.tsx` の `handleCancelGeneration` async 対応 → 実施済み
- `AbortSignal` の `createSkill` 内部伝播 → `ScriptExecutor` / `ResourceLoader` まで実装済み
- `SkillService.cancelCurrentSkillCreation()` による `skill:create` キャンセル連携 → 実施済み
- `cancelCurrentOperation()` 後の半作成スキルディレクトリ削除 → `SkillCreatorService` 内で実装済み
