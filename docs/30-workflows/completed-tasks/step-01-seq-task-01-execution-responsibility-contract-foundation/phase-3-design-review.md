# Phase 3: 設計レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                                      |
| ---------- | --------------------------------------------------------- |
| Phase      | 3                                                         |
| Phase 名   | 設計レビュー                                              |
| タスクID   | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 |
| 前提 Phase | Phase 2                                                   |
| 後続 Phase | Phase 4（テスト作成）                                     |
| ステータス | completed                                                 |
| 作成日     | 2026-03-19                                                |
| 機能名     | execution-responsibility-contract-foundation              |

## 目的

語彙 drift / state drift / simpler alternative の 3 方向で Phase 2 の設計を叩き、Phase 4 着手条件と blocked 条件を確定する。PASS/MINOR/MAJOR/CRITICAL の判定を gate-decision に記録する。

## 実行タスク

- 語彙 drift レビュー: 既存コード（RuntimePolicyResolver / auth-mode.ts）との用語差異がゼロかを検証する
- state drift レビュー: contract-matrix の capability × state × CTA に矛盾がないかを検証する
- simpler alternative 再確認: Phase 2 で棄却した Alternative A / B が Phase 3 時点でも棄却妥当かを再評価する
- 親パック整合確認: 3 concern 分離が親パックの concern 分離方針と矛盾しないかを確認する
- ゲート判定: PASS / MINOR / MAJOR / CRITICAL を決定し gate-decision に記録する
- Phase 4 条件確定: 着手条件と blocked 条件を固定する

## 参照資料

| 参照資料               | パス                                                                                        | 確認する内容                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 親パック index         | docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md                  | concern 分離方針・task 依存順（Task01→Task02 の前提条件）                   |
| Task index             | docs/30-workflows/step-01-seq-task-01-execution-responsibility-contract-foundation/index.md | AC-1〜AC-4 の検証方法                                                       |
| Phase 1 要件定義       | outputs/phase-1/requirements-definition.md                                                  | FR-1〜FR-4 / NFR-1〜NFR-2（レビューの判定基準）                             |
| Phase 2 設計サマリー   | outputs/phase-2/design-summary.md                                                           | concern table・ownership 表・simpler alternative 棄却理由・Phase 3 handoff  |
| Phase 2 契約マトリクス | outputs/phase-2/contract-matrix.md                                                          | capability × state × CTA 全組み合わせテーブル（state drift チェックの対象） |
| Phase 2 検証マトリクス | outputs/phase-2/validation-matrix.md                                                        | Phase 3 review 観点（レビューの観点リスト）                                 |
| RuntimePolicyResolver  | apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts                             | 語彙 drift チェック（capability 語彙が一致しているか）                      |
| auth-mode.ts           | packages/shared/src/types/auth-mode.ts                                                      | 語彙 drift チェック（AuthModeStatus の型定義が contract と一致するか）      |
| 旧パック監査マトリクス | docs/30-workflows/ai-runtime-execution-responsibility-realignment/design-audit-matrix.md    | 監査軸の継承（語彙 drift / state drift の先行監査結果）                     |
| spec elegance audit    | .claude/skills/aiworkflow-requirements/references/spec-elegance-consistency-audit.md        | 抽象・整合・依存レビューの基準                                              |

## 実行手順

### ステップ1: 3 方向レビューを実施する

以下の判定基準で各方向をレビューし、結果を `outputs/phase-3/design-review-report.md` に記録する。

**語彙 drift レビュー（判定基準）**

```bash
# 旧語彙（authMode / mode / runtime）が capability の代わりに使われていないか確認
grep -n "authMode\|\.mode\b\|runtimeMode\|integratedRuntime\|terminalSurface\|both\|\"none\"" \
  apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts \
  packages/shared/src/types/auth-mode.ts

# Phase 2 の contract-matrix で定義した語彙（integratedRuntime / terminalSurface / both / none）が
# コード上の型・定数と 1:1 対応しているかを確認する
```

判定基準:

