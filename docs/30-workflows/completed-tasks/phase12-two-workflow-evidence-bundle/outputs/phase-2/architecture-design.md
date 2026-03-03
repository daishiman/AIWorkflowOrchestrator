# Phase 2 成果物: 証跡集約アーキテクチャ設計

## メタ情報

| 項目       | 値                                              |
| ---------- | ----------------------------------------------- |
| Phase      | 2 --- 設計                                      |
| 機能名     | Phase 12 2workflow同時監査の証跡集約ガード      |
| タスクID   | UT-IMP-PHASE12-TWO-WORKFLOW-EVIDENCE-BUNDLE-001 |
| 作成日     | 2026-03-03                                      |
| 依存成果物 | Phase 1 要件定義書（phase-1-requirements.md）   |
| ステータス | Draft                                           |

## アーキテクチャ概要

本設計は5つのコンポーネントで構成される。各コンポーネントは FR-1〜FR-4 および NFR-1〜NFR-3 を満たすように設計されている。

### コンポーネント1: 証跡集約テンプレート（evidence-bundle.md 形式）

2つの workflow（`spec_created` と `completed`）の監査結果を横並びで1ファイルに記録するテンプレート。

**テンプレート構造**:

```
evidence-bundle.md
├── セクション1: メタ情報
│   ├── タスクID
│   ├── 監査実行日（ISO 8601）
│   └── 監査実行者（lead / SubAgent名）
├── セクション2: 2Workflow監査結果サマリー
│   └── 横並びテーブル（spec_created | completed）
│       ├── workflowパス
│       ├── verify-all-specs violations（数値）
│       ├── validate-phase-output errors（数値）
│       └── 監査日時
├── セクション3: verify-all-specs 詳細
│   ├── spec_created workflow テーブル（違反内容, 種別, 重要度）
│   └── completed workflow テーブル（違反内容, 種別, 重要度）
├── セクション4: validate-phase-output 詳細
│   ├── spec_created workflow テーブル（エラー内容, Phase, 対処）
│   └── completed workflow テーブル（エラー内容, Phase, Phase, 対処）
├── セクション5: Task実体確認チェックリスト（11項目）
├── セクション6: スクリーンショット証跡
├── セクション7: current/baseline分離（統合判定テーブル付き）
└── セクション8: 台帳同期チェック（Step 5-A〜5-C）
```

**設計判断**:

- 2workflow の結果を同一テーブル内の列（`spec_created` | `completed`）として横並び配置することで、差異を一目で比較可能にする（FR-1, AC-1-1 対応）
- `workflowType` フィールドで `spec_created` と `completed` を区別する（AC-1-2 対応）
- 各 workflow に対して `verifyAllSpecsResult` と `validatePhaseResult` の両方を必須記録とする（AC-1-3 対応）

### コンポーネント2: Task 1/3/4/5 実体確認チェックリスト

11項目のチェックリスト（Task 1: 5項目、Task 3: 2項目、Task 4: 2項目、Task 5: 2項目）で構成される。各項目には検証コマンドが付与される。

**チェック項目一覧**:

| 項目ID | Task   | チェック項目          | 検証コマンド                                                                 |
| ------ | ------ | --------------------- | ---------------------------------------------------------------------------- |
| 1-1    | Task 1 | ファイル実在          | `ls -la outputs/phase-12/implementation-guide.md`                            |
| 1-2    | Task 1 | Part 1 セクション存在 | `grep -c "## Part 1" outputs/phase-12/implementation-guide.md`               |
| 1-3    | Task 1 | Part 1 日常例え存在   | `grep -cE "例え\|たとえ\|アナロジ" outputs/phase-12/implementation-guide.md` |
| 1-4    | Task 1 | Part 2 セクション存在 | `grep -c "## Part 2" outputs/phase-12/implementation-guide.md`               |
| 1-5    | Task 1 | API/IPC/Component文書 | `ls outputs/phase-12/*-documentation.md 2>/dev/null \| wc -l`                |
| 3-1    | Task 3 | ファイル実在          | `ls -la outputs/phase-12/documentation-changelog.md`                         |
| 3-2    | Task 3 | 変更記録1件以上存在   | `grep -c "^\|" outputs/phase-12/documentation-changelog.md`                  |
| 4-1    | Task 4 | ファイル実在          | `ls -la outputs/phase-12/unassigned-task-detection.md`                       |
| 4-2    | Task 4 | 0件でもファイル存在   | 4-1と同一（0件でもファイルが存在することを確認）                             |
| 5-1    | Task 5 | ファイル実在          | `ls -la outputs/phase-12/skill-feedback-report.md`                           |
| 5-2    | Task 5 | 0件でもファイル存在   | 5-1と同一（改善点なしでもファイルが存在することを確認）                      |

