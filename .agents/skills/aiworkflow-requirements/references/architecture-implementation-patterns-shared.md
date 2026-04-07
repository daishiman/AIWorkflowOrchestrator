# 実装パターン（共有パッケージ・ApprovalGate） / shared specification
> 親ファイル: [architecture-implementation-patterns-core.md](architecture-implementation-patterns-core.md)

## 共有パッケージ実装パターン

### S19: セキュリティ定数の Immutability パターン（Object.freeze + satisfies）

セキュリティ上の不変条件を持つ定数（リスクレベル別設定、許可リスト等）を定義する際に、`Object.freeze` による実行時保護と `satisfies` による型安全性を組み合わせるパターン。

#### 問題

`as const` のみでは TypeScript のコンパイル時チェックに限定され、実行時に値を書き換えられるリスクがある。セキュリティ定数は実行時の改ざん防止が必須であるため、`Object.freeze` による深層凍結が必要になる。一方で `Object.freeze` の戻り値型は `Readonly<T>` となり、`Record<K, V>` 型との互換性が崩れやすい。

#### 解決パターン

```typescript
// 1. 型定義
type RiskLevel = "low" | "medium" | "high";

interface ToolRiskConfigEntry {
  dialogWidth: number;
  headerColorToken: `--risk-${string}`;
  allowPermanent: boolean;
  allowTime24h: boolean;
  allowTime7d: boolean;
}

// 2. Object.freeze + satisfies で定義
export const TOOL_RISK_CONFIG = Object.freeze({
  low: Object.freeze({
    dialogWidth: 400,
    headerColorToken: "--risk-low" as const,
    allowPermanent: true,
    allowTime24h: true,
    allowTime7d: true,
  }),
  medium: Object.freeze({
    dialogWidth: 480,
    headerColorToken: "--risk-medium" as const,
    allowPermanent: false,
    allowTime24h: true,
    allowTime7d: true,
  }),
  high: Object.freeze({
    dialogWidth: 520,
    headerColorToken: "--risk-high" as const,
    allowPermanent: false,
    allowTime24h: false,
    allowTime7d: false,
  }),
}) satisfies Record<RiskLevel, ToolRiskConfigEntry>;
```

#### 各要素の役割

| 要素 | 役割 | 欠落時のリスク |
| --- | --- | --- |
| `Object.freeze`（外層） | オブジェクトへのプロパティ追加・削除を実行時に防止 | `TOOL_RISK_CONFIG.high = {...}` で上書き可能 |
| `Object.freeze`（内層） | 各エントリの値変更を実行時に防止 | `TOOL_RISK_CONFIG.high.allowPermanent = true` で不変条件破壊 |
| `satisfies Record<K, V>` | キー網羅性と値型の整合性をコンパイル時に保証 | 新規 RiskLevel 追加時にエントリ漏れを検出できない |
| `as const`（値レベル） | リテラル型の推論を維持 | `headerColorToken` が `string` に拡張され、型精度が低下 |

#### 適用基準

| 条件 | 判断 |
| --- | --- |
| セキュリティ上の不変条件がある | `Object.freeze` 深層凍結を適用する |
| ユニオン型のキーに対して全エントリが必須 | `satisfies Record<K, V>` で網羅性を保証する |
| リテラル型の精度が必要（CSS変数名等） | `as const` を併用する |
| 実行時の改ざん防止が不要（UIスタイル定数等） | `as const` のみで十分（S13パターン参照） |

#### 関連パターン

- S13: Record型バリアント定義パターン（UIスタイル定数向け、`Object.freeze` 不要）
- P47: CSS変数ベースのスタイルテストアサーション戦略

#### 導入タスク

UT-06-001（TOOL_RISK_CONFIG 定数定義）

---

---

## ApprovalGate Enforcement パターン（TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001）

### 目的

外部送信操作（terminal 経由のコマンド実行等）に対して承認フローを強制し、ユーザーの明示的な同意なしに操作が完了しないことを保証する。

### 実装

| 要素 | 内容 |
| --- | --- |
| インターフェース | `IApprovalGate` — `request()` / `grant(token)` / `validate(token)` / `revoke(token)` / `revokeAll()` |
| 実装クラス | `DefaultApprovalGate` — Node.js `crypto.randomBytes(32).toString('hex')` でトークン生成 |
| ファイル | `src/main/services/runtime/ApprovalGate.ts` |

### ライフサイクル

```
request() → grant(token) → validate(token) → revoke(token)
                                  ↓
                            revokeAll() （セッション終了時）
```

### 制約条件

| 制約 | 値 |
| --- | --- |
| TTL | 300秒（トークン生成から5分） |
| ワンタイム使用 | validate() 成功後に自動 revoke |
| トークン長 | 64文字 hex（32バイト） |

### DI パターン

```typescript
// terminalHandlers.ts での使用例
function registerTerminalHandlers(
  mainWindow: BrowserWindow,
  approvalGate?: IApprovalGate,  // optional: 既存コードへの影響を最小化
) { ... }
```

コンストラクタ注入（optional パラメータ）で既存コードへの影響を最小化しつつテスタビリティを確保する。未注入時は ApprovalGate なしで動作する degraded モードとして扱う。

### 関連

- `approvalHandlers.ts`: `approval:respond` チャンネルで承認/拒否応答を受け付け、3段バリデーション（必須チェック/型チェック/trim チェック）を実施
- `terminalHandlers.ts`: ApprovalGate を optional で受け取り、外部送信前に `validate(token)` でトークン検証
- `IApprovalGate` インターフェースにより DIP 準拠（UT-SC-01-DIP-INTERFACE パターン適用）
