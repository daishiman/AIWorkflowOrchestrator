# Phase 13: PR作成

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 13                          |
| Phase名    | PR作成                      |
| 前提Phase  | Phase 12                    |
| 後続Phase  | -（最終Phase）              |
| ステータス | blocked（ユーザー承認待ち） |
| 作成日     | 2026-03-25                  |
| 機能名     | UT-LLM-MOD-01-005           |

---

## 目的

全フェーズの成果物をまとめ、Pull Request を作成する。ユーザーにローカル動作確認を依頼し、CI の成功を確認した上でマージ可能な状態にする。

---

## 背景

Phase 12 のドキュメント更新が完了。ユーザーへのローカル動作確認依頼、変更サマリー作成、PR作成、CI確認の4ステップでマージ準備を完了する。マージはユーザーがGitHub UIで手動実行する。

---

## 実行タスク

1. ローカル確認依頼項目を整理し、ユーザー承認待ちの条件を明文化する。
2. PR 本文へ載せる変更サマリーと主要ファイル一覧を準備する。
3. `/ai:diff-to-pr` 実行条件とラベル案を整理する。
4. CI 失敗時の戻り先を明記し、Phase 13 を blocked で維持する。

### Task 13-1: ユーザーへのローカル動作確認依頼

PR作成前に、ユーザーに以下のローカル動作確認を依頼する:

**確認依頼事項**:

1. `pnpm install` で依存関係が正常にインストールされること
2. `pnpm typecheck` が全パッケージでエラー 0 であること
3. `pnpm test` が全テストPASSであること
4. `pnpm lint` がエラー/警告 0 であること
5. Electron アプリの起動確認（`pnpm --filter @repo/desktop dev`）
   - LLM プロバイダー選択が正常に動作すること
   - モデル一覧が正常に表示されること

**ユーザー確認待ち**: ユーザーからの承認を得てから Task 13-2 に進む。

### Task 13-2: 変更サマリーの提示

PR の本文に含める変更サマリーを作成する:

**変更概要**:

- PROVIDER_CONFIGS / inferProviderId / LLMProviderIdSchema の三重管理を解消
- `packages/shared/src/types/llm/schemas/provider-registry.ts` を新設し、PROVIDER_CONFIGS を SSoT として確立
- LLMProviderIdSchema と inferProviderId を PROVIDER_CONFIGS から自動導出

**変更ファイル一覧**:

- 新規: `packages/shared/src/types/llm/schemas/provider-registry.ts`
- 変更: `packages/shared/src/types/llm/schemas/provider.ts`
- 変更: `packages/shared/src/types/llm/schemas/index.ts`
- 変更: `apps/desktop/src/main/handlers/llm.ts`
- 新規: 関連テストファイル
- 新規: ドキュメント（Phase 1〜13 のワークフロー仕様書）

**破壊的変更**: なし（既存 export パス互換）

### Task 13-3: PR作成（/ai:diff-to-pr）

`/ai:diff-to-pr` を実行して Pull Request を作成する。

**PR タイトル案**:

```
refactor(shared): PROVIDER_CONFIGS SSoT 化 - 三重管理解消 (#1524)
```

**PR ラベル**:

- `refactoring`
- `shared-package`
- `llm`

**関連Issue**:

- Closes #1524

### Task 13-4: CI確認

PR作成後、CI パイプラインの実行結果を確認する:

```bash
# CI ステータスの確認
gh pr checks <PR番号>
```

**確認事項**:

- 全 CI ジョブがPASSしていること
- 型チェック CI がPASSしていること
- テスト CI がPASSしていること
- Lint CI がPASSしていること
- ビルド CI がPASSしていること

**CI失敗時の対処**:

- 失敗原因を特定し、該当する Phase 8 または Phase 9 に戻って修正
- 修正後に追加コミットを push し、CI を再実行

---

## 参照資料

| 参照資料              | パス                        | 内容             |
| --------------------- | --------------------------- | ---------------- |
| Phase 1 要件定義      | `phase-1-requirements.md`   | 要件・受入基準   |
| Phase 11 手動テスト   | `phase-11-manual-test.md`   | テスト結果       |
| Phase 12 ドキュメント | `phase-12-documentation.md` | ドキュメント更新 |
| Issue #1524           | GitHub                      | タスク定義       |

---

## 成果物

| 成果物           | パス                                     | 内容                           |
| ---------------- | ---------------------------------------- | ------------------------------ |
| PR情報           | `outputs/phase-13/pr-info.md`            | PR URL・番号・CI結果           |
| ローカル確認結果 | `outputs/phase-13/local-check-result.md` | ユーザー承認のローカル確認記録 |
| 変更サマリー     | `outputs/phase-13/change-summary.md`     | 変更ファイル・行数の概要       |

---

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼し、承認を得ている
- [ ] 変更サマリーが作成・提示されている
- [ ] `/ai:diff-to-pr` によるPR作成が完了している
- [ ] PR にラベルと関連 Issue #1524 が設定されている
- [ ] CI パイプラインが全ジョブPASSしている
- [ ] PR URL が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/UT-LLM-MOD-01-005 --phase 13
```

---

## Phase実行記録

Phase完了後、以下を記録してください:

## Phase 13 実行記録

### 実行タスク

| タスク | 結果 | 備考 |
| ------ | ---- | ---- |

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

- ***

## 次のPhase

なし（ワークフロー完了）
