# Phase 2: 設計 — UT-IMP-PHASE12-TWO-WORKFLOW-EVIDENCE-BUNDLE-001

## メタ情報

| 項目       | 値                                              |
| ---------- | ----------------------------------------------- |
| Phase      | 2 — 設計                                        |
| 機能名     | Phase 12 2workflow同時監査の証跡集約ガード      |
| タスクID   | UT-IMP-PHASE12-TWO-WORKFLOW-EVIDENCE-BUNDLE-001 |
| 作成日     | 2026-03-03                                      |
| 依存成果物 | Phase 1 要件定義書                              |
| ステータス | Draft                                           |

## 目的

Phase 1 で定義した FR-1〜FR-4、NFR-1〜NFR-3 を満たす具体的な設計を行い、2workflow証跡集約テンプレート構造・Task 1/3/4/5 実体確認チェックリスト・UIスクリーンショット検証手順・current/baseline分離記録フォーマット・台帳同期手順を確定する。

## 実行タスク

- 証跡集約テンプレートのフォーマット設計: FR-1の2workflow結果を1表に記録するテンプレートを設計する。
- Task 1/3/4/5 実体確認チェックリストの構造設計: FR-2の6項目チェックリストを検証コマンド付きで設計する。
- UIスクリーンショット存在確認手順の設計: FR-3のスクリーンショット検証をUIタスク/非UIタスクの分岐込みで設計する。
- current/baseline分離記録フォーマットの設計: FR-4の合否基準を `currentViolations.total === 0` で固定した記録フォーマットを設計する。
- `task-workflow.md`/`lessons-learned.md`同期手順の設計: 証跡集約結果を既存台帳に反映する手順を設計する。

| #   | タスク名                                          | 内容                                                                        |
| --- | ------------------------------------------------- | --------------------------------------------------------------------------- |
| 1   | 証跡集約テンプレートのフォーマット設計            | FR-1の2workflow結果を1表に記録するテンプレートを設計する                    |
| 2   | Task 1/3/4/5 実体確認チェックリストの構造設計     | FR-2の6項目チェックリストを検証コマンド付きで設計する                       |
| 3   | UIスクリーンショット存在確認手順の設計            | FR-3のスクリーンショット検証をUI/非UI分岐込みで設計する                     |
| 4   | current/baseline分離記録フォーマットの設計        | FR-4の合否基準固定（currentViolations.total === 0）のフォーマットを設計する |
| 5   | task-workflow.md/lessons-learned.md同期手順の設計 | 証跡集約結果を既存台帳に反映する手順を設計する                              |

## 参照資料

