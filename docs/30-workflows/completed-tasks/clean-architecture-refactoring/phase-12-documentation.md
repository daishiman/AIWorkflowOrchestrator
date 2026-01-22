# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 12                             |
| Phase名    | ドキュメント更新               |
| 前提Phase  | Phase 11（手動テスト検証）     |
| 後続Phase  | Phase 13（PR作成）             |
| ステータス | 未実施                         |
| 作成日     | 2026-01-18                     |
| 機能名     | clean-architecture-refactoring |
| タスクID   | ARCH-001                       |

---

## 目的

新アーキテクチャを反映した技術ドキュメントを更新する。

## 背景

Clean Architectureへのリファクタリングにより、コードベースの構造が大きく変更されたため、関連ドキュメントを更新して開発者が新アーキテクチャを理解・活用できるようにする。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 実装ガイド作成【必須】

**目的**: 2パート構成の実装ガイドを作成する

**実行手順**:

1. **Part 1: 概念的説明（初学者・非技術者向け）** を作成する:
   - Clean Architectureの基本概念を平易な言葉で説明
   - 各レイヤーの役割を日常の例え（レストラン、図書館など）で説明
   - なぜこのアーキテクチャを採用したのかをビジネス価値で説明
   - 中学生でもわかる程度の説明レベル

