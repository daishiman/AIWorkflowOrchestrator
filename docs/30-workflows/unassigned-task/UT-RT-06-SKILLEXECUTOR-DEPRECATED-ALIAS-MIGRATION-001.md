# 未タスク指示書: UT-RT-06-SKILLEXECUTOR-DEPRECATED-ALIAS-MIGRATION-001

| 項目         | 値                                                               |
| ------------ | ---------------------------------------------------------------- |
| タスクID     | UT-RT-06-SKILLEXECUTOR-DEPRECATED-ALIAS-MIGRATION-001            |
| 由来         | UT-RT-06-SKILL-STREAM-SKCE-TYPE-UNIFICATION-001 実装による残作業 |
| ステータス   | 未着手                                                           |
| 優先度       | low                                                              |
| 作成日       | 2026-04-04                                                       |
| 関連タスク   | UT-RT-06-SKILL-STREAM-SKCE-TYPE-UNIFICATION-001                  |
| issue_number | 1920                                                             |

---

## 目的

`SkillExecutor.ts` に残存する `@deprecated` 型エイリアス（`SkillStreamMessage` / `SkillStreamMessageType`）を削除し、main process 内の全 consumer を `@repo/shared` の `SkillExecutorStreamMessage` / `SkillExecutorStreamMessageType` に直接移行する。

---

## 背景

UT-RT-06-SKILL-STREAM-SKCE-TYPE-UNIFICATION-001 にて、`SkillExecutor.ts` のローカル型定義を `packages/shared/src/types/skillCreator.ts` に集約し、`SdkOutputMessageBase` 共通基底型を導入した。
移行中の互換性維持のため `SkillExecutor.ts` に `@deprecated` 型エイリアスを残置したが、これらは将来的に削除が必要。

注意: `packages/shared/src/types/skill.ts` にも同名の `SkillStreamMessage` が存在するが、これは IPC 契約用の discriminated union 型であり、`SkillExecutor.ts` のローカル型とは完全に別物。型名の衝突を解消する意味でもこのマイグレーションは重要。

---

## スコープ

### 含むもの

- `SkillExecutor.ts` の `@deprecated` 型エイリアス2件の削除
- main process 内で `SkillExecutor.ts` のローカル型を参照している箇所の `@repo/shared` import への置換
- テストファイルの import パス更新
- 型チェック・lint の回帰確認

### 含まないもの

- `packages/shared/src/types/skill.ts` の `SkillStreamMessage`（IPC 契約型）の変更
- renderer 側の型参照変更（renderer は skill.ts を参照しているため影響なし）
- SkillExecutor の実行フロー変更

---

## 苦戦箇所（UT-RT-06実装時の知見）

- `SkillStreamMessage` という名前が skill.ts（IPC契約型）と SkillExecutor.ts（旧ローカル型）で重複しているため、grep 時に両方がヒットして混乱しやすい。検索時は `SkillExecutorStreamMessage` と `skill.ts:SkillStreamMessage` を明確に区別すること。
- `@repo/shared` の barrel export（index.ts）に新型が正しく追加済みか確認必須。

---

## 対象ファイル（想定）

| ファイル                                                          | 役割                         | 変更種別                                  |
| ----------------------------------------------------------------- | ---------------------------- | ----------------------------------------- |
| `apps/desktop/src/main/services/skill/SkillExecutor.ts`           | @deprecated エイリアス定義元 | 修正（エイリアス削除）                    |
| main process 内で `SkillExecutor.ts` から型を import している箇所 | consumer                     | 修正（import 先を `@repo/shared` に変更） |
| 関連テストファイル                                                | テスト                       | 修正（import パス更新）                   |

---

## 完了条件

- [ ] `SkillExecutor.ts` の `@deprecated` 型エイリアス2件が削除されていること
- [ ] main process 内の全 consumer が `@repo/shared` から直接 import していること
- [ ] `pnpm typecheck` が PASS すること
- [ ] `pnpm lint` が PASS すること
- [ ] 既存テストが全件 PASS すること
