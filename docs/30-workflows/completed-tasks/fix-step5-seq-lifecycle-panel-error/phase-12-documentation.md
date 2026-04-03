# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| Phase      | 12                        |
| Phase名    | ドキュメント更新          |
| 前提Phase  | Phase 11                  |
| 後続Phase  | Phase 13                  |
| ステータス | 完了                      |
| 作成日     | 2026-04-02                |
| 機能名     | fix-lifecycle-panel-error |

---

## 目的

実装ガイド・システム仕様書同期・ドキュメント変更ログ・未タスク検出・スキルフィードバック・準拠確認の6ファイルを `outputs/phase-12/` に作成し、あわせて `artifacts.json` / `outputs/artifacts.json` の台帳を同期して Phase 12 を完了する。

## 背景

task-specification-creator SKILL.md の Phase 12 必須タスク5件を全て完了する。バグ修正タスクのため Step 2（新規インターフェース追加）は不要だが、Step 1-A〜1-C は必須実行する。

---

## 実行タスク

### タスク1: 実装ガイド作成（2パート構成）

**目的**: Part 1（中学生レベル）と Part 2（技術者レベル）の実装ガイドを作成する。

**実行手順**:

1. `outputs/phase-12/implementation-guide.md` を作成する
2. **Part 1（中学生レベル）**を記載する:
   - 日常生活の例え話を含める（`たとえば` を最低1回明示する）
   - 専門用語なし（使う場合は直後に説明する）
   - 「なぜ必要か」を先に説明してから「何をするか」を説明する
3. **Part 2（技術者レベル）**を記載する:
   - `onWorkflowStateChanged` コールバックのBefore/After
   - `snapshot.currentPhase` の型定義
   - TypeScript の interface / type 定義
   - API シグネチャと使用例
   - エラーハンドリングとエッジケース
   - 設定可能パラメータと定数一覧
   - IPC変更がないため、Consumer Contract & IPC Compatibility は N/A と明記する
4. `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/completed-tasks/fix-step5-seq-lifecycle-panel-error --json` を実行し、`phase12-checklist-definition.md` の要件に照らして Part 1/2 の不足がないことを確認する

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`

---

### タスク2: システム仕様書更新（Step 1-A〜1-C・Step 2判定）

**目的**: タスク完了記録とシステム仕様書の更新（Step 2は不要判定）を行う。

**実行手順**:

**Step 1-A**: タスク完了記録

1. `TASK-FIX-LIFECYCLE-PANEL-ERROR-001` の完了記録を以下に追加する:
   - `.claude/skills/aiworkflow-requirements` の該当セクション
   - `.claude/skills/task-specification-creator/LOGS.md`
   - `.claude/skills/aiworkflow-requirements/LOGS.md`
   - topic-map.md の更新（追加・削除・更新がある場合は再生成）
   - `artifacts.json` と `outputs/artifacts.json` の title / type / status / phase artifact 名 parity を初手で確認する

**Step 1-B**: 実装状況テーブル更新

2. 該当タスクの実装状況を「未実装」→「完了」に更新する

**Step 1-C**: 関連タスクテーブル更新

3. 仕様書内の「関連タスク」テーブルのステータスを current facts へ更新する

**Step 2判定**:

4. 本タスクは1行のバグ修正（新規インターフェース追加なし）のため Step 2 は **不要**（N/A）と記録する

**期待される成果物**:

- `outputs/phase-12/system-spec-update-summary.md`

---

### タスク3: ドキュメント変更ログ作成

**目的**: 全Step（1-A/1-B/1-C/Step 2）の結果を個別に記録する。

**実行手順**:

1. `outputs/phase-12/documentation-changelog.md` を作成する
2. Step 1-A〜1-C の各結果を個別に記載する（「該当なし」も記録）
3. `index.md` / `phase-*.md` / `artifacts.json` / `outputs/artifacts.json` の4点同期結果と、`validate-phase12-implementation-guide.js` を含む validator 実行結果を記録する
4. Step 2 の N/A 判定理由を記録する

**期待される成果物**:

- `outputs/phase-12/documentation-changelog.md`

---

### タスク4: 未タスク検出レポート作成（0件でも必須）

**目的**: バグ修正から派生する未タスク候補を検出し記録する。

**実行手順**:

1. 以下のソースから未タスク候補を収集する:
   - 元タスク仕様書の「スコープ外」記載（エラーメッセージUI改善、スキーマ変更 等）
   - Phase 3/10レビュー結果のMINOR指摘
   - コードコメント（未完了コメントの残存）
   - repo 全体の既存 baseline 違反が多い場合は current と baseline を分離する
2. `outputs/phase-12/unassigned-task-detection.md` を作成する（0件でも作成必須）
3. 検出された未タスクは `docs/30-workflows/unassigned-task/` にフォーマット準拠で作成する

**期待される成果物**:

- `outputs/phase-12/unassigned-task-detection.md`

---

### タスク5: スキルフィードバックレポート作成（改善点なしでも必須）

**目的**: task-specification-creator スキルへの改善フィードバックを記録する。

**実行手順**:

1. `outputs/phase-12/skill-feedback-report.md` を作成する（改善点なしでも作成必須）
2. 以下の観点でフィードバックを記録する:
   - テンプレートの漏れや曖昧さ
   - ワークフロー改善余地
   - ドキュメント改善候補
   - 改善点がない場合は `なし` と理由を明記する

**期待される成果物**:

- `outputs/phase-12/skill-feedback-report.md`

---

### タスク6: タスク仕様書準拠確認

**目的**: Phase 12成果物一覧と `outputs/phase-12/` 実体を1対1で突合する。

**実行手順**:

1. `outputs/phase-12/phase12-task-spec-compliance-check.md` を作成する
2. `artifacts.json` / `outputs/artifacts.json` / `index.md` / `phase-*.md` / `outputs/phase-12/` を1対1で突合する
3. 不足ファイルがないことと、台帳・本文・ミラーの parity と validator 実行結果が一致していることを確認する

**期待される成果物**:

- `outputs/phase-12/phase12-task-spec-compliance-check.md`

---

## 参照資料

| 参照資料                       | パス                                                                                    | 内容                 |
| ------------------------------ | --------------------------------------------------------------------------------------- | -------------------- |
| Phase 12ガイド                 | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`  | Phase 12実行手順     |
| 技術ドキュメントガイド         | `.claude/skills/task-specification-creator/references/technical-documentation-guide.md` | Part 1/2 記述要件    |
| Phase 12チェックリスト定義     | `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md`  | 実体確認要件         |
| Phase 12完了条件チェックリスト | `.claude/skills/task-specification-creator/references/phase-12-completion-checklist.md` | 4点同期・完了要件    |
| システム仕様更新ワークフロー   | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`          | Step 1-A〜Step 2手順 |
| 未タスクガイドライン           | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`    | 未タスク検出基準     |

