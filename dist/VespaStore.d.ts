export type VespaStoreOptions = {
    vespa: {
        endpoint: string;
        application: string;
    };
    debug: boolean;
};
declare function SenecaVespaStore(this: any, options: VespaStoreOptions): {
    name: string;
};
export default SenecaVespaStore;
