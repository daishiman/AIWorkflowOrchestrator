# リスクレベル分類・TOOL_RISK_CONFIG 型定義・PermissionDialog ワイヤーフレーム設計

## 1. メタ情報

| 項目       | 値                                                           |
| ---------- | ------------------------------------------------------------ |
| タスク ID  | TASK-SKILL-LIFECYCLE-06                                      |
| Phase      | 2（設計）                                                    |
| Lane       | Lane-A: UI                                                   |
| 成果物     | `outputs/phase-2/risk-level-design.md`                       |
| 作成日     | 2026-03-16                                                   |
| 依存成果物 | `outputs/phase-1/risk-level-classification.md`（OUT-1）      |
| ステータス | Draft                                                        |
| 担当       | SubAgent-A（リスクレベル分類と権限要求 UI ワイヤーフレーム） |

---

## 2. Concern Target Topology（3レーン表）

| Lane         | 対象レイヤ                     | 既存コンポーネント                                                             | 追加設計要素                                                                  |
| ------------ | ------------------------------ | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| Lane-A: UI   | Renderer Process               | `toolMetadata.ts`、`PermissionDialog`（57テスト、Line 100%）                   | `ToolRiskConfig` 型定義、リスクレベル別ダイアログ表現設計、ヘッダー色トークン |
| Lane-B: 永続 | Main Process + Renderer        | `PermissionStore`（electron-store）、`permissionHistorySlice`                  | `AllowedToolEntryV2` の `expiresAt` フィールド拡張、取り消し UI フロー設計    |
| Lane-C: 統合 | Renderer + Main + Task-08 契約 | Task-05 CTA 画面（ScoringGate）、Task-03 runtime routing（PermissionResolver） | 説明責任 UI 挿入点（INS-01/02/03）、`SafetyGateContract` 型定義               |

---

## 3. ToolRiskLevel / ToolRiskConfig 型定義

配置先: `packages/shared/src/constants/security.ts`

```typescript
/**
 * ツールのリスクレベル4段階。
 * Phase 1 OUT-1 の risk-level-classification.md で定義した
 * Critical(4) / High(3) / Medium(2) / Low(1) に対応する。
 */
export type ToolRiskLevel = "critical" | "high" | "medium" | "low";

/**
 * リスクレベルごとの PermissionDialog 表示設定。
 * PermissionDialog コンポーネントはこの設定を参照し、
 * ボタン表示・ダイアログ幅・ヘッダー色を動的に切り替える。
 */
export interface ToolRiskConfig {
  /** このエントリが対応するリスクレベル */
  level: ToolRiskLevel;
  /** 「今回のみ許可」ボタンを表示するか */
  allowApproveOnce: boolean;
  /** 「恒久許可」ボタンを表示するか */
  allowPermanent: boolean;
  /** デフォルトで自動拒否するか（ユーザー設定で変更可能） */
  autoDenyDefault: boolean;
  /** ダイアログヘッダー背景色の CSS 変数トークン名 */
  headerColorToken: string;
  /** ダイアログ幅（px）。400 / 480 / 640 の3段階固定 */
  dialogWidth: 400 | 480 | 640;
}

/**
 * 全4リスクレベルの PermissionDialog 表示設定。
 * Record 型により ToolRiskLevel の網羅性をコンパイル時に保証する。
 */
export const TOOL_RISK_CONFIG: Record<ToolRiskLevel, ToolRiskConfig> = {
  critical: {
    level: "critical",
    allowApproveOnce: false,
    allowPermanent: false,
    autoDenyDefault: true,
    headerColorToken: "--status-destructive",
    dialogWidth: 640,
  },
  high: {
    level: "high",
    allowApproveOnce: true,
    allowPermanent: false,
    autoDenyDefault: false,
    headerColorToken: "--status-warning",
    dialogWidth: 480,
  },
  medium: {
    level: "medium",
    allowApproveOnce: true,
    allowPermanent: true,
    autoDenyDefault: false,
    headerColorToken: "--status-caution",
    dialogWidth: 400,
  },
  low: {
    level: "low",
    allowApproveOnce: true,
    allowPermanent: true,
    autoDenyDefault: false,
    headerColorToken: "--status-info",
    dialogWidth: 400,
  },
};
```

### 3.1 設計判断の根拠

