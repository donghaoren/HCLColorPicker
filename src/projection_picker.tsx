import * as React from "react";
import * as chroma from "chroma-js";

import { ProjectionViewWebGL, ProjectionViewMode } from "./projection";
import { vector } from "./math";

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
        this.state = {
            center: [180, 70, 50],
            eX: [40, 70, 0],
            eY: [0, 0, 50],
            p1: [-0.5, -0.5],
            p2: [+0.5, +0.5]
        };
    }

    public render() {
        return (
            <div className="projection-picker-view">
                <ProjectionViewWebGL
                    width={this.props.width}
                    height={this.props.height}
                    mode={this.props.mode}
                    center={this.state.center}
                    eX={this.state.eX}
                    eY={this.state.eY}
                />
                <svg className="projection-picker-controls">
                    <circle
                        cx={(this.state.p1[0] + 1) / 2 * this.props.width}
                        cy={(this.state.p1[1] + 1) / 2 * this.props.height}
                        r={10}
                    />
                    <circle
                        cx={(this.state.p2[0] + 1) / 2 * this.props.width}
                        cy={(this.state.p2[1] + 1) / 2 * this.props.height}
                        r={10}
                    />
                </svg>
            </div>
        );
    }
}