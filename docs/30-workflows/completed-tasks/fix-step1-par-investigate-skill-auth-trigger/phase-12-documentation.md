# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                        |
| ------ | ------------------------- |
| Phase  | 12                        |
| 機能名 | TASK-TRACE-SKILL-AUTH-001 |
| 作成日 | 2026-04-01                |

## 目的

このタスクの調査・修正内容をプロジェクトのドキュメントに反映する。
特に「スキル生成フローで auth:login を呼んでしまう」バグの根本原因と対策を lessons-learned として記録する。

## ドキュメント更新対象

### 1. implementation-guide（必須）

以下の内容を `outputs/phase-12/implementation-guide.md` に記録する:

| 項目            | 内容                                                               |
| --------------- | ------------------------------------------------------------------ |
| Part 1          | 中学生レベルの概念説明。日常の例えを使い、なぜ必要かを先に説明する |
| Part 2          | 開発者向けの技術詳細。型、API、エッジケース、設定値を含める        |
| 検証サマリー    | lint / test / manual-test の結果を要約する                         |
| screenshot 判定 | UI/UX 変更がないため `N/A` であることを明記する                    |

### 2. system-spec-update-summary（必須）

以下を `outputs/phase-12/system-spec-update-summary.md` に記録する:

| 項目      | 内容                                                               |
| --------- | ------------------------------------------------------------------ |
| 更新有無  | 今回の調査で system spec の更新が必要かどうかを明記する            |
| 根拠      | `auth:login` の不要経路が現行コードに存在しなかった理由を記録する  |
| 影響範囲  | agentSlice / authModeSlice / skill flow の仕様変更が不要であること |
| canonical | workflow root / lane index / artifacts の同期結果                  |

### 3. documentation-changelog（必須）

以下を `outputs/phase-12/documentation-changelog.md` に記録する:

| 項目         | 内容                                                   |
| ------------ | ------------------------------------------------------ |
| 作成済み文書 | Phase 1-12 の outputs 一覧                             |
| 更新ファイル | index / phase-4 / phase-12 / phase-13 / artifacts など |
| 仕様結論     | 現行コードに不要な `auth:login` 経路は存在しない       |

### 4. unassigned-task-detection（必須）

以下を `outputs/phase-12/unassigned-task-detection.md` に記録する:

| 項目     | 内容                                            |
| -------- | ----------------------------------------------- |
| current  | 新規未タスクの件数                              |
| baseline | 既知未タスクの件数                              |
| 方針     | 重大な追加課題がない場合は 0 件であることを明記 |

### 5. skill-feedback-report（必須）

以下を `outputs/phase-12/skill-feedback-report.md` に記録する:

| 項目         | 内容                                 |
| ------------ | ------------------------------------ |
| 学び         | 調査・修正・検証で得た再発防止の観点 |
| 次アクション | 今後の類似調査で気をつける点         |

### 6. phase12-task-spec-compliance-check（必須）

以下を `outputs/phase-12/phase12-task-spec-compliance-check.md` に記録する:

| 項目 | 内容                                                   |
| ---- | ------------------------------------------------------ |
| 判定 | task spec / outputs / artifacts の整合性が取れているか |
| 証跡 | 参照したファイルと確認結果                             |

### 7. lessons-learned（必須）

以下の内容を `lessons-learned.md` に記録する:

| 項目       | 内容                                                     |
| ---------- | -------------------------------------------------------- |
| バグの種類 | スキル生成フローからの意図しない auth:login IPC 呼び出し |
| 根本原因   | Phase 5 で特定された呼び出し経路（実行時に記入）         |
| 影響       | auth:login IPC タイムアウトによるスキル生成失敗          |
| 対策       | 実施した修正内容（実行時に記入）                         |
| 再発防止策 | 今後同様のパターンを防ぐためのガイドライン               |
| 発見方法   | console.trace() によるスタックトレース取得               |

### 8. 仕様書更新（条件付き）

