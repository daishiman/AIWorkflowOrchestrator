# 実装ガイド: TOOL_RISK_CONFIG 定数

## メタ情報

| 項目         | 内容                                        |
| ------------ | ------------------------------------------- |
| 対象タスク   | TASK-UT-06-001-TOOL-RISK-CONFIG-SPEC        |
| 実装ファイル | `packages/shared/src/constants/security.ts` |
| 作成日       | 2026-03-16                                  |
| 後続タスク   | UT-06-004（PermissionDialog UI実装）        |

---

## Part 1: 中学生でもわかる概念説明

### ツールの「危険度ランク」って何？

AIがコンピューターを操作するとき、いろいろな「道具（ツール）」を使います。
たとえばファイルを読んだり、プログラムを実行したりします。

でも、道具によって「間違えたときのダメージの大きさ」が全然違います。
**これを映画の年齢制限に例えると、わかりやすくなります。**

---

### 映画の年齢制限で考えてみよう

映画館では、内容の過激さに応じて「G指定」「PG-13指定」「R指定」という区分けがあります。
ツールの危険度も、同じように3段階に分かれています。

---

### G指定（低リスク）: 読み取り専用ツール

**対象ツール**: Glob, Grep, Read

映画のG指定は「全年齢OK」。どんな人でも安心して見られます。
これと同じように、**ファイルを「読む」だけのツールは安全**です。

- ファイルを読むだけなので、何も壊れません
- 間違えても「何も起きなかった」だけです
- だから**すべての許可オプションが使えます**
  - 「次回から永遠に許可」: OK
  - 「24時間だけ許可」: OK
  - 「7日間だけ許可」: OK

ダイアログの幅: **400px**（小さめ。緊張感なし）

---

### PG-13指定（中リスク）: ファイル書き込みツール

**対象ツール**: Write, Edit

映画のPG-13は「13歳未満は保護者同伴推奨」。ちょっと注意が必要です。
これと同じように、**ファイルを「書き換える」ツールは少し注意が必要**です。

- ファイルの中身を変えたり、新しいファイルを作ったりします
- 間違えると「大事なファイルを上書きした」ということが起きる可能性があります
- でも、ほとんどの場合は元に戻せます（Gitがあれば）
- だから**すべての許可オプションがまだ使えます**
  - 「次回から永遠に許可」: OK
  - 「24時間だけ許可」: OK
  - 「7日間だけ許可」: OK

ダイアログの幅: **480px**（少し大きめ。「ちょっと待って」感を演出）

---

### R指定（高リスク）: システム操作ツール

**対象ツール**: Bash, 外部コマンド実行

映画のR指定は「17歳未満は保護者同伴必須」。かなり慎重に扱います。
これと同じように、**コマンドを「実行する」ツールは危険**です。

- ファイルを削除したり、外部サービスに接続したり、システム設定を変えたりできます
- 間違えると「取り返しのつかない被害」になることがあります
  - 例: 重要なデータを全部消してしまう、外部に情報が漏れる
- だから**長期間の許可は一切禁止**です
  - 「次回から永遠に許可」: **禁止**
  - 「24時間だけ許可」: **禁止**
  - 「7日間だけ許可」: **禁止**
  - ※毎回、その場で確認が必要です

ダイアログの幅: **640px**（大きめ。「本当に大丈夫？」と視覚的に圧力をかける）

---

### ダイアログの大きさが「危険のサイン」

危険度が上がるほど、確認ダイアログが大きくなります。

```
low（低リスク）:   ←400px→   小さい = 気軽に確認
medium（中リスク）:←480px→   中くらい = ちょっと注意
high（高リスク）): ←640px→   大きい = 真剣に考えて！
```

人間は大きなものを見ると「重要なのかな」と感じます。
この「視覚的なプレッシャー」を使って、危険な操作には自然と慎重になるよう設計されています。

---

## Part 2: 開発者向け技術詳細

### 配置ファイル

```
packages/shared/src/constants/security.ts
```

### 型定義

#### `RiskLevel` 型

```typescript
export type RiskLevel = "low" | "medium" | "high";
```

危険度を表すユニオン型。3値のみ取りうる。

#### `ToolRiskConfigEntry` インターフェース

```typescript
export interface ToolRiskConfigEntry {
  /** 確認ダイアログの横幅（px） */
  dialogWidth: number;
  /** ダイアログヘッダーに適用するCSSカスタムプロパティ名 */
  headerColorToken: string;
  /** 「次回から永遠に許可」オプションの有効/無効 */
  allowPermanent: boolean;
  /** 「24時間だけ許可」オプションの有効/無効 */
  allowTime24h: boolean;
  /** 「7日間だけ許可」オプションの有効/無効 */
  allowTime7d: boolean;
}
```

