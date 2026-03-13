# 仕様書分割ガイドライン

> 本ドキュメントは aiworkflow-requirements スキルの分割ルールを定義する。

---

## 概要

仕様書が500行を超えた場合、読みやすさと検索性を維持するために分割を検討する。本ガイドラインは、機能領域別・カテゴリ別の分割パターンを定義する。

---

## 分割判断基準

| 行数      | アクション | 説明                       |
| --------- | ---------- | -------------------------- |
| 500行以下 | そのまま   | 適正サイズ                 |
| 500-700行 | 検討       | 論理的な分割点があれば分割 |
| 700行超   | 要分割     | 必ず分割する               |

---

## インターフェース仕様（interfaces-）の分割パターン

大規模なインターフェース仕様は以下のパターンで分割する。

### 分割軸

| 軸           | 説明                | 例                          |
| ------------ | ------------------- | --------------------------- |
| 機能領域     | 関連機能をまとめる  | skill, ui, executor         |
| 実装フェーズ | 開発段階ごと        | core, integration, advanced |
| プロセス     | Electron プロセス別 | main, renderer, preload     |

### 推奨構成（interfaces-{feature}）

| ファイル名                             | 役割                       |
| -------------------------------------- | -------------------------- |
| interfaces-{feature}.md                | インデックス + コア型定義  |
| interfaces-{feature}-{domain1}.md      | ドメイン1の型定義          |
| interfaces-{feature}-{domain2}.md      | ドメイン2の型定義          |
| interfaces-{feature}-{domain3}.md      | ドメイン3の型定義          |
| interfaces-{feature}-history.md        | 完了タスク・変更履歴       |

### インデックスファイルの必須セクション

| セクション         | 内容                           |
| ------------------ | ------------------------------ |
| 概要               | 機能全体の説明                 |
| 仕様書インデックス | 分割ファイル一覧と読み込み条件 |
| アーキテクチャ     | 全体構成図                     |
| コア型定義         | 基本的な型（頻繁に参照される） |
| 関連ドキュメント   | 参照先一覧                     |
| 変更履歴           | 直近の変更のみ                 |

## 2026-03 line budget reform 標準パターン

`TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001` で確立した、aiworkflow skill 向けの実運用標準。
大規模仕様書は「1ファイルを割る」のではなく、「family-wave で入口・履歴・mirror まで一緒に閉じる」前提で扱う。

### family-wave 実行ルール

| ルール | 意図 |
| --- | --- |
| 1 lane / 1 wave あたり 3ファイル以下 | エージェントの責務を小さく保ち、diff の衝突を減らす |
| parent / child / history / archive / discovery を同一 wave で閉じる | 入口切れと orphan shard を防ぐ |
| `.claude` を正本に固定し、`.agents` は最後に mirror sync する | mirror drift を防ぐ |
| Wave 1 の validator 完了前に次 wave へ進まない | 依存崩れを早期に止める |

### parent / companion の必須セット

| 種別 | 必須要素 | 目的 |
| --- | --- | --- |
| parent index | 概要、仕様書インデックス、利用順序、関連ドキュメント | 読み始めの入口を 1 つに固定する |
| detail companion | `core` / `details` / `advanced` / domain-specific child | 過大な H2/H3 セクションを外出しする |
| history companion | `history` / `completed-*` / `lessons-*` | 実装履歴と運用知見を本文から分離する |
| archive companion | `logs-archive-*` などの月次/保管用途 | 現在の読み物と保管ログを切り分ける |
| discovery entry | `quick-reference.md` / `resource-map.md` | 新しい parent へ最短で到達できるようにする |

### 分類先行ルール

rename は命名作業ではなく、**責務分類の確定結果**として行う。
次の順序を踏まずに `-a` / `-b` を semantic filename へ置き換えない。

| 手順 | 判定内容 | 例 |
| --- | --- | --- |
| 1. file type を確定する | `core` / `details` / `advanced` / `reference` / `history` / `archive` のどれか | `task-workflow-completed-*` は `history`、`logs-archive-*` は `archive` |
| 2. primary concern を 1 つ決める | surface / capability / contract / failure-mode / lifecycle stage / platform / audit gate / period | `safeInvoke timeout`, `skill import`, `phase12 audit`, `2026-03 ui` |
| 3. concern が 2 つ以上あるか確認する | 2 つ以上なら rename 前に再分割する | `permissionHistory + lifecycle integration` はそのまま rename しない |
| 4. parent との依存を言語化する | 親から見た読む順番と責務差を固定する | `task-workflow` 親から `completed-ipc-contracts` を読む |
| 5. semantic filename を付ける | `{parent}-{primary-concern}-{role}.md` を基本形にする | `lessons-learned-auth-ipc-timeout.md` |

