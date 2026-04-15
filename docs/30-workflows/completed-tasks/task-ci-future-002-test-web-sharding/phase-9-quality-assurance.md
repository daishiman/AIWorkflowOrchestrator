# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 9                                       |
| タスクID   | TASK-CI-FUTURE-002                      |
| 機能名     | test-web-sharding                       |
| タスク名   | test-web シャード化                     |
| 前提Phase  | Phase 8（リファクタリング完了後に着手） |
| 後続Phase  | Phase 10                                |
| 作成日     | 2026-04-15                              |
| ステータス | pending                                 |

---

## 目的

Phase 5 で実装・Phase 8 でリファクタリングした `test-web` シャード化の CI 設定の品質を最終確認する。
`ci.yml` の構文検証・受入基準 AC-1〜AC-6 の全充足確認・セキュリティ観点の確認・
デグレード防止チェックを行い、Phase 10 への進行可否を判定する。

---

## 実行タスク

- **タスク1**: `ci.yml` の YAML 構文検証（actionlint / yamllint / python yaml）
- **タスク2**: 受入基準 AC-1〜AC-6 の全項目確認
- **タスク3**: 並列数合計の最終計算確認（GitHub Free Tier 上限 20 以内を証明）
- **タスク4**: セキュリティ観点の確認（CI 変更が意図しない影響を与えないか）
- **タスク5**: デグレード防止チェック（`test-desktop`・`test-shared`・`e2e-desktop` への影響確認）

---

## 参照資料

| 資料名                  | パス                                                                                      | 説明                   |
| ----------------------- | ----------------------------------------------------------------------------------------- | ---------------------- |
| タスク指示書            | `docs/30-workflows/unassigned-task/TASK-CI-FUTURE-002-test-web-sharding.md`               | 受入基準・スコープ定義 |
| Phase 1 調査結果        | `outputs/phase-1/parallel-count-baseline.md`                                              | 並列数ベースライン     |
| Phase 2 設計書          | `outputs/phase-2/shard-design.md`                                                         | シャード数設計根拠     |
| Phase 5 実装結果        | `outputs/phase-5/implementation-result.md`                                                | 実装内容の確認         |
| Phase 7 計測レポート    | `outputs/phase-7/coverage-report.md`                                                      | PASS 判定確認          |
| Phase 8 リファクタ結果  | `outputs/phase-8/refactoring-result.md`                                                   | リファクタ完了状態確認 |
| CI ワークフロー         | `.github/workflows/ci.yml`                                                                | 品質チェック対象       |
| TASK-CI-OPT-001 Phase 9 | `docs/30-workflows/completed-tasks/task-ci-optimization-001/phase-9-quality-assurance.md` | 参考フォーマット       |

---

## 実行手順

### ステップ1: `ci.yml` の YAML 構文検証

```bash
# actionlint による ci.yml の構文チェック（インストール済みの場合）
actionlint .github/workflows/ci.yml

# actionlint が未インストールの場合は brew でインストール
brew install actionlint
actionlint .github/workflows/ci.yml

# actionlint が利用できない環境では yamllint で代替
yamllint .github/workflows/ci.yml

# 最低限: Python yaml モジュールによる構文確認
python3 -c "
import yaml
with open('.github/workflows/ci.yml') as f:
    yaml.safe_load(f)
print('YAML syntax OK')
"
```

**期待結果**: エラー 0 件

### ステップ2: 受入基準 AC-1〜AC-6 の全項目確認

```bash
# AC-1: test-web ジョブが設定したシャード数に分割されて実行されるか
grep -A 20 "test-web:" .github/workflows/ci.yml | grep -E "shard|matrix"

# AC-2: 全シャードが CI で PASS するか（Phase 5 または Phase 11 の CI 実行ログで確認）
# → この時点では Phase 5 の CI 実行結果を参照
cat outputs/phase-5/implementation-result.md 2>/dev/null | grep -E "PASS|shard"

# AC-3: 並列数合計が GitHub Free Tier 上限 20 以内か
echo "並列数合計の確認（以下の shard/matrix 設定から計算）:"
grep -E "(shard|matrix)" .github/workflows/ci.yml

# AC-4: シャード化後の実行時間がベースラインを上回らないか
# → Phase 1 のベースラインと Phase 7 の計測値を比較
grep -E "実行時間|baseline|execution" \
  outputs/phase-1/parallel-count-baseline.md \
  outputs/phase-7/coverage-report.md 2>/dev/null

# AC-5: シャード数の計算根拠が文書化されているか
ls -la outputs/phase-2/shard-design.md

# AC-6: 変更が CI 設定ファイルのみに限定されているか（アプリコード変更がないか）
git diff HEAD --name-only | grep -v "\.github/workflows/ci\.yml\|vitest\.config\.ts" || \
  echo "変更ファイルは CI 設定のみ（問題なし）"
```

