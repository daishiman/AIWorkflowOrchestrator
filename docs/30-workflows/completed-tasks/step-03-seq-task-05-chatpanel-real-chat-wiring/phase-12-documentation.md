# Phase 12: ドキュメント - タスク仕様書

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| Phase      | 12                                  |
| Phase名    | ドキュメント                        |
| タスクID   | TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 |
| 前提Phase  | Phase 11（手動テスト）              |
| 後続Phase  | Phase 13（PR 作成）                 |
| ステータス | completed                           |
| 作成日     | 2026-03-13                          |
| 更新日     | 2026-03-17                          |
| 機能名     | chatpanel-real-chat-wiring          |

## 目的

> **注記**: 本タスクは「設計」タスクであり、本 Phase は実装仕様書として設計内容を記述する。実際のコード実装は後続の実装タスクで行う。

ChatPanel の実 AI チャット配線の内容をシステム仕様と台帳へ同期し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 事前チェック【必須】

Phase 12 実行前に、以下の既知の落とし穴を確認し、漏れを防止する:

1. `.claude/rules/06-known-pitfalls.md` の Phase 12 関連項目を読む
   - P1: LOGS.md 2 ファイル更新漏れ
   - P2: topic-map.md 再生成忘れ
   - P3: 未タスク管理の 3 ステップ不完全
   - P4: documentation-changelog への早期「完了」記載
   - P25: LOGS.md 2 ファイル更新漏れ（再発）
   - P26: システム仕様書更新遅延
   - P27: topic-map.md 再生成トリガーの判断ミス
   - P28: スキルフィードバックレポート未作成
   - P43: サブエージェントの rate limit 中断
   - P51: サブエージェントの documentation-changelog 早期完了記載

## 実行タスク

| Task      | 内容                                                   | 主成果物                                        |
| --------- | ------------------------------------------------------ | ----------------------------------------------- |
| Task 12-1 | 技術ドキュメント作成（実装ガイド作成）                 | `outputs/phase-12/implementation-guide.md`      |
| Task 12-2 | システムドキュメント更新（aiworkflow-requirements 等） | `outputs/phase-12/spec-update-summary.md`       |
| Task 12-3 | ドキュメント更新履歴作成                               | `outputs/phase-12/documentation-changelog.md`   |
| Task 12-4 | 未タスク検出（残課題の検出と記録）                     | `outputs/phase-12/unassigned-task-detection.md` |
| Task 12-5 | スキルフィードバックレポート作成                       | `outputs/phase-12/skill-feedback-report.md`     |

- Task 12-1: 技術ドキュメント作成（実装ガイド作成）
- Task 12-2: システムドキュメント更新（aiworkflow-requirements 等の更新）
- Task 12-3: ドキュメント更新履歴作成（変更履歴の記録）
- Task 12-4: 未タスク検出（残課題の検出と記録）
- Task 12-5: スキルフィードバックレポート作成（ワークフロー改善点と技術的教訓の記録）

> **必須**: 実行タスクは「表」と「`- Task 12-X:` 箇条書き」を**両方**残すこと（表のみ・箇条書きのみは不合格）。

## サブフェーズ

### Task 1: 実装ガイド作成【必須】

**2 パート構成**の実装ガイドを作成する:

| パート | 対象読者         | 内容                                              |
| ------ | ---------------- | ------------------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）                |
| Part 2 | 開発者・技術者   | TypeScript 型定義、IPC 契約、状態遷移図、コード例 |

**Part 1（中学生レベル）の要件**:

- 「ChatPanel は、AI とおしゃべりするための部屋」のような日常の例えを使う
- streaming = 「相手が話している途中」
- capability = 「お店が開いているかチェック」
- terminal handoff = 「自分ではできないので、専門家にバトンタッチ」
- `たとえば` を最低 1 回含める
- 「なぜ必要か」->「何をするか」の順序を維持する

**Part 2（技術者レベル）の要件**:

- ChatPanel の 8 状態と状態遷移図
- useStreamingChat hook の契約（state + actions）
- IPC 契約マトリクス（10 チャンネル）
- コンポーネント階層（12 コンポーネント）と props 設計
- Renderer 3 段階防御パターンのコード例
- P42 3-step validation のコード例

### Task 2: システムドキュメント更新【必須】

> **重要**: 詳細手順は `references/spec-update-workflow.md` を参照

#### Step 1: タスク完了記録【必須・全タスク】

##### Step 1-A: 仕様書完了記録

- [ ] 該当する仕様書に「完了タスク」セクションを追加
- [ ] 関連ドキュメントセクションに実装ガイドリンクを追加
- [ ] 変更履歴セクションにバージョンを追記
- [ ] aiworkflow-requirements/LOGS.md にタスク完了エントリを追加
- [ ] task-specification-creator/LOGS.md にタスク完了記録を追加（**2 ファイル両方必須** -- P1, P25）
- [ ] aiworkflow-requirements/SKILL.md 変更履歴更新
- [ ] task-specification-creator/SKILL.md 変更履歴更新

##### Step 1-B: 実装状況テーブル更新（該当する場合）

- [ ] api-endpoints.md 等の実装ステータスを「完了」に更新

##### Step 1-C: 関連タスクテーブル更新

- [ ] `grep -rn "TASK-IMP-CHATPANEL-REAL-AI-CHAT-001" .claude/skills/aiworkflow-requirements/references/` で関連仕様書を検索して更新

##### Step 1-D: topic-map.md 再生成（**仕様書に変更があれば必ず実行** -- P2, P27）

- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行して topic-map.md を再生成
- [ ] 再生成された topic-map.md に新規セクションの行番号が正しく反映されていることを確認

#### Step 2: システム仕様更新【必須】

ChatPanel に新規コンポーネント（RuntimeBanner, ComposerInput, ErrorGuidance 等）が追加されるため、システム仕様の更新が必要:

**更新対象ファイル（P43 対策: 3 ファイル以下/エージェントに分割）**:

| グループ | 更新対象                      | 更新内容                                                               |
| -------- | ----------------------------- | ---------------------------------------------------------------------- |
| A        | interfaces-llm.md             | ChatPanel コンポーネント階層、useStreamingChat 接続契約                |
|          | api-ipc-system.md             | ChatPanel が使用する 10 IPC チャンネルの契約追記                       |
|          | ui-ux-feature-components.md   | ChatPanel 状態定義（8 状態）と UI 表示テーブル更新                     |
| B        | ui-ux-panels.md               | ChatPanel 統合パターンの更新（placeholder -> real chat）               |
|          | task-workflow.md              | 残課題テーブル更新、完了タスクセクション追加                           |
|          | lessons-learned.md            | 実装教訓（新規パターン・落とし穴がある場合）                           |
|          | arch-state-management-core.md | chatSlice 拡張（chatPanelStatus/chatMessages）、個別セレクタ追加の記録 |

### Task 3: ドキュメント更新履歴 & artifacts.json 更新【必須】

全 Step（1-A/1-B/1-C/1-D/Step 2）の結果を個別に明記する。

**P4 対策**: 各 Step の実行結果を「事後記録」する。実行前に「完了」と書かない。

```bash
# artifacts.json の Phase 12 ステータス更新
node scripts/complete-phase.js \
  --workflow docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-seq-task-05-chatpanel-real-chat-wiring \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/documentation-changelog.md:ドキュメント更新履歴,outputs/phase-12/unassigned-task-detection.md:未タスク検出レポート,outputs/phase-12/skill-feedback-report.md:スキルフィードバックレポート"
```

### Task 4: 未タスク検出【必須】

**未タスクソース（4 パターン）**:

| #   | ソース                         | 確認項目                                           |
| --- | ------------------------------ | -------------------------------------------------- |
| 1   | 元タスク仕様書「スコープ外」   | Phase 1 で除外した機能（会話検索、添付ファイル等） |
| 2   | Phase 3/10 レビュー MINOR 指摘 | MINOR 判定で未タスク化された指摘事項               |
| 3   | Phase 11 発見事項              | 手動テストで発見されたスコープ外の課題             |
| 4   | コードベース                   | TODO/FIXME/HACK/XXX コメント                       |

**検出コマンド**:

```bash
# TODO/FIXME/HACK/XXX の検出
grep -rn "TODO\|FIXME\|HACK\|XXX" apps/desktop/src/renderer/components/chat/ apps/desktop/src/renderer/hooks/useStreamingChat.ts
```

**0 件でも出力必須**: 検出結果が 0 件でも `unassigned-task-detection.md` を作成し、「検出件数: 0 件」と明記する。

**検出時の 3 ステップ（P3 準拠）**:

1. `docs/30-workflows/unassigned-task/` に指示書作成
2. `task-workflow.md` 残課題テーブルに登録
3. 関連仕様書に参照リンク追加

**再評価クローズ時**: 対応する GitHub Issue を `gh issue close <number> --comment "再評価クローズ: ..."` で同時に Close する（P56 準拠）。

### Task 5: スキルフィードバックレポート作成【必須】

ワークフロー改善点と技術的教訓を記録する。**改善点がなくても「改善点なし」としてレポートを作成する（省略不可 -- P28）。**

| セクション         | 記載内容                                                 |
| ------------------ | -------------------------------------------------------- |
| ワークフロー改善点 | Phase 実行中に発見したワークフロー上の改善提案           |
| 技術的教訓         | streaming 配線、state 分離、IPC 契約統一で得た技術的知見 |
| スキル改善提案     | task-specification-creator / skill-creator への改善提案  |
| 新規 Pitfall 候補  | 06-known-pitfalls.md に追加すべき新規 Pitfall            |

## 参照資料

| 参照資料                 | パス                                                                           | 内容                                             |
| ------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------ |
| Phase 1（要件定義）      | `phase-1-requirements.md`                                                      | FR/NFR 分類、受入基準                            |
| Phase 2（設計）          | `phase-2-design.md`                                                            | 状態機械、コンポーネント階層、IPC 契約マトリクス |
| Phase 3（設計レビュー）  | `phase-3-design-review.md`                                                     | レビュー観点の判定結果                           |
| Phase 10（最終レビュー） | `phase-10-final-review.md`                                                     | 最終レビュー報告                                 |
| Phase 11（手動テスト）   | `phase-11-manual-test.md`                                                      | 手動テスト結果                                   |
| code research            | `outputs/code-research-report.md`                                              | コード調査レポート                               |
| spec research            | `outputs/spec-research-report.md`                                              | システム仕様調査レポート                         |
| spec-update-workflow     | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | 仕様更新手順の正本                               |

### システム仕様（aiworkflow-requirements）更新対象

| 参照資料                 | パス                                                                            | 更新内容                                            |
| ------------------------ | ------------------------------------------------------------------------------- | --------------------------------------------------- |
| interfaces-llm           | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`           | ChatPanel コンポーネント階層、useStreamingChat 契約 |
| api-ipc-system           | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`           | ChatPanel 使用 IPC チャンネル追記                   |
| ui-ux-feature-components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | ChatPanel 8 状態定義と UI 表示テーブル              |
| ui-ux-panels             | `.claude/skills/aiworkflow-requirements/references/ui-ux-panels.md`             | ChatPanel 統合パターン更新                          |
| task-workflow            | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`            | 残課題テーブル・完了タスクセクション                |
| lessons-learned          | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`          | 実装教訓（該当する場合）                            |

## 実行手順

### ステップ 1: 事前チェック（落とし穴確認）

`.claude/rules/06-known-pitfalls.md` の Phase 12 関連項目（P1, P2, P3, P4, P25, P26, P27, P28, P43, P51）を確認する。

### ステップ 2: Task 12-1 実装ガイド作成

Part 1（中学生レベル）と Part 2（技術者レベル）を作成する。

