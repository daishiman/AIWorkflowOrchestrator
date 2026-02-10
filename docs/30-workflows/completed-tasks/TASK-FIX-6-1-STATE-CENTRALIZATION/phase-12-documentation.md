# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 12                                        |
| Phase名    | ドキュメント更新                          |
| 前提Phase  | Phase 11 (手動テスト検証)                 |
| 後続Phase  | Phase 13 (PR作成)                         |
| ステータス | 未実施                                    |
| 作成日     | 2026-02-09                                |
| タスクID   | TASK-FIX-6-1-STATE-CENTRALIZATION         |
| 機能名     | スキル状態管理のZustand集約（仕様書準拠） |

---

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 背景

状態管理の集約はアーキテクチャに影響を与える変更であり、適切なドキュメント化が必要。特に、今後の開発者がなぜこの変更が行われたのかを理解できるように、概念的な説明と技術的な詳細の両方を記録する。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: documentation-architecture

**パス**: `.claude/skills/documentation-architecture/SKILL.md`

**Trigger条件**:

- ドキュメント構造設計・作成が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`
- `outputs/phase-12/documentation-update-log.md`

---

### スキル2: skill-creator【必須】

**パス**: `.claude/skills/skill-creator/SKILL.md`

**Trigger条件**:

- スキルフィードバック記録・改善・新規作成が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「record-feedback」タスクに従って実行
3. 必要に応じて「update」または「create」モードを実行

**期待される成果物**:

- `outputs/phase-12/skill-feedback-report.md`
- 各スキルのLOGS.md更新
- （該当時）スキル改善実施レポート
- （該当時）新規スキル作成レポート

---

## 参照資料

| 参照資料              | パス                                                                                         | 内容                       |
| --------------------- | -------------------------------------------------------------------------------------------- | -------------------------- |
| タスク指示書          | `docs/30-workflows/skill-import-agent-system/tasks/03b-task-fix-6-1-state-centralization.md` | タスク要件                 |
| 修正後agentSlice      | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                       | ドキュメント対象           |
| 仕様書                | `docs/30-workflows/skill-import-agent-system/specification.md`                               | 状態管理仕様               |
| 手動テスト結果        | `outputs/phase-11/manual-test-result.md`                                                     | Phase 11成果物             |
| arch-state-management | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                 | 状態管理アーキテクチャ仕様 |

---

## 成果物

| 成果物                           | パス                                           | 必須 | 内容                     |
| -------------------------------- | ---------------------------------------------- | ---- | ------------------------ |
| 実装ガイド                       | `outputs/phase-12/implementation-guide.md`     | Yes  | 概念的説明・技術的詳細   |
| ドキュメント更新履歴             | `outputs/phase-12/documentation-changelog.md`  | Yes  | 更新したドキュメント一覧 |
| 未タスク検出レポート             | `outputs/phase-12/unassigned-task-report.md`   | Yes  | 検出された未タスク       |
| スキルフィードバックレポート     | `outputs/phase-12/skill-feedback-report.md`    | Yes  | スキル実行結果・改善提案 |
| スキル改善実施レポート（該当時） | `outputs/phase-12/skill-improvement-report.md` | No   | 改善したスキルの一覧     |
| 新規スキル作成レポート（該当時） | `outputs/phase-12/new-skill-report.md`         | No   | 作成した新規スキルの一覧 |

---

## Phase 12の4つの必須作業

### Task 1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

| パート | 対象読者         | 内容                                  |
| ------ | ---------------- | ------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）    |
| Part 2 | 開発者・技術者   | 技術的な詳細（スキーマ・API・使用例） |

---

#### Part 1: 概念的説明（中学生レベル）【必須】

**目的**: 技術的背景がない人でも状態管理の集約がなぜ必要で何を解決するのかを理解できるよう、日常の例えで説明する。

**必須項目**:

| セクション       | 内容                                                                  |
| ---------------- | --------------------------------------------------------------------- |
| 状態管理とは     | アプリが「今どうなっているか」を記録する仕組み                        |
| なぜ集約が必要か | 複数の場所に同じ情報があると混乱する問題                              |
| 何が改善されたか | 1つの場所に情報をまとめて、いつでも正しい状態がわかるようになった     |
| 日常例え         | 「複数の引き出しに同じものを入れていたのを、1つの引き出しにまとめる」 |

**例え話テンプレート（必須で使用）**:

```markdown
## 日常での例え

