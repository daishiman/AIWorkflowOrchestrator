# task-9 UI/バックエンド整合再監査と依存順序再設計 - タスク指示書

## メタ情報

| 項目         | 内容                                                              |
| ------------ | ----------------------------------------------------------------- |
| タスクID     | TASK-IMP-TASK9-UI-BE-CONSISTENCY-001                              |
| タスク名     | task-9 UI/バックエンド整合再監査と依存順序再設計                  |
| 分類         | 改善                                                              |
| 対象機能     | task-9（9A, 9D-9J）と UIタスク（task-030/031/032）、task-10A 統合 |
| 優先度       | 高                                                                |
| 見積もり規模 | 中規模                                                            |
| ステータス   | 未実施                                                            |
| 発見元       | Phase 12 相当レビュー（仕様整合監査）                             |
| 発見日       | 2026-02-22                                                        |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

task-9 系の仕様は「バックエンド仕様（task-9\*.md）」と「UI仕様（task-030/031/032）」に分割されているが、契約境界（IPC引数、戻り値、イベント購読、日時型）でドリフトが残っている。
また、未タスク仕様書の配置・命名が分散しており、順序がファイル名から読み取りにくい状態だったため、`docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/` に集約して連番命名へ統一した。

### 1.2 問題点・課題

- task-9 の対象8ファイル（9A, 9D-9J）は存在するが、UIとの契約を跨ぐ要件が未整合。
- `task-020b-task-9a-skill-editor.md` のファイル操作IPCが positional 引数で記述され、`api-ipc-agent.md` の object 契約と不一致。
- `task-022-task-9f-skill-share.md` の `skill:import` が既存 `skill:import`（skillName string）と用途衝突。
- `task-9f/9g/9j` に Date フィールドが残り、IPC境界でのシリアライズ方針（ISO 8601）が未明記。
- `task-9h` の `DebugSession.status` と `05B` の `DebugControlsProps` に `idle` 差分がある。
- `task-030-ui-05-skill-center-view.md` の `DocPreviewProps.onExport` がバックエンド export フローと噛み合っていない。
- `skill:debug:event` の購読パターン（safeOn + cleanup）が 05B 側で不足。
- task-9 と UI/統合対象ファイルの実装順序がファイル名単位で明文化されていない。

### 1.3 放置した場合の影響

- 実装時に P44/P45（IPC契約ドリフト）を再発し、実装者ごとに前提が分裂する。
- フロントエンド先行実装時のモック契約とバックエンド実装が一致せず、再実装コストが増える。
- task-10A-D 統合で UI-Backend 接続の破綻が後段で顕在化する。
- 未タスク配置が分散し、追跡漏れが継続する。

---

## 2. 何を達成するか（What）

### 2.1 目的

task-9 の8ファイルと UI仕様（05/05A/05B）を1つの契約体系に再統合し、task-10A 統合前に依存順序・並列可否・データ受け渡しルールを固定する。

### 2.2 最終ゴール

- task-9 対象8ファイルの要件トレーサビリティが 8/8 で確認できる。
- IPC契約（引数/戻り値/イベント）が aiworkflow-requirements 正本と一致する。
- task-9 / UI / 統合ファイルの実装順序と並列実行範囲がファイル名ベースで明文化される。
- `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/` 配下に本未タスク仕様書を配置し、配置ドリフトを抑止する。

### 2.3 スコープ

#### 含むもの

- task-9 の8ファイル（9A, 9D, 9E, 9F, 9G, 9H, 9I, 9J）と UI仕様（05, 05A, 05B）の契約整合監査
- task-10A-A/B/C/D への依存順序再設計
- バックエンド先行/フロントエンド先行（Mock-first）の実装パターン定義
- 実装苦戦箇所と再発防止策の明記

#### 含まないもの

- 実コード実装（Main/Preload/Renderer の本体変更）
- task-9B サービス内部アルゴリズムの再設計
- task-10A UIデザイン刷新

### 2.4 成果物

