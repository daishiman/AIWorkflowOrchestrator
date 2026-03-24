# Phase 7: カバレッジ確認 - Coverage Targets

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| タスクID   | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001 |
| Phase      | 7                                              |
| 作成日     | 2026-03-24                                     |
| 依存Phase  | Phase 4-6                                      |
| 成果物種別 | coverage-targets                               |

## 1. AC 別カバレッジ目標

### AC-1: Front Label 統一

> 基準: front の primary label が `実行コンソール` 系へ統一されている

| テスト種別      | テスト内容                                | Phase | 必須 |
| --------------- | ----------------------------------------- | ----- | ---- |
| L-1 (Phase 4)   | nav item label が `実行コンソール` である | 4     | 必須 |
| L-2 (Phase 4)   | CTA label に `terminal` が含まれない      | 4     | 必須 |
| EC-09 (Phase 6) | `grep "ターミナルを開く"` が 0 件         | 6     | 必須 |
| EC-10 (Phase 6) | `grep "terminal を開く"` が 0 件          | 6     | 必須 |
| **合計**        | **4 テスト**                              |       |      |

### AC-2: ViewType / Route / Shared Action 定義

> 基準: `types.ts` に `executionConsole` が存在、`renderView` に分岐あり

| テスト種別      | テスト内容                                                    | Phase | 必須 |
| --------------- | ------------------------------------------------------------- | ----- | ---- |
| R-1 (Phase 4)   | `ViewType` に `executionConsole` が含まれる                   | 4     | 必須 |
| R-2 (Phase 4)   | `renderView("executionConsole")` で ExecutionConsoleView 描画 | 4     | 必須 |
| R-3 (Phase 4)   | `openExecutionConsole()` が `setCurrentView` を呼ぶ           | 4     | 必須 |
| EC-01 (Phase 6) | 二重クリックで viewHistory が汚染されない                     | 6     | 必須 |
| EC-02 (Phase 6) | 既に executionConsole 表示中の再クリック防御                  | 6     | 必須 |
| EC-07 (Phase 6) | StrictMode でリスナー二重登録しない                           | 6     | 必須 |
| EC-08 (Phase 6) | unmount 後の stale handler 防御                               | 6     | 必須 |
| **合計**        | **7 テスト**                                                  |       |      |

### AC-3: 4 Surface CTA 統一

> 基準: 全 4 surface の CTA handler が `openExecutionConsole()` を呼ぶ

| テスト種別      | テスト内容                                              | Phase | 必須 |
| --------------- | ------------------------------------------------------- | ----- | ---- |
| C-1 (Phase 4)   | App Shell CTA で `openExecutionConsole()` が呼ばれる    | 4     | 必須 |
| C-2 (Phase 4)   | ChatPanel CTA で `openExecutionConsole()` が呼ばれる    | 4     | 必須 |
| C-3 (Phase 4)   | WorkspaceChatPanel CTA で `openExecutionConsole()` 呼出 | 4     | 必須 |
| C-4 (Phase 4)   | Skill Creator CTA で `openExecutionConsole()` 呼出      | 4     | 必須 |
| EC-03 (Phase 6) | unavailable 状態で CTA が disabled                      | 6     | 必須 |
| EC-06 (Phase 6) | narrow width でも CTA 機能が維持される                  | 6     | 必須 |
| **合計**        | **6 テスト**                                            |       |      |

### AC-4: Agent 代替 / No-op 除去

> 基準: `setCurrentView("agent")` の terminal 代替が 0 件

| テスト種別      | テスト内容                                        | Phase | 必須 |
| --------------- | ------------------------------------------------- | ----- | ---- |
| N-1 (Phase 4)   | `agent` 代替遷移が存在しない                      | 4     | 必須 |
| N-2 (Phase 4)   | no-op CTA が存在しない                            | 4     | 必須 |
| EC-11 (Phase 6) | terminal 文脈の `setCurrentView("agent")` が 0 件 | 6     | 必須 |
| EC-12 (Phase 6) | 全 CTA の handler に no-op パターンが 0 件        | 6     | 必須 |
| EC-15 (Phase 6) | dispatcher 未接続時に silent fail しない          | 6     | 推奨 |
| **合計**        | **5 テスト（必須 4 + 推奨 1）**                   |       |      |

---

## 2. Surface Coverage

### 各 surface のテスト存在確認

