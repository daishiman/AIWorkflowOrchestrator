# 未タスク指示書: UT-RT-06-SKILL-STREAM-IPC-INTERNAL-TYPE-ALIGNMENT-001

| 項目         | 値                                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------------------ |
| タスクID     | UT-RT-06-SKILL-STREAM-IPC-INTERNAL-TYPE-ALIGNMENT-001                                                  |
| 由来         | UT-RT-06-SKILL-STREAM-SKCE-TYPE-UNIFICATION-001 実装時の型構造分析                                     |
| ステータス   | 未着手                                                                                                 |
| 優先度       | low                                                                                                    |
| 作成日       | 2026-04-04                                                                                             |
| 関連タスク   | UT-RT-06-SKILL-STREAM-SKCE-TYPE-UNIFICATION-001, UT-RT-06-SKILLEXECUTOR-DEPRECATED-ALIAS-MIGRATION-001 |
| issue_number | 1921                                                                                                   |

---

## 目的

`SkillStreamMessage`（`skill.ts` IPC 契約型）と `SkillExecutorStreamMessage`（`skillCreator.ts` 内部処理型）の関係を明確化し、変換パスを型安全に整理する。

---

## 背景

UT-RT-06 の型統合により、2つの `SkillStreamMessage` 系列が packages/shared に共存する状態が生まれた:

1. **`SkillStreamMessage`（skill.ts §5.1）** — IPC 契約用 discriminated union。type フィールドで `assistant` / `tool_use` / `tool_result` / `status` / `error` に分岐し、各バリアントに型付きの content object（`AssistantMessageContent`, `ToolUseMessageContent` 等）を持つ。
2. **`SkillExecutorStreamMessage`（skillCreator.ts）** — 内部処理用フラット構造。type は `text` / `tool_use` / `error` / `complete` / `retry`、content は string。

SkillExecutor は SDK メッセージを `SkillExecutorStreamMessage` に変換した後、最終的に IPC 経由で renderer に送信する際に `SkillStreamMessage`（IPC 契約型）に変換される。この変換パスが暗黙的であり、型の対応関係がドキュメント化されていない。

---

## スコープ

### 含むもの

- `SkillExecutorStreamMessage` → `SkillStreamMessage` の変換ロジックの明示化・型安全化
- 変換関数の JSDoc またはインラインコメントでの型対応表の記述
- 必要に応じて変換ユーティリティの抽出

### 含まないもの

- 2つの型体系の完全統合（IPC 契約と内部処理は用途が異なるため分離を維持）
- skill.ts の SkillStreamMessage discriminated union の変更
- renderer 側のコンポーネント変更

---

## 苦戦箇所（UT-RT-06 実装時の知見）

- skill.ts の `SkillStreamMessageType` と skillCreator.ts の `SkillExecutorStreamMessageType` は値集合が異なる（前者: assistant/tool_use/tool_result/status/error、後者: text/tool_use/error/complete/retry）。型名の類似性に惑わされず、変換時のマッピング表を先に作ること。
- `SdkOutputMessageBase.timestamp` は optional だが、`SkillExecutorStreamMessage.timestamp` は required、`BaseStreamMessage.timestamp` も required。変換時の null check は不要だが、型定義上の整合性を意識すること。

---

## 前提条件

- UT-RT-06-SKILLEXECUTOR-DEPRECATED-ALIAS-MIGRATION-001 が完了していること（推奨だが必須ではない）

---

## 対象ファイル（想定）

| ファイル                                                | 役割                                         | 変更種別 |
| ------------------------------------------------------- | -------------------------------------------- | -------- |
| `apps/desktop/src/main/services/skill/SkillExecutor.ts` | `convertToStreamMessage()` の変換ロジック    | 修正     |
| `packages/shared/src/types/skill.ts`                    | IPC 契約型 `SkillStreamMessage` 定義         | 参照     |
| `packages/shared/src/types/skillCreator.ts`             | 内部処理型 `SkillExecutorStreamMessage` 定義 | 修正     |

---

## 完了条件

- [ ] `SkillExecutorStreamMessage` → `SkillStreamMessage` の変換パスが明示的に型安全化されていること
- [ ] 変換ロジックに JSDoc 型対応表が記述されていること
- [ ] `pnpm typecheck` が PASS すること
- [ ] 既存テストが全件 PASS すること
