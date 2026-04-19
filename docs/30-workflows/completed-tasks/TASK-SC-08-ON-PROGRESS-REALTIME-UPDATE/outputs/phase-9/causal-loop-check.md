# Phase 9 成果物: 因果ループ監査

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| タスク     | TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE |
| Phase      | 9                                      |
| 作成日     | 2026-04-19                             |
| ステータス | 完了                                   |

## 概要

本タスクの変更（`PHASE_TO_STAGE`マップへの4エントリ追加）が新規の障害ループを生む可能性を監査する。

## 強化ループ（正のフィードバック）分析

### ループ 1: progress表示 → UX向上ループ

```
onProgress受信（phaseメッセージ）
  → PHASE_TO_STAGEマップで stage 解決
    → generationProgress更新（dispatch）
      → GenerateStep.tsx でメッセージ動的表示
        → ユーザー体験向上（進捗が見える）
          → より詳細なphase情報要求
            → PHASE_TO_STAGEマップ拡張ニーズ
              → onProgress受信（ループ拡大）
```

**判定**: 想定内の強化ループ。フラットマップ設計によりマップ拡張コストが最小化されており、
ループ拡大時のメンテナンス負荷は低い。新規障害リスクなし。

## バランスループ（負のフィードバック）分析

### ループ 2: isGenerating ライフサイクルループ

```
isGenerating = true
  → useEffect発火 → onProgressリスナー登録
    → executePlan実行 → phaseメッセージ送信
      → onProgressコールバック着信
        → dispatch(setGenerationProgress)
          → Store更新 → UI表示更新
            → 処理完了（isGenerating = false）
              → useEffect cleanup発火
                → onProgressリスナー解除
                  → isGenerating = false（ループ終端）
```

**判定**: 正常なバランスループ。cleanup漏れがない限り自己終端する設計。
R-01対策（cleanup実装）により安定動作を確認済み。

### ループ 3: フォールバックループ（潜在的問題）

```
未知phaseメッセージ受信
  → PHASE_TO_STAGEルックアップ → キー未定義
    → "planning"フォールバック適用
      → generationProgress.stage = "planning"
        → UI表示（planning段階として表示）
          → ユーザーが誤認する可能性
            → 新規phaseをマップに追加要求
              → PHASE_TO_STAGEマップ拡張
                → 未知phase消滅（ループ終端）
```

**判定**: フォールバックは意図的設計。未知phaseが`"planning"`にマッピングされることで
UIが壊れず、ユーザーはphase追加要求を出せる。自己修正ループとして機能。
新規障害リスクなし。

## 修正が新規障害を生む可能性（差分分析）

### 追加エントリによる影響

| 追加エントリ                         | 潜在的影響                               | 障害リスク |
| ------------------------------------ | ---------------------------------------- | ---------- |
| `"loading-skill"` → `"planning"`     | 既存createモードの`"planning"`キーと共存 | なし       |
| `"analyzing"` → `"planning"`         | 既存createモードのキーと競合なし         | なし       |
| `"engine-selection"` → `"planning"`  | 既存キーと競合なし                       | なし       |
| `"improving"` → `"generating-skill"` | 既存`"generating-skill"`キーと共存       | なし       |

**全エントリで既存キーとの競合なし。新規障害なし。**

### create モードへの退行リスク

本タスクの変更前は、`"loading-skill"`, `"analyzing"`, `"engine-selection"`, `"improving"` が
PHASE_TO_STAGEに未登録のため `"planning"` フォールバックに落ちていた。
追加後も`"loading-skill"`, `"analyzing"`, `"engine-selection"` は明示的に `"planning"` にマッピングされ、
フォールバック動作と同一結果となる（AC-4への退行なし）。

`"improving"` のみ `"generating-skill"` への変更があるが、これは仕様通りの修正（AC-4充足）。

## 監査結論

| ループ種別       | 検出されたループ | 新規障害リスク | 判定     |
| ---------------- | ---------------- | -------------- | -------- |
| 強化ループ       | 1件（想定内）    | なし           | 問題なし |
| バランスループ   | 2件（正常動作）  | なし           | 問題なし |
| 差分による新障害 | 0件              | なし           | 問題なし |

**因果ループ監査: 異常なし。Phase 10（最終レビュー）への移行可。**
