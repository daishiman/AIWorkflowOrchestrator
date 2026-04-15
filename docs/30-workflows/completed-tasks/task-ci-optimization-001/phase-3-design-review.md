# Phase 3: 設計レビューゲート

## メタ情報

| 項目   | 値                       |
| ------ | ------------------------ |
| Phase  | 3                        |
| 機能名 | task-ci-optimization-001 |
| 作成日 | 2026-04-14               |

## 目的

Phase 2 で確定した設計（`pnpm-install-retry` への node_modules キャッシュ集約・シャード数 16→17・CI_MAX_FORKS 2→3）の
価値性・実現性・整合性・運用性を評価し、PASS / MINOR / MAJOR を判定して Phase 4 への進行可否を決定する。

---

## 実行タスク

- **タスク1**: 4条件評価（価値性・実現性・整合性・運用性）の実施
- **タスク2**: 既知リスクの評価と対策確認
- **タスク3**: Phase 4 進行可否の判定
- **タスク4**: MINOR 追跡テーブルの作成（指摘がある場合）
- **タスク5**: Phase 4 開始条件の明示的確定

---

## 参照資料

| 資料名                     | パス                                                                         | 説明                       |
| -------------------------- | ---------------------------------------------------------------------------- | -------------------------- |
| Phase 2 設計決定記録       | `outputs/phase-2/design-decisions.md`                                        | レビュー対象設計           |
| Phase 2 キャッシュ設計     | `outputs/phase-2/cache-design.md`                                            | cache step 設計仕様        |
| Phase 1 受入基準           | `outputs/phase-1/acceptance-criteria.md`                                     | AC-1〜AC-6 との照合        |
| CI ワークフロー            | `.github/actions/pnpm-install-retry/action.yml` / `.github/workflows/ci.yml` | 実際のジョブ構成確認       |
| Vitest 設定                | `apps/desktop/vitest.config.ts`                                              | 現状の CI_MAX_FORKS 値確認 |
| P50チェック結果            | `outputs/phase-1/p50-check-result.md`                                        | Phase 1 成果物             |
| ボトルネック分析           | `outputs/phase-1/bottleneck-analysis.md`                                     | Phase 1 成果物             |
| バリデーションマトリックス | `outputs/phase-2/validation-matrix.md`                                       | Phase 2 成果物             |

---

## 実行手順

### ステップ1: 4条件評価

```bash
# 1. GitHub Actions キャッシュ API の利用状況を確認
gh api /repos/{owner}/{repo}/actions/caches --jq '.actions_caches[] | {key: .key, size_in_bytes: .size_in_bytes}' 2>/dev/null || echo "キャッシュなし（初回）"

# 2. 現在の ci.yml ジョブ構成（ジョブ数・並列数）を確認
grep -c "^\s\{2\}[a-z]" .github/workflows/ci.yml

# 3. 第2波ジョブの needs 依存を確認（並列上限チェック用）
grep -B2 -A10 "test-desktop:" .github/workflows/ci.yml | head -40

# 4. GitHub Free Tier の並列上限を考慮したジョブ数カウント
grep -n "shard:" .github/workflows/ci.yml
```

#### 評価1: 価値性

| 評価項目                         | 評価結果 | 根拠                                                       |
| -------------------------------- | -------- | ---------------------------------------------------------- |
| CI 実行時間削減効果は十分か      | TBD      | node_modules キャッシュで ~2〜3min、シャード最適化で ~1min |
| 全テスト品質が維持されるか       | TBD      | テストロジック変更なし。シャード数変更のみ                 |
| 開発フィードバックループへの貢献 | TBD      | 15分→7分40秒以内 = CI 待機時間 50%削減                     |

**判定基準**: 3項目すべて「問題なし」でなければ MAJOR

#### 評価2: 実現性

| 評価項目                                   | 評価結果 | 根拠                                                             |
| ------------------------------------------ | -------- | ---------------------------------------------------------------- |
| actions/cache@v4 の使用が可能か            | TBD      | GitHub Actions Marketplace で公式サポート済み                    |
| pnpm monorepo の node_modules パスが正確か | TBD      | `node_modules`, `apps/*/node_modules`, `packages/*/node_modules` |
| vitest --shard=N/17 の構文が正しいか       | TBD      | Vitest 公式ドキュメントで確認                                    |
| CI_MAX_FORKS=3 が vitest で有効か          | TBD      | `apps/desktop/vitest.config.ts` の env 参照ロジック確認          |

