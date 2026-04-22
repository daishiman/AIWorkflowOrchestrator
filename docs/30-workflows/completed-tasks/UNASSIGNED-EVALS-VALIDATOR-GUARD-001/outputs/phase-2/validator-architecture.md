# L1/L2/L3 バリデーターアーキテクチャ設計

## L1: JSON パース層

| 項目     | 内容                                                                    |
| -------- | ----------------------------------------------------------------------- |
| 責務     | JSON.parse による構文検証                                               |
| 検出対象 | JSON 構文エラー（括弧不一致・末尾カンマ・エンコードエラー・空ファイル） |
| 入力     | EVALS.json ファイルパス（文字列）                                       |
| 出力     | { ok: boolean, layer: "L1", reason?: string, parsed?: object }          |
| 例外処理 | try/catch で SyntaxError を捕捉し、ok: false を返す                     |
| 後続処理 | L1 が ok: false の場合、L2/L3 はスキップ                                |

## L2: 必須キー検証層

| 項目             | 内容                                                                   |
| ---------------- | ---------------------------------------------------------------------- |
| 責務             | 必須フィールドの存在確認（方言を考慮）                                 |
| 検出対象         | skill_name/skillName・current_level/currentLevel・metricsの欠損        |
| 入力             | L1 の parsed オブジェクト                                              |
| 出力             | { ok: boolean, layer: "L2", missing?: string[], warnings?: string[] }  |
| 方言ハンドリング | camelCase/snake_case のどちらか一方が存在すれば OK（両方言許容モード） |
| 後続処理         | L2 が ok: false の場合、L3 はスキップ                                  |

## L3: dual root 一致検証層

| 項目     | 内容                                                               |
| -------- | ------------------------------------------------------------------ |
| 責務     | .claude/skills/ と .agents/skills/ の同名スキルの bit-for-bit 比較 |
| 検出対象 | 両 root 間のコンテンツ差分                                         |
| 入力     | .claude 側パス・.agents 側パス（ペア）                             |
| 出力     | { ok: boolean, layer: "L3", reason?: string }                      |
| 比較手法 | Node.js fs.readFileSync で両ファイルを読み込み、Buffer.compare     |
| 備考     | ファイルが一方のみ存在する場合も ok: false（存在ミスマッチ）       |

## 層間データフロー

```
EVALS.json パス (12件)
  └─ L1: JSON.parse
        ├─ [fail] → エラー記録・L2/L3 スキップ
        └─ [ok] → parsed オブジェクト
              └─ L2: 必須キー検証
                    ├─ [fail] → エラー記録・L3 スキップ
                    └─ [ok]
                          └─ L3: dual root 比較
                                ├─ [fail] → エラー記録
                                └─ [ok] → PASS
```

## 終了コード規約

| コード | 意味                                 |
| ------ | ------------------------------------ |
| 0      | 全 EVALS.json が PASS                |
| 1      | 1 件以上が FAIL                      |
| 2      | スクリプト自体のエラー（I/O 失敗等） |
