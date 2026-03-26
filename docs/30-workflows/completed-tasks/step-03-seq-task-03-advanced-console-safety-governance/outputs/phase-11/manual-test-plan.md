# Phase 11 手動テスト計画

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| タスクID   | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| Phase      | 11                                              |
| 作成日     | 2026-03-24                                      |
| 依存Phase  | Phase 1-3（設計結論）                           |
| タスク種別 | 設計タスク（プロダクションコードなし）          |

## 制約事項

本タスクは設計タスクであり、プロダクションコードの実装を含まない。そのため、手動テストは以下の方針で実施する。

- **実画面操作テスト**: 実施不可（実装が存在しないため）
- **スクリーンショット**: CLI環境では実画面キャプチャ不可（P53準拠）。screenshot-plan.json に代表画面のJSON定義を記録する
- **検証方式**: 設計書の walkthrough（設計書を読みながら、各シナリオが設計で網羅されているかを確認する机上検証）

## Walkthrough シナリオ

### シナリオ 1: Approval Sheet - 外部API呼び出し（APR-T1）

| ステップ | 操作/確認内容                                                           | 期待結果                                                                               | 設計根拠      |
| -------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------- |
| 1-1      | Session State が `ready` になっている                                   | ExecutionConsoleView が表示され、Primary CTA「実行する」が見える                       | 設計サマリー  |
| 1-2      | 「実行する」CTA を押下する                                              | Approval Check が発火し、APR-T1 に該当するため Approval Sheet が表示される             | 契約 1.2 Flow |
| 1-3      | Approval Sheet の表示内容を確認する                                     | 操作タイトル「外部送信の確認」、操作説明、送信先情報、データ概要、停止方法が表示される | 契約 1.3      |
| 1-4      | Approval Sheet 内の disclosure（送信先・送信内容）が dismiss 不可である | DSC-R4 により Approval Sheet 内の disclosure は閉じられない                            | DSC-R4        |
| 1-5      | 「承認」ボタンを押下する                                                | Main Process に approval token が送信され、LLM API 呼び出しが実行される                | 契約 1.4      |
| 1-6      | 「拒否」ボタンを押下した場合                                            | ready state に戻り、操作は実行されない                                                 | 契約 1.2 Flow |

### シナリオ 2: Approval Sheet - ファイル書き込み（APR-T2）

| ステップ | 操作/確認内容                        | 期待結果                                                         | 設計根拠 |
| -------- | ------------------------------------ | ---------------------------------------------------------------- | -------- |
| 2-1      | ファイル書き込み操作をトリガーする   | APR-T2 に該当し、Approval Sheet が表示される                     | 契約 1.1 |
| 2-2      | 操作タイトルが「操作の確認」である   | dangerous_operation 種別として表示される                         | 契約 1.3 |
| 2-3      | 操作説明に書き込み対象パスが含まれる | パスは sanitizeErrorMessage() でサニタイズされた形式で表示される | MUST-9   |
| 2-4      | 承認なしで書き込みが実行されない     | Main Process の ApprovalGate が `approved: false` で実行拒否する | 契約 1.4 |

### シナリオ 3: Approval Sheet - 外部プロセス起動/Terminal Handoff（APR-T3）

| ステップ | 操作/確認内容                                            | 期待結果                                            | 設計根拠     |
| -------- | -------------------------------------------------------- | --------------------------------------------------- | ------------ |
| 3-1      | Session State が `handoff` に遷移する                    | Primary CTA が「キャンセル」に変わる                | 設計サマリー |
| 3-2      | 「端末で続ける」CTA を押下する                           | APR-T3 に該当し、Approval Sheet が表示される        | 契約 1.1     |
| 3-3      | Approval Sheet に handoff 理由と terminal 操作内容がある | Disclosure 2.1 の Terminal handoff 前開示が含まれる | 契約 2.1     |
| 3-4      | copy command に API key が含まれない                     | DENY-6（secret 非中継）に準拠                       | DENY-6       |

### シナリオ 4: Approval Sheet - システム設定変更（APR-T4）

| ステップ | 操作/確認内容                             | 期待結果                                        | 設計根拠 |
| -------- | ----------------------------------------- | ----------------------------------------------- | -------- |
| 4-1      | システム設定変更操作をトリガーする        | APR-T4 に該当し、Approval Sheet が表示される    | 契約 1.1 |
| 4-2      | 影響範囲の説明が操作説明に含まれる        | ユーザーが判断可能な粒度で表示される            | 契約 1.3 |
| 4-3      | 承認後、操作が完了すると token が失効する | 単一操作ごとの有効期限（R-M1: Phase 5で詳細化） | 契約 1.4 |

