# Phase 8: リファクタリング候補分析

## タスクID: UT-FIX-SKILL-IMPORT-ID-MISMATCH-001

## 実行日: 2026-02-22

## リファクタリング候補一覧

| #   | 候補                                                               | 判断                 | 理由                                                     |
| --- | ------------------------------------------------------------------ | -------------------- | -------------------------------------------------------- |
| 1   | AgentView `handleImport` 引数名 `skillIds` → `skillNames`          | ✅ 実施済（Phase 5） | Phase 5で既に変更完了                                    |
| 2   | SkillImportDialogProps `onImport` 引数名 `skillIds` → `skillNames` | ✅ 実施              | 実際に渡される値がskill.nameであるため、P45準拠で修正    |
| 3   | 型キャスト `as unknown as Skill[]`（AgentView 247/250行）          | ❌ 見送り            | `@repo/shared`型定義の変更が必要でスコープ外（P32該当）  |
| 4   | `importedSkillIds` Props命名                                       | ❌ 見送り            | 実際にskill.id（ハッシュ）を格納しており命名が実態と一致 |
| 5   | `selectedIds` 内部状態名                                           | ❌ 変更不要          | 内部状態管理でskill.idを使用しており命名が実態と一致     |

## 詳細分析

### 候補2: Props `onImport` 引数名修正（実施）

**変更前**: `onImport: (skillIds: string[]) => void`
**変更後**: `onImport: (skillNames: string[]) => void`
**理由**: Phase 5の修正でonImportに渡される値がskill.nameに変わったが、Props型の引数名がskillIdsのまま残っていた。P45（契約ドリフト）の防止のため修正。

### 候補3: 型キャスト見送り理由

AgentViewの247行目・250行目の型キャストは、`ImportedSkill`（Store型）と`Skill`（@repo/shared型）の型差異に起因する。解消するには：

1. `packages/shared/src/agent/types.ts` の型定義変更
2. `apps/desktop/src/preload/types.ts` の型定義変更

これはP32（型定義の二箇所同時更新必須）に該当し、本タスクのスコープ外。既存の未タスク UT-FIX-5-1-001（AgentView型アサーション解消）に含まれる。

### 候補4: `importedSkillIds` 命名確認

`importedSkillIds`はAgentViewの`useImportedSkillIds()`フックから取得される値で、Zustand Store内に`skill.id`（ハッシュ値）として格納されている。命名は実態と一致しているため変更不要。
