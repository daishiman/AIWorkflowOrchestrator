# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目       | 値                                      |
| ---------- | --------------------------------------- |
| タスク ID  | TASK-UI-05-SKILL-CENTER-VIEW            |
| Phase      | 8                                       |
| 機能名     | SkillCenterView（ツールを探す）         |
| 作成日     | 2026-03-01                              |
| 前提条件   | Phase 7（カバレッジ確認）完了           |
| 成果物パス | `outputs/phase-8/refactoring-report.md` |

## 目的

Phase 5〜7 で実装・テスト拡充した SkillCenterView のコード品質を改善する。動作（テスト結果）を変えずに、可読性・保守性・パフォーマンスを向上させる。

## 実行タスク

- コンポーネント抽出: 大きすぎるコンポーネントの分割
- カスタムフック抽出: ロジックの再利用性向上
- 型安全性強化: any 型除去、型アサーション最小化
- CSS 変数・デザイントークンの一貫性確保
- 重複コード除去
- アクセシビリティ属性の標準化
- パフォーマンス最適化

## 参照資料

| 資料名             | パス                                         | 説明               |
| ------------------ | -------------------------------------------- | ------------------ |
| Phase 1 要件       | `outputs/phase-1/requirements-definition.md` | 要件境界の再確認   |
| Phase 2 設計       | `outputs/phase-2/architecture-design.md`     | 設計契約の再確認   |
| Phase 5 実装       | `outputs/phase-5/implementation-summary.md`  | 実装コード         |
| Phase 6 テスト拡充 | `outputs/phase-6/test-expansion-report.md`   | 拡充テストの観点   |
| Phase 7 カバレッジ | `outputs/phase-7/coverage-report.md`         | カバレッジ確認結果 |
| コード品質ルール   | `.claude/rules/02-code-quality.md`           | 品質基準           |
| 既知の落とし穴     | `.claude/rules/06-known-pitfalls.md`         | P47 等の対策       |
| アーキテクチャ     | `.claude/rules/01-architecture.md`           | Atomic Design 原則 |
| 状態管理           | `.claude/rules/03-state-management.md`       | Zustand 設計原則   |
| タスク定義         | `task-030-ui-05-skill-center-view.md`        | TASK-UI-05 全仕様  |

## 実行手順

### ステップ 1: リファクタリング対象の特定

Phase 5〜7 で作成した全ファイルを対象に、以下の観点でリファクタリング対象を洗い出す。

#### 1-1. コンポーネント抽出

| 対象ファイル                | 確認観点                                                                                                      |
| --------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `SkillCenterView/index.tsx` | メインレイアウトが 200 行を超えていないか                                                                     |
| `SkillDetailPanel.tsx`      | 5 つのサブセクション（Capabilities, Permissions, Markdown, DangerZone, MetaInfo）が責務単位で分離されているか |
| `FeaturedSection.tsx`       | スケルトンロード状態のコンポーネントが分離されているか                                                        |

**判断基準**: 1 コンポーネント 150 行以下を目安とする。超過している場合は分割を検討する。

#### 1-2. カスタムフック抽出

| 確認対象                    | 抽出候補                                                 |
| --------------------------- | -------------------------------------------------------- |
| `SkillCenterView/index.tsx` | 詳細パネル開閉・削除確認のローカル状態管理ロジック       |
| `AddButton.tsx`             | 追加処理中状態の管理ロジック（複数カード間で共通の場合） |
| `SkillDetailPanel.tsx`      | SKILL.md 取得・パースロジック                            |
| `CategoryTabs.tsx`          | 下線インジケータ位置計算ロジック                         |

**判断基準**: 2 箇所以上で同一パターンが使われている場合、または UI ロジックとビジネスロジックが混在している場合に抽出する。

#### 1-3. 型安全性強化

```bash
# any 型の使用箇所を検索
grep -rn "any" apps/desktop/src/renderer/views/SkillCenterView/ --include="*.ts" --include="*.tsx" | grep -v "node_modules" | grep -v ".test."

# 型アサーション（as）の使用箇所を検索
grep -rn " as " apps/desktop/src/renderer/views/SkillCenterView/ --include="*.ts" --include="*.tsx" | grep -v "node_modules" | grep -v ".test."

# @ts-ignore / @ts-expect-error の使用箇所を検索
grep -rn "@ts-ignore\|@ts-expect-error" apps/desktop/src/renderer/views/SkillCenterView/ --include="*.ts" --include="*.tsx"
```

**目標**: `any` 型 0 件、`@ts-ignore` / `@ts-expect-error` 0 件、型アサーション（`as`）は最小限（理由コメント付きのみ許可）。

#### 1-4. CSS 変数・デザイントークンの一貫性（P47 準拠）

以下の観点で CSS 変数使用の一貫性を確認する。

| 確認項目                              | 対応方針                                                                    |
| ------------------------------------- | --------------------------------------------------------------------------- |
| `variantStyles` Record の抽出         | コンポーネント外部（モジュールスコープ）に `Record<Variant, string>` で抽出 |
| テスト側でのハードコード文字列        | コンポーネントから export した定数を import して期待値生成                  |
| Apple HIG System Colors の CSS 変数化 | `var(--color-accent)` 等が全箇所で統一されているか確認                      |
| ダーク/ライトモード対応               | CSS 変数がモード切替で正しく動作するか確認                                  |

