# Phase 12: ドキュメント更新

## メタ情報

| 項目      | 値                                                                                                                                                         |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID  | UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001                                                                                                                   |
| Phase     | 12                                                                                                                                                         |
| 機能名    | Phase 12 仕様書別SubAgent N/A判定ログガード                                                                                                                |
| 作成日    | 2026-03-01                                                                                                                                                 |
| 前提Phase | Phase 11（手動テスト検証）完了                                                                                                                             |
| 目的      | 実装内容をシステム仕様に反映し、技術ドキュメントを作成し、未タスクを検出する                                                                               |
| 成果物    | `outputs/phase-12/`（implementation-guide.md, spec-update-summary.md, documentation-changelog.md, unassigned-task-detection.md, skill-feedback-report.md） |

## 目的

N/A判定ログガード・三点突合・current/baseline分離記録・SubAgent分担表の4つの運用改善内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 事前チェック【必須】

Phase 12実行前に、以下の既知の落とし穴を確認し、漏れを防止する:

1. `.claude/rules/06-known-pitfalls.md` の Phase 12 関連項目を読む
   - P1: LOGS.md 2ファイル更新漏れ
   - P2: topic-map.md 再生成忘れ
   - P3: 未タスク管理の3ステップ不完全
   - P4: documentation-changelog への早期「完了」記載
   - P25: LOGS.md 2ファイル更新漏れ（再発）
   - P26: システム仕様書更新遅延
   - P27: topic-map.md 再生成トリガーの判断ミス
   - P28: スキルフィードバックレポート未作成
   - P29: SKILL.md 変更履歴の更新漏れ
   - P43: Phase 12 サブエージェントの rate limit 中断

## 実行タスク

- Task 1: 実装ガイド作成（2パート構成）
- Task 2: システムドキュメント更新（2ステップ）
- Task 3: ドキュメント更新履歴 & artifacts.json更新
- Task 4: 未タスク検出レポート作成
- Task 5: スキルフィードバックレポート作成

## 参照資料

| 資料名                   | パス                                                                                    | 説明                     |
| ------------------------ | --------------------------------------------------------------------------------------- | ------------------------ |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`                                                | Phase 11成果物           |
| Phase 2 設計成果物       | `outputs/phase-2/`                                                                      | 設計仕様                 |
| Phase 5 実装成果物       | `outputs/phase-5/`                                                                      | 実装コード・変更内容     |
| Phase 6 テスト成果物     | `outputs/phase-6/`                                                                      | 拡充テスト・回帰結果     |
| Phase 7 カバレッジ成果物 | `outputs/phase-7/`                                                                      | カバレッジ最終判定       |
| Phase 8 リファクタ成果物 | `outputs/phase-8/`                                                                      | 設計改善内容             |
| Phase 9 品質成果物       | `outputs/phase-9/`                                                                      | 品質保証証跡             |
| Phase 10 レビュー結果    | `outputs/phase-10/final-review-result.md`                                               | 最終レビュー判定         |
| アーキテクチャ概要       | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`            | レイヤー構成             |
| タスクワークフロー       | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                    | 完了記録・残課題更新規約 |
| 品質要件                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`             | 検証・証跡記録の品質基準 |
| ディレクトリ構成         | `.claude/skills/aiworkflow-requirements/references/directory-structure.md`              | 参照パスと配置規約       |
| 仕様更新ワークフロー     | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`          | Phase 12更新手順         |
| Phase 11/12ガイド        | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`             | ドキュメント更新詳細     |
| 技術ドキュメントガイド   | `.claude/skills/task-specification-creator/references/technical-documentation-guide.md` | 実装ガイド記述ルール     |
| 既知の落とし穴           | `.claude/rules/06-known-pitfalls.md`                                                    | 過去インシデントの教訓   |

---

## Task 1: 実装ガイド作成【必須・2パート構成】

### 概要

| パート | 対象読者             | 内容                                                           |
| ------ | -------------------- | -------------------------------------------------------------- |
| Part 1 | 初学者・中学生レベル | 概念説明（日常の例え話必須、専門用語なし）                     |
| Part 2 | 開発者・技術者       | 技術的詳細（テンプレート仕様、検証コマンド、判定アルゴリズム） |

### Part 1: 概念的説明（中学生レベル）

**記述ルール**:

- 日常生活での例え話を**必ず**含める
- 専門用語は使わない（使う場合は即座に説明）
- 図表より文章での説明を優先
- 「なぜ必要か」を先に説明してから「何をするか」を説明

**テンプレート**:

```markdown
### N/A判定ログとは何か

