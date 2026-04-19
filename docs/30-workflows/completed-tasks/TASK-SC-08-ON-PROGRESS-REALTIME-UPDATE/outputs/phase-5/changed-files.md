# 変更ファイル一覧

## メタ情報

| 項目       | 内容                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| Phase      | 5                                                                           |
| 機能名     | TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE                                      |
| タスク名   | onProgressコールバック接続・useStreamingProgressモード別phaseマッピング拡張 |
| 作成日     | 2026-04-19                                                                  |
| ステータス | completed                                                                   |

---

## 1. 変更ファイル

### 修正ファイル

| ファイルパス                                              | 変更種別 | 変更内容概要                       |
| --------------------------------------------------------- | -------- | ---------------------------------- |
| `apps/desktop/src/renderer/hooks/useStreamingProgress.ts` | 修正     | `PHASE_TO_STAGE` に 4 エントリ追加 |

**変更ファイル総数: 1**

---

## 2. 変更なしファイル（確認済み）

| ファイルパス                                                         | 確認結果 | 理由                                                        |
| -------------------------------------------------------------------- | -------- | ----------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx` | 変更なし | `message \|\| generationProgress \|\| ""` 対応済み（SC-06） |
| `apps/desktop/src/renderer/store/slices/generationProgressSlice.ts`  | 変更なし | 既存 `StreamingGenerationStage` 型で全モード対応可能        |
| `apps/desktop/src/preload/skill-creator-api.ts`                      | 変更なし | `phase: string` 汎用型のため変更不要                        |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | 変更なし | `useStreamingProgress` 経由で既に接続済み（SC-07）          |

---

## 3. 変更内容詳細

### `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`

**変更箇所**: `PHASE_TO_STAGE` 定数（27〜43行目付近）

**変更前**:

```typescript
const PHASE_TO_STAGE: Record<string, StreamingGenerationStage> = {
  // create モード
  planning: "planning",
  "generating-skill": "generating-skill",
  "generating-agents": "generating-agents",
  validating: "validating",
  done: "done",
};
```

**変更後**:

```typescript
const PHASE_TO_STAGE: Record<string, StreamingGenerationStage> = {
  // create モード
  planning: "planning",
  "generating-skill": "generating-skill",
  "generating-agents": "generating-agents",
  validating: "validating",
  done: "done",
  // update モード
  "loading-skill": "planning",
  analyzing: "planning",
  // orchestrate モード
  "engine-selection": "planning",
  // improve-prompt モード
  improving: "generating-skill",
};
```

**差分統計**:

| 指標     | 値                     |
| -------- | ---------------------- |
| 追加行数 | 6（コメント 2 行含む） |
| 削除行数 | 0                      |
| 変更行数 | 0                      |

---

## 4. テストファイルへの変更

| ファイルパス                                                             | 変更種別 | 変更内容概要                        |
| ------------------------------------------------------------------------ | -------- | ----------------------------------- |
| `apps/desktop/src/renderer/hooks/__tests__/useStreamingProgress.test.ts` | 追加     | TC-01〜TC-07 の新規テストケース追加 |

---

## 5. 変更最小性の確認

本実装は最小変更の原則に従い、以下を達成している:

- 変更対象ファイル数: **1**（テストファイル除く）
- ロジック変更: **なし**（`mapPhaseToStage` 関数自体は変更なし）
- 型変更: **なし**（`StreamingGenerationStage` 型は変更なし）
- インタフェース変更: **なし**（公開 API は変更なし）
