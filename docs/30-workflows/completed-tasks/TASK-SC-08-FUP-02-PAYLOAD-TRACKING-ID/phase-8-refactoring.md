# Phase 8: リファクタリング

## メタ情報

| 項目       | 値                                                           |
| ---------- | ------------------------------------------------------------ |
| Phase      | 8                                                            |
| タスクID   | TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID                        |
| タスク種別 | NON_VISUAL code task                                         |
| 前Phase    | [phase-7-coverage.md](phase-7-coverage.md)                   |
| 次Phase    | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) |

## 目的

Phase 5-7 で実装・検証した `planId` / `requestId` 付与ロジックの重複と冗長を整理し、
spec を最小複雑性へ寄せる。特に `sendSkillCreatorProgress` 呼び出し側に広がる
payload spread 記述を共通化するか、inline を維持するかを決断する（AC-1 / AC-2 配線）。

## リファクタリング判断テーブル【必須】

| 対象             | Before                                                                             | After                                                        | 理由                                                       |
| ---------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------- |
| payload 構築     | 各 call site で `{ phase, percentage, message, planId, requestId }` を inline 構築 | `buildProgressPayload(planId, requestId, partial)` 抽出 候補 | DRY vs. 早すぎる抽象化のトレードオフを明示判断             |
| call site 数     | 2 箇所想定（`skillCreatorHandlers` 直接 / `RuntimeSkillCreatorFacade` 経由）       | 変更なし                                                     | 抽出価値の判断材料（2 箇所のみなら inline 維持が妥当）     |
| Hook filter 分岐 | `options.planId` と `progress.planId` の二重 undefined 判定                        | early-return guard 関数へ抽出 候補                           | Hook 本体の認知負荷削減、ただし 3 行程度で抽出不要の可能性 |
| 型 re-export     | `SkillCreatorProgress` を preload / Main / Renderer で個別 import                  | preload 単一ソース維持                                       | 既存方針通り（変更なし）                                   |

## 判断ルール

| ケース                  | 採用判断                                        |
| ----------------------- | ----------------------------------------------- |
| call site が 2 箇所     | inline 維持（premature abstraction を避ける）   |
| call site が 3 箇所以上 | `buildProgressPayload` ヘルパー抽出（DRY 優先） |
| filter 条件が 3 行以内  | inline 維持                                     |
| filter 条件が 4 行以上  | `shouldAcceptProgress(options, progress)` 抽出  |

## 実行タスク

- payload 構築と Hook filter の抽象化要否を評価する
- call site 数と認知負荷を根拠に抽出/非抽出を決定する
- behavior 変更なしを前提に Phase 9 へ渡す

## 成果物

| 成果物                | パス                                       |
| --------------------- | ------------------------------------------ |
| refactor decision log | `outputs/phase-8/refactor-decision-log.md` |

## 参照資料

- [phase-1-requirements.md](phase-1-requirements.md) — AC-1 / AC-2 / AC-3 の責務境界
- [phase-2-design.md](phase-2-design.md) — 4 ファイル変更設計と call site 想定
- [phase-3-design-review.md](phase-3-design-review.md) — チャンネル多重化棄却根拠
- `.claude/skills/task-specification-creator/references/phase-template-phase8-10.md`

## 統合テスト連携

- Phase 8 自体では新規統合テストを追加しない
- 抽象化判断が targeted test と lint/typecheck を壊さないことを前提に、Phase 9 の品質ゲートで最終確認する

## 完了条件

- [ ] 対象 / Before / After / 理由 が判断テーブルに記録されている
- [ ] call site 数に基づく抽出 / inline 判断ルールが明示されている
- [ ] `buildProgressPayload` 抽出を採用 / 棄却した根拠が記録されている
- [ ] filter 分岐抽出を採用 / 棄却した根拠が記録されている
- [ ] AC-1 / AC-2 / AC-3 への影響が「behavior 変更なし」で担保されている
