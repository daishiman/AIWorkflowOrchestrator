# 状態管理設計

## メタ情報

| 項目       | 値                                 |
| ---------- | ---------------------------------- |
| タスクID   | TASK-SKILL-LIFECYCLE-05            |
| Phase      | 2                                  |
| Phase名    | 設計                               |
| 成果物種別 | 状態管理設計                       |
| 作成日     | 2026-03-15                         |
| 前提       | phase-1-requirements.md            |
| 準拠ルール | P31, P48, arch-state-management.md |

## 目的

作成済みスキルの利用導線に必要な状態（お気に入り、最近使ったスキル、実行結果、利用後再評価スコア）を Zustand Store の既存 Slice に拡張し、P31/P48 準拠の個別セレクタで安全にアクセスする設計を定義する。

---

## 1. Store / Slice 拡張テーブル

### skillSlice 拡張

| フィールド           | 型                                   | 初期値      | 責務                                     | persist |
| -------------------- | ------------------------------------ | ----------- | ---------------------------------------- | ------- |
| `favoriteSkillNames` | `Set<string>`                        | `new Set()` | ユーザーがスター付けしたスキル名の管理   | 有効    |
| `recentlyUsedSkills` | `{ name: string; usedAt: string }[]` | `[]`        | 最近使ったスキルの管理（最大20件、LIFO） | 有効    |

### agentSlice 拡張

| フィールド            | 型                               | 初期値 | 責務                      | persist |
| --------------------- | -------------------------------- | ------ | ------------------------- | ------- |
| `lastExecutionResult` | `ExecutionResultSummary \| null` | `null` | 直近の Agent 実行結果保持 | 無効    |
| `postExecutionScore`  | `ScoringGateResult \| null`      | `null` | EP-4 利用後再評価結果     | 無効    |

> **persist 方針**: お気に入りと最近使ったスキルはセッション跨ぎで永続化が必要なため persist 対象。実行結果と再評価スコアはセッション限定のため persist 対象外。

---

## 2. 型定義

### ExecutionResultSummary

```typescript
/**
 * Agent 実行結果のサマリー型
 * AgentView の実行結果セクションで使用
 */
export interface ExecutionResultSummary {
  /** 実行対象のスキル名 */
  skillName: string;

  /** 実行ステータス */
  status: "success" | "partial" | "failed" | "cancelled";

  /** 実行時間（ミリ秒） */
  durationMs: number;

  /** 結果プレビュー（最大200文字） */
  resultPreview: string;

  /** 実行日時（ISO 8601） */
  executedAt: string;

  /** 使用したパラメータ（再実行用） */
  parameters?: Record<string, unknown>;
}
```

### ScoringGateResult（既存型 - 参照）

```typescript
// packages/shared/src/types/skill-improver.ts より
export interface ScoringGateResult {
  gate: ScoringGate;
  score: number;
  canSave: boolean;
  canUse: boolean;
  isRecommended: boolean;
}
```

---

## 3. 個別セレクタ設計（P31 準拠）

> **P31 対策**: 合成 Hook（`useSkillStore()` / `useAgentStore()`）は使用禁止。全てのフィールドアクセスは個別セレクタ経由とする。

### skillSlice セレクタ

| セレクタ名              | 戻り値型                             | useShallow | 備考                                |
| ----------------------- | ------------------------------------ | ---------- | ----------------------------------- |
| `useFavoriteSkillNames` | `Set<string>`                        | 不要       | Set は参照安定（mutate しない前提） |
| `useRecentlyUsedSkills` | `{ name: string; usedAt: string }[]` | **必須**   | P48: 配列を返すため useShallow 必須 |
| `useIsFavorite`         | `(skillName: string) => boolean`     | 不要       | プリミティブ値を返す関数            |
| `useToggleFavorite`     | `(skillName: string) => void`        | 不要       | アクション関数（参照安定）          |
| `useAddRecentlyUsed`    | `(skillName: string) => void`        | 不要       | アクション関数（参照安定）          |

### agentSlice セレクタ

| セレクタ名                   | 戻り値型                                   | useShallow | 備考                       |
| ---------------------------- | ------------------------------------------ | ---------- | -------------------------- |
| `useLastExecutionResult`     | `ExecutionResultSummary \| null`           | 不要       | オブジェクト参照は安定     |
| `usePostExecutionScore`      | `ScoringGateResult \| null`                | 不要       | オブジェクト参照は安定     |
| `useSetLastExecutionResult`  | `(result: ExecutionResultSummary) => void` | 不要       | アクション関数（参照安定） |
| `useSetPostExecutionScore`   | `(score: ScoringGateResult) => void`       | 不要       | アクション関数（参照安定） |
| `useClearPostExecutionScore` | `() => void`                               | 不要       | アクション関数（参照安定） |

### セレクタ実装例

