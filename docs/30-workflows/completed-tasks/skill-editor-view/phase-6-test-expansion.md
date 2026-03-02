# Phase 6: テスト拡充 — SkillEditorView

## メタ情報

| 項目       | 値                                                   |
| ---------- | ---------------------------------------------------- |
| タスク ID  | TASK-UI-05A-SKILL-EDITOR-VIEW                        |
| Phase      | 6（テスト拡充）                                      |
| 前提 Phase | Phase 5（実装）                                      |
| 後続 Phase | Phase 7（カバレッジ確認）                            |
| ステータス | 未着手                                               |
| 作成日     | 2026-03-01                                           |
| 機能名     | SkillEditorView（スキルエディタービュー）            |
| 依存タスク | TASK-UI-05-SKILL-CENTER-VIEW（SkillCenterView 実装） |

## 目的

Phase 5 で実装した SkillEditorView のカバレッジ不足箇所を特定し、境界値テスト・異常系テスト・アクセシビリティテスト・レスポンシブテスト・統合テストを追加する。追加テスト作成後、Phase 7（カバレッジ確認）の基準充足（Line 80%+, Branch 60%+, Function 80%+）を目指す。

## 背景

Phase 4（64 ケース）＋ Phase 5 の実装で基本的なテストカバレッジは確保されているが、以下のカテゴリのテストが不足している可能性がある:

- 境界値: 空ファイル、大ファイル（10,000 行超）、深いネスト（10 階層超）、特殊文字ファイル名
- 異常系: IPC 失敗、タイムアウト、権限エラー
- アクセシビリティ: キーボードナビゲーション、スクリーンリーダー対応
- レスポンシブ: ブレークポイント切替、ドロワー表示/非表示
- 統合: ファイル選択→編集→保存→バックアップ復元の E2E フロー

## 実行タスク

### タスク 1: カバレッジ初回測定

**目的**: Phase 4-5 時点のカバレッジを測定し、不足箇所を特定する。

**実行手順**:

1. 以下のコマンドでカバレッジを測定する:
   ```bash
   cd apps/desktop && pnpm vitest run --coverage src/renderer/views/SkillEditorView/
   ```
2. 各ファイルの Line / Branch / Function カバレッジを記録する
3. 基準未達のファイルを特定する:
   - Line < 80%
   - Branch < 60%
   - Function < 80%
4. 結果を `outputs/phase-6/coverage-initial.md` に記録する

**期待される成果物**:

- `docs/30-workflows/skill-editor-view/outputs/phase-6/coverage-initial.md`

### タスク 2: 境界値テスト追加（10 ケース）

**目的**: 境界値・エッジケースのテストを追加してカバレッジの Branch 不足を補う。

**実行手順**:

1. テストファイル `SkillEditorView.boundary.test.tsx` を作成する
2. 以下の 10 テストケースを記述する:

| ケース ID | テスト名                                                     | 検証内容                                                                                   |
| --------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| BND-01    | 空ファイル（0 バイト）を正常に表示する                       | `content=""` で EditorPanel が「0 行」「0 文字」を表示する                                 |
| BND-02    | 大ファイル（10,000 行）を正常に表示する                      | 10,000 行のコンテンツで EditorPanel が「10000 行」を表示し、パフォーマンス劣化なく動作する |
| BND-03    | 深いネスト（10 階層）のファイルツリーを正常に表示する        | 10 階層のネスト構造で FileTreePanel が全ノードをレンダリングする                           |
| BND-04    | 特殊文字を含むファイル名を正常に表示する                     | `name="日本語ファイル.md"` で FileTreeNode がファイル名を正常に表示する                    |
| BND-05    | スペースを含むファイル名を正常に処理する                     | `name="my file.md"` で IPC 呼び出しの引数にスペース付きパスが正しく渡される                |
| BND-06    | ファイルツリーに 100 個のファイルを表示する                  | 100 ファイルのフラットリストで FileTreePanel が全ノードをレンダリングする                  |
| BND-07    | 単一文字のファイル名を正常に表示する                         | `name="a"` で FileTreeNode がファイル名を正常に表示する                                    |
| BND-08    | 拡張子なしのファイルを正常に処理する                         | `name="Makefile"` で言語検出が「Plain Text」を返す                                         |
| BND-09    | 同一名のファイルが異なるディレクトリに存在する場合を処理する | `["a/test.md", "b/test.md"]` で 2 つの別ノードとしてレンダリングされる                     |
| BND-10    | ルートディレクトリに直接配置されたファイルのみの場合         | `["SKILL.md", "README.md"]` でディレクトリノードなし、ファイルノード 2 つが表示される      |

