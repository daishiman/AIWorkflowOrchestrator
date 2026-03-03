# Phase 2 成果物: テンプレート仕様

## メタ情報

| 項目       | 値                                              |
| ---------- | ----------------------------------------------- |
| Phase      | 2 --- 設計                                      |
| 機能名     | Phase 12 2workflow同時監査の証跡集約ガード      |
| タスクID   | UT-IMP-PHASE12-TWO-WORKFLOW-EVIDENCE-BUNDLE-001 |
| 作成日     | 2026-03-03                                      |
| 依存成果物 | Phase 1 要件定義書、architecture-design.md      |
| ステータス | Draft                                           |

## 証跡集約テンプレート仕様

### テンプレート全体構造（evidence-bundle.md）

以下の8セクションで構成される。全セクションを記入した後にのみ「完了」ステータスを記録する（P4対策）。

---

### セクション1: メタ情報

タスクと監査の基本情報を記録する。

```markdown
## メタ情報

| 項目       | 値         |
| ---------- | ---------- |
| タスクID   | <TASK-ID>  |
| 監査実行日 | <ISO 8601> |
| 監査実行者 | <実行者名> |
```

**フィールド定義**:

| フィールド名 | 型       | 必須 | 説明                                                                  |
| ------------ | -------- | ---- | --------------------------------------------------------------------- |
| タスクID     | string   | Yes  | 対象タスクのID（例: UT-IMP-PHASE12-TWO-WORKFLOW-EVIDENCE-BUNDLE-001） |
| 監査実行日   | ISO 8601 | Yes  | 監査を実行した日付（例: 2026-03-03）                                  |
| 監査実行者   | string   | Yes  | `lead` または SubAgent名（例: `SubAgent-Phase12-A`）                  |

---

### セクション2: 2Workflow監査結果サマリー

2つのworkflow（`spec_created` と `completed`）の監査結果を横並びで比較するテーブル。

```markdown
## 2Workflow監査結果サマリー

| 項目                         | spec_created workflow      | completed workflow         |
| ---------------------------- | -------------------------- | -------------------------- |
| workflowパス                 | docs/30-workflows/<PATH-1> | docs/30-workflows/<PATH-2> |
| verify-all-specs violations  | <数値>                     | <数値>                     |
| validate-phase-output errors | <数値>                     | <数値>                     |
| 監査日時                     | <ISO 8601>                 | <ISO 8601>                 |
```

**フィールド定義**:

| フィールド名                 | 型       | 必須 | 説明                                                        |
| ---------------------------- | -------- | ---- | ----------------------------------------------------------- |
| workflowパス                 | string   | Yes  | workflowディレクトリの相対パス（`docs/30-workflows/` 起点） |
| verify-all-specs violations  | number   | Yes  | verify-all-specs.js が検出した違反の合計数                  |
| validate-phase-output errors | number   | Yes  | validate-phase-output.js が検出したエラーの合計数           |
| 監査日時                     | ISO 8601 | Yes  | 各workflowの監査実行日時                                    |

**記入ルール**:

- `spec_created` 列と `completed` 列の両方を必ず記入する
- 片方のworkflowのみ存在する場合は、存在しない側を「N/A（workflowが存在しない）」と記録する
- violations/errorsの数値は verify-all-specs.js / validate-phase-output.js の出力から直接転記する

---

### セクション3: verify-all-specs 詳細

各workflowで検出された違反の詳細を記録する。

```markdown
## verify-all-specs 詳細

### spec_created workflow

| #   | 違反内容     | 種別   | 重要度         |
| --- | ------------ | ------ | -------------- |
| 1   | <違反の説明> | <種別> | <HIGH/MED/LOW> |
| ... | ...          | ...    | ...            |

違反なしの場合: 「違反は検出されませんでした」と記録する。

### completed workflow

| #   | 違反内容     | 種別   | 重要度         |
| --- | ------------ | ------ | -------------- |
| 1   | <違反の説明> | <種別> | <HIGH/MED/LOW> |
| ... | ...          | ...    | ...            |

違反なしの場合: 「違反は検出されませんでした」と記録する。
```

