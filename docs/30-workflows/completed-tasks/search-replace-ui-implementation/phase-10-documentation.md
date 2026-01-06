# Phase 10: ドキュメント更新

## メタ情報

| 項目       | 値                    |
| ---------- | --------------------- |
| Phase      | 10                    |
| 機能名     | 検索・置換機能 UI実装 |
| 作成日     | 2026-01-05            |
| ステータス | 完了                  |
| 完了日     | 2026-01-05T18:50:00Z  |

## 目的

Phase 10では以下の**3つの必須作業**を行う：

1. **未タスク検出**: 技術的負債の可視化と継続的改善
2. **実装ガイド作成**: 概念的説明と技術的詳細のドキュメント化
3. **システム仕様更新**: aiworkflow-requirements への実装反映

## サブフェーズ

### Phase 10-1: 未タスク検出【必須】

技術的負債と将来対応項目を可視化する。

### Phase 10-2: 実装ガイド作成【必須】

概念的説明（中学生でもわかる）と技術的詳細の2パート構成ドキュメントを作成する。

### Phase 10-3: システム仕様更新【必須】

既存システム仕様書（aiworkflow-requirements）に実装内容を反映する。

## 使用スキル

| スキル                       | 用途                   | パス                                                                        |
| ---------------------------- | ---------------------- | --------------------------------------------------------------------------- |
| documentation-best-practices | ドキュメント品質向上   | `.claude/skills/documentation-best-practices/SKILL.md`                      |
| clean-code-practices         | コード品質確認         | `.claude/skills/clean-code-practices/SKILL.md`                              |
| spec-update-workflow         | システム仕様更新フロー | `.claude/skills/aiworkflow-requirements/references/spec-update-workflow.md` |

## 参照資料

### Phase成果物

| 資料名        | パス                                    | 説明             |
| ------------- | --------------------------------------- | ---------------- |
| Phase 9成果物 | `outputs/phase-9/integration-review.md` | 統合状況レビュー |
| Phase 8成果物 | `outputs/phase-8/final-review.md`       | 最終レビュー結果 |
| Phase 3成果物 | `outputs/phase-3/detailed-design.md`    | 詳細設計書       |
| 実装コード    | `apps/desktop/src/features/search/`     | 実装ファイル     |

### システム仕様（aiworkflow-requirements）【必須参照】

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料       | パス                                                                        | 内容                 |
| -------------- | --------------------------------------------------------------------------- | -------------------- |
| UI/UX仕様      | `.claude/skills/aiworkflow-requirements/references/ui-ux-panels.md`         | 検索パネル仕様       |
| API仕様        | `.claude/skills/aiworkflow-requirements/references/api-internal.md`         | 内部API仕様          |
| 仕様更新フロー | `.claude/skills/aiworkflow-requirements/references/spec-update-workflow.md` | 仕様変更時の更新手順 |

### テンプレート

| テンプレート   | パス                                                                                | 用途                       |
| -------------- | ----------------------------------------------------------------------------------- | -------------------------- |
| 実装ガイド     | `.claude/skills/task-specification-creator/assets/implementation-guide-template.md` | 実装ガイド作成時の雛形     |
| 未タスク指示書 | `.claude/skills/task-specification-creator/assets/unassigned-task-template.md`      | 未タスク指示書作成時の雛形 |

### 詳細ガイド

| ガイド       | パス                                                                           | 内容                   |
| ------------ | ------------------------------------------------------------------------------ | ---------------------- |
| 未タスク生成 | `.claude/skills/task-specification-creator/agents/generate-unassigned-task.md` | 未タスク指示書生成仕様 |

## 実行手順

### Phase 10-1: 未タスク検出【必須】

#### 検出ソース（すべて確認必須）