```typescript
import { useShallow } from "zustand/react/shallow";

// ---- skillSlice セレクタ ----

/** お気に入りスキル名のSet（参照安定） */
export const useFavoriteSkillNames = () =>
  useAppStore((state) => state.favoriteSkillNames);

/** 最近使ったスキル一覧（P48: useShallow 必須） */
export const useRecentlyUsedSkills = () =>
  useAppStore(useShallow((state) => state.recentlyUsedSkills));

/** 特定スキルがお気に入りかどうか判定 */
export const useIsFavorite = () =>
  useAppStore(
    (state) => (skillName: string) => state.favoriteSkillNames.has(skillName),
  );

/** お気に入りトグルアクション */
export const useToggleFavorite = () =>
  useAppStore((state) => state.toggleFavorite);

/** 最近使ったスキルに追加 */
export const useAddRecentlyUsed = () =>
  useAppStore((state) => state.addRecentlyUsed);

// ---- agentSlice セレクタ ----

/** 直近の実行結果 */
export const useLastExecutionResult = () =>
  useAppStore((state) => state.lastExecutionResult);

/** EP-4 利用後再評価結果 */
export const usePostExecutionScore = () =>
  useAppStore((state) => state.postExecutionScore);

/** 実行結果セットアクション */
export const useSetLastExecutionResult = () =>
  useAppStore((state) => state.setLastExecutionResult);

/** 再評価スコアセットアクション */
export const useSetPostExecutionScore = () =>
  useAppStore((state) => state.setPostExecutionScore);

/** 再評価スコアクリアアクション */
export const useClearPostExecutionScore = () =>
  useAppStore((state) => state.clearPostExecutionScore);
```

---

## 4. アクション設計

### skillSlice アクション

| アクション名      | 引数                | 処理内容                                                                                       |
| ----------------- | ------------------- | ---------------------------------------------------------------------------------------------- |
| `toggleFavorite`  | `skillName: string` | `favoriteSkillNames` に存在すれば削除、存在しなければ追加。Set の immutable 更新で新参照を生成 |
| `addRecentlyUsed` | `skillName: string` | 先頭に追加し、同名の既存エントリを削除。20件を超えた場合は末尾を切り捨て                       |

### agentSlice アクション

| アクション名              | 引数                             | 処理内容                                  |
| ------------------------- | -------------------------------- | ----------------------------------------- |
| `setLastExecutionResult`  | `result: ExecutionResultSummary` | `lastExecutionResult` を上書き            |
| `setPostExecutionScore`   | `score: ScoringGateResult`       | `postExecutionScore` を上書き             |
| `clearPostExecutionScore` | なし                             | `postExecutionScore` を `null` にリセット |

### アクション実装例

```typescript
// skillSlice 内
toggleFavorite: (skillName: string) =>
  set((state) => {
    const next = new Set(state.favoriteSkillNames);
    if (next.has(skillName)) {
      next.delete(skillName);
    } else {
      next.add(skillName);
    }
    return { favoriteSkillNames: next };
  }),

addRecentlyUsed: (skillName: string) =>
  set((state) => {
    const filtered = state.recentlyUsedSkills.filter(
      (s) => s.name !== skillName
    );
    const updated = [
      { name: skillName, usedAt: new Date().toISOString() },
      ...filtered,
    ].slice(0, 20); // 最大20件制限
    return { recentlyUsedSkills: updated };
  }),

// agentSlice 内
setLastExecutionResult: (result: ExecutionResultSummary) =>
  set({ lastExecutionResult: result }),

setPostExecutionScore: (score: ScoringGateResult) =>
  set({ postExecutionScore: score }),

clearPostExecutionScore: () =>
  set({ postExecutionScore: null }),
```

---

## 5. Zustand persist 設計

### persist 対象フィールド

| フィールド            | persist | ストレージ   | 理由                                     |
| --------------------- | ------- | ------------ | ---------------------------------------- |
| `favoriteSkillNames`  | 有効    | localStorage | ユーザー設定であり、セッション跨ぎで保持 |
| `recentlyUsedSkills`  | 有効    | localStorage | 利用履歴であり、セッション跨ぎで保持     |
| `lastExecutionResult` | 無効    | -            | セッション限定の一時データ               |
| `postExecutionScore`  | 無効    | -            | セッション限定の一時データ               |

### customStorage 実装方針（Set <-> Array 変換）

`Set<string>` は JSON シリアライズ不可のため、`customStorage` で `serialize` / `deserialize` 時に Array との相互変換を行う。