### ステップ 3: Task 12-2 システムドキュメント更新

Step 1（完了記録）と Step 2（システム仕様更新）を順に実行する。P43 対策としてサブエージェント分割（3 ファイル以下/エージェント）を適用する。

### ステップ 4: Task 12-3 ドキュメント更新履歴

全 Step の実行結果を事後記録する。P4 対策として全 Step 完了前に「完了」と記載しない。

### ステップ 5: Task 12-4 未タスク検出

4 パターンのソースから未タスクを検出し、検出された場合は P3 準拠の 3 ステップを実行する。

### ステップ 6: Task 12-5 スキルフィードバックレポート

ワークフロー改善点と技術的教訓を記録する。

### ステップ 7: 成果物と完了条件を確認する

全成果物の存在と完了条件の充足を確認する。

## 統合テスト連携

Phase 12 ではコード変更を行わないため、テスト再実行は不要。ただし、仕様書更新後に topic-map.md の再生成結果が正しいことを確認する。

## 多角的チェック観点

| 観点           | 適用 | チェック内容                                                                   |
| -------------- | ---- | ------------------------------------------------------------------------------ |
| UI/UX          | 該当 | 実装ガイド Part 2 の UI 状態定義が Phase 2 設計と一致                          |
| アーキテクチャ | 該当 | 実装ガイド Part 2 のコンポーネント階層が Phase 2 設計と一致                    |
| IPC 通信       | 該当 | api-ipc-system.md の更新内容が IPC 契約マトリクスと一致                        |
| セキュリティ   | 該当 | 実装ガイドにセキュリティ要件（3 段階防御、P42 バリデーション）が記載されている |

**Electron デスクトップアプリ観点**:

| 層                         | 適用 | チェック内容                                          |
| -------------------------- | ---- | ----------------------------------------------------- |
| フロントエンド（Renderer） | 該当 | ui-ux-feature-components.md の ChatPanel 状態定義更新 |
| バックエンド（Main）       | 該当 | interfaces-llm.md の runtime 解決契約更新             |
| IPC 通信                   | 該当 | api-ipc-system.md の 10 チャンネル契約追記            |
| Preload/セキュリティ       | 該当 | security-api-electron.md の更新要否確認               |

## 漏れやすいポイント（06-known-pitfalls.md 参照）

| ID  | ポイント                                 | 対策                                                                |
| --- | ---------------------------------------- | ------------------------------------------------------------------- |
| P1  | LOGS.md 2 ファイル更新漏れ               | aiworkflow-requirements + task-specification-creator 両方を同時更新 |
| P2  | topic-map.md 再生成忘れ                  | セクション変更時は必ず `generate-index.js` を実行                   |
| P3  | 未タスク管理の 3 ステップ不完全          | 指示書 -> task-workflow.md -> 関連仕様書リンク                      |
| P4  | documentation-changelog への早期「完了」 | 全 Step 完了後に事後記録                                            |
| P27 | topic-map.md 再生成トリガー判断ミス      | 追加/削除/更新すべてが再生成トリガー                                |
| P29 | SKILL.md 変更履歴の更新漏れ              | LOGS.md とは別に SKILL.md も必ず更新                                |
| P43 | サブエージェントの rate limit 中断       | 仕様書更新は 3 ファイル以下/エージェントに分割                      |

## 成果物

| 成果物                       | パス                                            | 必須 | 説明                              |
| ---------------------------- | ----------------------------------------------- | ---- | --------------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`      | 必須 | Part 1 + Part 2 の 2 部構成       |
| 仕様同期サマリ               | `outputs/phase-12/spec-update-summary.md`       | 必須 | 更新対象と更新内容の記録          |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`   | 必須 | 全 Step の実行結果                |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md` | 必須 | 検出結果（0 件でも出力）          |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`     | 必須 | 改善点（なしでも出力必須 -- P28） |
| 未完了タスク指示書           | `docs/30-workflows/unassigned-task/*.md`        | 条件 | 未タスク検出時のみ作成            |

