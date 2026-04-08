# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| Phase      | 6                                                          |
| 機能名     | UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001          |
| タスク名   | SkillLifecyclePanel.tsx 遷移ボタン化（テキストエリア削除） |
| 前提Phase  | Phase 5                                                    |
| 後続Phase  | Phase 7                                                    |
| 作成日     | 2026-04-08                                                 |
| ステータス | pending                                                    |

---

## 目的

Phase 5 の実装に対して、エッジケース・異常系・回帰テストを拡充し、テストカバレッジを向上させる。

---

## 実行タスク

- **エッジケーステスト追加**: ウィザードボタンの境界値・エッジケースを追加
- **回帰テスト確認**: 関連コンポーネントへの影響がないことを確認
- **異常系テスト追加**: `onOpenWizard` が未定義の場合の挙動確認
- **全テスト再確認**: 6 本のテストファイルが全て PASS することを確認

---

## 参照資料

| 資料名           | パス                                        | 用途                 |
| ---------------- | ------------------------------------------- | -------------------- |
| テスト仕様書     | `outputs/phase-4/test-specification.md`     | 拡充の基準           |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | 実装内容の確認       |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`          | 回帰テスト対象の確認 |

---

## 追加テストケース候補

| TC 番号 | テスト名                                                         | 観点             |
| ------- | ---------------------------------------------------------------- | ---------------- |
| TC-E-01 | `button is disabled when onOpenWizard is not provided`           | 異常系           |
| TC-E-02 | `onOpenWizard is called exactly once when button is clicked`     | 呼び出し回数     |
| TC-E-03 | `button has correct aria-label for accessibility`                | アクセシビリティ |
| TC-E-04 | `component renders without textarea elements`                    | 削除確認         |
| TC-R-01 | `related components not affected by SkillLifecyclePanel changes` | 回帰             |

---

## 実行手順

### ステップ 1: 回帰テスト実行

```bash
# 変更に関連する全テストを実行
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/__tests__/

# 回帰確認
pnpm --filter @repo/desktop exec vitest run --reporter=verbose
```

### ステップ 2: エッジケーステスト追加

設計書のエッジケース候補から優先度の高いものを追加する。

### ステップ 3: テスト再確認

```bash
# 拡充後の全テスト実行
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/__tests__/
```

---

## 統合テスト連携

- 6 本のテストファイルの回帰テストを実行する
- 関連コンポーネントへの影響がないことを確認する
- 全テストが PASS することを確認する

---

## 成果物

| 成果物           | パス                                        | 説明                     |
| ---------------- | ------------------------------------------- | ------------------------ |
| 拡張テストケース | `outputs/phase-6/expanded-test-cases.md`    | 追加したテストケース一覧 |
| 回帰テスト結果   | `outputs/phase-6/regression-test-result.md` | 回帰テスト確認結果       |
| 異常系テスト結果 | `outputs/phase-6/edge-case-result.md`       | エッジケーステスト結果   |

---

## 完了条件

- [ ] エッジケーステストを追加した
- [ ] 回帰テストが全て PASS した
- [ ] 6 本のテストファイルが全て PASS した
- [ ] 異常系テストを追加した
- [ ] 本 Phase 内の全タスクを 100% 実行完了

---

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 拡張テスト結果を記録した
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001 --phase 6
```

---

## 次のPhase

Phase 7: カバレッジ確認
