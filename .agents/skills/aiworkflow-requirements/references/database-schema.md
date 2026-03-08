# データベーススキーマ設計

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 概要

Turso統一アーキテクチャにおけるテーブル設計とインデックス戦略。
基盤アーキテクチャについては [database-architecture.md](./database-architecture.md) を参照。

## テーブル一覧

| テーブル | 用途 | 実装状況 |
|----------|------|----------|
| workflows | ワークフロー定義 | 設計済み |
| workflow_steps | ワークフローステップ | 設計済み |
| workflow_executions | 実行履歴 | 設計済み |
| user_settings | ユーザー設定 | 設計済み |
| user_profiles | ユーザープロフィール（Supabase） | ✅ 実装済み |
| api_keys | APIキー管理 | 設計済み |
| audit_logs | 監査ログ | 設計済み |
| sync_metadata | 同期メタデータ | 設計済み |
| system_prompt_templates | システムプロンプトテンプレート | ✅ 実装済み |
| chat_sessions | チャットセッション | ✅ 実装済み |
| chat_messages | チャットメッセージ | ✅ 実装済み |
| files | RAGファイルメタデータ | ✅ 実装済み |
| chunks | RAGチャンク + FTS5 | ✅ 実装済み |
| conversions | ファイル変換履歴 | ✅ 実装済み |
| conversion_logs | 変換処理ログ | 設計済み |
| entities | Knowledge Graphノード | ✅ 実装済み |
| relations | Knowledge Graphエッジ | ✅ 実装済み |
| relation_evidence | 関係の証拠チャンク | ✅ 実装済み |
| communities | Leidenクラスター | ✅ 実装済み |
| entity_communities | エンティティ-コミュニティ中間 | ✅ 実装済み |
| chunk_entities | チャンク-エンティティ中間 | ✅ 実装済み |

## ワークフロー関連テーブル

### workflows（ワークフロー定義）

| カラム | 型 | NULL | 説明 |
|--------|------|------|------|
| id | TEXT | NO | UUID主キー |
| name | TEXT | NO | ワークフロー名 |
| description | TEXT | YES | 説明文 |
| config | JSON | NO | トリガー設定、変数などの構造化データ |
| status | TEXT | NO | draft / active / paused / archived |
| created_at | TEXT | NO | 作成日時（ISO8601形式） |
| updated_at | TEXT | NO | 更新日時（ISO8601形式） |
| deleted_at | TEXT | YES | 削除日時（ソフトデリート用） |

### workflow_steps（ワークフローステップ）

| カラム | 型 | NULL | 説明 |
|--------|------|------|------|
| id | TEXT | NO | UUID主キー |
| workflow_id | TEXT | NO | 親ワークフローへの外部キー（CASCADE DELETE） |
| name | TEXT | NO | ステップ名 |
| type | TEXT | NO | agent_task / approval / condition / loop / parallel |
| order | INTEGER | NO | 実行順序（1から連番） |
| config | JSON | NO | ステップ固有の設定 |
| created_at | TEXT | NO | 作成日時 |

### workflow_executions（実行履歴）

| カラム | 型 | NULL | 説明 |
|--------|------|------|------|
| id | TEXT | NO | UUID主キー |
| workflow_id | TEXT | NO | 実行したワークフローへの外部キー |
| status | TEXT | NO | pending / running / completed / failed / cancelled |
| started_at | TEXT | NO | 実行開始日時 |
| completed_at | TEXT | YES | 実行完了日時 |
| result | JSON | YES | 実行結果（output または error） |
| context | JSON | NO | 実行時のコンテキスト情報 |

## ユーザー関連テーブル

### user_profiles（Supabase）

| カラム | 型 | NULL | 説明 |
|--------|------|------|------|
| id | TEXT | NO | UUID主キー（auth.users.id と同一） |
| display_name | TEXT | NO | 表示名（3-30文字） |
| email | TEXT | NO | メールアドレス |
| avatar_url | TEXT | YES | アバター画像URL |
| plan | TEXT | NO | プラン（free/pro/enterprise） |
| timezone | TEXT | YES | タイムゾーン（デフォルト: Asia/Tokyo） |
| locale | TEXT | YES | ロケール（デフォルト: ja） |
| notification_settings | JSON | YES | 通知設定 |
| preferences | JSON | YES | ユーザー設定（拡張用） |
| created_at | TEXT | NO | 作成日時 |
| updated_at | TEXT | NO | 更新日時 |
| deleted_at | TEXT | YES | 削除日時（ソフトデリート用） |

