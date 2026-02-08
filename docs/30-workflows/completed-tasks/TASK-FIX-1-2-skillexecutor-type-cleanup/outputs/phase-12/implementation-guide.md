# TASK-FIX-1-2: SkillExecutor 型クリーンアップ 実装ガイド

## メタ情報

| 項目     | 内容                                    |
| -------- | --------------------------------------- |
| タスクID | TASK-FIX-1-2-skillexecutor-type-cleanup |
| Phase    | 12 - ドキュメント作成                   |
| 作成日   | 2026-02-08                              |

---

## Part 1: 中学生レベル概念説明

### 型の重複とは？

**日常の例え: 住所録の問題**

学校のクラスで、「山田さん」の連絡先を管理しているとします。

- **担任の先生**が持っている住所録には「山田太郎」の住所と電話番号が書いてある
- **保健室の先生**も同じ「山田太郎」の情報を別の紙に書いている

もし山田さんの電話番号が変わったら、どうなるでしょう？

- 担任の先生の住所録は更新したけど、保健室の方は古いまま
- 保健室から電話しようとしても繋がらない！

**これがプログラムでも起きていた問題です。**

### なぜ統一が必要か？

プログラムの世界では、「型」という設計図のようなものがあります。

**問題のあった状態（ビフォー）:**

```
apps/desktop/SkillExecutor.ts  →  ExecutionState（独自の設計図）
packages/shared/types/skill.ts →  ExecutionState（共通の設計図）
```

同じ名前なのに、2つの場所に別々に書いてありました。これだと:

- どちらが正しいか分からない
- 片方を直しても、もう片方は古いまま
- 間違いが起きやすい

**修正後の状態（アフター）:**

```
packages/shared/types/skill.ts → ExecutionState（唯一の設計図）
         ↓
apps/desktop/SkillExecutor.ts  → ここから借りてくる
```

「設計図」は1つの場所だけに置いて、必要な人はそこから借りてくる。
これなら、変更があっても1箇所直すだけでOK！

### この修正で何が良くなった？

1. **迷わない** - 「どっちが正しい？」という疑問がなくなる
2. **間違えない** - 1箇所しかないので、矛盾が起きない
3. **楽になる** - 変更は1箇所で済む

---

## Part 2: 開発者向け実装詳細

### 変更概要

SkillExecutor.ts で定義されていた5つの型を `@repo/shared` の正規定義に統一しました。

#### 削除した5型

| 型名                      | 説明                                                    | 移行先         |
| ------------------------- | ------------------------------------------------------- | -------------- |
| `ExecutionState`          | 実行状態（pending, running, completed, aborted, error） | `@repo/shared` |
| `ExecutionInfo`           | 実行情報（id, skillId, state, startedAt, completedAt）  | `@repo/shared` |
| `SkillExecutionErrorCode` | エラーコード（EXECUTION_FAILED, TIMEOUT等）             | `@repo/shared` |
| `SkillExecutionError`     | エラー情報（code, message, details）                    | `@repo/shared` |
| `ExecutionContext`        | 実行コンテキスト（内部用、abortController含む）         | `@repo/shared` |

### @repo/shared からのインポート方法

```typescript
import type {
  Skill,
  SkillPermissionResponse,
  IPermissionStore,
  // 統一された型（TASK-FIX-1-1 で追加）
  ExecutionState,
  ExecutionInfo,
  SkillExecutionError,
  ExecutionContext,
} from "@repo/shared";
```

### 残存型（SkillExecutor専用）

以下の型は SkillExecutor.ts に残っています。これらは将来のタスクで対応予定です。

| 型名                     | 理由                               | 対応タスク   |
| ------------------------ | ---------------------------------- | ------------ |
| `RetryableErrorType`     | リトライ機能固有                   | TASK-FIX-1-3 |
| `RetryConfig`            | リトライ設定                       | TASK-FIX-1-3 |
| `RetryableErrorResult`   | リトライ判定結果                   | TASK-FIX-1-3 |
| `SkillExecutionRequest`  | リクエスト型（拡張フィールドあり） | TASK-FIX-1-3 |
| `SkillExecutionResponse` | レスポンス型                       | TASK-FIX-1-3 |
| `SkillStreamMessageType` | ストリームメッセージタイプ         | TASK-FIX-1-4 |
| `SkillStreamMessage`     | ストリームメッセージ               | TASK-FIX-1-4 |
| `SkillMetadata`          | メタデータ（Skill拡張）            | TASK-FIX-1-5 |
| `ErrorCategory`          | Hooks用エラーカテゴリ              | 現状維持     |
| `HooksStreamMessage`     | Hooks用ストリームメッセージ        | 現状維持     |

### ファイル構成

```
packages/shared/
└── src/types/
    └── skill.ts           # ExecutionState等5型の正規定義

apps/desktop/
└── src/main/services/skill/
    └── SkillExecutor.ts   # @repo/shared から型をインポート
```

### 動作確認手順

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck

# テスト実行
pnpm --filter @repo/desktop test SkillExecutor

# 全体ビルド
pnpm --filter @repo/desktop build
```

### 関連リソース

- 設計ドキュメント: `docs/30-workflows/TASK-FIX-1-2-skillexecutor-type-cleanup/phase-02-design.md`
- 型定義ファイル: `packages/shared/src/types/skill.ts`
- テストファイル: `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.type-migration.test.ts`
