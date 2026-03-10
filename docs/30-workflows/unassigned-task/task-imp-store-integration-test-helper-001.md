# Store 統合テストヘルパー共通化 - タスク指示書

## メタ情報

```yaml
issue_number: 1135
```

## メタ情報

| 項目         | 内容                                                                              |
| ------------ | --------------------------------------------------------------------------------- |
| タスクID     | UT-IMP-STORE-INTEGRATION-TEST-HELPER-001                                          |
| タスク名     | Store 統合テストヘルパー共通化（electronAPI mock + Store reset ボイラープレート） |
| 分類         | 改善                                                                              |
| 対象機能     | テスト基盤（Renderer Store 統合テスト）                                           |
| 優先度       | 中                                                                                |
| 見積もり規模 | 中規模                                                                            |
| ステータス   | 未実施                                                                            |
| 発見元       | TASK-10A-G Phase 4-6（G2 Store-driven lifecycle テスト実装）                      |
| 発見日       | 2026-03-10                                                                        |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-10A-G の G2（Store-driven lifecycle 統合テスト、21テスト）実装時、以下のボイラープレートコードを毎テストファイルで繰り返し記述する必要があった：

1. **electronAPI モック構築**: `window.electronAPI` に skill/llm/auth 関連の IPC メソッドをモックとして注入（10+ メソッド）
2. **Store リセット**: `useAppStore.setState()` で各スライスの初期状態にリセット
3. **`vi.waitFor` による非同期状態遷移待ち**: Store アクションの非同期完了を `vi.waitFor(() => expect(useAppStore.getState().xxx).toBe(yyy))` パターンで待機

これらが苦戦箇所 #2（vi.waitFor パターン）および #3（electronAPI モック構築の重複）に該当する。

### 1.2 放置した場合の影響

- 新規 Store 統合テスト作成時に 30-50 行のボイラープレートが毎回必要
- electronAPI モックの形状がテストファイル間で不整合になるリスク
- Store 初期状態の定義が分散し、スライス変更時に複数ファイルの修正が必要
- vi.waitFor パターンの誤用（タイムアウト未設定、不適切な assertion）が属人的に発生

---

## 2. 何を達成するか（What）

### 2.1 目的

Store 統合テストの electronAPI モック構築 + Store リセット + 非同期状態遷移待ちのボイラープレートを共通ヘルパーとして提供し、新規テスト作成のコスト削減と品質の均一化を実現する。

### 2.2 最終ゴール

- `createStoreTestHelper()` ファクトリ関数が存在する
- electronAPI モックの標準構成が1箇所で管理されている
- Store リセットが `helper.resetStore()` の1行で完了する
- `helper.waitForState(selector, expected)` で非同期状態遷移を型安全に待機できる
- G2 テスト（21テスト）がヘルパーを使用してリファクタリングされている

### 2.3 スコープ（含むもの / 含まないもの）

#### 含むもの

- `createStoreTestHelper()` ファクトリ関数の作成
- electronAPI 標準モック構成の定義（skill, llm, auth-mode, auth-key チャンネル）
- Store リセットユーティリティ（全スライスの初期状態復元）
- `waitForState()` 型安全ラッパー
- G2 テストのリファクタリング（21テスト）

#### 含まないもの

- G1（Main IPC）テストへの適用（Main Process は electronAPI 不要）
- G3（ChatPanel wiring）テストへの適用（別途検討）
- Playwright E2E テスト用のヘルパー
- Store スライス自体の変更

### 2.4 成果物

| 成果物                    | 説明                                   |
| ------------------------- | -------------------------------------- |
| store-test-helper.ts      | createStoreTestHelper() ファクトリ関数 |
| store-test-helper.test.ts | ヘルパー自体の単体テスト               |
| G2 テストリファクタリング | 21テストをヘルパー使用に移行           |
| Phase 1-12 成果物         | 各Phaseの標準出力ドキュメント          |

---

## 3. どのように実現するか（How）

### 3.1 技術方針

1. **`apps/desktop/src/renderer/__tests__/helpers/store-test-helper.ts` を作成**
   - `createStoreTestHelper(overrides?)` でカスタマイズ可能なファクトリパターン
   - デフォルト electronAPI モック + Store 初期状態を内包
   - `resetStore()`, `waitForState()`, `mockElectronAPI` を公開

2. **electronAPI モック構成の一元管理**
   - 全チャンネルのデフォルトレスポンスを Record で定義
   - テスト固有のオーバーライドを `overrides` パラメータで受付

3. **waitForState 型安全ラッパー**
   - `waitForState<T>(selector: (state: AppState) => T, expected: T, options?: { timeout?: number })`
   - vi.waitFor 内部で selector + toBe/toEqual を自動判定
   - デフォルトタイムアウト: 5000ms（P13 対策: advanceTimersByTime 互換）

### 3.2 ヘルパー API 設計

```typescript
interface StoreTestHelper {
  mockElectronAPI: MockElectronAPI;
  resetStore: () => void;
  waitForState: <T>(
    selector: (state: AppState) => T,
    expected: T,
  ) => Promise<void>;
  cleanup: () => void;
}

function createStoreTestHelper(
  overrides?: Partial<MockElectronAPI>,
): StoreTestHelper;
```

### 3.3 リスクと対策

