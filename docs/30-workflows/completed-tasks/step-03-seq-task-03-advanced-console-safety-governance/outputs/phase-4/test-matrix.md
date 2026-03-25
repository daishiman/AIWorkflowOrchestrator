# Phase 4 テストマトリクス

## メタ情報

| 項目      | 内容                                            |
| --------- | ----------------------------------------------- |
| タスクID  | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| Phase     | 4                                               |
| 作成日    | 2026-03-24                                      |
| 依存Phase | Phase 1-3                                       |

## テストケース凡例

| 区分     | 意味                                                          |
| -------- | ------------------------------------------------------------- |
| Layer    | テスト対象レイヤー（Renderer / Main / Preload / Integration） |
| Priority | P0（必須）/ P1（推奨）/ P2（補完）                            |
| Type     | Unit / Integration / Negative                                 |

---

## 1. Approval テストケース

### 1.1 Approval 正常系

| ID     | ケース名                                         | Layer       | Priority | Type        | 検証内容                                                                           | 対応 FR/AC  |
| ------ | ------------------------------------------------ | ----------- | -------- | ----------- | ---------------------------------------------------------------------------------- | ----------- |
| APR-01 | APR-T1 外部 API 呼び出し時に Approval Sheet 表示 | Renderer    | P0       | Unit        | LLM API 送信直前に ApprovalSheet が operationType="external_send" で render される | FR-1a, AC-1 |
| APR-02 | APR-T2 ファイル書き込み時に Approval Sheet 表示  | Renderer    | P0       | Unit        | ファイル書き込み操作直前に operationType="dangerous_operation" で render される    | FR-1a, AC-1 |
| APR-03 | APR-T3 外部プロセス起動時に Approval Sheet 表示  | Renderer    | P0       | Unit        | terminal handoff 直前に ApprovalSheet が表示される                                 | FR-1a, AC-1 |
| APR-04 | APR-T4 システム設定変更時に Approval Sheet 表示  | Renderer    | P0       | Unit        | 設定変更直前に ApprovalSheet が表示される                                          | FR-1a, AC-1 |
| APR-05 | Approval Sheet に送信先情報が表示される          | Renderer    | P0       | Unit        | operationType="external_send" 時に destination prop が表示される                   | FR-1b       |
| APR-06 | Approval Sheet に停止方法が明示される            | Renderer    | P0       | Unit        | 「中止ボタンで停止できます」のテキストが表示される                                 | FR-1d       |
| APR-07 | 承認ボタンで onApprove が発火する                | Renderer    | P0       | Unit        | 「承認」クリックで onApprove コールバックが呼ばれる                                | FR-1c       |
| APR-08 | 拒否ボタンで onReject が発火する                 | Renderer    | P0       | Unit        | 「拒否」クリックで onReject コールバックが呼ばれる                                 | FR-1c       |
| APR-09 | 詳細ボタンで onShowDetails が発火する            | Renderer    | P1       | Unit        | 「詳細を見る」クリックで onShowDetails コールバックが呼ばれる                      | FR-1c       |
| APR-10 | 承認後に Main Process で approval token が有効   | Integration | P0       | Integration | IPC 経由で承認送信後、ApprovalGate.checkApproval() が approved: true を返す        | FR-1e, AC-1 |

### 1.2 Approval 異常系

| ID     | ケース名                                          | Layer    | Priority | Type     | 検証内容                                                                   | 対応 FR/AC     |
| ------ | ------------------------------------------------- | -------- | -------- | -------- | -------------------------------------------------------------------------- | -------------- |
| APR-11 | 承認なしで実行が拒否される（Main enforcement）    | Main     | P0       | Negative | ApprovalGate.checkApproval() に承認なしで呼び出すと approved: false が返る | FR-1e, DENY-9  |
| APR-12 | 期限切れ token で実行が拒否される                 | Main     | P0       | Negative | TTL 経過後の token で checkApproval() が expired reason を返す             | FR-1e, R-M1    |
| APR-13 | 別セッションの token が拒否される                 | Main     | P1       | Negative | sessionId が異なる token で checkApproval() が not_requested を返す        | FR-1e          |
| APR-14 | 拒否後に ready state に戻る                       | Renderer | P0       | Negative | onReject 後にセッション state が ready に遷移する                          | Approval Flow  |
| APR-15 | Approval 不要操作で Approval Sheet が表示されない | Renderer | P1       | Negative | ローカルファイル読み込み時に ApprovalSheet が render されない              | Section 1.5    |
| APR-16 | running state で Approval Sheet が表示されない    | Renderer | P1       | Negative | state=running 時に新たな ApprovalSheet が表示されない                      | Design Summary |

