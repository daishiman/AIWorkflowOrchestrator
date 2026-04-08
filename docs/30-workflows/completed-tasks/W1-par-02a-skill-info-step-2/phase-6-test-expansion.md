# Phase 6: テスト拡充

## メタ情報

- Phase: 6
- タスクID: UT-SKILL-WIZARD-W1-SKILL-INFO-STEP-001
- 機能名: SkillInfoStep コンポーネント実装（Step 0: スキル情報入力）
- 作成日: 2026-04-08
- ステータス: **completed**

## 目的

Phase 5 の実装後、エッジケース・回帰ガードを追加し、テストの網羅性を高める。

## 追加テストケース

| TC    | 対象                       | 内容                                                                     |
| ----- | -------------------------- | ------------------------------------------------------------------------ |
| TC-10 | エクスポート確認           | `SkillInfoStep` が `wizard/index.ts` から re-export されていることを確認 |
| TC-11 | 目的の blur バリデーション | 目的が 10 文字未満で blur したときにエラーメッセージが出る               |
| TC-12 | カテゴリ再クリック         | 選択中カテゴリを再クリックしても `onFormDataChange` が余計に呼ばれない   |
| TC-13 | skillName の任意性         | `skillName` が空でも `purpose` と `category` が揃えば Next が有効になる  |

## 手順

1. `SkillInfoStep.test.tsx` に TC-10〜TC-13 を追加する
2. `pnpm --filter @repo/desktop vitest run` で全テストが PASS することを確認する

## 成果物

- 拡充済み `apps/desktop/src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx`
- テスト実行 PASS ログ

## 完了条件

- [x] TC-01〜TC-13 が全て PASS している
