# Phase 12: ドキュメント更新

## メタ情報

| 項目    | 値                |
| ------- | ----------------- |
| Phase   | 12                |
| 機能名  | skill-creator-ipc |
| 作成日  | 2026-02-12        |
| 次Phase | Phase 13: PR作成  |

## 目的

実装内容をシステム要件ドキュメントに反映し、技術ドキュメントを作成する。Phase 1-11を通じて検出された未完了タスクを整理し、後続対応のための指示書を作成する。

> **最重要**: Phase 12 は漏れが最も発生しやすい Phase。全項目を逐次確認すること。
> 失敗事例: 06-known-pitfalls.md P1-P4, P25-P28, P29-P31

## 実行タスク

### Task 1: 実装ガイド作成（Part 1 + Part 2）

| パート | 対象読者         | 内容                                                                              |
| ------ | ---------------- | --------------------------------------------------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的説明（中学生でもわかる版）-- 日常例え必須（例: 「学校の事務室の窓口統一」） |
| Part 2 | 開発者・技術者   | チャンネル定義、ハンドラー実装、Preload API、型定義の技術詳細                     |

#### Part 1: 中学生レベル概念説明（日常例え必須）

以下の内容を含めること。

##### IPCを「学校の連絡帳」に例える

- **先生（Main Process）** と **生徒（Renderer）** は直接話せない
- **連絡帳（Preload/IPC）** を使って伝言する仕組み
- なぜ直接話せないか: セキュリティのため（知らない人が勝手に先生に頼みごとをできないようにする）

##### skill-creator IPCは「新しい連絡事項の種類を追加した」

| 連絡事項（チャンネル）          | 日常の例え                                 |
| ------------------------------- | ------------------------------------------ |
| `skill-creator:detect-mode`     | 「今日の授業は何？」と聞く                 |
| `skill-creator:create`          | 「新しいノートを作って」とお願いする       |
| `skill-creator:execute-tasks`   | 「宿題をやって」とお願いする               |
| `skill-creator:validate`        | 「テストの答え合わせをして」とお願いする   |
| `skill-creator:validate-schema` | 「ノートの書き方が合っているか確認して」   |
| `skill-creator:progress`        | 先生から「ここまで終わったよ」と報告が来る |

##### ホワイトリストは「許可された連絡事項リスト」

- リストにない内容は受け付けない（セキュリティ）
- 例: 「お菓子を買って」は連絡事項リストにないので拒否される

##### 必須要件

- 日常生活での例え話を含める
- 専門用語は使わない（使う場合は即座に平易な言葉で説明する）

#### Part 2: 開発者向け技術詳細

以下の内容を含めること。

- SkillCreatorAPI TypeScriptインターフェース定義（全メソッドのシグネチャ）
- 各チャンネルのシグネチャと使用例（コードスニペット付き）
- エラーハンドリングパターン（Result型、エラーサニタイズ）
- 設定可能なパラメータと定数一覧（IPC_CHANNELS定数）
- Preload層の実装パターン（safeInvoke/safeOn使用）
- セキュリティ実装パターン（validateIpcSender、validatePath）

### Task 2: システムドキュメント更新（Step 1 + Step 2）

> spec-update-workflow.md 準拠で実施する。

#### Step 1-A: タスク完了記録【全項目必須確認】

| #   | 対象ファイル                          | 更新内容                                            | 完了 |
| --- | ------------------------------------- | --------------------------------------------------- | ---- |
| 1   | `security-skill-ipc.md`               | TASK-9B-H完了タスクセクション追加                   | [ ]  |
| 2   | `interfaces-agent-sdk-skill.md`       | TASK-9B-H完了タスクセクション追加                   | [ ]  |
| 3   | `arch-ipc-persistence.md`             | TASK-9B-H完了タスクセクション追加                   | [ ]  |
| 4   | `aiworkflow-requirements/LOGS.md`     | タスク完了記録追加                                  | [ ]  |
| 5   | `task-specification-creator/LOGS.md`  | タスク完了記録追加（**P1/P25対策: 2ファイル両方**） | [ ]  |
| 6   | `aiworkflow-requirements/SKILL.md`    | 変更履歴テーブル更新                                | [ ]  |
| 7   | `task-specification-creator/SKILL.md` | 変更履歴テーブル更新（**P29対策**）                 | [ ]  |

#### Step 1-B: 実装状況テーブル更新（該当する場合）

| #   | 対象ファイル                    | 更新内容                                                           | 完了 |
| --- | ------------------------------- | ------------------------------------------------------------------ | ---- |
| 1   | `interfaces-agent-sdk-skill.md` | skill-creatorチャンネル（6つ）の実装ステータスを「実装済み」に更新 | [ ]  |

#### Step 1-C: 関連タスクテーブル更新

