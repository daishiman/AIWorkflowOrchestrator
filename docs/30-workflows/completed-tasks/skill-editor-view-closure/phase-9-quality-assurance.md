# Phase 9: 品質保証

## メタ情報

| 項目       | 値                                   |
| ---------- | ------------------------------------ |
| Phase      | 9                                    |
| タスクID   | UT-UI-05A-IMPLEMENTATION-CLOSURE-001 |
| 機能名     | SkillEditorView 実装残課題収束       |
| 作成日     | 2026-03-03                           |
| 前Phase    | Phase 8（リファクタリング）          |
| 依存成果物 | `outputs/phase-8/refactoring-log.md` |

## 目的

7課題（UT-UI-05A-001〜007）の実装が定義された品質基準（Lint・型チェック・セキュリティ・アクセシビリティ・パフォーマンス）を全て満たすことを検証する。Phase 10 最終レビューへ提出できる品質証跡を作成する。

---

## 実行タスク

- 静的品質検証: Lint/Typecheck の違反を解消する
- セキュリティ検証: キーボードショートカット・入力値・IPC 経路を検証する
- アクセシビリティ検証: WCAG 2.1 AA 準拠（UT-UI-05A-001・002・005 重点確認）を検証する
- パフォーマンス検証: マイクロアニメーション・再レンダリングの最適性を検証する
- 回帰検証: 全テスト PASS を確認して品質ゲートを閉じる
- 証跡化: Phase 10 レビューに提出できる品質レポートを作成する

### Task 1: ESLint 実行と違反修正

```bash
cd apps/desktop && pnpm lint
```

検証対象ディレクトリ:

- `src/renderer/views/SkillEditorView/`
- `src/renderer/views/SkillEditorView/components/`
- `src/renderer/views/SkillEditorView/hooks/`

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
grep -rn ": any" apps/desktop/src/renderer/views/SkillEditorView/

# ts-ignore の検出
grep -rn "@ts-ignore\|@ts-expect-error" apps/desktop/src/renderer/views/SkillEditorView/
```

### Task 3: Prettier フォーマット確認

```bash
cd apps/desktop && pnpm format:check
```

合格基準: フォーマット違反が 0 件

### Task 4: セキュリティ検証

#### 4-1. IPC チャネル名の定数使用確認（P27 対策）

ナビゲーション導線配線（UT-UI-05A-006）と Cmd/Ctrl+S ショートカット（UT-UI-05A-003）で追加した IPC 呼び出しが `IPC_CHANNELS` 定数を使用していることを確認する。

```bash
# IPC_CHANNELS 定数以外のハードコード文字列を検出
grep -rn "safeInvoke\|safeOn" apps/desktop/src/renderer/views/SkillEditorView/ \
  | grep -v "IPC_CHANNELS"
