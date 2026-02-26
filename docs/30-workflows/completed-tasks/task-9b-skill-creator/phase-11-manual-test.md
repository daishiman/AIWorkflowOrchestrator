# Phase 11: 手動テスト検証

## メタ情報

| 項目      | 値                           |
| --------- | ---------------------------- |
| Phase     | 11                           |
| タスク    | TASK-9B                      |
| 機能名    | task-9b-skill-creator        |
| 作成日    | 2026-02-26                   |
| 前提Phase | Phase 10（最終レビュー）     |
| 次Phase   | Phase 12（ドキュメント更新） |

## 目的

自動テストでは検証できないユーザー体験・UI操作・実環境動作を手動で確認する。12のコマンド（chat/api/improve/execute/use/chain/fork/share/schedule/debug/docs/stats）の実環境動作、ChatPanel統合でのUI/UX、SkillCreatorService → Claude Agent SDK → ファイルシステムの接続を検証する。

## 実行タスク

- Task 11-1: 開発環境起動と初期確認
- Task 11-2: コアコマンド機能テスト（chat/api/improve/execute/use）
- Task 11-3: 拡張コマンド機能テスト（chain/fork/share/schedule/debug/docs/stats）
- Task 11-4: 異常系・セキュリティテスト
- Task 11-5: UI/UXテスト（ChatPanel統合）
- Task 11-6: リグレッションテスト
- Task 11-7: 統合テスト（E2Eシナリオ）

## 参照資料