| Surface       | CTA テスト | Label テスト | Route テスト | Negative テスト | 合計   |
| ------------- | ---------- | ------------ | ------------ | --------------- | ------ |
| App Shell     | C-1        | L-1          | R-2          | N-2             | 4      |
| Chat          | C-2        | L-2, EC-09   | EC-07, EC-08 | N-1, EC-11      | 7      |
| Workspace     | C-3        | -            | -            | EC-15           | 2      |
| Skill Creator | C-4        | -            | -            | N-2             | 2      |
| **合計**      | **4**      | **4**        | **4**        | **5**           | **15** |

### 網羅性判定基準

- 全 4 surface に最低 1 つの CTA テストが存在すること: **必須**
- Chat surface は CTA 数が最多（4 コンポーネント）のため、テスト密度が最高であること: **必須**
- Skill Creator は interface のみ定義のため、action 型の呼び出しテストで充足: **許容**

---

## 3. Route Coverage

### `executionConsole` 関連の route パス網羅

| Route パス                           | テスト       | カバレッジ状態 |
| ------------------------------------ | ------------ | -------------- |
| `setCurrentView("executionConsole")` | R-1, R-2     | Phase 4 で完了 |
| `openExecutionConsole()` → store     | R-3          | Phase 4 で完了 |
| renderView → ExecutionConsoleView    | R-2          | Phase 4 で完了 |
| 二重遷移防御                         | EC-01, EC-02 | Phase 6 で追加 |
| StrictMode 防御                      | EC-07        | Phase 6 で追加 |
| stale handler 防御                   | EC-08        | Phase 6 で追加 |
| viewHistory 上限                     | EC-13        | 低優先（任意） |

### Route Coverage 基準

| 指標              | 最低基準 | 推奨基準 | 現在見込み |
| ----------------- | -------- | -------- | ---------- |
| Line Coverage     | 80%      | 90%      | 90%+       |
| Branch Coverage   | 60%      | 70%      | 70%+       |
| Function Coverage | 80%      | 90%      | 90%+       |

---

## 4. Negative Path Coverage

### agent 代替 / no-op の不在確認

| 検証対象                                | テスト     | 検証方法                                   |
| --------------------------------------- | ---------- | ------------------------------------------ |
| `setCurrentView("agent")` terminal 代替 | N-1, EC-11 | grep + テスト内アサーション                |
| CTA handler no-op                       | N-2, EC-12 | 静的解析 + テスト内アサーション            |
| `console.warn` silent fallback          | EC-12      | mock console.warn のコール数 = 0           |
| dispatcher 未接続                       | EC-15      | 明示的エラー発生を検証                     |
| label と遷移先の不一致                  | L-1, L-2   | label 文字列と実際の遷移先の整合性チェック |

### Negative Path 基準

- agent 代替除去テスト: **0 件検出が PASS 条件**
- no-op CTA テスト: **全 CTA handler が実効性のある処理を含むことが PASS 条件**
- silent fallback テスト: **`console.warn` のみで処理を完了するパターンが 0 件**

---

## 5. 全体カバレッジサマリー

### テスト数集計

| 分類                | Phase 4 | Phase 6 | 合計   |
| ------------------- | ------- | ------- | ------ |
| Route テスト (R)    | 3       | 4       | 7      |
| CTA テスト (C)      | 4       | 2       | 6      |
| Label テスト (L)    | 2       | 2       | 4      |
| Negative テスト (N) | 2       | 3       | 5      |
| **合計**            | **11**  | **11**  | **22** |

### Gate 判定基準

| 基準                           | 閾値        | 未達時の対応     |
| ------------------------------ | ----------- | ---------------- |
| AC-1 テスト全 PASS             | 4/4         | Phase 6 に差戻し |
| AC-2 テスト全 PASS             | 7/7         | Phase 6 に差戻し |
| AC-3 テスト全 PASS             | 6/6         | Phase 6 に差戻し |
| AC-4 必須テスト全 PASS         | 4/4         | Phase 6 に差戻し |
| 全 4 surface に CTA テスト存在 | 4/4 surface | Phase 6 に差戻し |
| Line Coverage                  | 80% 以上    | Phase 6 に差戻し |
| Branch Coverage                | 60% 以上    | Phase 6 に差戻し |
| Function Coverage              | 80% 以上    | Phase 6 に差戻し |
