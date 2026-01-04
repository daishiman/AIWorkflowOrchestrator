/**
 * ドメインイベントテンプレート
 *
 * 使用方法:
 *   1. このファイルをコピーして新しいイベントを作成
 *   2. {{EventName}} をイベント名に置換（過去形で命名）
 *   3. {{aggregateType}} を集約タイプ名に置換
 *   4. payload にイベント固有のデータを追加
 */

// ベースイベントインターフェース
export interface DomainEvent<T = unknown> {
  readonly eventId: string;
  readonly eventType: string;
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly occurredAt: Date;
  readonly version: number;
  readonly payload: T;
  readonly metadata?: EventMetadata;
}

export interface EventMetadata {
  readonly correlationId?: string;
  readonly causationId?: string;
  readonly userId?: string;
  readonly timestamp?: number;
}

// イベントペイロード型
export interface {{EventName}}Payload {
  // イベント固有のデータをここに定義
  // 例: readonly orderId: string;
  // 例: readonly amount: number;
}

// 具体的なドメインイベント
export class {{EventName}} implements DomainEvent<{{EventName}}Payload> {
  readonly eventType = "{{aggregateType}}.{{EventName}}";
  readonly aggregateType = "{{aggregateType}}";

  constructor(
    readonly eventId: string,
    readonly aggregateId: string,
    readonly occurredAt: Date,
    readonly version: number,
    readonly payload: {{EventName}}Payload,
    readonly metadata?: EventMetadata
  ) {
    // イベントは不変であるため、Object.freeze を適用
    Object.freeze(this);
    Object.freeze(this.payload);
    if (this.metadata) Object.freeze(this.metadata);
  }

  // ファクトリメソッド
  static create(
    aggregateId: string,
    payload: {{EventName}}Payload,
    version: number,
    metadata?: EventMetadata
  ): {{EventName}} {
    return new {{EventName}}(
      crypto.randomUUID(),
      aggregateId,
      new Date(),
      version,
      payload,
      metadata
    );
  }

  // シリアライズ
  toJSON(): Record<string, unknown> {
    return {
      eventId: this.eventId,
      eventType: this.eventType,
      aggregateId: this.aggregateId,
      aggregateType: this.aggregateType,
      occurredAt: this.occurredAt.toISOString(),
      version: this.version,
      payload: this.payload,
      metadata: this.metadata,
    };
  }

  // デシリアライズ
  static fromJSON(json: Record<string, unknown>): {{EventName}} {
    return new {{EventName}}(
      json.eventId as string,
      json.aggregateId as string,
      new Date(json.occurredAt as string),
      json.version as number,
      json.payload as {{EventName}}Payload,
      json.metadata as EventMetadata | undefined
    );
  }
}
