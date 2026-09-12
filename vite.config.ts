import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import netlify from "@netlify/vite-plugin";
import { config } from "dotenv";

// Vite와 @netlify/vite-plugin은 .env를 자동으로 process.env에 로드하지 않는다.
// (VITE_ 접두사가 붙은 값만 import.meta.env로 노출됨.) Netlify Functions
// 로컬 에뮬레이션이 읽는 ANTHROPIC_API_KEY 같은 서버 전용 키를 위해 여기서
// 직접 .env를 process.env에 채워 넣는다.
config();

export default defineConfig({
  plugins: [react(), tailwindcss(), netlify()],
});
