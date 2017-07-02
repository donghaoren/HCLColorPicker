import * as React from "react";
import * as chroma from "chroma-js";

export interface SliderProps {
    label: string;
    min: number;
    max: number;
    value: number;
    onChange?: (value: number) => void;
}

export class Slider extends React.Component<SliderProps, {}> {
    refs: {
        slider: HTMLInputElement;
    }

    public getPosition(value: number) {
        return 1000 * (value - this.props.min) / (this.props.max - this.props.min);
    }

    public getValue(position: number) {
        return position / 1000 * (this.props.max - this.props.min) + this.props.min;
    }

    public render() {
        return (
            <span className="control-slider">
                <label>{this.props.label}: </label>
                <span>{this.props.min}</span>
                <input
                    ref="slider"
                    type="range"
                    min={0}
                    max={1000}
                    value={this.getPosition(this.props.value).toString()}
                    onChange={() => {
                        let newValue = this.getValue(this.refs.slider.valueAsNumber);
                        if (this.props.onChange) {
                            this.props.onChange(newValue);
                        }
                    }}
                />
                <span>{this.props.max}</span>
                <span>({this.props.value.toFixed(3)})</span>
            </span>
        );
    }
}

export interface HCLSlidersProps {
    H: number;
    C: number;
    L: number;
    onChange?: (H: number, C: number, L: number) => void;
}

export class HCLSliders extends React.Component<HCLSlidersProps, {}> {
    public render() {
        let color = chroma.lch(this.props.L, this.props.C, this.props.H);
        let invalid = (color as any).clipped();
        // let rgb = color.rgb();
        // if (rgb[0] < 0 || rgb[0] > 255 ||
        //     rgb[1] < 0 || rgb[1] > 255 ||
        //     rgb[2] < 0 || rgb[2] > 255) {
        //     invalid = true;
        // }
        return (
            <div>
                <div style={{ backgroundColor: color.css(), width: "100px", height: "100px", border: invalid ? "3px solid red" : "3px solid white" }}></div>
                <div>{color.css()}</div>
                <div>
                    <Slider
                        label="H" min={0} max={360} value={this.props.H}
                        onChange={(nH) => {
                            if (this.props.onChange) {
                                this.props.onChange(nH, this.props.C, this.props.L);
                            }
                        }}
                    />
                </div>
                <div>
                    <Slider
                        label="C" min={0} max={100} value={this.props.C}
                        onChange={(nC) => {
                            if (this.props.onChange) {
                                this.props.onChange(this.props.H, nC, this.props.L);
                            }
                        }}
                    />
                </div>
                <div>
                    <Slider
                        label="L" min={0} max={100} value={this.props.L}
                        onChange={(nL) => {
                            if (this.props.onChange) {
                                this.props.onChange(this.props.H, this.props.C, nL);
                            }
                        }}
                    />
                </div>
            </div>
        );
    }
}