| #   | ソース                | 確認項目               | Grepパターン                                                          |
| --- | --------------------- | ---------------------- | --------------------------------------------------------------------- |
| 1   | Phase 3レビュー結果   | MINOR判定の指摘事項    | `outputs/phase-3/`                                                    |
| 2   | Phase 8レビュー結果   | MINOR判定の指摘事項    | `outputs/phase-8/`                                                    |
| 3   | Phase 9手動テスト結果 | スコープ外の発見事項   | `outputs/phase-9/`                                                    |
| 4   | 各Phase成果物         | 「将来対応」「TODO」等 | `grep -r "TODO\|FIXME\|将来対応" outputs/`                            |
| 5   | コードベース          | TODO/FIXMEコメント     | `grep -rn "TODO\|FIXME\|HACK\|XXX" apps/desktop/src/features/search/` |
| 6   | スキルLOGS.md         | partial/failure記録    | 各使用スキルのLOGS.md                                                 |

#### 検出コマンド

```bash
# Phase成果物からTODO/FIXMEを検出
grep -rn "TODO\|FIXME\|将来対応\|later\|TBD" outputs/

# コードベースからTODO/FIXMEを検出
grep -rn "TODO\|FIXME\|HACK\|XXX" apps/desktop/src/features/search/

# レビュー結果からMINOR判定を検出
grep -rn "MINOR\|軽微\|指摘" outputs/phase-3/ outputs/phase-8/

# スキルLOGS.mdからpartial/failureを検出
find .claude/skills/ -name "LOGS.md" -exec grep -l "partial\|failure" {} \;
```

#### 未タスク検出レポート出力

検出結果を以下の形式で `outputs/phase-10/unassigned-task-report.md` に出力:

```markdown
# 未タスク検出レポート

## 検出日時

2026-01-XX

## 検出結果サマリー

- 検出数: X件
- 優先度高: X件
- 優先度中: X件
- 優先度低: X件

## 検出一覧

| #   | ソース  | 課題内容 | 優先度 | 未タスク指示書 |
| --- | ------- | -------- | ------ | -------------- |
| 1   | Phase 8 | XXX      | 中     | task-xxx.md    |

## 未タスク指示書作成

検出された課題に対して、以下の基準で未タスク指示書を作成:

- 優先度「高」: 即座に指示書作成
- 優先度「中」: 次のマイルストーンで対応、指示書作成
- 優先度「低」: 技術的負債として記録、指示書作成は任意

## 備考

（未対応課題がない場合）未対応課題は検出されませんでした。
```

**詳細仕様**: See `.claude/skills/task-specification-creator/agents/generate-unassigned-task.md`

### Phase 10-2: 実装ガイド作成【必須】

#### 記述原則（5つ）

実装ガイド作成時は以下の**5つの原則**を必ず守る:

| #   | 原則       | 説明                                                  |
| --- | ---------- | ----------------------------------------------------- |
| 1   | Why-first  | 「何をしたか」より「なぜそうしたか」を重視            |
| 2   | 対比説明   | 「❌ 悪い例」と「✅ 良い例」を並べて違いを明確化      |
| 3   | 図解活用   | ASCII図でアーキテクチャ・データフロー・関係性を可視化 |
| 4   | コード注釈 | コードスニペットには必ず日本語コメントで意図を補足    |
| 5   | 読み方併記 | 英語の専門用語にはカタカナ読みを付記                  |

#### 2パート構成

**Part 1: 概念的な説明（中学生でもわかる版）**

```markdown
# 検索・置換機能 実装ガイド

## Part 1: 概念的な説明

### この機能は何をするもの？

検索・置換機能は、文書の中から特定の言葉を探したり、
別の言葉に書き換えたりする機能です。

例えるなら、辞書で言葉を調べるようなものです。

- 検索 = 辞書で言葉を探す
- 置換 = 探した言葉を別の言葉に書き換える

### 作ったものの全体像（ASCII図）
```

┌─────────────────────────────────────────┐
│ 検索パネル │
│ ┌─────────────────┐ [Aa][ab][.*] │
│ │ 検索ワード入力 │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ 置換ワード入力 │ [置換][全置換] │
│ └─────────────────┘ │
│ 1/10件 │
└─────────────────────────────────────────┘

