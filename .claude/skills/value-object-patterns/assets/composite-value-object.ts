/**
 * 複合値オブジェクトテンプレート
 *
 * このテンプレートは、複数の属性を持つ値オブジェクトの
 * 設計ガイドラインを提供します。
 *
 * 使用方法:
 * 1. {{ValueObjectName}} を実際の値オブジェクト名に置換
 * 2. {{Attribute1}}, {{Attribute2}} 等を実際の属性名に置換
 * 3. {{Type1}}, {{Type2}} 等を実際の型に置換
 * 4. バリデーションルールを実装
 * 5. 必要なドメイン操作を追加
 */

// ============================================
// エラークラス
// ============================================

/**
 * {{ValueObjectName}} のバリデーションエラー
 */
export class Invalid{{ValueObjectName}}Error extends Error {
  constructor(message: string) {
    super(`無効な{{ValueObjectName}}: ${message}`);
    this.name = 'Invalid{{ValueObjectName}}Error';
  }
}

/**
 * 複数のバリデーションエラーを集約
 */
export class {{ValueObjectName}}ValidationErrors extends Error {
  constructor(readonly errors: string[]) {
    super(`{{ValueObjectName}}のバリデーションエラー: ${errors.join(', ')}`);
    this.name = '{{ValueObjectName}}ValidationErrors';
  }
}

// ============================================
// 属性インターフェース
// ============================================

/**
 * {{ValueObjectName}} の属性（生成時の入力）
 */
export interface {{ValueObjectName}}Props {
  {{attribute1}}: {{Type1}};
  {{attribute2}}: {{Type2}};
  {{attribute3}}?: {{Type3}}; // オプショナル属性の例
}

// ============================================
// 値オブジェクト本体
// ============================================

/**
 * {{ValueObjectName}} 値オブジェクト
 *
 * [ここに値オブジェクトの説明を記述]
 *
 * 不変条件:
 * - [バリデーションルール1を記述]
 * - [バリデーションルール2を記述]
 * - [属性間の整合性ルールを記述]
 *
 * 使用例:
 * ```typescript
 * const value = {{ValueObjectName}}.create({
 *   {{attribute1}}: '...',
 *   {{attribute2}}: '...',
 * });
 * ```
 */
export class {{ValueObjectName}} {
  // ============================================
  // プロパティ（private readonly）
  // ============================================

  private readonly _{{attribute1}}: {{Type1}};
  private readonly _{{attribute2}}: {{Type2}};
  private readonly _{{attribute3}}: {{Type3}} | null;

  // ============================================
  // コンストラクタ（private）
  // ============================================

  private constructor(
    {{attribute1}}: {{Type1}},
    {{attribute2}}: {{Type2}},
    {{attribute3}}: {{Type3}} | null
  ) {
    this._{{attribute1}} = {{attribute1}};
    this._{{attribute2}} = {{attribute2}};
    this._{{attribute3}} = {{attribute3}};
  }

  // ============================================
  // ファクトリメソッド
  // ============================================

  /**
   * {{ValueObjectName}} を生成
   *
   * @param props 属性
   * @returns {{ValueObjectName}} インスタンス
   * @throws Invalid{{ValueObjectName}}Error バリデーション失敗時
   */
  static create(props: {{ValueObjectName}}Props): {{ValueObjectName}} {
    // 個別の正規化
    const {{attribute1}} = this.normalize{{Attribute1}}(props.{{attribute1}});
    const {{attribute2}} = this.normalize{{Attribute2}}(props.{{attribute2}});
    const {{attribute3}} = props.{{attribute3}}
      ? this.normalize{{Attribute3}}(props.{{attribute3}})
      : null;

    // バリデーション
    const errors = this.validate({
      {{attribute1}},
      {{attribute2}},
      {{attribute3}}: {{attribute3}} ?? undefined,
    });

    if (errors.length > 0) {
      if (errors.length === 1) {
        throw new Invalid{{ValueObjectName}}Error(errors[0]);
      }
      throw new {{ValueObjectName}}ValidationErrors(errors);
    }

    return new {{ValueObjectName}}({{attribute1}}, {{attribute2}}, {{attribute3}});
  }

  /**
   * 永続化データから復元
   *
   * @param data 永続化データ
   * @returns {{ValueObjectName}} インスタンス
   */
  static reconstitute(data: {
    {{attribute1}}: {{Type1}};
    {{attribute2}}: {{Type2}};
    {{attribute3}}?: {{Type3}} | null;
  }): {{ValueObjectName}} {
    // 永続化データは既にバリデーション済みと仮定
    return new {{ValueObjectName}}(
      data.{{attribute1}},
      data.{{attribute2}},
      data.{{attribute3}} ?? null
    );
  }

  // ============================================
  // 正規化（private）
  // ============================================

  private static normalize{{Attribute1}}(value: {{Type1}}): {{Type1}} {
    // 例: 文字列のトリム
    // if (typeof value === 'string') {
    //   return value.trim() as {{Type1}};
    // }
    return value;
  }

  private static normalize{{Attribute2}}(value: {{Type2}}): {{Type2}} {
    return value;
  }

  private static normalize{{Attribute3}}(value: {{Type3}}): {{Type3}} {
    return value;
  }

  // ============================================
  // バリデーション（private）
  // ============================================

