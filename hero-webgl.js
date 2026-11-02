// Visual Identity Studio - Hero WebGL 2 Interactive Canvas Scene

(function () {
  const canvas = document.getElementById('c');
  if (!canvas) return;

  const gl = canvas.getContext('webgl2', { alpha: false, antialias: false });
  if (!gl) {
    console.warn('WebGL 2 not supported, falling back to static background');
    document.getElementById('scene').style.background = '#0a0a0a';
    return;
  }

  // ── Vertex Shader ──
  const VS = `#version 300 es
  in vec2 aPos;
  out vec2 vUv;
  void main() {
    vUv = aPos * 0.5 + 0.5;
    gl_Position = vec4(aPos, 0.0, 1.0);
  }`;

  // ── Pass 1: Animated Radial Gradient (OKLab) ──
  const FG = `#version 300 es
  precision highp float;
  in vec2 vUv;
  uniform float uT;
  uniform vec2 uM;
  out vec4 fC;

  uvec2 pcg(uvec2 v) {
    v = v * 1664525u + 1013904223u;
    v.x += v.y * v.y * 1664525u + 1013904223u;
    v.y += v.x * v.x * 1664525u + 1013904223u;
    v ^= v >> 16u;
    v.x += v.y * v.y * 1664525u + 1013904223u;
    v.y += v.x * v.x * 1664525u + 1013904223u;
    return v;
  }
  float hsh(vec2 p) {
    uvec2 v = floatBitsToUint(p);
    v = pcg(v);
    return float(v.x ^ v.y) / 4294967295.0;
  }
  float gv(int i) {
    if(i==0) return 0.0;
    if(i==1) return 0.16078;
    if(i==2) return 0.39215;
    if(i==3) return 0.61568;
    if(i==4) return 0.81568;
    return 1.0;
  }
  vec3 lin(float v) { return vec3(pow(max(v,0.0), 2.2)); }
  vec3 srgb(vec3 v) { return pow(max(v,vec3(0.0)), vec3(1.0/2.2)); }
  vec3 cbrt(vec3 v) { return sign(v) * pow(abs(v), vec3(1.0/3.0)); }
  vec3 oklab(vec3 a, vec3 b, float t) {
    const mat3 L = mat3(0.41216, 0.21185, 0.0883, 0.53627, 0.68071, 0.28184, 0.05145, 0.1074, 0.63026);
    const mat3 F = mat3(4.07672, -1.26814, -0.00411, -3.30721, 2.60933, -0.70347, 0.23075, -0.34113, 1.70686);
    vec3 l1 = cbrt(L * a), l2 = cbrt(L * b), l = mix(l1, l2, t);
    l *= 1.0 + 0.025 * t * (1.0 - t);
    return F * (l * l * l);
  }
  vec3 gc(float p) {
    p = clamp(p, 0.0, 1.0);
    for(int i = 0; i < 5; i++) {
      float a = float(i) * 0.2, b = float(i + 1) * 0.2;
      if(p <= b || i == 4) {
        float t = clamp((p - a) / max(b - a, 1e-5), 0.0, 1.0);
        return srgb(oklab(lin(gv(i)), lin(gv(i+1)), t));
      }
    }
    return vec3(1.0);
  }
  vec2 rot2(vec2 v, float a) {
    float s = sin(a), c = cos(a);
    return vec2(v.x * c - v.y * s, v.x * s + v.y * c);
  }
  const float PI = 3.14159265359;

  void main() {
    vec2 ctr = vec2(0.5069686, 0.9874730) + mix(vec2(0.0), (uM - 0.5), 0.77);
    vec2 uv = rot2((vUv - ctr) / 1.46, (0.7506 - 0.5) * 2.0 * PI);
    float p = length(uv) - uT * 0.0625;
    float cy = floor(p);
    bool rv = int(cy) % 2 == 0;
    float ap = rv ? 1.0 - fract(p) : fract(p);
    vec3 col = gc(ap);
    col += (hsh(gl_FragCoord.xy) - 0.5) / 255.0;
    fC = vec4(col, 1.0);
  }`;

  // ── Pass 2: Composite Text over Gradient ──
  const FT = `#version 300 es
  precision highp float;
  in vec2 vUv;
  uniform sampler2D uGrad;
  uniform sampler2D uText;
  out vec4 fC;

  void main() {
    vec4 g = texture(uGrad, vUv);
    vec4 t = texture(uText, vec2(vUv.x, 1.0 - vUv.y)); // Flip Y
    fC = vec4(mix(g.rgb, t.rgb, t.a), 1.0);
  }`;

  // ── Pass 3: Raymarched 3D SDF Star/Cross Shape with Refraction ──
  const FS = `#version 300 es
  precision highp float;
  precision highp int;
  in vec2 vUv;
  uniform sampler2D uBg;
  uniform float uT;
  uniform vec2 uM;
  uniform vec2 uR;
  uniform float uRnd;
  out vec4 fC;

  const float PI = 3.14159265359;
  const vec3 RO = vec3(0.0, 0.0, -4.25);

  mat3 rX(float a) { float c=cos(a), s=sin(a); return mat3(1,0,0, 0,c,-s, 0,s,c); }
  mat3 rY(float a) { float c=cos(a), s=sin(a); return mat3(c,0,s, 0,1,0, -s,0,c); }
  mat3 rZ(float a) { float c=cos(a), s=sin(a); return mat3(c,-s,0, s,c,0, 0,0,1); }

  float bx(vec3 p, vec3 b) {
    vec3 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, max(d.y, d.z)), 0.0);
  }
  float mr(vec3 p) {
    p = vec3(-p.z, p.y, p.x);
    vec3 b = vec3(0.125, 0.75, 0.225);
    float r = bx(p, b);
    r = min(r, bx(rZ(PI * 0.25) * p, b));
    r = min(r, bx(rZ(PI * 0.5) * p, b));
    r = min(r, bx(rZ(PI * 0.75) * p, b));
    return r;
  }
  vec3 aP(vec3 p) {
    vec3 q = p / 0.3 * vec3(uR.x / uR.y, 1.0, 1.0) * (1.0 + uRnd + 0.01);
    vec2 axis = vec2(-0.5278 - 1.0, 0.5) * 2.0;
    q = rY(uT * 0.25) * rZ(0.4167 * 2.0 * PI) * rY(axis.y * PI) * rX(axis.x * PI) * q;
    return q.xzy;
  }
  float sdf(vec3 p) {
    return max(1e-10, mr(aP(p)) - (uRnd + 0.005)) * 0.3;
  }
  vec3 nm(vec3 p, float e) {
    vec2 h = vec2(1.0, -1.0) * e * 0.5;
    return normalize(h.xyy * mr(aP(p + h.xyy)) + h.yyx * mr(aP(p + h.yyx)) + h.yxy * mr(aP(p + h.yxy)) + h.xxx * mr(aP(p + h.xxx)));
  }
  float ign(vec2 s) {
    return fract(52.9829189 * fract(dot(s, vec2(0.06711056, 0.00583715))));
  }
  vec3 disp(vec3 rd, vec3 n) {
    float ib = 1.035;
    vec3 dc = vec3(0.03, 0.06, 0.1) * 0.288;
    vec3 col = vec3(0.0);
    for(int i = 0; i < 4; i++) {
      float s = float(i) * 0.25 + 0.125;
      vec3 d = s * dc;
      vec3 ior = 1.0 / (ib + d);
      vec3 rR = refract(rd, n, ior.r), rG = refract(rd, n, ior.g), rB = refract(rd, n, ior.b);
      col += vec3(texture(uBg, vUv - rR.xy).r, texture(uBg, vUv - rG.xy).g, texture(uBg, vUv - rB.xy).b);
    }
    return clamp(col * 0.25, 0.0, 1.0);
  }
  float frFn(vec3 e, vec3 n, float pw) {
    float NdV = abs(dot(e, n));
    float ed = smoothstep(0.2, -0.2, fwidth(dot(e, n)));
    return pow(1.0 - NdV, pw) * mix(1.0, ed * 2.0, 0.5);
  }
  uvec2 pcg(uvec2 v) {
    v = v * 1664525u + 1013904223u;
    v.x += v.y * v.y * 1664525u + 1013904223u;
    v.y += v.x * v.x * 1664525u + 1013904223u;
    v ^= v >> 16u;
    v.x += v.y * v.y * 1664525u + 1013904223u;
    v.y += v.x * v.x * 1664525u + 1013904223u;
    return v;
  }
  float hsh(vec2 p) {
    uvec2 v = floatBitsToUint(p);
    v = pcg(v);
    return float(v.x ^ v.y) / 4294967295.0;
  }
  vec4 march(vec3 ro, vec3 rd) {
    float ps = 0.005, j = ign(gl_FragCoord.xy), t = j, hit = 0.0;
    vec3 ep = vec3(0.0), en = vec3(0.0);
    for(int i = 0; i < 60; i++) {
      vec3 p = ro + rd * t;
      float d = sdf(p);
      float pg = float(i) / 60.0;
      float st = d * mix(0.5, 2.0, pg) * mix(1.0, j + 0.5, 1.0 - pg);
      if(d > 100.0) break;
      if(d < ps) { hit = 1.0; ep = p; en = nm(p, ps * 1.6); break; }
      t += max(st, ps);
      if(t > 100.0) break;
    }
    if(hit == 0.0) return texture(uBg, vUv);
    vec3 col = disp(rd, en);
    vec3 acc = vec3(0.83529, 0.96862, 0.29803);
    col += frFn(rd, en, 8.0) * 0.5 * acc;
    vec3 ld = vec3(-0.749, 0.751, -3.0);
    col += pow(max(dot(en, normalize(ld + rd)), 0.0), 64.01) * acc;
    col += (hsh(vUv) - 0.5) / 255.0;
    return vec4(col, 1.0);
  }

  void main() {
    vec2 uv = vUv;
    vec2 ctr = vec2(0.5) + mix(vec2(0.0), (uM - 0.5), 0.77);
    uv -= ctr;
    vec3 rd = vec3(uv * tan(radians(20.0) * 0.5), 0.5);
    fC = march(RO, rd);
  }`;

  // ── Pass 4: Chromatic Aberration Screen Filter ──
  const FC = `#version 300 es
  precision highp float;
  in vec2 vUv;
  uniform sampler2D uTx;
  uniform float uT;
  uniform vec2 uR;
  uniform float uA;
  out vec4 fC;

  const float PI = 3.14159265359;

  void main() {
    float ar = uR.x / uR.y;
    float ang = ((0.2349 + uT * 0.3125) * 360.0) * PI / 180.0;
    vec2 rot = vec2(sin(ang), cos(ang));
    vec4 col = texture(uTx, vUv);
    float md = max(0.0, 1.0 - distance(vUv * vec2(ar, 1.0), vec2(0.5 * ar, 0.5)) * 4.0);
    vec2 ab = uA * rot * 0.03 * md;
    if(length(ab) >= 0.001) {
      col.r = texture(uTx, vUv - ab).r;
      col.b = texture(uTx, vUv + ab).b;
    }
    fC = col;
  }`;

  // ── GL Helpers ──
  function mkSh(src, t) {
    const s = gl.createShader(t);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s));
    }
    return s;
  }
  function mkPr(v, f) {
    const p = gl.createProgram();
    gl.attachShader(p, mkSh(v, gl.VERTEX_SHADER));
    gl.attachShader(p, mkSh(f, gl.FRAGMENT_SHADER));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(p));
    }
    return p;
  }
  function mkFB(w, h) {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const f = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { f, t };
  }

  const gP = mkPr(VS, FG), tP = mkPr(VS, FT), sP = mkPr(VS, FS), cP = mkPr(VS, FC);
  const qb = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, qb);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);

  function bq(p) {
    const l = gl.getAttribLocation(p, 'aPos');
    gl.bindBuffer(gl.ARRAY_BUFFER, qb);
    gl.enableVertexAttribArray(l);
    gl.vertexAttribPointer(l, 2, gl.FLOAT, false, 0, 0);
  }
  const u = (p, n) => gl.getUniformLocation(p, n);

  const gU = { t: u(gP, 'uT'), m: u(gP, 'uM') };
  const tU = { g: u(tP, 'uGrad'), tx: u(tP, 'uText') };
  const sU = { bg: u(sP, 'uBg'), t: u(sP, 'uT'), m: u(sP, 'uM'), r: u(sP, 'uR'), rnd: u(sP, 'uRnd') };
  const cU = { tx: u(cP, 'uTx'), t: u(cP, 'uT'), r: u(cP, 'uR'), a: u(cP, 'uA') };

  let textTex = null;

  function buildTextTex() {
    const tc = document.createElement('canvas');
    tc.width = W; tc.height = H;
    const ctx = tc.getContext('2d');

    const fs = W * 0.20038;
    const lh = fs * 0.7827;
    const ls = -0.023 * fs;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.font = `600 ${fs}px 'Inter Tight', sans-serif`;
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${ls}px`;

    const rx = W * 0.5 + W * 0.8487 * 0.5;
    const cy = H * 0.4933;

    ctx.fillText('The',    rx, cy - lh);
    ctx.fillText('BitDev', rx, cy);
    ctx.fillText('Studio', rx, cy + lh);

    if (!textTex) textTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textTex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tc);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  let W = 0, H = 0, fboGrad, fboComb, fboShape;

  function rsz() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    H = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    canvas.width = W; canvas.height = H;

    [fboGrad, fboComb, fboShape].forEach(f => {
      if (f) { gl.deleteFramebuffer(f.f); gl.deleteTexture(f.t); }
    });
    fboGrad  = mkFB(W, H);
    fboComb  = mkFB(W, H);
    fboShape = mkFB(W, H);
    buildTextTex();
  }

  document.fonts.ready.then(() => { buildTextTex(); });

  let tm = 0, lt = 0;
  const mx = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
  let scr = 0, rnd = 0, ca = 0.044;
  const lerp = (a, b, t) => a + (b - a) * t;

  function frame(now) {
    const dt = Math.min((now - lt) / 1000, 0.05);
    lt = now; tm += dt;

    mx.x = lerp(mx.x, mx.tx, 0.07);
    mx.y = lerp(mx.y, mx.ty, 0.07);
    rnd = lerp(rnd, scr, 0.09);
    ca  = lerp(ca, 0.044 + scr * 0.436, 0.06);

    gl.viewport(0, 0, W, H);

    // Pass 1: Gradient
    gl.bindFramebuffer(gl.FRAMEBUFFER, fboGrad.f);
    gl.useProgram(gP); bq(gP);
    gl.uniform1f(gU.t, tm); gl.uniform2f(gU.m, mx.x, mx.y);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // Pass 2: Text Composite
    gl.bindFramebuffer(gl.FRAMEBUFFER, fboComb.f);
    gl.useProgram(tP); bq(tP);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, fboGrad.t);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, textTex);
    gl.uniform1i(tU.g, 0); gl.uniform1i(tU.tx, 1);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // Pass 3: SDF Shape
    gl.bindFramebuffer(gl.FRAMEBUFFER, fboShape.f);
    gl.useProgram(sP); bq(sP);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, fboComb.t);
    gl.uniform1i(sU.bg, 0); gl.uniform1f(sU.t, tm);
    gl.uniform2f(sU.m, mx.x, mx.y); gl.uniform2f(sU.r, W, H);
    gl.uniform1f(sU.rnd, rnd);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // Pass 4: Chromatic Aberration
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.useProgram(cP); bq(cP);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, fboShape.t);
    gl.uniform1i(cU.tx, 0); gl.uniform1f(cU.t, tm);
    gl.uniform2f(cU.r, W, H); gl.uniform1f(cU.a, ca);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(frame);
  }

  window.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mx.tx = (e.clientX - r.left) / r.width;
    mx.ty = 1.0 - (e.clientY - r.top) / r.height;
  });
  window.addEventListener('touchmove', e => {
    if (!e.touches[0]) return;
    const t = e.touches[0], r = canvas.getBoundingClientRect();
    mx.tx = (t.clientX - r.left) / r.width;
    mx.ty = 1.0 - (t.clientY - r.top) / r.height;
  }, { passive: true });
  window.addEventListener('scroll', () => {
    const scene = document.getElementById('scene');
    if (!scene) return;
    const r = scene.getBoundingClientRect();
    scr = Math.max(0, Math.min(1, -r.top / (r.height * 0.23)));
  }, { passive: true });
  window.addEventListener('resize', rsz);

  rsz();
  requestAnimationFrame(t0 => { lt = t0; requestAnimationFrame(frame); });
})();
