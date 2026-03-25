# Phase 13: PR作成

## メタ情報

| 項目     | 値                     |
| -------- | ---------------------- |
| Phase    | 13                     |
| 機能名   | Skill Creator DI 配線  |
| タスクID | UT-SC-05-IPC-DI-WIRING |
| 作成日   | 2026-03-23             |

## 目的

成果物の最終確認と PR 準備を行う。

## 背景

Phase 12 までの全成果物が完了した状態で、ユーザーの明示的な承認を得てから PR を作成する。commit と PR の自動実行は禁止。

## 実行タスク

### Task 1: 成果物の最終確認

| 成果物                               | 確認内容                                  | 結果 |
| ------------------------------------ | ----------------------------------------- | ---- |
| `apps/desktop/src/main/ipc/index.ts` | 3依存が注入されていること                 | -    |
| 追加テスト（必要な場合のみ）         | 全て PASS していること                    | -    |
| documentation-changelog.md           | 全 Step の結果が記録されていること        | -    |
| unassigned-task-detection.md         | 検出結果が記録されていること              | -    |
| artifacts.json                       | 全 Phase のステータスが記録されていること | -    |

### Task 2: 最終テスト実行

```bash
cd apps/desktop && pnpm lint && pnpm typecheck
cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillCreatorHandlers
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillCreatorIpc
```

> **⚠️ 重要: ユーザーの明示的な許可を得るまで、以下の Task 3〜4 は実行しないこと。**
> PR作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。

### Task 3: コミット

```bash
git add apps/desktop/src/main/ipc/index.ts
git add docs/30-workflows/w4a-sc-ipc-di-wiring/
# 追加テストファイルがある場合のみ
git add apps/desktop/src/main/services/runtime/__tests__/
git add apps/desktop/src/main/ipc/__tests__/
```

コミットメッセージ:

```
feat(ipc): RuntimeSkillCreatorFacade DI 配線完了

- skillFileManager, llmAdapter, resourceLoader を
  RuntimeSkillCreatorFacade のコンストラクタに注入
- plan() と improve() の LLM 統合パスを有効化
- API キー未設定時は Graceful Degradation を維持

Closes: UT-SC-05-IPC-DI-WIRING
```

### Task 4: PR 作成

PR タイトル（70文字以内）:

```
feat(ipc): RuntimeSkillCreatorFacade に DI 配線完了
```

PR 本文テンプレート:

```markdown
## Summary

- RuntimeSkillCreatorFacade のコンストラクタに skillFileManager、llmAdapter、resourceLoader を注入
- plan() と improve() の LLM 統合パス（integrated_api 経路）を有効化
- API キー未設定環境では Graceful Degradation を維持

## Test plan

- [ ] RuntimeSkillCreatorFacade 関連テスト全件 PASS
- [ ] SkillCreatorHandlers 関連テスト全件 PASS
- [ ] pnpm lint PASS
- [ ] pnpm typecheck PASS
- [ ] Electron アプリ起動確認（手動テスト）
```

### Task 5: タスク完了処理

- [ ] ワークフローディレクトリを `completed-tasks/` に移動（必要に応じて）
- [ ] `artifacts.json` の全 Phase ステータスを `completed` に更新
- [ ] CI/CD の完了を確認

## 参照資料

- `.claude/rules/07-git-and-tooling.md`（PR 作成ルール）
- Phase 12 ドキュメント（`phase-12-documentation.md`）

## 成果物

- Git コミット
- Pull Request
- `outputs/phase-13/local-check-result.md`
- `outputs/phase-13/change-summary.md`
- `outputs/phase-13/pr-info.md`

## 完了条件

- [ ] 成果物の最終確認を完了した
- [ ] 最終テストが全て PASS した
- [ ] ユーザーにローカル動作確認を依頼し、結果を記録した
- [ ] ユーザーの明示的な許可を得た
- [ ] コミットを作成した（`--no-verify` 不使用）
- [ ] PR を作成した
- [ ] `local-check-result.md` と `change-summary.md` を作成した
- [ ] タスク完了処理を実施した

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 成果物の最終確認（Task 1）
2. 最終テスト実行 lint/typecheck/test（Task 2）
3. ユーザーにローカル動作確認を依頼
4. ユーザーの明示的な許可を取得
5. コミット作成（Task 3）
6. PR 作成（Task 4）
7. タスク完了処理（Task 5）

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/w4a-sc-ipc-di-wiring --phase 13
```

---

## Phase実行記録

Phase完了後、以下を記録してください:

| タスク                 | 結果 | 備考 |
| ---------------------- | ---- | ---- |
| Task 1: 成果物最終確認 | -    | -    |
| Task 2: 最終テスト     | -    | -    |
| Task 3: コミット       | -    | -    |
| Task 4: PR作成         | -    | -    |
| Task 5: タスク完了処理 | -    | -    |

### 発見事項

- 良かった点: -
- 問題点: -
- 改善提案: -

### 次Phaseへの引き継ぎ事項

- -

## 次のPhase

なし（ワークフロー完了）
