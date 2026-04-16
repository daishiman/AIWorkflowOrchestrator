# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 12                                        |
| タスクID   | UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001  |
| 機能名     | skill-wizard/resolve-external-integration |
| 前提Phase  | Phase 11                                  |
| 後続Phase  | Phase 13（blocked / 承認待ち）            |
| 作成日     | 2026-04-15                                |
| ステータス | completed                                 |

## 目的

`resolveExternalIntegration` 複数ツール並列統合対応の実装内容を、implementation guide、spec sync、未タスク検出、フィードバックレポートへ 1 wave で同期し完了する。

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

| パート | 対象読者       | 内容                                                    |
| ------ | -------------- | ------------------------------------------------------- |
| Part 1 | 初学者・中学生 | 概念的説明（日常の例え話、専門用語なし）                |
| Part 2 | 開発者・技術者 | 技術的詳細（型定義・API・エラーハンドリング・削除対象） |

### Part 1 の要件（中学生レベル）

`resolveExternalIntegration` の複数ツール並列対応の概念を日常の例え話で説明する。

**説明例:**

> たとえば、学校の文化祭で複数の出し物の準備をするとき、それぞれの担当グループに同時にお願いを送ることができます。
> クラスの代表が「料理グループ・デコレーショングループ・音楽グループ、全員同時に準備してください！」と指示を出すと、
> 3 つのグループがバラバラに、でも同時に作業を始めます。全員が準備し終わったら、その結果をまとめて「文化祭プラン」を作ります。
>
> このアプリでも同じことが起きています。
> Q5（外部ツール連携）でいくつかのツール（Slack・GitHub・Notion など）を選んだとき、
> アプリは「全部のツールに同時に情報を取りに行く」という仕組みを使います。
> これが `resolveExternalIntegration`（外部連携情報を調べる関数）の仕事です。
>
> 以前は「1 つのツールしか調べられない」という制限がありましたが、
> このタスクによって「複数のツールを同時に調べて、結果をまとめる」ことができるようになりました。
> `たとえば` Slack と GitHub を選んだとき、Slack の API 情報と GitHub の API 情報を同時に取得して、
> 両方の情報を合わせた「統合情報」を作り上げます。

- 専門用語を使う場合は即座に日常語で補足する
- 「なぜ必要か」→「何をするか」の順序を守る
- `たとえば` を最低 1 回明示する

**補助スクリーンショット**:

- `outputs/phase-11/screenshots/q5-single-select-no-badge.png`
- `outputs/phase-11/screenshots/q5-multi-select-no-badge.png`

### Part 2 の要件（技術者レベル）

**TypeScript 型定義・インターフェース:**

```typescript
// 単一ツールの統合情報
interface ExternalToolIntegration {
  toolName: string;
  apiEndpoint: string; // API エンドポイント
  authMethod: string; // 認証方式（例: OAuth2, APIKey）
  primaryOperations: string[]; // 主要操作一覧
}

// 複数ツールのマージ後統合情報
interface MergedExternalIntegration {
  tools: ExternalToolIntegration[];
  mergedApiEndpoints: string[];
  mergedAuthMethods: string[];
  mergedPrimaryOperations: string[];
}

// 変更後のシグネチャ（string[] を受け取る）
async function resolveExternalIntegration(
  toolNames: string[],
): Promise<MergedExternalIntegration>;
```

**実装パターン（並列処理とマージ）:**

```typescript
async function resolveExternalIntegration(
  toolNames: string[],
): Promise<MergedExternalIntegration> {
  const normalizedToolNames = [
    ...new Set(toolNames.map((name) => name.trim()).filter(Boolean)),
  ];

  // 空配列フォールバック（AC-4）
  if (normalizedToolNames.length === 0) {
    return {
      tools: [],
      mergedApiEndpoints: [],
      mergedAuthMethods: [],
      mergedPrimaryOperations: [],
    };
  }

  // 複数ツールを並列で処理（AC-1）
  const integrations = await Promise.all(
    normalizedToolNames.map(async (toolName) => {
      if (!isSupportedTool(toolName)) {
        return null;
      }

      try {
        return await fetchToolIntegrationInfo(toolName);
      } catch {
        return null;
      }
    }),
  );

  // 各ツールの統合情報をマージ（AC-2）
  return mergeIntegrations(
    integrations.filter(
      (integration): integration is ExternalToolIntegration =>
        integration !== null,
    ),
  );
}
```

