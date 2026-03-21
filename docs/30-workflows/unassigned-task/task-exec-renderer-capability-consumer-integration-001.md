# UT-EXEC-03 Renderer の capability selector/hook の Consumer 統合 - タスク指示書

## メタ情報

```yaml
issue_number: 1416
```

## メタ情報

| 項目         | 内容                                                                                                                                          |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID     | UT-EXEC-03                                                                                                                                    |
| タスク名     | Renderer の capability selector/hook の Consumer 統合                                                                                         |
| 分類         | 実装                                                                                                                                          |
| 対象機能     | Renderer 層の capability selector / hook および Settings / Chat / Workspace surface への接続                                                  |
| 優先度       | 中                                                                                                                                            |
| 見積もり規模 | 中規模                                                                                                                                        |
| ステータス   | 未実施                                                                                                                                        |
| 発見元       | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 Phase 2 design-summary.md Concern B/C ownership / contract-matrix Renderer 消費境界 |
| 発見日       | 2026-03-20                                                                                                                                    |
| 担当         | Task03（Settings/Shell）/ Task04（Chat/Workspace）への引き継ぎ                                                                                |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001（Task01）で `packages/shared/src/types/execution-capability.ts` に以下の pure function 群が定義された:

- `resolveCapability()` - Concern A: 入力条件から `AccessCapability` を導出
- `resolveUiState()` - Concern B: capability から `UiState`（ready / blocked / unavailable）を導出
- `resolveCtaContract()` - Concern C: capability x uiState から CTA 契約（primary + secondary）を導出

Phase 2 設計サマリーの Concern Table では、Concern B の ownership は「Renderer selector / hook」、Concern C の ownership は「CTA コンポーネント」と定義されている。しかし、現時点では `chatSlice.ts` が `AccessCapability` 型を `@repo/shared/types/execution-capability` から re-export しているだけで、**actual consumer（UI コンポーネント）への接続は未実施**である。

### 1.2 問題点・課題

1. **Renderer 側に capability → uiState → CTA 契約を導出する selector / hook が存在しない**: `resolveUiState()` と `resolveCtaContract()` は pure function として定義済みだが、Zustand Store の state から capability を取得し、これらの関数を呼び出す selector / hook がない
2. **chatSlice.ts の re-export は型のみ**: `export type { AccessCapability }` は型情報の re-export であり、ランタイムで capability 値を Store から取得して UI 状態を導出する仕組みがない
3. **各 surface（Settings / Chat / Workspace）が個別に capability 判定を実装するリスク**: Concern A の禁止事項「他ファイルでの capability 再計算」に反する実装が分散する可能性がある

### 1.3 放置した場合の影響

1. **Concern B/C の ownership 違反**: 設計上 Renderer selector / hook が担うべき uiState / CTA 導出が、各コンポーネントで個別に分散実装される。保守コストが増大し、一貫性が崩れる
2. **P62（DEFAULT_CONFIG への暗黙 fallback）の再発**: capability が `none` の場合に各 surface が個別に fallback ロジックを実装すると、意図しない AI モデルでのリクエスト送信や課金が発生する
3. **P31/P48 パターンの再発**: selector 設計を誤ると Zustand Store Hooks 無限ループが発生し、Settings / Chat 画面が無限再レンダーに陥る

## 2. 何を達成するか（What）

### 2.1 目的

Renderer 層に `resolveUiState()` / `resolveCtaContract()` を呼び出す Zustand selector / hook を実装し、Settings / Chat / Workspace の各 surface で統一的に capability 状態と CTA 契約を消費できるようにする。

### 2.2 最終ゴール

1. Zustand Store の state から capability を取得し、`resolveUiState()` を呼び出して `UiState` / `blockedReason` / `blockedAction` を返す個別セレクタが存在する
2. 同様に `resolveCtaContract()` を呼び出して `CtaContract` を返す個別セレクタが存在する
3. Settings / Chat / Workspace の各 surface コンポーネントが上記セレクタを使用して、一貫した UI 状態と CTA を表示する
4. `assertNoSilentFallback()` / `assertNoPrimaryCta()` ガード関数がセレクタ内で適用されている

