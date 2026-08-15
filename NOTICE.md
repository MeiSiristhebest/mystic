# Open Source License & Upstream Notices

## 1. Mystic Core Application
- **License**: MIT License
- **Copyright**: (c) 2026 Mystic Project Contributors

---

## 2. Upstream Astronomical Dependencies & Algorithms

### npm `ephemeris`
- **Upstream Author**: Edwin Moshier / npm package maintainers
- **License**: GNU General Public License v3.0 (GPL-3.0)
- **Role in Mystic**: Used as a standalone numerical celestial position computing dependency for geocentric planetary positions.
- **Architectural Boundary**: Mystic encapsulates `ephemeris` calls inside `lib/vedic/ephemeris.ts` as a pure mathematical calculation adapter. If you redistribute or create proprietary derivates, please ensure full compliance with GPL-3.0 requirements or switch to an alternative astronomical ephemeris backend (such as WebAssembly Swiss Ephemeris or standalone calculation services).

### `iztro`
- **Upstream Author**: Lucas (iztro / iztro-core)
- **License**: MIT License
- **Role in Mystic**: Used for discrete lunar/solar calendar conversions, 12 palaces, and star placements in Ziwei Doushu.

---

## 3. Traditional Classical Literature Citations
- **Shanghan Lun & Jingui Yaolue**: Classical public domain medical literature by Zhang Zhongjing (Eastern Han Dynasty).
- **Ziwei Doushu Classical Verses**: 《紫微斗数全书》《骨髓赋》 Public domain classical literature.
- **Brihat Parashara Hora Shastra (BPHS) & Jaimini Sutras**: Ancient Vedic astronomical and astrological sutras (Public Domain).
- **Disclaimer**: Classical literature citations in Mystic are provided strictly for cultural, historical, and philosophical research, and do NOT constitute medical prescriptions, psychiatric advice, or legal counsel.
