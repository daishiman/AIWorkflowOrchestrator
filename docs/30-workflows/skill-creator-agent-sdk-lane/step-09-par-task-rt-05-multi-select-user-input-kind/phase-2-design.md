# Phase 2: 設計

## メタ情報

| 項目   | 値                           |
| ------ | ---------------------------- |
| Phase  | 2                            |
| 機能名 | multi-select-user-input-kind |
| 作成日 | 2026-03-29                   |

## 目的

multi_select の型定義拡張、バリデーションロジック、UI コンポーネントを設計する。

## 実行タスク

- `SkillCreatorUserInputKind` 型への `multi_select` 追加を設計する
- `SkillCreatorUserInput` に `selectedOptionIds?: string[]` を canonical として追加し、`selectedValues?: string[]` を互換入力として扱う設計にする
- `validateUserInputSubmission` の multi_select 分岐を設計する
- チェックボックスリスト UI コンポーネントを設計する

## 参照資料

| 資料名       | パス                      | 説明     |
| ------------ | ------------------------- | -------- |
| Phase 1 要件 | `phase-1-requirements.md` | 要件定義 |

## 完了条件

- [ ] 型拡張設計が完了している
- [ ] バリデーション設計が完了している
- [ ] UI コンポーネント設計が完了している
- [ ] **本Phase内の全タスクを100%実行完了**
