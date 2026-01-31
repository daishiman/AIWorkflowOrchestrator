# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目      | 内容                           |
| --------- | ------------------------------ |
| Phase     | 5                              |
| Phase名   | 実装                           |
| カテゴリ  | TDD-Green                      |
| 機能名    | TASK-7D-chat-panel-integration |
| 作成日    | 2026-01-30                     |
| 前提Phase | Phase 4                        |
| 後続Phase | Phase 6                        |

## 目的

Phase 4 で作成した失敗テストを全て Green にするために、ChatPanel の修正と SkillStreamingView コンポーネントを実装する。

## 実行タスク

### タスク1: SkillStreamingView コンポーネント実装

**目的**: スキル実行結果のストリーミング表示コンポーネントを新規作成する。

**手順**:

1. `apps/desktop/src/renderer/components/skill/SkillStreamingView.tsx` を作成する
2. SkillStreamingView のメインコンポーネントを実装する:

```typescript
// Props インターフェース
interface SkillStreamingViewProps {
  skillName: string;
  messages: SkillStreamMessage[];
  status: SkillExecutionStatus | null;
}
```

3. StatusBadge サブコンポーネントを実装する:
   - `status` に応じた色（bg-blue-500/bg-yellow-500/bg-green-500/bg-gray-500/bg-red-500）とラベル（実行中.../権限確認/完了/キャンセル/エラー）を表示する
   - `status` が `null` または `"idle"` の場合は `null` を返す

4. StreamMessageItem サブコンポーネントを実装する:
   - `message.type` で switch 分岐する
   - `"assistant"`: `message.content.text` を表示し、`message.content.isPartial` が `true` の場合は `▌` カーソル（`animate-pulse`）を追加する
   - `"tool_use"`: `🔧 ツール使用: {message.content.toolName}` を bg-blue-50 で表示する
   - `"tool_result"`: 成功時 `✅ 完了`（bg-green-50）、失敗時 `❌ エラー: {message.content.error}`（bg-red-50）を表示する
   - `"error"`: エラーメッセージを bg-red-50、text-red-600 で表示する
   - `default`: `null` を返す

5. ToolExecutionHistory サブコンポーネントを実装する:
   - `<details>` / `<summary>` で折りたたみ表示する
   - tool_use と tool_result のメッセージをフィルタリングして表示する
   - ツール数は `toolMessages.length / 2` で計算する
   - ツールメッセージがゼロの場合は `null` を返す

6. 中止ボタンを実装する:
   - `useAppStore` から `abortExecution` を取得する
   - `status === "running"` の場合のみ表示する
   - クリック時に `abortExecution()` を呼び出す
   - `type="button"` を指定する

7. アクセシビリティ属性を追加する:
   - ストリーミング表示エリア: `role="log"`, `aria-live="polite"`, `aria-label="スキル実行結果"`
   - 中止ボタン: `aria-label="スキル実行を中止する"`
   - StatusBadge: `role="status"`

**期待される成果物**:

- `apps/desktop/src/renderer/components/skill/SkillStreamingView.tsx`

### タスク2: ChatPanel コンポーネント修正

**目的**: 既存の ChatPanel に SkillSelector、SkillImportDialog、PermissionDialog、SkillStreamingView を統合する。

**手順**:

1. `apps/desktop/src/renderer/components/chat/ChatPanel.tsx` を修正する（存在しない場合は新規作成する）
2. 必要なインポートを追加する:

```typescript
import { SkillSelector } from "../skill/SkillSelector";
import { SkillImportDialog } from "../skill/SkillImportDialog";
import { PermissionDialog } from "../skill/PermissionDialog";
import { SkillStreamingView } from "../skill/SkillStreamingView";
import { useAppStore } from "../../store";
```

3. Store からの状態取得を実装する:

```typescript
const {
  selectedSkillName,
  streamingMessages,
  isExecuting,
  skillExecutionStatus,
  fetchSkills,
} = useAppStore();
```

4. ローカル state を定義する:

```typescript
const [importDialogSkill, setImportDialogSkill] =
  useState<SkillMetadata | null>(null);
```

5. useEffect でスキル一覧を取得する:

```typescript
useEffect(() => {
  fetchSkills();
}, [fetchSkills]);
```

6. JSX 構造を実装する:
   - ヘッダー: `<div className="flex items-center gap-4 px-4 py-2 border-b">` に ModelSelector と SkillSelector を配置する
   - メッセージ領域: `<div className="flex-1 overflow-y-auto">` に MessageList と条件付き SkillStreamingView を配置する
   - SkillStreamingView 表示条件: `isExecuting && selectedSkillName` が truthy の場合のみ表示する
   - 入力領域: ChatInput を配置する
   - ダイアログ: SkillImportDialog（importDialogSkill で制御）と PermissionDialog（常時マウント）を配置する

7. SkillSelector の `onImportRequest` コールバックを実装する:
   - `(skill) => setImportDialogSkill(skill)` を渡す

