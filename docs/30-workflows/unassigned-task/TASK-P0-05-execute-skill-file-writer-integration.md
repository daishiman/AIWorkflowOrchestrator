# execute フェーズ → SkillFileWriter 統合 - タスク指示書

## メタ情報

```yaml
issue_number: 1888
```

## メタ情報

| 項目         | 値                                                                                 |
| ------------ | ---------------------------------------------------------------------------------- |
| タスクID     | TASK-P0-05                                                                         |
| タスク名     | execute フェーズ → SkillFileWriter 統合                                            |
| 分類         | 新機能（Feature Gap系）                                                            |
| 対象機能     | Skill Creator Agent SDK Lane - スキルファイル書き出し                              |
| 優先度       | 高                                                                                 |
| 見積もり規模 | 中規模                                                                             |
| ステータス   | 未実施                                                                             |
| 発見元       | P0是正パック（ギャップ分析：execute() から SkillFileWriter が呼ばれていない）      |
| 発見日       | 2026-04-04                                                                         |
| Step         | 09（並列実行可能）                                                                 |
| 依存タスク   | TASK-RT-01, TASK-RT-02, TASK-RT-06（execute pipeline 安定化が前提）                |
| 後続タスク   | TASK-RT-03（結果表示パネル）、TASK-P0-02（verify→improve 閉ループ）                |
| 対象ファイル | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` ほか（後述） |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 ユーザー視点の問題

スキル作成フローの最終目的は **`.claude/skills/<name>/` にスキルファイルが出力されること** であり、
ユーザーはその後 Claude Code からスキルを呼び出せることを期待する。
しかし現状では execute フェーズが完了しても `.claude/skills/` に何も出力されない。

### 1.2 コード上の問題

`RuntimeSkillCreatorFacade.ts` の `_executeInternal()` には以下のコメントが残っている：

```typescript
// Step 3.5-3.6: LLM 応答からコンテンツ抽出 → SkillFileWriter.persist() (TASK-P0-05)
```

このコメントが示す通り、`parseLlmResponseToContent()` と `SkillFileWriter.persist()` の呼び出しは
**TASK-P0-05 の責務として意図的に未実装のまま残されている**。

実装の骨格（変数宣言・条件分岐・エラーキャプチャ）はすでに存在するが、
`skillFileWriter` が `Optional`（`skillFileWriter?: SkillFileWriter`）で DI されており、
注入されていない場合は `console.warn` を出力してスキップする状態になっている。

### 1.3 なぜ今やるか

TASK-RT-01/02/06 が execute pipeline を安定化させた後、最後の「書き出し」だけが抜けている。
この穴を埋めないと、スキル作成フロー全体がデモ・QA・本番いずれにおいても機能しない。

---

## 2. 何を達成するか（What）

### 2.1 ゴール（完了の定義）

- `execute()` 完了後に `SkillFileWriter.persist()` が確実に呼ばれ、`.claude/skills/<name>/` 以下にファイルが書き出される。
- `parseLlmResponseToContent()` の出力（`SkillGeneratedContent`）が `persist()` に正しく渡される。
- `persistResult` / `persistError` が `RuntimeSkillCreatorExecuteResult` に含まれてレスポンスとして返る。
- `SkillFileWriter` の DI が本番 DI コンテナ（`apps/desktop/src/main/ipc/index.ts`）で正しく注入される。
- 既存スキルの上書き時は `overwrite: true` で動作し、部分失敗時はロールバックが自動実行される。
- `SkillCreatorOutputHandler.ts`（untracked）の役割を確認し、`SkillFileWriter` との重複・統合方針を決定する。

### 2.2 スコープ外

| 除外項目                         | 担当タスク |
| -------------------------------- | ---------- |
| UIの結果表示パネル               | TASK-RT-03 |
| verify→improve→reverify 閉ループ | TASK-P0-02 |
| 上書き確認ダイアログ UI          | TASK-RT-03 |
| SkillRegistry への自動登録       | 別タスク   |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

以下が完了または安定していることを推奨する（並列実行は可能だが、不安定な場合はブロッカーになる）：

| タスク     | 必要な理由                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------- |
| TASK-RT-01 | LLM Adapter エラー伝播が正常でないと `response.success` が不正確                                                    |
| TASK-RT-02 | API Key UI/Adapter Status が正常でないと execute が起動しない                                                       |
| TASK-RT-06 | SDK メッセージ契約（`SkillCreatorSdkEvent`）が正規化されていないと `parseLlmResponseToContent()` が正常に動作しない |

### 3.2 依存タスク

```
TASK-RT-01 ──┐
TASK-RT-02 ──┤──→ TASK-P0-05 ──→ TASK-RT-03（結果表示）
TASK-RT-06 ──┘                └──→ TASK-P0-02（閉ループ）
```

### 3.3 必要な知識

#### 3.3.1 ファイル構成（実装に関わるもの）

```
apps/desktop/src/main/
  ipc/
    index.ts                                  # DI コンテナ・SkillFileWriter のインスタンス化箇所
  services/
    runtime/
      RuntimeSkillCreatorFacade.ts            # execute() 実装の中心。Step 3.5-3.6 が実装対象
      parseLlmResponseToContent.ts            # SDK イベント → SkillGeneratedContent 変換
      SkillCreatorOutputHandler.ts            # 別アプローチの出力ハンドラ（要調査・整合確認）
      __tests__/
        RuntimeSkillCreatorFacade.persist-integration.test.ts  # persist 統合テスト（AC 定義）
        parseLlmResponseToContent.test.ts     # パーサーテスト
    skill/
      SkillFileWriter.ts                      # 書き出し実装本体（SKILL.md / agents / scripts / references）
      __tests__/
        SkillFileWriter.test.ts               # SkillFileWriter 単体テスト
