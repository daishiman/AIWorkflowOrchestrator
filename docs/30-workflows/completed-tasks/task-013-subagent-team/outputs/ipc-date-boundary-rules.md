# IPC Date Boundary Rules

> 作成日: 2026-02-25 | 監査元: task-013B データフロー監査（SubAgent-B）

## 統一ルール（S19準拠）

1. **IPC境界を越えるDateフィールド**: `string; // ISO 8601` を使用する
2. **Main Process内部**: `Date` オブジェクトを許容するが、ハンドラ戻り値で `.toISOString()` に変換する
3. **Renderer側**: `string` として受け取り、表示時に `new Date(isoString)` で復元する
4. **nullableなDateフィールド**: `string | null; // ISO 8601` と定義する
5. **仕様書の型注記**: `@format ISO 8601` JSDocと `// ISO 8601` インラインコメントの両方を付与する

### S19の3要件チェックリスト

すべてのIPC境界Dateフィールドは以下の3要件を満たすこと：

- [ ] 型が `string`（または `string | null`）である
- [ ] `/** @format ISO 8601 — IPC経由では string として送受信 */` JSDocが付与されている
- [ ] `// ISO 8601` インラインコメントが付与されている

## 全Dateフィールド準拠状況テーブル

### 準拠フィールド（15/18件）

| #   | フィールド名  | 仕様書  | インターフェース     | 型               | nullable | 判定    |
| --- | ------------- | ------- | -------------------- | ---------------- | -------- | ------- |
| 1   | `importedAt`  | TASK-9F | `ImportResult`       | `string`         | No       | ✅ PASS |
| 2   | `lastRun`     | TASK-9G | `ScheduledSkill`     | `string \| null` | Yes      | ✅ PASS |
| 3   | `nextRun`     | TASK-9G | `ScheduledSkill`     | `string \| null` | Yes      | ✅ PASS |
| 4   | `runAt`       | TASK-9G | `SkillSchedule`      | `string \| null` | Yes      | ✅ PASS |
| 5   | `startedAt`   | TASK-9G | `ScheduledRunResult` | `string`         | No       | ✅ PASS |
| 6   | `completedAt` | TASK-9G | `ScheduledRunResult` | `string \| null` | Yes      | ✅ PASS |
| 7   | `startedAt`   | TASK-9H | `DebugSession`       | `string`         | No       | ✅ PASS |
| 8   | `timestamp`   | TASK-9H | `DebugStep`          | `string`         | No       | ✅ PASS |
| 9   | `startTime`   | TASK-9H | `CallStackEntry`     | `string`         | No       | ✅ PASS |
| 10  | `generatedAt` | TASK-9I | `GeneratedDoc`       | `string`         | No       | ✅ PASS |
| 11  | `timestamp`   | TASK-9J | `SkillUsageEvent`    | `string`         | No       | ✅ PASS |
| 12  | `lastUsed`    | TASK-9J | `SkillStatistics`    | `string \| null` | Yes      | ✅ PASS |
| 13  | `start`       | TASK-9J | `AnalyticsPeriod`    | `string`         | No       | ✅ PASS |
| 14  | `end`         | TASK-9J | `AnalyticsPeriod`    | `string`         | No       | ✅ PASS |
| 15  | `timestamp`   | TASK-9J | `TrendDataPoint`     | `string`         | No       | ✅ PASS |

### 違反フィールド（3/18件）

| ID  | フィールド名 | 仕様書  | インターフェース       | 現在の型 | 違反内容                                                                             | 修正方針                                        |
| --- | ------------ | ------- | ---------------------- | -------- | ------------------------------------------------------------------------------------ | ----------------------------------------------- |
| M-1 | `lastUsed`   | TASK-9J | `SkillUsageSummary`    | `string` | nullable不整合。`SkillStatistics.lastUsed` は `string \| null` だがこちらは `string` | `string` → `string \| null; // ISO 8601` に変更 |
| M-2 | `createdAt`  | TASK-9D | `SkillChainDefinition` | `string` | `@format` JSDocと `// ISO 8601` コメントの両方が欠落                                 | JSDocとコメントを追加                           |
| M-3 | `updatedAt`  | TASK-9D | `SkillChainDefinition` | `string` | `@format` JSDocと `// ISO 8601` コメントの両方が欠落                                 | M-2と同形式で追加                               |

