# 実装ガイド: TASK-3-2-C タイムスタンプ自動更新

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| タスク | TASK-3-2-C-timestamp-autoupdate |
| Phase  | 12                              |
| 作成日 | 2026-01-28                      |

---

# Part 1: 概念説明（中学生レベル）

## 1. タイムスタンプ自動更新とは何か

### 日常生活での例え

**SNSの「いいね」通知を思い浮かべてください。**

LINEやInstagramで「3分前」「1時間前」と表示されているのを見たことがありますよね。これが「相対時刻」です。

でも、その画面をずっと開いたままにしていると、「3分前」がいつまでも「3分前」のままだったら変ですよね。本当は10分経っているのに。

この機能は、その時間表示を自動的に更新して、常に正しい「〇分前」を表示し続けるものです。

### 身近な例で説明

**教室の時計に例えると：**

| 普通の時計（今までの機能） | 電波時計（この機能） |
| -------------------------- | -------------------- |
| 一度セットしたら動かない   | 常に正確な時間を表示 |
| 古い時間のまま             | 自動で時間が進む     |

例えば、友達から「5秒前」にメッセージが来たとします。

- **今までの機能**: 10分経っても「5秒前」のまま
- **この機能**: 10分経ったら「10分前」に変わる

### この機能でできること

| 機能         | 説明                   | 例                               |
| ------------ | ---------------------- | -------------------------------- |
| 自動更新     | 時間表示が自動で変わる | 「5秒前」→「6秒前」→「7秒前」... |
| かしこい更新 | 表示に合わせた更新間隔 | 「秒」は1秒ごと、「分」は1分ごと |
| 省エネ       | 見ていない時は止まる   | タブを閉じると更新停止           |

### なぜこれが必要か

**問題**: スキルを長時間実行していると、メッセージの時間がどんどん古くなる
**解決**: 常に「今から何分前」が正確にわかるようになる

これにより：

- いつメッセージが来たかが正確にわかる
- デバッグ（問題調査）がしやすくなる
- 見やすい画面になる

---

# Part 2: 技術的詳細（開発者向け）

## 1. 概要

### 1.1 目的

MessageTimestampコンポーネントの相対時刻表示を定期的に自動更新し、
常に正確な経過時間を表示する。

### 1.2 実装範囲

- タイムスタンプの自動更新機能
- 更新間隔の動的最適化
- タブ非表示時の更新停止
- パフォーマンス最適化

---

## 2. アーキテクチャ

### 2.1 コンポーネント構成

| コンポーネント    | 親                 | 責務                 |
| ----------------- | ------------------ | -------------------- |
| TimestampProvider | SkillStreamDisplay | 現在時刻を管理・配信 |
| MessageList       | TimestampProvider  | メッセージ一覧表示   |
| MessageItem       | MessageList        | 個別メッセージ表示   |
| MessageTimestamp  | MessageItem        | Contextから時刻取得  |

### 2.2 データフロー

| ステップ | 処理                                    |
| -------- | --------------------------------------- |
| 1        | setInterval tick発火                    |
| 2        | setCurrentTime(Date.now())でContext更新 |
| 3        | TimestampContext value変更              |
| 4        | 全MessageTimestamp再レンダー            |
| 5        | formatRelativeTime再計算                |

---

## 3. 実装詳細

### 3.1 useInterval フック

| 項目     | 値                                               |
| -------- | ------------------------------------------------ | ----- |
| ファイル | `apps/desktop/src/renderer/hooks/useInterval.ts` |
| 責務     | 動的な間隔でコールバックを実行                   |
| 引数     | `callback: () => void`, `delay: number           | null` |
| 戻り値   | `void`                                           |

**特徴**:

- `delay`が`null`の場合はタイマー停止
- `useRef`でコールバック参照を維持し、不要な再設定を防止
- `useEffect`のクリーンアップでタイマーを確実に解放

### 3.2 usePageVisibility フック

| 項目     | 値                                                     |
| -------- | ------------------------------------------------------ |
| ファイル | `apps/desktop/src/renderer/hooks/usePageVisibility.ts` |
| 責務     | ページの可視状態を監視                                 |
| 引数     | なし                                                   |
| 戻り値   | `boolean` (true=表示中, false=非表示)                  |

