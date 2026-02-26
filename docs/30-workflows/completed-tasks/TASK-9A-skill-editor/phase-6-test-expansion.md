# Phase 6: テスト拡充

## メタ情報

| 項目      | 値                                                               |
| --------- | ---------------------------------------------------------------- |
| Phase     | 6                                                                |
| 機能名    | TASK-9A-skill-editor                                             |
| 作成日    | 2026-02-26                                                       |
| 前提Phase | Phase 5（実装）完了                                              |
| 目的      | カバレッジ不足箇所を特定し、テストを追加してカバレッジを改善する |

## 目的

Phase 5 の実装完了後、カバレッジ計測を実施してカバレッジ不足箇所を特定する。境界値テスト・異常系テスト・エッジケーステストを追加し、Phase 7 のカバレッジ確認で基準を満たすレベルまでテストを拡充する。

## 実行タスク

- Task 1: カバレッジ計測と不足箇所の特定
- Task 2: SkillFileManager エッジケーステスト追加
- Task 3: IPC ハンドラー追加テスト
- Task 4: Renderer コンポーネント追加テスト
- Task 5: 統合テスト拡充

## 参照資料

| 資料名                 | パス                                                                                        | 説明                             |
| ---------------------- | ------------------------------------------------------------------------------------------- | -------------------------------- |
| Phase 4 テスト成果物   | `outputs/phase-4/`                                                                          | 初期テスト（67テスト）           |
| Phase 5 実装成果物     | `outputs/phase-5/`                                                                          | 実装コード（カバレッジ計測対象） |
| セキュリティAPI仕様    | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | セキュリティテスト追加の基準     |
| エラーハンドリング仕様 | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーカテゴリの網羅性確認       |
| アーキテクチャ概要     | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | レイヤー別カバレッジ確認         |
| IPC契約チェックリスト  | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | IPC契約のテスト網羅性確認        |
| 実装パターン           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | テストパターン参照               |

## 実行手順

### Task 1: カバレッジ計測と不足箇所の特定

#### 1.1 カバレッジ計測コマンド

```bash
# SkillFileManager のカバレッジ
cd apps/desktop && pnpm vitest run --coverage \
  src/main/services/skill/__tests__/SkillFileManager.test.ts \
  src/main/services/skill/__tests__/SkillFileManager.security.test.ts

# IPC ハンドラーのカバレッジ
cd apps/desktop && pnpm vitest run --coverage \
  src/main/ipc/__tests__/skillFileHandlers.test.ts \
  src/main/ipc/__tests__/skillFileHandlers.security.test.ts \
  src/main/ipc/__tests__/skillFileHandlers.integration.test.ts

# Renderer コンポーネントのカバレッジ
cd apps/desktop && pnpm vitest run --coverage \
  src/renderer/components/skill/__tests__/SkillEditor.test.tsx \
  src/renderer/components/skill/__tests__/SkillCodeEditor.test.tsx

# Store のカバレッジ
cd apps/desktop && pnpm vitest run --coverage \
  src/renderer/store/slices/__tests__/skillSlice.editor.test.ts
```

#### 1.2 カバレッジ基準

| 指標              | 最低基準 | 推奨基準 | 対象ファイル   |
| ----------------- | -------- | -------- | -------------- |
| Line Coverage     | 80%      | 90%      | 全実装ファイル |
| Branch Coverage   | 60%      | 70%      | 全実装ファイル |
| Function Coverage | 80%      | 90%      | 全実装ファイル |

#### 1.3 未カバー箇所の特定手順

```bash
# 1. カバレッジHTMLレポートを生成
cd apps/desktop && pnpm vitest run --coverage --reporter=html

# 2. 未カバー行の特定（v8 プロバイダ）
# coverage/index.html をブラウザで開き、未カバー行（赤色）を確認

# 3. ファイル別カバレッジの確認
# 各ファイルの Line/Branch/Function を一覧化
```

### Task 2: SkillFileManager エッジケーステスト追加

