module.exports={name:"yarn-plugin-nixify",factory:function(e){var t;return(()=>{"use strict";var n={d:(e,t)=>{for(var r in t)n.o(t,r)&&!n.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t),r:e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}},r={};n.r(r),n.d(r,{default:()=>E});const a=e("@yarnpkg/core"),o=e("clipanion");class i extends o.Command{constructor(...e){super(...e),this.locator=o.Option.String({required:!1})}async execute(){const e=await a.Configuration.find(this.context.cwd,this.context.plugins),{project:t}=await a.Project.find(e,this.context.cwd),n=await a.Cache.find(e),r=e.makeFetcher();return(await a.StreamReport.start({configuration:e,stdout:this.context.stdout},(async e=>{if(this.locator){const{locatorHash:o}=a.structUtils.parseLocator(this.locator,!0),i=t.originalPackages.get(o);if(!i)return void e.reportError(0,`Invalid locator: ${this.locator}`);await r.fetch(i,{checksums:t.storedChecksums,project:t,cache:n,fetcher:r,report:e})}else await e.startTimerPromise("Resolution step",(async()=>{await t.resolveEverything({report:e,lockfileOnly:!0})})),await e.startTimerPromise("Fetch step",(async()=>{await t.fetchEverything({cache:n,report:e,fetcher:r})}))}))).exitCode()}}i.paths=[["nixify","fetch"]];const s=e("@yarnpkg/fslib"),c=e("crypto");class l extends o.Command{constructor(...e){super(...e),this.locator=o.Option.String(),this.source=o.Option.String(),this.installLocation=o.Option.String()}async execute(){const e=await a.Configuration.find(this.context.cwd,this.context.plugins),{project:t}=await a.Project.find(e,this.context.cwd);return await t.restoreInstallState({restoreResolutions:!1}),(await a.StreamReport.start({configuration:e,stdout:this.context.stdout},(async n=>{await t.resolveEverything({report:n,lockfileOnly:!0});const r=a.structUtils.parseLocator(this.locator,!0),o=t.storedPackages.get(r.locatorHash);if(!o)return void n.reportError(0,`Invalid locator: ${this.locator}`);const i=s.ppath.join(t.cwd,this.installLocation);await s.xfs.mkdirpPromise(s.ppath.dirname(i)),await a.execUtils.execvp("cp",["-R",this.source,i],{cwd:t.cwd,strict:!0}),await a.execUtils.execvp("chmod",["-R","u+w",i],{cwd:t.cwd,strict:!0});const l=(0,c.createHash)("sha512");l.update(process.versions.node),e.triggerHook((e=>e.globalHashGeneration),t,(e=>{l.update("\0"),l.update(e)}));const d=l.digest("hex"),p=new Map,h=e=>{let n=p.get(e.locatorHash);if(void 0!==n)return n;const r=t.storedPackages.get(e.locatorHash);if(void 0===r)throw new Error("Assertion failed: The package should have been registered");const o=(0,c.createHash)("sha512");o.update(e.locatorHash),p.set(e.locatorHash,"<recursive>");for(const e of r.dependencies.values()){const n=t.storedResolutions.get(e.descriptorHash);if(void 0===n)throw new Error(`Assertion failed: The resolution (${a.structUtils.prettyDescriptor(t.configuration,e)}) should have been registered`);const r=t.storedPackages.get(n);if(void 0===r)throw new Error("Assertion failed: The package should have been registered");o.update(h(r))}return n=o.digest("hex"),p.set(e.locatorHash,n),n},u=(0,c.createHash)("sha512").update(d).update(h(o)).update(i).digest("hex");t.storedBuildState.set(o.locatorHash,u),await t.persistInstallStateFile()}))).exitCode()}}l.paths=[["nixify","inject-build"]];const d=e("@yarnpkg/plugin-pnp"),p=JSON.stringify,h=(e,t,n=!1)=>t.split("\n").map((t=>t||n?e+t:t)).join("\n"),u=(e,t)=>{let n=e;for(const[e,r]of Object.entries(t))if("string"==typeof r&&(n=n.replace(new RegExp(`@@${e}@@`,"g"),r)),"boolean"==typeof r)for(;;){const t=n.split("\n"),a=t.indexOf(`#@@ IF ${e}`),o=t.indexOf(`#@@ ENDIF ${e}`);if(-1===a||o<a)break;r?(t.splice(o,1),t.splice(a,1)):t.splice(a,o-a+1),n=t.join("\n")}return n},f=e("url");class g extends o.Command{constructor(...e){super(...e),this.binDir=o.Option.String()}async execute(){const e=await a.Configuration.find(this.context.cwd,this.context.plugins),{project:t,workspace:n}=await a.Project.find(e,this.context.cwd);return(await a.StreamReport.start({configuration:e,stdout:this.context.stdout},(async r=>{if(!n)return;const o=s.npath.toPortablePath(this.binDir);for(const[r,a]of n.manifest.bin){const n=s.ppath.join(o,r),i=s.ppath.join(t.cwd,s.npath.toPortablePath(a));await this.writeWrapper(n,i,{configuration:e,project:t})}if(e.get("installNixBinariesForDependencies")){await t.resolveEverything({report:r,lockfileOnly:!0});const n=await a.scriptUtils.getPackageAccessibleBinaries(t.topLevelWorkspace.anchoredLocator,{project:t});for(const[r,[a,i]]of n.entries()){const n=s.ppath.join(o,r);await this.writeWrapper(n,s.npath.toPortablePath(i),{configuration:e,project:t})}}}))).exitCode()}async writeWrapper(e,t,{configuration:n,project:r}){let a;switch(n.get("nodeLinker")){case"pnp":{const e=(0,d.getPnpPath)(r),n=[];await s.xfs.existsPromise(e.cjs)&&n.push(`--require "${s.npath.fromPortablePath(e.cjs)}"`),await s.xfs.existsPromise(e.esmLoader)&&n.push(`--experimental-loader "${(0,f.pathToFileURL)(s.npath.fromPortablePath(e.esmLoader)).href}"`),a=u("#!/bin/sh\nexport NODE_OPTIONS='@@NODE_OPTIONS@@'\nexec '@@NODE_PATH@@' '@@BINARY_PATH@@' \"$@\"\n",{NODE_PATH:process.execPath,NODE_OPTIONS:n.join(" "),BINARY_PATH:t});break}case"node-modules":a=u("#!/bin/sh\nexec '@@NODE_PATH@@' '@@BINARY_PATH@@' \"$@\"\n",{NODE_PATH:process.execPath,BINARY_PATH:t});break;default:throw Error("Assertion failed: Invalid nodeLinker")}await s.xfs.writeFilePromise(e,a),await s.xfs.chmodPromise(e,493)}}g.paths=[["nixify","install-bin"]];const m=e("os"),y=e("@yarnpkg/plugin-patch"),b=(e,t)=>(0,c.createHash)(e).update(t).digest(),x=(e,t,{storePath:n="/nix/store",recursive:r=!1}={})=>{const[a,o]=t.split("-"),i=Buffer.from(o,"base64").toString("hex"),c=b("sha256",`fixed:out:${r?"r:":""}${a}:${i}:`).toString("hex"),l=(e=>{let t="",n=[...e].reverse().map((e=>e.toString(2).padStart(8,"0"))).join("");for(;n;)t+="0123456789abcdfghijklmnpqrsvwxyz"[parseInt(n.slice(0,5),2)],n=n.slice(5);return t})(((e,t)=>{const n=Buffer.alloc(20);for(let t=0;t<e.length;t++)n[t%20]^=e[t];return n})(b("sha256",`output:out:sha256:${c}:${n}:${e}`)));return s.ppath.join(n,`${l}-${e}`)},v=e=>e.replace(/^\.+/,"").replace(/[^a-zA-Z0-9+._?=-]+/g,"-").slice(0,207)||"unknown",w=(e,t="sha512")=>t+"-"+Buffer.from(e,"hex").toString("base64"),k=e=>Buffer.from(e.split("-")[1],"base64").toString("hex"),I=2**32-1,P=(e,...t)=>{let n=0;const r=t.map((e=>{const t=Buffer.from(e);if(t.byteLength>I)throw Error(`NAR string too long: ${t.byteLength}`);return n+=8+8*Math.ceil(t.byteLength/8),t})),a=Buffer.alloc(n);let o=0;for(const e of r)a.writeUInt32LE(e.byteLength,o),e.copy(a,o+8),o+=8+8*Math.ceil(e.byteLength/8);e.write(a)},$=async(e,t,n)=>{if(t>I)throw Error(`NAR string too long: ${t}`);const r=Buffer.alloc(8);r.writeUInt32LE(t),e.write(r);for await(const t of n)e.write(t);const a=8-t%8;8!==a&&e.write(Buffer.alloc(a))},N=a.YarnVersion?.startsWith("3.")||!1,E={commands:[i,l,g],hooks:{afterAllInstalled:async(e,t)=>{!1!==t.persistProject&&e.configuration.get("enableNixify")&&await(async(e,t)=>{const{configuration:n,cwd:r}=e,{cache:o,report:i}=t,l=await s.xfs.realpathPromise(s.npath.toPortablePath((0,m.tmpdir)()));if(e.cwd.startsWith(l))return void i.reportInfo(0,`Skipping Nixify, because ${e.cwd} appears to be a temporary directory`);const d=n.get("nixExprPath"),f=n.get("yarnPath");let g;if(null===f){let e=(await s.xfs.readFilePromise(process.argv[1])).toString();if(e.startsWith("#!/nix/store/")){const t=e.substring(e.indexOf("\n")+1);e=`#!/usr/bin/env node\n${t}`}const t=a.hashUtils.makeHash(Buffer.from(e));g=["fetchurl {",`  url = "https://repo.yarnpkg.com/${a.YarnVersion}/packages/yarnpkg-cli/bin/yarn.js";`,`  hash = "${w(t)}";`,"}"].join("\n  ")}else f.startsWith(r)?g="./"+s.ppath.relative(s.ppath.dirname(d),f):(g=p(f),i.reportWarning(0,`The Yarn path ${f} is outside the project - it may not be reachable by the Nix build`));const b=n.get("cacheFolder");let I;if(b.startsWith(r))I=p(s.ppath.relative(r,b));else{if(N||!n.get("enableGlobalCache"))throw Error(`The cache folder ${b} is outside the project, this is currently not supported`);I='".yarn/cache"'}const E=new Set;for(const e of n.sources.values())for(const t of e.split(", "))t.startsWith("<")||E.add(t);for(const e of E)s.ppath.resolve(r,e).startsWith(r)||i.reportWarning(0,`The config file ${e} is outside the project - it may not be reachable by the Nix build`);const D="./"+s.ppath.relative(s.ppath.dirname(d),s.ppath.resolve(r,"yarn.lock")),_=new Map,S=new Set(await s.xfs.readdirPromise(o.cwd)),L={unstablePackages:e.conditionalLocators};for(const t of e.storedPackages.values()){const{locatorHash:n}=t,r=e.storedChecksums.get(n),a=N?o.getLocatorPath(t,r||null,L):o.getLocatorPath(t,r||null);if(!a)continue;if(!S.has(s.ppath.basename(a)))continue;const i=r?o.getChecksumFilename(t,r):o.getVersionFilename(t);_.set(i,{pkg:t,checksum:r,cachePath:a})}const O=new Map,A=n.get("individualNixPackaging");let j="",T="";if(A){for(const[e,{pkg:t,checksum:n,cachePath:r}]of _.entries()){const o=a.structUtils.stringifyLocator(t),i=n?n.split("/").pop():await a.hashUtils.checksumFile(r);O.set(o,{cachePath:r,filename:e,hash:w(i)})}j="cacheEntries = {\n";for(const e of[...O.keys()].sort()){const t=O.get(e);j+=`${p(e)} = { ${[`filename = ${p(t.filename)};`,`hash = "${t.hash}";`].join(" ")} };\n`}j+="};"}else{const e=(0,c.createHash)("sha512");P(e,"nix-archive-1","(","type","directory");for(const t of[..._.keys()].sort()){const{cachePath:n}=_.get(t),{size:r}=await s.xfs.statPromise(n);P(e,"entry","(","name",t,"node","(","type","regular","contents"),await $(e,r,s.xfs.createReadStream(n)),P(e,")",")")}P(e,")"),e.end();for await(const t of e)T=w(t)}const C=n.get("isolatedNixBuilds");let R=new Set,F=[],B=[];const H=n.get("nodeLinker"),U=n.get("pnpUnpluggedFolder"),M=(t,n=new Set)=>{const r=a.structUtils.stringifyLocator(t);if(O.has(r)&&n.add(r),a.structUtils.isVirtualLocator(t)){const r=e.storedPackages.get(a.structUtils.devirtualizeLocator(t).locatorHash);if(!r)throw Error("Assertion failed: The locator should have been registered");M(r,n)}if(t.reference.startsWith("patch:")){const r=e.storedPackages.get(y.patchUtils.parseLocator(t).sourceLocator.locatorHash);if(!r)throw Error("Assertion failed: The locator should have been registered");M(r,n)}for(const r of t.dependencies.values()){const t=e.storedResolutions.get(r.descriptorHash);if(!t)throw Error("Assertion failed: The descriptor should have been registered");const a=e.storedPackages.get(t);if(!a)throw Error("Assertion failed: The locator should have been registered");M(a,n)}return n};for(const t of e.storedBuildState.keys()){const n=e.storedPackages.get(t);if(!n)throw Error("Assertion failed: The locator should have been registered");if(!C.includes(n.name))continue;let r;if("pnp"!==H)throw Error(`The nodeLinker ${H} is not supported for isolated Nix builds`);r=s.ppath.relative(e.cwd,s.ppath.join(U,a.structUtils.slugifyLocator(n),a.structUtils.getIdentVendorPath(n)));let o=n;if(a.structUtils.isVirtualLocator(o)){const{locatorHash:t}=a.structUtils.devirtualizeLocator(o),n=e.storedPackages.get(t);if(!n)throw Error("Assertion failed: The locator should have been registered");o=n}const i=a.structUtils.stringifyLocator(o),c=a.structUtils.stringifyLocator(n),l=`isolated.${p(i)}`;if(!R.has(o)){R.add(o);const e=[`pname = ${p(n.name)};`,`version = ${p(n.version)};`,`reference = ${p(o.reference)};`];if(A){const t=[...M(n)].sort().map((e=>`${p(e)}\n`)).join("");t&&e.push(`locators = [\n${t}];`)}const t=`override${V=n.name,V.split(/[^a-zA-Z0-9]+/g).filter((e=>e)).map((e=>{return(t=e).slice(0,1).toUpperCase()+t.slice(1);var t})).join("")}Attrs`;B.push(`${l} = optionalOverride (args.${t} or null) (mkIsolatedBuild { ${e.join(" ")} });`)}0===F.length&&F.push("# Copy in isolated builds."),F.push(`echo 'injecting build for ${n.name}'`,"yarn nixify inject-build \\",`  ${p(c)} \\`,`  \${${l}} \\`,`  ${p(r)}`)}var V;if(F.length>0&&F.push("echo 'running yarn install'"),null==t.mode||0===C.length){const t=e.topLevelWorkspace.manifest.name,o=t?a.structUtils.stringifyIdent(t):"workspace",c=u("# This file is generated by running \"yarn install\" inside your project.\n# Manual changes might be lost - proceed with caution!\n\n{ lib, stdenv, nodejs, git, cacert, fetchurl, writeShellScript, writeShellScriptBin }:\n{ src, overrideAttrs ? null, ... } @ args:\n\nlet\n\n  yarnBin = @@YARN_BIN@@;\n\n  cacheFolder = @@CACHE_FOLDER@@;\n  lockfile = @@LOCKFILE@@;\n\n  # Call overrideAttrs on a derivation if a function is provided.\n  optionalOverride = fn: drv:\n    if fn == null then drv else drv.overrideAttrs fn;\n\n  # Simple stub that provides the global yarn command.\n  yarn = writeShellScriptBin \"yarn\" ''\n    exec '${nodejs}/bin/node' '${yarnBin}' \"$@\"\n  '';\n\n  # Common attributes between Yarn derivations.\n  drvCommon = {\n    # Make sure the build uses the right Node.js version everywhere.\n    buildInputs = [ nodejs yarn ];\n    # All dependencies should already be cached.\n    yarn_enable_network = \"0\";\n    # Tell node-gyp to use the provided Node.js headers for native code builds.\n    npm_config_nodedir = nodejs;\n  };\n\n  # Comman variables that we set in a Nix build, but not in a Nix shell.\n  buildVars = ''\n    # Make Yarn produce friendlier logging for automated builds.\n    export CI=1\n    # Tell node-pre-gyp to never fetch binaries / always build from source.\n    export npm_config_build_from_source=true\n    # Disable Nixify plugin to save on some unnecessary processing.\n    export yarn_enable_nixify=false\n  '';\n\n#@@ IF COMBINED_DRV\n  cacheDrv = stdenv.mkDerivation {\n    name = \"yarn-cache\";\n    buildInputs = [ yarn git cacert ];\n    buildCommand = ''\n      cp --reflink=auto --recursive '${src}' ./src\n      cd ./src/\n      ${buildVars}\n      HOME=\"$TMP\" yarn_enable_global_cache=false yarn_cache_folder=\"$out\" \\\n        yarn nixify fetch\n      rm $out/.gitignore\n    '';\n    outputHashMode = \"recursive\";\n    outputHash = \"@@COMBINED_HASH@@\";\n  };\n#@@ ENDIF COMBINED_DRV\n#@@ IF INDIVIDUAL_DRVS\n  # Create derivations for fetching dependencies.\n  cacheDrvs = let\n  in lib.mapAttrs (locator: { filename, hash }: stdenv.mkDerivation {\n    name = lib.strings.sanitizeDerivationName locator;\n    buildInputs = [ yarn git cacert ];\n    buildCommand = ''\n      cd '${src}'\n      ${buildVars}\n      HOME=\"$TMP\" yarn_enable_global_cache=false yarn_cache_folder=\"$TMP\" \\\n        yarn nixify fetch ${locator}\n      # Because we change the cache dir, Yarn may generate a different name.\n      mv \"$TMP/$(sed 's/-[^-]*\\.[^-]*$//' <<< \"$outputFilename\")\"-* $out\n    '';\n    outputFilename = filename;\n    outputHash = hash;\n  }) cacheEntries;\n\n  # Create a shell snippet to copy dependencies from a list of derivations.\n  mkCacheBuilderForDrvs = drvs:\n    writeShellScript \"collect-yarn-cache\" (lib.concatMapStrings (drv: ''\n      cp --reflink=auto ${drv} '${drv.outputFilename}'\n    '') drvs);\n#@@ ENDIF INDIVIDUAL_DRVS\n\n#@@ IF NEED_ISOLATED_BUILD_SUPPRORT\n#@@ IF INDIVIDUAL_DRVS\n  # Create a shell snippet to copy dependencies from a list of locators.\n  mkCacheBuilderForLocators = let\n    pickCacheDrvs = map (locator: cacheDrvs.${locator});\n  in locators:\n    mkCacheBuilderForDrvs (pickCacheDrvs locators);\n#@@ ENDIF INDIVIDUAL_DRVS\n\n  # Create a derivation that builds a module in isolation.\n  mkIsolatedBuild = { pname, version, reference, locators ? [] }: stdenv.mkDerivation (drvCommon // {\n    inherit pname version;\n    dontUnpack = true;\n\n    configurePhase = ''\n      ${buildVars}\n      unset yarn_enable_nixify # plugin is not present\n    '';\n\n    buildPhase = ''\n      mkdir -p .yarn/cache\n#@@ IF COMBINED_DRV\n      cp --reflink=auto --recursive ${cacheDrv}/* .yarn/cache/\n#@@ ENDIF COMBINED_DRV\n#@@ IF INDIVIDUAL_DRVS\n      pushd .yarn/cache > /dev/null\n      source ${mkCacheBuilderForLocators locators}\n      popd > /dev/null\n#@@ ENDIF INDIVIDUAL_DRVS\n\n      echo '{ \"dependencies\": { \"${pname}\": \"${reference}\" } }' > package.json\n      install -m 0600 ${lockfile} ./yarn.lock\n      export yarn_global_folder=\"$TMP\"\n      export yarn_enable_global_cache=false\n      export yarn_enable_immutable_installs=false\n      yarn\n    '';\n\n    installPhase = ''\n      unplugged=( .yarn/unplugged/${pname}-*/node_modules/* )\n      if [[ ! -e \"''${unplugged[@]}\" ]]; then\n        echo >&2 \"Could not find the unplugged path for ${pname}\"\n        exit 1\n      fi\n\n      mv \"$unplugged\" $out\n    '';\n  });\n#@@ ENDIF NEED_ISOLATED_BUILD_SUPPRORT\n\n  # Main project derivation.\n  project = stdenv.mkDerivation (drvCommon // {\n    inherit src;\n    name = @@PROJECT_NAME@@;\n\n    configurePhase = ''\n      ${buildVars}\n\n      # Copy over the Yarn cache.\n      rm -fr '${cacheFolder}'\n      mkdir -p '${cacheFolder}'\n#@@ IF COMBINED_DRV\n      cp --reflink=auto --recursive ${cacheDrv}/* '${cacheFolder}/'\n#@@ ENDIF COMBINED_DRV\n#@@ IF INDIVIDUAL_DRVS\n      pushd '${cacheFolder}' > /dev/null\n      source ${mkCacheBuilderForDrvs (lib.attrValues cacheDrvs)}\n      popd > /dev/null\n#@@ ENDIF INDIVIDUAL_DRVS\n\n      # Yarn may need a writable home directory.\n      export yarn_global_folder=\"$TMP\"\n\n      # Ensure global cache is disabled. Cache must be part of our output.\n      touch .yarnrc.yml\n      sed -i -e '/^enableGlobalCache/d' .yarnrc.yml\n      echo 'enableGlobalCache: false' >> .yarnrc.yml\n\n      # Some node-gyp calls may call out to npm, which could fail due to an\n      # read-only home dir.\n      export HOME=\"$TMP\"\n\n      # running preConfigure after the cache is populated allows for\n      # preConfigure to contain substituteInPlace for dependencies as well as the\n      # main project. This is necessary for native bindings that maybe have\n      # hardcoded values.\n      runHook preConfigure\n\n@@ISOLATED_INTEGRATION@@\n\n      # Run normal Yarn install to complete dependency installation.\n      yarn install --immutable --immutable-cache\n\n      runHook postConfigure\n    '';\n\n    buildPhase = ''\n      runHook preBuild\n      runHook postBuild\n    '';\n\n    installPhase = ''\n      runHook preInstall\n\n      # Move the package contents to the output directory.\n      if grep -q '\"workspaces\"' package.json; then\n        # We can't use `yarn pack` in a workspace setup, because it only\n        # packages the outer workspace.\n        mkdir -p \"$out/libexec\"\n        mv $PWD \"$out/libexec/$name\"\n      else\n        # - If the package.json has a `files` field, only files matching those patterns are copied\n        # - Otherwise all files are copied.\n        yarn pack --out package.tgz\n        mkdir -p \"$out/libexec/$name\"\n        tar xzf package.tgz --directory \"$out/libexec/$name\" --strip-components=1\n\n        cp --reflink=auto .yarnrc* \"$out/libexec/$name\"\n        cp --reflink=auto ${lockfile} \"$out/libexec/$name/yarn.lock\"\n        cp --reflink=auto --recursive .yarn \"$out/libexec/$name\"\n\n        # Copy the Yarn linker output into the package.\n#@@ IF USES_PNP_LINKER\n        cp --reflink=auto .pnp.* \"$out/libexec/$name\"\n#@@ ENDIF USES_PNP_LINKER\n#@@ IF USES_NM_LINKER\n        cp --reflink=auto --recursive node_modules \"$out/libexec/$name\"\n#@@ ENDIF USES_NM_LINKER\n      fi\n\n      cd \"$out/libexec/$name\"\n\n      # Invoke a plugin internal command to setup binaries.\n      mkdir -p \"$out/bin\"\n      yarn nixify install-bin $out/bin\n\n#@@ IF USES_NM_LINKER\n      # A package with node_modules doesn't need the cache\n      yarn cache clean\n#@@ ENDIF USES_NM_LINKER\n\n      runHook postInstall\n    '';\n\n    passthru = {\n      inherit nodejs;\n      yarn-freestanding = yarn;\n      yarn = writeShellScriptBin \"yarn\" ''\n        exec '${yarn}/bin/yarn' --cwd '${overriddenProject}/libexec/${overriddenProject.name}' \"$@\"\n      '';\n    };\n  });\n\n  overriddenProject = optionalOverride overrideAttrs project;\n\n@@CACHE_ENTRIES@@\n@@ISOLATED@@\nin overriddenProject\n",{PROJECT_NAME:p(o),YARN_BIN:g,LOCKFILE:D,INDIVIDUAL_DRVS:A,COMBINED_DRV:!A,COMBINED_HASH:T,CACHE_FOLDER:I,CACHE_ENTRIES:j,ISOLATED:B.join("\n"),ISOLATED_INTEGRATION:h("      ",F.join("\n")),NEED_ISOLATED_BUILD_SUPPRORT:F.length>0,USES_PNP_LINKER:"pnp"===n.get("nodeLinker"),USES_NM_LINKER:"node-modules"===n.get("nodeLinker")}).replace(/\n\n\n+/g,"\n\n");if(await s.xfs.writeFilePromise(d,c),n.get("generateDefaultNix")){const e=s.ppath.join(r,"default.nix"),t=s.ppath.join(r,"flake.nix");s.xfs.existsSync(e)||s.xfs.existsSync(t)||(await s.xfs.writeFilePromise(e,"# This is a minimal `default.nix` by yarn-plugin-nixify. You can customize it\n# as needed, it will not be overwritten by the plugin.\n\n{ pkgs ? import <nixpkgs> { } }:\n\npkgs.callPackage ./yarn-project.nix { } { src = ./.; }\n"),i.reportInfo(0,"A minimal default.nix was created. You may want to customize it."))}}n.get("enableNixPreload")&&s.xfs.existsSync(s.npath.toPortablePath("/nix/store"))&&await s.xfs.mktempPromise((async t=>{const n=["--add-fixed","sha512"],r=[];if(A)for(const[e,{cachePath:n,hash:a}]of O.entries()){const o=v(e),i=x(o,a);if(!s.xfs.existsSync(i)){const e=s.ppath.join(t,k(a).slice(0,7));await s.xfs.mkdirPromise(e);const i=s.ppath.join(e,o);await s.xfs.copyFilePromise(n,i),r.push(i)}}else{n.unshift("--recursive");const e=x("yarn-cache",T,{recursive:!0});if(!s.xfs.existsSync(e)){const e=s.ppath.join(t,"yarn-cache");await s.xfs.mkdirPromise(e);for(const[t,{cachePath:n}]of _.entries()){const r=s.ppath.join(e,t);await s.xfs.copyFilePromise(n,r)}r.push(e)}}try{const t=r.length;for(;0!==r.length;){const t=r.splice(0,100);await a.execUtils.execvp("nix-store",[...n,...t],{cwd:e.cwd,strict:!0})}0!==t&&i.reportInfo(0,A?`Preloaded ${t} packages into the Nix store`:"Preloaded cache into the Nix store")}catch(e){if("ENOENT"!==e.code)throw e}}))})(e,t)}},configuration:{enableNixify:{description:"If false, disables the Nixify plugin hook that generates Nix expressions",type:a.SettingsType.BOOLEAN,default:!0},nixExprPath:{description:"Path of the file where the project Nix expression will be written to",type:a.SettingsType.ABSOLUTE_PATH,default:"./yarn-project.nix"},generateDefaultNix:{description:"If true, a default.nix will be generated if it does not exist",type:a.SettingsType.BOOLEAN,default:!0},enableNixPreload:{description:"If true, cached packages will be preloaded into the Nix store",type:a.SettingsType.BOOLEAN,default:!0},individualNixPackaging:{description:"If true, generate one Nix derivation per package. If false, use a single derivation for the entire cache folder.",type:a.SettingsType.BOOLEAN,default:!1},isolatedNixBuilds:{description:"Dependencies with a build step that can be built in an isolated derivation",type:a.SettingsType.STRING,default:[],isArray:!0},installNixBinariesForDependencies:{description:"If true, the Nix output 'bin' directory will also contain executables for binaries defined by dependencies",type:a.SettingsType.BOOLEAN,default:!1}}};t=r})(),t}};