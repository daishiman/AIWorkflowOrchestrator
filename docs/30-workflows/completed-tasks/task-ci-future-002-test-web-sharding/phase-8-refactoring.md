# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 8                                       |
| タスクID   | TASK-CI-FUTURE-002                      |
| 機能名     | test-web-sharding                       |
| タスク名   | test-web シャード化                     |
| 前提Phase  | Phase 7（カバレッジ確認・完了後に着手） |
| 後続Phase  | Phase 9                                 |
| 作成日     | 2026-04-15                              |
| ステータス | pending                                 |

---

## 目的

Phase 5 で実装した `test-web` シャード化の CI 設定（`.github/workflows/ci.yml`）を
リファクタリングし、可読性向上・重複排除・コメント整備・`test-desktop` との設定対称性確保を行う。
機能変更は行わない（リファクタリングのみ）。

---

## 背景

`test-web` のシャード化実装は CI 設定ファイル（`.github/workflows/ci.yml`）への変更のみで完結する。
リファクタリングの対象は以下の観点で整理する:

- シャード設定コメントが `test-desktop` と `test-web` で記述スタイルが統一されているか
- シャード数の計算根拠コメントが記録されているか
- 将来的なシャード数変更時に一箇所修正で完結できるか
- `test-desktop` と `test-web` の matrix 設定が対称的な形式になっているか

---

## 実行タスク

- **タスク1**: `ci.yml` の `test-desktop` と `test-web` の matrix 設定の対称性確認
- **タスク2**: シャード数の計算根拠コメントを `ci.yml` に追加
- **タスク3**: `test-web` シャード設定の重複・冗長箇所を整理
- **タスク4**: Before/After テーブルで変更内容を記録
- **タスク5**: リファクタ後の YAML 構文確認

---

## 参照資料

| 資料名                  | パス                                                                                | 説明               |
| ----------------------- | ----------------------------------------------------------------------------------- | ------------------ |
| タスク指示書            | `docs/30-workflows/unassigned-task/TASK-CI-FUTURE-002-test-web-sharding.md`         | タスク全体仕様     |
| Phase 2 設計書          | `outputs/phase-2/shard-design.md`                                                   | シャード数設計根拠 |
| Phase 5 実装結果        | `outputs/phase-5/implementation-result.md`                                          | 実装内容の確認     |
| Phase 7 計測レポート    | `outputs/phase-7/coverage-report.md`                                                | PASS 判定確認      |
| CI ワークフロー         | `.github/workflows/ci.yml`                                                          | リファクタ対象     |
| TASK-CI-OPT-001 Phase 8 | `docs/30-workflows/completed-tasks/task-ci-optimization-001/phase-8-refactoring.md` | 参考フォーマット   |

---

## 実行手順

### ステップ1: `test-desktop` と `test-web` の matrix 設定対称性確認

```bash
# test-desktop の matrix 設定を確認
grep -A 20 "test-desktop:" .github/workflows/ci.yml | grep -A 10 "strategy:"

# test-web の matrix 設定を確認
grep -A 20 "test-web:" .github/workflows/ci.yml | grep -A 10 "strategy:"

# 両ジョブの shard 設定を並べて確認
grep -n "shard\|matrix" .github/workflows/ci.yml
```

**対称性チェックリスト**:

| 確認項目                                       | test-desktop | test-web | 対称性 |
| ---------------------------------------------- | ------------ | -------- | ------ |
| `strategy.matrix.shard` の形式（配列形式）     | TBD          | TBD      | TBD    |
| `--shard=${{ matrix.shard }}/N` の記述スタイル | TBD          | TBD      | TBD    |
| `strategy.fail-fast` の設定                    | TBD          | TBD      | TBD    |
| タイムアウト設定（`timeout-minutes`）          | TBD          | TBD      | TBD    |
| コメント記述スタイル                           | TBD          | TBD      | TBD    |

対称性が取れていない箇所は修正対象として記録する。

### ステップ2: シャード数計算根拠コメントの追加

Phase 2 で確定したシャード数の計算根拠を `ci.yml` に明示的に記録する。

**追加するコメントの例**:

```yaml
# test-web シャード化 (TASK-CI-FUTURE-002):
# GitHub Free Tier 並列上限 20 の内訳:
#   test-desktop: N シャード
#   test-web:     M シャード  ← 本ジョブ
#   typecheck:    1 ジョブ
#   test-shared:  1 ジョブ
#   e2e-desktop:  1 ジョブ
#   合計:         20 ジョブ（上限 = 20）
# シャード数変更時は上記合計が 20 以内に収まることを確認すること。
test-web:
  strategy:
    matrix:
      shard: [1, 2] # 計算根拠: 20 - (N + 1 + 1 + 1) = M
```

### ステップ3: 重複・冗長箇所の整理

