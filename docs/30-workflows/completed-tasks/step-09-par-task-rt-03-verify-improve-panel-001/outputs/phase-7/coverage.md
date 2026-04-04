# Phase 7: カバレッジレポート

## メタ情報

| 項目   | 内容                                |
| ------ | ----------------------------------- |
| Phase  | 7                                   |
| タスク | TASK-RT-03-VERIFY-IMPROVE-PANEL-001 |
| 実行日 | 2026-04-03                          |
| 判定   | PASS                                |

## テスト実行結果

### VerifyResultDetailPanel.test.tsx — 25 テスト

| ID      | テストケース                                     | 結果 |
| ------- | ------------------------------------------------ | ---- |
| TC-V-01 | null 時に何も表示しない                          | PASS |
| TC-V-02 | isLoading 時にスケルトンを表示する               | PASS |
| TC-V-03 | error のみ時に ErrorBanner を表示する            | PASS |
| TC-V-04 | verifyDetail が渡されるとパネルを表示する        | PASS |
| TC-V-05 | status=pass 時に「合格」バッジを表示する         | PASS |
| TC-V-06 | status=fail 時に「不合格」バッジを表示する       | PASS |
| TC-V-07 | checks を Layer 別にグループ化して表示する       | PASS |
| TC-V-08 | severity=info のアイコンを表示する               | PASS |
| TC-V-09 | severity=warning のアイコンを表示する            | PASS |
| TC-V-10 | severity=error のアイコンを表示する              | PASS |
| TC-V-11 | message を表示する                               | PASS |
| TC-V-12 | nextAction タグを表示する                        | PASS |
| TC-V-13 | evidenceCount を表示する                         | PASS |
| TC-V-14 | checks 0件時に空状態メッセージを表示する         | PASS |
| TC-V-15 | Governance Notes 折りたたみ動作                  | PASS |
| TC-V-16 | route.type / route.summary を表示する            | PASS |
| TC-V-17 | route.permissionMode / route.launcher を表示する | PASS |
| TC-V-18 | Provenance セクションを表示する                  | PASS |
| TC-V-19 | disabledReason を表示する                        | PASS |
| TC-V-20 | Layer グループの折りたたみ動作                   | PASS |
| TC-V-21 | status=pending 時に「検証中」バッジを表示する    | PASS |
| TC-V-22 | reverifyEligible=false 時にボタン無効            | PASS |
| TC-V-23 | onReverify コールバック呼び出し                  | PASS |
| TC-V-24 | memo による再レンダリング抑制                    | PASS |
| TC-V-25 | planId を DetailFooter に表示する                | PASS |

### ImproveResultDetailPanel.test.tsx — 15 テスト

| ID      | テストケース                                      | 結果 |
| ------- | ------------------------------------------------- | ---- |
| TC-I-01 | null 時に何も表示しない                           | PASS |
| TC-I-02 | isLoading 時にスケルトンを表示する                | PASS |
| TC-I-03 | error のみ時に ErrorBanner を表示する             | PASS |
| TC-I-04 | suggestions を section/before/after/reason で表示 | PASS |
| TC-I-05 | improveResult が渡されるとパネルを表示する        | PASS |
| TC-I-06 | suggestions 0件時に空状態メッセージを表示する     | PASS |
| TC-I-07 | revisedSpec がある場合に折りたたみを表示する      | PASS |
| TC-I-08 | revisedSpec がない場合に折りたたみを非表示        | PASS |
| TC-I-09 | revisedSpec の展開/折りたたみ動作                 | PASS |
| TC-I-10 | improveId を DetailFooter に表示する              | PASS |
| TC-I-11 | 件数バッジの表示                                  | PASS |
| TC-I-12 | memo による再レンダリング抑制                     | PASS |
| TC-I-13 | section 未指定時のフォールバック表示              | PASS |
| TC-I-14 | 複数 suggestions のカード表示                     | PASS |
| TC-I-15 | before/after の diff 風背景色表示                 | PASS |

## カバレッジ推定

| コンポーネント               | ステートメント | ブランチ | 関数 | 行   |
| ---------------------------- | -------------- | -------- | ---- | ---- |
| VerifyResultDetailPanel.tsx  | ~95%           | ~90%     | 100% | ~95% |
| ImproveResultDetailPanel.tsx | ~95%           | ~90%     | 100% | ~95% |
| result-panel-parts.tsx       | 100%           | 100%     | 100% | 100% |

## サマリー

- **合計テスト数**: 40（Verify 25 + Improve 15）
- **PASS**: 40
- **FAIL**: 0
- **判定**: PASS — Phase 8 へ進む