### シナリオ 5: Approval 不要操作

| ステップ | 操作/確認内容                        | 期待結果                      | 設計根拠 |
| -------- | ------------------------------------ | ----------------------------- | -------- |
| 5-1      | ローカルファイル読み込みを実行する   | Approval Sheet が表示されない | 契約 1.5 |
| 5-2      | Session Dock を開閉する              | Approval Sheet が表示されない | 契約 1.5 |
| 5-3      | Advanced Console toggle を切り替える | Approval Sheet が表示されない | 契約 1.5 |
| 5-4      | Disclosure banner を dismiss する    | Approval Sheet が表示されない | 契約 1.5 |

### シナリオ 6: Session Disclosure Banner

| ステップ | 操作/確認内容                                        | 期待結果                                                             | 設計根拠 |
| -------- | ---------------------------------------------------- | -------------------------------------------------------------------- | -------- |
| 6-1      | Session State が `collapsed` から `ready` に遷移する | SessionDisclosureBanner が自動表示される                             | DSC-R1   |
| 6-2      | バナーに AI モデル名が含まれる                       | `{modelName}` が表示される（例: "Claude 3.5 Sonnet"）                | FR-2b    |
| 6-3      | バナーに外部送信先の種別が含まれる                   | `{destinations}` リストが表示される（例: "LLM API"）                 | FR-3b    |
| 6-4      | バナーを dismiss する                                | バナーが非表示になるが、再表示アイコンが Session Dock ヘッダーに残る | DSC-R2   |
| 6-5      | 再表示アイコンをクリックする                         | 同じ内容のバナーが再表示される                                       | DSC-R3   |
| 6-6      | guidance-only state での開示を確認する               | 「AI 実行なし」の旨が開示される                                      | DSC-R5   |
| 6-7      | バナーに API key / token が含まれない                | Disclosure 2.4 Data Flow の分離が守られている                        | DENY-5   |

### シナリオ 7: No Auto-Send 検証

| ステップ | 操作/確認内容                                                    | 期待結果                                | 設計根拠 |
| -------- | ---------------------------------------------------------------- | --------------------------------------- | -------- |
| 7-1      | transcript 自動送信の IPC endpoint が存在しない                  | `ALLOWED_INVOKE_CHANNELS` に該当なし    | NAS-1    |
| 7-2      | session 結果自動報告の IPC endpoint が存在しない                 | `ALLOWED_INVOKE_CHANNELS` に該当なし    | NAS-2    |
| 7-3      | エラーログ自動送信の IPC endpoint が存在しない                   | `ALLOWED_INVOKE_CHANNELS` に該当なし    | NAS-3    |
| 7-4      | ユーザー操作なしの LLM API 呼び出しが Approval gate で阻止される | ApprovalGate が未承認操作を拒否する     | NAS-4    |
| 7-5      | Manual Share Rail 経由で transcript 共有が可能                   | 3操作（選択 -> 確認 -> 送信）で完結する | AS-1     |

### シナリオ 8: Advanced Console Opt-in

| ステップ | 操作/確認内容                                    | 期待結果                                               | 設計根拠     |
| -------- | ------------------------------------------------ | ------------------------------------------------------ | ------------ |
| 8-1      | Session State `ready` で初期表示を確認する       | Advanced Console Panel が非表示である                  | GATE-1       |
| 8-2      | 「高度な表示」CTA を確認する                     | Secondary 以下に配置されている（Primary と並列しない） | CTA-R2       |
| 8-3      | 「高度な表示」CTA のラベルを確認する             | 「terminal を開く」ではなく「高度な表示」である        | CTA-R4       |
| 8-4      | 「高度な表示」をクリックする                     | Advanced Console Panel が展開される                    | GATE-1       |
| 8-5      | パネルに Raw Terminal Output が表示される        | API key が含まれていない                               | DENY-6       |
| 8-6      | パネルに Copy Command が表示される               | API key が含まれていない                               | DENY-6       |
| 8-7      | パネル内に直接コマンド入力フィールドが存在しない | 禁止操作（4.3）に準拠                                  | Boundary 4.3 |
| 8-8      | Session State が `collapsed` に遷移する          | Advanced Console Panel が非表示になる                  | 非表示条件   |
| 8-9      | Session State が `running` で Panel を開く       | read-only モードである（R-M3: Phase 5で詳細化）        | Boundary 2.3 |