Phase 5 で発見された呼び出し経路が以下に関係する場合は仕様書も更新する:

| 更新対象                  | 条件                               |
| ------------------------- | ---------------------------------- |
| agentSlice.ts の仕様書    | agentSlice が修正対象だった場合    |
| authModeSlice.ts の仕様書 | authModeSlice が修正対象だった場合 |
| スキル生成フロー仕様書    | フロー設計に変更が必要だった場合   |

### 9. 調査ノウハウの記録

今後の調査で役立てるための情報を記録する:

- IPC タイムアウト原因調査の手順テンプレート
- `console.trace()` を使った Redux thunk の追跡方法
- useEffect 連鎖による意図しない副作用の検出方法
- 親 lane から移設された workflow root の canonical path 修正手順
- 親 lane index の相対参照を同一 wave で更新する手順

## 中学生レベルの概念説明（Phase 12 必須）

このバグと修正の内容を、技術的な背景を知らない人でも理解できるように説明する:

### このバグは何だったか

スキルを作るボタンを押したとき、プログラムが「ログインしてください」という命令を出してしまっていた。
本当はその命令は、ログインボタンを押したときだけ出るべきものだったが、
どこかの設定が間違っていて、スキル作成のときにも出てしまっていた。

この「ログインしてください」という命令は一定時間内に応答がないと失敗するようになっている。
調査の結果、今のコードではスキル作成中にその命令は出ていないことも分かった。
そのため、この Phase では「本当に出ているのか」を確認する記録と、再発しないためのテストを残した。

### どうやって直したか

1. まず「ログインしてください」の命令が本当に出るかを、一時的な記録で確認した
2. 確認した結果、現行コードではスキル作成フローからその命令は出ていないと分かった
3. 調査用の記録を消し、代わりに回帰テストとドキュメントを整えて再発防止した

## 参照資料

| 資料名               | パス                     | 説明           |
| -------------------- | ------------------------ | -------------- |
| 修正サマリー         | `fix-summary.md`         | 修正内容の詳細 |
| スタックトレース証跡 | `stacktrace-evidence.md` | 調査で得た証跡 |
| 手動テスト結果       | `manual-test-result.md`  | 検証結果       |

## 成果物

| 成果物           | パス                                    | 説明                             |
| ---------------- | --------------------------------------- | -------------------------------- |
| ドキュメント更新 | `phase-12-documentation.md`             | 本ファイル                       |
| 実装ガイド       | `implementation-guide.md`               | Part 1 / Part 2 / 検証サマリー   |
| 仕様更新サマリー | `system-spec-update-summary.md`         | 更新要否と整合性の記録           |
| 変更履歴         | `documentation-changelog.md`            | 更新されたドキュメント一覧       |
| 未タスク検出     | `unassigned-task-detection.md`          | 追加未タスクの有無               |
| スキルFB         | `skill-feedback-report.md`              | 調査・改善の学び                 |
| 準拠チェック     | `phase12-task-spec-compliance-check.md` | bundle 準拠の確認                |
| 教訓記録         | `lessons-learned.md`                    | 根本原因・対策・再発防止策の記録 |

## 完了条件

- [ ] `lessons-learned.md` に根本原因・対策・再発防止策が記録されている
- [ ] `implementation-guide.md` に Part 1 / Part 2 / screenshot N/A が記録されている
- [ ] `system-spec-update-summary.md` に更新要否と整合性が記録されている
- [ ] `unassigned-task-detection.md` に未タスク件数が記録されている
- [ ] `skill-feedback-report.md` に学びと next action が記録されている
- [ ] `phase12-task-spec-compliance-check.md` に bundle 準拠判定が記録されている
- [ ] 中学生レベルの概念説明がこのファイルに記載されている
- [ ] 関連する仕様書が更新されている（更新が必要な場合）
- [ ] `documentation-changelog.md` に更新されたドキュメント一覧が記録されている
- [ ] 親 lane の canonical path 修正が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**
