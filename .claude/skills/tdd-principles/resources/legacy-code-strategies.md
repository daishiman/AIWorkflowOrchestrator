# レガシーコード対応戦略

## 概要

レガシーコードとは「テストのないコード」です（Michael Feathers定義）。
このリソースでは、テストのないコードに安全にテストを追加する戦略を提供します。

---

## 接合部（Seams）の概念

### Seamとは

Seamは「プログラムの振る舞いを変更できるポイント」です。
テストのために振る舞いを変更できる場所を作成します。

### Seamの種類

#### 1. Object Seam（オブジェクト接合部）

**概念**: オブジェクトを差し替え可能にする

**パターン**:

- コンストラクタインジェクション
- セッターインジェクション
- メソッドパラメータ

**変換例**:

```markdown
Before:
class Service {
private db = new Database() // 直接インスタンス化
}

After:
class Service {
constructor(private db: Database) {} // 注入可能
}
```

#### 2. Preprocessing Seam（前処理接合部）

**概念**: 条件付きコンパイルやフラグでの切り替え

**パターン**:

- 環境変数による切り替え
- フィーチャーフラグ
- 条件付きインポート

#### 3. Link Seam（リンク接合部）

**概念**: リンク時に依存を差し替える

**パターン**:

- モジュールモック
- パスエイリアス
- 依存関係の上書き

---

## キャラクタライゼーションテスト

### 概念

現在の振る舞いを「記録」するテストを作成します。
正しい振る舞いではなく、現在の振る舞いを保護します。

### 目的

1. **リファクタリングの安全網**
   - 変更で振る舞いが変わったことを検出
   - 意図しない副作用を防止

2. **コードの理解**
   - テストを通じてコードの動作を学ぶ
   - ドキュメント化されていない振る舞いを発見

3. **段階的改善の基盤**
   - まず現状を固定
   - その後安全に改善

### 作成手順

```markdown
Step 1: テストを書く

- 任意の入力を与える
- 出力を仮の値でアサート

Step 2: テストを実行

- 失敗を確認
- 実際の出力値を取得

Step 3: アサーションを更新

- 実際の出力値でアサートを修正
- テストが通ることを確認

Step 4: 繰り返し

- 異なる入力で同様のプロセス
- 重要なパスをカバー
```

### 例

```markdown
// キャラクタライゼーションテストの例
test('calculateTax returns current behavior', () => {
// Step 1: 任意の入力
const result = calculateTax(100);

// Step 3: 実際の出力で更新（最初はexpect(result).toBe(???)）
expect(result).toBe(8); // 現在の振る舞いを記録
});
```

---

## Sprout Method（芽出しメソッド）

### 概念

既存コードに手を加えず、新しいメソッドを「芽」のように追加します。

### 手順

```markdown
1. 変更が必要な箇所を特定
2. 新しいメソッドを作成（テストファースト）
3. 既存コードから新メソッドを呼び出す
4. 新メソッドにロジックを移動
```

### 例

```markdown
Before:
function processOrder(order) {
// 100行の複雑なコード
// ここに新しい検証を追加したい
}

After:
function processOrder(order) {
// 既存コード
validateOrderItems(order.items); // 芽出しメソッド呼び出し
// 残りの既存コード
}

// 新しいメソッド（テスト付き）
function validateOrderItems(items) {
// 新しいロジック（テストファーストで実装）
}
```

### 利点

- 既存コードへの影響最小
- 新コードは完全にテスト可能
- 段階的な改善が可能

---

## Wrap Method（ラップメソッド）

### 概念

既存メソッドを新しいメソッドでラップし、前後に処理を追加します。

### パターン

```markdown
パターン1: 既存メソッドをリネームしてラップ

Before:
function save(data) { /_ 既存コード _/ }

After:
function save(data) {
beforeSave(data); // 新しい処理
saveCore(data); // 元のsave
afterSave(data); // 新しい処理
}
function saveCore(data) { /_ 元の既存コード _/ }
```

### 利点

- 既存の呼び出し元を変更不要
- 追加処理をテスト可能
- 横断的関心事の追加に有効

---

## Extract and Override

### 概念

テスト困難な依存をメソッドに抽出し、テスト時にオーバーライドします。

### 手順

```markdown
1. テスト困難な部分を特定
2. その部分をprotectedメソッドに抽出
3. テスト用サブクラスを作成
4. サブクラスでメソッドをオーバーライド
```

### 例

```markdown
Before:
class UserService {
createUser(data) {
// 複雑な処理
sendEmail(data.email); // テスト困難
// 続きの処理
}
}

After:
class UserService {
createUser(data) {
// 複雑な処理
this.sendNotification(data.email); // 抽出
// 続きの処理
}

    protected sendNotification(email) {
      sendEmail(email);
    }

}

// テスト用
class TestableUserService extends UserService {
protected sendNotification(email) {
// 何もしない or 記録
}
}
```

---

## 安全なリファクタリングの原則

### 1. 小さなステップ

```markdown
原則:

- 一度に一つの変更のみ
- 変更後は必ずテスト
- 失敗したらすぐに戻す
```

### 2. 自動リファクタリングツールの活用

```markdown
活用すべき機能:

- リネーム
- メソッド抽出
- パラメータ追加
- インターフェース抽出
```

### 3. カバレッジの確認

```markdown
手順:

1. 変更前のカバレッジを測定
2. 変更後のカバレッジを確認
3. カバレッジ低下は警告サイン
```

---

## 判断基準チェックリスト

### キャラクタライゼーションテスト

- [ ] 現在の振る舞いを記録しているか？
- [ ] 主要なパスがカバーされているか？
- [ ] エッジケースも含まれているか？

### Seam作成

- [ ] 最小限の変更でSeamを作成できるか？
- [ ] 作成したSeamはテストで活用できるか？
- [ ] 本番コードへの影響は最小限か？

### リファクタリング安全性

- [ ] テストが十分にあるか？
- [ ] 小さなステップで進めているか？
- [ ] 各ステップ後にテストを実行しているか？

---

## 参考文献

- Michael Feathers『Working Effectively with Legacy Code』
  - Chapter 4: The Seam Model
  - Chapter 13: I Need to Make a Change, but I Don't Know What Tests to Write
- Martin Fowler『Refactoring』