**P47 準拠の具体的パターン**:

```typescript
// ❌ テスト内でハードコード文字列
expect(element).toHaveClass("bg-[var(--status-primary)]");

// ✅ Record 定数をコンポーネントから export → テストで import
export const addButtonStyles: Record<AddButtonState, string> = {
  idle: "bg-[var(--status-primary)] text-white",
  success: "bg-[var(--status-success-subtle)] text-[var(--status-success)]",
};
```

#### 1-5. 重複コード除去

| 確認対象                                       | 重複パターン                               |
| ---------------------------------------------- | ------------------------------------------ |
| `FeaturedCard.tsx` と `SkillCard.tsx`          | アイコン表示 + ツール名 + 説明文の共通部分 |
| `SkillDetailPanel` 内のバッジ表示              | 権限バッジの生成ロジック                   |
| 各コンポーネントの hover/active/focus スタイル | 共通インタラクションスタイルの抽出         |

**判断基準**: 3 行以上の同一コード / 同一ロジックが 2 箇所以上にある場合、共通ユーティリティまたは共通コンポーネントに抽出する。

#### 1-6. アクセシビリティ属性の標準化

| 確認項目                          | 基準                                                             |
| --------------------------------- | ---------------------------------------------------------------- |
| `role` 属性                       | インタラクティブ要素に適切な role が付与されているか             |
| `aria-label` / `aria-labelledby`  | 全てのボタン・リンクにラベルが付与されているか                   |
| `aria-expanded` / `aria-controls` | 折りたたみ（SkillMarkdownCollapse）に状態属性があるか            |
| `aria-live`                       | 動的更新領域（件数表示、Toast）に live region が設定されているか |
| `tabIndex`                        | フォーカス可能な全要素にキーボードアクセスが可能か               |
| タッチターゲット                  | 44x44px 以上（Apple HIG 準拠）                                   |

### ステップ 2: リファクタリング実施

ステップ 1 で特定した対象に対して、以下の優先順位でリファクタリングを実施する。

| 優先度 | カテゴリ                  | 理由                                          |
| ------ | ------------------------- | --------------------------------------------- |
| 1      | 型安全性強化              | コンパイル時エラー検出による品質基盤          |
| 2      | 重複コード除去            | 保守性への直接的影響                          |
| 3      | コンポーネント/フック抽出 | 可読性と再利用性の向上                        |
| 4      | CSS 変数一貫性            | デザイントークン変更時の影響範囲最小化（P47） |
| 5      | アクセシビリティ標準化    | WCAG 2.1 AA 準拠                              |
| 6      | パフォーマンス最適化      | 体感速度の向上                                |

### ステップ 3: パフォーマンス最適化

#### 3-1. React.memo の適用

| コンポーネント      | 適用判断                                          |
| ------------------- | ------------------------------------------------- |
| `SkillCard`         | props が頻繁に変わらない純粋コンポーネント → 適用 |
| `FeaturedCard`      | 同上 → 適用                                       |
| `AddButton`         | `isProcessing` が頻繁に変わるが限定的 → 適用      |
| `CategoryTabs`      | カテゴリ一覧は静的 → 適用                         |
| `SkillCapabilities` | 詳細パネル内の静的表示 → 適用                     |
| `SkillPermissions`  | 同上 → 適用                                       |

**判断基準**: 親の再レンダリングで不要に再描画される可能性があるコンポーネントに `React.memo` を適用する。

#### 3-2. useMemo の適用

| 対象                | メモ化するロジック                                |
| ------------------- | ------------------------------------------------- |
| `useFeaturedSkills` | おすすめスキル選定（既に useMemo 適用済みの想定） |
| `useSkillCenter`    | フィルタリング結果のスキル一覧                    |
| `SkillPermissions`  | 権限名 → ユーザー向け表現への変換マッピング       |

#### 3-3. useCallback の適用

| 対象                        | コールバック                                               |
| --------------------------- | ---------------------------------------------------------- |
| `SkillCenterView/index.tsx` | `handleAddSkill`, `handleSelectSkill`, `handleDeleteSkill` |
| `CategoryTabs`              | `handleTabChange`                                          |
| `AddButton`                 | `handleClick`                                              |

**判断基準**: 子コンポーネントに props として渡されるコールバックで、不要な再レンダリングを防ぐために `useCallback` を適用する。

#### 3-4. アニメーションパフォーマンス

| 確認項目               | 基準                                                      |
| ---------------------- | --------------------------------------------------------- |
| `will-change` 指定     | `transform`, `opacity` アニメーション要素に事前指定       |
| GPU レイヤー昇格       | `transform` と `opacity` のみ使用（layout 変更を避ける）  |
| stagger アニメーション | `requestAnimationFrame` ベースか CSS アニメーションか確認 |
| success-bounce         | `will-change: transform` が事前設定されているか           |

### ステップ 4: リファクタリング後のテスト確認

