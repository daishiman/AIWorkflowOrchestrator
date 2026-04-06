# Phase 13: PR作成

## メタ情報

| 項目       | 値                                         |
| ---------- | ------------------------------------------ |
| Phase      | 13                                         |
| Phase名    | PR作成                                     |
| 前提Phase  | Phase 12                                   |
| 後続Phase  | なし（完了）                               |
| ステータス | 未実施                                     |
| 作成日     | 2026-04-06                                 |
| 機能名     | path-scoped-governance-runtime-enforcement |

---

## ⚠️ 重要: ユーザーの明示承認が必要

**PR作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。**

---

## 目的

レビュー依頼を出し、マージ準備を完了する。

---

## 実行タスク

### タスク1: コミット作成

**目的**: 変更内容を適切なコミットメッセージでコミットする

**コミットメッセージ形式**:

```
feat(governance): TASK-P0-09-U1 path-scoped runtime enforcement 実配線

RuntimeSkillCreatorFacade.createExecuteGovernanceCanUseTool() に
skillRoot パラメータと targetPath 抽出ロジックを追加し、
path-scoped deny を runtime で実効化する。

- input.file_path ?? input.path の fallback パターンで targetPath を抽出
- evaluateGovernanceToolUse に context を渡し path-scoped 判定を有効化
- improve phase にも同様の接続を適用
- TC-PATH-01〜06 追加（既存 90 件テスト全 PASS 維持）

Closes #1932
```

**実行手順**:

1. ユーザーの明示承認を得る
2. 変更ファイルをステージングする
3. コミットを作成する

**期待される成果物**:

- コミット

### タスク2: PR 作成

**PR タイトル**: `feat(governance): TASK-P0-09-U1 path-scoped runtime enforcement 実配線`

**PR ラベル**: `priority:high`, `scale:small`, `type:security`

**PR 本文**:

```markdown
## Summary

- `RuntimeSkillCreatorFacade.createExecuteGovernanceCanUseTool()` に `skillRoot` パラメータと `targetPath` 抽出ロジックを追加
- `evaluateGovernanceToolUse` に context を渡し、path-scoped deny を runtime で実効化
- `improve` phase にも同様の接続を適用
- TC-PATH-01〜06 追加、既存 90 件テスト全 PASS 維持

## Test Plan

- [ ] `cd apps/desktop && npx vitest run src/main/services/runtime/__tests__/governance/` が全 PASS
- [ ] `pnpm --filter @repo/desktop typecheck` が EXIT:0
- [ ] `pnpm --filter @repo/desktop lint --quiet` が EXIT:0
- [ ] `RuntimeSkillCreatorFacade.ts` branch coverage 80%+ 確認

## Security Impact

- skill-creator が意図せずスキルルート外のファイルを書き換えるリスクを解消
- TASK-P0-09 の AC-2 が PARTIAL → PASS に更新される

Closes #1932

🤖 Generated with Claude Code
```

**実行手順**:

1. ユーザーの明示承認を得る
2. `gh pr create` でPRを作成する

**期待される成果物**:

- GitHub PR URL

### タスク3: CI 確認

**目的**: PR 作成後の CI 状態を確認する

**実行手順**:

1. PR 作成後、CI が起動していることを確認する
2. CI 完了後、全チェックが PASS していることを確認する
3. FAIL がある場合は原因を調査し、修正コミットを追加する

**期待される成果物**:

- CI PASS の確認記録

### タスク4: completed-tasks への移動

**目的**: PR と CI が完了した後に、仕様書ディレクトリを completed-tasks へ移動して完了状態にする

**実行手順**:

1. `docs/30-workflows/task-p0-09-u1-path-scoped-governance-runtime-enforcement/` を `docs/30-workflows/completed-tasks/task-p0-09-u1-path-scoped-governance-runtime-enforcement/` へ移動する
2. 移動後に Phase 12 の成果物と Phase 13 の記録が残っていることを確認する

**期待される成果物**:

- completed-tasks へ移動済みのタスクディレクトリ

---

## 参照資料

| 参照資料        | パス                | 内容        |
| --------------- | ------------------- | ----------- |
| Phase 12 成果物 | `outputs/phase-12/` | PR 本文素材 |
| Issue #1932     | GitHub Issue        | Closes 対象 |

---

## 成果物

| 成果物    | パス      | 内容         |
| --------- | --------- | ------------ |
| GitHub PR | GitHub UI | レビュー依頼 |

---

## 完了条件

- [ ] ユーザーの明示承認を得ている
- [ ] コミットが作成されている
- [ ] PR が作成されている（タイトル・ラベル・本文が仕様通り）
- [ ] CI が全 PASS している
- [ ] Issue #1932 が PR とリンクされている
- [ ] タスクディレクトリが completed-tasks へ移動されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 12 が完了していること
- **後続**: なし（全 Phase 完了）

---

## タスク完了

全 Phase（1〜13）の完了をもって TASK-P0-09-U1 が完了する。
