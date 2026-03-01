# アーキテクチャ設計書 — IPCハンドラ単位カバレッジ測定基盤

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| 文書種別   | アーキテクチャ設計書                            |
| Phase      | 2（設計）                                       |
| タスクID   | UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001        |
| 作成日     | 2026-02-28                                      |
| 依存成果物 | Phase 1: 要件定義書、受け入れ基準、スコープ定義 |

---

## 1. モジュール構成

### 1.1 ファイル配置

```
apps/desktop/scripts/
├── coverage-by-handler.ts          # メインスクリプト（CLI エントリポイント）
└── coverage-by-handler.test.ts     # ユニットテスト
```

### 1.2 内部モジュール構成（単一ファイル内）

`coverage-by-handler.ts` は以下の5モジュールを単一ファイル内に関数として実装する。
将来的にファイル分割が必要になった場合に備え、各モジュールは独立した関数群として設計する。

```
coverage-by-handler.ts
├── [1] HandlerDetector        # AST解析によるハンドラ境界検出
│   └── 責務: TypeScript ソースファイルを ts-morph で解析し、
│            ipcMain.handle() の各コールバックの行範囲を特定する
│
├── [2] CoverageParser         # v8 カバレッジ JSON 解析
│   └── 責務: Vitest が出力した coverage-final.json を読み込み、
│            対象ファイルの行/関数/分岐カバレッジデータを構造化する
│
├── [3] CoverageCalculator     # ハンドラ単位カバレッジ算出
│   └── 責務: HandlerDetector の行範囲と CoverageParser のデータを突合し、
│            各ハンドラの Line/Function/Branch カバレッジ率を算出する
│
├── [4] Phase7Judge            # Phase 7 判定ルール適用
│   └── 責務: Rule-1〜Rule-4 を適用し、PASS/FAIL 判定と判定理由を生成する
│
└── [5] ReportFormatter        # JSON/Markdown レポート出力
    └── 責務: ハンドラカバレッジと判定結果を JSON 文字列および
             Markdown テーブルとして整形して出力する
```

### 1.3 各モジュールの責務境界

| モジュール         | 入力                                  | 出力               | 副作用                   |
| ------------------ | ------------------------------------- | ------------------ | ------------------------ |
| HandlerDetector    | TypeScript ファイルパス（string）     | HandlerInfo[]      | なし（純粋解析）         |
| CoverageParser     | JSON ファイルパス、対象ファイルパス   | V8CoverageData     | なし（ファイル読込のみ） |
| CoverageCalculator | HandlerInfo[], V8CoverageData         | HandlerCoverage[]  | なし（純粋計算）         |
| Phase7Judge        | HandlerCoverage[], string, thresholds | JudgmentResult     | なし（純粋判定）         |
| ReportFormatter    | HandlerCoverage[], JudgmentResult     | { json, markdown } | なし（整形のみ）         |

---

## 2. データフロー図

```
入力:
  ┌─────────────────────────┐   ┌──────────────────────────┐
  │ TypeScript ソースファイル │   │ v8 カバレッジ JSON        │
  │ (skillHandlers.ts)       │   │ (coverage-final.json)    │
  └──────────┬──────────────┘   └──────────┬───────────────┘
             │                              │
             ▼                              ▼
  ┌──────────────────┐          ┌──────────────────────┐
  │ HandlerDetector  │          │ CoverageParser       │
  │ (ts-morph AST)   │          │ (JSON読み込み)       │
  └──────────┬───────┘          └──────────┬───────────┘
             │                              │
             │  HandlerInfo[]               │  V8CoverageData
             ▼                              ▼
         ┌──────────────────────────────────────┐
         │ CoverageCalculator                   │
         │ (ハンドラ境界 × カバレッジデータ突合)  │
         └──────────────────┬───────────────────┘
                            │
                            │  HandlerCoverage[]
                            ▼
              ┌─────────────────────────┐
              │ Phase7Judge             │
              │ (Rule-1〜4 判定)        │
              └─────────┬───────────────┘
                        │
                        │  JudgmentResult
                        ▼
              ┌─────────────────────────┐
              │ ReportFormatter         │
              │ (JSON / Markdown 出力)  │
              └─────────────────────────┘

出力:
  ┌──────────────────┐  ┌──────────────────────┐
  │ JSON レポート     │  │ Markdown レポート     │
  └──────────────────┘  └──────────────────────┘
```

---

## 3. AST解析によるハンドラ検出アルゴリズム

`ipcMain.handle()` コールを検出するための6ステップ手順:

**Step 1: ASTプロジェクト生成**
ts-morph の `Project` インスタンスを生成し、対象の TypeScript ソースファイルを追加する。
`tsconfig.json` を参照せず、ファイルパスを直接指定してパース失敗リスクを排除する。

