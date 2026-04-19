# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                                            |
| ---------- | --------------------------------------------------------------- |
| Phase      | 12                                                              |
| 機能名     | UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001             |
| タスク名   | SkillLifecyclePanel auth回帰テスト describe.skip クリーンアップ |
| 前提Phase  | Phase 11                                                        |
| 後続Phase  | Phase 13                                                        |
| 作成日     | 2026-04-18                                                      |
| ステータス | pending                                                         |

## 目的

Phase 12 の canonical 6成果物を、`task-specification-creator` と `aiworkflow-requirements` の両要件に沿って揃える。
本タスクは NON_VISUAL cleanup のため、実装ガイドは「skip cleanup の意義」「現行モック契約」「仕様更新対象」を中心に記録する。

## 背景

対象は `SkillLifecyclePanel.auth-regression.test.tsx` の `describe.skip` クリーンアップであり、
UI の見た目変更や auth 仕様変更はスコープ外である。
そのため Phase 12 では、汎用 auth 仕様の創作ではなく、今回の cleanup に直接必要な current facts を記録する。

## 事前チェック【必須】

- [ ] `outputs/artifacts.json` と root `artifacts.json` が同期している
- [ ] root `artifacts.json.metadata.taskType` が `NON_VISUAL` になっている
- [ ] `index.md` に `タスク種別 | NON_VISUAL` が記載されている
- [ ] Phase 11 の証跡方針が「スクリーンショット不要」で一貫している
- [ ] Phase 13 が `blocked` として扱われている

## 実行タスク

| Task | 名称                 | 必須 | 内容                                                                          |
| ---- | -------------------- | ---- | ----------------------------------------------------------------------------- |
| 12-1 | 実装ガイド作成       | ✅   | `implementation-guide.md` を Part 1 / Part 2 で作成する                       |
| 12-2 | システム仕様更新     | ✅   | `LOGS.md` x2、必要な reference、topic-map の更新対象を特定して記録する        |
| 12-3 | 更新履歴作成         | ✅   | `documentation-changelog.md` に更新ファイルと理由を記録する                   |
| 12-4 | 未タスク検出         | ✅   | `unassigned-task-detection.md` を 0件でも出力する                             |
| 12-5 | スキルフィードバック | ✅   | `skill-feedback-report.md` を 0件でも出力する                                 |
| 12-6 | 準拠チェック         | ✅   | `phase12-task-spec-compliance-check.md` に validator 結果と parity を記録する |

- Task 12-1: `implementation-guide.md` を task 固有の current facts だけで構成する
- Task 12-2: `system-spec-update-summary.md` に Step 1-A/1-B/1-C/2 を記録する
- Task 12-3: `documentation-changelog.md` に更新ファイルと理由を記録する
- Task 12-4: `unassigned-task-detection.md` を 0件でも出力する
- Task 12-5: `skill-feedback-report.md` を 0件でも出力する
- Task 12-6: `phase12-task-spec-compliance-check.md` に validator と parity 結果を記録する

## Task 12-1: 実装ガイド作成

### Part 1: 中学生向け概念説明

- `describe.skip` は「あるテストのまとまりを丸ごと休ませるスイッチ」である
- 本タスクの価値は、auth 回りの回帰検出を再び働かせることにある
- たとえると「火災報知器の電池を戻して、ちゃんと鳴る状態に戻す」作業である
- このタスクでは UI を作り替えるのではなく、休んでいた見張り役のテストを現行フローに合わせて直す

### Part 2: 技術者向け実装ガイド

#### current contract

- `SkillLifecyclePanel.auth-regression.test.tsx` は `window.electronAPI.auth.login` を spy 対象にしている
- runtime 側は `skillCreatorAPI.detectMode` / `planSkill` / `getWorkflowState` のモックを併用している
- `auth:login` は preload では 500ms timeout の fire-and-forget チャンネルとして扱われる
- main 側 handler は `{ provider }` を受け取り、成功時は `{ success: true }` を返す

#### コード断片

```typescript
const mockAuthLogin = vi.fn();

(window as Window & { electronAPI?: unknown }).electronAPI = {
  auth: {
    login: mockAuthLogin,
  },
};

expect(mockAuthLogin).not.toHaveBeenCalled();
```

#### エッジケース

| 観点             | 確認内容                                                          | 方針                 |
| ---------------- | ----------------------------------------------------------------- | -------------------- |
| skip 解消        | `describe.skip` / `it.skip` / `test.skip` が 0件                  | 必須                 |
| current API 整合 | `window.electronAPI.auth.login` と `skillCreatorAPI` のモック整合 | 必須                 |
| no-op helper     | `fillCreateRequest()` 依存テストの扱い                            | 修正または合理的削除 |
| 非視覚証跡       | スクリーンショット不要理由の明記                                  | 必須                 |

#### 視覚証跡