#### 日常生活での例え（宿題チェックリスト）

[先生が配った「宿題チェックリスト」を例にする。
国語、算数、理科、社会、英語の5教科の宿題があるとする。
今週は理科と社会の宿題が出ていない場合、チェックリストの
理科と社会の欄に「宿題なし」と書いて理由（「今週は実験週間のため宿題なし」）を
メモしておく。空欄のままにすると、後から見た人が
「宿題を忘れたのか、出ていないのか」が分からなくなる]

### 三点突合とは何か

#### 日常生活での例え（3つの確認スタンプ）

[お店で商品を買うときの「3つの確認スタンプ」を例にする。
①商品が棚にあること（成果物実体の確認）
②レジの記録に商品が登録されていること（artifacts.jsonの確認）
③店員のチェックリストに完了マークがあること（チェックリストの確認）
この3つが全部揃っていれば「お買い物完了」。
1つでも欠けていたら「まだ途中」と分かる]

### current/baseline分離とは何か

#### 日常生活での例え（今回のテストの点数 vs 前回までの平均点）

[テストの成績を例にする。
「今回のテストの点数」（current）は100点満点で何点取ったか。
「前回までの平均点」（baseline）はこれまでの通算成績。
今回100点でも、前回までの平均が70点の場合がある。
判定基準は「今回のテストが合格点かどうか」だけで決まり、
前回までの平均は参考情報として別に記録する]
```

### Part 2: 技術的詳細（開発者向け）

以下を含めること:

- N/A判定ログテンプレートの詳細仕様
  - フィールド定義: `仕様書名`, `判定（更新/N/A）`, `理由`, `代替証跡`, `判定者`
  - バリデーション: 理由フィールドは「本タスクは〜のため〜に影響しない」形式で1文以上（曖昧表現禁止）
  - 判定基準: 仕様書内容への直接的な変更がある場合は「更新」、ない場合は「N/A」

- 三点突合の検証手順
  1. 成果物実体確認: `ls outputs/phase-12/` で5ファイルの存在確認
  2. artifacts.json確認: Phase 12の `status` フィールドが `completed` であること
  3. チェックリスト確認: `phase-12-documentation.md` の完了条件が全 `[x]` であること
  4. 合否判定: 3項目全てPASSで「完了」、1つでもFAILで「未完了」（FAIL箇所を報告）

- current/baseline分離の判定アルゴリズム
  - `audit-unassigned-tasks.js --json` の出力から `currentViolations.total` を抽出
  - 合否判定: `currentViolations.total === 0` → PASS、`> 0` → FAIL
  - baseline記録: `baselineViolations.total` は別枠で `spec-update-summary.md` に記録
  - `--diff-from HEAD` オプションでcurrent scopeを限定可能

- SubAgent分担表テンプレートの詳細仕様
  - 全仕様書を列挙し、各行に「更新」または「N/A」を必ず割り当てる
  - 「更新」ファイルは3以下/SubAgentに分割する（P43対策）
  - 空白行は許容しない（網羅性の保証）

- 監査スクリプトとの連携方法
  - `verify-all-specs.js --workflow <path> --json`: 仕様書整合検証
  - `audit-unassigned-tasks.js --json --target-file <path>`: 対象ファイル監査（current scope）
  - `audit-unassigned-tasks.js --json`: 全体監査（baseline scope）
  - `validate-phase-output.js <path> --phase 12`: Phase成果物検証

- 関連Pitfall: P1（LOGS.md 2ファイル更新漏れ）、P2（topic-map.md再生成忘れ）、P3（未タスク3ステップ不完全）、P4（早期完了記載）、P43（SubAgent rate limit中断）

### 成果物

| 成果物     | パス                                       |
| ---------- | ------------------------------------------ |
| 実装ガイド | `outputs/phase-12/implementation-guide.md` |

---

## Task 2: システムドキュメント更新【必須・Step 1-A〜1-G + Step 2】

> **重要**: 詳細手順は `references/spec-update-workflow.md` を参照

### Step 1: タスク完了記録【必須・全タスク】

#### Step 1-A: 仕様書完了記録

- [ ] 該当する仕様書（`task-workflow.md`）に「完了タスク」セクションを追加
- [ ] 関連ドキュメントセクションに実装ガイドリンクを追加
- [ ] 変更履歴セクションにバージョンを追記
- [ ] `aiworkflow-requirements/LOGS.md` にタスク完了エントリを追加
- [ ] `task-specification-creator/LOGS.md` にタスク完了記録を追加（**2ファイル両方必須** — P1, P25）
- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴更新
- [ ] `task-specification-creator/SKILL.md` 変更履歴更新

**完了タスクセクションのテンプレート**:

```markdown
## 完了タスク

