# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 13                           |
| Phase名    | PR作成                       |
| 前提Phase  | Phase 12（ドキュメント更新） |
| 後続Phase  | なし（最終Phase）            |
| ステータス | 未実施                       |
| 作成日     | 2026-02-28                   |
| 機能名     | TASK-9D-skill-chain          |

---

## 目的

スキルチェーン機能（TASK-9D）の全 Phase（1〜12）の成果物が完成したことを確認し、ユーザーの許可を得た上で Pull Request を作成する。CI が通過した後、タスクディレクトリを `completed-tasks/` に移動してタスクを完了する。

## 背景

Phase 13 はタスクの最終段階であり、以下の責務を持つ:

1. 全 Phase の成果物が揃っていることの最終確認
2. ユーザーへのローカル動作確認依頼
3. 変更サマリーの提示とユーザー許可の取得
4. PR 作成と CI 確認
5. タスクディレクトリの完了処理

---

## 実行タスク

> 以下のタスクを順番に実行してください。**ユーザー許可が必要なタスクは、許可を得るまで次に進まないこと。**

### タスク 1: 全 Phase 成果物の最終確認

**目的**: Phase 1〜12 の成果物が全て揃っていることを確認する

**実行手順**:

1. `artifacts.json` を読み込み、全 Phase のステータスが `completed` であることを確認する
2. 以下のコード成果物の存在を確認する:

   | ファイル                                                           | 種別     | Phase |
   | ------------------------------------------------------------------ | -------- | ----- |
   | `packages/shared/src/types/skill-chain.ts`                         | 新規作成 | 5     |
   | `packages/shared/src/types/index.ts`（エクスポート追加）           | 修正     | 5     |
   | `apps/desktop/src/main/services/skill/SkillChainExecutor.ts`       | 新規作成 | 5     |
   | `apps/desktop/src/main/services/skill/SkillChainStore.ts`          | 新規作成 | 5     |
   | `apps/desktop/src/main/ipc/skillHandlers.ts`（チェーンハンドラ）   | 修正     | 5     |
   | `apps/desktop/src/preload/channels.ts`（チャネル定数追加）         | 修正     | 5     |
   | `apps/desktop/src/preload/skill-api.ts`（chainAPI 追加）           | 修正     | 5     |
   | `apps/desktop/src/preload/types.ts`（型定義追加）                  | 修正     | 5     |
   | `apps/desktop/src/renderer/store/slices/skillSlice.ts`（状態追加） | 修正     | 5     |

3. テスト成果物の存在を確認する:

   | ファイル                                                          | 種別   | Phase |
   | ----------------------------------------------------------------- | ------ | ----- |
   | `apps/desktop/src/main/services/skill/SkillChainExecutor.test.ts` | テスト | 4     |
   | `apps/desktop/src/main/services/skill/SkillChainStore.test.ts`    | テスト | 4     |
   | `apps/desktop/src/main/ipc/__tests__/skillChainHandlers.test.ts`  | テスト | 4     |

4. ドキュメント成果物の存在を確認する:

   | ファイル                                        | Phase |
   | ----------------------------------------------- | ----- |
   | `outputs/phase-11/manual-test-result.md`        | 11    |
   | `outputs/phase-12/implementation-guide.md`      | 12    |
   | `outputs/phase-12/documentation-changelog.md`   | 12    |
   | `outputs/phase-12/unassigned-task-detection.md` | 12    |
   | `outputs/phase-12/skill-feedback-report.md`     | 12    |
   | `outputs/phase-12/spec-update-summary.md`       | 12    |

5. 品質検証コマンドを最終実行する:

   ```bash
   # 型チェック
   pnpm --filter @repo/shared typecheck
   pnpm --filter @repo/desktop typecheck

   # Lint
   pnpm --filter @repo/shared lint
   pnpm --filter @repo/desktop lint

   # テスト
   cd apps/desktop && pnpm vitest run --grep "SkillChain"
   ```

**期待される成果物**:

- 確認結果の記録

---

### タスク 2: ローカル動作確認依頼

**目的**: ユーザーに Electron アプリのローカル動作確認を依頼する

**実行手順**:

1. ユーザーに以下の確認を依頼する:

   > **ローカル動作確認のお願い**
   >
   > TASK-9D（スキルチェーン機能）の実装が完了しました。
   > PR 作成前に、以下の動作確認をお願いします:
   >
   > 1. `pnpm --filter @repo/desktop dev` でアプリを起動
   > 2. DevTools で `window.electronAPI.skill.chainList` が `function` であることを確認
   > 3. 既存のスキル操作（一覧表示・インポート）が正常に動作することを確認
   > 4. エラーが表示されていないことを確認

2. ユーザーからの確認結果を待つ
3. 問題が報告された場合は、該当する Phase に戻って修正する

**期待される成果物**:

- ユーザーの確認結果

---

### タスク 3: 変更サマリーの提示とユーザー許可

**目的**: 全変更内容をユーザーに提示し、PR 作成の許可を得る

**実行手順**:

1. 以下のコマンドで変更内容を集計する:
   ```bash
   git diff main --stat
   git diff main --name-only
   ```
2. 変更サマリーをユーザーに提示する:

   > **変更サマリー**
   >
   > **新規ファイル**:
   >
   > - `packages/shared/src/types/skill-chain.ts` — 7 型定義
   > - `apps/desktop/src/main/services/skill/SkillChainExecutor.ts` — チェーン実行エンジン
   > - `apps/desktop/src/main/services/skill/SkillChainStore.ts` — チェーン永続化
   > - テストファイル 3 件
   >
   > **修正ファイル**:
   >
   > - `packages/shared/src/types/index.ts` — エクスポート追加
   > - `apps/desktop/src/main/ipc/skillHandlers.ts` — 5 チャネル追加
   > - `apps/desktop/src/preload/channels.ts` — チャネル定数追加
   > - `apps/desktop/src/preload/skill-api.ts` — chainAPI 追加
   > - `apps/desktop/src/preload/types.ts` — 型定義追加
   > - `apps/desktop/src/renderer/store/slices/skillSlice.ts` — チェーン状態追加
   >
   > **ドキュメント更新**:
   >
   > - システム仕様書 8 ファイル更新
   > - 実装ガイド作成
   >
   > この内容で PR を作成してよろしいですか？

3. ユーザーの許可を待つ
4. **ユーザーの許可なしに PR を作成しないこと**

**期待される成果物**:

- ユーザーの許可

---

### タスク 4: PR 作成

**目的**: GitHub に Pull Request を作成する

**前提条件**: タスク 3 でユーザーの許可を得ていること

**実行手順**:

1. ブランチを push する:
   ```bash
   git push -u origin docs/task-9d-skill-chain-specs
   ```
2. PR を作成する:

   ```bash
   gh pr create --title "feat(skill-chain): TASK-9D スキルチェーン機能実装" --body "$(cat <<'EOF'
   ## Summary
   - スキルチェーン機能の型定義・実行エンジン・永続化・IPC拡張を実装
   - 5つのIPCチャネル（skill:chain:list/get/save/delete/execute）を追加
   - P42準拠の3段バリデーション、P44/P45準拠の契約整合性を確保

   ## 主な変更内容
   - **型定義**: 7型（SkillChainDefinition, SkillChainStep, InputMapping, OutputMapping, SkillChainCondition, SkillChainResult, StepResult）
   - **実行エンジン**: SkillChainExecutor（executeChain, buildStepInput, evaluateCondition, extractOutput, renderTemplate）
   - **永続化**: SkillChainStore（save, get, list, delete）
   - **IPC**: 5チャネル追加（P42/P44/P45準拠）
   - **Preload/Renderer**: chainAPI追加、skillSliceにチェーン状態追加

   ## スコープ外
   - UIコンポーネント（SkillChainBuilder/SkillChainStepEditor）は task-031b で実装予定

   ## Test Plan
   - [ ] SkillChainExecutor: 全メソッドのユニットテスト（executeChain, buildStepInput, evaluateCondition, extractOutput, renderTemplate）
   - [ ] SkillChainStore: CRUD操作テスト（save, get, list, delete）
   - [ ] IPCハンドラ: 5チャネルのバリデーション・正常系・異常系テスト
   - [ ] 統合テスト: IPC経由のチェーン操作フロー
   - [ ] 手動テスト: 16ケース全PASS（MT-01〜MT-16）
   - [ ] リグレッション: 既存スキル操作への影響なし確認

   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   EOF
   )"
   ```

