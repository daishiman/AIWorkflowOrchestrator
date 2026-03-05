# Phase 1 受け入れ基準

## AC一覧

- AC-01
- `registerSkillHandlers` が `authKeyService?: IAuthKeyService` を受け取れる。
- 判定: 型定義と実装が存在し、コンパイル可能。

- AC-02
- `SkillExecutor` 生成時に第三引数として `authKeyService` が渡される。
- 判定: コード上で `new SkillExecutor(mainWindow, undefined, authKeyService)` が成立。

- AC-03
- `registerAllIpcHandlers` 内で `AuthKeyService` は1回のみ生成される。
- 判定: 同関数内に二重生成がない。

- AC-04
- `registerAllIpcHandlers` が `registerSkillHandlers(mainWindow, skillService, authKeyService)` を呼ぶ。
- 判定: ユニットテストで第三引数の受け渡しを検証。

- AC-05
- `registerAuthKeyHandlers(mainWindow, authKeyService)` と `registerSkillHandlers(..., authKeyService)` の引数インスタンスが同一。
- 判定: テストで `toBe` 比較が成立。

- AC-06
- `skill:execute` 成功/失敗レスポンス契約（`{ success, data | error, errorCode? }`）を壊さない。
- 判定: 既存 `skillHandlers.execute` 系テストが回帰しない。

- AC-07
- `AUTHENTICATION_ERROR` のエラーコード伝搬経路を壊さない。
- 判定: 既存契約テストまたは回帰テストで `errorCode` が維持される。

- AC-08
- AuthKeyService未注入の既存呼び出しは後方互換で動作する。
- 判定: 第三引数なしのテストが失敗しない。

- AC-09
- 変更は In Scope ファイルに限定し、不要な仕様変更をしない。
- 判定: 変更ファイルレビューで確認。

- AC-10
- Phase成果物（5件）が `outputs/phase-1/` に存在する。
- 判定: ファイル存在チェック。

## ゲート判定ルール

- Go: AC-01〜AC-10 を全件満たす。
- No-Go: AC-03/04/05 のいずれか未達（判定不一致を再発するため重大）。
