# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 1                                      |
| タスクID   | TASK-RALLY-002                         |
| 機能名     | restored-pending-request-clarification |
| タスク名   | restoredPendingRequest合成ルール明確化 |
| 前提Phase  | -                                      |
| 後続Phase  | Phase 2                                |
| 作成日     | 2026-04-21                             |
| ステータス | pending                                |
| 実装モード | verify_existing                        |
| タスク種別 | NON_VISUAL / renderer                  |

## 目的

`apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx` に既に存在する `pendingRequest = restoredPendingRequest ?? workflowSnapshot?.awaitingUserInput ?? null` の意味を、コード実体・上流設計・2つの skill 定義に照らして固定する。RALLY-002 は新規実装ではなく、既存挙動を verify_existing として観測し、後続タスクが誤読しない契約へ整流することだけを目的とする。

## 実行タスク

1. 現状コードの事実を固定する。対象は `pendingRequest` 合成式、`pendingRequest?.requestId` を監視する `useEffect`、`workflowSnapshot?.awaitingUserInput?.requestId` を監視するクリア条件 `useEffect` の3点とする。
2. 上流分析資料を照合し、RALLY-002 の責務が「優先ルールの意味固定」であり、`SkillLifecyclePanel.tsx`・IPC 契約・RALLY-010〜013 実装本体を含まないことを確定する。
3. 30種の思考法を 4 条件監査へ割り当て、矛盾なし・漏れなし・整合性あり・依存関係整合の判定観点を整理する。
4. verify_existing / NON_VISUAL / 後続 handoff の3方針を受け入れ基準 AC-1〜AC-5 として固定する。

## 参照資料

| 資料名               | パス                                                                                     | 用途                                         |
| -------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------- |
| 対象コード           | `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`                 | 現状コード観測                               |
| 問題分析書           | `docs/30-workflows/completed-tasks/00-task-spec-design-docs-2/rally-phase-1-analysis.md` | 問題起点の確認                               |
| 解決策設計書         | `docs/30-workflows/completed-tasks/00-task-spec-design-docs-2/rally-phase-2-solution.md` | 「ロジック変更なし」方針の確認               |
| レビュードキュメント | `docs/30-workflows/completed-tasks/00-task-spec-design-docs-2/rally-phase-3-review.md`   | 依存関係・懸念点・直列順序の確認             |
| skill 正本           | `.claude/skills/task-specification-creator/SKILL.md`                                     | Phase 骨格・verify_existing 運用の確認       |
| 仕様正本             | `.claude/skills/aiworkflow-requirements/SKILL.md`                                        | Phase 12 での Step 1 / Step 2 判断基準の確認 |

## 実行手順

1. `ConversationalInterview.tsx` の対象箇所を確認し、事実を `outputs/phase-1/p50-check-result.md` に記録する。
2. 上流3資料を照合し、RALLY-002 の対象・非対象・後続依存を `outputs/phase-1/requirements-definition.md` に整理する。
3. 30種の思考法を 4 条件へ割り当て、`outputs/phase-1/thinking-coverage-map.md` に整理する。
4. AC-1〜AC-5 を `outputs/phase-1/acceptance-criteria.md` へ確定し、Phase 2 の責務境界へ引き渡す。

## 統合テスト連携

- Phase 4 は新規ロジック RED ではなく、既存挙動の targeted verification を設計する。
- Phase 5 は実装より diff 確認を主とし、コード変更は不整合が見つかった場合のみ検討する。
- Phase 11 は NON_VISUAL とし、primary evidence は `outputs/phase-11/manual-test-result.md` とする。

## 多角的チェック観点（AIが判断）