```bash
# 1. 全テスト実行（P40 対策: apps/desktop から実行）
cd apps/desktop && pnpm vitest run src/renderer/views/SkillCenterView/

# 2. カバレッジ再測定（Phase 7 基準を維持していることを確認）
cd apps/desktop && pnpm vitest run --coverage src/renderer/views/SkillCenterView/

# 3. 型チェック
pnpm typecheck

# 4. Lint チェック
pnpm lint
```

**確認項目**:

- [ ] リファクタリング前後でテスト結果が同一（全テスト PASS）
- [ ] カバレッジが Phase 7 基準を維持（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 型チェック・Lint チェックがクリア

## 統合テスト連携【必須】

リファクタリング後の統合テスト継続成功を確認:

```bash
# リファクタリング後のテスト実行
cd apps/desktop && pnpm vitest run src/renderer/views/SkillCenterView/
```

| テストカテゴリ   | 確認内容                                       | 結果       |
| ---------------- | ---------------------------------------------- | ---------- |
| ユニットテスト   | 全コンポーネントテスト PASS                    | {{RESULT}} |
| フックテスト     | useSkillCenter, useFeaturedSkills テスト PASS  | {{RESULT}} |
| 統合テスト       | 追加/削除フロー、検索、カテゴリ切替テスト PASS | {{RESULT}} |
| スナップショット | レイアウト回帰なし                             | {{RESULT}} |

## 多角的チェック観点

| 観点             | 確認項目                                                             |
| ---------------- | -------------------------------------------------------------------- |
| UI/UX            | マイクロインタラクション 11 種が維持されているか                     |
| アーキテクチャ   | Atomic Design（atoms → molecules → organisms）準拠が維持されているか |
| パフォーマンス   | アニメーション 60fps、初期表示 500ms 以下が維持されているか          |
| アクセシビリティ | WCAG 2.1 AA、44px タッチターゲット、キーボードナビが維持されているか |
| 型安全性         | any 0 件、@ts-ignore 0 件が達成されているか                          |
| デザイントークン | P47 準拠の variantStyles Record 抽出が完了しているか                 |

**Electron デスクトップアプリ観点**:

| 層                         | 確認項目                                      |
| -------------------------- | --------------------------------------------- |
| フロントエンド（Renderer） | コンポーネント分割が Atomic Design に準拠     |
| 状態管理                   | agentSlice 個別セレクタ使用が維持（P31 対策） |

## 既知の Pitfall 対策

| Pitfall | 確認項目                                                                          |
| ------- | --------------------------------------------------------------------------------- |
| **P31** | リファクタリング後も個別セレクタ使用が維持されているか                            |
| **P39** | テストコードで `userEvent` が混入していないか（happy-dom 環境）                   |
| **P40** | テスト実行ディレクトリが `apps/desktop` からであることを確認                      |
| **P47** | variantStyles Record がモジュールスコープに抽出され、テストで import されているか |

## 成果物

| 成果物                   | パス                                    | 説明                     |
| ------------------------ | --------------------------------------- | ------------------------ |
| リファクタリングレポート | `outputs/phase-8/refactoring-report.md` | 変更内容と品質改善の記録 |

### リファクタリングレポート記載事項

1. **変更一覧**: ファイルごとの変更内容（コンポーネント抽出、フック抽出、型修正、重複除去）
2. **パフォーマンス最適化**: React.memo / useMemo / useCallback の適用箇所
3. **P47 対応**: variantStyles Record 抽出の詳細
4. **アクセシビリティ改善**: ARIA 属性追加・修正の一覧
5. **テスト結果**: リファクタリング前後のテスト結果比較
6. **カバレッジ**: リファクタリング前後のカバレッジ比較

## 完了条件

- [ ] テストが継続成功（全テスト PASS、カバレッジ維持）
- [ ] `any` 型が 0 件
- [ ] `@ts-ignore` / `@ts-expect-error` が 0 件
- [ ] 型アサーション（`as`）が最小限（理由コメント付きのみ）
- [ ] 150 行超のコンポーネントが存在しない（または分割計画を記録）
- [ ] P47 準拠の variantStyles Record 抽出が完了
- [ ] React.memo / useMemo / useCallback の適用対象が設計どおり
- [ ] アクセシビリティ属性が標準化
- [ ] 重複コードが除去
- [ ] 統合テストが継続成功
- [ ] リファクタリングレポートが作成されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## サブタスク管理

Phase 実行開始時に、TodoWrite ツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. リファクタリング対象の特定（ステップ 1）
3. リファクタリング実施（ステップ 2）
4. パフォーマンス最適化（ステップ 3）
5. リファクタリング後のテスト確認（ステップ 4）
6. リファクタリングレポート作成
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## タスク 100% 実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

```bash
# Phase 完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW --phase 8
```

## TDD 検証

```bash
# テスト実行コマンド（P40 対策: apps/desktop から実行）
cd apps/desktop && pnpm vitest run src/renderer/views/SkillCenterView/

# 確認項目
# - [ ] リファクタリング後もテストが成功することを確認
```

## 次の Phase

Phase 9: 品質保証
