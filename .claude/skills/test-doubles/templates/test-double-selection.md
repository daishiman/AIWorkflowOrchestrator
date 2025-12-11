# テストダブル選択ガイド

## 選択フローチャート

```
依存をテストダブルに置き換える
  │
  ▼
[Q1] この依存はテスト対象から呼び出されるか？
  ├─ No → 【Dummy】
  │        └─ パラメータを埋めるだけ
  │
  └─ Yes ↓

[Q2] 依存の戻り値を制御する必要があるか？
  ├─ Yes → [Q2a] 複雑なロジックが必要か？
  │          ├─ Yes → 【Fake】
  │          │        └─ 簡易実装を作成
  │          └─ No → 【Stub】
  │                   └─ 固定値を返す
  │
  └─ No ↓

[Q3] 依存への呼び出しを検証する必要があるか？
  ├─ Yes → [Q3a] 厳密な期待の検証が必要か？
  │          ├─ Yes → 【Mock】
  │          │        └─ 期待を事前設定
  │          └─ No → 【Spy】
  │                   └─ 呼び出しを記録
  │
  └─ No → 【Stub】または【Dummy】
```

## クイックリファレンス

### Dummy（ダミー）

**使用条件**:

- [ ] テスト対象がこの依存を使用しない
- [ ] コンストラクタの型を満たすだけ

**実装例**:

```typescript
const dummyLogger: ILogger = {
  log: () => {},
  error: () => {},
};
```

---

### Stub（スタブ）

**使用条件**:

- [ ] テスト対象への入力を制御したい
- [ ] 特定の条件下の動作をテストしたい
- [ ] 外部サービスの応答をシミュレート

**実装例**:

```typescript
const stubRepository = {
  findById: vi.fn().mockResolvedValue({
    id: "user-1",
    name: "Test User",
  }),
};
```

---

### Spy（スパイ）

**使用条件**:

- [ ] 呼び出しが行われたことを確認したい
- [ ] 呼び出し回数を検証したい
- [ ] 本物の実装も使いたい

**実装例**:

```typescript
const spyLogger = {
  log: vi.fn(),
};

// テスト後
expect(spyLogger.log).toHaveBeenCalledTimes(2);
```

---

### Mock（モック）

**使用条件**:

- [ ] 引数を厳密に検証したい
- [ ] 呼び出し順序が重要
- [ ] 契約の遵守を確認したい

**実装例**:

```typescript
const mockPayment = {
  charge: vi.fn().mockResolvedValue({ success: true }),
};

// テスト後
expect(mockPayment.charge).toHaveBeenCalledExactlyOnceWith({
  amount: 1000,
  currency: "JPY",
});
```

---

### Fake（フェイク）

**使用条件**:

- [ ] 複雑な依存の代替が必要
- [ ] 状態を持つ操作をテスト
- [ ] 統合テストに使用

**実装例**:

```typescript
class FakeUserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async save(user: User): Promise<User> {
    this.users.set(user.id, user);
    return user;
  }
}
```

## シナリオ別ガイド

### シナリオ1: 外部API呼び出し

```
目的: 外部支払いAPIの呼び出しをテスト
  │
  ├─ 成功レスポンスをテスト → Stub（固定値を返す）
  ├─ エラーレスポンスをテスト → Stub（エラーを返す）
  └─ 正しい引数で呼ばれたか検証 → Mock（引数を検証）
```

### シナリオ2: データベース操作

```
目的: リポジトリを使用するサービスをテスト
  │
  ├─ 単一操作のテスト → Stub（固定値）
  └─ 複数操作の統合テスト → Fake（インメモリ実装）
```

### シナリオ3: 通知送信

```
目的: 通知が送信されることを確認
  │
  ├─ 送信されたことを確認 → Spy（呼び出し記録）
  └─ 正しい内容で送信されたか → Mock（引数検証）
```

### シナリオ4: キャッシュ

```
目的: キャッシュを使用するサービスをテスト
  │
  ├─ キャッシュヒット/ミスのテスト → Stub（条件付き）
  └─ キャッシュの統合テスト → Fake（インメモリキャッシュ）
```

## 検証方法の選択

| テストダブル | 主な検証方法 |
| ------------ | ------------ |
| Dummy        | なし         |
| Stub         | 状態検証     |
| Spy          | 振る舞い検証 |
| Mock         | 振る舞い検証 |
| Fake         | 状態検証     |

## チェックリスト

### テスト設計時

- [ ] 依存の役割を理解しているか？
- [ ] 適切なテストダブルを選択しているか？
- [ ] 検証方法は適切か？

### 実装時

- [ ] テストダブルは最小限の実装か？
- [ ] テストの意図は明確か？
- [ ] 保守しやすいか？

### レビュー時

- [ ] 過度なモッキングはないか？
- [ ] 実装詳細への依存はないか？
- [ ] テストは読みやすいか？
