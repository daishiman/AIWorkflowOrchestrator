# Phase 12: ドキュメント更新

## メタ情報

| 項目         | 内容                                 |
| ------------ | ------------------------------------ |
| Phase        | 12                                   |
| タスクID     | UT-CANCEL-004-01                     |
| タスク名     | createSkill AbortSignal サポート追加 |
| タスク種別   | NON_VISUAL                           |
| ステータス   | 完了                                 |
| 作成日       | 2026-04-22                           |
| GitHub Issue | #2350（OPEN）                        |

---

## 目的

`createSkill` への `signal?: AbortSignal` 追加の結果を、
`task-specification-creator` と `aiworkflow-requirements` の
正本運用フローに沿ってドキュメントへ同期する。
本 Phase の正本は `outputs/phase-12/` 配下の成果物群であり、
planned wording を残さず、更新有無と判断根拠を明記する。

---

## 必須タスク一覧

### Task 1: 実装ガイド作成

**成果物**: `outputs/phase-12/implementation-guide.md`

---

#### Part 1（中学生レベル）必須要件

日常生活での例え話を使って「createSkill のキャンセル対応」を説明する。

---

**例え話: 注文キャンセルできるデリバリーアプリ**

たとえば、フードデリバリーアプリで食べ物を注文するとします。
注文ボタンを押したあと、「やっぱりやめたい！」と思ったとき、
アプリの「注文キャンセル」ボタンを押しますよね。

でも、キャンセルボタンを押したのに、お店がすでに調理を始めていたら、
キャンセルが届かないことがあります。

今回の変更は、この「キャンセルボタン」の信号を、
注文を処理している部屋（`createSkill` 関数）まで届けられるようにしたものです。

これまでは「キャンセルボタンが押されたよ」という信号が、
注文を処理する部屋の手前で止まっていました。
今回の変更で、「キャンセルの信号（`AbortSignal`）」を
`createSkill` という注文処理の部屋の中まで届けられるようになりました。

これにより、スキル生成を途中でキャンセルしたとき、
`createSkill` の中でもキャンセルを検知して、
無駄な処理をしなくて済むようになります。

---

#### Part 2（技術者レベル）必須要件

##### 変更概要

| 変更箇所                           | 変更内容                                                                                     |
| ---------------------------------- | -------------------------------------------------------------------------------------------- |
| `agentSlice.ts` L369付近（型定義） | `createSkill` に `signal?: AbortSignal` を第4引数として追加                                  |
| `agentSlice.ts` L1200付近（実装）  | 実装にも同様に `signal?: AbortSignal` を第4引数として追加し、`signal.aborted` チェックを実装 |
| `SkillCreateWizard.tsx` L467付近   | `startGeneration()` の戻り値を `signal` として受け取り、`createSkill` に渡す                 |

##### `createSkill` 変更後シグネチャ

```typescript
// apps/desktop/src/renderer/store/slices/agentSlice.ts

// 型定義（変更後）
createSkill: (
  description: string,
  options: {
    generateTasks: boolean;
    addAgents: boolean;
    addReferences: boolean;
  },
  context?: SkillCreationContext,
  signal?: AbortSignal,            // 追加
) => Promise<string>;

// 実装（変更後・概略）
createSkill: async (
  description,
  options,
  context?,
  signal?,                         // 追加
) => {
  if (signal?.aborted) return "";  // キャンセル済みなら即リターン
  // ... 既存処理 ...
},
```

##### `SkillCreateWizard.tsx` 変更後（概略）

```typescript
// Before
startGeneration(); // 戻り値を捨てていた
// ...
const path = await createSkill(desc, options, context);

// After
const signal = startGeneration(); // 戻り値（AbortSignal）を受け取る
// ...
const path = await createSkill(desc, options, context, signal); // 第4引数に追加
```

##### signal 伝播の設計方針

`AbortSignal` は IPC（プロセス間通信）でシリアライズできないため、
Renderer Process 側（`agentSlice.ts`）で `signal.aborted` を確認する設計とした。
Main Process 側のキャンセルは既存の `skillCreatorAPI.cancelGeneration()` IPC 経由で引き続き対応する。

##### エラーハンドリング

| 状況                       | 処理                                           |
| -------------------------- | ---------------------------------------------- |
| `signal.aborted === true`  | IPC 呼び出し前に早期リターン（`return ""`）    |
| `signal` が `undefined`    | 従来どおりの動作（後方互換）                   |
| IPC 呼び出し後にキャンセル | `cancelGeneration()` の既存 IPC 経由で対応済み |

---

#### 視覚証跡

UI/UX 変更なしのため Phase 11 スクリーンショット不要。
代替証跡: `outputs/phase-10/final-review-result.md` と
`outputs/phase-11/manual-test-result.md`

---

### Task 2: システムドキュメント更新サマリー作成

**成果物**: `outputs/phase-12/system-spec-update-summary.md`

Step 1（全 task で必須）:

- Step 1-A: workflow 完了記録の対象と記録先を列挙する
- Step 1-B: 実装状況を `completed` または `spec_created` のどちらで記録するか判断する
- Step 1-C: 関連タスク・未タスク候補・依存関係の更新有無を整理する
- Step 1-D: `topic-map.md` / `keywords.json` の再生成要否を判断する
- Step 1-E: `.claude` / `.agents` の mirror 影響範囲を整理する
- Step 1-F: `LOGS.md` 更新有無を整理する
- Step 1-G: 検証コマンドの実行結果を要約する

Step 2（条件付き）:

- `createSkill` への `signal` 引数追加が Renderer Store の公開 API 変更に該当する場合、
  `aiworkflow-requirements` 正本へ同期する
- Step 2 を行わない場合も、不要と判断した根拠を残す

---

### Task 3: ドキュメント更新履歴作成

**成果物**: `outputs/phase-12/documentation-changelog.md`

必須記録:

- 更新日時
- 更新ファイル一覧（`agentSlice.ts`、`SkillCreateWizard.tsx`）
- Step 1 / Step 2 の実施有無
- validator / verify / link check の結果
- Phase 10 MINOR 指摘があれば追跡結果

---

### Task 4: 未タスク検出レポート作成

**成果物**: `outputs/phase-12/unassigned-task-detection.md`

- 0 件でも必須
- 以下の観点で未タスクを確認する
  - `agentSlice.ts` の他のアクション（`analyzeSkill`・`autoImproveSkill` 等）にも
    同様の `signal` 追加が必要かどうか
  - Main Process 側への signal 完全伝播（IPC シリアライズ対応）が将来必要かどうか
  - `createSkill` のキャンセル後のクリーンアップ処理が十分かどうか
  - テストカバレッジが不足している箇所

---

### Task 5: スキルフィードバックレポート作成

**成果物**: `outputs/phase-12/skill-feedback-report.md`

- 改善点なしでも必須
- 以下を記録する
  - 有効だった運用（どのスキル・フローが役立ったか）
  - 詰まった点（実装中に詰まった箇所・仕様の不明点）
  - 今後テンプレートへ取り込みたい改善（Phase 仕様書の改善案）

---

### Task 6: Phase 12 task-spec compliance check

**成果物**: `outputs/phase-12/phase12-task-spec-compliance-check.md`

- mandatory 6 tasks（Task 1〜6）が揃っているか確認する
- `implementation-guide.md` の Part 1 / Part 2 / 視覚証跡を確認する
- `system-spec-update-summary.md` の Step 1 / Step 2 を確認する
- `artifacts.json` / `outputs/artifacts.json` / phase 本文の整合を確認する
- planned wording の残存有無を確認する

---

## 参照資料

| 参照資料               | パス                                                                             | 内容                                      |
| ---------------------- | -------------------------------------------------------------------------------- | ----------------------------------------- |
| Phase 12 テンプレート  | `.claude/skills/task-specification-creator/references/phase-template-phase12.md` | docs-only / SF-02 / SF-03 の補足          |
| システム仕様更新フロー | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`   | Step 1 / Step 2 / validation の正本フロー |

---

## 成果物一覧

| ファイル                                                 | 説明                                     | ステータス |
| -------------------------------------------------------- | ---------------------------------------- | ---------- |
| `outputs/phase-12/implementation-guide.md`               | 実装ガイド（Part 1 + Part 2 + 視覚証跡） | 作成済み   |
| `outputs/phase-12/system-spec-update-summary.md`         | Step 1 / Step 2 の判断結果               | 作成済み   |
| `outputs/phase-12/documentation-changelog.md`            | 更新履歴・validator 結果                 | 作成済み   |
| `outputs/phase-12/unassigned-task-detection.md`          | 未タスク検出レポート                     | 作成済み   |
| `outputs/phase-12/skill-feedback-report.md`              | スキルフィードバック                     | 作成済み   |
| `outputs/phase-12/phase12-task-spec-compliance-check.md` | コンプライアンスチェック                 | 作成済み   |

---

## 完了条件

- [x] `implementation-guide.md` が Part 1（例え話含む）/ Part 2 / 視覚証跡を含んでいる
- [x] `system-spec-update-summary.md` に Step 1 / Step 2 の判断結果が記録されている
- [x] `documentation-changelog.md` に validator / verify 結果が記録されている
- [x] `unassigned-task-detection.md` が 0 件でも出力されている
- [x] `skill-feedback-report.md` が改善点なしでも出力されている
- [x] `phase12-task-spec-compliance-check.md` が mandatory 6 tasks を検証している
- [x] planned wording が残っていない

---

## タスク 100% 実行確認【必須】

- [x] Task 1〜6 の成果物が全て存在する
- [x] 全成果物が空でない
- [x] `.claude` / `.agents` / `outputs/phase-12` の整合判断が記録されている
- [x] `docs/30-workflows/unassigned-task/` への配置要否が記録されている

---

## 次 Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/UT-CANCEL-004-01/phase-13-pr.md`
