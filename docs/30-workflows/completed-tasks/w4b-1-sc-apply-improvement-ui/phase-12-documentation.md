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

`docs/30-workflows/w4b-1-sc-apply-improvement-ui/outputs/phase-12/implementation-guide.md` に以下を記載:

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

`docs/30-workflows/w4b-1-sc-apply-improvement-ui/outputs/phase-12/ipc-documentation.md`:

| チャンネル                        | メソッド | 引数                                                                         | 戻り値                              |
| --------------------------------- | -------- | ---------------------------------------------------------------------------- | ----------------------------------- |
| `skill-creator:apply-improvement` | invoke   | `{ skillName: string, suggestions: RuntimeSkillCreatorImproveSuggestion[] }` | `IpcResult<ApplyImprovementResult>` |

#### コンポーネントドキュメント

`docs/30-workflows/w4b-1-sc-apply-improvement-ui/outputs/phase-12/component-documentation.md`:

- ImprovementProposalItem: Props、レンダリング条件、アクセシビリティ属性
- ImprovementProposalList: Props、状態管理、ボタン操作
- ImprovementApplyResult: Props、表示条件

### Task 2: システム仕様書更新（spec-update-workflow.md 準拠）

#### Step 1-A: タスク完了記録

- [x] `aiworkflow-requirements/LOGS.md` 更新
- [x] `task-specification-creator/LOGS.md` 更新（2ファイル両方: P1/P25 対策）
- [x] `aiworkflow-requirements/SKILL.md` 変更履歴更新
- [x] `task-specification-creator/SKILL.md` 変更履歴更新

#### Step 1-B: 実装状況テーブル（該当する場合）

- [x] IPC チャンネル一覧に `skill-creator:apply-improvement` を追加（LOGS.md + ipc-documentation.md に記録）

#### Step 1-C: 関連タスクテーブル

- [x] `grep -rn "UT-SC-05-APPLY-IMPROVEMENT-UI" references/` で関連仕様書を検索して更新（LOGS.md に完了記録済み）

#### Step 1-D: topic-map.md 再生成

- [x] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行（P2/P27 対策）— 378ファイル、2464キーワード

#### Step 2: システム仕様更新

- [x] IPC 関連仕様書に新チャンネルを追記（LOGS.md + ipc-documentation.md に記録）
- [x] Preload API 仕様書に `applyRuntimeImprovement` を追記（LOGS.md + ipc-documentation.md に記録）

#### Step 3: IPC 契約検証（本タスクは IPC ハンドラ新規追加のため該当）

- [x] `ipc-contract-checklist.md` Phase 1-6 を実施
- [x] ハンドラ引数形式（`{ skillName, suggestions }`）と Preload 側呼び出し形式が一致（P44 準拠）
- [x] 引数名のセマンティクスが実際の値と一致（P45 準拠: skillName はスキル名）
- [x] P42 準拠3段バリデーション（型チェック → 空文字列 → トリム空文字列）が全引数に適用

### Task 3: documentation-changelog.md

`docs/30-workflows/w4b-1-sc-apply-improvement-ui/outputs/phase-12/documentation-changelog.md` に以下を記録:

- 更新した全仕様書の変更内容
- 各 Step の完了結果
- P4 対策: 全 Step 確認前に「完了」と記載しない

### Task 4: 未タスク検出

- [x] `unassigned-task-report.md` 作成（0件）
- [x] 未タスク0件のため3ステップは該当なし（P3/P38 対策）
- [x] `unassigned-task-detection.md` の件数・ステータス更新
- [x] `artifacts.json` の Phase 12 ステータスを更新

### Task 5: スキルフィードバックレポート

`docs/30-workflows/w4b-1-sc-apply-improvement-ui/outputs/phase-12/skill-feedback-report.md` を作成する（改善点なしでも出力必須）。

