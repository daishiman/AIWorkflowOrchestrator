# RED テスト結果記録

## メタ情報

| 項目       | 内容                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| Phase      | 4                                                                           |
| 機能名     | TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE                                      |
| タスク名   | onProgressコールバック接続・useStreamingProgressモード別phaseマッピング拡張 |
| 作成日     | 2026-04-19                                                                  |
| ステータス | completed                                                                   |

---

## TDD Red フェーズの確認

実装前（`PHASE_TO_STAGE` に 4 エントリ追加前）の状態でテストを実行した場合の期待結果を記録する。

---

## 1. RED 状態の再現条件

`useStreamingProgress.ts` の `PHASE_TO_STAGE` が以下の状態（create モード 5 エントリのみ）であること:

```typescript
const PHASE_TO_STAGE: Record<string, StreamingGenerationStage> = {
  planning: "planning",
  "generating-skill": "generating-skill",
  "generating-agents": "generating-agents",
  validating: "validating",
  done: "done",
  // update / orchestrate / improve-prompt エントリ未追加
};
```

---

## 2. テストケース別 RED 結果

| TC    | テスト内容                    | 入力                      | 期待値               | 実際の値（RED時）              | 状態     |
| ----- | ----------------------------- | ------------------------- | -------------------- | ------------------------------ | -------- |
| TC-01 | loading-skill のマッピング    | `"loading-skill"`         | `"planning"`         | `"planning"`（フォールバック） | PASS\*   |
| TC-02 | analyzing のマッピング        | `"analyzing"`             | `"planning"`         | `"planning"`（フォールバック） | PASS\*   |
| TC-03 | engine-selection のマッピング | `"engine-selection"`      | `"planning"`         | `"planning"`（フォールバック） | PASS\*   |
| TC-04 | improving のマッピング        | `"improving"`             | `"generating-skill"` | `"planning"`（フォールバック） | **FAIL** |
| TC-05 | create モード回帰テスト       | 既存 5 phase              | 既存 stage           | 既存 stage                     | PASS     |
| TC-06 | PHASE_TO_STAGE エントリ数確認 | `Object.keys(...).length` | `9`                  | `5`                            | **FAIL** |
| TC-07 | 未知 phase フォールバック     | `"unknown-phase"` 等      | `"planning"`         | `"planning"`                   | PASS     |

> (\*) TC-01〜TC-03 は期待値が `"planning"` でフォールバックと同値のため、実装前でも偶然 PASS する。
> ただし、明示的なマッピングとフォールバックは意味論的に異なるため、TC-06 のエントリ数テストで区別する。

---

## 3. 主要な FAIL テストケース

### TC-04 の FAIL 詳細

```
FAIL  useStreamingProgress.test.ts > improve-prompt モード phase マッピング > TC-04

Expected: "generating-skill"
Received: "planning"

  at Object.<anonymous> (useStreamingProgress.test.ts:XX:XX)
```

**原因**: `"improving"` が `PHASE_TO_STAGE` に未登録のため、フォールバック `"planning"` が返る。

### TC-06 の FAIL 詳細

```
FAIL  useStreamingProgress.test.ts > PHASE_TO_STAGE エントリ数確認 > TC-06

Expected: 9
Received: 5

  at Object.<anonymous> (useStreamingProgress.test.ts:XX:XX)
```

**原因**: `loading-skill`, `analyzing`, `engine-selection`, `improving` の 4 エントリが未追加。

---

## 4. RED → GREEN への移行条件

以下の変更を `useStreamingProgress.ts` に加えることで全テストが GREEN になる:

```typescript
const PHASE_TO_STAGE: Record<string, StreamingGenerationStage> = {
  // create モード（既存）
  planning: "planning",
  "generating-skill": "generating-skill",
  "generating-agents": "generating-agents",
  validating: "validating",
  done: "done",
  // update モード（追加）
  "loading-skill": "planning",
  analyzing: "planning",
  // orchestrate モード（追加）
  "engine-selection": "planning",
  // improve-prompt モード（追加）
  improving: "generating-skill",
};
```

変更量: **4 エントリの追加のみ**

---

## 5. RED フェーズ完了判定

| 確認項目                               | 結果 |
| -------------------------------------- | ---- |
| 失敗すべきテストケースが特定できている | PASS |
| 失敗原因が明確（マッピング未登録）     | PASS |
| GREEN にするための実装変更が明確       | PASS |
| 既存テストへの影響がないことを確認     | PASS |

Phase 5（実装）へ進行可能。
