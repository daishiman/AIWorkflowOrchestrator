# SkillEditor.tsx ファイル操作系 direct IPC の Store 移行 - タスク指示書

## メタ情報

```yaml
issue_number: 1100
```

## メタ情報

| 項目         | 内容                                                    |
| ------------ | ------------------------------------------------------- |
| タスクID     | TASK-10A-G-SKILLEDITOR-FILEOPS-STORE-MIGRATION          |
| タスク名     | SkillEditor.tsx ファイル操作系 direct IPC の Store 移行 |
| 分類         | 改善                                                    |
| 対象機能     | スキルエディタ・ファイル操作                            |
| 優先度       | 中                                                      |
| 見積もり規模 | 中規模                                                  |
| ステータス   | 未実施                                                  |
| 発見元       | TASK-10A-F Phase 12（未タスク検出）                     |
| 発見日       | 2026-03-09                                              |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-10A-F で SkillAnalysisView と SkillCreateWizard のライフサイクル系 API（analyze, applyImprovements, autoImprove, create）を Store 個別セレクタに移行した。しかし SkillEditor.tsx（840行）にはファイル操作系の `window.electronAPI?.skill.*` 直接呼び出しが6箇所残存しており、S26パターン（直接IPC→Store個別セレクタ移行パターン）に準拠していない。

### 1.2 問題点・課題

- **IPC詳細のUI層漏洩**: `window.electronAPI?.skill?.readFile` 等のIPC呼び出しがRendererコンポーネント内に直接記述されており、Preload変更時にSkillEditor全体への波及が発生する
- **エラー状態管理の分散**: 各ハンドラ（loadFile, saveCurrentFile, handleDeleteFile 等）が個別にtry/catch + setError で状態管理しており、エラー処理の一貫性がない
- **テスト複雑性の増大**: テストで `window.electronAPI` のモックが必要になり、Preload依存の密結合が発生する
- **アーキテクチャの不統一**: ライフサイクル系API（TASK-10A-F完了）とインポート系API（TASK-10A-E-C完了）は移行済みだが、ファイル操作系のみ旧パターンが残存している

### 1.3 放置した場合の影響

- Preload層の変更（チャネル名変更、レスポンス形式変更）がSkillEditorに直接影響し、修正コストが増大する
- SkillEditorの6箇所のエラーハンドリングが独自実装のまま残り、ロギングやリトライの一元管理が不可能
- 新規開発者がSkillEditorを参考にして同様のdirect IPCパターンを使用するリスク
- TASK-10A-E-C（インポート系）、TASK-10A-F（ライフサイクル系）との設計方針の不統一が続く

---

## 2. 何を達成するか（What）

### 2.1 目的

SkillEditor.tsx 内の6箇所のファイル操作系 direct IPC 呼び出しを、Store 個別セレクタ経由に移行し、S26パターンに準拠させる。

### 2.2 最終ゴール

- SkillEditor.tsx から `window.electronAPI?.skill.*` のファイル操作系直接呼び出しが0箇所
- ファイル操作（readFile, writeFile, createFile, deleteFile, listBackups, restoreBackup）がStore action経由で実行される
- 個別セレクタ（`useSkillReadFile()`, `useSkillWriteFile()` 等）で安定参照を取得
- 全テストがPASS、カバレッジ基準を充足

### 2.3 スコープ（含むもの / 含まないもの）

#### 含むもの

- SkillEditor.tsx 内の6箇所のdirect IPC呼び出しのStore移行
- agentSlice（または新規 skillFileSlice）へのファイル操作系action追加
- store/index.ts への個別セレクタ追加
- 移行後のテスト追加・更新
- S26移行チェックリスト7ステップの完全実施

#### 含まないもの

- SkillEditor.tsx のUI/UXリファクタリング（レイアウト変更、デザイン変更）
- ライフサイクル系API（TASK-10A-F完了済み）の追加修正
- インポート系API（TASK-10A-E-C完了済み）の追加修正
- Store構造（Slice分割方針）自体の見直し

### 2.4 成果物

| 成果物                   | 説明                                                     |
| ------------------------ | -------------------------------------------------------- |
| 移行済み SkillEditor.tsx | direct IPC を Store 個別セレクタに置換したコンポーネント |
| Store action 定義        | agentSlice 等へのファイル操作系 action 追加              |
| 個別セレクタ定義         | store/index.ts への6つの個別セレクタ export              |
| テストファイル           | 移行後の参照安定性テスト・機能テスト                     |
| Phase 1-12 成果物        | 各Phaseの標準出力ドキュメント                            |

---

## 3. どのように実現するか（How）

### 3.1 技術方針

S26パターン（architecture-implementation-patterns.md#S26）に完全準拠する。

