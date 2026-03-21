# M-1 対処: RuntimeDecisionForRenderer 型定義

## 目的

Renderer プロセスに送信する RuntimeDecision から機密情報を除去し、安全な型として公開する。DD-2（apiKey を Renderer に渡さない）準拠。

## 型定義

### RuntimeDecisionForRenderer

```typescript
/**
 * Renderer プロセスに安全に送信可能な RuntimeDecision のサニタイズ済み型。
 *
 * 以下のフィールドは除外される:
 * - apiKey: DD-2 準拠。認証情報は Main Process に留める
 * - bundle (TerminalHandoffBundle): 内部実装詳細。HandoffGuidance に変換して送信
 * - permissionMode: Main Process 内部の権限制御情報
 */
export type RuntimeDecisionForRenderer =
  | { type: "integrated_api" }
  | { type: "terminal_handoff"; guidance: HandoffGuidance };
```

### HandoffGuidance（Renderer 向け変換型）

```typescript
/**
 * TerminalHandoffBundle から Renderer に必要な情報のみを抽出した型。
 * ユーザーへの案内表示に必要な最小限の情報を含む。
 */
export interface HandoffGuidance {
  /** 表示用のプロバイダー名 */
  providerName: string;
  /** 表示用のモデル名 */
  modelName: string;
  /** ユーザーへの案内メッセージ（ターミナルでの操作手順など） */
  instructionMessage: string;
  /** ハンドオフ先のターミナル種別（任意） */
  terminalType?: string;
}
```

### 元の RuntimeDecision（参考: Main Process 内部型）

```typescript
/**
 * Main Process 内部で使用される完全な RuntimeDecision。
 * この型は Renderer に直接送信してはならない。
 */
export type RuntimeDecision =
  | {
      type: "integrated_api";
      apiKey: string;
      provider: string;
      model: string;
    }
  | {
      type: "terminal_handoff";
      bundle: TerminalHandoffBundle;
      permissionMode: PermissionMode;
    };
```

## サニタイズ関数

### sanitizeForRenderer

```typescript
/**
 * RuntimeDecision から機密情報を除去し、Renderer 向けの安全な型に変換する。
 *
 * @param decision - Main Process 内部の RuntimeDecision
 * @returns Renderer に安全に送信可能な RuntimeDecisionForRenderer
 *
 * @remarks
 * サニタイズ対象フィールド:
 * - apiKey: 認証キー。Renderer には一切送信しない（DD-2 準拠）
 * - bundle (TerminalHandoffBundle): 内部実装詳細を含む。
 *   HandoffGuidance に変換し、ユーザー表示に必要な情報のみ抽出
 * - permissionMode: Agent SDK の権限制御モード。
 *   Main Process 内部でのみ参照し、Renderer には公開しない
 */
export function sanitizeForRenderer(
  decision: RuntimeDecision,
): RuntimeDecisionForRenderer {
  switch (decision.type) {
    case "integrated_api":
      return { type: "integrated_api" };

    case "terminal_handoff":
      return {
        type: "terminal_handoff",
        guidance: convertBundleToGuidance(decision.bundle),
      };

    default: {
      const _exhaustive: never = decision;
      throw new Error(`未知の decision type: ${JSON.stringify(_exhaustive)}`);
    }
  }
}
```

### convertBundleToGuidance（内部ヘルパー）

```typescript
/**
 * TerminalHandoffBundle から HandoffGuidance への変換。
 * Bundle 内の内部実装詳細を除去し、ユーザー表示に必要な情報のみ抽出する。
 *
 * @param bundle - Main Process 内部の TerminalHandoffBundle
 * @returns Renderer 表示用の HandoffGuidance
 */
function convertBundleToGuidance(
  bundle: TerminalHandoffBundle,
): HandoffGuidance {
  return {
    providerName: bundle.providerName,
    modelName: bundle.modelName,
    instructionMessage: bundle.userInstruction,
    terminalType: bundle.terminalType,
  };
}
```

## サニタイズ対象フィールド一覧

| フィールド       | 元の型                  | サニタイズ処理           | 理由                                        |
| ---------------- | ----------------------- | ------------------------ | ------------------------------------------- |
| `apiKey`         | `string`                | 完全除去                 | DD-2 準拠。認証情報は Main Process に留める |
| `bundle`         | `TerminalHandoffBundle` | `HandoffGuidance` に変換 | 内部実装詳細を除去し表示用情報のみ抽出      |
| `permissionMode` | `PermissionMode`        | 完全除去                 | Agent SDK 権限制御は Main Process 内部情報  |
| `provider`       | `string`                | 完全除去                 | integrated_api 時のプロバイダー内部識別子   |
| `model`          | `string`                | 完全除去                 | integrated_api 時のモデル内部識別子         |

## 配置先

```
packages/shared/src/types/runtime.ts
```

`RuntimeDecisionForRenderer` と `HandoffGuidance` は `packages/shared` に配置し、Renderer と Main の両方から参照可能とする。`sanitizeForRenderer` 関数は Main Process 側（`apps/desktop/src/main/`）に配置し、Renderer からは import 不可とする。