### 2.3 スコープ

#### 含むもの

- capability selector / hook の設計・実装（Zustand 個別セレクタ）
- `resolveUiState()` / `resolveCtaContract()` を消費する hook の設計・実装
- Settings surface への接続実装
- Chat surface への接続実装
- Workspace surface への接続実装
- 上記 selector / hook のユニットテスト
- コンポーネント統合テスト

#### 含まないもの

- `resolveCapability()` / `resolveUiState()` / `resolveCtaContract()` の pure function 本体の変更（Task01 で完了済み）
- Main Process 側の capability 判定ロジックの変更
- CTA ボタンの視覚デザイン（Atomic Design atoms / molecules の新規作成）
- E2E テスト

### 2.4 成果物

| #   | 成果物                         | ファイルパス（想定）                                                                       |
| --- | ------------------------------ | ------------------------------------------------------------------------------------------ |
| 1   | capability selector / hook     | `apps/desktop/src/renderer/store/selectors/executionCapabilitySelectors.ts`                |
| 2   | CTA 契約 hook                  | `apps/desktop/src/renderer/hooks/useCtaContract.ts`（またはセレクタファイルに統合）        |
| 3   | Settings surface 接続          | `apps/desktop/src/renderer/components/settings/` 配下の該当コンポーネント                  |
| 4   | Chat surface 接続              | `apps/desktop/src/renderer/components/chat/` 配下の該当コンポーネント                      |
| 5   | Workspace surface 接続         | `apps/desktop/src/renderer/components/workspace/` 配下の該当コンポーネント                 |
| 6   | selector / hook ユニットテスト | `apps/desktop/src/renderer/store/selectors/__tests__/executionCapabilitySelectors.test.ts` |
| 7   | コンポーネント統合テスト       | 各 surface の `__tests__/` 配下                                                            |

## 3. どのように実行するか（How）

### 3.1 前提条件

1. TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 が完了し、`packages/shared/src/types/execution-capability.ts` がマージ済みであること
2. `@repo/shared` パッケージがビルド済みで、`apps/desktop` から `@repo/shared/types/execution-capability` を import 可能であること
3. `AuthModeStatus` 型に `capability?: AccessCapability` / `uiState?: UiState` / `blockedReason?: string` / `blockedAction?: { label: string; targetRoute: string }` フィールドが追加済みであること（`packages/shared/src/types/auth-mode.ts`）

### 3.2 依存タスク

| タスクID                                                  | 依存内容                                                  | ステータス |
| --------------------------------------------------------- | --------------------------------------------------------- | ---------- |
| TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 | execution-capability.ts の型定義と pure function          | 完了       |
| Task02（Main Process RuntimePolicyResolver）              | capability 値を Store に反映する Main → Renderer 伝搬経路 | 未実施     |

### 3.3 必要な知識

- Zustand Store のセレクタ設計（個別セレクタ / `useShallow` の使い分け）
- `resolveUiState()` / `resolveCtaContract()` の overload パターン
- React コンポーネントと Zustand セレクタの接続パターン
- `execution-capability.ts` の Concern A/B/C 分離アーキテクチャ

### 3.4 推奨アプローチ

#### Step 1: selector 設計

Zustand Store の `authMode` slice から `capability` を取得し、`resolveUiState()` / `resolveCtaContract()` を呼び出す個別セレクタを設計する。

```typescript
// 推奨パターン: 個別セレクタ（P31 対策）
import { useAppStore } from "../store";
import {
  resolveUiState,
  resolveCtaContract,
  assertNoSilentFallback,
  type CapabilityContext,
  type UiStateResult,
  type CtaContract,
  type CtaInput,
} from "@repo/shared/types/execution-capability";

// capability 取得セレクタ（安定参照）
export const useCapability = () =>
  useAppStore((state) => state.authMode.capability ?? "none");

// uiState 導出セレクタ（CapabilityContext 版を推奨）
export const useUiStateResult = (): UiStateResult => {
  const capability = useCapability();
  const isConnectionAvailable = useAppStore(
    (state) => state.connection.isAvailable,
  );
  const isTerminalAvailable = useAppStore(
    (state) => state.terminal.isAvailable,
  );

  const context: CapabilityContext = {
    capability,
    isConnectionAvailable,
    isTerminalAvailable,
    hasResolutionAction: capability === "none",
  };

  return resolveUiState(context);
};

// CTA 契約導出セレクタ
export const useCtaContract = (): CtaContract => {
  const capability = useCapability();
  const { uiState, blockedAction } = useUiStateResult();

  const input: CtaInput = { capability, uiState, blockedAction };
  return resolveCtaContract(input);
};
```