5フィールドの詳細:

| フィールド名       | 型        | 説明                                                          |
| ------------------ | --------- | ------------------------------------------------------------- |
| `dialogWidth`      | `number`  | PermissionDialog の横幅（px）。危険度が高いほど大きい         |
| `headerColorToken` | `string`  | ヘッダー背景色のCSSカスタムプロパティ名（例: `"--risk-low"`） |
| `allowPermanent`   | `boolean` | 「永遠に許可」選択肢を表示するか                              |
| `allowTime24h`     | `boolean` | 「24時間許可」選択肢を表示するか                              |
| `allowTime7d`      | `boolean` | 「7日間許可」選択肢を表示するか                               |

#### `TOOL_RISK_CONFIG` 定数

```typescript
export const TOOL_RISK_CONFIG: Record<RiskLevel, ToolRiskConfigEntry> = {
  low: {
    dialogWidth: 400,
    headerColorToken: "--risk-low",
    allowPermanent: true,
    allowTime24h: true,
    allowTime7d: true,
  },
  medium: {
    dialogWidth: 480,
    headerColorToken: "--risk-medium",
    allowPermanent: true,
    allowTime24h: true,
    allowTime7d: true,
  },
  high: {
    dialogWidth: 640,
    headerColorToken: "--risk-high",
    allowPermanent: false,
    allowTime24h: false,
    allowTime7d: false,
  },
} as const;
```

全3エントリの値一覧:

| フィールド         | `low`          | `medium`          | `high`          |
| ------------------ | -------------- | ----------------- | --------------- |
| `dialogWidth`      | `400`          | `480`             | `640`           |
| `headerColorToken` | `"--risk-low"` | `"--risk-medium"` | `"--risk-high"` |
| `allowPermanent`   | `true`         | `true`            | `false`         |
| `allowTime24h`     | `true`         | `true`            | `false`         |
| `allowTime7d`      | `true`         | `true`            | `false`         |

### エクスポートパス

`constants/index.ts` 経由で `@repo/shared` からnamed exportされる。

```typescript
// packages/shared/src/constants/index.ts
export {
  TOOL_RISK_CONFIG,
  type RiskLevel,
  type ToolRiskConfigEntry,
} from "./security";
```

インポート方法:

```typescript
import { TOOL_RISK_CONFIG, type RiskLevel } from "@repo/shared/constants";
```

または:

```typescript
import { TOOL_RISK_CONFIG, type RiskLevel } from "@repo/shared";
```

### セキュリティ不変条件

以下の3条件は**絶対に変更してはならない**。

```typescript
TOOL_RISK_CONFIG.high.allowPermanent === false; // 必須
TOOL_RISK_CONFIG.high.allowTime24h === false; // 必須
TOOL_RISK_CONFIG.high.allowTime7d === false; // 必須
```

これらが `true` になると、Bash等の危険なコマンドに対して長期的な許可が与えられ、
ユーザーが気付かないうちに悪意あるコマンドが実行される可能性がある。

**テストでこの不変条件を必ず検証すること**（`TASK-UT-06-001` にてテスト実装済み）。

### `Record<RiskLevel, ToolRiskConfigEntry>` を使う理由

```typescript
// NG: ユニオン型の網羅チェックが効かない
const config: { [key: string]: ToolRiskConfigEntry } = { ... };

// OK: RiskLevel の全値を網羅しないとコンパイルエラーになる
const config: Record<RiskLevel, ToolRiskConfigEntry> = { ... };
```

`Record<K, V>` 型を使うことで、`RiskLevel` に新しい値（例: `"critical"`）が追加されたとき、
`TOOL_RISK_CONFIG` の更新漏れをコンパイル時に検出できる。

### 後続タスクとの連携

UT-06-004（PermissionDialog UI実装）では、本定数を以下のように使用する想定:

```typescript
import { TOOL_RISK_CONFIG, type RiskLevel } from "@repo/shared/constants";

function PermissionDialog({ riskLevel }: { riskLevel: RiskLevel }) {
  const config = TOOL_RISK_CONFIG[riskLevel];

  return (
    <dialog style={{ width: config.dialogWidth }}>
      <header style={{ background: `var(${config.headerColorToken})` }}>
        ...
      </header>
      {config.allowPermanent && (
        <option value="permanent">次回から永遠に許可</option>
      )}
      {config.allowTime24h && (
        <option value="24h">24時間だけ許可</option>
      )}
      {config.allowTime7d && (
        <option value="7d">7日間だけ許可</option>
      )}
    </dialog>
  );
}
```

`TOOL_RISK_CONFIG[riskLevel]` で対応するエントリを取得し、
`allowPermanent` / `allowTime24h` / `allowTime7d` フラグで選択肢の表示を制御する。
