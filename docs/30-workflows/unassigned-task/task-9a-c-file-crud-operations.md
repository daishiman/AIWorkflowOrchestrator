# SkillEditor ファイル作成・削除機能 - タスク指示書

## メタ情報

```yaml
issue_number: 833
```

## メタ情報

| 項目         | 内容                                             |
| ------------ | ------------------------------------------------ |
| タスクID     | TASK-9A-C-002                                    |
| タスク名     | SkillEditor ファイル作成・削除機能               |
| 分類         | 機能追加                                         |
| 対象機能     | SkillEditor / FileTreeSidebar / Main Process IPC |
| 優先度       | 中                                               |
| 見積もり規模 | 中規模                                           |
| ステータス   | 未実施                                           |
| 発見元       | TASK-9A-C Phase 1（要件定義）- スコープ外項目    |
| 発見日       | 2026-02-19                                       |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-9A-C（SkillEditor コンポーネント実装）では、スキルファイルの `readFile`（読み込み）と `writeFile`（書き込み）のみをスコープとしており、ファイルの新規作成（`createFile`）やファイル削除（`deleteFile`）はスコープ外として除外された。

TASK-9A-B（ファイル編集IPCハンドラー追加）の仕様書では、`createFile`/`deleteFile`のIPCハンドラーがPreload API含めて設計済みである（`skill:createFile`/`skill:deleteFile`チャネル）。ただしTASK-9A-BのIPCハンドラー実装のうち `createFile`/`deleteFile` 部分が実装済みかどうかは、本タスク開始時に確認が必要である。

### 1.2 問題点・課題

- スキル開発ワークフローでは、新しいagentファイル（`.md`）やreferenceファイルの追加が頻繁に発生する
- 不要になったファイルを削除する手段がSkillEditor内に存在しない
- 現状ではOSのファイルマネージャー（Finder等）を別途開いてファイル操作を行う必要がある
- エディターとファイルマネージャーの切り替えが開発フローを中断し、作業効率を低下させる

### 1.3 放置した場合の影響

- スキル開発時にエディター外での手動ファイル操作が常に必要となり、ワークフローが断片化する
- ファイル追加後にSkillEditorのファイルツリーが自動更新されず、リロードが必要になる
- 誤って重要ファイルを削除した場合の保護機構（確認ダイアログ）がOSレベルの操作には適用されない

---

## 2. 何を達成するか（What）

### 2.1 目的

SkillEditor内でファイルの新規作成と削除を完結させ、スキル開発ワークフローをエディター内に統合する。

### 2.2 最終ゴール

- FileTreeSidebar に「新規ファイル」ボタンがあり、クリックするとファイル名入力→作成が行える
- ファイルツリー内の各ファイルに対して右クリックコンテキストメニューから「削除」が選択できる
- 削除前に確認ダイアログが表示され、誤操作を防止できる
- ファイル作成・削除後にファイルツリーが自動更新される

### 2.3 スコープ

#### 含むもの

1. FileTreeSidebar に「新規ファイル」ボタン追加（ファイル名入力UI含む）
2. ファイルの右クリックコンテキストメニューに「削除」オプション追加
3. Main Process側の `skill:createFile` / `skill:deleteFile` IPCハンドラ追加（TASK-9A-Bで未実装の場合）
4. Preload層の API 公開（`contextBridge` 経由 `safeInvoke` パターン）
5. `IPC_CHANNELS` 定数への `SKILL_CREATE_FILE` / `SKILL_DELETE_FILE` 追加
6. `ALLOWED_INVOKE_CHANNELS` ホワイトリストへの追加
7. 削除時の確認ダイアログ（破壊的操作保護 — Apple HIG準拠）
8. ファイル作成・削除後のファイルツリー自動更新
9. パストラバーサル防御（Main Process側 `validatePath` 適用）
10. エラーハンドリング（存在しないファイルの削除、重複ファイル名での作成等）

#### 含まないもの

- ディレクトリ（カテゴリ）の作成・削除
- ファイル名変更（リネーム）
- ドラッグ＆ドロップでのファイル移動
- ファイルテンプレート機能（新規作成時のテンプレート選択）
- バックアップ一覧・復元機能（TASK-9A-Bの別スコープ）

