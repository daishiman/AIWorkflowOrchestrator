# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 2                               |
| Phase名    | 設計                            |
| タスクID   | UT-06-001                       |
| 前提Phase  | Phase 1                         |
| 後続Phase  | Phase 3                         |
| ステータス | 未実施                          |
| 作成日     | 2026-03-16                      |
| 機能名     | tool-risk-config-implementation |

---

## 目的

Phase 1 で確定した要件に基づき、`RiskLevel` 型・`ToolRiskConfigEntry` interface・`TOOL_RISK_CONFIG` 定数の TypeScript 設計を完成させる。既存の `security.ts`（323行）への追加位置、JSDoc コメント設計、エクスポート構成を決定する。

## 背景

既存の `security.ts` は危険パターン定義（`DANGEROUS_PATTERNS`）、ホワイトリスト（`ALLOWED_TOOLS_WHITELIST`）、ユーティリティ関数（`isDangerousCommand`・`matchGlobPattern`・`isProtectedPath`・`validateAllowedTools`・`filterAllowedTools`）で構成されている。新たに追加する `TOOL_RISK_CONFIG` はこれらと同じファイルに配置するが、セクション分離と JSDoc による自己文書化を設計する。

---

## 実行タスク

### タスク1: 型定義の設計

**目的**: `RiskLevel` 型と `ToolRiskConfigEntry` interface の TypeScript 型定義を設計する。

**実行手順**:

1. `RiskLevel` 型を設計する:

   ```typescript
   /** ツール操作のリスクレベル分類 */
   export type RiskLevel = "low" | "medium" | "high";
   ```

2. `ToolRiskConfigEntry` interface を設計する:

   ```typescript
   /**
    * リスクレベルごとのダイアログ・権限設定エントリ
    */
   export interface ToolRiskConfigEntry {
     /** PermissionDialog の表示幅（px） */
     dialogWidth: 400 | 480 | 640;
     /** ダイアログヘッダーの色トークン（CSS変数名） */
     headerColorToken: string;
     /** 「常に許可」ボタンの表示可否 */
     allowPermanent: boolean;
     /** 「24時間許可」ボタンの表示可否 */
     allowTime24h: boolean;
     /** 「7日間許可」ボタンの表示可否 */
     allowTime7d: boolean;
   }
   ```

3. Phase 4 デシジョンテーブルの失効ポリシーマトリクスとの整合性を確認する

**期待される成果物**:

- `outputs/phase-2/type-design.md`（型定義設計書）

---

### タスク2: 定数値の設計と配置計画

**目的**: `TOOL_RISK_CONFIG` 定数の具体値と `security.ts` 内の配置位置を決定する。

**実行手順**:

1. `TOOL_RISK_CONFIG` 定数を設計する:

   ```typescript
   /**
    * リスクレベル別の動作設定マップ
    *
    * @remarks
    * - high: 恒久許可・時間制限許可を禁止（セキュリティ不変条件）
    * - medium/low: 全許可オプションを提供
    * - dialogWidth: リスクが高いほど大きいダイアログで注意喚起
    * - headerColorToken: CSS変数でリスクレベルに応じた色を指定
    *
    * @see Phase 4 デシジョンテーブル（decision-table-risk-permission.md）
    */
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
   };
   ```

2. `security.ts` 内の配置位置を決定する:
   - 既存の `ALLOWED_TOOLS_WHITELIST` 定数の直後（L117直後）に配置
   - セクションコメントで区切る: `// ─── Tool Risk Configuration ───`

3. エクスポート構成:
   - `RiskLevel` 型: named export
   - `ToolRiskConfigEntry` interface: named export
   - `TOOL_RISK_CONFIG` 定数: named export
   - `packages/shared/src/constants/index.ts` からの re-export が必要か確認

**期待される成果物**:

- `outputs/phase-2/implementation-design.md`（実装設計書）

---

### タスク3: テスト設計

**目的**: `security.test.ts` のテストケース構成を設計する。

**実行手順**:

1. テストケースを設計する:

   | テストカテゴリ       | テストケース                                        | 検証内容               |
   | -------------------- | --------------------------------------------------- | ---------------------- |
   | 型検証               | TOOL_RISK_CONFIG が Record<RiskLevel, ...> 型である | 3つのキーが存在する    |
   | 値検証（low）        | low の dialogWidth が 400 である                    | 確定値の検証           |
   | 値検証（medium）     | medium の dialogWidth が 480 である                 | 確定値の検証           |
   | 値検証（high）       | high の dialogWidth が 640 である                   | 確定値の検証           |
   | セキュリティ不変条件 | high.allowPermanent === false                       | セキュリティ制約の検証 |
   | セキュリティ不変条件 | high.allowTime24h === false                         | セキュリティ制約の検証 |
   | セキュリティ不変条件 | high.allowTime7d === false                          | セキュリティ制約の検証 |
   | CSS変数形式          | headerColorToken が `--risk-` プレフィックスを持つ  | フォーマットの検証     |
   | 完全性               | 全 RiskLevel キーが TOOL_RISK_CONFIG に存在する     | キーの網羅性検証       |
   | JSDoc                | 各フィールドに JSDoc コメントが存在する             | ドキュメント品質検証   |