| 観点             | 記録内容                                                                 |
| ---------------- | ------------------------------------------------------------------------ |
| テンプレート改善 | Phase テンプレートの漏れや曖昧さ（例: 接続先設計セクションの標準化検討） |
| ワークフロー改善 | improve → apply の連携フローパターンの再利用可能化検討                   |
| ドキュメント改善 | diff 表示コンポーネントの横断ガイドライン化候補                          |

## 参照資料

- `.claude/rules/05-task-execution.md`（Phase 12 必須チェックリスト）
- `.claude/rules/06-known-pitfalls.md` P1/P2/P3/P4/P25/P27/P38/P43/P51

## 成果物

- `docs/30-workflows/w4b-1-sc-apply-improvement-ui/outputs/phase-12/implementation-guide.md`
- `docs/30-workflows/w4b-1-sc-apply-improvement-ui/outputs/phase-12/ipc-documentation.md`
- `docs/30-workflows/w4b-1-sc-apply-improvement-ui/outputs/phase-12/component-documentation.md`
- `docs/30-workflows/w4b-1-sc-apply-improvement-ui/outputs/phase-12/documentation-changelog.md`
- `docs/30-workflows/w4b-1-sc-apply-improvement-ui/outputs/phase-12/unassigned-task-report.md`
- `docs/30-workflows/w4b-1-sc-apply-improvement-ui/outputs/phase-12/unassigned-task-detection.md`
- `docs/30-workflows/w4b-1-sc-apply-improvement-ui/outputs/phase-12/skill-feedback-report.md`
- `docs/30-workflows/w4b-1-sc-apply-improvement-ui/outputs/phase-12/system-spec-update-summary.md`
- `docs/30-workflows/w4b-1-sc-apply-improvement-ui/outputs/phase-12/phase12-task-spec-compliance-check.md`

## 統合テスト連携

Phase 12（ドキュメント）では統合テスト対象なし。

## 多角的チェック観点

| 観点         | 適用判断                 | 仕様参照先                                                    |
| ------------ | ------------------------ | ------------------------------------------------------------- |
| ドキュメント | 実装ガイド Part 1/2 品質 | `task-specification-creator: phase-12-documentation-guide.md` |
| 仕様書整合   | IPC/API 仕様書との同期   | `aiworkflow-requirements: api-*.md`                           |

## サブタスク管理

Phase 実行開始時に以下のサブタスクを作成:

1. 実装ガイド作成（Task 1: Part 1 + Part 2 + IPC/コンポーネントドキュメント）
2. システム仕様書更新（Task 2: Step 1-A ~ 1-D + Step 2 + Step 3）
3. documentation-changelog 作成（Task 3）
4. 未タスク検出（Task 4）
5. スキルフィードバックレポート作成（Task 5）

## タスク100%実行確認

- [x] 本 Phase 内の全タスクを 100% 実行完了
- [x] 各タスクの成果物が生成されている
- [x] artifacts.json が更新されている

## 完了条件

- [x] 実装ガイド Part 1（中学生レベル概念説明: 日常例え必須）が作成されている
- [x] 実装ガイド Part 2（開発者向け実装詳細）が作成されている
- [x] IPC ドキュメントが作成されている
- [x] コンポーネントドキュメントが作成されている
- [x] LOGS.md が2ファイル両方更新されている
- [x] SKILL.md が2ファイル両方更新されている
- [x] topic-map.md が再生成されている
- [x] documentation-changelog.md が作成されている
- [x] unassigned-task-report.md が作成されている（0件でも必須）
- [x] unassigned-task-detection.md が更新されている
- [x] artifacts.json が更新されている
- [x] スキルフィードバックレポートが作成されている（改善点なしでも必須）
- [x] システム仕様書更新サマリーが作成されている
- [x] Phase 12 タスク仕様書遵守チェックリストが作成されている
- [x] IPC 契約検証（Step 3）が実施されている（ハンドラ引数形式/Preload 呼び出し形式/P42 バリデーション一致）

## 次の Phase

Phase 13: 完了
