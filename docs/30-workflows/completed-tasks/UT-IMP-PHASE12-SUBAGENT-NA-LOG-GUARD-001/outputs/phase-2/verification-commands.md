# Phase 2 成果物: 検証コマンドセット

## タスクID: UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001

## 作成日: 2026-03-01

---

## 概要

Phase 12 の完了状態を機械的に検証するための4つのコマンドを定義する。全コマンドはコピー&ペーストで実行可能な bash スクリプトとして提供する（NFR-1 準拠）。

## コマンド一覧

| #   | コマンド名                   | 目的                              | 実行タイミング          | 想定実行時間 |
| --- | ---------------------------- | --------------------------------- | ----------------------- | ------------ |
| 1   | `verify-na-log`              | N/A判定ログの完全性を検証する     | N/A判定ログ記録後       | 5秒以内      |
| 2   | `verify-three-point`         | 三点突合を実行する                | Phase 12 全タスク完了後 | 10秒以内     |
| 3   | `verify-current-baseline`    | current/baseline 分離を検証する   | 監査スクリプト実行後    | 30秒以内     |
| 4   | `verify-subagent-assignment` | SubAgent 分担の完了状態を検証する | SubAgent 作業完了後     | 5秒以内      |

---

## 1. verify-na-log: N/A判定ログの完全性検証

### 目的

推奨5点セット仕様書（interfaces, api-ipc, security, task-workflow, lessons-learned）の全件に対して判定が記録されていること、N/A 判定に理由（10文字以上）と代替証跡（10文字以上）が存在することを検証する。

### 前提条件

- `spec-update-summary.md` が `outputs/phase-12/` に存在する
- N/A管理ログセクションが Markdown テーブル形式で記載されている

### 実行コマンド

```bash
#!/usr/bin/env bash
# verify-na-log: N/A判定ログの完全性検証
# 作業ディレクトリ: docs/30-workflows/<TASK-ID>/
# 使用方法: bash verify-na-log.sh <TASK-ID>
# 例: bash verify-na-log.sh UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001

set -euo pipefail

TASK_ID="${1:?タスクIDを第1引数に指定してください}"
BASE_DIR="docs/30-workflows/${TASK_ID}"
SUMMARY="${BASE_DIR}/outputs/phase-12/spec-update-summary.md"
EXIT_CODE=0

echo "=== verify-na-log: N/A判定ログ完全性検証 ==="
echo "対象: ${SUMMARY}"
echo ""

# 前提チェック: ファイル存在
if [ ! -f "${SUMMARY}" ]; then
  echo "ERROR: ${SUMMARY} が存在しません"
  exit 1
fi

# Step 1: 推奨5点セットの判定有無を確認
echo "--- Step 1: 推奨5点セット仕様書の判定有無 ---"
REQUIRED_SPECS=("interfaces" "api-ipc" "security" "task-workflow" "lessons-learned")
MISSING_SPECS=()

for spec in "${REQUIRED_SPECS[@]}"; do
  if grep -q "${spec}" "${SUMMARY}"; then
    echo "  OK: ${spec} の判定が記録されている"
  else
    echo "  ERROR: ${spec} の判定が記録されていない"
    MISSING_SPECS+=("${spec}")
    EXIT_CODE=1
  fi
done

echo ""
echo "判定有無: ${#REQUIRED_SPECS[@]}件中 $((${#REQUIRED_SPECS[@]} - ${#MISSING_SPECS[@]}))件記録済み"
echo ""

# Step 2: N/A判定の理由・代替証跡の文字数検証
echo "--- Step 2: N/A判定の理由・代替証跡の文字数検証 ---"
NA_COUNT=0
NA_ERROR_COUNT=0

grep "| na " "${SUMMARY}" 2>/dev/null | while IFS='|' read -r _ specname judgment reason proof assignee timestamp _; do
  NA_COUNT=$((NA_COUNT + 1))
  specname=$(echo "${specname}" | xargs)
  reason=$(echo "${reason}" | xargs)
  proof=$(echo "${proof}" | xargs)

  if [ ${#reason} -lt 10 ]; then
    echo "  ERROR: ${specname} のN/A判定理由が10文字未満 (${#reason}文字): '${reason}'"
    NA_ERROR_COUNT=$((NA_ERROR_COUNT + 1))
  else
    echo "  OK: ${specname} の理由 (${#reason}文字)"
  fi

  if [ ${#proof} -lt 10 ]; then
    echo "  ERROR: ${specname} のN/A代替証跡が10文字未満 (${#proof}文字): '${proof}'"
    NA_ERROR_COUNT=$((NA_ERROR_COUNT + 1))
  else
    echo "  OK: ${specname} の代替証跡 (${#proof}文字)"
  fi
done

echo ""

# Step 3: 集計行の存在確認
echo "--- Step 3: 集計行の存在確認 ---"
if grep -q "更新.*件.*N/A.*件.*合計.*件" "${SUMMARY}"; then
  echo "  OK: 集計行が存在する"
else
  echo "  ERROR: 集計行が存在しない（形式: '更新 X件 / N/A Y件 / 合計 Z件'）"
  EXIT_CODE=1
fi

echo ""
echo "=== verify-na-log: 完了 (exit code: ${EXIT_CODE}) ==="
exit ${EXIT_CODE}
```

