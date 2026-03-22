# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                                 |
| ------ | ---------------------------------- |
| Phase  | 12                                 |
| 機能名 | terminal-handoff-adapter-placement |
| 作成日 | 2026-03-22                         |

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 事前チェック

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
   - P29: SKILL.md 変更履歴の更新漏れ

## 実行タスク

| Task      | 内容                                                   | 主成果物                                                 |
| --------- | ------------------------------------------------------ | -------------------------------------------------------- |
| Task 12-1 | 技術ドキュメント作成（実装ガイド作成）                 | `outputs/phase-12/implementation-guide.md`               |
| Task 12-2 | システムドキュメント更新（aiworkflow-requirements 等） | `outputs/phase-12/system-spec-update-summary.md`         |
| Task 12-3 | ドキュメント更新履歴作成 & artifacts.json 更新         | `outputs/phase-12/documentation-changelog.md`            |
| Task 12-4 | 未タスク検出（残課題の検出と記録）                     | `outputs/phase-12/unassigned-task-detection.md`          |
| Task 12-5 | スキルフィードバックレポート作成                       | `outputs/phase-12/skill-feedback-report.md`              |
| Task 12-6 | Phase 12 タスク完了整合性チェック                      | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

- Task 12-1: 技術ドキュメント作成（実装ガイド作成）
- Task 12-2: システムドキュメント更新（aiworkflow-requirements 等の更新）
- Task 12-3: ドキュメント更新履歴作成（変更履歴の記録）& artifacts.json 更新
- Task 12-4: 未タスク検出（残課題の検出と記録）
- Task 12-5: スキルフィードバックレポート作成（ワークフロー改善点と技術的教訓の記録）
- Task 12-6: Phase 12 タスク完了整合性チェック（Task 1-5の全完了確認）

## 参照資料

| 資料名                | パス                                                                           | 説明                     |
| --------------------- | ------------------------------------------------------------------------------ | ------------------------ |
| Phase 10 最終レビュー | `outputs/phase-10/final-review-result.md`                                      | MINOR 指摘（MN-1, MN-2） |
| Phase 11 手動テスト   | `outputs/phase-11/manual-test-result.md`                                       | 手動テスト結果           |
| Phase 11 発見課題     | `outputs/phase-11/discovered-issues.md`                                        | 発見した課題             |
| Phase 2 設計書        | `phase-2-design.md`                                                            | アーキテクチャ設計       |
| spec-update-workflow  | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | システム仕様更新手順     |
| 06-known-pitfalls     | `.claude/rules/06-known-pitfalls.md`                                           | 既知の落とし穴           |

## サブフェーズ

### Task 12-1: 実装ガイド作成

**2 パート構成**の実装ガイドを作成する:

| パート | 対象読者         | 内容                                  |
| ------ | ---------------- | ------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）    |
| Part 2 | 開発者・技術者   | 技術的な詳細（スキーマ・API・使用例） |

#### Part 1: 概念的説明（中学生でもわかる版）

- **日常の例え: 「翻訳者」の比喩**
  - たとえば、国際会議で各国の代表が自国語で話す場面を想像してほしい。英語、フランス語、中国語、アラビア語で話された内容を、全て日本語に翻訳する「通訳者」がいれば、日本語しかわからない人でも全員の話を理解できる
  - `toHandoffGuidance()` adapter はまさにこの「通訳者」の役割を果たす。Chat Edit、Agent 実行、Skill 実行など、それぞれ異なる形式（言語）で送られてくるデータを、`HandoffGuidance` という統一形式（日本語）に変換する
- **なぜ必要か**: 変換ロジックが各サービスに分散していると、修正や追加のたびに複数の場所を探して直す必要があり、ミスが起きやすい
- **何をするか**: 1 つの「通訳者」（adapter 関数）を作り、全ての変換をここに集約する

**validator 安定化ルール**:

- Part 1 の「日常の例え」段落には `たとえば` を最低 1 回含める
- Part 1 は「なぜ必要か」→「何をするか」の順序を維持する

#### Part 2: 技術的詳細

