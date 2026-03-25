# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 12                          |
| Phase名    | ドキュメント更新            |
| 前提Phase  | Phase 11                    |
| 後続Phase  | Phase 13                    |
| ステータス | 未実施                      |
| 作成日     | 2026-03-25                  |
| 機能名     | w5b-sc-e2e-terminal-handoff |
| タスクID   | TASK-SC-08-E2E-VALIDATION   |

---

## 目的

実装ガイド・テスト結果報告書・完了レポートを作成し、システム仕様書を更新する。Skill Creator LLM 統合全タスク（01〜08）の完了記録を残す最終ドキュメントフェーズ。

## 背景

Skill Creator LLM 統合タスク全体（TASK-SC-01〜TASK-SC-08）の完了を正式に記録するドキュメントフェーズである。本タスク（w5b / TASK-SC-08-E2E-VALIDATION）は Wave 5 の最終タスクであり、全8タスクの統合結果を文書化する責務を持つ。

---

## 事前チェック【必須】

Phase 12実行前に、以下の既知の落とし穴を確認し、漏れを防止する:

1. `.claude/rules/06-known-pitfalls.md` の Phase 12 関連項目を読む
   - P1: LOGS.md 2ファイル更新漏れ
   - P2: topic-map.md 再生成忘れ
   - P3 / P38: 未タスク管理の3ステップ不完全 / 未タスク指示書未配置
   - P4: documentation-changelog への早期「完了」記載
   - P29: SKILL.md 変更履歴の更新漏れ
   - P43: ドキュメント整合性
   - P51: テスト結果報告書不備（カバレッジ・パフォーマンス数値必須）
   - P56: 再評価クローズ Issue 未 Close
   - P59: 並列エージェント changelog 競合

---

## 実行タスク

| Task      | 内容                                                                 | 主成果物                                         |
| --------- | -------------------------------------------------------------------- | ------------------------------------------------ |
| Task 12-1 | 技術ドキュメント作成（実装ガイド + テスト結果報告書 + 完了レポート） | `outputs/phase-12/implementation-guide.md` 他    |
| Task 12-2 | システムドキュメント更新（aiworkflow-requirements 等）               | `outputs/phase-12/system-spec-update-summary.md` |
| Task 12-3 | ドキュメント更新履歴 & artifacts.json 更新                           | `outputs/phase-12/documentation-changelog.md`    |
| Task 12-4 | 未タスク検出（残課題の検出と記録）                                   | `outputs/phase-12/unassigned-task-detection.md`  |
| Task 12-5 | スキルフィードバックレポート作成                                     | `outputs/phase-12/skill-feedback-report.md`      |

- Task 12-1: 技術ドキュメント作成（実装ガイド + テスト結果報告書 + 完了レポート）
- Task 12-2: システムドキュメント更新（aiworkflow-requirements 等の更新）
- Task 12-3: ドキュメント更新履歴 & artifacts.json 更新（変更履歴の記録）
- Task 12-4: 未タスク検出（残課題の検出と記録）
- Task 12-5: スキルフィードバックレポート作成（ワークフロー改善点と技術的教訓の記録）

> **必須**: 実行タスクは「表」と「`- Task 12-X:` 箇条書き」を**両方**残すこと（表のみ・箇条書きのみは不合格）。

### Task 12-1: 技術ドキュメント作成【必須】

**2パート構成**の実装ガイドに加え、テスト結果報告書と全体完了レポートを作成する。

| パート | 対象読者         | 内容                                  |
| ------ | ---------------- | ------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）    |
| Part 2 | 開発者・技術者   | 技術的な詳細（スキーマ・API・使用例） |

**テンプレート**: `assets/implementation-guide-template.md`

#### Step 1-1: implementation-guide.md Part 1（中学生レベル概念説明）

以下の比喩を用いて、技術に詳しくない読者にも理解できる概念説明を作成する。

- **E2E テスト**: 「レストランの全品試食テスト」として説明する。たとえば、注文（入力）→ 調理（処理）→ 配膳（出力）の全工程を、実際の客として通しで確認するテスト。
- **TerminalHandoff**: 「注文後に厨房から届くメモ（次はこれを試して）」として説明する。たとえば、アプリが「この先は CLI でこのコマンドを実行してください」と案内を返す仕組み。

**validator 安定化ルール**: Part 1 の「日常の例え」段落には `たとえば` を最低1回含める。

#### Step 1-2: implementation-guide.md Part 2（開発者向け実装詳細）

以下の技術的詳細を記載する。

