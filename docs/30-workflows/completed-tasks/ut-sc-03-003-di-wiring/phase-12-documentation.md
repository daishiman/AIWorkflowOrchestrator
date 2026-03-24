# Phase 12: ドキュメント

## メタ情報

| 項目       | 値                         |
| ---------- | -------------------------- |
| Phase      | 12                         |
| タスクID   | UT-SC-03-003               |
| 親タスクID | TASK-SC-03-PLAN-LLM-PROMPT |
| 作成日     | 2026-03-23                 |

## 目的

DI 配線実装の成果物をドキュメント化し、システム仕様書を最新状態に更新する。未タスクを漏れなく検出・登録し、Phase 12 チェックリストの全項目を完了する。

## 実行タスク

### Task 1: 実装ガイド

#### Part 1: 中学生レベル概念説明（日常例え必須）

レストランの厨房に例えて Setter Injection パターンを説明する。

- **例え**: レストランの厨房では、シェフ（RuntimeSkillCreatorFacade）はオープン前に基本的な調理器具（ResourceLoader）を最初から持っている。しかし、特別な電動ミキサー（LLMAdapter）は業者からの配達を待つ必要がある。配達が届いたら厨房スタッフが「これ使ってください」とシェフに渡す（setLLMAdapter()）。配達が届く前にお客さんから注文が来たら、シェフは手動で代替調理する（スタブ応答による graceful degradation）。
- **ポイント**:
  - 最初から持てるもの（ResourceLoader）はコンストラクタで渡す = コンストラクタ注入
  - 後から届くもの（LLMAdapter）は届いてから渡す = Setter Injection
  - 届く前でも注文には応じる = graceful degradation

#### Part 2: 開発者向け技術詳細

- `setLLMAdapter(adapter: ILLMAdapter): void` のシグネチャと使用方法
- ipc/index.ts での fire-and-forget 非同期配線コード例
- `LLMAdapterFactory.getAdapter("anthropic")` の呼び出しパターン
- readonly 解除による型安全性のトレードオフと、setter 内でのバリデーション方針
- P34（遅延初期化 DI パターン選択）準拠の設計判断根拠

成果物: `docs/30-workflows/ut-sc-03-003-di-wiring/implementation-guide.md`

### Task 2: システム仕様書更新

#### Step 1-A: タスク完了記録

- [ ] `.claude/skills/aiworkflow-requirements/LOGS.md` にタスク完了記録を追加
- [ ] `.claude/skills/task-specification-creator/LOGS.md` にタスク完了記録を追加（**2ファイル両方** — P1/P25 対策）
- [ ] `.claude/skills/aiworkflow-requirements/SKILL.md` 変更履歴テーブルを更新
- [ ] `.claude/skills/task-specification-creator/SKILL.md` 変更履歴テーブルを更新

#### Step 1-B: 実装状況テーブル更新

- [ ] 該当する場合、`api-endpoints.md` 等の実装ステータスを更新

#### Step 1-C: 関連タスクテーブル更新

- [ ] `grep -rn "UT-SC-03-003" references/` で関連仕様書を検索
- [ ] `grep -rn "TASK-SC-03" references/` で親タスクの関連仕様書を検索
- [ ] 検出された仕様書の関連タスクテーブルを更新

#### Step 1-D: topic-map.md 再生成（P2/P27 対策）

- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行
- [ ] `indexes/topic-map.md` が更新されたことを確認
- [ ] `indexes/keywords.json` が更新されたことを確認

#### Step 2: システム仕様更新

RuntimeSkillCreatorFacade の setLLMAdapter インターフェース追加に伴う仕様書更新:

- [ ] `interfaces-agent-sdk-skill.md`: setLLMAdapter() メソッドの追加を記録
- [ ] `arch-electron-services.md`: RuntimeSkillCreatorFacade の DI 構成図を更新（該当する場合）
- [ ] `architecture-implementation-patterns.md`: Setter Injection パターンの適用事例を追加（該当する場合）

### Task 3: documentation-changelog.md

- [ ] 更新した全仕様書の変更内容を記録
- [ ] 各 Step の完了結果を詳細に記録（P4/P51 対策: 全 Step 確認前に「完了」と記載しない）
- [ ] `git diff --stat -- .claude/skills/` で実際の変更ファイル数を検証（P43 対策）

成果物: `docs/30-workflows/ut-sc-03-003-di-wiring/documentation-changelog.md`

### Task 4: 未タスク検出レポート

- [ ] `unassigned-task-report.md` を作成（**0件でも必須** — P3 対策）
- [ ] 検出した未タスクは3ステップ全完了（P3/P38 対策）:
  1. `docs/30-workflows/unassigned-task/` に指示書作成
  2. `task-workflow.md` 残課題テーブルに登録
  3. 関連仕様書に参照リンク追加
- [ ] `unassigned-task-detection.md` の件数・ステータス更新
- [ ] `artifacts.json` の Phase 12 ステータスを更新
- [ ] 再評価クローズした未タスクの GitHub Issue を `gh issue close` で同時に Close（P56 対策）
- [ ] documentation-changelog.md の検出件数と `unassigned-task-detection.md` の件数が一致すること（P59 対策）

