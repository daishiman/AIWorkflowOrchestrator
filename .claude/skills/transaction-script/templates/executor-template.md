# Executor実装テンプレート

## ディレクトリ構造

```
features/
└── [機能名]/
    ├── schema.ts
    ├── executor.ts
    └── __tests__/
        └── executor.test.ts
```

## schema.ts テンプレート

```typescript
import { z } from 'zod';

// ============================================
// 入力スキーマ
// ============================================
export const [機能名]InputSchema = z.object({
  // 必須フィールド
  id: z.string().uuid(),

  // オプショナルフィールド
  options: z.object({
    // ...
  }).optional(),
});

export type [機能名]Input = z.infer<typeof [機能名]InputSchema>;

// ============================================
// 出力スキーマ
// ============================================
export const [機能名]OutputSchema = z.object({
  success: z.boolean(),
  data: z.object({
    // ...
  }),
});

export type [機能名]Output = z.infer<typeof [機能名]OutputSchema>;
```

## executor.ts テンプレート

```typescript
import { [機能名]Input, [機能名]Output, [機能名]InputSchema } from './schema';

/**
 * [機能名]Executor
 *
 * [機能の説明を記載]
 */
export class [機能名]Executor implements IWorkflowExecutor<[機能名]Input, [機能名]Output> {

  constructor(
    // 依存性を注入
    private readonly repository: IRepository,
  ) {}

  /**
   * [機能名]を実行する
   */
  async execute(input: [機能名]Input): Promise<[機能名]Output> {
    // ============================================
    // 1. 入力検証
    // ============================================
    const validatedInput = [機能名]InputSchema.parse(input);

    // ============================================
    // 2. データ取得
    // ============================================
    const entity = await this.repository.findById(validatedInput.id);

    if (!entity) {
      throw new NotFoundError('[Entity] not found');
    }

    // ============================================
    // 3. ビジネスロジック
    // ============================================
    // ビジネスルールを適用
    const result = this.applyBusinessRules(entity, validatedInput);

    // ============================================
    // 4. 永続化
    // ============================================
    await this.repository.save(result);

    // ============================================
    // 5. 結果返却
    // ============================================
    return {
      success: true,
      data: {
        // 必要なデータを返却
      },
    };
  }

  // ============================================
  // プライベートメソッド
  // ============================================

  /**
   * ビジネスルールを適用
   */
  private applyBusinessRules(entity: Entity, input: [機能名]Input): Entity {
    // ビジネスロジックを実装
    return entity;
  }
}
```

## executor.test.ts テンプレート

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { [機能名]Executor } from '../executor';
import type { IRepository } from '@/interfaces';

describe('[機能名]Executor', () => {
  // ============================================
  // Setup
  // ============================================
  let executor: [機能名]Executor;
  let mockRepository: {
    findById: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      save: vi.fn(),
    };

    executor = new [機能名]Executor(mockRepository as unknown as IRepository);
  });

  // ============================================
  // 正常系テスト
  // ============================================
  describe('正常系', () => {
    it('正常に処理を完了する', async () => {
      // Arrange
      const input = {
        id: 'test-id',
      };

      mockRepository.findById.mockResolvedValue({
        id: 'test-id',
        // ...
      });

      // Act
      const result = await executor.execute(input);

      // Assert
      expect(result.success).toBe(true);
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  // ============================================
  // 異常系テスト
  // ============================================
  describe('異常系', () => {
    it('エンティティが見つからない場合エラーを投げる', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(executor.execute({ id: 'invalid-id' }))
        .rejects
        .toThrow(NotFoundError);
    });

    it('入力検証に失敗した場合エラーを投げる', async () => {
      // Arrange
      const invalidInput = { id: 'not-a-uuid' };

      // Act & Assert
      await expect(executor.execute(invalidInput))
        .rejects
        .toThrow();
    });
  });

  // ============================================
  // エッジケーステスト
  // ============================================
  describe('エッジケース', () => {
    it('空のオプションで処理できる', async () => {
      // Arrange
      const input = {
        id: 'test-id',
        options: {},
      };

      mockRepository.findById.mockResolvedValue({ id: 'test-id' });

      // Act
      const result = await executor.execute(input);

      // Assert
      expect(result.success).toBe(true);
    });
  });
});
```

## 使用方法

1. ディレクトリを作成:
   ```bash
   mkdir -p src/features/[機能名]/__tests__
   ```

2. テンプレートをコピーし、[機能名]を置換

3. スキーマを定義

4. テストを先に作成（TDD）

5. Executorを実装

6. テストを実行して検証

## チェックリスト

### 実装前

- [ ] 機能の責任範囲は明確か？
- [ ] 入出力は定義されているか？
- [ ] 必要な依存性は特定されているか？

### 実装後

- [ ] すべてのテストがパスするか？
- [ ] エラーケースは網羅されているか？
- [ ] ビジネスロジックは明確か？
