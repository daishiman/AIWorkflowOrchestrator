# Phase 8 リファクタリング境界定義

## メタ情報

| 項目      | 内容                                            |
| --------- | ----------------------------------------------- |
| タスクID  | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| Phase     | 8                                               |
| 作成日    | 2026-03-24                                      |
| 依存Phase | Phase 1-7                                       |

## 1. リファクタリング対象の特定

### 1.1 警告の重複整理

Phase 1-5 の設計で定義した safety UI には、以下の情報重複が存在する。

| 重複パターン                                                         | 出現箇所                                                   | 影響                        |
| -------------------------------------------------------------------- | ---------------------------------------------------------- | --------------------------- |
| 外部送信の開示が Session Banner と Approval Sheet の両方で表示される | SessionDisclosureBanner (DSC-R1) + Approval Sheet (APR-T1) | ユーザーが同じ情報を2回読む |
| AI 利用の開示が Banner 表示直後に Approval Sheet でも繰り返される    | SessionDisclosureBanner + Approval Sheet 操作説明          | 冗長な説明による認知負荷    |
| 停止方法の説明が Approval Sheet と Session Dock の両方にある         | Approval Sheet (停止方法セクション) + Session Dock CTA     | 情報の二重提示              |

### 1.2 整理方針

| 重複パターン       | 整理方針                                                                            | 残す側       | 削減する側     |
| ------------------ | ----------------------------------------------------------------------------------- | ------------ | -------------- |
| 外部送信の二重開示 | Banner は「可能性の予告」、Approval Sheet は「具体的な送信先と内容」に役割分担する  | 両方残す     | 内容を差別化   |
| AI 利用の二重開示  | Banner で開示済みのため、Approval Sheet では AI 名を再掲せず操作内容に集中する      | Banner       | Approval Sheet |
| 停止方法の二重提示 | Approval Sheet の停止方法セクションを1行に簡素化し、Session Dock CTA を主導線とする | Session Dock | Approval Sheet |

### 1.3 差別化後の情報配置

```
Session Disclosure Banner（Session open 時に1回表示）:
  - 「AI ({modelName}) が操作を支援します」
  - 「外部サービスへのデータ送信が発生する場合があります」
  - 「実行前に確認画面が表示されます」

Approval Sheet（操作実行時に毎回表示）:
  - 操作タイトル（「外部送信の確認」等）
  - 具体的な送信先 / 操作対象
  - データ概要
  - 「中止はいつでも可能です」（1行のみ）
  - 「承認」「拒否」ボタン
```

## 2. Disclosure 簡潔化

### 2.1 現状の問題

Phase 2 設計の Disclosure 2.2 で定義した開示テンプレートは3行構成だが、Session Dock の限られたスペースでは冗長になる可能性がある。

### 2.2 簡潔化方針

| 要素                               | 現状                          | 簡潔化後                   | 根拠                 |
| ---------------------------------- | ----------------------------- | -------------------------- | -------------------- |
| AI 利用開示                        | 独立した文                    | 1行に統合                  | Banner は概要で十分  |
| 外部送信開示                       | 独立した文 + 送信先種別リスト | 1行 + 「詳細」リンク       | 初期表示は概要に絞る |
| 「実行前に確認画面が表示されます」 | 独立した文                    | 維持（安心感の提供に必要） | MUST-2/MUST-3 の示唆 |

### 2.3 簡潔化後のテンプレート

```
短縮版（Banner 本体）:
  AI ({modelName}) が支援 / 外部送信あり / 実行前に確認画面が表示されます [詳細]

展開版（[詳細] タップ後）:
  このセッションでは AI ({modelName}) が操作を支援します。
  外部サービス ({destinations}) へのデータ送信が発生する場合があります。
  送信の前には必ず確認画面が表示されます。
```

### 2.4 制約

- DSC-R1（必ず1回表示）は維持する。短縮版でも開示義務は果たされる
- DSC-R4（Approval Sheet 内 disclosure は dismiss 不可）は変更しない
- FR-2b（AI モデル名を含める）は短縮版でも維持する

## 3. Advanced Console 露出簡素化

### 3.1 現状の露出ポイント

Phase 2 設計では「高度な表示」toggle が以下の state で有効と定義されている:

- ready, handoff, running, done, aborted の5つの state

### 3.2 簡素化方針

