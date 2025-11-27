# リソース変換パターンガイド

## 1. 変換アーキテクチャ

### 変換パイプライン

```
ソースリソース → [変換器1] → [変換器2] → ... → ターゲットリソース

例:
CSV ファイル → [パース] → [フィルタ] → [マッピング] → JSON API レスポンス
```

### レイヤー構成

```
┌─────────────────────────────────────────────────────┐
│                   プレゼンテーション層               │
│         (フォーマット変換、レスポンス整形)          │
├─────────────────────────────────────────────────────┤
│                   ビジネスロジック層                 │
│         (フィルタリング、集計、計算)                 │
├─────────────────────────────────────────────────────┤
│                   データアクセス層                   │
│         (リソース読み取り、正規化)                   │
├─────────────────────────────────────────────────────┤
│                   ソースリソース                     │
│         (ファイル、DB、API)                          │
└─────────────────────────────────────────────────────┘
```

## 2. 基本変換パターン

### マッピング変換

```typescript
interface FieldMapping {
  source: string;        // ソースフィールドパス
  target: string;        // ターゲットフィールドパス
  transform?: (value: any) => any;  // 値変換関数
}

function mapResource(
  source: Record<string, any>,
  mappings: FieldMapping[]
): Record<string, any> {
  const result: Record<string, any> = {};

  for (const mapping of mappings) {
    const value = getNestedValue(source, mapping.source);
    const transformed = mapping.transform ? mapping.transform(value) : value;
    setNestedValue(result, mapping.target, transformed);
  }

  return result;
}

// 使用例
const mappings: FieldMapping[] = [
  { source: 'user_name', target: 'name' },
  { source: 'email_address', target: 'email', transform: (v) => v.toLowerCase() },
  { source: 'created_at', target: 'createdAt', transform: (v) => new Date(v).toISOString() }
];

const result = mapResource(sourceData, mappings);
```

### フィルタリング変換

```typescript
interface FilterRule {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'regex';
  value: any;
}

function filterResources(
  resources: any[],
  rules: FilterRule[]
): any[] {
  return resources.filter(resource => {
    return rules.every(rule => {
      const fieldValue = getNestedValue(resource, rule.field);

      switch (rule.operator) {
        case 'eq': return fieldValue === rule.value;
        case 'ne': return fieldValue !== rule.value;
        case 'gt': return fieldValue > rule.value;
        case 'lt': return fieldValue < rule.value;
        case 'gte': return fieldValue >= rule.value;
        case 'lte': return fieldValue <= rule.value;
        case 'contains': return String(fieldValue).includes(rule.value);
        case 'regex': return new RegExp(rule.value).test(String(fieldValue));
        default: return true;
      }
    });
  });
}
```

### 集計変換

```typescript
interface AggregationConfig {
  groupBy: string[];
  aggregations: {
    field: string;
    function: 'sum' | 'count' | 'avg' | 'min' | 'max';
    alias: string;
  }[];
}

function aggregateResources(
  resources: any[],
  config: AggregationConfig
): any[] {
  const groups = new Map<string, any[]>();

  // グループ化
  for (const resource of resources) {
    const groupKey = config.groupBy
      .map(field => getNestedValue(resource, field))
      .join('|');

    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    groups.get(groupKey)!.push(resource);
  }

  // 集計
  const results: any[] = [];
  for (const [key, items] of groups) {
    const result: any = {};

    // グループキーを設定
    const keyValues = key.split('|');
    config.groupBy.forEach((field, i) => {
      setNestedValue(result, field, keyValues[i]);
    });

    // 集計値を計算
    for (const agg of config.aggregations) {
      const values = items.map(item => getNestedValue(item, agg.field));
      result[agg.alias] = calculateAggregation(values, agg.function);
    }

    results.push(result);
  }

  return results;
}

function calculateAggregation(values: number[], func: string): number {
  switch (func) {
    case 'sum': return values.reduce((a, b) => a + b, 0);
    case 'count': return values.length;
    case 'avg': return values.reduce((a, b) => a + b, 0) / values.length;
    case 'min': return Math.min(...values);
    case 'max': return Math.max(...values);
    default: return 0;
  }
}
```