| #   | アクション                                            | 完了 |
| --- | ----------------------------------------------------- | ---- |
| 1   | `grep -rn "TASK-9B-H" references/` で関連仕様書を検索 | [ ]  |
| 2   | 検出された関連仕様書のタスクテーブルを更新            | [ ]  |

#### Step 1-D: topic-map.md 再生成（P2/P27対策）

| #   | アクション                          | 完了 |
| --- | ----------------------------------- | ---- |
| 1   | `node generate-index.js` を実行     | [ ]  |
| 2   | topic-map.md が更新されたことを確認 | [ ]  |

> 仕様書に変更があれば必ず再生成を実行する。セクションの追加・削除・更新のいずれもトリガーとなる。

#### Step 2: システム仕様更新【必須 -- 新規インターフェース追加あり】

| #   | 対象ファイル                    | 更新内容                                                                                                                            | 完了 |
| --- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---- |
| 1   | `security-skill-ipc.md`         | SkillCreator IPCチャネルセキュリティセクション追加（チャンネル一覧、validateIpcSender適用、validatePath適用、エラーサニタイズ仕様） | [ ]  |
| 2   | `interfaces-agent-sdk-skill.md` | SkillCreatorService IPCチャンネルセクション追加（SkillCreatorAPI型定義、メソッド一覧、引数・戻り値型）                              | [ ]  |
| 3   | `arch-ipc-persistence.md`       | registerAllIpcHandlers更新（SkillCreatorService追加、registerSkillCreatorHandlers呼び出し記録）                                     | [ ]  |

### Task 3: documentation-changelog.md作成

| #   | 要件                                             | 完了 |
| --- | ------------------------------------------------ | ---- |
| 1   | 更新した全仕様書の変更内容を記録                 | [ ]  |
| 2   | 各Stepの完了結果を詳細に記録                     | [ ]  |
| 3   | **全Step確認前に「完了」と記載しない（P4対策）** | [ ]  |

### Task 4: 未タスク検出（0件でも出力必須）

#### 検出ソース一覧

| #   | ソース                 | 確認項目                                                                | 完了 |
| --- | ---------------------- | ----------------------------------------------------------------------- | ---- |
| 1   | Phase 3レビュー結果    | MINOR判定の指摘事項                                                     | [ ]  |
| 2   | Phase 10レビュー結果   | MINOR判定の指摘事項                                                     | [ ]  |
| 3   | Phase 11手動テスト結果 | スコープ外の発見事項                                                    | [ ]  |
| 4   | 各Phase成果物          | 「将来対応」「TODO」「FIXME」の記載                                     | [ ]  |
| 5   | コードベース           | `grep -rn "TODO\|FIXME\|HACK\|XXX"` でTODO/FIXME/HACK/XXXコメントを検出 | [ ]  |

#### 未タスク管理3ステップ（P3対策）

検出した未タスクごとに以下の3ステップを全て完了すること。

| ステップ | 内容                                              | 完了 |
| -------- | ------------------------------------------------- | ---- |
| 1        | `docs/30-workflows/unassigned-task/` に指示書作成 | [ ]  |
| 2        | `task-workflow.md` 残課題テーブルに登録           | [ ]  |
| 3        | 関連仕様書に参照リンク追加                        | [ ]  |

#### 追加チェック

| #   | チェック項目                                          | 完了 |
| --- | ----------------------------------------------------- | ---- |
| 1   | `unassigned-task-detection.md` の件数・ステータス更新 | [ ]  |
| 2   | `artifacts.json` の Phase 12 ステータスを更新         | [ ]  |

## 参照資料

