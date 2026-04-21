# Phase 12 実装ガイド: UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001

## Part 1: 中学生レベル説明

### なぜ必要か

ワークフローのフェーズが完了するとき、その情報は複数の場所に書いてあります。
たとえば「Phase 5 は完了しました」という情報が、出席簿A・出席簿B・出席簿C・連絡帳の4か所に書かれているとします。
全部が「完了」になっていれば問題ありませんが、どれか1か所だけ「未完了」のままになっていると、システムが混乱します。
この「バラバラになった状態」を **drift（ずれ）** と呼びます。

以前は drift を人が手で確認していたため、見落としが起きることがありました。
特に `outputs/artifacts.json` が「完了」を主張しているのに、ルートの `artifacts.json` が「未完了」のままになる事例（UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001）が発見されました。
これを機械的に自動検証するためのしくみが、このタスクで作ったものです。

### 何をするか

3つのスクリプトが連携して動きます。

1. **validate-closeout-parity.js**（見回り係）: 4か所の情報を読み取って、全部が同じ値かどうかを自動でチェックします。
2. **complete-phase.js**（学級委員）: フェーズを完了させるとき、4か所全てを同時に書き換えます。
3. **verify-all-specs.js**（総合検査）: ワークフロー全体の品質チェックの中に、この parity gate を組み込みます。

### 日常の例え

たとえば、学校で「今日は全員出席です」と記録するとき、学級委員は3冊の出席簿（index.md・root artifacts.json・outputs/artifacts.json）と本人の連絡帳（phase-N-\*.md frontmatter）を同時に書き換えます。
後で見回り係が4つ全部の出席状態が揃っているかを照合します。
もし1冊だけ「欠席」になっていたら、すぐに「おかしい！」とわかります。

この仕組みがないと、出席簿3冊が「出席」なのに連絡帳だけ「欠席」になっていても、誰も気づかないまま進んでしまいます。

### 今回作ったもの

| スクリプト                    | 役割                                                  | 新規/拡張 |
| ----------------------------- | ----------------------------------------------------- | --------- |
| `validate-closeout-parity.js` | 4か所（S1〜S4）のステータス一致を自動検証する見回り係 | 新規      |
| `complete-phase.js`           | フェーズ完了時に4か所を同値更新し、rollback にも対応  | 拡張      |
| `verify-all-specs.js`         | parity gate を統合検査に組み込む                      | 拡張      |

---

## Part 2: 開発者向け技術詳細

### 型定義

```typescript
/** validate-closeout-parity.js が出力する JSON 構造 */
interface ParityReport {
  result:
    | "PARITY_OK"
    | "PARITY_DRIFT"
    | "MISSING_SOURCE"
    | "INVALID_STATUS_VALUE";
  phases: {
    [phaseNum: string]: {
      canonical: string; // S2（root artifacts.json）の値
      s1: string | null; // index.md Phase 表の値
      s2: string | null; // root artifacts.json の値
      s3: string | null; // outputs/artifacts.json の値
      s4: string | null; // phase-N-*.md frontmatter の値
      drifts: string[]; // drift が発生したソース名の配列
    };
  };
  drifts: Array<{
    phase: number;
    sources: string[];
    values: Record<string, string>;
  }>;
  sourcesChecked: string[]; // 実際に検証されたソース名
  generatedAt: string; // ISO 8601 タイムスタンプ
  exitCode: number; // 0/1/2/3
  code?: string; // PARITY_OK / PARITY_DRIFT / MISSING_SOURCE / INVALID_STATUS_VALUE
}

/** ソース定義 */
type ParitySource = "S1" | "S2" | "S3" | "S4";

/** 許可された status 値 */
type AllowedStatus = "pending" | "in_progress" | "completed" | "blocked";

/** S1専用: S1 で追加的に許可される値（Phase が存在しない場合のデフォルト表示） */
type S1AllowedStatus = AllowedStatus | "-";
```

