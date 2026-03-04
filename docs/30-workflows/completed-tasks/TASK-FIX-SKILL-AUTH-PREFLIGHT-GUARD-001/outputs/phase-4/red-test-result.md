# Phase 4 Red テスト結果

## Red 記録方式

本ワークツリーでは実装が先に反映済みのため、Red は以下で再構成した。

1. テスト定義上の新規失敗条件（`errorCode` 欠落 / preflight 未実装）を抽出。
2. 実装差分（Main/Preload/Renderer）と照合して、未実装時に失敗する根拠を確認。
3. Phase 5 で Green 化済みであることを明示。

## Red 想定失敗一覧

| ID       | 想定失敗                              | 失敗理由（実装前）                            |
| -------- | ------------------------------------- | --------------------------------------------- |
| P4-TC-01 | `errorCode` が取得できない            | `skill:execute` 失敗応答が `error` 文字列のみ |
| P4-TC-02 | `auth-key:exists` が false 固定になる | env fallback 未考慮                           |
| P4-TC-03 | `Error.code` が未設定                 | Preload unwrap で `errorCode` 転写なし        |
| P4-TC-04 | Hook が execute を呼び続ける          | preflight ガード未実装                        |
| P4-TC-05 | AgentView で設定誘導が出ない          | preflight + 文言統一未実装                    |
| P4-TC-06 | store 経由実行で認証エラーが遅延検知  | executeSkill 直呼びのみ                       |

## 判定

- Red 設計: 完了
- Green への引き継ぎ: `errorCode` 伝搬 + preflight 共通化 + env fallback
