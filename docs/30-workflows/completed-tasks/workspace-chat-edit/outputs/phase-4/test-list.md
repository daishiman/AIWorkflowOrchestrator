# Phase 4: テストリスト（TDD Red Phase）

## メタ情報

| 項目       | 値                        |
| ---------- | ------------------------- |
| Phase      | 4                         |
| 機能名     | workspace-chat-edit       |
| 作成日     | 2026-01-23                |
| テスト総数 | 96件                      |
| 状態       | Red（全テスト失敗が期待） |

## テストファイル一覧

### 単体テスト

| ファイル                                       | テスト数 | カテゴリ        |
| ---------------------------------------------- | -------- | --------------- |
| `hooks/__tests__/useFileContext.test.ts`       | 12件     | フック          |
| `store/slices/__tests__/chatEditSlice.test.ts` | 15件     | Zustand Slice   |
| `hooks/__tests__/useDiffApply.test.ts`         | 12件     | Diff計算・適用  |
| `hooks/__tests__/useChatWithContext.test.ts`   | 9件      | LLM連携（予定） |

### 統合テスト

| ファイル                                   | テスト数 | カテゴリ     |
| ------------------------------------------ | -------- | ------------ |
| `__tests__/integration/ipc.test.ts`        | 12件     | IPC通信      |
| `__tests__/integration/dataflow.test.ts`   | 10件     | データフロー |
| `__tests__/integration/error.test.ts`      | 15件     | エラー処理   |
| `__tests__/integration/state-sync.test.ts` | 11件     | 状態同期     |

### 境界値テスト

| ファイル                     | テスト数 | カテゴリ       |
| ---------------------------- | -------- | -------------- |
| `__tests__/boundary.test.ts` | 14件     | 境界値・エッジ |

## テストID一覧

### 単体テスト（UT-xxx）

#### useFileContext（UT-001 ~ UT-004）

- **UT-001**: ファイルコンテキストを追加できる
- **UT-002**: ファイルコンテキストを削除できる
- **UT-003**: 全コンテキストをクリアできる
- **UT-004**: 重複ファイルの添付で警告が表示される

#### chatEditSlice（UT-005 ~ UT-010）

- **UT-005**: fileContextsの初期値は空配列
- **UT-006**: addFileContextで新しいコンテキストが追加される
- **UT-007**: removeFileContextで指定IDのコンテキストが削除される
- **UT-008**: clearAllContextsで全コンテキストがクリアされる
- **UT-009**: setGeneratedResultで結果が保存される
- **UT-010**: approveResultでステータスがapprovedになる

#### useDiffApply（UT-011 ~ UT-014）

- **UT-011**: 差分を正しく計算できる
- **UT-012**: modify hunkを正しく検出する
- **UT-013**: add hunkを正しく検出する
- **UT-014**: delete hunkを正しく検出する

### 統合テスト（IT-xxx）

#### IPC接続（IT-001 ~ IT-004）

- **IT-001**: 正常なファイルパスで内容が返される
- **IT-002**: 正常な書き込みでsuccess: trueが返される
- **IT-003**: エディタの選択範囲が返される
- **IT-004**: コンテキスト付きメッセージが送信される

#### データフロー（IT-005 ~ IT-007）

- **IT-005**: 添付→LLM→差分表示の一連の流れが正常に動作する
- **IT-006**: 複数ファイルを添付しても全て保持される
- **IT-007**: ストリーミング出力が正しく処理される

#### エラーハンドリング（IT-008 ~ IT-012）

- **IT-008**: 存在しないファイルでFILE_NOT_FOUNDエラー
- **IT-009**: 権限なしファイルでPERMISSION_DENIED
- **IT-010**: 10MB超過ファイルでTOO_LARGEエラー
- **IT-011**: LLM APIエラーでLLM_ERROR表示
- **IT-012**: タイムアウトでTIMEOUTエラー

#### 状態同期（IT-013 ~ IT-015）

- **IT-013**: fileContextsの変更がUIに即座に反映される
- **IT-014**: workspaceSliceから開いているファイル一覧を参照できる
- **IT-015**: LLM応答がchatSliceのメッセージ履歴に追加される

### 境界値テスト（BND-xxx）

#### ファイルサイズ境界（BND-001 ~ BND-005）

- **BND-001**: 空ファイル（0バイト）を処理できる
- **BND-002**: 1バイトファイルを処理できる
- **BND-003**: 1MB境界ファイルを正常に処理できる
- **BND-004**: 10MB境界ファイルを警告付きで処理できる
- **BND-005**: 10MB超過ファイルでTOO_LARGEエラー

#### コンテキスト数境界（BND-006 ~ BND-009）

- **BND-006**: 0件コンテキストで送信不可
- **BND-007**: 1件コンテキストで送信可能
- **BND-008**: 10件コンテキスト（最大）で送信可能
- **BND-009**: 11件コンテキストでエラーまたは警告

#### 選択範囲境界（BND-010 ~ BND-014）

- **BND-010**: 選択なしで全ファイル添付
- **BND-011**: 1文字選択で正常処理
- **BND-012**: 全ファイル選択で正常処理
- **BND-013**: 無効な範囲（逆順）でバリデーションエラー
- **BND-014**: 範囲外の行指定でバリデーションエラー

### 追加テストID

#### スライスドメインルール（UT-SLC-xxx）

- **UT-SLC-001**: openDiffPreviewでisDiffPreviewOpenがtrueになる
- **UT-SLC-002**: closeDiffPreviewでisDiffPreviewOpenがfalseになる
- **UT-SLC-003**: setLoadingでisLoading状態が変更される

#### Diffユーティリティ（UT-DIF-xxx）

- **UT-DIF-001**: applyResultでファイル書き込みIPCが呼ばれる
- **UT-DIF-002**: ファイル書き込み成功でbackupPathが返される
- **UT-DIF-003**: ファイル書き込み失敗でエラーが設定される

#### IPC追加（IT-IPC-xxx）

- **IT-IPC-001**: ファイルの言語が検出される
- **IT-IPC-002**: ストリーミング出力イベントを購読できる

#### データフロー追加（IT-DFL-xxx）

- **IT-DFL-001**: コンテキスト削除が即座に反映される
- **IT-DFL-002**: 適用後にUIが正しく更新される

#### エラー追加（IT-ERR-xxx）

- **IT-ERR-001**: リトライ可能エラーでリトライボタン表示
- **IT-ERR-002**: エラーメッセージがトースト表示される

#### 状態同期追加（IT-SYN-xxx）

- **IT-SYN-001**: 複数タブ間で状態が一貫する

## 受入条件マッピング

| AC-ID  | テストID                   |
| ------ | -------------------------- |
| AC-001 | UT-001, UT-002, IT-001     |
| AC-002 | UT-004, BND-009            |
| AC-003 | UT-009, UT-010, IT-004     |
| AC-004 | IT-005, IT-DFL-002         |
| AC-005 | IT-008, IT-009, IT-010     |
| AC-006 | IT-011, IT-012, IT-ERR-001 |

## テスト実行コマンド

```bash
# 全テスト実行
pnpm --filter @repo/desktop test

# 特定ファイルのテスト
pnpm --filter @repo/desktop test -- useFileContext.test.ts

# カバレッジレポート付き
pnpm --filter @repo/desktop test -- --coverage
```

## 期待される結果（Red Phase）

- すべてのテストが **失敗** すること
- 失敗理由: `expect(true).toBe(false)` アサーション
- Phase 5の実装後に **Green** 状態になることを確認
