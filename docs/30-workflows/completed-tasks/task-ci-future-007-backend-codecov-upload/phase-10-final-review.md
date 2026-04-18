# Phase 10: 最終レビューゲート

## メタ情報

| 項目   | 値                                        |
| ------ | ----------------------------------------- |
| Phase  | 10                                        |
| 機能名 | task-ci-future-007-backend-codecov-upload |
| 作成日 | 2026-04-16                                |

## 目的

受入基準 AC-1〜AC-5 との完全な照合を行い、Phase 11 進行可否を最終判定する。
PASS / MINOR / MAJOR を判定し、MAJOR 指摘が残存している場合は Phase 5（実装）へ戻る。
PASS の場合は Phase 11（手動テスト）へ進む。

---

## 実行タスク

- **タスク1**: 受入基準 AC-1〜AC-5 の最終照合チェックリスト実施
- **タスク2**: `desktop` フラグの回帰確認（既存 Codecov 設定に影響がないことを確認）
- **タスク3**: 変更スコープの最終確認（`ci.yml` と `apps/backend/vitest.config.ts` のみ）
- **タスク4**: Phase 11 ゲート判定（PASS / MINOR / MAJOR）

---

## 参照資料

| 資料名                   | パス                                       | 説明                           |
| ------------------------ | ------------------------------------------ | ------------------------------ |
| Phase 1 受入基準         | `outputs/phase-1/acceptance-criteria.md`   | AC-1〜AC-5 の定義              |
| Phase 9 品質チェック結果 | `outputs/phase-9/quality-check-result.md`  | 品質ゲート結果                 |
| CI ワークフロー          | `.github/workflows/ci.yml`                 | カバレッジアップロード設定確認 |
| Vitest 設定              | `apps/backend/vitest.config.ts`            | カバレッジ設定確認             |
| Phase 5 実装結果         | `outputs/phase-5/implementation-result.md` | 実装内容の最終確認             |
| Phase 8 リファクタリング | `outputs/phase-8/refactoring-result.md`    | Phase 8 成果物                 |
| CI実行時間レポート       | `outputs/phase-7/coverage-check-result.md` | Phase 7 成果物                 |

---

## 実行手順

### ステップ1: 受入基準 AC-1〜AC-5 の最終照合

```bash
# AC-1: test-web ジョブ（@repo/backend）に coverage ステップが追加されているか
grep -n "coverage\|lcov\|backend" .github/workflows/ci.yml | head -30

# AC-2: Codecov アップロードに `flags: backend` が設定されているか
grep -n "flags.*backend\|backend.*flags" .github/workflows/ci.yml

# AC-3: カバレッジ収集が `if: github.event_name == 'push' && github.ref == 'refs/heads/main'` で条件付きか
grep -n "github.event_name\|github.ref\|push.*main\|coverage" .github/workflows/ci.yml | head -20

# AC-4: PR 時はカバレッジ収集がスキップされるか（PR相当の条件でカバレッジステップが実行されないことを確認）
grep -n "pull_request\|coverage" .github/workflows/ci.yml | head -20

# AC-5: `desktop` フラグのカバレッジアップロードが引き続き動作しているか（回帰確認）
grep -n "flags.*desktop\|desktop.*flags" .github/workflows/ci.yml
```

**受入基準照合テーブル**:

| AC番号 | 基準                                                                              | 判定 | 証拠                                             |
| ------ | --------------------------------------------------------------------------------- | ---- | ------------------------------------------------ |
| AC-1   | test-web ジョブ（@repo/backend）にカバレッジ収集ステップが追加されていること      | TBD  | grep 結果・ci.yml の coverage ステップ定義       |
| AC-2   | Codecov アップロードに `flags: backend` が設定されていること                      | TBD  | grep 結果・ci.yml の codecov upload 設定         |
| AC-3   | main push 時のみカバレッジ収集が実行されること（条件分岐が正しいこと）            | TBD  | grep 結果・if 条件式の確認                       |
| AC-4   | PR 時はカバレッジ収集がスキップされること                                         | TBD  | Phase 11 の CI 実行ログ（PR 相当での skip 確認） |
| AC-5   | `desktop` フラグの Codecov アップロードが引き続き正常動作していること（回帰なし） | TBD  | grep 結果・Phase 11 CI 実行ログ                  |

### ステップ2: コードレビュー観点チェック

| 観点                            | チェック内容                                                                     | 判定 |
| ------------------------------- | -------------------------------------------------------------------------------- | ---- |
| カバレッジ条件式の正確性        | `if: github.event_name == 'push' && github.ref == 'refs/heads/main'` が正確か    | TBD  |
| backend フラグの設定            | Codecov upload ステップに `flags: backend` が正確に記述されているか              | TBD  |
| シャード別カバレッジ結合        | 複数シャードのカバレッジを結合してアップロードする場合の設定が正しいか           | TBD  |
| vitest.config.ts の変更スコープ | `apps/backend/vitest.config.ts` のみ変更されており、他のパッケージに影響しないか | TBD  |
| desktop フラグの回帰            | 既存の desktop フラグ設定が削除・変更されていないか                              | TBD  |
| 不要コードの除去                | Phase 8 リファクタで不要コード・重複設定が除去済みか                             | TBD  |

