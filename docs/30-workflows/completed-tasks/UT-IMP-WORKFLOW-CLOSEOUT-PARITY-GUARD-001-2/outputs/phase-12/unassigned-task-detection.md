# Phase 12 未タスク検出レポート: UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001

## 検出結果サマリー

| 項目                                  | 件数        |
| ------------------------------------- | ----------- |
| 未タスク候補（今回スコープ外）        | 2件         |
| describe.skip / it.skip の有無        | 0件         |
| Phase 3 MINOR 発見事項                | 2件         |
| drift baseline 遡及修正（別タスク化） | 1件（AC-7） |

---

## 未タスク候補一覧

### U-01（MINOR）: M-01 — S4 複数ファイル時の exit code 規定

| 項目       | 内容                                                                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ID         | M-01                                                                                                                                                               |
| 発見       | Phase 3 設計レビュー                                                                                                                                               |
| 事象       | `phase-N-*.md` が複数ファイル存在する場合（glob で複数ヒット）、どのファイルを S4 として採用するか未規定。現在は最初にマッチしたファイルを使用する実装になっている |
| 影響       | 複数 phase file が存在するワークフロー（将来的なフォーマット変更時）で誤検知の可能性                                                                               |
| 優先度     | LOW                                                                                                                                                                |
| 対処方針   | 複数ヒット時に warning を出力し、最初のファイルを採用する現行動作を仕様として明文化する別タスクを立てる                                                            |
| 別タスク化 | 必要（validate-closeout-parity.js の multi-file S4 仕様明文化）                                                                                                    |

### U-02（MINOR）: M-02 — checklist 実ファイル diff 確認

| 項目       | 内容                                                                                                                                                     |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ID         | M-02                                                                                                                                                     |
| 発見       | Phase 3 設計レビュー                                                                                                                                     |
| 事象       | `phase-12-completion-checklist.md` が `.claude/` と `.agents/` で同値であることを機械確認するステップが Phase 12 checklist 自体に含まれていない          |
| 影響       | checklist ファイル自体が mirror drift している状態で Phase 12 を完了させてしまうリスクがある                                                             |
| 優先度     | LOW                                                                                                                                                      |
| 対処方針   | `diff -q .claude/.../phase-12-completion-checklist.md .agents/.../phase-12-completion-checklist.md` を Step 1-F の標準コマンドに組み込む別タスクを立てる |
| 別タスク化 | 必要（checklist mirror 確認の Step 1-F 標準化）                                                                                                          |

---

## Phase 3 MINOR 発見事項まとめ

Phase 3 設計レビュー（`outputs/phase-3/gate-decision.md`）で記録された MINOR 発見事項は上記 M-01 / M-02 の 2 件。
いずれも validate-closeout-parity.js の現行動作を変更する必要がなく、仕様明文化または checklist 改訂として別タスク化する。

---

## drift baseline 遡及修正（AC-7）

| 項目           | 内容                                                                                                                                                     |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-7 内容      | Phase 1 drift-inventory.md で確認された 29 件の既存 drift を遡及修正すること                                                                             |
| 本タスクの扱い | 本タスク（UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001）はバリデーターの実装と Phase 12 必須ゲート化が主目的であり、29 件の遡及修正は別タスクとして分離する |
| 別タスク化     | 必要（drift baseline 29 件の遡及修正）                                                                                                                   |
| 優先度         | MEDIUM（validator が動作するようになったため、遡及修正の順序・影響範囲が明確になった）                                                                   |

---

## describe.skip / it.skip 確認

本タスクはスクリプト実装（.js）のみで TypeScript テストファイルを含まない。
Vitest テストファイルのスコープ外であるため、`describe.skip` / `it.skip` は存在しない。

```bash
# 確認コマンド（実行結果）
grep -r "describe.skip\|it.skip" \
  .claude/skills/task-specification-creator/scripts/__tests__/ 2>/dev/null | wc -l
# → 0
```

---

## 結論

今回の Phase 12 スコープで検出された未タスクは 3 件（M-01 / M-02 / AC-7 遡及修正）。
いずれも本タスクの主目的（parity guard の実装と必須ゲート化）には影響せず、別タスクとして独立させる。
