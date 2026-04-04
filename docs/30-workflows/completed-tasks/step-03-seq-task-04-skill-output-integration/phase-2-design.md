# Phase 2: 設計 -- Skill Output Integration

## メタ情報

| 項目       | 値                       |
| ---------- | ------------------------ |
| Phase番号  | 2                        |
| 機能名     | skill-output-integration |
| タスクID   | TASK-SDK-SC-04           |
| 作成日     | 2026-04-02               |
| 依存 Phase | Phase 1（要件定義）      |

## 目的

Phase 1 で確定した要件（FR-001 から FR-006）を満たすための具体的な型定義・クラス設計・コンポーネント設計・IPC チャネル定数設計を定義する。

## 実行タスク

### Task 2-1: `ParsedSkillOutput` 型定義設計

```typescript
// packages/shared/src/types/skillCreator.ts への追加

/**
 * SDK セッション出力から抽出されたスキル定義
 */
export interface ParsedSkillOutput {
  /** スキル名（SKILL.md の name フィールドから取得） */
  name: string;
  /** SKILL.md の全内容 */
  content: string;
  /** 保存先ディレクトリ名（スキル名をスラッグ化したもの） */
  dirName: string;
}

/**
 * skill-creator:output-ready IPC ペイロード
 */
export interface SkillOutputReadyPayload {
  /** スキル名 */
  skillName: string;
  /** 保存先のフルパス */
  savedPath: string;
  /** SKILL.md 内容（プレビュー用） */
  content: string;
  /** 既存スキルの上書き確認が必要か */
  requiresOverwriteConfirm: boolean;
}
```

### Task 2-2: `SkillCreatorOutputHandler` クラス設計

#### クラス概要

```typescript
// apps/desktop/src/main/services/runtime/SkillCreatorOutputHandler.ts

export class SkillCreatorOutputHandler {
  constructor(
    private readonly projectRoot: string,
    private readonly skillRegistry: SkillRegistry,
    private readonly webContents: Electron.WebContents,
  ) {}

  /**
   * SDK セッション出力テキストからスキル定義を抽出する
   * <!-- SKILL_START: {skillName} --> ... <!-- SKILL_END: {skillName} --> マーカーで囲まれた範囲を取得
   * マーカーが存在しない場合は FR-001-B フォールバック戦略（アシスタントメッセージ全体）を適用する
   * フォールバックでも name: フィールドが見つからない場合は null を返す
   */
  extractSkillFromOutput(sessionOutput: string): ParsedSkillOutput | null;

  /**
   * 抽出したスキル定義をファイルシステムに保存する
   * @returns 保存先のフルパス
   */
  saveSkill(skill: ParsedSkillOutput): Promise<string>;

  /**
   * 保存済みスキルを SkillRegistry に登録する
   */
  registerToRegistry(skillPath: string): Promise<void>;

  /**
   * スキル保存・登録完了後に IPC 通知を送信する
   */
  notifyOutputReady(payload: SkillOutputReadyPayload): void;

  /**
   * 上書き確認後に保存・登録を再開する
   */
  handleOverwriteApproved(payload: SkillOutputReadyPayload): Promise<void>;

  /**
   * SDK セッション完了時のメインエントリポイント
   * extract → 上書き確認判定 → save/register/notify、必要時は confirm 後に再開
   * @param sessionOutput SDK セッションの出力テキスト
   */
  handleSessionComplete(sessionOutput: string): Promise<void>;
}
```

#### スキル出力パース戦略

```
セッション出力テキスト
  ↓
<!-- SKILL_START: {skillName} --> マーカーを検索（PC-001 完了後の正常系）
  ├─ 存在する
  │    ↓
  │  <!-- SKILL_END: {skillName} --> マーカーまでの範囲を抽出
  │    ↓
  │  マーカー属性 {skillName} を取得（取得できない場合は name: フィールドにフォールバック）
  │    ↓
  │  dirName = skillName をスラッグ化（小文字・ハイフン区切り）
  │    ↓
  │  ParsedSkillOutput を返す
  │
  └─ 存在しない → FR-001-B フォールバック戦略を適用
       ↓
     アシスタントメッセージ全体をスキル内容として扱う（戦略 B）
       ↓
     SKILL.md 内容から name: フィールドを正規表現で取得
       ├─ 取得できない → null を返す（処理スキップ・UI エラー通知）
       └─ 取得できる
            ↓
          dirName = name をスラッグ化（小文字・ハイフン区切り）
            ↓
          ParsedSkillOutput を返す（content = 出力テキスト全体）
```

#### 上書き確認フロー