| 資料名                   | パス                                                                              | 説明                                             |
| ------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------ |
| スキルIPCセキュリティ    | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`         | validatePath、safeInvoke/safeOn、3層セキュリティ |
| SkillCreatorService仕様  | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | API仕様、型定義、SkillCreatorMode                |
| IPC・永続化パターン      | `.claude/skills/aiworkflow-requirements/references/arch-ipc-persistence.md`       | Pattern 3、registerAllIpcHandlers                |
| Electron IPCセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | sender検証、CSP、BrowserWindow設定               |
| Agent Dashboard IPC      | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | 既存チャンネル命名一貫性                         |
| Phase 1-11全成果物       | `docs/30-workflows/skill-creator-ipc/outputs/`                                    | 全Phase成果物                                    |
| spec-update-workflow.md  | `.claude/skills/aiworkflow-requirements/references/spec-update-workflow.md`       | ドキュメント更新手順                             |
| タスク実行ワークフロー   | `.claude/rules/05-task-execution.md`                                              | Phase 12チェックリスト                           |
| 既知の落とし穴           | `.claude/rules/06-known-pitfalls.md`                                              | P1-P4, P25-P31対策                               |

## 実行手順

### 手順 1: 実装ガイド作成（Task 1）

1. `outputs/phase-12/implementation-guide.md` を作成する
2. Part 1（中学生レベル概念説明）を日常例え付きで記述する
3. Part 2（開発者向け技術詳細）をTypeScript型定義・コードスニペット付きで記述する
4. 禁止表現（「適切に」「必要に応じて」）が含まれていないことを確認する

### 手順 2: システム仕様書更新 Step 1-A（Task 2）

1. `security-skill-ipc.md` に完了タスクセクションを追加する
2. `interfaces-agent-sdk-skill.md` に完了タスクセクションを追加する
3. `arch-ipc-persistence.md` に完了タスクセクションを追加する
4. `aiworkflow-requirements/LOGS.md` にタスク完了記録を追加する
5. `task-specification-creator/LOGS.md` にタスク完了記録を追加する（P1/P25対策: 2ファイル両方）
6. `aiworkflow-requirements/SKILL.md` の変更履歴テーブルを更新する
7. `task-specification-creator/SKILL.md` の変更履歴テーブルを更新する（P29対策）

### 手順 3: システム仕様書更新 Step 1-B/1-C/1-D（Task 2）

1. `interfaces-agent-sdk-skill.md` のskill-creatorチャンネル実装ステータスを更新する
2. `grep -rn "TASK-9B-H" references/` で関連仕様書を検索して更新する
3. `node generate-index.js` を実行して topic-map.md を再生成する（P2/P27対策）

### 手順 4: システム仕様書更新 Step 2（Task 2）

1. `security-skill-ipc.md` にSkillCreator IPCチャネルセキュリティセクションを追加する
2. `interfaces-agent-sdk-skill.md` にSkillCreatorService IPCチャンネルセクションを追加する
3. `arch-ipc-persistence.md` のregisterAllIpcHandlersにSkillCreatorService追加を記録する

### 手順 5: documentation-changelog.md 作成（Task 3）

1. 更新した全仕様書の変更内容を記録する
2. 各Stepの完了結果を詳細に記録する
3. 全Step確認前に「完了」と記載しない（P4対策）

### 手順 6: 未タスク検出（Task 4）

1. Phase 3レビュー結果からMINOR指摘を抽出する
2. Phase 10レビュー結果からMINOR指摘を抽出する
3. Phase 11手動テスト結果からスコープ外発見事項を抽出する
4. 各Phase成果物から「将来対応」「TODO」「FIXME」を検索する
5. コードベースから `grep -rn "TODO\|FIXME\|HACK\|XXX"` で検出する
6. 検出した未タスクに対して3ステップ（指示書・テーブル・リンク）を全て完了する
7. 0件の場合も `unassigned-task-detection.md` に「0件」として出力する

### 手順 7: artifacts.json 更新

1. `artifacts.json` の Phase 12 ステータスを `completed` に更新する

## 統合テスト連携【必須】

| テスト項目       | 確認内容                                       | 期待結果                                                        | 実行結果   |
| ---------------- | ---------------------------------------------- | --------------------------------------------------------------- | ---------- |
| 実装ガイド整合性 | Part 2の技術詳細が実装コードと一致するか       | 型定義、チャンネル名、メソッドシグネチャが実装と完全一致        | {{RESULT}} |
| 仕様書更新整合性 | 更新した仕様書の内容が実装と一致するか         | チャンネル数、セキュリティ設定、型定義が実装と一致              | {{RESULT}} |
| LOGS.md整合性    | 2ファイルのLOGS.mdに同一内容が記録されているか | aiworkflow-requirementsとtask-specification-creatorの両方に記録 | {{RESULT}} |
| topic-map.md更新 | topic-map.mdが最新の仕様書構成を反映しているか | generate-index.js実行後のtopic-map.mdが最新                     | {{RESULT}} |

## 多角的チェック観点

| 観点             | 確認内容                                             | 判定基準                                               |
| ---------------- | ---------------------------------------------------- | ------------------------------------------------------ |
| 網羅性           | 全仕様書が漏れなく更新されているか                   | Step 1-A/1-B/1-C/1-D/Step 2の全項目チェック済み        |
| 正確性           | 仕様書の技術内容が実装と一致するか                   | 型定義、チャンネル名、セキュリティ設定が実装と完全一致 |
| 一貫性           | 2ファイルのLOGS.md/SKILL.mdの内容が一致するか        | P1/P25/P29対策チェック済み                             |
| 完全性           | 未タスク検出が5つの検出ソース全てで実施されているか  | 全検出ソースチェック済み                               |
| トレーサビリティ | documentation-changelog.mdに全変更が記録されているか | 各Stepの結果が詳細に記録済み                           |

## 成果物

| 成果物               | パス                                            | 説明                                   |
| -------------------- | ----------------------------------------------- | -------------------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | Part 1（概念説明）+ Part 2（技術詳細） |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`   | 全仕様書の変更記録と各Stepの完了結果   |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | 検出結果（0件でも出力）                |

