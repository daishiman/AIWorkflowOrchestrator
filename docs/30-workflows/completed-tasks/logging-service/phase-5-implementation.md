# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値              |
| ------ | --------------- |
| Phase  | 5               |
| 機能名 | logging-service |
| 作成日 | 2026-01-07      |

## 目的

テストを通すための最小限の実装を行う（Green状態）。

## 使用スキル

| スキル                    | 選定理由                             |
| ------------------------- | ------------------------------------ |
| `clean-code-practices`    | 読みやすく保守しやすいコードの実装   |
| `error-handling-patterns` | Result型によるエラーハンドリング実装 |
| `type-safety-patterns`    | TypeScript型安全性の確保             |

## 参照資料

| 資料名         | パス                                                              | 説明           |
| -------------- | ----------------------------------------------------------------- | -------------- |
| テスト仕様書   | `outputs/phase-4/test-specification.md`                           | Phase 4成果物  |
| アーキテクチャ | `outputs/phase-2/architecture-design.md`                          | Phase 2成果物  |
| 元実装仕様     | `docs/30-workflows/unassigned-task/task-05-01-logging-service.md` | 参照実装コード |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                              | 内容                       |
| ---------------- | ----------------------------------------------------------------- | -------------------------- |
| 変換処理仕様     | `.claude/skills/aiworkflow-requirements/references/conversion.md` | 変換処理の全体フロー       |
| データベース仕様 | `.claude/skills/aiworkflow-requirements/references/database.md`   | テーブル設計・リレーション |
| 型定義仕様       | `.claude/skills/aiworkflow-requirements/references/types.md`      | 共通型定義パターン         |

## 実行手順

### ステップ1: 型定義ファイル作成

`type-safety-patterns` スキルを参照し、types.tsを作成する。

```typescript
// packages/shared/src/services/logging/types.ts
import { z } from "zod";

export const logLevelSchema = z.enum(["info", "warn", "error"]);
export type LogLevel = z.infer<typeof logLevelSchema>;

export const logActionSchema = z.enum([
  "convert",
  "restore",
  "delete",
  "chunk",
  "embed",
]);
export type LogAction = z.infer<typeof logActionSchema>;

export const conversionLogSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.date(),
  level: logLevelSchema,
  fileId: z.string(),
  fileName: z.string(),
  conversionId: z.string().optional(),
  action: logActionSchema,
  message: z.string(),
  details: z.record(z.unknown()).optional(),
  durationMs: z.number().optional(),
  errorStack: z.string().optional(),
});

export type ConversionLog = z.infer<typeof conversionLogSchema>;
```

### ステップ2: ConversionLoggerクラス実装

`clean-code-practices` と `error-handling-patterns` スキルを参照し、conversion-logger.tsを作成する。

元タスク指示書の実装仕様を参考に、以下を実装:

- info/warn/errorメソッド
- バッファリングロジック
- 自動フラッシュ機能
- batchメソッド
- disposeメソッド

### ステップ3: テスト実行（Green確認）

```bash
pnpm --filter @repo/shared test:run
```

## 統合テスト連携【必須】

LogRepository接続の実装とテスト支援コード整備:

| 実装項目           | 内容                            |
| ------------------ | ------------------------------- |
| LogRepository接続  | bulkInsert呼び出しの実装        |
| エラーハンドリング | Result型によるエラー伝播        |
| 非同期処理         | setIntervalによる自動フラッシュ |

## 成果物

| 成果物         | パス                                                        | 説明           |
| -------------- | ----------------------------------------------------------- | -------------- |
| 型定義ファイル | `packages/shared/src/services/logging/types.ts`             | Zodスキーマ/型 |
| ロガー実装     | `packages/shared/src/services/logging/conversion-logger.ts` | サービスクラス |

## 完了条件

- [ ] すべてのテストが成功状態（Green）
- [ ] 実装が最小限に抑えられている
- [ ] types.tsが作成されている
- [ ] conversion-logger.tsが作成されている
- [ ] LogRepository接続が実装されている
- [ ] **本Phase内の全スキルを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test:run

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
```

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. type-safety-patternsスキルの実行（types.ts作成）
3. clean-code-practicesスキルの実行
4. error-handling-patternsスキルの実行
5. conversion-logger.tsの実装
6. Green状態の確認
7. 成果物の配置確認
8. 完了条件の検証

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各スキルの成果物が生成されている
- [ ] スキルフィードバックがLOGS.mdに記録されている
- [ ] artifacts.jsonが更新されている

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/logging-service --phase 5
```

## スキルフィードバック記録

Phase完了後、以下を記録してください:

| スキル                  | 結果                        | 備考                        |
| ----------------------- | --------------------------- | --------------------------- |
| clean-code-practices    | {{success/failure/partial}} | {{SKILL_USAGE_DESCRIPTION}} |
| error-handling-patterns | {{success/failure/partial}} | {{SKILL_USAGE_DESCRIPTION}} |
| type-safety-patterns    | {{success/failure/partial}} | {{SKILL_USAGE_DESCRIPTION}} |

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-

## 次のPhase

Phase 6: テスト拡充