- **Discriminated Union パターン**: `kind` プロパティによる exhaustive switch 分岐の設計意図と実装パターン
- **adapter 配置先の選定理由**: 3 候補（shared / service 内 / adapters/handoff）から候補 C を選定した根拠
- **セキュリティ設計**: shell injection 対策（4 種エスケープ）、機密情報除外、PII 除外
- **既存コードとの統合方針**: 段階的移行（破壊的変更なし）の設計判断
- **ディレクトリ構成**: `apps/desktop/src/main/adapters/handoff/` 配下のファイル一覧と責務

### Task 12-2: システムドキュメント更新

> **重要**: 詳細手順は `references/spec-update-workflow.md` を参照

**2 ステップで実行**（両方必須確認）:

#### Step 1: タスク完了記録

##### Step 1-A: 仕様書完了記録

- [ ] 該当する仕様書に「完了タスク」セクションを追加
- [ ] 関連ドキュメントセクションに実装ガイドリンクを追加
- [ ] 変更履歴セクションにバージョンを追記
- [ ] `aiworkflow-requirements/LOGS.md` にタスク完了エントリを追加
- [ ] `task-specification-creator/LOGS.md` にタスク完了記録を追加（**2 ファイル両方必須** -- P1, P25）
- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴更新
- [ ] `task-specification-creator/SKILL.md` 変更履歴更新

##### Step 1-B: 実装状況テーブル更新（該当する場合）

- [ ] `api-endpoints.md` 等の実装ステータスを「完了」に更新（該当する場合）

##### Step 1-C: 関連タスクテーブル更新

- [ ] `grep -rn "UT-TERMINAL-HANDOFF-ADAPTER-PLACEMENT-001" .claude/skills/aiworkflow-requirements/references/` で関連仕様書を検索して更新
- [ ] `grep -n "UT-TERMINAL-HANDOFF-ADAPTER-PLACEMENT-001" .claude/skills/aiworkflow-requirements/references/task-workflow.md` で残課題テーブルを確認
- [ ] 未タスク ID がある場合、配置先判定を記録

##### Step 1-D: topic-map.md 再生成（仕様書に変更があれば必ず実行 -- P2, P27）

- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行して topic-map.md を再生成
- [ ] 再生成された topic-map.md に新規セクションの行番号が正しく反映されていることを確認

#### Step 2: システム仕様更新

本タスクは新規インターフェース（`HandoffSource` Discriminated Union）と新規 adapter モジュール（`adapters/handoff/`）の追加を伴うため、**システム仕様更新が必要**。

| 更新対象ファイル                                                | 更新内容                                                          |
| --------------------------------------------------------------- | ----------------------------------------------------------------- |
| `architecture-overview.md`                                      | adapters 一覧に `handoff/` を追加                                 |
| `interfaces-agent-sdk-skill-reference-share-debug-analytics.md` | `HandoffSource` 型と `toHandoffGuidance()` インターフェースを追記 |

> **SKILL 検証**: `spec-update-workflow.md` Step 1-G.3 に定義された正規経路コマンドで 3 スキル全てが Error 0 件であることを確認する。

```bash
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
```

### Task 12-3: ドキュメント更新履歴 & artifacts.json 更新

ドキュメント更新履歴（documentation-changelog.md）を作成し、artifacts.json を更新する:

```bash
# Step 1: ドキュメント更新履歴生成
node scripts/generate-documentation-changelog.js --workflow docs/30-workflows/terminal-handoff-adapter-placement

# Step 2: Phase 12 完了登録（artifacts.json 更新）
node scripts/complete-phase.js \
  --workflow docs/30-workflows/terminal-handoff-adapter-placement \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/documentation-changelog.md:ドキュメント更新履歴,outputs/phase-12/unassigned-task-detection.md:未タスク検出レポート,outputs/phase-12/skill-feedback-report.md:スキルフィードバックレポート"
```

**artifacts.json 必須項目**:

- Phase 12 のステータスが `completed` に更新されていること
- 全 Phase（1-12）の成果物パスが登録されていること
- `qualityMetrics` セクションに品質指標が記録されていること

**スクリプト未存在時の代替手順**:

- 手動で `outputs/phase-12/documentation-changelog.md` を作成
- 手動で `artifacts.json` を作成（参照: `docs/30-workflows/completed-tasks/TASK-4-1-ipc-channels/outputs/artifacts.json`）
- 更新したドキュメントと変更内容を一覧化