### api_keys（APIキー管理）

| カラム | 型 | NULL | 説明 |
|--------|------|------|------|
| id | TEXT | NO | UUID主キー |
| user_id | TEXT | NO | user_settingsへの外部キー |
| name | TEXT | NO | キーの用途識別名 |
| key_hash | TEXT | NO | 暗号化されたAPIキー |
| service | TEXT | NO | anthropic / openai / google / other |
| scopes | JSON | NO | 権限スコープ配列 |
| expires_at | TEXT | YES | 有効期限 |
| last_used_at | TEXT | YES | 最終使用日時 |
| revoked_at | TEXT | YES | 無効化日時 |
| created_at | TEXT | NO | 作成日時 |

## システムプロンプト関連テーブル

> **実装**: `packages/shared/src/repositories/system-prompt-repository.ts`
> **マイグレーション**: `apps/desktop/src/main/migration/electron-store-migration.ts`
> **タスク**: TASK-CHAT-SYSPROMPT-DB-001（2026-01-22完了）

### system_prompt_templates（システムプロンプトテンプレート）

ユーザーのシステムプロンプトテンプレートを永続化。プリセットテンプレートとカスタムテンプレートを管理し、オフライン対応とクラウド同期を実現。

| カラム | 型 | NULL | 説明 |
|--------|------|------|------|
| id | TEXT | NO | UUID主キー（v4形式） |
| user_id | TEXT | NO | 所有者のユーザーID |
| name | TEXT | NO | テンプレート名（1-50文字） |
| content | TEXT | NO | プロンプト内容（1-4000文字） |
| is_preset | INTEGER | NO | プリセットフラグ（0=カスタム, 1=プリセット） |
| created_at | TEXT | NO | 作成日時（ISO8601形式） |
| updated_at | TEXT | NO | 更新日時（ISO8601形式） |

**インデックス**:

| インデックス | カラム | 用途 |
|--------------|--------|------|
| system_prompt_templates_user_id_idx | user_id | ユーザー別テンプレート取得 |
| system_prompt_templates_name_idx | name | 名前検索 |
| system_prompt_templates_is_preset_idx | is_preset | プリセットフィルタ |
| system_prompt_templates_user_name_unq | user_id, name | 名前重複防止（UNIQUE） |

**制約**:

- PRIMARY KEY (id): UUID形式の一意識別子
- NOT NULL (user_id, name, content): 必須項目
- UNIQUE (user_id, name): 同一ユーザー内で名前の重複を禁止

---

## チャット関連テーブル

### chat_sessions（チャットセッション）

| カラム | 型 | NULL | 説明 |
|--------|------|------|------|
| id | TEXT | NO | UUID主キー（v4） |
| user_id | TEXT | NO | ユーザーID |
| title | TEXT | NO | セッションタイトル（3〜100文字） |
| created_at | TEXT | NO | 作成日時（ISO 8601形式、UTC） |
| updated_at | TEXT | NO | 最終更新日時 |
| message_count | INTEGER | NO | メッセージ総数（非正規化） |
| is_favorite | INTEGER | NO | お気に入りフラグ（0/1） |
| is_pinned | INTEGER | NO | ピン留めフラグ（0/1） |
| pin_order | INTEGER | YES | ピン留め時の表示順序（1〜10） |
| last_message_preview | TEXT | YES | 最終メッセージのプレビュー（最大50文字） |
| metadata | JSON | NO | 拡張メタデータ |
| deleted_at | TEXT | YES | 削除日時（ソフトデリート用） |

### chat_messages（チャットメッセージ）