```bash
# CI_MAX_FORKS の参照箇所を確認
grep -n "CI_MAX_FORKS\|process\.env" apps/desktop/vitest.config.ts

# Vitest の shard オプション現在の記述確認
grep -n "shard\|/16\|/17" .github/workflows/ci.yml
```

**判定基準**: 技術的に実現不可能な項目があれば MAJOR

#### 評価3: 整合性

| 評価項目                                                                                                                              | 評価結果 | 根拠                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------- |
| キャッシュキー（pnpm-lock.yaml hash）が適切か                                                                                         | TBD      | ロックファイル変更時の自動無効化が保証される                   |
| シャード数 17 が GitHub Free Tier 上限内か                                                                                            | TBD      | 上限 20 に対してシャード 17 + 他ジョブの同時数でちょうど収まる |
| CI_MAX_FORKS=3 が 7GB ランナーメモリ範囲内か                                                                                          | TBD      | 推定 ~1.2〜1.6GB（7GB に対して余裕あり）                       |
| 変更スコープが `.github/actions/pnpm-install-retry/action.yml` / `.github/workflows/ci.yml` / `apps/desktop/vitest.config.ts` の3件か | TBD      | Phase 2 設計での変更ファイル一覧と照合                         |
| 既存の `cache: "pnpm"` 設定と新キャッシュが競合しないか                                                                               | TBD      | `cache: "pnpm"` はストアキャッシュ。node_modules とは別        |

```bash
# 既存の cache: "pnpm" 設定と新キャッシュの競合確認
grep -n -A5 "cache:.*pnpm\|setup-node" .github/workflows/ci.yml | head -30
```

**判定基準**: 整合性に問題がある項目があれば MINOR または MAJOR

#### 評価4: 運用性

| 評価項目                                                | 評価結果 | 根拠                                                                    |
| ------------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| キャッシュ miss 時（初回・lock 変更後）も正常動作するか | TBD      | `if: steps.cache-node-modules.outputs.cache-hit != 'true'` で fallback  |
| キャッシュサイズが GitHub 上限（10GB）を超えないか      | TBD      | node_modules 合計 ~500MB〜1GB。現在の pnpm ストアキャッシュ含めても余裕 |
| 将来のシャード数追加変更が容易か                        | TBD      | matrix の shard 配列変更のみで対応可能                                  |
| ELECTRON_SKIP_BINARY_DOWNLOAD 設定が維持されるか        | TBD      | 既存設定を変更しないため影響なし                                        |

**判定基準**: 運用上の問題が修正コスト高の場合は MAJOR

---

### ステップ2: 既知リスクの評価と対策

#### リスク1: node_modules キャッシュが大きすぎる場合

| 項目       | 内容                                                                                                           |
| ---------- | -------------------------------------------------------------------------------------------------------------- |
| リスク内容 | node_modules の合計サイズが想定（~1GB）を超え、キャッシュの upload/download に時間がかかる                     |
| 発生条件   | node_modules 合計が 2GB 超の場合、キャッシュ利用でも install よりも遅くなる可能性                              |
| 対策       | `restore-keys` フォールバックを設定し、キャッシュ miss 時は通常の `pnpm install` に fallback                   |
| 測定方法   | 初回 CI 実行のキャッシュ upload 時間を確認（`actions/cache` のログで確認）                                     |
| 判定閾値   | キャッシュ download 時間が 90 秒を超えた場合は node_modules キャッシュを廃止し pnpm ストアキャッシュのみに戻す |

```bash
# 現在の node_modules サイズを概算（ローカルで確認）
du -sh node_modules apps/*/node_modules packages/*/node_modules 2>/dev/null | sort -h
```

#### リスク2: シャード数 17 で GitHub Free Tier 並列上限に到達

