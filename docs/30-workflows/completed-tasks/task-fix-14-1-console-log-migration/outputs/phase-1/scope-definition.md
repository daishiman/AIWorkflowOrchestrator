# TASK-FIX-14-1-CONSOLE-LOG-MIGRATION スコープ定義書

## メタ情報

| 項目       | 値                                  |
| ---------- | ----------------------------------- |
| タスク ID  | TASK-FIX-14-1-CONSOLE-LOG-MIGRATION |
| Phase      | Phase 1 - 要件定義                  |
| 作成日     | 2026-02-14                          |
| ステータス | 完了                                |

## スコープに含むもの

### 1. 本番コード修正（4ファイル・27箇所）

| ファイル                | 箇所数 | 修正内容                                      |
| ----------------------- | ------ | --------------------------------------------- |
| `SkillScanner.ts`       | 7      | console.error/warn → log.error/warn           |
| `PermissionStore.ts`    | 7      | console.error/info → log.error/info           |
| `SkillImportManager.ts` | 12     | console.log/error/warn → log.debug/error/warn |
| `SkillAnalyzer.ts`      | 1      | console.error → log.error                     |

### 2. テストファイル修正（3ファイル）

| テストファイル                     | 修正内容                                       |
| ---------------------------------- | ---------------------------------------------- |
| `SkillExecutor.auth.test.ts`       | console.log/error スパイ → electron-log モック |
| `SkillExecutor.permission.test.ts` | console.info スパイ → electron-log モック      |
| `SkillImportManager.error.test.ts` | console.log スパイ → electron-log モック       |

### 3. electron-log の import 追加

- 4ファイル全てに `import log from "electron-log"` を追加

### 4. ログレベルの適切な設定

- error / warn / info / debug の4段階を用途に応じて使い分け
- `this.debug` フラグによるガードを `log.debug` のレベル制御に置換

### 5. ログメッセージプレフィックスの統一

- `[ClassName]` 形式に統一（例: `[SkillScanner]`, `[PermissionStore]`）
- 既存の `SkillService.ts` と同一パターン

## スコープに含まないもの

### 1. スキル関連以外のファイルの移行

- 他のサービスファイルにも `console.*` が存在する可能性があるが、本タスクのスコープ外
- 別タスクとして管理する

### 2. electron-log の設定変更

- `transports` 設定（ファイル出力先、ローテーション設定等）の変更は行わない
- 既存の electron-log 設定をそのまま使用する

### 3. 新規ログの追加

- 既存の `console.*` を `log.*` に置換するのみ
- 新たなログポイントの追加は行わない

### 4. skillHandlers.ts の DEBUG ログ整理

- `skillHandlers.ts` に含まれる DEBUG 関連のログは別タスクで対応する
- 本タスクではスキルサービス層（SkillScanner, PermissionStore, SkillImportManager, SkillAnalyzer）のみを対象とする

## 依存関係

### 前提条件

- `electron-log` パッケージが `apps/desktop/package.json` に依存として宣言されていること
- 既存のテストが全て PASS していること

### 後続タスクへの影響

- 本タスク完了後、他サービスファイルの `console.*` 移行を後続タスクとして検討可能
- `skillHandlers.ts` の DEBUG ログ整理は独立して実行可能