| カラム | 型 | NULL | 説明 |
|--------|------|------|------|
| id | TEXT | NO | UUID主キー（v4） |
| session_id | TEXT | NO | 親セッションID（ON DELETE CASCADE） |
| role | TEXT | NO | メッセージロール（user / assistant） |
| content | TEXT | NO | メッセージ本文（1〜100,000文字） |
| message_index | INTEGER | NO | セッション内の順序（0から連番） |
| timestamp | TEXT | NO | メッセージ送信日時 |
| llm_provider | TEXT | YES | LLMプロバイダー名 |
| llm_model | TEXT | YES | LLMモデル名 |
| llm_metadata | JSON | YES | トークン使用量、応答時間等 |
| attachments | JSON | NO | 添付ファイル情報 |
| system_prompt | TEXT | YES | システムプロンプト |
| metadata | JSON | NO | 拡張メタデータ |

## RAG関連テーブル

### files（RAGファイルメタデータ）

| カラム | 型 | NULL | 説明 |
|--------|------|------|------|
| id | TEXT | NO | 主キー（ULID形式推奨） |
| name | TEXT | NO | ファイル名 |
| path | TEXT | NO | ファイルの絶対パス |
| mime_type | TEXT | NO | MIMEタイプ |
| category | TEXT | NO | ファイルカテゴリ |
| size | INTEGER | NO | ファイルサイズ（バイト） |
| hash | TEXT | NO | SHA-256ハッシュ（UNIQUE） |
| encoding | TEXT | NO | 文字エンコーディング |
| last_modified | INTEGER | NO | 最終更新日時 |
| metadata | JSON | NO | カスタムメタデータ |
| created_at | INTEGER | NO | 作成日時（UNIX時刻） |
| updated_at | INTEGER | NO | 更新日時 |
| deleted_at | INTEGER | YES | 削除日時（ソフトデリート） |

### chunks（RAGチャンク + FTS5）

| カラム | 型 | NULL | 説明 |
|--------|------|------|------|
| id | TEXT | NO | UUID主キー |
| file_id | TEXT | NO | 親ファイルID（CASCADE DELETE） |
| content | TEXT | NO | チャンク本文（FTS5同期） |
| contextual_content | TEXT | YES | コンテキスト付きテキスト |
| chunk_index | INTEGER | NO | ファイル内順序 |
| start_line | INTEGER | YES | 開始行番号 |
| end_line | INTEGER | YES | 終了行番号 |
| parent_header | TEXT | YES | 親見出しテキスト |
| strategy | TEXT | NO | チャンキング戦略 |
| token_count | INTEGER | YES | トークン数 |
| hash | TEXT | NO | SHA-256ハッシュ（UNIQUE） |
| prev_chunk_id | TEXT | YES | 前のチャンクID |
| next_chunk_id | TEXT | YES | 次のチャンクID |
| overlap_tokens | INTEGER | NO | オーバーラップトークン数 |
| metadata | JSON | YES | 拡張メタデータ |
| created_at | INTEGER | NO | 作成日時 |
| updated_at | INTEGER | NO | 更新日時 |

## Knowledge Graph関連テーブル

> **実装**: `packages/shared/src/db/schema/graph/`
> **マイグレーション**: `packages/shared/drizzle/migrations/0003_spotty_callisto.sql`

GraphRAG基盤となるKnowledge Graphを構成する6テーブル群。エンティティ（ノード）、リレーション（エッジ）、コミュニティ（クラスター）を管理し、RAGチャンクとの関連付けを実現。

### entities（エンティティ/ノード）

| カラム | 型 | NULL | 説明 |
|--------|------|------|------|
| id | TEXT | NO | 主キー（UUID） |
| name | TEXT | NO | エンティティ名 |
| type | TEXT | NO | エンティティ種別（Person, Organization等） |
| description | TEXT | YES | エンティティの説明 |
| embedding | BLOB | YES | ベクトル埋め込み（将来実装） |
| importance_score | REAL | YES | 重要度スコア（0.0-1.0） |
| mention_count | INTEGER | NO | 出現回数（デフォルト: 1） |
| first_seen_at | INTEGER | YES | 初回検出日時 |
| last_seen_at | INTEGER | YES | 最終検出日時 |
| metadata | JSON | YES | 拡張メタデータ |
| created_at | INTEGER | NO | 作成日時（UNIX時刻） |
| updated_at | INTEGER | NO | 更新日時 |
| deleted_at | INTEGER | YES | 削除日時（ソフトデリート） |