## フォールバック手順

| 障害シナリオ                     | 対処手順                                                                                                           |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| generate-index.js 実行失敗       | `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を直接実行し、エラーログを確認             |
| LOGS.md 更新権限エラー           | `git pull --rebase` で最新状態に更新してから再試行                                                                 |
| LOGS.md 2ファイル同期確認        | `diff .claude/skills/aiworkflow-requirements/LOGS.md .claude/skills/task-specification-creator/LOGS.md` で差分確認 |
| topic-map.md 再生成忘れ          | `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行し indexes/ の更新を確認             |
| サブエージェント rate limit 中断 | `git diff --stat -- .claude/skills/` で実際の変更ファイル数を確認し、未完了ファイルを手動更新                      |

## 苦戦箇所の記録【推奨】

| 苦戦箇所                  | 原因 | 解決策 | 今後への提言 |
| ------------------------- | ---- | ------ | ------------ |
| （Phase 12 実行時に記録） | -    | -      | -            |

## 完了条件

- [ ] 実行タスクを「表」と「`- Task 12-X:` 箇条書き」の両方で記載している
- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] **【Task 2 Step 1-A】** 仕様書に「完了タスク」セクションを追加した
- [ ] **【Task 2 Step 1-A】** aiworkflow-requirements/LOGS.md にエントリを追加した
- [ ] **【Task 2 Step 1-A】** task-specification-creator/LOGS.md に記録を追加した（**2 ファイル両方** -- P1, P25）
- [ ] **【Task 2 Step 1-A】** aiworkflow-requirements/SKILL.md 変更履歴を更新した（P29）
- [ ] **【Task 2 Step 1-A】** task-specification-creator/SKILL.md 変更履歴を更新した（P29）
- [ ] **【Task 2 Step 1-C】** `grep -rn "TASK-IMP-CHATPANEL-REAL-AI-CHAT-001" references/` で関連仕様書を検索・更新した
- [ ] **【Task 2 Step 1-D】** topic-map.md を再生成した（P2, P27）
- [ ] **【Task 2 Step 2】** システム仕様更新を実施し documentation-changelog.md に記録した
- [ ] documentation-changelog.md の全 Step 結果が事後記録されている（P4）
- [ ] **未タスク検出レポートが出力されている**【必須】
- [ ] 検出された未タスクに対して P3 準拠 3 ステップが完了している（該当する場合）
- [ ] **スキルフィードバックレポートが出力されている**【必須・改善点なしでも作成 -- P28】
- [ ] artifacts.json が更新されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## サブタスク管理

Phase 実行開始時に、TodoWrite ツールで以下のサブタスクを作成すること:

1. 事前チェック（落とし穴確認）
2. Task 12-1: 実装ガイド作成（Part 1 + Part 2）
3. Task 12-2 Step 1: タスク完了記録（LOGS.md x2、SKILL.md x2、topic-map.md）
4. Task 12-2 Step 2-A: システム仕様更新グループ A（interfaces-llm, api-ipc-system, ui-ux-feature-components）
5. Task 12-2 Step 2-B: システム仕様更新グループ B（ui-ux-panels, task-workflow, lessons-learned）
6. Task 12-3: ドキュメント更新履歴作成（全 Step 事後記録）
7. Task 12-4: 未タスク検出（4 パターンソース確認）
8. Task 12-5: スキルフィードバックレポート作成
9. artifacts.json 更新
10. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。P43 対策としてサブエージェントは 3 ファイル以下/エージェントで分割する。

## タスク 100% 実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスク（Task 12-1 ~ 12-5）を 100% 実行完了
- [ ] 全成果物（5 ファイル）が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-seq-task-05-chatpanel-real-chat-wiring --phase 12

# 仕様書更新の実ファイル差分確認（P43/P51 対策）
git diff --stat -- .claude/skills/

# スキル検証
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
```

## 次のPhase

- [Phase 13（PR 作成）](./phase-13-pr-creation.md) に進む
