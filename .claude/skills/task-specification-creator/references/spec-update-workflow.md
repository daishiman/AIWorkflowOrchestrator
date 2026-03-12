# システム仕様更新ワークフロー

> **Progressive Disclosure**
>
> - 読み込みタイミング: Phase 12（ドキュメント更新）実行時
> - 読み込み条件: Phase 12 Task 2実行時（必須）
> - 関連スキル: aiworkflow-requirements

---

## ⚠️ 重要: 2種類の更新アクション

Phase 12では以下の**2種類の更新アクション**があります。混同に注意してください。

| アクション               | 必須 | 条件                               | 更新内容                     |
| ------------------------ | ---- | ---------------------------------- | ---------------------------- |
| **タスク完了記録の追加** | ✅   | **全タスクで必須**                 | 完了セクションを仕様書に追加 |
| **実装状況テーブル更新** | ✅   | **実装完了時は必須**（仕様書作成のみタスクは `spec_created` を適用） | 「未実装」→「完了 or spec_created」に変更 |
| システム仕様の更新       | △    | インターフェース変更がある場合のみ | 仕様内容の変更               |

### 判断フローチャート（全体）

```
Phase 12 Task 2 開始
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ Step 1-A: タスク完了記録（必須）                                   │
│ → 「完了タスク」セクションを該当仕様書に追加                        │
│ → 関連ドキュメントセクションに実装ガイドへのリンク追加               │
│ → LOGS.md×2ファイル + topic-map.md 更新                            │
└─────────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ Step 1-B: 実装状況テーブル更新（実装完了時は必須）                  │
│ → api-endpoints.md等の「実装状況」テーブルを確認                    │
│ → 該当項目が「未実装」の場合、「完了」または「spec_created」に変更   │
│ → ⚠️ これは「システム仕様更新」ではなく必須アクションです           │
└─────────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ Step 1-C: 関連タスクテーブル更新（該当する場合は必須）              │
│ → 仕様書内の「関連タスク」「未タスク候補」テーブルを確認            │
│ → grep でタスクID/名を references/ 配下全体から検索                 │
│ → 該当タスクのステータスを「完了」に更新                            │
│ → ⚠️ 見落としやすいステップ: 必ずGrepで確認すること                │
└─────────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ Step 2: システム仕様更新判断（条件付き）                           │
│ → 新規インターフェース/型の追加があるか判断                        │
│ → 不要の場合は「更新なし」と documentation-changelog.md に明記     │
└─────────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────────┐
│ 完了チェック: documentation-changelog.md に全Step結果を記録        │
│ → Step 1-A: ✅/❌ + 詳細                                          │
│ → Step 1-B: ✅/該当なし + 詳細                                     │
│ → Step 1-C: ✅/該当なし + 詳細                                     │
│ → Step 2:   ✅/更新不要 + 理由                                     │
└─────────────────────────────────────────────────────────────────┘
```

### ⚠️ よくある誤判断パターン

以下のケースで「更新不要」と誤判断しやすいので注意:

| 誤判断パターン                           | 正しい判断       | 理由                                                  |
| ---------------------------------------- | ---------------- | ----------------------------------------------------- |
| 「既存型を再利用しているので更新不要」   | **Step 1-B必須** | 実装状況テーブルの更新は必須                          |
| 「実装未着手の仕様書タスクも completed にすべき」 | **`spec_created` を適用** | 仕様書作成のみ完了したタスクは、実装完了と区別して `spec_created` を使用する |
| 「内部実装のみなので更新不要」           | **Step 1-A必須** | タスク完了記録は常に必須                              |
| 「Renderer側で定義済みなので更新不要」   | **Step 2必要**   | Main Process側のインターフェース追加は仕様追加に該当  |
| 「型は別タスクで追加済みなので更新不要」 | **Step 2必要**   | 新規クラス/コンポーネントは独自の仕様セクションが必要 |
| 「関連タスクテーブルは確認不要」         | **Step 1-C必須** | 仕様書内の「未タスク候補」「関連タスク」テーブルにタスクが記載されている可能性あり。Grepで確認が必要 |
| 「未タスク指示書のunassigned-task/配置は見送り」 | **作成が必要** | ガイドラインの「条件」要件を確認し、検出件数が1件以上の場合は原則作成する |
| 「実行タスクは表だけ記載すれば十分」 | **表+箇条書きの両方必須** | `phase-12-documentation.md` は実行タスクの表と `- Task 12-X:` 箇条書きを両方残すことで、機械検証と人間可読性の両方を満たす |
| 「未完了の未タスクを completed-tasks/unassigned-task に置いてよい」 | **配置先判定を必須記録** | 未完了は `docs/30-workflows/unassigned-task/`、完了移管済みのみ `docs/30-workflows/completed-tasks/unassigned-task/`。混在は参照ドリフトを招く |
| 「task-workflow.md の未タスクリンクは後で直す」 | **Step 1-Eで即時整合** | 参照切れが残ると後続タスクの探索が失敗する。`verify-unassigned-links.js` で機械検証する |
| 「task-specification-creator/LOGS.mdは後で更新」 | **Step 1-A必須** | 両方のLOGS.md（aiworkflow-requirements + task-specification-creator）を同時に更新すること。後回しにすると漏れる |
| 「worktree環境なのでStep 1-Aはマージ後でよい」 | **Step 1-A必須** | worktreeでも仕様書更新は実施可能。先送りすると Phase 12 完了条件未達と契約ドリフト再発を招く |
| 「`outputs/phase-12` が揃っていれば `phase-12-documentation.md` は未更新でもよい」 | **更新必須** | 成果物実体と仕様書本体の実行記録が乖離すると監査で不整合になる。Task 1〜5 の結果を `phase-12-documentation.md` へ同期する |
| 「`artifacts.json` か `outputs/artifacts.json` の片方だけ更新すればよい」 | **両方同期必須** | 2つの成果物台帳が乖離すると Phase 完了判定と参照リンクの整合が崩れる。完了前に内容を一致させる |
| 「`artifacts.json` が completed なら `index.md` は見なくてよい」 | **`generate-index.js --workflow ... --regenerate` で再生成必須** | workflow index は自動追随しないため、Phase 状態が stale なまま残る。`index.md` の Phase 1-12 / 13 表示を再確認する |
| 「`artifacts.json` / `index.md` が completed なら `phase-1..11` 本文は pending のままでよい」 | **本文仕様書も同期必須** | workflow 本文が pending のまま残ると、前提 Phase が未実施に見え、Phase 12 の依存参照や引き継ぎ根拠が崩れる |
| 「`.agents/skills/...` を更新したので system spec 更新は完了」 | **`.claude/skills/...` が正本。mirror は代替不可** | dual-root repo では `.agents` が mirror の場合がある。Step 1-A/Step 2 の更新先は `.claude/skills/...` を canonical root とし、必要なら mirror 差分は別途確認する |
| 「user が正本 root を明示していても既定の root ルールを優先してよい」 | **user 指定rootを canonical root として扱う** | `.claude/skills/...` のように user が正本を明示した場合は、その root を canonical root とし、他 root は mirror として drift 記録と同期対象にする |
| 「`origin/main...HEAD` が 0 件なら current worktree も未実装だ」 | **`origin/main...HEAD` と `git diff HEAD` を分離記録** | branch への commit 差分と current worktree 差分は別物。再監査では両方を記録し、どちらを根拠に status を付けたか明記する |
| 「Phase 9の成果物名は `phase-9-quality.md` でも問題ない」 | **`phase-9-quality-assurance.md` に統一** | 命名規約と `validate-phase-output` の期待値に合わせないと警告が残る |
| 「`documentation-changelog.md` だけあれば Phase 12 は完了扱いにできる」 | **必須4成果物を揃える** | `spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` の4点が揃って初めて再監査可能になる |
| 「`ipc-documentation.md` は概要説明だけでよい」 | **実装契約一致が必須** | `skillHandlers.ts` / `preload/index.ts` の引数・戻り値・エラー契約と一致しないと、API利用者が誤実装する |
| 「`audit-unassigned-tasks` のFAILは今回差分の失敗」 | **baseline/currentを分離** | `--target-file` / `--diff-from` は `current/baseline` 分類で使い、合否は `currentViolations.total` を正本に判定する（scope未指定の全体監査は baseline として別記録） |
| 「仕様書参照パスは後で直す」 | **Step 1-B前に実在確認** | 非実在ファイル参照が残ると更新対象の誤認が発生する。`test -f <path>` で事前に実在確認する |
| 「workflow ディレクトリがあるので `../task-xxx.md` はなくてもよい」 | **ブリッジ仕様または参照修正が必須** | Phase 仕様書が親タスク仕様を相対参照している場合、`docs/30-workflows/<workflow>.md` をブリッジとして残すか、各 Phase の参照先を正本へ更新する |
| 「task-00 参照切れは後続タスクで直す」 | **Phase 12内で即時修正** | `task-013e` / `task-014` など実行導線の参照切れは探索失敗を招く。`task-00-unified-implementation-sequence/` を `test -f` で検証し、必要ならブリッジ仕様を再配置する |
| 「current workflow だけ直せば親タスク/統合indexは後回しでよい」 | **親導線も同一ターンで正規化** | parent task / 統合 index が削除済み nested workflow や旧 `.md` を指すと、後続探索と検証コマンドが失敗する。`test -d <workflow>` と parent docs の `rg -n "<workflow-id>"` をセットで実行し、current / parent / index を同時更新する |
| 「current workflow に code diff がないので Phase 11 screenshot は不要」 | **統合UI再確認なら Phase 11 実施** | `spec_created` / docs-heavy task でも upstream UI surface の統合再確認やユーザー要求がある場合は、representative screenshots と Apple UI/UX 視覚検証を current workflow 配下へ残す |
| 「IPC拡張済みでも旧チャンネル数のままでよい」 | **Step 2で仕様更新必須** | `channels.ts` / `skillCreatorHandlers.ts` と `api-ipc-agent.md` / `interfaces-agent-sdk-skill.md` / `architecture-overview.md` のチャンネル数を一致させる |
| 「topic-map.mdは変更なし」               | **再生成が必要** | 仕様書にセクション追加・**削除**・**更新**・行数変更があった場合、`generate-index.js`で行番号を再同期すること |
| 「arch-state-management.mdの関連タスクは確認済み」 | **Grep必須** | 仕様書のSliceセクション内「関連タスク」テーブルは見落としやすい。`grep -rn "TASK_ID" references/`で全箇所を確認 |
| 「Slice統合は内部リファクタリングなので更新不要」 | **Step 2必要** | Slice統合（例: skillSlice→agentSlice）はarch-state-management.mdの更新が必須。統合元セクションを「統合済み」に変更し、統合先セクションを拡張すること（P25-P28参照） |
| 「スキル改善なし」と判断                 | **フィードバック必須** | Phase 12で必ずスキル改善検討を実施し、改善点がなくても「改善点なし」としてskill-feedback-report.mdを作成すること |
| 「テストリファクタリングなので仕様更新不要」 | **Step 2必要な場合あり** | テスト戦略変更（renderHookパターン導入、テストヘルパー追加、テストカテゴリ体系変更）は仕様書に記録すべき。テストケースの追加・削除のみなら不要 |

### 🆕 新規クラス/コンポーネント追加時のチェックリスト

新しいクラスやコンポーネントを実装した場合、**型定義の有無に関わらず**以下を確認：

| チェック項目                       | 該当する場合の対応               |
| ---------------------------------- | -------------------------------- |
| 他コンポーネントから使用されるか？ | 仕様書に API リファレンスを追加  |
| アーキテクチャ上の役割があるか？   | アーキテクチャ図を追加           |
| 設定可能なパラメータがあるか？     | 設定定数セクションを追加         |
| 特有のエラーパターンがあるか？     | エラーメッセージセクションを追加 |
| 使用例が必要か？                   | コード例セクションを追加         |

**例**: PermissionResolver（TASK-3-2）

- 型定義（SkillPermissionRequest/Response）は TASK-1-1 で追加済み
- しかし PermissionResolver クラス自体の API、アーキテクチャ、使用例は新規
- → interfaces-agent-sdk.md に「PermissionResolver 型定義」セクションを追加が必要

---

## 更新判断基準（Step 2用）

### 更新が必要な場合（必須）

| 条件                          | 例                                            |
| ----------------------------- | --------------------------------------------- |
| 新規インターフェース/型の追加 | ICorrectiveRAG, CRAGResult など               |
| 既存インターフェースの変更    | メソッド追加、シグネチャ変更                  |
| 新規定数/設定値の追加         | CRAG_DEFAULTS など                            |
| アーキテクチャパターンの追加  | 新しいパイプライン段階                        |
| API仕様の変更                 | エンドポイント追加、リクエスト/レスポンス変更 |
| データベーススキーマ変更      | テーブル追加、カラム変更                      |
| 外部連携インターフェース追加  | IWebSearcher など                             |
| テスト戦略・方法論の変更      | テストフレームワーク変更、テストパターン導入（renderHook、fireEvent戦略変更）、テストヘルパー新規設計 |

### 更新が不要な場合

| 条件                                     | 例                                 |
| ---------------------------------------- | ---------------------------------- |
| 内部実装の詳細変更のみ                   | プライベートメソッド、ローカル変数 |
| リファクタリング（インターフェース不変） | コード構造改善、命名変更           |
| バグ修正（仕様変更なし）                 | 既存仕様の正しい実装               |
| テスト追加のみ（戦略不変）               | テストケース数増加、カバレッジ向上のみ |
| ドキュメント誤記修正                     | typo修正、表現改善                 |

