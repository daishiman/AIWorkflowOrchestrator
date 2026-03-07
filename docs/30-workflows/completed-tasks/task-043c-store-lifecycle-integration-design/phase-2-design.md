# Phase 2: 設計

## メタ情報

| 項目     | 値                                 |
| -------- | ---------------------------------- |
| Phase    | 2                                  |
| 機能名   | store-lifecycle-integration-design |
| タスクID | TASK-10A-E-C                       |
| 作成日   | 2026-03-06                         |

## 目的

Phase 1 で定義した機能要件・非機能要件に基づき、selector/action の具体的な設計、状態遷移図、および TASK-10A-F との責務境界の技術的な実現方針を定義する。

## 実行タスク

- selector 設計: imported / available / filtered の算出ロジックと型定義
- action 設計: importSkill / refreshSkillList / clearSkillError の内部フロー
- 状態遷移図: isImporting / skillError の遷移パターン
- TASK-10A-F 境界: create/analyze 経路との責務分離の技術的実現
- P31 対策: 個別セレクタと依存配列の具体的設計

## 参照資料

| 参照資料                  | パス                                                                                        | 使用目的                        |
| ------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------- |
| Phase 1 成果物            | `phase-1-requirements.md`                                                                   | 機能要件・非機能要件の正本      |
| 状態管理仕様              | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | selector/action 分離と P31 対策 |
| Skill API                 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | store action の戻り値契約       |
| IPC仕様                   | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | import/remove IPC チャネル契約  |
| Electron API セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | preload と IPC の安全境界       |
| UI機能仕様                | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | UI責務と store 境界整合         |
| テスト設計指針            | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`           | selector/action テストパターン  |
| 実装パターン              | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | React + store の責務分離        |
| エラー仕様                | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | UI 表示に渡すエラー分類         |
| 品質要件                  | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 状態遷移回帰を防ぐ品質ゲート    |

## 実行手順

### Step 1: Selector 設計

#### 1.1 個別セレクタ定義

`store/index.ts` に追加する個別セレクタ（既存セレクタとの重複を回避）:

| セレクタ名                   | 戻り値型            | 算出ロジック                             | 既存/新規 |
| ---------------------------- | ------------------- | ---------------------------------------- | --------- |
| `useImportedSkills`          | `ImportedSkill[]`   | `state.importedSkills`                   | 既存      |
| `useAvailableSkillsMetadata` | `SkillMetadata[]`   | `state.availableSkillsMetadata`          | 既存      |
| `useSkillFilter`             | `string`            | `state.skillFilter`                      | 既存      |
| `useIsImportingSkill`        | `boolean`           | `state.isImporting`                      | 既存      |
| `useImportingSkillName`      | `SkillName \| null` | `state.importingSkillName`               | 既存      |
| `useSkillError`              | `string \| null`    | `state.skillError`                       | 既存      |
| `useFilteredAvailableSkills` | `SkillMetadata[]`   | 派生: available から filter 適用（後述） | **新規**  |

#### 1.2 派生セレクタ: `useFilteredAvailableSkills`

available スキルにフィルターを適用する派生セレクタの設計:

```
入力: availableSkillsMetadata, skillFilter
出力: フィルター適用後の SkillMetadata[]
ロジック:
  1. skillFilter が空文字列の場合は availableSkillsMetadata をそのまま返す
  2. skillFilter を正規化（toLowerCase, trim）
  3. name または description にフィルター文字列を含むメタデータを抽出
```

**再レンダー最適化**: この派生セレクタは `availableSkillsMetadata` と `skillFilter` の両方に依存するため、どちらかが変更されるたびに再計算される。Zustand の `useShallow` を使用する場合、配列の参照比較では不十分なため、コンポーネント側で `useMemo` によるメモ化を検討する。

**設計判断**: 派生セレクタをコンポーネント外（store レベル）で定義するか、コンポーネント内（`useMemo`）で定義するかは以下の基準で判断する:

| 基準           | store レベル                     | コンポーネント内                   |
| -------------- | -------------------------------- | ---------------------------------- |
| 再利用性       | 複数コンポーネントで使用する場合 | 単一コンポーネントでのみ使用       |
| テスタビリティ | store テストで検証可能           | コンポーネントテストが必要         |
| 本タスクの方針 | -                                | **採用**（SkillImportDialog のみ） |

**結論**: `useFilteredAvailableSkills` は SkillImportDialog でのみ使用されるため、コンポーネント内での `useMemo` パターンを推奨する。ただし、複数コンポーネントで同じフィルタリングが必要になった場合は store レベルに昇格する。

### Step 2: Action 設計

#### 2.1 importSkill アクション内部フロー

```
importSkill(skillName: SkillName):
  PRE-CONDITION:
    - isImporting === false（連打防止）
    - importedSkills.some(s => s.name === skillName) === false（idempotency）

  FLOW:
    1. set({ isImporting: true, importingSkillName: skillName, skillError: null })
    2. result = await window.electronAPI.skill.import(skillName)  // IPC呼び出し
    3a. SUCCESS:
        set(state => ({
          importedSkills: [...state.importedSkills, imported],  // 重複チェック付き
          availableSkillsMetadata: state.availableSkillsMetadata.filter(
            s => s.name !== skillName
          ),
          isImporting: false,
          importingSkillName: null,
        }))
    3b. FAILURE:
        set({
          skillError: error.message,
          isImporting: false,
          importingSkillName: null,
        })

  POST-CONDITION:
    - isImporting === false
    - importingSkillName === null
    - SUCCESS: importedSkills に新スキルが含まれ、availableSkillsMetadata から除外
    - FAILURE: skillError にエラーメッセージが設定
