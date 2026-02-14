# Phase 2: 設計 — console → electron-log 移行

## メタ情報

| 項目     | 内容                                |
| -------- | ----------------------------------- |
| Phase    | 2                                   |
| タスクID | TASK-FIX-14-1-CONSOLE-LOG-MIGRATION |
| 機能名   | console → electron-log 移行         |
| 作成日   | 2026-02-14                          |

## 目的

console → electron-log 移行の設計を行い、各ファイルの移行マッピングとテスト修正方針を定義する。

## 実行タスク

### Task 1: 移行マッピング設計

#### 1.1 ログレベルマッピング

| console メソッド                  | electron-log メソッド | 使用場面                 |
| --------------------------------- | --------------------- | ------------------------ |
| `console.error()`                 | `log.error()`         | 致命的エラー・例外発生時 |
| `console.warn()`                  | `log.warn()`          | 非致命的な問題・スキップ |
| `console.info()`                  | `log.info()`          | 正常な状態変化・操作記録 |
| `console.log()` (debugフラグ付き) | `log.debug()`         | 開発用デバッグ情報       |

#### 1.2 ファイル別移行設計

##### SkillScanner.ts（7箇所）

| 箇所             | 変更前                         | 変更後                                 | 備考                       |
| ---------------- | ------------------------------ | -------------------------------------- | -------------------------- |
| L155-158         | `console.error(...)`           | `log.error("[SkillScanner] ...", ...)` | ディレクトリ作成失敗       |
| L183-185         | `console.warn(...)`            | `log.warn("[SkillScanner] ...", ...)`  | パストラバーサル検出       |
| L203-205         | `console.warn(...)`            | `log.warn("[SkillScanner] ...", ...)`  | ディレクトリ読み込みエラー |
| L298(logWarning) | メソッド内 `console.warn`      | `log.warn`                             | logWarningメソッド修正     |
| L454-461         | `console.log`, `console.error` | `log.info`, `log.warn`                 | ディレクトリ自動作成       |

**追加**: ファイル先頭に `import log from "electron-log";`

##### PermissionStore.ts（7箇所）

| 箇所     | 変更前               | 変更後                                    | 備考           |
| -------- | -------------------- | ----------------------------------------- | -------------- |
| L97      | `console.info(...)`  | `log.info("[PermissionStore] ...", ...)`  | ツール許可追加 |
| L115     | `console.info(...)`  | `log.info("[PermissionStore] ...", ...)`  | ツール許可取消 |
| L144     | `console.warn(...)`  | `log.warn("[PermissionStore] ...", ...)`  | 全許可クリア   |
| L156     | `console.warn(...)`  | `log.warn("[PermissionStore] ...", ...)`  | スキーマ不正   |
| L167-169 | `console.info(...)`  | `log.info("[PermissionStore] ...", ...)`  | 読み込み完了   |
| L171-174 | `console.warn(...)`  | `log.warn("[PermissionStore] ...", ...)`  | 読み込み失敗   |
| L191     | `console.error(...)` | `log.error("[PermissionStore] ...", ...)` | ストア保存失敗 |

**追加**: ファイル先頭に `import log from "electron-log";`

##### SkillImportManager.ts（12箇所）

| 箇所     | 変更前                     | 変更後                                       | 備考               |
| -------- | -------------------------- | -------------------------------------------- | ------------------ |
| L38-41   | `console.warn(...)`        | `log.warn("[SkillImportManager] ...", ...)`  | 型不正             |
| L50-53   | `console.warn(...)`        | `log.warn("[SkillImportManager] ...", ...)`  | 非string要素       |
| L72      | `console.log(...)` (debug) | `log.debug("[SkillImportManager] ...", ...)` | ストアパス         |
| L81-85   | `console.log(...)` (debug) | `log.debug("[SkillImportManager] ...", ...)` | 読み込みアイテム数 |
| L90      | `console.error(...)`       | `log.error("[SkillImportManager] ...", ...)` | ストア読み込み失敗 |
| L100     | `console.log(...)` (debug) | `log.debug("[SkillImportManager] ...", ...)` | 呼び出し情報       |
| L118-122 | `console.log(...)` (debug) | `log.debug("[SkillImportManager] ...", ...)` | 結果               |
| L137     | `console.log(...)` (debug) | `log.debug("[SkillImportManager] ...", ...)` | 呼び出し情報       |
| L148     | `console.log(...)` (debug) | `log.debug("[SkillImportManager] ...", ...)` | 結果               |
| L179     | `console.log(...)` (debug) | `log.debug("[SkillImportManager] ...", ...)` | 永続化             |
| L185     | `console.log(...)` (debug) | `log.debug("[SkillImportManager] ...", ...)` | 完了               |
| L188     | `console.error(...)`       | `log.error("[SkillImportManager] ...", ...)` | 永続化失敗         |

