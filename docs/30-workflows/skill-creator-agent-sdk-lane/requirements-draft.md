# Skill Creator Agent SDK Lane 要件草案

更新日: 2026-03-26  
ステータス: 草案  
位置づけ: 実装前の認識合わせ用。タスク仕様書ではなく、要求・制約・設計仮説・移行論点を分離して確認するための下書き。
成熟度: 草案だが、`root-workflow-pack/` と child task 分解の前提として固定済み。依存順と gate は `root-workflow-pack/`、背景と制約は本草案を正本とする。

---

## 1. この草案の目的

この文書は、`skill-creator` を最新状態のまま読み取り、UI/UX・Runtime・IPC・Agent SDK・既存 Skill 管理機構へ統合し、**スキルを量産できる機能**として本システムに組み込むための要件草案である。

本草案の目的は次の4点である。

- 何を今回のスコープに含めるかを先に固定する
- 既存実装と既存仕様のズレを可視化する
- 「要求」と「設計仮説」と「移行差分」を分離する
- 後続の正式要件定義書・タスク仕様書の前提を揃える

本草案では次をまだ行わない。

- フェーズ分解済みタスク仕様書の作成
- 実装順やPR分割の確定
- Issue 化

---

## 2. 真の論点

今回の論点は「`skill-creator` を動的に読むか」そのものではない。  
真の論点は、**この機能をどの単位で製品責務として定義するか**である。

本件には、少なくとも次の3つの投資案件が含まれている。

1. `skill-creator` 更新追従コストを下げるための動的解釈基盤
2. 量産品質を閉じるための verify / improve 閉ループ
3. 分散した生成導線を統合する主導線再設計

この3つは関連するが、因果は別である。

- 更新頻度が高い → コード埋め込みが高コスト → manifest / loader が必要
- 量産する → 品質ばらつきが増える → verify / improve が必要
- 導線が分散している → 責務が曖昧になる → UI/保守性が下がる

今回の中心は、この 3 案件を同時に完成させることではない。動的更新追従、state owner、lane response baseline を先に固定し、verify と UI 統合を手戻りなく進められる土台を作ることにある。

今回の要件草案では、この3案件を混同せず、どこまでを今回閉じるかを明示する。

加えて、`skill-creator` が常に同じ directory / file layout を保つとは仮定しない。
repo 同梱版、ユーザーホーム配下、環境変数指定、workflow/manifest が指す外部配置、将来の派生ディレクトリを含め、**複数候補 root と構成差分を動的に扱えること**を lane 全体の前提に置く。

---

## 3. 背景

現状の `skill-creator` は頻繁に更新されるメタスキルであり、そのロジックをアプリコードへ都度ハードコードすると、更新のたびに Main / Preload / Renderer / IPC の再配線が必要になる。

一方で、本システムには既に以下の土台がある。

- Skill Creator 用の既存サービス `SkillCreatorService`
- Runtime 用の `RuntimeSkillCreatorFacade`
- `skill-creator:*` IPC surface
- `SkillLifecyclePanel` / `SkillCreateWizard` の UI 導線
- Agent SDK / Claude Code runtime 基盤
- Guided Execution / terminal handoff / approval / disclosure の UX 基盤

ただし現状は、以下の問題が残っている。

- `skill-creator` を読み取って実行する engine が未成立
- `plan / execute / improve` はあるが phase 駆動の workflow 制御がない
- `verify` 契約がない
- `skill-creator` 更新の即時追従境界が未定義
- 生成導線が複数に分散している
- runtime route と handoff route の責務分離が不完全

---

## 4. 成功条件

今回の草案時点では、成功条件を次の3つに置く。

1. `skill-creator` の変更に対し、どこまで manifest で吸収し、どこからコード修正が必要かの境界が明記されている
2. 量産機能の最小構成が定義され、verify / improve / UI 統合の初回スコープが過剰でない
3. 実行状態、phase 遷移、verify fail 後の次アクションについて、責任主体が曖昧でない
4. `skill-creator` の配置先や file layout が変わっても、source discovery と resource provenance で追跡可能である

---

## 5. スコープ

### 5.1 今回含める