```

合格基準: ハードコード文字列でのチャネル指定が 0 箇所

#### 4-2. IPC 通信経路の検証

| 検証項目                     | 合格基準                                 |
| ---------------------------- | ---------------------------------------- |
| `safeInvoke` / `safeOn` 使用 | 全 IPC 呼び出しが safeInvoke/safeOn 経由 |
| `ipcRenderer` 直接呼び出し   | 0 箇所                                   |
| contextBridge 経由           | 全通信が Preload Bridge 経由             |

```bash
# ipcRenderer 直接使用の検出
grep -rn "ipcRenderer" apps/desktop/src/renderer/views/SkillEditorView/
```

#### 4-3. キーボードショートカットのセキュリティ確認（UT-UI-05A-003）

Cmd/Ctrl+S ショートカットで発火する保存処理が、以下のセキュリティ要件を満たしていることを確認する。

| 確認項目                                             | 合格基準                                             |
| ---------------------------------------------------- | ---------------------------------------------------- |
| 保存前にファイルパスのバリデーションが実施されている | パストラバーサル攻撃（`../`）が拒否される            |
| 読み取り専用ファイルへの保存が拒否される             | `isReadOnly` フラグを確認してから保存 IPC を呼び出す |
| 連続保存の多重実行が防止されている                   | `isSaving` フラグで 2 重実行をガード                 |

#### 4-4. XSS 対策

| 検証項目                         | 合格基準                                 |
| -------------------------------- | ---------------------------------------- |
| `dangerouslySetInnerHTML` 使用   | 0 箇所                                   |
| ユーザー入力の直接 DOM 挿入      | 0 箇所（React の JSX エスケープのみ）    |
| ファイル名・スキル名の未検証表示 | React が自動エスケープしていることを確認 |

```bash
# dangerouslySetInnerHTML の検出
grep -rn "dangerouslySetInnerHTML" apps/desktop/src/renderer/views/SkillEditorView/
```

### Task 5: アクセシビリティ検証（WCAG 2.1 AA）

#### 5-1. FileTree キーボードナビゲーション（UT-UI-05A-001）

| 操作                 | キー                       | 検証内容                                 | 合格基準                     |
| -------------------- | -------------------------- | ---------------------------------------- | ---------------------------- |
| フォーカス移動（次） | `Tab`                      | FileTreeNode 間のフォーカス移動          | 全ノードにフォーカスが当たる |
| フォーカス移動（前） | `Shift+Tab`                | 逆順のフォーカス移動                     | 正しく逆順に移動する         |
| ファイル選択         | `Enter` / `Space`          | 選択されたファイルがエディタに表示される | onSelect が呼ばれる          |
| 上へ移動             | `ArrowUp`                  | 前のノードにフォーカス移動               | フォーカス位置が1つ上に移動  |
| 下へ移動             | `ArrowDown`                | 次のノードにフォーカス移動               | フォーカス位置が1つ下に移動  |
| フォルダ開閉         | `ArrowRight` / `ArrowLeft` | フォルダノードの展開・折りたたみ         | aria-expanded が更新される   |

#### 5-2. モバイルドロワー（UT-UI-05A-002）

| 検証項目                                                             | 合格基準                            |
| -------------------------------------------------------------------- | ----------------------------------- |
| ドロワーが開いている間、背景コンテンツへのフォーカスが移動しない     | フォーカストラップが実装されている  |
| ドロワーを `Escape` キーで閉じられる                                 | キーダウンリスナーで Escape を処理  |
| ドロワーが開いた際、最初のフォーカス可能な要素にフォーカスが移動する | autoFocus または programmatic focus |
| ドロワーに `role="dialog"` と `aria-label` が設定されている          | ARIA 属性が適切                     |

#### 5-3. 読み取り専用表示（UT-UI-05A-005）

| 検証項目                                                                   | 合格基準                                    |
| -------------------------------------------------------------------------- | ------------------------------------------- |
| 読み取り専用の状態がスクリーンリーダーに伝達される                         | `aria-readonly="true"` またはテキスト通知   |
| 読み取り専用バナー/インジケーターに適切な ARIA 属性がある                  | `role="status"` または `aria-live="polite"` |
| 読み取り専用時に保存ボタンが無効化され、その理由がアクセシブルに説明される | `aria-disabled` と `aria-describedby`       |

#### 5-4. コントラスト比

| 要素                              | 最小コントラスト比 | 検証方法                 |
| --------------------------------- | ------------------ | ------------------------ |
| 通常テキスト                      | 4.5:1              | CSS 変数値から計算       |
| 大テキスト（18px+）               | 3:1                | CSS 変数値から計算       |
| UI コンポーネント（ボタン境界線） | 3:1                | デザイントークンから計算 |
| 読み取り専用バナーのテキスト      | 4.5:1              | 背景色とテキスト色の比率 |
| Toast 通知のテキスト              | 4.5:1              | 各 Toast タイプ別に検証  |

#### 5-5. ARIA 属性の網羅確認

| コンポーネント               | 必須 ARIA 属性                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------ |
| FileTreeNode（ファイル）     | `role="treeitem"`, `aria-selected`, `aria-label`                                     |
| FileTreeNode（ディレクトリ） | `role="treeitem"`, `aria-expanded`, `aria-label`                                     |
| FileTreePanel                | `role="tree"`, `aria-label`                                                          |
| モバイルドロワー             | `role="dialog"`, `aria-modal`, `aria-label`                                          |
| Toast 通知                   | `role="alert"`, `aria-live="assertive"`（エラー）または `aria-live="polite"`（成功） |
| 読み取り専用バナー           | `role="status"` または `aria-live="polite"`                                          |
| 保存ボタン（読み取り専用時） | `aria-disabled="true"`, `aria-describedby`                                           |

### Task 6: パフォーマンス検証

#### 6-1. マイクロアニメーションの適切性（UT-UI-05A-007）

| 検証項目                                                | 合格基準                                                           |
| ------------------------------------------------------- | ------------------------------------------------------------------ |
| アニメーション時間が 200-300ms の範囲内                 | CSS 変数 `--animation-duration-*` で定義されている                 |
| `prefers-reduced-motion` に対応している                 | `@media (prefers-reduced-motion: reduce)` でアニメーションを無効化 |
| GPU 合成レイヤーで `transform`/`opacity` を使用している | `transform` / `opacity` を使用（`top/left` ではなく）              |

#### 6-2. 再レンダリング最適化

| コンポーネント | 検証内容                                             | 合格基準                         |
| -------------- | ---------------------------------------------------- | -------------------------------- |
| FileTreeNode   | `React.memo` でメモ化されているか                    | 親の再描画時に不要な再描画がない |
| FileTreePanel  | キーボードナビゲーション追加後も不要な再描画がないか | 操作中のノードのみ再描画         |
| EditorToolBar  | 保存状態変更時のみ再描画されているか                 | `isSaving` 変化時のみ更新        |
| Toast 通知     | 表示・非表示の切り替えが最適か                       | DOM 操作が最小限                 |

#### 6-3. useCallback / useMemo の適切性

```bash
# useCallback/useMemo 未使用の大きなハンドラを検出（目安として行数確認）
grep -rn "const handle\w* = " apps/desktop/src/renderer/views/SkillEditorView/ \
  --include="*.tsx"
