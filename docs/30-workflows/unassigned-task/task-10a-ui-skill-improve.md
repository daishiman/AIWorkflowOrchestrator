# TASK-10A-UI-SKILL-IMPROVE - スキル改善UI表示機能

## メタ情報

```yaml
issue_number: 686
```

## メタ情報

| 項目         | 内容                               |
| ------------ | ---------------------------------- |
| タスクID     | TASK-10A-UI-SKILL-IMPROVE          |
| タスク名     | スキル改善UI表示機能               |
| 分類         | 改善                               |
| 対象機能     | スキル管理・改善機能               |
| 優先度       | 中                                 |
| 見積もり規模 | 中規模                             |
| ステータス   | 未実施                             |
| 発見元       | TASK-9C Phase 11（手動テスト発見） |
| 発見日       | 2026-02-03                         |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-9Cで実装したスキル改善・自動修正機能は、バックエンド（Main Process）側のサービス層とIPCハンドラーのみを実装した。Renderer Process側のUI（分析結果の表示、改善提案の一覧、実行確認ダイアログ）は未実装のままである。

### 1.2 問題点・課題

- スキル分析結果をユーザーが視覚的に確認できない
- 改善提案の一覧を閲覧・選択する手段がない
- 改善実行前の確認ダイアログがないため、誤操作のリスクがある
- 分析スコアやカテゴリ別評価を直感的に把握できない

### 1.3 放置した場合の影響

- TASK-9Cの機能がAPIレベルでは完成しているが、エンドユーザーが利用できない
- 開発者のみがIPCを直接呼び出して機能を使う必要があり、実用性が低い
- スキル品質改善のワークフローが不完全なまま放置される

---

## 2. 何を達成するか（What）

### 2.1 目的

TASK-9Cで実装したスキル改善機能をエンドユーザーが直感的に利用できるUIを提供する。

### 2.2 最終ゴール

- スキル分析結果がダッシュボード形式で表示される
- 改善提案が優先度別にリスト表示される
- 改善実行前に確認ダイアログが表示される
- 改善適用後の結果が明確にフィードバックされる

### 2.3 スコープ

#### 含むもの

- SkillAnalysisPanel コンポーネント（分析結果表示）
- SuggestionList コンポーネント（改善提案一覧）
- ImprovementConfirmDialog コンポーネント（実行確認）
- skillSlice への状態追加（analysisResult, improvementStatus）
- skillAPI のPreload拡張（analyze, improve等のブリッジ）

#### 含まないもの

- バックエンドAPI（TASK-9Cで実装済み）
- プロンプト最適化UI（別タスク候補）
- 改善履歴の永続化（TASK-10B）
- A/Bテスト機能UI（TASK-10C）

### 2.4 成果物

| 成果物                   | パス                                                                      |
| ------------------------ | ------------------------------------------------------------------------- |
| SkillAnalysisPanel       | `apps/desktop/src/renderer/components/skill/SkillAnalysisPanel.tsx`       |
| SuggestionList           | `apps/desktop/src/renderer/components/skill/SuggestionList.tsx`           |
| ImprovementConfirmDialog | `apps/desktop/src/renderer/components/skill/ImprovementConfirmDialog.tsx` |
| skillSlice拡張           | `apps/desktop/src/renderer/store/slices/skillSlice.ts`                    |
| skillAPI Preload拡張     | `apps/desktop/src/preload/skillAPI.ts`                                    |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-9C（スキル改善・自動修正機能）が完了していること
- skill:analyze, skill:improve IPCチャネルが動作すること

### 3.2 依存タスク

| タスクID | 依存内容            |
| -------- | ------------------- |
| TASK-9C  | バックエンドAPI実装 |

### 3.3 必要な知識

- React + TypeScript
- Zustand（状態管理）
- Electron Preload API
- Tailwind CSS / UIコンポーネント設計

### 3.4 システム仕様書参照

| 仕様書                                    | 参照セクション                                   |
| ----------------------------------------- | ------------------------------------------------ |
| `interfaces-agent-sdk-skill.md`           | skill:analyze, skill:improve IPCチャネル         |
| `arch-electron-services.md`               | SkillAnalyzer, SkillImprover サービス構成        |
| `arch-state-management.md`                | skillSlice 既存構造                              |
| `ui-ux-components.md`                     | ダイアログ・パネル設計パターン                   |
| `architecture-implementation-patterns.md` | SDK連携パターン（Graceful Fallback, queryFn DI） |

### 3.5 実装課題と解決策（TASK-9Cからの学び）

TASK-9Cで発生した実装課題と解決パターンを、本タスク実装時に参照する。

