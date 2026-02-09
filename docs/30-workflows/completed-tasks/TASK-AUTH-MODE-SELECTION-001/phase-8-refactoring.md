# Phase 8: リファクタリング

## メタ情報

| 項目     | 値                                               |
| -------- | ------------------------------------------------ |
| タスクID | TASK-AUTH-MODE-SELECTION-001                     |
| 機能名   | auth-mode-selection                              |
| Phase    | 8 - リファクタリング                             |
| Issue    | #750                                             |
| 作成日   | 2026-02-08                                       |
| 前Phase  | [Phase 7: カバレッジ確認](./phase-7-coverage.md) |
| 次Phase  | [Phase 9: 品質検証](./phase-9-quality.md)        |

## 目的

動作を変えずにコード品質を改善する（TDDのRefactorフェーズ）。
テストがGreenのまま維持されることを常に確認しながら、段階的にリファクタリングを実施する。

## 依存関係

- **前提成果物**:
  - Phase 5-6で実装・テストされたすべてのコード
  - Phase 7で確認されたカバレッジ基準達成
- **参照**:
  - `.claude/rules/02-code-quality.md` - コーディング規約
  - `.claude/rules/01-architecture.md` - 設計原則

## リファクタリング原則

1. **小さなステップ**: 1つの変更ごとにテスト実行
2. **動作を変えない**: 外部インターフェースは維持
3. **テストがGreen**: 常にテストが通る状態を維持
4. **可読性優先**: パフォーマンスより可読性を優先

## 実行タスク

### TASK-1: コード重複の除去

#### 対象箇所の特定

```bash
# 類似コードの検出（jscpdを使用）
pnpm exec jscpd apps/desktop/src/main/services/auth/ --min-lines 5

# 手動確認箇所
# - エラーハンドリングパターン
# - バリデーションロジック
# - IPC応答生成
```

#### 重複パターンと対策

| 重複パターン         | 対策                                 |
| -------------------- | ------------------------------------ |
| IPC応答生成          | `createIpcResponse` ヘルパー関数作成 |
| エラーサニタイズ     | `sanitizeError` 共通関数作成         |
| モードバリデーション | `validateAuthMode` 共通関数作成      |
| ストア操作           | 基底クラスまたはミックスイン導入     |

#### 実装例

```typescript
// apps/desktop/src/main/utils/ipcHelpers.ts
export const createIpcResponse = <T>(
  success: boolean,
  data?: T,
  error?: { code: number; message: string },
): IpcResponse<T> => ({
  success,
  data,
  error,
  timestamp: new Date().toISOString(),
});

export const sanitizeError = (
  error: unknown,
): { code: number; message: string } => {
  if (error instanceof ValidationError) {
    return { code: error.code, message: error.message };
  }
  // 内部エラーはサニタイズ
  return { code: 5000, message: "内部エラーが発生しました" };
};
```

---

### TASK-2: 命名規則の統一

#### チェック項目

| カテゴリ         | 規則                                   | 例                           |
| ---------------- | -------------------------------------- | ---------------------------- |
| boolean変数      | `is` / `has` / `can` / `should` 接頭辞 | `isValid`, `hasToken`        |
| イベントハンドラ | `handle` 接頭辞                        | `handleModeChange`           |
| 非同期関数       | 動作を表す動詞                         | `fetchMode`, `validateToken` |
| 型名             | PascalCase                             | `AuthModeConfig`             |
| 定数             | SCREAMING_SNAKE_CASE                   | `DEFAULT_AUTH_MODE`          |

#### 変更対象

```typescript
// 変更前
const valid = await service.checkMode(mode);
const token = provider.get();

// 変更後
const isValid = await service.validateMode(mode);
const token = await provider.getToken();
```

---

### TASK-3: 関数分割・責務分離

#### AuthModeService の責務分離

**現状**（責務が混在している可能性）:

- 永続化管理
- バリデーション
- イベント発行

**改善後**:

```
AuthModeService
├── AuthModePersistence (永続化)
├── AuthModeValidator (バリデーション)
└── AuthModeEventEmitter (イベント)
```

#### 関数サイズの目安

- 1関数: 20行以内
- 1クラス: 200行以内
- 複雑度（Cyclomatic Complexity）: 10以下

#### 長い関数の分割例

```typescript
// 変更前: 40行の関数
async setMode(mode: AuthMode): Promise<void> {
  // バリデーション (10行)
  // 現在モード取得 (5行)
  // 永続化 (10行)
  // イベント発行 (10行)
  // ログ (5行)
}

// 変更後: 責務ごとに分割
async setMode(mode: AuthMode): Promise<void> {
  this.validateMode(mode);
  const previousMode = this.getCurrentMode();
  await this.persistMode(mode);
  this.emitModeChange(previousMode, mode);
}

private validateMode(mode: AuthMode): void { /* 5行 */ }
private async persistMode(mode: AuthMode): Promise<void> { /* 5行 */ }
private emitModeChange(prev: AuthMode, next: AuthMode): void { /* 5行 */ }
```

