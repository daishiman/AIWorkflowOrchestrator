# Phase 7: カバレッジ確認 - esbuild darwin アーキテクチャ不整合の解消

## メタ情報

| 項目         | 値                                 |
| ------------ | ---------------------------------- |
| Phase        | 7                                  |
| 機能名       | カバレッジ確認                     |
| 前Phase      | Phase 6 (テスト拡充)               |
| 次Phase      | Phase 8 (リファクタリング)         |
| 作成日       | 2026-03-30                         |
| タスクID     | UT-RT-06-ESBUILD-ARCH-MISMATCH-001 |
| ワークフロー | esbuild-arch-mismatch-fix          |
| ステータス   | 未実施                             |

## 目的

Phase 4 で定義した全検証コマンドを再実行し、100% PASS を確認する。本タスクは環境修正であるため、コードカバレッジではなくコマンド PASS 率をカバレッジ指標とする。

## 実行タスク

- T-07-1: 全検証コマンドを再実行して結果を記録する
- T-07-2: RT-06 対象テストの詳細結果を確認する
- T-07-3: 失敗時の対応フローを定義する

### T-07-1: 全検証コマンドの再実行と結果記録

Phase 4 で定義した全コマンドを再実行し、結果を表形式で記録する。

| #   | カテゴリ   | コマンド                                                                                                                          | 期待結果                | 実行結果       | ステータス |
| --- | ---------- | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | -------------- | ---------- |
| 1   | 環境検証   | `node -e "console.log(process.arch)"`                                                                                             | `x64`                   | _実行時に記入_ | -          |
| 2   | 環境検証   | `uname -m`                                                                                                                        | `x86_64`                | _実行時に記入_ | -          |
| 3   | 環境検証   | `ls node_modules/@esbuild/`                                                                                                       | `darwin-x64` が含まれる | _実行時に記入_ | -          |
| 4   | 環境検証   | `file $(which node)`                                                                                                              | Universal binary        | _実行時に記入_ | -          |
| 5   | vitest     | `pnpm vitest run --reporter=verbose 2>&1 \| head -20`                                                                             | esbuild エラーなし      | _実行時に記入_ | -          |
| 6   | vitest     | `pnpm --filter @repo/desktop test:run -- src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.sdk-normalization.test.ts` | PASS/FAIL 判定あり      | _実行時に記入_ | -          |
| 7   | 品質ゲート | `pnpm typecheck`                                                                                                                  | エラー 0 件             | _実行時に記入_ | -          |
| 8   | 品質ゲート | `pnpm lint`                                                                                                                       | エラー 0 件             | _実行時に記入_ | -          |

### T-07-2: RT-06 対象テスト結果の詳細確認

RT-06 で追加・修正されたテストファイルの実行結果を個別に確認する。

```bash
# RT-06 対象テストの詳細結果
pnpm --filter @repo/desktop test:run -- src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.sdk-normalization.test.ts --reporter=verbose
```

**確認項目:**

- テストスイート名と件数
- PASS/FAIL/SKIP の内訳
- esbuild 関連エラーが出力されていないこと

### T-07-3: 失敗時の対応フロー

いずれかのコマンドが FAIL した場合の対応フローを定義する。

```
失敗コマンドあり
  ├─ 環境検証コマンド (#1-4) が FAIL
  │   → Phase 5 (T-05-2: x64 環境一貫性の再確認) に戻る
  ├─ vitest コマンド (#5-6) が FAIL
  │   ├─ esbuild エラーの場合 → Phase 5 (T-05-3: クリーンインストール) に戻る
  │   └─ テストロジックエラーの場合 → Phase 6 で調査（本タスクのスコープ外の可能性）
  └─ 品質ゲートコマンド (#7-8) が FAIL
      └─ Phase 6 で調査（esbuild 非依存の場合はスコープ外）
```

## 統合テスト連携【必須】

全検証コマンドの PASS を確認し、Phase 4 (Red) → Phase 5 (Green) の TDD サイクルが正常に完了したことを証明する。

## 参照資料

| 参照資料         | パス                                                                          | 内容                         |
| ---------------- | ----------------------------------------------------------------------------- | ---------------------------- |
| Node.js 技術仕様 | `.claude/skills/aiworkflow-requirements/references/technology-core.md`        | Node.js 22.x LTS / pnpm 仕様 |
| DevOps 技術仕様  | `.claude/skills/aiworkflow-requirements/references/technology-devops-core.md` | esbuild / tsup 構成          |
| 元タスク定義     | `docs/30-workflows/completed-tasks/UT-RT-06-ESBUILD-ARCH-MISMATCH-001.md`     | esbuild arch 不整合タスク    |

## 成果物

| 成果物             | パス                                 | 説明                                       |
| ------------------ | ------------------------------------ | ------------------------------------------ |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | 全検証コマンドの実行結果と PASS 率のまとめ |

## 完了条件

- [ ] Phase 4 の全検証コマンド（8 件）が再実行されている
- [ ] 全コマンドの実行結果が表形式で記録されている
- [ ] RT-06 対象テストの詳細結果が確認されている
- [ ] PASS 率 100% が達成されている、または失敗コマンドに対して Phase 6 への差し戻し判断が記録されている
- [ ] `outputs/phase-7/coverage-report.md` が生成されている

## Phase末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

## 次の Phase

Phase 8: リファクタリング（ドキュメント整理）