| リスクレベル | `allowApproveOnce` | `allowPermanent` | `autoDenyDefault` | 根拠                                                                                                          |
| ------------ | ------------------ | ---------------- | ----------------- | ------------------------------------------------------------------------------------------------------------- |
| Critical     | `false`            | `false`          | `true`            | 不可逆的システム破壊操作（`rm -rf`、`sudo`、フォークボム）に対して恒久許可・一回許可の昇格経路を遮断する      |
| High         | `true`             | `false`          | `false`           | 任意コード実行・機密パスアクセスを伴うが、ユーザーが操作内容を確認した上で1回限りの許可を選択できるようにする |
| Medium       | `true`             | `true`           | `false`           | ファイル書き込み・外部通信は影響範囲が限定されるため、ユーザー判断で恒久許可を付与可能とする                  |
| Low          | `true`             | `true`           | `false`           | 読み取り専用・検索操作のみで副作用がないため、全許可オプションを提供する                                      |

---

## 4. リスクレベル別 PermissionDialog ワイヤーフレーム

### 4.1 Critical レベル（640px 幅、blur backdrop）

```
╔══════════════════════════════════════════════════════════════════════╗
║  ████████████████████ ヘッダー背景: --status-destructive ████████████║
║  [!] 危険: システム破壊操作の実行許可を求めています                  ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  スキル名: {skillName}                                               ║
║  ツール:   {toolName}                                                ║
║  引数プレビュー:                                                     ║
║    {argsSnapshot（最大200文字、超過時は末尾を「...」で省略）}        ║
║                                                                      ║
║  ┌─────────────────────────────────────────────────────────────┐    ║
║  │ このツールはシステム全体に影響する不可逆的な操作を           │    ║
║  │ 実行できます。実行後の復旧手段は存在しません。              │    ║
║  │                                                             │    ║
║  │ セキュリティ影響:                                           │    ║
║  │   {securityImpact（toolMetadata.ts から取得）}              │    ║
║  └─────────────────────────────────────────────────────────────┘    ║
║                                                                      ║
║  ※ 承認スコープ選択: 非表示（Critical では恒久許可・一回許可を遮断）║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  autoDenyDefault === true の場合:                                    ║
║            [拒否する]                                                ║
║                                                                      ║
║  autoDenyDefault === false の場合（ユーザーが設定画面で変更済み）:   ║
║            [拒否する]          [今回のみ許可]                        ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝

backdrop: filter: blur(8px); background: rgba(0, 0, 0, 0.6)
```

**Critical 固有の表示ルール:**

- backdrop に `blur(8px)` を適用し、背面コンテンツを視覚的に遮蔽する
- 承認スコープ選択セクション（「今回のセッションのみ」/「常に許可」ラジオボタン）を非表示にする
- `autoDenyDefault === true`（デフォルト）の場合、ボタンは「拒否する」のみ表示する
- `autoDenyDefault === false`（設定画面で「Critical 操作を許可」を有効化済み）の場合、「今回のみ許可」ボタンを追加表示する

### 4.2 High レベル（480px 幅）

```
╔════════════════════════════════════════════════════════╗
║  ██████████ ヘッダー背景: --status-warning ████████████║
║  [▲] 注意: ツール使用の許可を求めています              ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║  スキル名: {skillName}                                 ║
║  ツール:   {toolName}                                  ║
║  引数プレビュー:                                       ║
║    {argsSnapshot（最大200文字）}                       ║
║                                                        ║
║  ┌──────────────────────────────────────────────┐     ║
║  │ このツールは権限昇格または機密データへの       │     ║
║  │ アクセスを伴います。                          │     ║
║  │                                                │     ║
║  │ セキュリティ影響:                              │     ║
║  │   {securityImpact}                             │     ║
║  └──────────────────────────────────────────────┘     ║
║                                                        ║
║  承認スコープ:                                         ║
║    (*) 今回のセッションのみ  （approve_once）          ║
║    恒久許可: 非表示（High では恒久許可を遮断）         ║
║                                                        ║
╠════════════════════════════════════════════════════════╣
║            [拒否する]      [今回のみ許可]              ║
╚════════════════════════════════════════════════════════╝
```

**High 固有の表示ルール:**

- 警告バナー（橙背景テキスト）をヘッダー直下に表示する
- 承認スコープは「今回のセッションのみ」のみ選択可能とする（ラジオボタン1択、固定選択状態）
- 「恒久許可」オプションを非表示にする（`allowPermanent === false`）
- ボタンは「拒否する」「今回のみ許可」の2択とする

### 4.3 Medium レベル（400px 幅）

