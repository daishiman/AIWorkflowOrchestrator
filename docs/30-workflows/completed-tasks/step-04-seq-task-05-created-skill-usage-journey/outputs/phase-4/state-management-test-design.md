# Phase 4 状態管理テスト仕様

## メタ情報

| 項目     | 値                           |
| -------- | ---------------------------- |
| タスクID | TASK-SKILL-LIFECYCLE-05      |
| タスク名 | 作成済みスキルを使う主導線   |
| Phase    | 4                            |
| 成果物   | state-management-test-design |
| 作成日   | 2026-03-15                   |

---

## 概要

P31（Zustand Store Hooks 無限ループ）および P48（useShallow 未適用による派生セレクタ無限ループ）に準拠した状態管理設計の検証テストケースを定義する。セレクタの設計パターン・参照安定性・永続化対応を検証する。

---

## TC-STATE-01: favoriteSkillNames セレクタ設計

| 項目            | 内容                                              |
| --------------- | ------------------------------------------------- |
| テストケース ID | TC-STATE-01                                       |
| テスト種別      | 設計検証テスト（状態管理）                        |
| 検証対象        | `useFavoriteSkillNames` セレクタの設計            |
| 前提条件        | Phase 2 state-management-design.md が存在すること |

### 検証項目

| #   | チェック項目     | 期待設計                                                                      | P31/P48 関連 |
| --- | ---------------- | ----------------------------------------------------------------------------- | ------------ |
| 1   | セレクタ形式     | `useAppStore((state) => state.favoriteSkillNames)` として定義（個別セレクタ） | P31 準拠     |
| 2   | 合成 Hook 不使用 | `useSkillStore()` 等の合成 Hook を経由していないこと                          | P31 準拠     |
| 3   | 戻り値型         | `Set<string>` を返す                                                          | -            |
| 4   | useShallow 要否  | Set 型は参照同一性が保たれるため useShallow 不要                              | P48 考慮済   |

### 合否基準

個別セレクタ形式で定義され、合成 Hook の使用がなければ PASS。

---

## TC-STATE-02: recentlyUsedSkills セレクタ設計（P48 チェック）

| 項目            | 内容                                   |
| --------------- | -------------------------------------- |
| テストケース ID | TC-STATE-02                            |
| テスト種別      | 設計検証テスト（状態管理）             |
| 検証対象        | `useRecentlyUsedSkills` セレクタの設計 |

### 検証項目

| #   | チェック項目    | 期待設計                                                       | P48 関連 |
| --- | --------------- | -------------------------------------------------------------- | -------- |
| 1   | セレクタ形式    | `useAppStore(useShallow((state) => state.recentlyUsedSkills))` | P48 準拠 |
| 2   | useShallow 適用 | 配列を返すセレクタに `useShallow` が適用されていること         | P48 必須 |
| 3   | import 元       | `import { useShallow } from "zustand/react/shallow"`           | P48 準拠 |
| 4   | 戻り値型        | `RecentlyUsedSkill[]`（skillName + timestamp の配列）          | -        |

### P48 リスクシナリオ

useShallow 未適用の場合:

1. `.filter()` / `.map()` による新しい配列参照が毎回生成される
2. `Object.is` 比較で常に false → useSyncExternalStore が無限ループ
3. コンポーネントが無限再レンダー → UI フリーズ

### 合否基準

`useShallow` が適用されていれば PASS、未適用なら FAIL（無限ループリスク）。

---

## TC-STATE-03: lastExecutionResult セレクタ設計

| 項目            | 内容                                                                                         |
| --------------- | -------------------------------------------------------------------------------------------- |
| テストケース ID | TC-STATE-03                                                                                  |
| テスト種別      | 設計検証テスト（状態管理）                                                                   |
| 検証対象        | `agentSlice.lastExecutionResult` と `agentSlice.postExecutionScore` のリセットタイミング設計 |

### 検証項目

