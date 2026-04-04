const ERRORS = {
    ALREADY_PROCESSED: " already processed",
    NOT_FOUND: " not found",
    INVALID_STATUS: "Invalid status provided",
    INVALID_TRANSITION: "Invalid status transition",
    NO_MECHANICS_AVAILABLE: "No mechanics available nearby",
    ALREADY_TAKEN: " already taken",
    ALREADY_REGISTERED: " already registered",
} as const;

type SOSServiceError = typeof ERRORS[keyof typeof ERRORS];

export { ERRORS, type SOSServiceError };