| #   | 資料名                         | パス                                                                                | 用途                               |
| --- | ------------------------------ | ----------------------------------------------------------------------------------- | ---------------------------------- |
| 1   | Phase 1 要件定義書             | `phase-1-requirements.md`                                                           | FR/NFR/ACの参照                    |
| 2   | Phase 12レトロテンプレート     | `.claude/skills/skill-creator/assets/phase12-system-spec-retrospective-template.md` | 既存テンプレート構造の参照         |
| 3   | 仕様更新ワークフロー           | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`      | Phase 12更新手順の参照             |
| 4   | 品質基準                       | `.claude/skills/task-specification-creator/references/quality-standards.md`         | 品質基準の設計反映                 |
| 5   | 既知の落とし穴                 | `.claude/rules/06-known-pitfalls.md`                                                | P43（rate limit）P1（LOGS.md）対策 |
| 6   | タスクワークフロー             | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                | 完了台帳・検証証跡の同期構造参照   |
| 7   | aiworkflowクイックリファレンス | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                 | 仕様探索の初期導線                 |
| 8   | aiworkflowリソースマップ       | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                    | タスク種別ごとの参照先抽出         |
| 9   | aiworkflowトピックマップ       | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                       | 参照セクションの行位置特定         |
| 10  | 仕様検索スクリプト             | `.claude/skills/aiworkflow-requirements/scripts/search-spec.js`                     | キーワード検索で対象仕様を抽出     |

## 実行手順

### Step 0: aiworkflow-requirements から必要仕様を抽出（必須）

まず `resource-map.md` を起点に本タスクの参照対象を絞り込み、`topic-map.md` と `search-spec.js` で必要セクションを特定する。

```bash
# 仕様探索（Progressive Disclosure）
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "task-workflow" -C 5
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "lessons-learned" -C 5
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "currentViolations" -C 5
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "baselineViolations" -C 5
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "documentation-changelog" -C 5
```

**抽出対象（本タスクで必須）**:

| 関心ごと      | 抽出元仕様                                                      | 使う情報                                            |
| ------------- | --------------------------------------------------------------- | --------------------------------------------------- |
| 台帳同期      | `references/task-workflow.md`                                   | 完了タスク記録形式、残課題テーブル更新規約          |
| 教訓同期      | `references/lessons-learned.md`                                 | 苦戦箇所と再発防止手順の記録形式                    |
| 監査判定      | `references/task-workflow.md` + `references/lessons-learned.md` | `currentViolations`/`baselineViolations` の記録方針 |
| Phase 12 運用 | `task-specification-creator/references/spec-update-workflow.md` | Step 1-A〜1-G と Step 2 の実施条件                  |
| 参照索引      | `indexes/resource-map.md` + `indexes/topic-map.md`              | 必須仕様の漏れ防止と参照行特定                      |

**抽出漏れゼロ・確認チェックリスト**:

| チェック項目                              | 判定基準                                                         |
| ----------------------------------------- | ---------------------------------------------------------------- |
| resource-map 起点で対象カテゴリを特定した | Task種別（ドキュメント改善）に対する必須仕様が列挙済み           |
| topic-map で参照位置を特定した            | 更新対象セクションの位置を追跡可能                               |
| search-spec でキーワード逆引きを実施した  | `task-workflow`/`lessons-learned`/`currentViolations` を確認済み |
| task-specification 側手順と接続した       | Step 1-A〜1-G + Step 2 の必須条件に反映済み                      |
| 非対象仕様のN/A判定条件を定義した         | 「更新しない理由」と「代替証跡」を必ず記録                       |

### Step 0.5: 多面的思考による設計判断（20視点）

| 思考法             | 本タスクでの判断結果                                        |
| ------------------ | ----------------------------------------------------------- |
| 水平思考           | 2workflowを1フォーマットへ統合し、記録先分散を解消          |
| 逆説思考           | 「全部更新」ではなく「非対象をN/A記録」で漏れ検知力を上げる |
| システム思考       | Phase 1〜13 の依存を1本の検証チェーンとして設計             |
| 垂直思考           | Task 1/3/4/5 の必須成果物を順序固定で実行可能化             |
| 類推思考           | 衛生検査・スタンプラリー比喩でPart 1要件を維持              |
| if思考             | UIタスク/非UIタスク分岐を条件テーブル化                     |
| 素人思考           | 「この手順で迷わないか」を前提にコマンドを明示              |
| トレードオン思考   | 厳密性を上げつつ、再利用テンプレートで作業負荷を抑制        |
| プラスサム思考     | 仕様同期・監査精度・再利用性を同時に改善                    |
| ２軸思考           | `current`/`baseline` を分離して合否軸を固定                 |
| 価値提案思考       | 監査の再現性向上を主価値として設計                          |
| why思考            | 「なぜ更新するか」を各Stepの判定理由に紐づけ                |
| 改善思考           | 既知Pitfallを再発防止ルールへ変換                           |
| 戦略的思考         | 仕様書単位SubAgent分担でボトルネックを分散                  |
| ダブル・ループ思考 | 手順だけでなく判定基準（合否軸）そのものを更新              |
| 抽象化思考         | 個別タスクを「証跡集約ガード」という共通概念へ昇華          |
| プロセス思考       | Step 0→Step 1..5 の入力/出力を明示                          |
| 仮説思考           | 「分離判定で誤FAILが減る」仮説を検証コマンドで確認          |
| 論点思考           | 漏れ・矛盾・依存・再現性を独立論点として監査                |
| 因果関係ループ     | 同期漏れ→再監査増加→工数増のループを手順固定で遮断          |

### Step 1: 証跡集約テンプレートのフォーマット設計（FR-1対応）

#### 1.1 テンプレート構造

`outputs/phase-12/evidence-bundle.md` として以下の構造で記録する:

```markdown
# Phase 12 証跡集約バンドル

