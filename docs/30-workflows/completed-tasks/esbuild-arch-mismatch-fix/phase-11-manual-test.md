# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 11                                         |
| Phase名    | 手動テスト                                 |
| 対象機能   | UT-RT-06-ESBUILD-ARCH-MISMATCH-001         |
| 前Phase    | Phase 10: 最終確認ゲート                   |
| 次Phase    | Phase 12: ドキュメント更新                 |
| ステータス | 未実施                                     |
| 作成日     | 2026-03-30                                 |
| 分類       | NON_VISUAL（環境修正タスク、画面部品なし） |

---

## 目的

環境修正の結果を実環境で手動検証し、esbuild アーキテクチャ不整合が解消されていることを確認する。
また、再発防止ドキュメントの内容が新規開発者にとって十分明確であることを検証する。
本 Phase では `arm64` / `x64` の固定値ではなく、install 時と run 時の `process.arch` が一致していることを成功条件とする。

---

## タスク分類: NON_VISUAL

本タスクは環境修正（esbuild バイナリのアーキテクチャ不整合解消）であり、画面部品を含まない。

- **記録方針**: 端末証跡を保存（NON_VISUAL）
- 記録用ディレクトリを作成し、端末出力を保存する
- 手動テスト結果に「NON_VISUAL: 環境修正タスクのため端末証跡のみ記録」を記録する

---

## 実行タスク

- Task 1: 環境状態を手動検証する
- Task 2: vitest を手動実行し、結果を記録する
- Task 3: RT-06 固有テストを手動実行する
- Task 4: 再発防止ドキュメントの品質を確認する

### Task 1: 手動環境検証

worktree ディレクトリ内でアーキテクチャ状態を確認する。
確認対象は、install 時と run 時の `process.arch` の一致と、それに対応する esbuild バイナリの存在である。

| No  | テスト項目                   | 操作手順                                  | 期待結果                                  |
| --- | ---------------------------- | ----------------------------------------- | ----------------------------------------- |
| 1   | Node.js アーキテクチャ確認   | `node -e "console.log(process.arch)"`     | install/run の arch が一致する            |
| 2   | esbuild バイナリ存在確認     | `ls node_modules/@esbuild/`               | current arch 対応の `darwin-*` が含まれる |
| 3   | esbuild 別アーキ共存確認     | `ls node_modules/@esbuild/`               | 追加アーキのバイナリ共存が許容される      |
| 4   | Node.js プラットフォーム確認 | `node -e "console.log(process.platform)"` | `darwin` が出力される                     |

### Task 2: 手動 vitest 実行検証

worktree ディレクトリで vitest を実行し、esbuild バイナリロードエラーが発生しないことを確認する。

| No  | テスト項目               | 操作手順                              | 期待結果                               |
| --- | ------------------------ | ------------------------------------- | -------------------------------------- |
| 1   | vitest 起動確認          | `pnpm vitest run`                     | esbuild バイナリロードエラーなし       |
| 2   | テスト結果記録           | 上記コマンドの出力を確認              | テスト件数と PASS/FAIL 結果が得られる  |
| 3   | エラーメッセージ不在確認 | 出力に esbuild 関連エラーがないか確認 | `esbuild` を含むエラーメッセージがない |

### Task 3: RT-06 固有テスト手動実行

RT-06 対象の特定テストファイルを直接実行する。

| No  | テスト項目            | 操作手順                                                                                                                          | 期待結果                                  |
| --- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| 1   | RT-06 SDK正規化テスト | `pnpm --filter @repo/desktop test:run -- src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.sdk-normalization.test.ts` | テストが実行され PASS/FAIL 判定が得られる |
| 2   | テスト件数記録        | 上記テスト結果の件数を記録                                                                                                        | 全テスト件数と結果が記録される            |

### Task 4: 再発防止ドキュメント検証

再発防止手順書の品質を検証する。

| No  | テスト項目             | 操作手順                                     | 期待結果                                           |
| --- | ---------------------- | -------------------------------------------- | -------------------------------------------------- |
| 1   | ドキュメント存在確認   | 再発防止手順書ファイルの存在を確認           | ファイルが存在する                                 |
| 2   | 手順の明確性確認       | 新規開発者の視点で手順を通読                 | 全手順が明確で、前提知識なしで実行可能             |
| 3   | コマンドの正確性確認   | 記載されたコマンドが正しい構文か確認         | 全コマンドがコピー&ペーストで実行可能              |
| 4   | 診断コマンド網羅性確認 | 環境診断に必要なコマンドが全て含まれるか確認 | arch確認、バイナリ確認、vitest実行が網羅されている |

---

## テストケース

