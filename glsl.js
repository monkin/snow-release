snow.Shaders = {"background.f":"precision highp float;\r\n\r\nvarying float point_x;\r\n\r\nfloat rand(float seed) {\r\n    return fract(sin(seed) * 43758.5453123);\r\n}\r\n\r\nvoid main() {\r\n    float f =  (0.7 + point_x * point_x * 0.3)  + rand(sin(gl_FragCoord.x) + gl_FragCoord.y) * 0.15;\r\n    gl_FragColor = vec4(vec3(0.2, 0.2, 0.6) * f, 1);\r\n}","background.v":"precision highp float;\r\n\r\nattribute vec2 a_point;\r\nvarying float point_x;\r\n\r\nvoid main() {\r\n\tpoint_x = a_point.x;\r\n    gl_Position = vec4(a_point, 0, 1);\r\n}","bump.f":"precision highp float;\r\n\r\nvarying vec3 v_color;\r\n\r\nvoid main() {\r\n    gl_FragColor = vec4(v_color, 1);\r\n}","bump.v":"precision highp float;\r\n\r\nattribute vec2 a_point;\r\nattribute vec3 a_color;\r\n\r\nvarying vec3 v_color;\r\n\r\nvoid main() {\r\n    v_color = normalize(a_color);\r\n    gl_Position = vec4(a_point, 0, 1);\r\n}","lights.f":"precision highp float;\r\n\r\nvarying vec3 v_color;\r\nvarying vec2 v_point;\r\nvarying float v_radius;\r\n\r\nuniform vec4 u_viewport;\r\n\r\nvoid main() {\r\n    float scale = min(u_viewport.z, u_viewport.w);\r\n    float scaled_radius = v_radius * scale * 0.5;\r\n    float max_alpha =  (v_radius + 0.2) / 1.5;\r\n    float d = distance(gl_FragCoord.xy, v_point);\r\n    float d_factor = d / scaled_radius;\r\n    float alpha = (d_factor < 0.8)\r\n        ? 1.0\r\n        : (0.2 - (d_factor - 0.8)) * 5.0;\r\n    gl_FragColor = vec4(v_color, alpha * alpha * alpha * max_alpha);\r\n}","lights.v":"precision highp float;\r\n\r\nattribute vec2 a_point;\r\nattribute vec3 a_color;\r\nattribute float a_radius;\r\n\r\nuniform vec4 u_viewport;\r\nuniform float u_time;\r\nuniform float u_max_radius;\r\n\r\nvarying vec3 v_color;\r\nvarying vec2 v_point;\r\nvarying float v_radius;\r\n\r\nvoid main() {\r\n    vec2 direction = vec2(cos(u_time / 4500.0), sin(u_time / 2250.0)); \r\n    vec2 shift = direction / (a_radius * 200.0);\r\n\tv_color = a_color;\r\n\tv_point = ((a_point + shift) + vec2(1, 1)) * 0.5 * u_viewport.zw;\r\n\tgl_PointSize = min(a_radius * min(u_viewport.z, u_viewport.w), u_max_radius);\r\n    v_radius = gl_PointSize / min(u_viewport.z, u_viewport.w);\r\n    gl_Position = vec4(a_point + shift, 0, 1);\r\n}","snow.f":"precision highp float;\r\n\r\n#define M_PI 3.1415926535897932384626433832795\r\n#define MIN_RIPPLE 0.0\r\n#define MAX_RIPPLE (3.0 * M_PI)\r\n\r\nuniform float u_ratio;\r\nuniform float u_time;\r\nuniform sampler2D u_normals;\r\n\r\nvarying vec2 v_orientation;\r\nvarying float v_star;\r\nvarying vec3 v_normal;\r\nvarying vec3 v_tangent;\r\nvarying vec3 v_bitangent;\r\nvarying vec3 v_position;\r\nvarying vec2 v_bump;\r\n\r\nfloat rand(float seed) {\r\n    return fract(sin(seed) * 43758.5453123);\r\n}\r\n\r\nfloat rand(float seed, float v1, float v2) {\r\n    return rand(seed) * (v2 - v1) + v1;\r\n}\r\n\r\nmat2 create_rotation_matrix(float angle) {\r\n    float c = cos(angle);\r\n    float s = sin(angle);\r\n    return mat2(c, -s, s, c);\r\n}\r\n\r\nfloat distance_to_line(vec4 line, vec2 testPt) {\r\n    vec2 pt1 = line.xy;\r\n    vec2 pt2 = line.zw;\r\n    vec2 lineDir = pt2 - pt1;\r\n    vec2 perpDir = vec2(lineDir.y, -lineDir.x);\r\n    vec2 dirToPt1 = pt1 - testPt;\r\n    return abs(dot(normalize(perpDir), dirToPt1));\r\n}\r\n\r\nvec4 random_line(float seed) {\r\n    float angle = M_PI * rand(seed);\r\n    float x1 = rand(seed + 1.053);\r\n    float y1 = rand(seed + 1.153);\r\n    return vec4(x1, y1, x1 + cos(angle), y1 + sin(angle));\r\n}\r\n\r\nvec4 normal_line(vec4 line) {\r\n    return vec4(line.x, line.y, line.x + (line.w - line.y), line.y - (line.z - line.x));\r\n}\r\n\r\nfloat light(vec3 point, vec3 normal, vec3 source, vec3 eye) {\r\n    vec3 lightDirection = normalize(source - point);\r\n    vec3 eyeDirection = normalize(eye - point);\r\n    return 0.6 +\r\n        abs(dot(normal, lightDirection)) * 0.5 +\r\n        max(dot(normalize(reflect(-lightDirection, normal)), eyeDirection), 0.0) * 0.6;\r\n}\r\n\r\nvec3 compute_normal() {\r\n    return normalize(mat3(v_tangent, v_bitangent, v_normal) * texture2D(u_normals, v_bump).rgb);\r\n} \r\n\r\nvoid main() {\r\n    float x = u_ratio * u_time;\r\n    float r = 100.0;\r\n    \r\n    if (length(v_orientation) < 0.9) {\r\n        for (float i = 0.0; i < 3.0; i += 1.0) {\r\n            vec2 twirl_center = vec2(rand(v_star + 0.1 * i), rand(v_star + 0.2 * i));\r\n            float twirl_angle = rand(v_star + 0.3 * i, MIN_RIPPLE, MAX_RIPPLE) * distance(v_orientation, twirl_center);\r\n            vec2 twirl_point = (v_orientation - twirl_center) * create_rotation_matrix(twirl_angle) + twirl_center;\r\n        \r\n            vec4 line1 = random_line(v_star + 2.137 * i);\r\n            vec4 line2 = normal_line(line1);\r\n            r = min(r, distance_to_line(line1, twirl_point));\r\n            r = min(r, distance_to_line(line2, twirl_point));\r\n        }\r\n        \r\n        float alpha = max(1.0 - r * r * r * 500.0, 0.0) * (0.3 + 0.7 * max(1.0 - gl_FragCoord.z, 0.0));\r\n        gl_FragColor = vec4(1, 1, 1, alpha * alpha\r\n            * light(vec3(v_position.xy, 1.0 / v_position.z), compute_normal(), vec3(0, 0, -2), vec3(0, 0, -4)));\r\n    } else {\r\n        gl_FragColor = vec4(0);\r\n    }\r\n}","snow.v":"precision highp float;\r\n\r\n#define M_PI 3.1415926535897932384626433832795\r\n#define MIN_RPS 1.0\r\n#define MAX_RPS 2.0\r\n#define MIN_SPIN_RADIUS 0.1\r\n#define MAX_SPIN_RADIUS 0.3\r\n#define MIN_SPIN_RPS -0.15\r\n#define MAX_SPIN_RPS 0.15\r\n#define FALL_SPEED 0.4\r\n\r\nmat4 create_rotation_matrix(vec3 axis, float angle) {\r\n    axis = normalize(axis);\r\n    float s = sin(angle);\r\n    float c = cos(angle);\r\n    float oc = 1.0 - c;\r\n    \r\n    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,\r\n                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,\r\n                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,\r\n                0.0,                                0.0,                                0.0,                                1.0);\r\n}\r\n\r\nfloat rand(float seed) {\r\n    return fract(sin(seed) * 43758.5453123);\r\n}\r\n\r\nfloat rand(float seed, float v1, float v2) {\r\n    return rand(seed) * (v2 - v1) + v1;\r\n}\r\n\r\nvec3 rand_axis(float seed) {\r\n    float phi = rand(seed, 0.0, 2.0 * M_PI);\r\n    float theta = rand(seed + 2.17, 0.2 * M_PI, 0.8 * M_PI);\r\n    float sin_theta = sin(theta);\r\n    return vec3(sin_theta * cos(phi), sin_theta * sin(phi), cos(theta));\r\n}\r\n\r\nfloat loop(float v, float min_v, float max_v) {\r\n    return mod(v - min_v, max_v - min_v) + min_v;\r\n}\r\n\r\nuniform float u_ratio;\r\nuniform float u_time;\r\n\r\nattribute vec2 a_point;\r\nattribute float a_orientation;\r\nattribute float a_star;\r\n\r\nvarying vec2 v_orientation;\r\nvarying float v_star;\r\nvarying vec3 v_normal;\r\nvarying vec3 v_tangent;\r\nvarying vec3 v_bitangent;\r\nvarying vec3 v_position;\r\nvarying vec2 v_bump;\r\n\r\nvoid main() {\r\n    \r\n    // v_orientation\r\n    if (a_orientation == 0.0) {\r\n        v_orientation = vec2(0, 0);\r\n    } else if (a_orientation == 1.0) {\r\n        v_orientation = vec2(0, 1);\r\n    } else {\r\n        float angle = 2.0 * M_PI / 10.0;\r\n        v_orientation = vec2(cos(angle), sin(angle));\r\n    }\r\n    \r\n    // v_star\r\n    v_star = a_star;\r\n    \r\n    // gl_Position\r\n    float rotation_speed = rand(a_star, MIN_RPS, MAX_RPS);\r\n    vec3 rotation_axis = rand_axis(a_star + 0.1);\r\n    mat4 rotation_matrix = create_rotation_matrix(rotation_axis, sin(rotation_speed * u_time * 0.001 + rand(a_star + 7.0) * 0.33));\r\n    vec4 rotated_point = vec4(a_point / 8.5, 0, 1) * rotation_matrix / vec4(u_ratio, 1, 1, 1);\r\n    \r\n    float spin_radius = rand(a_star + 0.5, MIN_SPIN_RADIUS, MAX_SPIN_RADIUS);\r\n    float fall_speed = FALL_SPEED - spin_radius;\r\n    float fall_offset = fall_speed * u_time * 0.001;\r\n    vec4 offset = vec4(\r\n        rand(a_star + 0.2, -1.0 - (1.0 / u_ratio / u_ratio), 1.0 + (1.0 / u_ratio / u_ratio)),\r\n        loop(rand(a_star + 0.3, -2.0, 2.0) - fall_offset, -2.0, 2.0),\r\n        rand(a_star + 0.4, -0.8, 0.2),\r\n        0);\r\n    vec4 shifted_point = rotated_point + offset;\r\n    \r\n    float spin_angle = rand(a_star + 0.6, MIN_SPIN_RPS, MAX_SPIN_RPS) * 2.0 * M_PI * u_time * 0.001;\r\n    vec4 spinned_point = shifted_point + vec4(sin(spin_angle) * spin_radius, 0, cos(spin_angle) * spin_radius, 0);\r\n    \r\n    float factor = 1.0 / (1.4 + spinned_point.z * 0.7);\r\n    vec4 factor_point = spinned_point * vec4(factor, factor, 1, 1);\r\n    \r\n    v_normal = (vec4(0, 0, 1, 1) * rotation_matrix).xyz;\r\n    v_tangent = (vec4(0, 1, 0, 1) * rotation_matrix).xyz;\r\n    v_bitangent = (vec4(1, 0, 0, 1) * rotation_matrix).xyz;\r\n    v_position = vec3(spinned_point.xy, 1.0 / spinned_point.z);\r\n    \r\n    v_bump = vec2(rand(a_star + a_orientation), rand(a_star + a_orientation + 18.0));\r\n    \r\n    gl_Position = vec4(factor_point.xy, clamp(factor_point.z, -1.0, 1.0), 1);\r\n}"}