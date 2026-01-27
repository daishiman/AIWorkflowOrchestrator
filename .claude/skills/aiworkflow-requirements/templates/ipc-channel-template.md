# {機能名} IPCチャンネル定義

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
>
> **親ドキュメント**: [security-electron-ipc.md](../references/security-electron-ipc.md)

---

## 概要

{このIPCチャンネルの目的と概要を記述}

---

## チャンネル定義

**定義場所**: apps/desktop/src/main/infrastructure/ipc/channels.ts

### チャンネル定数

| 定数名 | チャンネル値 | 説明 |
|-------|------------|-----|
| {ACTION1} | {prefix}:{action1} | {説明} |
| {ACTION2} | {prefix}:{action2} | {説明} |

---

## IPCチャンネル一覧

| チャンネル | 方向 | 引数 | 戻り値 | 説明 |
|-----------|-----|-----|-------|-----|
| {prefix}:{action1} | Main ← Renderer | {引数型} | {戻り値型} | {説明} |
| {prefix}:{action2} | Main → Renderer | {引数型} | - | {説明} |

---

## Preload API

**定義場所**: apps/desktop/src/preload/index.ts

### 公開メソッド

| メソッド名 | 種別 | 引数 | 戻り値 | 説明 |
|-----------|-----|-----|-------|-----|
| {method1} | invoke | {引数型} | Promise<{戻り値型}> | {説明} |
| {method2} | on | callback | () => void (unsubscribe) | {説明} |

### Window型定義

**定義場所**: apps/desktop/src/renderer/types/window.d.ts

| インターフェース | プロパティ | 型 |
|---------------|---------|---|
| {Prefix}API | {method1} | (引数) => Promise<戻り値> |
| {Prefix}API | {method2} | (callback) => () => void |
| Window | {prefix}API | {Prefix}API |

---

## Main Processハンドラ

**定義場所**: apps/desktop/src/main/ipc/{prefix}Handlers.ts

### ハンドラ登録

| 関数名 | 登録チャンネル | 処理内容 |
|-------|-------------|---------|
| register{Prefix}Handlers | 全チャンネル | ハンドラ一括登録 |

### セキュリティラッパー

全ハンドラは`withValidation`ラッパーを使用し、Sender検証と引数バリデーションを実施する。

---

## セキュリティ要件

| 要件 | 実装 | 確認方法 |
|-----|-----|---------|
| ホワイトリスト | {PREFIX}_CHANNELS定数で管理 | 定義外チャンネルはエラー |
| Sender検証 | withValidation()ラッパー | DevTools/外部からの拒否 |
| 引数検証 | Zodスキーマ | バリデーションテスト |
| 型安全性 | Result<T>型で統一 | TypeScript型チェック |

---

## 使用方法

### Rendererからの呼び出し

1. `window.{prefix}API.{method1}(引数)`でMain Processを呼び出し
2. 戻り値の`success`プロパティで成功/失敗を判定
3. 成功時は`data`、失敗時は`error`を参照

### イベント購読

1. `window.{prefix}API.{method2}(callback)`で購読開始
2. 戻り値の関数を保持
3. コンポーネントアンマウント時に戻り値関数を実行してクリーンアップ

---

## 関連ドキュメント

| ドキュメント | 内容 |
|------------|-----|
| [security-electron-ipc.md](../references/security-electron-ipc.md) | IPCセキュリティ |
| [arch-ipc-persistence.md](../references/arch-ipc-persistence.md) | IPC・永続化パターン |

---

## 変更履歴

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2026-01-26 | 仕様ガイドライン準拠: コード例を表形式・文章に変換 |
| 1.0.0 | {YYYY-MM-DD} | 初版作成 |