## メタ情報

| 項目       | 値                |
| ---------- | ----------------- |
| タスクID   | <TASK-ID>         |
| 監査実行日 | <ISO 8601>        |
| 監査実行者 | lead / SubAgent名 |

## 2Workflow監査結果サマリー

| 項目                         | spec_created workflow      | completed workflow         |
| ---------------------------- | -------------------------- | -------------------------- |
| workflowパス                 | docs/30-workflows/<PATH-1> | docs/30-workflows/<PATH-2> |
| verify-all-specs violations  | <数値>                     | <数値>                     |
| validate-phase-output errors | <数値>                     | <数値>                     |
| 監査日時                     | <ISO 8601>                 | <ISO 8601>                 |

## verify-all-specs 詳細

### spec_created workflow

| #   | 違反内容 | 種別 | 重要度 |
| --- | -------- | ---- | ------ |
| ... | ...      | ...  | ...    |

### completed workflow

| #   | 違反内容 | 種別 | 重要度 |
| --- | -------- | ---- | ------ |
| ... | ...      | ...  | ...    |

## validate-phase-output 詳細

### spec_created workflow

| #   | エラー内容 | Phase | 対処 |
| --- | ---------- | ----- | ---- |
| ... | ...        | ...   | ...  |

### completed workflow

| #   | エラー内容 | Phase | 対処 |
| --- | ---------- | ----- | ---- |
| ... | ...        | ...   | ...  |
```

#### 1.2 集約テンプレートの検証コマンド

```bash
# 2workflow同時監査の実行
WORKFLOW_1="docs/30-workflows/<SPEC-CREATED-PATH>"
WORKFLOW_2="docs/30-workflows/<COMPLETED-PATH>"

# verify-all-specs を各workflowに対して実行
echo "=== spec_created workflow ==="
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow "$WORKFLOW_1"

echo "=== completed workflow ==="
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow "$WORKFLOW_2"

# validate-phase-output を各workflowに対して実行
echo "=== spec_created workflow phase validation ==="
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js --workflow "$WORKFLOW_1"

echo "=== completed workflow phase validation ==="
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js --workflow "$WORKFLOW_2"
```

### Step 2: Task 1/3/4/5 実体確認チェックリストの構造設計（FR-2対応）

#### 2.1 チェックリストテンプレート

`evidence-bundle.md` 内の「Task実体確認」セクションとして記録する:

```markdown
## Task実体確認チェックリスト

### Task 1: 実装ガイド

| #   | チェック項目          | コマンド / 確認方法                                            | 結果    |
| --- | --------------------- | -------------------------------------------------------------- | ------- | --------------------------------------------------- | ------- |
| 1-1 | ファイル実在          | `ls -la outputs/phase-12/implementation-guide.md`              | OK/NG   |
| 1-2 | Part 1 セクション存在 | `grep -c "## Part 1" outputs/phase-12/implementation-guide.md` | OK(>=1) |
| 1-3 | Part 1 日常例え存在   | `grep -cE "例え                                                | たとえ  | アナロジ" outputs/phase-12/implementation-guide.md` | OK(>=1) |
| 1-4 | Part 2 セクション存在 | `grep -c "## Part 2" outputs/phase-12/implementation-guide.md` | OK(>=1) |
| 1-5 | API/IPC/Component文書 | `ls outputs/phase-12/*-documentation.md 2>/dev/null \| wc -l`  | OK(>=1) |

### Task 3: documentation-changelog

| #   | チェック項目        | コマンド / 確認方法                                  | 結果                                           |
| --- | ------------------- | ---------------------------------------------------- | ---------------------------------------------- | ------- |
| 3-1 | ファイル実在        | `ls -la outputs/phase-12/documentation-changelog.md` | OK/NG                                          |
| 3-2 | 変更記録1件以上存在 | `grep -c "^                                          | " outputs/phase-12/documentation-changelog.md` | OK(>=3) |

### Task 4: 未タスク検出