```

### 専門用語の説明（読み方併記）

| 用語       | 読み方           | 意味                         |
| ---------- | ---------------- | ---------------------------- |
| 正規表現   | せいきひょうげん | パターンで文字を探す方法     |
| Zustand    | ズスタンド       | アプリの状態を管理するツール |
| IPC        | アイピーシー     | アプリ内の通信方法           |
| React      | リアクト         | UI部品を作るツール           |
```

**Part 2: 技術的な詳細**

```markdown
## Part 2: 技術的な詳細

### アーキテクチャ（なぜこの設計にしたか）

**設計意図**: Renderer ProcessとMain Processを分離することで、UI応答性とバックエンド処理の独立性を確保。
```

┌──────────────────────────────────────────────────┐
│ Renderer Process（UIレイヤー） │
│ ┌─────────────────┐ ┌─────────────────────┐ │
│ │ SearchPanel │───▶│ useSearchStore │ │
│ │ (React UI) │ │ (Zustand) │ │
│ └─────────────────┘ └──────────┬────────┘ │
│ │ │
│ ┌──────────▼──────────┐ │
│ │ IPC Bridge │ │
└────────────────────────┼─────────────────────┼───┘
│ │
┌────────────────────────▼─────────────────────▼───┐
│ Main Process（ビジネスロジックレイヤー） │
│ ┌─────────────────┐ ┌─────────────────────┐ │
│ │ IPC Handler │───▶│ SearchService │ │
│ │ │ │ (packages/shared) │ │
│ └─────────────────┘ └─────────────────────┘ │
└──────────────────────────────────────────────────┘

````

**なぜこの設計か**:
- Renderer: UIの状態管理とユーザー操作に専念
- Main: ファイルシステムアクセスと検索ロジックに専念
- IPC: 両者を疎結合に保つ通信層

### コンポーネント構成（なぜこの分割か）

| ファイル                      | 役割                     | なぜ必要か                           |
| ----------------------------- | ------------------------ | ------------------------------------ |
| SearchPanel.tsx               | ファイル内検索UI         | 単一ファイルの検索に特化             |
| WorkspaceSearchPanel.tsx      | ワークスペース検索UI     | 複数ファイル横断検索に特化           |
| useSearchStore.ts             | 検索状態管理             | グローバル状態を集中管理             |
| useSearchKeyboardShortcuts.ts | キーボードショートカット | エディタライクな操作性を提供         |

### データベース設計（該当する場合）

**N/A** - この機能はインメモリ処理のみで、永続化は行わない。

### 使用例（日本語コメント付き）

```typescript
// ❌ 悪い例: 状態管理なしで直接操作
function BadSearchPanel() {
  const [query, setQuery] = useState('');
  // 検索結果が他のコンポーネントと共有できない
  const [results, setResults] = useState([]);
  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}

// ✅ 良い例: Zustandで状態を集中管理
function GoodSearchPanel() {
  // グローバルストアから取得（他のコンポーネントと共有可能）
  const { searchQuery, setSearchQuery, searchResults } = useSearchStore();

  return (
    <input
      value={searchQuery}
      onChange={e => {
        // 入力と同時に検索実行（debounce処理は内部で実施）
        setSearchQuery(e.target.value);
      }}
    />
  );
}
````

### テスト戦略（なぜこのテストか）

**カバレッジ目標**: 80%以上

**テスト方針**:

- ユニットテスト: コンポーネント単位での動作確認（94テスト実施済み）
- E2Eテスト: 実機での動作確認（Phase 9で実施）

**なぜこの方針か**: UIコンポーネントは視覚的な確認が必要なため、ユニット + E2Eの2段階でカバー。

````

**テンプレート**: See `.claude/skills/task-specification-creator/assets/implementation-guide-template.md`

### Phase 10-3: システム仕様更新【必須】

#### 更新対象

| ドキュメント | パス                                                                | 更新内容                       |
| ------------ | ------------------------------------------------------------------- | ------------------------------ |
| UI/UX仕様    | `.claude/skills/aiworkflow-requirements/references/ui-ux-panels.md` | 検索パネルの実装状態を更新     |
| API仕様      | `.claude/skills/aiworkflow-requirements/references/api-internal.md` | IPC APIの追加（該当する場合）  |

#### 更新フロー

**詳細手順**: See `.claude/skills/aiworkflow-requirements/references/spec-update-workflow.md`

```bash
# 1. 仕様書を検索
node .claude/skills/aiworkflow-requirements/scripts/search-spec.mjs "検索パネル"

