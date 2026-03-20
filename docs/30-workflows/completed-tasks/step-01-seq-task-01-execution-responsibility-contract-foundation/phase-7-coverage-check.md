# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                                                      |
| ---------- | --------------------------------------------------------- |
| Phase      | 7                                                         |
| Phase 名   | カバレッジ確認                                            |
| タスクID   | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 |
| 前提 Phase | Phase 6                                                   |
| 後続 Phase | Phase 8（リファクタリング）                               |
| ステータス | completed                                                 |
| 作成日     | 2026-03-19                                                |
| 機能名     | execution-responsibility-contract-foundation              |

## 目的

3 concern ごとの coverage gate と統合ゲートを定義する。Phase 6 で未到達と明示した境界ケースを residual risk として整理し、Phase 9 へ handoff する。

## 実行タスク

### タスク1: coverage gate 設計（Concern 別）

以下の目標を outputs/phase-7/coverage-targets.md に定義する。Vitest の v8 プロバイダを使用して測定する。

**Concern A: capability 契約（RuntimePolicyResolver）**

| 指標              | 最低基準 | 推奨基準 | 測定対象                     |
| ----------------- | -------- | -------- | ---------------------------- |
| Line Coverage     | 90%      | 95%      | `RuntimePolicyResolver.ts`   |
| Branch Coverage   | 80%      | 90%      | `resolve()` メソッドの全分岐 |
| Function Coverage | 100%     | 100%     | `resolve()` + `constructor`  |

Phase 4 の CA-1〜CA-5 と Phase 6 の E-1〜E-2 が全て PASS することで 80%+ branch coverage を達成する。

**Concern B: state 語彙（AuthModeStatus DTO + Zustand capability slice）**

| 指標              | 最低基準 | 推奨基準 | 測定対象                          |
| ----------------- | -------- | -------- | --------------------------------- |
| Line Coverage     | 90%      | 95%      | `auth-mode.ts`, capability slice  |
| Branch Coverage   | 80%      | 85%      | `AuthModeStatus` 生成パスの全分岐 |
| Function Coverage | 90%      | 95%      | DTO 生成関数 + slice selector     |

Phase 4 の CB-1〜CB-5 と Phase 6 の E-4〜E-6（遷移中・IPC timeout）が全て PASS することで達成する。

**Concern C: CTA 契約（CTA コンポーネント）**

| 指標              | 最低基準 | 推奨基準 | 測定対象                          |
| ----------------- | -------- | -------- | --------------------------------- |
| Line Coverage     | 80%      | 90%      | CTA コンポーネント                |
| Branch Coverage   | 70%      | 80%      | capability × state の全組み合わせ |
| Function Coverage | 80%      | 90%      | 表示条件判定関数                  |

Phase 4 の CC-1〜CC-5 と Phase 6 の E-7〜E-8（capability 劣化）が全て PASS することで達成する。

### タスク2: 統合ゲート設計

以下の 3 つのゲートを outputs/phase-7/integration-gate.md に定義する。

**smoke ゲート（正常パス確認）**

settings 変更 → capability 再計算 → CTA 表示更新の一連のフローが正常に動作すること。

- 入力: public settings shell で実行可能性に関わる設定を変更する
- 検証: capability が再計算され、mainline surface の CTA が contract-matrix 通りに更新されること
- 合否基準: 3 ステップ全てが 500ms 以内に完了すること

**integration ゲート（surface 横断確認）**

Settings と Main Chat の 2 surface を横断したフローが正常に動作すること。

- 入力: Phase 4 の S-1（Settings → Main Chat capability 再計算フロー）を実行する
- 検証: Settings の変更が Main Chat の CTA に反映されること
- 合否基準: S-1 の全ステップが PASS すること

**walkthrough ゲート（Phase 11 manual シナリオ事前定義）**

Phase 11 で手動確認すべきシナリオを事前に定義する。

| シナリオ番号 | 手動操作                                                             | 確認する UI 状態                                                                  |
| ------------ | -------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| W-1          | Settings public shell で in-app lane を有効化する → Main Chat を開く | CTA が contract-matrix 通りの primary CTA に変わっていること                      |
| W-2          | Settings public shell で両 lane を失効させる → Main Chat を開く      | state が blocked または unavailable に変わり、no-op CTA が出ていないこと          |
| W-3          | 両 lane を有効化した状態で mainline surface を開く                   | capability = both となり、primary / secondary の両 CTA オプションが表示されること |

### タスク3: 不足観点整理（Phase 9 への residual risk handoff）

以下の残課題を outputs/phase-7/coverage-targets.md の末尾に記録する。

| residual risk ID | 内容                                          | Phase 9 での対応                                                                  |
| ---------------- | --------------------------------------------- | --------------------------------------------------------------------------------- |
| RR-1             | E-3（API Key 不正形式）の期待動作が未確定     | Phase 2 設計書を参照して確定し、テストを追加する                                  |
| RR-2             | E-5〜E-6（IPC timeout）の mock 実装が未作成   | Phase 9 で `vi.useFakeTimers` を使って timeout mock を実装する                    |
| RR-3             | R-2（auto-send）の検証方法が UI イベント依存  | Phase 9 で Playwright E2E テストで補完する                                        |
| RR-4             | P41 対策（v8 インライン関数カバレッジ）未確認 | Phase 9 で `getAllowedWindows` 相当のコールバックが呼ばれることを明示的に検証する |

## 参照資料

