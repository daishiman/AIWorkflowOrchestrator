# Phase 12: ドキュメント

## メタ情報

| 項目     | 内容                                            |
| -------- | ----------------------------------------------- |
| タスクID | UT-9B-H-003                                     |
| Phase    | 12                                              |
| タスク名 | SkillCreator IPCセキュリティ強化 - ドキュメント |
| 作成日   | 2026-02-12                                      |
| Issue    | #796                                            |

## 目的

実装ガイド作成、システム仕様書更新、未タスク検出を実施し、本タスクの成果物を完全にドキュメント化する。

> **最重要**: Phase 12は漏れが最も発生しやすいPhase。必ず全項目を逐次確認すること。
> 失敗事例: 06-known-pitfalls.md#P1-P4, P25-P28, P29-P31

## 実行タスク

- Task 1: 実装ガイド作成: Part 1/Part 2 を作成して実装意図を明文化する。
- Task 2: システム仕様書更新: spec-update-workflow に従って関連仕様を更新する。
- Task 3: 変更履歴記録: documentation-changelog に更新内容を残す。
- Task 4: 未タスク検出: 残課題を抽出し3ステップで登録する。
- Task 5: スキルフィードバック記録: 苦戦箇所と再発防止策を記録し、次回の実行精度を向上する。

---

### Task 1: 実装ガイド作成

#### Part 1: 概念説明（中学生レベル — 日常例え必須）

「家の玄関のセキュリティ」に例えた3つのセキュリティ対策の説明:

1. **パストラバーサル防止 = 裏口からの侵入防止**
   - 家（アプリ）には正面玄関（正しいパス）がある
   - 泥棒（攻撃者）は裏口や窓（`../` や `..\\`）から入ろうとする
   - ガードマン（validatePath関数）がIDチェックして、正面玄関以外からの侵入を拒否する
   - NULLバイト = 透明インクで書かれた偽の招待状。見えないけど危険

2. **エラーサニタイズ = 家の間取りを外に漏らさない**
   - 家の中の構造（ファイルパス、スタックトレース）は秘密
   - 不審者が来ても「お断りです」とだけ伝える
   - 家の鍵の場所（APIキー、トークン）を絶対に教えない
   - sanitizeErrorMessage = 「情報フィルター付きインターホン」

3. **ホワイトリスト = 許可された来客リスト**
   - 事前に「来ていい人リスト」（ALLOWED_SCHEMA_NAMES）を作成
   - リストにない人は名前が何であれ入れない
   - リストを更新するには管理者（開発者）の承認が必要

#### Part 2: 開発者向け実装詳細

1. **validatePath() の実装詳細**
   - 関数シグネチャ: `validatePath(inputPath: string, paramName: string): string | null`
   - チェック対象パターン: `../`, `..\`, `\0`（NULLバイト）, `\\\\`（UNCパス）
   - 使用箇所: 全ハンドラーのパス引数受け取り直後
   - テスト方法: `skillCreatorHandlers.security.test.ts` のパストラバーサルセクション

2. **sanitizeErrorMessage() の実装詳細**
   - 関数シグネチャ: `sanitizeErrorMessage(error: unknown): string`
   - マスク対象の正規表現パターン:
     - ファイルパス: `/\/[^\s:]+\.[a-zA-Z]+/g` 等
     - スタックトレース: `/at\s+.+\(.+:\d+:\d+\)/g`
     - トークン/キー: 長い英数字列のマスク
   - 使用箇所: 全catchブロックのRenderer返却時

3. **ALLOWED_SCHEMA_NAMES の定義と拡張方法**
   - 定義: `const ALLOWED_SCHEMA_NAMES = ['task-spec', 'skill-spec', 'mode'] as const`
   - 拡張手順:
     1. `skillCreatorHandlers.ts` の ALLOWED_SCHEMA_NAMES 配列に名前を追加
     2. 対応するスキーマファイルが存在することを確認
     3. セキュリティテストに新しいスキーマ名のテストケースを追加
   - 注意: 配列に追加する際はコードレビュー必須

4. **テストコードの実行方法**

   ```bash
   # セキュリティテストのみ
   pnpm vitest run apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.security

   # 統合テスト含む
   pnpm vitest run apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers

   # カバレッジ付き
   pnpm vitest run --coverage apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers
   ```

#### 成果物

| 成果物              | パス                                                                                                      |
| ------------------- | --------------------------------------------------------------------------------------------------------- |
| 実装ガイド          | docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/outputs/phase-12/implementation-guide.md |
| セキュリティAPI文書 | docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/outputs/phase-12/ipc-documentation.md    |

---

### Task 2: システム仕様書更新（spec-update-workflow.md 準拠）

#### Step 1-A: タスク完了記録

- [ ] `security-electron-ipc.md` にUT-9B-H-003完了記録を追加
- [ ] `api-ipc-agent.md` のSkill Creator IPCセクションを更新（セキュリティ関数追加の記録）
- [ ] `aiworkflow-requirements/LOGS.md` を更新（**1ファイル目**）
- [ ] `task-specification-creator/LOGS.md` を更新（**2ファイル目** — P1/P25対策: 2ファイル両方更新必須）
- [ ] `aiworkflow-requirements/SKILL.md` の変更履歴を更新（P29対策）
- [ ] `task-specification-creator/SKILL.md` の変更履歴を更新（P29対策）

#### Step 1-B: 実装状況テーブル更新

- [ ] `api-endpoints.md` 等のSkill Creator関連セクションに実装ステータスを更新（該当する場合）

#### Step 1-C: 関連タスクテーブル更新

- [ ] `grep -rn "UT-9B-H-003" references/` で関連仕様書を検索
- [ ] `grep -rn "UT-9B-H" references/` でUT-9B-H親タスクの仕様書を検索
- [ ] 関連する全仕様書のタスクテーブルを更新

#### Step 1-D: topic-map.md 再生成

- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行してtopic-map.mdを再生成（P2/P27対策: セクション変更時も必ず再生成）

#### Step 2: システム仕様更新

- [ ] セキュリティ関数（validatePath, sanitizeErrorMessage）の追加はアーキテクチャ変更に該当するため、以下を確認:
  - `security-electron-ipc.md` にセキュリティパターンを追記
  - `architecture-implementation-patterns.md` に該当パターンがあれば更新

---

### Task 3: documentation-changelog.md

- [ ] 更新した全仕様書の変更内容を記録
- [ ] 各Stepの完了結果を**個別に**詳細記録（漏れの可視化）
- [ ] **注意**: 全Step確認前に「完了」と記載しない（P4対策）

記録フォーマット:

```markdown
## UT-9B-H-003: SkillCreator IPCセキュリティ強化

