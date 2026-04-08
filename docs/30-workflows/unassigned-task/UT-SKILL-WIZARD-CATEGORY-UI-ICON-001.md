# SkillInfoStep カテゴリ選択 UI 改善（アイコン・ツールチップ追加） - タスク指示書

## メタ情報

```yaml
issue_number: 2028
task_id: UT-SKILL-WIZARD-CATEGORY-UI-ICON-001
status: open
priority: low
scale: small
task_type: VISUAL
```

| 項目         | 内容                                                                              |
| ------------ | --------------------------------------------------------------------------------- |
| タスクID     | UT-SKILL-WIZARD-CATEGORY-UI-ICON-001                                              |
| タスク名     | SkillInfoStep カテゴリ選択 UI 改善（アイコン・ツールチップ追加）                  |
| 分類         | UX 改善                                                                           |
| 対象機能     | スキル作成ウィザード - Step 0（スキル情報入力）カテゴリ選択 UI                    |
| 優先度       | 低（`priority:low`）                                                              |
| 見積もり規模 | 小規模（`scale:small`）                                                           |
| ステータス   | 未実施（`status:open`）                                                           |
| 発見元       | W1-par-02a-skill-info-step-2 Phase 12 未タスク検出レポート                        |
| 発見日       | 2026-04-08                                                                        |
| タスク分類   | VISUAL タスク（カテゴリ選択 UI の視覚的変更あり / Phase 11 スクリーンショット要） |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`W1-par-02a-skill-info-step-2`（SkillInfoStep 実装）の Phase 12 未タスク検出において、
以下の UX 改善候補が記録された。

現在の `SkillInfoStep.tsx` のカテゴリ選択 UI は、`SkillCategory` 型の値をテキストラベルのみで
表示している：

```tsx
// 現在の実装（テキストラベルのみ）
<button key={category} onClick={() => handleCategoryChange(category)}>
  {CATEGORY_OPTIONS[category].label}
</button>
```

受入条件 AC-4（「`SkillCategory` 型の全値を選択肢として表示する」）は満たしているが、
各カテゴリの意味・用途をユーザーが直感的に理解しにくい状態である。

### 1.2 問題点・課題

1. **アイコンなし**: 各カテゴリに対応するアイコンがなく、視覚的な識別が困難。
   特に、カテゴリ名が日本語テキストのみのため、スキャン速度が遅い。

2. **ツールチップなし**: カテゴリ名だけでは用途が伝わらない場合がある。
   例：「通知系」「コードサポート系」などのカテゴリが何を意味するかの説明がない。

3. **アクセシビリティの余地**: ボタンに `aria-label` や `title` 属性がない場合、
   スクリーンリーダーでの操作性が低下する可能性がある。

### 1.3 放置した場合の影響

- ユーザーがカテゴリを選ぶ際に迷いが生じ、ウィザード完了率が下がる可能性
- 視覚的なデザインの統一性が低下（アイコンを持つ他の UI 要素との不整合）
- アクセシビリティ基準（WCAG 2.1 AA）への部分的な非準拠

---

## 2. 何を達成するか（What）

### 2.1 目的

`SkillInfoStep.tsx` のカテゴリ選択 UI に各カテゴリのアイコンとツールチップを追加し、
ユーザーが直感的にカテゴリを選択できるようにする。

### 2.2 最終ゴール

- 各 `SkillCategory` ボタンに対応するアイコン（emoji または SVG）が表示される
- ホバー時またはフォーカス時にカテゴリの説明テキストがツールチップとして表示される
- `aria-label` または `title` 属性によるアクセシビリティが確保される
- Phase 11 スクリーンショットでアイコン・ツールチップが確認できる

### 2.3 スコープ

#### 含むもの

- `CATEGORY_OPTIONS` への `icon`（emoji 文字列または Lucide アイコン）フィールド追加
- `CATEGORY_OPTIONS` への `description` フィールド追加（ツールチップ用テキスト）
- カテゴリボタンへのアイコン表示追加
- カテゴリボタンへのツールチップ実装（Tailwind の `group/tooltip` パターンまたは `title` 属性）
- `aria-label` 属性の追加
- 対応するユニットテストの更新・追加

#### 含まないもの

- カテゴリ選択ロジック・状態管理の変更
- `SkillCategory` 型自体への変更（`@repo/shared` 側）
- カテゴリの追加・削除
- アニメーション実装（hover 時の transition は Tailwind クラスのみ）
- Storybook への追加（別タスク）

### 2.4 成果物

