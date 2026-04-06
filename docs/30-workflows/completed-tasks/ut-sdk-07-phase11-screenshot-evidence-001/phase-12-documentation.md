# Phase 12: ドキュメント更新 - UT-SDK-07-PHASE11-SCREENSHOT-EVIDENCE-001

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 12                                        |
| Phase名    | ドキュメント更新                          |
| 前提Phase  | Phase 11（手動テスト）                    |
| 後続Phase  | Phase 13                                  |
| ステータス | complete                                  |
| 作成日     | 2026-04-06                                |
| 機能名     | ut-sdk-07-phase11-screenshot-evidence-001 |

---

## 目的

Phase 11 で取得した evidence を元に、Phase 12 の 6 必須成果物を作成し、task-workflow / skill history / validator / unassigned-task の同期を閉じる。

## 実行タスク

- Task 12-1: 実装ガイド作成
- Task 12-2: システム仕様更新
- Task 12-3: ドキュメント更新履歴作成
- Task 12-4: 未タスク検出レポート作成
- Task 12-5: スキルフィードバックレポート作成
- Task 12-6: phase12-task-spec-compliance-check 作成

---

## SubAgent分担

| SubAgent | 担当                                           | 並列性             | 依存              |
| -------- | ---------------------------------------------- | ------------------ | ----------------- |
| A        | Task 12-1: 実装ガイド作成                      | 可                 | Phase 11 evidence |
| B1       | Task 12-2: aiworkflow-requirements 側の更新    | 可                 | Phase 11 evidence |
| B2       | Task 12-2: task-specification-creator 側の更新 | 可                 | Phase 11 evidence |
| C        | Task 12-3: ドキュメント更新履歴                | A/B 完了後に可     | Task 12-1/12-2    |
| D        | Task 12-4: 未タスク検出                        | A/B 完了後に可     | Task 12-1/12-2    |
| E        | Task 12-5: スキルフィードバック                | A/B 完了後に可     | Task 12-1/12-2    |
| F        | Task 12-6: phase12-task-spec-compliance-check  | C/D/E 完了後に直列 | 全成果物          |

- Task 12-2 は `aiworkflow-requirements` と `task-specification-creator` を別 SubAgent に切り分ける。
- Task 12-3〜12-5 は互いに独立なので、Task 12-1/12-2 完了後に並列実行する。
- Task 12-6 は root evidence として最後に 1 ファイルへ集約する。

---

## Phase 12 必須成果物（全6件）

| Task | 成果物                                | 配置先              |
| ---- | ------------------------------------- | ------------------- |
| 1    | implementation-guide.md               | `outputs/phase-12/` |
| 2    | system-spec-update-summary.md         | `outputs/phase-12/` |
| 3    | documentation-changelog.md            | `outputs/phase-12/` |
| 4    | unassigned-task-detection.md          | `outputs/phase-12/` |
| 5    | skill-feedback-report.md              | `outputs/phase-12/` |
| 6    | phase12-task-spec-compliance-check.md | `outputs/phase-12/` |

---

## Task 1: 実装ガイド作成（2パート構成）

### Part 1（中学生レベル）

**対象読者**: 技術的な背景がない読者

**作成内容**:

- このタスクが「なぜ必要だったか」を日常の例え話で説明する
  - たとえば「工事が終わったのに、完成写真を撮り忘れた状態。後から証拠写真が必要になる前に撮っておくタスク」のように説明する
- screenshot が「証拠として機能する」ことを平易に説明する
- `terminal_handoff` と `integrated_api` の違いを「API キーがある場合とない場合の動作の違い」として説明する
- 専門用語は使わない。使う場合は直後に言い換えを入れる
- 「なぜ必要か」→「何をするか」の順で説明する

### Part 2（技術者レベル）

**作成内容**:

- `HandoffGuidance` コンポーネントの表示条件（`terminal_handoff` 状態）
- `data-testid="skill-lifecycle-disclosure-summary"` の役割と取得方法
- `integrated_api` / `terminal_handoff` 分岐のロジック（`SkillLifecyclePanel.tsx` 参照）
- screenshot 取得手順と capture ID の対応表
- evidence 保存先のディレクトリ構造
- TypeScript 型定義、API シグネチャ、使用例、エラーハンドリング、エッジケース、設定可能パラメータ / 定数一覧

**最低限含めるべき要素**:

```typescript
interface ScreenshotEvidenceEntry {
  captureId:
    | "SCREENSHOT-TASK07-HANDOFF-01"
    | "SCREENSHOT-TASK07-DISCLOSURE-01"
    | "SCREENSHOT-TASK07-INTEGRATED-01";
  fileName: string;
  state: "terminal_handoff" | "disclosure_summary" | "integrated_api";
  capturedAt: string;
  method: "manual";
}

declare function recordScreenshotEvidence(
  entries: ScreenshotEvidenceEntry[],
): void;
```

**使用例**:

```typescript
const evidence: ScreenshotEvidenceEntry[] = [
  {
    captureId: "SCREENSHOT-TASK07-HANDOFF-01",
    fileName: "terminal_handoff-handoff-guidance.png",
    state: "terminal_handoff",
    capturedAt: "2026-04-06T09:00:00+09:00",
    method: "manual",
  },
];

recordScreenshotEvidence(evidence);
```

---

## Task 2: システム仕様書更新（Step 1-A〜1-G + 条件付き Step 2）

> 重要: 詳細手順は `references/spec-update-workflow.md` を参照する。  
> `.claude` 正本を先に更新し、`.agents` mirror がある場合は差分を同一ターンで確認する。

### Step 1-A: タスク完了記録【必須】

- `docs/30-workflows/unassigned-task/task-ut-sdk-07-phase11-screenshot-evidence-001.md` の status を `未実施` → `spec_created` に更新する
- `task-workflow-completed.md` に以下を追記する（ステータスは `spec_created`）

```markdown
| UT-SDK-07-PHASE11-SCREENSHOT-EVIDENCE-001 | visible handoff / disclosure / execution host の Phase 11 screenshot 取得 | spec_created | 2026-04-06 |
```

- `aiworkflow-requirements/LOGS.md` を更新する
- `task-specification-creator/LOGS.md` を更新する
- `aiworkflow-requirements/SKILL.md` の変更履歴を更新する
- `task-specification-creator/SKILL.md` の変更履歴を更新する
- `.claude/skills/...` と `.agents/skills/...` の mirror parity を確認し、差分がある場合は同一ターンで是正する

### Step 1-B: 実装状況テーブル更新【spec_created】

- 本タスクは docs-only / screenshot evidence 型であり、コード実装ではなく `spec_created` の状態として更新する
- `system-spec-update-summary.md` に `Step 1-B: 実装状況テーブルを spec_created で記録` を明記する

### Step 1-C: 関連タスクテーブル更新【必須】

- `task-workflow-backlog.md` の `UT-SDK-07-PHASE11-SCREENSHOT-EVIDENCE-001` を除去し、`task-workflow-completed.md` の `spec_created` 記録と二重計上しないようにする
- TASK-SDK-07 仕様書内の関連タスクテーブルで、本タスクのステータスを `spec_created` に更新する
- 必要なら `task-workflow.md` の残課題 / 完了導線を横断確認する

### Step 1-D: topic-map.md 再生成【条件付き】