- 語彙差異が **0 件**: PASS
- 語彙差異が **1〜2 件**かつ型定義の不整合でない（コメント・変数名のみ）: MINOR
- 語彙差異が **3 件以上**またはコアの型定義が異なる: MAJOR（Phase 2 へ戻る）

**state drift レビュー（判定基準）**

contract-matrix の全セルを以下の観点でチェックする:

1. capability が `integratedRuntime` または `terminalSurface` のとき UI state が必ず `ready` になるか
2. capability が `none` のとき UI state が必ず `unavailable` になるか
3. capability が `both` のとき UI state が `ready` であり `blocked` にならないか
4. `blocked` セルに理由テキストと解決 action が必ず定義されているか

判定基準:

- 矛盾 **0 件**: PASS
- 矛盾 **1 件**かつ表示テキストのみの問題: MINOR
- 矛盾 **2 件以上**またはロジックの問題: MAJOR（Phase 2 へ戻る）

**simpler alternative 再確認（判定基準）**

Phase 2 で棄却した Alternative A（2状態簡素化）と Alternative B（CTA を state に統合）について以下を確認する:

- Phase 2 の棄却理由が Phase 3 時点でも有効であるか
- 親パック index の concern 分離方針と矛盾していないか

判定基準:

- 棄却理由が有効でありかつ親パックと整合: PASS
- 棄却理由に補足が必要だが論旨は正しい: MINOR
- 棄却理由が無効または親パックと矛盾: MAJOR（Phase 2 へ戻る）

### ステップ2: 親パック整合確認と simpler alternative 最終評価

親パック index（`docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md`）を読み、以下を確認する:

1. Task01 が定義する capability / state / CTA の concern 分離が、親パックの Task01〜Task09 の分割方針と矛盾しないか
2. Task02 以降が Task01 の canonical doc set を参照して設計を進めるという依存関係が正しく記述されているか
3. 親パックが要求する「silent fallback / auto-send / hidden prompt injection の禁止」が FR-4 に正確に反映されているか

整合確認の結果を `outputs/phase-3/design-review-report.md` の「親パック整合」セクションに記録する。

### ステップ3: Phase 4 着手条件を確定する

`outputs/phase-3/gate-decision.md` に以下の判定内容を記録する。

**判定ツリー**:

| 判定              | 条件                                                                                      | 対応                                    |
| ----------------- | ----------------------------------------------------------------------------------------- | --------------------------------------- |
| PASS              | 全 AC 検証パスが定義済み、語彙 drift ゼロ、state drift ゼロ、simpler alternative 棄却有効 | Phase 4 へ進む                          |
| MINOR             | 用語の微修正のみ（型定義の変更を伴わない）、または表示テキストの追記のみ                  | MINOR 指摘を修正した後に Phase 4 へ進む |
| MAJOR（設計問題） | concern 分解の見直しが必要、または contract-matrix に矛盾あり                             | Phase 2 へ戻る                          |
| MAJOR（要件問題） | capability 4状態の定義変更が必要                                                          | Phase 1 へ戻る                          |
| CRITICAL          | 親パックの task 分割方針との根本矛盾、またはユーザー承認なしで進められない変更            | 親パック再検討（ユーザー承認必須）      |

**MINOR 指摘の追跡ルール**:

- MINOR 指摘は全て gate-decision.md に記録する（「機能影響なし」でも省略しない）
- 各 MINOR 指摘に「修正内容」「修正ファイル」「修正確認方法」を付記する
- MINOR 修正完了後、修正箇所を再確認してから Phase 4 へ進む

**Phase 4 着手条件（全てを満たすこと）**:

- [ ] 全 AC（AC-1〜AC-4）の検証パスが outputs/phase-2/validation-matrix.md に定義されている
- [ ] 語彙 drift が 0 件であることが確認されている（またはMINOR修正が完了している）
- [ ] state drift が 0 件であることが確認されている（またはMINOR修正が完了している）
- [ ] simpler alternative が棄却されており、棄却理由が記録されている
- [ ] gate-decision.md が PASS または MINOR 修正完了の記録を含む

