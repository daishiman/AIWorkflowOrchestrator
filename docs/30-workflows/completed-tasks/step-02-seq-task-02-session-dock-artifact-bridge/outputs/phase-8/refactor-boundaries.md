# Refactor Boundaries - Session Dock Artifact Bridge

## 1. Transcript と Artifact の役割分離

### 問題

transcript panel と artifact summary の表示要素が重複する可能性がある。

### 整理方針

| 要素             | Artifact Summary         | Transcript Detail     | 重複解消                               |
| ---------------- | ------------------------ | --------------------- | -------------------------------------- |
| 生成ファイル一覧 | 表示（primary）          | 表示しない            | Artifact Summary に集約                |
| 変更差分         | プレビュー表示           | raw diff 出力含む     | Artifact: 要約、Transcript: 全文       |
| 実行時間         | Execution Summary に表示 | timestamp で暗黙表示  | Execution Summary に集約               |
| exit code        | Execution Summary に表示 | 最終行に含まれうる    | Execution Summary に集約               |
| エラー詳細       | Error Summary に表示     | stderr として含まれる | Error Summary: 構造化、Transcript: raw |

### 結論

transcript は raw log としての役割に限定し、構造化された情報（ファイル一覧・差分・error 要約）は全て Artifact Summary / Execution Summary / Error Summary に集約する。

## 2. Share Rail と Provenance の簡素化

### 問題

share rail に 3 操作 + provenance chip があると情報過多になる可能性がある。

### 簡素化方針

| 要素            | 簡素化前                                | 簡素化後                                                           | 理由             |
| --------------- | --------------------------------------- | ------------------------------------------------------------------ | ---------------- |
| Share Rail      | 常時 3 ボタン表示                       | collapsed 時は 1 つの「共有」ドロップダウンに統合                  | 視覚的ノイズ削減 |
| Provenance Chip | source + sharedAt + inspect の 3 行表示 | 1 行に inline 表示（例: `実行コンソールから 15:30 に共有 [見る]`） | 最小限の情報     |
| Share Rail 位置 | footer 固定                             | done/aborted 時のみ footer に表示                                  | 不要時は非表示   |

## 3. State 表示の整理

### 問題

8 state それぞれで異なるコンテンツを表示するため、条件分岐が複雑になる。

### 整理方針

State を 4 グループに分類し、グループ単位で表示コンテンツを管理する。

| グループ | State                                 | 表示コンテンツ                                |
| -------- | ------------------------------------- | --------------------------------------------- |
| Inactive | collapsed, unavailable, guidance-only | 最小限の status bar のみ                      |
| Pending  | ready, handoff                        | guidance + CTA                                |
| Active   | running                               | transcript streaming + abort CTA              |
| Complete | done, aborted                         | Artifact Summary + Share Rail + Error Summary |

この分類により、表示ロジックが 8 分岐から 4 分岐に簡素化される。