  /**
   * すべての属性をバリデーション
   *
   * @returns エラーメッセージの配列（空なら有効）
   */
  private static validate(props: {{ValueObjectName}}Props): string[] {
    const errors: string[] = [];

    // 個別属性のバリデーション
    const {{attribute1}}Error = this.validate{{Attribute1}}(props.{{attribute1}});
    if ({{attribute1}}Error) errors.push({{attribute1}}Error);

    const {{attribute2}}Error = this.validate{{Attribute2}}(props.{{attribute2}});
    if ({{attribute2}}Error) errors.push({{attribute2}}Error);

    if (props.{{attribute3}}) {
      const {{attribute3}}Error = this.validate{{Attribute3}}(props.{{attribute3}});
      if ({{attribute3}}Error) errors.push({{attribute3}}Error);
    }

    // 属性間の整合性バリデーション
    const crossValidationErrors = this.validateCrossAttributes(props);
    errors.push(...crossValidationErrors);

    return errors;
  }

  private static validate{{Attribute1}}(value: {{Type1}}): string | null {
    if (!value) {
      return '{{attribute1}}は必須です';
    }
    // 追加のバリデーション
    return null;
  }

  private static validate{{Attribute2}}(value: {{Type2}}): string | null {
    if (!value) {
      return '{{attribute2}}は必須です';
    }
    // 追加のバリデーション
    return null;
  }

  private static validate{{Attribute3}}(value: {{Type3}}): string | null {
    // オプショナル属性のバリデーション
    return null;
  }

  /**
   * 属性間の整合性をバリデーション
   */
  private static validateCrossAttributes(props: {{ValueObjectName}}Props): string[] {
    const errors: string[] = [];

    // 例: 属性間の整合性チェック
    // if (props.{{attribute1}} > props.{{attribute2}}) {
    //   errors.push('{{attribute1}}は{{attribute2}}以下である必要があります');
    // }

    return errors;
  }

  // ============================================
  // ゲッター（読み取り専用）
  // ============================================

  get {{attribute1}}(): {{Type1}} {
    return this._{{attribute1}};
  }

  get {{attribute2}}(): {{Type2}} {
    return this._{{attribute2}};
  }

  get {{attribute3}}(): {{Type3}} | null {
    return this._{{attribute3}};
  }

  // ============================================
  // 派生プロパティ
  // ============================================

  // 例: 複数属性から派生する値
  // get fullValue(): string {
  //   return `${this._{{attribute1}}} ${this._{{attribute2}}}`;
  // }

  // 例: 計算プロパティ
  // get calculatedValue(): number {
  //   return /* 計算ロジック */;
  // }

  // ============================================
  // 等価性判定
  // ============================================

  /**
   * 等価性判定
   */
  equals(other: {{ValueObjectName}}): boolean {
    if (!(other instanceof {{ValueObjectName}})) {
      return false;
    }
    return (
      this._{{attribute1}} === other._{{attribute1}} &&
      this._{{attribute2}} === other._{{attribute2}} &&
      this._{{attribute3}} === other._{{attribute3}}
    );
  }

  // ============================================
  // 変更操作（新しいインスタンスを返す）
  // ============================================

  /**
   * {{attribute1}}を変更した新しいインスタンスを返す
   */
  with{{Attribute1}}(value: {{Type1}}): {{ValueObjectName}} {
    return {{ValueObjectName}}.create({
      {{attribute1}}: value,
      {{attribute2}}: this._{{attribute2}},
      {{attribute3}}: this._{{attribute3}} ?? undefined,
    });
  }

  /**
   * {{attribute2}}を変更した新しいインスタンスを返す
   */
  with{{Attribute2}}(value: {{Type2}}): {{ValueObjectName}} {
    return {{ValueObjectName}}.create({
      {{attribute1}}: this._{{attribute1}},
      {{attribute2}}: value,
      {{attribute3}}: this._{{attribute3}} ?? undefined,
    });
  }

  /**
   * {{attribute3}}を変更した新しいインスタンスを返す
   */
  with{{Attribute3}}(value: {{Type3}} | null): {{ValueObjectName}} {
    return {{ValueObjectName}}.create({
      {{attribute1}}: this._{{attribute1}},
      {{attribute2}}: this._{{attribute2}},
      {{attribute3}}: value ?? undefined,
    });
  }

  // ============================================
  // ドメイン操作（必要に応じて追加）
  // ============================================

  // 例: ドメイン固有の操作
  // someDomainOperation(): {{ValueObjectName}} {
  //   // 操作ロジック
  //   return {{ValueObjectName}}.create({...});
  // }

  // 例: 判定メソッド
  // isSpecialCondition(): boolean {
  //   return /* 判定ロジック */;
  // }

  // ============================================
  // 文字列表現
  // ============================================

  /**
   * 文字列表現
   */
  toString(): string {
    const parts = [
      `{{attribute1}}: ${this._{{attribute1}}}`,
      `{{attribute2}}: ${this._{{attribute2}}}`,
    ];
    if (this._{{attribute3}}) {
      parts.push(`{{attribute3}}: ${this._{{attribute3}}}`);
    }
    return `{{ValueObjectName}}(${parts.join(', ')})`;
  }

  /**
   * フォーマット済み文字列（表示用）
   */
  format(): string {
    // 例: 人間が読みやすい形式
    // return `${this._{{attribute1}}} - ${this._{{attribute2}}}`;
    return this.toString();
  }

  // ============================================
  // JSON変換
  // ============================================

  /**
   * JSON変換用
   */
  toJSON(): {{ValueObjectName}}Props {
    return {
      {{attribute1}}: this._{{attribute1}},
      {{attribute2}}: this._{{attribute2}},
      {{attribute3}}: this._{{attribute3}} ?? undefined,
    };
  }

  /**
   * プレーンオブジェクトに変換（永続化用）
   */
  toPersistence(): {
    {{attribute1}}: {{Type1}};
    {{attribute2}}: {{Type2}};
    {{attribute3}}: {{Type3}} | null;
  } {
    return {
      {{attribute1}}: this._{{attribute1}},
      {{attribute2}}: this._{{attribute2}},
      {{attribute3}}: this._{{attribute3}},
    };
  }
}