### 期待される出力（正常時）

```
=== verify-na-log: N/A判定ログ完全性検証 ===
対象: docs/30-workflows/<TASK-ID>/outputs/phase-12/spec-update-summary.md

--- Step 1: 推奨5点セット仕様書の判定有無 ---
  OK: interfaces の判定が記録されている
  OK: api-ipc の判定が記録されている
  OK: security の判定が記録されている
  OK: task-workflow の判定が記録されている
  OK: lessons-learned の判定が記録されている

判定有無: 5件中 5件記録済み

--- Step 2: N/A判定の理由・代替証跡の文字数検証 ---
  OK: api-ipc-agent.md の理由 (22文字)
  OK: api-ipc-agent.md の代替証跡 (45文字)

--- Step 3: 集計行の存在確認 ---
  OK: 集計行が存在する

=== verify-na-log: 完了 (exit code: 0) ===
```

---

## 2. verify-three-point: 三点突合実行

### 目的

成果物実体の存在、artifacts.json のステータス、phase-12-documentation.md のチェック状態の3点を取得し、8パターンルール表に照合して判定（PASS / FAIL / CRITICAL）を確定する。

### 前提条件

- Phase 12 の全タスクが完了している
- `artifacts.json` と `phase-12-documentation.md` が存在する

### 実行コマンド

