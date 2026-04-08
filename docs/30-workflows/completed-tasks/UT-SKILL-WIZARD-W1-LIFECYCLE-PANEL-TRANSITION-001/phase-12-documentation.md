# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                                                |
| ------ | ------------------------------------------------- |
| Phase  | 12                                                |
| 機能名 | UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001 |
| 作成日 | 2026-04-08                                        |

---

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。  
Phase 12 は 5 つの通常タスクに加えて、最終判定を固定する root evidence を必ず出力する。

## 参照資料

- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-11/manual-test-checklist.md`
- `outputs/phase-11/discovered-issues.md`
- `outputs/phase-12/implementation-guide.md`
- `outputs/phase-12/system-spec-update-summary.md`
- `outputs/artifacts.json`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`

---

## 事前チェック【必須】

Phase 12 実行前に以下の既知の落とし穴を確認する:

- [ ] P0: `artifacts.json` と `outputs/artifacts.json` の title / type / status / phase artifact 名 parity を初手で確認した
- [ ] P1: LOGS.md 2 ファイル更新漏れ（aiworkflow-requirements + task-specification-creator 両方必須）
- [ ] P2: topic-map.md 再生成忘れ
- [ ] P3: 未タスク管理の 3 ステップ不完全
- [ ] P28: スキルフィードバックレポート未作成
- [ ] P29: SKILL.md 変更履歴の更新漏れ

---

## 実行タスク

| Task      | 内容                                       | 主成果物                                                 |
| --------- | ------------------------------------------ | -------------------------------------------------------- |
| Task 12-1 | 技術ドキュメント作成（実装ガイド作成）     | `outputs/phase-12/implementation-guide.md`               |
| Task 12-2 | システムドキュメント更新                   | `outputs/phase-12/system-spec-update-summary.md`         |
| Task 12-3 | ドキュメント更新履歴作成                   | `outputs/phase-12/documentation-changelog.md`            |
| Task 12-4 | 未タスク検出                               | `outputs/phase-12/unassigned-task-detection.md`          |
| Task 12-5 | スキルフィードバックレポート作成           | `outputs/phase-12/skill-feedback-report.md`              |
| Task 12-6 | Phase 12 準拠最終チェック（root evidence） | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

- Task 12-1: 技術ドキュメント作成（実装ガイド作成）
- Task 12-2: システムドキュメント更新（Step 1-A〜1-G / Step 2 判定）
- Task 12-3: ドキュメント更新履歴作成（変更履歴と同値記録の記録）
- Task 12-4: 未タスク検出（残課題の検出と 0件報告を含む記録）
- Task 12-5: スキルフィードバックレポート作成（ワークフロー改善点と技術的教訓の記録）
- Task 12-6: Phase 12 準拠最終チェック（Task 12-1〜12-5 + Step 1-A〜1-G / Step 2 の root evidence 集約）

---

## Task 1: 実装ガイド作成【必須】

**2 パート構成**の実装ガイドを作成する:

| パート | 対象読者         | 内容                                                                                      |
| ------ | ---------------- | ----------------------------------------------------------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（テキストエリア廃止とウィザード遷移の意味）                                  |
| Part 2 | 開発者・技術者   | 技術的詳細（削除した UI 要素・state・追加した props / 型 / API / 使用例 / エラー / 定数） |

**Part 1 ガイドライン**: 「なぜ必要か」→「何をするか」の順序を維持し、`たとえば` を最低 1 回含める。

**Part 2 ガイドライン**:

- `SkillLifecyclePanelProps` の TypeScript 型定義を含める
- `onOpenWizard` / `onOpenSkillWizard` / `onOpenSettings` の API / prop シグネチャを含める
- 使用例、エラーハンドリング、エッジケース、設定可能な定数を省略しない
- 既存 state の削除可否と責務境界を明示する

---

## Task 2: システムドキュメント更新【必須】

Phase 12 の Step 1 は、仕様書の完了記録と台帳・検証・未タスク・補助更新を同一 wave で閉じる。

### Step 1-A: 仕様書完了記録

- [ ] UI/UX 仕様書に「完了タスク」セクションを追加
- [ ] 変更履歴セクションにバージョンを追記
- [ ] `task-workflow.md` に完了タスクを同値記録する
- [ ] `aiworkflow-requirements/LOGS.md` にタスク完了エントリを追加（**必須**）
- [ ] `task-specification-creator/LOGS.md` にタスク完了記録を追加（**必須** -- P1）
- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴更新（**漏れやすい** -- P29）
- [ ] `task-specification-creator/SKILL.md` 変更履歴更新（**漏れやすい** -- P29）