- 参照ドキュメントの見出しや行番号に変化がある場合のみ `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行する
- 再生成後、更新対象の行番号が正しく反映されていることを確認する

### Step 1-E: 未タスク指示書作成・登録【条件付き】

- 未タスク候補が 1 件以上ある場合のみ `docs/30-workflows/unassigned-task/` に正式な指示書を作成する
- 0 件の場合でも `unassigned-task-detection.md` へ検出結果サマリーを記録する
- `audit-unassigned-tasks.js` と `verify-unassigned-links.js` の current / baseline を分けて記録する

### Step 1-F: DevOps関連ファイル更新【N/A】

- 本タスクは CI/CD 最適化ではないため、`deployment-gha.md` / `technology-devops.md` / `quality-requirements.md` の更新対象ではない
- `system-spec-update-summary.md` に `Step 1-F: 該当なし（理由: docs-only screenshot evidence タスク）` を明記する

### Step 1-G: 検証コマンド順次実行【必須】

- `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` を実行する
- `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` と `node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/ut-sdk-07-phase11-screenshot-evidence-001 --regenerate` を実行する
- `node .claude/skills/skill-creator/scripts/quick_validate.js` で `task-specification-creator` と `aiworkflow-requirements` が Error 0 件であることを確認する
- `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/ut-sdk-07-phase11-screenshot-evidence-001` と `--phase 12` を実行する
- `diff -qr docs/30-workflows/ut-sdk-07-phase11-screenshot-evidence-001/artifacts.json docs/30-workflows/ut-sdk-07-phase11-screenshot-evidence-001/outputs/artifacts.json` を実行する
- `rg -n "仕様策定のみ|実行予定|保留として記録" docs/30-workflows/ut-sdk-07-phase11-screenshot-evidence-001/outputs/phase-12/ || true` で将来予定文言の残存を確認する

### Step 2: システム仕様更新の判定【N/A】

| 判定 | 理由                                                                   |
| ---- | ---------------------------------------------------------------------- |
| N/A  | 新規インターフェース追加なし（docs-only / screenshot evidence タスク） |

---

## Task 3: ドキュメント更新履歴作成

`outputs/phase-12/documentation-changelog.md` には、以下を current / baseline を分けて記録する。

- 変更したファイル一覧
- validator 実行結果
- `artifacts.json` と `outputs/artifacts.json` の parity
- Step 1-A〜1-G の実施結果
- Step 2 の N/A 判定理由
- `phase11-capture-metadata.json` を含む Phase 11 evidence の記録

### 記録テンプレート

```markdown
## Documentation Changelog - UT-SDK-07-PHASE11-SCREENSHOT-EVIDENCE-001

### Step 1-A: タスク完了記録

- 対象: `docs/30-workflows/unassigned-task/task-ut-sdk-07-phase11-screenshot-evidence-001.md`
- 変更: status 更新（未実施 → spec_created）
- 対象: `task-workflow-completed.md`
- 変更: spec_created 記録追記
- 対象: `.claude/skills/aiworkflow-requirements/LOGS.md`, `.claude/skills/task-specification-creator/LOGS.md`
- 変更: spec_created 記録追記

### Step 1-B: 実装状況テーブル更新

- 判定: spec_created

### Step 1-C: 関連タスクテーブル更新

- 対象: `task-workflow-backlog.md`
- 変更: 本タスクを spec_created 記録へ同期

### Step 1-D: topic-map.md 再生成

- 判定: 条件付き

### Step 1-E: 未タスク指示書作成・登録

- 判定: 0 件でも summary 記録必須

### Step 1-F: DevOps関連ファイル更新

- 判定: N/A

### Step 1-G: 検証コマンド順次実行

- 判定: validate / quick_validate / diff / 将来予定文言確認を記録

### Step 2: システム仕様更新

- 判定: N/A

### Phase 11 evidence

- 取得: 3 枚の screenshot
- 追加: `phase11-capture-metadata.json`
```

---

## Task 4: 未タスク検出レポート作成（0件でも出力必須）

`outputs/phase-12/unassigned-task-detection.md` を作成する。

**確認ソース**:

| ソース                                                    | 確認内容                                    | 結果   |
| --------------------------------------------------------- | ------------------------------------------- | ------ |
| 元タスク仕様書のスコープ外                                | Approval request surface → 別タスクで追跡中 | 既知   |
| Phase 3 / 10 のレビュー結果                               | MINOR 判定があれば未タスク化                | 確認要 |
| Phase 11 手動テスト                                       | スコープ外の UI 問題・改善提案              | 確認要 |
| `task-workflow-backlog.md` / `task-workflow-completed.md` | backlog と completed の重複・抜け           | 確認要 |
| コードコメント                                            | TODO / FIXME / HACK / XXX                   | 確認要 |

**出力要件**:

- 0件でも summary を残す
- 1件以上なら `docs/30-workflows/unassigned-task/` に指示書を作成する
- `task-workflow-backlog.md` の残課題更新と、関連仕様書リンクの更新を同一ターンで行う
- `audit-unassigned-tasks.js` と `verify-unassigned-links.js` の結果を current / baseline で分けて記録する

**0件の場合の最小テンプレート**:

```markdown
## 検出結果サマリー

| ソース       | 検出数  |
| ------------ | ------- |
| Phase 3 / 10 | 0件     |
| Phase 11     | 0件     |
| TODO / FIXME | 0件     |
| **合計**     | **0件** |

## 検出タスク一覧

