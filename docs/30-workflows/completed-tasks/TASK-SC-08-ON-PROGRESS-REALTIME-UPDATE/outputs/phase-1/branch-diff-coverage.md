# 変更対象ファイル差分確認

## メタ情報

| 項目       | 内容                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| Phase      | 1                                                                           |
| 機能名     | TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE                                      |
| タスク名   | onProgressコールバック接続・useStreamingProgressモード別phaseマッピング拡張 |
| 作成日     | 2026-04-19                                                                  |
| ステータス | completed                                                                   |

---

## 1. 変更対象ファイル一覧

| ファイルパス                                              | 変更種別 | 変更内容                           |
| --------------------------------------------------------- | -------- | ---------------------------------- |
| `apps/desktop/src/renderer/hooks/useStreamingProgress.ts` | 修正     | `PHASE_TO_STAGE` に 4 エントリ追加 |

**変更ファイル数: 1**

---

## 2. 変更対象外ファイル（確認のみ）

| ファイルパス                                                         | 確認結果                                                       |
| -------------------------------------------------------------------- | -------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx` | 変更不要（`message \|\| generationProgress \|\| ""` 対応済み） |
| `apps/desktop/src/renderer/store/slices/generationProgressSlice.ts`  | 変更不要（既存 stage 型で十分）                                |
| `apps/desktop/src/preload/skill-creator-api.ts`                      | 変更不要（`phase: string` 型のまま使用可）                     |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | 変更不要（`useStreamingProgress` 経由で接続済み）              |

---

## 3. 差分詳細: useStreamingProgress.ts

### 変更前の PHASE_TO_STAGE

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

エントリ数: **5**

### 変更後の PHASE_TO_STAGE

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

エントリ数: **9**（+4）

---

## 4. 差分カバレッジ評価

| 観点                               | 結果 | 備考                                       |
| ---------------------------------- | ---- | ------------------------------------------ |
| update モード phase カバー         | PASS | `loading-skill`, `analyzing` 追加          |
| orchestrate モード phase カバー    | PASS | `engine-selection` 追加                    |
| improve-prompt モード phase カバー | PASS | `improving` 追加                           |
| create モード既存 phase 保持       | PASS | 既存 5 エントリ変更なし                    |
| フォールバック維持                 | PASS | `?? "planning"` ロジック変更なし           |
| 型安全性                           | PASS | 全値が `StreamingGenerationStage` 型に適合 |
| 変更ファイル最小化                 | PASS | 1 ファイルのみ変更                         |

---

## 5. 影響範囲分析

### 直接影響

- `useStreamingProgress` を利用するコンポーネント（`SkillCreateWizard` 経由）に、
  update / orchestrate / improve-prompt モードの進捗が正しく反映されるようになる。

### 間接影響

- `GenerateStep.tsx` の `stage` プロパティに正しい stage が渡されるため、
  ステップリストの active / completed 表示が各モードで機能する。

### 非影響範囲

- IPC チャネル実装（Main プロセス側）
- Preload API 定義
- 状態管理スライスの型定義
- テスト以外の UI コンポーネント
