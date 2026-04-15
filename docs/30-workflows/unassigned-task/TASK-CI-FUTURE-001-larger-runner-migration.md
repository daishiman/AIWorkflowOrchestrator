# GitHub Actions Larger ランナーへの移行 - タスク指示書

## メタ情報

| 項目         | 内容                                   |
| ------------ | -------------------------------------- |
| タスクID     | TASK-CI-FUTURE-001                     |
| タスク名     | GitHub Actions Larger ランナーへの移行 |
| 分類         | パフォーマンス                         |
| 対象機能     | GitHub Actions CI                      |
| 優先度       | 低                                     |
| 見積もり規模 | 中規模                                 |
| ステータス   | 未実施                                 |
| 発見元       | TASK-CI-OPT-001 Phase 12               |
| 発見日       | 2026-04-15                             |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-CI-OPT-001 では以下の最適化を実施し、CI 実行時間を約 7 分 40 秒に削減した。

- `actions/cache@v4` による `node_modules` キャッシュの導入（`.github/actions/pnpm-install-retry/action.yml`）
- テストシャード数の 16 → 17 への変更（`.github/workflows/ci.yml`）
- `CI_MAX_FORKS` の 2 → 3 への変更（`apps/desktop/vitest.config.ts`）

しかし、GitHub Free Tier が提供するランナーは 2-core / 7GB RAM の制約があり、これ以上の並列度向上には限界がある。

GitHub が提供する Larger ランナー（4-core / 16GB RAM）を利用すれば、`CI_MAX_FORKS` をさらに増やし、テスト並列度と実行速度をさらに向上させることができる。

### 1.2 問題点・課題

- GitHub Free Tier の 2-core / 7GB ランナーでは `CI_MAX_FORKS=3` が上限であり、それ以上増やすと OOM（メモリ不足）リスクがある
- 現状の CI 実行時間（約 7 分 40 秒）は、5 分以内という理想目標に対してまだ余地がある
- Free Tier ランナーの制約により、追加の並列化やシャード数増加による改善余地が限定される

### 1.3 放置した場合の影響

- テスト並列度の向上が有料プランなしでは不可能なため、CI 実行時間の改善余地が実質的に失われる
- CI 実行時間が 5 分以内という目標を達成できず、開発フィードバックサイクルが長くなり続ける
- 将来的にテスト数が増加した場合、CI 実行時間がさらに延長するリスクがある

---

## 2. 何を達成するか（What）

### 2.1 目的

GitHub Larger ランナーへの移行により、テスト並列度と実行速度をさらに向上させ、CI 実行時間を 5 分以内に削減する。

### 2.2 最終ゴール

1. `.github/workflows/ci.yml` のランナー指定を GitHub Larger ランナー（4-core 以上）に変更する
2. `CI_MAX_FORKS` を 4 以上に設定し、OOM なしで安定動作することを確認する
3. CI 実行時間が P50 で 5 分以内になることを計測・記録する
4. コスト評価レポートにより、有料ランナー利用のコストと効果を定量的に把握する

### 2.3 スコープ

#### 含むもの

- `.github/workflows/ci.yml` のランナー指定を Larger ランナーに変更する
- `CI_MAX_FORKS` の最適値調査と設定（`apps/desktop/vitest.config.ts`）
- コスト評価レポートの作成（実行時間短縮 vs 追加コストの費用対効果）

#### 含まないもの

- セルフホストランナーの構築・管理
- CI アーキテクチャの変更（ワークフロー構成・シャード設計の抜本的な見直し）
- アプリケーションコードの変更

### 2.4 成果物