1. E2E テストインフラ構成
   - テストランナー（Playwright）設定
   - Electron アプリ起動設定
   - テスト環境変数
2. LLM モック使い方
   - モックサーバーのセットアップ方法
   - レスポンスパターンの定義方法
   - エラーシミュレーション方法
3. テストヘルパー使い方
   - 共通ユーティリティ関数一覧
   - フィクスチャ管理
4. TerminalHandoff 検証パターン
   - suggestedCommand の検証方法
   - CLI 実行可能性の確認手順

#### Step 1-3: テスト結果報告書（test-results-report.md）

以下の内容を含む報告書を作成する（P51 対策: カバレッジ数値・パフォーマンス計測結果を必ず含める）。

| セクション         | 内容                                 |
| ------------------ | ------------------------------------ |
| シナリオ別結果     | シナリオ A〜E の PASS/FAIL           |
| カバレッジ数値     | Line / Branch / Function カバレッジ  |
| パフォーマンス計測 | plan 応答時間、execute-plan 応答時間 |
| 既知の制限事項     | P53 等の環境制約                     |

#### Step 1-4: 全体完了レポート（overall-completion-report.md）

以下の充足表を含む完了レポートを作成する。

**AC 充足表**:

| AC   | 説明                             | 充足状況 | 検証 Phase |
| ---- | -------------------------------- | -------- | ---------- |
| AC-1 | LLM モデル選択                   | -        | -          |
| AC-2 | スキル一覧表示                   | -        | -          |
| AC-3 | 進捗リアルタイム更新             | -        | -          |
| AC-4 | TerminalHandoff suggestedCommand | -        | -          |
| AC-5 | improve モード上書き保存         | -        | -          |
| AC-6 | パフォーマンス基準               | -        | -          |
| AC-7 | LLM エラーハンドリング           | -        | -          |
| AC-8 | 後方互換維持                     | -        | -          |

**NFR 充足表**:

| NFR   | 説明                         | 充足状況 |
| ----- | ---------------------------- | -------- |
| NFR-1 | plan 応答 30 秒以内          | -        |
| NFR-2 | execute-plan 応答 120 秒以内 | -        |
| NFR-3 | テストカバレッジ基準         | -        |
| NFR-4 | エラー時クラッシュなし       | -        |

**タスク 01〜08 完了確認**:

| タスクID   | タスク名 | 完了状況 |
| ---------- | -------- | -------- |
| TASK-SC-01 | -        | -        |
| TASK-SC-02 | -        | -        |
| TASK-SC-03 | -        | -        |
| TASK-SC-04 | -        | -        |
| TASK-SC-05 | -        | -        |
| TASK-SC-06 | -        | -        |
| TASK-SC-07 | -        | -        |
| TASK-SC-08 | -        | -        |

### Task 12-2: システムドキュメント更新【必須】

> **重要**: 詳細手順は `references/spec-update-workflow.md` を参照

**2ステップで実行**（両方必須確認）:

#### Step 1: タスク完了記録【必須・全タスク】

##### Step 1-A: 仕様書完了記録

- [ ] 該当する仕様書に「完了タスク」セクションを追加
- [ ] 関連ドキュメントセクションに実装ガイドリンクを追加
- [ ] 変更履歴セクションにバージョンを追記
- [ ] aiworkflow-requirements/LOGS.md にタスク完了エントリを追加
- [ ] task-specification-creator/LOGS.md にタスク完了記録を追加（**2ファイル両方必須** -- P1, P25）
- [ ] aiworkflow-requirements/SKILL.md 変更履歴更新（P29 対策）
- [ ] task-specification-creator/SKILL.md 変更履歴更新（P29 対策）

##### Step 1-B: 実装状況テーブル更新（該当する場合）

- [ ] api-endpoints.md 等の実装ステータスを「完了」に更新

##### Step 1-C: 関連タスクテーブル更新

```bash
grep -rn "TASK-SC-08" .claude/skills/aiworkflow-requirements/references/
```

検出された仕様書を確認し、必要に応じて更新する。

##### Step 1-D: topic-map.md 再生成（P2, P27 対策）

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

- [ ] 再生成された topic-map.md に新規セクションの行番号が正しく反映されていることを確認

#### Step 2: システム仕様更新【条件付き】

以下の判断基準で更新要否を判断:

| 更新必要                    | 更新不要                   |
| --------------------------- | -------------------------- |
| 新規インターフェース/型追加 | 内部実装の変更のみ         |
| 既存インターフェース変更    | リファクタリング（IF不変） |
| 新規定数/設定値追加         | バグ修正（仕様変更なし）   |
| アーキテクチャパターン追加  | テスト追加のみ             |

