# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 12                                   |
| タスクID   | UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001 |
| 機能名     | skill-wizard-mso-main-tool-ui        |
| 前提Phase  | Phase 11                             |
| 後続Phase  | Phase 13（blocked / 承認待ち）       |
| 作成日     | 2026-04-13                           |
| ステータス | completed                            |

## 目的

「主ツール」バッジUI実装の内容を、implementation guide、spec sync、未タスク検出、フィードバックレポートへ 1 wave で同期し完了する。

## 事前チェック【必須】

- P1: `LOGS.md` 更新漏れがないか確認する
- P2: `topic-map.md` と workflow index の再生成忘れがないか確認する
- P3: 未タスク管理の 3 ステップが崩れていないか確認する
- P4: 早期の「完了」記載をしない
- P28: `skill-feedback-report.md` を省略しない
- P29: `SKILL.md` の変更履歴更新漏れがないか確認する
- root `artifacts.json` と `outputs/artifacts.json` の parity を初手で確認する
- `outputs/phase-12/*.md` に `計画` / `予定` / `TODO` / `PR マージ後` を残さない

## 実行タスク

| Task      | 内容                          | 主成果物                                                 |
| --------- | ----------------------------- | -------------------------------------------------------- |
| Task 12-1 | 実装ガイド作成                | `outputs/phase-12/implementation-guide.md`               |
| Task 12-2 | システムドキュメント更新      | `outputs/phase-12/system-spec-update-summary.md`         |
| Task 12-3 | ドキュメント更新履歴作成      | `outputs/phase-12/documentation-changelog.md`            |
| Task 12-4 | 未タスク検出                  | `outputs/phase-12/unassigned-task-detection.md`          |
| Task 12-5 | スキルフィードバックレポート  | `outputs/phase-12/skill-feedback-report.md`              |
| Task 12-6 | Phase 12 コンプライアンス確認 | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

## 並列実行方針

- Task 12-2 の Step 1 を固定した後、Task 12-1 / 12-3 / 12-4 / 12-5 は並列実行できる
- Task 12-2 の Step 2 は Step 1 完了後に実施する
- Task 12-6 は全成果物が揃うまで実行しない

## Task 12-1: 実装ガイド作成【必須・2パート構成】

| パート | 対象読者       | 内容                                           |
| ------ | -------------- | ---------------------------------------------- |
| Part 1 | 初学者・中学生 | 概念的説明（日常の例え話、専門用語なし）       |
| Part 2 | 開発者・技術者 | 技術的詳細（型、シグネチャ、使用例、削除手順） |

### Part 1 の要件（中学生レベル）

「主ツール」バッジの概念を日常の例え話で説明する。

**説明例:**

> たとえば、グループで遠足に行くとき、みんなでいろいろな道具を持ってきます。
> 懐中電灯を持ってきた人、地図を持ってきた人、おやつを持ってきた人…と、全員が役に立つ道具を持っています。
> でも、先頭を歩くリーダーが持っている道具が「一番頼りにする道具（主ツール）」として扱われます。
>
> このアプリでも同じことが起きています。
> Q5（外部ツール連携）でいくつかのツールを選んだとき、アプリの内側では「一番最初に選んだツール」が主役として使われます。
> 「主ツール」バッジは、「このツールが内側で主役として選ばれているよ」ということをあなたに教えてくれるラベルです。
>
> なぜこのバッジが必要かというと、今のアプリは複数のツールを「同じくらい大事」と扱えないため、
> こっそり一番目のツールだけを使っています。
> バッジがないとどれが主役かわからないので、バッジを付けて見えるようにしました。
> `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` が完了して参照ロジックが変わったら、このバッジは削除対象になります。

- 専門用語を使う場合は即座に日常語で補足する
- 「なぜ必要か」→「何をするか」の順序を守る
- `たとえば` を最低 1 回明示する

### Part 2 の要件（技術者レベル）

**TypeScript型定義・インターフェース:**

```typescript
// バッジ表示判定のロジック概要
interface MainToolBadgeProps {
  questionKey: string; // 質問のキー（例: "q5"）
  optionValue: string; // 現在レンダリング中の選択肢
  selectedOptions: string[]; // 選択済みオプション一覧
}

function shouldShowMainToolBadge({
  questionKey,
  optionValue,
  selectedOptions,
}: MainToolBadgeProps): boolean {
  return (
    questionKey === "q5" &&
    selectedOptions.length > 1 &&
    selectedOptions[0] === optionValue
  );
}
```

