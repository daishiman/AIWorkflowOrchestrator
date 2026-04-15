# test-web シャード化 - タスク指示書

## メタ情報

| 項目         | 内容                     |
| ------------ | ------------------------ |
| タスクID     | TASK-CI-FUTURE-002       |
| タスク名     | test-web シャード化      |
| 分類         | パフォーマンス           |
| 対象機能     | GitHub Actions CI        |
| 優先度       | 中                       |
| 見積もり規模 | 小規模                   |
| ステータス   | 未実施                   |
| 発見元       | TASK-CI-OPT-001 Phase 12 |
| 発見日       | 2026-04-15               |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-CI-OPT-001 では `test-desktop` のシャード数を 16 から 17 に増加させ、CI 実行時間を約 15 分 21 秒から 7 分 40 秒以内に削減した。この最適化の中で `test-web` ジョブを調査した結果、`test-web` は現在シャード化されておらず、単一ジョブとして逐次実行されていることが判明した。

現時点では `test-web` の実行時間は許容範囲内であるが、Webアプリケーション（`apps/web`）のテスト数増加とともに実行時間が伸び続けるリスクが存在する。`test-desktop` と同様にシャード化の準備を整えることで、将来的なスケーラビリティを確保する必要がある。

### 1.2 問題点・課題

- `test-web` が単一ジョブとして実行されているため、テスト数増加時にボトルネックとなる
- `test-desktop` はシャード化済みだが `test-web` は未対応であり、CI ジョブ間の非対称性がある
- GitHub Free Tier の並列数上限（20並列）を考慮しつつ、`test-web` にシャードを割り当てる計算が未実施である
- `apps/web/vitest.config.ts` にシャード対応の設定が含まれているか未確認である

### 1.3 放置した場合の影響

- Webテスト数の増加に伴い、`test-web` が CI パイプライン全体のボトルネックとなる
- `test-desktop` が高速化されても `test-web` が詰まることで CI 全体の実行時間が増大する
- 将来的なシャード化対応の工数が、テスト数が少ない今より大きくなる

---

## 2. 何を達成するか（What）

### 2.1 目的

`test-web` をシャード化し、テスト数増加時も CI 実行時間を現在の水準で維持できるスケーラブルな構成を確立する。

### 2.2 最終ゴール

`test-web` を 2〜4 シャードに分割し、現在の実行時間を維持しながら将来的なテスト数増加に対するスケーラビリティを確保する。シャード数は GitHub Free Tier の並列上限 20 を超えない範囲で決定する。

### 2.3 スコープ

#### 含むもの

- `.github/workflows/ci.yml` の `test-web` ジョブへの matrix シャード設定追加
- `apps/web/vitest.config.ts` へのシャード設定追加（必要な場合）
- シャード化後の動作検証（ローカルおよび CI での確認）
- GitHub Free Tier 並列上限を考慮したシャード数の計算と決定

#### 含まないもの

- `test-desktop` のシャード数変更
- E2E テスト（Playwright）のシャード化
- GitHub Actions の有料ランナーへの移行
- `apps/web` のアプリケーションコード変更

### 2.4 成果物

- `.github/workflows/ci.yml`（`test-web` ジョブのシャード設定追加済み）
- `apps/web/vitest.config.ts`（必要な場合のみシャード設定追加済み）
- 動作検証結果レポート（並列上限計算・実行時間計測を含む）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-CI-OPT-001 が完了し、`test-desktop` の 17 シャード構成が CI 上で安定稼働していること
- `.github/workflows/ci.yml` の現在のジョブ構成（`test-desktop` / `typecheck` / `test-shared` / `e2e`）の並列数を把握していること
- `apps/web` で Vitest が使用されており、`apps/web/vitest.config.ts` が存在していること
- `pnpm install` が完了していること

### 3.2 依存タスク

- TASK-CI-OPT-001（test-desktop シャード化・node_modules キャッシュ化）の完了が前提

### 3.3 必要な知識

- GitHub Actions の matrix strategy（`matrix.shard` / `--shard` オプション）
- Vitest の `--shard` オプション（例: `--shard=1/4`）
- GitHub Free Tier の並列上限（最大 20 同時実行ジョブ）
- pnpm monorepo でのフィルタコマンド構文（`pnpm --filter @repo/web test`）
- `test-desktop×N + typecheck×1 + test-shared×1 + e2e×1` の合計並列数計算