### 判断フローチャート

```
[新機能/変更がある]
    ↓
[外部から参照されるインターフェースか？]
    ├── Yes → 更新必要
    └── No
         ↓
    [他のコンポーネントが依存するか？]
        ├── Yes → 更新必要
        └── No → 更新不要（実装ガイドにのみ記載）
```

---

## 更新トリガー（変更タイプ別マッピング）

### 基本マッピング

| 変更種別           | 更新対象                                  |
| ------------------ | ----------------------------------------- |
| APIエンドポイント  | `references/api-*.md`                     |
| IPC契約横断ガイド  | `references/ipc-contract-checklist.md`, `indexes/quick-reference.md` |
| データベース       | `references/database-*.md`                |
| UI/UX              | `references/ui-ux-*.md`                   |
| アーキテクチャ     | `references/architecture-*.md`            |
| インターフェース   | `references/interfaces-*.md`              |
| セキュリティ       | `references/security-*.md`                |
| エラーハンドリング | `references/error-handling.md`            |
| 新機能（要件追加） | 該当するreferences/ファイルまたは新規作成 |

### ⚠️ 重要: 機能キーワードから仕様ファイルへのマッピング

**タスク名やファイル名に含まれるキーワード**で正しい仕様ファイルを特定する。

| 機能キーワード                                     | 正しい仕様ファイル                             | 注意点                                          |
| -------------------------------------------------- | ---------------------------------------------- | ----------------------------------------------- |
| `conversation-history`, `chat-history`, `会話履歴` | `interfaces-chat-history.md`                   | ❌ `ui-ux-history-panel.md`はファイル変換履歴用 |
| `file-conversion`, `converter`, `ファイル変換`     | `interfaces-converter.md`                      | UI側は`ui-ux-history-panel.md`                  |
| `llm`, `streaming`, `LLM連携`                      | `interfaces-llm.md`                            | -                                               |
| `auth`, `authentication`, `認証`                   | `interfaces-auth.md`                           | セキュリティ実装は`security-*.md`               |
| `rag`, `retrieval`, `search`, `検索`               | `interfaces-rag.md`または`interfaces-rag-*.md` | 機能により細分化                                |
| `skill`, `agent-sdk`, `スキル`                     | `interfaces-agent-sdk.md`                      | -                                               |
| `system-prompt`, `システムプロンプト`              | `interfaces-system-prompt.md`                  | UI側は`ui-ux-system-prompt.md`                  |
| `database`, `schema`, `DB`                         | `database-schema.md`                           | 実装詳細は`database-*.md`                       |
| `security`, `セキュリティ`                         | `security-*.md`                                | 機能により細分化                                |
| `api`, `endpoint`, `エンドポイント`                | `api-*.md`                                     | 機能により細分化                                |
| `permission`, `PermissionDialog`, `権限確認`       | `ui-ux-agent-execution.md`                     | コンポーネント一覧は`ui-ux-components.md`       |
| `eslint`, `lint`, `next-lint`, `code-quality`      | `technology-backend.md`                        | DevOps関連は`technology-devops.md`              |
| `ci`, `ci-cd`, `devops`, `build`, `deploy`         | `technology-devops.md`                         | バックエンド技術は`technology-backend.md`        |
| `backend`, `next`, `next.js`, `framework`          | `technology-backend.md`                        | -                                               |

### 仕様ファイル特定フローチャート

```
[タスク名/機能名を確認]
    ↓
[キーワード抽出]
  例: "conversation-history-ui-implementation"
      → キーワード: "conversation", "history", "ui"
    ↓
[キーワードマッピング表で対象ファイル候補を特定]
  "conversation-history" → interfaces-chat-history.md
    ↓
[候補ファイルの内容を確認]
  ⚠️ ui-ux-history-panel.md の内容を確認
     → "ファイル変換履歴" → 不一致 → 除外
  ✅ interfaces-chat-history.md の内容を確認
     → "会話履歴" → 一致 → 採用
    ↓
[正しいファイルに更新]
```

### 混同しやすい仕様ファイルの対照表

| 混同しやすい組み合わせ         | 用途の違い                                                      |
| ------------------------------ | --------------------------------------------------------------- |
| `ui-ux-history-panel.md`       | **ファイル変換履歴**（ConversionLogs, VersionHistory, Restore） |
| `interfaces-chat-history.md`   | **会話履歴**（Conversation, Message, ChatSession）              |
| `architecture-chat-history.md` | **会話履歴のアーキテクチャ設計**                                |
| `api-chat-history.md`          | **会話履歴APIエンドポイント**                                   |

### 具体的更新項目チェックリスト

Phase 12 Task 2実行時に以下をチェックし、該当する場合は**必ず**更新する。

| 実装内容                       | 更新対象ファイル                         | 更新内容                         |
| ------------------------------ | ---------------------------------------- | -------------------------------- |
| サービスメソッドシグネチャ変更 | `interfaces-*.md`                        | メソッド表のシグネチャ更新       |
| shared transport DTO / IPC envelope 追加 | `api-ipc-*.md`, `interfaces-*.md`, `error-handling.md`, `references/ipc-contract-checklist.md`, `indexes/quick-reference.md` | request / response / event / error / cross-cutting guide を同期 |
| 新規カスタムエラークラス追加   | `error-handling.md`                      | エラーコード・クラス定義追加     |
| 新規ビジネスルール追加         | `interfaces-*.md`                        | ビジネスルール表に追加           |
| 認可/認証ロジック追加          | `interfaces-*.md` または `security-*.md` | 認可セクション追加               |
| 新規定数/設定値追加            | 該当する`interfaces-*.md`                | 定数定義セクション追加           |
| データベーススキーマ変更       | `database-*.md`                          | テーブル/カラム定義更新          |
| 新規リポジトリメソッド追加     | `interfaces-*.md`                        | リポジトリインターフェース表更新 |

### 更新漏れ防止チェックリスト（Phase 12 Task 2 完了前に確認）

