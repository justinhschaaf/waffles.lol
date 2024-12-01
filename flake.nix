{

    # References:
    # https://zero-to-nix.com/start/nix-develop
    # https://github.com/DeterminateSystems/zero-to-nix/blob/main/nix/templates/dev/javascript/flake.nix
    # https://nixos.wiki/wiki/Flakes

    description = "waffles.lol built with Yarn and Svelte";

    inputs.nixpkgs.url = "github:nixos/nixpkgs";
    inputs.flake-utils.url = "github:numtide/flake-utils";

    outputs = { self, nixpkgs, flake-utils }: {

        # This should not be set for each individual system, but shared
        nixosModules.default = { inputs, lib, config, pkgs, ... }: {

            options.services.waffles.lol = {
                enable = lib.mkEnableOption "the waffles.lol website";
                hostName = lib.mkOption {
                    type = lib.types.str;
                    default = "localhost";
                    description = "The domain at which the website should be accessed.";
                };
                port = lib.mkOption {
                    type = lib.types.port;
                    default = 3000;
                    description = "The port the web server should be listening on.";
                };
                # description for bottom two are from https://kit.svelte.dev/docs/adapter-node#environment-variables
                shutdownTimeout = lib.mkOption {
                    type = lib.types.int;
                    default = 30;
                    description = "The number of seconds to wait before forcefully closing any remaining connections after receiving a `SIGTERM` or `SIGINT` signal.";
                };
                idleTimeout = lib.mkOption {
                    type = lib.types.nullOr lib.types.int;
                    default = null;
                    description = "The number of seconds after which the app is automatically put to sleep when receiving no requests. If not set, the app runs continuously.";
                };
            };

            config = lib.mkIf config.services.waffles.lol.enable {

                systemd.services."waffles.lol" = {
                    script = "${self.outputs.packages.${pkgs.system}.default}/bin/waffles.lol";
                    wants = [ "network-online.target" ];
                    after = [ "network-online.target" ];
                    environment = {
                        PORT = config.services.waffles.lol.port;
                        ORIGIN = config.services.waffles.lol.hostName;
                        SHUTDOWN_TIMEOUT = config.services.waffles.lol.shutdownTimeout;
                        IDLE_TIMEOUT = config.services.waffles.lol.idleTimeout;
                    };
                };

                systemd.sockets."waffles.lol" = {
                    listenStreams = [ "${toString config.services.waffles.lol.port}" ];
                    wantedBy = [ "sockets.target" ];
                };

            };

        };

    } // flake-utils.lib.eachDefaultSystem(system:
        let pkgs = import nixpkgs { inherit system; }; in {

            devShells.default = pkgs.mkShell rec {

                packages = with pkgs; [
                    yarn-berry
                    libuuid
                ];

                # https://github.com/Automattic/node-canvas/issues/1947#issuecomment-991016228
                LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath packages;

            };

            # Made using https://github.com/stephank/yarn-plugin-nixify
            # Full options at https://ryantm.github.io/nixpkgs/stdenv/stdenv/
            packages.default = pkgs.callPackage ./default.nix {};

        }
    );

}
