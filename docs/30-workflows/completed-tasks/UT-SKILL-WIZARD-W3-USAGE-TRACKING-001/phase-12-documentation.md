# Phase 12: ドキュメント更新

**Task ID**: UT-SKILL-WIZARD-W3-USAGE-TRACKING-001  
**Task Name**: スキルウィザード使用率計装（trackEvent / Wave 3）  
**Phase**: 12 - ドキュメント更新  
**作成日**: 2026-04-11

---

## 目的

implementation guide、spec sync、未タスク検出、feedback の 4 種類のドキュメントを完了させ、本タスクの完了記録を残す。Phase 12 は 5 つの必須タスクで構成され、6 つの成果物を出力する。

---

## 成果物一覧（6 ファイル、全て必須）

| ファイルパス                                             | タスク      | 省略可否                             |
| -------------------------------------------------------- | ----------- | ------------------------------------ |
| `outputs/phase-12/implementation-guide.md`               | タスク 12-1 | 省略不可                             |
| `outputs/phase-12/system-spec-update-summary.md`         | タスク 12-2 | 省略不可                             |
| `outputs/phase-12/documentation-changelog.md`            | タスク 12-3 | 省略不可                             |
| `outputs/phase-12/unassigned-task-detection.md`          | タスク 12-4 | 省略不可（0 件でも作成）             |
| `outputs/phase-12/skill-feedback-report.md`              | タスク 12-5 | 省略不可（改善点なしでも作成）       |
| `outputs/phase-12/phase12-task-spec-compliance-check.md` | タスク 12-5 | 省略不可（root evidence として必須） |

---

## タスク 12-1: 実装ガイド作成

**出力先**: `outputs/phase-12/implementation-guide.md`

実装ガイドは 2 パート構成とする。

### Part 1: 概念説明（中学生レベル）

以下の方針で執筆すること。

- **対象読者**: プログラミングを学び始めた中学生、または IT 用語に不慣れな非エンジニア
- **専門用語の使用禁止**: TypeScript / trackEvent / 計装 / Renderer などの専門用語を使わない
- **例え話の使用**: 「スクールバスの乗降記録係」のような日常的な例えを使って概念を説明する

記載する内容:

1. **なぜ記録が必要か**: スクールバスの運行管理に例えて、「乗降の記録がないと、バスをどう改善すべきかわからない」ことを説明する
2. **何を記録しているか**: ウィザード（質問に答えながら進む画面）を開いた / 各ステップを終えた / 次の行動を選んだ / 途中でやめた、の 4 種類の出来事を記録することを説明する
3. **記録の使い道**: 記録を集めることで「どのステップで多くの人がやめてしまうか」がわかり、画面を改善できることを説明する
4. **記録は個人情報ではない**: 記録するのは「どのボタンを押したか」だけであり、氏名や個人を特定できる情報は含まれないことを明記する

### Part 2: 開発者向け詳細説明

以下の内容を記載すること。

1. **`SkillWizardEvents` 型と `trackEvent` シグネチャ**

   4 つのイベント型（`skill_wizard_open` / `skill_wizard_step_complete` / `skill_wizard_next_action` / `skill_wizard_abandon`）の型定義を、実装と同じ形で記載する。既存イベント
   `skill_wizard_started` / `skill_wizard_step1_completed` / `skill_wizard_generation_completed` /
   `skill_skeleton_quality_feedback` は後方互換のため保持する。

   ```typescript
   export type SkillWizardEvents = {
     skill_wizard_open: {
       source: "lifecycle_panel" | "direct";
     };
     skill_wizard_step_complete: {
       step: number;
       stepName: string;
     };
     skill_wizard_next_action: {
       action: "edit" | "execute" | "close";
     };
     skill_wizard_abandon: {
       lastStep: number;
     };
   };

   export function trackEvent<K extends keyof SkillWizardEvents>(
     eventName: K,
     payload: SkillWizardEvents[K],
   ): void;
   ```

2. **trackEvent の呼び出し方法**

   各計装ポイントでの具体的な呼び出しコード例を記載する。

   ```typescript
   trackEvent("skill_wizard_open", { source: "direct" });
   trackEvent("skill_wizard_step_complete", {
     step: 0,
     stepName: "スキル情報入力",
   });
   trackEvent("skill_wizard_next_action", { action: "execute" });
   trackEvent("skill_wizard_abandon", { lastStep: 0 });
   ```