3. happy-dom 環境で `fireEvent` を使用する（P39 対策）
4. `beforeEach` でモックをリセットする（P9 対策）

**期待される成果物**:

- `apps/desktop/src/renderer/views/SkillEditorView/__tests__/SkillEditorView.boundary.test.tsx`（10 ケース）

### タスク 3: 異常系テスト追加（8 ケース）

**目的**: IPC 失敗、タイムアウト、権限エラー時のエラーハンドリングを検証する。

**実行手順**:

1. テストファイル `SkillEditorView.error.test.tsx` を作成する
2. 以下の 8 テストケースを記述する:

| ケース ID | テスト名                                                     | 検証内容                                                                                         |
| --------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| ERR-01    | readFile IPC 失敗時にエラーメッセージを表示する              | `readFile` モックが reject 後、エラーメッセージが EditorPanel に表示される                       |
| ERR-02    | writeFile IPC 失敗時にエラーメッセージを表示する             | `writeFile` モックが reject 後、エラーメッセージが表示される                                     |
| ERR-03    | listBackups IPC 失敗時にエラーメッセージを表示する           | `listBackups` モックが reject 後、BackupMenu にエラーが表示される                                |
| ERR-04    | restoreBackup IPC 失敗時にエラーメッセージを表示する         | `restoreBackup` モックが reject 後、エラーメッセージが表示される                                 |
| ERR-05    | readFile が空文字列を返した場合にエディターを空で表示する    | `readFile` モックが `""` を返した場合、textarea の value が空である                              |
| ERR-06    | writeFile 呼び出し中に追加の保存要求を無視する               | `isSaving=true` 中に保存ボタンが `disabled` で追加クリックが無効化される                         |
| ERR-07    | 存在しないファイルパスの readFile 失敗を処理する             | `readFile` が `"File not found"` エラーで reject 後、エラーメッセージが表示される                |
| ERR-08    | IPC エラーメッセージに内部情報が含まれていないことを確認する | エラー発生時に表示されるメッセージが汎用的な表現（「ファイルの読み込みに失敗しました」等）である |

3. IPC モックの reject パターンを使用する:
   ```typescript
   mockReadFile.mockRejectedValueOnce(new Error("File not found"));
   ```

**期待される成果物**:

- `apps/desktop/src/renderer/views/SkillEditorView/__tests__/SkillEditorView.error.test.tsx`（8 ケース）

### タスク 4: アクセシビリティ・キーボードナビゲーションテスト追加（6 ケース）

**目的**: キーボード操作、ARIA 属性、コントラスト要件を検証する。

**実行手順**:

1. テストファイル `SkillEditorView.a11y.test.tsx` を作成する
2. 以下の 6 テストケースを記述する:

| ケース ID | テスト名                                                     | 検証内容                                                                                    |
| --------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| A11Y-01   | Cmd+S キーで保存を実行する（macOS）                          | `fireEvent.keyDown(document, { key: "s", metaKey: true })` 後、`writeFile` モックが呼ばれる |
| A11Y-02   | Ctrl+S キーで保存を実行する（Windows/Linux）                 | `fireEvent.keyDown(document, { key: "s", ctrlKey: true })` 後、`writeFile` モックが呼ばれる |
| A11Y-03   | コンポーネントアンマウント時にキーボードリスナーが解除される | `unmount()` 後、`fireEvent.keyDown` で `writeFile` モックが呼ばれない                       |
| A11Y-04   | ファイルツリーノードに aria-selected 属性が設定される        | 選択中ノードに `aria-selected="true"`、非選択ノードに `aria-selected="false"` が設定される  |
| A11Y-05   | ダイアログのフォーカストラップが機能する                     | `UnsavedChangesDialog` が開いている間、Tab キーでフォーカスがダイアログ内に留まる           |
| A11Y-06   | 保存成功時にスクリーンリーダー向け通知を出力する             | 保存成功後、`role="status"` の要素に「保存しました」テキストが表示される                    |

