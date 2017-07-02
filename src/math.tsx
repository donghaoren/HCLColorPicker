export module vector {
    export type Vector3 = [ number, number, number ];
    export function add(a: Vector3, b: Vector3): Vector3 {
        return [
            a[0] + b[0],
            a[1] + b[1],
            a[2] + b[2]
        ];
    }
    export function sub(a: Vector3, b: Vector3): Vector3 {
        return [
            a[0] - b[0],
            a[1] - b[1],
            a[2] - b[2]
        ];
    }
    export function mul(a: Vector3, b: Vector3): Vector3 {
        return [
            a[0] * b[0],
            a[1] * b[1],
            a[2] * b[2]
        ];
    }
    export function div(a: Vector3, b: Vector3): Vector3 {
        return [
            a[0] / b[0],
            a[1] / b[1],
            a[2] / b[2]
        ];
    }
    export function scale(a: Vector3, b: number): Vector3 {
        return [
            a[0] * b,
            a[1] * b,
            a[2] * b
        ];
    }
    export function dot(a: Vector3, b: Vector3): number {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    }
    export function len2(a: Vector3): number {
        return dot(a, a);
    }
    export function len(a: Vector3): number {
        return Math.sqrt(dot(a, a));
    }
    export function cross(a: Vector3, b: Vector3): Vector3 {
        return [
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0]
        ];
    }
    export function normalize(a: Vector3): Vector3 {
        return scale(a, 1.0 / len(a));
    }
}