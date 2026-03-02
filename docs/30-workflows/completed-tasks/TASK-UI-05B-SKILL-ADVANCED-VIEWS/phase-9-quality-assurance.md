# Phase 9: 品質保証

## メタ情報

| 項目       | 値                                      |
| ---------- | --------------------------------------- |
| Phase      | 9                                       |
| タスクID   | TASK-UI-05B-SKILL-ADVANCED-VIEWS        |
| 機能名     | スキル高度管理ビュー（4ビュー統合）     |
| 作成日     | 2026-03-01                              |
| 状態       | 完了                                    |
| 前Phase    | Phase 8（リファクタリング）             |
| 依存成果物 | `outputs/phase-8/refactoring-report.md` |

## 目的

4ビュー（SkillChainBuilder, ScheduleManager, DebugPanel, AnalyticsDashboard）が定義された品質基準（Lint, 型チェック, セキュリティ, パフォーマンス, アクセシビリティ）を全て満たすことを検証する。

---

## 実行タスク

- 静的品質検証: Lint/Typecheck/Format を実行して違反を解消する
- セキュリティ検証: IPC 経路・バリデーション・XSS 対策を検証する
- 性能検証: 再レンダリングと大量データ応答性を検証する
- a11y検証: WCAG 2.1 AA と ARIA/キーボード要件を検証する
- 回帰検証: 全テスト PASS を確認して品質ゲートを閉じる
- 証跡化: Phase 10 レビューに提出できる品質レポートを作成する

### Task 1: ESLint 実行と違反修正

```bash
cd apps/desktop && pnpm lint
```

検証対象ディレクトリ:

- `src/renderer/views/SkillChainBuilder/`
- `src/renderer/views/ScheduleManager/`
- `src/renderer/views/DebugPanel/`
- `src/renderer/views/AnalyticsDashboard/`
- `src/renderer/components/shared/` （Phase 8 で抽出した共通コンポーネント）

合格基準: ESLint 違反が 0 件

### Task 2: TypeScript 型チェック

```bash
cd apps/desktop && pnpm typecheck
```

検証項目:

| 項目                              | 合格基準                         |
| --------------------------------- | -------------------------------- |
| 型エラー                          | 0 件                             |
| `any` 型の使用                    | 0 箇所                           |
| `@ts-ignore` / `@ts-expect-error` | 0 箇所（理由コメント付きを除く） |
| 型アサーション（`as`）            | バリデーション付きのみ許可       |

検出コマンド:

```bash
# any 型の検出
grep -rn ": any" apps/desktop/src/renderer/views/SkillChainBuilder/ apps/desktop/src/renderer/views/ScheduleManager/ apps/desktop/src/renderer/views/DebugPanel/ apps/desktop/src/renderer/views/AnalyticsDashboard/

# ts-ignore の検出
grep -rn "@ts-ignore\|@ts-expect-error" apps/desktop/src/renderer/views/SkillChainBuilder/ apps/desktop/src/renderer/views/ScheduleManager/ apps/desktop/src/renderer/views/DebugPanel/ apps/desktop/src/renderer/views/AnalyticsDashboard/
```

### Task 3: Prettier フォーマット確認

```bash
cd apps/desktop && pnpm format:check
```

合格基準: フォーマット違反が 0 件

### Task 4: セキュリティ検証

#### 4-1. IPC チャネル名の定数使用確認（P27 対策）

```bash
# IPC_CHANNELS 定数以外のハードコード文字列を検出
grep -rn "safeInvoke\|safeOn" apps/desktop/src/renderer/views/SkillChainBuilder/ apps/desktop/src/renderer/views/ScheduleManager/ apps/desktop/src/renderer/views/DebugPanel/ apps/desktop/src/renderer/views/AnalyticsDashboard/ | grep -v "IPC_CHANNELS"
```

合格基準: ハードコード文字列でのチャネル指定が 0 箇所

#### 4-2. IPC 通信経路の検証

| 検証項目                     | 合格基準                                 |
| ---------------------------- | ---------------------------------------- |
| `safeInvoke` / `safeOn` 使用 | 全 IPC 呼び出しが safeInvoke/safeOn 経由 |
| `ipcRenderer` 直接呼び出し   | 0 箇所                                   |
| contextBridge 経由           | 全通信が Preload Bridge 経由             |

検出コマンド:

```bash
# ipcRenderer 直接使用の検出
grep -rn "ipcRenderer" apps/desktop/src/renderer/views/SkillChainBuilder/ apps/desktop/src/renderer/views/ScheduleManager/ apps/desktop/src/renderer/views/DebugPanel/ apps/desktop/src/renderer/views/AnalyticsDashboard/
```

