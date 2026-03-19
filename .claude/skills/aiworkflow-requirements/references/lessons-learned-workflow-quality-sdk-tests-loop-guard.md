# Lessons Learned（教訓集） / workflow / quality lessons

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: workflow / quality lessons

## TASK-FIX-11-1: SDK統合テスト有効化

### タスク概要

| 項目       | 内容                                                          |
| ---------- | ------------------------------------------------------------- |
| タスクID   | TASK-FIX-11-1-SDK-TEST-ENABLEMENT                             |
| 目的       | TODOプレースホルダ17件を実テスト化し、SDK統合後の検証を有効化 |
| 完了日     | 2026-02-13                                                    |
| ステータス | **完了**                                                      |

### 苦戦箇所と解決策

#### 1. Phase 12 Step 1-A/1-D の「該当なし」誤判定

| 項目       | 内容                                                                                                     |
| ---------- | -------------------------------------------------------------------------------------------------------- |
| **課題**   | 「テストコードのみ変更」を理由に LOGS/SKILL 更新と index 再生成を初回で省略                              |
| **原因**   | Step 1-A（必須）と Step 2（条件付き）の区別を混同                                                        |
| **解決策** | Step 1-A〜1-Dを必須チェックとして再実行し、`LOGS.md x2`・`SKILL.md x2`・`generate-index.js` 実行を固定化 |
| **教訓**   | 検証系・テスト系タスクでも Step 1-A/1-D は常に必須                                                       |

#### 2. 未タスク検出の raw 結果をそのまま採用

| 項目       | 内容                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------- |
| **課題**   | `detect-unassigned-tasks.js` で 51件検出されたが、多くが仕様書本文中の説明用 TODO だった |
| **原因**   | 実装ディレクトリとドキュメントディレクトリを同一ルールで評価                             |
| **解決策** | 2段階判定を採用（1: 実装ディレクトリ優先スキャン、2: raw検出の手動精査）                 |
| **教訓**   | raw件数は候補であり、未タスク確定件数とは分離して記録する                                |

#### 3. Vitest モック初期化の挙動差異

| 項目       | 内容                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------- |
| **課題**   | 一部テストで `vi.clearAllMocks()` 後も前テストのモック実装が残存                            |
| **原因**   | `clearAllMocks` は call history を消すのみで実装は保持される                                |
| **解決策** | `beforeEach` で `mockResolvedValue` を毎回再設定し、失敗系は `mockRejectedValueOnce` を使用 |
| **教訓**   | 「履歴クリア」と「実装リセット」は別操作として扱う                                          |

**Vitest モックリセット API 比較**:

| API                    | 呼び出し履歴 | mockImplementation | mockReturnValue | mockResolvedValue |
| ---------------------- | :----------: | :----------------: | :-------------: | :---------------: |
| `vi.clearAllMocks()`   |    クリア    |        保持        |      保持       |       保持        |
| `vi.resetAllMocks()`   |    クリア    |      リセット      |    リセット     |     リセット      |
| `vi.restoreAllMocks()` |    クリア    |      元に戻す      |    元に戻す     |     元に戻す      |

**SDK テスト有効化で発生した具体例**:

```typescript
// ❌ 問題パターン: mockRejectedValue が後続テストに漏洩
describe("エラーハンドリング", () => {
  it("SDK障害をハンドリングする", async () => {
    mockAgentAPI.query.mockRejectedValue(new Error("SDK call failed"));
    // テスト実行...
  });
  // ↑ mockRejectedValue は "永続的" なため、次のテストにも影響する

  it("正常系テスト", async () => {
    // ← mockRejectedValue が残存し、このテストも失敗する
  });
});

// ✅ 解決パターン: "Once" サフィックスで1回限りのモック
describe("エラーハンドリング", () => {
  it("SDK障害をハンドリングする", async () => {
    mockAgentAPI.query.mockRejectedValueOnce(new Error("SDK call failed"));
    // テスト実行...
  });
  // ↑ "Once" なので消費後に元の実装に戻る

  it("正常系テスト", async () => {
    // ← 前テストの影響を受けない
  });
});
```

#### 3b. モジュールレベルモックによるタイムアウトテスト不可問題

