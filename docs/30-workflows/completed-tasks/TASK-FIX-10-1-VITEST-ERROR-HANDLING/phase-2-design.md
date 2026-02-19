# Phase 2: 設計

## メタ情報

| 項目   | 値                                  |
| ------ | ----------------------------------- |
| Phase  | 2                                   |
| 機能名 | TASK-FIX-10-1-VITEST-ERROR-HANDLING |
| 作成日 | 2026-02-19                          |

## 目的

Phase 1 で特定した失敗テストの根本原因に対する修正方針を設計する。未処理 Promise 拒否のパターンを分類し、各パターンに対する修正アプローチを決定する。プロダクションコード修正とテストコード修正の判断基準を明確にする。

## 実行タスク

- 修正パターン分類: 未処理 Promise 拒否のパターンを分類し、修正アプローチを決定する
- 修正方針設計: 各パターンに対する具体的な修正手法（try/catch 追加、await 漏れ修正、モック修正、クリーンアップ追加）を設計する
- 影響範囲設計: プロダクションコード修正 vs テストコード修正の判断基準を策定する
- 修正優先度決定: 失敗テストの修正順序を依存関係に基づいて決定する

## 参照資料

| 資料名                 | パス                                                                  | 説明                          |
| ---------------------- | --------------------------------------------------------------------- | ----------------------------- |
| 要件定義書             | `outputs/phase-1/requirements-definition.md`                          | Phase 1 成果物                |
| 失敗テストリスト       | `outputs/phase-1/failing-tests-list.md`                               | カテゴリ別失敗テスト一覧      |
| エラーハンドリング仕様 | `.claude/skills/aiworkflow-requirements/references/error-handling.md` | エラーハンドリング方針        |
| 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md`                                  | P9, P13, P22 等の関連 Pitfall |

## 実行手順

### ステップ 1: 未処理 Promise 拒否パターンの分類

Phase 1 の失敗テストリストを基に、以下のパターンに分類する:

| パターン ID | パターン名               | 説明                                                                     | 修正対象                   |
| ----------- | ------------------------ | ------------------------------------------------------------------------ | -------------------------- |
| P-AWAIT     | await 漏れ               | 非同期関数呼び出しに `await` が欠落し、拒否が未処理になる                | テストコード               |
| P-CATCH     | catch 不足               | `.catch()` または `try/catch` が不足し、拒否がハンドリングされない       | テストまたはプロダクション |
| P-MOCK      | モック非同期不備         | モック関数が `Promise.reject()` を返すが、テスト側で処理されていない     | テストコード               |
| P-CLEANUP   | 非同期クリーンアップ不足 | `afterEach` / `afterAll` で非同期リソース解放が完了前にテストが終了する  | テストコード               |
| P-FIRE      | Fire-and-forget          | プロダクションコードが `void promise` パターンで非同期処理を開始している | プロダクションコード       |
| P-TIMER     | タイマー関連             | `setTimeout` / `setInterval` 内の非同期処理でエラーが発生する            | テストまたはプロダクション |

### ステップ 2: 各パターンの修正アプローチ設計

#### P-AWAIT: await 漏れ

```typescript
// 修正前
it("should handle async operation", () => {
  someAsyncFunction(); // await 漏れ
});

// 修正後
it("should handle async operation", async () => {
  await someAsyncFunction();
});
```

#### P-CATCH: catch 不足

```typescript
// 修正前（テストコード）
it("should handle error", async () => {
  await expect(failingFunction()).rejects.toThrow();
  // 後続の非同期処理が未処理
});

// 修正後
it("should handle error", async () => {
  await expect(failingFunction()).rejects.toThrow();
  // 全ての非同期処理が完了するまで待機
});
```

#### P-MOCK: モック非同期不備

```typescript
// 修正前
mockService.execute.mockRejectedValue(new Error("test error"));
// テスト内でこのモックの拒否がハンドリングされていない

// 修正後
mockService.execute.mockRejectedValue(new Error("test error"));
await expect(sut.run()).rejects.toThrow("test error");
```

#### P-CLEANUP: 非同期クリーンアップ不足

```typescript
// 修正前
afterEach(() => {
  cleanup(); // 非同期処理が含まれるが await されていない
});

// 修正後
afterEach(async () => {
  await cleanup();
});
```

#### P-FIRE: Fire-and-forget

```typescript
// 修正前（プロダクションコード）
function initialize() {
  loadConfig(); // async だが await されていない
}

// 修正後（テストコード側で対処する場合）
it("should initialize", async () => {
  const initPromise = sut.initialize();
  await vi.runAllTimersAsync();
  await initPromise;
});
```

#### P-TIMER: タイマー関連

```typescript
// 修正前
vi.useFakeTimers();
sut.startPolling();
vi.runAllTimers(); // 非同期タイマーの拒否が未処理

