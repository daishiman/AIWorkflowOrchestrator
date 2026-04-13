# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                                           |
| ---------- | -------------------------------------------------------------- |
| Phase      | 12                                                             |
| タスクID   | TASK-SW-FIX-FEEDBACK-001                                       |
| 機能名     | スキル一覧リアルタイム反映・skillPath nullガード・成功表示修正 |
| 前提Phase  | Phase 11（手動テスト完了）                                     |
| 後続Phase  | Phase 13                                                       |
| 作成日     | 2026-04-12                                                     |
| ステータス | pending                                                        |

## 目的

6つの必須タスクを完了し、タスクのドキュメント更新を完結させる。

## Task 12-1: 実装ガイド作成（2パート構成）【必須】

### Part 1（初学者・中学生レベル）

**日常生活での例え話**:

> スキルウィザードは料理レシピ作成アシスタントのようなものです。
> 料理が完成したとき（スキル生成完了）、レシピ帳（スキル一覧）は自動で更新されるべきです。
> たとえば、料理ができあがったあとに写真つきの記録帳へ自動で残すと、あとから「本当に作れたか」をすぐ確かめられます。
> 以前は「LLMシェフ」モードで料理を作ると、レシピ帳への記録を忘れていました。
> また、料理が失敗したときでも「料理が完成しました！」と表示してしまっていました。
> 今回の修正で、失敗したときは「失敗しました」とお知らせし、
> 成功したときだけ「完成しました！」と表示されるようになります。

**なぜ必要か**:

LLMモードでスキルを生成したとき、スキル一覧が自動更新されないとユーザーは
「本当に作られたの？」と不安になります。また、エラーが起きても成功表示が出てしまうと、
ユーザーは問題に気づけず混乱します。この修正でフィードバックを正しく伝えます。

**何をするか**:

1. `SkillCreateWizard.tsx`のLLMモード成功パスに`fetchSkills()`を追加して一覧を自動更新する
2. `CompleteStep.tsx`に`skillPath = null`のガードを追加してエラーを正しく表示する
3. 成功ヘッダーを`skillPath !== null`の場合のみ表示するよう変更する

### Part 2（開発者・技術者レベル）

#### Type Definitions

```typescript
export interface CompleteStepProps {
  skillPath?: string | null;
  hasExternalIntegration?: boolean;
  externalToolName?: string | null;
  onExecuteNow?: () => void;
  onOpenInEditor?: () => void;
  onCreateAnother?: () => void;
  onQualityFeedback?: (satisfied: boolean) => void;
  onRetry?: () => void;
  onClose?: () => void;
}
```

#### API Signature & Usage

```tsx
<CompleteStep
  skillPath={skillPath}
  hasExternalIntegration={hasExternalIntegration}
  externalToolName={externalToolName}
  onQualityFeedback={handleQualityFeedback}
  onRetry={handleRetry}
  onClose={handleClose}
/>
```

`skillPath` の null 判定は表示制御だけに使い、新規の props / interface は追加しない。`onRetry` は既存 API を再利用し、Step 2 の契約変更は行わない。

#### Error Handling & Edge Cases

| ケース                               | 期待動作                                                 |
| ------------------------------------ | -------------------------------------------------------- |
| LLMモード成功・`fetchSkills()`が成功 | 一覧更新後にStep 3へ遷移                                 |
| LLMモード成功・`fetchSkills()`が失敗 | ログ出力のみ・Step 3への遷移は継続（生成自体は成功済み） |
| `skillPath = null`のままStep 3到達   | エラーメッセージ＋リトライボタン表示、成功ヘッダー非表示 |
| `skillPath`が正常値でStep 3到達      | 成功ヘッダー表示、エラーUI非表示（従来通り）             |

#### Configurable Parameters / Constants

| 項目                 | 内容                                                |
| -------------------- | --------------------------------------------------- |
| `HEADER_MESSAGE`     | 成功ヘッダー文言                                    |
| `HEADER_SUB_MESSAGE` | 補足説明文言                                        |
| `skillPath`          | 生成結果の存在判定に使う値。`null` ならエラー扱い。 |
| `onRetry`            | 失敗時に Step 2 へ戻る既存 callback。               |
| `fetchSkills()`      | 生成完了後に一覧を再取得する処理。                  |

成果物: `outputs/phase-12/implementation-guide.md`

## Task 12-2: システム仕様書更新（2ステップ）【必須】

### Step 1-A: タスク完了記録

- `task-workflow.md`に完了タスク記録を追加
- `task-workflow-completed.md` / `task-workflow-backlog.md` の current facts を同期
- `.claude/skills/aiworkflow-requirements/SKILL.md` と `.claude/skills/task-specification-creator/SKILL.md` の変更履歴を更新
- `SKILL.md`変更履歴 2ファイル更新:
  - `.claude/skills/aiworkflow-requirements/SKILL.md`
  - `.claude/skills/task-specification-creator/SKILL.md`