```markdown
## システム仕様更新チェックリスト

- [ ] メソッドシグネチャに変更がある場合、interfaces-\*.mdを更新した
- [ ] 新規エラークラスを追加した場合、error-handling.mdを更新した
- [ ] 新規ビジネスルールがある場合、該当interfacesファイルに追加した
- [ ] 認可/認証ロジックを追加した場合、認可セクションを追加/更新した
- [ ] 新規定数/設定値がある場合、該当ファイルに記載した
- [ ] 更新したファイルの変更履歴セクションにバージョンを追記した
- [ ] IPC拡張を含む場合、チャンネル数・進捗型（例: `SkillCreatorProgress`）が実装と仕様書で一致している
- [ ] エラー分類/リトライ戦略を追加した場合、error-handling.mdのリトライ対象判定セクションを更新した
- [ ] 残課題テーブルに該当タスクがある場合、取り消し線+✅完了マークで更新した
- [ ] 関連する仕様ファイルの実装状況テーブル（該当する場合）を更新した
- [ ] IPC transport contract を更新した場合、`references/ipc-contract-checklist.md` と `indexes/quick-reference.md` の両方を確認した
- [ ] `artifacts.json` と `outputs/artifacts.json` の completed成果物一覧が一致している
- [ ] `git diff --stat origin/main...HEAD` と `git diff --stat HEAD` の両方を確認し、branch差分とcurrent worktree差分を区別して記録した
- [ ] `node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow <workflow-path> --regenerate` を実行し、`index.md` の Phase 状態が `artifacts.json` と一致している
- [ ] `rg -n 'ステータス\\s*\\|\\s*pending' <workflow-path>/phase-{1,2,3,4,5,6,7,8,9,10,11}-*.md` を実行し、completed 扱いの Phase 本文に stale が残っていない
- [ ] Phase 9成果物名を `phase-9-quality-assurance.md` で統一した
- [ ] `outputs/phase-12/` に `spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` が存在する
- [ ] IPC契約を更新した場合、`outputs/phase-12/ipc-documentation.md` の引数/戻り値/エラー仕様を実装契約へ同期した
- [ ] workspace内でsource直接参照を追加した場合、補助型宣言（`.d.ts`）の取り込み設定を確認した
- [ ] topic-map.mdに新規セクションのエントリを追加した
```

### エラー分類・リトライ戦略の仕様更新チェックリスト

リトライ機構やエラー分類を実装した場合、以下を追加で確認する:

```markdown
## エラー分類・リトライ更新チェックリスト

- [ ] エラー種別の分類（retryable/non-retryable）がerror-handling.mdに記載されている
- [ ] リトライ設定パラメータ（maxRetries, baseDelayMs など）が該当interfaces-*.mdに記載されている
- [ ] バックオフアルゴリズム（Exponential Backoff, Jitter など）の仕様が記載されている
- [ ] AbortSignal/キャンセル処理との連携が記載されている
- [ ] ストリーミングイベント（retry通知 など）の形式が記載されている
```

## 更新フロー（2ステップ）

### Step 1: タスク完了記録（必須）

**全タスクで必須**。バグ修正でも新機能でも必ず実行。

```
Phase 12 Task 2 開始
    ↓
該当する仕様書を特定
  └── 例: skill関連 → interfaces-agent-sdk.md
    ↓
「## 完了タスク」セクションを追加（末尾近く）
  └── ⚠️ 必須: 「タスク完了ステータス更新」セクションの詳細テンプレートを使用
  └── テスト結果サマリー表・成果物表を含む詳細記録を追加すること
    ↓
「## 関連ドキュメント」セクションに実装ガイドリンク追加
    ↓
「変更履歴」にバージョン追記
    ↓
aiworkflow-requirements/LOGS.md にタスク完了エントリを追加（下記参照）
    ↓
task-specification-creator/LOGS.md にタスク完了記録を追加（下記参照）
    ↓
topic-map.md に新規セクションエントリを追加（下記参照）
    ↓
完了
```

#### Step 1 完了チェックリスト（Phase 12 Task 2 完了前に確認）

```markdown
## Step 1 完了チェックリスト

### Step 1-A: タスク完了記録
- [ ] 該当仕様書の「完了タスク」テーブルにタスクIDと完了日を追加した
- [ ] 「タスク完了ステータス更新」セクションの**詳細テンプレート**で完了記録を追加した
  - [ ] テスト結果サマリー表（機能/エラーハンドリング/アクセシビリティ/統合テスト）
  - [ ] 成果物テーブル（テスト結果レポート、実装ガイド、発見課題リスト）
- [ ] 「関連ドキュメント」セクションに実装ガイドリンクを追加した
- [ ] 「変更履歴」にバージョン番号を追記した

### Step 1-B: 実装状況テーブル更新
- [ ] 該当仕様書に「実装状況」テーブルがある場合、該当行を「完了」に更新した
- [ ] 仕様書作成のみのタスクは、該当行を `spec_created` に更新した（`completed` にしない）
- [ ] 更新対象として列挙した仕様書が実在することを `test -f <path>` で確認した
- [ ] `phase-*.md` が `../task-*.md` を参照している場合、ブリッジ仕様の実在または参照修正を確認した

### Step 1-C: 関連タスクテーブル更新
- [ ] arch-state-management.md、interfaces-agent-sdk.md、security-api-electron.md、task-workflow.md の「関連タスク」テーブルを確認した
- [ ] 該当タスクのステータスを「**完了**」に更新した

### Step 1-D: topic-map.md再生成（⚠️ 見落としやすい）
- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行した
- [ ] 再生成されたtopic-map.mdに新規セクションの行番号が正しく反映されている

### Step 1-E: 未タスク指示書作成・登録（1件以上検出時は必須）
- [ ] 未タスク候補が1件以上の場合、`docs/30-workflows/unassigned-task/` に指示書を作成・配置した
- [ ] 未タスクごとに配置先判定を記録した（未完了=`docs/30-workflows/unassigned-task/` / 完了移管済み=`docs/30-workflows/completed-tasks/unassigned-task/`）
- [ ] `docs/30-workflows/completed-tasks/unassigned-task/` 配下に未完了指示書（`未実施`/`未着手`）が混在していないことを確認した
- [ ] `task-workflow.md` の残課題（未タスク）テーブルに新規未タスクを登録した
- [ ] 関連仕様書（`interfaces-agent-sdk-history.md`、`task-workflow.md`、該当する `interfaces-*.md`）の残課題テーブルに新規未タスクを登録した
- [ ] `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` を実行し、`ALL_LINKS_EXIST` を確認した
- [ ] `audit-unassigned-tasks.js --json --diff-from <ref> --target-file <path>` または `--diff-from <ref>` の `currentViolations.total` を記録した
- [ ] scope未指定の `audit-unassigned-tasks.js --json` を baseline 監視結果として併記した
- [ ] ⚠️ 検出レポート作成だけでなく、指示書作成+テーブル登録まで完了すること

### Step 1-F: DevOps関連ファイル更新（CI/CD最適化タスクの場合は必須）
CI/CD・ビルド・テスト並列化に関するDevOps関連タスク完了時は、以下のファイルを確認・更新する。

- [ ] `deployment-gha.md` にCI/CD変更内容を記載した
  - [ ] シャード戦略（シャード数、分散方式）
  - [ ] キャッシュ戦略（対象、キャッシュキー）
  - [ ] 並列化設定（Vitest pool, maxForks, fileParallelism）
- [ ] `technology-devops.md` にパターン・完了タスクを追加した
  - [ ] CI最適化パターンセクション
  - [ ] 完了タスクテーブル
- [ ] `quality-requirements.md` に品質関連設定を追加した
  - [ ] 並列化設定と環境変数制御
  - [ ] パフォーマンス要件（実行時間目標）
- [ ] ⚠️ DevOps知見は3ファイルに分散するため、漏れやすい。必ず全ファイルを確認すること

### Step 1-G: 検証コマンド順次実行（Phase 12同期ガード）

Phase 12 Task 2 の更新後は、以下を**この順序で**実行する。

- 前提: すべてのコマンドは **リポジトリルート**（`AIWorkflowOrchestrator/`）をカレントディレクトリとして実行する。

#### 1. 未タスク参照リンク検証

```bash
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
```

- 正常時: `ALL_LINKS_EXIST` が出力され、exit code 0
- 異常時: `missing` と欠損パスが出力されるため、該当参照を修正して再実行

#### 2. 索引再生成

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
node .claude/skills/task-specification-creator/scripts/generate-index.js
git diff --stat -- .claude/skills/*/indexes/topic-map.md .claude/skills/*/indexes/keywords.json
```

