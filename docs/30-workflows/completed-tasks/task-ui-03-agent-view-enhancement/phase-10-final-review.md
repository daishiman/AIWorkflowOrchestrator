# Phase 10: 最終レビューゲート

## メタ情報

| 項目   | 値                     |
| ------ | ---------------------- |
| Phase  | 10                     |
| 機能名 | agent-view-enhancement |
| 作成日 | 2026-03-10             |

## 目的

Phase 1〜9 の全成果物に対して、要件充足度・設計準拠度・コード品質・テスト品質・UI/UX品質・アクセシビリティ・既知の落とし穴対策の7観点で多角的に検証し、ゲート判定（PASS / MINOR / MAJOR / CRITICAL）を下す。MINOR指摘は全て未タスク仕様書に変換する（「機能影響なし」でも省略不可）。

## 実行タスク

- Task 1: 要件充足度レビュー
- Task 2: 設計準拠度レビュー
- Task 3: コード品質レビュー
- Task 4: テスト品質レビュー
- Task 5: UI/UX品質レビュー
- Task 6: アクセシビリティレビュー
- Task 7: 既知の落とし穴対策レビュー
- Task 8: ゲート判定と指摘事項処理

## 参照資料

| 資料名                     | パス                                                                                                            | 説明                               |
| -------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| タスク仕様書               | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-058a-ui-03-agent-view-enhancement.md`    | 元タスク仕様（要件・完了条件）     |
| Phase 1 要件定義           | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/outputs/phase-1/`                          | 要件・受け入れ基準                 |
| Phase 2 設計               | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/outputs/phase-2/`                          | アーキテクチャ・コンポーネント設計 |
| Phase 3 設計レビュー       | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/outputs/phase-3/`                          | 設計レビュー結果                   |
| Phase 5 実装成果物         | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/outputs/phase-5/implementation-summary.md` | 依存Phase 5 の成果物               |
| Phase 7 カバレッジレポート | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/outputs/phase-7/coverage-report.md`        | テストカバレッジ結果               |
| Phase 8 リファクタリング   | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/outputs/phase-8/refactoring-report.md`     | リファクタリング結果               |
| Phase 9 品質レポート       | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/outputs/phase-9/quality-report.md`         | 品質検証結果                       |
| コンポーネント実装         | `apps/desktop/src/renderer/components/organisms/AgentView/`                                                     | 全コンポーネント群                 |
| AgentView統合              | `apps/desktop/src/renderer/views/AgentView/index.tsx`                                                           | シングルカラムレイアウト           |
| agentSlice拡張             | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                                          | recentExecutions, advancedSettings |
| UIコンポーネント仕様       | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                         | UIコンポーネント設計仕様           |
| デザイン原則               | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`                                  | Apple HIG準拠デザイン原則          |
| 実行UI仕様                 | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`                                    | 実行状態・Permission導線           |
| モデル選択UI               | `.claude/skills/aiworkflow-requirements/references/ui-ux-llm-selector.md`                                       | AdvancedSettingsPanel のモデル契約 |
| 許可設定UI                 | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                                           | remembered permissions 契約        |
| UIアーキテクチャ           | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                                       | コンポーネントアーキテクチャ       |
| 状態管理仕様               | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                    | Zustand設計原則                    |
| ワークフロー仕様           | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                            | 完了記録/残課題連携                |
| 既知の落とし穴             | `.claude/rules/06-known-pitfalls.md`                                                                            | P31, P39, P40, P24, P47 等         |
| 設計差分記録               | `outputs/phase-5/design-changes.md`                                                                             | Phase 5 成果物                     |
| 要件定義書                 | `outputs/phase-1/requirements-definition.md`                                                                    | Phase 1 成果物                     |
| アーキテクチャ設計書       | `outputs/phase-2/architecture-design.md`                                                                        | Phase 2 成果物                     |

## 実行手順

### ステップ1: Task 1 — 要件充足度レビュー

Phase 1 の要件定義と元タスク仕様書（セクション12: 完了条件）の全項目に対して、実装が要件を満たしているかを検証する。