```

#### 3.3.2 データフロー

```
execute() 呼び出し
  └─ SkillExecutor.execute(request)
       └─ SDK セッション実行 → sdkEvents: SkillCreatorSdkEvent[]
            └─ parseLlmResponseToContent(sdkEvents)
                 └─ SkillGeneratedContent | null
                      └─ SkillFileWriter.persist(skillName, content, { overwrite: true })
                           └─ .claude/skills/<name>/SKILL.md
                                                     agents/*.md
                                                     scripts/*
                                                     references/*.md
```

#### 3.3.3 `SkillFileWriter.persist()` のインターフェース

```typescript
// apps/desktop/src/main/services/skill/SkillFileWriter.ts

class SkillFileWriter {
  constructor(basePath: string) {} // basePath = .claude/skills/

  async persist(
    skillName: string,
    content: SkillGeneratedContent,
    options?: PersistOptions, // { overwrite?: boolean }
  ): Promise<PersistResult>; // { skillPath: string; files: string[] }
}
```

- `skillName` にパストラバーサル文字（`..`, `/`, `\`）が含まれると `PATH_TRAVERSAL` エラーをスローする。
- `overwrite: false`（デフォルト）のとき、既存スキルが存在すると `SKILL_ALREADY_EXISTS` エラーをスローする。
- `writeFiles()` が部分失敗すると `rollback()` が自動実行され、書き出し済みファイルを削除する（アトミック性の保証）。

#### 3.3.4 DI の現状（`ipc/index.ts`）

```typescript
const skillBasePath = ...;  // .claude/skills/ への絶対パス
const skillFileWriter = new SkillFileWriter(skillBasePath);  // 行 1027

const runtimeSkillCreatorService = skillExecutor
  ? new RuntimeSkillCreatorFacade({
      ...
      skillFileWriter,   // 行 1038 で注入済み
      ...
    })
  : undefined;
```

**すでに DI は行われている**。ただし `skillFileWriter` が `Optional` 型（`skillFileWriter?: SkillFileWriter`）のため、
未注入時でも動作するようになっており、`console.warn` が出るだけでスキップされる。

#### 3.3.5 `SkillCreatorOutputHandler.ts` の役割

`SkillCreatorOutputHandler.ts` は **別アーキテクチャ**（SDK セッションテキスト全文を受け取り、マーカーで抽出するアプローチ）で
同じ目的（スキルファイル書き出し）を実装している。`RuntimeSkillCreatorFacade` とは統合されていない。
本タスクでは **`RuntimeSkillCreatorFacade` 側の実装（`parseLlmResponseToContent` + `SkillFileWriter`）を正式パスとする**方針で進める。
`SkillCreatorOutputHandler` は調査後に重複・統合・廃止を判断する。

### 3.4 推奨アプローチ（`SkillCreatorOutputHandler.ts` の調査から始める）

1. `SkillCreatorOutputHandler.ts` を読んで「もう一つのアプローチ」との差分を把握する。
2. `persist-integration.test.ts` の AC（受入条件）を読んでゴールを確認する。
3. `RuntimeSkillCreatorFacade.ts` の Step 3.5-3.6 コメント周辺を実装する。
4. `SkillFileWriter` の単体テストを実行して基本動作を確認する。
5. 統合テストを実行して AC を満たすことを確認する。

---

## 4. 実行手順

### Phase 1: 現状調査（SkillCreatorOutputHandler.ts 確認）【30分】

**目的**: 二重実装リスクを排除し、実装すべきコードの全体像を把握する。

#### 手順

1. `SkillCreatorOutputHandler.ts` を読む。

   ```bash
   # 確認コマンド
   cat apps/desktop/src/main/services/runtime/SkillCreatorOutputHandler.ts
   ```

   確認ポイント：
   - 抽出アプローチ（`<!-- SKILL_START -->` マーカーベース）
   - `saveSkill()` メソッドの書き出し先（`.claude/skills/<dirName>/SKILL.md`）
   - `handleSessionComplete()` の呼び出しタイミング
   - `SkillCreatorWorkflowEngine`・`RuntimeSkillCreatorFacade` との接続有無

2. `RuntimeSkillCreatorFacade.ts` の Step 3.5-3.6 周辺（行 1137〜1160）を読む。

   確認ポイント：
   - `parseLlmResponseToContent(sdkEvents)` の戻り値の使われ方
   - `skillFileWriter.persist()` の呼び出しコード（実装中か、プレースホルダーか）
   - `persistResult` / `persistError` の `executeResult` への組み込み方

3. `persist-integration.test.ts` を読んで AC（受入条件）を全て把握する。

   確認ポイント：
   - `E-11`〜`E-16` のテストケースが何を検証しているか
   - `skillFileWriter` が未DI の場合の挙動（`E-16`）
   - パース失敗・書き出し失敗時のエラーハンドリング（`E-14`, `E-15`）

4. 判断を記録する（メモで十分）：
   - `SkillCreatorOutputHandler` は残す / 廃止 / 別用途に流用するか
   - `RuntimeSkillCreatorFacade` の Step 3.5-3.6 は「実装中」か「未実装」か

---

### Phase 2: SkillFileWriter 設計確認【15分】

**目的**: `SkillFileWriter` の実装が期待通りに動作することを単体テストで確認する。

#### 手順

1. `SkillFileWriter.ts` を読んで以下を確認する：
   - `validateSkillName()` のパストラバーサル防止ロジック（`..`, `/`, `\` の拒否）
   - `writeFiles()` のアトミック性（`try/catch` + `rollback()`）
   - `overwrite: false` のときの `SKILL_ALREADY_EXISTS` エラー

2. `SkillFileWriter` の単体テストを実行する：

   ```bash
   pnpm --filter @repo/desktop test -- --testPathPattern=SkillFileWriter
   ```

   全テストがパスすることを確認する。パスしない場合は Phase 2.5 として修正する（本タスクスコープ内）。

3. `parseLlmResponseToContent` の単体テストを実行する：

   ```bash
   pnpm --filter @repo/desktop test -- --testPathPattern=parseLlmResponseToContent
   ```

---

### Phase 3: execute() への SkillFileWriter 統合【60分】

**目的**: `_executeInternal()` の Step 3.5-3.6 を完全実装する。

#### 手順

1. `RuntimeSkillCreatorFacade.ts` の行 1137〜1160 を確認し、未実装箇所を特定する。

   現状のコードパターン（参考）：

   ```typescript
   // Step 3.5-3.6: LLM 応答からコンテンツ抽出 → SkillFileWriter.persist() (TASK-P0-05)
   let persistResult: { skillPath: string; files: string[] } | null = null;
   let persistError: string | null = null;

   if (response.success) {
     try {
       const content = parseLlmResponseToContent(sdkEvents);

       if (content && this.skillFileWriter) {
         persistResult = await this.skillFileWriter.persist(
           planResult.skillName,
           content,
           { overwrite: true },
         );
       } else if (content && !this.skillFileWriter) {
         console.warn(
           "[RuntimeSkillCreatorFacade] skillFileWriter is not injected. " +
             "Skipping persist for generated content.",
         );
       }
     } catch (err) {
       persistError = err instanceof Error ? err.message : String(err);
     }
   }
   ```

   このコードが **実際に存在するか** を確認する。存在する場合は Phase 3 は完了（Phase 4 に進む）。
   存在しない場合は上記コードを `_executeInternal()` の適切な位置に追加する。

2. `executeResult` オブジェクトに `persistResult` / `persistError` が含まれているか確認する：

   ```typescript
   const executeResult: SkillExecuteResult = {
     executeId: response.executionId,
     skillName: ...,
     success: response.success,
     // ...
     persistResult,    // ← 含まれているか
     persistError,     // ← 含まれているか
   };
   ```

   含まれていない場合は追加する。

3. `@repo/shared/types` の `RuntimeSkillCreatorExecuteResult` 型に `persistResult` / `persistError` が定義されているか確認する：

   ```bash
   grep -n "persistResult\|persistError" packages/shared/src/types/*.ts
   ```

   型定義がない場合は追加する。

---

### Phase 4: パス安全性の確認【20分】

**目的**: パストラバーサル攻撃を防ぐ実装が正しく機能することを確認する。

#### 手順

1. `planResult.skillName` がどのように決定されるか確認する：
   - `plan()` フェーズで `parsePlanResponse()` が `skillName` を抽出する（行 873）。
   - LLM が返す文字列がそのまま `skillName` になる。
   - `SkillFileWriter.validateSkillName()` は `..`, `/`, `\` を拒否するが、**それ以外の危険文字**（例: `<`, `>`, `|`, `?`, `*`）は現状チェックしていない。

2. `validateSkillName()` を確認し、以下の危険ケースをカバーしているか確認する：

   | 入力例             | 期待動作                  |
   | ------------------ | ------------------------- |
   | `../etc/passwd`    | `PATH_TRAVERSAL` エラー   |
   | `skill/sub`        | `PATH_TRAVERSAL` エラー   |
   | `skill\\sub`       | `PATH_TRAVERSAL` エラー   |
   | `valid-skill-name` | 正常通過                  |
   | `` （空文字）      | `VALIDATION_ERROR` エラー |
   | `   `（空白のみ）  | `VALIDATION_ERROR` エラー |

3. `resolved.startsWith(normalizedBase + path.sep)` の二重チェックが存在することを確認する（行 104）。
   これが最終防衛ラインであり、除去しないこと。

4. OS 上の予約名（Windows: `CON`, `PRN`, `AUX` など）については、**Electron は macOS/Linux が主対象のため、現時点ではスコープ外**とする（TODO コメントを残す）。

---

### Phase 5: テスト実行と確認【30分】

**目的**: AC が全て満たされることを確認する。

#### 手順

1. `persist-integration.test.ts` を実行する：

   ```bash
   pnpm --filter @repo/desktop test -- --testPathPattern=persist-integration
   ```

   `E-11`〜`E-16` が全てパスすることを確認する。

2. `RuntimeSkillCreatorFacade` の全テストを実行する：

   ```bash
   pnpm --filter @repo/desktop test -- --testPathPattern=RuntimeSkillCreatorFacade
   ```

3. 型チェックを実行する：

   ```bash
   pnpm --filter @repo/desktop typecheck
   ```

4. Lint を実行する：

   ```bash
   pnpm --filter @repo/desktop lint
   ```

5. （任意）E2E 手動確認：開発環境でスキル作成フローを実行し、`.claude/skills/` にファイルが生成されることを確認する。

---

### Phase 6: 完了・ドキュメント更新【10分】

1. `SkillCreatorOutputHandler.ts` の扱いを決定し、コードコメントを更新する：
   - 廃止する場合: ファイルを削除し、関連 import を除去する
   - 残す場合: 「TASK-P0-05 では RuntimeSkillCreatorFacade 経由の SkillFileWriter が正式パス」とコメントを追加する

2. `ipc/index.ts` の DI コードが適切に機能していることを再確認する（`skillFileWriter` が必ず注入されるパスを確認）。

3. 本タスクの実装内容を PR 説明に記載する。

---

## 5. 完了条件チェックリスト

以下が**全て**チェックできたら本タスクは完了。

### 機能要件

- [ ] `execute()` が成功した際に `SkillFileWriter.persist()` が呼ばれる
- [ ] `parseLlmResponseToContent()` の戻り値が `persist()` に正しく渡される
- [ ] `persistResult`（書き出し先パス・ファイル一覧）が `executeResult` に含まれる
- [ ] `persistError`（エラー文字列）が `executeResult` に含まれ、`execute()` はエラーを握り潰さない
- [ ] `execute()` 失敗時は `persist()` が呼ばれない
- [ ] `parseLlmResponseToContent()` が `null` を返した場合（コードブロックなし）は `persist()` が呼ばれない
- [ ] `skillFileWriter` が未DI の場合は `console.warn` を出力してスキップし、`executeResult` は正常に返る

### セキュリティ要件

- [ ] `skillName` にパストラバーサル文字が含まれる場合は `PATH_TRAVERSAL` エラーが `persistError` に記録される
- [ ] `.claude/skills/` の外にファイルが書き出されない（`resolved.startsWith()` チェックが機能している）

### 非機能要件

- [ ] ファイル書き出しの部分失敗時にロールバックが実行される（`SkillFileWriter.rollback()` が機能している）
- [ ] `overwrite: true` オプションにより既存スキルが上書きされる
- [ ] TypeScript 型エラーがない（`pnpm typecheck` が通る）
- [ ] Lint エラーがない（`pnpm lint` が通る）

### テスト要件

- [ ] `RuntimeSkillCreatorFacade.persist-integration.test.ts` の `E-11`〜`E-16` が全てパスする
- [ ] `SkillFileWriter.test.ts` が全てパスする
- [ ] `parseLlmResponseToContent.test.ts` が全てパスする
- [ ] `RuntimeSkillCreatorFacade` の全テストがパスする（リグレッションなし）

---

## 6. 検証方法（.claude/skills/ に実際にファイルが生成されることを確認）

### 6.1 自動テストによる検証

```bash
# 1. SkillFileWriter 単体テスト
pnpm --filter @repo/desktop test -- --testPathPattern=SkillFileWriter

# 2. persist 統合テスト（AC 確認）
pnpm --filter @repo/desktop test -- --testPathPattern=persist-integration

# 3. Facade 全テスト（リグレッション確認）
pnpm --filter @repo/desktop test -- --testPathPattern=RuntimeSkillCreatorFacade

# 4. 型チェック
pnpm --filter @repo/desktop typecheck
```

### 6.2 手動 E2E 検証（任意・重要）

#### 手順

1. 開発環境を起動する：

   ```bash
   pnpm --filter @repo/desktop dev
   ```

2. Skill Creator UI を開き、適当なスキルを作成するフローを実行する。

3. execute フェーズが完了した後、以下を確認する：

   ```bash
   # 書き出し先を確認
   ls -la .claude/skills/<作成したスキル名>/

   # SKILL.md の内容を確認
   cat .claude/skills/<作成したスキル名>/SKILL.md
   ```

4. `SKILL.md` が存在し、LLM が生成したスキル定義が記載されていれば検証成功。

### 6.3 エラーケースの手動検証（省略可）

- `SkillCreatorFacade` の `skillFileWriter` を一時的にコメントアウトした状態で起動し、
  `console.warn` に `skillFileWriter is not injected` が出力されることを確認する。

---

## 7. リスクと対策

| リスク                                                                                     | 影響度 | 発生確率 | 対策                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------ | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `parseLlmResponseToContent()` がコードブロックを抽出できない（LLM 出力フォーマット不一致） | 高     | 中       | `null` 返却時は `persist()` をスキップして `persistResult: null` にする（スキル未生成として扱う）。UI 側（TASK-RT-03）で「スキルファイルが生成されませんでした」を表示する     |
| `skillFileWriter` の DI が実行時に `undefined` になる（設定ミス）                          | 高     | 低       | `ipc/index.ts` の DI コードを再確認。`skillFileWriter` が Optional のままでも `console.warn` で検出可能にしてある                                                              |
| `skillName` が空文字または `null` で `VALIDATION_ERROR` が発生する                         | 中     | 中       | `persistError` に記録して処理を継続する。`execute()` 全体は失敗させない                                                                                                        |
| 既存スキルが意図せず上書きされる                                                           | 中     | 低       | 現在は `overwrite: true` で固定。将来的に上書き確認 UI（TASK-RT-03）が必要になった場合は `overwrite: false` + `SKILL_ALREADY_EXISTS` ハンドリングに切り替える                  |
| `SkillCreatorOutputHandler.ts` との二重実装でファイルが重複書き出しされる                  | 中     | 低       | Phase 1 で接続経路を確認し、`OutputHandler` が `RuntimeSkillCreatorFacade` と接続されていないことを確認してから進める                                                          |
| `writeFiles()` の途中でクラッシュし、不完全なスキルディレクトリが残る                      | 低     | 低       | `SkillFileWriter.rollback()` が自動実行される実装になっている。ただし `rollback()` 自体が失敗する可能性もあるため、手動クリーンアップ手順を README に記載する（将来的な TODO） |

---

## 8. 参照情報

### 8.1 パストラバーサル防止

`SkillFileWriter.validateSkillName()` は以下の 2 段階チェックで防御している：

1. **文字列チェック**: `skillName.includes("..")` / `"/"` / `"\\"` で即時拒否
2. **パス解決チェック**: `path.resolve(basePath, skillName)` が `basePath + path.sep` で始まることを確認

2 段階にする理由：文字列チェックはエンコードや OS 差異により迂回される可能性があるため、
実際のパス解決結果で最終確認する（Defense in Depth）。

実装参照: `apps/desktop/src/main/services/skill/SkillFileWriter.ts` 行 77〜110

### 8.2 アトミック性（部分失敗対応）

`SkillFileWriter.writeFiles()` は以下のパターンでアトミック性を保証する：

```
try {
  SKILL.md を書く        → writtenFiles に追加
  agents/ を書く        → writtenFiles に追加
  scripts/ を書く       → writtenFiles に追加
  references/ を書く    → writtenFiles に追加
  return writtenFiles
} catch (err) {
  rollback(writtenFiles)  // 書き込み済みのファイルを逆順で削除
  throw err
}
```

**注意**: `rollback()` は **ベストエフォート** であり、削除失敗は握り潰す。
完全なアトミック性が必要な場合は一時ディレクトリへの書き出し → atomic rename が必要だが、
現時点はスコープ外（将来的な TODO）。

実装参照: `apps/desktop/src/main/services/skill/SkillFileWriter.ts` 行 148〜239

### 8.3 Electron 環境での FS アクセスパターン

Electron での安全なファイルシステム操作は以下のパターンに従う：

- **ファイル書き出しは Main プロセスで実行する**（Renderer は直接 `fs` にアクセスしない）
- Renderer が書き出し結果を知りたい場合は IPC 通知（`webContents.send()`）で受け取る
- `SkillFileWriter` は Main プロセスのサービス層に配置されている（`apps/desktop/src/main/services/skill/`）

本タスクでは `RuntimeSkillCreatorFacade`（Main 側）が `SkillFileWriter` を呼ぶため、
このパターンに準拠している。

IPC 通知の必要性：

- `execute()` の戻り値（`RuntimeSkillCreatorExecuteResult`）に `persistResult` / `persistError` を含めることで、
  Renderer は IPC レスポンスとして書き出し結果を受け取る（追加の IPC チャンネルは不要）。

### 8.4 `SkillCreatorOutputHandler.ts` との関係

`SkillCreatorOutputHandler.ts` は SDK セッションテキスト全文を受け取り、
`<!-- SKILL_START: {name} -->` / `<!-- SKILL_END: {name} -->` マーカーで抽出するアプローチ。

`RuntimeSkillCreatorFacade` の `parseLlmResponseToContent()` は
SDK イベント配列からコードブロック（` ```markdown ` など）を抽出するアプローチ。

**両者は別の抽出戦略**を持つが、本タスクでは `RuntimeSkillCreatorFacade` 経由の
`parseLlmResponseToContent` + `SkillFileWriter` を正式パスとする。

`SkillCreatorOutputHandler` が `RuntimeSkillCreatorFacade` に接続されていないことを
Phase 1 で確認した上で、廃止または将来の代替手段として保留する。

### 8.5 関連 AC テストケース一覧

`RuntimeSkillCreatorFacade.persist-integration.test.ts` の AC：

| ケース | 内容                                                                                         |
| ------ | -------------------------------------------------------------------------------------------- |
| E-11   | execute 成功 + コードブロックあり → `persist()` 呼び出し、`persistResult` に結果が入る       |
| E-12   | execute 成功 + コードブロックなし → `persist()` 未呼び出し、`persistResult: null`            |
| E-13   | execute 成功 + `persist()` がエラーをスロー → `persistError` に記録、`execute()` は成功扱い  |
| E-14   | `skillName` が空文字で `persist()` が `VALIDATION_ERROR` → `persistError` に記録             |
| E-15   | `parseLlmResponseToContent` が例外をスロー → `persist()` 未呼び出し、`persistError` に記録   |
| E-16   | `skillFileWriter` 未 DI → `console.warn` 出力、`persistResult: null`、`execute()` は正常終了 |

---

## 9. 備考

### 9.1 実装状況の見立て（調査前の仮説）

コードを読んだ限りでは、`RuntimeSkillCreatorFacade.ts` の Step 3.5-3.6 は
**実装コードが既に存在する**可能性が高い（コメントと変数宣言が存在する）。

Phase 1 の調査で「実装済みだが DI が欠けている」「型定義が不足している」「テストが通っていない」
といった部分的な未完了箇所が見つかる可能性が高い。
**Phase 1 の調査結果によって Phase 2 以降の実装量が大きく変わる**ため、必ず先に調査すること。

### 9.2 `skillName` の正規化について

現状の `SkillFileWriter` は `skillName` をそのままディレクトリ名として使用する。
LLM が `My Awesome Skill` のような空白を含む名前を返した場合、
ディレクトリ名は `My Awesome Skill`（空白あり）になる。

`SkillCreatorOutputHandler.ts` は `name.toLowerCase().replace(/\s+/g, "-")` で正規化しているが、
`SkillFileWriter` は正規化しない。

この不一致について、本タスクでは以下のいずれかを選択する：

- **A**: `SkillFileWriter.persist()` 呼び出し前に `planResult.skillName` を正規化する（推奨）
- **B**: `SkillFileWriter.validateSkillName()` に正規化ロジックを追加する

選択 A の実装例：

```typescript
const normalizedSkillName = planResult.skillName
  .toLowerCase()
  .replace(/\s+/g, "-");
persistResult = await this.skillFileWriter.persist(
  normalizedSkillName,
  content,
  { overwrite: true },
);
```

### 9.3 将来的な拡張ポイント

- **上書き確認 UI**: `overwrite: false` + `SKILL_ALREADY_EXISTS` 検出 → IPC 通知 → ダイアログ → `overwrite: true` で再試行（TASK-RT-03）
- **SkillRegistry 自動登録**: `persist()` 成功後に `SkillRegistry.registerFromPath()` を呼ぶ（別タスク）
- **完全アトミック書き出し**: 一時ディレクトリ → atomic rename パターン（将来の品質改善）
- **Windows 対応**: 予約ファイル名（`CON`, `PRN` 等）の検証（現時点は macOS/Linux 優先のため TODO）