**テストファイル**: `apps/desktop/src/main/services/skill/__tests__/SkillFileManager.edge.test.ts`（新規作成）

#### 2.1 ファイルシステムエッジケース

| No   | テスト項目                                      | 期待結果                                               |
| ---- | ----------------------------------------------- | ------------------------------------------------------ |
| X-01 | 空ファイル（0バイト）の読み込み                 | 空文字列 "" が返却される                               |
| X-02 | 大容量ファイル（1MB以上）の読み込み             | 内容が正しく返却される                                 |
| X-03 | UTF-8 以外の文字エンコーディングのファイル      | エラーまたはバッファが返却される                       |
| X-04 | ファイル名に日本語を含むパス                    | 正しく読み書きできる                                   |
| X-05 | ファイル名にスペースを含むパス                  | 正しく読み書きできる                                   |
| X-06 | 深いネスト（5階層以上）のディレクトリ内ファイル | 正しく読み書きできる                                   |
| X-07 | 同時に複数の writeFile 呼び出し（競合状態）     | 全ての書き込みが成功し、バックアップが個別に作成される |

#### 2.2 バックアップ関連エッジケース

| No   | テスト項目                                           | 期待結果                                       |
| ---- | ---------------------------------------------------- | ---------------------------------------------- |
| X-08 | バックアップが0件のスキルで listBackups              | 空配列 [] が返却される                         |
| X-09 | 複数バックアップがあるファイルの listBackups         | タイムスタンプ順にソートされた一覧が返却される |
| X-10 | .backup と .deleted の混在した listBackups           | type フィールドで正しく分類される              |
| X-11 | 復元対象の元ファイルが存在しない場合の restoreBackup | 新規ファイルとして復元される                   |

#### 2.3 パストラバーサル追加ケース

| No   | テスト項目                                        | 期待結果                          |
| ---- | ------------------------------------------------- | --------------------------------- |
| X-12 | URL エンコードされたパストラバーサル（`%2e%2e/`） | PathTraversalError がスローされる |
| X-13 | ヌルバイト注入（`\0`）                            | PathTraversalError がスローされる |
| X-14 | Windows スタイルのパス区切り（`..\\`）            | PathTraversalError がスローされる |

### Task 3: IPC ハンドラー追加テスト

**テストファイル**: `apps/desktop/src/main/ipc/__tests__/skillFileHandlers.test.ts`（追加）

#### 3.1 バリデーション境界値テスト

| No   | テスト項目                                        | 期待結果                             |
| ---- | ------------------------------------------------- | ------------------------------------ |
| V-01 | skillName が1文字（最短有効値）                   | 正常処理される                       |
| V-02 | skillName が255文字（最長有効値）                 | 正常処理される                       |
| V-03 | relativePath が "./" のみ（カレントディレクトリ） | 正常処理される（または適切なエラー） |
| V-04 | content が空文字列（0バイト書き込み）             | 正常処理される（空ファイル作成）     |
| V-05 | 全ハンドラーで null 引数                          | `{ success: false }` が返却される    |
| V-06 | 全ハンドラーでオブジェクトではなく配列引数        | `{ success: false }` が返却される    |

#### 3.2 エラー伝搬テスト

| No   | テスト項目                                              | 期待結果                                               |
| ---- | ------------------------------------------------------- | ------------------------------------------------------ |
| V-07 | SkillFileManager が TypeError をスローした場合          | `{ success: false, error: "Internal error" }`          |
| V-08 | SkillFileManager が RangeError をスローした場合         | `{ success: false, error: "Internal error" }`          |
| V-09 | scanAvailableSkills() が失敗しても writeFile は成功する | `{ success: true }` が返却される（副作用エラーは無視） |

#### 3.3 セキュリティ追加テスト（P41対策）

