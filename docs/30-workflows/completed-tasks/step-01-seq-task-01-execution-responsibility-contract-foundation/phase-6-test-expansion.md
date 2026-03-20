# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                                                      |
| ---------- | --------------------------------------------------------- |
| Phase      | 6                                                         |
| Phase 名   | テスト拡充                                                |
| タスクID   | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 |
| 前提 Phase | Phase 5                                                   |
| 後続 Phase | Phase 7（カバレッジ確認）                                 |
| ステータス | completed                                                 |
| 作成日     | 2026-03-19                                                |
| 機能名     | execution-responsibility-contract-foundation              |

## 目的

Phase 4 で定義した happy path のテストケースに、禁止事項の回帰観点・境界ケース・性能安定性観点を追加する。Phase 7 に渡す coverage gap と residual risk を明文化する。

## 実行タスク

### タスク1: 回帰観点追加（禁止事項の regression test 設計）

Phase 5 で定義した 4 件の禁止事項に対し、それぞれ回帰テストを設計する。

**回帰テスト R-1: silent fallback 検出**

capability = none 時に `integrated_api` への暗黙遷移が発生しないことを確認する。

- 入力: subscription 未認証 + API Key null（capability = none を導出する条件）
- 検証: `RuntimePolicyResolver.resolve()` の返り値が `"none"` であること
- 失敗パターン: `"integrated_api"` または `"integratedRuntime"` が返された場合を回帰とする

**回帰テスト R-2: auto-send 検出**

capability = terminalSurface で terminal handoff が発生したとき、ユーザー操作なしで送信が実行されないことを確認する。

- 入力: "ターミナルで実行" CTA をプログラム的に発火（UI イベント非経由）
- 検証: 送信処理が呼ばれないこと（`TerminalHandoffBuilder.build` がユーザー操作イベント以外からは実行されないこと）
- 失敗パターン: IPC 送信ハンドラが自動実行された場合を回帰とする

**回帰テスト R-3: hidden injection 検出**

`TerminalHandoffBuilder.build` の出力に、UI 上に表示されていないコンテキストが含まれないことを確認する。

- 入力: ユーザー入力テキスト "テスト送信" のみを持つ handoff bundle を生成する
- 検証: bundle の prompt フィールドがユーザー入力テキストのみを含むこと
- 失敗パターン: システムプロンプト・hidden context・metadata が bundle に混入した場合を回帰とする

### タスク2: 境界ケース一覧（edge-case-matrix）

以下の境界ケースを outputs/phase-6/edge-case-matrix.md に定義する。

| ケースID | 入力条件                                       | 期待動作                                                                 | 関連 Concern |
| -------- | ---------------------------------------------- | ------------------------------------------------------------------------ | ------------ |
| E-1      | API Key が空文字列（`""`）                     | capability = none / state = blocked                                      | Concern A    |
| E-2      | API Key がスペースのみ（`"   "`）              | capability = none / state = blocked（P42 対策: trim 後に空文字列と判定） | Concern A    |
| E-3      | API Key が不正形式（UUID でない文字列）        | 判定ロジック次第。Phase 2 設計書に従う                                   | Concern A    |
| E-4      | AuthMode 変更中（遷移中状態）                  | loading indicator 表示 / CTA 無効化（クリック不可）                      | Concern C    |
| E-5      | IPC timeout（Main が応答しない）               | state = unavailable を表示 / silent fallback しない                      | Concern B    |
| E-6      | IPC timeout 後に応答が届いた場合               | 遅延レスポンスを反映 / 二重更新を防ぐ                                    | Concern B    |
| E-7      | capability = both の状態で API Key を削除      | both → integratedRuntime に capability が劣化                            | Concern A/C  |
| E-8      | capability = both の状態で subscription を失う | both → terminalSurface に capability が劣化                              | Concern A/C  |

### タスク3: 性能・安定性観点（P31/P48/P5 対策）

以下の観点を outputs/phase-6/regression-expansion-plan.md に追加する。

**P31/P48 対策: capability 再計算による不要な再レンダー防止**

`AuthModeStatus` DTO が同値で更新されたとき（例: capability = integratedRuntime → integratedRuntime）、Renderer コンポーネントが再レンダーしないことを確認する。

- 検証方法: `renderCount` をカウントするテストラッパーを使用し、同値更新前後で count が増加しないことを確認する
- 対策パターン: `.filter()` / `.map()` を返す派生セレクタには `useShallow` を適用（P48 対策）

**P5 対策: IPC リスナー二重登録防止**

React StrictMode の 2 回実行でも IPC リスナーが 1 つだけ登録されることを確認する。

- 検証方法: リスナー登録関数を 2 回連続で呼び出し、登録カウントが 1 のままであることを確認する
- 対策パターン: モジュールレベルの登録済みフラグでガードする

## 参照資料