### Step 1-A: タスク完了記録

- security-electron-ipc.md: [更新内容]
- api-ipc-agent.md: [更新内容]
- LOGS.md (aiworkflow-requirements): [更新内容]
- LOGS.md (task-specification-creator): [更新内容]
- SKILL.md (aiworkflow-requirements): [更新内容]
- SKILL.md (task-specification-creator): [更新内容]

### Step 1-B: 実装状況テーブル

- [対象ファイル]: [更新内容/該当なし]

### Step 1-C: 関連タスクテーブル

- [対象ファイル]: [更新内容]

### Step 1-D: topic-map.md

- 再生成: [実行結果]

### Step 2: システム仕様更新

- [対象ファイル]: [更新内容/該当なし]
```

#### 成果物

| 成果物                  | パス                                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------------------ |
| documentation-changelog | docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/outputs/phase-12/documentation-changelog.md |

---

### Task 4: 未タスク検出レポート

- [ ] `unassigned-task-report.md` を作成（**0件でも出力必須**）
- [ ] 検出ソース:
  1. Phase 10レビュー結果のMINOR指摘
  2. コードコメント（TODO / FIXME）の確認: `grep -rn "TODO\|FIXME" apps/desktop/src/main/ipc/skillCreatorHandlers.ts`
  3. Phase 11手動テストで発見した改善点
- [ ] 潜在的未タスク候補（検出された場合のみ3ステップ全完了が必須）:
  - sanitizeErrorMessage の全IPCハンドラーへの横展開
  - IpcResult型の重複定義解消（skillCreatorHandlers.ts内とグローバル定義）
  - validatePath のsharedパッケージへの移動（再利用性向上）
- [ ] 検出した未タスクは**3ステップ全完了**が必須（P3対策）:
  1. `unassigned-task/` に指示書を作成
  2. `task-workflow.md` の残課題テーブルに登録
  3. 関連仕様書に参照リンクを追加
- [ ] `unassigned-task-detection.md` の件数・ステータスを更新
- [ ] `artifacts.json` のPhase 12ステータスを更新

#### 成果物

| 成果物           | パス                                                                                                        |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| 未タスクレポート | docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/outputs/phase-12/unassigned-task-report.md |

---

### Task 5: スキルフィードバックレポート

- [ ] 実装で苦戦した箇所（原因・解決策・教訓）を記録
- [ ] task-specification-creator / skill-creator に反映すべき改善提案を整理
- [ ] Pitfall候補を記録し、`06-known-pitfalls.md` への反映判定（反映/保留）を明示

#### 成果物

| 成果物                     | パス                                                                                                       |
| -------------------------- | ---------------------------------------------------------------------------------------------------------- |
| スキルフィードバック報告書 | docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/outputs/phase-12/skill-feedback-report.md |

---

## 成果物/実行手順

| 区分     | 内容                 | パス/コマンド                                                                                                  |
| -------- | -------------------- | -------------------------------------------------------------------------------------------------------------- |
| 成果物   | 実装ガイド           | `docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/outputs/phase-12/implementation-guide.md`    |
| 成果物   | セキュリティAPI文書  | `docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/outputs/phase-12/ipc-documentation.md`       |
| 成果物   | 変更履歴             | `docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/outputs/phase-12/documentation-changelog.md` |
| 成果物   | 未タスクレポート     | `docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/outputs/phase-12/unassigned-task-report.md`  |
| 成果物   | スキルフィードバック | `docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/outputs/phase-12/skill-feedback-report.md`   |
| 実行手順 | topic-map再生成      | `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`                                        |
| 実行手順 | 関連仕様検索         | `grep -rn "UT-9B-H-003" .claude/skills/aiworkflow-requirements/references/`                                    |

## Phase 12 苦戦防止Tips

> P1-P4, P25-P31の教訓に基づく防止策

1. **事前に空欄チェックリストを作成**: 本ファイルのチェックボックスを全て確認してから作業開始
2. **spec-update-workflow.mdを常に参照**: 手順を暗記に頼らず、仕様書を開いて逐次確認
3. **LOGS.md/SKILL.mdは4ファイル更新**: aiworkflow-requirements(2) + task-specification-creator(2) = 計4ファイル
4. **topic-map.md再生成はセクション変更時も**: 追加だけでなく、削除・更新も再生成トリガー
5. **documentation-changelogは最後に完了記載**: 全Stepを確認してから「完了」を記入
6. **未タスクは0件でもレポート作成**: 「なし」という結果もドキュメント化する

## 参照資料

| 資料                      | パス                                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------------- |
| Phase 1 要件定義          | docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/phase-1-requirements.md                |
| Phase 2 設計              | docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/phase-2-design.md                      |
| Phase 5 実装              | docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/phase-5-implementation.md              |
| Phase 6 テスト拡充        | docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/phase-6-test-expansion.md              |
| Phase 7 カバレッジ確認    | docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/phase-7-coverage-check.md              |
| Phase 8 リファクタリング  | docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/phase-8-refactoring.md                 |
| Phase 9 品質検証          | docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/phase-9-quality-assurance.md           |
| Phase 10 レビュー結果     | docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/outputs/phase-10/final-review.md       |
| Phase 11 手動テスト結果   | docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/outputs/phase-11/manual-test-report.md |
| IPC セキュリティ仕様      | .claude/skills/aiworkflow-requirements/references/security-electron-ipc.md                              |
| 実装パターン仕様          | .claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md               |
| 失敗事例・教訓            | .claude/skills/aiworkflow-requirements/references/lessons-learned.md                                    |
| API/Electron セキュリティ | .claude/skills/aiworkflow-requirements/references/security-api-electron.md                              |
| スキルIPC セキュリティ    | .claude/skills/aiworkflow-requirements/references/security-skill-ipc.md                                 |
| Agent SDK スキルI/F仕様   | .claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md                         |
| タスクワークフロー仕様    | .claude/skills/aiworkflow-requirements/references/task-workflow.md                                      |
| spec-update-workflow      | .claude/skills/task-specification-creator/references/spec-update-workflow.md                            |
| 既知の落とし穴            | .claude/rules/06-known-pitfalls.md                                                                      |
| タスク実行ルール          | .claude/rules/05-task-execution.md                                                                      |

## 完了条件

- [ ] Task 1: 実装ガイド（Part 1 + Part 2）が作成済み
- [ ] Task 1: セキュリティAPIドキュメントが作成済み
- [ ] Task 2 Step 1-A: タスク完了記録が全ファイルに追加済み（6ファイル）
- [ ] Task 2 Step 1-B: 実装状況テーブルを確認・更新済み
- [ ] Task 2 Step 1-C: 関連タスクテーブルを検索・更新済み
- [ ] Task 2 Step 1-D: topic-map.mdを再生成済み
- [ ] Task 2 Step 2: システム仕様更新を確認・対応済み
- [ ] Task 3: documentation-changelog.mdに全Stepの結果を記録済み
- [ ] Task 4: 未タスクレポートを作成済み（0件でも必須）
- [ ] Task 4: 検出した未タスクは3ステップ全完了済み（該当する場合）
- [ ] Task 5: スキルフィードバックレポートを作成済み（苦戦箇所・改善提案・Pitfall候補）
- [ ] artifacts.jsonのPhase 12ステータスを更新済み

## 次Phase

Phase 13: 完了 → `phase-13-pr-creation.md`
