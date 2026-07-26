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
    hash = "sha256-DhRklNaMqueHDf/5HyNYmLQwD6pSjwLdUi83JUR69kY=";

    genSystems = nixpkgs.lib.genAttrs [
      "aarch64-linux"
      "x86_64-linux"
    ];

    pkgs = genSystems (system: import nixpkgs {inherit system;});
  in {
    formatter = genSystems (system: nixpkgs.legacyPackages.${system}.alejandra);

    nixosModules = {
      default = self.nixosModules.shuttr;

      shuttr = {
        config,
        lib,
        pkgs,
        ...
      }: let
        inherit (lib) types mkEnableOption mkOption mkIf mkMerge strings;
        cfg = config.services.shuttr;
        isPostgresUnixSocket = lib.hasPrefix "/" cfg.database.host;
        system = pkgs.stdenv.hostPlatform.system;

        commonServiceConfig = {
          Type = "simple";
          Restart = "on-failure";
          RestartSec = 3;

          # Hardening
          CapabilityBoundingSet = "";
          NoNewPrivileges = true;
          PrivateUsers = true;
          PrivateTmp = true;
          PrivateMounts = true;
          ProtectClock = true;
          ProtectControlGroups = true;
          ProtectHome = true;
          ProtectHostname = true;
          ProtectKernelLogs = true;
          ProtectKernelModules = true;
          ProtectKernelTunables = true;
          RestrictAddressFamilies = [
            "AF_INET"
            "AF_INET6"
            "AF_UNIX"
          ];
          RestrictNamespaces = true;
          RestrictRealtime = true;
          RestrictSUIDSGID = true;
          UMask = "0077";
        };
      in {
        # A lot borrowed from:
        # https://github.com/jvanbruegge/nixpkgs/blob/master/nixos/modules/services/web-apps/immich.nix
        options.services.shuttr = {
          enable = mkEnableOption "Shuttr";

          environment = mkOption {
            type = types.submodule {freeformType = types.attrsOf types.str;};
            default = {};
            example = {
              NUXT_STORAGE_THUMB_CACHE_MAX = "500";
            };
            description = ''
              Extra configuration environment variables.
            '';
          };

          secretsFile = mkOption {
            type =
              types.str
              // {
                # We don't want users to be able to pass a path literal here but
                # it should look like a path.
                check = it: lib.isString it && types.path.check it;
              };
            example = "/run/secrets/shuttr";
            description = ''
              Path of a file with extra environment variables to be loaded from disk. This file is not added to the nix store, so it can be used to pass secrets to shuttr.

              To set the session password set this to a file containing:
              ```
              NUXT_SESSION_PASSWORD=<pass>
              ```
            '';
          };

          host = mkOption {
            type = types.str;
            default = "localhost";
            description = "The host that shuttr will listen on.";
          };
          port = mkOption {
            type = types.port;
            default = 2284;
            description = "The port that shuttr will listen on.";
          };
          openFirewall = mkOption {
            type = types.bool;
            default = false;
            description = "Whether to open the shuttr port in the firewall";
          };
          user = mkOption {
            type = types.str;
            default = "shuttr";
            description = "The user shuttr should run as.";
          };
          group = mkOption {
            type = types.str;
            default = "shuttr";
            description = "The group shuttr should run as.";
          };

          title = mkOption {
            type = types.str;
            default = "Shuttr";
            description = "The title used on pages.";
          };
          header = mkOption {
            type = types.str;
            default = "Shuttr Photo Gallery";
            description = "The header used on pages.";
          };
          description = mkOption {
            type = types.str;
            default = "Shuttr Photo Gallery";
            description = "The description shown on the main page.";
          };
          links = mkOption {
            type = types.listOf (types.submodule {
              options = {
                icon = mkOption {
                  type = types.str;
                  default = "i-lucide-link";
                  description = "The icon used with the link.";
                };
                to = mkOption {
                  type = types.str;
                  default = "https://github.com/dsluijk/shuttr";
                  description = "The destination of the link.";
                };
              };
            });
            default = [
              {
                icon = "i-simple-icons-github";
                to = "https://github.com/dsluijk/shuttr";
              }
            ];
            description = "The links shown on the main page and footer.";
          };

          database = {
            enable =
              mkEnableOption "the postgresql database for use with shuttr. See {option}`services.postgresql`"
              // {
                default = true;
              };
            createDB =
              mkEnableOption "the automatic creation of the database for shuttr."
              // {
                default = true;
              };
            name = mkOption {
              type = types.str;
              default = "shuttr";
              description = "The name of the shuttr database.";
            };
            host = mkOption {
              type = types.str;
              default = "/run/postgresql";
              example = "127.0.0.1";
              description = "Hostname or address of the postgresql server. If an absolute path is given here, it will be interpreted as a unix socket path.";
            };
            port = mkOption {
              type = types.port;
              default = 5432;
              description = "Port of the postgresql server.";
            };
            user = mkOption {
              type = types.str;
              default = "shuttr";
              description = "The database user for shuttr.";
            };
            secure = mkOption {
              type = types.bool;
              default = false;
              description = "Whenether to connect to the database securely";
            };
          };

          auth = {
            authentik = {
              enable = mkEnableOption "enable Authentik authentication.";
              displayName = mkOption {
                type = types.str;
                default = "Authentik";
                description = "The user facing description.";
              };
              domain = mkOption {
                type = types.str;
                default = "login.example.com";
                description = "The domain of the Authentik instance.";
              };
              clientId = mkOption {
                type = types.str;
                default = "";
                description = "The client ID of the provider to use.";
              };
              publisherGroups = mkOption {
                type = types.listOf types.str;
                default = [];
                description = "The Authentik group to assign publisher privileges to automatically when logging in.";
              };
              adminGroups = mkOption {
                type = types.listOf types.str;
                default = [];
                description = "The Authentik group to assign admin privileges to automatically when logging in.";
              };
            };
          };

          storage = {
            cacheSize = mkOption {
              type = types.int;
              default = 1000;
              description = "Amount of items to keep cached in memory.";
            };

            file = {
              enable =
                mkEnableOption "use the flatfile storage."
                // {
                  default = true;
                };

              path = mkOption {
                type =
                  types.str
                  // {
                    check = it: lib.isString it && types.path.check it;
                  };

                default = "/var/lib/shuttr";
                example = "/var/lib/shuttr";
              };
            };
          };
        };

        config = mkIf cfg.enable {
          assertions = [
            {
              assertion = cfg.auth.authentik.enable;
              message = "At least one of services.shuttr.auth.authentik.enable has to be enabled.";
            }
            {
              assertion = cfg.storage.file.enable;
              message = "At least one of services.shuttr.storage.file.enable has to be enabled.";
            }
          ];

          services.postgresql = mkIf cfg.database.enable {
            enable = true;
            ensureDatabases = mkIf cfg.database.createDB [cfg.database.name];
            ensureUsers = mkIf cfg.database.createDB [
              {
                name = cfg.database.user;
                ensureDBOwnership = true;
                ensureClauses.login = true;
              }
            ];
            extensions = ps: [
              ps.postgis
            ];
          };

          networking.firewall.allowedTCPPorts = mkIf cfg.openFirewall [cfg.port];

          services.shuttr.environment = let
            postgresEnv =
              if isPostgresUnixSocket
              then {
                DATABASE_URL = "postgresql:///${cfg.database.name}?host=${cfg.database.host}";
              }
              else {
                DATABASE_HOST = cfg.database.host;
                DATABASE_PORT = toString cfg.database.port;
                DATABASE_DB = cfg.database.name;
                DATABASE_USER = cfg.database.user;
                DATABASE_SSL = toString cfg.database.secure;
              };
            authAuthentikEnv = mkIf cfg.auth.authentik.enable {
              NUXT_OAUTH_AUTHENTIK_DISPLAY_NAME = cfg.auth.authentik.displayName;
              NUXT_OAUTH_AUTHENTIK_DOMAIN = cfg.auth.authentik.domain;
              NUXT_OAUTH_AUTHENTIK_GROUPS_PUBLISHER = strings.concatStringsSep " " cfg.auth.authentik.publisherGroups;
              NUXT_OAUTH_AUTHENTIK_GROUPS_ADMIN = strings.concatStringsSep " " cfg.auth.authentik.adminGroups;
              NUXT_OAUTH_AUTHENTIK_CLIENT_ID = cfg.auth.authentik.clientId;
            };
            storageFileEnv = mkIf cfg.storage.file.enable {
              NUXT_STORAGE_FILE_BASE = cfg.storage.file.path;
            };
          in
            mkMerge [
              {
                HOST = cfg.host;
                PORT = toString cfg.port;
                NUXT_STORAGE_THUMB_CACHE_MAX = toString cfg.storage.cacheSize;
                NUXT_PUBLIC_TITLE = cfg.title;
                NUXT_PUBLIC_HEADER = cfg.header;
                NUXT_PUBLIC_DESCRIPTION = cfg.description;
                NUXT_PUBLIC_LINKS = builtins.toJSON cfg.links;
              }
              postgresEnv
              authAuthentikEnv
              storageFileEnv
            ];

          systemd.slices.shuttr = {
            description = "Shuttr slice";
            documentation = ["https://github.com/dsluijk/shuttr"];
          };

          systemd.services.shuttr = {
            description = "Shuttr Photo Gallery";
            requires = mkIf cfg.database.enable ["postgresql.target"];
            after = ["network.target"] ++ lib.optionals cfg.database.enable ["postgresql.target"];
            wantedBy = ["multi-user.target"];
            inherit (cfg) environment;
            path = [
              pkgs.vips
            ];

            serviceConfig =
              commonServiceConfig
              // {
                WorkingDirectory = self.packages.${system}.shuttr;
                ExecStart = lib.getExe self.packages.${system}.shuttr;
                EnvironmentFile = cfg.secretsFile;
                Slice = "system-shuttr.slice";
                StateDirectory = "shuttr";
                SyslogIdentifier = "shuttr";
                RuntimeDirectory = "shuttr";
                User = cfg.user;
                Group = cfg.group;
              };
          };

          systemd.tmpfiles.settings = mkIf cfg.storage.file.enable {
            shuttr = {
              # Redundant to the `UMask` service config setting on new installs, but installs made in
              # early 24.11 created world-readable media storage by default, which is a privacy risk. This
              # fixes those installs.
              "${cfg.storage.file.path}" = {
                e = {
                  user = cfg.user;
                  group = cfg.group;
                  mode = "0700";
                };
              };
            };
          };

          users.users = mkIf (cfg.user == "shuttr") {
            shuttr = {
              name = "shuttr";
              group = cfg.group;
              isSystemUser = true;
            };
          };
          users.groups = mkIf (cfg.group == "shuttr") {shuttr = {};};
        };

        meta = {
          maintainers = with lib.maintainers; [dsluijk];
        };
      };
    };

    packages = genSystems (
      system: let
        lib = nixpkgs.lib;
      in rec {
        default = shuttr;

        shuttr = pkgs.${system}.stdenv.mkDerivation (finalAttrs: {
          inherit pname version src hash;

          CI = true;
          NUXT_TELEMETRY_DISABLED = 1;

          nativeBuildInputs = with pkgs.${system}; [
            nodejs
            pnpm
            pnpmConfigHook
            makeBinaryWrapper
          ];

          pnpmInstallFlags = ["--shamefully-hoist"];

          pnpmDepsHash = hash;
          pnpmDeps = pkgs.${system}.fetchPnpmDeps {
            inherit (finalAttrs) pname version src hash pnpmInstallFlags;
            fetcherVersion = 2;
          };

          buildPhase = ''
            runHook preBuild

            pnpm build

            runHook postBuild
          '';

          installPhase = ''
            runHook preInstall

            mkdir -p $out/bin
            mkdir -p $out/server/database

            cp -rf .output/* $out
            cp ./drizzle.config.ts $out
            cp -rf ./server/database/migrations $out/server/database/migrations

            makeWrapper ${lib.getExe pkgs.${system}.nodejs} $out/bin/shuttr \
              --add-flags "$out/server/index.mjs" \
              --argv0 shuttr

            runHook postInstall
          '';

          meta = {
            description = "Shuttr photo gallery";
            homepage = "https://github.com/dsluijk/shuttr";
            # license = lib.licenses.cc-by-nc-sa-40;
            maintainers = with lib.maintainers; [dsluijk];
            platforms = lib.platforms.linux;
            mainProgram = "shuttr";
          };
        });
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
