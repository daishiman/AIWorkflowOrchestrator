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
