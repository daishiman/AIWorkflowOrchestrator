# Phase 5: 実装（TDD Green）

## メタ情報

| 項目           | 内容                                                                                                                                                                                |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase          | 5                                                                                                                                                                                   |
| Phase名        | 実装                                                                                                                                                                                |
| カテゴリ       | TDD-Green                                                                                                                                                                           |
| 機能名         | task-imp-permission-tool-metadata-001                                                                                                                                               |
| Issue          | #606                                                                                                                                                                                |
| 前提Phase      | Phase 4（テスト作成）                                                                                                                                                               |
| 次Phase        | Phase 6（テスト拡充）                                                                                                                                                               |
| テストコマンド | `pnpm vitest run apps/desktop/src/renderer/components/skill/__tests__/toolMetadata.test.ts apps/desktop/src/renderer/components/skill/__tests__/PermissionDialog.metadata.test.tsx` |

---

## 目的

Phase 4で作成したTDD Redテストを全てPASS（Green）にするための最小実装を行う。toolMetadata.tsモジュールの新規作成と、PermissionDialog.tsxへのRiskBadge統合を実施する。

---

## 実行タスク

### Task 1: toolMetadata.ts実装

**目的**: ツールリスクレベル・セキュリティ影響テキストの定義モジュールを実装する。

**手順**:

1. ファイルを作成する: `apps/desktop/src/renderer/components/skill/toolMetadata.ts`

2. RiskLevel型を定義する：

   ```typescript
   export type RiskLevel = "Low" | "Medium" | "High" | "Critical";
   ```

3. ToolMetadata型を定義する：

   ```typescript
   export interface ToolMetadata {
     riskLevel: RiskLevel;
     securityImpact: string;
   }
   ```

4. TOOL_METADATAマッピングを定義する（Phase 1で確定した12ツール分）：
   - Bash: { riskLevel: 'High', securityImpact: 'システムコマンドを実行します。任意のコード実行が可能です' }
   - Read: { riskLevel: 'Low', securityImpact: 'ファイルの内容を読み取ります' }
   - Write: { riskLevel: 'Medium', securityImpact: 'ファイルに新しい内容を書き込みます' }
   - Edit: { riskLevel: 'Medium', securityImpact: '既存ファイルの内容を変更します' }
   - Glob: { riskLevel: 'Low', securityImpact: 'ファイルパターンで検索します' }
   - Grep: { riskLevel: 'Low', securityImpact: 'テキスト内容を検索します' }
   - WebSearch: { riskLevel: 'Low', securityImpact: 'Web検索を実行します' }
   - Task: { riskLevel: 'Medium', securityImpact: 'サブタスクを実行します' }
   - NotebookEdit: { riskLevel: 'Medium', securityImpact: 'Jupyterノートブックを編集します' }
   - WebFetch: { riskLevel: 'Medium', securityImpact: 'Webコンテンツを取得します' }
   - Skill: { riskLevel: 'Medium', securityImpact: 'スキルを実行します' }
   - AskUser: { riskLevel: 'Low', securityImpact: 'ユーザーに確認を行います' }

5. デフォルトメタデータを定義する：

   ```typescript
   const DEFAULT_METADATA: ToolMetadata = {
     riskLevel: "Medium",
     securityImpact: "ツールを実行します",
   };
   ```

6. 公開API関数を実装する：

   ```typescript
   export function getRiskLevel(toolName: string): RiskLevel;
   export function getSecurityImpact(toolName: string): string;
   export function getToolMetadata(toolName: string): ToolMetadata;
   ```

7. テストを実行し、toolMetadata.test.tsの全テストがPASS（Green）することを確認する

**期待される成果物**: `toolMetadata.ts`（全テストPASS状態）

### Task 2: PermissionDialog.tsxへのRiskBadge統合

**目的**: PermissionDialogにリスクバッジとセキュリティ影響テキストを追加する。

**手順**:

1. `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx`を修正する

2. toolMetadata.tsからimportを追加する：

   ```typescript
   import { getRiskLevel, getSecurityImpact } from "./toolMetadata";
   ```

3. リスクレベル別のスタイルマッピングを定義する：

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

4. RiskBadge表示要素をツールバッジの右横に追加する：
   - `<span>`要素でリスクレベルテキストを表示
   - aria-label属性に`リスクレベル: {riskLevel}`を設定
   - Tailwind CSSクラスでリスクレベル別の色を適用

