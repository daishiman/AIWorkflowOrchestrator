# Phase 4 成果物: テストケース

## メタ情報

| 項目       | 内容         |
| ---------- | ------------ |
| タスクID   | TASK-9B      |
| Phase      | 4            |
| 成果物     | テストケース |
| 作成日     | 2026-02-26   |
| ステータス | 完了         |

## A. SkillCreatorService ユニットテスト（SC-020〜SC-031）

| テストID | テスト名                                                | 入力                                                | 期待結果                                     |
| -------- | ------------------------------------------------------- | --------------------------------------------------- | -------------------------------------------- |
| SC-020   | createSkill: updateモードで正常にスキルを更新する       | mode="update", skillPath="/path"                    | updateワークフロー起動、成功レスポンス       |
| SC-021   | createSkill: improve-promptモードで正常に最適化する     | mode="improve-prompt", skillName="test"             | prompt最適化ワークフロー起動、成功レスポンス |
| SC-022   | improveSkill: 既存スキルを分析して改善提案を返す        | skillName="existing-skill", autoApply=false         | ImprovementSuggestion[]が返される            |
| SC-023   | improveSkill: 存在しないスキルでエラーを返す            | skillName="non-existent"                            | Errorがスローされる                          |
| SC-024   | forkSkill: スキルを複製して新しいディレクトリに生成する | source="original", newName="forked"                 | 新ディレクトリパスが返される                 |
| SC-025   | forkSkill: 同名スキルが存在する場合にエラーを返す       | source="original", newName="existing"               | Errorがスローされる                          |
| SC-026   | shareSkill: スキルを共有可能な形式でエクスポートする    | action="export", target="gist"                      | URL文字列が返される                          |
| SC-027   | scheduleSkill: スケジュール設定を保存する               | skillName="test", type="cron", value="0 9 \* \* \*" | void（保存成功）                             |
| SC-028   | debugSkill: デバッグモードで詳細ログを出力する          | skillName="test"                                    | DebugResult（ステップ情報含む）が返される    |
| SC-029   | generateDocs: SKILL.mdとREADME.mdを生成する             | skillName="test", format="markdown"                 | outputPath文字列が返される                   |
| SC-030   | getStats: 使用統計を正確に集計する                      | skillName="test", period="7d"                       | SkillUsageStats（集計値含む）が返される      |
| SC-031   | executeTasks: 並列実行モードで独立タスクを同時実行する  | parallel=true, タスク3件（うち2件独立）             | 独立タスクが同時実行される                   |

## B. HearingFacilitator テスト（HF-001〜HF-006）

| テストID | テスト名                                          | 入力                        | 期待結果                                 |
| -------- | ------------------------------------------------- | --------------------------- | ---------------------------------------- |
| HF-001   | 初期質問を生成する                                | 初回呼び出し                | 質問文字列が返される                     |
| HF-002   | ユーザー回答から次の質問を導出する                | 前回回答="タスク管理ツール" | 次の質問が回答に基づいて生成される       |
| HF-003   | 全質問完了後にインタビュー結果を集約する          | 全回答セット                | InterviewResult型オブジェクトが返される  |
| HF-004   | 空文字列の回答でバリデーションエラーを返す        | answer=""                   | エラーメッセージが返される               |
| HF-005   | purpose/featuresが抽出されたInterviewResultを返す | 質問完了状態                | purpose, features, constraintsが含まれる |
| HF-006   | 最大質問数（10問）に達した場合に強制終了する      | 10問到達                    | 自動的にインタビューが終了する           |

## C. TaskGenerator テスト（TG-001〜TG-007）

| テストID | テスト名                               | 入力                           | 期待結果                               |
| -------- | -------------------------------------- | ------------------------------ | -------------------------------------- |
| TG-001   | 要件からタスクリストを生成する         | InterviewResult（機能3件）     | TaskSpec[]（3件以上）が返される        |
| TG-002   | タスク間の依存関係を解決する           | depends_on設定あり             | 依存関係が正しく設定される             |
| TG-003   | 循環依存を検出してエラーを返す         | A→B→C→Aの循環                  | CyclicDependencyErrorがスローされる    |
| TG-004   | トポロジカルソートで実行順序を決定する | 依存関係あり5タスク            | Kahn's algorithmで正しい順序が返される |
| TG-005   | 独立タスクを並列実行グループに分類する | 依存関係なし3タスク            | 同一グループに分類される               |
| TG-006   | 空の要件リストで空のタスクリストを返す | InterviewResult（features=[]） | 空配列が返される                       |
| TG-007   | 依存先が存在しないタスクでエラーを返す | depends_on=["non-existent"]    | InvalidDependencyErrorがスローされる   |

## D. CodeGenerator テスト（CG-001〜CG-005）

| テストID | テスト名                                             | 入力                               | 期待結果                             |
| -------- | ---------------------------------------------------- | ---------------------------------- | ------------------------------------ |
| CG-001   | テンプレートからスキルコードを生成する               | テンプレート+変数マップ            | 変数が置換されたコードが返される     |
| CG-002   | Claude Agent SDK query()を呼び出してコードを生成する | プロンプト文字列                   | query()が正しい引数で呼び出される    |
| CG-003   | 生成コードの型チェックを実行する                     | TypeScript文字列                   | 型エラーリストが返される             |
| CG-004   | 空のテンプレートでエラーを返す                       | template=""                        | Errorがスローされる                  |
| CG-005   | 複数ファイル構成のスキルを生成する                   | SkillSpec（agents/references含む） | SKILL.md, agents/, references/が生成 |

