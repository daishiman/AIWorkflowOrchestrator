# Phase 11: 手動テスト

## メタ情報

| 項目       | 値                         |
| ---------- | -------------------------- |
| Phase      | 11                         |
| タスクID   | UT-SC-03-003               |
| 親タスクID | TASK-SC-03-PLAN-LLM-PROMPT |
| 作成日     | 2026-03-23                 |

## 目的

RuntimeSkillCreatorFacade への llmAdapter/resourceLoader の DI 配線が正常に動作することを、手動テストシナリオで検証する。CLI 環境での制約（P53）を考慮し、自動テスト結果による間接的検証を併用する。

## 実行タスク

### シナリオ A: API キー設定済み — LLM 応答の正常取得

**前提条件**: Anthropic API キーが設定済みの状態

1. Electron アプリを起動する
2. DevTools コンソールを開く
3. `skill-creator:plan` IPC チャンネルを呼び出す（Renderer 側から `window.electronAPI.skillCreator.plan(...)` を実行）
4. LLM からの応答が正常に返却されることを確認する
5. DevTools コンソールに `[IPC]` プレフィックスのエラーログが出力されていないことを確認する

**期待結果**: LLM 応答オブジェクトが返却され、plan 結果が取得できる

**CLI 環境での代替検証**: 自動テスト（Phase 6-7 のインテグレーションテスト）で LLMAdapter が正常に注入され、plan() が LLM 応答を返すことを間接的に検証する

### シナリオ B: API キー未設定 — Graceful Degradation

**前提条件**: Anthropic API キーが未設定の状態

1. API キーを削除または未設定にした状態で Electron アプリを起動する
2. `skill-creator:plan` IPC チャンネルを呼び出す
3. スタブ応答（graceful degradation）が返却されることを確認する
4. DevTools コンソールに `[IPC]` プレフィックスの warn ログが出力されていることを確認する

**期待結果**: エラーではなくスタブ応答が返却され、アプリがクラッシュしない

### シナリオ C: 起動直後 — LLMAdapter 非同期取得完了前

**前提条件**: Electron アプリ起動直後（LLMAdapterFactory.getAdapter() の非同期処理完了前）

1. Electron アプリを起動する
2. 起動直後（LLMAdapter の非同期取得が完了する前）に `skill-creator:plan` IPC チャンネルを即座に呼び出す
3. スタブ応答（graceful degradation）が返却されることを確認する
4. LLMAdapter 取得完了後に再度 `skill-creator:plan` を呼び出し、正常な LLM 応答が返ることを確認する

**期待結果**: 初回呼び出しではスタブ応答、LLMAdapter 注入完了後は正常な LLM 応答が返る

### シナリオ D: DevTools ログ確認

1. 上記シナリオ A-C の実行中に DevTools コンソールを監視する
2. 以下のログが適切に出力されていることを確認する:
   - LLMAdapter 取得成功時: 成功を示す info レベルのログ
   - LLMAdapter 取得失敗時: `[IPC]` プレフィックス付き warn ログ
   - plan() スタブ応答返却時: warn ログ
3. パスワード・API キー・PII がログに含まれていないことを確認する

**期待結果**: ログレベルが適切であり、機密情報が漏洩していない

## P53 対策: CLI 環境でのスクリーンショット代替

CLI 環境では Electron アプリの実画面キャプチャが直接行えないため、以下の方法で代替する:

1. **Playwright**: `page.screenshot()` をスクリプト化して取得
2. **Electron API**: `webContents.capturePage()` をスクリプト化して取得
3. **自動テスト結果**: Phase 6-7 のテスト結果ログをスクリーンショットの代替証跡とする

## 参照資料

| 資料名                         | パス / 参照先                                 |
| ------------------------------ | --------------------------------------------- |
| Phase 5 実装仕様書             | `phase-05-implementation.md`                  |
| Phase 9 品質検証結果           | `phase-09-quality-verification.md`            |
| Phase 10 最終レビュー結果      | `phase-10-final-review.md`                    |
| P53 CLI スクリーンショット制約 | `.claude/rules/06-known-pitfalls.md#P53`      |
| P65 dead-end namespace 防止    | `.claude/rules/06-known-pitfalls.md#P65`      |
| Graceful Degradation パターン  | `architecture-implementation-patterns.md#S30` |

## 成果物

| 成果物                 | パス                                                             |
| ---------------------- | ---------------------------------------------------------------- |
| 手動テスト結果レポート | `docs/30-workflows/ut-sc-03-003-di-wiring/manual-test-report.md` |

## 完了条件

- [ ] シナリオ A: API キー設定済み状態で LLM 応答が正常に返却される（自動テストで間接検証可）
- [ ] シナリオ B: API キー未設定状態でスタブ応答が返却され、アプリがクラッシュしない
- [ ] シナリオ C: LLMAdapter 非同期取得完了前にスタブ応答が返却される
- [ ] シナリオ D: DevTools ログが適切に出力され、機密情報が含まれていない
- [ ] 手動テスト結果レポートが作成されている
- [ ] 全シナリオの結果が PASS であること

## 統合テスト連携

手動テストにおける統合テスト確認:

- [ ] 手動シナリオの実行結果が自動テストの結果と整合していることを確認
- [ ] CLI環境制約による代替検証の妥当性を確認（P53対策）

## 多角的チェック観点（AIが判断）

| 観点               | 適用 | チェック内容                                                                         |
| ------------------ | ---- | ------------------------------------------------------------------------------------ |
| アーキテクチャ     | Yes  | DI配線がレイヤー依存方向（Main→Services）を遵守しているか                            |
| セキュリティ       | No   | 認証・認可の変更なし                                                                 |
| IPC通信            | Yes  | RuntimeSkillCreatorFacade への依存注入が IPC ハンドラ登録と整合しているか            |
| エラーハンドリング | Yes  | graceful degradation（llmAdapter/resourceLoader 未注入時のスタブ返却）が維持されるか |

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次の Phase

Phase 12: ドキュメント（`phase-12-documentation.md`）