**Step 2: CallExpression 全走査**
ソースファイルの全ノードを深さ優先でトラバースし、`CallExpression` ノードを抽出する。

**Step 3: `ipcMain.handle` コール抽出**
`CallExpression` のエクスプレッション部分が `PropertyAccessExpression` であり、
オブジェクト名が `ipcMain`、プロパティ名が `handle` である式を抽出する。

**Step 4: 第1引数（チャンネル名）の解決**
`ipcMain.handle()` の第1引数を取得する:

- 文字列リテラルの場合: その値をチャンネル名として使用する
- `IPC_CHANNELS.XXX` 定数参照の場合: Step 6 で定数定義元を辿って文字列値を取得する

**Step 5: 第2引数（コールバック）の行範囲記録**
`ipcMain.handle()` の第2引数（コールバック関数）ノードから開始行・終了行（1-indexed）を記録する。
コールバック関数の型は `ArrowFunction` または `FunctionExpression` の両方に対応する。

**Step 6: IPC_CHANNELS 定数の解決**
第1引数が `IPC_CHANNELS.*` 形式の定数参照の場合:

1. 同ファイル内の変数宣言を検索して `IPC_CHANNELS` オブジェクトを特定する
2. 対応するプロパティの文字列値を取得する
3. 外部ファイルのインポートの場合は、インポート元ファイルを解析して同様に値を取得する

**出力**: `HandlerInfo[]` — 全ハンドラのチャンネル名と行範囲の配列

---

## 4. P41対策設計（v8インライン関数カウント）

### 問題の概要（P41）

Vitest の v8 カバレッジプロバイダは、インライン arrow function（例: `getAllowedWindows: () => [mainWindow]`）を独立した関数としてカウントする。
これにより、バリデーション関数内のオプションオブジェクトのコールバックが実行されない場合、Function Coverage が大幅に低下する（実績: 44.44% まで低下）。

### 対策設計

**方針1: v8 の関数カウントをそのまま使用する**
v8 の動作に合わせてインライン関数を独立カウントする。
CoverageCalculator は v8 の関数カウントを変換せずに使用し、一貫性を保つ。

**方針2: レポートへの注記追加**
ReportFormatter は全レポートに以下の注記を付記する:

```
> [P41注記] v8 カバレッジプロバイダはインライン arrow function を独立した関数としてカウントします。
> Function カバレッジが低い場合、validateIpcSender 等のオプションコールバックの未実行が原因の可能性があります。
```

**方針3: Rule-2 の許容対象からインライン関数を除外**
Phase7Judge は Rule-2 の「ファイル全体基準未達の許容」を適用する際、
インライン関数の未実行は許容対象に含めない。
修正対象ハンドラ内の全関数（インライン関数を含む）が実行済みであることを Rule-1 の充足条件とする。

**テスト時の注記**
テストコードでは `mockValidateIpcSender.mock.calls[i][2].getAllowedWindows()` のように
コールバックの戻り値を明示的に検証し、インライン関数の実行を確認する。

---

## 5. P40対策設計（モノレポパス解決）

### 問題の概要（P40）

v8 カバレッジ JSON 内のファイルパスは絶対パスで記録される。
モノレポ環境でテスト実行ディレクトリが異なると、`sourceFile` として渡されるパスと
カバレッジ JSON 内のパスが一致せず、データ突合が失敗する。

### 対策設計

**パス正規化の実装**
CoverageParser は対象ファイルパスと JSON 内パスの突合時に以下の手順でパス正規化を実施する:

1. `sourceFile` パスを `path.resolve()` で絶対パスに変換する
2. カバレッジ JSON 内の全ファイルパスを `path.normalize()` で正規化する
3. 正規化後のパス同士で完全一致を試みる
4. 完全一致が得られない場合、`path.relative()` で相対パス変換後に末尾一致（suffix match）を試みる
   - 例: JSON 内の `/workspace/apps/desktop/src/main/ipc/skillHandlers.ts` と
     `apps/desktop/src/main/ipc/skillHandlers.ts` の末尾一致で突合する

**CI環境への対応**
CI 環境ではワーキングディレクトリが異なる場合があるため、
`--root` オプション（将来拡張として）または環境変数 `COVERAGE_ROOT` で
カバレッジ JSON のパスプレフィックスを上書き可能に設計する。

---

## 6. エラーハンドリング設計