3. PR の URL を記録する

**期待される成果物**:

- `outputs/phase-13/pr-info.md` — PR の URL とメタ情報

---

### タスク 5: CI 確認

**目的**: CI パイプラインが全て通過することを確認する

**実行手順**:

1. PR の CI ステータスを確認する:
   ```bash
   gh pr checks
   ```
2. CI が失敗した場合:
   - 失敗原因を調査する
   - 修正を行い、新しいコミットを push する
   - CI が通過するまで繰り返す
3. CI が通過したことを確認する

**期待される成果物**:

- CI 通過の確認結果

---

### タスク 6: タスクディレクトリ完了処理

**目的**: タスクディレクトリを完了タスクに移動する

**前提条件**: タスク 5 で CI が通過していること

**実行手順**:

1. `artifacts.json` の Phase 13 ステータスを `completed` に更新する
2. タスクディレクトリを `completed-tasks/` に移動する:
   ```bash
   mv docs/30-workflows/completed-tasks/TASK-9D-skill-chain/ docs/30-workflows/completed-tasks/TASK-9D-skill-chain/
   ```
3. 移動後にファイルが正しく配置されていることを確認する
4. `index.md` のステータスを `completed` に更新する

> **注意**: タスクディレクトリの移動はユーザーの最終確認後に実施する。自動的に移動しないこと。

**期待される成果物**:

- 完了処理の確認結果

---

## 参照資料

| 参照資料           | パス                                                                                                                         | 内容                  |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| TASK-9D タスク仕様 | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023e-task-9d-skill-chain.md` | タスク定義            |
| TASK-9D index      | `docs/30-workflows/completed-tasks/TASK-9D-skill-chain/index.md`                                                             | Phase一覧・成果物概要 |
| Phase 1 成果物     | `docs/30-workflows/completed-tasks/TASK-9D-skill-chain/outputs/phase-1/`                                                     | 要件・受け入れ基準    |
| Phase 2 成果物     | `docs/30-workflows/completed-tasks/TASK-9D-skill-chain/outputs/phase-2/`                                                     | 設計仕様              |
| Phase 5 成果物     | `docs/30-workflows/completed-tasks/TASK-9D-skill-chain/outputs/phase-5/`                                                     | 実装記録              |
| Phase 6 成果物     | `docs/30-workflows/completed-tasks/TASK-9D-skill-chain/outputs/phase-6/`                                                     | テスト拡充結果        |
| Phase 7 成果物     | `docs/30-workflows/completed-tasks/TASK-9D-skill-chain/outputs/phase-7/`                                                     | カバレッジ結果        |
| Phase 8 成果物     | `docs/30-workflows/completed-tasks/TASK-9D-skill-chain/outputs/phase-8/`                                                     | リファクタリング記録  |
| Phase 9 成果物     | `docs/30-workflows/completed-tasks/TASK-9D-skill-chain/outputs/phase-9/`                                                     | 品質保証結果          |
| Phase 10 成果物    | `docs/30-workflows/completed-tasks/TASK-9D-skill-chain/outputs/phase-10/`                                                    | 最終レビュー結果      |
| Phase 11 成果物    | `docs/30-workflows/completed-tasks/TASK-9D-skill-chain/outputs/phase-11/`                                                    | 手動テスト結果        |
| Phase 12 成果物    | `docs/30-workflows/completed-tasks/TASK-9D-skill-chain/outputs/phase-12/`                                                    | ドキュメント成果物    |
| PR 作成ルール      | `.claude/rules/07-git-and-tooling.md`                                                                                        | ブランチ名・PR本文    |
| Git 操作禁止事項   | `CLAUDE.md`                                                                                                                  | --no-verify 禁止等    |

---

## 成果物

| 成果物  | パス                          | 内容             |
| ------- | ----------------------------- | ---------------- |
| PR 情報 | `outputs/phase-13/pr-info.md` | PR URL・メタ情報 |

---

## 統合テスト連携

PR 作成前に以下の最終検証を実行する:

```bash
# 全パッケージの型チェック
pnpm --filter @repo/shared typecheck
pnpm --filter @repo/desktop typecheck

