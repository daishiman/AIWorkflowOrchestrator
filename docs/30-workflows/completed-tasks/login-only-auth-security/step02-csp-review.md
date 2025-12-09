# T-01-1: CSP設計検証レポート

## 検証概要

| 項目             | 内容                                                   |
| ---------------- | ------------------------------------------------------ |
| タスクID         | T-01-1                                                 |
| 検証日           | 2025-12-09                                             |
| 対象ファイル     | `apps/desktop/src/main/infrastructure/security/csp.ts` |
| 使用エージェント | @electron-security                                     |
| 判定             | **PASS**                                               |

---

## 完了条件チェックリスト

| 完了条件                                                     | 判定 | 確認箇所                                 |
| ------------------------------------------------------------ | :--: | ---------------------------------------- |
| 本番環境でunsafe-evalが含まれていないことを確認              |  ✅  | `getProductionDirectives()` L143         |
| 開発環境でHMR対応のためunsafe-evalが許可されていることを確認 |  ✅  | `getDevelopmentDirectives()` L170-174    |
| Supabase URLがconnect-srcに含まれることを確認                |  ✅  | `buildSupabaseConnectSources()` L108-120 |
| frame-ancestorsが'none'に設定されていることを確認            |  ✅  | `BASE_DIRECTIVES` L91                    |

---

## 設計検証詳細

### 1. 本番環境CSP設定

#### 検証結果: ✅ PASS

**コード確認** (`getProductionDirectives()` L138-149):

```typescript
export function getProductionDirectives(supabaseUrl?: string): CSPDirectiveMap {
  const supabaseSources = buildSupabaseConnectSources(supabaseUrl);

  return {
    ...BASE_DIRECTIVES,
    "script-src": [CSP_SOURCES.SELF], // unsafe-evalなし ✓
    "style-src": [CSP_SOURCES.SELF, CSP_SOURCES.UNSAFE_INLINE],
    "img-src": [CSP_SOURCES.SELF, CSP_SOURCES.DATA, CSP_SOURCES.HTTPS],
    "connect-src": [CSP_SOURCES.SELF, ...supabaseSources],
    "upgrade-insecure-requests": [],
  };
}
```

**検証ポイント**:

- `script-src`: `'self'`のみ → `unsafe-eval`を含まない ✅
- XSS攻撃からの保護が確保されている

---

### 2. 開発環境CSP設定

#### 検証結果: ✅ PASS

**コード確認** (`getDevelopmentDirectives()` L167-185):

```typescript
export function getDevelopmentDirectives(): CSPDirectiveMap {
  return {
    ...BASE_DIRECTIVES,
    "script-src": [
      CSP_SOURCES.SELF,
      CSP_SOURCES.UNSAFE_INLINE,
      CSP_SOURCES.UNSAFE_EVAL, // HMR用 ✓
    ],
    "style-src": [CSP_SOURCES.SELF, CSP_SOURCES.UNSAFE_INLINE],
    "img-src": [CSP_SOURCES.SELF, CSP_SOURCES.DATA, CSP_SOURCES.HTTPS],
    "connect-src": [
      CSP_SOURCES.SELF,
      CSP_SOURCES.HTTPS,
      CSP_SOURCES.WS, // WebSocket for HMR
      CSP_SOURCES.WSS,
    ],
  };
}
```

**検証ポイント**:

- `script-src`: `'unsafe-eval'`を含む → HMR/React DevTools対応 ✅
- `connect-src`: `ws:`/`wss:`を含む → WebSocket HMR対応 ✅
- 開発環境でのみ緩和されたポリシーが適用される

---

### 3. Supabase URL対応

#### 検証結果: ✅ PASS

**コード確認** (`buildSupabaseConnectSources()` L108-120):

```typescript
function buildSupabaseConnectSources(supabaseUrl?: string): string[] {
  if (!supabaseUrl) {
    return [];
  }

  try {
    const url = new URL(supabaseUrl);
    return [url.origin, CSP_SOURCES.SUPABASE_WILDCARD];
  } catch {
    console.warn("[CSP] Invalid SUPABASE_URL:", supabaseUrl);
    return [];
  }
}
```

