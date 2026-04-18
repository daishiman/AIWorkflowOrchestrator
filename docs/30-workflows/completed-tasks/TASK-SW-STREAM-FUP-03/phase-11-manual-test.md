# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 11                                        |
| Phase名    | 手動テスト                                |
| 対象機能   | TASK-SW-STREAM-FUP-03                     |
| 前提Phase  | Phase 10: 最終レビュー（ブロッカー 0 件） |
| 次Phase    | Phase 12: ドキュメント更新                |
| ステータス | 未実施                                    |
| 作成日     | 2026-04-17                                |

## 目的

NON_VISUAL タスクとして、自動テスト結果を手動テスト相当の証跡に固定し、Phase 12 へ安全に引き継ぐ。

## NON_VISUAL 宣言

| 項目               | 内容                                                                                                        |
| ------------------ | ----------------------------------------------------------------------------------------------------------- |
| タスク種別         | NON_VISUAL（UI/UX変更なし）                                                                                 |
| 非視覚的理由       | 変更対象は `SkillCreatorService.ts`（main process service層）のみ。フロントエンドUIコンポーネントの変更なし |
| スクリーンショット | 不要（Phase 11 スクリーンショット N/A）                                                                     |
| 代替証跡           | 自動テスト結果（TC-01〜TC-25 全件 PASS）                                                                    |

## 実行タスク

- 自動テスト件数と PASS/FAIL/SKIP を整理する。
- NON_VISUAL の理由を明記する。
- Phase 12 で参照する実ファイル名を固定する。

## 参照資料

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.progress.test.ts`
- `outputs/phase-11/TASK-SW-STREAM-FUP-03-manual-test-report.md`

## 統合テスト連携

- Phase 12 の implementation-guide.md と compliance check から Phase 11 report を参照する。
- artifacts.json と outputs/artifacts.json の一致を確認する。

## 手動テスト方針

NON_VISUAL タスクのため、実地 UI 操作による手動テストは実施しない。
代わりに以下の自動テスト結果を証跡として記録する。

### 証跡の主ソース

| 証跡種別     | 内容                                                                          |
| ------------ | ----------------------------------------------------------------------------- |
| 自動テスト名 | `SkillCreatorService.progress.test.ts`                                        |
| テスト件数   | 既存14件 + 新規（TC-01〜TC-25）= 合計 25件                                    |
| 実行コマンド | `pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService"` |
| 期待結果     | 全件 PASS                                                                     |

### 環境ブロッカー確認

| 確認項目                         | 対応                                                                  |
| -------------------------------- | --------------------------------------------------------------------- |
| esbuild darwin バイナリ mismatch | `pnpm install` 後に `pnpm --filter @repo/shared build` を実行して解消 |
| worktree 環境の依存関係不整合    | `pnpm install --filter @repo/desktop` で整合確認                      |

環境ブロッカーと製品コードの問題は別カテゴリで記録し、混在させない。

## 手動テスト結果記録フォーマット

```markdown
## 手動テスト結果

- テスト実行日: YYYY-MM-DD
- 実行環境: darwin / Node.js XX.X.X
- テスト件数: 25件（既存 14 + 新規 11）
- 結果: PASS XX件 / FAIL 0件 / SKIP 0件

## 環境ブロッカー

なし（または記録）

## 証跡の主ソース

自動テストログ（`SkillCreatorService.progress.test.ts` 全件 PASS）
```

## 成果物

| 成果物                                      | パス                                                           |
| ------------------------------------------- | -------------------------------------------------------------- |
| TASK-SW-STREAM-FUP-03-manual-test-report.md | `outputs/phase-11/TASK-SW-STREAM-FUP-03-manual-test-report.md` |

## 完了条件

- [ ] NON_VISUAL 宣言が記録されている
- [ ] 自動テスト結果（件数・PASS/FAIL/SKIP）が記録されている
- [ ] 環境ブロッカーの有無が記録されている
- [ ] manual-test-report.md が生成されている

## タスク100%実行確認【必須】

- [ ] NON_VISUAL 宣言をチェックリストに明記した
- [ ] 自動テストを実行し結果を記録した
- [ ] 環境ブロッカーを確認・記録した
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 12: ドキュメント更新](./phase-12-documentation.md)