2. **Part 2: 技術的詳細（開発者・技術者向け）** を作成する:
   - レイヤー間の依存関係ルールとその実装方法
   - 各コンポーネントのAPI仕様（メソッド、引数、戻り値）
   - 使用例（コードサンプル）
   - 新機能追加時の手順
   - トラブルシューティング

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md` - 実装ガイド（Part 1 + Part 2）

---

### タスク2: アーキテクチャドキュメント更新

**目的**: システムアーキテクチャの説明を更新する

**実行手順**:

1. アーキテクチャ概要ドキュメントを更新する:

   ```markdown
   # チャット履歴機能 - アーキテクチャ

   ## レイヤー構成
   ```

   ┌─────────────────────────────────────────────────┐
   │ UI Layer │
   │ (React Components, Context, Hooks) │
   └──────────────────────┬──────────────────────────┘
   │
   ┌──────────────────────▼──────────────────────────┐
   │ Application Layer │
   │ (Use Cases, DTOs) │
   └──────────────────────┬──────────────────────────┘
   │
   ┌──────────────────────▼──────────────────────────┐
   │ Domain Layer │
   │ (Entities, Value Objects, Repository IF) │
   └──────────────────────┬──────────────────────────┘
   │
   ┌──────────────────────▼──────────────────────────┐
   │ Infrastructure Layer │
   │ (Drizzle Repositories, Mappers) │
   └─────────────────────────────────────────────────┘

   ```

   ## 依存関係ルール

   - Domain → なし（純粋）
   - Application → Domain
   - Infrastructure → Domain, Application
   - UI → Application, Domain
   ```

2. ディレクトリ構成を文書化する:
   ```
   packages/shared/src/
   ├── core/
   │   ├── Result.ts
   │   └── errors/
   │       └── index.ts
   └── features/chat-history/
       ├── domain/
       │   ├── entities/
       │   ├── value-objects/
       │   └── repositories/
       ├── application/
       │   ├── dto/
       │   └── use-cases/
       └── infrastructure/
           └── persistence/
               ├── drizzle/
               └── mappers/
   ```

**期待される成果物**:

- `.claude/skills/aiworkflow-requirements/references/architecture-chat-history.md` - アーキテクチャドキュメント更新

---

### タスク3: API/インターフェースドキュメント更新

**目的**: 公開APIとインターフェースの説明を更新する

**実行手順**:

1. Use Case APIドキュメントを作成する:

   ```markdown
   # チャット履歴 Use Case API

   ## CreateChatSessionUseCase

   新規チャットセッションを作成する。

   ### 入力

   - `userId`: string - ユーザーID
   - `title?`: string - セッションタイトル（オプション、3-100文字）

   ### 出力

   - `session`: ChatSessionDTO - 作成されたセッション

   ### エラー

   - `INVALID_TITLE`: タイトルが無効
   - `REPOSITORY_ERROR`: 保存に失敗
   ```

2. リポジトリインターフェースドキュメントを作成する:

   ```markdown
   # リポジトリインターフェース

   ## IChatSessionRepository

   チャットセッションの永続化を担当する。

   ### メソッド

   - `findById(id: ChatSessionId): Promise<ChatSession | null>`
   - `save(session: ChatSession): Promise<Result<void, RepositoryError>>`
   - `findByUserId(userId: UserId): Promise<ChatSession[]>`
   - `search(query: SearchQuery): Promise<SearchResult>`
   ```

3. DTOドキュメントを作成する:
   - ChatSessionDTO
   - ChatMessageDTO
   - SearchResultDTO

**期待される成果物**:

- `.claude/skills/aiworkflow-requirements/references/api-chat-history.md` - API/インターフェースドキュメント

---

### タスク4: 開発ガイド更新

**目的**: 開発者向けのガイドを更新する

**実行手順**:

1. 新機能追加ガイドを作成する:

   ```markdown
   # 新機能追加ガイド

   ## 1. ドメイン層の実装

   1. 必要な値オブジェクトを定義
   2. エンティティを定義
   3. リポジトリインターフェースを定義

   ## 2. アプリケーション層の実装

   1. DTOを定義
   2. Use Caseを実装
   3. エラー型を定義

   ## 3. インフラ層の実装

   1. マッパーを実装
   2. Drizzleリポジトリを実装
   3. DBスキーマを更新（必要な場合）

   ## 4. UI層の統合

   1. Contextに新機能を追加
   2. フックを更新
   3. コンポーネントを更新
   ```

2. テスト作成ガイドを更新する:
   - ドメイン層テストの書き方
   - Use Caseテストの書き方
   - 統合テストの書き方
   - アーキテクチャテストの書き方

3. トラブルシューティングガイドを作成する:
   - よくあるエラーと対処法
   - デバッグ方法
   - パフォーマンス問題の診断

**期待される成果物**:

- `docs/20-references/development-guide-chat-history.md` - 開発ガイド

---

### タスク5: 既存仕様書の更新

**目的**: 既存のシステム仕様書を新アーキテクチャに合わせて更新する

**実行手順**:

1. `interfaces-chat-history.md` を更新する:
   - 新しいクラス/インターフェース構成を反映
   - レイヤー分離を反映
   - Result型の使用を反映

2. `architecture-patterns.md` を更新する:
   - Clean Architectureパターンを追加
   - Repository Pattern (DI) を追加
   - Mapper Patternを追加

3. 更新箇所のdiffを作成する:
   - 変更前/変更後の比較
   - 変更理由の説明

**期待される成果物**:

- `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` - 更新済み
- `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` - 更新済み

---

### タスク6: マイグレーションガイド作成

**目的**: 旧アーキテクチャからの移行ガイドを作成する

**実行手順**:

1. 移行手順を文書化する:

   ````markdown
   # マイグレーションガイド

   ## 旧→新アーキテクチャ移行

   ### フィーチャーフラグによる段階的移行

   1. `USE_NEW_CHAT_HISTORY_ARCH=false` で既存動作確認
   2. `USE_NEW_CHAT_HISTORY_ARCH=true` で新アーキテクチャ有効化
   3. 動作確認後、フラグを削除

   ### コード移行ポイント

   #### Before (旧)

   ```typescript
   import { ChatHistoryService } from "@repo/shared/features/chat-history";
   const service = new ChatHistoryService(db);
   await service.createSession(userId);
   ```
   ````

   #### After (新)

   ```typescript
   import { useChatHistory } from "@repo/desktop/hooks/useChatHistory";
   const { createSession } = useChatHistory();
   await createSession({ userId });
   ```

   ```

   ```

2. 破壊的変更一覧を作成する:
   - 削除されたAPI
   - 変更されたAPI
   - 新規API

3. 互換性情報を記載する:
   - データ互換性
   - API互換性
   - 設定互換性

**期待される成果物**:

- `docs/20-references/migration-guide-clean-architecture.md` - マイグレーションガイド

---

### タスク7: ADR (Architecture Decision Record) 作成

**目的**: アーキテクチャ決定を文書化する

**実行手順**:

1. ADRを作成する:

   ```markdown
   # ADR-XXX: チャット履歴機能のClean Architecture準拠

   ## ステータス

   Accepted

   ## コンテキスト

   チャット履歴機能のアーキテクチャ準拠率が45%であり、
   以下の問題があった：

   - ドメイン層がインフラ層（Drizzle ORM）に直接依存
   - God Objectパターン（ChatHistoryService）
   - 型定義の3重複

   ## 決定

   Clean Architectureに準拠したレイヤー分離を行う：

   - Domain層: エンティティ、値オブジェクト、リポジトリIF
   - Application層: Use Case、DTO
   - Infrastructure層: Drizzleリポジトリ、マッパー

   ## 結果

   ### ポジティブ

   - テスタビリティの向上
   - 保守性の向上
   - 依存関係の明確化

   ### ネガティブ

   - 初期学習コスト
   - コード量の増加
   - 変換オーバーヘッド（軽微）

   ## 代替案

   1. 現状維持 → 技術的負債の蓄積
   2. 部分的リファクタ → 不整合のリスク
   3. 別アーキテクチャ（Hexagonal等） → 類似効果、選好の問題
   ```

**期待される成果物**:

- `docs/10-architecture/adr/ADR-XXX-clean-architecture-chat-history.md` - ADR

---

### タスク8: ドキュメント整合性確認

**目的**: 全ドキュメントの整合性を確認する

**実行手順**:

1. ドキュメント間の参照を確認する:
   - [ ] リンク切れがない
   - [ ] 用語が統一されている
   - [ ] バージョン情報が一致している

2. コードとドキュメントの整合性を確認する:
   - [ ] コード例が実際に動作する
   - [ ] API仕様が実装と一致している
   - [ ] ディレクトリ構成が実際と一致している

3. ドキュメント更新履歴を記録する:
   - 更新日
   - 更新内容
   - 担当者

**期待される成果物**:

- `outputs/phase-12/documentation-update-report.md` - ドキュメント更新レポート

---

### タスク9: 未タスク検出【必須】

**目的**: 残課題を検出し記録する

**実行手順**:

1. 以下のソースから未完了タスクを検出する:

   | #   | ソース                 | 確認項目                      |
   | --- | ---------------------- | ----------------------------- |
   | 1   | Phase 3レビュー結果    | MINOR判定の指摘事項           |
   | 2   | Phase 10レビュー結果   | MINOR判定の指摘事項           |
   | 3   | Phase 11手動テスト結果 | スコープ外の発見事項          |
   | 4   | 各Phase成果物          | 「将来対応」「TODO」「FIXME」 |
   | 5   | コードベース           | TODO/FIXME/HACK/XXXコメント   |

2. 未タスク検出レポートを作成する:
   - 検出件数（0件の場合も「検出なし」と明記）
   - 各課題の概要
   - 優先度（High/Medium/Low）
   - 対応期限の提案

3. 未タスクが検出された場合:
   - `docs/30-workflows/unassigned-task/` に指示書を作成

**期待される成果物**:

- `outputs/phase-12/unassigned-task-report.md` - 未タスク検出レポート【必須：検出なしでも出力】
- `docs/30-workflows/unassigned-task/*.md` - 未完了タスク指示書（検出時のみ）

---

## 参照資料

| 参照資料      | パス                                                 | 内容             |
| ------------- | ---------------------------------------------------- | ---------------- |
| Phase 2成果物 | `outputs/phase-2/`                                   | 設計ドキュメント |
| Phase 5成果物 | `outputs/phase-5/implementation-report.md`           | 実装レポート     |
| 既存仕様書    | `.claude/skills/aiworkflow-requirements/references/` | 既存仕様         |

### システム仕様（aiworkflow-requirements）

> ドキュメント更新時は以下のシステム仕様を参照してください。

| 参照資料                     | パス                                                                           | 内容           |
| ---------------------------- | ------------------------------------------------------------------------------ | -------------- |
| チャット履歴インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` | 既存仕様       |
| アーキテクチャパターン       | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`   | アーキテクチャ |

---

## 成果物

| 成果物                     | パス                                                                             | 必須 | 内容                                  |
| -------------------------- | -------------------------------------------------------------------------------- | ---- | ------------------------------------- |
| 実装ガイド                 | `outputs/phase-12/implementation-guide.md`                                       | ✅   | 概念的説明(Part1) + 技術的詳細(Part2) |
| アーキテクチャドキュメント | `.claude/skills/aiworkflow-requirements/references/architecture-chat-history.md` |      | アーキテクチャ説明                    |
| API/IFドキュメント         | `.claude/skills/aiworkflow-requirements/references/api-chat-history.md`          |      | API仕様                               |
| 開発ガイド                 | `docs/20-references/development-guide-chat-history.md`                           |      | 開発者向けガイド                      |
| マイグレーションガイド     | `docs/20-references/migration-guide-clean-architecture.md`                       |      | 移行ガイド                            |
| ADR                        | `docs/10-architecture/adr/ADR-XXX-clean-architecture-chat-history.md`            |      | アーキテクチャ決定記録                |
| 更新レポート               | `outputs/phase-12/documentation-update-report.md`                                | ✅   | ドキュメント更新履歴                  |
| 未タスク検出レポート       | `outputs/phase-12/unassigned-task-report.md`                                     | ✅   | 検出結果（なしでも出力）              |
| 未完了タスク指示書         | `docs/30-workflows/unassigned-task/*.md`                                         | 条件 | 検出時のみ作成                        |

---

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] アーキテクチャドキュメントが更新されている
- [ ] API/インターフェースドキュメントが更新されている
- [ ] 開発ガイドが更新されている
- [ ] 既存仕様書が更新されている
- [ ] マイグレーションガイドが作成されている
- [ ] ADRが作成されている
- [ ] ドキュメント整合性が確認されている
- [ ] ドキュメント更新レポートが作成されている
- [ ] **未タスク検出レポートが出力されている**【必須】
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] `artifacts.json` のPhase 12ステータスを更新

---

## 依存関係

- **前提**: Phase 11（手動テスト検証）が完了していること
- **後続**: Phase 13（PR作成）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/clean-architecture-refactoring/phase-13-pr-creation.md`
