# Phase 1: 要件定義 — 成果物

## メタ情報

| 項目       | 値                                      |
| ---------- | --------------------------------------- |
| Phase      | 1                                       |
| 機能名     | step-ut-rt-06-esbuild-arch-mismatch-001 |
| 作成日     | 2026-03-29                              |
| ステータス | 完了                                    |

## P50チェック結果

| 項目              | 結果                                                       |
| ----------------- | ---------------------------------------------------------- |
| Node arch         | arm64                                                      |
| Node binary       | Mach-O 64-bit executable arm64                             |
| Expected platform | darwin-arm64                                               |
| esbuild package   | node_modules 未存在（worktree のため pnpm install 未実施） |
| 判定              | 環境不整合 — 再インストールが必要                          |

## 機能要件（FR）

| ID    | 要件                                                                  | 優先度 |
| ----- | --------------------------------------------------------------------- | ------ |
| FR-01 | RT-06 対象テストが non-watch で 1 回完走する                          | must   |
| FR-02 | current `process.arch` に対応する esbuild platform package が存在する | must   |
| FR-03 | 再発防止手順が `docs/40-guides/` に配置される                         | must   |

## 非機能要件（NFR）

| ID     | 要件                                               | 優先度 |
| ------ | -------------------------------------------------- | ------ |
| NFR-01 | worktree 作成後の preflight 手順が明文化されている | must   |
| NFR-02 | blocker が残る場合の記録方法が明文化されている     | must   |

## 受け入れ基準（AC）

| ID   | 基準                                                                   | 検証方法             |
| ---- | ---------------------------------------------------------------------- | -------------------- |
| AC-1 | target test が exit 0 で完了する                                       | automated-test       |
| AC-2 | `EXPECTED_PLATFORM` と `node_modules/@esbuild/` が一致する             | manual-test          |
| AC-3 | テスト出力に esbuild mismatch エラーが含まれない                       | automated-test       |
| AC-4 | `docs/40-guides/esbuild-arch-mismatch-prevention.md` が存在する        | documentation-review |
| AC-5 | ガイドに `process.arch` 確認と `pnpm install --force` が記載されている | documentation-review |

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

## 完了条件

- [x] P50チェックを実施
- [x] FR/NFR を定義
- [x] AC-1〜AC-5 を定義
- [x] blocker を PASS 扱いしない判定条件を固定
- [x] スコープと制約を明確化
- [x] 本Phase内の全タスクを100%実行完了
