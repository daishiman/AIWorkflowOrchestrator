# Phase 12: ドキュメント — ChatViewへのインラインモデルセレクタ配置

## メタ情報

| 項目          | 値                                                                                                                        |
| ------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 機能名        | chat-inline-model-selector                                                                                                |
| タスクID      | TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION                                                                               |
| Phase         | 12                                                                                                                        |
| 作成日        | 2026-03-21                                                                                                                |
| 依存          | Phase 11（手動テスト）完了後                                                                                              |
| 前Phase成果物 | docs/30-workflows/chat-inline-model-selector/tasks/02-TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION/phase-11-manual-test.md |

## 目的

実装ガイドの作成・システム仕様書の更新・未タスクの検出と登録を行い、本タスクの成果をプロジェクトの知識ベースに統合する。

## 実行タスク

- Task 1: 実装ガイド（Part 1/2）を作成する
- Task 2: 関連システム仕様書を更新する
- Task 3: documentation-changelogを記録する（全Step完了後に記載）
- Task 4: 未タスクを検出し3ステップで登録する（0件でも必須）
- Task 5: スキルフィードバックレポートを作成する

**注意（P4・P43対策）**: Task 3のdocumentation-changelogは全Step完了後に事後記録する。実行前に「完了」と記載しない。

## 参照資料

| 資料                                                   | パス                                                                                                                        |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| Phase 2 設計書（ChatView配置設計 3.1/3.3）             | docs/30-workflows/chat-inline-model-selector/phase-2-design.md                                                              |
| Phase 5 実装成果物                                     | docs/30-workflows/chat-inline-model-selector/tasks/02-TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION/phase-5-implementation.md |
| タスク実行ワークフロールール（Phase 12チェックリスト） | .claude/rules/05-task-execution.md                                                                                          |
| 既知の落とし穴（P1-P4, P43, P51, P57, P58, P59）       | .claude/rules/06-known-pitfalls.md                                                                                          |
| aiworkflow-requirements SKILL.md                       | .claude/skills/aiworkflow-requirements/SKILL.md                                                                             |

## 実行手順

### Task 1: 実装ガイド作成

#### 1-1: implementation-guide.md Part 1（中学生レベル概念説明）

ファイルパス: `docs/30-workflows/chat-inline-model-selector/tasks/02-TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION/implementation-guide.md`

Part 1の要件:

- 中学生でも理解できる日常的なたとえを使って概念を説明する
- 「チャット画面のヘッダーにAIモデル切り替えボタンを追加した」という変更を、日常例え（例: レストランのメニュー変更ボタン）で説明する
- 技術用語を使わずに「何が変わったか・なぜ変えたか・どう使うか」を説明する

#### 1-2: implementation-guide.md Part 2（開発者向け実装詳細）

Part 2の要件:

- `ChatView/index.tsx` の変更箇所と理由を説明する
- InlineModelSelectorのdisabledプロップとストリーミング状態の連動を説明する
- LLMGuidanceBannerとの関係（既存動作の維持）を説明する
- P31対策（個別セレクタ使用）の理由を説明する
- テストの実行方法（P40準拠: `cd apps/desktop && pnpm vitest run`）を記載する

#### 1-3: component-documentation.md

ファイルパス: `docs/30-workflows/chat-inline-model-selector/tasks/02-TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION/component-documentation.md`

内容:

- ChatView/index.tsxの変更サマリー
- InlineModelSelectorのPropsインターフェース
- ストリーミング状態連動の仕組み

### Task 2: システム仕様書更新

**注意（P43対策）**: 更新対象が3ファイル以上の場合はサブエージェントを分割する（3ファイル以下/エージェント）。

#### Step 1-A: タスク完了記録

更新対象ファイル（実行時に確認・追加すること）:

| ファイル                                           | 更新内容                                      |
| -------------------------------------------------- | --------------------------------------------- |
| .claude/skills/aiworkflow-requirements/LOGS.md     | タスク完了記録の追加                          |
| .claude/skills/aiworkflow-requirements/SKILL.md    | 変更履歴テーブルの更新                        |
| .claude/skills/task-specification-creator/LOGS.md  | タスク完了記録の追加（P1/P25対策）            |
| .claude/skills/task-specification-creator/SKILL.md | 変更履歴テーブルの更新（P1/P25対策）          |
| 関連するui-ux-\*.md                                | ChatViewへのInlineModelSelector配置の完了記録 |

**注意（P1/P25対策）**: LOGS.md と SKILL.md は `aiworkflow-requirements` と `task-specification-creator` の **2箇所** を必ず更新すること。片方の更新忘れが過去に繰り返し発生している。

```bash
grep -rn "TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION" \
  .claude/skills/aiworkflow-requirements/references/
```

上記コマンドで関連仕様書を特定してから更新する。

#### Step 1-C: 関連タスクテーブルの更新

```bash
grep -rn "chat-inline-model-selector\|InlineModelSelector\|ChatView" \
  .claude/skills/aiworkflow-requirements/references/ | grep -v "Binary"
```

関連する仕様書の「関連タスク」テーブルにTASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATIONを追加する。

#### Step 1-D: topic-map.md 再生成

