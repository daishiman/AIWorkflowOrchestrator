# Phase 2: 設計 - UT-W3-ANALYTICS-STORE-INTEGRATION-001

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 2                                     |
| 機能名     | UT-W3-ANALYTICS-STORE-INTEGRATION-001 |
| 作成日     | 2026-04-13                            |
| ステータス | not-started                           |
| 前提Phase  | Phase 1（要件定義）完了               |

---

## 目的

Phase 1 で確定した要件・スコープをもとに、以下の3点を設計として確定する：

1. renderer-side `analyticsSlice` の Zustand slice インターフェース設計
2. `analyticsAdapter` へ直接送信する副作用管理方針
3. 依存方向の確定（循環依存防止）

---

## 実行タスク

| タスクID | タスク名                            | 説明                                                                                   |
| -------- | ----------------------------------- | -------------------------------------------------------------------------------------- |
| T-02-1   | 既存コンポーネント再利用可否確認    | 既存 Zustand slice パターンと analyticsAdapter 直送の妥当性を調査する                  |
| T-02-2   | analyticsSlice インターフェース設計 | State型・Action型・公開APIを定義し、`store-interface.md` に記録する                    |
| T-02-3   | 依存グラフ作成                      | `analyticsSlice` → `analyticsAdapter` の依存方向を図示し、循環依存がないことを確認する |
| T-02-4   | 設計決定書作成                      | action-first 方針・型定義方針・責務境界をまとめた `design-decisions.md` を作成する     |

---

## 設計要点

### analyticsSlice 設計

Zustand の `create()` を使用して以下のスライスを定義する。状態履歴は保持せず、アクションだけを公開する最小構成とする。

```typescript
// アクション型
interface AnalyticsActions {
  trackSkillStart: (skillId: string) => void;
  trackSkillComplete: (skillId: string, duration: number) => void;
  trackSkillError: (skillId: string, error: string | Error) => void;
}

// ストア型
type AnalyticsSlice = AnalyticsActions;
```

#### 公開アクション仕様

| アクション名         | 引数                                      | 内部処理                                                                                |
| -------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------- |
| `trackSkillStart`    | `skillId: string`                         | `SkillAnalyticsEvent` を組み立て、`analyticsAdapter.send("skill_start", ...)` を呼ぶ    |
| `trackSkillComplete` | `skillId: string, duration: number`       | `SkillAnalyticsEvent` を組み立て、`analyticsAdapter.send("skill_complete", ...)` を呼ぶ |
| `trackSkillError`    | `skillId: string, error: string \| Error` | `SkillAnalyticsEvent` を組み立て、`analyticsAdapter.send("skill_error", ...)` を呼ぶ    |

### 副作用管理方針

middleware は採用しない。`trackSkill*` アクションの中で `analyticsAdapter` を直接呼び出す。

- `subscribeWithSelector` は不要
- `immer` も不要
- state 履歴や event バッファは初回スコープに含めない

必要なのは、`SkillAnalyticsEvent` を純粋関数として組み立てる小さなヘルパーだけである。

### 依存方向の確定

依存は必ず一方向に固定する：

```
analyticsSlice
    ↓
analyticsAdapter（apps/desktop/src/renderer/utils/analyticsAdapter.ts）
    ↓
IPC Bridge → Main プロセス
```

**NG（循環依存）**:

```
analyticsSlice → analyticsAdapter → analyticsSlice  ← これは絶対に避ける
```

### 型定義: SkillAnalyticsEvent

```typescript
// packages/shared/src/types/skill-analytics.ts に定義
export type SkillAnalyticsEventType = "start" | "complete" | "error";

export interface SkillAnalyticsEvent {
  type: SkillAnalyticsEventType;
  skillId: string;
  timestamp: string;
  duration?: number;
  error?: string;
}
```

`SkillUsageEvent` は既存の main-process 用型として残し、このタスクでは新しい renderer-side 型として `SkillAnalyticsEvent` を同じ `skill-analytics.ts` に追加する。

---

## 参照資料

| 資料名                  | パス                                                  |
| ----------------------- | ----------------------------------------------------- |
| analyticsAdapter 実装   | `apps/desktop/src/renderer/utils/analyticsAdapter.ts` |
| trackEvent 実装         | `apps/desktop/src/renderer/utils/trackEvent.ts`       |
| 既存 store ディレクトリ | `apps/desktop/src/renderer/store/slices/`             |
| Phase 1 スコープ定義    | `outputs/phase-1/scope-definition.md`                 |
| Phase 1 受入基準        | `outputs/phase-1/acceptance-criteria.md`              |

---

## 設計上の注意点

### 責務境界

| 責務                          | 担当                                                   |
| ----------------------------- | ------------------------------------------------------ |
| スキル実行イベントの組み立て  | `analyticsSlice` の各 action                           |
| イベントの外部送信（IPC経由） | `analyticsAdapter`                                     |
| IPC通信の抽象化               | `analyticsAdapter`                                     |
| `trackEvent` の維持           | 今回のタスクでは変更しない                             |
| UI への analytics データ提供  | 初回スコープ外（将来必要になった時のみ追加を検討する） |

### テスタビリティ確保

- `analyticsAdapter` は DI（依存性注入）またはモジュールモックで差し替え可能な設計にする
- Vitest の `vi.mock()` で `analyticsAdapter` をモックし、送信イベント名と payload を検証できること

### 苦戦箇所への対処

| 苦戦箇所         | 対処方針                                                                 |
| ---------------- | ------------------------------------------------------------------------ |
| 責務境界の曖昧さ | 設計決定書に「analyticsSlice は何をしないか」を明記する                  |
| 副作用の管理     | action-first を採用し、テスト時は analyticsAdapter をモックで制御する    |
| 循環依存リスク   | 依存グラフを作成し、Phase 3 レビューゲートで循環依存がないことを確認する |

---

## 成果物

| 成果物ファイル                        | 内容                                                     |
| ------------------------------------- | -------------------------------------------------------- |
| `outputs/phase-2/design-decisions.md` | action-first 方針・責務境界・型定義方針の設計決定書      |
| `outputs/phase-2/store-interface.md`  | `analyticsSlice` の State型・Action型・公開APIの完全定義 |
| `outputs/phase-2/dependency-graph.md` | 依存方向の図示・循環依存チェック結果                     |

---

## 完了条件

- [ ] 既存コンポーネントの再利用可否を調査・記録した（T-02-1）
- [ ] `analyticsSlice` の State型・Action型・3アクションを設計した（T-02-2）
- [ ] `SkillAnalyticsEvent` 型定義を確定した（T-02-2）
- [ ] 依存グラフを作成し、循環依存がないことを確認した（T-02-3）
- [ ] action-first 方針と export 同期方針を `design-decisions.md` に記録した（T-02-4）
- [ ] 3つの成果物ファイルが `outputs/phase-2/` に存在すること

---

## 次Phase説明

**Phase 3: 設計レビューゲート**

Phase 2 の設計成果物（design-decisions.md / store-interface.md / dependency-graph.md）を多角的にレビューし、Phase 4（テスト作成）へ進めるか判定する。MAJOR指摘があれば Phase 2 に差し戻す。MINOR指摘は `minor-tracking.md` に記録して継続する。
