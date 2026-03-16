# lifecycleHistorySlice 実装仕様書

## メタ情報

| 項目       | 内容                                                                                                                                                 |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase      | 5                                                                                                                                                    |
| タスクID   | TASK-SKILL-LIFECYCLE-07                                                                                                                              |
| 作成日     | 2026-03-16                                                                                                                                           |
| 入力成果物 | `outputs/phase-2/data-flow-design.md` (§5)                                                                                                           |
| 出力パス   | `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/outputs/phase-5/lifecycle-history-slice-spec.md` |
| 配置先     | `apps/desktop/src/renderer/store/slices/lifecycleHistorySlice.ts`                                                                                    |

---

## 1. 概要

本ドキュメントは Zustand `lifecycleHistorySlice` の State / Actions / 個別セレクタの詳細実装仕様を定義する。

Phase 3 MINOR 指摘 **TECH-M-01**（`aggregateViews` の persist 設定矛盾）を解決した設計を含む。
解決方針: `aggregate-view-design.md` の「派生データは persist 対象外」を正として採用する。

---

## 2. State 型定義

```typescript
// apps/desktop/src/renderer/store/slices/lifecycleHistorySlice.ts

import type {
  SkillLifecycleEvent,
  SkillAggregateView,
  SkillFeedback,
  PublishReadinessMetrics,
} from "@repo/shared";

/**
 * lifecycleHistorySlice の State 型。
 *
 * TECH-M-01 解決:
 *   - aggregateViews は「イベントから導出可能な派生データ」のため persist 対象外（メモリのみ）
 *   - publishReadiness は「SQLiteから再計算コストが高い」ため persist 対象とする
 *
 * ストレージキー: "lifecycle-history"
 * persist 対象: publishReadiness のみ（aggregateViews は除外）
 */
export interface LifecycleHistoryState {
  /**
   * スキルIDをキーとしたライフサイクルイベントリスト。
   * リアルタイム受信分のインメモリキャッシュ（最大 1000 件 / 全スキル合計）。
   * 全件は SQLite に永続化される（SQLite が正本データソース）。
   */
  events: SkillLifecycleEvent[];

  /**
   * スキルIDをキーとした集約ビューキャッシュ。
   * buildAggregateView() の計算結果を保持する。
   *
   * TECH-M-01 解決: persist 対象外（メモリのみ）。
   * アプリ起動時は SQLite スナップショットから再構築する。
   */
  aggregateViews: Record<string, SkillAggregateView>;

  /**
   * データ取得中フラグ。
   * IPC 呼び出し中（fetchLifecycleEvents / syncFromPersistence）に true になる。
   */
  isLoading: boolean;

  /**
   * 最後に発生したエラーメッセージ。
   * null = エラーなし。
   */
  error: string | null;

  /**
   * 最後に SQLite と同期した日時（ISO 8601 UTC）。
   * null = 未同期（初回起動時など）。
   * syncFromPersistence() 完了時に更新する。
   */
  lastSyncedAt: string | null;
}
```

**フィールド詳細**:

| フィールド       | 型                                   | 初期値  | persist  | 説明                                         |
| ---------------- | ------------------------------------ | ------- | -------- | -------------------------------------------- |
| `events`         | `SkillLifecycleEvent[]`              | `[]`    | 不要     | 全スキル合計最大1000件のインメモリキャッシュ |
| `aggregateViews` | `Record<string, SkillAggregateView>` | `{}`    | **不要** | 派生データのためメモリのみ（TECH-M-01解決）  |
| `isLoading`      | `boolean`                            | `false` | 不要     | IPC処理中フラグ                              |
| `error`          | `string \| null`                     | `null`  | 不要     | エラーメッセージ                             |
| `lastSyncedAt`   | `string \| null`                     | `null`  | 必要     | 最終同期日時（起動後の初回同期確認に使用）   |

---

## 3. Actions 型定義