| #   | チェック項目        | コマンド / 確認方法                                    | 結果  |
| --- | ------------------- | ------------------------------------------------------ | ----- |
| 4-1 | ファイル実在        | `ls -la outputs/phase-12/unassigned-task-detection.md` | OK/NG |
| 4-2 | 0件でもファイル存在 | （4-1と同一。0件でもファイルが存在することを確認）     | OK/NG |

### Task 5: スキルフィードバック

| #   | チェック項目        | コマンド / 確認方法                                       | 結果  |
| --- | ------------------- | --------------------------------------------------------- | ----- |
| 5-1 | ファイル実在        | `ls -la outputs/phase-12/skill-feedback-report.md`        | OK/NG |
| 5-2 | 0件でもファイル存在 | （5-1と同一。改善点なしでもファイルが存在することを確認） | OK/NG |
```

#### 2.2 一括検証コマンド

```bash
# Task 1/3/4/5 成果物の一括存在確認
WF_DIR="docs/30-workflows/<TASK-ID>"
REQUIRED=(
  "outputs/phase-12/implementation-guide.md"
  "outputs/phase-12/documentation-changelog.md"
  "outputs/phase-12/unassigned-task-detection.md"
  "outputs/phase-12/skill-feedback-report.md"
)
for f in "${REQUIRED[@]}"; do
  if [ -f "$WF_DIR/$f" ]; then
    echo "OK: $f"
  else
    echo "NG: $f (MISSING)"
  fi
done

# Part 1/2 セクション確認
GUIDE="$WF_DIR/outputs/phase-12/implementation-guide.md"
if [ -f "$GUIDE" ]; then
  P1=$(grep -c "## Part 1" "$GUIDE")
  P2=$(grep -c "## Part 2" "$GUIDE")
  echo "Part 1 sections: $P1 (expected >= 1)"
  echo "Part 2 sections: $P2 (expected >= 1)"
fi
```

### Step 3: UIスクリーンショット存在確認手順の設計（FR-3対応）

#### 3.1 UI/非UI分岐ロジック

```markdown
## スクリーンショット証跡

### 判定基準

タスク分類が以下のいずれかに該当する場合、UIスクリーンショット検証を**必須**とする:

- 分類に `UI` を含む（例: TASK-UI-xx）
- 実装対象に Renderer コンポーネント（`.tsx`）を含む
- Phase 11 手動テストにUI操作を含む

上記に該当しない場合は `N/A（UIタスクではないため）` として記録する。

### UIタスクの場合

| #   | チェック項目     | コマンド / 確認方法                                               | 結果   |
| --- | ---------------- | ----------------------------------------------------------------- | ------ |
| S-1 | ファイル実在     | `ls -la <screenshotPath>`                                         | OK/NG  |
| S-2 | 取得日確認       | `stat -f "%Sm" <screenshotPath>` (macOS) / ファイルメタデータ確認 | <日付> |
| S-3 | 取得日が合理的か | タスクブランチ作成日以降であること                                | OK/NG  |
| S-4 | 内容目視確認     | 該当画面のスクリーンショットであることを目視で確認                | OK/NG  |

### 非UIタスクの場合

| #   | チェック項目       | 結果                        |
| --- | ------------------ | --------------------------- |
| S-1 | スクリーンショット | N/A（UIタスクではないため） |
```

#### 3.2 本タスクへの適用

本タスク（UT-IMP-PHASE12-TWO-WORKFLOW-EVIDENCE-BUNDLE-001）はドキュメント改善タスクであり、Renderer コンポーネントの実装を含まない。スクリーンショット検証は `N/A（UIタスクではないため）` と記録する。

### Step 4: current/baseline分離記録フォーマットの設計（FR-4対応）

#### 4.1 分離記録テンプレート

`evidence-bundle.md` 内の「current/baseline分離」セクションとして記録する:

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
| —   | —        | —                | —    |

**Current合計**: <N>件

### completed workflow: <PATH-2>

（同一テーブル構造）

### 統合判定

| Workflow     | Current | Baseline | 判定     |
| ------------ | ------- | -------- | -------- |
| spec_created | 0       | <N>      | PASS     |
| completed    | 0       | <N>      | PASS     |
| **統合結果** | **0**   | **<N>**  | **PASS** |

- **判定基準**: `currentViolations.total === 0`（全workflowの合算）
- **Baseline違反の扱い**: 未タスクとして別途管理
```