| 資料名                | パス                                                                          | 説明                          |
| --------------------- | ----------------------------------------------------------------------------- | ----------------------------- |
| Phase 2設計成果物     | `outputs/phase-2/architecture-design.md`                                      | 設計意図・責務境界の確認      |
| Phase 5実装成果物     | `outputs/phase-5/design-changes.md`                                           | 実装内容の確認                |
| Phase 6テスト拡充結果 | `outputs/phase-6/coverage-report.md`                                          | 追加テスト観点の確認          |
| Phase 7カバレッジ結果 | `outputs/phase-7/coverage-report.md`                                          | カバレッジ基準達成状況の確認  |
| Phase 8リファクタ結果 | `outputs/phase-8/refactoring-report.md`                                       | 影響範囲・変更点の確認        |
| Phase 9品質結果       | `outputs/phase-9/quality-report.md`                                           | 品質ゲート結果の確認          |
| 最終レビュー結果      | `outputs/phase-10/final-review-result.md`                                     | Phase 10成果物                |
| 実装コード            | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                 | テスト対象サービス            |
| IPCハンドラ           | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                           | IPCチャンネル実装             |
| Preload API           | `apps/desktop/src/preload/skill-creator-api.ts`                               | Renderer向けAPI               |
| skill-creatorリソース | `~/.aiworkflow/skills/skill-creator/`                                         | スキル定義・エージェント      |
| IPCセキュリティ仕様   | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`     | 3段バリデーション・sender検証 |
| Agent IPC仕様         | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`          | IPCチャンネル契約             |
| 品質基準              | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`   | 手動検証時の品質基準          |
| Electronサービス設計  | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md` | Facadeパターン・DI            |
| IPC契約チェックリスト | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` | P23/P32/P42/P44統合チェック   |

## 実行手順

### Task 11-1: 開発環境起動と初期確認

| No  | テスト項目                    | 前提条件         | 操作手順                                                                          | 期待結果                                              | 実行結果   | 備考                   |
| --- | ----------------------------- | ---------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------- | ---------- | ---------------------- |
| 1   | アプリ起動確認                | pnpm install完了 | 1. `pnpm --filter @repo/desktop dev` 実行 2. アプリが起動するまで待機             | アプリが正常起動しメインウィンドウが表示される        | {{RESULT}} |                        |
| 2   | SDK認証状態確認               | アプリ起動済み   | 1. 設定画面を開く 2. Claude Agent SDK認証状態を確認                               | 認証済み状態が表示される                              | {{RESULT}} | 未認証の場合は認証実施 |
| 3   | skill-creatorリソース存在確認 | アプリ起動済み   | 1. `ls ~/.aiworkflow/skills/skill-creator/` 2. SKILL.md, agents/, references/確認 | SKILL.md, agents/, references/ ディレクトリが存在する | {{RESULT}} |                        |

### Task 11-2: コアコマンド機能テスト（chat/api/improve/execute/use）

| No  | カテゴリ | テスト項目                         | 前提条件                          | 操作手順                                                                                                                         | 期待結果                                                                     | 実行結果   | 備考 |
| --- | -------- | ---------------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------- | ---- |
| 4   | chat     | /skill-creator chatでスキル作成    | アプリ起動済み、SDK認証済み       | 1. ChatPanelで `/skill-creator chat` 入力 2. 対話に「天気確認スキル」と回答 3. API連携「OpenWeatherMap」と回答 4. 生成完了を待機 | `~/.aiworkflow/skills/weather-checker/` にSKILL.md含むスキル一式が生成される | {{RESULT}} |      |
| 5   | chat     | chat対話の段階的ヒアリング         | アプリ起動済み                    | 1. `/skill-creator chat` 入力 2. 各ヒアリング質問に順次回答 3. 全質問完了後の確認画面を確認                                      | 段階的に質問が提示され、最後に要件確認画面が表示される                       | {{RESULT}} |      |
| 6   | api      | /skill-creator apiでAPI連携スキル  | アプリ起動済み                    | 1. `/skill-creator api "Slack通知スキル"` 入力 2. 生成完了を待機                                                                 | Slack連携スキルが生成され、REST API呼び出しテンプレートを含む                | {{RESULT}} |      |
| 7   | improve  | /skill-creator improveで改善       | テスト用スキルが存在              | 1. `/skill-creator improve "test-skill" --auto` 入力 2. 改善提案の表示を確認 3. 自動適用完了を待機                               | 改善提案が生成され、--auto指定により自動適用される                           | {{RESULT}} |      |
| 8   | improve  | improve手動適用モード              | テスト用スキルが存在              | 1. `/skill-creator improve "test-skill"` 入力（--autoなし） 2. 改善提案の表示を確認 3. 適用するか確認                            | 改善提案が表示され、ユーザーが適用/拒否を選択できる                          | {{RESULT}} |      |
| 9   | execute  | /skill-creator executeでタスク実行 | タスク仕様書ディレクトリが存在    | 1. `/skill-creator execute ./docs/30-workflows/test-task/tasks/` 入力 2. 実行ログを監視 3. 完了を待機                            | 依存順にタスクが実行され、実行レポートが出力される                           | {{RESULT}} |      |
| 10  | execute  | executeドライラン                  | タスク仕様書ディレクトリが存在    | 1. `/skill-creator execute ./docs/30-workflows/test-task/tasks/ --dry-run` 入力                                                  | 実行計画が表示されるが実際の実行は行われない                                 | {{RESULT}} |      |
| 11  | use      | /skill-creator useで即時使用       | 生成済みスキル「weather-checker」 | 1. `/skill-creator use "weather-checker"` 入力 2. セッション内でスキルが有効になることを確認                                     | セッション内でスキルが使用可能になり、コマンド候補に表示される               | {{RESULT}} |      |

### Task 11-3: 拡張コマンド機能テスト（chain/fork/share/schedule/debug/docs/stats）

| No  | カテゴリ | テスト項目                                | 前提条件                    | 操作手順                                                               | 期待結果                                                           | 実行結果   | 備考 |
| --- | -------- | ----------------------------------------- | --------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------ | ---------- | ---- |
| 12  | chain    | /skill-creator chainでチェーン作成        | 生成済みスキルが2つ以上存在 | 1. `/skill-creator chain "skill-a" "skill-b"` 入力                     | 2つのスキルを連結するチェーンスキルが生成される                    | {{RESULT}} |      |
| 13  | fork     | /skill-creator forkでフォーク             | 既存スキルが存在            | 1. `/skill-creator fork "weather-checker" "weather-checker-v2"` 入力   | 元スキルのコピーが新名で作成され、独立して編集可能                 | {{RESULT}} |      |
| 14  | share    | /skill-creator shareで共有パッケージ生成  | 生成済みスキルが存在        | 1. `/skill-creator share "weather-checker"` 入力                       | エクスポート可能なパッケージが生成される                           | {{RESULT}} |      |
| 15  | schedule | /skill-creator scheduleでスケジュール設定 | 生成済みスキルが存在        | 1. `/skill-creator schedule "weather-checker" --cron "0 9 * * *"` 入力 | スケジュール設定が保存され確認メッセージが表示される               | {{RESULT}} |      |
| 16  | debug    | /skill-creator debugでデバッグ実行        | 生成済みスキルが存在        | 1. `/skill-creator debug "weather-checker"` 入力                       | デバッグモードでスキルが実行され、詳細ログが表示される             | {{RESULT}} |      |
| 17  | docs     | /skill-creator docsでドキュメント生成     | 生成済みスキルが存在        | 1. `/skill-creator docs "weather-checker"` 入力                        | スキルの使用方法ドキュメントが自動生成される                       | {{RESULT}} |      |
| 18  | stats    | /skill-creator statsで使用統計表示        | スキル使用履歴が存在        | 1. `/skill-creator stats` 入力                                         | スキル使用回数・成功率・最終使用日時が表示される                   | {{RESULT}} |      |
| 19  | stats    | stats個別スキル統計                       | 特定スキルの使用履歴が存在  | 1. `/skill-creator stats "weather-checker"` 入力                       | 指定スキルの詳細統計（使用回数、成功率、平均実行時間）が表示される | {{RESULT}} |      |

### Task 11-4: 異常系・セキュリティテスト

| No  | カテゴリ     | テスト項目                         | 前提条件       | 操作手順                                                   | 期待結果                                                                             | 実行結果   | 備考                      |
| --- | ------------ | ---------------------------------- | -------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------ | ---------- | ------------------------- |
| 20  | 異常系       | 存在しないスキルのimprove          | アプリ起動済み | 1. `/skill-creator improve "nonexistent-skill"` 入力       | 「指定されたスキルが見つかりません」エラーメッセージが表示される（内部情報漏洩なし） | {{RESULT}} |                           |
| 21  | 異常系       | 空文字列のスキル名                 | アプリ起動済み | 1. `/skill-creator chat` 入力 2. スキル名に空文字を入力    | 「スキル名は必須です」バリデーションエラーが表示される                               | {{RESULT}} | P42対策                   |
| 22  | 異常系       | スペースのみのスキル名             | アプリ起動済み | 1. `/skill-creator chat` 入力 2. スキル名に `"   "` を入力 | 「スキル名は空白以外の文字を含む必要があります」エラー表示                           | {{RESULT}} | P42 .trim()バリデーション |
| 23  | セキュリティ | パストラバーサル攻撃               | アプリ起動済み | 1. スキル名に `../../etc/passwd` を入力                    | バリデーションエラーで拒否される（パス操作は発生しない）                             | {{RESULT}} | セキュリティ必須          |
| 24  | セキュリティ | スクリプトインジェクション         | アプリ起動済み | 1. スキル名に `"; rm -rf /; echo "` を入力                 | バリデーションエラーで拒否される                                                     | {{RESULT}} | セキュリティ必須          |
| 25  | セキュリティ | DevToolsでwindow.electronAPI確認   | アプリ起動済み | 1. DevToolsを開く 2. `window.electronAPI.skill` を入力     | skill-creator関連APIメソッドが公開されている                                         | {{RESULT}} |                           |
| 26  | セキュリティ | DevToolsでskillAPIが存在しないこと | アプリ起動済み | 1. DevToolsを開く 2. `window.skillAPI` を入力              | `undefined` が返る（旧API削除確認）                                                  | {{RESULT}} | P28対策                   |
| 27  | 異常系       | SDK未認証時のコマンド実行          | SDK認証なし    | 1. `/skill-creator chat` 入力                              | 「SDK認証が必要です」エラーメッセージが表示される                                    | {{RESULT}} |                           |
| 28  | 異常系       | ネットワーク断時の動作             | ネットワーク断 | 1. ネットワークを切断 2. `/skill-creator api "test"` 入力  | タイムアウトエラーが表示される（ハングしない）                                       | {{RESULT}} |                           |

### Task 11-5: UI/UXテスト（ChatPanel統合）

| No  | カテゴリ | テスト項目                   | 前提条件       | 操作手順                                                    | 期待結果                                                    | 実行結果   | 備考 |
| --- | -------- | ---------------------------- | -------------- | ----------------------------------------------------------- | ----------------------------------------------------------- | ---------- | ---- |
| 29  | UI/UX    | ChatPanelでコマンド入力      | アプリ起動済み | 1. ChatPanelを開く 2. `/skill-creator` まで入力             | コマンド候補（chat/api/improve等12種）が表示される          | {{RESULT}} |      |
| 30  | UI/UX    | コマンド実行中の進捗表示     | アプリ起動済み | 1. `/skill-creator chat` で長時間処理開始 2. 進捗表示を確認 | ローディングインジケータまたは進捗メッセージが表示される    | {{RESULT}} |      |
| 31  | UI/UX    | レスポンス表示のフォーマット | アプリ起動済み | 1. `/skill-creator stats` 入力 2. レスポンス表示を確認      | 統計情報がMarkdown形式で整形表示される                      | {{RESULT}} |      |
| 32  | UI/UX    | エラーメッセージの視認性     | アプリ起動済み | 1. 存在しないコマンド `/skill-creator invalid` 入力         | エラーメッセージが赤色/エラーアイコン付きで視認しやすく表示 | {{RESULT}} |      |

### Task 11-6: リグレッションテスト

| No  | カテゴリ       | テスト項目           | 前提条件                   | 操作手順                                              | 期待結果                             | 実行結果   | 備考 |
| --- | -------------- | -------------------- | -------------------------- | ----------------------------------------------------- | ------------------------------------ | ---------- | ---- |
| 33  | リグレッション | 既存スキル一覧表示   | インポート済みスキルが存在 | 1. スキル一覧画面を開く 2. 一覧が正常に表示されること | 既存スキルが正常に一覧表示される     | {{RESULT}} |      |
| 34  | リグレッション | 既存スキル実行       | SkillExecutor動作確認      | 1. 既存スキルを選択 2. 実行ボタン押下                 | スキルが正常に実行完了する           | {{RESULT}} |      |
| 35  | リグレッション | 既存スキルインポート | -                          | 1. スキルインポート画面を開く 2. テストスキルを選択   | インポートが正常完了する             | {{RESULT}} |      |
| 36  | リグレッション | 既存スキル削除       | インポート済みスキルが存在 | 1. スキルを選択 2. 削除操作を実行                     | スキルが正常に削除され一覧から消える | {{RESULT}} |      |
| 37  | リグレッション | SkillSelectorの動作  | スキルが存在               | 1. 設定画面を開く 2. SkillSelectorを操作              | スキル選択UI が正常動作する          | {{RESULT}} |      |

### Task 11-7: 統合テスト（E2Eシナリオ）

| No  | テスト項目                   | 確認内容                                          | 期待結果                                        | 実行結果   |
| --- | ---------------------------- | ------------------------------------------------- | ----------------------------------------------- | ---------- |
| 38  | スキル生成E2Eフロー          | chat → ファイル生成 → インポート → 実行の全フロー | 全フロー正常完了、生成スキルが正常実行できる    | {{RESULT}} |
| 39  | IPC通信正常性                | Main-Renderer間のIPC通信が正常であること          | skill-creator関連IPCチャンネルで正常レスポンス  | {{RESULT}} |
| 40  | エラーハンドリングE2E        | SDK障害時のUI表示が適切であること                 | ユーザーフレンドリーなエラーメッセージが表示    | {{RESULT}} |
| 41  | 大量スキル生成時の安定性     | 3つ以上のスキルを連続生成                         | メモリリーク・UIフリーズなく安定動作            | {{RESULT}} |
| 42  | セッション跨ぎのスキル永続化 | アプリ再起動後に生成スキルが残存するか            | 再起動後も `~/.aiworkflow/skills/` にスキル存在 | {{RESULT}} |

## 統合テスト連携【必須】

| テスト項目                | 確認内容                                                    | 期待結果                                    | 実行結果   |
| ------------------------- | ----------------------------------------------------------- | ------------------------------------------- | ---------- |
| SkillCreatorService → SDK | SkillCreatorService経由のClaude Agent SDK呼び出しが正常     | SDKレスポンスが正常に処理される             | {{RESULT}} |
| SDK → ファイルシステム    | スキル生成結果がファイルシステムに正しく書き込まれる        | SKILL.md, agents/, references/ が正しく配置 | {{RESULT}} |
| IPC通信全チャンネル       | skill-creator関連の全IPCチャンネルが正常動作                | 全チャンネルで正常レスポンス                | {{RESULT}} |
| Preload API → Renderer    | Preload経由のAPI呼び出しがRenderer側で正常処理              | UIが正常にレスポンスを表示                  | {{RESULT}} |
| エラー伝播チェーン        | SDK障害 → SkillCreatorService → IPC → Renderer のエラー伝播 | 各層で内部情報を除去したエラーが表示される  | {{RESULT}} |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                                          | 仕様参照先                                                                        |
| ------------------ | ------------------------------------------------- | --------------------------------------------------------------------------------- |
| 実環境動作         | 12コマンド全ての実環境動作を手動検証              | -                                                                                 |
| セキュリティ       | パストラバーサル・インジェクション・sender検証    | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`         |
| エラーハンドリング | 異常系の実環境動作を手動確認                      | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             |
| UI/UX品質          | ChatPanel統合でのユーザー体験を手動確認           | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`    |
| リグレッション     | 既存SkillService/SkillExecutor機能への影響なし    | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` |
| IPC契約整合性      | ハンドラ引数形式とPreload側の呼び出し形式が一致   | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`     |
| 引数命名一致       | 引数名のセマンティクスが実際の値と一致（P45対策） | `.claude/rules/06-known-pitfalls.md#P45`                                          |
| パフォーマンス     | スキル生成60秒以内の非機能要件を確認              | `index.md` 非機能要件テーブル                                                     |