| 参照資料               | パス                                                                                        | 確認する内容                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| 親パック index         | docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md                  | 依存順・並列可否・設計ゲート                                    |
| Task index             | docs/30-workflows/step-01-seq-task-01-execution-responsibility-contract-foundation/index.md | 対象 task のメタ情報と受入基準                                  |
| Phase 4                | phase-4-test-creation.md                                                                    | happy path テストケース（CA-1〜CC-5）と統合シナリオ（S-1〜S-3） |
| Phase 5                | phase-5-implementation.md                                                                   | 禁止事項 4 件（violation example 付き）と ownership 表          |
| 旧パック UI/UX 正本    | docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-realization.md      | 状態語彙・CTA 契約の canonical 定義                             |
| 旧パック監査マトリクス | docs/30-workflows/ai-runtime-execution-responsibility-realignment/design-audit-matrix.md    | 矛盾・依存・漏れの監査軸（境界ケース補完に使用）                |
| known pitfalls P31/P48 | .claude/rules/06-known-pitfalls.md                                                          | useShallow 適用基準と無限ループ対策                             |
| known pitfalls P5      | .claude/rules/06-known-pitfalls.md                                                          | IPC リスナー二重登録対策                                        |
| known pitfalls P42     | .claude/rules/06-known-pitfalls.md                                                          | API Key 空文字列バリデーション（trim 対策）                     |

## 実行手順

### ステップ1: Phase 4/5 の成果物を確認し、回帰観点の起点を確定する

outputs/phase-4/test-matrix.md と outputs/phase-5/implementation-plan.md の禁止事項 4 件を確認する。Phase 4 で「happy path 専用」と分類したケースを本 Phase で regression に拡張する。

### ステップ2: 回帰テスト R-1〜R-3 を outputs/phase-6/regression-expansion-plan.md に記録する

各回帰テストに「入力条件・検証内容・失敗パターン」を明記する。失敗パターンは実際のコードパスを参照して記述する。

### ステップ3: 境界ケース E-1〜E-8 を outputs/phase-6/edge-case-matrix.md に記録する

P42（スペースのみバリデーション）・E-4（遷移中状態）・E-5〜E-6（IPC timeout）を優先的に定義する。Phase 7 の coverage gate で未到達と判定されるケースを明示する。

### ステップ4: 性能・安定性観点を outputs/phase-6/regression-expansion-plan.md の末尾に追記する

P31/P48/P5 の対策パターンを引用しながら、本タスク固有の検証方法を記述する。

## 統合テスト連携

Phase 6 で追加した回帰テストは以下の担当 Phase で実行する：

| テストカテゴリ                     | 担当 Phase                                          | 備考                              |
| ---------------------------------- | --------------------------------------------------- | --------------------------------- |
| 回帰テスト R-1〜R-3                | Phase 9（品質検証）で全 PASS を確認                 | Phase 7 の coverage gate に含める |
| 境界ケース E-1〜E-8                | Phase 7 で coverage 未達として記録 → Phase 9 で実装 |                                   |
| 性能テスト（再レンダー・二重登録） | Phase 9（品質検証）で確認                           | P31/P48/P5 の再発防止             |

## 多角的チェック観点（AIが判断）

| 観点                   | 適用判断                                     | 仕様参照先                                                            |
| ---------------------- | -------------------------------------------- | --------------------------------------------------------------------- |
| UI/UX                  | E-4（遷移中状態）・CTA 無効化が関係する      | `aiworkflow-requirements: ui-ux-*`                                    |
| アーキテクチャ         | P31/P48（再レンダー）・P5（二重登録）対策    | `aiworkflow-requirements: arch-*`                                     |
| IPC/Preload            | E-5/E-6（IPC timeout）・R-2（auto-send）対策 | `aiworkflow-requirements: api-ipc-*`, `security-electron-ipc-core.md` |
| ワークフローガバナンス | ledger / backlog / lessons を触る場合        | `aiworkflow-requirements: task-workflow*`, `lessons-learned*`         |

**この task 固有の重点**: 語彙 drift / state drift / simpler alternative の 3 方向で設計を叩く

## サブタスク管理

Phase 実行開始時に、TodoWrite 相当で以下のサブタスクを作成すること:

1. Phase 4/5 成果物の確認（happy path テスト・禁止事項 4 件）
2. 回帰テスト R-1〜R-3 の設計
3. 境界ケース E-1〜E-8 の定義
4. 性能・安定性観点の追加（P31/P48/P5 対策）
5. Phase 7 への handoff 内容の整理（未到達ケースの明示）
6. 成果物パスと outputs/phase-6/ の整合確認
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## 成果物

| 成果物         | パス                                         | 内容                                                    |
| -------------- | -------------------------------------------- | ------------------------------------------------------- |
| 回帰拡張計画   | outputs/phase-6/regression-expansion-plan.md | 禁止事項の回帰テスト設計（R-1〜R-3）+ 性能・安定性観点  |
| 境界ケース一覧 | outputs/phase-6/edge-case-matrix.md          | 境界ケース E-1〜E-8（入力条件・期待動作・関連 Concern） |

## 完了条件

- [ ] 禁止事項 4 件（silent fallback / auto-send / hidden injection / no-op CTA）の回帰テストが定義されている
- [ ] 境界ケースが 8 件以上定義されている（E-1〜E-8）
- [ ] P42（スペースのみ API Key）が E-2 として境界ケースに含まれている
- [ ] P31/P48（再レンダー）・P5（二重登録）の性能・安定性観点が追加されている
- [ ] Phase 7 coverage gate に含めるべき未到達ケースが明示されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物パスが `outputs/phase-6/` と一致している
- [ ] `artifacts.json` と `outputs/artifacts.json` の更新方針が確認されている
- [ ] 前Phaseの gate 条件（Phase 5 完了条件チェックリスト全通過）を満たした前提で実行手順が書かれている

## 次のPhase

- [Phase 7（カバレッジ確認）](./phase-7-coverage-check.md)
