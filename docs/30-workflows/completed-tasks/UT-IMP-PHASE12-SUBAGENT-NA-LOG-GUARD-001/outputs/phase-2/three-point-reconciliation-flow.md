# Phase 2 成果物: 三点突合チェックフロー

## タスクID: UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001

## 作成日: 2026-03-01

---

## 概要

三点突合は、Phase 12 の完了状態を3つの独立したデータソースで相互検証するフローである。成果物実体の物理的存在、artifacts.json のステータス記録、phase-12-documentation.md のチェックリスト状態の3つが全て整合している場合にのみ PASS と判定する。

## データソース定義

| #   | データソース                           | 検証対象                              | 取得方法           |
| --- | -------------------------------------- | ------------------------------------- | ------------------ |
| 1   | 成果物実体                             | `outputs/phase-12/` 配下のファイル群  | `ls -la` コマンド  |
| 2   | artifacts.json ステータス              | Phase 12 エントリの status フィールド | `grep` コマンド    |
| 3   | phase-12-documentation.md チェック状態 | チェックリストの `[x]`/`[ ]` 状態     | `grep -c` コマンド |

---

## フロー全体図

```
[開始]
  |
  v
Step A: 成果物実体の存在確認
  |   ls -la outputs/phase-12/
  v
Step B: artifacts.json ステータス確認
  |   grep -A5 '"phase-12"' artifacts.json
  v
Step C: phase-12-documentation.md チェック状態確認
  |   grep -c "\[x\]" / grep -c "\[ \]"
  v
Step D: 三点突合マッチング
  |   8パターンルール表に照合
  v
Step E: 判定結果の記録
  |
  +---> PASS     --> Phase 12 完了として記録
  +---> FAIL     --> 対処手順を実行し、Step A から再実行
  +---> CRITICAL --> エスカレーション（手動介入必須）
```

---

## Step A: 成果物実体の存在確認

### 目的

`outputs/phase-12/` ディレクトリ配下に Phase 12 の必須成果物が物理的に存在するかを確認する。

### 実行コマンド

```bash
# 作業ディレクトリ: docs/30-workflows/<TASK-ID>/
# 目的: Phase 12 成果物ディレクトリの全ファイル一覧を取得する

ls -la outputs/phase-12/
```

### 必須成果物チェック

```bash
# 作業ディレクトリ: docs/30-workflows/<TASK-ID>/
# 目的: 必須成果物3ファイルの存在を個別に確認する

REQUIRED_FILES=(
  "spec-update-summary.md"
  "documentation-changelog.md"
  "unassigned-task-report.md"
)

MISSING_COUNT=0
for f in "${REQUIRED_FILES[@]}"; do
  if [ -f "outputs/phase-12/$f" ]; then
    echo "OK: $f"
  else
    echo "MISSING: $f"
    MISSING_COUNT=$((MISSING_COUNT + 1))
  fi
done

echo ""
echo "結果: 必須成果物 $((${#REQUIRED_FILES[@]} - MISSING_COUNT))/${#REQUIRED_FILES[@]} 存在"
```

### 判定基準

- `MISSING_COUNT === 0`: 成果物実体「存在」と判定する
- `MISSING_COUNT > 0`: 成果物実体「不在」と判定する

---

## Step B: artifacts.json ステータス確認

### 目的

`artifacts.json` の Phase 12 エントリに `"status": "completed"` が記録されているかを確認する。

### 実行コマンド

```bash
# 作業ディレクトリ: docs/30-workflows/<TASK-ID>/
# 目的: artifacts.json の Phase 12 ステータスを確認する

grep -A5 '"12"' artifacts.json | grep '"status"'
```

### 判定基準

- 出力に `"status": "completed"` が含まれる場合: artifacts.json「completed」と判定する
- 出力に `"status": "completed"` が含まれない場合: artifacts.json「未completed」と判定する

---

## Step C: phase-12-documentation.md チェック状態確認

### 目的

`phase-12-documentation.md` のチェックリスト項目が全て完了（`[x]`）になっているかを確認する。

### 実行コマンド

```bash
# 作業ディレクトリ: docs/30-workflows/<TASK-ID>/
# 目的: チェック済み項目数と未チェック項目数をカウントする

CHECKED=$(grep -c "\[x\]" phase-12-documentation.md)
UNCHECKED=$(grep -c "\[ \]" phase-12-documentation.md)
TOTAL=$((CHECKED + UNCHECKED))

echo "チェック済み: $CHECKED / $TOTAL"
echo "未チェック:   $UNCHECKED / $TOTAL"
```

