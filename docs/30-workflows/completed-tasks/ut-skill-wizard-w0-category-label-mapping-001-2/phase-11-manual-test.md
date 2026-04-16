# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 11                                            |
| タスクID   | UT-SKILL-WIZARD-W0-CATEGORY-LABEL-MAPPING-001 |
| 機能名     | skill-wizard-category-display-label-mapping   |
| 前提Phase  | Phase 10（PASS）                              |
| 後続Phase  | Phase 12                                      |
| 作成日     | 2026-04-11                                    |
| ステータス | pending                                       |

## タスク分類（Phase 1 宣言に基づく）

**分類: NON_VISUAL（非UIタスク）**

本タスクは `SkillCategory` ラベルマッピングの定数・関数実装であり、UIコンポーネントの変更を含まない。
Phase 11 は実地操作ではなく、自動テスト結果 + 型チェック + ビルド確認を代替記録として使用する。

> **`[Feedback BEFORE-QUIT-001]` 対応**: Phase 11 では「実地操作不可」を明記し、
> 自動テスト結果 + 既知制限リストを代替記録として残す。

## 実行タスク

- ビルド確認: `@repo/shared` のビルドが成功すること
- 型チェック最終確認: `pnpm typecheck` の最終PASS確認
- エクスポート確認: ビルド成果物から正しくエクスポートされているか
- NON_VISUAL宣言記録: 手動テスト結果ファイルにNON_VISUAL理由を明記

## 参照資料

| 資料名          | パス                                        | 用途                 |
| --------------- | ------------------------------------------- | -------------------- |
| Phase 10 成果物 | `outputs/phase-10/final-review-result.md`   | 最終レビュー結果確認 |
| 実装ファイル    | `packages/shared/src/types/skillCreator.ts` | ビルド対象確認       |

## 実行手順

### 1. NON_VISUAL宣言（`[Feedback 4]` 対応）

本Phase は NON_VISUAL として判定する。理由:

- 対象は純粋な TypeScript 定数/関数定義
- UIコンポーネントの変更なし
- ドロップダウンへの実際の表示はスコープ外（後続コンポーネントタスクの責務）

証跡の主ソース: 自動テスト（TC-01〜TC-13、13件PASS）

### 2. ビルド確認

```bash
# @repo/shared のビルド
pnpm --filter @repo/shared build

# ビルド成功確認
echo "Build exit code: $?"
```

### 3. 型チェック最終確認

```bash
# 最終型チェック
pnpm --filter @repo/shared typecheck

# 型チェック成功確認
echo "Typecheck exit code: $?"
```

### 4. エクスポート確認

```bash
# ビルド後の成果物確認
ls packages/shared/dist/

# エクスポート確認（ビルド後）
grep -n "SKILL_CATEGORY_LABELS\|getSkillCategoryLabel" packages/shared/dist/*.js 2>/dev/null || \
  echo "TypeScript source: $(grep -n 'export.*SKILL_CATEGORY_LABELS\|export.*getSkillCategoryLabel' packages/shared/src/types/skillCreator.ts)"
```

### 5. 手動テスト結果記録

`outputs/phase-11/manual-test-result.md` に以下を記録:

- NON_VISUAL判定理由
- 証跡の主ソース（自動テスト結果）
- ビルド確認結果
- 型チェック確認結果
- エクスポート確認結果

## 統合テスト連携【必須】

| 判定項目            | 基準   | 結果    |
| ------------------- | ------ | ------- |
| @repo/shared ビルド | PASS   | pending |
| 最終型チェック      | PASS   | pending |
| 自動テスト（13件）  | 全PASS | pending |

## 成果物

| 成果物         | パス                                     | 説明                                 |
| -------------- | ---------------------------------------- | ------------------------------------ |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | NON_VISUAL宣言・証跡ソース・確認結果 |

> **注意**: NON_VISUAL タスクのため `screenshots/` ディレクトリは作成しない
> （`[Phase 12 苦戦防止Tips]` NON_VISUAL判定時の `.gitkeep` 不要ルール準拠）

## 完了条件

- [ ] NON_VISUAL判定理由を `manual-test-result.md` に明記済み（`[Feedback 4]`）
- [ ] 証跡の主ソース（自動テスト名・件数）を明記済み
- [ ] `@repo/shared` ビルドが成功
- [ ] 型チェック最終PASS確認済み
- [ ] エクスポート確認済み
- [ ] `screenshots/` ディレクトリを作成していない（NON_VISUAL）
- [ ] 手動テスト結果（`outputs/phase-11/manual-test-result.md`）が作成済み
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. NON_VISUAL宣言記録
2. ビルド確認
3. 型チェック最終確認
4. エクスポート確認
5. 手動テスト結果ファイル作成

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 12: ドキュメント更新
