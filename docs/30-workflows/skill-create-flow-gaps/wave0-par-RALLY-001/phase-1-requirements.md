# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 1                                       |
| タスクID   | TASK-RALLY-001                          |
| 機能名     | skill-lifecycle-panel-dead-code-removal |
| タスク名   | SkillLifecyclePanel dead code削除       |
| 前提Phase  | -                                       |
| 後続Phase  | Phase 2                                 |
| 作成日     | 2026-04-21                              |
| ステータス | pending                                 |

## 目的

`SkillLifecyclePanel.tsx` に残存する未使用ハンドラ `_handleSubmitWorkflowInput` と旧入力 state（`selectedOptionId` / `textAnswer` / `secretAnswer` / `confirmAnswer`）を特定し、削除の受け入れ基準を確定する。

## SubAgentチーム編成

| SubAgent   | 関心ごと           | 主担当                                         | 並列/直列          |
| ---------- | ------------------ | ---------------------------------------------- | ------------------ |
| SubAgent-A | コード調査         | SkillLifecyclePanel.tsx内でのdead code存在確認 | 並列（B と同時）   |
| SubAgent-B | 影響範囲分析       | 他ファイルからの参照確認（grep全探索）         | 並列（A と同時）   |
| SubAgent-C | 統合・矛盾チェック | 削除可否の最終判断・受け入れ基準確定           | 直列（A・B完了後） |

## P50チェック（実施必須）

```bash
# 対象ファイルの最近のコミット履歴
git log --oneline -20 -- apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx

# dead code の存在確認
grep -n "_handleSubmitWorkflowInput\|selectedOptionId\|textAnswer\|secretAnswer\|confirmAnswer" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx

# _handleSubmitWorkflowInput が他ファイルから参照されていないか確認（SubAgent-B担当）
grep -rn "_handleSubmitWorkflowInput" apps/ packages/

# state変数が他ファイルから参照されていないか確認（SubAgent-B担当）
grep -rn "selectedOptionId\|textAnswer\|secretAnswer\|confirmAnswer" apps/ packages/
```

### 現状（2026-04-21 時点の確認結果）

- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` の L482〜485 に以下の state 宣言が存在する:
  - `const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);`
  - `const [textAnswer, setTextAnswer] = useState("");`
  - `const [secretAnswer, setSecretAnswer] = useState("");`
  - `const [confirmAnswer, setConfirmAnswer] = useState<boolean | null>(null);`
- L793 に `const _handleSubmitWorkflowInput = async () => {...}` 関数定義が存在する
- L811, L813, L815, L817 で上記 state が `_handleSubmitWorkflowInput` 内でのみ参照されている
- 他ファイルからの参照は確認されていない

## 受け入れ基準

- AC-1: `_handleSubmitWorkflowInput` 関数定義が `SkillLifecyclePanel.tsx` から削除されている
- AC-2: `selectedOptionId` / `textAnswer` / `secretAnswer` / `confirmAnswer` の state 宣言が削除されている
- AC-3: `pnpm typecheck` がエラーなしで通過する
- AC-4: `pnpm lint` がエラーなしで通過する（unused variable 警告も含む）
- AC-5: 削除後に `grep -rn "_handleSubmitWorkflowInput"` の結果が空になる

## 実行手順

1. SubAgent-A: `SkillLifecyclePanel.tsx` を開き、dead code の行番号・内容を特定する
2. SubAgent-B: `grep -rn "_handleSubmitWorkflowInput" apps/ packages/` で外部参照がないことを確認する
3. SubAgent-C: A・B の結果を統合し、削除に安全上の問題がないことを確認して受け入れ基準を確定する

## 参照資料

| 資料名       | パス                                                                   | 用途                 |
| ------------ | ---------------------------------------------------------------------- | -------------------- |
| 対象ファイル | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`   | dead code の存在確認 |
| 設計分析書   | `docs/30-workflows/00-task-spec-design-docs/rally-phase-1-analysis.md` | 懸念点3の詳細        |
| 解決策設計書 | `docs/30-workflows/00-task-spec-design-docs/rally-phase-2-solution.md` | RALLY-001の設計方針  |

## 成果物

| 成果物          | パス                                         | 説明                          |
| --------------- | -------------------------------------------- | ----------------------------- |
| 要件定義書      | `outputs/phase-1/requirements-definition.md` | dead codeの特定結果と削除方針 |
| 受け入れ基準    | `outputs/phase-1/acceptance-criteria.md`     | AC-1〜AC-5の詳細              |
| P50チェック結果 | `outputs/phase-1/p50-check-result.md`        | grep実行結果と影響範囲分析    |

## 完了条件

- [ ] P50チェックコマンドを実行し、dead codeの存在を確認した
- [ ] 他ファイルからの参照がないことを確認した
- [ ] 受け入れ基準 AC-1〜AC-5 を確定した
- [ ] 成果物テーブル記載のファイルを全件生成した
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認した

## タスク100%実行確認【必須】

- [ ] SubAgent-A（コード調査）完了
- [ ] SubAgent-B（影響範囲分析）完了
- [ ] SubAgent-C（統合・矛盾チェック）完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 本Phase内の全タスクを100%実行完了

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/skill-create-flow-gaps/p01-seq-RALLY-001
```

## 次のPhase

Phase 2: 設計