```
  saveSkill() 呼び出し前
  ↓
.claude/skills/{dirName}/SKILL.md が存在するか確認
  ├─ 存在しない → requiresOverwriteConfirm: false でそのまま保存
  └─ 存在する   → requiresOverwriteConfirm: true を設定
                    ↓
                  UI で確認ダイアログ表示（FR-006）
                    ↓
                  ユーザーが承認 → handleOverwriteApproved(payload) を再呼び出し
                    ↓
                  保存・登録を実行
                  ユーザーがキャンセル → 処理中断
```

### Task 2-3: `SkillRegistry.ts` 更新設計

既存の `SkillRegistry` クラスに以下のメソッドを追加する。

```typescript
// apps/desktop/src/main/services/runtime/SkillRegistry.ts

/**
 * SKILL.md のファイルパスからスキルを登録（または更新）する
 * 既存スキルが存在する場合は上書きする
 * @param skillPath SKILL.md のフルパス
 */
async registerFromPath(skillPath: string): Promise<void>;
```

### Task 2-4: `SkillCreatorResultPanel` コンポーネント設計

```typescript
// apps/desktop/src/renderer/components/skill-creator/SkillCreatorResultPanel.tsx

interface SkillCreatorResultPanelProps {
  /** IPC 通知から受け取ったペイロード */
  payload: SkillOutputReadyPayload | null;
  /** 「スキルを開く」ボタンクリック時のコールバック */
  onOpenSkill: (savedPath: string) => void;
  /** 上書き確認時に Main へ保存続行を依頼するコールバック */
  onConfirmOverwrite: (payload: SkillOutputReadyPayload) => void;
}

export const SkillCreatorResultPanel: React.FC<SkillCreatorResultPanelProps>;
```

#### コンポーネント構成

```
SkillCreatorResultPanel
  ├─ payload が null の場合: null（非表示）
  └─ payload が存在する場合:
       ├─ 見出し: "スキルを生成しました: {skillName}"
       ├─ 保存先パス表示: savedPath
       ├─ SKILL.md プレビュー（コードブロック or マークダウンレンダリング）
       ├─ 「スキルを開く」ボタン → onOpenSkill(savedPath) 呼び出し
       ├─ requiresOverwriteConfirm === true の場合: 「上書きして保存」ボタン表示 → onConfirmOverwrite(payload) 呼び出し
       └─ requiresOverwriteConfirm === true の場合: 上書き確認バナー表示
```

### Task 2-5: IPC チャネル定数設計

```typescript
// packages/shared/src/ipc/channels.ts への追記

// --- Skill Creator: 出力統合 ---
export const SKILL_CREATOR_OUTPUT_READY = "skill-creator:output-ready" as const;
```

命名規則の根拠:

- 既存の `skill-creator:*` 命名規則に準拠
- `output-ready` は「スキル出力の準備完了」を表す意味的に明確な名称

### Task 2-6: 変更ファイル一覧

| ファイルパス                                                                     | 変更種別 | 変更内容                                             |
| -------------------------------------------------------------------------------- | -------- | ---------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/SkillCreatorOutputHandler.ts`            | 新規作成 | スキル出力捕捉・保存・登録・通知ハンドラー           |
| `apps/desktop/src/renderer/components/skill-creator/SkillCreatorResultPanel.tsx` | 新規作成 | スキル生成完了通知・プレビュー表示コンポーネント     |
| `apps/desktop/src/main/services/runtime/SkillRegistry.ts`                        | 更新     | `registerFromPath()` メソッド追加                    |
| `packages/shared/src/ipc/channels.ts`                                            | 更新     | `SKILL_CREATOR_OUTPUT_READY` 定数追記                |
| `packages/shared/src/types/skillCreator.ts`                                      | 更新     | `ParsedSkillOutput` / `SkillOutputReadyPayload` 追加 |

## 参照資料

| 資料名           | パス                                                      |
| ---------------- | --------------------------------------------------------- |
| Phase 1 要件定義 | `./phase-1-requirements.md`                               |
| 既存 channels.ts | `packages/shared/src/ipc/channels.ts`                     |
| SkillRegistry.ts | `apps/desktop/src/main/services/runtime/SkillRegistry.ts` |

## 成果物

| 成果物               | パス                  | 形式     |
| -------------------- | --------------------- | -------- |
| 設計書（本ファイル） | `./phase-2-design.md` | Markdown |

## 完了条件

- [ ] `ParsedSkillOutput` / `SkillOutputReadyPayload` 型を設計した
- [ ] `SkillCreatorOutputHandler` の全メソッドシグネチャを設計した
- [ ] スキル出力パース戦略（マーカー検出フロー）を設計した
- [ ] 上書き確認フローを設計した
- [ ] `SkillRegistry.registerFromPath()` の追加設計をした
- [ ] `SkillCreatorResultPanel` コンポーネントを設計した
- [ ] `SKILL_CREATOR_OUTPUT_READY` IPC 定数を設計した
- [ ] 変更対象ファイルが 5 ファイルのみであることを確認した

## 次の Phase: Phase 3 (phase-3-design-review.md)
