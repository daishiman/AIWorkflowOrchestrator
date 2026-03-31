import fs from "fs";

/**
 * スクリーンショットを base64 エンコード
 * @param {string} imagePath
 * @returns {string}
 */
export function encodeScreenshot(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  return imageBuffer.toString("base64");
}
