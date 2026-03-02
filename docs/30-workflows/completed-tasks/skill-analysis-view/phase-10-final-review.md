# Phase 10: 最終レビュー — SkillAnalysisView

## メタ情報

| 項目       | 値                     |
| ---------- | ---------------------- |
| タスクID   | TASK-10A-B             |
| Phase      | 10（最終レビュー）     |
| 前Phase    | Phase 9（品質保証）    |
| 次Phase    | Phase 11（手動テスト） |
| 依存成果物 | Phase 9 品質レポート   |

## 目的

SkillAnalysisView 実装の全体を多角的に検証し、要件・設計・品質・セキュリティの観点で最終判定を行う。MINOR 以上の指摘は全て未タスク仕様書に変換する（機能影響なしでも省略不可）。

## 実行タスク

- 要件カバレッジ検証: FR/NFRの実装・テスト充足を確認する
- 設計整合性検証: Phase 2設計との差分を検証する
- コード品質検証: 型安全・重複・命名規約の適合を確認する
- UI/UX品質検証: HIG/WCAG/導線の妥当性を確認する
- テスト品質検証: カバレッジ・境界値・異常系の網羅を確認する
- セキュリティ検証: IPC検証・サニタイズ・XSS対策を確認する
- Pitfall対策確認: P5/P31/P39/P42/P46/P47の再発防止を確認する
- 最終判定: PASS/MINOR/MAJOR/CRITICALを確定する

## 参照資料

### プロジェクトルール

- `.claude/rules/01-architecture.md` — Atomic Design、Apple HIG、アクセシビリティ
- `.claude/rules/02-code-quality.md` — 型安全、テスト基準、コーディング規約
- `.claude/rules/04-electron-security.md` — IPC セキュリティ原則
- `.claude/rules/05-task-execution.md` — Phase 10 判定基準
- `.claude/rules/06-known-pitfalls.md` — P31, P39, P42, P46, P47

### システム仕様（aiworkflow-requirements）

- `.claude/skills/aiworkflow-requirements/references/architecture-overview.md` — アーキテクチャ設計原則
- `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` — Apple HIG 準拠
- `.claude/skills/aiworkflow-requirements/references/security-principles.md` — セキュリティ設計原則

### 前 Phase 成果物

- `phase-5-implementation.md` — 実装仕様と判定対象コード
- `outputs/phase-9/quality-report.md` — 品質レポート
- `docs/30-workflows/completed-tasks/skill-analysis-view/phase-1-requirements.md` — 要件定義
- `docs/30-workflows/completed-tasks/skill-analysis-view/phase-2-design.md` — 設計仕様

## 実行手順

### Task 1: 要件カバレッジ検証

Phase 1 で定義した機能要件（FR）・非機能要件（NFR）の全項目が実装されているかを検証する。

#### 1-1: 機能要件（FR）チェック

| FR ID | 要件                             | 実装確認 | テスト確認 |
| ----- | -------------------------------- | -------- | ---------- |
| FR-01 | スキル分析結果の表示             | [ ]      | [ ]        |
| FR-02 | 総合スコア・カテゴリ別スコア表示 | [ ]      | [ ]        |
| FR-03 | 改善提案一覧の表示               | [ ]      | [ ]        |
| FR-04 | 改善提案の個別選択               | [ ]      | [ ]        |
| FR-05 | 選択した改善の適用               | [ ]      | [ ]        |
| FR-06 | 全自動改善の実行                 | [ ]      | [ ]        |
| FR-07 | リスク情報の表示                 | [ ]      | [ ]        |
| FR-08 | 分析中のローディング表示         | [ ]      | [ ]        |
| FR-09 | エラー発生時のエラー表示         | [ ]      | [ ]        |
| FR-10 | 分析ビューの閉じる操作           | [ ]      | [ ]        |

#### 1-2: 非機能要件（NFR）チェック

