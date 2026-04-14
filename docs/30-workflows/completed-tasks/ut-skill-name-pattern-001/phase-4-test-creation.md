# Phase 4: テスト設計

## メタ情報

| 項目   | 値                                 |
| ------ | ---------------------------------- |
| Phase  | 4                                  |
| 機能名 | skill-name-pattern-shared-constant |
| 作成日 | 2026-04-14                         |

## 目的

既存テストの網羅性を current state に合わせて整理し、新規テストが不要かどうかを決める。

## 既存テスト

| ファイル                                                           | 観点                                                       |
| ------------------------------------------------------------------ | ---------------------------------------------------------- |
| `packages/shared/src/constants/skillName.test.ts`                  | `SKILL_NAME_PATTERN` と `MAX_SKILL_NAME_LENGTH` の定義確認 |
| `packages/shared/src/constants/__tests__/manual-import.test.ts`    | barrel export の確認                                       |
| `apps/desktop/src/main/claude-cli/__tests__/skill-scanner.test.ts` | `SkillScanner.validateSkillName()` の境界値確認            |

## テストマトリクス

| ID    | 観点                                   | 期待値                     |
| ----- | -------------------------------------- | -------------------------- |
| TC-01 | `SKILL_NAME_PATTERN` の正規表現 source | `^[a-z0-9]+(-[a-z0-9]+)*$` |
| TC-02 | `MAX_SKILL_NAME_LENGTH` の型           | `number`                   |
| TC-03 | `MAX_SKILL_NAME_LENGTH` の値           | `64`                       |
| TC-04 | 有効な kebab-case                      | true                       |
| TC-05 | 無効な文字列                           | false                      |
| TC-06 | 64 / 65 文字境界                       | 64 は true、65 は false    |

## ルール

- 新しい `__tests__/skillName.test.ts` は作らない。現行の `skillName.test.ts` を使う。
- `SkillService.ts` の旧前提テストは使わない。
- もし drift が見つかった場合のみ、追加の Red テストを作成する。

## 完了条件

- [ ] 既存テストで十分か、新規追加が必要かが判断されている
- [ ] テスト対象が current facts と一致している

## 次のPhase

Phase 5: 実装/同期