| 成果物                    | パス                                                                                                                                                  |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 本未タスク仕様書          | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-013-task9-ui-backend-consistency-improvements-001.md` |
| 対象トレーサビリティ対象1 | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-020b-task-9a-skill-editor.md`                         |
| 対象トレーサビリティ対象2 | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023e-task-9d-skill-chain.md`                          |
| 対象トレーサビリティ対象3 | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023f-task-9e-skill-fork.md`                           |
| 対象トレーサビリティ対象4 | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-022-task-9f-skill-share.md`                           |
| 対象トレーサビリティ対象5 | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023a-task-9g-skill-schedule.md`                       |
| 対象トレーサビリティ対象6 | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023b-task-9h-skill-debug.md`                          |
| 対象トレーサビリティ対象7 | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023c-task-9i-skill-docs.md`                           |
| 対象トレーサビリティ対象8 | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023d-task-9j-skill-analytics.md`                      |
| UI整合対象                | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-030-ui-05-skill-center-view.md`                       |
| UI整合対象                | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-031a-ui-05a-skill-editor-view.md`                     |
| UI整合対象                | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-031b-ui-05b-skill-advanced-views.md`                  |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-9B`（skill-creator基盤）と `TASK-9C`（分析/改善基盤）の仕様が参照可能であること
- aiworkflow-requirements 正本を参照できること

### 3.2 依存タスク

| タスク         | 関係     | 説明                           |
| -------------- | -------- | ------------------------------ |
| TASK-9B        | 先行必須 | task-9D-J のバックエンド基盤   |
| TASK-9A        | 先行推奨 | 05A（エディターUI）の契約基盤  |
| TASK-9C        | 先行必須 | 10A-B/10A-D の分析・改善API    |
| TASK-UI-05     | 先行必須 | 05A/05B のレイアウト・責務境界 |
| TASK-10A-A/B/C | 先行必須 | TASK-10A-D 統合前提            |

### 3.3 必要な知識

- IPC契約: `api-ipc-agent.md` の skill ファイル操作契約（object request）
- セキュリティ契約: `security-electron-ipc.md` の P44/P45/P42 防止パターン
- 実装パターン: `architecture-implementation-patterns.md` の safeInvoke/safeOn, P44 修正テンプレート
- スキル仕様正本: `interfaces-agent-sdk-skill.md` の skill API 契約

### 3.4 推奨アプローチ（SubAgent分担）

| SubAgent                       | 担当                                   | 出力                         |
| ------------------------------ | -------------------------------------- | ---------------------------- |
| SubAgent-A（契約監査）         | IPC チャネル名・引数・戻り値の整合確認 | 契約差分リスト               |
| SubAgent-B（データフロー監査） | Date/enum/event の境界型確認           | 型変換ルール表               |
| SubAgent-C（UI責務監査）       | 05/05A/05B と task-9 の責務境界確認    | 8ファイル対応マトリクス      |
| SubAgent-D（順序設計）         | task-9/UI/統合ファイルの順序設計       | 実装順序表（ファイル名付き） |

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                        | 発見経緯                          | 解決策                                                                                                  | 教訓                                         |
| --------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `skill:import` チャネル競合 | 9F と 05 の仕様照合で発見         | 外部ソース用を `skill:importFromSource` に分離                                                          | 既存チャネル再利用時は用途衝突を先に監査する |
| Date 型の境界不整合         | 9F/9G/9J と UI Props の照合で発見 | IPC境界は ISO 8601 string、ドメイン内部は Date を許容                                                   | ドメイン型と IPC 型を分離して記述する        |
| Debug セッション状態差分    | 9H と 05B の型比較で発見          | `idle` を含む状態遷移を統一し初期状態を明記                                                             | UI側の表示状態は API 契約に先に反映する      |
| 未タスク配置ドリフト        | 旧配置で検出                      | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/` に正規配置 | 物理配置チェックを Phase 12 の必須項目にする |

---

## 4. 実行手順

### 実装順序（ファイル名ベース）

