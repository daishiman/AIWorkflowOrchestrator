# Phase 6 成果物: 境界ケース一覧

> タスクID: TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001
> 作成日: 2026-03-23
> Phase: 6 - テスト拡充

## 1. 境界ケース分類

| 分類        | 定義                                             | 件数 |
| ----------- | ------------------------------------------------ | ---- |
| UNVERIFIED  | Phase 4-6 のテストで検証されていない境界         | 12件 |
| RISK-HIGH   | 発生頻度は低いが、発生時に governance が崩壊する | 5件  |
| RISK-MEDIUM | 発生頻度は中程度で、復旧手順が必要になる         | 7件  |
| RISK-LOW    | 発生頻度は高いが、影響が限定的                   | 5件  |

## 2. UNVERIFIED 境界ケース一覧

| BC ID | Lane  | 境界                                                                      | 未検証の理由                             | 対応 Phase     |
| ----- | ----- | ------------------------------------------------------------------------- | ---------------------------------------- | -------------- |
| BC-1  | L-1   | artifacts.json が JSON 構文エラーを含む場合                               | Phase 4 の contract テストは存在検証のみ | Phase 9        |
| BC-2  | L-1   | 同一タスクに type:design と type:implementation が混在する場合            | 現設計では単一 type のみ想定             | Phase 2 再確認 |
| BC-3  | L-2   | canonical source table に重複パスが存在する場合                           | 重複チェックは Phase 4-6 の範囲外        | Phase 9        |
| BC-4  | L-2   | legacy register に canonical path が存在しないパスが記録されている場合    | cross-ref 検証は存在確認のみ             | Phase 10       |
| BC-5  | L-2   | .claude/skills/ の容量が1GB を超える場合                                  | rsync の性能境界を定義していない         | Phase 11       |
| BC-6  | L-3   | generate-index.js の実行に60秒以上かかる場合                              | タイムアウト定義がない                   | Phase 9        |
| BC-7  | L-3   | rsync の --checksum がファイル変更を正しく検出しない場合                  | rsync の動作保証を検証していない         | Phase 11       |
| BC-8  | L-3   | Step E の LOGS.md 更新中にファイルロックが発生する場合                    | 同時編集による競合を検証していない       | Phase 9        |
| BC-9  | L-3   | documentation-changelog に同一 Step の記録が複数行ある場合                | 重複記録の検出ロジックがない             | Phase 9        |
| BC-10 | Cross | Wave 完了の判定タイミングが複数エージェント間で競合する場合               | 並列実行時の判定競合を検証していない     | Phase 11       |
| BC-11 | Cross | GitHub Issue 番号が削除済みで close できない場合                          | Issue の存在確認フローがない             | Phase 11       |
| BC-12 | Cross | unassigned-task/ 配下のファイルが指示書ではなく他用途のファイルを含む場合 | 指示書の識別方法が未定義                 | Phase 10       |

## 3. RISK-HIGH 境界ケース

governance が崩壊するリスクが高く、Phase 9-11 で優先的に対処する:

| BC ID | 境界                                      | 崩壊シナリオ                                                   | 予防策                                              |
| ----- | ----------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------- |
| BC-2  | type:design と type:implementation の混在 | 遷移条件の分岐が誤って適用され、coverage gate が無視される     | artifacts.json の type フィールドに enum 制約を追加 |
| BC-5  | .claude/skills/ の容量が1GB を超える      | rsync が長時間ブロックし、その間に他の変更が競合する           | rsync 前に `du -sh .claude/skills/` でサイズ確認    |
| BC-8  | LOGS.md 更新中のファイルロック            | P1/P25 防止のための2ファイル同時更新が部分成功で終わる         | ファイルロックの排他制御を実装（将来）              |
| BC-10 | wave 完了判定の並列競合                   | 複数エージェントが同時に wave 完了を宣言し、重複移管が発生する | wave 完了判定は単一エージェントが実行する           |
| BC-11 | GitHub Issue 番号が削除済み               | P56 対策の gh issue close が失敗し、Issue が OPEN のまま残る   | `gh issue view <number>` で存在確認してから close   |

## 4. RISK-MEDIUM 境界ケース

| BC ID | 境界                                          | 影響                                                 | 復旧手順                                           |
| ----- | --------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------- |
| BC-1  | artifacts.json が JSON 構文エラー             | gate executor が state 判定に失敗する                | `jq . artifacts.json` で構文確認後に手動修正       |
| BC-3  | canonical source table に重複パスが存在する   | source table の更新権限が不明確になる                | 重複行を検出して削除する（重複許容しない）         |
| BC-6  | generate-index.js が60秒以上かかる            | Step D がタイムアウトし、Index が古いまま残る        | タイムアウト60秒を設定し、失敗時は再実行ログを出す |
| BC-9  | documentation-changelog に重複記録            | 同一 Step の完了が複数回記録され、可視性が低下する   | changelog の事後記録ルールで重複を検出する         |
| BC-12 | unassigned-task/ に指示書以外のファイルが混在 | 未タスク件数カウントが不正確になる                   | `.md` ファイルのみをカウント対象にするルールを明示 |
| BC-4  | legacy register に存在しないパスが記録される  | cross-ref 検証が偽陽性を返す                         | 定期的な `ls` ベースの path 存在チェックで検出     |
| BC-7  | rsync の --checksum が誤検知する              | 変更なしのファイルが上書きされ、タイムスタンプが変化 | `diff -qr` で rsync 前後の差分を必ず確認する       |

## 5. RISK-LOW 境界ケース

| BC ID | 境界                                          | 影響                                  | 対処方針                                         |
| ----- | --------------------------------------------- | ------------------------------------- | ------------------------------------------------ |
| BC-13 | topic-map.md の再生成後に行数が大幅に減少する | Index の精度が低下する可能性          | 再生成後に行数差分を前回と比較する               |
| BC-14 | SKILL.md の変更履歴テーブルが100行を超える    | 行数増加による可読性の低下            | 古い履歴を archive ファイルへ移管する            |
| BC-15 | Step B の教訓が重複内容を含む                 | lessons-learned-current.md が膨張する | 追記前に既存エントリの類似検索を実施する         |
| BC-16 | backlog テーブルに0件登録の記録を省略する     | P3 違反として検出される               | 「0件」として明示的に記録する                    |
| BC-17 | gh issue close のコメントに日本語が含まれる   | API の文字エンコードで問題が発生する  | ASCII のみのコメントを使用するか、エスケープする |

## 6. 境界ケース対応マトリクス（Phase 別）

| Phase   | 対応 BC ID                   | 対応方針                                |
| ------- | ---------------------------- | --------------------------------------- |
| 9       | BC-1, BC-3, BC-6, BC-8, BC-9 | Quality Assurance で検証コマンドを追加  |
| 10      | BC-4, BC-12                  | Final Review で成果物構造を詳細確認     |
| 11      | BC-5, BC-7, BC-10, BC-11     | Manual Test で walkthrough を実施       |
| 2再確認 | BC-2                         | type フィールドの enum 制約を設計に追加 |
| 将来    | BC-8（ファイルロック対策）   | governance 自動化ツール実装時に対処     |
