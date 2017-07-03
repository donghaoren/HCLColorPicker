import * as React from "react";
import * as chroma from "chroma-js";
import * as Stardust from "stardust-core";
import * as StardustWebGL from "stardust-webgl";

export enum ProjectionViewMode {
    HCL = 1,
    LAB = 2
};

export interface ProjectionViewProps {
    width: number;
    height: number;
    mode: ProjectionViewMode;
    center: [number, number, number];
    eX: [number, number, number];
    eY: [number, number, number];
}

export class ProjectionViewWebGL extends React.Component<ProjectionViewProps, {}> {
    refs: {
        canvas: HTMLCanvasElement;
    };

    public platform: StardustWebGL.WebGLCanvasPlatform2D;

    public marks: Stardust.Mark;

    public componentDidMount() {
        this.platform = new StardustWebGL.WebGLCanvasPlatform2D(this.refs.canvas, this.props.width, this.props.height);

        let colorCode: string;
        if(this.props.mode == ProjectionViewMode.HCL) {
            colorCode = `hcl2rgb(Color(color.x / 180 * PI, color.y / 100, color.z / 100, 1.0))`;
        } else {
            colorCode = `lab2rgb(Color(color.x / 100, color.y / 100, color.z / 100, 1.0))`;
        }
        let spec = Stardust.mark.compile(`
            mark Pixel(
                width: float, height: float,
                center: Vector3,
                eX: Vector3, eY: Vector3,
                x: float, y: float,
                step: float
            ) {
                let color = x * eX + y * eY + center;
                let cc = ${colorCode};
                let na = 1.0;
                let nr = cc.r;
                let ng = cc.g;
                let nb = cc.b;
                if(nr > 1 || nr < 0) {
                    na = 0;
                }
                if(ng > 1 || ng < 0) {
                    na = 0;
                }
                if(nb > 1 || nb < 0) {
                    na = 0;
                }
                let ncolor = Color(nr, ng, nb, na);

                let p = Vector2((x + 1.0) / 2.0 * width, (y + 1.0) / 2.0 * height);
                let shX = Vector2(step * width / 2, 0);
                let shY = Vector2(0, step * height / 2);

                emit [
                    { position: p + shX + shY, color: ncolor },
                    { position: p + shX - shY, color: ncolor },
                    { position: p - shX - shY, color: ncolor },
                    { position: p + shX + shY, color: ncolor },
                    { position: p - shX - shY, color: ncolor },
                    { position: p - shX + shY, color: ncolor }
                ];
            }
        `)["Pixel"];

        let marks = Stardust.mark.create(spec, this.platform);
        marks.attr("width", this.props.width);
        marks.attr("height", this.props.height);
        marks.attr("eX", this.props.eX);
        marks.attr("eY", this.props.eY);
        marks.attr("center", this.props.center);

        let data: { x: number, y: number }[] = [];
        let division = this.props.width;
        for (let tx = 0; tx < division; tx++) {
            for (let ty = 0; ty < division; ty++) {
                data.push({
                    x: (tx + 0.5) / division * 2 - 1,
                    y: (ty + 0.5) / division * 2 - 1
                });
            }
        }

        marks.attr("x", d => d.x);
        marks.attr("y", d => d.y);
        marks.attr("step", 1.0 / division);
        marks.data(data);
        this.marks = marks;

        this.renderWebGL();
    }

    public componentDidUpdate() {
        this.renderWebGL();
    }

    public renderWebGL() {
        let marks = this.marks;
        marks.attr("eX", this.props.eX);
        marks.attr("eY", this.props.eY);
        marks.attr("center", this.props.center);

        let v = 119 / 255.0;
        this.platform.clear([v, v, v, 1]);
        marks.render();
    }

    public render() {
        return (
            <canvas
                ref="canvas"
                className="projection-view"
                width={this.props.width * 2}
                height={this.props.height * 2}
                style={{
                    width: this.props.width + "px",
                    height: this.props.height + "px"
                }}
            />
        );
    }
}

export class ProjectionViewChroma extends React.Component<ProjectionViewProps, {}> {
    refs: {
        canvas: HTMLCanvasElement;
    };

    public componentDidMount() {
        this.renderCanvas();
    }

    public componentDidUpdate() {
        this.renderCanvas();
    }

    public renderCanvas() {
        let canvas = this.refs.canvas;
        let ctx = canvas.getContext("2d");
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let division = 50;
        let step = canvas.width / division;
        for (let tx = 0; tx < division; tx++) {
            for (let ty = 0; ty < division; ty++) {
                let x = (tx + 0.5) / division * 2 - 1;
                let y = (ty + 0.5) / division * 2 - 1;
                let a = this.props.eX[0] * x + this.props.eY[0] * y + this.props.center[0];
                let b = this.props.eX[1] * x + this.props.eY[1] * y + this.props.center[1];
                let c = this.props.eX[2] * x + this.props.eY[2] * y + this.props.center[2];

                let color: any;

                if(this.props.mode == ProjectionViewMode.HCL) {
                    color = chroma.lch(c, b, a);
                }

                if(this.props.mode == ProjectionViewMode.LAB) {
                    color = chroma.lab(a, b, c);
                }

                if (!(color as any).clipped()) {
                    let x1 = (x + 1) / 2 * canvas.width;
                    let y1 = (y + 1) / 2 * canvas.height;
                    ctx.fillStyle = color.css();
                    ctx.fillRect(x1 - step / 2, y1 - step / 2, step, step);
                }
            }
        }
    }

    public render() {
        return (
            <canvas
                ref="canvas"
                className="projection-view"
                width={this.props.width * 2}
                height={this.props.height * 2}
                style={{
                    width: this.props.width + "px",
                    height: this.props.height + "px"
                }}
            />
        );
    }
}