**期待される成果物**:

- `apps/desktop/src/renderer/views/SkillEditorView/__tests__/SkillEditorView.a11y.test.tsx`（6 ケース）

### タスク 5: 統合テスト追加（6 ケース）

**目的**: ファイル選択→編集→保存→バックアップ復元の E2E フローを検証する。

**実行手順**:

1. テストファイル `SkillEditorView.integration.test.tsx` を作成する
2. 以下の 6 テストケースを記述する:

| ケース ID | テスト名                                         | 検証内容                                                                                                      |
| --------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| INT-01    | ファイル選択→読込→表示の完全フロー               | ファイルノードクリック → readFile IPC → textarea にコンテンツ表示の一連フローが動作する                       |
| INT-02    | ファイル編集→保存→変更フラグリセットの完全フロー | textarea 編集 → 保存ボタンクリック → writeFile IPC → hasChanges が false にリセットされる                     |
| INT-03    | 未保存変更→ダイアログ→保存して続行の完全フロー   | 編集 → 別ファイルクリック → ダイアログ表示 → 「保存して続行」→ writeFile IPC → 新ファイル読み込みの一連フロー |
| INT-04    | 未保存変更→ダイアログ→保存せず続行の完全フロー   | 編集 → 別ファイルクリック → ダイアログ表示 → 「保存せず続行」→ writeFile 呼ばれない → 新ファイル読み込み      |
| INT-05    | 未保存変更→ダイアログ→キャンセルの完全フロー     | 編集 → 別ファイルクリック → ダイアログ表示 → 「キャンセル」→ 元のファイルが選択状態のまま                     |
| INT-06    | 複数ファイルの順次編集・保存フロー               | ファイル A 選択→編集→保存 → ファイル B 選択→編集→保存 の連続操作が正常に動作する                              |

3. 各テストで `await act(async () => { ... })` を使用して非同期 IPC 呼び出しを処理する（P39 対策）

**期待される成果物**:

- `apps/desktop/src/renderer/views/SkillEditorView/__tests__/SkillEditorView.integration.test.tsx`（6 ケース）

### タスク 6: カバレッジ再測定

**目的**: タスク 2-5 の追加テスト後にカバレッジを再測定し、基準充足を確認する。

**実行手順**:

1. 以下のコマンドでカバレッジを再測定する:
   ```bash
   cd apps/desktop && pnpm vitest run --coverage src/renderer/views/SkillEditorView/
   ```
2. 各ファイルの Line / Branch / Function カバレッジを記録する
3. 基準充足を判定する:
   - Line >= 80%: ✅ / ❌
   - Branch >= 60%: ✅ / ❌
   - Function >= 80%: ✅ / ❌
4. 基準未達の場合:
   - 未カバー行・ブランチを特定する
   - 追加テストケースを作成して再測定する
   - 3 回繰り返しても未達の場合は Phase 7 で詳細分析する
5. 結果を `outputs/phase-6/coverage-report.md` に記録する

**期待される成果物**:

- `docs/30-workflows/skill-editor-view/outputs/phase-6/coverage-report.md`

## 参照資料

