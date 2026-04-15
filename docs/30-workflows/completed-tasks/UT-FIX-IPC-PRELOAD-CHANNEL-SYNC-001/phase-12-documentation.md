# Phase 12: ドキュメント更新 — task-specification-creator準拠の最小成果物

## メタ情報

| 項目       | 値                                  |
| ---------- | ----------------------------------- |
| Phase      | 12                                  |
| タスクID   | UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001 |
| 前提Phase  | Phase 11（手動テスト N/A確認）      |
| 後続Phase  | Phase 13（PR作成）                  |
| ステータス | completed                           |

---

## 目的

preload ホワイトリスト同期タスクの Phase 12 出力物を、task-specification-creator の要件に合わせて 1 セットにまとめる。

## 実行タスク

- `implementation-guide.md` を Part 1 / Part 2 の 2 パート構成にする
- `system-spec-update-summary.md` と `documentation-changelog.md` を実装結果に合わせる
- `unassigned-task-detection.md` と `skill-feedback-report.md` を current fact として記録する
- `phase12-task-spec-compliance-check.md` で 5 件の成果物整合を確認する

## 参照資料

| 参照資料          | パス                                                                                                                                                                                                   | 内容                            |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------- |
| shared 正本       | `packages/shared/src/ipc/channels.ts`                                                                                                                                                                  | チャネル定義の正本              |
| preload           | `apps/desktop/src/preload/channels.ts`                                                                                                                                                                 | ホワイトリストの実装            |
| verify スクリプト | `scripts/verify-ipc-4layer.cjs`                                                                                                                                                                        | Rule-1 / Rule-2 / Rule-3 の確認 |
| skill ガイド      | `.agents/skills/task-specification-creator/references/phase-12-guide.md`                                                                                                                               | Phase 12 の要件                 |
| 依存Phase         | `phase-2-design.md` / `phase-5-implementation.md` / `phase-6-test-expansion.md` / `phase-7-coverage-check.md` / `phase-8-refactoring.md` / `phase-9-quality-assurance.md` / `phase-10-final-review.md` | Phase 12 が依存する前工程       |
| root evidence     | `unassigned-task-detection.md` / `phase12-task-spec-compliance-check.md`                                                                                                                               | Phase 12 の検証根拠             |

## 成果物

| 成果物           | パス                                                     | 内容                 |
| ---------------- | -------------------------------------------------------- | -------------------- |
| 実装ガイド       | `outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2 構成 |
| 仕様同期サマリー | `outputs/phase-12/system-spec-update-summary.md`         | Rule-1 PASS の記録   |
| 変更履歴         | `outputs/phase-12/documentation-changelog.md`            | 実装済み履歴         |
| 未割り当て検出   | `outputs/phase-12/unassigned-task-detection.md`          | 0件報告              |
| フィードバック   | `outputs/phase-12/skill-feedback-report.md`              | 改善知見             |
| 準拠チェック     | `outputs/phase-12/phase12-task-spec-compliance-check.md` | root evidence        |

---

## 1. Phase 12 必須成果物

task-specification-creator の Phase 12 要件に合わせ、以下の成果物を最小構成で用意する。

### 1-1. `implementation-guide.md`

- 対象: `apps/desktop/src/preload/channels.ts`
- 内容: `CHAT_EXPORT_CHANNELS` / `FILE_SYSTEM_CHANNELS` の import 追加、`IPC_CHANNELS` へのスプレッド展開、`ALLOWED_INVOKE_CHANNELS` 6件、`ALLOWED_ON_CHANNELS` 6件
- 補足: `CONFIGURE_API` は既登録のため追加対象外と明記する

### 1-2. `system-spec-update-summary.md`

- 内容: shared と preload の同期ルール、今回の 6+6 追加、`CONFIGURE_API` 除外の理由
- 補足: `verify-ipc-4layer.cjs` の Rule-1 と整合することを短く記録する

### 1-3. `documentation-changelog.md`

- 内容: どの Phase で何を直したかを箇条書きで記録する
- 補足: 数え上げのズレと曖昧表現を削除し、`6件` に統一したことを書く

### 1-4. `unassigned-task-detection.md`

- 内容: 本 TASK-1 で未割り当ての作業が残っていないこと、`CONFIGURE_API` は既登録で除外済みであることを記録する
- 補足: 追加対象 12 件がすべてこのタスクで閉じていることを明記する

### 1-5. `skill-feedback-report.md`

- 内容: task-specification-creator 観点でのフィードバック
- 補足: 「既登録チャネルは missing に数えない」「数え上げは 6+6 で固定」が今回の学びであると明記する

### 1-6. 準拠チェック

- 内容: 上記 5 成果物が Phase 12 の必須要件を満たしているかを最終確認する
- 判定: `implementation-guide.md` / `system-spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` がすべて揃っていれば PASS

---

## 2. lessons-learned への知見追記

`docs/` 配下の lessons-learned ドキュメントに以下の知見を追記する。

### 追記内容

**タイトル**: preloadホワイトリストとsharedチャネル定義の同期漏れパターン

**内容**:

```markdown
## preloadホワイトリストとsharedチャネル定義の同期漏れ（2026-04-15）