```typescript
export interface LifecycleHistoryActions {
  /**
   * ライフサイクルイベントを State に追加する。
   * - State の events 配列に追加（最新順）
   * - 全スキル合計 1000 件を超える場合は古い方から削除
   * - 対象スキルの aggregateViews をインクリメンタル更新（buildAggregateView 再実行）
   *
   * @param event - 追加するライフサイクルイベント
   */
  recordEvent: (event: SkillLifecycleEvent) => void;

  /**
   * 指定スキルのイベント一覧を返す（State から検索、SQLite クエリではない）。
   * 読み取り専用操作のため State を変更しない。
   *
   * @param skillId - 対象スキルID（SkillName）
   * @returns 対象スキルのイベント一覧（タイムスタンプ降順）
   */
  getEventsBySkill: (skillId: string) => SkillLifecycleEvent[];

  /**
   * 指定カテゴリのイベント一覧を返す（State から検索）。
   * 読み取り専用操作のため State を変更しない。
   *
   * @param category - 対象カテゴリ（EventCategory）
   * @returns 対象カテゴリのイベント一覧（タイムスタンプ降順）
   */
  getEventsByCategory: (category: string) => SkillLifecycleEvent[];

  /**
   * 直近 N 件のイベントを返す（全スキル対象、タイムスタンプ降順）。
   * 読み取り専用操作のため State を変更しない。
   *
   * @param limit - 取得件数（デフォルト: 50。最大: 1000）
   * @returns 直近 N 件のイベント一覧
   */
  getRecentEvents: (limit?: number) => SkillLifecycleEvent[];

  /**
   * 全イベントを State からクリアする。
   * SQLite のデータは削除しない（State のキャッシュのみリセット）。
   * テスト用途・デバッグ用途のみを想定。
   */
  clearEvents: () => void;

  /**
   * SQLite からイベントを取得して State を同期する。
   * アプリ起動時・バッチ更新通知受信時に呼び出す。
   * - IPC: skill:getLifecycleEvents（ページング対応）
   * - 完了後に lastSyncedAt を更新する
   *
   * @param options.skillId - 同期対象スキルID（省略時: 全スキル）
   * @param options.limit - 取得件数（デフォルト: 1000）
   */
  syncFromPersistence: (options?: {
    skillId?: string;
    limit?: number;
  }) => Promise<void>;
}
```

### 3-1. recordEvent の擬似コード

```
function recordEvent(event):
  set(state => {
    // 1. events 配列に追加（末尾ではなく先頭に追加して降順を維持）
    const newEvents = [event, ...state.events]

    // 2. 全スキル合計 1000 件上限を適用
    const cappedEvents = newEvents.length > 1000
      ? newEvents.slice(0, 1000)
      : newEvents

    // 3. 対象スキルの aggregateView を更新
    const skillEvents = cappedEvents.filter(e => e.skillId === event.skillId)
    const skillName = event.skillId  // SkillName = スキル表示名
    const updatedView = buildAggregateView(event.skillId, skillName, skillEvents)

    return {
      events: cappedEvents,
      aggregateViews: {
        ...state.aggregateViews,
        [event.skillId]: updatedView,
      }
    }
  })
```

### 3-2. syncFromPersistence の擬似コード

```
async function syncFromPersistence(options = {}):
  const { skillId, limit = 1000 } = options

  set({ isLoading: true, error: null })

  try:
    // IPC 呼び出し: skill:getLifecycleEvents
    const result = await window.skillAPI.getLifecycleEvents({
      skillName: skillId,  // undefined の場合は全スキル
      limit,
      offset: 0,
    })

    if (!result.success):
      throw new Error(result.error.message)

    // State 更新
    set(state => {
      // 集約ビューをイベント群から再計算
      const newAggregateViews = { ...state.aggregateViews }
      const skillIds = [...new Set(result.events.map(e => e.skillId))]
      for (const sid of skillIds):
        const skillEvents = result.events.filter(e => e.skillId === sid)
        newAggregateViews[sid] = buildAggregateView(sid, sid, skillEvents)

      return {
        events: result.events,
        aggregateViews: newAggregateViews,
        isLoading: false,
        lastSyncedAt: new Date().toISOString(),
      }
    })

  catch (error):
    set({
      isLoading: false,
      error: error instanceof Error ? error.message : "同期に失敗しました",
    })
```

