#!/usr/bin/env node

/**
 * スライド構成案検証スクリプト
 *
 * 構成案JSONの必須フィールドとスライドタイプを検証します。
 *
 * 使用例:
 *   node validate-structure.mjs structure.json
 *   echo '{"title":"Test","slides":[]}' | node validate-structure.mjs
 *
 * 終了コード:
 *   0: 成功（検証パス）
 *   1: 一般的エラー
 *   2: 引数エラー
 *   3: ファイル不在
 *   4: 検証失敗
 */

import { readFileSync, existsSync } from "fs";

const EXIT_SUCCESS = 0;
const EXIT_ERROR = 1;
const EXIT_ARGS_ERROR = 2;
const EXIT_FILE_NOT_FOUND = 3;
const EXIT_VALIDATION_FAILED = 4;

// 有効なスライドタイプ（23種対応）
const VALID_SLIDE_TYPES = {
  // === 基本タイプ（15種）===
  // 英語 → 日本語マッピング
  "title": "タイトル",
  "agenda": "アジェンダ",
  "section": "セクション",
  "message": "メッセージ",
  "list": "リスト",
  "compare": "比較",
  "flow": "フロー",
  "timeline": "タイムライン",
  "table": "テーブル",
  "stats": "統計",
  "chart": "チャート",
  "diagram": "図解",
  "quote": "引用",
  "image": "画像",
  "full-image": "フルイメージ",
  // === 拡張タイプ（8種）===
  "pyramid": "ピラミッド",
  "circle": "サークル",
  "grid": "グリッド",
  "highlight": "ハイライト",
  "icon-grid": "アイコングリッド",
  "process": "プロセス",
  "quote-extended": "引用拡張",
  "hero": "ヒーロー"
};

// 日本語タイプ名も有効
const VALID_JAPANESE_TYPES = Object.values(VALID_SLIDE_TYPES);
const VALID_ENGLISH_TYPES = Object.keys(VALID_SLIDE_TYPES);

// FontAwesomeアイコンパターン
const ICON_PATTERN = /^fa-[a-z0-9-]+$/;

function showHelp() {
  console.log(`
スライド構成案検証スクリプト

Usage:
  node validate-structure.mjs <structure.json>
  echo '<json>' | node validate-structure.mjs

Arguments:
  <structure.json>  構成案JSONファイルのパス（省略時は標準入力から読み込み）

Options:
  -h, --help        このヘルプを表示

構成案JSONの形式:
  {
    "title": "プレゼンタイトル",
    "slides": [
      {
        "type": "title",
        "message": "タイトルテキスト",
        "icon": "fa-robot"
      },
      ...
    ]
  }

検証項目:
  - title: 必須（文字列）
  - slides: 必須（配列、1つ以上）
  - 各スライド:
    - type: 必須（23種のいずれか - 英語/日本語両対応）
    - message: 必須（文字列）
    - icon: 必須（fa-で始まる文字列）

有効なスライドタイプ（23種）:
  基本15種: title, agenda, section, message, list, compare, flow,
            timeline, table, stats, chart, diagram, quote, image, full-image
  拡張8種:  pyramid, circle, grid, highlight, icon-grid, process,
            quote-extended, hero

終了コード:
  0: 検証成功
  4: 検証失敗（詳細はstderrに出力）
  `);
}

