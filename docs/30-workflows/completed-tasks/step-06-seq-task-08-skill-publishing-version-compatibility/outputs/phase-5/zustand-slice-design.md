# Zustand Store スライス設計書

## メタ情報

| 項目       | 内容                                                               |
| ---------- | ------------------------------------------------------------------ |
| 文書       | Phase 5 - タスク4 成果物                                           |
| タスクID   | TASK-SKILL-LIFECYCLE-08                                            |
| 作成日     | 2026-03-17                                                         |
| 依存成果物 | `outputs/phase-2/publishing-metadata-design.md` §6                 |
| 参照型定義 | `outputs/phase-5/type-definitions.md`                              |
| 適用ルール | P31（合成Hook無限ループ防止）、P48（派生セレクタ useShallow 適用） |

---

## 目的

publishing 機能の状態管理スライス設計を確定する。P31（合成 Hook 無限ループ防止）を遵守し、合成 Hook は定義せず個別セレクタのみを公開する。P48（派生セレクタ無限ループ防止）に対応し、配列やオブジェクトを返す派生セレクタには `useShallow` を適用する。既存の `skillSlice` との責務境界を明確に定義し、一方向データフローを維持する。

---

## 1. publishingSlice 状態定義

```typescript
/**
 * 公開操作のための Zustand スライス。
 *
 * 配置先: apps/desktop/src/renderer/store/slices/publishingSlice.ts（新規）
 *
 * P31 準拠: 合成 Hook（usePublishingStore()）の戻り値関数を useEffect の依存配列に
 * 含めると無限ループが発生するため、個別セレクタのみを公開する。
 * 合成 Hook は定義しない。
 */
interface PublishingState {
  /** 現在の公開レベル。null は未選択状態（スキル未選択時） */
  currentVisibility: SkillVisibility | null;

  /**
   * 公開可否判定の結果。null は未判定状態。
   * PublishReadinessChecker.check() の戻り値を格納する。
   */
  publishReadiness: PublishReadiness | null;

  /**
   * 互換性チェック結果。null は未チェック状態。
   * CompatibilityChecker.check() の戻り値を格納する。
   */
  compatibilityResult: CompatibilityCheckResult | null;

  /** 公開可否判定の実行中フラグ（IPC 通信中は true） */
  isCheckingReadiness: boolean;

  /** 互換性チェックの実行中フラグ（IPC 通信中は true） */
  isCheckingCompatibility: boolean;

  /** 最後に発生したエラーメッセージ。null はエラーなし */
  lastError: string | null;
}
```

---

## 2. Actions 定義

```typescript
interface PublishingActions {
  /**
   * 公開レベルを変更する。
   * currentVisibility を指定した値に更新し、publishReadiness を null にリセットする。
   */
  setCurrentVisibility: (visibility: SkillVisibility) => void;

  /**
   * 公開可否判定を実行する。
   * isCheckingReadiness を true にし、IPC 経由で PublishReadinessChecker.check() を呼び出す。
   * 完了後（成功/失敗どちらでも）isCheckingReadiness を false に戻す。
   */
  checkReadiness: (
    safetyGate: SafetyGateInput,
    metrics: ObservabilityMetrics,
  ) => Promise<void>;

  /**
   * 互換性チェックを実行する。
   * isCheckingCompatibility を true にし、IPC 経由で CompatibilityChecker.check() を呼び出す。
   * 完了後（成功/失敗どちらでも）isCheckingCompatibility を false に戻す。
   */
  checkCompatibility: (oldSchema: unknown, newSchema: unknown) => Promise<void>;

  /** エラーをクリアする（lastError を null に設定する） */
  clearError: () => void;

  /** publishingSlice を初期状態にリセットする */
  resetPublishing: () => void;
}
```

---

## 3. 初期状態

```typescript
const publishingSliceInitialState: PublishingState = {
  currentVisibility: null,
  publishReadiness: null,
  compatibilityResult: null,
  isCheckingReadiness: false,
  isCheckingCompatibility: false,
  lastError: null,
};
```

---

## 4. 個別セレクタ（P31 準拠）

P31 対策として、合成 Hook の戻り値関数を `useEffect` 依存配列に含めない。個別セレクタ（`useCurrentVisibility()` 等）のみを公開する。

### 4.1 状態セレクタ（参照が安定）

```typescript
/**
 * 現在の公開レベルを取得する。
 * P31 準拠: useEffect 依存配列への追加が安全（プリミティブ値を返すため）。
 */
export const useCurrentVisibility = () =>
  useAppStore((state) => state.currentVisibility);

/**
 * 公開可否判定の結果を取得する。
 * P31 準拠: null または PublishReadiness 値を返す。
 */
export const usePublishReadiness = () =>
  useAppStore((state) => state.publishReadiness);

/**
 * 互換性チェック結果を取得する。
 * P31 準拠: null または CompatibilityCheckResult 値を返す。
 */
export const useCompatibilityResult = () =>
  useAppStore((state) => state.compatibilityResult);

/**
 * 公開可否判定の実行中フラグを取得する。
 * P31 準拠: boolean 値を返すため参照が安定。
 */
export const useIsCheckingReadiness = () =>
  useAppStore((state) => state.isCheckingReadiness);

/**
 * 互換性チェックの実行中フラグを取得する。
 * P31 準拠: boolean 値を返すため参照が安定。
 */
export const useIsCheckingCompatibility = () =>
  useAppStore((state) => state.isCheckingCompatibility);

/**
 * 最後に発生したエラーメッセージを取得する。
 * P31 準拠: null または string 値を返す。
 */
export const usePublishingLastError = () =>
  useAppStore((state) => state.lastError);
```