| 項目       | 内容                                                                                                                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **課題**   | `vi.mock("../agent-client")` でモジュール全体をモック化すると、内部の `setTimeout` + `AbortController` によるタイムアウトロジックが消失し、`vi.advanceTimersByTimeAsync(30000)` でタイムアウトを再現できない |
| **原因**   | `vi.mock()` はモジュール内の全エクスポートをモック関数に置換するため、元の実装内部のタイマーロジックは実行されない                                                                                           |
| **解決策** | タイムアウトを内部ロジックで再現するのではなく、`mockRejectedValueOnce(new Error("Request timeout"))` で直接エラーを注入する                                                                                 |
| **教訓**   | モジュールレベルモックでは「内部実装の再現」ではなく「外部インターフェースでのシミュレーション」が正しいアプローチ                                                                                           |

**コード例**:

```typescript
// ❌ 失敗パターン: モジュールモック下でタイマーを進めてもタイムアウトしない
vi.useFakeTimers();
const queryPromise = skillExecutor.execute(request, metadata);
await vi.advanceTimersByTimeAsync(30000);
// → モジュール内のsetTimeoutが存在しないため、何も起きない

// ✅ 成功パターン: エラーを直接注入
mockAgentAPI.query.mockImplementation(
  () =>
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timeout")), 30000);
    }),
);
vi.useFakeTimers();
const queryPromise = skillExecutor.execute(request, metadata);
await vi.advanceTimersByTimeAsync(30000);
// → モック内のsetTimeoutがfake timerで制御され、タイムアウトエラーが発生
```

#### 3c. beforeEach での明示的モック再設定パターン

| 項目       | 内容                                                                                                                              |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | `vi.clearAllMocks()` だけでは `mockImplementation()` で設定した「応答しない Promise」が残り続け、後続の正常系テストが全て失敗する |
| **原因**   | `clearAllMocks` は呼び出し回数（`.mock.calls`）をリセットするのみで、`mockImplementation()` の関数置換はリセットしない            |
| **解決策** | `beforeEach` で `mockAgentAPI.query.mockResolvedValue(...)` を毎回呼び出し、「デフォルト正常応答」を明示的に再設定する            |
| **教訓**   | テスト基盤の `beforeEach` は「呼び出し履歴クリア」と「デフォルト応答再設定」の2段構えで設計する                                   |

**推奨パターン**:

```typescript
beforeEach(() => {
  // 段階1: 呼び出し履歴をクリア
  vi.clearAllMocks();

  // 段階2: デフォルト応答を明示的に再設定
  mockAgentAPI.query.mockResolvedValue({
    response: "default mock response",
    tokenUsage: { input: 100, output: 50 },
  });

  // 段階3: 他のモックのデフォルトも設定
  mockCreate.mockResolvedValue({
    content: [{ type: "text", text: "response" }],
  });
});
```

### 関連未タスク

| タスクID                               | タスク名                                                    | 優先度 | 仕様書                                                                                                                                                                |
| -------------------------------------- | ----------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| task-imp-vitest-mock-reset-utility-001 | Vitest モック2段階リセットユーティリティ共通化              | 中     | [`docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-imp-vitest-mock-reset-utility-001.md`](../../../docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-imp-vitest-mock-reset-utility-001.md) |
| task-ref-vitest-module-mock-audit-001  | Vitest モジュールレベルモック監査・使い分けガイドライン策定 | 低     | [`docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-ref-vitest-module-mock-audit-001.md`](../../../docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-ref-vitest-module-mock-audit-001.md)   |

---

## UT-STORE-HOOKS-TEST-REFACTOR-001: renderHookパターン移行

### タスク概要

| 項目       | 内容                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------ |
| タスクID   | UT-STORE-HOOKS-TEST-REFACTOR-001                                                                                   |
| 目的       | Store Hooksテストを getState() パターンから renderHook パターンに移行し、Reactサブスクリプション経由のテストを実現 |
| 完了日     | 2026-02-12                                                                                                         |
| ステータス | **完了**                                                                                                           |

### 実装内容

| 変更内容                       | ファイル                                                              | 説明                                             |
| ------------------------------ | --------------------------------------------------------------------- | ------------------------------------------------ |
| AuthModeテストのrenderHook移行 | `apps/desktop/src/renderer/store/__tests__/authModeSelectors.test.ts` | getState()パターンをrenderHook + act()に全面移行 |
| LLMテストのrenderHook移行      | `apps/desktop/src/renderer/store/__tests__/llmSelectors.test.ts`      | getState()パターンをrenderHook + act()に全面移行 |
| AgentテストのrenderHook移行    | `apps/desktop/src/renderer/store/__tests__/agentSelectors.test.ts`    | getState()パターンをrenderHook + act()に全面移行 |

