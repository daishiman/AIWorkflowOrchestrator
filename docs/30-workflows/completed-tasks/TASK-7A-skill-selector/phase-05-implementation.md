# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値                     |
| ------ | ---------------------- |
| Phase  | 5                      |
| 機能名 | TASK-7A-skill-selector |
| 作成日 | 2026-01-30             |

## 目的

Phase 4 で作成したテストを通すための最小限の実装を行う。

## 実行タスク

- SkillSelector コンポーネント実装: メインコンポーネントの作成
- SkillOption サブコンポーネント実装: インポート済みスキル用オプション
- SkillOptionUnimported サブコンポーネント実装: 未インポートスキル用オプション
- barrel export 作成: index.ts の作成
- キーボードナビゲーション実装: handleKeyDown ハンドラー
- 外側クリック検知実装: useEffect + mousedown イベント

## 参照資料

| 資料名             | パス                                                                          | 説明          |
| ------------------ | ----------------------------------------------------------------------------- | ------------- |
| 要件定義書         | `outputs/phase-1/requirements-definition.md`                                  | Phase 1成果物 |
| コンポーネント設計 | `outputs/phase-2/component-design.md`                                         | Phase 2成果物 |
| テスト仕様書       | `outputs/phase-4/test-specification.md`                                       | Phase 4成果物 |
| テストファイル     | `apps/desktop/src/renderer/components/skill/__tests__/SkillSelector.test.tsx` | テストコード  |
| ModelSelector      | `apps/desktop/src/renderer/components/llm/ModelSelector.tsx`                  | 参考パターン  |
| SkillSlice         | `apps/desktop/src/renderer/store/slices/skillSlice.ts`                        | 状態管理定義  |

### システム仕様（aiworkflow-requirements）

| 参照資料              | パス                                                                              | 内容               |
| --------------------- | --------------------------------------------------------------------------------- | ------------------ |
| UI/UXデザインシステム | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`        | スタイリング基準   |
| 状態管理              | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | Zustandパターン    |
| Skill型定義           | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | 型インターフェース |

## 実行手順

### ステップ1: SkillSelector.tsx 作成

`apps/desktop/src/renderer/components/skill/SkillSelector.tsx` を作成する。

**実装内容**:

1. `SkillSelectorProps` インターフェース定義
2. `useAppStore` からの状態・アクション取得
3. `isOpen` / `focusedIndex` ローカルState管理
4. 外側クリック検知 `useEffect`
5. `handleToggle` / `handleSelect` / `handleKeyDown` ハンドラー
6. トリガーボタン描画（ARIA属性付き）
7. ドロップダウンパネル描画（`role="listbox"`）
8. 「なし」オプション
9. インポート済みセクション + `SkillOption` ループ
10. 利用可能スキルセクション + `SkillOptionUnimported` ループ
11. フッター（再スキャンボタン）

**実装ファイルのJSDoc**:

```typescript
/**
 * @file SkillSelector Component
 * @description スキル選択ドロップダウン
 * @feature skill-import-agent-system
 * @see specification.md 4.2 SkillSelector詳細
 */
