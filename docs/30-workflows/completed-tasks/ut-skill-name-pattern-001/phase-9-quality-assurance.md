# Phase 9: 品質保証

## メタ情報

| 項目   | 値                                 |
| ------ | ---------------------------------- |
| Phase  | 9                                  |
| 機能名 | skill-name-pattern-shared-constant |
| 作成日 | 2026-04-14                         |

## 目的

current facts に対して build / typecheck / lint / targeted test を実行し、品質が保たれていることを確認する。

## 実行コマンド

```bash
pnpm --filter @repo/shared build
pnpm --filter @repo/desktop typecheck
pnpm lint
pnpm --filter @repo/shared exec vitest run src/constants/skillName.test.ts
pnpm --filter @repo/desktop test -- --grep "validateSkillName|skill-scanner"
```

## チェックポイント

| 項目              | 判定基準                                   |
| ----------------- | ------------------------------------------ |
| shared build      | exit code 0                                |
| desktop typecheck | error 0                                    |
| lint              | error 0                                    |
| constants test    | `skillName.test.ts` が PASS                |
| scanner test      | `SkillScanner.validateSkillName()` が PASS |

## 完了条件

- [ ] build / typecheck / lint が PASS
- [ ] targeted test が PASS
- [ ] 失敗時の差分が `phase-5` 以降に戻せる形で記録されている

## 次のPhase

Phase 10: 最終レビュー
