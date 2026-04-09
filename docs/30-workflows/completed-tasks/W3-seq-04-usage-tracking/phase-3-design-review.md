# Phase 3: 設計レビュー

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 3                            |
| タスクID   | UT-SKILL-WIZARD-W3-seq-04    |
| 機能名     | 使用率計装（usage tracking） |
| 前提Phase  | Phase 2                      |
| 後続Phase  | Phase 4                      |
| 作成日     | 2026-04-07                   |
| ステータス | pending                      |

## 目的

Phase 2 の trackEvent 設計・拡張設計・計装配置設計の矛盾・漏れ・整合性をレビューし、実装フェーズへの通過判定を行う。

## レビュー観点チェックリスト

### 矛盾チェック

| 確認項目                                                                       | 判定 | 備考 |
| ------------------------------------------------------------------------------ | ---- | ---- |
| 5つの計装ポイントが Phase 1 イベントスキーマと一致しているか                   | [ ]  |      |
| `trackEvent` スタブ実装が TypeScript 型定義と矛盾していないか                  | [ ]  |      |
| `skill_wizard_started` が空 payload として扱われているか                       | [ ]  |      |
| 計装配置設計テーブルのファイル名が W2-seq-03a 成果物と一致しているか           | [ ]  |      |
| `SkillCategory` の参照元が `packages/shared/src/types/skill.ts` になっているか | [ ]  |      |
| 将来拡張設計（Phase A/B/C）が段階的移行として矛盾していないか                  | [ ]  |      |

### 漏れチェック

| 確認項目                                                            | 判定 | 備考 |
| ------------------------------------------------------------------- | ---- | ---- |
| `skill_wizard_started` イベントが設計に含まれているか（空 payload） | [ ]  |      |
| `skill_wizard_step1_completed` イベントが設計に含まれているか       | [ ]  |      |
| `skill_wizard_generation_completed` イベントが設計に含まれているか  | [ ]  |      |
| `skill_skeleton_quality_feedback` イベントが設計に含まれているか    | [ ]  |      |
| `skill_wizard_next_action` イベントが設計に含まれているか           | [ ]  |      |
| `skippedAtQuestion` フィールドの null 許容が設計に反映されているか  | [ ]  |      |

### 整合性チェック

| 確認項目                                                                                                           | 判定 | 備考 |
| ------------------------------------------------------------------------------------------------------------------ | ---- | ---- |
| W2-seq-03a の `handleQualityFeedback` と `skill_skeleton_quality_feedback` 設計が整合するか                        | [ ]  |      |
| W2-seq-03a の `handleGenerate` 完了後フックと `skill_wizard_generation_completed` が整合するか                     | [ ]  |      |
| `CompleteStep.tsx` は presentational のまま、`skill_wizard_next_action` の責務が親にあるか                         | [ ]  |      |
| 型安全設計の `SkillWizardEvents` マップが全5イベントを網羅しているか                                               | [ ]  |      |
| `trackEvent` が renderer-local の薄い抽象として閉じているか                                                        | [ ]  |      |
| Phase 11 が NON_VISUAL として設計され、`manual-test-checklist.md` / `manual-test-result.md` が主証跡になっているか | [ ]  |      |

### 依存関係チェック

| 確認項目                                                                             | 判定 | 備考 |
| ------------------------------------------------------------------------------------ | ---- | ---- |
| W2-seq-03a の完了が前提となっていることが確認されているか                            | [ ]  |      |
| W2-seq-03a 実装後に計装ポイントの最終位置を確認する手順が設計されているか            | [ ]  |      |
| `SkillAnalytics` / `AnalyticsStore` を UI 計装へ直接接続しない方針が確認されているか | [ ]  |      |

## ゲート判定基準

| 判定  | 条件                                                                    |
| ----- | ----------------------------------------------------------------------- |
| PASS  | 全チェック項目が OK・重大な矛盾・漏れ・不整合・証跡方針の揺れがないこと |
| MINOR | 軽微な問題のみで、是正計画が明確なこと                                  |
| MAJOR | 重大な矛盾・漏れ・不整合が1件以上あること                               |

## 参照資料

| 資料名               | パス                                         | 用途           |
| -------------------- | -------------------------------------------- | -------------- |
| 要件定義書           | `outputs/phase-1/requirements-definition.md` | Phase 1 成果物 |
| イベントスキーマ定義 | `outputs/phase-1/event-schema-definition.md` | Phase 1 成果物 |
| 実装設計書           | `outputs/phase-2/implementation-design.md`   | Phase 2 成果物 |
| 拡張設計書           | `outputs/phase-2/extension-design.md`        | Phase 2 成果物 |
| テスト戦略           | `outputs/phase-2/test-strategy.md`           | Phase 2 成果物 |

## 実行タスク

1. Phase 1・Phase 2 の全成果物を確認する。
2. 矛盾チェックリストを順番に評価する。
3. 漏れチェックリストを順番に評価する。
4. 整合性・依存関係チェックリストを評価する。
5. ゲート判定を行い、PASS/MINOR/MAJOR を記録する。

## 統合テスト連携

- Phase 4 のテスト設計は AC-01〜AC-05 に 1 対 1 で対応させる。
- Phase 6 の edge case は complete / skip / feedback / next action の全分岐を網羅する。
- Phase 11 は visible surface 変更なしのため NON_VISUAL とし、`manual-test-checklist.md` / `manual-test-result.md` を主証跡にする。
- Phase 2 の設計方針どおり、renderer-local の `trackEvent` は execution-centric 基盤と分離して確認する。

## 成果物

| 成果物             | パス                                         | 説明                   |
| ------------------ | -------------------------------------------- | ---------------------- |
| 設計レビュー結果   | `outputs/phase-3/design-review-result.md`    | チェックリスト評価結果 |
| 矛盾チェックリスト | `outputs/phase-3/contradiction-checklist.md` | 矛盾確認の詳細記録     |
| ゲート判定         | `outputs/phase-3/gate-decision.md`           | PASS/MINOR/MAJOR 判定  |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] ゲート判定が PASS または MINOR であること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. 矛盾チェック実施
3. 漏れチェック実施
4. 整合性・依存関係チェック実施
5. ゲート判定と成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 4: テスト作成