### 苦戦箇所と解決策

#### 1. renderHookへの移行効果

| 項目       | 内容                                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------------------- |
| **課題**   | getState()パターンはZustandの内部APIを直接テストするため、Reactサブスクリプション経由の実際の動作と乖離する         |
| **原因**   | getState()はReactの再レンダリングサイクルを経由しないため、コンポーネントでの使用時と異なる結果を返す可能性がある   |
| **解決策** | renderHookパターンにより、コンポーネントが実際に使用する経路（Reactサブスクリプション）でテスト                     |
| **教訓**   | Zustand Hookのテストでは、getState()直接呼び出しではなく、renderHookを通じてReactサブスクリプション経路を検証すべき |

---

#### 2. テストヘルパー関数の共通化

| 項目       | 内容                                                                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | 3つのテストファイルで同一のヘルパー関数（`assertNoInfiniteLoop()`, `assertStableReference()`, `assertNoUnrelatedRerender()`）が重複定義されている |
| **原因**   | 各テストファイルを独立に作成した際に、共通ヘルパーの抽出を後回しにした                                                                            |
| **解決策** | 3つのヘルパー関数を各ファイル内に定義。将来の共通化候補としてタスク化                                                                             |
| **教訓**   | テストヘルパーが3ファイル以上で重複する場合は、共通テストユーティリティファイルへの抽出を検討すべき                                               |

**テストヘルパー関数一覧**:

| ヘルパー関数                  | 目的                         | 検証内容                                               |
| ----------------------------- | ---------------------------- | ------------------------------------------------------ |
| `assertNoInfiniteLoop()`      | 無限ループ防止検証           | renderCountが閾値（通常5回）以下であることを確認       |
| `assertStableReference()`     | 参照安定性検証               | 状態変更後もアクション関数の参照が同一であることを確認 |
| `assertNoUnrelatedRerender()` | 不要な再レンダリング防止検証 | 無関係な状態変更で再レンダリングが発生しないことを確認 |

---

#### 3. electronAPIモックの統一

| 項目       | 内容                                                                                                                  |
| ---------- | --------------------------------------------------------------------------------------------------------------------- |
| **課題**   | authMode、LLM、skillの3セクションでelectronAPIモックの構造が異なり、テスト間で不整合が発生                            |
| **原因**   | 各テストファイルで個別にwindow.electronAPIモックを定義していたため、必要なプロパティの漏れが発生                      |
| **解決策** | `createMockElectronAPI()` パターンで、authMode + llm + skill の3セクション全体を統一的にモック                        |
| **教訓**   | electronAPIモックはテストファイルごとに部分的に定義するのではなく、全セクションを含む統一モックファクトリを使用すべき |

---

#### 4. 移行中のテスト数増加

| 項目       | 内容                                                                                                                                                                                               |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | テスト数が大幅に増加（getState()パターン48件 → renderHookパターン114件 + export検証23件）                                                                                                          |
| **原因**   | renderHookパターンでは参照安定性・無限ループ防止・不要再レンダリング防止のテストカテゴリ（CAT-01〜CAT-09）を体系的に追加した                                                                       |
| **解決策** | テストカテゴリの体系的分類により、網羅性を確保しつつテスト構造を可読に維持                                                                                                                         |
| **教訓**   | テスト数の増加自体は問題ではなく、カテゴリ分類（CAT-01: 初期値, CAT-02: アクション実行, CAT-03: 参照安定性, CAT-04: 無限ループ防止, CAT-05: 不要再レンダリング防止等）で構造化されていることが重要 |

---

#### 5. Phase 12 Step 2 の「該当なし」誤判定

| 項目       | 内容                                                                                                                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **課題**   | テストリファクタリングのため Step 2（システム仕様更新）を「該当なし」と判定したが、後から6ファイルの仕様書更新が必要になった                                                                                       |
| **原因**   | 「テストのみの変更 = システム仕様に影響なし」と短絡的に判断した。しかし renderHook パターンへの移行はテスト戦略・テスト方法論の変更であり、開発ガイドラインや実装パターン仕様書に記録すべき内容だった              |
| **解決策** | Phase 12 Step 2 の判定基準を拡張し、以下の変更は「該当あり」として仕様書更新を行う: (1) テスト方法論・戦略の変更（テストパターン移行等） (2) テストヘルパー・ユーティリティの新規追加 (3) テストカテゴリ体系の変更 |
| **教訓**   | テストのみの変更でも、テスト方法論・戦略の変更はシステム仕様書の更新対象となる。「プロダクションコード変更なし = 仕様書更新不要」という判断は誤り                                                                  |