**注意**: 上記は設計指針であり、実際の Store 構造（slice 名、state パス）は実装時に確認すること。

#### Step 2: ガード関数の統合

セレクタ内で `assertNoSilentFallback()` を呼び出し、capability が `none` のとき暗黙遷移を防止する。`assertNoPrimaryCta()` は CTA コンポーネント側で呼び出す。

#### Step 3: 各 surface への接続

Settings / Chat / Workspace の各コンポーネントで `useCapability()` / `useUiStateResult()` / `useCtaContract()` を使用し、既存の個別判定ロジックを置き換える。

#### Step 4: テスト作成

selector / hook のユニットテストと、各 surface のコンポーネント統合テストを作成する。

## 4. 実行手順

### Phase 1: 要件定義

1. 現行の Settings / Chat / Workspace 各 surface で capability 判定がどのように行われているか調査する
   - `grep -rn "AccessCapability\|capability\|blocked\|handoff" apps/desktop/src/renderer/`
2. 各 surface が必要とする情報（uiState / blockedReason / blockedAction / CTA ラベル / CTA アクション）を整理する
3. 受入基準を定義する

### Phase 2: 設計

1. selector / hook のインターフェースを設計する
2. 各 surface への接続ポイント（コンポーネント名、props / state 接続箇所）を特定する
3. Store 構造（`authMode` slice の state パス）を確認し、selector の入力元を確定する
4. P31/P48 対策: 個別セレクタ設計を採用し、`useShallow` の必要箇所を明示する

### Phase 3: 設計レビュー

1. Concern B/C の ownership が Renderer selector / hook に閉じていることを確認
2. Concern A の禁止事項「他ファイルでの capability 再計算」に違反していないことを確認
3. P31 対策: 合成 Hook を使用していないこと、個別セレクタで設計されていることを確認

### Phase 4: テスト作成

1. selector / hook のユニットテスト
   - `useCapability()` が Store の `authMode.capability` を正しく取得すること
   - `useUiStateResult()` が capability に応じて正しい `UiStateResult` を返すこと
   - `useCtaContract()` が capability x uiState に応じて正しい `CtaContract` を返すこと
   - capability が `none` のとき `assertNoSilentFallback()` が例外を送出すること
2. コンポーネント統合テスト
   - Settings surface: capability 変化に応じた UI 状態遷移
   - Chat surface: blocked 状態での CTA 表示、ready 状態での CTA 表示
   - Workspace surface: unavailable 状態で primary CTA が非表示であること
3. テスト環境: happy-dom（P39 準拠で `fireEvent` を使用、`userEvent` 禁止）

### Phase 5: 実装

1. `executionCapabilitySelectors.ts` を作成し、個別セレクタを実装する
2. 各 surface コンポーネントにセレクタを接続する
3. 既存の個別判定ロジック（capability 再計算箇所）を発見したら、セレクタ呼び出しに置き換える

### Phase 6-7: テスト拡充・カバレッジ確認

1. 境界値テスト: capability 4 状態 x uiState 3 状態の全組み合わせ（12パターン）
2. `assertNoSilentFallback()` / `assertNoPrimaryCta()` のガード関数テスト
3. カバレッジ基準: Line 80%以上、Branch 60%以上、Function 80%以上

### Phase 8: リファクタリング

1. 重複コードの抽出
2. セレクタの命名統一

### Phase 9: 品質検証

1. `pnpm lint`
2. `pnpm typecheck`
3. 全テスト実行

