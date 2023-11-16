import React from "react";

export default class DrawingCanvas extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <>
                <canvas id="drawingCanvas"></canvas>
                <div id="toolbar">
                    
                </div>
            </>
        )
    }
}