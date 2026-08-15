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

## 3. Upstream Open Source References & Reuse (Avoiding Reinventing the Wheel)

Mystic's multi-domain deterministic reasoning framework, Canonical Evidence Graph (CEG), and cross-system tension arbitration architecture are original designs of the Mystic project. 

To avoid reinventing the wheel on domain-specific rule collections and classical data assets, Mystic references and adapts components from the following open-source projects:
- **[`nihaixia`](https://github.com/jangviktor-web/nihaixia)**: Reused classical formula dataset formatting, 6-stages symptom mappings, and case categorization.
- **[`vedic-astro-skills`](https://github.com/CNWU16/vedic-astro-skills)**: Referenced Vedic astronomical Dasha recursive algorithms and mathematical calculation workflows.
- **[`ziwei-doushu`](https://github.com/Renhuai123/ziwei-doushu)**: Referenced classical astrolabe patterns and Si Hua mutagen rule definitions.

---

## 4. Traditional Classical Literature Citations
- **Shanghan Lun & Jingui Yaolue**: Classical public domain medical literature by Zhang Zhongjing (Eastern Han Dynasty).
- **Ziwei Doushu Classical Verses**: 《紫微斗数全书》《骨髓赋》 Public domain classical literature.
- **Brihat Parashara Hora Shastra (BPHS) & Jaimini Sutras**: Ancient Vedic astronomical and astrological sutras (Public Domain).
- **Disclaimer**: Classical literature citations in Mystic are provided strictly for cultural, historical, and philosophical research, and do NOT constitute medical prescriptions, psychiatric advice, or legal counsel.
