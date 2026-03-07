# 実装ガイド: Store駆動ライフサイクル統合設計

| 項目     | 値           |
| -------- | ------------ |
| タスクID | TASK-10A-E-C |
| Phase    | 12 - Task 1  |
| 実行日   | 2026-03-06   |

---

## Part 1: 概念的説明

この章では、Store駆動ライフサイクル統合の仕組みを、日常の例えを使って説明する。

### Store（倉庫）とは

アプリの中にある**共有倉庫**を想像してほしい。画面に表示されているボタンやリストなどの部品は、すべてこの倉庫に「今どんな状態？」と聞きに来る。倉庫は常に最新の情報を持っていて、聞かれたら即座に教えてくれる。

例えば、スキルインポート画面が「今インポート済みのスキルは何がある？」と聞くと、倉庫は `["翻訳スキル", "要約スキル"]` のように答えを返す。倉庫の中身が変わると、聞いていた画面も自動的に表示を更新する。

### Selector（取り出し口）とは

倉庫には色々な情報が入っている。インポート済みスキル、利用可能なスキル、エラー情報、ローディング状態など、たくさんのものが詰まっている。

**Selector** は、倉庫から**必要な情報だけを取り出す窓口**だ。コンビニのレジが複数あるように、取り出し口も用途別に分かれている。

- 「インポート済みスキル一覧だけ頂戴」 → `useImportedSkills` 窓口
- 「今インポート中？」 → `useIsImportingSkill` 窓口
- 「エラーがあったら教えて」 → `useSkillError` 窓口

なぜ窓口を分けるのか？ もし1つの大きな窓口で倉庫の中身を全部渡すと、関係ない情報が変わっただけで画面が無駄に再描画されてしまう。窓口を分けることで、「自分が欲しい情報が変わった時だけ更新する」という効率的な仕組みが実現できる。これが**P31無限ループ問題**の解決策だ。

### Action（操作指示）とは

倉庫に対して「このスキルをインポートして！」と指示を出すボタンが **Action** だ。

Action は単なるボタンではなく、**手順書付きの指示**になっている。「インポートして」という指示には、以下のような手順が含まれている:

1. 「処理中」の看板を出す（他の人が同じ操作をしないように）
2. 実際にインポート処理を行う（IPCを通じてMain Processに依頼）
3. 成功したら倉庫の中身を更新し、「処理中」看板を外す
4. 失敗したらエラー記録を残し、「処理中」看板を外す

### Import中フラグ（処理中看板）

レジで「お会計中」の看板が出ているとき、他のお客さんは同じレジには並べない。これと同じで、インポート処理中は **`isImporting` フラグ** が `true` になり、同じスキルを二重にインポートしようとする操作をブロックする。

処理が終わると（成功でも失敗でも）看板は外される。

### エラー状態

注文した商品が届かなかった時、レシートに「配送失敗」と記録が残る。同じように、インポートに失敗すると **`skillError`** に「スキルのインポートに失敗: ファイルが見つかりません」のようなメッセージが記録される。

このエラー記録は、ユーザーが確認するまで残り続ける。確認したら `clearSkillError` で記録を消す。

### 冪等ガード（二重注文防止）

すでに届いた商品をもう一度注文しようとしたら、「もう届いてますよ」と教えてくれる仕組み。既にインポート済みのスキルに対して `importSkill` を呼んでも、IPC通信は発生せず、何もせずに終了する。これにより無駄な通信と処理を防ぐ。

---

## Part 2: 開発者向け技術詳細

### 1. Zustand Slice設計

スキルインポートライフサイクルに関連する状態フィールドは、`agentSlice` 内に集約されている。

#### Import ライフサイクル状態フィールド

| フィールド                | 型                  | 初期値  | 説明                   |
| ------------------------- | ------------------- | ------- | ---------------------- |
| `isImporting`             | `boolean`           | `false` | import処理中フラグ     |
| `importingSkillName`      | `SkillName \| null` | `null`  | import中のスキル名     |
| `skillError`              | `string \| null`    | `null`  | 最新のエラーメッセージ |
| `importedSkills`          | `ImportedSkill[]`   | `[]`    | import済みスキル一覧   |
| `availableSkillsMetadata` | `SkillMetadata[]`   | `[]`    | 利用可能スキルメタ一覧 |

これらのフィールドは `AgentState` インターフェース内で定義されており、`createAgentSlice` で初期化される。

#### agentSlice内の責務グループ

| グループ              | 管轄タスク   | 関連状態フィールド                                                                   |
| --------------------- | ------------ | ------------------------------------------------------------------------------------ |
| Importライフサイクル  | TASK-10A-E-C | `isImporting`, `importingSkillName`, `importedSkills`, `availableSkillsMetadata`     |
| Createライフサイクル  | TASK-10A-F   | (専用状態なし)                                                                       |
| Analyzeライフサイクル | TASK-10A-F   | `currentAnalysis`, `isAnalyzing`, `isImproving`                                      |
| 共通                  | 共有         | `skills`, `selectedSkill`, `skillFilter`, `skillCategory`, `skillError`, `isLoading` |