### Step 1-B: artifacts / outputs parity

- [ ] `artifacts.json` と `outputs/artifacts.json` の title / type / status / phase artifact 名 parity を確認する
- [ ] Phase 状態が `spec_created` / `completed` のどちらであるべきかを current facts に合わせて記録する

### Step 1-C: 関連タスク更新

- [ ] 仕様書内の「関連タスク」「未タスク候補」「残課題」を更新する
- [ ] `onOpenSkillWizard` と `onOpenSettings` の current facts を task-workflow / completed ledger に同期する

### Step 1-D: topic-map.md 再生成

- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

### Step 1-E: 未タスク登録

- [ ] 未タスク候補が 1 件以上ある場合は指示書を作成し、`task-workflow.md` と関連仕様書へリンクする
- [ ] 0件でも `unassigned-task-detection.md` に 0件報告を残す

### Step 1-F: 補助更新

- [ ] `lessons-learned.md` / 関連仕様書に今回の苦戦箇所を記録する
- [ ] `task-workflow-backlog.md` へ継続課題がある場合のみ追記する

### Step 1-G: 検証

- [ ] `quick_validate.js` / `validate-phase-output.js` / `validate-phase12-implementation-guide.js` を実行し、結果を記録する
- [ ] baseline と current の違いを分けて記録する

### Step 2: システム仕様更新の要否判断

本タスクはリファクタリング（UI 変更のみ、IPC 変更なし）のため、システム仕様の大幅な更新は不要と考えられる。  
ただし、`SkillLifecyclePanel` の props 定義変更（`onOpenSettings` 追加）と state 依存の整理は UI/UX 仕様書に反映し、`approvedSkillSpec` の扱いが変わる場合のみ state 管理仕様を更新する。

| 更新対象                                  | 更新要否 | 理由                                                             |
| ----------------------------------------- | -------- | ---------------------------------------------------------------- |
| `ui-ux-skill-lifecycle.md`                | 必要     | `onOpenWizard` / `onOpenSettings` prop 追加・textarea 廃止を反映 |
| `api-ipc-agent.md`                        | 不要     | IPC チャンネル変更なし                                           |
| `arch-state-management.md`                | 要確認   | state 削除による影響を確認                                       |
| `architecture-implementation-patterns.md` | 不要     | 新規パターンなし                                                 |
| `task-workflow.md`                        | 要確認   | 完了タスク・苦戦箇所・follow-up 境界を記録                       |

---

## Task 3: ドキュメント更新履歴作成【必須】

`documentation-changelog.md` は「更新した事実」と「更新しなかった理由」を両方残す。

| 記録項目           | 内容                                                                     |
| ------------------ | ------------------------------------------------------------------------ |
| 変更ファイル一覧   | 仕様書・skill・LOGS・関連 spec を canonical path で列挙する              |
| 検証結果           | `validate-phase-output` / `quick_validate` / `diff -qr` の結果を記録する |
| current / baseline | 今回差分と既存ベースラインを分ける                                       |
| parity 判定        | `artifacts.json` と `outputs/artifacts.json` の同値確認結果を記録する    |
| 更新判断           | Step 2 が必要 / 不要だった理由を明示する                                 |

更新後、未確定表現（`予定` / `保留` / `実行予定` / `仕様策定のみ`）は残さない。

---

## Task 4: 未タスク検出【必須】

確認ソースと検出対象:

| #   | ソース                  | 確認項目                                                            |
| --- | ----------------------- | ------------------------------------------------------------------- |
| 1   | Phase 3 レビュー結果    | MINOR 判定の指摘事項                                                |
| 2   | Phase 10 レビュー結果   | MINOR 判定の指摘事項                                                |
| 3   | Phase 11 手動テスト結果 | スコープ外の発見事項                                                |
| 4   | resolved carry-over     | `onOpenSkillWizard` / `onOpenSettings` wiring の current facts 確認 |
| 5   | コードベース            | TODO/FIXME/HACK コメント                                            |