| 参照資料              | パス                                                                                        | 確認する内容                                                     |
| --------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| 親パック index        | docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md                  | 依存順・並列可否・設計ゲート                                     |
| Task index            | docs/30-workflows/step-01-seq-task-01-execution-responsibility-contract-foundation/index.md | 対象 task のメタ情報と受入基準                                   |
| Phase 4               | phase-4-test-creation.md                                                                    | CA-1〜CC-5 テストケース・S-1〜S-3 統合シナリオ                   |
| Phase 5               | phase-5-implementation.md                                                                   | 変更スコープ・対象ファイル一覧                                   |
| Phase 6               | phase-6-test-expansion.md                                                                   | 回帰テスト R-1〜R-3・境界ケース E-1〜E-8・未到達ケースの明示     |
| 親 UI/UX 正本         | docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-realization.md      | walkthrough シナリオの CTA 契約参照元                            |
| ui-ux-navigation      | .claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md                       | `settings` public shell / `ViewType` / `renderView()` 境界       |
| task-workflow-backlog | .claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md                  | residual risk の formalization 先                                |
| known pitfalls P41    | .claude/rules/06-known-pitfalls.md                                                          | v8 プロバイダのインライン関数カバレッジ問題                      |
| code quality rules    | .claude/rules/02-code-quality.md                                                            | coverage 最低基準（line 80%+, branch 60%+, function 80%+）の確認 |

## 実行手順

### ステップ1: Phase 6 の成果物を確認し、coverage gate の起点を確定する

outputs/phase-6/edge-case-matrix.md の未到達ケース（Phase 7 coverage gate に含めると明示されたケース）を確認する。各 concern の対象ファイルと測定コマンドを確定する。

### ステップ2: Concern A/B/C ごとの coverage 目標を outputs/phase-7/coverage-targets.md に記録する

測定対象ファイル・最低基準・推奨基準・「この基準を満たすために必要なテストケース」を記録する。基準未達の場合は Phase 6 に戻る条件を明記する。

### ステップ3: smoke / integration / walkthrough ゲートを outputs/phase-7/integration-gate.md に記録する

各ゲートの「入力・検証内容・合否基準」を検証可能な文章で記述する。walkthrough ゲート（W-1〜W-3）は Phase 11 手動テスト仕様書の前提になるため、操作手順を明確にする。

### ステップ4: residual risk を RR-1〜RR-4 として整理し Phase 9 へ handoff する

各 residual risk に「Phase 9 での対応方針」を紐付ける。対応が不明な場合は Phase 2 設計書を参照して確定する。

## 統合テスト連携

| ゲート種別                     | 合否判定タイミング             | 未達時の対応                       |
| ------------------------------ | ------------------------------ | ---------------------------------- |
| coverage gate（Concern A/B/C） | Phase 7 完了時点で目標値を確認 | 未達なら Phase 6 に戻りテスト追加  |
| smoke ゲート                   | Phase 9 品質検証で自動実行     | 失敗なら Phase 5 の実装を修正      |
| integration ゲート             | Phase 9 品質検証で自動実行     | 失敗なら Phase 5 の IPC 設計を修正 |
| walkthrough ゲート             | Phase 11 手動テストで確認      | 失敗なら Phase 5 の CTA 実装を修正 |

## 多角的チェック観点（AIが判断）

| 観点                   | 適用判断                                                    | 仕様参照先                                                            |
| ---------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------- |
| UI/UX                  | walkthrough W-1〜W-3 の CTA 状態確認が関係する              | `aiworkflow-requirements: ui-ux-*`                                    |
| アーキテクチャ         | Concern A（Main authority）の coverage 測定対象ファイル確認 | `aiworkflow-requirements: arch-*`                                     |
| IPC/Preload            | RR-2（IPC timeout mock）・P41（v8 インライン関数）対策      | `aiworkflow-requirements: api-ipc-*`, `security-electron-ipc-core.md` |
| ワークフローガバナンス | ledger / backlog / lessons を触る場合                       | `aiworkflow-requirements: task-workflow*`, `lessons-learned*`         |

**この task 固有の重点**: 語彙 drift / state drift / simpler alternative の 3 方向で設計を叩く

## サブタスク管理

Phase 実行開始時に、TodoWrite 相当で以下のサブタスクを作成すること:

1. Phase 6 成果物の確認（未到達ケースの把握）
2. Concern A coverage gate 定義
3. Concern B coverage gate 定義
4. Concern C coverage gate 定義
5. smoke / integration / walkthrough ゲート定義
6. residual risk RR-1〜RR-4 の整理と Phase 9 handoff
7. 成果物パスと outputs/phase-7/ の整合確認
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## 成果物

| 成果物         | パス                                | 内容                                                                       |
| -------------- | ----------------------------------- | -------------------------------------------------------------------------- |
| カバレッジ目標 | outputs/phase-7/coverage-targets.md | Concern 別 coverage 目標（line/branch/function）+ residual risk RR-1〜RR-4 |
| 統合ゲート     | outputs/phase-7/integration-gate.md | smoke / integration / walkthrough の定義（入力・検証・合否基準）           |

## 完了条件

- [ ] Concern A/B/C ごとに line / branch / function の coverage 目標が定義されている
- [ ] smoke / integration / walkthrough の 3 ゲートが「入力・検証・合否基準」付きで定義されている
- [ ] walkthrough シナリオが 3 つ以上（W-1〜W-3）定義されている
- [ ] Phase 9 へ持ち越す residual risk が RR-1〜RR-4 として整理されている
- [ ] 基準未達時の「Phase 6 に戻る条件」が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物パスが `outputs/phase-7/` と一致している
- [ ] `artifacts.json` と `outputs/artifacts.json` の更新方針が確認されている
- [ ] 前Phaseの gate 条件（Phase 6 完了条件チェックリスト全通過）を満たした前提で実行手順が書かれている

## 次のPhase

- [Phase 8（リファクタリング）](./phase-8-refactoring.md)