- 更新対象: `.claude/skills/aiworkflow-requirements/references/`
- 更新原則: 概要のみ記載、Single Source of Truth 遵守
- **更新不要の場合**: `documentation-changelog.md` に「更新なし」と理由を明記

### IPC 機能開発時の追加更新対象ファイル（該当する場合）

IPC チャンネルの追加・変更を伴うタスクの場合、Step 2 で以下のファイルの更新要否を確認する:

| #   | 更新対象ファイル                          | 更新内容                                               | 必須/任意 |
| --- | ----------------------------------------- | ------------------------------------------------------ | --------- |
| 1   | `api-ipc-agent.md`                        | 新規チャンネル一覧、型定義、完了タスク記録             | 必須      |
| 2   | `security-electron-ipc.md`                | セキュリティ検証パターン（sender検証、ホワイトリスト） | 必須      |
| 3   | `architecture-overview.md`                | IPCハンドラー登録一覧（registerAllIpcHandlers）        | 必須      |
| 4   | `interfaces-agent-sdk-skill.md`           | インターフェース定義、完了タスク記録                   | 必須      |
| 5   | `task-workflow.md`                        | 残課題テーブル更新、完了タスクセクション追加           | 必須      |
| 6   | `lessons-learned.md`                      | 実装教訓（新規パターン・落とし穴がある場合）           | 任意      |
| 7   | `architecture-implementation-patterns.md` | 実装パターン（新規パターンがある場合）                 | 任意      |

### Task 12-3: ドキュメント更新履歴 & artifacts.json 更新【必須】

- 全 Step 完了後に記録する（P4 対策: 途中記録ではなく全 Step 完了後）
- 並列エージェント使用時は全 Task 完了後に統合記録する（P59 対策）

記録内容:

| 項目     | 値                                                                 |
| -------- | ------------------------------------------------------------------ |
| 日付     | 2026-03-25                                                         |
| タスクID | TASK-SC-08-E2E-VALIDATION                                          |
| Phase    | 12                                                                 |
| 変更内容 | 実装ガイド・テスト結果報告書・完了レポート作成、システム仕様書更新 |

**artifacts.json 必須項目**:

- Phase 12 のステータスが `completed` に更新されていること
- 全 Phase（1-12）の成果物パスが登録されていること

**スクリプト未存在時の代替手順**:

- 手動で `outputs/phase-12/documentation-changelog.md` を作成
- 手動で `artifacts.json` を更新

### Task 12-4: 未タスク検出【必須】

| #   | ソース                  | 確認項目                      |
| --- | ----------------------- | ----------------------------- |
| 1   | Phase 3 レビュー結果    | MINOR 判定の指摘事項          |
| 2   | Phase 10 レビュー結果   | MINOR 判定の指摘事項          |
| 3   | Phase 11 手動テスト結果 | スコープ外の発見事項          |
| 4   | 各 Phase 成果物         | 「将来対応」「TODO」「FIXME」 |
| 5   | コードベース            | TODO/FIXME/HACK/XXX コメント  |

1. **unassigned-task-detection.md 作成**（0 件でも必須）
   - 全 Phase を走査し、未割り当てのタスクがないか検出する
   - 検出結果が 0 件であっても報告書を作成する
2. **検出した未タスクの 3 ステップ完了**（P3 / P38 対策）
   - Step 1: 未タスクを特定する
   - Step 2: `docs/30-workflows/unassigned-task/` ディレクトリに指示書を配置する
   - Step 3: `task-workflow.md` の残課題テーブルへ登録し、関連仕様書にリンクを追加する
3. **再評価クローズした未タスクの GitHub Issue Close**（P56 対策）
   - 再評価の結果クローズとなった未タスクがあれば、対応する GitHub Issue を Close する

### Task 12-5: スキルフィードバックレポート作成【必須】

ワークフロー改善点と技術的教訓を記録する。**改善点がなくても「改善点なし」としてレポートを作成する（省略不可）。**

| セクション         | 記載内容                                              |
| ------------------ | ----------------------------------------------------- |
| ワークフロー改善点 | Phase 実行中に発見したワークフロー上の改善提案        |
| 技術的教訓         | 実装中に得られた技術的な知見・注意点                  |
| スキル改善提案     | task-specification-creator/skill-creator への改善提案 |
| 新規 Pitfall 候補  | 06-known-pitfalls.md に追加すべき新規 Pitfall         |

**成果物**: `outputs/phase-12/skill-feedback-report.md`

---

## アーキテクチャ層別ドキュメント（AIが判断）

