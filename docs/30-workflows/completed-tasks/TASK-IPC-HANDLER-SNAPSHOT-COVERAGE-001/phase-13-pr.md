# Phase 13: PR作成

## メタ情報

| 項目         | 内容                                            |
| ------------ | ----------------------------------------------- |
| Phase        | 13                                              |
| タスクID     | TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001          |
| タスク名     | IPC handler registration snapshot coverage 拡張 |
| タスク種別   | NON_VISUAL                                      |
| ステータス   | ブロック中（ユーザー承認待ち）                  |
| 作成日       | 2026-04-19                                      |
| GitHub Issue | #2287（CLOSED）, #2269（CLOSED）                |

## 目的

Phase 1-12 で実装・検証・ドキュメント化した IPC handler registration snapshot coverage 拡張を、
PRとしてmainブランチへマージする。

## 実行条件

- **ユーザーの明示的な承認が必要**
- Phase 10 の最終レビューが PASS していること
- Phase 11 の手動テストが完了していること（全テスト PASS）
- Phase 12 の全ドキュメントが揃っていること

## ブロック理由

ユーザーの明示承認待ち。PRはユーザー指示があるまで作成しない。

## 実行タスク

- blocked の場合は `outputs/phase-13/` の4成果物を整えて停止する
- 承認後はブランチ確認、PR作成、CI確認、必要に応じた reviewer 指定を順に実施する
- blocked と承認後の完了条件を混同せずに記録する

## PR作成手順（承認後）

### 1. ブランチ確認

```bash
git status
git branch
```

### 2. PR作成

```bash
gh pr create \
  --title "feat: IPC handler registration snapshot coverage 拡張 (TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001)" \
  --body "$(cat <<'EOF'
## 概要

IPC handler登録のスナップショットカバレッジを拡張する。
vi.spyOnパターンによるipcMain.handleモックを用いて、handler登録チャンネル一覧の
スナップショット検証・重複登録検出・登録数カウント検証を全handlerドメインに適用した。

## 変更内容

- REG-SNAP-XX: handler登録スナップショット検証テスト追加
- REG-DEDUP-XX: 重複登録検出テスト追加
- REG-COUNT-XX: 登録数カウント検証テスト追加
- Wave分割戦略に基づく段階的カバレッジ拡張

## テスト

- 全スナップショットテスト PASS
- 既存テストへの回帰なし
- CI実行時間増加: < 30秒

## 関連

Closes #2287
Relates to #2269

🤖 Generated with Claude Code
EOF
)"
```

### 3. CIの確認

```bash
# PR番号を確認してCIステータスを監視
gh pr checks <PR番号> --watch
```

確認項目（PR 作成後のみ必須）:

- [ ] lint: PASS
- [ ] typecheck: PASS
- [ ] test（vitest）: PASS
- [ ] build: PASS

### 4. PRレビュー依頼

CIがすべてPASSした後、レビュアーを指定する:

```bash
gh pr edit <PR番号> --add-reviewer <reviewer>
```

## 完了条件

- [ ] blocked の場合: ユーザーの明示的な承認待ちで停止し、`outputs/phase-13/` の4成果物が生成されている
- [ ] 承認後: Phase 10 最終レビューが PASS、Phase 11 手動テストが PASS、Phase 12 全ドキュメントが揃っている
- [ ] 承認後: PR が作成されている
- [ ] 承認後: CI が全て PASS している
- [ ] 承認後: 必要ならレビュアーが指定されている

## blocked 時の最低限の記録

user の明示承認がない限り、本 Phase は blocked のままとする。
blocked の場合でも以下を `outputs/phase-13/` に記録する:

- `local-check-result.md`: PR 作成前に確認済みのローカルチェック要約
- `change-summary.md`: 変更概要と対象ファイル群
- `pr-info.md`: 想定タイトル、想定本文、base/head、blocked 理由
- `pr-creation-result.md`: 未作成であること、承認待ちで止めたこと

## 成果物

- `outputs/phase-13/local-check-result.md`
- `outputs/phase-13/change-summary.md`
- `outputs/phase-13/pr-info.md`
- `outputs/phase-13/pr-creation-result.md`

## 参照資料

- `outputs/phase-12/system-spec-update-summary.md`
- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-10/final-review-result.md`

---

## タスク100%実行確認【必須】

- [ ] blocked の場合は `pr-creation-result.md` に blocked 理由を記録している
- [ ] 承認後はブランチ確認（git status / git branch）を実施している
- [ ] 承認後は PR 作成コマンドを実行している
- [ ] 承認後は CI ステータスを確認している（gh pr checks）
- [ ] `outputs/phase-13/` 配下の4成果物が全て生成されている
