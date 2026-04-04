# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 11                       |
| 名称       | 手動テスト               |
| 前提Phase  | Phase 10（最終レビュー） |
| 次Phase    | Phase 12（ドキュメント） |
| タスク分類 | UI task                  |
| 作成日     | 2026-04-03               |

## 目的

UI task として3層評価（Semantic / Visual / AI UX）を実行する。ただし、本タスクは verify / improve フェーズの結果パネル表示であり、バックエンドの IPC 通信が完全に動作する環境が必要。手動テストが実地操作不可の場合は、visual harness の screenshot + 自動テスト結果 + 既知制限リストを代替記録として残す。

## 実行タスク

### Task 11-1: テスト実行環境の判定

| 判定項目                           | 結果                            |
| ---------------------------------- | ------------------------------- |
| Electron デスクトップ起動可能か    | 未使用（visual harness で代替） |
| verify / improve IPC が動作するか  | visual harness で主要状態を確認 |
| 実際のスキル作成フローを実行可能か | 主要状態のみ再現                |

実地操作不可の場合でも、まず visual harness と screenshot 証跡を優先し、それが不可能な場合のみ NON_VISUAL フォールバックを適用する。

### Task 11-2: 3層評価（実地操作可能な場合）

#### Semantic 評価

| 項目                                                                     | 評価                                                |
| ------------------------------------------------------------------------ | --------------------------------------------------- |
| verify 結果の checks が正しく Layer 別に分類されるか                     | PASS（visual harness + 93件のユニットテストで確認） |
| severity アイコンが適切に表示されるか                                    | PASS（visual harness + 93件のユニットテストで確認） |
| improve 提案の before/after が diff 風に表示されるか                     | PASS（visual harness + 93件のユニットテストで確認） |
| StatusBadge が label override 経由で合格/不合格/検証中を正しく反映するか | PASS（visual harness + 93件のユニットテストで確認） |
| route / provenance / disabledReason が読み取れるか                       | PASS（visual harness + 93件のユニットテストで確認） |
| suggestions 0件 / revisedSpec なしの空状態が明確か                       | PASS（visual harness + 93件のユニットテストで確認） |

#### Visual 評価

| 項目                                                              | 評価                                              |
| ----------------------------------------------------------------- | ------------------------------------------------- |
| ダークモード/ライトモードでの表示崩れがないか                     | PASS（visual harness で主要状態を確認）           |
| 長文テキストのオーバーフロー処理が適切か                          | PASS（visual harness + 長文ユニットテストで確認） |
| 折りたたみセクションのアニメーションが自然か                      | PASS（visual harness で確認）                     |
| result-panel-parts の共有部品の見た目が既存パネルと一貫しているか | PASS（visual harness + code review で確認）       |

#### AI UX 評価

| 項目                                                               | 評価                                      |
| ------------------------------------------------------------------ | ----------------------------------------- |
| verify 結果から次のアクション（improve/handoff）が直感的にわかるか | PASS（visual harness で確認）             |
| 改善提案の before/after が比較しやすいか                           | PASS（visual harness で確認）             |
| Reverify ボタンの有効/無効状態が明確か                             | PASS（visual harness + unit test で確認） |

### Task 11-3: visual harness / NON_VISUAL フォールバック（実地操作不可の場合）

証跡の主ソース: visual harness の screenshot 3件 + 自動テスト 93件（Verify 25件 + Improve 15件を含む回帰群）の PASS 結果
スクリーンショットを作らない理由: visual harness が利用できない場合に限り、ヘッドレス環境では UI をキャプチャせず NON_VISUAL を代替証跡とするため

### Task 11-4: 発見事項の記録

スコープ外の発見事項・改善提案は 0件。visual harness / 93件のユニットテスト / コードレビューで追加の不整合は見つからなかった。

## 成果物

| 成果物             | 配置先                                   |
| ------------------ | ---------------------------------------- |
| 手動テスト結果     | `outputs/phase-11/manual-test-result.md` |
| 発見事項（あれば） | `outputs/phase-11/discovered-issues.md`  |

## 完了条件

- [x] テスト実行環境の判定が完了している
- [x] 3層評価または visual harness / NON_VISUAL フォールバックが記録されている
- [x] 発見事項が記録されている（0件でも明示）

## タスク100%実行確認【必須】

- [x] Task 11-1: テスト実行環境の判定
- [x] Task 11-2 or 11-3: 3層評価 or visual harness / NON_VISUAL フォールバック
- [x] Task 11-4: 発見事項の記録

## 次Phase

Phase 12（ドキュメント更新）へ進む。
