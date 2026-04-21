# Phase 8: リファクタリング判断ログ

## メタ情報

| 項目       | 値                                                  |
| ---------- | --------------------------------------------------- |
| Phase      | 8                                                   |
| タスクID   | TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID               |
| タスク種別 | NON_VISUAL code task                                |
| 目的       | `planId` / `requestId` 付与に伴う重複整理の要否判断 |

## 判断テーブル【必須】

phase-8 仕様書の判断テーブルを転記し、実コード grep 結果に基づく「採用 / 棄却」判定を追記する。

| 対象             | Before                                                                             | After                                                        | 理由                                                       | 判定     |
| ---------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------- | -------- |
| payload 構築     | 各 call site で `{ phase, percentage, message, planId, requestId }` を inline 構築 | `buildProgressPayload(planId, requestId, partial)` 抽出 候補 | DRY vs. 早すぎる抽象化のトレードオフを明示判断             | 棄却     |
| call site 数     | 2 箇所想定（`skillCreatorHandlers` 直接 / `RuntimeSkillCreatorFacade` 経由）       | 変更なし                                                     | 抽出価値の判断材料（2 箇所のみなら inline 維持が妥当）     | 現状維持 |
| Hook filter 分岐 | `options.planId` と `progress.planId` の二重 undefined 判定                        | early-return guard 関数へ抽出 候補                           | Hook 本体の認知負荷削減、ただし 3 行程度で抽出不要の可能性 | 棄却     |
| 型 re-export     | `SkillCreatorProgress` を preload / Main / Renderer で個別 import                  | preload 単一ソース維持                                       | 既存方針通り（変更なし）                                   | 現状維持 |

## 判断ルール適用

| ケース                  | 採用判断                                        |
| ----------------------- | ----------------------------------------------- |
| call site が 2 箇所     | inline 維持（premature abstraction を避ける）   |
| call site が 3 箇所以上 | `buildProgressPayload` ヘルパー抽出（DRY 優先） |
| filter 条件が 3 行以内  | inline 維持                                     |
| filter 条件が 4 行以上  | `shouldAcceptProgress(options, progress)` 抽出  |

## 実 call site 数の grep 確認結果

Phase 8 仕様書が前提とする「2 箇所想定」に対し、現時点の production コードを `rg "sendSkillCreatorProgress\\("` で確認した結果を記録する（test 呼び出しは除外）。

| 参照元                                                                     | 種別               | カウント対象 |
| -------------------------------------------------------------------------- | ------------------ | ------------ |
| `apps/desktop/src/main/ipc/skillCreatorHandlers.ts:281`                    | production         | ○            |
| `apps/desktop/src/main/ipc/skillCreatorHandlers.ts:720`                    | 定義行             | ×            |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` 経由 | production（経由） | ○            |
| `apps/desktop/src/main/ipc/__tests__/*.test.ts`                            | test 呼び出し      | ×            |

- production 直接呼び出し: 1 箇所（`skillCreatorHandlers.ts:281`）
- Runtime ルート経由: `workflowEngine.triggerPhaseTransition` 経路で emit（Phase 2 設計で配線確定予定、本 phase 時点では "実装予定" として 1 経路を計上）
- 合計 production 呼び出し: **2 箇所想定** — 判断ルール「call site が 2 箇所」に一致

## 抽出判断の根拠

### `buildProgressPayload` 抽出（棄却）

- 根拠 1: production call site が 2 箇所のため、ヘルパー抽出は premature abstraction。
- 根拠 2: payload フィールドは `{ phase, percentage, message, planId?, requestId? }` と小規模であり、inline 構築でも認知負荷が低い。
- 根拠 3: 抽出は call site が 3 箇所以上に増えた時点で再評価する（将来タスクへ持ち越し）。
- 結論: **inline 維持を採用。ヘルパー抽出は棄却**。

### filter 分岐抽出（棄却）

- 根拠 1: `options.planId` と `progress.planId` の二重 undefined 判定は 3 行以内で完結する。
- 根拠 2: `useStreamingProgress` hook 本体は既に責務が単一であり、抽出による可読性向上が限定的。
- 根拠 3: guard 関数化は filter 条件が 4 行以上に拡大した時点で再評価する。
- 結論: **inline 維持を採用。`shouldAcceptProgress` 抽出は棄却**。

### 型 re-export（現状維持）

- `SkillCreatorProgress` は preload を正本とし、Main / Renderer で個別 import する既存方針を踏襲する。
- `planId?` / `requestId?` 追加に伴う型ファイル再配置は行わない。

## AC-1 / AC-2 / AC-3 への影響

| AC   | 影響                                                                      |
| ---- | ------------------------------------------------------------------------- |
| AC-1 | behavior 変更なし — 型追加のみで既存呼び出しの実行結果は不変              |
| AC-2 | behavior 変更なし — `sendSkillCreatorProgress` シグネチャは後方互換で拡張 |
| AC-3 | behavior 変更なし — filter 分岐は inline のまま維持し、ロジック変更なし   |

- refactor 採用なし（すべて現状維持）のため、Phase 5-7 で検証した behavior は 100% 保持される。
- Phase 9 品質ゲートでの targeted test は、本 phase の判定によって追加修正なしで PASS 想定。

## 完了条件

- [x] 対象 / Before / After / 理由 が判断テーブルに記録されている
- [x] call site 数に基づく抽出 / inline 判断ルールが明示されている
- [x] `buildProgressPayload` 抽出を棄却した根拠が記録されている
- [x] filter 分岐抽出を棄却した根拠が記録されている
- [x] AC-1 / AC-2 / AC-3 への影響が「behavior 変更なし」で担保されている