### タスク: UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001（2026-XX-XX完了）

| 項目       | 内容                                                   |
| ---------- | ------------------------------------------------------ |
| タスクID   | UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001               |
| ステータス | **完了**                                               |
| 概要       | Phase 12仕様書別SubAgent N/A判定ログガード（運用改善） |
| 変更種別   | 運用改善（仕様書テンプレート・手順の追加）             |
| テスト数   | 手動テスト15項目                                       |
```

#### Step 1-B: 実装状況テーブル更新（該当する場合）

- [ ] 本タスクは運用改善タスク（コード実装なし）のため、実装状況テーブルの更新は不要
- [ ] `spec-update-summary.md` に「Step 1-B: 該当なし（理由: コード実装を伴わない運用改善タスク）」を明記

#### Step 1-C: 関連タスクテーブル更新

- [ ] `grep -rn "UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD" references/` で関連仕様書を検索して更新
- [ ] `grep -rn "P43\|N/A判定\|三点突合" references/` で関連パターンを持つ仕様書を検索

#### Step 1-D: topic-map.md 再生成（**仕様書に変更があれば必ず実行** — P2, P27）

- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行して topic-map.md を再生成
- [ ] `node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/completed-tasks/UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001 --regenerate` を実行して index/リンク情報を再同期
- [ ] 再生成されたtopic-map.mdに新規セクションの行番号が正しく反映されていることを確認

#### Step 1-E: 未タスク指示書作成・登録（1件以上検出時は必須）

- [ ] 検出時は `docs/30-workflows/unassigned-task/` に指示書を作成し、`task-workflow.md` と関連仕様書へリンクを追加
- [ ] `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` を実行し、参照切れ0件を確認
- [ ] `audit-unassigned-tasks.js --json --target-file <path>` または `--diff-from <ref>` を実行し、`currentViolations.total` を記録
- [ ] scope未指定の `audit-unassigned-tasks.js --json` を実行し、baseline監視結果を別枠で記録

#### Step 1-F: DevOps関連ファイル更新（該当する場合）

- [ ] 本タスクはCI/CD・Lint・テスト基盤を変更していないため、DevOps関連更新は不要
- [ ] `spec-update-summary.md` に「Step 1-F: 該当なし（理由: 運用改善タスクでCI/CD変更なし）」を明記

#### Step 1-G: 検証コマンド順次実行（Phase 12同期ガード）

前提: すべてのコマンドはリポジトリルート（`AIWorkflowOrchestrator/`）をカレントディレクトリとして実行する。

```bash
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001 --json
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
```

**Step 1-G.1: baseline / current 分離監査（全体FAIL誤判定防止）**

- [ ] `audit-unassigned-tasks` の全体FAIL時は `currentViolations.total` を合否判定に使用し、`baselineViolations.total` は別記録する
- [ ] 判定結果を `spec-update-summary.md` に `baseline: N件 / current: M件` 形式で記録する

**Step 1-G.2: SKILL検証の判定基準（`spec-update-workflow.md` Step 1-G.3.1 準拠）**

| 分類   | 判定基準                                                                                   | 対応                                                  |
| ------ | ------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| 合格   | `quick_validate.js` 3スキル全てで Error 0件                                                | Phase 12継続                                          |
| 要監視 | Warning が新規発生、または前回より増加                                                     | `spec-update-summary.md` に記録し、次回対応方針を明記 |
| 要対応 | Warning がスキル構造の正確性に直接影響（必須セクション欠落、name不一致、agents形式崩れ等） | 本Phaseで修正、修正不可なら未タスク化                 |

### Step 2: システム仕様更新【条件付き】

**更新判断基準**:

| 更新必要                 | 更新不要                 |
| ------------------------ | ------------------------ |
| 新規運用テンプレート追加 | 内部実装の詳細変更のみ   |
| 既存Phase 12手順の変更   | バグ修正（仕様変更なし） |
| 監査判定基準の変更       | テスト追加のみ           |

**本タスクはPhase 12運用手順の改善のため、以下の更新対象を確認すること**:

| #   | 更新対象ファイル          | 更新内容                                                          | 必須/任意 |
| --- | ------------------------- | ----------------------------------------------------------------- | --------- |
| 1   | `task-workflow.md`        | 残課題テーブル更新、完了タスクセクション追加                      | 必須      |
| 2   | `lessons-learned.md`      | Phase 12 N/A判定運用の教訓（P43対策・三点突合パターン）           | 必須      |
| 3   | `spec-update-workflow.md` | N/A判定ログテンプレートの追記、三点突合手順の追記（該当する場合） | 任意      |

**N/A判定ログを含むSubAgent分担表（本タスク運用改善の核心）**:

> 以下の表でPhase 12 Task 2のシステム仕様書更新対象を管理する。
> 全仕様書に「更新」または「N/A」を必ず割り当て、空白行を許容しない。

| #   | 仕様書名                | 判定     | 理由                                                                   | 担当SubAgent  |
| --- | ----------------------- | -------- | ---------------------------------------------------------------------- | ------------- |
| 1   | task-workflow.md        | 更新     | 完了タスクセクション追加・残課題テーブル更新が必要                     | エージェントA |
| 2   | lessons-learned.md      | 更新     | N/A判定運用・三点突合パターンの教訓追加が必要                          | エージェントA |
| 3   | spec-update-workflow.md | 更新/N/A | N/A判定ログテンプレートの追記が該当する場合は「更新」、不要なら「N/A」 | エージェントA |

> **P43対策**: 仕様書更新は3ファイル以下/エージェントに分割する。LOGS.mdへの「完了」記録は全ファイル更新後の最終ステップとする。

**非対象仕様書のN/A判定ログ例**:

本タスクは運用改善タスク（コード実装なし）のため、以下の仕様書は更新対象外である:

| #   | 仕様書名                 | 判定 | 理由                                                                            | 代替証跡                                                 |
| --- | ------------------------ | ---- | ------------------------------------------------------------------------------- | -------------------------------------------------------- |
| 1   | architecture-overview.md | N/A  | 本タスクはアーキテクチャ構造を変更しないため、概要仕様への影響がない            | phase-5-implementation.mdに変更なしの記録あり            |
| 2   | architecture-monorepo.md | N/A  | 本タスクはモノレポ構造を変更しないため、パッケージ仕様への影響がない            | phase-5-implementation.mdに変更なしの記録あり            |
| 3   | security-principles.md   | N/A  | 本タスクはセキュリティ機能を変更しないため、セキュリティ仕様への影響がない      | phase-10-final-review.mdにセキュリティ影響なしの記録あり |
| 4   | security-api-electron.md | N/A  | 本タスクはIPC/API層を変更しないため、Electron APIセキュリティ仕様への影響がない | phase-10-final-review.mdにIPC影響なしの記録あり          |

### 成果物

| 成果物           | パス                                      |
| ---------------- | ----------------------------------------- |
| 仕様更新サマリー | `outputs/phase-12/spec-update-summary.md` |

---

## Task 3: ドキュメント更新履歴 & artifacts.json更新【必須】

### 実行手順

```bash
# Step 1: ドキュメント更新履歴生成（スクリプトが存在する場合）
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/completed-tasks/UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001