| TC-ID | Task | テスト項目                   | 期待結果                                  |
| ----- | ---- | ---------------------------- | ----------------------------------------- |
| TC-01 | 1    | Node.js アーキテクチャ確認   | install/run の arch が一致する            |
| TC-02 | 1    | esbuild バイナリ存在確認     | current arch 対応の `darwin-*` が含まれる |
| TC-03 | 1    | esbuild 別アーキ共存確認     | 追加アーキのバイナリ共存が許容される      |
| TC-04 | 1    | Node.js プラットフォーム確認 | `darwin` が出力される                     |
| TC-05 | 2    | vitest 起動確認              | esbuild バイナリロードエラーなし          |
| TC-06 | 2    | テスト結果記録               | テスト件数と PASS/FAIL 結果が得られる     |
| TC-07 | 2    | エラーメッセージ不在確認     | `esbuild` を含むエラーメッセージがない    |
| TC-08 | 3    | RT-06 SDK正規化テスト        | テストが実行され PASS/FAIL 判定が得られる |
| TC-09 | 3    | テスト件数記録               | 全テスト件数と結果が記録される            |
| TC-10 | 4    | ドキュメント存在確認         | ファイルが存在する                        |
| TC-11 | 4    | 手順の明確性確認             | 全手順が明確で、前提知識なしで実行可能    |
| TC-12 | 4    | コマンドの正確性確認         | 全コマンドがコピー&ペーストで実行可能     |

---

## 画面カバレッジマトリクス

| TC-ID | 証跡                                                   |
| ----- | ------------------------------------------------------ |
| TC-01 | `outputs/phase-11/screenshots/terminal-arch-check.png` |
| TC-02 | `outputs/phase-11/screenshots/terminal-evidence.png`   |
| TC-03 | `outputs/phase-11/screenshots/terminal-arch-check.png` |
| TC-04 | `outputs/phase-11/screenshots/terminal-evidence.png`   |
| TC-05 | `outputs/phase-11/screenshots/terminal-evidence.png`   |
| TC-06 | `outputs/phase-11/screenshots/terminal-evidence.png`   |
| TC-07 | `outputs/phase-11/screenshots/terminal-evidence.png`   |
| TC-08 | `outputs/phase-11/screenshots/terminal-evidence.png`   |
| TC-09 | `outputs/phase-11/screenshots/terminal-evidence.png`   |
| TC-10 | `outputs/phase-11/screenshots/terminal-evidence.png`   |
| TC-11 | `outputs/phase-11/screenshots/terminal-evidence.png`   |
| TC-12 | `outputs/phase-11/screenshots/terminal-evidence.png`   |

---

## 統合テスト連携【必須】

| テスト項目           | 確認内容                                                        | 期待結果                 |
| -------------------- | --------------------------------------------------------------- | ------------------------ |
| esbuild バイナリ接続 | install/run の arch 一致状態で esbuild が正常にロードされること | ロードエラーなし         |
| vitest 実行環境      | pnpm vitest run が完走すること                                  | テスト結果が得られる     |
| RT-06 テスト統合     | RT-06 固有テストが esbuild エラーなく実行されること             | PASS/FAIL 判定が得られる |

---

## 参照資料

| 資料名       | パス                                    | 説明                              |
| ------------ | --------------------------------------- | --------------------------------- |
| 最終確認結果 | `N/A`                                   | Phase 10 で確定した結果を参照する |
| 再発防止手順 | `outputs/phase-5/` 内の関連ドキュメント | 再発防止手順書                    |

---

## 成果物

| 成果物             | パス                                        | 説明                          |
| ------------------ | ------------------------------------------- | ----------------------------- |
| 記録方針           | `N/A`                                       | NON_VISUAL のため視覚記録なし |
| 手動テストチェック | `outputs/phase-11/manual-test-checklist.md` | 全テストケースの事前確認表    |
| 手動テスト結果     | `outputs/phase-11/manual-test-result.md`    | 全テストケースの結果          |

---

## 完了条件

- [ ] Task 1: 環境検証の全テストが PASS
- [ ] Task 2: vitest 実行で esbuild エラーなし、テスト結果が記録済み
- [ ] Task 3: RT-06 固有テストが実行され結果が記録済み
- [ ] Task 4: 再発防止ドキュメントが明確で正確であることを確認
- [ ] 「NON_VISUAL: 環境修正タスクのため端末証跡のみ記録」を手動テスト結果に記録
- [ ] 端末証跡計画が作成されている
- [ ] 全テストケースの事前確認表が作成されている
- [ ] 全テストケースの結果が `outputs/phase-11/manual-test-result.md` に記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. Task 1: 手動環境検証の実施
3. Task 2: 手動 vitest 実行検証の実施
4. Task 3: RT-06 固有テスト手動実行の実施
5. Task 4: 再発防止ドキュメント検証の実施
6. 成果物の作成・配置
7. 完了条件の検証

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/esbuild-arch-mismatch-fix --phase 11
```

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
## Phase 11 実行記録

### 実行タスク

| タスク                           | 結果          | 備考     |
| -------------------------------- | ------------- | -------- |
| Task 1: 手動環境検証             | {{PASS/FAIL}} | {{備考}} |
| Task 2: 手動 vitest 実行検証     | {{PASS/FAIL}} | {{備考}} |
| Task 3: RT-06 固有テスト手動実行 | {{PASS/FAIL}} | {{備考}} |
| Task 4: 再発防止ドキュメント検証 | {{PASS/FAIL}} | {{備考}} |

### 記録方針

NON_VISUAL: 環境修正タスクのため記録不要

### 発見事項

- 良かった点: {{GOOD_POINTS}}
- 問題点: {{ISSUES}}
- 改善提案: {{IMPROVEMENTS}}

### 次Phaseへの引き継ぎ事項

- {{HANDOVER_ITEMS}}
```

---

## 次のPhase

Phase 12: ドキュメント更新