### 3.4 推奨アプローチ

#### Step 1: 現在の並列数を確認する

```bash
# ci.yml の現在のジョブ構成を確認する
grep -A 10 "strategy:" .github/workflows/ci.yml
```

現在の並列数合計を計算する:

- `test-desktop`: 17 シャード
- `typecheck`: 1 ジョブ
- `test-shared`: 1 ジョブ
- `e2e`: 1 ジョブ
- 合計: 20 ジョブ（上限ちょうど）

#### Step 2: test-web シャード数を決定する

上限 20 を超えないように `test-desktop` のシャード数を減らすか、または `test-web` シャード数を `20 - (test-desktop + typecheck + test-shared + e2e)` で計算する。

推奨計算式:

```
test-web シャード数 = 20 - (test-desktop_shards + typecheck + test-shared + e2e)
```

現在のジョブが合計 20 の場合は `test-desktop` を 15〜16 に削減して `test-web` に 2〜4 シャードを確保することを検討する。

#### Step 3: ci.yml を修正する

```yaml
issue_number: 2168
# test-web ジョブの例（シャード数 2 の場合）
test-web:
  strategy:
    matrix:
      shard: [1, 2]
  steps:
    - run: pnpm --filter @repo/web test -- --shard=${{ matrix.shard }}/2
```

#### Step 4: vitest.config.ts を確認・修正する

```bash
# apps/web/vitest.config.ts の現在の設定を確認する
cat apps/web/vitest.config.ts
```

シャード設定が CLI オプションで渡されるため、`vitest.config.ts` の修正は不要なケースが多い。ただし、`pool` や `poolOptions` の設定がシャードと競合する場合は修正が必要。

#### Step 5: 動作検証する

```bash
# ローカルでシャード実行を確認する（シャード 1/2 の場合）
pnpm --filter @repo/web test -- --shard=1/2
pnpm --filter @repo/web test -- --shard=2/2
```

---

## 4. 実行手順

### Phase 1: 現状調査

#### 目的

現在の CI 並列数と `test-web` の実行時間を把握し、シャード数の設計根拠を作成する。

#### 手順

1. `.github/workflows/ci.yml` を開き、`test-web` ジョブの現在の設定を確認する
2. 全ジョブの並列数合計を計算し、GitHub Free Tier 上限（20）との差分を確認する
3. `apps/web/vitest.config.ts` を確認し、シャード化に影響する設定を洗い出す
4. 直近の CI 実行ログから `test-web` の実行時間を計測する（GitHub Actions の UI から確認）

#### 成果物

- 並列数計算シート（テキスト形式）
- `test-web` 実行時間のベースライン計測値

#### 完了条件

- 現在の並列数合計が確認できている
- `test-web` の実行時間ベースラインが記録されている
- シャード数の候補（2〜4）が根拠とともに決定されている

---

### Phase 2: シャード数設計

#### 目的

GitHub Free Tier の上限を超えないシャード数を決定し、設計を確定する。

#### 手順

1. Phase 1 で確認した並列数合計に基づき、`test-web` に割り当て可能なシャード数を計算する
2. `test-desktop` のシャード数削減が必要な場合は調整案を作成する
3. シャード数の最終決定値を記録する

計算例:

```
現在の合計: test-desktop(17) + typecheck(1) + test-shared(1) + e2e(1) = 20
上限: 20
test-web への割り当て可能数: 0（このままでは追加できない）

対応案A: test-desktop を 15 に削減 → test-web に 2 シャード割り当て（合計: 15+2+1+1+1=20）
対応案B: test-desktop を 14 に削減 → test-web に 4 シャード割り当て（合計: 14+4+1+1+1=21 NG）
対応案B修正: test-desktop を 14 に削減 → test-web に 3 シャード割り当て（合計: 14+3+1+1+1=20）
```

4. 選択した対応案の根拠を文書化する

#### 成果物

- シャード数設計書（計算根拠・選択理由を含む）

#### 完了条件

- 並列数合計が 20 以内に収まるシャード数が決定されている
- 設計根拠が文書化されている

---

### Phase 3: 実装

#### 目的