| レビュー項目                                           | 検証方法                                                      | 判定 |
| ------------------------------------------------------ | ------------------------------------------------------------- | ---- |
| シングルカラムレイアウト（中央寄せ、max-width: 600px） | `index.tsx` でコンテナスタイルを確認                          | -    |
| Level 1 の3セクション構成                              | ツールチップ群 + 実行ボタン + 最近の実行が存在すること        | -    |
| 画面タイトル「AIアシスタント」                         | `<h1>` テキストを確認                                         | -    |
| セクションヘッダー「できること」                       | `<h2>` テキストを確認                                         | -    |
| SkillChip の選択動作                                   | テストケースの PASS を確認                                    | -    |
| SkillChip の選択アニメーション                         | `scale(0.97->1.05->1)` + 色変化の実装を確認                   | -    |
| ツール0件時の SkillCenter 導線                         | EmptyState コンポーネントの存在を確認                         | -    |
| ツール10個以下で検索バー非表示                         | 条件分岐ロジックを確認                                        | -    |
| ツール11個以上で検索バー表示                           | 条件分岐ロジックを確認                                        | -    |
| ExecuteButton の無効・有効状態                         | disabled属性とテキスト切替を確認                              | -    |
| ExecuteButton のマイクロインタラクション               | hover `scale(1.02)` + shadow、tap `scale(0.97)` を確認        | -    |
| 「実行する」ボタンクリックで AgentExecutionView 遷移   | ナビゲーション処理を確認                                      | -    |
| FloatingExecutionBar の表示条件                        | executing時のみ表示、idle時非表示を確認                       | -    |
| FloatingExecutionBar のスライドイン/アウト             | 300ms / 200ms のアニメーション実装を確認                      | -    |
| FloatingExecutionBar の停止ボタン                      | onStop コールバックの実装を確認                               | -    |
| 実行完了時の success-bounce                            | チェックマーク scale(0->1.2->1) + 1.5秒後スライドアウトを確認 | -    |
| 実行失敗時の shake + 赤色表示                          | shake アニメーション + 3秒後スライドアウトを確認              | -    |
| 歯車アイコン（24x24px）のヘッダー右端配置              | レイアウトを確認                                              | -    |
| 歯車アイコンのホバー（色変化 + scale(1.1)）            | アニメーション実装を確認                                      | -    |
| AdvancedSettingsPanel のスライドイン                   | 歯車タップでパネル表示を確認                                  | -    |
| AdvancedSettingsPanel 内のモデル変更                   | onSelectModel コールバックを確認                              | -    |
| AdvancedSettingsPanel 内の許可モード変更               | onModeChange コールバックを確認                               | -    |
| AdvancedSettingsPanel の背景タップ/ESCで閉じる         | イベントハンドラを確認                                        | -    |
| RecentExecutionList 最大3件表示                        | maxItems プロップと表示ロジックを確認                         | -    |
| 既存 agentSlice セレクタの動作維持                     | 既存テストが PASS していることを確認                          | -    |
| UIテキストの UX言語マッピング準拠                      | 「ツール」「AIアシスタント」「できること」等のテキストを確認  | -    |

### ステップ2: Task 2 — 設計準拠度レビュー

Phase 2 の設計に実装が従っているかを検証する。

| レビュー項目                       | 検証方法                                                                                                                       | 判定 |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---- |
| コンポーネント構成が設計と一致     | SkillChip / ExecuteButton / FloatingExecutionBar / AdvancedSettingsPanel / RecentExecutionList の5コンポーネントが存在すること | -    |
| Props インターフェースが設計と一致 | 各コンポーネントの Props 型が元タスク仕様書の定義と一致すること                                                                | -    |
| agentSlice 拡張が設計と一致        | `recentExecutions`, `isAdvancedSettingsOpen` フィールドとアクション                                                            | -    |
| Atomic Design 準拠                 | organisms ディレクトリに配置されていること                                                                                     | -    |
| 個別セレクタパターン準拠           | 新規セレクタが個別セレクタとして実装されていること                                                                             | -    |
| z-index 管理が設計と一致           | オーバーレイ z-30、パネル z-40、フローティングバー z-50                                                                        | -    |