今まで、スキルの情報を3つの別々の場所に保管していました。

例えると、同じメモを3つの引き出しに入れていて、どれが最新かわからなくなる問題がありました。

- 引き出しA（skillSlice）：「スキル一覧」のメモ
- 引き出しB（AgentViewのローカルstate）：「今選んでいるスキル」のメモ
- 引き出しC（useSkillExecution）：「スキル実行中かどうか」のメモ

問題点：

- Aを更新してもBには反映されない
- Cだけ見ると、Aの情報とズレていることがある
- 「本当の最新情報」がどこにあるのかわからない

改善後：

このタスクでは、すべての情報を1つの引き出し（agentSlice）にまとめました。

- すべての情報が1か所にある
- いつでも正しい最新の情報がわかる
- 「この引き出しを見ればOK」という明確なルールができた
```

**補足例え（race conditionの説明）**:

```markdown
### race condition（競争状態）とは

スキルを実行するとき、「実行開始」と「結果受信」が別々に処理されます。

例えると、郵便局で「手紙を出す」と「返事を受け取る」の間にタイムラグがあるようなものです。

問題：
手紙を出した直後に返事が届いた場合、
「まだ手紙を出していない状態」で返事を処理しようとして混乱する。

解決策：
手紙を出す前に「返事待ちの番号」を先に決めておく。
そうすれば、返事が届いたときにすぐに紐付けられる。
```

---

#### Part 2: 技術者向け実装詳細【必須】

**必須項目**:

| セクション               | 内容                                                 |
| ------------------------ | ---------------------------------------------------- |
| 統一状態インターフェース | `AgentSliceState` の型定義と各フィールドの説明       |
| 削除されたファイル       | `skillSlice.ts`, `skillExecutionSlice.ts` の削除理由 |
| 移行パターン             | 旧コードから新コードへの変更例                       |
| race condition対策       | executionIdの事前生成とUUID使用のコード例            |
| セレクタ最適化           | パフォーマンスを維持するためのセレクタ設計           |
| テスト修正ポイント       | 既存テストで変更が必要だった箇所                     |

**統一状態インターフェース（記載必須）**:

```typescript
interface AgentSliceState {
  // スキル一覧
  availableSkills: SkillMetadata[];
  importedSkills: ImportedSkill[];

  // 選択・実行
  selectedSkill: string | null;
  isExecuting: boolean;
  executionId: string | null;

  // ストリーミング
  streamingMessages: SkillStreamMessage[];

  // エラー
  error: string | null;

  // アクション
  fetchSkills: () => Promise<void>;
  importSkill: (skillId: string) => Promise<void>;
  removeSkill: (skillId: string) => Promise<void>;
  selectSkill: (skillId: string | null) => void;
  executeSkill: (prompt: string) => Promise<void>;
  abortExecution: () => void;