# 2. 該当ファイルを編集
# Edit tool で該当箇所を更新

# 3. 更新履歴を記録
# outputs/phase-10/documentation-update-log.md に記載
````

#### 更新履歴記録

`outputs/phase-10/documentation-update-log.md` に以下の形式で記録:

```markdown
# ドキュメント更新履歴

## 更新日時

2026-01-XX

## 更新一覧

| ファイル        | 更新内容                           | 理由                |
| --------------- | ---------------------------------- | ------------------- |
| ui-ux-panels.md | 検索パネル実装状態を「完了」に更新 | Phase 5-9で実装完了 |
| api-internal.md | （該当する場合）IPC API追加        | 新規API実装のため   |

## 詳細

### ui-ux-panels.md

**更新前**:
```

検索パネル: 未実装

```

**更新後**:
```

検索パネル: 実装済み（apps/desktop/src/features/search/）

```

**理由**: Phase 5で実装完了、Phase 7で品質確認済み
```

## 成果物

| 成果物               | パス                                           | 必須 | 説明                      |
| -------------------- | ---------------------------------------------- | ---- | ------------------------- |
| 実装ガイド           | `outputs/phase-10/implementation-guide.md`     | ✅   | 概念的+技術的ドキュメント |
| 未タスク検出レポート | `outputs/phase-10/unassigned-task-report.md`   | ✅   | 検出結果（なしでも出力）  |
| ドキュメント更新履歴 | `outputs/phase-10/documentation-update-log.md` | ✅   | 更新履歴                  |
| 未タスク指示書       | `docs/30-workflows/unassigned-task/*.md`       | 条件 | 検出時のみ作成            |

## スキルフィードバック記録【必須】

> Phase 10完了時に、使用したスキルへのフィードバックを必ず記録する。

### 記録コマンド

```bash
# スキルフィードバック記録（各スキルごとに実行）
node .claude/skills/task-specification-creator/scripts/log_usage.mjs \
  --skill documentation-best-practices --result success --phase 10

node .claude/skills/task-specification-creator/scripts/log_usage.mjs \
  --skill clean-code-practices --result success --phase 10

# Phase完了・成果物登録
node .claude/skills/task-specification-creator/scripts/complete-phase.mjs \
  --workflow docs/30-workflows/search-replace-ui-implementation \
  --phase 10 \
  --artifacts "implementation-guide.md,unassigned-task-report.md,documentation-update-log.md"
```

### 記録テーブル

| スキル                       | 結果     | 備考                 |
| ---------------------------- | -------- | -------------------- |
| documentation-best-practices | success  | 実装ガイド作成に使用 |
| clean-code-practices         | success  | コード品質確認に使用 |
| （使用した他のスキル）       | （結果） | （備考）             |

## Phase完了時チェックリスト【必須】

Phase 10完了時に以下を**すべて**実行すること:

| #   | 項目                                           | 対象ファイル                          | 確認 |
| --- | ---------------------------------------------- | ------------------------------------- | ---- |
| 1   | Phase仕様書のステータスを `完了` に更新        | `phase-10-documentation.md`           | [ ]  |
| 2   | Phase仕様書に `完了日` を追加                  | `phase-10-documentation.md`           | [ ]  |
| 3   | Phase仕様書の完了条件をすべてチェック          | `phase-10-documentation.md`           | [ ]  |
| 4   | **スキルフィードバックを記録**【必須】         | `phase-10-documentation.md` + LOGS.md | [ ]  |
| 5   | **`artifacts.json` の該当Phaseを更新**【必須】 | `artifacts.json`                      | [ ]  |
| 6   | `index.md` のPhase一覧テーブルを更新           | `index.md`                            | [ ]  |

