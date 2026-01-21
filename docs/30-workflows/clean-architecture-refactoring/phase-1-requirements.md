# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 1                              |
| Phase名    | 要件定義                       |
| 前提Phase  | -                              |
| 後続Phase  | Phase 2（設計）                |
| ステータス | 未実施                         |
| 作成日     | 2026-01-18                     |
| 機能名     | clean-architecture-refactoring |
| タスクID   | ARCH-001                       |

---

## 目的

Clean Architecture準拠リファクタリングの詳細要件と移行戦略を定義する。

## 背景

Phase 7の最終レビューで、チャット履歴機能のアーキテクチャがClean Architectureの基本原則に重大な違反をしていることが発見された。アーキテクチャ準拠率は45%であり、早急な是正が必要。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 現状アーキテクチャの詳細分析

**目的**: 現在のコードベースを分析し、Clean Architecture違反箇所を具体的に特定する

**実行手順**:

1. 以下のファイルを読み込み、現状を分析する:
   - `packages/shared/src/features/chat-history/domain/ChatSession.ts`
   - `packages/shared/src/features/chat-history/domain/ChatMessage.ts`
   - `packages/shared/src/features/chat-history/chat-history-service.ts`
   - `packages/shared/src/repositories/chat-session-repository.ts`
   - `packages/shared/src/repositories/chat-message-repository.ts`
   - `packages/shared/src/db/schema/chat-history.ts`
   - `packages/shared/src/features/chat-history/types/chat-session.ts`
   - `packages/shared/src/features/chat-history/types/chat-message.ts`

2. 各違反箇所を以下の形式で文書化する:
   - 違反ID（C-01, H-01等）
   - 違反箇所（ファイルパス:行番号）
   - 違反内容（具体的なコード）
   - 違反しているClean Architecture原則
   - 修正方針

3. 依存関係グラフを作成し、不正な依存方向を可視化する

**期待される成果物**:

- `outputs/phase-1/current-architecture-analysis.md` - 現状分析レポート
- `outputs/phase-1/dependency-graph.md` - 依存関係図（Mermaid形式）

---

### タスク2: Clean Architecture要件の定義

**目的**: リファクタリング後のアーキテクチャ要件を明確に定義する

**実行手順**:

1. レイヤー構成を定義する:
   - **Domain層**: エンティティ、値オブジェクト、リポジトリインターフェース
   - **Application層**: Use Case、DTO、アプリケーションサービス
   - **Infrastructure層**: リポジトリ実装、マッパー、外部サービス連携
   - **Presentation層（UI）**: React Context、カスタムフック、コンポーネント

2. 依存関係ルールを定義する:
   - 内側のレイヤーは外側のレイヤーに依存してはならない
   - Domain層は他のどのレイヤーにも依存しない
   - Application層はDomain層のみに依存する
   - Infrastructure層はDomain層とApplication層に依存できる
   - Presentation層はApplication層に依存する（Domain層には依存しない）

3. ディレクトリ構造を定義する:

   ```
   packages/shared/src/
   ├── core/
   │   └── Result.ts              # 共通Result型
   ├── features/chat-history/
   │   ├── domain/
   │   │   ├── entities/
   │   │   │   ├── ChatSession.ts
   │   │   │   └── ChatMessage.ts
   │   │   ├── value-objects/
   │   │   │   ├── ChatSessionId.ts
   │   │   │   ├── ChatSessionTitle.ts
   │   │   │   └── MessageContent.ts
   │   │   └── repositories/
   │   │       ├── IChatSessionRepository.ts
   │   │       └── IChatMessageRepository.ts
   │   └── application/
   │       ├── use-cases/
   │       │   ├── CreateChatSessionUseCase.ts
   │       │   ├── AddMessageUseCase.ts
   │       │   ├── SearchSessionsUseCase.ts
   │       │   └── ExportSessionUseCase.ts
   │       └── dto/
   │           ├── ChatSessionDTO.ts
   │           └── ChatMessageDTO.ts
   ├── infrastructure/
   │   └── persistence/
   │       ├── drizzle/
   │       │   ├── DrizzleChatSessionRepository.ts
   │       │   └── DrizzleChatMessageRepository.ts
   │       └── mappers/
   │           ├── ChatSessionMapper.ts
   │           └── ChatMessageMapper.ts
   └── db/
       └── schema/
           └── chat-history.ts    # Drizzleスキーマ（変更なし）
   ```

4. 型分離ルールを定義する:
   - **Domain型**: ビジネスロジックを持つ純粋なエンティティ・値オブジェクト
   - **DTO型**: レイヤー間データ転送用（プレーンオブジェクト）
   - **Persistence型**: Drizzleスキーマから推論される型（DB固有）

**期待される成果物**:

- `outputs/phase-1/architecture-requirements.md` - アーキテクチャ要件書

---

### タスク3: 移行戦略の策定（Strangler Fig Pattern）

**目的**: 段階的かつ安全に移行するための戦略を策定する

**実行手順**:

1. Strangler Fig Pattern適用計画を策定する:
   - **フェーズA**: 新アーキテクチャ層の並行実装（既存コードは変更しない）
   - **フェーズB**: 新実装への段階的切り替え（フィーチャーフラグ使用）
   - **フェーズC**: 旧実装の削除