**SkillCreateWizard.tsx の呼び出し箇所更新（AC-5）:**

```typescript
// 変更前（単一ツール）
const integration = await resolveExternalIntegration(selectedOptions[0]);

// 変更後（複数ツール配列）
const integration = await resolveExternalIntegration(selectedTools); // selectedTools: string[]
```

**エラーハンドリング / エッジケース / 設定項目**

- エラーハンドリング
  - `toolNames` が空配列のときは空の merged object を返す（エラーをスローしない）
  - 未対応ツール名が含まれている場合は正規化・サポート判定で除外し、成功分だけをマージする
  - `Promise.all` 内で個別ツールの取得が失敗した場合は `try/catch` でキャッチして `null` を返す
- エッジケース
  - 単一ツールを `["slack"]` のように配列で渡した場合、従来の単一ツール処理と同一の結果を返す（AC-3）
  - 重複ツール名（例: `["slack", "slack"]`）は正規化段階で除去する

**削除対象**

- `ConversationRoundStep.tsx` の `MAIN_TOOL_BADGE_ENABLED`
- `shouldShowMainToolBadge` 関数
- `aria-describedby` を伴う主ツールバッジ JSX
- `// TODO(UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001)` コメント

## Task 12-2: システム仕様書更新【必須】

> 詳細は `references/spec-update-workflow.md` を参照する。

### Step 1: タスク完了記録【必須】

| Step | 要件                                                                                                            | 備考                                                                                                                                                   |
| ---- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1-A  | 完了タスク section を追加し、実装ガイドリンク・変更履歴・`LOGS.md` x2・`SKILL.md` x2・`topic-map.md` を更新する | `spec_created` → `completed`                                                                                                                           |
| 1-B  | 実装状況テーブルを更新する（「未実装」→「完了」）                                                               | `resolveExternalIntegration` の実装状況を完了に変更する                                                                                                |
| 1-C  | 関連タスクテーブルを更新する（`task-workflow.md` を含む）                                                       | `UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001` との関係（暫定措置バッジの削除トリガー）を記録                                                                  |
| 1-D  | `generate-index.js` を aiworkflow-requirements と task-specification-creator の両方で実行する                   | workflow index も再生成する                                                                                                                            |
| 1-E  | 未タスクが出た場合は 3 ステップで formalize する（0件でも検出レポートを出力する）                               | Task 12-4 参照                                                                                                                                         |
| 1-F  | DevOps / CI 向け更新はこの task では N/A を明記する                                                             | 必要時のみ別 wave                                                                                                                                      |
| 1-G  | 検証コマンドを実行して結果を記録する                                                                            | `quick_validate.js` / `validate_all.js` / `verify-all-specs.js` / `validate-phase-output.js` / `validate-phase12-implementation-guide.js` / `diff -qr` |

### Step 2: システム仕様更新【条件付き】

| 条件                                     | 更新対象                                                                    |
| ---------------------------------------- | --------------------------------------------------------------------------- |
| インターフェース変更が shared 化する場合 | `.claude/skills/aiworkflow-requirements/references/interfaces-*` を更新する |
| UI contract が外部仕様に昇格する場合     | 対応する `ui-ux-*` 正本または API 仕様書を更新する                          |
| contract 変更が renderer-local のみ      | `documentation-changelog.md` に N/A 理由を記録する                          |