2. テストファイルの配置: `packages/shared/src/constants/security.test.ts`

3. テストフレームワーク: Vitest（プロジェクト標準）

**期待される成果物**:

- `outputs/phase-2/test-design.md`（テスト設計書）

---

## 参照資料

| 参照資料                   | パス                                                                                                                                  | 内容                                  |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Phase 1 確定要件           | `outputs/phase-1/requirements-spec.md`                                                                                                | 確定した要件仕様                      |
| Phase 5 プロトタイプ       | `docs/30-workflows/completed-tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-5/security.ts`                       | 型定義・定数のプロトタイプ            |
| Phase 4 デシジョンテーブル | `docs/30-workflows/completed-tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-4/decision-table-risk-permission.md` | リスクレベル×権限の意思決定マトリクス |
| 現行 security.ts           | `packages/shared/src/constants/security.ts`                                                                                           | 既存のセキュリティ定数（323行）       |

### システム仕様（aiworkflow-requirements）

> 実装前に以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                            | 内容                                                                 |
| ---------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| セキュリティ原則       | `.claude/skills/aiworkflow-requirements/references/security-principles.md`      | セキュリティ設計原則（最小権限・フェイルセキュア）                   |
| スキル実行セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md` | security.ts の既存エクスポート一覧・ToolRiskLevel(4段階)との差分確認 |
| インターフェース定義   | `.claude/skills/aiworkflow-requirements/references/interfaces-core.md`          | 共有型定義の設計方針（`packages/shared` への配置パターン）           |

---

## 実行手順

### ステップ1: 型定義設計

1. `RiskLevel` 型を JSDoc 付きで設計する
2. `ToolRiskConfigEntry` interface の全5フィールドを JSDoc 付きで設計する
3. Phase 4 デシジョンテーブルとの整合性を確認する
4. 成果物: `outputs/phase-2/type-design.md`

### ステップ2: 定数値設計と配置計画

1. `TOOL_RISK_CONFIG` 定数の全3エントリの具体値を設計する
2. `security.ts` 内の配置位置を決定する
3. エクスポート構成（named export + re-export 要否）を決定する
4. 成果物: `outputs/phase-2/implementation-design.md`

### ステップ3: テスト設計

1. テストケース9件以上を表形式で設計する
2. テストファイルの配置パスを決定する
3. 成果物: `outputs/phase-2/test-design.md`

---

## 設計対象のトポロジ（concern 別配置先）

| concern                  | 配置先ファイル                                   | 変更種別  |
| ------------------------ | ------------------------------------------------ | --------- |
| 型定義（RiskLevel）      | `packages/shared/src/constants/security.ts`      | 追加      |
| 型定義（ConfigEntry）    | `packages/shared/src/constants/security.ts`      | 追加      |
| 定数（TOOL_RISK_CONFIG） | `packages/shared/src/constants/security.ts`      | 追加      |
| re-export                | `packages/shared/src/constants/index.ts`         | 確認/追加 |
| テスト                   | `packages/shared/src/constants/security.test.ts` | 新規      |

## バリデーションマトリクス

| 検証コマンド                                                       | 期待結果         | 検証タイミング |
| ------------------------------------------------------------------ | ---------------- | -------------- |
| `pnpm --filter @repo/shared build`                                 | エラー 0 件      | Phase 5 後     |
| `pnpm --filter @repo/shared exec vitest run security`              | 全テスト PASS    | Phase 5 後     |
| `pnpm --filter @repo/shared exec tsc --noEmit`                     | 型エラー 0 件    | Phase 9        |
| `pnpm --filter @repo/shared exec eslint src/constants/security.ts` | Lint エラー 0 件 | Phase 9        |

---

## 統合テスト連携

- `TOOL_RISK_CONFIG` の型定義が `@repo/shared` パッケージのエクスポートに含まれることを設計段階で確認
- `packages/shared/src/constants/index.ts` の re-export パターンを確認し、必要であれば追加設計を含める

---

## 成果物

| 成果物       | パス                                       | 内容                                    |
| ------------ | ------------------------------------------ | --------------------------------------- |
| 型定義設計書 | `outputs/phase-2/type-design.md`           | RiskLevel, ToolRiskConfigEntry の型設計 |
| 実装設計書   | `outputs/phase-2/implementation-design.md` | 定数値、配置位置、エクスポート構成      |
| テスト設計書 | `outputs/phase-2/test-design.md`           | テストケース一覧とカバレッジ計画        |

---

## 完了条件

- [ ] `RiskLevel` 型の定義が TypeScript コード例として記載されている
- [ ] `ToolRiskConfigEntry` interface の全5フィールドに JSDoc コメント付きで記載されている
- [ ] `TOOL_RISK_CONFIG` 定数の全3エントリの具体値が記載されている
- [ ] `security.ts` 内の配置位置（行番号付近）が決定されている
- [ ] エクスポート構成（named export + re-export 要否）が決定されている
- [ ] テストケース9件以上が表形式で設計されている
- [ ] Phase 4 デシジョンテーブルとの整合性が確認されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（3タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（3ファイル）が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1（要件定義）が完了していること
- **後続**: Phase 3（設計レビュー）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/tool-risk-config-implementation/phase-3-design-review.md`
