# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 13                      |
| Phase名    | PR作成                  |
| 前提Phase  | Phase 12                |
| 後続Phase  | -（完了）               |
| ステータス | 未実施                  |
| 作成日     | 2026-01-25              |
| 機能名     | PermissionResolver 実装 |

---

## 目的

`/ai:diff-to-pr` コマンドでコミット・PR 作成・CI 確認を行い、
タスクを完了させる。

## 背景

Phase 1〜12 で実装・検証・ドキュメント更新が完了したため、
変更を Git にコミットし、プルリクエストを作成する。

---

## 実行タスク

### タスク 1: ローカル確認

**目的**: PR 作成前の最終確認を行う

**実行手順**:

1. `pnpm --filter @repo/desktop build` でビルド成功を確認
2. `pnpm --filter @repo/desktop test` で全テスト成功を確認
3. `pnpm --filter @repo/desktop typecheck` で型チェック成功を確認
4. `pnpm --filter @repo/desktop lint` で Lint 成功を確認

**期待される成果物**:

- 確認結果チェックリスト

### タスク 2: 変更内容の確認

**目的**: コミット対象ファイルを確認する

**実行手順**:

1. `git status` で変更ファイルを確認
2. `git diff` で差分を確認
3. コミット対象を特定

**期待される成果物**:

- 変更ファイルリスト

### タスク 3: PR 作成（ユーザー許可後）

**目的**: `/ai:diff-to-pr` でプルリクエストを作成する

**⚠️ 重要**: 本タスクは自動実行しない。必ずユーザーの明示的な許可を得てから実行する。

**実行手順**:

1. ユーザーに PR 作成の許可を求める
2. 許可を得たら `/ai:diff-to-pr` を実行
3. PR URL を取得
4. CI 結果を確認

**期待される成果物**:

- PR URL
- CI 成功確認

---

## 参照資料

| 参照資料          | パス                            | 内容         |
| ----------------- | ------------------------------- | ------------ |
| Phase 12 成果物   | `phase-12-documentation.md`     | ドキュメント |
| diff-to-pr スキル | `.claude/skills/ai/diff-to-pr/` | PR作成フロー |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                        | 内容     |
| -------------------- | --------------------------------------------------------------------------- | -------- |
| interfaces-agent-sdk | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | 型・仕様 |

---

## 成果物

| 成果物 | パス             | 内容       |
| ------ | ---------------- | ---------- |
| PR URL | 本ドキュメント内 | 作成したPR |
| CI結果 | GitHub Actions   | テスト結果 |

---

## ローカル確認チェックリスト

| #   | 確認項目       | コマンド                                | 結果 |
| --- | -------------- | --------------------------------------- | ---- |
| 1   | ビルド成功     | `pnpm --filter @repo/desktop build`     | [ ]  |
| 2   | テスト成功     | `pnpm --filter @repo/desktop test`      | [ ]  |
| 3   | 型チェック成功 | `pnpm --filter @repo/desktop typecheck` | [ ]  |
| 4   | Lint 成功      | `pnpm --filter @repo/desktop lint`      | [ ]  |

---

## 変更ファイルリスト

### 新規作成

| ファイル                                                                    | 内容       |
| --------------------------------------------------------------------------- | ---------- |
| `apps/desktop/src/main/services/skill/PermissionResolver.ts`                | クラス本体 |
| `apps/desktop/src/main/services/skill/__tests__/PermissionResolver.test.ts` | 単体テスト |

### 修正

| ファイル                                        | 内容             |
| ----------------------------------------------- | ---------------- |
| `apps/desktop/src/main/services/skill/index.ts` | エクスポート追加 |

---

## PR テンプレート

```markdown
## Summary

- PermissionResolver クラスを実装
- 権限確認リクエストの待機・解決機能を提供
- タイムアウト、AbortSignal、全キャンセル対応

## Test plan

- [ ] 単体テスト: `pnpm --filter @repo/desktop test -- --run PermissionResolver`
- [ ] 型チェック: `pnpm --filter @repo/desktop typecheck`
- [ ] ビルド: `pnpm --filter @repo/desktop build`

## Related

- TASK-3-2: PermissionResolver 実装
- Depends on: TASK-1-1（共通型定義）
- Blocks: TASK-4-2（IPC Handlers）
```

---

## 禁止事項（PR作成時）

| 禁止事項                                     | 理由                                           |
| -------------------------------------------- | ---------------------------------------------- |
| 勝手にPRを作成する                           | レビュー前の変更がリモートに反映されてしまう   |
| ユーザー確認なしで`/ai:diff-to-pr`を実行する | 意図しないブランチやコミットが作成される可能性 |
| ローカル確認をスキップする                   | 動作確認されていないコードがPRに含まれる       |

---

## 完了条件

- [ ] ローカル確認が全て成功している
- [ ] 変更ファイルリストが確認されている
- [ ] ユーザーの許可を得ている
- [ ] PR が作成されている（許可後）
- [ ] CI が成功している（許可後）

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 12 が完了していること
- **後続**: なし（タスク完了）

---

## タスク完了

Phase 13 完了後、以下を実行:

1. `artifacts.json` の全 Phase を `completed` に更新
2. タスク仕様書の `status` を `completed` に更新
3. 元タスク定義（`task-3-2-permission-resolver.md`）を `completed-task/` に移動
