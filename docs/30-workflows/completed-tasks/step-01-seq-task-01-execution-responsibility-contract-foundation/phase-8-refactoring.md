# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                                      |
| ---------- | --------------------------------------------------------- |
| Phase      | 8                                                         |
| Phase 名   | リファクタリング                                          |
| タスクID   | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 |
| 前提 Phase | Phase 7                                                   |
| 後続 Phase | Phase 9（品質検証）                                       |
| ステータス | completed                                                 |
| 作成日     | 2026-03-19                                                |
| 機能名     | execution-responsibility-contract-foundation              |

## 目的

execution responsibility / capability 契約基盤をより単純に保つ refactor boundary を定義する。
具体的には、型名・DTO 名・値名の語彙候補を洗い出し、simpler alternative を Phase 7 の coverage 結果に照らして再評価し、崩してはいけない contract を AC ベースで固定する。

## 実行タスク

### タスク1: リファクタ候補の洗い出し

Phase 5 の file-change-scope と `packages/shared/src/types/auth-mode.ts`、`apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts` を参照し、以下の候補を記録する。

| 候補             | 内容                                                                       | 破壊的変更の有無 | 方針                 |
| ---------------- | -------------------------------------------------------------------------- | ---------------- | -------------------- |
| 用語整理         | user-facing 文言の `auth mode` 残骸を capability / access wording へ寄せる | なし             | 実施候補             |
| selector 集約    | capability -> state 変換の重複を 1 selector / hook に寄せる                | 低               | 実施候補             |
| CTA 集約         | blocked / unavailable CTA 分岐の重複を 1 contract consumer に寄せる        | 低               | 実施候補             |
| transport rename | `AuthModeStatus` を含む transport DTO の全面 rename                        | 高               | デフォルトでは不採用 |

各候補について以下を `outputs/phase-8/refactor-boundaries.md` に記録する:

- `grep -rn "authMode|capability|blocked|unavailable" apps/ packages/` で影響ファイルリストを取得する手順
- 「重複削減」は積極採用、「語彙 rename」は既存 canonical との互換性を壊さない限り defer する方針
- dual naming を許容する場合は transport compatibility のためだけに限定し、期限を same-wave 内に閉じる

### タスク2: simpler alternative 再評価

Phase 2 で棄却した以下の代替案を、Phase 7 の coverage-targets と integration-gate に照らして再評価する。

**Alternative A（capability 2状態簡素化）**:

- Phase 2 棄却理由: `both` / `none` の2状態が消えると、接続断・キー未入力の両方を `none` で表現できず UI の分岐が曖昧になる
- Phase 7 後の再評価基準: Task02-09 の消費パターンで `both` / `none` を区別するテストケースが Phase 4 に存在するか確認する
- 判定: 採用 / 棄却（理由を1文で明記する）

**Alternative B（CTA統合）**:

- Phase 2 棄却理由: primary CTA と secondary CTA を1つの `ctaLabel` に統合すると、Renderer 側で分岐ロジックが増え責務侵食が起きる
- Phase 7 後の再評価基準: Renderer 実装コスト（Phase 5 成果物の該当コンポーネント行数）を確認し、分岐ロジックが実際に移動したか確認する
- 判定: 採用 / 棄却（理由を1文で明記する）

両評価結果を `outputs/phase-8/simplification-candidates.md` に記録する。

### タスク3: 責務再整列の確認

以下の3点を確認し、責務侵食が発生していれば `outputs/phase-8/refactor-boundaries.md` に記録する。

1. `RuntimePolicyResolver` が capability 判定以外の責務を持っていないか確認する。持っている場合はその責務名と移動先候補を記録する。
2. `AuthModeStatus` DTO と既存 capability 型が、transport compatibility を保ったまま UI state / CTA 契約を伝えられているかを判定する。premature な全面 rename は避ける。
3. Main Process ↔ Renderer の IPC boundary で DTO 変換が冗長でないか、また `settings` / `renderView()` consumer が capability を再判定していないかを確認する。

### タスク4: 回帰条件の固定

