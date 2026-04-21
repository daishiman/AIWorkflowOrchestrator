# Phase 2: 設計

## メタ情報

| 項目       | 内容                                                                       |
| ---------- | -------------------------------------------------------------------------- |
| Phase      | 2                                                                          |
| タスクID   | TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001                                     |
| ステータス | 未実施                                                                     |
| 作成日     | 2026-04-19                                                                 |
| 入力       | outputs/phase-1/handler-inventory.md, outputs/phase-1/existing-test-map.md |

## 目的

Phase 1 で確定した `handler-inventory.md` を正本として、
registration unit 全件の優先度マトリクスと wave 構成を確定する。
後続 Phase は固定表ではなく `wave-plan.md` を唯一の参照元とする。
あわせて、既存パターン（`creatorHandlers.registrationSnapshot.test.ts`）を基準に、
命名・`handle/on/mixed` の扱い・CI計測方法を統一したテスト契約を定義する。

## 実行タスク

### Step 1: 優先度マトリクス設計

Phase 1 の `handler-inventory.md` を入力として、以下の3軸で各 handler 関数を評価する。

- 変更頻度: スキル・LLM・エージェント系は高、UI補助系は低
- セキュリティ重要度: 承認・セーフティゲート・APIキー系は高、テーマ・アバター系は低
- チャンネル数: 登録チャンネルが多い関数ほど、重複リスクが高く優先度を上げる

3軸をスコアリングし、波及範囲と CI コストのバランスを取った上で Wave 1〜3 への割り当てを決定する。

各 wave の規模目安:

- Wave 1: 6〜10 件（最重要・高頻度変更・既存パターンへ近いもの）
- Wave 2: 中優先の主力群
- Wave 3: 残余群。ただし `on only` / mixed / fallback registration の扱いを
  `wave-plan.md` に明記したうえで割り当てる

### Step 2: Wave 構成の確定

Wave 1 初期候補（最終確定は `wave-plan.md` とレビューフェーズで行う）:

| 関数名                         | 優先理由                           |
| ------------------------------ | ---------------------------------- |
| registerSkillHandlers          | スキル中核、チャンネル数最多クラス |
| registerLLMHandlers            | AI 機能中核、変更頻度高            |
| registerSkillCreatorHandlers   | 既存パターン隣接、一貫性確認       |
| registerSkillFileHandlers      | ファイル操作、セキュリティ重要     |
| registerSafetyGateHandlers     | セキュリティ中核                   |
| registerApprovalHandlers       | 承認フロー中核                     |
| registerAgentExecutionHandlers | エージェント実行中核               |

Wave 2 の代表例:

| 関数名                         | 優先理由                   |
| ------------------------------ | -------------------------- |
| registerFileHandlers           | 基本ファイル操作、汎用性高 |
| registerFsHandlers             | ファイルシステム操作       |
| registerStoreHandlers          | ストア管理                 |
| registerUserSettingsHandlers   | ユーザー設定、変更影響大   |
| registerAIHandlers             | AI 汎用機能                |
| registerDashboardHandlers      | ダッシュボード中核         |
| registerGraphHandlers          | グラフ表示                 |
| registerAuthHandlers           | 認証                       |
| registerApiKeyHandlers         | APIキー管理                |
| registerHistoryHandlers        | 履歴管理                   |
| registerHistorySearchHandlers  | 履歴検索                   |
| registerNotificationHandlers   | 通知                       |
| registerAgentSkillHandlers     | エージェントスキル         |
| registerCommunityHandlers      | コミュニティ               |
| registerSkillScheduleHandlers  | スキルスケジュール         |
| registerSkillAnalyticsHandlers | スキル分析                 |

Wave 3 の代表例:

| 関数名                          | 優先理由             |
| ------------------------------- | -------------------- |
| registerWindowHandlers          | ウィンドウ管理       |
| registerThemeHandlers           | テーマ設定           |
| registerProfileHandlers         | プロフィール         |
| registerAvatarHandlers          | アバター             |
| registerDialogHandlers          | ダイアログ           |
| registerTerminalHandlers        | ターミナル           |
| registerWorkspaceHandlers       | ワークスペース       |
| registerSearchHandlers          | 検索                 |
| registerFileSelectionHandlers   | ファイル選択         |
| registerSkillDocsHandlers       | スキルドキュメント   |
| registerSkillChainHandlers      | スキルチェーン       |
| registerSkillShareHandlers      | スキル共有           |
| registerSkillDebugHandlers      | スキルデバッグ       |
| registerClaudeCliHandlers       | Claude CLI           |
| registerDisclosureHandlers      | ディスクロージャー   |
| registerAdvancedConsoleHandlers | 高度コンソール       |
| registerAnalyticsHandlers       | 分析                 |
| registerPermissionStoreHandlers | パーミッションストア |

### Step 3: テストパターン設計

既存の `creatorHandlers.registrationSnapshot.test.ts` を基準パターンとして、全waveで共通のテスト構造を定義する。

#### 共通テスト契約

各 registration unit に対して以下の 3 テストを必須とする:

| テストID形式          | 内容                                              |
| --------------------- | ------------------------------------------------- |
| REG-SNAP-{PREFIX}-01  | 登録チャンネル一覧がスナップショットと一致する    |
| REG-DEDUP-{PREFIX}-01 | 重複チャンネルが存在しない（Set.size === length） |
| REG-COUNT-{PREFIX}-01 | 登録チャンネル総数が期待値と一致する              |

`{PREFIX}` は対象関数の略称とする。例:

- registerSkillHandlers → SKILL
- registerLLMHandlers → LLM
- registerApprovalHandlers → APPROVAL

`REG-EDGE-*` のような人工的な自己検証テストは任意とし、
導入する場合でも受入基準の必須条件には含めない。

#### vi.spyOn パターンの設計方針

既存パターンに準拠し、以下の構造を全テストファイルで採用する:

- `vi.hoisted()` で `mockIpcMainHandle`・`mockIpcMainOn` を定義する
- `vi.mock("electron", ...)` で `ipcMain.handle` と `ipcMain.on` をモックする
- `beforeEach` で `handles = []`・`vi.clearAllMocks()`・`vi.resetModules()` を実行する
- `mockIpcMainHandle.mockImplementation` でチャンネル名を `handles` 配列に収集する
- テスト本体で `[...handles].sort()` したものをスナップショットに渡す

#### ipcMain.on を持つ handler の対応方針

handle/on/mixed のうち、`on` を含む handler については以下の方針を採用する:

- `on` チャンネルは `handles` とは別の `onChannels` 配列に収集する
- `handle only`: `REG-SNAP` / `REG-DEDUP` / `REG-COUNT` をそのまま適用する
- `mixed`: `handle` と `on` を分離収集し、どちらを snapshot 対象に含めるかを
  `test-pattern-design.md` に明記する
- `on only`: snapshot 対象外にする場合でも「対象外理由」と代替検証
  （最低 `REG-DEDUP` 相当）を `wave-plan.md` に明記する
- index の受入基準と矛盾する除外を作らない。除外規則を採用する場合は
  index 側の受入基準文言も同時に更新する

#### スナップショットファイルの配置

- 自動生成先: `apps/desktop/src/main/ipc/__tests__/__snapshots__/`
- ファイル名形式: `{testFileName}.snap`
- スナップショットは初回実行時に自動生成され、以降の実行で差分を検出する

#### テストファイルの命名規則

- 命名形式: `{handlerPrefix}Handlers.registrationSnapshot.test.ts`
- 例: `skillHandlers.registrationSnapshot.test.ts`、`llmHandlers.registrationSnapshot.test.ts`

### Step 4: CI コスト評価

- Phase 1 の `handler-inventory.md` に記録した対象数を母数に、
  `必須3テスト × 対象数` を基本ケース数として見積もる
- `on only` / mixed / 既存テストありの例外は `wave-plan.md` に別枠で記録する
- CI時間は推定だけで進めず、Wave 1 完了時点で初回実測、
  Wave 2 / 3 で再計測する前提を置く
- 採用値は中央値または平均値のどちらを使うかを `wave-plan.md` に明記する

## 参照資料

- `apps/desktop/src/main/ipc/__tests__/creatorHandlers.registrationSnapshot.test.ts`（設計基準パターン）
- `outputs/phase-1/handler-inventory.md`（Wave 構成の入力）
- `outputs/phase-1/existing-test-map.md`（テスト欠損リストの入力）

## 成果物

- `outputs/phase-2/priority-matrix.md`（優先度スコアリング表。3軸スコアとWave割り当てを関数ごとに記載）
- `outputs/phase-2/test-pattern-design.md`（テストパターン設計書。vi.spyOnパターン・テストID採番規則・on対応方針・命名規則を記載）
- `outputs/phase-2/wave-plan.md`（Wave 1〜3 の対象関数一覧・想定テストファイル名・想定チャンネル数を記載）

## 完了条件

- [ ] `handler-inventory.md` の全 registration unit が Wave 1〜3 または対象外理由付き例外のいずれかに割り当てられている
- [ ] 各 Wave の対象件数と例外件数が `wave-plan.md` に明記されている
- [ ] テストID採番規則（REG-SNAP-{PREFIX}-01 等）が `test-pattern-design.md` に定義されている
- [ ] vi.spyOn パターンの設計方針が既存パターンと整合している
- [ ] ipcMain.on を持つ handler の対応方針が明記されている
- [ ] 想定テストファイル名の一覧が `wave-plan.md` に記載されている

## タスク100%実行確認【必須】

1. `priority-matrix.md` の関数数が `handler-inventory.md` の関数数と一致しているか
2. Wave 1〜3 の合計関数数が全 handler 数と一致しているか
3. テストパターンが既存の `creatorHandlers.registrationSnapshot.test.ts` の構造と矛盾していないか
4. `wave-plan.md` に想定テストファイル名が全Wave分記載されているか
5. CI コスト評価が `wave-plan.md` に含まれているか

## 次Phase

Phase 3（設計レビュー）へ進む。Wave 構成の適切さと CI 時間影響を第三者視点でレビューし、Phase 4 への進行判定を行う。
