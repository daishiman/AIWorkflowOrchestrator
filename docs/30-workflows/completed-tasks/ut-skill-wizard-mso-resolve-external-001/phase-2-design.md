# Phase 2: 設計

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 2                                         |
| タスクID   | UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001  |
| 機能名     | skill-wizard/resolve-external-integration |
| 前提Phase  | Phase 1                                   |
| 後続Phase  | Phase 3                                   |
| 作成日     | 2026-04-15                                |
| ステータス | pending                                   |

## 目的

`resolveExternalIntegration` の関数シグネチャ変更設計・複数ツール情報マージ戦略（Promise.all 並列取得 vs 逐次処理）・後方互換性確保方針を確定し、Phase 4（テスト作成）・Phase 5（実装）が迷いなく進められる状態にする。また前タスク（`UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001`）で残された「主ツール」バッジの削除設計を確定する。

## 実行タスク

- シグネチャ変更設計: `string` → `string[]` への変更方針・後方互換性の確保方法を決定
- 並列処理戦略の決定: `Promise.all` 並列取得 vs 逐次処理の比較・採用決定
- マージ戦略の設計: 複数ツール情報（API エンドポイント・認証方式・主要操作）のマージ方針を確定
- フォールバック設計: 空配列・未対応ツールに対する安全なフォールバック方針を決定
- バッジ削除設計: `ConversationRoundStep.tsx` の削除対象と削除手順を確定
- テスト設計: 検証マトリクスの定義

## 参照資料