### 1.3 Approval キーボードアクセシビリティ

| ID     | ケース名                              | Layer    | Priority | Type | 検証内容                                                  | 対応 NFR |
| ------ | ------------------------------------- | -------- | -------- | ---- | --------------------------------------------------------- | -------- |
| APR-17 | Approval Sheet がキーボードで操作可能 | Renderer | P0       | Unit | Tab / Enter / Escape でボタン間移動・承認・拒否が動作する | NFR-5    |
| APR-18 | 初期フォーカスが「拒否」ボタンにある  | Renderer | P1       | Unit | 安全側デフォルト: 初期 focus が拒否ボタンに当たる         | NFR-5    |

---

## 2. Disclosure テストケース

### 2.1 Disclosure 正常系

| ID     | ケース名                                          | Layer       | Priority | Type        | 検証内容                                                                     | 対応 FR/AC          |
| ------ | ------------------------------------------------- | ----------- | -------- | ----------- | ---------------------------------------------------------------------------- | ------------------- |
| DSC-01 | Session open 時に Disclosure Banner が表示される  | Renderer    | P0       | Unit        | collapsed → ready 遷移で SessionDisclosureBanner が render される            | FR-2a, DSC-R1, AC-2 |
| DSC-02 | Banner に AI モデル名が含まれる                   | Renderer    | P0       | Unit        | aiServiceName prop がバナーテキスト内に表示される                            | FR-2b               |
| DSC-03 | Banner に外部送信先種別が含まれる                 | Renderer    | P0       | Unit        | externalDestinations prop がバナーテキスト内に表示される                     | FR-3b               |
| DSC-04 | Dismiss 後にバナーが非表示になる                  | Renderer    | P0       | Unit        | onDismiss 呼び出し後にバナーが DOM から消える                                | DSC-R2              |
| DSC-05 | Dismiss 後に再表示アイコンが維持される            | Renderer    | P0       | Unit        | バナー非表示後も再表示導線（アイコン）が DOM に存在する                      | DSC-R2              |
| DSC-06 | 再表示で同一内容のバナーが表示される              | Renderer    | P1       | Unit        | 再表示アイコンクリック後に同じ aiServiceName / externalDestinations で再表示 | DSC-R3              |
| DSC-07 | Disclosure Data Flow で secret が渡されない       | Integration | P0       | Integration | Main → Renderer の IPC で API key / token が含まれない                       | NFR-1, NFR-2        |
| DSC-08 | guidance-only state で「AI 実行なし」が開示される | Renderer    | P1       | Unit        | state=guidance-only 時に guidance 固有の開示テキストが表示される             | DSC-R5              |

### 2.2 Disclosure 異常系

| ID     | ケース名                                        | Layer    | Priority | Type     | 検証内容                                                                | 対応規則       |
| ------ | ----------------------------------------------- | -------- | -------- | -------- | ----------------------------------------------------------------------- | -------------- |
| DSC-09 | Approval Sheet 内 disclosure が dismiss 不可    | Renderer | P0       | Negative | ApprovalSheet 内に表示される disclosure テキストに dismiss ボタンがない | DSC-R4         |
| DSC-10 | collapsed state で Disclosure Banner が非表示   | Renderer | P1       | Negative | state=collapsed 時に SessionDisclosureBanner が render されない         | Design Summary |
| DSC-11 | unavailable state で Disclosure Banner が非表示 | Renderer | P1       | Negative | state=unavailable 時に SessionDisclosureBanner が render されない       | Design Summary |

