varying vec3 vPosition;
varying vec2 vUv;

void main() {
    vPosition = csm_Position.xyz;
    vUv = uv;
}