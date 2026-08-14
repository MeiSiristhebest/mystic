const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const API_KEY = "sk-DvyR8CmZjwNWjguDONHbx9sWRCNsoHG2Kuao0toJfLNxVQTf";
const API_URL = "https://apihub.agnes-ai.com/v1/images/generations";

const tasks = [
  {
    name: "collective.jpg",
    aspectRatio: "3:4",
    size: "896x1152",
    prompt: "A breathtaking mystical cosmic eye formed by a glowing golden spiral galaxy as the iris, obsidian crystalline pupil reflecting the universe, intricate golden neural web filaments spreading into the dark void connecting floating consciousness orbs, sacred visionary art, hyper-detailed, raytraced cinematic illumination"
  },
  {
    name: "face.jpg",
    aspectRatio: "3:4",
    size: "896x1152",
    prompt: "A regal and serene side profile of an ancient oriental sage sculpted from polished black obsidian and porcelain, delicate glowing gold-leaf meridian lines traced along the forehead, temple, and cheekbones, a soft ethereal aura of violet and gold mist surrounding the silhouette, minimalist luxury oriental portrait, hyper-detailed, studio lighting"
  },
  {
    name: "soul_banner.jpg",
    aspectRatio: "16:9",
    size: "1536x1024",
    prompt: "A breathtaking 16:9 cinematic widescreen panorama of a glowing golden soul heart pulsating with celestial energy, surrounded by 12 concentric sacred geometry astrological rings, expanding into deep indigo and violet nebula clouds with floating golden stardust particles, epic cosmic scale, raytraced dark luxury wallpaper, masterpiece"
  }
];

function callAgnesApiWithCurl(task) {
  const payload = JSON.stringify({
    model: "agnes-image-2.1-flash",
    prompt: `Masterpiece digital art, cinematic lighting, 8k resolution, dark luxury cosmic aesthetic. Deep obsidian black background with rich gold and mystical violet accents. Subject: ${task.prompt}. Photorealistic details, sharp focus, no text, no watermark.`,
    size: task.size,
    extra_body: {
      response_format: "url"
    }
  });

  const tmpPayload = path.join(__dirname, `tmp_${task.name}.json`);
  fs.writeFileSync(tmpPayload, payload, 'utf-8');

  try {
    const cmd = `curl.exe -s -X POST "${API_URL}" -H "Content-Type: application/json" -H "Authorization: Bearer ${API_KEY}" --data-binary @"${tmpPayload}"`;
    const output = execSync(cmd, { encoding: 'utf-8', timeout: 60000 });
    const json = JSON.parse(output);
    if (!json.data?.[0]?.url) {
      throw new Error("API response error: " + output);
    }
    return json.data[0].url;
  } finally {
    if (fs.existsSync(tmpPayload)) fs.unlinkSync(tmpPayload);
  }
}

function downloadFileWithCurl(url, dest) {
  const cmd = `curl.exe -s -L -o "${dest}" "${url}"`;
  execSync(cmd, { timeout: 60000 });
  const stats = fs.statSync(dest);
  if (stats.size < 50000) {
    throw new Error(`Downloaded file too small: ${stats.size} bytes`);
  }
  return stats.size;
}

async function generateSingleWithRetry(task, maxRetries = 4) {
  const outPath = path.join(__dirname, '..', 'public', 'systems', task.name);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[ATTEMPT ${attempt}/${maxRetries}] Generating ${task.name} with precise prompt...`);
      const imageUrl = callAgnesApiWithCurl(task);
      console.log(`[DOWNLOADING] ${task.name}...`);
      const bytes = downloadFileWithCurl(imageUrl, outPath);
      const kb = (bytes / 1024).toFixed(1);
      console.log(`✨ [SUCCESS] ${task.name} regenerated (${kb} KB)`);
      return { success: true, kb };
    } catch (e) {
      console.warn(`⚠️ [RETRY] ${task.name} (attempt ${attempt}): ${e.message}`);
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 3000));
      } else {
        throw e;
      }
    }
  }
}

async function main() {
  console.log("=== 🎨 FINAL 3 PRECISION ARTWORKS (COLLECTIVE, FACE, BANNER) 🎨 ===");
  const summary = [];
  for (const task of tasks) {
    try {
      const res = await generateSingleWithRetry(task);
      summary.push({ File: task.name, Status: "✨ High Quality", Size: `${res.kb} KB` });
    } catch (err) {
      summary.push({ File: task.name, Status: "❌ Failed", Error: err.message });
    }
  }

  console.log("\n=== 🎯 REGENERATION SUMMARY 🎯 ===");
  console.table(summary);
}

main();
