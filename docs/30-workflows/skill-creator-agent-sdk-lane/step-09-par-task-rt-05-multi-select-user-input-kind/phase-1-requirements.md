# Phase 1: 要件定義

## メタ情報

| 項目   | 値                           |
| ------ | ---------------------------- |
| Phase  | 1                            |
| 機能名 | multi-select-user-input-kind |
| 作成日 | 2026-03-29                   |

## 目的

既存の SkillCreatorUserInputKind の構造を確認し、multi_select 追加の要件を固定する。

## 実行タスク

- 既存の kind 一覧（single_select/free_text/secret/confirm）の仕様を確認する
- multi_select の入力データ構造（selectedValues: string[]）を定義する
- バリデーションルール（最小選択数、最大選択数）を定義する
- UI 表示仕様（チェックボックスリスト、全選択/全解除）を定義する
- AC-1〜AC-4 への写像を確認する

## 参照資料

| 資料名   | パス                                        | 説明             |
| -------- | ------------------------------------------- | ---------------- |
| 要件草案 | `../requirements-draft.md`                  | 全体要件         |
| 型定義   | `packages/shared/src/types/skillCreator.ts` | UserInputKind 型 |
| Engine   | `SkillCreatorWorkflowEngine.ts`             | バリデーション   |
| UI       | `SkillLifecyclePanel.tsx`                   | 既存 kind UI     |

## 完了条件

- [ ] 既存 kind の仕様が確認されている
- [ ] multi_select のデータ構造が定義されている
- [ ] バリデーションルールが定義されている
- [ ] AC-1〜AC-4 への写像が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**
