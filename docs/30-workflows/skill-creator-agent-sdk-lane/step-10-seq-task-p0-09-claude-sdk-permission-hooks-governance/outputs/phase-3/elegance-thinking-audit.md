# Phase 3: 30 思考法エレガンス監査 (Elegance Thinking Audit)

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| タスクID | TASK-P0-09                             |
| Phase    | 3                                      |
| 機能名   | claude-sdk-permission-hooks-governance |
| 作成日   | 2026-03-31                             |

---

## 1. 論理分析系 (5/5 思考法)

### 1.1 批判的思考

**観点**: 前提の飛躍や論理の矛盾を検出する。

**結果**: 問題なし。

- 前提「動的 skill-creator 読込を維持する」と結論「governance を hooks / policy で追加する」に矛盾なし
- 「hooks は audit のみを担う」という制約は、SDK hooks の設計意図と合致している
- `bypassPermissions` 禁止の根拠は明確（AC-2: skill-creator lane では tool 境界が必須）

### 1.2 演繹思考

**観点**: 仕様の大前提から結論が必然かを確認する。

**結果**: 問題なし。

- 大前提: phase ごとに tool 利用境界が異なる（AC-1）
- 小前提: SDK は `permissionMode` / `canUseTool` / hooks を提供する
- 結論: phase ごとに policy を定義し、hooks で監査する → 必然的に導出される

### 1.3 帰納的思考

**観点**: 複数 phase の傾向から共通欠陥を抽出する。

**結果**: 問題なし。

- 4 phase（plan/execute/verify/improve）を横断して確認
- 共通パターン: 「読取は常に許可、書込は phase に応じて制限」が一貫している
- 異常パターン: 検出されない

### 1.4 アブダクション

**観点**: 最も妥当な説明仮説を選ぶ。

**結果**: hooks + policy パターンが最適。

- 仮説 A: hooks + policy（採用）→ SDK の設計に沿い、既存コードへの変更が最小
- 仮説 B: middleware chain → SDK hooks と重複し、複雑性が増す
- 仮説 C: Facade 内部にロジック直書き → テスタビリティと再利用性が低下
- 仮説 A が妥当と判断

### 1.5 垂直思考

**観点**: 深掘りして根本の制約を特定する。

**結果**: 根本制約は「SDK の query() option で渡せる hooks は固定構造」。

- この制約の下で、policy 解決を hooks 生成の前段に配置する設計が自然
- hooks 内部での複雑な条件分岐を避け、policy resolver に委譲するのが正しい

---

## 2. 構造分解系 (4/4 思考法)

### 2.1 要素分解

**観点**: phase / concern / artifact を最小単位へ分ける。

**結果**: 適切に分解されている。

- concern 分離: policy 判定（GovernancePolicy）/ hook 生成（HooksFactory）/ event 記録（AuditSink）
- artifact 分離: 型定義（shared）/ policy 実装（main）/ IPC bridge（handlers）/ API 公開（preload）

### 2.2 MECE

**観点**: 漏れと重複を同時に排除する。

**結果**: MECE 成立。

- phase: plan / execute / verify / improve の 4 分類（漏れなし、重複なし）
- hooks: SessionStart / PreToolUse / PostToolUse / SessionEnd の 4 分類（SDK の hook ライフサイクルに完全対応）
- 責務: GovernancePolicy（判定）/ HooksFactory（生成）/ AuditSink（記録）の 3 分類（重複なし）

### 2.3 2 軸思考

**観点**: 価値 x コストで優先度を決める。

**結果**:

| 実装項目        | 価値 | コスト | 優先度          |
| --------------- | ---- | ------ | --------------- |
| phase 別 policy | 高   | 低     | 1               |
| canUseTool      | 高   | 中     | 2               |
| hooks / audit   | 高   | 中     | 3               |
| UI denial 表示  | 中   | 低     | 4               |
| audit 永続化    | 低   | 高     | 5（スコープ外） |

### 2.4 プロセス思考

**観点**: 入力 → 処理 → 出力 → 検証の流れを確認する。

**結果**: 全 phase で I/O が明確。

- plan: skillSpec(入力) → policy 判定 + LLM(処理) → planResult(出力) → audit(検証)
- execute: planResult(入力) → policy 判定 + SDK execution(処理) → executeResult(出力) → audit(検証)
- verify: skillDir(入力) → policy 判定 + checks(処理) → verifyChecks(出力) → audit(検証)
- improve: feedback(入力) → policy 判定 + LLM(処理) → suggestions(出力) → audit(検証)

---

## 3. メタ・抽象系 (3/3 思考法)

### 3.1 メタ思考

**観点**: 何を検証しているか自体を確認する。

**結果**: 検証対象は「governance 設計の健全性」であり、実装の正しさではない。Phase 3 の役割として適切。

### 3.2 抽象化思考

**観点**: 個別実装から共通契約へ抽象化する。

**結果**: 適切に抽象化されている。

- `SkillCreatorSdkPolicy` interface が 4 phase の policy を統一的に表現
- `GovernanceAuditEvent` interface が 4 種の hook event を統一的に表現
- 将来の phase 追加にも型レベルで対応可能（union type の拡張のみ）

### 3.3 ダブル・ループ思考

**観点**: 手順だけでなく前提も更新する。

**結果**: 前提の再確認完了。

- 前提「SDK hooks は audit のみ」→ 妥当。hooks で主処理を制御すると動的読込が阻害される
- 前提「bypassPermissions は禁止」→ 妥当。skill-creator が任意ファイルを変更するリスクを排除

---

## 4. 発想・拡張系 (6/6 思考法)

### 4.1 ブレインストーミング

代替案を広く列挙した結果:

1. SDK hooks パターン（採用）
2. Express 風 middleware chain
3. Proxy パターン（Facade を Proxy で wrap）
4. Decorator パターン（各メソッドに decorator を付与）
5. Policy as JSON config（外部設定ファイル化）

→ SDK hooks パターンが最小変更量 + SDK 設計意図への準拠で最適

### 4.2 水平思考

固定化された「hooks = SDK hooks のみ」から離れた案: IPC レベルで governance middleware を挟む。
→ 検討の結果、IPC レベルは粒度が粗すぎ（plan/execute 全体に対してしか判定できない）。tool 単位の判定には SDK hooks が必須。

### 4.3 逆説思考

「あえて governance を入れない場合」を検証:
→ execute phase で plan 用 Read-only tool 以外も使える状態になり、skill-creator が任意パスにファイルを作成できてしまう。安全性の観点で却下。

### 4.4 類推思考

completed workflow の成功パターンとの比較:
→ TASK-RT-06 の sdkMessageNormalizer パターン（wrapper 関数で既存処理を wrap）と同構造。追加注入のみで既存を壊さない設計として実績がある。

### 4.5 if 思考

失敗時の分岐:

- GovernancePolicy が null の場合 → optional DI により、governance なしで既存動作を維持
- AuditSink が満杯の場合 → 上限超過時に古い event を切り捨て、warning ログを出力
- hooks 内で例外発生 → catch して audit error event を記録、主処理は続行

### 4.6 素人思考

非専門家への説明:
「skill が作業する前に『この tool を使ってよいか？』を毎回確認して、ダメなら理由を記録して拒否する仕組み」→ 理解可能な抽象度。

---

## 5. システム系 (3/3 思考法)

### 5.1 システム思考

**観点**: phase 間の因果と依存ループを見る。

**結果**: 循環依存なし。governance は一方向フロー。

```
policy定義 → hooks生成 → tool判定 → audit記録 → UI表示
```

各段階が前段の出力のみに依存し、後段から前段への feedback loop はない。

### 5.2 因果関係分析

| 原因                          | 結果                                |
| ----------------------------- | ----------------------------------- |
| phase が plan である          | Write/Edit/Bash が拒否される        |
| execute のパスが skill dir 外 | deny + denial event が記録される    |
| denial が発生する             | UI に reason 付き通知が push される |

因果関係が明確で、予測不能な副作用がない。

### 5.3 因果ループ

再発を生む循環: 検出されない。governance は判定と記録のみを行い、retry / loop を生まない。

---

## 6. 戦略・価値系 (4/4 思考法)

### 6.1 トレードオン思考

| トレードオフ        | 解決                                                            |
| ------------------- | --------------------------------------------------------------- |
| 安全性 vs 柔軟性    | phase 別 policy で安全性を確保しつつ、execute では write を許可 |
| 監査粒度 vs 性能    | tool 単位の audit でバランスを取る（file 内容は含めない）       |
| DI 追加 vs 既存互換 | optional DI で既存の constructor 互換性を維持                   |

### 6.2 プラスサム思考

- governance 追加により「安全性」が向上
- audit 追加により「運用可視性」が向上
- 既存コード変更最小化により「保守性」を維持
- 3 つの価値が同時に向上し、トレードオフでない

### 6.3 価値提案思考

- **誰に**: skill-creator を使う開発者と、システムを運用する保守担当者
- **何の**: 「execute が何を変更したか分からない」「plan が予期しない書込をしないか不安」というコスト
- **どう下げるか**: phase 別の明確な tool 制約と、全 tool 使用の audit 記録

### 6.4 戦略的思考

- **今閉じる**: phase 別 policy、hooks、audit sink、denial UI push
- **後回しにする**: audit 永続化、governance dashboard、policy 外部設定化

---

## 7. 問題解決系 (5/5 思考法)

### 7.1 why 思考

**真の論点**: 動的な skill-creator 実行を維持したまま、phase ごとに tool 利用境界と監査を固定すること。

この 1 文に集約される論点に対し、設計が直接回答している。

### 7.2 改善思考

**最小改善**: GovernancePolicy の定数マップ + HooksFactory の createHooks() だけで、4 phase の tool 制約 + audit が実現する。追加モジュールは 3 つだけ。

### 7.3 仮説思考

**仮説**: 「canUseTool のパス制約だけでは将来不足になるのではないか」
→ strategy パターンにより、新しい制約ロジック（例: ファイルサイズ制限、時間制限）を GovernancePolicy に追加可能。現設計で拡張性を確保済み。

### 7.4 論点思考

論点を混ぜずに切り分けた結果:

1. policy 定義 → GovernancePolicy に閉じる
2. hook 生成 → HooksFactory に閉じる
3. event 記録 → AuditSink に閉じる
4. UI 表示 → IPC push + preload API に閉じる

4 つの論点が混在していない。

### 7.5 KJ 法

類似指摘をクラスタ化:

- Cluster A (安全性): phase 別制約、canUseTool、bypassPermissions 禁止 → AC-1, AC-2
- Cluster B (可視性): audit event、denial 表示、provenance 記録 → AC-3, AC-4, AC-5
- Cluster C (非侵襲性): 動的読込維持、既存破壊なし → AC-6

3 クラスタに収束し、全 AC がカバーされている。

---

## 8. 総合評価

| 評価項目                         | 結果     |
| -------------------------------- | -------- |
| 30 思考法の全カテゴリ適用        | 完了     |
| 致命的な設計欠陥                 | 検出なし |
| 改善が必要な軽微な点             | なし     |
| 前提の妥当性                     | 確認済み |
| 再構成した方がエレガントなケース | なし     |

**結論**: 現設計は 30 思考法の全 7 カテゴリで検証済みであり、エレガンスの観点から問題は検出されない。設計の変更・破棄は不要。