**フィールド定義**:

| フィールド名 | 型     | 必須 | 説明                                                                |
| ------------ | ------ | ---- | ------------------------------------------------------------------- |
| 違反内容     | string | Yes  | verify-all-specs.js が出力した違反の説明テキスト                    |
| 種別         | string | Yes  | 違反の種別（例: missing-section, invalid-format, broken-reference） |
| 重要度       | enum   | Yes  | `HIGH` / `MED` / `LOW` のいずれか                                   |

---

### セクション4: validate-phase-output 詳細

各workflowで検出されたPhase出力エラーの詳細を記録する。

```markdown
## validate-phase-output 詳細

### spec_created workflow

| #   | エラー内容     | Phase     | 対処       |
| --- | -------------- | --------- | ---------- |
| 1   | <エラーの説明> | Phase <N> | <対処方法> |
| ... | ...            | ...       | ...        |

エラーなしの場合: 「エラーは検出されませんでした」と記録する。

### completed workflow

| #   | エラー内容     | Phase     | 対処       |
| --- | -------------- | --------- | ---------- |
| 1   | <エラーの説明> | Phase <N> | <対処方法> |
| ... | ...            | ...       | ...        |

エラーなしの場合: 「エラーは検出されませんでした」と記録する。
```

**フィールド定義**:

| フィールド名 | 型     | 必須 | 説明                                                       |
| ------------ | ------ | ---- | ---------------------------------------------------------- |
| エラー内容   | string | Yes  | validate-phase-output.js が出力したエラーの説明テキスト    |
| Phase        | string | Yes  | エラーが検出されたPhase番号（例: Phase 12）                |
| 対処         | string | Yes  | エラーに対する対処方法（修正済み / 未タスク化 / 許容理由） |

---

### セクション5: Task実体確認チェックリスト

Task 1（実装ガイド）: 5項目、Task 3（documentation-changelog）: 2項目、Task 4（未タスク検出）: 2項目、Task 5（スキルフィードバック）: 2項目の計11項目。