### ステップ3: Task 3 — コード品質レビュー

| レビュー項目                          | 検証方法                                             | 基準                         |
| ------------------------------------- | ---------------------------------------------------- | ---------------------------- |
| TypeScript strict mode                | `pnpm --filter @repo/desktop typecheck`              | エラー 0                     |
| ESLint                                | `pnpm --filter @repo/desktop lint`                   | 警告/エラー 0                |
| `any` 型の不使用                      | `grep -rn ": any" AgentView/`                        | 使用箇所 0                   |
| `@ts-ignore` の不使用                 | `grep -rn "@ts-ignore\|@ts-expect-error" AgentView/` | 使用箇所 0（理由付きを除く） |
| DRY原則: 共通ユーティリティ抽出       | `animations.ts`, `styles.ts` の存在と使用を確認      | 重複コード 0                 |
| 命名規則: boolean変数のプレフィックス | `is` / `has` / `can` / `should` プレフィックスの使用 | 準拠                         |

### ステップ4: Task 4 — テスト品質レビュー

| レビュー項目                         | 検証方法                                               | 基準                                  |
| ------------------------------------ | ------------------------------------------------------ | ------------------------------------- |
| 全テスト PASS                        | テスト実行結果                                         | 失敗 0                                |
| カバレッジ基準充足                   | Phase 7 カバレッジレポート                             | Line 80%+, Branch 60%+, Function 80%+ |
| P39対策: happy-dom で fireEvent 使用 | `grep -rn "userEvent" AgentView/__tests__/`            | 使用箇所 0                            |
| P40対策: テスト実行ディレクトリ      | テスト実行コマンドが `cd apps/desktop &&` で始まること | 準拠                                  |
| テスト間の状態独立                   | `beforeEach` でのリセット処理の存在                    | 全テストファイルで確認                |
| 境界値テストの存在                   | 空リスト、最大件数、null値等のテストケース             | 各コンポーネントに1件以上             |

### ステップ5: Task 5 — UI/UX品質レビュー

| レビュー項目                  | 検証方法                                                             | 基準                 |
| ----------------------------- | -------------------------------------------------------------------- | -------------------- |
| Apple HIG準拠のカラーパレット | CSS変数が `01-architecture.md` のシステムカラーと一致                | 全色一致             |
| 8pxグリッドスペーシング       | gap / padding / margin が 8px の倍数                                 | 全箇所準拠           |
| マイクロインタラクション統一  | ホバー200ms、タップ100-150ms、スライドイン300ms、スライドアウト200ms | 全コンポーネント統一 |
| success-bounce アニメーション | `scale(0->1.2->1)` 300ms ease                                        | 実装確認             |
| error-shake アニメーション    | `translateX(0,-4,4,-4,4,0)` 300ms ease                               | 実装確認             |
| Tap & Discover 体験           | Level 1 が3要素のみ、Level 2 がスライドインパネル                    | 設計通り             |
| フィードバックの完全性        | 全インタラクティブ要素にホバー・アクティブ・フォーカス状態がある     | 漏れなし             |

### ステップ6: Task 6 — アクセシビリティレビュー

| レビュー項目               | 検証方法                                                             | 基準         |
| -------------------------- | -------------------------------------------------------------------- | ------------ |
| WCAG 2.1 AA コントラスト比 | 通常テキスト 4.5:1以上、大テキスト/UI部品 3:1以上                    | 全箇所準拠   |
| SkillChip群の radiogroup   | `role="radiogroup"` + `aria-label` の存在                            | 実装確認     |
| 各SkillChipの radio        | `role="radio"` + `aria-checked` の存在                               | 実装確認     |
| キーボード操作             | Tab / Enter / Space / Escape で全機能にアクセス可能                  | 全操作可能   |
| フォーカスインジケータ     | フォーカス時の視覚的な表示（outline / ring）                         | 全要素で確認 |
| スクリーンリーダー対応     | 意味のある `aria-label` が全インタラクティブ要素に設定されていること | 漏れなし     |

