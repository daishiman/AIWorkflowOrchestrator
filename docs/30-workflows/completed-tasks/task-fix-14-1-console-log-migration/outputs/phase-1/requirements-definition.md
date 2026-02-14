# TASK-FIX-14-1-CONSOLE-LOG-MIGRATION 要件定義書

## メタ情報

| 項目       | 値                                  |
| ---------- | ----------------------------------- |
| タスク ID  | TASK-FIX-14-1-CONSOLE-LOG-MIGRATION |
| Phase      | Phase 1 - 要件定義                  |
| 作成日     | 2026-02-14                          |
| ステータス | 完了                                |

## 背景

`.claude/rules/02-code-quality.md` および `06-known-pitfalls.md#P20` のログ規約において、本番コードでの `console.log` / `console.warn` / `console.error` の直接使用は禁止されている。テスト結果の可読性低下や重要なエラーの見逃しを防止するため、`electron-log` を使用した構造化ログへの移行が必要である。

現在、スキル関連サービス4ファイル・27箇所において `console.*` が直接使用されており、ログ規約に違反している。

## 対象ファイル

| ファイル                | 箇所数 | 主な用途                     |
| ----------------------- | ------ | ---------------------------- |
| `SkillScanner.ts`       | 7      | スキャンエラー・警告         |
| `PermissionStore.ts`    | 7      | 永続化エラー・情報ログ       |
| `SkillImportManager.ts` | 12     | インポート処理・デバッグログ |
| `SkillAnalyzer.ts`      | 1      | 分析エラー                   |

**注記**: `SkillImportManager.ts` の箇所数は実装時の grep 結果により10箇所となる可能性がある。Phase 5 で実際の grep 結果に基づき確定する。

## 要件一覧

### REQ-1: console.error から log.error への移行

- **対象**: 致命的エラー・例外発生時の `console.error` 呼び出し
- **変更内容**: `console.error(...)` を `log.error(...)` に置換
- **ログレベル**: error（致命的エラー、例外キャッチ時）

### REQ-2: console.warn から log.warn への移行

- **対象**: 非致命的な問題・スキップ時の `console.warn` 呼び出し
- **変更内容**: `console.warn(...)` を `log.warn(...)` に置換
- **ログレベル**: warn（処理続行可能な問題、スキップ通知）

### REQ-3: console.info から log.info への移行

- **対象**: 正常な状態変化・操作記録の `console.info` 呼び出し
- **変更内容**: `console.info(...)` を `log.info(...)` に置換
- **ログレベル**: info（正常な状態変化、操作完了通知）

### REQ-4: console.log（debug フラグ付き）から log.debug への移行

- **対象**: `this.debug` フラグでガードされた `console.log` 呼び出し
- **変更内容**: `if (this.debug) console.log(...)` を `log.debug(...)` に置換
- **ログレベル**: debug（開発用デバッグ情報）
- **補足**: `electron-log` のレベル制御で debug 出力の有効/無効を管理するため、`this.debug` フラグによるガードは不要になる

### REQ-5: electron-log の import 追加

- **対象**: 4ファイル全て
- **変更内容**: ファイル先頭に `import log from "electron-log"` を追加
- **前提条件**: `electron-log` は `apps/desktop` の依存関係に既に含まれている

### REQ-6: テストファイルの console スパイから electron-log モックへの更新

- **対象**: 対象4ファイルに対応するテストファイル
- **変更内容**: `vi.spyOn(console, 'log')` 等のスパイを `vi.mock("electron-log")` のモックに置換
- **テスト検証**: モック対象のメソッド呼び出しを `expect(log.error).toHaveBeenCalledWith(...)` 等で検証

### REQ-7: 機密情報のログ出力防止確認

- **対象**: 全ての移行対象ログメッセージ
- **確認内容**: ログメッセージにパスワード、API キー、PII（個人識別情報）が含まれていないこと
- **根拠**: `.claude/rules/04-electron-security.md` の IPC セキュリティ原則

### REQ-8: ログメッセージプレフィックスの統一

- **対象**: 全ての移行対象ログメッセージ
- **形式**: `[ClassName]` プレフィックス（例: `[SkillScanner]`, `[PermissionStore]`）
- **根拠**: 既存の `SkillService.ts` と同一パターンに統一
