# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 12                                          |
| 機能名     | UT-SDK-07-APPROVAL-REQUEST-SURFACE-001      |
| タスク名   | Skill Creator approval request surface 接続 |
| 前提Phase  | Phase 11                                    |
| 後続Phase  | Phase 13                                    |
| 作成日     | 2026-04-06                                  |
| ステータス | pending                                     |

## 目的

実装ガイド作成・システム仕様更新・未タスク検出・スキルフィードバック・準拠チェックの6タスクを完了し、Phase 13（blocked）への引き継ぎ準備を整える。

## 実行タスク一覧

- Task 12-1: 実装ガイド作成
- Task 12-2: システム仕様更新サマリー
- Task 12-3: ドキュメント更新履歴
- Task 12-4: 未タスク検出レポート
- Task 12-5: スキルフィードバックレポート
- Task 12-6: phase12-task-spec-compliance-check

---

## Task 1: 実装ガイド作成（2パート構成）

### Part 1: 中学生レベルの概念説明

#### なぜ必要か

アプリが「これをやってもいいですか？」と確認を求めてくることがあります。たとえば、ファイルを書き換える前や外部サービスに送る前に、いったん止まって人に聞く場面です。これが approval request です。今の Skill Creator 画面は、その確認を受け取って見せる役目が弱いので、ユーザーに承認や拒否を安心して出せません。

#### 何をするか

- `SkillCreatorAPI` に `onApprovalRequest` を追加する
- `SkillLifecyclePanel.tsx` で受け取った内容を見せる
- 既存の `ApprovalSheet` を再利用して、承認と拒否のボタンを出す

#### 日常の例え

たとえば、友だちから「この自転車、借りてもいい？」と聞かれて、あなたが「いいよ」か「今はだめ」と返す場面に似ています。自転車を勝手に持っていかず、まず確認するので安心です。approval request も同じで、先に止まって聞く仕組みが大事です。

#### 今回作ったもの

| 日本語     | 英語               | 役割                                                                      |
| ---------- | ------------------ | ------------------------------------------------------------------------- |
| 承認要求   | approval request   | 先に確認が必要な操作                                                      |
| 承認シート | ApprovalSheet      | 承認・拒否を出す画面部品                                                  |
| 取得関数   | getSkillCreatorApi | `window.skillCreatorAPI` と `window.electronAPI?.skillCreator` を吸収する |
| 承認応答   | respondToApproval  | 承認・拒否の結果を返す                                                    |

### Part 2: 技術者向け詳細

#### current contract

- `respondToApproval` と `getDisclosureInfo` は既存
- `onApprovalRequest` は `SkillCreatorAPI` に未定義
- renderer 側は `getSkillCreatorApi()` を通して `window.skillCreatorAPI` / `window.electronAPI?.skillCreator` を読む

#### target delta

- `SkillCreatorAPI` に `onApprovalRequest` を追加する
- payload は shared 型に逃がさず、`{ operationType, description, destination?, sessionId, operationId }` を local alias として扱う
- `SkillLifecyclePanel.tsx` では `ApprovalSheet` を再利用し、既存 disclosure state を流用する

#### 型定義

```typescript
onApprovalRequest: (
  callback: (payload: {
    operationType: string;
    description: string;
    destination?: string;
    sessionId: string;
    operationId: string;
  }) => void,
) => () => void;
```

#### 使用例

```typescript
const skillCreatorApi = getSkillCreatorApi();
const unsubscribe = skillCreatorApi?.onApprovalRequest((payload) => {
  setPendingApproval(payload);
});

return unsubscribe;
```

```typescript
{pendingApproval && (
  <ApprovalSheet
    operationType={normalizeApprovalOperationType(pendingApproval.operationType)}
    description={pendingApproval.description}
    destination={pendingApproval.destination}
    aiServiceName={disclosureInfo?.aiServiceName ?? "AI"}
    externalDestinations={disclosureInfo?.externalDestinations ?? []}
    onApprove={handleApprove}
    onReject={handleReject}
    isResponding={isApprovalResponding}
  />
)}
```