```

**Non-throw failure 契約**: `importSkill` は IPC の戻り値が失敗を示す場合も throw せず、`skillError` に設定する。呼び出し元は `skillError` の変化を監視して UI にエラーを表示する。

#### 2.2 refreshSkillList アクション

既存の `fetchAvailableSkillsMetadata` を再利用する。追加のアクションは不要。

```
refreshSkillList():
  = fetchAvailableSkillsMetadata()  // 既存アクションのエイリアス
```

#### 2.3 clearSkillError アクション

```
clearSkillError():
  set({ skillError: null })
```

既存実装済み。変更不要。

#### 2.4 removeSkill アクション内部フロー

```
removeSkill(skillName: SkillName):
  PRE-CONDITION:
    - importedSkills.some(s => s.name === skillName) === true

  FLOW:
    1. result = await window.electronAPI.skill.remove(skillName)
    2a. SUCCESS:
        set(state => ({
          importedSkills: state.importedSkills.filter(s => s.name !== skillName),
        }))
        // availableSkillsMetadata は次回 fetchAvailableSkillsMetadata で再取得
    2b. FAILURE:
        set({ skillError: error.message })
```

### Step 3: 状態遷移図

#### 3.1 Import ライフサイクル状態遷移

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

#### 3.2 状態と UI の対応

| 状態      | isImporting | skillError | importingSkillName | UI 表示                      |
| --------- | ----------- | ---------- | ------------------ | ---------------------------- |
| IDLE      | `false`     | `null`     | `null`             | Import ボタン有効            |
| IMPORTING | `true`      | `null`     | スキル名           | ローディング表示、ボタン無効 |
| SUCCESS   | `false`     | `null`     | `null`             | 一覧更新完了                 |
| ERROR     | `false`     | エラー文   | `null`             | エラーメッセージ表示         |

#### 3.3 Idempotency Guard 遷移

```
importSkill("already-imported"):
  PRE: importedSkills.some(s => s.name === "already-imported") === true
  ACTION:
    1. availableSkillsMetadata から該当スキルを除外（UI整合性のため）
    2. IPC 呼び出しをスキップ
    3. return（状態遷移なし）
```

### Step 4: TASK-10A-F 境界の技術的実現

#### 4.1 agentSlice 内の責務境界

agentSlice は単一の Slice であるが、内部的に以下の責務グループに分割される:

| グループ               | 状態フィールド                                                                       | アクション                                                                          | 管轄タスク   |
| ---------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | ------------ |
| Import ライフサイクル  | `isImporting`, `importingSkillName`, `importedSkills`, `availableSkillsMetadata`     | `importSkill`, `removeSkill`, `fetchAvailableSkillsMetadata`                        | TASK-10A-E-C |
| Create ライフサイクル  | （既存: 特別な状態フィールドなし）                                                   | `createSkill`                                                                       | TASK-10A-F   |
| Analyze ライフサイクル | `currentAnalysis`, `isAnalyzing`, `isImproving`                                      | `analyzeSkill`, `applySkillImprovements`, `autoImproveSkill`, `clearAnalysis`       | TASK-10A-F   |
| 共通                   | `skills`, `selectedSkill`, `skillFilter`, `skillCategory`, `skillError`, `isLoading` | `setSkills`, `selectSkill`, `setSkillFilter`, `setSkillCategory`, `clearSkillError` | 共有         |

#### 4.2 `skillError` 共有の設計指針

- `skillError` は全グループが書き込み可能な共有フィールドとする
- 後勝ち（last-write-wins）方式で、最新のエラーが表示される
- エラーのソースを区別する必要がある場合は、エラーメッセージにプレフィックスを含める（例: `"Import failed: ..."`, `"Analysis failed: ..."`）
- 将来的にエラーソース別の分離が必要になった場合は、`importError` / `analyzeError` への分割を検討する（本タスクのスコープ外）

#### 4.3 一覧再計算の交差点

- Import 成功後: `importedSkills` と `availableSkillsMetadata` を即時更新（本タスク管轄）
- Create 成功後: `fetchAvailableSkillsMetadata()` を呼び出して一覧を再取得（TASK-10A-F 管轄）
- 両経路とも最終的に同じ状態フィールドを更新するため、整合性は保たれる

### Step 5: P31 対策の具体的設計

#### 5.1 個別セレクタの安定参照保証

Zustand の `useAppStore((state) => state.actionName)` は、`actionName` が Slice 作成時に `set` / `get` を closure で捕捉した関数であるため、参照は安定している。

```typescript
// store/index.ts - 個別セレクタ定義
export const useImportSkill = () => useAppStore((state) => state.importSkill);
// state.importSkill は createAgentSlice 内で一度だけ生成されるため参照安定
```

#### 5.2 コンポーネント側の useEffect パターン

```typescript
// SkillManagementPanel.tsx - 推奨パターン
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