### ステップ3: `desktop` フラグ回帰確認

```bash
# desktop フラグが引き続き設定されているか確認
grep -n "flags\|desktop\|upload" .github/workflows/ci.yml

# test-desktop ジョブにも影響がないことを確認
grep -n "test-desktop\|coverage" .github/workflows/ci.yml | head -20
```

| 確認項目                        | 期待値                                      | 現状 |
| ------------------------------- | ------------------------------------------- | ---- |
| desktop フラグ設定の存在        | `flags: desktop` が ci.yml に残存           | TBD  |
| test-desktop ジョブへの影響なし | test-desktop ジョブの設定が変更されていない | TBD  |

### ステップ4: 変更スコープ確認

```bash
# 変更されたファイルが ci.yml と apps/backend/vitest.config.ts のみであることを確認
git diff --name-only HEAD~1 HEAD 2>/dev/null || git status --short
```

| 変更対象ファイル                | 変更理由                                                 | 確認 |
| ------------------------------- | -------------------------------------------------------- | ---- |
| `.github/workflows/ci.yml`      | backend カバレッジ収集・Codecov アップロードステップ追加 | TBD  |
| `apps/backend/vitest.config.ts` | coverage 設定追加（必要な場合のみ）                      | TBD  |

### ステップ5: PASS / MINOR / MAJOR 判定テーブル

| 判定        | 条件                                                                 | 次アクション             |
| ----------- | -------------------------------------------------------------------- | ------------------------ |
| PASS        | AC-1〜AC-5 が全て ✅、コードレビュー観点に問題なし                   | Phase 11 へ進む          |
| MINOR       | 軽微な指摘のみ（コメント不足・タイムアウト値の微調整）               | 記録の上 Phase 11 へ進む |
| MAJOR: 実装 | AC-1, AC-2, AC-3 のいずれかが ❌（カバレッジ収集・フラグ・条件分岐） | Phase 5（実装）へ戻る    |
| MAJOR: 設計 | AC-4 が ❌（PR 時のスキップが機能しない根本的な設計問題）            | Phase 2（設計）へ戻る    |
| MAJOR: 回帰 | AC-5 が ❌（desktop フラグの動作が壊れている）                       | Phase 5（実装）へ戻る    |

---

## 統合テスト連携

- 最終レビューで AC-3（main push 時のみ収集）と AC-4（PR 時はスキップ）が「CI 条件制御の証明」として記録済み
- AC-5（desktop フラグ回帰なし）は Phase 11 の CI 実行ログで最終確認するため、Phase 10 時点では「見込み PASS」として記録

---

## サブタスク管理

| ID     | タスク名                   | ステータス |
| ------ | -------------------------- | ---------- |
| T-10-1 | AC-1〜AC-5 の最終照合      | 未実施     |
| T-10-2 | コードレビュー観点チェック | 未実施     |
| T-10-3 | desktop フラグ回帰確認     | 未実施     |
| T-10-4 | 変更スコープ確認           | 未実施     |
| T-10-5 | PASS / MINOR / MAJOR 判定  | 未実施     |

---

## 成果物

| 成果物           | 配置先                                    | 形式     |
| ---------------- | ----------------------------------------- | -------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | Markdown |
| AC 検証記録      | `outputs/phase-10/ac-verification.md`     | Markdown |

---

## 完了条件

- [ ] AC-1〜AC-5 の照合が全て実施され、判定（✅ / ❌）が記録されていること
- [ ] コードレビュー観点の全チェック項目が実施されていること
- [ ] desktop フラグの回帰確認が完了していること
- [ ] 変更スコープが `ci.yml` と `apps/backend/vitest.config.ts` のみであることが確認されていること
- [ ] PASS / MINOR / MAJOR 判定が確定していること
- [ ] `outputs/phase-10/final-review-result.md` に判定結果が記録されていること
- [ ] `outputs/phase-10/ac-verification.md` に AC-1〜AC-5 の証拠が記録されていること

---

## タスク100%実行確認【必須】

- [ ] T-10-1: AC-1〜AC-5 の照合を実行し `outputs/phase-10/ac-verification.md` に記録済み
- [ ] T-10-2: コードレビュー観点チェックを実行し結果を記録済み
- [ ] T-10-3: desktop フラグ回帰確認を実行し結果を記録済み
- [ ] T-10-4: 変更スコープ確認を実行し結果を記録済み
- [ ] T-10-5: PASS / MINOR / MAJOR 判定を確定し `outputs/phase-10/final-review-result.md` に記録済み

---

## 次Phase

**Phase 11: 手動テスト検証** — ローカル環境でのカバレッジ生成動作確認と CI 動作検証を行う。

**Phase 11 開始条件**: Phase 10 の判定が「PASS」または「MINOR のみ」であること。
**Phase 13 blocked 条件**: MAJOR 判定が残存している場合は PR 作成不可。
