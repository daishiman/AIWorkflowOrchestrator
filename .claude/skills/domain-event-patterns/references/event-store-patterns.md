# Level 2: イベントストア実装

## イベントストアの設計

Level 2では、イベントを効率的に永続化・取得するイベントストアの実装について学びます。

## データベース選択肢

### RDBMS (PostgreSQL/MySQL)

**利点**:

- トランザクション保証
- SQLでの柔軟なクエリ
- 既存インフラ活用

**スキーマ例**:

```sql
CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  event_id UUID NOT NULL UNIQUE,
  aggregate_id UUID NOT NULL,
  aggregate_type VARCHAR(255) NOT NULL,
  event_type VARCHAR(255) NOT NULL,
  event_version INT NOT NULL,
  sequence_number INT NOT NULL,
  event_data JSONB NOT NULL,
  metadata JSONB,
  occurred_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(aggregate_id, sequence_number)
);

CREATE INDEX idx_events_aggregate ON events(aggregate_id, sequence_number);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_occurred_at ON events(occurred_at);
```

### NoSQL (MongoDB)

```javascript
{
  _id: ObjectId,
  eventId: UUID,
  aggregateId: UUID,
  aggregateType: String,
  eventType: String,
  eventVersion: Number,
  sequenceNumber: Number,
  data: Object,
  metadata: Object,
  occurredAt: ISODate,
  createdAt: ISODate
}

// インデックス
db.events.createIndex({ aggregateId: 1, sequenceNumber: 1 }, { unique: true });
db.events.createIndex({ eventType: 1 });
```

### 専用EventStore (EventStoreDB)

- イベントソーシング専用設計
- ストリーム単位の最適化
- プロジェクション機能内蔵

## イベントストア実装

### インターフェース

```typescript
interface EventStore {
  append(
    aggregateId: string,
    events: DomainEvent[],
    expectedVersion: number,
  ): Promise<void>;

  getEvents(aggregateId: string, fromVersion?: number): Promise<DomainEvent[]>;

  getAllEvents(fromPosition?: number, limit?: number): Promise<DomainEvent[]>;

  getEventsByType(
    eventType: string,
    fromPosition?: number,
  ): Promise<DomainEvent[]>;
}
```

### PostgreSQL実装

```typescript
class PostgreSQLEventStore implements EventStore {
  constructor(private pool: Pool) {}

  async append(
    aggregateId: string,
    events: DomainEvent[],
    expectedVersion: number,
  ): Promise<void> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      // 現在のバージョン確認
      const result = await client.query(
        "SELECT MAX(sequence_number) as version FROM events WHERE aggregate_id = $1",
        [aggregateId],
      );

      const currentVersion = result.rows[0]?.version ?? 0;

      if (currentVersion !== expectedVersion) {
        throw new ConcurrencyError(
          `Expected version ${expectedVersion}, but current is ${currentVersion}`,
        );
      }

      // イベント挿入
      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        await client.query(
          `INSERT INTO events (
            event_id, aggregate_id, aggregate_type, event_type,
            event_version, sequence_number, event_data, metadata, occurred_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            event.eventId,
            event.aggregateId,
            event.aggregateType,
            event.eventType,
            event.eventVersion,
            expectedVersion + i + 1,
            JSON.stringify(event.data),
            JSON.stringify(event.metadata),
            event.occurredAt,
          ],
        );
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async getEvents(
    aggregateId: string,
    fromVersion: number = 0,
  ): Promise<DomainEvent[]> {
    const result = await this.pool.query(
      `SELECT * FROM events
       WHERE aggregate_id = $1 AND sequence_number > $2
       ORDER BY sequence_number ASC`,
      [aggregateId, fromVersion],
    );

    return result.rows.map((row) => this.rowToEvent(row));
  }

  private rowToEvent(row: any): DomainEvent {
    return {
      eventId: row.event_id,
      eventType: row.event_type,
      eventVersion: row.event_version,
      aggregateId: row.aggregate_id,
      aggregateType: row.aggregate_type,
      aggregateVersion: row.sequence_number,
      occurredAt: row.occurred_at,
      data: row.event_data,
      metadata: row.metadata,
    };
  }
}
```

## スナップショット機構

大きな集約（数百〜数千のイベント）のパフォーマンス改善策。

### スナップショットテーブル

```sql
CREATE TABLE snapshots (
  id BIGSERIAL PRIMARY KEY,
  aggregate_id UUID NOT NULL,
  aggregate_type VARCHAR(255) NOT NULL,
  version INT NOT NULL,
  state JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(aggregate_id, version)
);

