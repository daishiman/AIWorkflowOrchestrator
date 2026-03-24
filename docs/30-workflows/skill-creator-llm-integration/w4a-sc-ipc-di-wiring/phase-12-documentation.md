# Phase 12: ドキュメント

## メタ情報

| 項目     | 値                     |
| -------- | ---------------------- |
| Phase    | 12                     |
| タスクID | UT-SC-05-IPC-DI-WIRING |
| 作成日   | 2026-03-23             |

## 目的

実装ガイド作成、システム仕様書更新、未タスク検出を行う。

## 実行タスク

### Task 1: 実装ガイド

#### Part 1: 中学生レベル概念説明

**DI（依存性注入）とは**

レストランに例えると、シェフ（RuntimeSkillCreatorFacade）が料理を作るには、食材（skillFileManager）、調理器具（llmAdapter）、レシピ本（resourceLoader）が必要。今まではシェフに「食材と名前」だけ渡して、調理器具もレシピ本も渡していなかった。そのためシェフは「料理できません」と答えるしかなかった。今回の修正は、シェフに全ての道具を渡すようにすること。

#### Part 2: 開発者向け実装詳細

**変更内容**:

`apps/desktop/src/main/ipc/index.ts` の `track("registerSkillCreatorHandlers", ...)` ブロックで、`RuntimeSkillCreatorFacade` のコンストラクタに以下の3依存を追加注入する:

1. **`skillFileManager`**: L701 で生成済みの `SkillFileManager` インスタンス。improve() でスキルの SKILL.md を読み込む際に使用。
2. **`llmAdapter`**: `LLMAdapterFactory.getAdapter("anthropic")` で非同期取得。plan() と improve() で LLM API を呼び出す際に使用。API キー未設定時は `undefined` にフォールバック。
3. **`resourceLoader`**: `new ResourceLoader(DEFAULT_SKILL_CREATOR_PATH)` で生成。plan() と improve() でエージェントプロンプトを読み込む際に使用。

**設計判断の根拠**:

- P34（遅延初期化 DI パターン）: `llmAdapter` は非同期取得が必要なため、try-catch で安全に取得し、失敗時は `undefined` を注入
- P65（dead-end namespace）: 新しい IPC namespace を追加せず、既存の `skill-creator:*` を使用
- `track()` 関数を `async` 化することで、非同期取得をブロック内で完結させる

### Task 2: システム仕様書更新

#### Step 1-A: タスク完了記録

- [ ] `aiworkflow-requirements/LOGS.md` にタスク完了記録を追加
- [ ] `task-specification-creator/LOGS.md` にタスク完了記録を追加（**2ファイル両方**、P1/P25 対策）
- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴更新
- [ ] `task-specification-creator/SKILL.md` 変更履歴更新

#### Step 1-B: 実装状況テーブル

- [ ] 該当する場合、`api-endpoints.md` 等の実装ステータスを更新

#### Step 1-C: 関連タスクテーブル

- [ ] `grep -rn "UT-SC-05-IPC-DI-WIRING" references/` で関連仕様書を検索して更新

#### Step 1-D: topic-map.md 再生成

- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行して topic-map.md を再生成（P2/P27 対策）

#### Step 2: システム仕様更新

- [ ] DI 配線変更に関するアーキテクチャ変更がある場合のみ（本タスクは配線修正のみのため、変更なしの可能性が高い）

### Task 3: documentation-changelog.md

- [ ] 本タスクで変更した全ファイルの変更内容を記録
- [ ] 各 Step の完了結果を詳細に記録（P4 対策: 全 Step 確認前に「完了」と記載しない）

### Task 4: 未タスク検出

- [ ] `unassigned-task-report.md` 作成（0件でも必須）
- [ ] 検出された未タスクがある場合は3ステップ全完了（P3/P38 対策）:
  1. `docs/30-workflows/unassigned-task/` に指示書作成
  2. `task-workflow.md` 残課題テーブルに登録
  3. 関連仕様書に参照リンク追加
- [ ] `artifacts.json` の Phase 12 ステータスを更新

### 想定される未タスク候補

| ID   | タイトル                                  | 理由                                                            |
| ---- | ----------------------------------------- | --------------------------------------------------------------- |
| UT-1 | LLM プロバイダーの動的切替対応            | 現状は "anthropic" 固定。ユーザー選択プロバイダーへの対応が必要 |
| UT-2 | track() 関数の async コールバック公式対応 | async 化の影響が不明確な場合                                    |

## 参照資料

- `.claude/rules/05-task-execution.md`（Phase 12 必須チェックリスト）
- `.claude/rules/06-known-pitfalls.md` P1, P2, P3, P4, P25, P27, P38, P43, P51

## 成果物

- 実装ガイド（本仕様書の Task 1 セクション）
- documentation-changelog.md
- unassigned-task-report.md
- 更新された LOGS.md（2ファイル）
- 更新された SKILL.md（2ファイル）

## 完了条件

- [ ] Task 1（実装ガイド Part 1 + Part 2）を作成した
- [ ] Task 2 Step 1-A の4項目を全て完了した
- [ ] Task 2 Step 1-D で topic-map.md を再生成した
- [ ] Task 3 の documentation-changelog.md を作成した
- [ ] Task 4 の unassigned-task-report.md を作成した（0件でも必須）
- [ ] artifacts.json を更新した

## 次のPhase

Phase 13: 完了