## E. Validator テスト（VL-001〜VL-007）

| テストID | テスト名                                   | 入力                     | 期待結果        |
| -------- | ------------------------------------------ | ------------------------ | --------------- |
| VL-001   | 有効なスキルディレクトリで検証成功を返す   | SKILL.md存在するパス     | trueが返される  |
| VL-002   | SKILL.md欠落で検証失敗を返す               | SKILL.md未存在パス       | falseが返される |
| VL-003   | パストラバーサルパスを拒否する             | "../../../etc"           | falseが返される |
| VL-004   | NULLバイトを含むパスを拒否する             | "test\0evil"             | falseが返される |
| VL-005   | コマンドインジェクションパターンを検出する | "$(rm -rf /)"            | falseが返される |
| VL-006   | スキーマ検証で有効なデータを受け付ける     | 正しいスキーマ準拠データ | trueが返される  |
| VL-007   | スキーマ検証で無効なデータを拒否する       | スキーマ不適合データ     | falseが返される |

## F. IPCバリデーションテスト（IPC-001〜IPC-012）

| テストID | テスト名                                              | 入力                               | 期待結果                   |
| -------- | ----------------------------------------------------- | ---------------------------------- | -------------------------- |
| IPC-001  | skill-creator:detect-mode: 空文字列でエラーを返す     | request=""                         | success=false              |
| IPC-002  | skill-creator:detect-mode: スペースのみでエラーを返す | request=" "                        | success=false（P42対策）   |
| IPC-003  | skill-creator:create: name/description/mode全必須     | description欠落                    | success=false              |
| IPC-004  | skill-creator:create: パストラバーサルパスを拒否      | tasksDir="../etc/passwd"           | success=false              |
| IPC-005  | skill-creator:execute-tasks: 空tasksDirを拒否         | tasksDir=""                        | success=false              |
| IPC-006  | skill-creator:execute-tasks: UNCパスを拒否            | tasksDir="\\\\server\\share"       | success=false              |
| IPC-007  | skill-creator:validate: skillDirが必須                | skillDir未指定                     | success=false              |
| IPC-008  | skill-creator:validate-schema: ホワイトリスト外を拒否 | schemaName="evil-schema"           | success=false              |
| IPC-009  | skill-creator:validate-schema: 許可スキーマ通過       | schemaName="task-spec"             | 正常に検証実行             |
| IPC-010  | 全チャンネル: sender検証で不正ウィンドウを拒否        | webContents.id=999                 | IPC_VALIDATION_ERRORスロー |
| IPC-011  | 全チャンネル: sanitizeErrorMessageでパスを除去        | "/Users/dm/.secrets/key"含むエラー | [path]に置換される         |
| IPC-012  | 全チャンネル: sanitizeErrorMessageでトークンを除去    | "token=abc123def"含むエラー        | "token=\*\*\*"に置換される |

## G. 統合テスト（INT-001〜INT-005）

| テストID | テスト名                                              | シナリオ概要                                        | 期待結果                        |
| -------- | ----------------------------------------------------- | --------------------------------------------------- | ------------------------------- |
| INT-001  | スキル生成フロー: 要件入力からスキル構造が生成される  | createSkill() → validateSkill()の一連フロー         | 全ステップ成功                  |
| INT-002  | タスク実行フロー: 仕様書解析から実行完了まで          | executeTasks()で全タスクが順序通り実行              | 全タスクcompleted               |
| INT-003  | エラーリカバリ: タスク実行失敗時に中断して報告する    | 途中失敗時のsummary                                 | failed>0, 残タスクskipped       |
| INT-004  | ドライラン: 実行せずに実行計画を返す                  | dryRun=true                                         | mode="dry-run", estimatedTime付 |
| INT-005  | IPC→Service連携: Rendererリクエストが正しく処理される | IPCハンドラ → SkillCreatorServiceの呼び出しチェーン | 正常レスポンス返却              |

## H. 境界値テスト（BV-001〜BV-008）

| テストID | テスト名                                     | 入力                   | 期待結果                    |
| -------- | -------------------------------------------- | ---------------------- | --------------------------- |
| BV-001   | 空文字列のスキル名でバリデーションエラー     | name=""                | Errorスロー                 |
| BV-002   | スペースのみのスキル名でバリデーションエラー | name=" "               | Errorスロー（P42準拠）      |
| BV-003   | 256文字超のスキル名でバリデーションエラー    | name="a".repeat(257)   | Errorスロー                 |
| BV-004   | パストラバーサルを含むディレクトリパスで拒否 | "../../../etc"         | Errorスロー                 |
| BV-005   | NULLバイトを含む文字列で拒否                 | "test\0evil"           | Errorスロー                 |
| BV-006   | 空の依存関係リストで正常動作                 | depends_on=[]          | 正常にソート完了            |
| BV-007   | 1000個のタスクでトポロジカルソートが完了する | 1000タスクの依存グラフ | タイムアウトせず完了        |
| BV-008   | 自己参照の循環依存を検出する                 | A→Aの自己参照          | CyclicDependencyErrorスロー |