1. **Store action 定義**: agentSlice にファイル操作系の action を追加。各 action 内部で `window.electronAPI?.skill.*` を呼び出し、状態（loading, error）を Store で一元管理する
2. **個別セレクタ export**: store/index.ts に action 用セレクタ（`useSkillReadFile`, `useSkillWriteFile` 等）を追加
3. **SkillEditor.tsx 移行**: direct IPC 呼び出しを個別セレクタから取得した action 関数に置換
4. **State境界設計**: Case B方式に従い、共有状態は Store、UI一時状態は local useState を維持

### 3.2 移行対象一覧（6 API）

| #   | 行番号 | API                                        | 用途                 | 現在の呼び出し元ハンドラ |
| --- | ------ | ------------------------------------------ | -------------------- | ------------------------ |
| 1   | L233   | `window.electronAPI?.skill?.readFile`      | ファイル内容の読込   | `loadFile`               |
| 2   | L271   | `window.electronAPI?.skill?.writeFile`     | ファイル内容の保存   | `saveCurrentFile`        |
| 3   | L298   | `window.electronAPI?.skill?.listBackups`   | バックアップ一覧取得 | `refreshBackups`         |
| 4   | L412   | `window.electronAPI?.skill?.createFile`    | 新規ファイル作成     | `handleCreateFile`       |
| 5   | L440   | `window.electronAPI?.skill?.deleteFile`    | ファイル削除         | `handleDeleteFile`       |
| 6   | L482   | `window.electronAPI?.skill?.restoreBackup` | バックアップ復元     | `handleRestoreBackup`    |

### 3.3 State境界設計（Case B方式）

| 状態                                          | 配置先         | 理由                                                 |
| --------------------------------------------- | -------------- | ---------------------------------------------------- |
| readFile / writeFile / createFile 等の action | Store          | IPC詳細を隠蔽し、テスト容易性を確保                  |
| isLoadingBackups, backups                     | Store          | 複数コンポーネントから参照される可能性がある共有状態 |
| selectedPath, buffers                         | local useState | コンポーネント固有のUI一時状態                       |
| loadingPath, isSaving, error                  | local useState | コンポーネント固有の一時表示状態                     |
| filePaths                                     | local useState | 現時点ではSkillEditor固有の状態                      |

---

## 4. TASK-10A-F からの教訓（苦戦箇所）

### 4.1 苦戦箇所一覧

| 苦戦箇所                  | 再発条件                                                      | 対処                                                                                                                |
| ------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| P50モード判定の遅延       | Phase 1 開始時に既実装確認を怠る                              | Phase 1 Step 0 で `git log` + コード確認を必須化。既実装発見時は「検証・補完」モードに切り替え                      |
| P40再発（カバレッジ計測） | プロジェクトルートから vitest を実行する                      | `cd apps/desktop && pnpm vitest run --coverage` で必ずパッケージディレクトリから実行                                |
| API系統のスコープ混在     | 1タスクで複数系統のAPIを同時に移行しようとする                | ライフサイクル系(TASK-10A-F完了) / ファイル操作系(本タスク) / インポート系(TASK-10A-E-C完了) で明確にスコープを分離 |
| S26パターン逸脱           | 移行チェックリスト7ステップを順守しない                       | architecture-implementation-patterns.md#S26 の7ステップを逐次実行・記録                                             |
| P31（無限ループ）         | 合成Hookの不安定参照を useEffect 依存配列に含める             | 個別セレクタで安定参照を取得（`useSkillReadFile()` 等）                                                             |
| P42（バリデーション漏れ） | 文字列引数の `.trim()` チェックを忘れる                       | Store action 内で3段バリデーション（型チェック → 空文字列 → トリム空文字列）                                        |
| P48（useShallow未適用）   | `.filter()` / `.map()` で配列を返すセレクタに useShallow なし | backups 等の配列を返すセレクタには `useShallow` を適用                                                              |

### 4.2 再利用手順

1. Phase 1 開始前に `grep -rn "readFile\|writeFile\|listBackups\|createFile\|deleteFile\|restoreBackup" apps/desktop/src/renderer/store/` で既存Store定義を確認
2. S26移行チェックリスト7ステップに沿って移行を実行
3. テスト作成時は S26 のテスト mock 標準パターンを使用
4. カバレッジ計測は `cd apps/desktop && pnpm vitest run --coverage` で実行
5. 移行完了後 `grep -rn "window.electronAPI?.skill?.readFile\|window.electronAPI?.skill?.writeFile\|window.electronAPI?.skill?.listBackups\|window.electronAPI?.skill?.createFile\|window.electronAPI?.skill?.deleteFile\|window.electronAPI?.skill?.restoreBackup" apps/desktop/src/renderer/components/` で残存0件を確認

