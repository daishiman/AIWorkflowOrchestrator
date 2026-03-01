# Phase 9: 品質保証

## メタ情報

| 項目       | 値                                        |
| ---------- | ----------------------------------------- |
| タスク ID  | TASK-UI-05-SKILL-CENTER-VIEW              |
| Phase      | 9                                         |
| 機能名     | SkillCenterView（ツールを探す）           |
| 作成日     | 2026-03-01                                |
| 前提条件   | Phase 8（リファクタリング）完了           |
| 成果物パス | `outputs/phase-9/quality-verification.md` |

## 目的

Phase 8 までに完成した SkillCenterView の全コードに対し、定義された品質基準をすべて満たすことを検証する。Lint・型チェック・全テスト実行を通じて、Phase 10（最終レビュー）に進む前の品質ゲートをクリアする。

## 実行タスク

- Lint 検証: ESLint 通過の確認
- 型チェック: TypeScript 型チェック通過の確認
- 全テスト実行: ユニット・統合テスト全 PASS の確認
- コード品質ルール遵守確認: プロジェクト規約への準拠検証
- Atomic Design 準拠確認: コンポーネント構成の検証
- Apple HIG / WCAG 2.1 AA 準拠確認: デザイン・アクセシビリティ検証

## 参照資料

| 資料名               | パス                                        | 説明                               |
| -------------------- | ------------------------------------------- | ---------------------------------- |
| Phase 5 実装         | `outputs/phase-5/implementation-summary.md` | 実装内容と品質ゲート対象の対応確認 |
| Phase 8 レポート     | `outputs/phase-8/refactoring-report.md`     | リファクタリング結果               |
| コード品質ルール     | `.claude/rules/02-code-quality.md`          | 品質基準                           |
| アーキテクチャルール | `.claude/rules/01-architecture.md`          | Atomic Design・カラー              |
| セキュリティルール   | `.claude/rules/04-electron-security.md`     | IPC セキュリティ原則               |
| 状態管理ルール       | `.claude/rules/03-state-management.md`      | Zustand 設計原則                   |
| 既知の落とし穴       | `.claude/rules/06-known-pitfalls.md`        | P31,P39,P40,P44,P45,P47            |
| タスク定義           | `task-030-ui-05-skill-center-view.md`       | TASK-UI-05 全仕様                  |

## 実行手順

### ステップ 1: Lint 検証（ESLint）

```bash
# ESLint 実行
pnpm lint

# SkillCenterView 固有のファイルに絞って確認
pnpm eslint apps/desktop/src/renderer/views/SkillCenterView/ --ext .ts,.tsx
```

**品質ゲート**: エラー 0 件、警告 0 件（auto-fix 適用後）

| 確認項目         | 基準               | 結果       |
| ---------------- | ------------------ | ---------- |
| ESLint エラー    | 0 件               | {{RESULT}} |
| ESLint 警告      | 0 件               | {{RESULT}} |
| 未使用 import    | 0 件               | {{RESULT}} |
| console.log 残留 | 0 件（テスト除外） | {{RESULT}} |

### ステップ 2: 型チェック（TypeScript）

```bash
# TypeScript 型チェック
pnpm typecheck
```

**品質ゲート**: エラー 0 件

| 確認項目                    | 基準   | 結果       |
| --------------------------- | ------ | ---------- |
| TypeScript コンパイルエラー | 0 件   | {{RESULT}} |
| `any` 型使用                | 0 件   | {{RESULT}} |
| `@ts-ignore`                | 0 件   | {{RESULT}} |
| `@ts-expect-error`          | 0 件   | {{RESULT}} |
| 型アサーション（`as`）      | 最小限 | {{RESULT}} |

#### any 型・型アサーション検査

```bash
# any 型の使用箇所を検索（テストファイル除外）
grep -rn ": any\|<any>\|as any" apps/desktop/src/renderer/views/SkillCenterView/ --include="*.ts" --include="*.tsx" | grep -v ".test." | grep -v "__tests__"

# @ts-ignore / @ts-expect-error の使用箇所を検索
grep -rn "@ts-ignore\|@ts-expect-error" apps/desktop/src/renderer/views/SkillCenterView/ --include="*.ts" --include="*.tsx"

# 型アサーション（as）の使用箇所を検索（テストファイル除外）
grep -rn " as " apps/desktop/src/renderer/views/SkillCenterView/ --include="*.ts" --include="*.tsx" | grep -v ".test." | grep -v "__tests__" | grep -v "import.*as"
```

### ステップ 3: 全テスト実行

```bash
# 全テスト実行（P40 対策: apps/desktop から実行）
cd apps/desktop && pnpm vitest run src/renderer/views/SkillCenterView/

# カバレッジ付き実行
cd apps/desktop && pnpm vitest run --coverage src/renderer/views/SkillCenterView/
```