- `resolveExternalIntegration` は `SkillCreateWizard.tsx` 内の renderer-local helper として扱い、shared interface への昇格は行わない
- `ConversationRoundStep.tsx` のバッジ削除も renderer-local の整理として扱い、外部 contract 変更は N/A とする
- `SkillCreateWizard.tsx` の呼び出しシグネチャ変更は `documentation-changelog.md` の変更履歴と `task-workflow.md` に記録する

## Task 12-3: ドキュメント更新履歴【必須】

```bash
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/ut-skill-wizard-mso-resolve-external-001

node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/ut-skill-wizard-mso-resolve-external-001 \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/system-spec-update-summary.md:システム仕様更新サマリー,outputs/phase-12/documentation-changelog.md:ドキュメント更新履歴,outputs/phase-12/unassigned-task-detection.md:未タスク検出レポート,outputs/phase-12/skill-feedback-report.md:スキルフィードバックレポート,outputs/phase-12/phase12-task-spec-compliance-check.md:Phase 12 準拠チェック"
```

記録内容:

- 変更したファイル一覧
- validator 実行結果
- current / baseline の区別
- root `artifacts.json` と `outputs/artifacts.json` の同期結果
- `topic-map.md` / workflow index の再生成結果
- `implementation-guide.md` / `system-spec-update-summary.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` / `phase12-task-spec-compliance-check.md` の canonical path
- 未実施表現の残存有無

## Task 12-4: 未タスク検出【必須】

| Source               | 確認内容                                                          |
| -------------------- | ----------------------------------------------------------------- |
| Phase 3 review       | MINOR / MAJOR の残課題                                            |
| Phase 10 review      | 最終レビューで残ったブロッカー                                    |
| Phase 11 manual test | scope-out / functional findings                                   |
| codebase             | `TODO` / `FIXME` / `HACK` / `XXX`（特に M-01 以外の残存コメント） |

- 0件でも summary を残す
- 1件以上なら formalize path を記録する
- raw メモで終わらせず、3ステップ（指示書作成 → `task-workflow.md` 登録 → 関連仕様書リンク）まで完了する
- `UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001` の暫定措置バッジ削除が後続タスクとして発生する場合は scope-out として記録する

## Task 12-5: スキルフィードバックレポート【必須】

以下の各観点について記述する（改善点がなくても「改善点なし」と理由を書く）:

- ワークフロー改善点（Phase 1〜12 の流れで気づいた非効率）
- 技術的教訓（並列処理・マージ戦略・フォールバック設計で得た知見）
- スキル改善提案（task-specification-creator スキルへのフィードバック）
- 新規 Pitfall 候補（`Promise.all` フォールバック・型変更による後方互換性で陥りやすい落とし穴）
- 改善点がなくても `改善点なし` と理由を書く

## Task 12-6: Phase 12 コンプライアンス確認【必須】

- Task 12-1〜12-5 の成果物が存在することを確認する
- Step 1-A〜1-G と Step 2 の実施結果を 1 ファイルへ束ねる
- root `artifacts.json` と `outputs/artifacts.json` の同値性を確認する
- `phase-12-documentation.md` に未実施表現が残っていないことを確認する
- validator 実測値、root parity、same-wave sync の根拠を残す
- 未充足が 1 つでもある場合は `PASS` を書かず、`FAIL` または `BLOCKED` とする

## 参照資料

| 参照資料                  | パス                                                                                        | 用途                         |
| ------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------- |
| 実装ガイド定義            | `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md`      | Phase 12 成果物の品質基準    |
| 技術ドキュメントガイド    | `.claude/skills/task-specification-creator/references/technical-documentation-guide.md`     | 実装ガイド作成の規約         |
| システム仕様更新フロー    | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`              | Step 1 / Step 2 の実施手順   |
| 検証マトリクス            | `.claude/skills/task-specification-creator/references/spec-update-validation-matrix.md`     | validator 実行項目の確認     |
| Phase 12 準拠チェック雛形 | `.claude/skills/task-specification-creator/assets/phase12-task-spec-compliance-template.md` | Task 12-6 の記入テンプレート |

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
