# TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE - タスク実行仕様書

## メタ情報

| 項目       | 内容                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| タスクID   | TASK-SC-08                                                                  |
| 機能名     | TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE                                      |
| タスク名   | onProgressコールバック接続・useStreamingProgressモード別phaseマッピング拡張 |
| 分類       | 機能実装                                                                    |
| Issue      | [#2268](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2268)    |
| 作成日     | 2026-04-19                                                                  |
| ステータス | 完了（Phase 12 close-out 済み・Phase 13 pending）                           |
| 総Phase数  | 13                                                                          |
| depends_on | TASK-SW-STREAM-FUP-03（完了）, TASK-SW-STREAM-002（IPC配線）                |
| 関連タスク | TASK-SC-06-UI-RUNTIME-CONNECTION / TASK-SW-STREAM-FUP-03                    |

---

## Phase一覧

| Phase | 名称                 | 仕様書                                                       | ステータス |
| ----- | -------------------- | ------------------------------------------------------------ | ---------- |
| 1     | 要件定義             | [phase-1-requirements.md](phase-1-requirements.md)           | 完了       |
| 2     | 設計                 | [phase-2-design.md](phase-2-design.md)                       | 完了       |
| 3     | 設計レビューゲート   | [phase-3-design-review.md](phase-3-design-review.md)         | 完了       |
| 4     | テスト作成           | [phase-4-test-creation.md](phase-4-test-creation.md)         | 完了       |
| 5     | 実装                 | [phase-5-implementation.md](phase-5-implementation.md)       | 完了       |
| 6     | テスト拡充           | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | 完了       |
| 7     | テストカバレッジ確認 | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | 完了       |
| 8     | リファクタリング     | [phase-8-refactoring.md](phase-8-refactoring.md)             | 完了       |
| 9     | 品質保証             | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | 完了       |
| 10    | 最終レビューゲート   | [phase-10-final-review.md](phase-10-final-review.md)         | 完了       |
| 11    | 手動テスト検証       | [phase-11-manual-test.md](phase-11-manual-test.md)           | 完了       |
| 12    | ドキュメント更新     | [phase-12-documentation.md](phase-12-documentation.md)       | 完了       |
| 13    | PR作成               | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | blocked    |

---

## 実行フロー

```
Phase 1 → Phase 2 → Phase 3 (Gate) → Phase 4 → Phase 5 → Phase 6 → Phase 7
                         ↓                                      ↓
                    (MAJOR→戻り)                           (未達→戻り)
                         ↓                                      ↓
Phase 8 → Phase 9 → Phase 10 (Gate) → Phase 11 → Phase 12 → Phase 13 → 完了
                         ↓
                    (MAJOR→戻り)
```

---

## タスク概要

### 背景

TASK-SW-STREAM-FUP-03 で `SkillCreatorService` 側のモード別 progress phase が実装完了したが、
Renderer 側の `useStreamingProgress.ts` が未対応のため、mode-specific phase が `planning` に吸収されてしまう。

### 目的

1. `SkillCreatorAPI.onProgress(callback)` を Renderer 側に接続し、リアルタイム進捗表示を実現する
2. `useStreamingProgress.ts` の phase → stage マッピングをモード別に拡張し、mode-specific phase が `planning` に吸収されない状態を実現する

## 真の論点

1. Main → Preload → Renderer の progress イベント伝搬が current facts と一致しているか
2. mode-specific phase を `StreamingGenerationStage` へどう意味づけるか
3. Store と UI が phase / message / stage の責務を混在させていないか
4. create 以外のモードで退行を防ぐ検証経路をどう固定するか

## 30思考法の適用方針

30思考法は列挙で終わらせず、以下の 5 クラスタに束ねて各 Phase の判断へ接続する。

| クラスタ   | 主目的                       | 対応する思考法                                                                       |
| ---------- | ---------------------------- | ------------------------------------------------------------------------------------ |
| 論点確定   | 主問題と受入境界を固定する   | 批判的思考, 演繹思考, 帰納的思考, アブダクション, 垂直思考, why思考, 論点思考        |
| 構造化     | 役割・成果物・依存を分離する | 要素分解, MECE, 2軸思考, プロセス思考, 抽象化思考, メタ思考                          |
| 境界設計   | 責務境界と波及影響を閉じる   | システム思考, 因果関係分析, 因果ループ, ダブル・ループ思考                           |
| 代替案探索 | エレガントな縮約案を探す     | ブレインストーミング, 水平思考, 逆説思考, 類推思考, if思考, 素人思考                 |
| 価値最適化 | 過剰設計を削り価値を残す     | トレードオン思考, プラスサム思考, 価値提案思考, 戦略的思考, 改善思考, 仮説思考, KJ法 |

### 変更対象ファイル

| ファイル                                                             | 変更種別 | 概要                                                            |
| -------------------------------------------------------------------- | -------- | --------------------------------------------------------------- |
| `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`            | 修正     | PHASE_TO_STAGEマップにupdate/collaborativeモードのphase名を追加 |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`   | 確認     | `useStreamingProgress()` の既存購読点として wiring を確認       |
| `apps/desktop/src/renderer/store/slices/generationProgressSlice.ts`  | 確認     | StreamingGenerationStage型拡張要否を確認                        |
| `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx` | 確認     | 既存の動的メッセージ表示がそのまま機能することを確認            |
| `apps/desktop/src/preload/skill-creator-api.ts`                      | 確認     | onProgress型定義確認                                            |

---

## Phase完了時の必須アクション

1. **タスク100%実行**: Phase内で指定された全タスクを完全に実行
2. **成果物確認**: 全ての必須成果物が生成されていることを検証
3. **artifacts.json更新**: `complete-phase.js` でPhase完了ステータスを更新
4. **完了条件チェック**: 各タスクを完遂した旨を必ず明記

```bash
# Phase完了処理
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```

---

## 成果物

| Phase | 主要成果物                                                                                       |
| ----- | ------------------------------------------------------------------------------------------------ |
| 1     | 要件定義書, 受け入れ基準, 仕様抽出結果, 差分カバレッジ, トレーサビリティ行列                     |
| 2     | アーキテクチャ設計, IPC契約設計, テスト戦略, 依存整合マトリクス                                  |
| 3     | 設計レビュー結果, ゲート判定, 矛盾チェック表                                                     |
| 4     | テスト仕様書, Red結果, 統合テスト計画                                                            |
| 5     | 実装サマリー, 変更ファイル一覧, 契約差分                                                         |
| 6     | 拡張テストケース, 回帰テスト結果, 異常系結果                                                     |
| 7     | カバレッジ計画, 未到達分析, トレーサビリティ網羅率                                               |
| 8     | リファクタ計画, 再テスト計画, 責務境界マップ                                                     |
| 9     | 品質レポート, リスク台帳, 因果ループ監査                                                         |
| 10    | 最終レビュー結果, 是正計画, 出荷準備チェック                                                     |
| 11    | 手動テスト結果, 手動テストチェックリスト, 発見事項一覧, スクリーンショット計画JSON               |
| 12    | 実装ガイド, system spec 更新サマリー, 更新履歴, 未タスク検出, スキルフィードバック, 準拠最終確認 |
| 13    | ローカル確認結果, 変更サマリー, 承認チェック                                                     |

---

_このファイルは手動作成されました（Issue #2268 タスク仕様書）。_
_最終更新: 2026-04-19_
