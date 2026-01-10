# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値                    |
| ------ | --------------------- |
| Phase  | 5                     |
| 機能名 | history-ui-components |
| 作成日 | 2026-01-10            |

## 目的

テストを通すための最小限の実装を行う。

## 使用スキル

| スキル                           | 選定理由                              |
| -------------------------------- | ------------------------------------- |
| `clean-code-practices`           | 読みやすく保守性の高いコード実装      |
| `accessibility-wcag`             | WCAG 2.1 AA準拠のアクセシビリティ実装 |
| `apple-hig-guidelines`           | macOSネイティブなUI/UX実装            |
| `component-composition-patterns` | Reactコンポーネントの構成パターン     |
| `custom-hooks-patterns`          | カスタムフック実装パターン            |

## 参照資料

| 資料名       | パス                                         | 説明          |
| ------------ | -------------------------------------------- | ------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| 設計書       | `outputs/phase-2/architecture-design.md`     | Phase 2成果物 |
| テスト仕様書 | `outputs/phase-4/test-specification.md`      | Phase 4成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料            | パス                                                                        | 内容                   |
| ------------------- | --------------------------------------------------------------------------- | ---------------------- |
| UI/UXコンポーネント | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`     | コンポーネント設計原則 |
| デザインシステム    | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`  | Design Tokens          |
| インターフェース    | `.claude/skills/aiworkflow-requirements/references/interfaces-converter.md` | IHistoryService型      |

## 実行手順

### ステップ1: カスタムフック実装

`custom-hooks-patterns`スキルを参照し、データ取得フックを実装する。

**実装ファイル:**

- `apps/desktop/src/renderer/hooks/useVersionHistory.ts`
- `apps/desktop/src/renderer/hooks/useVersionDetail.ts`
- `apps/desktop/src/renderer/hooks/useConversionLogs.ts`
- `apps/desktop/src/renderer/hooks/useRestore.ts`

**実装ポイント:**

- useState/useCallbackを使用した状態管理
- useEffectで初期データ取得
- Result型を使用したエラーハンドリング
- オフセットベースのページネーション

### ステップ2: コンポーネント実装

`component-composition-patterns`スキルを参照し、UIコンポーネントを実装する。

**実装ファイル:**

- `apps/desktop/src/renderer/components/history/VersionHistory.tsx`
- `apps/desktop/src/renderer/components/history/VersionDetail.tsx`
- `apps/desktop/src/renderer/components/history/ConversionLogs.tsx`
- `apps/desktop/src/renderer/components/history/RestoreDialog.tsx`

**実装ポイント:**

- Tailwind CSSを使用したスタイリング
- Atomic Designに基づく階層構造
- 条件付きレンダリング（ローディング/エラー/空状態）
- コールバックProps（onSelect, onRestore等）

### ステップ3: アクセシビリティ実装

`accessibility-wcag`スキルを参照し、WCAG 2.1 AA準拠を実装する。

**実装項目:**

| 項目                     | 実装内容                                  |
| ------------------------ | ----------------------------------------- |
| キーボードナビゲーション | tabIndex、onKeyDown（Enter/Space/Escape） |
| フォーカス管理           | モーダルのフォーカストラップ              |
| ARIA属性                 | role, aria-label, aria-describedby        |
| 色だけに頼らない情報伝達 | アイコン + テキストラベル                 |
| フォーカスインジケータ   | focus:ring-2, focus-visible               |

### ステップ4: Electronネイティブ連携

`apple-hig-guidelines`スキルを参照し、macOS向けのUI調整を行う。

**実装項目:**

| 項目           | 実装内容                      |
| -------------- | ----------------------------- |
| アニメーション | ease-out, 200-300ms           |
| スクロール     | overflow-auto, scroll-smooth  |
| ボタンスタイル | rounded-lg, hover/active状態  |
| モーダル       | backdrop-blur, 角丸、シャドウ |

## 統合テスト連携【必須】

フロント/バック接続の実装とテスト支援コード整備:

| 実装項目           | 内容                               |
| ------------------ | ---------------------------------- |
| IPC接続            | window.historyAPI経由でのIPCコール |
| エラーハンドリング | IPC通信失敗時のフォールバックUI    |
| 状態同期           | 復元後の履歴一覧自動リフレッシュ   |

## 成果物

| 成果物         | パス                                                 | 説明             |
| -------------- | ---------------------------------------------------- | ---------------- |
| フック実装     | `apps/desktop/src/renderer/hooks/use*.ts`            | カスタムフック   |
| コンポーネント | `apps/desktop/src/renderer/components/history/*.tsx` | UIコンポーネント |

## 完了条件

- [ ] すべてのテストが成功状態（Green）
- [ ] 実装が最小限に抑えられている（YAGNI原則）
- [ ] フロント/バック接続が実装されている
- [ ] アクセシビリティ要件が実装されている
- [ ] TypeScript型エラーがない
- [ ] **本Phase内の全スキルを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
```

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. useVersionHistoryフックの実装
3. useVersionDetailフックの実装
4. useConversionLogsフックの実装
5. useRestoreフックの実装
6. VersionHistoryコンポーネントの実装
7. VersionDetailコンポーネントの実装
8. ConversionLogsコンポーネントの実装
9. RestoreDialogコンポーネントの実装
10. アクセシビリティ実装
11. テスト成功（Green状態）の確認

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各スキルの成果物が生成されている
- [ ] スキルフィードバックがLOGS.mdに記録されている
- [ ] artifacts.jsonが更新されている

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/history-ui-components --phase 5
```

## 次のPhase

Phase 6: テスト拡充
