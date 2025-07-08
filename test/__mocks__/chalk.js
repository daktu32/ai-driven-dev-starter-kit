// Chalkのmock実装
const createColorFunction = (color) => {
  const colorFn = (text) => `[${color}]${text}[/${color}]`;
  // チェーンメソッドも追加
  colorFn.bold = (text) => `[${color}][BOLD]${text}[/BOLD][/${color}]`;
  return colorFn;
};

const chalk = {
  red: createColorFunction('RED'),
  green: createColorFunction('GREEN'),
  yellow: createColorFunction('YELLOW'),
  blue: createColorFunction('BLUE'),
  cyan: createColorFunction('CYAN'),
  magenta: createColorFunction('MAGENTA'),
  gray: createColorFunction('GRAY'),
  grey: createColorFunction('GRAY'), // 'grey' エイリアス
  bold: (text) => `[BOLD]${text}[/BOLD]`,
  dim: (text) => `[DIM]${text}[/DIM]`,
  
  // デフォルト関数として使われた場合
  default: (text) => text
};

// デフォルトエクスポートとして機能を提供
const chalkDefault = (text) => text;

// 全てのプロパティをデフォルト関数にコピー
Object.assign(chalkDefault, chalk);

module.exports = chalkDefault;
module.exports.default = chalkDefault;