**注意（P2・P27対策）**: 仕様書に変更があれば必ず再生成する。

```bash
cd .claude/skills/aiworkflow-requirements && node scripts/generate-index.js
```

実行後、`.claude/skills/aiworkflow-requirements/indexes/topic-map.md` が更新されていることを確認する。

#### Mirror Sync

P（Mirror Sync）対策として、`.claude/` の変更を `.agents/` に同期する。

```bash
rsync -avz --checksum \
  ./.claude/skills/aiworkflow-requirements/ \
  ./.agents/skills/aiworkflow-requirements/

diff -qr ./.claude/skills/aiworkflow-requirements/ \
  ./.agents/skills/aiworkflow-requirements/
```

### Task 3: documentation-changelog の記録

**注意（P4・P51対策）**: 全Step完了後に事後記録する。実行前に「完了」と記載しない。

ファイルパス: `docs/30-workflows/chat-inline-model-selector/tasks/02-TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION/documentation-changelog.md`

記録内容:

- Task 1で作成したファイル一覧と内容サマリー
- Task 2で更新した各ファイルの変更内容
- task-workflow.mdへの登録状況
- topic-map.md再生成の実行結果

### Task 4: 未タスク検出

**注意（P3・P38・P58対策）**: 0件でも必ず3ステップを完了させる。

検出観点:

- Phase 10のMINOR指摘が未タスク化されているか
- MT-1〜MT-4でFAILした項目が修正済みか、または未タスク化されているか
- 実装中に気づいたTODO/FIXMEが未タスク化されているか

```bash
grep -rn "TODO\|FIXME\|HACK" \
  apps/desktop/src/renderer/views/ChatView/index.tsx \
  apps/desktop/src/renderer/components/organisms/LLMGuidanceBanner.tsx
```

#### 3ステップの完了

検出した未タスクがある場合（P3対策）:

1. `docs/30-workflows/unassigned-task/` に指示書を作成する（ファイル名: `TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION-followup-xxx.md`）
2. task-workflow.md の残課題テーブルに登録する
3. 関連仕様書に参照リンクを追加する

未タスク検出レポートファイルパス:
`docs/30-workflows/chat-inline-model-selector/tasks/02-TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION/unassigned-task-detection.md`

**0件の場合も `unassigned-task-detection.md` を作成し「検出件数: 0件」と記録すること。**

### Task 5: スキルフィードバックレポート作成

- [ ] スキル改善検討を実施
- [ ] 改善点がなくても「改善点なし」としてレポートを作成
- [ ] `outputs/phase-12/skill-feedback-report.md` に出力

## 成果物

| 成果物                       | パス                                                                                                                           | 説明                                     |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| 実装ガイド                   | docs/30-workflows/chat-inline-model-selector/tasks/02-TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION/implementation-guide.md      | Part 1（日常例え）+ Part 2（開発者向け） |
| コンポーネントドキュメント   | docs/30-workflows/chat-inline-model-selector/tasks/02-TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION/component-documentation.md   | ChatView変更サマリー                     |
| documentation-changelog      | docs/30-workflows/chat-inline-model-selector/tasks/02-TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION/documentation-changelog.md   | 全Step完了後に記録                       |
| 未タスク検出レポート         | docs/30-workflows/chat-inline-model-selector/tasks/02-TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION/unassigned-task-detection.md | 0件でも必須                              |
| スキルフィードバックレポート | outputs/phase-12/skill-feedback-report.md                                                                                      | 改善点なしの場合もレポート作成必須       |

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/chat-inline-model-selector/tasks/02-TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION --phase 12
```

## 完了条件

### Task 1

- [ ] implementation-guide.md Part 1 が作成された（日常例え必須）
- [ ] implementation-guide.md Part 2 が作成された（開発者向け実装詳細）
- [ ] component-documentation.md が作成された

### Task 2

- [ ] aiworkflow-requirements/LOGS.md にタスク完了記録が追加された（P1対策）
- [ ] aiworkflow-requirements/SKILL.md の変更履歴が更新された（P29対策）
- [ ] task-specification-creator/LOGS.md にタスク完了記録が追加された（P1/P25対策）
- [ ] task-specification-creator/SKILL.md の変更履歴が更新された（P1/P25対策）
- [ ] 関連する ui-ux-\*.md にタスク完了記録が追加された
- [ ] topic-map.md が再生成された（P2・P27対策）
- [ ] `.agents/` に rsync で同期された（Mirror Sync）

### Task 3

- [ ] documentation-changelog.md が全Step完了後に作成された（P4対策）
- [ ] 各Stepの実行結果が「事後記録」として記載されている（P51対策）

### Task 4

- [ ] unassigned-task-detection.md が作成された（0件でも必須、P3対策）
- [ ] 検出した未タスクが3ステップ全完了している（①指示書 → ②残課題テーブル → ③関連仕様書リンク）（P38対策）

### Task 5

- [ ] スキル改善検討が実施された（P28対策）
- [ ] skill-feedback-report.md が作成された（改善点なしの場合も必須）

## 次のPhase

[Phase 13: 完了](./phase-13-pr-creation.md)
