# TASK-9C スコープ定義

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| タスク | TASK-9C スキル改善・自動修正機能 |
| 作成日 | 2026-02-03                       |
| Phase  | 1                                |

---

## スコープ内（In Scope）

### 1. サービス実装

| コンポーネント  | 説明                                     | ファイルパス                                              |
| --------------- | ---------------------------------------- | --------------------------------------------------------- |
| SkillAnalyzer   | スキルの静的分析とAI分析を実行           | `apps/desktop/src/main/services/skill/SkillAnalyzer.ts`   |
| SkillImprover   | 分析結果に基づく改善を適用               | `apps/desktop/src/main/services/skill/SkillImprover.ts`   |
| PromptOptimizer | プロンプトの最適化・評価・バリアント生成 | `apps/desktop/src/main/services/skill/PromptOptimizer.ts` |

### 2. 型定義

| 型名               | 説明           | ファイルパス                                  |
| ------------------ | -------------- | --------------------------------------------- |
| SkillAnalysis      | 分析結果       | `packages/shared/src/types/skill-improver.ts` |
| AnalysisCategory   | 分析カテゴリ   | `packages/shared/src/types/skill-improver.ts` |
| Suggestion         | 改善提案       | `packages/shared/src/types/skill-improver.ts` |
| Risk               | リスク評価     | `packages/shared/src/types/skill-improver.ts` |
| ImprovementResult  | 改善結果       | `packages/shared/src/types/skill-improver.ts` |
| ImprovementOptions | 改善オプション | `packages/shared/src/types/skill-improver.ts` |
| OptimizationResult | 最適化結果     | `packages/shared/src/types/skill-improver.ts` |
| PromptEvaluation   | プロンプト評価 | `packages/shared/src/types/skill-improver.ts` |

### 3. IPCチャネル

| チャネル                | リクエスト                        | レスポンス         |
| ----------------------- | --------------------------------- | ------------------ |
| skill:analyze           | { skillName: string }             | SkillAnalysis      |
| skill:improve           | { skillName, options }            | ImprovementResult  |
| skill:optimize          | { prompt: string }                | OptimizationResult |
| skill:optimize:variants | { prompt: string, count: number } | string[]           |
| skill:optimize:evaluate | { prompt: string }                | PromptEvaluation   |

### 4. IPCハンドラー修正

| ファイル                                     | 修正内容                   |
| -------------------------------------------- | -------------------------- |
| `apps/desktop/src/main/ipc/skillHandlers.ts` | 5つの新規IPCハンドラー追加 |

### 5. 機能

| 機能              | 詳細                                                     |
| ----------------- | -------------------------------------------------------- |
| 静的分析          | SKILL.md構造チェック、Frontmatter検証、allowed_tools検証 |
| AI分析            | Claude Agent SDK query()を使用したスキル品質評価         |
| プロンプト改善    | 明確性・具体性・網羅性の向上                             |
| 構造改善          | ファイル分割・モジュール化の提案と適用                   |
| セキュリティ改善  | 危険な操作の制限、入力検証の追加                         |
| ドキュメント改善  | 使用例・パラメータ説明・注意事項の追加                   |
| バックアップ/復元 | 改善前のスキルディレクトリのバックアップと復元           |
| プロンプト評価    | プロンプト品質のスコアリングとフィードバック             |
| バリアント生成    | A/Bテスト用の複数プロンプトバリアント生成                |

---

## スコープ外（Out of Scope）

### 将来タスクとして検討

| 項目                             | 理由                              | 将来タスク候補 |
| -------------------------------- | --------------------------------- | -------------- |
| 分析結果表示UI                   | Rendererプロセス実装が別タスク    | TASK-10A       |
| 改善提案一覧UI                   | Rendererプロセス実装が別タスク    | TASK-10A       |
| 改善実行確認ダイアログ           | UIコンポーネント実装が別タスク    | TASK-10A       |
| 改善履歴の永続化                 | データベース/ストレージ設計が必要 | 未定           |
| A/Bテスト実行・結果比較機能      | 実験管理システムが必要            | 未定           |
| スキル品質ダッシュボード         | 統計・可視化機能の実装            | TASK-10A       |
| 複数スキルの一括分析・改善       | バッチ処理の設計が必要            | 未定           |
| スキル間の依存関係分析           | 複雑なグラフ分析が必要            | 未定           |
| 改善結果のレポート出力（PDF/MD） | レポート生成機能が別タスク        | 未定           |
| skillSlice状態管理の拡張         | Rendererプロセスが別タスク        | TASK-10A       |

---

## 技術的制約

| 制約                     | 詳細                                                |
| ------------------------ | --------------------------------------------------- |
| Claude Agent SDK依存     | AI分析・改善にはClaude Agent SDKのquery() APIを使用 |
| ファイルシステムアクセス | スキルディレクトリ（.claude/skills/）内のみ操作可能 |
| バックアップ保存場所     | 同一スキルディレクトリ内の.backupサブディレクトリ   |
| 非同期処理               | すべてのサービスメソッドはPromiseを返す             |
| Electronアーキテクチャ   | Main Process内でのみサービスを実行                  |

---

## リスクと緩和策

| リスク                                       | 影響度 | 緩和策                                     |
| -------------------------------------------- | ------ | ------------------------------------------ |
| SDK応答のJSONパースエラー                    | 中     | try-catchと適切なエラーメッセージ          |
| 改善適用中のファイル破損                     | 高     | バックアップ必須、エラー時自動ロールバック |
| 分析処理の30秒超過                           | 中     | タイムアウト設定、処理の最適化             |
| 不正なスキル名による任意ディレクトリアクセス | 高     | パス検証、サニタイゼーション               |

---

## 成果物一覧

| 成果物               | パス                                                      |
| -------------------- | --------------------------------------------------------- |
| SkillAnalyzer.ts     | `apps/desktop/src/main/services/skill/SkillAnalyzer.ts`   |
| SkillImprover.ts     | `apps/desktop/src/main/services/skill/SkillImprover.ts`   |
| PromptOptimizer.ts   | `apps/desktop/src/main/services/skill/PromptOptimizer.ts` |
| skill-improver.ts    | `packages/shared/src/types/skill-improver.ts`             |
| skillHandlers.ts修正 | `apps/desktop/src/main/ipc/skillHandlers.ts`              |
| ユニットテスト       | `apps/desktop/src/main/services/skill/__tests__/`         |
| 統合テスト           | `apps/desktop/src/main/ipc/__tests__/`                    |

---

## 作成日時

- **作成**: 2026-02-03
- **作成者**: AI (Phase 1 自動生成)