# Step 2: Phase 12完了登録（artifacts.json更新）
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/completed-tasks/UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001 \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/documentation-changelog.md:ドキュメント更新履歴,outputs/phase-12/spec-update-summary.md:仕様更新サマリー,outputs/phase-12/unassigned-task-detection.md:未タスク検出レポート,outputs/phase-12/skill-feedback-report.md:スキルフィードバックレポート"
```

**スクリプト未存在時の代替手順**:

| スクリプト                            | 代替手順                                                                                            |
| ------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `generate-documentation-changelog.js` | 手動で `outputs/phase-12/documentation-changelog.md` を作成                                         |
| `complete-phase.js`                   | 手動で `artifacts.json` を作成（参照: `docs/30-workflows/completed-tasks/` 内の既存artifacts.json） |

**artifacts.json必須項目**:

- Phase 12のステータスが `completed` に更新されていること
- 全Phase（1-12）の成果物パスが登録されていること
- `qualityMetrics` セクションに品質指標が記録されていること

### 三点突合による完了判定【本タスク改善点】

Phase 12の完了判定は、以下の三点突合で機械的に確認する:

| #   | 確認項目       | 検証方法                                               | PASS条件                |
| --- | -------------- | ------------------------------------------------------ | ----------------------- |
| 1   | 成果物実体     | `ls outputs/phase-12/` で5ファイルの存在確認           | 5ファイル全て存在       |
| 2   | artifacts.json | Phase 12 `status` フィールド確認                       | `"status": "completed"` |
| 3   | チェックリスト | 本仕様書「完了条件」セクションの全チェックボックス確認 | 全項目 `[x]`            |

**合否判定**: 3項目全てPASS → Phase 12 完了。1項目でもFAIL → 未完了（FAIL箇所を報告）。

### 記録上の注意

- DON'T: 全 Step 確認前に documentation-changelog.md に「完了」と記載しない（P4対策）
- DO: 各 Step の完了結果を詳細に記録すること（漏れの可視化）

### 成果物

| 成果物               | パス                                                 |
| -------------------- | ---------------------------------------------------- |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`        |
| artifacts.json       | `outputs/artifacts.json` + ルートの `artifacts.json` |

