# 未タスク検出レポート

## タスク: TASK-IMP-UISTATE-CONTRACT-EXTENSION-001

## 検出件数: 0 件

## 検出プロセス

1. `resolveCtaContract` overload 2 シグネチャ変更の影響調査
   - 本番コードで 2 引数形式を使用している箇所: 0 件（全てオブジェクト形式）
   - 影響なし

2. `resolveUiState` の `terminalSurface` → `terminal-only` 変更の影響調査
   - `apps/desktop/src/renderer/features/mainline-access/mainlineAccess.ts` で `resolveUiState` を呼んでいるが、オブジェクト形式で `uiState` を受け取り `resolveCtaContract` にそのまま渡している
   - 新しい `terminal-only` 値がそのまま伝播するため、CTA マッピングも正しく動作する
   - 影響なし（追加対応不要）

3. Guard 関数の呼び出し側調査
   - `assertStreamingCtaContract` と `assertHandoffGuidanceExists` は新規追加
   - 呼び出し側は今後の機能実装時に追加される
   - 現時点で未タスクなし

## 結論

未タスク 0 件。追加対応不要。