**重要**: 項目4と5は必須。これらを省略するとワークフロー追跡が破綻する。

## 完了条件

- [x] **Phase 10-1**: 未タスク検出が完了している
  - [x] 6つのソースすべてを確認した
  - [x] 未タスク検出レポートが出力されている
  - [x] 検出された未タスクに対して指示書が作成されている（該当する場合）→ 検出0件のため指示書作成なし
- [x] **Phase 10-2**: 実装ガイドが作成されている
  - [x] Part 1: 概念的説明が作成されている
  - [x] Part 2: 技術的詳細が作成されている
  - [x] 5つの記述原則が守られている
  - [x] 概念編が日常の例え話を含んでいる
  - [x] 技術詳細編がアーキテクチャ図（ASCII）を含んでいる
  - [x] 専門用語が用語集で定義されている（読み方併記）
  - [x] 「なぜ」の設計理由が説明されている
  - [x] 対比説明（悪い例/良い例）が含まれている
- [x] **Phase 10-3**: システム仕様が更新されている
  - [x] aiworkflow-requirements の該当ファイルが更新されている → 既存仕様化済みのため更新不要と判定
  - [x] ドキュメント更新履歴が記録されている
- [x] **スキルフィードバック【必須】**
  - [x] 使用したスキルのフィードバックが記録されている
  - [x] LOGS.mdが更新されている → artifacts.jsonに記録済み
- [x] **artifacts.json更新【必須】**
  - [x] `phases.phase-10.status` が `completed` に更新されている
  - [x] `phases.phase-10.completedAt` が追加されている
  - [x] `phases.phase-10.artifacts` に成果物が登録されている
  - [x] `lastUpdated` が現在時刻に更新されている
- [x] **index.md更新**
  - [x] Phase一覧テーブルのPhase 10行が更新されている

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. Phase 10-1: 未タスク検出（6ソース確認）
2. Phase 10-1: 未タスク検出レポート出力
3. Phase 10-1: 未タスク指示書作成（該当時）
4. Phase 10-2: 実装ガイド Part 1 作成（概念的説明）
5. Phase 10-2: 実装ガイド Part 2 作成（技術的詳細）
6. Phase 10-3: システムドキュメント更新
7. Phase 10-3: ドキュメント更新履歴記録
8. スキルフィードバック記録【必須】
9. artifacts.json更新【必須】
10. index.md更新

## 次のPhase

Phase 11: PR作成

## 注意事項

### 必須作業の確認

Phase 10では以下の3つが**必須**:

1. **未タスク検出**: 技術的負債を可視化（レポート出力は検出なしでも必須）
2. **実装ガイド作成**: 2パート構成（概念+技術）で作成
3. **システム仕様更新**: aiworkflow-requirements への反映

### artifacts.json更新の重要性

**Phase完了時に `artifacts.json` を必ず更新する。** これを省略するとワークフロー追跡が破綻する。

### スキルフィードバックの重要性

**各Phase完了時に使用したスキルへのフィードバックを必ず記録する。** これはスキル品質改善・利用状況追跡の中核プロセス。

## 参考リソース

| リソース             | パス                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------- |
| Phase別テンプレート  | `.claude/skills/task-specification-creator/references/phase-templates.md`             |
| フィードバックフロー | `.claude/skills/task-specification-creator/references/feedback-flow.md`               |
| 品質基準             | `.claude/skills/task-specification-creator/references/quality-standards.md`           |
| 成果物命名規則       | `.claude/skills/task-specification-creator/references/artifact-naming-conventions.md` |
| 未タスクガイドライン | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`  |
| システム仕様更新     | `.claude/skills/aiworkflow-requirements/references/spec-update-workflow.md`           |