| 順序 | ファイル                                                                                                                                      | 実施内容                                                            | 並列可否            |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------- |
| 1    | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-020a-task-9b-skill-creator.md`                | 共通基盤契約の固定（9D-9J前提）                                     | 直列                |
| 2    | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-010a-ut-skill-import-channel-conflict-001.md` | `skill:import` と `skill:importFromSource` の競合解消仕様を先に確定 | 直列                |
| 3    | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-010b-ut-ipc-data-flow-type-gaps-001.md`       | Date/status/export/event の型ギャップ仕様を先に確定                 | 直列                |
| 4    | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-012-ut-skill-ipc-preload-extension-001.md`    | 9D-J の30チャネル拡張計画（channels/preload/types）を確定           | 直列                |
| 5    | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-020b-task-9a-skill-editor.md`                 | ファイル操作IPC契約を正本仕様へ整合                                 | 直列                |
| 6    | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-022-task-9f-skill-share.md`                   | import/export系チャネル定義を確定                                   | 直列                |
| 7    | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023a-task-9g-skill-schedule.md`               | Schedule系日時型のIPC境界定義                                       | 並列                |
| 8    | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023b-task-9h-skill-debug.md`                  | Debug status/event契約の統一                                        | 並列                |
| 9    | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023c-task-9i-skill-docs.md`                   | Docs exportフローの契約統一                                         | 並列                |
| 10   | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023d-task-9j-skill-analytics.md`              | Analytics日時型と返却契約の統一                                     | 並列                |
| 11   | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023e-task-9d-skill-chain.md`                  | Chain系契約確認（30チャネル計画反映後）                             | 並列                |
| 12   | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023f-task-9e-skill-fork.md`                   | Fork系契約確認（05側UI連携確認）                                    | 並列                |
| 13   | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-030-ui-05-skill-center-view.md`               | 9E/9F/9I UI契約を反映                                               | 直列（6/9/12後）    |
| 14   | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-031a-ui-05a-skill-editor-view.md`             | 9A 契約に合わせて I/F 固定                                          | 直列（5後）         |
| 15   | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-031b-ui-05b-skill-advanced-views.md`          | 9D/9G/9H/9J UI契約を反映                                            | 直列（7/8/10/11後） |
| 16   | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-041a-task-10a-a-management-panel.md`          | 統合UI 入口の確定                                                   | 並列                |
| 17   | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-041b-task-10a-b-analysis-view.md`             | 分析UIの接続確定                                                    | 並列                |
| 18   | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-041c-task-10a-c-create-wizard.md`             | 作成UIの接続確定                                                    | 並列                |
| 19   | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-042-task-10a-d-integration.md`                | 10A最終統合（ChatPanel連携）                                        | 直列（16-18後）     |

### Wave 1: 契約凍結

#### 目的

重実装前に契約差分（チャネル名、引数形式、型境界、イベント購読）を固定する。

#### 手順

1. 8ファイル対応マトリクス（9A/9D-9J ↔ 05/05A/05B）を作成する
2. IPC契約差分（P44/P45）とデータ型差分（Date/enum）を確定する
3. UT 3ファイル（`task-010` CHANNEL-CONFLICT → `task-011` TYPE-GAPS → `task-012` IPC-PRELOAD-EXTENSION）を先行順序として固定する
4. 実装順序表（上表）を確定し、全メンバーの共通前提にする

#### 成果物

- 契約差分リスト
- 8ファイル対応マトリクス
- 実装順序表（ファイル名付き）

#### 完了条件

- 8/8 の対応関係が示されている
- 差分が「修正対象ファイル + 修正ルール」で定義されている

### Wave 2: バックエンド契約整合

#### 目的

フロントエンドが依存する Main/Preload 契約を先に固定する。

#### 手順

1. `task-020a-task-9b-skill-creator.md` → `task-020b-task-9a-skill-editor.md` → `task-022-task-9f-skill-share.md` を直列で確認する
2. `task-012-ut-skill-ipc-preload-extension-001.md` を基準に channels/preload/types の追加方針を固定する
3. `task-023a-task-9g-skill-schedule.md` / `task-023b-task-9h-skill-debug.md` / `task-023c-task-9i-skill-docs.md` / `task-023d-task-9j-skill-analytics.md` / `task-023e-task-9d-skill-chain.md` / `task-023f-task-9e-skill-fork.md` を並列で確認する
4. 返却型・イベント型・日時型を IPC 境界型へ統一する

#### 成果物

- バックエンド契約整合ログ

#### 完了条件

- 10A-A/B/C が参照する API が全て定義済み
- チャネル競合がゼロ

### Wave 3: UI契約反映

#### 目的

バックエンド契約確定後に UI 側仕様を同一契約へ同期する。

#### 手順

1. `task-030-ui-05-skill-center-view.md` を 9E/9F/9I 契約に合わせて更新する
2. `task-031a-ui-05a-skill-editor-view.md` を 9A 契約に合わせて更新する
3. `task-031b-ui-05b-skill-advanced-views.md` を 9D/9G/9H/9J 契約に合わせて更新する

#### 成果物

- UI-Backend データ受け渡し表

#### 完了条件

- UI Props とバックエンド DTO の契約差分がゼロ
- Mock 依存なしで統合可能

### Wave 4: 10A 統合

#### 目的

Task-10A の統合で、ライフサイクル全体を破綻なく接続する。

#### 手順

1. `task-041a-task-10a-a-management-panel.md` / `task-041b-task-10a-b-analysis-view.md` / `task-041c-task-10a-c-create-wizard.md` を並列で確認する
2. `task-042-task-10a-d-integration.md` で統合する
3. 主要シナリオ（作成→分析→改善→編集→共有）を通しで検証する

#### 成果物

- 統合検証ログ

#### 完了条件

- フロントエンド/バックエンド間の主要フローで契約逸脱がない

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] task-9 対象8ファイルの対応関係が 8/8 で明示されている
- [ ] IPC チャネルの用途衝突（特に `skill:import`）が解消されている
- [ ] Debug イベント購読が safeOn + cleanup で定義されている

### 品質要件

- [ ] P44/P45/P42/P5 の再発防止観点が各修正に紐づいている
- [ ] Date 系フィールドの IPC 境界ルールが統一されている
- [ ] UI 側 Props とバックエンド DTO の責務境界が明確である

### ドキュメント要件

- [ ] 本仕様書が `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/` に配置されている
- [ ] 参照先が aiworkflow-requirements 正本に紐づいている
- [ ] 実装苦戦箇所と解決策が記載されている

---

## 6. 検証方法

### テストケース

- Case 1: task-9a IPC 引数形式が object 契約と一致する
- Case 2: task-9f と 05 の import 系チャネルが用途分離されている
- Case 3: task-9h と 05B の sessionStatus が一致する
- Case 4: task-9f/9g/9j の日時型ルールが明文化される
- Case 5: task-10A-D で 10A-A/B/C の依存順序が破綻しない

### 検証手順

```bash
# 8ファイル実在確認
ls -1 docs/30-workflows/skill-import-agent-system/tasks/task-9{a,d,e,f,g,h,i,j}-*.md | wc -l