---

## 成果物

| 成果物                       | パス                                                     | 内容                          |
| ---------------------------- | -------------------------------------------------------- | ----------------------------- |
| 実装ガイド（Part 1/2）       | `outputs/phase-12/implementation-guide.md`               | 中学生レベル + 技術者レベル   |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A〜1-C・Step 2判定結果 |
| ドキュメント変更ログ         | `outputs/phase-12/documentation-changelog.md`            | 全Stepの変更記録              |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | 未タスク候補（0件でも必須）   |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | スキル改善フィードバック      |
| タスク仕様書準拠確認         | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 成果物突合結果                |

---

## 完了条件

- [ ] `outputs/phase-12/` に6ファイル全てが作成されている
- [ ] `implementation-guide.md` に Part 1（中学生レベル）と Part 2（技術者レベル）が含まれている
- [ ] `validate-phase12-implementation-guide.js` が PASS している
- [ ] Step 1-A〜1-C の実行結果が記録されている（N/Aも記録）
- [ ] Step 2 が N/A 判定と理由が記録されている
- [ ] 未タスク検出レポートが作成されている（0件でも必須）
- [ ] スキルフィードバックレポートが作成されている（改善点なしでも必須）
- [ ] `artifacts.json` と `outputs/artifacts.json` の title / type / status / phase artifact 名が一致している
- [ ] `index.md` / `phase-*.md` / `artifacts.json` / `outputs/artifacts.json` の4点同期が完了している
- [ ] `outputs/phase-12/` の突合が完了している

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（タスク1〜6）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 6ファイルが `outputs/phase-12/` に揃っていることを確認

---

## 依存関係

- **前提**: Phase 11（手動テスト）が完了していること
- **後続**: Phase 13（PR作成）へ進む（ユーザー明示承認後のみ）

---

## 次のPhase

完了後、ユーザーの明示承認を得てから以下のファイルを実行してください:

`docs/30-workflows/completed-tasks/fix-step5-seq-lifecycle-panel-error/phase-13-pr-creation.md`