---

## 3. No Auto-Send テストケース

| ID     | ケース名                                                    | Layer       | Priority | Type        | 検証内容                                                                | 対応 FR/AC          |
| ------ | ----------------------------------------------------------- | ----------- | -------- | ----------- | ----------------------------------------------------------------------- | ------------------- |
| NAS-01 | transcript 自動送信 IPC チャネルが存在しない                | Main        | P0       | Negative    | `ALLOWED_INVOKE_CHANNELS` に transcript 自動送信用チャネルが含まれない  | NAS-1, FR-5a, AC-3  |
| NAS-02 | session 結果の自動報告 IPC チャネルが存在しない             | Main        | P0       | Negative    | session 結果を外部に自動報告する IPC handler が Main に登録されていない | NAS-2               |
| NAS-03 | エラーログ自動送信 IPC チャネルが存在しない                 | Main        | P0       | Negative    | エラーログを外部送信する IPC handler が存在しない                       | NAS-3               |
| NAS-04 | ユーザー操作なしの LLM API 呼び出しが Approval gate で阻止  | Main        | P0       | Negative    | approval token なしで LLM API 呼び出しを試みると拒否される              | NAS-4, DENY-9       |
| NAS-05 | Manual Share Rail が 3 操作（選択 → 確認 → 送信）で動作する | Integration | P1       | Integration | transcript 共有は選択・確認・送信の3ステップが全て必要                  | FR-5b, AS-1         |
| NAS-06 | hidden parsing エンドポイントが存在しない                   | Main        | P0       | Negative    | 非明示のデータ解析 IPC handler が Main に登録されていない               | FR-5c, DENY-3, AC-3 |

---

## 4. Advanced Console Gate テストケース

### 4.1 Gate 正常系

| ID     | ケース名                                    | Layer    | Priority | Type | 検証内容                                                                      | 対応 FR/AC          |
| ------ | ------------------------------------------- | -------- | -------- | ---- | ----------------------------------------------------------------------------- | ------------------- |
| ADV-01 | opt-in toggle でパネルが表示される          | Renderer | P0       | Unit | 「高度な表示」クリックで AdvancedConsolePanel が isOpen=true で render される | FR-4a, GATE-1, AC-4 |
| ADV-02 | 初期状態でパネルが非表示                    | Renderer | P0       | Unit | AdvancedConsolePanel の初期 isOpen が false                                   | FR-4b, AC-4         |
| ADV-03 | パネル内に raw terminal output が表示される | Renderer | P1       | Unit | terminalOutput prop の内容がパネル内に描画される                              | FR-4d               |
| ADV-04 | パネル内に copy command が表示される        | Renderer | P1       | Unit | copyCommand prop の内容がパネル内に描画される                                 | FR-4d               |
| ADV-05 | 「閉じる」でパネルが非表示になる            | Renderer | P0       | Unit | onToggle 呼び出し後にパネルが DOM から消える                                  | GATE-1              |

### 4.2 Gate 異常系（状態別非表示）

| ID     | ケース名                                  | Layer    | Priority | Type     | 検証内容                                                   | 対応規則          |
| ------ | ----------------------------------------- | -------- | -------- | -------- | ---------------------------------------------------------- | ----------------- |
| ADV-06 | collapsed state でパネルが表示不可        | Renderer | P0       | Negative | state=collapsed 時に toggle CTA が非表示                   | Section 2.2       |
| ADV-07 | unavailable state でパネルが表示不可      | Renderer | P0       | Negative | state=unavailable 時に toggle CTA が非表示                 | Section 2.2       |
| ADV-08 | guidance-only state でパネルが表示不可    | Renderer | P0       | Negative | state=guidance-only 時に toggle CTA が非表示               | Section 2.2       |
| ADV-09 | running state で read-only モード         | Renderer | P1       | Unit     | state=running 時に input 系操作が disabled（R-M3 対応）    | Section 2.3, R-M3 |
| ADV-10 | done state で read-only モード            | Renderer | P1       | Unit     | state=done 時に input 系操作が disabled                    | Section 2.3, R-M3 |
| ADV-11 | ViewType が executionConsole 以外で非表示 | Renderer | P1       | Negative | ViewType !== executionConsole 時にパネルが render されない | GATE-3            |

