/*
 * @Date: 2024-02-01 17:39:03
 * @LastEditors: dengxin 994386508@qq.com
 * @LastEditTime: 2024-02-05 10:36:27
 * @FilePath: /yzt-react-component/vite.config.ts
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: path.resolve(__dirname, "./src/components/index.tsx"),
      name: "MyLib",
      fileName: "custom-components",
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ["react", "antd"],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          react: "React",
          antd: "Antd",
        },
        format: "cjs",
      },
    },
  },
});