実装ガイド Part 2（技術的詳細）では、タスクの性質に応じて以下の層別にドキュメントを作成する:

| 層               | ドキュメント内容                            | 更新対象                        |
| ---------------- | ------------------------------------------- | ------------------------------- |
| Renderer Process | コンポーネント設計、状態管理、Hooks使用方法 | `ui-ux-*.md`, `interfaces-*.md` |
| Main Process     | サービス設計、ビジネスロジック、API仕様     | `architecture-*.md`, `api-*.md` |
| IPC通信          | チャンネル定義、リクエスト/レスポンス型     | `interfaces-*.md`, `api-*.md`   |
| Preload          | 公開API一覧、セキュリティ考慮事項           | `security-api-electron.md`      |

---

## 参照資料

| 参照資料               | パス                                                       | 内容                                         |
| ---------------------- | ---------------------------------------------------------- | -------------------------------------------- |
| 正本（全体仕様）       | `docs/30-workflows/skill-creator-llm-integration/index.md` | AC/FR定義・アーキテクチャ・型設計            |
| 仕様書更新ワークフロー | `references/spec-update-workflow.md`                       | システム仕様書更新手順                       |
| 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md`                       | P1, P2, P3, P4, P29, P38, P43, P51, P56, P59 |
| タスク実行ルール       | `.claude/rules/05-task-execution.md`                       | Phase 12 チェックリスト                      |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                | パス                                                                       | 内容                                        |
| ----------------------- | -------------------------------------------------------------------------- | ------------------------------------------- |
| Skill Creator UI/UX仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-skill-creator.md` | TerminalHandoff経路・承認フロー・進捗UI仕様 |

### IPC チャンネル

| チャンネル名                 | 用途                 |
| ---------------------------- | -------------------- |
| `skill-creator:execute-plan` | スキル生成プラン実行 |
| `skill:create`               | 旧 UI 互換スキル生成 |

---

## 成果物

| 成果物                       | パス                                            | 必須 | 説明                                                |
| ---------------------------- | ----------------------------------------------- | ---- | --------------------------------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`      | Yes  | 概念的+技術的ドキュメント                           |
| テスト結果報告書             | `outputs/phase-12/test-results-report.md`       | Yes  | 全 5 シナリオ PASS/FAIL・カバレッジ・パフォーマンス |
| 全体完了レポート             | `outputs/phase-12/overall-completion-report.md` | Yes  | タスク 01〜08 全完了確認・AC/NFR 充足表             |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`   | Yes  | 更新履歴                                            |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md` | Yes  | 検出結果（なしでも出力）                            |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`     | Yes  | 改善点（なしでも出力必須）                          |
| 未完了タスク指示書           | `docs/30-workflows/unassigned-task/*.md`        | 条件 | 検出時のみ作成                                      |

---

## 苦戦箇所の記録【推奨】

タスク実行中に苦戦した箇所があれば、以下に記録する。将来の類似タスクの参考になる。

### 記録テンプレート

```markdown
## 苦戦箇所

### 1. {{問題の概要}}

- **症状**: {{発生した問題の具体的な症状}}
- **原因**: {{問題の根本原因}}
- **解決策**: {{採用した解決策}}
- **学び**: {{将来のタスクへの教訓}}
- **関連Pitfall**: {{該当する場合はPitfall ID（例: P31）}}
```

苦戦箇所が0件の場合でも、成果物に「苦戦箇所なし（0件）」を明記する。

### 苦戦箇所を未タスク化する3ステップ（P3準拠）

苦戦箇所を記録した場合は、以下を同一ターンで実行する。

1. `docs/30-workflows/unassigned-task/` に未タスク指示書を作成する
2. `task-workflow.md` の残課題テーブルへ登録する
3. 関連仕様書に未タスク参照リンクを追加する

---

## 漏れやすいポイント（06-known-pitfalls.md 参照）

| ID       | ポイント                        | 対策                                                                |
| -------- | ------------------------------- | ------------------------------------------------------------------- |
| P1       | LOGS.md 2ファイル更新漏れ       | aiworkflow-requirements + task-specification-creator 両方を同時更新 |
| P2       | topic-map.md 再生成忘れ         | セクション変更時は必ず `generate-index.js` を実行                   |
| P3 / P38 | 未タスク管理の3ステップ不完全   | (1)指示書 → (2)task-workflow.md登録 → (3)関連仕様書リンク           |
| P4       | changelog への早期「完了」記載  | 全 Step 完了後に記録する                                            |
| P29      | SKILL.md 変更履歴の更新漏れ     | LOGS.md とは別に SKILL.md の変更履歴テーブルも必ず更新              |
| P43      | ドキュメント整合性              | 実装と仕様書の整合性を確認する                                      |
| P51      | テスト結果報告書不備            | カバレッジ数値・パフォーマンス計測結果を含める                      |
| P56      | 再評価クローズ Issue 未 Close   | GitHub Issue を Close する                                          |
| P59      | 並列エージェント changelog 競合 | 全 Task 完了後に統合記録する                                        |

