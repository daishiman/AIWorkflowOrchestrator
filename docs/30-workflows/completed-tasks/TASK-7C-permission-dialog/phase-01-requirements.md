# Phase 1: 要件定義 - PermissionDialog コンポーネント

## メタ情報

| 項目      | 値                                      |
| --------- | --------------------------------------- |
| Phase     | 1                                       |
| Phase名   | 要件定義                                |
| カテゴリ  | 要件                                    |
| Feature   | skill-import-agent-system               |
| Task      | TASK-7C PermissionDialog コンポーネント |
| 前提Phase | なし                                    |
| 次Phase   | Phase 2（設計）                         |
| 作成日    | 2026-01-30                              |

## 目的

スキル実行中にツール使用の権限確認を求めるPermissionDialogコンポーネントの機能要件・非機能要件を明確に定義し、受け入れ基準を策定する。

## 実行タスク

### Task 1: 機能要件の抽出

**目的**: PermissionDialogに必要な全機能を洗い出す

**手順**:

1. `specification.md` セクション 4.4.2「権限確認ダイアログ」を読み、要件を抽出する
2. 既存の `apps/desktop/src/renderer/components/Permission/PermissionDialog.tsx` を読み、現状の実装を把握する
3. `packages/shared/src/types/skill.ts` から `SkillPermissionRequest` / `SkillPermissionResponse` 型を確認する
4. `apps/desktop/src/renderer/store/slices/skillSlice.ts` から `pendingPermission` / `respondToSkillPermission` のインターフェースを確認する
5. 以下の機能要件を文書化する:

**機能要件一覧**:

| FR-ID  | 要件                                                                     | 優先度 |
| ------ | ------------------------------------------------------------------------ | ------ |
| FR-001 | `pendingPermission` が null の場合はコンポーネントを表示しない           | 必須   |
| FR-002 | `pendingPermission` が存在する場合にモーダルダイアログを表示する         | 必須   |
| FR-003 | ツール名（`toolName`）を表示する                                         | 必須   |
| FR-004 | ツール引数（`args`）を適切にフォーマットして表示する                     | 必須   |
| FR-005 | Bashコマンドの場合は `args.command` を直接表示する                       | 必須   |
| FR-006 | ファイルパスの場合は `args.path` を直接表示する                          | 必須   |
| FR-007 | その他のツールの場合は JSON形式で引数を表示する                          | 必須   |
| FR-008 | 理由（`reason`）が存在する場合に表示する                                 | 必須   |
| FR-009 | 「拒否」ボタンで `respondToPermission(false, false)` を呼び出す          | 必須   |
| FR-010 | 「1回許可」ボタンで `respondToPermission(true, false)` を呼び出す        | 必須   |
| FR-011 | 「許可」ボタンで `respondToPermission(true, rememberChoice)` を呼び出す  | 必須   |
| FR-012 | 「このセッション中は同様の操作を自動許可する」チェックボックスを表示する | 必須   |
| FR-013 | レスポンス後にチェックボックス状態をリセットする                         | 必須   |
| FR-014 | ヘッダーの閉じるボタン（✕）が拒否と同じ動作をする                        | 必須   |

### Task 2: 非機能要件の定義

**目的**: パフォーマンス、アクセシビリティ、セキュリティの要件を定義する

**手順**:

1. `aiworkflow-requirements: ui-ux-agent-execution.md` を参照し、アクセシビリティ要件を確認する
2. `aiworkflow-requirements: ui-ux-design-system.md` を参照し、デザイントークン・カラーシステムを確認する
3. `aiworkflow-requirements: security-skill-execution.md` を参照し、セキュリティ要件を確認する
4. 以下の非機能要件を文書化する:

| NFR-ID  | カテゴリ         | 要件                                                            |
| ------- | ---------------- | --------------------------------------------------------------- |
| NFR-001 | アクセシビリティ | `role="dialog"`, `aria-modal="true"` を設定する                 |
| NFR-002 | アクセシビリティ | `aria-labelledby` でダイアログタイトルを参照する                |
| NFR-003 | アクセシビリティ | `aria-describedby` で説明テキストを参照する                     |
| NFR-004 | アクセシビリティ | フォーカストラップを実装する（Tab/Shift+Tabでダイアログ内循環） |
| NFR-005 | アクセシビリティ | Escapeキーで拒否操作を実行する                                  |
| NFR-006 | アクセシビリティ | WCAG 2.1 AA準拠のコントラスト比（4.5:1以上）を確保する          |
| NFR-007 | パフォーマンス   | ダイアログ表示のレンダリングが16ms以内に完了する                |
| NFR-008 | UI/UX            | Tailwind CSSを使用してスタイリングする                          |
| NFR-009 | UI/UX            | モーダルオーバーレイ（`bg-black/50`）を表示する                 |
| NFR-010 | UI/UX            | 最大幅 `max-w-lg` でコンテンツを制限する                        |
| NFR-011 | セキュリティ     | ツール引数にXSS攻撃ベクターが含まれていても安全に表示する       |
| NFR-012 | i18n             | 日本語UIテキストをハードコードする（現フェーズではi18n対象外）  |

### Task 3: 受け入れ基準の策定

**目的**: 各機能要件に対してテスト可能な受け入れ基準を定義する

**手順**:

1. FR/NFR一覧に基づいて、具体的かつ検証可能な基準を策定する
2. 以下の形式で記載する:

