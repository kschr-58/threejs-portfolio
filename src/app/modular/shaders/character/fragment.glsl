uniform float uMeshSize;
uniform float uTextureCoverage;
uniform float uRingSize;
uniform vec3 uRingColor;
uniform vec3 uTransitionPoint;
uniform sampler2D uLightTexture;
uniform sampler2D uDarkTexture;
uniform bool uToDarkTheme;

varying vec3 vPosition;
varying vec2 vUv;

void main() {
    vec4 lightTextureColor = texture2D(uLightTexture, vUv);
    vec4 darkTextureColor = texture2D(uDarkTexture, vUv);

    vec4 color = vec4(vec3(0.5), 1.0);

    float scaledTextureCoverage = uMeshSize / 100.0 * uTextureCoverage;

    // Check if fragment is part of expansion ring
    if (distance(vPosition.xyz, uTransitionPoint) > scaledTextureCoverage - uRingSize && 
        distance(vPosition.xyz, uTransitionPoint) < scaledTextureCoverage) {
        color = vec4(vec3(uRingColor), 1.0);
    }
    else {
        // Color fragment depending on whether it is part of the inner or outer section
        float strength = 1.0 - step(scaledTextureCoverage, distance(vPosition.xyz, uTransitionPoint));
        if (uToDarkTheme) color = strength == 1.0 ? lightTextureColor : darkTextureColor;
        else color = strength == 1.0 ? darkTextureColor : lightTextureColor;
    }

    csm_FragColor = color;
}