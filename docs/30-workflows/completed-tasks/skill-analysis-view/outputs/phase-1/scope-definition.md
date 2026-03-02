# スコープ定義: SkillAnalysisView

## メタ情報

| 項目     | 値         |
| -------- | ---------- |
| タスクID | TASK-10A-B |
| 作成日   | 2026-03-02 |
| Phase    | 1          |

---

## スコープ内（In Scope）

### コンポーネント

| コンポーネント    | Atomic Designレベル | 説明                                                                                                              |
| ----------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------- |
| SkillAnalysisView | organism            | スキル分析画面の最上位コンポーネント。分析実行・結果表示・改善適用を統合                                          |
| ScoreDisplay      | molecule            | 総合スコア（0-100）の円形プログレスバーまたは数値＋カラーインジケータ表示、カテゴリ別スコアの水平バーチャート表示 |
| SuggestionList    | molecule            | 改善提案のリスト表示。優先度別（high/medium/low）グループ化、チェックボックス選択、自動修正可能フィルタ           |
| RiskPanel         | molecule            | リスク情報の表示。レベル別（critical/high/medium/low）色分け、カテゴリ・説明・影響・緩和策                        |

### カスタムフック

| フック名         | 説明                                                                                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| useSkillAnalysis | スキル分析ロジックをカプセル化するカスタムフック。analyze/applyImprovements/autoImproveの呼び出し、状態管理（5つのuseState）、エラーハンドリングを内包 |

### 既存IPCチャネル経由のAPI呼び出し

| API呼び出し                                       | IPCチャネル                   | 説明                   |
| ------------------------------------------------- | ----------------------------- | ---------------------- |
| `skill.analyze(skillName)`                        | `IPC_CHANNELS.SKILL_ANALYZE`  | スキル分析実行         |
| `skill.applyImprovements(skillName, suggestions)` | `IPC_CHANNELS.SKILL_IMPROVE`  | 選択した改善提案の適用 |
| `skill.autoImprove(skillName)`                    | `IPC_CHANNELS.SKILL_OPTIMIZE` | 全自動改善実行         |

### テスト

| テスト種別           | 対象                                                          |
| -------------------- | ------------------------------------------------------------- |
| コンポーネントテスト | SkillAnalysisView / ScoreDisplay / SuggestionList / RiskPanel |
| フックテスト         | useSkillAnalysis                                              |
| IPCモックテスト      | skill-api.ts のモック化（safeInvoke → 直接戻り値返却）        |
| アクセシビリティ     | axe-core による WCAG 2.1 AA 自動チェック                      |

### デザイン対応

| 対応項目         | 説明                                                                 |
| ---------------- | -------------------------------------------------------------------- |
| ダークモード     | CSS変数ベースのデザイントークンでライト/ダーク両モードに対応         |
| アクセシビリティ | WCAG 2.1 AA準拠（ARIA属性、キーボード操作、コントラスト比4.5:1以上） |
| Apple HIG準拠    | 8pxグリッド、角丸8-12px、200-300msアニメーション                     |

---

## スコープ外（Out of Scope）

| 項目                                    | 理由                                                                                                                 |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| SkillAnalyzer本体（バックエンド）の修正 | TASK-9Cで完成済み。バックエンドのロジック変更は行わない                                                              |
| SkillImprover本体（バックエンド）の修正 | TASK-9Cで完成済み。バックエンドのロジック変更は行わない                                                              |
| 新規IPCチャネルの追加                   | skill:analyze/improve/optimize の3チャネルは既に定義済み。新規チャネルの追加は不要                                   |
| Zustand Store追加                       | SkillAnalysisViewはuseStateでローカルに完結する。他コンポーネントとの状態共有が不要なため、Zustand Storeは使用しない |
| E2Eテスト                               | Phase 11（手動テスト）で対応する。Playwright等によるE2Eテストは本タスクのスコープ外                                  |
| スキル一覧画面の修正                    | TASK-10A-A（SkillManagementPanel）の範囲。本タスクと独立して実装可能                                                 |
| プロンプト最適化バリアント生成          | skill:optimize:variants/evaluate は今回のUIスコープ外                                                                |
| 統合ダッシュボード                      | TASK-10A-D（統合タスク）の範囲。本タスク完了後に着手                                                                 |
| データベーススキーマ変更                | 分析結果の永続化は行わない（オンデマンド実行のみ）                                                                   |

---

## 依存関係

| 依存先       | タスクID   | 状態   | 依存内容                                                 |
| ------------ | ---------- | ------ | -------------------------------------------------------- |
| バックエンド | TASK-9C    | 完成済 | SkillAnalyzer/SkillImprover のサービス実装               |
| 型定義       | TASK-9C    | 完成済 | `packages/shared/src/types/skill-improver.ts`            |
| IPCチャネル  | TASK-9C    | 完成済 | `channels.ts` に SKILL_ANALYZE/IMPROVE/OPTIMIZE 定義済み |
| デザイン基盤 | TASK-UI-00 | 完成済 | デザイントークン（CSS変数）                              |

---

## 影響範囲

| ファイル/ディレクトリ                            | 変更種別 | 説明                                       |
| ------------------------------------------------ | -------- | ------------------------------------------ |
| `apps/desktop/src/renderer/components/skill/`    | 新規     | SkillAnalysisView系コンポーネント          |
| `apps/desktop/src/renderer/hooks/`               | 新規     | useSkillAnalysis カスタムフック            |
| `apps/desktop/src/preload/skill-api.ts`          | 修正     | analyze/applyImprovements/autoImprove 追加 |
| `apps/desktop/src/preload/types.ts`              | 修正     | SkillAPI型定義にメソッド追加               |
| `apps/desktop/src/main/ipc/` (skill関連ハンドラ) | 修正     | 分析/改善ハンドラの接続                    |

---

## リスク

| リスク                                         | 影響度 | 発生確率 | 対策                                                            |
| ---------------------------------------------- | ------ | -------- | --------------------------------------------------------------- |
| バックエンドAPIの応答が遅い                    | 中     | 中       | ローディング表示（スケルトン/スピナー）とタイムアウト処理を実装 |
| 分析結果のデータ量が大きい                     | 低     | 低       | スクロール可能なリスト表示で対応                                |
| IPC引数の型不整合（P44パターン）               | 高     | 中       | Preload API型定義とMain Processハンドラの引数型を照合する       |
| IPC引数のtrimバリデーション漏れ（P42パターン） | 中     | 中       | 3段バリデーション（型チェック → 空文字列 → trim空文字列）を適用 |
| HTMLAttributes型衝突（P46パターン）            | 低     | 低       | Omit<React.HTMLAttributes, "conflictingProp"> で衝突属性を除外  |
