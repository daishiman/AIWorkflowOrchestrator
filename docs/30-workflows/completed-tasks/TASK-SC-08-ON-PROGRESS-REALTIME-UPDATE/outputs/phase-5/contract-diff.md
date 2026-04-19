# PHASE_TO_STAGE 変更前後の差分

## メタ情報

| 項目       | 内容                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| Phase      | 5                                                                           |
| 機能名     | TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE                                      |
| タスク名   | onProgressコールバック接続・useStreamingProgressモード別phaseマッピング拡張 |
| 作成日     | 2026-04-19                                                                  |
| ステータス | completed                                                                   |

---

## 1. 変更対象

**ファイル**: `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`  
**変更箇所**: `PHASE_TO_STAGE` 定数（モジュールスコープ）

---

## 2. 差分（unified diff 形式）

```diff
 const PHASE_TO_STAGE: Record<string, StreamingGenerationStage> = {
   // create モード
   planning: "planning",
   "generating-skill": "generating-skill",
   "generating-agents": "generating-agents",
   validating: "validating",
   done: "done",
+  // update モード
+  "loading-skill": "planning",
+  analyzing: "planning",
+  // orchestrate モード
+  "engine-selection": "planning",
+  // improve-prompt モード
+  improving: "generating-skill",
 };
```

---

## 3. エントリ対応表（変更前後）

### 変更前（5 エントリ）

| キー（phase 名）    | 値（stage）           | モード |
| ------------------- | --------------------- | ------ |
| `planning`          | `"planning"`          | create |
| `generating-skill`  | `"generating-skill"`  | create |
| `generating-agents` | `"generating-agents"` | create |
| `validating`        | `"validating"`        | create |
| `done`              | `"done"`              | create |

### 変更後（9 エントリ）

| キー（phase 名）    | 値（stage）           | モード         | 変更種別 |
| ------------------- | --------------------- | -------------- | -------- |
| `planning`          | `"planning"`          | create         | 変更なし |
| `generating-skill`  | `"generating-skill"`  | create         | 変更なし |
| `generating-agents` | `"generating-agents"` | create         | 変更なし |
| `validating`        | `"validating"`        | create         | 変更なし |
| `done`              | `"done"`              | create         | 変更なし |
| `loading-skill`     | `"planning"`          | update         | **追加** |
| `analyzing`         | `"planning"`          | update         | **追加** |
| `engine-selection`  | `"planning"`          | orchestrate    | **追加** |
| `improving`         | `"generating-skill"`  | improve-prompt | **追加** |

---

## 4. フォールバック動作への影響

`mapPhaseToStage` 関数のフォールバックロジックに変更はない:

```typescript
// 変更前・変更後ともに同じ
function mapPhaseToStage(phase: string): StreamingGenerationStage {
  return PHASE_TO_STAGE[phase] ?? "planning";
}
```

### フォールバック適用範囲の変化

| phase 名           | 変更前の動作                  | 変更後の動作                          |
| ------------------ | ----------------------------- | ------------------------------------- |
| `loading-skill`    | フォールバック → `"planning"` | 明示マッピング → `"planning"`         |
| `analyzing`        | フォールバック → `"planning"` | 明示マッピング → `"planning"`         |
| `engine-selection` | フォールバック → `"planning"` | 明示マッピング → `"planning"`         |
| `improving`        | フォールバック → `"planning"` | 明示マッピング → `"generating-skill"` |

> `improving` のみ、フォールバック時と明示マッピング時で **返却値が変わる**（`"planning"` → `"generating-skill"`）。
> これが本タスクの主要な機能的変更点である。

---

## 5. 型安全性の確認

追加された 4 エントリの値はすべて `StreamingGenerationStage` 型の有効な値:

| 値                   | `StreamingGenerationStage` 型に含まれるか |
| -------------------- | ----------------------------------------- |
| `"planning"`         | はい                                      |
| `"generating-skill"` | はい                                      |

TypeScript コンパイラによる型チェックは変更なしで PASS する。

---

## 6. 変更影響の境界

| 影響範囲                                 | 変更あり | 備考                   |
| ---------------------------------------- | -------- | ---------------------- |
| `PHASE_TO_STAGE` オブジェクト            | あり     | 4 エントリ追加         |
| `mapPhaseToStage` 関数本体               | なし     | ロジック変更なし       |
| `useStreamingProgress` Hook の useEffect | なし     | 接続ロジック変更なし   |
| `StreamingGenerationStage` 型定義        | なし     | 型変更なし             |
| `useStreamingProgress` の戻り値型        | なし     | インタフェース変更なし |
| 呼び出し元コンポーネント                 | なし     | Props 変更なし         |
