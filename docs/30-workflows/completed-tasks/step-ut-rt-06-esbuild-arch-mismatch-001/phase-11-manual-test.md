# Phase 11: 手動テスト

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 11                                      |
| 機能名 | step-ut-rt-06-esbuild-arch-mismatch-001 |
| 作成日 | 2026-03-29                              |

## 目的

docs-only / NON_VISUAL タスクとして、UI スクリーンショットではなく preflight・target test・ドキュメントの代替証跡を残す。

## 実行タスク

- preflight 実行
- target test 実行
- guide 内容確認
- blocker / note の分類

## 参照資料

| 資料名           | パス                                                                      | 説明                   |
| ---------------- | ------------------------------------------------------------------------- | ---------------------- |
| 要件定義         | `phase-1-requirements.md`                                                 | AC 定義                |
| 設計             | `phase-2-design.md`                                                       | expected platform 前提 |
| 実装             | `phase-5-implementation.md`                                               | 復旧手順               |
| テスト拡充       | `phase-6-test-expansion.md`                                               | 追加確認観点           |
| カバレッジ確認   | `phase-7-coverage-check.md`                                               | 再検証観点             |
| リファクタリング | `phase-8-refactoring.md`                                                  | 文面整理結果           |
| 品質保証         | `phase-9-quality-assurance.md`                                            | quality gate 結果      |
| 最終レビュー     | `phase-10-final-review.md`                                                | 判定ルール             |
| 未タスク指示書   | `docs/30-workflows/unassigned-task/UT-RT-06-ESBUILD-ARCH-MISMATCH-001.md` | blocker 記録先         |

## 実行手順

### Step 1: preflight

```bash
node -e "console.log(process.arch)"
file "$(which node)"
EXPECTED_PLATFORM="darwin-$(node -p process.arch)"
echo "$EXPECTED_PLATFORM"
ls node_modules/@esbuild/ | grep "$EXPECTED_PLATFORM" || echo "expected platform package not found"
```

### Step 2: target test

```bash
pnpm --filter @repo/desktop test:run -- src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.sdk-normalization.test.ts
```

### Step 3: guide review

- `process.arch` の確認が書かれていること
- `pnpm install --force` が書かれていること
- worktree preflight が書かれていること

### Step 4: 発見事項の分類

| 分類    | 意味                              |
| ------- | --------------------------------- |
| Blocker | Phase 12 前に formalize 必須      |
| Note    | 改善推奨だが close-out を妨げない |
| Info    | 参考情報として記録のみ            |

## 統合テスト連携

- current arch と esbuild package の整合を確認する
- target test failure が続く場合は環境起因かコード起因かを分類する

## 成果物

| 成果物         | パス                                     | 説明                            |
| -------------- | ---------------------------------------- | ------------------------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | preflight と target test の記録 |
| 発見課題一覧   | `outputs/phase-11/discovered-issues.md`  | blocker / note 記録             |

## 完了条件

- [ ] current `process.arch` を確認した
- [ ] `node_modules/@esbuild/$EXPECTED_PLATFORM` を確認した
- [ ] target test を実行した
- [ ] guide の必須記載を確認した
- [ ] blocker があれば `discovered-issues.md` に記録した
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 12: ドキュメント更新
