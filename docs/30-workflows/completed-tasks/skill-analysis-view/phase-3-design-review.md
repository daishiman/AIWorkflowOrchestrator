# Phase 3: 設計レビューゲート

## メタ情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| Phase    | 3                                     |
| 機能名   | SkillAnalysisView（スキル分析ビュー） |
| タスクID | TASK-10A-B                            |
| 作成日   | 2026-03-02                            |

## 目的

実装開始前に Phase 1（要件定義）および Phase 2（設計）の成果物の妥当性を検証する。要件カバレッジ、設計整合性、IPC契約整合性、Pitfall対策、アクセシビリティの全観点でレビューを実施する。

## 実行タスク

- 要件カバレッジ検証: Phase 1 の全FRがPhase 2 の設計に反映されているか確認
- 設計整合性検証: コンポーネント設計がAtomic Design原則に従っているか確認
- IPC契約整合性検証: Preload API/Main Handler/型定義の3層整合性を確認
- Pitfall対策検証: P42/P46/P47対策が設計に含まれているか確認
- アクセシビリティ検証: WCAG 2.1 AA準拠設計の確認
- 状態管理検証: ローカルstate設計の妥当性確認

## 参照資料

| 資料名             | パス                                         | 説明          |
| ------------------ | -------------------------------------------- | ------------- |
| 要件定義書         | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`     | Phase 1成果物 |
| スコープ定義       | `outputs/phase-1/scope-definition.md`        | Phase 1成果物 |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`     | Phase 2成果物 |
| コンポーネント設計 | `outputs/phase-2/component-design.md`        | Phase 2成果物 |
| API仕様            | `outputs/phase-2/api-specification.md`       | Phase 2成果物 |
| 既知の落とし穴     | `.claude/rules/06-known-pitfalls.md`         | Pitfall一覧   |

## 判定基準

| 判定              | 条件                 | 対応                    |
| ----------------- | -------------------- | ----------------------- |
| PASS              | 全観点で問題なし     | Phase 4へ進行           |
| MINOR             | 軽微な指摘あり       | 指摘対応後Phase 4へ進行 |
| MAJOR（要件問題） | 要件に重大な漏れあり | Phase 1へ戻る           |
| MAJOR（設計問題） | 設計に重大な問題あり | Phase 2へ戻る           |

## 実行手順

### 1. 要件カバレッジ検証

Phase 1 の全FR/NFRがPhase 2の設計に反映されているか確認する。

| Phase 1 要件                 | Phase 2 対応設計                                                 | カバレッジ確認 |
| ---------------------------- | ---------------------------------------------------------------- | -------------- |
| FR-1: 分析実行               | useSkillAnalysis.runAnalysis() + AnalysisView マウント時呼び出し | [x]            |
| FR-2-1: 総合スコア表示       | ScoreDisplay.overallScore + 円形インジケータ                     | [x]            |
| FR-2-2: スコア色分け         | scoreVariantStyles Record + getScoreVariant()                    | [x]            |
| FR-2-3: カテゴリ別スコア     | ScoreDisplay.categories + CategoryBar                            | [x]            |
| FR-2-4: カテゴリ詳細         | CategoryBar（名前、スコア、詳細、課題リスト）                    | [x]            |
| FR-2-5: 提案グループ化       | SuggestionList（high/medium/low グループ）                       | [x]            |
| FR-2-6: 提案詳細表示         | SuggestionItem（タイプ、優先度、説明、autoFix）                  | [x]            |
| FR-2-7: リスク色分け         | RiskPanel + riskLevelStyles Record                               | [x]            |
| FR-2-8: リスク詳細           | RiskItem（カテゴリ、レベル、説明、影響、緩和策）                 | [x]            |
| FR-3-1: チェックボックス     | SuggestionItem.isSelected + onToggle                             | [x]            |
| FR-3-2: 自動修正フィルタ     | SuggestionList.onSelectAutoFixable                               | [x]            |
| FR-3-3: 選択適用             | useSkillAnalysis.applySelected()                                 | [x]            |
| FR-3-4: 適用中ローディング   | AnalysisActions.isImproving → disabled                           | [x]            |
| FR-3-5: 結果通知             | applySelected完了後のトースト通知                                | [x]            |
| FR-3-6: 再取得               | applySelected内でrunAnalysis()再呼び出し                         | [x]            |
| FR-4-1: 全自動改善           | useSkillAnalysis.autoImprove()                                   | [x]            |
| FR-4-2: 確認ダイアログ       | autoImprove実行前の確認表示                                      | [x]            |
| FR-4-3: 実行中ローディング   | AnalysisActions.isImproving → disabled                           | [x]            |
| FR-4-4: 結果表示・再取得     | autoImprove内でrunAnalysis()再呼び出し                           | [x]            |
| FR-5-1: 分析エラー           | AnalysisError.message + onRetry                                  | [x]            |
| FR-5-2: 部分失敗表示         | ImprovementResult.errors 表示                                    | [x]            |
| FR-5-3: ネットワークエラー   | error state でメッセージ表示                                     | [x]            |
| FR-5-4: バリデーションエラー | P42準拠3段バリデーション                                         | [x]            |
| NFR-1: レスポンシブUI        | isAnalyzing → スケルトン表示                                     | [x]            |
| NFR-2: アクセシビリティ      | ARIA属性定義（role, aria-valuenow, aria-label）                  | [x]            |
| NFR-3: Apple HIG             | 8pxグリッド、角丸8-12px、システムフォント                        | [x]            |
| NFR-4: ダークモード          | CSS変数ベースデザイントークン                                    | [x]            |

