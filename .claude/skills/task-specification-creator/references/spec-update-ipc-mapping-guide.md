# Spec Update IPC/型定義 判断基準とファイルマッピングガイド

> 親ファイル: [spec-update-workflow.md](spec-update-workflow.md)
> 読み込み条件: Phase 12 Task 2 で Step 2（システム仕様更新）が必要か判断するとき、
> または IPC・型定義・機能キーワードから正しい仕様ファイルを特定するとき。

---

## 更新トリガー（変更タイプ別マッピング）

### 基本マッピング

| 変更種別           | 更新対象                                  |
| ------------------ | ----------------------------------------- |
| APIエンドポイント  | `references/api-*.md`                     |
| IPC契約横断ガイド  | `references/ipc-contract-checklist.md`, `indexes/quick-reference.md` |
| データベース       | `references/database-*.md`                |
| UI/UX              | `references/ui-ux-*.md`                   |
| アーキテクチャ     | `references/architecture-*.md`            |
| インターフェース   | `references/interfaces-*.md`              |
| セキュリティ       | `references/security-*.md`                |
| エラーハンドリング | `references/error-handling.md`            |
| 新機能（要件追加） | 該当するreferences/ファイルまたは新規作成 |

### 機能キーワードから仕様ファイルへのマッピング

**タスク名やファイル名に含まれるキーワード**で正しい仕様ファイルを特定する。

| 機能キーワード                                     | 正しい仕様ファイル                             | 注意点                                          |
| -------------------------------------------------- | ---------------------------------------------- | ----------------------------------------------- |
| `conversation-history`, `chat-history`, `会話履歴` | `interfaces-chat-history.md`                   | `ui-ux-history-panel.md`はファイル変換履歴用 |
| `file-conversion`, `converter`, `ファイル変換`     | `interfaces-converter.md`                      | UI側は`ui-ux-history-panel.md`                  |
| `llm`, `streaming`, `LLM連携`                      | `interfaces-llm.md`                            | -                                               |
| `auth`, `authentication`, `認証`                   | `interfaces-auth.md`                           | セキュリティ実装は`security-*.md`               |
| `rag`, `retrieval`, `search`, `検索`               | `interfaces-rag.md`または`interfaces-rag-*.md` | 機能により細分化                                |
| `skill`, `agent-sdk`, `スキル`                     | `interfaces-agent-sdk.md`                      | -                                               |
| `system-prompt`, `システムプロンプト`              | `interfaces-system-prompt.md`                  | UI側は`ui-ux-system-prompt.md`                  |
| `database`, `schema`, `DB`                         | `database-schema.md`                           | 実装詳細は`database-*.md`                       |
| `security`, `セキュリティ`                         | `security-*.md`                                | 機能により細分化                                |
| `api`, `endpoint`, `エンドポイント`                | `api-*.md`                                     | 機能により細分化                                |
| `permission`, `PermissionDialog`, `権限確認`       | `ui-ux-agent-execution.md`                     | コンポーネント一覧は`ui-ux-components.md`       |
| `eslint`, `lint`, `next-lint`, `code-quality`      | `technology-backend.md`                        | DevOps関連は`technology-devops.md`              |
| `ci`, `ci-cd`, `devops`, `build`, `deploy`         | `technology-devops.md`                         | バックエンド技術は`technology-backend.md`        |
| `backend`, `next`, `next.js`, `framework`          | `technology-backend.md`                        | -                                               |

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

---

## 更新判断基準（Step 2用）

### 更新が必要な場合（必須）

| 条件                          | 例                                            |
| ----------------------------- | --------------------------------------------- |
| 新規インターフェース/型の追加 | ICorrectiveRAG, CRAGResult など               |
| 既存インターフェースの変更    | メソッド追加、シグネチャ変更                  |
| 新規定数/設定値の追加         | CRAG_DEFAULTS など                            |
| アーキテクチャパターンの追加  | 新しいパイプライン段階                        |
| API仕様の変更                 | エンドポイント追加、リクエスト/レスポンス変更 |
| データベーススキーマ変更      | テーブル追加、カラム変更                      |
| 外部連携インターフェース追加  | IWebSearcher など                             |
| テスト戦略・方法論の変更      | テストフレームワーク変更、テストパターン導入 |

### 更新が不要な場合

