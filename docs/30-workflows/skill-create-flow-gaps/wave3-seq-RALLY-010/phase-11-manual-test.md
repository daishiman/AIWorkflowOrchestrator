# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 11                       |
| タスクID   | TASK-RALLY-010           |
| 機能名     | ラリー完了状態UI表示追加 |
| 前提Phase  | Phase 10                 |
| 後続Phase  | Phase 12                 |
| 作成日     | 2026-04-21               |
| ステータス | pending                  |

## 目的

UIの変更を実際のElectronアプリ上で目視確認し、完了UI・待機UI・入力UIの表示切り替えが正しく動作することをスクリーンショットで証跡として記録する。

**RALLY-010〜013 はUIタスクのため、このPhase 11は特に重要。**
自動テストでは確認できない視覚的な整合性（色・レイアウト・テキスト）を目視で確認する。

## SubAgentチーム編成

| SubAgent   | 関心ごと                   | 主担当                   | 実行形態 |
| ---------- | -------------------------- | ------------------------ | -------- |
| SubAgent-A | 完了状態シナリオ検証       | ラリー完了時のUI目視確認 | **並列** |
| SubAgent-B | 待機・入力状態シナリオ検証 | 待機UI・入力UIの目視確認 | **並列** |

## 手動テストシナリオ

### TC-11-UI-01: ラリー完了状態の表示確認（目視必須）

| 項目         | 内容                                                                            |
| ------------ | ------------------------------------------------------------------------------- |
| 前提条件     | ラリーがすべての質問を完了し、workflowSnapshot.phase が完了フェーズになっている |
| 操作手順     | ConversationalInterview 画面を開く                                              |
| 期待結果     | 「ラリーが完了しました」テキストが緑色で表示される                              |
| 確認ポイント | 「次のステップへ進んでください」サブテキストが表示される                        |
| 証跡         | `outputs/phase-11/screenshots/TC-11-UI-01-rally-completed.png`                  |

### TC-11-UI-02: 待機状態の表示確認（目視必須）

| 項目         | 内容                                                         |
| ------------ | ------------------------------------------------------------ |
| 前提条件     | ラリー進行中で awaitingUserInput が null（次の質問を準備中） |
| 操作手順     | ConversationalInterview 画面を開く                           |
| 期待結果     | 「次の質問を準備しています...」テキストが表示される          |
| 確認ポイント | 旧メッセージ「質問を待っています...」が表示されていないこと  |
| 証跡         | `outputs/phase-11/screenshots/TC-11-UI-02-rally-waiting.png` |

### TC-11-UI-03: 入力状態と完了状態の切り替え確認（目視必須）

| 項目         | 内容                                                       |
| ------------ | ---------------------------------------------------------- |
| 前提条件     | pendingRequest が存在する（入力待ち状態）                  |
| 操作手順     | ConversationalInterview 画面を開く                         |
| 期待結果     | 入力エリアが表示され、完了UIが表示されていないこと         |
| 確認ポイント | 完了UIと入力UIが同時に表示されていないこと                 |
| 証跡         | `outputs/phase-11/screenshots/TC-11-UI-03-rally-input.png` |

### TC-11-UI-04: 完了UIのスタイル確認（目視必須）

| 項目         | 内容                                                                 |
| ------------ | -------------------------------------------------------------------- |
| 前提条件     | ラリー完了状態                                                       |
| 操作手順     | 完了UI部分をスクリーンショット撮影                                   |
| 期待結果     | 完了テキストが `var(--status-success)` 色（緑系）で表示されている    |
| 確認ポイント | ライトテーマ・ダークテーマ両方で視認性が確保されていること           |
| 証跡         | `outputs/phase-11/screenshots/TC-11-UI-04-rally-completed-style.png` |

## 画面カバレッジマトリクス

| テストケース | 対象状態       | 証跡パス                                                             | 判定基準                     |
| ------------ | -------------- | -------------------------------------------------------------------- | ---------------------------- |
| TC-11-UI-01  | ラリー完了状態 | `outputs/phase-11/screenshots/TC-11-UI-01-rally-completed.png`       | 完了UI表示・旧メッセージなし |
| TC-11-UI-02  | 待機状態       | `outputs/phase-11/screenshots/TC-11-UI-02-rally-waiting.png`         | 新待機メッセージ表示         |
| TC-11-UI-03  | 入力状態       | `outputs/phase-11/screenshots/TC-11-UI-03-rally-input.png`           | 入力エリア表示・完了UIなし   |
| TC-11-UI-04  | 完了UIスタイル | `outputs/phase-11/screenshots/TC-11-UI-04-rally-completed-style.png` | 正しい色・レイアウト         |

## スクリーンショット取得手順

```bash
# Electronアプリを開発モードで起動
pnpm --filter @repo/desktop dev

# ラリー完了状態をシミュレートするには
# DevTools > Application > Local Storage で workflowSnapshot を手動設定するか
# モックデータを使用してUIを確認する
```

## 参照資料

| 資料名           | パス                                              | 説明            |
| ---------------- | ------------------------------------------------- | --------------- |
| 受け入れ基準     | `outputs/phase-1/acceptance-criteria.md`          | Phase 1 成果物  |
| UI設計書         | `outputs/phase-2/ui-design.md`                    | Phase 2 成果物  |
| 出荷準備チェック | `outputs/phase-10/release-readiness-checklist.md` | Phase 10 成果物 |

## 成果物

| 成果物                 | パス                                     | 説明                   |
| ---------------------- | ---------------------------------------- | ---------------------- |
| 手動テスト結果         | `outputs/phase-11/manual-test-result.md` | 全TCのPASS/FAIL記録    |
| 証跡インデックス       | `outputs/phase-11/evidence-index.md`     | スクリーンショット一覧 |
| スクリーンショット計画 | `outputs/phase-11/screenshot-plan.md`    | 撮影計画と手順         |
| スクリーンショット実体 | `outputs/phase-11/screenshots/*.png`     | TC単位の画面証跡       |

## 完了条件

- [ ] TC-11-UI-01〜04 が全件 PASS であること
- [ ] スクリーンショットが全TC分取得されていること
- [ ] 完了UIが正しい色・テキストで表示されることが目視確認されていること
- [ ] 待機メッセージが新メッセージに変更されていることが目視確認されていること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/skill-create-flow-gaps/p10-seq-RALLY-010
```

## 次のPhase

Phase 12: ドキュメント更新
