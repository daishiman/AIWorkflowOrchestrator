# Phase 6: テスト拡充

## メタ情報

| 項目          | 内容                                                                                                               |
| ------------- | ------------------------------------------------------------------------------------------------------------------ |
| Phase番号     | 6                                                                                                                  |
| 機能名        | LLM設定永続化修正 (TASK-FIX-LLM-CONFIG-PERSISTENCE)                                                                |
| 作成日        | 2026-03-20                                                                                                         |
| 担当          | -                                                                                                                  |
| ステータス    | 未着手                                                                                                             |
| 前Phase成果物 | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-5-implementation.md` |

## 目的

Phase 7 のカバレッジ確認（Line: 80%以上、Branch: 60%以上、Function: 80%以上）に備え、Phase 4/5 で不足しているカバレッジを補うテストケースを追加する。特にエッジケース・組み合わせテスト・型安全性テストを拡充する。

## 実行タスク

### タスク1: カバレッジ仮計測と不足箇所の特定

```bash
# apps/desktopディレクトリから実行（P40対策）
cd apps/desktop

# カバレッジレポート生成
pnpm vitest run --coverage \
  src/renderer/store/__tests__/ \
  src/renderer/store/slices/__tests__/

# カバレッジ結果確認（特にbranch coverageに注目）
cat coverage/lcov-report/index.html
# または
cat coverage/coverage-summary.json | grep -A 5 '"store"'
```

### タスク2: 追加テストケース（カバレッジ不足箇所）

#### partialize関数の追加テスト

| ID   | テスト名                                                               | 目的                |
| ---- | ---------------------------------------------------------------------- | ------------------- |
| T5-1 | state全フィールドから機密情報（providers, isLoading等）が除外される    | Branch coverage補完 |
| T5-2 | partializeが返すオブジェクトのキーが6個（currentView等+2つ）であること | 誤追加防止          |

#### migrate関数の追加テスト

| ID   | テスト名                                                           | 目的                |
| ---- | ------------------------------------------------------------------ | ------------------- |
| T6-1 | version === 2 の場合、persistedStateをそのまま返すこと             | Branch coverage補完 |
| T6-2 | 将来のversion（3以上）に対しても安全に処理されること               | 将来対策            |
| T6-3 | persistedStateが空オブジェクト `{}` の場合でも安全に処理されること | 境界値追加          |

#### バリデーション関数の追加テスト

| ID   | テスト名                                                                | 目的                |
| ---- | ----------------------------------------------------------------------- | ------------------- |
| T7-1 | 複数Providerが存在する場合に正しいProviderのModelリストを参照すること   | Branch coverage補完 |
| T7-2 | ModelIDがnullの場合に {providerId: valid, modelId: null} を返すこと     | 境界値追加          |
| T7-3 | Providerのmodelsフィールドがundefinedまたはnullでもクラッシュしないこと | 異常系追加          |

#### 起動時同期の追加テスト

| ID   | テスト名                                                            | 目的           |
| ---- | ------------------------------------------------------------------- | -------------- |
| T8-1 | fetchProvidersが失敗（rejectされた場合）に同期が呼ばれないこと      | 異常系追加     |
| T8-2 | fetchProviders成功後にstoreのselectedProviderIdが更新されていること | 統合テスト追加 |

### タスク3: 型安全性テスト

```typescript
// store/index.ts の PersistedState 型に selectedProviderId/selectedModelId が含まれることを型レベルで検証
// コンパイル時チェックとしてのテスト（tsc のエラーがないことを確認）

// llmSlice.ts の validateAndSyncPersistedConfig が正しい型シグネチャを持つことを確認
import type { Provider } from "<実際のインポートパス>";
type ValidateReturn = ReturnType<typeof validateAndSyncPersistedConfig>;
// ValidateReturn は { providerId: string | null; modelId: string | null } であること
```

### タスク4: 統合テスト追加

**テストシナリオ**: アプリ起動からLLM選択永続化までの全フロー

```
1. persist storage に v1 データが存在する状態でアプリ起動
2. Zustand hydrate が実行され v2 migrate が走る
3. providers fetch が完了する
4. validateAndSyncPersistedConfig が実行される
5. 有効な設定が syncSelectedConfigToMain() に渡される
```

このフローをモックを使って統合的にテストする。

## 参照資料

### コード品質ルール

| 資料名         | パス                               |
| -------------- | ---------------------------------- |
| カバレッジ基準 | `.claude/rules/02-code-quality.md` |

### 前Phase成果物

| 資料名             | パス                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Phase 4 テスト設計 | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-4-test-creation.md`  |
| Phase 5 実装       | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-5-implementation.md` |

### 既知の落とし穴

| 落とし穴ID | 説明                                 | 対策                                               |
| ---------- | ------------------------------------ | -------------------------------------------------- |
| P9         | テスト間で状態共有                   | `beforeEach` でリセット                            |
| P41        | v8カバレッジのインライン関数カウント | インライン関数（コールバック）を明示的にテストする |
| P40        | テスト実行ディレクトリ依存           | `apps/desktop` から実行する                        |

## 実行手順

1. **タスク1の実施**: カバレッジを仮計測し、不足箇所を特定する
2. **タスク2の実施**: 不足テストケースを追加する
3. **タスク3の実施**: 型安全性テストを追加する（TypeScriptコンパイルで確認）
4. **タスク4の実施**: 統合テストシナリオを追加する
5. **再計測**: カバレッジが改善されたことを確認する（Phase 7 の基準値に近づいているか）

## 統合テスト連携

- 現行実装との差分、対象テスト、依存タスクとの接続点をこのPhaseで確認・更新する。
- 追加・変更したテスト観点は対応する `apps/desktop/src/` の実装ファイルと1対1で突合する。

## 成果物

| 成果物                       | パス                                                                                                               | 説明                    |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------- |
| Phase 6 仕様書（本ファイル） | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-6-test-expansion.md` | テスト拡充計画書        |
| 追加テストコード             | 既存の4テストファイルに追記                                                                                        | T5〜T8 テストケース追加 |

## 完了条件

- [ ] タスク1でカバレッジ仮計測を実施し、不足箇所を特定した
- [ ] T5-1 〜 T8-2 のテストケースを追加実装した
- [ ] 型安全性テスト（タスク3）を追加した
- [ ] 統合テスト（タスク4）を追加した
- [ ] 全追加テストがPASSであることを確認した
- [ ] P41対策（インライン関数のカバレッジ確認）を実施した

## 次Phase

Phase 7: カバレッジ確認（`phase-7-coverage-check.md`）