### ファイル命名ポリシー

`-a` / `-b` / `-1` / `-2` のような順序 suffix ではなく、**責務が名前から読める semantic filename** を使う。
分割は「量で割る」のではなく「関心ごとで割る」が原則。

| ルール | 採用例 | 避ける例 |
| --- | --- | --- |
| 役割を suffix で表す | `interfaces-agent-sdk-skill-core.md`, `ui-ux-settings-history.md` | `interfaces-agent-sdk-skill-a.md` |
| 領域差は concern を名前に出す | `lessons-learned-ui-navigation.md`, `lessons-learned-ui-feedback.md` | `lessons-learned-ui-agent-view-nav-notification-history.md`, `lessons-learned-ui-skill-center-editor-dashboard.md` |
| 台帳や完了記録は domain / scope を名前に出す | `task-workflow-completed-desktop.md`, `task-workflow-completed-integration.md` | `task-workflow-completed-workspace-chat-lifecycle-tests.md` |
| reference 補助資料は topic を名前に出す | `arch-state-management-reference-selectors.md` | `arch-state-management-reference-permissions-import-lifecycle.md` |
| archive は period や retention を名前に出す | `logs-archive-2026-03-auth.md`, `logs-archive-legacy.md` | `logs-archive-a.md` |

### 禁止パターン

| 禁止 | 理由 |
| --- | --- |
| `-a` / `-b` / `-c` のような連番 suffix | 責務がファイル名から分からず、検索・引用・レビューが弱くなる |
| `-part1` / `-part2` のような量基準分割 | 次の分割時に意味境界が壊れる |
| parent と child の責務差が名前に出ない分割 | 依存関係と読む順番が曖昧になる |

### 旧連番 filename migration の扱い

2026-03-13 時点で `references/` 配下の旧 `-a` / `-b` 系ファイルは semantic filename へ移行済み。
今後は**新規作成で使わない**だけでなく、旧 citation や旧 workflow 出力を見つけたら `legacy-ordinal-family-register.md` で current filename へ引き直す。

例:

- `lessons-learned-ui-agent-view-nav-notification-history.md` / `lessons-learned-ui-skill-center-editor-dashboard.md` を増やさず、`lessons-learned-ui-navigation.md` / `lessons-learned-ui-dialogs.md` のように concern で切る
- `task-workflow-completed-workspace-chat-lifecycle-tests.md` を増やさず、`task-workflow-completed-desktop.md` / `task-workflow-completed-workflow.md` のように scope で切る
- `arch-state-management-reference-permissions-import-lifecycle.md` を増やさず、`arch-state-management-reference-selectors.md` / `arch-state-management-reference-navigation.md` のように用途で切る

### legacy ordinal migration matrix（2026-03-13 適用済み）

