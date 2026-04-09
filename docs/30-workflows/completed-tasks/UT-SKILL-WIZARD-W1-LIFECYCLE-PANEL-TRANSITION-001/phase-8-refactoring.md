# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| Phase      | 8                                                          |
| 機能名     | UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001          |
| タスク名   | SkillLifecyclePanel.tsx 遷移ボタン化（テキストエリア削除） |
| 前提Phase  | Phase 7                                                    |
| 後続Phase  | Phase 9                                                    |
| 作成日     | 2026-04-08                                                 |
| ステータス | pending                                                    |

---

## 目的

Phase 5 の実装を振り返り、コード品質を向上させる。  
不要なコード・命名の整理・重複の除去を行い、Phase 9 の品質保証に向けてコードを整える。

---

## 実行タスク

- **不要コード除去**: 削除した state・ハンドラに関連する残余コードを確認・除去
- **命名整理**: 変更後のコンポーネントで命名が一貫しているか確認
- **import 整理**: 削除した state・ハンドラに関連する不要 import を除去
- **リファクタ後テスト確認**: リファクタリング後も全テストが PASS することを確認

---

## 参照資料

| 資料名             | パス                                              | 用途                   |
| ------------------ | ------------------------------------------------- | ---------------------- |
| 実装サマリー       | `outputs/phase-5/implementation-summary.md`       | リファクタ前の実装状態 |
| 変更ファイル一覧   | `outputs/phase-5/changed-files.md`                | 確認対象のファイル     |
| カバレッジレポート | `outputs/phase-7/traceability-coverage-report.md` | カバレッジ維持確認     |

---

## リファクタリングチェックリスト

### 不要コード確認

```bash
# 削除したはずの textarea 要素が残っていないか確認
grep -n "skill-lifecycle-request-input\|skill-lifecycle-execution-input" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx

# 削除したはずの state が残っていないか確認
grep -n "request\|executionPrompt" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx

# 不要な import が残っていないか確認
grep -n "^import" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
```

### Phase 9 QA 基準（事前確認）

Phase 9 で確認する QA 基準への対応状況を事前確認する:

- [ ] `git delete OR export {} stub化かつ live import ゼロ` 基準を満たすか
- [ ] 削除した state がコード上に残っていないか
- [ ] 削除した UI 要素に関連するコードが完全に除去されているか

---

## 実行手順

### ステップ 1: 不要コード確認

上記の grep コマンドで残余コードを確認する。

### ステップ 2: import 整理

削除した要素に関連する不要 import を確認・除去する。

### ステップ 3: 命名確認

ウィザードボタン追加後の命名が一貫しているか確認する。

### ステップ 4: リファクタ後テスト実行

```bash
# リファクタ後の全テスト実行
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/__tests__/

# TypeScript 型チェック
pnpm --filter @repo/desktop typecheck
```

---

## 統合テスト連携

- リファクタリング後も統合テストが継続して PASS することを確認する
- 不要 import の除去後に型エラーが発生していないか確認する

---

## 成果物

| 成果物         | パス                                             | 説明                     |
| -------------- | ------------------------------------------------ | ------------------------ |
| リファクタ計画 | `outputs/phase-8/refactoring-plan.md`            | リファクタリング内容     |
| 再テスト計画   | `outputs/phase-8/post-refactor-test-plan.md`     | リファクタ後のテスト計画 |
| 責務境界マップ | `outputs/phase-8/responsibility-boundary-map.md` | コンポーネント責務整理   |

---

## 完了条件

- [ ] 不要コード（残余 state・ハンドラ・import）が完全に除去された
- [ ] Phase 9 QA 基準への対応状況を確認した
- [ ] リファクタリング後も全テストが PASS している
- [ ] TypeScript 型チェックが通過している
- [ ] 本 Phase 内の全タスクを 100% 実行完了

---

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] リファクタリング後のテスト結果を記録した
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001 --phase 8
```

---

## 次のPhase

Phase 9: 品質保証
