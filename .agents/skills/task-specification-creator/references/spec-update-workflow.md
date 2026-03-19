# システム仕様更新ワークフロー

> 読み込み条件:
> Phase 12 Task 2 を開始する時。Step 1 と Step 2 を混同しないための index。

## 2種類の更新アクション

| アクション | 必須 | 役割 | 詳細 |
| --- | --- | --- | --- |
| Step 1: 完了記録 | すべての task で必須 | workflow 完了と台帳の同期 | [spec-update-step1-completion.md](spec-update-step1-completion.md) |
| Step 2: domain spec sync | 条件付き | interface / API / architecture 変更の反映 | [spec-update-step2-domain-sync.md](spec-update-step2-domain-sync.md) |
| validation | 完了前に必須 | 4系統の validator と pass 基準 | [spec-update-validation-matrix.md](spec-update-validation-matrix.md) |
| 詳細手順 | 実行時に参照 | Step 1/2 のチェックリスト・テンプレート・具体例 | [spec-update-workflow-advanced.md](spec-update-workflow-advanced.md) |

## 判断フロー

1. まず Step 1-A〜1-G を完了する。
2. 次に interface、API、state、security、UI contract の変更有無を判定する。
3. Step 2 が不要でも、判断根拠を `documentation-changelog.md` と `system-spec-update-summary.md` に残す。
4. final validation を通してから Phase 12 を閉じる。

## よくある誤判断（代表例）

> 完全なリストは [spec-update-workflow-advanced.md](spec-update-workflow-advanced.md) の「入口ファイル」セクションを参照。

| 誤判断 | 正しい扱い |
| --- | --- |
| 「実装ガイドを書いたので Step 1 は完了」 | 実装ガイドは Task 12-1。Step 1 は別物 |
| 「`.agents` を更新したから spec sync も終わった」 | 正本は `.claude`。mirror は代替不可 |
| 「既存型を再利用しているので更新不要」 | **Step 1-B必須** -- 実装状況テーブルの更新は必須 |
| 「内部実装のみなので更新不要」 | **Step 1-A必須** -- タスク完了記録は常に必須 |
| 「task-specification-creator/LOGS.mdは後で更新」 | **Step 1-A必須** -- 両方のLOGS.mdを同時に更新すること |
| 「worktree環境なのでStep 1-Aはマージ後でよい」 | **Step 1-A必須** -- 先送りすると契約ドリフト再発 |
| 「`artifacts.json` か `outputs/artifacts.json` の片方だけでよい」 | **両方同期必須** |
| 「topic-map.mdは変更なし」 | **再生成が必要** -- セクション追加/削除/更新/行数変更で必須 |

---

## 入口ファイル: 誤判断パターン詳細

以下のケースで「更新不要」と誤判断しやすいので注意:

| 誤判断パターン | 正しい判断 | 理由 |
| --- | --- | --- |
| 「Renderer側で定義済みなので更新不要」 | **Step 2必要** | Main Process側のインターフェース追加は仕様追加に該当 |
| 「型は別タスクで追加済みなので更新不要」 | **Step 2必要** | 新規クラス/コンポーネントは独自の仕様セクションが必要 |
| 「関連タスクテーブルは確認不要」 | **Step 1-C必須** | Grepで確認が必要 |
| 「未タスク指示書のunassigned-task/配置は見送り」 | **作成が必要** | 検出件数が1件以上の場合は原則作成する |
| 「Phase 9成果物名は `phase-9-quality.md` でも問題ない」 | **`phase-9-quality-assurance.md` に統一** | 命名規約と検証の期待値に合わせる |
| 「`documentation-changelog.md` だけあれば Phase 12 は完了扱い」 | **必須4成果物を揃える** | spec-update-summary / documentation-changelog / unassigned-task-detection / skill-feedback-report |

### 新規型定義の仕様書配置判断フロー

```
[新規型定義が発生]
    |
[既存 interfaces-*.md のドメインに属するか？]
    +-- Yes -> [該当ファイルが 500行未満か？]
    |         +-- Yes -> 既存ファイルに追記
    |         +-- No  -> ファイル分割を検討（-advanced.md / -details.md）
    +-- No  -> [新規ドメインか？]
              +-- Yes -> 新規 interfaces-*.md を作成
              +-- No  -> arch-*.md に追記
```

---

## 更新判断基準（Step 2用）

### 更新が必要な場合（必須）

