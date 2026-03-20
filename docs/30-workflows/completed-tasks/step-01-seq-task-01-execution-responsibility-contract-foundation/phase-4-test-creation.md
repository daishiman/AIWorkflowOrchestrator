# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                                      |
| ---------- | --------------------------------------------------------- |
| Phase      | 4                                                         |
| Phase 名   | テスト作成                                                |
| タスクID   | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 |
| 前提 Phase | Phase 3                                                   |
| 後続 Phase | Phase 5（実装）                                           |
| ステータス | completed                                                 |
| 作成日     | 2026-03-19                                                |
| 機能名     | execution-responsibility-contract-foundation              |

## 目的

capability / state 語彙 / CTA 契約の各 concern をテストで検証するための test design を作る。Phase 2 の contract-matrix と validation-matrix を入力とし、future executor がそのままテストコードに変換できる粒度でケースを定義する。

## 実行タスク

### タスク1: 契約テスト設計（Concern 別マトリクス作成）

Concern A / B / C ごとにテストケースマトリクスを作成する。各 concern で 5 ケース以上を定義すること。

**Concern A: capability 4 状態の判定ロジック**

`RuntimePolicyResolver.resolve` の入力条件 → 出力 capability のマッピングを網羅する。

| テストID | 入力条件                                                              | 期待 capability   |
| -------- | --------------------------------------------------------------------- | ----------------- |
| CA-1     | integrated runtime 可 / terminal handoff 不可                         | integratedRuntime |
| CA-2     | integrated runtime 不可 / terminal handoff 可                         | terminalSurface   |
| CA-3     | integrated runtime 可 / terminal handoff 可                           | both              |
| CA-4     | integrated runtime 不可 / terminal handoff 不可                       | none              |
| CA-5     | integrated runtime 判定が timeout / degraded でも terminal handoff 可 | terminalSurface   |

**Concern B: state 語彙（ready / blocked / unavailable）の判定条件**

`AuthModeStatus` DTO の各フィールドが Renderer の state 語彙と一致することを検証する。

| テストID | capability        | 補助条件                                 | 期待 UI state |
| -------- | ----------------- | ---------------------------------------- | ------------- |
| CB-1     | integratedRuntime | 現在 surface で即時実行可能              | ready         |
| CB-2     | terminalSurface   | handoff CTA が利用可能                   | ready         |
| CB-3     | both              | primary / secondary の両 lane が利用可能 | ready         |
| CB-4     | none              | 解決 action あり                         | blocked       |
| CB-5     | none              | sanctioned な解決 action なし            | unavailable   |

**Concern C: CTA 表示条件（capability × state → primary/secondary CTA）**

primary CTA 1 個 + secondary CTA 1 個の組み合わせが全ケースで成立することを確認する。

| テストID | state / capability        | 期待 primary CTA              | 期待 secondary CTA                   |
| -------- | ------------------------- | ----------------------------- | ------------------------------------ |
| CC-1     | ready / integratedRuntime | in-app 実行                   | settings / help の補助導線           |
| CC-2     | ready / terminalSurface   | ターミナルで実行              | settings / help の補助導線           |
| CC-3     | ready / both              | 優先 lane の実行 CTA          | 代替 lane の handoff CTA             |
| CC-4     | blocked / none            | 解決 action（例: 設定を開く） | 補助導線のみ、no-op は禁止           |
| CC-5     | unavailable / none        | 非表示                        | 理由説明のみ、または明示的 help 導線 |

### タスク2: 統合シナリオ設計（surface 横断）

3 シナリオ以上を定義する。

**シナリオ S-1: Settings public shell → Main Chat capability 再計算フロー**

1. `settings` を AuthGuard bypass / public shell 例外として開く
2. 実行可能性に関わる設定変更により capability 再計算トリガが発火する
3. `RuntimePolicyResolver.resolve` が再実行され capability が更新される
4. `AuthModeStatus` DTO が Renderer に送信される
5. Main Chat の CTA 表示が新 capability 契約に基づいて更新される

**シナリオ S-2: terminal handoff → 手動実行 → 結果表示フロー**

1. capability = terminalSurface で "ターミナルで実行" CTA をクリックする
2. `TerminalHandoffBuilder.build` が handoff bundle を生成する
3. ターミナルに bundle が渡される
4. 実行結果が Renderer に返却され表示される

**シナリオ S-3: capability 劣化フロー**

1. capability = both の状態で片方の lane 前提条件を失わせる
2. `RuntimePolicyResolver.resolve` が再実行される
3. capability が `both` から単一 lane へ変化する
4. 失われた lane に対応する CTA が補助導線または非表示へ変化する

**シナリオ S-4: ViewType / renderView consumer 境界確認**

1. `currentView === "settings"` で public shell 例外が成立する
2. 設定変更後に mainline surface へ戻る
3. `renderView()` は Task01 の契約を消費するが、自身では capability を再判定しない
4. CTA と route の責務境界が崩れていないことを確認する

### タスク3: モック戦略定義（DI 境界ごと）

| モック対象        | インターフェース  | mock 値パターン                                                                            |
| ----------------- | ----------------- | ------------------------------------------------------------------------------------------ |
| IAuthKeyService   | `getKey()`        | 有効キー文字列 / null / 空文字列 / スペースのみ                                            |
| IAuthModeService  | `getMode()`       | "subscription" / "api-key"                                                                 |
| IAuthModeService  | `getStatus()`     | `AuthModeStatus` DTO（capability × state の組み合わせ）                                    |
| IPC Main→Renderer | response envelope | `{ success: true, data: AuthModeStatus }` / `{ success: false, error: { code, message } }` |
| Zustand Store     | capability slice  | 各 capability 状態の初期値を直接注入                                                       |

