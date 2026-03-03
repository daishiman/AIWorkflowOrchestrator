# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| Phase      | 11                        |
| Phase名    | 手動テスト                |
| タスクID   | UT-UI-05A-GETFILETREE-001 |
| 前提Phase  | Phase 10（最終レビュー）  |
| 後続Phase  | Phase 12（ドキュメント）  |
| ステータス | 未実施                    |
| 作成日     | 2026-03-03                |
| 機能名     | getfiletree-ipc           |
| Issue      | #948                      |

---

## 目的

Electron 実環境およびユニットテスト結果を用いて、`skill:getFileTree` IPCハンドラーの動作を検証する。
自動テストでは検証できない実環境固有の動作とセキュリティ境界の動作を確認する。

## 背景

`skill:getFileTree` はスキルエディタのファイルツリー表示に使用されるIPCチャンネルである。
Main Process と Renderer Process の境界に位置するため、ユニットテストだけでは実際のプロセス間通信の動作を完全には検証できない。
DevTools コンソールからの直接呼び出しにより、実環境での動作を確認する。

---

## テスト実施方針

### 制限事項

- Preload API のスタブ未解消チャンネルが存在する場合、DevTools からの直接呼び出しが不可能な場合がある
- その場合はユニットテスト結果をもって手動テストの代替とする
- 代替判断は Phase 11 実施時に決定し、理由を `outputs/phase-11/manual-test-report.md` に記録する

### 検証方法

| 方法                           | 対象                                     | 優先度 |
| ------------------------------ | ---------------------------------------- | ------ |
| DevToolsコンソール直接呼び出し | `window.electronAPI.skill.getFileTree()` | 高     |
| ユニットテスト結果の確認       | skillFileHandlers テスト                 | 高     |
| SkillEditorView での動作確認   | ファイルツリー表示・展開・選択           | 高     |
| コードリーディング             | セキュリティ実装の確認                   | 中     |

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 自動テストの実行確認

**目的**: 手動テスト前に自動テストが全てパスすることを確認する

**実行手順**:

1. skillFileHandlers のユニットテストを実行する
2. 全テストがパスすることを確認する
3. テスト結果サマリーを記録する

**コマンド**:

```bash
# skillFileHandlers テスト実行
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillFileHandlers --reporter=verbose
```

**期待される成果物**:

- `outputs/phase-11/auto-test-result.md`

---

### タスク2: SkillEditorView でのファイルツリー表示確認

**目的**: SkillEditorView で `skill:getFileTree` の結果が正しく表示されることを確認する

**テストケーステーブル**:

| #   | テストケース             | 操作手順                                                | 期待される結果                             | 確認結果 |
| --- | ------------------------ | ------------------------------------------------------- | ------------------------------------------ | -------- |
| 1   | ファイルツリーの初期表示 | アプリ起動 → スキルセンター → スキル選択 → エディタ表示 | ファイルツリーが左パネルに表示される       | -        |
| 2   | ディレクトリ展開         | ツリー内のディレクトリアイコンをクリック                | 子ノードが展開表示される                   | -        |
| 3   | ディレクトリ折りたたみ   | 展開済みディレクトリアイコンをクリック                  | 子ノードが非表示になる                     | -        |
| 4   | ファイル選択             | ツリー内のファイルをクリック                            | エディタにファイルコンテンツが読み込まれる | -        |
| 5   | ネストされたディレクトリ | 多階層ディレクトリ構造のスキルを選択                    | 全階層が正しく表示される                   | -        |

**期待される成果物**:

- `outputs/phase-11/filetree-display-result.md`

---

### タスク3: エラーケースの手動確認

**目的**: 異常系での動作が安全であることを確認する

**テストケーステーブル**:

| #   | テストケース                     | 操作手順                                                         | 期待される結果                                  | 確認結果 |
| --- | -------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------- | -------- |
| 1   | 存在しないスキル名               | DevTools: `window.electronAPI.skill.getFileTree("nonexistent")`  | エラーが返される（内部パスが漏洩しない）        | -        |
| 2   | 空文字列のスキル名               | DevTools: `window.electronAPI.skill.getFileTree("")`             | バリデーションエラーが返される                  | -        |
| 3   | スペースのみのスキル名           | DevTools: `window.electronAPI.skill.getFileTree("   ")`          | バリデーションエラーが返される（P42: trim対策） | -        |
| 4   | パストラバーサル文字列           | DevTools: `window.electronAPI.skill.getFileTree("../../../etc")` | エラーが返される（ファイルアクセスされない）    | -        |
| 5   | ネットワーク遅延シミュレーション | DevTools: Network タブで Slow 3G に設定後に操作                  | タイムアウトまたは明示的なローディング表示      | -        |

