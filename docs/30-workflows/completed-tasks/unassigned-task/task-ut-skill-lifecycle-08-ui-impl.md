# TASK-SKILL-LIFECYCLE-08 UI 実装 - タスク指示書

## メタ情報

| 項目         | 内容                                          |
| ------------ | --------------------------------------------- |
| タスクID     | UT-SKILL-LIFECYCLE-08-UI-IMPL                 |
| タスク名     | TASK-SKILL-LIFECYCLE-08 UI コンポーネント実装 |
| 分類         | 実装                                          |
| 対象機能     | Skill Center 公開・配布導線                   |
| 優先度       | 中                                            |
| 見積もり規模 | 中規模                                        |
| ステータス   | 未実施                                        |
| 発見元       | Phase 12（TASK-SKILL-LIFECYCLE-08）           |
| 発見日       | 2026-03-17                                    |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

公開レベル・互換性・配布操作の UI 仕様は設計済みだが、実コンポーネントが未実装。

### 1.2 問題点・課題

ユーザーは設計された公開判定フローを操作できず、TASK-08 の価値が利用面で発揮されない。

### 1.3 放置した場合の影響

仕様と画面の乖離が継続し、後続実装で UI 契約の再解釈コストが増える。

---

## 2. 何を達成するか（What）

### 2.1 目的

Skill Center 上で公開レベル管理・互換性確認・配布操作を一貫操作できる UI を実装する。

### 2.2 最終ゴール

6コンポーネント（Badge/Filter/Dialog/Result/Form/Preview）が統合され、公開導線が end-to-end で動作する。

### 2.3 スコープ

#### 含むもの

- VisibilityBadge
- SkillCenterFilter
- PublishFlowDialog
- CompatibilityResultView
- SkillPublishingForm
- SkillPublishingPreview

#### 含まないもの

- 課金/サブスク連携
- 外部マーケット公開機能

### 2.4 成果物

- 実装済み React コンポーネント群
- 画面遷移と操作仕様
- Phase 11 スクリーンショット証跡

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-SKILL-LIFECYCLE-08-TYPE-IMPL 完了
- UT-SKILL-LIFECYCLE-08-IPC-TEST 基本完了

### 3.2 依存タスク

- UT-SKILL-LIFECYCLE-08-TYPE-IMPL
- UT-SKILL-LIFECYCLE-08-IPC-TEST

### 3.3 必要な知識

- React + Zustand
- Accessibility（dialog / keyboard）
- Apple HIG ベース UI 原則

### 3.4 推奨アプローチ

表示部品を atoms/molecules で分離し、state と IPC 呼び出しは slice + hook 経由で統一する。

### 3.5 親タスクの苦戦箇所（継承）

> 出典: TASK-SKILL-LIFECYCLE-08 / TASK-SKILL-LIFECYCLE-05 lessons-learned / 06-known-pitfalls.md

#### P47: CSS 変数ベースのスタイルテストアサーション

| 項目   | 内容                                                                                                                                                                       |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| リスク | デザイントークン（CSS変数）を Tailwind arbitrary values で使用した場合、テストで `expect(el).toHaveClass("bg-[var(--status-primary)]")` のような長い文字列比較が必要になる |
| 回避策 | `variantStyles` を `Record<Variant, string>` 型でコンポーネント外部に抽出し、テスト側もその定数を import して期待値を生成する                                              |

#### P46: HTMLAttributes Props 型衝突

| 項目   | 内容                                                                                                                                           |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| リスク | `React.HTMLAttributes<HTMLElement>` を extends する際、`content` 等の HTML 標準属性と同名のカスタム Props を定義すると TS2430 エラーが発生する |
| 回避策 | `Omit<React.HTMLAttributes<HTMLElement>, "conflictingProp">` で衝突する属性を除外してからカスタム型を定義する                                  |

#### P48/P31: Zustand 派生セレクタの useShallow 必須化

| 項目   | 内容                                                                                                                   |
| ------ | ---------------------------------------------------------------------------------------------------------------------- |
| リスク | `.filter()` / `.map()` で配列を返す派生セレクタが毎回新しい参照を返し、`useSyncExternalStore` が無限ループに陥る       |
| 回避策 | `zustand/react/shallow` の `useShallow` で派生セレクタをラップする。publishingSlice のフィルタ系セレクタは必ず適用する |