| リスク                                          | 対策                                                    |
| ----------------------------------------------- | ------------------------------------------------------- |
| electronAPI の形状変更時にヘルパーが古くなる    | P23 準拠で types.ts と同期するテストを追加              |
| waitForState のタイムアウトがテスト環境で不安定 | P13 対策: fake timers 使用時は advanceTimersByTime 併用 |
| ヘルパーの抽象化が過度になる                    | 最小限の API（3メソッド）に限定、拡張は段階的に         |

---

## 4. TASK-10A-G からの教訓（苦戦箇所）

### 4.1 苦戦箇所一覧

| 苦戦箇所                                     | 再発条件                                              | 対処                                                                                                                                                                                             |
| -------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| vi.waitFor での非同期状態遷移待ち（苦戦 #2） | Store アクションが IPC 呼び出しを含む非同期処理の場合 | `vi.waitFor(() => expect(useAppStore.getState().field).toBe(expected))` パターンを標準化。タイムアウトは明示的に設定（デフォルト 5000ms）。toEqual vs toBe はプリミティブ/オブジェクトで使い分け |
| electronAPI モック構築の重複（苦戦 #3）      | 新規 Store 統合テストを作成するたびに発生             | 標準モック構成を1ファイルで管理し、テスト固有のオーバーライドのみ記述する                                                                                                                        |
| Store 初期状態の手動定義                     | スライスのフィールド追加・変更時                      | `useAppStore.getState()` の初期スナップショットをヘルパー内で管理                                                                                                                                |

### 4.2 再利用手順

1. Phase 1 開始前に `apps/desktop/src/renderer/store/slices/` のスライス一覧を確認
2. 既存の G2 テスト（`apps/desktop/src/main/ipc/__tests__/skillHandlers.lifecycle-store.test.ts`）のボイラープレートを参考にヘルパー設計
3. testing-component-patterns.md Section 18（Store-Driven Lifecycle 統合テストパターン）を参照
4. テスト実行は `cd apps/desktop && pnpm vitest run` で実行（P40 対策）

---

## 5. 参照資料

| 参照資料                                              | パス                                                                                                                                      | 内容                               |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| S33 3層テストアーキテクチャパターン                   | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md#S33`                                           | G1/G2/G3 分離の設計原則            |
| Section 18: Store-Driven Lifecycle 統合テストパターン | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md#Section18`                                               | Direct Store Manipulation パターン |
| lessons-learned.md v1.29.60                           | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                                                    | TASK-10A-G 苦戦箇所 #2, #3         |
| P13 タイマーテスト無限ループ                          | `.claude/rules/06-known-pitfalls.md#P13`                                                                                                  | advanceTimersByTime 必須           |
| P23 API 二重定義の型管理                              | `.claude/rules/06-known-pitfalls.md#P23`                                                                                                  | electronAPI 型の同期               |
| P39 happy-dom と userEvent 非互換                     | `.claude/rules/06-known-pitfalls.md#P39`                                                                                                  | テスト環境の制約                   |
| P40 テスト実行ディレクトリ依存                        | `.claude/rules/06-known-pitfalls.md#P40`                                                                                                  | モノレポでの cd 必須               |
| TASK-10A-G 成果物                                     | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-045-task-10a-g-lifecycle-test-hardening/` | 発見元タスクの全成果物             |

---

## 6. 受け入れ基準

### 機能要件

- [ ] `createStoreTestHelper()` が作成されている
- [ ] `resetStore()` で全スライスが初期状態にリセットされる
- [ ] `waitForState()` で非同期状態遷移が型安全に待機できる
- [ ] G2 テスト（21テスト）がヘルパーを使用してリファクタリングされている
- [ ] リファクタリング後も全21テストが PASS

### 検証方法

```bash
# ヘルパーテスト
cd apps/desktop && pnpm vitest run src/renderer/__tests__/helpers/store-test-helper.test.ts

# G2 テスト（リファクタリング後）
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.lifecycle-store.test.ts
```

### 品質要件

- [ ] Line Coverage >= 80%
- [ ] Branch Coverage >= 60%
- [ ] Function Coverage >= 80%
- [ ] 全テスト PASS
- [ ] ESLint エラー / 警告なし
- [ ] TypeScript 型チェックエラーなし

### ドキュメント要件

- [ ] Phase 12 実装ガイド（Part 1: 中学生レベル概念説明 / Part 2: 開発者向け実装詳細）
- [ ] LOGS.md x 2 更新
- [ ] SKILL.md x 2 更新
- [ ] documentation-changelog.md 作成
- [ ] topic-map.md 再生成

---

## 7. 関連タスク

| タスクID                                     | 関係   | 状態   | 説明                                                                  |
| -------------------------------------------- | ------ | ------ | --------------------------------------------------------------------- |
| TASK-10A-G                                   | 発見元 | 進行中 | G2 テスト実装（Store 統合テストのボイラープレートが顕在化した発見元） |
| TASK-10A-F                                   | 関連   | 完了   | ライフサイクル系 API の Store 移行（同様の Store テストパターン）     |
| task-imp-vitest-mock-reset-utility-001       | 関連   | 未実施 | Vitest モック 2段階リセットユーティリティ（resetStore と併用可能）    |
| task-imp-electron-api-mock-contract-sync-001 | 関連   | 未実施 | electronAPI モック契約同期（ヘルパーのモック形状管理と相互補完）      |