---

## Task 4: 未タスク検出レポート作成【0件でも出力必須】

### 確認ソース

| #   | ソース                 | 確認項目                      |
| --- | ---------------------- | ----------------------------- |
| 1   | Phase 3レビュー結果    | MINOR判定の指摘事項           |
| 2   | Phase 10レビュー結果   | MINOR判定の指摘事項           |
| 3   | Phase 11手動テスト結果 | スコープ外の発見事項          |
| 4   | 各Phase成果物          | 「将来対応」「TODO」「FIXME」 |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント   |
| 6   | 苦戦箇所               | 本タスク実行中の教訓          |

### 検出方法

```bash
# コードベース内のTODO/FIXMEスキャン（本タスクはコード変更なしのため、関連ディレクトリのみ対象）
grep -rn "TODO\|FIXME\|HACK\|XXX" .claude/skills/task-specification-creator/references/ --include="*.md" || echo "検出なし"
grep -rn "TODO\|FIXME\|HACK\|XXX" .claude/skills/aiworkflow-requirements/references/ --include="*.md" || echo "検出なし"
```

### 未タスク発見時の3ステップ（P3準拠 — 全ステップ完了必須）

1. `docs/30-workflows/unassigned-task/` に指示書を作成する（`tasks/` 直下は不可 — P38対策）
2. `task-workflow.md` の残課題テーブルに登録する
3. 関連仕様書に未タスク参照リンクを追加する

### 0件の場合の出力形式

```markdown
## 検出結果サマリー

| ソース                     | 検出数  |
| -------------------------- | ------- |
| Phase 3レビュー結果        | 0件     |
| Phase 10レビュー結果       | 0件     |
| Phase 11手動テスト結果     | 0件     |
| コードベース（TODO/FIXME） | 0件     |
| 苦戦箇所                   | 0件     |
| **合計**                   | **0件** |

## 検出タスク一覧

**検出タスクなし**

すべてのテストがPASSし、発見課題もないため、未タスクとして記録すべき項目はありません。
```

### 監査コマンド

```bash
# 対象監査（今回変更分の合否）
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --target-file docs/30-workflows/unassigned-task/<今回対象ファイル>.md

# 全体監査（baseline監視）
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json

# 未タスクリンク参照切れチェック
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
```

### current/baseline分離記録【本タスク改善点】

監査結果は以下の形式で分離記録する:

```markdown
## 監査結果

| スコープ | violations.total | 合否判定       |
| -------- | ---------------- | -------------- |
| current  | 0                | PASS（合格）   |
| baseline | N                | 参考値（別枠） |

**判定基準**: `currentViolations.total === 0` で合格。baseline値は合否判定に使用しない。
```

### 成果物

