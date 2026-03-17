# Phase 12: ドキュメント

## メタ情報

| 項目     | 内容                                             |
| -------- | ------------------------------------------------ |
| タスクID | TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001             |
| フェーズ | Phase 12                                         |
| 機能名   | agentview-improve-route                          |
| 作成日   | 2026-03-17                                       |
| 依存     | Phase 11 成果物（outputs/phase-11/、全PASS済み） |

## 目的

実装ガイド・システム仕様書更新・未タスク検出の5つの必須タスクを完了させ、次の開発者が実装を理解・引き継げる状態にする。

> 最重要: Phase 12 は漏れが最も発生しやすい Phase。全項目を逐次確認すること。
> 参照: known-pitfalls P1〜P4, P25〜P28, P43, P51, P59

## 実行タスク

### Task 1: 実装ガイド作成

#### Part 1: 概念説明（中学生レベル）

- [ ] `outputs/phase-12/implementation-guide.md` に Part 1 を作成
- [ ] 日常生活の例えを使った概念説明を含める
  - 例: 「CTA バナーは、料理が完成したときに出てくる"評価しますか？"の通知のようなもの」
- [ ] 技術用語なしで機能の目的と価値を説明する

#### Part 2: 開発者向け実装詳細

- [ ] 実装したコンポーネントの構造説明
- [ ] Props 型定義と各プロパティの説明
- [ ] 表示条件ロジック（`isExecutionComplete && selectedSkillName`）の説明
- [ ] P31 対策（個別セレクタ）の適用箇所と理由
- [ ] アニメーション実装の詳細

#### API / コンポーネントドキュメント

- [ ] `outputs/phase-12/component-documentation.md` を作成
- [ ] `AgentView` の変更点（CTA バナー追加）を記録
- [ ] `SkillAnalysisView` の Props 変更（`onNavigateBack`, `onNavigateToAgent` 追加）を記録

### Task 2: システム仕様書更新（spec-update-workflow.md 準拠）

> P43 対策: 1エージェントあたり3ファイル以下に分割して更新する。
> P4 対策: 全ファイル更新後にのみ「完了」と記録する。

#### Step 1-A: タスク完了記録

- [ ] 該当 UI 仕様書（`ui-ux-agentview.md` 等）にタスク完了記録を追加
- [ ] `aiworkflow-requirements/LOGS.md` を更新（**2ファイル確認必須**）
- [ ] `task-specification-creator/LOGS.md` を更新（**2ファイル確認必須**、P1 対策）
- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴を更新
- [ ] `task-specification-creator/SKILL.md` 変更履歴を更新

#### Step 1-B: 実装状況テーブル（該当する場合）

- [ ] `ui-components.md` 等の実装ステータステーブルを更新
- [ ] CTA バナーコンポーネントのステータスを「実装済み」に変更

#### Step 1-C: 関連タスクテーブル

- [ ] `grep -rn "TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001" .claude/skills/aiworkflow-requirements/references/` を実行
- [ ] ヒットした仕様書の関連タスクテーブルを更新

#### Step 1-D: topic-map.md 再生成（P2 対策）

- [ ] `node scripts/generate-index.js` を実行（または該当スクリプト）
- [ ] `git diff --stat -- .claude/skills/` で実際に topic-map.md が更新されたことを確認（P51 対策）
- [ ] 更新されていない場合は再実行

#### Step 2: システム仕様更新（該当する場合）

- [ ] 新規コンポーネント Props インターフェースを `interfaces-ui-components.md` に追記
- [ ] AgentView の状態管理変更を `arch-state-management.md` に反映

### Task 3: documentation-changelog.md 更新

> P4 対策: Task 1・2 の全 Step 完了後にのみ「完了」と記録する。
> P51 対策: 各 Step の実行結果を「事後記録」する。

- [ ] `outputs/phase-12/documentation-changelog.md` を作成
- [ ] 更新した全仕様書の変更内容を記録
- [ ] 各 Step の完了結果を詳細に記録（ファイル名・変更箇所・変更内容）
- [ ] LOGS.md 2ファイルが両方更新済みであることを記録
- [ ] topic-map.md 再生成が実行済みであることを記録

### Task 4: 未タスク検出（P3 対策）

> P3 対策: 検出した未タスクは3ステップ全完了が必須。
> P38 対策: 配置先は必ず `docs/30-workflows/unassigned-task/` 配下。
> P59 対策: 未タスク件数は documentation-changelog.md と unassigned-task-detection.md の両方で一致させる。

- [ ] Phase 10 の `minor-task-candidates.md` を確認して未タスク候補をリストアップ
- [ ] 実装中に発見した改善点・技術的負債をリストアップ
- [ ] `outputs/phase-12/unassigned-task-report.md` を作成（**0件でも必須**）
- [ ] 検出した未タスクに対して3ステップを実施:
  1. `docs/30-workflows/unassigned-task/` に独立した指示書ファイルを作成（P58 対策）
  2. `task-workflow.md` 残課題テーブルに登録
  3. 関連仕様書に参照リンクを追加
- [ ] `unassigned-task-detection.md` の件数・ステータスを更新
- [ ] `artifacts.json` の Phase 12 ステータスを更新
- [ ] 再評価クローズした未タスクがある場合は `gh issue close` で GitHub Issue を Close（P56 対策）

### Task 5: artifacts.json 最終更新

- [ ] `artifacts.json` に Phase 11 までの全成果物パスを記録
- [ ] Phase 12 ステータスを「完了」に更新

## 参照資料

- Phase 11 手動テスト結果: `outputs/phase-11/`
- spec-update-workflow: `.claude/skills/aiworkflow-requirements/references/spec-update-workflow.md`
- known-pitfalls: `.claude/rules/06-known-pitfalls.md`（P1〜P4, P25〜P28, P38, P43, P51, P56, P58, P59）
- タスク実行ルール: `.claude/rules/05-task-execution.md`（Phase 12 チェックリスト）

## 実行手順

1. Task 1（実装ガイド）を完了
2. Task 2 Step 1-A → 1-B → 1-C → 1-D → Step 2 を順に実行
3. Task 3（documentation-changelog）を Task 2 全完了後に作成
4. Task 4（未タスク検出）を実行
5. Task 5（artifacts.json）を更新
6. `git diff --stat -- .claude/skills/` で変更ファイル数を最終確認

## 成果物

```
outputs/phase-12/
  implementation-guide.md          # Part 1 + Part 2
  component-documentation.md       # コンポーネントAPI仕様
  documentation-changelog.md       # 全仕様書更新の記録
  unassigned-task-report.md        # 未タスク検出結果（0件でも必須）
```

## 完了条件

- [ ] `implementation-guide.md` が Part 1（日常例え）と Part 2（実装詳細）を含む
- [ ] `component-documentation.md` が完成している
- [ ] LOGS.md が2ファイル両方更新済み（P1 対策）
- [ ] topic-map.md が再生成済み（P2 対策）
- [ ] `unassigned-task-report.md` が作成済み（0件でも）（P3 対策）
- [ ] 未タスクの3ステップが全完了（P3 対策）
- [ ] `documentation-changelog.md` が全 Step 実行後に作成済み（P4 対策）
- [ ] **本Phase内の全タスクを100%実行完了**

## 次 Phase

→ Phase 13: PR 作成
