# waffles.lol

Homelab landing page.

## Workspace Setup

To make sure the Yarn version doesn't change, the version is locked by the Nix package manager. If you're not on NixOS, install the Nix package manager for your system using the [Determinate Nix Installer](https://github.com/DeterminateSystems/nix-installer).

> [!NOTE]
> *I recommend the Determinate installer over the default provided on the NixOS website since the default doesn't work on SELinux systems (e.g. Fedora) while the Determinate installer does.*

Once Nix is installed, enter the dev shell by running `nix develop` in the project directory. **Assume ALL commands hereafter are in this shell unless otherwise stated.**

- Alternatively, you can enter the dev shell automatically when you `cd` into the project folder by installing [direnv](https://direnv.net/docs/installation.html).

> [!TIP]
> *For reference, a new Svelte project can be created here with `yarn create svelte`.*

At this point, you can install the project's dependencies with `yarn install`.

## Developing

Run `yarn run dev` to open a development server on [localhost:5173](http://localhost:5173), allowing you to preview changes in real time.

## Building

Basic instructions are to use `yarn run build`. To build the Nix package, use `nix-build` or `nix build path:./#default`.

Run a preview server with `yarn run preview`.

## Hosting

These instructions are written for a NixOS system using flakes.

> [!TIP]
> Binary caching is provided by [Garnix](https://garnix.io/docs/caching).

First, add this repo as an input to your flake.nix and add the module to your NixOS configuration.

```nix
{

    ...

    inputs.waffleslol.url = "github:justinhschaaf/waffles.lol";

    ...

    outputs = { nixpkgs, ... }@inputs: {
        nixosConfigurations.HOSTNAME = nixpkgs.lib.nixosSystem {
            specialArgs = { inherit inputs; };
            modules = [
                inputs.waffleslol.nixosModules.default
                ...
            ];
        };
    };

    ...

}
```

Then, enable the service in your config.

```nix
{inputs, pkgs, ...}: {
    services.waffles.lol = {
        enable = true;
        hostName = "localhost";
        port = 3000;
    };
}
```

## Additional Resources

If you want to make a website in Svelte using SvelteKit yourself, here are some of the sources I used:

- [Svelte Docs](https://svelte.dev/docs)
- [SvelteKit Docs](https://kit.svelte.dev/docs)
