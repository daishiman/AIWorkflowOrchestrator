# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目         | 内容                                             |
| ------------ | ------------------------------------------------ |
| Phase        | 12                                               |
| タスクID     | TASK-SC-CREATOR-UPDATE-IMPL-001                  |
| タスク名     | SkillCreatorService runUpdateWorkflow 実処理実装 |
| タスク種別   | NON_VISUAL                                       |
| ステータス   | 未実施                                           |
| 作成日       | 2026-04-21                                       |
| GitHub Issue | #2318（CLOSED）                                  |

---

## 目的

`runUpdateWorkflow()` 実処理実装の結果を、
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

日常生活での例え話を使って「スキルの update モード」を説明する。

---

**例え話: 料理レシピノートの「書き直し」機能**

たとえば、あなたが料理のレシピをノートに書き留めているとします。
最初に「カレーライスのレシピ」を書いたとき（`create` モード）、
ノートに新しいページを開いて、材料・手順・ポイントを全部書きました。

しばらくして、「隠し味にチョコレートを入れる」という新しいコツを覚えました。
このとき、新しいページを作る必要はありません。
すでにあるカレーのページを開いて、「隠し味」の欄を書き直すだけです。
これが `update` モードです。

今回の実装では、`SkillCreatorService` という「ノート管理係」に
「すでにあるページを書き直す」機能（`runUpdateWorkflow()`）を追加しました。
以前はこの機能が「準備中」のままで、実際には何も書き直してくれませんでした。
今回の変更で、ちゃんと既存のページ（SKILL.md）を探して、
内容を最新の状態に更新してくれるようになりました。

また、AI アシスタント（LLM）が使える場合は、
「このスキルは何のためのものか（purpose）」という説明文も
自動的に書き直してくれます。
AI が使えない場合は、その部分だけスキップして、
それ以外の情報だけ更新します。

途中で「やっぱりやめたい」と思ったとき（AbortSignal）は、
どのステップでもすぐに作業を止めることができます。

---

#### Part 2（技術者レベル）必須要件

##### `runUpdateWorkflow()` API

```typescript
// apps/desktop/src/main/services/skill/SkillCreatorService.ts

async runUpdateWorkflow(
  skillName: string,
  options?: { signal?: AbortSignal }
): Promise<void>
```

| パラメータ       | 型            | 説明                       |
| ---------------- | ------------- | -------------------------- |
| `skillName`      | `string`      | 更新対象スキルの名前       |
| `options`        | `object`      | オプション設定             |
| `options.signal` | `AbortSignal` | 処理中断シグナル（省略可） |

##### フロー

1. 既存 SKILL.md の存在確認
2. AbortSignal チェック（各ステップで実施）
3. LLM クライアントの利用可否確認
   - 利用可能: purpose を再生成し、SKILL.md を更新する
   - 利用不可: purpose 再生成をスキップし、その他の情報で SKILL.md を更新する
4. SKILL.md への書き込み
5. 完了ログ出力

##### エラーハンドリング

| 状況                     | 処理                                              |
| ------------------------ | ------------------------------------------------- |
| AbortSignal 発火         | 即座に処理を中断し、`logger.info` でログを出力    |
| SKILL.md が存在しない    | `logger.warn` を出力し、処理を終了する            |
| LLM クライアント利用不可 | purpose 再生成をスキップし、処理を継続する        |
| LLM 呼び出しエラー       | `logger.error` を出力し、フォールバック処理を行う |

##### `case "update":` の修正内容

```typescript
// Before（スタブ実装）
case "update":
  logger.warn("[SkillCreatorService] update mode is not implemented yet");
  break;

// After（実処理実装）
case "update":
  await this.runUpdateWorkflow(skillName, { signal });
  break;
```

---

#### 視覚証跡

UI/UX 変更なしのため Phase 11 スクリーンショット不要。
代替証跡: `outputs/phase-10/final-review-result.md` と
`outputs/phase-11/manual-test-result.md`

---

### Task 2: システム仕様更新サマリー作成

**成果物**: `outputs/phase-12/system-spec-update-summary.md`

Step 1（全 task で必須）:

- Step 1-A: workflow 完了記録の対象と記録先を列挙する
  - 対象: `SkillCreatorService.runUpdateWorkflow()` 実処理実装
  - 記録先: `outputs/phase-12/system-spec-update-summary.md`
- Step 1-B: 実装状況を `completed` または `spec_created` のどちらで記録するか判断する
- Step 1-C: 関連タスク、未タスク候補、依存関係の更新有無を整理する
- Step 1-D: `topic-map.md` / `keywords.json` の再生成要否を判断する
- Step 1-E: `.claude` / `.agents` の mirror 影響範囲を整理する
- Step 1-F: `LOGS.md` 更新有無を整理する
- Step 1-G: 検証コマンドの実行結果を要約する