**一括検証シェルスクリプト設計**:

```bash
#!/bin/bash
# Task 1/3/4/5 成果物一括存在確認スクリプト
# 使用方法: ./verify-task-artifacts.sh <workflow-dir>

set -euo pipefail

WF_DIR="${1:?Usage: $0 <workflow-dir>}"
PASS=0
FAIL=0

check() {
  local id="$1"
  local desc="$2"
  local cmd="$3"
  local expect="$4"

  result=$(eval "$cmd" 2>/dev/null || echo "0")
  if [ "$result" -ge "$expect" ] 2>/dev/null || [ -f "$result" ] 2>/dev/null; then
    echo "OK [$id] $desc"
    PASS=$((PASS + 1))
  else
    echo "NG [$id] $desc"
    FAIL=$((FAIL + 1))
  fi
}

GUIDE="$WF_DIR/outputs/phase-12/implementation-guide.md"

# Task 1: 実装ガイド
[ -f "$GUIDE" ] && { echo "OK [1-1] ファイル実在"; PASS=$((PASS+1)); } || { echo "NG [1-1] ファイル実在 (MISSING)"; FAIL=$((FAIL+1)); }
[ -f "$GUIDE" ] && P1=$(grep -c "## Part 1" "$GUIDE" || echo 0) || P1=0
[ "$P1" -ge 1 ] && { echo "OK [1-2] Part 1 セクション存在 ($P1)"; PASS=$((PASS+1)); } || { echo "NG [1-2] Part 1 セクション存在 ($P1)"; FAIL=$((FAIL+1)); }
[ -f "$GUIDE" ] && P1E=$(grep -cE "例え|たとえ|アナロジ" "$GUIDE" || echo 0) || P1E=0
[ "$P1E" -ge 1 ] && { echo "OK [1-3] Part 1 日常例え存在 ($P1E)"; PASS=$((PASS+1)); } || { echo "NG [1-3] Part 1 日常例え存在 ($P1E)"; FAIL=$((FAIL+1)); }
[ -f "$GUIDE" ] && P2=$(grep -c "## Part 2" "$GUIDE" || echo 0) || P2=0
[ "$P2" -ge 1 ] && { echo "OK [1-4] Part 2 セクション存在 ($P2)"; PASS=$((PASS+1)); } || { echo "NG [1-4] Part 2 セクション存在 ($P2)"; FAIL=$((FAIL+1)); }
DOCS=$(ls "$WF_DIR"/outputs/phase-12/*-documentation.md 2>/dev/null | wc -l | tr -d ' ')
[ "$DOCS" -ge 1 ] && { echo "OK [1-5] API/IPC/Component文書 ($DOCS)"; PASS=$((PASS+1)); } || { echo "NG [1-5] API/IPC/Component文書 ($DOCS)"; FAIL=$((FAIL+1)); }

# Task 3: documentation-changelog
CL="$WF_DIR/outputs/phase-12/documentation-changelog.md"
[ -f "$CL" ] && { echo "OK [3-1] ファイル実在"; PASS=$((PASS+1)); } || { echo "NG [3-1] ファイル実在 (MISSING)"; FAIL=$((FAIL+1)); }
[ -f "$CL" ] && ROWS=$(grep -c "^|" "$CL" || echo 0) || ROWS=0
[ "$ROWS" -ge 3 ] && { echo "OK [3-2] 変更記録存在 ($ROWS行)"; PASS=$((PASS+1)); } || { echo "NG [3-2] 変更記録存在 ($ROWS行)"; FAIL=$((FAIL+1)); }

# Task 4: 未タスク検出
UT="$WF_DIR/outputs/phase-12/unassigned-task-detection.md"
[ -f "$UT" ] && { echo "OK [4-1] ファイル実在"; PASS=$((PASS+1)); } || { echo "NG [4-1] ファイル実在 (MISSING)"; FAIL=$((FAIL+1)); }
[ -f "$UT" ] && { echo "OK [4-2] 0件でもファイル存在確認"; PASS=$((PASS+1)); } || { echo "NG [4-2] 0件でもファイル存在確認 (MISSING)"; FAIL=$((FAIL+1)); }

# Task 5: スキルフィードバック
SF="$WF_DIR/outputs/phase-12/skill-feedback-report.md"
[ -f "$SF" ] && { echo "OK [5-1] ファイル実在"; PASS=$((PASS+1)); } || { echo "NG [5-1] ファイル実在 (MISSING)"; FAIL=$((FAIL+1)); }
[ -f "$SF" ] && { echo "OK [5-2] 0件でもファイル存在確認"; PASS=$((PASS+1)); } || { echo "NG [5-2] 0件でもファイル存在確認 (MISSING)"; FAIL=$((FAIL+1)); }

echo ""
echo "========================================="
echo "結果: PASS=$PASS / FAIL=$FAIL / TOTAL=$((PASS+FAIL))"
[ "$FAIL" -eq 0 ] && echo "判定: ALL OK" || echo "判定: FAILED ($FAIL items)"
```

