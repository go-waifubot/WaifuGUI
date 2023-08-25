{
  inputs = { nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable"; };
  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let pkgs = import nixpkgs { inherit system; };

      in
      rec {
        devShell = pkgs.mkShell {
          name = "waifugui";
          packages = with pkgs; [ nodejs ];
        };
      });

}
