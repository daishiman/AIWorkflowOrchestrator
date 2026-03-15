# Phase 6 回帰ガード一覧

## メタ情報

| 項目     | 値                         |
| -------- | -------------------------- |
| タスクID | TASK-SKILL-LIFECYCLE-05    |
| タスク名 | 作成済みスキルを使う主導線 |
| Phase    | 6                          |
| 作成日   | 2026-03-15                 |

---

## 回帰防止必須テスト

| #   | 回帰リスク                        | 防止テスト                        | テストケースID             | 優先度   |
| --- | --------------------------------- | --------------------------------- | -------------------------- | -------- |
| 1   | ScoringGate 境界でCTA制御が崩れる | 6境界点全てでCTA検証              | TC-GATE-BORDER-01〜06      | HIGH     |
| 2   | P48 useShallow 削除で無限ループ   | useShallow 適用確認               | TC-STATE-02                | CRITICAL |
| 3   | EP-3/EP-4 呼び分け混同            | コンテキスト分離確認              | TC-IPC-01, TC-IPC-02       | HIGH     |
| 4   | skillName/skillId 命名ドリフト    | P44/P45 セマンティクス確認        | TC-IPC-04                  | HIGH     |
| 5   | Set型 persist 破損                | customStorage ラウンドトリップ    | TC-STATE-04                | MEDIUM   |
| 6   | お気に入り IPC 誤追加             | IPC 不要確認                      | TC-IPC-03                  | MEDIUM   |
| 7   | 空状態プレースホルダー未表示      | 0件表示テスト                     | TC-REUSE-01〜03            | MEDIUM   |
| 8   | EP-3 タイムアウト時のUI凍結       | タイムアウト後の利用続行          | TC-FAIL-01, TC-RECOVERY-01 | HIGH     |
| 9   | PostExecutionActionBar 非表示     | EP-4 失敗後のActionBar確認        | TC-FAIL-02                 | HIGH     |
| 10  | 品質表示7地点の欠落               | 7地点全てでコンポーネント配置確認 | TC-TRACE-05                | HIGH     |

---

## Pitfall 関連回帰ガード

| Pitfall | 回帰リスク                 | 防止策                       |
| ------- | -------------------------- | ---------------------------- |
| P31     | 合成Hook使用で無限ループ   | 個別セレクタのみ使用         |
| P42     | trim バリデーション漏れ    | 3段バリデーション設計        |
| P44     | IPC インターフェース不整合 | ハンドラ↔Preload 型一致      |
| P45     | 引数命名ドリフト           | skillName セマンティクス統一 |
| P46     | HTMLAttributes 型衝突      | Omit パターン適用            |
| P47     | CSS変数テストアサーション  | Record定数 export            |
| P48     | 派生セレクタ無限ループ     | useShallow 適用              |