| 条件                                     | 例                                 |
| ---------------------------------------- | ---------------------------------- |
| 内部実装の詳細変更のみ                   | プライベートメソッド、ローカル変数 |
| リファクタリング（インターフェース不変） | コード構造改善、命名変更           |
| バグ修正（仕様変更なし）                 | 既存仕様の正しい実装               |
| テスト追加のみ（戦略不変）               | テストケース数増加のみ |
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

## 新規型定義の仕様書配置判断フロー

新規型定義が作成された場合、以下のフローで配置先を決定する。

```
[新規型定義が発生]
    ↓
[既存 interfaces-*.md のドメインに属するか？]
    ├── Yes → [該当ファイルが 500行未満か？]
    │         ├── Yes → 既存ファイルに追記
    │         └── No  → ファイル分割を検討（-advanced.md / -details.md）
    └── No  → [新規ドメインか？]
              ├── Yes → 新規 interfaces-*.md を作成
              └── No  → arch-*.md に追記（アーキテクチャレベル設計変更の場合）
```

**interfaces-agent-sdk-skill-*.md ファミリーの配置ルール**:

| ファイル | 配置する型の種類 |
| -------- | ---------------- |
| `interfaces-agent-sdk-skill.md` | スキルの基本型（SkillMetadata, SkillFile など） |
| `interfaces-agent-sdk-skill-core.md` | コア実行型（SkillExecutionResult など） |
| `interfaces-agent-sdk-skill-advanced.md` | 高度な機能型（SkillPermission, SkillCreator など） |
| `interfaces-agent-sdk-skill-history.md` | 履歴・バージョン管理型（SkillVersion, SkillDiff など） |
| `interfaces-agent-sdk-skill-reference.md` | 参照系型（SkillCategory, SkillTag など） |
| 新規作成が必要な場合 | 独立したドメイン型（例: ライフサイクル型 → `interfaces-agent-sdk-skill-lifecycle.md`） |

**パス配置ルール**:
- 共有型（複数パッケージから参照）: `packages/shared/src/skill/<domain>/types.ts`
- Renderer専用型: `apps/desktop/src/renderer/types/`
- Main Process専用型: `apps/desktop/src/main/types/`

---

## 新規クラス/コンポーネント追加時のチェックリスト

新しいクラスやコンポーネントを実装した場合、**型定義の有無に関わらず**以下を確認：

| チェック項目                       | 該当する場合の対応               |
| ---------------------------------- | -------------------------------- |
| 他コンポーネントから使用されるか？ | 仕様書に API リファレンスを追加  |
| アーキテクチャ上の役割があるか？   | アーキテクチャ図を追加           |
| 設定可能なパラメータがあるか？     | 設定定数セクションを追加         |
| 特有のエラーパターンがあるか？     | エラーメッセージセクションを追加 |
| 使用例が必要か？                   | コード例セクションを追加         |

**例**: PermissionResolver（TASK-3-2）

- 型定義（SkillPermissionRequest/Response）は TASK-1-1 で追加済み
- しかし PermissionResolver クラス自体の API、アーキテクチャ、使用例は新規
- → interfaces-agent-sdk.md に「PermissionResolver 型定義」セクションを追加が必要

---

## 具体的更新項目チェックリスト

Phase 12 Task 2実行時に以下をチェックし、該当する場合は**必ず**更新する。

| 実装内容                       | 更新対象ファイル                         | 更新内容                         |
| ------------------------------ | ---------------------------------------- | -------------------------------- |
| サービスメソッドシグネチャ変更 | `interfaces-*.md`                        | メソッド表のシグネチャ更新       |
| shared transport DTO / IPC envelope 追加 | `api-ipc-*.md`, `interfaces-*.md`, `error-handling.md`, `references/ipc-contract-checklist.md`, `indexes/quick-reference.md` | request / response / event / error / cross-cutting guide を同期 |
| 新規カスタムエラークラス追加   | `error-handling.md`                      | エラーコード・クラス定義追加     |
| 新規ビジネスルール追加         | `interfaces-*.md`                        | ビジネスルール表に追加           |
| 認可/認証ロジック追加          | `interfaces-*.md` または `security-*.md` | 認可セクション追加               |
| 新規定数/設定値追加            | 該当する`interfaces-*.md`                | 定数定義セクション追加           |
| データベーススキーマ変更       | `database-*.md`                          | テーブル/カラム定義更新          |
| 新規リポジトリメソッド追加     | `interfaces-*.md`                        | リポジトリインターフェース表更新 |

---

## IPC機能開発時の追加更新対象（Step 2該当時）

IPC チャンネルの追加・変更を伴うタスクの場合、Step 2 で以下のファイルの更新要否を確認する。