### 4.3 Advanced Console IPC

| ID     | ケース名                                                 | Layer    | Priority | Type        | 検証内容                                                                                            | 対応規則            |
| ------ | -------------------------------------------------------- | -------- | -------- | ----------- | --------------------------------------------------------------------------------------------------- | ------------------- |
| ADV-12 | execution:get-terminal-log が raw output を返す          | Main     | P1       | Unit        | IPC handler が terminal output 文字列配列を返す                                                     | Section 5.1         |
| ADV-13 | execution:get-copy-command が API key を含まない         | Main     | P0       | Negative    | copy command レスポンスに API key / token が含まれない                                              | DENY-6, Section 4.2 |
| ADV-14 | 新規 IPC channel が ALLOWED_INVOKE_CHANNELS に登録される | Preload  | P0       | Unit        | execution:get-terminal-log, execution:get-copy-command がホワイトリストに存在                       | Section 5.2         |
| ADV-15 | IPC 引数に P42 準拠 3 段バリデーションが適用される       | Main     | P0       | Unit        | typeof チェック → 空文字列チェック → trim 空チェックの3段                                           | P42, MUST-10        |
| ADV-16 | approval:request push 通知を Renderer が受信する         | Renderer | P0       | Integration | Main から push された approval:request イベントを Renderer が正しく受信し、ApprovalSheet を表示する | AC-1, FR-1d         |

---

## 5. CTA 階層テストケース

| ID     | ケース名                                              | Layer    | Priority | Type     | 検証内容                                                                | 対応規則       |
| ------ | ----------------------------------------------------- | -------- | -------- | -------- | ----------------------------------------------------------------------- | -------------- |
| CTA-01 | Primary CTA が常に 1 個                               | Renderer | P0       | Unit     | Session Dock ヘッダー内の primary CTA が同時に 2 個以上 render されない | CTA-R1, MUST-6 |
| CTA-02 | Primary CTA ラベルに "terminal" / "端末" が含まれない | Renderer | P0       | Negative | state !== handoff 時に primary CTA テキストに "terminal" "端末" がない  | CTA-R4, DENY-8 |
| CTA-03 | handoff state で「端末で続ける」が Primary に昇格     | Renderer | P0       | Unit     | state=handoff 時に primary CTA ラベルが「端末で続ける」                 | CTA-R3, MUST-7 |
| CTA-04 | 「高度な表示」が secondary 以下に配置される           | Renderer | P0       | Unit     | 「高度な表示」CTA が primary CTA と同レベルに配置されない               | CTA-R2, MUST-8 |
| CTA-05 | Advanced console 内 CTA がパネル内に閉じている        | Renderer | P1       | Unit     | パネル内のコピーボタン等が Panel 外の DOM に波及しない                  | CTA-R5         |

---

## 6. Consumer Auth Guard テストケース

| ID     | ケース名                                     | Layer   | Priority | Type     | 検証内容                                                                | 対応規則            |
| ------ | -------------------------------------------- | ------- | -------- | -------- | ----------------------------------------------------------------------- | ------------------- |
| CAG-01 | claude.ai session token が Main で拒否される | Main    | P0       | Negative | claude.ai 形式の token を渡すと認証エラーが返る                         | CAG-1, DENY-1, AC-3 |
| CAG-02 | cookie API が Preload で公開されていない     | Preload | P0       | Negative | contextBridge に cookie 取得 API が存在しない                           | CAG-2               |
| CAG-03 | consumer 認証フロー関連 IPC が存在しない     | Main    | P1       | Negative | claude.ai OAuth / session 認証に関連する IPC handler が登録されていない | CAG-3               |

