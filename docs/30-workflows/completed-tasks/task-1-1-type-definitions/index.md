# TASK-1-1: 共通型定義の作成

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| タスクID   | TASK-1-1                  |
| ティア     | 1（MVP）                  |
| フェーズ   | Phase 1: 基盤層           |
| 優先度     | high                      |
| 複雑度     | small                     |
| 依存       | なし                      |
| ブロック   | TASK-2A, TASK-2B, TASK-2C |
| タグ       | backend, shared, types    |
| 作成日     | 2026-01-23                |
| 更新日     | 2026-01-23                |
| ステータス | pending                   |

---

## 1. 概要

### 1.1 目的

スキルインポート機能で使用する全ての型定義を `packages/shared` に作成する。この型定義は Main Process / Renderer Process の両方で使用され、型安全なIPC通信とデータ管理を実現する。

### 1.2 背景

- specification.md（§5.1）で詳細な型定義が設計済み
- 既存の `packages/shared/src/types/skill.ts` に基本的なスキル型が存在
- 新しいスキルインポート機能に必要な追加型（ストリーミングメッセージ、権限確認等）の定義が必要

### 1.3 スコープ

**対象**:

- specification.md §5.1 で定義された全型定義の実装
- 既存型との整合性確保
- 型エクスポートの設定

**対象外**:

- 値オブジェクト・ドメインモデルの実装（§5.0 は後続タスク）
- サービスクラスの実装
- UI コンポーネントの実装

---

## 2. 入力

| 入力               | パス                                                           | 説明                             |
| ------------------ | -------------------------------------------------------------- | -------------------------------- |
| 仕様書             | `docs/30-workflows/skill-import-agent-system/specification.md` | §5.1 型定義セクション            |
| 既存型定義パターン | `packages/shared/src/types/`                                   | プロジェクト標準の型定義スタイル |
| 既存skill.ts       | `packages/shared/src/types/skill.ts`                           | 拡張対象の既存ファイル           |

---

## 3. 出力

| 成果物           | パス                                 | 説明                           |
| ---------------- | ------------------------------------ | ------------------------------ |
| 型定義ファイル   | `packages/shared/src/types/skill.ts` | 全型定義（既存ファイルを拡張） |
| エクスポート更新 | `packages/shared/src/index.ts`       | 型エクスポートの追加           |

---

## 4. 実装する型定義一覧

### 4.1 スキルメタデータ系

| 型名               | 説明                                      |
| ------------------ | ----------------------------------------- |
| `SkillMetadata`    | スキル基本情報（SKILL.md frontmatter）    |
| `SkillSubResource` | スキル配下のサブリソース（agents/等）     |
| `SkillOtherFile`   | その他ファイル（EVALS.json, LOGS.md等）   |
| `ImportedSkill`    | インポート済みスキル（SkillMetadata拡張） |

### 4.2 実行関連

| 型名                     | 説明                            |
| ------------------------ | ------------------------------- |
| `SkillExecutionRequest`  | 実行リクエスト（Renderer→Main） |
| `SkillExecutionResponse` | 実行レスポンス（Main→Renderer） |
| `SkillExecutionStatus`   | 実行ステータス列挙型            |

### 4.3 ストリーミングメッセージ

| 型名                       | 説明                       |
| -------------------------- | -------------------------- |
| `SkillStreamMessage`       | Discriminated Union型      |
| `AssistantMessageContent`  | アシスタントメッセージ内容 |
| `ToolUseMessageContent`    | ツール使用メッセージ内容   |
| `ToolResultMessageContent` | ツール結果メッセージ内容   |
| `StatusMessageContent`     | ステータスメッセージ内容   |
| `ErrorMessageContent`      | エラーメッセージ内容       |

### 4.4 権限確認

| 型名                 | 説明                                |
| -------------------- | ----------------------------------- |
| `PermissionRequest`  | 権限確認リクエスト（Main→Renderer） |
| `PermissionResponse` | 権限確認レスポンス（Renderer→Main） |

---

## 5. Phase一覧

| Phase | ファイル                                                       | 概要                   |
| ----- | -------------------------------------------------------------- | ---------------------- |
| 1     | [phase-1-requirements.md](./phase-1-requirements.md)           | 要件定義               |
| 2     | [phase-2-design.md](./phase-2-design.md)                       | 設計                   |
| 3     | [phase-3-design-review.md](./phase-3-design-review.md)         | 設計レビューゲート     |
| 4     | [phase-4-test-creation.md](./phase-4-test-creation.md)         | テスト作成（TDD: Red） |
| 5     | [phase-5-implementation.md](./phase-5-implementation.md)       | 実装（TDD: Green）     |
| 6     | [phase-6-test-enhancement.md](./phase-6-test-enhancement.md)   | テスト拡充             |
| 7     | [phase-7-test-coverage.md](./phase-7-test-coverage.md)         | テストカバレッジ確認   |
| 8     | [phase-8-refactoring.md](./phase-8-refactoring.md)             | リファクタリング       |
| 9     | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | 品質保証               |
| 10    | [phase-10-final-review.md](./phase-10-final-review.md)         | 最終レビューゲート     |
| 11    | [phase-11-manual-testing.md](./phase-11-manual-testing.md)     | 手動テスト検証         |
| 12    | [phase-12-documentation.md](./phase-12-documentation.md)       | ドキュメント更新       |
| 13    | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | PR作成                 |

---

## 6. 完了条件

### 6.1 機能要件

- [ ] specification.md §5.1 の全型定義が実装されている
- [ ] 既存型との後方互換性が維持されている
- [ ] `packages/shared/src/index.ts` に型エクスポートが追加されている

### 6.2 品質要件

- [ ] TypeScript strict モードでコンパイルエラーがない
- [ ] `pnpm --filter @repo/shared build` が成功する
- [ ] JSDoc コメントが全ての public 型に付与されている

### 6.3 テスト要件

- [ ] 型定義の静的解析が通過する
- [ ] 他パッケージからのインポート確認テストがパスする

---

## 7. 参照資料

### 7.1 仕様書

| 資料名     | パス                                                           | セクション |
| ---------- | -------------------------------------------------------------- | ---------- |
| 機能仕様書 | `docs/30-workflows/skill-import-agent-system/specification.md` | §5.1       |

### 7.2 システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                   | パス                                                                         | 内容                     |
| -------------------------- | ---------------------------------------------------------------------------- | ------------------------ |
| アーキテクチャパターン     | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | 型定義の設計パターン     |
| Agent SDK インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`  | SDK関連型との整合性      |
| エラーハンドリング         | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        | エラーコード定義パターン |

### 7.3 既存実装

| 資料名        | パス                                        | 説明               |
| ------------- | ------------------------------------------- | ------------------ |
| 既存skill.ts  | `packages/shared/src/types/skill.ts`        | 拡張対象           |
| 既存index.ts  | `packages/shared/src/index.ts`              | エクスポート設定   |
| 参考: chat.ts | `packages/shared/src/types/chat-session.ts` | 型定義パターン参考 |

---

## 8. リスクと対策

| リスク                   | 影響度 | 対策                                        |
| ------------------------ | ------ | ------------------------------------------- |
| 既存型との名前衝突       | 中     | 既存型を確認し、必要に応じてnamespaceで分離 |
| 仕様書と既存実装の不整合 | 低     | 既存型は維持し、新型を追加                  |
| 他パッケージへの影響     | 低     | 型のみの変更のため影響は限定的              |

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-23 | 初版作成 |