- `skill-creator` 実行のための manifest 駆動基盤
- 複数 candidate root と構成差分を扱う source discovery / provenance 方針
- phase 制御 engine の要件定義
- selective loading による prompt / agent / reference 読み込み方針
- UI での plan / review / execute / verify / improve 導線の要件整理
- Agent SDK を主線とした runtime 実行方針
- verify 契約の新設
- improvement proposal の正式導線化方針
- runtime route / terminal handoff route の整合
- 既存コードの責務整理と重複解消方針

### 5.2 今回含めない

- GitHub Issue 化
- 細粒度タスク分解
- provider 横断対応の本格実装
- Bedrock / Vertex / Foundry への切替実装
- multi-agent orchestration の本格展開
- `skill-creator` 以外のスキルへ一般化した汎用 engine 実装
- 完全な session persistence / rewind / fork の本実装確定

### 5.3 初回スコープを意図的に絞る部分

- manifest は万能設定ファイルにしない
  - 初回は phase 定義、resource 参照、entry / exit 条件に絞る
- verify は多層のうち初回は Layer 1 / 2 を主軸にする
- UI 統合は全面再設計ではなく主導線一本化を優先する
- session persistence は要件定義に留め、詳細設計は後続に回す

---

## 6. ユーザーとユースケース

### 6.1 主対象

- Skill を自然言語から量産したい内部開発者
- 既存 Skill を改善・再生成・派生作成したい運用者
- `skill-creator` を更新しながらシステムに追従させたい保守担当者

### 6.2 主要ユースケース

- 新規スキルを自然言語から作成する
- 既存スキルをベースに派生スキルを量産する
- 生成したスキルをその場で verify し、必要なら improve に回す
- `skill-creator` の更新内容を次回実行から反映する
- API 実行不能時のみ terminal handoff へ安全に退避する

---

## 7. 決定事項と未決事項

### 7.1 現時点の決定事項

- Agent SDK を主線とする
- `query()` を実行中心にする
- `Plan → Review → Execute → Verify → Improve` を基本ライフサイクルとする
- API 実行レーンを正規レーン、terminal handoff を補助レーンとする
- `skill-creator` の更新追従はハードコードではなく manifest 駆動を中心に検討する
- 単一固定ディレクトリは正本にしない。source root は manifest / explicit path / env / home / repo bundle の順で解決し、解決結果を provenance として保持する
- lane response baseline（`integrated_api` / `terminal_handoff` の戻り方）は foundation-level contract として前段で固定する
- `resumeToken` は workflow state envelope の owner を先に定義し、互換性 / invalidation は別論点として後段へ委譲する

### 7.2 現時点の未決事項

- verify fail 時に execute を停止するか、warning 通過を許容するか
- verify の Layer 3 / 4 を初回スコープに含めるか
- session persistence の保存先と互換性戦略
- `SkillLifecyclePanel` と `SkillCreateWizard` を統合するか、役割分離のまま維持するか
- `skill-creator` 全体を読むのか、DSL 相当の最小契約だけ抽出するのか

---

## 8. 用語定義

- 動的解釈基盤
  - `skill-creator` の変更をコードへ直接埋め込まず、外部定義と loader を通じて追従する基盤
- manifest
  - phase 定義、参照 resource、entry / exit 条件など、workflow の構造を機械可読化した定義
- verify
  - 生成結果を quality gate として検証し、改善に渡す issue を構造化する工程
- improve
  - verify またはユーザーフィードバックに基づいて改善提案を生成・適用する工程
- 主導線
  - ユーザーが通常操作で使う一次的な生成導線
- 補助レーン
  - API 実行不能時や詳細確認時にだけ使う secondary route

---

## 9. 機能要求

### 9.1 FR-01 動的更新追従

- `skill-creator` の workflow 構造を外部定義で読み取れること
- phase 定義、resource 参照、entry / exit 条件をコード外で表現できること
- どの変更が manifest で吸収でき、どの変更がコード修正対象になるかを明記すること
- `skill-creator` の directory / file layout が単一でなくても、candidate root と resource descriptor から解決できること
- 解決した source root、resource absolute path、hash / snapshot を provenance として後続 phase と resume に渡せること

### 9.2 FR-02 workflow 実行

