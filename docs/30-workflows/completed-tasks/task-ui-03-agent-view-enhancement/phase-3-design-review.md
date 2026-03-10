# Phase 3: 設計レビューゲート

## メタ情報

| 項目   | 値                     |
| ------ | ---------------------- |
| Phase  | 3                      |
| 機能名 | agent-view-enhancement |
| 作成日 | 2026-03-10             |

## 目的

Phase 1（要件定義）と Phase 2（設計）の妥当性を多角的に検証し、実装開始前にゲート判定を行う。UI/UX（Apple HIG準拠）、アクセシビリティ（WCAG 2.1 AA）、状態管理（P31対策）、パフォーマンス、既存ロジック維持の5観点でレビューする。

## 判定基準

| 判定  | 条件                   | 対応                        |
| ----- | ---------------------- | --------------------------- |
| PASS  | 全観点で問題なし       | Phase 4（テスト作成）へ進行 |
| MINOR | 軽微な指摘あり         | 指摘対応後 Phase 4 へ進行   |
| MAJOR | 重大な問題あり（要件） | Phase 1 へ戻り要件再確認    |
| MAJOR | 重大な問題あり（設計） | Phase 2 へ戻り設計修正      |

## 実行タスク

- 設計レビュー実施: Phase 1（要件定義）と Phase 2（設計）の成果物を5つのレビュー観点で検証する
- 指摘事項記録: 発見した問題を重大度（CRITICAL / MAJOR / MINOR / INFO）で分類して記録する
- ゲート判定: レビュー結果に基づき PASS / MINOR / MAJOR を判定する
- 既知の落とし穴対策確認: P31/P39/P40/P24/P47/P46 の対策が設計に含まれていることを確認する

## 参照資料

| 資料名                         | パス                                                                                                         | 説明                             |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------ | -------------------------------- |
| Phase 1 要件定義書             | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/phase-1-requirements.md`                | 機能・非機能要件                 |
| Phase 2 設計書                 | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/phase-2-design.md`                      | コンポーネント・状態管理設計     |
| 元タスク仕様書                 | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-058a-ui-03-agent-view-enhancement.md` | リデザイン全体仕様               |
| UI/UXコンポーネント仕様        | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                      | コンポーネント設計基準           |
| 機能コンポーネント仕様         | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                              | 機能コンポーネント定義           |
| デザイン原則                   | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`                               | Apple HIG準拠デザイン原則        |
| デザインシステム               | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                                   | トークン・8px grid・配色         |
| UIコンポーネントアーキテクチャ | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                                    | コンポーネント階層               |
| 状態管理アーキテクチャ         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                 | Zustand Store設計                |
| ナビゲーション仕様             | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                                      | GlobalNavStrip連携               |
| 実行UI仕様                     | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`                                 | 実行状態・Permission 導線        |
| モデル選択UI                   | `.claude/skills/aiworkflow-requirements/references/ui-ux-llm-selector.md`                                    | モデル選択UIの妥当性確認         |
| 許可設定UI                     | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                                        | Permission settings の妥当性確認 |
| 実装パターン                   | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`                  | P24/P31/P47レビュー観点          |
| 既知の落とし穴                 | `.claude/rules/06-known-pitfalls.md`                                                                         | P31/P39/P40/P24対策              |
| 要件定義書                     | `outputs/phase-1/requirements-definition.md`                                                                 | Phase 1 成果物                   |
| アーキテクチャ設計書           | `outputs/phase-2/architecture-design.md`                                                                     | Phase 2 成果物                   |

## 実行手順

### ステップ1: レビュー観点別チェック実施

5つのレビュー観点それぞれについて、チェックリストを順次確認する。

### ステップ2: 指摘事項の記録

発見した問題を重大度（CRITICAL / MAJOR / MINOR / INFO）で分類して記録する。

### ステップ3: ゲート判定

指摘事項の重大度に基づいてゲート判定（PASS / MINOR / MAJOR）を下す。

---

## レビュー観点1: UI/UX（Apple HIG準拠）

