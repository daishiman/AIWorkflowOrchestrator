# Electron Main Process サービス / core specification

> 親仕様書: [arch-electron-services.md](arch-electron-services.md)
> 役割: core specification

## Environment Backend サービス

### 概要

Environment BackendはElectronのMain Processで動作し、エージェント出力からHTMLコードブロックを抽出し、XSS対策のサニタイズを行い、安全なプレビュー機能を提供する。Facadeパターンを採用し、外部からは単一のサービスインターフェースを提供する。

**実装場所**: `apps/desktop/src/main/services/environment/`

### コンポーネント構成

Environment BackendはMain Process（Electron）上で動作し、以下の階層構造を持つ。

| 階層 | コンポーネント     | 役割                           |
| ---- | ------------------ | ------------------------------ |
| L1   | EnvironmentService | Facade（外部エントリポイント） |
| L2   | ContentExtractor   | コードブロック抽出             |
| L2   | ContentSanitizer   | HTMLサニタイズ（DOMPurify）    |
| L2   | TempFileManager    | 一時ファイル管理               |
| L1   | IPC Handlers       | Renderer通信                   |
| L2   | agentHandlers.ts   | IPCハンドラ実装                |

### ファイル構成

| ファイル                | 責務                           |
| ----------------------- | ------------------------------ |
| `ContentExtractor.ts`   | Markdownからコードブロック抽出 |
| `ContentSanitizer.ts`   | DOMPurifyによるXSS対策         |
| `TempFileManager.ts`    | 一時ファイル作成・管理・削除   |
| `EnvironmentService.ts` | Facadeサービス（外部API）      |
| `index.ts`              | エクスポート                   |
| `agentHandlers.ts`      | IPCハンドラ（ipc/配下）        |

### 型定義

| 型名               | 定義場所                             | 説明                         |
| ------------------ | ------------------------------------ | ---------------------------- |
| `ContentType`      | `packages/shared/src/types/agent.ts` | サポートするコンテンツタイプ |
| `ExtractedContent` | `packages/shared/src/types/agent.ts` | 抽出されたコンテンツ         |
| `SanitizedContent` | `packages/shared/src/types/agent.ts` | サニタイズ済みコンテンツ     |
| `PreviewContent`   | `packages/shared/src/types/agent.ts` | プレビュー用コンテンツ       |

### IPC APIチャネル

| チャネル                | 引数                  | 戻り値                   | 説明                                   |
| ----------------------- | --------------------- | ------------------------ | -------------------------------------- |
| `agent:extract-content` | `text: string`        | `PreviewContent`         | テキストからコンテンツ抽出・サニタイズ |
| `agent:get-preview`     | `executionId: string` | `PreviewContent \| null` | プレビュー用コンテンツ取得             |
| `agent:cleanup-temp`    | なし                  | `void`                   | 一時ファイルクリーンアップ             |

### セキュリティ対策

**XSS防止（ContentSanitizer）**:

- scriptタグ除去
- iframeタグ除去
- イベントハンドラ除去（onclick, onerror, onload等）
- javascript:プロトコル除去
- data:プロトコル制限

**ファイルセキュリティ（TempFileManager）**:

- ファイルパーミッション: 0o600（オーナーのみ）
- UUIDベースファイル名（推測不可）
- 自動クリーンアップ機構

---

## スキル公開・配布サービス境界（TASK-SKILL-LIFECYCLE-08 / spec_created）

TASK-SKILL-LIFECYCLE-08 で Main Process 側サービス境界を設計した。実装は未タスク化済み。

### サービス契約

| サービス | 主責務 | メソッド |
| --- | --- | --- |
| `SkillRegistryService` | 公開メタデータの登録・更新・停止・削除 | `register`, `update`, `deprecate`, `remove`, `getDependents` |
| `SkillDistributionService` | スキル配布操作 | `importSkill`, `exportSkill`, `forkSkill`, `shareSkill` |
| `CompatibilityChecker` | semver と schema 差分の互換性評価 | `checkVersion` |
| `PublishReadinessChecker` | 安全性/品質入力から公開可否判定 | `check` |

### 依存関係ルール（P61）

- IPC handler は concrete class ではなく上記 interface を注入する。
- `PublishReadinessChecker` は `SafetyGateResult` と `ObservabilityMetrics` を adapter 経由で受け取る。
- `CompatibilityChecker` は semver 比較と breaking change 集約を分離する。

### 実装移行の未タスク

- `UT-SKILL-LIFECYCLE-08-TYPE-IMPL`
- `UT-SKILL-LIFECYCLE-08-IPC-TEST`
