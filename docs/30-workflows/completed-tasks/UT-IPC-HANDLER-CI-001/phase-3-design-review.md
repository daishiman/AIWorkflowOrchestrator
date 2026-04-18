# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase      | 3                                                 |
| 機能名     | UT-IPC-HANDLER-CI-001                             |
| タスク名   | ipcMain.handle() の重複・欠損を CI で自動検出する |
| 前提Phase  | Phase 2                                           |
| 後続Phase  | Phase 4                                           |
| 作成日     | 2026-04-18                                        |
| ステータス | pending                                           |

## 目的

Phase 2 の設計を品質観点でレビューし、Phase 4 進行の可否を判定する。

## 背景

スナップショットテストの設計が実現可能かつ既存テストと干渉しないことを確認する。設計レビューゲートを通過することで、テスト作成フェーズへの安全な移行を保証する。

## SubAgentチーム編成

| SubAgent   | 関心ごと             | 主担当                                |
| ---------- | -------------------- | ------------------------------------- |
| SubAgent-A | 設計整合監査         | mock capture パターンの実現可能性確認 |
| SubAgent-B | スナップショット監査 | inline vs file 選択根拠確認           |
| SubAgent-C | CI統合監査           | ワークフロー統合の整合性確認          |
| SubAgent-D | ゲート判定           | PASS/MAJOR改修/MINOR改修の判定        |

## 実行タスク

1. 設計書の矛盾・漏れ・整合性チェック
2. テスト設計の実現可能性確認
3. ゲート判定（PASS/MAJOR改修/MINOR改修）

## 参照資料

| 参照資料           | パス                                               | 説明           |
| ------------------ | -------------------------------------------------- | -------------- |
| 要件定義書         | `outputs/phase-1/requirements-definition.md`       | Phase 1 成果物 |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`           | Phase 1 成果物 |
| 登録チャンネル一覧 | `outputs/phase-1/channel-list.md`                  | Phase 1 成果物 |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`           | Phase 2 成果物 |
| テスト戦略         | `outputs/phase-2/test-strategy.md`                 | Phase 2 成果物 |
| CI統合設計         | `outputs/phase-2/ci-integration-design.md`         | Phase 2 成果物 |
| 依存整合マトリクス | `outputs/phase-2/dependency-consistency-matrix.md` | Phase 2 成果物 |

## 実行手順

1. Phase 1・Phase 2 の全成果物を入力として確認する。
2. SubAgent-A/B/C を並列実行し、各観点でレビューを行う。
3. SubAgent-D が統合判定（PASS/MAJOR改修/MINOR改修）を下す。
4. MAJOR 改修の場合は Phase 2 に戻り設計を修正する。
5. PASS または MINOR 改修の場合は成果物を出力して Phase 4 へ進む。

## 統合テスト連携

- Gate を通過した設計だけを Phase 4 のテスト仕様へ流し込み、未確定論点を残さない。
- Phase 10 の最終レビューでは、この Phase の判定と実装結果の差異を再点検する。

## ゲート判定基準

| 判定      | 条件                                                                 | 対応                  |
| --------- | -------------------------------------------------------------------- | --------------------- |
| PASS      | 矛盾なし・漏れなし・実現可能・干渉なし                               | Phase 4 へ進む        |
| MINOR改修 | 軽微な記述不足・用語統一漏れ（設計を変えない修正）                   | 修正後 Phase 4 へ進む |
| MAJOR改修 | mock capture パターンが実現不可・CI 統合に構造的矛盾・既存テスト干渉 | Phase 2 に戻り再設計  |

## 多角的チェック観点

| 観点       | 確認内容                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------- |
| 矛盾       | 設計書内の mock capture パターンと CI 統合設計に矛盾がないか確認する                              |
| 漏れ       | REG-SNAP-01 / REG-DEDUP-01 の受け入れ基準が設計に完全に反映されているか確認する                   |
| 整合性     | スナップショット戦略が Vitest のバージョン制約と整合しているか確認する                            |
| 依存関係   | Phase 2 成果物が Phase 4 テスト作成の入力として十分か確認する                                     |
| 実現可能性 | `vi.hoisted` + `vi.mock("electron")` + `mockImplementation` が Electron mock と整合するか確認する |

## 成果物

| 成果物           | パス                                         | 説明           |
| ---------------- | -------------------------------------------- | -------------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md`    | レビュー記録   |
| ゲート判定       | `outputs/phase-3/gate-decision.md`           | PASS/NO-GO判定 |
| 矛盾チェック表   | `outputs/phase-3/contradiction-checklist.md` | 矛盾検査結果   |

## 完了条件

- [ ] ゲート判定が PASS であること
- [ ] 矛盾チェック表で「矛盾なし」が確認されていること
- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. SubAgent-A/B/C の並列レビュー
3. SubAgent-D のゲート判定
4. 成果物出力
5. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-IPC-HANDLER-CI-001
```

## 次のPhase

Phase 4: テスト作成