**品質ゲート**:

| 指標              | 最低基準 | 推奨基準 | 結果       |
| ----------------- | -------- | -------- | ---------- |
| 全テスト PASS     | 100%     | 100%     | {{RESULT}} |
| Line Coverage     | 80%      | 90%      | {{RESULT}} |
| Branch Coverage   | 60%      | 70%      | {{RESULT}} |
| Function Coverage | 80%      | 90%      | {{RESULT}} |

#### テストファイル別結果

| テストファイル              | テスト数 | PASS | FAIL | 結果       |
| --------------------------- | -------- | ---- | ---- | ---------- |
| `SkillCenterView.test.tsx`  | -        | -    | -    | {{RESULT}} |
| `FeaturedSection.test.tsx`  | -        | -    | -    | {{RESULT}} |
| `SkillCard.test.tsx`        | -        | -    | -    | {{RESULT}} |
| `AddButton.test.tsx`        | -        | -    | -    | {{RESULT}} |
| `CategoryTabs.test.tsx`     | -        | -    | -    | {{RESULT}} |
| `SkillDetailPanel.test.tsx` | -        | -    | -    | {{RESULT}} |
| `useSkillCenter.test.ts`    | -        | -    | -    | {{RESULT}} |
| `useFeaturedSkills.test.ts` | -        | -    | -    | {{RESULT}} |

### ステップ 4: コード品質ルール遵守確認

`.claude/rules/02-code-quality.md` に定義された規約への準拠を確認する。

#### 4-1. boolean 変数名プレフィックス（is / has / can / should）

```bash
# boolean 型の変数名を検索し、プレフィックスを確認
grep -rn "boolean" apps/desktop/src/renderer/views/SkillCenterView/ --include="*.ts" --include="*.tsx" | grep -v ".test." | grep -v "__tests__"
```

| 確認項目                                       | 基準                            | 結果       |
| ---------------------------------------------- | ------------------------------- | ---------- |
| `isAdded` / `isProcessing` / `isDetailOpen` 等 | `is` / `has` / `can` / `should` | {{RESULT}} |
| `isDeleteConfirmOpen`                          | `is` プレフィックス             | {{RESULT}} |
| `isLoadingSkills`                              | `is` プレフィックス             | {{RESULT}} |
| `isImportDialogOpen`                           | `is` プレフィックス             | {{RESULT}} |

#### 4-2. 未使用 import 排除

```bash
# ESLint の no-unused-imports ルールで検出（ステップ 1 で検証済み）
pnpm eslint apps/desktop/src/renderer/views/SkillCenterView/ --ext .ts,.tsx --rule 'no-unused-vars: error'
```

#### 4-3. エラーハンドリング

| 確認項目                         | 基準                                    | 結果       |
| -------------------------------- | --------------------------------------- | ---------- |
| try/catch で握りつぶしていないか | エラーを上位に伝播                      | {{RESULT}} |
| IPC 呼び出しのエラーハンドリング | Toast 表示 + ユーザーへのフィードバック | {{RESULT}} |
| スキル追加失敗時のボタン状態復帰 | 「追加する」に戻す                      | {{RESULT}} |
| スキル削除失敗時のフィードバック | エラー Toast 表示                       | {{RESULT}} |

### ステップ 5: Atomic Design 準拠確認

タスク定義のコンポーネント構成（セクション 5.1）が Atomic Design 原則に従っているか確認する。

| レベル    | コンポーネント                                                                                                                      | 確認結果   |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| atoms     | AddButton                                                                                                                           | {{RESULT}} |
| molecules | SkillCard, FeaturedCard, CategoryTabs, SkillCapabilities, SkillPermissions, SkillMarkdownCollapse, SkillDangerZone, SkillEmptyState | {{RESULT}} |
| organisms | FeaturedSection, SkillDetailPanel, SkillImportSection                                                                               | {{RESULT}} |
| views     | SkillCenterView                                                                                                                     | {{RESULT}} |

**確認項目**:

- [ ] atoms は他のコンポーネントに依存していない
- [ ] molecules は atoms の組み合わせで構成されている
- [ ] organisms は molecules を組み合わせてセクションを構成している
- [ ] views は organisms を配置してページ全体を構成している

### ステップ 6: Apple HIG / WCAG 2.1 AA 準拠確認

#### 6-1. Apple HIG System Colors 準拠