| 課題                    | 解決策                                                          | 本タスクへの適用                               |
| ----------------------- | --------------------------------------------------------------- | ---------------------------------------------- |
| SDK接続エラー時の処理   | `tryAgentSdkWithFallback<T>(fn, fallback)` で graceful fallback | UI側でフォールバック状態（「分析不可」）を表示 |
| APIレスポンス待機中のUX | ローディング状態管理を明確化                                    | skillSliceに`isAnalyzing`状態を追加            |
| エラー表示の統一        | Result型パターン（`{ success: false, error }`）でUIに伝搬       | エラーメッセージをトースト/インライン表示      |
| テストでのSDKモック     | `queryFn` DI パターンでモック関数を注入可能                     | コンポーネントテストでPreload APIをモック      |

#### 参照パターンの詳細

**Graceful SDK Fallback パターン**: SDKが未設定/接続エラー時もUIは正常表示し、「分析結果なし」等の空状態を表示する。ユーザー体験を損なわずにエラーを処理。

**queryFn DI パターン**: UIコンポーネントテストでは、Preload APIの `skillAPI.analyze()` をモックし、決定論的なテストを実現する。

---

## 4. 実行手順

### Phase構成

標準Phase 1-13に従う。

### Phase 2: 設計

#### 目的

UIコンポーネントの設計とZustand状態の設計

#### 手順

1. SkillAnalysisPanelのワイヤーフレーム設計
2. SuggestionListの表示項目定義
3. skillSliceの状態拡張設計（analysisResult, isAnalyzing, improvementStatus）
4. Preload API拡張設計

#### 成果物

- UIワイヤーフレーム
- 状態設計書

### Phase 5: 実装

#### 目的

UIコンポーネントと状態管理の実装

#### 手順

1. skillSlice拡張（analyzeSkill, applyImprovement アクション追加）
2. skillAPI Preload拡張
3. SkillAnalysisPanel実装
4. SuggestionList実装
5. ImprovementConfirmDialog実装

#### 成果物

- 実装コード

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] スキル分析を実行し、結果がUI上に表示される
- [ ] 分析スコアがプログレスバー/数値で表示される
- [ ] カテゴリ別スコアが一覧表示される
- [ ] 改善提案が優先度別にリスト表示される
- [ ] 改善提案を選択して実行できる
- [ ] 実行前に確認ダイアログが表示される
- [ ] 改善結果（成功/失敗/スキップ）がフィードバックされる

### 品質要件

- [ ] コンポーネントテスト80%以上カバレッジ
- [ ] アクセシビリティ（WCAG 2.1 AA）準拠
- [ ] ローディング状態の適切な表示

### ドキュメント要件

- [ ] 実装ガイド作成
- [ ] システム仕様書更新

---

## 6. 検証方法

### テストケース

| #   | テストケース               | 期待結果                             |
| --- | -------------------------- | ------------------------------------ |
| 1   | スキル分析ボタンクリック   | ローディング表示→結果表示            |
| 2   | 分析結果のスコア表示       | 0-100の範囲でプログレスバー表示      |
| 3   | 改善提案リスト表示         | 優先度順にソート表示                 |
| 4   | 改善実行確認ダイアログ表示 | 選択した提案の詳細が表示される       |
| 5   | 改善実行→成功              | 成功メッセージとバックアップパス表示 |
| 6   | 改善実行→一部失敗          | 成功/失敗の内訳が表示される          |

### 検証手順

1. 開発サーバーでアプリを起動
2. スキル管理画面を開く
3. 任意のスキルを選択し「分析」ボタンをクリック
4. 分析結果を確認
5. 改善提案を選択し「改善を適用」をクリック
6. 確認ダイアログで「実行」をクリック
7. 結果を確認

---

## 7. リスクと対策

| リスク                         | 影響度 | 発生確率 | 対策                             |
| ------------------------------ | ------ | -------- | -------------------------------- |
| 分析に時間がかかりUXが悪化     | 中     | 中       | プログレス表示、キャンセル機能   |
| 改善適用で予期せぬファイル破損 | 高     | 低       | バックアップ確認、ドライラン機能 |
| 大量の提案でリストが見づらい   | 低     | 中       | ページネーション、フィルタ機能   |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                  | パス                                                                                |
| ----------------------------- | ----------------------------------------------------------------------------------- |
| TASK-9C 実装ガイド            | `docs/30-workflows/TASK-9C-skill-improver/outputs/phase-12/implementation-guide.md` |
| interfaces-agent-sdk-skill.md | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`   |
| arch-electron-services.md     | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`       |

### 参考資料

- Zustand公式ドキュメント
- Electron Preload API仕様

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
TASK-9C Phase 11 手動テスト結果 - 発見事項#3:
UI表示機能（分析結果のUI表示、改善提案一覧UI、実行確認ダイアログ）は未実装。
現在の実装はIPCハンドラーとサービス層のみ。
```

### 補足事項

- TASK-10B（改善履歴の永続化）、TASK-10C（A/Bテスト）と連携する可能性あり
- スキルダッシュボード全体の設計と整合性を取る必要がある
