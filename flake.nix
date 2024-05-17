{

    # References:
    # https://zero-to-nix.com/start/nix-develop
    # https://github.com/DeterminateSystems/zero-to-nix/blob/main/nix/templates/dev/javascript/flake.nix
    # https://nixos.wiki/wiki/Flakes

    description = "waffles.lol built with Yarn and Svelte";

    inputs.nixpkgs.url = "github:nixos/nixpkgs";
    inputs.flake-utils.url = "github:numtide/flake-utils";

    outputs = { self, nixpkgs, flake-utils }: 
    flake-utils.lib.eachDefaultSystem(system:
        let pkgs = import nixpkgs { inherit system; }; in {

            devShells.default = pkgs.mkShell rec {

                packages = with pkgs; [
                    yarn-berry
                    libuuid
                ];

                # Playwright is fucked
                # https://nixos.wiki/wiki/Playwright
                # https://www.giacomodebidda.com/posts/playwright-on-nixos/
                # https://github.com/Automattic/node-canvas/issues/1947#issuecomment-991016228
                LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath packages;

            };

            };
        }
    );

}
