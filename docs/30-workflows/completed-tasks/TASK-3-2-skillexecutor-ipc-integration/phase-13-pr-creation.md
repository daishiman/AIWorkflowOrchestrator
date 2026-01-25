# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 13                                     |
| Phase名    | PR作成                                 |
| 前提Phase  | Phase 12（ドキュメント更新）           |
| 後続Phase  | なし（タスク完了）                     |
| ステータス | 未実施                                 |
| 作成日     | 2026-01-25                             |
| 機能名     | TASK-3-2-skillexecutor-ipc-integration |

---

## 目的

コミット・PR作成・CI確認を行い、タスクを完了させる。

## 背景

Phase 1〜12で実装・テスト・ドキュメント更新が完了した。本Phaseでは、変更をコミットし、プルリクエストを作成してCIを確認する。

---

## 重要な注意事項

**PR作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。**

| 禁止事項                                     | 理由                                           |
| -------------------------------------------- | ---------------------------------------------- |
| 勝手にPRを作成する                           | レビュー前の変更がリモートに反映されてしまう   |
| ユーザー確認なしで`/ai:diff-to-pr`を実行する | 意図しないブランチやコミットが作成される可能性 |
| ローカル確認をスキップする                   | 動作確認されていないコードがPRに含まれる       |

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: ローカル確認

**目的**: PR作成前に全ての確認を行う

**実行手順**:

1. ビルドを確認する

   ```bash
   pnpm --filter @repo/desktop build
   ```

2. テストを確認する

   ```bash
   pnpm --filter @repo/desktop test
   ```

3. 型チェックを確認する

   ```bash
   pnpm --filter @repo/desktop typecheck
   ```

4. Lintを確認する

   ```bash
   pnpm --filter @repo/desktop lint
   ```

5. 結果を記録する

   | 確認項目   | 結果      |
   | ---------- | --------- |
   | ビルド     | PASS/FAIL |
   | テスト     | PASS/FAIL |
   | 型チェック | PASS/FAIL |
   | Lint       | PASS/FAIL |

**期待される成果物**:

- `outputs/phase-13/local-verification.md`

---

### タスク2: 変更内容の確認

**目的**: コミット対象の変更を確認する

**実行手順**:

1. git statusで変更ファイルを確認する

   ```bash
   git status
   ```

2. 変更ファイル一覧を記録する

   | ファイル | 変更種別       | 説明 |
   | -------- | -------------- | ---- |
   |          | 新規/変更/削除 |      |

3. 不要なファイルがないか確認する
   - `.env`ファイル
   - `node_modules`
   - ビルド成果物
   - テスト一時ファイル

**期待される成果物**:

- `outputs/phase-13/change-summary.md`

---

### タスク3: ユーザー確認を取得

**目的**: PR作成の許可をユーザーから取得する

**実行手順**:

1. 変更サマリーをユーザーに提示する

   ```
   ## PR作成の確認

   以下の変更をコミットし、PRを作成しますか？

   ### 変更ファイル
   - apps/desktop/src/preload/skill-api.ts（新規）
   - apps/desktop/src/renderer/hooks/useSkillExecution.ts（新規）
   - apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx（新規）
   - [他のファイル]

   ### 確認結果
   - ビルド: PASS
   - テスト: PASS
   - 型チェック: PASS
   - Lint: PASS

   PR作成を許可しますか？
   ```

2. ユーザーの明示的な許可を待つ

3. 許可が得られたら次のタスクへ進む

**期待される成果物**:

- ユーザーからの明示的な許可

---

### タスク4: PR作成実行

**目的**: `/ai:diff-to-pr`を使用してPRを作成する

**実行手順**:

1. `/ai:diff-to-pr`スキルを実行する

   ```
   /ai:diff-to-pr
   ```

2. スキルが以下を自動実行する:
   - リモートmain同期・コンフリクト解消
   - 品質検証（typecheck, lint, test）
   - 差分分析・ブランチ作成・コミット
   - PR本文生成・PR作成
   - 補足コメント投稿
   - CI/CD完了確認

3. PR URLを記録する

**期待される成果物**:

- PR URL
- `outputs/phase-13/pr-creation-result.md`

---

### タスク5: CI確認

**目的**: CIが成功することを確認する

**実行手順**:

1. PRページでCIのステータスを確認する

2. CI結果を記録する

   | CIジョブ   | 結果      |
   | ---------- | --------- |
   | Build      | PASS/FAIL |
   | Test       | PASS/FAIL |
   | Lint       | PASS/FAIL |
   | Type Check | PASS/FAIL |

3. CIが失敗した場合:
   - 失敗原因を特定する
   - 修正をコミットする
   - CIを再実行する

**期待される成果物**:

- `outputs/phase-13/ci-result.md`

---

### タスク6: タスク完了報告

**目的**: タスクの完了を報告する

**実行手順**:

1. タスク完了サマリーを作成する

   ```markdown
   # TASK-3-2 完了報告

   ## 概要

   SkillExecutor IPC Handler統合タスクが完了しました。

   ## 成果物

   ### 実装ファイル

   | ファイル                                                              | 説明             |
   | --------------------------------------------------------------------- | ---------------- |
   | apps/desktop/src/preload/skill-api.ts                                 | Preload API拡張  |
   | apps/desktop/src/renderer/hooks/useSkillExecution.ts                  | React Hook       |
   | apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx | UIコンポーネント |

   ### テストファイル

   | ファイル | テスト数 |
   | -------- | -------- |
   |          |          |

   ## PR情報

   | 項目     | 内容 |
   | -------- | ---- |
   | PR URL   |      |
   | ブランチ |      |
   | CI結果   | PASS |

   ## 次のステップ

   - PRレビュー待ち
   - マージはユーザーがGitHub UIで実施
   ```

2. `outputs/phase-13/task-completion-summary.md`に出力する

**期待される成果物**:

- `outputs/phase-13/task-completion-summary.md`

---

## 参照資料

| 参照資料          | パス                         | 内容         |
| ----------------- | ---------------------------- | ------------ |
| Phase 1〜12成果物 | `outputs/`                   | 全成果物     |
| diff-to-prスキル  | `.claude/skills/diff-to-pr/` | PR作成スキル |

---

## 成果物

| 成果物       | パス                                          | 内容           |
| ------------ | --------------------------------------------- | -------------- |
| ローカル確認 | `outputs/phase-13/local-verification.md`      | 確認結果       |
| 変更サマリー | `outputs/phase-13/change-summary.md`          | 変更一覧       |
| PR作成結果   | `outputs/phase-13/pr-creation-result.md`      | PR URL         |
| CI結果       | `outputs/phase-13/ci-result.md`               | CI確認結果     |
| 完了サマリー | `outputs/phase-13/task-completion-summary.md` | タスク完了報告 |

---

## 完了条件

- [ ] ローカル確認（ビルド・テスト・型チェック・Lint）が全てPASS
- [ ] 変更内容が確認されている
- [ ] ユーザーからPR作成の明示的な許可を取得
- [ ] PRが作成されている
- [ ] CIが全てPASS
- [ ] タスク完了サマリーが作成されている
- [ ] 全ての成果物が`outputs/phase-13/`に出力されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 12（ドキュメント更新）が完了していること
- **後続**: なし（タスク完了）

---

## タスク完了

Phase 13が完了すると、TASK-3-2（SkillExecutor IPC Handler統合）は完了となります。

PRのマージはユーザーがGitHub UIで手動で実施してください。