---

### TASK-4: パフォーマンス最適化

#### 対象箇所

| 箇所               | 最適化内容                       |
| ------------------ | -------------------------------- |
| トークンキャッシュ | TTL付きキャッシュの導入          |
| IPC呼び出し        | 不要な往復の削減                 |
| Store更新          | 不要な再レンダリング防止         |
| イベントリスナー   | メモリリーク防止のクリーンアップ |

#### キャッシュ最適化例

```typescript
class TokenCache {
  private cache: Map<string, { value: string; expiresAt: number }> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5分

  get(key: string): string | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key: string, value: string, ttl = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl,
    });
  }
}
```

---

### TASK-5: 型安全性の強化

#### 改善項目

| 項目               | 対策                    |
| ------------------ | ----------------------- |
| 型アサーション削減 | Type Guardへの置き換え  |
| any型の排除        | 適切な型定義            |
| ユニオン型網羅     | exhaustive checkの導入  |
| nullチェック       | Optional Chainingの活用 |

#### Type Guard例

```typescript
// 変更前
const mode = store.get("authMode") as AuthMode;

// 変更後
const isAuthMode = (value: unknown): value is AuthMode => {
  return value === "subscription" || value === "api-key";
};

const rawMode = store.get("authMode");
const mode = isAuthMode(rawMode) ? rawMode : "subscription";
```

#### exhaustive check例

```typescript
const getAuthProviderForMode = (mode: AuthMode): AuthProvider => {
  switch (mode) {
    case "subscription":
      return new SubscriptionAuthProvider();
    case "api-key":
      return new ApiKeyAuthProvider();
    default:
      // コンパイル時に未処理ケースを検出
      const _exhaustive: never = mode;
      throw new Error(`Unknown auth mode: ${_exhaustive}`);
  }
};
```

---

### TASK-6: コードスタイル統一

#### ESLint/Prettier自動修正

```bash
# 自動修正実行
pnpm --filter @repo/desktop lint:fix
pnpm --filter @repo/desktop format
```

#### 手動確認項目

- [ ] import文の整理（未使用import削除、順序統一）
- [ ] コメントの品質（Whyを説明、Whatは避ける）
- [ ] JSDoc/TSDocの追加（public API）
- [ ] TODO/FIXMEの確認と対応

## 統合テスト連携【必須】

リファクタリング後の統合テスト継続成功を確認:

```bash
# リファクタリング後のテスト実行（各変更後に実施）
pnpm --filter @repo/desktop test
pnpm --filter @repo/desktop test:integration
pnpm --filter @repo/desktop test:e2e
```

### リファクタリング後のテスト確認項目

| 確認項目            | テストコマンド          | 期待結果 |
| ------------------- | ----------------------- | -------- |
| ユニットテスト      | `pnpm test`             | 全 PASS  |
| IPC統合テスト       | `pnpm test:integration` | 全 PASS  |
| E2E認証方式切り替え | `pnpm test:e2e`         | 全 PASS  |
| カバレッジ維持      | `pnpm test:coverage`    | 基準維持 |

## リファクタリング手順

各タスクは以下の手順で実行する：

1. **変更前テスト実行**: `pnpm --filter @repo/desktop test`
2. **リファクタリング実施**: 小さな変更を1つずつ
3. **変更後テスト実行**: テストがGreenであることを確認
4. **コミット**: 論理的な単位でコミット

## 成果物

| ファイルパス                                                                | 説明                 |
| --------------------------------------------------------------------------- | -------------------- |
| リファクタリング対象の全ファイル                                            | 改善されたコード     |
| `apps/desktop/src/main/utils/ipcHelpers.ts`                                 | 共通ヘルパー（新規） |
| `docs/30-workflows/TASK-AUTH-MODE-SELECTION-001/outputs/refactoring-log.md` | リファクタリング記録 |

## リファクタリング記録テンプレート

```markdown
## リファクタリング記録

実施日: YYYY-MM-DD

### 実施項目

#### TASK-1: コード重複の除去

- [ ] 完了
- 変更ファイル:
  - {ファイル1}: {変更内容}
- テスト結果: PASS / FAIL

#### TASK-2: 命名規則の統一

- [ ] 完了
- 変更ファイル:
  - {ファイル1}: {変更内容}
- テスト結果: PASS / FAIL

（他タスクも同様）

### 品質指標の変化

| 指標                  | Before | After |
| --------------------- | ------ | ----- |
| 重複コード行数        |        |       |
| Cyclomatic Complexity |        |       |
| any型使用箇所         |        |       |
```

## 完了条件

- [ ] すべてのリファクタリングタスクが完了している
- [ ] すべてのテストがGreen
- [ ] ESLint警告がゼロ
- [ ] TypeScript型チェックがエラーなし
- [ ] コードレビュー観点での品質が改善されている
- [ ] リファクタリング記録が作成されている

## 次のPhase

Phase 9: 品質検証へ進む

- Lint実行
- 型チェック実行
- 全テスト実行
- 品質メトリクス確認