**更新が必要だった仕様書一覧**:

| 仕様書                      | 更新内容                                                   |
| --------------------------- | ---------------------------------------------------------- |
| `development-guidelines.md` | Zustand Hookテスト戦略（renderHookパターン）セクション追加 |
| `patterns.md`               | Store Hookテスト実装パターン（renderHook方式）追加         |
| `arch-state-management.md`  | テスト戦略セクション更新                                   |
| `task-workflow.md`          | 完了タスクセクション追加、残課題テーブル更新               |
| `LOGS.md`（2ファイル）      | タスク完了記録追加                                         |

**Phase 12 Step 2 判定フローチャート**:

| 変更種別                                       | Step 2 判定  | 理由                                     |
| ---------------------------------------------- | ------------ | ---------------------------------------- |
| プロダクションコード変更                       | 該当あり     | アーキテクチャ・インターフェースへの影響 |
| テスト方法論・戦略変更                         | **該当あり** | 開発ガイドライン・パターン仕様書への影響 |
| テストケース追加（既存パターン）               | 該当なし     | 既存のテスト方法論内の変更               |
| テストコードのリファクタリング（パターン不変） | 該当なし     | 構造変更のみ、方法論は不変               |

---

#### 6. 実装ガイドのテストカテゴリテーブル不整合

| 項目       | 内容                                                                                                                                                                         |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | Phase 5 で作成した実装ガイドのテストカテゴリテーブルが、Phase 6 のテスト拡充後に更新されなかった                                                                             |
| **原因**   | Phase 6 でテストを大幅に拡充（CAT-07 が 3 テストから 19 テストに増加、CAT-10〜CAT-16 が新規追加）したが、実装ガイドのテーブルを再確認しなかった                              |
| **解決策** | Phase 6 完了後に実装ガイドのテストカテゴリテーブルを再確認し、テスト数とカテゴリを最新の実測値に更新する                                                                     |
| **教訓**   | Phase 6（テスト拡充）完了後は、必ず実装ガイドのテストカテゴリテーブルを再確認する。テーブルは Phase 5 時点のスナップショットであり、Phase 6 以降の変更が自動反映されないため |

**不整合の具体例**:

| カテゴリ             | Phase 5 時点の記載 | Phase 6 後の実測値 | 差異                         |
| -------------------- | ------------------ | ------------------ | ---------------------------- |
| CAT-07（export検証） | 3テスト            | 19テスト           | +16テスト（大幅増）          |
| CAT-10〜CAT-16       | 未記載             | 新規追加           | Phase 6 で新設されたカテゴリ |

**再発防止策**:

| Phase                       | テストカテゴリテーブル確認 | 理由                               |
| --------------------------- | -------------------------- | ---------------------------------- |
| Phase 5（実装）             | 初版作成                   | 実装時点のテスト構造を記録         |
| Phase 6（テスト拡充）       | **必須更新**               | テスト数・カテゴリが変化するため   |
| Phase 7（カバレッジ確認）   | 確認推奨                   | カバレッジ不足でテスト追加した場合 |
| Phase 8（リファクタリング） | 確認推奨                   | テスト統合・分割した場合           |

---

### 成果物

| 成果物                 | パス                                                                  |
| ---------------------- | --------------------------------------------------------------------- |
| AuthModeセレクタテスト | `apps/desktop/src/renderer/store/__tests__/authModeSelectors.test.ts` |
| LLMセレクタテスト      | `apps/desktop/src/renderer/store/__tests__/llmSelectors.test.ts`      |
| Agentセレクタテスト    | `apps/desktop/src/renderer/store/__tests__/agentSelectors.test.ts`    |

### 関連ドキュメント更新

| ドキュメント                                              | 更新内容                                                   |
| --------------------------------------------------------- | ---------------------------------------------------------- |
| [development-guidelines.md](./development-guidelines.md)  | Zustand Hookテスト戦略（renderHookパターン）セクション追加 |
| [patterns.md](../../skill-creator/references/patterns.md) | Store Hookテスト実装パターン（renderHook方式）追加         |

---

## UT-FIX-AGENTVIEW-INFINITE-LOOP-001: AgentView無限ループ修正テスト

### タスク概要