8. SkillImportDialog の Props を設定する:
   - `skill={importDialogSkill}`
   - `isOpen={importDialogSkill !== null}` または `{true}`（importDialogSkill が存在する場合のみレンダリングするため）
   - `onClose={() => setImportDialogSkill(null)}`

**期待される成果物**:

- `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`（修正）

### タスク3: skill/index.ts エクスポート更新

**目的**: SkillStreamingView のエクスポートを追加する。

**手順**:

1. `apps/desktop/src/renderer/components/skill/index.ts` を読み込む
2. 以下のエクスポートを追加する:

```typescript
export { SkillStreamingView } from "./SkillStreamingView";
```

**期待される成果物**:

- `apps/desktop/src/renderer/components/skill/index.ts`（修正）

### タスク4: テスト Green 確認

**目的**: Phase 4 で作成した全テストが Green（成功）することを確認する。

**手順**:

1. 以下のコマンドでテストを実行する:

```bash
pnpm --filter @repo/desktop vitest run apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.test.tsx
pnpm --filter @repo/desktop vitest run apps/desktop/src/renderer/components/skill/__tests__/SkillStreamingView.test.tsx
```

2. 全テストが PASS であることを確認する
3. 失敗しているテストがある場合は、実装を修正して再度テストを実行する

**期待される成果物**:

- テスト実行結果ログ（全 Green）

### タスク5: TypeScript 型チェック

**目的**: 実装した全ファイルの型チェックが通ることを確認する。

**手順**:

1. 以下のコマンドで型チェックを実行する:

```bash
pnpm --filter @repo/desktop typecheck
```

2. 型エラーがゼロであることを確認する
3. 型エラーがある場合は修正する

**期待される成果物**:

- 型チェック結果ログ（エラーゼロ）

## 参照資料

| 参照資料                   | パス                                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------- |
| Phase 2 設計成果物         | `outputs/phase-2/` ディレクトリ全体                                                   |
| Phase 4 テストファイル     | `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.test.tsx`              |
| Phase 4 テストファイル     | `apps/desktop/src/renderer/components/skill/__tests__/SkillStreamingView.test.tsx`    |
| タスク定義書               | `docs/30-workflows/skill-import-agent-system/tasks/task-7d-chat-panel-integration.md` |
| 既存 SkillSelector 実装    | `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`                        |
| 既存 PermissionDialog 実装 | `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx`                     |
| 既存 skillSlice 実装       | `apps/desktop/src/renderer/store/slices/skillSlice.ts`                                |
| 共有型定義                 | `packages/shared/src/types/skill.ts`                                                  |

## 統合テスト連携

### このフェーズで確認すべき統合テスト観点

| カテゴリ     | 確認項目                                                             |
| ------------ | -------------------------------------------------------------------- |
| データフロー | Store → ChatPanel → SkillStreamingView の Props 渡しが正しいか       |
| イベント連携 | onImportRequest → setImportDialogSkill → SkillImportDialog 表示      |
| 型整合性     | SkillStreamMessage の discriminated union が正しく型チェックを通るか |

## 多角的観点チェック

### Renderer（フロントエンド）層

| 観点         | 確認項目                                                                            |
| ------------ | ----------------------------------------------------------------------------------- |
| ファイル配置 | SkillStreamingView は `components/skill/` に配置（Atomic Design 準拠）              |
| 状態管理     | useAppStore からの destructuring が既存パターン（SkillSelector 等）と一致しているか |
| コード品質   | ESLint/Prettier が通ること、any 型を使用していないこと                              |

## 成果物

| 成果物                 | パス                                                                | 種別 |
| ---------------------- | ------------------------------------------------------------------- | ---- |
| SkillStreamingView     | `apps/desktop/src/renderer/components/skill/SkillStreamingView.tsx` | code |
| ChatPanel（修正）      | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`           | code |
| skill/index.ts（修正） | `apps/desktop/src/renderer/components/skill/index.ts`               | code |

## 完了条件

- [ ] SkillStreamingView.tsx が作成されている
- [ ] ChatPanel.tsx が修正されている（SkillSelector、SkillImportDialog、PermissionDialog、SkillStreamingView が統合されている）
- [ ] skill/index.ts に SkillStreamingView のエクスポートが追加されている
- [ ] Phase 4 の全テストが Green（PASS）である
- [ ] TypeScript 型チェックがエラーゼロで通る
- [ ] ESLint/Prettier が通る
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. タスク1: SkillStreamingView コンポーネント実装
3. タスク2: ChatPanel コンポーネント修正
4. タスク3: skill/index.ts エクスポート更新
5. タスク4: テスト Green 確認
6. タスク5: TypeScript 型チェック
7. 統合テスト連携の実施
8. 成果物の作成・配置
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-import-agent-system/tasks/TASK-7D-chat-panel-integration --phase 5
```

## 次のPhase

Phase 6: テスト拡充 → [phase-6-test-enhancement.md](phase-6-test-enhancement.md)
