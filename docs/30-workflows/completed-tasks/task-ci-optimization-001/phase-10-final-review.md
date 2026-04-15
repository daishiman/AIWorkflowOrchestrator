# Phase 10: 最終レビューゲート

## メタ情報

| 項目   | 値                       |
| ------ | ------------------------ |
| Phase  | 10                       |
| 機能名 | task-ci-optimization-001 |
| 作成日 | 2026-04-14               |

## 目的

Phase 11〜13 への進行可否を最終判定する。
受入基準 AC-1〜AC-6 との完全な照合を行い、PASS / MINOR / MAJOR を判定する。
MAJOR 指摘が残存している場合は Phase 5（実装）へ戻る。PASS の場合は Phase 11 へ進む。

---

## 実行タスク

- **タスク1**: 受入基準 AC-1〜AC-6 の最終照合チェックリスト実施
- **タスク2**: PASS / MINOR / MAJOR 判定テーブルの評価
- **タスク3**: 既知の未解決リスクの再評価
- **タスク4**: 最終レビュー結果と AC 検証記録の作成

---

## 参照資料

| 資料名                     | パス                                                                         | 説明                  |
| -------------------------- | ---------------------------------------------------------------------------- | --------------------- |
| Phase 1 受入基準           | `outputs/phase-1/acceptance-criteria.md`                                     | AC-1〜AC-6 の定義     |
| Phase 9 品質チェック結果   | `outputs/phase-9/quality-check-result.md`                                    | 品質ゲート結果        |
| Phase 3 MINOR 追跡テーブル | `outputs/phase-3/minor-tracking.md`                                          | MINOR 解決確認        |
| Phase 5 実装結果           | `outputs/phase-5/implementation-result.md`                                   | 実装内容の最終確認    |
| CI ワークフロー            | `.github/actions/pnpm-install-retry/action.yml` / `.github/workflows/ci.yml` | 実装の最終確認        |
| Vitest 設定                | `apps/desktop/vitest.config.ts`                                              | CI_MAX_FORKS 最終確認 |
| P50チェック結果            | `outputs/phase-1/p50-check-result.md`                                        | Phase 1 成果物        |
| ボトルネック分析           | `outputs/phase-1/bottleneck-analysis.md`                                     | Phase 1 成果物        |
| 設計決定記録               | `outputs/phase-2/design-decisions.md`                                        | Phase 2 成果物        |
| キャッシュ設計             | `outputs/phase-2/cache-design.md`                                            | Phase 2 成果物        |
| バリデーションマトリックス | `outputs/phase-2/validation-matrix.md`                                       | Phase 2 成果物        |
| GREEN確認                  | `outputs/phase-5/green-confirmation.md`                                      | Phase 5 成果物        |
| リファクタリング結果       | `outputs/phase-8/refactoring-result.md`                                      | Phase 8 成果物        |
| CI実行時間レポート         | `outputs/phase-7/ci-timing-report.md`                                        | Phase 7 成果物        |
| キャッシュ効果レポート     | `outputs/phase-7/cache-effectiveness-report.md`                              | Phase 7 成果物        |

---

## 実行手順

### ステップ1: 受入基準 AC-1〜AC-6 の最終照合

```bash
# AC-1: node_modules キャッシュのキーが pnpm-lock.yaml ハッシュで管理されているか
grep -n "hashFiles.*pnpm-lock.yaml" .github/actions/pnpm-install-retry/action.yml .github/workflows/ci.yml

# AC-2: CI 実行時間の削減効果（Phase 11 の実測結果で最終確認）
# → Phase 9 の quality-check-result.md から現状確認
cat outputs/phase-9/quality-check-result.md 2>/dev/null | grep "AC-2\|実行時間"

# AC-3: test-desktop の全シャードが PASS を維持しているか
# → Phase 7 の計測レポートから確認
cat outputs/phase-7/ci-timing-report.md 2>/dev/null | grep "PASS\|shard"

# AC-4: シャード数 17 で matrix が正しく動作しているか
grep -n "shard\|17\|matrix" .github/workflows/ci.yml | grep -i "shard\|17" | head -10

# AC-5: CI_MAX_FORKS=3 が vitest.config.ts に設定されているか
grep -n "CI_MAX_FORKS\|maxForks\|3" apps/desktop/vitest.config.ts

# AC-6: mainブランチのカバレッジ収集ジョブが継続動作しているか
grep -n "coverage\|upload-artifact\|main" .github/workflows/ci.yml | head -20
```

