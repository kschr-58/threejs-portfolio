uniform vec3 uElevatedColor;
uniform vec3 uDepthColor;
uniform float uColorOffset;
uniform float uColorMultiplier;

varying vec2 vUv;
varying float vElevation;

void main() {
    float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;
    vec3 color = mix(uDepthColor, uElevatedColor, mixStrength);

    gl_FragColor = vec4(color, 1.0);

    #include <colorspace_fragment>
}