**インデックス**:

| インデックス | カラム | 用途 |
|--------------|--------|------|
| entities_name_idx | name | 名前検索 |
| entities_type_idx | type | 種別フィルタ |
| entities_importance_idx | importance_score | 重要度ソート |
| entities_deleted_at_idx | deleted_at | アクティブレコード取得 |

### relations（リレーション/エッジ）

| カラム | 型 | NULL | 説明 |
|--------|------|------|------|
| id | TEXT | NO | 主キー（UUID） |
| source_entity_id | TEXT | NO | 起点エンティティID（CASCADE DELETE） |
| target_entity_id | TEXT | NO | 終点エンティティID（CASCADE DELETE） |
| relation_type | TEXT | NO | 関係種別（WORKS_FOR, LOCATED_IN等） |
| description | TEXT | YES | 関係の説明 |
| weight | REAL | YES | 関係の強さ（0.0-1.0） |
| evidence_count | INTEGER | NO | 根拠チャンク数（デフォルト: 1） |
| metadata | JSON | YES | 拡張メタデータ |
| created_at | INTEGER | NO | 作成日時 |
| updated_at | INTEGER | NO | 更新日時 |
| deleted_at | INTEGER | YES | 削除日時（ソフトデリート） |

**インデックス**:

| インデックス | カラム | 用途 |
|--------------|--------|------|
| relations_source_idx | source_entity_id | 起点からの探索 |
| relations_target_idx | target_entity_id | 終点からの探索 |
| relations_type_idx | relation_type | 関係種別フィルタ |
| relations_source_target_idx | source_entity_id, target_entity_id | 重複チェック |
| relations_deleted_at_idx | deleted_at | アクティブレコード取得 |

### relation_evidence（関係の証拠）

| カラム | 型 | NULL | 説明 |
|--------|------|------|------|
| id | TEXT | NO | 主キー（UUID） |
| relation_id | TEXT | NO | リレーションID（CASCADE DELETE） |
| chunk_id | TEXT | NO | 根拠チャンクID（SET NULL） |
| confidence | REAL | YES | 信頼度スコア（0.0-1.0） |
| extracted_text | TEXT | YES | 抽出テキスト |
| created_at | INTEGER | NO | 作成日時 |

**インデックス**:

| インデックス | カラム | 用途 |
|--------------|--------|------|
| relation_evidence_relation_idx | relation_id | リレーション別証拠取得 |
| relation_evidence_chunk_idx | chunk_id | チャンク別証拠取得 |

### communities（コミュニティ/クラスター）

| カラム | 型 | NULL | 説明 |
|--------|------|------|------|
| id | TEXT | NO | 主キー（UUID） |
| name | TEXT | NO | コミュニティ名 |
| summary | TEXT | YES | コミュニティ要約 |
| level | INTEGER | NO | 階層レベル（デフォルト: 0） |
| parent_community_id | TEXT | YES | 親コミュニティID（SET NULL） |
| embedding | BLOB | YES | ベクトル埋め込み（将来実装） |
| entity_count | INTEGER | NO | 所属エンティティ数（デフォルト: 0） |
| metadata | JSON | YES | 拡張メタデータ |
| created_at | INTEGER | NO | 作成日時 |
| updated_at | INTEGER | NO | 更新日時 |

**インデックス**:

| インデックス | カラム | 用途 |
|--------------|--------|------|
| communities_level_idx | level | 階層レベルフィルタ |
| communities_parent_idx | parent_community_id | 親子関係探索 |

### entity_communities（エンティティ-コミュニティ中間テーブル）

| カラム | 型 | NULL | 説明 |
|--------|------|------|------|
| entity_id | TEXT | NO | エンティティID（CASCADE DELETE） |
| community_id | TEXT | NO | コミュニティID（CASCADE DELETE） |

**制約**: 複合主キー（entity_id, community_id）