```bash
#!/usr/bin/env bash
# verify-three-point: 三点突合実行
# 作業ディレクトリ: docs/30-workflows/<TASK-ID>/
# 使用方法: bash verify-three-point.sh <TASK-ID>
# 例: bash verify-three-point.sh UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001

set -euo pipefail

TASK_ID="${1:?タスクIDを第1引数に指定してください}"
BASE_DIR="docs/30-workflows/${TASK_ID}"

echo "=== verify-three-point: 三点突合実行 ==="
echo "対象: ${BASE_DIR}"
echo ""

# --- Step A: 成果物実体の存在確認 ---
echo "--- Step A: 成果物実体の存在確認 ---"
REQUIRED_FILES=(
  "spec-update-summary.md"
  "documentation-changelog.md"
  "unassigned-task-report.md"
)
ARTIFACT_EXISTS=true
MISSING_COUNT=0

for f in "${REQUIRED_FILES[@]}"; do
  if [ -f "${BASE_DIR}/outputs/phase-12/${f}" ]; then
    echo "  OK: ${f}"
  else
    echo "  MISSING: ${f}"
    ARTIFACT_EXISTS=false
    MISSING_COUNT=$((MISSING_COUNT + 1))
  fi
done

echo "  結果: 成果物実体 = $(${ARTIFACT_EXISTS} && echo '存在' || echo '不在')"
echo ""

# --- Step B: artifacts.json ステータス確認 ---
echo "--- Step B: artifacts.json ステータス確認 ---"
ARTIFACTS_COMPLETED=false

if [ -f "${BASE_DIR}/artifacts.json" ]; then
  STATUS=$(grep -A5 '"12"' "${BASE_DIR}/artifacts.json" | grep '"status"' | head -1 || echo "")
  if echo "${STATUS}" | grep -q '"completed"'; then
    ARTIFACTS_COMPLETED=true
    echo "  結果: artifacts.json = completed"
  else
    echo "  結果: artifacts.json = 未completed (${STATUS})"
  fi
else
  echo "  ERROR: artifacts.json が存在しません"
fi
echo ""

# --- Step C: phase-12-documentation.md チェック状態確認 ---
echo "--- Step C: phase-12-documentation.md チェック状態確認 ---"
CHECKLIST_ALL_DONE=false

if [ -f "${BASE_DIR}/phase-12-documentation.md" ]; then
  CHECKED=$(grep -c "\[x\]" "${BASE_DIR}/phase-12-documentation.md" || echo "0")
  UNCHECKED=$(grep -c "\[ \]" "${BASE_DIR}/phase-12-documentation.md" || echo "0")
  TOTAL=$((CHECKED + UNCHECKED))

  echo "  チェック済み: ${CHECKED} / ${TOTAL}"
  echo "  未チェック:   ${UNCHECKED} / ${TOTAL}"

  if [ "${UNCHECKED}" -eq 0 ] && [ "${CHECKED}" -gt 0 ]; then
    CHECKLIST_ALL_DONE=true
    echo "  結果: チェックリスト = 全[x]"
  else
    echo "  結果: チェックリスト = [ ]あり"
  fi
else
  echo "  ERROR: phase-12-documentation.md が存在しません"
fi
echo ""

# --- Step D: 三点突合マッチング ---
echo "--- Step D: 三点突合マッチング ---"
echo "  成果物実体:    $(${ARTIFACT_EXISTS} && echo '存在' || echo '不在')"
echo "  artifacts.json: $(${ARTIFACTS_COMPLETED} && echo 'completed' || echo '未completed')"
echo "  チェックリスト: $(${CHECKLIST_ALL_DONE} && echo '全[x]' || echo '[ ]あり')"
echo ""

# パターン判定
JUDGMENT=""
PATTERN=""

if ${ARTIFACT_EXISTS} && ${ARTIFACTS_COMPLETED} && ${CHECKLIST_ALL_DONE}; then
  PATTERN="#1"
  JUDGMENT="PASS"
elif ${ARTIFACT_EXISTS} && ${ARTIFACTS_COMPLETED} && ! ${CHECKLIST_ALL_DONE}; then
  PATTERN="#2"
  JUDGMENT="FAIL"
  echo "  対処: phase-12-documentation.md の未チェック項目を [x] に更新し再コミットする"
elif ${ARTIFACT_EXISTS} && ! ${ARTIFACTS_COMPLETED} && ${CHECKLIST_ALL_DONE}; then
  PATTERN="#3"
  JUDGMENT="FAIL"
  echo "  対処: artifacts.json の Phase 12 status を completed に更新する"
elif ${ARTIFACT_EXISTS} && ! ${ARTIFACTS_COMPLETED} && ! ${CHECKLIST_ALL_DONE}; then
  PATTERN="#4"
  JUDGMENT="FAIL"
  echo "  対処: artifacts.json の status を completed に更新し、チェックリストを更新する"
elif ! ${ARTIFACT_EXISTS} && ${ARTIFACTS_COMPLETED} && ${CHECKLIST_ALL_DONE}; then
  PATTERN="#5"
  JUDGMENT="CRITICAL"
  echo "  対処: 虚偽記録の疑い。成果物を作成するか、ステータスとチェックを取り消す。手動介入必須"
elif ! ${ARTIFACT_EXISTS} && ${ARTIFACTS_COMPLETED} && ! ${CHECKLIST_ALL_DONE}; then
  PATTERN="#6"
  JUDGMENT="FAIL"
  echo "  対処: artifacts.json の Phase 12 status を pending に戻す"
elif ! ${ARTIFACT_EXISTS} && ! ${ARTIFACTS_COMPLETED} && ${CHECKLIST_ALL_DONE}; then
  PATTERN="#7"
  JUDGMENT="FAIL"
  echo "  対処: phase-12-documentation.md の該当チェック項目を [ ] に戻す"
elif ! ${ARTIFACT_EXISTS} && ! ${ARTIFACTS_COMPLETED} && ! ${CHECKLIST_ALL_DONE}; then
  PATTERN="#8"
  JUDGMENT="N/A対象"
  echo "  対処: N/A判定ログに記録する"
fi

echo ""

# --- Step E: 判定結果の記録 ---
echo "--- Step E: 判定結果 ---"
echo "  パターン: ${PATTERN}"
echo "  判定:     ${JUDGMENT}"
echo "  実行日時: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo ""
echo "=== verify-three-point: 完了 ==="

# 終了コード設定
case "${JUDGMENT}" in
  "PASS")     exit 0 ;;
  "FAIL")     exit 1 ;;
  "CRITICAL") exit 2 ;;
  "N/A対象")  exit 0 ;;
  *)          exit 1 ;;
esac
```