| 種別 | ファイル                                                                                            |
| ---- | --------------------------------------------------------------------------------------------------- |
| 修正 | `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`（アイコン・ツールチップ追加） |
| 修正 | `apps/desktop/src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx`（テスト更新）  |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `W1-par-02a-skill-info-step-2` が Phase 12 完了済みであること
- `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx` が存在すること
- プロジェクトで使用しているアイコンライブラリ（Lucide React 等）が利用可能なこと

### 3.2 依存タスク

| タスクID                               | 状態 | 内容                                     |
| -------------------------------------- | ---- | ---------------------------------------- |
| UT-SKILL-WIZARD-W1-SKILL-INFO-STEP-001 | 完了 | SkillInfoStep.tsx 実装（本タスクの前提） |

### 3.3 推奨アプローチ

1. **アイコン戦略を決定する**: プロジェクトで既に Lucide React が使用されている場合は
   その icon コンポーネントを使用する。使用されていない場合は emoji 文字列を推奨する
   （新規ライブラリ追加を避けるため）。

2. **`CATEGORY_OPTIONS` を拡張する**: 既存の `label` に加えて `icon` と `description`
   フィールドを追加する。型安全のため `Record<SkillCategory, { label: string; icon: string; description: string }>` に更新する。

3. **ツールチップ実装を選択する**: シンプルな実装として `title` 属性による OS ネイティブ
   ツールチップを先行実装する。後続タスクで Tailwind カスタムツールチップに昇格できるよう、
   `data-tooltip` 属性も同時に追加することを推奨する。

4. **アクセシビリティを確保する**: `aria-label={`${CATEGORY_OPTIONS[category].label}: ${CATEGORY_OPTIONS[category].description}`}` のように
   アイコン＋説明を組み合わせた aria-label を設定する。

---

## 4. 実行手順（Phase 1〜13 の概要）

### Phase 構成

| Phase | 名称                  | ステータス | 概要                                                       |
| ----- | --------------------- | ---------- | ---------------------------------------------------------- |
| 1     | 要件定義              | open       | アイコン戦略・ツールチップ実装方針・受入条件確定           |
| 2     | 設計                  | open       | `CATEGORY_OPTIONS` 拡張設計・UI レイアウト確定             |
| 3     | 設計レビュー          | open       | アイコンライブラリ選択・アクセシビリティ確認               |
| 4     | テスト作成（TDD Red） | open       | アイコン表示・ツールチップ・aria-label テストの先行作成    |
| 5     | 実装                  | open       | `CATEGORY_OPTIONS` 拡張・UI コンポーネント修正             |
| 6     | テスト拡充            | open       | アクセシビリティ・ホバー状態のテスト追加                   |
| 7     | カバレッジ確認        | open       | カバレッジ維持確認                                         |
| 8     | リファクタリング      | open       | アイコン定数の整理・命名統一                               |
| 9     | 品質検証              | open       | typecheck / lint / test 全通過確認                         |
| 10    | 最終レビュー          | open       | 受入条件充足確認・Phase 11 スクリーンショット要件確認      |
| 11    | 手動テスト            | open       | VISUAL: アイコン・ツールチップのスクリーンショット取得必須 |
| 12    | ドキュメント更新      | open       | canonical 6 成果物作成                                     |
| 13    | PR 作成               | open       | ユーザー明示承認後のみ実施（blocked）                      |

---

### Phase 1: 要件定義

**ステータス**: open

#### 受入条件（AC）

| AC   | 内容                                                                     |
| ---- | ------------------------------------------------------------------------ |
| AC-1 | 各 `SkillCategory` ボタンにアイコン（emoji または SVG）が表示される      |
| AC-2 | 各カテゴリボタンにカテゴリ説明がツールチップとして提供される             |
| AC-3 | 各カテゴリボタンに `aria-label` または `title` 属性が設定されている      |
| AC-4 | `CATEGORY_OPTIONS` に `icon` と `description` フィールドが追加されている |
| AC-5 | `pnpm --filter @repo/desktop typecheck` が PASS する                     |
| AC-6 | `pnpm --filter @repo/desktop vitest run` で全テストが PASS する          |
| AC-7 | Phase 11 スクリーンショットでアイコンが視覚的に確認できる                |

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] AC-1: 各カテゴリボタンにアイコンが表示される
- [ ] AC-2: ツールチップが提供される
- [ ] AC-3: aria-label または title 属性が設定されている
- [ ] AC-4: CATEGORY_OPTIONS に icon・description フィールドが追加されている

### 品質要件