#### 5.3 禁止パターン

```typescript
// NG: 合成 Hook からの分割代入
const { importSkill, isImporting } = useSkillStore(); // 毎回新しいオブジェクト

// NG: インラインセレクタでオブジェクト生成
const importState = useAppStore((state) => ({
  isImporting: state.isImporting,
  error: state.skillError,
})); // 毎回新しいオブジェクト参照
```

### Step 6: エラーハンドリング設計

#### 6.1 エラー分類と UI 表示

| エラーカテゴリ         | コード範囲 | 例                           | UI 表示方針         |
| ---------------------- | ---------- | ---------------------------- | ------------------- |
| Validation Error       | 1000-1999  | スキル名が空、不正な文字     | インラインエラー    |
| Business Error         | 2000-2999  | スキルが既に存在する         | トースト通知        |
| External Service Error | 3000-3999  | ファイルシステムアクセス失敗 | トースト + リトライ |
| Internal Error         | 5000-5999  | 予期しないエラー             | エラーダイアログ    |

#### 6.2 エラー保持と表示の責務分離

- **Store**: `skillError` にエラーメッセージを保持する（保持責務）
- **UI**: `skillError` を監視し、適切な表示方法を選択する（表示責務）
- **クリア**: ユーザーがエラーを確認した後、`clearSkillError()` で状態をリセット

## 統合テスト連携

Phase 4（テスト作成）で以下の設計をテスト対象とする:

| テスト対象         | 検証内容                                                 |
| ------------------ | -------------------------------------------------------- |
| importSkill フロー | PRE-CONDITION → IMPORTING → SUCCESS/FAILURE の遷移       |
| idempotency guard  | 既存スキルに対する importSkill が IPC をスキップすること |
| 連打防止           | isImporting === true 時に importSkill が実行されないこと |
| selector 安定参照  | 個別セレクタの参照が re-render 間で安定していること      |
| TASK-10A-F 境界    | import 操作が isAnalyzing/isImproving に影響しないこと   |
| エラークリア       | clearSkillError 後に skillError が null になること       |

## 多角的チェック観点

| 観点             | 確認内容                                                     |
| ---------------- | ------------------------------------------------------------ |
| 状態遷移完全性   | IDLE/IMPORTING/SUCCESS/ERROR 全遷移パスが定義されているか    |
| P31 対策         | 全セレクタが個別 Hook として定義されているか                 |
| 境界明確性       | Import/Create/Analyze の責務グループが明確に分離されているか |
| エラー設計       | error-handling.md のカテゴリ体系と整合するか                 |
| 既存互換         | 既存の agentSlice アクション・セレクタと矛盾しないか         |
| 再レンダー最適化 | 不要な re-render を引き起こす設計がないか                    |

## 成果物

| 成果物 | パス                | 説明           |
| ------ | ------------------- | -------------- |
| 設計書 | `phase-2-design.md` | 本ドキュメント |

## 完了条件

- [x] selector の算出ロジックと型定義が具体的に設計されている
- [x] action の内部フロー（PRE/FLOW/POST）が定義されている
- [x] 状態遷移図が IDLE/IMPORTING/SUCCESS/ERROR を網羅している
- [x] TASK-10A-F との境界が技術的に実現可能な形で設計されている
- [x] P31 対策が具体的なコードパターン（推奨/禁止）で示されている
- [x] エラーハンドリングが error-handling.md のカテゴリ体系と整合している
- [x] 本タスクは仕様策定のみで実装を行わないことが前提である

## 次の Phase

Phase 3: 設計レビュー (`phase-3-design-review.md`)
