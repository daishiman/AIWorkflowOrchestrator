# Phase 3: 設計レビュー

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| Phase  | 3                               |
| 機能名 | verify-execution-engine-layer12 |
| 作成日 | 2026-03-29                      |

## 目的

verification engine の独立性、型互換性、テストカバレッジ計画、Facade 責務侵食の有無を判定する。

## 実行タスク

- engine 独立性の判定
- 型互換性の判定
- テストカバレッジ計画の判定
- Facade 責務境界の判定

## 参照資料

| 資料名                   | パス                                            | 説明                    |
| ------------------------ | ----------------------------------------------- | ----------------------- |
| Phase 1 要件             | `phase-1-requirements.md`                       | Layer 1/2 チェック項目  |
| Phase 2 設計             | `phase-2-design.md`                             | engine / validator 設計 |
| verification engine 設計 | `outputs/phase-2/verification-engine-design.md` | クラス図と責務分離      |
| layer check catalog      | `outputs/phase-2/layer-check-catalog.md`        | L1/L2 チェック ID 一覧  |
| P0 是正パック            | `../p0-verify-manifest-remediation-pack.md`     | Facade 埋め込み禁止原則 |

## 判定

PASS

## Gate Summary

| Gate                      | 結果 | 根拠                                                                                 |
| ------------------------- | ---- | ------------------------------------------------------------------------------------ |
| G-01 engine 独立性        | PASS | `SkillCreatorVerificationEngine` は Facade / WorkflowEngine に依存せず独立テスト可能 |
| G-02 型互換性             | PASS | `layer` union type 拡張は既存 `"layer3"` / `"layer4"` と後方互換                     |
| G-03 テストカバレッジ計画 | PASS | L1-001〜L1-005 と L2-001〜L2-007 の全項目が test case 候補として列挙されている       |
| G-04 Facade 責務境界      | PASS | Facade は engine の呼び出しと結果の橋渡しのみ。検証ロジックを Facade に埋め込まない  |
| G-05 Layer 3/4 scope 分離 | PASS | Layer 3/4 は既存の `"layer3"` / `"layer4"` として維持し、本タスクで変更しない        |

## Minor Notes

| 項目                                            | 行き先            |
| ----------------------------------------------- | ----------------- |
| agents/ 配下の再帰的ファイル探索の深さ制限      | Phase 6 edge case |
| SKILL.md の encoding 対応（UTF-8 前提の妥当性） | Phase 9 QA        |
| Layer 2 チェックの将来的な拡張ポイント          | follow-up task    |

## 統合テスト連携

- Phase 4 の test matrix に L1/L2 全チェック ID が含まれていることを確認する。
- Phase 9 で Layer 3/4 との型互換性を再監査する。

## Phase 4 開始条件

- L1-001〜L1-005、L2-001〜L2-007 の全項目が test case へ変換可能であること
- Facade injection 方式が Phase 5 の実装へ直接写像可能であること

## Phase 13 blocked 条件

- ユーザー承認がない限り PR / commit は実行しない
- spec_created のため、local check と change summary までで止める

## 成果物

| 成果物             | パス                                    | 説明                    |
| ------------------ | --------------------------------------- | ----------------------- |
| design review gate | `outputs/phase-3/design-review-gate.md` | gate summary と判定根拠 |

## 完了条件

- [ ] engine 独立性が Facade 非依存で確認されている
- [ ] 型拡張が既存 Layer 3/4 と後方互換である
- [ ] テストカバレッジ計画が全チェック ID を網羅している
- [ ] Facade に検証ロジックが漏れていない
- [ ] **本Phase内の全タスクを100%実行完了**