### Phase 10: 最終レビュー

1. Concern B/C ownership が Renderer 層に閉じていること
2. P31/P48/P62 対策が適用されていること
3. 各 surface で統一された selector / hook が使用されていること

### Phase 11: 手動テスト

1. Settings 画面: API key あり / なし での UI 状態切り替え
2. Chat 画面: capability 変化に応じた CTA ボタン表示
3. Workspace 画面: unavailable 状態で primary CTA が非表示

### Phase 12: ドキュメント

1. implementation-guide.md の作成
2. システム仕様書の更新
3. documentation-changelog.md の作成
4. 未タスク検出

### Phase 13: 完了

1. 成果物最終確認
2. PR 準備

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `useCapability()` セレクタが Store から capability を取得できる
- [ ] `useUiStateResult()` セレクタが `resolveUiState()` を呼び出して正しい `UiStateResult` を返す
- [ ] `useCtaContract()` セレクタが `resolveCtaContract()` を呼び出して正しい `CtaContract` を返す
- [ ] Settings surface が selector / hook を使用して capability に応じた UI を表示する
- [ ] Chat surface が selector / hook を使用して capability に応じた CTA を表示する
- [ ] Workspace surface が selector / hook を使用して capability に応じた CTA を表示する
- [ ] capability が `none` のとき `assertNoSilentFallback()` が暗黙遷移を防止する
- [ ] uiState が `unavailable` のとき primary CTA が DOM に含まれない

### 品質要件

- [ ] Line Coverage 80% 以上
- [ ] Branch Coverage 60% 以上
- [ ] Function Coverage 80% 以上
- [ ] `pnpm lint` が PASS
- [ ] `pnpm typecheck` が PASS
- [ ] 全テストが PASS
- [ ] P31 対策: 個別セレクタのみ使用（合成 Hook 未使用）
- [ ] P48 対策: non-null assertion (`!`) 未使用、実行時型検証で代替
- [ ] P62 対策: DEFAULT_CONFIG への暗黙 fallback なし

### ドキュメント要件

- [ ] implementation-guide.md 作成
- [ ] documentation-changelog.md 作成
- [ ] LOGS.md 2ファイル更新（aiworkflow-requirements + task-specification-creator）
- [ ] SKILL.md 変更履歴更新
- [ ] topic-map.md 再生成

## 6. 検証方法

### ユニットテスト

```bash
cd apps/desktop && pnpm vitest run src/renderer/store/selectors/__tests__/executionCapabilitySelectors.test.ts
```

