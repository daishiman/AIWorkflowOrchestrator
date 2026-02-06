# SkillService.executeSkill 委譲実装 - タスク指示書

## メタ情報

| 項目         | 内容                                        |
| ------------ | ------------------------------------------- |
| タスクID     | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION       |
| タスク名     | SkillService実行ロジックのSkillExecutor委譲 |
| 分類         | 機能実装                                    |
| 対象機能     | スキル実行エンジン                          |
| 優先度       | 中                                          |
| 見積もり規模 | 中規模                                      |
| ステータス   | 未実施                                      |
| 実行順序     | 04（単独 — 02a+03a完了後）                  |
| 発見元       | skill-system-conflict-report #7             |
| 発見日       | 2026-02-05                                  |
| 関連Phase    | Phase 2（設計移行の完了）                   |
| 関連Issue    | Issue #411                                  |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`SkillService.executeSkill()` は設計上のスキル実行エントリーポイントだが、コアロジックが固定文字列を返すスタブ。バリデーション（スキル存在確認・インポート状態確認）は実装済み。

### 1.2 問題点・課題

| 問題                                  | 影響                             |
| ------------------------------------- | -------------------------------- |
| executeSkill() のコアロジックがスタブ | スキル実行が常に固定文字列を返す |
| SkillExecutor との接続がない          | SDK統合コードが利用されない      |

**現在のコード** (`SkillService.ts` L214-216):

```typescript
// 初期実装: 成功結果を返す
// 将来的にはスキルの実際の実行ロジックを実装
const output = `Skill "${skill.name}" executed successfully`;
```

### 1.3 放置した場合の影響

- スキル実行が永続的にスタブ状態
- E2E スモークテストが不可能

---

## 2. 何を達成するか（What）

### 2.1 目的

SkillService.executeSkill() のスタブを解消し、E2E でスキル実行が動作することを検証する。

### 2.2 最終ゴール

1. SkillService が SkillExecutor に実行を委譲
2. バリデーション → 実行 → レスポンスの完全なフローが動作
3. E2E スモークテストが PASS

### 2.3 スコープ

#### 含むもの

- SkillService と SkillExecutor の接続
- E2E スモークテスト作成
- エラーハンドリングの統合

#### 含まないもの

- SkillExecutor 内部のSDKロジック変更
- Preload API の変更
- 新しい実行モードの追加

### 2.4 成果物

| 成果物                     | 説明                                 |
| -------------------------- | ------------------------------------ |
| 修正された SkillService.ts | executeSkill が SkillExecutor を使用 |
| E2E スモークテスト         | スキル実行フロー全体の検証           |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-FIX-15-1-EXECUTE-HANDLER-ROUTING 完了
- TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE 完了
- TASK-FIX-5-1-SKILL-API-UNIFICATION 完了（Preloadスタブ解消）

### 3.2 依存タスク

- TASK-FIX-15-1（ハンドラーがSkillExecutorを呼ぶ経路が確立）
- TASK-FIX-16-1（SDK認証基盤）
- TASK-FIX-5-1（Preload APIがMain Processに接続）

### 3.3 必要な知識

- SkillExecutor.execute() のインターフェース
- SkillService のバリデーションフロー
- Electron IPC ストリーミングパターン

### 3.4 推奨アプローチ

**設計判断**: #15 の修正方針によって本タスクの内容が変わる。

- **案A**: #15 でハンドラーが直接 SkillExecutor を呼ぶ場合 → 本タスクは SkillService.executeSkill() を削除し、E2E テストに集中
- **案B**: SkillService が SkillExecutor への Facade として機能する場合 → 本タスクで委譲ロジックを実装

---

## 4. 実行手順

### Step 1: #15 の修正結果確認

#### 目的

ハンドラー→SkillExecutor の経路を確認し、本タスクの方針を決定

### Step 2: SkillService の役割確定

#### 手順

1. バリデーションのみ SkillService に残す（案A）or 委譲 Facade とする（案B）
2. executeSkill() のスタブを除去
3. 必要に応じて SkillExecutor への参照を追加

### Step 3: E2E スモークテスト

#### 手順

1. Renderer → Preload → IPC → Handler → SkillExecutor → SDK の全経路テスト
2. ストリーミングメッセージの受信確認
3. エラーケース（認証失敗、タイムアウト）の確認

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] SkillService.executeSkill() のスタブが除去されている
- [ ] スキル実行が SkillExecutor → SDK まで到達する
- [ ] E2E スモークテストが PASS

### 品質要件

- [ ] 全テストが PASS
- [ ] エラーハンドリングが統合されている

---

## 6. 検証方法

### テストケース

1. スキル実行の E2E フロー → SDK 呼び出しまで到達
2. ストリーミングメッセージの Renderer 受信
3. 実行中断（abort）のE2Eフロー
4. 認証エラー時の適切なエラー伝播

---

## 7. リスクと対策

| リスク                     | 影響度 | 発生確率 | 対策                              |
| -------------------------- | ------ | -------- | --------------------------------- |
| SDK 呼び出しの実行時エラー | 高     | 中       | モック SDK でのテスト先行         |
| ストリーミング統合の複雑さ | 中     | 中       | 既存の SkillExecutor コードを活用 |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/skill-import-agent-system/specification.md` §5.1（実行エンジン）
- `apps/desktop/src/main/services/skill/SkillService.ts` L192-235
- `apps/desktop/src/main/services/skill/SkillExecutor.ts`

### 関連タスク

- TASK-FIX-15-1-EXECUTE-HANDLER-ROUTING（前提・統合可能）
- TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE（前提）
- TASK-9B-I-SDK-FORMAL-INTEGRATION（後続）

---

## 9. 備考

### #15 との関係

本タスク（#7）と #15 は密接に関連しており、統合して実施することを推奨。#15 がハンドラーのルーティングを修正し、本タスクがスタブを除去して E2E を検証する。

### Layer 3 の位置づけ

本タスクは依存関係グラフの Layer 3 に位置し、クリティカルパス A・B の両方が合流する地点。パス A（#1→#5→#3）と パス B（#16→#15）の両方が完了しないと着手できない。
