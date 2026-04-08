# W2-seq-03a カバレッジ計測結果

## タスクID: W2-seq-03a

## 実施日時

2026-04-08

---

## 実行コマンド

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/__tests__/SkillCreateWizard.W2-seq-03a.test.tsx \
  src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx \
  --coverage \
  --coverage.include="src/renderer/components/skill/SkillCreateWizard.tsx" \
  --coverage.include="src/renderer/components/skill/wizard/CompleteStep.tsx" \
  --coverage.reporter=text
```

---

## カバレッジ計測結果

```
 % Coverage report from v8
-----------------------------|---------|----------|---------|---------|-------------------
File                         | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-----------------------------|---------|----------|---------|---------|-------------------
All files                    |   94.21 |    88.37 |  100.00 |   94.21 |
 SkillCreateWizard.tsx       |   93.88 |    87.50 |  100.00 |   93.88 | 142-145,198-201
 CompleteStep.tsx            |   94.74 |    89.47 |  100.00 |   94.74 | 87-90
-----------------------------|---------|----------|---------|---------|-------------------
```

---

## 関数別カバレッジ

| 関数名                  | カバレッジ | 備考                                           |
| ----------------------- | ---------- | ---------------------------------------------- |
| `inferSmartDefaults`    | **100%**   | 全推論ルール（7ケース+デフォルト）をテスト済み |
| `handleStep0Next`       | カバー済み | IT-H0-01 で検証                                |
| `handleGenerate`        | カバー済み | IT-HG-01〜03 + EC-HG-01〜03 で検証             |
| `handleQualityFeedback` | カバー済み | CT-AC-02 経由で検証                            |
| `handleRetry`           | カバー済み | IT-HR-01 + EC-HR-01 で検証                     |

---

## 未到達パスについて

未到達行（`SkillCreateWizard.tsx` L142-145, L198-201 / `CompleteStep.tsx` L87-90）の詳細は `outputs/phase-7/uncovered-paths.md` を参照。

---

## 判定

| カバレッジ種別 | 目標値   | 実測値 | 判定 |
| -------------- | -------- | ------ | ---- |
| line           | 80% 以上 | 94.21% | PASS |
| branch         | 60% 以上 | 88.37% | PASS |
| functions      | 100%     | 100%   | PASS |

**総合判定: PASS → Phase 8 へ進む**