#### 4.2 baseline取得コマンド

```bash
# Baseline取得（mainブランチでの違反数）
# 注意: git worktreeベースの取得を推奨（git stashはリスクあり）
WORKTREE_DIR=$(mktemp -d)
git worktree add "$WORKTREE_DIR" main --detach 2>/dev/null

BASELINE_1=$(cd "$WORKTREE_DIR" && node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow "docs/30-workflows/<PATH-1>" 2>/dev/null | grep -c "VIOLATION")
BASELINE_2=$(cd "$WORKTREE_DIR" && node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow "docs/30-workflows/<PATH-2>" 2>/dev/null | grep -c "VIOLATION")

git worktree remove "$WORKTREE_DIR" 2>/dev/null

echo "Baseline (spec_created): $BASELINE_1"
echo "Baseline (completed): $BASELINE_2"

# Current取得（現在ブランチでの違反数）
CURRENT_1=$(node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow "docs/30-workflows/<PATH-1>" 2>/dev/null | grep -c "VIOLATION")
CURRENT_2=$(node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow "docs/30-workflows/<PATH-2>" 2>/dev/null | grep -c "VIOLATION")

# 差分計算
NEW_1=$((CURRENT_1 - BASELINE_1))
NEW_2=$((CURRENT_2 - BASELINE_2))

echo "Current new violations (spec_created): $NEW_1"
echo "Current new violations (completed): $NEW_2"

TOTAL_NEW=$((NEW_1 + NEW_2))
if [ "$TOTAL_NEW" -eq 0 ]; then
  echo "統合判定: PASS (currentViolations.total === 0)"
else
  echo "統合判定: FAIL (currentViolations.total === $TOTAL_NEW)"
fi
```

### Step 5: task-workflow.md / lessons-learned.md 同期手順の設計

#### 5.1 task-workflow.md への同期手順

```markdown
## 台帳同期手順

### Step 5-A: task-workflow.md 完了台帳への記録

1. `.claude/skills/aiworkflow-requirements/references/task-workflow.md` を開く
2. 完了タスクテーブルに以下の行を追加する:

| タスクID                                        | タスク名                                   | 完了日   | PR        | 備考                     |
| ----------------------------------------------- | ------------------------------------------ | -------- | --------- | ------------------------ |
| UT-IMP-PHASE12-TWO-WORKFLOW-EVIDENCE-BUNDLE-001 | Phase 12 2workflow同時監査の証跡集約ガード | <完了日> | #<PR番号> | 証跡集約テンプレート追加 |

3. 残課題テーブルに変更がある場合（未タスク検出時）は同時に更新する

### Step 5-B: lessons-learned.md への記録

1. `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` を開く
2. Phase 12 実行時に新規教訓が検出された場合のみ追記する
3. 教訓が検出されなかった場合、証跡集約バンドルの N/A管理ログに「教訓検出なし」として記録する

### Step 5-C: LOGS.md 2ファイル更新（P1/P25対策）

1. `.claude/skills/aiworkflow-requirements/LOGS.md` を更新する
2. `.claude/skills/task-specification-creator/LOGS.md` を更新する
3. **2ファイル両方**の更新を確認する（片方の更新忘れを防止）
```

## 統合テスト連携

| #   | 接続先                                 | 連携設計                                                              |
| --- | -------------------------------------- | --------------------------------------------------------------------- |
| 1   | verify-all-specs.js                    | 2workflow各々の violations 出力を証跡集約テンプレートの入力とする     |
| 2   | validate-phase-output.js               | Phase 12 成果物存在検証結果を Task 1/3/4/5 チェックリストの入力とする |
| 3   | artifacts.json API                     | `phases["12"].audit` に current/baseline 分離結果を格納する           |
| 4   | phase-12-documentation.md チェック同期 | `[x]`/`[ ]` カウントを証跡集約テンプレートの完了状態として参照する    |

## 多角的チェック観点