// 修正後
vi.useFakeTimers();
sut.startPolling();
await vi.advanceTimersByTimeAsync(1000); // 1ステップずつ進める（P13 参照）
```

### ステップ 3: プロダクションコード修正 vs テストコード修正の判断基準

以下の判断基準に基づき、修正対象を決定する:

| 判断基準                                                         | 修正対象                         |
| ---------------------------------------------------------------- | -------------------------------- |
| テスト内の `await` 漏れや `catch` 不足が原因                     | テストコードのみ修正             |
| モック設定が非同期エラーを正しく模擬していない                   | テストコードのみ修正             |
| プロダクションコードが fire-and-forget で Promise を無視している | プロダクションコードの修正を検討 |
| プロダクションコードの非同期処理に `try/catch` が欠落している    | プロダクションコードを修正       |

**原則**: テストコードの修正で対処可能な場合はテストコードのみ修正し、プロダクションコードの変更は最小限に留める。ただし、プロダクションコードに明確なバグ（未処理拒否が本番でもクラッシュを引き起こす）がある場合はプロダクションコードを修正する。

### ステップ 4: 修正優先度と実行順序の決定

修正順序の判断基準:

1. **共有ユーティリティ・モックの修正を先に行う**: `src/test/setup.ts` やグローバルモックの修正は、他のテストファイルに波及するため最優先
2. **依存関係の下流から修正する**: サービス層（Main Process）→ IPC 層 → Renderer 層の順で修正
3. **修正範囲が小さいものから着手する**: 単純な `await` 追加は先に、複雑なリファクタリングは後に実施

## 統合テスト連携【必須】

統合ポイント/契約の設計への反映:

| 統合ポイント       | 契約定義                                                                        |
| ------------------ | ------------------------------------------------------------------------------- |
| テストセットアップ | `src/test/setup.ts` のグローバルセットアップが未処理 Promise 拒否を発生させない |
| モックシステム     | `src/test/__mocks__/` 配下のモックが非同期拒否を正しく模擬する                  |
| Vitest 設定        | `dangerouslyIgnoreUnhandledErrors` を削除した状態で全テストが安定する           |

## 多角的チェック観点

| 観点               | 適用 | 確認項目                                                                            |
| ------------------ | ---- | ----------------------------------------------------------------------------------- |
| エラーハンドリング | 該当 | 修正パターンが `error-handling.md` の方針と整合しているか                           |
| アーキテクチャ     | 該当 | プロダクションコード修正がレイヤー依存方向（Renderer→Preload→Main）を逆転させないか |
| パフォーマンス     | 該当 | `await` 追加によるテスト実行時間の影響を評価しているか                              |

## 成果物

| 成果物               | パス                                     | 説明                               |
| -------------------- | ---------------------------------------- | ---------------------------------- |
| 修正方針設計書       | `outputs/phase-2/fix-strategy-design.md` | パターン分類と修正アプローチ       |
| 影響範囲分析         | `outputs/phase-2/impact-analysis.md`     | プロダクション vs テストの修正判断 |
| 修正優先度マトリクス | `outputs/phase-2/fix-priority-matrix.md` | 修正順序と依存関係                 |

## 完了条件

- [ ] 未処理 Promise 拒否の全パターン（P-AWAIT / P-CATCH / P-MOCK / P-CLEANUP / P-FIRE / P-TIMER）が定義されている
- [ ] 各パターンに対する修正アプローチがコード例付きで設計されている
- [ ] プロダクションコード修正 vs テストコード修正の判断基準が明文化されている
- [ ] Phase 1 の失敗テストリスト全件に対して修正パターンが割り当てられている
- [ ] 修正優先度と実行順序が依存関係に基づいて決定されている
- [ ] 修正方針がプロダクションコードの実行時動作を変更しないことが確認されている（テストコード修正のみの場合）
- [ ] 要件定義（Phase 1）との整合性が確認されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## サブタスク管理

Phase 実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 1 成果物、error-handling.md、known-pitfalls.md）
2. 未処理 Promise 拒否パターンの分類（ステップ 1）
3. 各パターンの修正アプローチ設計（ステップ 2）
4. プロダクション vs テスト修正判断基準の策定（ステップ 3）
5. 修正優先度と実行順序の決定（ステップ 4）
6. 成果物の作成・配置
7. 完了条件の検証

## タスク 100% 実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-FIX-10-1-VITEST-ERROR-HANDLING --phase 2
```

## 次の Phase

Phase 3: 設計レビューゲート
