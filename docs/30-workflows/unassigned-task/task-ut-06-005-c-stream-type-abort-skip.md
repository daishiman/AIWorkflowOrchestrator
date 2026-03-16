# UT-06-005-C: SkillStreamMessageType abort/skip 型追加

## メタ情報

| 項目     | 内容                                  |
| -------- | ------------------------------------- |
| タスクID | UT-06-005-C                           |
| 優先度   | 中                                    |
| 検出元   | UT-06-005 Phase 12 レビュー（GAP-06） |
| 関連     | UT-06-005, UT-06-005-A                |
| 作成日   | 2026-03-16                            |

## 概要

現在 abort は `type:"error"`、skip は `type:"tool_use"` で送信されており、Renderer 側で一般エラーと abort を区別できない。`SkillStreamMessageType` に `"abort"` / `"skip"` を追加し、Renderer 側で専用 UI フィードバックを実装する。

なお GAP-01（shared 型と SkillExecutor ローカル型の `sendStream` 型不整合）もこのタスクで同時解消する。

## 目的

- ユーザーが abort/skip を視覚的に識別できるようにする（一般エラーとの混同を防ぐ）
- Renderer 側の UI でのフィードバックを改善し、操作の結果が明確に伝わるようにする

## 要件

1. `SkillStreamMessageType` に `"abort"` | `"skip"` を追加する
2. `executeAbortFlow` / `executeSkipFlow` の `sendStream` 呼び出しを新しい型に更新する
3. Renderer 側 SkillStreamDisplay で abort/skip 専用表示を実装する（例: abort は赤のバナー、skip は黄色のバナー）
4. shared 型と SkillExecutor ローカル型の `sendStream` 型不整合を解消する（GAP-01 対応）
5. 既存テストが全 PASS であること

## 対象ファイル

- `packages/shared/src/types/skill.ts`（SkillStreamMessageType 定義）
- `apps/desktop/src/main/services/skill/SkillExecutor.ts`（sendStream 呼び出し箇所）
- `apps/desktop/src/renderer/`（SkillStreamDisplay または該当コンポーネント）

## 依存タスク

- UT-06-005（完了済み: executeAbortFlow/executeSkipFlow 実装）
- UT-06-005-A（PreToolUse Hook 統合: 実行時フロー接続後に型を更新するのが望ましい）

## 完了条件

- [ ] `SkillStreamMessageType` に `"abort"` | `"skip"` が追加されていること
- [ ] `executeAbortFlow` が `type:"abort"` でストリームメッセージを送信すること
- [ ] `executeSkipFlow` が `type:"skip"` でストリームメッセージを送信すること
- [ ] Renderer 側で abort/skip を識別した専用表示が実装されていること
- [ ] shared 型と SkillExecutor ローカル型の型不整合が解消されていること（GAP-01）
- [ ] 既存テストが全 PASS であること

## 参照資料

- `docs/30-workflows/UT-06-005-abort-skip-retry-fallback/` （本タスクの完了成果物）
- `packages/shared/src/types/skill.ts`
- `apps/desktop/src/main/services/skill/SkillExecutor.ts`
