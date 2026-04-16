# Phase 5: 実装

## メタ情報

| 項目      | 内容                                              |
| --------- | ------------------------------------------------- |
| タスクID  | UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001          |
| タスク名  | resolveExternalIntegration 複数ツール並列統合対応 |
| フェーズ  | Phase 5: 実装                                     |
| 前提Phase | Phase 4                                           |
| 後続Phase | Phase 6                                           |
| 作成日    | 2026-04-15                                        |
| 分類      | NON_VISUAL（Renderer内部ロジック変更のみ）        |

---

## 目的

Phase 4 で作成した Red テストを Green にするための最小実装を行う。
`SkillCreateWizard.tsx` の `resolveExternalIntegration` 関数のシグネチャを `string` → `string[]` に変更し、
複数ツールを並列で統合情報取得・マージできるロジックを実装する。
あわせて `ConversationRoundStep.tsx` の暫定バッジ（UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001 の残留コード）を削除し、
M-01 TODO コメントを解消する。

受入条件 AC-1〜AC-7 をすべて満たす状態にする。

---

## 実装計画

### 修正ファイル一覧

| 種別 | ファイルパス                                                                                 |
| ---- | -------------------------------------------------------------------------------------------- |
| 修正 | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                           |
| 修正 | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`                |
| 修正 | `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` |

新規ファイルの作成は不要。既存ファイルの修正のみで対応する。

---

## 実装方針

### 1. `resolveExternalIntegration` の関数シグネチャ変更

`SkillCreateWizard.tsx` 内の `resolveExternalIntegration` 関数のシグネチャを以下のように変更する。

**Before:**

```typescript
async function resolveExternalIntegration(
  toolName: string,
): Promise<MergedExternalIntegration>;
```

**After:**

```typescript
async function resolveExternalIntegration(
  toolNames: string[],
): Promise<MergedExternalIntegration>;
```

- 引数を `string` から `string[]` へ変更
- 空配列 `[]` や未対応ツールに対して安全に空の merged object を返す（AC-4）
- 単一ツール選択時は従来と同一の動作を維持する（AC-3 後方互換性）

### 2. 複数ツール情報の並列取得ロジック

`Promise.all` を使用して複数ツールの統合情報を並列取得する。

実装パターンの概要:

```typescript
async function resolveExternalIntegration(
  toolNames: string[],
): Promise<MergedExternalIntegration> {
  const normalizedToolNames = [
    ...new Set(toolNames.map((name) => name.trim()).filter(Boolean)),
  ];

  // 空配列の場合はフォールバック（AC-4）
  if (normalizedToolNames.length === 0) {
    return defaultMergedExternalIntegration();
  }

  // 並列取得（AC-1）
  const results = await Promise.all(
    normalizedToolNames.map(async (toolName) => {
      try {
        return await fetchToolIntegrationInfo(toolName);
      } catch {
        return null;
      }
    }),
  );

  return mergeIntegrations(
    results.filter(
      (integration): integration is ExternalToolIntegration =>
        integration !== null,
    ),
  );
}
```

- `Promise.all` を使用することで並列処理を実現する（AC-1）
- 各ツールの統合情報（APIエンドポイント・認証方式・主要操作）がそれぞれ取得・マージされる（AC-2）
- 空配列や未対応ツールへの安全なフォールバック（AC-4）

### 3. マージされた統合情報の生成

複数ツールの統合情報をマージする `mergeIntegrations` ヘルパー関数を実装する。

```typescript
function mergeIntegrations(
  infos: ExternalToolIntegration[],
): MergedExternalIntegration {
  return {
    tools: infos,
    mergedApiEndpoints: [
      ...new Set(infos.flatMap((info) => [info.apiEndpoint])),
    ],
    mergedAuthMethods: [...new Set(infos.flatMap((info) => [info.authMethod]))],
    mergedPrimaryOperations: [
      ...new Set(infos.flatMap((info) => info.primaryOperations)),
    ],
  };
}
```

### 4. `SkillCreateWizard.tsx` の呼び出し箇所更新

`resolveExternalIntegration` の呼び出し元を `string` 渡しから `string[]` 渡しに変更する（AC-5）。

**Before:**

```typescript
// Q5 の単一選択結果 selectedOptions[0] を渡す
const integration = await resolveExternalIntegration(selectedOptions[0]);
```

**After:**

```typescript
// Q5 の複数ツール名配列を渡す
const integration = await resolveExternalIntegration(selectedTools);
```

呼び出し箇所は `// TODO(UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001)` コメントが付与されている箇所を検索して特定する（AC-7）。

### 5. `ConversationRoundStep.tsx` の暫定バッジ削除

UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001 で追加した暫定バッジコードを削除する。

#### 削除対象コード

1. `MAIN_TOOL_BADGE_ENABLED` フラグと `shouldShowMainToolBadge` 関数の削除
2. `aria-describedby` を含むバッジ JSX の削除:

```tsx
// 削除対象
<span
  id={mainToolBadgeId}
  aria-label="主ツールとして使用される"
  className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800"
>
  主ツール
</span>
```

3. `isMainTool` 変数の定義を削除
4. バッジ表示に関する `// TODO(UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001)` コメントを削除（AC-7）

#### バッジ削除後のテスト削除

`ConversationRoundStep.test.tsx` の主ツールバッジ関連テスト（TC-1〜TC-6）を削除する:

```bash
# バッジ関連テストの削除箇所を確認
grep -n "主ツール\|mainToolBadge\|MAIN_TOOL_BADGE" \
  apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx
```

削除後、残存テストが全 PASS することを確認する:

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx
```

---

## 実装手順

1. `resolveExternalIntegration` 関数のシグネチャを `string[]` に変更
2. `isSupportedTool` ヘルパー関数を実装（未対応ツール判定）
3. `fetchToolIntegrationInfo` のラッパー実装（既存ロジックを流用）
4. `mergeIntegrations` ヘルパー関数を実装
5. `MergedExternalIntegration` 型定義を追加
6. `SkillCreateWizard.tsx` の呼び出し箇所を `string[]` 渡しに更新
7. `ConversationRoundStep.tsx` の暫定バッジコードを削除
8. `ConversationRoundStep.test.tsx` の主ツールバッジ関連テストを削除
9. テスト実行・型チェック・Lint チェックを実施

---

## 参照資料

| 資料名                         | パス                                                                                               | 用途                                |
| ------------------------------ | -------------------------------------------------------------------------------------------------- | ----------------------------------- |
| 主ツールUI実装 Phase 5 仕様書  | `docs/30-workflows/completed-tasks/ut-skill-wizard-mso-main-tool-ui-001/phase-5-implementation.md` | バッジ削除対象コードの確認          |
| 主ツールUI実装 Phase 8 仕様書  | `docs/30-workflows/completed-tasks/ut-skill-wizard-mso-main-tool-ui-001/phase-8-refactoring.md`    | リファクタリング観点の参照          |
| SkillCreateWizard.tsx          | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                                 | resolveExternalIntegration 実装対象 |
| ConversationRoundStep.tsx      | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`                      | バッジ削除対象ファイル              |
| ConversationRoundStep.test.tsx | `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx`       | バッジ関連テスト削除対象            |

---

## 実行コマンド

### 実装後のテスト実行（Green 確認）

```bash
# resolveExternalIntegration のテスト実行
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/__tests__/resolveExternalIntegration.test.ts

# ConversationRoundStep のテスト実行（バッジ削除後の確認）
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx
```

### 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

### Lint チェック

```bash
pnpm --filter @repo/desktop lint
```

---

## 成果物

| 成果物名                               | パス                                                                                         | 説明                                        |
| -------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------- |
| SkillCreateWizard.tsx（修正）          | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                           | resolveExternalIntegration を string[] 対応 |
| ConversationRoundStep.tsx（修正）      | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`                | 暫定バッジコードを削除                      |
| ConversationRoundStep.test.tsx（修正） | `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` | バッジ関連テストを削除                      |

---

## 完了条件

- [ ] `resolveExternalIntegration` の引数が `string[]` 型になっている（AC-1）
- [ ] 複数ツールを `Promise.all` で並列取得するロジックが実装されている（AC-1）
- [ ] 各ツールの統合情報がマージされた `MergedExternalIntegration` が返される（AC-2）
- [ ] 単一ツール（`normalizedToolNames.length === 1`）時に従来と同一の動作を維持している（AC-3）
- [ ] 空配列 `[]` を渡した場合に空の merged object を返す（AC-4）
- [ ] 未対応ツールのみの配列を渡した場合に空の merged object を返す（AC-4）
- [ ] `SkillCreateWizard.tsx` の呼び出し箇所が `string[]` を渡すよう更新されている（AC-5）
- [ ] `ConversationRoundStep.tsx` の `MAIN_TOOL_BADGE_ENABLED` フラグが削除されている
- [ ] `ConversationRoundStep.tsx` の `shouldShowMainToolBadge` 関数が削除されている
- [ ] `ConversationRoundStep.tsx` の `isMainTool` 変数定義が削除されている
- [ ] `ConversationRoundStep.tsx` のバッジ JSX が削除されている
- [ ] `ConversationRoundStep.test.tsx` の主ツールバッジ関連テスト（TC-1〜TC-6）が削除されている
- [ ] `// TODO(UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001)` コメントが全て削除されている（AC-7）
- [ ] Phase 4 で作成したテストが全て PASS している
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなし
- [ ] `pnpm --filter @repo/desktop lint` がエラーなし
- [ ] Phase 6（テスト拡充）へのブロッカーがない

---

## サブタスク管理

| #   | サブタスク                                | 状態    |
| --- | ----------------------------------------- | ------- |
| 1   | 関数シグネチャ変更・型定義追加            | pending |
| 2   | 並列取得ロジック実装                      | pending |
| 3   | マージロジック実装                        | pending |
| 4   | 呼び出し箇所更新                          | pending |
| 5   | ConversationRoundStep バッジ削除          | pending |
| 6   | ConversationRoundStep.test.tsx テスト削除 | pending |
| 7   | テスト・型チェック・Lint 確認             | pending |

---

## タスク100%実行確認【必須】

実装完了後、以下を全て確認してからPhase 6に進む。

```bash
# 1. resolveExternalIntegration テスト
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/__tests__/resolveExternalIntegration.test.ts

# 2. ConversationRoundStep テスト（バッジ削除後）
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx

# 3. 型チェック
pnpm --filter @repo/desktop typecheck

# 4. Lint
pnpm --filter @repo/desktop lint

# 5. TODO コメント残留確認（0件であること）
grep -r "TODO(UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001)" \
  apps/desktop/src/renderer/components/skill/
```

---

## 次のPhase

Phase 6: テスト拡充（fail path・エッジケース追加）
