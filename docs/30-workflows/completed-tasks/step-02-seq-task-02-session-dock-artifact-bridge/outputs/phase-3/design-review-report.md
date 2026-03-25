# Design Review Report - Session Dock Artifact Bridge

## 1. State Review

### 1.1 State 漏れチェック

| 検証項目                                    | 結果 | 詳細                                                                                                                                      |
| ------------------------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------- | --- | --------------------------------- |
| 8 state が全て定義されているか              | PASS | `collapsed / ready / handoff / running / done / aborted / unavailable / guidance-only` の 8 state が session-state-contract.md で定義済み |
| aborted state の遷移条件があるか            | PASS | T6 (`CLI_SESSION_ABORT`) で `exitCode !== 0                                                                                               |     | userAbort` がガード条件として定義 |
| unavailable → ready の復帰パスがあるか      | PASS | T1 (`GUIDANCE_RECEIVED`) で CLI 利用可能時に ready に復帰                                                                                 |
| reopen 復帰の state があるか                | PASS | `openDock` アクションで collapsed → 前回 state に復帰する設計                                                                             |
| running から collapsed への直接遷移がないか | PASS | 遷移表で running → collapsed は禁止（実行中の強制折りたたみなし）                                                                         |
| guidance-only と ready の区別が明確か       | PASS | T9 で `!requiresExecution` のガード条件で区別                                                                                             |

### 1.2 State 遷移の一貫性

| 検証項目                                            | 結果  | 詳細                                                                                                                          |
| --------------------------------------------------- | ----- | ----------------------------------------------------------------------------------------------------------------------------- |
| 全 state から collapsed への遷移があるか            | MINOR | running state からは collapsed 遷移不可。ただし中止 → aborted → collapsed のパスがあるため妥当                                |
| 既存 state との統合マッピングに矛盾がないか         | PASS  | design-summary.md のマッピング表で executionState.status / skillExecutionStatus / handoffGuidance との対応が明示              |
| computed selector の設計が P31/P48 に準拠しているか | MINOR | useDockState セレクタがオブジェクト/配列を返さないため P48 非該当だが、P31 対策として個別セレクタパターンを推奨する注記が必要 |

## 2. Persistence Review

### 2.1 Session 消失リスク

| 検証項目                                     | 結果  | 詳細                                                                                                  |
| -------------------------------------------- | ----- | ----------------------------------------------------------------------------------------------------- |
| dock close 時に session データが保持されるか | PASS  | closeDock アクションは collapsed に遷移するのみで session データは保持                                |
| 保持件数 (10件) は妥当か                     | PASS  | メモリ効率と実用性のバランスが取れている                                                              |
| 保持期間 (24時間) は妥当か                   | PASS  | 1日の作業サイクルをカバー                                                                             |
| restore 失敗時のフォールバックがあるか       | PASS  | ready state へのフォールバック + エラー通知が定義                                                     |
| session ID の衝突リスクがあるか              | MINOR | `session-{timestamp}-{random4}` の random 4文字は衝突リスクが低いが、UUID v4 への変更を検討してもよい |

### 2.2 Cleanup 条件

| 検証項目                                   | 結果 | 詳細                                                                     |
| ------------------------------------------ | ---- | ------------------------------------------------------------------------ |
| FIFO ポリシーが明確か                      | PASS | 保持件数超過時は最古のセッションから削除                                 |
| 明示削除が可能か                           | PASS | clearSession アクションで削除可能                                        |
| running 中の session が cleanup されないか | PASS | running state の session は cleanup 対象外（暗黙的にだが明記が望ましい） |

## 3. Share Review

### 3.1 Manual Boundary 準拠

| MB ルール                          | 結果  | 詳細                                                                                     |
| ---------------------------------- | ----- | ---------------------------------------------------------------------------------------- |
| MB-1 (auto-send 禁止)              | PASS  | 全 share 操作が user click トリガー。timer/event 自動送信パスなし                        |
| MB-2 (hidden injection 禁止)       | PASS  | share payload は可視テキストのみ。hidden metadata 注入パスなし                           |
| MB-3 (headless execution 禁止)     | PASS  | CLI 実行は dock UI 経由のみ                                                              |
| MB-4 (credential passthrough 禁止) | MINOR | サニタイズの具体的な実装方針が未定義。正規表現ベースの credential 検出ルールの定義が必要 |

### 3.2 Share 操作の一貫性

| 検証項目                           | 結果 | 詳細                                              |
| ---------------------------------- | ---- | ------------------------------------------------- |
| 手動 3 操作が定義されているか      | PASS | 選択範囲/直近出力/セッション の 3 操作が定義      |
| provenance chip が定義されているか | PASS | source / sharedAt / inspect の 3 フィールドが定義 |
| share 表示条件が適切か             | PASS | done/aborted でのみ表示。running 中は非表示       |

## 4. Artifact Priority Review

### 4.1 Artifact-First の維持

| 検証項目                                     | 結果 | 詳細                                                 |
| -------------------------------------------- | ---- | ---------------------------------------------------- |
| primary surface が Artifact Summary か       | PASS | 表示順序 [1] が Artifact Summary                     |
| raw log が primary に戻っていないか          | PASS | transcript は [3] として折りたたみ配置               |
| empty artifact の表示があるか                | PASS | 「成果物はありません」メッセージ + transcript リンク |
| error summary が done/aborted で表示されるか | PASS | done: warning 一覧、aborted: 中止理由 + error 詳細   |

## 5. MINOR 追跡テーブル

| MINOR ID | 指摘内容                                                             | 解決予定Phase | 解決確認Phase | 備考                                                                      |
| -------- | -------------------------------------------------------------------- | ------------- | ------------- | ------------------------------------------------------------------------- |
| MN-01    | running → collapsed 直接遷移不可の理由を設計書に明記すべき           | Phase 5       | Phase 10      | 中止 → aborted → collapsed のパスがあるため妥当だが、設計意図の明記が必要 |
| MN-02    | useDockState セレクタの P31 対策として個別セレクタパターン推奨の注記 | Phase 5       | Phase 10      | セレクタ設計時に注意                                                      |
| MN-03    | session ID 形式の UUID v4 への変更検討                               | Phase 5       | Phase 10      | 衝突リスクは低いが、標準形式への統一が望ましい                            |
| MN-04    | MB-4 credential サニタイズの具体的実装方針の追加                     | Phase 5       | Phase 10      | 正規表現パターン or deny-list の定義が必要                                |
| MN-05    | running 中の session は cleanup 対象外であることの明記               | Phase 5       | Phase 10      | 暗黙的だが明示すべき                                                      |

## 6. 総合評価

**全体判定: PASS (MINOR 5件)**

設計は AC-1〜AC-5 の全てを満たしており、state 漏れ・share 誤自動化・artifact 後退のいずれも検出されなかった。MINOR 5件は設計意図の明記・サニタイズ方針の詳細化であり、Phase 4 以降で対応可能。