- LOGS.md 2ファイル更新:
  - `.claude/skills/aiworkflow-requirements/LOGS.md`
  - `.claude/skills/task-specification-creator/LOGS.md`
- `topic-map.md`更新（`fetchSkills()` 成功後の一覧再取得と null ガードの current facts 追加時）

### Step 1-B: 実装状況テーブル更新

implementationタスクのため: `completed`として記録

### Step 1-C: 関連タスクテーブル更新

- Wave Bの並列タスク（`TASK-SW-FIX-MODE-MGMT-001`）の関連タスクテーブルを更新
- `TASK-SW-FIX-FEEDBACK-001`のステータスをcurrent factsへ

### Step 2: システム仕様更新（条件付き）

`CompleteStepProps` / `SkillCreateWizard` の public contract に変更はなく、`skillPath === null` の表示分岐は既存 props だけで吸収する。したがって Step 2 は N/A とし、その判断根拠を `system-spec-update-summary.md` に明記する。

成果物: `outputs/phase-12/system-spec-update-summary.md`

## Task 12-3: ドキュメント更新履歴作成【必須】

全Step（1-A/1-B/1-C/Step 2）の結果を個別に明記する（「該当なし」も記録）。
`artifacts.json` / `outputs/artifacts.json`のparity と current/baseline の差分も記録する。

成果物: `outputs/phase-12/documentation-changelog.md`

## Task 12-4: 未タスク検出レポート作成【必須・0件でも出力必須】

### 検出ソース

| ソース                     | 確認項目                     |
| -------------------------- | ---------------------------- |
| Phase 3レビュー MINOR指摘  | 未タスク化対象               |
| Phase 10レビュー MINOR指摘 | 未タスク化対象               |
| Phase 11発見事項           | スコープ外発見事項           |
| コードコメント             | TODO/FIXME（変更ファイル内） |

- 1件以上の候補が出た場合は `docs/30-workflows/unassigned-task/` に指示書を作成し、
  `task-workflow.md` / 関連仕様書を同波で更新する

成果物: `outputs/phase-12/unassigned-task-detection.md`

## Task 12-5: スキルフィードバックレポート作成【必須・改善点なしでも出力必須】

| 観点             | 記録内容                                                     |
| ---------------- | ------------------------------------------------------------ |
| テンプレート改善 | Wave Bタスクの並列実行パターンでの仕様書テンプレート改善余地 |
| ワークフロー改善 | `fetchSkills()`漏れの機械検知（静的解析ルール追加の余地）    |
| ドキュメント改善 | nullガードパターンのガイドライン化候補                       |

成果物: `outputs/phase-12/skill-feedback-report.md`

## Task 12-6: phase12-task-spec-compliance-check【必須・最終確認】

Phase 12のTask 12-1〜12-5とStep 1-A〜Step 2を1ファイルへ集約したroot evidence。

- `outputs/phase-12/*.md`の成果物存在確認
- Task 12-1〜12-5の実質監査
- Step 1-A〜1-Cの実更新確認
- Step 2のcurrent fact / no-op / domain sync確認
- validator結果、root parity、artifacts同期、planned wording 0件の記録
- 未充足が1つでもある場合は`PASS`を断言しない

成果物: `outputs/phase-12/phase12-task-spec-compliance-check.md`

## Phase 12 事前チェックリスト【着手前確認】

- [ ] `outputs/artifacts.json`と各`phase-*.md`のartifact名が1対1で照合済み
- [ ] `outputs/phase-12/phase12-task-spec-compliance-check.md`を含む6成果物の出力先が揃っている
- [ ] Phase 1で記録したタスク分類（implementation）が現状と一致している
- [ ] LOGS.md 2ファイル更新対象が特定されている

## 参照資料

| 資料名                       | パス                                                                                   | 用途         |
| ---------------------------- | -------------------------------------------------------------------------------------- | ------------ |
| Phase 11 手動テスト結果      | `outputs/phase-11/manual-test-result.md`                                               | 証跡確認     |
| spec-update-workflow         | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`         | Step手順確認 |
| phase-12-documentation-guide | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md` | Task詳細手順 |

## 成果物

| 成果物                       | パス                                                     | 説明                             |
| ---------------------------- | -------------------------------------------------------- | -------------------------------- |
| 実装ガイド（Part 1/2）       | `outputs/phase-12/implementation-guide.md`               | 初学者向け + 技術者向けの2パート |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A〜1-C + Step 2の更新記録 |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            | 全Step結果の記録                 |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | 0件でも出力必須                  |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | 改善点なしでも出力必須           |
| 準拠チェック                 | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 12-1〜12-6の最終確認        |

## 完了条件

- [ ] Task 12-1〜12-6が全件完了していること
- [ ] 6成果物が全件作成されていること
- [ ] LOGS.md 2ファイルが更新されていること（aiworkflow-requirements + task-specification-creator）
- [ ] `outputs/artifacts.json`が`phase13_blocked`でroot `artifacts.json`と同期されていること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 13: PR作成（ユーザーの明示的承認後のみ実施）