| #   | チェック項目                                                                                           | 判定 |
| --- | ------------------------------------------------------------------------------------------------------ | ---- |
| 1   | カラーパレットが Apple HIG System Colors 準拠か（CSS変数: `--status-primary` = `#007AFF` / `#0A84FF`） |      |
| 2   | スペーシングが 8px グリッド準拠か（gap-6=24px, gap-4=16px, p-6=24px）                                  |      |
| 3   | 角丸が 8px〜12px で統一されているか（ExecuteButton: 12px, SkillChip: 50%）                             |      |
| 4   | フォントがシステムフォント（`-apple-system`, `BlinkMacSystemFont`）を優先しているか                    |      |
| 5   | Tap & Discover 体験: Level 1 が3要素（チップ + ボタン + 履歴）のみか                                   |      |
| 6   | Level 2（詳細設定）がデフォルト非表示で、歯車アイコンでのみアクセス可能か                              |      |
| 7   | UX言語マッピングが5D準拠か（「AIアシスタント」「できること」「ツール」「許可」「AIの種類」）           |      |
| 8   | シングルカラムレイアウト（max-width: 600px、中央寄せ）が適切か                                         |      |
| 9   | マイクロインタラクションのタイミングが統一されているか（ホバー: 200ms, タップ: 100-150ms）             |      |
| 10  | 影の使用が控えめか（カード: `0 1px 3px rgba(0,0,0,0.04)`、ExecuteButton hover: `shadow-md`）           |      |

## レビュー観点2: アクセシビリティ（WCAG 2.1 AA）

| #   | チェック項目                                                                          | 判定 |
| --- | ------------------------------------------------------------------------------------- | ---- |
| 1   | コントラスト比: 通常テキスト 4.5:1 以上、大テキスト/UI部品 3:1 以上                   |      |
| 2   | SkillChip群が `role="radiogroup"` + `aria-label="ツール選択"` で囲まれているか        |      |
| 3   | 各 SkillChip が `role="radio"` + `aria-checked` + `aria-label={displayName}` を持つか |      |
| 4   | ExecuteButton が disabled 時に `aria-disabled` またはHTML `disabled` 属性を持つか     |      |
| 5   | AdvancedSettingsPanel が ESCキーで閉じる設計か                                        |      |
| 6   | FloatingExecutionBar の停止ボタンに `aria-label="実行を停止"` が付与されているか      |      |
| 7   | 全操作要素がキーボード（Tab / Enter / Space）で操作可能か                             |      |
| 8   | 色だけで情報を伝えていないか（ステータスアイコン + テキストを併用）                   |      |
| 9   | フォーカス順序が視覚的順序と一致しているか                                            |      |

## レビュー観点3: 状態管理（P31対策）

| #   | チェック項目                                                                             | 判定 |
| --- | ---------------------------------------------------------------------------------------- | ---- |
| 1   | 全新規セレクタが個別セレクタパターンで定義されているか（`useRecentExecutions()` 等）     |      |
| 2   | `useAppStore()` の一括分割代入が設計に含まれていないか                                   |      |
| 3   | `useEffect` の依存配列に含めるアクション関数が個別セレクタ経由で取得される設計か         |      |
| 4   | agentSlice の基本構造（14スライス統合パターン）を壊す変更が含まれていないか              |      |
| 5   | 既存セレクタ（`useSelectedSkillName`, `useImportedSkills` 等）の再利用が計画されているか |      |
| 6   | `addExecutionToHistory` の10件制限ロジックがスライス内で完結しているか                   |      |

## レビュー観点4: パフォーマンス

| #   | チェック項目                                                                | 判定 |
| --- | --------------------------------------------------------------------------- | ---- |
| 1   | アニメーションが CSS transform / opacity ベースか（layout thrash を回避）   |      |
| 2   | FloatingExecutionBar の経過時間更新が不要な再レンダリングを引き起こさないか |      |
| 3   | SkillChip リストのレンダリングが `key={skill.name}` で最適化されているか    |      |
| 4   | AdvancedSettingsPanel が `isOpen=false` 時に DOM から除外される設計か       |      |
| 5   | 個別セレクタにより、無関係な状態変更で再レンダリングが発生しない設計か      |      |

## レビュー観点5: 既存ロジック維持

| #   | チェック項目                                                    | 判定 |
| --- | --------------------------------------------------------------- | ---- |
| 1   | `useSkillExecution` Hook が変更なしで維持される設計か           |      |
| 2   | `useSkillPermission` Hook が変更なしで維持される設計か          |      |
| 3   | AgentExecutionView が変更なしで維持される設計か                 |      |
| 4   | SkillStreamDisplay が AgentExecutionView で継続使用される設計か |      |
| 5   | IPC チャンネル（skill:execute, skill:abort 等）が変更なしか     |      |
| 6   | TimestampContext が AgentExecutionView で継続使用される設計か   |      |
| 7   | CopyHistoryPanel が AgentExecutionView で継続使用される設計か   |      |