### コンポーネント統合テスト

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/settings/__tests__/
cd apps/desktop && pnpm vitest run src/renderer/components/chat/__tests__/
cd apps/desktop && pnpm vitest run src/renderer/components/workspace/__tests__/
```

### 全テスト

```bash
cd apps/desktop && pnpm vitest run
```

### 型チェック

```bash
pnpm typecheck
```

### capability 4 状態 x uiState 3 状態の全組み合わせ検証マトリクス

| capability        | uiState     | primary CTA      | secondary CTA      | 検証対象 surface          |
| ----------------- | ----------- | ---------------- | ------------------ | ------------------------- |
| integratedRuntime | ready       | AI で実行        | 設定を開く         | Chat, Workspace           |
| terminalSurface   | ready       | ターミナルで実行 | コマンドをコピー   | Chat, Workspace           |
| both              | ready       | AI で実行        | ターミナルで実行   | Chat, Workspace           |
| none              | blocked     | 設定を開く       | ヘルプを表示       | Settings, Chat, Workspace |
| none              | unavailable | (null / 非表示)  | セットアップガイド | Settings, Chat, Workspace |

## 7. リスクと対策

| #   | リスク                                             | 影響度 | 対策                                                                                                    |
| --- | -------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------- |
| 1   | P31: Zustand 合成 Hook 無限ループ                  | 高     | 個別セレクタ（`useCapability()` 等）で設計。`useEffect` 依存配列に合成 Hook の戻り値関数を含めない      |
| 2   | P48: useShallow 未適用による派生セレクタ無限ループ | 高     | `.filter()` / `.map()` で配列を返すセレクタには `useShallow` を必ず適用                                 |
| 3   | P62: DEFAULT_CONFIG への暗黙 fallback              | 高     | `assertNoSilentFallback()` をセレクタ内で呼び出し、capability `none` 時の暗黙遷移を禁止                 |
| 4   | P46: HTMLAttributes Props 型衝突                   | 中     | CTA ボタンコンポーネントで `content` 等の HTML 標準属性と衝突する場合は `Omit<>` で除外                 |
| 5   | P39: happy-dom 環境での userEvent 非互換           | 中     | テストでは `fireEvent` を使用。非同期ハンドラは `await act(async () => { fireEvent.click(el) })` で包む |
| 6   | P40: テスト実行ディレクトリ依存                    | 中     | `cd apps/desktop && pnpm vitest run` で実行。プロジェクトルートからの実行は禁止                         |
| 7   | Store 構造の変更（Task02 との競合）                | 中     | Task02（RuntimePolicyResolver）の Store 反映方式を事前確認し、selector の入力元を合意してから実装開始   |
| 8   | chatSlice.ts re-export パターンのランタイム値不在  | 低     | selector 内で pure function を呼び出す設計を採用。型のみの re-export に依存しない                       |

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                                                                                                           | 内容                                          |
| ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `packages/shared/src/types/execution-capability.ts`                                                                    | Concern A/B/C の型定義と pure function        |
| `packages/shared/src/types/auth-mode.ts`                                                                               | AuthModeStatus 型の capability 拡張フィールド |
| `apps/desktop/src/renderer/store/slices/chatSlice.ts`                                                                  | AccessCapability の re-export（現状）         |
| `docs/30-workflows/step-01-seq-task-01-execution-responsibility-contract-foundation/outputs/phase-2/design-summary.md` | Concern Table と ownership 定義               |

### 関連タスク

| タスクID                                                  | 関係                                 |
| --------------------------------------------------------- | ------------------------------------ |
| TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 | 前提タスク（型定義と pure function） |
| Task02（Main Process RuntimePolicyResolver）              | 並行タスク（capability の生成元）    |
| Task03（Settings/Shell）                                  | 本タスクの成果物を消費               |
| Task04（Chat/Workspace）                                  | 本タスクの成果物を消費               |

### 過去の教訓（Pitfall 参照）

| Pitfall | タイトル                                    | 本タスクでの適用箇所               |
| ------- | ------------------------------------------- | ---------------------------------- |
| P31     | Zustand Store Hooks 無限ループ              | selector 設計（個別セレクタ必須）  |
| P39     | happy-dom 環境での userEvent 非互換         | テスト作成（fireEvent 使用）       |
| P40     | テスト実行ディレクトリ依存                  | テスト実行（cd apps/desktop 必須） |
| P46     | HTMLAttributes Props 型衝突                 | CTA ボタンコンポーネント設計       |
| P48     | useShallow 未適用 / non-null assertion 禁止 | 派生セレクタ設計、型安全           |
| P62     | DEFAULT_CONFIG への暗黙 fallback            | assertNoSilentFallback() の適用    |

## 9. 備考

### 実装時の苦戦箇所と教訓

#### 教訓 1: P31/P48 - Zustand Store Hooks 無限ループ / useShallow

capability selector を Zustand で実装する際、以下の2つの無限ループパターンに注意が必要。

**パターン A（P31）**: 合成 Hook（`useAuthModeStore()` 等）の戻り値関数を `useEffect` 依存配列に含めると、毎回新しいオブジェクトが返されるため無限ループが発生する。**必ず個別セレクタ（`useCapability()`, `useUiState()` 等）を使用すること**。

```typescript
// 禁止: 合成 Hook の関数を useEffect 依存配列に含める
const { capability } = useAuthModeStore(); // 毎回新しいオブジェクト
useEffect(() => {
  /* ... */
}, [capability]); // 無限ループ