function validateStructure(data) {
  const errors = [];

  // トップレベル検証
  if (!data || typeof data !== "object") {
    errors.push("JSONオブジェクトが必要です");
    return errors;
  }

  // title検証
  if (!data.title) {
    errors.push("title: 必須フィールドが欠落しています");
  } else if (typeof data.title !== "string") {
    errors.push("title: 文字列である必要があります");
  } else if (data.title.trim() === "") {
    errors.push("title: 空文字列は許可されていません");
  }

  // slides検証
  if (!data.slides) {
    errors.push("slides: 必須フィールドが欠落しています");
  } else if (!Array.isArray(data.slides)) {
    errors.push("slides: 配列である必要があります");
  } else if (data.slides.length === 0) {
    errors.push("slides: 1つ以上のスライドが必要です");
  } else {
    // 各スライドの検証
    data.slides.forEach((slide, index) => {
      const slideNum = index + 1;

      if (!slide || typeof slide !== "object") {
        errors.push(`スライド${slideNum}: オブジェクトである必要があります`);
        return;
      }

      // type検証（23種対応）
      if (!slide.type) {
        errors.push(`スライド${slideNum}: type が欠落しています`);
      } else {
        const normalizedType = slide.type.toLowerCase();
        const isValidEnglish = VALID_ENGLISH_TYPES.includes(normalizedType);
        const isValidJapanese = VALID_JAPANESE_TYPES.includes(slide.type);
        if (!isValidEnglish && !isValidJapanese) {
          errors.push(
            `スライド${slideNum}: type "${slide.type}" は無効です。\n` +
            `  有効な英語タイプ: ${VALID_ENGLISH_TYPES.join(", ")}\n` +
            `  有効な日本語タイプ: ${VALID_JAPANESE_TYPES.join(", ")}`
          );
        }
      }

      // message検証
      if (!slide.message) {
        errors.push(`スライド${slideNum}: message が欠落しています`);
      } else if (typeof slide.message !== "string") {
        errors.push(`スライド${slideNum}: message は文字列である必要があります`);
      }

      // icon検証
      if (!slide.icon) {
        errors.push(`スライド${slideNum}: icon が欠落しています`);
      } else if (typeof slide.icon !== "string") {
        errors.push(`スライド${slideNum}: icon は文字列である必要があります`);
      } else if (!ICON_PATTERN.test(slide.icon)) {
        errors.push(
          `スライド${slideNum}: icon "${slide.icon}" は無効な形式です。` +
          `"fa-xxx" 形式で指定してください`
        );
      }
    });
  }

  return errors;
}

async function readInput(filePath) {
  if (filePath) {
    // ファイルから読み込み
    if (!existsSync(filePath)) {
      console.error(`Error: ファイルが見つかりません: ${filePath}`);
      process.exit(EXIT_FILE_NOT_FOUND);
    }
    return readFileSync(filePath, "utf-8");
  }

  // 標準入力から読み込み
  return new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf-8");

    // 非対話モードかチェック
    if (process.stdin.isTTY) {
      reject(new Error("ファイルパスを指定するか、標準入力からJSONを渡してください"));
      return;
    }

    process.stdin.on("data", (chunk) => {
      data += chunk;
    });

    process.stdin.on("end", () => {
      resolve(data);
    });

    process.stdin.on("error", reject);
  });
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("-h") || args.includes("--help")) {
    showHelp();
    process.exit(EXIT_SUCCESS);
  }

  const filePath = args.find((arg) => !arg.startsWith("-"));

  let input;
  try {
    input = await readInput(filePath);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(EXIT_ARGS_ERROR);
  }

  if (!input || input.trim() === "") {
    console.error("Error: 入力が空です");
    process.exit(EXIT_ARGS_ERROR);
  }

  let data;
  try {
    data = JSON.parse(input);
  } catch (err) {
    console.error(`Error: JSONパースに失敗しました: ${err.message}`);
    process.exit(EXIT_ERROR);
  }

  const errors = validateStructure(data);

  if (errors.length > 0) {
    console.error("検証エラー:");
    errors.forEach((error) => {
      console.error(`  - ${error}`);
    });
    process.exit(EXIT_VALIDATION_FAILED);
  }

  console.log(`✓ 検証成功: ${data.slides.length}枚のスライド`);
  console.log(`  タイトル: ${data.title}`);
  console.log(`  スライドタイプ: ${data.slides.map(s => s.type).join(", ")}`);

  process.exit(EXIT_SUCCESS);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(EXIT_ERROR);
});