---

## 4. 個別セレクタ（P31/P48 対策）

P31（合成Hook無限ループ）・P48（派生セレクタ無限ループ）対策として、以下の原則に従う。

- 単一スカラー値を返すセレクタ: `useShallow` 不要
- 配列・オブジェクトを返すセレクタ（filter / map / slice を含む）: `useShallow` 必須
- アクション参照セレクタ: `useShallow` 不要（Zustand アクション参照は安定）

```typescript
import { useShallow } from "zustand/react/shallow";
import { useLifecycleHistoryStore } from "../lifecycleHistoryStore";

// ================================================================
// 単一値セレクタ（useShallow 不要）
// ================================================================

/**
 * ローディング状態を取得する。
 * ScoreGateBadge / HistorySearchView のローディング表示に使用。
 */
export const useLifecycleIsLoading = (): boolean =>
  useLifecycleHistoryStore((state) => state.isLoading);

/**
 * エラーメッセージを取得する。null = エラーなし。
 */
export const useLifecycleError = (): string | null =>
  useLifecycleHistoryStore((state) => state.error);

/**
 * 最終同期日時を取得する。null = 未同期。
 */
export const useLastSyncedAt = (): string | null =>
  useLifecycleHistoryStore((state) => state.lastSyncedAt);

/**
 * 指定スキルの集約ビューを取得する。
 * SkillDetailPanel の集約データ表示に使用。
 * SkillAggregateView はオブジェクトだが、特定 skillId のリファレンスは安定しているため
 * useShallow 不要（参照が変わる場合はオブジェクト全体が変わる）。
 */
export const useSkillAggregateView = (
  skillId: string,
): SkillAggregateView | null =>
  useLifecycleHistoryStore((state) => state.aggregateViews[skillId] ?? null);

// ================================================================
// 配列セレクタ（useShallow 必須: P48対策）
// ================================================================

/**
 * 全スキルのライフサイクルイベント一覧を取得する（タイムスタンプ降順）。
 * filter を通じて新規配列を生成するため useShallow を適用。
 */
export const useLifecycleEvents = (): SkillLifecycleEvent[] =>
  useLifecycleHistoryStore(useShallow((state) => state.events));

/**
 * 指定スキルのライフサイクルイベント一覧を取得する（タイムスタンプ降順）。
 * filter() で新規配列を生成するため useShallow を適用（P48対策）。
 *
 * @param skillId - 対象スキルID（SkillName）
 */
export const useLifecycleEventsBySkill = (
  skillId: string,
): SkillLifecycleEvent[] =>
  useLifecycleHistoryStore(
    useShallow((state) => state.events.filter((e) => e.skillId === skillId)),
  );

/**
 * 指定カテゴリのライフサイクルイベント一覧を取得する（タイムスタンプ降順）。
 * filter() で新規配列を生成するため useShallow を適用（P48対策）。
 *
 * @param category - 対象カテゴリ（EventCategory）
 */
export const useLifecycleEventsByCategory = (
  category: string,
): SkillLifecycleEvent[] =>
  useLifecycleHistoryStore(
    useShallow((state) => state.events.filter((e) => e.category === category)),
  );

/**
 * 直近 N 件のライフサイクルイベントを取得する（全スキル対象）。
 * slice() で新規配列を生成するため useShallow を適用（P48対策）。
 *
 * @param limit - 取得件数（デフォルト: 50）
 */
export const useRecentLifecycleEvents = (
  limit: number = 50,
): SkillLifecycleEvent[] =>
  useLifecycleHistoryStore(useShallow((state) => state.events.slice(0, limit)));

// ================================================================
// アクションセレクタ（Zustand アクション参照は安定: P31対策）
// ================================================================

/**
 * recordEvent アクションを取得する。
 * IPC 受信ハンドラから呼び出す。
 */
export const useRecordLifecycleEvent = () =>
  useLifecycleHistoryStore((state) => state.recordEvent);

/**
 * syncFromPersistence アクションを取得する。
 * アプリ起動時の初期同期に使用。
 */
export const useSyncLifecycleFromPersistence = () =>
  useLifecycleHistoryStore((state) => state.syncFromPersistence);

/**
 * clearEvents アクションを取得する。
 * テスト・デバッグ用途のみ。
 */
export const useClearLifecycleEvents = () =>
  useLifecycleHistoryStore((state) => state.clearEvents);
```