## Electronデスクトップアプリ観点

| 観点                 | 確認内容                                                                                 | 仕様参照先                              |
| -------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------- |
| Main-Renderer分離    | skill-creator:\*ハンドラがMain Processで実行されていること                               | `.claude/rules/04-electron-security.md` |
| contextIsolation     | Renderer ProcessからNode.js APIに直接アクセスできないこと                                | `.claude/rules/04-electron-security.md` |
| nodeIntegration      | `nodeIntegration: false` が維持されていること                                            | `.claude/rules/04-electron-security.md` |
| sandbox              | `sandbox: true` が維持されていること                                                     | `.claude/rules/04-electron-security.md` |
| エラーサニタイズ     | Main Processの内部情報（ファイルパス・スタックトレース）がRenderer側に漏洩していないこと | `.claude/rules/04-electron-security.md` |
| sender検証           | validateIpcSenderが全skill-creator:\*ハンドラに適用されていること                        | `ipc-contract-checklist.md`             |
| リスナー二重登録防止 | skill-creator:\*ハンドラが二重登録されていないこと（P5対策）                             | `.claude/rules/06-known-pitfalls.md#P5` |
| Preload Bridge       | skill-creator-api.tsのskill-creator関連メソッドがcontextBridge経由でのみ公開されること   | `.claude/rules/01-architecture.md`      |

