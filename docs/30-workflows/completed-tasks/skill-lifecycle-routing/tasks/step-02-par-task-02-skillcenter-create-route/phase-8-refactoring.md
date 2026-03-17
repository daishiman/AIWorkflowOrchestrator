# Phase 8: リファクタリング

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| タスクID | TASK-IMP-SKILLCENTER-CREATE-ROUTE-001  |
| 機能名   | skillcenter-create-route               |
| Phase    | 8                                      |
| 作成日   | 2026-03-17                             |
| 依存     | Phase 7（カバレッジ確認 PASS）の成果物 |

## 目的

Phase 5 で実装した CTA 関連コードの品質を改善する。機能変更は行わず、可読性・保守性・再利用性の向上のみに集中する。

## 参照資料

- `phase-2-design.md` — コンポーネント設計
- `phase-5-implementation.md` — 実装成果物
- `.claude/rules/02-code-quality.md` — コーディング規約

## 実行タスク

### Task 1: CTA スタイルの共通化検討

SkillCenterView ヘッダーの CTA ボタンと JourneyPanel ステップカードの CTA ボタンが同一のスタイルを使用している場合、共通定数またはコンポーネントへの抽出を検討する。

判断基準:

- 同じ `bg-[var(--system-blue)]` / テキスト / padding が2箇所以上に存在 → 共通化
- デザインが異なる場合（サイズ・variant が異なる） → 共通化不要、コメントで意図を明示

実施内容（該当する場合）:

- `CtaButton` コンポーネントを `src/renderer/components/atoms/CtaButton/` に作成
- P47 対策として `variantStyles` を `Record<Variant, string>` でモジュールスコープに定義
- P46 対策として `Omit<React.HTMLAttributes<HTMLButtonElement>, "...">` で衝突属性を除外

### Task 2: useSkillCenter フックの責務確認

`useSkillCenter` フックが以下の単一責務を守っているか確認する:

- SkillCenter 画面に関するナビゲーションアクション（3件）のみを提供
- ビジネスロジックが混入していないか（あれば分離）
- 関数名が `navigate*` / `open*` など意図を明示した命名になっているか

### Task 3: JourneyPanel コンポーネント分離の検討

JourneyPanel が肥大化している場合、ステップカード1件を `JourneyStepCard` サブコンポーネントに分離することを検討する。

分離基準:

- JourneyPanel が150行超 → 分離を検討
- 150行以内 → 現状維持（コメントで将来の分離候補と記載）

### Task 4: 型安全確認

- `any` 型の使用がないか確認
- ナビゲーションアクションの引数型が明示されているか
- `@ts-ignore` / `@ts-expect-error` の使用がないか

### Task 5: 未使用 import の除去

```bash
cd apps/desktop && pnpm eslint --fix \
  src/renderer/views/SkillCenterView/ \
  src/renderer/hooks/useSkillCenter.ts \
  src/renderer/components/JourneyPanel/
```

### Task 6: リファクタリング後の全テスト再確認

リファクタリングで既存テストが壊れていないことを確認する。

```bash
cd apps/desktop && pnpm vitest run \
  src/renderer/views/SkillCenterView/ \
  src/renderer/hooks/useSkillCenter/ \
  src/renderer/components/JourneyPanel/
```

## 統合テスト連携

- 本Phaseの変更点が受入基準（AC）と追跡可能であることを確認する
- 前Phase成果物と本Phaseテスト（単体・統合・手動）の対応関係を記録する
- 未達・差分がある場合は戻り先Phaseと再実行条件を明記する

## 成果物

- `outputs/phase-8/refactoring-summary.md` — 実施した変更の一覧と判断理由

## 完了条件

- [ ] CTA スタイル共通化の判断（実施または不要）が記録されている
- [ ] useSkillCenter フックが単一責務を守っている
- [ ] JourneyPanel の分離判断が記録されている
- [ ] `any` 型・`@ts-ignore` が使用されていない
- [ ] 未使用 import が除去されている
- [ ] リファクタリング後の全テストが PASS している
- [ ] `outputs/phase-8/refactoring-summary.md` が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次Phase

Phase 9: 品質検証