### コンポーネント3: UIスクリーンショット検証手順

UI/非UI分岐ロジックを3条件判定で定義し、UIタスクの場合はS-1〜S-4の4項目、非UIタスクの場合はN/A記録とする。

**分岐判定フローチャート**:

```
タスクをUIタスクと判定するか？
├── 条件1: タスク分類に「UI」を含む（例: TASK-UI-xx）→ Yes → UIタスク
├── 条件2: 実装対象にRendererコンポーネント（.tsx）を含む → Yes → UIタスク
├── 条件3: Phase 11 手動テストにUI操作を含む → Yes → UIタスク
└── 上記いずれにも該当しない → 非UIタスク → N/A記録
```

**UIタスクの検証項目**:

| 項目ID | チェック項目   | 検証方法                                                              | 期待値                    |
| ------ | -------------- | --------------------------------------------------------------------- | ------------------------- |
| S-1    | ファイル実在   | `ls -la <screenshotPath>`                                             | ファイルが存在すること    |
| S-2    | 取得日確認     | `stat -f "%Sm" <screenshotPath>`（macOS）またはファイルメタデータ確認 | ISO 8601形式の日付        |
| S-3    | 取得日の合理性 | タスクブランチ作成日以降であること                                    | ブランチ作成日 <= 取得日  |
| S-4    | 内容目視確認   | 該当画面のスクリーンショットであることを目視で確認                    | OK（一致） / NG（不一致） |

**非UIタスクの記録**:

| 項目ID | チェック項目       | 結果                        |
| ------ | ------------------ | --------------------------- |
| S-1    | スクリーンショット | N/A（UIタスクではないため） |

**本タスクへの適用**: UT-IMP-PHASE12-TWO-WORKFLOW-EVIDENCE-BUNDLE-001 はドキュメント改善タスクであり、3条件のいずれにも該当しない。スクリーンショット検証は N/A と記録する。

### コンポーネント4: current/baseline分離記録フォーマット

workflow別にBaseline/Currentを分離記録し、統合判定テーブルで最終合否を決定する。

