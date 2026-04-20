# Phase 3: 設計レビュー

## メタ情報

| 項目         | 内容                                                                                                     |
| ------------ | -------------------------------------------------------------------------------------------------------- |
| Phase        | 3                                                                                                        |
| タスクID     | TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001                                                                   |
| ステータス   | 未実施                                                                                                   |
| 作成日       | 2026-04-19                                                                                               |
| GitHub Issue | #2287（CLOSED）, #2269（CLOSED）                                                                         |
| 入力         | outputs/phase-2/priority-matrix.md, outputs/phase-2/test-pattern-design.md, outputs/phase-2/wave-plan.md |

## 目的

Phase 2 で確定した設計の妥当性を、実装開始前に多角的な視点でレビューする。優先度判断・wave分割・テストパターン・CI コスト評価の各観点で問題がないかを確認し、Phase 4 への進行可否を判定する。設計上の問題を早期発見してフィードバックループを最小化することが目的である。

## 実行タスク

- 優先度判断、wave分割、テストパターン、CIコスト、既存テスト重複の5観点をレビューする
- `review-result.md` に各観点の判定と差し戻し有無を記録する
- `gate-decision.md` で Phase 4 進行可否を確定する

## レビュー観点

### 観点 1: 優先度判断の妥当性

確認する内容:

- Wave 1 に割り当てた 7 関数が「変更頻度・セキュリティ重要度・チャンネル数」の3軸で正当化されているか
- `registerSkillCreatorHandlers` を Wave 1 に含める根拠（既存パターンとの整合性確認）が明確か
- Wave 3 に割り当てた関数群が本当に低優先で問題ないか（将来の重要度変化リスクの評価）
- Phase 1 の `handler-inventory.md` に記載された変更頻度の評価根拠が客観的か

判定基準:

- Wave 1 の全関数に対して、優先理由が1つ以上明示されている
- Wave 3 の関数が「UI補助的で独立性が高い」という条件を満たしている

### 観点 2: Wave 分割の適切さ

確認する内容:

- Wave 1〜3 の関数数バランスが設計方針（7〜8 / 13〜16 / 残り）に収まっているか
- Wave 間の依存関係がないか（Wave 2 の実装が Wave 1 の成果物に依存していないか）
- Wave を跨いで同一ファイルに実装される handler 関数がないか（テストファイルの分割単位の確認）
- 既存テストが存在する `registerRuntimeSkillCreatorHandlers` と `registerSkillCreatorHandlers` の関係性が整理されているか

判定基準:

- 各 Wave が独立してリリース可能な単位になっている
- Wave 1 完了後に Wave 2 を開始できる設計になっている

### 観点 3: テストパターンの整合性

確認する内容:

- 設計した vi.spyOn パターンが `creatorHandlers.registrationSnapshot.test.ts` の実装と一致しているか
- テストID採番規則（REG-SNAP-{PREFIX}-01 等）が既存テストIDと衝突しないか
  - 既存: REG-SNAP-01, REG-DEDUP-01, REG-COUNT-01, REG-EDGE-01 （creatorHandlers）
  - 新規: REG-SNAP-SKILL-01, REG-DEDUP-SKILL-01, REG-SNAP-LLM-01 等（プレフィックスで分離）
- **handle/on/mixed の扱い差分のレビュー（Issue #2287 の核心要件）:**
  - `handle only` 型: `REG-SNAP` / `REG-DEDUP` / `REG-COUNT` の3テストを適用する標準パターンが採用されているか
  - `on only` 型: スナップショット対象外とする場合に、その理由と代替検証（最低 `REG-DEDUP` 相当）が `wave-plan.md` に記載されているか。またその方針が index.md の受入基準（AC-001〜003）と矛盾しないか
  - `mixed` 型: `ipcMain.handle` チャンネルと `ipcMain.on` チャンネルを分離収集する設計が `test-pattern-design.md` に明記されているか。`onChannels` 配列の収集ロジックが `handles` 配列と独立しているか
  - 各型の扱いに対して `mockIpcMainHandle` と `mockIpcMainOn` のモック定義が同一ファイル内で一貫しているか
- ipcMain.on を持つ mixed 型 handler の対応方針が edge case として REG-EDGE テストでカバーされているか
- スナップショットの初回生成タイミングの方針（Phase 5 の実装時に `vitest --update-snapshots` を実行する手順）が明記されているか

判定基準:

- 新規テストIDが既存テストIDと重複しない（プレフィックスによる名前空間の分離が確認できる）
- vi.spyOn パターンの設計と既存実装の差分が 0、または差分がある場合にその理由が明記されている
- `handle only` / `on only` / `mixed` の3分類それぞれに対して設計方針が明記されており、漏れがない
- `mixed` 型の場合に `handle` と `on` チャンネルの分離収集が設計に含まれている