| エラーケース                       | エラーメッセージ                                                    | 終了コード | 復帰方法       |
| ---------------------------------- | ------------------------------------------------------------------- | ---------- | -------------- |
| ソースファイルが存在しない         | `Source file not found: {path}`                                     | 1          | 処理中断       |
| カバレッジ JSON が存在しない       | `Coverage JSON not found: {path}. Run tests with --coverage first.` | 1          | 処理中断       |
| カバレッジ JSON のフォーマット不正 | `Invalid coverage JSON format: {details}`                           | 1          | 処理中断       |
| 対象ファイルのカバレッジが未収集   | `No coverage data for file: {path}`                                 | 0          | 空レポート出力 |
| AST 解析でハンドラ未検出           | `No ipcMain.handle() calls found in: {path}`                        | 0          | 空レポート出力 |
| 修正対象ハンドラが見つからない     | `Target handler not found: {channel}`                               | 0          | 判定スキップ   |
| ts-morph パース失敗                | `Failed to parse TypeScript file: {path}: {error}`                  | 1          | 処理中断       |

**エラーメッセージのフォーマット**
全エラーメッセージは `stderr` に出力し、JSON 出力は `stdout` に出力する。
これにより、CLI パイプライン使用時にエラーとデータを分離して扱える。

---

## 7. IPC ハンドラ検出パターン

`skillHandlers.ts` における3グループの登録関数を正しく検出する:

| グループ                        | 検出対象チャンネル       | ハンドラ数 |
| ------------------------------- | ------------------------ | ---------- |
| `registerSkillHandlers`         | スキル管理・改善ハンドラ | 14         |
| `registerSkillScheduleHandlers` | スケジュール管理ハンドラ | 5          |
| `registerSkillDocsHandlers`     | ドキュメント生成ハンドラ | 4          |
| **合計**                        |                          | **23**     |

### 検出精度の保証

HandlerDetector は以下の方法でグループ帰属を判定する:

- `ipcMain.handle()` コールが属する外側の `FunctionDeclaration` または `FunctionExpression` の名前を記録する
- 記録した関数名を `registrationGroup` フィールドとして `HandlerInfo` に格納する
- `registerSkillHandlers`、`registerSkillScheduleHandlers`、`registerSkillDocsHandlers` の
  3グループを正しく識別する

---

## 8. テスト統合設計

### Vitest v8 カバレッジ出力との統合

| 統合ポイント             | 設計上の考慮点                                                                                                                     |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Vitest v8 カバレッジ出力 | `coverage/coverage-final.json` のスキーマが Vitest バージョンで変化する可能性があるため、v8 フォーマットのバージョン検出を実装する |
| ts-morph バージョン      | TypeScript バージョンとの互換性を確認する。`tsconfig.json` の `target` 設定に依存しない解析を実装する                              |
| モノレポパス解決（P40）  | カバレッジ JSON 内のファイルパスは絶対パスで記録される。`sourceFile` との突合時にパス正規化を実施する                              |
| CI 環境                  | CI 上でもパスが一致するよう、相対パス変換ロジックを実装する                                                                        |

### 集計スクリプト自体のテスト戦略

集計スクリプトのテスト（`coverage-by-handler.test.ts`）は以下の方針で設計する:

1. **ユニットテスト**: 各モジュール関数（`detectHandlers`, `parseCoverageJson`, `computeHandlerCoverage`, `judgePhase7`）を個別にテストする
2. **フィクスチャデータ使用**: `skillHandlers.ts` の実ファイルと、既知のカバレッジ JSON フィクスチャを使用してエンドツーエンドの動作を検証する
3. **P41 検証**: インライン arrow function を含むフィクスチャを用意して、Function カバレッジの算出が P41 対策に準拠しているかを検証する
4. **エラーケース網羅**: 全7エラーケースに対応したテストを実装する

---

## 9. 多角的チェック観点

| 観点                     | チェック項目                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| モジュール分割の妥当性   | 単一ファイル内の関数分割が単一責務を満たしているか。将来的なファイル分割が容易な構造か      |
| インターフェースの安定性 | 公開関数のシグネチャが将来の拡張（他ファイル対応、新ルール追加）に耐えうるか                |
| v8 JSON フォーマット     | Vitest のバージョンアップで v8 カバレッジ JSON のフォーマットが変わった場合の対応策があるか |
| AST 解析の堅牢性         | `ipcMain.handle()` 以外のパターン（`ipcMain.on()` 等）への将来的な拡張が可能か              |
| P41 対策の十分性         | インライン関数の扱いが Phase 7 判定結果に不当な影響を与えないか                             |
| 型定義の完全性           | 全てのインターフェースが `strict: true` でコンパイル可能か。`any` 型が含まれていないか      |
| エラーハンドリング網羅性 | 全7エラーケースに対して明確なメッセージと復帰方法が定義されているか                         |