**インデックス**:

| インデックス | カラム | 用途 |
|--------------|--------|------|
| entity_communities_entity_idx | entity_id | エンティティ別所属取得 |
| entity_communities_community_idx | community_id | コミュニティ別メンバー取得 |

### chunk_entities（チャンク-エンティティ中間テーブル）

| カラム | 型 | NULL | 説明 |
|--------|------|------|------|
| chunk_id | TEXT | NO | チャンクID（CASCADE DELETE） |
| entity_id | TEXT | NO | エンティティID（CASCADE DELETE） |
| mention_count | INTEGER | NO | チャンク内出現回数（デフォルト: 1） |
| positions | JSON | YES | 出現位置情報 |

**制約**: 複合主キー（chunk_id, entity_id）

**インデックス**:

| インデックス | カラム | 用途 |
|--------------|--------|------|
| chunk_entities_chunk_idx | chunk_id | チャンク別エンティティ取得 |
| chunk_entities_entity_idx | entity_id | エンティティ別チャンク取得 |

## 変換処理関連テーブル

### conversions（ファイル変換履歴）

> **実装**: `packages/shared/src/db/schema/conversions.ts`
> **サービス**: `packages/shared/src/services/history/`

ファイルをMarkdownやプレーンテキストに変換した履歴を記録。変換結果のキャッシング、バージョン管理、エラー追跡に使用。

| カラム | 型 | NULL | 説明 |
|--------|------|------|------|
| id | TEXT | NO | 主キー（ULID形式推奨） |
| file_id | TEXT | NO | filesテーブルへの外部キー（CASCADE DELETE） |
| status | TEXT | NO | 変換ステータス（pending / processing / completed / failed） |
| converter_id | TEXT | NO | 変換エンジン識別子（例: "markdown-converter-v1"） |
| input_hash | TEXT | NO | 入力ファイルのハッシュ値（キャッシュ判定用） |
| output_hash | TEXT | YES | 出力結果のハッシュ値（変換完了時） |
| duration | INTEGER | YES | 変換処理時間（ミリ秒） |
| input_size | INTEGER | YES | 入力ファイルサイズ（バイト） |
| output_size | INTEGER | YES | 出力ファイルサイズ（バイト） |
| error | TEXT | YES | エラーメッセージ（failed時） |
| error_details | JSON | YES | エラー詳細（スタックトレース等） |
| created_at | INTEGER | NO | 作成日時（UNIX時刻） |
| updated_at | INTEGER | NO | 更新日時（UNIX時刻） |

**インデックス**:

| インデックス | カラム | 用途 |
|--------------|--------|------|
| conversions_file_id_idx | file_id | ファイル単位履歴取得 |
| conversions_status_idx | status | ステータス検索 |
| conversions_input_hash_idx | input_hash | キャッシュヒット判定 |
| conversions_created_at_idx | created_at | 時系列ソート |
| conversions_file_status_idx | file_id, status | 複合検索 |

### conversion_logs（変換処理ログ）

> **実装予定**: CONV-05-02 (LogRepository実装タスク)
> **詳細設計**: `docs/30-workflows/logging-service/`

| カラム | 型 | NULL | 説明 |
|--------|------|------|------|
| id | TEXT | NO | UUID主キー |
| file_id | TEXT | NO | 対象ファイルID |
| level | TEXT | NO | ログレベル（info / warn / error） |
| message | TEXT | NO | ログメッセージ |
| metadata | JSON | YES | 追加メタデータ |
| error_stack | TEXT | YES | エラー時のスタックトレース |
| timestamp | TEXT | NO | ログ記録日時（ISO8601形式） |
| created_at | TEXT | NO | 作成日時 |

**インデックス計画**:

| インデックス | カラム | 用途 |
|--------------|--------|------|
| idx_conversion_logs_file_id | file_id | ファイル単位ログ取得 |
| idx_conversion_logs_level | level | レベルフィルタ |
| idx_conversion_logs_timestamp | timestamp | 日付範囲検索 |

## インデックス設計

### ワークフロー関連

