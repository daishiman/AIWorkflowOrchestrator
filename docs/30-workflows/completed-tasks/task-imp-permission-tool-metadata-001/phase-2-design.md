# Phase 2: 設計

## メタ情報

| 項目      | 内容                                                 |
| --------- | ---------------------------------------------------- |
| Phase     | 2                                                    |
| Phase名   | 設計                                                 |
| カテゴリ  | 設計                                                 |
| 機能名    | task-imp-permission-tool-metadata-001                |
| Issue     | #606                                                 |
| 前提Phase | Phase 1（要件定義）                                  |
| 次Phase   | Phase 3（設計レビューゲート）                        |
| 関連仕様  | ui-ux-agent-execution.md, ui-ux-design-principles.md |

---

## 目的

Phase 1で確定した要件に基づき、`toolMetadata.ts`モジュールの型定義・データ構造と、`RiskBadge`コンポーネントのUIデザインを設計する。既存のPermissionDialogアーキテクチャを尊重し、Progressive Disclosureパターンに従ったリスク情報表示の設計を行う。

---

## 背景

既存のPermissionDialogは`permissionDescriptions.ts`でツール説明文を管理し、ツールアイコンマッピングをコンポーネント内で定義している。新規の`toolMetadata.ts`はこの既存パターンに倣い、リスクレベルとセキュリティ影響テキストを別モジュールとして管理する。

---

## 実行タスク

### Task 1: toolMetadata.tsモジュール設計

**目的**: ツールリスクレベルとセキュリティ影響テキストのデータ構造・公開APIを設計する。

**手順**:

1. リスクレベル型を定義する：

   ```typescript
   type RiskLevel = "Low" | "Medium" | "High" | "Critical";
   ```

2. ツールメタデータ型を定義する：

   ```typescript
   interface ToolMetadata {
     riskLevel: RiskLevel;
     securityImpact: string;
   }
   ```

3. ツール名→メタデータのマッピングを設計する：

   ```typescript
   const TOOL_METADATA: Record<string, ToolMetadata> = {
     Bash: {
       riskLevel: "High",
       securityImpact:
         "システムコマンドを実行します。任意のコード実行が可能です",
     },
     Read: { riskLevel: "Low", securityImpact: "ファイルの内容を読み取ります" },
     // ... 全12ツール
   };
   ```

4. 公開API関数を設計する：

   ```typescript
   export function getRiskLevel(toolName: string): RiskLevel;
   export function getSecurityImpact(toolName: string): string;
   export function getToolMetadata(toolName: string): ToolMetadata;
   ```

5. デフォルト値戦略を設計する：未定義ツールに対して`{ riskLevel: 'Medium', securityImpact: 'ツールを実行します' }`を返す

**期待される成果物**: toolMetadata.tsモジュール設計書

### Task 2: RiskBadgeコンポーネント設計

**目的**: リスクレベルバッジのUIコンポーネントを設計する。

**手順**:

1. リスクレベル別のTailwind CSSクラスマッピングを設計する：

   | RiskLevel | 背景色クラス    | テキスト色クラス  | ボーダー色クラス    |
   | --------- | --------------- | ----------------- | ------------------- |
   | Low       | `bg-green-100`  | `text-green-800`  | `border-green-200`  |
   | Medium    | `bg-yellow-100` | `text-yellow-800` | `border-yellow-200` |
   | High      | `bg-orange-100` | `text-orange-800` | `border-orange-200` |
   | Critical  | `bg-red-100`    | `text-red-800`    | `border-red-200`    |

2. コンポーネントインターフェースを設計する：

   ```typescript
   interface RiskBadgeProps {
     riskLevel: RiskLevel;
     securityImpact: string;
   }
   ```

3. レンダリング構造を設計する：
   - バッジ本体: `<span>`要素にリスクレベルテキスト（例: "High"）
   - セキュリティ影響テキスト: バッジ直下に1行テキストで表示
   - aria-label: `リスクレベル: {riskLevel}` を設定しスクリーンリーダー対応

4. PermissionDialog内での配置位置を設計する：
   - ツールアイコン・ツール名バッジの右横にリスクバッジを配置
   - セキュリティ影響テキストは人間可読説明文（getDescription）の直下に配置

**期待される成果物**: RiskBadgeコンポーネント設計書

### Task 3: PermissionDialog統合設計

**目的**: 既存のPermissionDialogにRiskBadgeをどのように統合するかを設計する。

**手順**:

1. 既存PermissionDialog.tsxのコンポーネント構造を分析する：
   - ヘッダー部: アイコン + タイトル + ツールバッジ（ここにRiskBadgeを追加）
   - 本文部: 人間可読説明文（ここにセキュリティ影響テキストを追加）

