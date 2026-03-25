# Phase 9 リスクレジスター

## メタ情報

| 項目      | 内容                                            |
| --------- | ----------------------------------------------- |
| タスクID  | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| Phase     | 9                                               |
| 作成日    | 2026-03-24                                      |
| 依存Phase | Phase 1-8                                       |

## リスク評価基準

| 項目     | 説明                                 |
| -------- | ------------------------------------ |
| 影響度   | LOW / MEDIUM / HIGH / CRITICAL       |
| 発生確率 | LOW / MEDIUM / HIGH                  |
| リスク値 | 影響度 x 発生確率 の組み合わせで判定 |

### リスク値計算マトリクス

| 確率＼影響度 | LOW    | MEDIUM | HIGH     |
| ------------ | ------ | ------ | -------- |
| LOW          | LOW    | LOW    | MEDIUM   |
| MEDIUM       | LOW    | MEDIUM | HIGH     |
| HIGH         | MEDIUM | HIGH   | CRITICAL |

## 1. 残存リスク一覧

### RISK-01: Approval Token の Replay Attack

| 項目       | 内容                                                                                                                              |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------- |
| カテゴリ   | Security                                                                                                                          |
| 説明       | Main Process で検証する approval token が、Renderer の DevTools 経由で傍受・再利用される可能性                                    |
| 影響度     | MEDIUM                                                                                                                            |
| 発生確率   | LOW                                                                                                                               |
| リスク値   | LOW                                                                                                                               |
| 軽減策     | token に session ID + operation ID + 有効期限（単一操作で失効）を紐づけ済み。DevTools アクセスにはローカルマシン権限が必要        |
| 残存リスク | ローカルマシン権限を持つ攻撃者による replay。ただしローカル権限がある時点で他の攻撃ベクトルも存在するため、追加対策の優先度は低い |
| 対応方針   | 後続実装タスクで nonce ベースの一回限り token を検討する                                                                          |

### RISK-02: Consumer Auth Token の誤混入

| 項目       | 内容                                                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| カテゴリ   | Compliance                                                                                                                            |
| 説明       | 将来の機能追加で claude.ai consumer 認証トークンが誤ってアプリ内に流入する可能性                                                      |
| 影響度     | HIGH                                                                                                                                  |
| 発生確率   | LOW                                                                                                                                   |
| リスク値   | MEDIUM                                                                                                                                |
| 軽減策     | CAG-1〜CAG-3 で禁止事項を明示定義済み。Main Process での token format 検証を設計済み                                                  |
| 残存リスク | 禁止事項の存在を知らない開発者が、意図せず consumer token を受け入れるコードを追加する可能性                                          |
| 対応方針   | 実装タスクで token format validator を Main Process に追加する。CI の lint ルールで consumer token パターンを検出するルール追加を検討 |

### RISK-03: Disclosure Banner の Dismiss 後の認知不足

| 項目       | 内容                                                                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| カテゴリ   | UX / Disclosure                                                                                                                                   |
| 説明       | ユーザーが Disclosure Banner を素早く dismiss した場合、AI 利用と外部送信の可能性を十分に認知しないまま操作を進める可能性                         |
| 影響度     | MEDIUM                                                                                                                                            |
| 発生確率   | MEDIUM                                                                                                                                            |
| リスク値   | MEDIUM                                                                                                                                            |
| 軽減策     | DSC-R4（Approval Sheet 内 disclosure は dismiss 不可）により、操作実行時に再度開示される。再表示アイコンによりいつでも確認可能                    |
| 残存リスク | Banner 短縮版（Phase 8 S-1）により情報量が減少し、dismiss される確率が高まる可能性                                                                |
| 対応方針   | 短縮版でも核心情報（AI 利用 + 外部送信可能性）は含むため許容範囲。ユーザビリティテストで dismiss 率を観測し、必要に応じて表示時間の最低保証を検討 |

### RISK-04: Advanced Console からの情報漏洩

| 項目       | 内容                                                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------- |
| カテゴリ   | Security                                                                                                                  |
| 説明       | Raw Terminal Output にサニタイズ漏れの内部パスやエラーメッセージが含まれる可能性                                          |
| 影響度     | MEDIUM                                                                                                                    |
| 発生確率   | MEDIUM                                                                                                                    |
| リスク値   | MEDIUM                                                                                                                    |
| 軽減策     | MUST-9（sanitizeErrorMessage 適用）+ Advanced Console 4.2（API key 非含有、パス sanitize）を設計済み                      |
| 残存リスク | サードパーティライブラリが出力するエラーメッセージまではサニタイズが及ばない可能性                                        |
| 対応方針   | 実装時に terminal output の post-processing sanitizer を追加する。P55（正規表現メタ文字エスケープ）準拠でパスマスクを実装 |

### RISK-05: Phase 8 簡素化による開示義務の解釈リスク

