# Phase 4: マージシミュレーションスクリプト仕様

## 1. 役割

Phase 11 で実行する `.gitattributes` 挙動検証の自動化スクリプト仕様。
本 Phase では **入出力契約のみ** を確定し、実装スタブは Phase 5 で最小限、
fail path 含む完全版は Phase 6〜11 で拡充する。

仮スクリプト名: `scripts/test/simulate-merge.sh`（**本タスクでは作成しない**）。
代替として Phase 11 では手動コマンドで同等挙動を再現し、`manual-test-result.md` に
実測ログを残す。

## 2. 引数仕様

| 引数                     | 必須 | 型   | 説明                                                                                                                       |
| ------------------------ | ---- | ---- | -------------------------------------------------------------------------------------------------------------------------- |
| `--scenario <ID>`        | ○    | str  | 実行する TC-ID（`TC-01` / `TC-02` / `TC-03` / `TC-04` / `TC-05` / `FAIL-01` / `FAIL-02` / `REG-01` / `REG-02` / `REG-03`） |
| `--gitattributes <path>` | ○    | path | 被テスト用 `.gitattributes` のパス                                                                                         |
| `--with-drivers`         | -    | flag | `setup-merge-drivers.sh` を事前実行                                                                                        |
| `--workdir <path>`       | -    | path | 一時ディレクトリ（省略時 `mktemp -d` で生成）                                                                              |
| `--verbose`              | -    | flag | git stdout / stderr を詳細出力                                                                                             |

## 3. 出力契約

### 3.1 stdout

1 行目: `SCENARIO: <ID> | ATTRS: <path> | DRIVERS: <yes|no>`
2 行目: `RESULT: PASS` または `RESULT: FAIL (reason)`
3 行目以降: 各 assert の結果（`assert_name | PASS|FAIL | actual=<value>`）

### 3.2 stderr

- `--verbose` 時のみ git コマンドの raw 出力
- スクリプト自身のエラー（依存コマンド不在など）は常に stderr

### 3.3 終了コード

| code | 意味                                                                           |
| ---- | ------------------------------------------------------------------------------ |
| 0    | PASS（全 assert 成功）                                                         |
| 1    | FAIL（assert 少なくとも 1 件失敗）                                             |
| 2    | セットアップ失敗（mktemp 失敗、git 未インストール、`.gitattributes` 不在など） |

## 4. 副作用と cleanup

- 作業ディレクトリは `mktemp -d -t gitattributes-mt-XXXXXX` で必ず OS 一時領域に作成。
- トラップ:
  ```bash
  trap 'rm -rf "$WORKDIR"' EXIT INT TERM
  ```
- 現在のリポジトリに影響しない（`git init` した **別** リポジトリで検証）。
- ログを残したい場合は `--workdir` を明示指定し、cleanup を skip する運用。

## 5. シナリオ別振る舞いの擬似コード

```bash
case "$SCENARIO" in
  TC-01)
    # LOGS.md append-only union
    setup_repo
    echo "# LOGS" > LOGS.md && git add LOGS.md && git commit -m init
    git checkout -b feature-a main
    echo "- entry A" >> LOGS.md && git commit -am "a"
    git checkout -b feature-b main
    echo "- entry B" >> LOGS.md && git commit -am "b"
    git checkout main && git merge feature-a --no-edit
    git merge feature-b --no-edit
    assert_line_count "LOGS.md" "entry A" 1
    assert_line_count "LOGS.md" "entry B" 1
    assert_line_count "LOGS.md" "<<<<<<<" 0
    ;;
  TC-02)
    # task-workflow.md structured → expect conflict (post-fix)
    setup_repo
    printf "## ゴール\n- old1\n- old2\n" > task-workflow.md
    git add task-workflow.md && git commit -m init
    git checkout -b feature-a main
    sed -i '' 's/old1/branchA/' task-workflow.md
    git commit -am "a"
    git checkout -b feature-b main
    sed -i '' 's/old1/branchB/' task-workflow.md
    git commit -am "b"
    git checkout main && git merge feature-a --no-edit
    # expect: next merge raises conflict
    if git merge feature-b --no-edit; then
      echo "RESULT: FAIL (no conflict marker)" && exit 1
    fi
    assert_line_count "task-workflow.md" "<<<<<<<" 1
    ;;
  TC-03 | TC-04)
    # indexes/*.json ours
    setup_repo
    mkdir -p indexes
    echo '{"v":1}' > indexes/map.json && git add -A && git commit -m init
    [ "$WITH_DRIVERS" = "yes" ] && bash "$REPO_ROOT/.claude/scripts/setup-merge-drivers.sh"
    git checkout -b feature-a main
    echo '{"v":2}' > indexes/map.json && git commit -am "a"
    git checkout -b feature-b main
    echo '{"v":3}' > indexes/map.json && git commit -am "b"
    git checkout main && git merge feature-a --no-edit
    git merge feature-b --no-edit 2> stderr.log || true
    if [ "$SCENARIO" = "TC-03" ]; then
      assert_content "indexes/map.json" '{"v":2}'
    else
      assert_stderr_contains "stderr.log" "failed to resolve 'ours'\|unknown merge driver"
    fi
    ;;
  TC-05)
    # .gitattributes comment coverage
    assert_grep_count "$GITATTRIBUTES" '^# \[' 3
    assert_grep_count "$GITATTRIBUTES" '^# 新規ファイル追加判断' 3
    ;;
esac
```

## 6. 共通ヘルパ契約

| 関数                                    | 役割                                                             |
| --------------------------------------- | ---------------------------------------------------------------- |
| `setup_repo()`                          | `git init` + user config + `.gitattributes` コピー + 初期 commit |
| `assert_line_count <file> <pat> <n>`    | `grep -c` 結果が `<n>` と一致する                                |
| `assert_content <file> <text>`          | ファイル内容が `<text>` と完全一致                               |
| `assert_stderr_contains <file> <regex>` | `grep -E` で一致する                                             |
| `assert_grep_count <file> <pat> <min>`  | 出現回数が `<min>` 以上                                          |

## 7. 本 Phase のスコープ

- **スコープ内**: 上記契約の確定のみ（Markdown 仕様）
- **スコープ外**: スクリプトファイルの新規作成、手動テストの実行（Phase 11 で実施）

## 8. Phase 5〜6〜11 への引き継ぎ

- Phase 5: `setup-merge-drivers.sh` 動作確認のログを `setup-merge-drivers-verify.log` に残す（スクリプト形式ではなくワンショット bash 実行）
- Phase 6: FAIL-01〜02、REG-01〜03 を同契約に合わせた手順として追加
- Phase 11: 本契約に沿って手動コマンドで実行し、`manual-test-result.md` に実測ログを保存
