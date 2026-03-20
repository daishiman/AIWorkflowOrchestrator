# Phase 2: 契約マトリクス (Contract Matrix)

## メタ情報

| 項目     | 内容                                                      |
| -------- | --------------------------------------------------------- |
| タスクID | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 |
| Phase    | 2                                                         |
| 作成日   | 2026-03-20                                                |

## Capability x State x CTA 全組み合わせテーブル

| capability        | UI state    | primary CTA ラベル | primary CTA action                        | secondary CTA ラベル | secondary CTA action                      | 禁止条件                                                       |
| ----------------- | ----------- | ------------------ | ----------------------------------------- | -------------------- | ----------------------------------------- | -------------------------------------------------------------- |
| integratedRuntime | ready       | AI で実行          | in-app AI 実行を開始する                  | 設定を開く           | settings 画面を開く                       | silent fallback / auto-send / no-op CTA                        |
| integratedRuntime | blocked     | 設定を修正する     | settings 画面の該当セクションを開く       | ヘルプを表示         | help / troubleshooting を開く             | no-op CTA / silent fallback to terminal                        |
| terminalSurface   | ready       | ターミナルで実行   | terminal surface を開き handoff card 表示 | コマンドをコピー     | suggested command をクリップボードへ      | auto-send / hidden prompt injection                            |
| terminalSurface   | blocked     | 設定を修正する     | settings 画面の該当セクションを開く       | ヘルプを表示         | help / troubleshooting を開く             | no-op CTA / silent fallback to integrated                      |
| both              | ready       | AI で実行          | in-app AI 実行を開始する                  | ターミナルで実行     | terminal surface を開き handoff card 表示 | silent fallback（片方が失敗しても自動切り替えしない）          |
| both              | blocked     | 設定を修正する     | settings 画面の該当セクションを開く       | ターミナルで実行     | terminal surface を開く                   | no-op CTA / silent degradation                                 |
| none              | blocked     | 設定を開く         | settings 画面を開く                       | ヘルプを表示         | help / setup guide を開く                 | no-op CTA / silent fallback / hidden prompt injection          |
| none              | unavailable | （非表示）         | -                                         | セットアップガイド   | setup / install 案内を開く                | primary CTA を DOM に含めない / disabled CTA / silent fallback |

## Capability x State 判定ルール詳細

### integratedRuntime の判定

```
IF apiKeyValid === true AND subscriptionValid === false
THEN capability = "integratedRuntime"
```

| 補助条件               | uiState |
| ---------------------- | ------- |
| API 接続成功           | ready   |
| API 接続不可 / timeout | blocked |

### terminalSurface の判定

```
IF apiKeyValid === false AND subscriptionValid === true
THEN capability = "terminalSurface"
```

| 補助条件                   | uiState |
| -------------------------- | ------- |
| terminal launcher 利用可能 | ready   |
| terminal 起動不可 / 未設定 | blocked |

### both の判定

```
IF apiKeyValid === true AND subscriptionValid === true
THEN capability = "both"
```

| 補助条件             | uiState |
| -------------------- | ------- |
| 両 lane 利用可能     | ready   |
| いずれかの lane 不可 | blocked |

### none の判定

```
IF apiKeyValid === false AND subscriptionValid === false
THEN capability = "none"
```

| 補助条件                           | uiState     |
| ---------------------------------- | ----------- |
| 解決 action あり（設定で復旧可能） | blocked     |
| 解決 action なし                   | unavailable |

## DTO 設計

### AuthModeStatus 拡張案

既存の `AuthModeStatus` transport DTO を最小差分で拡張する。既存フィールドとの互換性を維持し、新規フィールドは optional で追加する。

```typescript
interface AuthModeStatus {
  // --- 既存フィールド（変更なし） ---
  mode: AuthMode; // "subscription" | "api-key"
  isValid: boolean; // 認証が有効か
  hasCredentials: boolean; // 認証情報が存在するか
  message: string; // 表示メッセージ
  errorCode?: AuthModeErrorCode; // エラーコード
  guidance?: string; // ガイダンステキスト
  lastCheckedAt: number; // 最終確認日時

  // --- 新規フィールド（capability 契約） ---
  capability?: "integratedRuntime" | "terminalSurface" | "both" | "none";
  uiState?: "ready" | "blocked" | "unavailable";
  blockedReason?: string; // uiState === "blocked" のとき必須
  blockedAction?: {
    // uiState === "blocked" のとき必須
    label: string;
    targetRoute: string;
  };
}
```

### Ownership 表

| concern   | ownership ファイル         | 入力                             | 出力                                    | 禁止事項                         |
| --------- | -------------------------- | -------------------------------- | --------------------------------------- | -------------------------------- |
| Concern A | `RuntimePolicyResolver.ts` | API key 有無 / subscription 有無 | capability 値                           | 他ファイルでの capability 再計算 |
| Concern B | Renderer selector / hook   | capability 値                    | uiState + blockedReason / blockedAction | Main Process での uiState 計算   |
| Concern C | CTA コンポーネント         | capability + uiState             | CTA 表示 / 非表示                       | コンポーネント内追加条件         |

## 禁止条件サマリー

| 禁止条件                | 該当セル                        | enforcement 方法                                               |
| ----------------------- | ------------------------------- | -------------------------------------------------------------- |
| silent fallback         | 全セル                          | RuntimePolicyResolver が `none` を返すべき条件で他値を返さない |
| auto-send               | terminalSurface / both の全セル | TerminalHandoffBuilder の出力を UI イベント非経由で送信しない  |
| hidden prompt injection | terminalSurface / both の全セル | handoff bundle の prompt が UI 表示内容と一致することを検証    |
| no-op CTA               | blocked / unavailable の全セル  | blocked 時は guidance action を必ず primary CTA にする         |
| disabled CTA            | unavailable セルの primary CTA  | primary CTA を DOM に含めない（disabled ではなく非表示）       |

## Canonical Doc Set（AC-4 対応）

本 contract-matrix と以下の文書群が Task02 以降の正本となる:

- `outputs/phase-1/requirements-definition.md` - FR/NFR/AC 定義
- `outputs/phase-1/scope-definition.md` - Task01 境界と canonical doc set
- `outputs/phase-1/current-state-inventory.md` - 現状 gap 分析
- `outputs/phase-2/design-summary.md` - 3 concern 分解と ownership
- `outputs/phase-2/contract-matrix.md` - 本文書
- `outputs/phase-2/validation-matrix.md` - 検証観点マトリクス