// 推奨: 個別セレクタ
const capability = useCapability(); // 安定参照
useEffect(() => {
  /* ... */
}, [capability]); // 値変更時のみ発火
```

**パターン B（P48）**: `.filter()` / `.map()` で配列を返す派生セレクタは、Zustand の `Object.is` 比較で毎回新しい参照と判定される。`useShallow` を適用しないと `useSyncExternalStore` が無限ループに陥る。

```typescript
// 禁止: useShallow なしの派生セレクタ
export const useAvailableCapabilities = () =>
  useAppStore((state) => CAPABILITY_VALUES.filter((c) => c !== "none"));

// 推奨: useShallow で shallow 比較を適用
import { useShallow } from "zustand/react/shallow";
export const useAvailableCapabilities = () =>
  useAppStore(
    useShallow((state) => CAPABILITY_VALUES.filter((c) => c !== "none")),
  );
```

#### 教訓 2: P48 - non-null assertion 禁止

contextBridge 経由のレスポンスは structured clone の制約により、型定義と実際の shape が乖離する可能性がある。`result.data!.providers` のような non-null assertion は TypeScript コンパイルを通過するが、ランタイムで `TypeError: Cannot read properties of undefined` が発生するリスクがある。

```typescript
// 禁止: non-null assertion
const capability = authModeStatus!.capability;

// 推奨: optional chaining + fallback
const capability = authModeStatus?.capability ?? "none";
```

#### 教訓 3: resolveUiState の overload パターンの使い分け

`resolveUiState()` には2つの overload が存在する:

1. **CapabilityContext 版**（推奨）: `resolveUiState(context: CapabilityContext): UiStateResult` - blockedReason / blockedAction も返すため、UI 表示に必要な情報が全て揃う
2. **Simple 版**: `resolveUiState(capability: AccessCapability, conditions: { hasCredentialPath: boolean }): UiState` - UiState 値のみ返す。条件分岐が限定的なユーティリティ用途

Renderer コンポーネントから呼ぶ場合は **CapabilityContext 版を使う**こと。Simple 版では blockedReason / blockedAction が取得できず、blocked 状態の UI 表示で追加の情報取得が必要になる。

#### 教訓 4: chatSlice.ts re-export パターンの罠

現状 `chatSlice.ts` は `export type { AccessCapability }` として型のみ re-export している。この パターンでは TypeScript の `import type` によりコンパイル時に消去されるため、**ランタイムでは値が渡らない**。

Zustand selector から `resolveUiState()` / `resolveCtaContract()` を呼ぶ際は、Store の state から capability を取得し、selector 内で pure function を呼び出す設計が推奨される。型の re-export ではなく、関数の import を直接行うこと。

```typescript
// 禁止: chatSlice.ts の re-export 経由で関数を呼ぶ（型のみの re-export のため値がない）

// 推奨: pure function を直接 import
import {
  resolveUiState,
  resolveCtaContract,
} from "@repo/shared/types/execution-capability";
```

#### 教訓 5: P46 - HTMLAttributes Props 型衝突

CTA ボタンコンポーネントを実装する際、HTML 標準属性と同名のカスタム Props を定義すると TS2430 エラーが発生する。特に `content` は HTML 標準属性（`string` 型）として存在するため、`content?: string | number` のように型を拡張すると衝突する。

```typescript
// 禁止: HTML 標準属性と衝突
interface CtaButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  content?: string | number; // TS2430 エラー
}

// 推奨: Omit で衝突属性を除外
interface CtaButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "content"
> {
  content?: string | number;
}
```

#### 教訓 6: P39 - happy-dom 環境での userEvent 非互換

テスト環境が happy-dom の場合、`@testing-library/user-event` の `userEvent.setup()` は Symbol 操作エラー（`Symbol(Node prepared with document state workarounds)`）を起こす。テストでは `fireEvent` を使用し、非同期ハンドラは `await act()` で包むこと。

```typescript
// 禁止: happy-dom 環境での userEvent
const user = userEvent.setup();
await user.click(ctaButton);

// 推奨: fireEvent + act
import { fireEvent, act } from "@testing-library/react";

fireEvent.click(ctaButton);

// 非同期ハンドラの場合
await act(async () => {
  fireEvent.click(ctaButton);
});
```
