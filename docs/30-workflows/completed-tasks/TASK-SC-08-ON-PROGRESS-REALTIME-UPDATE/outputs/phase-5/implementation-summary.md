# 実装サマリー

## メタ情報

| 項目       | 内容                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| Phase      | 5                                                                           |
| 機能名     | TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE                                      |
| タスク名   | onProgressコールバック接続・useStreamingProgressモード別phaseマッピング拡張 |
| 作成日     | 2026-04-19                                                                  |
| ステータス | completed                                                                   |

---

## 1. 実装概要

### 変更内容

`apps/desktop/src/renderer/hooks/useStreamingProgress.ts` 内の `PHASE_TO_STAGE` 定数に、
update / orchestrate / improve-prompt モードで使用される phase 名を 4 エントリ追加した。

### 変更規模

| 指標           | 値                               |
| -------------- | -------------------------------- |
| 変更ファイル数 | 1                                |
| 追加行数       | 6（コメント2行含む）             |
| 削除行数       | 0                                |
| 変更種別       | 定数オブジェクトへのエントリ追加 |

---

## 2. 実装内容詳細

### PHASE_TO_STAGE マップへの追加エントリ

```typescript
// update モード
"loading-skill": "planning",
analyzing: "planning",
// orchestrate モード
"engine-selection": "planning",
// improve-prompt モード
improving: "generating-skill",
```

### 実装後の PHASE_TO_STAGE 全体

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

---

## 3. 実装判断の記録

### GenerateStep.tsx の変更が不要な理由

`GenerateStep.tsx` は `const currentMessage = message || generationProgress || ""` として
既に動的メッセージ表示に対応済み（TASK-SC-06 の成果）。追加実装不要。

### generationProgressSlice.ts の型変更が不要な理由

既存の `StreamingGenerationStage` 型（8 種類）は全モードの進捗状態をカバーできる。
update の `loading-skill` は `"planning"` に、improve-prompt の `improving` は `"generating-skill"` に
それぞれ吸収できるため、新 stage の追加は不要。

### SkillLifecyclePanel.tsx への onProgress 追加接続が不要な理由

`useStreamingProgress.ts` の `useEffect` 内で `skillCreatorAPI.onProgress` への接続が
既に実装済み（TASK-SC-07 の成果）。SkillCreateWizard 経由で接続されており、二重登録は不要。

---

## 4. AC 充足確認

| AC   | 実装による充足状況                                                 | 結果 |
| ---- | ------------------------------------------------------------------ | ---- |
| AC-1 | `loading-skill` → `planning`, `analyzing` → `planning` を明示追加  | PASS |
| AC-2 | `engine-selection` → `planning` を明示追加                         | PASS |
| AC-3 | `improving` → `generating-skill` を明示追加                        | PASS |
| AC-4 | 既存 5 エントリは変更なし                                          | PASS |
| AC-5 | `?? "planning"` フォールバックは変更なし                           | PASS |
| AC-6 | 追加値はすべて `StreamingGenerationStage` 型に適合。typecheck PASS | PASS |

---

## 5. テスト実行結果

### TC-01〜TC-09 の GREEN 確認

| TC    | 結果  | 備考                                       |
| ----- | ----- | ------------------------------------------ |
| TC-01 | GREEN | `loading-skill` → `planning` 確認          |
| TC-02 | GREEN | `analyzing` → `planning` 確認              |
| TC-03 | GREEN | `engine-selection` → `planning` 確認       |
| TC-04 | GREEN | `improving` → `generating-skill` 確認      |
| TC-05 | GREEN | create モード既存 phase 変更なし確認       |
| TC-06 | GREEN | `Object.keys(PHASE_TO_STAGE).length === 9` |
| TC-07 | GREEN | 未知 phase → `planning` フォールバック確認 |
| TC-08 | GREEN | onProgress → Store 更新フロー確認          |
| TC-09 | GREEN | GenerateStep 動的メッセージ表示確認        |

### 型チェック・Lint

| チェック         | 結果 |
| ---------------- | ---- |
| `pnpm typecheck` | PASS |
| `pnpm lint`      | PASS |

---

## 6. 実装完了判定

すべての AC（AC-1〜AC-6）が充足され、TC-01〜TC-09 が GREEN、typecheck/lint が PASS した。
Phase 6（テスト拡充）へ進行する。