---

## 5. persist 設定

```typescript
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * lifecycleHistorySlice の persist 設定。
 *
 * TECH-M-01 解決:
 *   - aggregateViews: persist 対象外（派生データ・メモリのみ）
 *   - events: persist 対象外（SQLite が正本データソース）
 *   - lastSyncedAt: persist 対象（起動後の初回同期判断に必要）
 *   - isLoading / error: persist 対象外（揮発性フラグ）
 *
 * ストレージキー: "lifecycle-history"
 * version: 1
 */
export const useLifecycleHistoryStore = create<
  LifecycleHistoryState & LifecycleHistoryActions
>()(
  persist(
    (set, get) => ({
      // --- 初期 State ---
      events: [],
      aggregateViews: {},
      isLoading: false,
      error: null,
      lastSyncedAt: null,

      // --- Actions ---
      recordEvent: (event) => {
        /* §3-1 擬似コード参照 */
      },
      getEventsBySkill: (skillId) =>
        get().events.filter((e) => e.skillId === skillId),
      getEventsByCategory: (category) =>
        get().events.filter((e) => e.category === category),
      getRecentEvents: (limit = 50) =>
        get().events.slice(0, Math.min(limit, 1000)),
      clearEvents: () => set({ events: {}, aggregateViews: {} }),
      syncFromPersistence: async (options) => {
        /* §3-2 擬似コード参照 */
      },
    }),
    {
      name: "lifecycle-history",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      /**
       * partialize: persist に含めるフィールドを絞る。
       *
       * 含める: lastSyncedAt（起動後の初回同期判断）
       * 除外: events（SQLite が正本）
       * 除外: aggregateViews（派生データ。TECH-M-01解決）
       * 除外: isLoading / error（揮発性フラグ）
       */
      partialize: (state): Partial<LifecycleHistoryState> => ({
        lastSyncedAt: state.lastSyncedAt,
      }),
      /**
       * migrate: version 変更時のマイグレーション関数。
       * version 1 → 2 になった場合はここに追加する。
       */
      migrate: (persistedState, version) => {
        if (version === 0) {
          // v0 から v1 への移行: lastSyncedAt を追加
          return { ...(persistedState as object), lastSyncedAt: null };
        }
        return persistedState;
      },
    },
  ),
);
```

**persist 設定サマリー**:

| フィールド       | persist  | 理由                                                    |
| ---------------- | -------- | ------------------------------------------------------- |
| `events`         | 不要     | SQLite が正本。Zustand はキャッシュのみ                 |
| `aggregateViews` | **不要** | 派生データ（TECH-M-01解決）。起動時に SQLite から再計算 |
| `isLoading`      | 不要     | 揮発性フラグ                                            |
| `error`          | 不要     | 揮発性フラグ                                            |
| `lastSyncedAt`   | 必要     | 起動後の初回同期判断・デバッグに使用                    |

---

## 6. IPC 受信ハンドラとの接続

