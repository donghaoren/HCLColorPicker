import * as React from "react";
import * as chroma from "chroma-js";

import { Slider } from "./controls";
import { ProjectionViewWebGL, ProjectionViewChroma, ProjectionViewMode } from "./projection";
import { vector } from "./math";
import * as Hammer from "hammerjs";

export interface ProjectionPickerViewProps {
    width: number;
    height: number;
    mode: ProjectionViewMode;
}

export interface ProjectionPickerViewState {
    eX: [number, number, number];
    eY: [number, number, number];
    center: [number, number, number];
    p1: [number, number];
    p2: [number, number];
}

export class ProjectionPickerView extends React.Component<ProjectionPickerViewProps, ProjectionPickerViewState> {
    constructor(props: ProjectionPickerViewProps) {
        super(props);
        if(props.mode == ProjectionViewMode.HCL) {
            this.state = {
                center: [180, 0, 0],
                eX: [0, 100, 0],
                eY: [0, 0, 100],
                p1: [-0.5, -0.5],
                p2: [+0.5, +0.5]
            };
        } else {
            this.state = {
                center: [50, 0, 0],
                eX: [0, 100, 0],
                eY: [0, 0, 100],
                p1: [-0.5, -0.5],
                p2: [+0.5, +0.5]
            };
        }
    }

    public getPixelX(xy: [number, number]) {
        return (xy[0] + 1) / 2 * this.props.width;
    }

    public getPixelY(xy: [number, number]) {
        return (xy[1] + 1) / 2 * this.props.height;
    }

    public getComponents(xy: [number, number]): [number, number, number] {
        return [
            xy[0] * this.state.eX[0] + xy[1] * this.state.eY[0] + this.state.center[0],
            xy[0] * this.state.eX[1] + xy[1] * this.state.eY[1] + this.state.center[1],
            xy[0] * this.state.eX[2] + xy[1] * this.state.eY[2] + this.state.center[2]
        ];
    }

    public getColor(xy: [number, number]) {
        let components = this.getComponents(xy);
        switch(this.props.mode) {
            case ProjectionViewMode.HCL:
                return chroma.lch(components[2], components[1], components[0]);
            case ProjectionViewMode.LAB:
                return chroma.lab(components[0], components[1], components[2]);
        }
    }

    public colorKnob(xy: [number, number]) {
        let c = this.getColor(xy);
        return (
            <circle
                cx={this.getPixelX(xy)}
                cy={this.getPixelY(xy)}
                r={5}
                style={{
                    fill: c.css(),
                    stroke: (c as any).clipped() ? "red" : "white"
                }}
            />
        );
    }

    public colorKnobSmall(xy: [number, number]) {
        let c = this.getColor(xy);
        return (
            <circle
                cx={this.getPixelX(xy)}
                cy={this.getPixelY(xy)}
                r={3}
                style={{
                    fill: c.css(),
                    stroke: (c as any).clipped() ? "red" : "white"
                }}
            />
        );
    }

    public rotate(angle: number) {
        let { eX, eY, center, p1, p2 } = this.state;
        let cp1 = this.getComponents(p1);
        let cp2 = this.getComponents(p2);
        let dC = vector.sub(center, cp1);
        let direction = vector.normalize(vector.sub(cp2, cp1));
        let eXNew = vector.rotate(eX, direction, angle);
        let eYNew = vector.rotate(eY, direction, angle);
        let dCNew = vector.rotate(dC, direction, angle);
        this.setState({
            eX: eXNew,
            eY: eYNew,
            center: vector.add(cp1, dCNew)
        });
    }