```

### Task 7: 全テスト実行

```bash
# SkillEditorView 全テスト実行
cd apps/desktop && pnpm vitest run src/renderer/views/SkillEditorView/

# カバレッジ付きで実行（Phase 7 からの退行チェック）
cd apps/desktop && pnpm vitest run --coverage src/renderer/views/SkillEditorView/
```

合格基準: 全テストが PASS

カバレッジ基準（Phase 7 から退行していないこと）:

| 指標              | 最低基準 |
| ----------------- | -------- |
| Line Coverage     | 80%+     |
| Branch Coverage   | 60%+     |
| Function Coverage | 80%+     |

---

## 参照資料

| 資料                         | 用途                                                                              |
| ---------------------------- | --------------------------------------------------------------------------------- |
| Phase 5 実装サマリー         | 実装契約の検証基準                                                                |
| Phase 8 リファクタリングログ | リファクタ後の変更点確認                                                          |
| `01-architecture.md`         | WCAG 2.1 AA 基準、Apple HIG                                                       |
| `02-code-quality.md`         | 型安全・コーディング規約                                                          |
| `04-electron-security.md`    | IPC セキュリティ原則                                                              |
| `06-known-pitfalls.md` P27   | Preload ハードコード文字列                                                        |
| `06-known-pitfalls.md` P39   | happy-dom userEvent 非互換                                                        |
| `06-known-pitfalls.md` P40   | テスト実行ディレクトリ依存                                                        |
| `06-known-pitfalls.md` P42   | .trim() 3段バリデーション                                                         |
| `06-known-pitfalls.md` P47   | CSS 変数ベーステストアサーション                                                  |
| aiworkflow セキュリティ      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      |
| aiworkflow IPC契約           | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              |
| aiworkflow アクセシビリティ  | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`      |
| aiworkflow テスト規約        | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` |
| aiworkflow 品質要件          | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       |

---

## 実行手順

1. `cd apps/desktop && pnpm lint` を実行し、ESLint 違反を修正する
2. `cd apps/desktop && pnpm typecheck` を実行し、型エラーを修正する
3. `cd apps/desktop && pnpm format:check` を実行し、フォーマット違反を修正する
4. IPC チャネル名の定数使用を `grep` で検証する（P27 対策）
5. `ipcRenderer` 直接呼び出しがないことを検証する
6. キーボードショートカットのセキュリティ確認（保存ガード、読み取り専用ガード）を実施する
7. `dangerouslySetInnerHTML` 不使用を確認する
8. FileTree キーボードナビゲーションの ARIA 属性と操作性を検証する（UT-UI-05A-001）
9. モバイルドロワーのフォーカストラップと ARIA 属性を検証する（UT-UI-05A-002）
10. 読み取り専用表示の ARIA 通知を検証する（UT-UI-05A-005）
11. コントラスト比を計算検証する（全コンポーネント）
12. マイクロアニメーションの時間・`prefers-reduced-motion` 対応を検証する（UT-UI-05A-007）
13. 再レンダリング最適化の適切性を確認する
14. 全テストを実行し、全 PASS を確認する
15. 品質保証レポートを作成する

## 統合テスト連携【必須】

| 連携観点           | 実施内容                                 | 出力先                                    |
| ------------------ | ---------------------------------------- | ----------------------------------------- |
| Phase 5 実装契約   | 実装契約（型/IPC/Preload）逸脱を検出する | `outputs/phase-9/quality-report.md`       |
| Phase 6/7 テスト   | 追加テストとカバレッジ達成を最終確認する | `outputs/phase-9/quality-report.md`       |
| Phase 8 リファクタ | リファクタ後の退行を検出する             | `outputs/phase-9/quality-report.md`       |
| Phase 10 レビュー  | PASS/MINOR 判定材料を定量化する          | `outputs/phase-10/final-review-result.md` |

---

## 成果物

| 成果物           | パス                                | 説明                                                       |
| ---------------- | ----------------------------------- | ---------------------------------------------------------- |
| 品質保証レポート | `outputs/phase-9/quality-report.md` | 全検証結果（Lint・型・セキュリティ・a11y・パフォーマンス） |

---

## 完了条件

- [ ] ESLint 違反が 0 件
- [ ] TypeScript 型エラーが 0 件
- [ ] `any` 型の使用が 0 箇所
- [ ] `@ts-ignore` / `@ts-expect-error` が 0 箇所（理由コメント付きを除く）
- [ ] Prettier フォーマット違反が 0 件
- [ ] IPC チャネル名が全て `IPC_CHANNELS` 定数で参照されている（P27 対策）
- [ ] `ipcRenderer` 直接呼び出しが 0 箇所
- [ ] キーボードショートカットに保存ガード（isSaving・isReadOnly）が実装されている
- [ ] `dangerouslySetInnerHTML` の使用が 0 箇所
- [ ] FileTreeNode に `role="treeitem"`, `aria-selected`, `aria-expanded` が設定されている（UT-UI-05A-001）
- [ ] モバイルドロワーにフォーカストラップと `role="dialog"` が実装されている（UT-UI-05A-002）
- [ ] 読み取り専用状態が `aria-readonly` または `aria-live` で通知されている（UT-UI-05A-005）
- [ ] WCAG 2.1 AA コントラスト比基準を満たしている（通常テキスト 4.5:1、大テキスト/UI部品 3:1）
- [ ] マイクロアニメーションが 200-300ms 範囲内で `prefers-reduced-motion` に対応している（UT-UI-05A-007）
- [ ] 全テストが PASS している
- [ ] 品質保証レポート（`outputs/phase-9/quality-report.md`）が作成されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 10: 最終レビュー