| NFR ID | 要件                         | 確認方法                        | 結果 |
| ------ | ---------------------------- | ------------------------------- | ---- |
| NFR-01 | TypeScript strict mode 準拠  | `pnpm typecheck`                | [ ]  |
| NFR-02 | Apple HIG カラーパレット準拠 | コード目視確認                  | [ ]  |
| NFR-03 | WCAG 2.1 AA 準拠             | アクセシビリティ項目確認        | [ ]  |
| NFR-04 | ダークモード対応             | CSS 変数使用確認                | [ ]  |
| NFR-05 | IPC 入力バリデーション       | P42 準拠 3 段バリデーション確認 | [ ]  |
| NFR-06 | エラーサニタイズ             | 内部情報非漏洩確認              | [ ]  |

### Task 2: 設計整合性検証

Phase 2 で定義したコンポーネント設計との一致を確認する。

| 設計項目               | 確認内容                                                                 |
| ---------------------- | ------------------------------------------------------------------------ |
| コンポーネント構成     | SkillAnalysisView / ScoreDisplay / SuggestionList / RiskPanel が存在する |
| Atomic Design レベル   | organisms / molecules の階層が正しい                                     |
| Props インターフェース | 設計仕様どおりの Props 型が定義されている                                |
| カスタムフック         | `useSkillAnalysis` が設計どおりの戻り値を返す                            |
| IPC チャンネル         | skill:analyze / skill:improve / skill:optimize を使用                    |
| ディレクトリ配置       | `apps/desktop/src/renderer/components/skill/` 配下                       |

### Task 3: コード品質検証

| 品質項目                          | 基準                                                    |
| --------------------------------- | ------------------------------------------------------- |
| `any` 型                          | 使用箇所 0                                              |
| `as` 型アサーション               | 使用箇所 0                                              |
| `@ts-ignore` / `@ts-expect-error` | 使用箇所 0（使用時は理由コメント必須）                  |
| エラーハンドリング                | try/catch で握りつぶしていない                          |
| 命名規約                          | boolean: `is` / `has` / `can` / `should` プレフィックス |
| DRY                               | 重複コードが存在しない                                  |
| 未使用 import                     | 0 件                                                    |

### Task 4: UI/UX 品質検証

| UI/UX 項目       | 基準                                               |
| ---------------- | -------------------------------------------------- |
| Apple HIG 準拠   | システムカラー・スペーシング・角丸がルール準拠     |
| ダークモード対応 | CSS 変数でライト/ダーク切り替え可能                |
| レスポンシブ対応 | 画面幅に応じたレイアウト調整                       |
| アクセシビリティ | ARIA 属性付与、キーボードナビ、コントラスト比      |
| インタラクション | ホバー・アクティブ・フォーカス状態のフィードバック |
| アニメーション   | 200-300ms 以内、目的を持った遷移のみ               |
| 破壊的操作       | 確認ダイアログで保護                               |

### Task 5: テスト品質検証

| テスト項目        | 基準                                                   |
| ----------------- | ------------------------------------------------------ |
| Line Coverage     | 80% 以上（推奨: 90%）                                  |
| Branch Coverage   | 60% 以上（推奨: 70%）                                  |
| Function Coverage | 80% 以上（推奨: 90%）                                  |
| 境界値テスト      | スコア閾値（0, 49, 50, 79, 80, 100）がテストされている |
| 異常系テスト      | API エラー、ネットワークエラー、空データのテストが存在 |
| 統合テスト        | IPC 呼び出しのモック統合テストが存在                   |
| テスト独立性      | テスト間で状態を共有していない（P9 対策）              |

### Task 6: セキュリティ検証

| セキュリティ項目   | 確認内容                                      |
| ------------------ | --------------------------------------------- |
| IPC バリデーション | 全 IPC ハンドラで P42 準拠 3 段バリデーション |
| エラーサニタイズ   | 内部スタックトレース非漏洩                    |
| XSS 防止           | `dangerouslySetInnerHTML` 不使用              |
| 入力サニタイズ     | ユーザー入力が React の自動エスケープで保護   |

### Task 7: Pitfall 対策確認

