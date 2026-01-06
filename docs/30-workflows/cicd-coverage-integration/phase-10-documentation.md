# Phase 10: ドキュメント更新 - CI/CDカバレッジ閾値統合

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| Phase      | 10                        |
| Phase名    | ドキュメント更新          |
| 前提Phase  | Phase 9（手動テスト検証） |
| 後続Phase  | Phase 11（PR作成）        |
| ステータス | 未実施                    |
| 作成日     | 2026-01-05                |
| 機能名     | cicd-coverage-integration |

---

## 目的

実装した内容をドキュメントに反映し、スキルフィードバックを記録し、未完了タスクを検出・記録する。

## 背景

CI/CDの変更は開発者全員に影響するため、適切なドキュメント化と将来の改善事項の記録が重要。
また、使用したスキルへのフィードバックとシステム仕様書の更新も必須。

---

## サブフェーズ構成

Phase 10は3つのサブフェーズで構成される：

| サブフェーズ | 名称                     | 必須 | 成果物                                    |
| ------------ | ------------------------ | ---- | ----------------------------------------- |
| 10-1         | 実装ガイド作成           | ✅   | implementation-guide.md                   |
| 10-2         | ドキュメント・仕様書更新 | ✅   | documentation-update-log.md               |
| 10-3         | 未タスク検出             | ✅   | unassigned-task-report.md, 未タスク指示書 |

---

## Phase 10-1: 実装ガイド作成【必須】

### 目的

実装した内容を「概念的な説明」と「技術的な詳細」の両面からドキュメント化する。

### Part 1: 概念的な説明（対象: 初学者・非技術者）

#### 必須セクション

| セクション         | 内容                           |
| ------------------ | ------------------------------ |
| {{機能名}}って何？ | 身近な例で機能を説明           |
| なぜ必要なの？     | 技術用語を使わずに必要性を説明 |
| 今回作ったもの     | 用語の日本語訳・役割を説明     |
| どうやって動くの？ | 動作フローを図や箇条書きで説明 |
| 作ったものの全体像 | ASCII図で全体構成を可視化      |

#### 記述原則

- 中学生でもわかる表現を使う
- 身近な例え話を最初に出す
- 技術用語は必ず日本語で説明する

### Part 2: 技術的な詳細（対象: 開発者・技術者）

#### 必須セクション

| セクション               | 内容                                   |
| ------------------------ | -------------------------------------- |
| アーキテクチャ概要       | ファイル構成・データモデル・レイヤー図 |
| 設計詳細（**なぜ付き**） | 各設計判断の理由を説明                 |
| 使用例                   | コード例（コピペで動作確認可能）       |
| テスト構成               | テストファイル一覧・カバー範囲         |
| 使用上の注意             | ❌悪い例・✅良い例の対比               |
| 用語集                   | 専門用語の読み方・意味・コンテキスト   |

#### 記述原則（Why-first）

**最重要**: 各設計判断に「なぜそうしたか」を必ず記載する

```markdown
## 設計判断の根拠

| 設計判断          | 選択肢            | 採用理由                           |
| ----------------- | ----------------- | ---------------------------------- |
| CI実行条件        | 全push / PR+main  | featureブランチは不要（理由：...） |
| fail_ci_if_error  | true / false      | 品質ゲートとして機能させるため     |
| Action バージョン | SHA / Tag / Major | セキュリティ修正を受けつつ安定     |
```

### テンプレート

See `.claude/skills/task-specification-creator/assets/implementation-guide-template.md`

---

## Phase 10-2: ドキュメント・仕様書更新【必須】

### 2-1: システム仕様書更新（aiworkflow-requirements）

#### 更新対象

| ファイル                                                     | 更新内容                            |
| ------------------------------------------------------------ | ----------------------------------- |
| `.claude/skills/aiworkflow-requirements/references/ci-cd.md` | カバレッジチェック・Codecov統合追記 |

#### 更新手順

```bash
# 1. 既存仕様書を確認
cat .claude/skills/aiworkflow-requirements/references/ci-cd.md

# 2. 以下のセクションを追加
# - カバレッジチェック
#   - 閾値設定（80%）
#   - fail_ci_if_error: true の理由
#   - Codecov統合の設計判断

# 3. インデックス再生成
node .claude/skills/aiworkflow-requirements/scripts/generate-index.mjs

# 4. 変更履歴（自動反映されるため SKILL.md 更新不要）
```

#### 追加内容テンプレート

