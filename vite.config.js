// SPDX-License-Identifier: Apache-2.0
// Author: Barak Hoffer

import { resolve } from 'path'
import { defineConfig } from 'vite';


export default defineConfig(() => {
  return {
    publicDir: false,
    build: {
        lib: {
          entry: resolve(__dirname, './src/extension.ts'),
          name: 'Xschem Vscode Viewer',
          formats: ['cjs'],
          fileName: 'extension'
      },
      rollupOptions: {
        external: ['vscode', 'child_process']
      },
      sourcemap: false
    }
  };
});