**カバレッジ結果**: 全27要件がPhase 2設計にマッピング済み（100%カバレッジ）

### 2. 設計整合性検証

| 確認項目                                                       | 確認結果 |
| -------------------------------------------------------------- | -------- |
| コンポーネントがAtomic Design（organism/molecule）に従っている | [x]      |
| SkillAnalysisViewがorganism、サブコンポーネントがmolecule      | [x]      |
| 各コンポーネントのProps型が定義されている                      | [x]      |
| useSkillAnalysisフックのインターフェースが明確                 | [x]      |
| 状態遷移図が全パターンを網羅している                           | [x]      |
| レイアウト設計図（アスキーアート）が作成されている             | [x]      |
| スペーシングが8pxグリッドに従っている                          | [x]      |

### 3. IPC契約整合性検証

| 確認項目                                                                | 確認結果 |
| ----------------------------------------------------------------------- | -------- |
| skill:analyze チャネルが channels.ts に定義済み                         | [x]      |
| skill:improve チャネルが channels.ts に定義済み                         | [x]      |
| skill:optimize チャネルが channels.ts に定義済み                        | [x]      |
| 3チャネルが ALLOWED_INVOKE_CHANNELS に登録済み                          | [x]      |
| Preload API の引数型が Main Handler の期待型と一致                      | [x]      |
| Preload API の戻り値型が packages/shared の型定義と一致                 | [x]      |
| safeInvoke パターンで IPC_CHANNELS 定数を使用（ハードコード文字列なし） | [x]      |

### 4. Pitfall対策検証

| Pitfall | 対策内容                                            | 設計への反映 |
| ------- | --------------------------------------------------- | ------------ |
| P31     | Zustand不使用（ローカルstateで完結）→ 対策不要      | [x]          |
| P39     | テスト方針に happy-dom + fireEvent 記載             | [x]          |
| P42     | Main Handler に3段バリデーション設計                | [x]          |
| P44     | Preload API と Handler の引数型を統一設計           | [x]          |
| P45     | 引数名を skillName に統一（セマンティクス一致）     | [x]          |
| P46     | Props型設計でHTMLAttributes衝突なし（Omit不要確認） | [x]          |
| P47     | variantStyles Record定数をコンポーネントから export | [x]          |

### 5. アクセシビリティ検証

