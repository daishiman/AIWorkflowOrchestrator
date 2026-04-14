# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                                 |
| ------ | ---------------------------------- |
| Phase  | 7                                  |
| 機能名 | skill-name-pattern-shared-constant |
| 作成日 | 2026-04-14                         |

## 目的

変更があった場合のみ、`skillName.ts` と current consumer の到達確認を行う。no-op なら既存カバレッジの確認結果を記録する。

## 対象

| ファイル                                                           | 対象理由                 |
| ------------------------------------------------------------------ | ------------------------ |
| `packages/shared/src/constants/skillName.ts`                       | 定数の正本               |
| `apps/desktop/src/main/claude-cli/SkillScanner.ts`                 | 参照側                   |
| `packages/shared/src/constants/skillName.test.ts`                  | 定数テスト               |
| `apps/desktop/src/main/claude-cli/__tests__/skill-scanner.test.ts` | validateSkillName テスト |

## 完了条件

- [ ] `skillName.ts` の定義行がテストで到達している
- [ ] `SkillScanner.validateSkillName()` の boundary が通っている
- [ ] repo-wide ではなく targeted な確認になっている

## 次のPhase

Phase 8: リファクタリング