### CLI シグネチャ

#### validate-closeout-parity.js

```
node validate-closeout-parity.js --workflow <path> [--json]

オプション:
  --workflow <path>  検証対象ワークフローのディレクトリパス（必須）
  --json             JSON 形式で結果を出力（省略時は人間読み可能な形式）

終了コード:
  0: PARITY_OK            - 全ソース一致
  1: PARITY_DRIFT         - ソース間不一致
  2: MISSING_SOURCE       - 必須ソースが欠損
  3: INVALID_STATUS_VALUE - 許可されていない status 値
```

#### complete-phase.js

```
node complete-phase.js --workflow <path> --phase <N> --artifacts "<comma-separated-list>"

オプション:
  --workflow <path>    対象ワークフローのディレクトリパス（必須）
  --phase <N>          完了させるフェーズ番号（必須）
  --artifacts "<list>" 成果物リスト（"path:説明,path:説明" 形式）（必須）

動作:
  S1（index.md）、S2（root artifacts.json）、S3（outputs/artifacts.json）、
  S4（phase-N-*.md frontmatter）を同時に "completed" へ更新する。
  失敗時は rollback を実施する。
```

#### verify-all-specs.js

```
node verify-all-specs.js --workflow <path> [options]

オプション:
  --workflow <path>  検証対象ワークフローのディレクトリパス（必須）

動作:
  ワークフロー全体の品質チェックを行う統合 validator。
  parity gate（validate-closeout-parity.js）を内部で実行し、
  drift が検出された場合はエラーとして報告する。
```

### 使用例

#### 正常系（PARITY_OK）

```bash
$ node validate-closeout-parity.js \
  --workflow docs/30-workflows/UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001 \
  --json

[validate-closeout-parity] 検証開始: ...
[validate-closeout-parity] 結果: PARITY_OK
{
  "result": "PARITY_OK",
  "phases": { ... },
  "drifts": [],
  "sourcesChecked": ["S1", "S2", "S3", "S4"],
  "generatedAt": "2026-04-20T02:40:27.363Z"
}
$ echo "exit=$?"
exit=0
```

#### drift 検出（PARITY_DRIFT）

```bash
# outputs/artifacts.json の Phase 12 が "completed" だが root は "pending" のケース
$ node validate-closeout-parity.js --workflow docs/30-workflows/MY-TASK-001 --json

{
  "result": "PARITY_DRIFT",
  "drifts": [
    {
      "phase": 12,
      "sources": ["S2", "S3"],
      "values": { "S2": "pending", "S3": "completed" }
    }
  ],
  "exitCode": 1,
  "code": "PARITY_DRIFT"
}
$ echo "exit=$?"
exit=1
```

#### 欠損（MISSING_SOURCE）

```bash
# outputs/artifacts.json が存在しないケース
$ node validate-closeout-parity.js --workflow docs/30-workflows/INCOMPLETE-TASK --json

{
  "result": "MISSING_SOURCE",
  "exitCode": 2,
  "code": "MISSING_SOURCE",
  "message": "outputs/artifacts.json が見つかりません"
}
$ echo "exit=$?"
exit=2
```

#### 不正値（INVALID_STATUS_VALUE）

```bash
# artifacts.json に "done" のような許可外の status が含まれるケース
$ node validate-closeout-parity.js --workflow docs/30-workflows/BAD-STATUS-TASK --json

{
  "result": "INVALID_STATUS_VALUE",
  "exitCode": 3,
  "code": "INVALID_STATUS_VALUE",
  "invalidEntries": [
    { "phase": 5, "source": "S2", "value": "done" }
  ]
}
$ echo "exit=$?"
exit=3
```

### エラーハンドリング

#### exit code と JSON code 対応表

