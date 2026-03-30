# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 7                                       |
| 機能名 | step-ut-rt-06-esbuild-arch-mismatch-001 |
| 作成日 | 2026-03-29                              |

## 目的

環境修正によって対象テストの観測可能性が回復していることと、AC 証跡が揃っていることを確認する。

## 実行タスク

- 対象テストの coverage 実行
- AC 証跡の整理
- coverage の意図説明

## 参照資料

| 資料名     | パス                        | 説明     |
| ---------- | --------------------------- | -------- |
| テスト計画 | `phase-4-test-creation.md`  | テストID |
| 実装       | `phase-5-implementation.md` | 復旧結果 |
| テスト拡充 | `phase-6-test-expansion.md` | 周辺検証 |

## 実行手順

### Step 1: coverage 実行

```bash
pnpm --filter @repo/desktop test:run -- --coverage src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.sdk-normalization.test.ts
```

### Step 2: AC 証跡整理

| AC    | 観点                                      |
| ----- | ----------------------------------------- |
| AC-01 | 対象テストの pass                         |
| AC-02 | runtime と optional dependency の整合     |
| AC-03 | mismatch 系エラーの不在                   |
| AC-04 | docs 存在                                 |
| AC-05 | docs に exact command と checklist がある |

### Step 3: 解釈

この phase の目的は coverage 値を上げることではなく、環境修正後に coverage 実行経路まで回復したことを確認することにある。

## 統合テスト連携

- coverage 実行により `vitest + esbuild` の観測経路まで正常化したかを確認する。

## 成果物

| 成果物             | パス                                 | 説明                      |
| ------------------ | ------------------------------------ | ------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | coverage と AC 証跡の要約 |

## 完了条件

- [ ] coverage 実行結果を記録した
- [ ] AC-01〜AC-05 の証跡を整理した
- [ ] coverage の解釈を明記した
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 8: リファクタリング