**受入基準照合テーブル**:

| AC 番号 | 受入基準                                                    | 確認方法                                     | 判定    |
| ------- | ----------------------------------------------------------- | -------------------------------------------- | ------- |
| AC-1    | `test-web` ジョブが設定したシャード数に分割されて実行される | `ci.yml` の matrix 設定確認                  | pending |
| AC-2    | 全シャードが CI で PASS する                                | Phase 5 の CI 実行ログ / Phase 11 で最終確認 | pending |
| AC-3    | 並列数合計が GitHub Free Tier 上限 20 以内に収まる          | 全ジョブのシャード数を合計して確認           | pending |
| AC-4    | シャード化後の実行時間がベースラインを上回らない            | Phase 1 ベースライン vs Phase 7 計測値比較   | pending |
| AC-5    | シャード数の計算根拠が文書化されている                      | `outputs/phase-2/shard-design.md` の存在確認 | pending |
| AC-6    | 変更が CI 設定ファイルのみに限定される                      | `git diff --name-only` で変更ファイル確認    | pending |

### ステップ3: 並列数合計の最終計算確認

```bash
# 現在の全ジョブのシャード数・ジョブ数を集計
echo "=== 並列数合計の確認 ==="
grep -E "shard|matrix" .github/workflows/ci.yml

# 合計ジョブ数を手動で計算する
# 計算式: test-desktop×N + test-web×M + typecheck×1 + test-shared×1 + e2e-desktop×1
# 上限: 20（GitHub Free Tier）
```

**並列数確認テーブル**:

| ジョブ名     | シャード数 / ジョブ数 | 根拠                               |
| ------------ | --------------------- | ---------------------------------- |
| test-desktop | TBD                   | Phase 2 設計書の値                 |
| test-web     | TBD                   | Phase 2 設計書の値（本タスク対象） |
| typecheck    | 1                     | 固定                               |
| test-shared  | 1                     | 固定                               |
| e2e-desktop  | 1                     | 固定                               |
| **合計**     | **TBD**               | **上限 20 以内であること**         |

上限を超過する場合は MAJOR 判定とし、Phase 2（シャード数設計）に戻る。

### ステップ4: セキュリティ観点の確認

```bash
# ci.yml のシークレット参照が適切か確認
grep -n "secrets\." .github/workflows/ci.yml

# test-web ジョブに不要なシークレット参照が追加されていないか確認
grep -B5 -A40 "test-web:" .github/workflows/ci.yml | grep "secrets\."

# GITHUB_TOKEN の利用が最小権限になっているか確認
grep -n "permissions\|GITHUB_TOKEN" .github/workflows/ci.yml | head -20

# test-web ジョブが意図しないアーティファクトをアップロードしていないか確認
grep -B5 -A40 "test-web:" .github/workflows/ci.yml | grep "upload-artifact\|cache"
```

**セキュリティ確認チェックリスト**:

| 確認項目                                                              | 期待値               | 結果    |
| --------------------------------------------------------------------- | -------------------- | ------- |
| `test-web` ジョブに不要なシークレット参照が追加されていないこと       | シークレット参照なし | pending |
| `test-web` が意図しないアーティファクトをアップロードしていないこと   | アップロードなし     | pending |
| `ci.yml` 全体のパーミッション設定が変更されていないこと               | Phase 5 実装前と同一 | pending |
| `test-web` ジョブに外部 Action の追加がないこと（スコープ外変更なし） | 外部 Action 追加なし | pending |

### ステップ5: デグレード防止チェック

```bash
# test-desktop への影響確認（シャード数・設定が変更されていないか）
grep -A 30 "test-desktop:" .github/workflows/ci.yml | grep -E "shard|matrix|pnpm"

# test-shared への影響確認（ジョブ定義が変更されていないか）
grep -A 20 "test-shared:" .github/workflows/ci.yml

# e2e-desktop への影響確認（ジョブ定義が変更されていないか）
grep -A 20 "e2e-desktop:" .github/workflows/ci.yml

# typecheck への影響確認
grep -A 20 "typecheck:" .github/workflows/ci.yml

# 全ジョブの依存関係（needs）が正しく設定されているか確認
grep -n "needs:" .github/workflows/ci.yml
```