### 2.4 成果物

| 成果物                                  | パス                                                                             | 操作 |
| --------------------------------------- | -------------------------------------------------------------------------------- | ---- |
| FileTreeSidebar（新規ファイル機能追加） | `apps/desktop/src/renderer/components/skill/FileTreeSidebar.tsx`                 | 修正 |
| ContextMenu コンポーネント              | `apps/desktop/src/renderer/components/skill/FileContextMenu.tsx`                 | 新規 |
| 削除確認ダイアログ                      | `apps/desktop/src/renderer/components/skill/DeleteFileDialog.tsx`                | 新規 |
| IPC_CHANNELS 定数追加                   | `apps/desktop/src/preload/channels.ts`                                           | 修正 |
| Preload API 追加                        | `apps/desktop/src/preload/skill-api.ts`                                          | 修正 |
| Preload 型定義追加                      | `apps/desktop/src/preload/types.ts`                                              | 修正 |
| Main IPC ハンドラ追加                   | `apps/desktop/src/main/ipc/skillHandlers.ts`                                     | 修正 |
| 共有型定義追加（該当する場合）          | `packages/shared/src/agent/types.ts`                                             | 修正 |
| テストファイル                          | `apps/desktop/src/renderer/components/skill/__tests__/FileContextMenu.test.tsx`  | 新規 |
| テストファイル                          | `apps/desktop/src/renderer/components/skill/__tests__/DeleteFileDialog.test.tsx` | 新規 |
| テストファイル                          | `apps/desktop/src/main/ipc/__tests__/skillHandlers.createDelete.test.ts`         | 新規 |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-9A-C（SkillEditor コンポーネント実装）が完了していること
- TASK-9A-B（ファイル編集IPCハンドラー追加）の `readFile`/`writeFile` が動作していること
- `SkillFileManager` に `createFile`/`deleteFile` メソッドが実装済みであること（TASK-9A-Aで実装済みの場合）

### 3.2 依存タスク

| タスクID  | 依存内容                                           |
| --------- | -------------------------------------------------- |
| TASK-9A-A | SkillFileManager の createFile/deleteFile メソッド |
| TASK-9A-B | IPCハンドラーの基本パターン（readFile/writeFile）  |
| TASK-9A-C | SkillEditor / FileTreeSidebar の基本実装           |

### 3.3 必要な知識

- React + TypeScript（コンポーネント開発）
- Electron IPC（Main ↔ Renderer 通信）
- contextBridge + safeInvoke パターン
- Tailwind CSS（UIスタイリング）
- Vitest + React Testing Library（テスト）

### 3.4 システム仕様書参照

| ドキュメント         | パス                                                                                        | 利用目的                             |
| -------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------ |
| セキュリティAPI      | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | contextBridgeセキュリティ原則        |
| IPC セキュリティ     | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPCセキュリティ原則                  |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | IPC file editingパターン             |
| インターフェース     | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | ImportedSkill型定義                  |
| UI機能コンポーネント | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | SkillEditorコンポーネント仕様        |
| UIコンポーネント共通 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     | ダイアログ・コンテキストメニュー設計 |

### 3.5 実装課題と解決策（TASK-9A-Cからの教訓）

TASK-9A-C実装時に発生した課題と解決パターンを、本タスク実装時に参照する。

| 課題                             | 発見経緯                                       | 解決策                                                       | 教訓                                                                |
| -------------------------------- | ---------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------- |
| APIレート制限                    | 4並列エージェント実行時に3/4がレート制限に到達 | 並列エージェント数を2-3に制限                                | 並列実行の上限を意識した設計が必要                                  |
| IPCチャンネル追加時の影響範囲    | P27: Preloadハードコード文字列の見落とし       | IPC_CHANNELS定数を必ず使用し、grep検証で文字列リテラルを検出 | チャンネル追加は4層（定数/Main handler/Preload/Renderer）全てに反映 |
| セキュリティ（パストラバーサル） | TASK-9A-Bでの実装パターン                      | validatePath関数でMain Process側バリデーション               | ファイル操作系IPCは必ずパストラバーサル防御を含む                   |
| 型定義の二箇所同時更新           | P32: shared/types.tsとpreload/types.tsの不整合 | 両ファイルを同一コミットで更新し、`pnpm typecheck`で検証     | IPC関連の型変更では2ファイル同時更新が必須                          |

