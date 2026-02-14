# Phase 1: 要件定義 — console → electron-log 移行

## メタ情報

| 項目     | 内容                                |
| -------- | ----------------------------------- |
| Phase    | 1                                   |
| タスクID | TASK-FIX-14-1-CONSOLE-LOG-MIGRATION |
| 機能名   | console → electron-log 移行         |
| 作成日   | 2026-02-14                          |

## 目的

スキル関連サービスの `console.error` / `console.warn` / `console.log` / `console.info` を `electron-log` に移行するための要件を定義する。

## 実行タスク

### Task 1: 要件抽出

#### 1.1 背景と課題

`.claude/rules/02-code-quality.md` の「`console.log` を本番コードに残さない（構造化ログを使用）」ルールに違反する箇所が、スキル関連サービスに27箇所以上存在する。

#### 1.2 対象ファイルと箇所数

| ファイル              | 箇所数                 | 主な用途             | 現状                    |
| --------------------- | ---------------------- | -------------------- | ----------------------- |
| SkillScanner.ts       | 7                      | スキャンエラー・警告 | console.error/warn/log  |
| PermissionStore.ts    | 7                      | 永続化エラー・情報   | console.error/warn/info |
| SkillImportManager.ts | 12                     | インポート・デバッグ | console.error/warn/log  |
| SkillAnalyzer.ts      | 1                      | 分析エラー           | console.error           |
| SkillService.ts       | 0                      | -                    | 移行済み ✓              |
| SkillExecutor.ts      | 0 (テストのスパイのみ) | -                    | テストモック更新が必要  |

**合計**: 27箇所（本番コード）+ テストスパイ4ファイル

#### 1.3 要件一覧

| 要件ID | 要件                                                                               | 優先度 |
| ------ | ---------------------------------------------------------------------------------- | ------ |
| REQ-1  | 全 `console.error` を `log.error` に置換する                                       | 必須   |
| REQ-2  | 全 `console.warn` を `log.warn` に置換する                                         | 必須   |
| REQ-3  | 全 `console.info` を `log.info` に置換する                                         | 必須   |
| REQ-4  | 全 `console.log`（debugフラグ付き）を `log.debug` に置換する                       | 必須   |
| REQ-5  | 各ファイルに `import log from "electron-log"` を追加する                           | 必須   |
| REQ-6  | テストファイルの console スパイを electron-log モックに更新する                    | 必須   |
| REQ-7  | ログメッセージに機密情報（パスワード・APIキー・PII）が含まれていないことを確認する | 必須   |
| REQ-8  | ログメッセージのプレフィックスを `[ClassName]` 形式に統一する                      | 推奨   |

### Task 2: 受入基準定義

| 受入基準ID | 基準                                                            | 検証方法                                                                                            |
| ---------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| AC-1       | スキル関連サービス4ファイルで `console.` 使用がゼロ             | `grep -rn "console\." --include="*.ts" --exclude="*.test.ts" apps/desktop/src/main/services/skill/` |
| AC-2       | 全テストが PASS する                                            | `pnpm --filter @repo/desktop exec vitest run src/main/services/skill/`                              |
| AC-3       | テストファイルの console スパイが electron-log モックに更新済み | テストコードのレビュー                                                                              |
| AC-4       | ログレベルが適切に設定されている（error/warn/info/debug）       | コードレビュー                                                                                      |
| AC-5       | ログメッセージに機密情報が含まれていない                        | コードレビュー                                                                                      |

### Task 3: スコープ定義

#### 含むもの

- 4ファイル・27箇所の console → electron-log 移行
- テストファイル4つの console スパイ → electron-log モック更新
- ログレベルの適切な設定
- ログメッセージのプレフィックス統一

#### 含まないもの

- スキル関連以外のファイルの移行
- electron-log の設定変更（transports設定など）
- 新規ログの追加
- skillHandlers.ts のDEBUGログ整理（別タスク）

## 参照資料

- `.claude/rules/02-code-quality.md` — ログ規約
- `docs/30-workflows/skill-import-agent-system/tasks/completed-task/06c-task-fix-14-1-console-log-migration.md` — 元タスク指示書
- `apps/desktop/src/main/services/skill/SkillService.ts` — electron-log 使用の参考実装

## 多角的チェック観点

| 観点           | 確認事項                                                         |
| -------------- | ---------------------------------------------------------------- |
| セキュリティ   | ログメッセージに機密情報が含まれていないか（02-code-quality.md） |
| アーキテクチャ | electron-log はMain Process専用であることの確認                  |
| テスト         | テストファイルのモック更新漏れがないか                           |

## 統合テスト連携【必須】

| 統合ポイント   | 内容                                                                                                     |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| 対象モジュール | SkillScanner / PermissionStore / SkillImportManager / SkillAnalyzer                                      |
| テスト連携     | `apps/desktop/src/main/services/skill/__tests__/` のユニット・統合テストで移行結果を検証                 |
| 未解決項目     | `SkillExecutor.ts` の console 4箇所は未タスク `TASK-FIX-14-2-SKILLEXECUTOR-CONSOLE-LOG-MIGRATION` で追跡 |

## 成果物

| 成果物         | パス                                       |
| -------------- | ------------------------------------------ |
| 要件定義書     | outputs/phase-1/requirements-definition.md |
| 受入基準書     | outputs/phase-1/acceptance-criteria.md     |
| スコープ定義書 | outputs/phase-1/scope-definition.md        |

## 完了条件

- [ ] 要件一覧（REQ-1〜REQ-8）が定義されている
- [ ] 受入基準（AC-1〜AC-5）が定義されている
- [ ] スコープ（含む/含まない）が明確に定義されている
- [ ] 対象ファイルと箇所数が実測値で記載されている

## 次Phase

→ Phase 2: 設計