| 成果物                      | 説明                                                       |
| --------------------------- | ---------------------------------------------------------- |
| 変更済み `ci.yml`           | Larger ランナー指定に更新されたワークフローファイル        |
| 変更済み `vitest.config.ts` | 最適化された `CI_MAX_FORKS` 値が設定されたファイル         |
| コスト評価レポート          | ランナーコスト・実行時間短縮・費用対効果をまとめたレポート |
| CI 実行時間計測結果         | 変更前後の P50 実行時間の比較記録                          |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- GitHub リポジトリが Larger ランナーを利用できるプラン（GitHub Team 以上または GitHub Enterprise）に加入していること
- 組織またはリポジトリレベルで Larger ランナーが有効化されていること
- 現在の CI 設定（TASK-CI-OPT-001 実施後の状態）が安定稼働していること

### 3.2 依存タスク

| タスクID        | 依存種別 | 説明                                                            |
| --------------- | -------- | --------------------------------------------------------------- |
| TASK-CI-OPT-001 | 前提完了 | node_modules キャッシュ・シャード 17・CI_MAX_FORKS=3 最適化済み |

### 3.3 必要な知識

- GitHub Actions のランナー指定方法（`runs-on` の Larger ランナー識別子）
- GitHub Larger ランナーの種類とスペック（4-core / 8-core / 16GB / 32GB 等）
- `CI_MAX_FORKS` と vCPU 数の関係（最適な並列度の計算）
- GitHub Actions のコスト計算方法（分単位課金・ランナー種別係数）

### 3.4 推奨アプローチ

以下の順序で実行する。

**Step 1: Larger ランナーの利用可否確認**

GitHub リポジトリの設定（Settings > Actions > Runners）で Larger ランナーが使用可能な状態かを確認する。

**Step 2: コスト事前試算**

```
GitHub 4-core ランナーのコスト係数 = 通常ランナーの2倍
現在の月間 CI 実行時間（分）× コスト係数 = 追加コスト概算
```

**Step 3: ci.yml の段階的変更**

まず単一ジョブで Larger ランナーをテストし、問題がなければ全ジョブに展開する。

```yaml
issue_number: 2167
# 変更例（runs-on の指定変更）
runs-on: ubuntu-latest-4-core # Larger ランナー識別子（要確認）
```

**Step 4: CI_MAX_FORKS の最適値調査**

4-core ランナーに対して `CI_MAX_FORKS=4` から段階的に増やし、OOM が発生しない最大値を特定する。

**Step 5: 効果計測**

5 回以上の CI 実行結果から P50 実行時間を計測し、変更前（約 7 分 40 秒）と比較する。

---

## 4. 実行手順

### Phase 1: 事前調査とコスト評価

#### 目的

Larger ランナーの利用可否・スペック・コストを調査し、移行判断の材料を整える。

#### 手順

