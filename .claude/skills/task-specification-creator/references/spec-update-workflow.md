# システム仕様更新ワークフロー

> **Progressive Disclosure**
>
> - 読み込みタイミング: Phase 12（ドキュメント更新）実行時
> - 読み込み条件: Phase 12 Task 2実行時（必須）
> - 関連スキル: aiworkflow-requirements

---

## ⚠️ 重要: 2種類の更新アクション

Phase 12では以下の**2種類の更新アクション**があります。混同に注意してください。

| アクション               | 必須 | 条件                               | 更新内容                     |
| ------------------------ | ---- | ---------------------------------- | ---------------------------- |
| **タスク完了記録の追加** | ✅   | **全タスクで必須**                 | 完了セクションを仕様書に追加 |
| システム仕様の更新       | △    | インターフェース変更がある場合のみ | 仕様内容の変更               |

### 判断フローチャート（全体）

```
Phase 12 Task 2 開始
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ Step 1: タスク完了記録（必須）                                    │
│ → 「完了タスク」セクションを該当仕様書に追加                        │
│ → 関連ドキュメントセクションに実装ガイドへのリンク追加               │
└─────────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ Step 2: システム仕様更新判断（条件付き）                           │
│ → 更新判断基準に基づき更新要否を判断                               │
│ → 不要の場合は「更新なし」と documentation-changelog.md に明記     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 更新判断基準（Step 2用）

### 更新が必要な場合（必須）

| 条件                          | 例                                            |
| ----------------------------- | --------------------------------------------- |
| 新規インターフェース/型の追加 | ICorrectiveRAG, CRAGResult等                  |
| 既存インターフェースの変更    | メソッド追加、シグネチャ変更                  |
| 新規定数/設定値の追加         | CRAG_DEFAULTS等                               |
| アーキテクチャパターンの追加  | 新しいパイプライン段階                        |
| API仕様の変更                 | エンドポイント追加、リクエスト/レスポンス変更 |
| データベーススキーマ変更      | テーブル追加、カラム変更                      |
| 外部連携インターフェース追加  | IWebSearcher等                                |

### 更新が不要な場合

| 条件                                     | 例                                 |
| ---------------------------------------- | ---------------------------------- |
| 内部実装の詳細変更のみ                   | プライベートメソッド、ローカル変数 |
| リファクタリング（インターフェース不変） | コード構造改善、命名変更           |
| バグ修正（仕様変更なし）                 | 既存仕様の正しい実装               |
| テスト追加のみ                           | カバレッジ向上                     |
| ドキュメント誤記修正                     | typo修正、表現改善                 |

### 判断フローチャート

```
[新機能/変更がある]
    ↓
[外部から参照されるインターフェースか？]
    ├── Yes → 更新必要
    └── No
         ↓
    [他のコンポーネントが依存するか？]
        ├── Yes → 更新必要
        └── No → 更新不要（実装ガイドにのみ記載）
```

---

## 更新トリガー（変更タイプ別マッピング）

### 基本マッピング

| 変更種別           | 更新対象                                  |
| ------------------ | ----------------------------------------- |
| APIエンドポイント  | `references/api-*.md`                     |
| データベース       | `references/database-*.md`                |
| UI/UX              | `references/ui-ux-*.md`                   |
| アーキテクチャ     | `references/architecture-*.md`            |
| インターフェース   | `references/interfaces-*.md`              |
| セキュリティ       | `references/security-*.md`                |
| エラーハンドリング | `references/error-handling.md`            |
| 新機能（要件追加） | 該当するreferences/ファイルまたは新規作成 |

### ⚠️ 重要: 機能キーワードから仕様ファイルへのマッピング

**タスク名やファイル名に含まれるキーワード**で正しい仕様ファイルを特定する。

| 機能キーワード                                     | 正しい仕様ファイル                             | 注意点                                          |
| -------------------------------------------------- | ---------------------------------------------- | ----------------------------------------------- |
| `conversation-history`, `chat-history`, `会話履歴` | `interfaces-chat-history.md`                   | ❌ `ui-ux-history-panel.md`はファイル変換履歴用 |
| `file-conversion`, `converter`, `ファイル変換`     | `interfaces-converter.md`                      | UI側は`ui-ux-history-panel.md`                  |
| `llm`, `streaming`, `LLM連携`                      | `interfaces-llm.md`                            | -                                               |
| `auth`, `authentication`, `認証`                   | `interfaces-auth.md`                           | セキュリティ実装は`security-*.md`               |
| `rag`, `retrieval`, `search`, `検索`               | `interfaces-rag.md`または`interfaces-rag-*.md` | 機能により細分化                                |
| `skill`, `agent-sdk`, `スキル`                     | `interfaces-agent-sdk.md`                      | -                                               |
| `system-prompt`, `システムプロンプト`              | `interfaces-system-prompt.md`                  | UI側は`ui-ux-system-prompt.md`                  |
| `database`, `schema`, `DB`                         | `database-schema.md`                           | 実装詳細は`database-*.md`                       |
| `security`, `セキュリティ`                         | `security-*.md`                                | 機能により細分化                                |
| `api`, `endpoint`, `エンドポイント`                | `api-*.md`                                     | 機能により細分化                                |

### 仕様ファイル特定フローチャート

```
[タスク名/機能名を確認]
    ↓
