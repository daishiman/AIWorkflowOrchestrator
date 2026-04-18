# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                                        |
| ------ | ----------------------------------------- |
| Phase  | 8                                         |
| 機能名 | task-ci-future-007-backend-codecov-upload |
| 作成日 | 2026-04-16                                |

## 目的

実装コードの品質向上を行う。機能変更は行わず、コメント追加・命名整理・`desktop` との一貫性確保のみを実施する。
`ci.yml` の `test-web` ジョブに `@repo/backend` であることを明示するコメントを追加し、
`coverage` ジョブのコメントを `backend` フラグ対応に合わせて更新し、
`desktop` と `backend` のパターン一貫性を確認する。

---

## 実行タスク

- **タスク1**: `ci.yml` の `test-web` ジョブにコメント追加（`@repo/backend` であることを明示）
- **タスク2**: `coverage` ジョブのコメント更新（`backend` フラグ対応を反映）
- **タスク3**: `desktop` と `backend` のパターン一貫性確認

---

## 参照資料

| 資料名                         | パス                                       | 説明                   |
| ------------------------------ | ------------------------------------------ | ---------------------- |
| Phase 1 受入基準               | `outputs/phase-1/acceptance-criteria.md`   | 変更前提の確認         |
| Phase 2 設計決定記録           | `outputs/phase-2/design-decisions.md`      | 設計意図の確認         |
| Phase 7 カバレッジチェック結果 | `outputs/phase-7/coverage-check-result.md` | Phase 7 完了状態確認   |
| CI ワークフロー                | `.github/workflows/ci.yml`                 | リファクタ対象ファイル |
| Phase 5 実装結果               | `outputs/phase-5/implementation-result.md` | 実装内容の参照         |
| Phase 6 テスト拡張結果         | `outputs/phase-6/test-expansion-result.md` | テスト拡張の確認       |

---

## 実行手順

### ステップ0: Phase 8 事前確認【必須】

```bash
# Phase 7 が完了していることを確認
ls outputs/phase-7/coverage-check-result.md

# test-web ジョブの現在のコメント状態を確認
grep -n -B2 -A5 "test-web:" .github/workflows/ci.yml | head -30

# coverage ジョブの現在のコメント状態を確認
grep -n -B2 -A5 "coverage:" .github/workflows/ci.yml | head -30
```

### ステップ1: `test-web` ジョブへのコメント追加

`ci.yml` の `test-web` ジョブに `@repo/backend` であることを明示するコメントを追加する。
名称と実体の乖離（ジョブ名は `test-web` だが実際は `@repo/backend` のテスト）を明記する。

**追加するコメントの例**:

```yaml
# test-web ジョブ: 名称は test-web だが実体は @repo/backend のテストを実行する。
# TASK-CI-FUTURE-007: main push 時のみカバレッジを収集し Codecov の backend フラグでアップロードする。
# PR 時はカバレッジ収集をスキップして高速フィードバックを優先する。
test-web:
```

**実装後の確認**:

```bash
# コメントが追加されていることを確認
grep -n "@repo/backend\|TASK-CI-FUTURE-007\|backend フラグ" .github/workflows/ci.yml
```

### ステップ2: `coverage` ジョブのコメント更新

`coverage` ジョブのコメントに `backend` フラグ対応が追加されたことを反映する。

**更新するコメントの例**:

```yaml
# coverage ジョブ: main push 時に各テストジョブのカバレッジアーティファクトを収集し Codecov へアップロードする。
# - desktop フラグ: test-desktop ジョブ（@repo/desktop）のカバレッジ
# - backend フラグ: test-web ジョブ（@repo/backend）のカバレッジ（TASK-CI-FUTURE-007 で追加）
coverage:
```

**実装後の確認**:

```bash
# コメントが更新されていることを確認
grep -n "desktop フラグ\|backend フラグ\|TASK-CI-FUTURE-007" .github/workflows/ci.yml
```

### ステップ3: `desktop` と `backend` のパターン一貫性確認

`test-desktop` ジョブと `test-web` ジョブの実装パターンが一貫していることを確認する。

**確認コマンド**:

```bash
# test-desktop の条件分岐パターンを確認
grep -n -A3 "pull_request" .github/workflows/ci.yml | grep -A3 "test-desktop" | head -20

# test-web の条件分岐パターンを確認
grep -n -A3 "pull_request" .github/workflows/ci.yml | grep -A3 "test-web" | head -20

# アーティファクト名のパターンを比較
grep -n "desktop-coverage\|backend-coverage" .github/workflows/ci.yml

# coverage ジョブの flags 設定を比較
grep -n "flags:" .github/workflows/ci.yml
```

**一貫性確認テーブル**:

| 観点               | `test-desktop` パターン                | `test-web` パターン                    | 一貫性 |
| ------------------ | -------------------------------------- | -------------------------------------- | ------ |
| PR 時の条件分岐    | `github.event_name == 'pull_request'`  | `github.event_name == 'pull_request'`  | TBD    |
| カバレッジ環境変数 | `VITEST_SHARDED_COVERAGE=true`         | `VITEST_SHARDED_COVERAGE=true`         | TBD    |
| アーティファクト名 | `desktop-coverage-${{ matrix.shard }}` | `backend-coverage-${{ matrix.shard }}` | TBD    |
| codecov flags      | `flags: desktop`                       | `flags: backend`                       | TBD    |

**判断基準**: 条件分岐の記述方法・環境変数名・アーティファクト命名規則が同一パターンであること。

### ステップ4: リファクタ後のテスト確認

機能変更がないことを確認する。

```bash
# YAML 構文チェック
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))" && echo "YAML OK"

# TypeScript 型チェック（vitest.config.ts に変更がある場合）
pnpm --filter @repo/backend typecheck 2>/dev/null || echo "typecheck 未設定（スキップ）"

# git diff でコメントのみの変更であることを確認
git diff .github/workflows/ci.yml | grep "^[+-]" | grep -v "^[+-][+-][+-]" | grep -v "^[+-]\s*#" | head -20
```

**期待結果**: コメントのみの差分であり、機能的な変更がないこと。

---

## 統合テスト連携

- コメント追加のみであればテスト動作に影響なし
- リファクタ後の YAML 構文チェックが PASS であることを `outputs/phase-8/refactoring-result.md` に記録する

---

## サブタスク管理

| ID     | タスク名                                    | ステータス |
| ------ | ------------------------------------------- | ---------- |
| T-08-1 | `test-web` ジョブへのコメント追加           | 未実施     |
| T-08-2 | `coverage` ジョブのコメント更新             | 未実施     |
| T-08-3 | `desktop` と `backend` のパターン一貫性確認 | 未実施     |
| T-08-4 | リファクタ後の YAML 構文チェック            | 未実施     |

---

## 成果物

| 成果物             | 配置先                                  | 形式     |
| ------------------ | --------------------------------------- | -------- |
| リファクタ結果記録 | `outputs/phase-8/refactoring-result.md` | Markdown |

---

## 完了条件

- [ ] `ci.yml` の `test-web` ジョブに `@repo/backend` であることを明示するコメントが追加されていること
- [ ] `coverage` ジョブのコメントに `backend` フラグ対応の説明が追加されていること
- [ ] `desktop` と `backend` の条件分岐・環境変数・アーティファクト命名・flags のパターンが一貫していること
- [ ] リファクタ後も YAML 構文チェックが PASS であること
- [ ] 機能変更がないこと（コメント・整理のみ）が確認済みであること
- [ ] 確認結果が `outputs/phase-8/refactoring-result.md` に記録されていること

---

## タスク100%実行確認【必須】

- [ ] T-08-1: `test-web` ジョブへのコメント追加完了
- [ ] T-08-2: `coverage` ジョブのコメント更新完了
- [ ] T-08-3: `desktop` と `backend` のパターン一貫性確認を実施し結果を記録済み
- [ ] T-08-4: リファクタ後の YAML 構文チェック PASS を `outputs/phase-8/refactoring-result.md` に記録済み

---

## 次Phase

**Phase 9: 品質保証** — 受入基準 AC-1〜AC-5 の全項目を照合し、品質を確認する。

**Phase 9 開始条件**: Phase 8 の全完了条件を満たすこと。