# 全パッケージの Lint
pnpm --filter @repo/shared lint
pnpm --filter @repo/desktop lint

# スキルチェーン関連テスト
cd apps/desktop && pnpm vitest run --grep "SkillChain"

# 全テスト（リグレッション確認）
cd apps/desktop && pnpm vitest run
```

---

## 多角的チェック観点

### PR 品質観点

- [ ] PR タイトルが 70 文字以内
- [ ] PR 本文に Summary（箇条書き）と Test Plan が含まれている
- [ ] ブランチ名が `feature/` または `feat/` プレフィックスに従っている
- [ ] main ブランチに直接 push していない

### 最終成果物確認観点

- [ ] コード成果物: 新規 3 ファイル + 修正 6 ファイル
- [ ] テスト成果物: 3 テストファイル
- [ ] ドキュメント成果物: Phase 11-12 の全成果物

### CI/CD 観点

- [ ] TypeScript 型チェック通過
- [ ] ESLint 通過
- [ ] 全テスト通過
- [ ] ビルド成功

---

## 完了条件

- [ ] Phase 1〜12 の全成果物が存在することを確認済み
- [ ] 品質検証コマンド（typecheck/lint/test）が全て通過
- [ ] ユーザーのローカル動作確認が完了
- [ ] ユーザーの PR 作成許可を取得済み
- [ ] PR が作成され、URL が記録されている
- [ ] CI が全て通過
- [ ] `outputs/phase-13/pr-info.md` が作成されている
- [ ] タスクディレクトリが `completed-tasks/` に移動されている（ユーザー最終確認後）
- [ ] `artifacts.json` の全 Phase ステータスが `completed`

---

## サブタスク管理

| #   | サブタスク                     | ステータス | 依存関係     |
| --- | ------------------------------ | ---------- | ------------ |
| 1   | 全 Phase 成果物の最終確認      | 未着手     | -            |
| 2   | ローカル動作確認依頼           | 未着手     | #1           |
| 3   | 変更サマリー提示とユーザー許可 | 未着手     | #2           |
| 4   | PR 作成                        | 未着手     | #3（許可後） |
| 5   | CI 確認                        | 未着手     | #4           |
| 6   | タスクディレクトリ完了処理     | 未着手     | #5           |

---

## タスク100%実行確認

- [ ] タスク 1（全 Phase 成果物の最終確認）を 100% 完了
- [ ] タスク 2（ローカル動作確認依頼）を 100% 完了
- [ ] タスク 3（変更サマリー提示とユーザー許可）を 100% 完了
- [ ] タスク 4（PR 作成）を 100% 完了
- [ ] タスク 5（CI 確認）を 100% 完了
- [ ] タスク 6（タスクディレクトリ完了処理）を 100% 完了

---

## Phase末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] PR が作成され CI が通過していることを確認

---

## 依存関係

- **前提**: Phase 12（ドキュメント更新）が完了していること
- **後続**: なし（TASK-9D の最終 Phase）

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
## Phase 13 実行記録

### 実行タスク

- タスク 1（全Phase成果物確認）: [結果]
- タスク 2（ローカル動作確認依頼）: [結果]
- タスク 3（変更サマリー・ユーザー許可）: [結果]
- タスク 4（PR作成）: [結果]
- タスク 5（CI確認）: [結果]
- タスク 6（タスクディレクトリ完了処理）: [結果]

### PR 情報

- **PR URL**: [URL]
- **PR 番号**: #[番号]
- **ブランチ**: [ブランチ名]
- **CI ステータス**: [通過/失敗]

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### タスク完了宣言

TASK-9D（スキルチェーン機能実装）の全 Phase（1〜13）が完了しました。
```

---

## 次のPhase

これが TASK-9D の最終 Phase です。完了後、以下のタスクに進むことを検討してください:

- **task-031b**: スキルチェーン UI コンポーネント（SkillChainBuilder/SkillChainStepEditor）の実装
- **TASK-9E**: スキルフォーク機能実装
- **TASK-9F**: スキルバージョニング機能実装