| No   | テスト項目                                                      | 期待結果                                       |
| ---- | --------------------------------------------------------------- | ---------------------------------------------- |
| V-10 | validateIpcSender の getAllowedWindows コールバックの戻り値検証 | mainWindow を含む配列が返却される              |
| V-11 | toIPCValidationError のエラーメッセージ形式検証                 | 期待される形式のエラーオブジェクトが返却される |

### Task 4: Renderer コンポーネント追加テスト

#### 4.1 SkillEditor 追加テスト

**テストファイル**: `apps/desktop/src/renderer/components/skill/__tests__/SkillEditor.test.tsx`（追加）

| No   | テスト項目                                                 | 期待結果                               |
| ---- | ---------------------------------------------------------- | -------------------------------------- |
| R-01 | ファイルツリーのディレクトリが展開・折りたたみできる       | 展開/折りたたみ状態が切り替わる        |
| R-02 | ファイル読み込み中にローディング表示が出る                 | ローディングインジケーターが表示される |
| R-03 | 読み込みエラー時にエラーメッセージが表示される             | エラーメッセージが DOM に含まれる      |
| R-04 | 未保存変更がある状態で別ファイル選択時に警告が出る         | 確認ダイアログが表示される             |
| R-05 | アクセシビリティ: キーボードでファイルツリーを操作できる   | Tab/Enter/Arrow でナビゲーション可能   |
| R-06 | アクセシビリティ: エディターに aria-label が付与されている | aria-label 属性が存在する              |

#### 4.2 SkillCodeEditor 追加テスト

**テストファイル**: `apps/desktop/src/renderer/components/skill/__tests__/SkillCodeEditor.test.tsx`（追加）

| No   | テスト項目                                | 期待結果                             |
| ---- | ----------------------------------------- | ------------------------------------ |
| R-07 | 空の content で正しくレンダリングされる   | テキストエリアが空の状態で表示される |
| R-08 | 非常に長いテキスト（10000行）が表示できる | スクロール可能な状態で表示される     |
| R-09 | Esc キーでフォーカスが外れる              | テキストエリアのフォーカスが外れる   |

### Task 5: 統合テスト拡充

**テストファイル**: `apps/desktop/src/main/ipc/__tests__/skillFileHandlers.integration.test.ts`（追加）

| No   | テスト項目                                                  | 期待結果                                         |
| ---- | ----------------------------------------------------------- | ------------------------------------------------ |
| T-05 | 読み取り専用スキルの readFile → writeFile（異常系フロー）   | readFile 成功後、writeFile で ReadonlySkillError |
| T-06 | createFile → writeFile → deleteFile のフルライフサイクル    | 作成・編集・削除が全て成功する                   |
| T-07 | 存在しないスキルへの全操作が SkillNotFoundError             | 6チャンネル全てで SkillNotFoundError             |
| T-08 | 連続バックアップの整合性（3回書き込み → 3バックアップ確認） | listBackups で3件のバックアップが返却される      |

## 統合テスト連携【必須】

| 接続要件カテゴリ          | テスト拡充での対応                                                  |
| ------------------------- | ------------------------------------------------------------------- |
| IPC チャンネル契約        | T-05〜T-08 で異常系・ライフサイクル・連続操作の統合テストを追加     |
| セキュリティ境界          | V-10〜V-11 で validateIpcSender コールバックの検証を追加（P41対策） |
| エッジケース              | X-01〜X-14 で境界値・特殊文字・競合状態のテストを追加               |
| Renderer アクセシビリティ | R-05〜R-06 でキーボード操作・ARIA ラベルのテストを追加              |

> **注記**: カバレッジ計測結果に基づき、追加テストの優先順位を調整する。推奨基準（Line 90%, Branch 70%, Function 90%）の達成を目指す。

## カバレッジ基準テーブル

### ユニットテストカバレッジ