| exit code | JSON code              | 意味                                            | rollback 条件                      |
| --------- | ---------------------- | ----------------------------------------------- | ---------------------------------- |
| 0         | `PARITY_OK`            | 全ソース一致、問題なし                          | なし                               |
| 1         | `PARITY_DRIFT`         | ソース間で status 値が異なる                    | complete-phase.js は実行前に abort |
| 2         | `MISSING_SOURCE`       | 必須ファイル（index.md / artifacts.json）が欠損 | complete-phase.js は実行前に abort |
| 3         | `INVALID_STATUS_VALUE` | 許可外の status 値（"done", "finished" 等）     | complete-phase.js は実行前に abort |

#### rollback 条件

`complete-phase.js` が S1〜S4 を更新中にエラーが発生した場合:

- 更新済みのソースを元の値に戻す（partial rollback）
- ロールバック結果を stderr に出力する
- exit code 1 で終了する

### エッジケース

#### S1 の `-` 表記

`index.md` の Phase 表で、まだ定義されていない Phase は `-` で表示されることがある。
`validate-closeout-parity.js` は S1 に限り、`-` を特別な「Phase 未定義」状態として扱い、
他のソース（S2/S3/S4）の `pending` と同値とみなす。

```
# index.md の例
| Phase | 説明 | ステータス |
| --- | --- | --- |
| 1 | 要件定義 | completed |
| 14 | 将来拡張 | - |      ← S1 で "-" が許可される
```

#### phase 数が 13 未満のワークフロー

Phase 数が標準の 13 より少ないワークフロー（例: docs-only タスクで 12 Phase のみ）でも、
`validate-closeout-parity.js` は `artifacts.json` に定義されている Phase のみを検証する。
存在しない Phase 番号に対しては drift チェックをスキップする。

#### phase frontmatter 欠落

`phase-N-*.md` に `| ステータス | ... |` 行が存在しない場合、S4 ソースは `null` となる。
S4 が `null` の場合:

- 他の S1/S2/S3 が一致していれば `PARITY_OK` として扱う（S4 は best-effort）
- `sourcesChecked` に S4 を含まない

### 設定項目と定数一覧

#### 許可 status 列挙

```javascript
// validate-closeout-parity.js 内定数
const ALLOWED_STATUS = new Set([
  "pending",
  "in_progress",
  "completed",
  "blocked",
]);
const S1_ALLOWED_STATUS = new Set([
  "pending",
  "in_progress",
  "completed",
  "blocked",
  "-",
]);
```

#### parity bypass 用フラグを導入しない運用

`validate-closeout-parity.js` には意図的に `--skip-parity` や `--bypass` フラグを設けていない。
parity guard はすべての Phase 12 close-out で必ず実行し、drift を発見したら必ず修正してから先に進む運用とする。
bypass フラグを導入すると「後で直す」が常態化し、SSOT 崩壊を再発させる懸念があるため。

### 責務境界マトリクス

| ソース                           | 書き手                   | 読み手                                                | 禁止事項                                                                |
| -------------------------------- | ------------------------ | ----------------------------------------------------- | ----------------------------------------------------------------------- |
| **S1** index.md Phase 表         | `complete-phase.js` のみ | `validate-closeout-parity.js` / 開発者（確認用）      | 開発者の手動直接書き換えは可（ただし complete-phase.js を通すこと推奨） |
| **S2** root artifacts.json       | `complete-phase.js` のみ | `validate-closeout-parity.js` / `verify-all-specs.js` | complete-phase.js を経由せず直接 JSON を書き換えること                  |
| **S3** outputs/artifacts.json    | `complete-phase.js` のみ | `validate-closeout-parity.js` / `verify-all-specs.js` | S2 と同値でない状態で放置すること                                       |
| **S4** phase-N-\*.md frontmatter | `complete-phase.js` のみ | `validate-closeout-parity.js`                         | 手動で frontmatter を書き換えて S1〜S3 と不一致にすること               |

---

UI/UX変更なしのため Phase 11 スクリーンショット不要