**特徴**:

- `document.visibilitychange`イベントを監視
- SSR対応: `typeof document === "undefined"`チェック
- クリーンアップでイベントリスナーを確実に解除

### 3.3 TimestampContext

| 項目     | 値                                                        |
| -------- | --------------------------------------------------------- |
| ファイル | `apps/desktop/src/renderer/contexts/TimestampContext.tsx` |
| 責務     | 現在時刻を子コンポーネントに配信                          |
| Props    | `children: ReactNode`, `updateInterval?: number`          |

**エクスポート**:

| エクスポート        | 型        | 説明             |
| ------------------- | --------- | ---------------- |
| TimestampProvider   | Component | Context Provider |
| useTimestampContext | Hook      | 現在時刻を取得   |

### 3.4 更新間隔計算

| 関数                       | 説明                                       |
| -------------------------- | ------------------------------------------ |
| calculateUpdateInterval    | 単一タイムスタンプから最適な更新間隔を計算 |
| calculateMinUpdateInterval | 複数タイムスタンプから最小更新間隔を計算   |

**定数定義**:

| 定数名                  | 値      | 用途            |
| ----------------------- | ------- | --------------- |
| UPDATE_INTERVALS.SECOND | 1000    | 1秒（ミリ秒）   |
| UPDATE_INTERVALS.MINUTE | 60000   | 1分（ミリ秒）   |
| UPDATE_INTERVALS.HOUR   | 3600000 | 1時間（ミリ秒） |

**更新間隔ロジック**:

| 経過時間   | 更新間隔  |
| ---------- | --------- |
| 1時間以上  | 1時間ごと |
| 1分〜1時間 | 1分ごと   |
| 1分未満    | 1秒ごと   |

---

## 4. 使用方法

### 4.1 基本的な使用

1. TimestampProviderでラップする
2. 子コンポーネントでuseTimestampContextを呼び出す
3. formatRelativeTimeで表示用文字列を生成

### 4.2 カスタム更新間隔

| 用途             | updateInterval値 |
| ---------------- | ---------------- |
| デフォルト       | 1000（1秒）      |
| テスト用（高速） | 500（0.5秒）     |
| 省電力モード     | 60000（1分）     |

---

## 5. パフォーマンス最適化

### 5.1 最適化ポイント

| ポイント     | 実装                              |
| ------------ | --------------------------------- |
| 単一タイマー | TimestampProvider で1つのみ       |
| バッチ更新   | Context経由で全コンポーネント更新 |
| メモ化       | React.memoでMessageTimestamp      |
| 非表示時停止 | usePageVisibilityでタイマー制御   |

### 5.2 注意事項

- 大量のメッセージ（1000件以上）では追加の最適化が必要な場合あり
- 仮想化（virtualization）との組み合わせを推奨

---

## 6. テスト

### 6.1 テストファイル

| ファイル                  | パス                               |
| ------------------------- | ---------------------------------- |
| useInterval.test.ts       | `src/renderer/hooks/__tests__/`    |
| usePageVisibility.test.ts | `src/renderer/hooks/__tests__/`    |
| TimestampContext.test.tsx | `src/renderer/contexts/__tests__/` |
| formatTime.test.ts        | `src/renderer/utils/__tests__/`    |

### 6.2 テスト実行

pnpm --filter @repo/desktop test コマンドでテスト実行

---

## 7. 関連ドキュメント

| ドキュメント     | パス                                                                            |
| ---------------- | ------------------------------------------------------------------------------- |
| 要件定義書       | `outputs/phase-1/requirements-definition.md`                                    |
| 設計書           | `outputs/phase-2/architecture-design.md`                                        |
| テスト仕様書     | `outputs/phase-4/test-specification.md`                                         |
| 品質保証レポート | `outputs/phase-9/quality-assurance-report.md`                                   |
| システム仕様書   | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` |

---

## 変更履歴

| 日付       | 変更内容                                           | 担当 |
| ---------- | -------------------------------------------------- | ---- |
| 2026-01-28 | Part 1（中学生レベル概念説明）追加、Part 2構造改善 | AI   |
| 2026-01-28 | 初版作成                                           | AI   |