**受入基準照合テーブル**:

| AC番号 | 基準                                                                          | 判定 | 証拠                               |
| ------ | ----------------------------------------------------------------------------- | ---- | ---------------------------------- |
| AC-1   | node_modules キャッシュが `hashFiles('pnpm-lock.yaml')` キーで正常動作        | TBD  | grep 結果・Phase 11 CI 実行ログ    |
| AC-2   | CI 実行時間が 7分40秒以内に削減されていること                                 | TBD  | Phase 11 の実測値                  |
| AC-3   | test-desktop の全シャード（17 個）が PASS を維持していること                  | TBD  | Phase 7 計測レポート               |
| AC-4   | シャード数 17 で matrix が正しく動作していること（17 ジョブが生成されること） | TBD  | ci.yml の matrix 設定・CI 実行結果 |
| AC-5   | CI_MAX_FORKS=3 でメモリ安定動作していること（OOM なし）                       | TBD  | Phase 11 CI 実行ログ（OOM 確認）   |
| AC-6   | main ブランチのカバレッジ収集が継続して動作していること                       | TBD  | ci.yml のカバレッジジョブ設定確認  |

### ステップ2: コードレビュー観点チェック

| 観点                                 | チェック内容                                                              | 判定 |
| ------------------------------------ | ------------------------------------------------------------------------- | ---- |
| キャッシュキーの正確性               | `hashFiles('pnpm-lock.yaml')` が正確に記述されているか                    | TBD  |
| restore-keys フォールバック          | `restore-keys` でプレフィックス一致による部分キャッシュが設定されているか | TBD  |
| 条件付き pnpm install の正確性       | `if: steps.cache-node-modules.outputs.cache-hit != 'true'` が正確か       | TBD  |
| シャード数 17 の matrix 定義         | `shard: [1,2,...,17]` または相当する記述が正確か                          | TBD  |
| CI_MAX_FORKS の参照方法              | `CI_MAX_FORKS = 3` 相当の安全な参照になっているか                         | TBD  |
| ELECTRON_SKIP_BINARY_DOWNLOAD の設定 | desktop 系ジョブ全てに設定されているか（Phase 9 結果で確認済み）          | TBD  |
| 不要コードの除去                     | Phase 8 リファクタで不要コード・重複設定が除去済みか                      | TBD  |

### ステップ3: PASS / MINOR / MAJOR 判定テーブル

| 判定              | 条件                                                               | 次アクション                |
| ----------------- | ------------------------------------------------------------------ | --------------------------- |
| PASS              | AC-1〜AC-6 が全て ✅、コードレビュー観点に問題なし                 | Phase 11 へ進む             |
| MINOR             | 軽微な指摘のみ（コメント不足・タイムアウト値の微調整など）         | 記録の上 Phase 11 へ進む    |
| MAJOR: 実装       | AC-1, AC-4, AC-5 のいずれかが ❌（キャッシュ・シャード・フォーク） | Phase 5（実装）へ戻る       |
| MAJOR: 設計       | AC-2 が ❌（7分40秒未達成の根本的な設計問題）                      | Phase 2（設計）へ戻る       |
| MAJOR: テスト     | AC-3 が ❌（シャード変更でテストが壊れている）                     | Phase 6（テスト拡充）へ戻る |
| MAJOR: カバレッジ | AC-6 が ❌（main ブランチのカバレッジ収集が停止）                  | Phase 5（実装）へ戻る       |

### ステップ4: 既知の未解決リスクの再評価

Phase 3 で特定された既知リスクの現在状態を確認する:

#### リスク1: node_modules キャッシュサイズ超過

```bash
# 現在の node_modules サイズを確認
du -sh node_modules apps/*/node_modules packages/*/node_modules 2>/dev/null | sort -h
```

| リスク項目               | Phase 3 の判定閾値             | 現状の評価 |
| ------------------------ | ------------------------------ | ---------- |
| node_modules 合計サイズ  | 2GB 超でキャッシュ利用が逆効果 | TBD        |
| キャッシュ download 時間 | 90 秒超でキャッシュ廃止を検討  | TBD        |

#### リスク2: GitHub Free Tier 並列上限超過

```bash
# 第2波同時ジョブ数の試算
echo "test-desktop×17 + typecheck×1 + test-shared×1 + e2e×1 = 20（上限ちょうど）"
# Phase 11 の CI 実行でキューイング時間を確認する
```

| リスク項目           | Phase 3 の判定閾値           | 現状の評価 |
| -------------------- | ---------------------------- | ---------- |
| 第2波同時ジョブ数    | 20（上限ちょうど）           | TBD        |
| キューイング待機時間 | 1 分超でシャード数 16 に調整 | TBD        |

#### リスク3: CI_MAX_FORKS=3 によるメモリ圧迫

| リスク項目                  | Phase 3 の判定閾値                     | 現状の評価 |
| --------------------------- | -------------------------------------- | ---------- |
| OOM エラーの発生            | 1 件でも OOM が発生した場合は 2 に戻す | TBD        |
| test-desktop ジョブの安定性 | 全シャード PASS が継続されているか     | TBD        |

---

## 統合テスト連携

- 最終レビューで AC-3（全シャード PASS）と AC-6（カバレッジ収集継続）が「CI 品質維持の証明」として記録済み
- AC-2（7分40秒以内）は Phase 11 の実測結果で最終確認するため、Phase 10 時点では「見込み PASS」として記録

---

## サブタスク管理

| ID     | タスク名                   | ステータス |
| ------ | -------------------------- | ---------- |
| T-10-1 | AC-1〜AC-6 の最終照合      | 未実施     |
| T-10-2 | コードレビュー観点チェック | 未実施     |
| T-10-3 | PASS / MINOR / MAJOR 判定  | 未実施     |
| T-10-4 | 既知リスクの再評価         | 未実施     |

---

## 成果物

| 成果物           | 配置先                                    | 形式     |
| ---------------- | ----------------------------------------- | -------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | Markdown |
| AC 検証記録      | `outputs/phase-10/ac-verification.md`     | Markdown |

---

## 完了条件

- [ ] AC-1〜AC-6 の照合が全て実施され、判定（✅ / ❌）が記録されていること
- [ ] コードレビュー観点の全チェック項目が実施されていること
- [ ] PASS / MINOR / MAJOR 判定が確定していること
- [ ] 既知リスク3件の現状評価が `outputs/phase-10/final-review-result.md` に記録されていること
- [ ] `outputs/phase-10/final-review-result.md` に判定結果が記録されていること
- [ ] `outputs/phase-10/ac-verification.md` に AC-1〜AC-6 の証拠が記録されていること

---

## タスク100%実行確認【必須】

- [ ] T-10-1: AC-1〜AC-6 の照合を実行し `outputs/phase-10/ac-verification.md` に記録済み
- [ ] T-10-2: コードレビュー観点チェックを実行し結果を記録済み
- [ ] T-10-3: PASS / MINOR / MAJOR 判定を確定し `outputs/phase-10/final-review-result.md` に記録済み
- [ ] T-10-4: 既知リスク3件の再評価を実施し `outputs/phase-10/final-review-result.md` に記録済み

---

## 次Phase

**Phase 11: 手動テスト検証** — 実際の CI 実行を通じて改善効果（AC-2: 7分40秒以内）を計測・確認する。

**Phase 11 開始条件**: Phase 10 の判定が「PASS」または「MINOR のみ」であること。
**Phase 13 blocked 条件**: MAJOR 判定が残存している場合は PR 作成不可。