| ファイル                    | Line目標 | Branch目標 | Function目標 |
| --------------------------- | -------- | ---------- | ------------ |
| SkillFileManager.ts         | 90%      | 70%        | 90%          |
| errors.ts                   | 100%     | 100%       | 100%         |
| skillFileHandlers.ts        | 90%      | 70%        | 90%          |
| SkillEditor.tsx             | 80%      | 60%        | 80%          |
| SkillCodeEditor.tsx         | 90%      | 70%        | 90%          |
| skillSlice.ts（エディター） | 80%      | 60%        | 80%          |

### 結合テストカバレッジ

| テスト範囲                     | Line目標 | 補足                                     |
| ------------------------------ | -------- | ---------------------------------------- |
| IPC → SkillFileManager 統合    | 80%      | T-01〜T-08 の統合テストで計測            |
| Renderer → Preload → Main 統合 | 60%      | エンドツーエンドの統合は Phase 11 で補完 |

## Pitfall 対策チェックリスト

| Pitfall ID | 対策                                                | 適用テスト       |
| ---------- | --------------------------------------------------- | ---------------- |
| P41        | getAllowedWindows コールバック戻り値を明示的に検証  | V-10 ~ V-11      |
| P39        | happy-dom環境では fireEvent 使用（userEvent 禁止）  | R-01 ~ R-09      |
| P9         | テスト間で状態を共有しない（beforeEach でリセット） | 全追加テスト     |
| P13        | タイマー系テストでは advanceTimersByTime を使用     | X-07（競合状態） |

## 成果物

| 成果物                        | パス                                                                                      | 説明                         |
| ----------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------- |
| SkillFileManager エッジケース | `apps/desktop/src/main/services/skill/__tests__/SkillFileManager.edge.test.ts`            | 14テスト（X-01〜X-14）       |
| IPC 追加テスト                | `apps/desktop/src/main/ipc/__tests__/skillFileHandlers.test.ts`（追加分）                 | 11テスト（V-01〜V-11）       |
| SkillEditor 追加テスト        | `apps/desktop/src/renderer/components/skill/__tests__/SkillEditor.test.tsx`（追加分）     | 6テスト（R-01〜R-06）        |
| SkillCodeEditor 追加テスト    | `apps/desktop/src/renderer/components/skill/__tests__/SkillCodeEditor.test.tsx`（追加分） | 3テスト（R-07〜R-09）        |
| 統合テスト追加                | `apps/desktop/src/main/ipc/__tests__/skillFileHandlers.integration.test.ts`（追加分）     | 4テスト（T-05〜T-08）        |
| カバレッジレポート            | `outputs/phase-6/coverage-report.md`                                                      | カバレッジ計測結果と改善記録 |

**追加テスト数**: 38テスト（X:14 + V:11 + R:9 + T:4）
**累計テスト数**: 105テスト（Phase 4: 67 + Phase 6: 38）

## 完了条件

- [ ] カバレッジ計測が実施され、不足箇所が特定されている
- [ ] エッジケーステスト（X-01〜X-14）が追加されている
- [ ] バリデーション境界値テスト（V-01〜V-06）が追加されている
- [ ] セキュリティ追加テスト（V-10〜V-11）が P41 対策として追加されている
- [ ] アクセシビリティテスト（R-05〜R-06）が追加されている
- [ ] 統合テスト（T-05〜T-08）が追加されている
- [ ] 全追加テストが PASS している
- [ ] カバレッジレポートが outputs/phase-6/ に作成されている

## TDD 検証

```bash
# 全テスト実行（Phase 4 + Phase 6 の合計）
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillFileHandlers
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/
cd apps/desktop && pnpm vitest run src/renderer/store/slices/__tests__/skillSlice.editor

# カバレッジ付き実行
cd apps/desktop && pnpm vitest run --coverage \
  src/main/services/skill/__tests__/ \
  src/main/ipc/__tests__/skillFileHandlers* \
  src/renderer/components/skill/__tests__/ \
  src/renderer/store/slices/__tests__/skillSlice.editor
```

## 次のPhase

Phase 7: カバレッジ確認 — カバレッジ基準の充足を確認し、未達の場合は Phase 6 に戻る
