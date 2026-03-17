# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 13                                |
| Phase名    | PR作成                            |
| 前提Phase  | Phase 12（ドキュメント 完了）     |
| 後続Phase  | なし（完了）                      |
| ステータス | blocked（ユーザーの明示承認待ち） |
| 作成日     | 2026-03-16                        |
| 機能名     | スキル共有・公開・互換性統合      |
| タスクID   | TASK-SKILL-LIFECYCLE-08           |
| タスク種別 | 設計                              |

---

## blocked 状態の記録

**このフェーズは blocked 状態である。**

| 項目                 | 内容                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------ |
| blocked 理由         | ユーザーの明示承認を取得していないため                                               |
| user approval の有無 | 未取得                                                                               |
| Phase 12 完了根拠    | Phase 12 完了条件チェックリスト全項目チェック済みであること（本 Phase 実行前に確認） |
| 自動実行の禁止       | commit・push・PR 作成を自動で行わない                                                |

ユーザーが「Phase 13 を実行してください」または「PR を作成してください」と明示的に承認した場合のみ、実行タスクを実施する。

---

## 目的

全 Phase の成果物を最終確認し、PR 本文ドラフトを準備する。ユーザーの明示承認後に PR 作成を実行する。

---

## 背景

TASK-SKILL-LIFECYCLE-08 は設計専用タスクであり、Phase 1〜12 を通じて以下の成果物が作成された:

- `outputs/phase-1/`: 要件定義書 5ファイル（公開レベル・互換性要件・安全性接続・Skill Center登録・配布整合）
- `outputs/phase-2/`: 設計書 5ファイル（公開メタデータ・互換性チェック・Skill Center フロー・配布操作・公開判定ロジック）
- `outputs/phase-3/`: レビューレポート 5ファイル（受入基準・依存契約・システム仕様・品質評価・総合判定）
- `outputs/phase-4/`: テスト仕様書（設計タスクのためテスト設計書）
- `outputs/phase-10/`: 最終レビューレポート
- `outputs/phase-11/`: ウォークスルー結果
- `outputs/phase-12/`: ドキュメント（実装ガイド・システム仕様更新・未タスク検出・フィードバック）

Phase 13 は、これら全成果物の最終確認と PR 準備を行う。設計変更の主な差分は `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` への型定義追加と `docs/30-workflows/` 配下の仕様書群である。

---

## 実行タスク

> **前提**: ユーザーの明示承認を得た後にのみ実施する。

### タスク1: Phase 12 完了確認

**目的**: Phase 12 の5タスクが全て完了していることを確認してから PR 準備を進める。

**実行手順**:

1. Phase 12 の完了条件チェックリストを読み込み、全項目がチェック済みであることを確認する
2. `outputs/phase-12/phase12-task-spec-compliance-check.md` を確認し、5タスク全て「完了」と記録されていることを確認する
3. 特に以下の重要項目を確認する:
   - LOGS.md の2ファイル（aiworkflow-requirements + task-specification-creator）が更新されているか
   - SKILL.md の2ファイルが更新されているか（P29対策）
   - topic-map.md が再生成されているか（P2/P27対策）
   - interfaces-agent-sdk-skill.md に5つの型定義が追記されているか
   - `unassigned-task-detection.md` が作成されているか（0件でも必須）
   - `skill-feedback-report.md` が作成されているか（改善点なしでも必須）
4. 未完了項目が存在する場合は、Phase 12 を完了させてから本タスクに戻る

**期待される確認結果**: Phase 12 の全5タスクが完了していること

---

### タスク2: 全 Phase 成果物の最終確認

**目的**: Phase 1〜12 で作成された全成果物が揃っており、各ファイルの内容が一貫していることを最終確認する。

**実行手順**:

1. 以下のディレクトリの成果物ファイルを確認する:

   | ディレクトリ        | 期待されるファイル数 | 確認コマンド                    |
   | ------------------- | -------------------- | ------------------------------- |
   | `outputs/phase-1/`  | 5ファイル            | `ls outputs/phase-1/ \| wc -l`  |
   | `outputs/phase-2/`  | 5ファイル            | `ls outputs/phase-2/ \| wc -l`  |
   | `outputs/phase-3/`  | 5ファイル            | `ls outputs/phase-3/ \| wc -l`  |
   | `outputs/phase-10/` | 1ファイル以上        | `ls outputs/phase-10/`          |
   | `outputs/phase-11/` | 2ファイル            | `ls outputs/phase-11/ \| wc -l` |
   | `outputs/phase-12/` | 6ファイル            | `ls outputs/phase-12/ \| wc -l` |

2. `git diff --stat` を実行し、変更ファイルの一覧と件数を確認する:
   - 変更ファイル数が0件の場合は、`git status` で状態を確認する
   - コミット前に `git add -n .`（dry-run）で追加予定ファイルを確認する