3. **エラーハンドリングとエッジケース**
   - `trackEvent` が dev では `console.info`、prod では no-op であることを明記する
   - `trackEvent` の呼び出しがコンポーネントのレンダリングに影響しないことを明記する（fire-and-forget）
   - 将来 sink を差し替える場合も、計装失敗がアプリ全体のクラッシュ原因にならない設計方針を明記する

---

## タスク 12-2: システム仕様書更新

**出力先**: `outputs/phase-12/system-spec-update-summary.md`

以下の Step を順に実施し、各 Step の実施結果を出力ファイルに記録する。

### Step 1-A: タスク完了記録

以下の 3 ファイルを更新する。

| 更新対象ファイル                              | 更新内容                                                                     |
| --------------------------------------------- | ---------------------------------------------------------------------------- |
| `docs/LOGS.md`（または相当するログファイル）  | UT-SKILL-WIZARD-W3-USAGE-TRACKING-001 の完了日・完了 Phase を記録する        |
| `docs/task-workflow/LOGS.md`（存在する場合）  | 同上                                                                         |
| `docs/topic-map.md`（または相当するファイル） | `trackEvent` / `skill_wizard_*` に関するトピックエントリを追加または更新する |

更新できるファイルが存在しない場合は「該当ファイルなし」と明記し、省略した理由を記録する。

補足: このタスクで canonical guidance に変更が入る場合は、同じターンで `.claude/skills/task-specification-creator/{LOGS.md,SKILL.md}` と `.claude/skills/aiworkflow-requirements/{LOGS.md,SKILL.md}` も同期する。

### Step 1-B: 実装状況テーブル更新

以下の操作を実施する。

- 実装状況を管理しているテーブルファイル（`docs/implementation-status.md` または相当するファイル）を開く
- `UT-SKILL-WIZARD-W3-USAGE-TRACKING-001` の行のステータスを「完了」に変更する
- 完了日（2026-04-11）を記録する

### Step 1-C: 関連タスクテーブル更新

以下の操作を実施する。

- `skill-wizard-redesign-lane` のレーン管理ファイルを開く
- `W3-seq-04` の行のステータスを「完了」に更新する
- 対応するタスク ID（UT-SKILL-WIZARD-W3-USAGE-TRACKING-001）を紐付け記録する

### Step 2: 型定義の追加確認（条件付き）

`trackEvent.ts` に追加した `skill_wizard_*` 型定義は Renderer プロセス内部に閉じるため、`@repo/shared` パッケージへの型定義追加は不要である。

ただし、以下の条件に該当する場合は `@repo/shared` の更新を実施する。

- 他のパッケージ（`@repo/web` など）から `skill_wizard_*` イベント型を参照する必要が生じた場合

上記条件に該当しない場合は「Step 2: 該当なし（`@repo/shared` 更新不要）」と明記する。

---

## タスク 12-3: ドキュメント更新履歴作成

**出力先**: `outputs/phase-12/documentation-changelog.md`

タスク 12-2 で実施した全 Step（1-A / 1-B / 1-C / Step 2）の結果を個別に記録する。

記録形式:

```markdown
## Step 1-A: タスク完了記録

- docs/LOGS.md: [更新済み / 該当なし]（理由: ...）
- docs/task-workflow/LOGS.md: [更新済み / 該当なし]（理由: ...）
- docs/topic-map.md: [更新済み / 該当なし]（理由: ...）
- `.claude/skills/task-specification-creator/{LOGS.md,SKILL.md}` / `.claude/skills/aiworkflow-requirements/{LOGS.md,SKILL.md}`: [更新済み / 該当なし]（理由: ...）

## Step 1-B: 実装状況テーブル更新

- 対象ファイル: [ファイルパス]
- 変更内容: UT-SKILL-WIZARD-W3-USAGE-TRACKING-001 のステータスを「完了」に変更

## Step 1-C: 関連タスクテーブル更新

- 対象ファイル: [ファイルパス]
- 変更内容: W3-seq-04 のステータスを「完了」に変更

## Step 2: @repo/shared 型定義追加

- 実施状況: [実施 / 該当なし]（理由: ...）
```

「該当なし」の場合も必ず理由を記録し、空欄にしない。

---

## タスク 12-4: 未タスク検出レポート作成

**出力先**: `outputs/phase-12/unassigned-task-detection.md`

0 件であってもファイルの作成は必須である。

以下の観点で未タスクを検出する。

### 検出観点 1: スコープ外として明示された項目の確認

本タスクのスコープ外として明示された項目（例: 実際のアナリティクス基盤への接続、管理画面でのイベント確認機能など）を列挙し、それぞれについて「将来タスクとして起票すべきか / 現状は不要か」を判定する。

### 検出観点 2: Phase 10 MINOR 指摘事項の確認