| 項目       | 内容                                                                                                                               |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| カテゴリ   | Compliance / Legal                                                                                                                 |
| 説明       | Disclosure Banner の短縮版（S-1）が、規制当局や監査機関から「十分な開示」と認められない可能性                                      |
| 影響度     | HIGH                                                                                                                               |
| 発生確率   | LOW                                                                                                                                |
| リスク値   | MEDIUM                                                                                                                             |
| 軽減策     | 短縮版でも AI 利用 + 外部送信可能性の核心は含む。[詳細] 展開で完全な開示文を提供。DSC-R4 で Approval Sheet 内の開示は dismiss 不可 |
| 残存リスク | 「短縮版で dismiss された場合、展開を見ないユーザーに対して十分な開示と言えるか」の法的判断は未確定                                |
| 対応方針   | 法務レビューの対象項目として記録する。開示文の完全版を Approval Sheet 内にも残すことで二重防御                                     |

### RISK-06: State Machine 遷移時の Approval/Disclosure 不整合

| 項目       | 内容                                                                                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| カテゴリ   | Safety / UX                                                                                                                                               |
| 説明       | Session State の急速な遷移（例: ready → running を一瞬で通過）により、Approval Sheet の表示が間に合わない可能性                                           |
| 影響度     | HIGH                                                                                                                                                      |
| 発生確率   | LOW                                                                                                                                                       |
| リスク値   | MEDIUM                                                                                                                                                    |
| 軽減策     | Approval Flow で「Approval Check → [要 approval?] → Yes → Approval Sheet 表示 → 承認 → 実行」の同期的フローを設計済み。state 遷移は Approval 完了後に行う |
| 残存リスク | 非同期処理のレースコンディションにより、Approval 完了前に state が遷移する可能性                                                                          |
| 対応方針   | 実装時に Approval Check を同期ブロッキングで実装する。state 遷移は Approval callback 内でのみ許可する                                                     |

### RISK-07: IPC Channel 追加時のホワイトリスト更新漏れ

| 項目       | 内容                                                                                                                              |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------- |
| カテゴリ   | Security / Process                                                                                                                |
| 説明       | 新規 IPC channel（execution:get-terminal-log, execution:get-copy-command）追加時に ALLOWED_INVOKE_CHANNELS への登録が漏れる可能性 |
| 影響度     | MEDIUM                                                                                                                            |
| 発生確率   | LOW                                                                                                                               |
| リスク値   | LOW                                                                                                                               |
| 軽減策     | IPC Boundary 5.2 で「ALLOWED_INVOKE_CHANNELS に追加必須」を設計レベルで明記済み                                                   |
| 残存リスク | 設計書の記載を見落とす実装者によるホワイトリスト登録漏れ                                                                          |
| 対応方針   | 後続実装タスクのチェックリストに明示的に含める。P65（dead-end namespace）パターンの再発防止                                       |

## 2. Consumer Auth 非流用の確認

### 確認結果

| 確認項目                                                           | 結果   | 根拠                                     |
| ------------------------------------------------------------------ | ------ | ---------------------------------------- |
| claude.ai session token を受け入れる IPC handler が設計にない      | 確認済 | IPC Boundary 5.1 に consumer auth 系なし |
| claude.ai cookie を参照する Preload API が設計にない               | 確認済 | CAG-2 で明示禁止                         |
| consumer 認証フローの設計が含まれていない                          | 確認済 | CAG-3 で明示禁止                         |
| 許可される認証方式が API Key / Subscription Token / no-auth に限定 | 確認済 | Consumer Auth Guard 4.2                  |
| RuntimePolicyResolver の3パターンに consumer auth がない           | 確認済 | 既存実装確認 + DENY-1                    |
| scope-definition で consumer auth 統合がスコープ外と明記           | 確認済 | scope-definition.md スコープ外テーブル   |

### Consumer Auth Guard 設計の十分性評価

| 評価観点             | 判定   | 理由                                                               |
| -------------------- | ------ | ------------------------------------------------------------------ |
| 設計レベルでの禁止   | 十分   | DENY-1 + CAG-1〜CAG-3 で明示的に禁止事項が列挙されている           |
| 検出方法の具体性     | 十分   | Main Process での token format 検証、Preload での API 非公開が定義 |
| 実装タスクへの引継ぎ | 十分   | compliance baseline で後続タスクへの適用必須が明記されている       |
| 将来の誤混入防止     | 要注意 | RISK-02 として残存リスクに記録済み。CI ルール追加を推奨            |

## 3. リスクサマリー

| リスク値 | 件数 | リスク ID                          |
| -------- | ---- | ---------------------------------- |
| LOW      | 2    | RISK-01, RISK-07                   |
| MEDIUM   | 4    | RISK-02, RISK-03, RISK-05, RISK-06 |
| HIGH     | 0    | -                                  |
| CRITICAL | 0    | -                                  |

### 全体評価

- CRITICAL / HIGH リスクは0件
- MEDIUM リスク4件は全て軽減策が設計レベルで定義済み
- 残存リスクは「実装フェーズでの追加対策」で対応可能
- Consumer Auth 非流用は設計レベルで十分に確認済み

### Phase 10 への引継ぎ事項

1. RISK-02（Consumer Auth 誤混入）: CI ルール追加の未タスク化を検討
2. RISK-04（情報漏洩）: post-processing sanitizer の実装要件を後続タスクに含める
3. RISK-05（開示義務解釈）: 法務レビュー対象として記録
4. RISK-06（State 遷移不整合）: Approval Check の同期ブロッキング実装を後続タスクで必須化