成果物: `docs/30-workflows/ut-sc-03-003-di-wiring/unassigned-task-report.md`

### Task 5: スキルフィードバックレポート

- [ ] ワークフロー改善点の検討（改善点がなくても「改善点なし」として記録 — P28 対策）
- [ ] DI 配線パターンの再利用可能性の評価
- [ ] Setter Injection vs Constructor Injection の判断基準の文書化状況を確認

成果物: `docs/30-workflows/ut-sc-03-003-di-wiring/skill-feedback-report.md`

## 参照資料

| 資料名                            | パス / 参照先                                           |
| --------------------------------- | ------------------------------------------------------- |
| Phase 12 チェックリスト           | `.claude/rules/05-task-execution.md#Phase 12`           |
| P1: LOGS.md 2ファイル更新漏れ     | `.claude/rules/06-known-pitfalls.md#P1`                 |
| P2: topic-map.md 再生成忘れ       | `.claude/rules/06-known-pitfalls.md#P2`                 |
| P3: 未タスク管理の3ステップ不完全 | `.claude/rules/06-known-pitfalls.md#P3`                 |
| P4: changelog への早期完了記載    | `.claude/rules/06-known-pitfalls.md#P4`                 |
| P28: スキルフィードバック未作成   | `.claude/rules/06-known-pitfalls.md#P28`                |
| P34: 遅延初期化 DI パターン選択   | `.claude/rules/06-known-pitfalls.md#P34`                |
| P43: サブエージェント rate limit  | `.claude/rules/06-known-pitfalls.md#P43`                |
| P51: サブエージェント早期完了記載 | `.claude/rules/06-known-pitfalls.md#P51`                |
| P56: 再評価クローズ Issue Close   | `.claude/rules/06-known-pitfalls.md#P56`                |
| P59: 並列エージェント件数不整合   | `.claude/rules/06-known-pitfalls.md#P59`                |
| Mirror Sync 手順                  | MEMORY.md#Mirror Sync の仕組み                          |
| spec-update-workflow.md           | `.claude/skills/task-specification-creator/references/` |

## 成果物

| 成果物                       | パス                                                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------------------------------- |
| 実装ガイド                   | `docs/30-workflows/ut-sc-03-003-di-wiring/implementation-guide.md`                                      |
| documentation-changelog      | `docs/30-workflows/ut-sc-03-003-di-wiring/documentation-changelog.md`                                   |
| 未タスク検出レポート         | `docs/30-workflows/ut-sc-03-003-di-wiring/unassigned-task-report.md`                                    |
| スキルフィードバックレポート | `docs/30-workflows/ut-sc-03-003-di-wiring/skill-feedback-report.md`                                     |
| 更新済みシステム仕様書       | `.claude/skills/aiworkflow-requirements/references/` 配下の該当ファイル                                 |
| 更新済み LOGS.md (x2)        | `.claude/skills/aiworkflow-requirements/LOGS.md`, `.claude/skills/task-specification-creator/LOGS.md`   |
| 更新済み SKILL.md (x2)       | `.claude/skills/aiworkflow-requirements/SKILL.md`, `.claude/skills/task-specification-creator/SKILL.md` |
| 更新済み topic-map.md        | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                                           |

## 完了条件

- [ ] Task 1: 実装ガイド Part 1（日常例え）と Part 2（技術詳細）が作成されている
- [ ] Task 2 Step 1-A: LOGS.md が2ファイルとも更新されている
- [ ] Task 2 Step 1-A: SKILL.md が2ファイルとも更新されている
- [ ] Task 2 Step 1-C: 関連タスクテーブルが更新されている
- [ ] Task 2 Step 1-D: topic-map.md が再生成されている
- [ ] Task 2 Step 2: RuntimeSkillCreatorFacade の setLLMAdapter インターフェースが仕様書に反映されている
- [ ] Task 3: documentation-changelog.md が全 Step の結果を記録している
- [ ] Task 4: unassigned-task-report.md が作成されている（0件でも）
- [ ] Task 4: 検出件数が documentation-changelog と unassigned-task-detection で一致している
- [ ] Task 5: スキルフィードバックレポートが作成されている
- [ ] Mirror Sync: `.claude/skills/` と `.agents/skills/` が同期されている（`diff -qr` で 0 差分）

## 多角的チェック観点（AIが判断）

| 観点               | 適用 | チェック内容                                                                         |
| ------------------ | ---- | ------------------------------------------------------------------------------------ |
| アーキテクチャ     | Yes  | DI配線がレイヤー依存方向（Main→Services）を遵守しているか                            |
| IPC通信            | Yes  | RuntimeSkillCreatorFacade への依存注入が IPC ハンドラ登録と整合しているか            |
| エラーハンドリング | Yes  | graceful degradation（llmAdapter/resourceLoader 未注入時のスタブ返却）が維持されるか |

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 成果物の作成・配置
4. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次の Phase

Phase 13: 完了・PR 準備（`phase-13-completion.md`）