**検証ポイント**:

- 指定されたSupabase URLのオリジンが許可される ✅
- ワイルドカード `https://*.supabase.co` も許可 ✅
- 不正URLの場合は安全にフォールバック（空配列 + 警告ログ）✅

---

### 4. クリックジャッキング対策

#### 検証結果: ✅ PASS

**コード確認** (`BASE_DIRECTIVES` L81-96):

```typescript
const BASE_DIRECTIVES: CSPDirectiveMap = {
  "default-src": [CSP_SOURCES.SELF],
  "font-src": [CSP_SOURCES.SELF],
  "object-src": [CSP_SOURCES.NONE], // Flash等禁止 ✓
  "frame-src": [CSP_SOURCES.NONE], // iframe禁止 ✓
  "frame-ancestors": [CSP_SOURCES.NONE], // クリックジャッキング対策 ✓
  "base-uri": [CSP_SOURCES.SELF],
  "form-action": [CSP_SOURCES.SELF],
};
```

**検証ポイント**:

- `frame-ancestors: 'none'` → iframe埋め込み禁止 ✅
- `object-src: 'none'` → Flash/プラグイン禁止 ✅
- `frame-src: 'none'` → 外部iframe読み込み禁止 ✅

---

## Electronセキュリティベストプラクティス適合

### Electron公式ガイドライン準拠

| ガイドライン                                                                                                    | 準拠状況 | 備考                    |
| --------------------------------------------------------------------------------------------------------------- | :------: | ----------------------- |
| [7. CSPを定義する](https://www.electronjs.org/docs/latest/tutorial/security#7-define-a-content-security-policy) |    ✅    | CSPモジュールとして実装 |
| 本番でeval禁止                                                                                                  |    ✅    | `unsafe-eval`なし       |
| 開発/本番の分離                                                                                                 |    ✅    | `isDev`フラグで切り替え |

### 追加セキュリティ対策

| 対策                        | 実装状況 | 効果                         |
| --------------------------- | :------: | ---------------------------- |
| `upgrade-insecure-requests` |    ✅    | HTTP→HTTPS自動昇格           |
| `base-uri: 'self'`          |    ✅    | base要素インジェクション防止 |
| `form-action: 'self'`       |    ✅    | フォーム送信先制限           |

---

## テスト網羅性

### テストファイル: `csp.test.ts`

| テストカテゴリ           | テスト数 | 網羅状況 |
| ------------------------ | :------: | :------: |
| generateCSP              |    7     |    ✅    |
| getProductionDirectives  |    10    |    ✅    |
| getDevelopmentDirectives |    4     |    ✅    |
| buildCSPString           |    5     |    ✅    |
| セキュリティ要件         |    3     |    ✅    |

**特に重要なテストケース**:

- 「本番環境のCSPはeval系を禁止している」(L244-248)
- 「クリックジャッキング対策が有効である」(L250-254)
- 「不正なSUPABASE_URLはエラーにならず無視される」(L58-68)

---

## 改善提案（オプション）

現在の実装は要件を完全に満たしていますが、将来的な強化として以下を検討可能：

| 項目        | 優先度 | 内容                                  |
| ----------- | :----: | ------------------------------------- |
| report-uri  |   低   | CSP違反レポート収集エンドポイント追加 |
| nonce-based |   低   | script-srcでnonce方式採用（より厳格） |

**注**: これらは現時点では不要であり、既存実装で十分なセキュリティが確保されています。

---

## 判定結果

### 総合判定: **PASS**

全ての完了条件を満たしており、Electronセキュリティベストプラクティスにも準拠しています。

| 判定項目                 | 結果 |
| ------------------------ | :--: |
| 本番環境セキュリティ     |  ✅  |
| 開発環境対応             |  ✅  |
| Supabase統合             |  ✅  |
| クリックジャッキング対策 |  ✅  |
| テスト網羅性             |  ✅  |