3. 変更内容が TASK-SKILL-LIFECYCLE-08 のスコープ内に収まっていることを確認する:
   - スコープ内: `docs/30-workflows/skill-lifecycle-unification/tasks/step-06-seq-task-08-skill-publishing-version-compatibility/` 配下の全ファイル
   - スコープ内: `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`
   - スコープ内: `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-*.md`
   - スコープ内: `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`
   - スコープ内: `.claude/skills/aiworkflow-requirements/LOGS.md`, `SKILL.md`
   - スコープ内: `.claude/skills/task-specification-creator/LOGS.md`, `SKILL.md`
   - スコープ内: `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`
   - スコープ外の変更が含まれる場合は、意図的なものかを確認し、不要な変更はリセットする

**期待される成果物**: `outputs/phase-13/completion-checklist.md` の「成果物確認」セクション

---

### タスク3: PR 本文ドラフトの作成

**目的**: レビュアーが変更の意図と影響範囲を正確に把握できる PR 本文を作成する。

**実行手順**:

1. `outputs/phase-13/pr-draft.md` を以下の構成で作成する:

   ```markdown
   # タイトル（70文字以内）

   feat(skill-lifecycle): スキル共有・公開・互換性統合の設計仕様策定（TASK-SKILL-LIFECYCLE-08）

   ## Summary

   - スキルの公開レベル（local/team/public）を定義し、各レベルの遷移条件・権限マトリクスを策定した
   - semver ルールと schema 互換性チェックの仕様を策定し、breaking change の判定基準を数値で定義した
   - Task06（安全性ゲート）・Task07（観測指標）を公開可否判定に接続する `PublishReadiness` 型と判定マトリクスを設計した

   ## 変更ファイル一覧

   （git diff --stat の出力結果を貼り付ける）

   ## 主要な設計決定

   - `SkillVisibility`: `"local" | "team" | "public"` の3段階公開レベル（デフォルト: local）
   - `CompatibilityCheckResult`: breaking change 自動判定・semver バンプ提案・依存解決の3機能を統合
   - `PublishReadiness`: `auto-approved / review-required / manual-approval-required / blocked` の4ステータス判別 union
   - `SkillRegistryService`: Skill Center 登録・更新・公開停止・依存スキル照会の5メソッドインターフェース
   - `SkillDistributionService`: import/export/fork/share の4操作インターフェース

   ## Test Plan

   - 設計タスクのため、実行可能テストは Phase 12 未タスク指示書に記録した
   - 実装フェーズで `outputs/phase-12/unassigned-task-detection.md` の「契約→テスト」未タスクを実施する
   - 型定義の整合性は `pnpm typecheck` で確認予定（型追加後に実施）

   ## Breaking Changes

   - なし（設計書・仕様書のみの変更であり、既存の実装コードへの影響はない）

   ## 依存タスク

   - TASK-SKILL-LIFECYCLE-05（利用導線）: 依存関係あり（import フロー）
   - TASK-SKILL-LIFECYCLE-06（安全性ゲート）: 依存関係あり（PublishReadiness の入力）
   - TASK-SKILL-LIFECYCLE-07（観測指標）: 依存関係あり（公開判定マトリクスの入力）
   ```

2. PR タイトルが70文字以内であることを確認する
3. Summary が1〜3箇条書きで構成されていることを確認する

**期待される成果物**: `outputs/phase-13/pr-draft.md`

---

### タスク4: ブランチ・差分の確認

**目的**: PR を作成する前に、ブランチ名・差分件数・コミット状態を確認する。

**実行手順**:

1. 現在のブランチ名を確認する:
   - `git branch --show-current` を実行する
   - ブランチ名が `feature/` または `docs/` プレフィックスであることを確認する（07-git-and-tooling.md）
   - ブランチ名が適切でない場合は、`git checkout -b feature/task-skill-lifecycle-08-publishing-design` でブランチを作成する

2. `git diff --stat` を実行し、変更ファイル数と追加/削除行数を確認する:
   - 変更内容が TASK-SKILL-LIFECYCLE-08 のスコープ内であることを確認する
   - スコープ外の変更が含まれる場合は、意図的なものかを確認する

3. `git status` を実行し、untracked または staged の状態を確認する:
   - 必要なファイルが全て `git add` されているかを確認する

4. コミット前チェックリストを確認する（07-git-and-tooling.md 準拠）:
   - `pnpm lint` が通ること（ドキュメントのみの変更のためスキップ可）
   - `pnpm typecheck` が通ること（型追加前のため、型定義追加後に実施）
   - `--no-verify` を使用しないこと（絶対禁止）

**期待される成果物**: `outputs/phase-13/completion-checklist.md` の「ブランチ・差分確認」セクション

---

## 参照資料

