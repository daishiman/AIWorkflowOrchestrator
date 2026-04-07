# Lessons Learned — IPC Channel whitelist 同期ガード（shared←→preload）

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: TASK-UI-02 / UT-TASK06-007 で発生した IPC Channel whitelist の stale 化問題の記録

## TASK-UI-02 / UT-TASK06-007: IPC Channel whitelist 同期ガード

### タスク概要

| 項目       | 内容                                                                                                                                          |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-UI-02 / UT-TASK06-007                                                                                                                    |
| 目的       | `shared/ipc/channels.ts` を正本とする IPC チャンネル定義と、`preload/channels.ts` の `ALLOWED_INVOKE_CHANNELS` whitelist の同期を保つ仕組みを整備する |
| 完了日     | 2026-04-06                                                                                                                                    |
| ステータス | **完了**（whitelist 同期コメント追記済み。自動検証は UT-TASK06-007 の follow-up として管理）                                                 |

### 問題の背景

`SKILL_CREATOR_EXTERNAL_API_CHANNELS` は `packages/shared/src/ipc/channels.ts` で定義されているが、Preload 層の `ALLOWED_INVOKE_CHANNELS` whitelist は `apps/desktop/src/preload/channels.ts` にも記載が必要であり、2 箇所の同期が手動依存になっていた。

TASK-UI-02 で `CONFIGURE_API` / `SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED` を `creatorHandlers.ts` へ移管した際、`preload/channels.ts` の whitelist への反映が漏れる可能性があることが判明した。

### 実装内容

| 変更内容 | ファイル | 説明 |
| --- | --- | --- |
| SSoT reference comment 追記 | `apps/desktop/src/preload/channels.ts` | `ALLOWED_INVOKE_CHANNELS` に「正本は `packages/shared/src/ipc/channels.ts`」のコメントを追記 |
| whitelist 登録確認手順追加 | `references/ipc-contract-checklist.md` | `CONFIGURE_API` / `SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED` の whitelist 登録確認コマンドを追記 |

### 苦戦箇所と解決策

#### 1. SKILL_CREATOR_EXTERNAL_API_CHANNELS が shared で定義される一方、ALLOWED_INVOKE_CHANNELS の whitelist は preload でも記載が必要で stale 化しやすい

| 項目       | 内容                                                                                                                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | `packages/shared/src/ipc/channels.ts` の `SKILL_CREATOR_EXTERNAL_API_CHANNELS` が正本だが、`apps/desktop/src/preload/channels.ts` の `ALLOWED_INVOKE_CHANNELS` とは別管理であり、新規チャンネル追加時に whitelist への反映が漏れやすい |
| **原因**   | TypeScript のビルド時型チェックは Preload 層のモック化により不整合を検出できず、ランタイムで初めて「channel not allowed」エラーが顕在化する構造になっていた                             |
| **解決策** | `preload/channels.ts` に `// SSoT: packages/shared/src/ipc/channels.ts` の reference comment を追記し、編集者が正本を参照するよう誘導する。自動検証は UT-TASK06-007 の check-ipc-contracts.ts（R-04: 定数定義済みだが Preload 未登録チャンネル検出）で対応する |
| **教訓**   | `shared/ipc/channels.ts` でチャンネルを追加した場合は、必ず `preload/channels.ts` の `ALLOWED_INVOKE_CHANNELS` への登録確認を IPC 変更チェックリストに含める                           |

**whitelist 確認コマンド**:

```bash
# shared/ipc/channels.ts の SKILL_CREATOR_EXTERNAL_API_CHANNELS と
# preload/channels.ts の ALLOWED_INVOKE_CHANNELS を照合する
grep -n "CONFIGURE_API\|SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED" \
  packages/shared/src/ipc/channels.ts \
  apps/desktop/src/preload/channels.ts

# R-04 自動検出（定数定義済みだが Main 未登録）
pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --strict
```

---

#### 2. whitelist の SSoT が preload と shared で二重管理になりやすい

| 項目       | 内容                                                                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | `ALLOWED_INVOKE_CHANNELS` の内容が `shared/ipc/channels.ts` の実体と乖離（stale 化）しても、TypeScript エラーにならない                                      |
| **原因**   | `ALLOWED_INVOKE_CHANNELS` は文字列リテラル配列として `preload/channels.ts` に直書きされており、`shared` 側の追加が自動で反映されない                          |
| **解決策** | `shared/ipc/channels.ts` を唯一の正本として扱い、`preload/channels.ts` には正本への reference comment と手動同期手順を明記する。将来的には `ALLOWED_INVOKE_CHANNELS` を shared からの import で自動生成する改善を formalize する（UT-TASK06-007-EXT 系 follow-up） |
| **教訓**   | whitelist は shared 正本から生成するか、少なくとも reference comment で正本を明示し、PR レビュー時に同期漏れを検出できる習慣を作る                            |

---

#### 3. Phase 4 テスト計画での it.todo() と未タスク区別が未定義

| 項目       | 内容                                                                                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | Phase 4 テスト計画で「今回実装するテスト」と「将来実装する予定のテスト（`it.todo()`）」の区別が明確でなく、テスト計画の完了判定が曖昧になった                    |
| **原因**   | `it.todo()` はテスト実装の先送りを示すが、未タスク（unassigned-task）として管理すべき内容との境界が定義されていなかった                                         |
| **解決策** | 今回は `it.todo()` をそのまま使用し、対応する未タスクを formalize することで管理した                                                                              |
| **教訓**   | Phase 4 テスト計画に「`it.todo()` は当スプリント内で実装する宿題を示す。スプリント外の将来実装は未タスクとして formalize する」セクションを追加する（FB-3 改善提案） |

---

### 標準ルール（再発防止）

1. `shared/ipc/channels.ts` で新規チャンネルを追加したら、`preload/channels.ts` の `ALLOWED_INVOKE_CHANNELS` への登録を必ず確認する。
2. `preload/channels.ts` の先頭に `// SSoT: packages/shared/src/ipc/channels.ts` の comment を維持する。
3. `check-ipc-contracts.ts --strict` で R-04（定数定義済みだが Preload 未登録）を定期検出する。
4. Phase 4 テスト計画に `it.todo()` と未タスクの使い分け基準を明記する（FB-3 改善提案）。

### 関連ドキュメント

| ドキュメント | 関連性 |
| --- | --- |
| [ipc-contract-checklist.md](./ipc-contract-checklist.md) | whitelist 登録確認手順 |
| [lessons-learned-skill-creator-ipc-handler-scope.md](./lessons-learned-skill-creator-ipc-handler-scope.md) | Session vs Runtime scope 分離教訓 |
| [architecture-implementation-patterns-reference-ipc-drift-detection.md](./architecture-implementation-patterns-reference-ipc-drift-detection.md) | check-ipc-contracts.ts 詳細 |