### TASK-9D 修正テンプレート

```typescript
// 修正前（TASK-9D task-023e-task-9d-skill-chain.md L72-73）
export interface SkillChainDefinition {
  // ...
  createdAt: string;
  updatedAt: string;
}

// 修正後
export interface SkillChainDefinition {
  // ...
  /** @format ISO 8601 — IPC経由では string として送受信 */
  createdAt: string; // ISO 8601
  /** @format ISO 8601 — IPC経由では string として送受信 */
  updatedAt: string; // ISO 8601
}
```

TASK-9D には「IPC シリアライズ方針（Date 型）」セクションが存在しないため、他6タスク（9F/9G/9H/9I/9J の Step 1 直後）と同形式で追加する。

### TASK-9J 修正テンプレート

```typescript
// 修正前（TASK-9J task-023d-task-9j-skill-analytics.md L129）
export interface SkillUsageSummary {
  skillName: string;
  executionCount: number;
  /** @format ISO 8601 */
  lastUsed: string; // ISO 8601
}

// 修正後
export interface SkillUsageSummary {
  skillName: string;
  executionCount: number;
  /** @format ISO 8601 */
  lastUsed: string | null; // ISO 8601
}
```

## DTO→Props変換時のDate処理パターン

IPC境界のISO 8601文字列をRenderer側で扱う標準パターン：

```typescript
// 1. 非nullableフィールドの復元
const startedAt = new Date(response.startedAt);

// 2. nullableフィールドの復元
const lastRun = response.lastRun ? new Date(response.lastRun) : null;

// 3. 表示用フォーマット
const displayDate = startedAt.toLocaleDateString("ja-JP");
const displayTime = startedAt.toLocaleTimeString("ja-JP");
const displayISO = response.startedAt; // そのまま表示

// 4. 比較演算
const isRecent = Date.now() - startedAt.getTime() < 24 * 60 * 60 * 1000;
```

## 例外フィールド

| フィールド             | 所属型               | 型                 | 理由                                                                                                      |
| ---------------------- | -------------------- | ------------------ | --------------------------------------------------------------------------------------------------------- |
| `BackupInfo.timestamp` | `BackupInfo`（正本） | `number`（ミリ秒） | バックアップファイル名生成（`{filename}.backup.{timestamp}`）に使用するためnumber型が適切。ISO 8601対象外 |

## 正本との関係

正本 `interfaces-agent-sdk-skill.md` のDate型フィールド（`Skill.lastModified: Date`、`SkillRunResult.startedAt/completedAt: Date`、`BackupInfo.createdAt: Date`）はMain Process内部の型定義であり、IPC境界型ではない。S19の適用基準「同一プロセス内のDate型 → 不要（Date型のまま使用）」に該当し、矛盾はない。

## コード例の不整合

| 仕様書  | 箇所                                        | 問題                                                                                     | 修正方針                                     |
| ------- | ------------------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------- |
| TASK-9J | 「スキル実行時の自動記録」コード例 L241-242 | `timestamp: new Date()` で Date オブジェクトを渡しているが、型定義は `timestamp: string` | `timestamp: new Date().toISOString()` に修正 |

## 未定義型のDate含有可能性

| 型名           | 仕様書  | 状況               | Date型追加見込み                                                                 |
| -------------- | ------- | ------------------ | -------------------------------------------------------------------------------- |
| `ForkMetadata` | TASK-9E | 参照のみで定義なし | `forkedAt: string; // ISO 8601` を含む見込み                                     |
| `DebugEvent`   | TASK-9H | 参照のみで定義なし | `session_completed` バリアントに `completedAt: string; // ISO 8601` を含む見込み |
