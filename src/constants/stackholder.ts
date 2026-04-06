const STACKHOLDER = {
    USER: "USER",
    MECHANIC: "MECHANIC",
    ADMIN: "ADMIN",
    SOS: "SOS",
    ASSIGMENT: "ASSIGNMENT",
} as const;

type Stackholder = typeof STACKHOLDER[keyof typeof STACKHOLDER];

export { STACKHOLDER, type Stackholder };