| 項目       | 内容                                                                                    |
| ---------- | --------------------------------------------------------------------------------------- |
| リスク内容 | シャード 17 + typecheck + test-shared + e2e が同時起動し、20 並列上限にちょうど到達する |
| 発生条件   | 第2波ジョブが全て同時に起動した場合（`needs: [build-shared]` 完了後）                   |
| 対策       | 第2波の同時起動ジョブ数をカウントし、queueing が発生する場合はシャード数を 16 に戻す    |
| 測定方法   | CI 実行後に `gh run view` でジョブのキューイング時間を確認                              |
| 判定閾値   | キューイング待機が 1 分を超えた場合はシャード数を 16 に調整                             |

```bash
# 第2波の同時ジョブ数を試算
# test-desktop × 17 + typecheck(1) + test-shared(1) + e2e(1) = 20 ジョブ
# → 20 上限ちょうど（MINOR 判定候補）
echo "第2波同時ジョブ数試算: test-desktop×17 + typecheck×1 + test-shared×1 + e2e×1 = 20"
echo "GitHub Free Tier 上限: 20"
echo "超過数: 0（上限ちょうど）"
```

**MINOR 判定候補**: 17 シャードで上限ちょうどのため、queueing が観測された場合のみ 16 に戻す選択肢を検討

#### リスク3: CI_MAX_FORKS=3 によるメモリ圧迫

| 項目       | 内容                                                                                          |
| ---------- | --------------------------------------------------------------------------------------------- |
| リスク内容 | CI_MAX_FORKS を 2→3 に増やすことで、ランナーのメモリ（7GB）を超過する可能性                   |
| 発生条件   | Electron テストプロセスが 1プロセスあたり 400MB 超のメモリを使用した場合                      |
| 対策       | CI 実行後に `gh run view --log` でプロセスのメモリ使用量を確認。OOM が発生した場合は 2 に戻す |
| 測定方法   | CI ログの `Killed` または OOM エラーを監視                                                    |
| 判定閾値   | test-desktop ジョブで OOM が 1 件でも発生した場合は CI_MAX_FORKS を 2 に戻す                  |

---

### ステップ3: PASS / MINOR / MAJOR 判定

#### 判定基準

| 判定  | 条件                                                   |
| ----- | ------------------------------------------------------ |
| PASS  | 全チェック項目が問題なし。Phase 4 へ進める             |
| MINOR | 軽微な指摘あり。Phase 5 以降で解決予定。Phase 4 継続可 |
| MAJOR | 設計の根本的問題あり。Phase 2（または Phase 1）へ戻る  |

#### チェックリスト

**価値性**:

- [ ] CI 実行時間の削減効果が受入基準 AC-2（7分40秒以内）を達成する見込みであること
- [ ] 全テスト品質（AC-3）が維持される設計であること

**実現性**:

- [ ] `actions/cache@v4` の path 設定がモノレポ構成と整合していること
- [ ] `vitest --shard=N/17` の構文が Vitest で有効であること
- [ ] `CI_MAX_FORKS` 環境変数が `vitest.config.ts` で正しく参照されていること

**整合性**:

- [ ] キャッシュキー（`hashFiles('pnpm-lock.yaml')`）が AC-1 の要件を満たすこと
- [ ] 既存の `cache: "pnpm"`（pnpm ストアキャッシュ）と node_modules キャッシュが競合しないこと
- [ ] GitHub Free Tier 並列上限（20）内に収まること（MINOR 候補）

**運用性**:

- [ ] キャッシュ miss 時の fallback（条件付き `pnpm install`）が設計されていること
- [ ] キャッシュサイズが GitHub 上限（10GB/リポジトリ）の範囲内であること
- [ ] リスク1〜3 の対策と判定閾値が文書化されていること

#### MINOR 追跡テーブル

Phase 3 で MINOR 判定された指摘を追跡する（指摘がある場合のみ記入）:

| MINOR ID | 指摘内容                                       | 解決予定 Phase | 解決確認 Phase | 備考                                                                                         |
| -------- | ---------------------------------------------- | -------------- | -------------- | -------------------------------------------------------------------------------------------- |
| CI-M-01  | シャード数 17 で並列上限（20）に到達する可能性 | Phase 4        | Phase 4        | ✅ 解決済み（TASK-CI-FUTURE-005: 実測最大 59秒 ≤ 60秒。シャード数 17 継続決定 / 2026-04-15） |
| CI-M-02  | （指摘がある場合に記入）                       | -              | -              | -                                                                                            |

