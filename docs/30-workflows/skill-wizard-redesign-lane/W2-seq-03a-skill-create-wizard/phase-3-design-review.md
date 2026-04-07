# Phase 3: 設計レビュー

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 3                                          |
| タスクID   | UT-SKILL-WIZARD-W2-seq-03a                 |
| 機能名     | SkillCreateWizard オーケストレーション更新 |
| 前提Phase  | Phase 2                                    |
| 後続Phase  | Phase 4                                    |
| 作成日     | 2026-04-07                                 |
| ステータス | pending                                    |

## 目的

Phase 2 設計の矛盾・漏れ・整合性をレビューし、実装フェーズへの通過判定を行う。

## レビュー観点チェックリスト

### 矛盾チェック

| 確認項目                                                                 | 判定 | 備考 |
| ------------------------------------------------------------------------ | ---- | ---- |
| state設計が Phase 1 受け入れ基準と矛盾していないか                       | [ ]  |      |
| `inferSmartDefaults` の推論ルールが要件と一致しているか                  | [ ]  |      |
| STEPS配列のインデックスがレンダリング設計と一致しているか                | [ ]  |      |
| `handleGenerate(method)` の引数型が W1-par-02b の props 契約と一致するか | [ ]  |      |
| `handleQualityFeedback` が W3-seq-04 計装設計と矛盾していないか          | [ ]  |      |

### 漏れチェック

| 確認項目                                                                                                | 判定 | 備考 |
| ------------------------------------------------------------------------------------------------------- | ---- | ---- |
| 削除対象 state（`generationMode`等）が設計に全て列挙されているか                                        | [ ]  |      |
| 削除対象 state（`description` / `options`）が設計に全て列挙されているか                                 | [ ]  |      |
| 削除対象ハンドラ（旧 `handleGenerate`等）が全て対象になっているか                                       | [ ]  |      |
| 新規 state（`formData`/`answers`/`smartDefaults`/`generationMethod`/`skillPath`）が全て設計されているか | [ ]  |      |
| 新規ハンドラ（`handleStep0Next`/新`handleGenerate`/`handleQualityFeedback`）が全て設計されているか      | [ ]  |      |
| スマートデフォルト推論ルール（Slack/GitHub/Notion/スケジュール等）が全て設計されているか                | [ ]  |      |
| `handleRetry` と `CompleteStep` の recovery contract が全て設計されているか                             | [ ]  |      |

### 整合性チェック

| 確認項目                                                                                   | 判定 | 備考 |
| ------------------------------------------------------------------------------------------ | ---- | ---- |
| W1-par-02a（SkillInfoStep）のprops契約と `handleStep0Next` が整合するか                    | [ ]  |      |
| W1-par-02b（ConversationRoundStep）のprops契約と `onGenerate(method)` が整合するか         | [ ]  |      |
| W1-par-02c（CompleteStep）のprops契約と `skillPath` / `handleRetry` が整合するか           | [ ]  |      |
| W3-seq-04（計装）の `handleQualityFeedback` 設計と整合するか                               | [ ]  |      |
| 型定義（W0-seq-01）の `SkillInfoFormData` / `ConversationAnswers` が正しく参照されているか | [ ]  |      |

### 依存関係チェック

| 確認項目                                                     | 判定 | 備考 |
| ------------------------------------------------------------ | ---- | ---- |
| W1-par-02a 完了が前提となっていることが確認されているか      | [ ]  |      |
| W1-par-02b 完了が前提となっていることが確認されているか      | [ ]  |      |
| W1-par-02c 完了が前提となっていることが確認されているか      | [ ]  |      |
| W0-seq-01 型定義が利用可能な状態であることが確認されているか | [ ]  |      |

## ゲート判定基準

| 判定             | 条件                                                    |
| ---------------- | ------------------------------------------------------- |
| PASS（通過）     | 全チェック項目が OK・重大な矛盾・漏れ・不整合がないこと |
| CONDITIONAL      | 軽微な問題のみで、是正計画が明確なこと                  |
| FAIL（差し戻し） | 重大な矛盾・漏れ・不整合が1件以上あること               |

## 参照資料

| 資料名             | パス                                         | 用途           |
| ------------------ | -------------------------------------------- | -------------- |
| 要件定義書         | `outputs/phase-1/requirements-definition.md` | Phase 1 成果物 |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`     | Phase 1 成果物 |
| 影響範囲マップ     | `outputs/phase-1/impact-scope-map.md`        | Phase 1 成果物 |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`     | Phase 2 成果物 |
| 推論フローチャート | `outputs/phase-2/inference-flowchart.md`     | Phase 2 成果物 |
| テスト戦略         | `outputs/phase-2/test-strategy.md`           | Phase 2 成果物 |

## 実行手順

1. Phase 1・Phase 2 の全成果物を確認する。
2. 矛盾チェックリストを順番に評価する。
3. 漏れチェックリストを順番に評価する。
4. 整合性・依存関係チェックリストを評価する。
5. ゲート判定を行い、PASS/CONDITIONAL/FAIL を記録する。
6. FAIL の場合は Phase 2 へ差し戻し、是正内容を記録する。

## 成果物

| 成果物             | パス                                         | 説明                       |
| ------------------ | -------------------------------------------- | -------------------------- |
| 設計レビュー結果   | `outputs/phase-3/design-review-result.md`    | チェックリスト評価結果     |
| 矛盾チェックリスト | `outputs/phase-3/contradiction-checklist.md` | 矛盾確認の詳細記録         |
| ゲート判定         | `outputs/phase-3/gate-decision.md`           | PASS/CONDITIONAL/FAIL 判定 |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] ゲート判定が PASS または CONDITIONAL であること
- [ ] FAIL 項目がある場合は是正計画が記録されていること
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