| WCAG基準                | 設計対応                                         | 確認結果 |
| ----------------------- | ------------------------------------------------ | -------- |
| キーボード操作（2.1.1） | 全ボタン・チェックボックスにTab移動可能          | [x]      |
| フォーカス可視（2.4.7） | ホバー/アクティブ/フォーカス状態のフィードバック | [x]      |
| 名前・役割・値（4.1.2） | ARIA属性（role, aria-valuenow, aria-label）      | [x]      |
| コントラスト比（1.4.3） | デザイントークンでApple HIG準拠色使用            | [x]      |
| エラー識別（3.3.1）     | role="alert" + aria-live="assertive"             | [x]      |
| テキスト代替（1.1.1）   | アイコンにaria-label付与                         | [x]      |

### 6. 状態管理検証

| 確認項目                                                     | 確認結果 |
| ------------------------------------------------------------ | -------- |
| Zustand Storeを使わない判断の根拠が明確                      | [x]      |
| useStateベースのローカル状態が5つ定義されている              | [x]      |
| カスタムフック（useSkillAnalysis）にロジックが分離されている | [x]      |
| 状態遷移が初期→分析中→完了→改善中→再分析の全パスを網羅       | [x]      |
| エラー状態からの復旧パス（再試行）が定義されている           | [x]      |

---

## レビュー結果

### 判定: PASS

全6観点で問題なし。Phase 4（テスト作成）へ進行する。

### 確認サマリー

| 観点             | 結果 | 指摘事項 |
| ---------------- | ---- | -------- |
| 要件カバレッジ   | PASS | なし     |
| 設計整合性       | PASS | なし     |
| IPC契約整合性    | PASS | なし     |
| Pitfall対策      | PASS | なし     |
| アクセシビリティ | PASS | なし     |
| 状態管理         | PASS | なし     |

### 特記事項

1. **Zustand不使用の判断は妥当**: SkillAnalysisViewは単一画面で完結し、分析結果を他コンポーネントと共有する要件がないため、ローカルstateで十分
2. **IPC契約は既存定義済み**: TASK-9Cで3チャネル（analyze/improve/optimize）がchannels.tsに定義済み・ホワイトリスト登録済みのため、新規チャネル追加は不要
3. **P47準拠のvariantStyles Record**: scoreVariantStyles、priorityStyles、riskLevelStyles を定数として定義し、テストからimport可能にしている

---

## 統合テスト連携

| 観点               | Phase 3での確認結果                                      |
| ------------------ | -------------------------------------------------------- |
| テスト環境         | happy-dom + fireEvent（P39準拠）の方針を確認済み         |
| IPCモック方針      | vi.fn() でPreload APIをモックする方針を確認済み          |
| スタイルテスト方針 | variantStyles Record定数のimportで検証する方針を確認済み |

## 多角的チェック観点

| 観点                | Phase 3での検証結果                           |
| ------------------- | --------------------------------------------- |
| 要件→設計トレース   | FR-1〜5、NFR-1〜4が全て設計にマッピング済み   |
| 設計→型定義トレース | Props型が全コンポーネントで定義済み           |
| IPC 3層整合性       | Preload API → Main Handler → Backend の型一貫 |
| Pitfall 7項目対策   | P31/P39/P42/P44/P45/P46/P47 全て対策確認済み  |

## 成果物

| 成果物                                    | タイプ       | 説明             |
| ----------------------------------------- | ------------ | ---------------- |
| `outputs/phase-3/design-review-result.md` | レビュー結果 | 全観点の検証結果 |

## 完了条件

- [x] 全FR（FR-1〜FR-5）がPhase 2設計にマッピングされている
- [x] 全NFR（NFR-1〜NFR-4）がPhase 2設計にマッピングされている
- [x] IPC契約（3チャネル）の3層整合性が確認されている
- [x] Pitfall対策（P31/P39/P42/P44/P45/P46/P47）が設計に反映されている
- [x] WCAG 2.1 AA準拠のアクセシビリティ設計が確認されている
- [x] レビュー判定がPASS/MINOR/MAJORのいずれかで記録されている
- [x] outputs/phase-3/ 配下のレビュー結果ファイルが作成されている

## 次のPhase

Phase 4（テスト作成）へ進行する。Phase 2 の設計に基づいてテストケースを設計し、テストコードを作成する。