※ 実装では `disclosureInfo` と `isApprovalResponding` を state で保持し、応答中はボタンを無効化する。

#### エラーハンドリング

- `ALLOWED_ON_CHANNELS` 外のチャンネルへの `safeOn` 呼び出しは `console.error` に落ちる
- `skillCreatorApi` が取得できない場合は購読を開始しない
- `respondToApproval` が失敗した場合は `pendingApproval` を維持し、UI を閉じずに再試行可能にする
- 応答中は `ApprovalSheet` のボタンを無効化し、二重送信を防ぐ

#### エッジケース

- 同じ approval request を重複受信した場合は上書きで扱う
- `disclosureInfo` 未取得時は `ApprovalSheet` の disclosure 部分を空のデフォルトで表示する
- `operationType` は renderer 側で normalise して `ApprovalSheet` の union に合わせる

#### 設定項目と定数一覧

| 項目                                                               | 値 / 役割                |
| ------------------------------------------------------------------ | ------------------------ |
| `IPC_CHANNELS.APPROVAL_REQUEST`                                    | 承認要求の購読チャンネル |
| `action`                                                           | `'approve'` / `'reject'` |
| `data-testid="approval-sheet"`                                     | approval UI の検証点     |
| `data-testid="approval-approve"` / `data-testid="approval-reject"` | ボタン操作の検証点       |

#### テスト構成

- Unit: `skill-creator-api.ts` の `safeOn` / unsubscribe
- Unit: `SkillLifecyclePanel.tsx` の `ApprovalSheet` 再利用と cleanup
- Integration: IPC push → callback → respondToApproval の end-to-end 連携

---

## Task 2: システム仕様更新（Step 1-A〜1-G + 条件付きStep 2）

### Step 1-A: タスク完了記録

完了タスク: `UT-SDK-07-APPROVAL-REQUEST-SURFACE-001`

更新対象ファイル:

- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/LOGS.md`
- `.claude/skills/task-specification-creator/LOGS.md`
- `.claude/skills/aiworkflow-requirements/SKILL.md`
- `.claude/skills/task-specification-creator/SKILL.md`
- `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`
- `docs/30-workflows/ut-sdk-07-approval-request-surface-001/index.md`
- `docs/30-workflows/ut-sdk-07-approval-request-surface-001/artifacts.json`
- `docs/30-workflows/ut-sdk-07-approval-request-surface-001/outputs/artifacts.json`

### Step 1-B: 実装状況テーブル更新

`UT-SDK-07-APPROVAL-REQUEST-SURFACE-001` を `completed` に更新する。実装未着手の future 分岐はこの workflow では採用しない。

### Step 1-C: 関連タスクテーブル更新

`TASK-SDK-07` 関連タスクテーブルの `UT-SDK-07-APPROVAL-REQUEST-SURFACE-001` ステータスを current facts へ更新する。`関連タスク` / `未タスク候補` / `残課題` のいずれにも残さない。

### Step 1-D: index 再生成

`index.md` と `topic-map.md` の phase / artifact 名 parity を維持するため、`generate-index.js` を実行し、Phase 11/12/13 の status が `artifacts.json` と一致していることを確認する。

### Step 1-E: 未タスク登録

Phase 3/10 の MINOR、Phase 11 の発見事項、Phase 12 の苦戦箇所を照合し、未タスクが 1 件以上なら `docs/30-workflows/unassigned-task/` に formalize する。0件でも `unassigned-task-detection.md` を残す。

### Step 1-F: 補助更新

必要に応じて `lessons-learned.md`、`task-workflow.md`、`task-workflow-backlog.md`、`task-workflow-completed.md`、`phase-12-documentation.md` の narrative を current facts へ同期する。

### Step 1-G: 検証

- `node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator`
- `node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator`
- `node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements`
- `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/ut-sdk-07-approval-request-surface-001`
- `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js docs/30-workflows/ut-sdk-07-approval-request-surface-001`
- `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js docs/30-workflows/ut-sdk-07-approval-request-surface-001`
- `diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements`
- `diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator`

### Step 2: システム仕様更新（条件付き）

新規インターフェース追加（`onApprovalRequest`）があるため Step 2 実施が必要。更新対象は `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md` と `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md` を基本とし、`task-workflow.md` / `lessons-learned.md` / `LOGS.md` も同 wave で同期する。

---

## Task 3: ドキュメント更新履歴作成

```bash
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/ut-sdk-07-approval-request-surface-001 \
  --output outputs/phase-12/documentation-changelog.md