[キーワード抽出]
  例: "conversation-history-ui-implementation"
      → キーワード: "conversation", "history", "ui"
    ↓
[キーワードマッピング表で対象ファイル候補を特定]
  "conversation-history" → interfaces-chat-history.md
    ↓
[候補ファイルの内容を確認]
  ⚠️ ui-ux-history-panel.md の内容を確認
     → "ファイル変換履歴" → 不一致 → 除外
  ✅ interfaces-chat-history.md の内容を確認
     → "会話履歴" → 一致 → 採用
    ↓
[正しいファイルに更新]
```

### 混同しやすい仕様ファイルの対照表

| 混同しやすい組み合わせ         | 用途の違い                                                      |
| ------------------------------ | --------------------------------------------------------------- |
| `ui-ux-history-panel.md`       | **ファイル変換履歴**（ConversionLogs, VersionHistory, Restore） |
| `interfaces-chat-history.md`   | **会話履歴**（Conversation, Message, ChatSession）              |
| `architecture-chat-history.md` | **会話履歴のアーキテクチャ設計**                                |
| `api-chat-history.md`          | **会話履歴APIエンドポイント**                                   |

### 具体的更新項目チェックリスト

Phase 12 Task 2実行時に以下をチェックし、該当する場合は**必ず**更新する。

| 実装内容                       | 更新対象ファイル                         | 更新内容                         |
| ------------------------------ | ---------------------------------------- | -------------------------------- |
| サービスメソッドシグネチャ変更 | `interfaces-*.md`                        | メソッド表のシグネチャ更新       |
| 新規カスタムエラークラス追加   | `error-handling.md`                      | エラーコード・クラス定義追加     |
| 新規ビジネスルール追加         | `interfaces-*.md`                        | ビジネスルール表に追加           |
| 認可/認証ロジック追加          | `interfaces-*.md` または `security-*.md` | 認可セクション追加               |
| 新規定数/設定値追加            | 該当する`interfaces-*.md`                | 定数定義セクション追加           |
| データベーススキーマ変更       | `database-*.md`                          | テーブル/カラム定義更新          |
| 新規リポジトリメソッド追加     | `interfaces-*.md`                        | リポジトリインターフェース表更新 |

### 更新漏れ防止チェックリスト（Phase 12 Task 2 完了前に確認）

```markdown
## システム仕様更新チェックリスト

- [ ] メソッドシグネチャに変更がある場合、interfaces-\*.mdを更新した
- [ ] 新規エラークラスを追加した場合、error-handling.mdを更新した
- [ ] 新規ビジネスルールがある場合、該当interfacesファイルに追加した
- [ ] 認可/認証ロジックを追加した場合、認可セクションを追加/更新した
- [ ] 新規定数/設定値がある場合、該当ファイルに記載した
- [ ] 更新したファイルの変更履歴セクションにバージョンを追記した
```

## 更新フロー（2ステップ）

### Step 1: タスク完了記録（必須）

**全タスクで必須**。バグ修正でも新機能でも必ず実行。

```
Phase 12 Task 2 開始
    ↓