`.github/workflows/ci.yml` と（必要に応じて）`apps/web/vitest.config.ts` を修正し、シャード化を実装する。

#### 手順

1. `.github/workflows/ci.yml` の `test-web` ジョブに matrix シャード設定を追加する

   ```yaml
   test-web:
     strategy:
       matrix:
         shard: [1, 2] # シャード数は Phase 2 の設計値に従う
     steps:
       - run: pnpm --filter @repo/web test -- --shard=${{ matrix.shard }}/2
   ```

2. `test-desktop` のシャード数を Phase 2 の設計に従い修正する（必要な場合）
3. `apps/web/vitest.config.ts` にシャード設定が必要かを確認し、必要な場合は追加する
4. 変更内容を `git diff` で確認し、意図しない変更が含まれていないことを検証する

#### 成果物

- 修正済み `.github/workflows/ci.yml`
- 修正済み `apps/web/vitest.config.ts`（変更がある場合）

#### 完了条件

- `test-web` ジョブに matrix シャード設定が追加されている
- 並列数合計が 20 以内に収まっている
- 変更が実装スコープ内に限定されている

---

### Phase 4: ローカル動作検証

#### 目的

ローカル環境でシャード実行が正常に動作することを確認する。

#### 手順

1. 各シャードを個別に実行し、テストが正常に完了することを確認する

   ```bash
   # シャード数が 2 の場合
   pnpm --filter @repo/web test -- --shard=1/2
   pnpm --filter @repo/web test -- --shard=2/2
   ```

2. 全シャードの合計テスト件数が単一実行時と一致することを確認する
3. 各シャードの実行時間を計測し、ベースラインと比較する

#### 成果物

- 各シャードの実行ログ（PASS/FAIL 件数・実行時間）

#### 完了条件

- 全シャードがエラーなく完了する
- 全シャードのテスト合計件数が単一実行時と一致する

---

### Phase 5: CI 動作検証

#### 目的

GitHub Actions 上でシャード化した `test-web` が正常に動作することを確認する。

#### 手順

1. 変更をブランチにプッシュし、PR を作成して CI を実行する
2. `test-web` ジョブが設定したシャード数に分割されて実行されることを確認する
3. 全シャードが PASS することを確認する
4. `test-web` の合計実行時間（最長シャードの時間）をベースラインと比較する
5. 全ジョブの並列数合計が 20 以内に収まっていることを CI ログから確認する

#### 成果物

- CI 実行結果レポート（シャード数・実行時間・PASS/FAIL）

#### 完了条件

- `test-web` が設定したシャード数に分割されて実行されている
- 全シャードが PASS している
- 並列数合計が 20 以内に収まっている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `.github/workflows/ci.yml` の `test-web` ジョブに matrix シャード設定が追加されている
- [ ] シャード数が `20 - (test-desktop + typecheck + test-shared + e2e)` の計算式を満たしている
- [ ] 全シャードがローカルで PASS している
- [ ] CI 上で全シャードが PASS している

### パフォーマンス要件

- [ ] シャード化後の `test-web` 最長シャード実行時間がベースラインを上回っていない
- [ ] CI 全体の並列数合計が 20 以内に収まっている

### 品質要件

- [ ] 変更がスコープ（CI 設定ファイル・vitest.config.ts）のみに限定されている
- [ ] `test-desktop` のシャード数変更を行った場合、その根拠が記録されている

### ドキュメント要件

- [ ] シャード数の計算根拠が文書化されている
- [ ] `test-web` のベースライン実行時間が記録されている

---

## 6. 検証方法

### テストケース

- Case 1: ローカルで `pnpm --filter @repo/web test -- --shard=1/N` が exit code 0 で終了する（N はシャード数）
- Case 2: 全シャードのテスト合計件数が単一実行時と一致する
- Case 3: CI 上で `test-web` ジョブが N 並列で実行される
- Case 4: CI 全体のジョブ数が 20 以内に収まっている
- Case 5: CI 上で全シャードが PASS する

### 検証コマンド

```bash
# ローカルシャード実行（シャード数 2 の場合）
pnpm --filter @repo/web test -- --shard=1/2
pnpm --filter @repo/web test -- --shard=2/2

# 現在の ci.yml のジョブ構成確認
grep -E "(shard|matrix)" .github/workflows/ci.yml

# 全テスト（シャードなし）でのベースライン計測
time pnpm --filter @repo/web test
```

