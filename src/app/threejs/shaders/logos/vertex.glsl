varying vec3 vPosition;
varying vec2 vUv;

void main() {
    
    vec4 localPosition = vec4(position, 1.);
    vec4 worldPosition = modelMatrix * localPosition;
    vec4 viewPosition = viewMatrix * worldPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    vPosition = position;
    vUv = uv;
}