### Task 12-4: 未タスク検出

| #   | ソース                  | 確認項目                           |
| --- | ----------------------- | ---------------------------------- |
| 1   | Phase 3 レビュー結果    | MINOR 判定の指摘事項（MN-1, MN-2） |
| 2   | Phase 10 レビュー結果   | MINOR 判定の指摘事項               |
| 3   | Phase 11 手動テスト結果 | スコープ外の発見事項               |
| 4   | 各 Phase 成果物         | 「将来対応」「TODO」「FIXME」      |
| 5   | コードベース            | TODO/FIXME/HACK/XXX コメント       |

#### Phase 3/10 MINOR 追跡テーブル

| MINOR ID | 指摘内容                                                     | 解決予定 Phase | 解決方法                | ステータス |
| -------- | ------------------------------------------------------------ | -------------- | ----------------------- | ---------- |
| MN-1     | FR-07（Skill Docs Consumer スタブ）が設計に含まれていない    | Phase 5        | TODO コメントとして追加 | 未タスク化 |
| MN-2     | ChatEditHandoffSource が SendWithContextRequest を丸ごと含む | Phase 5        | 必要フィールドのみ抽出  | 未タスク化 |

#### 未タスク化 3 ステップ（P3 準拠）

MN-1, MN-2 の未タスク化:

1. `docs/30-workflows/unassigned-task/` に未タスク指示書を作成する
2. `task-workflow.md` の残課題テーブルへ登録する
3. 関連仕様書に未タスク参照リンクを追加する

#### SF-03 設計タスクパターン確認（該当する場合）

| パターン               | 候補の例                                       | 該当有無 |
| ---------------------- | ---------------------------------------------- | -------- |
| 型定義→実装            | `HandoffSource` 型を定義したが C4 実装が未完了 | 該当     |
| 契約→テスト            | adapter インターフェースの統合テスト未作成     | 確認要   |
| UI 仕様→コンポーネント | 該当なし                                       | N/A      |
| 仕様書間差異→設計決定  | 該当なし                                       | N/A      |

**確認コマンド（Phase 12 完了前に必ず実行）**:

```bash
# 未タスク指示書の物理ファイル存在を確認
ls docs/30-workflows/unassigned-task/

# current workflow 起点でのリンク整合確認
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js \
  --source docs/30-workflows/terminal-handoff-adapter-placement/outputs/phase-12/unassigned-task-detection.md
```

### Task 12-5: スキルフィードバックレポート作成

ワークフロー改善点と技術的教訓を記録する。**改善点がなくても「改善点なし」としてレポートを作成する（省略不可）。**

| セクション         | 記載内容                                              |
| ------------------ | ----------------------------------------------------- |
| ワークフロー改善点 | Phase 実行中に発見したワークフロー上の改善提案        |
| 技術的教訓         | 実装中に得られた技術的な知見・注意点                  |
| スキル改善提案     | task-specification-creator/skill-creator への改善提案 |
| 新規 Pitfall 候補  | 06-known-pitfalls.md に追加すべき新規 Pitfall         |

## アーキテクチャ層別ドキュメント

実装ガイド Part 2（技術的詳細）では、以下の層のドキュメントを作成する:

| 層               | ドキュメント内容                                        | 更新対象                                                        |
| ---------------- | ------------------------------------------------------- | --------------------------------------------------------------- |
| Main Process     | adapter 設計、Discriminated Union、変換ロジック         | `architecture-overview.md`                                      |
| Renderer Process | `HandoffBlock.tsx` の型 import 変更のみ（設計変更なし） | `interfaces-agent-sdk-skill-reference-share-debug-analytics.md` |

## 統合テスト連携（Phase 12）

- ドキュメント更新段階のため新規テスト実行はなし
- Step 1-D（topic-map.md 再生成）と Step 2（システム仕様更新）の結果を検証

| 確認項目            | 確認内容                                   | 期待結果 | 実行結果   |
| ------------------- | ------------------------------------------ | -------- | ---------- |
| topic-map.md 再生成 | `generate-index.js` 実行後のファイル更新   | 成功     | {{RESULT}} |
| SKILL 検証          | 3 スキルの quick_validate.js が Error 0 件 | 全 PASS  | {{RESULT}} |
| artifacts.json 更新 | Phase 12 ステータスが `completed`          | 反映済   | {{RESULT}} |