---

## 7. NFR テストケース

| ID     | ケース名                                             | Layer       | Priority | Type        | 検証内容                                                                | 対応 NFR |
| ------ | ---------------------------------------------------- | ----------- | -------- | ----------- | ----------------------------------------------------------------------- | -------- |
| NFR-01 | エラーメッセージに内部パスが含まれない               | Main        | P0       | Negative    | sanitizeErrorMessage 適用後のエラーに OS パスが含まれない               | NFR-3    |
| NFR-02 | エラーメッセージにトークンが含まれない               | Main        | P0       | Negative    | sanitizeErrorMessage 適用後のエラーに API key / token が含まれない      | NFR-3    |
| NFR-03 | Disclosure banner が Session Dock state machine 準拠 | Integration | P1       | Integration | state 遷移に応じて banner の表示/非表示が Design Summary マトリクス通り | NFR-6    |

---

## テストケースサマリー

| カテゴリ             | P0     | P1     | P2    | 合計   |
| -------------------- | ------ | ------ | ----- | ------ |
| Approval             | 12     | 4      | 0     | 16     |
| Approval a11y        | 1      | 1      | 0     | 2      |
| Disclosure           | 5      | 3      | 0     | 8      |
| Disclosure 異常系    | 1      | 2      | 0     | 3      |
| No Auto-Send         | 4      | 1      | 1     | 6      |
| Advanced Console     | 7      | 5      | 0     | 12     |
| Advanced Console IPC | 2      | 2      | 0     | 4      |
| CTA 階層             | 4      | 1      | 0     | 5      |
| Consumer Auth Guard  | 2      | 1      | 0     | 3      |
| NFR                  | 2      | 1      | 0     | 3      |
| **合計**             | **40** | **21** | **1** | **62** |

## テストファイル配置計画

| テストファイル（予定パス）                                                                      | 対象ケース ID                  | 環境      |
| ----------------------------------------------------------------------------------------------- | ------------------------------ | --------- |
| `apps/desktop/src/renderer/components/execution/__tests__/ApprovalSheet.test.tsx`               | APR-01〜APR-09, APR-17〜APR-18 | happy-dom |
| `apps/desktop/src/renderer/components/execution/__tests__/SessionDisclosureBanner.test.tsx`     | DSC-01〜DSC-08                 | happy-dom |
| `apps/desktop/src/renderer/components/execution/__tests__/AdvancedConsolePanel.test.tsx`        | ADV-01〜ADV-11                 | happy-dom |
| `apps/desktop/src/main/ipc/__tests__/approvalGate.test.ts`                                      | APR-10〜APR-16                 | node      |
| `apps/desktop/src/main/ipc/__tests__/noAutoSend.test.ts`                                        | NAS-01〜NAS-06                 | node      |
| `apps/desktop/src/main/ipc/__tests__/advancedConsoleIpc.test.ts`                                | ADV-12〜ADV-15                 | node      |
| `apps/desktop/src/main/ipc/__tests__/consumerAuthGuard.test.ts`                                 | CAG-01〜CAG-03                 | node      |
| `apps/desktop/src/renderer/views/ExecutionConsoleView/__tests__/ctaHierarchy.test.tsx`          | CTA-01〜CTA-05                 | happy-dom |
| `apps/desktop/src/renderer/views/ExecutionConsoleView/__tests__/disclosureIntegration.test.tsx` | DSC-09〜DSC-11, NFR-03         | happy-dom |

## テスト環境の注意事項（Pitfall 準拠）

- **P39**: happy-dom 環境では `userEvent` を使用しない。`fireEvent` + `act()` を使用する
- **P40**: テスト実行は `cd apps/desktop && pnpm vitest run` で対象パッケージディレクトリから行う
- **P47**: CSS変数ベースのスタイルテストは variantStyles Record 定数を import して検証する
- **P48**: `useShallow` 未適用の派生セレクタによる無限ループに注意する