  // IPCイベントハンドラ（内部）
  _handleStreamMessage: (message: SkillStreamMessage) => void;
  _handleComplete: (data: { executionId: string }) => void;
  _handleError: (data: { executionId: string; error: string }) => void;
}
```

**race condition対策コード例（記載必須）**:

```typescript
executeSkill: async (prompt: string) => {
  // 1. 先にexecutionIdを生成（UUID）
  const tempExecutionId = generateExecutionId();

  set({
    isExecuting: true,
    streamingMessages: [],
    executionId: tempExecutionId, // ← IPC呼び出し前に設定
  });

  try {
    // 2. IPC呼び出し
    const response = await window.electronAPI.skill.execute({
      prompt,
      tempExecutionId, // サーバーに渡す
    });

    // 3. サーバーからのexecutionIdで更新（必要な場合）
    if (response.executionId !== tempExecutionId) {
      set({ executionId: response.executionId });
    }
  } catch (error) {
    set({ error: error.message, isExecuting: false });
  }
};
```

---

### Task 2: システム仕様書更新【必須】

> **重要**: 詳細手順は `references/spec-update-workflow.md` を参照

**2ステップで実行**（両方必須確認）:

#### Step 1-A: タスク完了記録【必須・全タスク】

更新対象のログファイル:

| ファイル                              | 更新内容                                   |
| ------------------------------------- | ------------------------------------------ |
| `aiworkflow-requirements/LOGS.md`     | TASK-FIX-6-1-STATE-CENTRALIZATION 完了記録 |
| `task-specification-creator/LOGS.md`  | TASK-FIX-6-1-STATE-CENTRALIZATION 完了記録 |
| `aiworkflow-requirements/SKILL.md`    | 変更履歴セクションを更新                   |
| `task-specification-creator/SKILL.md` | 変更履歴セクションを更新                   |

**更新フォーマット**:

```markdown
## TASK-FIX-6-1-STATE-CENTRALIZATION (2026-02-XX)

- スキル状態管理をagentSliceに集約
- skillSlice.ts, skillExecutionSlice.tsを削除
- AgentViewのローカルstateを排除
- useSkillExecutionをagentSliceラッパーに変更
- race condition対策（executionId事前生成）を実装
```

#### Step 1-B: 実装状況テーブル（該当する場合）

更新対象の仕様書:

| ファイル                                                                     | 更新内容                           |
| ---------------------------------------------------------------------------- | ---------------------------------- |
| `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | agentSlice統合の実装ステータス更新 |
| `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | skillSlice統合記録の追加           |

**更新例**:

```markdown
### スキル関連状態管理

| 項目                | 実装状況 | 備考                      |
| ------------------- | -------- | ------------------------- |
| agentSlice統合      | 実装済み | TASK-FIX-6-1で実施        |
| skillSlice          | 削除済み | agentSliceに統合          |
| skillExecutionSlice | 削除済み | agentSliceに統合          |
| race condition対策  | 実装済み | executionId事前生成で解決 |
```

#### Step 1-C: 関連タスクテーブル

以下のコマンドで関連仕様書を検索して更新:

```bash
grep -rn "TASK-FIX-6-1" .claude/skills/aiworkflow-requirements/references/
```

#### Step 1-D: topic-map.md 再生成【重要】

> **見落としやすい**: 仕様書に新規セクション追加時は必ず実行

**実行手順**:

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

**確認項目**:

- [ ] 再生成された topic-map.md に新規セクションの行番号が正しく反映されている
- [ ] または「変更なし」と判断した理由を documentation-changelog.md に記録した

---

### Task 2 Step 2: システム仕様更新【条件付き】

以下の判断基準で更新要否を判断:

| 更新必要                       | 更新不要                   |
| ------------------------------ | -------------------------- |
| 新規インターフェース/型の追加  | 内部実装の詳細変更のみ     |
| 既存インターフェースの変更     | リファクタリング（IF不変） |
| 新規定数/設定値の追加          | バグ修正（仕様変更なし）   |
| 外部連携インターフェースの追加 | テスト追加のみ             |

**本タスクの判断**:

- agentSlice統合はアーキテクチャ変更を伴う
- arch-state-management.md の更新が必要（Step 1-B で対応）
- インターフェース自体の変更はなし（内部リファクタリング）

**documentation-changelog.md への記録（必須）**:

```markdown
### Step 2: システム仕様更新