`skillError` は全グループが書き込み可能な共有フィールドであり、後勝ち（last-write-wins）方式を採用している。

### 2. Selector設計

#### 個別セレクタ（7つ）

`store/index.ts` に定義済みの個別セレクタ。P31対策として全て単一フィールドを返す。

| セレクタ名                   | 戻り値型            | 算出ロジック                    | 定義元タスク            |
| ---------------------------- | ------------------- | ------------------------------- | ----------------------- |
| `useImportedSkills`          | `ImportedSkill[]`   | `state.importedSkills`          | UT-STORE-HOOKS-REFACTOR |
| `useAvailableSkillsMetadata` | `SkillMetadata[]`   | `state.availableSkillsMetadata` | UT-STORE-HOOKS-REFACTOR |
| `useIsImportingSkill`        | `boolean`           | `state.isImporting`             | UT-STORE-HOOKS-REFACTOR |
| `useImportingSkillName`      | `SkillName \| null` | `state.importingSkillName`      | UT-STORE-HOOKS-REFACTOR |
| `useSkillError`              | `string \| null`    | `state.skillError`              | UT-STORE-HOOKS-REFACTOR |
| `useImportSkill`             | `Action`            | `state.importSkill`             | UT-STORE-HOOKS-REFACTOR |
| `useRemoveSkill`             | `Action`            | `state.removeSkill`             | UT-STORE-HOOKS-REFACTOR |

#### 派生セレクタ（2つ） -- TASK-10A-E-Cで新規追加

| セレクタ名                    | 戻り値型          | 算出ロジック                            | useShallow |
| ----------------------------- | ----------------- | --------------------------------------- | ---------- |
| `useAvailableSkillsForImport` | `SkillMetadata[]` | available から imported を名前で除外    | 適用済み   |
| `useFilteredAvailableSkills`  | `SkillMetadata[]` | 上記 + `skillFilter` によるテキスト検索 | 適用済み   |

##### useAvailableSkillsForImport の実装

```typescript
export const useAvailableSkillsForImport = () =>
  useAppStore(
    useShallow((state) =>
      state.availableSkillsMetadata.filter(
        (a) => !state.importedSkills.some((i) => i.name === a.name),
      ),
    ),
  );
```

`.filter()` は呼び出しのたびに新しい配列参照を返す。`useShallow` を適用することで、配列の内容が同一であれば再レンダーを抑制する。

##### useFilteredAvailableSkills の実装

```typescript
export const useFilteredAvailableSkills = () =>
  useAppStore(
    useShallow((state) => {
      const available = state.availableSkillsMetadata.filter(
        (a) => !state.importedSkills.some((i) => i.name === a.name),
      );
      const filter = state.skillFilter.trim().toLowerCase();
      if (!filter) return available;
      return available.filter(
        (s) =>
          String(s.name).toLowerCase().includes(filter) ||
          String(s.description ?? "")
            .toLowerCase()
            .includes(filter),
      );
    }),
  );
```

2段階のフィルタリング: (1) imported除外、(2) テキスト検索。`skillFilter` が空の場合は第2段階をスキップする。

### 3. Action設計

#### importSkill の状態遷移

```
importSkill(skillName):
  冪等ガード:
    importedSkills.some(s => s.name === skillName) === true の場合
    → availableSkillsMetadata から該当スキルを除外して return（IPCスキップ）

  正常フロー:
    1. set({ isImporting: true, importingSkillName: skillName, skillError: null })
    2. result = await window.electronAPI.skill.import(skillName)
    3a. 成功:
        set(state => ({
          importedSkills: [...state.importedSkills, imported],  // 重複チェック付き
          availableSkillsMetadata: state.availableSkillsMetadata.filter(
            s => s.name !== skillName
          ),
          isImporting: false,
          importingSkillName: null,
        }))
    3b. 失敗:
        set({
          skillError: formatErrorMessage(SKILL_ERRORS.IMPORT_FAILED, error),
          isImporting: false,
          importingSkillName: null,
        })
```

重要な設計判断:

- 成功時は**単一の `set()` 呼び出し**で4つのフィールドを同時更新する。これによりZustandの通知が1回で済み、中間状態が外部に見えない。
- 失敗時は throw せず、`skillError` にエラーメッセージを設定する（Non-throw failure契約）。

#### removeSkill の状態遷移