2. 各フェーズの詳細を定義する:

   **フェーズA: 並行実装**
   - 新しいディレクトリ構造を作成
   - Domain層エンティティ・値オブジェクトを新規実装
   - Use Caseクラスを新規実装
   - 新リポジトリ実装を新規作成
   - マッパーを実装
   - 新旧両方のテストを維持

   **フェーズB: 段階的切り替え**
   - フィーチャーフラグ `USE_NEW_CHAT_HISTORY_ARCH` を導入
   - UI層からの呼び出しを新アーキテクチャ経由に切り替え
   - 旧ChatHistoryServiceへの直接呼び出しを禁止
   - 動作確認後、フラグをデフォルトONに変更

   **フェーズC: 旧実装削除**
   - フィーチャーフラグ完全ON確認後
   - `types/chat-session.ts`, `types/chat-message.ts` を削除
   - 旧ChatHistoryServiceを削除
   - 旧リポジトリを削除
   - 不要なimportを整理

3. ロールバック計画を策定する:
   - 各フェーズ完了後にテスト実行（リグレッション検出）
   - 問題発生時はフィーチャーフラグOFFで即座にロールバック
   - 重大問題発生時のgit revert手順

4. リスク軽減策を定義する:
   - 各フェーズ完了後に全テストスイート実行
   - フィーチャーフラグによる段階的ロールアウト
   - 手動テスト項目の事前定義

**期待される成果物**:

- `outputs/phase-1/migration-strategy.md` - 移行戦略書
- `outputs/phase-1/rollback-plan.md` - ロールバック計画

---

### タスク4: 受け入れ基準の定義

**目的**: リファクタリング完了の明確な判定基準を定義する

**実行手順**:

1. アーキテクチャ準拠基準を定義する:
   - [ ] Domain層がInfrastructure層に依存していないこと
   - [ ] ドメインエンティティがDrizzle型をimportしていないこと
   - [ ] リポジトリインターフェースがDomain層に配置されていること
   - [ ] リポジトリ実装がInfrastructure層に配置されていること
   - [ ] Use CaseがSingle Responsibility Principleを満たすこと
   - [ ] 型定義がDomain/DTO/Persistenceの3層に分離されていること
   - [ ] UIコンポーネントがContext/Hook経由でサービスにアクセスすること

2. コード品質基準を定義する:
   - [ ] 全テストがPASSすること
   - [ ] TypeScript型エラーが0件であること
   - [ ] ESLintエラーが0件であること
   - [ ] テストカバレッジ（Line）80%以上

3. 機能要件基準を定義する:
   - [ ] セッション作成が正常に動作すること
   - [ ] メッセージ追加が正常に動作すること
   - [ ] セッション検索が正常に動作すること
   - [ ] セッションエクスポートが正常に動作すること
   - [ ] お気に入り・ピン留め機能が正常に動作すること
   - [ ] 既存データとの互換性が保たれていること

**期待される成果物**:

- `outputs/phase-1/acceptance-criteria.md` - 受け入れ基準書

---

## 参照資料

| 参照資料                         | パス                                                                           | 内容                       |
| -------------------------------- | ------------------------------------------------------------------------------ | -------------------------- |
| チャット履歴インターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` | 既存インターフェース仕様   |
| アーキテクチャパターン           | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`   | 既存アーキテクチャパターン |
| Clean Architecture               | 外部参照: Robert C. Martin                                                     | Clean Architecture原則     |
| Domain-Driven Design             | 外部参照: Eric Evans                                                           | DDDパターン                |
| Strangler Fig Pattern            | 外部参照: Martin Fowler                                                        | 段階的移行パターン         |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                     | パス                                                                           | 内容                       |
| ---------------------------- | ------------------------------------------------------------------------------ | -------------------------- |
| チャット履歴インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` | 既存Repository/Service仕様 |
| アーキテクチャパターン       | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`   | 既存設計パターン           |
| データベース実装             | `.claude/skills/aiworkflow-requirements/references/database-implementation.md` | Drizzle ORM仕様            |

---

## 成果物

| 成果物               | パス                                               | 内容                    |
| -------------------- | -------------------------------------------------- | ----------------------- |
| 現状分析レポート     | `outputs/phase-1/current-architecture-analysis.md` | 違反箇所の詳細分析      |
| 依存関係図           | `outputs/phase-1/dependency-graph.md`              | 現状依存関係のMermaid図 |
| アーキテクチャ要件書 | `outputs/phase-1/architecture-requirements.md`     | 新アーキテクチャ要件    |
| 移行戦略書           | `outputs/phase-1/migration-strategy.md`            | Strangler Fig適用計画   |
| ロールバック計画     | `outputs/phase-1/rollback-plan.md`                 | 問題発生時の対応手順    |
| 受け入れ基準書       | `outputs/phase-1/acceptance-criteria.md`           | 完了判定基準            |

---

## 統合テスト連携

Clean Architecture準拠要件・レイヤー間接続要件を要件に明記すること:

- Domain層とApplication層のインターフェース定義
- Application層とInfrastructure層の依存性注入ポイント
- UI層からApplication層へのアクセス方法（Context/Hook）
- 各レイヤー間の契約（型定義・インターフェース）

---

## 完了条件

- [ ] 現状分析レポートが作成され、全違反箇所が特定されている
- [ ] 依存関係図が作成され、不正な依存が可視化されている
- [ ] レイヤー構成・依存関係ルール・ディレクトリ構造が定義されている
- [ ] 型分離ルール（Domain/DTO/Persistence）が定義されている
- [ ] Strangler Fig Pattern適用計画が策定されている
- [ ] ロールバック計画が策定されている
- [ ] 受け入れ基準が明確に定義されている
- [ ] 全成果物が `outputs/phase-1/` に出力されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] `artifacts.json` のPhase 1ステータスを更新

---

## 依存関係

- **前提**: なし（本タスクが起点）
- **後続**: Phase 2（設計）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/clean-architecture-refactoring/phase-2-design.md`
