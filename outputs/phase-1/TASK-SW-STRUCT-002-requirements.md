# TASK-SW-STRUCT-002 要件定義書

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| タスクID   | TASK-SW-STRUCT-002                            |
| 機能名     | struct-002-connect-structure-plan-to-skill-md |
| 作成日     | 2026-04-15                                    |
| 完了確認日 | 2026-04-17                                    |

## 問題背景

`SkillCreatorService.ts:126` に以下のプレースホルダーが存在していた:

```typescript
void structurePlan; // 将来 generateSkillMd へ渡す（タスクA完了後に接続）
```

このプレースホルダーにより `runCreateWorkflow` が返す `StructurePlanJson` が SKILL.md 生成に一切使われていなかった。

## P50チェック結果（2026-04-17確認）

| 確認項目                               | 期待する確認内容                                                                                               | 状態         |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------ |
| `void structurePlan` の存在            | 削除済み（0件）                                                                                                | **確認済み** |
| `generateSkillMd` との接続             | `if (structurePlan !== null) { await this.generateSkillMd(skillDir, structurePlan, operationSignal); }` が存在 | **確認済み** |
| null フォールバック                    | `else if (mode === "create") { logger.warn(...); ensureSkillMdExists(...) }` が存在                            | **確認済み** |
| 非 create モードのフォールバック       | `else { ensureSkillMdExists(...) }` が存在                                                                     | **確認済み** |
| `generateSkillMd` プライベートメソッド | tmp ファイル経由で `generate_skill_md.js` を呼び出す実装済み                                                   | **確認済み** |

## 機能要件

| ID   | 要件                                                                           |
| ---- | ------------------------------------------------------------------------------ |
| FR-1 | `void structurePlan` が削除されていること                                      |
| FR-2 | `create` モード時に `structurePlan` の内容を `plan` に反映して SKILL.md を生成 |
| FR-3 | `create` 以外のモードは `ensureSkillMdExists` フォールバックを維持             |
| FR-4 | `structurePlan` が null の場合もフォールバック `plan` を使用                   |
| FR-5 | `collaborative` モードの既存動作を維持                                         |

## 非機能要件

| ID    | 要件                                                            |
| ----- | --------------------------------------------------------------- |
| NFR-1 | `createSkill()` は `generateSkillMd` 失敗時も例外をスローしない |
| NFR-2 | TypeScript 型チェックが 0 error                                 |
| NFR-3 | ESLint が 0 error                                               |

## 受入条件

| ID   | 条件                                                                                                       | 検証方法                                                               |
| ---- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| AC-1 | 行 126 の `void structurePlan` が削除されている                                                            | `rg -n "void structurePlan"` の結果が0件                               |
| AC-2 | `create` モード時は `structurePlan` の内容を `plan` に反映して `generate_skill_md.js` に渡す               | テスト: TC-CONNECT-1〜4, TC-08〜TC-15                                  |
| AC-3 | `create` 以外のモードは既存の固定値 `plan` でフォールバックする                                            | テスト: TC-09 (orchestrate), collaborative既存テスト                   |
| AC-4 | `structurePlan` が `null` の場合（`runCreateWorkflow` フォールバック時）もフォールバック `plan` を使用する | テスト: TC-CONNECT-2                                                   |
| AC-5 | `collaborative` モードの既存テストが全てパスし続ける                                                       | `pnpm --filter @repo/desktop exec vitest run src/main/services/skill/` |

## タスク分類

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| タスク種別 | バグ修正タスク                           |
| UIタスク   | 非UIタスク（メインプロセス内部変更のみ） |
| 可視性     | NON_VISUAL                               |
| テスト種別 | ユニットテスト（SkillCreatorService 層） |

## スコープ外

- `runCreateWorkflow` の出力仕様修正（TASK-SW-STRUCT-001 のスコープ）
- LLM 統合（実際のAI生成処理との接続）— 別タスクへ分離済み
- `generate_skill_md.js` スクリプト自体の変更（スコープ外）