| 項目       | 内容                                                      |
| ---------- | --------------------------------------------------------- |
| タスクID   | UT-FIX-AGENTVIEW-INFINITE-LOOP-001                        |
| 目的       | AgentViewコンポーネントの個別セレクタHook移行とテスト作成 |
| 完了日     | 2026-02-12                                                |
| ステータス | **完了**                                                  |

### 1. happy-dom環境でのuserEvent非互換

| 項目     | 内容                                         |
| -------- | -------------------------------------------- |
| 難易度   | 高                                           |
| 影響範囲 | テストファイル全体（53テスト中49テスト失敗） |
| 解決時間 | 中程度（原因特定に時間を要した）             |

**問題**: Phase 6で追加されたテストが`@testing-library/user-event`の`userEvent.setup()`を使用しており、happy-dom環境でSymbol操作エラーが発生。

```
TypeError: Symbol(Node prepared with document state workarounds)
```

**原因分析**:

- プロジェクトのデフォルトテスト環境は`happy-dom`（`vitest.config.ts`で設定）
- `userEvent.setup()`はjsdomのDOM APIに依存するSymbol操作を内部的に実行
- happy-domはこのSymbol操作を完全にはサポートしていない

**解決策**: `userEvent`を全て`fireEvent`に置換

```typescript
// ❌ happy-domで失敗するパターン
const { userEvent } = await import("@testing-library/user-event");
const user = userEvent.setup();
await user.click(element);

// ✅ happy-domで安定するパターン
import { fireEvent } from "@testing-library/react";
fireEvent.click(element);

// ✅ 非同期ハンドラの場合（Promise microtask flush）
import { act } from "@testing-library/react";
await act(async () => {
  fireEvent.click(element);
});
```

**再発防止**:

- happy-dom環境では`fireEvent`を使用する（プロジェクト標準）
- `userEvent`が必要な場合は`// @vitest-environment jsdom`ディレクティブを追加
- テスト追加時は必ずCI/ローカルで実行確認

### 2. テスト実行ディレクトリ依存問題

| 項目     | 内容                           |
| -------- | ------------------------------ |
| 難易度   | 中                             |
| 影響範囲 | テスト実行全体                 |
| 解決時間 | 短い（パターン認識後は即解決） |

**問題**: プロジェクトルートから`pnpm vitest run apps/desktop/src/...`を実行すると、`document is not defined`エラーが発生。

**原因分析**:

- プロジェクトルートの`vitest.config.ts`と`apps/desktop/vitest.config.ts`は別ファイル
- ルートから実行すると`apps/desktop/vitest.config.ts`の`environment: "happy-dom"`と`setupFiles: ["./src/test/setup.ts"]`が読み込まれない
- 結果、テスト環境がデフォルト（node）となり、DOM APIが利用不可

**解決策**:

```bash
# ❌ プロジェクトルートから実行（失敗）
pnpm vitest run apps/desktop/src/renderer/views/AgentView/__tests__/AgentView.test.tsx

# ✅ apps/desktop/から実行（成功）
cd apps/desktop && pnpm vitest run src/renderer/views/AgentView/__tests__/AgentView.test.tsx

# ✅ pnpm --filter を使用（成功）
pnpm --filter @repo/desktop exec vitest run src/renderer/views/AgentView/__tests__/AgentView.test.tsx
```

**再発防止**: `apps/desktop/`配下のテストは必ず同ディレクトリから実行

### 3. jsdom切り替え時の副作用

| 項目     | 内容                   |
| -------- | ---------------------- |
| 難易度   | 中                     |
| 影響範囲 | テストファイル全体     |
| 解決時間 | 短い（切り戻しで対応） |

**問題**: happy-domでの`userEvent`エラーを回避するため`// @vitest-environment jsdom`ディレクティブを追加したところ、別の問題が発生。

**症状**:

1. `toBeInTheDocument()`マッチャーが動作しない
2. DOM要素が重複して表示される（`getAllByRole`で期待以上の要素が返る）

**原因分析**:

- jsdom環境では`setup.ts`のロード順序が異なり、`@testing-library/jest-dom`の拡張が正しく適用されない場合がある
- jsdom独自のDOM実装による要素重複

**解決策**: jsdomへの切り替えを断念し、happy-dom + fireEventの組み合わせに統一

**教訓**: テスト環境の切り替えは、単一テストの問題解決を目的としない。環境を変更する場合は、テストファイル全体への影響を事前に検証する。

---

