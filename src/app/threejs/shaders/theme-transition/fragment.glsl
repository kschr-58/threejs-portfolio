uniform float uMeshSize;
uniform float uTextureCoverage;
uniform float uRingSize;
uniform vec3 uLightColor;
uniform vec3 uDarkColor;
uniform vec3 uRingColor;
uniform vec3 uTransitionPoint;
uniform sampler2D uMonoTexture;
uniform bool uToDarkTheme;
uniform bool uUsingTextures;

varying vec3 vPosition;
varying vec2 vUv;

void main() {
    vec4 lightColor = vec4(uLightColor, 1.0);
    vec4 darkColor = vec4(uDarkColor, 1.0);

    // If the mesh uses textures, use these instead to apply color
    if (uUsingTextures) {
        lightColor = texture2D(uMonoTexture, vUv);
    }

    vec4 color = vec4(vec3(0.5), 1.0);

    float scaledTextureCoverage = uMeshSize / 100.0 * uTextureCoverage;

    // Check if fragment is part of expansion ring
    if (distance(vPosition.xyz, uTransitionPoint.xyz) > scaledTextureCoverage - uRingSize && 
        distance(vPosition.xyz, uTransitionPoint.xyz) < scaledTextureCoverage) {
        color = vec4(vec3(uRingColor), 1.0);
    }
    else {
        // Color fragment depending on whether it is part of the inner or outer section
        float strength = 1.0 - step(scaledTextureCoverage, distance(vPosition.xyz, uTransitionPoint.xyz));

        if (uUsingTextures) {
            vec4 invertedColor = vec4(1.0 - lightColor.r, 1.0 -lightColor.g, 1.0 - lightColor.b, 1.0);
            if (invertedColor.rgb == vec3(0.0)) invertedColor = vec4(vec3(uDarkColor), 1.0);

            if (uToDarkTheme) color = strength == 1.0 ? lightColor : invertedColor;
            else color = strength == 1.0 ? invertedColor : lightColor;
        } else {
            if (uToDarkTheme) color = strength == 1.0 ? lightColor : darkColor;
            else color = strength == 1.0 ? darkColor : lightColor;
        }
    }

    csm_FragColor = color;
}