```bash
# test-web ジョブ内の重複設定を確認
grep -B5 -A30 "test-web:" .github/workflows/ci.yml

# test-desktop と共通化できる設定がないか確認
diff <(grep -A30 "test-desktop:" .github/workflows/ci.yml) \
     <(grep -A30 "test-web:" .github/workflows/ci.yml) || true
```

**整理観点**:

- `env` セクションの重複（`CI: true` 等）
- `steps` の重複（checkout・pnpm install 等）が重複なく再利用されているか
- ジョブ間で共通化できる設定が `defaults` や composite action に委譲されているか

### ステップ4: Before/After テーブルの記録

以下のテーブルを `outputs/phase-8/refactoring-result.md` に記録する:

| 対象                         | Before（変更前）                      | After（変更後）                       | 理由                                 |
| ---------------------------- | ------------------------------------- | ------------------------------------- | ------------------------------------ |
| `ci.yml` `test-web` ジョブ   | シャード数計算根拠コメントなし        | 並列数合計の計算根拠コメントを追加    | 将来のシャード数変更時の誤変更を防ぐ |
| `ci.yml` matrix 記述スタイル | `test-desktop` と `test-web` で非対称 | 両ジョブで同一スタイルに統一          | CI 設定の一貫性・可読性向上          |
| `ci.yml` `test-web` コメント | 最適化意図のコメントなし              | TASK-CI-FUTURE-002 参照コメントを追加 | 変更履歴の追跡可能性確保             |
| 実装ロジック                 | 変更なし                              | 変更なし                              | リファクタリングのみ（機能変更禁止） |

リファクタリングが不要な項目は「変更なし」として明示する。

### ステップ5: リファクタ後の YAML 構文確認

```bash
# YAML 構文チェック（Python yaml モジュール使用）
python3 -c "
import yaml
with open('.github/workflows/ci.yml') as f:
    yaml.safe_load(f)
print('YAML syntax OK')
"

# actionlint が利用可能な場合
actionlint .github/workflows/ci.yml 2>/dev/null || echo "actionlint 未インストール（Phase 9 で実施）"

# シャード数が変わっていないことを確認
grep -n "shard" .github/workflows/ci.yml
```

---

## 統合テスト連携

| 判定項目                                      | 基準                      | 結果    |
| --------------------------------------------- | ------------------------- | ------- |
| リファクタ後の YAML 構文                      | エラー 0 件               | pending |
| `test-desktop` と `test-web` の matrix 対称性 | 同一スタイル              | pending |
| シャード数（機能的変更なし）                  | Phase 5 実装値と一致      | pending |
| 並列数合計（機能的変更なし）                  | 20 以内・Phase 5 値と一致 | pending |

---

## 多角的チェック観点

| 観点     | 確認内容                                                              |
| -------- | --------------------------------------------------------------------- |
| 矛盾     | リファクタ後の設定が Phase 2 設計書のシャード数と矛盾していないか     |
| 漏れ     | `test-desktop` に追加されたコメントが `test-web` に漏れていないか     |
| 整合性   | `test-desktop` と `test-web` の matrix 記述スタイルが統一されているか |
| 依存関係 | リファクタが Phase 9 の品質保証チェック項目に影響しないか             |

---

## サブタスク管理

| ID     | タスク名                                  | ステータス |
| ------ | ----------------------------------------- | ---------- |
| T-08-1 | `test-desktop` と `test-web` の対称性確認 | 未実施     |
| T-08-2 | シャード数計算根拠コメントの追加          | 未実施     |
| T-08-3 | 重複・冗長箇所の整理                      | 未実施     |
| T-08-4 | Before/After テーブルの記録               | 未実施     |
| T-08-5 | リファクタ後の YAML 構文確認              | 未実施     |

---

## 成果物

| 成果物               | パス                                    | 説明                                            |
| -------------------- | --------------------------------------- | ----------------------------------------------- |
| リファクタリング結果 | `outputs/phase-8/refactoring-result.md` | Before/After テーブル・対称性確認・変更なし記録 |

---

## 完了条件

- [ ] `test-desktop` と `test-web` の matrix 設定対称性が確認済みであること
- [ ] シャード数計算根拠コメントが `ci.yml` に追加されていること（または不要と判断済みであること）
- [ ] Before/After テーブルが `outputs/phase-8/refactoring-result.md` に記録されていること
- [ ] リファクタ後も YAML 構文が正常であること（Python yaml または actionlint で確認）
- [ ] 機能変更がないこと（シャード数・並列数合計・コマンド内容）が確認済みであること
- [ ] 本Phase内の全タスクを100%実行完了

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
# 成果物の存在確認
ls -la docs/30-workflows/task-ci-future-002-test-web-sharding/outputs/phase-8/

# シャード数が変わっていないことを最終確認
grep -E "shard.*\[|/[0-9]+" .github/workflows/ci.yml
```

---

## 次のPhase

**Phase 9: 品質保証** — ci.yml 構文検証・受入基準全確認・セキュリティ観点・デグレード防止チェックを行う。

**Phase 9 開始条件**: Phase 8 の全完了条件を満たすこと。
