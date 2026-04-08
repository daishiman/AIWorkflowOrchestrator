# Implementation Guide: UT-FIX-IPC-REGISTRATION-COMPLETENESS-CI-001

---

## Part 1: 中学生レベルでの説明

### なぜ必要か

名簿を作るしくみでは、同じ名前が二回書かれても気づきにくいことがある。気づかないままだと、いくつかの窓口が案内されない。だから、毎回名簿を見直して、重なりや抜けを見つける必要がある。

### 何をするか

受付名簿を作る本体を動かして、並んだ名前を集める。次に、順番をそろえて記録する。最後に、同じ名前が二回ないかを数え比べる。

### 日常の例え

学校の文化祭で各クラブの「相談窓口」を名簿管理する受付係を想像する。たとえば、同じクラブ名を 2 回書いてしまうと、後ろの行が使われなくなることがある。名簿チェック係が毎回重複と漏れを確認するのが今回のテストの役割。

### 今回作ったもの

| 日本語             | 英語                              | 役割                                |
| ------------------ | --------------------------------- | ----------------------------------- |
| 名簿チェックテスト | IPC handler registration snapshot | 18 個の窓口の重なりと抜けを見つける |
| 記録ファイル       | snapshot file                     | 登録一覧の記録を残す                |

本タスクは NON_VISUAL のため、スクリーンショットの追加撮影は不要。Phase 11 の `phase-11-manual-test.md` と `outputs/phase-11/manual-test-result.md` をあわせて代替証跡として参照する。

---

## Part 2: 技術詳細

### 型定義

`BrowserWindow` を最小スタブ化し、`string[]` で登録チャネルを保持する。

```typescript
type RegisteredChannel = string;
interface RuntimeHandlerContext {
  mainWindow: BrowserWindow;
  registered: RegisteredChannel[];
}
```

### API シグネチャ

```typescript
function registerRuntimeSkillCreatorHandlers(
  mainWindow: BrowserWindow,
  runtimeSkillCreatorService?: RuntimeSkillCreatorFacade,
  outputHandler?: SkillCreatorOutputHandler,
): void;
```

### 使用例

```typescript
vi.mock("electron", () => ({
  ipcMain: { handle: vi.fn() },
}));

const { registerRuntimeSkillCreatorHandlers } =
  await import("../creatorHandlers");
const { ipcMain } = await import("electron");

registerRuntimeSkillCreatorHandlers(mockMainWindow);

const channels = (ipcMain.handle as ReturnType<typeof vi.fn>).mock.calls
  .map(([channel]) => channel as string)
  .sort();

expect(channels).toMatchSnapshot();
expect(new Set(channels).size).toBe(channels.length);
```

### エラーハンドリング

| ケース               | 挙動                                             | 呼び出し側対応     |
| -------------------- | ------------------------------------------------ | ------------------ |
| スナップショット差分 | テスト FAIL。意図変更時のみ `--update-snapshots` | 差分をレビュー     |
| 重複チャネル検出     | Set サイズ不一致で FAIL                          | 登録箇所を修正     |
| チャネル未登録       | 件数差分で FAIL                                  | 欠損チャネルを追加 |

### エッジケース

| ケース                         | 期待動作                       |
| ------------------------------ | ------------------------------ |
| public runtime 16 件の順序変更 | ソート済み配列で決定論的に比較 |
| auxiliary 2 件の欠損           | スナップショット差分で FAIL    |
| チャネル名リネーム             | スナップショット差分で FAIL    |
| 18 件を超える登録（誤追加）    | スナップショット差分で FAIL    |

### 設定項目と定数一覧

| 名称                     | 値 / パス                                                                                       |
| ------------------------ | ----------------------------------------------------------------------------------------------- |
| public runtime channels  | 16 件（`skill-creator:*` 系）                                                                   |
| auxiliary channels       | 2 件（`skill-creator:configure-api`, `skill-creator:output-overwrite-approved`）                |
| 登録総数                 | 18 件                                                                                           |
| スナップショットファイル | `apps/desktop/src/main/ipc/__tests__/__snapshots__/ipcHandlerRegistrationSnapshot.test.ts.snap` |
| テストファイル           | `apps/desktop/src/main/ipc/__tests__/ipcHandlerRegistrationSnapshot.test.ts`                    |

### テスト構成

- `vi.mock("electron")` で `ipcMain.handle` を spy し、チャネル名を収集
- 収集結果をソートしてスナップショット比較 + Set 重複検出
- 18 チャネル（16 public runtime + 2 auxiliary）が揃っていることを確認

### Phase 11 補足

- 本タスクは NON_VISUAL のため、スクリーンショット参照は不要
- 代替証跡は [Phase 11 手動テスト結果](../phase-11/manual-test-result.md) を参照する
