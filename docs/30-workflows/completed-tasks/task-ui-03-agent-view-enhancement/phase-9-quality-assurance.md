# Phase 9: 品質保証

## メタ情報

| 項目   | 値                     |
| ------ | ---------------------- |
| Phase  | 9                      |
| 機能名 | agent-view-enhancement |
| 作成日 | 2026-03-10             |

## 目的

Phase 8 のリファクタリング完了後、TypeScript型チェック・ESLint・全テスト実行・アクセシビリティ検証・セキュリティ確認・パフォーマンス確認を実施し、定義された品質基準を全て満たすことを検証する。

## 実行タスク

- Task 1: TypeScript 型チェック（全エラー解消）
- Task 2: ESLint 実行（全警告・エラー解消）
- Task 3: 全テスト実行（全件 PASS 確認）
- Task 4: アクセシビリティ検証（WCAG 2.1 AA）
- Task 5: セキュリティ検証（XSS防止・CSP準拠）
- Task 6: パフォーマンス検証（不要な再レンダリングの排除）

## 参照資料

| 資料名                         | パス                                                                                                            | 説明                              |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| タスク仕様書                   | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-058a-ui-03-agent-view-enhancement.md`    | 元タスク仕様                      |
| Phase 5 実装成果物             | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/outputs/phase-5/implementation-summary.md` | 依存Phase 5 の成果物              |
| Phase 8 リファクタリング成果物 | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/outputs/phase-8/refactoring-report.md`     | リファクタリング結果              |
| コンポーネント実装             | `apps/desktop/src/renderer/components/organisms/AgentView/`                                                     | SkillChip, ExecuteButton 等       |
| AgentView統合                  | `apps/desktop/src/renderer/views/AgentView/index.tsx`                                                           | シングルカラムレイアウト          |
| UIコンポーネント仕様           | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                         | UIコンポーネント設計仕様          |
| デザイン原則                   | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`                                  | Apple HIG準拠デザイン原則         |
| デザインシステム               | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                                      | トークン・コントラスト・spacing   |
| UIアーキテクチャ               | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                                       | コンポーネントアーキテクチャ      |
| 状態管理仕様                   | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                    | Zustand設計原則                   |
| 実行UI仕様                     | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`                                    | 実行状態・Permission 導線         |
| 許可設定UI                     | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                                           | remembered permissions の基準     |
| スキル実行セキュリティ         | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`                                 | allowed tools / remembered choice |
| 実装パターン                   | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`                     | 型ドリフト・段階移行の確認        |
| 既知の落とし穴                 | `.claude/rules/06-known-pitfalls.md`                                                                            | P31, P39, P40, P47 等             |
| 品質要件仕様                   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                     | 品質ゲート基準                    |
| アクセシビリティ試験仕様       | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`                                    | WCAG検証観点                      |
| セキュリティ原則               | `.claude/skills/aiworkflow-requirements/references/security-principles.md`                                      | 入力検証/XSS対策                  |
| 設計差分記録                   | `outputs/phase-5/design-changes.md`                                                                             | Phase 5 成果物                    |

## 依存Phase成果物（参照必須）

- `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/outputs/phase-5/implementation-summary.md`
- `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/outputs/phase-8/refactoring-report.md`

## 実行手順

### ステップ1: Task 1 — TypeScript 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

全エラーを解消する。確認ポイント:

| 確認項目                                   | 対策                                                 |
| ------------------------------------------ | ---------------------------------------------------- |
| `strict: true` でのコンパイルエラー        | 型アサーション（`as`）を使わずに型を修正             |
| `any` 型の使用箇所                         | 明示的な型定義に置換                                 |
| `@ts-ignore` / `@ts-expect-error` の使用   | 根本原因を修正して除去（残す場合は理由コメント必須） |
| P24対策: ImportedSkill と Skill の型不一致 | 型アサーションを避け、セレクタの返す型をそのまま使用 |
| P46対策: HTMLAttributes Props型衝突        | `Omit<>` で衝突属性を除外                            |

### ステップ2: Task 2 — ESLint 実行

```bash
pnpm --filter @repo/desktop lint
```

全警告・エラーを解消する。確認ポイント:

| 確認項目               | 対策                                       |
| ---------------------- | ------------------------------------------ |
| 未使用の import        | 削除                                       |
| 未使用の変数           | 削除（アンダースコアプレフィックスは不可） |
| React Hooks ルール     | 依存配列の過不足を修正                     |
| アクセシビリティルール | `aria-*` 属性の追加・修正                  |

### ステップ3: Task 3 — 全テスト実行

```bash
# P40対策: 対象パッケージのディレクトリから実行
cd apps/desktop && pnpm vitest run src/renderer/components/organisms/AgentView/
cd apps/desktop && pnpm vitest run src/renderer/views/AgentView/
```

全テストケースが PASS することを確認する。