#### 4-3. 文字列引数バリデーション確認（P42 対策）

IPC ハンドラ側で受け取る全文字列引数に対し、3段バリデーションが実装されていることを確認する:

1. `typeof` チェック
2. 空文字列（`=== ""`）チェック
3. トリム空文字列（`.trim() === ""`）チェック

#### 4-4. XSS 対策

| 検証項目                       | 合格基準                              |
| ------------------------------ | ------------------------------------- |
| `dangerouslySetInnerHTML` 使用 | 0 箇所                                |
| ユーザー入力の直接 DOM 挿入    | 0 箇所（React の JSX エスケープのみ） |
| URL パラメータの未検証使用     | 0 箇所                                |

### Task 5: パフォーマンス検証

#### 5-1. 再レンダリング最適化

| コンポーネント | 検証内容                                 | 合格基準                  |
| -------------- | ---------------------------------------- | ------------------------- |
| StepCard       | `React.memo` でメモ化されているか        | Props 変更時のみ再描画    |
| ScheduleRow    | テーブル行の不要な再描画がないか         | 該当行の Props 変更時のみ |
| UsageChart     | recharts の再描画が制御されているか      | データ変更時のみ再描画    |
| CallStackView  | ツリー展開時に全ノードが再描画されないか | 展開ノードのみ再描画      |

#### 5-2. 大量データ対応

| ビュー             | データ件数シナリオ   | 検証内容                                   |
| ------------------ | -------------------- | ------------------------------------------ |
| ScheduleManager    | スケジュール 100 件  | テーブル表示の応答性（仮想スクロール検討） |
| DebugPanel         | ステップ履歴 500 件  | StepHistoryList のスクロール性能           |
| AnalyticsDashboard | 30日間の時系列データ | UsageChart の描画速度                      |
| SkillChainBuilder  | チェーン 50 件       | ChainCardGrid の描画速度                   |

#### 5-3. recharts パフォーマンス

```typescript
// ResponsiveContainer のリサイズイベント最適化確認
// debounce が適用されていることを確認する
<ResponsiveContainer width="100%" height={300} debounce={100}>
```

### Task 6: アクセシビリティ検証（WCAG 2.1 AA）

#### 6-1. コントラスト比

| 要素                | 最小コントラスト比 | 検証方法                             |
| ------------------- | ------------------ | ------------------------------------ |
| 通常テキスト        | 4.5:1              | CSS 変数値から計算                   |
| 大テキスト（18px+） | 3:1                | CSS 変数値から計算                   |
| UI コンポーネント   | 3:1                | ボタン・入力フィールドの境界線       |
| アイコン            | 3:1                | 状態表示アイコン（成功/エラー/警告） |

#### 6-2. キーボード操作

| 操作       | キー   | 対象コンポーネント                             |
| ---------- | ------ | ---------------------------------------------- |
| フォーカス | Tab    | 全インタラクティブ要素（ボタン、入力、リンク） |
| 決定       | Enter  | ボタン、ダイアログ確認、リスト項目選択         |
| キャンセル | Escape | ダイアログ閉じ、ドロップダウン閉じ             |
| 移動       | Arrow  | ScheduleTable 行、StepHistoryList 項目         |

#### 6-3. ARIA 属性

| コンポーネント | 必須 ARIA 属性                                    |
| -------------- | ------------------------------------------------- |
| ダイアログ     | `role="dialog"`, `aria-labelledby`, `aria-modal`  |
| テーブル       | `role="table"`, `aria-label`                      |
| タブ           | `role="tablist"`, `role="tab"`, `aria-selected`   |
| アラート       | `role="alert"`, `aria-live="assertive"`           |
| ローディング   | `aria-busy="true"`, `aria-label`                  |
| トグルスイッチ | `role="switch"`, `aria-checked`                   |
| ツリービュー   | `role="tree"`, `role="treeitem"`, `aria-expanded` |

#### 6-4. スクリーンリーダー互換性

- 全ボタンに `aria-label` が設定されている（アイコンのみのボタンを含む）
- 状態変更時に `aria-live` 領域が更新される（デバッグ状態変更、スケジュール切り替え）
- チャートデータにテキスト代替が提供されている（`<title>` タグまたは `aria-label`）

### Task 7: 全テスト実行