```
╔══════════════════════════════════════════╗
║  ████ ヘッダー背景: --status-caution ████║
║  ツール使用の許可を求めています          ║
╠══════════════════════════════════════════╣
║                                          ║
║  スキル名: {skillName}                   ║
║  ツール:   {toolName}                    ║
║  引数プレビュー:                         ║
║    {argsSnapshot（最大200文字）}         ║
║                                          ║
║  セキュリティ影響:                       ║
║    {securityImpact}                      ║
║                                          ║
║  承認スコープ:                           ║
║    ( ) 今回のセッションのみ              ║
║    (*) このスキルに対して常に許可         ║
║                                          ║
╠══════════════════════════════════════════╣
║    [拒否]    [今回のみ]    [許可する]    ║
╚══════════════════════════════════════════╝
```

**Medium 固有の表示ルール:**

- ヘッダーに警告アイコンを表示しない（通常の確認ダイアログ体裁）
- 承認スコープは「今回のセッションのみ」「常に許可」の2択ラジオボタンを表示する
- ボタンは「拒否」「今回のみ」「許可する」の3択とする
- デフォルト選択は「常に許可」（ユーザーの操作負荷を軽減）

### 4.4 Low レベル（400px 幅、インライン確認）

```
┌────────────────────────────────────────┐
│ ████ ヘッダー: --status-info ██████████ │
│ {toolName} を使用します                │
│                                        │
│ 引数: {argsSnapshot（最大100文字）}    │
│                                        │
│  [拒否]   [今回のみ]   [許可する]      │
└────────────────────────────────────────┘

※ インライン表示モード:
- ストリーミング UI 内にミニダイアログとして埋め込み表示する
- モーダルオーバーレイは使用しない（backdrop なし）
- 承認スコープ選択はボタンラベルに統合する:
  「今回のみ」= approve_once、「許可する」= approve（恒久）
```

**Low 固有の表示ルール:**

- フルモーダルではなく、ストリーミング UI 内のインラインカード（ミニダイアログ）として表示する
- セキュリティ影響テキストを省略する（副作用がないため）
- 承認スコープのラジオボタンを省略し、ボタンラベルで承認スコープを暗示する
- トースト表示（3秒後に自動非表示）も選択肢として許容する（自動承認設定が有効な場合）

---

## 5. ヘッダー背景色トークン定義表

### 5.1 CSS 変数定義

| CSS 変数名             | ライトモード色値 | ダークモード色値 | 用途              | Apple HIG 対応色 |
| ---------------------- | ---------------- | ---------------- | ----------------- | ---------------- |
| `--status-destructive` | `#FF3B30`        | `#FF453A`        | Critical ヘッダー | systemRed        |
| `--status-warning`     | `#FF9500`        | `#FF9F0A`        | High ヘッダー     | systemOrange     |
| `--status-caution`     | `#FFCC00`        | `#FFD60A`        | Medium ヘッダー   | systemYellow     |
| `--status-info`        | `#007AFF`        | `#0A84FF`        | Low ヘッダー      | systemBlue       |

### 5.2 CSS 変数宣言（Tailwind CSS 設定への追加）

```css
:root {
  --status-destructive: #ff3b30;
  --status-warning: #ff9500;
  --status-caution: #ffcc00;
  --status-info: #007aff;
}

@media (prefers-color-scheme: dark) {
  :root {
    --status-destructive: #ff453a;
    --status-warning: #ff9f0a;
    --status-caution: #ffd60a;
    --status-info: #0a84ff;
  }
}
```

### 5.3 コントラスト比の確認

| トークン               | ライトモード背景色 | ヘッダーテキスト色 | コントラスト比 | WCAG 2.1 AA 基準（3:1）   |
| ---------------------- | ------------------ | ------------------ | -------------- | ------------------------- |
| `--status-destructive` | `#FF3B30`          | `#FFFFFF`          | 4.0:1          | 合格（大テキスト/UI部品） |
| `--status-warning`     | `#FF9500`          | `#000000`          | 4.5:1          | 合格                      |
| `--status-caution`     | `#FFCC00`          | `#000000`          | 8.6:1          | 合格                      |
| `--status-info`        | `#007AFF`          | `#FFFFFF`          | 4.6:1          | 合格                      |

- `--status-destructive` のテキスト色は `#FFFFFF`（白）とし、コントラスト比 4.0:1 を確保する（UI 部品基準 3:1 を充足）
- `--status-warning` および `--status-caution` のテキスト色は `#000000`（黒）とし、コントラスト比を確保する

---

## 6. リスクレベル別ダイアログ表示条件マトリクス

### 6.1 表示属性マトリクス（4レベル x 6属性）