| テストファイル                   | 期待結果 |
| -------------------------------- | -------- |
| `SkillChip.test.tsx`             | 全件PASS |
| `ExecuteButton.test.tsx`         | 全件PASS |
| `FloatingExecutionBar.test.tsx`  | 全件PASS |
| `AdvancedSettingsPanel.test.tsx` | 全件PASS |
| `RecentExecutionList.test.tsx`   | 全件PASS |
| `AgentView.layout.test.tsx`      | 全件PASS |
| agentSlice 拡張テスト            | 全件PASS |

失敗するテストがある場合:

1. テストコード自体の問題か、実装コードの問題かを切り分ける
2. 実装コードの問題であれば修正する
3. テストコードの問題（リファクタリングによるインポートパス変更等）であればテストを修正する
4. 修正後に再度全テストを実行し、全件 PASS を確認する

### ステップ4: Task 4 — アクセシビリティ検証（WCAG 2.1 AA）

以下の項目を手動で確認し、不備があれば修正する。

#### 4-1. ARIA属性

| コンポーネント        | 必須属性                                                                      |
| --------------------- | ----------------------------------------------------------------------------- |
| SkillChip群コンテナ   | `role="radiogroup"` + `aria-label="ツール選択"`                               |
| 各SkillChip           | `role="radio"` + `aria-checked={isSelected}` + `aria-label={displayName}`     |
| ExecuteButton         | `aria-label` 設定（無効時: 「ツールを選んでください」、有効時: 「実行する」） |
| FloatingExecutionBar  | 停止ボタンに `aria-label="実行を停止"` 設定                                   |
| AdvancedSettingsPanel | `role="dialog"` + `aria-label="詳細設定"` + `aria-modal="true"`               |
| 歯車アイコンボタン    | `aria-label="詳細設定を開く"`                                                 |
| モデル選択グループ    | `role="radiogroup"` + `aria-label="AIの種類"`                                 |
| 閉じるボタン          | `aria-label="閉じる"`                                                         |

検証コマンド:

```bash
# ARIA属性の存在確認
grep -rn "role=" apps/desktop/src/renderer/components/organisms/AgentView/
grep -rn "aria-" apps/desktop/src/renderer/components/organisms/AgentView/
grep -rn "aria-" apps/desktop/src/renderer/views/AgentView/
```

#### 4-2. キーボード操作

| 操作対象              | Tab            | Enter      | Space      | Escape       |
| --------------------- | -------------- | ---------- | ---------- | ------------ |
| SkillChip             | フォーカス移動 | 選択トグル | 選択トグル | -            |
| ExecuteButton         | フォーカス移動 | 実行開始   | 実行開始   | -            |
| 歯車アイコン          | フォーカス移動 | パネル開く | パネル開く | -            |
| AdvancedSettingsPanel | -              | -          | -          | パネル閉じる |
| 停止ボタン            | フォーカス移動 | 実行停止   | 実行停止   | -            |
| RecentExecutionList   | フォーカス移動 | 詳細表示   | 詳細表示   | -            |

#### 4-3. コントラスト比

| 要素                     | 前景色                  | 背景色                  | 基準               |
| ------------------------ | ----------------------- | ----------------------- | ------------------ |
| プライマリテキスト       | `var(--text-primary)`   | `var(--bg-primary)`     | 4.5:1 以上         |
| セカンダリテキスト       | `var(--text-secondary)` | `var(--bg-primary)`     | 4.5:1 以上         |
| ExecuteButton テキスト   | `#FFFFFF`               | `var(--status-primary)` | 4.5:1 以上         |
| セクションヘッダー       | `var(--text-secondary)` | `var(--bg-primary)`     | 4.5:1 以上         |
| 無効状態のボタンテキスト | -                       | -                       | 3:1 以上（UI部品） |

### ステップ5: Task 5 — セキュリティ検証

| 確認項目                    | 確認方法                                                                                                       | 基準                           |
| --------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| XSS防止: ユーザー入力の表示 | `skillName`, `displayName` がJSX内で `{}` 経由で表示されており、`dangerouslySetInnerHTML` を使用していないこと | 使用箇所 0                     |
| CSP準拠: インラインスタイル | `style={{}}` の使用が最小限であること（Tailwindクラスを優先）                                                  | インラインスタイルは動的値のみ |
| CSP準拠: eval使用禁止       | `eval()`, `Function()` の使用がないこと                                                                        | 使用箇所 0                     |

検証コマンド:

```bash
grep -rn "dangerouslySetInnerHTML" apps/desktop/src/renderer/components/organisms/AgentView/
grep -rn "dangerouslySetInnerHTML" apps/desktop/src/renderer/views/AgentView/
grep -rn "eval(" apps/desktop/src/renderer/components/organisms/AgentView/
grep -rn "eval(" apps/desktop/src/renderer/views/AgentView/
```

### ステップ6: Task 6 — パフォーマンス検証