`skill:lifecycle_event_emitted` IPC 通知（Main → Renderer）を受信して `recordEvent` を呼び出す接続コードを以下に示す。

```typescript
// apps/desktop/src/renderer/store/ipcListeners/lifecycleEventListener.ts

import { IPC_CHANNELS } from "@repo/shared";
import { useLifecycleHistoryStore } from "../slices/lifecycleHistorySlice";

/**
 * ライフサイクルイベント IPC リスナーを登録する。
 * React StrictMode の二重呼び出し対策として、モジュールスコープのガードフラグを使用する。
 * P5（リスナー二重登録）対策。
 */
let isListenerRegistered = false;

export function registerLifecycleEventListener(): void {
  if (isListenerRegistered) return;
  isListenerRegistered = true;

  window.electronAPI.on(
    IPC_CHANNELS.SKILL_LIFECYCLE_EVENT_EMITTED,
    (event: SkillLifecycleEvent) => {
      useLifecycleHistoryStore.getState().recordEvent(event);
    },
  );
}
```

---

## 7. INT-M-01 解決: successRate 集計ウィンドウ

Phase 3 MINOR 指摘 **INT-M-01**（successRate の集計ウィンドウ: 件数ベース vs 時間ベース）への対応。

**解決方針**: `buildAggregateView()` は**時間ベース（直近30日）**を使用する。Task05 向けに**件数ベース（直近N件）**が必要な場合は、`lifecycleHistorySlice` のセレクタを引数化で対応する。

```typescript
/**
 * 指定スキルの成功率を時間ベース（直近30日）で取得する（Task05 / UI 用）。
 * INT-M-01 解決: SkillAggregateView.successRate は常に直近30日ベース。
 */
export const useSuccessRateBySkill = (skillId: string): number | null =>
  useLifecycleHistoryStore(
    (state) => state.aggregateViews[skillId]?.successRate ?? null,
  );

/**
 * 指定スキルの成功率を件数ベース（直近 N 件）で取得する（PublishReadiness 用）。
 * INT-M-01 解決: Task08 / PublishReadinessMetrics 向けに件数ベースを提供。
 * calculateSuccessRate(events, periodDays) は period に Infinity を渡すことで
 * 全件対象にし、事前に slice(-N) で件数制限する。
 *
 * @param skillId - 対象スキルID
 * @param windowSize - 直近 N 件（デフォルト: 10）
 */
export const useSuccessRateByCount = (
  skillId: string,
  windowSize: number = 10,
): number | null =>
  useLifecycleHistoryStore(
    useShallow((state) => {
      const events = state.events
        .filter((e) => e.skillId === skillId && e.category === "execution")
        .slice(0, windowSize);
      if (events.length === 0) return null;
      // calculateSuccessRate は packages/shared から import
      return calculateSuccessRate(events, Infinity);
    }),
  );
```

---

## 8. 配置先ファイル一覧

| ファイルパス                                                                               | 内容                             |
| ------------------------------------------------------------------------------------------ | -------------------------------- |
| `apps/desktop/src/renderer/store/slices/lifecycleHistorySlice.ts`                          | State / Actions / Store 定義     |
| `apps/desktop/src/renderer/store/slices/lifecycleHistorySlice.selectors.ts`                | 個別セレクタ（§4）               |
| `apps/desktop/src/renderer/store/ipcListeners/lifecycleEventListener.ts`                   | IPC リスナー接続コード（§6）     |
| `apps/desktop/src/renderer/store/slices/__tests__/lifecycleHistorySlice.test.ts`           | Store スライステスト             |
| `apps/desktop/src/renderer/store/slices/__tests__/lifecycleHistorySlice.selectors.test.ts` | セレクタテスト（P48 境界値含む） |

---

_作成日: 2026-03-16_
_タスクID: TASK-SKILL-LIFECYCLE-07 / Phase 5 成果物2_
