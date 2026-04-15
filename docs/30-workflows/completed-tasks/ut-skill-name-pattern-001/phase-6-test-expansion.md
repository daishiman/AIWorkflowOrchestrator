# Phase 6: テスト拡張

## メタ情報

| 項目   | 値                                 |
| ------ | ---------------------------------- |
| Phase  | 6                                  |
| 機能名 | skill-name-pattern-shared-constant |
| 作成日 | 2026-04-14                         |

## 目的

Phase 5 でコード変更があった場合のみ、境界値と回帰ガードを追加する。変更がなければ既存テストの確認結果を記録するだけにする。

## 追加候補

| ID    | 観点                           | 期待値 |
| ----- | ------------------------------ | ------ |
| TC-07 | 64 文字ちょうど                | true   |
| TC-08 | 65 文字                        | false  |
| TC-09 | アンダースコア / 空白 / 日本語 | false  |
| TC-10 | 連続ハイフン                   | false  |

## 実行ルール

- 既存の `packages/shared/src/constants/skillName.test.ts` を優先する。
- `apps/desktop/src/main/claude-cli/__tests__/skill-scanner.test.ts` の validateSkillName 境界値を維持する。
- 新しい `__tests__/skillName.test.ts` は作らない。

## 完了条件

- [ ] 境界値テストが 64 / 65 に統一されている
- [ ] `skillName.ts` の定義と `skill-scanner.test.ts` の期待値が一致している

## 次のPhase

Phase 7: カバレッジ確認