- 判断: 条件付き更新
- 対象: arch-state-management.md
- 理由: 状態管理アーキテクチャの変更を反映
- 更新内容: agentSlice統合、削除ファイル、race condition対策
```

---

### Task 3: documentation-changelog.md 更新【必須】

このタスクで更新した全ドキュメントの変更内容を記録する。

**記録フォーマット**:

```markdown
## TASK-FIX-6-1-STATE-CENTRALIZATION (2026-02-XX)

### 更新したファイル

| ファイル                           | 変更種別 | 内容                         |
| ---------------------------------- | -------- | ---------------------------- |
| agentSlice.ts                      | 修正     | 全スキル状態を統合           |
| skillSlice.ts                      | 削除     | agentSliceに統合             |
| skillExecutionSlice.ts             | 削除     | agentSliceに統合             |
| AgentView.tsx                      | 修正     | ローカルstate排除            |
| useSkillExecution.ts               | 修正     | agentSliceラッパーに変更     |
| agentSlice.test.ts                 | 修正     | 統合後のテスト追加           |
| aiworkflow-requirements/LOGS.md    | 追記     | タスク完了記録               |
| task-specification-creator/LOGS.md | 追記     | タスク完了記録               |
| arch-state-management.md           | 修正     | agentSlice統合の実装状況追加 |

### Step 完了ステータス

- [ ] Step 1-A: タスク完了記録（LOGS.md 2ファイル）
- [ ] Step 1-A: SKILL.md 変更履歴（2ファイル）
- [ ] Step 1-B: 実装状況テーブル更新（arch-state-management.md）
- [ ] Step 1-C: 関連タスクテーブル（grep検索で確認）
- [ ] Step 1-D: topic-map.md 再生成
- [ ] Step 2: システム仕様更新（条件付き）
```

**重要**: 全 Step 確認前に「完了」と記載しない。

---

### Task 4: 未タスク検出【必須】

#### 必須チェック項目

| #   | ソース                 | 確認項目                      |
| --- | ---------------------- | ----------------------------- |
| 1   | Phase 3レビュー結果    | MINOR判定の指摘事項           |
| 2   | Phase 10レビュー結果   | MINOR判定の指摘事項           |
| 3   | Phase 11手動テスト結果 | スコープ外の発見事項          |
| 4   | 各Phase成果物          | 「将来対応」「TODO」「FIXME」 |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント   |

#### 検索コマンド

```bash
# コードベース内のTODO/FIXMEを検索
grep -rn "TODO\|FIXME\|HACK\|XXX" apps/desktop/src/renderer/store/
grep -rn "TODO\|FIXME\|HACK\|XXX" apps/desktop/src/renderer/components/AgentView.tsx
grep -rn "TODO\|FIXME\|HACK\|XXX" apps/desktop/src/renderer/hooks/useSkillExecution.ts
```

#### 未タスク検出レポート（必須）

**0件の場合でも以下のレポートを作成すること**:

```markdown
# 未タスク検出レポート - TASK-FIX-6-1-STATE-CENTRALIZATION

## 検出日: 2026-02-XX

## 検出結果サマリー

- 新規検出: {{N}}件
- 既知の関連タスク: {{N}}件

## 新規検出タスク

### TASK-UT-XXX-{{NAME}}（該当する場合）

- **Why**: {{問題の理由}}
- **What**: {{解決すべき内容}}
- **How**: {{解決方法の概要}}
- **Priority**: {{高/中/低}}

## 既知の関連タスク

### TASK-6-1-SKILL-SLICE

- **ステータス**: 未実施
- **関連性**: 本タスク完了が前提条件
- **備考**: 仕様書に基づく完全な状態管理実装

## 検出プロセス