#### 参照パターンの詳細

**4層同時更新パターン**: IPCチャンネルの追加時は、以下の4箇所を必ず同時に更新する。1箇所でも漏れがあるとコンパイルエラーまたは実行時エラーが発生する。

1. **定数定義**: `apps/desktop/src/preload/channels.ts` — `IPC_CHANNELS` に新チャンネル名を追加、`ALLOWED_INVOKE_CHANNELS` にホワイトリスト追加
2. **Main handler**: `apps/desktop/src/main/ipc/skillHandlers.ts` — `ipcMain.handle()` でハンドラ登録
3. **Preload bridge**: `apps/desktop/src/preload/skill-api.ts` — `safeInvoke()` で Renderer に公開
4. **型定義**: `apps/desktop/src/preload/types.ts`（+ 必要に応じて `packages/shared/src/agent/types.ts`）

**パストラバーサル防御パターン**: `validatePath()` 関数で `path.normalize()` 後に `..` を検出し、スキルディレクトリ外へのアクセスを遮断する。`createFile` と `deleteFile` の両方で適用が必須。

**破壊的操作保護パターン（Apple HIG準拠）**: 削除操作は必ず確認ダイアログを表示する。ダイアログには「削除するファイル名」「この操作は取り消せない旨の警告」「キャンセル/削除ボタン」を含む。削除ボタンは赤色（`#FF3B30`）で破壊的操作であることを視覚的に示す。

---

## 4. 実行手順

### Phase構成（TDD 3-Phase）

本タスクは中規模のため、TDD 3-Phase構成を採用する。

#### Phase 1: テスト設計・作成

**目的**: テストファーストで全テストケースを作成し、Red状態を確認する。

**手順**:

1. Main Process側IPCハンドラーのユニットテスト作成
   - `skill:createFile` ハンドラーの正常系テスト（ファイル作成成功）
   - `skill:createFile` ハンドラーの異常系テスト（既存ファイルへの上書き防止、パストラバーサル検出）
   - `skill:deleteFile` ハンドラーの正常系テスト（ファイル削除成功）
   - `skill:deleteFile` ハンドラーの異常系テスト（存在しないファイル、パストラバーサル検出）
   - validatePath適用の検証テスト

2. Rendererコンポーネントのテスト作成
   - FileContextMenu の表示・操作テスト（右クリック→メニュー表示→削除選択）
   - DeleteFileDialog の表示・操作テスト（確認→削除実行 / キャンセル）
   - FileTreeSidebar の「新規ファイル」ボタン→入力→作成フローテスト
   - ファイル作成後のツリー自動更新テスト
   - ファイル削除後のツリー自動更新テスト

3. 全テストが Red（失敗）であることを確認

**成果物**:

- `apps/desktop/src/main/ipc/__tests__/skillHandlers.createDelete.test.ts`
- `apps/desktop/src/renderer/components/skill/__tests__/FileContextMenu.test.tsx`
- `apps/desktop/src/renderer/components/skill/__tests__/DeleteFileDialog.test.tsx`
- `apps/desktop/src/renderer/components/skill/__tests__/FileTreeSidebar.crud.test.tsx`

**注意事項（P39, P40）**:

- happy-dom環境では `userEvent` ではなく `fireEvent` を使用する
- テスト実行は `apps/desktop/` ディレクトリから行う（`pnpm --filter @repo/desktop exec vitest run`）

#### Phase 2: 実装

**目的**: テストを Green にするプロダクションコードを実装する。

**手順**:

1. IPC_CHANNELS定数の追加
   - `channels.ts` に `SKILL_CREATE_FILE: "skill:createFile"` と `SKILL_DELETE_FILE: "skill:deleteFile"` を追加
   - `ALLOWED_INVOKE_CHANNELS` に両チャンネルを追加

