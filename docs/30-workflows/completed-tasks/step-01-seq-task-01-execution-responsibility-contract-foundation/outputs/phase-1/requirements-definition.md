# Phase 1: 要件定義書

## メタ情報

| 項目     | 内容                                                      |
| -------- | --------------------------------------------------------- |
| タスクID | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 |
| Phase    | 1                                                         |
| 作成日   | 2026-03-20                                                |

## 機能要件（FR）

### FR-1: capability 4 状態定義と各状態の責務

| capability        | 定義                                                                                                  | UI 表示責務                                                                                                        |
| ----------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| integratedRuntime | sanctioned な in-app 実行 lane が利用可能な状態。API key が有効かつ integrated runtime に接続できる   | UI は即時実行 CTA（「AI 実行」等）を primary CTA として表示する                                                    |
| terminalSurface   | sanctioned な manual terminal lane のみ利用可能な状態。subscription のみ有効、または integrated 不可  | UI は handoff CTA（「ターミナルで実行」等）を primary CTA として表示する                                           |
| both              | in-app 実行 lane と manual terminal lane の両方が利用可能な状態。API key と subscription の両方が有効 | UI は優先 lane（integratedRuntime）を primary CTA、代替 lane（terminalSurface）を secondary CTA として同時表示する |
| none              | sanctioned な実行 lane が存在しない状態。API key が未設定かつ subscription が無効                     | UI は unavailable または blocked を表示し、no-op ではない解決 action（設定画面遷移等）のみを提示する               |

### FR-2: UI 状態語彙（ready / blocked / unavailable）と表示契約

| UI state    | 定義                                                                            | 表示契約                                                                                                               |
| ----------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| ready       | 現在の surface で sanctioned な action を即座に実行できる状態                   | primary CTA を有効表示する。実行可能な理由を 1 行で示す                                                                |
| blocked     | lane 自体は存在するが前提条件が未充足の状態（API key 未入力、token 期限切れ等） | 理由テキスト（`blockedReason`）と解決 action（`blockedAction`）を**必ず同時に**表示する。no-op CTA を表示しない        |
| unavailable | sanctioned な lane が存在しない状態                                             | 理由テキストのみ表示する。回避策がない場合は解決 action なし。primary CTA は非表示（disabled ではなく DOM に含めない） |

### FR-3: CTA 契約（primary 1 個 + secondary 1 個）

| 規則   | 内容                                                                                                                               |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| 構成   | capability 状態ごとに primary CTA 1 個と secondary CTA 1 個の表示条件・ラベル・action wiring を 1:1 で定義する                     |
| 非表示 | primary CTA が存在しない state（unavailable）では primary CTA を非表示（DOM に含まない）にする。disabled は使わない                |
| no-op  | blocked / unavailable 状態で「クリックしても何もしないボタン」を表示しない。blocked 時は必ず guidance action を primary CTA とする |
| 上限   | 1 つの state で表示する CTA は primary 1 個 + secondary 1 個を上限とする                                                           |

### FR-4: 禁止事項（boundary 定義）

| 禁止項目                | 定義                                                                  | 禁止境界                                                                       |
| ----------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| silent fallback         | ユーザーに通知せず別の実行モードへ自動切り替えすることを禁止する      | RuntimePolicyResolver が `none` を返すべき条件で `integrated_api` 等を返さない |
| auto-send               | ユーザー確認なしでコマンドを terminal に送信することを禁止する        | TerminalHandoffBuilder.build() の出力を UI イベント非経由で送信しない          |
| hidden prompt injection | UI に表示されないプロンプトをバックグラウンドで追加することを禁止する | TerminalHandoffBuilder の出力は UI 上に表示された内容のみを含む                |

## 非機能要件（NFR）

### NFR-1: 語彙一貫性（既存コードとの用語整合）

P50 チェック（`current-state-inventory.md`）で特定した gap-capability / gap-state の差異が 0 件であること。
差異がある場合は Phase 2 の設計論点として記録する。

**現状の差異**: 11 件（gap-capability 4 件、gap-state 4 件、gap-prohibition 3 件）
**Phase 2 への委譲**: 全 11 件を Phase 2 設計論点として引き継ぐ。

### NFR-2: canonical doc set の追跡可能性

Task02 以降が参照すべき canonical doc set（ファイルパス一覧）を `scope-definition.md` に明示する。
canonical doc set の各ファイルに「何を参照するか」を 1 行で注記する。

## 受入基準（AC）マッピング

| AC   | 基準                                                                                   | 対応 FR/NFR | 検証方法                                                             |
| ---- | -------------------------------------------------------------------------------------- | ----------- | -------------------------------------------------------------------- |
| AC-1 | capability 4 状態の責務と表示契約が定義されている                                      | FR-1        | contract-matrix に 4 行 x state/CTA 列が全て記載されていること       |
| AC-2 | UI 状態語彙と CTA 契約が 1:1 で定義されている                                          | FR-2, FR-3  | contract-matrix の state x CTA セルが全て「primary + secondary」形式 |
| AC-3 | silent fallback / auto-send / hidden prompt injection を禁止する境界が文章化されている | FR-4        | 禁止事項が test / review / manual の各層で検証可能なこと             |
| AC-4 | Step 02 以降が参照すべき canonical doc set が明示されている                            | NFR-2       | canonical doc set 一覧が scope-definition.md に併記されていること    |

## Phase 2 への未確定論点（concern）

### Concern 1: capability `both` の判定条件と primary CTA の優先順

- 問い: subscription と api-key の両方が有効な場合に `both` とするか、それとも `integratedRuntime` を優先するか
- 解決しないと Phase 2 が完了できない理由: contract-matrix の `both` 行の CTA 定義が確定しない

### Concern 2: `blocked` と `none` の境界判定

- 問い: capability = none だが解決 action が存在する場合（例: API key を設定すれば integratedRuntime になる）は `blocked` か `unavailable` か
- 解決しないと Phase 2 が完了できない理由: `none` 行の UI state 列が `blocked` と `unavailable` のどちらになるかが確定しない

### Concern 3: デフォルトプロンプト注入の hidden injection 判定

- 問い: `buildForAgentExecution` が request.prompt 空時に注入するデフォルトプロンプトは hidden injection に該当するか
- 解決しないと Phase 2 が完了できない理由: FR-4 の禁止境界が TerminalHandoffBuilder のデフォルト動作を許容するか否かで validation-matrix の設計が変わる
