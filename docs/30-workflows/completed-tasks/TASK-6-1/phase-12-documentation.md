# Phase 12: ドキュメント更新 - SkillSlice実装

## ドキュメント概要

SkillSlice実装に関する技術ドキュメントを作成し、システム仕様書を更新する。

## Task 1: 実装ガイド作成

### Part 1: 概念説明（中学生レベル）

#### SkillSliceとは？

**日常の例え話**:

お弁当箱を想像してください。お弁当箱には「おかず」「ご飯」「デザート」と仕切りがあります。SkillSliceは、アプリの中で「スキル」に関する情報を整理して入れておく「仕切り」のようなものです。

- **availableSkills**: お弁当に入れられる料理のリスト（まだ入れていない）
- **importedSkills**: 実際にお弁当に入れた料理のリスト
- **selectedSkillName**: 今食べようとしている料理の名前
- **isExecuting**: 今まさに料理を食べているかどうか

#### なぜ必要なの？

アプリでスキル（AIにお願いできる機能）を使うとき、いろんな情報を覚えておく必要があります：

1. どんなスキルが使えるの？
2. どのスキルを選んだの？
3. 今スキルを実行中？
4. 結果はどうなった？

これらの情報をバラバラに管理すると混乱してしまいます。SkillSliceは、これらを一箇所にまとめて管理する「整理箱」の役割をしています。

#### どうやって使うの？

1. **fetchSkills**: 「使えるスキルのリストを見せて」とお願いする
2. **importSkill**: 「このスキルを使えるようにして」とお願いする
3. **selectSkill**: 「このスキルを選ぶ」と決める
4. **executeSkill**: 「選んだスキルを実行して」とお願いする

### Part 2: 技術詳細

#### インターフェース定義

```typescript
export interface SkillSlice {
  // 状態
  availableSkills: SkillMetadata[];
  importedSkills: ImportedSkill[];
  selectedSkillName: string | null;
  isExecuting: boolean;
  executionId: string | null;
  executionStatus: SkillExecutionStatus | null;
  streamingMessages: SkillStreamMessage[];
  pendingPermission: SkillPermissionRequest | null;
  skillError: string | null;

  // ローディング状態
  isLoadingSkills: boolean;
  isScanning: boolean;
  isImporting: boolean;
  importingSkillName: string | null;

  // アクション
  fetchSkills: () => Promise<void>;
  rescanSkills: () => Promise<void>;
  importSkill: (skillName: string) => Promise<void>;
  removeSkill: (skillName: string) => Promise<void>;
  selectSkill: (skillName: string | null) => void;
  executeSkill: (prompt: string) => Promise<void>;
  abortExecution: () => void;
  respondToPermission: (approved: boolean, remember?: boolean) => void;
  clearError: () => void;
  clearStreamingMessages: () => void;

  // 内部アクション
  _handleStreamMessage: (msg: SkillStreamMessage) => void;
  _handleComplete: (executionId: string) => void;
  _handleError: (executionId: string, error: string) => void;
  _handlePermissionRequest: (req: SkillPermissionRequest) => void;
}
```

#### 使用例

```typescript
// コンポーネント内での使用
import { useAppStore } from "@/renderer/store";

function SkillExecutor() {
  const {
    importedSkills,
    selectedSkillName,
    isExecuting,
    selectSkill,
    executeSkill,
  } = useAppStore();

  const handleExecute = async (prompt: string) => {
    if (!selectedSkillName) return;
    await executeSkill(prompt);
  };

  return (
    <div>
      <select
        value={selectedSkillName || ""}
        onChange={(e) => selectSkill(e.target.value || null)}
      >
        <option value="">スキルを選択</option>
        {importedSkills.map((skill) => (
          <option key={skill.name} value={skill.name}>
            {skill.name}
          </option>
        ))}
      </select>
      <button onClick={() => handleExecute("テストプロンプト")} disabled={isExecuting}>
        {isExecuting ? "実行中..." : "実行"}
      </button>
    </div>
  );
}
```

#### エラーハンドリング

```typescript
// エラー状態の監視と表示
function SkillErrorDisplay() {
  const { skillError, clearError } = useAppStore();

  if (!skillError) return null;

  return (
    <div className="error-banner">
      <p>{skillError}</p>
      <button onClick={clearError}>閉じる</button>
    </div>
  );
}
```

#### IPCリスナーの設定

```typescript
// アプリ初期化時
import { setupSkillListeners } from "@/renderer/store/setupSkillListeners";

function App() {
  useEffect(() => {
    const cleanup = setupSkillListeners();
    return cleanup; // アンマウント時にリスナーを解除
  }, []);

  return <MainLayout />;
}
```

