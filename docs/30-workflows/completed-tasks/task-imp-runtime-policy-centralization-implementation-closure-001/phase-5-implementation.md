# Phase 5: 実装

## メタ情報

| 項目   | 値                                                                |
| ------ | ----------------------------------------------------------------- |
| Phase  | 5                                                                 |
| 機能名 | task-imp-runtime-policy-centralization-implementation-closure-001 |
| 作成日 | 2026-03-27                                                        |

## 目的

consumer 配線、shared transport、preload / IPC 契約、facade decision 消費を dependency-safe な順序で実装する。

## 実行タスク

- composition root と resolver 注入経路を一元化する
- main process consumer を `RuntimePolicyResolver` 契約へ統一する
- `RuntimeSkillCreatorFacade.execute()` の decision 消費を実装する
- shared types / preload / IPC surface を同一 wave で同期する

## 参照資料

| 資料名          | パス                                                                                      | 説明                    |
| --------------- | ----------------------------------------------------------------------------------------- | ----------------------- |
| Phase 2         | `phase-2-design.md`                                                                       | wiring / sync 設計      |
| Phase 4         | `phase-4-test-creation.md`                                                                | 先行 test matrix        |
| Task02 contract | `../step-02-seq-task-02-runtime-policy-centralization/outputs/phase-2/contract-matrix.md` | authority / shared 契約 |

## 成果物

| 成果物               | パス                                      | 説明                               |
| -------------------- | ----------------------------------------- | ---------------------------------- |
| implementation order | `outputs/phase-5/implementation-order.md` | 実装順、影響範囲、ロールバック観点 |

## 統合テスト連携

- 実装は `composition root -> consumer -> facade -> shared/preload` の順で進め、各段階で test matrix の該当ケースを通す。
- `AI_CHECK_CONNECTION` は新規利用禁止を守りつつ、cleanup 前は必要最小限の互換経路のみ残す。
- shared type 変更時は preload / renderer consumer の型崩れを同一 wave で検証する。

## 完了条件

- [ ] resolver 注入経路が一元化されている
- [ ] 4 surface の consumer が central policy を消費している
- [ ] facade execute が decision を実反映している
- [ ] shared / preload / IPC の同期箇所が実装順とともに明記されている
- [ ] **本Phase内の全タスクを100%実行完了**