---

## フォールバック手順

スクリプトが存在しない場合の代替手順:

| スクリプト                            | 代替手順                                                                                                         |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `generate-documentation-changelog.js` | 手動で `outputs/phase-12/documentation-changelog.md` を作成                                                      |
| `complete-phase.js`                   | 手動で `artifacts.json` を更新（参照: `docs/30-workflows/completed-tasks/TASK-4-1-ipc-channels/artifacts.json`） |
| `detect-unassigned-tasks.js`          | 手動で各Phaseのレビュー結果・発見課題を確認し、unassigned-task-detection.md を作成                               |
| `validate-phase-output.js`            | 手動で成果物の存在と完了条件を確認                                                                               |

---

## スキル検証

```bash
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
```

判定基準: `spec-update-workflow.md` Step 1-G.3.1 を参照。3スキル全てが Error 0件であること。

---

## 完了条件

- [ ] 実行タスクを「表」と「`- Task 12-X:` 箇条書き」の両方で記載している
- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] テスト結果報告書が作成されている（カバレッジ数値・パフォーマンス計測結果含む -- P51 対策）
- [ ] 全体完了レポートが作成されている（AC-1〜AC-8・NFR-1〜NFR-4 充足表含む）
- [ ] **【Task 12-2 Step 1-A】** aiworkflow-requirements/LOGS.md にタスク完了エントリを追加した
- [ ] **【Task 12-2 Step 1-A】** task-specification-creator/LOGS.md にタスク完了記録を追加した（P1 対策）
- [ ] **【Task 12-2 Step 1-A】** aiworkflow-requirements/SKILL.md 変更履歴テーブルを更新した（P29 対策）
- [ ] **【Task 12-2 Step 1-A】** task-specification-creator/SKILL.md 変更履歴テーブルを更新した（P29 対策）
- [ ] **【Task 12-2 Step 1-D】** topic-map.md を再生成した（P2 対策）
- [ ] **【Task 12-2 Step 2】** システム仕様更新の要否を判断し、documentation-changelog.md に記録した
- [ ] **【Task 12-3】** documentation-changelog.md 記録完了（P4 / P59 対策: 全 Step 完了後）
- [ ] **【Task 12-3】** artifacts.json が更新されている
- [ ] **【Task 12-4】** 未タスク検出レポートが出力されている（0 件でも必須）
- [ ] **【Task 12-4】** 検出した未タスクの 3 ステップ完了（P3 / P38 対策）
- [ ] **【Task 12-4】** 再評価クローズ Issue の GitHub Close 完了（P56 対策）
- [ ] **【Task 12-5】** スキルフィードバックレポートが出力されている（改善点なしでも作成必須）
- [ ] 苦戦箇所セクションを記録した（0件でも明記）
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション

- [ ] 本Phase内の全タスク（5タスク: Task 12-1〜12-5）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] 成果物の整合性を最終チェック（P43 対策）

---

## 依存関係

- **前提**: Phase 11 が完了していること（手動テスト全 PASS）
- **後続**: Phase 13（PR作成）へ進む

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
## Phase 12 実行記録

### 実行タスク

- Task 12-1（技術ドキュメント作成）:
- Task 12-2（システムドキュメント更新）:
- Task 12-3（ドキュメント更新履歴 & artifacts.json 更新）:
- Task 12-4（未タスク検出）:
- Task 12-5（スキルフィードバックレポート作成）:

### Task 12-1 成果物確認

- implementation-guide.md（Part 1 + Part 2）: 作成済み / 未作成
- test-results-report.md: 作成済み / 未作成
- overall-completion-report.md: 作成済み / 未作成

### Task 12-2 完了記録

- LOGS.md 2ファイル更新: 完了 / 未完了
- SKILL.md 変更履歴更新: 完了 / 未完了
- topic-map.md 再生成: 完了 / 未完了
- システム仕様更新: 更新あり / 更新なし（理由: ）

### Task 12-4 未タスク検出結果

- 検出件数: X 件
- 指示書作成: 完了 / 該当なし

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/w5b-sc-e2e-terminal-handoff/phase-13-completion.md`