| 観点       | 確認内容                                                                                |
| ---------- | --------------------------------------------------------------------------------------- |
| FR-1 充足  | 証跡集約テンプレートに2workflowの結果が横並びで記録される構造になっているか             |
| FR-2 充足  | Task 1/3/4/5 の6項目チェックリストに検証コマンドが全て含まれているか                    |
| FR-3 充足  | UIタスク/非UIタスクの分岐ロジックが明確に定義されているか                               |
| FR-4 充足  | current/baseline分離で `currentViolations.total === 0` が判定基準として固定されているか |
| NFR-1 充足 | 全検証コマンドがコピー&ペースト実行可能か                                               |
| NFR-2 充足 | PASS/FAIL判定が数値比較のみで決定されるか                                               |
| NFR-3 充足 | artifacts.json への追加が既存スキーマの破壊的変更でないか                               |
| P43対策    | 台帳同期がSubAgent 3ファイル以下の制約内で完結するか                                    |

## 成果物

| #   | 成果物名               | パス                                                                                                               |
| --- | ---------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 1   | 設計書（本ファイル）   | `docs/30-workflows/completed-tasks/phase12-two-workflow-evidence-bundle/phase-2-design.md`                         |
| 2   | 証跡集約アーキテクチャ | `docs/30-workflows/completed-tasks/phase12-two-workflow-evidence-bundle/outputs/phase-2/architecture-design.md`    |
| 3   | テンプレート仕様       | `docs/30-workflows/completed-tasks/phase12-two-workflow-evidence-bundle/outputs/phase-2/template-specification.md` |

## 完了条件

- [ ] 証跡集約テンプレートに2workflowの結果が横並びで記録される構造が定義されている
- [ ] Task 1/3/4/5 の6項目チェックリストに検証コマンドが全て含まれている
- [ ] UIスクリーンショット検証のUI/非UI分岐ロジックが定義されている
- [ ] current/baseline分離で `currentViolations.total === 0` が判定基準として固定されている
- [ ] baseline取得にgit worktreeベースの安全なコマンドが設計されている
- [ ] task-workflow.md/lessons-learned.md/LOGS.md x2 の同期手順が定義されている
- [ ] 全検証コマンドがコピー&ペースト実行可能な形式である
- [ ] artifacts.json への追加が既存スキーマの拡張のみ（破壊的変更なし）である
- [ ] 曖昧表現が0件である

## サブタスク管理

| #   | サブタスク                                  | 担当 | ステータス |
| --- | ------------------------------------------- | ---- | ---------- |
| 1   | 証跡集約テンプレートフォーマット設計        | lead | 完了       |
| 2   | Task 1/3/4/5 実体確認チェックリスト構造設計 | lead | 完了       |
| 3   | UIスクリーンショット存在確認手順設計        | lead | 完了       |
| 4   | current/baseline分離記録フォーマット設計    | lead | 完了       |
| 5   | 台帳同期手順の設計                          | lead | 完了       |

## タスク100%実行確認【必須】

| #   | 確認項目                                                          | 結果 |
| --- | ----------------------------------------------------------------- | ---- |
| 1   | FR-1〜FR-4 に対応する設計が全て存在するか                         | Yes  |
| 2   | NFR-1〜NFR-3 を満たす設計要素が含まれるか                         | Yes  |
| 3   | P43対策（3ファイル上限/SubAgent）が台帳同期手順に反映されているか | Yes  |
| 4   | P1/P25対策（LOGS.md 2ファイル更新）が同期手順に含まれているか     | Yes  |
| 5   | 検証コマンドが全てシェルスクリプトとして実行可能か                | Yes  |
| 6   | artifacts.json の拡張が既存スキーマに対する追加のみか             | Yes  |
| 7   | 2workflow横断の統合判定ロジックが定義されているか                 | Yes  |
| 8   | 曖昧表現が0件か                                                   | Yes  |

## 次のPhase

**Phase 3: 設計レビュー** — Phase 1-2 の整合性確認、証跡集約テンプレートの実用性評価、チェックリストの網羅性評価、既存Phase 12運用との互換性確認を実施し、PASS / MINOR / MAJOR の判定を行う。
