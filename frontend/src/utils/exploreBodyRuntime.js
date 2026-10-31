// Explore3D runtime core — imperative asset loading, per-region mesh prep and
// shared material caching for the layered body. No React in here: the component
// only mounts the group and forwards state changes.
//
// Contract this implements (all values come from explore-regions.json, which the
// build writes from scripts/skeleton/body/registry.js):
//   * one render mesh per (layer, region)  -> 52 draw calls, not 309
//   * one material instance per visible look, swapped onto meshes, never cloned
//     per mesh
//   * ghosted layers are not pickable
//   * the protected explore-skeleton.glb ships inside-out winding on some bones,
//     so each merged asthi region is flipped by its own signed volume

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import { ASTHI_CATEGORY_TINT, asthiCategory, pbrOf } from './exploreBodyConfig.js';

const loader = new GLTFLoader(); // no manager arg -> drei's useProgress sees it

/** url -> Promise<THREE.Group>. Cached so remounts (StrictMode) are free. */
const glbCache = new Map();

export function loadGlb(url) {
  let p = glbCache.get(url);
  if (!p) {
    p = new Promise((resolve, reject) => {
      loader.load(url, (gltf) => resolve(gltf.scene), undefined, (err) => {
        glbCache.delete(url);
        reject(err);
      });
    });
    glbCache.set(url, p);
  }
  return p;
}

/** Signed volume of a triangulated mesh: negative when the shell faces inward. */
export function signedVolume(geom) {
  const pos = geom.getAttribute('position');
  const idx = geom.getIndex();
  const a = [0, 0, 0], b = [0, 0, 0], c = [0, 0, 0];
  let v = 0;
  const n = idx ? idx.count : pos.count;
  for (let i = 0; i + 2 < n; i += 3) {
    const i0 = idx ? idx.getX(i) : i;
    const i1 = idx ? idx.getX(i + 1) : i + 1;
    const i2 = idx ? idx.getX(i + 2) : i + 2;
    pos.getXYZ(i0, a); pos.getXYZ(i1, b); pos.getXYZ(i2, c);
    v += a[0] * (b[1] * c[2] - b[2] * c[1])
      + a[1] * (b[2] * c[0] - b[0] * c[2])
      + a[2] * (b[0] * c[1] - b[1] * c[0]);
  }
  return v / 6;
}

function flipWinding(geom) {
  const idx = geom.getIndex();
  if (!idx) {
    geom.setAttribute('normal', new THREE.BufferAttribute(
      Float32Array.from(geom.getAttribute('normal').array, (v) => -v), 3));
    return geom;
  }
  const arr = idx.array;
  for (let i = 0; i < arr.length; i += 3) {
    const t = arr[i + 1];
    arr[i + 1] = arr[i + 2];
    arr[i + 2] = t;
  }
  idx.needsUpdate = true;
  geom.setAttribute('normal', new THREE.BufferAttribute(
    Float32Array.from(geom.getAttribute('normal').array, (v) => -v), 3));
  return geom;
}

/**
 * The build bakes COLOR_0 as (cavity AO, local thickness, 0). Used raw that would
 * tint every tissue cyan-dark, so it is folded into a single luminance shade and
 * the material colour carries the anatomy.
 */
function remapSurfaceColor(geom) {
  const col = geom.getAttribute('color');
  if (!col) return geom;
  const arr = col.array;
  for (let i = 0; i < arr.length; i += 3) {
    const ao = arr[i];
    const thickness = arr[i + 1];
    const shade = ao * (0.72 + 0.28 * thickness) * 0.86 + 0.14;
    const s = Math.min(1, Math.max(0.18, shade));
    arr[i] = s; arr[i + 1] = s; arr[i + 2] = s;
  }
  col.needsUpdate = true;
  return geom;
}

function normalizeForMerge(geom) {
  const g = geom.index ? geom : geom.toNonIndexed();
  if (!g.getAttribute('normal')) g.computeVertexNormals();
  if (g.getAttribute('uv')) g.deleteAttribute('uv');
  if (g.getAttribute('uv1')) g.deleteAttribute('uv1');
  const count = g.getAttribute('position').count;
  if (!g.getAttribute('color')) {
    const white = new Float32Array(count * 3);
    white.fill(1);
    g.setAttribute('color', new THREE.BufferAttribute(white, 3));
  }
  return g;
}

/**
 * Turn a loaded layer into the meshes the viewer renders: one per region, with
 * the region record attached and a world Box3 for cheap pick prefiltering.
 * Generated layers already ship merged; the skeleton is collapsed here.
 */