**分離記録構造**:

```
current/baseline分離
├── spec_created workflow
│   ├── Baseline Violations テーブル
│   │   ├── # | 違反内容 | 検出元スクリプト | 初検出タスク
│   │   └── Baseline合計: N件
│   └── Current Violations テーブル
│       ├── # | 違反内容 | 検出元スクリプト | 対処
│       └── Current合計: N件
├── completed workflow
│   ├── Baseline Violations テーブル
│   └── Current Violations テーブル
└── 統合判定テーブル
    ├── Workflow | Current | Baseline | 判定
    ├── spec_created | 0 | N | PASS/FAIL
    ├── completed | 0 | N | PASS/FAIL
    └── 統合結果 | 0 | N | PASS/FAIL
```

**判定基準**:

- 合否判定: `currentViolations.total === 0`（全workflowの合算値）
- `currentViolations.total === 0` の場合: **PASS**
- `currentViolations.total > 0` の場合: **FAIL**
- `baselineViolations` は PASS/FAIL 判定に影響しない（監視値として記録のみ）

**Baseline取得方法**:

- git worktreeベースで main ブランチの違反を取得する（`git stash` は状態復元リスクがあるため使用しない）
- 差分計算: `Current新規違反 = 全違反 - Baseline違反`

### コンポーネント5: 台帳同期手順

3ステップで台帳同期を実施する。P43対策としてSubAgent 1体あたり3ファイル以下の制約を遵守する。

**同期ステップ構成**:

| ステップ   | 対象ファイル                                                           | 更新内容                     |
| ---------- | ---------------------------------------------------------------------- | ---------------------------- |
| Step 5-A   | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`   | 完了タスクテーブルへの行追加 |
| Step 5-B   | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` | 新規教訓の追記（検出時のみ） |
| Step 5-C-1 | `.claude/skills/aiworkflow-requirements/LOGS.md`                       | タスク完了記録               |
| Step 5-C-2 | `.claude/skills/task-specification-creator/LOGS.md`                    | タスク完了記録               |

**P1/P25対策**: Step 5-C は LOGS.md を2ファイル（`aiworkflow-requirements` と `task-specification-creator`）同時更新する。片方の更新忘れを防止するため、同一ステップ内で連続実行する。

**P43対策**: SubAgent 1体あたりの更新ファイル数を3ファイル以下に制限する。

| SubAgent割当 | 担当ファイル                                                 | ファイル数 |
| ------------ | ------------------------------------------------------------ | ---------- |
| SubAgent A   | Step 5-A（task-workflow.md）+ Step 5-B（lessons-learned.md） | 2ファイル  |
| SubAgent B   | Step 5-C-1（LOGS.md #1）+ Step 5-C-2（LOGS.md #2）           | 2ファイル  |

## FR/NFR設計対応表

| 要件ID | 要件名                              | 対応コンポーネント                          | 対応箇所                                              |
| ------ | ----------------------------------- | ------------------------------------------- | ----------------------------------------------------- |
| FR-1   | 2workflow証跡集約フォーマット       | コンポーネント1（証跡集約テンプレート）     | サマリーテーブルの横並び列構造                        |
| FR-2   | Task 1/3/4/5 実体確認チェックリスト | コンポーネント2（実体確認チェックリスト）   | 11項目チェックリスト + 一括検証シェルスクリプト       |
| FR-3   | UIスクリーンショット検証手順        | コンポーネント3（UIスクリーンショット検証） | 3条件分岐 + S-1〜S-4 / N/A 記録                       |
| FR-4   | current/baseline分離判定            | コンポーネント4（分離記録フォーマット）     | 統合判定テーブル + 判定基準固定                       |
| NFR-1  | 再監査時の再現性                    | コンポーネント1, 2, 4                       | コピー&ペースト実行可能な検証コマンド                 |
| NFR-2  | 機械検証可能性                      | コンポーネント2, 4                          | `[x]`/`[ ]` パターンマッチ + 数値比較判定             |
| NFR-3  | 既存監査スクリプト互換性            | コンポーネント1, 4                          | verify-all-specs.js/validate-phase-output.js 出力互換 |