- [ ] Phase 3レビュー結果確認
- [ ] Phase 10レビュー結果確認
- [ ] Phase 11手動テスト結果確認
- [ ] コードベース TODO/FIXME 検索
- [ ] 使用スキル LOGS.md 確認
```

#### 検出された未タスクの3ステップ処理【必須】

検出された未タスクは以下の3ステップ全てを完了すること:

1. **指示書作成**: `docs/30-workflows/unassigned-task/` に指示書を作成
2. **残課題テーブル登録**: `task-workflow.md` の残課題テーブルに登録
3. **関連仕様書リンク追加**: 関連する仕様書に参照リンクを追加

---

## 統合テスト連携【必須】

ドキュメント更新で統合テスト内容を文書化:

| 文書化項目               | 内容                         |
| ------------------------ | ---------------------------- |
| IPC通信テスト            | テストケース一覧、期待結果   |
| 状態同期テスト           | 状態遷移シナリオ、検証方法   |
| エラーハンドリングテスト | エラーケース一覧、UI表示確認 |

---

## アーキテクチャ層別ドキュメント（AIが判断）

実装ガイドPart 2（技術的詳細）では、タスクの性質に応じて以下の層別にドキュメントを作成する：

| 層               | ドキュメント内容                            | 本タスクでの更新対象         |
| ---------------- | ------------------------------------------- | ---------------------------- |
| Renderer Process | コンポーネント設計、状態管理、Hooks使用方法 | AgentView、useSkillExecution |
| Main Process     | -                                           | （該当なし）                 |
| IPC通信          | -                                           | （該当なし）                 |
| 状態管理         | Zustandスライス設計、セレクタ、状態遷移     | agentSlice統合設計           |
| データ層         | -                                           | （該当なし）                 |

---

## 完了条件

### Task 1: 実装ガイド

- [ ] 実装ガイド Part 1（概念的説明 - 中学生レベル・日常の例え話含む）が作成されている
- [ ] 実装ガイド Part 2（技術者向け詳細 - 統一状態インターフェース・race condition対策コード例）が作成されている

### Task 2: システム仕様書更新

- [ ] **【Step 1-A】** LOGS.md 2ファイル（aiworkflow-requirements + task-specification-creator）が更新されている
- [ ] **【Step 1-A】** SKILL.md 2ファイルの変更履歴が更新されている
- [ ] **【Step 1-B】** 実装状況テーブル（arch-state-management.md）が更新されている
- [ ] **【Step 1-C】** 関連タスクテーブル更新（または「該当なし」の判断を記録）
- [ ] **【Step 1-D】** topic-map.md 再生成（または「該当なし」の判断を記録）
- [ ] **【Step 2】** システム仕様更新要否を判断し、documentation-changelog.md に記録

### Task 3: documentation-changelog.md

- [ ] ドキュメント更新記録が出力されている
- [ ] 全 Step（1-A/1-B/1-C/1-D/Step 2）の結果が個別に明記されている

### Task 4: 未タスク検出

- [ ] 未タスク検出レポートが出力されている（**0件でも必須**）
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] 検出された未タスクに対して3ステップ処理が完了している（該当する場合）

### スキルフィードバック

- [ ] **スキルフィードバックがskill-creatorで記録されている**【必須】
- [ ] **スキル改善/新規作成が必要な場合、skill-creatorで実行されている**
- [ ] **本Phase内の全スキルを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックがskill-creatorで記録されている
- [ ] スキル改善/新規作成の判定が完了している

---

## 依存関係

- **前提**: Phase 5, 8, 9, 10, 11 が完了していること
- **後続**: Phase 13 へ進む

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 12 実行記録

### 使用スキル

| スキル                     | 結果                        | 備考     |
| -------------------------- | --------------------------- | -------- |
| documentation-architecture | {{success/partial/failure}} | {{備考}} |
| skill-creator              | {{success/partial/failure}} | {{備考}} |

### 成果物

- 実装ガイド: {{作成/未作成}}
- ドキュメント更新記録: {{作成/未作成}}
- 未タスク検出レポート: {{作成/未作成}}
- スキルフィードバックレポート: {{作成/未作成}}
- システム仕様更新: {{実施/不要}}

### Task 4 実行結果

- 未タスク検出: {{件数}}
- 既知の関連タスク: TASK-6-1-SKILL-SLICE

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`phase-13-pr-creation.md`
