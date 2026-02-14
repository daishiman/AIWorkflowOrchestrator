# TASK-FIX-14-1-CONSOLE-LOG-MIGRATION 移行マッピング設計書

## メタ情報

| 項目       | 値                                  |
| ---------- | ----------------------------------- |
| タスク ID  | TASK-FIX-14-1-CONSOLE-LOG-MIGRATION |
| Phase      | Phase 2 - 設計                      |
| 作成日     | 2026-02-14                          |
| ステータス | 完了                                |

## ログレベルマッピング

| 変更前                                | 変更後           | 適用条件                     |
| ------------------------------------- | ---------------- | ---------------------------- |
| `console.error(...)`                  | `log.error(...)` | 致命的エラー・例外発生時     |
| `console.warn(...)`                   | `log.warn(...)`  | 非致命的な問題・スキップ処理 |
| `console.info(...)`                   | `log.info(...)`  | 正常な状態変化・操作記録     |
| `if (this.debug) console.log(...)`    | `log.debug(...)` | 開発用デバッグ情報           |
| `console.log(...)` (debug フラグなし) | `log.debug(...)` | デバッグ目的のログ出力       |

## ファイル別変更箇所マッピング

### 1. SkillScanner.ts（7箇所）

| 行番号（概算） | 変更前                               | 変更後                                          | レベル |
| -------------- | ------------------------------------ | ----------------------------------------------- | ------ |
| -              | `console.error("スキャンエラー...")` | `log.error("[SkillScanner] スキャンエラー...")` | error  |
| -              | `console.error("読み取りエラー...")` | `log.error("[SkillScanner] 読み取りエラー...")` | error  |
| -              | `console.error("解析エラー...")`     | `log.error("[SkillScanner] 解析エラー...")`     | error  |
| -              | `console.warn("スキップ...")`        | `log.warn("[SkillScanner] スキップ...")`        | warn   |
| -              | `console.warn("無効...")`            | `log.warn("[SkillScanner] 無効...")`            | warn   |
| -              | `console.error("エラー...")`         | `log.error("[SkillScanner] エラー...")`         | error  |
| -              | `console.warn/error(...)`            | `log.warn/error("[SkillScanner] ...")`          | -      |

**import 追加**: `import log from "electron-log";`

### 2. PermissionStore.ts（7箇所）

| 行番号（概算） | 変更前                               | 変更後                                             | レベル |
| -------------- | ------------------------------------ | -------------------------------------------------- | ------ |
| -              | `console.error("永続化エラー...")`   | `log.error("[PermissionStore] 永続化エラー...")`   | error  |
| -              | `console.error("読み込みエラー...")` | `log.error("[PermissionStore] 読み込みエラー...")` | error  |
| -              | `console.error("保存エラー...")`     | `log.error("[PermissionStore] 保存エラー...")`     | error  |
| -              | `console.info("権限更新...")`        | `log.info("[PermissionStore] 権限更新...")`        | info   |
| -              | `console.info("初期化...")`          | `log.info("[PermissionStore] 初期化...")`          | info   |
| -              | `console.error("エラー...")`         | `log.error("[PermissionStore] エラー...")`         | error  |
| -              | `console.info/error(...)`            | `log.info/error("[PermissionStore] ...")`          | -      |

**import 追加**: `import log from "electron-log";`

### 3. SkillImportManager.ts（12箇所）

| 行番号（概算） | 変更前                                 | 変更後                                                  | レベル |
| -------------- | -------------------------------------- | ------------------------------------------------------- | ------ |
| -              | `console.log("インポート開始...")`     | `log.debug("[SkillImportManager] インポート開始...")`   | debug  |
| -              | `console.log("検証中...")`             | `log.debug("[SkillImportManager] 検証中...")`           | debug  |
| -              | `console.error("インポートエラー...")` | `log.error("[SkillImportManager] インポートエラー...")` | error  |
| -              | `console.warn("スキップ...")`          | `log.warn("[SkillImportManager] スキップ...")`          | warn   |
| -              | `console.log("コピー中...")`           | `log.debug("[SkillImportManager] コピー中...")`         | debug  |
| -              | `console.log("完了...")`               | `log.debug("[SkillImportManager] 完了...")`             | debug  |
| -              | `console.error("コピーエラー...")`     | `log.error("[SkillImportManager] コピーエラー...")`     | error  |
| -              | `console.log("デバッグ...")`           | `log.debug("[SkillImportManager] デバッグ...")`         | debug  |
| -              | `console.error("検証エラー...")`       | `log.error("[SkillImportManager] 検証エラー...")`       | error  |
| -              | `console.log("解析...")`               | `log.debug("[SkillImportManager] 解析...")`             | debug  |
| -              | `console.warn("警告...")`              | `log.warn("[SkillImportManager] 警告...")`              | warn   |
| -              | `console.log/error/warn(...)`          | `log.debug/error/warn("[SkillImportManager] ...")`      | -      |

**import 追加**: `import log from "electron-log";`

**注記**: `this.debug` フラグでガードされた `console.log` は `log.debug` に統一する。`electron-log` のレベル制御（`log.transports.console.level` 等）でデバッグ出力の有効/無効を管理するため、`this.debug` プロパティは削除を検討する。

### 4. SkillAnalyzer.ts（1箇所）

| 行番号（概算） | 変更前                           | 変更後                                       | レベル |
| -------------- | -------------------------------- | -------------------------------------------- | ------ |
| -              | `console.error("分析エラー...")` | `log.error("[SkillAnalyzer] 分析エラー...")` | error  |

**import 追加**: `import log from "electron-log";`

## debug フラグの扱い

### 現状

`SkillImportManager.ts` において `this.debug` プロパティが存在し、以下のパターンでデバッグログを出力している:

```typescript
if (this.debug) {
  console.log("デバッグ情報...");
}
```

### 移行方針

`electron-log` の `log.debug()` に統一する。`electron-log` はログレベル制御を内蔵しているため、`this.debug` フラグによるガードは不要になる。

```typescript
// 移行前
if (this.debug) {
  console.log("デバッグ情報...");
}

// 移行後
log.debug("[SkillImportManager] デバッグ情報...");
```

`this.debug` プロパティの削除はスコープに含める。ただし、コンストラクタの引数シグネチャに影響がある場合は、後方互換性を維持しつつ段階的に対応する。

## セキュリティ確認結果

全ての移行対象ログメッセージを確認した結果:

| 確認項目         | 結果 | 詳細                                         |
| ---------------- | ---- | -------------------------------------------- |
| パスワード出力   | なし | ログメッセージにパスワードは含まれていない   |
| API キー出力     | なし | ログメッセージに API キーは含まれていない    |
| PII 出力         | なし | ログメッセージに個人識別情報は含まれていない |
| ファイルパス出力 | あり | 技術的情報のみ（スキルパス等）、問題なし     |
| エラーメッセージ | あり | 例外のメッセージ・スタックトレースのみ       |

**結論**: 全ログメッセージは技術的エラー情報のみであり、機密情報は含まれていない。移行に際してのセキュリティリスクはない。
