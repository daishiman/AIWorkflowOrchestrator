# トランザクション設計テンプレート

## 基本情報

**操作名**: {{operation_name}}
**作成日**: {{date}}
**担当者**: {{author}}

## 操作概要

### ビジネス目的

{{business_purpose}}

### 関連エンティティ

| エンティティ | テーブル | 操作 | 説明 |
|-------------|---------|------|------|
| {{entity1}} | {{table1}} | INSERT/UPDATE/DELETE | {{description1}} |
| {{entity2}} | {{table2}} | INSERT/UPDATE/DELETE | {{description2}} |

## トランザクション境界

### 境界の定義

```
開始トリガー: {{start_trigger}}
終了トリガー: {{end_trigger}}
スコープ: {{scope}}
```

### 含まれる操作

1. {{operation1}}
2. {{operation2}}
3. {{operation3}}

### 除外する操作（トランザクション外）

- [ ] メール送信
- [ ] 外部API呼び出し
- [ ] ログ記録（非クリティカル）
- [ ] キャッシュ更新

## 分離レベル

### 選択した分離レベル

- [ ] READ COMMITTED（デフォルト）
- [ ] REPEATABLE READ
- [ ] SERIALIZABLE

### 選択理由

{{isolation_level_reason}}

### 発生しうる問題

| 問題 | 発生可能性 | 影響 | 対策 |
|------|-----------|------|------|
| Dirty Read | 防止 | - | - |
| Non-Repeatable Read | {{nr_possibility}} | {{nr_impact}} | {{nr_mitigation}} |
| Phantom Read | {{pr_possibility}} | {{pr_impact}} | {{pr_mitigation}} |

## ロック戦略

### 選択したロック方式

- [ ] 楽観的ロック（バージョンカラム）
- [ ] 悲観的ロック（SELECT FOR UPDATE）
- [ ] 混合（通常は楽観的、特定操作のみ悲観的）

### バージョンカラム（楽観的ロックの場合）

```typescript
interface {{EntityName}} {
  id: string
  // ... other fields
  version: number  // バージョンカラム
}
```

### FOR UPDATE対象（悲観的ロックの場合）

| テーブル | 条件 | ロックモード |
|---------|------|------------|
| {{table}} | {{condition}} | FOR UPDATE / FOR SHARE |

### デッドロック対策

- [ ] ロック順序の統一（ID昇順）
- [ ] タイムアウト設定
- [ ] リトライロジック

## エラーハンドリング

### エラー分類

| エラータイプ | PostgreSQLコード | 対応 | リトライ |
|-------------|-----------------|------|---------|
| 一意制約違反 | 23505 | 重複エラー返却 | ❌ |
| 外部キー違反 | 23503 | 参照エラー返却 | ❌ |
| シリアライゼーション失敗 | 40001 | リトライ | ✅ |
| デッドロック | 40P01 | リトライ | ✅ |

### リトライ設定

```typescript
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 100,  // ms
  backoffMultiplier: 2,
  jitter: true,
}
```

## ロールバック戦略

### 自動ロールバック条件

- 例外発生時
- バリデーション失敗時
- {{custom_rollback_condition}}

### セーブポイント（必要な場合）

- [ ] セーブポイント不要
- [ ] バッチ処理で個別失敗を許容するため使用

### 補償トランザクション（分散システムの場合）

| ステップ | 正常操作 | 補償操作 |
|---------|---------|---------|
| 1 | {{step1_execute}} | {{step1_compensate}} |
| 2 | {{step2_execute}} | {{step2_compensate}} |

## 実装コード

### TypeScript実装

```typescript
import { db } from '@/db'
import { {{table}} } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

interface {{OperationName}}Input {
  {{input_fields}}
}

interface {{OperationName}}Result {
  success: boolean
  data?: {{ResultType}}
  error?: {
    type: string
    message: string
  }
}

export async function {{operationName}}(
  input: {{OperationName}}Input
): Promise<{{OperationName}}Result> {
  // バリデーション（トランザクション外）
  const validationResult = validate{{OperationName}}Input(input)
  if (!validationResult.valid) {
    return {
      success: false,
      error: { type: 'VALIDATION', message: validationResult.message },
    }
  }

  // リトライラッパー
  return await withRetry(async () => {
    return await db.transaction(async (tx) => {
      // 1. {{step1_description}}
      {{step1_code}}

      // 2. {{step2_description}}
      {{step2_code}}

      // 3. {{step3_description}}
      {{step3_code}}

      return {
        success: true,
        data: {{result}},
      }
    }, {
      isolationLevel: '{{isolation_level}}',
    })
  }, RETRY_CONFIG)
}

// リトライユーティリティ
async function withRetry<T>(
  operation: () => Promise<T>,
  config: typeof RETRY_CONFIG
): Promise<T> {
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      if (!isRetryableError(error) || attempt >= config.maxRetries) {
        throw error
      }
      const delay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt)
      const jitter = config.jitter ? Math.random() * 50 : 0
      await sleep(delay + jitter)
    }
  }
  throw new Error('Max retries exceeded')
}
```

## テスト計画

### ユニットテスト

- [ ] 正常系: 全操作成功
- [ ] 異常系: バリデーションエラー
- [ ] 異常系: DB制約違反
- [ ] 異常系: 途中失敗でロールバック

### 並行テスト

- [ ] 同時更新時の競合処理
- [ ] デッドロック発生時のリカバリ
- [ ] シリアライゼーション失敗時のリトライ

### パフォーマンステスト

- [ ] 通常負荷での実行時間
- [ ] 高負荷時のスループット
- [ ] ロック待ち時間の計測

## チェックリスト

### 設計確認

- [ ] トランザクション境界はビジネス操作と一致しているか？
- [ ] 長時間操作（5秒超）は含まれていないか？
- [ ] 外部呼び出しはトランザクション外か？
- [ ] 適切な分離レベルが選択されているか？

### 実装確認

- [ ] バリデーションはトランザクション開始前か？
- [ ] 例外発生時にロールバックされるか？
- [ ] リトライ可能なエラーの処理があるか？
- [ ] デッドロック対策があるか？

### テスト確認

- [ ] 正常系テストが通過するか？
- [ ] 異常系テストが通過するか？
- [ ] 並行テストが通過するか？
- [ ] パフォーマンス要件を満たすか？

## 参考資料

- [ACID特性](../resources/acid-properties.md)
- [分離レベルガイド](../resources/isolation-levels.md)
- [ロック戦略](../resources/locking-strategies.md)
- [ロールバックパターン](../resources/rollback-patterns.md)