```markdown
## カバレッジチェック

### 概要

PRマージ前にコードカバレッジを自動検証し、品質低下を防止する。

### 設計方針

| 項目       | 方針                               |
| ---------- | ---------------------------------- |
| 閾値       | 80%（project/patch両方）           |
| 失敗時動作 | CI失敗（fail_ci_if_error: true）   |
| 実行条件   | PR作成時とmainブランチへのpush     |
| 可視化     | Codecovダッシュボード + PRコメント |

### なぜこの設計か

- **80%閾値**: 業界標準、現実的な達成目標、既存設定との整合性
- **fail_ci_if_error: true**: 品質ゲートとして機能させるため
- **PRとmainのみ実行**: featureブランチはPRで検証するため不要

### 設定ファイル

| ファイル                   | 役割                        |
| -------------------------- | --------------------------- |
| `.github/workflows/ci.yml` | coverageジョブ定義          |
| `codecov.yml`              | Codecov設定（閾値・フラグ） |
```

**詳細フロー**: See `.claude/skills/task-specification-creator/references/spec-update-workflow.md`

### 2-2: プロジェクトドキュメント更新

#### 更新対象

| ファイル    | 更新内容                | 必須 |
| ----------- | ----------------------- | ---- |
| `README.md` | CI/CD説明セクション追記 | 推奨 |

#### README更新内容例

```markdown
## CI/CD

### カバレッジチェック

PRに対して自動的にカバレッジチェックが実行されます。

#### 閾値

- Project: 80%
- Patch: 80%

#### 確認方法

1. PRのChecksタブでcoverageジョブを確認
2. Codecov botのコメントでカバレッジ差分を確認
3. [Codecovダッシュボード](https://codecov.io/gh/[owner]/[repo])で詳細を確認
```

---

## Phase 10-3: 未タスク検出【必須】

### 検出ソース（6つ全て必須）

| #   | ソース                | 確認項目                          | コマンド例                                          |
| --- | --------------------- | --------------------------------- | --------------------------------------------------- |
| 1   | Phase 3レビュー結果   | MINOR判定の指摘事項               | `grep -rn "MINOR\|軽微" outputs/phase-3/`           |
| 2   | Phase 8レビュー結果   | MINOR判定の指摘事項               | `grep -rn "MINOR\|軽微" outputs/phase-8/`           |
| 3   | Phase 9手動テスト結果 | スコープ外の発見事項              | `grep -rn "スコープ外\|将来" outputs/phase-9/`      |
| 4   | 各Phase成果物         | 「将来対応」「TODO」「FIXME」記載 | `grep -rn "TODO\|FIXME\|将来対応\|later" outputs/`  |
| 5   | 使用スキルのLOGS.md   | partial/failure記録の改善提案     | 各スキルのLOGS.md確認                               |
| 6   | コードベース          | TODO/FIXME/HACK/XXXコメント       | `grep -rn "TODO\|FIXME\|HACK\|XXX" packages/ apps/` |

### 検出コマンド実行

```bash
# 1. Phase成果物からTODO/FIXME検出
grep -rn "TODO\|FIXME\|将来対応\|later\|TBD\|あとで" \
  docs/30-workflows/cicd-coverage-integration/outputs/

# 2. レビュー結果からMINOR判定検出
grep -rn "MINOR\|軽微\|指摘" \
  docs/30-workflows/cicd-coverage-integration/outputs/phase-3/ \
  docs/30-workflows/cicd-coverage-integration/outputs/phase-8/

# 3. 手動テスト結果から将来対応検出
grep -rn "スコープ外\|将来\|後日\|次回" \
  docs/30-workflows/cicd-coverage-integration/outputs/phase-9/

# 4. コードベースからTODO検出
grep -rn "TODO\|FIXME\|HACK\|XXX" \
  .github/workflows/ codecov.yml packages/ apps/ | grep -v node_modules

# 5. 使用スキルのLOGS.md確認
cat .claude/skills/github-actions-syntax/LOGS.md | tail -50
cat .claude/skills/github-actions-expressions/LOGS.md | tail -50
cat .claude/skills/test-coverage/LOGS.md | tail -50
cat .claude/skills/github-actions-security/LOGS.md | tail -50
```

### 未タスク分類

検出された課題を以下で分類する：

