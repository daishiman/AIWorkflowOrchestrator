# Phase 6: 拡張テスト記録

## 追加テストケース (11件)

### cancellation / timeout (3件)

- timeout stop_reason の result 正規化
- cancelled stop_reason の result 正規化
- 中断後のストリームで sessionId 保持

### permission denial variants (3件)

- 複数ツールの denial を個別に記録
- permission_denied=false で permissionDenials なし
- denied_tool/denied_reason 欠損時のデフォルト

### resumed session (3件)

- context 既存 sessionId の伝播
- 新しい init sessionId が既存を上書き
- init なしで既存 sessionId 使用

### その他 (2件)

- 未知 system subtype → error
- 100件の大量メッセージストリーム正規化

## テスト総数

- Phase 4: 21件
- Phase 6: 11件
- **合計: 32件** (全 Green)
