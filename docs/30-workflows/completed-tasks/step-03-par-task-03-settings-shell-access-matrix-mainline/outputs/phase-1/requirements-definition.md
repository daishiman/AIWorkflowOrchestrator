# Phase 1: 要件定義書

## タスクID: TASK-IMP-SETTINGS-SHELL-ACCESS-MATRIX-MAINLINE-001

## 1. 機能要件（FR）

### FR-1: Settings Access Matrix Section

Settings 画面に access matrix セクションを追加し、以下の情報を統合表示する:

- **FR-1.1**: CapabilityCard -- AccessCapability 4状態（integratedRuntime / terminalSurface / both / none）を視覚的に表示する
- **FR-1.2**: HealthStatusRow -- provider 接続状態（connected / disconnected / error / null）をインジケーターで表示する
- **FR-1.3**: ProviderSummaryCard -- 選択中の provider/model 情報を表示する。未選択時はガイダンスを表示する（P62: DEFAULT_CONFIG への暗黙 fallback 禁止）

### FR-2: AppLayout Persistent Launcher

AppLayout の persistent 領域に TerminalLauncher を配置し、全画面で terminal handoff の発見性を確保する:

- **FR-2.1**: TerminalLauncher ボタンを全画面で常時表示する
- **FR-2.2**: capability に応じて活性/非活性を制御する
- **FR-2.3**: 非活性時は disabledReason をツールチップで表示する

### FR-3: Public Shell Access Contract

未認証時の Settings 画面で guidance-only モードを提供する:

- **FR-3.1**: isAuthenticated=false 時に操作系 CTA を非表示にする
- **FR-3.2**: 設定案内メッセージのみ表示する
- **FR-3.3**: TerminalLauncher を isDisabled: true にし、認証要求メッセージを表示する
- **FR-3.4**: PUBLIC_UNAUTHENTICATED_VIEWS の既存契約（["settings"]）を変更しない

## 2. 非機能要件（NFR）

| NFR-ID | カテゴリ         | 要件                                                                |
| ------ | ---------------- | ------------------------------------------------------------------- |
| NFR-1  | パフォーマンス   | P31 準拠: 個別セレクタを使用し、不要な re-render を防止する         |
| NFR-2  | パフォーマンス   | P48 準拠: 派生セレクタには useShallow を適用する                    |
| NFR-3  | 安定性           | P5 準拠: リスナー二重登録を防止する（StrictMode 対策）              |
| NFR-4  | セキュリティ     | P62 準拠: DEFAULT_CONFIG への暗黙 fallback を禁止する               |
| NFR-5  | セキュリティ     | Settings bypass 契約を維持する（PUBLIC_UNAUTHENTICATED_VIEWS 不変） |
| NFR-6  | UX               | Apple HIG 準拠のカラーパレットとスペーシング                        |
| NFR-7  | アクセシビリティ | WCAG 2.1 AA 準拠: コントラスト比 4.5:1 以上、ARIA ラベル付与        |
| NFR-8  | レスポンシブ     | mobile / tablet / desktop の3ブレークポイント対応                   |

## 3. 受入基準（検証可能な条件）

| AC-ID | 基準                                                                                | 検証方法                                                                                        |
| ----- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| AC-1  | capability cards / health row / terminal launcher の情報階層が定義されている        | outputs/phase-2/design-summary.md に3 concern の情報階層図が存在する                            |
| AC-2  | settings bypass / reset exclusion / public shell 契約との整合が確認されている       | outputs/phase-3/design-review-report.md で PUBLIC_UNAUTHENTICATED_VIEWS 不変が PASS 判定        |
| AC-3  | selected config / API key guidance / provider list の矛盾を防ぐ状態マッピングがある | outputs/phase-2/contract-matrix.md に AccessCapability x UiState の全組合せマッピングが存在する |
| AC-4  | mainline UI で review harness を前提にしない IA が確立している                      | outputs/phase-2/design-summary.md で review harness 依存が 0 箇所であることが確認されている     |

## 4. ガバナンス要件

| GOV-ID | 要件                                             |
| ------ | ------------------------------------------------ |
| GOV-1  | Phase 4 は Phase 1-3 完了まで開始しない          |
| GOV-2  | commit / PR はユーザー指示があるまで実行禁止     |
| GOV-3  | MINOR 指摘は全て未タスク仕様書に変換（省略不可） |
| GOV-4  | Phase 12 チェックリスト全項目を逐次確認          |

## 5. Phase 2 への論点

| Concern | 論点                           | 設計トピック                                                                          |
| ------- | ------------------------------ | ------------------------------------------------------------------------------------- |
| C-1     | Settings Access Matrix Section | CapabilityCard / HealthStatusRow / ProviderSummaryCard の Props 設計と state 供給方式 |
| C-2     | AppLayout Persistent Launcher  | TerminalLauncher の配置位置（header / footer / sidebar）と capability 連携            |
| C-3     | Public Shell Access Contract   | guidance-only 表示の実装方式（条件分岐 vs 専用コンポーネント）                        |
