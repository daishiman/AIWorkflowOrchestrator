# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 9                                             |
| タスクID   | UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001 |
| 機能名     | skill-wizard-category-display-label-mapping   |
| 前提Phase  | Phase 8                                       |
| 後続Phase  | Phase 10                                      |
| 作成日     | 2026-04-11                                    |
| ステータス | pending                                       |

## 目的

静的解析・型チェック・lint を一括実行し、品質ゲートを通過していることを確認する。
Phase 1〜8 の成果物を横断的に検証し、Phase 10 への進行可否を判定する。

## 実行タスク

- 静的解析一括実行: typecheck + lint + test
- リンク確認: 成果物間の参照整合確認
- 品質ゲート判定: 全項目PASS確認
- Phase 10 ブロッカー確認: 進行を阻害する問題がないか確認

## 参照資料

| 資料名         | パス                                        | 用途                     |
| -------------- | ------------------------------------------- | ------------------------ |
| Phase 7 成果物 | `outputs/phase-7/coverage-report.md`        | カバレッジ結果確認       |
| Phase 8 成果物 | `outputs/phase-8/refactoring-log.md`        | リファクタリング結果確認 |
| 実装ファイル   | `packages/shared/src/types/skillCreator.ts` | 最終コード確認           |

## 実行手順

### 1. 静的解析一括実行

```bash
# 型チェック
pnpm --filter @repo/shared typecheck

# lint
pnpm --filter @repo/shared lint

# テスト（全件実行）
pnpm --filter @repo/shared exec vitest run src/types/__tests__/skillCreator-wizard.test.ts
```

### 2. 品質ゲートチェックリスト

| チェック項目                             | 基準                      | 結果    |
| ---------------------------------------- | ------------------------- | ------- |
| TypeScript型チェック                     | エラー0件                 | pending |
| ESLint                                   | エラー0件                 | pending |
| ユニットテスト（TC-01〜TC-13）           | 13件PASS                  | pending |
| `SKILL_CATEGORY_LABELS` エクスポート確認 | export確認                | pending |
| `getSkillCategoryLabel` エクスポート確認 | export確認                | pending |
| カバレッジ（getSkillCategoryLabel）      | Line/Branch/Function 100% | pending |

### 3. エクスポート確認

```bash
# エクスポートされているか確認
grep -n "export.*SKILL_CATEGORY_LABELS\|export.*getSkillCategoryLabel" \
  packages/shared/src/types/skillCreator.ts
```

期待出力:

```
xxx: export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
yyy: export function getSkillCategoryLabel(category: SkillCategory): string {
```

### 4. `@repo/shared/types/skillCreator` からのインポート確認

```bash
# subpath export 経由でインポート可能か確認
node --input-type=module -e "
import('@repo/shared/types/skillCreator').then(({ SKILL_CATEGORY_LABELS, getSkillCategoryLabel }) => {
  console.log('SKILL_CATEGORY_LABELS:', SKILL_CATEGORY_LABELS);
  console.log('getSkillCategoryLabel automation:', getSkillCategoryLabel('automation'));
});
" 2>&1 || echo "TypeScript環境のため node 直接実行は不可 - pnpm build 後に確認"
```

### 5. Phase 10 ブロッカー確認

| ブロッカー候補     | 状況    |
| ------------------ | ------- |
| 型エラーあり       | pending |
| lint エラーあり    | pending |
| テスト失敗あり     | pending |
| カバレッジ目標未達 | pending |

## 統合テスト連携【必須】

| 判定項目            | 基準     | 結果    |
| ------------------- | -------- | ------- |
| typecheck           | PASS     | pending |
| lint                | 0 error  | pending |
| ユニットテスト全件  | 13件PASS | pending |
| Phase 10 ブロッカー | なし     | pending |

## 成果物

| 成果物           | パス                                | 説明                                  |
| ---------------- | ----------------------------------- | ------------------------------------- |
| 品質保証レポート | `outputs/phase-9/quality-report.md` | 静的解析・テスト結果・Phase10進行可否 |

## 完了条件

- [ ] 型チェック（`pnpm typecheck`）がエラー0件
- [ ] lint（`pnpm lint`）がエラー0件
- [ ] ユニットテスト13件が全PASS
- [ ] エクスポート確認済み（`SKILL_CATEGORY_LABELS` + `getSkillCategoryLabel`）
- [ ] カバレッジ目標（getSkillCategoryLabel Line/Branch/Function 100%）達成
- [ ] Phase 10 ブロッカーなし
- [ ] 品質保証レポート作成済み
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 静的解析一括実行（typecheck + lint + test）
2. 品質ゲートチェックリスト確認
3. エクスポート確認
4. Phase 10 ブロッカー確認
5. 品質保証レポート作成

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 10: 最終レビュー