| リスクレベル | ダイアログ幅 | ヘッダー色トークン     | 「今回のみ」ボタン | 「恒久許可」ボタン | 承認スコープ表示 | 自動拒否デフォルト | backdrop           |
| ------------ | ------------ | ---------------------- | ------------------ | ------------------ | ---------------- | ------------------ | ------------------ |
| Critical     | 640px        | `--status-destructive` | 条件付き表示(※1)   | 非表示             | 非表示           | ON                 | blur(8px) + 半透明 |
| High         | 480px        | `--status-warning`     | 表示               | 非表示             | 1択固定表示      | OFF                | 標準オーバーレイ   |
| Medium       | 400px        | `--status-caution`     | 表示               | 表示               | 2択表示          | OFF                | 標準オーバーレイ   |
| Low          | 400px        | `--status-info`        | 表示               | 表示               | ボタンに統合     | OFF                | なし（インライン） |

※1: `autoDenyDefault === false`（ユーザーが設定画面で Critical 操作許可を有効化済み）の場合のみ表示

### 6.2 ボタン構成マトリクス

| リスクレベル | ボタン1（左） | ボタン2（中央） | ボタン3（右） |
| ------------ | ------------- | --------------- | ------------- |
| Critical     | 拒否する      | -               | -             |
| Critical(※1) | 拒否する      | 今回のみ許可    | -             |
| High         | 拒否する      | 今回のみ許可    | -             |
| Medium       | 拒否          | 今回のみ        | 許可する      |
| Low          | 拒否          | 今回のみ        | 許可する      |

※1: `autoDenyDefault === false` の場合

### 6.3 ボタン色定義

| ボタン       | 背景色                 | テキスト色            | 根拠                                    |
| ------------ | ---------------------- | --------------------- | --------------------------------------- |
| 拒否する     | `--status-destructive` | `#FFFFFF`             | 破壊的操作のフィードバック（Apple HIG） |
| 今回のみ許可 | `var(--bg-tertiary)`   | `var(--text-primary)` | 中立操作                                |
| 許可する     | `--status-info`        | `#FFFFFF`             | 肯定操作のフィードバック                |

---

## 7. 既存 PermissionDialog（57テスト、Line 100%）との差分一覧

### 7.1 変更対象

| #   | 変更対象                    | 変更種別 | 変更内容                                                                     | 既存テストへの影響                     |
| --- | --------------------------- | -------- | ---------------------------------------------------------------------------- | -------------------------------------- |
| 1   | ダイアログ幅                | 拡張     | 固定幅から `TOOL_RISK_CONFIG[riskLevel].dialogWidth` による動的幅に変更      | 幅アサーションの追加が必要             |
| 2   | ヘッダー背景色              | 拡張     | 固定色から `TOOL_RISK_CONFIG[riskLevel].headerColorToken` による動的色に変更 | 色アサーションの追加が必要             |
| 3   | ボタン構成                  | 拡張     | 固定3ボタンから `allowApproveOnce` / `allowPermanent` による条件表示に変更   | ボタン数アサーションの修正が必要       |
| 4   | 承認スコープセクション      | 拡張     | 常時表示から `riskLevel` による条件表示に変更                                | セクション表示アサーションの追加が必要 |
| 5   | backdrop                    | 拡張     | 標準オーバーレイから Critical 時の blur backdrop に変更                      | Critical 固有テストの追加が必要        |
| 6   | インライン表示モード（Low） | 新規     | フルモーダルに加えてインラインカード表示モードを追加                         | 新規テストの追加が必要                 |

### 7.2 非変更対象（既存仕様維持）

| #   | 維持対象                              | 理由                                                 |
| --- | ------------------------------------- | ---------------------------------------------------- |
| 1   | `PermissionResolver` 8ステップフロー  | Phase 2 設計方針: 既存契約を破壊しない               |
| 2   | `DEFAULT_TIMEOUT_MS`（300000ms）      | Phase 2 設計禁止事項: 変更禁止                       |
| 3   | `getDescription(toolName, args)` 関数 | 既存の説明文生成ロジックは維持し、追加テキストを付加 |
| 4   | 3ボタン構成の配色ルール               | Medium/Low では既存の3ボタンをそのまま維持           |

### 7.3 テスト影響範囲の見積もり

