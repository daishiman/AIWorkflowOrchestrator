# Phase 10: 最終レビューゲート

## メタ情報

| 項目   | 値                                     |
| ------ | -------------------------------------- |
| Phase  | 10                                     |
| 機能名 | TASK-RT-03-skill-creation-result-panel |
| 作成日 | 2026-04-04                             |

## 目的

Phase 9 の品質保証結果を基に、Phase 11（手動テスト）へ進める品質水準かを最終判定する。受入基準との照合・blocker の有無を明示する。

## 実行タスク

- **受入基準との最終照合**: FR-01〜FR-08 全項目の最終確認
- **blocker チェック**: Phase 11 進行を阻む問題の有無確認
- **MINOR 指摘の未タスク化**: 本タスクでは解決しない指摘を未タスクとして記録
- **Phase 11 準備確認**: UIタスクとして screenshot-plan.json の準備

## 実行手順

### ステップ 1: 最終品質チェック

```bash
# 最終確認コマンド一括実行
pnpm --filter @repo/desktop typecheck && \
pnpm --filter @repo/desktop lint && \
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreationResultPanel"
```

### ステップ 2: 受入基準との最終照合

| FR ID | 要件                                                                                                                                                                                                                                                  | 判定 | 備考 |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ---- |
| FR-01 | plan フェーズ: `PlanResultDetailPanel` 経由で skillName・description・estimatedSteps・agents・scripts・triggers・anchors・skillSpec 表示                                                                                                              | TBD  |      |
| FR-02 | execute フェーズ: `ExecuteResultDetailPanel` 経由で success・persistResult.skillPath・persistResult.files・error・sessionId・resultSubtype・stopReason・persistError 表示                                                                             | TBD  |      |
| FR-03 | verify フェーズ: `VerifyResultDetailPanel` 経由で checks[] を layer でグループ化し、severity・evidenceSummary・message・nextAction・evidenceCount・route 情報・reverifyEligible・disabledReason・delegatedGovernanceNote・delegatedSessionNote を表示 | TBD  |      |
| FR-04 | severity バッジ表示（info/warning/error）                                                                                                                                                                                                             | TBD  |      |
| FR-05 | 全体ステータスバッジ（6パターン）                                                                                                                                                                                                                     | TBD  |      |
| FR-06 | 全 props null でエラーなく描画                                                                                                                                                                                                                        | TBD  |      |
| FR-07 | `SkillLifecyclePanel` への統合（reverify action は親側維持）                                                                                                                                                                                          | TBD  |      |
| FR-08 | 既存パネル重複整理                                                                                                                                                                                                                                    | TBD  |      |

### ステップ 3: Blocker チェック

**MAJOR 判定（Phase 8 へ戻る）**:

- typecheck / lint にエラーが残存している
- TC-01〜TC-22 に失敗ケースが存在する
- FR-01〜FR-08 のいずれかが未達

**MINOR 判定（Phase 11 へ進みながら追跡）**:

| MINOR ID  | 指摘内容                                  | 未タスク化方針                           |
| --------- | ----------------------------------------- | ---------------------------------------- |
| TECH-M-10 | Storybook story の作成（推奨・必須外）    | 未タスクとして記録（スコープ外）         |
| TECH-M-11 | `nextAction` に基づく推奨アクションボタン | 未タスクとして記録（スコープ外・改善系） |

### ステップ 4: 判定

| 判定      | 条件                                   | 対応                           |
| --------- | -------------------------------------- | ------------------------------ |
| **PASS**  | FR-01〜FR-08 全 PASS、blocker なし     | Phase 11 へ進む                |
| **MINOR** | 軽微な指摘あり、blocker なし           | 未タスク化して Phase 11 へ進む |
| **MAJOR** | blocker あり（テスト失敗・型エラー等） | 戻り先 Phase を明示して戻る    |

**戻り先マトリクス**:

| 問題種別           | 戻り先  |
| ------------------ | ------- |
| 実装バグ・型エラー | Phase 8 |
| テスト失敗         | Phase 5 |
| テスト不足         | Phase 4 |
| 設計の根本的問題   | Phase 2 |
| 要件の見直し       | Phase 1 |

### ステップ 5: Phase 11 準備確認（UIタスク）

本タスクは UIタスクのため、Phase 11 でのスクリーンショット要件を確認する:

- [ ] `screenshot-plan.json` の作成準備
- [ ] Playwright + Vite dev server パターンの準備
- [ ] 3層評価（Semantic / Visual / AI UX）のシナリオ設計

## 成果物

| 成果物             | パス                                        | 説明                        |
| ------------------ | ------------------------------------------- | --------------------------- |
| 最終レビュー判定書 | `outputs/phase-10/final-review-gate.md`     | PASS/MINOR/MAJOR の判定結果 |
| 未タスク候補リスト | `outputs/phase-10/unassigned-candidates.md` | MINOR 指摘の未タスク化候補  |

## 完了条件

- [ ] FR-01〜FR-08 の全項目が判定済み
- [ ] Blocker（MAJOR）がゼロ
- [ ] MINOR 指摘が未タスク化候補として記録されている
- [ ] Phase 11 準備確認（UIタスク：screenshot-plan.json）が済んでいる
- [ ] 判定（PASS/MINOR/MAJOR）が確定している
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 11: 手動テスト（PASS または MINOR 判定時）
