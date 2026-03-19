# Phase 2: 型定義設計書

## メタ情報

| 項目     | 内容       |
| -------- | ---------- |
| タスクID | UT-06-001  |
| Phase    | 2          |
| 作成日   | 2026-03-16 |

## 1. RiskLevel 型

```typescript
/**
 * ツール操作のリスクレベル分類
 *
 * @remarks
 * - "low": Read・Glob・Grep を含む読み取り専用ツール呼び出し
 * - "medium": Write・Edit による局所的なファイル変更操作
 * - "high": Bash によるシステム設定変更・ファイル削除・プロセス実行
 */
export type RiskLevel = "low" | "medium" | "high";
```

### 設計判断

- Issue #1251 の受入基準に準拠し3段階とする
- プロトタイプの `ToolRiskLevel`（4段階）から `critical` を削除
- 型名を `ToolRiskLevel` → `RiskLevel` に変更（Issue 準拠）
- `@remarks` で各レベルの典型的なツール例を記述

## 2. ToolRiskConfigEntry interface

```typescript
/**
 * リスクレベルごとのダイアログ・権限設定エントリ
 *
 * @see TOOL_RISK_CONFIG
 */
export interface ToolRiskConfigEntry {
  /** PermissionDialog の表示幅（px）。リスクが高いほど大きい値 */
  dialogWidth: 400 | 480 | 640;
  /** ダイアログヘッダーの色トークン（CSS変数名、例: "--risk-high"） */
  headerColorToken: string;
  /** 「常に許可」ボタンの表示可否。high では false 固定 */
  allowPermanent: boolean;
  /** 「24時間許可」ボタンの表示可否。high では false 固定 */
  allowTime24h: boolean;
  /** 「7日間許可」ボタンの表示可否。high では false 固定 */
  allowTime7d: boolean;
}
```

### 設計判断

| フィールド         | 型                  | 制約               | 根拠                                        |
| ------------------ | ------------------- | ------------------ | ------------------------------------------- |
| `dialogWidth`      | `400 \| 480 \| 640` | リテラル型ユニオン | 許容値を型レベルで制限                      |
| `headerColorToken` | `string`            | CSS変数名形式      | 後続 PermissionDialog が CSS 変数として参照 |
| `allowPermanent`   | `boolean`           | high では false    | セキュリティ不変条件                        |
| `allowTime24h`     | `boolean`           | high では false    | フェイルセキュア原則                        |
| `allowTime7d`      | `boolean`           | high では false    | フェイルセキュア原則                        |

### プロトタイプからの変更

- `level` フィールド: 削除（キーで判別可能、冗長）
- `allowApproveOnce` フィールド: 削除（常に true 前提）
- `autoDenyDefault` フィールド: 削除（critical 削除に伴い不要）
- `allowTime24h` / `allowTime7d`: 新規追加（時間制限許可の制御）

## 3. Phase 4 デシジョンテーブルとの整合性

| リスクレベル | permanent                    | time_7d                   | time_24h                   | session |
| ------------ | ---------------------------- | ------------------------- | -------------------------- | ------- |
| low          | 可（allowPermanent=true）    | 可（allowTime7d=true）    | 可（allowTime24h=true）    | 可      |
| medium       | 可（allowPermanent=true）    | 可（allowTime7d=true）    | 可（allowTime24h=true）    | 可      |
| high         | 不可（allowPermanent=false） | 不可（allowTime7d=false） | 不可（allowTime24h=false） | 可      |

デシジョンテーブルとの差分: high の `time_24h` はデシジョンテーブルでは「可」だが、Issue #1251 の受入基準に従い「不可」とする。フェイルセキュア原則を優先する判断。
