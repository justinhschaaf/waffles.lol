{ pkgs ? import <nixpkgs> { } }:

let
    project = pkgs.callPackage ./yarn-project.nix {} {
        src = pkgs.lib.cleanSource ./.;
    };
in project.overrideAttrs (oldAttrs: {

    # Example of adding packages to the build environment.
    # Especially dependencies with native modules may need a Python installation.
    buildInputs = oldAttrs.buildInputs ++ (with pkgs; [

        libuuid
        python3

        # node-canvas
        cairo
        pango
        pkg-config

        # node-canvas file types
        giflib
        libjpeg
        librsvg

    ]);

    # Example of invoking a build step in your project.
    buildPhase = ''
        runHook preBuild
        yarn run build
        runHook postBuild
    '';

})
