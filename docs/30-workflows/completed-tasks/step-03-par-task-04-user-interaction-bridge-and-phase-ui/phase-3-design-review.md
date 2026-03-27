# Phase 3: 設計レビュー

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 3                                    |
| 機能名 | user-interaction-bridge-and-phase-ui |
| 作成日 | 2026-03-26                           |

## レビュー目的

Phase 1-2 の要件と設計が、Task02 owner 契約、Task03 provenance handoff、現行 renderer 実装ギャップに対して妥当かを判定する。

## 目的

要件と設計の妥当性を gate 観点で確認し、Phase 4 以降へ渡す blocker と follow-up を固定する。

## 実行タスク

- Phase 1 要件と Phase 2 設計の整合を確認する
- Task02 / Task03 / current code anchor との整合を確認する
- blocker と downstream follow-up を整理する

## 参照資料

| 資料名                    | パス                                           | 説明                            |
| ------------------------- | ---------------------------------------------- | ------------------------------- |
| Phase 1 要件              | `phase-1-requirements.md`                      | owner / question kind / UI host |
| Phase 2 設計              | `phase-2-design.md`                            | bridge / phase UI mapping       |
| interaction bridge matrix | `outputs/phase-2/interaction-bridge-matrix.md` | public contract                 |
| phase UI mapping          | `outputs/phase-2/phase-ui-mapping.md`          | surface boundary                |

## レビュー観点

- engine owner を壊さず bridge を追加できるか
- `skill-creator:*` public surface と shared contract first 原則に従っているか
- `SkillLifecyclePanel` と `SkillCreateWizard` の責務境界が Task05 と衝突していないか
- execute handoff を visible UI に載せる設計が current gap に効くか

## 判定

PASS。AI 質問主導 UX と phase 表示の分離方針は妥当であり、current branch の `SkillCreatorWorkflowEngine` と `RuntimeSkillCreatorFacade` を土台に自然に拡張できる。

## 判定根拠

1. owner は Main 側 engine に固定され、Renderer は snapshot cache と表示責務に留まる。
2. channel / preload / handler の追加方針は既存 `skill-creator:*` surface と整合する。
3. Task03 provenance は summary 表示に限定され、source 再探索や warning 再判定を Renderer へ持ち込まない。
4. `executePlan()` handoff の visible UI 化が scope に含まれ、現行 console-only gap を直接塞げる。

## 注意事項

- question request の field 数を増やしすぎると Task08 の persistence 境界まで抱え込むため、最小 contract に留める。
- verify / improve detail layout は Task06 に委譲し、Task04 では phase summary と re-entry 起点だけ定義する。

## 成果物

| 成果物                               | パス                                                      | 説明                           |
| ------------------------------------ | --------------------------------------------------------- | ------------------------------ |
| design review gate                   | `outputs/phase-3/design-review-gate.md`                   | 判定と blocker / follow-up     |
| skill compliance and elegance review | `outputs/phase-3/skill-compliance-and-elegance-review.md` | skill 適合性と設計の過不足確認 |

## 統合テスト連携

- Phase 4 の test matrix で getter / submit / event の観点へ変換する
- execute handoff visible 化は renderer regression として固定する
- provenance summary は Task03 upstream input を再計算しないことを回帰観点に入れる

## 完了条件

- [ ] 設計レビュー結果が文書化されている
- [ ] blocker と downstream 委譲境界が整理されている
- [ ] Phase 4 以降へ渡すテスト観点が抽出されている
- [ ] **本Phase内の全タスクを100%実行完了**