| #   | チェック項目    | 期待設計                                                                  |
| --- | --------------- | ------------------------------------------------------------------------- |
| 1   | 初期値          | `lastExecutionResult: null`, `postExecutionScore: null`                   |
| 2   | 設定タイミング  | Agent 実行完了時に `ExecutionResult` を設定                               |
| 3   | リセット地点1   | 新規スキル実行開始時に `null` にリセット                                  |
| 4   | リセット地点2   | Agent 画面離脱時に `null` にリセット                                      |
| 5   | ScoreDelta 計算 | `postExecutionScore - preExecutionScore` で計算、両方 non-null の場合のみ |

### リセットタイミング状態遷移

```
[初期状態] lastExecutionResult = null
    |
    v
[実行開始] → リセット: lastExecutionResult = null (地点1)
    |
    v
[実行完了] → 設定: lastExecutionResult = ExecutionResult
    |
    v
[画面離脱] → リセット: lastExecutionResult = null (地点2)
```

### 合否基準

リセットタイミング（実行開始時・画面離脱時の2地点）が設計書に明記されていれば PASS。

---

## TC-STATE-04: Zustand persist の Set 型対応

| 項目            | 内容                                                                      |
| --------------- | ------------------------------------------------------------------------- |
| テストケース ID | TC-STATE-04                                                               |
| テスト種別      | 設計検証テスト（状態管理）                                                |
| 検証対象        | `favoriteSkillNames: Set<string>` の Zustand persist `customStorage` 対応 |

### 検証項目

| #   | チェック項目   | 期待設計                                                  |
| --- | -------------- | --------------------------------------------------------- |
| 1   | シリアライズ   | `Set<string>` → `Array<string>` に変換して JSON.stringify |
| 2   | デシリアライズ | `Array<string>` → `new Set<string>()` で復元              |
| 3   | 破損データ対応 | 配列以外の値が保存されている場合、空の Set で初期化       |
| 4   | バリデーション | 配列要素が全て string 型であることを検証                  |

### customStorage 設計パターン

```typescript
// 期待設計パターン（設計書に含まれるべき内容）
const customStorage = {
  getItem: (name: string) => {
    const raw = localStorage.getItem(name);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // favoriteSkillNames の復元
    if (parsed?.state?.favoriteSkillNames) {
      const arr = parsed.state.favoriteSkillNames;
      parsed.state.favoriteSkillNames = Array.isArray(arr)
        ? new Set(arr.filter((v: unknown) => typeof v === "string"))
        : new Set<string>();
    }
    return parsed;
  },
  setItem: (name: string, value: unknown) => {
    const serializable = JSON.parse(
      JSON.stringify(value, (_, v) => (v instanceof Set ? [...v] : v)),
    );
    localStorage.setItem(name, JSON.stringify(serializable));
  },
  removeItem: (name: string) => localStorage.removeItem(name),
};
```

### 合否基準

customStorage に Set 対応のシリアライズ/デシリアライズ設計が含まれていれば PASS。

---

## P31/P48 コンプライアンスチェックリスト

| #   | チェック項目                     | 対象セレクタ           | 結果     |
| --- | -------------------------------- | ---------------------- | -------- |
| 1   | 合成 Hook 不使用                 | useFavoriteSkillNames  | 検証対象 |
| 2   | 合成 Hook 不使用                 | useRecentlyUsedSkills  | 検証対象 |
| 3   | 合成 Hook 不使用                 | useIsFavorite          | 検証対象 |
| 4   | useShallow 適用（配列）          | useRecentlyUsedSkills  | 検証対象 |
| 5   | useShallow 不要（Set型）         | useFavoriteSkillNames  | 検証対象 |
| 6   | useShallow 不要（プリミティブ）  | useLastExecutionResult | 検証対象 |
| 7   | useEffect 依存配列に合成Hook禁止 | 全コンポーネント       | 検証対象 |

---

## テストケース集計

| テストケース ID | カテゴリ           | Pitfall 関連 |
| --------------- | ------------------ | ------------ |
| TC-STATE-01     | セレクタ設計       | P31          |
| TC-STATE-02     | 派生セレクタ       | P48          |
| TC-STATE-03     | リセットタイミング | -            |
| TC-STATE-04     | Persist Set型対応  | -            |
