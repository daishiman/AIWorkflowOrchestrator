# {サービス名}Service

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
>
> **親ドキュメント**: [arch-electron-services.md](../references/arch-electron-services.md)

---

## 概要

{このサービスの目的と概要を記述}

**実装場所**: apps/desktop/src/main/services/{service}/

---

## コンポーネント構成

| コンポーネント | 種別 | 責務 |
|--------------|-----|-----|
| {Service}Service | Facade | エントリポイント、外部API提供 |
| {Component1} | 内部 | {責務} |
| {Component2} | 内部 | {責務} |
| {service}Handlers.ts | IPC | Renderer通信 |

---

## ファイル構成

| ファイル | 責務 |
|---------|-----|
| {Component1}.ts | {責務} |
| {Component2}.ts | {責務} |
| {Service}Service.ts | Facadeサービス（外部API） |
| index.ts | エクスポート |
| {service}Handlers.ts | IPCハンドラ（ipc/配下） |

---

## 型定義

| 型名 | 定義場所 | 説明 |
|-----|---------|-----|
| {型名1} | packages/shared/src/types/{service}.ts | {説明} |
| {型名2} | packages/shared/src/types/{service}.ts | {説明} |

---

## Service API

### コンストラクタオプション

| オプション | 型 | デフォルト | 説明 |
|-----------|---|---------|-----|
| {option1} | {型} | {値} | {説明} |

### メソッド一覧

| メソッド | 引数 | 戻り値 | 説明 |
|---------|-----|-------|-----|
| {method1} | {引数型} | Promise<{戻り値型}> | {説明} |
| {method2} | {引数型} | Promise<{戻り値型}> | {説明} |

---

## IPC APIチャンネル

| チャンネル | 引数 | 戻り値 | 説明 |
|-----------|-----|-------|-----|
| {service}:{action1} | {引数型} | {戻り値型} | {説明} |
| {service}:{action2} | {引数型} | {戻り値型} | {説明} |

---

## データフロー

| ステップ | 処理 | コンポーネント |
|---------|-----|--------------|
| 1 | Rendererからリクエスト | IPC Channel |
| 2 | ハンドラ受信 | {service}Handlers |
| 3 | サービス処理 | {Service}Service |
| 4 | コンポーネント処理 | {Component1/2} |
| 5 | 結果返却 | IPC Channel |

---

## セキュリティ対策

| 対策 | 実装 |
|-----|-----|
| {対策1} | {実装詳細} |
| {対策2} | {実装詳細} |

---

## エラーハンドリング

| エラーコード | 説明 | 対処法 |
|------------|-----|-------|
| {ERROR_CODE1} | {説明} | {対処法} |
| {ERROR_CODE2} | {説明} | {対処法} |

---

## 使用方法

1. {Service}Serviceをインポート
2. コンストラクタでインスタンス生成（必要に応じてオプション指定）
3. メソッドを呼び出して処理実行
4. Result型の戻り値でエラーハンドリング

---

## 関連ドキュメント

| ドキュメント | 内容 |
|------------|-----|
| [arch-electron-services.md](../references/arch-electron-services.md) | Electronサービス概要 |
| [{関連ファイル名}](./{関連ファイル名}) | {説明} |

---

## 変更履歴

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2026-01-26 | 仕様ガイドライン準拠: コード例を表形式・文章に変換 |
| 1.0.0 | {YYYY-MM-DD} | 初版作成 |
