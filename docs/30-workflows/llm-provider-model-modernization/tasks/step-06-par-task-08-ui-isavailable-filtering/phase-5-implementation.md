# Phase 5: 実装（TDD: Green） -- UI isAvailable フィルタリング実装

## メタ情報

| 項目       | 値                       |
| ---------- | ------------------------ |
| Phase番号  | 5                        |
| 機能名     | ui-isavailable-filtering |
| タスクID   | TASK-LLM-MOD-08          |
| 作成日     | 2026-03-23               |
| ステータス | 実施済み                 |
| 依存 Phase | Phase 4（テスト作成）    |

## 目的

Phase 4 で作成したテストを全て通す実装を行う（TDD: Green フェーズ）。`apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx` に isAvailable フィルタリングの1行を追加する。

## 実行タスク

### Task 5-1: 対象ファイルの読み込み確認

実装前に `apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx` の現行内容を確認し、変更箇所を特定した：

- L333-335: プロバイダー一覧の取得部分（`allProviders` 変数）

### Task 5-2: isAvailable フィルタの追加

`apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx` の L334-335 に以下の変更を実施した：

変更前:

```typescript
// Props override Store (for standalone usage / testing)
const allProviders = providersProp ?? storeProviders ?? [];
```

変更後:

```typescript
// Props override Store (for standalone usage / testing)
// APIキー設定済みのプロバイダーのみ表示（P62: 未設定プロバイダーは非表示）
const allProviders = providersProp ?? storeProviders ?? [];
const providers = allProviders.filter((p) => p.isAvailable);
```

#### 設計判断

- **P62（DEFAULT_CONFIG fallback 禁止）との関連**: 未設定プロバイダーを選択肢から除外することで、意図しないプロバイダーへの暗黙 fallback を根本的に防止する
- **ProviderSelector/LLMSelectorPanel は変更なし**: 設定画面では全プロバイダーの表示が必要（グレーアウト+バッジ表示）。フィルタは InlineModelSelector のみに適用する設計とした
- **Store 側でのフィルタリングは不採用**: コンポーネントごとの表示要件が異なるため、フィルタリングは各コンポーネントの責務とした

### Task 5-3: Green フェーズの確認

実装後に以下を実行し、Phase 4 で追加したテストが全て通ることを確認した：

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/llm/__tests__/InlineModelSelector.test.tsx
```

結果:

- T-01〜T-05 の全テスト: PASS
- 既存テスト全て: PASS

### Task 5-4: TypeScript コンパイル確認

```bash
pnpm --filter @repo/desktop typecheck
```

結果: エラー 0 件（AC-05 充足）

## 参照資料

| 資料名           | パス                                                                                                                             |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Phase 2 設計     | `docs/30-workflows/llm-provider-model-modernization/tasks/step-06-par-task-08-ui-isavailable-filtering/phase-2-design.md`        |
| Phase 4 テスト   | `docs/30-workflows/llm-provider-model-modernization/tasks/step-06-par-task-08-ui-isavailable-filtering/phase-4-test-creation.md` |
| 実装対象ファイル | `apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx`                                                               |
| コード品質ルール | `.claude/rules/02-code-quality.md`                                                                                               |

## 成果物

| 成果物               | パス                                                               | 形式       |
| -------------------- | ------------------------------------------------------------------ | ---------- |
| 更新済み実装ファイル | `apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx` | TypeScript |

## 完了条件

- [x] 実装前に `InlineModelSelector.tsx` を Read で確認した
- [x] L334-335 に isAvailable フィルタを追加した
- [x] P62 対応コメントを追加した
- [x] Phase 4 追加テスト（T-01〜T-05）が全て PASS した
- [x] 既存テストが全て PASS した
- [x] `pnpm typecheck` がエラー 0 件で完了した

## 次の Phase

Phase 6: テスト拡充（`phase-6-test-expansion.md`）