| 確認項目                     | 確認方法                                                                        | 基準                  |
| ---------------------------- | ------------------------------------------------------------------------------- | --------------------- |
| P31対策: 個別セレクタ使用    | `grep -rn "useAppStore()" AgentView/` の結果が 0 件                             | 一括分割代入 0 件     |
| 不要な再レンダリング: メモ化 | 頻繁に更新される親コンポーネントの子が `React.memo` で保護されていること        | 必要箇所にmemo適用    |
| コールバック安定性           | `onSelect`, `onExecute` 等のコールバックが `useCallback` で安定化されていること | 安定参照を確認        |
| リスト描画最適化             | SkillChip群、RecentExecutionList に適切な `key` が設定されていること            | `key={skill.name}` 等 |

## 統合テスト連携

品質保証で全テスト結果を最終確認する:

| 品質項目         | 確認内容                                                                          | 基準          |
| ---------------- | --------------------------------------------------------------------------------- | ------------- |
| TypeScript       | `pnpm --filter @repo/desktop typecheck`                                           | エラー 0      |
| ESLint           | `pnpm --filter @repo/desktop lint`                                                | 警告/エラー 0 |
| ユニットテスト   | `cd apps/desktop && pnpm vitest run src/renderer/components/organisms/AgentView/` | 全件 PASS     |
| レイアウトテスト | `cd apps/desktop && pnpm vitest run src/renderer/views/AgentView/`                | 全件 PASS     |
| アクセシビリティ | ARIA属性・キーボード操作・コントラスト比                                          | WCAG 2.1 AA   |
| セキュリティ     | XSS防止・CSP準拠                                                                  | 違反 0        |
| パフォーマンス   | 不要な再レンダリングなし・個別セレクタ使用                                        | 問題 0        |

## 多角的チェック観点

| 観点             | 適用判断 | 確認内容                                                                                        |
| ---------------- | -------- | ----------------------------------------------------------------------------------------------- |
| UI/UX            | 適用     | マイクロインタラクションが統一基準に従っていること、Apple HIG準拠のスタイルが維持されていること |
| セキュリティ     | 適用     | XSS防止（ユーザー入力のサニタイズ）、CSP準拠（eval禁止、インラインスクリプト禁止）              |
| アクセシビリティ | 適用     | WCAG 2.1 AA準拠（コントラスト比、キーボード操作、ARIA属性）                                     |
| パフォーマンス   | 適用     | Zustandセレクタ最適化（P31対策）、React.memo / useCallback の適切な使用                         |

**Electronデスクトップアプリ観点**:

| 層                         | 適用判断 | 確認内容                                                       |
| -------------------------- | -------- | -------------------------------------------------------------- |
| フロントエンド（Renderer） | 適用     | 全品質ゲートがRenderer層のコードに対して実行されていること     |
| IPC通信                    | 非適用   | IPC インターフェースは本タスクで変更しないため、品質検証対象外 |

## 成果物

| 成果物       | パス                                                                                                    | 説明                         |
| ------------ | ------------------------------------------------------------------------------------------------------- | ---------------------------- |
| 品質レポート | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/outputs/phase-9/quality-report.md` | 全品質ゲートの検証結果を記録 |

## 完了条件

- [ ] `pnpm --filter @repo/desktop typecheck` がエラー 0 で通ること
- [ ] `pnpm --filter @repo/desktop lint` が警告/エラー 0 で通ること
- [ ] `cd apps/desktop && pnpm vitest run src/renderer/components/organisms/AgentView/` が全件 PASS すること
- [ ] `cd apps/desktop && pnpm vitest run src/renderer/views/AgentView/` が全件 PASS すること
- [ ] SkillChip群に `role="radiogroup"` + `aria-label` が設定されていること
- [ ] 各SkillChipに `role="radio"` + `aria-checked` が設定されていること
- [ ] 全インタラクティブ要素に `aria-label` が設定されていること
- [ ] AdvancedSettingsPanelに `role="dialog"` + `aria-modal="true"` が設定されていること
- [ ] キーボード操作（Tab / Enter / Space / Escape）で全機能にアクセス可能であること
- [ ] コントラスト比が通常テキスト 4.5:1 以上、UI部品 3:1 以上であること
- [ ] `dangerouslySetInnerHTML` の使用箇所が 0 であること
- [ ] `eval()` / `Function()` の使用箇所が 0 であること
- [ ] `useAppStore()` の一括分割代入が AgentView 関連コンポーネントに存在しないこと（P31対策）
- [ ] 品質レポートが作成されていること
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. Task 1: TypeScript 型チェック
3. Task 2: ESLint 実行
4. Task 3: 全テスト実行
5. Task 4: アクセシビリティ検証
6. Task 5: セキュリティ検証
7. Task 6: パフォーマンス検証
8. 品質レポートの作成
9. 完了条件の検証

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

Phase 10: 最終レビューゲート
