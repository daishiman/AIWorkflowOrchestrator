# Phase 11: 手動テスト（NON_VISUAL）

## タスク情報

- **タスクID**: UT-HEALTH-POLICY-MAINLINE-MIGRATION-001
- **タスク名**: useMainlineExecutionAccess の healthPolicy 移行
- **フェーズ**: Phase 11 - 手動テスト
- **タスク分類**: NON_VISUAL（UIの変更なし、視覚的変更なし）

---

## タスク分類: NON_VISUAL の説明

本タスクは純粋な TypeScript リファクタリングであり、以下の理由から NON_VISUAL に分類されます。

- UI コンポーネントの変更なし
- スタイル（CSS / Tailwind）の変更なし
- 画面レイアウト・表示内容の変更なし
- ユーザーに見えるふるまいの変化なし

そのため、スクリーンショットによる視覚的証跡は**不要**です。

---

## 証跡の主ソース

本フェーズの主要証跡は **Vitest 自動テスト結果** です。

- テスト実行コマンド: `pnpm --filter @repo/desktop test`
- 証跡として記録すべき情報:
  - テスト総件数
  - PASS 件数 / FAIL 件数
  - テスト実行時刻
  - 対象テストファイル名

---

## 成果物一覧

| ファイル                                    | 説明                                         |
| ------------------------------------------- | -------------------------------------------- |
| `outputs/phase-11/manual-test-result.md`    | 手動テスト結果・証跡（主ソース: 自動テスト） |
| `outputs/phase-11/manual-test-checklist.md` | テスト実施チェックリスト                     |
| `outputs/phase-11/discovered-issues.md`     | テスト中に発見した問題の記録                 |

> **注意**: `screenshot-plan.json` は NON_VISUAL タスクのため**生成しません**。

---

## 作成するファイルの詳細

### outputs/phase-11/manual-test-result.md

以下の内容を含めること：

1. **証跡の主ソース**: Vitest 自動テスト結果（テスト名・件数を明記）
2. **NON_VISUAL である理由**: 本タスクがなぜ視覚的確認不要かを明記
3. **実地操作不可の明記**: UI を介した実地操作確認は本タスクの範囲外であることを明記
4. **代替記録**: 自動テストの出力ログを代替証跡として添付
5. **テスト結果サマリー**:
   - 実行日時
   - 実行コマンド
   - PASS / FAIL 件数
   - 対象テストファイル

**テンプレート**:

```markdown
# 手動テスト結果

## 証跡の主ソース

本タスクは NON_VISUAL（UI変更なし）のため、視覚的証跡（スクリーンショット）は不要です。
証跡の主ソースは Vitest 自動テスト結果とします。

## NON_VISUAL である理由

- 変更対象: `useMainlineExecutionAccess.ts`（TypeScript ロジックのみ）
- UI コンポーネントへの変更なし
- CSS / スタイルへの変更なし
- 画面表示・レイアウトへの影響なし

## 実地操作について

UI を介した実地操作確認は本タスクの範囲外です。
ロジック変更の正確性は自動テストによって担保されます。

## 自動テスト結果

| 項目               | 値                                 |
| ------------------ | ---------------------------------- |
| 実行日時           | （記入する）                       |
| 実行コマンド       | `pnpm --filter @repo/desktop test` |
| PASS 件数          | （記入する）                       |
| FAIL 件数          | （記入する）                       |
| 対象テストファイル | （記入する）                       |

## テストログ（抜粋）

（自動テスト実行時のコンソール出力を貼り付ける）
```

---

### outputs/phase-11/manual-test-checklist.md

以下のチェックリストを含めること：

**テンプレート**:

```markdown
# 手動テスト チェックリスト

## 事前確認

- [ ] Phase 5 実装が完了している
- [ ] TypeScript 型チェックが通過している（`pnpm typecheck`）

## 自動テスト実行

- [ ] `pnpm --filter @repo/desktop test` を実行した
- [ ] 全テストが PASS した
- [ ] テスト件数・実行時刻を記録した

## 受入基準確認

- [ ] AC-1: `resolveHealthPolicy()` が `useMainlineExecutionAccess` 内で呼び出されている
- [ ] AC-2: `buildMainlineExecutionAccessState()` に `healthPolicy` が渡されている
- [ ] AC-3: `apiKeyDegraded` 独自算出ロジック（L117-120）が削除されている
- [ ] AC-4: `@repo/shared/types` 経由でインポートしている
- [ ] AC-5: 既存のユニットテストがすべて PASS している
- [ ] AC-6: TypeScript 型チェックがエラーなく通過している

## NON_VISUAL 確認

- [ ] UI コンポーネントへの変更がないことを確認した
- [ ] スクリーンショット不要であることを確認した
- [ ] `screenshot-plan.json` を生成しないことを確認した

## 完了確認

- [ ] `manual-test-result.md` を作成・記入した
- [ ] `discovered-issues.md` を作成した（0件でも作成必須）
```

---

### outputs/phase-11/discovered-issues.md

テスト中に発見した問題を記録するファイル。**問題が 0 件でも必ず作成すること**。

**テンプレート**:

```markdown
# 発見された問題

## サマリー

| 項目     | 値           |
| -------- | ------------ |
| 発見日時 | （記入する） |
| 発見件数 | （記入する） |

## 問題一覧

<!-- 問題が見つかった場合は以下のフォーマットで記録する -->
<!-- 問題がなければ「発見なし」と記載する -->

発見なし

## 備考

（自由記述）
```

---

## 実施手順

1. Phase 5（実装）が完了していることを確認する
2. `pnpm typecheck` を実行し、型エラーがないことを確認する
3. `pnpm --filter @repo/desktop test` を実行し、全テストが PASS することを確認する
4. `outputs/phase-11/manual-test-checklist.md` を埋める
5. `outputs/phase-11/manual-test-result.md` を作成し、テスト結果を記録する
6. `outputs/phase-11/discovered-issues.md` を作成する（0件でも必須）