---

## 7. リスクと対策

| リスク                                                       | 影響度 | 発生確率 | 対策                                                                                                                        |
| ------------------------------------------------------------ | ------ | -------- | --------------------------------------------------------------------------------------------------------------------------- |
| GitHub Free Tier の並列上限 20 を超過する                    | 高     | 高       | 実装前に必ず並列数合計を計算し、`test-desktop` シャード数の削減を先に行う                                                   |
| テストの順序依存性によりシャード化でテストが失敗する         | 中     | 低       | Vitest のデフォルト動作はシャード間でテストを分散するが、グローバル状態を持つテストが存在する場合は個別に調査・修正する     |
| `apps/web/vitest.config.ts` の設定がシャードと競合する       | 中     | 低       | `pool` / `poolOptions` の設定を事前確認し、競合する場合は設定を調整する                                                     |
| test-desktop のシャード数削減で desktop テスト時間が増加する | 中     | 中       | シャード削減前後の実行時間を計測し、TASK-CI-OPT-001 の目標時間（7 分 40 秒）を超えないことを確認する                        |
| シャード数変更で CI コストが増加する                         | 低     | 低       | GitHub Free Tier は月 2000 分の無料枠があるため、シャード化による並列実行は時間削減になるが消費分数は変わらない点を留意する |

---

## 8. 参照情報

### 関連ドキュメント

- `.github/workflows/ci.yml`（現在の CI 設定）
- `.github/actions/pnpm-install-retry/action.yml`（node_modules キャッシュ設定）
- `apps/web/vitest.config.ts`（Web アプリの Vitest 設定）
- `apps/desktop/vitest.config.ts`（Desktop の Vitest 設定、シャード化の参考）
- `docs/30-workflows/task-ci-optimization-001/`（TASK-CI-OPT-001 仕様書群）
- `docs/30-workflows/task-ci-optimization-001/outputs/phase-12/unassigned-task-detection.md`（本タスクの発見元）

### 関連タスク

- TASK-CI-OPT-001: GitHub CI 最適化（test-desktop シャード化・node_modules キャッシュ化）（本タスクの前提・親タスク）

### 参考リンク

- [Vitest シャーディングドキュメント](https://vitest.dev/guide/cli.html#shard)
- [GitHub Actions matrix strategy](https://docs.github.com/en/actions/using-jobs/using-a-matrix-for-your-jobs)

---

## 9. 備考

### 苦戦箇所【記入必須】

TASK-CI-OPT-001 から引き継いだ知見（実作業時に参照すること）:

| 症状                                                                                                  | 原因                                                                                                                  | 対応                                                                                       | 再発防止                                                                                                                     |
| ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `test-desktop` のシャード数を 16→17 に増やした際、GitHub Free Tier 上限への影響を計算する必要があった | `test-desktop×N + typecheck×1 + test-shared×1 + e2e×1` の合計が 20 を超えてはならないという制約が明示されていなかった | 全ジョブの並列数合計を計算し、上限 20 以内に収まることを確認してからシャード数を決定した   | `test-web` シャード数は `20 - (test-desktop + typecheck + test-shared + e2e)` で計算する。設計フェーズで必ず計算表を作成する |
| シャード化後にテストの一部が特定シャードでのみ失敗する可能性がある                                    | グローバル状態やファイルシステムへの書き込みを行うテストが、シャード分割後に別シャードの結果に影響する                | 各シャードを独立して実行しても同じ結果になることをローカルで確認してから CI にプッシュする | テスト作成時にグローバル状態の共有を避け、各テストが独立して実行できる設計にする                                             |

### 補足事項

- 本タスクは TASK-CI-OPT-001 Phase 12 の unassigned task detection で発見され、正式なタスクとして切り出したものである
- 現時点での `test-web` 実行時間が許容範囲内であるため優先度は「中」としているが、`apps/web` のテスト数が急増した場合は優先度を「高」に引き上げることを推奨する
- 実装着手前に TASK-CI-OPT-001 の成果物（特に `phase-2-design.md` のシャード設計・`phase-11/ci-timing-measurements.md` の計測結果）を参照し、ベースライン情報を活用すること
