{
  inputs = {nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable-small";};
  outputs = {
    self,
    nixpkgs,
    flake-utils,
  }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = import nixpkgs {inherit system;};
    in {
      devShell = pkgs.mkShell {
        packages = with pkgs; [
            bun
            deno # for formatting
          ];
      };
    });
}