| 成果物               | パス                                                   |
| -------------------- | ------------------------------------------------------ |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md`        |
| 未タスク指示書       | `docs/30-workflows/unassigned-task/*.md`（検出時のみ） |

---

## Task 5: スキルフィードバックレポート作成【改善点なしでも出力必須】

### 確認観点

| 観点             | 確認内容                                                      |
| ---------------- | ------------------------------------------------------------- |
| テンプレート改善 | Phase 12テンプレートにN/A判定ログ欄を標準化すべきか           |
| ワークフロー改善 | 三点突合を自動検証スクリプト化できるか                        |
| ドキュメント改善 | current/baseline分離の説明をPhaseテンプレートに組み込むべきか |
| 新規Pitfall候補  | 06-known-pitfalls.mdに追加すべき新規パターン                  |

### 成果物

| 成果物                       | パス                                        |
| ---------------------------- | ------------------------------------------- |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md` |

---

## 苦戦箇所の記録【推奨】

タスク実行中に苦戦した箇所があれば、以下のテンプレートで記録する。

### 記録テンプレート

```markdown
## 苦戦箇所

### 1. {{問題の概要}}

- **症状**: {{発生した問題の具体的な症状}}
- **原因**: {{問題の根本原因}}
- **解決策**: {{採用した解決策}}
- **学び**: {{将来のタスクへの教訓}}
- **関連Pitfall**: {{該当する場合はPitfall ID（例: P43）}}
```

### 記録が有用なケース

| ケース                               | 記録すべき内容                 |
| ------------------------------------ | ------------------------------ |
| N/A判定ログの理由記述が曖昧          | 曖昧だった表現、改善後の表現   |
| 三点突合の不一致検出                 | 不一致箇所、原因、修正方法     |
| current/baseline分離の誤判定         | 誤判定の内容、正しい判定方法   |
| SubAgent分担表の漏れ                 | 漏れた仕様書、発見方法         |
| 06-known-pitfalls.mdに追加すべき教訓 | Pitfall ID候補、パターン、対策 |

苦戦箇所を記録した場合は、P3準拠の3ステップで未タスク化する。苦戦箇所が0件の場合でも「苦戦箇所なし（0件）」を明記する。

---

## 漏れやすいポイント（06-known-pitfalls.md参照）

| ID  | ポイント                                | 対策                                                                |
| --- | --------------------------------------- | ------------------------------------------------------------------- |
| P1  | LOGS.md 2ファイル更新漏れ               | aiworkflow-requirements + task-specification-creator 両方を同時更新 |
| P2  | topic-map.md 再生成忘れ                 | セクション変更時は必ず `generate-index.js` を実行                   |
| P3  | 未タスク管理の3ステップ不完全           | ①指示書 → ②task-workflow.md登録 → ③関連仕様書リンク                 |
| P4  | documentation-changelogへの早期「完了」 | 全Step確認前に「完了」と記載しない                                  |
| P25 | LOGS.md 2ファイル更新漏れ（再発）       | P1と同じ対策を明示的にチェック                                      |
| P27 | topic-map.md 再生成トリガー判断ミス     | 追加だけでなく削除・更新も再生成トリガー                            |
| P29 | SKILL.md 変更履歴の更新漏れ             | LOGS.mdとは別にSKILL.mdの変更履歴テーブルも必ず更新                 |
| P38 | 未タスク配置ディレクトリ間違い          | `unassigned-task/` に配置。親タスクの `tasks/` ではない             |
| P43 | サブエージェントのrate limit中断        | 仕様書更新は3ファイル以下/エージェントに分割                        |

---

## サブタスク管理テーブル

| #   | サブタスク                                        | 推奨エージェント分割 |
| --- | ------------------------------------------------- | -------------------- |
| 1   | 事前チェック（06-known-pitfalls.md確認）          | メインエージェント   |
| 2   | Task 1: 実装ガイド作成（Part 1 + Part 2）         | エージェント A       |
| 3   | Task 2: Step 1-A〜1-D（仕様書完了記録）           | エージェント B       |
| 4   | Task 2: Step 1-E〜1-G + Step 2（検証・更新）      | エージェント C       |
| 5   | Task 3: ドキュメント更新履歴 & artifacts.json更新 | メインエージェント   |
| 6   | Task 4: 未タスク検出レポート作成                  | エージェント D       |
| 7   | Task 5: スキルフィードバックレポート作成          | エージェント D       |
| 8   | 苦戦箇所の記録                                    | メインエージェント   |
| 9   | 完了条件の検証（三点突合）                        | メインエージェント   |

> **P43対策**: 仕様書更新は3ファイル以下/エージェントに分割する。

---

## Phase 12 自動化コマンド一覧

```bash
# topic-map.md再生成（Step 1-D）
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
node .claude/skills/task-specification-creator/scripts/generate-index.js \
  --workflow docs/30-workflows/completed-tasks/UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001 \
  --regenerate

# Step 1-G: 仕様書整合検証
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/completed-tasks/UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001 \
  --json
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/completed-tasks/UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001

# SKILL frontmatter検証（Error 0件が合格。WarningはStep 1-G.2で判定）
for skill in skill-creator task-specification-creator aiworkflow-requirements; do
  echo "=== $skill ===" && \
  node .claude/skills/skill-creator/scripts/quick_validate.js ".claude/skills/$skill"
done

# 未タスク監査（current/baseline分離）
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --diff-from HEAD

# 未タスクリンク検証
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js

# ESLintキャッシュクリア
rm -rf node_modules/.cache/eslint-*
pnpm lint --cache=false

# 未実施タスク誤配置チェック
rg -n "^\\| ステータス\\s*\\|.*未着手|^\\| ステータス\\s*\\|.*未実施|^\\| ステータス\\s*\\|.*進行中" \
  docs/30-workflows/completed-tasks/unassigned-task -g "*.md"
```

---

## 成果物一覧

| 成果物                       | パス                                            | 必須 | 説明                        |
| ---------------------------- | ----------------------------------------------- | ---- | --------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`      | ✅   | 概念的+技術的ドキュメント   |
| 仕様更新サマリー             | `outputs/phase-12/spec-update-summary.md`       | ✅   | Step 1-A〜Step 2の実施結果  |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`   | ✅   | 更新履歴                    |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md` | ✅   | 検出結果（0件でも出力必須） |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`     | ✅   | 改善点（なしでも出力必須）  |
| 未完了タスク指示書           | `docs/30-workflows/unassigned-task/*.md`        | 条件 | 検出時のみ作成              |

---

## 完了条件

### Task 1: 実装ガイド

- [ ] 実装ガイド Part 1（中学生レベル概念説明 — 日常例え必須）が作成されている
- [ ] 実装ガイド Part 1 に「宿題チェックリスト」「3つの確認スタンプ」「テストの点数」の3つの例え話が含まれている
- [ ] 実装ガイド Part 2（開発者向け技術的詳細）が作成されている
- [ ] Part 2 にN/A判定ログテンプレートのフィールド定義とバリデーション規則が含まれている
- [ ] Part 2 に三点突合の検証手順（4ステップ）が含まれている
- [ ] Part 2 にcurrent/baseline分離の判定アルゴリズムが含まれている
- [ ] Part 2 にSubAgent分担表テンプレートの仕様が含まれている
- [ ] Part 2 に監査スクリプトとの連携方法が含まれている

### Task 2: システムドキュメント更新

- [ ] 【Step 1-A】`task-workflow.md` に「完了タスク」セクションを追加した
- [ ] 【Step 1-A】関連ドキュメントセクションに実装ガイドリンクを追加した
- [ ] 【Step 1-A】変更履歴セクションにバージョンを追記した
- [ ] 【Step 1-A】`aiworkflow-requirements/LOGS.md` にタスク完了エントリを追加した
- [ ] 【Step 1-A】`task-specification-creator/LOGS.md` にタスク完了記録を追加した（**2ファイル両方** — P1, P25）
- [ ] 【Step 1-A】`aiworkflow-requirements/SKILL.md` 変更履歴テーブルを更新した ⚠️ 漏れやすい（P29）
- [ ] 【Step 1-A】`task-specification-creator/SKILL.md` 変更履歴テーブルを更新した ⚠️ 漏れやすい（P29）
- [ ] `node .claude/skills/skill-creator/scripts/quick_validate.js` で3スキル（`skill-creator` / `task-specification-creator` / `aiworkflow-requirements`）を検証し、Error 0件を確認した
- [ ] Warning が出た場合、Step 1-G.2 の3段階分類（要監視/要対応）で判定し、`spec-update-summary.md` に記録した
- [ ] 【Step 1-B】運用改善タスクのため実装状況テーブル更新は「該当なし」と記録した
- [ ] 【Step 1-C】`grep -rn` で関連タスクテーブルを全件確認した
- [ ] 【Step 1-D】topic-map.mdを再生成した ⚠️ 漏れやすい（P2, P27）
- [ ] 【Step 1-D】`task-specification-creator/scripts/generate-index.js --regenerate` で workflow index を再同期した
- [ ] 【Step 1-E】未タスク検出時に `unassigned-task/` 作成→`task-workflow.md` 登録→関連仕様リンク更新を完了した
- [ ] 【Step 1-E】`verify-unassigned-links.js` 実行結果を記録した
- [ ] 【Step 1-E】`audit-unassigned-tasks` の `currentViolations.total` を記録し、baselineと分離した
- [ ] 【Step 1-F】DevOps関連更新は「該当なし」と記録した
- [ ] 【Step 1-G】`verify-all-specs.js` と `validate-phase-output.js` を順次実行し、PASSを確認した
- [ ] 【Step 1-G】`quick_validate.js` 3スキル実行結果（Error 0件）を記録した
- [ ] 【Step 2】システム仕様更新の要否を判断し、documentation-changelog.mdに記録した
- [ ] 【Step 2】更新対象3ファイルの更新要否を全件確認した
- [ ] 【Step 2】N/A判定ログで非対象仕様書の判定理由と代替証跡を記録した
- [ ] `outputs/phase-12/spec-update-summary.md` を作成し、Step 1-A〜Step 2の実施結果を記録した

### Task 3: ドキュメント更新履歴

- [ ] `outputs/phase-12/documentation-changelog.md` が作成されている
- [ ] 各Stepの完了結果が詳細に記録されている（漏れの可視化）
- [ ] artifacts.jsonが更新されている
- [ ] artifacts.jsonの全完了Phase（1-12）のステータスがcompletedであること
- [ ] `artifacts.json` と `outputs/artifacts.json` の両方を同期し、参照切れが0件であること
- [ ] Phase 11成果物（`manual-test-result.md`）が Phase 12 更新判定の入力として参照されていること
- [ ] **三点突合**: 成果物実体5ファイル存在 + artifacts.json Phase 12 completed + 完了条件全チェック

### Task 4: 未タスク検出

- [ ] 未タスク検出レポートが出力されている【0件でも必須】
- [ ] 検出時、未タスク指示書が `docs/30-workflows/unassigned-task/` に配置されている ⚠️（P38対策）
- [ ] 検出時、**3ステップ全完了**（①指示書作成 → ②task-workflow.md登録 → ③関連仕様書リンク）
- [ ] 検出時、**関連ファイル調査**（同様パターンの他ファイル）を実施した
- [ ] 未タスク指示書の物理ファイル存在を確認した（`ls docs/30-workflows/unassigned-task/` で検証）
- [ ] `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` を実行し、参照切れが0件
- [ ] `audit-unassigned-tasks.js --json --target-file <今回対象ファイル>` を実行し、`currentViolations.total = 0` を確認した
- [ ] `audit-unassigned-tasks.js --json` を実行し、baseline監視結果を記録した
- [ ] current/baseline分離記録を `spec-update-summary.md` に `baseline: N件 / current: M件` 形式で記録した
- [ ] 完了済み未タスク指示書が `unassigned-task/` に残置されていない（完了時は `completed-tasks/unassigned-task/` へ移管）
- [ ] **未実施**タスク指示書が `completed-tasks/unassigned-task/` に混在していない

### Task 5: スキルフィードバック

- [ ] スキルフィードバックレポートが出力されている【改善点なしでも必須】

### 品質確認

- [ ] 【品質】ESLintキャッシュをクリアしてlintを再実行した
- [ ] `.claude/rules/` の技術的負債テーブルが最新
- [ ] **本Phase内の全タスクを100%実行完了**

---

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 事前チェック（06-known-pitfalls.md確認）
2. Task 1: 実装ガイド作成（Part 1 + Part 2）
3. Task 2: システムドキュメント更新（Step 1-A〜1-G + Step 2）
4. Task 3: ドキュメント更新履歴 & artifacts.json更新
5. Task 4: 未タスク検出レポート作成
6. Task 5: スキルフィードバックレポート作成
7. 苦戦箇所の記録
8. 完了条件の検証（三点突合）

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスク（Task 1〜5）を100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している
- [ ] **三点突合による完了判定がPASS**（成果物実体 + artifacts.json + チェックリスト）

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/UT-IMP-PHASE12-SUBAGENT-NA-LOG-GUARD-001 --phase 12
```

## 次のPhase

Phase 13: PR作成
