import * as React from "react";
import * as ReactDOM from "react-dom";

import { ProjectionViewWebGL, ProjectionViewChroma, ProjectionViewMode } from "./projection";
import { Slider } from "./controls";
import { ProjectionPickerView } from "./projection_picker";

export class HCLColorPickerMainView extends React.Component<{}, {}> {
    constructor(props: {}) {
        super(props);
        this.state = {
            H: 180
        };
    }

    public render() {
        return (
            <div>
                <div>
                    <ProjectionPickerView
                        width={500}
                        height={500}
                        mode={ProjectionViewMode.HCL}
                    />
                </div>
            </div>
        );
    }
}

ReactDOM.render(<HCLColorPickerMainView />, document.getElementById("container"));
