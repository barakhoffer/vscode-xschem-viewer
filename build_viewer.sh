#!/bin/bash

if [ ! -d ./xschem_lib ]; then
    git clone https://github.com/StefanSchippers/xschem_sky130 xschem_sky130
    git clone https://github.com/StefanSchippers/xschem xschem

    mkdir xschem_lib
    cp -r xschem/xschem_library/devices xschem_lib
    cp -r xschem_sky130/stdcells xschem_lib
    cp -r xschem_sky130/sky130_tests xschem_lib
    cp -r xschem_sky130/sky130_fd_pr xschem_lib
    cp -r xschem_sky130/sky130_stdcells xschem_lib
    cp -r xschem_sky130/mips_cpu xschem_lib

    rm -rf xschem
    rm -rf xschem_sky130
fi

if [ ! -d ./xschem-viewer ]; then
    git clone https://github.com/TinyTapeout/xschem-viewer xschem-viewer
    cp -f viewer.vite.config.js xschem-viewer/vite.config.js
    npm i -D vite-plugin-string-replace
    cd xschem-viewer
    npm ci
    cd ..
fi

cp -rf xschem_lib ./dist
mkdir -p ./dist/tcl
echo > ./dist/tcl/wacl-library.data
echo > ./dist/tcl/wacl-custom.data

cd xschem-viewer
npm run build
cp -rf dist/assets ../dist