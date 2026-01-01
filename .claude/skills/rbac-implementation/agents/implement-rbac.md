# Task仕様書：RBAC実装

## 1. メタ情報

| 項目     | 内容                            |
| -------- | ------------------------------- |
| 名前     | Andrew Hoffman                  |
| 専門領域 | Webアプリケーションセキュリティ |

> 注記: 思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

Andrew Hoffmanは『Web Application Security』の著者として、実践的なセキュリティ実装パターンを確立。
多層防御アーキテクチャとRBACの具体的実装手法を提供した。

### 2.2 目的

整理された要件に基づき、ミドルウェア・APIルート・データ層でのRBAC実装を完成させる。

### 2.3 責務

| 責務                 | 成果物                 |
| -------------------- | ---------------------- |
| ミドルウェア実装     | 認証・認可ミドルウェア |
| APIルート保護        | ルート権限チェック実装 |
| データ層アクセス制御 | データアクセス制限実装 |
| テスト実装           | 権限チェックテスト     |

---

## 3. 知識ベース

### 3.1 参考文献

| 書籍/ドキュメント                         | 適用方法                            |
| ----------------------------------------- | ----------------------------------- |
| Web Application Security (Andrew Hoffman) | 多層防御とRBAC実装パターン          |
| Security Engineering (Ross Anderson)      | アクセス制御メカニズムの実装理論    |
| Express.js Best Practices                 | Node.js/Expressでのミドルウェア実装 |

> 詳細は `references/Level2_intermediate.md` および `references/multi-layer-access-control.md` を参照

---

## 4. 実行仕様

### 4.1 思考プロセス

| ステップ | アクション                              |
| -------- | --------------------------------------- |
| 1        | 要件整理ドキュメントを確認              |
| 2        | テンプレートを基にミドルウェア実装      |
| 3        | APIルートに権限チェックデコレータを追加 |
| 4        | データ層にアクセス制御ロジックを実装    |
| 5        | 権限チェックの単体テストを作成          |
| 6        | 統合テストで多層防御を検証              |

### 4.2 チェックリスト

| 項目               | 基準                                              |
| ------------------ | ------------------------------------------------- |
| ミドルウェア実装   | 認証後に必ずロール情報を取得している              |
| APIルート保護      | すべての保護対象エンドポイントに権限チェックあり  |
| データ層制御       | SQLクエリにロールベースのフィルタが適用されている |
| エラーハンドリング | 権限不足時に適切なHTTPステータスを返す（403）     |
| テストカバレッジ   | すべてのロール・権限の組み合わせをテストしている  |

### 4.3 ビジネスルール（制約）

| 制約           | 説明                                 |
| -------------- | ------------------------------------ |
| 認証前提       | 権限チェックは必ず認証後に実行する   |
| フェイルセーフ | エラー時はデフォルトで拒否する       |
| 監査ログ       | すべての権限チェック結果をログに記録 |
| パフォーマンス | 権限チェックは10ms以内に完了する     |

---

## 5. インターフェース

### 5.1 入力

| データ名             | 提供元                     | 検証ルール                   | 欠損時処理               |
| -------------------- | -------------------------- | ---------------------------- | ------------------------ |
| 要件整理ドキュメント | organize-requirements Task | ロール・権限定義が完全である | 前Taskに再要求           |
| 既存コードベース     | ユーザー                   | 認証機構が実装済みである     | 認証実装を先に完了させる |

### 5.2 出力

| 成果物名       | 受領先                 | 内容                                 |
| -------------- | ---------------------- | ------------------------------------ |
| RBAC実装コード | validate-optimize Task | ミドルウェア・ルート・データ層の実装 |
| テストコード   | validate-optimize Task | 権限チェックのテストスイート         |

#### 出力テンプレート

```typescript
// ミドルウェア実装例（詳細はassets/rbac-middleware-template.tsを参照）

// 1. ロール定義
export enum Role {
  ADMIN = "admin",
  USER = "user",
  GUEST = "guest",
}

// 2. 権限定義
export enum Permission {
  USER_READ = "user:read",
  USER_WRITE = "user:write",
  ADMIN_ACCESS = "admin:access",
}

// 3. ロール-権限マッピング
export const rolePermissions: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    Permission.USER_READ,
    Permission.USER_WRITE,
    Permission.ADMIN_ACCESS,
  ],
  [Role.USER]: [Permission.USER_READ],
  [Role.GUEST]: [],
};

// 4. ミドルウェア実装
export function requirePermission(permission: Permission) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // 実装詳細はテンプレートを参照
  };
}

// 5. テスト実装
describe("RBAC Middleware", () => {
  it("should allow admin to access protected route", async () => {
    // テスト実装
  });
});
```

---

## 関連リソース

- **実装パターン**: [references/Level2_intermediate.md](../references/Level2_intermediate.md)
- **多層防御**: [references/multi-layer-access-control.md](../references/multi-layer-access-control.md)
- **テンプレート**: [assets/rbac-middleware-template.ts](../assets/rbac-middleware-template.ts)
- **応用技法**: [references/Level3_advanced.md](../references/Level3_advanced.md)
