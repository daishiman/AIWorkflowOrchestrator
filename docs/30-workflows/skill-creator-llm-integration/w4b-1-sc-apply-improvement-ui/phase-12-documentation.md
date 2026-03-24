# Phase 12: ドキュメント

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 12                            |
| タスクID | UT-SC-05-APPLY-IMPROVEMENT-UI |
| 作成日   | 2026-03-23                    |
| 前提     | Phase 11 完了                 |

## 目的

実装ガイド・システム仕様書更新・未タスク検出の3タスクを実施し、タスク完了後の情報整合を確保する。

## 実行タスク

### Task 1: 実装ガイド

#### Part 1: 中学生レベル概念説明

`docs/30-workflows/w4b-sc-apply-improvement-ui/outputs/phase-12/implementation-guide.md` に以下を記載:

**日常の例え**:
「AIの先生が宿題の改善点を3つ提案してくれました。1つ目は漢字の間違い、2つ目は文章の順番、3つ目は段落の分け方。あなたは『漢字の間違いと段落の分け方だけ直してもらおう』と選んで、先生に頼みます。先生は選ばれた2つだけを直して、3つ目は何もしません。このUIは、AIが提案した改善点を1つずつ確認して、どれを採用するか自分で選べる画面です。」

**技術概念**:

- IPC（プロセス間通信）: Electron の Main Process と Renderer Process の間でデータをやり取りする仕組み
- Preload API: Renderer から Main Process の機能を安全に呼び出すための「窓口」
- diff 表示: 変更前と変更後の違いを色分けして表示する方法

#### Part 2: 開発者向け実装詳細

- IPC チャンネル `skill-creator:apply-improvement` の仕様
- Preload API `applyRuntimeImprovement` のシグネチャと戻り値
- コンポーネント構成（ImprovementProposalItem / ImprovementProposalList / ImprovementApplyResult）
- 状態管理方針（useState ベース、Zustand 不使用の理由）
- P42/P44/P47/P48/P49/P60/P65 の適用箇所

#### IPC ドキュメント

`docs/30-workflows/w4b-sc-apply-improvement-ui/outputs/phase-12/ipc-documentation.md`:

| チャンネル                        | メソッド | 引数                                                                         | 戻り値                              |
| --------------------------------- | -------- | ---------------------------------------------------------------------------- | ----------------------------------- |
| `skill-creator:apply-improvement` | invoke   | `{ skillName: string, suggestions: RuntimeSkillCreatorImproveSuggestion[] }` | `IpcResult<ApplyImprovementResult>` |

#### コンポーネントドキュメント

`docs/30-workflows/w4b-sc-apply-improvement-ui/outputs/phase-12/component-documentation.md`:

- ImprovementProposalItem: Props、レンダリング条件、アクセシビリティ属性
- ImprovementProposalList: Props、状態管理、ボタン操作
- ImprovementApplyResult: Props、表示条件

### Task 2: システム仕様書更新（spec-update-workflow.md 準拠）

#### Step 1-A: タスク完了記録

- [ ] `aiworkflow-requirements/LOGS.md` 更新
- [ ] `task-specification-creator/LOGS.md` 更新（2ファイル両方: P1/P25 対策）
- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴更新
- [ ] `task-specification-creator/SKILL.md` 変更履歴更新

#### Step 1-B: 実装状況テーブル（該当する場合）

- [ ] IPC チャンネル一覧に `skill-creator:apply-improvement` を追加

#### Step 1-C: 関連タスクテーブル

- [ ] `grep -rn "UT-SC-05-APPLY-IMPROVEMENT-UI" references/` で関連仕様書を検索して更新

#### Step 1-D: topic-map.md 再生成

- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行（P2/P27 対策）

#### Step 2: システム仕様更新

- [ ] IPC 関連仕様書に新チャンネルを追記
- [ ] Preload API 仕様書に `applyRuntimeImprovement` を追記

### Task 3: documentation-changelog.md

`docs/30-workflows/w4b-sc-apply-improvement-ui/outputs/phase-12/documentation-changelog.md` に以下を記録:

- 更新した全仕様書の変更内容
- 各 Step の完了結果
- P4 対策: 全 Step 確認前に「完了」と記載しない

### Task 4: 未タスク検出

- [ ] `unassigned-task-report.md` 作成（0件でも必須）
- [ ] 検出した未タスクは3ステップ全完了（P3/P38 対策）:
  1. `unassigned-task/` に指示書作成
  2. `task-workflow.md` 残課題テーブルに登録
  3. 関連仕様書に参照リンク追加
- [ ] `unassigned-task-detection.md` の件数・ステータス更新
- [ ] `artifacts.json` の Phase 12 ステータスを更新

## 参照資料

- `.claude/rules/05-task-execution.md`（Phase 12 必須チェックリスト）
- `.claude/rules/06-known-pitfalls.md` P1/P2/P3/P4/P25/P27/P38/P43/P51

## 成果物

- `docs/30-workflows/w4b-sc-apply-improvement-ui/outputs/phase-12/implementation-guide.md`
- `docs/30-workflows/w4b-sc-apply-improvement-ui/outputs/phase-12/ipc-documentation.md`
- `docs/30-workflows/w4b-sc-apply-improvement-ui/outputs/phase-12/component-documentation.md`
- `docs/30-workflows/w4b-sc-apply-improvement-ui/outputs/phase-12/documentation-changelog.md`
- `docs/30-workflows/w4b-sc-apply-improvement-ui/outputs/phase-12/unassigned-task-detection.md`

## 完了条件

- [ ] 実装ガイド Part 1（中学生レベル概念説明: 日常例え必須）が作成されている
- [ ] 実装ガイド Part 2（開発者向け実装詳細）が作成されている
- [ ] IPC ドキュメントが作成されている
- [ ] コンポーネントドキュメントが作成されている
- [ ] LOGS.md が2ファイル両方更新されている
- [ ] SKILL.md が2ファイル両方更新されている
- [ ] topic-map.md が再生成されている
- [ ] documentation-changelog.md が作成されている
- [ ] unassigned-task-detection.md が作成されている（0件でも必須）
- [ ] artifacts.json が更新されている

## 次の Phase

Phase 13: 完了