```markdown
## Task実体確認チェックリスト

### Task 1: 実装ガイド

| #   | チェック項目          | コマンド / 確認方法                                                          | 結果    |
| --- | --------------------- | ---------------------------------------------------------------------------- | ------- |
| 1-1 | ファイル実在          | `ls -la outputs/phase-12/implementation-guide.md`                            | OK/NG   |
| 1-2 | Part 1 セクション存在 | `grep -c "## Part 1" outputs/phase-12/implementation-guide.md`               | OK(>=1) |
| 1-3 | Part 1 日常例え存在   | `grep -cE "例え\|たとえ\|アナロジ" outputs/phase-12/implementation-guide.md` | OK(>=1) |
| 1-4 | Part 2 セクション存在 | `grep -c "## Part 2" outputs/phase-12/implementation-guide.md`               | OK(>=1) |
| 1-5 | API/IPC/Component文書 | `ls outputs/phase-12/*-documentation.md 2>/dev/null \| wc -l`                | OK(>=1) |

### Task 3: documentation-changelog

| #   | チェック項目        | コマンド / 確認方法                                         | 結果    |
| --- | ------------------- | ----------------------------------------------------------- | ------- |
| 3-1 | ファイル実在        | `ls -la outputs/phase-12/documentation-changelog.md`        | OK/NG   |
| 3-2 | 変更記録1件以上存在 | `grep -c "^\|" outputs/phase-12/documentation-changelog.md` | OK(>=3) |

### Task 4: 未タスク検出

| #   | チェック項目        | コマンド / 確認方法                                    | 結果  |
| --- | ------------------- | ------------------------------------------------------ | ----- |
| 4-1 | ファイル実在        | `ls -la outputs/phase-12/unassigned-task-detection.md` | OK/NG |
| 4-2 | 0件でもファイル存在 | 4-1と同一（0件でもファイルが存在することを確認）       | OK/NG |

### Task 5: スキルフィードバック

| #   | チェック項目        | コマンド / 確認方法                                     | 結果  |
| --- | ------------------- | ------------------------------------------------------- | ----- |
| 5-1 | ファイル実在        | `ls -la outputs/phase-12/skill-feedback-report.md`      | OK/NG |
| 5-2 | 0件でもファイル存在 | 5-1と同一（改善点なしでもファイルが存在することを確認） | OK/NG |
```

**結果列の記入規約**:

| 結果値  | 意味                                       |
| ------- | ------------------------------------------ |
| OK      | 検証コマンドの出力が期待値を満たした       |
| OK(>=1) | 検証コマンドの出力が1以上であることを確認  |
| OK(>=3) | 検証コマンドの出力が3以上であることを確認  |
| NG      | 検証コマンドの出力が期待値を満たさなかった |

---

### セクション6: スクリーンショット証跡

UIタスクの場合はS-1〜S-4の4項目、非UIタスクの場合はN/Aを記録する。

**UIタスクの場合**:

```markdown
## スクリーンショット証跡

### 判定: UIタスク

判定条件に該当した項目: <条件1/条件2/条件3>

| #   | チェック項目   | コマンド / 確認方法                | 結果         |
| --- | -------------- | ---------------------------------- | ------------ |
| S-1 | ファイル実在   | `ls -la <screenshotPath>`          | OK/NG        |
| S-2 | 取得日確認     | `stat -f "%Sm" <screenshotPath>`   | <YYYY-MM-DD> |
| S-3 | 取得日の合理性 | ブランチ作成日以降であることを確認 | OK/NG        |
| S-4 | 内容目視確認   | 該当画面と一致することを目視で確認 | OK/NG        |
```

**非UIタスクの場合**:

```markdown
## スクリーンショット証跡

### 判定: 非UIタスク

以下の3条件のいずれにも該当しないため、スクリーンショット検証はN/Aとする:

- タスク分類に「UI」を含まない
- 実装対象にRendererコンポーネント（.tsx）を含まない
- Phase 11 手動テストにUI操作を含まない

| #   | チェック項目       | 結果                        |
| --- | ------------------ | --------------------------- |
| S-1 | スクリーンショット | N/A（UIタスクではないため） |
```

---

### セクション7: current/baseline分離

workflow別にBaseline/Currentの違反を分離記録し、統合判定テーブルで最終合否を決定する。

```markdown
## current/baseline分離（Workflow別）

### spec_created workflow: <PATH-1>

#### Baseline Violations（タスク着手前から存在）

| #   | 違反内容 | 検出元スクリプト    | 初検出タスク |
| --- | -------- | ------------------- | ------------ |
| ... | ...      | verify-all-specs.js | ...          |

**Baseline合計**: <N>件

#### Current Violations（今回のタスクで新規発生）

| #   | 違反内容 | 検出元スクリプト | 対処 |
| --- | -------- | ---------------- | ---- |
| --- | ---      | ---              | ---  |

**Current合計**: <N>件

### completed workflow: <PATH-2>

#### Baseline Violations（タスク着手前から存在）

| #   | 違反内容 | 検出元スクリプト    | 初検出タスク |
| --- | -------- | ------------------- | ------------ |
| ... | ...      | verify-all-specs.js | ...          |

**Baseline合計**: <N>件

#### Current Violations（今回のタスクで新規発生）

| #   | 違反内容 | 検出元スクリプト | 対処 |
| --- | -------- | ---------------- | ---- |
| --- | ---      | ---              | ---  |

**Current合計**: <N>件

### 統合判定

| Workflow     | Current | Baseline | 判定          |
| ------------ | ------- | -------- | ------------- |
| spec_created | <N>     | <N>      | PASS/FAIL     |
| completed    | <N>     | <N>      | PASS/FAIL     |
| **統合結果** | **<N>** | **<N>**  | **PASS/FAIL** |

- **判定基準**: `currentViolations.total === 0`（全workflowの合算）
- **Baseline違反の扱い**: 未タスクとして別途管理（PASS/FAIL判定に影響しない）
```

---

### セクション8: 台帳同期チェック

```markdown
## 台帳同期チェック

### Step 5-A: task-workflow.md

| #     | チェック項目                 | 確認方法                                                                              | 結果   |
| ----- | ---------------------------- | ------------------------------------------------------------------------------------- | ------ |
| 5-A-1 | 完了タスクテーブルに行追加   | `grep "<TASK-ID>" .claude/skills/aiworkflow-requirements/references/task-workflow.md` | OK/NG  |
| 5-A-2 | 残課題テーブル更新（該当時） | 未タスク検出時のみ。検出なしの場合は「該当なし」と記録                                | OK/N/A |

### Step 5-B: lessons-learned.md

| #     | チェック項目            | 確認方法                                                                                            | 結果   |
| ----- | ----------------------- | --------------------------------------------------------------------------------------------------- | ------ |
| 5-B-1 | 新規教訓の追記          | 教訓検出時: `grep "<TASK-ID>" .claude/skills/aiworkflow-requirements/references/lessons-learned.md` | OK/N/A |
| 5-B-2 | 教訓なしの場合のN/A記録 | 教訓未検出時: 「教訓検出なし」と記録                                                                | N/A    |

### Step 5-C: LOGS.md x2（P1/P25対策）

| #     | チェック項目                           | 確認方法                                                             | 結果  |
| ----- | -------------------------------------- | -------------------------------------------------------------------- | ----- |
| 5-C-1 | aiworkflow-requirements LOGS.md更新    | `grep "<TASK-ID>" .claude/skills/aiworkflow-requirements/LOGS.md`    | OK/NG |
| 5-C-2 | task-specification-creator LOGS.md更新 | `grep "<TASK-ID>" .claude/skills/task-specification-creator/LOGS.md` | OK/NG |
| 5-C-3 | 2ファイル両方の更新確認                | 5-C-1 と 5-C-2 の両方が OK であることを確認                          | OK/NG |
```

## 検証コマンド一覧

### 2workflow同時監査実行コマンド

```bash
# 変数設定
WORKFLOW_1="docs/30-workflows/<SPEC-CREATED-PATH>"
WORKFLOW_2="docs/30-workflows/<COMPLETED-PATH>"

# verify-all-specs を各workflowに対して実行
echo "=== spec_created workflow: verify-all-specs ==="
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow "$WORKFLOW_1"

echo ""
echo "=== completed workflow: verify-all-specs ==="
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow "$WORKFLOW_2"

# validate-phase-output を各workflowに対して実行
echo ""
echo "=== spec_created workflow: validate-phase-output ==="
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js --workflow "$WORKFLOW_1"

echo ""
echo "=== completed workflow: validate-phase-output ==="
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js --workflow "$WORKFLOW_2"
```

### Task 1/3/4/5 一括存在確認コマンド

```bash
# 変数設定
WF_DIR="docs/30-workflows/<TASK-ID>"

# 必須ファイルの一括確認
REQUIRED=(
  "outputs/phase-12/implementation-guide.md"
  "outputs/phase-12/documentation-changelog.md"
  "outputs/phase-12/unassigned-task-detection.md"
  "outputs/phase-12/skill-feedback-report.md"
)

echo "=== Task 1/3/4/5 成果物存在確認 ==="
PASS=0
FAIL=0
for f in "${REQUIRED[@]}"; do
  if [ -f "$WF_DIR/$f" ]; then
    echo "OK: $f"
    PASS=$((PASS + 1))
  else
    echo "NG: $f (MISSING)"
    FAIL=$((FAIL + 1))
  fi
done

echo ""
echo "結果: PASS=$PASS / FAIL=$FAIL"

# Part 1/Part 2 セクション確認
GUIDE="$WF_DIR/outputs/phase-12/implementation-guide.md"
if [ -f "$GUIDE" ]; then
  echo ""
  echo "=== implementation-guide.md セクション確認 ==="
  P1=$(grep -c "## Part 1" "$GUIDE" || echo 0)
  P2=$(grep -c "## Part 2" "$GUIDE" || echo 0)
  ANALOGY=$(grep -cE "例え|たとえ|アナロジ" "$GUIDE" || echo 0)
  echo "Part 1 セクション: $P1 (期待値: >= 1)"
  echo "Part 2 セクション: $P2 (期待値: >= 1)"
  echo "日常例え: $ANALOGY (期待値: >= 1)"
fi

# API/IPC/Component文書確認
echo ""
echo "=== ドキュメント文書確認 ==="
DOC_COUNT=$(ls "$WF_DIR"/outputs/phase-12/*-documentation.md 2>/dev/null | wc -l | tr -d ' ')
echo "ドキュメント文書数: $DOC_COUNT (期待値: >= 1)"
```

### baseline取得コマンド（git worktreeベース）

```bash
# baseline取得（mainブランチでの違反数を安全に取得）
# 注意: git stashはリスクがあるため、git worktreeベースで取得する

WORKFLOW_1="docs/30-workflows/<SPEC-CREATED-PATH>"
WORKFLOW_2="docs/30-workflows/<COMPLETED-PATH>"

# 一時worktreeを作成
WORKTREE_DIR=$(mktemp -d)
echo "Baseline取得用worktree: $WORKTREE_DIR"
git worktree add "$WORKTREE_DIR" main --detach 2>/dev/null

# Baseline違反数を取得
echo ""
echo "=== Baseline取得（mainブランチ） ==="
BASELINE_1=$(cd "$WORKTREE_DIR" && node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow "$WORKFLOW_1" 2>/dev/null | grep -c "VIOLATION" || echo 0)
BASELINE_2=$(cd "$WORKTREE_DIR" && node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow "$WORKFLOW_2" 2>/dev/null | grep -c "VIOLATION" || echo 0)

echo "Baseline (spec_created): $BASELINE_1"
echo "Baseline (completed): $BASELINE_2"

# worktree削除
git worktree remove "$WORKTREE_DIR" 2>/dev/null
echo "worktree削除完了"
```

### current/baseline差分計算コマンド

```bash
# Current違反数を取得（現在ブランチ）
WORKFLOW_1="docs/30-workflows/<SPEC-CREATED-PATH>"
WORKFLOW_2="docs/30-workflows/<COMPLETED-PATH>"

echo "=== Current取得（タスクブランチ） ==="
CURRENT_1=$(node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow "$WORKFLOW_1" 2>/dev/null | grep -c "VIOLATION" || echo 0)
CURRENT_2=$(node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow "$WORKFLOW_2" 2>/dev/null | grep -c "VIOLATION" || echo 0)

echo "Current total (spec_created): $CURRENT_1"
echo "Current total (completed): $CURRENT_2"

# 差分計算（Baseline値は先行して取得済みの値を使用）
# BASELINE_1, BASELINE_2 は baseline取得コマンドで取得した値
NEW_1=$((CURRENT_1 - BASELINE_1))
NEW_2=$((CURRENT_2 - BASELINE_2))

# 負の値を0にクランプ（baselineの方が多い場合は新規違反0件）
[ "$NEW_1" -lt 0 ] && NEW_1=0
[ "$NEW_2" -lt 0 ] && NEW_2=0

echo ""
echo "=== 差分結果 ==="
echo "新規違反 (spec_created): $NEW_1"
echo "新規違反 (completed): $NEW_2"

TOTAL_NEW=$((NEW_1 + NEW_2))
echo ""
echo "=== 統合判定 ==="
if [ "$TOTAL_NEW" -eq 0 ]; then
  echo "判定: PASS (currentViolations.total === 0)"
else
  echo "判定: FAIL (currentViolations.total === $TOTAL_NEW)"
fi
```

## フィールド型定義

### FR-1: 2workflow証跡集約フォーマットのフィールド

| フィールド名         | 型       | 必須 | 制約                                     | 説明                                                            |
| -------------------- | -------- | ---- | ---------------------------------------- | --------------------------------------------------------------- |
| taskId               | string   | Yes  | `^[A-Z]+-[A-Z0-9-]+$` パターン           | タスクID（例: UT-IMP-PHASE12-TWO-WORKFLOW-EVIDENCE-BUNDLE-001） |
| workflowType         | enum     | Yes  | `spec_created` \| `completed`            | workflowの種別                                                  |
| workflowPath         | string   | Yes  | `docs/30-workflows/` で始まること        | workflowディレクトリの相対パス                                  |
| verifyAllSpecsResult | object   | Yes  | `totalViolations` >= 0                   | verify-all-specs の実行結果                                     |
| validatePhaseResult  | object   | Yes  | `totalErrors` >= 0                       | validate-phase-output の実行結果                                |
| auditTimestamp       | ISO 8601 | Yes  | `YYYY-MM-DDTHH:mm:ssZ` 形式              | 監査実行日時                                                    |
| auditor              | string   | Yes  | `lead` または `SubAgent-` プレフィックス | 監査実行者                                                      |

### FR-2: Task 1/3/4/5 実体確認のフィールド

| フィールド名       | 型     | 必須 | 制約               | 説明                                 |
| ------------------ | ------ | ---- | ------------------ | ------------------------------------ |
| checkId            | string | Yes  | `[1-5]-[1-5]` 形式 | チェック項目ID（例: 1-1, 3-2）       |
| checkDescription   | string | Yes  | 空文字列不可       | チェック項目の説明                   |
| verificationMethod | string | Yes  | 空文字列不可       | 検証コマンドまたは確認手順           |
| result             | enum   | Yes  | `OK` \| `NG`       | 検証結果                             |
| expectedValue      | string | No   | ---                | 期待値（数値比較の場合: `>=1` 形式） |

### FR-3: UIスクリーンショット検証のフィールド

| フィールド名   | 型       | 必須              | 制約                    | 説明                                                         |
| -------------- | -------- | ----------------- | ----------------------- | ------------------------------------------------------------ |
| isUITask       | boolean  | Yes               | 3条件判定で決定         | UIタスクかどうかの判定結果                                   |
| screenshotPath | string   | UIタスク時のみYes | 相対パス形式            | スクリーンショットファイルの相対パス                         |
| captureDate    | ISO 8601 | UIタスク時のみYes | ブランチ作成日以降      | スクリーンショット取得日                                     |
| fileExists     | boolean  | UIタスク時のみYes | `ls -la` コマンドで検証 | ファイルの物理的存在を確認した結果                           |
| contentMatch   | boolean  | UIタスク時のみYes | 目視確認                | スクリーンショットの内容が該当画面と一致するかの目視確認結果 |

### FR-4: current/baseline分離判定のフィールド

| フィールド名               | 型     | 必須 | 制約                                                     | 説明                                       |
| -------------------------- | ------ | ---- | -------------------------------------------------------- | ------------------------------------------ |
| currentViolations.total    | number | Yes  | >= 0                                                     | 今回のタスクで新規発生した違反の合計数     |
| currentViolations.details  | array  | Yes  | 各要素に `content`, `script` フィールド                  | 新規違反の詳細リスト                       |
| baselineViolations.total   | number | Yes  | >= 0                                                     | タスク着手前から存在する既知の違反の合計数 |
| baselineViolations.details | array  | Yes  | 各要素に `content`, `script`, `firstDetected` フィールド | 既知違反の詳細リスト                       |
| judgmentBasis              | string | Yes  | 固定値: `currentViolations.total === 0`                  | 判定基準の説明                             |
| result                     | enum   | Yes  | `PASS` \| `FAIL`                                         | 合否判定結果                               |