UI/UX変更なしのため Phase 11 スクリーンショット不要。
証跡は `outputs/phase-11/manual-test-result.md` と `outputs/phase-11/evidence-index.md` に集約する。

## Task 12-2: システム仕様更新

### Step 1-A: 完了記録とログ対象

- `.claude/skills/aiworkflow-requirements/LOGS.md`
- `.claude/skills/task-specification-creator/LOGS.md`
- `aiworkflow-requirements` 側の auth / test cleanup 関連 reference の更新要否
- `topic-map.md` と index 再生成の要否判定

### Step 1-B: 台帳同期

- `index.md`
- root `artifacts.json`
- `outputs/artifacts.json`

### Step 1-C: 関連タスク同期

- `docs/30-workflows/unassigned-task/UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001.md`
- 依存元 `UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001` との整合確認

### Step 2: aiworkflow-requirements 更新判定

| 判定項目            | 結果     | 理由                                                                       |
| ------------------- | -------- | -------------------------------------------------------------------------- |
| 新規 interface 追加 | 原則不要 | 今回は cleanup task であり API 追加が主目的ではない                        |
| current facts 更新  | 要確認   | auth regression cleanup の知見を lessons / workflow 系へ反映するか判定する |
| index 再生成        | 条件付き | reference 見出し変更が発生した場合のみ実行する                             |

## Task 12-3: 更新履歴作成

`outputs/phase-12/documentation-changelog.md` に以下を記録する。

- 更新した仕様書・台帳・ログ
- 変更理由
- validator / parity / mirror 確認結果

## Task 12-4: 未タスク検出

- `describe.skip` 残存が 0 件でも `unassigned-task-detection.md` を作成する
- 0件の場合は「新規未タスクなし」と書く
- 既存未タスクを参照する場合は配置先確認結果も記録する

## Task 12-5: スキルフィードバック

- `skill-feedback-report.md` を 0件でも作成する
- 今回は template 過適用、Phase 12/13 の status drift、artifacts parity 漏れを候補として記録する

## Task 12-6: 準拠チェック

- `phase12-task-spec-compliance-check.md` を作成する
- 記録対象:
  - `validate-phase-output.js` 結果
  - `validate-phase12-implementation-guide.js` 結果
  - `verify-unassigned-links.js` 結果
  - root / outputs artifacts parity
  - 計画だけを示す文言が 0 件であることの確認

## 参照資料

| 参照資料            | パス                                        | 説明                      |
| ------------------- | ------------------------------------------- | ------------------------- |
| Phase 11 手動テスト | `outputs/phase-11/manual-test-result.md`    | NON_VISUAL 証跡           |
| root 台帳           | `artifacts.json`                            | workflow 正本台帳         |
| outputs 台帳        | `outputs/artifacts.json`                    | parity 対象               |
| preload timeout     | `apps/desktop/src/preload/ipc-utils.ts`     | `auth:login` 500ms の根拠 |
| main auth handler   | `apps/desktop/src/main/ipc/authHandlers.ts` | fire-and-forget の根拠    |

## 実行手順

1. 事前チェックで root / outputs parity と NON_VISUAL 判定を固定する。
2. `implementation-guide.md` を task 固有の current facts だけで作成する。
3. `system-spec-update-summary.md` に Step 1-A/1-B/1-C/2 を記録する。
4. `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` / `phase12-task-spec-compliance-check.md` を揃える。
5. validator 結果を記録し、Phase 13 を `blocked` のまま維持する。

## 成果物

| 成果物                   | パス                                                     | 説明               |
| ------------------------ | -------------------------------------------------------- | ------------------ |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2    |
| システム仕様更新サマリー | `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A/1-B/1-C/2 |
| 更新履歴                 | `outputs/phase-12/documentation-changelog.md`            | 変更履歴           |
| 未タスク検出             | `outputs/phase-12/unassigned-task-detection.md`          | 0件でも必須        |
| スキルフィードバック     | `outputs/phase-12/skill-feedback-report.md`              | 0件でも必須        |
| Phase 12 準拠チェック    | `outputs/phase-12/phase12-task-spec-compliance-check.md` | validator 記録     |

## 完了条件

- [ ] canonical 6成果物を全件定義している
- [ ] `system-spec-update-summary.md` のファイル名で統一している
- [ ] root `artifacts.json` と `outputs/artifacts.json` が一致している
- [ ] `LOGS.md` x2 の更新対象を記録している
- [ ] `topic-map.md` / index 再生成の要否を判定している
- [ ] NON_VISUAL の `## 視覚証跡` 方針を実装ガイドに記録している
- [ ] `unassigned-task-detection.md` を 0件でも作成する方針になっている
- [ ] `phase12-task-spec-compliance-check.md` を成果物として定義している
- [ ] 計画だけを示す文言や PR 後追い文言がない
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001
```

## 次のPhase

Phase 13: PR作成（blocked のまま承認待ち）