### 発生状況

`packages/shared/src/ipc/channels.ts` に新チャネルグループ（CHAT_EXPORT_CHANNELS・
FILE_SYSTEM_CHANNELS・SKILL_CREATOR_SESSION_CHANNELS等）が追加された際、
`apps/desktop/src/preload/channels.ts` のホワイトリストへの追記が漏れた。

### 根本原因

- sharedチャネル定義とpreloadホワイトリストが別ファイルで管理されており、
  追加時に両方を更新するルールが徹底されていなかった
- `verify-ipc-4layer.cjs` のRule-1チェックが `continue-on-error: true` で
  抑制されていたため、CI上で早期発見できなかった

### 対策

1. sharedにチャネルグループを追加した際は必ずpreload/channels.tsも同時に更新する
2. CI の `continue-on-error: true` を解除し、Rule-1違反を即時検知できる状態に戻す
3. preloadのimportブロックに新グループを追加する際は、
   IPC_CHANNELSへのスプレッド展開とホワイトリスト追加の両方を忘れずに行う

### 関連タスク

- UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001（本タスク）
- UT-FIX-IPC-MAIN-HANDLER-IMPL-001（Rule-2修正）
```

---

## 3. IPC仕様ドキュメント更新

`docs/` 配下のIPC仕様書（存在する場合）に以下を更新する。

### 確認コマンド

```bash
find docs/ -name "*.md" | xargs grep -l "IPC\|preload\|channels" 2>/dev/null | head -10
```

### 更新内容（該当ドキュメントが存在する場合）

- `CHAT_EXPORT_CHANNELS` グループのチャネル一覧にpreloadホワイトリスト登録済みマークを追加
- `FILE_SYSTEM_CHANNELS` グループのチャネル一覧にpreloadホワイトリスト登録済みマークを追加
- `SKILL_CREATOR_SESSION_CHANNELS` グループのチャネル一覧にpreloadホワイトリスト登録済みマークを追加
- `SKILL_CREATOR_EXTERNAL_API_CHANNELS` グループのチャネル一覧にpreloadホワイトリスト登録済みマークを追加

---

## 4. artifacts.json のステータス更新

Phase完了後に `artifacts.json` と `outputs/artifacts.json` を同一内容に揃える。  
この workflow では root / outputs の parity を current facts として維持済み。

```bash
# 完了後の確認
cat docs/30-workflows/UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001/artifacts.json
```

## 完了条件

- [x] `outputs/phase-12/` に必須 5 成果物が存在する
- [x] `artifacts.json` と `outputs/artifacts.json` が同一内容である
- [x] `phase-12-documentation.md` の参照パスが current workflow を指している