export function prepareRegionMeshes(object, cfg, layer) {
  const byRegion = new Map();
  const stray = [];
  object.traverse((o) => {
    if (!o.isMesh) return;
    const regionId = o.userData?.region || (layer === 'asthi' ? o.parent?.userData?.region : null);
    if (regionId && cfg.regionsById.has(regionId)) {
      const key = layer === 'asthi' ? `${regionId}|${asthiCategory(o.name)}` : regionId;
      if (!byRegion.has(key)) byRegion.set(key, { regionId, category: asthiCategory(o.name), meshes: [] });
      byRegion.get(key).meshes.push(o);
    } else {
      stray.push(o);
    }
  });

  const out = [];
  for (const { regionId, category, meshes } of byRegion.values()) {
    const region = cfg.regionsById.get(regionId);
    let geom;
    if (meshes.length === 1) {
      geom = normalizeForMerge(meshes[0].geometry);
    } else {
      geom = mergeGeometries(meshes.map((m) => normalizeForMerge(m.geometry)), false);
    }
    if (!geom) continue;
    geom.computeBoundingBox();
    geom.computeBoundingSphere();
    remapSurfaceColor(geom);
    if (layer === 'asthi' && signedVolume(geom) < 0) flipWinding(geom);

    const mesh = new THREE.Mesh(geom);
    mesh.name = `region_${regionId}${category === 'bone' ? '' : `_${category}`}`;
    mesh.userData.region = region;
    mesh.userData.layer = layer;
    mesh.userData.parts = meshes.map((m) => m.name);
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    mesh.frustumCulled = true;
    // Bones keep their four tissue tones (bone / tooth / cartilage / disc)
    // instead of the single per-region tint the soft layers use.
    const tint = layer === 'asthi' && category !== 'bone'
      ? ASTHI_CATEGORY_TINT[category]
      : region.tint;
    out.push({ mesh, region, box: geom.boundingBox.clone(), tint, state: 'overview' });
  }

  // Anything in a layer file that no region owns is dropped rather than guessed
  // at — the build contract says every mesh carries region userData, and the
  // verifier asserts it, so a stray here means a stale asset.
  if (stray.length) console.warn(`[Explore3D] ${layer}: ${stray.length} mesh(es) without a known region were skipped`);
  return out;
}

/**
 * Shared material cache. One instance per (tint, state, opacity, sheen) tuple;
 * meshes swap `material` references instead of carrying clones.
 */
export function createMaterialCache() {
  const cache = new Map();
  return {
    get(spec) {
      const key = `${spec.color}|${spec.emissive}|${spec.emissiveIntensity}|${spec.opacity}|${spec.roughness}|${spec.metalness}|${spec.depthWrite}`;
      let m = cache.get(key);
      if (!m) {
        m = new THREE.MeshStandardMaterial({
          color: new THREE.Color(spec.color),
          emissive: new THREE.Color(spec.emissive || '#000000'),
          emissiveIntensity: spec.emissiveIntensity || 0,
          roughness: spec.roughness,
          metalness: spec.metalness,
          vertexColors: true,
          transparent: spec.opacity < 1,
          opacity: spec.opacity,
          depthWrite: spec.depthWrite !== false,
        });
        m.name = key;
        cache.set(key, m);
      }
      return m;
    },
    dispose() {
      for (const m of cache.values()) m.dispose();
      cache.clear();
    },
    size: () => cache.size,
  };
}

const WHITE = new THREE.Color('#ffffff');
const tmpA = new THREE.Color();
const tmpB = new THREE.Color();

/** Tissue colour for a render state: context dims + desaturates, ghosts wash out. */
export function stateColor(tint, state, cfg) {
  const c = tmpA.set(tint || '#888888');
  if (state === 'context') {
    const { contextDesaturate: ds, contextDim: dim } = cfg.stateConstants;
    const grey = 0.33;
    tmpB.setRGB(
      (c.r * (1 - ds) + grey * ds) * (1 - dim),
      (c.g * (1 - ds) + grey * ds) * (1 - dim),
      (c.b * (1 - ds) + grey * ds) * (1 - dim),
    );
    return tmpB.getHexString();
  }
  if (state === 'ghost') return tmpB.copy(c).lerp(WHITE, 0.45).getHexString();
  return c.getHexString();
}

/**
 * The full look for one mesh right now. Opacity comes from the state table for
 * everything except the overview, where the per-layer constants apply.
 */
export function materialSpecFor(entry, state, cfg, uiColor) {
  const s = cfg.stateConstants;
  const pbr = pbrOf(entry.region);
  const layerCfg = cfg.layers[entry.region.layer] || { overviewOpacity: 1 };
  let opacity = 1;
  let emissive = '';
  let emissiveIntensity = 0;
  let depthWrite = true;
  if (state === 'overview') opacity = layerCfg.overviewOpacity ?? 1;
  else if (state === 'ghost') { opacity = s.ghostOpacity; depthWrite = false; }
  else if (state === 'target') { emissive = uiColor; emissiveIntensity = s.targetEmissive; }
  else if (state === 'hover') { emissive = uiColor; emissiveIntensity = s.targetEmissive + s.hoverEmissive; }
  return {
    color: stateColor(entry.tint, state, cfg),
    emissive,
    emissiveIntensity,
    opacity,
    roughness: pbr.roughness,
    metalness: pbr.metalness,
    depthWrite,
  };
}

/**
 * Nearest region mesh under the ray. Boxes are tested first so a hover frame
 * usually raycasts against two or three meshes instead of the whole body.
 */
export function pickRegion(raycaster, entries) {
  let best = null;
  let bestDist = Infinity;
  for (const e of entries) {
    if (!e.mesh.visible) continue;
    if (e.mesh.userData.state === 'ghost') continue;
    if (!raycaster.ray.intersectsBox(e.box)) continue;
    const hits = raycaster.intersectObject(e.mesh, false);
    if (hits.length && hits[0].distance < bestDist) {
      bestDist = hits[0].distance;
      best = e;
    }
  }
  return best;
}