| 参照資料                          | パス                                                     | 内容                      |
| --------------------------------- | -------------------------------------------------------- | ------------------------- |
| Phase 12 完了条件                 | `./phase-12-documentation.md`                            | 5タスク完了チェックリスト |
| Phase 12 コンプライアンスチェック | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 全タスク完了根拠 |
| Phase 12 未タスク検出             | `outputs/phase-12/unassigned-task-detection.md`          | 契約→テスト未タスク一覧   |

### システム仕様（aiworkflow-requirements）

| 参照資料        | パス                                  | 内容             |
| --------------- | ------------------------------------- | ---------------- |
| PR ガイドライン | `.claude/rules/07-git-and-tooling.md` | PR 作成ルール    |
| git 禁止事項    | `CLAUDE.md`                           | --no-verify 禁止 |

---

## 統合テスト連携

Phase 13 は PR 準備フェーズであり、テストコードの作成・実行は行わない。`outputs/phase-12/unassigned-task-detection.md` の「契約→テスト」未タスクが後続実装タスクで実施される。

---

## 成果物

| 成果物                 | パス                                       | 内容                                                 |
| ---------------------- | ------------------------------------------ | ---------------------------------------------------- |
| PR 本文ドラフト        | `outputs/phase-13/pr-draft.md`             | PR タイトル・Summary・Test Plan・Breaking Changes    |
| 最終完了チェックリスト | `outputs/phase-13/completion-checklist.md` | 全 Phase 成果物確認・ブランチ確認・Phase 12 完了根拠 |

---

## 完了条件

- [ ] タスク1: Phase 12 の5タスク全完了が確認されている
- [ ] タスク2: 全 Phase の成果物ファイル数が期待値と一致している
- [ ] タスク2: `git diff --stat` の変更ファイルがスコープ内のみに収まっている
- [ ] タスク3: `outputs/phase-13/pr-draft.md` が作成されており、Summary・Test Plan・Breaking Changes を含んでいる
- [ ] タスク3: PR タイトルが70文字以内である
- [ ] タスク4: ブランチ名が `feature/` または `docs/` プレフィックスである
- [ ] `outputs/phase-13/completion-checklist.md` が作成されている
- [ ] ユーザーの明示承認を取得している（承認なしに commit・push・PR 作成を実施しない）

---

## タスク100%実行確認【必須】

| #   | 確認項目                    | 確認方法                                                        | 合否基準                                 |
| --- | --------------------------- | --------------------------------------------------------------- | ---------------------------------------- |
| 1   | Phase 12 が完了している     | `outputs/phase-12/phase12-task-spec-compliance-check.md` を確認 | 5タスク全て「完了」と記録されている      |
| 2   | PR ドラフトが作成されている | `ls outputs/phase-13/pr-draft.md`                               | ファイルが存在する                       |
| 3   | PR タイトルが70文字以内     | `cat outputs/phase-13/pr-draft.md` の1行目を確認                | 70文字以内である                         |
| 4   | ブランチが適切である        | `git branch --show-current`                                     | `feature/` または `docs/` プレフィックス |
| 5   | ユーザー承認を確認済み      | 承認の有無を記録する                                            | 承認済みの場合のみ commit・PR 作成を実施 |

---

## 多角的チェック観点（AIが判断）

- Phase 12 の全6タスクが完了しており、タスク100%実行確認テーブルの全項目が合格か
- PR タイトルが70文字以内で、変更内容を正確に反映しているか
- PR 本文に Summary（1-3箇条書き）+ Test Plan が含まれているか
- ブランチ名が `feature/` または `docs/` プレフィックスに従っているか
- ユーザーの明示承認なしに commit・PR 作成を実施していないか

---

## サブタスク管理

| #   | タスク名                  | ステータス | 完了基準                   |
| --- | ------------------------- | ---------- | -------------------------- |
| 1   | Phase 12 完了確認         | 未実施     | 全6タスクが完了と記録      |
| 2   | 全 Phase 成果物の最終確認 | 未実施     | 全 Phase の成果物が存在    |
| 3   | PR 本文ドラフトの作成     | 未実施     | Summary + Test Plan が存在 |
| 4   | ブランチ・差分の確認      | 未実施     | ブランチ名が規約に従う     |

---

## 依存関係

- **前提**: Phase 12（ドキュメント）が完了していること
- **後続**: なし（TASK-SKILL-LIFECYCLE-08 完了）

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
### 実行タスク

- タスク1（Phase 12 完了確認）: （結果を記録）
- タスク2（全 Phase 成果物の最終確認）: （結果を記録）
- タスク3（PR 本文ドラフトの作成）: （結果を記録）
- タスク4（ブランチ・差分の確認）: （結果を記録）

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次Phase

なし（TASK-SKILL-LIFECYCLE-08 完了）

- TASK-SKILL-LIFECYCLE-08 の全 Phase（Phase 1〜13）が完了した
- `outputs/phase-12/unassigned-task-detection.md` で記録した未タスクは、後続の実装タスクで対応する
- PR マージ後に `task-workflow.md` の完了セクションに移動する