```typescript
const customStorage: StateStorage = {
  getItem: (name: string) => {
    const raw = localStorage.getItem(name);
    if (raw === null) return null;
    try {
      const parsed = JSON.parse(raw);
      // Set<string> の復元: Array -> Set 変換
      if (parsed?.state?.favoriteSkillNames) {
        const arr = parsed.state.favoriteSkillNames;
        parsed.state.favoriteSkillNames = Array.isArray(arr)
          ? new Set(arr.filter((v: unknown) => typeof v === "string"))
          : new Set<string>();
      }
      // recentlyUsedSkills の復元: 配列バリデーション
      if (parsed?.state?.recentlyUsedSkills) {
        const arr = parsed.state.recentlyUsedSkills;
        parsed.state.recentlyUsedSkills = Array.isArray(arr)
          ? arr
              .filter(
                (v: unknown) =>
                  v != null &&
                  typeof v === "object" &&
                  "name" in v &&
                  typeof (v as Record<string, unknown>).name === "string" &&
                  "usedAt" in v &&
                  typeof (v as Record<string, unknown>).usedAt === "string",
              )
              .slice(0, 20) // 最大20件ガード
          : [];
      }
      return JSON.stringify(parsed);
    } catch {
      // 破損データ自動回復: 初期値にフォールバック
      localStorage.removeItem(name);
      return null;
    }
  },
  setItem: (name: string, value: string) => {
    try {
      const parsed = JSON.parse(value);
      // Set<string> のシリアライズ: Set -> Array 変換
      if (parsed?.state?.favoriteSkillNames instanceof Set) {
        parsed.state.favoriteSkillNames = Array.from(
          parsed.state.favoriteSkillNames,
        );
      }
      localStorage.setItem(name, JSON.stringify(parsed));
    } catch {
      localStorage.setItem(name, value);
    }
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
  },
};
```

### persist partialize 設定

```typescript
persist(
  (set, get) => ({
    // ... slice 定義
  }),
  {
    name: "skill-usage-storage",
    storage: createJSONStorage(() => customStorage),
    partialize: (state) => ({
      favoriteSkillNames: state.favoriteSkillNames,
      recentlyUsedSkills: state.recentlyUsedSkills,
      // lastExecutionResult, postExecutionScore は除外
    }),
  },
);
```

---

## 6. P31/P48 対策チェックリスト

### P31 対策（合成 Hook 無限ループ防止）

- [x] 合成 Hook（`useSkillStore()` / `useAgentStore()`）を使用しない
- [x] 全フィールドアクセスは個別セレクタ経由
- [x] アクション関数は個別セレクタ（`useToggleFavorite()` 等）で取得
- [x] `useEffect` 依存配列にはアクション関数の個別セレクタのみ含める

### P48 対策（派生セレクタ無限ループ防止）

- [x] `useRecentlyUsedSkills` に `useShallow` を適用（配列を返すため）
- [x] `useFavoriteSkillNames` は Set 参照が安定するため `useShallow` 不要（`toggleFavorite` で新 Set を生成するため自動的に参照が更新される）
- [x] `.filter()` / `.map()` で新しい配列を生成するセレクタには `useShallow` を必ず適用

### 使用例（コンポーネント側）

```typescript
// SkillCard.tsx — P31/P48 準拠の利用例
const SkillCard: React.FC<{ skillName: string }> = ({ skillName }) => {
  const isFavoriteCheck = useIsFavorite();
  const toggleFavorite = useToggleFavorite();
  const isFavorite = isFavoriteCheck(skillName);

  const handleToggle = useCallback(() => {
    toggleFavorite(skillName);
  }, [toggleFavorite, skillName]);

  return (
    <div>
      <button onClick={handleToggle} aria-pressed={isFavorite}>
        {isFavorite ? "お気に入り解除" : "お気に入り"}
      </button>
    </div>
  );
};
```

---

## 7. データフロー図

```
[SkillCard お気に入りトグル]
    |
    v
toggleFavorite(skillName)
    |
    v
skillSlice.favoriteSkillNames (Set<string>) 更新
    |
    +---> persist → customStorage → localStorage (Array<string>に変換)
    |
    +---> useFavoriteSkillNames() → SkillCard 再レンダー

[Agent 実行完了]
    |
    v
setLastExecutionResult(result)
    |
    v
agentSlice.lastExecutionResult 更新
    |
    +---> useLastExecutionResult() → ExecutionResultSummary 表示
    |
    v
addRecentlyUsed(skillName)
    |
    v
skillSlice.recentlyUsedSkills 更新 (先頭追加、20件制限)
    |
    +---> persist → localStorage
    |
    +---> useRecentlyUsedSkills() (useShallow) → RecentlyUsedSection 再レンダー

[EP-4 利用後再評価]
    |
    v
setPostExecutionScore(score)
    |
    v
agentSlice.postExecutionScore 更新
    |
    +---> usePostExecutionScore() → ScoreDelta 表示 + ScoringGateBanner 表示
```

---

## 8. 配置先ファイルパス

| 対象                   | ファイルパス                                                       |
| ---------------------- | ------------------------------------------------------------------ |
| ExecutionResultSummary | `packages/shared/src/types/skill-improver.ts` に追加               |
| skillSlice 拡張        | `apps/desktop/src/renderer/store/slices/skillSlice.ts`             |
| agentSlice 拡張        | `apps/desktop/src/renderer/store/slices/agentSlice.ts`             |
| 個別セレクタ (skill)   | `apps/desktop/src/renderer/store/selectors/skillSelectors.ts`      |
| 個別セレクタ (agent)   | `apps/desktop/src/renderer/store/selectors/agentSelectors.ts`      |
| customStorage          | `apps/desktop/src/renderer/store/storage.ts`（既存ファイルに統合） |
