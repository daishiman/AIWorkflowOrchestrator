# Phase 7: カバレッジ確認 - Integration Gate

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| タスクID   | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001 |
| Phase      | 7                                              |
| 作成日     | 2026-03-24                                     |
| 依存Phase  | Phase 4-6                                      |
| 成果物種別 | integration-gate                               |

## Gate 概要

Integration gate は 4 つの軸で Phase 4-6 のテスト成果物を統合検証する。全軸で PASS を得ることが Phase 8（リファクタリング）着手の前提条件である。

---

## 軸 1: Route Axis

> ViewType → renderView → View 描画の e2e 検証

### 検証チェーン

```
ViewType("executionConsole") 定義
  → setCurrentView("executionConsole") 呼出
    → useAppStore.currentView === "executionConsole"
      → App.tsx renderView() case 分岐
        → <ExecutionConsoleView /> 描画
```

### Gate 項目

| ID    | 検証項目                                                   | テスト ID    | PASS 条件                                                    |
| ----- | ---------------------------------------------------------- | ------------ | ------------------------------------------------------------ |
| RG-01 | `ViewType` union に `executionConsole` が含まれる          | R-1          | TypeScript コンパイルが通る + テストアサーション PASS        |
| RG-02 | `renderView("executionConsole")` で stub View が描画される | R-2          | `screen.getByText` で stub 内テキストが取得できる            |
| RG-03 | `openExecutionConsole()` が `setCurrentView` を正しく呼ぶ  | R-3          | spy で `setCurrentView("executionConsole")` の呼出を検証     |
| RG-04 | lazy import で chunk 分離される                            | -            | `React.lazy(() => import(...))` が使用されている（静的検証） |
| RG-05 | 二重遷移で viewHistory が汚染されない                      | EC-01, EC-02 | viewHistory に連続同一エントリが存在しない                   |
| RG-06 | StrictMode / unmount で stale handler が残らない           | EC-07, EC-08 | handler 発火回数が 1 回                                      |

### 判定基準

| 結果     | 条件                     | 次アクション   |
| -------- | ------------------------ | -------------- |
| **PASS** | RG-01〜RG-06 全項目 PASS | 軸 2 へ進む    |
| **FAIL** | いずれか 1 項目でも FAIL | Phase 6 差戻し |

---

## 軸 2: Label Axis

> 全 surface で表示される label 文字列の一致検証

### 検証対象

| Surface       | コンポーネント               | 期待 label             | テスト ID |
| ------------- | ---------------------------- | ---------------------- | --------- |
| App Shell     | GlobalNavStrip item          | `実行コンソール`       | L-1       |
| App Shell     | ExecutionConsoleLauncher     | `実行コンソール`       | L-1       |
| Chat          | ChatPanel CTA                | `実行コンソールを開く` | L-2       |
| Chat          | LLMGuidanceBanner secondary  | `実行コンソールを開く` | L-2       |
| Chat          | HandoffBlock                 | `端末で続ける`         | L-2       |
| Chat          | TerminalHandoffCard          | `端末で続ける`         | L-2       |
| Workspace     | WorkspaceChatPanel secondary | `実行コンソールを開く` | -         |
| Skill Creator | (後続定義)                   | `実行コンソールで実行` | -         |

### Gate 項目

| ID    | 検証項目                                          | テスト ID | PASS 条件                                        |
| ----- | ------------------------------------------------- | --------- | ------------------------------------------------ |
| LG-01 | primary label が `実行コンソール` 系で統一        | L-1, L-2  | 各 surface の CTA label がテーブルの期待値と一致 |
| LG-02 | handoff label が `端末で続ける` で統一            | L-2       | HandoffBlock / TerminalHandoffCard の label 一致 |
| LG-03 | `ターミナルを開く` が renderer 内に存在しない     | EC-09     | `grep` 結果 0 件                                 |
| LG-04 | `terminal を開く` が renderer 内に存在しない      | EC-10     | `grep` 結果 0 件                                 |
| LG-05 | narrow width で mobileLabel `実行` が表示される   | EC-05     | viewport 768px 未満で省略ラベルが表示される      |
| LG-06 | icon-only 表示で `aria-label` が `実行コンソール` | EC-16     | `aria-label` 属性値のアサーション PASS           |

### 判定基準

| 結果     | 条件                                 | 次アクション   |
| -------- | ------------------------------------ | -------------- |
| **PASS** | LG-01〜LG-04 全 PASS + LG-05,06 推奨 | 軸 3 へ進む    |
| **FAIL** | LG-01〜LG-04 のいずれかが FAIL       | Phase 6 差戻し |

---

## 軸 3: CTA Axis

> click → openExecutionConsole() → setCurrentView の chain 検証

### 検証チェーン

```
[User Click]
  → CTA onClick handler
    → openExecutionConsole()
      → useAppStore.getState().setCurrentView("executionConsole")
        → currentView 更新
          → renderView で ExecutionConsoleView 描画
```

### Gate 項目

