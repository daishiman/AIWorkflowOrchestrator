/**
 * 集約テンプレート
 *
 * このテンプレートは、DDDの集約パターンに従った
 * 設計ガイドラインを提供します。
 *
 * 集約 = 集約ルート（エンティティ） + 内部エンティティ + 値オブジェクト
 *
 * 使用方法:
 * 1. {{AggregateRoot}} を集約ルートのエンティティ名に置換
 * 2. {{InternalEntity}} を内部エンティティ名に置換
 * 3. 不変条件と状態遷移を実装
 */

// ============================================
// 識別子の値オブジェクト
// ============================================

export class {{AggregateRoot}}Id {
  private constructor(private readonly value: string) {}

  static generate(): {{AggregateRoot}}Id {
    return new {{AggregateRoot}}Id(crypto.randomUUID());
  }

  static fromString(value: string): {{AggregateRoot}}Id {
    if (!value) throw new Error('{{AggregateRoot}}Id cannot be empty');
    return new {{AggregateRoot}}Id(value);
  }

  equals(other: {{AggregateRoot}}Id): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

// ============================================
// 内部エンティティ（外部からは直接アクセス不可）
// ============================================

/**
 * 内部エンティティの識別子
 */
class {{InternalEntity}}Id {
  private constructor(private readonly value: string) {}

  static generate(): {{InternalEntity}}Id {
    return new {{InternalEntity}}Id(crypto.randomUUID());
  }

  static fromString(value: string): {{InternalEntity}}Id {
    return new {{InternalEntity}}Id(value);
  }

  equals(other: {{InternalEntity}}Id): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

/**
 * 内部エンティティ
 *
 * 注意: この型は集約の外部に公開しない
 * 集約ルート経由でのみ操作する
 */
interface {{InternalEntity}}Props {
  id: {{InternalEntity}}Id;
  // 属性を追加
}

class {{InternalEntity}} {
  private readonly _id: {{InternalEntity}}Id;
  // private _属性: 型;

  constructor(props: {{InternalEntity}}Props) {
    this._id = props.id;
  }

  get id(): {{InternalEntity}}Id {
    return this._id;
  }

  // ビジネスメソッドを追加
}

// ============================================
// 集約ルート（外部からのアクセスポイント）
// ============================================

type {{AggregateRoot}}Status = 'DRAFT' | 'ACTIVE' | 'COMPLETED';

interface {{AggregateRoot}}Props {
  id: {{AggregateRoot}}Id;
  status: {{AggregateRoot}}Status;
  items: {{InternalEntity}}[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * {{AggregateRoot}} 集約
 *
 * 責務:
 * - 集約全体の不変条件を保護
 * - 内部エンティティへのアクセスを制御
 * - トランザクション整合性の境界を定義
 *
 * 不変条件:
 * 1. [ここに不変条件を列挙]
 * 2. [例: itemsは10個以下]
 * 3. [例: COMPLETED状態では変更不可]
 */
export class {{AggregateRoot}} {
  // ============================================
  // プロパティ
  // ============================================

  private readonly _id: {{AggregateRoot}}Id;
  private _status: {{AggregateRoot}}Status;
  private readonly _items: {{InternalEntity}}[];
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  // ============================================
  // コンストラクタ（private）
  // ============================================

  private constructor(props: {{AggregateRoot}}Props) {
    this._id = props.id;
    this._status = props.status;
    this._items = props.items;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;

    this.validateInvariants();
  }

  // ============================================
  // ファクトリメソッド
  // ============================================

  static create(): {{AggregateRoot}} {
    const now = new Date();
    return new {{AggregateRoot}}({
      id: {{AggregateRoot}}Id.generate(),
      status: 'DRAFT',
      items: [],
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: {{AggregateRoot}}Props): {{AggregateRoot}} {
    return new {{AggregateRoot}}(props);
  }

  // ============================================
  // ゲッター（読み取り専用）
  // ============================================

  get id(): {{AggregateRoot}}Id {
    return this._id;
  }

  get status(): {{AggregateRoot}}Status {
    return this._status;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  /**
   * 内部エンティティの読み取り専用ビュー
   *
   * 注意: 内部配列の変更を防ぐためコピーを返す
   */
  get items(): ReadonlyArray<{{InternalEntity}}> {
    return [...this._items];
  }

  get itemCount(): number {
    return this._items.length;
  }

  // ============================================
  // 内部エンティティ操作（集約ルート経由）
  // ============================================

  /**
   * 内部エンティティを追加
   *
   * 不変条件:
   * - COMPLETED状態では追加不可
   * - 最大10個まで
   */
  addItem(/* 必要な引数 */): void {
    this.ensureModifiable();

    if (this._items.length >= 10) {
      throw new Error('Maximum 10 items allowed');
    }

    const item = new {{InternalEntity}}({
      id: {{InternalEntity}}Id.generate(),
      // 属性を設定
    });

    this._items.push(item);
    this.touch();
    this.validateInvariants();
  }

  /**
   * 内部エンティティを削除
   */
  removeItem(itemId: {{InternalEntity}}Id): void {
    this.ensureModifiable();

    const index = this._items.findIndex((item) => item.id.equals(itemId));
    if (index === -1) {
      throw new Error('Item not found');
    }

    this._items.splice(index, 1);
    this.touch();
    this.validateInvariants();
  }

  // ============================================
  // 状態遷移
  // ============================================

  /**
   * アクティブ化
   *
   * 前提条件: DRAFT状態
   */
  activate(): void {
    if (this._status !== 'DRAFT') {
      throw new Error('Only DRAFT can be activated');
    }
    this._status = 'ACTIVE';
    this.touch();
  }

  /**
   * 完了
   *
   * 前提条件: ACTIVE状態
   */
  complete(): void {
    if (this._status !== 'ACTIVE') {
      throw new Error('Only ACTIVE can be completed');
    }
    this._status = 'COMPLETED';
    this.touch();
  }

  // ============================================
  // プライベートメソッド
  // ============================================

  /**
   * 変更可能な状態かチェック
   */
  private ensureModifiable(): void {
    if (this._status === 'COMPLETED') {
      throw new Error('Cannot modify COMPLETED aggregate');
    }
  }

  /**
   * 更新日時を更新
   */
  private touch(): void {
    this._updatedAt = new Date();
  }

  /**
   * 不変条件の検証
   */
  private validateInvariants(): void {
    // 不変条件1: IDは必須
    if (!this._id) {
      throw new Error('ID is required');
    }

    // 不変条件2: itemsは10個以下
    if (this._items.length > 10) {
      throw new Error('Maximum 10 items allowed');
    }

    // 追加の不変条件をここに実装
  }

  // ============================================
  // 等価性判定
  // ============================================

  equals(other: {{AggregateRoot}}): boolean {
    if (!(other instanceof {{AggregateRoot}})) {
      return false;
    }
    return this._id.equals(other._id);
  }
}