```

### ステップ2: SkillOption サブコンポーネント実装

同一ファイル内で `SkillOption` を定義（Phase 2設計に準拠）。

**表示内容**:

- 選択インジケータ（✓ or ○）
- スキル名 or ラベル
- 説明文（truncate）
- サブエージェント数・参照資料数

### ステップ3: SkillOptionUnimported サブコンポーネント実装

未インポートスキル用のオプション。インポートボタンのコールバックはTASK-7Bで接続予定。

### ステップ4: キーボードナビゲーション実装

ModelSelector.tsx の `handleKeyDown` パターンに準拠し実装:

```typescript
const handleKeyDown = useCallback(
  (event: React.KeyboardEvent) => {
    switch (event.key) {
      case "Enter":
      case " ":
        // 開いていればフォーカス中を選択、閉じていれば開く
        break;
      case "Escape":
        setIsOpen(false);
        break;
      case "ArrowDown":
        // 閉じていれば開く + 最初にフォーカス、開いていれば次へ
        break;
      case "ArrowUp":
        // 前のオプションへフォーカス移動
        break;
      case "Home":
        // 最初のオプションへフォーカス移動
        break;
      case "End":
        // 最後のオプションへフォーカス移動
        break;
      case "Tab":
        setIsOpen(false);
        break;
    }
  },
  [
    /* dependencies */
  ],
);
```

### ステップ5: barrel export 作成

```typescript
// apps/desktop/src/renderer/components/skill/index.ts
export { SkillSelector } from "./SkillSelector";
export type { SkillSelectorProps } from "./SkillSelector";
```

### ステップ6: テスト実行確認（Green）

```bash
pnpm --filter @repo/desktop test -- --run apps/desktop/src/renderer/components/skill/__tests__/SkillSelector.test.tsx
```

## 統合テスト連携【必須】

フロント/Store接続の実装とテスト確認:

| 実装項目       | 内容                                                     |
| -------------- | -------------------------------------------------------- |
| Zustand Store  | `useAppStore()` で skillSlice の全状態・アクションを取得 |
| 選択アクション | `selectSkill(name)` 呼び出しで即座に状態更新             |
| 再スキャン     | `rescanSkills()` 呼び出しで isScanning フラグ制御        |

## アーキテクチャ層別実装（AIが判断）

| 層                         | 実装観点                             | 実装ファイル配置                                               | 仕様参照先                                        |
| -------------------------- | ------------------------------------ | -------------------------------------------------------------- | ------------------------------------------------- |
| フロントエンド（Renderer） | Reactコンポーネント、Hooks、Tailwind | `apps/desktop/src/renderer/components/skill/SkillSelector.tsx` | `aiworkflow-requirements: ui-ux-design-system.md` |

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点               | 適用判断                               | 仕様参照先                                   |
| ------------------ | -------------------------------------- | -------------------------------------------- |
| セキュリティ       | スキル名・説明文の表示時XSS防止        | `aiworkflow-requirements: security-*.md`     |
| UI/UX              | フロントエンド実装のため適用           | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | Renderer Process内完結の確認           | `aiworkflow-requirements: architecture-*.md` |
| エラーハンドリング | rescanSkills失敗時の表示・空リスト対応 | `aiworkflow-requirements: error-handling.md` |
| パフォーマンス     | 不要な再レンダリング防止               | `aiworkflow-requirements: architecture-*.md` |
| アクセシビリティ   | WAI-ARIA Listboxパターン準拠           | `aiworkflow-requirements: ui-ux-*.md`        |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断               | 仕様参照先                            |
| -------------------------- | ---------------------- | ------------------------------------- |
| フロントエンド（Renderer） | UI/React実装のため適用 | `aiworkflow-requirements: ui-ux-*.md` |

## 成果物

| 成果物        | パス                                                           | 説明                 |
| ------------- | -------------------------------------------------------------- | -------------------- |
| SkillSelector | `apps/desktop/src/renderer/components/skill/SkillSelector.tsx` | メインコンポーネント |
| barrel export | `apps/desktop/src/renderer/components/skill/index.ts`          | エクスポート         |
| 実装サマリー  | `outputs/phase-5/implementation-summary.md`                    | 実装記録             |

## 完了条件

- [ ] SkillSelector.tsx が作成されている
- [ ] SkillOption サブコンポーネントが実装されている
- [ ] SkillOptionUnimported サブコンポーネントが実装されている
- [ ] index.ts（barrel export）が作成されている
- [ ] キーボードナビゲーションが実装されている
- [ ] 外側クリック検知が実装されている
- [ ] すべてのテストが成功状態（Green）
- [ ] TypeScript型エラーがない
- [ ] ESLint / Prettier 準拠
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- --run apps/desktop/src/renderer/components/skill/__tests__/SkillSelector.test.tsx

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
```

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 2設計、Phase 4テスト）
2. SkillSelector.tsx の作成
3. SkillOption / SkillOptionUnimported の実装
4. キーボードナビゲーションの実装
5. 外側クリック検知の実装
6. barrel export（index.ts）の作成
7. テスト実行・Green状態の確認
8. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-7A-skill-selector --phase 5
```

## 次のPhase

Phase 6: テスト拡充