### 期待される出力（正常時: パターン #1）

```
=== verify-three-point: 三点突合実行 ===
対象: docs/30-workflows/<TASK-ID>

--- Step A: 成果物実体の存在確認 ---
  OK: spec-update-summary.md
  OK: documentation-changelog.md
  OK: unassigned-task-report.md
  結果: 成果物実体 = 存在

--- Step B: artifacts.json ステータス確認 ---
  結果: artifacts.json = completed

--- Step C: phase-12-documentation.md チェック状態確認 ---
  チェック済み: 15 / 15
  未チェック:   0 / 15
  結果: チェックリスト = 全[x]

--- Step D: 三点突合マッチング ---
  成果物実体:    存在
  artifacts.json: completed
  チェックリスト: 全[x]

--- Step E: 判定結果 ---
  パターン: #1
  判定:     PASS
  実行日時: 2026-03-01T10:30:00Z

=== verify-three-point: 完了 ===
```

---

## 3. verify-current-baseline: current/baseline 分離検証

### 目的

監査スクリプト `verify-all-specs.js` の実行結果から、baseline 違反（タスク着手前から存在）と current 違反（今回新規発生）を分離し、`currentViolations.total === 0` で合否を判定する。

### 前提条件

- `node` コマンドが利用可能である
- `.claude/scripts/verify-all-specs.js` が存在する
- git の作業ツリーがクリーンである（未コミット変更がない状態が望ましい）

### 実行コマンド

