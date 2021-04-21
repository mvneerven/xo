export default ExoChartControls;
declare class ExoChartControls {
    static controls: {
        circularchart: {
            type: typeof ExoCircularChart;
            note: string;
            demo: {
                mode: string;
            };
        };
    };
}
declare const ExoCircularChart_base: typeof import("./ExoBaseControls").ExoDivControl;
declare class ExoCircularChart extends ExoCircularChart_base {
    value: string;
    size: string;
    color: string;
}
