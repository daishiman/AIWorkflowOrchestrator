/**
 * エンティティテンプレート
 *
 * このテンプレートは、DDDのエンティティパターンに従った
 * ドメインエンティティの設計ガイドラインを提供します。
 *
 * 使用方法:
 * 1. {{EntityName}} を実際のエンティティ名に置換
 * 2. {{EntityName}}Id を識別子の型名に置換
 * 3. 必要な属性と不変条件を追加
 * 4. ビジネスメソッドを実装
 */

// ============================================
// 識別子の値オブジェクト（推奨）
// ============================================

/**
 * {{EntityName}}の一意識別子
 *
 * 値オブジェクトとして実装することで:
 * - 型安全性を確保（string との混同を防止）
 * - バリデーションを集約
 * - 不変性を保証
 */
export class {{EntityName}}Id {
  private constructor(private readonly value: string) {}

  /**
   * 新しいIDを生成
   */
  static generate(): {{EntityName}}Id {
    // UUID v4 などの生成ロジック
    const uuid = crypto.randomUUID();
    return new {{EntityName}}Id(uuid);
  }

  /**
   * 既存のID文字列から復元
   */
  static fromString(value: string): {{EntityName}}Id {
    if (!value || value.trim().length === 0) {
      throw new Error('{{EntityName}}Id cannot be empty');
    }
    return new {{EntityName}}Id(value);
  }

  /**
   * 等価性判定
   */
  equals(other: {{EntityName}}Id): boolean {
    return this.value === other.value;
  }

  /**
   * 文字列表現
   */
  toString(): string {
    return this.value;
  }
}

// ============================================
// エンティティ本体
// ============================================

/**
 * ステータスの列挙型（状態遷移がある場合）
 */
export type {{EntityName}}Status = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

/**
 * {{EntityName}} の属性インターフェース
 */
interface {{EntityName}}Props {
  id: {{EntityName}}Id;
  // 必須属性を追加
  // createdAt: Date;
  // updatedAt: Date;
  // status: {{EntityName}}Status;
}

/**
 * {{EntityName}} エンティティ
 *
 * 責務:
 * - 自身の不変条件を保護
 * - ビジネスロジックをカプセル化
 * - 状態遷移を制御
 */
export class {{EntityName}} {
  // ============================================
  // プロパティ（private で保護）
  // ============================================

  private readonly _id: {{EntityName}}Id;
  // private _status: {{EntityName}}Status;
  // private readonly _createdAt: Date;
  // private _updatedAt: Date;

  // ============================================
  // コンストラクタ（private で保護、ファクトリメソッド経由で生成）
  // ============================================

  private constructor(props: {{EntityName}}Props) {
    this._id = props.id;
    // this._status = props.status;
    // this._createdAt = props.createdAt;
    // this._updatedAt = props.updatedAt;

    // 不変条件の検証
    this.validateInvariants();
  }

  // ============================================
  // ファクトリメソッド
  // ============================================

  /**
   * 新しい{{EntityName}}を作成
   */
  static create(/* 必要な引数 */): {{EntityName}} {
    const id = {{EntityName}}Id.generate();
    const now = new Date();

    return new {{EntityName}}({
      id,
      // status: 'PENDING',
      // createdAt: now,
      // updatedAt: now,
    });
  }

  /**
   * 永続化データから復元（リポジトリ用）
   */
  static reconstitute(props: {{EntityName}}Props): {{EntityName}} {
    return new {{EntityName}}(props);
  }

  // ============================================
  // ゲッター（読み取り専用アクセス）
  // ============================================

  get id(): {{EntityName}}Id {
    return this._id;
  }

  // get status(): {{EntityName}}Status {
  //   return this._status;
  // }

  // get createdAt(): Date {
  //   return this._createdAt;
  // }

  // ============================================
  // ビジネスメソッド（状態遷移を含む）
  // ============================================

  /**
   * 状態遷移の例: アクティブ化
   *
   * 不変条件:
   * - PENDING 状態からのみ遷移可能
   */
  // activate(): void {
  //   if (this._status !== 'PENDING') {
  //     throw new Error('Only PENDING entities can be activated');
  //   }
  //   this._status = 'ACTIVE';
  //   this._updatedAt = new Date();
  // }

  /**
   * 状態遷移の例: 完了
   *
   * 不変条件:
   * - ACTIVE 状態からのみ遷移可能
   */
  // complete(): void {
  //   if (this._status !== 'ACTIVE') {
  //     throw new Error('Only ACTIVE entities can be completed');
  //   }
  //   this._status = 'COMPLETED';
  //   this._updatedAt = new Date();
  // }

  // ============================================
  // 不変条件の検証
  // ============================================

  /**
   * エンティティの不変条件を検証
   *
   * コンストラクタおよび状態変更後に呼び出す
   */
  private validateInvariants(): void {
    // 不変条件のチェックを実装
    // 例: if (!this._id) throw new Error('ID is required');
  }

  // ============================================
  // 等価性判定（ID ベース）
  // ============================================

  /**
   * 同一エンティティかどうかを判定
   */
  equals(other: {{EntityName}}): boolean {
    if (!(other instanceof {{EntityName}})) {
      return false;
    }
    return this._id.equals(other._id);
  }
}
