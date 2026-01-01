# Level 1: 例示の基本原則

## 目的

使用例作成の基礎概念と構造を理解し、最小限の実行可能な例を作成できるようになる。

## 対象者

- ドキュメント作成初心者
- 初めて使用例を書く開発者
- 基本原則を再確認したい経験者

---

## 1. 使用例とは

使用例（Usage Example）は、ソフトウェアコンポーネント（API、CLI、ライブラリ、フレームワーク）の使用方法を示す実行可能なコードスニペットまたはサンプルプロジェクトです。

### 1.1 使用例の目的

| 目的               | 説明                                                   |
| ------------------ | ------------------------------------------------------ |
| **理解の促進**     | 抽象的な説明よりも具体的なコードで理解を助ける         |
| **学習時間の短縮** | コピー&ペーストで即座に試せることで学習曲線を緩やかに  |
| **誤用の防止**     | 正しい使用パターンを示すことで一般的な間違いを防ぐ     |
| **信頼性の向上**   | 動作する例を提供することでドキュメントの信頼性を高める |

### 1.2 良い例の4つの原則

```
1. 明確性（Clarity）       - 何をしているか一目でわかる
2. 完全性（Completeness）  - 動作に必要なすべてが揃っている
3. 実用性（Practicality）  - 現実的なシナリオに基づいている
4. 保守性（Maintainability）- 長期的に保守できる
```

---

## 2. 最小限の例の構造

### 2.1 基本構成要素

最小限の例は以下の要素で構成されます：

````markdown
# {{例のタイトル}}

## 概要

{{1-2文で目的を説明}}

## 前提条件

- 環境: {{必要な環境}}
- 依存関係: {{依存関係リスト}}

## インストール

\```bash
{{インストールコマンド}}
\```

## コード

\```{{言語}}
{{実行可能なコード}}
\```

## 出力

\```
{{期待される出力}}
\```
````

### 2.2 例：最小限のREST APIクライアント

````markdown
# REST APIクライアントの基本的な使用例

## 概要

HTTPライブラリを使用して、REST APIからデータを取得する最小限の例です。

## 前提条件

- Node.js 18以上
- npm

## インストール

\```bash
npm install axios
\```

## コード

\```javascript
const axios = require('axios');

// ユーザー情報を取得
async function getUser(userId) {
const response = await axios.get(`https://api.example.com/users/${userId}`);
return response.data;
}

// 実行
getUser(123).then(user => {
console.log('User:', user.name);
});
\```

## 出力

\```
User: John Doe
\```
````

---

## 3. 明確性の原則

### 3.1 単一責務

各例は1つの概念に焦点を当てる。

**良い例（単一責務）：**

```javascript
// ユーザー情報の取得のみに焦点
const user = await getUser(123);
console.log(user.name);
```

**悪い例（複数の概念を混在）：**

```javascript
// ユーザー取得、更新、削除を一度に説明しようとしている
const user = await getUser(123);
user.name = "New Name";
await updateUser(user);
await deleteUser(123);
```

### 3.2 直感的な名前

変数名・関数名は目的を明確に示す。

**良い例：**

```javascript
const userId = 123;
const userName = "John Doe";
const userEmail = "john@example.com";
```

**悪い例：**

```javascript
const x = 123;
const data = "John Doe";
const str = "john@example.com";
```

### 3.3 段階的開示

複雑さを段階的に導入する。

**段階1（最小限）：**

```javascript
const response = await fetch("/api/users/123");
const user = await response.json();
```

**段階2（エラーハンドリング追加）：**

```javascript
try {
  const response = await fetch("/api/users/123");
  if (!response.ok) throw new Error("User not found");
  const user = await response.json();
} catch (error) {
  console.error("Error:", error.message);
}
```

**段階3（高度な機能）：**

```javascript
const response = await fetch("/api/users/123", {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  timeout: 5000,
});
```

---

## 4. 完全性の原則

### 4.1 必須要素チェックリスト

- [ ] すべてのインポート/依存関係が明記されている
- [ ] 環境設定（Node.jsバージョン、環境変数など）が明記されている
- [ ] インストール手順が提供されている
- [ ] コードがコピー&ペーストで動作する
- [ ] 期待される出力が示されている

### 4.2 依存関係の明記

**良い例：**

````markdown
## 前提条件

- Node.js 18.0以上
- npm 9.0以上

## 依存関係

\```json
{
"dependencies": {
"axios": "^1.6.0"
}
}
\```
````

**悪い例：**

```markdown
## 前提条件

- Node.js最新版
- 必要なパッケージをインストールしてください
```

---

## 5. 実用性の原則

### 5.1 現実的なシナリオ

**良い例（実際のユースケース）：**

```javascript
// ユーザーのプロフィール情報を取得してUIに表示
async function loadUserProfile(userId) {
  const user = await getUser(userId);
  document.getElementById("userName").textContent = user.name;
  document.getElementById("userEmail").textContent = user.email;
}
```

**悪い例（非現実的）：**

```javascript
// 意味のない操作
const x = foo(bar(baz(123)));
console.log(x);
```

### 5.2 ベストプラクティスの適用

**良い例（async/await使用）：**

```javascript
async function fetchData() {
  try {
    const response = await fetch("/api/data");
    return await response.json();
  } catch (error) {
    console.error("Fetch failed:", error);
  }
}
```

**悪い例（コールバック地獄）：**

```javascript
function fetchData(callback) {
  fetch("/api/data", function (response) {
    response.json(
      function (data) {
        callback(null, data);
      },
      function (error) {
        callback(error);
      },
    );
  });
}
```

---

## 6. コメントの使い方

### 6.1 説明が必要な場合

- **複雑なロジック**: アルゴリズムや計算が非自明な場合
- **特殊な値**: マジックナンバーや特定の文字列を使用する理由
- **前提条件**: コードが動作するための前提

**例：**

```javascript
// ユーザーIDは1-10000の範囲で有効（システム制約）
const userId = 123;

// タイムアウトは5秒（APIのSLAに基づく）
const timeout = 5000;
```

### 6.2 説明が不要な場合

自己説明的なコードにはコメント不要。

**悪い例（不要なコメント）：**

```javascript
// ユーザーを取得
const user = await getUser(userId);

// 名前を表示
console.log(user.name);
```

**良い例（コメントなし）：**

```javascript
const user = await getUser(userId);
console.log(user.name);
```

---

## 7. よくある間違いと修正方法

| 間違い                   | 問題                 | 修正方法                           |
| ------------------------ | -------------------- | ---------------------------------- |
| 依存関係の欠如           | コードが動作しない   | すべてのインポートとバージョン明記 |
| 環境変数のハードコード   | セキュリティリスク   | 環境変数の使用を推奨               |
| 非推奨APIの使用          | 将来動作しなくなる   | 最新の推奨APIを使用                |
| エラーハンドリングの欠如 | 失敗時の対処法が不明 | try-catchまたはエラーチェック追加  |
| 複雑すぎる最初の例       | 初心者が理解できない | 最小限の例から始める               |
| 出力の欠如               | 期待される結果が不明 | 実行結果を明記                     |

---

## 8. 次のステップ

Level 1の内容を理解したら、以下に進んでください：

- **Level 2**: 実践的なパターンとアンチパターン（`Level2_intermediate.md`）
- **実装**: 最小限の例を実際に作成してみる
- **テンプレート**: `assets/example-template.md` を使用して構造化

---

## 参考資料

- 『Docs for Developers』第3章：例の作成
- 『The Pragmatic Programmer』：明確なコミュニケーション
- 『Clean Code』第2章：意味のある名前