refactor で崩してはいけない contract を AC ベースで固定し、`outputs/phase-8/refactor-boundaries.md` に追記する。

- AC-1 維持条件: contract-matrix の capability 4状態定義が rename 後も完全に保持されること
- AC-2 維持条件: state × CTA の 1:1 マッピングが rename 後も破綻しないこと
- AC-3 維持条件: silent fallback / auto-send / hidden injection の禁止制約が rename 後も有効なこと
- AC-4 維持条件: canonical doc set のパスが rename 後も有効なこと（パス変更の場合はリダイレクト手順を記録する）
- Phase 4 の test matrix と Phase 6 の regression plan が refactor 後も全 PASS する条件（テスト内の型名・値名を更新すれば PASS することを確認する手順を記述する）

## 参照資料

| 参照資料                   | パス                                                                                                                          | 確認する内容                                                            |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| 親パック index             | docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md                                                    | 依存順・並列可否・設計ゲート                                            |
| Task index                 | docs/30-workflows/step-01-seq-task-01-execution-responsibility-contract-foundation/index.md                                   | 対象 task のメタ情報と受入基準（AC-1〜AC-4）                            |
| Phase 1 outputs            | outputs/phase-1/requirements-definition.md / outputs/phase-1/scope-definition.md / outputs/phase-1/current-state-inventory.md | foundation 要件・境界・現状棚卸し                                       |
| Phase 2                    | phase-2-design.md                                                                                                             | Alternative A / B の棄却理由・contract-matrix・3 concern 分解           |
| Phase 4                    | phase-4-test-creation.md                                                                                                      | test matrix（リファクタ後も PASS する条件の確認元）                     |
| Phase 5                    | phase-5-implementation.md                                                                                                     | file-change-scope（rename 候補の影響範囲）                              |
| Phase 5 outputs            | outputs/phase-5/implementation-plan.md / outputs/phase-5/file-change-scope.md                                                 | 実装順序・変更スコープ                                                  |
| Phase 6                    | phase-6-test-expansion.md                                                                                                     | regression plan（回帰条件の確認元）                                     |
| Phase 7                    | phase-7-coverage-check.md                                                                                                     | coverage-targets / integration-gate（simpler alternative 再評価の根拠） |
| shared 型定義              | packages/shared/src/types/auth-mode.ts                                                                                        | 現在の AuthMode 型・AuthModeStatus DTO の定義                           |
| RuntimePolicyResolver      | apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts                                                               | capability 判定ロジックと責務の確認                                     |
| ui-ux-navigation           | .claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md                                                         | `settings` public shell / `ViewType` / `renderView()` の consumer 境界  |
| arch-state-management-core | .claude/skills/aiworkflow-requirements/references/arch-state-management-core.md                                               | 既存 capability 語彙と selector 境界                                    |
| interfaces-auth-core       | .claude/skills/aiworkflow-requirements/references/interfaces-auth-core.md                                                     | capability と auth 型の具体契約                                         |
| spec elegance audit        | .claude/skills/aiworkflow-requirements/references/spec-elegance-consistency-audit.md                                          | 抽象・整合・依存レビューの基準                                          |

## 実行手順

### ステップ1: Phase 7 の成果物を確認する

`phase-7-coverage-check.md` の coverage gate（Line 80%、Branch 60%、Function 80%）の充足結果と integration-gate の PASS/FAIL を確認し、Phase 8 のスコープを固定する。gate が FAIL の場合は Phase 7 に戻る。

### ステップ2: 語彙リファクタ候補を洗い出す（タスク1）

`packages/shared/src/types/auth-mode.ts` と `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts` を Read し、duplicate / premature rename 候補の現在の定義を確認する。次に `grep -rn "authMode\|AuthModeStatus\|capability\|blocked\|unavailable" apps/ packages/` を実行し、影響ファイルリストを取得する。取得結果を `outputs/phase-8/refactor-boundaries.md` に記録する。

### ステップ3: simpler alternative を再評価する（タスク2）