2. Main Process IPCハンドラの追加
   - `skillHandlers.ts` に `skill:createFile` ハンドラを追加
     - `validatePath()` でパストラバーサル防御
     - `SkillFileManager.createFile()` を呼び出し
     - エラーはサニタイズして返却（内部パス情報を漏洩しない）
   - `skillHandlers.ts` に `skill:deleteFile` ハンドラを追加
     - `validatePath()` でパストラバーサル防御
     - `SkillFileManager.deleteFile()` を呼び出し
     - エラーはサニタイズして返却

3. Preload API拡張
   - `skill-api.ts` に `createFile` / `deleteFile` メソッドを追加（`safeInvoke` 経由）
   - `types.ts` に型定義を追加

4. 型定義の同時更新（P32対策）
   - `apps/desktop/src/preload/types.ts` に `createFile`/`deleteFile` の型を追加
   - 必要に応じて `packages/shared/src/agent/types.ts` にも追加
   - `pnpm typecheck` で型整合性を検証

5. FileTreeSidebar の「新規ファイル」機能実装
   - 「+」ボタンを追加
   - クリックでインラインファイル名入力フィールドを表示
   - Enter キーで作成実行、Escape キーでキャンセル
   - 作成成功後にファイルツリーを再取得して表示更新

6. FileContextMenu コンポーネント実装
   - 右クリックでコンテキストメニューを表示
   - メニュー項目: 「削除」（赤文字）
   - メニュー外クリックで自動非表示

7. DeleteFileDialog コンポーネント実装
   - ファイル名を表示
   - 「この操作は取り消せません」の警告テキスト
   - 「キャンセル」ボタン（デフォルトフォーカス）と「削除」ボタン（赤色 `#FF3B30`）
   - 削除実行後にファイルツリーを再取得して表示更新
   - 削除したファイルが現在選択中の場合は、選択状態をリセット

8. ファイル作成・削除後のツリー自動更新
   - 作成/削除成功後に `skill.subResources` を再取得する仕組みを実装
   - 既存の `readFile`/`writeFile` と同じパターンで `window.electronAPI.skill.createFile()` / `deleteFile()` を呼び出す

**成果物**:

- 修正: `apps/desktop/src/preload/channels.ts`
- 修正: `apps/desktop/src/main/ipc/skillHandlers.ts`
- 修正: `apps/desktop/src/preload/skill-api.ts`
- 修正: `apps/desktop/src/preload/types.ts`
- 修正: `apps/desktop/src/renderer/components/skill/FileTreeSidebar.tsx`
- 新規: `apps/desktop/src/renderer/components/skill/FileContextMenu.tsx`
- 新規: `apps/desktop/src/renderer/components/skill/DeleteFileDialog.tsx`
- 修正: `packages/shared/src/agent/types.ts`（該当する場合）

#### Phase 3: リファクタリング・品質検証

**目的**: コード品質の改善と品質基準の充足を確認する。

**手順**:

1. コード品質確認
   - `pnpm lint` — ESLintエラー0件
   - `pnpm typecheck` — TypeScriptエラー0件
   - 未使用importの削除

2. カバレッジ確認
   - Line Coverage 80%以上
   - Branch Coverage 60%以上
   - Function Coverage 80%以上
   - 不足箇所があればテスト追加

3. セキュリティ検証
   - `grep -rn "safeInvoke\|safeOn" apps/desktop/src/preload/ | grep -v "IPC_CHANNELS"` でハードコード文字列がないことを確認（P27対策）
   - Main Process側ハンドラに `validatePath()` が適用されていることを確認
   - エラーレスポンスに内部パス情報が含まれないことを確認

4. 手動テスト
   - 開発サーバーで「新規ファイル」ボタンクリック→ファイル作成を確認
   - 右クリック→「削除」→確認ダイアログ→削除を確認
   - パストラバーサル攻撃（`../../../etc/passwd`等）が拒否されることを確認
   - 削除後にファイルツリーが自動更新されることを確認

5. リファクタリング（必要に応じて）
   - 重複コードの抽出
   - コンポーネントの責務分離（Atomic Design原則）

**成果物**:

- 品質検証レポート
- テスト結果

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] FileTreeSidebar に「新規ファイル」ボタンが表示される
- [ ] 「新規ファイル」ボタンクリックでファイル名入力UIが表示される
- [ ] ファイル名入力後にEnterキーでファイルが作成される
- [ ] Escapeキーでファイル名入力がキャンセルされる
- [ ] 空のファイル名では作成できない（バリデーション）
- [ ] 既存ファイル名と重複する場合はエラーメッセージが表示される
- [ ] ファイルを右クリックするとコンテキストメニューが表示される
- [ ] コンテキストメニューから「削除」を選択すると確認ダイアログが表示される
- [ ] 確認ダイアログで「削除」をクリックするとファイルが削除される
- [ ] 確認ダイアログで「キャンセル」をクリックすると削除がキャンセルされる
- [ ] ファイル作成後にファイルツリーが自動更新される
- [ ] ファイル削除後にファイルツリーが自動更新される
- [ ] 削除したファイルが選択中の場合、選択状態がリセットされる

### セキュリティ要件

- [ ] Main Process側で `validatePath()` によるパストラバーサル防御が適用されている
- [ ] IPC_CHANNELS定数が使用されており、ハードコード文字列がない（P27検証済み）
- [ ] ALLOWED_INVOKE_CHANNELS ホワイトリストに新チャンネルが追加されている
- [ ] エラーレスポンスに内部パス情報が漏洩しない
- [ ] Preload APIは `safeInvoke` パターンを使用している

### 品質要件

- [ ] `pnpm lint` がエラー0件で通る
- [ ] `pnpm typecheck` がエラー0件で通る
- [ ] 全テストが PASS する
- [ ] Line Coverage 80%以上
- [ ] Branch Coverage 60%以上
- [ ] アクセシビリティ: 確認ダイアログにARIAラベルが適切に設定されている
- [ ] アクセシビリティ: キーボード操作で全機能にアクセス可能

### ドキュメント要件

- [ ] 実装ガイド作成（Phase 12 実施時）
- [ ] システム仕様書更新（Phase 12 実施時）

---

## 6. 検証方法

### テストケース

| #   | テストケース                                     | 期待結果                                     |
| --- | ------------------------------------------------ | -------------------------------------------- |
| 1   | 「新規ファイル」ボタンクリック                   | ファイル名入力フィールドが表示される         |
| 2   | ファイル名入力→Enter                             | ファイルが作成され、ツリーに追加表示される   |
| 3   | ファイル名入力→Escape                            | 入力がキャンセルされ、元の状態に戻る         |
| 4   | 空ファイル名でEnter                              | バリデーションエラーが表示される             |
| 5   | 既存ファイル名で作成                             | 重複エラーメッセージが表示される             |
| 6   | ファイル右クリック                               | コンテキストメニューが表示される             |
| 7   | コンテキストメニュー→「削除」                    | 確認ダイアログが表示される                   |
| 8   | 確認ダイアログ→「削除」                          | ファイルが削除され、ツリーから除去される     |
| 9   | 確認ダイアログ→「キャンセル」                    | ファイルが残り、ダイアログが閉じる           |
| 10  | 選択中ファイルを削除                             | 選択状態がリセットされ、エディターが空になる |
| 11  | パストラバーサルパス（`../secret.txt`）で作成    | エラーが返され、ファイルは作成されない       |
| 12  | パストラバーサルパス（`../../etc/passwd`）で削除 | エラーが返され、ファイルは削除されない       |
| 13  | SKILL.md の削除試行（保護対象ファイルの場合）    | エラーまたは警告が表示される（設計判断必要） |

### 検証手順

1. 開発サーバーでアプリを起動する
2. スキル管理画面で任意のスキルを選択し、SkillEditorを開く
3. FileTreeSidebarの「新規ファイル」ボタンをクリック
4. ファイル名（例: `test-file.md`）を入力しEnterキーを押す
5. ファイルツリーに新しいファイルが表示されることを確認
6. 新しく作成したファイルを選択し、内容が空であることを確認
7. 作成したファイルを右クリックし、コンテキストメニューが表示されることを確認
8. 「削除」を選択し、確認ダイアログが表示されることを確認
9. 「削除」ボタンをクリックし、ファイルがツリーから消えることを確認
10. DevToolsのConsoleでエラーが出ていないことを確認

---

## 7. リスクと対策