    public render() {
        let p1 = this.state.p1;
        let p2 = this.state.p2;

        let numKnobs = 5;
        let knobSequence: {
            color: any,
            xy: [number, number]
        }[] = [];
        for (let i = 0; i < numKnobs; i++) {
            let t = i / (numKnobs - 1);
            let xy: [number, number] = [
                p1[0] * (1 - t) + p2[0] * t,
                p1[1] * (1 - t) + p2[1] * t
            ];
            knobSequence.push({
                color: this.getColor(xy),
                xy: xy
            });
        }

        return (
            <div className="projection-picker-view">
                <div className="projection-picker-canvas" style={{ width: this.props.width + "px", height: this.props.height + "px" }}>
                    <ProjectionViewWebGL
                        width={this.props.width}
                        height={this.props.height}
                        mode={this.props.mode}
                        center={this.state.center}
                        eX={this.state.eX}
                        eY={this.state.eY}
                    />
                    <svg className="projection-picker-knobs" style={{ width: this.props.width, height: this.props.height }}>
                        {this.colorKnob(p1)}
                        {knobSequence.slice(1, -1).map(({ color, xy }) => {
                            return this.colorKnobSmall(xy);
                        })}
                        {this.colorKnob(p2)}
                        <DragRegion
                            x={0}
                            y={0}
                            width={this.props.width}
                            height={this.props.height}
                            onPan={(dxy) => {
                                this.setState({
                                    p1: [ p1[0] + dxy[0] * 2 / this.props.width, p1[1] + dxy[1] * 2 / this.props.width ],
                                    p2: [ p2[0] + dxy[0] * 2 / this.props.width, p2[1] + dxy[1] * 2 / this.props.width ],
                                    center: this.getComponents([-dxy[0] * 2 / this.props.width, -dxy[1] * 2 / this.props.width])
                                });
                            }}
                        />
                        <rect x={0}
                            y={0}
                            width={10}
                            height={10}
                            style={{ fill: "yellow" }}
                        />
                        <DragRegion
                            x={0}
                            y={0}
                            width={10}
                            height={10}
                            onPan={(dxy) => {
                                this.rotate(dxy[0] / 100);
                            }}
                        />
                        <DragHandle
                            eX={this.state.eX}
                            eY={this.state.eY}
                            center={this.state.center}
                            width={this.props.width}
                            height={this.props.height}
                            mode={this.props.mode}
                            xy={p1}
                            onChange={(xyNew) => {
                                this.setState({
                                    p1: xyNew
                                });
                            }}
                        />
                        <DragHandle
                            eX={this.state.eX}
                            eY={this.state.eY}
                            center={this.state.center}
                            width={this.props.width}
                            height={this.props.height}
                            mode={this.props.mode}
                            xy={p2}
                            onChange={(xyNew) => {
                                this.setState({
                                    p2: xyNew
                                });
                            }}
                        />
                    </svg>
                </div>
                <div className="projection-picker-controls">
                    <table className="projection-picker-colors">
                        {knobSequence.map(({ color, xy }, idx) => {
                            return (
                                <tr key={`c${idx}`}>
                                    <td>
                                        <span className="color" style={{
                                            backgroundColor: color.css(),
                                            borderLeft: color.clipped() ? "2px solid red" : "2px solid transparent"
                                        }}></span>
                                    </td>
                                    <td><span className="text">{color.css()}</span></td>
                                    <td><span className="text">{color.hex()}</span></td>
                                </tr>
                            );
                        })}
                    </table>
                </div>
            </div>
        );
    }
}

export interface DragHandleProps {
    xy: [number, number];
    mode: ProjectionViewMode;
    width: number;
    height: number;
    eX: [number, number, number];
    eY: [number, number, number];
    center: [number, number, number];
    onChange?: (xy: [number, number]) => void;
}

export class DragHandle extends React.Component<DragHandleProps, {}> {
    refs: {
        circle: SVGCircleElement;
    };

    public getPixelX(xy: [number, number]) {
        return (xy[0] + 1) / 2 * this.props.width;
    }

    public getPixelY(xy: [number, number]) {
        return (xy[1] + 1) / 2 * this.props.height;
    }

    public componentDidMount() {
        let hammer = new Hammer(this.refs.circle);
        let pan = new Hammer.Pan();
        hammer.add(pan);

        let xy0: [number, number] = null;

        hammer.on("panstart", (e) => {
            xy0 = [this.props.xy[0], this.props.xy[1]];
        });
        hammer.on("pan", (e) => {
            let xyNew: [number, number] = [
                xy0[0] + e.deltaX / this.props.width * 2,
                xy0[1] + e.deltaY / this.props.height * 2
            ];
            if (this.props.onChange) {
                this.props.onChange(xyNew);
            }
        });
        hammer.on("panend", (e) => {
            xy0 = null;
        });
    }

    public render() {
        let xy = this.props.xy;
        return (
            <circle
                className="drag-handle"
                ref="circle"
                cx={this.getPixelX(xy)}
                cy={this.getPixelY(xy)}
                r={10}
                style={{
                    fill: "transparent",
                    stroke: "transparent"
                }}
            />
        );
    }
}

export interface DragRegionProps {
    x: number;
    y: number;
    width: number;
    height: number;
    onPan?: (dxy: [number, number]) => void;
}

export class DragRegion extends React.Component<DragRegionProps, {}> {
    refs: {
        rect: SVGRectElement;
    };

    public componentDidMount() {
        let hammer = new Hammer(this.refs.rect);
        hammer.add(new Hammer.Pan());
        hammer.add(new Hammer.Rotate());

        let xy0: [number, number] = null;
        hammer.on("panstart", (e) => {
            xy0 = [0, 0];
        });
        hammer.on("pan", (e) => {
            let xyNew: [number, number] = [
                e.deltaX,
                e.deltaY
            ];
            let dxy: [number, number] = [xyNew[0] - xy0[0], xyNew[1] - xy0[1]];
            if (this.props.onPan) {
                this.props.onPan(dxy);
            }
            xy0 = xyNew;
        });
        hammer.on("panend", (e) => {
            xy0 = null;
        });
    }

    public render() {
        return (
            <rect
                className="drag-region"
                ref="rect"
                x={this.props.x}
                y={this.props.y}
                width={this.props.width}
                height={this.props.height}
                style={{
                    fill: "transparent",
                    stroke: "transparent",
                    cursor: "pointer"
                }}
            />
        );
    }
}