# 単一責任の原則（SRP: Single Responsibility Principle）

## 定義

> 「クラスを変更する理由は、たったひとつだけであるべきである」
>
> - Robert C. Martin

## 核心概念

### 責任とは

- **責任 = 変更の理由**
- 一つのクラス/モジュールは、一つのアクター（利用者グループ）に対してのみ責任を持つ
- 異なるアクターからの要求変更が、他のアクターの機能に影響を与えてはならない

### 違反の兆候

1. **複数の変更理由**: 「UIもデータ保存もビジネスロジックも」を担当
2. **巨大なクラス**: 500行超のクラス、10以上のメソッド
3. **and/or の名前**: `UserManagerAndValidator`、`DataProcessorOrFormatter`
4. **多様なimport**: UI、DB、HTTP、ファイルシステムを一つのクラスで使用

## コード例

### 違反例

```typescript
// ❌ SRP違反: 3つの責任を持つ
class Employee {
  // 責任1: HR（給与計算）
  calculatePay(): number {
    const hours = this.getRegularHours();
    return hours * this.hourlyRate;
  }

  // 責任2: IT（レポート生成）
  reportHours(): string {
    return `${this.name}: ${this.getRegularHours()} hours`;
  }

  // 責任3: DBA（データ永続化）
  save(): void {
    database.save(this);
  }

  // 共有メソッド（問題の根源）
  private getRegularHours(): number {
    return this.hours - this.overtime;
  }
}
```

### 修正例

```typescript
// ✅ SRP準拠: 責任を分離

// 責任1: 従業員データ（ドメインモデル）
class Employee {
  constructor(
    public id: string,
    public name: string,
    public hours: number,
    public overtime: number,
    public hourlyRate: number,
  ) {}
}

// 責任2: 給与計算（HRアクター向け）
class PayCalculator {
  calculate(employee: Employee): number {
    const regularHours = employee.hours - employee.overtime;
    return regularHours * employee.hourlyRate;
  }
}

// 責任3: レポート生成（IT/管理者向け）
class HourReporter {
  report(employee: Employee): string {
    const regularHours = employee.hours - employee.overtime;
    return `${employee.name}: ${regularHours} hours`;
  }
}

// 責任4: データ永続化（DBA向け）
class EmployeeRepository {
  save(employee: Employee): void {
    database.save(employee);
  }
}
```

## 検出パターン

### 静的分析

```bash
# 行数が多いクラスを検出
find src -name "*.ts" -exec wc -l {} \; | sort -rn | head -20

# 複数のimportパターンを持つファイル
grep -l "import.*from.*@/db" src/**/*.ts | \
  xargs grep -l "import.*from.*react"
```

### コードレビュー質問

1. このクラスを変更する理由をすべて列挙できるか？
2. それぞれの理由は、異なるアクターから来ているか？
3. 変更理由が2つ以上あるなら、分割すべきではないか？

## 適用指針

### いつ分割するか

- 変更頻度が異なる機能が混在
- テストが困難（モックが多い）
- 一部の変更が予期しない箇所に影響

### いつ統合を許容するか

- 変更頻度が同じ
- 常に一緒に変更される
- 分割による複雑さが利益を上回る

## チェックリスト

- [ ] クラスの変更理由が1つに絞られているか
- [ ] クラス名が単一の概念を表現しているか
- [ ] メソッドがすべて同じ抽象度か
- [ ] importが一貫したレイヤーからか