Phase 10 で MINOR 判定が出た場合、`outputs/phase-10/minor-issues.md` に記録された指摘事項を本ファイルに転記し、GitHub Issue として起票すべきものを特定する。

Phase 10 が PASS 判定だった場合は「Phase 10 MINOR 指摘事項: なし」と明記する。

### 記録形式

```markdown
## 未タスク検出結果

検出件数: [N] 件

### 1. [未タスク名]

- 内容: [具体的な内容]
- 起票判断: [起票する / 現状不要]
- 起票する場合の対象ランク: [P1 / P2 / P3]

---

検出件数が 0 件の場合:
「未タスクは検出されなかった。」と明記すること。
```

---

## タスク 12-5: スキルフィードバックレポート作成

**出力先 1**: `outputs/phase-12/skill-feedback-report.md`  
**出力先 2**: `outputs/phase-12/phase12-task-spec-compliance-check.md`

改善点がない場合でも、両ファイルの作成は必須である。

### skill-feedback-report.md の内容

以下の観点でフィードバックを記録する。

1. **Phase テンプレートの漏れや曖昧さ**

   本タスクの実施を通じて、Phase 1〜13 のテンプレートに漏れや曖昧な記述があった箇所を具体的に記録する。

   例:
   - 「Phase X の Y 項目で『適切に』という記述が曖昧だった。具体的には〜と記載すべきだった。」
   - 改善点がない場合は「テンプレートの改善点は検出されなかった。」と明記する。

2. **ワークフロー改善の観点**

   本タスクを通じてワークフロー全体（Phase 1〜13 の進め方・順序・並列化等）に改善できる点があれば記録する。

   例:
   - 「NON_VISUAL タスクでは Phase 11 のスクリーンショット手順を自動スキップするルールを追加すべき。」
   - 改善点がない場合は「ワークフロー改善点は検出されなかった。」と明記する。

### phase12-task-spec-compliance-check.md の内容（root evidence として必須）

本ファイルは Phase 12 の全タスクが仕様書通りに実施されたことを示す root evidence である。

以下の内容を含めること。

| 確認項目                | 仕様書の要件                                                            | 実施結果   | 判定            |
| ----------------------- | ----------------------------------------------------------------------- | ---------- | --------------- |
| タスク 12-1 の成果物    | `implementation-guide.md` が 2 パート構成で作成されている               | [実施内容] | [ ] OK / [ ] NG |
| タスク 12-2 の Step 1-A | LOGS.md × 2 + topic-map.md が更新されている（該当なしの場合は理由記録） | [実施内容] | [ ] OK / [ ] NG |
| タスク 12-2 の Step 1-B | UT-SKILL-WIZARD-W3-USAGE-TRACKING-001 が「完了」に更新されている        | [実施内容] | [ ] OK / [ ] NG |
| タスク 12-2 の Step 1-C | W3-seq-04 のステータスが更新されている                                  | [実施内容] | [ ] OK / [ ] NG |
| タスク 12-2 の Step 2   | `@repo/shared` 更新の要否が判断されている                               | [実施内容] | [ ] OK / [ ] NG |
| タスク 12-3 の成果物    | `documentation-changelog.md` が全 Step の結果を記録している             | [実施内容] | [ ] OK / [ ] NG |
| タスク 12-4 の成果物    | `unassigned-task-detection.md` が作成されている（0 件でも）             | [実施内容] | [ ] OK / [ ] NG |
| タスク 12-5 の成果物    | `skill-feedback-report.md` が作成されている（改善点なしでも）           | [実施内容] | [ ] OK / [ ] NG |

全項目が OK であれば Phase 12 完了とみなす。

---

## 完了条件

以下の 6 成果物が全て作成されていること。

1. `outputs/phase-12/implementation-guide.md` — 2 パート構成の実装ガイド
2. `outputs/phase-12/system-spec-update-summary.md` — Step 1-A / 1-B / 1-C / Step 2 の実施結果
3. `outputs/phase-12/documentation-changelog.md` — 全 Step の更新履歴（「該当なし」も記録）
4. `outputs/phase-12/unassigned-task-detection.md` — 未タスク検出レポート（0 件でも作成）
5. `outputs/phase-12/skill-feedback-report.md` — フィードバックレポート（改善点なしでも作成）
6. `outputs/phase-12/phase12-task-spec-compliance-check.md` — root evidence（全項目 OK であること）

上記 6 ファイルが全て存在し、かつ `phase12-task-spec-compliance-check.md` の全項目が OK であることを確認した上で Phase 13 へ進む。