| family | old axis | semantic naming rule | current status |
| --- | --- | --- | --- |
| `lessons-learned-ui-*` | UI surface / user journey | `agent-view`, `global-nav`, `history-search`, `skill-center`, `dashboard` のように surface で切る | `migrated` |
| `lessons-learned-auth-ipc-*` | contract / failure mode / registration type | `handler-registration`, `contract-bridge`, `preload-timeout`, `ipc-security`, `phase12-audit` のように失敗様式で切る | `migrated` |
| `lessons-learned-skill-*` | skill lifecycle stage / capability | `skill-import`, `skill-create`, `skill-remove`, `skill-validation`, `skill-execute`, `skill-share-debug` のように capability で切る | `migrated` |
| `lessons-learned-workflow-quality-*` | workflow gate / quality concern | `phase12-audit`, `ci-module-resolution`, `sdk-tests`, `line-budget-reform` のように gate で切る | `migrated` |
| `task-workflow-completed-*` | delivery domain / verification lane | `completed-ui-workspace`, `completed-ipc-contracts`, `completed-skill-lifecycle`, `completed-quality-gates` のように lane で切る | `migrated` |
| `logs-archive-YYYY-MM-*` | month + theme | `logs-archive-2026-03-system-spec-sync`, `logs-archive-2026-03-ui-workflows` のように period と theme を両方出す | `migrated` |
| `arch-state-management-reference-*` | state concern / hardening concern | `reference-permissions-history`, `reference-skill-lifecycle`, `reference-persist-hardening`, `reference-test-quality-gate` のように store concern で切る | `migrated` |
| `architecture-implementation-patterns-reference-*` | pattern family / audit family | `reference-ipc-contract-audits`, `reference-agent-view-surface`, `reference-fallback-validation` のように pattern family で切る | `migrated` |
| `interfaces-agent-sdk-skill-reference-*` | skill capability set | `reference-share-debug`, `reference-doc-generation-analytics` のように capability cluster で切る | `migrated` |
| `interfaces-agent-sdk-skill-history-*` | completed task bundle / changelog | `history-completed-contract-fixes`, `history-change-log` のように history type を名前に出す | `migrated` |
| `interfaces-agent-sdk-history-history-*` | timeline / changelog | `history-completed-timeline`, `history-doc-links-change-log` のように history content で切る | `migrated` |
| `ui-ux-feature-components-reference-*` | UI surface cluster / feature history | `reference-organisms-foundation`, `reference-history-notification-surfaces` のように surface cluster で切る | `migrated` |

### generated artifact の扱い

| 対象 | 取り扱い | 理由 |
| --- | --- | --- |
| manual docs | patch + line budget 監査の対象 | 人手で責務分割できるため |
| `topic-map.md` / `keywords.json` | `generate-index.js` 再生成を正本とし、手編集しない | generator 由来の差分を壊さないため |
| oversized generated artifact | 親タスクでは状態記録まで、恒久対応は未タスク化 | docs-only task と script task の責務を分けるため |

### close-out チェックリスト

1. `validate-structure.js` と raw `wc -l` で manual docs の over-limit を確認する。
2. `generate-index.js` を再実行し、generated artifact を最新化する。
3. `diff -qr .claude ... .agents ...` で mirror parity を確認する。
4. `current` / `baseline`、`manual` / `generated`、`links` / `phase outputs` / `validator` を別々に記録する。
5. workflow outputs、`SKILL.md`、`LOGS.md`、`task-workflow`、`lessons-learned` を final state へ同一ターンで同期する。
6. rename の前に family ごとの classification matrix を作成したか確認する。
7. 新規 split filename に `-a` / `-b` / `-1` / `-2` が混入していないことを確認する。

### 分割ファイルの必須セクション

| セクション       | 内容                   |
| ---------------- | ---------------------- |
| 概要             | このファイルが扱う範囲 |
| 実装ファイル     | 対象ソースファイル     |
| アーキテクチャ   | 該当領域の構成図       |
| 型定義           | 詳細な型定義           |
| 使用例           | コード例               |
| 関連ドキュメント | 親ファイルへの参照     |

---

## アーキテクチャ仕様（architecture-）の分割パターン

### 分割軸

| 軸       | 説明             | 例                                   |
| -------- | ---------------- | ------------------------------------ |
| レイヤー | アーキテクチャ層 | presentation, domain, infrastructure |
| 関心事   | 技術的関心事     | security, performance, testing       |
| スコープ | 適用範囲         | system-wide, module-specific         |

### 推奨構成

| ファイル名                    | 役割                           |
| ----------------------------- | ------------------------------ |
| architecture-overview.md      | 全体アーキテクチャ             |
| architecture-{layer}.md       | レイヤー別詳細                 |
| architecture-patterns.md      | 共通パターン                   |
| architecture-decisions.md     | ADR（アーキテクチャ決定記録）  |
| architecture-migration.md     | 移行計画                       |

---

## API仕様（api-）の分割パターン

### 分割軸

| 軸         | 説明          | 例                      |
| ---------- | ------------- | ----------------------- |
| リソース   | REST リソース | users, skills, sessions |
| 通信方式   | プロトコル    | rest, ipc, websocket    |
| バージョン | APIバージョン | v1, v2                  |

### 推奨構成