## Task 2: システム仕様書更新

### Step 1: タスク完了記録

#### 1-A: 完了タスクセクション更新

```markdown
## 完了タスク

### TASK-6-1: SkillSlice実装（Zustand）

- **完了日**: YYYY-MM-DD
- **成果物**:
  - `apps/desktop/src/renderer/store/slices/skillSlice.ts`
  - `apps/desktop/src/renderer/store/setupSkillListeners.ts`
  - `apps/desktop/src/renderer/store/index.ts`（修正）
- **テスト**: skillSlice.test.ts, skillSlice.edge-cases.test.ts
- **カバレッジ**: XX%
```

#### 1-B: 実装状況テーブル更新

| 機能               | ステータス | 担当タスク | 備考 |
| ------------------ | ---------- | ---------- | ---- |
| SkillSlice状態管理 | ✅ 完了    | TASK-6-1   |      |
| IPCリスナー設定    | ✅ 完了    | TASK-6-1   |      |
| Store統合          | ✅ 完了    | TASK-6-1   |      |

### Step 2: システム仕様更新（必要な場合）

#### 更新対象の判断

| チェック項目             | 該当 | 対象仕様書                |
| ------------------------ | ---- | ------------------------- |
| 新規インターフェース追加 | [ ]  | interfaces-skill-slice.md |
| 既存インターフェース変更 | [ ]  | interfaces-\*.md          |
| 新規定数/設定値追加      | [ ]  | constants.md              |
| API仕様の変更            | [ ]  | api-\*.md                 |

#### 更新内容（該当する場合）

```markdown
## SkillSlice インターフェース

### 状態

| プロパティ        | 型              | 説明                     |
| ----------------- | --------------- | ------------------------ |
| availableSkills   | SkillMetadata[] | 利用可能なスキル一覧     |
| importedSkills    | ImportedSkill[] | インポート済みスキル一覧 |
| selectedSkillName | string \| null  | 選択中のスキル名         |
| ...               | ...             | ...                      |

### アクション

| アクション  | 引数              | 戻り値        | 説明             |
| ----------- | ----------------- | ------------- | ---------------- |
| fetchSkills | なし              | Promise<void> | スキル一覧取得   |
| importSkill | skillName: string | Promise<void> | スキルインポート |
| ...         | ...               | ...           | ...              |
```

## Task 3: ドキュメント更新履歴作成

### artifacts.json更新

Phase完了時に `complete-phase.js` を使用して更新：

```bash
node scripts/complete-phase.js \
  --workflow docs/30-workflows/skill-import-agent-system \
  --phase 12 \
  --artifacts "phase-12-documentation.md:Phase 12 ドキュメント更新"
```

### LOGS.md更新

#### aiworkflow-requirements/LOGS.md

```markdown
## 2026-XX-XX

### TASK-6-1: SkillSlice実装

- interfaces-skill-slice.md: 新規追加（該当する場合）
- architecture-frontend.md: SkillSlice統合を反映
```

#### task-specification-creator/LOGS.md

```markdown
## 2026-XX-XX

### TASK-6-1: SkillSlice実装完了

- Phase 1-13完了
- テストカバレッジ: XX%
- 成果物: skillSlice.ts, setupSkillListeners.ts
```

## Task 4: 未タスク検出レポート

### 検出スクリプト実行

```bash
node scripts/detect-unassigned-tasks.js \
  --scan apps/desktop/src/renderer/store/slices \
  --output .tmp/unassigned-candidates.json
```

### 検出結果

| ソース             | 検出事項 | 対応 |
| ------------------ | -------- | ---- |
| Phase 3レビュー    |          |      |
| Phase 10レビュー   |          |      |
| Phase 11手動テスト |          |      |
| コードコメント     |          |      |

### 未タスク一覧（0件でも出力必須）

```markdown
## 未タスク検出レポート

検出日: YYYY-MM-DD
対象: TASK-6-1 SkillSlice実装

### 検出された未タスク

なし / 以下の通り：

1. （あれば記載）
```

## 完了条件

| 条件                                        | 状態 |
| ------------------------------------------- | ---- |
| Task 1: 実装ガイド（Part 1 + Part 2）完成   | [ ]  |
| Task 2: システム仕様書更新完了              | [ ]  |
| Task 3: ドキュメント更新履歴作成            | [ ]  |
| Task 4: 未タスク検出レポート作成（0件含む） | [ ]  |
| artifacts.json更新                          | [ ]  |
| LOGS.md更新（両方）                         | [ ]  |
