# Phase 2: 設計

## メタ情報

| 項目   | 値              |
| ------ | --------------- |
| Phase  | 2               |
| 機能名 | logging-service |
| 作成日 | 2026-01-07      |

## 目的

要件を実現可能な構造に落とし込む。ConversionLoggerクラスとその依存関係（LogRepository）のアーキテクチャを設計する。

## 使用スキル

| スキル                   | 選定理由                                             |
| ------------------------ | ---------------------------------------------------- |
| `architectural-patterns` | サービスクラスのアーキテクチャパターン選定           |
| `domain-modeling`        | ConversionLog/LogLevel/LogActionのドメインモデル設計 |
| `zod-validation`         | Zodスキーマによる型定義と入力検証設計                |

## 参照資料

| 資料名       | パス                                                              | 説明           |
| ------------ | ----------------------------------------------------------------- | -------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md`                      | Phase 1成果物  |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`                          | Phase 1成果物  |
| 元実装仕様   | `docs/30-workflows/unassigned-task/task-05-01-logging-service.md` | 参照実装コード |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                            | 内容               |
| ---------------- | --------------------------------------------------------------- | ------------------ |
| データベース仕様 | `.claude/skills/aiworkflow-requirements/references/database.md` | 既存テーブル設計   |
| 型定義仕様       | `.claude/skills/aiworkflow-requirements/references/types.md`    | 共通型定義パターン |

## 実行手順

### ステップ1: アーキテクチャ設計

`architectural-patterns` スキルを使用して、ConversionLoggerのアーキテクチャを設計する。

**設計ポイント**:

- バッファリング戦略（サイズ・時間ベース）
- 依存性注入（LogRepository）
- 非同期処理とエラーハンドリング

### ステップ2: ドメインモデル設計

`domain-modeling` スキルを使用して、以下のドメインモデルを設計する:

- `ConversionLog`: ログエントリ
- `LogLevel`: info/warn/error
- `LogAction`: convert/restore/delete/chunk/embed

### ステップ3: Zodスキーマ設計

`zod-validation` スキルを使用して、型定義とバリデーションスキーマを設計する。

```typescript
// 設計対象
export const logLevelSchema = z.enum(["info", "warn", "error"]);
export const logActionSchema = z.enum(["convert", "restore", "delete", "chunk", "embed"]);
export const conversionLogSchema = z.object({ ... });
```

## 統合テスト連携【必須】

統合ポイント/契約（API・スキーマ）を設計に反映する:

| 統合ポイント                     | 契約定義                                               |
| -------------------------------- | ------------------------------------------------------ |
| ConversionLogger → LogRepository | bulkInsert(logs: ConversionLog[]): Result<void, Error> |
| LogRepository → DB               | SQLiteテーブルへの一括INSERT                           |
| エラー伝播                       | Result型によるエラーハンドリング                       |

## 成果物

| 成果物          | パス                                     | 説明                         |
| --------------- | ---------------------------------------- | ---------------------------- |
| アーキテクチャ  | `outputs/phase-2/architecture-design.md` | システム構造・クラス図       |
| ドメインモデル  | `outputs/phase-2/domain-model.md`        | エンティティ・値オブジェクト |
| Zodスキーマ設計 | `outputs/phase-2/zod-schema-design.md`   | 型定義・バリデーション設計   |

## 完了条件

- [ ] ConversionLoggerのアーキテクチャが定義されている
- [ ] ドメインモデル（ConversionLog等）が設計されている
- [ ] Zodスキーマが設計されている
- [ ] 要件との整合性が確認されている
- [ ] 統合ポイント/契約が設計に反映されている
- [ ] **本Phase内の全スキルを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 1成果物・システム仕様）
2. architectural-patternsスキルの実行
3. domain-modelingスキルの実行
4. zod-validationスキルの実行
5. 統合テスト連携の実施（統合ポイント設計）
6. 成果物の作成・配置
7. 完了条件の検証

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各スキルの成果物が生成されている
- [ ] スキルフィードバックがLOGS.mdに記録されている
- [ ] artifacts.jsonが更新されている

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/logging-service --phase 2
```

## スキルフィードバック記録

Phase完了後、以下を記録してください:

| スキル                 | 結果                        | 備考                        |
| ---------------------- | --------------------------- | --------------------------- |
| architectural-patterns | {{success/failure/partial}} | {{SKILL_USAGE_DESCRIPTION}} |
| domain-modeling        | {{success/failure/partial}} | {{SKILL_USAGE_DESCRIPTION}} |
| zod-validation         | {{success/failure/partial}} | {{SKILL_USAGE_DESCRIPTION}} |

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-

## 次のPhase

Phase 3: 設計レビューゲート