**期待される成果物**:

- `outputs/phase-11/error-case-result.md`

---

### タスク4: DevTools での API 確認

**目的**: Preload API が正しく公開されていることを直接確認する

**テストケーステーブル**:

| #   | テストケース            | 操作手順                                                                 | 期待される結果                                  | 確認結果 |
| --- | ----------------------- | ------------------------------------------------------------------------ | ----------------------------------------------- | -------- |
| 1   | API 公開確認            | DevTools: `typeof window.electronAPI.skill.getFileTree`                  | `"function"` が返される                         | -        |
| 2   | 正常呼び出し            | DevTools: `await window.electronAPI.skill.getFileTree("existing-skill")` | SkillFileTreeNode[] が返される                  | -        |
| 3   | 戻り値構造確認          | 上記結果の1要素を展開して確認                                            | name, path, type, children プロパティが含まれる | -        |
| 4   | type プロパティ確認     | ディレクトリノードの type を確認                                         | `"directory"` が返される                        | -        |
| 5   | children プロパティ確認 | ディレクトリノードの children を確認                                     | 子ノードの配列が返される                        | -        |

**期待される成果物**:

- `outputs/phase-11/api-verification-result.md`

---

### タスク5: スクリーンショット撮影

**目的**: テスト証跡としてスクリーンショットを取得する

**撮影対象**:

| #   | 撮影対象                     | ファイル名                   |
| --- | ---------------------------- | ---------------------------- |
| 1   | ファイルツリーの初期表示     | `filetree-initial.png`       |
| 2   | ディレクトリ展開状態         | `filetree-expanded.png`      |
| 3   | ファイル選択状態             | `filetree-file-selected.png` |
| 4   | DevTools API 呼び出し結果    | `devtools-api-result.png`    |
| 5   | エラーケースの DevTools 出力 | `devtools-error-case.png`    |

**期待される成果物**:

- `outputs/phase-11/screenshots/` ディレクトリ内に上記スクリーンショットを配置

---

## 参照資料

| 資料名                        | パス                                      |
| ----------------------------- | ----------------------------------------- |
| Phase 10 成果物               | `outputs/phase-10/final-review-result.md` |
| Phase 1 要件定義              | `phase-1-requirements.md`                 |
| セキュリティルール            | `.claude/rules/04-electron-security.md`   |
| 既知の落とし穴（P42）         | `.claude/rules/06-known-pitfalls.md`      |
| 手動テストでの削除確認（P28） | `.claude/rules/06-known-pitfalls.md`      |

依存Phase参照: Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10

---

## 統合テスト連携

| 連携対象                   | 観点                                         | 本Phaseでの扱い                                              |
| -------------------------- | -------------------------------------------- | ------------------------------------------------------------ |
| IPC契約（Renderer → Main） | skill:getFileTree の引数・戻り値・エラー契約 | Phase 11 の定義/成果物と api-ipc-agent.md を照合する         |
| Preload API                | safeInvokeUnwrap 経由の型安全な公開契約      | interfaces-agent-sdk-skill.md のメソッド契約と整合を維持する |
| Main Process               | validateIpcSender と P42 3段バリデーション   | security-electron-ipc.md の防御要件を満たすことを確認する    |
| テスト連携                 | 単体テスト・統合観点の引き継ぎ               | 直前Phase成果物を参照し、次Phaseへ検証条件を明示する         |

## 成果物

| 成果物                       | パス                                          |
| ---------------------------- | --------------------------------------------- |
| 自動テスト結果               | `outputs/phase-11/auto-test-result.md`        |
| ファイルツリー表示テスト結果 | `outputs/phase-11/filetree-display-result.md` |
| エラーケーステスト結果       | `outputs/phase-11/error-case-result.md`       |
| API検証結果                  | `outputs/phase-11/api-verification-result.md` |
| スクリーンショット           | `outputs/phase-11/screenshots/`               |
| 手動テストレポート           | `outputs/phase-11/manual-test-report.md`      |

---

## 完了条件

- [ ] タスク1: 全自動テストがパスすることを確認した
- [ ] タスク2: ファイルツリー表示の全テストケースを実行し結果を記録した
- [ ] タスク3: エラーケースの全テストケースを実行し結果を記録した
- [ ] タスク4: DevTools での API 確認を全て実行し結果を記録した
- [ ] タスク5: 全スクリーンショットを撮影し配置した
- [ ] 手動テストレポート `outputs/phase-11/manual-test-report.md` を作成した
- [ ] 全手動テストケースが PASS（または代替理由を記録済み）

---

## 次Phase

Phase 12（ドキュメント）へ進む
