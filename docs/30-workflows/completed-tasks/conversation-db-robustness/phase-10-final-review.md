# Phase 10: 最終レビュー

## メタ情報

| 項目     | 内容                                    |
| -------- | --------------------------------------- |
| Phase    | 10                                      |
| 機能名   | conversation-db-robustness              |
| 作成日   | 2026-03-18                              |
| タスクID | TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001 |
| 前Phase  | Phase 9（品質検証）                     |
| 次Phase  | Phase 11（手動テスト）                  |

## 目的

受入基準との整合性を最終確認する。

## レビュー観点

| #   | 受入基準                                     | 確認方法                                                                             |
| --- | -------------------------------------------- | ------------------------------------------------------------------------------------ |
| 1   | 初回起動で Workspace Chat が正常動作         | Phase 11 で検証                                                                      |
| 2   | `app.getPath('userData')` 配下に DB 自動作成 | テスト T-01 で検証                                                                   |
| 3   | アプリ終了時に DB が安全にクローズ           | テスト T-03 で検証                                                                   |
| 4   | 既存133テスト全 PASS                         | Phase 9 で検証済み                                                                   |
| 5   | DI パターンに変更済み                        | テスト T-04 で検証                                                                   |
| 6   | DIP準拠（P61）                               | IPC ハンドラ登録関数の引数型がインターフェース（ConversationDatabasePort）であること |

## ゲート判定

| 判定     | 対応                                                                                               |
| -------- | -------------------------------------------------------------------------------------------------- |
| PASS     | Phase 11 へ                                                                                        |
| MINOR    | 未タスク仕様書に変換後 Phase 11 へ（**「機能影響なし」でも省略不可** — 05-task-execution.md 参照） |
| MAJOR    | 影響範囲に応じて Phase 1-5 へ戻る                                                                  |
| CRITICAL | Phase 1 へ戻り要件再確認                                                                           |

## 参照資料

### 前Phase成果物

| 成果物           | パス                                     |
| ---------------- | ---------------------------------------- |
| 受入基準         | `outputs/phase-1/acceptance-criteria.md` |
| 設計サマリー     | `outputs/phase-2/design-summary.md`      |
| 実装計画         | `outputs/phase-5/implementation-plan.md` |
| QAチェックリスト | `outputs/phase-9/qa-checklist.md`        |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                           | 内容            |
| ----------------------- | ------------------------------------------------------------------------------ | --------------- |
| architecture-overview   | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`   | 全体責務境界    |
| database-implementation | `.claude/skills/aiworkflow-requirements/references/database-implementation.md` | DB 実装パターン |

## 実行タスク

- タスク1: 受入基準5項目の最終確認
- タスク2: PASS/MINOR/MAJOR/CRITICAL 判定
- タスク3: MINOR 指摘の未タスク仕様書変換

## 統合テスト連携【必須】

既存 conversation テスト133件の回帰確認（最終レビューで全テスト PASS 済みを確認）。

## 多角的チェック観点（AIが判断）

| 観点                                         | チェック項目                                                                                           |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| セキュリティ                                 | DB パスのパストラバーサル対策（`security-electron-ipc.md` 準拠）                                       |
| アーキテクチャ                               | DI パターン・DIP 準拠確認（`architecture-overview.md` 準拠）                                           |
| データ整合性                                 | WAL/pragma 設定の妥当性（`database-implementation.md` 準拠）                                           |
| エラーハンドリング                           | Result パターン・Graceful Degradation の一貫性（`error-handling.md` 準拠）                             |
| パフォーマンス                               | WAL モード・busyTimeout 設定の適切性                                                                   |
| Graceful Degradation と Fail-fast の方針統一 | DB 初期化失敗時の振る舞いが Graceful Degradation か Fail-fast か、全ハンドラで方針が統一されていること |
| Factory 関数パターンの一貫性                 | `createConversationDatabase()` 等の Factory 関数が他の DB Factory と同じ命名・引数規約に従っていること |
| activate イベントでの DB 再利用の安全性      | macOS `activate` イベントでウィンドウ再作成時に DB インスタンスが再利用され、二重初期化されないこと    |

## 成果物

| 成果物           | パス                                      | 説明                           |
| ---------------- | ----------------------------------------- | ------------------------------ |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | ゲート判定と受入基準の検証記録 |

## 完了条件

- [ ] 受入基準6項目が全て検証済み
- [ ] PASS/MINOR/MAJOR/CRITICAL の判定が下されている
- [ ] MINOR 指摘は未タスク仕様書に変換済み
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] タスク1: 受入基準6項目の最終確認
- [ ] タスク2: PASS/MINOR/MAJOR/CRITICAL 判定
- [ ] タスク3: MINOR 指摘の未タスク仕様書変換
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次Phase

Phase 10 PASS 後、Phase 11（手動テスト）に進む。
