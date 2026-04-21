# TASK-SW-STREAM-FUP-02: onProgress 進捗フェーズの定数化

## メタ情報

```yaml
issue_number: 2207
```

## 概要

`createSkill()` の5段階進捗フロー（phase/percentage/message）を `PROGRESS_PHASES` 定数オブジェクトに集約する。
magic string / magic number をなくし、テストの期待値を一元管理する。

## 背景

TASK-SW-STREAM-001 で5段階の進捗（planning → generating-skill → generating-agents → validating → done）を実装したが、
phase 名・percentage・message が `SkillCreatorService.ts` 内にハードコードされている。
テストファイル（`SkillCreatorService.progress.test.ts`）でも同じ文字列/数値を重複記述しており、
変更時に実装とテストの両方を修正する必要があるため保守コストが高い。

## 変更対象ファイル

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`（定数定義・emitProgress 呼び出しを定数参照に変更）
- `apps/desktop/src/__tests__/main/services/skill/SkillCreatorService.progress.test.ts`（テスト期待値を定数参照に変更）

## 受入基準

- `PROGRESS_PHASES.PLANNING`, `PROGRESS_PHASES.GENERATING_SKILL` 等の定数が定義されている
- `createSkill()` 内の emitProgress 呼び出しが全て定数を参照している
- テストの期待値が定数を参照している
- typecheck / test が全て PASS

## 苦戦箇所（実装知見）

| 苦戦箇所       | 問題                                             | 解決策                                |
| -------------- | ------------------------------------------------ | ------------------------------------- |
| 定数の型安全性 | `PROGRESS_PHASES` が `any` 型になりがち          | `as const` アサーションで型を固定する |
| テスト影響範囲 | 定数化により14テストケースの期待値を全て更新必要 | 定数定義後に一括置換で対応            |

## 参照

- TASK-SW-STREAM-001（magic number/string の初出）
- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`（変更対象）