### ステップ4: Phase 13 blocked 条件を記録する

`outputs/phase-3/gate-decision.md` の「Phase 13 blocked 条件」セクションに以下を記録する:

- ユーザー承認なしの commit / PR を禁止する: capability / state / CTA 契約を変更するコードを含む PR は、Task01 canonical doc set の変更を伴う場合にユーザー承認を必要とする
- CRITICAL 判定が発生した場合は、ユーザーへの確認なしに Phase 1 へ戻ることを禁止する
- 親パック index に記載された task 依存順（Task01→Task02→...）の変更はユーザー承認必須とする

## 統合テスト連携（Phase 1〜11は必須）

validation-matrix をレビューし、Phase 4 テスト設計に渡す integration point の完全性を確認する:

1. capability 判定ロジックの unit test 観点が定義されているか
2. state 変換ロジックの unit test 観点が定義されているか
3. CTA 表示条件の component test 観点が定義されているか
4. FR-4（禁止事項）の integration test 観点が定義されているか

上記4点が全て揃っている場合のみ Phase 4 を開始する。

## 多角的チェック観点（AIが判断）

| 観点                   | 適用判断                                                      | 仕様参照先                                                            |
| ---------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------- |
| UI/UX                  | contract-matrix のCTA表示条件が画面設計と整合するか           | `aiworkflow-requirements: ui-ux-*`                                    |
| アーキテクチャ         | Concern A / B / C の ownership 境界が arch 原則に従っているか | `aiworkflow-requirements: arch-*`                                     |
| IPC/Preload            | AuthModeStatus DTO が IPC security 原則に従っているか         | `aiworkflow-requirements: api-ipc-*`, `security-electron-ipc-core.md` |
| ワークフローガバナンス | MINOR 指摘が全て追跡可能な形式で記録されているか              | `aiworkflow-requirements: task-workflow*`, `lessons-learned*`         |

**この task 固有の重点**: 語彙 drift / state drift / simpler alternative の 3 方向で設計を叩く

## サブタスク管理

Phase 実行開始時に、TodoWrite 相当で以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 2 全成果物を含む）
2. 語彙 drift レビュー（ステップ1-A）
3. state drift レビュー（ステップ1-B）
4. simpler alternative 再確認（ステップ1-C）
5. 親パック整合確認（ステップ2）
6. ゲート判定と gate-decision 記録（ステップ3）
7. Phase 13 blocked 条件記録（ステップ4）
8. 成果物パスと outputs/phase-3 の整合確認
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## 成果物

| 成果物           | パス                                    | 期待内容                                                                                                                    |
| ---------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 設計レビュー報告 | outputs/phase-3/design-review-report.md | 語彙 drift / state drift / simpler alternative 各方向のレビュー結果（判定根拠と証跡）と親パック整合確認結果                 |
| ゲート判定       | outputs/phase-3/gate-decision.md        | PASS/MINOR/MAJOR/CRITICAL 判定・Phase 4 着手条件（全チェックリスト）・MINOR 指摘一覧（修正方法付き）・Phase 13 blocked 条件 |

## 完了条件

- [ ] 語彙 drift / state drift / simpler alternative の 3 方向のレビュー結果が design-review-report.md に記録されている
- [ ] 各方向の判定基準（件数・条件）を適用した結果が記載されている
- [ ] 親パック整合確認の結果が記録されている
- [ ] gate-decision.md に PASS/MINOR/MAJOR/CRITICAL の最終判定が記載されている
- [ ] Phase 4 着手条件のチェックリストが全項目チェック可能な状態で記録されている
- [ ] MINOR 指摘が存在する場合、修正内容・ファイル・確認方法が付記されている
- [ ] Phase 13 blocked 条件が gate-decision.md に記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物パスが `outputs/phase-3/` と一致している
- [ ] `artifacts.json` と `outputs/artifacts.json` の更新方針が確認されている
- [ ] Phase 4 へ進む前提として Phase 1-3 の gate 条件が明記されている

## 次のPhase

- [Phase 4（テスト作成）](./phase-4-test-creation.md)
