export enum FeatureDisableInTest {
    LOGGING = "LOGGING",
}

/**
 * Check if we are running inside a test, to disable code that must not run on test
 */
export function isInTestRunner(feature: FeatureDisableInTest): boolean {
    if (process.env.NODE_ENV === "production") {
        return false;
    }

    const insideJest = typeof jest !== "undefined";

    // when developing test you can enable any features that you need here
    switch (feature) {
        case FeatureDisableInTest.LOGGING:
            return insideJest;
    }
}