**検出タスクなし**
```

---

## Task 5: スキルフィードバックレポート作成（改善点なしでも出力必須）

`outputs/phase-12/skill-feedback-report.md` を作成する。

**記録観点**:

| 観点             | 記録内容                                                                             |
| ---------------- | ------------------------------------------------------------------------------------ |
| テンプレート改善 | docs-only / screenshot evidence 型タスクのテンプレート適合性                         |
| ワークフロー改善 | Phase 4〜8 N/A 処理の効率化余地                                                      |
| ドキュメント改善 | `manual-test-result.md` / `phase11-capture-metadata.json` 追記フォーマットの再利用性 |
| スキル改善提案   | `task-specification-creator` / `aiworkflow-requirements` へ反映すべき改善点          |

改善点がない場合でも、`改善点なし` とその理由を明記する。

---

## Task 6: phase12-task-spec-compliance-check【必須】

`outputs/phase-12/phase12-task-spec-compliance-check.md` を root evidence として作成し、Task 1〜5 と Step 1-A〜1-G / Step 2 の整合を 1 ファイルで集約する。

**確認観点**:

- 6 つの Phase 12 成果物が存在する
- `validate-phase12-implementation-guide.js` が PASS している
- `validate-phase-output.js docs/30-workflows/ut-sdk-07-phase11-screenshot-evidence-001 --phase 12` が PASS している
- `quick_validate.js` で `task-specification-creator` と `aiworkflow-requirements` が Error 0件である
- `.claude/skills/...` と `.agents/skills/...` の parity が確認できている
- `artifacts.json` と `outputs/artifacts.json` が一致している
- `phase-12-documentation.md` の Task 1〜6 と成果物一覧が一致している
- `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` に将来予定文言が残っていない

**記録要件**:

- Task 12-1〜12-5 の完了確認
- validator 実行結果
- artifact parity
- mirror parity
- 未タスク検出の結果
- スキルフィードバック要約

---

## 参照資料

| 参照資料                        | パス                                                                                                                                          | 内容                       |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| spec-update-workflow.md         | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                                                                | Step 1-A〜2 の手順         |
| phase-12-documentation-guide.md | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`                                                        | Phase 12 詳細ガイド        |
| phase11-capture-metadata.json   | `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/screenshots/phase11-capture-metadata.json` | Phase 11 evidence metadata |
| Phase 11 成果物                 | `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/`                                          | screenshot evidence        |

---

## 成果物

| 成果物                                | パス                | 内容                  |
| ------------------------------------- | ------------------- | --------------------- |
| implementation-guide.md               | `outputs/phase-12/` | Part 1/2 実装ガイド   |
| system-spec-update-summary.md         | `outputs/phase-12/` | Step 1-A〜G / Step 2  |
| documentation-changelog.md            | `outputs/phase-12/` | 全 Step 更新記録      |
| unassigned-task-detection.md          | `outputs/phase-12/` | 未タスク検出（0件可） |
| skill-feedback-report.md              | `outputs/phase-12/` | フィードバック記録    |
| phase12-task-spec-compliance-check.md | `outputs/phase-12/` | compliance チェック   |

---

## 完了条件

- [ ] implementation-guide.md（Part 1/2）が作成されている
- [ ] Part 1 に `たとえば` を含む日常の例え話がある
- [ ] Part 2 に TypeScript 型定義 / API シグネチャ / 使用例 / エラーハンドリング / エッジケース / 設定可能パラメータがある
- [ ] system-spec-update-summary.md（Step 1-A〜G / Step 2 N/A 判定）が作成されている
- [ ] documentation-changelog.md が作成されている
- [ ] unassigned-task-detection.md が作成されている（0件でも必須）
- [ ] skill-feedback-report.md が作成されている（改善点なしでも必須）
- [ ] phase12-task-spec-compliance-check.md が作成されている
- [ ] LOGS.md が 2 ファイル更新されている（aiworkflow-requirements / task-specification-creator）
- [ ] `spec_created` 記録として task-workflow-completed.md と関連タスクテーブルが同期されている
- [ ] `.claude/skills/...` と `.agents/skills/...` の mirror parity を確認した
- [ ] `artifacts.json` と `outputs/artifacts.json` の parity を確認した
- [ ] 元の unassigned-task ファイルの status が `spec_created` に更新されている

## タスク100%実行確認【必須】

全完了条件を確認し、Phase 12 が完了したことを記録すること。

## 次Phase

Phase 13: PR作成（ユーザー承認後のみ）
