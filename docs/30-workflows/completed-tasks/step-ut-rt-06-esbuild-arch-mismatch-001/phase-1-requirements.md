# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 1                                       |
| 機能名 | step-ut-rt-06-esbuild-arch-mismatch-001 |
| 作成日 | 2026-03-29                              |

## 目的

esbuild / Node 実行アーキテクチャ不整合の発生条件、復旧条件、blocker 扱いの条件を要件として固定する。

## P50チェック: 既実装状態の調査

```bash
ls apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.sdk-normalization.test.ts
node -e "console.log(process.arch)"
file "$(which node)"
EXPECTED_PLATFORM="darwin-$(node -p process.arch)"; echo "$EXPECTED_PLATFORM"
pnpm ls @esbuild/darwin-arm64 @esbuild/darwin-x64 2>/dev/null || echo "esbuild packages not directly listed"
```

| 判定       | 条件                                                                  | 対応                                |
| ---------- | --------------------------------------------------------------------- | ----------------------------------- |
| 環境不整合 | `process.arch` と `node_modules/@esbuild/$EXPECTED_PLATFORM` が不一致 | 再インストールと target test 再実行 |
| 正常       | current arch と esbuild package が一致                                | target test 実行確認と再発防止記録  |

## タスク分類

| 項目       | 値                                    |
| ---------- | ------------------------------------- |
| タスク種別 | fix（環境修正）                       |
| UI変更     | なし                                  |
| IPC変更    | なし                                  |
| docs-only  | いいえ（環境修正 + ドキュメント作成） |

## 実行タスク

- 要件抽出: mismatch の発生条件と影響範囲を固定
- 受け入れ基準作成: target test と guide の検証条件を定義
- blocker ルール作成: 環境未解消時は PASS 偽装しない条件を定義

## 参照資料

| 資料名             | パス                                                                                                   | 説明               |
| ------------------ | ------------------------------------------------------------------------------------------------------ | ------------------ |
| 未タスク指示書     | `docs/30-workflows/unassigned-task/UT-RT-06-ESBUILD-ARCH-MISMATCH-001.md`                              | 元の未タスク指示書 |
| 対象テストファイル | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.sdk-normalization.test.ts` | RT-06 のテスト対象 |
| 正本の完了記録     | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`                         | formalize 根拠     |
| 教訓               | `.claude/skills/aiworkflow-requirements/references/lessons-learned-phase12-workflow-lifecycle.md`      | 条件付き判定の根拠 |

## 要件定義

### 機能要件（FR）

| ID    | 要件                                                                  | 優先度 |
| ----- | --------------------------------------------------------------------- | ------ |
| FR-01 | RT-06 対象テストが non-watch で 1 回完走する                          | must   |
| FR-02 | current `process.arch` に対応する esbuild platform package が存在する | must   |
| FR-03 | 再発防止手順が `docs/40-guides/` に配置される                         | must   |

### 非機能要件（NFR）

| ID     | 要件                                               | 優先度 |
| ------ | -------------------------------------------------- | ------ |
| NFR-01 | worktree 作成後の preflight 手順が明文化されている | must   |
| NFR-02 | blocker が残る場合の記録方法が明文化されている     | must   |

### 受け入れ基準（AC）

| ID   | 基準                                                                                                                                                   | 検証方法             |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------- |
| AC-1 | `pnpm --filter @repo/desktop test:run -- src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.sdk-normalization.test.ts` が exit 0 で完了する | automated-test       |
| AC-2 | `EXPECTED_PLATFORM="darwin-$(node -p process.arch)"` と `node_modules/@esbuild/$EXPECTED_PLATFORM` が一致する                                          | manual-test          |
| AC-3 | テスト出力に esbuild mismatch エラーが含まれない                                                                                                       | automated-test       |
| AC-4 | `docs/40-guides/esbuild-arch-mismatch-prevention.md` が存在する                                                                                        | documentation-review |
| AC-5 | ガイドに `process.arch` 確認と `pnpm install --force` が記載されている                                                                                 | documentation-review |

## スコープ

### 含む

- Node 実行 arch と esbuild package の診断
- RT-06 target test の復旧確認
- worktree 再発防止ガイドの作成
- blocker の条件付き判定ルールの記録

### 含まない

- RT-06 テスト内容自体の変更
- CI/CD パイプライン実装変更
- PR 作成

## 前提条件

| 条件                                           | 種別       | ステータス |
| ---------------------------------------------- | ---------- | ---------- |
| macOS 上で Node 実行アーキテクチャを確認できる | technical  | met        |
| pnpm がインストール済み                        | technical  | met        |
| RT-06 テストファイルが存在する                 | dependency | met        |

## 制約

| 制約                                       | 種別      | 影響度 |
| ------------------------------------------ | --------- | ------ |
| target test 自体は変更しない               | technical | high   |
| パッケージマネージャーは pnpm を前提とする | technical | high   |
| blocker は PASS 扱いしない                 | process   | high   |

## 統合テスト連携

- 接続要件: `process.arch` と `@esbuild/darwin-*` の整合性
- 検証対象: target test の実行可否

## 成果物

| 成果物     | パス                              | 説明           |
| ---------- | --------------------------------- | -------------- |
| 要件定義書 | `outputs/phase-1/requirements.md` | 本ドキュメント |

## 完了条件

- [x] P50チェックを実施
- [x] FR/NFR を定義
- [x] AC-1〜AC-5 を定義
- [x] blocker を PASS 扱いしない判定条件を固定
- [x] スコープと制約を明確化
- [x] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 2: 設計
