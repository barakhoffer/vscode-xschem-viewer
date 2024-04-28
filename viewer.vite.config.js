// SPDX-License-Identifier: Apache-2.0
// Copyright 2024 Tiny Tapeout LTD
// Author: Uri Shaked

import child from 'child_process';
import { fileURLToPath, URL } from 'url';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import StringReplace from 'vite-plugin-string-replace'

const commitHash = child.execSync('git rev-parse --short HEAD').toString();

export default defineConfig(() => {
  return {
    plugins: [solidPlugin(), StringReplace([
      {
          search: 'https://raw.githubusercontent.com/StefanSchippers/xschem_sky130/main/',
          replace: 'xschem_lib/',
      },
      {
        search: 'https://raw.githubusercontent.com/StefanSchippers/xschem/master/xschem_library/',
        replace: 'xschem_lib/',
      }])],

    define: {
      __COMMIT_HASH__: JSON.stringify(commitHash.trim()),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },

    resolve: {
      alias: [{ find: '~', replacement: fileURLToPath(new URL('./src', import.meta.url)) }],
    },
    base: "./",
    build: {
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name].js`,
          chunkFileNames: `assets/[name].js`,
          assetFileNames: `assets/[name].[ext]`,
        },
      },
    },
  };
});
