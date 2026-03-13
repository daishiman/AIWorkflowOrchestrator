# Phase 6 回帰計画

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| タスクID   | TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001 |
| Phase      | 6                                            |
| 成果物種別 | 回帰計画                                     |
| 作成日     | 2026-03-13                                   |
| 前提       | Phase 5 実装計画                             |
| 後続       | Phase 7 カバレッジ計画                       |

---

## 1. mode 変更回帰

authMode 変更が capability 再評価と UI 更新に正しく伝播することを検証する。

### 1.1 テストシナリオ

| ID    | シナリオ                                         | トリガー                    | 期待結果                                                 | 関連契約                  |
| ----- | ------------------------------------------------ | --------------------------- | -------------------------------------------------------- | ------------------------- |
| MR-01 | api-key -> subscription 切替                     | `auth-mode:set` IPC         | capability が `terminalSurface` に変更される             | legacy migration テーブル |
| MR-02 | subscription -> api-key 切替（API key 存在）     | `auth-mode:set` IPC         | capability が `integratedRuntime` に変更される           | legacy migration テーブル |
| MR-03 | subscription -> api-key 切替（API key 不在）     | `auth-mode:set` IPC         | capability が `none` に変更される                        | legacy migration テーブル |
| MR-04 | capability 変更が Renderer store に反映される    | `ai:capability-changed` IPC | aiAccessSlice の `accessCapability` が更新される         | State 契約 2.2            |
| MR-05 | capability 変更が全 surface に broadcast される  | `ai:capability-changed` IPC | 全 surface コンポーネントが新しい capability を受信する  | IPC 契約 1.1              |
| MR-06 | 初回起動時に legacy authMode が migration される | アプリ起動                  | `migrateToCapability()` が呼ばれ capability が設定される | AuthModeService Step 3    |

### 1.2 エッジケース

| ID    | ケース                                               | 期待結果                                            |
| ----- | ---------------------------------------------------- | --------------------------------------------------- |
| ME-01 | authMode 変更中に API key が同時に変更される         | capability が最終状態に収束する（中間状態残存なし） |
| ME-02 | authMode 値が不正（空文字列）                        | P42 準拠 3 段バリデーションで拒否される             |
| ME-03 | authMode 値が未知の文字列                            | fail-fast error が返される                          |
| ME-04 | migration 対象の authMode が既に capability 変換済み | 二重変換せず現在値を保持する                        |

---

## 2. cache invalidation 回帰

API key 変更や selectedConfig 変更で adapter cache が正しくクリアされることを検証する。

### 2.1 テストシナリオ

| ID    | シナリオ                                         | トリガー                  | 期待結果                                              | 関連契約                  |
| ----- | ------------------------------------------------ | ------------------------- | ----------------------------------------------------- | ------------------------- |
| CI-01 | API key 設定で全 provider の adapter cache clear | `auth-key:set` IPC        | `LLMAdapterFactory` の全キャッシュがクリアされる      | Cache Clear 条件テーブル  |
| CI-02 | API key 削除で adapter cache clear               | `auth-key:remove` IPC     | 該当 provider のキャッシュがクリアされる              | Cache Clear 条件テーブル  |
| CI-03 | selectedConfig 変更で該当 adapter cache clear    | `llm:set-selected-config` | 該当 provider のキャッシュのみクリアされる            | Adapter Cache ポリシー    |
| CI-04 | capability 変更で全 cache clear                  | capability 変更           | adapter cache + capability cache が両方クリアされる   | Cache Clear 条件テーブル  |
| CI-05 | cache clear 後に新 adapter が生成される          | AI chat 実行              | 新しい credential で adapter が再生成される           | Adapter Cache ポリシー    |
| CI-06 | stale adapter での実行が発生しない               | API key 変更直後          | 旧 credential の adapter が使用されないことを確認する | Silent Stub Fallback 禁止 |

### 2.2 エッジケース

| ID    | ケース                                                | 期待結果                                         |
| ----- | ----------------------------------------------------- | ------------------------------------------------ |
| CE-01 | cache clear と同時に AI chat リクエストが到達する     | リクエストは新 adapter で処理される（race 安全） |
| CE-02 | 存在しない providerId で cache clear を試みる         | エラーにならず no-op で終了する                  |
| CE-03 | adapter 生成失敗後に再度 cache clear + 再生成を試みる | 正常に adapter が再生成される                    |

---

## 3. guidance 表示回帰

fail-fast 時に guidance block が正しく表示され、CTA 導線が機能することを検証する。

### 3.1 テストシナリオ