| カテゴリ     | 思考法               | 本タスクでの使い方                                                         |
| ------------ | -------------------- | -------------------------------------------------------------------------- |
| 論理分析系   | 批判的思考           | コメントや設計文書がなくても、現状コードだけで意味が読めるかを検証する     |
| 論理分析系   | 演繹思考             | verify_existing 前提から、触ってよい範囲と触らない範囲を導く               |
| 論理分析系   | 帰納的思考           | 既存のテスト・履歴・設計書から意図を帰納する                               |
| 論理分析系   | アブダクション       | 意味が曖昧な最良説明として「契約未明文化」を採る                           |
| 論理分析系   | 垂直思考             | 合成順序が変わった場合の破綻シナリオを掘り下げる                           |
| 構造分解系   | 要素分解             | 合成式、復元 state、snapshot state、クリア条件に分解する                   |
| 構造分解系   | MECE                 | 対象スコープと非対象スコープを重複なく切り分ける                           |
| 構造分解系   | 2軸思考              | 復元/通常 × 非 null/null の4セルで整理する                                 |
| 構造分解系   | プロセス思考         | 復元直後から通常フローへ遷移する順序を固定する                             |
| メタ・抽象系 | メタ思考             | これは実装タスクか契約固定タスクかを再確認する                             |
| メタ・抽象系 | 抽象化思考           | 合成式を「復元値優先、通常値フォールバック」として抽象化する               |
| メタ・抽象系 | ダブル・ループ思考   | 13 Phase を重く回すこと自体が妥当かを問い直す                              |
| 発想・拡張系 | ブレインストーミング | コメント追加、仕様追記、hand off 明文化の候補を並列に出す                  |
| 発想・拡張系 | 水平思考             | 他の verify_existing タスクの運用と比較する                                |
| 発想・拡張系 | 逆説思考             | restore を優先しない場合の失敗を考える                                     |
| 発想・拡張系 | 類推思考             | local state と snapshot state のフォールバック契約として扱う               |
| 発想・拡張系 | if思考               | 両方非 null、snapshot 未到着、requestId 不変、再マウント時の境界条件を洗う |
| 発想・拡張系 | 素人思考             | 初見の開発者がどこで迷うかを確認する                                       |
| システム系   | システム思考         | RALLY-002 から RALLY-010〜013 への依存連鎖全体を見る                       |
| システム系   | 因果関係分析         | クリア条件と snapshot 更新の因果を分離する                                 |
| システム系   | 因果ループ           | クリア後の再描画と再評価ループを観測する                                   |
| 戦略・価値系 | トレードオン思考     | コメント追加の価値と追加実装コストを比較する                               |
| 戦略・価値系 | プラスサム思考       | 今ここで意味固定することが後続実装コストを下げる点を確認する               |
| 戦略・価値系 | 価値提案思考         | 後続実装者の誤読コストを下げる価値を明示する                               |
| 戦略・価値系 | 戦略的思考           | Wave 0 で先に契約固定する意義を整理する                                    |
| 問題解決系   | why思考              | なぜ誤読が起きるのかを深掘る                                               |
| 問題解決系   | 改善思考             | 最小変更で最大の理解容易性を取る                                           |
| 問題解決系   | 仮説思考             | `restoredPendingRequest` が復元専用である仮説を検証する                    |
| 問題解決系   | 論点思考             | 「何を変えるか」より「何を背負わないか」を先に固定する                     |
| 問題解決系   | KJ法                 | 論点を「コード事実」「設計意図」「依存」「同期判断」に束ねる               |

## サブタスク管理

| SubAgent | 役割           | 出力先                                       |
| -------- | -------------- | -------------------------------------------- |
| A        | skill 準拠検証 | `outputs/phase-1/requirements-definition.md` |
| B        | 30思考法整理   | `outputs/phase-1/thinking-coverage-map.md`   |
| C        | 現状コード観測 | `outputs/phase-1/p50-check-result.md`        |
| D        | 統合判断       | `outputs/phase-1/acceptance-criteria.md`     |

## 成果物

- `outputs/phase-1/requirements-definition.md`
- `outputs/phase-1/acceptance-criteria.md`
- `outputs/phase-1/p50-check-result.md`
- `outputs/phase-1/thinking-coverage-map.md`

## 完了条件

- [ ] 対象コードの観測事実が `p50-check-result.md` に記録されている
- [ ] 上流資料と skill 正本の照合結果が `requirements-definition.md` に記録されている
- [ ] 30種の思考法と4条件の対応が `thinking-coverage-map.md` に記録されている
- [ ] AC-1〜AC-5 が `acceptance-criteria.md` に固定されている
- [ ] RALLY-002 の対象・非対象・依存が明文化されている

## タスク100%実行確認【必須】

- [ ] Phase 1 の4成果物を作成した
- [ ] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/wave0-par-RALLY-002 --phase 1` を実行または実行可能な状態にした
- [ ] Phase 2 へ引き渡す責務境界を明記した

## 次のPhase

Phase 2: 設計