| 参照資料             | パス                                                                            | 内容                 |
| -------------------- | ------------------------------------------------------------------------------- | -------------------- |
| Phase 4 テスト仕様   | `docs/30-workflows/skill-editor-view/phase-4-test-creation.md`                  | 基本テストケース定義 |
| Phase 5 実装サマリー | `docs/30-workflows/skill-editor-view/outputs/phase-5/implementation-summary.md` | 実装結果レポート     |
| テストカバレッジ基準 | `.claude/skills/task-specification-creator/references/coverage-standards.md`    | 最低/推奨基準        |
| IPC セキュリティ     | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`    | エラーサニタイズ方針 |

## 成果物

| 成果物                 | パス                                                                                             | 説明                       |
| ---------------------- | ------------------------------------------------------------------------------------------------ | -------------------------- |
| 初回カバレッジレポート | `docs/30-workflows/skill-editor-view/outputs/phase-6/coverage-initial.md`                        | Phase 4-5 時点のカバレッジ |
| 境界値テスト           | `apps/desktop/src/renderer/views/SkillEditorView/__tests__/SkillEditorView.boundary.test.tsx`    | 10 ケース                  |
| 異常系テスト           | `apps/desktop/src/renderer/views/SkillEditorView/__tests__/SkillEditorView.error.test.tsx`       | 8 ケース                   |
| アクセシビリティテスト | `apps/desktop/src/renderer/views/SkillEditorView/__tests__/SkillEditorView.a11y.test.tsx`        | 6 ケース                   |
| 統合テスト             | `apps/desktop/src/renderer/views/SkillEditorView/__tests__/SkillEditorView.integration.test.tsx` | 6 ケース                   |
| カバレッジレポート     | `docs/30-workflows/skill-editor-view/outputs/phase-6/coverage-report.md`                         | 追加後のカバレッジ         |

## 統合テスト連携【必須】

| テストカテゴリ           | 検証項目                                        | テストファイル                         | 目標 |
| ------------------------ | ----------------------------------------------- | -------------------------------------- | ---- |
| IPC 接続テスト           | readFile / writeFile チャンネル疎通             | `SkillEditorView.integration.test.tsx` | 100% |
| E2E データフロー         | 選択→読込→編集→保存の往復フロー                 | `SkillEditorView.integration.test.tsx` | 100% |
| エラーリカバリ           | IPC エラー後の復帰フロー                        | `SkillEditorView.error.test.tsx`       | 100% |
| 複数ファイル操作         | 複数ファイルの順次編集・保存                    | `SkillEditorView.integration.test.tsx` | 100% |
| 未保存変更ダイアログ連携 | 3 選択肢の完全フロー                            | `SkillEditorView.integration.test.tsx` | 100% |
| a11y 属性                | aria-expanded / aria-selected / aria-modal 連動 | `SkillEditorView.a11y.test.tsx`        | 100% |
| リスナークリーンアップ   | アンマウント後のキーボードリスナー解除          | `SkillEditorView.a11y.test.tsx`        | 100% |
| 境界値                   | 大ファイル / 深いネスト / 特殊文字              | `SkillEditorView.boundary.test.tsx`    | 100% |

## 完了条件

- [ ] 初回カバレッジ測定が完了し、不足箇所が特定されている
- [ ] 境界値テスト（10 ケース: BND-01〜BND-10）が作成・PASS している
- [ ] 異常系テスト（8 ケース: ERR-01〜ERR-08）が作成・PASS している
- [ ] アクセシビリティテスト（6 ケース: A11Y-01〜A11Y-06）が作成・PASS している
- [ ] 統合テスト（6 ケース: INT-01〜INT-06）が作成・PASS している
- [ ] 合計 94 ケース（Phase 4: 64 + Phase 6: 30）が全て PASS している
- [ ] happy-dom 環境で fireEvent を使用している（userEvent 不使用: P39 対策）
- [ ] `beforeEach` でモックをリセットしている（P9 対策）
- [ ] テスト間で状態を共有していない
- [ ] カバレッジ再測定が完了し、結果が記録されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## Phase 末端アクション【必須】

1. 全完了条件のチェックボックスを確認する
2. `outputs/phase-6/coverage-initial.md` に初回カバレッジ結果を記録する
3. `outputs/phase-6/coverage-report.md` に追加後カバレッジ結果を記録する
4. テストケース数の集計を確認する（合計 94 ケース = Phase 4: 64 + Phase 6: 30）

## 依存関係

| 方向 | Phase / タスク            | 内容                         |
| ---- | ------------------------- | ---------------------------- |
| 入力 | Phase 4（テスト作成）     | 基本テスト 64 ケース         |
| 入力 | Phase 5（実装）           | 全コンポーネント・フック実装 |
| 出力 | Phase 7（カバレッジ確認） | カバレッジ基準充足判定       |

## 次の Phase

Phase 7（カバレッジ確認）へ進む。Phase 6 の追加テスト後のカバレッジが基準（Line 80%+, Branch 60%+, Function 80%+）を充足しているか最終確認する。未達の場合は Phase 6 へ戻る。