```

更新履歴には以下を含める。

- 変更 file 一覧
- validator 実行結果
- current / baseline の区別
- artifacts / outputs artifacts の同期結果
- Step 1-A〜1-G / Step 2 の実施結果
- `updated` / `planned` / `future wording` を残さない確認結果

---

## Task 4: 未タスク検出レポート（0件でも必須）

```bash
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
  --scan apps/desktop/src/preload/skill-creator-api.ts \
  --scan apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx \
  --output outputs/phase-12/unassigned-task-detection.md
```

確認ソース:

- Phase 3/10 MINOR 指摘
- Phase 11 manual-test-checklist.md / manual-test-result.md / manual-test-report.md
- Phase 11 discovered-issues.md / ui-sanity-visual-review.md
- コードコメント内 TODO/FIXME/HACK/XXX

未タスクが 1 件以上の場合は `docs/30-workflows/unassigned-task/` に正式化し、`task-workflow.md` へ登録する。0件でも current/baseline を分けた summary を残す。

---

## Task 5: スキルフィードバックレポート（改善点なしでも必須）

| 観点             | 記録内容                                                                       |
| ---------------- | ------------------------------------------------------------------------------ |
| テンプレート改善 | Part 1 の `たとえば`、Part 2 の型/API/使用例/エラー/エッジケースの明記が十分か |
| ワークフロー改善 | approval/disclosure 対称性チェックと current / baseline 分離の自動化余地       |
| 技術的教訓       | `ApprovalSheet` 再利用、`getSkillCreatorApi()` での surface 吸収               |
| 新規Pitfall候補  | 実在しない surface 名を残さない                                                |

改善点がない場合でも「なし」と理由を記録する。

---

## Task 6: phase12-task-spec-compliance-check

- Task 1〜5 の全完了を確認してから作成する
- `phase-12-documentation.md` / `outputs/phase-12/*` / `artifacts.json` / `outputs/artifacts.json` の整合を確認する
- current / baseline、実体 / 台帳、Phase 11 / 12 / 13 の status を 1 ファイルへ集約する
- `validate-phase12-implementation-guide.js`、`validate-phase-output.js`、`verify-unassigned-links.js` の実測値を root evidence として残す
- Phase 13 は user approval 未取得なら blocked を維持し、completed に上げない
- planned wording が `outputs/phase-12/*.md` に残っていないことを確認する

---

## 参照資料

| 参照資料                                                        | パス                                                                                    | 説明                       |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------- | -------------------------- |
| 手動テストチェックリスト                                        | `outputs/phase-11/manual-test-checklist.md`                                             | Phase 11 成果物            |
| 手動テスト結果                                                  | `outputs/phase-11/manual-test-result.md`                                                | Phase 11 成果物            |
| 手動テストレポート                                              | `outputs/phase-11/manual-test-report.md`                                                | Phase 11 成果物            |
| UI/UX視覚レビュー                                               | `outputs/phase-11/ui-sanity-visual-review.md`                                           | Phase 11 成果物            |
| capture metadata                                                | `outputs/phase-11/phase11-capture-metadata.json`                                        | Phase 11 成果物            |
| 発見事項                                                        | `outputs/phase-11/discovered-issues.md`                                                 | Phase 11 成果物            |
| 画面カバレッジ                                                  | `outputs/phase-11/screenshot-coverage.md`                                               | Phase 11 成果物            |
| spec-update-workflow                                            | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`          | Step 1/2 テンプレート      |
| phase-11-12-guide                                               | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`             | Phase 11/12 実行ガイダンス |
| phase-template-12                                               | `.claude/skills/task-specification-creator/references/phase-template-phase12.md`        | Task 12-1〜12-6 の骨格     |
| phase-template-12-d                                             | `.claude/skills/task-specification-creator/references/phase-template-phase12-detail.md` | 詳細テンプレ               |
| phase-template-13                                               | `.claude/skills/task-specification-creator/references/phase-template-phase13.md`        | blocked 判定基準           |
| トレーサビリティ行列                                            | `outputs/phase-1/traceability-matrix.md`                                                | Phase 1 成果物             |
| 依存整合マトリクス                                              | `outputs/phase-2/dependency-consistency-matrix.md`                                      | Phase 2 成果物             |
| 契約差分                                                        | `outputs/phase-5/contract-diff.md`                                                      | Phase 5 成果物             |
| リファクタリング計画 outputs/phase-8/post-refactor-test-plan.md | `outputs/phase-8/refactoring-plan.md`                                                   | Phase 8 成果物             |
| 品質保証レポート outputs/phase-9/risk-register.md               | `outputs/phase-9/quality-report.md`                                                     | Phase 9 成果物             |
| 最終レビュー結果 outputs/phase-10/corrective-action-plan.md     | `outputs/phase-10/final-review-result.md`                                               | Phase 10 成果物            |

## 実行手順

1. Phase 11 成果物を確認する。
2. `outputs/phase-12/` に空欄チェックリストを作成し、Task 1〜6 を逐次消化する。
3. Task 1（実装ガイド）→ Task 2（仕様更新）→ Task 3（changelog）→ Task 4（未タスク）→ Task 5（フィードバック）→ Task 6（compliance check）の順に実行する。
4. `outputs/artifacts.json` / `artifacts.json` / `index.md` と各 `phase-*.md` の artifact 名を突合する。
5. `phase12-task-spec-compliance-check.md` を作成して root evidence として残す。
6. `validate-phase12-implementation-guide.js`、`validate-phase-output.js`、`verify-unassigned-links.js` を実行する。

## 成果物

| 成果物                       | パス                                                     | 説明                        |
| ---------------------------- | -------------------------------------------------------- | --------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               | Part 1/2 構成の実装ガイド   |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A〜1-C / Step 2 記録 |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            | 全 Step の結果記録          |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | 0件でも出力必須             |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | 改善点なしでも出力必須      |
| Phase 12 準拠チェック        | `outputs/phase-12/phase12-task-spec-compliance-check.md` | root evidence               |

## 完了条件

- [ ] Task 1: `implementation-guide.md` が Part 1/2 を満たしている
- [ ] Task 2: Step 1-A〜1-G が全て実行・記録されている
- [ ] Task 2: Step 2 の実施/不要判定が記録されている
- [ ] Task 3: `documentation-changelog.md` が current / baseline と validator 結果を個別に記録している
- [ ] Task 4: `unassigned-task-detection.md` が出力されている（0件でも必須）
- [ ] Task 5: `skill-feedback-report.md` が出力されている（改善点なしでも必須）
- [ ] Task 6: `phase12-task-spec-compliance-check.md` が root evidence として作成されている
- [ ] LOGS.md が 2ファイル更新されている（aiworkflow-requirements + task-specification-creator）
- [ ] SKILL.md が 2ファイル更新されている（aiworkflow-requirements + task-specification-creator）
- [ ] `artifacts.json` と `outputs/artifacts.json` と `index.md` が同期している
- [ ] `validate-phase12-implementation-guide.js` が PASS
- [ ] `validate-phase-output.js` / `verify-unassigned-links.js` が PASS
- [ ] `quick_validate.js` の 3スキル検証結果が記録されている
- [ ] `diff -qr` で `.claude` / `.agents` の parity を確認した
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/ut-sdk-07-approval-request-surface-001
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js docs/30-workflows/ut-sdk-07-approval-request-surface-001
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js docs/30-workflows/ut-sdk-07-approval-request-surface-001
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator
diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements
```

## 次のPhase

Phase 13: PR作成（blocked）
