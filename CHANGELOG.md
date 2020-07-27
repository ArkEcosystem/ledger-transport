# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [1.1.3] - 2020-07-27

### Changed

-   update ledgerhq deps ([#42])

### Security

-   bump codecov from 3.6.5 to 3.7.1 ([#41])
-   bump lodash from 4.17.15 to 4.17.19 ([#40])

## [1.1.2] - 2020-06-09

### Added

-   add support for 2.0.1 ARK App

## [1.1.1] - 2020-06-05

### Changed

-   rerelease of 1.1.0

## [1.1.0] - 2020-06-04

### Changed

-   improve implementation & maintainability ([#33])
-   improve naming and comments ([#28])

### Added

-   support for schnorr signatures ([#30])

## [1.0.5] - 2020-02-27

## [1.0.4] - 2020-02-27

### Fixed

-   stop catching TransportError when signing ([#24])

## [1.0.3] - 2020-02-07

### Fixed

-   remove debug from local npm publish ([994787d])

## [1.0.2] - 2020-01-27

### Fixed

-   fix signing of larger payloads ([47a6a74])

## [1.0.1] - 2020-01-27

### Fixed

-   fix signature response from ledger ([7a3b6d3])

## [1.0.0] - 2020-01-25

### Added

-   initial release ([4cd4270])
-   add display for getAddress method ([#3])

[#3]: https://github.com/ArkEcosystem/ledger-transport/pull/3
[4cd4270]: https://github.com/ArkEcosystem/ledger-transport/tree/4cd4270b383a7bf819d825f0cf1f65dec060ec2a
[1.0.0]: https://github.com/ArkEcosystem/ledger-transport/tree/4cd4270b383a7bf819d825f0cf1f65dec060ec2a
[7a3b6d3]: https://github.com/ArkEcosystem/ledger-transport/tree/7a3b6d3d1dcc908254237c3b30937fb39a5b84dd
[1.0.1]: https://github.com/ArkEcosystem/ledger-transport/compare/4cd4270b383a7bf819d825f0cf1f65dec060ec2a...4efa6f3bedad91f25b0667d30171e2c3cac3a1b0
[47a6a74]: https://github.com/ArkEcosystem/ledger-transport/tree/47a6a74be15e4b64786b4b52327c6d235a76b62e
[1.0.2]: https://github.com/ArkEcosystem/ledger-transport/compare/4efa6f3bedad91f25b0667d30171e2c3cac3a1b0...f8787d51667e6ceaacd3a23e2d3414225291224c
[994787d]: https://github.com/ArkEcosystem/ledger-transport/tree/994787d9c3b4ef3b4cffb95a6331bd47722c13f1
[1.0.3]: https://github.com/ArkEcosystem/ledger-transport/compare/f8787d51667e6ceaacd3a23e2d3414225291224c...1495fcf49ea6d1f3a5f218d46a4d4df156bffc57
[#24]: https://github.com/ArkEcosystem/ledger-transport/pull/24
[1.0.4]: https://github.com/ArkEcosystem/ledger-transport/compare/1495fcf49ea6d1f3a5f218d46a4d4df156bffc57...d6ccab2697891db6472355d1ff2d76bbc89e6e08
[1.0.5]: https://github.com/ArkEcosystem/ledger-transport/compare/d6ccab2697891db6472355d1ff2d76bbc89e6e08...cf7d9a6679b4db74c07c50155549882f1737b87e
[#28]: https://github.com/ArkEcosystem/ledger-transport/pull/28
[#33]: https://github.com/ArkEcosystem/ledger-transport/pull/33
[#30]: https://github.com/ArkEcosystem/ledger-transport/pull/33
[1.1.0]: https://github.com/ArkEcosystem/ledger-transport/compare/cf7d9a6679b4db74c07c50155549882f1737b87e...4ead4c126f6b92ad7539c9c23bfa52651e82c577
[1.1.1]: https://github.com/ArkEcosystem/ledger-transport/compare/4ead4c126f6b92ad7539c9c23bfa52651e82c577...518e599166afc96cb4f2088158ad316d810d7b77
[1.1.2]: https://github.com/ArkEcosystem/ledger-transport/compare/518e599166afc96cb4f2088158ad316d810d7b77...55809fe49e6d76961303c8162e29619a8ab921d8
[#40]: https://github.com/ArkEcosystem/ledger-transport/pull/40
[#41]: https://github.com/ArkEcosystem/ledger-transport/pull/41
[#42]: https://github.com/ArkEcosystem/ledger-transport/pull/42
[1.1.3]: https://github.com/ArkEcosystem/ledger-transport/compare/55809fe49e6d76961303c8162e29619a8ab921d8...1.1.3
