# Phase 4: テストケース一覧 — skill:getFileTree IPC

| テストID | テスト名                                                   | 種別           | テスト対象       | 期待結果                                                 |
| -------- | ---------------------------------------------------------- | -------------- | ---------------- | -------------------------------------------------------- |
| FT-01    | 有効な skillName でファイルツリーを返却する                | 正常系         | IPCハンドラ      | `{ success: true, data: SkillFileTreeNode[] }`           |
| FT-02    | 空ディレクトリのスキルで空配列を返却する                   | 正常系         | IPCハンドラ      | `{ success: true, data: [] }`                            |
| FT-03    | ネストされたディレクトリ構造を正しくツリー化する           | 正常系         | SkillFileManager | 子ノードを持つ `SkillFileTreeNode[]`                     |
| FT-04    | バックアップファイルをツリーから除外する                   | 正常系         | SkillFileManager | `.backup.` / `.deleted.` 接尾辞ファイルが含まれない      |
| FT-05    | ファイルとディレクトリが名前順でソートされる               | 正常系         | SkillFileManager | ディレクトリ先頭、名前順ソート                           |
| FT-06    | 非文字列引数で VALIDATION_ERROR を返す                     | バリデーション | IPCハンドラ      | `{ success: false, error: "skillName must be..." }`      |
| FT-07    | 空文字列引数で VALIDATION_ERROR を返す                     | バリデーション | IPCハンドラ      | `{ success: false, error: "skillName must be..." }`      |
| FT-08    | スペースのみ引数で VALIDATION_ERROR を返す (P42)           | バリデーション | IPCハンドラ      | `{ success: false, error: "skillName must be..." }`      |
| FT-09    | undefined 引数で VALIDATION_ERROR を返す                   | バリデーション | IPCハンドラ      | `{ success: false, error: "skillName must be..." }`      |
| FT-10    | 不正な sender でセキュリティエラーを返す                   | セキュリティ   | IPCハンドラ      | validateIpcSender 失敗時の throw                         |
| FT-11    | 存在しないスキル名で SkillNotFoundError を返す             | エラー系       | IPCハンドラ      | `{ success: false, error: "Skill not found: ..." }`      |
| FT-12    | 未知のエラーで Internal error を返す                       | エラー系       | IPCハンドラ      | `{ success: false, error: "Internal error" }`            |
| FT-13    | スキルが見つからない場合 SkillNotFoundError をスローする   | エラー系       | SkillFileManager | `SkillNotFoundError` をスロー                            |
| FT-14    | Preload API が safeInvokeUnwrap で正しいチャネルを呼び出す | 結合           | Preload API      | IPC_CHANNELS.SKILL_GET_FILE_TREE に { skillName } を渡す |
