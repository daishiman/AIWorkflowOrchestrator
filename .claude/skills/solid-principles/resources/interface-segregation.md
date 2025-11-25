# インターフェース分離の原則（ISP: Interface Segregation Principle）

## 定義

> 「クライアントは、自分が使用しないメソッドに依存することを強制されるべきではない」
> - Robert C. Martin

## 核心概念

### 太ったインターフェースの問題
- 不要なメソッドへの依存 → 不要な再コンパイル
- 実装の複雑化 → 空のメソッドや例外の発生
- 変更の波及 → 使わない機能の変更が影響

### 解決策
- インターフェースをクライアントの視点で分割
- 役割（Role）ベースのインターフェース設計
- 必要最小限の依存

## コード例

### 違反例

```typescript
// ❌ ISP違反: 太ったインターフェース
interface Worker {
  work(): void;
  eat(): void;
  sleep(): void;
  attendMeeting(): void;
  writeReport(): void;
}

// ロボット作業者は食事も睡眠もしない
class Robot implements Worker {
  work(): void {
    console.log('Working...');
  }

  eat(): void {
    throw new Error('Robots do not eat'); // 不要なメソッド
  }

  sleep(): void {
    throw new Error('Robots do not sleep'); // 不要なメソッド
  }

  attendMeeting(): void {
    throw new Error('Robots do not attend meetings');
  }

  writeReport(): void {
    // 空実装
  }
}
```

### 修正例

```typescript
// ✅ ISP準拠: 役割ベースの分離されたインターフェース

// 作業能力
interface Workable {
  work(): void;
}

// 生理的ニーズ
interface Eatable {
  eat(): void;
}

interface Sleepable {
  sleep(): void;
}

// オフィス活動
interface MeetingAttendable {
  attendMeeting(): void;
}

interface ReportWritable {
  writeReport(): void;
}

// 人間は全てを実装
class HumanWorker implements
  Workable,
  Eatable,
  Sleepable,
  MeetingAttendable,
  ReportWritable
{
  work(): void { /* ... */ }
  eat(): void { /* ... */ }
  sleep(): void { /* ... */ }
  attendMeeting(): void { /* ... */ }
  writeReport(): void { /* ... */ }
}

// ロボットは必要なものだけ実装
class Robot implements Workable {
  work(): void {
    console.log('Working efficiently...');
  }
}

// クライアントは必要なインターフェースのみに依存
function assignWork(worker: Workable): void {
  worker.work();
}
```

## 設計パターン

### 複合インターフェース

```typescript
// 基本インターフェース
interface Readable {
  read(): string;
}

interface Writable {
  write(data: string): void;
}

interface Closable {
  close(): void;
}

// 必要に応じて組み合わせ
interface ReadableStream extends Readable, Closable {}
interface WritableStream extends Writable, Closable {}
interface ReadWriteStream extends Readable, Writable, Closable {}

// クライアントは必要な機能のみに依存
function processInput(input: Readable): void {
  const data = input.read();
}

function saveOutput(output: Writable): void {
  output.write('data');
}
```

### アダプターによる分離

```typescript
// 既存の太ったインターフェース
interface LegacyPrinter {
  print(doc: Document): void;
  scan(): Document;
  fax(doc: Document, number: string): void;
  copy(doc: Document): Document;
}

// 分離されたインターフェース
interface Printer {
  print(doc: Document): void;
}

interface Scanner {
  scan(): Document;
}

// アダプターで既存実装をラップ
class PrinterAdapter implements Printer {
  constructor(private legacy: LegacyPrinter) {}

  print(doc: Document): void {
    this.legacy.print(doc);
  }
}
```

## 検出パターン

### 違反の兆候

1. **空のメソッド実装**: `{}`や`return null`が多い
2. **UnsupportedOperation例外**: 実装できないメソッド
3. **巨大なインターフェース**: 10以上のメソッド
4. **関連性の薄いメソッド群**: 異なる責務のメソッドが混在

### 静的分析

```bash
# 大きなインターフェース
grep -rn "interface.*{" src/ --include="*.ts" -A 20 | \
  grep -c "^\s*\w\+("

# 空の実装
grep -rn "(): void {\s*}" src/ --include="*.ts"

# throw NotSupported パターン
grep -rn "throw.*not.*support\|throw.*not.*implement" src/
```

## 適用指針

### いつ分割するか
- 一部のクライアントが一部のメソッドしか使わない
- 空の実装や例外が発生している
- インターフェースの変更が無関係なクライアントに影響

### いつ統合を許容するか
- すべてのクライアントがすべてのメソッドを使う
- メソッドが密接に関連している
- 分割による複雑さが利益を上回る

## 実践的なサイズ目安

| インターフェースタイプ | 推奨メソッド数 |
|----------------------|--------------|
| コマンド/アクション | 1-2 |
| リポジトリ | 3-5 |
| サービス | 3-7 |
| ファサード | 5-10 |

## チェックリスト

- [ ] インターフェースが小さく焦点が絞られているか
- [ ] 実装クラスがすべてのメソッドを意味的に実装できるか
- [ ] クライアントが使わないメソッドに依存していないか
- [ ] 空の実装やUnsupportedOperation例外がないか
- [ ] インターフェースの変更が最小限のクライアントに影響するか