| Pitfall | 対策                                  | 確認方法                       |
| ------- | ------------------------------------- | ------------------------------ |
| P5      | リスナー二重登録防止                  | useEffect cleanup / ガード確認 |
| P31     | Zustand 個別セレクタ使用              | 合成 Hook 不使用を grep で確認 |
| P39     | happy-dom 環境で fireEvent 使用       | userEvent 不使用を grep で確認 |
| P42     | 3 段バリデーション                    | IPC ハンドラの実装確認         |
| P46     | HTMLAttributes 衝突は Omit で回避     | 型定義の目視確認               |
| P47     | variantStyles を Record 定数で export | テストの import 確認           |

**確認コマンド:**

```bash
# P31: 合成Hook使用箇所の検出
grep -rn "useSkillStore\(\)" apps/desktop/src/renderer/components/skill/

# P39: userEvent使用箇所の検出
grep -rn "userEvent" apps/desktop/src/renderer/components/skill/**/*.test.*

# P42: 3段バリデーション確認
grep -rn "trim()" apps/desktop/src/main/ipc/handlers/skill*
```

### Task 8: 最終判定

全観点の検証結果を集約し、以下の判定基準で最終判定を行う。

| 判定     | 条件                                     | 対応                                          |
| -------- | ---------------------------------------- | --------------------------------------------- |
| PASS     | 全観点で問題なし                         | Phase 11（手動テスト）へ進む                  |
| MINOR    | 軽微な指摘あり（機能に影響なし）         | 指摘を全て未タスク仕様書に変換後、Phase 11 へ |
| MAJOR    | 重大な問題あり（設計・実装の修正が必要） | 影響範囲に応じて Phase 1-5 に戻る             |
| CRITICAL | 要件レベルの問題（要件の再確認が必要）   | Phase 1 に戻り要件再確認                      |

**MINOR 指摘の処理（省略不可）:**

1. 指摘内容を `unassigned-task/` に未タスク仕様書として作成
2. `task-workflow.md` 残課題テーブルに登録
3. 関連仕様書に参照リンクを追加

## 統合テスト連携

最終レビューで発見された問題のうち、テスト追加で対応可能なものは未タスク仕様書に「テスト追加」として記録する。

## 多角的チェック観点

| 観点           | 確認内容                                                |
| -------------- | ------------------------------------------------------- |
| 要件カバレッジ | FR/NFR 全項目が実装・テストされている                   |
| 設計整合性     | Phase 2 のコンポーネント設計と一致                      |
| コード品質     | 型安全、エラーハンドリング、命名規約、DRY               |
| UI/UX          | Apple HIG、ダークモード、レスポンシブ、アクセシビリティ |
| テスト品質     | カバレッジ基準、境界値、異常系、統合テスト              |
| セキュリティ   | IPC バリデーション、エラーサニタイズ、XSS 防止          |
| Pitfall 対策   | P5, P31, P39, P42, P46, P47 の対策が実装されている      |

## 成果物

| 成果物           | パス                                      |
| ---------------- | ----------------------------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` |

## 完了条件

- [ ] FR-01〜FR-10 の全機能要件が実装・テスト済み
- [ ] NFR-01〜NFR-06 の全非機能要件が確認済み
- [ ] Phase 2 設計仕様との整合性が確認済み
- [ ] コード品質チェック全項目が合格
- [ ] UI/UX 品質チェック全項目が合格
- [ ] テスト品質チェック全項目が合格（カバレッジ基準達成）
- [ ] セキュリティチェック全項目が合格
- [ ] Pitfall 対策（P5, P31, P39, P42, P46, P47）が全て確認済み
- [ ] 最終判定が PASS または MINOR
- [ ] MINOR 指摘は全て未タスク仕様書に変換済み（機能影響なしでも省略不可）
- [ ] `final-review-result.md` に判定結果と指摘一覧が記録されている

## 次の Phase

- **PASS / MINOR**: Phase 11（手動テスト）へ進む
- **MAJOR**: 影響範囲に応じて Phase 1-5 に戻る
- **CRITICAL**: Phase 1（要件定義）に戻る