- [ ] `pnpm --filter @repo/desktop typecheck` が PASS
- [ ] `pnpm --filter @repo/desktop lint` が PASS
- [ ] `pnpm --filter @repo/desktop vitest run` で全テスト PASS

### 手動テスト要件（Phase 11 VISUAL）

- [ ] カテゴリ選択エリアのスクリーンショット（アイコン表示確認）
- [ ] ツールチップ表示のスクリーンショット（ホバー状態）

---

## 6. 検証方法

```bash
# 型チェックとテスト
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop vitest run

# aria-label の存在確認（テスト実行後）
pnpm --filter @repo/desktop vitest run --reporter=verbose
```

---

## 7. リスクと対策

| リスク                                                             | 影響度 | 発生確率 | 対策                                                                            |
| ------------------------------------------------------------------ | ------ | -------- | ------------------------------------------------------------------------------- |
| Lucide React が未インストールで新規追加が必要になる                | 中     | 中       | Phase 1 でライブラリ確認。未インストールなら emoji 文字列を先行実装             |
| `title` ツールチップが Electron の WebView で動作しない            | 低     | 低       | Phase 11 スクリーンショットで動作確認。問題があれば Tailwind カスタム実装に切替 |
| テストコードで emoji を含む aria-label の文字列マッチが失敗        | 低     | 低       | `getByRole('button', { name: /カテゴリ名/ })` の正規表現マッチを使用            |
| UT-SKILL-WIZARD-VALIDATION-MIN-LENGTH-001 との同一ファイル変更競合 | 中     | 高       | 両タスクを順次実行するか、PR 分離戦略を事前に確認する                           |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/W1-par-02a-skill-info-step-2/` — 実装タスク仕様書
- `docs/30-workflows/W1-par-02a-skill-info-step-2/outputs/phase-12/unassigned-task-detection.md` — 本タスクの発見元
- `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx` — 変更対象

### 関連タスク

| タスクID                                   | 関係     | 内容                                   |
| ------------------------------------------ | -------- | -------------------------------------- |
| UT-SKILL-WIZARD-W1-SKILL-INFO-STEP-001     | 完了     | SkillInfoStep 実装（本タスクの前提）   |
| UT-SKILL-WIZARD-VALIDATION-MIN-LENGTH-001  | 並列注意 | 同一ファイル変更のため PR 分離が必要   |
| UT-SKILL-WIZARD-W2-SKILL-CREATE-WIZARD-001 | 後続     | SkillCreateWizard オーケストレーション |

---

## 9. 備考

### 苦戦箇所【記入必須】

#### 苦戦箇所 1: W1-par-02a で AC-4 を満たしながらも UX 改善の余地が残った理由

| 項目     | 内容                                                                                                               |
| -------- | ------------------------------------------------------------------------------------------------------------------ |
| 症状     | カテゴリ選択 UI がテキストラベルのみで、ユーザーが選択に迷う可能性がある                                           |
| 原因     | W1-par-02a の受入条件 AC-4 が「全値を選択肢として表示する」のみを要求し、視覚的な豊かさを要求していなかった        |
| 対応     | Phase 12 未タスク検出で改善候補として記録し、本タスクとして独立させた                                              |
| 再発防止 | 受入条件作成時に「視覚的識別性」に関する AC を明示的に追加することで、設計段階でアイコン追加を決定できるようにする |

#### 苦戦箇所 2: VISUAL タスクと NON_VISUAL タスクの Phase 11 証跡の違い

| 項目     | 内容                                                                                                                               |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 症状     | W1-par-02a は NON_VISUAL だったため、本タスク（VISUAL）では Phase 11 スクリーンショット取得が必須となる                            |
| 原因     | タスク種別（VISUAL / NON_VISUAL）の判断が Phase 1 で明確にされておらず、Phase 11 の証跡要件が後から判明することがある              |
| 対応     | Phase 1 の受入条件に「Phase 11 証跡種別」を明記する                                                                                |
| 再発防止 | 任意の UI 変更（CSS クラス追加・要素追加）がある場合は VISUAL タスクとして分類し、Phase 1 の段階でスクリーンショット要件を確定する |

### 補足事項

- 本タスクは優先度 Low であり、Wave 1 の他タスク完了後に実施することを推奨する
- `UT-SKILL-WIZARD-VALIDATION-MIN-LENGTH-001`（同一ファイル対象）と並列実施する場合は
  Git コンフリクトに注意すること
- Phase 11 のスクリーンショット取得には `apps/desktop/scripts/capture-skill-create-wizard-screenshots.mjs`
  を `--output-dir` を明示して使用すること（スクリーンショット出力先問題の再発防止）
