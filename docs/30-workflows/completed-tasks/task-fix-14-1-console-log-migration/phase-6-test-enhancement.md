# Phase 6: テスト拡充 — console → electron-log 移行

## メタ情報

| 項目     | 内容                                |
| -------- | ----------------------------------- |
| Phase    | 6                                   |
| タスクID | TASK-FIX-14-1-CONSOLE-LOG-MIGRATION |
| 機能名   | console → electron-log 移行         |
| 作成日   | 2026-02-14                          |

## 目的

Phase 5 の実装後、カバレッジ不足箇所のテストを追加し、移行の品質を保証する。

## 実行タスク

### Task 1: カバレッジ測定

```bash
pnpm --filter @repo/desktop exec vitest run --coverage src/main/services/skill/SkillScanner.ts src/main/services/skill/PermissionStore.ts src/main/services/skill/SkillImportManager.ts src/main/services/skill/SkillAnalyzer.ts
```

### Task 2: ログ出力検証テストの追加

各ファイルについて、electron-log の呼び出しを検証するテストを追加する。

#### 2.1 SkillScanner.ts のログ検証

- エラー系: ディレクトリ作成失敗時に `log.error` が呼ばれること
- 警告系: パストラバーサル検出時に `log.warn` が呼ばれること
- 情報系: ディレクトリ自動作成時に `log.info` が呼ばれること

#### 2.2 PermissionStore.ts のログ検証

- エラー系: ストア保存失敗時に `log.error` が呼ばれること
- 警告系: スキーマ不正時に `log.warn` が呼ばれること
- 情報系: ツール許可操作時に `log.info` が呼ばれること

#### 2.3 SkillImportManager.ts のログ検証

- エラー系: ストア読み込み/永続化失敗時に `log.error` が呼ばれること
- 警告系: 型不正時に `log.warn` が呼ばれること
- デバッグ系: 各操作で `log.debug` が呼ばれること

#### 2.4 SkillAnalyzer.ts のログ検証

- エラー系: SDK障害時に `log.error` が呼ばれること

### Task 3: 境界値・異常系テスト

| テストケース                  | 対象         | 期待動作                               |
| ----------------------------- | ------------ | -------------------------------------- |
| electron-log が未初期化の場合 | 全ファイル   | エラーなく動作する                     |
| 大量のログ出力                | SkillScanner | パフォーマンス劣化なし                 |
| ログメッセージのフォーマット  | 全ファイル   | `[ClassName]` プレフィックスが含まれる |

## 参照資料

| 資料           | パス                                                                       |
| -------------- | -------------------------------------------------------------------------- |
| Phase 5 実装   | phase-5-implementation.md                                                  |
| カバレッジ基準 | .claude/skills/task-specification-creator/references/coverage-standards.md |

## 統合テスト連携【必須】

| 統合ポイント   | 内容                                                                                                     |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| 対象モジュール | SkillScanner / PermissionStore / SkillImportManager / SkillAnalyzer                                      |
| テスト連携     | `apps/desktop/src/main/services/skill/__tests__/` のユニット・統合テストで移行結果を検証                 |
| 未解決項目     | `SkillExecutor.ts` の console 4箇所は未タスク `TASK-FIX-14-2-SKILLEXECUTOR-CONSOLE-LOG-MIGRATION` で追跡 |

## 成果物

| 成果物                   | パス                                                      | 種別         |
| ------------------------ | --------------------------------------------------------- | ------------ |
| 拡充されたテストファイル | apps/desktop/src/main/services/skill/**tests**/\*.test.ts | コード       |
| カバレッジレポート       | outputs/phase-6/coverage-report.md                        | ドキュメント |

## 完了条件

- [ ] カバレッジ測定を実施した
- [ ] ログ出力検証テストを追加した
- [ ] 境界値・異常系テストを追加した
- [ ] 全テストが PASS

## 次Phase

→ Phase 7: テストカバレッジ確認