**追加**: ファイル先頭に `import log from "electron-log";`
**削除**: `debug` プロパティとその条件分岐を `log.debug` に統一（debugフラグ不要化）

##### SkillAnalyzer.ts（1箇所）

| 箇所 | 変更前               | 変更後                                  | 備考      |
| ---- | -------------------- | --------------------------------------- | --------- |
| L213 | `console.error(...)` | `log.error("[SkillAnalyzer] ...", ...)` | SDK障害時 |

**追加**: ファイル先頭に `import log from "electron-log";`

### Task 2: テスト修正設計

#### 2.1 electron-log モックパターン

```typescript
// 標準モックパターン（各テストファイルの先頭）
vi.mock("electron-log", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));
```

#### 2.2 テストファイル別修正方針

| テストファイル                   | 修正内容                                                                     |
| -------------------------------- | ---------------------------------------------------------------------------- |
| SkillExecutor.test.ts            | L829の `console.error` スパイ → `log.error` モック検証に変更                 |
| SkillExecutor.permission.test.ts | L1459,1569の `console.info` スパイ → `log.info` モック検証に変更             |
| SkillExecutor.auth.test.ts       | L366-367の `console.log/error` スパイ → `log.debug/error` モック検証に変更   |
| SkillImportManager.error.test.ts | L323,346,376,396の `console.log` スパイ → `log.debug/error` モック検証に変更 |

#### 2.3 debugフラグの扱い

SkillImportManager.ts の `debug` プロパティは `electron-log` の `log.debug` に移行することで不要になる。

- `log.debug` は electron-log の設定（`log.transports.file.level`）でレベル制御可能
- テスト環境では `log.debug` は呼ばれるが出力されない

### Task 3: セキュリティ確認

各ログメッセージに以下が含まれていないことを確認:

- パスワード・APIキー
- PII（個人情報）
- ファイルの絶対パス（ユーザーのホームディレクトリが推測可能）

**確認結果**: 全ログメッセージは技術的なエラー情報のみであり、機密情報は含まれていない。ファイルパスのログ出力はあるが、スキルディレクトリのパスであり、セキュリティ上の問題は軽微。

## 参照資料

| 資料                        | パス                                                 |
| --------------------------- | ---------------------------------------------------- |
| Phase 1 要件定義            | phase-1-requirements.md                              |
| コード品質ルール            | .claude/rules/02-code-quality.md                     |
| SkillService.ts（参考実装） | apps/desktop/src/main/services/skill/SkillService.ts |

## 多角的チェック観点

| 観点           | 確認事項                         | 結果                        |
| -------------- | -------------------------------- | --------------------------- |
| セキュリティ   | ログに機密情報が含まれていないか | ✓ 問題なし                  |
| アーキテクチャ | electron-logのMain Process使用   | ✓ 全ファイルがMain Process  |
| テスト         | モック更新漏れのリスク           | テスト4ファイルの修正が必要 |

## 統合テスト連携【必須】

| 統合ポイント   | 内容                                                                                                     |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| 対象モジュール | SkillScanner / PermissionStore / SkillImportManager / SkillAnalyzer                                      |
| テスト連携     | `apps/desktop/src/main/services/skill/__tests__/` のユニット・統合テストで移行結果を検証                 |
| 未解決項目     | `SkillExecutor.ts` の console 4箇所は未タスク `TASK-FIX-14-2-SKILLEXECUTOR-CONSOLE-LOG-MIGRATION` で追跡 |

## 成果物

| 成果物               | パス                                        |
| -------------------- | ------------------------------------------- |
| 移行マッピング設計書 | outputs/phase-2/migration-mapping.md        |
| テスト修正設計書     | outputs/phase-2/test-modification-design.md |

## 完了条件

- [ ] 全対象箇所の移行先ログレベルが決定されている
- [ ] ファイル別の具体的な変更内容が記載されている
- [ ] テストファイルの修正方針が定義されている
- [ ] セキュリティ確認（機密情報チェック）が完了している
- [ ] electron-log モックパターンが定義されている

## 次Phase

→ Phase 3: 設計レビューゲート