| 分類             | 略称  | タスクID形式                  | 優先度判定基準            |
| ---------------- | ----- | ----------------------------- | ------------------------- |
| 要件             | req   | task-req-cicd-coverage-XXX    | 機能要件の追加が必要 → 高 |
| 改善             | imp   | task-imp-cicd-coverage-XXX    | 既存機能の改善 → 中       |
| バグ修正         | bug   | task-bug-cicd-coverage-XXX    | 不具合 → 高               |
| リファクタリング | ref   | task-ref-cicd-coverage-XXX    | コード品質改善 → 低〜中   |
| セキュリティ     | sec   | task-sec-cicd-coverage-XXX    | セキュリティ問題 → 高     |
| パフォーマンス   | perf  | task-perf-cicd-coverage-XXX   | 性能改善 → 中             |
| スキル改善       | skill | task-skill-{{skill-name}}-XXX | スキル品質改善 → 中       |

### 未タスク指示書生成

**テンプレート**: See `.claude/skills/task-specification-creator/assets/unassigned-task-template.md`

**詳細仕様**: See `.claude/skills/task-specification-creator/agents/generate-unassigned-task.md`

---

## Phase 10-4: スキルフィードバック記録【必須】

### 今回使用したスキル

| スキル名                   | 使用Phase | 結果予想 |
| -------------------------- | --------- | -------- |
| github-actions-syntax      | 2, 7      | success  |
| github-actions-expressions | 2         | success  |
| test-coverage              | 4         | success  |
| github-actions-security    | 2, 7      | success  |

### フィードバック記録手順

```bash
# 各スキルごとにフィードバック記録
node .claude/skills/task-specification-creator/scripts/log_usage.mjs \
  --skill github-actions-syntax --result success --phase 2 \
  --notes "CI/CDワークフロー設計に使用、coverageジョブ構文設計で有効"

node .claude/skills/task-specification-creator/scripts/log_usage.mjs \
  --skill github-actions-expressions --result success --phase 2 \
  --notes "条件分岐設計（PR or main）で有効"

node .claude/skills/task-specification-creator/scripts/log_usage.mjs \
  --skill test-coverage --result success --phase 4 \
  --notes "カバレッジ検証シナリオ設計で有効"

node .claude/skills/task-specification-creator/scripts/log_usage.mjs \
  --skill github-actions-security --result success --phase 2,7 \
  --notes "Secrets管理・権限設計で有効"
```

### フィードバック内容テンプレート

| スキル                     | 結果    | Phase | 良かった点                       | 改善提案 |
| -------------------------- | ------- | ----- | -------------------------------- | -------- |
| github-actions-syntax      | success | 2, 7  | coverageジョブ構文設計に有効     | -        |
| github-actions-expressions | success | 2     | 条件分岐設計に有効               | -        |
| test-coverage              | success | 4     | カバレッジ検証シナリオ設計に有効 | -        |
| github-actions-security    | success | 2, 7  | Secrets管理・権限設計に有効      | -        |

### スキル改善提案の検出

```bash
# 各スキルのLOGS.mdからpartial/failure記録を確認
for skill in github-actions-syntax github-actions-expressions test-coverage github-actions-security; do
  echo "=== $skill ==="
  cat .claude/skills/$skill/LOGS.md | grep -A 5 "partial\|failure" | tail -20
done
```

---

## 参照資料