```
removeSkill(skillName):
  1. result = await window.electronAPI.skill.remove(skillName)
  2a. 成功:
      set(state => ({
        importedSkills: state.importedSkills.filter(s => s.name !== skillName),
        selectedSkillName: state.selectedSkillName === skillName
          ? null : state.selectedSkillName,
      }))
  2b. 失敗:
      set({ skillError: formatErrorMessage(SKILL_ERRORS.REMOVE_FAILED, error) })
```

#### clearSkillError

```
clearSkillError():
  set({ skillError: null })
```

#### fetchSkills

```
fetchSkills():
  1. set({ isLoadingSkills: true, skillError: null })
  2. [available, imported] = await Promise.all([skill.list(), skill.getImported()])
  3a. 成功: set({ availableSkillsMetadata, importedSkills, isLoadingSkills: false })
  3b. 失敗: set({ skillError: formatErrorMessage(...), isLoadingSkills: false })
```

#### 状態遷移図

```
[IDLE] ──importSkill()──> [IMPORTING]
  |                          |
  |                     ┌────┴────┐
  |                     |         |
  |                  SUCCESS   FAILURE
  |                     |         |
  |                     v         v
  |                  [IDLE]    [ERROR]
  |                              |
  |                     clearSkillError()
  |                              |
  |<─────────────────────────────┘
```

| 状態      | isImporting | skillError | importingSkillName | UI表示                       |
| --------- | ----------- | ---------- | ------------------ | ---------------------------- |
| IDLE      | `false`     | `null`     | `null`             | Importボタン有効             |
| IMPORTING | `true`      | `null`     | スキル名           | ローディング表示、ボタン無効 |
| SUCCESS   | `false`     | `null`     | `null`             | 一覧更新完了                 |
| ERROR     | `false`     | エラー文   | `null`             | エラーメッセージ表示         |

### 4. P31対策

#### 個別セレクタパターン（推奨）

```typescript
// 推奨: 個別セレクタで状態とアクションを取得
const importSkill = useImportSkill();
const isImporting = useIsImportingSkill();
const skillError = useSkillError();

// アクション呼び出し - 依存配列にアクション参照を含める（安定参照のため安全）
const handleImport = useCallback(
  (skillName: string) => {
    importSkill(skillName);
  },
  [importSkill],
);

// 状態監視 - プリミティブ値のみ依存配列に含める
useEffect(() => {
  if (skillError) {
    // エラートースト表示
  }
}, [skillError]);
```

#### 禁止パターン

```typescript
// NG: 合成Hookからの分割代入（毎回新しいオブジェクト参照）
const { importSkill, isImporting } = useSkillStore();

// NG: インラインセレクタでオブジェクト生成（毎回新しいオブジェクト参照）
const importState = useAppStore((state) => ({
  isImporting: state.isImporting,
  error: state.skillError,
}));
```

#### useShallow の適用基準

- `.filter()` や `.map()` を含む派生セレクタでは、毎回新しい配列参照が生成される
- `useShallow` を適用することで、浅い比較（shallow equality）により内容が同一であれば再レンダーを抑制する
- `useAvailableSkillsForImport` と `useFilteredAvailableSkills` の両派生セレクタに適用済み

#### useEffect 依存配列の制約

- Zustandのアクション関数（`state.importSkill` 等）は `createAgentSlice` 内で `set`/`get` を closure で捕捉した関数であり、参照は安定している
- そのため、個別セレクタ経由で取得したアクション関数を `useEffect` の依存配列に含めることは安全
- ただし、派生セレクタの戻り値（配列）を依存配列に含めることは推奨しない（`useShallow` 適用済みでも参照が変わりうる）

### 5. TASK-10A-F境界

Import ライフサイクル（本タスク）と Create/Analyze ライフサイクル（TASK-10A-F）は、同じ `agentSlice` 内に共存するが、操作する状態フィールドが明確に分離されている。

| 操作            | 本タスク管轄                 | TASK-10A-F管轄                          |
| --------------- | ---------------------------- | --------------------------------------- |
| Import/Remove   | `importSkill`, `removeSkill` | -                                       |
| Create          | -                            | `createSkill`                           |
| Analyze/Improve | -                            | `analyzeSkill`, `autoImproveSkill`      |
| 一覧再計算      | import成功後に即時更新       | create成功後に `fetchSkills()` 呼び出し |
| `isImporting`   | import操作で制御             | 変更しない                              |
| `isAnalyzing`   | 変更しない                   | analyze操作で制御                       |
| `isImproving`   | 変更しない                   | improve操作で制御                       |

`importSkill` の `set()` に `isAnalyzing` や `isImproving` を含めないことで、境界テストで検証可能な明確な分離を実現している。

### 6. エラー遷移

#### formatErrorMessage + SKILL_ERRORS定数パターン

