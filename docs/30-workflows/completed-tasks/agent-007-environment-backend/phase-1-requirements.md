# Phase 1: 要件定義

## メタ情報

| 項目   | 値                            |
| ------ | ----------------------------- |
| Phase  | 1                             |
| 機能名 | agent-007-environment-backend |
| 作成日 | 2026-01-13                    |

## 目的

タスクの目的、スコープ、受け入れ基準を明文化する。

## 実行タスク

- 要件抽出: ユーザー要求から機能要件・非機能要件を抽出
- 受け入れ基準作成: 各要件に対してGiven-When-Then形式で検証可能な受け入れ基準を定義
- FR/NFR分類: 機能要件と非機能要件を分類し優先度を設定

## 参照資料

| 資料名             | パス                                                                             | 説明                        |
| ------------------ | -------------------------------------------------------------------------------- | --------------------------- |
| 未タスク指示書     | `docs/30-workflows/unassigned-task/task-agent-07-environment-backend.md`         | 元の要求                    |
| セキュリティ実装   | `.claude/skills/aiworkflow-requirements/references/security-implementation.md`   | XSS対策・入力バリデーション |
| 入力バリデーション | `.claude/skills/aiworkflow-requirements/references/security-input-validation.md` | サニタイズ原則              |
| アーキテクチャ     | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`     | スキル管理サービス設計      |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料           | パス                                                                             | 内容                        |
| ------------------ | -------------------------------------------------------------------------------- | --------------------------- |
| セキュリティ実装   | `.claude/skills/aiworkflow-requirements/references/security-implementation.md`   | XSS対策・入力バリデーション |
| 入力バリデーション | `.claude/skills/aiworkflow-requirements/references/security-input-validation.md` | サニタイズ原則              |
| Electron IPC       | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`     | Electron IPC設計            |

**仕様検索**: `node .claude/skills/aiworkflow-requirements/scripts/search-spec.mjs "sanitize"`

## 実行手順

### 1. 要件抽出

ユーザー要求から機能要件・非機能要件を抽出する。

#### 機能要件（FR）

| ID    | 要件                                         | 優先度 |
| ----- | -------------------------------------------- | ------ |
| FR-01 | HTMLコードブロックをエージェント出力から抽出 | 高     |
| FR-02 | Markdownコードブロックを抽出                 | 高     |
| FR-03 | 複数のコードブロックを順序付きで抽出         | 高     |
| FR-04 | HTMLコンテンツをサニタイズ（XSS対策）        | 高     |
| FR-05 | 抽出コンテンツを一時ファイルとして保存       | 中     |
| FR-06 | アプリ終了時に一時ファイルをクリーンアップ   | 中     |
| FR-07 | IPC経由でプレビューコンテンツを取得          | 高     |

#### 非機能要件（NFR）

| ID     | 要件                                    | 優先度 |
| ------ | --------------------------------------- | ------ |
| NFR-01 | XSS攻撃を防ぐセキュリティ対策           | 高     |
| NFR-02 | 一時ファイルのパーミッション管理（600） | 高     |
| NFR-03 | 一時ファイルの確実なクリーンアップ      | 中     |
| NFR-04 | パフォーマンス：大きなコンテンツの処理  | 中     |

### 2. 受け入れ基準作成

各要件に対して検証可能な受け入れ基準を定義する。

````gherkin
Feature: 実行環境管理バックエンド

Scenario: HTMLコードブロックを抽出できる
  Given エージェント出力に以下が含まれる:
    ```html
    <div>Hello World</div>
    ```
  When ContentExtractorで処理する
  Then HTML部分が抽出される
  And タイプが "html" と判定される

Scenario: 複数のコードブロックを抽出できる
  Given エージェント出力に複数のコードブロックがある
  When ContentExtractorで処理する
  Then すべてのコードブロックが抽出される
  And 各コードブロックに順序番号が付与される

Scenario: HTMLがサニタイズされる
  Given 抽出されたHTMLに<script>タグが含まれる
  When ContentSanitizerで処理する
  Then <script>タグが除去される
  And onclick等のイベントハンドラが除去される

Scenario: 危険なタグが除去される
  Given 抽出されたHTMLに<iframe>タグが含まれる
  When ContentSanitizerで処理する
  Then <iframe>タグが除去される
  And <object>、<embed>タグも除去される

Scenario: 一時ファイルとして保存できる
  Given 抽出されたコンテンツがある
  When TempFileManagerで保存する
  Then 一時ディレクトリにファイルが作成される
  And ファイルパスが返される

Scenario: 一時ファイルが適切にクリーンアップされる
  Given 一時ファイルが作成されている
  When アプリケーションが終了する
  Then 一時ファイルが削除される

Scenario: IPC経由でプレビューコンテンツを取得できる
  Given エージェント出力が処理済みである
  When agent:get-preview-contentを呼び出す
  Then 抽出・サニタイズ済みのコンテンツが返される

Scenario: コードブロックなしの場合
  Given エージェント出力にコードブロックがない
  When ContentExtractorで処理する
  Then 空の配列が返される
````

### 3. FR/NFR分類

機能要件と非機能要件を分類し、優先度を設定する。

| 分類   | 高優先度 | 中優先度 | 低優先度 |
| ------ | -------- | -------- | -------- |
| 機能   | 5件      | 2件      | 0件      |
| 非機能 | 2件      | 2件      | 0件      |

## 統合テスト連携【必須】

接続要件（IPC/Rendererへの転送/コンテンツ抽出）を要件に明記する:

| 接続要件カテゴリ      | 記載内容                                         |
| --------------------- | ------------------------------------------------ |
| IPC接続               | agent:extract-content, agent:get-preview-content |
| Mainプロセス→Renderer | サニタイズ済みコンテンツの転送                   |
| データフロー          | 出力→抽出→サニタイズ→保存→IPC→Renderer表示       |

## 成果物

| 成果物       | パス                                         | 説明             |
| ------------ | -------------------------------------------- | ---------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能・非機能要件 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC定義           |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲         |

## 完了条件

- [ ] 全要件が抽出されている（FR: 7件、NFR: 4件）
- [ ] 各要件に受け入れ基準がある（Given-When-Then形式）
- [ ] FR/NFRが分類されている
- [ ] 接続要件（IPC/Rendererへの転送）が明記されている
- [ ] セキュリティ要件（XSS対策、パーミッション）が明確化されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 機能要件の抽出
3. 非機能要件の抽出
4. 受け入れ基準の作成
5. 統合テスト連携の記載
6. 成果物の作成・配置
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/agent-007-environment-backend --phase 1
```

## 次のPhase

Phase 2: 設計
