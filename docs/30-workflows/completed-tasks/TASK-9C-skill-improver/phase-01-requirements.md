# Phase 1: 要件定義

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| Phase  | 1                                |
| タスク | TASK-9C スキル改善・自動修正機能 |
| 作成日 | 2026-02-03                       |

## 目的

スキル改善・自動修正機能の目的、スコープ、受け入れ基準を明文化する。

## 実行タスク

- 要件抽出: ユーザー要求から機能要件・非機能要件を抽出
- 受け入れ基準作成: 各要件に対して検証可能な受け入れ基準を定義
- FR/NFR分類: 機能要件と非機能要件を分類し優先度を設定

## 参照資料

| 資料名               | パス                                                                          | 説明                    |
| -------------------- | ----------------------------------------------------------------------------- | ----------------------- |
| 元タスク仕様書       | `docs/30-workflows/skill-import-agent-system/tasks/task-9c-skill-improver.md` | TASK-9C概要             |
| Claude Agent SDK仕様 | `aiworkflow-requirements: interfaces-agent-sdk-executor.md`                   | SDK API仕様             |
| スキル管理仕様       | `aiworkflow-requirements: interfaces-agent-sdk-skill.md`                      | SkillSlice・IPC統合仕様 |
| セキュリティ仕様     | `aiworkflow-requirements: security-skill-execution.md`                        | スキル実行セキュリティ  |

## 実行手順

### 1. 要件抽出

ユーザー要求から機能要件・非機能要件を抽出する。

**機能要件（FR）**:

| FR-ID | 要件                                      | 優先度 |
| ----- | ----------------------------------------- | ------ |
| FR-01 | スキル構造・品質の分析機能                | 必須   |
| FR-02 | 分析結果に基づく改善提案生成              | 必須   |
| FR-03 | 自動修正の実行（ユーザー確認/自動モード） | 必須   |
| FR-04 | プロンプト最適化機能                      | 必須   |
| FR-05 | 改善前バックアップ作成                    | 必須   |
| FR-06 | 改善結果の検証・テスト                    | 必須   |
| FR-07 | 複数バリアント生成（A/Bテスト用）         | 任意   |

**非機能要件（NFR）**:

| NFR-ID | 要件                                     | 優先度 |
| ------ | ---------------------------------------- | ------ |
| NFR-01 | 分析処理は30秒以内に完了                 | 必須   |
| NFR-02 | 改善処理中のエラーからの復旧が可能       | 必須   |
| NFR-03 | TypeScript型安全性の確保                 | 必須   |
| NFR-04 | 既存スキルサービスとの統合性             | 必須   |
| NFR-05 | Claude Agent SDK query() APIの正しい使用 | 必須   |

### 2. 受け入れ基準作成

| 要件ID | 受け入れ基準                                                |
| ------ | ----------------------------------------------------------- |
| FR-01  | SkillAnalyzer.analyze()が SkillAnalysis型を返す             |
| FR-02  | SkillAnalysis.suggestionsに Suggestion[]が含まれる          |
| FR-03  | SkillImprover.applyImprovements()が ImprovementResultを返す |
| FR-04  | PromptOptimizer.optimize()が OptimizationResultを返す       |
| FR-05  | 改善前に元ファイルのバックアップが作成される                |
| FR-06  | 改善後のスキルが正常に動作することを検証できる              |
| NFR-01 | SkillAnalyzer.analyze()の実行時間が30秒未満                 |
| NFR-02 | エラー発生時にバックアップから復元可能                      |

### 3. FR/NFR分類

上記テーブルで分類済み。

## 統合テスト連携【必須】

接続要件（API/認証/データフロー）を要件に明記する:

| 接続要件カテゴリ | 記載内容                                                   |
| ---------------- | ---------------------------------------------------------- |
| API接続          | Claude Agent SDK query() API、IPC skill:analyze/improve    |
| 認証フロー       | なし（ローカル処理）                                       |
| データフロー     | Renderer→IPC→Main(SkillAnalyzer/Improver)→ファイルシステム |

## アーキテクチャ層別要件（AIが判断）

| 層                         | 確認観点                                               |
| -------------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | 分析結果表示UI、改善提案一覧、実行確認ダイアログ       |
| バックエンド（Main）       | SkillAnalyzer、SkillImprover、PromptOptimizer サービス |
| IPC通信                    | skill:analyze、skill:improve、skill:optimize チャネル  |
| セキュリティ               | ファイル操作の制限、バックアップの保護                 |
| データ                     | スキルファイルの読み書き、分析結果のキャッシュ         |

## 成果物

| 成果物       | パス                                         | 説明             |
| ------------ | -------------------------------------------- | ---------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能・非機能要件 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC定義           |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲         |

## 完了条件

- [ ] 全要件が抽出されている（FR 7件、NFR 5件）
- [ ] 各要件に受け入れ基準がある
- [ ] FR/NFRが分類されている
- [ ] 接続要件（API/認証/データフロー）が明記されている
- [ ] アーキテクチャ層別の要件が整理されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 機能要件（FR）抽出（7件）
3. 非機能要件（NFR）抽出（5件）
4. 受け入れ基準作成
5. 接続要件・データフロー定義
6. 成果物作成（要件定義書、受け入れ基準、スコープ定義）
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] FR 7件、NFR 5件が抽出されていることを確認
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-import-agent-system/tasks/TASK-9C-skill-improver --phase 1
```

---

## 次のPhase

Phase 2: 設計
