const text = "## 💡 牌阵解析 1. 现状: 星币三 (正位) 2. 选项一: (即刻就业)";

let content = text;
content = content
    .replace(/^(#+.+?)[：:\s]*(?=[\*\s_]*(?:\d+|[一二三四五六七八九十]+)[\.．。、])/gm, '$1\n\n')
    .replace(/([。！？”」】\.\!\?])[：:\s]*(?=[\*\s_]*(?:\d+|[一二三四五六七八九十]+)[\.．。、])/g, '$1\n\n');

console.log("RESULT:");
console.log(content);