### 判定基準

- `UNCHECKED === 0`: チェックリスト「全[x]」と判定する
- `UNCHECKED > 0`: チェックリスト「[ ]あり」と判定する

---

## Step D: 三点突合マッチング

### 目的

Step A～C の3つの結果を8パターンルール表に照合し、判定（PASS / FAIL / CRITICAL）を確定する。

### 8パターンルール表

| #   | 成果物実体 | artifacts.json | チェックリスト | 判定         | 対処コマンド                                                                                                                 |
| --- | ---------- | -------------- | -------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| 1   | 存在       | completed      | 全[x]          | **PASS**     | 対処不要                                                                                                                     |
| 2   | 存在       | completed      | [ ]あり        | **FAIL**     | phase-12-documentation.md の未チェック項目を `[x]` に更新し再コミットする                                                    |
| 3   | 存在       | 未completed    | 全[x]          | **FAIL**     | artifacts.json の Phase 12 status を `"completed"` に更新する                                                                |
| 4   | 存在       | 未completed    | [ ]あり        | **FAIL**     | artifacts.json の status を `"completed"` に更新し、phase-12-documentation.md の未チェック項目を `[x]` に更新する            |
| 5   | 不在       | completed      | 全[x]          | **CRITICAL** | 虚偽記録の疑い。成果物を作成するか、artifacts.json の status と phase-12-documentation.md のチェックを取り消す。手動介入必須 |
| 6   | 不在       | completed      | [ ]あり        | **FAIL**     | artifacts.json の Phase 12 status を `"pending"` に戻す                                                                      |
| 7   | 不在       | 未completed    | 全[x]          | **FAIL**     | phase-12-documentation.md の該当チェック項目を `[ ]` に戻す                                                                  |
| 8   | 不在       | 未completed    | [ ]あり        | **N/A対象**  | N/A判定ログに記録する。Phase 12 の該当タスクが未着手であることを確認する                                                     |

### 照合手順

1. Step A の結果から「成果物実体」列を特定する
2. Step B の結果から「artifacts.json」列を特定する
3. Step C の結果から「チェックリスト」列を特定する
4. 3つの列の組合せに一致するパターン番号を特定する
5. 該当パターンの「判定」と「対処コマンド」に従う

---

## Step E: 判定結果の記録

### PASS の場合

```bash
# 作業ディレクトリ: docs/30-workflows/<TASK-ID>/
# 目的: 三点突合の PASS 結果を spec-update-summary.md に記録する

echo "" >> outputs/phase-12/spec-update-summary.md
echo "## 三点突合結果" >> outputs/phase-12/spec-update-summary.md
echo "" >> outputs/phase-12/spec-update-summary.md
echo "- **判定**: PASS" >> outputs/phase-12/spec-update-summary.md
echo "- **パターン**: #1（成果物存在 / completed / 全[x]）" >> outputs/phase-12/spec-update-summary.md
echo "- **実行日時**: $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> outputs/phase-12/spec-update-summary.md
echo "- **実行者**: lead" >> outputs/phase-12/spec-update-summary.md
```

### FAIL の場合

```bash
# 1. 対処コマンド（8パターンルール表の該当パターンに従う）を実行する
# 2. 対処内容をコミットする
# 3. Step A から三点突合を再実行する
```

### CRITICAL の場合（パターン #5）

```bash
# CRITICAL判定時のエスカレーション手順:
# 1. 以下の情報を記録する
echo "CRITICAL: パターン #5 — 成果物不在だが artifacts.json=completed, チェックリスト=全[x]"
echo "検出日時: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "対処: 手動介入が必要。成果物を作成するか、虚偽記録を取り消す"

# 2. 手動介入で以下のいずれかを実行する:
#    a) 成果物を作成し、再度三点突合を実行する
#    b) artifacts.json の status を "pending" に戻し、
#       phase-12-documentation.md の該当チェック項目を [ ] に戻す
```

---

## 再実行ルール

- FAIL 判定後の再実行回数は最大3回とする
- 3回再実行しても PASS にならない場合は CRITICAL に昇格する
- CRITICAL 判定は手動介入でのみ解消可能とする