| テスト影響区分     | 既存テスト数 | 修正が必要なテスト数（推定）   | 追加が必要なテスト数（推定）  |
| ------------------ | ------------ | ------------------------------ | ----------------------------- |
| ボタン表示テスト   | 12           | 4（Critical/High の2ボタン化） | 8（各レベルのボタン構成確認） |
| ダイアログ幅テスト | 3            | 3（動的幅への変更）            | 4（各レベルの幅確認）         |
| ヘッダー色テスト   | 0            | 0                              | 4（各レベルの色確認）         |
| backdrop テスト    | 2            | 0                              | 2（Critical の blur 確認）    |
| インライン表示     | 0            | 0                              | 6（Low レベルの表示確認）     |

---

## 8. 検証可能性

### 8.1 TOOL_RISK_CONFIG の検証条件

| テスト ID | 検証内容                                    | 入力                            | 期待出力                                |
| --------- | ------------------------------------------- | ------------------------------- | --------------------------------------- |
| RD-01     | Critical は恒久許可を許容しない             | `TOOL_RISK_CONFIG.critical`     | `allowPermanent === false`              |
| RD-02     | Critical は一回許可をデフォルトで許容しない | `TOOL_RISK_CONFIG.critical`     | `allowApproveOnce === false`            |
| RD-03     | Critical は自動拒否がデフォルト             | `TOOL_RISK_CONFIG.critical`     | `autoDenyDefault === true`              |
| RD-04     | Critical のダイアログ幅は640px              | `TOOL_RISK_CONFIG.critical`     | `dialogWidth === 640`                   |
| RD-05     | High は恒久許可を許容しない                 | `TOOL_RISK_CONFIG.high`         | `allowPermanent === false`              |
| RD-06     | High は一回許可を許容する                   | `TOOL_RISK_CONFIG.high`         | `allowApproveOnce === true`             |
| RD-07     | Medium は恒久許可を許容する                 | `TOOL_RISK_CONFIG.medium`       | `allowPermanent === true`               |
| RD-08     | Low は恒久許可を許容する                    | `TOOL_RISK_CONFIG.low`          | `allowPermanent === true`               |
| RD-09     | 全4レベルの Record 網羅性                   | `Object.keys(TOOL_RISK_CONFIG)` | `["critical", "high", "medium", "low"]` |
| RD-10     | ヘッダー色トークンが CSS 変数名形式         | 全レベルの `headerColorToken`   | `--` プレフィックスで開始する文字列     |

### 8.2 ダイアログ表示の検証条件

| テスト ID | 検証内容                                                    | 期待結果                                        |
| --------- | ----------------------------------------------------------- | ----------------------------------------------- |
| RD-UI-01  | Critical + `autoDenyDefault === true` のボタン数            | ボタン1個（「拒否する」のみ）                   |
| RD-UI-02  | Critical + `autoDenyDefault === false` のボタン数           | ボタン2個（「拒否する」「今回のみ許可」）       |
| RD-UI-03  | High のボタン数                                             | ボタン2個（「拒否する」「今回のみ許可」）       |
| RD-UI-04  | Medium のボタン数                                           | ボタン3個（「拒否」「今回のみ」「許可する」）   |
| RD-UI-05  | Low のボタン数                                              | ボタン3個（「拒否」「今回のみ」「許可する」）   |
| RD-UI-06  | Critical で承認スコープセクションが非表示                   | 承認スコープのラジオボタンが DOM に存在しない   |
| RD-UI-07  | High で承認スコープが1択固定                                | 「今回のセッションのみ」のみ表示、checked 状態  |
| RD-UI-08  | Medium で承認スコープが2択                                  | 「今回のセッションのみ」「常に許可」の2つが表示 |
| RD-UI-09  | Critical の backdrop に `blur(8px)` が適用されている        | backdrop-filter CSS プロパティの検証            |
| RD-UI-10  | Low がインラインカードとして表示される                      | モーダルオーバーレイが DOM に存在しない         |
| RD-UI-11  | ヘッダー背景色が `headerColorToken` の CSS 変数値と一致する | `getComputedStyle` でバックグラウンド色を検証   |

### 8.3 境界値テスト

| テスト ID | 検証内容                                                            | 期待結果                                |
| --------- | ------------------------------------------------------------------- | --------------------------------------- |
| RD-BV-01  | `argsSnapshot` が200文字を超える場合のプレビュー表示                | 200文字で切り捨て + 「...」を末尾に付加 |
| RD-BV-02  | Low レベルで `argsSnapshot` が100文字を超える場合（インライン表示） | 100文字で切り捨て + 「...」を末尾に付加 |
| RD-BV-03  | `securityImpact` が空文字列の場合                                   | セキュリティ影響セクションを非表示      |