| リスク                                                 | 影響度 | 発生確率 | 対策                                                                                      |
| ------------------------------------------------------ | ------ | -------- | ----------------------------------------------------------------------------------------- |
| パストラバーサル攻撃によるスキルディレクトリ外アクセス | 高     | 低       | Main Process側で`validatePath()`を必ず適用。テストケース#11,#12で検証                     |
| P5: ipcMain.handle二重登録エラー                       | 中     | 中       | macOS `activate` イベント対応として `unregisterAllIpcHandlers()` パターンを踏襲           |
| P32: 型定義の二箇所同時更新漏れ                        | 中     | 中       | `preload/types.ts` と `shared/types.ts` を同一コミットで更新、`pnpm typecheck` で検証     |
| 破壊的操作（削除）による誤ったファイル消失             | 高     | 中       | 確認ダイアログを必須化（Apple HIG準拠）。ダイアログのデフォルトフォーカスは「キャンセル」 |
| P27: Preloadハードコード文字列の見落とし               | 中     | 低       | `grep -rn "safeInvoke\|safeOn" \| grep -v "IPC_CHANNELS"` で検出。Phase 3で必ず実行       |
| SKILL.md等の必須ファイルを誤って削除                   | 高     | 低       | 保護対象ファイルリスト（`SKILL.md`, `LOGS.md`等）を定義し、削除前に警告表示               |
| ファイル作成時のディスク容量不足                       | 低     | 低       | `fs.writeFile` のエラーをキャッチし、ユーザーにわかりやすいメッセージを表示               |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント               | パス                                                                                            |
| -------------------------- | ----------------------------------------------------------------------------------------------- |
| TASK-9A-B 仕様書           | `docs/30-workflows/skill-import-agent-system/tasks/task-9a-b-ipc-file-handlers.md`              |
| TASK-9A-C 完了タスク仕様書 | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-9a-c-skill-editor-ui.md` |
| セキュリティAPI            | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                    |
| IPC セキュリティ           | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                    |
| 実装パターン               | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`     |
| インターフェース           | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`               |
| UI機能コンポーネント       | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                 |
| UIコンポーネント共通       | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                         |

### 既知の落とし穴（P番号参照）

| P番号 | タイトル                     | 本タスクへの影響                                      |
| ----- | ---------------------------- | ----------------------------------------------------- |
| P5    | リスナー二重登録             | `ipcMain.handle` 追加時に activate イベント対応が必要 |
| P27   | Preloadハードコード文字列    | 新チャンネル追加時に文字列リテラルを使わない          |
| P32   | 型定義の二箇所同時更新       | `preload/types.ts` と `shared/types.ts` の同時更新    |
| P39   | happy-domでのuserEvent非互換 | テストでは `fireEvent` を使用                         |
| P40   | テスト実行ディレクトリ依存   | `apps/desktop/` ディレクトリから実行                  |

### 参考資料

- [Apple Human Interface Guidelines - Dialogs](https://developer.apple.com/design/human-interface-guidelines/dialogs)
- Electron contextBridge ドキュメント
- React Testing Library ドキュメント

---

## 9. 備考

### スコープ除外の経緯

```
TASK-9A-C Phase 1（要件定義）:
SkillEditorのスコープをreadFile/writeFileに限定。
createFile/deleteFileはスキルファイル管理機能として別タスク化が適切と判断。
理由: ファイルCRUD操作は個別のIPCハンドラ追加・セキュリティ検証・UI（コンテキストメニュー、確認ダイアログ）
が必要であり、単一責務原則に基づきスコープを分離する。
```

### TASK-9A-Bとの関係

TASK-9A-Bの仕様書には `createFile`/`deleteFile` のIPCハンドラ設計とPreload API設計が含まれている。本タスク開始時に、TASK-9A-Bの実装状態を確認し、以下を判断する必要がある:

1. **Main Process側のIPCハンドラが実装済みの場合**: Renderer側のUI実装のみを行う
2. **IPCハンドラが未実装の場合**: TASK-9A-Bの仕様に従ってIPCハンドラも実装する

### 将来の拡張候補

- ファイル名変更（リネーム）機能
- ディレクトリ作成・削除機能
- ドラッグ＆ドロップによるファイル移動
- ファイルテンプレート選択（新規作成時）
- ゴミ箱機能（削除ではなく一時退避）