CREATE INDEX idx_snapshots_aggregate ON snapshots(aggregate_id, version DESC);
```

### スナップショット実装

```typescript
interface SnapshotStore {
  saveSnapshot(aggregateId: string, version: number, state: any): Promise<void>;

  getSnapshot(aggregateId: string): Promise<Snapshot | null>;
}

interface Snapshot {
  aggregateId: string;
  version: number;
  state: any;
  createdAt: Date;
}

class PostgreSQLSnapshotStore implements SnapshotStore {
  async saveSnapshot(
    aggregateId: string,
    version: number,
    state: any,
  ): Promise<void> {
    await this.pool.query(
      `INSERT INTO snapshots (aggregate_id, version, state)
       VALUES ($1, $2, $3)
       ON CONFLICT (aggregate_id, version) DO NOTHING`,
      [aggregateId, version, JSON.stringify(state)],
    );
  }

  async getSnapshot(aggregateId: string): Promise<Snapshot | null> {
    const result = await this.pool.query(
      `SELECT * FROM snapshots
       WHERE aggregate_id = $1
       ORDER BY version DESC
       LIMIT 1`,
      [aggregateId],
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      aggregateId: row.aggregate_id,
      version: row.version,
      state: row.state,
      createdAt: row.created_at,
    };
  }
}
```

### スナップショット戦略

```typescript
class SnapshotStrategy {
  // 100イベントごとにスナップショット
  static readonly EVENTS_PER_SNAPSHOT = 100;

  shouldCreateSnapshot(currentVersion: number): boolean {
    return currentVersion % SnapshotStrategy.EVENTS_PER_SNAPSHOT === 0;
  }
}

// 集約保存時にスナップショット作成
async function saveAggregateWithSnapshot(
  aggregate: Aggregate,
  eventStore: EventStore,
  snapshotStore: SnapshotStore,
): Promise<void> {
  const events = aggregate.getUncommittedEvents();
  await eventStore.append(
    aggregate.id,
    events,
    aggregate.version - events.length,
  );

  const strategy = new SnapshotStrategy();
  if (strategy.shouldCreateSnapshot(aggregate.version)) {
    await snapshotStore.saveSnapshot(
      aggregate.id,
      aggregate.version,
      aggregate.getState(),
    );
  }

  aggregate.clearUncommittedEvents();
}
```

## 集約の再構築

スナップショット + 後続イベントで効率的に復元:

```typescript
class AggregateRepository<T extends Aggregate> {
  async load(aggregateId: string): Promise<T> {
    const snapshot = await this.snapshotStore.getSnapshot(aggregateId);

    const fromVersion = snapshot?.version ?? 0;
    const events = await this.eventStore.getEvents(aggregateId, fromVersion);

    const aggregate = this.createAggregate();

    if (snapshot) {
      aggregate.loadFromSnapshot(snapshot);
    }

    events.forEach((event) => aggregate.apply(event));

    return aggregate as T;
  }
}
```

## パフォーマンス最適化

### インデックス戦略

```sql
-- 集約IDでの検索を高速化
CREATE INDEX idx_events_aggregate ON events(aggregate_id, sequence_number);

-- イベントタイプでの検索
CREATE INDEX idx_events_type ON events(event_type, occurred_at);

-- 時系列クエリ
CREATE INDEX idx_events_occurred_at ON events(occurred_at);

-- Correlation IDでのトレース
CREATE INDEX idx_events_correlation ON events((metadata->>'correlationId'));
```

### コネクションプーリング

```typescript
const pool = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20, // 最大接続数
  idleTimeoutMillis: 30000, // アイドルタイムアウト
  connectionTimeoutMillis: 2000,
});
```

## まとめ

Level 2では以下を学びました:

- イベントストアのデータベース設計
- 楽観的同時実行制御の実装
- スナップショット機構によるパフォーマンス改善
- 集約の効率的な再構築
- インデックス戦略

次のLevel 3では、イベントハンドリングとメッセージングについて学びます。
