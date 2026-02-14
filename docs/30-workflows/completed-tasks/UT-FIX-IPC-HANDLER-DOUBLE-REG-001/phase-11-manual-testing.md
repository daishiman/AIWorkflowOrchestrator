# Phase 11: 手動テスト検証 - IPC ハンドラ二重登録バグ修正

## メタ情報

| 項目         | 値                                |
| ------------ | --------------------------------- |
| Phase        | 11                                |
| タスクID     | UT-FIX-IPC-HANDLER-DOUBLE-REG-001 |
| タスク名     | IPC ハンドラ二重登録例外の修正    |
| 機能名       | UT-FIX-IPC-HANDLER-DOUBLE-REG-001 |
| 種別         | バグ修正 (fix)                    |
| 優先度       | 高                                |
| GitHub Issue | #815                              |
| 関連Pitfall  | P5（リスナー二重登録）            |
| 作成日       | 2026-02-14                        |

## 目的

自動テストでは検証できないユーザー体験・実環境動作を手動で確認する。macOS での `app.on("activate")` イベント発火時に IPC ハンドラ二重登録例外が発生しないこと、および既存の IPC 機能にリグレッションがないことを検証する。

## 実行タスク

- 機能テスト: activate イベント後のウィンドウ復帰と IPC 応答を確認する
- リグレッションテスト: 既存 IPC 機能（ファイルツリー、テーマ、設定画面）の動作を確認する
- エラー監視: DevTools コンソールで二重登録エラーの不在を確認する

## 参照資料

| 資料名                   | パス                               | 説明          |
| ------------------------ | ---------------------------------- | ------------- |
| Phase 1 要件定義         | `phase-1-requirements.md`          | 依存Phase     |
| Phase 2 設計             | `phase-2-design.md`                | 依存Phase     |
| Phase 5 実装             | `phase-5-implementation.md`        | 依存Phase     |
| Phase 6 テスト拡充       | `phase-6-test-expansion.md`        | 依存Phase     |
| Phase 7 カバレッジ確認   | `phase-7-coverage-verification.md` | 依存Phase     |
| Phase 8 リファクタリング | `phase-8-refactoring.md`           | 依存Phase     |
| Phase 9 品質検証         | `phase-9-quality-assurance.md`     | 依存Phase     |
| Phase 10 最終レビュー    | `phase-10-final-review.md`         | 依存Phase     |
| Phase 11 手動テスト      | `phase-11-manual-testing.md`       | 本Phase成果物 |
| タスク仕様書（#815）     | GitHub Issue #815                  | 元バグ報告    |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                              | 内容                     |
| ------------------ | --------------------------------------------------------------------------------- | ------------------------ |
| セキュリティ IPC   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | IPC セキュリティ要件     |
| UI/UX 実行画面     | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`      | Agent ビュー手動確認観点 |
| アーキテクチャ概要 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`      | IPC ハンドラ登録一覧     |
| Agent SDK Skill IF | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | スキル IPC 仕様          |
| テスト品質要件     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | 手動確認の合格条件       |

## 実行手順

### Step 1: テスト環境準備

1. `pnpm --filter @repo/shared build` で共有パッケージをビルドする
2. `pnpm --filter @repo/desktop dev` で開発モードでアプリを起動する
3. DevTools を開き、Console タブを表示する

### Step 2: 機能テスト実行

以下のテストケーステーブルに従い、各テストを順番に実行する。

### Step 3: リグレッションテスト実行

activate 後に既存機能が正常動作することを確認する。

### Step 4: 結果記録

全テスト結果を `outputs/phase-11/manual-test-result.md` に記録する。

## テストケーステーブル