## 3. フォーマット変換

### JSON ↔ その他形式

```typescript
// CSV → JSON
function csvToJson(csv: string): any[] {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());

  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj: any = {};
    headers.forEach((header, i) => {
      obj[header] = values[i]?.trim();
    });
    return obj;
  });
}

// JSON → CSV
function jsonToCsv(data: any[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const rows = data.map(item =>
    headers.map(h => escapeCSVValue(item[h])).join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

// XML → JSON
function xmlToJson(xml: string): any {
  // DOMParserまたはxml2jsライブラリを使用
  // 簡略化した例
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  return nodeToJson(doc.documentElement);
}

// YAML → JSON
function yamlToJson(yaml: string): any {
  // js-yamlライブラリを使用
  return YAML.parse(yaml);
}
```

### バイナリ変換

```typescript
// Base64 エンコード/デコード
function toBase64(buffer: Buffer): string {
  return buffer.toString('base64');
}

function fromBase64(base64: string): Buffer {
  return Buffer.from(base64, 'base64');
}

// リソースコンテンツの変換
interface ResourceContent {
  uri: string;
  mimeType?: string;
  text?: string;
  blob?: string;  // Base64
}

function convertContent(content: ResourceContent): any {
  if (content.text) {
    // テキストコンテンツ
    if (content.mimeType === 'application/json') {
      return JSON.parse(content.text);
    }
    return content.text;
  }

  if (content.blob) {
    // バイナリコンテンツ
    return fromBase64(content.blob);
  }

  return null;
}
```

## 4. ストリーム変換

### トランスフォームストリーム

```typescript
import { Transform } from 'stream';

// 行単位変換ストリーム
class LineTransform extends Transform {
  private buffer = '';

  constructor(private transformer: (line: string) => string) {
    super({ objectMode: true });
  }

  _transform(chunk: any, encoding: string, callback: Function) {
    this.buffer += chunk.toString();
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || '';

    for (const line of lines) {
      this.push(this.transformer(line) + '\n');
    }
    callback();
  }

  _flush(callback: Function) {
    if (this.buffer) {
      this.push(this.transformer(this.buffer));
    }
    callback();
  }
}

// JSON変換ストリーム
class JsonTransform extends Transform {
  constructor(private mapper: (obj: any) => any) {
    super({ objectMode: true });
  }

  _transform(obj: any, encoding: string, callback: Function) {
    try {
      const result = this.mapper(obj);
      this.push(result);
      callback();
    } catch (error) {
      callback(error);
    }
  }
}
```

### パイプライン構築

```typescript
import { pipeline } from 'stream/promises';

async function transformResourceStream(
  source: Readable,
  transformers: Transform[],
  destination: Writable
): Promise<void> {
  await pipeline(source, ...transformers, destination);
}

// 使用例
const source = fs.createReadStream('input.csv');
const destination = fs.createWriteStream('output.json');

await transformResourceStream(
  source,
  [
    new CsvParseTransform(),
    new FilterTransform(record => record.status === 'active'),
    new MapTransform(record => ({
      id: record.id,
      name: record.name.toUpperCase()
    })),
    new JsonStringifyTransform()
  ],
  destination
);
```

## 5. スキーマ変換

### バージョン間変換