Step 2（条件付き）:

- `SkillCreatorService` の API 変更（`runUpdateWorkflow()` の新規実装）が
  interface / API 契約に該当する場合、`aiworkflow-requirements` 正本へ同期する
- 更新先の正本は `docs/10-requirements` や `docs/20-design` ではなく、
  `.claude/skills/aiworkflow-requirements/` と `.agents/skills/aiworkflow-requirements/`
  の運用フローに従う
- Step 2 を行わない場合も、不要と判断した根拠を残す

---

### Task 3: ドキュメント更新履歴作成

**成果物**: `outputs/phase-12/documentation-changelog.md`

必須記録:

- 更新日時
- 更新ファイル一覧
- Step 1 / Step 2 の実施有無
- validator / verify / link check の結果
- Phase 10 MINOR 指摘があれば追跡結果

---

### Task 4: 未タスク検出レポート作成

**成果物**: `outputs/phase-12/unassigned-task-detection.md`

- 0 件でも必須
- 以下の観点で未タスクを確認する
  - `runUpdateWorkflow()` 実装に伴うスコープ外の改善候補
  - `runCreateWorkflow()` との重複解消が未着手の場合
  - テストカバレッジが不足している箇所
  - 仕様書間の差異
- 未タスクがある場合は `docs/30-workflows/unassigned-task/` への配置先を明記する

---

### Task 5: スキルフィードバックレポート作成

**成果物**: `outputs/phase-12/skill-feedback-report.md`

- 改善点なしでも必須
- 以下を記録する
  - 有効だった運用（どのスキル・フローが役立ったか）
  - 詰まった点（実装中に詰まった箇所・仕様の不明点）
  - 今後テンプレートへ取り込みたい改善（Phase 仕様書の改善案）

---

### Task 6: Phase 12 準拠チェック

**成果物**: `outputs/phase-12/phase12-task-spec-compliance-check.md`

- Task 1〜5 の完了確認
- ファイル名一致確認
- planned wording 残存確認
- `artifacts.json` との一致確認

---

## 参照資料

| 参照資料               | パス                                                                             | 内容                                      |
| ---------------------- | -------------------------------------------------------------------------------- | ----------------------------------------- |
| Phase 12 テンプレート  | `.claude/skills/task-specification-creator/references/phase-template-phase12.md` | docs-only / SF-02 / SF-03 の補足          |
| システム仕様更新フロー | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`   | Step 1 / Step 2 / validation の正本フロー |
| 仕様記述ガイド         | `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md`           | 仕様書の命名・記述ルール                  |
| topic-map / keywords   | `.claude/skills/aiworkflow-requirements/indexes/`                                | 再生成対象判断                            |

---

## 成果物一覧

| ファイル                                                 | 説明                                     | ステータス |
| -------------------------------------------------------- | ---------------------------------------- | ---------- |
| `outputs/phase-12/implementation-guide.md`               | 実装ガイド（Part 1 + Part 2 + 視覚証跡） | 未作成     |
| `outputs/phase-12/system-spec-update-summary.md`         | Step 1 / Step 2 の判断結果               | 未作成     |
| `outputs/phase-12/documentation-changelog.md`            | 更新履歴・validator 結果                 | 未作成     |
| `outputs/phase-12/unassigned-task-detection.md`          | 未タスク検出レポート                     | 未作成     |
| `outputs/phase-12/skill-feedback-report.md`              | スキルフィードバック                     | 未作成     |
| `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 仕様適合チェック                | 未作成     |

---

## 完了条件

- [ ] `implementation-guide.md` が Part 1（例え話含む）/ Part 2 / 視覚証跡を含んでいる
- [ ] `system-spec-update-summary.md` に Step 1 / Step 2 の判断結果が記録されている
- [ ] `documentation-changelog.md` に validator / verify 結果が記録されている
- [ ] `unassigned-task-detection.md` が 0 件でも出力されている
- [ ] `skill-feedback-report.md` が改善点なしでも出力されている
- [ ] `phase12-task-spec-compliance-check.md` が Task 1〜5 の完了を検証している
- [ ] planned wording が残っていない
- [ ] `artifacts.json` の Phase 12 定義と成果物名が一致している

---

## タスク100%実行確認【必須】

- [ ] Task 1〜6 の成果物が全て存在する
- [ ] 全成果物が空でない
- [ ] `.claude` / `.agents` / `outputs/phase-12` の整合判断が記録されている
- [ ] `docs/30-workflows/unassigned-task/` への配置要否が記録されている
- [ ] validator / verify / link check の結果が `documentation-changelog.md` に残っている

---

## 次Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-SC-CREATOR-UPDATE-IMPL-001/phase-13-pr.md`