- 正常時: 再生成コマンドが exit code 0
- 異常時: コマンド失敗、または意図しない差分が残る。差分内容を確認し必要箇所を反映
- `references/` に見出し追加・削除・改名がある場合は `indexes/topic-map.md` / `indexes/keywords.json` の差分が current worktree に出ることを確認する
- `indexes/` だけを手で直して `references/` 側の再生成を省略しない

#### 2.5 canonical root -> mirror root 同期（user 指定rootがある場合）

```bash
git diff --name-only -- \
  .claude/skills/task-specification-creator \
  .claude/skills/aiworkflow-requirements \
| while read -r canonical; do
  mirror="${canonical/.claude\//.agents/}"
  mkdir -p "$(dirname "$mirror")"
  rsync -a --checksum "$canonical" "$mirror"
done

git diff --name-only -- \
  .claude/skills/task-specification-creator \
  .claude/skills/aiworkflow-requirements \
| while read -r canonical; do
  mirror="${canonical/.claude\//.agents/}"
  cmp -s "$canonical" "$mirror" || {
    echo "DRIFT: $canonical <-> $mirror"
    exit 1
  }
done
```

- user が `.claude/skills/...` を正本として指定した場合は、**canonical root を先に更新してから** mirror root を同期する
- full check が必要な場合は `diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator` と `diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements` を追加で実行する

#### 3. SKILL 検証（全3スキル: 正規経路）
#### 3. SKILL 検証（3スキル）

個別実行:

```bash
# 正規経路（primary）: quick_validate.js（Node.js v18以上）
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
```

- 正常時: 全3スキルで Error 0件（終了コード 0）
- 異常時: Error の内容を確認し、SKILL構造を修正後に再実行

**補助経路（fallback）の使用条件:**

以下の**全条件**を満たす場合のみ、`quick_validate.py` を使用してよい:

1. Node.js ランタイム（v18以上）が利用不可である
2. Python 3.10 以上がインストールされている
3. PyYAML ライブラリがインストールされている

```bash
# 補助経路（Node.js が利用不可の場合のみ）
python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  .claude/skills/aiworkflow-requirements
python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
```

補助経路使用時は `documentation-changelog.md` に「補助経路を使用した」旨を明記する。

#### 3.1 検証結果の判定基準

**合格基準**: Error 0件で合格。Warning は合否に影響しないが、以下の3段階分類に基づき対応する。

**Warning 3段階分類:**