**デグレード防止チェックリスト**:

| ジョブ名       | 確認内容                                    | 判定    |
| -------------- | ------------------------------------------- | ------- |
| test-desktop   | シャード数・コマンドが Phase 5 実装前と同一 | pending |
| test-shared    | ジョブ定義が Phase 5 実装前と同一           | pending |
| e2e-desktop    | ジョブ定義が Phase 5 実装前と同一           | pending |
| typecheck      | ジョブ定義が Phase 5 実装前と同一           | pending |
| ジョブ依存関係 | `needs` の設定が意図せず変更されていない    | pending |

---

## 一括判定コマンド

```bash
# ci.yml 構文チェック
yamllint .github/workflows/ci.yml

# 並列数確認
grep -E "(shard|matrix)" .github/workflows/ci.yml

# 変更ファイルのスコープ確認
git diff HEAD --name-only

# 全体サマリー確認
echo "=== test-web シャード設定 ===" && grep -A 15 "test-web:" .github/workflows/ci.yml | grep -E "shard|matrix|pnpm"
echo "=== test-desktop シャード設定 ===" && grep -A 15 "test-desktop:" .github/workflows/ci.yml | grep -E "shard|matrix|pnpm"
```

---

## 統合テスト連携

| 判定項目                           | 基準                       | 結果    |
| ---------------------------------- | -------------------------- | ------- |
| YAML 構文チェック                  | エラー 0 件                | pending |
| AC-1〜AC-6 全充足                  | 全項目 PASS                | pending |
| 並列数合計                         | 20 以内                    | pending |
| セキュリティ確認                   | 問題なし                   | pending |
| デグレード（4 ジョブへの影響なし） | 全ジョブ定義が変更前と同一 | pending |
| Phase 10 ブロッカー                | なし                       | pending |

---

## 多角的チェック観点

| 観点     | 確認内容                                                                       |
| -------- | ------------------------------------------------------------------------------ |
| 矛盾     | Phase 2 設計書のシャード数と `ci.yml` の実装が一致しているか                   |
| 漏れ     | AC-1〜AC-6 のいずれかが未確認になっていないか                                  |
| 整合性   | `test-desktop` と `test-web` の対称性が Phase 8 のリファクタで確保されているか |
| 依存関係 | Phase 9 の全チェックが PASS であることが Phase 10 の前提条件になっているか     |

---

## サブタスク管理

| ID     | タスク名                                       | ステータス |
| ------ | ---------------------------------------------- | ---------- |
| T-09-1 | `ci.yml` の YAML 構文検証                      | 未実施     |
| T-09-2 | 受入基準 AC-1〜AC-6 の全項目確認               | 未実施     |
| T-09-3 | 並列数合計の最終計算確認                       | 未実施     |
| T-09-4 | セキュリティ観点の確認                         | 未実施     |
| T-09-5 | デグレード防止チェック（4 ジョブへの影響確認） | 未実施     |

---

## 成果物

| 成果物           | パス                                      | 説明                                                          |
| ---------------- | ----------------------------------------- | ------------------------------------------------------------- |
| 品質チェック結果 | `outputs/phase-9/quality-check-result.md` | 構文検証・AC 全確認・並列数・セキュリティ・デグレード確認結果 |

---

## 完了条件

- [ ] `ci.yml` の YAML 構文チェックが PASS であること（エラー 0）
- [ ] AC-1〜AC-6 の照合が全て実施され、判定が記録されていること
- [ ] 並列数合計が 20 以内に収まることが計算で証明されていること
- [ ] セキュリティ観点の全チェックが完了し、問題なしが記録されていること
- [ ] `test-desktop`・`test-shared`・`e2e-desktop`・`typecheck` へのデグレードがないことが確認済みであること
- [ ] Phase 10 進行を阻害するブロッカーがないことが確認済みであること
- [ ] 品質チェック結果（`outputs/phase-9/quality-check-result.md`）が作成済みであること
- [ ] 本Phase内の全タスクを100%実行完了

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
# 成果物の存在確認
ls -la docs/30-workflows/task-ci-future-002-test-web-sharding/outputs/phase-9/

# AC-6 スコープ確認（CI 設定ファイルのみの変更であること）
git diff HEAD --name-only
```

---

## 次のPhase

**Phase 10: 最終レビューゲート** — 受入基準 AC-1〜AC-6 の完全照合・PASS/MINOR/MAJOR 判定・Phase 11 への引き継ぎ事項整理を行う。

**Phase 10 開始条件**: Phase 9 の全完了条件を満たすこと。