| No  | カテゴリ       | テスト項目                        | 前提条件                                     | 操作手順                                                                        | 期待結果                                                     | 実行結果   |
| --- | -------------- | --------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------ | ---------- |
| 1   | 機能テスト     | macOS activate 後のウィンドウ復帰 | アプリが起動済みでウィンドウが表示されている | 1. Command+W でウィンドウを閉じる 2. ドックアイコンをクリックする               | エラーなくウィンドウが復帰し、前回と同じ画面が表示される     | {{RESULT}} |
| 2   | 機能テスト     | activate 後の IPC 応答確認        | テスト No.1 完了後                           | 1. Agent ビューに遷移する 2. スキル一覧の表示を確認する                         | スキル一覧が正常に表示され、各スキル情報が読み込まれている   | {{RESULT}} |
| 3   | 機能テスト     | DevTools エラー確認               | テスト No.1 完了後                           | 1. DevTools の Console タブを確認する 2. エラーメッセージを検索する             | 「Attempted to register a second handler」エラーが存在しない | {{RESULT}} |
| 4   | 機能テスト     | 複数回 activate の安定性          | アプリが起動済み                             | 1. Command+W → ドッククリック を3回繰り返す 2. 各回でウィンドウ復帰を確認する   | 3回全てエラーなくウィンドウが復帰する                        | {{RESULT}} |
| 5   | 機能テスト     | activate 後のファイル操作 IPC     | テスト No.1 完了後                           | 1. ファイルツリーでプロジェクトを開く 2. ファイルを選択して内容表示する         | ファイルツリーの展開と内容表示が正常に動作する               | {{RESULT}} |
| 6   | 機能テスト     | activate 後の設定変更 IPC         | テスト No.1 完了後                           | 1. 設定画面を開く 2. テーマをライト/ダークに切り替える 3. 設定を保存する        | テーマ切り替えと設定保存が正常に動作する                     | {{RESULT}} |
| 7   | リグレッション | 初回起動時の IPC ハンドラ正常動作 | アプリを完全終了してから再起動する           | 1. アプリを Command+Q で完全終了する 2. アプリを再起動する 3. 各画面を操作する  | 初回起動時の IPC ハンドラが全て正常に機能する                | {{RESULT}} |
| 8   | リグレッション | ファイルツリー表示                | テスト No.1 完了後                           | 1. ファイルツリーの展開・折り畳みを実行する 2. ディレクトリを3階層以上展開する  | ファイルツリーの展開・折り畳みが正常動作する                 | {{RESULT}} |
| 9   | リグレッション | テーマ切り替え                    | テスト No.1 完了後                           | 1. 設定画面でライトテーマに変更する 2. ダークテーマに変更する 3. 表示を確認する | テーマが正常に切り替わり、全画面に反映される                 | {{RESULT}} |
| 10  | リグレッション | 設定画面の LLM/認証設定表示       | テスト No.1 完了後                           | 1. 設定画面を開く 2. LLM プロバイダー設定を表示する 3. 認証モード設定を表示する | 設定画面が正常表示され、LLM/認証設定が読み込まれる           | {{RESULT}} |
| 11  | リグレッション | Agent ビューでのスキル検索・操作  | テスト No.1 完了後                           | 1. Agent ビューでスキル検索を実行する 2. スキル詳細を表示する                   | 検索結果が正常に表示され、スキル詳細が確認できる             | {{RESULT}} |
| 12  | エラー監視     | Console ログの警告・エラー確認    | テスト No.1〜11 完了後                       | 1. DevTools Console の全出力を確認する 2. IPC 関連のエラー・警告をフィルタする  | IPC 関連のエラー・警告が0件である                            | {{RESULT}} |

## 統合テスト連携【必須】

| 観点           | 記録内容                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------ |
| Phase 1 接続   | 要件で定義した「activate 時の二重登録防止」が手動で確認できたか                            |
| Phase 5 接続   | 実装した `unregisterAllIpcHandlers()` が activate 前に正しく動作しているか                 |
| Phase 10 接続  | 最終レビューで指示された観点（複数回 activate、既存 IPC リグレッション）を手動で実施したか |
| IPC/API 整合性 | activate 後に全 IPC チャンネルが応答すること                                               |
| 回帰（リグレ） | ファイル操作・テーマ切替・設定画面・Agent ビューが正常動作すること                         |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                           | 仕様参照先                                   |
| ------------------ | ---------------------------------- | -------------------------------------------- |
| セキュリティ       | 認証・認可・入力検証が関係する場合 | `aiworkflow-requirements: security-*.md`     |
| UI/UX              | フロントエンド実装の場合           | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | 設計・構造変更の場合               | `aiworkflow-requirements: architecture-*.md` |
| API設計            | API実装・変更の場合                | `aiworkflow-requirements: api-*.md`          |
| データ整合性       | 永続化やDB操作がある場合           | `aiworkflow-requirements: database-*.md`     |
| エラーハンドリング | 例外処理がある場合                 | `aiworkflow-requirements: error-handling.md` |

| 層                         | 適用判断                    | 仕様参照先                                             |
| -------------------------- | --------------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | UI/React実装の場合          | `aiworkflow-requirements: ui-ux-*.md`                  |
| バックエンド（Main）       | サービス/ロジック実装の場合 | `aiworkflow-requirements: architecture-*.md`           |
| IPC通信                    | Main-Renderer連携の場合     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| Preload/セキュリティ       | API公開の場合               | `aiworkflow-requirements: security-api-electron.md`    |
| ローカルストレージ         | 永続化がある場合            | `aiworkflow-requirements: database-*.md`               |

## サブタスク管理

1. 参照資料の確認
2. テスト環境準備（ビルド・起動）
3. 機能テスト実行（テストケース No.1〜6）
4. リグレッションテスト実行（テストケース No.7〜11）
5. エラー監視（テストケース No.12）
6. 統合テスト連携の確認（Phase 1〜11 接続）
7. 成果物の作成・配置
8. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json更新方針が明記されている
- [ ] Phase末端で完了を明記している

## 成果物

| 成果物         | パス                                     | 説明                 |
| -------------- | ---------------------------------------- | -------------------- |
| 手動テスト仕様 | `phase-11-manual-testing.md`             | 本文書               |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | テスト実行結果の記録 |

## 完了条件

- [ ] テストケース No.1〜6（機能テスト）が全て PASS している
- [ ] テストケース No.7〜11（リグレッションテスト）が全て PASS している
- [ ] テストケース No.12（エラー監視）が PASS している
- [ ] 複数回 activate（3回以上）で安定動作が確認されている
- [ ] DevTools Console に `Attempted to register a second handler` エラーが出ていない
- [ ] activate 後の全 IPC チャンネル（ファイル操作、テーマ、設定、Agent）が応答している
- [ ] 初回起動時のリグレッションがないことが確認されている
- [ ] 統合テスト連携の全観点が記録されている
- [ ] 手動テスト結果が `outputs/phase-11/manual-test-result.md` に記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 12: ドキュメント更新（`phase-12-documentation.md`）
