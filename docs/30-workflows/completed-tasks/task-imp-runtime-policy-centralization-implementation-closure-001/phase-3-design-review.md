# Phase 3: 設計レビュー

## メタ情報

| 項目   | 値                                                                |
| ------ | ----------------------------------------------------------------- |
| Phase  | 3                                                                 |
| 機能名 | task-imp-runtime-policy-centralization-implementation-closure-001 |
| 作成日 | 2026-03-27                                                        |

## 目的

Phase 2 の設計が Task02 契約と矛盾せず、実装着手に足る粒度まで閉じているかを Go / Hold で判定する。

## 実行タスク

- wiring matrix の欠落と責務逆流を確認する
- shared contract sync plan の drift 余地を確認する
- cleanup 条件が premature cleanup を招かないか確認する
- Phase 4 へ渡す blocker / non-blocker を明確化する

## レビューゲート観点

| ゲート          | 問い                                                                                | 適用する思考法                           |
| --------------- | ----------------------------------------------------------------------------------- | ---------------------------------------- |
| authority gate  | authority が `RuntimePolicyResolver` に一意化されているか                           | 演繹思考、批判的思考、論点思考           |
| transport gate  | shared / preload / IPC の境界が current contract と target delta に分離されているか | 要素分解、MECE、抽象化思考               |
| cleanup gate    | cleanup を close-out 完了条件へ混在させていないか                                   | 逆説思考、トレードオン思考、why思考      |
| regression gate | test coverage の観点が consumer / transport / failure path に届くか                 | 仮説思考、因果関係分析、プロセス思考     |
| governance gate | Phase 12 same-wave sync と Phase 13 blocked 条件が後続に渡せるか                    | メタ思考、戦略的思考、ダブル・ループ思考 |

## 参照資料

| 資料名      | パス                                                                                    | 説明                 |
| ----------- | --------------------------------------------------------------------------------------- | -------------------- |
| Phase 2     | `phase-2-design.md`                                                                     | 設計本文             |
| Task02 gate | `../step-02-seq-task-02-runtime-policy-centralization/outputs/phase-3/gate-decision.md` | upstream review 結果 |

## 成果物

| 成果物             | パス                                    | 説明                   |
| ------------------ | --------------------------------------- | ---------------------- |
| design review gate | `outputs/phase-3/design-review-gate.md` | Go / Hold 判定と残課題 |

### 前Phase成果物の再利用

- Phase 1: `outputs/phase-1/spec-extraction-map.md` と `outputs/phase-1/scope-definition.md` を review checklist の入力に使う。
- Phase 2: `outputs/phase-2/design-summary.md` / `outputs/phase-2/consumer-wiring-matrix.md` / `outputs/phase-2/shared-contract-sync-plan.md` を gate 判定の直接根拠にする。

## 統合テスト連携

- Phase 4 はこの gate 判定を前提に test matrix を作る。
- MAJOR blocker が残る場合、Phase 4 ではなく Phase 2 へ戻る条件を gate に残す。
- `AI_CHECK_CONNECTION` cleanup はこの phase で implementation scope に混ぜず、cleanup prerequisite として隔離する。

## 検証4条件

| 条件         | レビュー観点                                                                |
| ------------ | --------------------------------------------------------------------------- |
| 矛盾なし     | Task02 contract と current task の gate 条件が競合していない                |
| 漏れなし     | consumer / transport / tests / cleanup / governance の5束が gate に含まれる |
| 整合性あり   | authority、decision vocabulary、status 表現が phase 間で一致する            |
| 依存関係整合 | Phase 2 の設計不足が残る場合は Phase 4 へ進まず、戻り先が明示される         |

## 完了条件

- [ ] Go / Hold と戻り先が定義されている
- [ ] blocker / non-blocker が分離されている
- [ ] Task02 契約との矛盾有無が判定されている
- [ ] Phase 4 着手条件が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**