**必須未タスク候補**: なし。`SkillCreateWizard` への実配線・疎通確認と settings 導線の分離は current facts で完了済みのため、未タスクとして登録しない。`onOpenSkillWizard` / `onOpenSettings` の props 追加と UI 配置も本タスクで完了している。

未タスクは、指示書作成 → `task-workflow.md` 登録 → 関連仕様書リンクの 3 ステップで閉じる。

---

## Task 5: スキルフィードバックレポート【必須】

改善点がなくても「改善点なし」として作成する（省略不可）。

| セクション         | 記載内容                                                   |
| ------------------ | ---------------------------------------------------------- |
| ワークフロー改善点 | Phase 実行中に発見したワークフロー上の改善提案             |
| 技術的教訓         | `approvedSkillSpec` state 削除判断プロセスから得られた知見 |
| スキル改善提案     | task-specification-creator / skill-creator への改善提案    |
| 新規 Pitfall 候補  | 06-known-pitfalls.md に追加すべき新規 Pitfall              |

---

## Task 6: Phase 12 準拠最終チェック（root evidence）【必須】

Task 12-1〜12-5 と Step 1-A〜1-G / Step 2 を 1 ファイルに集約し、最終判定を固定する。

**出力**: `outputs/phase-12/phase12-task-spec-compliance-check.md`

- [ ] Task 12-1〜12-5 の成果物実在と内容要件を確認
- [ ] Step 1-A〜1-G / Step 2 の実行結果を確認
- [ ] `artifacts.json` と `outputs/artifacts.json` の parity を確認
- [ ] 未確定表現（`計画` / `予定` / `TODO` / `仕様策定のみ`）の残置が 0 件であることを確認
- [ ] completed / backlog の ledger parity を確認

---

## 成果物

| 成果物                       | パス                                                     | 必須 | 説明                        |
| ---------------------------- | -------------------------------------------------------- | ---- | --------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               | ✅   | 概念的 + 技術的ドキュメント |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | ✅   | 更新内容のサマリー          |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            | ✅   | 更新履歴                    |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | ✅   | 検出結果（なしでも出力）    |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | ✅   | 改善点（なしでも出力必須）  |
| Phase 12 準拠最終チェック    | `outputs/phase-12/phase12-task-spec-compliance-check.md` | ✅   | root evidence（最終判定）   |

---

## 完了条件

- [ ] 実行タスクを「表」と「`- Task 12-X:` 箇条書き」の両方で記載している
- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] **【Task 2 Step 1】aiworkflow-requirements/LOGS.md にタスク完了エントリを追加した**
- [ ] **【Task 2 Step 1】task-specification-creator/LOGS.md にタスク完了記録を追加した**
- [ ] **【Task 2 Step 1】aiworkflow-requirements/SKILL.md 変更履歴テーブルを更新した** ⚠️ 漏れやすい（P29）
- [ ] **【Task 2 Step 1】task-specification-creator/SKILL.md 変更履歴テーブルを更新した** ⚠️ 漏れやすい（P29）
- [ ] **【Task 2 Step 1-B】`artifacts.json` と `outputs/artifacts.json` の parity を確認した**
- [ ] **【Task 2 Step 1-D】topic-map.md を再生成した** ⚠️ 漏れやすい（P2, P27）
- [ ] **【Task 2 Step 2】システム仕様更新の要否を判断し、documentation-changelog.md に記録した**
- [ ] **未タスク検出レポートが出力されている**【必須】
- [ ] **スキルフィードバックレポートが出力されている**【必須・改善点なしでも作成】
- [ ] **Phase 12 準拠最終チェック（Task 12-6）が出力されている**【必須】
- [ ] `onOpenSkillWizard` / `onOpenSettings` wiring の resolved carry-over が `task-workflow.md` に反映されている
- [ ] `artifacts.json` が更新されている
- [ ] `outputs/artifacts.json` が更新され、root と parity している
- [ ] `phase-12-documentation.md` と `outputs/phase-12/*.md` の未確定表現が 0 件である
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

---

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載の 6 ファイルを全件生成
- [ ] 2 ファイル（LOGS.md）の更新を確認した
- [ ] Task 12-6（`phase12-task-spec-compliance-check.md`）を作成し、最終判定を記録した
- [ ] `artifacts.json` / `outputs/artifacts.json` parity を確認した
- [ ] 実行記録を残した

```bash
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
```

---

## 次のPhase

Phase 13: PR 作成