Phase 4 の test matrix で `both` / `none` を区別するテストケースの有無を確認する。Phase 5 の Renderer 実装コンポーネント行数を確認する。両情報をもとに Alternative A / B の採用・棄却判定を行い、`outputs/phase-8/simplification-candidates.md` に記録する。

### ステップ4: 責務再整列を確認し、回帰条件を固定する（タスク3・4）

`RuntimePolicyResolver` の責務侵食を確認し、IPC boundary の冗長変換を確認する。確認結果と AC-1〜AC-4 の維持条件を `outputs/phase-8/refactor-boundaries.md` に追記する。

### ステップ5: 完了条件と次Phase handoff を確認する

完了条件チェックリストを全て verified にし、Phase 9 への handoff 条件（refactor-boundaries.md と simplification-candidates.md が揃っていること）を確認する。

## 統合テスト連携（Phase 1〜11は必須）

refactor 後も以下の invariants が維持されることを確認する:

| invariant                                               | 確認方法                                                                                                 |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| capability 4状態の定義が contract-matrix と一致している | refactor-boundaries.md の AC-1 維持条件セクションで照合                                                  |
| state × CTA の 1:1 マッピングが破綻していない           | refactor-boundaries.md の AC-2 維持条件セクションで照合                                                  |
| Phase 4 の test matrix が rename 後も全 PASS する       | テスト内の型名・値名を更新した状態で `pnpm --filter @repo/desktop test` が PASS することを手順として記述 |

## 多角的チェック観点（AIが判断）

| 観点                   | 適用判断                                             | 仕様参照先                                                            |
| ---------------------- | ---------------------------------------------------- | --------------------------------------------------------------------- |
| UI/UX                  | 状態語彙・CTA 契約の rename が UI 仕様に影響する場合 | `aiworkflow-requirements: ui-ux-*`                                    |
| アーキテクチャ         | capability DTO 分離・責務再整列を行う場合            | `aiworkflow-requirements: arch-*`                                     |
| IPC/Preload            | AuthModeStatus DTO の IPC boundary を変更する場合    | `aiworkflow-requirements: api-ipc-*`, `security-electron-ipc-core.md` |
| ワークフローガバナンス | canonical doc set のパスを変更する場合               | `aiworkflow-requirements: task-workflow*`, `lessons-learned*`         |

**この task 固有の重点**: 語彙 drift / state drift / simpler alternative の 3 方向で設計を叩く

## サブタスク管理

Phase 実行開始時に、TodoWrite 相当で以下のサブタスクを作成すること:

1. Phase 7 成果物（coverage gate・integration gate）の確認
2. 語彙リファクタ候補の洗い出し（grep 実行・影響ファイルリスト記録）
3. simpler alternative 再評価（Alternative A / B の採用・棄却判定）
4. 責務再整列の確認（RuntimePolicyResolver・AuthModeStatus DTO・IPC boundary）
5. 回帰条件の固定（AC-1〜AC-4 の維持条件を記録）
6. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## 成果物

| 成果物         | パス                                         | 内容                                                                         |
| -------------- | -------------------------------------------- | ---------------------------------------------------------------------------- |
| リファクタ境界 | outputs/phase-8/refactor-boundaries.md       | rename 候補・影響ファイルリスト・破壊的変更範囲・AC ベース回帰条件・禁止事項 |
| 簡素化候補     | outputs/phase-8/simplification-candidates.md | Alternative A / B の採用・棄却判定と根拠                                     |

## 完了条件

- [ ] `outputs/phase-8/refactor-boundaries.md` に rename 候補・影響ファイルリスト・AC-1〜AC-4 の維持条件が記録されている
- [ ] `outputs/phase-8/simplification-candidates.md` に Alternative A / B の採用・棄却判定と理由が記録されている
- [ ] 崩してはいけない contract が AC ベースで固定されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物パスが `outputs/phase-8/` と一致している
- [ ] `artifacts.json` と `outputs/artifacts.json` の更新方針が確認されている
- [ ] 前Phaseの gate 条件（coverage gate PASS）を満たした前提で実行手順が書かれている

## 次のPhase

- [Phase 9（品質検証）](./phase-9-quality-assurance.md)