| # | 更新対象ファイル                          | 更新内容                                                 | 必須/任意 |
|---|-------------------------------------------|----------------------------------------------------------|-----------|
| 1 | `api-ipc-agent.md`                        | 新規チャンネル一覧、型定義、完了タスク記録               | 必須      |
| 2 | `security-electron-ipc.md`                | セキュリティ検証パターン（sender検証、ホワイトリスト）   | 必須      |
| 3 | `architecture-overview.md`                | IPCハンドラー登録一覧（registerAllIpcHandlers）           | 必須      |
| 4 | `interfaces-agent-sdk-skill.md`           | インターフェース定義、完了タスク記録                     | 必須      |
| 5 | `task-workflow.md`                        | 残課題テーブル更新、完了タスクセクション追加             | 必須      |
| 6 | `lessons-learned.md`                      | 実装教訓（新規パターン・落とし穴がある場合）             | 任意      |
| 7 | `architecture-implementation-patterns.md` | 実装パターン（新規パターンがある場合）                   | 任意      |

> **参考**: TASK-9B-H（SkillCreatorService IPC）では上記7ファイル全ての更新が必要だった。

> **Task04 再監査で追加した判断ルール**:
> 既存 IPC を再利用していても、`window.electronAPI.skill.*` などの public preload method を追加した場合、または `packages/shared` の barrel export を増やした場合は Step 2 対象とみなす。

---

## エラー分類・リトライ戦略の仕様更新チェックリスト

リトライ機構やエラー分類を実装した場合、以下を追加で確認する:

```markdown
## エラー分類・リトライ更新チェックリスト

- [ ] エラー種別の分類（retryable/non-retryable）がerror-handling.mdに記載されている
- [ ] リトライ設定パラメータ（maxRetries, baseDelayMs など）が該当interfaces-*.mdに記載されている
- [ ] バックオフアルゴリズム（Exponential Backoff, Jitter など）の仕様が記載されている
- [ ] AbortSignal/キャンセル処理との連携が記載されている
- [ ] ストリーミングイベント（retry通知 など）の形式が記載されている
```

---

## 更新漏れ防止チェックリスト（Phase 12 Task 2 完了前に確認）

```markdown
## システム仕様更新チェックリスト

- [ ] メソッドシグネチャに変更がある場合、interfaces-*.mdを更新した
- [ ] 新規エラークラスを追加した場合、error-handling.mdを更新した
- [ ] 新規ビジネスルールがある場合、該当interfacesファイルに追加した
- [ ] 認可/認証ロジックを追加した場合、認可セクションを追加/更新した
- [ ] 新規定数/設定値がある場合、該当ファイルに記載した
- [ ] 更新したファイルの変更履歴セクションにバージョンを追記した
- [ ] IPC拡張を含む場合、チャンネル数・進捗型（例: `SkillCreatorProgress`）が実装と仕様書で一致している
- [ ] エラー分類/リトライ戦略を追加した場合、error-handling.mdのリトライ対象判定セクションを更新した
- [ ] 残課題テーブルに該当タスクがある場合、取り消し線+✅完了マークで更新した
- [ ] 関連する仕様ファイルの実装状況テーブル（該当する場合）を更新した
- [ ] IPC transport contract を更新した場合、`references/ipc-contract-checklist.md` と `indexes/quick-reference.md` の両方を確認した
- [ ] `artifacts.json` と `outputs/artifacts.json` の completed成果物一覧が一致している
- [ ] `git diff --stat origin/main...HEAD` と `git diff --stat HEAD` の両方を確認し、branch差分とcurrent worktree差分を区別して記録した
- [ ] `node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow <workflow-path> --regenerate` を実行し、`index.md` の Phase 状態が `artifacts.json` と一致している
- [ ] `rg -n 'ステータス\s*\|\s*pending' <workflow-path>/phase-{1,2,3,4,5,6,7,8,9,10,11}-*.md` を実行し、completed 扱いの Phase 本文に stale が残っていない
- [ ] Phase 9成果物名を `phase-9-quality-assurance.md` で統一した
- [ ] `outputs/phase-12/` に `spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` が存在する
- [ ] IPC契約を更新した場合、`outputs/phase-12/ipc-documentation.md` の引数/戻り値/エラー仕様を実装契約へ同期した
- [ ] workspace内でsource直接参照を追加した場合、補助型宣言（`.d.ts`）の取り込み設定を確認した
- [ ] topic-map.mdに新規セクションのエントリを追加した
```
