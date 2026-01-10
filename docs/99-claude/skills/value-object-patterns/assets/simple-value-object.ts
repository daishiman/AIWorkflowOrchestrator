/**
 * 単純値オブジェクトテンプレート
 *
 * このテンプレートは、単一の属性を持つ値オブジェクトの
 * 設計ガイドラインを提供します。
 *
 * 使用方法:
 * 1. {{ValueObjectName}} を実際の値オブジェクト名に置換
 * 2. {{InternalType}} を内部の型（string, number等）に置換
 * 3. バリデーションルールを実装
 * 4. 必要なドメイン操作を追加
 */

// ============================================
// エラークラス
// ============================================

/**
 * {{ValueObjectName}} のバリデーションエラー
 */
export class Invalid{{ValueObjectName}}Error extends Error {
  constructor(value: unknown, reason?: string) {
    const message = reason
      ? `無効な{{ValueObjectName}}: ${value} (${reason})`
      : `無効な{{ValueObjectName}}: ${value}`;
    super(message);
    this.name = 'Invalid{{ValueObjectName}}Error';
  }
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
 *
 * 使用例:
 * ```typescript
 * const value = {{ValueObjectName}}.of('...');
 * ```
 */
export class {{ValueObjectName}} {
  // ============================================
  // 定数（バリデーションルール等）
  // ============================================

  // 例: 正規表現パターン
  // private static readonly PATTERN = /^[A-Z0-9]+$/;

  // 例: 最小/最大値
  // private static readonly MIN_VALUE = 0;
  // private static readonly MAX_VALUE = 100;

  // 例: 最小/最大長
  // private static readonly MIN_LENGTH = 1;
  // private static readonly MAX_LENGTH = 255;

  // ============================================
  // プロパティ（private readonly）
  // ============================================

  private constructor(private readonly value: {{InternalType}}) {}

  // ============================================
  // ファクトリメソッド
  // ============================================

  /**
   * 値から {{ValueObjectName}} を生成
   *
   * @param value 元の値
   * @returns {{ValueObjectName}} インスタンス
   * @throws Invalid{{ValueObjectName}}Error バリデーション失敗時
   */
  static of(value: {{InternalType}}): {{ValueObjectName}} {
    // 正規化（必要に応じて）
    const normalized = this.normalize(value);

    // バリデーション
    const error = this.validate(normalized);
    if (error) {
      throw new Invalid{{ValueObjectName}}Error(value, error);
    }

    return new {{ValueObjectName}}(normalized);
  }

  /**
   * 値の検証のみを行う（インスタンス生成なし）
   *
   * @param value 検証する値
   * @returns 有効な場合true
   */
  static isValid(value: {{InternalType}}): boolean {
    try {
      const normalized = this.normalize(value);
      return this.validate(normalized) === null;
    } catch {
      return false;
    }
  }

  /**
   * 文字列から復元（永続化データからの復元用）
   *
   * @param value 文字列値
   * @returns {{ValueObjectName}} インスタンス
   */
  static fromString(value: string): {{ValueObjectName}} {
    // {{InternalType}} が string でない場合は変換ロジックを追加
    return {{ValueObjectName}}.of(value as unknown as {{InternalType}});
  }

  // ============================================
  // バリデーション（private）
  // ============================================

  /**
   * 値を正規化
   */
  private static normalize(value: {{InternalType}}): {{InternalType}} {
    // 例: 文字列の場合
    // if (typeof value === 'string') {
    //   return value.trim().toLowerCase() as {{InternalType}};
    // }
    return value;
  }

  /**
   * 値を検証
   *
   * @returns エラーメッセージ（有効な場合はnull）
   */
  private static validate(value: {{InternalType}}): string | null {
    // 必須チェック
    if (value === null || value === undefined) {
      return '値は必須です';
    }

    // 例: 文字列の長さチェック
    // if (typeof value === 'string') {
    //   if (value.length < this.MIN_LENGTH) {
    //     return `${this.MIN_LENGTH}文字以上必要です`;
    //   }
    //   if (value.length > this.MAX_LENGTH) {
    //     return `${this.MAX_LENGTH}文字以下にしてください`;
    //   }
    // }

    // 例: 数値の範囲チェック
    // if (typeof value === 'number') {
    //   if (value < this.MIN_VALUE) {
    //     return `${this.MIN_VALUE}以上である必要があります`;
    //   }
    //   if (value > this.MAX_VALUE) {
    //     return `${this.MAX_VALUE}以下である必要があります`;
    //   }
    // }

    // 例: パターンマッチ
    // if (!this.PATTERN.test(String(value))) {
    //   return 'フォーマットが不正です';
    // }

    return null;
  }

  // ============================================
  // ゲッター
  // ============================================

  /**
   * 内部値を取得
   *
   * 注意: 通常はドメイン操作を使用し、直接の値アクセスは避ける
   */
  getValue(): {{InternalType}} {
    return this.value;
  }

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
    return this.value === other.value;
  }

  // ============================================
  // ドメイン操作（必要に応じて追加）
  // ============================================

  // 例: 変換操作（新しいインスタンスを返す）
  // transform(): {{ValueObjectName}} {
  //   const newValue = /* 変換ロジック */;
  //   return new {{ValueObjectName}}(newValue);
  // }

  // 例: 比較操作
  // isGreaterThan(other: {{ValueObjectName}}): boolean {
  //   return this.value > other.value;
  // }

  // 例: 派生値の取得
  // get derivedProperty(): SomeType {
  //   return /* 派生ロジック */;
  // }

  // ============================================
  // 文字列表現
  // ============================================

  /**
   * 文字列表現（永続化やログ出力用）
   */
  toString(): string {
    return String(this.value);
  }

  /**
   * フォーマット済み文字列（表示用）
   */
  format(): string {
    // 例: 金額のフォーマット
    // return new Intl.NumberFormat('ja-JP').format(Number(this.value));
    return this.toString();
  }

  // ============================================
  // JSON変換
  // ============================================

  /**
   * JSON変換用
   */
  toJSON(): {{InternalType}} {
    return this.value;
  }
}