1. GitHub リポジトリの Settings > Actions > Runners でランナー一覧を確認する
2. [GitHub ドキュメント](https://docs.github.com/en/actions/using-github-hosted-runners/about-larger-runners) でランナー種別・スペック・コスト係数を確認する
3. 月間の CI 実行頻度・実行時間を GitHub Actions の使用量レポートから取得する
4. 費用対効果の計算式でコスト概算を算出する
   - `現状の月間 CI 時間（分）× 2（コスト係数）× 単価` vs `開発者の待機時間削減効果`
5. コスト評価レポート（`cost-evaluation.md`）を作成する

#### 成果物

- `cost-evaluation.md`（コスト事前試算・費用対効果の分析）

#### 完了条件

- Larger ランナーの利用可否が確認されている
- コスト概算が算出されている
- 移行判断（Go / No-Go）が記録されている

---

### Phase 2: ランナー設定変更（試験的適用）

#### 目的

単一ジョブで Larger ランナーを試験的に適用し、動作を検証する。

#### 手順

1. `.github/workflows/ci.yml` の `test-desktop` ジョブのみ `runs-on` を Larger ランナーに変更する
2. CI を手動トリガー（`workflow_dispatch`）で実行し、ジョブが正常に起動することを確認する
3. OOM が発生しないことを確認する
4. 実行時間を記録する

#### 成果物

- 変更済み `.github/workflows/ci.yml`（試験的変更）
- CI 実行ログとタイミング記録

#### 完了条件

- Larger ランナーでジョブが正常完了する
- OOM エラーが発生しない
- 実行時間が記録されている

---

### Phase 3: CI_MAX_FORKS 最適値の調査

#### 目的

4-core ランナーに最適な `CI_MAX_FORKS` の値を特定する。

#### 手順

1. `apps/desktop/vitest.config.ts` の `CI_MAX_FORKS` を 4 に変更して CI を実行する
2. OOM が発生しないことを確認する
3. OOM が発生しない場合は 5 以上も試し、上限値を特定する
4. 実行時間と安定性のバランスが最も良い値を最適値として決定する

#### 成果物

- `ci-max-forks-evaluation.md`（各フォーク数の実行結果比較表）
- 変更済み `apps/desktop/vitest.config.ts`

#### 完了条件

- OOM が発生しない最大の `CI_MAX_FORKS` 値が特定されている
- 最適値での CI 実行が安定している（3 回以上連続成功）

---

### Phase 4: 全ジョブへの展開

#### 目的

試験的適用の結果を踏まえ、全ジョブを Larger ランナーに移行する。

#### 手順

1. `.github/workflows/ci.yml` の全ジョブの `runs-on` を Larger ランナーに変更する
2. CI を実行し、全ジョブが正常完了することを確認する
3. 5 回以上の CI 実行結果から P50 実行時間を計測する

#### 成果物

- 変更済み `.github/workflows/ci.yml`（全ジョブ展開）
- P50 実行時間の計測記録

#### 完了条件

- 全ジョブが Larger ランナーで正常完了する
- P50 実行時間が 5 分以内を達成している

---

### Phase 5: 効果検証とドキュメント更新

#### 目的

変更前後の効果を定量的に記録し、ドキュメントを更新する。

#### 手順

1. 変更前後の実行時間比較表を作成する（ベースライン: 約 7 分 40 秒 vs 達成値）
2. 実際のコスト増分を確認し、コスト評価レポートを最終化する
3. `docs/30-workflows/task-ci-optimization-001/` の関連ドキュメントを更新する

#### 成果物

- 最終コスト評価レポート（実績値込み）
- 実行時間比較ドキュメント

#### 完了条件

- 変更前後の効果が定量的に記録されている
- コスト評価レポートに実績値が記録されている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `.github/workflows/ci.yml` の全ジョブが Larger ランナー（4-core 以上）で実行される
- [ ] `CI_MAX_FORKS` が 4 以上に設定され、OOM なしで安定動作する
- [ ] CI P50 実行時間が 5 分以内を達成している

### 品質要件

- [ ] 全テストが Larger ランナーで PASS している
- [ ] OOM エラーが 3 回連続の CI 実行で一度も発生しない
- [ ] キャッシュ（node_modules）が Larger ランナーでも正常にヒットする

### ドキュメント要件

- [ ] コスト評価レポートに事前試算と実績値が両方記録されている
- [ ] P50 実行時間の変更前後の比較が記録されている
- [ ] `CI_MAX_FORKS` の最適値の選定根拠が記録されている

---

## 6. 検証方法

### テストケース

| Case | 検証内容                                   | 期待結果                    |
| ---- | ------------------------------------------ | --------------------------- |
| C-1  | CI を 5 回実行し P50 実行時間を計測する    | 5 分以内                    |
| C-2  | `CI_MAX_FORKS` を設定値で 3 回連続 CI 実行 | OOM エラーなし              |
| C-3  | node_modules キャッシュのヒット確認        | キャッシュヒット率 90% 以上 |
| C-4  | 全テストの PASS 確認                       | テストスイート全件 PASS     |

### 検証コマンド

```bash
# CI 手動トリガー（GitHub CLI）
gh workflow run ci.yml

# 直近の CI 実行時間を確認
gh run list --workflow=ci.yml --limit=10

# 特定の実行の詳細確認
gh run view <run-id> --log
```

---

## 7. リスクと対策

| リスク                                           | 影響度 | 発生確率 | 対策                                                                                             |
| ------------------------------------------------ | ------ | -------- | ------------------------------------------------------------------------------------------------ |
| Larger ランナーの識別子が組織設定と異なる        | 高     | 中       | GitHub ドキュメントとリポジトリ設定を事前確認し、試験的適用で検証してから全展開する              |
| コストが予算超過する                             | 高     | 低       | Phase 1 のコスト評価を必ず実施し、Go / No-Go 判断を経てから Phase 2 以降に進む                   |
| `CI_MAX_FORKS` 増加による OOM                    | 高     | 中       | Phase 3 で段階的に増やし、安定動作を確認してから本番適用する                                     |
| キャッシュキーが Larger ランナーで異なる         | 中     | 低       | `runner.os` ベースのキャッシュキーのため影響は少ないが、初回はキャッシュミスとなることを許容する |
| Free Tier に戻す必要が生じたときの切り戻しコスト | 中     | 低       | `runs-on` の変更のみのため、元の値への差し戻しは容易（1 コミットで完了）                         |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/task-ci-optimization-001/` — TASK-CI-OPT-001 の仕様書群（ベースライン確認元）
- `docs/30-workflows/task-ci-optimization-001/outputs/phase-12/unassigned-task-detection.md` — 本タスクの発見元
- `.github/workflows/ci.yml` — ランナー変更対象のワークフローファイル
- `.github/actions/pnpm-install-retry/action.yml` — node_modules キャッシュ設定
- `apps/desktop/vitest.config.ts` — `CI_MAX_FORKS` 設定ファイル

### 関連タスク

| タスクID        | 関係               | 説明                                                          |
| --------------- | ------------------ | ------------------------------------------------------------- |
| TASK-CI-OPT-001 | 前提タスク（完了） | node_modules キャッシュ・シャード 17・CI_MAX_FORKS=3 の最適化 |

### 外部参照

- [GitHub: About larger runners](https://docs.github.com/en/actions/using-github-hosted-runners/about-larger-runners)
- [GitHub: Billing for GitHub Actions](https://docs.github.com/en/billing/managing-billing-for-github-actions/about-billing-for-github-actions)
- [GitHub: Using larger runners](https://docs.github.com/en/actions/using-github-hosted-runners/using-larger-runners)

---

## 9. 備考

### 苦戦箇所【記入必須】

TASK-CI-OPT-001 から引き継ぐ知見を以下に記録する。

| 項目     | 内容                                                                                        |
| -------- | ------------------------------------------------------------------------------------------- |
| 症状     | GitHub Free Tier で `CI_MAX_FORKS=4` 以上に設定すると OOM が発生する                        |
| 原因     | 2-core / 7GB ランナーではメモリ制約が厳しく、並列テストプロセスがメモリを使い切る           |
| 対応     | TASK-CI-OPT-001 では `CI_MAX_FORKS=3` に留め、Larger ランナー移行を将来タスクとして分離した |
| 再発防止 | 有料プランの予算確保後に本タスクを実施する。予算確保前に `CI_MAX_FORKS` を増やさないこと    |

### 実施タイミングについて

本タスクは GitHub 有料プラン（Team 以上）への加入が前提となる。予算確保のタイミングで本タスクを優先度「中」に昇格させること。

### 代替案

Larger ランナーへの移行が困難な場合、以下の代替案を検討する。

1. **セルフホストランナーの構築**（スコープ外だが最もコスト効率が高い可能性がある）
2. **`test-web` のシャード化**（現状 `test-desktop` のみシャード化されている）
3. **キャッシュヒット率の向上**（ロックファイル変更時の再インストール最適化）