## 統合テスト連携設計

### verify-all-specs.js との連携

- 入力: 2workflow各々のディレクトリパス
- 出力: violations配列（`{ content: string, type: string, severity: string }[]`）
- 連携方法: スクリプト出力をテンプレートのセクション3（verify-all-specs詳細）に転記する
- current/baseline分離: Baseline（mainブランチ実行結果）と Current（タスクブランチ実行結果）の差分を計算する

### validate-phase-output.js との連携

- 入力: 2workflow各々のディレクトリパス
- 出力: errors配列（`{ content: string, phase: string, action: string }[]`）
- 連携方法: スクリプト出力をテンプレートのセクション4（validate-phase-output詳細）に転記する

### artifacts.json との連携

- 対象フィールド: `phases["12"].audit`
- 拡張方法: 既存スキーマに `evidenceBundle` フィールドを追加する（破壊的変更なし）
- 格納データ: current/baseline分離結果の統合判定（PASS/FAIL）

```json
{
  "phases": {
    "12": {
      "status": "completed",
      "audit": {
        "evidenceBundle": {
          "specCreated": {
            "currentViolations": 0,
            "baselineViolations": 5
          },
          "completed": {
            "currentViolations": 0,
            "baselineViolations": 3
          },
          "judgment": "PASS",
          "judgmentBasis": "currentViolations.total === 0"
        }
      }
    }
  }
}
```

### phase-12-documentation.md チェック同期

- 対象: Phase 12仕様書内の `[x]`/`[ ]` チェックリスト
- 連携方法: チェックリストの完了状態をカウントし、証跡集約テンプレートの完了率として記録する
- カウントコマンド: `grep -c "\[x\]" phase-12-documentation.md` / `grep -c "\[ \]" phase-12-documentation.md`

## 既知の落とし穴対策設計

| Pitfall ID | タイトル                      | 対策設計                                                                                                   |
| ---------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------- |
| P1         | LOGS.md 2ファイル更新漏れ     | Step 5-Cで2ファイル（aiworkflow-requirements/task-specification-creator）を同一ステップ内で連続更新する    |
| P4         | changelog早期「完了」記載     | evidence-bundle.mdの全セクション記入完了後にのみ「完了」ステータスを記録する                               |
| P25        | LOGS.md 2ファイル更新漏れ再発 | P1と同一対策。Step 5-Cのチェックリストに「2ファイル両方」を明記する                                        |
| P26        | システム仕様書更新遅延        | Phase 12完了時点でシステム仕様書を更新する。PRマージを待たない                                             |
| P28        | スキルフィードバック未作成    | Task 5（スキルフィードバック）を必須成果物としてチェックリストに含める。改善点なしでもファイル作成を必須化 |
| P43        | SubAgent rate limit中断       | SubAgent 1体あたり3ファイル以下に分割する。LOGS.mdへの「完了」記録は全ファイル更新後の最終ステップとする   |

### P43対策の具体的なSubAgent分割設計

Phase 12 の台帳同期をSubAgentに委譲する場合、以下のルールを適用する:

1. **3ファイル上限ルール**: SubAgent 1体あたりの更新ファイル数は3ファイル以下とする
2. **完了記録の後回し**: LOGS.mdへの「完了」記録は全ファイル更新完了後の最終ステップとする
3. **中断検知**: SubAgent中断後は `git diff --stat -- .claude/skills/` で実際の変更ファイルを確認する

### P4対策の具体的な実施手順

1. evidence-bundle.mdのセクション1〜8を全て記入する
2. 全セクションの記入が完了したことを確認する
3. documentation-changelog.mdに「完了」と記載する（全Step完了後のみ）
4. 「完了」記載前に未記入セクションがないことを再確認する