| ファイル名             | 役割                 |
| ---------------------- | -------------------- |
| api-overview.md        | API全体概要          |
| api-{resource}.md      | リソース別エンドポイント |
| api-ipc-channels.md    | IPCチャンネル一覧    |
| api-errors.md          | エラーコード一覧     |
| api-schemas.md         | 共通スキーマ         |

---

## UI/UX仕様（ui-ux-）の分割パターン

### 分割軸

| 軸                 | 説明          | 例                          |
| ------------------ | ------------- | --------------------------- |
| 画面               | ビュー/ページ | agent-view, settings-view   |
| コンポーネント階層 | Atomic Design | atoms, molecules, organisms |
| 機能               | ユーザー機能  | navigation, forms, dialogs  |

### 推奨構成

| ファイル名                  | 役割               |
| --------------------------- | ------------------ |
| ui-ux-overview.md           | デザインシステム概要 |
| ui-ux-{view}.md             | ビュー別仕様       |
| ui-ux-components.md         | コンポーネント一覧 |
| ui-ux-state-management.md   | 状態管理           |
| ui-ux-accessibility.md      | アクセシビリティ要件 |

---

## セキュリティ仕様（security-）の分割パターン

### 分割軸

| 軸           | 説明         | 例                       |
| ------------ | ------------ | ------------------------ |
| 脅威カテゴリ | 攻撃種別     | injection, xss, auth     |
| 保護対象     | 守るべきもの | data, credentials, api   |
| 実装レイヤー | 実装箇所     | frontend, backend, infra |

### 推奨構成

| ファイル名                | 役割             |
| ------------------------- | ---------------- |
| security-overview.md      | セキュリティポリシー |
| security-threats.md       | 脅威モデル       |
| security-measures.md      | 対策一覧         |
| security-audit.md         | 監査ログ         |
| security-credentials.md   | 認証情報管理     |

---

## データベース仕様（database-）の分割パターン

### 分割軸

| 軸       | 説明           | 例                      |
| -------- | -------------- | ----------------------- |
| ドメイン | データドメイン | users, skills, sessions |
| 操作     | CRUD操作       | queries, mutations      |
| 環境     | 実行環境       | development, production |

### 推奨構成

| ファイル名              | 役割             |
| ----------------------- | ---------------- |
| database-schema.md      | スキーマ定義     |
| database-{domain}.md    | ドメイン別テーブル |
| database-migrations.md  | マイグレーション |
| database-indexes.md     | インデックス設計 |
| database-backup.md      | バックアップ戦略 |

---

## 技術スタック仕様（technology-）の分割パターン

### 分割軸

| 軸             | 説明     | 例                           |
| -------------- | -------- | ---------------------------- |
| カテゴリ       | 技術分野 | frontend, backend, devops    |
| ライフサイクル | 導入段階 | current, deprecated, planned |

### 推奨構成

| ファイル名                    | 役割             |
| ----------------------------- | ---------------- |
| technology-overview.md        | 技術スタック概要 |
| technology-{category}.md      | カテゴリ別詳細   |
| technology-dependencies.md    | 依存関係         |
| technology-upgrade-plan.md    | アップグレード計画 |

---

## ワークフロー仕様（workflow-）の分割パターン

### 分割軸

| 軸           | 説明         | 例                         |
| ------------ | ------------ | -------------------------- |
| フェーズ     | 処理段階     | trigger, process, complete |
| ユースケース | 利用シナリオ | import, export, sync       |

### 推奨構成

| ファイル名                   | 役割           |
| ---------------------------- | -------------- |
| workflow-overview.md         | ワークフロー概要 |
| workflow-{usecase}.md        | ユースケース別詳細 |
| workflow-error-handling.md   | エラー処理     |
| workflow-monitoring.md       | 監視・ログ     |

---

## Claude Code仕様（claude-code-）の分割パターン

### 分割軸

| 軸             | 説明       | 例                            |
| -------------- | ---------- | ----------------------------- |
| 機能種別       | 機能タイプ | skills, agents, commands      |
| ライフサイクル | 実行段階   | definition, execution, result |

### 推奨構成

| ファイル名                    | 役割           |
| ----------------------------- | -------------- |
| claude-code-overview.md       | Claude Code概要 |
| claude-code-skills.md         | スキル仕様     |
| claude-code-agents.md         | エージェント仕様 |
| claude-code-commands.md       | コマンド仕様   |
| claude-code-integration.md    | 統合パターン   |

---

