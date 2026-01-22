# Phase 1 - タスク6: スコープ定義書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 1                                 |
| タスク番号 | 6                                 |
| 作成日     | 2026-01-22                        |
| 機能名     | drizzle-repository-implementation |

---

## 実装スコープ（含むもの）

### 機能実装

| 成果物                         | 配置先                                                                  | 概要                                  |
| ------------------------------ | ----------------------------------------------------------------------- | ------------------------------------- |
| `DrizzleChatSessionRepository` | `packages/shared/src/features/chat-history/infrastructure/persistence/` | IChatSessionRepository の Drizzle実装 |
| `DrizzleChatMessageRepository` | `packages/shared/src/features/chat-history/infrastructure/persistence/` | IChatMessageRepository の Drizzle実装 |

### テスト作成

| 成果物                                 | 配置先                                                                            | 概要                              |
| -------------------------------------- | --------------------------------------------------------------------------------- | --------------------------------- |
| `DrizzleChatSessionRepository.test.ts` | `packages/shared/src/features/chat-history/infrastructure/persistence/__tests__/` | Session Repository ユニットテスト |
| `DrizzleChatMessageRepository.test.ts` | `packages/shared/src/features/chat-history/infrastructure/persistence/__tests__/` | Message Repository ユニットテスト |

### 統合テスト

| 成果物                                 | 配置先                                                                            | 概要                         |
| -------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------- |
| `DrizzleRepositoryIntegration.test.ts` | `packages/shared/src/features/chat-history/infrastructure/persistence/__tests__/` | Repository-DB接続 統合テスト |

### メソッド実装一覧

#### DrizzleChatSessionRepository

| メソッド       | 実装対象 |
| -------------- | -------- |
| `findById`     | ✅       |
| `findByUserId` | ✅       |
| `findPinned`   | ✅       |
| `search`       | ✅       |
| `save`         | ✅       |
| `delete`       | ✅       |
| `exists`       | ✅       |
| `countPinned`  | ✅       |

#### DrizzleChatMessageRepository

| メソッド                | 実装対象 |
| ----------------------- | -------- |
| `findById`              | ✅       |
| `findBySessionId`       | ✅       |
| `findLatestBySessionId` | ✅       |
| `countBySessionId`      | ✅       |
| `save`                  | ✅       |
| `saveMany`              | ✅       |
| `delete`                | ✅       |
| `deleteBySessionId`     | ✅       |

---

## 除外事項（含まないもの）

### 別タスクで実施

| 除外事項                   | 理由                               | 担当タスク |
| -------------------------- | ---------------------------------- | ---------- |
| UI統合                     | Repository層のみの実装タスク       | 別タスク   |
| React Context DI実装       | DIコンテナ構築は別タスク           | UT-006     |
| マイグレーションスクリプト | 既存スキーマを使用（新規作成不要） | -          |

### 将来対応

| 除外事項               | 理由                                     | 対応時期 |
| ---------------------- | ---------------------------------------- | -------- |
| ソフトデリート実装     | `deletedAt` フィールドは存在するが未使用 | 将来     |
| 全文検索（FTS5）       | SQLite FTSは将来拡張として検討           | 将来     |
| 添付ファイル対応       | `attachments` フィールドは将来対応       | 将来     |
| システムプロンプト保存 | `systemPrompt` フィールドは将来対応      | 将来     |
| キャッシュレイヤー     | パフォーマンス最適化として将来検討       | 将来     |

---

## 技術的前提条件

### 使用技術

| 項目     | 技術/バージョン       |
| -------- | --------------------- |
| ORM      | Drizzle ORM           |
| Database | SQLite (libSQL/Turso) |
| Testing  | Vitest                |
| Language | TypeScript 5.x        |
| Runtime  | Node.js / Electron    |

### 既存資産の再利用

| 既存資産                 | 再利用方針                 |
| ------------------------ | -------------------------- |
| `ChatSessionMapper`      | そのまま再利用（変更なし） |
| `ChatMessageMapper`      | そのまま再利用（変更なし） |
| `IChatSessionRepository` | インターフェースとして実装 |
| `IChatMessageRepository` | インターフェースとして実装 |
| DBスキーマ定義           | 既存スキーマをそのまま使用 |

### 依存関係

| 依存パッケージ   | 用途                     |
| ---------------- | ------------------------ |
| `drizzle-orm`    | ORM本体                  |
| `@libsql/client` | SQLite (libSQL) ドライバ |
| `vitest`         | テストフレームワーク     |

---

## 成果物チェックリスト

### Phase 1 完了時点

- [x] `interface-analysis.md` - インターフェース分析
- [x] `schema-entity-mapping.md` - スキーマ-エンティティ対応表
- [x] `mapper-analysis.md` - Mapper分析
- [x] `functional-requirements.md` - 機能要件定義書
- [x] `non-functional-requirements.md` - 非機能要件定義書
- [x] `scope-definition.md` - スコープ定義書（本ドキュメント）

### 全体完了時点

- [ ] `DrizzleChatSessionRepository.ts` - 本番実装
- [ ] `DrizzleChatMessageRepository.ts` - 本番実装
- [ ] `DrizzleChatSessionRepository.test.ts` - ユニットテスト
- [ ] `DrizzleChatMessageRepository.test.ts` - ユニットテスト
- [ ] `DrizzleRepositoryIntegration.test.ts` - 統合テスト
- [ ] 実装ガイドドキュメント

---

## リスクと対策

| リスク                       | 影響度 | 対策                                  |
| ---------------------------- | ------ | ------------------------------------- |
| 既存Mapperとの型不整合       | 中     | Phase 1で型互換性を確認済み           |
| トランザクション処理の複雑化 | 低     | Drizzle ORM のトランザクションAPI使用 |
| テスト環境でのDB接続         | 中     | in-memory SQLite でモック化           |

---

## 完了確認

- [x] 実装スコープ（DrizzleChatSessionRepository, DrizzleChatMessageRepository）が明記されている
- [x] ユニットテスト・統合テスト作成が含まれている
- [x] 除外事項（UI統合, React Context DI, マイグレーション）が明記されている
- [x] 既存資産の再利用方針が明記されている
- [x] 技術的前提条件が明記されている
