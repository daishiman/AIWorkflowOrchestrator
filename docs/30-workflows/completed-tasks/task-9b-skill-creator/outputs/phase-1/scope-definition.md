# Phase 1 成果物: スコープ定義

## メタ情報

| 項目       | 内容         |
| ---------- | ------------ |
| タスクID   | TASK-9B      |
| Phase      | 1            |
| 成果物     | スコープ定義 |
| 作成日     | 2026-02-26   |
| ステータス | 完了         |

## 含むもの（In-Scope）

### スキル定義ファイル（`~/.aiworkflow/skills/skill-creator/` 配下）

| ファイル                        | 内容                          | 新規/修正 |
| ------------------------------- | ----------------------------- | --------- |
| `SKILL.md`                      | スキル基本定義                | 修正      |
| `agents/hearing-facilitator.md` | 対話的ヒアリングエージェント  | 新規      |
| `agents/task-generator.md`      | タスク仕様書生成エージェント  | 新規      |
| `agents/code-generator.md`      | コード生成エージェント        | 新規      |
| `agents/api-integrator.md`      | API連携コード生成エージェント | 新規      |
| `agents/validator.md`           | 検証エージェント              | 新規      |
| `references/task-template.md`   | タスク仕様書テンプレート      | 新規      |
| `references/skill-structure.md` | スキル構造ガイド              | 新規      |
| `references/api-patterns.md`    | API連携パターン集             | 新規      |
| `references/security-guide.md`  | 認証・機密情報管理ガイド      | 新規      |

### バックエンドサービス

| ファイル                                                      | 内容                         | 新規/修正 |
| ------------------------------------------------------------- | ---------------------------- | --------- |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | Facadeサービス（メイン実装） | 修正      |

### IPC / Preload

| ファイル                                            | 変更内容                       | 新規/修正 |
| --------------------------------------------------- | ------------------------------ | --------- |
| `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` | skill-creator用ハンドラー追加  | 修正      |
| `apps/desktop/src/preload/skill-creator-api.ts`     | skill-creator用APIメソッド追加 | 修正      |
| `apps/desktop/src/preload/channels.ts`              | 新規チャンネル定数追加         | 修正      |
| `packages/shared/src/types/skillCreator.ts`         | skill-creator関連型定義追加    | 修正      |

### 新規追加IPC チャンネル（12チャンネル）

| チャンネル名        | 方向            | 用途              |
| ------------------- | --------------- | ----------------- |
| `skill:create:chat` | Renderer → Main | 対話的スキル作成  |
| `skill:create:api`  | Renderer → Main | API連携スキル生成 |
| `skill:improve`     | Renderer → Main | スキル改善        |
| `skill:execute`     | Renderer → Main | タスク実行        |
| `skill:use`         | Renderer → Main | 即時使用          |
| `skill:chain`       | Renderer → Main | チェーン作成      |
| `skill:fork`        | Renderer → Main | スキルフォーク    |
| `skill:share`       | Renderer → Main | スキル共有        |
| `skill:schedule`    | Renderer → Main | スケジュール設定  |
| `skill:debug`       | Renderer → Main | デバッグ実行      |
| `skill:docs`        | Renderer → Main | ドキュメント生成  |
| `skill:stats`       | Renderer → Main | 使用統計          |

### テストファイル

| ファイル                                  | 内容               |
| ----------------------------------------- | ------------------ |
| `SkillCreatorService.test.ts`             | サービステスト拡張 |
| `HearingFacilitator.test.ts`              | 新規テスト         |
| `TaskGenerator.test.ts`                   | 新規テスト         |
| `CodeGenerator.test.ts`                   | 新規テスト         |
| `Validator.test.ts`                       | 新規テスト         |
| `skillCreatorHandlers.validation.test.ts` | 新規テスト         |
| `SkillCreatorService.integration.test.ts` | 統合テスト拡張     |

---

## 含まないもの（Out-of-Scope）

| 除外項目                                            | 理由                                               |
| --------------------------------------------------- | -------------------------------------------------- |
| Renderer コンポーネント（React UI）の新規画面作成   | ChatPanelの既存UIを使用                            |
| 外部SaaS連携の実API呼び出し                         | GitHub Gist APIのモック実装は含む、実APIは別タスク |
| スケジュール実行のデーモン/バックグラウンドプロセス | 設定保存のみ（実行エンジンは別タスク）             |
| 統計データのSQLiteスキーマ作成                      | インメモリ/JSON形式で初期実装                      |
| 既存SkillService / SkillExecutor の内部ロジック変更 | 責務境界を維持、外部インターフェースのみ使用       |
| pdf/html形式のドキュメント出力                      | Markdown出力のみ初期実装                           |

---

## 既存コードとの責務境界

### SkillCreatorService vs SkillService

| 操作             | SkillCreatorService | SkillService |
| ---------------- | ------------------- | ------------ |
| スキル生成       | 担当                | -            |
| スキル改善       | 担当                | -            |
| スキルフォーク   | 担当                | -            |
| スキルインポート | useSkill()から委譲  | 担当         |
| スキル削除       | -                   | 担当         |
| スキル一覧       | -                   | 担当         |
| スキルスキャン   | -                   | 担当         |

### SkillCreatorService vs SkillExecutor

| 操作         | SkillCreatorService | SkillExecutor |
| ------------ | ------------------- | ------------- |
| タスク実行   | 担当（execute）     | -             |
| スキル実行   | -                   | 担当          |
| デバッグ実行 | 担当（debug）       | -             |
| 進捗通知     | 担当                | 担当          |

---

## 影響範囲分析

### 直接変更ファイル（5ファイル）

1. `SkillCreatorService.ts` — 7つの新メソッド追加
2. `skillCreatorHandlers.ts` — 7つの新IPCハンドラ追加
3. `skill-creator-api.ts` — 7つの新Preload APIメソッド追加
4. `channels.ts` — 7つの新チャネル定数追加
5. `packages/shared/src/types/skillCreator.ts` — 6つの新型定義追加

### 間接影響ファイル（確認のみ、変更なし）

1. `skillCreatorHandlers.ts`（既存ハンドラの回帰確認）
2. `preload/index.ts`（electronAPIへの追加確認）
3. `SkillService.ts`（importSkills()インターフェース確認）