### 観点 4: CI 時間影響評価

確認する内容:

- Wave 1 の 28 テストケース追加による CI 実行時間の増加が許容範囲内か
- `pnpm --filter @repo/desktop test` の現在の実行時間を基準として、増加率を評価する
- スナップショット生成済みの状態でのテスト実行時間と、スナップショット未生成時の時間差を考慮しているか
- Wave 1〜3 全体完了後の最終的な CI 時間増加が許容上限（全体の +20% 以内など）を超えないか

判定基準:

- Wave 1 完了後の CI 時間増加見積もりが記録されている
- 許容上限の根拠が明示されている

### 観点 5: 既存テストとの役割重複チェック

確認する内容:

- `ipc-double-registration.test.ts` が担保している範囲と、本タスクで追加するスナップショットテストの範囲が明確に分離されているか
- `index.integration.test.ts` が確認している内容と REG-SNAP テストの重複がないか
- `ipcHandlerRegistrationSnapshot.test.ts` との役割重複がないか（こちらは `registerRuntimeSkillCreatorHandlers` 対象）

判定基準:

- 役割分担の説明が `test-pattern-design.md` に記載されており、重複がある場合はどちらかを削除・統合する方針が示されている

## Gate: Phase 4 への進行判定

以下の全条件を満たした場合に Phase 4 へ進行する。条件を満たさない場合は Phase 2 へ差し戻す。

| Gate条件                                           | 判定 | 差し戻し先     |
| -------------------------------------------------- | ---- | -------------- |
| 優先度判断の妥当性がレビューで承認された           | -    | Phase 2 Step 1 |
| Wave 分割が独立性・バランスの観点で承認された      | -    | Phase 2 Step 2 |
| テストパターンが既存実装と整合している             | -    | Phase 2 Step 3 |
| CI 時間影響が許容範囲内と評価された                | -    | Phase 2 Step 4 |
| 既存テストとの役割重複が解消または許容と判断された | -    | Phase 2 Step 3 |

## 参照資料

- `outputs/phase-2/priority-matrix.md`
- `outputs/phase-2/test-pattern-design.md`
- `outputs/phase-2/wave-plan.md`
- `apps/desktop/src/main/ipc/__tests__/creatorHandlers.registrationSnapshot.test.ts`（比較基準）
- `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts`（役割重複確認）
- `apps/desktop/src/main/ipc/__tests__/index.integration.test.ts`（役割重複確認）

## 成果物

- `outputs/phase-3/review-result.md`（各観点のレビュー結果・判定・差し戻し有無を記載）
- `outputs/phase-3/gate-decision.md`（Phase 4 進行可否の最終判定・承認記録）

## 統合テスト連携

- Phase 2 の `test-pattern-design.md` と `wave-plan.md` が Phase 4 以降の実装契約として妥当かをレビューする
- `creatorHandlers.registrationSnapshot.test.ts` を比較基準とし、既存テストとの役割重複や契約不整合をここで解消する
- Gate で承認された内容のみを Wave 1 Red 実装へ引き継ぐ

## 完了条件

- [ ] 5つの観点すべてにレビューコメントが記載されている
- [ ] 各 Gate 条件に対して「承認」または「差し戻し」の判定が記載されている
- [ ] 差し戻しがある場合、差し戻し先の Step と修正内容が具体的に記載されている
- [ ] `gate-decision.md` に最終判定（Phase 4 進行可 / 差し戻し）が記載されている
- [ ] `handle only` / `on only` / `mixed` の3分類すべてに対して設計方針のレビュー結果が `review-result.md` に記載されている
- [ ] Issue #2287 で指定された `registerSkillHandlers` と `registerLLMHandlers` が Wave 1 に正しく配置されていることが確認されている

## タスク100%実行確認【必須】

1. 5つのレビュー観点すべてに対してコメントを記入したか
2. Gate 条件の全項目に判定を記入したか
3. 差し戻しが発生した場合、Phase 2 の該当 Step を修正し再レビューを実施したか
4. `gate-decision.md` に日付・判定・承認者（または自動承認の場合はその旨）を記載したか
5. `handle only` / `on only` / `mixed` の3分類すべての設計方針レビュー結果を `review-result.md` に記録したか
6. `registerSkillHandlers` と `registerLLMHandlers` が Wave 1 先頭に配置されているか確認したか

## 次Phase

Gate 判定が「進行可」の場合、Phase 4（テスト作成 Wave 1 Red）へ進む。
差し戻しがある場合は Phase 2 の指定 Step を修正してから本 Phase を再実施する。