---

### ステップ4: simpler alternative の検討

より単純な代替案を検討し、採用しない理由を記録する:

| 代替案                                       | 検討結果                                                                 |
| -------------------------------------------- | ------------------------------------------------------------------------ |
| `cache: "pnpm"` のみで十分（既存設定の活用） | 否定: pnpm ストアキャッシュは `node_modules` の install 自体を省略しない |
| setup job パターンでキャッシュを1回作成      | 否定: 既存ジョブ構造の大幅変更が必要。変更コストが高い                   |
| シャード数を 12〜14 に減らして安全側に振る   | 否定: 並列化メリットを損なう。Free Tier 上限の活用が不十分               |
| CI_MAX_FORKS を 4 以上にする                 | 否定: メモリリスクが高まる。3 がバランスポイント                         |

---

## レビュー判定（記入欄）

```
判定: [ PASS / MINOR / MAJOR ]（Phase 3 実施時に記入）

判定理由:

Phase 4 開始条件: [ 満たす / 満たさない ]
```

---

## サブタスク管理

| ID     | タスク名                   | ステータス |
| ------ | -------------------------- | ---------- |
| T-03-1 | 4条件評価の実施            | 未実施     |
| T-03-2 | 既知リスクの評価・対策確認 | 未実施     |
| T-03-3 | Phase 4 進行可否の判定     | 未実施     |
| T-03-4 | MINOR 追跡テーブル作成     | 未実施     |
| T-03-5 | Phase 4 開始条件の明示確定 | 未実施     |

---

## 成果物

| 成果物             | 配置先                                    | 形式     |
| ------------------ | ----------------------------------------- | -------- |
| 設計レビュー結果   | `outputs/phase-3/design-review-result.md` | Markdown |
| リスク評価シート   | `outputs/phase-3/risk-assessment.md`      | Markdown |
| MINOR 追跡テーブル | `outputs/phase-3/minor-tracking.md`       | Markdown |

---

## 完了条件

- [ ] 4条件評価（価値性・実現性・整合性・運用性）が全項目チェック済みであること
- [ ] 既知リスク3件（キャッシュサイズ・並列上限・メモリ圧迫）の対策と閾値が文書化されていること
- [ ] レビュー判定（PASS/MINOR/MAJOR）が確定していること
- [ ] Phase 4 開始条件（「PASS」または「MINOR のみ」）の可否が明示的に確定していること
- [ ] `outputs/phase-3/` に全成果物が生成されていること

---

## タスク100%実行確認【必須】

- [ ] T-03-1: 4条件評価を実施し `outputs/phase-3/design-review-result.md` に全項目記録済み
- [ ] T-03-2: リスク1〜3 の評価と対策を `outputs/phase-3/risk-assessment.md` に記録済み
- [ ] T-03-3: レビュー判定（PASS/MINOR/MAJOR）を `outputs/phase-3/design-review-result.md` に明示的に記録済み
- [ ] T-03-4: MINOR 追跡テーブルを `outputs/phase-3/minor-tracking.md` に記録済み（指摘なしの場合は「なし」と記録）
- [ ] T-03-5: Phase 4 開始条件を明示的に確定済み（「PASS: Phase 4 へ進む」または「MAJOR: Phase 2 へ戻る」）

---

## 次Phase

**Phase 4: 実装** — `.github/actions/pnpm-install-retry/action.yml`、`.github/workflows/ci.yml`、`apps/desktop/vitest.config.ts` の実際の変更を行う。

**Phase 4 開始条件**: 本 Phase のレビュー判定が「PASS」または「MINOR のみ」であること。
**Phase 4 blocked 条件**: MAJOR 判定が残存している場合は実装に進まず Phase 2 へ戻ること。
**Phase 1〜3 ゲート**: Phase 1・Phase 2・Phase 3 の全完了条件を満たさない限り、Phase 4 以降に進まないこと。