```bash
#!/usr/bin/env bash
# verify-current-baseline: current/baseline分離検証
# 作業ディレクトリ: プロジェクトルート
# 使用方法: bash verify-current-baseline.sh
# 前提: git stash が安全に実行できる状態であること

set -euo pipefail

echo "=== verify-current-baseline: current/baseline分離検証 ==="
echo ""

# --- Step 1: baseline取得（mainブランチでの違反数） ---
echo "--- Step 1: baseline違反数の取得 ---"

CURRENT_BRANCH=$(git branch --show-current)
echo "  現在のブランチ: ${CURRENT_BRANCH}"

# stash で一時退避してmainの状態を確認
STASH_RESULT=$(git stash 2>&1 || echo "stash_failed")
if echo "${STASH_RESULT}" | grep -q "No local changes"; then
  NEEDS_STASH_POP=false
  echo "  stash: 退避不要（変更なし）"
else
  NEEDS_STASH_POP=true
  echo "  stash: 変更を一時退避"
fi

# mainブランチをチェックアウトしてbaseline取得
git checkout main --quiet 2>/dev/null || {
  echo "  WARN: mainブランチのチェックアウトに失敗。現在ブランチのみで検証"
  if ${NEEDS_STASH_POP}; then
    git stash pop --quiet
  fi
  BASELINE=0
}

if [ "$(git branch --show-current)" = "main" ]; then
  BASELINE=$(node .claude/scripts/verify-all-specs.js 2>/dev/null | grep -c "VIOLATION" || echo "0")
  echo "  baseline違反数: ${BASELINE}"

  # 元のブランチに戻る
  git checkout "${CURRENT_BRANCH}" --quiet
fi

# stash を復元
if ${NEEDS_STASH_POP}; then
  git stash pop --quiet
  echo "  stash: 変更を復元"
fi

echo ""

# --- Step 2: current取得（現在ブランチでの違反数） ---
echo "--- Step 2: current違反数の取得 ---"
CURRENT_TOTAL=$(node .claude/scripts/verify-all-specs.js 2>/dev/null | grep -c "VIOLATION" || echo "0")
echo "  現在ブランチの違反数: ${CURRENT_TOTAL}"
echo ""

# --- Step 3: 差分計算 ---
echo "--- Step 3: 差分計算 ---"
CURRENT_NEW=$((CURRENT_TOTAL - BASELINE))
if [ "${CURRENT_NEW}" -lt 0 ]; then
  CURRENT_NEW=0
fi

echo "  Baseline violations:      ${BASELINE}"
echo "  Total violations:         ${CURRENT_TOTAL}"
echo "  Current (new) violations: ${CURRENT_NEW}"
echo ""

# --- Step 4: 判定 ---
echo "--- Step 4: 判定 ---"
if [ "${CURRENT_NEW}" -eq 0 ]; then
  echo "  判定: PASS"
  echo "  基準: currentViolations.total === 0"
  echo ""
  echo "=== verify-current-baseline: 完了 ==="
  exit 0
else
  echo "  判定: FAIL"
  echo "  基準: currentViolations.total === ${CURRENT_NEW} (0以外)"
  echo ""
  echo "  対処: 以下のコマンドで新規違反の詳細を確認してください"
  echo "    node .claude/scripts/verify-all-specs.js 2>/dev/null | grep VIOLATION"
  echo ""
  echo "=== verify-current-baseline: 完了 ==="
  exit 1
fi
```

### 期待される出力（正常時）

```
=== verify-current-baseline: current/baseline分離検証 ===

--- Step 1: baseline違反数の取得 ---
  現在のブランチ: docs/task-imp-phase12-subagent-na-log-guard-001
  stash: 退避不要（変更なし）
  baseline違反数: 1

--- Step 2: current違反数の取得 ---
  現在ブランチの違反数: 1

--- Step 3: 差分計算 ---
  Baseline violations:      1
  Total violations:         1
  Current (new) violations: 0

--- Step 4: 判定 ---
  判定: PASS
  基準: currentViolations.total === 0

=== verify-current-baseline: 完了 ===
```

---

## 4. verify-subagent-assignment: SubAgent 分担完了状態検証

### 目的

SubAgent A～E の全担当仕様書に対して、N/A 判定ログまたは仕様書更新のいずれかが完了しているかを検証する。

### 前提条件

- `spec-update-summary.md` が `outputs/phase-12/` に存在する
- SubAgent A～E の全作業が完了している

### 実行コマンド