| ID    | 検証項目                                                        | テスト ID | PASS 条件                                             |
| ----- | --------------------------------------------------------------- | --------- | ----------------------------------------------------- |
| CG-01 | App Shell CTA click → `openExecutionConsole()` 呼出             | C-1       | spy で `openExecutionConsole` の呼出を検証            |
| CG-02 | ChatPanel CTA click → `openExecutionConsole()` 呼出             | C-2       | spy で `openExecutionConsole` の呼出を検証            |
| CG-03 | WorkspaceChatPanel CTA click → `openExecutionConsole()` 呼出    | C-3       | spy で `openExecutionConsole` の呼出を検証            |
| CG-04 | Skill Creator CTA click → `openExecutionConsole()` 呼出         | C-4       | spy で `openExecutionConsole` の呼出を検証            |
| CG-05 | `openExecutionConsole()` → `setCurrentView("executionConsole")` | R-3       | store 状態の変更を検証                                |
| CG-06 | unavailable 時に CTA click で遷移しない                         | EC-03     | `openExecutionConsole` が呼ばれない + ボタン disabled |
| CG-07 | narrow width CTA click で正常遷移                               | EC-06     | `openExecutionConsole` が呼ばれる                     |
| CG-08 | dispatcher に `openExecutionConsole` が配線済み                 | EC-15     | `createGuidanceActionDispatcher` の map に key が存在 |

### Surface 別 Chain 完全性

| Surface       | Click 検証 | Action 検証 | Store 検証 | View 検証 | Chain 完全 |
| ------------- | ---------- | ----------- | ---------- | --------- | ---------- |
| App Shell     | CG-01      | CG-05       | CG-05      | RG-02     | 必須       |
| Chat          | CG-02      | CG-05       | CG-05      | RG-02     | 必須       |
| Workspace     | CG-03      | CG-05       | CG-05      | RG-02     | 必須       |
| Skill Creator | CG-04      | CG-05       | CG-05      | RG-02     | 必須       |

### 判定基準

| 結果     | 条件                                     | 次アクション   |
| -------- | ---------------------------------------- | -------------- |
| **PASS** | CG-01〜CG-05 全 PASS + CG-06〜CG-08 推奨 | 軸 4 へ進む    |
| **FAIL** | CG-01〜CG-05 のいずれかが FAIL           | Phase 6 差戻し |

---

## 軸 4: Fallback Axis

> no-op / agent 代替の不在検証

### 検証対象パターン

| 禁止パターン                            | 検出方法                                           | テスト ID  |
| --------------------------------------- | -------------------------------------------------- | ---------- |
| `setCurrentView("agent")` terminal 代替 | `grep -rn 'setCurrentView.*agent'` + 文脈判定      | N-1, EC-11 |
| CTA handler が no-op                    | handler 本体が空関数 / `console.warn` のみかを検証 | N-2, EC-12 |
| `console.warn` silent fallback          | `vi.spyOn(console, "warn")` で warn 呼出数が 0     | EC-12      |
| dispatcher 未接続の silent fail         | action type を dispatch して handler 未到達を検証  | EC-15      |
| label と遷移先の不一致                  | CTA label と実際の `setCurrentView` 引数を照合     | L-1, L-2   |

### Gate 項目

| ID    | 検証項目                                            | テスト ID  | PASS 条件                                                      |
| ----- | --------------------------------------------------- | ---------- | -------------------------------------------------------------- |
| FG-01 | terminal 文脈の `setCurrentView("agent")` が全除去  | N-1, EC-11 | grep 検出 0 件 + テストアサーション PASS                       |
| FG-02 | 全 CTA handler に実効性のある処理が含まれる         | N-2, EC-12 | handler 内に `openExecutionConsole()` 呼出が存在               |
| FG-03 | silent fallback（`console.warn` のみ）が存在しない  | EC-12      | `console.warn` spy の呼出回数 = 0                              |
| FG-04 | error boundary で明示的エラーメッセージが表示される | -          | ErrorBoundary のフォールバック UI に text が存在（静的検証可） |
| FG-05 | dispatcher 未接続時に明示的エラーが発生する         | EC-15      | `throw` または `console.error` が発生（warn ではない）         |

### 判定基準

| 結果     | 条件                                 | 次アクション   |
| -------- | ------------------------------------ | -------------- |
| **PASS** | FG-01〜FG-03 全 PASS + FG-04,05 推奨 | 全軸 PASS      |
| **FAIL** | FG-01〜FG-03 のいずれかが FAIL       | Phase 6 差戻し |

---

## 全軸統合判定

### Gate Decision Matrix

| 軸            | 必須項目数 | 推奨項目数 | PASS 閾値           |
| ------------- | ---------- | ---------- | ------------------- |
| Route Axis    | 6          | 0          | 6/6 必須 PASS       |
| Label Axis    | 4          | 2          | 4/4 必須 PASS       |
| CTA Axis      | 5          | 3          | 5/5 必須 PASS       |
| Fallback Axis | 3          | 2          | 3/3 必須 PASS       |
| **合計**      | **18**     | **7**      | **18/18 必須 PASS** |

### 最終判定

| 結果     | 条件                                 | 次 Phase       |
| -------- | ------------------------------------ | -------------- |
| **PASS** | 4 軸全て PASS（必須 18 項目全 PASS） | Phase 8 着手可 |
| **FAIL** | いずれかの軸が FAIL                  | Phase 6 差戻し |

### 差戻し時の対応ガイド

| 失敗軸        | 想定原因                               | 対応方針                                  |
| ------------- | -------------------------------------- | ----------------------------------------- |
| Route Axis    | renderView 分岐漏れ / lazy import 不備 | Phase 5 実装を修正 → Phase 6 テスト再実行 |
| Label Axis    | label 文字列の修正漏れ                 | Phase 5 で対象ファイルを grep で再確認    |
| CTA Axis      | dispatcher 配線漏れ                    | cta-mapping.md に基づき配線を修正         |
| Fallback Axis | agent 代替の除去漏れ                   | `grep` で残存箇所を特定し Phase 5 で修正  |