```typescript
interface SchemaVersion {
  version: string;
  schema: any;
  migrate?: (data: any) => any;  // 前バージョンからの移行
}

class SchemaTransformer {
  private versions: Map<string, SchemaVersion> = new Map();

  registerVersion(version: SchemaVersion): void {
    this.versions.set(version.version, version);
  }

  transform(data: any, fromVersion: string, toVersion: string): any {
    const versions = this.getVersionPath(fromVersion, toVersion);

    let current = data;
    for (const version of versions) {
      if (version.migrate) {
        current = version.migrate(current);
      }
    }

    return current;
  }

  private getVersionPath(from: string, to: string): SchemaVersion[] {
    // バージョン間の移行パスを計算
    // 省略: 実際にはバージョン番号をソートして順序を決定
    return [];
  }
}

// 使用例
const transformer = new SchemaTransformer();

transformer.registerVersion({
  version: '1.0',
  schema: { /* v1 schema */ }
});

transformer.registerVersion({
  version: '2.0',
  schema: { /* v2 schema */ },
  migrate: (v1Data) => ({
    ...v1Data,
    // v1の'name'を'fullName'に変更
    fullName: v1Data.name,
    name: undefined
  })
});
```

### 正規化変換

```typescript
interface NormalizationRule {
  field: string;
  normalizer: (value: any) => any;
}

const normalizers: NormalizationRule[] = [
  {
    field: 'email',
    normalizer: (v) => v?.toLowerCase().trim()
  },
  {
    field: 'phone',
    normalizer: (v) => v?.replace(/[^0-9+]/g, '')
  },
  {
    field: 'date',
    normalizer: (v) => {
      const d = new Date(v);
      return isNaN(d.getTime()) ? null : d.toISOString();
    }
  },
  {
    field: 'amount',
    normalizer: (v) => {
      const num = parseFloat(String(v).replace(/[^0-9.-]/g, ''));
      return isNaN(num) ? null : num;
    }
  }
];

function normalizeResource(resource: any, rules: NormalizationRule[]): any {
  const result = { ...resource };

  for (const rule of rules) {
    if (result[rule.field] !== undefined) {
      result[rule.field] = rule.normalizer(result[rule.field]);
    }
  }

  return result;
}
```

## 6. エラーハンドリング

### 変換エラーの処理

```typescript
interface TransformError {
  type: 'parse' | 'validation' | 'mapping' | 'format';
  field?: string;
  message: string;
  originalValue?: any;
}

interface TransformResult<T> {
  success: boolean;
  data?: T;
  errors: TransformError[];
  warnings: TransformError[];
}

function safeTransform<T>(
  data: any,
  transformer: (data: any) => T
): TransformResult<T> {
  const errors: TransformError[] = [];
  const warnings: TransformError[] = [];

  try {
    const result = transformer(data);
    return { success: true, data: result, errors, warnings };
  } catch (error) {
    errors.push({
      type: 'mapping',
      message: error.message,
      originalValue: data
    });
    return { success: false, errors, warnings };
  }
}

// フォールバック付き変換
function transformWithFallback<T>(
  data: any,
  transformer: (data: any) => T,
  fallback: T
): T {
  try {
    return transformer(data);
  } catch (error) {
    console.warn('Transform failed, using fallback:', error.message);
    return fallback;
  }
}
```

## 7. パフォーマンス最適化

### バッチ変換

```typescript
async function batchTransform<T, R>(
  items: T[],
  transformer: (item: T) => Promise<R>,
  batchSize: number = 100
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(transformer));
    results.push(...batchResults);
  }

  return results;
}
```

### 遅延変換

```typescript
function lazyTransform<T, R>(
  items: T[],
  transformer: (item: T) => R
): Generator<R> {
  return function* () {
    for (const item of items) {
      yield transformer(item);
    }
  }();
}

// 使用例：必要な分だけ変換
const generator = lazyTransform(largeArray, expensiveTransform);
const first10 = [];
for (let i = 0; i < 10; i++) {
  const result = generator.next();
  if (result.done) break;
  first10.push(result.value);
}
```

## 8. チェックリスト

### 変換設計

- [ ] 入力/出力スキーマは明確？
- [ ] エラーケースは網羅？
- [ ] パフォーマンス要件は満たす？
- [ ] バッチ処理は考慮？

### 実装チェック

- [ ] 型安全性は確保？
- [ ] null/undefined処理？
- [ ] ストリーム対応（大規模データ）？
- [ ] エラーリカバリー？