## 完了条件

- [ ] 【Task 1】Part 1（概念的説明・日常例え）作成済み
- [ ] 【Task 1】Part 2（技術的詳細・TypeScript型定義・コードスニペット）作成済み
- [ ] 【Task 2 Step 1-A】security-skill-ipc.mdに完了タスクセクション追加済み
- [ ] 【Task 2 Step 1-A】interfaces-agent-sdk-skill.mdに完了タスクセクション追加済み
- [ ] 【Task 2 Step 1-A】arch-ipc-persistence.mdに完了タスクセクション追加済み
- [ ] 【Task 2 Step 1-A】aiworkflow-requirements/LOGS.md更新済み
- [ ] 【Task 2 Step 1-A】task-specification-creator/LOGS.md更新済み（**P1/P25対策: 2ファイル両方**）
- [ ] 【Task 2 Step 1-A】aiworkflow-requirements/SKILL.md変更履歴更新済み
- [ ] 【Task 2 Step 1-A】task-specification-creator/SKILL.md変更履歴更新済み（**P29対策**）
- [ ] 【Task 2 Step 1-B】interfaces-agent-sdk-skill.md実装ステータス更新済み
- [ ] 【Task 2 Step 1-C】`grep -rn "TASK-9B-H" references/` 実行済み、関連仕様書更新済み
- [ ] 【Task 2 Step 1-D】`node generate-index.js` 実行済み、topic-map.md再生成済み（**P2/P27対策**）
- [ ] 【Task 2 Step 2】security-skill-ipc.md: SkillCreator IPCチャネルセキュリティセクション追加済み
- [ ] 【Task 2 Step 2】interfaces-agent-sdk-skill.md: SkillCreatorService IPCチャンネルセクション追加済み
- [ ] 【Task 2 Step 2】arch-ipc-persistence.md: registerAllIpcHandlers更新済み
- [ ] 【Task 3】documentation-changelog.md作成済み（全Step結果記録済み）
- [ ] 【Task 4】未タスク検出レポート出力済み（0件でも必須）
- [ ] 【Task 4】検出した未タスクの3ステップ（指示書・テーブル・リンク）全完了（**P3対策**）
- [ ] artifacts.json Phase 12ステータス更新済み
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

| サブタスクID | タスク名                                  | 依存関係                     | ステータス |
| ------------ | ----------------------------------------- | ---------------------------- | ---------- |
| 12-1         | 実装ガイドPart 1作成                      | なし                         | 未着手     |
| 12-2         | 実装ガイドPart 2作成                      | なし                         | 未着手     |
| 12-3         | Step 1-A: タスク完了記録（7ファイル更新） | なし                         | 未着手     |
| 12-4         | Step 1-B: 実装状況テーブル更新            | 12-3                         | 未着手     |
| 12-5         | Step 1-C: 関連タスクテーブル更新          | 12-3                         | 未着手     |
| 12-6         | Step 1-D: topic-map.md再生成              | 12-3, 12-4, 12-5             | 未着手     |
| 12-7         | Step 2: システム仕様更新（3ファイル）     | 12-3                         | 未着手     |
| 12-8         | documentation-changelog.md作成            | 12-3, 12-4, 12-5, 12-6, 12-7 | 未着手     |
| 12-9         | 未タスク検出（5ソース確認 + 3ステップ）   | 12-1, 12-2, 12-7             | 未着手     |
| 12-10        | artifacts.json更新                        | 12-8, 12-9                   | 未着手     |

## タスク100%実行確認【必須】

| 確認項目                                                | ステータス |
| ------------------------------------------------------- | ---------- |
| Task 1（実装ガイド）Part 1 + Part 2 作成完了            | [ ]        |
| Task 2 Step 1-A（タスク完了記録）7ファイル全て更新完了  | [ ]        |
| Task 2 Step 1-B（実装状況テーブル）更新完了             | [ ]        |
| Task 2 Step 1-C（関連タスクテーブル）grep実行・更新完了 | [ ]        |
| Task 2 Step 1-D（topic-map.md）再生成完了               | [ ]        |
| Task 2 Step 2（システム仕様更新）3ファイル更新完了      | [ ]        |
| Task 3（documentation-changelog.md）作成完了            | [ ]        |
| Task 4（未タスク検出）5ソース確認・レポート出力完了     | [ ]        |
| artifacts.json Phase 12 ステータス更新完了              | [ ]        |

## 次のPhase

[Phase 13: PR作成](phase-13-pr-creation.md)