2. import構造を設計する：

   ```typescript
   import { getRiskLevel, getSecurityImpact } from "./toolMetadata";
   ```

3. RiskBadge表示のレイアウトを設計する：

   ```
   [⚠️ 権限の確認                                    ✕]
   [💻 Bash] [🟠 High]                                  ← RiskBadge追加位置
   「ls -la」コマンドを実行します
   システムコマンドを実行します。任意のコード実行が可能です ← セキュリティ影響テキスト追加位置
   [詳細を表示 ▼]
   ─────────────────────────────────
   □ 次回から自動的に許可する
   [拒否] [1回許可] [許可]
   ```

4. Progressive Disclosureとの整合性を確認する：
   - リスクバッジは常時表示（Level 1: 最も重要な情報）
   - セキュリティ影響テキストは常時表示（Level 1）
   - 技術的な引数詳細は折りたたみ表示（Level 2: 既存仕様通り）

**期待される成果物**: PermissionDialog統合設計書

### Task 4: WCAG 2.1 AA準拠の配色検証

**目的**: リスクバッジの配色がWCAG 2.1 AAのコントラスト比要件を満たすことを検証する。

**手順**:

1. 各リスクレベルの背景色とテキスト色の組み合わせでコントラスト比を計算する：

   | RiskLevel | 背景色     | テキスト色 | コントラスト比（目標: 4.5:1以上） |
   | --------- | ---------- | ---------- | --------------------------------- |
   | Low       | green-100  | green-800  | （計算結果を記載）                |
   | Medium    | yellow-100 | yellow-800 | （計算結果を記載）                |
   | High      | orange-100 | orange-800 | （計算結果を記載）                |
   | Critical  | red-100    | red-800    | （計算結果を記載）                |

2. 4.5:1を下回る組み合わせがある場合は代替色を提案する
3. 色覚多様性対応として、色以外の識別手段（テキスト表示）が機能することを確認する

**期待される成果物**: 配色検証結果

---

## Renderer Process層の設計観点

本タスクはフロントエンド（Renderer Process）のみに影響する。

| 層                 | 影響有無 | 設計内容                                          |
| ------------------ | -------- | ------------------------------------------------- |
| Renderer           | あり     | toolMetadata.ts新規作成、PermissionDialog.tsx修正 |
| Main Process       | なし     | 変更なし                                          |
| IPC通信            | なし     | 変更なし（リスクデータはRenderer側で静的定義）    |
| Preload            | なし     | 変更なし                                          |
| ローカルストレージ | なし     | 変更なし                                          |

---

## 参照資料

| 資料名                     | パス                                                                            |
| -------------------------- | ------------------------------------------------------------------------------- |
| Phase 1成果物              | `outputs/phase-1/requirements-definition.md`                                    |
| Phase 1スコープ定義        | `outputs/phase-1/scope-definition.md`                                           |
| PermissionDialog UI仕様    | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`    |
| デザイン原則               | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`  |
| セキュリティ仕様           | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md` |
| 既存PermissionDialog実装   | `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx`               |
| 既存permissionDescriptions | `apps/desktop/src/renderer/components/skill/permissionDescriptions.ts`          |

---

## 統合テスト連携アクション

- toolMetadata.tsの公開API設計に対するテスタビリティを確認する
- PermissionDialogコンポーネントテストの戦略（React Testing Library）を確認する

---

## 成果物

| 成果物名             | パス                                         | 種別     |
| -------------------- | -------------------------------------------- | -------- |
| アーキテクチャ設計書 | `outputs/phase-2/architecture-design.md`     | document |
| UIデザイン仕様書     | `outputs/phase-2/ui-design-specification.md` | document |

---

## 完了条件

- [ ] toolMetadata.tsの型定義（RiskLevel, ToolMetadata）が設計されている
- [ ] 公開API関数（getRiskLevel, getSecurityImpact, getToolMetadata）のシグネチャが定義されている
- [ ] 12ツール全てのリスクレベルとセキュリティ影響テキストがマッピングされている
- [ ] デフォルト値戦略（未定義ツール→Medium）が設計されている
- [ ] RiskBadgeコンポーネントのインターフェースが定義されている
- [ ] リスクレベル別のTailwind CSSクラスマッピングが設計されている
- [ ] PermissionDialog内のRiskBadge配置位置が確定している
- [ ] WCAG 2.1 AAコントラスト比の検証計画が作成されている
- [ ] Progressive Disclosureパターンとの整合性が確認されている

---

## 次Phase

Phase 3（設計レビューゲート）: 本Phaseの設計を要件との整合性・技術的妥当性・セキュリティ・アクセシビリティの観点でレビューする。