| AC-ID  | 対象    | 受け入れ基準                                                                          |
| ------ | ------- | ------------------------------------------------------------------------------------- |
| AC-001 | FR-001  | `pendingPermission=null` の場合、DOMにダイアログ要素が存在しない                      |
| AC-002 | FR-002  | `pendingPermission` にオブジェクトを設定すると、モーダルダイアログがDOMに追加される   |
| AC-003 | FR-003  | ダイアログ内に `pendingPermission.toolName` の値がテキストとして表示される            |
| AC-004 | FR-005  | `args.command="ls -la"` の場合、`<pre>` タグ内に `ls -la` がそのまま表示される        |
| AC-005 | FR-006  | `args.path="/tmp/file.txt"` の場合、`<pre>` タグ内に `/tmp/file.txt` が表示される     |
| AC-006 | FR-007  | `args={key:"value"}` の場合、JSONフォーマットされた文字列が表示される                 |
| AC-007 | FR-008  | `reason` が存在する場合のみ「理由」セクションが表示される                             |
| AC-008 | FR-009  | 「拒否」ボタンクリック後、`respondToPermission(false, false)` が1回呼ばれる           |
| AC-009 | FR-010  | 「1回許可」ボタンクリック後、`respondToPermission(true, false)` が1回呼ばれる         |
| AC-010 | FR-011  | チェックボックスON時に「許可」クリックで `respondToPermission(true, true)` が呼ばれる |
| AC-011 | FR-012  | チェックボックスのデフォルト状態はOFFである                                           |
| AC-012 | FR-013  | 任意のボタンクリック後、チェックボックスがOFFにリセットされる                         |
| AC-013 | NFR-001 | ダイアログのルート要素に `role="dialog"` 属性がある                                   |
| AC-014 | NFR-004 | Tabキーでフォーカスがダイアログ内のインタラクティブ要素間を循環する                   |
| AC-015 | NFR-005 | Escapeキー押下で拒否操作が実行される                                                  |

### Task 4: Electron層別要件の確認

**目的**: Renderer Process層としての責務範囲を明確にする

**手順**:

1. このコンポーネントがRenderer Process層に位置することを確認する
2. Store（SkillSlice）との接続インターフェースを定義する
3. IPC通信は直接行わず、Storeアクション経由であることを明記する

| 層               | 責務                                               | 本タスクの関与    |
| ---------------- | -------------------------------------------------- | ----------------- |
| Renderer Process | UI表示、ユーザーインタラクション、状態表示         | 主担当            |
| Store (Zustand)  | pendingPermission状態管理、respondToPermission呼出 | 参照              |
| IPC通信          | Main Process への権限応答送信                      | 間接（Store経由） |
| Main Process     | 権限の最終判断・記録                               | 対象外            |

## 統合テスト連携

| カテゴリ     | 確認内容                                                            |
| ------------ | ------------------------------------------------------------------- |
| 状態同期     | Storeの `pendingPermission` 変更がダイアログ表示/非表示に反映される |
| データフロー | `respondToPermission` 呼び出しがStoreを通じてIPC送信に繋がる        |
| エラー処理   | Store側でエラーが発生した場合にダイアログが適切に処理する           |

## 多角的観点チェック（AIによる判断）

| 観点               | 該当 | 確認内容                             |
| ------------------ | ---- | ------------------------------------ |
| セキュリティ       | ○    | XSS防止（引数表示の安全性）          |
| UI/UX（Apple HIG） | ○    | モーダルダイアログの標準パターン準拠 |
| アクセシビリティ   | ○    | WCAG 2.1 AA準拠、フォーカストラップ  |
| アーキテクチャ     | ○    | Renderer層の責務範囲遵守             |

## 成果物

| 成果物名     | パス                                         | タイプ   |
| ------------ | -------------------------------------------- | -------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | document |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | document |

## 完了条件

- [ ] 機能要件（FR-001〜FR-014）が全て文書化されている
- [ ] 非機能要件（NFR-001〜NFR-012）が全て文書化されている
- [ ] 受け入れ基準（AC-001〜AC-015）が全て策定されている
- [ ] Electron層別要件が明確化されている
- [ ] 統合テスト連携項目が定義されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-import-agent-system/tasks/TASK-7C-permission-dialog --phase 1
```

## 次のPhase

Phase 2: 設計

`docs/30-workflows/skill-import-agent-system/tasks/TASK-7C-permission-dialog/phase-02-design.md`

## 参照資料

| 参照資料                  | パス                                                                   | 説明                     |
| ------------------------- | ---------------------------------------------------------------------- | ------------------------ |
| タスク定義                | `../task-7c-permission-dialog.md`                                      | TASK-7Cの元タスク定義    |
| システム仕様書            | `../../specification.md` (4.4.2)                                       | 権限確認ダイアログ仕様   |
| 共有型定義                | `packages/shared/src/types/skill.ts`                                   | SkillPermissionRequest型 |
| SkillSlice                | `apps/desktop/src/renderer/store/slices/skillSlice.ts`                 | Store実装                |
| 既存PermissionDialog      | `apps/desktop/src/renderer/components/Permission/PermissionDialog.tsx` | 既存実装参考             |
| UI/UXエージェント実行仕様 | `aiworkflow-requirements: ui-ux-agent-execution.md`                    | ダイアログUI仕様         |
| セキュリティ仕様          | `aiworkflow-requirements: security-skill-execution.md`                 | 権限管理セキュリティ要件 |
| デザインシステム          | `aiworkflow-requirements: ui-ux-design-system.md`                      | デザイントークン・カラー |