## 漏れやすいポイント（06-known-pitfalls.md 参照）

| ID  | ポイント                                 | 対策                                                                |
| --- | ---------------------------------------- | ------------------------------------------------------------------- |
| P1  | LOGS.md 2 ファイル更新漏れ               | aiworkflow-requirements + task-specification-creator 両方を同時更新 |
| P2  | topic-map.md 再生成忘れ                  | セクション変更時は必ず `generate-index.js` を実行                   |
| P3  | 未タスク管理の 3 ステップ不完全          | (1)指示書 → (2)task-workflow.md 登録 → (3)関連仕様書リンク          |
| P4  | documentation-changelog への早期完了記載 | 全 Step 完了前に「完了」と書かない                                  |
| P25 | LOGS.md 2 ファイル更新漏れ（再発）       | P1 と同様、2 ファイル更新を明示的にチェック                         |
| P27 | topic-map.md 再生成トリガー判断ミス      | 追加だけでなく削除・更新も再生成トリガー                            |
| P28 | スキルフィードバックレポート未作成       | 改善点なしでも「改善点なし」として作成                              |
| P29 | SKILL.md 変更履歴の更新漏れ              | LOGS.md とは別に SKILL.md の変更履歴テーブルも必ず更新              |

## 多角的チェック観点

| 観点           | 適用判断                                         | 仕様参照先                                          |
| -------------- | ------------------------------------------------ | --------------------------------------------------- |
| アーキテクチャ | adapter 配置先を architecture-overview.md に反映 | `aiworkflow-requirements: architecture-overview.md` |
| セキュリティ   | サニタイズ設計の文書化                           | `aiworkflow-requirements: security-electron-ipc.md` |

**Electron デスクトップアプリ観点**:

| 層                   | 適用判断                                 | 仕様参照先                                                                               |
| -------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------- |
| バックエンド（Main） | adapter 層のドキュメント作成             | `aiworkflow-requirements: architecture-overview.md`                                      |
| IPC 通信             | HandoffGuidance 転送の型定義ドキュメント | `aiworkflow-requirements: interfaces-agent-sdk-skill-reference-share-debug-analytics.md` |

## 成果物

| 成果物                             | パス                                                     | 必須 | 説明                       |
| ---------------------------------- | -------------------------------------------------------- | ---- | -------------------------- |
| 実装ガイド                         | `outputs/phase-12/implementation-guide.md`               | 必須 | 概念的+技術的ドキュメント  |
| システム仕様更新サマリー           | `outputs/phase-12/system-spec-update-summary.md`         | 必須 | Step 1/Step 2 の結果       |
| ドキュメント更新履歴               | `outputs/phase-12/documentation-changelog.md`            | 必須 | 更新履歴                   |
| 未タスク検出レポート               | `outputs/phase-12/unassigned-task-detection.md`          | 必須 | 検出結果（0 件でも出力）   |
| スキルフィードバックレポート       | `outputs/phase-12/skill-feedback-report.md`              | 必須 | 改善点（0 件でも出力必須） |
| phase12-task-spec-compliance-check | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 必須 | Task 1-5完了確認           |
| 未完了タスク指示書（MN-1）         | `docs/30-workflows/unassigned-task/*.md`                 | 条件 | MN-1 の未タスク指示書      |
| 未完了タスク指示書（MN-2）         | `docs/30-workflows/unassigned-task/*.md`                 | 条件 | MN-2 の未タスク指示書      |

## フォールバック手順

スクリプトが存在しない場合の代替手順:

| スクリプト                            | 代替手順                                                                                                               |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `generate-documentation-changelog.js` | 手動で documentation-changelog.md を作成（`outputs/phase-12/documentation-changelog.md` の形式に従う）                 |
| `complete-phase.js`                   | 手動で artifacts.json を作成（参照: `docs/30-workflows/completed-tasks/TASK-4-1-ipc-channels/outputs/artifacts.json`） |
| `detect-unassigned-tasks.js`          | 手動で各 Phase のレビュー結果・発見課題を確認し、unassigned-task-detection.md を作成                                   |
| `validate-phase-output.js`            | 手動で成果物の存在と完了条件を確認                                                                                     |

