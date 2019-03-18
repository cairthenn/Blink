declare var window: Window;
interface Window {
    process: any;
    require: any;
}

declare module "*.json" {
    const value: any;
    export default value;
}