---

## 統合テスト連携

統合テスト観点のレビューゲートを実施する:

| レビュー観点       | 確認項目                                                                           |
| ------------------ | ---------------------------------------------------------------------------------- |
| IPC連携設計        | 既存IPCチャンネル（skill:_, llm:_, agent:\*）の利用パターンが正しいか              |
| 状態管理フロー     | agentSlice → 各コンポーネントのデータフローが正しいか                              |
| ナビゲーション連携 | GlobalNavStrip → AgentView → AgentExecutionView の遷移設計が正しいか               |
| エラーハンドリング | 実行失敗時のFloatingExecutionBar表示（shake + 赤色 + 3秒後消去）が設計されているか |

## 多角的チェック観点

| 観点             | 適用判断                 | 仕様参照先                                                                 |
| ---------------- | ------------------------ | -------------------------------------------------------------------------- |
| UI/UX            | フロントエンド実装のため | `aiworkflow-requirements: ui-ux-components.md, ui-ux-design-principles.md` |
| アクセシビリティ | UI実装のため             | `aiworkflow-requirements: ui-ux-components.md`（WCAG 2.1 AA）              |
| 状態管理         | Zustand Store拡張のため  | `aiworkflow-requirements: arch-state-management.md`                        |
| パフォーマンス   | アニメーション要件のため | `aiworkflow-requirements: arch-ui-components.md`                           |

**Electronデスクトップアプリ観点**:

| 層                         | レビュー観点                                                   |
| -------------------------- | -------------------------------------------------------------- |
| フロントエンド（Renderer） | コンポーネント設計のAtomic Design準拠、CSS変数使用の妥当性     |
| IPC通信                    | 既存チャンネル利用パターンの正当性（新規チャンネル不要の確認） |

---

## 既知の落とし穴対策レビュー

Phase 1/2 の設計が以下の既知の落とし穴を回避しているか確認する:

| Pitfall ID | 確認事項                                                                                       | 判定 |
| ---------- | ---------------------------------------------------------------------------------------------- | ---- |
| P31        | 合成Store Hook を `useEffect` 依存配列に含めない設計か。個別セレクタパターンが使用されているか |      |
| P39        | テスト計画で `userEvent` ではなく `fireEvent` が使用されているか（happy-dom環境）              |      |
| P40        | テスト実行コマンドが `cd apps/desktop && pnpm vitest run src/...` か                           |      |
| P24        | `ImportedSkill` 型をそのまま使用し型アサーション（`as`）を回避しているか                       |      |
| P47        | CSS変数ベースのスタイルテストで `variantStyles` Record パターンが検討されているか              |      |
| P46        | HTMLAttributes との Props 型衝突が発生しないか                                                 |      |

---

## 成果物

| 成果物       | パス                                                                                           | 説明                       |
| ------------ | ---------------------------------------------------------------------------------------------- | -------------------------- |
| レビュー結果 | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/phase-3-design-review.md` | 本ドキュメント（判定結果） |

## 完了条件

- [ ] レビュー観点1（UI/UX: 10項目）の全チェックが実施されている
- [ ] レビュー観点2（アクセシビリティ: 9項目）の全チェックが実施されている
- [ ] レビュー観点3（状態管理: 6項目）の全チェックが実施されている
- [ ] レビュー観点4（パフォーマンス: 5項目）の全チェックが実施されている
- [ ] レビュー観点5（既存ロジック維持: 7項目）の全チェックが実施されている
- [ ] 既知の落とし穴対策レビュー（P31/P39/P40/P24/P47/P46: 6項目）が実施されている
- [ ] 統合テスト観点のレビュー（4項目）が実施されている
- [ ] ゲート判定（PASS / MINOR / MAJOR）が記録されている
- [ ] MINOR指摘がある場合、対応方針が記録されている
- [ ] MAJOR指摘がある場合、戻り先Phase（1 or 2）が指定されている
- [ ] **本Phase内のレビュー作業を100%実行完了**

## 次のPhase

Phase 4: テスト作成（TDD: Red）