```bash
#!/usr/bin/env bash
# verify-subagent-assignment: SubAgent分担完了状態検証
# 作業ディレクトリ: docs/30-workflows/<TASK-ID>/
# 使用方法: bash verify-subagent-assignment.sh <TASK-ID>
# 例: bash verify-subagent-assignment.sh UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001

set -euo pipefail

TASK_ID="${1:?タスクIDを第1引数に指定してください}"
BASE_DIR="docs/30-workflows/${TASK_ID}"
SUMMARY="${BASE_DIR}/outputs/phase-12/spec-update-summary.md"
EXIT_CODE=0

echo "=== verify-subagent-assignment: SubAgent分担完了状態検証 ==="
echo "対象: ${SUMMARY}"
echo ""

# 前提チェック
if [ ! -f "${SUMMARY}" ]; then
  echo "ERROR: ${SUMMARY} が存在しません"
  exit 1
fi

# SubAgent分担定義
# 形式: "SubAgent名:担当キーワード1,担当キーワード2,..."
ASSIGNMENTS=(
  "A:interfaces"
  "B:api-ipc"
  "C:security"
  "D:task-workflow,LOGS"
  "E:lessons-learned"
)

echo "--- SubAgent 完了状態 ---"
COMPLETED_COUNT=0
TOTAL_AGENTS=${#ASSIGNMENTS[@]}

for assignment in "${ASSIGNMENTS[@]}"; do
  AGENT_NAME="${assignment%%:*}"
  KEYWORDS="${assignment#*:}"

  # キーワードをカンマ区切りで分割
  IFS=',' read -ra KEYWORD_ARRAY <<< "${KEYWORDS}"

  AGENT_COMPLETE=true
  AGENT_DETAILS=""

  for keyword in "${KEYWORD_ARRAY[@]}"; do
    if grep -q "${keyword}" "${SUMMARY}"; then
      AGENT_DETAILS="${AGENT_DETAILS}  ${keyword}: 記録あり\n"
    else
      AGENT_DETAILS="${AGENT_DETAILS}  ${keyword}: 記録なし\n"
      AGENT_COMPLETE=false
    fi
  done

  if ${AGENT_COMPLETE}; then
    echo "  OK: SubAgent ${AGENT_NAME} — 完了"
    COMPLETED_COUNT=$((COMPLETED_COUNT + 1))
  else
    echo "  ERROR: SubAgent ${AGENT_NAME} — 未完了"
    echo -e "${AGENT_DETAILS}"
    EXIT_CODE=1
  fi
done

echo ""

# P43対策確認: 各SubAgentの担当ファイル数
echo "--- P43対策: ファイル数上限確認 ---"
for assignment in "${ASSIGNMENTS[@]}"; do
  AGENT_NAME="${assignment%%:*}"
  KEYWORDS="${assignment#*:}"
  IFS=',' read -ra KEYWORD_ARRAY <<< "${KEYWORDS}"
  FILE_COUNT=${#KEYWORD_ARRAY[@]}

  if [ "${FILE_COUNT}" -le 3 ]; then
    echo "  OK: SubAgent ${AGENT_NAME} — ${FILE_COUNT}カテゴリ (上限3以下)"
  else
    echo "  WARN: SubAgent ${AGENT_NAME} — ${FILE_COUNT}カテゴリ (上限3超過、分割を検討)"
    EXIT_CODE=1
  fi
done

echo ""

# 集計
echo "--- 集計 ---"
echo "  完了: ${COMPLETED_COUNT} / ${TOTAL_AGENTS} SubAgent"
echo ""

if [ "${COMPLETED_COUNT}" -eq "${TOTAL_AGENTS}" ]; then
  echo "  判定: PASS（全SubAgent完了）"
else
  echo "  判定: FAIL（未完了SubAgentあり）"
fi

echo ""
echo "=== verify-subagent-assignment: 完了 (exit code: ${EXIT_CODE}) ==="
exit ${EXIT_CODE}
```

### 期待される出力（正常時）

```
=== verify-subagent-assignment: SubAgent分担完了状態検証 ===
対象: docs/30-workflows/<TASK-ID>/outputs/phase-12/spec-update-summary.md

--- SubAgent 完了状態 ---
  OK: SubAgent A -- 完了
  OK: SubAgent B -- 完了
  OK: SubAgent C -- 完了
  OK: SubAgent D -- 完了
  OK: SubAgent E -- 完了

--- P43対策: ファイル数上限確認 ---
  OK: SubAgent A -- 1カテゴリ (上限3以下)
  OK: SubAgent B -- 1カテゴリ (上限3以下)
  OK: SubAgent C -- 1カテゴリ (上限3以下)
  OK: SubAgent D -- 2カテゴリ (上限3以下)
  OK: SubAgent E -- 1カテゴリ (上限3以下)

--- 集計 ---
  完了: 5 / 5 SubAgent

  判定: PASS（全SubAgent完了）

=== verify-subagent-assignment: 完了 (exit code: 0) ===
```

---

## 終了コード一覧

| 終了コード | 意味                     | 対処                                     |
| ---------- | ------------------------ | ---------------------------------------- |
| 0          | PASS（検証成功）         | 対処不要                                 |
| 1          | FAIL（検証失敗）         | エラーメッセージに従い対処後、再実行する |
| 2          | CRITICAL（手動介入必須） | リーダーによる手動調査と対処が必要       |