**実装パターン（Q5キー分岐によるバッジ表示ロジック）:**

```tsx
const isMainTool = shouldShowMainToolBadge({
  questionKey,
  optionValue: opt,
  selectedOptions,
});
const optionId = `${questionKey}-${optionIndex}`;
const optionLabelId = `${optionId}-label`;
const mainToolBadgeId = `${optionId}-main-tool-badge`;

{
  isMainTool && (
    <span
      id={mainToolBadgeId}
      aria-label="主ツールとして使用される"
      className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800"
    >
      主ツール
    </span>
  );
}
```

**aria-label実装方法:**

- バッジ要素に `aria-label="主ツールとして使用される"` を必ず付与する
- ボタン側は `aria-labelledby` で選択肢ラベルを参照し、button 名を `Slack` のまま維持する
- バッジが非表示の場合は aria-label 付き要素ごと DOM から除去する

**エラーハンドリング / エッジケース / 設定項目**

- エラーハンドリング
  - `selectedOptions` が空配列または未定義相当のときはバッジを表示しない
  - `questionKey` が `q5` 以外のときはバッジを表示しない
- エッジケース
  - 選択数が 1 件のときは主ツール表示を出さない
  - 選択順序が入れ替わったときは `selectedOptions[0]` を追従して表示を更新する
- 設定項目

| 項目                            | 既定値                     | 用途                           |
| ------------------------------- | -------------------------- | ------------------------------ |
| `MAIN_TOOL_BADGE_TEXT`          | `主ツール`                 | 視覚表示の文言                 |
| `MAIN_TOOL_BADGE_ARIA_LABEL`    | `主ツールとして使用される` | スクリーンリーダー用の補助文言 |
| `MAIN_TOOL_TARGET_QUESTION_KEY` | `q5`                       | 表示対象の設問キー             |
| `MAIN_TOOL_MIN_SELECTIONS`      | `2`                        | 表示の最小選択数               |

**削除手順（`UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` 完了後）:**

1. バッジ表示ロジック（`shouldShowMainToolBadge` またはインラインの三項演算子）を削除する
2. Q5キー分岐コードを削除する
3. 関連テスト（バッジ表示・非表示・aria-label検証）を削除する
4. 本タスク（`UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001`）を `completed` → `superseded` に更新する

## Task 12-2: システム仕様書更新【必須】

> 詳細は `references/spec-update-workflow.md` を参照する。

### Step 1: タスク完了記録【必須】

| Step | 要件                                                                                          | 備考                                                                                                                                                   |
| ---- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1-A  | 完了タスク section を追加し、実装ガイドリンク・変更履歴・`LOGS.md`・`SKILL.md` を更新する     | `spec_created` → `completed`                                                                                                                           |
| 1-B  | 実装状況テーブルを `spec_created` に更新する                                                  | 暫定措置タスクのため `spec_created` を使用                                                                                                             |
| 1-C  | 関連タスクテーブルを更新する（`task-workflow.md` を含む）                                     | `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` との関係を記録                                                                                              |
| 1-D  | `generate-index.js` を aiworkflow-requirements と task-specification-creator の両方で実行する | workflow index も再生成する                                                                                                                            |
| 1-E  | 未タスクが出た場合は 3 ステップで formalize する（0件でも検出レポートを出力する）             | Task 12-4 参照                                                                                                                                         |
| 1-F  | DevOps / CI 向け更新はこの task では N/A を明記する                                           | 必要時のみ別 wave                                                                                                                                      |
| 1-G  | 検証コマンドを実行して結果を記録する                                                          | `quick_validate.js` / `validate_all.js` / `verify-all-specs.js` / `validate-phase-output.js` / `validate-phase12-implementation-guide.js` / `diff -qr` |

### Step 2: システム仕様更新【条件付き】

| 条件                                | 更新対象                                                                    |
| ----------------------------------- | --------------------------------------------------------------------------- |
| UIコンポーネント変更あり            | 対応する `ui-ux-*` 正本を更新する                                           |
| 新規 interface / type / export あり | `.claude/skills/aiworkflow-requirements/references/interfaces-*` を更新する |
| contract 変更なし                   | `documentation-changelog.md` に N/A 理由を記録する                          |

- バッジ表示ロジックはUIコンポーネント内部に閉じており、外部 API / IPC contract の変更はない
- 暫定措置バッジのため、将来削除を前提とした記録を残す

## Task 12-3: ドキュメント更新履歴【必須】