### シナリオ 9: CTA 階層検証

| ステップ | 操作/確認内容                                  | 期待結果                                         | 設計根拠     |
| -------- | ---------------------------------------------- | ------------------------------------------------ | ------------ |
| 9-1      | 各 State で Primary CTA が1個であることを確認  | CTA-R1 に準拠（常に1個）                         | CTA-R1       |
| 9-2      | ready state の Primary CTA を確認              | 「実行する」である                               | 設計サマリー |
| 9-3      | handoff state の Primary CTA を確認            | 「キャンセル」で、「端末で続ける」は secondary   | CTA-R3       |
| 9-4      | running state の Primary CTA を確認            | 「中止」である                                   | 設計サマリー |
| 9-5      | Primary CTA のラベルに「terminal」が含まれない | handoff state の「端末で続ける」は例外（MUST-7） | MUST-7       |

### シナリオ 10: Consumer Auth Guard

| ステップ | 操作/確認内容                                            | 期待結果                                          | 設計根拠 |
| -------- | -------------------------------------------------------- | ------------------------------------------------- | -------- |
| 10-1     | claude.ai session token をアプリに渡そうとする           | Main Process で token format 検証により拒否される | CAG-1    |
| 10-2     | claude.ai cookie の参照を試みる                          | Preload で cookie API が公開されていない          | CAG-2    |
| 10-3     | 許可される認証方式（API Key / Subscription Token）を確認 | RuntimePolicyResolver の3パターンに一致する       | 契約 4.2 |

### シナリオ 11: Layer 構造分離検証

| ステップ | 操作/確認内容                                         | 期待結果                                           | 設計根拠     |
| -------- | ----------------------------------------------------- | -------------------------------------------------- | ------------ |
| 11-1     | Layer 1（Primary Surface）の初期表示を確認            | Action Card, Runtime Banner, Session Dock のみ表示 | Boundary 1.1 |
| 11-2     | Layer 2（Safety Surface）の表示を確認                 | Approval Sheet, Disclosure Banner が条件付きで表示 | Boundary 1.1 |
| 11-3     | Layer 3（Detail Surface）が初期非表示であることを確認 | Advanced Console Panel は opt-in 前は非表示        | Boundary 1.1 |
| 11-4     | Layer 3 の操作が Layer 1 に波及しないことを確認       | Panel 内のコピー等が front surface を変更しない    | Boundary 6.1 |

## テスト結果の記録方法

本タスクは設計タスクであり、プロダクションコードが存在しないため、以下の方法でテスト結果を記録する。

### 記録方式

1. **机上検証**: 各シナリオの設計根拠カラムに基づき、対応する設計書のセクションが存在するかを確認する
2. **設計カバレッジ**: 全 FR / NFR / AC が少なくとも1つのシナリオでカバーされているかを検証する
3. **不足の検出**: 設計書に記載がない、またはあいまいな箇所を discovered-issues.md に記録する

### 検証チェックリスト

| 検証項目                                  | 結果     | 根拠                         |
| ----------------------------------------- | -------- | ---------------------------- |
| FR-1a〜FR-1e（Approval Sheet）            | 設計済み | シナリオ 1-5                 |
| FR-2a〜FR-2c（AI Disclosure）             | 設計済み | シナリオ 6                   |
| FR-3a〜FR-3c（External Send Disclosure）  | 設計済み | シナリオ 6                   |
| FR-4a〜FR-4d（Advanced Console）          | 設計済み | シナリオ 8                   |
| FR-5a〜FR-5d（Manual Boundary）           | 設計済み | シナリオ 7                   |
| NFR-1〜NFR-3（セキュリティ）              | 設計済み | シナリオ 1,3,6,8,10          |
| NFR-4（パフォーマンス: 200ms）            | 未検証   | 実装後に計測が必要           |
| NFR-5（アクセシビリティ: キーボード操作） | 未検証   | 実装後にキーボードテスト必要 |
| NFR-6（Session Dock state machine 統合）  | 設計済み | シナリオ 8,9                 |
| NFR-7（規約適合）                         | 設計済み | シナリオ 10                  |
| AC-1〜AC-4                                | 設計済み | シナリオ 1-11                |

## P53 対応

CLI環境でのスクリーンショット取得は不可能なため（P53準拠）、以下の代替策を採用する。

- **screenshot-plan.json**: 実装後に取得すべき代表画面をJSON定義として記録する
- **実画面検証**: 後続の実装タスク完了後に、Playwright `page.screenshot()` または Electron `webContents.capturePage()` で取得する
