# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 13                           |
| Phase名    | PR作成                       |
| 前提Phase  | Phase 12                     |
| 後続Phase  | なし                         |
| ステータス | 未実施                       |
| 作成日     | 2026-04-18                   |
| タスクID   | TASK-SC-LLM-PURPOSE-WIRE-001 |

---

## 目的

Phase 1〜12 の全作業を経て完成した実装を、レビュー可能な Pull Request としてリモートリポジトリへ提出する。
**PR 作成はユーザーの明示的な承認を得た後にのみ実行する。**

## 背景

全フェーズを通じて受入条件 AC-1〜AC-7 を満たした実装・テスト・ドキュメントが揃った状態で、
変更の意図と影響範囲をレビュアーに正確に伝える PR を作成する。
PR タイトル・説明には、変更概要・テスト方針・受入条件確認を含める。

---

## 重要事項

> **ユーザーの明示的な承認が必須です。**
> 本 Phase の実行手順（PR 作成コマンドの実行）は、ユーザーから「PR を作成してください」という
> 明示的な指示を受けた後にのみ着手してください。
> 承認なしに PR を作成することは禁止されています。

---

## 実行タスク

### タスク1: PR 作成前チェックリスト

**目的**: PR 作成前に全フェーズの完了と CI 通過を確認する。

**チェックリスト**:

| 項目                                         | 確認方法                                                        | 判定              |
| -------------------------------------------- | --------------------------------------------------------------- | ----------------- |
| Phase 1〜12 が全て完了している               | `outputs/` 配下の各 Phase 成果物を確認                          | □ 完了 / □ 未完了 |
| `pnpm --filter @repo/desktop typecheck` PASS | Phase 9 の品質ゲート記録を確認                                  | □ PASS / □ FAIL   |
| `pnpm --filter @repo/desktop lint` PASS      | Phase 9 の品質ゲート記録を確認                                  | □ PASS / □ FAIL   |
| `pnpm --filter @repo/desktop test` 全件 PASS | Phase 9 のテスト結果記録を確認                                  | □ PASS / □ FAIL   |
| AC-1〜AC-7 全件 PASS                         | Phase 10 の受入条件チェックリストを確認                         | □ PASS / □ FAIL   |
| ドキュメント更新完了                         | Phase 12 の成果物（実装ガイド・更新履歴等）が存在することを確認 | □ 完了 / □ 未完了 |
| レビュアーへの事前連絡                       | 担当レビュアーに PR 提出の予告を行う                            | □ 完了 / □ 未対応 |

**判定基準**:

- 全項目が「完了」または「PASS」の場合のみ PR 作成へ進む。
- 1項目でも「未完了」または「FAIL」がある場合は該当 Phase へ差し戻す。

---

### タスク2: PR タイトルと説明の準備

**目的**: レビュアーが変更の意図と影響範囲を素早く理解できる PR 説明を準備する。

**PR タイトル案**:

```
feat(skill-creator): extract-purpose エージェント LLM 接続実装 [TASK-SC-LLM-PURPOSE-WIRE-001]
```

**PR 説明テンプレート**:

```markdown
## 変更概要

`SkillCreatorService.runCreateWorkflow` 内で `extract-purpose` エージェント定義を
LLM の system prompt として使用し、`structurePlan.purpose` に LLM 推論結果を格納するよう実装した。

従来は `loadAgent("extract-purpose")` の結果（エージェント定義文字列）が
そのまま `purpose` フィールドに代入されていたが、本変更により LLM による推論結果が格納される。

## 変更ファイル

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts` - purpose 抽出 LLM 接続実装
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.purpose.test.ts` - purpose 抽出ユニットテスト追加

## テスト方針

- LLM モックを使用したユニットテストで purpose 抽出フロー（正常系・異常系・境界値）を検証
- 既存の collaborative モード・orchestrate モードのテストへの非回帰を確認済み
- カバレッジ: Line 80%以上・Branch 60%以上・Function 80%以上

## 受入条件確認

| ID   | 条件                                                                      | 状態    |
| ---- | ------------------------------------------------------------------------- | ------- |
| AC-1 | loadAgent("extract-purpose") の結果が LLM の system prompt として渡される | ✅ PASS |
| AC-2 | llmClient.generate({ system, user }) 相当の呼び出しが実装される           | ✅ PASS |
| AC-3 | structurePlan.purpose に LLM の生成結果が格納される                       | ✅ PASS |
| AC-4 | 既存 LLM 呼び出しパターンと整合する実装形式                               | ✅ PASS |
| AC-5 | extract-purpose エージェント定義の出力フォーマットが文書化                | ✅ PASS |
| AC-6 | 既存テストが全てパスし続ける                                              | ✅ PASS |
| AC-7 | purpose 抽出専用ユニットテストが LLM モックで検証可能                     | ✅ PASS |

## 依存タスク

- TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001（完了済み）

## 関連 Issue

- #2239（CLOSED）
```

---

### タスク3: ブランチとコミット状態の確認

**目的**: PR 対象ブランチに全変更がコミット済みであることを確認する。

**実行手順**:

1. 未コミットの変更がないことを確認する:
   ```bash
   git status
   ```
2. コミット履歴を確認し、本タスクの変更が全て含まれていることを確認する:
   ```bash
   git log --oneline -10
   ```
3. リモートブランチとの差分を確認する:
   ```bash
   git diff origin/main...HEAD --stat
   ```

**期待される状態**:

- `git status` が clean である（未コミットの変更がない）。
- 本タスクの変更ファイルが全てコミット済みである。

---

### タスク4: PR 作成コマンドの実行（ユーザー承認後のみ）

**目的**: 承認後に PR を作成する。

> **注意**: このタスクはユーザーから「PR を作成してください」という明示的な承認を受けた後にのみ実行する。

**gh コマンド例**:

```bash
gh pr create \
  --title "feat(skill-creator): extract-purpose エージェント LLM 接続実装 [TASK-SC-LLM-PURPOSE-WIRE-001]" \
  --body "$(cat <<'EOF'
## 変更概要

`SkillCreatorService.runCreateWorkflow` 内で `extract-purpose` エージェント定義を
LLM の system prompt として使用し、`structurePlan.purpose` に LLM 推論結果を格納するよう実装した。

従来は `loadAgent("extract-purpose")` の結果（エージェント定義文字列）が
そのまま `purpose` フィールドに代入されていたが、本変更により LLM による推論結果が格納される。

## 変更ファイル

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts` - purpose 抽出 LLM 接続実装
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.purpose.test.ts` - purpose 抽出ユニットテスト追加

## テスト方針

- LLM モックを使用したユニットテストで purpose 抽出フロー（正常系・異常系・境界値）を検証
- 既存の collaborative モード・orchestrate モードのテストへの非回帰を確認済み
- カバレッジ: Line 80%以上・Branch 60%以上・Function 80%以上

## 受入条件確認

| ID   | 条件                                                      | 状態    |
| ---- | --------------------------------------------------------- | ------- |
| AC-1 | loadAgent("extract-purpose") の結果が LLM の system prompt として渡される | ✅ PASS |
| AC-2 | llmClient.generate({ system, user }) 相当の呼び出しが実装される | ✅ PASS |
| AC-3 | structurePlan.purpose に LLM の生成結果が格納される       | ✅ PASS |
| AC-4 | 既存 LLM 呼び出しパターンと整合する実装形式               | ✅ PASS |
| AC-5 | extract-purpose エージェント定義の出力フォーマットが文書化 | ✅ PASS |
| AC-6 | 既存テストが全てパスし続ける                              | ✅ PASS |
| AC-7 | purpose 抽出専用ユニットテストが LLM モックで検証可能     | ✅ PASS |

## 依存タスク

- TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001（完了済み）

🤖 Generated with Claude Code
EOF
)"
```

**実行後の確認**:

1. `gh pr view` で PR が正しく作成されたことを確認する。
2. PR の URL をユーザーに報告する。
3. CI が自動実行される場合は `gh run list` で CI 状態を確認する。

---

### タスク5: CI 通過確認

**目的**: PR 作成後に CI が通過することを確認する。

**実行手順**:

1. CI の実行状態を確認する:
   ```bash
   gh run list --limit 5
   ```
2. CI が全て PASS していることを確認する。
3. CI が FAIL している場合は原因を調査し、修正が必要だと確定した変更だけを追加する。

**期待される状態**:

- 全 CI ジョブが PASS している。
- PR がマージ可能な状態になっている。

---

## 参照資料

| 参照資料                        | パス                                                                                    | 内容                        |
| ------------------------------- | --------------------------------------------------------------------------------------- | --------------------------- |
| タスク index                    | docs/30-workflows/TASK-SC-LLM-PURPOSE-WIRE-001/index.md                                 | タスク全体概要              |
| Phase 9 品質ゲート結果          | docs/30-workflows/TASK-SC-LLM-PURPOSE-WIRE-001/outputs/phase-9/quality-gate-result.md   | CI 確認の参照元             |
| Phase 10 受入条件チェックリスト | docs/30-workflows/TASK-SC-LLM-PURPOSE-WIRE-001/outputs/phase-10/ac-final-checklist.md   | PR 説明の受入条件確認参照元 |
| Phase 12 実装ガイド             | docs/30-workflows/TASK-SC-LLM-PURPOSE-WIRE-001/outputs/phase-12/implementation-guide.md | PR 説明の補足参照元         |

---

## 成果物

| 成果物                      | パス                                 | 内容                          |
| --------------------------- | ------------------------------------ | ----------------------------- |
| PR 作成前チェックリスト記録 | outputs/phase-13/pre-pr-checklist.md | 全項目の確認結果              |
| PR URL 記録                 | outputs/phase-13/pr-url.md           | 作成した PR の URL と CI 状態 |

---

## 統合テスト連携

Phase 13 では以下の統合テスト連携アクションを確認する:

1. **CI 統合テスト確認**: PR 作成後に CI が自動実行される統合テストを確認し、全件 PASS を `outputs/phase-13/pr-url.md` に記録する。
2. **PR マージ前の最終確認**: CI PASS とレビュアーの承認を得た後にマージを実施する（マージ操作はユーザーが行う）。

---

## 完了条件

- [ ] ユーザーから PR 作成の明示的な承認を得ている
- [ ] PR 作成前チェックリストの全項目が「完了」または「PASS」である
- [ ] `git status` が clean である（未コミットの変更がない）
- [ ] `gh pr create` コマンドが正常に完了し、PR URL が取得できている
- [ ] PR の説明に変更概要・テスト方針・受入条件確認が含まれている
- [ ] CI が全件 PASS している（または FAIL の場合は修正済み）
- [ ] PR URL が `outputs/phase-13/pr-url.md` に記録されている
