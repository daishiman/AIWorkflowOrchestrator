/**
 * Entity テンプレート
 *
 * 使用方法:
 *   1. このファイルをコピーして新しいEntityを作成
 *   2. {{EntityName}} を実際のエンティティ名に置換
 *   3. フィールドと不変条件を実装
 */

// 型安全なID
export class {{EntityName}}Id {
  private constructor(private readonly value: string) {}

  static generate(): {{EntityName}}Id {
    return new {{EntityName}}Id(crypto.randomUUID());
  }

  static fromString(value: string): {{EntityName}}Id {
    if (!value || value.trim() === "") {
      throw new Error("{{EntityName}}Id cannot be empty");
    }
    return new {{EntityName}}Id(value);
  }

  equals(other: {{EntityName}}Id): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

// Entity本体
export class {{EntityName}} {
  private constructor(
    private readonly id: {{EntityName}}Id,
    // プロパティをここに追加
    // private name: string,
    // private status: Status,
  ) {
    this.validateInvariants();
  }

  // ファクトリメソッド
  static create(
    // 作成に必要なパラメータ
  ): {{EntityName}} {
    return new {{EntityName}}(
      {{EntityName}}Id.generate(),
      // パラメータを渡す
    );
  }

  // 復元用（リポジトリから）
  static reconstitute(
    id: {{EntityName}}Id,
    // 全プロパティ
  ): {{EntityName}} {
    return new {{EntityName}}(id);
  }

  // ゲッター
  getId(): {{EntityName}}Id {
    return this.id;
  }

  // ビジネスメソッド
  // someBusinessOperation(params): void {
  //   // ビジネスロジック
  //   this.validateInvariants();
  // }

  // 不変条件の検証
  private validateInvariants(): void {
    // 不変条件をここに実装
    // if (!this.someCondition) {
    //   throw new Error("Invariant violated: ...");
    // }
  }

  // 等価性はIDで判定
  equals(other: {{EntityName}}): boolean {
    return this.id.equals(other.id);
  }
}
