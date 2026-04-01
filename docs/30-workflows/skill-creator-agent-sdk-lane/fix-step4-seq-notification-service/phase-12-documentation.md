# Phase 12: ドキュメント更新

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 12                            |
| タスクID | TASK-NOTIFICATION-SERVICE-001 |
| 作成日   | 2026-04-01                    |

---

## 目的

`INotificationService` DI パターンの設計を将来の開発者が理解できるように記録し、
未対応事項（Windows/Linux 通知など）を次タスクとして正式に記録する。
Phase 12 必須の「中学生レベルの概念説明」を含む実装ガイドを作成する。

---

## 実行タスク

### タスク 12-1: `implementation-guide.md` の作成

**作成先:** `outputs/phase-12/implementation-guide.md`

#### Part 1: 中学生レベルの概念説明（Phase 12 必須）

**「通知サービス」とは何か、なぜこの設計にしたか**

通知サービスは「スキル作成が終わったら教えてくれるお知らせ係」です。

スキルを作るのには時間がかかります（10〜30 分）。その間、他の作業をしていると「終わったのかな？」と気になって何度も確認しに行く必要があります。これは面倒です。

そこで、スキル作成が終わったときに自動でパソコンの画面の隅に「完了したよ！」という通知が出るようにしました。これは、スマートフォンでメッセージが届いたときにポップアップが出るのと同じ仕組みです。

**なぜ「インターフェース」を作ったか**

プログラムでは、「何をするか」の約束（インターフェース）と「どうやってするか」の実装を別々にすると、テストがしやすくなります。

例えば:

- 本番: Electron（アプリ）の通知機能を使って実際に通知を出す
- テスト時: 「通知を出した」という記録をリストに追加するだけの偽の実装を使う

テスト時に本物の通知を出してしまうと、テスト中に画面にポップアップが出て邪魔になります。
偽の実装（`MockNotificationService`）を使えば、テストが通知の挙動を確認しながらも実際の通知は出しません。

これが「依存性の注入（DI）」という設計パターンです。「インターフェース」という約束を守っていれば、本物でも偽物でも使えます。

#### Part 2: `INotificationService` 設計詳細

`INotificationService` の設計判断を記録する:

| 判断項目                              | 決定内容                                        | 理由                                        |
| ------------------------------------- | ----------------------------------------------- | ------------------------------------------- |
| インターフェースの配置                | `services/notification/INotificationService.ts` | Main Process 内閉鎖、循環参照回避           |
| メソッドの戻り値型                    | `void`                                          | 通知の成功/失敗がスキル生成結果に影響しない |
| `MockNotificationService` の配置      | テストファイル内のみ                            | 本番コードへのテスト実装の混入を防ぐ        |
| `Notification.isSupported()` チェック | `notify()` の先頭                               | macOS 以外での実行時の安全なフォールバック  |

### タスク 12-2: `system-spec-update-summary.md` の作成

**作成先:** `outputs/phase-12/system-spec-update-summary.md`

以下を記録する:

- 変更された仕様の要約（新規 interface・class・メソッド一覧）
- `RuntimeSkillCreatorFacadeDeps` の変更内容
- `before-quit` ガードの追加内容
- aiworkflow-requirements の更新が必要かどうかの判断

### タスク 12-3: `documentation-changelog.md` の作成

**作成先:** `outputs/phase-12/documentation-changelog.md`

以下を記録する:

- 新規作成したドキュメント一覧
- 更新したドキュメント一覧（あれば）
- 更新日と変更概要

### タスク 12-4: `unassigned-task-detection.md` の作成（未対応事項の記録）

**作成先:** `outputs/phase-12/unassigned-task-detection.md`

本タスクのスコープ外として意図的に対象外とした事項を、次タスクとして正式に記録する:

| 未対応事項                                                               | 優先度 | タスク候補名                       |
| ------------------------------------------------------------------------ | ------ | ---------------------------------- |
| Windows/Linux 通知対応（`Notification.isSupported()` が false の環境）   | 低     | `feat-notification-cross-platform` |
| 通知設定 UI（ユーザーが通知のオン/オフを設定できる機能）                 | 低     | `feat-notification-settings-ui`    |
| 通知の重複防止（短時間に複数スキル生成を実行した場合のポップアップ管理） | 低     | `feat-notification-deduplication`  |
| `notify()` 失敗時のモニタリング（ログ収集・アラート）                    | 低     | `ops-notification-monitoring`      |

### タスク 12-5: `skill-feedback-report.md` の作成

**作成先:** `outputs/phase-12/skill-feedback-report.md`

以下を記録する:

- タスク実行で学んだこと（`INotificationService` DI パターンの有効性など）
- Phase フローの改善提案（あれば）
- `task-specification-creator` スキルへのフィードバック

---

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                                        | 内容                      |
| -------------------------- | ------------------------------------------------------------------------------------------- | ------------------------- |
| セキュリティ仕様           | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | Electron IPC セキュリティ |
| アーキテクチャ実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | DI パターン               |

### 確認対象

| ファイル       | パス                                     |
| -------------- | ---------------------------------------- |
| 品質レポート   | `outputs/phase-9/quality-report.md`      |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` |

---

## 実行手順

### ステップ 1: `implementation-guide.md` の作成

タスク 12-1 の内容を `outputs/phase-12/implementation-guide.md` に記録する。
「中学生レベルの概念説明」を Part 1 に必ず含めること。

### ステップ 2: `system-spec-update-summary.md` の作成

タスク 12-2 の内容を `outputs/phase-12/system-spec-update-summary.md` に記録する。

### ステップ 3: `documentation-changelog.md` の作成

タスク 12-3 の内容を `outputs/phase-12/documentation-changelog.md` に記録する。

### ステップ 4: `unassigned-task-detection.md` の作成

タスク 12-4 の内容を `outputs/phase-12/unassigned-task-detection.md` に記録する。

### ステップ 5: `skill-feedback-report.md` の作成

タスク 12-5 の内容を `outputs/phase-12/skill-feedback-report.md` に記録する。

---

## 多角的チェック観点

| 観点                     | 確認内容                                                              |
| ------------------------ | --------------------------------------------------------------------- |
| 中学生レベル説明の品質   | 技術知識のない読者が通知サービスの目的と DI パターンを理解できること  |
| 未対応事項の完全性       | スコープ外として意図的に除外した全事項が記録されていること            |
| 将来の開発者への引き継ぎ | `INotificationService` に新しい実装を追加する方法が明記されていること |

---

## 成果物

| 成果物               | パス                                             | 説明                        |
| -------------------- | ------------------------------------------------ | --------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`       | 中学生レベル説明 + 設計詳細 |
| 仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md` | 変更された仕様の要約        |
| ドキュメント変更履歴 | `outputs/phase-12/documentation-changelog.md`    | 更新ドキュメント一覧        |
| 未対応タスク一覧     | `outputs/phase-12/unassigned-task-detection.md`  | 次タスク候補の記録          |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`      | タスク実行の教訓            |

---

## 完了条件

- [ ] `outputs/phase-12/implementation-guide.md` が作成された（中学生レベル説明を含む）
- [ ] `outputs/phase-12/system-spec-update-summary.md` が作成された
- [ ] `outputs/phase-12/documentation-changelog.md` が作成された
- [ ] `outputs/phase-12/unassigned-task-detection.md` が作成された（Windows/Linux 通知・通知設定 UI を記録）
- [ ] `outputs/phase-12/skill-feedback-report.md` が作成された
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

---

## タスク 100% 実行確認【必須】

Phase 12 完了時に以下を明記すること:

- 作成した 5 本のドキュメントの確認
- 未対応タスクの記録内容（タスク候補名と優先度）
- スキルフィードバックの主要な内容

---

## 次 Phase

Phase 12 の完了条件が全て満たされたら Phase 13（PR 作成）へ進む。
ただし Phase 13 はユーザーの明示的な承認を得てからのみ実施する。
