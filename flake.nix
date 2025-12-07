{
  description = "Shuttr Photo Gallery";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = {
    nixpkgs,
    self,
    ...
  } @ inputs: let
    pname = "shuttr";
    version = "0.0.1";
    src = nixpkgs.lib.cleanSource ./.;
    hash = "sha256-9+bgbheeuW1YtizyUyyz77qFpTVcks1SdSGD/P14PA4=";

    genSystems = nixpkgs.lib.genAttrs [
      "aarch64-linux"
      "x86_64-linux"
    ];

    pkgs = genSystems (system: import nixpkgs {inherit system;});
  in {
    formatter = genSystems (system: nixpkgs.legacyPackages.${system}.alejandra);

    packages = genSystems (
      system: rec {
        default = pkgs.${system}.stdenv.mkDerivation (finalAttrs: {
          inherit pname version src hash;

          NUXT_TELEMETRY_DISABLED = 1;

          nativeBuildInputs = with pkgs.${system}; [
            nodejs
            pnpm.configHook
          ];

          pnpmInstallFlags = ["--shamefully-hoist"];

          pnpmDepsHash = hash;
          pnpmDeps = pkgs.${system}.pnpm.fetchDeps {
            inherit (finalAttrs) pname version src hash pnpmInstallFlags;
            fetcherVersion = 2;
          };

          postBuild = ''
            pnpm build
          '';

          postInstall = ''
            mkdir -p $out/bin
            cp -rf .output/* $out

            cat << EOF >> $out/bin/shuttr
            #!${pkgs.${system}.bash}/bin/bash
            ${pkgs.${system}.nodejs}/bin/node $out/server/index.mjs
            EOF
            chmod +x $out/bin/shuttr
          '';

          meta = {
            description = "Shuttr photo gallery";
            homepage = "https://github.com/dsluijk/shuttr";
            license = nixpkgs.lib.licenses.cc-by-nc-sa-40;
            maintainers = with nixpkgs.lib.maintainers; [dsluijk];
            platforms = nixpkgs.lib.platforms.linux;
            mainProgram = "shuttr";
          };
        });

        shuttr = default;
      }
    );

    apps = genSystems (system: {
      shuttr = {
        type = "app";
        program = "${self.packages.${system}.shuttr}/bin/shuttr";
      };
    });
  };
}