## 分割実行手順

### 1. 分析

分割候補を分析するには、split-reference.js スクリプトを --analyze オプションで実行する。

| コマンド                                     | 説明               |
| -------------------------------------------- | ------------------ |
| node scripts/split-reference.js --analyze    | 分割候補を分析     |

出力例として、以下のような情報が表示される。

| 対象ファイル                | 行数   | 推奨分割数 |
| --------------------------- | ------ | ---------- |
| interfaces-agent-sdk.md     | 4150行 | 6ファイル  |
| ui-ux-components.md         | 850行  | 3ファイル  |

### 2. 設定ファイル作成

分割設定はJSON形式で記述する。設定ファイルには以下の項目を含める。

| 項目        | 説明                 | 必須 |
| ----------- | -------------------- | ---- |
| source      | 分割元ファイル名     | 必須 |
| splits      | 分割定義の配列       | 必須 |

各分割定義（splits配列の要素）には以下を含める。

| 項目        | 説明                     | 必須 |
| ----------- | ------------------------ | ---- |
| name        | 出力ファイル名           | 必須 |
| sections    | 含めるセクション名の配列 | 必須 |
| description | ファイルの説明           | 任意 |

分割設定の例として、interfaces-agent-sdk.md を分割する場合、インデックスファイルには「概要」「アーキテクチャ」「コア型定義」セクションを含め、スキル関連ファイルには「Skill Dashboard」「SkillImportStore」「ModifierSkill」セクションを含める形式で定義する。

### 3. 分割実行

設定ファイルを使用して分割を実行する。

| コマンド                                                                            | 説明           |
| ----------------------------------------------------------------------------------- | -------------- |
| node scripts/split-reference.js --split {対象ファイル} {設定ファイル}               | 分割を実行     |

### 4. 検証

分割後は以下のコマンドで検証を行う。

| コマンド                         | 説明               |
| -------------------------------- | ------------------ |
| node scripts/check-links.js      | リンク切れチェック |
| node scripts/generate-index.js   | インデックス再生成 |

---

## 命名規則

### 分割ファイル命名パターン

ファイル名は「{prefix}-{feature}-{domain}.md」の形式で命名する。

| 要素    | 説明          | 例                           |
| ------- | ------------- | ---------------------------- |
| prefix  | カテゴリ      | interfaces, api, ui-ux       |
| feature | 機能名        | agent-sdk, skill-import      |
| domain  | ドメイン/領域 | skill, ui, executor, history |

### 良い命名例

| ファイル名                        | 説明                           |
| --------------------------------- | ------------------------------ |
| interfaces-agent-sdk.md           | インデックスファイル           |
| interfaces-agent-sdk-skill.md     | スキル関連の型定義             |
| interfaces-agent-sdk-ui.md        | UI関連の型定義                 |
| interfaces-agent-sdk-history.md   | 履歴・変更記録                 |

### 避けるべき命名例

| ファイル名                        | 問題点                         |
| --------------------------------- | ------------------------------ |
| interfaces-agent-sdk-part1.md     | 連番は内容が不明確になる       |
| interfaces-agent-sdk-misc.md      | 曖昧な名前は検索性が低下する   |
| interfaces-agent-sdk-new.md       | 一時的な名前は混乱を招く       |

---

## 分割後のメンテナンス

### インデックスの更新

分割ファイルを追加/削除した場合、インデックスファイルの「仕様書インデックス」テーブルを更新する。

### 相互参照の維持

分割ファイル間で参照がある場合、明示的にリンクを記載する。

### topic-mapの更新

topic-map.md を更新するには、generate-index.js スクリプトを実行する。

| コマンド                         | 説明             |
| -------------------------------- | ---------------- |
| node scripts/generate-index.js   | topic-mapを更新  |

---

## 関連ドキュメント

| ドキュメント       | 説明                   |
| ------------------ | ---------------------- |
| spec-guidelines.md | 仕様書記述ガイドライン |
| topic-map.md       | トピック別インデックス |

---

## 変更履歴

| 日付       | バージョン | 変更内容                                       |
| ---------- | ---------- | ---------------------------------------------- |
| 2026-01-26 | 1.1.0      | 仕様ガイドライン準拠: コード例を表形式・文章に変換 |
| 2026-01-26 | 1.0.0      | 初版作成                                       |