- ユーザーの自然言語要求から、plan / execute / verify / improve の一連の流れを起動できること
- workflow は phase 遷移を持つこと
- phase ごとの入出力と成果物が定義されること

### 9.3 FR-03 UI 対話

- AI からの質問を UI の入力フォームまたは選択肢として表示できること
- ユーザーは plan をレビューし、続行 / 修正 / 中止を選べること
- verify 結果と improvement proposal を UI で確認できること

### 9.4 FR-04 verify 契約

- `verify` は独立した契約として存在すること
- 入力、出力、失敗時動作、再実行条件が定義されること
- verify 結果は improve に引き渡せる構造を持つこと

### 9.5 FR-05 route 分離

- API 実行レーンと terminal handoff レーンを混同しないこと
- API 実行不能時だけ handoff を提示すること
- handoff は user-operated lane として扱うこと

### 9.6 FR-06 既存導線整理

- `SkillLifecyclePanel` と `SkillCreateWizard` の重複を整理すること
- template generation と runtime generation の責務境界を定義すること
- improvement proposal をライフサイクル本線へ統合すること

---

## 10. 非機能要求

### 10.1 NFR-01 変更耐性

- `skill-creator` 更新時に、全 Main / Preload / Renderer を毎回大きく変更しなくてよいこと

### 10.2 NFR-02 可読性

- ユーザーは現在何をしているかを UI から把握できること
- raw terminal を primary UI にしないこと

### 10.3 NFR-03 運用性

- API 実行不能時に graceful degradation できること
- handoff 時に no-op CTA を出さないこと
- 実行レーンの違いが運用上判別できること

### 10.4 NFR-04 監査性

- approval / disclosure / route decision / verify 結果を観測可能にすること

### 10.5 NFR-05 セキュリティ

- `claude.ai` consumer 認証を本体実行に流用しないこと
- renderer に API key を渡さないこと
- hidden prompt injection / auto-send をしないこと

### 10.6 NFR-06 構成ドリフト耐性

- repo 同梱版、home 配置、外部配置、派生ディレクトリ差分があっても単一固定パスに依存しないこと
- source discovery が失敗した場合は silent fallback せず、degrade reason と provenance 欠落を記録すること
- 同名 resource が複数 root に存在する場合は優先順位と conflict rule が定義されていること

---

## 11. 受け入れ観点

この草案レビューでは、少なくとも次を確認できる状態を目指す。

- 矛盾なし
  - manifest 駆動と UI/phase 設計が衝突していない
- 漏れなし
  - 機能要求、非機能要求、失敗時動作、移行論点が最低限列挙されている
- 整合性あり
  - 用語と責務の粒度が揃っている
- 依存関係整合
  - 既存実装との差分を埋める中間設計論点が見えている

---

## 12. 設計仮説

この章は要求ではなく、現時点の設計仮説である。

### 12.1 設計原則

- Agent SDK 主線
- manifest 駆動
- selective knowledge loading
- API 実行優先、terminal handoff は補助
- 既存コードの段階的再編

### 12.2 抽象責務

初回要件では、実装クラス名よりも次の責務で捉える。

- 変化吸収層
  - `skill-creator` 更新差分を吸収する
- 対話制御層
  - phase 遷移と user interaction を制御する
- 品質保証層
  - verify / improve を閉じる
- 導線統合層
  - UI 主導線と補助レーンを整理する

### 12.3 目標アーキテクチャの叩き台

```text
Renderer
  ├─ 主導線 UI
  ├─ verify / improve UI
  └─ handoff guidance UI

Preload
  ├─ skillCreatorAPI
  ├─ interaction bridge API
  └─ verification API

Main
  ├─ runtime facade
  ├─ workflow engine
  ├─ manifest 読み込み
  ├─ interaction bridge
  └─ route / audit / session coordination

Runtime
  ├─ Agent SDK executor
  ├─ verify runner
  └─ improve runner
```

### 12.4 具体クラスへの暫定マッピング

- `SkillCreatorService`
  - script-first / file scaffold / validation 実行基盤
- `RuntimeSkillCreatorFacade`
  - renderer から見た public runtime surface
- `SkillCreatorWorkflowEngine`
  - phase 遷移と成果物管理
- `ManifestLoader`
  - manifest 読み込みと検証
