# Phase 7: テストカバレッジ確認

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 7                                         |
| 機能名     | TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001 |
| タスク名   | auth-mode 契約整合のカバレッジ監査        |
| 作成日     | 2026-03-06                                |
| ステータス | completed                                 |

## 目的

変更対象の code path と channel path を coverage と contract matrix の両面で確認し、未検証箇所を Phase 8 へ渡す。

## 背景

Line coverage だけでは event payload や error envelope のドリフトを見落とす。channel 単位の contract coverage も同時に見る必要がある。

## SubAgentチーム編成

| SubAgent                | 担当関心               | 実行形態 | Phase 7 の責務                                 |
| ----------------------- | ---------------------- | -------- | ---------------------------------------------- |
| SubAgent-Contract-Main  | Main coverage 監査     | 並列     | handler / adapter の branch を確認する         |
| SubAgent-Bridge-Preload | Preload coverage 監査  | 並列     | bridge の invoke / on 経路を確認する           |
| SubAgent-Renderer-State | Renderer coverage 監査 | 並列     | fetch / validate / listener の経路を確認する   |
| SubAgent-Spec-Sync      | gap 取りまとめ         | 直列統合 | gap log と contract coverage matrix を統合する |

## 実行タスク

- 数値監査: touched file の line / branch / function coverage を確認する。
- contract coverage 監査: channel × 正常系 / 異常系 / event のマトリクスを確認する。
- gap 記録: coverage 不足と contract 未検証箇所を `gap-log.md` に書く。

## 参照資料

### 実装・コード

| 資料名                   | パス                                                                               | 用途                                |
| ------------------------ | ---------------------------------------------------------------------------------- | ----------------------------------- |
| Phase 5 仕様             | `phase-5-implementation.md`                                                        | 変更対象ファイルを確認する          |
| Phase 6 仕様             | `phase-6-test-expansion.md`                                                        | 回帰対象を確認する                  |
| Phase 5 成果物           | `outputs/phase-5/`                                                                 | changed files plan を確認する       |
| Phase 6 成果物           | `outputs/phase-6/`                                                                 | 回帰結果を確認する                  |
| Main handler テスト      | `apps/desktop/src/main/ipc/__tests__/authModeHandlers.test.ts`                     | coverage 対象を確認する             |
| Renderer slice テスト    | `apps/desktop/src/renderer/store/slices/__tests__/authModeSlice.test.ts`           | coverage 対象を確認する             |
| Selector テスト          | `apps/desktop/src/renderer/store/slices/__tests__/authModeSlice.selectors.test.ts` | renderHook coverage を確認する      |
| SettingsView テスト      | `apps/desktop/src/renderer/views/SettingsView/SettingsView.test.tsx`               | mount / message coverage を確認する |
| 無限ループ防止テスト     | `apps/desktop/src/renderer/__tests__/infinite-loop-prevention.test.tsx`            | selector 安定性 coverage を確認する |
| 回帰テスト拡充           | `outputs/phase-6/regression-test-expansion.md`                                     | Phase 6 成果物                      |
| contract fixture         | `outputs/phase-6/contract-fixtures.md`                                             | Phase 6 成果物                      |
| event回帰チェックリスト  | `outputs/phase-6/event-regression-checklist.md`                                    | Phase 6 成果物                      |
| クロスレイヤーテスト結果 | `outputs/phase-6/cross-layer-test-result.md`                                       | Phase 6 成果物                      |

### システム仕様（aiworkflow-requirements）

| 資料名               | パス                                                                              | 用途                                             |
| -------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------ |
| 品質要件             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | 数値基準を確認する                               |
| IPC 契約チェック     | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`     | contract matrix の観点を確認する                 |
| 状態管理             | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | Renderer 側の分岐を確認する                      |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/patterns.md`                   | P31 防止パターンの coverage 観点を確認する       |
| 開発ガイドライン     | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`     | 個別 selector の coverage 対象を確認する         |
| コンポーネントテスト | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | renderHook / mock 設定の coverage 前提を確認する |

## 実行手順

1. Phase 5 の changed files と Phase 6 の regression result を読み、 coverage 対象を確定する。
2. SubAgent-Contract-Main、SubAgent-Bridge-Preload、SubAgent-Renderer-State が並列で coverage と contract matrix を集計する。
3. `coverage-targets.md` に数値基準と実測を記録する。
4. `contract-coverage-matrix.md` と `gap-log.md` に未検証 channel と不足 branch を記録する。

## 統合テスト連携

- `get`, `status`, `validate`, `changed` の 4 つが integration case を持つか確認する。
- invalid sender、invalid mode、credential missing の 3 異常系が integration case を持つか確認する。
- event consistency の case が `changed` と `status` の両方を検証しているか確認する。
- SettingsView mount / selector / no-loop の 3 経路が coverage と regression の両方で確認されているか確認する。
- gap がある場合は Phase 8 へ引き継ぐ。

## 多角的チェック観点

| 観点            | 確認内容                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------ |
| 数値基準        | line 90 以上、branch 85 以上、function 100 を狙えているか                                  |
| contract 網羅   | channel × 正常系 / 異常系 / event が埋まっているか                                         |
| touched files   | changed files plan に出たファイルを漏らしていないか                                        |
| Selector 安定性 | `store/index.ts`, SettingsView, infinite-loop prevention の 3 点を coverage 対象へ含めたか |
| gap 管理        | 不足箇所に owner と修正先 Phase を付けているか                                             |
| UI 影響         | Renderer listener と fetchStatus の両方を見ているか                                        |

## 成果物

| 成果物                 | パス                                          | 説明                            |
| ---------------------- | --------------------------------------------- | ------------------------------- |
| coverage 目標          | `outputs/phase-7/coverage-targets.md`         | 数値基準と実測値                |
| contract coverage 行列 | `outputs/phase-7/contract-coverage-matrix.md` | channel × case の網羅表         |
| gap 台帳               | `outputs/phase-7/gap-log.md`                  | 不足箇所と次 Phase への引き継ぎ |

## 完了条件

- [x] `coverage-targets.md` に line / branch / function の 3 指標がある
- [x] `contract-coverage-matrix.md` に `get`, `set`, `status`, `validate`, `changed` の 5 行がある
- [x] `gap-log.md` に不足箇所の owner と戻り先 Phase がある
- [x] touched file を漏らさず coverage 対象に含める
- [x] `SettingsView/index.tsx`, `store/index.ts`, `infinite-loop-prevention.test.tsx` の coverage 扱いを明記する
- [x] integration case の有無を channel 単位で記録する
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. coverage 数値確認
2. contract coverage 行列作成
3. gap 台帳作成
4. owner / 戻り先確認
5. 完了条件確認

## タスク100%実行確認【必須】

- [x] 数値基準と contract 網羅を分けて確認した
- [x] gap を台帳化した
- [x] touched file を全て列挙した
- [x] Phase 8 への引き継ぎを書いた

## 次のPhase

Phase 8: リファクタリング