---

## 5. 参照資料

| 参照資料                      | パス                                                                                            | 内容                                          |
| ----------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------- |
| S26 直接IPC→Store移行パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md#S26` | 移行チェックリスト7ステップ、mock標準パターン |
| S18 useShallow 適用条件       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md#S18` | P48対策の適用判定基準                         |
| lessons-learned.md            | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                          | 実装時の苦戦箇所と対処法                      |
| 06-known-pitfalls.md          | `.claude/rules/06-known-pitfalls.md`                                                            | P31, P40, P42, P48, P50 の詳細                |
| 03-state-management.md        | `.claude/rules/03-state-management.md`                                                          | Zustand設計原則・State配置判断基準            |
| TASK-10A-F 成果物             | `docs/30-workflows/completed-tasks/TASK-10A-F-STORE-DRIVEN-LIFECYCLE-UI/`                       | 先行タスク（ライフサイクル系）の全成果物      |
| SkillEditor.tsx               | `apps/desktop/src/renderer/components/skill/SkillEditor.tsx`                                    | 移行対象コンポーネント（840行）               |
| agentSlice.ts                 | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                          | Store action 追加先候補                       |
| store/index.ts                | `apps/desktop/src/renderer/store/index.ts`                                                      | 個別セレクタ追加先                            |

---

## 6. 受け入れ基準

### 機能要件

- [ ] SkillEditor.tsx から `window.electronAPI?.skill?.readFile` の直接呼び出しが0箇所
- [ ] SkillEditor.tsx から `window.electronAPI?.skill?.writeFile` の直接呼び出しが0箇所
- [ ] SkillEditor.tsx から `window.electronAPI?.skill?.listBackups` の直接呼び出しが0箇所
- [ ] SkillEditor.tsx から `window.electronAPI?.skill?.createFile` の直接呼び出しが0箇所
- [ ] SkillEditor.tsx から `window.electronAPI?.skill?.deleteFile` の直接呼び出しが0箇所
- [ ] SkillEditor.tsx から `window.electronAPI?.skill?.restoreBackup` の直接呼び出しが0箇所
- [ ] 各ファイル操作が Store action 経由で正常に動作する
- [ ] エラーハンドリングが一貫した方式で実装されている

### S26パターン準拠

- [ ] S26 移行チェックリスト Step 1: Store action が Slice に定義済み
- [ ] S26 移行チェックリスト Step 2: 個別セレクタが store/index.ts にexport済み
- [ ] S26 移行チェックリスト Step 3: ローカル useState を必要に応じて Store セレクタに置換
- [ ] S26 移行チェックリスト Step 4: 直接IPC呼び出しを削除
- [ ] S26 移行チェックリスト Step 5: try/catch を全ハンドラに追加
- [ ] S26 移行チェックリスト Step 6: 不要な isMountedRef パターンを削除
- [ ] S26 移行チェックリスト Step 7: テストを Store mock パターンに移行

### P31/P42/P48 対策

- [ ] 全セレクタは個別セレクタで取得（合成Hook使用なし）
- [ ] Store action 内で文字列引数の3段バリデーション実施（型チェック → 空文字列 → `.trim()` 空文字列）
- [ ] `.filter()` / `.map()` で配列を返すセレクタに `useShallow` 適用

### 品質要件

- [ ] Line Coverage >= 80%
- [ ] Branch Coverage >= 60%
- [ ] Function Coverage >= 80%
- [ ] 全テスト PASS
- [ ] ESLint エラー / 警告なし
- [ ] TypeScript 型チェックエラーなし

### ドキュメント要件

- [ ] Phase 12 実装ガイド（Part 1: 中学生レベル概念説明 / Part 2: 開発者向け実装詳細）
- [ ] LOGS.md x 2 更新
- [ ] SKILL.md x 2 更新
- [ ] documentation-changelog.md 作成
- [ ] topic-map.md 再生成

---

## 7. 関連タスク

| タスクID                                 | 関係 | 状態   | 説明                                             |
| ---------------------------------------- | ---- | ------ | ------------------------------------------------ |
| TASK-10A-F                               | 前提 | 完了   | ライフサイクル系 API の Store 移行（先行タスク） |
| TASK-10A-E-C                             | 関連 | 完了   | インポート系 API の Store 移行                   |
| task-imp-store-hooks-remaining-migration | 関連 | 未実施 | 残コンポーネントの個別セレクタHook移行           |
| task-ref-store-hooks-deprecate-composite | 後続 | 未実施 | 合成Store Hookの完全廃止                         |
| UT-STORE-HOOKS-COMPONENT-MIGRATION-001   | 基盤 | 完了   | 個別セレクタHookパターンの確立                   |