| 観点             | 現状                                  | 簡素化後                                     | 根拠                             |
| ---------------- | ------------------------------------- | -------------------------------------------- | -------------------------------- |
| toggle の配置    | Session Dock フッターまたはメニュー内 | Session Dock メニュー内に統一                | フッター配置は視覚的ノイズになる |
| 有効 state の数  | 5 state (ready〜aborted)              | 維持（削減するとアクセシビリティが低下する） | ユーザーが必要な時に開ける必要   |
| パネル初期状態   | isOpen: false                         | 維持                                         | GATE-1 準拠                      |
| running state    | opt-in toggle 有効                    | opt-in toggle 有効 + read-only 明示バッジ    | 誤操作防止                       |
| Panel 内の区画数 | 3区画（Raw Log / Copy Cmd / Op Log）  | 2区画（Raw Log / Copy Cmd）に統合            | Op Log は Raw Log に含まれる     |

### 3.3 Operation Log と Raw Log の統合

Phase 2 の Advanced Console Panel 設計（4.1）では3区画が定義されていたが、Operation Log と Raw Terminal Output は内容が重複する。

- Raw Terminal Output: `$ claude --resume` / `> Analyzing files...` 等
- Operation Log: `14:32:01 API call to Claude` / `14:32:05 File write: /tmp/out` 等

統合方針: Raw Terminal Output にタイムスタンプを付与し、Operation Log を Raw Log に吸収する。

```
統合後の Advanced Console Panel:
┌─────────────────────────────────────────┐
│ 高度な表示                    [閉じる]  │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ Terminal Log (with timestamps)  │    │
│  │ 14:32:01 $ claude --resume     │    │
│  │ 14:32:03 > Analyzing files...  │    │
│  │ 14:32:05 > Writing output...   │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ Copy Command       [コピー]    │    │
│  │ claude --resume --session abc   │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

### 3.4 CTA 配置の確認

Phase 8 時点で CTA 配置規則に変更はない:

| 規則   | 内容                                             | Phase 8 での変更 |
| ------ | ------------------------------------------------ | ---------------- |
| CTA-R1 | Primary CTA は常に1個                            | 変更なし         |
| CTA-R2 | 「高度な表示」は Primary と並列しない            | 変更なし         |
| CTA-R3 | 「端末で続ける」は handoff でのみ Primary に昇格 | 変更なし         |
| CTA-R4 | 「高度な表示」ラベルは固定                       | 変更なし         |
| CTA-R5 | Advanced console 内 CTA は Panel 内に閉じる      | 変更なし         |

## 4. リファクタリング後の設計変更サマリー

| 変更箇所                          | 変更前                               | 変更後                              | 影響範囲                |
| --------------------------------- | ------------------------------------ | ----------------------------------- | ----------------------- |
| Approval Sheet 内の AI 名再掲     | AI モデル名を含む説明文              | 操作内容のみに集中                  | ApprovalSheet.tsx       |
| Approval Sheet 停止方法セクション | 複数行の停止方法説明                 | 1行「中止はいつでも可能です」       | ApprovalSheet.tsx       |
| SessionDisclosureBanner           | 3行の開示テンプレート                | 短縮版 + [詳細] 展開                | SessionDisclosureBanner |
| Advanced Console Panel            | 3区画（Raw Log / Copy Cmd / Op Log） | 2区画（Timestamped Log / Copy Cmd） | AdvancedConsolePanel    |
| toggle 配置                       | フッターまたはメニュー               | メニュー内に統一                    | ExecutionConsoleView    |

## 5. 変更しない項目

以下の設計要素は Phase 8 で変更しない:

| 項目                               | 理由                                   |
| ---------------------------------- | -------------------------------------- |
| Approval Trigger (APR-T1〜T4)      | 安全性に直結。削減は安全性低下のリスク |
| ApprovalGate interface             | Main Process enforcement の根幹        |
| DENY-1〜DENY-10                    | Compliance baseline は変更不可         |
| MUST-1〜MUST-10                    | Compliance baseline は変更不可         |
| DSC-R1〜DSC-R5                     | 開示規則は法的・倫理的要件             |
| NAS-1〜NAS-4                       | Manual boundary は安全性の基盤         |
| CAG-1〜CAG-3                       | Consumer auth guard は scope 外        |
| Layer 構造 (Primary/Safety/Detail) | アーキテクチャの骨格                   |