# import チャネル競合確認
rg -n 'skill:importFromSource|skill:import\\b' \
  docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-022-task-9f-skill-share.md \
  docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-030-ui-05-skill-center-view.md

# Date 境界仕様確認
rg -n 'Date;|ISO 8601|toISOString' \
  docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-022-task-9f-skill-share.md \
  docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023a-task-9g-skill-schedule.md \
  docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023d-task-9j-skill-analytics.md

# debug 状態/イベント購読確認
rg -n 'idle|skill:debug:event|safeOn|onDebugEvent' \
  docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023b-task-9h-skill-debug.md \
  docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-031b-ui-05b-skill-advanced-views.md
```

---

## 7. リスクと対策

| リスク                                        | 影響度 | 発生確率 | 対策                                                   |
| --------------------------------------------- | ------ | -------- | ------------------------------------------------------ |
| 仕様差分を修正せず実装が先行する              | 高     | 中       | Phase 1 完了前は実装着手禁止ルールを設定               |
| 並列区間で UI モック契約が崩れる              | 高     | 中       | UI 側の型定義を IPC 正式型から生成する                 |
| 既存未タスクとの重複                          | 中     | 中       | 既存UTを参照し、重複は統合・差分のみ追加               |
| 実装順序表を無視して着手し P44/P45 が再発する | 高     | 低       | ファイル名ベースの順序表を Definition of Done に含める |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-020b-task-9a-skill-editor.md`
- `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023e-task-9d-skill-chain.md`
- `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023f-task-9e-skill-fork.md`
- `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-022-task-9f-skill-share.md`
- `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023a-task-9g-skill-schedule.md`
- `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023b-task-9h-skill-debug.md`
- `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023c-task-9i-skill-docs.md`
- `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023d-task-9j-skill-analytics.md`
- `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-030-ui-05-skill-center-view.md`
- `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-031a-ui-05a-skill-editor-view.md`
- `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-031b-ui-05b-skill-advanced-views.md`

### システム仕様書スキル（aiworkflow-requirements）参照

- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`
- `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`
- `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`
- `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`

### 参考未タスク（既存）

- `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-010b-ut-ipc-data-flow-type-gaps-001.md`
- `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-010a-ut-skill-import-channel-conflict-001.md`
- `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-012-ut-skill-ipc-preload-extension-001.md`

---

## 9. 備考

### レビュー指摘の原文（要約）

```text
task-9 の8ファイルを漏れなく確認し、UI/バックエンドの依存順序とデータ受け渡しの矛盾をなくすこと。
未タスク仕様書は docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/ に配置すること。
```

### 補足事項

- `task-9` と UIタスク（task-030/031/032）のどちらか一方だけを更新すると再ドリフトするため、常にペア更新を前提とする。