```bash
# 4ビュー個別実行
cd apps/desktop && pnpm vitest run src/renderer/views/SkillChainBuilder/
cd apps/desktop && pnpm vitest run src/renderer/views/ScheduleManager/
cd apps/desktop && pnpm vitest run src/renderer/views/DebugPanel/
cd apps/desktop && pnpm vitest run src/renderer/views/AnalyticsDashboard/

# 共通コンポーネントのテスト
cd apps/desktop && pnpm vitest run src/renderer/components/shared/
```

合格基準: 全テストが PASS

---

## 参照資料

| 資料                       | 用途                                                                              |
| -------------------------- | --------------------------------------------------------------------------------- |
| Phase 5 実装サマリー       | 実装契約の検証基準                                                                |
| `02-code-quality.md`       | 型安全・コーディング規約                                                          |
| `04-electron-security.md`  | IPC セキュリティ原則                                                              |
| `01-architecture.md`       | WCAG 2.1 AA 基準、Apple HIG                                                       |
| `06-known-pitfalls.md` P27 | Preload ハードコード文字列                                                        |
| `06-known-pitfalls.md` P39 | happy-dom userEvent 非互換                                                        |
| `06-known-pitfalls.md` P40 | テスト実行ディレクトリ依存                                                        |
| `06-known-pitfalls.md` P42 | .trim() 3段バリデーション                                                         |
| aiworkflow セキュリティ    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      |
| aiworkflow IPC契約         | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              |
| aiworkflow 型契約          | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` |
| aiworkflow 状態管理        | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      |
| aiworkflow テスト規約      | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` |
| aiworkflow 品質要件        | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       |
| aiworkflow a11yテスト      | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`      |

---

## 実行手順

1. `cd apps/desktop && pnpm lint` を実行し、ESLint 違反を修正する
2. `cd apps/desktop && pnpm typecheck` を実行し、型エラーを修正する
3. `cd apps/desktop && pnpm format:check` を実行し、フォーマット違反を修正する
4. IPC チャネル名の定数使用を `grep` で検証する
5. `ipcRenderer` 直接呼び出しがないことを検証する
6. 文字列引数の 3段バリデーション実装を検証する
7. XSS 対策（`dangerouslySetInnerHTML` 不使用）を検証する
8. `React.memo` / `useMemo` / `useCallback` の使用箇所を確認する
9. WCAG 2.1 AA コントラスト比を計算検証する
10. キーボード操作と ARIA 属性を検証する
11. 全テストを実行し、全 PASS を確認する
12. 品質保証レポートを作成する

## 統合テスト連携【必須】

| 連携観点           | 実施内容                                 | 出力先                                    |
| ------------------ | ---------------------------------------- | ----------------------------------------- |
| Phase 5 実装契約   | 実装契約（型/IPC/Preload）逸脱を検出する | `outputs/phase-9/quality-report.md`       |
| Phase 6/7 テスト   | 追加テストとカバレッジ達成を最終確認する | `outputs/phase-9/quality-report.md`       |
| Phase 8 リファクタ | リファクタ後の退行を検出する             | `outputs/phase-9/quality-report.md`       |
| Phase 10 レビュー  | PASS/MINOR 判定材料を定量化する          | `outputs/phase-10/final-review-result.md` |

---

## 成果物

| 成果物           | パス                                | 説明                                          |
| ---------------- | ----------------------------------- | --------------------------------------------- |
| 品質保証レポート | `outputs/phase-9/quality-report.md` | 全検証結果（Lint, 型, セキュリティ, a11y 他） |

---

## 完了条件

- [ ] ESLint 違反が 0 件
- [ ] TypeScript 型エラーが 0 件
- [ ] `any` 型の使用が 0 箇所
- [ ] `@ts-ignore` / `@ts-expect-error` が 0 箇所（理由コメント付きを除く）
- [ ] Prettier フォーマット違反が 0 件
- [ ] IPC チャネル名が全て `IPC_CHANNELS` 定数で参照されている（P27 対策）
- [ ] `ipcRenderer` 直接呼び出しが 0 箇所
- [ ] 文字列引数に .trim() 3段バリデーションが実装されている（P42 対策）
- [ ] `dangerouslySetInnerHTML` の使用が 0 箇所
- [ ] WCAG 2.1 AA コントラスト比基準を満たしている（通常テキスト 4.5:1、大テキスト/UI部品 3:1）
- [ ] 全インタラクティブ要素がキーボード操作可能（Tab, Enter, Escape）
- [ ] 全ダイアログに `role="dialog"`, `aria-labelledby`, `aria-modal` が設定されている
- [ ] 全テストが PASS している
- [ ] 品質保証レポート（`outputs/phase-9/quality-report.md`）が作成されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 10: 最終レビューゲート
