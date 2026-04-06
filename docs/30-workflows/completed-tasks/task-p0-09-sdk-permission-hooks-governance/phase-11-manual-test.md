# Phase 11: 手動テスト（NON_VISUAL）

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| Phase      | 11                                                 |
| 名称       | 手動テスト                                         |
| タスクID   | TASK-P0-09                                         |
| ステータス | 未実施                                             |
| 依存       | Phase 10 完了（PASS または MINOR）                 |
| 完了条件   | 自動テスト代替による PASS 証跡が記録されていること |

---

## タスク分類: NON_VISUAL

> **[Feedback BEFORE-QUIT-001 準拠]**:
> 本タスクは Electron UI を操作する視覚的なスクリーンショット検証が困難なタスクである。
> governance 基盤（policy / hooks / audit）は Main プロセス内のロジックであり、
> worktree 環境では Electron 起動による手動確認を安定して実施しづらい。
>
> **代替証跡**: 自動テスト実行結果（全 PASS）をもって手動テスト代替とする。
> スクリーンショットを作成しない理由: 今回の検証対象は非 UI の governance ロジックであり、
> 視覚的に確認すべき画面要素を必須要件としていない。

---

## 目的

Main プロセス内の governance ロジックを、worktree 環境で再現可能な自動テスト証跡に置き換えて確認する。
視覚要素がないため、NON_VISUAL として扱う。

## 参照資料

- `phase-10-final-review.md`
- `phase-9-quality-assurance.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`
- `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`

---

## 自動テスト代替記録

### 証跡の主ソース

| 証跡種別         | 内容                                          | ファイル                                                          |
| ---------------- | --------------------------------------------- | ----------------------------------------------------------------- |
| ユニットテスト   | TC-PP-01〜18 / TC-HF-01〜10 / TC-AS-01〜12    | `__tests__/governance/*.test.ts`                                  |
| 統合テスト       | TC-FG-01〜09                                  | `__tests__/governance/SkillCreatorGovernance.integration.test.ts` |
| 全フェーズ回帰   | TC-G-01〜14                                   | `__tests__/governance/GovernanceAllPhases.test.ts`                |
| fail path テスト | TC-PP-E01〜05 / TC-AS-E01〜03 / TC-FG-E01〜03 | Phase 6 で追加                                                    |
| 回帰ガードテスト | TC-RG-01〜02                                  | Phase 6 で追加                                                    |

### 動作確認テストケース（自動化）

`SkillCreatorGovernance.integration.test.ts` は facade / hooks / audit の局所統合を、
`GovernanceAllPhases.test.ts` は plan / execute / verify / improve の横断回帰を主に担う。

| テストケース                                               | 期待結果                                                | テスト名                    |
| ---------------------------------------------------------- | ------------------------------------------------------- | --------------------------- |
| `plan` phase で Write ツール呼び出し                       | `denied`                                                | TC-PP-11                    |
| `execute` phase で Write ツール呼び出し（allowedTools 内） | `allowed`                                               | TC-PP-12                    |
| `execute` phase で NotebookEdit 呼び出し                   | `denied`（DESTRUCTIVE_TOOLS）                           | TC-PP-13                    |
| `verify` phase で Edit ツール呼び出し                      | `denied`                                                | TC-PP-14                    |
| `improve` phase で Edit ツール呼び出し                     | `allowed`                                               | TC-PP-15                    |
| `improve` phase で Write ツール呼び出し                    | `denied`                                                | TC-PP-16                    |
| audit sink / record() を maxEvents 超えた場合              | 古いエントリが破棄（ring buffer 動作）                  | TC-AS-02                    |
| plan phase の hooks → audit イベント記録                   | session_start / pre_tool_use / session_end が記録される | TC-FG-01, TC-FG-02, TC-G-01 |
| `getGovernanceState()` IPC 応答                            | phase / policy / 直近 audit イベントを返す              | TC-FG-07, TC-G-07           |

---

## 実行タスク

### T-11-1: 自動テスト実行と証跡記録

```bash
# 全 governance テストを実行し、結果を記録
pnpm --filter @repo/desktop test -- \
  --grep "governance|SkillCreatorPermission|SkillCreatorHooks|SkillCreatorAudit" \
  --run --reporter=verbose 2>&1 | tee outputs/phase-11/auto-test-result.txt
```

**完了条件**:

- [ ] 全テストが PASS している
- [ ] テスト実行結果が `outputs/phase-11/auto-test-result.txt` に記録されている

### T-11-2: 既知の制限事項の記録

**Electron 手動確認が実施できない理由**:

1. worktree 環境では `pnpm --filter @repo/desktop dev` での Electron 起動が困難
2. governance ロジックは Main プロセス内の非 UI コンポーネントとして動作する
3. `SkillCreatorGovernance.integration.test.ts` は facade / hooks / audit の局所統合を、
   `GovernanceAllPhases.test.ts` は phase 横断の policy / state / audit を主証跡として担うため、
   今回の manual test はその自動テスト証跡を代替根拠とする
4. `getGovernanceState()` IPC は renderer から呼べるが、今回の manual test は自動テスト証跡を主証跡とする

**手動確認が必要になった場合の手順**（将来スコープ）:

1. main ブランチへのマージ後、`pnpm --filter @repo/desktop dev` を実行
2. DevTools Console で `window.electronAPI.getGovernanceState()` を呼び出す
3. 返り値で phase / policy / recentAuditEvents を確認する

**完了条件**:

- [ ] 既知の制限事項と代替証跡の根拠が `manual-test-result.md` に記録されている

### T-11-3: 手動テスト結果の成果物化

**[Feedback 4 準拠]**: NON_VISUAL の場合も `manual-test-result.md` のメタ情報を充実させる。

```markdown
# 手動テスト結果

## 判定: NON_VISUAL（自動テスト代替 PASS）

## 証跡の主ソース

- 自動テスト: `SkillCreatorGovernance.integration.test.ts` 全 XX 件 PASS
- 自動テスト: `GovernanceAllPhases.test.ts` 全 XX 件 PASS
- テスト実行日時: {{DATE}}

## スクリーンショットを作成しない理由

governance ロジックは Main プロセス内の非 UI コンポーネント。
視覚的に確認できる画面要素がない。

## 既知の制限事項

{{上記 T-11-2 の内容を記載}}
```

**完了条件**:

- [ ] `outputs/phase-11/manual-test-result.md` が作成されている
- [ ] NON_VISUAL 判定の理由が明記されている
- [ ] 証跡の主ソース（自動テスト名/件数）が記録されている

---

## 成果物

| 成果物名                     | パス                                     | 必須 |
| ---------------------------- | ---------------------------------------- | ---- |
| 自動テスト実行結果           | `outputs/phase-11/auto-test-result.txt`  | ✅   |
| 手動テスト結果（NON_VISUAL） | `outputs/phase-11/manual-test-result.md` | ✅   |

> **注意**: `screenshots/` ディレクトリは NON_VISUAL 判定のため作成しない。
> [Feedback BEFORE-QUIT-001 準拠]

---

## 完了条件チェックリスト

- [ ] 自動テスト（governance 全テスト）が PASS している
- [ ] `outputs/phase-11/auto-test-result.txt` にテスト実行結果が記録されている
- [ ] `outputs/phase-11/manual-test-result.md` が NON_VISUAL 形式で作成されている
- [ ] NON_VISUAL 判定の理由が明記されている（画面要素なし + worktree 制限）
- [ ] 証跡の主ソース（自動テスト名/件数）が記録されている
- [ ] スクリーンショットは作成していない（NON_VISUAL）
