# Phase 4: テスト作成

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 4                                       |
| 機能名 | step-ut-rt-06-esbuild-arch-mismatch-001 |
| 作成日 | 2026-03-29                              |

## 目的

修正前の Red 状態を記録し、修正後に同じ観点で再検証できるテスト計画を作成する。

## 実行タスク

- Red 状態記録
- テスト計画作成
- AC 対応マトリクス作成

## 参照資料

| 資料名       | パス                                                                                                   | 説明              |
| ------------ | ------------------------------------------------------------------------------------------------------ | ----------------- |
| 要件定義     | `phase-1-requirements.md`                                                                              | AC 定義           |
| 設計         | `phase-2-design.md`                                                                                    | 診断 / 復旧フロー |
| 設計レビュー | `phase-3-design-review.md`                                                                             | gate 判定         |
| 対象テスト   | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.sdk-normalization.test.ts` | 主要テスト        |

## 実行手順

### Step 1: Red 状態の記録

```bash
node -p "process.platform + '-' + process.arch"
pnpm --filter @repo/desktop test:run -- src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.sdk-normalization.test.ts 2>&1 | tee /tmp/rt06-red.log
```

### Step 2: テスト計画

| テストID | 観点             | コマンド / 方法                                                                                                                   | 期待結果                  | AC    |
| -------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ----- |
| T-01     | runtime 判定     | `node -p "process.platform + '-' + process.arch"`                                                                                 | platform-arch が得られる  | AC-02 |
| T-02     | 対象テスト       | `pnpm --filter @repo/desktop test:run -- src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.sdk-normalization.test.ts` | exit 0                    | AC-01 |
| T-03     | mismatch 不在    | テスト出力確認                                                                                                                    | mismatch 系メッセージなし | AC-03 |
| T-04     | ドキュメント存在 | `test -f docs/40-guides/esbuild-arch-mismatch-prevention.md`                                                                      | 0                         | AC-04 |
| T-05     | ドキュメント内容 | `grep` で runtime 確認 / `pnpm install --force` / worktree checklist を確認                                                       | 必須項目あり              | AC-05 |

### Step 3: Red 判定ルール

| 項目                  | Red 条件                                   |
| --------------------- | ------------------------------------------ |
| runtime / binary 整合 | 対応する optional dependency が見えない    |
| 対象テスト            | exit code != 0                             |
| 出力                  | mismatch 系メッセージが含まれる            |
| ドキュメント          | ガイドが存在しない、または必須項目が欠ける |

## 統合テスト連携

- T-01〜T-03 を通じて、`runtime -> esbuild -> vitest` の統合面を観測する。

## 成果物

| 成果物      | パス                               | 説明                 |
| ----------- | ---------------------------------- | -------------------- |
| テスト計画  | `outputs/phase-4/test-plan.md`     | テスト ID と期待結果 |
| Red状態記録 | `outputs/phase-4/red-state-log.md` | 失敗出力の要約       |

## 完了条件

- [x] Red 状態の取得方法を定義した
- [x] AC 対応付きのテスト計画を定義した
- [x] 再検証時に同じコマンドを使えるようにした
- [x] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 5: 実装