### ステップ7: Task 7 — 既知の落とし穴対策レビュー

| Pitfall ID | 確認内容                                                                      | 検証方法                                      | 判定 |
| ---------- | ----------------------------------------------------------------------------- | --------------------------------------------- | ---- |
| P31        | 個別セレクタパターンの使用、合成Hookの不使用                                  | `grep` で一括分割代入・合成Hook使用箇所を検出 | -    |
| P39        | happy-dom環境で `userEvent` 未使用、`fireEvent` のみ使用                      | `grep -rn "userEvent" AgentView/__tests__/`   | -    |
| P40        | テスト実行が `cd apps/desktop && pnpm vitest run` で実行されていること        | テスト実行コマンドの確認                      | -    |
| P24        | `ImportedSkill` 型と `Skill` 型の使い分けが明確、型アサーション未使用         | `grep -rn "as unknown as\|as any" AgentView/` | -    |
| P47        | CSS変数ベースのスタイルが Record 定数で管理、テスト側も定数を import して検証 | `variantStyles` 等の Record 定数の存在確認    | -    |
| P46        | HTMLAttributes との Props 型衝突が `Omit<>` で解決されていること              | 各コンポーネントの Props 型定義を確認         | -    |
| P5         | リスナー二重登録がガードされていること                                        | `useEffect` 内のリスナー登録パターンを確認    | -    |

### ステップ8: Task 8 — ゲート判定と指摘事項処理

全レビュー観点の結果を集約し、ゲート判定を下す。

#### 判定基準

| 判定     | 条件                                                         | 対応                                            |
| -------- | ------------------------------------------------------------ | ----------------------------------------------- |
| PASS     | 全7観点で問題なし                                            | Phase 11 へ進行                                 |
| MINOR    | 機能に影響しない軽微な指摘（命名改善、コメント不足等）       | 全指摘を未タスク仕様書に変換後、Phase 11 へ進行 |
| MAJOR    | 要件未充足、設計乖離、テスト不足等の重大な問題               | 影響範囲に応じて Phase 1〜5 へ戻る              |
| CRITICAL | セキュリティ脆弱性、データ損失リスク、アーキテクチャ根本問題 | Phase 1 へ戻り要件再確認                        |

#### MINOR 指摘の処理（省略不可）

MINOR 判定の場合、以下の3ステップを全て実行する:

1. **指示書作成**: `docs/30-workflows/unassigned-task/` に未タスク仕様書を作成
2. **残課題テーブル登録**: `.claude/skills/aiworkflow-requirements/references/task-workflow.md` の残課題テーブルに登録
3. **関連仕様書リンク追加**: 該当する仕様書に参照リンクを追加

#### レビュー結果テンプレート

```markdown
## レビュー結果サマリー

| 観点             | 判定 | 指摘件数 | 詳細 |
| ---------------- | ---- | -------- | ---- |
| 要件充足度       | -    | -        | -    |
| 設計準拠度       | -    | -        | -    |
| コード品質       | -    | -        | -    |
| テスト品質       | -    | -        | -    |
| UI/UX品質        | -    | -        | -    |
| アクセシビリティ | -    | -        | -    |
| 落とし穴対策     | -    | -        | -    |

### 総合判定: {{PASS / MINOR / MAJOR / CRITICAL}}

### 指摘一覧（MINOR以上の場合）

| #   | 観点 | 重要度 | 指摘内容 | 対応方針 | 未タスクID |
| --- | ---- | ------ | -------- | -------- | ---------- |
```

## 統合テスト連携

最終レビューで全テスト結果を確認する:

| レビュー項目          | 確認内容                                                                          | 基準                                  |
| --------------------- | --------------------------------------------------------------------------------- | ------------------------------------- |
| ユニットテスト        | `cd apps/desktop && pnpm vitest run src/renderer/components/organisms/AgentView/` | 全件 PASS                             |
| レイアウトテスト      | `cd apps/desktop && pnpm vitest run src/renderer/views/AgentView/`                | 全件 PASS                             |
| TypeScript 型チェック | `pnpm --filter @repo/desktop typecheck`                                           | エラー 0                              |
| ESLint                | `pnpm --filter @repo/desktop lint`                                                | 警告/エラー 0                         |
| カバレッジ            | Phase 7 レポート参照                                                              | Line 80%+, Branch 60%+, Function 80%+ |

## 多角的チェック観点

| 観点               | 適用判断 | 確認内容                                                                            |
| ------------------ | -------- | ----------------------------------------------------------------------------------- |
| セキュリティ       | 適用     | XSS防止、CSP準拠、ユーザー入力のサニタイズ                                          |
| UI/UX              | 適用     | Apple HIG準拠、Tap & Discover 体験、マイクロインタラクション統一                    |
| アーキテクチャ     | 適用     | Atomic Design準拠、レイヤー依存方向、Zustandスライス設計                            |
| エラーハンドリング | 適用     | 実行失敗時のユーザーフィードバック（shake + 赤色表示）                              |
| パフォーマンス     | 適用     | 不要な再レンダリング排除、セレクタ最適化                                            |
| アクセシビリティ   | 適用     | WCAG 2.1 AA準拠（コントラスト比、キーボード操作、ARIA属性、フォーカスインジケータ） |

**Electronデスクトップアプリ観点**:

| 層                         | 適用判断 | 確認内容                                                             |
| -------------------------- | -------- | -------------------------------------------------------------------- |
| フロントエンド（Renderer） | 適用     | 全コンポーネントがRenderer層に正しく配置され、層責務に従っていること |
| IPC通信                    | 非適用   | IPC インターフェースは変更していないため対象外                       |
| Preload/セキュリティ       | 非適用   | Preload層は変更していないため対象外                                  |

## 成果物

| 成果物           | パス                                                                                                          | 説明                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| 最終レビュー結果 | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/outputs/phase-10/final-review-result.md` | 7観点のレビュー結果とゲート判定           |
| 未タスク仕様書   | `docs/30-workflows/unassigned-task/*.md`                                                                      | MINOR指摘の未タスク化（該当する場合のみ） |

## 完了条件

- [ ] 要件充足度レビューが完了し、元タスク仕様書セクション12の全完了条件が検証されていること
- [ ] 設計準拠度レビューが完了し、Phase 2 設計との乖離が記録されていること（乖離がない場合はその旨記録）
- [ ] コード品質レビューが完了し、TypeScript strict mode / ESLint が全PASS であること
- [ ] テスト品質レビューが完了し、カバレッジ基準を充足していること（Line 80%+, Branch 60%+, Function 80%+）
- [ ] UI/UX品質レビューが完了し、Apple HIG準拠・マイクロインタラクション統一が確認されていること
- [ ] アクセシビリティレビューが完了し、WCAG 2.1 AA 準拠が確認されていること
- [ ] 既知の落とし穴対策レビューが完了し、P31 / P39 / P40 / P24 / P47 / P46 / P5 の対策が確認されていること
- [ ] ゲート判定（PASS / MINOR / MAJOR / CRITICAL）が記録されていること
- [ ] MINOR 指摘がある場合、全指摘が未タスク仕様書に変換されていること（省略不可）
- [ ] MAJOR / CRITICAL 指摘がある場合、戻り先Phaseが明記されていること
- [ ] 最終レビュー結果が作成されていること
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. Task 1: 要件充足度レビュー
3. Task 2: 設計準拠度レビュー
4. Task 3: コード品質レビュー
5. Task 4: テスト品質レビュー
6. Task 5: UI/UX品質レビュー
7. Task 6: アクセシビリティレビュー
8. Task 7: 既知の落とし穴対策レビュー
9. Task 8: ゲート判定と指摘事項処理
10. 成果物の作成・配置
11. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .agents/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement
```

## 次のPhase

Phase 11: 手動テスト検証