| 分類   | 定義                                                                   | 対応方針                                                       | 具体例                                                                                                     |
| ------ | ---------------------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 許容   | 運用上避けられない Warning で、修正コストが高く機能影響がない          | 件数を記録し、前回比で増加傾向がないことを確認する             | `aiworkflow-requirements` の大量 reference ファイルの参照リンク警告（Progressive Disclosure 設計に起因）   |
| 要監視 | 新規に発生した Warning で、放置すると品質低下の兆候となる              | 次回 Phase 12 までに対応方針（修正/許容昇格/未タスク化）を決定 | 新規追加した reference ファイルが SKILL.md からリンクされていない                                         |
| 要対応 | 機能やスキル構造の正確性に直接影響する Warning で、本Phase内で修正必要 | 本 Phase 内で修正する。修正不可の場合は未タスク化              | agents/*.md の必須セクション不足、name フィールドとディレクトリ名の不一致                                 |

**判定フロー:**

```
Warning 発生
  │
  ├─ [Q1] 当該 Warning は Phase 5 以前から存在する既知の Warning か？
  │   │    判定方法: 前回の Phase 12 検証記録（documentation-changelog.md）
  │   │    に同一パターンの Warning が記録されているか確認する。
  │   │    ※ 初回実行時（前回記録なし）は全て NO として扱う。
  │   │
  │   ├─ YES → [Q2] 前回比で件数が増加しているか？
  │   │   │
  │   │   ├─ YES → 「要監視」に分類
  │   │   │
  │   │   └─ NO → 「許容」に分類
  │   │
  │   └─ NO → [Q3] スキルの動作・構造の正確性に直接影響するか？
  │       │    判定基準:
  │       │    - name フィールドとディレクトリ名の不一致 → YES
  │       │    - agents/*.md の必須セクション不足 → YES
  │       │    - SKILL.md の 500行制限超過 → YES
  │       │    - 不要な補助ドキュメント（README.md等）の存在 → YES
  │       │    - references/ 内ファイルの SKILL.md リンク切れ → NO
  │       │    - description の Anchors/Trigger 未記載 → NO
  │       │
  │       ├─ YES → 「要対応」に分類
  │       │
  │       └─ NO → 「要監視」に分類
```

**大規模 references スキルの許容条件:**

`references/` 配下のファイル数が20件以上のスキルで、ファイルが SKILL.md からリンクされていない場合、以下の条件を**全て**満たせば「許容」と判定する:

1. 該当ファイルが `indexes/resource-map.md` または `indexes/topic-map.md` からリンクされている
2. 該当ファイルの内容がスキルの目的に関連する

許容条件に該当しないファイル（いずれのインデックスからもリンクされていない）は「要監視」に分類する。

**既知の制限事項（未タスク / 解消済み）:**

`quick_validate.js` の既知課題は、未対応と解消済みを分離して管理する:

- 未タスク（対応中）: BOM付きUTF-8の SKILL.md で frontmatter 検出が失敗する（[UT-IMP-QUICK-VALIDATE-BOM-UTF8-001](../../../../docs/30-workflows/unassigned-task/task-imp-quick-validate-bom-utf8-001.md)）
- 解消済み: name/description フィールド空値で `desc.toLowerCase()` ランタイムエラーが発生する問題（[UT-IMP-QUICK-VALIDATE-EMPTY-FIELD-GUARD-001](../../../../docs/30-workflows/completed-tasks/task-imp-quick-validate-empty-field-guard-001.md)）

全3スキル一括検証:

```bash
for skill in skill-creator task-specification-creator aiworkflow-requirements; do
  echo "=== $skill ===" && \
  node .claude/skills/skill-creator/scripts/quick_validate.js ".claude/skills/$skill"
done
```

- 正常時: 3スキル全てで Error 0件（終了コード 0）
- 異常時: Error が1件以上の場合、SKILL構造を修正後に再実行
- Warning: 3段階分類（許容/要監視/要対応）に基づき対応する（下記参照）

> **fallback**: Node.js が利用不可の場合のみ、`python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py <skill-path> --verbose` を使用する。fallback 使用時は成果物に「fallback 経路を使用した」旨を明記すること。

#### 3.1 検証結果の判定基準

**合格基準**: Error 0件で合格。Warning は3段階分類に基づき対応する。

| 分類   | 定義                                                                          | 対応方針                                              |
| ------ | ----------------------------------------------------------------------------- | ----------------------------------------------------- |
| 許容   | 運用上避けられない Warning で、修正コストが高くスキルの動作・構造に影響しない | 件数を記録し、前回比で増加傾向がないことを確認する    |
| 要監視 | 新規に発生した Warning で、放置するとスキル品質低下の兆候となる可能性がある   | 次回 Phase 12 までに対応方針を決定する                |
| 要対応 | スキルの動作・構造の正確性に直接影響する Warning                              | 本 Phase 内で修正する。修正不可の場合は未タスク化する |

**判定フロー:**

1. 当該 Warning は前回 Phase 12 から存在する既知の Warning か？
   - YES かつ件数横ばい → 「許容」
   - YES かつ1件以上の増加 → 「要監視」
   - NO → 次へ
2. スキルの動作・構造の正確性に直接影響するか？（name不一致、必須セクション不足、agents/*.md の形式不備）
   - YES → 「要対応」
   - NO → 「要監視」

**`aiworkflow-requirements` 固有の許容条件:**

`references/` 配下のファイル（150ファイル以上）が SKILL.md からリンクされていない Warning は、`indexes/resource-map.md` または `indexes/topic-map.md` からリンクされていれば「許容」とする。Progressive Disclosure 設計により、全ファイルの SKILL.md 直接リンクは意図的に省略されている。

#### 4. Phase仕様書参照と outputs 実体の整合確認

```bash
# 完了移管後の旧参照残存を検出
rg -n "docs/30-workflows/unassigned-task/task-.*\\.md" docs/30-workflows/{{FEATURE_NAME}}/phase-*.md

# docs配下 outputs とルート outputs の差分確認（差分0が正常）
comm -3 \
  <(cd docs/30-workflows/{{FEATURE_NAME}}/outputs && find . -type f | sort) \
  <(cd outputs && find . -type f | sort)
```

- 正常時: `phase-*.md` に旧 `unassigned-task` 参照が残っていない、`comm -3` の出力が空
- 異常時: 完了済みタスクの参照を `completed-tasks` に更新し、旧成果物・`.tmp-*` 一時ファイルを削除して再実行

### Step 1-G.1: baseline / current 分離監査（全体FAIL誤判定防止）

監査FAIL時は、以下で `baseline` と `current` を分離する。

```bash
# 1) 全体監査（既存違反を含む）
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json

# 1.5) 対象ファイル監査（今回差分の current を抽出）
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json \
  --diff-from HEAD \
  --target-file docs/30-workflows/unassigned-task/<task>.md | \
  jq '{scope, current_total: .currentViolations.total, baseline_total: .baselineViolations.total}'

# 2) 今回差分の候補抽出（変更範囲を指定）
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
  --scan docs/30-workflows/completed-tasks/ut-imp-aiworkflow-spec-reference-sync-001 \
  --output docs/30-workflows/completed-tasks/ut-imp-aiworkflow-spec-reference-sync-001/outputs/phase-12/.tmp-unassigned-candidates.json

# 3) Phase出力構造の整合確認（位置引数）
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/<workflow-dir>
```

判定ルール:

- `baseline`: 着手前から存在する違反。スコープ外として記録し、別途改善対象化
- `current`: 今回変更で新規発生した違反。今回タスク内で修正必須
- `--target-file`: 対象のみを表示する機能ではなく、`current/baseline` を分類する機能。**今回差分の合否判定には `--diff-from HEAD --target-file` の組み合わせ**を使う
- `--target-file` の有効範囲: `docs/30-workflows/unassigned-task/` または `docs/30-workflows/completed-tasks/unassigned-task/` 配下のみ。`docs/30-workflows/completed-tasks/*.md`（完了済み指示書直下）は対象外のため、scoped監査には未実施指示書を指定する

記録フォーマット:

```text
audit-unassigned-tasks: 全体 <PASS/FAIL>（baseline: N件, current: M件）→ current <PASS/FAIL>
```

### 必須更新ファイル（全タスク共通）
- [ ] aiworkflow-requirements/LOGS.md を更新した
- [ ] task-specification-creator/LOGS.md を更新した
- [ ] aiworkflow-requirements/SKILL.md の変更履歴にバージョンを追記した
- [ ] task-specification-creator/SKILL.md の変更履歴にバージョンを追記した
- [ ] `node .claude/skills/skill-creator/scripts/quick_validate.js` で3スキル全てが Error 0件であることを確認した（判定基準は Step 1-G.3.1 を参照）
- [ ] `node .claude/skills/skill-creator/scripts/quick_validate.js` で3スキル全てが Error 0件であることを確認した
- [ ] ui-ux-components.md（UI/UX関連タスクの場合）の完了タスクと変更履歴を更新した
- [ ] completed-tasks/ 内の該当タスク仕様書のステータスを更新した（実装完了: `completed` / 仕様書作成のみ: `spec_created`）
```

#### LOGS.md 更新（必須：2ファイル両方を更新）

**⚠️ 重要**: 以下の**2つの**LOGS.mdファイルを**両方**更新する必要があります。

| ファイル | 目的 |
| -------- | ---- |
| `.claude/skills/aiworkflow-requirements/LOGS.md` | システム仕様書更新の記録 |
| `.claude/skills/task-specification-creator/LOGS.md` | タスク仕様書スキルの使用記録 |

**1. aiworkflow-requirements/LOGS.md** に以下の形式でエントリを追加:

```markdown
## {{DATE}}: {{TASK_NAME}}（{{TASK_ID}}）

| 項目         | 内容                     |
| ------------ | ------------------------ |
| タスクID     | {{TASK_ID}}              |
| 操作         | update-spec              |
| 対象ファイル | {{更新したファイル一覧}} |
| 結果         | success                  |
| 備考         | {{実装内容の概要}}       |

### 更新詳細

- **更新**: `references/{{FILE}}.md`（vX.Y.Z → vX.Y.Z+1）
  - {{追加したセクション・内容}}
```

#### task-specification-creator/LOGS.md 更新（必須）

`.claude/skills/task-specification-creator/LOGS.md` に以下の形式でエントリを追加:

```markdown
## {{DATE}} - {{TASK_NAME}}（{{TASK_ID}}）タスク完了

### コンテキスト
- スキル: task-specification-creator
- タスクID: {{TASK_ID}}
- タスク名: {{TASK_NAME}}
- Phase: 1-12（または1-13）

### 成果
- テストカバレッジ: {{TEST_COUNT}}テスト全件PASS
- 実装内容:
  - {{主要な実装内容1}}
  - {{主要な実装内容2}}

### 結果
- ステータス: success
- 完了日時: {{DATE}}
```

#### topic-map.md 更新（新規セクション追加時は必須）

`.claude/skills/aiworkflow-requirements/indexes/topic-map.md` の該当ファイルセクションに:

```markdown
| {{新規セクション名}}（{{TASK_ID}}） | L{{行番号}} |
```

### Step 1-C: 関連タスクテーブル更新（該当する場合は必須）

システム仕様書（`arch-state-management.md`、`interfaces-agent-sdk.md`、`security-api-electron.md`、`task-workflow.md`）に「関連タスク」テーブルがあり、
当該タスクが記載されている場合は、ステータスを更新する。

```
[仕様書内に「関連タスク」テーブルがあるか？]
    ├── No → Step 2へ進む
    └── Yes
         ↓
    [当該タスクがテーブルに記載されているか？]
        ├── No → Step 2へ進む
        └── Yes
             ↓
        ステータス列を「未着手」→「**完了**」に更新
             ↓
        documentation-changelog.md に更新ファイルを記録
```

#### 確認すべきファイル（タスク種別による）

| タスク種別                 | 確認すべきファイル                          | テーブル名                   |
| -------------------------- | ------------------------------------------- | ---------------------------- |
| Skill/Agent関連            | `arch-state-management.md`                  | 関連タスク                   |
| Skill/Agent関連            | `interfaces-agent-sdk-history.md`           | 未タスク候補                 |
| IPC/Preload関連            | `security-api-electron.md`                  | 関連タスク                   |
| IPC/Preload関連            | `api-ipc-agent.md`                          | チャンネル一覧・完了タスク   |
| IPC/Preload関連            | `interfaces-agent-sdk-skill.md`             | インターフェース定義         |
| IPC/Preload関連            | `architecture-implementation-patterns.md`   | 実装パターン                 |
| UI/UXコンポーネント関連    | `ui-ux-components.md`                       | 関連タスク                   |
| データベース関連           | `database-schema.md`                        | 関連タスク                   |

> **Step 1-C 発見手順**: 上記テーブルだけでなく、以下のGrepで漏れを防止する:
> ```bash
> grep -rl "TASK_ID_OR_NAME" .claude/skills/aiworkflow-requirements/references/
> ```
> 例: `grep -rl "permission-tool-icons" .claude/skills/aiworkflow-requirements/references/`

#### 更新例

```markdown
# 変更前
| TASK-7B  | SkillImportDialog         | 未着手   |

# 変更後
| TASK-7B  | SkillImportDialog         | **完了** |
```

---

### IPC機能開発時の追加更新対象（Step 2該当時）

IPC チャンネルの追加・変更を伴うタスクの場合、Step 2 で以下のファイルの更新要否を確認する。

| # | 更新対象ファイル                          | 更新内容                                                 | 必須/任意 |
|---|-------------------------------------------|----------------------------------------------------------|-----------|
| 1 | `api-ipc-agent.md`                        | 新規チャンネル一覧、型定義、完了タスク記録               | 必須      |
| 2 | `security-electron-ipc.md`                | セキュリティ検証パターン（sender検証、ホワイトリスト）   | 必須      |
| 3 | `architecture-overview.md`                | IPCハンドラー登録一覧（registerAllIpcHandlers）           | 必須      |
| 4 | `interfaces-agent-sdk-skill.md`           | インターフェース定義、完了タスク記録                     | 必須      |
| 5 | `task-workflow.md`                        | 残課題テーブル更新、完了タスクセクション追加             | 必須      |
| 6 | `lessons-learned.md`                      | 実装教訓（新規パターン・落とし穴がある場合）             | 任意      |
| 7 | `architecture-implementation-patterns.md` | 実装パターン（新規パターンがある場合）                   | 任意      |

> **参考**: TASK-9B-H（SkillCreatorService IPC）では上記7ファイル全ての更新が必要だった。
> IPC追加タスクでは必ずこの一覧を確認し、該当するファイルを漏れなく更新すること。

### Step 2: システム仕様更新（条件付き）

**更新判断基準に該当する場合のみ**実行。

```
[仕様変更有り？]（更新判断基準で判断）
    ├── No → 「更新なし」をdocumentation-changelog.mdに明記して終了
    └── Yes
         ↓
aiworkflow-requirements/references/{{該当ファイル}}.md を編集
    ↓
インデックス再生成
    ↓
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
    ↓
変更履歴に追記（aiworkflow-requirements/SKILL.md も必須更新）
```

## 新規仕様の追加手順

```bash
# 1. テンプレートをコピー
cp .claude/skills/aiworkflow-requirements/assets/spec-template.md \
   .claude/skills/aiworkflow-requirements/references/{prefix}-{topic}.md

# 2. 内容を記述（spec-guidelines.md参照）

# 3. インデックス再生成
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

## タスク完了ステータス更新（Phase 11/12完了時）

手動テストや検証タスク完了時は、システム仕様書に**タスク完了セクション**を追加する。

### 追加セクションテンプレート

```markdown
### タスク: {{TASK_NAME}}（{{COMPLETION_DATE}}完了）

| 項目         | 内容                                                                       |
| ------------ | -------------------------------------------------------------------------- |
| タスクID     | {{TASK_ID}}                                                                |
| 完了日       | {{COMPLETION_DATE}}                                                        |
| ステータス   | **完了**                                                                   |
| テスト数     | {{AUTO_TEST_COUNT}}（自動テスト）+ {{MANUAL_TEST_COUNT}}（手動テスト項目） |
| 発見課題     | {{ISSUE_COUNT}}件                                                          |
| ドキュメント | `docs/30-workflows/{{TASK_NAME}}/`                                         |

#### テスト結果サマリー

| カテゴリ           | テスト数 | PASS  | FAIL  |
| ------------------ | -------- | ----- | ----- |
| 機能テスト         | {{N}}    | {{N}} | {{N}} |
| エラーハンドリング | {{N}}    | {{N}} | {{N}} |
| アクセシビリティ   | {{N}}    | {{N}} | {{N}} |
| 統合テスト連携     | {{N}}    | {{N}} | {{N}} |

#### 成果物

| 成果物             | パス                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| テスト結果レポート | `docs/30-workflows/{{TASK_NAME}}/outputs/phase-11/manual-test-result.md`   |
| 発見課題リスト     | `docs/30-workflows/{{TASK_NAME}}/outputs/phase-11/discovered-issues.md`    |
| 実装ガイド         | `docs/30-workflows/{{TASK_NAME}}/outputs/phase-12/implementation-guide.md` |
```

### 変更履歴更新

仕様書の`## 変更履歴`セクションに以下の形式で追記:

```markdown
| {{NEXT_VERSION}} | {{DATE}} | {{TASK_NAME}}完了（手動テスト{{N}}項目全PASS、自動テスト{{N}}件全PASS、発見課題{{N}}件） |
```

- 追記前に対象ファイルの既存 `Version` 列を確認し、同一番号を再利用しない。
- 同日に追補が複数回入る場合は、既存最大値に対して `+0.0.1` で採番する。

### 残課題更新

該当タスクが「残課題」にある場合、取り消し線で完了をマーク:

```markdown
| ~~{{TASK_NAME}}~~ | ~~{{依存タスク}}~~ | ~~{{優先度}}~~ | ~~{{未タスク指示書}}~~ ✅ **完了** |
```

---

## 具体例: TASK-IMP-permission-tool-icons-001

以下は実際のタスク完了時のPhase 12 Task 2実行例。UI コンポーネント内部変更（Renderer Process のみ）の典型パターン。

### Step実行結果

| Step   | 判定      | 理由                                                                 |
| ------ | --------- | -------------------------------------------------------------------- |
| 1-A    | ✅ 完了   | `interfaces-agent-sdk-ui.md` に完了タスクセクション追加              |
| 1-B    | 該当なし  | Renderer Process内部変更のみ。APIエンドポイント追加なし              |
| 1-C    | ✅ 完了   | `interfaces-agent-sdk-history.md` の未タスク候補テーブルを更新       |
| 2      | ✅ 更新実施 | 新定数 `TOOL_ICONS`、新関数 `getToolIcon()`、`formatArgs()` を追加 |

### Step 1-C 発見プロセス

```bash
grep -rn "permission-tool-icons" references/
# → interfaces-agent-sdk-history.md:310: 未タスク候補テーブルに記載あり
# → interfaces-agent-sdk-ui.md: 記載なし（Step 1-Aで追加）
```

### Step 2 更新判定の根拠

| 追加項目                    | 判定             | 根拠                                         |
| --------------------------- | ---------------- | -------------------------------------------- |
| `TOOL_ICONS` 定数           | 仕様追記が必要   | 他コンポーネントから参照される可能性あり      |
| `getToolIcon()` 関数        | 仕様追記が必要   | パブリック関数、再利用可能                    |
| `formatArgs()` 関数         | 仕様追記が必要   | 引数フォーマットの優先度ロジックが仕様的     |
| ツールアイコンバッジのCSS   | UI/UX仕様追記    | `ui-ux-agent-execution.md` にスタイリング仕様 |

### 更新ファイル一覧

| ファイル                         | 変更内容                                                       |
| -------------------------------- | -------------------------------------------------------------- |
| `interfaces-agent-sdk-ui.md`     | v1.3.0: 完了タスク、v1.3.1: TOOL_ICONS/getToolIcon/formatArgs |
| `interfaces-agent-sdk-history.md`| 未タスク候補テーブルのステータス更新                           |
| `ui-ux-agent-execution.md`       | ツールアイコンバッジ視覚仕様追加、テスト数更新                |
| `aiworkflow-requirements/LOGS.md`| 仕様更新記録                                                  |
| `task-specification-creator/LOGS.md` | Phase 1-12完了記録                                        |
| `topic-map.md`                   | 新セクションエントリ追加                                      |

---

## 完了タスク

### タスク: UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001 skill-creator検証ゲート整合化（2026-02-26完了）

| 項目         | 内容                                                                                 |
| ------------ | ------------------------------------------------------------------------------------ |
| タスクID     | UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001                                          |
| 完了日       | 2026-02-26                                                                           |
| ステータス   | **完了**                                                                             |
| 実施内容     | `quick_validate.js` 正規経路化、Warning 3段階分類導入、Phase 11/12証跡追補、未タスク整合 |
| ドキュメント | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/`                     |

#### 成果物

| 成果物                   | パス                                                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| 手動テスト結果           | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-11/manual-test-result.md`                 |
| 実装ガイド               | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-12/implementation-guide.md`               |
| 仕様更新サマリー         | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-12/spec-update-summary.md`                |
| 未タスク検出レポート     | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-12/unassigned-task-detection.md`          |
| スキルフィードバック      | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-12/skill-feedback-report.md`              |

## 関連ドキュメント

- `../../../../docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/phase-12-documentation.md`
- `../../../../docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-12/implementation-guide.md`
- `../../../../docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-12/documentation-changelog.md`

## 更新履歴

| Date | Changes |
| ---- | ------- |
| 2026-02-26 | `UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001` の完了タスク記録と関連ドキュメントを追記 |

---

## 参照リソース

| リソース                   | パス                                                                           |
| -------------------------- | ------------------------------------------------------------------------------ |
| 仕様スキル                 | `.claude/skills/aiworkflow-requirements/SKILL.md`                              |
| トピックマップ             | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                  |
| 記述ガイドライン           | `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md`         |
| 仕様テンプレート           | `.claude/skills/aiworkflow-requirements/assets/spec-template.md`               |
| ドキュメント更新履歴テンプレート | `.claude/skills/task-specification-creator/assets/documentation-changelog-template.md` |

---

## 変更履歴

| Date | Changes |
| ---- | ------- |
| 2026-03-06 | TASK-UI-02 Phase 12 再整合を反映し、誤判断パターンへ `index.md` stale を追加。チェックリストへ `generate-index.js --workflow ... --regenerate` と workflow index 状態確認を追記 |
| 2026-03-06 | TASK-UI-02 再々監査を反映し、誤判断パターンへ「`phase-1..11` 本文 pending 残置」を追加。更新漏れ防止チェックリストへ phase 本文 stale の `rg` 確認を追記 |
| 2026-03-06 | TASK-UI-02 再監査の教訓を反映し、変更履歴更新手順へ「Version 重複確認」と「同日追補は最大値 + 0.0.1 採番」を追加 |
| 2026-02-26 | `UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001` 反映: `quick_validate.js` 手動検証の再現性確認手順を Phase 11/12 の運用実績に合わせて再確認し、曖昧語（「など」表記へ統一）を調整して機械判定の一貫性を向上 |