- `ContextBudgetManager`
  - selective loading と token budget
- `UserInteractionBridge`
  - UI 対話の仲介

注意:

- これは暫定マッピングであり、クラス構成を確定するものではない
- 特に `ManifestLoader` は責務が肥大化しやすいため、runtime configuration authority へ膨らませない

---

## 13. phase と UI に関する仮説

phase は内部状態として必要だが、UI 表現まで phase 固定にするとは限らない。

### 13.1 仮説

- engine 内部では phase ID を持つ
- UI は phase そのものではなく、ユーザーが今必要な行動で見せる
- つまり「phase-driven backend / task-oriented UI」を採用候補とする

### 13.2 初回方針

- phase は必須 phase と可変 phase に分ける
- 初回は phase 数を固定仕様にしない
- UI は `入力 → 確認 → 生成 → 検証 → 改善` の理解しやすい面を優先する

---

## 14. verify / improve 閉ループ要件

### 14.1 verify の目的

- 構造妥当性を確認する
- 内容の最低品質を担保する
- improve に渡す issue を構造化する

### 14.2 verify の初回スコープ

- Layer 1: 構造検証
- Layer 2: 内容ルール検証

### 14.3 verify の将来拡張

- Layer 3: 実行・使用可能性検証
- Layer 4: 必要時の LLM 補助評価

### 14.4 improve の目的

- verify または user feedback を受けて改善提案を構造化する
- ユーザーが適用対象を選べるようにする
- 再 verify に戻せるようにする

### 14.5 未決事項

- fail を hard gate にするか
- warning 付き通過を認めるか
- low-risk skill に risk-based verify を導入するか

---

## 15. 状態所有権で見た責務論点

要件草案として最も重要なのは、実行状態の owner を曖昧にしないことである。

最低限、次の責任主体を後続設計で固定する必要がある。

- `currentPhase` の owner
- `awaitingUserInput` の owner
- `verifyResult` の owner
- `laneResponse` / `handoff guidance` の owner
- `resumeToken` の owner
- verify fail 後の次アクション決定権

この章は、後続の正式要件定義で状態所有権表へ展開する前提メモである。

---

## 16. 失敗時動作と graceful degradation

少なくとも次を定義対象に含める。

- LLM unavailable 時の plan / execute / verify / improve の挙動
- API key unavailable 時の route 切替
- handoff への退避条件
- verify 実行不能時の扱い
- 古い session と新しい manifest の互換性が崩れた場合の扱い

---

## 17. セッション / 永続化 / 再開の論点

初回スコープでは本実装を確定しないが、要件論点としては外せない。

最低限必要な保存対象:

- workflow session ID
- 現在 phase
- phase artifacts
- user responses
- verify result
- improvement selection
- runtime route
- handoff state

補足:

- `resumeToken` の意味論すべてを Task02 時点で確定するのではなく、Task02 では workflow state envelope と resume handoff point までを扱う
- 互換性、invalidation、checkpoint 破棄条件は後段の session compatibility task で閉じる

未解決の重要論点:

- 途中で `skill-creator` 自体が更新された場合の resume 互換性
- checkpoint の互換性と破棄条件
- 並行実行時の排他

---

## 18. 実行 governance

### 18.1 API レーン

- Anthropic Console API key を主線とする
- Agent SDK で実行する
- plan / execute / verify / improve の正規レーンとする

### 18.2 terminal handoff レーン

- API 実行不能時の補助レーンとする
- Claude Code CLI を user-operated lane として扱う
- guidance / command / manual boundary を明示する

### 18.3 コンプライアンス

- third-party product として `claude.ai` consumer 認証を本体実行に流用しない
- hidden prompt injection をしない
- auto-send をしない
- raw terminal は opt-in detail layer に限定する

### 18.4 2026-03-26 時点の公式照合メモ

2026-03-26 時点で、少なくとも次の前提を公式ドキュメントで再確認している。

- Agent SDK の TypeScript 実装は `query()` を中心に組み立てる前提でよい
- 権限制御は `permissionMode` と `canUseTool` を軸に整理する前提でよい
- sessions は SDK の正式機能として扱ってよい
- TypeScript Client SDK は official SDK として提供されており、Node.js 20+ 前提で扱う