| テーブル | インデックス | カラム | 用途 |
|----------|--------------|--------|------|
| workflows | idx_workflows_status | status | ステータス検索 |
| workflows | idx_workflows_deleted_at | deleted_at | アクティブレコード取得 |
| workflow_steps | idx_steps_workflow_id | workflow_id | 親子関係の取得 |
| workflow_steps | idx_steps_order | workflow_id, order | 順序通りの取得 |
| workflow_executions | idx_executions_workflow_id | workflow_id | 履歴検索 |
| workflow_executions | idx_executions_status | status | 実行中/失敗の検索 |

### チャット関連

| テーブル | インデックス | カラム | 用途 |
|----------|--------------|--------|------|
| chat_sessions | idx_chat_sessions_user_id | user_id | ユーザー別セッション取得 |
| chat_sessions | idx_chat_sessions_created_at | created_at | 作成日時降順ソート |
| chat_sessions | idx_chat_sessions_is_pinned | user_id, is_pinned, pin_order | ピン留めセッション |
| chat_messages | idx_chat_messages_session_id | session_id | セッション別メッセージ |
| chat_messages | idx_chat_messages_timestamp | timestamp | 時系列検索 |
| chat_messages | idx_chat_messages_session_message | session_id, message_index | 順序一意性（UNIQUE） |

### RAG関連

| テーブル | インデックス | カラム | 用途 |
|----------|--------------|--------|------|
| files | files_hash_idx | hash | 重複ファイル検出（UNIQUE） |
| files | files_path_idx | path | ファイルパス検索 |
| files | files_mime_type_idx | mime_type | MIMEタイプフィルタ |
| chunks | idx_chunks_file_id | file_id | ファイル単位チャンク取得 |
| chunks | idx_chunks_hash | hash | 重複チャンク検出（UNIQUE） |
| chunks | idx_chunks_chunk_index | file_id, chunk_index | 順序付き取得 |

### Knowledge Graph関連

| テーブル | インデックス | カラム | 用途 |
|----------|--------------|--------|------|
| entities | entities_name_idx | name | 名前検索 |
| entities | entities_type_idx | type | 種別フィルタ |
| entities | entities_importance_idx | importance_score | 重要度ソート |
| entities | entities_deleted_at_idx | deleted_at | アクティブレコード取得 |
| relations | relations_source_idx | source_entity_id | 起点からの探索 |
| relations | relations_target_idx | target_entity_id | 終点からの探索 |
| relations | relations_type_idx | relation_type | 関係種別フィルタ |
| relations | relations_source_target_idx | source_entity_id, target_entity_id | 重複チェック |
| relations | relations_deleted_at_idx | deleted_at | アクティブレコード取得 |
| relation_evidence | relation_evidence_relation_idx | relation_id | リレーション別証拠取得 |
| relation_evidence | relation_evidence_chunk_idx | chunk_id | チャンク別証拠取得 |
| communities | communities_level_idx | level | 階層レベルフィルタ |
| communities | communities_parent_idx | parent_community_id | 親子関係探索 |
| entity_communities | entity_communities_entity_idx | entity_id | エンティティ別所属取得 |
| entity_communities | entity_communities_community_idx | community_id | コミュニティ別メンバー取得 |
| chunk_entities | chunk_entities_chunk_idx | chunk_id | チャンク別エンティティ取得 |
| chunk_entities | chunk_entities_entity_idx | entity_id | エンティティ別チャンク取得 |

---

## 関連ドキュメント

- [データベースアーキテクチャ](./database-architecture.md)
- [データベース実装](./database-implementation.md)
- [コアインターフェース](./interfaces-converter.md)
- [システムプロンプトインターフェース](./interfaces-system-prompt.md)
- [チャット履歴インターフェース](./interfaces-chat-history.md)

---

## 変更履歴

| バージョン | 日付       | 変更内容                                           |
| ---------- | ---------- | -------------------------------------------------- |
| 1.2.0      | 2026-01-24 | chat_sessions/chat_messages Repository/IPC実装完了 |
| 1.1.0      | 2026-01-22 | system_prompt_templates テーブル追加               |
| 1.0.0      | -          | 初版作成                                           |