| 参照資料               | パス                                                                                | 内容          |
| ---------------------- | ----------------------------------------------------------------------------------- | ------------- |
| 手動テスト結果         | `outputs/phase-9/manual-test-result.md`                                             | Phase 9成果物 |
| 検証レポート           | `outputs/phase-9/verification-report.md`                                            | Phase 9成果物 |
| 実装ガイドテンプレート | `.claude/skills/task-specification-creator/assets/implementation-guide-template.md` | テンプレート  |
| 未タスク生成仕様       | `.claude/skills/task-specification-creator/agents/generate-unassigned-task.md`      | 詳細仕様      |
| システム仕様更新フロー | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`      | 更新手順      |

---

## 実行手順

### ステップ1: 実装ガイド作成

1. テンプレートを確認

   ```bash
   cat .claude/skills/task-specification-creator/assets/implementation-guide-template.md
   ```

2. Part 1（概念的説明）を作成
   - CI/CDカバレッジ統合の身近な例え話
   - なぜ必要か（技術用語なしで説明）
   - 全体の動作フロー

3. Part 2（技術的詳細）を作成
   - アーキテクチャ図（ASCII）
   - 設計判断の根拠（**なぜ**を含める）
   - 設定ファイル説明（ci.yml, codecov.yml）
   - 用語集（読み方・意味・なぜ採用したか）

4. 出力
   ```
   outputs/phase-10/implementation-guide.md
   ```

### ステップ2: システム仕様書更新

1. ci-cd.md に カバレッジチェックセクションを追加

   ```bash
   cat .claude/skills/aiworkflow-requirements/references/ci-cd.md
   # 既存内容を確認後、カバレッジセクションを追加
   ```

2. インデックス再生成

   ```bash
   node .claude/skills/aiworkflow-requirements/scripts/generate-index.mjs
   ```

3. 更新ログ記録
   ```
   outputs/phase-10/documentation-update-log.md
   ```

### ステップ3: スキルフィードバック記録

1. 使用した4スキルへのフィードバック記録

   ```bash
   # 上記の「フィードバック記録手順」を実行
   ```

2. スキル改善提案の検出
   - 各スキルのLOGS.mdを確認
   - partial/failure記録があれば改善タスクを生成

### ステップ4: 未タスク検出

1. 6つの検出ソースから未タスクを検出

   ```bash
   # 上記の「検出コマンド実行」を実行
   ```

2. 検出結果を分類
   - 分類（req/imp/bug/ref/sec/perf/skill）
   - 優先度（高/中/低）
   - タスクID生成

3. 未タスク検出レポート作成

   ```
   outputs/phase-10/unassigned-task-report.md
   ```

4. 未タスク指示書作成（該当する場合）
   ```
   docs/30-workflows/unassigned-task/task-{{分類}}-{{機能名}}-{{連番}}.md
   ```

---

## 成果物

| 成果物                   | パス                                           | 必須 | 説明                               |
| ------------------------ | ---------------------------------------------- | ---- | ---------------------------------- |
| 実装ガイド               | `outputs/phase-10/implementation-guide.md`     | ✅   | Part 1（概念）+ Part 2（技術）     |
| ドキュメント更新履歴     | `outputs/phase-10/documentation-update-log.md` | ✅   | 更新したファイル・追加内容の記録   |
| スキルフィードバック記録 | 各スキルの `LOGS.md`                           | ✅   | 使用結果・改善提案の記録           |
| 未タスク検出レポート     | `outputs/phase-10/unassigned-task-report.md`   | ✅   | 検出した未タスクの一覧と分類       |
| 未タスク指示書           | `docs/30-workflows/unassigned-task/*.md`       | 条件 | 検出時のみ作成（Why/What/How形式） |

---

## 完了条件

### 実装ガイド

- [ ] Part 1（概念的説明）が作成されている
- [ ] Part 2（技術的詳細）が作成されている
- [ ] Part 2に「なぜ」の設計理由が含まれている
- [ ] 用語集セクションが作成されている
- [ ] ASCII図で全体構成が可視化されている

### ドキュメント・仕様書更新

- [ ] aiworkflow-requirements/references/ci-cd.md が更新されている
- [ ] インデックスが再生成されている
- [ ] README.md が更新されている（推奨）
- [ ] documentation-update-log.md が作成されている

### スキルフィードバック

- [ ] 使用した4スキルへのフィードバックが記録されている
- [ ] 各スキルのLOGS.mdが更新されている
- [ ] スキル改善提案が検出されている

### 未タスク検出

- [ ] 6つの検出ソース全てから検出が実行されている
- [ ] 未タスク検出レポートが作成されている
- [ ] 検出された未タスクが分類されている
- [ ] 該当する場合、未タスク指示書が作成されている
- [ ] artifacts.jsonが更新されている

---

## スキルフィードバック記録

Phase完了後、以下を記録してください:

```markdown
## Phase 10 実行記録

### 実装ガイド作成

- Part 1（概念的説明）: {{完了状況}}
- Part 2（技術的詳細）: {{完了状況}}
- 用語集: {{完了状況}}

### ドキュメント更新

- 更新したファイル: {{ファイルリスト}}
- 追加した内容: {{概要}}

### システム仕様書更新

- aiworkflow-requirements/references/ci-cd.md: {{更新内容}}
- インデックス再生成: {{完了状況}}

### スキルフィードバック

- github-actions-syntax: success
- github-actions-expressions: success
- test-coverage: success
- github-actions-security: success

### 未タスク検出結果

- 検出数: {{N}}件
- 主な未タスク: {{リスト}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/cicd-coverage-integration/phase-11-pr-creation.md`
