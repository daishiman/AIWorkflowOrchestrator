/**
 * ドメインサービステンプレート
 *
 * このテンプレートは、DDDのドメインサービスパターンに従った
 * 設計ガイドラインを提供します。
 *
 * 使用方法:
 * 1. {{ServiceName}} を実際のサービス名に置換
 * 2. 必要なドメインオブジェクトの型をインポート
 * 3. ビジネスロジックを実装
 */

// ============================================
// インターフェース（ドメイン層）
// ============================================

/**
 * {{ServiceName}}Service のインターフェース
 *
 * 責務:
 * - [サービスの責務を記述]
 *
 * 使用場面:
 * - [どのような場面で使用するかを記述]
 */
export interface I{{ServiceName}}Service {
  /**
   * [メソッドの説明]
   *
   * @param [パラメータ名] [パラメータの説明]
   * @returns [戻り値の説明]
   * @throws [例外の説明]
   */
  {{primaryOperation}}(/* params */): {{ReturnType}};

  // 追加のメソッドをここに定義
}

// ============================================
// 実装（ドメイン層）
// ============================================

/**
 * {{ServiceName}}Service 実装
 *
 * このサービスは以下のビジネスロジックを提供します:
 * - [ロジック1の説明]
 * - [ロジック2の説明]
 *
 * 設計原則:
 * - ステートレス: 状態を持たない
 * - 純粋なドメインロジック: インフラストラクチャに依存しない
 * - ユビキタス言語: ドメインの用語を使用
 */
export class {{ServiceName}}Service implements I{{ServiceName}}Service {
  // ============================================
  // 定数（ビジネスルール）
  // ============================================

  // 例: ビジネスルールの定数
  // private static readonly MAX_DISCOUNT_RATE = 0.3;
  // private static readonly TAX_RATE = 0.1;

  // ============================================
  // コンストラクタ
  // ============================================

  /**
   * コンストラクタ
   *
   * 注意: ドメインサービスはステートレスであるべき
   * 依存するオブジェクトがあれば、ここで注入
   */
  constructor(
    // 他のドメインサービスを依存として注入可能
    // private readonly otherService: IOtherService
  ) {}

  // ============================================
  // 主要なドメイン操作
  // ============================================

  /**
   * [操作の説明]
   *
   * ビジネスルール:
   * - [ルール1]
   * - [ルール2]
   *
   * @param [param] [説明]
   * @returns [説明]
   */
  {{primaryOperation}}(/* params */): {{ReturnType}} {
    // 1. 前提条件のチェック
    // this.validatePreconditions(/* params */);

    // 2. ビジネスロジックの実行
    // const result = this.executeBusinessLogic(/* params */);

    // 3. 結果の返却
    // return result;

    throw new Error('Not implemented');
  }

  // ============================================
  // 追加のドメイン操作
  // ============================================

  // 例: 計算メソッド
  // calculateSomething(input: InputType): OutputType {
  //   // 計算ロジック
  // }

  // 例: 検証メソッド
  // validateSomething(input: InputType): ValidationResult {
  //   // 検証ロジック
  // }

  // 例: 変換メソッド
  // convertSomething(input: InputType): OutputType {
  //   // 変換ロジック
  // }

  // ============================================
  // プライベートヘルパーメソッド
  // ============================================

  /**
   * 前提条件の検証
   */
  // private validatePreconditions(/* params */): void {
  //   // 前提条件のチェック
  //   // 違反している場合は例外をスロー
  // }

  /**
   * ビジネスロジックの実行
   */
  // private executeBusinessLogic(/* params */): ResultType {
  //   // コアロジックの実装
  // }

  /**
   * [ヘルパーメソッドの説明]
   */
  // private helperMethod(/* params */): ResultType {
  //   // ヘルパーロジック
  // }
}

// ============================================
// ドメイン例外
// ============================================

/**
 * {{ServiceName}} 固有のドメイン例外
 */
export class {{ServiceName}}Error extends Error {
  constructor(message: string) {
    super(message);
    this.name = '{{ServiceName}}Error';
  }
}

// 例: 具体的な例外クラス
// export class InsufficientFundsError extends {{ServiceName}}Error {
//   constructor(available: Money, required: Money) {
//     super(`残高不足: 利用可能 ${available.format()}, 必要 ${required.format()}`);
//     this.name = 'InsufficientFundsError';
//   }
// }

// ============================================
// 使用例（ドキュメント用）
// ============================================

/*
使用例:

```typescript
// アプリケーションサービスでの使用
class SomeApplicationService {
  constructor(
    private readonly {{serviceName}}Service: I{{ServiceName}}Service,
    private readonly repository: ISomeRepository
  ) {}

  async executeUseCase(command: SomeCommand): Promise<void> {
    // 1. リポジトリからエンティティを取得
    const entity = await this.repository.getById(command.id);

    // 2. ドメインサービスを使用してビジネスロジックを実行
    const result = this.{{serviceName}}Service.{{primaryOperation}}(entity);

    // 3. 結果を永続化
    await this.repository.save(entity);
  }
}
```

テスト例:

```typescript
describe('{{ServiceName}}Service', () => {
  let service: {{ServiceName}}Service;

  beforeEach(() => {
    service = new {{ServiceName}}Service();
  });

  describe('{{primaryOperation}}', () => {
    it('正常系: [期待される動作]', () => {
      // Arrange
      const input = createTestInput();

      // Act
      const result = service.{{primaryOperation}}(input);

      // Assert
      expect(result).toEqual(expectedValue);
    });

    it('異常系: [エラーケース]', () => {
      // Arrange
      const invalidInput = createInvalidInput();

      // Act & Assert
      expect(() => service.{{primaryOperation}}(invalidInput))
        .toThrow({{ServiceName}}Error);
    });
  });
});
```
*/
