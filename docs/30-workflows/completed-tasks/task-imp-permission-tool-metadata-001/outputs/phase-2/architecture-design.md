# Phase 2: アーキテクチャ設計書

## メタ情報

| 項目   | 内容                                  |
| ------ | ------------------------------------- |
| Phase  | 2                                     |
| 機能名 | task-imp-permission-tool-metadata-001 |
| Issue  | #606                                  |
| 作成日 | 2026-01-31                            |

---

## 1. toolMetadata.ts モジュール設計

### 1.1 型定義

```typescript
/** リスクレベル型 */
export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

/** ツールメタデータ型 */
export interface ToolMetadata {
  riskLevel: RiskLevel;
  securityImpact: string;
}
```

### 1.2 データ構造

```typescript
const TOOL_METADATA: Record<string, ToolMetadata> = {
  Bash: {
    riskLevel: "High",
    securityImpact: "システムコマンドを実行します。任意のコード実行が可能です",
  },
  Read: {
    riskLevel: "Low",
    securityImpact: "ファイルの内容を読み取ります",
  },
  Write: {
    riskLevel: "Medium",
    securityImpact: "ファイルに新しい内容を書き込みます",
  },
  Edit: {
    riskLevel: "Medium",
    securityImpact: "既存ファイルの内容を変更します",
  },
  Glob: {
    riskLevel: "Low",
    securityImpact: "ファイルパターンで検索します",
  },
  Grep: {
    riskLevel: "Low",
    securityImpact: "テキスト内容を検索します",
  },
  WebSearch: {
    riskLevel: "Low",
    securityImpact: "Web検索を実行します",
  },
  Task: {
    riskLevel: "Medium",
    securityImpact: "サブタスクを実行します",
  },
  NotebookEdit: {
    riskLevel: "Medium",
    securityImpact: "Jupyterノートブックを編集します",
  },
  WebFetch: {
    riskLevel: "Medium",
    securityImpact: "Webコンテンツを取得します",
  },
  Skill: {
    riskLevel: "Medium",
    securityImpact: "スキルを実行します",
  },
  AskUser: {
    riskLevel: "Low",
    securityImpact: "ユーザーに確認を行います",
  },
};
```

### 1.3 デフォルト値

```typescript
const DEFAULT_METADATA: ToolMetadata = {
  riskLevel: "Medium",
  securityImpact: "ツールを実行します",
};
```

### 1.4 公開API

```typescript
/** ツール名からリスクレベルを取得する */
export function getRiskLevel(toolName: string): RiskLevel;

/** ツール名からセキュリティ影響テキストを取得する */
export function getSecurityImpact(toolName: string): string;

/** ツール名からメタデータ全体を取得する */
export function getToolMetadata(toolName: string): ToolMetadata;
```

各関数はTOOL_METADATAからツール名で検索し、未定義の場合はDEFAULT_METADATAを返す。

---

## 2. RiskBadgeコンポーネント設計

### 2.1 インライン実装（PermissionDialog内）

RiskBadgeは独立コンポーネントではなく、PermissionDialog内のインライン要素として実装する。理由：

- 単一のダイアログでのみ使用される
- 過度な抽象化を避ける
- 既存のPermissionDialogのコーディングスタイルに合わせる（TOOL_ICONS等も同ファイル内定義）

### 2.2 Tailwind CSSクラスマッピング

```typescript
const RISK_LEVEL_STYLES: Record<
  RiskLevel,
  { bg: string; text: string; border: string }
> = {
  Low: {
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-200",
  },
  Medium: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    border: "border-yellow-200",
  },
  High: {
    bg: "bg-orange-100",
    text: "text-orange-800",
    border: "border-orange-200",
  },
  Critical: {
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-200",
  },
};
```

### 2.3 レンダリング構造

```html
<!-- リスクバッジ（ツールバッジの右横） -->
<span
  class="{styles.bg} {styles.text} {styles.border} border px-1.5 py-0.5 rounded text-xs font-medium"
  aria-label="リスクレベル: {riskLevel}"
>
  {riskLevel}
</span>
```

---

## 3. PermissionDialog統合設計

### 3.1 import追加

```typescript
import {
  getRiskLevel,
  getSecurityImpact,
  type RiskLevel,
} from "./toolMetadata";
```

### 3.2 レイアウト設計

```
[⚠️ 権限の確認                                    ✕]
[💻 Bash] [🟠 High]                                  ← RiskBadge追加位置
「ls -la」コマンドを実行します
システムコマンドを実行します。任意のコード実行が可能です ← セキュリティ影響テキスト追加位置
[詳細を表示 ▼]
─────────────────────────────────
□ このセッション中は同様の操作を自動許可する
[拒否] [1回許可] [許可]
```

### 3.3 変更箇所

1. **ツールバッジ横（183-191行付近）**: リスクバッジspan要素を追加
2. **人間可読説明文直下（194-199行付近）**: セキュリティ影響テキストp要素を追加

### 3.4 Progressive Disclosure整合性

| レベル              | 情報                            | 表示方式   |
| ------------------- | ------------------------------- | ---------- |
| Level 1（常時表示） | リスクバッジ                    | 常時表示   |
| Level 1（常時表示） | セキュリティ影響テキスト        | 常時表示   |
| Level 1（常時表示） | 人間可読説明文                  | 常時表示   |
| Level 2（展開表示） | 技術的引数詳細（JSON/コマンド） | 折りたたみ |

---

## 4. モジュール依存関係

```
PermissionDialog.tsx
├── permissionDescriptions.ts (既存)
└── toolMetadata.ts (新規追加)

toolMetadata.ts ← permissionDescriptions.ts 間に依存なし（独立）
```

---

## 完了条件チェック

- [x] toolMetadata.tsの型定義（RiskLevel, ToolMetadata）が設計されている
- [x] 公開API関数（getRiskLevel, getSecurityImpact, getToolMetadata）のシグネチャが定義されている
- [x] 12ツール全てのリスクレベルとセキュリティ影響テキストがマッピングされている
- [x] デフォルト値戦略（未定義ツール→Medium）が設計されている
- [x] RiskBadgeの表示方式（インライン要素）が定義されている
- [x] リスクレベル別のTailwind CSSクラスマッピングが設計されている
- [x] PermissionDialog内のRiskBadge配置位置が確定している
- [x] Progressive Disclosureパターンとの整合性が確認されている