| 条件                          | 例                                            |
| ----------------------------- | --------------------------------------------- |
| 新規インターフェース/型の追加 | ICorrectiveRAG, CRAGResult                    |
| 既存インターフェースの変更    | メソッド追加、シグネチャ変更                  |
| 新規定数/設定値の追加         | CRAG_DEFAULTS                                 |
| アーキテクチャパターンの追加  | 新しいパイプライン段階                        |
| API仕様の変更                 | エンドポイント追加、リクエスト/レスポンス変更 |
| データベーススキーマ変更      | テーブル追加、カラム変更                      |
| テスト戦略・方法論の変更      | テストフレームワーク変更、テストパターン導入  |

### 更新が不要な場合

| 条件                                     | 例                                 |
| ---------------------------------------- | ---------------------------------- |
| 内部実装の詳細変更のみ                   | プライベートメソッド、ローカル変数 |
| リファクタリング（インターフェース不変） | コード構造改善、命名変更           |
| バグ修正（仕様変更なし）                 | 既存仕様の正しい実装               |
| テスト追加のみ（戦略不変）               | テストケース数増加のみ             |

---

## 更新トリガー（変更タイプ別マッピング）

| 変更種別           | 更新対象                                  |
| ------------------ | ----------------------------------------- |
| APIエンドポイント  | `references/api-*.md`                     |
| IPC契約横断ガイド  | `references/ipc-contract-checklist.md`    |
| データベース       | `references/database-*.md`                |
| UI/UX              | `references/ui-ux-*.md`                   |
| アーキテクチャ     | `references/architecture-*.md`            |
| インターフェース   | `references/interfaces-*.md`              |
| セキュリティ       | `references/security-*.md`                |
| エラーハンドリング | `references/error-handling.md`            |

### 機能キーワードから仕様ファイルへのマッピング

| 機能キーワード                            | 正しい仕様ファイル             | 注意点                                |
| ----------------------------------------- | ------------------------------ | ------------------------------------- |
| `conversation-history`, `chat-history`    | `interfaces-chat-history.md`   | `ui-ux-history-panel.md`はファイル変換履歴用 |
| `llm`, `streaming`, `LLM連携`            | `interfaces-llm.md`            | -                                     |
| `auth`, `authentication`, `認証`          | `interfaces-auth.md`           | セキュリティ実装は`security-*.md`     |
| `skill`, `agent-sdk`, `スキル`            | `interfaces-agent-sdk.md`      | -                                     |
| `permission`, `PermissionDialog`          | `ui-ux-agent-execution.md`     | コンポーネント一覧は`ui-ux-components.md` |
| `eslint`, `lint`, `code-quality`          | `technology-backend.md`        | DevOps関連は`technology-devops.md`    |
| `ci`, `ci-cd`, `devops`                   | `technology-devops.md`         | -                                     |

---

## 更新漏れ防止チェックリスト（Phase 12 Task 2 完了前に確認）

- [ ] メソッドシグネチャに変更がある場合、interfaces-\*.mdを更新した
- [ ] 新規エラークラスを追加した場合、error-handling.mdを更新した
- [ ] 新規ビジネスルールがある場合、該当interfacesファイルに追加した
- [ ] 認可/認証ロジックを追加した場合、認可セクションを追加/更新した
- [ ] 新規定数/設定値がある場合、該当ファイルに記載した
- [ ] 更新したファイルの変更履歴セクションにバージョンを追記した
- [ ] IPC拡張を含む場合、チャンネル数が実装と仕様書で一致している
- [ ] 残課題テーブルに該当タスクがある場合、取り消し線+完了マークで更新した
- [ ] `artifacts.json` と `outputs/artifacts.json` の completed成果物一覧が一致している
- [ ] `generate-index.js --workflow <path> --regenerate` を実行した
- [ ] Phase 9成果物名を `phase-9-quality-assurance.md` で統一した
- [ ] `outputs/phase-12/` に必須4成果物が存在する
- [ ] topic-map.mdに新規セクションのエントリを追加した

---

## 新規仕様の追加手順

```bash
# 1. テンプレートをコピー
cp .claude/skills/aiworkflow-requirements/assets/spec-template.md \
   .claude/skills/aiworkflow-requirements/references/{prefix}-{topic}.md

# 2. 内容を記述（spec-guidelines.md参照）

# 3. インデックス再生成
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

## 変更履歴

| Date | Changes |
| ---- | ------- |
| 2026-03-18 | 925行のmonolithから詳細手順をspec-update-workflow-advanced.mdに分離。親はインデックス+判断基準に縮小 |
| 2026-03-12 | TASK-SKILL-LIFECYCLE-04 の再監査を反映 |
| 2026-03-12 | Step 1 / Step 2 / validation の 3 ファイルへ責務分離 |
