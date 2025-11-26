# テストダブルの種類

## 概要

テストダブルとは、テスト中に本物のオブジェクトの代わりに使用される
オブジェクトの総称です。Gerard Meszarosが『xUnit Test Patterns』で
5種類のテストダブルを定義しました。

## 5種類のテストダブル

### 1. Dummy（ダミー）

**定義**: パラメータを埋めるためだけに使用され、実際には使われないオブジェクト。

**特徴**:
- 呼び出されることを想定しない
- 型を満たすためだけに存在
- nullや空オブジェクトでも可

**例**:
```typescript
// Dummyの例
class DummyLogger implements ILogger {
  log(message: string): void {
    // 何もしない - 使用されないことを想定
  }
}

// 使用例
const service = new UserService(userRepository, new DummyLogger());
// ログは使用されないが、コンストラクタが要求するため渡す
```

**使用場面**:
- テスト対象が使用しない依存
- 必須パラメータの型を満たす

### 2. Stub（スタブ）

**定義**: 事前に設定された応答を返すオブジェクト。

**特徴**:
- 固定値または条件に応じた値を返す
- テスト対象への入力を制御
- 状態検証で使用

**例**:
```typescript
// Stubの例
const stubUserRepository = {
  findById: vi.fn().mockResolvedValue({
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
  }),
};

// 使用例
it('should return user name', async () => {
  const service = new UserService(stubUserRepository);
  const result = await service.getUserName('user-1');
  expect(result).toBe('Test User'); // 状態検証
});
```

**使用場面**:
- 特定の入力条件をテスト
- 外部サービスの応答をシミュレート
- エラーケースのテスト

### 3. Spy（スパイ）

**定義**: 呼び出しを記録し、後で検証可能にするオブジェクト。

**特徴**:
- 呼び出し回数、引数を記録
- 本物のメソッドを呼ぶことも可能
- 振る舞い検証で使用

**例**:
```typescript
// Spyの例
const spyNotificationService = {
  send: vi.fn(),
};

// 使用例
it('should send notification when order is placed', async () => {
  const service = new OrderService(spyNotificationService);
  await service.placeOrder({ userId: 'user-1', items: [] });

  expect(spyNotificationService.send).toHaveBeenCalledTimes(1);
  expect(spyNotificationService.send).toHaveBeenCalledWith(
    expect.objectContaining({ type: 'order_placed' })
  );
});
```

**使用場面**:
- 副作用の発生を確認
- 呼び出し回数の検証
- 引数の検証

### 4. Mock（モック）

**定義**: 期待される呼び出しを事前に設定し、それが満たされたかを検証するオブジェクト。

**特徴**:
- 期待を事前に定義
- 期待が満たされないとテスト失敗
- 厳密な振る舞い検証

**例**:
```typescript
// Mockの例（厳密な期待設定）
it('should call payment gateway with correct amount', async () => {
  const mockPaymentGateway = {
    charge: vi.fn().mockResolvedValue({ success: true }),
  };

  const service = new PaymentService(mockPaymentGateway);
  await service.processPayment({ amount: 1000, currency: 'JPY' });

  // 期待の検証
  expect(mockPaymentGateway.charge).toHaveBeenCalledExactlyOnceWith({
    amount: 1000,
    currency: 'JPY',
  });
});
```

**使用場面**:
- 重要な相互作用の検証
- 呼び出し順序の検証
- 引数の厳密な検証

### 5. Fake（フェイク）

**定義**: 本物のオブジェクトの簡略化された実装。

**特徴**:
- 実際に動作するロジックを持つ
- 本番とは異なる簡易実装
- 状態を保持する

**例**:
```typescript
// Fakeの例
class FakeUserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async save(user: User): Promise<void> {
    this.users.set(user.id, user);
  }

  async delete(id: string): Promise<void> {
    this.users.delete(id);
  }

  // テストヘルパー
  seed(users: User[]): void {
    users.forEach(user => this.users.set(user.id, user));
  }

  clear(): void {
    this.users.clear();
  }
}

// 使用例
it('should update user', async () => {
  const fakeRepository = new FakeUserRepository();
  fakeRepository.seed([{ id: 'user-1', name: 'Old Name' }]);

  const service = new UserService(fakeRepository);
  await service.updateName('user-1', 'New Name');

  const user = await fakeRepository.findById('user-1');
  expect(user.name).toBe('New Name');
});
```

**使用場面**:
- インメモリデータベース
- ファイルシステムの代替
- 外部APIの簡易実装

## 比較表

| 種類 | 戻り値 | 呼び出し記録 | 実装の複雑さ | 主な検証 |
|------|--------|-------------|-------------|---------|
| Dummy | なし/例外 | なし | 最小 | なし |
| Stub | 固定値 | なし | 低 | 状態 |
| Spy | 本物/固定 | あり | 中 | 振る舞い |
| Mock | 固定値 | あり＋期待 | 中 | 振る舞い |
| Fake | 動的 | なし | 高 | 状態 |

## 選択ガイドライン

### Dummyを選ぶ

- テスト対象がその依存を使用しない
- コンストラクタの型を満たすだけ

### Stubを選ぶ

- テスト対象への入力を制御したい
- 特定の条件下の動作をテストしたい
- 外部サービスの応答をシミュレート

### Spyを選ぶ

- 呼び出しが行われたことを確認したい
- 呼び出し回数や引数を検証したい
- 本物の実装も部分的に使いたい

### Mockを選ぶ

- 重要な相互作用を厳密に検証したい
- 呼び出し順序が重要
- 契約の遵守を確認したい

### Fakeを選ぶ

- 複雑な依存の代替が必要
- 状態を持つ操作をテスト
- インメモリでの高速テスト