## 成果物

| 成果物         | パス                                     | 説明               |
| -------------- | ---------------------------------------- | ------------------ |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | 全テストケース結果 |

## 完了条件

- [ ] Task 11-1: 開発環境起動と初期確認が完了している
- [ ] Task 11-2: コアコマンド機能テスト（chat/api/improve/execute/use）が全PASS
- [ ] Task 11-3: 拡張コマンド機能テスト（chain/fork/share/schedule/debug/docs/stats）が全PASS
- [ ] Task 11-4: 異常系・セキュリティテストが全PASS
- [ ] Task 11-5: UI/UXテスト（ChatPanel統合）が全PASS
- [ ] Task 11-6: リグレッションテストが全PASS
- [ ] Task 11-7: 統合テスト（E2Eシナリオ）が全PASS
- [ ] 統合テスト連携テーブルの全項目を確認完了
- [ ] 手動テスト結果 `outputs/phase-11/manual-test-result.md` が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. Task 11-1: 開発環境起動と初期確認
3. Task 11-2: コアコマンド機能テスト（chat/api/improve/execute/use）
4. Task 11-3: 拡張コマンド機能テスト（chain/fork/share/schedule/debug/docs/stats）
5. Task 11-4: 異常系・セキュリティテスト
6. Task 11-5: UI/UXテスト（ChatPanel統合）
7. Task 11-6: リグレッションテスト
8. Task 11-7: 統合テスト（E2Eシナリオ）
9. 成果物の作成・配置

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 全42テストケースの実行結果が記録されている
- [ ] 統合テスト連携テーブルの全項目が確認完了
- [ ] 手動テスト結果が `outputs/phase-11/manual-test-result.md` に出力されている

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-9b-skill-creator --phase 11
```

## 次のPhase

Phase 12: ドキュメント更新
