# スキルフィードバックレポート

## メタ情報

| 項目   | 内容                  |
| ------ | --------------------- |
| Phase  | 12                    |
| タスク | UT-IPC-HANDLER-CI-001 |

## task-specification-creator へのフィードバック

### 良かった点

- Phase 1 の P50 チェックが「既存実装あり → 差分確認を主作業に」という判断を適切にガイドした
- Phase 3 のゲート判定（PASS/MAJOR/MINOR）が明確で迷わない
- Phase 11 で NON_VISUAL 判定フローが明記されており、スクリーンショット不要の根拠記録が容易

### 改善が必要な点

- Phase 5 の「実行タスク」に `--updateSnapshot` の初回生成と、既存スナップショットとの比較確認が別ステップとして明示されるとよい

### 新規 Pitfall 候補

- Electron mock capture パターンでは、`vi.mock("electron")` で定義した関数に `mockImplementation` を与える方が安定する。`vi.spyOn` を直接 `ipcMain` に適用する前提はずらした方が安全。

### 今後のスキル改善提案

- スナップショットテスト専用のフェーズテンプレートを用意し、`--updateSnapshot` の取り扱い方針を初期から明文化する

## aiworkflow-requirements へのフィードバック

### 良かった点

- `api-ipc-system.md` の IPC チャンネル仕様が creatorHandlers.ts の実装と一致しており、要件確認がスムーズだった

### 改善が必要な点

- 索引差分が branch 上に混在する場合、Step 1-D を `未更新 / 再生成のみ / 内容変更あり` に分けるテンプレート補助が欲しい

### 新規 Pitfall 候補

- なし

### 今後のスキル改善提案

- NON_VISUAL task でも branch ルートに同名 `outputs/phase-*` が存在しうるため、証跡参照を task 固有パスで出力するテンプレートを追加したい
