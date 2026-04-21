# [#2347] "[TASK-IPC-HANDLER-INVENTORY-AUTO-SYNC-001] TASK"

## メタ情報

```yaml
task_id: TASK-IPC-HANDLER-INVENTORY-AUTO-SYNC-001
task_name: TASK
category: -
target_feature: -
priority: LOW
scale: -
status: 未実施
source_phase: -
created_date: 2026-04-19
dependencies: []
spec_path: docs/30-workflows/unassigned-task/TASK-IPC-HANDLER-INVENTORY-AUTO-SYNC-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | LOW    |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001 で IPC handler の登録スナップショットテストを整備したが、
新規 handler が追加された際に inventory（handler 件数一覧）の同期は手動で行う必要がある。
handler 件数ドリフト（実際の handler 数とドキュメント記載数の不一致）を自動検出・同期する機構を導入する。

## 背景

TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001 完了時点での handler 構成:

- direct handler: 48 件
- auxiliary handler: 1 件
- 合計: 49 件

スナップショットテストによって登録チャンネルの変更は CI で検出できるようになったが、
以下の問題が残存している:

1. **件数ドリフト**: 新規 handler 追加時に Phase 1 の inventory テーブルや仕様書の handler 数が自動更新されない
2. **ドキュメントと実装の乖離**: handler 数をドキュメントに手書きしているため、追加・削除のたびに手動更新が必要
3. **Wave 分類の陳腐化**: Wave1/Wave2/Wave3 の分類が実装進捗に追随せず、「Wave3 対象 25 件」という記述が正確かどうかの検証が手動

## 推定作業内容

- [ ] `apps/desktop/src/main/ipc/` 配下の handler ファイルを自動スキャンして件数を出力するスクリプトを作成する
- [ ] スクリプト出力を `outputs/phase-1/ipc-handler-inventory.md` や仕様書と比較する CI チェックを追加する
- [ ] 新規 handler ファイルが追加された際にスナップショットテストも自動生成されるか、または生成漏れを検出するスクリプトを追加する
- [ ] handler 件数のドキュメント記述を「スクリプト生成値」として管理し、手動更新を不要にする
- [ ] Wave 分類（Wave1 / Wave2 / Wave3）の自動判定ロジックを設計する（例: スナップショットが存在するか否かで分類）

## 完了条件

- [ ] `scripts/count-ipc-handlers.js` 等のスクリプトが実装され、handler 件数を正確に出力する
- [ ] CI で handler 件数とスナップショットテストの存在をクロスチェックする仕組みが動作する
- [ ] ドキュメント内の handler 件数がスクリプト生成値として管理されている（手書きゼロ）
- [ ] 新規 handler 追加時のスナップショット漏れが CI で検出できる

## 苦戦箇所（TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001 より）

### ドキュメント整合性ドリフトの発見

- **困難だった理由**: Wave3 未着手宣言と実装範囲（handler 数・テスト数）の表現がフェーズごとに異なっていた。Phase 1 で「48 direct handler」と記載しても、途中で新規 handler が追加されると手動で全フェーズドキュメントを更新しなければならず、Phase 12 で全体統一修正が必要になった
- **採った解決策**: Phase 12 で全フェーズドキュメントを棚卸しして整合性を修正（一時的な対処）
- **将来への知見**: handler 件数のような「コードから導出できる値」はドキュメントに手書きしてはいけない。スクリプトで生成してドキュメントに埋め込む方式にすれば、コードとドキュメントのドリフトが根本的になくなる。この原則は IPC handler に限らず、型定義数・テストケース数・API エンドポイント数など「コードから数えられる値」すべてに適用できる

### Wave 分類の手動管理コスト

- **困難だった理由**: Wave1 / Wave2 / Wave3 の分類基準（どの handler がどの Wave に属するか）を手動で管理していたため、スナップショットテストの実装進捗と Wave 分類の記述がずれやすかった
- **採った解決策**: Wave3 を「スナップショットテストが未実装の handler 群」として定義し直し、実態に合わせて記述を修正した
- **将来への知見**: Wave 分類は「スナップショット有無」という機械的な判定基準で自動分類できる。`__snapshots__/` ディレクトリと handler ファイル一覧を突合するスクリプトがあれば、Wave 分類ドキュメントを自動生成できる

## 関連

- 親タスク: TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001
- 関連タスク: TASK-IPC-SNAPSHOT-WAVE3-001（本タスクのスクリプトを Wave3 実施前に整備すると効果的）
- 関連タスク: TASK-IPC-VITEST-SIGKILL-MITIGATION-001
- 関連ファイル:
  - `apps/desktop/src/main/ipc/` （handler ファイル群）
  - `apps/desktop/src/main/ipc/__tests__/__snapshots__/` （スナップショット）
  - `docs/30-workflows/TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001/phase-1-requirements.md` （inventory テーブル）
