# リスク評価

## メタ情報

| 項目     | 内容                      |
| -------- | ------------------------- |
| Phase    | 9                         |
| タスクID | UT-SKILL-WIZARD-W3-seq-04 |
| 作成日   | 2026-04-08                |
| 状態     | completed                 |

---

## リスク一覧

| リスクID | リスク内容                                             | 発生確率 | 影響度 | 対策                                                                                         | 残余リスク |
| -------- | ------------------------------------------------------ | -------- | ------ | -------------------------------------------------------------------------------------------- | ---------- |
| R-01     | `skill_wizard_started` が dev で重複して見える         | 低       | 低     | StrictMode の二重マウントはテストハーネスで切り分け済み。prod では `NODE_ENV` チェックで抑制 | 許容       |
| R-02     | 本番環境で `console.info` が出力される                 | 低       | 低     | `process.env.NODE_ENV !== "production"` 分岐で防止済み                                       | なし       |
| R-03     | `skill_wizard_started` に余計なキーが混ざる            | 低       | 低     | `Record<never, never>` 型により空オブジェクトのみ許容。型エラーで検出                        | なし       |
| R-04     | `skippedAtQuestion` に不正な値が渡される               | 低       | 低     | `number \| null` 型制約。`resolveSkippedAtQuestion` で算出                                   | なし       |
| R-05     | LLM 生成失敗時に `generation_completed` が発火する     | 低       | 中     | `try/catch` 外に計装を配置しない設計で防止。TC-E02 で確認済み                                | なし       |
| R-06     | 将来の分析基盤移行時に呼び出し側変更が必要になる       | 確実     | 低     | `trackEvent.ts` の sink 差し替えポイントをコメントで明示済み                                 | 低         |
| R-07     | `SkillAnalytics` との混在による責務曖昧化              | 低       | 中     | Phase 8 の責務境界マップで分離を文書化。import 確認済み                                      | なし       |
| R-08     | TC-11 / TC-12 がテスト環境での UI 到達困難で SKIP 扱い | 中       | 低     | 計装はハンドラレベルで実装済み。UI 到達確認は Phase 11 console 証跡で代替                    | 許容       |

---

## 因果ループ監査

### ループ 1: trackEvent スタブの副作用

```
trackEvent スタブ実装
  → console.info に依存する（dev のみ）
  → 本番環境では NODE_ENV チェックで出力を抑制
  → 将来基盤に差し替えてもスタブのインターフェースは変わらない ✓
  → 呼び出し側（SkillCreateWizard）の変更不要 ✓
```

**副作用ループなし**

---

### ループ 2: skill_wizard_started の useEffect 計装

```
skill_wizard_started の useEffect 計装
  → コンポーネントマウント時に 1 回発火
  → StrictMode では dev-only の二重マウントがあり得る
  → テストハーネスで production 想定と切り分け ✓
  → prod では 1 回のみ発火 ✓
```

**問題なし。StrictMode 二重発火は dev 環境限定であり許容範囲**

---

### ループ 3: skill_wizard_next_action の SkillCreateWizard 側計装

```
SkillCreateWizard が handleExecuteNow 内で trackEvent を発火
  → onNextAction コールバックを呼ぶ前に trackEvent を発火
  → onNextAction が失敗した場合もイベントは発火済み
  → 計装は best-effort（受容可能リスク）✓
  → CompleteStep は trackEvent を呼ばない（責務分離）✓
```

**問題なし。best-effort 計装として許容**

---

### ループ 4: renderer-local trackEvent と既存基盤の分離

```
renderer-local trackEvent
  → SkillAnalytics / AnalyticsStore とは切り分ける
  → UI 計装の責務を main process に持ち込まない
  → execution-centric 基盤との依存ループを作らない ✓
  → IPC / preload 契約に変更なし ✓
```

**依存ループなし**

---

## StrictMode 二重発火の詳細評価

| 環境                   | 挙動                                        | 対応状況                                                          |
| ---------------------- | ------------------------------------------- | ----------------------------------------------------------------- |
| dev（StrictMode あり） | `useEffect` が 2 回実行される場合がある     | テストでは StrictMode なし。console で 2 回出る可能性あり（許容） |
| dev（StrictMode なし） | `useEffect` は 1 回のみ                     | 正常                                                              |
| prod                   | `useEffect` は 1 回のみ。console 出力も抑制 | 正常                                                              |

---

## 残余リスクサマリー

| 残余リスク                           | 対応方針                                             |
| ------------------------------------ | ---------------------------------------------------- |
| dev の StrictMode 二重発火（R-01）   | 許容。prod では発生しない                            |
| 将来の sink 差し替え時の変更（R-06） | `trackEvent.ts` のコメントで差し替えポイント明示済み |
| TC-11/TC-12 の UI 到達困難（R-08）   | Phase 11 の console 証跡で代替確認                   |

---

## 完了条件チェックリスト

- [x] 全リスクが識別・評価されていること
- [x] StrictMode 二重発火リスクが評価されていること
- [x] 因果ループ監査が 4 ループすべて完了していること
- [x] 残余リスクが許容範囲内であること