| 確認項目                 | 基準                                                     | 結果       |
| ------------------------ | -------------------------------------------------------- | ---------- |
| ライトモード背景色       | `#FFFFFF`（systemBackground）                            | {{RESULT}} |
| ダークモード背景色       | `#000000`（systemBackground）                            | {{RESULT}} |
| アクセント（ライト）     | `#007AFF`（systemBlue）                                  | {{RESULT}} |
| アクセント（ダーク）     | `#0A84FF`（systemBlue）                                  | {{RESULT}} |
| 成功色（追加済みボタン） | `var(--status-success)` / `var(--status-success-subtle)` | {{RESULT}} |
| Tailwind Slate 不使用    | 青みがかった灰色を使わない（Apple 中性灰を使用）         | {{RESULT}} |

#### 6-2. WCAG 2.1 AA 準拠

| 確認項目                             | 基準                         | 結果       |
| ------------------------------------ | ---------------------------- | ---------- |
| 通常テキストのコントラスト比         | 4.5:1 以上                   | {{RESULT}} |
| 大テキスト / UI 部品のコントラスト比 | 3:1 以上                     | {{RESULT}} |
| キーボード操作で全機能にアクセス可能 | Tab / Enter / Escape / Arrow | {{RESULT}} |
| ARIA ラベルの付与                    | 全インタラクティブ要素       | {{RESULT}} |
| 色だけで情報を伝えていない           | アイコン / テキスト併用      | {{RESULT}} |

#### 6-3. タッチターゲット

| コンポーネント             | ターゲットサイズ | 基準       | 結果       |
| -------------------------- | ---------------- | ---------- | ---------- |
| AddButton（追加する）      | 44x44px          | Apple HIG  | {{RESULT}} |
| CategoryTabs 各タブ        | 44px 高さ        | Apple HIG  | {{RESULT}} |
| SkillCard クリック領域     | カード全体       | 120px 以上 | {{RESULT}} |
| DetailPanel 閉じるボタン   | 44x44px          | Apple HIG  | {{RESULT}} |
| SkillDangerZone 削除ボタン | 44x44px          | Apple HIG  | {{RESULT}} |

#### 6-4. キーボードナビゲーション

| 操作                         | キー               | 期待動作                           | 結果       |
| ---------------------------- | ------------------ | ---------------------------------- | ---------- |
| カード間移動                 | Tab                | 次のカードにフォーカス移動         | {{RESULT}} |
| カード選択（詳細パネル表示） | Enter / Space      | SkillDetailPanel 表示              | {{RESULT}} |
| 追加ボタン実行               | Enter / Space      | スキル追加処理開始                 | {{RESULT}} |
| カテゴリタブ切替             | Arrow Left / Right | 隣のタブに移動                     | {{RESULT}} |
| 詳細パネル閉じる             | Escape             | パネル閉じてカードにフォーカス戻る | {{RESULT}} |
| 削除確認ダイアログ           | Escape             | ダイアログキャンセル               | {{RESULT}} |
| 折りたたみ展開/閉じ          | Enter / Space      | SKILL.md 表示トグル                | {{RESULT}} |

### ステップ 7: 既知の落とし穴（Pitfall）対策確認

| Pitfall | 確認方法                                                                 | 結果       |
| ------- | ------------------------------------------------------------------------ | ---------- |
| **P31** | agentSlice からの状態取得が個別セレクタ使用になっているか確認            | {{RESULT}} |
| **P39** | テストコード内に `userEvent.setup()` が存在しないか grep 確認            | {{RESULT}} |
| **P40** | テスト実行コマンドが `cd apps/desktop` から開始しているか確認            | {{RESULT}} |
| **P44** | `skill:import` / `skill:remove` が `string` を直接渡しているか確認       | {{RESULT}} |
| **P45** | 全レイヤーで引数名が `skillName` に統一されているか確認                  | {{RESULT}} |
| **P47** | variantStyles Record がモジュールスコープで定義・export されているか確認 | {{RESULT}} |

```bash
# P31 確認: 合成Store Hook使用の検出
grep -rn "useAgentStore()" apps/desktop/src/renderer/views/SkillCenterView/ --include="*.ts" --include="*.tsx" | grep -v ".test." | grep -v "__tests__"

# P39 確認: userEvent 使用の検出
grep -rn "userEvent" apps/desktop/src/renderer/views/SkillCenterView/ --include="*.ts" --include="*.tsx"

# P44/P45 確認: skillId 命名の残留検出
grep -rn "skillId" apps/desktop/src/renderer/views/SkillCenterView/ --include="*.ts" --include="*.tsx" | grep -v ".test." | grep -v "__tests__"
```

### ステップ 8: 品質検証レポート作成

全ステップの結果を `outputs/phase-9/quality-verification.md` にまとめる。

## 統合テスト連携【必須】

品質保証で統合テスト結果を確認:

| 品質項目      | 確認内容                                        | 結果       |
| ------------- | ----------------------------------------------- | ---------- |
| 機能検証      | 全自動テスト成功                                | {{RESULT}} |
| Lint          | ESLint エラー・警告 0 件                        | {{RESULT}} |
| 型チェック    | TypeScript コンパイルエラー 0 件                | {{RESULT}} |
| カバレッジ    | Line 80%+, Branch 60%+, Function 80%+           | {{RESULT}} |
| コード品質    | any 0, @ts-ignore 0, boolean プレフィックス準拠 | {{RESULT}} |
| Atomic Design | atoms/molecules/organisms 分類準拠              | {{RESULT}} |
| Apple HIG     | System Colors 準拠、44px タッチターゲット       | {{RESULT}} |
| WCAG 2.1 AA   | コントラスト比、キーボードナビ、ARIA            | {{RESULT}} |
| Pitfall 対策  | P31,P39,P40,P44,P45,P47 全対策確認              | {{RESULT}} |

## 多角的チェック観点

| 観点               | 確認項目                                                      |
| ------------------ | ------------------------------------------------------------- |
| セキュリティ       | IPC 経由のスキル操作（import/remove）が安全に行われているか   |
| UI/UX              | UX 言語マッピング（ツール表記）が統一されているか             |
| アーキテクチャ     | レイヤー依存方向（Renderer → Preload → Main）が守られているか |
| パフォーマンス     | アニメーション 60fps、初期表示 500ms 以下                     |
| アクセシビリティ   | WCAG 2.1 AA、44px タッチターゲット、キーボードナビ、ARIA      |
| エラーハンドリング | 追加/削除失敗時の UI フィードバック（Toast、ボタン状態復帰）  |

**Electron デスクトップアプリ観点**:

| 層                         | 確認項目                                                |
| -------------------------- | ------------------------------------------------------- |
| フロントエンド（Renderer） | 全コンポーネントテスト PASS、Atomic Design 準拠         |
| 状態管理                   | agentSlice 個別セレクタ使用、useEffect 依存配列の安全性 |
| IPC 通信                   | 既存チャネル利用、引数バリデーション                    |

## 成果物

| 成果物           | パス                                      | 説明         |
| ---------------- | ----------------------------------------- | ------------ |
| 品質検証レポート | `outputs/phase-9/quality-verification.md` | 品質検証結果 |

### 品質検証レポート記載事項

1. **Lint 結果**: ESLint 実行結果（エラー/警告件数）
2. **型チェック結果**: TypeScript コンパイル結果（エラー件数、any/型アサーション件数）
3. **テスト結果**: テストファイル別 PASS/FAIL、カバレッジ数値
4. **コード品質**: boolean プレフィックス、未使用 import、エラーハンドリング
5. **Atomic Design**: コンポーネント分類表
6. **Apple HIG / WCAG 2.1 AA**: カラー準拠、コントラスト比、キーボードナビ、タッチターゲット
7. **Pitfall 対策**: P31,P39,P40,P44,P45,P47 の検証結果
8. **品質ゲート判定**: 全項目 PASS / 要改善項目リスト

## 完了条件

- [ ] `pnpm lint` がエラー・警告 0 件で通過
- [ ] `pnpm typecheck` がエラー 0 件で通過
- [ ] 全テスト実行（`cd apps/desktop && pnpm vitest run`）が全件 PASS
- [ ] カバレッジ基準達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] `any` 型使用が 0 件
- [ ] `@ts-ignore` / `@ts-expect-error` 使用が 0 件
- [ ] boolean 変数名が `is` / `has` / `can` / `should` プレフィックス準拠
- [ ] 未使用 import が 0 件
- [ ] Atomic Design 準拠が確認済み
- [ ] Apple HIG System Colors 準拠が確認済み
- [ ] WCAG 2.1 AA 準拠が確認済み（コントラスト比、キーボードナビ、ARIA、タッチターゲット）
- [ ] 既知の Pitfall（P31,P39,P40,P44,P45,P47）対策が全て確認済み
- [ ] 品質検証レポートが作成されている
- [ ] **全品質ゲート項目が PASS**
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## サブタスク管理

Phase 実行開始時に、TodoWrite ツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. Lint 検証（ステップ 1）
3. 型チェック（ステップ 2）
4. 全テスト実行（ステップ 3）
5. コード品質ルール遵守確認（ステップ 4）
6. Atomic Design 準拠確認（ステップ 5）
7. Apple HIG / WCAG 2.1 AA 準拠確認（ステップ 6）
8. Pitfall 対策確認（ステップ 7）
9. 品質検証レポート作成（ステップ 8）
10. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## タスク 100% 実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

```bash
# Phase 完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW --phase 9
```

## 次の Phase

Phase 10: 最終レビューゲート