| ID    | シナリオ                                             | fail-fast 条件            | 期待結果                                                    | 関連契約                |
| ----- | ---------------------------------------------------- | ------------------------- | ----------------------------------------------------------- | ----------------------- |
| GD-01 | API key 未設定で AI chat 実行                        | `CREDENTIAL_MISSING`      | guidance block に「API key を設定してください」が表示される | Fail-Fast ルール        |
| GD-02 | 未知の providerId で runtime 解決                    | `PROVIDER_UNKNOWN`        | guidance block に provider 名と対応手順が表示される         | Fail-Fast ルール        |
| GD-03 | adapter 生成失敗                                     | `ADAPTER_CREATION_FAILED` | guidance block にリトライ可否と対処法が表示される           | Fail-Fast ルール        |
| GD-04 | capability が `none` の surface で AI 実行を試みる   | `CAPABILITY_UNAVAILABLE`  | guidance block に設定画面への CTA が表示される              | Fail-Fast ルール        |
| GD-05 | guidance block 内の CTA ボタンが Settings に遷移する | CTA クリック              | Settings 画面の access card セクションに遷移する            | Renderer Preflight      |
| GD-06 | preflight が独自エラー文を生成しない                 | 任意の fail-fast          | Main が返した reason がそのまま表示される                   | Renderer Preflight 禁止 |

### 3.2 エッジケース

| ID    | ケース                                    | 期待結果                                       |
| ----- | ----------------------------------------- | ---------------------------------------------- |
| GE-01 | guidance reason が空文字列                | デフォルトの guidance メッセージが表示される   |
| GE-02 | guidance に HTML タグが含まれる           | エスケープされて安全に表示される               |
| GE-03 | fail-fast error の retryable=true の場合  | リトライボタンが表示される                     |
| GE-04 | fail-fast error の retryable=false の場合 | リトライボタンが非表示（CTA のみ表示）         |
| GE-05 | 複数の fail-fast が連続して発生する       | 最新の guidance のみ表示される（重複表示なし） |

---

## 4. terminal availability 回帰

terminal 状態変更が handoff card と capability に正しく反映されることを検証する。

### 4.1 テストシナリオ

| ID    | シナリオ                                                 | トリガー                                 | 期待結果                                                   | 関連契約             |
| ----- | -------------------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------- | -------------------- |
| TA-01 | terminal 可用 -> 不可用に変更                            | `terminal:availability-changed` IPC      | `terminalAvailable` が `false` に更新される                | State 契約 2.2       |
| TA-02 | terminal 不可用 -> 可用に変更                            | `terminal:availability-changed` IPC      | `terminalAvailable` が `true` に更新される                 | State 契約 2.2       |
| TA-03 | terminal 可用時に handoff CTA が表示される               | capability = `both` or `terminalSurface` | handoff card の CTA ボタンが活性化される                   | Terminal 契約 4.1    |
| TA-04 | terminal 不可用時に handoff CTA が非活性になる           | capability 再評価                        | handoff card の CTA ボタンが disabled になる               | Terminal 契約 4.1    |
| TA-05 | terminal 可用性変更で capability が再評価される          | `terminal:availability-changed`          | `ai:capability-changed` が broadcast される                | State 更新フロー 2.3 |
| TA-06 | terminal launch が user-operated 境界を侵害しない        | `terminal:launch` IPC                    | auto-send / hidden prompt injection が行われないことを確認 | Terminal 契約 4.2    |
| TA-07 | terminal copy-command がクリップボードに正しくコピーする | `terminal:copy-command` IPC              | 指定コマンドがクリップボードに設定される                   | Terminal 契約 4.1    |

### 4.2 エッジケース

| ID    | ケース                                            | 期待結果                                             |
| ----- | ------------------------------------------------- | ---------------------------------------------------- |
| TE-01 | terminal 可用性が高速に切り替わる（フラッピング） | 最終状態に収束する（中間状態の残存なし）             |
| TE-02 | API key 存在 + terminal 可用                      | capability が `both` になる                          |
| TE-03 | API key 不在 + terminal 可用                      | capability が `terminalSurface` になる               |
| TE-04 | API key 不在 + terminal 不可用                    | capability が `none` になる                          |
| TE-05 | RAG surface で terminal handoff を試みる          | handoff CTA が表示されない（integratedRuntime のみ） |
| TE-06 | handoff card の contextSummary が空文字列         | デフォルトの context 説明が表示される                |

---

## 5. 回帰テスト実行順序

各回帰カテゴリの依存関係に基づく実行順序:

| 順序 | カテゴリ                   | テスト数 | 依存                           |
| ---- | -------------------------- | -------- | ------------------------------ |
| 1    | mode 変更回帰              | 10       | なし（基盤テスト）             |
| 2    | cache invalidation 回帰    | 9        | mode 変更回帰が PASS           |
| 3    | guidance 表示回帰          | 11       | cache invalidation 回帰が PASS |
| 4    | terminal availability 回帰 | 13       | mode 変更回帰が PASS           |

合計テストケース: 43

---

## 6. テストファイル配置計画

| テストファイル                                                                              | カテゴリ  | テスト数 |
| ------------------------------------------------------------------------------------------- | --------- | -------- |
| `apps/desktop/src/main/services/ai/__tests__/AIAccessCapabilityResolver.regression.test.ts` | mode 変更 | 10       |
| `apps/desktop/src/main/adapters/llm/__tests__/LLMAdapterFactory.cache.test.ts`              | cache     | 9        |
| `apps/desktop/src/renderer/utils/__tests__/skillExecutionAuthPreflight.guidance.test.ts`    | guidance  | 11       |
| `apps/desktop/src/main/services/ai/__tests__/terminal-availability.regression.test.ts`      | terminal  | 13       |
