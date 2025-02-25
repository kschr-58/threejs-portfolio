uniform float uMeshSize;
uniform float uTextureCoverage;
uniform float uRingSize;
uniform vec3 uRingColor;
uniform sampler2D uTexture;

varying vec3 vPosition;
varying vec2 vUv;

void main() {
    vec4 textureColor = texture2D(uTexture, vUv);

    // Untextured color
    vec4 color = vec4(vec3(0.16), 1.0);
    if (textureColor.r == 0.0 && textureColor.g == 0.0 && textureColor.b == 0.0) color = vec4(vec3(0.0), 1.0);
    else if (textureColor.r >= .95 && textureColor.g >= .95 && textureColor.b >= .95) color = vec4(vec3(1.0), 1.0);

    float scaledTextureCoverage = uMeshSize / 100.0 * uTextureCoverage;

    // Check if fragment is part of expansion ring
    if (distance(vPosition.xy, vec2(0.0, 0.0)) > scaledTextureCoverage - uRingSize && 
        distance(vPosition.xy, vec2(0.0, 0.0)) < scaledTextureCoverage) {
        color = vec4(vec3(uRingColor), 1.0);
    }
    else {
        // Color fragment depending on whether it is part of the inner or outer section
        float strength = 1.0 - step(scaledTextureCoverage, distance(vPosition.xy, vec2(0.0, 0.0)));
        color = strength == 1.0 ? textureColor : color;
    }

    gl_FragColor = vec4(color);
}