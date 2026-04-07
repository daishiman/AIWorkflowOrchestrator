# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                                         |
| ---------- | ------------------------------------------------------------ |
| Phase      | 6                                                            |
| タスクID   | TASK-SDK-04-U1-F1                                            |
| 機能名     | task-sdk-04-u1-f1-verification-review-single-select          |
| タスク名   | verification_review request を single_select kind に変更する |
| 前提Phase  | Phase 5                                                      |
| 後続Phase  | Phase 7                                                      |
| 作成日     | 2026-04-06                                                   |
| ステータス | pending                                                      |

## 目的

Phase 4〜5 で作成した基本テストに加え、異常系・境界値・回帰テストを追加して
テストスイートの堅牢性を高める。

## 参照資料

| 資料名           | パス                                                                                  | 説明             |
| ---------------- | ------------------------------------------------------------------------------------- | ---------------- |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md`                                           | Phase 5 成果物   |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`                                                    | Phase 5 成果物   |
| テスト仕様書     | `outputs/phase-4/test-specification.md`                                               | Phase 4 成果物   |
| テスト対象       | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts` | 変更対象ファイル |

## 実行タスク

- 異常系テスト追加: 不正な selectedOptionId / 空値 / null / undefined の境界値ケースを追加する
- 回帰テスト確認: `recordExecutionFailure` / `recordVerifyFailure` の両呼び出し元経由でのテストを確認する
- 全件実行: テスト全件 PASS を確認する

## 追加テストケース

| TC-ID    | テスト名                                                                   | 期待結果                           |
| -------- | -------------------------------------------------------------------------- | ---------------------------------- |
| TC-ADD-1 | `selectedOptionId` が空文字 `""` の場合                                    | バリデーションエラー               |
| TC-ADD-2 | `selectedOptionId` が `null` / `undefined` の場合                          | バリデーションエラー               |
| TC-ADD-3 | `selectedOptionId` が "approve" / "improve" / "reject" 以外の文字列の場合  | バリデーションエラー               |
| TC-ADD-4 | `recordExecutionFailure()` 経由で verification_review request が生成される | kind: "single_select", options 3件 |
| TC-ADD-5 | `recordVerifyFailure()` 経由で verification_review request が生成される    | kind: "single_select", options 3件 |

## 実行手順

### 1. 異常系テスト追加

`apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts` に
TC-ADD-1〜5 を追加する。

### 2. 全件実行

```bash
pnpm exec vitest run \
  apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts \
  --reporter=verbose
```

## 統合テスト連携

```bash
pnpm exec vitest run \
  apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts
```

## サブタスク管理

- Lane A: 境界値テストを追加する
- Lane B: 呼び出し元経路の回帰テストを追加する
- Lane C: A/B の結果を統合して全件 PASS を確認する
- A/B は並列、C は直列

## 多角的チェック観点（AIが判断）

| 観点           | 確認内容                                                                             |
| -------------- | ------------------------------------------------------------------------------------ |
| 境界値         | 空文字・null・undefined・範囲外文字列が正しく拒否されるか                            |
| 呼び出し元網羅 | `recordExecutionFailure` と `recordVerifyFailure` の両方からのパスをテストしているか |

## 成果物

| 成果物           | パス                                        | 説明               |
| ---------------- | ------------------------------------------- | ------------------ |
| 拡張テストケース | `outputs/phase-6/expanded-test-cases.md`    | 追加した TC 一覧   |
| 回帰テスト結果   | `outputs/phase-6/regression-test-result.md` | 全件 PASS 確認結果 |

## 完了条件

- [ ] TC-ADD-1〜5 が追加されている
- [ ] 全テスト PASS（新規 + 既存）
- [ ] 拡張テストケース一覧が記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/task-sdk-04-u1-f1-verification-review-single-select --phase 6
```

## 次のPhase

Phase 7: テストカバレッジ確認