## 苦戦箇所の記録

タスク実行中に苦戦した箇所があれば、以下に記録する。将来の類似タスクの参考になる。

### 記録テンプレート

```markdown
## 苦戦箇所

### 1. {{問題の概要}}

- **症状**: {{発生した問題の具体的な症状}}
- **原因**: {{問題の根本原因}}
- **解決策**: {{採用した解決策}}
- **学び**: {{将来のタスクへの教訓}}
- **関連 Pitfall**: {{該当する場合は Pitfall ID（例: P31）}}
```

苦戦箇所が 0 件の場合でも、成果物に「苦戦箇所なし（0 件）」を明記する。

## 完了条件

- [ ] 実行タスクを「表」と「- Task 12-X: 箇条書き」の両方で記載している
- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] 実装ガイドのテストカテゴリテーブルが Phase 6 後の実測値を反映している
- [ ] **【Task 2 Step 1-A】該当する仕様書に「完了タスク」セクションを追加した**
- [ ] **【Task 2 Step 1-A】関連ドキュメントセクションに実装ガイドリンクを追加した**
- [ ] **【Task 2 Step 1-A】変更履歴セクションにバージョンを追記した**
- [ ] **【Task 2 Step 1-A】aiworkflow-requirements/LOGS.md にタスク完了エントリを追加した**
- [ ] **【Task 2 Step 1-A】task-specification-creator/LOGS.md にタスク完了記録を追加した**
- [ ] **【Task 2 Step 1-A】aiworkflow-requirements/SKILL.md 変更履歴テーブルを更新した** -- 漏れやすい（P29）
- [ ] **【Task 2 Step 1-A】task-specification-creator/SKILL.md 変更履歴テーブルを更新した** -- 漏れやすい（P29）
- [ ] **【Task 2 Step 1-C】関連タスクテーブルのステータスを「完了」に更新した（該当する場合）**
- [ ] **【Task 2 Step 1-D】topic-map.md を再生成した** -- 漏れやすい（P2, P27 参照）
- [ ] **【Task 2 Step 2】architecture-overview.md の adapters 一覧に `handoff/` を追加した**
- [ ] **【Task 2 Step 2】interfaces-agent-sdk-skill-reference-share-debug-analytics.md に HandoffSource 型を追記した**
- [ ] **【Task 2 Step 2】documentation-changelog.md にシステム仕様更新の結果を記録した**
- [ ] **アーキテクチャ層別のドキュメントが作成されている（該当する層のみ）**
- [ ] **未タスク検出レポートが出力されている（0 件でも出力必須）**
- [ ] 検出された未タスクに対して指示書が作成されている（MN-1, MN-2）
- [ ] 未タスク指示書の物理ファイル存在を確認した（`ls docs/30-workflows/unassigned-task/` で検証）
- [ ] 未タスク配置先判定（`docs/30-workflows/unassigned-task/`）を記録した
- [ ] **スキルフィードバックレポートが出力されている（改善点なしでも作成必須）**
- [ ] artifacts.json が更新されている
- [ ] **artifacts.json の全完了 Phase（1-12）のステータスが completed であること**
- [ ] **苦戦箇所セクションを記録した**（0 件でも明記）
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## サブタスク管理

Phase 実行開始時に、TodoWrite ツールで以下のサブタスクを作成すること:

1. 事前チェック（06-known-pitfalls.md の確認）
2. Task 12-1: 実装ガイド作成（Part 1 + Part 2）
3. Task 12-2 Step 1: タスク完了記録（LOGS.md x2, SKILL.md x2, topic-map.md）
4. Task 12-2 Step 2: システム仕様更新（architecture-overview.md, interfaces-\*.md）
5. Task 12-3: ドキュメント更新履歴 & artifacts.json 更新
6. Task 12-4: 未タスク検出（MN-1, MN-2 の未タスク化 3 ステップ）
7. Task 12-5: スキルフィードバックレポート作成
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## タスク 100% 実行確認

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

```bash
# Phase 完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/terminal-handoff-adapter-placement --phase 12
```

## 次の Phase

Phase 13: PR 作成