```bash
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/ut-skill-wizard-mso-main-tool-ui-001

node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/ut-skill-wizard-mso-main-tool-ui-001 \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/system-spec-update-summary.md:システム仕様更新サマリー,outputs/phase-12/documentation-changelog.md:ドキュメント更新履歴,outputs/phase-12/unassigned-task-detection.md:未タスク検出レポート,outputs/phase-12/skill-feedback-report.md:スキルフィードバックレポート,outputs/phase-12/phase12-task-spec-compliance-check.md:Phase 12 準拠チェック"
```

記録内容:

- 変更したファイル一覧
- validator 実行結果
- current / baseline の区別
- root `artifacts.json` と `outputs/artifacts.json` の同期結果
- `implementation-guide.md` / `system-spec-update-summary.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` / `phase12-task-spec-compliance-check.md` の canonical path
- 未実施表現の残存有無

## Task 12-4: 未タスク検出【必須】

| Source               | 確認内容                                                          |
| -------------------- | ----------------------------------------------------------------- |
| Phase 3 review       | MINOR / MAJOR の残課題                                            |
| Phase 10 review      | 最終レビューで残ったブロッカー                                    |
| Phase 11 manual test | scope-out / visual findings                                       |
| codebase             | `TODO` / `FIXME` / `HACK` / `XXX`（特にバッジ削除関連のコメント） |

- 0件でも summary を残す
- 1件以上なら formalize path を記録する
- raw メモで終わらせず、3ステップ（指示書作成 → `task-workflow.md` 登録 → 関連仕様書リンク）まで完了する
- `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` 完了後のバッジ削除作業が後続タスクなら、その旨を scope-out として記録する

## Task 12-5: スキルフィードバックレポート【必須】

以下の各観点について記述する（改善点がなくても「改善点なし」と理由を書く）:

- ワークフロー改善点（Phase 1〜12 の流れで気づいた非効率）
- 技術的教訓（バッジ実装・削除容易性の設計で得た知見）
- スキル改善提案（task-specification-creator スキルへのフィードバック）
- 新規 Pitfall 候補（暫定措置バッジの実装で陥りやすい落とし穴）
- 改善点がなくても `改善点なし` と理由を書く

## Task 12-6: Phase 12 コンプライアンス確認【必須】

- Task 12-1〜12-5 の成果物が存在することを確認する
- Step 1-A〜1-G と Step 2 の実施結果を 1 ファイルへ束ねる
- root `artifacts.json` と `outputs/artifacts.json` の同値性を確認する
- `phase-12-documentation.md` に未実施表現が残っていないことを確認する
- validator 実測値、root parity、same-wave sync の根拠を残す
- 未充足が 1 つでもある場合は `PASS` を書かず、`FAIL` または `BLOCKED` とする

## 参照資料

| 参照資料                  | パス                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------- |
| 実装ガイド定義            | `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md`      |
| 技術ドキュメントガイド    | `.claude/skills/task-specification-creator/references/technical-documentation-guide.md`     |
| システム仕様更新フロー    | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`              |
| 検証マトリクス            | `.claude/skills/task-specification-creator/references/spec-update-validation-matrix.md`     |
| Phase 12 準拠チェック雛形 | `.claude/skills/task-specification-creator/assets/phase12-task-spec-compliance-template.md` |

## 成果物

| 成果物                       | パス                                                     | 説明                               |
| ---------------------------- | -------------------------------------------------------- | ---------------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               | Part 1（中学生）/ Part 2（技術者） |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | Step 1 / Step 2 の結果             |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            | 更新履歴                           |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | 検出結果（0件でも必須）            |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | 改善点（なしでも必須）             |
| Phase 12 準拠チェック        | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 最終根拠                           |

## 完了条件

- [ ] 必須 6 成果物が揃っている
- [ ] Task 12-1〜12-6 がすべて定義されている
- [ ] Step 1-A〜1-G と Step 2 の実施方針が明記されている
- [ ] root / outputs の artifacts parity が確認される
- [ ] 未実施表現が残っていない
- [ ] 本 Phase 内の全タスクを 100% 実行完了する

## サブタスク管理

1. 事前チェック
2. Task 12-1（実装ガイド作成 Part 1 + Part 2）
3. Task 12-2（システム仕様更新 Step 1 + Step 2）
4. Task 12-3（ドキュメント更新履歴作成）
5. Task 12-4（未タスク検出）
6. Task 12-5（スキルフィードバックレポート）
7. Task 12-6（Phase 12 コンプライアンス確認）

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載の 6 ファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認

## 次のPhase

Phase 13: PR作成（blocked / 承認待ち）