該当する仕様書を特定
  └── 例: skill関連 → interfaces-agent-sdk.md
    ↓
「## 完了タスク」セクションを追加（末尾近く）
  └── テンプレート: 「タスク完了ステータス更新」セクション参照
    ↓
「## 関連ドキュメント」セクションに実装ガイドリンク追加
    ↓
完了
```

### Step 2: システム仕様更新（条件付き）

**更新判断基準に該当する場合のみ**実行。

```
[仕様変更有り？]（更新判断基準で判断）
    ├── No → 「更新なし」をdocumentation-changelog.mdに明記して終了
    └── Yes
         ↓
aiworkflow-requirements/references/{{該当ファイル}}.md を編集
    ↓
インデックス再生成
    ↓
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
    ↓
変更履歴に追記（aiworkflow-requirements/SKILL.md は不要、自動反映）
```

## 新規仕様の追加手順

```bash
# 1. テンプレートをコピー
cp .claude/skills/aiworkflow-requirements/assets/spec-template.md \
   .claude/skills/aiworkflow-requirements/references/{prefix}-{topic}.md

# 2. 内容を記述（spec-guidelines.md参照）

# 3. インデックス再生成
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

## タスク完了ステータス更新（Phase 11/12完了時）

手動テストや検証タスク完了時は、システム仕様書に**タスク完了セクション**を追加する。

### 追加セクションテンプレート

```markdown
### タスク: {{TASK_NAME}}（{{COMPLETION_DATE}}完了）

| 項目         | 内容                                                                       |
| ------------ | -------------------------------------------------------------------------- |
| タスクID     | {{TASK_ID}}                                                                |
| 完了日       | {{COMPLETION_DATE}}                                                        |
| ステータス   | **完了**                                                                   |
| テスト数     | {{AUTO_TEST_COUNT}}（自動テスト）+ {{MANUAL_TEST_COUNT}}（手動テスト項目） |
| 発見課題     | {{ISSUE_COUNT}}件                                                          |
| ドキュメント | `docs/30-workflows/{{TASK_NAME}}/`                                         |

#### テスト結果サマリー

| カテゴリ           | テスト数 | PASS  | FAIL  |
| ------------------ | -------- | ----- | ----- |
| 機能テスト         | {{N}}    | {{N}} | {{N}} |
| エラーハンドリング | {{N}}    | {{N}} | {{N}} |
| アクセシビリティ   | {{N}}    | {{N}} | {{N}} |
| 統合テスト連携     | {{N}}    | {{N}} | {{N}} |

#### 成果物

| 成果物             | パス                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| テスト結果レポート | `docs/30-workflows/{{TASK_NAME}}/outputs/phase-11/manual-test-result.md`   |
| 発見課題リスト     | `docs/30-workflows/{{TASK_NAME}}/outputs/phase-11/discovered-issues.md`    |
| 実装ガイド         | `docs/30-workflows/{{TASK_NAME}}/outputs/phase-12/implementation-guide.md` |
```

### 変更履歴更新

仕様書の`## 変更履歴`セクションに以下の形式で追記:

```markdown
| {{NEXT_VERSION}} | {{DATE}} | {{TASK_NAME}}完了（手動テスト{{N}}項目全PASS、自動テスト{{N}}件全PASS、発見課題{{N}}件） |
```

### 残課題更新

該当タスクが「残課題」にある場合、取り消し線で完了をマーク:

```markdown
| ~~{{TASK_NAME}}~~ | ~~{{依存タスク}}~~ | ~~{{優先度}}~~ | ~~{{未タスク指示書}}~~ ✅ **完了** |
```

---

## 参照リソース

| リソース         | パス                                                                   |
| ---------------- | ---------------------------------------------------------------------- |
| 仕様スキル       | `.claude/skills/aiworkflow-requirements/SKILL.md`                      |
| トピックマップ   | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`          |
| 記述ガイドライン | `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md` |
| テンプレート     | `.claude/skills/aiworkflow-requirements/assets/spec-template.md`       |