| 資料名                          | パス                                                                                         | 用途                                          |
| ------------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Phase 1 成果物                  | `outputs/phase-1/requirements-definition.md`                                                 | 要件・AC-1〜AC-7 参照                         |
| resolveExternalIntegration 実装 | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                           | 現状シグネチャ・M-01 TODO・呼び出し箇所の確認 |
| 対象コンポーネント              | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`                | バッジ削除対象の特定                          |
| テストファイル                  | `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` | バッジ関連テスト（TC-1〜TC-6）削除対象の確認  |
| 前タスク設計書 Phase 2          | `docs/30-workflows/completed-tasks/ut-skill-wizard-mso-main-tool-ui-001/phase-2-design.md`   | バッジ削除手順・TODO コメント方針の参照       |

## 実行手順

### 1. 関数シグネチャ変更の設計

#### 変更前（現状）

```typescript
// M-01 TODO: selectedOptions[0] のみを参照（暫定実装）
async function resolveExternalIntegration(
  tool: string,
): Promise<MergedExternalIntegration>;
```

#### 変更後（設計）

```typescript
async function resolveExternalIntegration(
  tools: string[],
): Promise<MergedExternalIntegration>;
```

#### 後方互換性の確保方針

単一ツール選択時（`normalizedToolNames.length === 1`）は従来と同一の動作を維持する。
返り値は常に `MergedExternalIntegration` に統一し、AC-3（後方互換性）を満たす。

| 入力パターン         | 処理方針                                               | AC対応 |
| -------------------- | ------------------------------------------------------ | ------ |
| `["toolA"]`          | 従来と同等の単一ツール処理（後方互換パス）             | AC-3   |
| `["toolA", "toolB"]` | Promise.all による並列取得 → マージ処理                | AC-1   |
| `[]`                 | 空の merged object でフォールバック                    | AC-4   |
| `["未対応ツール"]`   | サポート判定で除外し、成功がなければ空の merged object | AC-4   |

### 2. 並列処理戦略の決定

#### 案A: Promise.all 並列取得

```typescript
async function resolveExternalIntegration(
  tools: string[],
): Promise<MergedExternalIntegration> {
  const normalizedToolNames = [
    ...new Set(tools.map((name) => name.trim()).filter(Boolean)),
  ];

  if (normalizedToolNames.length === 0)
    return defaultMergedExternalIntegration();

  const results = await Promise.all(
    normalizedToolNames.map(async (toolName) => {
      if (!isSupportedTool(toolName)) return null;

      try {
        return await fetchToolIntegrationInfo(toolName);
      } catch {
        return null;
      }
    }),
  );

  const successfulIntegrations = results.filter(
    (integration): integration is ExternalToolIntegration =>
      integration !== null,
  );

  return mergeIntegrations(successfulIntegrations);
}
```

**長所**: 複数ツールを並列で取得するため応答時間が短い。失敗分を `null` に吸収して成功分だけをマージできる。
**短所**: 正規化後の `null` フィルタ処理が必要になる。

#### 案B: 逐次処理

```typescript
async function resolveExternalIntegration(
  tools: string[],
): Promise<MergedExternalIntegration> {
  const normalizedToolNames = [
    ...new Set(tools.map((name) => name.trim()).filter(Boolean)),
  ];

  if (normalizedToolNames.length === 0)
    return defaultMergedExternalIntegration();

  const results: Array<ExternalToolIntegration | null> = [];
  for (const toolName of normalizedToolNames) {
    if (!isSupportedTool(toolName)) {
      results.push(null);
      continue;
    }

    try {
      const info = await fetchToolIntegrationInfo(toolName);
      results.push(info);
    } catch {
      results.push(null);
    }
  }
  return mergeIntegrations(
    results.filter(
      (integration): integration is ExternalToolIntegration =>
        integration !== null,
    ),
  );
}
```

**長所**: デバッグしやすい。エラーハンドリングが明示的。
**短所**: ツール数に比例して待機時間が増加する。

#### 採用方針の判断基準

| 観点              | 案A（Promise.all） | 案B（逐次処理） |
| ----------------- | :----------------: | :-------------: |
| パフォーマンス    |         優         |       劣        |
| AC-1 並列処理要件 |        対応        |     非対応      |
| エラー安全性      |        同等        |      同等       |
| テスト容易性      |        同等        |      同等       |
| 実装複雑度        |         低         |       低        |

**採用**: 案A（Promise.all 並列取得）を採用する。AC-1 で「並列で処理できる」と明記されており、パフォーマンス面でも優れているため。個々のツール取得エラーは `null` に吸収し、成功分だけをマージする。

### 3. マージ戦略の設計

複数ツールの統合情報（API エンドポイント・認証方式・主要操作）のマージ方針:

| フィールド              | マージ戦略                         | 理由                                           |
| ----------------------- | ---------------------------------- | ---------------------------------------------- |
| mergedApiEndpoints      | 全ツール分の配列を結合（重複排除） | 複数ツールのエンドポイントを全て利用可能にする |
| mergedAuthMethods       | 全ツール分の配列を結合（重複排除） | 各ツールの認証方式を全て列挙する               |
| mergedPrimaryOperations | 全ツール分の操作を結合（重複排除） | スキル定義に全ツールの操作を含める             |
| tools                   | ツールごとの統合情報を保持         | 後方互換性・既存のロジックとの整合性を維持     |

```typescript
function mergeIntegrations(
  infos: ExternalToolIntegration[],
): MergedExternalIntegration {
  return {
    mergedApiEndpoints: [...new Set(infos.flatMap((i) => [i.apiEndpoint]))],
    mergedAuthMethods: [...new Set(infos.flatMap((i) => [i.authMethod]))],
    mergedPrimaryOperations: [
      ...new Set(infos.flatMap((i) => i.primaryOperations)),
    ],
    tools: infos,
  };
}
```

### 4. フォールバック設計

| ケース           | フォールバック動作                                       | AC対応 |
| ---------------- | -------------------------------------------------------- | ------ |
| 空配列 `[]`      | `defaultMergedExternalIntegration()` を即時返却          | AC-4   |
| 未対応ツール     | 正規化・サポート判定で除外し、成功がなければ空結果を返却 | AC-4   |
| 全ツール取得失敗 | `mergeIntegrations([])` で空のデフォルト値を返却         | AC-4   |

```typescript
function defaultMergedExternalIntegration(): MergedExternalIntegration {
  return {
    tools: [],
    mergedApiEndpoints: [],
    mergedAuthMethods: [],
    mergedPrimaryOperations: [],
  };
}
```

### 5. SkillCreateWizard.tsx の呼び出し箇所更新設計

AC-5 対応: `resolveExternalIntegration` の呼び出し箇所を `selectedOptions` 全体を渡すよう更新する。

#### 変更前（M-01 TODO 箇所）

```typescript
// TODO(M-01): selectedOptions[0] のみ参照。UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001 で修正予定
const integrationInfo = await resolveExternalIntegration(selectedOptions[0]);
```

#### 変更後

```typescript
const integrationInfo = await resolveExternalIntegration(selectedOptions);
```

### 6. バッジ削除設計

`UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001` の AC-4（削除容易性）設計に従い、以下を削除する:

| 削除対象              | ファイル                         | 削除内容                                                                               |
| --------------------- | -------------------------------- | -------------------------------------------------------------------------------------- |
| フラグ定数            | `ConversationRoundStep.tsx`      | `const MAIN_TOOL_BADGE_ENABLED = true`                                                 |
| バッジ制御関数        | `ConversationRoundStep.tsx`      | `shouldShowMainToolBadge` 関数定義全体                                                 |
| バッジ JSX            | `ConversationRoundStep.tsx`      | `<span id={mainToolBadgeId} aria-label="主ツールとして使用される" ...>主ツール</span>` |
| aria-describedby 属性 | `ConversationRoundStep.tsx`      | `aria-describedby={isMainTool ? mainToolBadgeId : undefined}`                          |
| TODO コメント         | `ConversationRoundStep.tsx`      | `// TODO(UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001)` 全件                               |
| バッジ関連テスト      | `ConversationRoundStep.test.tsx` | TC-1〜TC-6（主ツールバッジ関連の describe ブロック）                                   |

### 7. テスト設計（検証マトリクス）

