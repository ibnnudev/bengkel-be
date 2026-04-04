const STACKHOLDER = {
    USER: "USER",
    MECHANIC: "MECHANIC",
    ADMIN: "ADMIN",
    SOS: "SOS",
} as const;

type Stackholder = typeof STACKHOLDER[keyof typeof STACKHOLDER];

export { STACKHOLDER, type Stackholder };