## 参照資料

| 参照資料             | パス                                                                                        | 確認する内容                                               |
| -------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 親パック index       | docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md                  | 依存順・並列可否・設計ゲート                               |
| Task index           | docs/30-workflows/step-01-seq-task-01-execution-responsibility-contract-foundation/index.md | 対象 task のメタ情報と受入基準                             |
| Phase 1              | phase-1-requirements.md                                                                     | FR-1〜FR-4 の受入基準と禁止事項                            |
| Phase 2              | phase-2-design.md                                                                           | contract-matrix と validation-matrix の全組み合わせ        |
| Phase 3              | phase-3-design-review.md                                                                    | review gate の判定結果と MINOR 指摘内容                    |
| 親 UI/UX 正本        | docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-realization.md      | 状態語彙・CTA・handoff 契約の canonical 定義               |
| 親 UI/UX 図解        | docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-diagrams.md         | 状態遷移・画面構成・導線図（シナリオ設計の参照元）         |
| ui-ux-navigation     | .claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md                       | `settings` public shell / `ViewType` / `renderView()` 境界 |
| ui-ux-settings-core  | .claude/skills/aiworkflow-requirements/references/ui-ux-settings-core.md                    | settings bypass / timeout fallback の確認元                |
| interfaces-auth-core | .claude/skills/aiworkflow-requirements/references/interfaces-auth-core.md                   | capability と auth 型の具体契約（型定義確認）              |
| api-ipc-system-core  | .claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md                    | IPC response envelope の形式確認                           |

## 実行手順

### ステップ1: Phase 2 の contract-matrix と validation-matrix を読む

Phase 2 成果物（outputs/phase-2/contract-matrix.md）を参照し、テスト対象 concern の組み合わせ数を確認する。未定義の組み合わせがあれば本 Phase で補完する。

### ステップ2: Concern A/B/C ごとにテストケースマトリクスを作成する

各 concern で 5 ケース以上のマトリクスを outputs/phase-4/test-matrix.md に記録する。テストケースには「入力条件・期待出力・失敗時の判定基準」を明示する。

### ステップ3: 統合シナリオを surface 横断で 3 シナリオ以上定義する

S-1〜S-3 を起点に追加シナリオを検討する。Settings / Main Chat / TerminalSurface の 3 surface が最低 1 回ずつ登場すること。

### ステップ4: モック戦略を DI 境界ごとに定義する

outputs/phase-4/mock-strategy.md にモック対象・インターフェース・mock 値パターンを記録する。IPC response envelope の形式は P60 対策として Phase 2 設計書で確認してから記述する。

## 統合テスト連携

| test type   | 対象シナリオ                              | 担当 Phase     |
| ----------- | ----------------------------------------- | -------------- |
| unit        | Concern A/B/C の個別ケース（CA-1〜CC-5）  | Phase 4-5      |
| integration | S-1〜S-3 の surface 横断シナリオ          | Phase 5-6      |
| manual      | Phase 11 walkthrough（手動 CTA 操作確認） | Phase 7 で定義 |

## 多角的チェック観点（AIが判断）

| 観点                   | 適用判断                                    | 仕様参照先                                                            |
| ---------------------- | ------------------------------------------- | --------------------------------------------------------------------- |
| UI/UX                  | CTA 表示条件・state 語彙が関係する          | `aiworkflow-requirements: ui-ux-*`                                    |
| アーキテクチャ         | capability 判定責務が Main に集中しているか | `aiworkflow-requirements: arch-*`                                     |
| IPC/Preload            | response envelope 形式・IPC チャンネル定数  | `aiworkflow-requirements: api-ipc-*`, `security-electron-ipc-core.md` |
| ワークフローガバナンス | ledger / backlog / lessons を触る場合       | `aiworkflow-requirements: task-workflow*`, `lessons-learned*`         |

**この task 固有の重点**: 語彙 drift / state drift / simpler alternative の 3 方向で設計を叩く

## サブタスク管理

Phase 実行開始時に、TodoWrite 相当で以下のサブタスクを作成すること:

1. Phase 2 contract-matrix / validation-matrix の確認
2. Concern A テストケースマトリクス作成（5 ケース以上）
3. Concern B テストケースマトリクス作成（5 ケース以上）
4. Concern C テストケースマトリクス作成（5 ケース以上）
5. 統合シナリオ設計（3 シナリオ以上）
6. モック戦略定義（DI 境界ごと）
7. 成果物パスと outputs/phase-4/ の整合確認
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## 成果物

| 成果物           | パス                             | 内容                                                |
| ---------------- | -------------------------------- | --------------------------------------------------- |
| テストマトリクス | outputs/phase-4/test-matrix.md   | Concern A/B/C × テストケース × 期待結果のマトリクス |
| モック戦略       | outputs/phase-4/mock-strategy.md | DI 境界・IPC・Store の mock 方針                    |

## 完了条件

- [ ] Concern A/B/C ごとに 5 ケース以上のテストケースが定義されている
- [ ] 統合シナリオが 3 つ以上定義されている（Settings / Main Chat / TerminalSurface が各 1 回以上登場）
- [ ] モック戦略が DI 境界（IAuthKeyService / IAuthModeService / IPC / Store）ごとに定義されている
- [ ] IPC response envelope の形式が Phase 2 設計書から引用されている（P60 対策）
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物パスが `outputs/phase-4/` と一致している
- [ ] `artifacts.json` と `outputs/artifacts.json` の更新方針が確認されている
- [ ] 前Phaseの gate 条件（Phase 3 PASS/MINOR）を満たした前提で実行手順が書かれている

## 次のPhase

- [Phase 5（実装）](./phase-5-implementation.md)