### 4.2 アクションセレクタ（Zustand アクション参照は安定）

```typescript
/**
 * 公開レベルを変更するアクションを取得する。
 * P31 準拠: Zustand のアクション参照は安定しているため useEffect 依存配列への追加が安全。
 */
export const useSetVisibility = () =>
  useAppStore((state) => state.setCurrentVisibility);

/**
 * 公開可否判定を実行するアクションを取得する。
 * P31 準拠: Zustand のアクション参照は安定。
 */
export const useCheckReadiness = () =>
  useAppStore((state) => state.checkReadiness);

/**
 * 互換性チェックを実行するアクションを取得する。
 * P31 準拠: Zustand のアクション参照は安定。
 */
export const useCheckCompatibility = () =>
  useAppStore((state) => state.checkCompatibility);

/**
 * エラーをクリアするアクションを取得する。
 */
export const useClearPublishingError = () =>
  useAppStore((state) => state.clearError);

/**
 * publishingSlice をリセットするアクションを取得する。
 */
export const useResetPublishing = () =>
  useAppStore((state) => state.resetPublishing);
```

---

## 5. 派生セレクタ（P48 準拠 - useShallow 適用）

オブジェクトや配列を返す派生セレクタには `useShallow` を適用すること（P48: 毎回新しい参照を返すと無限ループ発生）。

```typescript
import { useShallow } from "zustand/react/shallow";

/**
 * 公開判定の reasons 配列を取得する（useShallow 適用）。
 * P48 準拠: 配列を返す派生セレクタのため useShallow が必須。
 */
export const usePublishReadinessReasons = () =>
  useAppStore(
    useShallow((state) => {
      if (
        state.publishReadiness?.status === "blocked" ||
        state.publishReadiness?.status === "review-required" ||
        state.publishReadiness?.status === "manual-approval-required"
      ) {
        return state.publishReadiness.reasons;
      }
      return [] as string[];
    }),
  );

/**
 * BreakingChange 一覧を取得する（useShallow 適用）。
 * P48 準拠: 配列を返す派生セレクタのため useShallow が必須。
 */
export const useBreakingChanges = () =>
  useAppStore(
    useShallow((state) => state.compatibilityResult?.breakingChanges ?? []),
  );
```

---

## 6. 禁止パターン（P31 / P48 違反）

```typescript
// P31 違反: 合成 Hook の戻り値関数を useEffect 依存配列に含める
// ❌ 禁止
const { setCurrentVisibility } = usePublishingStore();
useEffect(() => {
  setCurrentVisibility("team");
}, [setCurrentVisibility]); // → 無限ループ発生

// P31 準拠
// ✅ 正しい
const setCurrentVisibility = useSetVisibility();
useEffect(() => {
  setCurrentVisibility("team");
}, [setCurrentVisibility]); // → Zustand アクションは安定した参照

// P48 違反: 派生セレクタで毎回新しい配列参照を返す
// ❌ 禁止
export const useBreakingChanges = () =>
  useAppStore((state) => state.compatibilityResult?.breakingChanges ?? []);

// P48 準拠
// ✅ 正しい
export const useBreakingChanges = () =>
  useAppStore(
    useShallow((state) => state.compatibilityResult?.breakingChanges ?? []),
  );
```

---

## 7. 既存 skillSlice との境界定義

| スライス          | 責務                                                                  | 参照キー |
| ----------------- | --------------------------------------------------------------------- | -------- |
| `skillSlice`      | スキルの CRUD（作成・読み取り・更新・削除）。スキルの本体データを管理 | skillId  |
| `publishingSlice` | 公開ライフサイクル（登録・互換性チェック・公開判定）。公開状態を管理  | skillId  |

**参照関係**: `publishingSlice` は `skillSlice` のデータを `skillId` をキーとして参照する。`publishingSlice` が `skillSlice` の状態を直接書き換えることは禁止する（一方向データフロー）。

**具体的な境界**:

- スキル名・説明・バージョン文字列 → `skillSlice` が管理
- 公開レベル（visibility）・公開可否判定（publishReadiness）→ `publishingSlice` が管理
- スキルの作成/削除 → `skillSlice` のアクションを呼び出す
- 公開状態の変更（local → team → public）→ `publishingSlice` のアクションを呼び出す

---

## 8. Store への統合方法

