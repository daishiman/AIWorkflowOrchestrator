# TASK-8B テストケース一覧

## 仕様定義テストケース（55件）

| No  | コンポーネント     | カテゴリ               | テスト名                       | 要件ID   |
| --- | ------------------ | ---------------------- | ------------------------------ | -------- |
| 1   | SkillSelector      | rendering              | スキル未選択時の表示           | SS-R-01  |
| 2   | SkillSelector      | rendering              | 選択中スキル名表示             | SS-R-02  |
| 3   | SkillSelector      | rendering              | スキャン中の状態表示           | SS-R-03  |
| 4   | SkillSelector      | dropdown interaction   | クリックで開く                 | SS-I-04  |
| 5   | SkillSelector      | dropdown interaction   | 外側クリックで閉じる           | SS-I-05  |
| 6   | SkillSelector      | dropdown interaction   | インポート済みセクション表示   | SS-I-06  |
| 7   | SkillSelector      | dropdown interaction   | 利用可能セクション表示         | SS-I-07  |
| 8   | SkillSelector      | skill selection        | スキル選択                     | SS-S-08  |
| 9   | SkillSelector      | skill selection        | スキル選択解除                 | SS-S-09  |
| 10  | SkillSelector      | keyboard navigation    | Escapeで閉じる                 | SS-K-10  |
| 11  | SkillSelector      | keyboard navigation    | 矢印キーナビゲーション         | SS-K-11  |
| 12  | SkillSelector      | rescan                 | 再スキャン実行                 | SS-R-12  |
| 13  | SkillSelector      | rescan                 | スキャン中はボタン無効         | SS-R-13  |
| 14  | SkillSelector      | accessibility          | ARIA属性                       | SS-A-14  |
| 15  | SkillSelector      | accessibility          | aria-expanded更新              | SS-A-15  |
| 16  | SkillImportDialog  | rendering              | isOpen=falseで非表示           | SID-R-01 |
| 17  | SkillImportDialog  | rendering              | スキル名・説明表示             | SID-R-02 |
| 18  | SkillImportDialog  | rendering              | 許可ツール表示                 | SID-R-03 |
| 19  | SkillImportDialog  | rendering              | agents一覧表示                 | SID-R-04 |
| 20  | SkillImportDialog  | rendering              | references一覧表示             | SID-R-05 |
| 21  | SkillImportDialog  | rendering              | 空セクション非表示             | SID-R-06 |
| 22  | SkillImportDialog  | import action          | インポート実行                 | SID-I-07 |
| 23  | SkillImportDialog  | import action          | ローディング状態               | SID-I-08 |
| 24  | SkillImportDialog  | import action          | 成功後ダイアログ閉じる         | SID-I-09 |
| 25  | SkillImportDialog  | close action           | キャンセルボタン               | SID-I-10 |
| 26  | SkillImportDialog  | close action           | 閉じるボタン                   | SID-I-11 |
| 27  | SkillImportDialog  | close action           | インポート中は無効             | SID-I-12 |
| 28  | PermissionDialog   | rendering              | pendingPermission nullで非表示 | PD-R-01  |
| 29  | PermissionDialog   | rendering              | ツール名表示                   | PD-R-02  |
| 30  | PermissionDialog   | rendering              | Bashコマンド引数表示           | PD-R-03  |
| 31  | PermissionDialog   | rendering              | ファイルパス引数表示           | PD-R-04  |
| 32  | PermissionDialog   | rendering              | JSON引数表示                   | PD-R-05  |
| 33  | PermissionDialog   | rendering              | 理由表示                       | PD-R-06  |
| 34  | PermissionDialog   | deny action            | 拒否ボタン                     | PD-I-07  |
| 35  | PermissionDialog   | deny action            | 閉じるボタン                   | PD-I-08  |
| 36  | PermissionDialog   | approve once action    | 1回許可                        | PD-I-09  |
| 37  | PermissionDialog   | approve action         | 許可（rememberなし）           | PD-I-10  |
| 38  | PermissionDialog   | approve action         | 許可（rememberあり）           | PD-I-11  |
| 39  | PermissionDialog   | remember checkbox      | チェックボックスリセット       | PD-I-12  |
| 40  | SkillStreamingView | rendering              | スキル名表示                   | SSV-R-01 |
| 41  | SkillStreamingView | rendering              | アシスタントメッセージ         | SSV-R-02 |
| 42  | SkillStreamingView | rendering              | パーシャルメッセージ           | SSV-R-03 |
| 43  | SkillStreamingView | rendering              | ツール使用通知                 | SSV-R-04 |
| 44  | SkillStreamingView | rendering              | ツール結果（成功）             | SSV-R-05 |
| 45  | SkillStreamingView | rendering              | ツール結果（失敗）             | SSV-R-06 |
| 46  | SkillStreamingView | rendering              | エラーメッセージ               | SSV-R-07 |
| 47  | SkillStreamingView | status badge           | running表示                    | SSV-S-08 |
| 48  | SkillStreamingView | status badge           | permission_pending表示         | SSV-S-09 |
| 49  | SkillStreamingView | status badge           | completed表示                  | SSV-S-10 |
| 50  | SkillStreamingView | status badge           | error表示                      | SSV-S-11 |
| 51  | SkillStreamingView | status badge           | idleでバッジなし               | SSV-S-12 |
| 52  | SkillStreamingView | abort button           | running時に表示                | SSV-I-13 |
| 53  | SkillStreamingView | abort button           | completed時に非表示            | SSV-I-14 |
| 54  | SkillStreamingView | abort button           | クリックで実行                 | SSV-I-15 |
| 55  | SkillStreamingView | tool execution history | ツール履歴表示/非表示          | SSV-R-16 |

## 追加テストケース（225件）

既存テストで仕様外の追加テストが225件実装済み:

- **SkillSelector**: +13件（エッジケース、連続操作、複数スキル表示等）
- **SkillImportDialog**: +44件（エッジケース、フォーカストラップ、ESCキー等）
- **PermissionDialog**: +58件+15件+23件（メタデータ統合、可読説明文、エッジケース等）
- **SkillStreamingView**: +22件（エッジケース、状態遷移、アクセシビリティ等）
- **permissionDescriptions**: +28件（全ツール説明生成テスト）
- **toolMetadata**: +32件（全ツールリスクレベル・セキュリティ影響テスト）
- **permissionHistory**: +22件（スナップショット、エントリ作成、定数テスト）
