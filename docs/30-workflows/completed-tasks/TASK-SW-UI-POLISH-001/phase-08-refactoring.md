# Phase 8: リファクタリング

## メタ情報

| 項目     | 値                                                                             |
| -------- | ------------------------------------------------------------------------------ |
| Phase    | 8                                                                              |
| タスクID | TASK-SW-UI-POLISH-001                                                          |
| 機能名   | スキルウィザード UI仕上げ（CSS変数監査・カテゴリ選択上限・アニメーション追加） |
| 作成日   | 2026-04-14                                                                     |
| 前提     | Phase 7 完了済み（カバレッジ目標達成）                                         |
| 状態     | 未着手                                                                         |

## 目的

実装コードの重複・navigation drift を削り、保守性を向上させる。TDD の Refactor フェーズとして、テストを Green に保ちながらコードを整理する。

---

## 実行タスク

- `MAX_CATEGORY_COUNT` 定数の配置場所検討（ローカル vs 共有）
- transition クラスの共通化検討（Tailwind ユーティリティ整理）
- 不要な `as` 型アサーションや `any` の除去
- 変更内容を `対象/Before/After/理由` テーブル形式で記録

---

## リファクタリング候補

### 1. `MAX_CATEGORY_COUNT` の配置検討

| 選択肢                                   | メリット                       | デメリット                      | 推奨 |
| ---------------------------------------- | ------------------------------ | ------------------------------- | ---- |
| `SkillInfoStep.tsx` ローカル定数         | 影響範囲が限定的・変更が安全   | 再利用性なし                    | ✅   |
| `packages/shared/src/constants/skill.ts` | 再利用可能                     | 過剰な共有化（現時点では1箇所） | -    |
| `apps/desktop/src/renderer/constants/`   | desktop パッケージ内で共有可能 | 現時点では不要な間接参照        | -    |

**判断**: 現時点では `SkillInfoStep.tsx` ローカル定数として配置。複数箇所で使われるようになった場合に共有化を検討する。

### 2. transition クラスの共通化検討

| 対象                   | クラス                                    | 共通化の是非                |
| ---------------------- | ----------------------------------------- | --------------------------- |
| カテゴリボタン         | `transition-all duration-200 ease-in-out` | ローカルで十分（使用1箇所） |
| ProgressBar 幅制御要素 | `transition-all duration-300 ease-in-out` | ローカルで十分（使用1箇所） |

**判断**: Tailwind の utility class はファイルに直接記述。Tailwind 設計思想に従いクラス名で表現を統一する。

### 3. 型アサーション・any の確認

```bash
# any の使用箇所確認
grep -n "as any\| any " apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
grep -n "as any\| any " apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx
grep -n "as any\| any " apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx
```

**対応**: 発見した `any` は適切な型定義に置き換える。

---

## 変更記録テーブル

| 対象               | Before           | After                            | 理由                               |
| ------------------ | ---------------- | -------------------------------- | ---------------------------------- |
| MAX_CATEGORY_COUNT | （未定義）       | `SkillInfoStep.tsx` ローカル定数 | 影響範囲限定・将来の共有化に備える |
| transition クラス  | （なし）         | ファイル直接記述                 | Tailwind 設計思想に従う            |
| any 型             | （発見した場合） | 適切な型定義                     | 型安全性向上                       |

---

## リファクタリング後の確認

```bash
# テストが Green のままであることを確認
pnpm --filter @repo/desktop test -- --testPathPattern="SkillInfoStep|ConversationRoundStep"

# TypeScript エラーなし
pnpm --filter @repo/desktop typecheck

# Lint エラーなし
pnpm --filter @repo/desktop lint

# any 残存なし（修正対象ファイル）
grep -n " any " apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
grep -n " any " apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx
```

---

## Phase 8 完了条件

- [ ] `MAX_CATEGORY_COUNT` の配置が確定済み（ローカル定数）
- [ ] transition クラスの共通化要否が判断済み（ローカル記述で確定）
- [ ] 不要な `any` 型アサーションの除去完了
- [ ] 変更内容が `対象/Before/After/理由` テーブルで記録済み
- [ ] リファクタリング後も全テストが Green
- [ ] `typecheck` / `lint` が通過