確認先:

- `https://platform.claude.com/docs/en/agent-sdk/overview`
- `https://platform.claude.com/docs/en/agent-sdk/typescript`
- `https://platform.claude.com/docs/en/agent-sdk/permissions`
- `https://platform.claude.com/docs/en/agent-sdk/sessions`
- `https://platform.claude.com/docs/en/api/client-sdks`

---

## 19. 現状との差分

### 19.1 実装済みの土台

- `RuntimeSkillCreatorFacade` に `plan / execute / improve / applyImprovement` がある
- `skill-creator:*` 系 IPC / preload surface がある
- `SkillLifecyclePanel` と `SkillCreateWizard` から runtime plan/execute を呼ぶ経路がある
- `RuntimePolicyResolver` による integrated API / terminal handoff 分岐がある
- `TerminalHandoffBuilder` により Guided Execution 側との接続基盤がある
- `ImprovementProposalPanel` / `applyRuntimeImprovement` の要素が存在する

### 19.2 未完または不足

- `workflow-manifest.json`
- `ManifestLoader`
- `SkillCreatorWorkflowEngine`
- `ContextBudgetManager`
- `SkillCreatorSourceResolver`
- `UserInteractionBridge`
- `skill-creator:verify`
- verify UI / state / result type
- workflow session persistence の本契約
- `execute()` の workflow engine 経由化
- 複数 `skill-creator` root の優先順位と provenance 固定

### 19.3 既存導線の重複

- `SkillLifecyclePanel` と `SkillCreateWizard`
- template generation と runtime generation
- improve UI とライフサイクル本線
- `SkillCreatorService` と `RuntimeSkillCreatorFacade` の責務境界

---

## 20. 移行上の注意点

- 既存 `plan / execute / improve` surface は一気に破壊的変更しない
- `execute()` の置換は route / auth / handoff を壊さない中間段階を必要とする
- `verify` は新規追加であり、preload / IPC / renderer / state の全レイヤーで契約追加が必要
- completed docs と current implementation の同期ズレを整理対象に含める

---

## 21. 既存仕様・既存実装との同期対象

- `docs/30-workflows/skill-creator-llm-integration/`
- `docs/30-workflows/skill-creator-agent-sdk-lane/`
- `docs/30-workflows/guided-execution-console-realization/`
- `docs/30-workflows/ai-runtime-execution-responsibility-realignment/`
- `.agents/skills/aiworkflow-requirements/` の関連 canonical references

---

## 22. リスク登録簿

- RISK-01
  - manifest が万能化し、責務が肥大化する
- RISK-02
  - verify を重くしすぎて量産性を損なう
- RISK-03
  - UI 統合を広げすぎて backend 基盤整備より先に変更面積が膨らむ
- RISK-04
  - 固定ディレクトリ前提が runtime / session / governance へ残り、派生 `skill-creator` 配置を誤読する
  - session / resume 要件を初回で抱え込みすぎる
- RISK-05
  - 要求と設計が混在したまま進み、後続タスクで認識ズレが再発する

---

## 23. この草案レビューで確認したいこと

- 今回の真の論点設定に合意できるか
- 初回スコープの絞り込み方に無理がないか
- verify を初回は Layer 1 / 2 中心に置く方針でよいか
- phase は内部状態、UI はタスク指向表現という方針でよいか
- 状態所有権表を正式要件定義の必須成果物にするか
- `SkillLifecyclePanel` と `SkillCreateWizard` の統合レベルをどこまでにするか

---

## 24. 暫定結論

今回の実装は、単なる Skill Creator 機能追加ではなく、`skill-creator` を中心とした**動的 workflow 実行基盤の導入**として扱うべきである。

ただし、初回から全部を閉じるのではなく、次の順に主軸を絞るべきである。

1. 動的更新追従の境界定義
2. state owner と lane response baseline の明文化
3. selective loading / interaction bridge の土台整理
4. verify 契約の新設
5. UI 主導線の一本化
6. governance / session compatibility の hardening

後続の正式要件定義とタスク仕様書では、上記の優先順に沿って前段契約から閉じることを主軸とする。

session persistence については、本実装確定ではなく compatibility contract の固定までを今回 scope とする。