| テストケース ID | テスト内容                                                          | 入力                     | 期待結果                                                | AC対応 |
| --------------- | ------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------- | ------ |
| TC-1            | 複数ツール入力時に Promise.all が並列実行される                     | `["toolA", "toolB"]`     | fetchToolIntegrationInfo が2件同時に呼び出される        | AC-1   |
| TC-2            | 複数ツール入力時に各ツールの mergedApiEndpoints がマージされる      | `["toolA", "toolB"]`     | 返り値の mergedApiEndpoints に両ツール分が含まれる      | AC-2   |
| TC-3            | 複数ツール入力時に各ツールの mergedAuthMethods がマージされる       | `["toolA", "toolB"]`     | 返り値の mergedAuthMethods に両ツール分が含まれる       | AC-2   |
| TC-4            | 複数ツール入力時に各ツールの mergedPrimaryOperations がマージされる | `["toolA", "toolB"]`     | 返り値の mergedPrimaryOperations に両ツール分が含まれる | AC-2   |
| TC-5            | 単一ツール入力時は従来と同一の結果が返る                            | `["toolA"]`              | 単一ツールのみの `MergedExternalIntegration` が返る     | AC-3   |
| TC-6            | 空配列入力時は空の merged object が返る                             | `[]`                     | `tools` / `merged*` がすべて空配列                      | AC-4   |
| TC-7            | 未対応ツール入力時は安全に空の merged object になる                 | `["unsupported"]`        | 例外が発生せず空の merged object が返る                 | AC-4   |
| TC-8            | 複数ツールのうち1件が取得失敗しても残りの結果が保持される           | `["toolA", "errorTool"]` | toolA の情報のみが返り値に含まれる                      | AC-4   |
| TC-9            | 重複するツール名が除去される                                        | `["toolA", "toolA"]`     | `tools` の重複が 1 件に抑えられる                       | AC-2   |
| TC-10           | 全ツール取得失敗時は空の merged object が返る                       | `["errorA", "errorB"]`   | `tools` / `merged*` がすべて空配列                      | AC-4   |

#### テストコマンド

```bash
# resolveExternalIntegration のテスト実行
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/__tests__/resolveExternalIntegration.test.ts

# ConversationRoundStep のテスト実行（バッジ削除後の確認）
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx

# カバレッジ確認（90%以上が目標）
pnpm --filter @repo/desktop exec vitest run --coverage \
  src/renderer/components/skill/

# 型チェック
pnpm --filter @repo/desktop typecheck

# lint
pnpm --filter @repo/desktop lint
```

### 8. 設計上の判断記録

| 判断事項             | 採用方針                                          | 理由                                                                  |
| -------------------- | ------------------------------------------------- | --------------------------------------------------------------------- |
| 並列処理戦略         | Promise.all 並列取得（案A）                       | AC-1 の「並列処理」要件・パフォーマンス優位性                         |
| エラーハンドリング   | `null` へ吸収して成功分だけをマージ               | 一部ツールの失敗が全体を止めないフォールバック設計（AC-4）            |
| マージ戦略           | flatMap + Set による重複排除                      | 全ツール情報を網羅しつつ重複を除去                                    |
| 後方互換性           | 単一ツールでも `MergedExternalIntegration` を返却 | AC-3: 単一ツール選択時の既存動作を保証                                |
| バッジ削除タイミング | 本タスク（Phase 5）で実施                         | `MAIN_TOOL_BADGE_ENABLED` フラグの意図通り（TODO コメント指示に従う） |
| テストファイルの配置 | `__tests__/resolveExternalIntegration.test.ts`    | 既存テストファイルの命名規則に従う                                    |

## 統合テスト連携【必須】

| 判定項目               | 基準 | 結果 |
| ---------------------- | ---- | ---- |
| ユニットテストLine     | 90%+ | -    |
| ユニットテストBranch   | 80%+ | -    |
| ユニットテストFunction | 90%+ | -    |
| 型チェック             | PASS | -    |

## 成果物

| 成果物 | パス                        | 説明                                           |
| ------ | --------------------------- | ---------------------------------------------- |
| 設計書 | `outputs/phase-2/design.md` | シグネチャ設計・マージ戦略・削除設計・判断記録 |

## 完了条件

- [ ] シグネチャ変更（`string` → `string[]`）の設計が確定済み
- [ ] Promise.all 並列取得（案A）の採用を決定済み
- [ ] マージ戦略（flatMap + Set 重複排除）が確定済み
- [ ] フォールバック設計（空配列・未対応ツール）が確定済み
- [ ] `SkillCreateWizard.tsx` の呼び出し箇所更新方針（`selectedOptions` 全体渡し）が確定済み
- [ ] バッジ削除対象（6種）が特定済み
- [ ] 検証マトリクス（TC-1〜TC-10）が定義済み
- [ ] 設計判断の記録が完了済み
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. シグネチャ変更設計（後方互換性方針含む）
2. 並列処理戦略の比較・決定（案A vs 案B）
3. マージ戦略の設計（flatMap + Set）
4. フォールバック設計
5. SkillCreateWizard.tsx 呼び出し箇所更新設計
6. バッジ削除設計（削除対象6種の特定）
7. テスト設計（検証マトリクス TC-1〜TC-10）
8. 設計判断の記録
9. 成果物の出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 3: 設計レビュー
