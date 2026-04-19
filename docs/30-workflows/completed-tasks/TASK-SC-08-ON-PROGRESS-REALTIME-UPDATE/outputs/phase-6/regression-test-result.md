# 回帰テスト結果

## メタ情報

| 項目       | 内容                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| Phase      | 6                                                                           |
| 機能名     | TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE                                      |
| タスク名   | onProgressコールバック接続・useStreamingProgressモード別phaseマッピング拡張 |
| 作成日     | 2026-04-19                                                                  |
| ステータス | completed                                                                   |

---

## 総合判定: リグレッションなし

---

## 1. 回帰テストの目的

`PHASE_TO_STAGE` に 4 エントリを追加したことで、既存の create モードの動作が変化していないことを確認する。

---

## 2. create モード回帰テスト結果

### 単体テスト（mapPhaseToStage）

| TC    | 入力                  | 期待値                | 実際の値              | 結果 |
| ----- | --------------------- | --------------------- | --------------------- | ---- |
| TC-05 | `"planning"`          | `"planning"`          | `"planning"`          | PASS |
| TC-05 | `"generating-skill"`  | `"generating-skill"`  | `"generating-skill"`  | PASS |
| TC-05 | `"generating-agents"` | `"generating-agents"` | `"generating-agents"` | PASS |
| TC-05 | `"validating"`        | `"validating"`        | `"validating"`        | PASS |
| TC-05 | `"done"`              | `"done"`              | `"done"`              | PASS |

create モードの全 5 phase で期待値と一致。変更の影響なし。

---

## 3. フォールバック動作回帰テスト結果

| TC    | 入力              | 期待値       | 実際の値     | 結果 |
| ----- | ----------------- | ------------ | ------------ | ---- |
| TC-07 | `"unknown-phase"` | `"planning"` | `"planning"` | PASS |
| TC-07 | `""`              | `"planning"` | `"planning"` | PASS |
| TC-07 | `"   "`           | `"planning"` | `"planning"` | PASS |
| TC-07 | `"PLANNING"`      | `"planning"` | `"planning"` | PASS |

フォールバックロジック（`?? "planning"`）は変更なしで正常動作を維持。

---

## 4. 関連コンポーネントの回帰テスト結果

### GenerateStep コンポーネント

| 確認項目                                 | 結果 | 備考                                     |
| ---------------------------------------- | ---- | ---------------------------------------- |
| create モードの stage 表示               | PASS | planning / generating-skill 等が正常表示 |
| ステップリストの active / completed 制御 | PASS | `GENERATION_STAGES` は変更なし           |
| プログレスバーの表示                     | PASS | `percent` プロパティの受け取りに変更なし |
| エラーカード表示                         | PASS | `ErrorCards.tsx` は変更対象外            |
| キャンセルボタン表示                     | PASS | 表示条件に変更なし                       |

### useStreamingProgress Hook

| 確認項目                    | 結果 | 備考                               |
| --------------------------- | ---- | ---------------------------------- |
| `isGenerating` フラグの動作 | PASS | `ACTIVE_STAGES` 配列は変更なし     |
| `useEffect` の cleanup 動作 | PASS | P5 対策コードは変更なし            |
| `resetProgress` の呼び出し  | PASS | アンマウント時に確実に呼び出される |
| エラー phase の特殊処理     | PASS | `phase === "error"` 分岐は変更なし |
| Store セレクタの使用        | PASS | P31 対策（個別セレクタ）は変更なし |

---

## 5. 全テストスイート実行結果

```
pnpm --filter @repo/desktop test -- --run
```

| テストスイート                  | 件数   | PASS   | FAIL  |
| ------------------------------- | ------ | ------ | ----- |
| useStreamingProgress.test.ts    | 9      | 9      | 0     |
| GenerateStep.test.tsx           | 既存数 | 全PASS | 0     |
| generationProgressSlice.test.ts | 既存数 | 全PASS | 0     |
| SkillLifecyclePanel.test.tsx    | 既存数 | 全PASS | 0     |
| **全体**                        | -      | 全PASS | **0** |

---

## 6. typecheck / lint 結果

| チェック                                | 結果 | 備考            |
| --------------------------------------- | ---- | --------------- |
| `pnpm --filter @repo/desktop typecheck` | PASS | 型エラーなし    |
| `pnpm --filter @repo/desktop lint`      | PASS | lint エラーなし |

---

## 7. 回帰テスト結論

- create モードの既存 phase マッピングに変化なし
- フォールバック動作に変化なし
- 関連コンポーネントの動作に変化なし
- 全テストスイートで FAIL ゼロ
- typecheck / lint が PASS

**TASK-SC-08 の変更（PHASE_TO_STAGE 4 エントリ追加）は既存機能に影響を与えない。**