```typescript
// apps/desktop/src/renderer/store/index.ts（既存ファイルへの追記箇所）
import { createPublishingSlice } from "./slices/publishingSlice";

// AppStore の型定義への追加
type AppStore = SkillSlice & AgentSlice & /* 既存スライス */ & PublishingSlice & PublishingActions;

// create() の引数に追加
const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (...a) => ({
        ...createSkillSlice(...a),
        // ... 既存スライス
        ...createPublishingSlice(...a),
      }),
      {
        name: "app-store",
        // publishingSlice の state は永続化しない（セッション内のみ有効）
        partialize: (state) => ({
          // ... 既存の永続化対象フィールド
          // publishingSlice のフィールドは意図的に除外する
        }),
      },
    ),
  ),
);
```

**永続化方針**: `publishingSlice` の状態はセッション内のみ有効とし、`electron-store` への永続化対象から除外する。理由: 公開可否判定結果は最新の SafetyGate/ObservabilityMetrics に基づくものであり、セッションをまたいで古い判定結果を保持することは不適切。

---

## 9. M-SS-2 フィルタ UI 配置先（Phase 3 MINOR 対応）

Phase 3 MINOR M-SS-2（フィルタ UI 配置先コンポーネントの確定）に対する確定事項:

`VisibilityFilter` の状態管理は `publishingSlice` で管理する。

```typescript
// publishingSlice への追加フィールド（フィルタ UI 対応）
interface PublishingState {
  // ... 既存フィールド
  /** Skill Center 一覧画面の visibility フィルタ。デフォルト: "all"（全件表示） */
  visibilityFilter: VisibilityFilter;
}
```

フィルタ UI コンポーネントは `apps/desktop/src/renderer/components/SkillCenter/` ディレクトリに配置する（既存の Skill Center コンポーネント群と同階層）。コンポーネント名: `VisibilityFilterDropdown`。

---

## 10. P48 useShallow 適用基準

以下の条件に該当する派生セレクタには `useShallow` の適用が必須。

| 条件                                                            | 適用要否 | 理由                                                          |
| --------------------------------------------------------------- | -------- | ------------------------------------------------------------- |
| セレクタが `.filter()` で新しい配列を返す                       | 必須     | 毎回新しい参照が生成され `Object.is` 比較で不一致となる       |
| セレクタが `.map()` で新しい配列を返す                          | 必須     | 同上                                                          |
| セレクタがスプレッド構文（`{ ...obj }`）で新オブジェクトを返す  | 必須     | 同上                                                          |
| セレクタが `?? []` で空配列フォールバックを返す                 | 必須     | `[]` リテラルは毎回新しい参照を生成する                       |
| セレクタがプリミティブ値（string, number, boolean, null）を返す | 不要     | `Object.is` 比較で同値であれば再レンダーしない                |
| セレクタが Zustand アクション関数を返す                         | 不要     | Zustand のアクション参照は Store 生成時に固定され安定している |

**publishingSlice における適用対象**:

- `usePublishReadinessReasons()`: `reasons` 配列を返すため useShallow 必須
- `useBreakingChanges()`: `breakingChanges` 配列を返すため useShallow 必須
- `useCurrentVisibility()`: プリミティブ値（string | null）のため useShallow 不要
- `useIsCheckingReadiness()`: boolean 値のため useShallow 不要

---

## 11. Phase 3 MINOR 対応状況（全10件）

| MINOR ID | 指摘内容                           | 対応状況   | 本文書での対応内容                                                                           |
| -------- | ---------------------------------- | ---------- | -------------------------------------------------------------------------------------------- |
| M-AC-1   | `"deprecated"` 状態の型未収録      | 未対象     | Store スライス設計に直接影響なし。type-definitions.md で isDeprecated フィールドとして対応   |
| M-AC-2   | 後方互換保持世代数ポリシー未定義   | 未対象     | Store スライス設計に直接影響なし。service-interfaces.md で対応済み                           |
| M-AC-3   | カテゴリ固定値の列挙未収録         | 未対象     | Store スライス設計に直接影響なし。tags フィールドで代替                                      |
| M-SS-1   | CSS変数衝突確認                    | 未対象     | Store スライス設計に直接影響なし。実装タスクで grep 確認する                                 |
| M-SS-2   | フィルタUI配置先コンポーネント確定 | 解決済み   | セクション9 で `visibilityFilter` を publishingSlice に追加、UI は SkillCenter/ に配置を確定 |
| M-SS-3   | 型名重複確認                       | 未対象     | Store スライス設計に直接影響なし。ipc-channel-definitions.md で確認済み                      |
| M-DQ-1   | semver ライブラリ未定義            | 未対象     | Store スライス設計に直接影響なし。service-interfaces.md で対応済み                           |
| M-DQ-2   | update() 内通知の責務越境          | 未対象     | Store スライス設計に直接影響なし。service-interfaces.md で対応済み                           |
| M-DQ-3   | reasons フィールドの日本語固定     | 未タスク化 | i18n 対応として未タスク化（Phase 3 確定済み）                                                |
| M-DQ-4   | SkillDependency DI境界配置先未確定 | 未対象     | Store スライス設計に直接影響なし。service-interfaces.md で対応済み                           |