#### Record パターンでの ScoringGate 網羅性保証（TASK-05 教訓）

| 項目   | 内容                                                                                                     |
| ------ | -------------------------------------------------------------------------------------------------------- |
| リスク | switch 文でユニオン型を分岐すると、新しい値が追加された場合にコンパイルエラーにならない                  |
| 回避策 | `Record<UnionType, Config>` で全キーの定義を型レベルで強制する。VisibilityBadge の色マッピングに適用する |

#### 5分解決カード

1. VisibilityBadge の色マッピングは `Record<SkillVisibility, string>` で定義し、switch を使わない。
2. CSS 変数スタイルは `variantStyles` 定数に抽出し、テストは定数を import して検証する。
3. Props が HTML 標準属性と衝突する場合は `Omit` で除外する（VisibilityBadge の `content` 等）。
4. publishingSlice のフィルタ系セレクタには `useShallow` を必ず適用する。
5. Phase 11 の screenshot 取得は「実画面試行 → fallback review board → metadata 固定」の順で閉じる。

---

## 4. 実行手順

### Phase構成

Phase A（UI部品実装）→ Phase B（統合）→ Phase C（手動検証）

### Phase A: UI部品実装

#### 目的

6コンポーネントを仕様どおりに作る。

#### 手順

1. Badge/Filter を先行実装
2. Form/Preview を実装
3. Dialog/Result を実装

#### 成果物

コンポーネント実装

#### 完了条件

単体レンダリングが可能

### Phase B: 統合

#### 目的

Skill Center へ組み込む。

#### 手順

1. publishingSlice と接続する
2. IPC 呼び出しを hook 経由で統一する
3. 権限・エラー表示を反映する

#### 成果物

統合済み画面

#### 完了条件

公開導線が一連操作で動作

### Phase C: 手動検証

#### 目的

視覚・操作品質を確定する。

#### 手順

1. Phase 11 用 screenshot plan を作成
2. TC ごとにスクリーンショットを取得
3. カバレッジ validator を通す

#### 成果物

Phase 11 evidence

#### 完了条件

`validate-phase11-screenshot-coverage` PASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 6コンポーネントが実装済み
- [ ] 公開レベル変更・互換性表示・配布操作が実行可能

### 品質要件

- [ ] `pnpm --filter @repo/desktop test:run` PASS
- [ ] 主要UIのアクセシビリティ違反が0

### ドキュメント要件

- [ ] UI 仕様書に反映済み
- [ ] 手動テスト証跡を保存済み

---

## 6. 検証方法

### テストケース

- Visibility 切替
- Publish readiness 判定表示
- 互換性 breaking 表示
- import/export/fork/share メニュー操作

### 検証手順

1. `pnpm --filter @repo/desktop test:run`
2. `pnpm --filter @repo/desktop typecheck`
3. `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow <workflow>`

---

## 7. リスクと対策

| リスク               | 影響度 | 発生確率 | 対策                                |
| -------------------- | ------ | -------- | ----------------------------------- |
| 複合状態で UI 崩れ   | 中     | 中       | state machine を明示しケース網羅    |
| IPC エラー時 UX 低下 | 中     | 中       | recoverable/error fallback を分離   |
| 設計との差分拡大     | 高     | 低       | 実装前に Phase 2 仕様レビューを固定 |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/skill-lifecycle-unification/tasks/step-06-seq-task-08-skill-publishing-version-compatibility/outputs/phase-2/skill-center-flow-design.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`
- `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`（P47/P46/P48 苦戦箇所）
- `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-created-skill-usage-journey.md`（登録・更新・停止・配布フロー仕様）
- `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`（PublishReadiness 公開判定マトリクス 13ケース）
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`（SkillVisibility/PublishReadiness 型定義正本）

### 参考資料

- `apps/desktop/src/renderer/components/skill/`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
Phase 12 未タスク検出: UI仕様は定義済みだがコンポーネント実装が未完了。
```

### 補足事項

デザインシステム token と accessibility の整合を優先する。