5. セキュリティ影響テキストを人間可読説明文の直下に追加する：
   - `<p>`要素でセキュリティ影響テキストを表示
   - テキスト色はグレー系（text-gray-500）で既存テキストと差別化

6. テストを実行し、PermissionDialog.metadata.test.tsxの全テストがPASS（Green）することを確認する

7. 既存テスト（PermissionDialog.test.tsx, PermissionDialog.readable.test.tsx）が引き続きPASSすることを確認する

**期待される成果物**: `PermissionDialog.tsx`修正版（全テストPASS状態）

### Task 3: 全体整合性検証

**目的**: 実装完了後に全テストがPASSし、TypeScript型チェックが通ることを確認する。

**手順**:

1. 全テストを実行する：

   ```bash
   pnpm vitest run apps/desktop/src/renderer/components/skill/__tests__/
   ```

2. TypeScript型チェックを実行する：

   ```bash
   pnpm --filter @repo/desktop exec tsc --noEmit
   ```

3. 失敗するテストがある場合は実装を修正する（テストは変更しない）

**期待される成果物**: 全テストPASS確認結果

---

## Renderer Process層の実装配置

| ファイル               | 層       | 操作 | 説明                                        |
| ---------------------- | -------- | ---- | ------------------------------------------- |
| `toolMetadata.ts`      | Renderer | 新規 | リスクレベル・セキュリティ影響定義          |
| `PermissionDialog.tsx` | Renderer | 修正 | RiskBadge統合、セキュリティ影響テキスト追加 |

---

## 参照資料

| 資料名                           | パス                                                                                      |
| -------------------------------- | ----------------------------------------------------------------------------------------- |
| Phase 2設計書                    | `outputs/phase-2/architecture-design.md`                                                  |
| Phase 2 UIデザイン仕様           | `outputs/phase-2/ui-design-specification.md`                                              |
| Phase 4テスト仕様書              | `outputs/phase-4/test-specification.md`                                                   |
| toolMetadataテスト               | `apps/desktop/src/renderer/components/skill/__tests__/toolMetadata.test.ts`               |
| PermissionDialogメタデータテスト | `apps/desktop/src/renderer/components/skill/__tests__/PermissionDialog.metadata.test.tsx` |
| 既存PermissionDialog             | `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx`                         |
| 既存permissionDescriptions       | `apps/desktop/src/renderer/components/skill/permissionDescriptions.ts`                    |

---

## 統合テスト連携アクション

- toolMetadata.tsとPermissionDialog.tsxの統合が正しく動作することをコンポーネントテストで確認する
- 既存テストスイート全体が回帰なくPASSすることを確認する

---

## 成果物

| 成果物名               | パス                                                              | 種別     |
| ---------------------- | ----------------------------------------------------------------- | -------- |
| toolMetadataモジュール | `apps/desktop/src/renderer/components/skill/toolMetadata.ts`      | code     |
| PermissionDialog修正   | `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx` | code     |
| 実装サマリー           | `outputs/phase-5/implementation-summary.md`                       | document |

---

## 完了条件

- [ ] toolMetadata.tsが作成され、12ツール全てのリスクレベルとセキュリティ影響テキストが定義されている
- [ ] getRiskLevel, getSecurityImpact, getToolMetadata関数がエクスポートされている
- [ ] 未定義ツールに対するデフォルト値（Medium）が実装されている
- [ ] PermissionDialog.tsxにRiskBadgeが統合されている
- [ ] リスクレベル別の色分け（Low=緑, Medium=黄, High=橙, Critical=赤）が実装されている
- [ ] セキュリティ影響テキストが表示されている
- [ ] aria-label属性が設定されスクリーンリーダー対応している
- [ ] toolMetadata.test.tsの全テストがPASSしている
- [ ] PermissionDialog.metadata.test.tsxの全テストがPASSしている
- [ ] 既存テスト（PermissionDialog.test.tsx, PermissionDialog.readable.test.tsx, permissionDescriptions.test.ts）が全てPASSしている
- [ ] TypeScript strict modeで型エラーがない

---

## 次Phase

Phase 6（テスト拡充）: カバレッジ目標（Lines 95%以上）達成に向けたテスト追加を行う。