```typescript
const SKILL_ERRORS = {
  FETCH_FAILED: "スキル一覧の取得に失敗",
  SCAN_FAILED: "スキル再スキャンに失敗",
  IMPORT_FAILED: "スキルのインポートに失敗",
  REMOVE_FAILED: "スキルの削除に失敗",
  EXECUTE_FAILED: "実行開始に失敗",
} as const;

function formatErrorMessage(prefix: string, error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return `${prefix}: ${message}`;
}
```

このパターンにより:

- エラーメッセージのプレフィックスが定数管理され、一貫性が保たれる
- `error` が `Error` インスタンスでない場合も安全に文字列化される
- エラーのソース（import/remove/fetch等）がメッセージから判別可能

#### エラー分類とUI表示の対応

| エラーカテゴリ         | コード範囲 | 例                           | UI表示方針          |
| ---------------------- | ---------- | ---------------------------- | ------------------- |
| Validation Error       | 1000-1999  | スキル名が空、不正な文字     | インラインエラー    |
| Business Error         | 2000-2999  | スキルが既に存在する         | トースト通知        |
| External Service Error | 3000-3999  | ファイルシステムアクセス失敗 | トースト + リトライ |
| Internal Error         | 5000-5999  | 予期しないエラー             | エラーダイアログ    |

#### エラーの責務分離

- **Store**: `skillError` にエラーメッセージを保持する（保持責務）
- **UI**: `skillError` を監視し、適切な表示方法を選択する（表示責務）
- **クリア**: ユーザーがエラーを確認した後、`clearSkillError()` で状態をリセット

### 7. テスト設計

Phase 9で全431テストがPASSしていることを確認済み。

#### テストファイル構成

| テストファイル                               | テスト数 | 検証内容                                       |
| -------------------------------------------- | -------- | ---------------------------------------------- |
| agentSlice.test.ts                           | 68       | 基本的な状態操作とアクション                   |
| agentSlice.selectors.test.ts                 | 122      | 個別セレクタと派生セレクタ（TASK-10A-E-C含む） |
| agentSlice.skill-lifecycle.test.ts           | 50       | analyze/improve/createライフサイクル           |
| agentSlice.skill-lifecycle-selectors.test.ts | 25       | TASK-10A-Dセレクタ                             |
| agentSlice.skill-integration.test.ts         | 59       | スキル機能の統合テスト                         |
| agentSlice.execution.test.ts                 | 19       | スキル実行フロー                               |
| agentSlice.preview.test.ts                   | 17       | プレビュー機能                                 |
| agentSlice.preview.edge-cases.test.ts        | 15       | プレビューエッジケース                         |
| agentSlice.permission.test.ts                | 12       | 権限管理                                       |
| agentSlice.edge-cases.test.ts                | 10       | エッジケース                                   |
| agentSlice.error-cases.test.ts               | 8        | エラーケース                                   |
| agentSlice.import-lifecycle.test.ts          | 7        | importライフサイクル状態遷移                   |
| agentSlice.p31-regression.test.ts            | 7        | P31無限ループ回帰テスト                        |
| agentSlice.combination.test.ts               | 5        | 組合せテスト                                   |
| agentSlice.boundary.test.ts                  | 4        | TASK-10A-F境界テスト                           |
| agentSlice.executeSkill.preflight.test.ts    | 3        | 実行前認証チェック                             |

#### 主要テスト観点

- **冪等ガードテスト**: 既にインポート済みのスキルに対する `importSkill` がIPCをスキップすること
- **連打防止テスト**: `isImporting === true` の間に `importSkill` が再実行されないこと
- **P31回帰テスト**: `useImportSkill` の参照が `renderHook` で2回取得しても `===` 同一参照であること
- **境界テスト**: import操作が `isAnalyzing`/`isImproving`/`currentAnalysis` に影響しないこと（4件）
- **派生セレクタテスト**: `useAvailableSkillsForImport` と `useFilteredAvailableSkills` がimported除外 + フィルタ適用を正しく行うこと

---

## 関連ファイルパス

| ファイル             | パス                                                                                                                        |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| agentSlice           | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                                                      |
| storeセレクタ        | `apps/desktop/src/renderer/store/index.ts`                                                                                  |
| Phase 1要件定義      | `docs/30-workflows/completed-tasks/task-043c-store-lifecycle-integration-design/outputs/phase-1/requirements-definition.md` |
| Phase 2設計          | `docs/30-workflows/completed-tasks/task-043c-store-lifecycle-integration-design/outputs/phase-2/architecture-design.md`     |
| Phase 9品質レポート  | `docs/30-workflows/completed-tasks/task-043c-store-lifecycle-integration-design/outputs/phase-9/quality-report.md`          |
| Phase 10最終レビュー | `docs/30-workflows/completed-tasks/task-043c-store-lifecycle-integration-design/outputs/phase-10/final-review-report.md`    |
