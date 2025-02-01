varying vec2 vUv;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
    // Step pattern 1
    // float strength = step(0.8, mod(vUv.x * 10.0, 1.0));
    // strength += step(0.8, mod(vUv.y * 10.0, 1.0));

    // Step pattern 2
    // float strength = step(0.5, mod(vUv.x * 10.0, 1.0));
    // strength *= step(0.8, mod(vUv.y * 10.0, 1.0));

    // Step pattern 3
    // float xBar = step(0.5, mod(vUv.x * 10.0, 1.0));
    // xBar *= step(0.8, mod(vUv.y * 10.0, 1.0));

    // float yBar = step(0.5, mod(vUv.y * 10.0, 1.0));
    // yBar *= step(0.8, mod(vUv.x * 10.0, 1.0));

    // float strength = xBar + yBar;

    // Step pattern 4
    // float xBar = step(0.4, mod(vUv.x * 10.0, 1.0));
    // xBar *= step(0.8, mod(vUv.y * 10.0 + 0.2, 1.0));

    // float yBar = step(0.8, mod(vUv.x * 10.0 + 0.2, 1.0));
    // yBar *= step(0.4, mod(vUv.y * 10.0, 1.0));

    // float strength = xBar + yBar;

    // Gradient pattern
    // float strength = max(abs(vUv.x - 0.5), abs(vUv.y - 0.5));

    // Step pattern 5
    // float strength = step(0.2, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));

    // Random pattern 1
    // float strength = random(vUv);

    // Random pattern 2
    // vec2 gridUv = vec2(floor(vUv.x * 10.0) / 10.0, floor(vUv.y * 10.0) / 10.0);
    // float strength = random(gridUv);

    // Random pattern 3
    // vec2 gridUv = vec2(
    //     floor(vUv.x * 10.0) / 10.0, 
    //     floor((vUv.y + vUv.x * 0.5) * 10.0) / 10.0
    // );
    // float strength = random(gridUv);

    // Circular pattern 1
    // float strength = length(vUv);

    // Circular pattern 1
    float strength = distance(vUv, vec2(0.5));

    gl_FragColor = vec4(vec3(strength), 1.0);
}
